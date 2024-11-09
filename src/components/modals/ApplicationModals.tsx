import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ApplicationModalsProps {
  showArchiveModal: boolean;
  showDeleteModal: boolean;
  onArchiveHide: () => void;
  onDeleteHide: () => void;
  onArchiveConfirm: () => void;
  onDeleteConfirm: () => void;
}

const ApplicationModals: React.FC<ApplicationModalsProps> = ({
  showArchiveModal,
  showDeleteModal,
  onArchiveHide,
  onDeleteHide,
  onArchiveConfirm,
  onDeleteConfirm
}) => {
  return (
    <>
      <Modal show={showArchiveModal} onHide={onArchiveHide}>
        <Modal.Header closeButton>
          <Modal.Title>Archive Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          The application will be archived. You can recover it at any time.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onArchiveHide}>Cancel</Button>
          <Button variant="danger" onClick={onArchiveConfirm}>Archive</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={onDeleteHide}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Warning: This will permanently delete this application and all its history. This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onDeleteHide}>Cancel</Button>
          <Button variant="danger" onClick={onDeleteConfirm}>Delete Permanently</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ApplicationModals; 