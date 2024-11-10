import React, { useEffect, useState } from 'react';
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
  const [modalStyle, setModalStyle] = useState({});
  const [isPositioned, setIsPositioned] = useState(false);

  useEffect(() => {
    if (triggerElement) {
      const buttonRect = triggerElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const modalWidth = 280;
      const modalHeight = 200;
      
      let top = buttonRect.bottom + 10;
      if (top + modalHeight > viewportHeight - 10) {
        top = buttonRect.top - modalHeight - 10;
      }
      
      let left = buttonRect.left + (buttonRect.width / 2) - (modalWidth / 2);
      left = Math.max(10, Math.min(left, viewportWidth - modalWidth - 10));
      
      setModalStyle({
        position: 'fixed',
        top: `${Math.max(10, top)}px`,
        left: `${left}px`,
        width: `${modalWidth}px`
      });
      setIsPositioned(true);
    } else {
      setModalStyle({});
      setIsPositioned(false);
    }
  }, [triggerElement]);

  if (!isPositioned && triggerElement) {
    return null;
  }

  return (
    <Modal 
      show={show}
      onHide={onClose}
      size="sm"
      centered={!triggerElement}
      style={modalStyle}
      dialogClassName="confirmation-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-0">{message}</p>
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