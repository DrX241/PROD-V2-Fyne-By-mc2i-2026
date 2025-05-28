import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, uuid, foreignKey, pgEnum, index } from "drizzle-orm/pg-core";
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

// Enumération pour les niveaux d'accès de partage
export const shareAccessEnum = pgEnum('share_access', [
  'private',    // Accès uniquement au propriétaire
  'readOnly',   // Partageable sans modification
  'editable'    // Collaboration complète
]);

// Enumération pour les niveaux de difficulté des modules
export const difficultyLevelEnum = pgEnum('difficulty_level', [
  'beginner',   // Débutant
  'intermediate', // Intermédiaire
  'advanced'    // Avancé
]);

// Enumération pour les styles d'apprentissage
export const learningStyleEnum = pgEnum('learning_style', [
  'reading',    // Contenu théorique
  'interactive', // Exercices pratiques
  'mixed'       // Théorie + pratique
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

// Table pour stocker les modules personnalisés générés
export const customModules = pgTable('custom_modules', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  userName: varchar('user_name', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  domain: varchar('domain', { length: 100 }).notNull(),
  description: text('description').notNull(),
  iamName: varchar('iam_name', { length: 255 }).notNull(), // Format "I AM XXX"
  displayOrder: integer('display_order').default(100), // Pour l'ordre d'affichage
  difficulty: difficultyLevelEnum('difficulty').default('intermediate'),
  topics: text('topics').array().notNull(),
  gamificationLevel: gamificationLevelEnum('gamification_level').default('leger'),
  learningStyle: learningStyleEnum('learning_style').default('mixed'),
  includeTrainerModule: boolean('include_trainer_module').default(true),
  includeOpsModule: boolean('include_ops_module').default(true),
  includeTestModule: boolean('include_test_module').default(true),
  includeAscensionModule: boolean('include_ascension_module').default(true),
  // Les structures des modules dans le format généré par OpenAI
  moduleData: jsonb('module_data').notNull(),
  iconPath: text('icon_path').default('/assets/icons/default-module.svg'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const insertUserLearningProgressSchema = createInsertSchema(userLearningProgress).omit({ id: true });
export type InsertUserLearningProgress = z.infer<typeof insertUserLearningProgressSchema>;
export type UserLearningProgress = typeof userLearningProgress.$inferSelect;

export const insertInvestigationProgressSchema = createInsertSchema(investigationProgress).omit({ id: true });
export type InsertInvestigationProgress = z.infer<typeof insertInvestigationProgressSchema>;
export type InvestigationProgress = typeof investigationProgress.$inferSelect;

// Table utilisateurs avec authentification
export const users = pgTable("users", {
  id: serial("id").primaryKey().notNull(), // ID numérique auto-incrémenté
  username: varchar("username", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }), // Mot de passe hashé
  email: varchar("email", { length: 255 }).unique(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  bio: text("bio"),
  profileImageUrl: varchar("profile_image_url", { length: 255 }),
  role: varchar("role", { length: 50 }).default("user").notNull(), // 'user' ou 'admin'
  isActive: boolean("is_active").default(true).notNull(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
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
  // Nouveaux champs pour le partage
  shareAccess: shareAccessEnum('share_access').default('private'),
  shareLink: text('share_link'),
  shareLinkExpiration: timestamp('share_link_expiration'),
  ownerDisplayName: text('owner_display_name'),
  // Nouveaux champs pour la personnalisation et la marque blanche
  isTemplate: boolean('is_template').default(false),
  brandingSettings: jsonb('branding_settings').default({
    primaryColor: '#3b82f6',
    logoUrl: null,
    fontFamily: null,
    customCss: null
  }),
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

// Liste des domaines et personnalités disponibles pour validation
export const VALID_DOMAINS = ['cybersecurite', 'gestion_projet', 'amoa', 'developpement', 'data_ia', 'conseil', 'general'] as const;
export const VALID_PERSONALITIES = ['professionnel', 'amical', 'direct', 'expert', 'pédagogique', 'mentor'] as const;
export const VALID_GAMIFICATION_LEVELS = ['aucun', 'leger', 'modere', 'eleve', 'intense'] as const;
export const VALID_AVATAR_STYLES = ['robot', 'human', 'abstract', 'animal', 'professional'] as const;
export const VALID_AVATAR_COLORS = ['blue', 'green', 'red', 'purple', 'orange', 'teal', 'pink', 'violet', 'gray'] as const;
export const VALID_SHARE_ACCESS = ['private', 'readOnly', 'editable'] as const;
export const VALID_DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export const VALID_LEARNING_STYLES = ['reading', 'interactive', 'mixed'] as const;

// Création des schémas d'insertion avec Zod et validation améliorée
export const insertUserProfileSchema = createInsertSchema(userProfiles)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    email: z.string().email().optional(),
    displayName: z.string().min(2).max(50).optional(),
  });

export const insertCustomAssistantSchema = createInsertSchema(customAssistants)
  .omit({ id: true, createdAt: true, updatedAt: true, usageCount: true, rating: true })
  .extend({
    name: z.string().min(3).max(50).refine(name => name.trim().length > 0, {
      message: "Le nom de l'assistant ne peut pas être vide"
    }),
    domain: z.enum(VALID_DOMAINS),
    personality: z.enum(VALID_PERSONALITIES),
    gamificationLevel: z.enum(VALID_GAMIFICATION_LEVELS).optional(),
    description: z.string().max(500).optional(),
    expertise: z.array(z.string().min(2).max(50)).max(5).optional(),
    avatarStyle: z.enum(VALID_AVATAR_STYLES).optional(),
    avatarColor: z.enum(VALID_AVATAR_COLORS).optional(),
    systemPrompt: z.string().min(10).optional(), // Optionnel car généré automatiquement
    customInstructions: z.record(z.unknown()).optional()
  });

export const insertAssistantConversationSchema = createInsertSchema(assistantConversations)
  .omit({ id: true, createdAt: true, updatedAt: true, lastMessageAt: true })
  .extend({
    title: z.string().min(2).max(100).optional().default('Nouvelle conversation'),
    messages: z.array(
      z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string()
      })
    ).optional().default([])
  });

export const insertAssistantTemplateSchema = createInsertSchema(assistantTemplates)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    name: z.string().min(3).max(50),
    category: z.string().min(2).max(50),
    domain: z.enum(VALID_DOMAINS),
    personality: z.enum(VALID_PERSONALITIES),
    systemPrompt: z.string().min(50),
  });

// Schéma pour les modules personnalisés
export const insertCustomModuleSchema = createInsertSchema(customModules)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    name: z.string().min(3).max(100).refine(name => name.trim().length > 0, {
      message: "Le nom du module ne peut pas être vide"
    }),
    domain: z.string().min(2).max(50),
    description: z.string().min(10),
    iamName: z.string().min(5).max(100),
    difficulty: z.enum(VALID_DIFFICULTY_LEVELS),
    topics: z.array(z.string()).min(1),
    gamificationLevel: z.enum(VALID_GAMIFICATION_LEVELS),
    learningStyle: z.enum(VALID_LEARNING_STYLES),
    moduleData: z.record(z.unknown()),
  });

// Types d'insertion
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertCustomAssistant = z.infer<typeof insertCustomAssistantSchema>;
export type InsertAssistantConversation = z.infer<typeof insertAssistantConversationSchema>;
export type InsertAssistantTemplate = z.infer<typeof insertAssistantTemplateSchema>;
export type InsertCustomModule = z.infer<typeof insertCustomModuleSchema>;

// Types de sélection
export type UserProfile = typeof userProfiles.$inferSelect;
export type CustomAssistant = typeof customAssistants.$inferSelect;
export type AssistantConversation = typeof assistantConversations.$inferSelect;
export type AssistantTemplate = typeof assistantTemplates.$inferSelect;
export type CustomModule = typeof customModules.$inferSelect;

// Table des sessions pour l'authentification
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
