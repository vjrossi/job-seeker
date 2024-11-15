import { GoogleGenerativeAI } from '@google/generative-ai';
import { JobApplication } from '../types/JobApplication';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  private readonly REQUEST_LIMIT = 60; // requests per minute
  private readonly RESET_INTERVAL = 60000; // 1 minute in milliseconds
  private appContext: string = `You are Zynergy's AI assistant. Treat all user questions as being about the Zynergy job application tracking app, even if they don't specifically mention it.

For example:
- "I don't know what to do" → Explain the main features and where to start
- "How do I add something?" → Explain how to add a new job application
- "What does this mean?" → Explain the feature they're likely looking at
- "I'm stuck" → Guide them through common tasks

Application Status Flow:
1. Jobs start as "Bookmarked" (saved for later) or "Applied" (already applied)
2. After applying, they can become "Application Received" (confirmation received)
3. "Interview Scheduled" status REQUIRES interviewDateTime to be set - if undefined, it's not a real interview
4. Applications without response become "No Response" after the configured period
5. Final statuses include "NotAccepted", "OfferReceived", "OfferAccepted", "OfferDeclined", or "Withdrawn"

Important Data Rules:
- statusHistory shows the progression of an application over time
- The last entry in statusHistory is the current status
- interviewDateTime being undefined means NO interview is scheduled
- Applications can have multiple interview rounds, each with new "Interview Scheduled" entries
- Only count interviews where:
  * Current status is "Interview Scheduled" AND
  * interviewDateTime is defined AND
  * interviewDateTime is in the future

Example Status Interpretation:
- "Bookmarked" → Not yet applied
- "Applied" → Application submitted, awaiting response
- "Interview Scheduled" without interviewDateTime → Not a real interview yet
- "Interview Scheduled" with past interviewDateTime → Interview already happened

When answering about interviews:
- Only consider applications with defined interview dates
- Check if the interview date is in the future
- Don't count applications that are just "Bookmarked" or "Applied"
- Don't assume an interview exists unless interviewDateTime is set

Key features of Zynergy include:
- Adding and managing job applications
- Tracking application status and follow-ups
- Setting reminders for follow-ups
- Marking applications as stale after a certain period
- Managing no-response periods
- Importing/exporting application data
- Rating job applications
- Parsing job descriptions to extract key details
- Viewing application statistics and reports

Be friendly and helpful, and always assume the user is asking about Zynergy features. If you're not sure about specific technical details, say so.`;

  private userApplications: JobApplication[] = [];

  constructor() {
    const apiKey = (window as any)._env_?.REACT_APP_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  private checkRateLimit() {
    const now = Date.now();
    if (now - this.lastRequestTime >= this.RESET_INTERVAL) {
      // Reset counter if a minute has passed
      this.requestCount = 0;
      this.lastRequestTime = now;
    }

    if (this.requestCount >= this.REQUEST_LIMIT) {
      const waitTime = this.RESET_INTERVAL - (now - this.lastRequestTime);
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    this.requestCount++;
  }

  private createApplicationsContext(applications: JobApplication[]): string {
    if (applications.length === 0) return '';

    // Filter out archived applications
    const activeApplications = applications.filter(app => !app.archived);

    const archivedCount = applications.length - activeApplications.length;
    const recentApps = activeApplications.slice(0, 5);
    const statuses = activeApplications.reduce((acc, app) => {
      const status = app.statusHistory[app.statusHistory.length - 1].status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return `
Current Job Applications Context:
Active Applications: ${activeApplications.length}
${archivedCount > 0 ? `(Note: ${archivedCount} archived applications are not included by default)` : ''}

Status Breakdown:
${Object.entries(statuses).map(([status, count]) => `- ${status}: ${count}`).join('\n')}

Recent Active Applications:
${recentApps.map(app => {
  const currentStatus = app.statusHistory[app.statusHistory.length - 1];
  const daysAgo = Math.floor((Date.now() - new Date(app.statusHistory[0].timestamp).getTime()) / (1000 * 60 * 60 * 24));
  return `- ${app.companyName}: ${app.jobTitle}
    Status: ${currentStatus.status}
    Applied: ${daysAgo} days ago
    Rating: ${app.rating}/5
    ${currentStatus.interviewDateTime ? `Interview: ${new Date(currentStatus.interviewDateTime).toLocaleString()}` : ''}`; 
}).join('\n')}`;
  }

  async generateResponse(prompt: string, useAppContext: boolean = true) {
    try {
      this.checkRateLimit();

      if (prompt.length > 60000) {
        throw new Error('Prompt exceeds maximum length of 60,000 characters');
      }

      // If this is a job details extraction request, use a different path
      if (!useAppContext) {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        try {
          // Clean up any potential markdown formatting
          const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
          JSON.parse(cleanJson); // Validate JSON
          return text;
        } catch (parseError) {
          throw new Error('Could not extract job details. Please check the job description or try adding the details manually.');
        }
      }

      // Otherwise, this is a chat request - use the full context
      const applicationsContext = this.createApplicationsContext(this.userApplications);
      const fullPrompt = `${this.appContext}\n\n${applicationsContext}\n\nUser Question: ${prompt}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      // Only add archived applications note for chat requests
      const archivedCount = this.userApplications.filter(app => app.archived).length;
      if (archivedCount > 0 && !prompt.toLowerCase().includes('archiv')) {
        return `${text}\n\n_Note: This response excludes ${archivedCount} archived application${archivedCount > 1 ? 's' : ''}. To include archived applications, please specifically ask about them._`;
      }

      return text;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Rate limit')) {
          throw error; // Re-throw rate limit errors
        }
        // Handle specific API errors
        if (error.message.includes('429')) {
          throw new Error('API rate limit exceeded. Please try again later.');
        }
        if (error.message.includes('401')) {
          throw new Error('API key is invalid or expired.');
        }
      }
      console.error('Failed to generate response:', error);
      throw error; // Throw the actual error to be handled by the UI
    }
  }

  // Optional: Method to update system context with specific instructions
  async updateSystemContext(instructions: string) {
    this.appContext += `\n\nAdditional App Instructions:\n${instructions}`;
  }

  // Optional: Method to check remaining quota
  getRemainingQuota() {
    return {
      requestsThisMinute: this.requestCount,
      requestsRemaining: this.REQUEST_LIMIT - this.requestCount
    };
  }

  // Add method to update applications context
  public updateApplicationsContext(applications: JobApplication[]) {
    this.userApplications = applications;
  }
}

export const geminiService = new GeminiService(); 