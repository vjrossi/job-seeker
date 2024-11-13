import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewEditApplicationForm from './ViewEditApplicationForm';
import { JobApplication } from '../types/JobApplication';
import { ApplicationStatus } from '../constants/ApplicationStatus';

describe('ViewEditApplicationForm', () => {
  const mockApplication: JobApplication = {
    id: 1,
    companyName: 'Test Company',
    jobTitle: 'Software Engineer',
    jobDescription: 'Test description',
    applicationMethod: 'LinkedIn',
    rating: 4,
    jobUrl: 'https://example.com/job/1',
    statusHistory: [
      {
        status: ApplicationStatus.Applied,
        timestamp: '2024-03-20T10:00:00.000Z'
      }
    ]
  };

  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnStatusChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders in view mode by default', () => {
    render(
      <ViewEditApplicationForm
        application={mockApplication}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText(/Test description/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
  });

  it('switches to edit mode when Edit button is clicked', async () => {
    render(
      <ViewEditApplicationForm
        application={mockApplication}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onStatusChange={mockOnStatusChange}
      />
    );

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    // Check if form inputs are present
    expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Software Engineer')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
  });

  it('calls onSave with updated data when form is submitted', async () => {
    render(
      <ViewEditApplicationForm
        application={mockApplication}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onStatusChange={mockOnStatusChange}
        initialEditMode={true}
      />
    );

    const companyInput = screen.getByDisplayValue('Test Company');
    await userEvent.clear(companyInput);
    await userEvent.type(companyInput, 'Updated Company');

    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      companyName: 'Updated Company'
    }));
  });

  it('calls onCancel when Cancel button is clicked', () => {
    render(
      <ViewEditApplicationForm
        application={mockApplication}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onStatusChange={mockOnStatusChange}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('validates job URL format', async () => {
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <ViewEditApplicationForm
        application={mockApplication}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onStatusChange={mockOnStatusChange}
        initialEditMode={true}
      />
    );

    const urlInput = screen.getByDisplayValue('https://example.com/job/1');
    await userEvent.clear(urlInput);
    await userEvent.type(urlInput, 'invalid-url');

    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);

    expect(mockAlert).toHaveBeenCalledWith('Job URL must start with http:// or https://');
    expect(mockOnSave).not.toHaveBeenCalled();

    mockConsoleError.mockRestore();
    mockAlert.mockRestore();
  });

  it('renders stars for rating', () => {
    render(
      <ViewEditApplicationForm
        application={mockApplication}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onStatusChange={mockOnStatusChange}
      />
    );

    const stars = screen.getAllByTestId('star-icon');
    expect(stars).toHaveLength(5);
    
    // Check if correct number of stars are filled (rating is 4)
    const filledStars = stars.filter(star => star.getAttribute('color') === '#ffc107');
    expect(filledStars).toHaveLength(4);
  });

  it('updates rating when stars are clicked in edit mode', async () => {
    render(
      <ViewEditApplicationForm
        application={mockApplication}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onStatusChange={mockOnStatusChange}
        initialEditMode={true}
      />
    );

    const stars = screen.getAllByTestId('star-icon');
    fireEvent.click(stars[2]); // Click the third star

    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      rating: 3
    }));
  });

  it('displays application method correctly', () => {
    render(
      <ViewEditApplicationForm
        application={mockApplication}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
  });

  it('maintains scroll position when switching between view and edit modes', async () => {
    const { container } = render(
      <ViewEditApplicationForm
        application={mockApplication}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onStatusChange={mockOnStatusChange}
      />
    );

    const scrollContainer = container.firstChild as HTMLElement;
    const initialScrollTop = scrollContainer.scrollTop;

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    expect(scrollContainer.scrollTop).toBe(initialScrollTop);
  });
}); 