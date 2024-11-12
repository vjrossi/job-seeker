export enum ApplicationStatus {
    Bookmarked = 'Bookmarked',
    Applied = 'Applied',
    ApplicationReceived = 'Application Received',
    InterviewScheduled = 'Interview Scheduled',
    NoResponse = 'No Response',
    NotAccepted = 'Not Accepted',
    OfferReceived = 'Offer Received',
    OfferAccepted = 'Offer Accepted',
    OfferDeclined = 'Offer Declined',
    Withdrawn = 'Withdrawn'
}

export const APPLICATION_STATUSES = Object.values(ApplicationStatus);

export const INACTIVE_STATUSES = [
    ApplicationStatus.NotAccepted,
    ApplicationStatus.OfferDeclined,
    ApplicationStatus.Withdrawn
];

export const ACTIVE_STATUSES = APPLICATION_STATUSES.filter(
    status => !INACTIVE_STATUSES.includes(status)
);
