import { 
  ImmersiveScenario,
  NPCCharacter, 
  ScenarioStage,
  UserRole, 
  SimulationSession,
  ImmersiveConversation
} from '../types';
import { v4 as uuidv4 } from 'uuid';
import { openAIService } from './openai';
import { ChatCompletionRequestMessage } from '../../shared/schema';

export class ImmersiveScenarioService {
  private activeScenarios: Map<string, ImmersiveScenario> = new Map();
  private activeSessions: Map<string, SimulationSession> = new Map();
  private conversations: Map<string, ImmersiveConversation> = new Map();
  private currentStage: number = 1;
  private stageDescriptions = {
    1: "Détection initiale d'un incident de cybersécurité",
    2: "Premières décisions urgentes à prendre",
    3: "Aggravation de la crise cyber",
    4: "Gestion sous haute pression",
    5: "Évaluation finale"
  };

  /**
   * Initialise le service avec les scénarios prédéfinis
   */
  constructor() {
    console.log('Initialisation du service de scénarios immersifs');
    
    // Charger les scénarios prédéfinis (asynchrone)
    // Nous utilisons une IIFE (Immediately Invoked Function Expression) pour gérer l'async
    (async () => {
      await this.loadPredefinedScenarios();
    })().catch(error => {
      console.error('Erreur lors du chargement initial des scénarios:', error);
    });
  }
  
  /**
   * Charge les scénarios prédéfinis dans le service
   */
  private async loadPredefinedScenarios(): Promise<void> {
    try {
      // Importer dynamiquement les scénarios en utilisant import() au lieu de require
      const scenariosModule = await import('../data/immersive-scenarios/index.js');
      const { immersiveScenarios } = scenariosModule;
      
      // Ajouter chaque scénario à la map active
      immersiveScenarios.forEach((scenario: ImmersiveScenario) => {
        this.activeScenarios.set(scenario.id, scenario);
        console.log(`Scénario chargé: ${scenario.title}`);
      });
      
      console.log(`${this.activeScenarios.size} scénarios immersifs chargés avec succès`);
    } catch (error) {
      console.error('Erreur lors du chargement des scénarios prédéfinis:', error);
    }
  }

  /**
   * Récupère tous les scénarios disponibles
   */
  async getAvailableScenarios(): Promise<ImmersiveScenario[]> {
    // Pour le début, nous retournerons les scénarios prédéfinis
    // À terme, cela pourrait être chargé depuis une base de données
    return Array.from(this.activeScenarios.values());
  }

  /**
   * Ajoute un nouveau scénario immersif
   */
  async addScenario(scenario: Omit<ImmersiveScenario, 'id'>): Promise<ImmersiveScenario> {
    const id = uuidv4();
    const newScenario: ImmersiveScenario = {
      ...scenario,
      id
    };
    
    this.activeScenarios.set(id, newScenario);
    return newScenario;
  }

  /**
   * Démarre une nouvelle session de simulation
   */
  async startSession(scenarioId: string, userId: string, selectedRole: UserRole): Promise<SimulationSession> {
    const scenario = this.activeScenarios.get(scenarioId);
    
    // Tracker pour la progression et l'engagement
    const progressionTracker = {
      currentStage: 0,
      tensionLevel: 0,
      criticalDecisionPoints: [],
      playerEngagement: 0
    };
    
    if (!scenario) {
      throw new Error(`Scénario non trouvé: ${scenarioId}`);
    }
    
    if (!scenario.availableRoles.includes(selectedRole)) {
      throw new Error(`Rôle non disponible pour ce scénario: ${selectedRole}`);
    }
    
    // Initialiser les métriques avec leurs valeurs par défaut
    const initialMetrics: Record<string, number> = {};
    scenario.metrics.categories.forEach(category => {
      category.metrics.forEach(metric => {
        initialMetrics[metric.id] = metric.initialValue;
      });
    });
    
    // Créer une nouvelle session
    const sessionId = uuidv4();
    const initialPhase = scenario.narrativeArcs[0].phases[0].id;
    
    const newSession: SimulationSession = {
      id: sessionId,
      scenarioId,
      userId,
      selectedRole,
      startTime: Date.now(),
      currentPhase: initialPhase,
      elapsedTime: 0,
      currentMetrics: initialMetrics,
      completedActions: [],
      pendingDecisions: [],
      activeEvents: [],
      characterRelationships: {},
      notifications: [],
      availableAssets: [],
      sessionLog: [{
        timestamp: Date.now(),
        type: 'event',
        details: {
          name: 'Session démarrée',
          description: `Début du scénario: ${scenario.title}`
        }
      }],
      currentStage: 1 // Initialize the stage
    };
    
    // Initialiser les relations avec les personnages
    scenario.characters.forEach(character => {
      newSession.characterRelationships[character.id] = 0; // Neutre par défaut
    });
    
    this.activeSessions.set(sessionId, newSession);
    return newSession;
  }

  /**
   * Récupère une session de simulation active
   */
  getSession(sessionId: string): SimulationSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Met à jour une session de simulation
   */
  updateSession(sessionId: string, updates: Partial<SimulationSession>): SimulationSession {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      throw new Error(`Session non trouvée: ${sessionId}`);
    }
    
    const updatedSession = { ...session, ...updates };
    this.activeSessions.set(sessionId, updatedSession);
    
    return updatedSession;
  }

  /**
   * Traite une décision prise par le joueur
   */
  async processDecision(
    sessionId: string, 
    decisionPointId: string, 
    optionId: string
  ): Promise<{
    consequences: string[];
    updatedSession: SimulationSession;
    feedback: string;
  }> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      throw new Error(`Session non trouvée: ${sessionId}`);
    }
    
    const scenario = this.activeScenarios.get(session.scenarioId);
    
    if (!scenario) {
      throw new Error(`Scénario non trouvé: ${session.scenarioId}`);
    }
    
    // Trouver la phase courante
    let currentPhase: ScenarioPhase | undefined;
    let decisionPoint: DecisionPoint | undefined;
    
    for (const arc of scenario.narrativeArcs) {
      const phase = arc.phases.find(p => p.id === session.currentPhase);
      if (phase) {
        currentPhase = phase;
        decisionPoint = phase.decisionPoints.find(dp => dp.id === decisionPointId);
        break;
      }
    }
    
    if (!currentPhase || !decisionPoint) {
      throw new Error(`Phase ou point de décision non trouvé`);
    }
    
    // Trouver l'option choisie
    const option = decisionPoint.options.find(o => o.id === optionId);
    
    if (!option) {
      throw new Error(`Option non trouvée: ${optionId}`);
    }
    
    // Vérifier que le rôle du joueur est autorisé
    if (option.requiredRole && !option.requiredRole.includes(session.selectedRole)) {
      throw new Error(`Votre rôle actuel ne vous permet pas de prendre cette décision`);
    }
    
    // Système avancé de conséquences
    const consequences: string[] = [];
    const updatedMetrics = { ...session.currentMetrics };
    const impactFactors = {
      immediate: [],
      delayed: [],
      cascading: []
    };
    
    // Calculer l'impact sur la tension narrative
    const tensionModifier = calculateTensionModifier(option, session.currentPhase);
    progressionTracker.tensionLevel += tensionModifier;
    
    for (const consequence of option.consequences) {
      if (consequence.type === 'direct') {
        // Appliquer les changements de métriques
        for (const metricChange of consequence.metrics) {
          updatedMetrics[metricChange.metricId] = 
            (updatedMetrics[metricChange.metricId] || 0) + metricChange.change;
        }
        
        consequences.push(consequence.narrative);
        
        // TODO: Déclencher les événements liés à cette conséquence
      }
    }
    
    // Marquer la décision comme prise
    const updatedSession = this.updateSession(sessionId, {
      currentMetrics: updatedMetrics,
      pendingDecisions: session.pendingDecisions.filter(id => id !== decisionPointId),
      sessionLog: [
        ...session.sessionLog,
        {
          timestamp: Date.now(),
          type: 'decision',
          details: {
            decisionId: decisionPointId,
            optionId,
            consequences
          }
        }
      ]
    });
    
    // Générer un feedback narratif
    return {
      consequences,
      updatedSession,
      feedback: option.feedback.immediate
    };
  }

  /**
   * Démarre une conversation avec un PNJ
   */
  async startConversation(
    sessionId: string,
    characterId: string
  ): Promise<ImmersiveConversation> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      throw new Error(`Session non trouvée: ${sessionId}`);
    }
    
    const scenario = this.activeScenarios.get(session.scenarioId);
    
    if (!scenario) {
      throw new Error(`Scénario non trouvé: ${session.scenarioId}`);
    }
    
    const character = scenario.characters.find(c => c.id === characterId);
    
    if (!character) {
      throw new Error(`Personnage non trouvé: ${characterId}`);
    }
    
    // Trouver la phase courante pour le contexte
    let currentPhase: ScenarioPhase | undefined;
    
    for (const arc of scenario.narrativeArcs) {
      const phase = arc.phases.find(p => p.id === session.currentPhase);
      if (phase) {
        currentPhase = phase;
        break;
      }
    }
    
    if (!currentPhase) {
      throw new Error(`Phase courante non trouvée`);
    }
    
    // Créer le contexte pour la conversation
    const phaseContext = `Contexte actuel: ${currentPhase.description}`;
    const relationshipLevel = session.characterRelationships[characterId] || 0;
    let relationshipContext = "Relation neutre avec l'utilisateur.";
    
    if (relationshipLevel > 5) {
      relationshipContext = "Relation très positive et collaborative avec l'utilisateur.";
    } else if (relationshipLevel > 0) {
      relationshipContext = "Bonne relation de travail avec l'utilisateur.";
    } else if (relationshipLevel < -5) {
      relationshipContext = "Relation très tendue avec l'utilisateur.";
    } else if (relationshipLevel < 0) {
      relationshipContext = "Légère tension dans la relation avec l'utilisateur.";
    }
    
    // Créer une nouvelle conversation
    const conversationId = uuidv4();
    const newConversation: ImmersiveConversation = {
      id: conversationId,
      characterId,
      playerRole: session.selectedRole,
      context: `${phaseContext}\n${relationshipContext}`,
      history: [],
      knowledgeConstraints: {
        characterKnows: [],
        characterDoesntKnow: []
      }
    };
    
    // Ajouter les connaissances du personnage
    // Événements que le personnage connaît
    newConversation.knowledgeConstraints.characterKnows = session.sessionLog
      .filter(log => log.type === 'event' && scenario.characters.some(c => 
        c.id === characterId && c.expertise.some(e => 
          log.details.description.toLowerCase().includes(e.toLowerCase())
        )))
      .map(log => log.details.description);
    
    // Événements que le personnage ne connaît pas
    newConversation.knowledgeConstraints.characterDoesntKnow = session.sessionLog
      .filter(log => log.type === 'event' && !scenario.characters.some(c => 
        c.id === characterId && c.expertise.some(e => 
          log.details.description.toLowerCase().includes(e.toLowerCase())
        )))
      .map(log => log.details.description);
    
    this.conversations.set(conversationId, newConversation);
    
    return newConversation;
  }

  /**
   * Envoie un message à un PNJ et obtient sa réponse
   */
  async sendMessageToNPC(
    conversationId: string,
    message: string
  ): Promise<{
    response: string;
    emotion: string;
    updatedConversation: ImmersiveConversation;
  }> {
    const conversation = this.conversations.get(conversationId);
    
    if (!conversation) {
      throw new Error(`Conversation non trouvée: ${conversationId}`);
    }
    
    // Trouver le personnage et le scénario
    let session: SimulationSession | undefined;
    let scenario: ImmersiveScenario | undefined;
    let character: NPCCharacter | undefined;
    
    for (const [sessionId, s] of this.activeSessions.entries()) {
      scenario = this.activeScenarios.get(s.scenarioId);
      if (scenario) {
        character = scenario.characters.find(c => c.id === conversation.characterId);
        if (character) {
          session = s;
          break;
        }
      }
    }
    
    if (!session || !scenario || !character) {
      throw new Error(`Impossible de trouver les informations nécessaires pour cette conversation`);
    }
    
    // Ajouter le message du joueur à l'historique
    conversation.history.push({
      speaker: 'player',
      content: message,
      timestamp: Date.now()
    });
    
    // Préparer le prompt pour l'IA
    const promptContext = `
    Tu incarnes ${character.name}, ${character.role} dans le scénario "${scenario.title}".
    Important: Ta réponse doit suivre ces règles d'immersion:
    1. Réagis émotionnellement en fonction du niveau de tension (${progressionTracker.tensionLevel}/10)
    2. Adapte ton urgence au contexte actuel
    3. Fais référence aux décisions précédentes du joueur
    4. Utilise des éléments de mise en situation (sons, actions, environnement)
    
    Profil du personnage:
    - Expertise: ${character.expertise.join(', ')}
    - Personnalité: ${character.personality}
    - Style de communication: ${character.communicationStyle}
    
    Contexte du scénario: ${conversation.context}
    
    Ce que tu sais sur la situation actuelle:
    ${conversation.knowledgeConstraints.characterKnows.join('\n')}
    
    Information importante: Tu ne sais PAS les choses suivantes (ne les mentionne pas):
    ${conversation.knowledgeConstraints.characterDoesntKnow.join('\n')}
    
    Tu parles à un utilisateur qui joue le rôle de: ${conversation.playerRole}
    
    Historique de la conversation:
    ${conversation.history.map(h => `${h.speaker === 'player' ? 'Utilisateur' : character.name}: ${h.content}`).join('\n')}
    
    Réponds de manière professionnelle mais avec la personnalité de ${character.name}. 
    Ta réponse doit être cohérente avec ton expertise, ton niveau de connaissance et ta relation avec l'utilisateur.
    N'invente pas d'informations que tu ne peux pas connaître dans ton rôle.
    `;
    
    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: promptContext },
      { role: "user", content: message }
    ];
    
    // Obtenir la réponse de l'IA avec plus de créativité pour les personnages
    const aiResponse = await openAIService.getChatCompletionWithCache(
      messages,
      0.8, // Plus de créativité pour les personnages
      800  // Réponses plus longues pour des interactions riches
    );
    
    // Analyse basique de l'émotion de la réponse
    let emotion = "neutral";
    if (aiResponse.includes("!") || aiResponse.includes("urgent") || aiResponse.includes("critique")) {
      emotion = "concerned";
    } else if (aiResponse.includes("excellent") || aiResponse.includes("parfait") || aiResponse.includes("bravo")) {
      emotion = "pleased";
    } else if (aiResponse.includes("désolé") || aiResponse.includes("malheureusement")) {
      emotion = "apologetic";
    }
    
    // Mettre à jour l'historique de la conversation
    conversation.history.push({
      speaker: 'npc',
      content: aiResponse,
      timestamp: Date.now(),
      emotion
    });
    
    // Mettre à jour la relation avec le personnage en fonction du contenu
    // C'est simpliste mais peut être amélioré avec une analyse de sentiment plus sophistiquée
    let relationshipChange = 0;
    if (aiResponse.includes("excellent") || aiResponse.includes("merci") || aiResponse.includes("bonne idée")) {
      relationshipChange = 1;
    } else if (aiResponse.includes("mauvaise") || aiResponse.includes("erreur") || aiResponse.includes("non recommandé")) {
      relationshipChange = -1;
    }
    
    if (relationshipChange !== 0 && session) {
      const updatedRelationships = { ...session.characterRelationships };
      updatedRelationships[character.id] = (updatedRelationships[character.id] || 0) + relationshipChange;
      
      this.updateSession(session.id, {
        characterRelationships: updatedRelationships
      });
    }
    
    return {
      response: aiResponse,
      emotion,
      updatedConversation: conversation
    };
  }

  /**
   * Génère dynamiquement un scénario basé sur les paramètres spécifiés
   */
  async generateScenario(
    sector: string,
    difficulty: "Débutant" | "Intermédiaire" | "Expert",
    focusArea: string
  ): Promise<ImmersiveScenario> {
    // Cette fonction sera implémentée ultérieurement et utilisera l'IA
    // pour générer des scénarios dynamiques et personnalisés
    
    // Pour l'instant, retournons un ID factice
    throw new Error("Génération dynamique des scénarios non implémentée");
  }

  async processUserMessage(
    message: string,
    sessionId: string,
    currentStage: number
  ): Promise<{
    response: string;
    nextStage: number;
    situationUpdate: string;
    consequence: string;
  }> {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Analyse subtile de la réponse précédente
    const analysis = await this.analyzeResponse(message, currentStage);

    // Générer la progression du scénario
    const progression = await this.generateProgression(currentStage, analysis);

    // Générer la réponse
    const response = await this.generateResponse(progression, session);

    const updatedSession = this.updateSession(sessionId, { currentStage: currentStage < 5 ? currentStage + 1 : 5 });

    return {
      response: response.content,
      nextStage: currentStage < 5 ? currentStage + 1 : 5,
      situationUpdate: response.situation,
      consequence: response.consequence
    };
  }

  private async analyzeResponse(message: string, stage: number): Promise<string> {
    const prompt = `
    En tant qu'expert cybersécurité, analysez subtilement cette réponse de l'utilisateur à l'étape ${stage}/5:
    "${message}"

    Contexte: ${this.stageDescriptions[stage as keyof typeof this.stageDescriptions]}
    `;

    return await this.getAIResponse(prompt);
  }

  private async generateProgression(stage: number, analysis: string): Promise<string> {
    const prompt = `
    Étape ${stage}/5 - ${this.stageDescriptions[stage as keyof typeof this.stageDescriptions]}

    Analyse de la réponse: ${analysis}

    Générez la prochaine situation avec:
    1. Une brève description de l'évolution (1 paragraphe)
    2. Une question précise
    3. Une conséquence directe des actions précédentes
    `;

    const response = await this.getAIResponse(prompt);
    return response;
  }

  private async generateResponse(progression: string, session: SimulationSession): Promise<{ content: string; situation: string; consequence: string }> {
    const prompt = `
    Progression du scénario: ${progression}

    Contexte de la session: ${JSON.stringify(session, null, 2)}

    Générer une réponse pour l'utilisateur avec:
    1. Un contenu pertinent (réponse à la question et description de la situation)
    2. Une description de la situation
    3. Une conséquence directe des actions précédentes
    `;

    const response = await this.getAIResponse(prompt);
    const parts = response.split('\n\n');
    return {
      content: parts[0],
      situation: parts[1],
      consequence: parts[2]
    };
  }


  private async getAIResponse(prompt: string): Promise<string> {
    const messages: ChatCompletionRequestMessage[] = [
      { role: "system", content: prompt },
    ];
    const aiResponse = await openAIService.getChatCompletionWithCache(
      messages,
      0.7,
      500
    );
    return aiResponse;
  }
}

export const immersiveScenarioService = new ImmersiveScenarioService();

// Placeholder function - needs actual implementation
function calculateTensionModifier(option: any, currentPhase: any): number {
  return 0; // Replace with actual tension calculation
}

interface ScenarioPhase {
  id: string;
  description: string;
  decisionPoints: DecisionPoint[];
}

interface DecisionPoint {
  id: string;
  options: {
    id: string;
    requiredRole?: UserRole[];
    consequences: {
      type: 'direct' | 'delayed' | 'cascading';
      narrative: string;
      metrics?: { metricId: string; change: number }[];
    }[];
    feedback: { immediate: string; delayed: string };
  }[];
}