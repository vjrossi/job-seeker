import React from 'react';
import { Toast as BootstrapToast } from 'react-bootstrap';

interface ToastProps {
  show: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ show, message, type, onClose }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 1050
      }}
    >
      <BootstrapToast 
        show={show} 
        onClose={onClose} 
        delay={3000} 
        autohide
        bg={type === 'success' ? 'success' : 'danger'}
        className="text-white"
      >
        <BootstrapToast.Body>{message}</BootstrapToast.Body>
      </BootstrapToast>
    </div>
  );
};

export default Toast; 