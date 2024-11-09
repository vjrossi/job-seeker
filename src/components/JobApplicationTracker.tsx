import React, { useState, useEffect, useCallback, useRef } from 'react';
import JobApplicationForm from './JobApplicationForm';
import ViewApplications from './ViewApplications';
import Dashboard from './Dashboard';

import Toast from './Toast';
import ConfirmationModal from './ConfirmationModal';
import { indexedDBService } from '../services/indexedDBService';
import { devIndexedDBService } from '../services/devIndexedDBService';
import { generateDummyApplications } from '../utils/generateDummyApplications';
import Reports from './Reports';
import ViewEditApplicationForm from './ViewEditApplicationForm';
import InterviewScheduleModal from './InterviewScheduleModal';
import { ApplicationStatus } from '../constants/ApplicationStatus';
import { getNextStatuses } from '../constants/applicationStatusMachine';
import { Modal } from 'react-bootstrap';
import { STANDARD_APPLICATION_METHODS } from '../constants/standardApplicationMethods';
import { InterviewLocationType } from './InterviewDetailsModal';

export interface JobApplication {
    id: number;
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    applicationMethod: string;
    rating: number;
    statusHistory: {
        status: ApplicationStatus;
        timestamp: string;
        interviewDateTime?: string;
        interviewLocation?: string;
        interviewType?: InterviewLocationType;
    }[];
    interviewDateTime?: string;
    interviewLocation?: string;
}

interface JobApplicationTrackerProps {
    currentView: 'dashboard' | 'view' | 'reports';
    setIsFormDirty: (isDirty: boolean) => void;
    isDev: boolean;
    noResponseDays: number;
    stalePeriod: number;
}

const initialFormData: Omit<JobApplication, 'id'> = {
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    applicationMethod: STANDARD_APPLICATION_METHODS[0],
    rating: 0,
    statusHistory: [{
        status: ApplicationStatus.Applied,
        timestamp: new Date().toISOString()
    }],
    interviewDateTime: undefined,
    interviewLocation: undefined
};

const JobApplicationTracker: React.FC<JobApplicationTrackerProps> = ({ currentView, setIsFormDirty, isDev, noResponseDays, stalePeriod }) => {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilters, setStatusFilters] = useState<ApplicationStatus[]>([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [pendingApplication, setPendingApplication] = useState<JobApplication | null>(null);
    const [formData, setFormData] = useState<Partial<JobApplication>>(initialFormData);
    const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const notificationTimerRef = useRef<number | null>(null);
    const [showInterviewModal, setShowInterviewModal] = useState(false);
    const [currentApplicationId, setCurrentApplicationId] = useState<number | null>(null);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [currentInterviewStatus, setCurrentInterviewStatus] = useState<ApplicationStatus | null>(null);
    const [currentApplication, setCurrentApplication] = useState<JobApplication | null>(null);
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    });
    const [showUndoConfirmation, setShowUndoConfirmation] = useState(false);
    const [pendingUndoId, setPendingUndoId] = useState<number | null>(null);

    const showToast = useCallback((message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type });
    }, []);

    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, show: false }));
    }, []);

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
            showToast('Failed to load applications. Please try again.', 'error');
        }
    }, [isDev, noResponseDays, showToast]);

    useEffect(() => {
        loadApplications();
    }, [loadApplications]);

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
                applicationMethod: application.applicationMethod || STANDARD_APPLICATION_METHODS[0],
                id: Date.now(),
                statusHistory: [{
                    status: ApplicationStatus.Applied,
                    timestamp: new Date().toISOString()
                }]
            };
            await (isDev ? devIndexedDBService : indexedDBService).addApplication(newApplication);
            setApplications(prev => [...prev, newApplication]);
            showToast('Application added', 'success');
        } catch (error) {
            console.error('Error adding application:', error);
            showToast('Failed to add application. Please try again.', 'error');
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

    const handleFormChange = (updatedFormData: Partial<JobApplication>) => {
        setFormData(updatedFormData);
        setIsFormDirty(true);
    };

    const handleStatusChange = (id: number, newStatus: ApplicationStatus, details?: {
        interviewDateTime?: string;
        interviewLocation?: string;
        interviewType?: InterviewLocationType;
    }) => {
        const application = applications.find(app => app.id === id);
        if (application) {
            const currentStatus = application.statusHistory[application.statusHistory.length - 1].status;
            const validNextStatuses = getNextStatuses(currentStatus);

            if (validNextStatuses.includes(newStatus)) {
                if (newStatus === ApplicationStatus.InterviewScheduled && !details) {
                    setCurrentApplicationId(id);
                    setCurrentInterviewStatus(currentStatus);
                    setCurrentApplication(application);
                    setShowInterviewModal(true);
                } else {
                    updateApplicationStatus(id, newStatus, details?.interviewDateTime, details?.interviewLocation);
                }
            } else {
                showToast('Invalid status progression.', 'error');
            }
        }
    };

    const updateApplicationStatus = async (id: number, newStatus: ApplicationStatus, interviewDateTime?: string, interviewLocation?: string) => {
        try {
            const updatedApplication = applications.find(app => app.id === id);
            if (updatedApplication) {
                const currentStatus = updatedApplication.statusHistory[updatedApplication.statusHistory.length - 1].status;

                const validNextStatuses = getNextStatuses(currentStatus);
                if (!validNextStatuses.includes(newStatus)) {
                    showToast('Invalid status progression.', 'error');
                    return;
                }

                updatedApplication.statusHistory.push({
                    status: newStatus,
                    timestamp: new Date().toISOString(),
                    interviewDateTime: newStatus === ApplicationStatus.InterviewScheduled ? interviewDateTime : undefined,
                    interviewLocation: newStatus === ApplicationStatus.InterviewScheduled ? interviewLocation : undefined
                });

                if (newStatus === ApplicationStatus.InterviewScheduled) {
                    updatedApplication.interviewDateTime = interviewDateTime;
                    updatedApplication.interviewLocation = interviewLocation;
                }

                await (isDev ? devIndexedDBService : indexedDBService).updateApplication(updatedApplication);
                setApplications(applications.map(app => app.id === id ? updatedApplication : app));
                showToast('Application status updated.', 'success');
            }
        } catch (error) {
            console.error('Error updating application status:', error);
            showToast('Failed to update application status. Please try again.', 'error');
        }
    };

    const handleInterviewSchedule = async (dateTime: string, newStatus: ApplicationStatus, location: string) => {
        if (currentApplicationId) {
            await updateApplicationStatus(currentApplicationId, newStatus, dateTime, location);
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
            showToast('Application updated.', 'success');
        } catch (error) {
            console.error('Error updating application:', error);
            showToast('Failed to update application. Please try again.', 'error');
        }
    };

    const handleAddApplication = () => {
        clearToast();
        setFormData(initialFormData);
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

    const clearToast = useCallback(() => {
        setToast(prev => ({ ...prev, show: false }));
    }, []);

    useEffect(() => {
        const timerRef = notificationTimerRef.current;
        
        return () => {
            if (timerRef) {
                clearTimeout(timerRef);
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
                showToast('Application archived.', 'success');
            }
        } catch (error) {
            console.error('Error archiving application:', error);
            showToast('Failed to archive application. Please try again.', 'error');
        }
    };

    const handleUndo = async (id: number) => {
        setPendingUndoId(id);
        setShowUndoConfirmation(true);
    };

    const handleUndoConfirm = async () => {
        if (pendingUndoId !== null) {
            try {
                const application = applications.find(app => app.id === pendingUndoId);
                if (application && application.statusHistory.length > 1) {
                    const updatedStatusHistory = application.statusHistory.slice(0, -1);
                    const updatedApplication = { ...application, statusHistory: updatedStatusHistory };

                    const lastStatus = updatedStatusHistory[updatedStatusHistory.length - 1].status;
                    if (lastStatus !== ApplicationStatus.InterviewScheduled) {
                        updatedApplication.interviewDateTime = undefined;
                    }

                    await (isDev ? devIndexedDBService : indexedDBService).updateApplication(updatedApplication);
                    setApplications(prevApps => prevApps.map(app => app.id === pendingUndoId ? updatedApplication : app));
                    showToast('Status change undone successfully', 'success');
                }
            } catch (error) {
                console.error('Error undoing status change:', error);
                showToast('Failed to undo status change', 'error');
            }
        }
        setShowUndoConfirmation(false);
        setPendingUndoId(null);
    };

    useEffect(() => {
        if (feedbackMessage) {
            const timer = setTimeout(() => {
                setFeedbackMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [feedbackMessage]);

    const handleRatingChange = async (applicationId: number, newRating: number) => {
        try {
            const updatedApplication = applications.find(app => app.id === applicationId);
            if (updatedApplication) {
                const applicationWithNewRating = { ...updatedApplication, rating: newRating };
                
                await (isDev ? devIndexedDBService : indexedDBService).updateApplication(applicationWithNewRating);
                
                setApplications(applications.map(app => 
                    app.id === applicationId 
                        ? applicationWithNewRating
                        : app
                ));

                showToast('Rating updated', 'success');
            }
        } catch (error) {
            console.error('Error updating rating:', error);
            showToast('Failed to update rating', 'error');
        }
    };

    const layoutType = 'experimental' as const;

    return (
        <div className="mt-4">
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />
            {currentView === 'dashboard' && (
                <Dashboard
                    applications={applications}
                    onViewApplication={handleViewApplication}
                    onStatusChange={handleStatusChange}
                    stalePeriod={stalePeriod}
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
                        stalePeriod={stalePeriod}
                        onRatingChange={handleRatingChange}
                        layoutType={layoutType}
                    />
                    <Modal
                        show={showAddForm}
                        onHide={handleAddFormClose}
                        backdrop="static"
                        keyboard={false}
                        size="lg"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Add New Application</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <JobApplicationForm
                                onSubmit={handleSubmit}
                                formData={formData}
                                onFormChange={handleFormChange}
                                existingApplications={applications}
                                onCancel={handleAddFormClose}
                            />
                        </Modal.Body>
                    </Modal>
                </>
            )}
            {currentView === 'reports' && <Reports applications={applications} />}
            <Modal
                show={editingApplication !== null}
                onHide={() => setEditingApplication(null)}
                size="lg"
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingApplication?.jobTitle} at {editingApplication?.companyName}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editingApplication && (
                        <ViewEditApplicationForm
                            application={editingApplication}
                            onSave={handleEditSubmit}
                            onCancel={() => setEditingApplication(null)}
                            onStatusChange={handleStatusChange}
                        />
                    )}
                </Modal.Body>
            </Modal>
            <ConfirmationModal
                show={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={handleConfirmSubmit}
                message="An active application for this company already exists. Do you want to submit another application?"
            />
            {showInterviewModal && currentApplication && (
                <InterviewScheduleModal
                    show={showInterviewModal}
                    onHide={() => setShowInterviewModal(false)}
                    onSchedule={handleInterviewSchedule}
                    currentStatus={currentInterviewStatus || ApplicationStatus.Applied}
                    interviewHistory={currentApplication.statusHistory}
                />
            )}
            {feedbackMessage && (
                <div className="alert alert-info" role="alert">
                    {feedbackMessage}
                </div>
            )}
            <ConfirmationModal
                show={showUndoConfirmation}
                onClose={() => setShowUndoConfirmation(false)}
                onConfirm={handleUndoConfirm}
                message="Are you sure you want to undo the last status change?"
            />
        </div>
    );
};

export default JobApplicationTracker;