import React from 'react';
import { Badge } from 'react-bootstrap';
import { FaHistory } from 'react-icons/fa';
import StarRating from '../shared/StarRating';
import { formatStatus, formatTimeSince, getStatusStyle } from '../../utils/jobCardUtils';
import { ApplicationStatus } from '../../constants/ApplicationStatus';
import './CardHeader.css';

interface CardHeaderProps {
  companyName: string;
  jobTitle: string;
  rating: number;
  onRatingChange: (rating: number) => void;
  currentStatus: ApplicationStatus;
  statusHistory: { status: ApplicationStatus; timestamp: string }[];
}

const CardHeader: React.FC<CardHeaderProps> = ({
  companyName,
  jobTitle,
  rating,
  onRatingChange,
  currentStatus,
  statusHistory
}) => {
  const statusStyle = getStatusStyle(currentStatus);

  return (
    <div className="card-header">
      <div className="header-content">
        <h2 className="company-name">{companyName}</h2>
        <h3 className="job-title">{jobTitle}</h3>
        <StarRating 
          rating={rating}
          onRatingChange={onRatingChange}
          size="medium"
        />
      </div>
      <div className="status-section">
        <Badge
          className="status-badge"
          bg="white"
          style={{
            color: statusStyle.color,
            border: `1px solid ${statusStyle.borderColor}`,
            fontWeight: '500',
            letterSpacing: '0.3px',
            minWidth: '120px',
            maxHeight: '4.8em',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            lineHeight: '1.2'
          }}
        >
          {formatStatus(currentStatus, statusHistory)}
        </Badge>
        <div className="time-since">
          <FaHistory className="time-since-icon" />
          <span>{formatTimeSince(statusHistory[statusHistory.length - 1].timestamp)}</span>
        </div>
      </div>
    </div>
  );
};

export default CardHeader; 