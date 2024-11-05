import React from 'react';
import { render, screen } from '@testing-library/react';
import JobApplicationTracker from './JobApplicationTracker';
import { INACTIVE_STATUSES } from '../constants/ApplicationStatus';

describe('JobApplicationTracker', () => {
  const mockSetIsFormDirty = jest.fn();

  beforeEach(() => {
    render(
      <JobApplicationTracker 
        currentView="view" 
        setIsFormDirty={mockSetIsFormDirty}
        isDev={false}
        noResponseDays={14}
        stalePeriod={30}
      />
    );
  });

  test('renders the "Add New Application" button', () => {
    const addButton = screen.getByText('Add New Application');
    expect(addButton).toBeInTheDocument();
  });

  test('renders the search input', () => {
    const searchInput = screen.getByPlaceholderText('Search applications...');
    expect(searchInput).toBeInTheDocument();
  });

  test('renders status filter buttons based on active state', () => {
    const activeStatuses = ['Applied', 'Interview Scheduled', 'No Response', 'Offer Received', 'Offer Accepted'];
    const inactiveStatuses = INACTIVE_STATUSES;

    activeStatuses.forEach(status => {
      const filterButton = screen.getByRole('button', { name: status });
      expect(filterButton).toBeInTheDocument();
    });

    inactiveStatuses.forEach(status => {
      expect(screen.queryByRole('button', { name: status })).not.toBeInTheDocument();
    });
  });

  test('renders the applications table', () => {
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });
});