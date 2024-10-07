import React, { useState, useMemo } from 'react';
import { JobApplication } from './JobApplicationTracker';
import { getNextStatuses } from '../constants/applicationStatusMachine';
import { APPLICATION_STATUSES, INACTIVE_STATUSES } from '../constants/applicationStatuses';
import ProgressModal from './ProgressModal';

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
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showActive, setShowActive] = useState(true);

  const filteredApplications = useMemo(() => {
    const filtered = applications.filter(app => {
      const matchesSearch = app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(app.status);
      const matchesActiveFilter = showActive ? !INACTIVE_STATUSES.includes(app.status) : INACTIVE_STATUSES.includes(app.status);
      console.log(`App ${app.id}: matchesSearch=${matchesSearch}, matchesStatus=${matchesStatus}, matchesActiveFilter=${matchesActiveFilter}`);
      return matchesSearch && matchesStatus && matchesActiveFilter;
    });
    console.log('Filtered applications:', filtered);
    return filtered;
  }, [applications, searchTerm, statusFilters, showActive]);

  const relevantStatuses = useMemo(() => {
    return APPLICATION_STATUSES.filter(status =>
      showActive ? !INACTIVE_STATUSES.includes(status) : INACTIVE_STATUSES.includes(status)
    );
  }, [showActive]);

  const handleProgressClick = (app: JobApplication) => {
    setSelectedApplication(app);
    setShowProgressModal(true);
  };

  const handleProgressConfirm = (newStatus: string) => {
    if (selectedApplication) {
      onStatusChange(selectedApplication.id, newStatus);
    }
    setShowProgressModal(false);
    setSelectedApplication(null);
  };

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
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="activeSwitch"
            checked={showActive}
            onChange={() => setShowActive(!showActive)}
          />
          <label className="form-check-label" htmlFor="activeSwitch">
            {showActive ? 'Active Applications' : 'Inactive Applications'}
          </label>
        </div>
      </div>
      <div className="mb-3">
        <h5>Filter by Status:</h5>
        <div className="btn-group flex-wrap" role="group">
          {relevantStatuses.map(status => (
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
          {filteredApplications.map(app => (
            <tr key={app.id}>
              <td>{app.companyName}</td>
              <td>{app.jobTitle}</td>
              <td>{app.dateApplied}</td>
              <td>{app.status}</td>
              <td>
                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(app)}>View</button>
                {!INACTIVE_STATUSES.includes(app.status) && (
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleProgressClick(app)}
                    disabled={getNextStatuses(app.status).length === 0}
                  >
                    Progress
                  </button>
                )}
                <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(app.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showProgressModal && selectedApplication && (
        <ProgressModal
          application={selectedApplication}
          onClose={() => setShowProgressModal(false)}
          onConfirm={handleProgressConfirm}
        />
      )}
    </div>
  );
};

export default ViewApplications;