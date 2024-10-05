import React, { useState } from 'react';

interface JobApplication {
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  dateApplied: string;
  status: string;
  applicationMethod: string;
}

const JobApplicationForm: React.FC<{ onSubmit: (application: JobApplication) => void }> = ({ onSubmit }) => {
  const [application, setApplication] = useState<JobApplication>({
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    dateApplied: '',
    status: 'Applied',
    applicationMethod: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setApplication(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(application);
    // Reset form after submission
    setApplication({
      companyName: '',
      jobTitle: '',
      jobDescription: '',
      dateApplied: '',
      status: 'Applied',
      applicationMethod: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-3">
        <label htmlFor="companyName" className="form-label">Company Name</label>
        <input
          type="text"
          className="form-control"
          id="companyName"
          name="companyName"
          value={application.companyName}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="jobTitle" className="form-label">Job Title</label>
        <input
          type="text"
          className="form-control"
          id="jobTitle"
          name="jobTitle"
          value={application.jobTitle}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="jobDescription" className="form-label">Job Description</label>
        <textarea
          className="form-control"
          id="jobDescription"
          name="jobDescription"
          value={application.jobDescription}
          onChange={handleChange}
          rows={3}
        ></textarea>
      </div>
      <div className="mb-3">
        <label htmlFor="dateApplied" className="form-label">Date Applied</label>
        <input
          type="date"
          className="form-control"
          id="dateApplied"
          name="dateApplied"
          value={application.dateApplied}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label htmlFor="status" className="form-label">Status</label>
        <select
          className="form-select"
          id="status"
          name="status"
          value={application.status}
          onChange={handleChange}
          required
        >
          <option value="Applied">Applied</option>
          <option value="Interview Scheduled">Interview Scheduled</option>
          <option value="Rejected">Rejected</option>
          <option value="Offer Received">Offer Received</option>
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor="applicationMethod" className="form-label">Application Method</label>
        <input
          type="text"
          className="form-control"
          id="applicationMethod"
          name="applicationMethod"
          value={application.applicationMethod}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">Submit Application</button>
    </form>
  );
};

export default JobApplicationForm;