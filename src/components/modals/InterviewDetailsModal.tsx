import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

export enum InterviewLocationType {
    Remote = 'remote',
    InPerson = 'in-person',
    Phone = 'phone',
    Video = 'video'
}

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
  onConfirm: (details: { 
    dateTime: string; 
    location: string; 
    locationType: InterviewLocationType;
    interviewLink?: string;
    interviewPhone?: string;
    interviewers?: string;
  }) => void;
  initialDateTime?: string;
  initialLocation?: string;
  initialLocationType?: InterviewLocationType;
  initialInterviewLink?: string;
  initialInterviewPhone?: string;
  initialInterviewers?: string;
  isEditing?: boolean;
}

const InterviewDetailsModal: React.FC<InterviewDetailsModalProps> = ({
  show,
  onHide,
  onConfirm,
  initialDateTime,
  initialLocation,
  initialLocationType,
  initialInterviewLink,
  initialInterviewPhone,
  initialInterviewers,
  isEditing
}) => {
  const [dateTime, setDateTime] = useState(initialDateTime || '');
  const [location, setLocation] = useState(initialLocation || '');
  const [locationType, setLocationType] = useState<InterviewLocationType>(
    initialLocationType || InterviewLocationTypes.InPerson
  );
  const [interviewLink, setInterviewLink] = useState(initialInterviewLink || '');
  const [interviewPhone, setInterviewPhone] = useState(initialInterviewPhone || '');
  const [interviewers, setInterviewers] = useState(initialInterviewers || '');

  useEffect(() => {
    if (show) {
      setDateTime(initialDateTime || '');
      setLocationType(initialLocationType || InterviewLocationTypes.InPerson);
      
      if (initialLocationType === InterviewLocationTypes.InPerson) {
        setLocation(initialLocation || '');
        setInterviewLink('');
        setInterviewPhone('');
      } else if (initialLocationType === InterviewLocationTypes.Phone) {
        setLocation('');
        setInterviewLink('');
        setInterviewPhone(initialLocation || '');
      } else if ([InterviewLocationTypes.Zoom, InterviewLocationTypes.Teams, InterviewLocationTypes.Other].includes(initialLocationType || InterviewLocationTypes.InPerson)) {
        setLocation('');
        setInterviewLink(initialLocation || '');
        setInterviewPhone('');
      }
      
      setInterviewers(initialInterviewers || '');
    }
  }, [show, initialDateTime, initialLocation, initialLocationType, initialInterviewLink, initialInterviewPhone, initialInterviewers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      dateTime,
      locationType,
      location: locationType === InterviewLocationTypes.InPerson 
        ? location 
        : locationType === InterviewLocationTypes.Phone 
          ? interviewPhone
          : interviewLink || '',
      interviewLink: [InterviewLocationTypes.Zoom, InterviewLocationTypes.Teams, InterviewLocationTypes.Other].includes(locationType) 
        ? interviewLink 
        : undefined,
      interviewPhone: locationType === InterviewLocationTypes.Phone 
        ? interviewPhone 
        : undefined,
      interviewers
    });
    onHide();
  };

  const handleLocationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocationType = e.target.value as InterviewLocationType;
    setLocationType(newLocationType);
    
    if (newLocationType === InterviewLocationTypes.InPerson) {
      setInterviewLink('');
      setInterviewPhone('');
    } else if (newLocationType === InterviewLocationTypes.Phone) {
      setLocation('');
      setInterviewLink('');
    } else {
      setLocation('');
      setInterviewPhone('');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="sm" centered>
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
              onChange={handleLocationTypeChange}
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

          {(locationType === InterviewLocationTypes.Zoom || 
            locationType === InterviewLocationTypes.Teams || 
            locationType === InterviewLocationTypes.Other) && (
            <Form.Group className="mb-3">
              <Form.Label>Meeting Link</Form.Label>
              <Form.Control
                type="url"
                value={interviewLink}
                onChange={(e) => setInterviewLink(e.target.value)}
                placeholder="Enter the video call link"
                required
                className="form-control-sm"
              />
            </Form.Group>
          )}

          {locationType === InterviewLocationTypes.Phone && (
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                value={interviewPhone}
                onChange={(e) => setInterviewPhone(e.target.value)}
                placeholder="Enter the phone number"
                required
                className="form-control-sm"
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Interviewer(s)</Form.Label>
            <Form.Control
              type="text"
              value={interviewers}
              onChange={(e) => setInterviewers(e.target.value)}
              placeholder="Enter interviewer name(s)"
              className="form-control-sm"
            />
          </Form.Group>
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