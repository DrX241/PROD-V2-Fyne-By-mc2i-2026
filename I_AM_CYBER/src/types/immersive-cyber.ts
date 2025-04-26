// Types pour les scenarios immersifs
export type UserRole = 'RSSI' | 'CrisisManager' | 'CommunicationManager' | 'TechnicalLead' | 'HumanResourcesManager' | 'LegalAdvisor' | 'BusinessContinuityManager' | 'ExternalExpert';

export type ScenarioDifficulty = 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert';
export type ScenarioSector = 'Finance' | 'Santé' | 'Industrie' | 'Retail' | 'Services Publics' | 'Énergie' | 'Transport' | 'Éducation';

export interface CompanyProfile {
  name: string;
  size: string;
  employeeCount: number;
  revenue: string;
  locations: string[];
  businessCriticalSystems: string[];
  regulatoryObligations: string[];
  infrastructure: {
    cloudServices: string[];
    onPremSystems: string[];
    securityTools: string[];
    networkTopology: string;
  };
}

export interface ImmersiveScenario {
  id: string;
  title: string;
  description: string;
  companyProfile: CompanyProfile;
  initialSituation: string;
  timeframe: string;
  difficulty: ScenarioDifficulty;
  sector: ScenarioSector;
  availableRoles: UserRole[];
  learningObjectives: string[];
  estimatedDuration: string;
  imageUrl?: string;
}

export interface SimulationSession {
  id: string;
  scenarioId: string;
  userId: string;
  userRole: UserRole;
  startedAt: number;
  currentPhaseIndex: number;
  totalPhases: number;
  currentPhase: ScenarioPhase;
  decisions: Decision[];
  currentMetrics: {
    technical: number;
    communication: number;
    business: number;
    compliance: number;
    [key: string]: number;
  };
  status: 'active' | 'completed' | 'failed';
}

export interface NPCCharacter {
  id: string;
  name: string;
  role: string;
  background?: string;
  expertise: string[];
  avatar?: string;
  availability: boolean;
}

export interface ScenarioPhase {
  id: string;
  title: string;
  description: string;
  events?: ScenarioEvent[];
  decisionPoints?: DecisionPoint[];
  notifications?: Notification[];
  availableCharacters?: string[];
  timeLimit?: number;
}

export interface ScenarioEvent {
  id: string;
  type: 'notification' | 'communication' | 'system' | 'decision' | 'intelligence';
  title: string;
  narrative: string;
  timestamp: number;
  visibleToRoles?: UserRole[];
}

export interface DecisionPoint {
  id: string;
  title: string;
  context: string;
  description: string;
  options: DecisionOption[];
  timeLimit?: number;
}

export interface DecisionOption {
  id: string;
  text: string;
  impacts: {
    technical: number;
    communication: number;
    business: number;
    compliance: number;
    [key: string]: number;
  };
  nextPhase?: string;
  requiredRole?: UserRole[];
  feedback?: string;
}

export interface Decision {
  id: string;
  decisionPointId: string;
  optionId: string;
  timestamp: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'alert';
  title: string;
  content: string;
  visibleToRoles: UserRole[];
  timestamp: number;
}

export interface ImmersiveConversation {
  id: string;
  sessionId: string;
  characterId: string;
  messages: ConversationMessage[];
  startedAt: number;
  status: 'active' | 'completed';
}

export interface ConversationMessage {
  id: string;
  sender: 'user' | 'character';
  content: string;
  timestamp: number;
}