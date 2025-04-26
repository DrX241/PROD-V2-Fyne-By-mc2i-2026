/**
 * Service OpenAI pour générer des prompts et des réponses
 * Ce service gère les interactions avec les modèles d'OpenAI et Azure OpenAI
 * Il fournit des méthodes pour générer des prompts systèmes et des completions
 */

import { OpenAI } from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources';

// Cache pour les completions pour éviter de refaire les mêmes appels
interface CacheEntry {
  result: string;
  timestamp: number;
}

// Durée de validité du cache en millisecondes (15 minutes)
const CACHE_TTL = 15 * 60 * 1000;

// Configuration du service OpenAI/Azure OpenAI
interface OpenAIServiceConfig {
  apiKey?: string;
  endpoint?: string;
  deploymentName?: string;
  apiVersion?: string;
  isAzure?: boolean;
}

class OpenAIService {
  private openai: OpenAI;
  private completionCache: Map<string, CacheEntry>;
  private config: OpenAIServiceConfig;
  private fallbackMessages: string[];

  constructor() {
    this.completionCache = new Map();
    this.fallbackMessages = [
      "Je vais analyser cette situation et vous proposer une réponse détaillée.",
      "Voici quelques éléments de réflexion sur ce sujet complexe.",
      "En tant qu'expert en cybersécurité, je peux vous proposer plusieurs approches.",
      "Cette problématique mérite une analyse approfondie. Voici mes recommandations.",
      "Analysons ensemble cette situation pour identifier les meilleures pratiques à appliquer."
    ];
    
    // Configuration par défaut
    this.config = {
      isAzure: true
    };
    
    // Initialiser avec la configuration par défaut ou à partir des variables d'environnement
    this.initializeClient();
  }

  /**
   * Initialise le client OpenAI avec les configurations disponibles
   */
  private initializeClient() {
    // Vérifier si les variables d'environnement Azure OpenAI sont disponibles
    if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
      this.config = {
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
        apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2023-05-15',
        isAzure: true
      };
      
      // Créer un client Azure OpenAI
      this.openai = new OpenAI({
        apiKey: this.config.apiKey,
        baseURL: `${this.config.endpoint}/openai/deployments/${this.config.deploymentName}`,
        defaultQuery: { 'api-version': this.config.apiVersion },
        defaultHeaders: { 'api-key': this.config.apiKey }
      });
      
      console.log('OpenAI service initialized with Azure OpenAI');
      return;
    }
    
    // Sinon, vérifier si l'API OpenAI standard est disponible
    if (process.env.OPENAI_API_KEY) {
      this.config = {
        apiKey: process.env.OPENAI_API_KEY,
        isAzure: false
      };
      
      // Créer un client OpenAI standard
      this.openai = new OpenAI({
        apiKey: this.config.apiKey
      });
      
      console.log('OpenAI service initialized with standard OpenAI');
      return;
    }
    
    // Si aucune configuration n'est disponible, utiliser un client fictif
    console.warn('No OpenAI configuration found. Using mock OpenAI client.');
    
    // @ts-ignore - Création d'un client fictif pour éviter les erreurs
    this.openai = {
      chat: {
        completions: {
          create: this.mockChatCompletions.bind(this)
        }
      }
    };
  }

  /**
   * Fonction de secours pour simuler les appels à l'API OpenAI
   */
  private async mockChatCompletions(params: any) {
    // Simuler un délai pour rendre la réponse plus réaliste
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Extraire le dernier message utilisateur pour le contexte
    let userMessage = '';
    for (let i = params.messages.length - 1; i >= 0; i--) {
      if (params.messages[i].role === 'user') {
        userMessage = params.messages[i].content.slice(0, 50);
        break;
      }
    }
    
    // Sélectionner un message aléatoire dans la liste des réponses de secours
    const randomIndex = Math.floor(Math.random() * this.fallbackMessages.length);
    const baseMessage = this.fallbackMessages[randomIndex];
    
    // Construire une réponse contextualisée
    const response = `${baseMessage} À propos de "${userMessage}...", je recommande de vérifier les meilleures pratiques en matière de cybersécurité et de consulter les référentiels reconnus comme l'ANSSI ou le NIST.`;
    
    // Simuler la structure de la réponse API
    return {
      choices: [
        {
          message: {
            content: response
          }
        }
      ]
    };
  }

  /**
   * Génère un prompt système adapté au contexte
   * @param options Options de configuration du prompt (difficulté, style)
   * @returns Prompt système configuré
   */
  async generateSystemPrompt(options: { difficultyLevel?: string, responseStyle?: string } = {}): Promise<string> {
    const { difficultyLevel = 'Intermédiaire', responseStyle = 'Professionnel' } = options;
    
    // Adaptation de la complexité technique basée sur le niveau de difficulté
    let technicalComplexity = '';
    if (difficultyLevel === 'Débutant') {
      technicalComplexity = 'Utilise un langage simple et accessible, évite le jargon technique sauf si nécessaire. Explique les concepts de base avant d\'entrer dans les détails.';
    } else if (difficultyLevel === 'Intermédiaire') {
      technicalComplexity = 'Utilise un niveau technique modéré, en expliquant les concepts avancés mais en supposant une connaissance des fondamentaux de la cybersécurité.';
    } else if (difficultyLevel === 'Expert') {
      technicalComplexity = 'Utilise un langage technique précis et détaillé, en supposant une connaissance approfondie du domaine. N\'hésite pas à référencer des normes, des attaques ou des techniques spécifiques.';
    }
    
    // Adaptation du style de réponse
    let toneStyle = '';
    if (responseStyle === 'Professionnel') {
      toneStyle = 'Adopte un ton formel et professionnel, tout en restant accessible. Privilégie la précision et la clarté.';
    } else if (responseStyle === 'Pédagogique') {
      toneStyle = 'Adopte un ton explicatif et didactique. Structure tes réponses en allant du général au particulier. Utilise des exemples concrets pour illustrer les concepts.';
    } else if (responseStyle === 'Directif') {
      toneStyle = 'Adopte un ton direct et concis. Concentre-toi sur les actions concrètes et les recommandations pratiques.';
    }
    
    // Construction du prompt système
    return `Tu es I AM CYBER, un assistant virtuel spécialisé en cybersécurité, conçu pour accompagner les professionnels dans leurs défis. 

Tu possèdes une expertise approfondie dans tous les domaines de la cybersécurité, notamment la gestion des incidents, la protection des données, la stratégie de sécurité, l'analyse de vulnérabilités, et la conformité réglementaire.

${technicalComplexity}

${toneStyle}

Dans tes réponses:
- Utilise le vouvoiement
- Sois précis et factuel
- Structure clairement tes réponses
- Apporte des conseils concrets et applicables
- Évite les généralités inutiles
- Adapte-toi au contexte spécifique fourni par l'utilisateur
- Concentre-toi uniquement sur des aspects liés à la cybersécurité

La date actuelle est le ${new Date().toLocaleDateString('fr-FR')}. Tiens compte de ce contexte temporel dans tes réponses si nécessaire.`;
  }

  /**
   * Génère une complétion de chat avec OpenAI et utilise un cache pour éviter les appels redondants
   * 
   * @param messages Messages pour la complétion
   * @param temperature Température pour la génération (0.0 à 1.0)
   * @param maxTokens Nombre maximum de tokens
   * @returns Contenu de la complétion
   */
  async getChatCompletionWithCache(
    messages: Array<ChatCompletionMessageParam>,
    temperature: number = 0.7,
    maxTokens: number = 1000
  ): Promise<string> {
    // Créer une clé de cache unique basée sur les messages et les paramètres
    const cacheKey = JSON.stringify({ messages, temperature, maxTokens });
    
    // Vérifier si la réponse est en cache et toujours valide
    const cachedEntry = this.completionCache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL) {
      console.log('Using cached response for chat completion');
      return cachedEntry.result;
    }
    
    try {
      // Appeler l'API OpenAI pour obtenir une complétion
      const response = await this.openai.chat.completions.create({
        model: this.config.isAzure ? undefined : (process.env.OPENAI_MODEL || 'gpt-4o'),
        messages,
        temperature,
        max_tokens: maxTokens
      });
      
      // Extraire le contenu de la réponse
      const content = response.choices[0]?.message?.content || 'Je n\'ai pas pu générer une réponse. Veuillez réessayer.';
      
      // Mettre la réponse en cache
      this.completionCache.set(cacheKey, {
        result: content,
        timestamp: Date.now()
      });
      
      return content;
    } catch (error) {
      console.error('Error in getChatCompletionWithCache:', error);
      
      // En cas d'erreur, générer une réponse de secours et ne pas la mettre en cache
      return `Je rencontre des difficultés à traiter votre demande actuellement. Voici quelques éléments de réflexion généraux sur le sujet :
      
1. La cybersécurité repose sur plusieurs piliers fondamentaux : confidentialité, intégrité et disponibilité des données.
2. Une approche défense en profondeur est généralement recommandée, avec plusieurs couches de protection.
3. La sensibilisation des utilisateurs reste un élément crucial de toute stratégie de sécurité efficace.
      
Pourriez-vous reformuler votre question ou réessayer ultérieurement ?`;
    }
  }
}

// Exporter une instance unique du service
export const openAIService = new OpenAIService();