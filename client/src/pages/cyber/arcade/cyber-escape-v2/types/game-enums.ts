// Énumérations pour les états et types du jeu

// Statut du jeu
export enum GameStatus {
  INITIALIZING = 'initializing',
  PLAYING = 'playing',
  PAUSED = 'paused',
  CHALLENGE_ACTIVE = 'challenge_active',
  GAME_OVER = 'game_over',
  VICTORY = 'victory'
}

// Types d'actions du jeu
export enum GameActionType {
  MOVE = 'MOVE',
  INTERACT = 'INTERACT',
  COLLECT_ITEM = 'COLLECT_ITEM',
  START_CHALLENGE = 'START_CHALLENGE',
  COMPLETE_CHALLENGE = 'COMPLETE_CHALLENGE'
}

// États des objets
export enum ObjectState {
  NORMAL = 'normal',
  INTERACTIVE = 'interactive',
  HIGHLIGHTED = 'highlighted',
  DISABLED = 'disabled'
}

// États des sorties
export enum ExitStatus {
  OPEN = 'open',
  LOCKED = 'locked',
  HIDDEN = 'hidden'
}

// Types d'objets
export enum ObjectType {
  COMPUTER = 'computer',
  DOCUMENT = 'document',
  KEY = 'key',
  TOOL = 'tool',
  GENERIC = 'generic'
}

// Types de défis
export enum ChallengeType {
  PHISHING = 'phishing',
  FIREWALL = 'firewall',
  MALWARE = 'malware',
  PASSWORD = 'password',
  FORENSIC = 'forensic',
  SOCIAL_ENGINEERING = 'social_engineering'
}