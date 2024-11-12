import React, { useState, useEffect, useRef } from 'react';
import { ApplicationStatus } from '../../constants/ApplicationStatus';
import { getNextStatuses } from '../../constants/applicationStatusMachine';
import './JobCard.css';
import InterviewDetailsModal, { InterviewLocationType } from '../modals/InterviewDetailsModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import StatusDropdown from '../StatusDropdown';
import InterviewDetails from '../InterviewDetails';
import { JobApplication } from '../../types/JobApplication';
import CardHeader from './CardHeader';
import CardActions from './CardActions';
import { needsAttention } from '../../utils/applicationUtils';
import { FaExclamationTriangle } from 'react-icons/fa';

interface JobCardProps {
  application: JobApplication;
  onEdit: (application: JobApplication) => void;
  onDelete: (id: number) => void;
  onUnarchive?: (id: number) => void;
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
  onUnarchive,
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
  const [showEditInterviewModal, setShowEditInterviewModal] = useState(false);
  
  const arrowButtonRef = useRef<HTMLButtonElement>(null);
  const undoButtonRef = useRef<HTMLButtonElement>(null);
  const isExpanded = expandedId === application.id;

  const currentStatusEntry = application.statusHistory[application.statusHistory.length - 1];
  const hasInterviewDetails = !!currentStatusEntry.interviewDateTime;

  const attention = needsAttention(application);

  const handleEditInterview = () => {
    setShowEditInterviewModal(true);
  };

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
        className={`job-card ${isExpanded ? 'actions-visible' : ''} ${attention.needs ? 'needs-attention' : ''}`}
        data-status={application.statusHistory[application.statusHistory.length - 1].status}
        data-archived={application.archived || false}
        onClick={handleCardClick}
      >
        {attention.needs && (
          <div className="attention-indicator" title={attention.reason}>
            <FaExclamationTriangle />
          </div>
        )}
        <CardHeader
          companyName={application.companyName}
          jobTitle={application.jobTitle}
          rating={application.rating}
          onRatingChange={(rating) => onRatingChange(application.id, rating)}
          currentStatus={currentStatus}
          statusHistory={application.statusHistory}
        />

        {hasInterviewDetails && (
          <InterviewDetails
            interviewDateTime={currentStatusEntry.interviewDateTime!}
            interviewLocation={currentStatusEntry.interviewLocation}
          />
        )}

        <div className="action-indicator">
          <div className="indicator-line" />
        </div>

        <CardActions
          onEdit={() => onEdit(application)}
          onDelete={() => onDelete(application.id)}
          onUndo={onUndo ? () => {
            setShowUndoConfirmation(true);
          } : undefined}
          onStatusClick={() => setDropdownOpen(!dropdownOpen)}
          onEditInterview={hasInterviewDetails ? handleEditInterview : undefined}
          hasNextStatuses={nextStatuses.length > 0}
          hasInterviewDetails={hasInterviewDetails}
          arrowButtonRef={arrowButtonRef}
          undoButtonRef={undoButtonRef}
          isArchived={application.archived}
          currentStatus={currentStatus}
          statusHistory={application.statusHistory}
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
        show={showInterviewModal || showEditInterviewModal}
        onHide={() => {
          setShowInterviewModal(false);
          setShowEditInterviewModal(false);
          setPendingStatus(null);
        }}
        onConfirm={(details) => {
          if (showEditInterviewModal) {
            onStatusChange(application.id, currentStatus, {
              interviewDateTime: details.dateTime,
              interviewLocation: details.location,
              interviewType: details.locationType,
            });
          } else if (pendingStatus === ApplicationStatus.InterviewScheduled) {
            onStatusChange(application.id, pendingStatus, {
              interviewDateTime: details.dateTime,
              interviewLocation: details.location,
              interviewType: details.locationType,
            });
          }
          setShowInterviewModal(false);
          setShowEditInterviewModal(false);
          setPendingStatus(null);
        }}
        initialDateTime={currentStatusEntry.interviewDateTime}
        initialLocation={currentStatusEntry.interviewLocation}
        initialLocationType={currentStatusEntry.interviewType}
        isEditing={showEditInterviewModal}
      />

      <ConfirmationModal
        show={showUndoConfirmation}
        onClose={() => setShowUndoConfirmation(false)}
        onConfirm={handleUndoConfirm}
        message="Are you sure you want to undo the last status change?"
        triggerElement={undoButtonRef.current}
      />
    </>
  );
};

export default JobCard;
