import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

export type InterviewLocationType = 'Zoom' | 'Teams' | 'Phone' | 'In Person' | 'Other';

interface InterviewDetailsModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: (details: {
    dateTime: string;
    locationType: InterviewLocationType;
    location: string;
  }) => void;
}

const InterviewDetailsModal: React.FC<InterviewDetailsModalProps> = ({
  show,
  onHide,
  onConfirm,
}) => {
  const [dateTime, setDateTime] = useState('');
  const [locationType, setLocationType] = useState<InterviewLocationType>('Zoom');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      dateTime,
      locationType,
      location: locationType === 'In Person' ? location : locationType,
    });
    onHide();
  };
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Interview Details</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Date and Time</Form.Label>
            <Form.Control
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Interview Type</Form.Label>
            <Form.Select
              value={locationType}
              onChange={(e) => setLocationType(e.target.value as InterviewLocationType)}
              required
            >
              <option value="Zoom">Zoom</option>
              <option value="Teams">Microsoft Teams</option>
              <option value="Phone">Phone</option>
              <option value="In Person">In Person</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Form.Group>
          {locationType === 'In Person' && (
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter the interview location address"
                required
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Confirm
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default InterviewDetailsModal; 