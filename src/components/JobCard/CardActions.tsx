import React from 'react';
import { FaPencilAlt, FaTrashAlt, FaUndo, FaArrowRight, FaCalendarAlt, FaBoxOpen } from 'react-icons/fa';
import './CardActions.css';

interface CardActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  onUndo?: () => void;
  onStatusClick: () => void;
  onEditInterview?: () => void;
  hasNextStatuses: boolean;
  hasInterviewDetails: boolean;
  arrowButtonRef: React.RefObject<HTMLButtonElement>;
  undoButtonRef: React.RefObject<HTMLButtonElement>;
  isArchived?: boolean;
}

const CardActions: React.FC<CardActionsProps> = ({
  onEdit,
  onDelete,
  onUndo,
  onStatusClick,
  onEditInterview,
  hasNextStatuses,
  hasInterviewDetails,
  arrowButtonRef,
  undoButtonRef,
  isArchived
}) => {
  return (
    <div className="card-actions">
      <div className="left-actions">
        <button 
          className="btn btn-link"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
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
        {onUndo && (
          <button 
            ref={undoButtonRef}
            className="btn btn-link"
            onClick={(e) => {
              e.stopPropagation();
              onUndo();
            }}
            disabled={isArchived}
          >
            <FaUndo />
          </button>
        )}
        {hasNextStatuses && (
          <button
            ref={arrowButtonRef}
            className="btn btn-link"
            onClick={(e) => {
              e.stopPropagation();
              onStatusClick();
            }}
            disabled={isArchived}
          >
            <FaArrowRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default CardActions; 