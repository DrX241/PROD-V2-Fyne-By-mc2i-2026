import { GameStage, ChallengeType, MedalType, GameStatus, ObjectState, Direction, ExitStatus } from './game-enums';

/**
 * Interface pour les objets dans l'inventaire du joueur
 */
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  usable?: boolean;
  consumed?: boolean;
  useTarget?: string[];
}

/**
 * Interface pour les effets spéciaux (visuels, sonores, etc.)
 */
export interface GameEffect {
  type: 'notification' | 'highlight' | 'shake' | 'pulse' | 'fadeIn' | 'fadeOut';
  target?: string;
  duration?: number;
  message?: string;
}

/**
 * Interface pour les événements du jeu
 */
export interface GameEvent {
  type: 'item_pickup' | 'item_use' | 'door_unlock' | 'challenge_start' | 'challenge_complete' | 'npc_talk';
  targetId?: string;
  data?: any;
  effect?: GameEffect;
}

/**
 * Interface pour les résultats de commandes
 */
export interface CommandResult {
  success: boolean;
  message: string;
  event?: GameEvent;
}

/**
 * Interface pour les données du joueur
 */
export interface PlayerData {
  stagesCompleted: number[];
  inventory: Record<string, InventoryItem>;
  medals: Record<string, MedalType>;
  quizScores: Record<string, number>;
}

/**
 * Interface pour les données d'une partie sauvegardée
 */
export interface SavedGameData {
  player: PlayerData;
  currentStage: GameStage;
  timeRemaining: number;
  timestamp: number;
}

/**
 * Type pour les fonctions de manipulation de l'état du jeu
 */
export type GameActionHandler = (action: string, target?: string) => CommandResult;

/**
 * Type pour les fonctions gérant les défis
 */
export type ChallengeHandler = (data: any, answer: any) => {
  success: boolean;
  message: string;
  timeChange: number;
};