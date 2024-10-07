import React from 'react';
import { JobApplication } from './JobApplicationTracker';
import { getNextStatuses } from '../constants/applicationStatusMachine';

interface ProgressModalProps {
  application: JobApplication;
  onClose: () => void;
  onConfirm: (newStatus: string) => void;
}

const statusToQuestionMap: { [key: string]: string } = {
  'Interview Scheduled': 'I got an interview!',
  'No Response': 'I haven\'t heard back yet',
  'Not Accepted': 'I wasn\'t accepted for the next stage',
  'Offer Received': 'I received a job offer!',
  'Offer Accepted': 'I accepted the job offer!',
  'Offer Declined': 'I declined the job offer',
  'Withdrawn': 'I have decided to withdraw my application',
  'Archived': 'I want to archive this application'
};

const ProgressModal: React.FC<ProgressModalProps> = ({ application, onClose, onConfirm }) => {
  const currentStatus = application.statusHistory[application.statusHistory.length - 1].status;
  const nextStatuses = getNextStatuses(currentStatus);

  return (
    <div className="modal d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Update Application Status</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>What has happened with this application?</p>
            {nextStatuses.map(status => (
              <button 
                key={status} 
                className="btn btn-outline-primary me-2 mb-2"
                onClick={() => onConfirm(status)}
              >
                {statusToQuestionMap[status] || status}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressModal;