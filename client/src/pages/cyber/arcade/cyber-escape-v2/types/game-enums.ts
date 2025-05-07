/**
 * Énumérations pour les types de jeu
 */

// États possibles du jeu
export enum GameStatus {
  INITIALIZING = 'initializing',
  PLAYING = 'playing',
  PAUSED = 'paused',
  CHALLENGE_ACTIVE = 'challenge_active',
  GAME_OVER = 'game_over',
  VICTORY = 'victory'
}

// Types d'actions pour le reducer
export enum GameActionType {
  MOVE = 'MOVE',
  INTERACT = 'INTERACT',
  COLLECT_ITEM = 'COLLECT_ITEM',
  START_CHALLENGE = 'START_CHALLENGE',
  COMPLETE_CHALLENGE = 'COMPLETE_CHALLENGE'
}

// États possibles des sorties
export enum ExitStatus {
  OPEN = 'open',
  LOCKED = 'locked',
  HIDDEN = 'hidden'
}

// États possibles des objets
export enum ObjectState {
  NORMAL = 'normal',
  HIGHLIGHTED = 'highlighted',
  DISABLED = 'disabled',
  INTERACTIVE = 'interactive'
}

// Types de défis
export enum ChallengeType {
  PHISHING = 'phishing',
  FIREWALL = 'firewall',
  PASSWORD = 'password',
  CODE = 'code',
  PUZZLE = 'puzzle'
}

// Types d'objets dans la salle
export enum ObjectType {
  COMPUTER = 'computer',
  DEVICE = 'device',
  DOCUMENT = 'document',
  KEY = 'key',
  FURNITURE = 'furniture',
  DECORATION = 'decoration'
}

// Type de vue de la salle
export enum RoomViewMode {
  NORMAL = '2d',
  DETAILED = 'detailed'
}