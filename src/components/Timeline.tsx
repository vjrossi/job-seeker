import React from 'react';
import { JobApplication } from './JobApplicationTracker';

interface TimelineProps {
  applications: JobApplication[];
  onViewApplication: (id: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({ applications, onViewApplication }) => {
  const sortedApplications = applications.sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied': return '#0088FE';
      case 'Interview Scheduled': return '#00C49F';
      case 'Offer Received': return '#FFBB28';
      default: return '#8884D8';
    }
  };

  const isOverdue = (app: JobApplication) => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    return new Date(app.dateApplied) < twoWeeksAgo && app.status === 'Applied';
  };

  const getMonthLabels = () => {
    const months: { [key: string]: Date } = {};
    sortedApplications.forEach(app => {
      const date = new Date(app.dateApplied);
      const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      if (!months[monthYear]) {
        months[monthYear] = date;
      }
    });
    return Object.entries(months).sort(([, a], [, b]) => b.getTime() - a.getTime());
  };

  return (
    <div className="timeline-container">
      <div className="timeline">
        <div className="timeline-months">
          {getMonthLabels().map(([label, date]) => (
            <div key={label} className="timeline-month" style={{top: `${100 * (1 - (date.getTime() - new Date(sortedApplications[sortedApplications.length - 1].dateApplied).getTime()) / (new Date(sortedApplications[0].dateApplied).getTime() - new Date(sortedApplications[sortedApplications.length - 1].dateApplied).getTime()))}%`}}>
              {label}
            </div>
          ))}
        </div>
        {sortedApplications.map((app, index) => (
          <div key={app.id} className="timeline-item">
            <div className="timeline-badge" style={{ backgroundColor: getStatusColor(app.status) }}></div>
            <div className="timeline-content">
              <h6>{new Date(app.dateApplied).toLocaleDateString()}</h6>
              <p>
                <strong>{app.companyName}</strong> - {app.jobTitle}
                <br />
                <span className="badge" style={{ backgroundColor: getStatusColor(app.status) }}>{app.status}</span>
                {isOverdue(app) && <span className="badge bg-warning ms-2">Follow up</span>}
              </p>
              <button className="btn btn-outline-primary btn-sm" onClick={() => onViewApplication(app.id)}>View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;