import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

interface InterviewScheduleModalProps {
  show: boolean;
  onHide: () => void;
  onSchedule: (dateTime: string) => void;
}

const InterviewScheduleModal: React.FC<InterviewScheduleModalProps> = ({ show, onHide, onSchedule }) => {
  const [interviewDateTime, setInterviewDateTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSchedule(interviewDateTime);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Schedule Interview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label>Interview Date and Time</Form.Label>
            <Form.Control
              type="datetime-local"
              value={interviewDateTime}
              onChange={(e) => setInterviewDateTime(e.target.value)}
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Schedule
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InterviewScheduleModal;