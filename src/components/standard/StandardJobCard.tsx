import React from 'react';
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaTrashAlt } from 'react-icons/fa';
import { JobApplication } from '../JobApplicationTracker';
import { ApplicationStatus } from '../../constants/ApplicationStatus';
import { getStatusSequence } from '../../constants/applicationStatusMachine';
import { METHOD_ICONS } from '../../constants/standardApplicationMethods';
import StarRating from '../shared/StarRating';
import './StandardJobCard.css';

interface StandardJobCardProps {
  application: JobApplication;
  onEdit: (application: JobApplication) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, newStatus: ApplicationStatus) => void;
  onUndo: (id: number) => void;
  tooltipVisibility: { [key: number]: boolean };
  onArchiveClick: (id: number) => void;
  onDisabledArchiveClick: (id: number) => void;
  onArchiveIconTouchStart: (id: number, e: React.TouchEvent) => void;
  onArchiveIconTouchEnd: () => void;
  onRatingChange: (applicationId: number, newRating: number) => void;
}

const StandardJobCard: React.FC<StandardJobCardProps> = ({
  application,
  onEdit,
  onDelete,
  onStatusChange,
  onUndo,
  tooltipVisibility,
  onArchiveClick,
  onDisabledArchiveClick,
  onArchiveIconTouchStart,
  onArchiveIconTouchEnd,
  onRatingChange
}) => {
  const currentStatus = application.statusHistory[application.statusHistory.length - 1].status;

  const renderMethodIcon = (method: string) => {
    const IconComponent = METHOD_ICONS[method as keyof typeof METHOD_ICONS] || METHOD_ICONS.Other;
    return (
      <span className="method-icon">
        <IconComponent />
      </span>
    );
  };

  return (
    <Card className="mb-3">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          {renderMethodIcon(application.applicationMethod)}
          <h4 
            className="company-name-link mb-0"
            onClick={() => onEdit(application)}
          >
            {application.companyName}
          </h4>
        </div>
        <div className="d-flex align-items-center gap-3">
          <StarRating 
            rating={application.rating} 
            onRatingChange={(newRating) => onRatingChange(application.id, newRating)}
            size="medium"
          />
          {application.archived ? (
            <OverlayTrigger
              placement="top"
              show={tooltipVisibility[application.id]}
              overlay={
                <Tooltip id={`tooltip-archive-${application.id}`}>
                  This application is already archived
                </Tooltip>
              }
            >
              <span>
                <FaTrashAlt 
                  className="archive-icon disabled"
                  onClick={() => onDisabledArchiveClick(application.id)}
                  role="button"
                  aria-label="Archive application (disabled)"
                />
              </span>
            </OverlayTrigger>
          ) : (
            <FaTrashAlt 
              className="archive-icon"
              onClick={(e) => {
                e.stopPropagation();
                onArchiveClick(application.id);
              }}
              onTouchStart={(e) => onArchiveIconTouchStart(application.id, e)}
              onTouchEnd={onArchiveIconTouchEnd}
              role="button"
              aria-label="Archive application"
            />
          )}
        </div>
      </Card.Header>
      <Card.Body>
        <div><strong>{application.jobTitle}</strong></div>
        <div className="status-timeline">
          {getStatusSequence(currentStatus).map((status: ApplicationStatus, index: number, sequence: ApplicationStatus[]) => (
            status === currentStatus ? (
              <div key={status} className="status-step active">
                {status}
              </div>
            ) : (
              <div 
                key={status} 
                className={`status-step ${
                  index < sequence.indexOf(currentStatus) ? 'completed' : ''
                }`}
              >
                {status}
              </div>
            )
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default StandardJobCard; 