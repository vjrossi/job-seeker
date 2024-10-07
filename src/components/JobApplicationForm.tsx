import React, { useState, useEffect } from 'react';
import { JobApplication } from './JobApplicationTracker';
import { APPLICATION_STATUSES, INACTIVE_STATUSES } from '../constants/applicationStatuses';

interface JobApplicationFormProps {
    onSubmit: (application: Omit<JobApplication, 'id'>) => void;
    formData: Omit<JobApplication, 'id'>;
    onFormChange: (updatedFormData: Omit<JobApplication, 'id'>) => void;
    existingApplications: JobApplication[];
    onCancel: () => void;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ onSubmit, formData, onFormChange, existingApplications, onCancel }) => {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [companyWarning, setCompanyWarning] = useState<string | null>(null);
    const [dateWarning, setDateWarning] = useState<string | null>(null);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Use the provided formData or create a new object with today's date
    const initialFormData = {
        ...formData,
        dateApplied: formData.dateApplied || today
    };

    const [localFormData, setLocalFormData] = useState(initialFormData);

    useEffect(() => {
        // Ensure the status is always 'Applied' for new applications
        onFormChange({ ...localFormData, status: 'Applied' });
    }, []);

    useEffect(() => {
        // Check for existing applications with the same company name
        const existingApplication = existingApplications.find(
            app => app.companyName.toLowerCase() === localFormData.companyName.toLowerCase() && !INACTIVE_STATUSES.includes(app.status)
        );

        if (existingApplication) {
            setCompanyWarning(`You already have an active application for ${localFormData.companyName}.`);
        } else {
            setCompanyWarning(null);
        }
    }, [localFormData.companyName, existingApplications]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedFormData = { ...localFormData, [name]: value };
        setLocalFormData(updatedFormData);
        onFormChange(updatedFormData);

        if (name === 'dateApplied') {
            validateDate(value);
        } else {
            // Clear the error for non-date fields being changed
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateDate = (dateString: string) => {
        const selectedDate = new Date(dateString);
        const today = new Date();
        
        // Set both dates to midnight for accurate comparison
        selectedDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        const threeDaysFromNow = new Date(today);
        threeDaysFromNow.setDate(today.getDate() + 3);

        // Reset both error and warning
        setErrors(prev => ({ ...prev, dateApplied: '' }));
        setDateWarning(null);

        if (selectedDate > threeDaysFromNow) {
            setDateWarning("Date cannot be more than 3 days in the future.");
            setErrors(prev => ({ ...prev, dateApplied: "Date cannot be more than 3 days in the future." }));
        } else if (selectedDate < today) {
            setDateWarning("This date is in the past. Please ensure this is correct.");
        } else if (selectedDate.getTime() > today.getTime()) {
            setDateWarning("This date is in the future. Please ensure this is correct.");
        }
        // If the date is today, both dateWarning and errors.dateApplied will remain null/empty
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};

        if (!localFormData.companyName.trim()) {
            newErrors.companyName = 'Company name is required';
        } else {
            // Check for existing active applications
            const existingActiveApplication = existingApplications.find(app => 
                app.companyName.toLowerCase() === localFormData.companyName.toLowerCase() &&
                !INACTIVE_STATUSES.includes(app.status)
            );

            if (existingActiveApplication) {
                setDateWarning(`You already have an active application for ${localFormData.companyName}. Do you want to proceed?`);
            }
        }
        if (!localFormData.jobTitle.trim()) {
            newErrors.jobTitle = 'Job title is required';
        }
        if (!localFormData.dateApplied) {
            newErrors.dateApplied = 'Date applied is required';
        } else {
            const selectedDate = new Date(localFormData.dateApplied);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const threeDaysFromNow = new Date(today);
            threeDaysFromNow.setDate(today.getDate() + 3);

            if (selectedDate > threeDaysFromNow) {
                newErrors.dateApplied = 'Date cannot be more than 3 days in the future';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // If there's a date warning, ask for confirmation
        if (dateWarning) {
            if (!window.confirm(dateWarning)) {
                return;
            }
        }

        onSubmit(localFormData);
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
                {companyWarning && (
                    <div className="alert alert-warning mt-2" role="alert">
                        {companyWarning}
                    </div>
                )}
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
                ></textarea>
            </div>
            <div className="mb-3">
                <label htmlFor="dateApplied" className="form-label">Date Applied</label>
                <input
                    type="date"
                    className={`form-control ${errors.dateApplied ? 'is-invalid' : ''}`}
                    id="dateApplied"
                    name="dateApplied"
                    value={localFormData.dateApplied}
                    onChange={handleChange}
                    required
                />
                {errors.dateApplied && <div className="invalid-feedback">{errors.dateApplied}</div>}
                {dateWarning && !errors.dateApplied && (
                    <div className="alert alert-warning mt-2" role="alert">{dateWarning}</div>
                )}
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
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="status" className="form-label">Status</label>
                <input
                    type="text"
                    className="form-control"
                    id="status"
                    name="status"
                    value={APPLICATION_STATUSES[0]}
                    readOnly
                />
            </div>
            <button type="submit" className="btn btn-primary me-2">Submit</button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </form>
    );
}

export default JobApplicationForm;