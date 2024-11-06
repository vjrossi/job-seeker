import React from 'react';
import './Instructions.css';

const Instructions: React.FC = () => {
  return (
    <div className="instructions">
      <h2>Zynergy Instructions</h2>
      <p>Welcome to Zynergy! This application helps you track and manage your job applications efficiently. Here's how to use the main features:</p>

      <h3>Job Applications</h3>
      <p>The main view for managing your applications:</p>
      <ul>
        <li><strong>Add New:</strong> Click the "Add New" button to add a job application.</li>
        <li><strong>Search:</strong> Use the search bar to quickly find applications by company name or job title.</li>
        <li><strong>Filter:</strong> 
          <ul>
            <li>Desktop: Use the status filter buttons below the search bar</li>
            <li>Mobile: Tap the filter icon to open the filter drawer</li>
          </ul>
        </li>
        <li><strong>Active/Inactive Toggle:</strong> Switch between active and inactive applications</li>
        <li><strong>Time Periods:</strong> Applications are organized into "Last 30 days" and "Last 30+ days"</li>
      </ul>

      <h3>Application Actions</h3>
      <ol>
        <li><strong>View:</strong> Click "View" to see full application details</li>
        <li><strong>Progress:</strong> Update the application status when there are developments</li>
        <li><strong>Undo:</strong> Revert the last status change if needed</li>
        <li><strong>Archive:</strong> Archive applications that are no longer active</li>
      </ol>

      <h3>Dashboard</h3>
      <p>Get an overview of your job search:</p>
      <ul>
        <li><strong>Application Timeline:</strong> Chronological view of all applications</li>
        <li><strong>Upcoming Interviews:</strong> Quick view of scheduled interviews</li>
        <li><strong>Becoming Stale:</strong> Applications needing attention</li>
      </ul>

      <h3>Reports</h3>
      <p>View analytics about your job search:</p>
      <ul>
        <li><strong>Application Overview:</strong> Key metrics including response and interview rates</li>
        <li><strong>Status Distribution:</strong> Pie chart showing application statuses</li>
        <li><strong>Application Methods:</strong> Bar chart of different application methods used</li>
      </ul>

      <h3>Settings</h3>
      <p>Customize your experience:</p>
      <ul>
        <li><strong>No Response Period:</strong> Set when applications are considered "No Response"</li>
        <li><strong>Stale Period:</strong> Define when applications are marked as becoming stale</li>
      </ul>

      <h3>Demo Mode</h3>
      <p>Toggle Demo Mode in the top navigation bar to try the app with sample data.</p>

      <p className="mt-4"><strong>Tips:</strong></p>
      <ul>
        <li>Keep your applications up to date for accurate reporting</li>
        <li>Use the search and filters to manage large numbers of applications</li>
        <li>Check the Dashboard regularly to stay on top of your job search</li>
      </ul>
    </div>
  );
};

export default Instructions;