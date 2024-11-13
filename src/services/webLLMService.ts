import * as webllm from "@mlc-ai/web-llm";

export interface InitProgressCallback {
  (report: webllm.InitProgressReport): void;
}

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatChoice {
  message: ChatMessage;
  index: number;
  finish_reason: string;
}

interface ChatResponse {
  id: string;
  choices: ChatChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class WebLLMService {
  private engine: webllm.MLCEngineInterface | null = null;
  private selectedModel = "Llama-3.1-8B-Instruct-q4f32_1-MLC";

  async initialize(initProgressCallback: InitProgressCallback) {
    try {
      console.log("Starting WebLLM initialization...");
      this.engine = await webllm.CreateMLCEngine(
        this.selectedModel,
        {
          initProgressCallback: (report) => {
            console.log("Init progress:", report);
            initProgressCallback(report);
          },
          logLevel: "INFO",
        },
        {
          context_window_size: 2048,
        }
      );
      console.log("WebLLM initialization successful");
      return true;
    } catch (error) {
      console.error("Failed to initialize WebLLM:", error);
      return false;
    }
  }

  async generateResponse(prompt: string): Promise<ChatResponse> {
    if (!this.engine) {
      throw new Error("WebLLM engine not initialized");
    }

    try {
      const reply = await this.engine.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 256,
      });
      return reply as ChatResponse;
    } catch (error) {
      console.error("Failed to generate response:", error);
      throw error;
    }
  }
}

export const webLLMService = new WebLLMService(); 