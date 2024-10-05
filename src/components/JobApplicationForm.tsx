import React, { useState } from 'react';
import { JobApplication } from './JobApplicationTracker';
import { APPLICATION_STATUSES } from '../constants/applicationStatuses';

interface JobApplicationFormProps {
    onSubmit: (application: Omit<JobApplication, 'id'>) => void;
    formData: Omit<JobApplication, 'id'>;
    onFormChange: (updatedFormData: Omit<JobApplication, 'id'>) => void;
    existingApplications: JobApplication[];
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({ onSubmit, formData, onFormChange, existingApplications }) => {
    const [companyWarning, setCompanyWarning] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onFormChange({ ...formData, [name]: value });
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.name === 'companyName') {
            const existingApplication = existingApplications.find(app => 
                app.companyName.toLowerCase() === e.target.value.toLowerCase() &&
                app.status !== 'Rejected' && app.status !== 'Offer Received'
            );
            if (existingApplication) {
                setCompanyWarning('An active application for this company already exists.');
            } else {
                setCompanyWarning(null);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            <div className="mb-3">
                <label htmlFor="companyName" className="form-label">Company Name</label>
                <input
                    type="text"
                    className="form-control"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                />
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
                    className="form-control"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="jobDescription" className="form-label">Job Description</label>
                <textarea
                    className="form-control"
                    id="jobDescription"
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={handleChange}
                    rows={3}
                ></textarea>
            </div>
            <div className="mb-3">
                <label htmlFor="dateApplied" className="form-label">Date Applied</label>
                <input
                    type="date"
                    className="form-control"
                    id="dateApplied"
                    name="dateApplied"
                    value={formData.dateApplied}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="mb-3">
                <label htmlFor="status" className="form-label">Status</label>
                <select
                    className="form-select"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                >
                    {APPLICATION_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label htmlFor="applicationMethod" className="form-label">Application Method</label>
                <input
                    type="text"
                    className="form-control"
                    id="applicationMethod"
                    name="applicationMethod"
                    value={formData.applicationMethod}
                    onChange={handleChange}
                    required
                />
            </div>
            <button type="submit" className="btn btn-primary">Submit Application</button>
        </form>
    );
};

export default JobApplicationForm;