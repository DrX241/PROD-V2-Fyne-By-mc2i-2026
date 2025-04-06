/**
 * Service pour la gestion des scénarios de simulation immersive
 */

import { immersiveScenarios } from '../data/immersive-scenarios';
import { UserRole, ImmersiveScenario, ImmersiveSession, Conversation } from '../../shared/types/immersive-cyber';

class ImmersiveScenarioService {
  private sessions: Map<string, ImmersiveSession> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  
  /**
   * Récupère la liste des scénarios disponibles
   */
  async getAvailableScenarios(): Promise<ImmersiveScenario[]> {
    // Dans une version réelle, cela pourrait venir d'une base de données
    return immersiveScenarios;
  }
  
  /**
   * Démarre une nouvelle session de simulation immersive
   */
  async startSession(scenarioId: string, userId: string, selectedRole: UserRole): Promise<ImmersiveSession> {
    const scenario = immersiveScenarios.find(s => s.id === scenarioId);
    
    if (!scenario) {
      throw new Error(`Scénario ${scenarioId} non trouvé`);
    }
    
    // Trouver la première phase du premier arc narratif
    const firstPhase = scenario.narrativeArcs[0]?.phases[0]?.id;
    
    if (!firstPhase) {
      throw new Error('Le scénario ne contient pas de phases');
    }
    
    // Initialiser les relations avec les personnages
    const characterRelationships: Record<string, number> = {};
    scenario.characters.forEach(character => {
      characterRelationships[character.id] = 0; // 0 est neutre
    });
    
    // Initialiser les métriques
    const currentMetrics: Record<string, number> = {};
    scenario.metrics.categories.forEach(category => {
      category.metrics.forEach(metric => {
        currentMetrics[metric.id] = metric.initialValue;
      });
    });
    
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const session: ImmersiveSession = {
      id: sessionId,
      scenarioId,
      userId,
      selectedRole,
      currentPhase: firstPhase,
      startedAt: new Date().toISOString(),
      completedPhases: [],
      decisionsMade: [],
      characterRelationships,
      currentMetrics,
      sessionLog: [
        {
          timestamp: new Date().toISOString(),
          type: 'session_started',
          description: `Session démarrée avec le scénario "${scenario.title}"`
        }
      ]
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }
  
  /**
   * Récupère une session existante
   */
  getSession(sessionId: string): ImmersiveSession | undefined {
    return this.sessions.get(sessionId);
  }
  
  /**
   * Traite une décision prise par l'utilisateur
   */
  async processDecision(sessionId: string, decisionPointId: string, optionId: string): Promise<{
    consequences: string[];
    feedback: string;
    updatedSession: ImmersiveSession;
  }> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session non trouvée');
    }
    
    // Dans une version réelle, nous appliquerions les conséquences,
    // mettrions à jour les métriques, etc.
    
    // Pour l'instant, simulons un retour simple
    const consequences = [`Conséquence de la décision ${optionId}`, 'Une autre conséquence'];
    
    // Enregistrer la décision dans l'historique de la session
    session.decisionsMade.push({
      timestamp: new Date().toISOString(),
      decisionPointId,
      optionId
    });
    
    // Ajouter à l'historique de la session
    session.sessionLog.push({
      timestamp: new Date().toISOString(),
      type: 'decision_made',
      description: `Décision prise: option ${optionId} pour le point de décision ${decisionPointId}`
    });
    
    // Mettre à jour la session
    this.sessions.set(sessionId, session);
    
    return {
      consequences,
      feedback: 'Votre décision a été prise en compte et aura des répercussions sur la suite du scénario.',
      updatedSession: session
    };
  }
  
  /**
   * Démarre une conversation avec un PNJ
   */
  async startConversation(sessionId: string, characterId: string): Promise<Conversation> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session non trouvée');
    }
    
    const scenario = immersiveScenarios.find(s => s.id === session.scenarioId);
    
    if (!scenario) {
      throw new Error('Scénario non trouvé');
    }
    
    const character = scenario.characters.find(c => c.id === characterId);
    
    if (!character) {
      throw new Error('Personnage non trouvé');
    }
    
    const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const conversation: Conversation = {
      id: conversationId,
      sessionId,
      characterId,
      startedAt: new Date().toISOString(),
      messages: [
        {
          sender: 'character',
          content: `Bonjour, je suis ${character.name}, ${character.role}. Que puis-je faire pour vous ?`,
          timestamp: new Date().toISOString(),
          emotion: 'neutral'
        }
      ],
      status: 'active'
    };
    
    // Ajouter à l'historique de la session
    session.sessionLog.push({
      timestamp: new Date().toISOString(),
      type: 'conversation_started',
      description: `Conversation démarrée avec ${character.name}`
    });
    
    this.conversations.set(conversationId, conversation);
    return conversation;
  }
  
  /**
   * Envoie un message à un PNJ dans une conversation existante
   */
  async sendMessageToNPC(conversationId: string, messageContent: string): Promise<{
    response: string;
    emotion: string;
    updatedConversation: Conversation;
  }> {
    const conversation = this.conversations.get(conversationId);
    
    if (!conversation) {
      throw new Error('Conversation non trouvée');
    }
    
    // Ajouter le message de l'utilisateur
    conversation.messages.push({
      sender: 'user',
      content: messageContent,
      timestamp: new Date().toISOString()
    });
    
    // Dans une version réelle, nous utiliserions un LLM pour générer la réponse
    // Pour l'instant, simulons une réponse simple
    
    const response = `Je comprends votre message concernant "${messageContent.substring(0, 30)}...". Comment puis-je vous aider davantage ?`;
    const emotion = 'interested';
    
    // Ajouter la réponse du PNJ
    conversation.messages.push({
      sender: 'character',
      content: response,
      timestamp: new Date().toISOString(),
      emotion
    });
    
    // Mettre à jour la conversation
    this.conversations.set(conversationId, conversation);
    
    return {
      response,
      emotion,
      updatedConversation: conversation
    };
  }
}

export const immersiveScenarioService = new ImmersiveScenarioService();