import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './InterviewScheduleModal.css';
import { ApplicationStatus } from '../constants/ApplicationStatus';
import { getNextStatuses } from '../constants/applicationStatusMachine';

interface InterviewScheduleModalProps {
    show: boolean;
    onHide: () => void;
    onSchedule: (dateTime: string, status: ApplicationStatus, location: string) => void;
    currentStatus: ApplicationStatus;
    interviewHistory: { status: ApplicationStatus; timestamp: string }[];
}

const InterviewScheduleModal: React.FC<InterviewScheduleModalProps> = ({ 
    show, 
    onHide, 
    onSchedule, 
    currentStatus, 
    interviewHistory 
}) => {
    const [interviewDate, setInterviewDate] = useState('');
    const [interviewTime, setInterviewTime] = useState('');
    const [interviewLocation, setInterviewLocation] = useState('');
    const [error, setError] = useState<string | null>(null);

    const validateInterviewDate = (date: string, time: string): string | null => {
        const dateTime = new Date(`${date}T${time}`);
        const now = new Date();

        if (dateTime <= now) {
            return "Interview date and time must be in the future.";
        }

        const previousInterviews = interviewHistory.filter(interview => 
            interview.status === ApplicationStatus.InterviewScheduled
        );

        for (const interview of previousInterviews) {
            const interviewDate = new Date(interview.timestamp);
            if (dateTime.toDateString() === interviewDate.toDateString()) {
                return `Cannot schedule another interview on the same day.`;
            }
        }

        return null;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const nextStatuses = getNextStatuses(currentStatus);
        const interviewStatuses = [ApplicationStatus.InterviewScheduled];
        
        const newStatus = nextStatuses.find(status => interviewStatuses.includes(status));

        if (newStatus) {
            const validationError = validateInterviewDate(interviewDate, interviewTime);
            if (validationError) {
                setError(validationError);
            } else {
                const dateTime = `${interviewDate}T${interviewTime}`;
                onSchedule(dateTime, newStatus, interviewLocation);
                onHide();
            }
        } else {
            setError('No valid interview status found');
        }
    };

    if (!show) return null;

    return ReactDOM.createPortal(
        <div className="interview-modal-overlay">
            <div className="interview-modal-content">
                <h2>Schedule Interview</h2>
                <form onSubmit={handleSubmit}>
                    <div className="interview-form-group">
                        <label htmlFor="interviewDate">Interview Date:</label>
                        <input
                            type="date"
                            id="interviewDate"
                            value={interviewDate}
                            onChange={(e) => setInterviewDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="interview-form-group">
                        <label htmlFor="interviewTime">Interview Time:</label>
                        <input
                            type="time"
                            id="interviewTime"
                            value={interviewTime}
                            onChange={(e) => setInterviewTime(e.target.value)}
                            required
                        />
                    </div>
                    <div className="interview-form-group">
                        <label htmlFor="interviewLocation">Location:</label>
                        <input
                            type="text"
                            id="interviewLocation"
                            value={interviewLocation}
                            onChange={(e) => setInterviewLocation(e.target.value)}
                            placeholder="e.g., Zoom link, Office address"
                            required
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <div className="interview-modal-buttons">
                        <button type="button" onClick={onHide}>Cancel</button>
                        <button type="submit">Schedule</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default InterviewScheduleModal;