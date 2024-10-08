import React, { useState } from 'react';
import './Tooltip.css';

interface TooltipProps {
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="tooltip-container">
      <span 
        className="tooltip-trigger"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        aria-label="More information"
      >
        <span className="tooltip-icon">?</span>
      </span>
      {isVisible && <span className="tooltip-text">{text}</span>}
    </span>
  );
};

export default Tooltip;