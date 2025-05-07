import { ObjectState, ExitStatus, ChallengeType, GameStatus } from './game-enums';

/**
 * Interfaces pour le jeu CYBER ESCAPE v2
 */

// Interface pour un objet dans une salle
export interface RoomObject {
  id: string;
  name: string;
  description: string;
  state: ObjectState;
  type?: string;
  usable?: boolean;
  interactive?: boolean;
}

// Interface pour un PNJ (personnage non-joueur)
export interface RoomNPC {
  id: string;
  name: string;
  role: string;
  description: string;
}

// Interface pour une sortie de salle
export interface RoomExit {
  direction: string;
  roomId: string;
  name: string;
  status: ExitStatus;
}

// Interface pour un défi dans une salle
export interface RoomChallenge {
  id: string;
  type: string;
  title: string;
  description: string;
  completed: boolean;
  requiredScore: number;
  timeBonus: number;
}

// Interface pour une salle
export interface RoomData {
  id: string;
  name: string;
  description: string;
  backgroundImage?: string;
  objects: RoomObject[];
  npcs: RoomNPC[];
  exits: Record<string, RoomExit>;
  challenge?: RoomChallenge;
}

// Interface pour un objet dans l'inventaire
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: string;
  usable: boolean;
  image?: string;
}

// Interface pour l'état du jeu
export interface GameState {
  status: GameStatus;
  currentStage: number;
  currentRoomId: string;
  inventory: Record<string, InventoryItem>;
  messages: string[];
  timeRemaining: number;
  isTimerActive: boolean;
  activeChallengeId?: string;
  gameCompleted: boolean;
  unlockedStages: number[];
}

// Interface pour une action de jeu
export interface GameAction {
  type: string;
  payload?: any;
}

// Interface pour les données d'initialisation
export interface InitialGameData {
  currentStage: number;
  currentRoomId: string;
  inventory: Record<string, InventoryItem>;
  messages: string[];
  timeRemaining: number;
}

// Interface pour le dialogue avec un PNJ
export interface NPCDialogue {
  id: string;
  npcId: string;
  lines: NPCDialogueLine[];
  currentLineIndex: number;
}

// Interface pour une ligne de dialogue
export interface NPCDialogueLine {
  text: string;
  options?: NPCDialogueOption[];
}

// Interface pour une option de dialogue
export interface NPCDialogueOption {
  text: string;
  nextLineIndex: number;
  action?: () => void;
}

// Interface pour le résultat d'un challenge
export interface ChallengeResult {
  success: boolean;
  score: number;
  timeBonus: number;
  message?: string;
}