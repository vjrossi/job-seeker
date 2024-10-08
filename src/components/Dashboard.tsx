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

  const staleApplications = activeApplications
    .filter(app => {
      const lastUpdateDate = new Date(app.statusHistory[app.statusHistory.length - 1].timestamp);
      const daysSinceLastUpdate = Math.floor((new Date().getTime() - lastUpdateDate.getTime()) / (1000 * 3600 * 24));
      return daysSinceLastUpdate >= 30;
    })
    .sort((a, b) => {
      const aDate = new Date(a.statusHistory[a.statusHistory.length - 1].timestamp);
      const bDate = new Date(b.statusHistory[b.statusHistory.length - 1].timestamp);
      return bDate.getTime() - aDate.getTime();  // Reverse sort for stale applications
    })
    .slice(0, 5);

  const getDaysUntil = (date: string) => {
    const today = new Date();
    const interviewDate = new Date(date);
    const diffTime = interviewDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `in ${diffDays} days`;
  };

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

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Application Timeline</h5>
            </div>
            <div className="card-body">
              <Timeline
                applications={applications}
                onViewApplication={onViewApplication}
                onStatusChange={onStatusChange}
              />
            </div>
          </div>
        </div>
        <div className="col-md-4" style={{ minWidth: '300px' }}>
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Upcoming Interviews</h5>
            </div>
            <div className="card-body">
              {upcomingInterviews.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {upcomingInterviews.map(app => (
                    <li key={app.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>Interview with {app.companyName}</strong>
                          <br />
                          <small>{formatInterviewDateTime(app.interviewDateTime!)}</small>
                        </div>
                        <span className="badge bg-primary rounded-pill">
                          {getDaysUntil(app.interviewDateTime!)}
                        </span>
                      </div>
                      <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => onViewApplication(app.id)}>View Details</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No upcoming interviews scheduled.</p>
              )}
            </div>
          </div>
          {becomingStaleApplications.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Becoming Stale</h5>
              </div>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  {becomingStaleApplications.map(app => (
                    <li key={app.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{app.companyName}</strong> - {app.jobTitle}
                          <br />
                          <small>Last updated: {new Date(app.statusHistory[app.statusHistory.length - 1].timestamp).toLocaleDateString()}</small>
                        </div>
                        <span className="badge bg-warning rounded-pill">
                          {Math.floor((new Date().getTime() - new Date(app.statusHistory[app.statusHistory.length - 1].timestamp).getTime()) / (1000 * 3600 * 24))} days
                        </span>
                      </div>
                      <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => onViewApplication(app.id)}>View Details</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {staleApplications.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Stale Applications</h5>
              </div>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  {staleApplications.map(app => (
                    <li key={app.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{app.companyName}</strong> - {app.jobTitle}
                          <br />
                          <small>Last updated: {new Date(app.statusHistory[app.statusHistory.length - 1].timestamp).toLocaleDateString()}</small>
                        </div>
                        <span className="badge bg-danger rounded-pill">
                          {Math.floor((new Date().getTime() - new Date(app.statusHistory[app.statusHistory.length - 1].timestamp).getTime()) / (1000 * 3600 * 24))} days
                        </span>
                      </div>
                      <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => onViewApplication(app.id)}>View Details</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;