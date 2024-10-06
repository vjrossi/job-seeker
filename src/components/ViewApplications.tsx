import React from 'react';
import { JobApplication } from './JobApplicationTracker';
import { APPLICATION_STATUSES } from '../constants/applicationStatuses';

interface ViewApplicationsProps {
  applications: JobApplication[];
  onStatusChange: (id: number, newStatus: string) => void;
  onEdit: (application: JobApplication) => void;
  onAddApplication: () => void;
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilters: string[];
  onStatusFilterChange: (status: string) => void;
  onDelete: (id: number) => void;
}

const ViewApplications: React.FC<ViewApplicationsProps> = ({ 
  applications, 
  onStatusChange, 
  onEdit, 
  onAddApplication,
  searchTerm,
  onSearchChange,
  statusFilters,
  onStatusFilterChange,
  onDelete
}) => {
  return (
    <div>
      <h2>Job Applications</h2>
      <button className="btn btn-primary mb-3" onClick={onAddApplication}>Add New Application</button>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search applications..."
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>
      <div className="mb-3">
        <h5>Filter by Status:</h5>
        <div className="btn-group flex-wrap" role="group">
          {APPLICATION_STATUSES.map(status => (
            <button
              key={status}
              type="button"
              className={`btn btn-outline-primary ${statusFilters.includes(status) ? 'active' : ''}`}
              onClick={() => onStatusFilterChange(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Job Title</th>
            <th>Date Applied</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr key={app.id}>
              <td>{app.companyName}</td>
              <td>{app.jobTitle}</td>
              <td>{app.dateApplied}</td>
              <td>
                <select
                  value={app.status}
                  onChange={(e) => onStatusChange(app.id, e.target.value)}
                  className="form-select"
                >
                  {APPLICATION_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </td>
              <td>
                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(app)}>View</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(app.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewApplications;