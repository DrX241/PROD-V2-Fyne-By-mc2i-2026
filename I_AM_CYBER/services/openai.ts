import { ChatCompletionRequestMessage } from "../../shared/schema";
import axios from "axios";

interface OpenAIConfig {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
  apiVersion: string;
  modelName: string;
}

interface CachedResponse {
  content: string;
  timestamp: number;
}

export type ApiKeyType = 'primary' | 'secondary';

class OpenAIService {
  private primaryConfig: OpenAIConfig;
  private secondaryConfig: OpenAIConfig;
  private currentConfig: ApiKeyType = 'primary';
  private responseCache: Map<string, CachedResponse> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 60;
  private connectionStatus: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  private lastConnectionCheck: number = 0;
  private readonly CONNECTION_CHECK_INTERVAL = 1000 * 60 * 5;

  constructor() {
    console.log("Initializing Azure OpenAI Service with user-provided configuration");
    // Clé API exacte fournie par l'utilisateur
    const apiKey = "1Ue0sQ11eK6J7iLNvSM9HgXOiIqg2a697PTB33PmM9IIDDsA3d4kJQQJ99BBACfhMk5XJ3w3AAAAACOGuvaK";
    // Utiliser uniquement le domaine de base, pas l'URL complète
    const baseEndpoint = "https://eddy-02-2025-azureaiservices017852658000.openai.azure.com";
    
    console.log("API Key: ****** (HIDDEN)");
    console.log("Endpoint: " + baseEndpoint);

    // Configuration unique - GPT-4o
    this.primaryConfig = {
      endpoint: baseEndpoint,
      apiKey: apiKey,
      deploymentName: "Eddy-deploy-20-02-2025-gpt-4o",
      apiVersion: "2025-01-01-preview",
      modelName: "gpt-4o"
    };

    // Configuration secondaire identique (pour compatibilité avec l'interface)
    this.secondaryConfig = {
      endpoint: baseEndpoint,
      apiKey: apiKey,
      deploymentName: "Eddy-deploy-20-02-2025-gpt-4o",
      apiVersion: "2025-01-01-preview",
      modelName: "gpt-4o"
    };

    console.log("Azure OpenAI Service initialized with model: " + this.primaryConfig.modelName);
    console.log("Endpoint: " + this.primaryConfig.endpoint);

    this.checkConnection();
  }

  switchApiKey(type: ApiKeyType): void {
    // Toujours utiliser la configuration primaire
    this.currentConfig = 'primary';
    this.responseCache.clear();
    this.lastConnectionCheck = 0;
    console.log(`Utilisation de l'API GPT-4o uniquement (${this.getCurrentConfig().modelName})`);
  }

  getCurrentConfig(): OpenAIConfig {
    return this.currentConfig === 'primary' ? this.primaryConfig : this.secondaryConfig;
  }

  async getChatCompletion(
    messages: ChatCompletionRequestMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000
  ): Promise<string> {
    try {
      const config = this.getCurrentConfig();
      // Utiliser l'endpoint exact fourni par l'utilisateur
      const url = `${config.endpoint}/openai/deployments/${config.deploymentName}/chat/completions?api-version=${config.apiVersion}`;
      
      console.log(`Making API request to: ${url} with ${config.modelName}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.apiKey
        },
        body: JSON.stringify({
          messages: messages,
          temperature: temperature,
          max_tokens: maxTokens
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Azure OpenAI API error (${response.status}): ${errorText}`);
        this.connectionStatus = 'disconnected';
        throw new Error(`Azure OpenAI API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      if (data?.choices?.[0]?.message?.content) {
        this.connectionStatus = 'connected';
        this.lastConnectionCheck = Date.now();
        return data.choices[0].message.content;
      } else {
        throw new Error("Invalid response format from Azure OpenAI API");
      }
    } catch (error) {
      console.error("Error calling Azure OpenAI API:", error);
      this.connectionStatus = 'disconnected';
      throw error;
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      const now = Date.now();
      if (now - this.lastConnectionCheck < this.CONNECTION_CHECK_INTERVAL) {
        return this.connectionStatus === 'connected';
      }

      this.lastConnectionCheck = now;
      const config = this.getCurrentConfig();

      // Utiliser l'endpoint exact fourni par l'utilisateur 
      const url = `${config.endpoint}/openai/deployments/${config.deploymentName}/chat/completions?api-version=${config.apiVersion}`;
      
      console.log(`Checking connection to Azure OpenAI at: ${url}`);

      const testMessage = {
        messages: [{ role: "user", content: "Test connection" }],
        max_tokens: 5,
        temperature: 0
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.apiKey
        },
        body: JSON.stringify(testMessage),
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        console.log("Connection to Azure OpenAI successful");
        this.connectionStatus = 'connected';
        return true;
      }

      console.error(`Connection check failed: ${response.status} ${response.statusText}`);
      this.connectionStatus = 'disconnected';
      return false;
    } catch (error) {
      console.error("Error checking connection to Azure OpenAI:", error);
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

  getCurrentApiKeyType(): ApiKeyType {
    return this.currentConfig;
  }

  getCurrentModelName(): string {
    return this.getCurrentConfig().modelName;
  }

  // Méthode principale pour obtenir une complétion avec gestion du cache
  async getChatCompletionWithCache(
    messages: ChatCompletionRequestMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000
  ): Promise<string> {
    const cacheKey = this.getCacheKey(messages, temperature, maxTokens);

    // Vérifier si la réponse est dans le cache et toujours valide
    const cachedResponse = this.responseCache.get(cacheKey);
    if (cachedResponse && (Date.now() - cachedResponse.timestamp) < this.CACHE_TTL) {
      console.log("Using cached response");
      return cachedResponse.content;
    }

    // Toujours appeler l'API réelle - nous n'utilisons plus de réponses simulées
    const content = await this.getChatCompletion(messages, temperature, maxTokens);

    // Mettre en cache la réponse
    this.responseCache.set(cacheKey, {
      content,
      timestamp: Date.now()
    });

    return content;
  }


  // Cette méthode n'est plus utilisée - Nous utilisons toujours l'API réelle
  // Conservée uniquement comme référence, mais jamais appelée
  private getSimulatedResponse(messages: ChatCompletionRequestMessage[]): string {
    // En cas d'erreur de l'API, nous préférons lever une exception plutôt que de simuler
    throw new Error("Les réponses simulées ne sont plus prises en charge - Impossible de se connecter à l'API OpenAI");
  }

  // Génère une clé de cache unique
  private getCacheKey(messages: ChatCompletionRequestMessage[], temperature: number, maxTokens: number): string {
    // Créer une clé de cache unique basée sur les paramètres
    return JSON.stringify({
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature,
      maxTokens
    });
  }

  async generateSystemPrompt(configParams: { 
    difficultyLevel?: string; 
    responseStyle?: string; 
  } = {}): Promise<string> {
    try {
      // Read the master prompt from file
      const fs = await import('fs');
      const path = await import('path');

      // Chemin du prompt principal qui définit le comportement global de l'IA
      const masterPromptPath = path.join(process.cwd(), 'I_AM_CYBER', 'prompts', 'master_prompt.txt');

      // Lire le prompt maître - celui-ci contient toutes les instructions de comportement
      let systemPrompt = fs.readFileSync(masterPromptPath, 'utf8');

      // Add configuration specific instructions
      const { difficultyLevel = "Intermédiaire", responseStyle = "Professionnel" } = configParams;

      systemPrompt += `\n\n# CONFIGURATION ACTUELLE:`;
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