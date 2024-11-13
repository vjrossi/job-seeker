import { JobApplication } from '../types/JobApplication';
import { ApplicationStatus } from '../constants/ApplicationStatus';

export const validateImportedData = (data: any[]): JobApplication[] => {
  return data.filter(item => {
    // Basic validation of required fields
    const isValid = 
      typeof item.id === 'number' &&
      typeof item.companyName === 'string' &&
      typeof item.jobTitle === 'string' &&
      Array.isArray(item.statusHistory) &&
      item.statusHistory.every((status: any) => 
        typeof status.status === 'string' &&
        Object.values(ApplicationStatus).includes(status.status) &&
        typeof status.timestamp === 'string' &&
        !isNaN(new Date(status.timestamp).getTime())
      );

    if (!isValid && process.env.NODE_ENV === 'development') {
      console.warn('Invalid application data:', item);
    }

    return isValid;
  });
};

export const importFromJSON = async (jsonString: string): Promise<JobApplication[]> => {
  try {
    const data = JSON.parse(jsonString);
    if (!Array.isArray(data)) {
      throw new Error('Invalid import data: expected an array');
    }
    return validateImportedData(data);
  } catch (error) {
    throw new Error('Failed to parse import data: ' + (error as Error).message);
  }
}; 