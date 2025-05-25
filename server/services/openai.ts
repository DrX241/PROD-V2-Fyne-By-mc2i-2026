import { ChatCompletionRequestMessage } from "./openAiTypes";
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
  private readonly CONNECTION_CHECK_INTERVAL = 1000 * 60 * 1; // Vérifie la connexion toutes les minutes
  private reconnectInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  // Méthodes pour exposer l'état de la connexion
  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  getCurrentKeyType(): string {
    return this.currentConfig;
  }

  getLastConnectionCheckTime(): number {
    return this.lastConnectionCheck;
  }

  // Méthode pour initier une reconnexion
  reconnect(): boolean {
    try {
      this.checkConnection();
      return true;
    } catch (error) {
      console.error("Erreur lors de la reconnexion:", error);
      return false;
    }
  }

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
      deploymentName: gpt4oMiniDeploymentName, // Utiliser la valeur de la variable d'environnement
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

    // Démarrer la vérification périodique de connexion
    this.startPeriodicConnectionCheck();
  }

  // Démarre une vérification périodique de la connexion
  private startPeriodicConnectionCheck(): void {
    // Vérification toutes les minutes
    setInterval(() => {
      console.log('Performing periodic connection check to Azure OpenAI...');
      this.checkConnection().then(isConnected => {
        if (!isConnected && this.connectionStatus !== 'reconnecting') {
          console.log('Connection lost, starting automatic reconnection...');
          this.startReconnectionProcess();
        }
      });
    }, this.CONNECTION_CHECK_INTERVAL);
  }

  // Démarre le processus de reconnexion
  private startReconnectionProcess(): void {
    // Arrêter tout intervalle de reconnexion précédent
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    this.connectionStatus = 'reconnecting';
    this.reconnectAttempts = 0;

    // Tenter de se reconnecter toutes les 10 secondes
    this.reconnectInterval = setInterval(() => {
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts} of ${this.MAX_RECONNECT_ATTEMPTS}...`);

      this.checkConnection().then(isConnected => {
        if (isConnected) {
          console.log('Reconnection successful!');
          this.connectionStatus = 'connected';

          // Arrêter les tentatives de reconnexion
          if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
          }
        } else if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
          console.log('Max reconnection attempts reached. Giving up.');
          this.connectionStatus = 'disconnected';

          // Arrêter les tentatives de reconnexion
          if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
          }
        }
      });
    }, 10000); // Tentative toutes les 10 secondes
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

  async getChatCompletionWithModel(
    messages: ChatCompletionRequestMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000,
    usePrimaryModel: boolean = false,
    options: { responseFormat?: string } = {}
  ): Promise<string> {
    try {
      // Utiliser le modèle principal (GPT-4o) ou secondaire (GPT-4o-mini) selon le paramètre
      const config = usePrimaryModel ? this.primaryConfig : this.secondaryConfig;

      // Formatage correct de l'URL : suppression des doubles slashes
      let baseEndpoint = config.endpoint;
      if (baseEndpoint.endsWith('/')) {
        baseEndpoint = baseEndpoint.slice(0, -1);
      }

      const url = `${baseEndpoint}/openai/deployments/${config.deploymentName}/chat/completions?api-version=${config.apiVersion}`;

      console.log(`Making API request to: ${url} with ${config.modelName} ${usePrimaryModel ? "(primary)" : ""}`);

      // Afficher plus de détails sur les paramètres de la requête (sans la clé API)
      console.log(`Request parameters: temperature=${temperature}, max_tokens=${maxTokens}`);
      console.log(`Nombre de messages: ${messages.length}, Premier role: ${messages[0]?.role}`);

      // Formater la requête pour l'API
      const requestBody: any = {
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
        model: config.deploymentName // Ajout du nom du modèle dans la requête comme requis par Azure OpenAI
      };

      // Ajouter le format de réponse JSON si demandé
      if (options.responseFormat === 'json_object') {
        requestBody.response_format = { type: "json_object" };
        console.log('Format de réponse JSON demandé');
      }

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

  // Surcharge de la méthode pour accepter un paramètre useSecondaryKey
  async getChatCompletion(
    messages: ChatCompletionRequestMessage[],
    useSecondaryKey: boolean,
    temperature: number,
    maxTokens: number,
    options?: { responseFormat?: string }
  ): Promise<string>;

  // Version simplifiée pour les appels depuis les routes immersives
  async getChatCompletion(
    messages: ChatCompletionRequestMessage[],
    temperature?: number,
    maxTokens?: number,
    options?: { responseFormat?: string, useSecondaryKey?: boolean }
  ): Promise<string>;

  // Surcharge de la méthode pour compatibilité avec l'interface d'origine
  async getChatCompletion(
    messages: ChatCompletionRequestMessage[],
    temperatureOrUseSecondary?: number | boolean,
    maxTokensOrTemperature?: number,
    maxTokens?: number,
    options?: { responseFormat?: string }
  ): Promise<string> {
    // Déterminer les paramètres en fonction de la signature utilisée
    let useSecondaryKey: boolean = false;
    let temperature: number = 0.7;
    let actualMaxTokens: number = 2000;
    let responseFormat: string | undefined = options?.responseFormat;

    if (typeof temperatureOrUseSecondary === 'boolean') {
      // Si le second paramètre est un booléen, c'est useSecondaryKey
      useSecondaryKey = temperatureOrUseSecondary;
      temperature = typeof maxTokensOrTemperature === 'number' ? maxTokensOrTemperature : 0.7;
      actualMaxTokens = typeof maxTokens === 'number' ? maxTokens : 2000;
    } else {
      // Sinon c'est la température
      temperature = typeof temperatureOrUseSecondary === 'number' ? temperatureOrUseSecondary : 0.7;
      actualMaxTokens = typeof maxTokensOrTemperature === 'number' ? maxTokensOrTemperature : 2000;
    }

    // Si useSecondaryKey est vrai, on force l'utilisation du modèle secondaire
    if (useSecondaryKey) {
      this.currentConfig = 'secondary';
    }

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

      // Formater la requête pour l'API avec le modèle requis par Azure OpenAI
      const requestBody: any = {
        messages: messages,
        temperature: temperature,
        max_tokens: actualMaxTokens,
        model: config.deploymentName // Azure OpenAI a besoin du nom du modèle dans la requête
      };

      // Ajouter le format de réponse JSON si demandé
      if (responseFormat === 'json_object') {
        requestBody.response_format = { type: "json_object" };
        console.log('Format de réponse JSON demandé');
      }

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
        temperature: 0,
        model: config.deploymentName // Obligatoire pour Azure OpenAI
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

  // Force une tentative de reconnexion immédiate
  async forceReconnect(): Promise<boolean> {
    console.log('Force reconnection requested');

    // Réinitialiser l'état de connexion
    this.connectionStatus = 'reconnecting';
    this.lastConnectionCheck = 0;
    this.reconnectAttempts = 0;

    // Arrêter les intervalles de reconnexion existants
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    // Tenter une reconnexion immédiate
    const isConnected = await this.checkConnection();

    if (!isConnected) {
      // Si la reconnexion immédiate échoue, démarrer le processus automatique
      this.startReconnectionProcess();
    } else {
      console.log('Force reconnection successful!');
    }

    return isConnected;
  }

  // Méthode principale pour obtenir une complétion avec gestion du cache - surcharge avec paramètres individuels
  async getChatCompletionWithCache(
    messages: ChatCompletionRequestMessage[],
    temperature: number,
    maxTokens: number,
    useSecondaryKey: boolean
  ): Promise<string>;

  // Méthode principale pour obtenir une complétion avec gestion du cache - surcharge avec objet d'options
  async getChatCompletionWithCache(
    options: {
      messages: ChatCompletionRequestMessage[],
      temperature?: number,
      maxTokens?: number,
      useSecondaryKey?: boolean,
      responseFormat?: string
    }
  ): Promise<string>;

  // Implémentation de la méthode
  async getChatCompletionWithCache(
    messagesOrOptions: ChatCompletionRequestMessage[] | {
      messages: ChatCompletionRequestMessage[],
      temperature?: number,
      maxTokens?: number,
      useSecondaryKey?: boolean,
      responseFormat?: string
    },
    temperature: number = 0.7,
    maxTokens: number = 2000,
    useSecondaryKey: boolean = false
  ): Promise<string> {
    // Déterminer les paramètres en fonction de la signature utilisée
    let messages: ChatCompletionRequestMessage[];
    let actualTemperature = temperature;
    let actualMaxTokens = maxTokens;
    let actualUseSecondaryKey = useSecondaryKey;
    let responseFormat: string | undefined;

    if (!Array.isArray(messagesOrOptions)) {
      // Si c'est un objet d'options
      messages = messagesOrOptions.messages;
      actualTemperature = messagesOrOptions.temperature ?? 0.7;
      actualMaxTokens = messagesOrOptions.maxTokens ?? 2000;
      actualUseSecondaryKey = messagesOrOptions.useSecondaryKey ?? false;
      responseFormat = messagesOrOptions.responseFormat;
    } else {
      // Si c'est un tableau de messages
      messages = messagesOrOptions;
    }
    const cacheKey = this.getCacheKey(messages, actualTemperature, actualMaxTokens);

    // Vérifier si la réponse est dans le cache et toujours valide
    const cachedResponse = this.responseCache.get(cacheKey);
    if (cachedResponse && (Date.now() - cachedResponse.timestamp) < this.CACHE_TTL) {
      console.log("Using cached response");
      return cachedResponse.content;
    }

    // Toujours appeler l'API réelle - nous n'utilisons plus de réponses simulées
    const content = await this.getChatCompletion(
      messages, 
      actualUseSecondaryKey,
      actualTemperature, 
      actualMaxTokens,
      { responseFormat: responseFormat }
    );

    // Mettre en cache la réponse
    this.responseCache.set(cacheKey, {
      content,
      timestamp: Date.now()
    });

    return content;
  }

  // Méthode pour obtenir une complétion directement avec le modèle secondaire (GPT-4o-mini)
  async getChatCompletionSecondary(options: {
    messages: {role: string, content: string}[];
    temperature?: number;
    max_tokens?: number;
  }) {
    try {
      const config = this.secondaryConfig;

      // Formatage correct de l'URL : suppression des doubles slashes
      let baseEndpoint = config.endpoint;
      if (baseEndpoint.endsWith('/')) {
        baseEndpoint = baseEndpoint.slice(0, -1);
      }

      const url = `${baseEndpoint}/openai/deployments/${config.deploymentName}/chat/completions?api-version=${config.apiVersion}`;

      console.log(`Making secondary API request to: ${url} with ${config.modelName}`);

      // Formater la requête pour l'API
      const requestBody = {
        messages: options.messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1024
      };

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
        throw new Error(`Azure OpenAI API error (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error calling secondary Azure OpenAI API:", error);
      throw error;
    }
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
      // Prompt de base pour I AM CYBER
      let systemPrompt = `
# I AM CYBER - ASSISTANT DE CYBERSÉCURITÉ
Version 2.0 - Avril 2025

## OBJECTIF
Tu es I AM CYBER, un assistant spécialisé en cybersécurité conçu pour former et accompagner les professionnels débutants à experts. Ton objectif est de fournir des informations précises, actuelles et adaptées au niveau de l'utilisateur.

## PRINCIPES DE COMMUNICATION
- Adapte ton langage au niveau de connaissance de l'utilisateur (débutant, intermédiaire, expert)
- Reste factuel et précis dans tes informations
- Utilise un ton professionnel mais accessible
- Fournis des explications claires et des exemples concrets
- Reste concentré sur les problématiques de cybersécurité et de sécurité informatique

## STRUCTURE DE RÉPONSE
1. Réponds de manière directe à la question posée
2. Ajoute du contexte et des nuances importantes
3. Fournis des exemples concrets ou des cas d'usage
4. Si pertinent, suggère des ressources ou des étapes supplémentaires
`;

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

  /**
   * Génère un prompt système personnalisé pour un assistant IA basé sur ses paramètres
   * @param assistantParams Paramètres de configuration de l'assistant
   * @returns Prompt système personnalisé
   */
  async generateCustomAssistantPrompt(assistantParams: {
    name: string;
    description?: string;
    domain?: string;
    personality?: string;
    expertise?: string;
    gamificationLevel?: 'none' | 'low' | 'medium' | 'high';
    responseStyle?: string;
    additionalInfo?: string;
  }): Promise<string> {
    try {
      const {
        name,
        description = "un assistant IA personnalisé",
        domain = "général",
        personality = "professionnel",
        expertise = "intermédiaire",
        gamificationLevel = "none",
        responseStyle = "conversationnel",
        additionalInfo = ""
      } = assistantParams;

      // Construction du prompt système de base
      let systemPrompt = `
# ASSISTANT PERSONNALISÉ: ${name.toUpperCase()}

## VOTRE IDENTITÉ ET MISSION
Tu es ${name}, ${description}. Tu es spécialisé dans le domaine: ${domain}.

## TON STYLE ET TON APPROCHE
- Ton niveau d'expertise est: ${expertise}
- Ta personnalité est: ${personality}
- Ton style de réponse est: ${responseStyle}
`;

      // Ajouter des instructions spécifiques au domaine
      if (domain && domain !== "général") {
        systemPrompt += `\n## SPÉCIALISATION DANS LE DOMAINE: ${domain.toUpperCase()}`;
        systemPrompt += `\nEn tant qu'expert en ${domain}, tu dois:`;
        systemPrompt += `\n- Prioriser les connaissances et concepts de ce domaine`;
        systemPrompt += `\n- Adapter ta terminologie au vocabulaire spécifique de ce domaine`;
        systemPrompt += `\n- Faire référence aux bonnes pratiques et tendances actuelles du secteur`;
        systemPrompt += `\n- Citer des exemples pertinents pour illustrer tes réponses`;
      }

      // Ajouter des instructions sur la personnalité
      systemPrompt += `\n\n## PERSONNALITÉ: ${personality.toUpperCase()}`;
      switch (personality.toLowerCase()) {
        case "amical":
          systemPrompt += `\nAdopte un ton chaleureux et conversationnel. Utilise un langage accessible et crée un lien avec l'utilisateur. Tu peux utiliser des émojis avec modération et adopter une approche empathique.`;
          break;
        case "formel":
          systemPrompt += `\nAdopte un ton soutenu et professionnel. Évite les familiarités et les expressions trop informelles. Privilégie un vocabulaire précis et une structure claire.`;
          break;
        case "pédagogique":
          systemPrompt += `\nAdopte une approche explicative et didactique. Structure tes réponses de manière progressive, en partant des concepts fondamentaux. Pose des questions pour vérifier la compréhension et propose des ressources complémentaires.`;
          break;
        case "inspirant":
          systemPrompt += `\nAdopte un style motivant et énergique. Utilise des exemples inspirants et des métaphores marquantes. Encourage l'utilisateur à dépasser ses limites et à explorer de nouvelles perspectives.`;
          break;
        case "analytique":
          systemPrompt += `\nAdopte une approche méthodique et factuelle. Organise tes réponses avec logique, en distinguant faits et opinions. Présente différents points de vue et nuance tes propos. Utilise des données chiffrées lorsque c'est pertinent.`;
          break;
        default:
          systemPrompt += `\nAdopte un ton professionnel mais accessible. Sois clair, précis et pertinent dans tes réponses. Adapte-toi au contexte de la conversation.`;
      }

      // Configuration de la gamification
      if (gamificationLevel && gamificationLevel !== "none") {
        systemPrompt += `\n\n## NIVEAU DE GAMIFICATION: ${gamificationLevel.toUpperCase()}`;

        switch (gamificationLevel) {
          case "low":
            systemPrompt += `\nIntègre occasionnellement des éléments ludiques comme:`;
            systemPrompt += `\n- De brèves anecdotes intéressantes liées au sujet`;
            systemPrompt += `\n- Des faits surprenants ou méconnus`;
            systemPrompt += `\n- De petits défis optionnels en fin de réponse`;
            break;
          case "medium":
            systemPrompt += `\nIntègre régulièrement des éléments de gamification comme:`;
            systemPrompt += `\n- Des défis adaptés au niveau de l'utilisateur`;
            systemPrompt += `\n- Des quiz courts pour tester les connaissances`;
            systemPrompt += `\n- Des analogies et métaphores ludiques`;
            systemPrompt += `\n- Des scénarios hypothétiques pour appliquer les concepts`;
            break;
          case "high":
            systemPrompt += `\nIntègre systématiquement une approche fortement gamifiée:`;
            systemPrompt += `\n- Crée une structure de progression avec des niveaux`;
            systemPrompt += `\n- Propose des défis de complexité croissante`;
            systemPrompt += `\n- Utilise un système de points ou de badges virtuels`;
            systemPrompt += `\n- Inclus des mini-jeux, énigmes ou problèmes à résoudre`;
            systemPrompt += `\n- Crée des scénarios immersifs et interactifs`;
            break;
        }
      }

      // Informations additionnelles personnalisées
      if (additionalInfo && additionalInfo.trim().length > 0) {
        systemPrompt += `\n\n## INSTRUCTIONS SUPPLÉMENTAIRES`;
        systemPrompt += `\n${additionalInfo.trim()}`;
      }

      // Instructions de format et de comportement
      systemPrompt += `\n\n## FORMAT ET COMPORTEMENT GÉNÉRAL`;
      systemPrompt += `\n- N'utilise pas de formatage markdown (pas d'astérisques, de dièses, etc.)`;
      systemPrompt += `\n- Réponds toujours de manière directe et pertinente aux questions`;
      systemPrompt += `\n- Adapte ton niveau de détail au contexte de la conversation`;
      systemPrompt += `\n- Sois précis et factuel, évite les généralisations`;
      systemPrompt += `\n- Si tu ne connais pas la réponse, admets-le clairement`;

      return systemPrompt;
    } catch (error) {
      console.error("Error generating custom assistant prompt:", error);
      throw new Error("Failed to generate custom assistant prompt");
    }
  }
}

export const openAIService = new OpenAIService();