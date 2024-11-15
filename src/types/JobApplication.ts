import { ApplicationStatus } from '../constants/ApplicationStatus';
import { InterviewLocationType } from '../components/modals/InterviewDetailsModal';
import { JobType } from './JobType';

export interface JobApplication {
    id: number;
    companyName: string;
    jobTitle: string;
    jobType: JobType;
    jobUrl?: string;
    jobDescription: string;
    applicationMethod: string;
    rating: number;
    location?: string;
    payRange?: string;
    statusHistory: {
        status: ApplicationStatus;
        timestamp: string;
        interviewDateTime?: string;
        interviewLocation?: string;
        interviewType?: InterviewLocationType;
        interviewLink?: string;
        interviewPhone?: string;
        interviewers?: string;
    }[];
    interviewDateTime?: string;
    interviewLocation?: string;
    archived?: boolean;
    initialStatus?: ApplicationStatus;
} 