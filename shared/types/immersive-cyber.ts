// Types pour le nouveau système immersif de simulation de cybersécurité

// Types de rôles disponibles dans le système
export type UserRole = 
  | "RSSI" 
  | "CommunicationManager" 
  | "TechnicalLead"
  | "CrisisManager"
  | "LegalAdvisor"
  | "BusinessContinuityManager"
  | "HumanResourcesManager"
  | "ExternalExpert";

// Niveau d'expertise de l'utilisateur
export type ExpertiseLevel = "Débutant" | "Intermédiaire" | "Expert";

// Interface pour les personnages non-joueurs (PNJ)
export interface NPCCharacter {
  id: string;
  name: string;
  role: string;
  avatar: string;
  expertise: string[];
  personality: string; // Description de la personnalité pour guider l'IA
  backstory: string; // Histoire du personnage pour contexte
  communicationStyle: string; // Style de communication pour l'IA
  knowledgeAreas: string[]; // Domaines de connaissance du PNJ
  relationshipWithPlayer?: string; // Relation avec le joueur, dynamique
  memoryOfInteractions: NPCMemory[]; // Mémoire des interactions passées
}

// Mémoire des interactions pour les PNJ
export interface NPCMemory {
  timestamp: number;
  interactionType: "conversation" | "decision" | "event";
  context: string;
  impact: "positive" | "negative" | "neutral";
  memoryStrength: number; // 1-10, détermine la probabilité que le PNJ s'en souvienne
  details: string;
}

// Structure de scénario immersif
export interface ImmersiveScenario {
  id: string;
  title: string;
  description: string;
  difficulty: ExpertiseLevel;
  sector: string; // Secteur d'activité
  companyProfile: CompanyProfile; // Profil détaillé de l'entreprise concernée
  availableRoles: UserRole[]; // Rôles que le joueur peut choisir
  narrativeArcs: NarrativeArc[]; // Arcs narratifs possibles du scénario
  characters: NPCCharacter[]; // Personnages impliqués dans le scénario
  initialSituation: string; // Description détaillée de la situation initiale
  timeframe: string; // Cadre temporel du scénario (temps réel, accéléré, etc.)
  assets: ScenarioAssets; // Actifs et ressources disponibles pour le scénario
  metrics: ScenarioMetrics; // Métriques et indicateurs de performance
  learningObjectives: string[]; // Objectifs d'apprentissage du scénario
}

// Profil détaillé de l'entreprise
export interface CompanyProfile {
  name: string;
  sector: string;
  size: "Startup" | "PME" | "ETI" | "Groupe";
  revenue: string;
  employeeCount: number;
  locations: string[];
  infrastructure: InfrastructureDetails;
  businessCriticalSystems: string[];
  regulatoryObligations: string[];
  stakeholders: Stakeholder[];
}

// Détails de l'infrastructure de l'entreprise
export interface InfrastructureDetails {
  cloudServices: string[];
  onPremSystems: string[];
  criticalApplications: string[];
  securityTools: string[];
  networkTopology: string;
  dataClassification: DataClassification[];
}

// Classification des données
export interface DataClassification {
  category: string;
  sensitivity: "Public" | "Interne" | "Confidentiel" | "Secret";
  storageLocations: string[];
  regimes: string[]; // RGPD, NIS2, etc.
}

// Parties prenantes de l'entreprise
export interface Stakeholder {
  name: string;
  role: string;
  influence: number; // 1-10
  interests: string[];
  attitude: "Supportive" | "Neutral" | "Resistant";
}

// Arc narratif du scénario
export interface NarrativeArc {
  id: string;
  name: string;
  description: string;
  triggerConditions: TriggerCondition[];
  phases: ScenarioPhase[];
  possibleOutcomes: ScenarioOutcome[];
  adaptivityRules: AdaptivityRule[]; // Règles pour adapter le scénario dynamiquement
}

// Condition de déclenchement
export interface TriggerCondition {
  type: "decision" | "time" | "metric" | "event";
  parameters: Record<string, any>;
  description: string;
}

// Phase du scénario
export interface ScenarioPhase {
  id: string;
  name: string;
  description: string;
  duration: number; // En minutes
  availableActions: ActionOption[];
  events: ScenarioEvent[];
  notifications: Notification[];
  decisionPoints: DecisionPoint[];
  nextPhases: {
    phaseId: string;
    transitionCondition: TriggerCondition;
  }[];
}

// Option d'action pour le joueur
export interface ActionOption {
  id: string;
  name: string;
  description: string;
  requiredRole: UserRole[];
  requiredResources: string[];
  timeToComplete: number; // En minutes
  consequences: Consequence[];
  visibleCondition?: TriggerCondition; // Condition pour que cette action soit visible
}

// Conséquence d'une action
export interface Consequence {
  type: "direct" | "delayed" | "hidden";
  delay?: number; // Délai avant application (en minutes)
  metrics: {
    metricId: string;
    change: number;
  }[];
  narrative: string; // Description narrative de la conséquence
  triggers: string[]; // ID des événements ou conditions déclenchés
}

// Événement du scénario
export interface ScenarioEvent {
  id: string;
  name: string;
  description: string;
  triggerCondition: TriggerCondition;
  visibleToRoles: UserRole[];
  impact: {
    metricId: string;
    change: number;
  }[];
  relatedCharacters: string[]; // ID des personnages concernés
  narrative: string; // Description détaillée de l'événement
  playerResponseOptions?: ActionOption[]; // Options de réponse si interactive
}

// Notification du système
export interface Notification {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "critical" | "success";
  visibleToRoles: UserRole[];
  triggerCondition: TriggerCondition;
  actions?: {
    label: string;
    actionId: string;
  }[];
}

// Point de décision
export interface DecisionPoint {
  id: string;
  title: string;
  description: string;
  context: string; // Contexte détaillé pour aider à la décision
  timeLimit?: number; // Temps limite en minutes, optionnel
  options: DecisionOption[];
  visibleToRoles: UserRole[];
  triggerCondition: TriggerCondition;
  autoresolveOption?: string; // ID de l'option choisie si le temps est écoulé
}

// Option de décision
export interface DecisionOption {
  id: string;
  text: string;
  requiredRole?: UserRole[];
  consequences: Consequence[];
  feedback: {
    immediate: string; // Feedback immédiat
    delayed: string; // Feedback après avoir vu les conséquences
  };
  expertise: {
    domain: string;
    level: number; // 1-10
  }[];
}

// Résultat possible du scénario
export interface ScenarioOutcome {
  id: string;
  name: string;
  description: string;
  conditions: TriggerCondition[]; // Conditions pour atteindre ce résultat
  metrics: Record<string, number>; // Valeurs finales des métriques
  narrative: string; // Description narrative du résultat
  debriefing: string; // Analyse post-scénario
  learningPoints: string[]; // Points d'apprentissage à retenir
}

// Règle d'adaptativité
export interface AdaptivityRule {
  id: string;
  condition: TriggerCondition;
  adjustments: {
    difficulty?: number; // -10 à +10, ajustement de la difficulté
    availableTime?: number; // Ajustement du temps disponible en %
    additionalResources?: string[]; // Ressources supplémentaires
    eventProbabilities?: Record<string, number>; // Modification des probabilités d'événements
  };
  explanation: string; // Explication de cette règle pour l'analyseur
}

// Actifs et ressources du scénario
export interface ScenarioAssets {
  documents: {
    id: string;
    name: string;
    type: "procedure" | "rapport" | "plan" | "email" | "article";
    content: string;
    visibleToRoles: UserRole[];
    triggerCondition?: TriggerCondition;
  }[];
  tools: {
    id: string;
    name: string;
    description: string;
    capabilities: string[];
    requiredRole?: UserRole[];
    usage: string; // Instructions d'utilisation
  }[];
  simulatedSystems: {
    id: string;
    name: string;
    type: "soc" | "firewall" | "email" | "logs" | "custom";
    interface: string; // Description de l'interface
    capabilities: string[];
  }[];
}

// Métriques et indicateurs de performance
export interface ScenarioMetrics {
  categories: {
    id: string;
    name: string;
    description: string;
    metrics: Metric[];
  }[];
}

// Métrique individuelle
export interface Metric {
  id: string;
  name: string;
  description: string;
  initialValue: number;
  min: number;
  max: number;
  visibleToRoles: UserRole[];
  thresholds: {
    value: number;
    label: string;
    consequence?: string;
  }[];
}

// Interface pour le système de progression
export interface SkillProgressionSystem {
  skillTrees: SkillTree[];
  userProgress: UserProgress;
}

// Arbre de compétences
export interface SkillTree {
  id: string;
  name: string;
  description: string;
  category: "technique" | "management" | "communication" | "stratégie" | "juridique";
  skills: Skill[];
}

// Compétence individuelle
export interface Skill {
  id: string;
  name: string;
  description: string;
  level: number; // 1-5
  prerequisites: string[]; // IDs des compétences requises
  unlocks: string[]; // IDs des compétences débloquées
  scenariosForPractice: string[]; // IDs des scénarios recommandés pour pratique
}

// Progression de l'utilisateur
export interface UserProgress {
  userId: string;
  completedScenarios: {
    scenarioId: string;
    roleUsed: UserRole;
    completionDate: string;
    outcome: string;
    performanceMetrics: Record<string, number>;
  }[];
  skillLevels: {
    skillId: string;
    currentLevel: number;
    experience: number; // Points d'expérience accumulés
    lastPracticed: string; // Date de dernière pratique
  }[];
  badges: {
    id: string;
    name: string;
    description: string;
    dateEarned: string;
    category: string;
    level: "bronze" | "silver" | "gold" | "platinum";
  }[];
  learningPath: {
    currentFocus: string[];
    recommendedScenarios: string[];
    personalGoals: string[];
  };
}

// Interface pour une conversation immersive avec un PNJ
export interface ImmersiveConversation {
  id: string;
  characterId: string;
  playerRole: UserRole;
  context: string;
  history: {
    speaker: "player" | "npc";
    content: string;
    timestamp: number;
    emotion?: string;
    attachments?: any[];
  }[];
  knowledgeConstraints: {
    characterKnows: string[];
    characterDoesntKnow: string[];
  };
  conversationGoals?: string[];
  specialInstructions?: string;
}

// Interface pour une session de simulation en cours
export interface SimulationSession {
  id: string;
  scenarioId: string;
  userId: string;
  selectedRole: UserRole;
  startTime: number;
  currentPhase: string;
  elapsedTime: number;
  currentMetrics: Record<string, number>;
  completedActions: string[];
  pendingDecisions: string[];
  activeEvents: string[];
  characterRelationships: Record<string, number>; // ID du personnage -> niveau de relation (-10 à +10)
  notifications: Notification[];
  availableAssets: string[];
  sessionLog: {
    timestamp: number;
    type: "action" | "decision" | "event" | "conversation";
    details: any;
  }[];
}