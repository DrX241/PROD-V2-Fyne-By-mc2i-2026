// Type definitions for Cyber module

export interface CyberDomain {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
}

export interface ScenarioContact {
  name: string;
  role: string;
  expertise?: string;
  concern?: string;
}

export interface CyberScenario {
  id: string;
  title: string;
  description: string;
  contact: ScenarioContact;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Expert';
  difficultyColor: string;
  domainId: string;
  domain?: string; // Ajouté pour la compatibilité avec les routes
}

export interface EmailMessageContent {
  id: string;
  from: ScenarioContact;
  to: string;
  subject: string;
  date: string;
  body: string;
  scenarioContacts?: ScenarioContact[]; // Liste des interlocuteurs du scénario
}

export type MessageType = 'user' | 'bot' | 'email' | 'domain-selection' | 'scenario-selection';

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string | EmailMessageContent;
  timestamp: number;
  contactName?: string; // Nom de l'interlocuteur pour les messages bot
  contactRole?: string; // Rôle de l'interlocuteur pour les messages bot
}

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
  scenarioContacts?: ScenarioContact[]; // Liste des interlocuteurs du scénario
}

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

// Type pour les requêtes ChatGPT
export type ChatCompletionRequestMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};