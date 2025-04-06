/**
 * Types pour le module de simulation immersive
 */

export type UserRole = 'RSSI' | 'DSI' | 'DG' | 'DRH' | 'DAF';

export interface ImmersiveScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Expert';
  context: {
    industry: string;
    organization: string;
    background: string;
  };
  availableRoles: UserRole[];
  narrativeArcs: NarrativeArc[];
  characters: Character[];
  metrics: {
    categories: MetricCategory[];
  };
}

export interface NarrativeArc {
  id: string;
  title: string;
  description: string;
  phases: Phase[];
}

export interface Phase {
  id: string;
  title: string;
  description: string;
  decisionPoints: DecisionPoint[];
  availableActions: Action[];
}

export interface DecisionPoint {
  id: string;
  title: string;
  description: string;
  options: DecisionOption[];
}

export interface DecisionOption {
  id: string;
  text: string;
  consequences: {
    description: string;
    metrics: {
      metricId: string;
      change: number;
    }[];
    relationships: {
      characterId: string;
      change: number;
    }[];
    nextPhase?: string;
  };
}

export interface Action {
  id: string;
  title: string;
  description: string;
  requiredRole?: UserRole[];
  cost?: {
    time?: number;
    budget?: number;
  };
  outcomes: {
    description: string;
    metrics?: {
      metricId: string;
      change: number;
    }[];
  };
}

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  personality: string;
  knowledge: string[];
  interests: string[];
  availableInPhases: string[];
  initialEmotion: string;
}

export interface MetricCategory {
  id: string;
  name: string;
  description: string;
  metrics: Metric[];
}

export interface Metric {
  id: string;
  name: string;
  description: string;
  min: number;
  max: number;
  initialValue: number;
  visibleToRoles: UserRole[];
  thresholds: {
    value: number;
    label: string;
    color: string;
  }[];
}

export interface ImmersiveSession {
  id: string;
  scenarioId: string;
  userId: string;
  selectedRole: UserRole;
  currentPhase: string;
  startedAt: string;
  completedAt?: string;
  completedPhases: string[];
  decisionsMade: {
    timestamp: string;
    decisionPointId: string;
    optionId: string;
  }[];
  characterRelationships: Record<string, number>;
  currentMetrics: Record<string, number>;
  sessionLog: {
    timestamp: string;
    type: string;
    description: string;
  }[];
}

export interface Conversation {
  id: string;
  sessionId: string;
  characterId: string;
  startedAt: string;
  endedAt?: string;
  status: 'active' | 'ended';
  messages: {
    sender: 'user' | 'character';
    content: string;
    timestamp: string;
    emotion?: string;
  }[];
}