import { ReactNode } from 'react';

// Types pour les profils de personnalité
export interface PersonalityProfile {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  tone: string;  // par exemple: 'autoritaire', 'paniqué', 'technique', 'accusateur'
  riskTolerance: 'low' | 'medium' | 'high';
  concerns: string[];
  typicalResponses: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
}

// Types pour les événements dans un scénario
export interface ScenarioEvent {
  id: string;
  description: string;
  trigger: 'time' | 'budget' | 'decision' | 'score';
  triggerThreshold?: number;
  triggerDecision?: string;
  budgetImpact: number;
  scoreImpact: number;
  reputationImpact: number;
  nextEvents?: string[];  // IDs des événements qui peuvent suivre
}

// Type pour les scénarios de crise
export interface CrisisScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'débutant' | 'intermédiaire' | 'expert';
  initialBudget: number;
  initialMessage: string;
  mainPersonality: string;  // ID de la personnalité principale
  supportPersonalities: string[];  // IDs des personnalités secondaires
  events: Record<string, ScenarioEvent>;
  initialEvent: string;  // ID de l'événement initial
}

// Roles que l'utilisateur peut adopter
export interface UserRole {
  id: string;
  title: string;
  description: string;
  icon?: string;
  responsibilities: string[];
  difficulty: 'débutant' | 'intermédiaire' | 'expert';
}

// Message dans le chat
export interface CrisisMessage {
  id: string;
  content: string;
  timestamp: number;
  type: 'user' | 'personality' | 'system' | 'event' | 'alert' | 'email' | 'sms';
  sender?: string;  // ID de la personnalité ou 'user'
  metadata?: {
    budgetImpact?: number;
    scoreImpact?: number;
    eventTriggered?: string;
    alertLevel?: 'info' | 'warning' | 'critical';
    [key: string]: any;
  };
}

// État du contexte de crise
export interface CrisisState {
  userName: string;
  userRole: UserRole | null;
  scenario: CrisisScenario | null;
  currentEvent: string | null;
  activePersonalities: PersonalityProfile[];
  messages: CrisisMessage[];
  budget: number;
  score: number;
  reputation: number;
  isSimulationActive: boolean;
  simulationStartTime?: number;
  simulationEndTime?: number;
  alertLevel: 'normal' | 'elevated' | 'high' | 'critical';
}

// Type pour le contexte
export interface CrisisChatContextType {
  state: CrisisState;
  setUserName: (name: string) => void;
  selectRole: (roleId: string) => void;
  selectScenario: (scenarioId: string) => void;
  sendMessage: (message: string) => Promise<void>;
  resetSimulation: () => void;
  startSimulation: () => void;
  endSimulation: () => void;
}

// Props pour le provider de contexte
export interface CrisisChatProviderProps {
  children: ReactNode;
}