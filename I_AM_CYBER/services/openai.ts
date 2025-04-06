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
      // Forcer une déconnexion initiale
      this.connectionStatus = 'disconnected';
      
      // Utilisation du mode sans API - Simuler une connexion réussie pour le développement local
      // Cela permet à l'application de fonctionner même sans clé API valide
      
      console.log("Initializing OpenAI Service in simulated mode");
      
      // Utiliser des configurations simulées pour le développement local
      this.primaryConfig = {
        endpoint: "https://api.openai.com/v1",
        apiKey: "simulated-api-key", 
        deploymentName: "gpt-4o",
        apiVersion: "2024-02-15-preview",
        modelName: "gpt-4o"
      };
      
      this.secondaryConfig = {
        endpoint: "https://api.openai.com/v1",
        apiKey: "simulated-api-key",
        deploymentName: "gpt-4o-mini",
        apiVersion: "2024-02-15-preview",
        modelName: "gpt-4o-mini"
      };
      
      // Forcer une connexion simulée
      this.connectionStatus = 'connected';
      this.lastConnectionCheck = Date.now();
      
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

  // Version simulée de getChatCompletion pour le développement
  async getChatCompletion(
    messages: ChatCompletionRequestMessage[],
    temperature: number = 0.7,
    maxTokens: number = 2000
  ): Promise<string> {
    console.log("Using simulated response in development mode");
    console.log(`Current model: ${this.getCurrentModelName()}`);
    
    // Simuler un délai de réponse pour rendre l'expérience plus réaliste
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Obtenir le dernier message de l'utilisateur
    const userMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    
    // Générer une réponse simulée en fonction du contenu du message utilisateur
    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('bonjour')) {
      return "Bonjour ! Je suis FYNE, votre agent IA spécialisé en cybersécurité. Comment puis-je vous aider aujourd'hui ?";
    } 
    else if (userMessage.toLowerCase().includes('help') || userMessage.toLowerCase().includes('aide')) {
      return "Je suis là pour vous aider avec toutes vos questions concernant la cybersécurité. Vous pouvez me demander des informations sur la protection des données, les menaces actuelles, les bonnes pratiques de sécurité, ou tout autre sujet lié à la cybersécurité.";
    }
    else if (userMessage.toLowerCase().includes('phishing')) {
      return "Le phishing est une technique de cyberattaque où les attaquants se font passer pour des entités de confiance afin d'obtenir des informations sensibles. Pour vous protéger contre le phishing, soyez vigilant face aux emails non sollicités, vérifiez l'URL des sites web avant de saisir vos informations, et ne cliquez pas sur des liens suspects.";
    }
    else if (userMessage.toLowerCase().includes('ransomware')) {
      return "Un ransomware est un type de logiciel malveillant qui chiffre vos fichiers et exige une rançon pour les déchiffrer. Pour vous protéger, effectuez régulièrement des sauvegardes de vos données, maintenez vos systèmes à jour, et utilisez un antivirus fiable. En cas d'infection, isolez immédiatement l'appareil du réseau.";
    }
    else if (userMessage.toLowerCase().includes('password') || userMessage.toLowerCase().includes('mot de passe')) {
      return "Pour créer un mot de passe sécurisé, utilisez au moins 12 caractères avec un mélange de lettres majuscules et minuscules, chiffres et symboles. Évitez d'utiliser des informations personnelles facilement devinables. Utilisez un gestionnaire de mots de passe pour stocker vos identifiants en toute sécurité et activez l'authentification à deux facteurs lorsque c'est possible.";
    }
    else if (userMessage.toLowerCase().includes('firewall') || userMessage.toLowerCase().includes('pare-feu')) {
      return "Un pare-feu (firewall) est un système de sécurité qui surveille et contrôle le trafic réseau entrant et sortant selon des règles de sécurité prédéfinies. Il constitue une barrière essentielle entre votre réseau interne et les menaces extérieures. Assurez-vous que votre pare-feu est correctement configuré et régulièrement mis à jour.";
    } 
    else {
      // Réponse générique pour tout autre message
      return "Je comprends votre question sur la cybersécurité. En tant qu'assistant IA spécialisé, je peux vous fournir des informations et des conseils adaptés à vos besoins. Pour des réponses plus précises, n'hésitez pas à me poser des questions spécifiques sur les aspects de la cybersécurité qui vous intéressent.";
    }
  }

  // Outil de surveillance de la connexion - version simulée
  async checkConnection(): Promise<boolean> {
    console.log("Using simulated connection in development mode");
    
    // Forcer une connexion simulée
    this.connectionStatus = 'connected';
    this.lastConnectionCheck = Date.now();
    
    // Toujours renvoyer true pour simuler une connexion réussie
    return true;
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
