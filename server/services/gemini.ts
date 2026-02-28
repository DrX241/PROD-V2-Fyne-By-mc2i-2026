import { ChatCompletionRequestMessage } from "./openAiTypes";

interface CachedResponse {
  content: string;
  timestamp: number;
}

class GeminiService {
  private apiKey: string;
  private baseUrl: string;
  private responseCache: Map<string, CachedResponse> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 60;
  private connectionStatus: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  private lastConnectionCheck: number = 0;
  private readonly CONNECTION_CHECK_INTERVAL = 1000 * 60 * 5;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";

    console.log(`Initializing Gemini FYNE Service`);
    console.log(`Gemini API Key: ***${this.apiKey ? this.apiKey.slice(-5) : "non définie"}`);

    if (!this.apiKey) {
      console.error("ERREUR: Aucune clé API Gemini fournie (GEMINI_API_KEY)");
    }

    this.checkConnection();
    this.startPeriodicConnectionCheck();
  }

  private startPeriodicConnectionCheck(): void {
    setInterval(() => {
      const now = Date.now();
      if (now - this.lastConnectionCheck >= this.CONNECTION_CHECK_INTERVAL) {
        this.checkConnection();
      }
    }, this.CONNECTION_CHECK_INTERVAL);
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/gemini-flash-latest:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Hello" }] }],
            generationConfig: { maxOutputTokens: 5 }
          })
        }
      );

      if (response.ok) {
        this.connectionStatus = 'connected';
        this.lastConnectionCheck = Date.now();
        console.log("Connection to Gemini FYNE successful");
        return true;
      } else {
        const errorData = await response.text();
        console.error("Gemini connection check failed:", errorData);
        this.connectionStatus = 'disconnected';
        return false;
      }
    } catch (error) {
      console.error("Error checking Gemini connection:", error);
      this.connectionStatus = 'disconnected';
      return false;
    }
  }

  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  getLastConnectionCheck(): number {
    return this.lastConnectionCheck;
  }

  getModelName(): string {
    return "Gemini FYNE";
  }

  async generateContent(prompt: string, temperature: number = 0.7, maxTokens: number = 2000): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}/gemini-flash-latest:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      }

      throw new Error("Format de réponse Gemini inattendu");
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw error;
    }
  }

  async chat(messages: Array<{role: string, content: string}>, temperature: number = 0.7, maxTokens: number = 2000): Promise<string> {
    try {
      const geminiContents: any[] = [];
      let systemInstruction = "";

      for (const msg of messages) {
        if (msg.role === 'system') {
          systemInstruction += msg.content + "\n";
        } else {
          geminiContents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }
      }

      if (geminiContents.length === 0) {
        geminiContents.push({ role: 'user', parts: [{ text: 'Bonjour' }] });
      }

      const requestBody: any = {
        contents: geminiContents,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      };

      if (systemInstruction) {
        requestBody.systemInstruction = {
          parts: [{ text: systemInstruction.trim() }]
        };
      }

      const response = await fetch(
        `${this.baseUrl}/gemini-flash-latest:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      }

      throw new Error("Format de réponse Gemini inattendu");
    } catch (error) {
      console.error("Error calling Gemini chat API:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
