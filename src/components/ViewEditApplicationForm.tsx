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

  const renderField = (label: string, value: string, name: keyof JobApplication | 'currentStatus' | 'dateApplied') => (
    <div className="mb-4">
      <h6 className="text-muted mb-2">{label}</h6>
      {isEditing ? (
        name === 'jobDescription' ? (
          <textarea
            className="form-control"
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            rows={5}
          />
        ) : name === 'currentStatus' ? (
          <select
            className="form-select"
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
          >
            {Object.values(ApplicationStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        ) : (
          <input
            type={name === 'dateApplied' ? 'date' : 'text'}
            className="form-control"
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
          />
        )
      ) : (
        name === 'jobDescription' ? (
          <pre className="lead bg-light p-2 rounded" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
            {value || 'N/A'}
          </pre>
        ) : (
          <p className="lead bg-light p-2 rounded">{value || 'N/A'}</p>
        )
      )}
    </div>
  );

  const currentStatus = formData.statusHistory[formData.statusHistory.length - 1].status;
  const dateApplied = new Date(formData.statusHistory[0].timestamp).toISOString().split('T')[0];

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h2 className="card-title mb-4">{isEditing ? 'Edit Application' : application.jobTitle}</h2>
        <form onSubmit={handleSubmit}>
          {renderField('Company Name', formData.companyName, 'companyName')}
          {renderField('Job Title', formData.jobTitle, 'jobTitle')}
          {renderField('Job Description', formData.jobDescription, 'jobDescription')}
          {renderField('Application Method', formData.applicationMethod, 'applicationMethod')}
          {renderField('Current Status', currentStatus, 'currentStatus')}
          {renderField('Date Applied', new Date(formData.statusHistory[0].timestamp).toLocaleDateString(), 'dateApplied')}
          
          <div className="mt-4">
            {isEditing ? (
              <button type="submit" className="btn btn-primary me-2">Save</button>
            ) : (
              <button type="button" className="btn btn-primary me-2" onClick={handleEditClick}>Edit</button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Close</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ViewEditApplicationForm;