import React, { useState, useEffect } from 'react';
import { JobApplication } from './JobApplicationTracker';
import { ApplicationStatus } from '../constants/ApplicationStatus';
import { STANDARD_APPLICATION_METHODS } from '../constants/standardApplicationMethods';
import { FaStar } from 'react-icons/fa';

interface JobApplicationFormProps {
    onSubmit: (application: JobApplication) => void;
    formData: Partial<JobApplication>;
    onFormChange: (formData: Partial<JobApplication>) => void;
    existingApplications: JobApplication[];
    onCancel: () => void;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ onSubmit, formData, onFormChange, onCancel }) => {
    const today = new Date().toISOString().split('T')[0];
    const initialFormData: Partial<JobApplication> = {
        ...formData,
        rating: 0,
        statusHistory: [{ status: ApplicationStatus.Applied, timestamp: today }]
    };


    const [localFormData, setLocalFormData] = useState(initialFormData);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        onFormChange(localFormData);
    }, [localFormData, onFormChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingChange = (rating: number) => {
        setLocalFormData(prev => ({ ...prev, rating }));
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
            <div className="mb-4">
                <label className="form-label">Job Rating</label>
                <div>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                            key={star}
                            className="star"
                            color={star <= (localFormData.rating || 0) ? "#ffc107" : "#e4e5e9"}
                            size={24}
                            style={{ marginRight: 10, cursor: "pointer" }}
                            onClick={() => handleRatingChange(star)}
                        />
                    ))}
                </div>
            </div>
            <button type="submit" className="btn btn-primary me-2">Submit</button>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </form>
    );
};


export default JobApplicationForm;