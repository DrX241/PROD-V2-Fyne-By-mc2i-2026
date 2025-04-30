// Types pour l'application CyberChallenge

// Rôles des joueurs
export enum PlayerRole {
  RSSI = "RSSI",
  HACKER = "Hacker éthique",
  DEVELOPER = "Développeur",
  SYSADMIN = "Administrateur Système",
  CONSULTANT = "Consultant en cybersécurité",
  LEGAL = "Juriste cybersécurité"
}

// Joueur
export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  score: number;
  active: boolean; // Indique si c'est le tour du joueur
}

// Personnalités des PNJ (Personnages Non-Joueurs)
export enum NPCAttitude {
  SUPPORTIVE = "supportive",
  NEUTRAL = "neutral",
  OBSTRUCTIVE = "obstructive"
}

// PNJ (Personnage Non-Joueur)
export interface NPC {
  id: string;
  name: string;
  role: string;
  personality: string;
  attitude: NPCAttitude;
  avatarUrl?: string;
}

// Niveaux d'urgence
export enum UrgencyLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

// Scénarios de crise
export interface Scenario {
  id: string;
  title: string;
  companyName: string;
  initialBudget: number;
  remainingBudget: number;
  simulatedDate: string;
  urgencyLevel: UrgencyLevel;
  description: string;
  initialEmail: EmailMessage;
  currentStage: number;
  maxStages: number;
}

// Types d'événements de jeu
export enum EventType {
  PLAYER_ACTION = "player_action",
  NPC_RESPONSE = "npc_response",
  SYSTEM_EVENT = "system_event",
  EMAIL = "email",
  BUDGET_UPDATE = "budget_update"
}

// Message email
export interface EmailMessage {
  id: string;
  sender: {
    name: string;
    email: string;
    role?: string;
  };
  recipient: string;
  subject: string;
  content: string;
  timestamp: number;
  isUrgent: boolean;
  attachments?: string[];
}

// Événement de jeu
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

// État du jeu
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
}

// Évaluation d'une action de joueur
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

// Configuration d'un nouveau jeu
export interface NewGameConfig {
  playerCount: number;
}

// Paramètres d'un joueur
export interface PlayerParams {
  name: string;
  role: PlayerRole;
}

// Options de génération de scénarios
export interface ScenarioGenerationOptions {
  difficultyLevel?: "easy" | "medium" | "hard";
  scenarioType?: "ransomware" | "data_breach" | "phishing" | "malware" | "insider_threat" | "random";
}