import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Table pour les joueurs du module I AM CYBER
export const cyberPlayers = pgTable("cyber_players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatar: text("avatar").notNull(),
  role: text("role").notNull(),
  moduleId: text("module_id").notNull(),
  selectedDifficulty: text("selected_difficulty").notNull(),
  finalLevel: text("final_level").notNull(),
  testScore: integer("test_score").notNull(),
  testTotal: integer("test_total").notNull(),
  scorePercentage: integer("score_percentage").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActive: timestamp("last_active").defaultNow().notNull(),
  missionProgress: json("mission_progress").$type<{
    currentMission: string;
    missionsCompleted: string[];
    achievements: string[];
  }>().default({
    currentMission: "",
    missionsCompleted: [],
    achievements: []
  }),
});

// Table pour les missions du module I AM CYBER
export const cyberMissions = pgTable("cyber_missions", {
  id: serial("id").primaryKey(),
  missionId: text("mission_id").notNull().unique(),
  moduleId: text("module_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  contactName: text("contact_name").notNull(),
  contactRole: text("contact_role").notNull(),
  objectives: json("objectives").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCyberPlayerSchema = createInsertSchema(cyberPlayers).pick({
  name: true,
  avatar: true,
  role: true,
  moduleId: true,
  selectedDifficulty: true,
  finalLevel: true,
  testScore: true,
  testTotal: true,
  scorePercentage: true,
});

export const insertCyberMissionSchema = createInsertSchema(cyberMissions).pick({
  missionId: true,
  moduleId: true,
  title: true,
  description: true,
  difficulty: true,
  contactName: true,
  contactRole: true,
  objectives: true,
});

// Chat types for Azure OpenAI API
export type ChatCompletionRequestMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCyberPlayer = z.infer<typeof insertCyberPlayerSchema>;
export type CyberPlayer = typeof cyberPlayers.$inferSelect;

export type InsertCyberMission = z.infer<typeof insertCyberMissionSchema>;
export type CyberMission = typeof cyberMissions.$inferSelect;
