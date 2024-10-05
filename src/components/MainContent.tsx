import React from 'react';
import JobApplicationTracker from './JobApplicationTracker';

interface MainContentProps {
  currentView: 'dashboard' | 'add' | 'view' | 'reports';
}

const MainContent: React.FC<MainContentProps> = ({ currentView }) => {
  return (
    <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
      {currentView === 'dashboard' && (
        <>
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">Job Seeker Helper</h1>
          </div>
          <p>Dashboard content goes here</p>
        </>
      )}
      {(currentView === 'add' || currentView === 'view') && (
        <JobApplicationTracker currentView={currentView} />
      )}
      {currentView === 'reports' && (
        <>
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">Reports</h1>
          </div>
          <p>Reports content goes here</p>
        </>
      )}
    </main>
  );
};

export default MainContent;