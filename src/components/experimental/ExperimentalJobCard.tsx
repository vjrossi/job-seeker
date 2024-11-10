import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { JobApplication } from '../JobApplicationTracker';
import { Badge } from 'react-bootstrap';
import { 
  FaPencilAlt,
  FaTrashAlt,
  FaUndo,
  FaArrowRight,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaHistory,
  FaChevronDown 
} from 'react-icons/fa';
import { ApplicationStatus } from '../../constants/ApplicationStatus';
import { getNextStatuses } from '../../constants/applicationStatusMachine';
import './ExperimentalJobCard.css';
import InterviewDetailsModal, { InterviewLocationType } from '../InterviewDetailsModal';
import StarRating from '../shared/StarRating';
import ConfirmationModal from '../ConfirmationModal';

interface ExperimentalJobCardProps {
  application: JobApplication;
  onEdit: (application: JobApplication) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, newStatus: ApplicationStatus, details?: { interviewDateTime?: string; interviewLocation?: string; interviewType?: InterviewLocationType }) => void;
  onUndo?: (id: number) => void;
  expandedId: number | null;
  onExpand: (id: number) => void;
  onRatingChange: (applicationId: number, newRating: number) => void;
}

const getStatusStyle = (status: ApplicationStatus) => {
  switch(status) {
    case ApplicationStatus.Applied:
      return { color: '#1565c0', borderColor: '#1565c0' };
    case ApplicationStatus.InterviewScheduled:
      return { color: '#2e7d32', borderColor: '#2e7d32' };
    case ApplicationStatus.OfferReceived:
      return { color: '#1b5e20', borderColor: '#1b5e20' };
    case ApplicationStatus.OfferAccepted:
      return { color: '#1b5e20', borderColor: '#1b5e20' };
    case ApplicationStatus.NoResponse:
      return { color: '#616161', borderColor: '#616161' };
    case ApplicationStatus.NotAccepted:
      return { color: '#c62828', borderColor: '#c62828' };
    case ApplicationStatus.Withdrawn:
      return { color: '#424242', borderColor: '#424242' };
    case ApplicationStatus.Archived:
      return { color: '#424242', borderColor: '#424242' };
    default:
      return { color: '#424242', borderColor: '#424242' };
  }
};

const formatStatus = (status: ApplicationStatus, history: { status: ApplicationStatus; timestamp: string }[]): string => {
  switch(status) {
    case ApplicationStatus.InterviewScheduled: {
      // Count how many interviews have been scheduled before this one
      const interviewCount = history.filter(h => h.status === ApplicationStatus.InterviewScheduled).length;
      const interviewNumber = ['First', 'Second', 'Third', 'Fourth', 'Fifth'][interviewCount - 1] || `${interviewCount}th`;
      return `${interviewNumber} Interview Scheduled`;
    }
    case ApplicationStatus.NotAccepted:
      return 'Not Accepted';
    case ApplicationStatus.NoResponse:
      return 'No Response';
    default:
      return status;
  }
};

const formatTimeSince = (timestamp: string): string => {
  const now = new Date();
  const then = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}d ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
};

interface DropdownPortalProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
  nextStatuses: ApplicationStatus[];
  onStatusChange: (status: ApplicationStatus) => void;
  onInterviewSchedule: (status: ApplicationStatus) => void;
  application: JobApplication;
}

const DropdownPortal: React.FC<DropdownPortalProps> = ({
  isOpen,
  onClose,
  buttonRef,
  nextStatuses,
  onStatusChange,
  onInterviewSchedule,
  application
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      // Check if there's enough space below the button
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const shouldShowAbove = spaceBelow < dropdownHeight + 10; // 10px buffer
      
      setPosition({
        top: shouldShowAbove 
          ? buttonRect.top + window.scrollY - dropdownHeight - 5 // Show above
          : buttonRect.bottom + window.scrollY + 5,             // Show below
        left: buttonRect.left + window.scrollX - dropdownRef.current.offsetWidth + buttonRect.width,
      });
    }
  }, [isOpen, buttonRef]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        backgroundColor: 'white',
        border: '1px solid rgba(0,0,0,0.15)',
        borderRadius: '4px',
        padding: '8px 0',
        minWidth: '250px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 9999,
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #eee', color: '#666' }}>
        What has happened with this application?
      </div>
      {nextStatuses.map((nextStatus) => (
        <button
          key={nextStatus}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px 16px',
            textAlign: 'left',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 10000,
          }}
          type="button"
          onMouseDown={(e) => {
            console.log('Button MouseDown event fired');
            e.stopPropagation();
            e.preventDefault();
            console.log('Dropdown item clicked, status:', nextStatus);
            
            if (nextStatus === ApplicationStatus.InterviewScheduled) {
              onInterviewSchedule(nextStatus);
            } else {
              onStatusChange(nextStatus);
            }
            onClose();
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <div style={{ pointerEvents: 'none' }}>
            {nextStatus === ApplicationStatus.ApplicationReceived ? "My application has been received" :
              nextStatus === ApplicationStatus.InterviewScheduled ? 
                (application.statusHistory.some(h => h.status === ApplicationStatus.InterviewScheduled) 
                  ? "I got another interview!" 
                  : "I got an interview!") :
              nextStatus === ApplicationStatus.OfferReceived ? "I received a job offer!" :
              nextStatus === ApplicationStatus.OfferAccepted ? "I accepted the job offer!" :
              nextStatus === ApplicationStatus.OfferDeclined ? "I declined the job offer" :
              nextStatus === ApplicationStatus.NoResponse ? "No Response" :
              nextStatus === ApplicationStatus.NotAccepted ? "I wasn't accepted" :
              nextStatus === ApplicationStatus.Withdrawn ? "I have decided to withdraw my application" :
              nextStatus === ApplicationStatus.Archived ? "I want to archive this application" :
              nextStatus}
          </div>
        </button>
      ))}
    </div>,
    document.body
  );
};

const ExperimentalJobCard: React.FC<ExperimentalJobCardProps> = ({
  application,
  onEdit,
  onDelete,
  onStatusChange,
  onUndo,
  expandedId,
  onExpand,
  onRatingChange
}) => {
  const currentStatus = application.statusHistory[application.statusHistory.length - 1].status;
  const nextStatuses = getNextStatuses(currentStatus);
  const statusStyle = getStatusStyle(currentStatus);
  
  // Add a new state for dropdown visibility
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const arrowButtonRef = useRef<HTMLButtonElement>(null);

  // Add click handler for document to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen && arrowButtonRef.current && !arrowButtonRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Update the handleCardClick function with proper type checking
  const handleCardClick = (e: React.MouseEvent) => {
    // Type check the target as HTMLElement
    if (!(e.target instanceof HTMLElement)) {
      return;
    }

    // Only expand if clicking the indicator line
    if (!e.target.closest('.action-indicator')) {
      return;
    }

    if (
      e.target.closest('button') || 
      e.target.closest('a') || 
      e.target.closest('.dropdown')
    ) {
      return;
    }
    onExpand(application.id);
  };

  // Use expandedId to determine if this card is expanded
  const isExpanded = expandedId === application.id;

  // Add to state in ExperimentalJobCard component
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(null);

  // Add new state for interview details expansion
  const [interviewDetailsExpanded, setInterviewDetailsExpanded] = useState(false);

  // Add these near the top of the component with other state declarations
  const [showUndoConfirmation, setShowUndoConfirmation] = useState(false);

  // Add this handler function
  const handleUndoConfirm = () => {
    if (onUndo) {
      onUndo(application.id);
    }
    setShowUndoConfirmation(false);
  };

  return (
    <>
      <div 
        className={`experimental-card ${isExpanded ? 'actions-visible' : ''}`}
        onClick={handleCardClick}
      >
        <div className="card-header">
          <div className="header-content">
            <h2 className="company-name">{application.companyName}</h2>
            <h3 className="job-title">{application.jobTitle}</h3>
            <StarRating 
              rating={application.rating}
              onRatingChange={(newRating) => onRatingChange(application.id, newRating)}
              size="medium"
            />
          </div>
          <div className="status-section">
            <Badge 
              className="status-badge"
              bg="white"
              style={{
                color: statusStyle.color,
                border: `1px solid ${statusStyle.borderColor}`,
                fontWeight: '500',
                letterSpacing: '0.3px',
                minWidth: '120px',
                maxHeight: '4.8em',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                lineHeight: '1.2'
              }}
            >
              {formatStatus(currentStatus, application.statusHistory)}
            </Badge>
            <div className="time-since">
              <FaHistory className="time-since-icon" />
              <span>{formatTimeSince(application.statusHistory[application.statusHistory.length - 1].timestamp)}</span>
            </div>
          </div>
        </div>

        <div className="card-body">
          {application.statusHistory[application.statusHistory.length - 1].interviewDateTime && (
            <div className="interview-details">
              <h4 
                onClick={(e) => {
                  e.stopPropagation();
                  setInterviewDetailsExpanded(!interviewDetailsExpanded);
                }}
                style={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center',
                }}
              >
                <span>UPCOMING INTERVIEW</span>
                <FaChevronDown 
                  size={12} 
                  style={{ 
                    marginLeft: '1rem',
                    transform: interviewDetailsExpanded ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease'
                  }} 
                />
              </h4>
              <div 
                className="datetime-container" 
                style={{ 
                  maxHeight: interviewDetailsExpanded ? '500px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                  opacity: interviewDetailsExpanded ? 1 : 0
                }}
              >
                <div className="datetime-row">
                  <FaCalendarAlt className="datetime-icon" />
                  <div className="date">
                    {new Date(application.statusHistory[application.statusHistory.length - 1].interviewDateTime!)
                      .toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                  </div>
                </div>
                <div className="datetime-row">
                  <FaClock className="datetime-icon" />
                  <div className="time">
                    {new Date(application.statusHistory[application.statusHistory.length - 1].interviewDateTime!).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                {application.statusHistory[application.statusHistory.length - 1].interviewLocation && (
                  <div className="datetime-row">
                    <FaMapMarkerAlt className="datetime-icon" />
                    <div className="location">
                      {application.statusHistory[application.statusHistory.length - 1].interviewLocation}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="action-indicator">
          <div 
            className="indicator-line" 
            style={{ cursor: 'pointer' }} 
          />
        </div>

        <div className="card-actions">
          <div className="left-actions">
            <button 
              className="btn btn-link"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(application);
              }}
            >
              <FaPencilAlt />
            </button>
            <button 
              className="btn btn-link text-danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(application.id);
              }}
            >
              <FaTrashAlt />
            </button>
          </div>
          <div className="right-actions">
            {onUndo && application.statusHistory.length > 1 && (
              <button 
                className="btn btn-link"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUndoConfirmation(true);
                }}
              >
                <FaUndo />
              </button>
            )}
            {nextStatuses.length > 0 && (
              <button
                ref={arrowButtonRef}
                className="btn btn-link"
                onClick={e => {
                  e.stopPropagation();
                  setDropdownOpen(!dropdownOpen);
                }}
              >
                <FaArrowRight />
              </button>
            )}
            <DropdownPortal
              isOpen={dropdownOpen}
              onClose={() => setDropdownOpen(false)}
              buttonRef={arrowButtonRef}
              nextStatuses={nextStatuses}
              onStatusChange={(status) => {
                onStatusChange(application.id, status);
              }}
              onInterviewSchedule={(status) => {
                setPendingStatus(status);
                setShowInterviewModal(true);
              }}
              application={application}
            />
          </div>
        </div>
      </div>
      <InterviewDetailsModal
        show={showInterviewModal}
        onHide={() => {
          setShowInterviewModal(false);
          setPendingStatus(null);
        }}
        onConfirm={(details) => {
          if (pendingStatus === ApplicationStatus.InterviewScheduled) {
            onStatusChange(application.id, pendingStatus, {
              interviewDateTime: details.dateTime,
              interviewLocation: details.location,
              interviewType: details.locationType,
            });
          }
          setShowInterviewModal(false);
          setPendingStatus(null);
        }}
      />
      <ConfirmationModal
        show={showUndoConfirmation}
        onClose={() => setShowUndoConfirmation(false)}
        onConfirm={handleUndoConfirm}
        message="Are you sure you want to undo the last status change?"
      />
    </>
  );
};

export default ExperimentalJobCard;
