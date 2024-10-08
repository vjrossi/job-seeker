import React, { useState, useMemo } from 'react';
import { JobApplication } from './JobApplicationTracker';
import { ApplicationStatus, INACTIVE_STATUSES, ACTIVE_STATUSES } from '../constants/ApplicationStatus';
import { getNextStatuses } from '../constants/applicationStatusMachine';
import ProgressModal from './ProgressModal';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

interface ViewApplicationsProps {
  applications: JobApplication[];
  onStatusChange: (id: number, newStatus: ApplicationStatus) => void;
  onEdit: (application: JobApplication) => void;
  onAddApplication: () => void;
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilters: ApplicationStatus[];
  onStatusFilterChange: (status: ApplicationStatus) => void;
  onDelete: (id: number) => void;
  isTest: boolean;
  refreshApplications: () => void;
  onUndo: (id: number) => void;
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
  onDelete,
  isTest,
  refreshApplications,
  onUndo
}) => {
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showActive, setShowActive] = useState(true);

  const filteredAndSortedApplications = useMemo(() => {
    return applications
      .filter(app => {
        const currentStatus = app.statusHistory[app.statusHistory.length - 1].status;
        const matchesSearch = app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilters.length === 0 || statusFilters.includes(currentStatus);
        const isNotArchived = currentStatus !== ApplicationStatus.Archived;
        const matchesActiveFilter = showActive ? ACTIVE_STATUSES.includes(currentStatus) : INACTIVE_STATUSES.includes(currentStatus);
        return matchesSearch && matchesStatus && isNotArchived && matchesActiveFilter;
      })
      .sort((a, b) => {
        const aDate = new Date(a.statusHistory[0].timestamp);
        const bDate = new Date(b.statusHistory[0].timestamp);
        return bDate.getTime() - aDate.getTime(); // Sort in descending order
      });
  }, [applications, searchTerm, statusFilters, showActive]);

  const oneMonthAgo = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  }, []);

  const { recentApplications, olderApplications } = useMemo(() => {
    const recent: JobApplication[] = [];
    const older: JobApplication[] = [];

    filteredAndSortedApplications.forEach(app => {
      const appliedDate = new Date(app.statusHistory[0].timestamp);
      if (appliedDate >= oneMonthAgo) {
        recent.push(app);
      } else {
        older.push(app);
      }
    });

    return { recentApplications: recent, olderApplications: older };
  }, [filteredAndSortedApplications, oneMonthAgo]);

  const canBeArchived = (status: ApplicationStatus): boolean => {
    return [
      ApplicationStatus.NoResponse,
      ApplicationStatus.Withdrawn,
      ApplicationStatus.NotAccepted,
      ApplicationStatus.OfferDeclined
    ].includes(status);
  };

  const renderArchiveButton = (app: JobApplication) => {
    const currentStatus = app.statusHistory[app.statusHistory.length - 1].status;
    const isArchivable = canBeArchived(currentStatus);

    return (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={`tooltip-archive-${app.id}`}>
            {isArchivable
              ? "Archive this application"
              : "This application cannot be archived in its current status"}
          </Tooltip>
        }
      >
        <span className="d-inline-block">
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDelete(app.id)}
            disabled={!isArchivable}
          >
            Archive
          </button>
        </span>
      </OverlayTrigger>
    );
  };

  const renderApplicationTable = (applications: JobApplication[], title: string) => (
    <>
      <h3>{title}</h3>
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
          {applications.map(app => {
            const currentStatus = app.statusHistory[app.statusHistory.length - 1].status;
            return (
              <tr key={app.id}>
                <td>{app.companyName}</td>
                <td>{app.jobTitle}</td>
                <td>{formatDate(app.statusHistory[0].timestamp)}</td>
                <td>{currentStatus}</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(app)}>View</button>
                  {!INACTIVE_STATUSES.includes(currentStatus) && (
                    <>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleProgressClick(app)}
                        disabled={getNextStatuses(currentStatus).length === 0}
                      >
                        Progress
                      </button>
                      {renderUndoButton(app)}
                    </>
                  )}
                  {renderArchiveButton(app)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );

  const handleProgressClick = (app: JobApplication) => {
    setSelectedApplication(app);
    setShowProgressModal(true);
  };

  const handleProgressConfirm = (newStatus: string) => {
    if (selectedApplication) {
      onStatusChange(selectedApplication.id, newStatus as ApplicationStatus);
    }
    setShowProgressModal(false);
    setSelectedApplication(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${day}-${month}-${year}`;
  };

  const renderUndoButton = (app: JobApplication) => (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id={`tooltip-undo-${app.id}`}>
          {app.statusHistory.length <= 1
            ? "Can't undo the initial status"
            : "Undo the last status change"}
        </Tooltip>
      }
    >
      <span className="d-inline-block">
        <button
          className="btn btn-sm btn-outline-secondary me-2"
          onClick={() => onUndo(app.id)}
          disabled={app.statusHistory.length <= 1}
        >
          Undo
        </button>
      </span>
    </OverlayTrigger>
  );

  return (
    <div>
      <h2>Job Applications {isTest && '(Test Mode)'}</h2>
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
          {(showActive ? ACTIVE_STATUSES : INACTIVE_STATUSES).map(status => (
            <button
              key={status}
              className={`btn btn-sm me-2 ${statusFilters.includes(status) ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => onStatusFilterChange(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>
      {renderApplicationTable(recentApplications, "Recent Applications (Last 30 Days)")}
      {olderApplications.length > 0 && (
        renderApplicationTable(olderApplications, "Older Applications")
      )}
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