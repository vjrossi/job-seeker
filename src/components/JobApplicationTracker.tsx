import React, { useState, useEffect } from 'react';
import JobApplicationForm from './JobApplicationForm';
import ViewApplications from './ViewApplications';
import Notification from './Notification';
import ConfirmationModal from './ConfirmationModal';
import { indexedDBService } from '../services/indexedDBService';
import EditApplicationForm from './EditApplicationForm';
import { APPLICATION_STATUSES } from '../constants/applicationStatuses';

export interface JobApplication {
    id: number;
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    dateApplied: string;
    status: string;
    applicationMethod: string;
}

interface JobApplicationTrackerProps {
    currentView: 'add' | 'view';
    setIsFormDirty: (isDirty: boolean) => void;
}

const initialFormData: Omit<JobApplication, 'id'> = {
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    dateApplied: '',
    status: 'Applied',
    applicationMethod: ''
};

const JobApplicationTracker: React.FC<JobApplicationTrackerProps> = ({ currentView, setIsFormDirty }) => {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
    const [statusFilters, setStatusFilters] = useState<string[]>([]);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [pendingApplication, setPendingApplication] = useState<JobApplication | null>(null);
    const [formData, setFormData] = useState<Omit<JobApplication, 'id'>>(initialFormData);
    const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);

    useEffect(() => {
        loadApplications();
    }, []);

    useEffect(() => {
        filterApplications();
    }, [applications, statusFilters]);

    const loadApplications = async () => {
        try {
            const loadedApplications = await indexedDBService.getAllApplications();
            setApplications(loadedApplications);
        } catch (error) {
            console.error('Error loading applications:', error);
        }
    };

    const filterApplications = () => {
        if (statusFilters.length === 0) {
            setFilteredApplications(applications);
        } else {
            setFilteredApplications(applications.filter(app => statusFilters.includes(app.status)));
        }
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilters(prev => 
            prev.includes(status) 
                ? prev.filter(s => s !== status) 
                : [...prev, status]
        );
    };

    const handleSubmit = async (newApplication: Omit<JobApplication, 'id'>) => {
        const existingApplication = applications.find(app =>
            app.companyName.toLowerCase() === newApplication.companyName.toLowerCase() &&
            app.status !== 'Not Accepted' && app.status !== 'No Response' && 
            app.status !== 'Offer Accepted' && app.status !== 'Offer Declined' && 
            app.status !== 'Withdrawn'
        );

        if (existingApplication) {
            setPendingApplication({ ...newApplication, id: Date.now() });
            setShowConfirmation(true);
        } else {
            await addApplication({ ...newApplication, id: Date.now() });
            setFormData(initialFormData);
            setIsFormDirty(false);
        }
    };

    const addApplication = async (application: JobApplication) => {
        try {
            await indexedDBService.addApplication(application);
            setApplications(prev => [...prev, application]);
            setNotification({ message: 'Application added successfully!', type: 'success' });
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
        try {
            const updatedApplication = applications.find(app => app.id === id);
            if (updatedApplication) {
                updatedApplication.status = newStatus;
                await indexedDBService.updateApplication(updatedApplication);
                setApplications(applications.map(app => app.id === id ? updatedApplication : app));
                setNotification({ message: 'Application status updated successfully!', type: 'success' });
            }
        } catch (error) {
            console.error('Error updating application status:', error);
            setNotification({ message: 'Failed to update application status. Please try again.', type: 'error' });
        }
    };

    const statusOptions = [
        'Applied',
        'Interview Scheduled',
        'No Response',
        'Not Accepted',
        'Offer Received',
        'Offer Accepted',
        'Offer Declined',
        'Withdrawn'
    ];

    const handleEdit = (application: JobApplication) => {
        console.log("Editing application:", application);
        setEditingApplication(application);
    };

    const handleEditSubmit = async (updatedApplication: JobApplication) => {
        try {
            await indexedDBService.updateApplication(updatedApplication);
            setApplications(applications.map(app => app.id === updatedApplication.id ? updatedApplication : app));
            setEditingApplication(null);
            setNotification({ message: 'Application updated successfully!', type: 'success' });
        } catch (error) {
            console.error('Error updating application:', error);
            setNotification({ message: 'Failed to update application. Please try again.', type: 'error' });
        }
    };

    const handleEditCancel = () => {
        setEditingApplication(null);
    };

    console.log("Current view:", currentView);
    console.log("Editing application:", editingApplication);

    return (
        <div>
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            {currentView === 'add' ? (
                <JobApplicationForm 
                    onSubmit={handleSubmit} 
                    formData={formData} 
                    onFormChange={handleFormChange}
                    existingApplications={applications}
                />
            ) : editingApplication ? (
                <EditApplicationForm
                    application={editingApplication}
                    onSubmit={handleEditSubmit}
                    onCancel={handleEditCancel}
                />
            ) : (
                <>
                    <div className="mb-3">
                        <h5>Filter by Status:</h5>
                        {APPLICATION_STATUSES.map(status => (
                            <div key={status} className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`status-${status}`}
                                    checked={statusFilters.includes(status)}
                                    onChange={() => handleStatusFilterChange(status)}
                                />
                                <label className="form-check-label" htmlFor={`status-${status}`}>
                                    {status}
                                </label>
                            </div>
                        ))}
                    </div>
                    <ViewApplications 
                        applications={filteredApplications} 
                        onStatusChange={handleStatusChange}
                        onEdit={handleEdit}
                    />
                </>
            )}
            <ConfirmationModal
                show={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={handleConfirmSubmit}
                message="An active application for this company already exists. Do you want to submit another application?"
            />
        </div>
    );
};

export default JobApplicationTracker;