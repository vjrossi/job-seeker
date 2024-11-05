import React from 'react';
import { JobApplication } from './JobApplicationTracker';
import Timeline from './Timeline';
import { ApplicationStatus, ACTIVE_STATUSES } from '../constants/ApplicationStatus';
import './Dashboard.css';

interface DashboardProps {
  applications: JobApplication[];
  onViewApplication: (id: number) => void;
  onStatusChange: (id: number, newStatus: ApplicationStatus) => void;
  stalePeriod: number; // Add this line
}

const Dashboard: React.FC<DashboardProps> = ({ 
  applications, 
  onViewApplication, 
  onStatusChange,
  stalePeriod // Add this line
}) => {
  const activeApplications = applications.filter(app => {
    const currentStatus = app.statusHistory[app.statusHistory.length - 1].status;
    return ACTIVE_STATUSES.includes(currentStatus);
  });

  const upcomingInterviews = activeApplications
    .filter(app => {
      const currentStatus = app.statusHistory[app.statusHistory.length - 1].status;
      return currentStatus === ApplicationStatus.InterviewScheduled && app.interviewDateTime;
    })
    .sort((a, b) => new Date(a.interviewDateTime!).getTime() - new Date(b.interviewDateTime!).getTime())
    .slice(0, 5);

  const becomingStaleApplications = activeApplications
    .filter(app => {
      const lastUpdateDate = new Date(app.statusHistory[app.statusHistory.length - 1].timestamp);
      const daysSinceLastUpdate = Math.floor((new Date().getTime() - lastUpdateDate.getTime()) / (1000 * 3600 * 24));
      return daysSinceLastUpdate >= 14 && daysSinceLastUpdate <= 30;
    })
    .sort((a, b) => {
      const aDate = new Date(a.statusHistory[a.statusHistory.length - 1].timestamp);
      const bDate = new Date(b.statusHistory[b.statusHistory.length - 1].timestamp);
      return bDate.getTime() - aDate.getTime();
    })
    .slice(0, 5);

  const formatInterviewDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderMobileLayout = () => (
    <div className="d-block d-lg-none">
      <div className="timeline-section">
        <div className="dashboard-card">
          <h5>Application Timeline</h5>
          <Timeline
            applications={applications}
            onViewApplication={onViewApplication}
            onStatusChange={onStatusChange}
          />
        </div>
      </div>

      <div className="upcoming-interviews">
        <div className="dashboard-card">
          <h5>Upcoming Interviews</h5>
          {upcomingInterviews.length > 0 ? (
            upcomingInterviews.map(app => (
              <div key={app.id} className="interview-item">
                <strong>{app.companyName}</strong>
                <div>{formatInterviewDateTime(app.interviewDateTime!)}</div>
                <button 
                  className="btn btn-sm btn-outline-primary mt-2"
                  onClick={() => onViewApplication(app.id)}
                >
                  View Details
                </button>
              </div>
            ))
          ) : (
            <p>No upcoming interviews scheduled.</p>
          )}
        </div>
      </div>

      {becomingStaleApplications.length > 0 && (
        <div className="stale-applications">
          <div className="dashboard-card">
            <h5>Becoming Stale</h5>
            {/* ... stale applications content ... */}
          </div>
        </div>
      )}
    </div>
  );

  const renderDesktopLayout = () => (
    <div className="d-none d-lg-block">
      <div className="timeline-section">
        <h5>Application Timeline</h5>
        <Timeline
          applications={applications}
          onViewApplication={onViewApplication}
          onStatusChange={onStatusChange}
        />
      </div>

      <div className="dashboard-sidebar">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Upcoming Interviews</h5>
          </div>
          <div className="card-body">
            {/* ... same content as mobile but with desktop styling ... */}
          </div>
        </div>

        {becomingStaleApplications.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Becoming Stale</h5>
            </div>
            <div className="card-body">
              {/* ... same content as mobile but with desktop styling ... */}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      {renderMobileLayout()}
      {renderDesktopLayout()}
    </div>
  );
};

export default Dashboard;