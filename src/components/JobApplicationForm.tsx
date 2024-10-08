import React, { useState, useEffect } from 'react';
import { JobApplication } from './JobApplicationTracker';
import { ApplicationStatus } from '../constants/ApplicationStatus';
import { STANDARD_APPLICATION_METHODS } from '../constants/standardApplicationMethods';

interface JobApplicationFormProps {
    onSubmit: (application: JobApplication) => void;
    formData: Partial<JobApplication>;
    onFormChange: (formData: Partial<JobApplication>) => void;
    existingApplications: JobApplication[];
    onCancel: () => void;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ onSubmit, formData, onFormChange, existingApplications, onCancel }) => {
    const today = new Date().toISOString().split('T')[0];
    const initialFormData: Partial<JobApplication> = {
        ...formData,
        statusHistory: [{ status: ApplicationStatus.Applied, timestamp: today }]
    };

    const [localFormData, setLocalFormData] = useState(initialFormData);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [dateWarning, setDateWarning] = useState<string | null>(null);

    useEffect(() => {
        onFormChange(localFormData);
    }, [localFormData, onFormChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};

        if (!localFormData.companyName) {
            newErrors.companyName = 'Company name is required';
        }
        if (!localFormData.jobTitle) {
            newErrors.jobTitle = 'Job title is required';
        }
        if (!localFormData.statusHistory?.[0]?.timestamp) {
            newErrors.statusHistory = 'Date applied is required';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onSubmit(localFormData as JobApplication);
        }
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
                    value={localFormData.companyName || ''}
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
                    value={localFormData.jobTitle || ''}
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
                    value={localFormData.jobDescription || ''}
                    onChange={handleChange}
                    rows={3}
                />
            </div>
            <div className="mb-3">
                <label htmlFor="applicationMethod" className="form-label">Application Method</label>
                <select
                    className="form-select mb-2"
                    id="applicationMethod"
                    name="applicationMethod"
                    value={localFormData.applicationMethod || ''}
                    onChange={handleChange}
                >
                    <option value="">Select an application method</option>
                    {STANDARD_APPLICATION_METHODS.map(method => (
                        <option key={method} value={method}>{method}</option>
                    ))}
                </select>
                {localFormData.applicationMethod === 'Other' && (
                    <input
                        type="text"
                        className="form-control"
                        id="customApplicationMethod"
                        name="applicationMethod"
                        value={localFormData.applicationMethod === 'Other' ? '' : localFormData.applicationMethod}
                        onChange={handleChange}
                        placeholder="Enter custom application method"
                    />
                )}
            </div>
            <div className="mb-3">
                <label htmlFor="dateApplied" className="form-label">Date Applied</label>
                <input
                    type="date"
                    className={`form-control ${errors.statusHistory ? 'is-invalid' : ''}`}
                    id="dateApplied"
                    name="dateApplied"
                    value={localFormData.statusHistory?.[0]?.timestamp.split('T')[0] || ''}
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
            <button type="submit" className="btn btn-primary me-2">Submit</button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </form>
    );
};

export default JobApplicationForm;