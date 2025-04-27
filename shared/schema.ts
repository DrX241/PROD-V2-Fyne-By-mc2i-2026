import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
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

// Définitions de types pour le système de QCM et sélection de mode
export type CyberGameMode = "classic" | "tunnel";
export type CyberUserRole = "rssi" | "ethical-hacker" | "developer" | "system-admin" | "consultant";
export type CyberSkillLevel = "Débutant" | "Intermédiaire" | "Expert";

// Table pour stocker les résultats des évaluations QCM
export const userEvaluations = pgTable("user_evaluations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  domain: text("domain").notNull(),
  skillLevel: text("skill_level").notNull(),
  score: integer("score").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Table pour stocker les sessions de jeu
export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  gameMode: text("game_mode").notNull(),
  userRole: text("user_role").notNull(),
  skillLevel: text("skill_level").notNull(),
  domain: text("domain").notNull(),
  status: text("status").notNull().default("active"), // active, completed, failed
  progress: integer("progress").notNull().default(0),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  scenarioIds: text("scenario_ids").array(),
  currentScenarioIndex: integer("current_scenario_index").default(0),
  chatHistory: json("chat_history").$type<any[]>().default([]),
});

// Table pour stocker les performances des utilisateurs
export const userPerformance = pgTable("user_performance", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionId: integer("session_id").notNull(),
  scenarioId: text("scenario_id").notNull(),
  success: boolean("success").notNull(),
  score: integer("score").notNull(),
  feedbackSummary: text("feedback_summary"),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Types QCM
export type QuizQuestion = {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
    value: string;
  }[];
};

export type QuizResult = {
  score: number;
  level: CyberSkillLevel;
  domain: string;
};

// Chat types for Azure OpenAI API
export type ChatCompletionRequestMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

// Type pour les défis (incluant code, indices, etc.)
export type CyberChallenge = {
  id: string;
  type: "code-analysis" | "code-fixing" | "hidden-clue" | "visual-analysis" | "decision";
  title: string;
  description: string;
  content: any; // Contenu spécifique au type de défi
  difficulty: CyberSkillLevel;
  hints: string[];
  solution?: string;
};

// Les définitions de documents ont été supprimées car nous n'utilisons plus de pièces jointes

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertUserEvaluation = typeof userEvaluations.$inferInsert;
export type UserEvaluation = typeof userEvaluations.$inferSelect;

export type InsertGameSession = typeof gameSessions.$inferInsert;
export type GameSession = typeof gameSessions.$inferSelect;

export type InsertUserPerformance = typeof userPerformance.$inferInsert;
export type UserPerformance = typeof userPerformance.$inferSelect;
