import {
  users, type User, type InsertUser,
  generatedTrainings, type GeneratedTraining, type InsertGeneratedTraining
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import session from "express-session";
import MemoryStore from "memorystore";

export interface TokenState {
  tokenUsedMonth: number;
  tokenQuota: number;
  tokenResetAt: Date | null;
}

// Interface pour les opérations de stockage CRUD
export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<void>;
  incrementTokenUsage(userId: number, tokens: number): Promise<TokenState>;
  // Studio — formations générées
  saveGeneratedTraining(training: InsertGeneratedTraining): Promise<GeneratedTraining>;
  getGeneratedTraining(id: string): Promise<GeneratedTraining | undefined>;
  listGeneratedTrainings(limit?: number): Promise<GeneratedTraining[]>;
  deleteGeneratedTraining(id: string): Promise<void>;
  updateGeneratedTraining(id: string, patch: { title?: string; tagline?: string; content?: any }): Promise<GeneratedTraining | undefined>;
}

// Implémentation de la mémoire pour les tests et le développement
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    
    // Créer un memory store pour les sessions
    const MemoryStoreWithSession = MemoryStore(session);
    this.sessionStore = new MemoryStoreWithSession({
      checkPeriod: 86400000 // Nettoyage des sessions expirées une fois par jour
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    // Générer un ID si non fourni (en mémoire seulement)
    const userId = typeof insertUser.id === 'number' ? insertUser.id : Math.floor(Math.random() * 1000000) + 1;
    
    // Assurez-vous d'avoir des valeurs par défaut pour les propriétés optionnelles
    const user: User = { 
      id: userId,
      username: insertUser.username,
      password: insertUser.password || null,
      email: insertUser.email || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      bio: insertUser.bio || null,
      profileImageUrl: insertUser.profileImageUrl || null,
      role: insertUser.role || 'user',
      isActive: insertUser.isActive !== undefined ? insertUser.isActive : true,
      lastLogin: insertUser.lastLogin || null,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(userId, user);
    return user;
  }

  async upsertUser(userData: InsertUser): Promise<User> {
    // Générer un ID si non fourni (en mémoire seulement)
    const userId = typeof userData.id === 'number' ? userData.id : Math.floor(Math.random() * 1000000) + 1;
    const existingUser = await this.getUser(userId);
    
    if (existingUser) {
      const updatedUser: User = {
        ...existingUser,
        ...userData,
        id: userId, // Garantit que l'ID reste le même
        updatedAt: new Date(),
      };
      this.users.set(userId, updatedUser);
      return updatedUser;
    } else {
      return this.createUser({...userData, id: userId});
    }
  }

  async updateUserLastLogin(id: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLogin = new Date();
      user.updatedAt = new Date();
      this.users.set(id, user);
    }
  }

  async incrementTokenUsage(userId: number, tokens: number): Promise<TokenState> {
    const user = this.users.get(userId);
    if (!user) return { tokenUsedMonth: 0, tokenQuota: 100000, tokenResetAt: null };
    const now = new Date();
    const resetAt = (user as any).tokenResetAt as Date | null;
    const needsReset = !resetAt || now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear();
    const newUsed = needsReset ? tokens : ((user as any).tokenUsedMonth ?? 0) + tokens;
    (user as any).tokenUsedMonth = newUsed;
    (user as any).tokenResetAt = needsReset ? now : resetAt;
    (user as any).updatedAt = now;
    this.users.set(userId, user);
    return { tokenUsedMonth: newUsed, tokenQuota: (user as any).tokenQuota ?? 100000, tokenResetAt: (user as any).tokenResetAt };
  }

  private trainings: Map<string, GeneratedTraining> = new Map();

  async saveGeneratedTraining(t: InsertGeneratedTraining): Promise<GeneratedTraining> {
    const record: GeneratedTraining = { ...t, createdAt: new Date() };
    this.trainings.set(t.id, record);
    return record;
  }

  async getGeneratedTraining(id: string): Promise<GeneratedTraining | undefined> {
    return this.trainings.get(id);
  }

  async listGeneratedTrainings(limit = 20): Promise<GeneratedTraining[]> {
    return Array.from(this.trainings.values()).slice(-limit).reverse();
  }

  async deleteGeneratedTraining(id: string): Promise<void> {
    this.trainings.delete(id);
  }
}

// Implémentation de base de données pour la production
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Créer un memory store pour les sessions (en production, utiliser connect-pg-simple)
    const MemoryStoreWithSession = MemoryStore(session);
    this.sessionStore = new MemoryStoreWithSession({
      checkPeriod: 86400000 // Nettoyage des sessions expirées une fois par jour
    });
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Omettre l'ID pour que la base de données le génère
    const { id, ...userData } = insertUser;
    
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: InsertUser): Promise<User> {
    // Si l'ID existe, faire une mise à jour
    if (userData.id) {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userData.id));
      
      if (existingUser) {
        const [updatedUser] = await db
          .update(users)
          .set({
            ...userData,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userData.id))
          .returning();
        return updatedUser;
      }
    }
    
    // Sinon, créer un nouvel utilisateur
    return this.createUser(userData);
  }

  async updateUserLastLogin(id: number): Promise<void> {
    await db
      .update(users)
      .set({
        lastLogin: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  async incrementTokenUsage(userId: number, tokens: number): Promise<TokenState> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return { tokenUsedMonth: 0, tokenQuota: 100000, tokenResetAt: null };

    const now = new Date();
    const resetAt = (user as any).tokenResetAt as Date | null;
    const needsReset = !resetAt ||
      now.getMonth() !== new Date(resetAt).getMonth() ||
      now.getFullYear() !== new Date(resetAt).getFullYear();

    const newUsed = needsReset ? tokens : ((user as any).tokenUsedMonth ?? 0) + tokens;

    await db.update(users).set({
      tokenUsedMonth: newUsed,
      tokenResetAt: needsReset ? now : resetAt,
      updatedAt: now,
    } as any).where(eq(users.id, userId));

    return {
      tokenUsedMonth: newUsed,
      tokenQuota: (user as any).tokenQuota ?? 100000,
      tokenResetAt: needsReset ? now : resetAt,
    };
  }

  async saveGeneratedTraining(t: InsertGeneratedTraining): Promise<GeneratedTraining> {
    const [record] = await db
      .insert(generatedTrainings)
      .values(t)
      .returning();
    return record;
  }

  async getGeneratedTraining(id: string): Promise<GeneratedTraining | undefined> {
    const [record] = await db
      .select()
      .from(generatedTrainings)
      .where(eq(generatedTrainings.id, id));
    return record;
  }

  async listGeneratedTrainings(limit = 20): Promise<GeneratedTraining[]> {
    return db
      .select()
      .from(generatedTrainings)
      .orderBy(desc(generatedTrainings.createdAt))
      .limit(limit);
  }

  async deleteGeneratedTraining(id: string): Promise<void> {
    await db
      .delete(generatedTrainings)
      .where(eq(generatedTrainings.id, id));
  }

  async updateGeneratedTraining(id: string, patch: { title?: string; tagline?: string; content?: any }): Promise<GeneratedTraining | undefined> {
    const [record] = await db
      .update(generatedTrainings)
      .set({ ...patch })
      .where(eq(generatedTrainings.id, id))
      .returning();
    return record;
  }
}

// Utiliser l'implémentation de base de données pour la production
export const storage = new DatabaseStorage();
