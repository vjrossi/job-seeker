import React, { useState, useEffect } from 'react';
import { JobApplication } from './JobApplicationTracker';
import { ApplicationStatus } from '../constants/ApplicationStatus';
import { FaStar } from 'react-icons/fa';
import { STANDARD_APPLICATION_METHODS } from '../constants/standardApplicationMethods';

interface ViewEditApplicationFormProps {
  application: JobApplication;
  onSave: (application: JobApplication) => void;
  onCancel: () => void;
  onStatusChange: (id: number, newStatus: ApplicationStatus) => void;
}

const ViewEditApplicationForm: React.FC<ViewEditApplicationFormProps> = ({ 
  application, 
  onSave, 
  onCancel, 
  onStatusChange 
}) => {
  const [formData, setFormData] = useState<JobApplication>({ ...application });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setFormData(application);
  }, [application]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { name: string; value: number } }) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updatedData = { ...prev };
      
      if (name === 'currentStatus') {
        const currentStatus = prev.statusHistory[prev.statusHistory.length - 1].status;
        if (value !== currentStatus) {
          onStatusChange(application.id, value as ApplicationStatus);
          updatedData.statusHistory = [
            ...prev.statusHistory,
            { status: value as ApplicationStatus, timestamp: new Date().toISOString() }
          ];
        }
      } else if (name === 'rating') {
        updatedData.rating = value as number;
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

  const renderField = (label: string, value: string | number, name: keyof JobApplication | 'currentStatus' | 'dateApplied') => (
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
        ) : name === 'applicationMethod' ? (
          <select
            className="form-select"
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
          >
            {STANDARD_APPLICATION_METHODS.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        ) : name === 'rating' ? (
          <div>
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className="star"
                color={star <= (value as number) ? "#ffc107" : "#e4e5e9"}
                size={24}
                style={{ marginRight: 10, cursor: "pointer" }}
                onClick={() => handleChange({ target: { name: 'rating', value: star } })}
              />
            ))}
          </div>
        ) : name === 'dateApplied' ? (
          <input
            type="text"
            className="form-control"
            id={name}
            name={name}
            value={new Date(application.statusHistory[0].timestamp).toLocaleDateString()}
            readOnly
          />
        ) : (
          <input
            type="text"
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
            {value || 'No description provided'}
          </pre>
        ) : name === 'rating' ? (
          <div>
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className="star"
                color={star <= (value as number) ? "#ffc107" : "#e4e5e9"}
                size={24}
                style={{ marginRight: 10 }}
              />
            ))}
          </div>
        ) : name === 'dateApplied' ? (
          <p className="lead bg-light p-2 rounded">
            {new Date(application.statusHistory[0].timestamp).toLocaleDateString()}
          </p>
        ) : name === 'applicationMethod' ? (
          <p className="lead bg-light p-2 rounded">
            {value || 'N/A'}
          </p>
        ) : (
          <p className="lead bg-light p-2 rounded">
            {value}
          </p>
        )
      )}
    </div>
  );

  const currentStatus = formData.statusHistory[formData.statusHistory.length - 1].status;

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h2 className="card-title mb-4">{isEditing ? 'Edit Application' : application.jobTitle}</h2>
        <form onSubmit={handleSubmit}>
          {renderField('Company Name', formData.companyName, 'companyName')}
          {renderField('Job Title', formData.jobTitle, 'jobTitle')}
          {renderField('Job Description', formData.jobDescription, 'jobDescription')}
          {renderField('Application Method', formData.applicationMethod || '', 'applicationMethod')}
          {renderField('Current Status', currentStatus, 'currentStatus')}
          {renderField('Date Applied', '', 'dateApplied')}
          {renderField('Job Rating', formData.rating, 'rating')}
          
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