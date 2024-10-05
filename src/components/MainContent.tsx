import React from 'react';
import JobApplicationTracker from './JobApplicationTracker';

const MainContent: React.FC = () => {
  return (
    <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Job Seeker Helper</h1>
      </div>
      <JobApplicationTracker />
    </main>
  );
};

export default MainContent;