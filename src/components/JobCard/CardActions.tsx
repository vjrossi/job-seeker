import React from 'react';
import { FaPencilAlt, FaTrashAlt, FaUndo, FaArrowRight } from 'react-icons/fa';

interface CardActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  onUndo?: () => void;
  onStatusClick: () => void;
  hasNextStatuses: boolean;
  arrowButtonRef: React.RefObject<HTMLButtonElement>;
}

const CardActions: React.FC<CardActionsProps> = ({
  onEdit,
  onDelete,
  onUndo,
  onStatusClick,
  hasNextStatuses,
  arrowButtonRef
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
        >
          <FaPencilAlt />
        </button>
        <button 
          className="btn btn-link text-danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <FaTrashAlt />
        </button>
      </div>
      <div className="right-actions">
        {onUndo && (
          <button 
            className="btn btn-link"
            onClick={(e) => {
              e.stopPropagation();
              onUndo();
            }}
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
          >
            <FaArrowRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default CardActions; 