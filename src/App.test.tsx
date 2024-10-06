import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import App from './App';

// Mock child components
jest.mock('./components/Header', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('./components/Footer', () => () => <div data-testid="mock-footer">Footer</div>);
jest.mock('./components/Sidebar', () => ({ onViewChange }: { onViewChange: (view: string) => void }) => (
  <div data-testid="mock-sidebar">
    <button onClick={() => onViewChange('dashboard')}>Dashboard</button>
    <button onClick={() => onViewChange('view')}>Job Applications</button>
    <button onClick={() => onViewChange('reports')}>Reports</button>
  </div>
));
jest.mock('./components/MainContent', () => ({ currentView }: { currentView: string }) => (
  <div data-testid="mock-main-content">Main Content: {currentView}</div>
));
jest.mock('./components/ConfirmationModal', () => ({ show, onClose, onConfirm }: { show: boolean, onClose: () => void, onConfirm: () => void }) => (
  show ? <div data-testid="mock-confirmation-modal">
    <button onClick={onClose}>Cancel</button>
    <button onClick={onConfirm}>Confirm</button>
  </div> : null
));

describe('App', () => {
  beforeEach(() => {
    render(<App />);
  });

  test('renders Header component', () => {
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
  });

  test('renders Footer component', () => {
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
  });

  test('renders Sidebar component', () => {
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
  });

  test('renders MainContent component', () => {
    expect(screen.getByTestId('mock-main-content')).toBeInTheDocument();
  });

  test('initially renders dashboard view', () => {
    expect(screen.getByText('Main Content: dashboard')).toBeInTheDocument();
  });

  test('changes view when sidebar buttons are clicked', () => {
    fireEvent.click(screen.getByText('Job Applications'));
    expect(screen.getByText('Main Content: view')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Reports'));
    expect(screen.getByText('Main Content: reports')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Dashboard'));
    expect(screen.getByText('Main Content: dashboard')).toBeInTheDocument();
  });

  test('confirmation modal is not initially visible', () => {
    expect(screen.queryByTestId('mock-confirmation-modal')).not.toBeInTheDocument();
  });

  // Note: Testing the confirmation modal functionality would require
  // simulating the form dirty state, which is managed in child components.
  // This would need more complex setup or integration tests.
});