import React, { useState, useEffect } from 'react';
import { JobApplication } from './JobApplicationTracker';
import { APPLICATION_STATUSES } from '../constants/applicationStatuses';

interface EditApplicationFormProps {
  application: JobApplication;
  onSubmit: (updatedApplication: JobApplication) => void;
  onCancel: () => void;
}

const EditApplicationForm: React.FC<EditApplicationFormProps> = ({ application, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<JobApplication>(application);

  useEffect(() => {
    setFormData(application);
  }, [application]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
          required
        />
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
      <button type="submit" className="btn btn-primary me-2">Update Application</button>
      <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
    </form>
  );
};

export default EditApplicationForm;