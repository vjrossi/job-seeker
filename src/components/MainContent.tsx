import React from 'react';
import JobApplicationTracker from './JobApplicationTracker';
import Instructions from './Instructions';

interface MainContentProps {
  currentView: 'dashboard' | 'view' | 'reports' | 'instructions';
  setIsFormDirty: (isDirty: boolean) => void;
}

const MainContent: React.FC<MainContentProps> = ({ currentView, setIsFormDirty }) => {
  return (
    <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
      {currentView === 'instructions' ? (
        <Instructions />
      ) : (
        <JobApplicationTracker currentView={currentView} setIsFormDirty={setIsFormDirty} />
      )}
    </main>
  );
};

export default MainContent;