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

export const ACTIVE_STATUSES = [
  APPLICATION_STATUSES[0], // Applied
  APPLICATION_STATUSES[1], // Interview Scheduled
  APPLICATION_STATUSES[2], // No Response
  APPLICATION_STATUSES[4], // Offer Received
  APPLICATION_STATUSES[5], // Offer Accepted
];

