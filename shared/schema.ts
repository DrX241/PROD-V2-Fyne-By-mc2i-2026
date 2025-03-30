import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
