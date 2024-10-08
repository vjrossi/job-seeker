import React from 'react';
import { render, screen } from '@testing-library/react';
import ViewApplications from './ViewApplications';
import { JobApplication } from './JobApplicationTracker';
import { ApplicationStatus } from '../constants/ApplicationStatus';

describe('ViewApplications', () => {
  const mockApplications: JobApplication[] = [
    { id: 1, companyName: 'Company A', jobTitle: 'Job A', statusHistory: [{ status: ApplicationStatus.Applied, timestamp: new Date().toISOString() }], jobDescription: '', applicationMethod: '' },
    { id: 2, companyName: 'Company B', jobTitle: 'Job B', statusHistory: [{ status: ApplicationStatus.InterviewScheduled, timestamp: new Date().toISOString() }], jobDescription: '', applicationMethod: '' },
  ];

  const mockProps = {
    applications: mockApplications,
    onStatusChange: jest.fn(),
    onEdit: jest.fn(),
    onAddApplication: jest.fn(),
    searchTerm: '',
    onSearchChange: jest.fn(),
    statusFilters: [],
    onStatusFilterChange: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    render(<ViewApplications {...mockProps} />);
  });

  test('renders "View" buttons for each application', () => {
    const viewButtons = screen.getAllByRole('button', { name: 'View' });
    expect(viewButtons.length).toBe(mockApplications.length);
    viewButtons.forEach(button => {
      expect(button).toHaveTextContent('View');
    });
  });

  test('delete buttons are present and unchanged', () => {
    const deleteButtons = screen.getAllByRole('button', { name: 'Archive' });
    expect(deleteButtons.length).toBe(mockApplications.length);
    deleteButtons.forEach(button => {
      expect(button).toHaveTextContent('Archive');
    });
  });

  test('table headers are present and unchanged', () => {
    const headers = ['Company', 'Job Title', 'Date Applied', 'Status', 'Actions'];
    headers.forEach(header => {
      const headerElement = screen.getByRole('columnheader', { name: header });
      expect(headerElement).toBeInTheDocument();
    });
  });

  test('table rows are present and unchanged', () => {
    const tableRows = screen.getAllByRole('row');
    expect(tableRows.length).toBe(mockApplications.length + 1); // +1 for header row
    tableRows.forEach((row, index) => {
      if (index > 0) {
        expect(row).toHaveTextContent(mockApplications[index - 1].companyName);
        expect(row).toHaveTextContent(mockApplications[index - 1].jobTitle);
        expect(row).toHaveTextContent(mockApplications[index - 1].statusHistory[0].status);
        expect(row).toHaveTextContent('Progress');
        
      }
    });
  });

  // check for search input
  test('search input is present and unchanged', () => {
    const searchInput = screen.getByPlaceholderText('Search applications...');
    expect(searchInput).toBeInTheDocument();
  });

  test('"Add New Application" button is present and unchanged', () => {
    expect(screen.getByText('Add New Application')).toBeInTheDocument();
  });
}); 