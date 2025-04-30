import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
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

// Les définitions de documents ont été supprimées car nous n'utilisons plus de pièces jointes

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Tables pour CyberChallenge

// Table des jeux
export const games = pgTable("challenge_games", {
  id: serial("id").primaryKey(),
  gameId: text("game_id").notNull().unique(),
  status: text("status").notNull().default("in_progress"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
  playerCount: integer("player_count").notNull(),
  scenarioData: jsonb("scenario_data").notNull(),
  currentPlayerIndex: integer("current_player_index").notNull().default(0),
  isGameOver: boolean("is_game_over").notNull().default(false),
});

// Table des joueurs
export const players = pgTable("challenge_players", {
  id: serial("id").primaryKey(),
  playerId: text("player_id").notNull().unique(),
  gameId: text("game_id").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  score: integer("score").notNull().default(0),
  active: boolean("active").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Table des PNJ (Personnages Non-Joueurs)
export const npcs = pgTable("challenge_npcs", {
  id: serial("id").primaryKey(),
  npcId: text("npc_id").notNull().unique(),
  gameId: text("game_id").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  personality: text("personality").notNull(),
  attitude: text("attitude").notNull().default("neutral"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Table des événements de jeu
export const gameEvents = pgTable("challenge_game_events", {
  id: serial("id").primaryKey(),
  eventId: text("event_id").notNull().unique(),
  gameId: text("game_id").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  playerId: text("player_id"),
  npcId: text("npc_id"),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Schémas Zod pour la validation
export const insertGameSchema = createInsertSchema(games).omit({ id: true });
export const insertPlayerSchema = createInsertSchema(players).omit({ id: true });
export const insertNpcSchema = createInsertSchema(npcs).omit({ id: true });
export const insertGameEventSchema = createInsertSchema(gameEvents).omit({ id: true });

// Types pour l'ORM
export type InsertGame = z.infer<typeof insertGameSchema>;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type InsertNpc = z.infer<typeof insertNpcSchema>;
export type InsertGameEvent = z.infer<typeof insertGameEventSchema>;
export type Game = typeof games.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Npc = typeof npcs.$inferSelect;
export type GameEvent = typeof gameEvents.$inferSelect;
