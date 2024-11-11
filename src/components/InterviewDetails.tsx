import React, { useState } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa';

interface InterviewDetailsProps {
  interviewDateTime: string;
  interviewLocation?: string;
}

const formatTimeUntilInterview = (interviewDateTime: string): string => {
  const now = new Date();
  const interviewDate = new Date(interviewDateTime);
  const diffHours = Math.ceil((interviewDate.getTime() - now.getTime()) / (1000 * 60 * 60));
  const diffDays = Math.floor(Math.abs(diffHours) / 24);

  if (diffHours < 0) {
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    return `${diffDays} days ago`;
  }
  
  if (diffHours < 24) return 'today';
  if (diffDays === 1) return 'tomorrow';
  return `in ${diffDays} days`;
};

const InterviewDetails: React.FC<InterviewDetailsProps> = ({
  interviewDateTime,
  interviewLocation
}) => {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const timeUntil = formatTimeUntilInterview(interviewDateTime);
  const isPast = new Date(interviewDateTime) < new Date();

  return (
    <div className="interview-details">
      <h4 
        onClick={(e) => {
          e.stopPropagation();
          setDetailsExpanded(!detailsExpanded);
        }}
        className="interview-header"
      >
        <span>INTERVIEW </span>
        <span style={{ color: isPast ? '#dc3545' : 'inherit' }}>{timeUntil}</span>
        <FaChevronDown 
          size={12} 
          style={{ 
            marginLeft: '1rem',
            transform: detailsExpanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease'
          }} 
        />
      </h4>
      <div 
        className="datetime-container" 
        style={{ 
          maxHeight: detailsExpanded ? '500px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
          opacity: detailsExpanded ? 1 : 0
        }}
      >
        <div className="datetime-row">
          <FaCalendarAlt className="datetime-icon" />
          <div className="date">
            {new Date(interviewDateTime).toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
        <div className="datetime-row">
          <FaClock className="datetime-icon" />
          <div className="time">
            {new Date(interviewDateTime).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit'
            })}
          </div>
        </div>
        {interviewLocation && (
          <div className="datetime-row">
            <FaMapMarkerAlt className="datetime-icon" />
            <div className="location">
              {interviewLocation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewDetails; 