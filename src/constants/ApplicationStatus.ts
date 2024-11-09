export enum ApplicationStatus {
    Applied = 'Applied',
    ApplicationReceived = 'Application Received',
    InterviewScheduled = 'Interview Scheduled',
    NoResponse = 'No Response',
    NotAccepted = 'Not Accepted',
    OfferReceived = 'Offer Received',
    OfferAccepted = 'Offer Accepted',
    OfferDeclined = 'Offer Declined',
    Withdrawn = 'Withdrawn',
    Archived = 'Archived'
}

type StatusTransitions = {
    [key in ApplicationStatus]?: ApplicationStatus[]
};

export const statusTransitions: StatusTransitions = {
    [ApplicationStatus.Applied]: [
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

export const APPLICATION_STATUSES = Object.values(ApplicationStatus);

export const INACTIVE_STATUSES = [
    ApplicationStatus.NotAccepted,
    ApplicationStatus.OfferDeclined,
    ApplicationStatus.Withdrawn,
    ApplicationStatus.Archived
];

export const ACTIVE_STATUSES = APPLICATION_STATUSES.filter(
    status => !INACTIVE_STATUSES.includes(status)
);

export const getNextStatuses = (currentStatus: ApplicationStatus): ApplicationStatus[] => {
    return statusTransitions[currentStatus] || []
};
