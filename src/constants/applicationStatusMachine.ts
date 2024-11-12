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

type StatusTransitions = {
    [key in ApplicationStatus]?: ApplicationStatus[];
};

export const statusTransitions: StatusTransitions = {
    [ApplicationStatus.Bookmarked]: [
        ApplicationStatus.Applied
    ],
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
    [ApplicationStatus.NotAccepted]: [],
    [ApplicationStatus.OfferReceived]: [
        ApplicationStatus.OfferAccepted,
        ApplicationStatus.OfferDeclined,
        ApplicationStatus.Withdrawn
    ],
    [ApplicationStatus.OfferAccepted]: [],
    [ApplicationStatus.OfferDeclined]: [],
    [ApplicationStatus.Withdrawn]: []
};

export const getNextStatuses = (currentStatus: ApplicationStatus): ApplicationStatus[] => {
    return statusTransitions[currentStatus] || [];
};

export const getStatusSequence = (currentStatus: ApplicationStatus): ApplicationStatus[] => {
    const commonPath = [ApplicationStatus.Bookmarked];
    
    switch (currentStatus) {
        case ApplicationStatus.Applied:
            return [...commonPath, ApplicationStatus.Applied];
        case ApplicationStatus.ApplicationReceived:
            return [...commonPath, ApplicationStatus.Applied, ApplicationStatus.ApplicationReceived];
        case ApplicationStatus.InterviewScheduled:
            return [...commonPath, ApplicationStatus.Applied, ApplicationStatus.ApplicationReceived, ApplicationStatus.InterviewScheduled];
        case ApplicationStatus.OfferReceived:
            return [...commonPath, ApplicationStatus.Applied, ApplicationStatus.ApplicationReceived, ApplicationStatus.InterviewScheduled, ApplicationStatus.OfferReceived];
        case ApplicationStatus.OfferAccepted:
            return [...commonPath, ApplicationStatus.Applied, ApplicationStatus.ApplicationReceived, ApplicationStatus.InterviewScheduled, ApplicationStatus.OfferReceived, ApplicationStatus.OfferAccepted];
        case ApplicationStatus.OfferDeclined:
            return [...commonPath, ApplicationStatus.Applied, ApplicationStatus.ApplicationReceived, ApplicationStatus.InterviewScheduled, ApplicationStatus.OfferReceived, ApplicationStatus.OfferDeclined];
        case ApplicationStatus.NoResponse:
            return [...commonPath, ApplicationStatus.Applied, ApplicationStatus.ApplicationReceived, ApplicationStatus.NoResponse];
        case ApplicationStatus.NotAccepted:
            return [...commonPath, ApplicationStatus.Applied, ApplicationStatus.ApplicationReceived, ApplicationStatus.InterviewScheduled, ApplicationStatus.NotAccepted];
        case ApplicationStatus.Withdrawn:
            return [...commonPath, ApplicationStatus.Applied, ApplicationStatus.ApplicationReceived, ApplicationStatus.Withdrawn];
        default:
            return commonPath;
    }
};
