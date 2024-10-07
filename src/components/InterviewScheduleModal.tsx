import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './InterviewScheduleModal.css';

interface InterviewScheduleModalProps {
    show: boolean;
    onHide: () => void;
    onSchedule: (dateTime: string) => void;
}

const InterviewScheduleModal: React.FC<InterviewScheduleModalProps> = ({ show, onHide, onSchedule }) => {
    const [interviewDateTime, setInterviewDateTime] = useState('');

    useEffect(() => {
        console.log('InterviewScheduleModal rendered, show:', show);
    }, [show]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Scheduling interview for:', interviewDateTime);
        onSchedule(interviewDateTime);
        onHide();
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