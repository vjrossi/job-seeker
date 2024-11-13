import React from 'react';
import { FaPencilAlt, FaTrashAlt, FaUndo, FaArrowRight, FaCalendarAlt, FaBoxOpen } from 'react-icons/fa';
import './CardActions.css';
import { ApplicationStatus } from '../../constants/ApplicationStatus';
import { JobApplication } from '../../types/JobApplication';

interface CardActionsProps {
  application: JobApplication;
  onEdit: (application: JobApplication, initialEditMode?: boolean) => void;
  onDelete: () => void;
  onUndo?: () => void;
  onStatusClick: () => void;
  onEditInterview?: () => void;
  hasNextStatuses: boolean;
  hasInterviewDetails: boolean;
  arrowButtonRef: React.RefObject<HTMLButtonElement>;
  undoButtonRef: React.RefObject<HTMLButtonElement>;
  isArchived?: boolean;
  currentStatus: ApplicationStatus;
  statusHistory: { status: ApplicationStatus; timestamp: string }[];
}

const CardActions: React.FC<CardActionsProps> = ({
  application,
  onEdit,
  onDelete,
  onUndo,
  onStatusClick,
  onEditInterview,
  hasNextStatuses,
  hasInterviewDetails,
  arrowButtonRef,
  undoButtonRef,
  isArchived,
  currentStatus,
  statusHistory
}) => {
  const isInitialStatus = currentStatus === ApplicationStatus.Bookmarked;
  const isFinalStatus = !hasNextStatuses;
  const showUndo = onUndo && !isArchived && !isInitialStatus && statusHistory.length > 1;
  const showProgress = hasNextStatuses && !isArchived && !isFinalStatus;

  return (
    <div className="card-actions">
      <div className="left-actions">
        <button 
          className="btn btn-link"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(application, true);
          }}
          disabled={isArchived}
        >
          <FaPencilAlt />
        </button>
        {hasInterviewDetails && onEditInterview && (
          <button 
            className="btn btn-link"
            onClick={(e) => {
              e.stopPropagation();
              onEditInterview();
            }}
            disabled={isArchived}
          >
            <FaCalendarAlt />
          </button>
        )}
        <button 
          className={`btn btn-link ${isArchived ? 'text-success' : 'text-danger'}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title={isArchived ? 'Unarchive' : 'Archive'}
        >
          {isArchived ? <FaBoxOpen /> : <FaTrashAlt />}
        </button>
      </div>
      <div className="right-actions">
        {showUndo && (
          <button 
            ref={undoButtonRef}
            className="btn btn-link"
            onClick={(e) => {
              e.stopPropagation();
              onUndo();
            }}
          >
            <FaUndo />
          </button>
        )}
        {showProgress && (
          <button
            ref={arrowButtonRef}
            className="btn btn-link"
            onClick={(e) => {
              e.stopPropagation();
              onStatusClick();
            }}
          >
            <FaArrowRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default CardActions; 