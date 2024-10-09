import React from 'react';
import { JobApplication } from './JobApplicationTracker';
import { ApplicationStatus } from '../constants/ApplicationStatus';
import { STANDARD_APPLICATION_METHODS } from '../constants/standardApplicationMethods';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
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

  return (
    <div className="reports">
      <h2>Reports</h2>
      
      <div className="row">
        <div className="col-md-6">
          <h3>Application Status Overview</h3>
          <PieChart width={400} height={400}>
            <Pie
              data={countByStatus()}
              cx={200}
              cy={200}
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
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
        
        <div className="col-md-6">
          <h3>Top Application Methods</h3>
          <BarChart width={400} height={400} data={countByMethod()}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-4">
          <h3>Response Rate</h3>
          <p>{responseRate().toFixed(2)}%</p>
        </div>
        <div className="col-md-4">
          <h3>Interview Success Rate</h3>
          <p>{interviewSuccessRate().toFixed(2)}%</p>
        </div>
        <div className="col-md-4">
          <h3>Offer Rate</h3>
          <p>{offerRate().toFixed(2)}%</p>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6">
          <h3>Average Time to Response</h3>
          <p>{averageTimeToResponse()} {averageTimeToResponse() !== "N/A" ? "days" : ""}</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;