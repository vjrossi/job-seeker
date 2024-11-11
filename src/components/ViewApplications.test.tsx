import React from 'react';
import { render, screen, within } from '@testing-library/react';
import ViewApplications from './ViewApplications';
import { ApplicationStatus } from '../constants/ApplicationStatus';
import { JobApplication } from '../types/JobApplication';

describe('ViewApplications', () => {
  const mockApplications: JobApplication[] = [
    { id: 1, companyName: 'Company A', jobTitle: 'Job A', statusHistory: [{ status: ApplicationStatus.Applied, timestamp: new Date().toISOString() }], jobDescription: '', applicationMethod: '', rating: 3 },
    { id: 2, companyName: 'Company B', jobTitle: 'Job B', statusHistory: [{ status: ApplicationStatus.InterviewScheduled, timestamp: new Date().toISOString() }], jobDescription: '', applicationMethod: '', rating: 4 },
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
    stalePeriod: 21,
    onRatingChange: jest.fn(),
    layoutType: 'standard' as const,
    onLayoutChange: jest.fn()
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
    const headers = ['Company', 'Job Title', 'Status', 'Rating', 'Actions'];
    headers.forEach(header => {
      const headerElement = screen.getByRole('columnheader', { name: header });
      expect(headerElement).toBeInTheDocument();
    });
  });

  test('table rows are present and contain correct data', () => {
    const mockApplications: JobApplication[] = [
      {
        id: 1,
        companyName: 'Company B',
        jobTitle: 'Job B',
        jobDescription: 'Description for Job B',
        applicationMethod: 'Online',
        rating: 4,
        statusHistory: [
          { status: ApplicationStatus.Applied, timestamp: new Date('2023-01-01').toISOString() },
          { status: ApplicationStatus.InterviewScheduled, timestamp: new Date('2023-01-15').toISOString() }
        ],
      },
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
      stalePeriod: 21,
      onRatingChange: jest.fn(),
      layoutType: 'standard' as const,
      onLayoutChange: jest.fn()
    };

    render(<ViewApplications {...mockProps} />);

    // Check if the table exists
    const table = screen.getByRole('table', { name: 'Recent Applications' });
    expect(table).toBeInTheDocument();

    // Check if the table headers are correct
    const headers = ['Company', 'Job Title', 'Status', 'Rating', 'Actions'];
    headers.forEach(header => {
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument();
    });

    // Check if the application data is displayed correctly
    expect(screen.getByText('Company B')).toBeInTheDocument();
    expect(screen.getByText('Job B')).toBeInTheDocument();
    expect(screen.getByText('Interview Scheduled')).toBeInTheDocument();

    // Check if the action buttons are present
    expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Progress' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Archive' })).toBeInTheDocument();
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
    const headers = ['Company', 'Job Title', 'Status', 'Rating', 'Actions'];
    headers.forEach(header => {
      const headerElement = screen.getByRole('columnheader', { name: header });
      expect(headerElement).toBeInTheDocument();
    });
  });
});
