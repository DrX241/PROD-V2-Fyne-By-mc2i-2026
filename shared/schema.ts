import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Définition des tables pour les progressions des utilisateurs dans les modules d'apprentissage
export const userLearningProgress = pgTable('user_learning_progress', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  userName: varchar('user_name', { length: 255 }).notNull(),
  moduleId: varchar('module_id', { length: 255 }).notNull(),
  xp: integer('xp').notNull().default(0),
  level: integer('level').notNull().default(1),
  completedLevels: text('completed_levels').array().notNull().default([]),
  badges: jsonb('badges').notNull().default([]),
  stats: jsonb('stats').notNull().default([]),
  rank: varchar('rank', { length: 100 }).notNull().default('Débutant'),
  lastUpdated: timestamp('last_updated').notNull().defaultNow()
});

// Table pour stocker les scores et la progression des jeux d'investigation
export const investigationProgress = pgTable('investigation_progress', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  userName: varchar('user_name', { length: 255 }).notNull(),
  gameId: varchar('game_id', { length: 255 }).notNull(), // Ex: 'data-leak', 'malware-analysis', etc.
  currentLevel: varchar('current_level', { length: 100 }).notNull().default('Débutant'), // Débutant, Intermédiaire, Expert
  score: integer('score').notNull().default(0),
  bestScore: integer('best_score').notNull().default(0),
  completedScenarios: jsonb('completed_scenarios').notNull().default([]),
  attempts: integer('attempts').notNull().default(0),
  lastFeedback: jsonb('last_feedback').notNull().default({}),
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
  sessionId: varchar('session_id', { length: 255 }).notNull() // Pour tracking par session
});

export const insertUserLearningProgressSchema = createInsertSchema(userLearningProgress).omit({ id: true });
export type InsertUserLearningProgress = z.infer<typeof insertUserLearningProgressSchema>;
export type UserLearningProgress = typeof userLearningProgress.$inferSelect;

export const insertInvestigationProgressSchema = createInsertSchema(investigationProgress).omit({ id: true });
export type InsertInvestigationProgress = z.infer<typeof insertInvestigationProgressSchema>;
export type InvestigationProgress = typeof investigationProgress.$inferSelect;

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

// Les définitions de documents ont été supprimées car nous n'utilisons plus de pièces jointes

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
