import React, { useState } from 'react';
import { JobApplication } from './JobApplicationTracker';
import Timeline from './Timeline';

interface DashboardProps {
  applications: JobApplication[];
  onViewApplication: (id: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ applications, onViewApplication }) => {
  const [showInactive, setShowInactive] = useState(false);

  const activeApplications = applications.filter(app => 
    ['Applied', 'Interview Scheduled', 'Offer Received'].includes(app.status)
  );

  const inactiveApplications = applications.filter(app => 
    ['Not Accepted', 'Offer Declined', 'Withdrawn', 'Offer Accepted'].includes(app.status)
  );

  const upcomingEvents = applications.filter(app => 
    app.status === 'Interview Scheduled'
  ).sort((a, b) => new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime());

  return (
    <div className="dashboard">
      <h2 className="mb-4">Dashboard</h2>
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Application Timeline</h5>
            </div>
            <div className="card-body">
              <Timeline applications={activeApplications} onViewApplication={onViewApplication} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Upcoming Events</h5>
            </div>
            <div className="card-body">
              <Timeline applications={upcomingEvents} onViewApplication={onViewApplication} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-12">
          <div className="card mb-4">
            <div className="card-header" onClick={() => setShowInactive(!showInactive)} style={{cursor: 'pointer'}}>
              <h5 className="mb-0 d-flex justify-content-between align-items-center">
                Inactive Applications
                <span>{showInactive ? '▲' : '▼'}</span>
              </h5>
            </div>
            {showInactive && (
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  {inactiveApplications.map(app => (
                    <li key={app.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{app.companyName}</strong> - {app.jobTitle}
                        <br />
                        <small className="text-muted">{new Date(app.dateApplied).toLocaleDateString()}</small>
                      </div>
                      <button className="btn btn-outline-primary btn-sm" onClick={() => onViewApplication(app.id)}>View</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;