export enum InterviewLocationType {
    Remote = 'remote',
    InPerson = 'in-person',
    Phone = 'phone',
    Video = 'video'
}

export interface InterviewDetails {
    dateTime: string;
    location: string;
    locationType: InterviewLocationType;
}

export const InterviewLocationTypes = {
    Zoom: 'Zoom' as InterviewLocationType,
    Teams: 'Teams' as InterviewLocationType,
    Phone: 'Phone' as InterviewLocationType,
    InPerson: 'In Person' as InterviewLocationType,
    Other: 'Other' as InterviewLocationType,
} as const; 