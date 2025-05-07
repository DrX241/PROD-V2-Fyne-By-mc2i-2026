import { pgTable, serial, text, integer, timestamp, boolean, json, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enumérations
export const missionTypeEnum = pgEnum('mission_type', ['main_story', 'side_quest', 'daily', 'investigation', 'emergency', 'training']);
export const missionDifficultyEnum = pgEnum('mission_difficulty', ['trainee', 'junior', 'intermediate', 'senior', 'expert', 'master']);
export const environmentTypeEnum = pgEnum('environment_type', ['headquarters', 'city', 'corporate', 'datacenter', 'blackmarket', 'darkweb']);
export const itemTypeEnum = pgEnum('item_type', ['tool', 'software', 'hardware', 'consumable', 'key', 'document']);
export const skillCategoryEnum = pgEnum('skill_category', ['technical', 'social', 'investigation', 'hacking', 'defense', 'analysis']);

// Table des joueurs
export const cyberQuestPlayers = pgTable('cyber_quest_players', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  characterName: text('character_name'),
  level: integer('level').notNull().default(1),
  experience: integer('experience').notNull().default(0),
  credits: integer('credits').notNull().default(500),
  reputation: integer('reputation').notNull().default(0),
  intelligence: integer('intelligence').notNull().default(5),
  perception: integer('perception').notNull().default(5),
  charisma: integer('charisma').notNull().default(5),
  technicalKnowledge: integer('technical_knowledge').notNull().default(5),
  attributePoints: integer('attribute_points').notNull().default(0),
  skillPoints: integer('skill_points').notNull().default(0),
  missionsCompleted: integer('missions_completed').notNull().default(0),
  challengesCompleted: integer('challenges_completed').notNull().default(0),
  playTime: integer('play_time').notNull().default(0),
  unlockedEnvironments: jsonb('unlocked_environments').default('[1]'),
  inventory: jsonb('inventory').default('[]'),
  lastSaved: timestamp('last_saved'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Table des missions
export const cyberQuestMissions = pgTable('cyber_quest_missions', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: missionTypeEnum('type').notNull(),
  difficulty: missionDifficultyEnum('difficulty').notNull(),
  requiredLevel: integer('required_level'),
  experienceReward: integer('experience_reward').notNull(),
  creditReward: integer('credit_reward').notNull(),
  reputationReward: integer('reputation_reward').notNull(),
  itemRewards: jsonb('item_rewards'),
  objectives: jsonb('objectives').notNull(),
  timeLimit: integer('time_limit'),
  isStory: boolean('is_story').default(false),
  isActive: boolean('is_active').default(true),
  prerequisiteMissions: jsonb('prerequisite_missions'),
  environmentId: integer('environment_id').notNull(),
  npcId: integer('npc_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Table des progrès des joueurs dans les missions
export const cyberQuestPlayerMissions = pgTable('cyber_quest_player_missions', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull().references(() => cyberQuestPlayers.id),
  missionId: integer('mission_id').notNull().references(() => cyberQuestMissions.id),
  status: text('status').notNull().default('active'), // active, completed, failed, abandoned
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  completedObjectives: jsonb('completed_objectives').notNull().default('[]'),
  attempts: integer('attempts').notNull().default(1),
  timeSpent: integer('time_spent').notNull().default(0),
});

// Table des environnements
export const cyberQuestEnvironments = pgTable('cyber_quest_environments', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  type: environmentTypeEnum('type').notNull(),
  requiredLevel: integer('required_level').default(1),
  requiredReputation: integer('required_reputation').default(0),
  requiredMissions: jsonb('required_missions'),
  backgroundImage: text('background_image'),
  isActive: boolean('is_active').default(true),
  connections: jsonb('connections'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Table des PNJ
export const cyberQuestNpcs = pgTable('cyber_quest_npcs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  description: text('description').notNull(),
  environmentId: integer('environment_id').notNull().references(() => cyberQuestEnvironments.id),
  avatarImage: text('avatar_image'),
  dialogues: jsonb('dialogues').notNull(),
  shop: jsonb('shop'),
  missions: jsonb('missions'),
  relationshipLevel: integer('relationship_level').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Table des compétences
export const cyberQuestSkills = pgTable('cyber_quest_skills', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: skillCategoryEnum('category').notNull(),
  requiredLevel: integer('required_level').default(1),
  cost: integer('cost').notNull(),
  maxLevel: integer('max_level').notNull().default(5),
  effects: jsonb('effects').notNull(),
  icon: text('icon'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Table des compétences acquises par les joueurs
export const cyberQuestPlayerSkills = pgTable('cyber_quest_player_skills', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull().references(() => cyberQuestPlayers.id),
  skillId: integer('skill_id').notNull().references(() => cyberQuestSkills.id),
  level: integer('level').notNull().default(1),
  purchasedAt: timestamp('purchased_at').defaultNow().notNull(),
  lastUpgraded: timestamp('last_upgraded'),
});

// Table des objets
export const cyberQuestItems = pgTable('cyber_quest_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  type: itemTypeEnum('type').notNull(),
  value: integer('value').notNull(),
  effects: jsonb('effects'),
  requiredLevel: integer('required_level').default(1),
  requiredSkill: integer('required_skill'),
  icon: text('icon'),
  isConsumable: boolean('is_consumable').default(false),
  maxQuantity: integer('max_quantity').default(1),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Table des objets dans l'inventaire des joueurs
export const cyberQuestPlayerInventory = pgTable('cyber_quest_player_inventory', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull().references(() => cyberQuestPlayers.id),
  itemId: integer('item_id').notNull().references(() => cyberQuestItems.id),
  quantity: integer('quantity').notNull().default(1),
  equipped: boolean('equipped').default(false),
  purchasedAt: timestamp('purchased_at').defaultNow().notNull(),
  usedCount: integer('used_count').default(0),
});

// Table du journal des joueurs
export const cyberQuestPlayerJournal = pgTable('cyber_quest_player_journal', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull().references(() => cyberQuestPlayers.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull().default('info'), // info, story, hint, secret
  relatedMissionId: integer('related_mission_id'),
  relatedEnvironmentId: integer('related_environment_id'),
  discovered: boolean('discovered').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Schémas Zod pour les insertions et validations
export const insertCyberQuestPlayerSchema = createInsertSchema(cyberQuestPlayers).omit({ id: true });
export const insertCyberQuestMissionSchema = createInsertSchema(cyberQuestMissions).omit({ id: true });
export const insertCyberQuestEnvironmentSchema = createInsertSchema(cyberQuestEnvironments).omit({ id: true });
export const insertCyberQuestNpcSchema = createInsertSchema(cyberQuestNpcs).omit({ id: true });
export const insertCyberQuestSkillSchema = createInsertSchema(cyberQuestSkills).omit({ id: true });
export const insertCyberQuestItemSchema = createInsertSchema(cyberQuestItems).omit({ id: true });

// Types dérivés des schémas
export type CyberQuestPlayer = typeof cyberQuestPlayers.$inferSelect;
export type InsertCyberQuestPlayer = z.infer<typeof insertCyberQuestPlayerSchema>;

export type Mission = typeof cyberQuestMissions.$inferSelect;
export type InsertMission = z.infer<typeof insertCyberQuestMissionSchema>;

export type Environment = typeof cyberQuestEnvironments.$inferSelect;
export type InsertEnvironment = z.infer<typeof insertCyberQuestEnvironmentSchema>;

export type Npc = typeof cyberQuestNpcs.$inferSelect;
export type InsertNpc = z.infer<typeof insertCyberQuestNpcSchema>;

export type Skill = typeof cyberQuestSkills.$inferSelect;
export type InsertSkill = z.infer<typeof insertCyberQuestSkillSchema>;

export type Item = typeof cyberQuestItems.$inferSelect;
export type InsertItem = z.infer<typeof insertCyberQuestItemSchema>;

// Types pour les objets complexes (stockés en JSON)
export interface Objective {
  id: number;
  description: string;
  type: 'interact' | 'collect' | 'analyze' | 'solve' | 'hack' | 'defend';
  targetId?: number;
  targetCount?: number;
  completed: boolean;
}

export interface Connection {
  environmentId: number;
  name: string;
  requiredLevel?: number;
  requiredItem?: number;
  locked: boolean;
}