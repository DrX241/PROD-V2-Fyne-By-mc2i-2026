import { users, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from 'express-session';
import connectPg from "connect-pg-simple";

// Interface pour les opérations de stockage CRUD
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: InsertUser): Promise<User>;
  sessionStore: session.Store;
}

// Implémentation de la mémoire pour les tests et le développement
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    // Utiliser MemoryStore pour le développement
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Nettoyer les sessions expirées chaque jour
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
    // Générer un ID si non fourni (simulation de l'autoincrement)
    const newId = insertUser.id || Math.max(0, ...Array.from(this.users.keys())) + 1;
    
    // Assurez-vous d'avoir des valeurs null pour les propriétés optionnelles
    const user: User = { 
      id: newId,
      username: insertUser.username,
      password: insertUser.password || null,
      email: insertUser.email || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      role: insertUser.role || 'user',
      bio: insertUser.bio || null,
      profileImageUrl: insertUser.profileImageUrl || null,
      isActive: insertUser.isActive !== undefined ? insertUser.isActive : true,
      lastLogin: insertUser.lastLogin || null,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(user.id, user);
    return user;
  }

  async upsertUser(userData: InsertUser): Promise<User> {
    // Si pas d'ID ou ID non trouvé, créer un nouvel utilisateur
    if (!userData.id || !this.users.has(userData.id)) {
      return this.createUser(userData);
    }
    
    // Sinon mettre à jour l'utilisateur existant
    const existingUser = await this.getUser(userData.id);
    const updatedUser: User = {
      ...existingUser!,
      ...userData,
      updatedAt: new Date(),
    };
    
    this.users.set(updatedUser.id, updatedUser);
    return updatedUser;
  }
}

// Implémentation de base de données pour la production
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      tableName: 'sessions',
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
