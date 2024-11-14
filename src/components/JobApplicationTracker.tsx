import React, { useState, useEffect, useCallback, useRef } from 'react';
import JobApplicationForm from './JobApplicationForm';
import ViewApplications from './ViewApplications';
import Dashboard from './Dashboard';

import Toast from './shared/Toast';
import { indexedDBService } from '../services/indexedDBService';
import { devIndexedDBService } from '../services/devIndexedDBService';
import { generateDummyApplications } from '../utils/generateDummyApplications';
import Reports from './Reports';
import ViewEditApplicationForm from './ViewEditApplicationForm';
import InterviewScheduleModal from './modals/InterviewScheduleModal';
import { ApplicationStatus } from '../constants/ApplicationStatus';
import { getNextStatuses } from '../constants/applicationStatusMachine';
import { Modal } from 'react-bootstrap';
import { STANDARD_APPLICATION_METHODS } from '../constants/standardApplicationMethods';
import { InterviewLocationType } from './modals/InterviewDetailsModal';
import { JobApplication } from '../types/JobApplication';

type EditingApplication = JobApplication & { initialEditMode?: boolean };

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
    jobUrl: '',
    jobDescription: '',
    applicationMethod: STANDARD_APPLICATION_METHODS[0],
    rating: 0,
    statusHistory: [{
        status: ApplicationStatus.Bookmarked,
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
    const [formData, setFormData] = useState<Partial<JobApplication>>(initialFormData);
    const [editingApplication, setEditingApplication] = useState<EditingApplication | null>(null);
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

    const showToast = useCallback((message: string, type: 'success' | 'error') => {
        setToast({ show: true, message, type });
    }, []);

    const hideToast = useCallback(() => {
        setToast(prev => ({ ...prev, show: false }));
    }, []);

    const loadApplications = useCallback(async () => {
        try {
            let apps: JobApplication[] = [];
            
            if (isDev) {
                apps = await devIndexedDBService.getAllApplications();
                
                if (apps.length === 0) {
                    const dummyApps = generateDummyApplications(10);
                    try {
                        await devIndexedDBService.clearAllApplications();
                        for (const app of dummyApps) {
                            await devIndexedDBService.addApplication(app);
                        }
                        apps = await devIndexedDBService.getAllApplications();
                    } catch (error) {
                        console.error('Error adding dummy applications:', error);
                        showToast('Failed to add dummy applications. Please try again.', 'error');
                    }
                }
            } else {
                apps = await indexedDBService.getAllApplications();
            }
            
            setApplications(apps);
        } catch (error) {
            console.error('Error loading applications:', error);
            showToast('Failed to load applications. Please try again.', 'error');
        }
    }, [isDev, showToast]);

    useEffect(() => {
        loadApplications();
    }, [loadApplications, isDev]);

    const filterApplications = useCallback(() => {
        let filtered = applications;

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(app => {
                const searchableFields = [
                    app.companyName,
                    app.jobTitle,
                    app.jobDescription,
                    app.applicationMethod,
                    ...app.statusHistory.map(sh => sh.status),
                    app.interviewDateTime,
                    app.interviewLocation,
                    app.rating?.toString(),
                    ...app.statusHistory
                        .filter(sh => sh.interviewLocation)
                        .map(sh => sh.interviewLocation as string)
                ].filter(Boolean);

                return searchableFields
                    .join(' ')
                    .toLowerCase()
                    .includes(lowercasedTerm);
            });
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
        console.log('Tracker received application:', newApplication);
        try {
            const applicationToAdd = {
                ...newApplication,
                id: Date.now(),
                statusHistory: newApplication.statusHistory || [{
                    status: ApplicationStatus.Bookmarked,
                    timestamp: new Date().toISOString()
                }]
            };
            console.log('Tracker saving application:', applicationToAdd);
            await (isDev ? devIndexedDBService : indexedDBService).addApplication(applicationToAdd);
            setApplications(prev => [...prev, applicationToAdd]);
            setFormData(initialFormData);
            setIsFormDirty(false);
            setShowAddForm(false);
            showToast('Application added', 'success');
        } catch (error) {
            console.error('Error adding application:', error);
            showToast('Failed to add application. Please try again.', 'error');
        }
    };

    const handleFormChange = (updatedFormData: Partial<JobApplication>) => {
        setFormData(updatedFormData);
        setIsFormDirty(true);
    };

    const handleStatusChange = (id: number, newStatus: ApplicationStatus, details?: {
        interviewDateTime?: string;
        interviewLocation?: string;
        interviewType?: InterviewLocationType;
        interviewLink?: string;
        interviewPhone?: string;
        interviewers?: string;
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
                    updateApplicationStatus(id, newStatus, details?.interviewDateTime, details?.interviewLocation, details?.interviewType, details?.interviewLink, details?.interviewPhone, details?.interviewers);
                }
            } else {
                showToast('Invalid status progression.', 'error');
            }
        }
    };

    const updateApplicationStatus = async (id: number, newStatus: ApplicationStatus, 
        interviewDateTime?: string, 
        interviewLocation?: string, 
        interviewType?: InterviewLocationType,
        interviewLink?: string,
        interviewPhone?: string,
        interviewers?: string
    ) => {
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
                    interviewLocation: newStatus === ApplicationStatus.InterviewScheduled ? interviewLocation : undefined,
                    interviewType: newStatus === ApplicationStatus.InterviewScheduled ? interviewType : undefined,
                    interviewLink: newStatus === ApplicationStatus.InterviewScheduled ? interviewLink : undefined,
                    interviewPhone: newStatus === ApplicationStatus.InterviewScheduled ? interviewPhone : undefined,
                    interviewers: newStatus === ApplicationStatus.InterviewScheduled ? interviewers : undefined
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

    const handleEdit = (application: JobApplication, initialEditMode?: boolean) => {
        setEditingApplication({ ...application, initialEditMode });
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
                updatedApplication.archived = !updatedApplication.archived;
                await (isDev ? devIndexedDBService : indexedDBService).updateApplication(updatedApplication);
                setApplications(applications.map(app => app.id === id ? updatedApplication : app));
                showToast(
                    updatedApplication.archived ? 'Application archived.' : 'Application unarchived.',
                    'success'
                );
            }
        } catch (error) {
            console.error('Error toggling archive status:', error);
            showToast('Failed to update application. Please try again.', 'error');
        }
    };

    const handleUndo = async (id: number) => {
        try {
            const application = applications.find(app => app.id === id);
            if (application && application.statusHistory.length > 1) {
                const updatedStatusHistory = application.statusHistory.slice(0, -1);
                const updatedApplication = { ...application, statusHistory: updatedStatusHistory };

                const lastStatus = updatedStatusHistory[updatedStatusHistory.length - 1].status;
                if (lastStatus !== ApplicationStatus.InterviewScheduled) {
                    updatedApplication.interviewDateTime = undefined;
                }

                await (isDev ? devIndexedDBService : indexedDBService).updateApplication(updatedApplication);
                setApplications(prevApps => prevApps.map(app => app.id === id ? updatedApplication : app));
                showToast('Status change undone successfully', 'success');
            }
        } catch (error) {
            console.error('Error undoing status change:', error);
            showToast('Failed to undo status change', 'error');
        }
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

    useEffect(() => {
        setIsFormDirty(false);
        setFormData(initialFormData);
        setShowAddForm(false);
        setEditingApplication(null);
    }, [currentView, setIsFormDirty]);

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
                                setIsFormDirty={setIsFormDirty}
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
                        {editingApplication?.companyName}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editingApplication && (
                        <ViewEditApplicationForm
                            application={editingApplication}
                            onSave={handleEditSubmit}
                            onCancel={() => setEditingApplication(null)}
                            onStatusChange={handleStatusChange}
                            initialEditMode={editingApplication.initialEditMode}
                        />
                    )}
                </Modal.Body>
            </Modal>
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
        </div>
    );
};

export default JobApplicationTracker;