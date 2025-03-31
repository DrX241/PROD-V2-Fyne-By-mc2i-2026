import { users, customScenarios, type User, type InsertUser, type CustomScenario, type InsertCustomScenario } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { db } from "./db";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Custom Scenario methods
  getCustomScenarios(): Promise<CustomScenario[]>;
  getCustomScenarioById(id: string): Promise<CustomScenario | undefined>;
  createCustomScenario(scenario: InsertCustomScenario): Promise<CustomScenario>;
  updateCustomScenario(id: string, scenario: Partial<InsertCustomScenario>): Promise<CustomScenario | undefined>;
  deleteCustomScenario(id: string): Promise<boolean>;
}

export class PostgresStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Custom Scenario methods
  async getCustomScenarios(): Promise<CustomScenario[]> {
    try {
      const scenarios = await db.select().from(customScenarios);
      // Convertir les formats de date et structure JSON pour correspondre à l'interface CustomScenario
      return scenarios.map(scenario => ({
        ...scenario,
        difficulty: scenario.difficulty as "debutant" | "intermediaire" | "expert",
        steps: Array.isArray(scenario.steps) ? scenario.steps : [],
      }));
    } catch (error) {
      console.error("Error getting custom scenarios:", error);
      return [];
    }
  }
  
  async getCustomScenarioById(id: string): Promise<CustomScenario | undefined> {
    try {
      const result = await db.select().from(customScenarios).where(eq(customScenarios.id, id));
      if (!result.length) return undefined;
      
      // Conversion pour l'interface CustomScenario
      return {
        ...result[0],
        difficulty: result[0].difficulty as "debutant" | "intermediaire" | "expert",
        steps: Array.isArray(result[0].steps) ? result[0].steps : [],
      };
    } catch (error) {
      console.error(`Error getting custom scenario with id ${id}:`, error);
      return undefined;
    }
  }
  
  async createCustomScenario(insertScenario: InsertCustomScenario): Promise<CustomScenario> {
    try {
      const id = uuidv4();
      const result = await db.insert(customScenarios).values({
        ...insertScenario,
        id,
      }).returning();
      
      // Conversion pour l'interface CustomScenario
      return {
        ...result[0],
        difficulty: result[0].difficulty as "debutant" | "intermediaire" | "expert",
        steps: Array.isArray(result[0].steps) ? result[0].steps : [],
      };
    } catch (error) {
      console.error("Error creating custom scenario:", error);
      throw error;
    }
  }
  
  async updateCustomScenario(id: string, updates: Partial<InsertCustomScenario>): Promise<CustomScenario | undefined> {
    try {
      const result = await db.update(customScenarios)
        .set(updates)
        .where(eq(customScenarios.id, id))
        .returning();
      
      if (!result.length) return undefined;
      
      // Conversion pour l'interface CustomScenario
      return {
        ...result[0],
        difficulty: result[0].difficulty as "debutant" | "intermediaire" | "expert",
        steps: Array.isArray(result[0].steps) ? result[0].steps : [],
      };
    } catch (error) {
      console.error(`Error updating custom scenario with id ${id}:`, error);
      return undefined;
    }
  }
  
  async deleteCustomScenario(id: string): Promise<boolean> {
    try {
      const result = await db.delete(customScenarios)
        .where(eq(customScenarios.id, id))
        .returning({ id: customScenarios.id });
      
      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting custom scenario with id ${id}:`, error);
      return false;
    }
  }
}

// Maintenir la compatibilité avec l'ancien stockage en mémoire si nécessaire
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private customScenarios: Map<string, CustomScenario>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.customScenarios = new Map();
    this.currentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Custom Scenario methods
  async getCustomScenarios(): Promise<CustomScenario[]> {
    return Array.from(this.customScenarios.values());
  }
  
  async getCustomScenarioById(id: string): Promise<CustomScenario | undefined> {
    return this.customScenarios.get(id);
  }
  
  async createCustomScenario(insertScenario: InsertCustomScenario): Promise<CustomScenario> {
    const id = uuidv4();
    const scenario: CustomScenario = { 
      ...insertScenario, 
      id, 
      createdAt: new Date() 
    };
    this.customScenarios.set(id, scenario);
    return scenario;
  }
  
  async updateCustomScenario(id: string, updates: Partial<InsertCustomScenario>): Promise<CustomScenario | undefined> {
    const scenario = this.customScenarios.get(id);
    if (!scenario) return undefined;
    
    const updatedScenario: CustomScenario = { 
      ...scenario, 
      ...updates,
    };
    
    this.customScenarios.set(id, updatedScenario);
    return updatedScenario;
  }
  
  async deleteCustomScenario(id: string): Promise<boolean> {
    return this.customScenarios.delete(id);
  }
}

// Utiliser le stockage PostgreSQL pour une persistance des données
export const storage = new PostgresStorage();
