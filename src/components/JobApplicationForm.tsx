import React, { useState, useEffect, useRef } from 'react';
import { JobApplication } from '../types/JobApplication';
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
    const today = new Date().toISOString();
    const initialFormData: Partial<JobApplication> = {
        ...formData,
        rating: 0,
        statusHistory: [{ status: ApplicationStatus.Bookmarked, timestamp: today }]
    };

    const [localFormData, setLocalFormData] = useState(initialFormData);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const companyNameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        onFormChange(localFormData);
    }, [localFormData, onFormChange]);

    useEffect(() => {
        if (companyNameInputRef.current) {
            companyNameInputRef.current.focus();
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'initialStatus') {
            setLocalFormData(prev => ({
                ...prev,
                statusHistory: [{ 
                    status: value as ApplicationStatus, 
                    timestamp: today 
                }]
            }));
        } else {
            setLocalFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleRatingChange = (rating: number) => {
        setLocalFormData((prev: Partial<JobApplication>) => ({ ...prev, rating }));
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
        
        if (localFormData.jobUrl && !localFormData.jobUrl.match(/^https?:\/\/.+/)) {
            newErrors.jobUrl = 'URL must start with http:// or https://';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            console.log('Form submitting with data:', localFormData);
            onSubmit(localFormData as JobApplication);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="initialStatus" className="form-label">Initial Status</label>
                <select
                    className="form-control"
                    id="initialStatus"
                    name="initialStatus"
                    value={localFormData.statusHistory?.[0]?.status || ApplicationStatus.Bookmarked}
                    onChange={handleChange}
                >
                    <option value={ApplicationStatus.Bookmarked}>Bookmarked</option>
                    <option value={ApplicationStatus.Applied}>Applied</option>
                </select>
            </div>
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
                    ref={companyNameInputRef}
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
                <label htmlFor="jobUrl" className="form-label">
                    Job URL
                    <span className="ms-2 text-muted small">(optional)</span>
                </label>
                <input
                    type="url"
                    className={`form-control ${errors.jobUrl ? 'is-invalid' : ''}`}
                    id="jobUrl"
                    name="jobUrl"
                    value={localFormData.jobUrl || ''}
                    onChange={handleChange}
                    placeholder="https://"
                    pattern="https?://.+"
                />
                {errors.jobUrl && <div className="invalid-feedback">{errors.jobUrl}</div>}
            </div>
            <div className="mb-3">
                <label htmlFor="jobDescription" className="form-label">
                    Job Description 
                    <span className="ms-2 text-muted small">(or copy & paste from job post)</span>
                </label>
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
                    className="form-control"
                    id="applicationMethod"
                    name="applicationMethod"
                    value={localFormData.applicationMethod || ''}
                    onChange={handleChange}
                >
                    {STANDARD_APPLICATION_METHODS.map((method) => (
                        <option key={method} value={method}>{method}</option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="form-label" htmlFor="jobRating">Job Rating</label>
                <div id="jobRating" aria-label="Job Rating">
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
            <div className="mt-4">
                <button type="submit" className="btn btn-primary me-2">Submit</button>
                <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
};

export default JobApplicationForm;