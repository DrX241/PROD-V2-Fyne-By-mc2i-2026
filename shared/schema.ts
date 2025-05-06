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

// Enumération pour les niveaux d'accès de partage
export const shareAccessEnum = pgEnum('share_access', [
  'private',    // Accès uniquement au propriétaire
  'readOnly',   // Partageable sans modification
  'editable'    // Collaboration complète
]);

// Enumération pour les rôles utilisateur dans le système
export const userRoleEnum = pgEnum('user_role', [
  'user',         // Utilisateur standard
  'tester',       // Testeur avec accès temporaire
  'contributor',  // Contributeur avec permissions étendues
  'admin'         // Administrateur système
]);

// Enumération pour le statut des accès temporaires
export const temporaryAccessStatusEnum = pgEnum('temporary_access_status', [
  'active',       // Accès actif
  'expired',      // Accès expiré
  'revoked'       // Accès révoqué par un administrateur
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
  role: userRoleEnum('role').default('user'),
  jobTitle: varchar('job_title', { length: 255 }),
  department: varchar('department', { length: 255 }),
  preferences: jsonb('preferences').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Table des modules disponibles dans l'application
export const applicationModules = pgTable('application_modules', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(),
  path: varchar('path', { length: 255 }).notNull().unique(),
  icon: varchar('icon', { length: 100 }),
  isPublic: boolean('is_public').default(false),
  requiredRole: userRoleEnum('required_role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Table des invitations temporaires
export const temporaryAccesses = pgTable('temporary_accesses', {
  id: serial('id').primaryKey(),
  invitationCode: uuid('invitation_code').notNull().unique().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('tester'),
  status: temporaryAccessStatusEnum('status').default('active'),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  lastLogin: timestamp('last_login'),
  accessCount: integer('access_count').default(0),
  notes: text('notes')
});

// Table de jointure pour les modules accessibles par un accès temporaire
export const temporaryAccessModules = pgTable('temporary_access_modules', {
  id: serial('id').primaryKey(),
  temporaryAccessId: integer('temporary_access_id').references(() => temporaryAccesses.id).notNull(),
  moduleId: integer('module_id').references(() => applicationModules.id).notNull(),
  createdAt: timestamp('created_at').defaultNow()
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
export const VALID_USER_ROLES = ['user', 'tester', 'contributor', 'admin'] as const;
export const VALID_TEMPORARY_ACCESS_STATUS = ['active', 'expired', 'revoked'] as const;

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

// Schémas d'insertion pour les nouveaux modèles
export const insertApplicationModuleSchema = createInsertSchema(applicationModules)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    name: z.string().min(3).max(50),
    displayName: z.string().min(3).max(100),
    category: z.string().min(2).max(50),
    path: z.string().min(1).max(255),
    requiredRole: z.enum(VALID_USER_ROLES).optional(),
    isPublic: z.boolean().optional(),
    description: z.string().max(500).optional(),
    icon: z.string().max(100).optional()
  });

export const insertTemporaryAccessSchema = createInsertSchema(temporaryAccesses)
  .omit({ id: true, invitationCode: true, createdAt: true, lastLogin: true, accessCount: true })
  .extend({
    email: z.string().email(),
    role: z.enum(VALID_USER_ROLES).optional(),
    status: z.enum(VALID_TEMPORARY_ACCESS_STATUS).optional(),
    expiresAt: z.date(),
    notes: z.string().max(500).optional()
  });

export const insertTemporaryAccessModuleSchema = createInsertSchema(temporaryAccessModules)
  .omit({ id: true, createdAt: true });

// Types d'insertion
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertCustomAssistant = z.infer<typeof insertCustomAssistantSchema>;
export type InsertAssistantConversation = z.infer<typeof insertAssistantConversationSchema>;
export type InsertAssistantTemplate = z.infer<typeof insertAssistantTemplateSchema>;
export type InsertApplicationModule = z.infer<typeof insertApplicationModuleSchema>;
export type InsertTemporaryAccess = z.infer<typeof insertTemporaryAccessSchema>;
export type InsertTemporaryAccessModule = z.infer<typeof insertTemporaryAccessModuleSchema>;

// Types de sélection
export type UserProfile = typeof userProfiles.$inferSelect;
export type CustomAssistant = typeof customAssistants.$inferSelect;
export type AssistantConversation = typeof assistantConversations.$inferSelect;
export type AssistantTemplate = typeof assistantTemplates.$inferSelect;
export type ApplicationModule = typeof applicationModules.$inferSelect;
export type TemporaryAccess = typeof temporaryAccesses.$inferSelect;
export type TemporaryAccessModule = typeof temporaryAccessModules.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
