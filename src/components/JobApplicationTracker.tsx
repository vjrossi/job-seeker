import React, { useState, useEffect, useCallback, useRef } from 'react';
import JobApplicationForm from './JobApplicationForm';
import ViewApplications from './ViewApplications';
import Dashboard from './Dashboard';

import Notification from './Notification';
import ConfirmationModal from './ConfirmationModal';
import { indexedDBService } from '../services/indexedDBService';
import { APPLICATION_STATUSES } from '../constants/applicationStatuses';
import Reports from './Reports';
import ViewEditApplicationForm from './ViewEditApplicationForm';
import InterviewScheduleModal from './InterviewScheduleModal';

export interface JobApplication {
    id: number;
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    applicationMethod: string;
    statusHistory: {
        status: string;
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
        status: APPLICATION_STATUSES[0],
        timestamp: new Date().toISOString()
    }],
    interviewDateTime: undefined
};


const JobApplicationTracker: React.FC<JobApplicationTrackerProps> = ({ currentView, setIsFormDirty }) => {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilters, setStatusFilters] = useState<string[]>([]);
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

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            const loadedApplications = await indexedDBService.getAllApplications();
            setApplications(loadedApplications);
        } catch (error) {
            console.error('Error loading applications:', error);
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

    const handleStatusFilterChange = (status: string) => {
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
        const applicationToAdd = { ...newApplication, id: Date.now(), status: APPLICATION_STATUSES[0] };
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
                    status: 'Applied',
                    timestamp: new Date().toISOString()
                }]
            };
            await indexedDBService.addApplication(newApplication);
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

    const handleStatusChange = async (id: number, newStatus: string) => {
        console.log(`handleStatusChange called: id = ${id}, newStatus = ${newStatus}`);
        if (APPLICATION_STATUSES.includes(newStatus)) {
            if (newStatus === 'Interview Scheduled') {
                console.log('Setting currentApplicationId and showInterviewModal');
                setCurrentApplicationId(id);
                setShowInterviewModal(true);
            } else {
                await updateApplicationStatus(id, newStatus);
            }
        } else {
            console.error(`Invalid status: ${newStatus}`);
        }
    };

    const updateApplicationStatus = async (id: number, newStatus: string, interviewDateTime?: string) => {
        if (!APPLICATION_STATUSES.includes(newStatus)) {
            console.error(`Invalid status: ${newStatus}`);
            showNotification('Invalid application status.', 'error');
            return;
        }
        try {
            const updatedApplication = applications.find(app => app.id === id);
            if (updatedApplication) {
                updatedApplication.statusHistory.push({
                    status: newStatus,
                    timestamp: new Date().toISOString()
                });
                if (interviewDateTime) {
                    updatedApplication.interviewDateTime = interviewDateTime;
                }
                await indexedDBService.updateApplication(updatedApplication);
                setApplications(applications.map(app => app.id === id ? updatedApplication : app));
                showNotification('Application status updated.', 'success');
            }
        } catch (error) {
            console.error('Error updating application status:', error);
            showNotification('Failed to update application status. Please try again.', 'error');
        }
    };

    const handleInterviewSchedule = async (dateTime: string) => {
        if (currentApplicationId) {
            await updateApplicationStatus(currentApplicationId, 'Interview Scheduled', dateTime);
            setShowInterviewModal(false);
            setCurrentApplicationId(null);
        }
    };

    const handleEdit = (application: JobApplication) => {
        setEditingApplication(application);
    };

    const handleEditSubmit = async (updatedApplication: JobApplication) => {
        try {
            await indexedDBService.updateApplication(updatedApplication);
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
                    status: 'Archived',
                    timestamp: new Date().toISOString()
                });
                await indexedDBService.updateApplication(updatedApplication);
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
            <InterviewScheduleModal
                show={showInterviewModal}
                onHide={() => setShowInterviewModal(false)}
                onSchedule={handleInterviewSchedule}
            />
        </div>
    );
};


export default JobApplicationTracker;