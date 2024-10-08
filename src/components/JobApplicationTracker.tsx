import React, { useState, useEffect, useCallback, useRef } from 'react';
import JobApplicationForm from './JobApplicationForm';
import ViewApplications from './ViewApplications';
import Dashboard from './Dashboard';

import Notification from './Notification';
import ConfirmationModal from './ConfirmationModal';
import { indexedDBService } from '../services/indexedDBService';
import { devIndexedDBService } from '../services/devIndexedDBService';
import { generateDummyApplications } from '../utils/generateDummyApplications';
import Reports from './Reports';
import ViewEditApplicationForm from './ViewEditApplicationForm';
import InterviewScheduleModal from './InterviewScheduleModal';
import { ApplicationStatus } from '../constants/ApplicationStatus';
import Settings from './Settings';
import { useLocalStorage } from '../hooks/useLocalStorage'
import Tooltip from './Tooltip';
import { statusTransitions, getNextStatuses } from '../constants/applicationStatusMachine';

export interface JobApplication {
    id: number;
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    applicationMethod: string;
    statusHistory: {
        status: ApplicationStatus;
        timestamp: string;
    }[];
    interviewDateTime?: string;
}

interface JobApplicationTrackerProps {
    currentView: 'dashboard' | 'view' | 'reports';
    setIsFormDirty: (isDirty: boolean) => void;
}

const initialFormData: Omit<JobApplication, 'id'> = {
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    applicationMethod: '',
    statusHistory: [{
        status: ApplicationStatus.Applied,
        timestamp: new Date().toISOString()
    }],
    interviewDateTime: undefined
};

const JobApplicationTracker: React.FC<JobApplicationTrackerProps> = ({ currentView, setIsFormDirty }) => {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilters, setStatusFilters] = useState<ApplicationStatus[]>([]);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [pendingApplication, setPendingApplication] = useState<JobApplication | null>(null);
    const [formData, setFormData] = useState<Omit<JobApplication, 'id'>>(initialFormData);
    const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const notificationTimerRef = useRef<number | null>(null);
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [currentApplicationId, setCurrentApplicationId] = useState<number | null>(null);
    const [isDev, setIsDev] = useState(false);
    const [noResponseDays, setNoResponseDays] = useLocalStorage('noResponseDays', 14);
    const [showSettings, setShowSettings] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [currentInterviewStatus, setCurrentInterviewStatus] = useState<ApplicationStatus | null>(null);

    useEffect(() => {
        loadApplications();
    }, []);

    const toggleDevMode = () => {
        setIsDev(prevIsDev => !prevIsDev);
    };

    const loadApplications = useCallback(async () => {
        try {
            let apps = await (isDev ? devIndexedDBService : indexedDBService).getAllApplications();
            if (apps.length === 0 && isDev) {
                apps = generateDummyApplications(10, noResponseDays);
                await Promise.all(apps.map(app => devIndexedDBService.addApplication(app)));
            }
            setApplications(apps);
        } catch (error) {
            console.error('Error loading applications:', error);
            showNotification('Failed to load applications. Please try again.', 'error');
        }
    }, [isDev, noResponseDays]);

    useEffect(() => {
        loadApplications();
    }, [loadApplications]);

    const populateDummyData = async () => {
        try {
            await devIndexedDBService.clearAllApplications();
            const dummyApplications = generateDummyApplications(20, noResponseDays);
            await Promise.all(dummyApplications.map(app => devIndexedDBService.addApplication(app)));
            await loadApplications();
            showNotification('Test data created successfully', 'success');
        } catch (error) {
            console.error('Error creating test data:', error);
            showNotification('Failed to create test data', 'error');
        }
    };

    const filterApplications = useCallback(() => {
        let filtered = applications;

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(app =>
                app.companyName.toLowerCase().includes(lowercasedTerm) ||
                app.jobTitle.toLowerCase().includes(lowercasedTerm)
            );
        }

        if (statusFilters.length > 0) {
            filtered = filtered.filter(app => {
                const currentStatus = app.statusHistory[app.statusHistory.length - 1].status;
                return statusFilters.includes(currentStatus);
            });
        }

        setFilteredApplications(filtered);
    }, [applications, searchTerm, statusFilters]);

    useEffect(() => {
        filterApplications();
    }, [filterApplications]);

    const handleStatusFilterChange = (status: ApplicationStatus) => {
        setStatusFilters(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSubmit = async (newApplication: Omit<JobApplication, 'id'>) => {
        const applicationToAdd = { ...newApplication, id: Date.now() };
        await addApplication(applicationToAdd);
        setFormData(initialFormData);
        setIsFormDirty(false);
        setShowAddForm(false);
    };

    const addApplication = async (application: Omit<JobApplication, 'id' | 'statusHistory'>) => {
        try {
            const newApplication: JobApplication = {
                ...application,
                id: Date.now(),
                statusHistory: [{
                    status: ApplicationStatus.Applied,
                    timestamp: new Date().toISOString()
                }]
            };
            await (isDev ? devIndexedDBService : indexedDBService).addApplication(newApplication);
            setApplications(prev => [...prev, newApplication]);
            setNotification({ message: 'Application added.', type: 'success' });
        } catch (error) {
            console.error('Error adding application:', error);
            setNotification({ message: 'Failed to add application. Please try again.', type: 'error' });
        }
    };

    const handleConfirmSubmit = async () => {
        if (pendingApplication) {
            await addApplication(pendingApplication);
            setPendingApplication(null);
            setFormData(initialFormData);
            setIsFormDirty(false);
        }
        setShowConfirmation(false);
    };

    const handleFormChange = (updatedFormData: Omit<JobApplication, 'id'>) => {
        setFormData(updatedFormData);
        setIsFormDirty(true);
    };

    const handleStatusChange = (id: number, newStatus: ApplicationStatus) => {
        const application = applications.find(app => app.id === id);
        if (application) {
            const currentStatus = application.statusHistory[application.statusHistory.length - 1].status;
            const validNextStatuses = getNextStatuses(currentStatus);

            if (validNextStatuses.includes(newStatus)) {
                if ([ApplicationStatus.InterviewScheduled, ApplicationStatus.SecondRoundScheduled, ApplicationStatus.ThirdRoundScheduled].includes(newStatus)) {
                    setCurrentApplicationId(id);
                    setCurrentInterviewStatus(currentStatus);
                    setShowInterviewModal(true);
                } else {
                    updateApplicationStatus(id, newStatus);
                }
            } else {
                showNotification('Invalid status progression.', 'error');
            }
        }
    };

    const updateApplicationStatus = async (id: number, newStatus: ApplicationStatus, interviewDateTime?: string) => {
        try {
            const updatedApplication = applications.find(app => app.id === id);
            if (updatedApplication) {
                const currentStatus = updatedApplication.statusHistory[updatedApplication.statusHistory.length - 1].status;

                // Check if the new status is a valid progression using the state machine
                const validNextStatuses = getNextStatuses(currentStatus);
                if (!validNextStatuses.includes(newStatus)) {
                    showNotification('Invalid status progression.', 'error');
                    return;
                }

                updatedApplication.statusHistory.push({
                    status: newStatus,
                    timestamp: new Date().toISOString()
                });
                if (interviewDateTime) {
                    updatedApplication.interviewDateTime = interviewDateTime;
                }
                await (isDev ? devIndexedDBService : indexedDBService).updateApplication(updatedApplication);
                setApplications(applications.map(app => app.id === id ? updatedApplication : app));
                showNotification('Application status updated.', 'success');
            }
        } catch (error) {
            console.error('Error updating application status:', error);
            showNotification('Failed to update application status. Please try again.', 'error');
        }
    };

    const handleInterviewSchedule = async (dateTime: string, newStatus: ApplicationStatus) => {
        if (currentApplicationId) {
            await updateApplicationStatus(currentApplicationId, newStatus, dateTime);
            setShowInterviewModal(false);
            setCurrentApplicationId(null);
        }
    };

    const handleEdit = (application: JobApplication) => {
        setEditingApplication(application);
    };

    const handleEditSubmit = async (updatedApplication: JobApplication) => {
        try {
            await (isDev ? devIndexedDBService : indexedDBService).updateApplication(updatedApplication);
            setApplications(applications.map(app => app.id === updatedApplication.id ? updatedApplication : app));
            setNotification({ message: 'Application updated.', type: 'success' });
        } catch (error) {
            console.error('Error updating application:', error);
            setNotification({ message: 'Failed to update application. Please try again.', type: 'error' });
        }
    };

    const handleAddApplication = () => {
        clearNotification();
        setShowAddForm(true);
    };

    const handleAddFormClose = useCallback(() => {
        setShowAddForm(false);
        setFormData(initialFormData);
        setIsFormDirty(false);
    }, [setIsFormDirty]);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            handleAddFormClose();
        }
    }, [handleAddFormClose]);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            handleAddFormClose();
        }
    }, [handleAddFormClose]);

    useEffect(() => {
        if (showAddForm) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showAddForm, handleClickOutside, handleKeyDown]);

    const showNotification = useCallback((message: string, type: 'success' | 'error') => {
        setNotification({ message, type });

        // Clear any existing timer
        if (notificationTimerRef.current) {
            clearTimeout(notificationTimerRef.current);
        }

        // Set a new timer to clear the notification after 5 seconds
        notificationTimerRef.current = window.setTimeout(() => {
            setNotification(null);
        }, 5000);
    }, []);

    const clearNotification = useCallback(() => {
        setNotification(null);
        if (notificationTimerRef.current) {
            clearTimeout(notificationTimerRef.current);
        }
    }, []);

    useEffect(() => {
        return () => {
            if (notificationTimerRef.current) {
                clearTimeout(notificationTimerRef.current);
            }
        };
    }, []);

    const handleViewApplication = (id: number) => {
        const application = applications.find(app => app.id === id);
        if (application) {
            setEditingApplication(application);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const updatedApplication = applications.find(app => app.id === id);
            if (updatedApplication) {
                updatedApplication.statusHistory.push({
                    status: ApplicationStatus.Archived,
                    timestamp: new Date().toISOString()
                });
                await (isDev ? devIndexedDBService : indexedDBService).updateApplication(updatedApplication);
                setApplications(applications.map(app => app.id === id ? updatedApplication : app));
                showNotification('Application archived.', 'success');
            }
        } catch (error) {
            console.error('Error archiving application:', error);
            showNotification('Failed to archive application. Please try again.', 'error');
        }
    };

    useEffect(() => {
        console.log('showInterviewModal changed:', showInterviewModal);
    }, [showInterviewModal]);

    const handleUndo = async (id: number) => {
        if (window.confirm('Are you sure you want to undo the last status change?')) {
            try {
                const application = applications.find(app => app.id === id);
                if (application && application.statusHistory.length > 1) {
                    const updatedStatusHistory = application.statusHistory.slice(0, -1);
                    const updatedApplication = { ...application, statusHistory: updatedStatusHistory };

                    // Clear interview date if undoing from an interview state
                    const lastStatus = updatedStatusHistory[updatedStatusHistory.length - 1].status;
                    if (![ApplicationStatus.InterviewScheduled, ApplicationStatus.SecondRoundScheduled, ApplicationStatus.ThirdRoundScheduled].includes(lastStatus)) {
                        updatedApplication.interviewDateTime = undefined;
                    }

                    await (isDev ? devIndexedDBService : indexedDBService).updateApplication(updatedApplication);
                    setApplications(prevApps => prevApps.map(app => app.id === id ? updatedApplication : app));
                    setFeedbackMessage('Status change undone successfully');
                }
            } catch (error) {
                console.error('Error undoing status change:', error);
                setFeedbackMessage('Failed to undo status change');
            }
        }
    };

    // Clear feedback message after 3 seconds
    useEffect(() => {
        if (feedbackMessage) {
            const timer = setTimeout(() => {
                setFeedbackMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [feedbackMessage]);

    return (
        <div className="mt-4">
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            {currentView === 'dashboard' && (
                <Dashboard
                    applications={applications}
                    onViewApplication={handleViewApplication}
                    onStatusChange={handleStatusChange}
                />
            )}
            {currentView === 'view' && (
                <>
                    <ViewApplications
                        applications={filteredApplications}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEdit}
                        onAddApplication={handleAddApplication}
                        searchTerm={searchTerm}
                        onSearchChange={handleSearchChange}
                        statusFilters={statusFilters}
                        onStatusFilterChange={handleStatusFilterChange}
                        onDelete={handleDelete}
                        isTest={isDev}
                        refreshApplications={loadApplications}
                        onUndo={handleUndo}
                    />
                    {showAddForm && (
                        <div className={`modal-overlay ${showAddForm ? 'show' : ''}`}>
                            <div className="modal-content" ref={modalRef}>
                                <div className="modal-header">
                                    <h2>Add New Application</h2>
                                    <button type="button" className="btn-close" onClick={handleAddFormClose} aria-label="Close"></button>
                                </div>
                                <JobApplicationForm
                                    onSubmit={handleSubmit}
                                    formData={formData}
                                    onFormChange={handleFormChange}
                                    existingApplications={applications}
                                    onCancel={handleAddFormClose}
                                />
                            </div>
                        </div>
                    )}
                </>
            )}
            {currentView === 'reports' && <Reports applications={applications} />}
            {editingApplication && (
                <ViewEditApplicationForm
                    application={editingApplication}
                    onSave={handleEditSubmit}
                    onCancel={() => setEditingApplication(null)}
                    onStatusChange={handleStatusChange}
                />
            )}
            <ConfirmationModal
                show={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={handleConfirmSubmit}
                message="An active application for this company already exists. Do you want to submit another application?"
            />
            {showInterviewModal && (
                <InterviewScheduleModal
                    show={showInterviewModal}
                    onHide={() => setShowInterviewModal(false)}
                    onSchedule={handleInterviewSchedule}
                    currentStatus={currentInterviewStatus || ApplicationStatus.Applied}
                />
            )}
            {isDev && (
                <div className="mb-3">
                    <button className="btn btn-warning me-2" onClick={populateDummyData}>
                        Regenerate Dummy Data
                    </button>
                </div>
            )}
            <div className="form-check form-switch mb-3">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="devModeSwitch"
                    checked={isDev}
                    onChange={toggleDevMode}
                />
                <label className="form-check-label" htmlFor="devModeSwitch">
                    Test Mode
                    <Tooltip text="Test mode uses dummy data for testing purposes. It does not affect your actual job application data." />
                </label>
            </div>
            {showSettings && (
                <Settings
                    noResponseDays={noResponseDays}
                    onNoResponseDaysChange={(days) => {
                        setNoResponseDays(days);
                        setShowSettings(false);
                        showNotification('Settings updated successfully', 'success');
                    }}
                />
            )}
            <button className="btn btn-secondary mt-3" onClick={() => setShowSettings(!showSettings)}>
                {showSettings ? 'Hide Settings' : 'Show Settings'}
            </button>
            {feedbackMessage && (
                <div className="alert alert-info" role="alert">
                    {feedbackMessage}
                </div>
            )}
        </div>
    );
};

export default JobApplicationTracker;