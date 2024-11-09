import React, { useState, useMemo } from 'react';
import { JobApplication } from './JobApplicationTracker';
import { ApplicationStatus, APPLICATION_STATUSES } from '../constants/ApplicationStatus';
import { getNextStatuses } from '../constants/applicationStatusMachine';
import ProgressModal from './ProgressModal';
import { OverlayTrigger, Tooltip, Offcanvas, Button, Form, Badge, Dropdown, Card, Modal } from 'react-bootstrap';
import { FaFilter, FaUndo, FaTrashAlt } from 'react-icons/fa';
import './ViewApplications.css';
import { devIndexedDBService } from '../services/devIndexedDBService';
import { indexedDBService } from '../services/indexedDBService';
import Toast from './Toast';
import { METHOD_ICONS } from '../constants/standardApplicationMethods';
import ExperimentalJobCard from './experimental/ExperimentalJobCard';

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

const getStatusSequence = (currentStatus: ApplicationStatus): ApplicationStatus[] => {
  // Base path always starts with Applied
  const commonPath = [ApplicationStatus.Applied];
  
  switch (currentStatus) {
    case ApplicationStatus.InterviewScheduled:
      return [...commonPath, ApplicationStatus.InterviewScheduled];
    
    case ApplicationStatus.OfferReceived:
      return [...commonPath, ApplicationStatus.InterviewScheduled, ApplicationStatus.OfferReceived];
    
    case ApplicationStatus.OfferAccepted:
      return [...commonPath, ApplicationStatus.InterviewScheduled, ApplicationStatus.OfferReceived, ApplicationStatus.OfferAccepted];
    
    case ApplicationStatus.OfferDeclined:
      return [...commonPath, ApplicationStatus.InterviewScheduled, ApplicationStatus.OfferReceived, ApplicationStatus.OfferDeclined];
    
    case ApplicationStatus.NoResponse:
      return [...commonPath, ApplicationStatus.NoResponse];
    
    case ApplicationStatus.NotAccepted:
      return [...commonPath, ApplicationStatus.InterviewScheduled, ApplicationStatus.NotAccepted];
    
    case ApplicationStatus.Withdrawn:
      return [...commonPath, ApplicationStatus.Withdrawn];
    
    case ApplicationStatus.Archived:
      return [...commonPath, ApplicationStatus.Archived];
    
    default:
      return commonPath;
  }
};

const canBeArchived = (status: ApplicationStatus): boolean => {
  return status !== ApplicationStatus.Archived;
};

const getStatusDescription = (app: JobApplication): string => {
  const currentStatus = app.statusHistory[app.statusHistory.length - 1];
  const timeDiff = new Date().getTime() - new Date(currentStatus.timestamp).getTime();
  const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  let timeAgoText;
  if (daysAgo === 0) {
    timeAgoText = 'Today';
  } else if (daysAgo === 1) {
    timeAgoText = 'Yesterday';
  } else {
    timeAgoText = `${daysAgo} days ago`;
  }
  
  switch (currentStatus.status) {
    case ApplicationStatus.InterviewScheduled: {
      // Count how many interviews have been scheduled
      const interviewCount = app.statusHistory.filter(h => h.status === ApplicationStatus.InterviewScheduled).length;
      const interviewNumber = ['first', 'second', 'third', 'fourth', 'fifth'][interviewCount - 1] || `${interviewCount}th`;
      
      if (currentStatus.interviewDateTime) {
        const interviewDate = new Date(currentStatus.interviewDateTime);
        const daysUntil = Math.floor((interviewDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return `${timeAgoText}: ${interviewNumber} interview scheduled for ${interviewDate.toLocaleDateString()} (${daysUntil} days)`;
      }
      return `${timeAgoText}: ${interviewNumber} interview scheduled`;
    }
    case ApplicationStatus.NoResponse:
      return `${timeAgoText}: no response received`;
    
    case ApplicationStatus.NotAccepted:
      return `${timeAgoText}: application rejected`;
    
    case ApplicationStatus.OfferReceived:
      return `${timeAgoText}: received job offer`;
    
    case ApplicationStatus.OfferAccepted:
      return `${timeAgoText}: accepted job offer`;
    
    case ApplicationStatus.OfferDeclined:
      return `${timeAgoText}: declined job offer`;
    
    case ApplicationStatus.Withdrawn:
      return `${timeAgoText}: withdrew application`;
    
    case ApplicationStatus.Archived:
      return `${timeAgoText}: archived`;
    
    default:
      return `${timeAgoText}: ${currentStatus.status}`;
  }
};

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
                <td>{renderStars(app)}</td>
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

  const renderStars = (application: JobApplication) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= application.rating ? 'filled' : 'empty'}`}
          onClick={(e) => {
            e.stopPropagation();
            handleRatingChange(application.id, i);
          }}
          role="button"
          aria-label={`Rate ${i} stars`}
          style={{ cursor: 'pointer' }}
        >
          ★
        </span>
      );
    }
    return <div className="stars">{stars}</div>;
  };

  const renderMethodIcon = (method: string) => {
    const IconComponent = METHOD_ICONS[method as keyof typeof METHOD_ICONS] || METHOD_ICONS.Other;
    return (
      <span className="method-icon">
        <IconComponent />
      </span>
    );
  };

  const renderMobileView = (applications: JobApplication[]) => (
    applications.map(app => {
      const currentStatus = app.statusHistory[app.statusHistory.length - 1].status;
      return (
        <Card key={app.id} className="mb-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              {renderMethodIcon(app.applicationMethod)}
              <h4 
                className="company-name-link mb-0"
                onClick={() => onEdit(app)}
              >
                {app.companyName}
              </h4>
            </div>
            <div className="d-flex align-items-center gap-3">
              {renderStars(app)}
              {!canBeArchived(currentStatus) ? (
                <OverlayTrigger
                  placement="top"
                  show={tooltipVisibility[app.id]}
                  overlay={
                    <Tooltip id={`tooltip-archive-${app.id}`}>
                      This application is already archived
                    </Tooltip>
                  }
                >
                  <span>
                    <FaTrashAlt 
                      className="archive-icon disabled"
                      onClick={() => handleDisabledArchiveClick(app.id)}
                      role="button"
                      aria-label="Archive application (disabled)"
                    />
                  </span>
                </OverlayTrigger>
              ) : (
                <FaTrashAlt 
                  className="archive-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchiveClick(app.id);
                  }}
                  onTouchStart={(e) => handleArchiveIconTouchStart(app.id, e)}
                  onTouchEnd={handleArchiveIconTouchEnd}
                  role="button"
                  aria-label="Archive application"
                />
              )}
            </div>
          </Card.Header>
          <Card.Body>
            <div><strong>{app.jobTitle}</strong></div>
            <div className="status-timeline">
              {getStatusSequence(currentStatus).map((status: ApplicationStatus, index: number, sequence: ApplicationStatus[]) => (
                status === currentStatus && currentStatus !== ApplicationStatus.Archived ? (
                  <Dropdown key={status}>
                    <Dropdown.Toggle 
                      as="div" 
                      className={`status-step active`}
                      style={{ cursor: 'pointer' }}
                    >
                      {status}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Header>What has happened with this application?</Dropdown.Header>
                      {getNextStatuses(currentStatus).map((nextStatus) => (
                        <Dropdown.Item 
                          key={nextStatus}
                          onClick={() => onStatusChange(app.id, nextStatus)}
                        >
                          {nextStatus === ApplicationStatus.InterviewScheduled ? "I got another interview!" :
                           nextStatus === ApplicationStatus.OfferReceived ? "I received a job offer!" :
                           nextStatus === ApplicationStatus.OfferAccepted ? "I accepted the job offer!" :
                           nextStatus === ApplicationStatus.OfferDeclined ? "I declined the job offer" :
                           nextStatus === ApplicationStatus.NoResponse ? "No Response" :
                           nextStatus === ApplicationStatus.NotAccepted ? "I wasn't accepted" :
                           nextStatus === ApplicationStatus.Withdrawn ? "I have decided to withdraw my application" :
                           nextStatus === ApplicationStatus.Archived ? "I want to archive this application" :
                           nextStatus}
                        </Dropdown.Item>
                      ))}
                      {app.statusHistory.length > 1 && (
                        <>
                          <Dropdown.Divider />
                          <Dropdown.Item 
                            onClick={() => onUndo(app.id)}
                            className="text-muted"
                          >
                            <FaUndo className="me-2" />
                            Undo last change
                          </Dropdown.Item>
                        </>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <div 
                    key={status} 
                    className={`status-step ${
                      index < sequence.indexOf(currentStatus) ? 'completed' : ''
                    }`}
                  >
                    {status}
                  </div>
                )
              ))}
            </div>
            <div className="text-muted mt-2" style={{ fontSize: '0.9rem' }}>
              {getStatusDescription(app)}
            </div>
          </Card.Body>
        </Card>
      );
    })
  );

  const handleAddClick = () => {
    onAddApplication();
  };

  const handleRatingChange = (applicationId: number, newRating: number) => {
    onRatingChange(applicationId, newRating);
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
        />
      );
    }
    
    // Return existing card layout
    return renderMobileView([application])[0];
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
            onClick={() => onLayoutChange?.(layoutType === 'standard' ? 'experimental' : 'standard')}
          >
            {layoutType === 'standard' ? 'Try New Layout' : 'Standard Layout'}
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