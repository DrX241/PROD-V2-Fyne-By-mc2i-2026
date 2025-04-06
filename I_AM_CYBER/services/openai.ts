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
    console.log("Initializing Azure OpenAI Service with configuration from secrets");
    
    // Récupérer la clé API depuis les secrets Replit
    const apiKey = process.env.AZURE_OPENAI_API_KEY || "";
    if (!apiKey) {
      console.error("ERREUR: Clé API Azure OpenAI non trouvée dans les secrets");
    }
    
    // Récupérer l'endpoint depuis les secrets Replit - utilisé une valeur par défaut en cas d'erreur
    let baseEndpoint = "";
    try {
      const endpointFromEnv = process.env.AZURE_OPENAI_ENDPOINT || "";
      // Vérifier si l'URL est valide
      if (endpointFromEnv && endpointFromEnv.startsWith("http")) {
        // URL valide
        baseEndpoint = endpointFromEnv;
      } else {
        console.error("ERREUR: L'endpoint n'est pas une URL valide, utilisation de la valeur par défaut");
        baseEndpoint = "https://eddy-02-2025-azureaiservices017852658000.openai.azure.com";
      }
    } catch (error) {
      console.error("ERREUR lors de la récupération de l'endpoint:", error);
      baseEndpoint = "https://eddy-02-2025-azureaiservices017852658000.openai.azure.com";
    }
    
    // Récupérer le nom de déploiement depuis les secrets Replit
    let deploymentName = "Eddy-deploy-20-02-2025-gpt-4o"; // Valeur par défaut
    try {
      const deploymentFromEnv = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "";
      if (deploymentFromEnv && deploymentFromEnv.length > 2) {
        deploymentName = deploymentFromEnv;
      } else {
        console.warn("Nom de déploiement non trouvé ou invalide, utilisation de la valeur par défaut");
      }
    } catch (error) {
      console.error("ERREUR lors de la récupération du nom de déploiement:", error);
    }
    
    // Récupérer la version de l'API depuis les secrets Replit
    let apiVersion = "2025-01-01-preview"; // Valeur par défaut
    try {
      const versionFromEnv = process.env.AZURE_OPENAI_API_VERSION || "";
      if (versionFromEnv && versionFromEnv.match(/^\d{4}-\d{2}-\d{2}(-preview)?$/)) {
        apiVersion = versionFromEnv;
      } else {
        console.warn("Version d'API non trouvée ou invalide, utilisation de la valeur par défaut");
      }
    } catch (error) {
      console.error("ERREUR lors de la récupération de la version d'API:", error);
    }
    
    // Afficher des informations pour le débogage (de façon sécurisée)
    console.log("API Key: ***" + (apiKey ? apiKey.substring(apiKey.length - 5).padStart(5, '*') : "Non définie"));
    console.log("Endpoint: " + baseEndpoint);
    console.log("Deployment Name: " + deploymentName);
    console.log("API Version: " + apiVersion);

    // Configuration unique - GPT-4o
    this.primaryConfig = {
      endpoint: baseEndpoint,
      apiKey: apiKey,
      deploymentName: deploymentName,
      apiVersion: apiVersion,
      modelName: "gpt-4o"
    };

    // Configuration secondaire identique (pour compatibilité avec l'interface)
    this.secondaryConfig = {
      endpoint: baseEndpoint,
      apiKey: apiKey,
      deploymentName: deploymentName,
      apiVersion: apiVersion,
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

      // Vérifier si l'endpoint est une URL valide
      if (!config.endpoint || !config.endpoint.startsWith('http')) {
        console.error("Endpoint invalide, impossible d'appeler Azure OpenAI");
        this.connectionStatus = 'disconnected';
        throw new Error("Endpoint invalide pour l'API Azure OpenAI");
      }

      try {
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
      } catch (fetchError) {
        console.error("Erreur lors de la requête à Azure OpenAI:", fetchError);
        this.connectionStatus = 'disconnected';
        throw fetchError;
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

      // Vérifier si l'endpoint est une URL valide
      if (!config.endpoint || !config.endpoint.startsWith('http')) {
        console.error("Endpoint invalide, impossible de vérifier la connexion à Azure OpenAI");
        this.connectionStatus = 'disconnected';
        return false;
      }

      // Utiliser l'endpoint exact fourni par l'utilisateur 
      try {
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
      } catch (fetchError) {
        console.error("Erreur lors de la requête à Azure OpenAI:", fetchError);
        this.connectionStatus = 'disconnected';
        return false;
      }
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