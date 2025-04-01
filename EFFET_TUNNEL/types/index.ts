// Types pour le module EFFET TUNNEL

// Niveaux d'expertise disponibles
export type ExpertiseLevel = 'Débutant' | 'Intermédiaire' | 'Expert';

// Rôles professionnels que l'utilisateur peut incarner
export type ProfessionalRole = 
  | 'RSSI' 
  | 'DSI' 
  | 'Administrateur Systèmes' 
  | 'Administrateur Réseau'
  | 'Analyste SOC'
  | 'Chef de Projet IT'
  | 'DPO'
  | 'Juriste'
  | 'Directeur Communication'
  | 'Responsable RH';

// Secteurs d'activité
export type BusinessSector =
  | 'Banque/Finance'
  | 'Santé'
  | 'Industrie'
  | 'Administration Publique'
  | 'Energie'
  | 'Retail/E-commerce'
  | 'Transport/Logistique'
  | 'Education'
  | 'Services'
  | 'Télécommunication';

// Options pour les choix utilisateur
export interface DecisionOption {
  id: string;
  text: string;
  description: string; // Description plus détaillée de l'option
  complexity: number; // Niveau de complexité de l'option (1-3)
  appropriateRoles?: ProfessionalRole[]; // Rôles pour lesquels cette option est particulièrement pertinente
}

// Expert/PNJ disponible pour l'interaction
export interface TunnelExpert {
  name: string;
  role: string;
  expertise: string;
  background?: string; // Information supplémentaire sur l'expert
}

// Situation dans l'arbre de décision
export interface TunnelSituation {
  id: string;
  title: string;
  description: string; // Description de la situation actuelle
  options: DecisionOption[]; // Options disponibles pour cette situation
  expertName: string; // Nom de l'expert qui présente cette situation
  expertRole: string; // Rôle de l'expert
  tutorialContent?: string; // Contenu pédagogique optionnel lié à cette situation
  nextSituationIds?: Record<string, string>; // Mapping des options vers les situations suivantes
  isFinal?: boolean; // Indique si c'est une situation finale (conclusion)
  experts?: TunnelExpert[]; // Liste des experts disponibles pour discuter pendant cette situation
}

// Scénario complet
export interface TunnelScenario {
  id: string;
  title: string;
  description: string;
  difficulty: ExpertiseLevel;
  relevantSectors: BusinessSector[];
  situations: TunnelSituation[]; // Toutes les situations possibles dans ce scénario
  initialSituationId: string; // ID de la situation de départ
  experts?: TunnelExpert[]; // Liste des experts disponibles pour ce scénario
}

// État de la session utilisateur
export interface TunnelSessionState {
  selectedRole: ProfessionalRole;
  selectedLevel: ExpertiseLevel;
  selectedSector: BusinessSector;
  currentScenario?: TunnelScenario;
  currentSituation?: TunnelSituation;
  decisionPath: string[]; // Liste des IDs des situations déjà traversées
  decisionsMade: Record<string, string>; // Mapping situation ID -> option ID choisie
}

// Message dans la conversation
export type TunnelMessageType = 'situation' | 'user-choice' | 'tutorial' | 'expert' | 'system' | 'user-chat' | 'expert-chat';

export interface TunnelMessage {
  id: string;
  type: TunnelMessageType;
  content: string | DecisionOption | TunnelSituation;
  timestamp: number;
  expertName?: string;
  expertRole?: string;
}

// Contexte global pour le module Effet Tunnel
export interface TunnelContextState {
  session: TunnelSessionState;
  messages: TunnelMessage[];
  scenarios: TunnelScenario[];
  isLoading: boolean;
  error?: string;
  currentExpert?: TunnelExpert; // Expert actuellement sélectionné pour le chat
  isChatMode: boolean; // Indique si l'interface est en mode chat ou en mode décision
}

export interface TunnelContextActions {
  initializeSession: (role: ProfessionalRole, level: ExpertiseLevel, sector: BusinessSector) => void;
  selectScenario: (scenarioId: string) => void;
  makeDecision: (optionId: string) => void;
  restartScenario: () => void;
  resetSession: () => void;
  toggleChatMode: () => void; // Basculer entre le mode chat et le mode décision
  selectExpert: (expertName: string) => void; // Sélectionner un expert pour discuter
  sendChatMessage: (message: string) => Promise<void>; // Envoyer un message à l'expert sélectionné
}

export type TunnelContextType = TunnelContextState & TunnelContextActions;