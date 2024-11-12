import { ApplicationStatus } from '../constants/ApplicationStatus';

export const getStatusStyle = (status: ApplicationStatus) => {
  switch(status) {
    case ApplicationStatus.Bookmarked:
      return { color: '#ffc107', borderColor: '#ffc107' };
    case ApplicationStatus.Applied:
      return { color: '#2196f3', borderColor: '#2196f3' };
    case ApplicationStatus.ApplicationReceived:
      return { color: '#689f38', borderColor: '#689f38' };
    case ApplicationStatus.InterviewScheduled:
      return { color: '#4caf50', borderColor: '#4caf50' };
    case ApplicationStatus.OfferReceived:
      return { color: '#ff9800', borderColor: '#ff9800' };
    case ApplicationStatus.OfferAccepted:
      return { color: '#00acc1', borderColor: '#00acc1' };
    case ApplicationStatus.OfferDeclined:
      return { color: '#9c27b0', borderColor: '#9c27b0' };
    case ApplicationStatus.NotAccepted:
      return { color: '#f44336', borderColor: '#f44336' };
    case ApplicationStatus.Withdrawn:
      return { color: '#795548', borderColor: '#795548' };
    case ApplicationStatus.NoResponse:
      return { color: '#c2185b', borderColor: '#c2185b' };
    default:
      return { color: '#424242', borderColor: '#424242' };
  }
};

export const formatStatus = (status: ApplicationStatus, history: { status: ApplicationStatus; timestamp: string }[]): string => {
  switch(status) {
    case ApplicationStatus.Bookmarked:
      return 'Bookmarked';
    case ApplicationStatus.ApplicationReceived:
      return 'Application Received';
    case ApplicationStatus.InterviewScheduled: {
      const interviewCount = history.filter(h => h.status === ApplicationStatus.InterviewScheduled).length;
      const interviewNumber = ['First', 'Second', 'Third', 'Fourth', 'Fifth'][interviewCount - 1] || `${interviewCount}th`;
      return `${interviewNumber} Interview Scheduled`;
    }
    case ApplicationStatus.NotAccepted:
      return 'Not Accepted';
    case ApplicationStatus.NoResponse:
      return 'No Response';
    case ApplicationStatus.OfferReceived:
      return 'Offer Received';
    case ApplicationStatus.OfferAccepted:
      return 'Offer Accepted';
    case ApplicationStatus.OfferDeclined:
      return 'Offer Declined';
    case ApplicationStatus.Withdrawn:
      return 'Withdrawn';
    case ApplicationStatus.Applied:
      return 'Applied';
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