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

// Les définitions de documents ont été supprimées car nous n'utilisons plus de pièces jointes

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
