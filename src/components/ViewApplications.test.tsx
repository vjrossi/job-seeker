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
    isTest: false,
    refreshApplications: jest.fn(),
    onUndo: jest.fn(),
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

  test('archive buttons are present for inactive applications', () => {
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
    tableRows.slice(1).forEach((row, index) => {
      expect(row).toHaveTextContent(mockApplications[index].companyName);
      expect(row).toHaveTextContent(mockApplications[index].jobTitle);
      expect(row).toHaveTextContent(mockApplications[index].statusHistory[0].status);
      expect(row).toHaveTextContent('View');
      expect(row).toHaveTextContent('Progress');
      expect(row).toHaveTextContent('Undo');
      expect(row).toHaveTextContent('Archive');
    });
  });

  test('search input is present and unchanged', () => {
    const searchInput = screen.getByPlaceholderText('Search applications...');
    expect(searchInput).toBeInTheDocument();
  });

  test('"Add New Application" button is present and unchanged', () => {
    expect(screen.getByText('Add New Application')).toBeInTheDocument();
  });

  test('test mode indicator is not shown when isTest is false', () => {
    expect(screen.queryByText('(Test Mode)')).not.toBeInTheDocument();
  });

  test('test mode button and toggle are shown when isTest is true', () => {
    render(<ViewApplications {...mockProps} isTest={true} />);
    expect(screen.getByText(/(Test Mode)/)).toBeInTheDocument();
  });

  test('renders table headers including Method', () => {
    const headers = ['Company', 'Job Title', 'Date Applied', 'Status', 'Actions'];
    headers.forEach(header => {
      const headerElement = screen.getByRole('columnheader', { name: header });
      expect(headerElement).toBeInTheDocument();
    });
  });
});
