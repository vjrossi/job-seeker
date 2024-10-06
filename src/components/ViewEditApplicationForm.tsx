import React, { useState, useEffect } from 'react';
import { JobApplication } from './JobApplicationTracker';
import { APPLICATION_STATUSES } from '../constants/applicationStatuses';

interface ViewEditApplicationFormProps {
  application: JobApplication;
  onSubmit: (updatedApplication: JobApplication) => void;
  onCancel: () => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

const ViewEditApplicationForm: React.FC<ViewEditApplicationFormProps> = ({ 
  application, 
  onSubmit, 
  onCancel, 
  isEditing, 
  setIsEditing 
}) => {
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
    setIsEditing(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditing(true);
  };

  const renderViewField = (label: string, value: string) => (
    <div className="mb-3">
      <h6 className="text-muted mb-1">{label}</h6>
      <p className="lead">{value || 'N/A'}</p>
    </div>
  );

  const renderEditField = (label: string, value: string, name: keyof JobApplication) => (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">{label}</label>
      {name === 'status' ? (
        <select
          className="form-select"
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          required
        >
          {APPLICATION_STATUSES.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      ) : name === 'jobDescription' ? (
        <textarea
          className="form-control"
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          rows={3}
        />
      ) : (
        <input
          type={name === 'dateApplied' ? 'date' : 'text'}
          className="form-control"
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          required
        />
      )}
    </div>
  );

  return (
    <div className="container py-4"> {/* Added container with vertical padding */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white py-3">
          <h4 className="mb-0">{formData.jobTitle} at {formData.companyName}</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {isEditing ? (
              <>
                {renderEditField('Company Name', formData.companyName, 'companyName')}
                {renderEditField('Job Title', formData.jobTitle, 'jobTitle')}
                {renderEditField('Job Description', formData.jobDescription, 'jobDescription')}
                {renderEditField('Date Applied', formData.dateApplied, 'dateApplied')}
                {renderEditField('Status', formData.status, 'status')}
                {renderEditField('Application Method', formData.applicationMethod, 'applicationMethod')}
              </>
            ) : (
              <>
                {renderViewField('Company Name', formData.companyName)}
                {renderViewField('Job Title', formData.jobTitle)}
                {renderViewField('Job Description', formData.jobDescription)}
                {renderViewField('Date Applied', formData.dateApplied)}
                {renderViewField('Status', formData.status)}
                {renderViewField('Application Method', formData.applicationMethod)}
              </>
            )}
          </form>
        </div>
        <div className="card-footer">
          {isEditing ? (
            <>
              <button type="submit" className="btn btn-primary me-2" onClick={handleSubmit}>Save Changes</button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel Edit</button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-primary me-2" onClick={handleEditClick}>Edit</button>
              <button type="button" className="btn btn-secondary" onClick={onCancel}>Close</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewEditApplicationForm;