import { ApplicationStatus } from '../constants/ApplicationStatus';

export const getStatusStyle = (status: ApplicationStatus) => {
  switch(status) {
    case ApplicationStatus.Applied:
      return { color: '#1565c0', borderColor: '#1565c0' };
    case ApplicationStatus.InterviewScheduled:
      return { color: '#2e7d32', borderColor: '#2e7d32' };
    case ApplicationStatus.OfferReceived:
      return { color: '#1b5e20', borderColor: '#1b5e20' };
    case ApplicationStatus.OfferAccepted:
      return { color: '#1b5e20', borderColor: '#1b5e20' };
    case ApplicationStatus.NoResponse:
      return { color: '#616161', borderColor: '#616161' };
    case ApplicationStatus.NotAccepted:
      return { color: '#c62828', borderColor: '#c62828' };
    case ApplicationStatus.Withdrawn:
      return { color: '#424242', borderColor: '#424242' };
    default:
      return { color: '#424242', borderColor: '#424242' };
  }
};

export const formatStatus = (status: ApplicationStatus, history: { status: ApplicationStatus; timestamp: string }[]): string => {
  switch(status) {
    case ApplicationStatus.InterviewScheduled: {
      const interviewCount = history.filter(h => h.status === ApplicationStatus.InterviewScheduled).length;
      const interviewNumber = ['First', 'Second', 'Third', 'Fourth', 'Fifth'][interviewCount - 1] || `${interviewCount}th`;
      return `${interviewNumber} Interview Scheduled`;
    }
    case ApplicationStatus.NotAccepted:
      return 'Not Accepted';
    case ApplicationStatus.NoResponse:
      return 'No Response';
    default:
      return status;
  }
};

export const formatTimeSince = (timestamp: string): string => {
  const now = new Date();
  const then = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
}; 