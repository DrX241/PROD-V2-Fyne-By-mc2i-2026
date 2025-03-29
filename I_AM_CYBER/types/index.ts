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
  name: string;
  role: string;
}

export interface CyberScenario {
  id: string;
  title: string;
  description: string;
  contact: ScenarioContact;
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

export type MessageType = 'user' | 'bot' | 'email' | 'domain-selection' | 'scenario-selection';

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string | EmailMessageContent;
  timestamp: number;
}

// Configuration Types
export interface AIConfig {
  difficultyLevel: 'Débutant' | 'Intermédiaire' | 'Expert';
  responseStyle: 'Détaillé et pédagogique' | 'Professionnel' | 'Concis et direct';
  temperature: number;
  maxTokens: number;
}

export interface ScenarioState {
  activeDomain?: CyberDomain;
  activeScenario?: CyberScenario;
  contact?: ScenarioContact;
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
  updateConfig: (config: Partial<AIConfig>) => void;
  resetChat: () => void;
}

export type ChatContextType = ChatContextState & ChatContextActions;
