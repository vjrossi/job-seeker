import React from 'react';
import { JobApplication } from './JobApplicationTracker';
import { ApplicationStatus } from '../constants/ApplicationStatus';
import { STANDARD_APPLICATION_METHODS } from '../constants/standardApplicationMethods';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import './Reports.css';

interface ReportsProps {
  applications: JobApplication[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Reports: React.FC<ReportsProps> = ({ applications }) => {
  // Helper function to count applications by status
  const countByStatus = () => {
    const counts: { [key: string]: number } = {};
    applications.forEach(app => {
      const status = app.statusHistory[app.statusHistory.length - 1].status;
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  // Helper function to count applications by method
  const countByMethod = () => {
    const counts: { [key: string]: number } = {};
    STANDARD_APPLICATION_METHODS.forEach(method => {
      counts[method] = 0;
    });
    applications.forEach(app => {
      const method = app.applicationMethod || 'Unspecified';
      console.log("Application method:", method); // Keep this for debugging
      if (STANDARD_APPLICATION_METHODS.includes(method)) {
        counts[method]++;
      } else {
        counts['Other']++;
      }
    });
    console.log("Final counts:", counts); // Keep this for debugging
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  };

  // Calculate response rate
  const responseRate = () => {
    const responded = applications.filter(app => 
      app.statusHistory.some(status => status.status !== ApplicationStatus.Applied && status.status !== ApplicationStatus.NoResponse)
    ).length;
    return (responded / applications.length) * 100;
  };

  // Calculate interview success rate
  const interviewSuccessRate = () => {
    const interviewed = applications.filter(app => 
      app.statusHistory.some(status => status.status === ApplicationStatus.InterviewScheduled)
    ).length;
    return (interviewed / applications.length) * 100;
  };

  // Calculate offer rate
  const offerRate = () => {
    const offered = applications.filter(app => 
      app.statusHistory.some(status => status.status === ApplicationStatus.OfferReceived)
    ).length;
    return (offered / applications.length) * 100;
  };

  // Calculate average time to response
  const averageTimeToResponse = () => {
    const responseTimes = applications
      .filter(app => app.statusHistory.length > 1)
      .map(app => {
        const applyDate = new Date(app.statusHistory[0].timestamp);
        const responseDate = new Date(app.statusHistory[1].timestamp);
        return (responseDate.getTime() - applyDate.getTime()) / (1000 * 60 * 60 * 24); // days
      })
      .filter(time => !isNaN(time) && time > 0); // Filter out invalid values

    if (responseTimes.length === 0) {
      return "N/A";
    }

    const sum = responseTimes.reduce((a, b) => a + b, 0);
    return (sum / responseTimes.length).toFixed(2);
  };

  const renderMobileLayout = () => (
    <div className="d-block d-lg-none">
      <div className="chart-container">
        <h3>Application Status</h3>
        <div className="chart-wrapper">
          <PieChart width={300} height={300}>
            <Pie
              data={countByStatus()}
              cx={150}
              cy={150}
              labelLine={false}
              outerRadius={80}
              dataKey="value"
            >
              {countByStatus().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>

      <div className="stats-card">
        <h3>Key Metrics</h3>
        <div>Response Rate: {responseRate().toFixed(2)}%</div>
        <div>Interview Rate: {interviewSuccessRate().toFixed(2)}%</div>
        <div>Offer Rate: {offerRate().toFixed(2)}%</div>
        <div>Avg Response Time: {averageTimeToResponse()} days</div>
      </div>

      <div className="chart-container">
        <h3>Application Methods</h3>
        <div className="chart-wrapper">
          <BarChart width={300} height={300} data={countByMethod()}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </div>
      </div>
    </div>
  );

  const renderDesktopLayout = () => (
    <div className="d-none d-lg-block">
      <div className="chart-container full-width">
        <h3>Application Overview</h3>
        <div className="stats-grid">
          <div>Response Rate: {responseRate().toFixed(2)}%</div>
          <div>Interview Rate: {interviewSuccessRate().toFixed(2)}%</div>
          <div>Offer Rate: {offerRate().toFixed(2)}%</div>
          <div>Avg Response Time: {averageTimeToResponse()} days</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Application Status</h3>
          <PieChart width={400} height={400}>
            <Pie
              data={countByStatus()}
              cx={200}
              cy={200}
              labelLine={false}
              outerRadius={120}
              dataKey="value"
            >
              {countByStatus().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div className="chart-container">
          <h3>Application Methods</h3>
          <BarChart width={400} height={400} data={countByMethod()}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </div>
      </div>
    </div>
  );

  return (
    <div className="reports">
      {renderMobileLayout()}
      {renderDesktopLayout()}
    </div>
  );
};

export default Reports;