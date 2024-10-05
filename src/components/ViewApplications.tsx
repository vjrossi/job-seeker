import React, { useState } from 'react';
import { JobApplication } from './JobApplicationTracker';
import { APPLICATION_STATUSES } from '../constants/applicationStatuses';

interface ViewApplicationsProps {
  applications: JobApplication[];
  onStatusChange: (id: number, newStatus: string) => void;
  onEdit: (application: JobApplication) => void;
}

const ViewApplications: React.FC<ViewApplicationsProps> = ({ applications, onStatusChange, onEdit }) => {
  const [sortField, setSortField] = useState<keyof JobApplication>('dateApplied');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState('');

  const sortedApplications = [...applications].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredApplications = sortedApplications.filter(app =>
    Object.values(app).some(value =>
      value.toString().toLowerCase().includes(filter.toLowerCase())
    )
  );

  const handleSort = (field: keyof JobApplication) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Filter applications..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="form-control mb-3"
      />
      <table className="table table-striped">
        <thead>
          <tr>
            <th onClick={() => handleSort('companyName')}>Company Name</th>
            <th onClick={() => handleSort('jobTitle')}>Job Title</th>
            <th onClick={() => handleSort('dateApplied')}>Date Applied</th>
            <th onClick={() => handleSort('status')}>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredApplications.map(app => (
            <tr key={app.id}>
              <td>{app.companyName}</td>
              <td>{app.jobTitle}</td>
              <td>{app.dateApplied}</td>
              <td>
                <select
                  className="form-select"
                  value={app.status}
                  onChange={(e) => onStatusChange(app.id, e.target.value)}
                >
                  {APPLICATION_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </td>
              <td>
                <button className="btn btn-primary btn-sm" onClick={() => onEdit(app)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewApplications;