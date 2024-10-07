import React, { useMemo, useState } from 'react';
import { JobApplication } from './JobApplicationTracker';
import ProgressModal from './ProgressModal';
import { useProgressModal } from '../hooks/useProgressModal'; // Import the new hook
import { getNextStatuses } from '../constants/applicationStatusMachine';
import { APPLICATION_STATUSES, INACTIVE_STATUSES, ACTIVE_STATUSES } from '../constants/applicationStatuses';

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
  const [showActive, setShowActive] = useState(true);

  // Use the new custom hook
  const {
    showProgressModal,
    selectedApplication,
    handleProgressClick,
    handleClose,
    handleConfirm
  } = useProgressModal(onStatusChange);

  const filteredApplications = useMemo(() => {
    return applications?.filter(app => {
      if (app && app.statusHistory && app.statusHistory.length > 0) {
        const currentStatus = app.statusHistory[app.statusHistory.length - 1].status;
        const matchesSearch = app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilters.length === 0 || statusFilters.includes(currentStatus);
        const matchesActiveFilter = showActive ? ACTIVE_STATUSES.includes(currentStatus) : INACTIVE_STATUSES.includes(currentStatus);
        return matchesSearch && matchesStatus && matchesActiveFilter;
      }
      return false;
    }) || [];
  }, [applications, searchTerm, statusFilters, showActive]);

  const relevantStatuses = useMemo(() => {
    return APPLICATION_STATUSES.filter(status =>
      showActive ? !INACTIVE_STATUSES.includes(status) : INACTIVE_STATUSES.includes(status)
    );
  }, [showActive]);

  return (
    <div className="view-applications">
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
          {filteredApplications.map(app => {
            const currentStatus = app.statusHistory[app.statusHistory.length - 1].status;
            return (
              <tr key={app.id}>
                <td>{app.companyName}</td>
                <td>{app.jobTitle}</td>
                <td>{new Date(app.statusHistory[0].timestamp).toLocaleDateString()}</td>
                <td>{currentStatus}</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(app)}>View</button>
                  {!INACTIVE_STATUSES.includes(currentStatus) && (
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleProgressClick(app)}
                      disabled={getNextStatuses(currentStatus).length === 0}
                    >
                      Progress
                    </button>
                  )}
                  <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(app.id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {showProgressModal && selectedApplication && (
        <ProgressModal
          application={selectedApplication}
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
};

export default ViewApplications;