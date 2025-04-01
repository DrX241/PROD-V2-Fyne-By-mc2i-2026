import { ChatCompletionRequestMessage } from "../../shared/schema";
import axios from "axios";

interface OpenAIConfig {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
  apiVersion: string;
  modelName: string; // Nom du modèle pour l'affichage
}

interface CachedResponse {
  content: string;
  timestamp: number;
}

export type ApiKeyType = 'primary' | 'secondary';

class OpenAIService {
  private primaryConfig: OpenAIConfig;
  private secondaryConfig: OpenAIConfig;
  private currentConfig: ApiKeyType = 'secondary';
  private responseCache: Map<string, CachedResponse> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 60; // 1 heure en millisecondes
  private connectionStatus: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  private lastConnectionCheck: number = 0;
  private readonly CONNECTION_CHECK_INTERVAL = 1000 * 60 * 5; // 5 minutes
  
  constructor() {
    try {
      // Récupérer le nom des modèles (avec valeurs par défaut)
      const primaryModelName = process.env.AZURE_OPENAI_MODEL_NAME || "GPT-4o";
      const secondaryModelName = process.env.AZURE_OPENAI_MODEL_NAME_SECONDARY || "GPT-4o-mini";
      
      // Récupération des endpoints - Utiliser des valeurs connues pour le développement
      let primaryEndpoint = "https://example-primary.openai.azure.com";
      let secondaryEndpoint = "https://example-secondary.openai.azure.com";
      
      // Vérifier si les variables d'environnement sont définies
      if (process.env.AZURE_OPENAI_ENDPOINT) {
        primaryEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
        console.log("Using environment variable for primary endpoint");
      }
      
      if (process.env.AZURE_OPENAI_ENDPOINT_SECONDARY) {
        secondaryEndpoint = process.env.AZURE_OPENAI_ENDPOINT_SECONDARY;
        console.log("Using environment variable for secondary endpoint");
      }
      
      // S'assurer que les endpoints ne se terminent pas par un slash
      const cleanPrimaryEndpoint = primaryEndpoint.endsWith('/') ? primaryEndpoint.slice(0, -1) : primaryEndpoint;
      const cleanSecondaryEndpoint = secondaryEndpoint.endsWith('/') ? secondaryEndpoint.slice(0, -1) : secondaryEndpoint;
      
      // Récupérer les autres paramètres de configuration avec des valeurs factices pour le développement
      let primaryApiKey = "primary-api-key-placeholder";
      let primaryDeploymentName = "gpt4o-deployment";
      let primaryApiVersion = "2024-03-01-preview";
      
      let secondaryApiKey = "secondary-api-key-placeholder";
      let secondaryDeploymentName = "gpt4o-mini-deployment";
      let secondaryApiVersion = "2024-03-01-preview";
      
      // Vérifier si les variables d'environnement sont définies
      if (process.env.AZURE_OPENAI_API_KEY) {
        primaryApiKey = process.env.AZURE_OPENAI_API_KEY;
        console.log("Using environment variable for primary API key");
      }
      
      if (process.env.AZURE_OPENAI_DEPLOYMENT_NAME) {
        primaryDeploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
        console.log("Using environment variable for primary deployment name");
      }
      
      if (process.env.AZURE_OPENAI_API_VERSION) {
        primaryApiVersion = process.env.AZURE_OPENAI_API_VERSION;
        console.log("Using environment variable for primary API version");
      }
      
      if (process.env.AZURE_OPENAI_API_KEY_SECONDARY) {
        secondaryApiKey = process.env.AZURE_OPENAI_API_KEY_SECONDARY;
        console.log("Using environment variable for secondary API key");
      }
      
      if (process.env.AZURE_OPENAI_DEPLOYMENT_NAME_SECONDARY) {
        secondaryDeploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME_SECONDARY;
        console.log("Using environment variable for secondary deployment name");
      }
      
      if (process.env.AZURE_OPENAI_API_VERSION_SECONDARY) {
        secondaryApiVersion = process.env.AZURE_OPENAI_API_VERSION_SECONDARY;
        console.log("Using environment variable for secondary API version");
      }
      console.log(`OpenAI Service initialized with primary model: ${primaryModelName}`);
      console.log(`OpenAI Service initialized with secondary model: ${secondaryModelName}`);
      
      this.primaryConfig = {
        endpoint: cleanPrimaryEndpoint,
        apiKey: primaryApiKey,
        deploymentName: primaryDeploymentName,
        apiVersion: primaryApiVersion,
        modelName: primaryModelName
      };
      
      this.secondaryConfig = {
        endpoint: cleanSecondaryEndpoint,
        apiKey: secondaryApiKey,
        deploymentName: secondaryDeploymentName,
        apiVersion: secondaryApiVersion,
        modelName: secondaryModelName
      };
    } catch (error) {
      console.error("Error initializing OpenAI Service:", error);
      // Initialiser avec des valeurs par défaut en cas d'erreur
      this.primaryConfig = {
        endpoint: "https://example-primary.openai.azure.com",
        apiKey: "primary-api-key-placeholder",
        deploymentName: "gpt4o-deployment",
        apiVersion: "2024-03-01-preview",
        modelName: "GPT-4o"
      };
      
      this.secondaryConfig = {
        endpoint: "https://example-secondary.openai.azure.com",
        apiKey: "secondary-api-key-placeholder",
        deploymentName: "gpt4o-mini-deployment",
        apiVersion: "2024-03-01-preview",
        modelName: "GPT-4o-mini"
      };
    }
  }
  
  // Méthode pour basculer entre les configurations
  switchApiKey(type: ApiKeyType): void {
    this.currentConfig = type;
    this.responseCache.clear(); // Vider le cache lors du changement de modèle
    this.lastConnectionCheck = 0; // Forcer une vérification de connexion
    console.log(`Switched to ${type} API key (${this.getCurrentConfig().modelName})`);
  }
  
  // Obtenir la configuration active
  getCurrentConfig(): OpenAIConfig {
    return this.currentConfig === 'primary' ? this.primaryConfig : this.secondaryConfig;
  }
  
  // Obtenir le type de configuration actuelle
  getCurrentConfigType(): ApiKeyType {
    return this.currentConfig;
  }
  
  // Obtenir le nom du modèle actuel pour l'affichage
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
    const config = this.getCurrentConfig();
    
    while (retries >= 0) {
      try {
        const url = `${config.endpoint}/openai/deployments/${config.deploymentName}/chat/completions?api-version=${config.apiVersion}`;
        
        console.log(`Using ${config.modelName} model for this request`);
        
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
              "api-key": config.apiKey
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
        console.error(`Error calling Azure OpenAI ${config.modelName} (retries left: ${retries}):`, error);
        
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
          throw new Error(`Failed to get completion from Azure OpenAI ${config.modelName} after multiple attempts`);
        }
      }
    }
    
    throw new Error(`Failed to get completion from Azure OpenAI ${config.modelName}`);
  }

  // Outil de surveillance de la connexion
  async checkConnection(): Promise<boolean> {
    try {
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
      
      // Obtenir la configuration active
      const config = this.getCurrentConfig();
      
      // Appel direct à l'API (sans passer par getChatCompletion pour éviter les retries)
      console.log("Checking API connection with config:", { 
        endpoint: config.endpoint, 
        deploymentName: config.deploymentName,
        apiVersion: config.apiVersion 
      });
      
      const url = `${config.endpoint}/openai/deployments/${config.deploymentName}/chat/completions?api-version=${config.apiVersion}`;
      console.log("Full API URL:", url);
      
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
            "api-key": config.apiKey
          },
          timeout: 10000 // Timeout court pour le health check
        }
      );
      
      const success = !!response.data.choices[0].message.content;
      this.connectionStatus = success ? 'connected' : 'disconnected';
      this.lastConnectionCheck = Date.now();
      
      console.log(`Azure OpenAI connection status (${config.modelName}): ${this.connectionStatus}`);
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
