// useProgressModal.ts
import { useState } from 'react';
import { JobApplication } from '../components/JobApplicationTracker';

export const useProgressModal = (onStatusChange: (id: number, newStatus: string) => void) => {
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);

  const handleProgressClick = (application: JobApplication) => {
    setSelectedApplication(application);
    setShowProgressModal(true);
  };

  const handleClose = () => setShowProgressModal(false);

  const handleConfirm = (newStatus: string) => {
    if (selectedApplication) {
      onStatusChange(selectedApplication.id, newStatus);
      setShowProgressModal(false);
    }
  };

  return {
    showProgressModal,
    selectedApplication,
    handleProgressClick,
    handleClose,
    handleConfirm
  };
};