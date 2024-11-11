import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ConfirmationModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  triggerElement?: HTMLElement | null;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  show,
  onClose,
  onConfirm,
  message,
  triggerElement
}) => {
  return (
    <Modal 
      show={show} 
      onHide={onClose}
      size="sm"
      aria-labelledby="confirmation-modal"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="confirmation-modal">Confirm Action</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={onConfirm}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;