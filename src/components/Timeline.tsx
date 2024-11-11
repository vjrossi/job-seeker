import React, { useState } from 'react';
import { JobApplication } from '../types/JobApplication';
import { ApplicationStatus, INACTIVE_STATUSES } from '../constants/ApplicationStatus';
import './Timeline.css';
import ProgressModal from './ProgressModal';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface TimelineProps {
  applications: JobApplication[];
  onViewApplication: (id: number) => void;
  onStatusChange: (id: number, newStatus: ApplicationStatus) => void;
}

const Timeline: React.FC<TimelineProps> = ({ applications, onViewApplication, onStatusChange }) => {
  const [isRecentFirst, setIsRecentFirst] = useState(true);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);

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

  const handleProgressConfirm = (newStatus: ApplicationStatus) => {
    if (selectedApplication) {
      onStatusChange(selectedApplication.id, newStatus);
    }
    setShowProgressModal(false);
    setSelectedApplication(null);
  };

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => 
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const groupedApplications = applications
    .sort((a, b) => {
      const aDate = new Date(a.statusHistory[0].timestamp);
      const bDate = new Date(b.statusHistory[0].timestamp);
      return isRecentFirst ? bDate.getTime() - aDate.getTime() : aDate.getTime() - bDate.getTime();
    })
    .reduce((acc, app) => {
      const appliedDate = new Date(app.statusHistory[0].timestamp);
      const month = appliedDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(app);
      return acc;
    }, {} as Record<string, JobApplication[]>);

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <button onClick={toggleSortOrder} className="btn btn-outline-primary btn-sm">
          {isRecentFirst ? 'Show Oldest First' : 'Show Recent First'}
        </button>
      </div>
      <div className="timeline-content">
        {Object.entries(groupedApplications).length === 0 ? (
          <p className="no-applications-message">No job applications yet. Start by adding your first application!</p>
        ) : (
          Object.entries(groupedApplications).map(([month, apps]: [string, JobApplication[]]) => (
            <div key={month} className="timeline-month-group">
              <div 
                className={`timeline-month-header ${expandedMonths.includes(month) ? 'expanded' : ''}`} 
                onClick={() => toggleMonth(month)}
              >
                <h3>{month}</h3>
                <span className="expand-icon">
                  {expandedMonths.includes(month) ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </div>
              <div className={`timeline-month-content ${expandedMonths.includes(month) ? 'expanded' : ''}`}>
                {apps.map((app) => {
                  const currentStatus = app.statusHistory[app.statusHistory.length - 1].status;
                  const inactive = INACTIVE_STATUSES.includes(currentStatus);

                  return (
                    <div key={app.id} className={`timeline-item ${inactive ? 'inactive' : ''}`}>
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
                        <div className="timeline-item-actions">
                          <button 
                            className="btn btn-outline-primary btn-sm" 
                            onClick={() => onViewApplication(app.id)}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
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