import React, { useState, useEffect } from 'react';
import { JobApplication } from '../types/JobApplication';
import { ApplicationStatus } from '../constants/ApplicationStatus';
import { FaStar } from 'react-icons/fa';
import { STANDARD_APPLICATION_METHODS } from '../constants/standardApplicationMethods';

interface ViewEditApplicationFormProps {
  application: JobApplication;
  onSave: (application: JobApplication) => void;
  onCancel: () => void;
  onStatusChange: (id: number, newStatus: ApplicationStatus) => void;
  initialEditMode?: boolean;
}

const ViewEditApplicationForm: React.FC<ViewEditApplicationFormProps> = ({ 
  application, 
  onSave, 
  onCancel, 
  onStatusChange,
  initialEditMode = false
}) => {
  const [formData, setFormData] = useState<JobApplication>({ ...application });
  const [isEditing, setIsEditing] = useState(initialEditMode);

  useEffect(() => {
    setFormData(application);
    setIsEditing(initialEditMode);
  }, [application, initialEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { name: string; value: number } }) => {
    const { name, value } = e.target;
    
    if (name === 'rating') {
      setFormData(prev => ({ ...prev, rating: value as number }));
    } else if (name in formData) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.jobUrl && !formData.jobUrl.match(/^https?:\/\/.+/)) {
      alert('Job URL must start with http:// or https://');
      return;
    }
    
    onSave(formData);
    setIsEditing(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEditing(true);
  };

  const currentStatus = formData.statusHistory[formData.statusHistory.length - 1].status;

  const renderField = (label: string, value: string | number, name: keyof JobApplication | 'currentStatus' | 'dateApplied') => (
    <div className="mb-3">
      <h6 className="text-muted mb-1">{label}</h6>
      {isEditing ? (
        name === 'jobDescription' ? (
          <textarea
            className="form-control form-control-sm small"
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            rows={13}
          />
        ) : name === 'currentStatus' ? (
          <p className="bg-light p-2 rounded small">
            {currentStatus}
          </p>
        ) : name === 'applicationMethod' ? (
          <select
            className="form-select form-select-sm small"
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
                size={20}
                style={{ marginRight: 8, cursor: "pointer" }}
                onClick={() => handleChange({ target: { name: 'rating', value: star } })}
              />
            ))}
          </div>
        ) : name === 'dateApplied' ? (
          <input
            type="text"
            className="form-control form-control-sm small"
            id={name}
            name={name}
            value={new Date(application.statusHistory[0].timestamp).toLocaleDateString()}
            readOnly
          />
        ) : name === 'jobUrl' ? (
          <input
            type="url"
            className="form-control form-control-sm small"
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            placeholder="https://"
            pattern="https?://.+"
          />
        ) : (
          <input
            type="text"
            className="form-control form-control-sm small"
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
          />
        )
      ) : (
        name === 'jobDescription' ? (
          <pre className="bg-light p-2 rounded small" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
            {value || 'No description provided'}
          </pre>
        ) : name === 'rating' ? (
          <div>
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className="star"
                color={star <= (value as number) ? "#ffc107" : "#e4e5e9"}
                size={20}
                style={{ marginRight: 8 }}
              />
            ))}
          </div>
        ) : name === 'dateApplied' ? (
          <p className="bg-light p-2 rounded small">
            {new Date(application.statusHistory[0].timestamp).toLocaleDateString()}
          </p>
        ) : name === 'applicationMethod' ? (
          <p className="bg-light p-2 rounded small">
            {value || 'N/A'}
          </p>
        ) : name === 'jobUrl' && value ? (
          <p className="bg-light p-2 rounded small">
            <a href={value as string} target="_blank" rel="noopener noreferrer">
              {value}
            </a>
          </p>
        ) : (
          <p className="bg-light p-2 rounded small">
            {value}
          </p>
        )
      )}
    </div>
  );

  return (
    <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      <div className="p-3">
        <form onSubmit={handleSubmit}>
          {renderField('Job Title', formData.jobTitle, 'jobTitle')}
          {renderField('Job URL', formData.jobUrl || '', 'jobUrl')}
          {renderField('Job Description', formData.jobDescription, 'jobDescription')}
          {renderField('Application Method', formData.applicationMethod || '', 'applicationMethod')}
          {renderField('Current Status', currentStatus, 'currentStatus')}
          {renderField('Date Applied', '', 'dateApplied')}
          {renderField('Job Rating', formData.rating, 'rating')}
          
          <div className="sticky-bottom bg-white border-top" style={{ bottom: 0, zIndex: 1 }}>
            <div className="py-2">
              {isEditing ? (
                <button type="submit" className="btn btn-sm btn-primary me-2">Save</button>
              ) : (
                <button type="button" className="btn btn-sm btn-primary me-2" onClick={handleEditClick}>Edit</button>
              )}
              <button type="button" className="btn btn-sm btn-secondary" onClick={onCancel}>Close</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ViewEditApplicationForm;