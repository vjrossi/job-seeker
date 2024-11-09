import React from 'react';
import { Form, Badge } from 'react-bootstrap';
import { ApplicationStatus, APPLICATION_STATUSES } from '../../constants/ApplicationStatus';

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
    <>
      <Form.Group className="mb-3">
        <Form.Check
          type="switch"
          id={isMobile ? "mobileActiveSwitch" : "desktopActiveSwitch"}
          label={showArchived ? 'Showing All Applications' : 'Hiding Archived Applications'}
          checked={showArchived}
          onChange={() => setShowArchived(!showArchived)}
        />
      </Form.Group>

      {isMobile ? (
        <div className="filter-chips">
          {(showArchived ? APPLICATION_STATUSES : APPLICATION_STATUSES.filter(s => s !== ApplicationStatus.Archived))
            .map((status: ApplicationStatus) => (
              <Badge
                key={status}
                bg={statusFilters.includes(status) ? "primary" : "light"}
                text={statusFilters.includes(status) ? "white" : "dark"}
                className="filter-chip"
                onClick={() => onStatusFilterChange(status)}
              >
                {status}
              </Badge>
            ))}
        </div>
      ) : (
        <div className="mb-3">
          <h5>Filter by Status:</h5>
          <div className="btn-group flex-wrap" role="group">
            {APPLICATION_STATUSES
              .filter((status: ApplicationStatus) => showArchived || status !== ApplicationStatus.Archived)
              .map((status: ApplicationStatus) => (
                <button
                  key={status}
                  className={`btn btn-sm me-2 ${statusFilters.includes(status) ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => onStatusFilterChange(status)}
                >
                  {status}
                </button>
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSection; 