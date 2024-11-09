import { ApplicationStatus } from './ApplicationStatus';

type StatusTransitions = {
  [key in ApplicationStatus]?: ApplicationStatus[];
};

export const statusTransitions: StatusTransitions = {
  [ApplicationStatus.Applied]: [
    ApplicationStatus.ApplicationReceived,
    ApplicationStatus.InterviewScheduled,
    ApplicationStatus.NoResponse,
    ApplicationStatus.NotAccepted,
    ApplicationStatus.Withdrawn
  ],
  [ApplicationStatus.ApplicationReceived]: [
    ApplicationStatus.InterviewScheduled,
    ApplicationStatus.NoResponse,
    ApplicationStatus.NotAccepted,
    ApplicationStatus.Withdrawn
  ],
  [ApplicationStatus.InterviewScheduled]: [
    ApplicationStatus.InterviewScheduled,
    ApplicationStatus.OfferReceived,
    ApplicationStatus.NotAccepted,
    ApplicationStatus.Withdrawn
  ],
  [ApplicationStatus.NoResponse]: [
    ApplicationStatus.InterviewScheduled,
    ApplicationStatus.NotAccepted,
    ApplicationStatus.Withdrawn
  ],
  [ApplicationStatus.NotAccepted]: [ApplicationStatus.Archived],
  [ApplicationStatus.OfferReceived]: [
    ApplicationStatus.OfferAccepted,
    ApplicationStatus.OfferDeclined,
    ApplicationStatus.Withdrawn
  ],
  [ApplicationStatus.OfferAccepted]: [ApplicationStatus.Archived],
  [ApplicationStatus.OfferDeclined]: [ApplicationStatus.Archived],
  [ApplicationStatus.Withdrawn]: [ApplicationStatus.Archived],
  [ApplicationStatus.Archived]: [],
};

export const getNextStatuses = (currentStatus: ApplicationStatus): ApplicationStatus[] => {
  return statusTransitions[currentStatus] || [];
};

export const getStatusSequence = (currentStatus: ApplicationStatus): ApplicationStatus[] => {
  const commonPath = [ApplicationStatus.Applied];
  
  switch (currentStatus) {
    case ApplicationStatus.ApplicationReceived:
      return [...commonPath, ApplicationStatus.ApplicationReceived];
    
    case ApplicationStatus.InterviewScheduled:
      return [...commonPath, ApplicationStatus.ApplicationReceived, ApplicationStatus.InterviewScheduled];
    
    case ApplicationStatus.OfferReceived:
      return [...commonPath, ApplicationStatus.ApplicationReceived, ApplicationStatus.InterviewScheduled, ApplicationStatus.OfferReceived];
    
    case ApplicationStatus.OfferAccepted:
      return [...commonPath, ApplicationStatus.ApplicationReceived, ApplicationStatus.InterviewScheduled, ApplicationStatus.OfferReceived, ApplicationStatus.OfferAccepted];
    
    case ApplicationStatus.OfferDeclined:
      return [...commonPath, ApplicationStatus.ApplicationReceived, ApplicationStatus.InterviewScheduled, ApplicationStatus.OfferReceived, ApplicationStatus.OfferDeclined];
    
    case ApplicationStatus.NoResponse:
      return [...commonPath, ApplicationStatus.ApplicationReceived, ApplicationStatus.NoResponse];
    
    case ApplicationStatus.NotAccepted:
      return [...commonPath, ApplicationStatus.ApplicationReceived, ApplicationStatus.InterviewScheduled, ApplicationStatus.NotAccepted];
    
    case ApplicationStatus.Withdrawn:
      return [...commonPath, ApplicationStatus.ApplicationReceived, ApplicationStatus.Withdrawn];
    
    case ApplicationStatus.Archived:
      return [...commonPath, ApplicationStatus.ApplicationReceived, ApplicationStatus.Archived];
    
    default:
      return commonPath;
  }
};
