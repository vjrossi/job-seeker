import React, { useState } from 'react';
import JobApplicationTracker from './JobApplicationTracker';
import Instructions from './Instructions';
import Settings from './Settings';
import { useApplications } from '../hooks/useApplications';
import Toast from './shared/Toast';
import AIChat from './AIChat';

interface MainContentProps {
  currentView: 'dashboard' | 'view' | 'reports' | 'instructions' | 'settings';
  setIsFormDirty: (isDirty: boolean) => void;
  isDev: boolean;
  noResponseDays: number;
  onNoResponseDaysChange: (days: number) => void;
  stalePeriod: number;
  onStalePeriodChange: (days: number) => void;
}

const MainContent: React.FC<MainContentProps> = ({ 
  currentView, 
  setIsFormDirty, 
  isDev,
  noResponseDays,
  onNoResponseDaysChange,
  stalePeriod,
  onStalePeriodChange
}) => {
  const { applications, refreshApplications } = useApplications(isDev);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' as const });

  const handleError = (message: string) => {
    setToast({ show: true, message, type: 'error' });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  if (currentView === 'instructions') {
    return <Instructions />;
  }
  
  if (currentView === 'settings') {
    return (
      <div className="settings-page-container">
        <Settings
          isDev={isDev}
          noResponseDays={noResponseDays}
          onNoResponseDaysChange={onNoResponseDaysChange}
          stalePeriod={stalePeriod}
          onStalePeriodChange={onStalePeriodChange}
          applications={applications}
          onApplicationsUpdate={refreshApplications}
          onError={handleError}
        />
        <AIChat />
        <Toast 
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      </div>
    );
  }

  return (
    <div className="w-100">
      <JobApplicationTracker 
        currentView={currentView} 
        setIsFormDirty={setIsFormDirty}
        isDev={isDev}
        noResponseDays={noResponseDays}
        stalePeriod={stalePeriod}
      />
    </div>
  );
};

export default MainContent;