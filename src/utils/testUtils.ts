import { JobApplication } from '../types/JobApplication';
import { JobType } from '../types/JobType';
import { ApplicationStatus } from '../constants/ApplicationStatus';

export const createMockApplication = (overrides = {}): JobApplication => ({
    id: 1,
    companyName: 'Test Company',
    jobTitle: 'Software Engineer',
    jobType: JobType.Unspecified,
    jobDescription: 'Test description',
    applicationMethod: 'LinkedIn',
    rating: 0,
    statusHistory: [{
        status: ApplicationStatus.Applied,
        timestamp: new Date().toISOString()
    }],
    ...overrides
}); 