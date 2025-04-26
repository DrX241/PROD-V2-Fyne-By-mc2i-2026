/**
 * Fichier de définition des types pour le module de simulation immersive
 */

/**
 * Scénario immersif complet
 */
export interface ImmersiveScenario {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  sector: string;
  duration: string;
  availableRoles: UserRole[];
  narrativeArcs: NarrativeArc[];
  characters: NPCCharacter[];
  decisionPoints: DecisionPoint[];
  metrics: {
    categories: MetricCategory[];
  };
}

/**
 * Rôles possibles pour l'utilisateur
 */
export enum UserRole {
  CISO = 'CISO',
  CTO = 'CTO',
  CEO = 'CEO',
  INCIDENT_MANAGER = 'INCIDENT_MANAGER',
  SECURITY_ANALYST = 'SECURITY_ANALYST',
  COMMUNICATION_DIRECTOR = 'COMMUNICATION_DIRECTOR',
  LEGAL_COUNSEL = 'LEGAL_COUNSEL',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER'
}

/**
 * Arc narratif composé de plusieurs phases
 */
export interface NarrativeArc {
  id: string;
  title: string;
  description: string;
  phases: ScenarioPhase[];
}

/**
 * Phase du scénario
 */
export interface ScenarioPhase {
  id: string;
  title: string;
  description: string;
  duration: number; // en minutes
  requiredMetrics?: {
    metricId: string;
    minValue: number;
  }[];
  unlockConditions?: {
    decisionPointId: string;
    selectedOptionIds: string[];
  }[];
  availableActions: PhaseAction[];
  decisionPoints: string[]; // IDs des points de décision disponibles dans cette phase
  availableCharacters: string[]; // IDs des personnages disponibles pour conversation
}

/**
 * Action disponible dans une phase
 */
export interface PhaseAction {
  id: string;
  title: string;
  description: string;
  requiredRole?: UserRole[];
  consequences: {
    metrics: {
      id: string;
      delta: number;
    }[];
    relationships?: {
      characterId: string;
      delta: number;
    }[];
    unlockPhase?: string;
  };
}

/**
 * Personnage non-joueur (PNJ)
 */
export interface NPCCharacter {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
  personality: string;
  expertise: string[];
  interests: string[];
  relationships: {
    characterId: string;
    type: 'ally' | 'rival' | 'neutral' | 'superior' | 'subordinate';
    description: string;
  }[];
  availableInPhases?: string[];
  dialogueStyle: string;
  backstory: string;
  motivation: string;
  agenda: string;
  attitude: {
    towardsSecurity: 'positive' | 'negative' | 'neutral' | 'skeptical' | 'supportive';
    towardsRisk: 'averse' | 'neutral' | 'accepting' | 'seeking';
    towardsAuthority: 'respectful' | 'challenging' | 'dismissive' | 'indifferent';
  };
}

/**
 * Point de décision dans le scénario
 */
export interface DecisionPoint {
  id: string;
  title: string;
  description: string;
  timeLimit?: number; // Temps limite en secondes, optionnel
  requiredRole?: UserRole[];
  options: DecisionOption[];
  consequences: {
    metrics: {
      id: string;
      delta: number;
    }[];
    relationships: {
      characterId: string;
      delta: number;
    }[];
  };
}

/**
 * Option de décision
 */
export interface DecisionOption {
  id: string;
  text: string;
  consequences: {
    metrics: {
      id: string;
      delta: number;
    }[];
    relationships: {
      characterId: string;
      delta: number;
    }[];
    feedback: string;
    unlockPhase?: string;
  };
}

/**
 * Catégorie de métrique pour mesurer la performance
 */
export interface MetricCategory {
  id: string;
  name: string;
  description: string;
  metrics: Metric[];
}

/**
 * Métrique individuelle
 */
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
    description: string;
    color: string;
  }[];
}

/**
 * Session de simulation active
 */
export interface SimulationSession {
  id: string;
  userId: string;
  scenarioId: string;
  selectedRole: UserRole;
  startTime: number;
  currentPhase: string;
  completedPhases: string[];
  currentMetrics: Record<string, number>;
  characterRelationships: Record<string, number>;
  decisionsMade: {
    decisionPointId: string;
    selectedOptionId: string;
    timestamp: number;
  }[];
  availableCharacters: string[];
  sessionLog: SessionEvent[];
}

/**
 * Événement dans la session
 */
export interface SessionEvent {
  id: string;
  type: 'decision' | 'conversation' | 'phase_change' | 'metric_change' | 'system';
  timestamp: number;
  description: string;
  details?: any;
}

/**
 * Conversation avec un PNJ
 */
export interface ImmersiveConversation {
  id: string;
  sessionId: string;
  characterId: string;
  startTime: number;
  messages: ConversationMessage[];
  currentTopic?: string;
  emotions: {
    characterEmotion: string;
    intensity: number;
    timestamp: number;
  }[];
}

/**
 * Message dans une conversation
 */
export interface ConversationMessage {
  id: string;
  senderId: string; // 'user' ou ID du personnage
  content: string;
  timestamp: number;
  emotion?: string;
}

/**
 * Système de progression des compétences
 */
export interface SkillProgressionSystem {
  skillTrees: SkillTree[];
}

/**
 * Arbre de compétences
 */
export interface SkillTree {
  id: string;
  name: string;
  description: string;
  category: string;
  skills: Skill[];
}

/**
 * Compétence individuelle
 */
export interface Skill {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  prerequisites: string[];
  unlocks: string[];
}