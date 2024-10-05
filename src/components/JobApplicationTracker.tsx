import React, { useState, useEffect } from 'react';
import JobApplicationForm from './JobApplicationForm';
import ViewApplications from './ViewApplications';
import { indexedDBService } from '../services/indexedDBService';
import Notification from './Notification';
import ConfirmationModal from './ConfirmationModal';

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
            app.status !== 'Rejected' && app.status !== 'Offer Received'
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
            ) : (
                <>
                    <div className="mb-3">
                        <h5>Filter by Status:</h5>
                        {['Applied', 'Interview Scheduled', 'Rejected', 'Offer Received'].map(status => (
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
                    <ViewApplications applications={filteredApplications} />
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