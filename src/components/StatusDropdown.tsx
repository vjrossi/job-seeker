import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ApplicationStatus } from '../constants/ApplicationStatus';
import { JobApplication } from '../types/JobApplication';

interface StatusDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
  nextStatuses: ApplicationStatus[];
  onStatusChange: (status: ApplicationStatus) => void;
  onInterviewSchedule: (status: ApplicationStatus) => void;
  application: JobApplication;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  isOpen,
  onClose,
  buttonRef,
  nextStatuses,
  onStatusChange,
  onInterviewSchedule,
  application
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const shouldShowAbove = spaceBelow < dropdownHeight + 10;
      
      setPosition({
        top: shouldShowAbove 
          ? buttonRect.top + window.scrollY - dropdownHeight - 5
          : buttonRect.bottom + window.scrollY + 5,
        left: buttonRect.left + window.scrollX - dropdownRef.current.offsetWidth + buttonRect.width,
      });
    }
  }, [isOpen, buttonRef]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={dropdownRef}
      className="status-dropdown-portal"
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="dropdown-header">
        What has happened with this application?
      </div>
      {nextStatuses.map((nextStatus) => (
        <button
          key={nextStatus}
          className="dropdown-item"
          type="button"
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (nextStatus === ApplicationStatus.InterviewScheduled) {
              onInterviewSchedule(nextStatus);
            } else {
              onStatusChange(nextStatus);
            }
            onClose();
          }}
        >
          <div>
            {nextStatus === ApplicationStatus.ApplicationReceived ? "My application has been received" :
              nextStatus === ApplicationStatus.InterviewScheduled ? 
                (application.statusHistory.some(h => h.status === ApplicationStatus.InterviewScheduled) 
                  ? "I got another interview!" 
                  : "I got an interview!") :
              nextStatus === ApplicationStatus.OfferReceived ? "I received a job offer!" :
              nextStatus === ApplicationStatus.OfferAccepted ? "I accepted the job offer!" :
              nextStatus === ApplicationStatus.OfferDeclined ? "I declined the job offer" :
              nextStatus === ApplicationStatus.NoResponse ? "No Response" :
              nextStatus === ApplicationStatus.NotAccepted ? "I wasn't accepted" :
              nextStatus === ApplicationStatus.Withdrawn ? "I have decided to withdraw my application" :
              nextStatus}
          </div>
        </button>
      ))}
    </div>,
    document.body
  );
};

export default StatusDropdown; 