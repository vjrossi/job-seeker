export const APPLICATION_STATUSES = [
  'Applied',
  'Interview Scheduled',
  'No Response',
  'Not Accepted',
  'Offer Received',
  'Offer Accepted',
  'Offer Declined',
  'Withdrawn',
  'Archived'
];

export const INACTIVE_STATUSES = [
  APPLICATION_STATUSES[3], // Not Accepted
  APPLICATION_STATUSES[6], // Offer Declined
  APPLICATION_STATUSES[7], // Withdrawn
  APPLICATION_STATUSES[8]  // Archived
];