import React from 'react';
import { JobApplication } from '../JobApplicationTracker';
import { Badge, Dropdown } from 'react-bootstrap';
import { FaEdit, FaTrash, FaUndo, FaArrowRight } from 'react-icons/fa';
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
    case ApplicationStatus.SecondRoundScheduled:
      return { color: '#e65100', borderColor: '#e65100' };
    case ApplicationStatus.ThirdRoundScheduled:
      return { color: '#6a1b9a', borderColor: '#6a1b9a' };
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

const formatStatus = (status: ApplicationStatus): string => {
  switch(status) {
    case ApplicationStatus.SecondRoundScheduled:
      return 'Second Round';
    case ApplicationStatus.ThirdRoundScheduled:
      return 'Third Round';
    case ApplicationStatus.InterviewScheduled:
      return 'Interview Set';
    case ApplicationStatus.NotAccepted:
      return 'Not Accepted';
    case ApplicationStatus.NoResponse:
      return 'No Response';
    default:
      return status;
  }
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
  
  return (
    <div className="experimental-card">
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
          {formatStatus(currentStatus)}
        </Badge>
      </div>

      <div className="card-body">
        {application.interviewDateTime && (
          <div className="interview-details">
            <h4>UPCOMING INTERVIEW</h4>
            <div className="datetime">
              <div className="date">{new Date(application.interviewDateTime).toLocaleDateString()}</div>
              <div className="time">{new Date(application.interviewDateTime).toLocaleTimeString()}</div>
            </div>
          </div>
        )}
      </div>

      <div className="card-actions">
        <div className="left-actions">
          <button 
            className="btn btn-link"
            onClick={() => onEdit(application)}
          >
            <FaEdit />
          </button>
          <button 
            className="btn btn-link text-danger"
            onClick={() => onDelete(application.id)}
          >
            <FaTrash />
          </button>
        </div>
        <div className="right-actions">
          {onUndo && (
            <button 
              className="btn btn-link"
              onClick={() => onUndo(application.id)}
            >
              <FaUndo />
            </button>
          )}
          <Dropdown>
            <Dropdown.Toggle 
              as="button" 
              className="btn btn-link"
            >
              <FaArrowRight />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Header>What has happened with this application?</Dropdown.Header>
              {nextStatuses.map((nextStatus) => (
                <Dropdown.Item 
                  key={nextStatus}
                  onClick={() => onStatusChange(application.id, nextStatus)}
                >
                  {nextStatus === ApplicationStatus.InterviewScheduled ? "I got an interview!" :
                   nextStatus === ApplicationStatus.SecondRoundScheduled ? "Got a Second Interview!" :
                   nextStatus === ApplicationStatus.ThirdRoundScheduled ? "Got a Third Interview!" :
                   nextStatus === ApplicationStatus.OfferReceived ? "I received a job offer!" :
                   nextStatus === ApplicationStatus.OfferAccepted ? "I accepted the job offer!" :
                   nextStatus === ApplicationStatus.OfferDeclined ? "I declined the job offer" :
                   nextStatus === ApplicationStatus.NoResponse ? "No Response" :
                   nextStatus === ApplicationStatus.NotAccepted ? "I wasn't accepted for the next stage" :
                   nextStatus === ApplicationStatus.Withdrawn ? "I have decided to withdraw my application" :
                   nextStatus === ApplicationStatus.Archived ? "I want to archive this application" :
                   nextStatus}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default ExperimentalJobCard;
