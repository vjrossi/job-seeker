import React from 'react';
import { JobApplication } from './JobApplicationTracker';
import { ApplicationStatus } from '../constants/ApplicationStatus';

interface StaleCardProps {
  applications: JobApplication[];
  onViewApplication: (id: number) => void;
  onStatusChange: (id: number, newStatus: ApplicationStatus) => void;
}

const StaleCard: React.FC<StaleCardProps> = ({ applications, onViewApplication, onStatusChange }) => {
  if (applications.length === 0) return null;

  return (
    <div className="card mb-3">
      <div className="card-header bg-danger text-white">
        <h5 className="mb-0">Stale Applications</h5>
      </div>
      <ul className="list-group list-group-flush">
        {applications.map(app => (
          <li key={app.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>{app.companyName} - {app.jobTitle}</span>
            <div>
              <button 
                className="btn btn-sm btn-outline-primary me-2" 
                onClick={() => onViewApplication(app.id)}
              >
                View
              </button>
              <button 
                className="btn btn-sm btn-outline-success" 
                onClick={() => onStatusChange(app.id, ApplicationStatus.Archived)}
              >
                Archive
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StaleCard;