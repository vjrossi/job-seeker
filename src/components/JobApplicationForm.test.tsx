import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JobApplicationForm from './JobApplicationForm';
import { JobApplication } from './JobApplicationTracker';
import { ApplicationStatus } from '../constants/ApplicationStatus';

describe('JobApplicationForm', () => {
    const mockOnSubmit = jest.fn();
    const mockOnFormChange = jest.fn();
    const mockOnCancel = jest.fn();

    const defaultProps = {
        onSubmit: mockOnSubmit,
        formData: {
            companyName: '',
            jobTitle: '',
            dateApplied: '',
            status: 'Applied',
            jobDescription: '',
            applicationMethod: '',
        },
        onFormChange: mockOnFormChange,
        existingApplications: [],
        onCancel: mockOnCancel,
    };

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
});