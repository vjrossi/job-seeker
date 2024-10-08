import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './InterviewScheduleModal.css';
import { ApplicationStatus } from '../constants/ApplicationStatus';
import { getNextStatuses } from '../constants/applicationStatusMachine';

interface InterviewScheduleModalProps {
    show: boolean;
    onHide: () => void;
    onSchedule: (dateTime: string, status: ApplicationStatus) => void;
    currentStatus: ApplicationStatus;
}

const InterviewScheduleModal: React.FC<InterviewScheduleModalProps> = ({ show, onHide, onSchedule, currentStatus }) => {
    const [interviewDateTime, setInterviewDateTime] = useState('');

    useEffect(() => {
        console.log('InterviewScheduleModal rendered, show:', show);
    }, [show]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Scheduling interview for:', interviewDateTime);
        
        const nextStatuses = getNextStatuses(currentStatus);
        const interviewStatuses = [
            ApplicationStatus.InterviewScheduled,
            ApplicationStatus.SecondRoundScheduled,
            ApplicationStatus.ThirdRoundScheduled
        ];
        
        const newStatus = nextStatuses.find(status => interviewStatuses.includes(status));

        if (newStatus) {
            onSchedule(interviewDateTime, newStatus);
            onHide();
        } else {
            console.error('No valid interview status found');
            // You might want to show an error message to the user here
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