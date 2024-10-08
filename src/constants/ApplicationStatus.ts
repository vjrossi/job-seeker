export enum ApplicationStatus {
    Applied = 'Applied',
    InterviewScheduled = 'Interview Scheduled',
    NoResponse = 'No Response',
    NotAccepted = 'Not Accepted',
    OfferReceived = 'Offer Received',
    OfferAccepted = 'Offer Accepted',
    OfferDeclined = 'Offer Declined',
    Withdrawn = 'Withdrawn',
    Archived = 'Archived'
  }
  
  export const INACTIVE_STATUSES = [
    ApplicationStatus.NotAccepted,
    ApplicationStatus.OfferDeclined,
    ApplicationStatus.Withdrawn,
    ApplicationStatus.Archived
  ];
  
  export const ACTIVE_STATUSES = [
    ApplicationStatus.Applied,
    ApplicationStatus.InterviewScheduled,
    ApplicationStatus.NoResponse,
    ApplicationStatus.OfferReceived,
    ApplicationStatus.OfferAccepted
  ];