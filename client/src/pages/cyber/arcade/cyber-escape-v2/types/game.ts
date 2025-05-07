import { GameStatus, GameActionType, ExitStatus, ObjectState, ChallengeType, ObjectType } from './game-enums';

/**
 * Types principaux pour le jeu Cyber Escape
 */

// État du jeu
export interface GameState {
  status: GameStatus;
  currentStage: number;
  currentRoomId: string;
  inventory: Record<string, InventoryItem>;
  messages: string[];
  timeRemaining: number;
  isTimerActive: boolean;
  gameCompleted: boolean;
  unlockedStages: number[];
  activeChallengeId?: string;
}

// Actions du jeu (pour le reducer)
export type GameAction = 
  | { type: GameActionType.MOVE; payload: string }
  | { type: GameActionType.INTERACT; payload: { message: string } }
  | { type: GameActionType.COLLECT_ITEM; payload: InventoryItem }
  | { type: GameActionType.START_CHALLENGE; payload: string }
  | { type: GameActionType.COMPLETE_CHALLENGE; payload: ChallengeResult }
  | { type: 'UPDATE_TIME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'RESTART_GAME' }
  | { type: 'ADD_MESSAGE'; payload: string }
  | { type: 'UNLOCK_EXIT'; payload?: { message: string } }
  | { type: 'GAME_VICTORY' }
  | { type: 'INIT_COMPLETE' };

// Structure d'un objet d'inventaire
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: string;
  usable: boolean;
  iconPath?: string;
}

// Structure d'une salle
export interface RoomData {
  id: string;
  name: string;
  description: string;
  backgroundPath: string;
  objects: RoomObject[];
  npcs: RoomNPC[];
  exits: Record<string, RoomExit>;
  challenge?: RoomChallenge;
}

// Objet dans une salle
export interface RoomObject {
  id: string;
  name: string;
  description: string;
  type: ObjectType | string;
  interactable: boolean;
  collectible: boolean;
  position: { x: number; y: number; width?: number; height?: number };
  state: ObjectState;
  imagePath?: string;
}

// PNJ dans une salle
export interface RoomNPC {
  id: string;
  name: string;
  role: string;
  description: string;
  dialogues: string[];
  position: { x: number; y: number; width?: number; height?: number };
  imagePath?: string;
}

// Sortie d'une salle
export interface RoomExit {
  roomId: string;
  name: string;
  description: string;
  status: ExitStatus;
  requiresItem?: string;
  position?: { x: number; y: number; width?: number; height?: number };
}

// Structure d'un défi dans une salle
export interface RoomChallenge {
  id: string;
  type: ChallengeType | string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit?: number;
  data?: any;
}

// Résultat d'un défi
export interface ChallengeResult {
  success: boolean;
  score: number;
  timeBonus: number;
  message?: string;
}