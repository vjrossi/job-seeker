import { ApplicationStatus } from '../constants/ApplicationStatus';
import { JobApplication } from '../types/JobApplication';
import { STANDARD_APPLICATION_METHODS } from '../constants/standardApplicationMethods';
import { InterviewLocationTypes } from '../types/interview';
import { JobType } from '../types/JobType';

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

function getRandomItem<T>(array: readonly T[] | T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

const generateInterviewDetails = (interviewDateTime: string) => {
  const locationTypes = Object.values(InterviewLocationTypes);
  const locationType = locationTypes[Math.floor(Math.random() * locationTypes.length)];
  
  let location = '';
  let interviewLink = '';
  let interviewPhone = '';
  let interviewers = '';

  // Generate random interviewer names
  const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
  const numInterviewers = Math.floor(Math.random() * 3) + 1; // 1-3 interviewers
  const selectedInterviewers = [];
  
  for (let i = 0; i < numInterviewers; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    selectedInterviewers.push(`${firstName} ${lastName}`);
  }
  interviewers = selectedInterviewers.join(', ');

  switch (locationType) {
    case InterviewLocationTypes.Zoom:
      location = 'Zoom';
      interviewLink = `https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}`;
      break;
    case InterviewLocationTypes.Teams:
      location = 'Microsoft Teams';
      interviewLink = 'https://teams.microsoft.com/l/meetup-join/random-meeting-id';
      break;
    case InterviewLocationTypes.Phone:
      location = 'Phone Interview';
      interviewPhone = `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
      break;
    case InterviewLocationTypes.InPerson:
      const cities = ['New York', 'San Francisco', 'Seattle', 'Boston', 'Austin'];
      const city = cities[Math.floor(Math.random() * cities.length)];
      location = `${Math.floor(Math.random() * 100) + 1} Tech Street, ${city}`;
      break;
    case InterviewLocationTypes.Other:
      location = 'TBD';
      break;
  }

  return {
    location,
    locationType,
    interviewLink,
    interviewPhone,
    interviewers
  };
};

const generateJobDescription = (jobTitle: string, companyName: string): string => {
  const responsibilities = [
    'Build scalable web applications',
    'Collaborate with cross-functional teams',
    'Write clean, maintainable code',
    'Participate in code reviews',
    'Design and implement APIs',
    'Optimize application performance',
    'Debug production issues',
    'Write technical documentation'
  ];

  const requirements = [
    '5+ years of software development experience',
    'Strong knowledge of JavaScript/TypeScript',
    'Experience with React and modern frontend frameworks',
    `Bachelor's degree in Computer Science or related field`,
    'Experience with cloud platforms (AWS/Azure/GCP)',
    'Strong problem-solving skills',
    'Excellent communication skills'
  ];

  const selected = [...responsibilities, ...requirements]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  return `
${jobTitle} position at ${companyName}

Key Responsibilities & Requirements:
${selected.map(item => `• ${item}`).join('\n')}

We offer competitive salary and benefits including:
• Health, dental, and vision insurance
• 401(k) matching
• Flexible work hours
• Remote work options
• Professional development budget
`;
};

const generateStatusHistory = (applicationDate: Date): {
  statusHistory: any[];
  currentStatus: ApplicationStatus;
} => {
  const statusHistory = [];
  let currentDate = applicationDate;
  
  // Initial status (70% Applied, 30% Bookmarked)
  const initialStatus = Math.random() < 0.7 
    ? ApplicationStatus.Applied 
    : ApplicationStatus.Bookmarked;
  
  statusHistory.push({
    status: initialStatus,
    timestamp: currentDate.toISOString()
  });

  if (initialStatus === ApplicationStatus.Bookmarked) {
    // 80% chance of moving from Bookmarked to Applied
    if (Math.random() < 0.8) {
      currentDate = new Date(currentDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
      statusHistory.push({
        status: ApplicationStatus.Applied,
        timestamp: currentDate.toISOString()
      });
    } else {
      return { statusHistory, currentStatus: ApplicationStatus.Bookmarked };
    }
  }

  // Application Received (60% chance)
  if (Math.random() < 0.6) {
    currentDate = new Date(currentDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000);
    statusHistory.push({
      status: ApplicationStatus.ApplicationReceived,
      timestamp: currentDate.toISOString()
    });

    // Interview Process (50% chance if application received)
    if (Math.random() < 0.5) {
      // Can have multiple interviews (1-3)
      const numInterviews = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numInterviews; i++) {
        currentDate = new Date(currentDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000);
        const interviewDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const interviewDetails = generateInterviewDetails(interviewDate.toISOString());
        
        statusHistory.push({
          status: ApplicationStatus.InterviewScheduled,
          timestamp: currentDate.toISOString(),
          interviewDateTime: interviewDate.toISOString(),
          interviewLocation: interviewDetails.location,
          interviewType: interviewDetails.locationType,
          interviewLink: interviewDetails.interviewLink,
          interviewPhone: interviewDetails.interviewPhone,
          interviewers: interviewDetails.interviewers
        });

        // Move time past interview date for next status
        currentDate = new Date(interviewDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
      }

      // Post-interview outcomes
      const outcome = Math.random();
      if (outcome < 0.3) { // 30% chance of offer
        statusHistory.push({
          status: ApplicationStatus.OfferReceived,
          timestamp: currentDate.toISOString()
        });

        // Decision on offer
        currentDate = new Date(currentDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
        const finalStatus = Math.random() < 0.7 
          ? ApplicationStatus.OfferAccepted 
          : ApplicationStatus.OfferDeclined;
        
        statusHistory.push({
          status: finalStatus,
          timestamp: currentDate.toISOString()
        });
        
        return { statusHistory, currentStatus: finalStatus };
      } else { // 70% chance of rejection post-interview
        statusHistory.push({
          status: ApplicationStatus.NotAccepted,
          timestamp: currentDate.toISOString()
        });
        return { statusHistory, currentStatus: ApplicationStatus.NotAccepted };
      }
    }
  }

  // No response path (if no interview process started)
  if (Math.random() < 0.4) { // 40% chance of explicit no response status
    currentDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    statusHistory.push({
      status: ApplicationStatus.NoResponse,
      timestamp: currentDate.toISOString()
    });
    return { statusHistory, currentStatus: ApplicationStatus.NoResponse };
  }

  // Return the last status as current
  return { 
    statusHistory, 
    currentStatus: statusHistory[statusHistory.length - 1].status 
  };
};

const DUMMY_LOCATIONS = [
  'Melbourne',
  'Sydney',
  'Brisbane',
  'Perth',
  'Adelaide',
  'Canberra',
  'Remote'
];

const generatePayRange = (): string => {
  const baseRanges = [
    '$70,000 - $90,000',
    '$80,000 - $100,000',
    '$90,000 - $120,000',
    '$100,000 - $130,000',
    '$120,000 - $150,000',
    '$130,000 - $160,000',
    'Undisclosed'
  ];
  
  const range = getRandomItem(baseRanges);
  return range === 'Undisclosed' ? '' : range + ' per annum';
};

const generateCompanyName = (): string => {
  return getRandomItem(companies);
};

const generateJobTitle = (): string => {
  return getRandomItem(jobTitles);
};

const generateApplicationMethod = (): string => {
  return getRandomItem(STANDARD_APPLICATION_METHODS);
};

const generateJobType = (): JobType => {
  const weights = {
    [JobType.Remote]: 0.3,   // 30% chance
    [JobType.Hybrid]: 0.4,   // 40% chance
    [JobType.Onsite]: 0.25,  // 25% chance
    [JobType.Unspecified]: 0.05  // 5% chance
  };
  
  const random = Math.random();
  let sum = 0;
  
  for (const [type, weight] of Object.entries(weights)) {
    sum += weight;
    if (random <= sum) {
      return type as JobType;
    }
  }
  
  return JobType.Unspecified;
};

const generateDummyApplication = (id: number): JobApplication => {
  const applicationDate = new Date();
  applicationDate.setDate(applicationDate.getDate() - Math.floor(Math.random() * 30));
  
  const jobTitle = generateJobTitle();
  const companyName = generateCompanyName();
  const { statusHistory, currentStatus } = generateStatusHistory(applicationDate);
  
  return {
    id,
    companyName,
    jobTitle,
    jobType: generateJobType(),
    jobDescription: generateJobDescription(jobTitle, companyName),
    jobUrl: Math.random() > 0.3 ? `https://example.com/job/${id}` : '',
    applicationMethod: generateApplicationMethod(),
    rating: Math.floor(Math.random() * 5) + 1,
    location: DUMMY_LOCATIONS[Math.floor(Math.random() * DUMMY_LOCATIONS.length)],
    payRange: Math.random() > 0.3 ? generatePayRange() : '', // 70% chance of having a pay range
    statusHistory: statusHistory,
    interviewDateTime: currentStatus === ApplicationStatus.InterviewScheduled ? 
      statusHistory.find((s: { status: ApplicationStatus }) => 
        s.status === ApplicationStatus.InterviewScheduled
      )?.interviewDateTime : 
      undefined,
    interviewLocation: currentStatus === ApplicationStatus.InterviewScheduled ?
      statusHistory.find((s: { status: ApplicationStatus }) => 
        s.status === ApplicationStatus.InterviewScheduled
      )?.interviewLocation :
      undefined,
    archived: Math.random() < 0.1 // 10% chance of being archived
  };
};

export const generateDummyApplications = (count: number): JobApplication[] => {
  return Array.from({ length: count }, (_, i) => generateDummyApplication(i + 1));
};

export { generateDummyApplication };
