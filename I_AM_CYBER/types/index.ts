// Domain Types
export interface CyberDomain {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
}

// Scenario Types
export interface ScenarioContact {
  id: string;
  name: string;
  role: string;
  department: string; // Département ou tag de spécialité (BFA, Data, IA, etc.)
  email?: string;
  avatar?: string;
}

export interface CyberScenario {
  id: string;
  title: string;
  description: string;
  contacts: ScenarioContact[]; // Plusieurs interlocuteurs possibles
  primaryContact: string;      // ID du contact principal qui initie le scénario
  difficulty: 'Débutant' | 'Intermédiaire' | 'Expert';
  difficultyColor: string;
  domainId: string;
}

// Message Types
export interface Attachment {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  content?: string;
}

export interface EmailMessageContent {
  id: string;
  from: ScenarioContact;
  to: string;
  subject: string;
  date: string;
  body: string;
  attachments: Attachment[];
}

export type MessageType = 'user' | 'bot' | 'npc' | 'email' | 'domain-selection' | 'scenario-selection' | 'chat-room';

export interface NpcMessageContent {
  contactId: string;  // ID du contact qui parle
  text: string;       // Contenu du message
}

export interface ChatRoomContent {
  participants: ScenarioContact[];  // Participants dans la salle de discussion
  messages: {
    contactId: string;
    text: string;
    timestamp: number;
  }[];
}

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string | EmailMessageContent | NpcMessageContent | ChatRoomContent;
  timestamp: number;
  sender?: ScenarioContact; // Pour les messages de type NPC
}

// Configuration Types
export interface AIConfig {
  difficultyLevel: 'Débutant' | 'Intermédiaire' | 'Expert';
  responseStyle: 'Détaillé et pédagogique' | 'Professionnel' | 'Concis et direct';
  temperature: number;
  maxTokens: number;
}

export interface UserMetrics {
  reputation: number;      // Réputation du joueur (0-100)
  budget: number;          // Budget disponible pour les actions
  successRate: number;     // Taux de réussite des défis (0-100)
  responseQuality: number; // Qualité moyenne des réponses (0-100)
  level: number;           // Niveau du joueur
  completedScenarios: string[]; // IDs des scénarios complétés
}

export interface ScenarioState {
  activeDomain?: CyberDomain;
  activeScenario?: CyberScenario;
  activeContacts?: ScenarioContact[];  // Tous les contacts actifs dans le scénario
  currentContactId?: string;           // ID du contact actuel
  metrics: UserMetrics;                // Métriques de l'utilisateur
  chatRoomActive?: boolean;            // Si une salle de discussion est active
}

// Chat Context Types
export interface ChatContextState {
  messages: ChatMessage[];
  userName: string;
  isTyping: boolean;
  scenario: ScenarioState;
  config: AIConfig;
  domains: CyberDomain[];
  scenarios: CyberScenario[];
}

export interface ChatContextActions {
  setUserName: (name: string) => void;
  selectDomain: (domainId: string) => void;
  selectScenario: (scenarioId: string) => void;
  sendMessage: (message: string) => Promise<void>;
  sendMessageToContact: (message: string, contactId: string) => Promise<void>;
  sendMessageToChatRoom: (message: string) => Promise<void>;
  updateConfig: (config: Partial<AIConfig>) => void;
  updateMetrics: (metrics: Partial<UserMetrics>) => void;
  activateChatRoom: (participants: string[]) => void;
  deactivateChatRoom: () => void;
  resetChat: () => void;
}

export type ChatContextType = ChatContextState & ChatContextActions;
