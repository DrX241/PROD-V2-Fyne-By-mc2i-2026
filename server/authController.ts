import { Request, Response } from 'express';
import { db } from './db';
import { storage } from './storage';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import session from 'express-session';

// Étendre le type Session pour inclure nos propriétés personnalisées
declare module 'express-session' {
  interface SessionData {
    userId: string;
    isAuthenticated: boolean;
    userRole: 'user' | 'admin';
  }
}

const scryptAsync = promisify(scrypt);

// Hash du mot de passe
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

// Vérifier si le mot de passe correspond au hash stocké
export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Créer l'utilisateur admin par défaut s'il n'existe pas
export async function ensureAdminExists(): Promise<void> {
  try {
    // Vérifier si l'admin existe déjà
    const adminExists = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.username, 'admin'))
      .limit(1);
    
    if (adminExists.length === 0) {
      console.log('Création du compte administrateur par défaut...');
      const adminPassword = "Bienvenuechezmc2i,enfin,sur,fyne:)";
      
      // Créer l'utilisateur admin
      await db.insert(users).values({
        id: uuidv4(),
        username: 'admin',
        email: 'admin@mc2i.fr',
        password: await hashPassword(adminPassword),
        role: 'admin',
        firstName: 'Admin',
        lastName: 'FYNE',
        isActive: true
      });
      
      console.log('Compte administrateur créé avec succès.');
    } else {
      console.log('Le compte administrateur existe déjà.');
    }
  } catch (error) {
    console.error('Erreur lors de la création du compte administrateur:', error);
  }
}

// S'inscrire
export async function register(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Le nom d'utilisateur et le mot de passe sont requis"
      });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Ce nom d'utilisateur est déjà utilisé"
      });
    }
    
    // Vérifier si l'email existe déjà
    if (email) {
      const emailExists = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      if (emailExists.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Cette adresse email est déjà utilisée"
        });
      }
    }
    
    // Créer l'utilisateur
    const hashedPassword = await hashPassword(password);
    const user = await storage.createUser({
      id: uuidv4(),
      username,
      email: email || null,
      password: hashedPassword,
      role: 'user'
    });
    
    // Créer la session utilisateur
    req.session.userId = user.id;
    req.session.isAuthenticated = true;
    req.session.userRole = user.role || 'user';
    
    return res.status(201).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'inscription"
    });
  }
}

// Se connecter
export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Le nom d'utilisateur et le mot de passe sont requis"
      });
    }
    
    // Rechercher l'utilisateur
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Identifiants invalides"
      });
    }
    
    // Vérifier si l'utilisateur est actif
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Ce compte a été désactivé"
      });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Identifiants invalides"
      });
    }
    
    // Créer la session utilisateur
    req.session.userId = user.id;
    req.session.isAuthenticated = true;
    req.session.userRole = user.role;
    
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion"
    });
  }
}

// Se déconnecter
export async function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erreur lors de la déconnexion:', err);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la déconnexion"
      });
    }
    
    res.clearCookie('connect.sid');
    return res.status(200).json({
      success: true,
      message: "Déconnexion réussie"
    });
  });
}

// Obtenir les informations de l'utilisateur courant
export async function getCurrentUser(req: Request, res: Response) {
  try {
    if (!req.session.userId || !req.session.isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié"
      });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      // Session invalide - nettoyer
      req.session.destroy(() => {});
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }
    
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
}

// Middleware pour vérifier si l'utilisateur est authentifié
export function isAuthenticated(req: Request, res: Response, next: Function) {
  if (req.session.isAuthenticated && req.session.userId) {
    return next();
  }
  
  return res.status(401).json({
    success: false,
    message: "Authentification requise"
  });
}

// Middleware pour vérifier si l'utilisateur est un administrateur
export function isAdmin(req: Request, res: Response, next: Function) {
  if (req.session.isAuthenticated && req.session.userId && req.session.userRole === 'admin') {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: "Accès non autorisé"
  });
}

// Obtenir la liste des utilisateurs (admin seulement)
export async function getUsers(req: Request, res: Response) {
  try {
    const usersList = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt
    })
    .from(users)
    .orderBy(users.createdAt);
    
    return res.status(200).json({
      success: true,
      users: usersList
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
}

// Ajouter un utilisateur (admin seulement)
export async function addUser(req: Request, res: Response) {
  try {
    const { username, email, password, firstName, lastName, role } = req.body;
    
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: "Le nom d'utilisateur, l'email et le mot de passe sont requis"
      });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Ce nom d'utilisateur est déjà utilisé"
      });
    }
    
    // Vérifier si l'email existe déjà
    const emailExists = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (emailExists.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cette adresse email est déjà utilisée"
      });
    }
    
    // Créer l'utilisateur
    const hashedPassword = await hashPassword(password);
    const user = await storage.createUser({
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      firstName: firstName || null,
      lastName: lastName || null,
      role: role || 'user'
    });
    
    return res.status(201).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un utilisateur:', error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'ajout de l'utilisateur"
    });
  }
}

// Mettre à jour un utilisateur (admin seulement)
export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, role, isActive } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID utilisateur requis"
      });
    }
    
    // Vérifier si l'utilisateur existe
    const existingUser = await storage.getUser(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }
    
    // Mise à jour de l'utilisateur
    const updatedData: any = {};
    
    if (email !== undefined) updatedData.email = email;
    if (firstName !== undefined) updatedData.firstName = firstName;
    if (lastName !== undefined) updatedData.lastName = lastName;
    if (role !== undefined) updatedData.role = role;
    if (isActive !== undefined) updatedData.isActive = isActive;
    
    await db.update(users)
      .set({
        ...updatedData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
    
    const updatedUser = await storage.getUser(id);
    
    return res.status(200).json({
      success: true,
      user: {
        id: updatedUser!.id,
        username: updatedUser!.username,
        email: updatedUser!.email,
        firstName: updatedUser!.firstName,
        lastName: updatedUser!.lastName,
        role: updatedUser!.role,
        isActive: updatedUser!.isActive
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de l'utilisateur"
    });
  }
}

// Changer le mot de passe d'un utilisateur (admin seulement)
export async function changeUserPassword(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!id || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "ID utilisateur et nouveau mot de passe requis"
      });
    }
    
    // Vérifier si l'utilisateur existe
    const existingUser = await storage.getUser(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }
    
    // Mise à jour du mot de passe
    const hashedPassword = await hashPassword(newPassword);
    
    await db.update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
    
    return res.status(200).json({
      success: true,
      message: "Mot de passe mis à jour avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe:', error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du mot de passe"
    });
  }
}

// Supprimer un utilisateur (admin seulement)
export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID utilisateur requis"
      });
    }
    
    // Vérifier si l'utilisateur existe
    const existingUser = await storage.getUser(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }
    
    // Empêcher la suppression du compte admin principal
    if (existingUser.username === 'admin') {
      return res.status(403).json({
        success: false,
        message: "Le compte administrateur principal ne peut pas être supprimé"
      });
    }
    
    // Suppression de l'utilisateur
    await db.delete(users).where(eq(users.id, id));
    
    return res.status(200).json({
      success: true,
      message: "Utilisateur supprimé avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'utilisateur"
    });
  }
}