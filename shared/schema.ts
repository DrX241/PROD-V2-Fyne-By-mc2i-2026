import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const customScenarios = pgTable("custom_scenarios", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  domain: text("domain").notNull(),
  difficulty: text("difficulty", { enum: ["debutant", "intermediaire", "expert"] }).notNull(),
  isPublic: boolean("is_public").notNull().default(true),
  originalDescription: text("original_description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  steps: jsonb("steps").notNull()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCustomScenarioSchema = createInsertSchema(customScenarios);

// Chat types for Azure OpenAI API
export type ChatCompletionRequestMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

// Document types
export interface Document {
  id: string;
  fileName: string;
  content: string;
  createdAt: Date;
  scenarioId: string;
}

// Insert schemas for documents
export const documentSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  content: z.string(),
  createdAt: z.date(),
  scenarioId: z.string()
});

// Custom Scenario types
export interface CustomScenarioActor {
  name: string;
  role: string;
}

export interface CustomScenarioStep {
  id: string;
  type: "email" | "message" | "system";
  actor?: CustomScenarioActor;
  content?: string;
  expectations?: string[];
  nextStep?: string;
}

export interface CustomScenario {
  id: string;
  name: string;
  description: string;
  domain: string;
  difficulty: "debutant" | "intermediaire" | "expert";
  isPublic: boolean;
  originalDescription: string;
  createdAt: Date;
  steps: CustomScenarioStep[];
}

// Schema for creating a custom scenario
export const customScenarioSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  domain: z.string(),
  difficulty: z.enum(["debutant", "intermediaire", "expert"]),
  isPublic: z.boolean(),
  originalDescription: z.string().min(50, "La description originale doit être détaillée"),
  steps: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["email", "message", "system"]),
      actor: z.object({
        name: z.string(),
        role: z.string()
      }).optional(),
      content: z.string().optional(),
      expectations: z.array(z.string()).optional(),
      nextStep: z.string().optional()
    })
  ).min(1, "Le scénario doit contenir au moins une étape")
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCustomScenario = z.infer<typeof customScenarioSchema>;
