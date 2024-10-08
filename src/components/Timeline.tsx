import React, { useState } from 'react';
import { JobApplication } from './JobApplicationTracker';
import { ApplicationStatus, INACTIVE_STATUSES } from '../constants/ApplicationStatus';
import './Timeline.css';
import ProgressModal from './ProgressModal';

interface TimelineProps {
  applications: JobApplication[];
  onViewApplication: (id: number) => void;
  onStatusChange: (id: number, newStatus: ApplicationStatus) => void;
}

const Timeline: React.FC<TimelineProps> = ({ applications, onViewApplication, onStatusChange }) => {
  const [isRecentFirst, setIsRecentFirst] = useState(true);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);

  const sortedApplications = applications.sort((a, b) => {
    const aDate = new Date(a.statusHistory[0].timestamp);
    const bDate = new Date(b.statusHistory[0].timestamp);
    return isRecentFirst ? bDate.getTime() - aDate.getTime() : aDate.getTime() - bDate.getTime();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case ApplicationStatus.Applied: return '#0088FE';
      case ApplicationStatus.InterviewScheduled: return '#00C49F';
      case ApplicationStatus.NoResponse: return '#FFBB28';
      case ApplicationStatus.NotAccepted: return '#FF8042';
      case ApplicationStatus.OfferReceived: return '#FF0000';
      case ApplicationStatus.OfferAccepted: return '#808080';
      case ApplicationStatus.OfferDeclined: return '#808080';
      case ApplicationStatus.Withdrawn: return '#808080';
      case ApplicationStatus.Archived: return '#808080';
      default: return '#8884D8';
    }
  };

  const toggleSortOrder = () => {
    setIsRecentFirst(!isRecentFirst);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleProgressClick = (app: JobApplication) => {
    setSelectedApplication(app);
    setShowProgressModal(true);
  };

  const handleProgressConfirm = (newStatus: ApplicationStatus) => {
    if (selectedApplication) {
      onStatusChange(selectedApplication.id, newStatus);
    }
    setShowProgressModal(false);
    setSelectedApplication(null);
  };

  const handleStatusChange = (application: JobApplication, newStatus: ApplicationStatus) => {
    onStatusChange(application.id, newStatus);
  };

  let lastMonth = '';

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <button onClick={toggleSortOrder} className="btn btn-outline-secondary btn-sm">
          {isRecentFirst ? 'Show Oldest First' : 'Show Recent First'}
        </button>
      </div>
      {sortedApplications.map((app) => {
        const currentStatus = app.statusHistory[app.statusHistory.length - 1].status;
        const inactive = INACTIVE_STATUSES.includes(currentStatus);
        const appliedDate = new Date(app.statusHistory[0].timestamp);
        const month = appliedDate.toLocaleString('default', { month: 'long' });
        const showMonth = month !== lastMonth;
        lastMonth = month;

        return (
          <div key={app.id} className={`timeline-item ${inactive ? 'inactive' : ''}`}>
            {showMonth && (
              <div className="timeline-month">
                {month}
              </div>
            )}
            <div className="timeline-item-content">
              <h4>{app.companyName} - {app.jobTitle}</h4>
              {inactive && <span className="inactive-badge">{currentStatus}</span>}
              <div className="timeline-stages">
                {app.statusHistory.map((status, index) => (
                  <div key={index} className="timeline-stage">
                    <div 
                      className="timeline-stage-dot" 
                      style={{ backgroundColor: getStatusColor(status.status) }}
                    ></div>
                    <div className="timeline-stage-content">
                      <p>{status.status}</p>
                      <small>{formatDate(new Date(status.timestamp))}</small>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <button 
                  className="btn btn-outline-primary btn-sm me-2" 
                  onClick={() => onViewApplication(app.id)}
                >
                  View Details
                </button>
                {!inactive && (
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={() => handleProgressClick(app)}
                  >
                    Progress
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {showProgressModal && selectedApplication && (
        <ProgressModal
          application={selectedApplication}
          onClose={() => setShowProgressModal(false)}
          onConfirm={(newStatus: string) => handleProgressConfirm(newStatus as ApplicationStatus)}
        />
      )}
    </div>
  );
};

export default Timeline;