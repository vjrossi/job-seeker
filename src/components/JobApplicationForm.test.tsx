import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import JobApplicationForm from './JobApplicationForm';
import { JobApplication } from './JobApplicationTracker';

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
        render(<JobApplicationForm {...defaultProps} />);

        const statusInput = screen.getByLabelText('Status') as HTMLInputElement;
        expect(statusInput).toHaveValue('Applied');
        expect(statusInput).toHaveAttribute('readOnly');
    });
});