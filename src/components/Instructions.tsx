import React from 'react';

const Instructions: React.FC = () => {
  return (
    <div className="instructions">
      <h2>Job Seeker Helper Instructions</h2>
      <p>Welcome to Job Seeker Helper! This application is designed to help you track and manage your job applications efficiently. Here's how to use the main features:</p>

      <h3>Dashboard</h3>
      <p>The dashboard provides an overview of your job application status:</p>
      <ul>
        <li><strong>Application Timeline:</strong> View a chronological list of all your applications.</li>
        <li><strong>Upcoming Interviews:</strong> See your scheduled interviews at a glance.</li>
        <li><strong>Becoming Stale:</strong> Applications that haven't been updated recently will appear here.</li>
        <li><strong>Stale Applications:</strong> Applications that haven't been updated for an extended period will be listed here.</li>
      </ul>

      <h3>Adding a New Application</h3>
      <ol>
        <li>Click on "Add New Application" button.</li>
        <li>Fill in the job details including company name, job title, application date, etc.</li>
        <li>Add any notes or additional information.</li>
        <li>Click "Save" to add the application to your tracker.</li>
      </ol>

      <h3>Viewing and Editing Applications</h3>
      <ol>
        <li>From the dashboard or applications list, click "View Details" on any application.</li>
        <li>Here you can see all details and update the application status.</li>
        <li>To edit, click "Edit" and make your changes.</li>
        <li>Don't forget to save your changes.</li>
      </ol>

      <h3>Updating Application Status</h3>
      <ol>
        <li>Click "Progress" next to an application.</li>
        <li>Choose the new status from the options provided.</li>
        <li>Add any relevant notes about the status change.</li>
      </ol>

      <h3>Filtering and Sorting Applications</h3>
      <ol>
        <li>Use the search bar to find specific applications.</li>
        <li>Use the status filter to view applications in particular stages.</li>
        <li>Sort applications by different criteria like date or company name.</li>
      </ol>

      <h3>Reports</h3>
      <p>Access the Reports section to view statistics about your job search, including:</p>
      <ul>
        <li>Total number of applications</li>
        <li>Applications by status</li>
        <li>Success rate for interviews</li>
      </ul>

      <h3>Settings</h3>
      <p>Customize your experience in the Settings section:</p>
      <ol>
        <li>Set the number of days before an application is considered "stale".</li>
        <li>Adjust other preferences as needed.</li>
      </ol>

      <p>Remember to regularly update your applications to get the most out of Job Seeker Helper. Good luck with your job search!</p>
    </div>
  );
};

export default Instructions;