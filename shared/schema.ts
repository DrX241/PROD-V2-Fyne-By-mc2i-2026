import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, uuid, foreignKey, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enumération pour les types de personnalité des assistants
export const assistantPersonalityEnum = pgEnum('assistant_personality', [
  'professionnel', 'amical', 'direct', 'expert', 'pédagogique', 'mentor'
]);

// Enumération pour les domaines d'expertise des assistants
export const assistantDomainEnum = pgEnum('assistant_domain', [
  'cybersecurite', 'gestion_projet', 'amoa', 'developpement', 'data_ia', 'conseil', 'general'
]);

// Enumération pour le niveau de gamification des assistants
export const gamificationLevelEnum = pgEnum('gamification_level', [
  'aucun', 'leger', 'modere', 'eleve', 'intense'
]);

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
  sessionId: varchar('session_id', { length: 255 }).notNull(), // Pour tracking par session
  notes: text('notes').default(''), // Notes prises par l'utilisateur
  evaluationData: jsonb('evaluation_data').default(null), // Données d'évaluation par l'IA
  lastPlayed: timestamp('last_played').defaultNow() // Date de dernière partie
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
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
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

// Table des profils utilisateurs (étendue par rapport à la table users)
export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  displayName: varchar('display_name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  avatarUrl: text('avatar_url'),
  role: varchar('role', { length: 100 }).default('utilisateur'),
  jobTitle: varchar('job_title', { length: 255 }),
  department: varchar('department', { length: 255 }),
  preferences: jsonb('preferences').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Table des assistants IA personnalisés
export const customAssistants = pgTable('custom_assistants', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  systemPrompt: text('system_prompt').notNull(),
  personality: assistantPersonalityEnum('personality').notNull(),
  domain: assistantDomainEnum('domain').notNull(),
  expertise: text('expertise').array(),
  avatarStyle: varchar('avatar_style', { length: 100 }).default('robot'),
  avatarColor: varchar('avatar_color', { length: 50 }).default('violet'),
  gamificationLevel: gamificationLevelEnum('gamification_level').default('leger'),
  customInstructions: jsonb('custom_instructions').default({}),
  isPublic: boolean('is_public').default(false),
  isVerified: boolean('is_verified').default(false),
  usageCount: integer('usage_count').default(0),
  rating: integer('rating').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Table pour stocker les conversations avec les assistants personnalisés
export const assistantConversations = pgTable('assistant_conversations', {
  id: serial('id').primaryKey(),
  assistantId: integer('assistant_id').references(() => customAssistants.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).default('Nouvelle conversation'),
  messages: jsonb('messages').default([]),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastMessageAt: timestamp('last_message_at').defaultNow()
});

// Table pour stocker les modèles prédéfinis d'assistants
export const assistantTemplates = pgTable('assistant_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(),
  systemPrompt: text('system_prompt').notNull(),
  personality: assistantPersonalityEnum('personality').notNull(),
  domain: assistantDomainEnum('domain').notNull(),
  expertise: text('expertise').array(),
  avatarStyle: varchar('avatar_style', { length: 100 }).default('robot'),
  avatarColor: varchar('avatar_color', { length: 50 }).default('violet'),
  gamificationLevel: gamificationLevelEnum('gamification_level').default('leger'),
  customInstructions: jsonb('custom_instructions').default({}),
  isOfficial: boolean('is_official').default(true),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Création des schémas d'insertion avec Zod
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCustomAssistantSchema = createInsertSchema(customAssistants).omit({ id: true, createdAt: true, updatedAt: true, usageCount: true, rating: true });
export const insertAssistantConversationSchema = createInsertSchema(assistantConversations).omit({ id: true, createdAt: true, updatedAt: true, lastMessageAt: true });
export const insertAssistantTemplateSchema = createInsertSchema(assistantTemplates).omit({ id: true, createdAt: true, updatedAt: true });

// Types d'insertion
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertCustomAssistant = z.infer<typeof insertCustomAssistantSchema>;
export type InsertAssistantConversation = z.infer<typeof insertAssistantConversationSchema>;
export type InsertAssistantTemplate = z.infer<typeof insertAssistantTemplateSchema>;

// Types de sélection
export type UserProfile = typeof userProfiles.$inferSelect;
export type CustomAssistant = typeof customAssistants.$inferSelect;
export type AssistantConversation = typeof assistantConversations.$inferSelect;
export type AssistantTemplate = typeof assistantTemplates.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
