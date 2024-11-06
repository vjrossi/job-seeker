import React, { useState, useMemo } from 'react';
import { JobApplication } from './JobApplicationTracker';
import { ApplicationStatus, ACTIVE_STATUSES, INACTIVE_STATUSES } from '../constants/ApplicationStatus';
import { getNextStatuses } from '../constants/applicationStatusMachine';
import ProgressModal from './ProgressModal';
import { OverlayTrigger, Tooltip, Offcanvas, Button, Form, Badge } from 'react-bootstrap';
import { FaStar, FaFilter } from 'react-icons/fa';
import './ViewApplications.css';

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
  stalePeriod: number;
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
  onUndo,
  refreshApplications,
  stalePeriod
}) => {
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showActive, setShowActive] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedApplications = useMemo(() => {
    return applications
      .filter((app: JobApplication) => {
        const currentStatus = app.statusHistory[app.statusHistory.length - 1].status;
        const matchesSearch = app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilters.length === 0 || statusFilters.includes(currentStatus);
        const isNotArchived = currentStatus !== ApplicationStatus.Archived;
        const matchesActiveFilter = showActive ? ACTIVE_STATUSES.includes(currentStatus) : INACTIVE_STATUSES.includes(currentStatus);
        return matchesSearch && matchesStatus && isNotArchived && matchesActiveFilter;
      })
      .sort((a: JobApplication, b: JobApplication) => {
        const aDate = new Date(a.statusHistory[0].timestamp);
        const bDate = new Date(b.statusHistory[0].timestamp);
        return bDate.getTime() - aDate.getTime();
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

    filteredAndSortedApplications.forEach((app: JobApplication) => {
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
              : "Archiving is available for applications that are No Response, Withdrawn, Not Accepted, or Offer Declined"}
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

  const clearAllFilters = () => {
    if (onSearchChange) {
      const event = { target: { value: '' } } as React.ChangeEvent<HTMLInputElement>;
      onSearchChange(event);
    }
    
    statusFilters.forEach(status => {
      onStatusFilterChange(status);
    });
  };

  const getFilterIndicator = () => {
    const activeFilters = [];
    if (searchTerm) activeFilters.push('search');
    if (statusFilters.length > 0) activeFilters.push('status');
    
    if (activeFilters.length === 0) return null;
    
    return (
      <small className="text-muted ms-2">
        <span style={{ fontSize: '0.75em' }}>
          {/* Desktop version */}
          <span className="d-none d-lg-inline">
            (filtered)
          </span>
          {/* Mobile version */}
          <span className="d-inline d-lg-none">
            (filtered: 
            <span 
              className="text-primary text-decoration-underline" 
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                clearAllFilters();
              }}
            >
              Clear Filter
            </span>
            )
          </span>
        </span>
      </small>
    );
  };

  const renderApplicationTable = (applications: JobApplication[], isRecent: boolean) => (
    <>
      <h3>
        Last {isRecent ? '30' : '30+'} days
        {getFilterIndicator()}
      </h3>
      <table className="table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Job Title</th>
            <th>Status</th>
            <th>Rating</th>
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
                <td>{currentStatus}</td>
                <td>{renderSmallStarRating(app.rating)}</td>
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


  const renderUndoButton = (app: JobApplication) => (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id={`tooltip-undo-${app.id}`}>
          {app.statusHistory.length <= 1
            ? "Nothing to undo; job hasn't been progressed"
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

  const renderSmallStarRating = (rating: number) => (
    <div className="small-star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className="star"
          color={star <= rating ? "#ffc107" : "#e4e5e9"}
          size={12}
          style={{ marginRight: 2 }}
        />
      ))}
    </div>
  );

  const renderMobileView = (applications: JobApplication[]) => (
    applications.map(app => {
      const currentStatus = app.statusHistory[app.statusHistory.length - 1].status;
      return (
        <div key={app.id} className="mobile-card">
          <div className="mobile-card-header">
            <h4>{app.companyName}</h4>
            {renderSmallStarRating(app.rating)}
          </div>
          <div className="mobile-card-content">
            <div><strong>Job Title:</strong> {app.jobTitle}</div>
            <div><strong>Status:</strong> {currentStatus}</div>
          </div>
          <div className="mobile-card-actions">
            <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(app)}>View</button>
            {!INACTIVE_STATUSES.includes(currentStatus) && (
              <>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleProgressClick(app)}
                  disabled={getNextStatuses(currentStatus).length === 0}
                >
                  Progress
                </button>
                {renderUndoButton(app)}
              </>
            )}
            {renderArchiveButton(app)}
          </div>
        </div>
      );
    })
  );

  const handleAddClick = () => {
    onAddApplication();
  };

  return (
    <div className="view-applications">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Job Applications {isTest && '(Test Mode)'}</h2>
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={handleAddClick}>
            Add New
          </Button>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowFilters(true)}
            className="d-lg-none"
          >
            <FaFilter />
          </Button>
        </div>
      </div>

      {/* Search bar for both mobile and desktop */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search applications..."
          value={searchTerm}
          onChange={onSearchChange}
        />
      </div>

      {/* Desktop Filters */}
      <div className="d-none d-lg-block">
        <div className="mb-3">
          <Form.Check
            type="switch"
            id="desktopActiveSwitch"
            label={showActive ? 'Active Applications' : 'Inactive Applications'}
            checked={showActive}
            onChange={() => setShowActive(!showActive)}
          />
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
      </div>

      {/* Mobile Filter Drawer - without search */}
      <Offcanvas 
        show={showFilters} 
        onHide={() => setShowFilters(false)} 
        placement="bottom" 
        className="filter-drawer"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filters</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="activeSwitch"
              label={showActive ? 'Active Applications' : 'Inactive Applications'}
              checked={showActive}
              onChange={() => setShowActive(!showActive)}
            />
          </Form.Group>

          <div className="filter-chips">
            {(showActive ? ACTIVE_STATUSES : INACTIVE_STATUSES).map(status => (
              <Badge
                key={status}
                bg={statusFilters.includes(status) ? "primary" : "light"}
                text={statusFilters.includes(status) ? "white" : "dark"}
                className="filter-chip"
                onClick={() => onStatusFilterChange(status)}
              >
                {status}
              </Badge>
            ))}
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Desktop Table View */}
      <div className="d-none d-lg-block">
        {renderApplicationTable(recentApplications, true)}
        {olderApplications.length > 0 && renderApplicationTable(olderApplications, false)}
      </div>
      
      {/* Mobile Card View */}
      <div className="d-block d-lg-none">
        <h3>
          Last 30 days
          {getFilterIndicator()}
        </h3>
        {renderMobileView(recentApplications)}
        {olderApplications.length > 0 && (
          <>
            <h3 className="mt-4">
              Last 30+ days
              {getFilterIndicator()}
            </h3>
            {renderMobileView(olderApplications)}
          </>
        )}
      </div>
      
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