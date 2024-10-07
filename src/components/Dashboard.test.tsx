import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Dashboard from './Dashboard';
import { JobApplication } from '../components/JobApplicationTracker';

describe('Dashboard', () => {
    const mockOnViewApplication = jest.fn();

    const mockApplications: JobApplication[] = [
        {
            id: 1,
            companyName: 'Company A',
            jobTitle: 'Job A',
            jobDescription: 'Description A',
            applicationMethod: 'Online',
            statusHistory: [
                { status: 'Applied', timestamp: '2023-01-01T00:00:00.000Z' }
            ],
            interviewDateTime: '2023-01-15T10:00:00.000Z'
        },
        {
            id: 2,
            companyName: 'Company B',
            jobTitle: 'Job B',
            jobDescription: 'Description B',
            applicationMethod: 'Email',
            statusHistory: [
                { status: 'Applied', timestamp: '2023-01-02T00:00:00.000Z' },
                { status: 'Interview Scheduled', timestamp: '2023-01-10T00:00:00.000Z' }
            ],
            interviewDateTime: '2023-01-20T14:00:00.000Z'
        },
    ];

    beforeEach(() => {
        const mockOnStatusChange = jest.fn();
        render(
            <Dashboard 
                applications={mockApplications} 
                onViewApplication={mockOnViewApplication} 
                onStatusChange={mockOnStatusChange}
            />
        );
    });

    test('renders Application Timeline', () => {
        expect(screen.getByText('Application Timeline')).toBeInTheDocument();
    });

    test('renders Upcoming Events', () => {
        expect(screen.getByText('Upcoming Events')).toBeInTheDocument();
    });
    test('displays upcoming interviews', () => {
        expect(screen.getByText('Interview with Company B')).toBeInTheDocument();
        expect(screen.getByText('21/01/2023, 1:00:00 am')).toBeInTheDocument();
    });
});