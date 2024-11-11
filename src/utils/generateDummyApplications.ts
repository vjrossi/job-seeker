import { ApplicationStatus } from '../constants/ApplicationStatus';
import { getNextStatuses } from '../constants/applicationStatusMachine';
import { JobApplication } from '../components/JobApplicationTracker';
import { STANDARD_APPLICATION_METHODS } from '../constants/standardApplicationMethods';
import { InterviewLocationType } from '../components/InterviewDetailsModal';

const generateRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const companies = [
  'Google', 'Microsoft', 'Amazon', 'Apple', 'Facebook', 'Netflix', 'Adobe', 
  'Salesforce', 'IBM', 'Oracle', 'Intel', 'Cisco', 'VMware', 'Uber', 'Airbnb', 
  'Twitter', 'LinkedIn', 'Dropbox', 'Slack', 'Zoom', 'Shopify', 'Square', 
  'Stripe', 'Twilio', 'Atlassian', 'Palantir', 'Snowflake', 'Databricks', 
  'Instacart', 'DoorDash', 'Robinhood', 'Coinbase', 'SpaceX', 'Tesla'
];

const jobTitles = [
  'Software Engineer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
  'DevOps Engineer', 'Site Reliability Engineer', 'Data Scientist', 'Machine Learning Engineer',
  'AI Research Scientist', 'Cloud Architect', 'Mobile App Developer', 'iOS Developer',
  'Android Developer', 'React Native Developer', 'UI/UX Developer', 'QA Engineer',
  'Test Automation Engineer', 'Security Engineer', 'Blockchain Developer', 'Game Developer',
  'AR/VR Developer', 'Embedded Systems Engineer', 'Firmware Engineer', 'Network Engineer',
  'Database Administrator', 'Data Engineer', 'Big Data Engineer', 'Product Manager',
  'Technical Project Manager', 'Scrum Master'
];

// Update the getRandomItem function to handle readonly arrays
function getRandomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)] as T;
}

let uniqueIdCounter = Date.now();

const getUniqueId = () => {
    return uniqueIdCounter++;
};

// Add this constant to track interview counts
const MAX_INTERVIEWS = 3;

export const generateDummyApplications = (count: number, stalePeriod: number): JobApplication[] => {
    uniqueIdCounter = Date.now();
    
    const applications: JobApplication[] = [];
    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Modify the target distribution to be more realistic
    const targetDistribution = {
        [ApplicationStatus.Applied]: 0.2,           // 20%
        [ApplicationStatus.ApplicationReceived]: 0.2, // 20%
        [ApplicationStatus.InterviewScheduled]: 0.2, // 20% (spread across 1-3 interviews)
        [ApplicationStatus.NoResponse]: 0.15,       // 15%
        [ApplicationStatus.NotAccepted]: 0.1,       // 10%
        [ApplicationStatus.OfferReceived]: 0.1,     // 10%
        [ApplicationStatus.OfferAccepted]: 0.03,    // 3%
        [ApplicationStatus.OfferDeclined]: 0.02,    // 2%
        [ApplicationStatus.Withdrawn]: 0.02        // 2%
    };

    for (let i = 0; i < count; i++) {
        let appliedDate: Date;
        // Adjust recent application probability to get more active applications
        if (Math.random() < 0.8) { // 80% chance of recent applications
            appliedDate = generateRandomDate(oneMonthAgo, now);
        } else {
            appliedDate = generateRandomDate(threeMonthsAgo, oneMonthAgo);
        }

        const statusHistory = [
            { status: ApplicationStatus.Applied, timestamp: appliedDate.toISOString() }
        ];

        let currentDate = new Date(appliedDate);
        let currentStatus = ApplicationStatus.Applied;
        let interviewDateTime: string | undefined;

        let interviewCount = 0;

        // Determine target status based on distribution
        const rand = Math.random();
        let cumulative = 0;
        let targetStatus: ApplicationStatus | null = null;
        
        for (const [status, probability] of Object.entries(targetDistribution)) {
            cumulative += probability;
            if (rand <= cumulative && !targetStatus) {
                targetStatus = status as ApplicationStatus;
            }
        }

        // Progress through statuses until we reach target or a terminal status
        while (currentDate < now && currentStatus !== targetStatus) {
            const nextStatuses = getNextStatuses(currentStatus);
            if (nextStatuses.length === 0) break;

            let nextStatus: ApplicationStatus;
            
            // If we're already at MAX_INTERVIEWS, don't allow more interview scheduling
            if (interviewCount >= MAX_INTERVIEWS && 
                currentStatus === ApplicationStatus.InterviewScheduled) {
                // Force progression to either offer or rejection
                nextStatus = Math.random() < 0.3 ? 
                    ApplicationStatus.OfferReceived : 
                    ApplicationStatus.NotAccepted;
            } else if (targetStatus && nextStatuses.includes(targetStatus)) {
                nextStatus = targetStatus;
            } else {
                nextStatus = getRandomItem(nextStatuses);
            }

            currentDate = new Date(currentDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
            if (currentDate > now) currentDate = now;

            // Track interview count
            if (nextStatus === ApplicationStatus.InterviewScheduled) {
                interviewCount++;
            }

            statusHistory.push({ status: nextStatus, timestamp: currentDate.toISOString() });
            currentStatus = nextStatus;

            // Handle interview scheduling
            if (nextStatus === ApplicationStatus.InterviewScheduled) {
                const interviewDate = new Date(currentDate.getTime() + (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000);
                if (interviewDate > now) {
                    interviewDateTime = interviewDate.toISOString();
                }
            }
        }

        const companyName = getRandomItem(companies);
        const jobTitle = getRandomItem(jobTitles);

        const archived = appliedDate < threeMonthsAgo;

        const application: JobApplication = {
            id: getUniqueId(),
            companyName: companyName,
            rating: Math.floor(Math.random() * 5) + 1,
            jobTitle: jobTitle,
            jobDescription: `This is a job description for ${jobTitle} at ${companyName}.`,
            applicationMethod: getRandomItem(STANDARD_APPLICATION_METHODS),
            statusHistory: statusHistory.map(sh => ({
                status: sh.status,
                timestamp: sh.timestamp,
                ...(sh.status === ApplicationStatus.InterviewScheduled && interviewDateTime ? {
                    interviewDateTime: interviewDateTime,
                    interviewLocation: 'Remote',
                    interviewType: 'remote' as InterviewLocationType
                } : {})
            })),
            ...(interviewDateTime ? {
                interviewDateTime: interviewDateTime,
                interviewLocation: 'Remote'
            } : {}),
            archived: archived
        };

        applications.push(application);
    }

    return applications;
};
