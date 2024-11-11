import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Dashboard from './Dashboard';
import { JobApplication } from '../types/JobApplication';
import { ApplicationStatus } from '../constants/ApplicationStatus';
import { InterviewLocationType } from '../components/InterviewDetailsModal';

describe('Dashboard', () => {
    const mockOnViewApplication = jest.fn();

    const mockApplications: JobApplication[] = [
        {
            id: 1,
            companyName: 'Company A',
            jobTitle: 'Job A',
            jobDescription: 'Description A',
            rating: 0,
            applicationMethod: 'Online',
            statusHistory: [
                { 
                    status: ApplicationStatus.Applied, 
                    timestamp: '2023-01-01T00:00:00.000Z'
                }
            ]
        },
        {
            id: 2,
            companyName: 'Company B',
            jobTitle: 'Job B',
            jobDescription: 'Description B',
            applicationMethod: 'Email',
            rating: 0,
            statusHistory: [
                { 
                    status: ApplicationStatus.Applied, 
                    timestamp: '2023-01-02T00:00:00.000Z' 
                },
                { 
                    status: ApplicationStatus.InterviewScheduled, 
                    timestamp: '2023-01-10T00:00:00.000Z',
                    interviewDateTime: '2023-01-20T14:00:00.000Z',
                    interviewLocation: 'Remote',
                    interviewType: 'remote' as InterviewLocationType
                }
            ],
            interviewDateTime: '2023-01-20T14:00:00.000Z',
            interviewLocation: 'Remote'
        }
    ];

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-01-15T00:00:00.000Z'));
        
        const mockOnStatusChange = jest.fn();
        render(
            <Dashboard 
                applications={mockApplications} 
                onViewApplication={mockOnViewApplication} 
                onStatusChange={mockOnStatusChange}
                stalePeriod={21}
            />
        );
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('renders Application Timeline', () => {
        expect(screen.getByText('Application Timeline')).toBeInTheDocument();
    });

    test('renders Upcoming Interviews', () => {
        expect(screen.getByText('Upcoming Interviews')).toBeInTheDocument();
    });

    test('displays upcoming interviews', () => {
        expect(screen.getByText(/Interview with Company B/i)).toBeInTheDocument();
        expect(screen.getByText(/20 Jan 2023/)).toBeInTheDocument();
    });
});