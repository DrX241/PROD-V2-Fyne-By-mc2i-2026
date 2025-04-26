/**
 * Service OpenAI pour l'interaction avec Azure OpenAI / OpenAI
 */
import { extractJsonFromOpenAiResponse, createFallbackJson } from '../openAiResponseHelper';
import axios from 'axios';
import crypto from 'crypto';

// Type pour le cache
interface CacheItem {
  response: string;
  timestamp: number;
  hash: string;
}

// Configuration pour le modèle OpenAI
interface OpenAIConfig {
  modelName: string;
  endpoint: string;
  apiKey: string;
  apiVersion: string;
}

class OpenAIService {
  // Cache pour éviter des appels redondants à OpenAI
  private cache: Record<string, CacheItem> = {};
  private cacheTTL: number = 1000 * 60 * 60; // 1 heure
  private cacheEnabled: boolean = true;
  
  // Configuration pour les modèles OpenAI
  private primaryConfig: OpenAIConfig | null = null;
  private secondaryConfig: OpenAIConfig | null = null;
  private mockMode: boolean = false;
  
  constructor() {
    this.initializeFromEnvironment();
  }
  
  /**
   * Initialise le service depuis les variables d'environnement
   */
  private initializeFromEnvironment(): void {
    // Vérifier si GPT-4o est configuré
    const gpt4oKey = process.env.GPT4O_API_KEY;
    const gpt4oEndpoint = process.env.GPT4O_ENDPOINT;
    const gpt4oDeployment = process.env.GPT4O_DEPLOYMENT_NAME;
    const gpt4oApiVersion = process.env.GPT4O_API_VERSION;
    
    // Vérifier si GPT-4o-mini est configuré
    const gpt4oMiniKey = process.env.GPT4O_MINI_API_KEY;
    const gpt4oMiniEndpoint = process.env.GPT4O_MINI_ENDPOINT;
    const gpt4oMiniDeployment = process.env.GPT4O_MINI_DEPLOYMENT_NAME;
    const gpt4oMiniApiVersion = process.env.GPT4O_MINI_API_VERSION;
    
    // Configurer le modèle principal si les variables sont présentes
    if (gpt4oKey && gpt4oEndpoint && gpt4oDeployment) {
      this.primaryConfig = {
        modelName: gpt4oDeployment,
        endpoint: gpt4oEndpoint,
        apiKey: gpt4oKey,
        apiVersion: gpt4oApiVersion || '2025-01-01-preview'
      };
      console.log('Azure OpenAI Service initialized with primary model:', gpt4oDeployment);
    }
    
    // Configurer le modèle secondaire si les variables sont présentes
    if (gpt4oMiniKey && gpt4oMiniEndpoint && gpt4oMiniDeployment) {
      this.secondaryConfig = {
        modelName: gpt4oMiniDeployment,
        endpoint: gpt4oMiniEndpoint,
        apiKey: gpt4oMiniKey,
        apiVersion: gpt4oMiniApiVersion || '2024-12-01-preview'
      };
      console.log('Azure OpenAI Service initialized with secondary model:', gpt4oMiniDeployment);
    }
    
    // Si aucun modèle n'est configuré, activer le mode mock
    if (!this.primaryConfig && !this.secondaryConfig) {
      console.log('No OpenAI configuration found. Using mock OpenAI client.');
      this.mockMode = true;
    }
  }
  
  /**
   * Crée un hash MD5 d'une requête pour le cache
   */
  private createRequestHash(messages: any[], temperature: number, maxTokens: number): string {
    const data = JSON.stringify({ messages, temperature, maxTokens });
    return crypto.createHash('md5').update(data).digest('hex');
  }
  
  /**
   * Effectue un appel à l'API OpenAI avec gestion du cache
   */
  async getChatCompletionWithCache(
    messages: any[],
    temperature: number = 0.7,
    maxTokens: number = 800
  ): Promise<string> {
    // Générer un hash pour cette requête
    const requestHash = this.createRequestHash(messages, temperature, maxTokens);
    
    // Vérifier si une réponse est en cache et encore valide
    if (this.cacheEnabled && this.cache[requestHash]) {
      const cachedItem = this.cache[requestHash];
      const now = Date.now();
      
      // Si le cache est encore valide, retourner la réponse en cache
      if (now - cachedItem.timestamp < this.cacheTTL) {
        // console.log('Using cached response for request:', requestHash);
        return cachedItem.response;
      }
    }
    
    // Sinon, effectuer un appel à l'API
    try {
      const response = await this.getChatCompletion(messages, temperature, maxTokens);
      
      // Mettre en cache la réponse
      if (this.cacheEnabled) {
        this.cache[requestHash] = {
          response,
          timestamp: Date.now(),
          hash: requestHash
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error getting chat completion:', error);
      throw error;
    }
  }
  
  /**
   * Effectue un appel à l'API OpenAI (sans cache)
   */
  async getChatCompletion(
    messages: any[],
    temperature: number = 0.7,
    maxTokens: number = 800
  ): Promise<string> {
    // Si en mode mock, générer une réponse simulée
    if (this.mockMode) {
      return this.generateMockResponse(messages);
    }
    
    // Vérifier quel modèle utiliser (utiliser le secondaire en mode eco si défini, sinon le principal)
    const isEcoMode = process.env.ACTIVE_KEY_TYPE === 'secondary';
    const config = isEcoMode && this.secondaryConfig ? this.secondaryConfig : (this.primaryConfig || this.secondaryConfig);
    
    // Si aucune configuration n'est disponible, revenir au mode mock
    if (!config) {
      console.warn('No OpenAI configuration available. Falling back to mock mode.');
      return this.generateMockResponse(messages);
    }
    
    try {
      // Préparer l'URL
      const url = `${config.endpoint}/openai/deployments/${config.modelName}/chat/completions?api-version=${config.apiVersion}`;
      
      // Préparer les en-têtes
      const headers = {
        'Content-Type': 'application/json',
        'api-key': config.apiKey
      };
      
      // Préparer le corps de la requête
      const body = {
        messages,
        temperature,
        max_tokens: maxTokens,
        model: config.modelName
      };
      
      // Effectuer l'appel API
      const response = await axios.post(url, body, { headers });
      
      // Extraire et retourner le contenu de la réponse
      return response.data.choices[0].message.content;
    } catch (error: any) {
      console.error('Error calling Azure OpenAI:', error.message);
      
      // En cas d'erreur de taux de requêtes, basculer vers l'autre modèle si disponible
      if (error.response && error.response.status === 429) {
        console.log('Rate limit exceeded, switching to alternative model...');
        
        // Si on était sur le modèle principal, essayer le secondaire
        if (!isEcoMode && this.secondaryConfig) {
          process.env.ACTIVE_KEY_TYPE = 'secondary';
          return this.getChatCompletion(messages, temperature, maxTokens);
        }
        // Si on était sur le modèle secondaire, essayer le principal
        else if (isEcoMode && this.primaryConfig) {
          process.env.ACTIVE_KEY_TYPE = 'primary';
          return this.getChatCompletion(messages, temperature, maxTokens);
        }
      }
      
      // En cas d'erreur, générer une réponse de fallback
      return this.generateMockResponse(messages);
    }
  }
  
  /**
   * Génère une réponse simulée pour le mode mock ou en cas d'erreur
   */
  private generateMockResponse(messages: any[]): string {
    try {
      // Obtenir le dernier message utilisateur
      const lastUserMessage = messages.slice().reverse().find(msg => msg.role === 'user');
      const content = lastUserMessage?.content || '';
      
      // Récupérer le prompt système si présent
      const systemMessage = messages.find(msg => msg.role === 'system');
      const systemContent = systemMessage?.content || '';
      
      // Simuler une réponse basée sur le contenu de la demande
      if (content.toLowerCase().includes('erreur') || content.toLowerCase().includes('problème')) {
        return "Je comprends que vous rencontrez une difficulté. Pour un problème lié à la cybersécurité, je vous conseille d'abord d'isoler les systèmes potentiellement affectés, puis de documenter précisément les symptômes observés avant de procéder à une analyse plus approfondie.";
      }
      
      if (content.toLowerCase().includes('bonjour') || content.toLowerCase().includes('salut')) {
        return "Bonjour ! Je suis I AM CYBER, votre assistant spécialisé en cybersécurité. Comment puis-je vous aider aujourd'hui ?";
      }
      
      if (content.toLowerCase().includes('merci')) {
        return "Je vous en prie ! N'hésitez pas si vous avez d'autres questions concernant la cybersécurité.";
      }
      
      if (systemContent.includes('scénario')) {
        return "Pour résoudre ce scénario efficacement, je vous suggère d'adopter une approche méthodique : d'abord évaluer les risques potentiels, puis identifier les mesures de protection les plus adaptées au contexte, et enfin élaborer un plan d'action priorisé. Avez-vous des contraintes particulières à prendre en compte ?";
      }
      
      // Réponse par défaut
      return "En tant qu'expert en cybersécurité, je peux vous aider sur de nombreux sujets comme la gestion des incidents, la conformité RGPD, la sécurité des infrastructures ou encore la sensibilisation des équipes. N'hésitez pas à me poser des questions spécifiques.";
    } catch (error) {
      console.error('Error generating mock response:', error);
      return "Je suis désolé, je rencontre actuellement un problème technique. Pourriez-vous reformuler votre question ?";
    }
  }
  
  /**
   * Méthode pour obtenir une réponse complète du modèle, incluant tous les détails
   * (Cette méthode est utilisée pour le message d'accueil et autres cas où on a besoin
   * de la réponse complète de l'API plutôt que juste le contenu texte)
   */
  async getModelResponse(options: {
    messages: any[];
    temperature?: number;
    max_tokens?: number;
    model?: 'primary' | 'secondary';
  }): Promise<any> {
    try {
      // Si en mode mock, générer une réponse simulée
      if (this.mockMode) {
        const content = this.generateMockResponse(options.messages);
        return {
          choices: [
            {
              message: {
                content
              }
            }
          ]
        };
      }
      
      // Déterminer la configuration à utiliser
      let config: OpenAIConfig | null;
      if (options.model === 'secondary' && this.secondaryConfig) {
        config = this.secondaryConfig;
      } else if (options.model === 'primary' && this.primaryConfig) {
        config = this.primaryConfig;
      } else {
        // Utiliser ce qui est défini par l'environnement ou par défaut
        const isEcoMode = process.env.ACTIVE_KEY_TYPE === 'secondary';
        config = isEcoMode && this.secondaryConfig ? this.secondaryConfig : (this.primaryConfig || this.secondaryConfig);
      }
      
      // Si aucune configuration n'est disponible, revenir au mode mock
      if (!config) {
        console.warn('No OpenAI configuration available. Falling back to mock mode.');
        const content = this.generateMockResponse(options.messages);
        return {
          choices: [
            {
              message: {
                content
              }
            }
          ]
        };
      }
      
      // Préparer l'URL
      const url = `${config.endpoint}/openai/deployments/${config.modelName}/chat/completions?api-version=${config.apiVersion}`;
      
      // Préparer les en-têtes
      const headers = {
        'Content-Type': 'application/json',
        'api-key': config.apiKey
      };
      
      // Préparer le corps de la requête
      const body = {
        messages: options.messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 800,
        model: config.modelName
      };
      
      // Effectuer l'appel API
      const response = await axios.post(url, body, { headers });
      
      // Retourner la réponse complète
      return response.data;
    } catch (error: any) {
      console.error('Error calling Azure OpenAI getModelResponse:', error.message);
      
      // En cas d'erreur, retourner une réponse simulée
      const content = this.generateMockResponse(options.messages);
      return {
        choices: [
          {
            message: {
              content
            }
          }
        ]
      };
    }
  }
  
  /**
   * Vérifie la connectivité à l'API OpenAI
   */
  async checkAPIConnection(): Promise<boolean> {
    try {
      // Utiliser de préférence le modèle secondaire pour le test de connectivité (moins cher)
      const config = this.secondaryConfig || this.primaryConfig;
      
      if (!config) {
        console.warn('No OpenAI configuration available to check connection.');
        return false;
      }
      
      console.log(`Checking connection to Azure OpenAI at: ${config.endpoint}/openai/deployments/${config.modelName}/chat/completions?api-version=${config.apiVersion}`);
      
      // Simple message pour tester la connexion
      const testMessage = [
        { role: "system", content: "You are a test assistant." },
        { role: "user", content: "Say 'Connection successful' if you can read this." }
      ];
      
      // Préparer les en-têtes
      const headers = {
        'Content-Type': 'application/json',
        'api-key': config.apiKey
      };
      
      // Préparer le corps de la requête
      const body = {
        messages: testMessage,
        temperature: 0.1,
        max_tokens: 30,
        model: config.modelName
      };
      
      // Effectuer l'appel API
      const response = await axios.post(
        `${config.endpoint}/openai/deployments/${config.modelName}/chat/completions?api-version=${config.apiVersion}`,
        body,
        { headers }
      );
      
      // Vérifier que nous avons obtenu une réponse valide
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        console.log(`Connection to Azure OpenAI successful with model: ${config.modelName} (${config.modelName})`);
        process.env.CONNECTION_VERIFIED = 'true';
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Error checking API connection:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return false;
    }
  }
}

// Créer une instance singleton
export const openAIService = new OpenAIService();

// Vérifier la connexion au démarrage
openAIService.checkAPIConnection().catch(err => console.error('Failed to check API connection:', err));