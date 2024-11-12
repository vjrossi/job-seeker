import { ApplicationStatus } from '../constants/ApplicationStatus';
import { InterviewLocationType } from '../components/modals/InterviewDetailsModal';

export interface JobApplication {
    id: number;
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    applicationMethod: string;
    rating: number;
    statusHistory: {
        status: ApplicationStatus;
        timestamp: string;
        interviewDateTime?: string;
        interviewLocation?: string;
        interviewType?: InterviewLocationType;
    }[];
    interviewDateTime?: string;
    interviewLocation?: string;
    archived?: boolean;
    initialStatus?: ApplicationStatus;
} 