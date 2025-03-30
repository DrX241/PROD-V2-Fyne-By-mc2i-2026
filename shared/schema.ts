import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Chat types for Azure OpenAI API
export type ChatCompletionRequestMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

// Document types
export interface Document {
  id: string;
  fileName: string;
  content: string;
  createdAt: Date;
  scenarioId: string;
}

// Insert schemas for documents
export const documentSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  content: z.string(),
  createdAt: z.date(),
  scenarioId: z.string()
});

// Types for the cybersecurity scenarios
export interface CyberDomain {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
}

export interface ScenarioContact {
  id: string;
  name: string;
  role: string;
  department: string; 
  email?: string;
  avatar?: string;
}

export interface CyberScenario {
  id: string;
  title: string;
  description: string;
  contacts: ScenarioContact[]; 
  primaryContact: string;      
  difficulty: 'Débutant' | 'Intermédiaire' | 'Expert';
  difficultyColor: string;
  domainId: string;
}

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
  contactId: string;  
  text: string;       
}

export interface ChatRoomContent {
  participants: ScenarioContact[];  
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
  sender?: ScenarioContact; 
}

export interface AIConfig {
  difficultyLevel: 'Débutant' | 'Intermédiaire' | 'Expert';
  responseStyle: 'Détaillé et pédagogique' | 'Professionnel' | 'Concis et direct';
  temperature: number;
  maxTokens: number;
}

export interface UserMetrics {
  reputation: number;      
  budget: number;          
  successRate: number;     
  responseQuality: number; 
  level: number;           
  completedScenarios: string[]; 
}

export interface ScenarioState {
  activeDomain?: CyberDomain;
  activeScenario?: CyberScenario;
  activeContacts?: ScenarioContact[];  
  currentContactId?: string;           
  metrics: UserMetrics;                
  chatRoomActive?: boolean;            
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
  sendMessageToContact: (message: string, contactId: string) => Promise<void>;
  sendMessageToChatRoom: (message: string) => Promise<void>;
  updateConfig: (config: Partial<AIConfig>) => void;
  updateMetrics: (metrics: Partial<UserMetrics>) => void;
  activateChatRoom: (participants: string[]) => void;
  deactivateChatRoom: () => void;
  resetChat: () => void;
}

export type ChatContextType = ChatContextState & ChatContextActions;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
