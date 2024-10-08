import { JobApplication } from '../components/JobApplicationTracker';
import { getNextStatuses } from '../constants/applicationStatusMachine';
import { ApplicationStatus } from '../constants/ApplicationStatus';

const companies = ['Google', 'Amazon', 'Microsoft', 'Apple', 'Facebook', 'Netflix', 'Tesla', 'IBM', 'Oracle', 'Intel'];
const jobTitles = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'QA Engineer', 'Systems Architect'];

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateApplicationHistory(startDate: Date): { statusHistory: { status: ApplicationStatus; timestamp: string }[], interviewDateTime?: string } {
  let currentStatus = ApplicationStatus.Applied;
  let currentDate = startDate;
  const statusHistory: { status: ApplicationStatus; timestamp: string }[] = [
    { status: currentStatus as ApplicationStatus.Applied, timestamp: currentDate.toISOString() }
  ];
  let interviewDateTime: string | undefined;

  while (getNextStatuses(currentStatus).length > 0) {
    const nextStatuses = getNextStatuses(currentStatus);
    const nextStatus = nextStatuses[Math.floor(Math.random() * nextStatuses.length)];
    currentDate = randomDate(currentDate, new Date());
    
    statusHistory.push({ status: nextStatus, timestamp: currentDate.toISOString() });
    
    if (nextStatus === ApplicationStatus.InterviewScheduled) {
      interviewDateTime = randomDate(currentDate, new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)).toISOString();
    }
    
    currentStatus = nextStatus;
    
    // 30% chance to stop progressing, unless it's an offer
    if (Math.random() < 0.3 && ![ApplicationStatus.OfferAccepted, ApplicationStatus.OfferDeclined, ApplicationStatus.Withdrawn].includes(currentStatus)) {
      break;
    }
  }

  return { statusHistory, interviewDateTime };
}

export function generateDummyApplications(count: number): JobApplication[] {
  const applications: JobApplication[] = [];

  for (let i = 0; i < count; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const appliedDate = randomDate(new Date(2023, 0, 1), new Date());

    const { statusHistory, interviewDateTime } = generateApplicationHistory(appliedDate);

    const application: JobApplication = {
      id: Date.now() + i,
      companyName: company,
      jobTitle: jobTitle,
      jobDescription: `This is a dummy job description for ${jobTitle} position at ${company}.`,
      applicationMethod: Math.random() > 0.5 ? 'Company Website' : 'LinkedIn',
      statusHistory,
      interviewDateTime,
    };

    applications.push(application);
  }

  return applications;
}