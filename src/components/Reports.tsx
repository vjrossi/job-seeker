import React from 'react';
import { JobApplication } from './JobApplicationTracker';

interface ReportsProps {
  applications: JobApplication[];
}

const Reports: React.FC<ReportsProps> = ({ applications }) => {
  return (
    <div className="reports">
      <h2>Reports</h2>
      <p>This is where you'll see various reports and statistics about your job applications.</p>
      <p>Total applications: {applications.length}</p>
      {/* Add more report details here */}
    </div>
  );
};

export default Reports;