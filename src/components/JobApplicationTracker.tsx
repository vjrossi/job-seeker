import React, { useState } from 'react';
import JobApplicationForm from './JobApplicationForm';

interface JobApplication {
  id: number;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  dateApplied: string;
  status: string;
  applicationMethod: string;
}

const JobApplicationTracker: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);

  const handleSubmit = (newApplication: Omit<JobApplication, 'id'>) => {
    const application = {
      ...newApplication,
      id: Date.now(), // Use timestamp as a simple unique id
    };
    setApplications(prev => [...prev, application]);
  };

  return (
    <div>
      <h2>Job Application Tracker</h2>
      <JobApplicationForm onSubmit={handleSubmit} />
      <div>
        <h3>Applications ({applications.length})</h3>
        <ul>
          {applications.map(app => (
            <li key={app.id}>{app.companyName} - {app.jobTitle}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default JobApplicationTracker;