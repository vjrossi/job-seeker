import { JobApplication } from '../components/JobApplicationTracker';
import { ApplicationStatus } from '../constants/ApplicationStatus';

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

export const generateDummyApplications = (count: number, noResponseDays: number): JobApplication[] => {
  const applications: JobApplication[] = [];
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    let appliedDate: Date;
    if (Math.random() < RECENT_APPLICATION_PROBABILITY) {
      appliedDate = generateRandomDate(oneMonthAgo, now);
    } else {
      appliedDate = generateRandomDate(threeMonthsAgo, oneMonthAgo);
    }

    const daysSinceApplied = Math.floor((now.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));

    let currentStatus: ApplicationStatus;
    const statusHistory = [
      { status: ApplicationStatus.Applied, timestamp: appliedDate.toISOString() }
    ];

    const random = Math.random();
    if (random < OFFER_PROBABILITY) {
      currentStatus = ApplicationStatus.OfferReceived;
    } else if (random < OFFER_PROBABILITY + INTERVIEW_PROBABILITY) {
      currentStatus = ApplicationStatus.InterviewScheduled;
    } else if (daysSinceApplied > noResponseDays) {
      currentStatus = ApplicationStatus.NoResponse;
    } else {
      currentStatus = ApplicationStatus.Applied;
    }

    if (currentStatus !== ApplicationStatus.Applied) {
      const statusDate = new Date(appliedDate);
      statusDate.setDate(statusDate.getDate() + Math.min(daysSinceApplied, noResponseDays));
      statusHistory.push({ status: currentStatus, timestamp: statusDate.toISOString() });
    }

    // Archive applications older than 3 months
    if (appliedDate < threeMonthsAgo) {
      statusHistory.push({ status: ApplicationStatus.Archived, timestamp: now.toISOString() });
      currentStatus = ApplicationStatus.Archived;
    }

    const companyName = getRandomItem(companies);
    const jobTitle = getRandomItem(jobTitles);

    const application: JobApplication = {
      id: i + 1,
      companyName: companyName,
      rating: Math.floor(Math.random() * 5) + 1, // Add this line
      jobTitle: jobTitle,
      jobDescription: `This is a job description for ${jobTitle} at ${companyName}.`,
      applicationMethod: Math.random() > 0.5 ? 'Online' : 'Email',
      statusHistory: statusHistory,
    };

    if (currentStatus === ApplicationStatus.InterviewScheduled) {
      application.interviewDateTime = generateFutureDate().toISOString();
    }

    applications.push(application);
  }

  return applications;
};