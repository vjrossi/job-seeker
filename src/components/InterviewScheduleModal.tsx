import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './InterviewScheduleModal.css';
import { ApplicationStatus } from '../constants/ApplicationStatus';
import { getNextStatuses } from '../constants/applicationStatusMachine';

interface InterviewScheduleModalProps {
    show: boolean;
    onHide: () => void;
    onSchedule: (dateTime: string, status: ApplicationStatus) => void;
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
    const [interviewDateTime, setInterviewDateTime] = useState('');
    const [error, setError] = useState<string | null>(null);

    const validateInterviewDate = (dateTime: string, newStatus: ApplicationStatus): string | null => {
        const newDate = new Date(dateTime);
        const now = new Date();

        if (newDate <= now) {
            return "Interview date must be in the future.";
        }

        if (newStatus === ApplicationStatus.SecondRoundScheduled || newStatus === ApplicationStatus.ThirdRoundScheduled) {
            const previousInterviews = interviewHistory.filter(interview => 
                interview.status === ApplicationStatus.InterviewScheduled || 
                interview.status === ApplicationStatus.SecondRoundScheduled
            );

            for (const interview of previousInterviews) {
                const interviewDate = new Date(interview.timestamp);
                if (newDate.toDateString() === interviewDate.toDateString()) {
                    return `Cannot schedule ${newStatus} on the same day as a previous interview.`;
                }
            }
        }

        return null;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const nextStatuses = getNextStatuses(currentStatus);
        const interviewStatuses = [
            ApplicationStatus.InterviewScheduled,
            ApplicationStatus.SecondRoundScheduled,
            ApplicationStatus.ThirdRoundScheduled
        ];
        
        const newStatus = nextStatuses.find(status => interviewStatuses.includes(status));

        if (newStatus) {
            const validationError = validateInterviewDate(interviewDateTime, newStatus);
            if (validationError) {
                setError(validationError);
            } else {
                onSchedule(interviewDateTime, newStatus);
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
                        <label htmlFor="interviewDateTime">Interview Date and Time:</label>
                        <input
                            type="datetime-local"
                            id="interviewDateTime"
                            value={interviewDateTime}
                            onChange={(e) => setInterviewDateTime(e.target.value)}
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