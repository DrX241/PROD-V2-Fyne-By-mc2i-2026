// Types pour le jeu CYBER ESCAPE v2.0

// Statut du jeu
export type GameStatus = 'initial' | 'running' | 'completed' | 'error';

// Type pour les objets de l'inventaire
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  usable: boolean;
  useTarget?: string[]; // Sur quels objets/cibles peut être utilisé
  consumed?: boolean; // Si l'objet est consommé lors de l'utilisation
}

// Type pour un PNJ (Personnage Non Joueur)
export interface NPC {
  id: string;
  name: string;
  description: string;
  dialogue: NPCDialogue;
  offerTimeBonus?: number; // Combien de temps le PNJ offre en échange
  requiresItem?: string; // Item requis pour interaction spéciale
}

// Type pour les dialogues des PNJ
export interface NPCDialogue {
  greeting: string;
  options: NPCDialogueOption[];
  followup?: Record<string, NPCDialogueOption[]>;
}

// Type pour les options de dialogue des PNJ
export interface NPCDialogueOption {
  id: string;
  text: string;
  response: string;
  nextDialogueId?: string;
  giveItem?: string;
  takeItem?: string;
  timeBonus?: number; // Bonus ou malus de temps
  timePenalty?: number;
}

// Type pour une salle
export interface Room {
  id: string;
  name: string;
  description: string;
  stage: number; // L'étape du jeu liée à cette salle (1-10)
  npcs: NPC[];
  exits: Exit[];
  items?: InventoryItem[];
  challenge?: Challenge;
  visited: boolean;
}

// Type pour une sortie de salle
export interface Exit {
  direction: 'nord' | 'sud' | 'est' | 'ouest';
  targetRoomId: string;
  locked?: boolean;
  keyId?: string; // Item requis pour déverrouiller
  description?: string;
}

// Types de défis possibles dans les salles
export type ChallengeType = 'email' | 'osint' | 'iam' | 'strategy' | 'crisis' | 'supply' | 'cloud' | 'exploit' | 'forensic' | 'quiz';

// Type pour un défi
export interface Challenge {
  type: ChallengeType;
  title: string;
  description: string;
  completed: boolean;
  reward?: string; // ID de l'objet obtenu en récompense
  timeBonus: number;
  timePenalty: number;
  // Propriétés spécifiques selon le type de défi
  emails?: Email[];
  options?: Option[];
  quizQuestions?: QuizQuestion[];
  codeTemplate?: string;
  logs?: string[];
  patches?: string[];
  badges?: Badge[];
}

// Type pour un email (défi de phishing)
export interface Email {
  id: string;
  sender: string;
  subject: string;
  content: string;
  isPhishing: boolean;
  flagged?: boolean;
}

// Type pour un badge (défi IAM)
export interface Badge {
  id: string;
  role: string;
  service: string;
  permissions: string[];
  isCorrect: boolean;
}

// Type pour une option (QCM, stratégie, etc.)
export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
  selected?: boolean;
}

// Type pour une question de quiz
export interface QuizQuestion {
  id: string;
  question: string;
  options: Option[];
  answered: boolean;
}

// Type pour l'état du jeu
export interface GameState {
  status: GameStatus;
  timeRemaining: number;
  currentStage: number;
  currentRoomId: string | null;
  currentRoom: Room | null;
  inventory: Record<string, InventoryItem>;
  rooms: Record<string, Room>;
  messages: string[];
  success: boolean;
  medal: 'or' | 'argent' | 'bronze' | 'aucune';
  quizScore: number;
  failReason?: string;
}

// Type pour les étapes du jeu
export enum GameStage {
  VESTIBULE = 1,
  MUR_REVELATIONS = 2,
  COULOIR_BADGES = 3,
  SALLE_STRATEX = 4,
  CENTRE_ALERTE = 5,
  CHAINE_FANTOME = 6,
  NUAGE_TROUE = 7,
  ZONE_ROOTLAB = 8,
  ATELIER_FORENSIC = 9,
  PORTE_SIGMA = 10
}

// Type pour les commandes
export type CommandType = 
  | 'aller' 
  | 'regarder'
  | 'parler'
  | 'utiliser'
  | 'déverrouiller'
  | 'answer'
  | 'inventaire'
  | 'flag'
  | 'rechercher'
  | 'scanner'
  | 'patch'
  | 'report';

// Type pour les résultats de commande
export interface CommandResult {
  success: boolean;
  message: string;
  timeBonus?: number;
  timePenalty?: number;
  giveItem?: string;
  removeItem?: string;
  unlockRoom?: string;
  completeChallenge?: boolean;
}

// Type pour les médailles
export type Medal = 'or' | 'argent' | 'bronze' | 'aucune';