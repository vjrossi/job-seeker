import React, { useState, useEffect } from 'react';
import { JobApplication } from './JobApplicationTracker';
import { ApplicationStatus } from '../constants/ApplicationStatus';

interface ViewEditApplicationFormProps {
  application: JobApplication;
  onSave: (updatedApplication: JobApplication) => void;
  onCancel: () => void;
  onStatusChange: (id: number, newStatus: ApplicationStatus) => void;
}

const ViewEditApplicationForm: React.FC<ViewEditApplicationFormProps> = ({ 
  application, 
  onSave, 
  onCancel, 
  onStatusChange 
}) => {
  const [formData, setFormData] = useState<JobApplication>(application);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setFormData(application);
  }, [application]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`handleChange called in ViewEditApplicationForm: ${name} = ${value}`);
    
    setFormData(prev => {
      const updatedData = { ...prev };
      
      if (name === 'currentStatus') {
        const currentStatus = prev.statusHistory[prev.statusHistory.length - 1].status;
        if (value !== currentStatus) {
          console.log(`Status changed to ${value}, calling onStatusChange`);
          onStatusChange(application.id, value as ApplicationStatus);
          updatedData.statusHistory = [
            ...prev.statusHistory,
            { status: value as ApplicationStatus, timestamp: new Date().toISOString() }
          ];
        }
      } else if (name in updatedData) {
        (updatedData as any)[name] = value;
      }
      
      return updatedData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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

  const renderEditField = (label: string, value: string, name: keyof JobApplication | 'currentStatus' | 'dateApplied') => (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">{label}</label>
      {name === 'currentStatus' ? (
        <select
          className="form-select"
          id={name}
          name={name}
          value={formData.statusHistory[formData.statusHistory.length - 1].status}
          onChange={handleChange}
          required
        >
          {Object.values(ApplicationStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      ) : name === 'jobDescription' ? (
        <textarea
          className="form-control"
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          rows={3}
        />
      ) : name === 'dateApplied' ? (
        <input
          type="date"
          className="form-control"
          id={name}
          name={name}
          value={value}
          onChange={(e) => {
            const newDate = e.target.value;
            setFormData(prev => ({
              ...prev,
              statusHistory: [
                { status: ApplicationStatus.Applied, timestamp: `${newDate}T00:00:00.000Z` },
                ...prev.statusHistory.slice(1)
              ]
            }));
          }}
          required
        />
      ) : (
        <input
          type="text"
          className="form-control"
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          required
        />
      )}
    </div>
  );

  const currentStatus = formData.statusHistory[formData.statusHistory.length - 1].status;
  const dateApplied = new Date(formData.statusHistory[0].timestamp).toISOString().split('T')[0];

  return (
    <div className="container py-4">
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
                {renderEditField('Date Applied', dateApplied, 'dateApplied')}
                {renderEditField('Status', currentStatus, 'currentStatus')}
                {renderEditField('Application Method', formData.applicationMethod, 'applicationMethod')}
              </>
            ) : (
              <>
                {renderViewField('Company Name', formData.companyName)}
                {renderViewField('Job Title', formData.jobTitle)}
                {renderViewField('Job Description', formData.jobDescription)}
                {renderViewField('Date Applied', dateApplied)}
                {renderViewField('Status', currentStatus)}
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