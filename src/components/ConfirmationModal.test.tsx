import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ConfirmationModal from './ConfirmationModal';

describe('ConfirmationModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  const testMessage = 'Are you sure you want to proceed?';

  const defaultProps = {
    show: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    message: testMessage,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing when show is false', () => {
    render(<ConfirmationModal {...defaultProps} show={false} />);
    expect(screen.queryByText('Confirmation')).not.toBeInTheDocument();
  });

  test('renders modal when show is true', () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByText('Confirmation')).toBeInTheDocument();
    expect(screen.getByText(testMessage)).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    render(<ConfirmationModal {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when Cancel button is clicked', () => {
    render(<ConfirmationModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls onConfirm when Confirm button is clicked', () => {
    render(<ConfirmationModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Confirm'));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  test('renders custom message', () => {
    const customMessage = 'Custom confirmation message';
    render(<ConfirmationModal {...defaultProps} message={customMessage} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });
});