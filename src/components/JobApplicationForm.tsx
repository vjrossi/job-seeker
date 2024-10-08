import React, { useState, useEffect } from 'react';
import { JobApplication } from './JobApplicationTracker';
import { ApplicationStatus, INACTIVE_STATUSES } from '../constants/ApplicationStatus';

interface JobApplicationFormProps {
    onSubmit: (application: Omit<JobApplication, 'id'>) => void;
    formData: Omit<JobApplication, 'id'>;
    onFormChange: (updatedFormData: Omit<JobApplication, 'id'>) => void;
    existingApplications: JobApplication[];
    onCancel: () => void;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ onSubmit, formData, onFormChange, existingApplications, onCancel }) => {
    const today = new Date().toISOString().split('T')[0];
    const initialFormData = {
        ...formData,
        statusHistory: formData.statusHistory || [{ status: 'Applied', timestamp: today }]
    };

    const [localFormData, setLocalFormData] = useState(initialFormData);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [dateWarning, setDateWarning] = useState<string | null>(null);

    useEffect(() => {
        onFormChange(localFormData);
    }, []);

    useEffect(() => {
        // Check for existing applications with the same company name
        const existingApplication = existingApplications.find(
            app => app.companyName.toLowerCase() === localFormData.companyName.toLowerCase() && 
                   !INACTIVE_STATUSES.includes(app.statusHistory[app.statusHistory.length - 1].status)
        );

        if (existingApplication) {
            setDateWarning(`You already have an active application for ${localFormData.companyName}. Do you want to proceed?`);
        } else {
            setDateWarning(null);
        }
    }, [localFormData.companyName, existingApplications]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedFormData = { ...localFormData, [name]: value };
        setLocalFormData(updatedFormData);
        onFormChange(updatedFormData);

        if (name === 'statusHistory') {
            validateDate(value);
        } else {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateDate = (dateString: string) => {
        const selectedDate = new Date(dateString);
        const today = new Date();
        
        selectedDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(today.getDate() + 3);

        setErrors(prev => ({ ...prev, statusHistory: '' }));
        setDateWarning(null);

        if (selectedDate > threeDaysFromNow) {
            setDateWarning("Date cannot be more than 3 days in the future.");
            setErrors(prev => ({ ...prev, statusHistory: "Date cannot be more than 3 days in the future." }));
        } else if (selectedDate < today) {
            setDateWarning("This date is in the past. Please ensure this is correct.");
        } else if (selectedDate.getTime() > today.getTime()) {
            setDateWarning("This date is in the future. Please ensure this is correct.");
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};

        if (!localFormData.companyName.trim()) {
            newErrors.companyName = 'Company name is required';
        }
        if (!localFormData.jobTitle.trim()) {
            newErrors.jobTitle = 'Job title is required';
        }
        if (localFormData.statusHistory.length === 0) {
            newErrors.statusHistory = 'Date applied is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (dateWarning && dateWarning !== "Date cannot be more than 3 days in the future.") {
            if (!window.confirm(dateWarning)) {
                return;
            }
        }

        onSubmit(localFormData);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as ApplicationStatus;
        const updatedStatusHistory = [
            ...formData.statusHistory,
            { status: newStatus, timestamp: new Date().toISOString() }
        ];
        onFormChange({ ...formData, statusHistory: updatedStatusHistory });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="companyName" className="form-label">Company Name</label>
                <input
                    type="text"
                    className={`form-control ${errors.companyName ? 'is-invalid' : ''}`}
                    id="companyName"
                    name="companyName"
                    value={localFormData.companyName}
                    onChange={handleChange}
                    required
                />
                {errors.companyName && <div className="invalid-feedback">{errors.companyName}</div>}
            </div>
            <div className="mb-3">
                <label htmlFor="jobTitle" className="form-label">Job Title</label>
                <input
                    type="text"
                    className={`form-control ${errors.jobTitle ? 'is-invalid' : ''}`}
                    id="jobTitle"
                    name="jobTitle"
                    value={localFormData.jobTitle}
                    onChange={handleChange}
                    required
                />
                {errors.jobTitle && <div className="invalid-feedback">{errors.jobTitle}</div>}
            </div>
            <div className="mb-3">
                <label htmlFor="jobDescription" className="form-label">Job Description</label>
                <textarea
                    className="form-control"
                    id="jobDescription"
                    name="jobDescription"
                    value={localFormData.jobDescription}
                    onChange={handleChange}
                    rows={3}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="applicationMethod" className="form-label">Application Method</label>
                <input
                    type="text"
                    className="form-control"
                    id="applicationMethod"
                    name="applicationMethod"
                    value={localFormData.applicationMethod}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="dateApplied" className="form-label">Date Applied</label>
                <input
                    type="date"
                    className={`form-control ${errors.statusHistory ? 'is-invalid' : ''}`}
                    id="dateApplied"
                    name="dateApplied"
                    value={localFormData.statusHistory[0]?.timestamp.split('T')[0] || ''}
                    onChange={(e) => {
                        const newDate = e.target.value;
                        setLocalFormData(prev => ({
                            ...prev,
                            statusHistory: [{ status: ApplicationStatus.Applied, timestamp: `${newDate}T00:00:00.000Z` }]
                        }));
                    }}
                    max={new Date().toISOString().split('T')[0]}
                />
                {errors.statusHistory && <div className="invalid-feedback">{errors.statusHistory}</div>}
                {dateWarning && <div className="text-warning">{dateWarning}</div>}
            </div>
            <div className="mb-3">
                <label htmlFor="status" className="form-label">Status</label>
                <select
                    id="status"
                    className="form-select"
                    value={formData.statusHistory[formData.statusHistory.length - 1].status}
                    onChange={handleStatusChange}
                >
                    {Object.values(ApplicationStatus).map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
            <button type="button" className="btn btn-secondary ms-2" onClick={onCancel}>Cancel</button>
        </form>
    );
};

export default JobApplicationForm;