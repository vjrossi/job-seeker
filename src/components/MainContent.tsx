import React from 'react';
import JobApplicationTracker from './JobApplicationTracker';
import Instructions from './Instructions';
import Settings from './Settings';

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
  if (currentView === 'instructions') {
    return <Instructions />;
  }
  
  if (currentView === 'settings') {
    return (
      <Settings 
        noResponseDays={noResponseDays}
        onNoResponseDaysChange={onNoResponseDaysChange}
        stalePeriod={stalePeriod}
        onStalePeriodChange={onStalePeriodChange}
      />
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