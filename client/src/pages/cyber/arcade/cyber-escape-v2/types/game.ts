import { GameStatus, ObjectState, ExitStatus, ChallengeType, ObjectType } from './game-enums';

// Types d'interfaces pour le jeu CYBER ESCAPE

// Position et dimensions d'un élément dans la salle
export interface Position {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

// Objet dans une salle
export interface RoomObject {
  id: string;
  name: string;
  description: string;
  type: string | ObjectType;
  interactable: boolean;
  collectible: boolean;
  position: Position;
  state: ObjectState;
  imagePath?: string;
  requires?: string; // ID d'un autre objet requis pour interagir
}

// Personnage non-joueur (PNJ)
export interface RoomNPC {
  id: string;
  name: string;
  role: string;
  description: string;
  dialogues: string[];
  position: Position;
  imagePath?: string;
}

// Sortie d'une salle
export interface RoomExit {
  roomId: string;
  name: string;
  description: string;
  status: ExitStatus;
  requiresItem?: string;
  position: Position;
}

// Défi à relever
export interface RoomChallenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit: number;
  data: any;
}

// Salle du jeu
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

// Objet dans l'inventaire
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: string;
  imagePath?: string;
  usable: boolean;
}

// Résultat d'un défi
export interface ChallengeResult {
  success: boolean;
  score: number;
  timeBonus: number;
  message?: string;
}

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

// Actions du jeu
export type GameAction = 
  | { type: 'MOVE', payload: string }
  | { type: 'INTERACT', payload: { message: string } }
  | { type: 'COLLECT_ITEM', payload: InventoryItem }
  | { type: 'START_CHALLENGE', payload: string }
  | { type: 'COMPLETE_CHALLENGE', payload: ChallengeResult }
  | { type: 'UPDATE_TIME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'RESTART_GAME' }
  | { type: 'ADD_MESSAGE', payload: string }
  | { type: 'UNLOCK_EXIT', payload?: { message: string } }
  | { type: 'GAME_VICTORY' }
  | { type: 'INIT_COMPLETE' };