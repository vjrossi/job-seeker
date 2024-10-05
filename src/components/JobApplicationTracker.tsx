import React, { useState } from 'react';
import JobApplicationForm from './JobApplicationForm';
import ViewApplications from './ViewApplications';

export interface JobApplication {
  id: number;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  dateApplied: string;
  status: string;
  applicationMethod: string;
}

interface JobApplicationTrackerProps {
  currentView: 'add' | 'view';
}

const JobApplicationTracker: React.FC<JobApplicationTrackerProps> = ({ currentView }) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);

  const handleSubmit = (newApplication: Omit<JobApplication, 'id'>) => {
    const application = {
      ...newApplication,
      id: Date.now(),
    };
    setApplications(prev => [...prev, application]);
  };

  return (
    <div>
      {currentView === 'add' ? (
        <JobApplicationForm onSubmit={handleSubmit} />
      ) : (
        <ViewApplications applications={applications} />
      )}
    </div>
  );
};

export default JobApplicationTracker;