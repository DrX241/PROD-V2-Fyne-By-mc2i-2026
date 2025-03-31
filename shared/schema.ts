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

// Types pour la gestion de crise
export interface CrisisTimeInfo {
  elapsedTime?: string;    // Temps écoulé depuis le début de crise
  deadlines?: string[];    // Échéances critiques à venir
  pressureLevel?: 'low' | 'medium' | 'high' | 'critical'; // Niveau de pression temporelle
}

export interface CrisisMediaInfo {
  currentTone?: 'neutral' | 'concerned' | 'critical' | 'hostile'; // Ton médiatique actuel
  publicPerception?: number;  // De 0 (désastreux) à 100 (excellent)
  pendingRequests?: string[]; // Demandes médias en attente
}

export interface CrisisTeamInfo {
  stressLevel?: 'normal' | 'elevated' | 'high' | 'burnout'; // Niveau de stress des équipes
  availableExperts?: string[]; // Experts disponibles
  teamRotation?: boolean;      // Rotation d'équipe nécessaire
}

export interface CrisisInfo {
  timeInfo?: CrisisTimeInfo;
  mediaInfo?: CrisisMediaInfo;
  teamInfo?: CrisisTeamInfo;
  activePhase?: 'detection' | 'analyse' | 'confinement' | 'eradication' | 'retablissement' | 'retour';
}

export type MessageType = 'user' | 'bot' | 'email' | 'domain-selection' | 'scenario-selection';

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string | any; // Contenu du message, peut être un email ou autre
  timestamp: number;
  contactName?: string;
  contactRole?: string;
}

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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
