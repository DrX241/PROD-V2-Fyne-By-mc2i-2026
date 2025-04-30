// Définitions de types pour le module CyberChallenge

// Énumérations
export enum PlayerRole {
  RSSI = 'RSSI',
  ETHICAL_HACKER = 'Ethical Hacker',
  DEVELOPER = 'Developer',
  CONSULTANT = 'Cybersecurity Consultant',
  LEGAL_EXPERT = 'Legal Expert'
}

export enum GameMode {
  CLASSIC = 'classic',          // Défi Classique
  TUNNEL = 'tunnel',            // Effet Tunnel
  HACKATHON = 'hackathon',      // Hackathon
  PCA = 'pca'                   // Scénario PCA
}

export enum NpcRole {
  CEO = 'CEO',
  CTO = 'CTO',
  CFO = 'CFO',
  HR_DIRECTOR = 'HR Director',
  SOC_ANALYST = 'SOC Analyst',
  COMMS_DIRECTOR = 'Communications Director'
}

export enum EventType {
  PLAYER_ACTION = 'PLAYER_ACTION',
  NPC_RESPONSE = 'NPC_RESPONSE',
  SYSTEM_EVENT = 'SYSTEM_EVENT',
  DECISION_POINT = 'DECISION_POINT',
  BUDGET_UPDATE = 'BUDGET_UPDATE',
  EMAIL = 'EMAIL'
}

export enum ScenarioType {
  RANSOMWARE = 'RANSOMWARE',
  DATA_BREACH = 'DATA_BREACH',
  PHISHING = 'PHISHING',
  MALWARE = 'MALWARE',
  INSIDER_THREAT = 'INSIDER_THREAT',
  SUPPLY_CHAIN = 'SUPPLY_CHAIN'
}

export enum GameStatus {
  CONFIGURING = 'configuring',
  READY = 'ready',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum UrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Interfaces
export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  score: number;
  avatarUrl?: string;
  isActive: boolean;
}

export interface NPC {
  id: string;
  name: string;
  role: NpcRole;
  personality: string;
  description: string;
  attitude: 'positive' | 'neutral' | 'negative';
  avatarUrl?: string;
}

export interface TimelineItem {
  time: string;
  event: string;
}

export interface Stakeholder {
  name: string;
  interest: string;
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  options: Array<{
    id: string;
    text: string;
    cost?: number;
    points?: number;
  }>;
}

export interface Scenario {
  title: string;
  description: string;
  type: ScenarioType;
  difficultyLevel: string;
  initialBudget: number;
  remainingBudget: number;
  maxTurns: number;
  timeLimit?: number;
  objectives: string[];
  assets: string[];
  timeline?: TimelineItem[];
  stakeholders?: Stakeholder[];
  decisions?: Decision[];
  summary?: string;
  // Propriétés supplémentaires pour le fonctionnement du jeu
  companyName?: string;
  currentStage?: number;
  maxStages?: number;
  urgencyLevel?: string;
  simulatedDate?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId?: string;
  content: string;
  timestamp: number;
  isSystemMessage: boolean;
  attachments?: string[];
}

export interface GameEvent {
  id: string;
  timestamp: number;
  type: EventType;
  content: string;
  playerId?: string;
  npcId?: string;
  metadata?: {
    cost?: number;
    points?: number;
    budgetChange?: number;
    decision?: string;
    remainingBudget?: number;
  };
}

export interface GameState {
  id: string;
  players: Player[];
  scenario: Scenario;
  npcs: NPC[];
  gameEvents: GameEvent[];
  currentPlayerIndex: number;
  isGameOver: boolean;
  startedAt: number;
  endedAt?: number;
  gameMode?: GameMode;
  interactions?: {
    npcId: string;
    attitude: 'positive' | 'neutral' | 'negative';
    lastInteractionTimestamp: number;
  }[];
}

export interface ActionEvaluation {
  points: number;
  cost: number;
  feedback: string;
  isPositive: boolean;
  affectedNPCs?: {
    npcId: string;
    reactionType: "positive" | "negative" | "neutral";
  }[];
}

// Types pour les requêtes d'API
export interface NewGameConfig {
  playerCount: number;
}

export interface PlayerParams {
  name: string;
  role: PlayerRole;
}

export interface ScenarioParams {
  difficultyLevel: "easy" | "medium" | "hard";
  scenarioType: "ransomware" | "data_breach" | "phishing" | "malware" | "insider_threat" | "supply_chain";
  gameMode: GameMode;
}

export interface ActionParams {
  playerId: string;
  action: string;
  targetNpcId?: string;
}

export interface EndGameParams {
  reason?: string;
}