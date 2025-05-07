/**
 * Énumérations pour le jeu CYBER ESCAPE v2
 */

// État des objets dans le jeu
export enum ObjectState {
  DEFAULT = 'default',
  ACTIVE = 'active',
  DISABLED = 'disabled'
}

// Types d'objets dans le jeu
export enum ObjectType {
  TERMINAL = 'terminal',
  DOCUMENT = 'document',
  DEVICE = 'device',
  ITEM = 'item',
  KEY = 'key'
}

// État des sorties (portes, passages, etc.)
export enum ExitStatus {
  OPEN = 'open',
  LOCKED = 'locked',
  HIDDEN = 'hidden'
}

// Types de défis
export enum ChallengeType {
  PHISHING = 'phishing',
  PUZZLE = 'puzzle',
  CODE = 'code',
  NETWORK = 'network',
  FORENSIC = 'forensic',
  PASSWORD = 'password'
}

// Niveaux de difficulté
export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

// États de jeu
export enum GameStatus {
  INITIALIZING = 'initializing',
  PLAYING = 'playing',
  PAUSED = 'paused',
  CHALLENGE_ACTIVE = 'challenge_active',
  DIALOG_ACTIVE = 'dialog_active',
  GAME_OVER = 'game_over',
  VICTORY = 'victory'
}

// Types d'actions dans le jeu
export enum GameActionType {
  MOVE = 'move',
  INTERACT = 'interact',
  USE_ITEM = 'use_item',
  TALK = 'talk',
  EXAMINE = 'examine',
  UNLOCK = 'unlock',
  START_CHALLENGE = 'start_challenge',
  COMPLETE_CHALLENGE = 'complete_challenge',
  COLLECT_ITEM = 'collect_item'
}