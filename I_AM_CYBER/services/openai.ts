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
  private currentConfig: ApiKeyType = 'primary';
  private responseCache: Map<string, CachedResponse> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 60; // 1 heure en millisecondes
  private connectionStatus: 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  private lastConnectionCheck: number = 0;
  private readonly CONNECTION_CHECK_INTERVAL = 1000 * 60 * 5; // 5 minutes

  constructor() {
    try {
      // Utiliser la véritable clé API fournie par l'utilisateur
      const apiKey = "1Ue0sQ11eK6J7iLNvSM9HgXOiIqg2a697PTB33PmM9IIDDsA3d4kJQQJ99BBACfhMk5XJ3w3AAAAACOGuvaK";

      // Endpoint Azure correct
      const azureEndpoint = "https://eddy-02-2025-azureaiservices017852658000.openai.azure.com";

      // Assurez-vous que l'URL se termine par un slash
      const baseEndpoint = azureEndpoint.endsWith('/') ? azureEndpoint : `${azureEndpoint}/`;

      // Versions API exactes fournies par l'utilisateur
      const primaryApiVersion = "2025-01-01-preview"; // GPT-4o
      const secondaryApiVersion = "2024-12-01-preview"; // GPT-4o-mini

      // Noms de déploiement exacts fournis par l'utilisateur
      const gpt4oDeployment = "Eddy-deploy-20-02-2025-gpt-4o";
      const gpt4oMiniDeployment = "Eddy-02-2025-gpt-4o-mini";

      console.log("Initializing Azure OpenAI Service with user-provided configurations");
      console.log(`API Key: ****** (HIDDEN)`);
      console.log(`Endpoint: ${baseEndpoint}`);

      // Configuration primaire - GPT-4o
      this.primaryConfig = {
        endpoint: baseEndpoint,
        apiKey: apiKey,
        deploymentName: gpt4oDeployment,
        apiVersion: primaryApiVersion,
        modelName: "gpt-4o"
      };

      // Configuration secondaire - GPT-4o-mini
      this.secondaryConfig = {
        endpoint: baseEndpoint,
        apiKey: apiKey,
        deploymentName: gpt4oMiniDeployment,
        apiVersion: secondaryApiVersion,
        modelName: "gpt-4o-mini"
      };

      // Commencer déconnecté et vérifier la connexion
      this.connectionStatus = 'disconnected';

      console.log(`Azure OpenAI Service initialized with primary model: ${this.primaryConfig.modelName}`);
      console.log(`Azure OpenAI Service initialized with secondary model: ${this.secondaryConfig.modelName}`);
      console.log(`Primary endpoint: ${this.primaryConfig.endpoint}`);
      console.log(`Secondary endpoint: ${this.secondaryConfig.endpoint}`);

      // Vérifier la connexion immédiatement
      this.checkConnection().then(connected => {
        if (connected) {
          console.log("Successfully connected to Azure OpenAI Service");
        } else {
          console.warn("Failed to connect to Azure OpenAI Service");
        }
      }).catch(error => {
        console.error("Error checking initial connection:", error);
      });

    } catch (error) {
      console.error("Error initializing OpenAI Service:", error);
      this.connectionStatus = 'disconnected';

      // Configuration par défaut en cas d'erreur
      const apiKey = process.env.AZURE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "";

      this.primaryConfig = {
        endpoint: "https://api.openai.com/v1/chat/completions",
        apiKey: apiKey,
        deploymentName: "gpt-4o",
        apiVersion: "2024-02-15-preview",
        modelName: "gpt-4o"
      };

      this.secondaryConfig = {
        endpoint: "https://api.openai.com/v1/chat/completions",
        apiKey: apiKey,
        deploymentName: "gpt-4o-mini",
        apiVersion: "2024-02-15-preview",
        modelName: "gpt-4o-mini"
      };

      console.log("Initialized with default OpenAI configurations due to error.");
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

  // Obtenir le type de clé API actuelle (pour la compatibilité avec les routes)
  getCurrentApiKeyType(): ApiKeyType {
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

    // Toujours appeler l'API réelle - nous n'utilisons plus de réponses simulées
    const content = await this.getChatCompletion(messages, temperature, maxTokens);

    // Mettre en cache la réponse
    this.responseCache.set(cacheKey, {
      content,
      timestamp: Date.now()
    });

    return content;
  }

  // Méthode pour obtenir une complétion du modèle Azure OpenAI
  async getChatCompletion(
    messages: ChatCompletionRequestMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000
  ): Promise<string> {
    try {
      // Récupérer la configuration courante
      const config = this.getCurrentConfig();

      // Construire l'URL complète pour l'API Azure OpenAI - Supprimer les doubles slash
      const url = `${config.endpoint.replace(/\/+$/, '')}/openai/deployments/${config.deploymentName}/chat/completions?api-version=${config.apiVersion}`;

      console.log(`Making API request to: ${url} with ${config.modelName}`);

      // Préparer les données de la requête
      const requestData = {
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
        model: config.deploymentName // Pour Azure, le modèle est défini par le déploiement
      };

      // Appeler l'API Azure OpenAI
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.apiKey,
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify(requestData)
      });

      // Vérifier si la réponse est OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Azure OpenAI API error (${response.status}): ${errorText}`);

        // Lever une erreur avec les détails pour permettre à l'application de la gérer
        throw new Error(`Erreur lors de l'appel à l'API Azure OpenAI (${response.status}): ${errorText}`);
      }

      // Analyser la réponse JSON
      const data = await response.json();

      // Vérifier si la réponse contient les données attendues
      if (data && data.choices && data.choices.length > 0 && data.choices[0].message) {
        // Mettre à jour l'état de connexion
        this.connectionStatus = 'connected';
        this.lastConnectionCheck = Date.now();

        return data.choices[0].message.content || "";
      } else {
        console.error("Invalid response format from Azure OpenAI API:", data);
        throw new Error("Format de réponse invalide de l'API Azure OpenAI");
      }
    } catch (error) {
      console.error("Error calling Azure OpenAI API:", error);

      // Mettre à jour l'état de connexion
      this.connectionStatus = 'disconnected';

      // Propager l'erreur pour permettre à l'application de la gérer
      throw error;
    }
  }

  // Cette méthode n'est plus utilisée - Nous utilisons toujours l'API réelle
  // Conservée uniquement comme référence, mais jamais appelée
  private getSimulatedResponse(messages: ChatCompletionRequestMessage[]): string {
    // En cas d'erreur de l'API, nous préférons lever une exception plutôt que de simuler
    throw new Error("Les réponses simulées ne sont plus prises en charge - Impossible de se connecter à l'API OpenAI");
  }

  // Vérifier la connexion à Azure OpenAI
  async checkConnection(): Promise<boolean> {
    try {
      // Ne vérifier que si le dernier check est trop ancien
      const now = Date.now();
      if (now - this.lastConnectionCheck < this.CONNECTION_CHECK_INTERVAL) {
        return this.connectionStatus === 'connected';
      }

      this.lastConnectionCheck = now;

      // Récupérer la configuration courante
      const config = this.getCurrentConfig();

      const baseUrl = process.env.AZURE_OPENAI_ENDPOINT?.replace(/\/$/, '');
      const modelName = process.env.AZURE_OPENAI_MODEL_NAME;
      const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

      const validationUrl = `${baseUrl}/openai/deployments/${modelName}/chat/completions?api-version=${apiVersion}`;


      console.log(`Checking connection to Azure OpenAI at: ${validationUrl}`);

      // Faire une requête minimaliste pour tester la connexion
      const testMessage = {
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 5,
        temperature: 0
      };

      // Appeler l'API Azure OpenAI avec le header d'authentification correct
      const response = await fetch(validationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.apiKey,
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify(testMessage),
        // Utiliser un timeout court pour éviter de bloquer trop longtemps
        signal: AbortSignal.timeout(5000)
      });

      // Vérifier si la réponse est OK
      if (response.ok) {
        console.log("Connection to Azure OpenAI successful");
        this.connectionStatus = 'connected';
        return true;
      } else {
        console.error(`Connection check failed: ${response.status} ${response.statusText}`);
        this.connectionStatus = 'disconnected';
        return false;
      }
    } catch (error) {
      console.error("Error checking connection to Azure OpenAI:", error);

      // En cas d'erreur, marquer comme déconnecté
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