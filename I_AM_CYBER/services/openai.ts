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
  private currentConfig: ApiKeyType = 'secondary';
  private responseCache: Map<string, CachedResponse> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 60;
  private connectionStatus: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  private lastConnectionCheck: number = 0;
  private readonly CONNECTION_CHECK_INTERVAL = 1000 * 60 * 5;

  constructor() {
    console.log("Initializing Azure OpenAI Service with configuration from secrets");
    
    // Récupération des infos pour GPT-4o depuis les variables d'environnement
    const gpt4oApiKey = process.env.GPT4O_API_KEY || "";
    const gpt4oEndpoint = process.env.GPT4O_ENDPOINT || "";
    const gpt4oDeploymentName = process.env.GPT4O_DEPLOYMENT_NAME || "gpt-4o";
    const gpt4oApiVersion = process.env.GPT4O_API_VERSION || "2025-01-01-preview";
    
    // Récupération des infos pour GPT-4o-mini depuis les variables d'environnement
    const gpt4oMiniApiKey = process.env.GPT4O_MINI_API_KEY || "";
    const gpt4oMiniEndpoint = process.env.GPT4O_MINI_ENDPOINT || "";
    const gpt4oMiniDeploymentName = process.env.GPT4O_MINI_DEPLOYMENT_NAME || "gpt-4o-mini";
    const gpt4oMiniApiVersion = process.env.GPT4O_MINI_API_VERSION || "2024-12-01-preview";
    
    // Log pour le debug des valeurs (sans exposer la clé complète)
    console.log(`GPT-4o API Key: ***${gpt4oApiKey ? gpt4oApiKey.slice(-5) : "non définie"}`);
    console.log(`GPT-4o Endpoint: ${gpt4oEndpoint}`);
    console.log(`GPT-4o Deployment Name: ${gpt4oDeploymentName}`);
    console.log(`GPT-4o API Version: ${gpt4oApiVersion}`);
    
    console.log(`GPT-4o-mini API Key: ***${gpt4oMiniApiKey ? gpt4oMiniApiKey.slice(-5) : "non définie"}`);
    console.log(`GPT-4o-mini Endpoint: ${gpt4oMiniEndpoint}`);
    console.log(`GPT-4o-mini Deployment Name: ${gpt4oMiniDeploymentName}`);
    console.log(`GPT-4o-mini API Version: ${gpt4oMiniApiVersion}`);
    
    // Vérification des valeurs pour GPT-4o
    if (!gpt4oApiKey) {
      console.error("ERREUR: Aucune clé API fournie pour GPT-4o");
    }
    
    if (!this.isValidURL(gpt4oEndpoint)) {
      console.error("ERREUR: L'endpoint GPT-4o n'est pas une URL valide");
    }
    
    // Vérification des valeurs pour GPT-4o-mini
    if (!gpt4oMiniApiKey) {
      console.error("ERREUR: Aucune clé API fournie pour GPT-4o-mini");
    }
    
    if (!this.isValidURL(gpt4oMiniEndpoint)) {
      console.error("ERREUR: L'endpoint GPT-4o-mini n'est pas une URL valide");
    }

    // Configuration primaire - GPT-4o
    this.primaryConfig = {
      endpoint: gpt4oEndpoint,
      apiKey: gpt4oApiKey,
      deploymentName: gpt4oDeploymentName,
      apiVersion: gpt4oApiVersion,
      modelName: "gpt-4o"
    };

    // Configuration secondaire - GPT-4o-mini
    this.secondaryConfig = {
      endpoint: gpt4oMiniEndpoint,
      apiKey: gpt4oMiniApiKey,
      deploymentName: gpt4oMiniDeploymentName,
      apiVersion: gpt4oMiniApiVersion,
      modelName: "gpt-4o-mini"
    };
    
    console.log(`Azure OpenAI Service initialized with primary model: ${this.primaryConfig.modelName}`);
    console.log(`Azure OpenAI Service initialized with secondary model: ${this.secondaryConfig.modelName}`);
    
    // Vérification initiale de la connexion avec le service Azure OpenAI
    // Formatage correct de l'URL : suppression des doubles slashes
    let baseEndpoint = this.secondaryConfig.endpoint;
    if (baseEndpoint.endsWith('/')) {
      baseEndpoint = baseEndpoint.slice(0, -1);
    }
    
    console.log(`Checking connection to Azure OpenAI at: ${baseEndpoint}/openai/deployments/${this.secondaryConfig.deploymentName}/chat/completions?api-version=${this.secondaryConfig.apiVersion}`);
    
    this.checkConnection();
  }

  // Valide que l'URL est correctement formatée
  private isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  switchApiKey(type: ApiKeyType): void {
    this.currentConfig = type;
    this.responseCache.clear();
    this.lastConnectionCheck = 0;
    console.log(`Switched to ${type} API key (${this.getCurrentConfig().modelName})`);
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
      
      // Formatage correct de l'URL : suppression des doubles slashes
      let baseEndpoint = config.endpoint;
      if (baseEndpoint.endsWith('/')) {
        baseEndpoint = baseEndpoint.slice(0, -1);
      }
      
      const url = `${baseEndpoint}/openai/deployments/${config.deploymentName}/chat/completions?api-version=${config.apiVersion}`;

      console.log(`Making API request to: ${url} with ${config.modelName}`);
      
      // Afficher plus de détails sur les paramètres de la requête (sans la clé API)
      console.log(`Request parameters: temperature=${temperature}, max_tokens=${maxTokens}`);
      console.log(`Nombre de messages: ${messages.length}, Premier role: ${messages[0]?.role}`);
      
      // Formater la requête pour l'API
      const requestBody = {
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens
      };
      
      console.log(`Requête formatée pour ${config.deploymentName}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Azure OpenAI API error (${response.status}): ${errorText}`);
        console.error(`Endpoint: ${url}`);
        console.error(`Modèle: ${config.modelName}, Deployment: ${config.deploymentName}, API version: ${config.apiVersion}`);
        this.connectionStatus = 'disconnected';
        
        // Analyser le texte d'erreur pour des détails plus clairs
        let detailedError = `Azure OpenAI API error (${response.status})`;
        try {
          // Essayer de parser l'erreur au format JSON 
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            if (errorJson.error.message) {
              detailedError += `: ${errorJson.error.message}`;
            }
            if (errorJson.error.code) {
              detailedError += ` (Code: ${errorJson.error.code})`;
            }
          }
        } catch (parseError) {
          // Si ce n'est pas un JSON valide, utiliser simplement le texte brut
          detailedError += `: ${errorText}`;
        }
        
        throw new Error(detailedError);
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

      const testMessage = {
        messages: [{ role: "user", content: "Test connection" }],
        max_tokens: 5,
        temperature: 0
      };

      // Formatage correct de l'URL : suppression des doubles slashes
      let baseEndpoint = config.endpoint;
      if (baseEndpoint.endsWith('/')) {
        baseEndpoint = baseEndpoint.slice(0, -1);
      }
      
      const url = `${baseEndpoint}/openai/deployments/${config.deploymentName}/chat/completions?api-version=${config.apiVersion}`;

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
        console.log(`Connection to Azure OpenAI successful with model: ${config.modelName} (${config.deploymentName})`);
        this.connectionStatus = 'connected';
        return true;
      }

      // Obtenir les détails de l'erreur
      let errorDetails = '';
      try {
        const errorText = await response.text();
        console.error(`Connection check failed response: ${errorText}`);
        
        try {
          // Tenter de parser l'erreur JSON
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            errorDetails = ` - ${errorJson.error.message || errorJson.error.code || 'Unknown error'}`;
          }
        } catch (parseErr) {
          // Si ce n'est pas un JSON valide, utiliser le texte brut
          errorDetails = ` - ${errorText}`;
        }
      } catch (textErr) {
        console.error('Could not read error response', textErr);
      }
      
      console.error(`Connection check failed: ${response.status} ${response.statusText}${errorDetails}`);
      console.error(`API endpoint: ${url}, model: ${config.modelName}, deployment: ${config.deploymentName}`);
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