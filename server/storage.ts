import { users, type User, type InsertUser, type CustomScenario, type InsertCustomScenario } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";

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

export const storage = new MemStorage();
