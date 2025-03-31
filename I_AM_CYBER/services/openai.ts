import { ChatCompletionRequestMessage } from "../../shared/schema";
import axios from "axios";

interface OpenAIConfig {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
  apiVersion: string;
}

interface CachedResponse {
  content: string;
  timestamp: number;
}

class OpenAIService {
  private config: OpenAIConfig;
  private responseCache: Map<string, CachedResponse> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 60; // 1 heure en millisecondes
  private connectionStatus: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  private lastConnectionCheck: number = 0;
  private readonly CONNECTION_CHECK_INTERVAL = 1000 * 60 * 5; // 5 minutes

  constructor() {
    // Log des variables d'environnement pour débogage
    console.log("ENV VARS DEBUG:");
    console.log("AZURE_OPENAI_ENDPOINT:", process.env.AZURE_OPENAI_ENDPOINT ? "existe" : "n'existe pas");
    console.log("AZURE_OPENAI_API_KEY:", process.env.AZURE_OPENAI_API_KEY ? "existe" : "n'existe pas");
    console.log("AZURE_OPENAI_DEPLOYMENT_NAME:", process.env.AZURE_OPENAI_DEPLOYMENT_NAME ? "existe" : "n'existe pas");
    console.log("AZURE_OPENAI_API_VERSION:", process.env.AZURE_OPENAI_API_VERSION ? "existe" : "n'existe pas");
    
    // On observe que les variables ne sont pas correctement chargées depuis .env
    // Nous allons utiliser les valeurs directement du fichier .env
    
    const endpoint = "https://eddy-02-2025-azureaiservices017852658000.openai.azure.com";
    const deploymentName = "Eddy-deploy-20-02-2025-gpt-4o";
    const apiKey = process.env.AZURE_OPENAI_API_KEY || "";
    const apiVersion = "2024-03-01-preview";
    
    console.log("Configuration OpenAI utilisant:");
    console.log("- endpoint:", endpoint);
    console.log("- deploymentName:", deploymentName);
    console.log("- apiKey exists:", !!apiKey);
    console.log("- apiVersion:", apiVersion);
    
    this.config = {
      endpoint: endpoint,
      apiKey: apiKey,
      deploymentName: deploymentName,
      apiVersion: apiVersion
    };
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
    
    // Sinon, appeler l'API
    const content = await this.getChatCompletion(messages, temperature, maxTokens);
    
    // Mettre en cache la réponse
    this.responseCache.set(cacheKey, {
      content,
      timestamp: Date.now()
    });
    
    return content;
  }

  // Méthode existante mais améliorée avec retry pattern et backoff exponentiel
  async getChatCompletion(
    messages: ChatCompletionRequestMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000
  ): Promise<string> {
    let retries = 3; // Nombre maximal de tentatives
    let delay = 1000; // Délai initial en ms
    
    while (retries >= 0) {
      try {
        // Construire correctement l'URL pour Azure
        const url = `${this.config.endpoint}/openai/deployments/${this.config.deploymentName || 'Eddy-deploy-20-02-2025-gpt-4o'}/chat/completions?api-version=${this.config.apiVersion}`;
        console.log("Calling Azure OpenAI with URL:", url);
        
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
            },
            timeout: 30000 // Timeout de 30 secondes
          }
        );

        // Mise à jour du statut de connexion
        this.connectionStatus = 'connected';
        this.lastConnectionCheck = Date.now();
        
        return response.data.choices[0].message.content;
      } catch (error) {
        retries--;
        console.error(`Error calling Azure OpenAI (retries left: ${retries}):`, error);
        
        if (axios.isAxiosError(error)) {
          // Si c'est une erreur 429 (rate limit) ou une erreur 5xx (serveur)
          if (error.response && (error.response.status === 429 || error.response.status >= 500)) {
            if (retries >= 0) {
              console.log(`Retrying in ${delay}ms...`);
              this.connectionStatus = 'reconnecting';
              await new Promise(resolve => setTimeout(resolve, delay));
              delay *= 2; // Backoff exponentiel
              continue;
            }
          }
          // Pour les autres erreurs HTTP, pas de retry
          console.error("Response data:", error.response?.data);
          console.error("Response status:", error.response?.status);
        }
        
        this.connectionStatus = 'disconnected';
        
        if (retries < 0) {
          throw new Error("Failed to get completion from Azure OpenAI after multiple attempts");
        }
      }
    }
    
    throw new Error("Failed to get completion from Azure OpenAI");
  }

  // Outil de surveillance de la connexion
  async checkConnection(): Promise<boolean> {
    try {
      // Afficher les paramètres de configuration pour debug
      console.log("Azure OpenAI Configuration Debug:");
      console.log("Endpoint exists:", !!this.config.endpoint);
      console.log("API Key exists:", !!this.config.apiKey);
      console.log("Deployment Name exists:", !!this.config.deploymentName);
      
      // Vérifier que tous les paramètres requis sont disponibles
      if (!this.config.endpoint || !this.config.apiKey) {
        console.error("Azure OpenAI configuration is incomplete. Missing endpoint or API key.");
        this.connectionStatus = 'disconnected';
        return false;
      }
      
      // Vérifier si nous avons déjà effectué un contrôle récemment
      if (this.connectionStatus === 'connected' && 
          (Date.now() - this.lastConnectionCheck) < this.CONNECTION_CHECK_INTERVAL) {
        return true;
      }
      
      // Simple message pour tester la connexion
      const testMessage: ChatCompletionRequestMessage[] = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Respond with 'OK' if you can read this." }
      ];
      
      // Vérifier et afficher les paramètres pour le débogage
      console.log("Deployment name:", this.config.deploymentName);
      
      // Construire correctement l'URL pour Azure
      const url = `${this.config.endpoint}/openai/deployments/${this.config.deploymentName || 'Eddy-deploy-20-02-2025-gpt-4o'}/chat/completions?api-version=${this.config.apiVersion}`;
      console.log("Testing Azure OpenAI connection with url:", url);
      
      // Appel direct à l'API (sans passer par getChatCompletion pour éviter les retries)
      const response = await axios.post(
        url,
        {
          messages: testMessage,
          temperature: 0.1,
          max_tokens: 10,
          stream: false
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": this.config.apiKey
          },
          timeout: 10000 // Timeout court pour le health check
        }
      );
      
      const success = !!response.data.choices[0].message.content;
      this.connectionStatus = success ? 'connected' : 'disconnected';
      this.lastConnectionCheck = Date.now();
      
      console.log(`Azure OpenAI connection status: ${this.connectionStatus}`);
      return success;
    } catch (error) {
      console.error("Error checking Azure OpenAI connection:", error);
      this.connectionStatus = 'disconnected';
      return false;
    }
  }

  // Accesseurs pour l'état de connexion
  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  getLastConnectionCheck(): number {
    return this.lastConnectionCheck;
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
