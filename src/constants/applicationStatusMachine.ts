import { ApplicationStatus } from './ApplicationStatus';

type StatusTransitions = {
  [key in ApplicationStatus]?: ApplicationStatus[];
};

export const statusTransitions: StatusTransitions = {
  [ApplicationStatus.Applied]: [ApplicationStatus.InterviewScheduled, ApplicationStatus.NoResponse, ApplicationStatus.NotAccepted, ApplicationStatus.Withdrawn],
  [ApplicationStatus.InterviewScheduled]: [ApplicationStatus.OfferReceived, ApplicationStatus.NotAccepted, ApplicationStatus.Withdrawn],
  [ApplicationStatus.NoResponse]: [ApplicationStatus.InterviewScheduled, ApplicationStatus.NotAccepted, ApplicationStatus.Withdrawn],
  [ApplicationStatus.NotAccepted]: [ApplicationStatus.Archived],
  [ApplicationStatus.OfferReceived]: [ApplicationStatus.OfferAccepted, ApplicationStatus.OfferDeclined, ApplicationStatus.Withdrawn],
  [ApplicationStatus.OfferAccepted]: [ApplicationStatus.Archived],
  [ApplicationStatus.OfferDeclined]: [ApplicationStatus.Archived],
  [ApplicationStatus.Withdrawn]: [ApplicationStatus.Archived],
  [ApplicationStatus.Archived]: [],
};

export const getNextStatuses = (currentStatus: ApplicationStatus): ApplicationStatus[] => {
  return statusTransitions[currentStatus] || [];
};