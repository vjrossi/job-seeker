import { JobApplication } from '../types/JobApplication';
import { ApplicationStatus } from '../constants/ApplicationStatus';

export const needsAttention = (application: JobApplication): { needs: boolean; reason?: string } => {
    const currentStatus = application.statusHistory[application.statusHistory.length - 1];
    const now = new Date();

    // Case 1: Interview in the past but status not updated
    if (currentStatus.status === ApplicationStatus.InterviewScheduled && 
        currentStatus.interviewDateTime && 
        new Date(currentStatus.interviewDateTime) < now) {
        return {
            needs: true,
            reason: "Interview completed - needs status update"
        };
    }

    // Case 2: No response for over 30 days since application
    if (currentStatus.status === ApplicationStatus.Applied || 
        currentStatus.status === ApplicationStatus.ApplicationReceived) {
        const daysSinceApplication = Math.floor(
            (now.getTime() - new Date(currentStatus.timestamp).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceApplication > 30) {
            return {
                needs: true,
                reason: "No response for over 30 days"
            };
        }
    }

    return { needs: false };
}; 