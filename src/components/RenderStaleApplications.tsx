import React from 'react';
import { JobApplication } from './JobApplicationTracker';

interface RenderStaleApplicationsProps {
  staleApplications: JobApplication[];
  onEdit: (application: JobApplication) => void;
  stalePeriod: number;
}

const RenderStaleApplications: React.FC<RenderStaleApplicationsProps> = ({ staleApplications, onEdit, stalePeriod }) => {
  if (staleApplications.length === 0) return null;

  return (
    <div className="card mb-3">
      <div className="card-header bg-warning text-white">
        <h5 className="mb-0">Stale Applications</h5>
      </div>
      <div className="card-body">
        <p>The following applications have not been updated in {stalePeriod} days:</p>
        <ul className="list-group">
          {staleApplications.map(app => (
            <li key={app.id} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{app.companyName} - {app.jobTitle}</span>
              <button className="btn btn-sm btn-primary" onClick={() => onEdit(app)}>Update</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RenderStaleApplications;