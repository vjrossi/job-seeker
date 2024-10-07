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

    test('displays upcoming events correctly', () => {
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