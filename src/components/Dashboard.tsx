import React from 'react';
import { JobApplication } from './JobApplicationTracker';
import Timeline from './Timeline';

interface DashboardProps {
  applications: JobApplication[];
  onViewApplication: (id: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ applications, onViewApplication }) => {
  const activeApplications = applications.filter(app => app.status !== 'Archived');

  const upcomingInterviews = activeApplications
    .filter(app => app.status === 'Interview Scheduled' && app.interviewDateTime)
    .sort((a, b) => new Date(a.interviewDateTime!).getTime() - new Date(b.interviewDateTime!).getTime())
    .slice(0, 5);

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
              <Timeline applications={activeApplications} onViewApplication={onViewApplication} />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Upcoming Events</h5>
            </div>
            <div className="card-body">
              {upcomingInterviews.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {upcomingInterviews.map(app => (
                    <li key={app.id} className="list-group-item">
                      <strong>{app.companyName}</strong>
                      <br />
                      <small>{new Date(app.interviewDateTime!).toLocaleString()}</small>
                      <br />
                      <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => onViewApplication(app.id)}>View Details</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No upcoming interviews scheduled.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;