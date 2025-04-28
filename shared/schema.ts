import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
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

// I AM CYBER - Types pour le module CYBER AGENT
export type ExpertiseLevel = 'Débutant' | 'Intermédiaire' | 'Expert';

export type UserRole = {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
};

export interface CyberContact {
  name: string;
  role: string;
  description?: string;
  imageUrl?: string;
}

export interface EmailMessage {
  id: string;
  from: CyberContact;
  to: string;
  subject: string;
  date: string;
  body: string;
}

export interface ChatConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  contact?: CyberContact; // Pour les messages de l'assistant avec un interlocuteur spécifique
  timestamp: Date;
}

export interface CyberAgentSession {
  sessionId: string;
  userId: string;
  userName: string;
  expertiseLevel: ExpertiseLevel;
  userRole: string;
  userPresentation?: string;
  messages: ChatConversationMessage[];
  currentPhase: 'initial' | 'introduction' | 'scenario' | 'interaction' | 'pause' | 'evaluation' | 'complete';
  currentContact?: CyberContact;
  startTime: number;
  lastInteractionTime?: number;
}

export interface CyberAgentEvaluation {
  overallScore: number;
  strengths: string[];
  areasToImprove: string[];
  keyLearnings: string[];
  acquiredSkills: string[];
  recommendations: string[];
}

// Les définitions de documents ont été supprimées car nous n'utilisons plus de pièces jointes

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
