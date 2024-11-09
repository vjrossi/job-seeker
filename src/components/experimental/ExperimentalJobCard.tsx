import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { JobApplication } from '../JobApplicationTracker';
import { Badge, DropdownButton, Dropdown } from 'react-bootstrap';
import { 
  FaPencilAlt,
  FaTrashAlt,
  FaUndo,
  FaArrowRight,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaHistory 
} from 'react-icons/fa';
import { ApplicationStatus } from '../../constants/ApplicationStatus';
import { getNextStatuses } from '../../constants/applicationStatusMachine';
import './ExperimentalJobCard.css';

interface ExperimentalJobCardProps {
  application: JobApplication;
  onEdit: (application: JobApplication) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, newStatus: ApplicationStatus) => void;
  onUndo?: (id: number) => void;
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

const DropdownPortal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
  nextStatuses: ApplicationStatus[];
  onStatusChange: (status: ApplicationStatus) => void;
  application: JobApplication;
}> = ({ isOpen, onClose, buttonRef, nextStatuses, onStatusChange, application }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current && dropdownRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX - dropdownRef.current.offsetWidth + rect.width,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        backgroundColor: 'white',
        border: '1px solid rgba(0,0,0,0.15)',
        borderRadius: '4px',
        padding: '8px 0',
        minWidth: '250px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 9999,
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
          }}
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(nextStatus);
            onClose();
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {nextStatus === ApplicationStatus.InterviewScheduled ? 
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
  onUndo
}) => {
  const currentStatus = application.statusHistory[application.statusHistory.length - 1].status;
  const nextStatuses = getNextStatuses(currentStatus);
  const statusStyle = getStatusStyle(currentStatus);
  
  // Add state for visibility
  const [actionsVisible, setActionsVisible] = useState(false);

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

  // Add click handler
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on a button or within the actions area when it's visible
    if (
      e.target instanceof HTMLElement && 
      (e.target.closest('button') || 
       e.target.closest('a') || 
       e.target.closest('.dropdown'))
    ) {
      return;
    }
    setActionsVisible(!actionsVisible);
  };

  return (
    <div 
      className={`experimental-card ${actionsVisible ? 'actions-visible' : ''}`}
      onClick={handleCardClick}
    >
      <div className="card-header">
        <div className="header-content">
          <h2 className="company-name">{application.companyName}</h2>
          <h3 className="job-title">{application.jobTitle}</h3>
        </div>
        <Badge 
          className="status-badge"
          bg="white"
          style={{
            color: statusStyle.color,
            border: `1px solid ${statusStyle.borderColor}`,
            fontWeight: '500',
            letterSpacing: '0.3px',
            minWidth: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 16px',
            fontSize: '0.85rem'
          }}
        >
          {formatStatus(currentStatus, application.statusHistory)}
        </Badge>
      </div>

      <div className="card-body">
        {application.statusHistory[application.statusHistory.length - 1].interviewDateTime && (
          <div className="interview-details">
            <h4>UPCOMING INTERVIEW</h4>
            <div className="datetime-container">
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
        <div className="indicator-line"></div>
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
        <div className="time-since" onClick={(e) => e.stopPropagation()}>
          <FaHistory className="time-since-icon" />
          <span>{formatTimeSince(application.statusHistory[application.statusHistory.length - 1].timestamp)}</span>
        </div>
        <div className="right-actions">
          {onUndo && (
            <button 
              className="btn btn-link"
              onClick={(e) => {
                e.stopPropagation();
                onUndo(application.id);
              }}
            >
              <FaUndo />
            </button>
          )}
          <button
            ref={arrowButtonRef}
            className="btn btn-link"
            onClick={e => {
              console.log('Arrow button clicked');
              e.stopPropagation();
              setDropdownOpen(!dropdownOpen);
            }}
          >
            <FaArrowRight />
          </button>
          <DropdownPortal
            isOpen={dropdownOpen}
            onClose={() => setDropdownOpen(false)}
            buttonRef={arrowButtonRef}
            nextStatuses={nextStatuses}
            onStatusChange={(status) => onStatusChange(application.id, status)}
            application={application}
          />
        </div>
      </div>
    </div>
  );
};

export default ExperimentalJobCard;
