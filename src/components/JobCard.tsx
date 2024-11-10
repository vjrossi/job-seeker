import React, { useState, useEffect, useRef } from 'react';
import { ApplicationStatus } from '../constants/ApplicationStatus';
import { getNextStatuses } from '../constants/applicationStatusMachine';
import './JobCard.css';
import InterviewDetailsModal, { InterviewLocationType } from './InterviewDetailsModal';
import ConfirmationModal from './ConfirmationModal';
import StatusDropdown from './StatusDropdown';
import InterviewDetails from './InterviewDetails';
import { JobApplication } from './JobApplicationTracker';
import CardHeader from './JobCard/CardHeader';
import CardActions from './JobCard/CardActions';

interface JobCardProps {
  application: JobApplication;
  onEdit: (application: JobApplication) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, newStatus: ApplicationStatus, details?: { 
    interviewDateTime?: string; 
    interviewLocation?: string; 
    interviewType?: InterviewLocationType 
  }) => void;
  onUndo?: (id: number) => void;
  expandedId: number | null;
  onExpand: (id: number) => void;
  onRatingChange: (applicationId: number, newRating: number) => void;
}

const JobCard: React.FC<JobCardProps> = ({
  application,
  onEdit,
  onDelete,
  onStatusChange,
  onUndo,
  expandedId,
  onExpand,
  onRatingChange
}) => {
  const currentStatus = application.statusHistory[application.statusHistory.length - 1].status;
  const nextStatuses = getNextStatuses(currentStatus);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(null);
  const [showUndoConfirmation, setShowUndoConfirmation] = useState(false);
  
  const arrowButtonRef = useRef<HTMLButtonElement>(null);
  const isExpanded = expandedId === application.id;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen && arrowButtonRef.current && !arrowButtonRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleCardClick = (e: React.MouseEvent) => {
    if (!(e.target instanceof HTMLElement)) return;
    if (!e.target.closest('.action-indicator')) return;
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.dropdown')) return;
    onExpand(application.id);
  };

  const handleUndoConfirm = () => {
    if (onUndo) {
      onUndo(application.id);
    }
    setShowUndoConfirmation(false);
  };

  return (
    <>
      <div 
        className={`job-card ${isExpanded ? 'actions-visible' : ''}`}
        onClick={handleCardClick}
      >
        <CardHeader
          companyName={application.companyName}
          jobTitle={application.jobTitle}
          rating={application.rating}
          onRatingChange={(rating) => onRatingChange(application.id, rating)}
          currentStatus={currentStatus}
          statusHistory={application.statusHistory}
        />

        {application.statusHistory[application.statusHistory.length - 1].interviewDateTime && (
          <InterviewDetails
            interviewDateTime={application.statusHistory[application.statusHistory.length - 1].interviewDateTime!}
            interviewLocation={application.statusHistory[application.statusHistory.length - 1].interviewLocation}
          />
        )}

        <div className="action-indicator">
          <div className="indicator-line" />
        </div>

        <CardActions
          onEdit={() => onEdit(application)}
          onDelete={() => onDelete(application.id)}
          onUndo={onUndo ? () => setShowUndoConfirmation(true) : undefined}
          onStatusClick={() => setDropdownOpen(!dropdownOpen)}
          hasNextStatuses={nextStatuses.length > 0}
          arrowButtonRef={arrowButtonRef}
        />
      </div>
      
      <StatusDropdown
        isOpen={dropdownOpen}
        onClose={() => setDropdownOpen(false)}
        buttonRef={arrowButtonRef}
        nextStatuses={nextStatuses}
        onStatusChange={(status) => onStatusChange(application.id, status)}
        onInterviewSchedule={(status) => {
          setPendingStatus(status);
          setShowInterviewModal(true);
        }}
        application={application}
      />

      <InterviewDetailsModal
        show={showInterviewModal}
        onHide={() => {
          setShowInterviewModal(false);
          setPendingStatus(null);
        }}
        onConfirm={(details) => {
          if (pendingStatus === ApplicationStatus.InterviewScheduled) {
            onStatusChange(application.id, pendingStatus, {
              interviewDateTime: details.dateTime,
              interviewLocation: details.location,
              interviewType: details.locationType,
            });
          }
          setShowInterviewModal(false);
          setPendingStatus(null);
        }}
      />

      <ConfirmationModal
        show={showUndoConfirmation}
        onClose={() => setShowUndoConfirmation(false)}
        onConfirm={handleUndoConfirm}
        message="Are you sure you want to undo the last status change?"
      />
    </>
  );
};

export default JobCard;
