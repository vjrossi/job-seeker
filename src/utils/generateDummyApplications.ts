import { ApplicationStatus, getNextStatuses } from '../constants/ApplicationStatus';
import { JobApplication } from '../components/JobApplicationTracker';
import { STANDARD_APPLICATION_METHODS } from '../constants/standardApplicationMethods';

const generateRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateFutureDate = (): Date => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + Math.random() * (30 * 24 * 60 * 60 * 1000)); // Random date within the next 30 days
  return futureDate;
};

// Configuration
const OFFER_PROBABILITY = 0.03; // 3% chance of receiving an offer
const INTERVIEW_PROBABILITY = 0.1; // 10% chance of getting an interview
const RECENT_APPLICATION_PROBABILITY = 0.6; // 60% chance of being within the last 30 days

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

const getRandomItem = (array: string[]) => array[Math.floor(Math.random() * array.length)];

export const generateDummyApplications = (count: number, stalePeriod: number): JobApplication[] => {
  const applications: JobApplication[] = [];
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  let hasScheduledInterview = false;
  let becomingStaleCount = 0;
  let staleCount = 0;

  for (let i = 0; i < count; i++) {
    let appliedDate: Date;
    if (Math.random() < RECENT_APPLICATION_PROBABILITY) {
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

    while (currentDate < now) {
      const nextStatuses = getNextStatuses(currentStatus);
      if (nextStatuses.length === 0) break;

      // Increase probability of interview if we don't have one yet
      const interviewProbability = !hasScheduledInterview ? 0.4 : 0.2;
      let nextStatus: ApplicationStatus;
      
      if (Math.random() < interviewProbability && nextStatuses.includes(ApplicationStatus.InterviewScheduled)) {
        nextStatus = ApplicationStatus.InterviewScheduled;
      } else {
        nextStatus = getRandomItem(nextStatuses) as ApplicationStatus;
      }

      currentDate = new Date(currentDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000); // 0-7 days later
      if (currentDate > now) currentDate = now;

      statusHistory.push({ status: nextStatus, timestamp: currentDate.toISOString() });
      currentStatus = nextStatus;

      // Set interview date for interview statuses
      if ([ApplicationStatus.InterviewScheduled, ApplicationStatus.SecondRoundScheduled, ApplicationStatus.ThirdRoundScheduled].includes(nextStatus)) {
        const interviewDate = new Date(currentDate.getTime() + (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000);
        if (interviewDate > now) {
          interviewDateTime = interviewDate.toISOString();
          hasScheduledInterview = true;
        }
      }

      // Add a chance to stop progressing
      if (Math.random() < 0.3) break;
    }

    // Check if the application is becoming stale or stale
    const lastUpdateDate = new Date(statusHistory[statusHistory.length - 1].timestamp);
    const daysSinceLastUpdate = Math.floor((now.getTime() - lastUpdateDate.getTime()) / (1000 * 3600 * 24));

    if (daysSinceLastUpdate > 30) {
      staleCount++;
    } else if (daysSinceLastUpdate > stalePeriod) {
      becomingStaleCount++;
    }

    // Archive applications older than 3 months
    if (appliedDate < threeMonthsAgo && !statusHistory.some(status => status.status === ApplicationStatus.Archived)) {
      statusHistory.push({ status: ApplicationStatus.Archived, timestamp: now.toISOString() });
    }

    const companyName = getRandomItem(companies);
    const jobTitle = getRandomItem(jobTitles);

    const application: JobApplication = {
      id: i + 1,
      companyName: companyName,
      rating: Math.floor(Math.random() * 5) + 1,
      jobTitle: jobTitle,
      jobDescription: `This is a job description for ${jobTitle} at ${companyName}.`,
      applicationMethod: getRandomItem(STANDARD_APPLICATION_METHODS),
      statusHistory: statusHistory,
      interviewDateTime: interviewDateTime
    };

    applications.push(application);
  }

  // If we don't have the desired distribution, regenerate some applications
  while (!hasScheduledInterview || becomingStaleCount < 2 || staleCount < 2) {
    const index = Math.floor(Math.random() * count);
    applications[index] = generateSingleApplication(now, threeMonthsAgo, oneMonthAgo, stalePeriod);
    
    if (!hasScheduledInterview && applications[index].interviewDateTime) {
      hasScheduledInterview = true;
    }
    
    const lastUpdateDate = new Date(applications[index].statusHistory[applications[index].statusHistory.length - 1].timestamp);
    const daysSinceLastUpdate = Math.floor((now.getTime() - lastUpdateDate.getTime()) / (1000 * 3600 * 24));
    
    if (daysSinceLastUpdate > 30) {
      staleCount++;
    } else if (daysSinceLastUpdate > stalePeriod) {
      becomingStaleCount++;
    }
  }

  return applications;
};

// Helper function to generate a single application
function generateSingleApplication(now: Date, threeMonthsAgo: Date, oneMonthAgo: Date, stalePeriod: number): JobApplication {
  let appliedDate: Date;
  if (Math.random() < RECENT_APPLICATION_PROBABILITY) {
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

  while (currentDate < now) {
    const nextStatuses = getNextStatuses(currentStatus);
    if (nextStatuses.length === 0) break;

    const nextStatus = getRandomItem(nextStatuses) as ApplicationStatus;
    currentDate = new Date(currentDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000); // 0-7 days later
    if (currentDate > now) currentDate = now;

    statusHistory.push({ status: nextStatus, timestamp: currentDate.toISOString() });
    currentStatus = nextStatus;

    // Set interview date for interview statuses
    if ([ApplicationStatus.InterviewScheduled, ApplicationStatus.SecondRoundScheduled, ApplicationStatus.ThirdRoundScheduled].includes(nextStatus)) {
      const interviewDate = new Date(currentDate.getTime() + (Math.floor(Math.random() * 7) + 1) * 24 * 60 * 60 * 1000);
      if (interviewDate > now) {
        interviewDateTime = interviewDate.toISOString();
      }
    }

    // Add a chance to stop progressing
    if (Math.random() < 0.3) break;
  }

  // Archive applications older than 3 months
  if (appliedDate < threeMonthsAgo && !statusHistory.some(status => status.status === ApplicationStatus.Archived)) {
    statusHistory.push({ status: ApplicationStatus.Archived, timestamp: now.toISOString() });
  }

  const companyName = getRandomItem(companies);
  const jobTitle = getRandomItem(jobTitles);

  const application: JobApplication = {
    id: 1,
    companyName: companyName,
    rating: Math.floor(Math.random() * 5) + 1,
    jobTitle: jobTitle,
    jobDescription: `This is a job description for ${jobTitle} at ${companyName}.`,
    applicationMethod: getRandomItem(STANDARD_APPLICATION_METHODS),
    statusHistory: statusHistory,
    interviewDateTime: interviewDateTime
  };

  return application;
}