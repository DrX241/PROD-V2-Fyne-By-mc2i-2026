import { pgTable, serial, text, timestamp, json, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Table des utilisateurs
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).unique(),
  email: varchar('email', { length: 100 }).unique(),
  createdAt: timestamp('created_at').defaultNow()
});

// Table des sessions de chat mc2i AI Learning
export const mcaiSessions = pgTable('mcai_sessions', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 100 }).notNull(), // ID unique du client (stocké en localStorage)
  trigramme: varchar('trigramme', { length: 10 }),
  metier: varchar('metier', { length: 100 }),
  mode: varchar('mode', { length: 20 }), // 'classique' ou 'immersion'
  formation: varchar('formation', { length: 20 }), // 'interne' ou 'externe'
  formationChoisie: varchar('formation_choisie', { length: 100 }),
  stageActuel: varchar('stage_actuel', { length: 50 }), // 'introduction', 'choix_mode', etc.
  scenarioActuel: serial('scenario_actuel').default(0),
  lastInteraction: timestamp('last_interaction').defaultNow(),
  conversationContext: json('conversation_context').$type<any[]>().default([]),
  createdAt: timestamp('created_at').defaultNow()
});

// Table des messages de chat
export const mcaiMessages = pgTable('mcai_messages', {
  id: serial('id').primaryKey(),
  sessionId: serial('session_id').references(() => mcaiSessions.id),
  role: varchar('role', { length: 20 }).notNull(), // 'user' ou 'assistant'
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow()
});

// Types pour l'insertion
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertMcaiSessionSchema = createInsertSchema(mcaiSessions).omit({ id: true, createdAt: true, lastInteraction: true });
export const insertMcaiMessageSchema = createInsertSchema(mcaiMessages).omit({ id: true, timestamp: true });

// Types pour la sélection
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type McaiSession = typeof mcaiSessions.$inferSelect;
export type InsertMcaiSession = z.infer<typeof insertMcaiSessionSchema>;

export type McaiMessage = typeof mcaiMessages.$inferSelect;
export type InsertMcaiMessage = z.infer<typeof insertMcaiMessageSchema>;