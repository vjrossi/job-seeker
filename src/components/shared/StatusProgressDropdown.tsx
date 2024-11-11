import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaArrowRight } from 'react-icons/fa';
import { ApplicationStatus } from '../../constants/ApplicationStatus';
import { getNextStatuses } from '../../constants/applicationStatusMachine';

interface StatusProgressDropdownProps {
  currentStatus: ApplicationStatus;
  onStatusChange: (newStatus: ApplicationStatus) => void;
  buttonClassName?: string;
}

const StatusProgressDropdown: React.FC<StatusProgressDropdownProps> = ({
  currentStatus,
  onStatusChange,
  buttonClassName = 'btn btn-link'
}) => {
  const nextStatuses = getNextStatuses(currentStatus);

  return (
    <Dropdown>
      <Dropdown.Toggle as="button" className={buttonClassName}>
        <FaArrowRight />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Header>What has happened with this application?</Dropdown.Header>
        {nextStatuses.map((nextStatus) => (
          <Dropdown.Item 
            key={nextStatus}
            onClick={() => onStatusChange(nextStatus)}
          >
            {nextStatus === ApplicationStatus.InterviewScheduled ? "I got an interview!" :
             nextStatus === ApplicationStatus.OfferReceived ? "I received a job offer!" :
             nextStatus === ApplicationStatus.OfferAccepted ? "I accepted the job offer!" :
             nextStatus === ApplicationStatus.OfferDeclined ? "I declined the job offer" :
             nextStatus === ApplicationStatus.NoResponse ? "No Response" :
             nextStatus === ApplicationStatus.NotAccepted ? "I wasn't accepted" :
             nextStatus === ApplicationStatus.Withdrawn ? "I have decided to withdraw my application" :
             nextStatus}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default StatusProgressDropdown; 