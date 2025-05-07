/**
 * Enumération des étapes du jeu CYBER ESCAPE v2.0
 * Ces valeurs correspondent aux différentes salles/niveaux que le joueur doit traverser
 */
export enum GameStage {
  // Étape 0 - Début du jeu
  INITIAL = 0,
  
  // Étape 1 - Sensibilisation au phishing
  VESTIBULE = 1,
  
  // Étape 2 - Recherche OSINT
  MUR_REVELATIONS = 2,
  
  // Étape 3 - Badges et contrôle d'accès
  COULOIR_BADGES = 3,
  
  // Étape 4 - Analyse de vulnérabilités
  LABO_ANALYSE = 4,
  
  // Étape 5 - Détection d'intrusion
  SALLE_MONITORING = 5,
  
  // Étape 6 - Cryptographie
  CRYPTEX = 6,
  
  // Étape 7 - Sécurité réseau
  QUARTIER_RESEAU = 7,
  
  // Étape 8 - Forensic
  FORENSIC_LAB = 8,
  
  // Étape 9 - Centre de crise
  CENTRE_DEFENSE = 9,
  
  // Étape 10 - Zone finale
  PORTE_SIGMA = 10
}

/**
 * Enumération des types de défis possibles dans le jeu
 */
export enum ChallengeType {
  QCM = 'qcm',
  CODE = 'code',
  PUZZLE = 'puzzle',
  PHISHING = 'phishing',
  CRYPTO = 'crypto',
  FORENSIC = 'forensic',
  NETWORK = 'network'
}

/**
 * Enumération des types de médailles attribuables au joueur
 */
export enum MedalType {
  OR = 'or',
  ARGENT = 'argent',
  BRONZE = 'bronze',
  AUCUNE = 'aucune'
}

/**
 * Enumération des statuts possibles du jeu
 */
export enum GameStatus {
  INITIAL = 'initial',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Enumération des états possibles d'un objet interactif
 */
export enum ObjectState {
  DEFAULT = 'default',
  ACTIVE = 'active',
  DISABLED = 'disabled'
}

/**
 * Enumération des directions possibles pour les sorties
 */
export enum Direction {
  NORTH = 'north',
  SOUTH = 'south',
  EAST = 'east',
  WEST = 'west'
}

/**
 * Enumération des statuts possibles pour une sortie
 */
export enum ExitStatus {
  OPEN = 'open',
  LOCKED = 'locked',
  HIDDEN = 'hidden'
}