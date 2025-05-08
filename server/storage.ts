import { users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import MemoryStore from "memorystore";

// Interface pour les opérations de stockage CRUD
export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: InsertUser): Promise<User>;
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
    // Assurez-vous d'avoir des valeurs null pour les propriétés optionnelles
    const user: User = { 
      id: insertUser.id || Math.floor(Math.random() * 1000000) + 1, // Générer un ID si non fourni
      username: insertUser.username,
      password: insertUser.password,
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
    this.users.set(user.id, user);
    return user;
  }

  async upsertUser(userData: InsertUser): Promise<User> {
    const existingUser = userData.id ? await this.getUser(userData.id) : undefined;
    
    if (existingUser) {
      const updatedUser: User = {
        ...existingUser,
        ...userData,
        updatedAt: new Date(),
      };
      this.users.set(updatedUser.id, updatedUser);
      return updatedUser;
    } else {
      return this.createUser(userData);
    }
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
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async upsertUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

// Utiliser l'implémentation de base de données pour la production
export const storage = new DatabaseStorage();
