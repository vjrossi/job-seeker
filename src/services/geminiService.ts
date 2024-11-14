import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  private readonly REQUEST_LIMIT = 60; // requests per minute
  private readonly RESET_INTERVAL = 60000; // 1 minute in milliseconds
  private systemContext: string = `You are an AI assistant for a job application tracking app. 
  The app helps users track their job applications and follow-ups.
  Key features include:
  - Adding and managing job applications
  - Tracking application status and follow-ups
  - Setting reminders for follow-ups
  - Marking applications as stale after a certain period
  - Managing no-response periods
  
  Please provide helpful, specific answers about using the app and job application best practices.
  If asked about technical details you're not sure about, please say so rather than making assumptions.`;

  constructor() {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
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

  async generateResponse(prompt: string) {
    try {
      this.checkRateLimit();

      if (prompt.length > 60000) {
        throw new Error('Prompt exceeds maximum length of 60,000 characters');
      }

      // Combine system context with user's prompt
      const fullPrompt = `${this.systemContext}\n\nUser Question: ${prompt}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
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
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Optional: Method to update system context with specific instructions
  async updateSystemContext(instructions: string) {
    this.systemContext += `\n\nAdditional App Instructions:\n${instructions}`;
  }

  // Optional: Method to check remaining quota
  getRemainingQuota() {
    return {
      requestsThisMinute: this.requestCount,
      requestsRemaining: this.REQUEST_LIMIT - this.requestCount
    };
  }
}

export const geminiService = new GeminiService(); 