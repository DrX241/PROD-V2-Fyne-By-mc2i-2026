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

export const insertUserLearningProgressSchema = createInsertSchema(userLearningProgress).omit({ id: true });
export type InsertUserLearningProgress = z.infer<typeof insertUserLearningProgressSchema>;
export type UserLearningProgress = typeof userLearningProgress.$inferSelect;

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
