import React from 'react';
import { render, screen } from '@testing-library/react';
import JobApplicationTracker from './JobApplicationTracker';
import { APPLICATION_STATUSES } from '../constants/applicationStatuses';

describe('JobApplicationTracker', () => {
  const mockSetIsFormDirty = jest.fn();

  beforeEach(() => {
    render(<JobApplicationTracker currentView="view" setIsFormDirty={mockSetIsFormDirty} />);
  });

  test('renders the "Add New Application" button', () => {
    const addButton = screen.getByText('Add New Application');
    expect(addButton).toBeInTheDocument();
  });

  test('renders the search input', () => {
    const searchInput = screen.getByPlaceholderText('Search applications...');
    expect(searchInput).toBeInTheDocument();
  });

  test('renders status filter buttons', () => {
    APPLICATION_STATUSES.forEach(status => {
      const filterButton = screen.getByRole('button', { name: status });
      expect(filterButton).toBeInTheDocument();
    });
  });

  test('renders the applications table', () => {
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  test('renders table headers', () => {
    const headers = ['Company', 'Job Title', 'Date Applied', 'Status', 'Actions'];
    headers.forEach(header => {
      const headerElement = screen.getByRole('columnheader', { name: header });
      expect(headerElement).toBeInTheDocument();
    });
  });
});