import React from 'react';
import './Instructions.css';

const Instructions: React.FC = () => {
  return (
    <div className="instructions">
      <h2>Zynergy Instructions</h2>
      <p>Welcome to Zynergy! This application helps you track and manage your job applications efficiently. Here's how to use the main features:</p>

      <h3>Adding Applications</h3>
      <ul>
        <li><strong>Quick Add:</strong> 
          <ul>
            <li>Simply copy and paste the entire job posting text</li>
            <li>The app will automatically extract and fill in:
              <ul>
                <li>Company name</li>
                <li>Job title</li>
                <li>Job type (Remote/Hybrid/In Person)</li>
                <li>Location</li>
                <li>Pay range</li>
                <li>Job description</li>
              </ul>
            </li>
            <li>Review and adjust any auto-filled fields if needed</li>
          </ul>
        </li>
        <li><strong>Manual Add:</strong> Click "Add New" and fill in the fields manually</li>
      </ul>

      <h3>Job Applications</h3>
      <p>The main view for managing your applications:</p>
      <ul>
        <li><strong>Add New:</strong> Click the "Add New" button to add a job application.</li>
        <li><strong>Work Arrangement:</strong> Specify whether the job is:
          <ul>
            <li>Remote: Fully remote position</li>
            <li>Hybrid: Mix of remote and office work</li>
            <li>In Person: Full-time office presence required</li>
            <li>Unspecified: When work arrangement isn't clear</li>
          </ul>
        </li>
        <li><strong>Search:</strong> Use the search bar to quickly find applications by company name or job title.</li>
        <li><strong>Filter:</strong> 
          <ul>
            <li>Desktop: Use the status filter buttons below the search bar</li>
            <li>Mobile: Tap the filter icon to open the filter drawer</li>
          </ul>
        </li>
        <li><strong>View Toggle:</strong> Switch between viewing all applications or only non-archived applications</li>
        <li><strong>Rating System:</strong> Rate applications with a 1-5 star system for better organization</li>
      </ul>

      <h3>Application Actions</h3>
      <ol>
        <li><strong>View/Edit:</strong> Click the company name to view and edit application details</li>
        <li><strong>Progress:</strong> Update the application status using the status badge</li>
        <li><strong>Undo:</strong> Revert the last status change if needed</li>
        <li><strong>Archive:</strong> Archive applications using the trash icon</li>
        <li><strong>Interview Management:</strong> Schedule and track interview details</li>
      </ol>

      <h3>Dashboard</h3>
      <p>Get an overview of your job search:</p>
      <ul>
        <li><strong>Application Timeline:</strong> Chronological view of all applications</li>
        <li><strong>Upcoming Interviews:</strong> Quick view of scheduled interviews</li>
        <li><strong>Becoming Stale:</strong> Applications needing attention based on your settings</li>
      </ul>

      <h3>Reports</h3>
      <p>View analytics about your job search:</p>
      <ul>
        <li><strong>Application Overview:</strong> Key metrics including response and interview rates</li>
        <li><strong>Status Distribution:</strong> Pie chart showing application statuses</li>
        <li><strong>Timeline Analysis:</strong> Track your application activity over time</li>
      </ul>

      <h3>Settings</h3>
      <p>Customize your experience:</p>
      <ul>
        <li><strong>No Response Period:</strong> Set when applications are considered "No Response"</li>
        <li><strong>Stale Period:</strong> Define when applications are marked as becoming stale</li>
        <li><strong>Data Management:</strong>
          <ul>
            <li><strong>Export Data:</strong>
              <ul>
                <li><strong>Backup Export:</strong> Save your applications data to:
                  <ul>
                    <li>Keep a backup of your information</li>
                    <li>Transfer your data to another device</li>
                    <li>Restore your data if needed</li>
                  </ul>
                </li>
                <li><strong>View Export:</strong> Download your applications in a format to:
                  <ul>
                    <li>View your applications outside the app</li>
                    <li>Print your application history</li>
                    <li>Share your tracking information with others</li>
                  </ul>
                </li>
              </ul>
            </li>
            <li><strong>Import Data:</strong> Restore your previously saved backup</li>
          </ul>
        </li>
        <li><strong>Demo Mode:</strong> Toggle Demo Mode to try the app with sample data</li>
      </ul>

      <h3>AI Assistant</h3>
      <p>Get help with using the app:</p>
      <ul>
        <li>Ask questions about app features and functionality</li>
        <li>Get guidance on using specific features</li>
        <li>Learn about app settings and configurations</li>
      </ul>

      <p className="mt-4"><strong>Tips:</strong></p>
      <ul>
        <li>Keep your applications up to date for accurate reporting</li>
        <li>Use the star rating system to prioritize applications</li>
        <li>Pay attention to the job type when applying - it can affect your work-life balance</li>
        <li>Check the Dashboard regularly to stay on top of your job search</li>
        <li>Export your data periodically as a backup</li>
      </ul>
    </div>
  );
};

export default Instructions;