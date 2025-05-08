import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { users } from '@shared/schema';
import bcrypt from 'bcryptjs';
import { storage } from './storage';

// Déclaration de module pour ajouter des propriétés à l'objet session
declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
    isAdmin: boolean;
  }
}

// Middleware pour vérifier si l'utilisateur est authentifié
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // Vérification simple basée sur la session
  if (req.session && req.session.userId) {
    return next();
  }
  
  return res.status(401).json({ message: 'Non autorisé' });
};

// Middleware pour vérifier si l'utilisateur est admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Vérification si l'utilisateur est authentifié et a le rôle d'admin
  if (req.session && req.session.userId && req.session.isAdmin) {
    return next();
  }
  
  return res.status(403).json({ message: 'Accès refusé' });
};

// Handler pour le login
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis' });
    }
    
    // Trouver l'utilisateur par nom d'utilisateur
    const [user] = await db.select().from(users).where(eq(users.username, username));
    
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    
    // Vérifier le mot de passe (il faudra ajouter bcrypt plus tard)
    const isMatch = await bcrypt.compare(password, user.password || '');
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    
    // Créer la session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.isAdmin = user.role === 'admin';
    
    // Retourner l'utilisateur (sans le mot de passe)
    const userWithoutPassword = { ...user, password: undefined };
    
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Erreur de login:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Handler pour l'inscription
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe requis' });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.select().from(users).where(eq(users.username, username));
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Nom d\'utilisateur déjà utilisé' });
    }
    
    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Créer l'utilisateur
    const [newUser] = await db.insert(users).values({
      username,
      password: hashedPassword,
      email,
      firstName,
      lastName,
      role: 'user', // Par défaut, rôle utilisateur standard
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    // Créer la session
    req.session.userId = newUser.id;
    req.session.username = newUser.username;
    req.session.isAdmin = false;
    
    // Retourner l'utilisateur (sans le mot de passe)
    const userWithoutPassword = { ...newUser, password: undefined };
    
    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Handler pour la déconnexion
export const logout = (req: Request, res: Response) => {
  // Détruire la session
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    }
    
    res.clearCookie('connect.sid'); // Nom du cookie de session par défaut
    return res.status(200).json({ message: 'Déconnexion réussie' });
  });
};

// Handler pour récupérer l'utilisateur actuel
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }
    
    const userId = req.session.userId;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Retourner l'utilisateur (sans le mot de passe)
    const userWithoutPassword = { ...user, password: undefined };
    
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};