import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Dashboard from './Dashboard';

describe('Dashboard', () => {
  const mockApplications = [
    {
      id: 1,
      companyName: 'bbbb',
      jobTitle: 'bbb',
      dateApplied: '2222-02-22',
      status: 'Applied',
      jobDescription: 'Test job description',
      applicationMethod: 'Website',
    },
    {
      id: 2,
      companyName: 'Steadfast',
      jobTitle: 'Software Engineer',
      dateApplied: '2024-10-02',
      status: 'Interview Scheduled',
      interviewDateTime: '2024-10-02T00:00:00',
      jobDescription: 'Mock job description',
      applicationMethod: 'Website'
    },
    // Add more mock applications as needed
  ];

  const mockViewApplication = jest.fn();
  const mockOnViewApplication = jest.fn();

  beforeEach(() => {
    render(<Dashboard applications={mockApplications} onViewApplication={mockOnViewApplication} />);
  });

  test('renders Application Timeline', () => {
    expect(screen.getByText('Application Timeline')).toBeInTheDocument();
  });

  test('renders Upcoming Events', () => {
    expect(screen.getByText('Upcoming Events')).toBeInTheDocument();
  });

  test('displays correct number of applications in timeline', () => {
    const timelineSection = screen.getByText('Application Timeline').closest('.card');
    expect(timelineSection).not.toBeNull();
    const timelineItems = within(timelineSection as HTMLElement).getAllByText(/View Details/i);
    expect(timelineItems).toHaveLength(mockApplications.length);
  });

  test('displays correct application details in timeline', () => {
    const timelineSection = screen.getByText('Application Timeline').closest('.card');
    expect(timelineSection).not.toBeNull();

    mockApplications.forEach(app => {
      const companyNameRegex = new RegExp(app.companyName, 'i');
      const jobTitleRegex = new RegExp(app.jobTitle, 'i');

      const companyNameElements = within(timelineSection as HTMLElement).getAllByText(companyNameRegex);
      const jobTitleElements = within(timelineSection as HTMLElement).getAllByText(jobTitleRegex);

      expect(companyNameElements.length).toBeGreaterThan(0);
      expect(jobTitleElements.length).toBeGreaterThan(0);

      // Check if company name and job title appear together in the same paragraph
      const applicationParagraph = within(timelineSection as HTMLElement).getByText((content, element) => {
        if (element && element.tagName.toLowerCase() === 'p' && 
            companyNameRegex.test(content) && 
            jobTitleRegex.test(content)) {
          return true;
        }
        return false;
      });

      expect(applicationParagraph).toBeInTheDocument();

      // Check for the status badge
      const statusBadge = within(applicationParagraph).getByText(app.status);
      expect(statusBadge).toBeInTheDocument();
    });
  });

//   test('displays correct application statuses', () => {
//     expect(screen.getByText('Applied')).toBeInTheDocument();
//     expect(screen.getByText('Interview Scheduled')).toBeInTheDocument();
//   });

//   test('displays correct application dates', () => {
//     expect(screen.getByText('2/22/2222')).toBeInTheDocument();
//     expect(screen.getByText('10/2/2024')).toBeInTheDocument();
//   });

//   test('calls onViewApplication when View Details is clicked', () => {
//     const viewDetailsButtons = screen.getAllByText('View Details');
//     fireEvent.click(viewDetailsButtons[0]);
//     expect(mockViewApplication).toHaveBeenCalledWith(mockApplications[0].id);
//   });

//   test('displays interview in Upcoming Events', () => {
//     const upcomingEvents = screen.getByText('Upcoming Events');
//     const upcomingEventSection = upcomingEvents.closest('.card');
//     expect(upcomingEventSection).toHaveTextContent('Steadfast - Software Engineer');
//     expect(upcomingEventSection).toHaveTextContent('10/2/2024');
//   });

  // Add a new test for Upcoming Events
  test('displays correct number of upcoming events', () => {
    const upcomingEventsSection = screen.getByText('Upcoming Events').closest('.card') as HTMLElement;
    if (upcomingEventsSection) {
      const upcomingEventItems = within(upcomingEventsSection).getAllByText(/View Details/i);
      const scheduledInterviews = mockApplications.filter(app => app.status === 'Interview Scheduled');
      expect(upcomingEventItems).toHaveLength(scheduledInterviews.length);
    } else {
      throw new Error('Upcoming Events section not found');
    }
  });
});