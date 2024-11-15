import React from 'react';
import { Button } from 'react-bootstrap';
import { ApplicationStatus, APPLICATION_STATUSES } from '../../constants/ApplicationStatus';
import './FilterSection.css';

interface FilterSectionProps {
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  statusFilters: ApplicationStatus[];
  onStatusFilterChange: (status: ApplicationStatus) => void;
  isMobile?: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  showArchived,
  setShowArchived,
  statusFilters,
  onStatusFilterChange,
  isMobile = false
}) => {
  return (
    <div className="filter-section">
      <div className="archive-toggle mb-3">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => setShowArchived(!showArchived)}
          active={showArchived}
        >
          {showArchived ? 'Hide Archived' : 'Show Archived'}
        </Button>
      </div>

      <div className="status-filters">
        {APPLICATION_STATUSES.map(status => (
          <Button
            key={status}
            variant={statusFilters.includes(status) ? "primary" : "outline-primary"}
            onClick={() => onStatusFilterChange(status)}
            size="sm"
            className="filter-button text-nowrap"
          >
            {status}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FilterSection; 