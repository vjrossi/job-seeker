import { ApplicationStatus } from '../constants/ApplicationStatus';
import { InterviewLocationType } from './interview';

export interface StatusHistoryEntry {
    status: ApplicationStatus;
    timestamp: string;
    interviewDateTime?: string;
    interviewLocation?: string;
    interviewType?: InterviewLocationType;
}

export type StatusTransitions = {
    [key in ApplicationStatus]?: ApplicationStatus[];
};

export interface StatusColor {
    background: string;
    border: string;
    gradient: string;
}

export type StatusColors = Record<ApplicationStatus, StatusColor>; 