import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, uuid, foreignKey, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enumérations pour CyberQuest

// Types d'environnements/zones dans le jeu
export const environmentTypeEnum = pgEnum('environment_type', [
  'headquarters', // Quartier général
  'corporate',    // Environnement d'entreprise
  'underground',  // Réseau souterrain
  'academic',     // Institution académique
  'government',   // Installation gouvernementale
  'virtual'       // Environnement virtuel/simulé
]);

// Types de missions
export const missionTypeEnum = pgEnum('mission_type', [
  'main_story',    // Arc principal
  'side_quest',    // Quête secondaire
  'daily',         // Défi quotidien
  'investigation', // Investigation spéciale
  'emergency',     // Incident urgent
  'training'       // Mission d'entraînement
]);

// Niveaux de difficulté
export const difficultyEnum = pgEnum('difficulty', [
  'trainee',      // Débutant
  'junior',       // Junior
  'intermediate', // Intermédiaire  
  'senior',       // Senior
  'expert',       // Expert
  'master'        // Maître
]);

// Branches de compétences
export const skillBranchEnum = pgEnum('skill_branch', [
  'investigation',  // Capacités d'investigation
  'technical',      // Compétences techniques
  'social',         // Ingénierie sociale
  'analysis',       // Analyse de données/preuves
  'defense',        // Défense et protection
  'offense'         // Recherche de vulnérabilités
]);

// Statut d'un élément (mission, zone, etc.)
export const statusEnum = pgEnum('status', [
  'locked',      // Verrouillé
  'available',   // Disponible
  'in_progress', // En cours
  'completed',   // Terminé
  'failed'       // Échoué
]);

// ======= TABLES PRINCIPALES =======

// Profil du joueur
export const cyberQuestPlayer = pgTable('cyber_quest_player', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(), // Lien vers l'utilisateur principal
  userName: varchar('user_name', { length: 255 }).notNull(),
  characterName: varchar('character_name', { length: 255 }).default('Agent'),
  level: integer('level').notNull().default(1),
  experience: integer('experience').notNull().default(0),
  credits: integer('credits').notNull().default(100),
  reputation: integer('reputation').notNull().default(0),
  
  // Attributs du personnage
  intelligence: integer('intelligence').notNull().default(5),
  perception: integer('perception').notNull().default(5),
  charisma: integer('charisma').notNull().default(5),
  technicalKnowledge: integer('technical_knowledge').notNull().default(5),
  
  // Points disponibles pour améliorer les attributs
  attributePoints: integer('attribute_points').notNull().default(0),
  skillPoints: integer('skill_points').notNull().default(0),
  
  // Progrès et déverrouillages
  unlockedEnvironments: jsonb('unlocked_environments').default([]).notNull(),
  unlockedSkills: jsonb('unlocked_skills').default([]).notNull(),
  inventory: jsonb('inventory').default([]).notNull(),
  
  // Statistiques de jeu
  playTime: integer('play_time').default(0), // Temps de jeu en minutes
  missionsCompleted: integer('missions_completed').default(0),
  challengesCompleted: integer('challenges_completed').default(0),
  
  lastSaved: timestamp('last_saved').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Environnements et zones de jeu
export const environments = pgTable('cyber_quest_environments', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  type: environmentTypeEnum('type').notNull(),
  difficulty: difficultyEnum('difficulty').notNull(),
  
  // Conditions de déverrouillage
  requiredLevel: integer('required_level').default(1),
  requiredReputation: integer('required_reputation').default(0),
  requiredMissionIds: jsonb('required_mission_ids').default([]),
  requiredCredits: integer('required_credits').default(0),
  
  // Structure et organisation
  parentEnvironmentId: integer('parent_environment_id'), // Pour les sous-zones
  layout: jsonb('layout').notNull(), // Structure de l'environnement (salles, connexions)
  npcs: jsonb('npcs').default([]).notNull(), // PNJ dans cet environnement
  interactiveObjects: jsonb('interactive_objects').default([]).notNull(), // Objets interactifs
  
  // Méta-données
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Missions et quêtes
export const missions = pgTable('cyber_quest_missions', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  type: missionTypeEnum('type').notNull(),
  difficulty: difficultyEnum('difficulty').notNull(),
  
  // Récompenses
  experienceReward: integer('experience_reward').notNull().default(50),
  creditReward: integer('credit_reward').notNull().default(100),
  reputationReward: integer('reputation_reward').notNull().default(10),
  itemRewards: jsonb('item_rewards').default([]),
  
  // Conditions et progression
  requiredLevel: integer('required_level').default(1),
  requiredMissionIds: jsonb('required_mission_ids').default([]),
  requiredEnvironmentId: integer('required_environment_id'),
  timeLimit: integer('time_limit'), // En minutes, null = pas de limite
  
  // Contenu de la mission
  objectives: jsonb('objectives').notNull(), // Liste d'objectifs à accomplir
  dialogues: jsonb('dialogues').default([]), // Dialogues spécifiques à la mission
  challenges: jsonb('challenges').default([]), // Défis techniques ou puzzles
  
  // Narration et intrigue
  storylinePhase: varchar('storyline_phase', { length: 100 }), // Phase dans l'histoire principale
  isMainStory: boolean('is_main_story').default(false),
  
  // Méta-données
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Personnages non-joueurs (PNJ)
export const npcs = pgTable('cyber_quest_npcs', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 255 }).notNull(), // Ex: "Informateur", "Client", "Expert technique"
  description: text('description').notNull(),
  
  // Attributs et apparence
  avatarUrl: text('avatar_url'),
  personality: jsonb('personality').notNull(), // Traits de personnalité
  
  // Interactions
  dialogues: jsonb('dialogues').notNull(), // Dialogues possibles
  knowledge: jsonb('knowledge').default({}), // Informations que le PNJ peut partager
  relationships: jsonb('relationships').default({}), // Relations avec d'autres PNJ
  
  // Conditions
  requiredReputation: integer('required_reputation').default(0), // Réputation nécessaire pour interagir
  requiredMissions: jsonb('required_missions').default([]), // Missions requises pour débloquer

  // Emplacement par défaut
  defaultEnvironmentId: integer('default_environment_id'),
  
  // Méta-données
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Compétences disponibles
export const skills = pgTable('cyber_quest_skills', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  branch: skillBranchEnum('branch').notNull(),
  
  // Progression et déverrouillage
  level: integer('level').notNull().default(1), // Niveau de la compétence (1-5)
  requiredLevel: integer('required_level').notNull().default(1), // Niveau joueur requis
  requiredSkills: jsonb('required_skills').default([]), // Compétences préalables
  skillPointCost: integer('skill_point_cost').notNull().default(1),
  
  // Effets et bonus
  effects: jsonb('effects').notNull(), // Effets de la compétence sur le gameplay
  
  // Méta-données
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Items et équipement
export const items = pgTable('cyber_quest_items', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  type: varchar('type', { length: 100 }).notNull(), // "tool", "access_card", "software", etc.
  
  // Acquisition
  price: integer('price').notNull().default(100),
  rarity: varchar('rarity', { length: 50 }).notNull().default('common'), // common, uncommon, rare, epic, legendary
  requiredLevel: integer('required_level').notNull().default(1),
  
  // Effets et utilisation
  effects: jsonb('effects').default({}),
  durability: integer('durability'), // null = indestructible
  cooldown: integer('cooldown'), // Temps en minutes avant réutilisation
  
  // Méta-données
  iconUrl: text('icon_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ======= TABLES DE SUIVI DE PROGRESSION =======

// Progression du joueur dans les missions
export const playerMissionProgress = pgTable('cyber_quest_player_mission_progress', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull().references(() => cyberQuestPlayer.id),
  missionId: integer('mission_id').notNull().references(() => missions.id),
  status: statusEnum('status').notNull().default('available'),
  
  // Progression 
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  attempts: integer('attempts').notNull().default(0),
  
  // Suivi des objectifs
  completedObjectives: jsonb('completed_objectives').default([]),
  currentObjectiveIndex: integer('current_objective_index').default(0),
  
  // Données spécifiques à la mission
  missionData: jsonb('mission_data').default({}), // Stockage spécifique à chaque mission
  
  // Notes et feedback
  playerNotes: text('player_notes'),
  
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Progression des compétences du joueur
export const playerSkills = pgTable('cyber_quest_player_skills', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull().references(() => cyberQuestPlayer.id),
  skillId: integer('skill_id').notNull().references(() => skills.id),
  level: integer('level').notNull().default(1),
  experience: integer('experience').notNull().default(0),
  unlockedAt: timestamp('unlocked_at').defaultNow(),
  lastUsed: timestamp('last_used'),
  usageCount: integer('usage_count').notNull().default(0),
});

// Journal du joueur (logs, découvertes)
export const playerJournal = pgTable('cyber_quest_player_journal', {
  id: serial('id').primaryKey(),
  playerId: integer('player_id').notNull().references(() => cyberQuestPlayer.id),
  entryType: varchar('entry_type', { length: 100 }).notNull(), // "discovery", "mission_note", "clue", etc.
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  discoveredAt: timestamp('discovered_at').defaultNow(),
  associatedMissionId: integer('associated_mission_id').references(() => missions.id),
  associatedNpcId: integer('associated_npc_id').references(() => npcs.id),
  associatedEnvironmentId: integer('associated_environment_id').references(() => environments.id),
  tags: text('tags').array().default([]),
});

// Schémas d'insertion pour chaque table
export const insertCyberQuestPlayerSchema = createInsertSchema(cyberQuestPlayer).omit({ id: true });
export const insertEnvironmentSchema = createInsertSchema(environments).omit({ id: true });
export const insertMissionSchema = createInsertSchema(missions).omit({ id: true });
export const insertNpcSchema = createInsertSchema(npcs).omit({ id: true });
export const insertSkillSchema = createInsertSchema(skills).omit({ id: true });
export const insertItemSchema = createInsertSchema(items).omit({ id: true });
export const insertPlayerMissionProgressSchema = createInsertSchema(playerMissionProgress).omit({ id: true });
export const insertPlayerSkillSchema = createInsertSchema(playerSkills).omit({ id: true });
export const insertPlayerJournalSchema = createInsertSchema(playerJournal).omit({ id: true });

// Types pour TypeScript
export type CyberQuestPlayer = typeof cyberQuestPlayer.$inferSelect;
export type InsertCyberQuestPlayer = z.infer<typeof insertCyberQuestPlayerSchema>;

export type Environment = typeof environments.$inferSelect;
export type InsertEnvironment = z.infer<typeof insertEnvironmentSchema>;

export type Mission = typeof missions.$inferSelect;
export type InsertMission = z.infer<typeof insertMissionSchema>;

export type NPC = typeof npcs.$inferSelect;
export type InsertNPC = z.infer<typeof insertNpcSchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;

export type PlayerMissionProgress = typeof playerMissionProgress.$inferSelect;
export type InsertPlayerMissionProgress = z.infer<typeof insertPlayerMissionProgressSchema>;

export type PlayerSkill = typeof playerSkills.$inferSelect;
export type InsertPlayerSkill = z.infer<typeof insertPlayerSkillSchema>;

export type PlayerJournal = typeof playerJournal.$inferSelect;
export type InsertPlayerJournal = z.infer<typeof insertPlayerJournalSchema>;