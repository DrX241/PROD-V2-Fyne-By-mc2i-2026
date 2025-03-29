import { ChatCompletionRequestMessage } from "../../shared/schema";
import axios from "axios";

interface OpenAIConfig {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
  apiVersion: string;
}

class OpenAIService {
  private config: OpenAIConfig;

  constructor() {
    this.config = {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || "https://eddy-02-2025-azureaiservices017852658000.openai.azure.com/openai/deployments/Eddy-deploy-20-02-2025-gpt-4o/chat/completions",
      apiKey: process.env.AZURE_OPENAI_API_KEY || "1Ue0sQ11eK6J7iLNvSM9HgXOiIqg2a697PTB33PmM9IIDDsA3d4kJQQJ99BBACfhMk5XJ3w3AAAAACOGuvaK",
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "Eddy-deploy-20-02-2025-gpt-4o",
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview"
    };
  }

  async getChatCompletion(
    messages: ChatCompletionRequestMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000
  ): Promise<string> {
    try {
      const url = `${this.config.endpoint}?api-version=${this.config.apiVersion}`;
      
      const response = await axios.post(
        url,
        {
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": this.config.apiKey
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling Azure OpenAI:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw new Error("Failed to get completion from Azure OpenAI");
    }
  }

  async generateSystemPrompt(configParams: { 
    difficultyLevel?: string; 
    responseStyle?: string; 
  } = {}): Promise<string> {
    try {
      // Read the base system prompt from file
      const fs = await import('fs');
      const path = await import('path');
      const systemPromptPath = path.join(process.cwd(), 'I_AM_CYBER', 'prompts', 'system_prompt.txt');
      let systemPrompt = fs.readFileSync(systemPromptPath, 'utf8');
      
      // Add configuration specific instructions
      const { difficultyLevel = "Intermédiaire", responseStyle = "Professionnel" } = configParams;
      
      systemPrompt += `\n\nCONFIGURATION ACTUELLE:`;
      systemPrompt += `\n- Niveau de difficulté: ${difficultyLevel}`;
      systemPrompt += `\n- Style de réponse: ${responseStyle}`;
      
      if (difficultyLevel === "Débutant") {
        systemPrompt += `\n\nComme il s'agit d'un niveau débutant, utilisez un langage accessible, évitez le jargon technique trop complexe et fournissez plus d'explications pour les concepts clés.`;
      } else if (difficultyLevel === "Expert") {
        systemPrompt += `\n\nComme il s'agit d'un niveau expert, utilisez une terminologie technique précise et supposez que l'utilisateur a une bonne compréhension des concepts de cybersécurité. Proposez des défis plus complexes.`;
      }
      
      if (responseStyle === "Détaillé et pédagogique") {
        systemPrompt += `\n\nAdoptez un style détaillé et pédagogique. Fournissez des explications complètes et contextuelles.`;
      } else if (responseStyle === "Concis et direct") {
        systemPrompt += `\n\nAdoptez un style concis et direct. Allez droit au but et évitez les détails superflus.`;
      }
      
      return systemPrompt;
    } catch (error) {
      console.error("Error generating system prompt:", error);
      throw new Error("Failed to generate system prompt");
    }
  }
}

export const openAIService = new OpenAIService();
