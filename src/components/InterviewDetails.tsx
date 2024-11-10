import React, { useState } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa';

interface InterviewDetailsProps {
  interviewDateTime: string;
  interviewLocation?: string;
}

const InterviewDetails: React.FC<InterviewDetailsProps> = ({
  interviewDateTime,
  interviewLocation
}) => {
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  return (
    <div className="interview-details">
      <h4 
        onClick={(e) => {
          e.stopPropagation();
          setDetailsExpanded(!detailsExpanded);
        }}
        className="interview-header"
      >
        <span>UPCOMING INTERVIEW</span>
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