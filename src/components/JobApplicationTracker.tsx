import React, { useState, useEffect } from 'react';
import JobApplicationForm from './JobApplicationForm';
import ViewApplications from './ViewApplications';
import { indexedDBService } from '../services/indexedDBService';

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

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const loadedApplications = await indexedDBService.getAllApplications();
      setApplications(loadedApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const handleSubmit = async (newApplication: Omit<JobApplication, 'id'>) => {
    const application = {
      ...newApplication,
      id: Date.now(),
    };
    try {
      await indexedDBService.addApplication(application);
      setApplications(prev => [...prev, application]);
    } catch (error) {
      console.error('Error adding application:', error);
    }
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