import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

export type InterviewLocationType = 'Zoom' | 'Teams' | 'Phone' | 'In Person' | 'Other';

export const InterviewLocationTypes = {
  Zoom: 'Zoom' as InterviewLocationType,
  Teams: 'Teams' as InterviewLocationType,
  Phone: 'Phone' as InterviewLocationType,
  InPerson: 'In Person' as InterviewLocationType,
  Other: 'Other' as InterviewLocationType,
} as const;

interface InterviewDetailsModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: (details: { dateTime: string; location: string; locationType: InterviewLocationType }) => void;
  initialDateTime?: string;
  initialLocation?: string;
  initialLocationType?: InterviewLocationType;
  isEditing?: boolean;
}

const InterviewDetailsModal: React.FC<InterviewDetailsModalProps> = ({
  show,
  onHide,
  onConfirm,
  initialDateTime,
  initialLocation,
  initialLocationType,
  isEditing
}) => {
  const [dateTime, setDateTime] = useState(initialDateTime || '');
  const [location, setLocation] = useState(initialLocation || '');
  const [locationType, setLocationType] = useState<InterviewLocationType>(
    initialLocationType || InterviewLocationTypes.InPerson
  );

  useEffect(() => {
    if (show) {
      setDateTime(initialDateTime || '');
      setLocation(initialLocation || '');
      setLocationType(initialLocationType || InterviewLocationTypes.InPerson);
    }
  }, [show, initialDateTime, initialLocation, initialLocationType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      dateTime,
      locationType,
      location: locationType === InterviewLocationTypes.InPerson ? location : locationType,
    });
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide}
      size="sm"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? 'Edit Interview Details' : 'Schedule Interview'}</Modal.Title>
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
              className="form-control-sm"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Interview Type</Form.Label>
            <Form.Select
              value={locationType}
              onChange={(e) => setLocationType(e.target.value as InterviewLocationType)}
              required
              className="form-select-sm"
            >
              <option value={InterviewLocationTypes.Zoom}>Zoom</option>
              <option value={InterviewLocationTypes.Teams}>Microsoft Teams</option>
              <option value={InterviewLocationTypes.Phone}>Phone</option>
              <option value={InterviewLocationTypes.InPerson}>In Person</option>
              <option value={InterviewLocationTypes.Other}>Other</option>
            </Form.Select>
          </Form.Group>
          {locationType === InterviewLocationTypes.InPerson && (
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter the interview location address"
                required
                className="form-control-sm"
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Confirm
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default InterviewDetailsModal; 