import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JobApplicationForm from './JobApplicationForm';
import { JobApplication } from './JobApplicationTracker';
import { ApplicationStatus } from '../constants/ApplicationStatus';

describe('JobApplicationForm', () => {
    const mockOnSubmit = jest.fn();
    const mockOnFormChange = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with "Applied" status and readonly', () => {
        render(<JobApplicationForm 
            onSubmit={mockOnSubmit} 
            formData={{
                companyName: '',
                jobTitle: '',
                jobDescription: '',
                applicationMethod: '',
                statusHistory: [{
                    status: ApplicationStatus.Applied,
                    timestamp: new Date().toISOString()
                }]
            }}
            onFormChange={mockOnFormChange}
            existingApplications={[]}
            onCancel={mockOnCancel}
        />);
    });

    // check all fields are present in the HTML
    it('renders with all fields', () => {
        render(<JobApplicationForm 
            onSubmit={mockOnSubmit} 
            formData={{
                companyName: 'Company A',
                jobTitle: 'Job A',
                jobDescription: 'Job Description A',
                applicationMethod: 'Method A',
                statusHistory: [{
                    status: ApplicationStatus.Applied,
                    timestamp: new Date().toISOString()
                }]
            }}
            onFormChange={mockOnFormChange}
            existingApplications={[]}
            onCancel={mockOnCancel}
        />);

        expect(screen.getByLabelText('Company Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Job Title')).toBeInTheDocument();
        expect(screen.getByLabelText('Job Description')).toBeInTheDocument();
        expect(screen.getByLabelText('Application Method')).toBeInTheDocument();
        expect(screen.getByLabelText('Job Rating')).toBeInTheDocument();
    });
});