import React, { useState, useMemo } from 'react';
import { JobApplication } from './JobApplicationTracker';
import { ApplicationStatus, APPLICATION_STATUSES } from '../constants/ApplicationStatus';
import { getNextStatuses } from '../constants/applicationStatusMachine';
import ProgressModal from './ProgressModal';
import { OverlayTrigger, Tooltip, Offcanvas, Button, Form, Badge, Modal } from 'react-bootstrap';
import { FaFilter } from 'react-icons/fa';
import './ViewApplications.css';
import { devIndexedDBService } from '../services/devIndexedDBService';
import { indexedDBService } from '../services/indexedDBService';
import Toast from './Toast';
import { METHOD_ICONS } from '../constants/standardApplicationMethods';
import ExperimentalJobCard from './experimental/ExperimentalJobCard';
import StarRating from './shared/StarRating';
import StandardJobCard from './standard/StandardJobCard';

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
  onRatingChange: (applicationId: number, newRating: number) => void;
  layoutType: 'standard' | 'experimental';
  onLayoutChange?: (newLayout: 'standard' | 'experimental') => void;
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
  stalePeriod,
  onRatingChange,
  layoutType,
  onLayoutChange
}) => {
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [applicationToArchive, setApplicationToArchive] = useState<number | null>(null);
  const [tooltipVisibility, setTooltipVisibility] = useState<{ [key: number]: boolean }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<number | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

  const filteredAndSortedApplications = useMemo(() => {
    return applications
      .filter((app: JobApplication) => {
        const currentStatus = app.statusHistory[app.statusHistory.length - 1].status;
        const matchesSearch = app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilters.length === 0 || statusFilters.includes(currentStatus);
        const matchesArchiveFilter = showArchived 
          ? true 
          : currentStatus !== ApplicationStatus.Archived;
        return matchesSearch && matchesStatus && matchesArchiveFilter;
      })
      .sort((a: JobApplication, b: JobApplication) => {
        const aDate = new Date(a.statusHistory[0].timestamp);
        const bDate = new Date(b.statusHistory[0].timestamp);
        return bDate.getTime() - aDate.getTime();
      });
  }, [applications, searchTerm, statusFilters, showArchived]);

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

  const renderArchiveButton = (app: JobApplication) => {
    const currentStatus = app.statusHistory[app.statusHistory.length - 1].status;
    const isArchivable = canBeArchived(currentStatus);

    return isArchivable ? (
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={() => onDelete(app.id)}
      >
        Archive
      </button>
    ) : (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={`tooltip-archive-${app.id}`}>
            This application is already archived
          </Tooltip>
        }
      >
        <span className="d-inline-block">
          <button
            className="btn btn-sm btn-outline-danger"
            disabled
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
            <th>Method</th>
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
                <td>{renderMethodIcon(app.applicationMethod)}</td>
                <td>{app.companyName}</td>
                <td>{app.jobTitle}</td>
                <td>{currentStatus}</td>
                <td>
                  <StarRating 
                    rating={app.rating} 
                    onRatingChange={(newRating) => onRatingChange(app.id, newRating)}
                    size="small"
                  />
                </td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(app)}>View</button>
                  {currentStatus !== ApplicationStatus.Archived && (
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

  const renderMethodIcon = (method: string) => {
    const IconComponent = METHOD_ICONS[method as keyof typeof METHOD_ICONS] || METHOD_ICONS.Other;
    return (
      <span className="method-icon">
        <IconComponent />
      </span>
    );
  };

  const renderMobileView = (applications: JobApplication[]) => (
    applications.map(app => (
      <StandardJobCard
        key={app.id}
        application={app}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        onUndo={onUndo}
        tooltipVisibility={tooltipVisibility}
        onArchiveClick={handleArchiveClick}
        onDisabledArchiveClick={handleDisabledArchiveClick}
        onArchiveIconTouchStart={handleArchiveIconTouchStart}
        onArchiveIconTouchEnd={handleArchiveIconTouchEnd}
        onRatingChange={onRatingChange}
      />
    ))
  );

  const handleAddClick = () => {
    onAddApplication();
  };

  const handleArchiveClick = (appId: number) => {
    setApplicationToArchive(appId);
    setShowArchiveModal(true);
  };

  const handleArchiveConfirm = () => {
    if (applicationToArchive !== null) {
      onDelete(applicationToArchive);
    }
    setShowArchiveModal(false);
    setApplicationToArchive(null);
  };

  const handleDisabledArchiveClick = (appId: number) => {
    setTooltipVisibility(prev => ({ ...prev, [appId]: true }));
    setTimeout(() => {
      setTooltipVisibility(prev => ({ ...prev, [appId]: false }));
    }, 2000);
  };

  const handleArchiveIconTouchStart = (appId: number, e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default touch behavior
    const timer = setTimeout(() => {
      setApplicationToDelete(appId);
      setShowDeleteModal(true);
    }, 1000); // 1 second long press
    setLongPressTimer(timer);
  };

  const handleArchiveIconTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (applicationToDelete !== null) {
      try {
        await (isTest ? devIndexedDBService : indexedDBService).deleteApplication(applicationToDelete);
        refreshApplications();
        setToast({
          show: true,
          message: 'Application permanently deleted',
          type: 'success'
        });
      } catch (error) {
        console.error('Error deleting application:', error);
        setToast({
          show: true,
          message: 'Failed to delete application',
          type: 'error'
        });
      }
    }
    setShowDeleteModal(false);
    setApplicationToDelete(null);
  };

  const renderEmptyState = () => (
    <div className="text-center py-5">
      <h4 className="text-muted mb-3">No applications yet</h4>
      <p className="mb-4">Start tracking your job search by clicking the "Add New" button above</p>
    </div>
  );

  const renderApplication = (application: JobApplication) => {
    if (layoutType === 'experimental') {
      return (
        <ExperimentalJobCard
          key={application.id}
          application={application}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onUndo={onUndo}
          expandedId={expandedCardId}
          onExpand={(id) => {
            setExpandedCardId(currentId => currentId === id ? null : id);
          }}
          onRatingChange={onRatingChange}
        />
      );
    }
    
    return (
      <StandardJobCard
        key={application.id}
        application={application}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        onUndo={onUndo}
        tooltipVisibility={tooltipVisibility}
        onArchiveClick={handleArchiveClick}
        onDisabledArchiveClick={handleDisabledArchiveClick}
        onArchiveIconTouchStart={handleArchiveIconTouchStart}
        onArchiveIconTouchEnd={handleArchiveIconTouchEnd}
        onRatingChange={onRatingChange}
      />
    );
  };

  const canBeArchived = (status: ApplicationStatus): boolean => {
    return status !== ApplicationStatus.Archived;
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

      {applications.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
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
                label={showArchived ? 'Showing All Applications' : 'Hiding Archived Applications'}
                checked={showArchived}
                onChange={() => setShowArchived(!showArchived)}
              />
            </div>
            <div className="mb-3">
              <h5>Filter by Status:</h5>
              <div className="btn-group flex-wrap" role="group">
                {APPLICATION_STATUSES
                  .filter((status: ApplicationStatus) => showArchived || status !== ApplicationStatus.Archived)
                  .map((status: ApplicationStatus) => (
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
                  label={showArchived ? 'Showing All Applications' : 'Hiding Archived Applications'}
                  checked={showArchived}
                  onChange={() => setShowArchived(!showArchived)}
                />
              </Form.Group>

              <div className="filter-chips">
                {(showArchived ? APPLICATION_STATUSES : APPLICATION_STATUSES.filter(s => s !== ApplicationStatus.Archived))
                  .map((status: ApplicationStatus) => (
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

          {/* Use layoutType to determine which view to show */}
          {layoutType === 'experimental' ? (
            <div className="applications-grid">
              {filteredAndSortedApplications.map(app => renderApplication(app))}
            </div>
          ) : (
            <>
              {/* Existing mobile and desktop views */}
              <div className="d-block d-lg-none">
                {renderMobileView(recentApplications)}
                {olderApplications.length > 0 && (
                  <>
                    <h3 className="mt-4">Last 30+ days</h3>
                    {renderMobileView(olderApplications)}
                  </>
                )}
              </div>
              <div className="d-none d-lg-block">
                {renderApplicationTable(recentApplications, true)}
                {olderApplications.length > 0 && renderApplicationTable(olderApplications, false)}
              </div>
            </>
          )}

          {showProgressModal && selectedApplication && (
            <ProgressModal
              application={selectedApplication}
              onClose={() => setShowProgressModal(false)}
              onConfirm={handleProgressConfirm}
            />
          )}

          <Modal show={showArchiveModal} onHide={() => setShowArchiveModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Archive Application</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              The application will be archived. You can recover it at any time.
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowArchiveModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleArchiveConfirm}>
                Archive
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Delete Application</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Warning: This will permanently delete this application and all its history. This action cannot be undone.
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm}>
                Delete Permanently
              </Button>
            </Modal.Footer>
          </Modal>

          <Toast 
            show={toast.show}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(prev => ({ ...prev, show: false }))}
          />
        </>
      )}
    </div>
  );
};

export default ViewApplications;