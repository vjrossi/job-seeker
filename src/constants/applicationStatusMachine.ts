import { APPLICATION_STATUSES } from './applicationStatuses';

type StatusTransitions = {
  [key: string]: string[];
};

export const statusTransitions: StatusTransitions = {
  'Applied': ['Interview Scheduled', 'No Response', 'Not Accepted', 'Withdrawn'],
  'Interview Scheduled': ['Offer Received', 'Not Accepted', 'Withdrawn'],
  'No Response': ['Interview Scheduled', 'Not Accepted', 'Withdrawn'],
  'Not Accepted': ['Archived'],
  'Offer Received': ['Offer Accepted', 'Offer Declined', 'Withdrawn'],
  'Offer Accepted': ['Archived'],
  'Offer Declined': ['Archived'],
  'Withdrawn': ['Archived'],
  'Archived': [],
};

export const getNextStatuses = (currentStatus: string): string[] => {
  return statusTransitions[currentStatus] || [];
};