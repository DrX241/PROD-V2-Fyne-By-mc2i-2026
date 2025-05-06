import { Request, Response, NextFunction } from "express";
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq, and, ne, lt, gt, sql } from "drizzle-orm";
import { addDays } from "date-fns";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// Fonction asynchrone pour le hachage des mots de passe avec scrypt
const scryptAsync = promisify(scrypt);

// Fonction pour hacher un mot de passe
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Fonction pour comparer un mot de passe avec un hash stocké
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) return false;
  
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Import Session de express-session pour le typage
import { Session } from 'express-session';

// Étendre l'interface de Session pour inclure nos propriétés personnalisées
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    username?: string;
    isAuthenticated?: boolean;
    isSuperAdmin?: boolean;
  }
}

// Étendre l'interface Request pour inclure l'utilisateur connecté
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role?: string;
      };
    }
  }
}

// Vérifie que l'utilisateur est administrateur
export async function isAdmin(userId: number): Promise<boolean> {
  const [userProfile] = await db
    .select()
    .from(schema.userProfiles)
    .where(eq(schema.userProfiles.userId, userId));

  return userProfile?.role === "admin" || userProfile?.role === "superadmin";
}

// Vérifie si l'utilisateur est super administrateur
export async function isSuperAdmin(userId: number): Promise<boolean> {
  const [userProfile] = await db
    .select()
    .from(schema.userProfiles)
    .where(eq(schema.userProfiles.userId, userId));

  return userProfile?.role === "superadmin";
}

// Vérifie si un utilisateur a accès à un module spécifique
export async function hasModuleAccess(userId: number, modulePath: string): Promise<boolean> {
  // Récupérer le profil de l'utilisateur pour connaître son rôle
  const [userProfile] = await db
    .select()
    .from(schema.userProfiles)
    .where(eq(schema.userProfiles.userId, userId));
  
  if (!userProfile) return false;
  
  // Les administrateurs ont accès à tous les modules
  if (userProfile.role === "admin") return true;
  
  // Récupérer les informations sur le module
  const [module] = await db
    .select()
    .from(schema.applicationModules)
    .where(eq(schema.applicationModules.path, modulePath));
  
  if (!module) return false;
  
  // Les modules publics sont accessibles à tous
  if (module.isPublic) return true;
  
  // Si l'utilisateur a un rôle suffisant pour accéder au module
  const roleHierarchy: Record<string, number> = {
    "admin": 4,
    "contributor": 3,
    "tester": 2,
    "user": 1
  };
  
  const userRoleStr = userProfile.role?.toString() || 'user';
  const userRoleLevel = roleHierarchy[userRoleStr] || 0;
  
  const moduleRoleStr = module.requiredRole?.toString() || 'user';
  const requiredRoleLevel = roleHierarchy[moduleRoleStr] || 1;
  
  if (userRoleLevel >= requiredRoleLevel) return true;
  
  // Vérifier si l'utilisateur a un accès temporaire actif pour ce module
  const temporaryAccess = await db
    .select()
    .from(schema.temporaryAccesses)
    .where(
      and(
        eq(schema.temporaryAccesses.email, userProfile.email || ""),
        eq(schema.temporaryAccesses.status, "active"),
        gt(schema.temporaryAccesses.expiresAt, new Date())
      )
    );
  
  if (temporaryAccess.length === 0) return false;
  
  // Vérifier si ce module spécifique est accessible via cet accès temporaire
  const temporaryAccessModules = await db
    .select()
    .from(schema.temporaryAccessModules)
    .innerJoin(
      schema.applicationModules,
      eq(schema.temporaryAccessModules.moduleId, schema.applicationModules.id)
    )
    .where(
      and(
        eq(schema.temporaryAccessModules.temporaryAccessId, temporaryAccess[0].id),
        eq(schema.applicationModules.path, modulePath)
      )
    );
  
  return temporaryAccessModules.length > 0;
}

// Vérifie l'accès administrateur
function checkAdminAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: "Non authentifié" });
  }

  isAdmin(req.user.id).then(isAdmin => {
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Accès non autorisé. Rôle administrateur requis." });
    }
    next();
  }).catch(error => {
    console.error("Erreur lors de la vérification des droits d'administrateur:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  });
}

// Vérifie l'accès super administrateur via la session
export function checkSuperAdminAccess(req: Request, res: Response, next: NextFunction) {
  // S'assurer que req.session existe
  if (!req.session) {
    console.error("Session non initialisée");
    return res.status(500).json({ 
      success: false, 
      message: "Erreur interne de serveur", 
      redirectTo: "/admin/login" 
    });
  }
  
  // Vérifier si l'utilisateur est super admin
  if (!req.session.isSuperAdmin) {
    return res.status(401).json({ 
      success: false, 
      message: "Authentification requise", 
      redirectTo: "/admin/login" 
    });
  }
  
  next();
}

// Récupère la liste des modules disponibles
export async function getModules(req: Request, res: Response) {
  try {
    // Vérifier les droits d'administrateur
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Non authentifié" });
    }

    const isUserAdmin = await isAdmin(req.user.id);
    
    let query = db.select().from(schema.applicationModules);
    
    // Si l'utilisateur n'est pas administrateur, filtrer les modules accessibles
    if (!isUserAdmin) {
      const [userProfile] = await db
        .select()
        .from(schema.userProfiles)
        .where(eq(schema.userProfiles.userId, req.user.id));
      
      // Si pas de profil ou pas d'email, renvoyer uniquement les modules publics
      if (!userProfile || !userProfile.email) {
        query = query.where(eq(schema.applicationModules.isPublic, true));
      } else {
        // Récupérer également les modules accessibles via des accès temporaires
        const temporaryAccesses = await db
          .select()
          .from(schema.temporaryAccesses)
          .where(
            and(
              eq(schema.temporaryAccesses.email, userProfile.email),
              eq(schema.temporaryAccesses.status, "active"),
              gt(schema.temporaryAccesses.expiresAt, new Date())
            )
          );
        
        if (temporaryAccesses.length > 0) {
          const accessId = temporaryAccesses[0].id;
          const moduleIds = await db
            .select({ moduleId: schema.temporaryAccessModules.moduleId })
            .from(schema.temporaryAccessModules)
            .where(eq(schema.temporaryAccessModules.temporaryAccessId, accessId));
          
          const moduleIdList = moduleIds.map(m => m.moduleId);
          
          // Modules publics OU modules avec accès temporaire
          if (moduleIdList.length > 0) {
            query = query.where(
              sql`${schema.applicationModules.isPublic} = true OR ${schema.applicationModules.id} IN (${moduleIdList.join(', ')})`
            );
          } else {
            query = query.where(eq(schema.applicationModules.isPublic, true));
          }
        } else {
          query = query.where(eq(schema.applicationModules.isPublic, true));
        }
      }
    }
    
    const modules = await query.orderBy(schema.applicationModules.displayName);
    
    res.status(200).json({ success: true, modules });
  } catch (error) {
    console.error("Erreur lors de la récupération des modules:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
}

// Crée ou met à jour un module
export async function upsertModule(req: Request, res: Response) {
  try {
    // Vérifier les droits d'administrateur
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Non authentifié" });
    }

    const isUserAdmin = await isAdmin(req.user.id);
    if (!isUserAdmin) {
      return res.status(403).json({ success: false, message: "Accès non autorisé. Rôle administrateur requis." });
    }
    
    const moduleData = req.body;
    
    if (!moduleData.name || !moduleData.displayName || !moduleData.path || !moduleData.category) {
      return res.status(400).json({ 
        success: false, 
        message: "Veuillez fournir toutes les informations requises (name, displayName, path, category)" 
      });
    }
    
    // Vérifier si le module existe déjà
    const [existingModule] = await db
      .select()
      .from(schema.applicationModules)
      .where(
        moduleData.id 
          ? eq(schema.applicationModules.id, moduleData.id)
          : eq(schema.applicationModules.name, moduleData.name)
      );
    
    let module;
    
    if (existingModule) {
      // Mettre à jour le module existant
      [module] = await db
        .update(schema.applicationModules)
        .set({
          displayName: moduleData.displayName,
          description: moduleData.description,
          category: moduleData.category,
          path: moduleData.path,
          icon: moduleData.icon,
          isPublic: moduleData.isPublic,
          requiredRole: moduleData.requiredRole,
          updatedAt: new Date()
        })
        .where(eq(schema.applicationModules.id, existingModule.id))
        .returning();
      
      res.status(200).json({ success: true, module, message: "Module mis à jour avec succès" });
    } else {
      // Créer un nouveau module
      [module] = await db
        .insert(schema.applicationModules)
        .values({
          name: moduleData.name,
          displayName: moduleData.displayName,
          description: moduleData.description,
          category: moduleData.category,
          path: moduleData.path,
          icon: moduleData.icon,
          isPublic: moduleData.isPublic || false,
          requiredRole: moduleData.requiredRole || "user"
        })
        .returning();
      
      res.status(201).json({ success: true, module, message: "Module créé avec succès" });
    }
  } catch (error) {
    console.error("Erreur lors de la création/mise à jour du module:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
}

// Supprime un module
export async function deleteModule(req: Request, res: Response) {
  try {
    // Vérifier les droits d'administrateur
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Non authentifié" });
    }

    const isUserAdmin = await isAdmin(req.user.id);
    if (!isUserAdmin) {
      return res.status(403).json({ success: false, message: "Accès non autorisé. Rôle administrateur requis." });
    }
    
    const moduleId = req.params.moduleId;
    if (!moduleId) {
      return res.status(400).json({ success: false, message: "ID du module requis" });
    }
    
    // Vérifier si le module existe
    const [existingModule] = await db
      .select()
      .from(schema.applicationModules)
      .where(eq(schema.applicationModules.id, parseInt(moduleId)));
    
    if (!existingModule) {
      return res.status(404).json({ success: false, message: "Module non trouvé" });
    }
    
    // Supprimer d'abord les références dans temporaryAccessModules
    await db
      .delete(schema.temporaryAccessModules)
      .where(eq(schema.temporaryAccessModules.moduleId, parseInt(moduleId)));
    
    // Supprimer le module
    await db
      .delete(schema.applicationModules)
      .where(eq(schema.applicationModules.id, parseInt(moduleId)));
    
    res.status(200).json({ success: true, message: "Module supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du module:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
}

// Récupère la liste des accès temporaires
export async function getTemporaryAccesses(req: Request, res: Response) {
  try {
    // Vérifier les droits d'administrateur
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Non authentifié" });
    }

    const isUserAdmin = await isAdmin(req.user.id);
    if (!isUserAdmin) {
      return res.status(403).json({ success: false, message: "Accès non autorisé. Rôle administrateur requis." });
    }
    
    const { status, email } = req.query;
    
    let query = db.select().from(schema.temporaryAccesses);
    
    // Filtrer par statut si spécifié
    if (status && ['active', 'expired', 'revoked'].includes(status as string)) {
      query = query.where(eq(schema.temporaryAccesses.status, status as any));
    }
    
    // Filtrer par email si spécifié
    if (email) {
      query = query.where(sql`LOWER(${schema.temporaryAccesses.email}) LIKE LOWER(${`%${email}%`})`);
    }
    
    const temporaryAccesses = await query.orderBy(schema.temporaryAccesses.createdAt);
    
    // Pour chaque accès, récupérer la liste des modules associés
    const accessesWithModules = await Promise.all(
      temporaryAccesses.map(async (access) => {
        const modules = await db
          .select({
            moduleId: schema.applicationModules.id,
            name: schema.applicationModules.name,
            displayName: schema.applicationModules.displayName,
            path: schema.applicationModules.path
          })
          .from(schema.temporaryAccessModules)
          .innerJoin(
            schema.applicationModules, 
            eq(schema.temporaryAccessModules.moduleId, schema.applicationModules.id)
          )
          .where(eq(schema.temporaryAccessModules.temporaryAccessId, access.id));
        
        return {
          ...access,
          modules
        };
      })
    );
    
    res.status(200).json({ success: true, temporaryAccesses: accessesWithModules });
  } catch (error) {
    console.error("Erreur lors de la récupération des accès temporaires:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
}

// Crée un nouvel accès temporaire
export async function createTemporaryAccess(req: Request, res: Response) {
  try {
    // Vérifier les droits d'administrateur
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Non authentifié" });
    }

    const isUserAdmin = await isAdmin(req.user.id);
    if (!isUserAdmin) {
      return res.status(403).json({ success: false, message: "Accès non autorisé. Rôle administrateur requis." });
    }
    
    const { email, role, expiresAt, notes, moduleIds } = req.body;
    
    if (!email || !expiresAt || !moduleIds || !Array.isArray(moduleIds) || moduleIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Veuillez fournir toutes les informations requises (email, expiresAt, moduleIds)" 
      });
    }
    
    // Vérifier que tous les modules existent
    const modules = await db
      .select()
      .from(schema.applicationModules)
      .where(sql`${schema.applicationModules.id} IN (${moduleIds.join(', ')})`);
    
    if (modules.length !== moduleIds.length) {
      return res.status(400).json({ 
        success: false, 
        message: "Certains modules spécifiés n'existent pas" 
      });
    }
    
    // Vérifier si un accès temporaire existe déjà pour cet email
    const [existingAccess] = await db
      .select()
      .from(schema.temporaryAccesses)
      .where(
        and(
          eq(schema.temporaryAccesses.email, email),
          eq(schema.temporaryAccesses.status, "active")
        )
      );
    
    let temporaryAccess;
    
    if (existingAccess) {
      // Mettre à jour l'accès existant
      [temporaryAccess] = await db
        .update(schema.temporaryAccesses)
        .set({
          role: role || existingAccess.role,
          expiresAt: new Date(expiresAt),
          notes: notes || existingAccess.notes,
          status: "active"
        })
        .where(eq(schema.temporaryAccesses.id, existingAccess.id))
        .returning();
      
      // Supprimer les associations de modules existantes
      await db
        .delete(schema.temporaryAccessModules)
        .where(eq(schema.temporaryAccessModules.temporaryAccessId, existingAccess.id));
    } else {
      // Créer un nouvel accès temporaire
      [temporaryAccess] = await db
        .insert(schema.temporaryAccesses)
        .values({
          email,
          role: role || "tester",
          expiresAt: new Date(expiresAt),
          notes,
          createdBy: req.user.id,
          status: "active"
        })
        .returning();
    }
    
    // Ajouter les associations de modules
    const moduleAssociations = moduleIds.map(moduleId => ({
      temporaryAccessId: temporaryAccess.id,
      moduleId: parseInt(moduleId)
    }));
    
    await db
      .insert(schema.temporaryAccessModules)
      .values(moduleAssociations);
    
    // Récupérer les détails des modules pour la réponse
    const accessModules = await db
      .select({
        moduleId: schema.applicationModules.id,
        name: schema.applicationModules.name,
        displayName: schema.applicationModules.displayName,
        path: schema.applicationModules.path
      })
      .from(schema.temporaryAccessModules)
      .innerJoin(
        schema.applicationModules, 
        eq(schema.temporaryAccessModules.moduleId, schema.applicationModules.id)
      )
      .where(eq(schema.temporaryAccessModules.temporaryAccessId, temporaryAccess.id));
    
    // Envoyer un email d'invitation
    await sendInvitationEmail(temporaryAccess, accessModules);
    
    res.status(201).json({ 
      success: true, 
      temporaryAccess: { ...temporaryAccess, modules: accessModules }, 
      message: "Accès temporaire créé avec succès" 
    });
  } catch (error) {
    console.error("Erreur lors de la création d'un accès temporaire:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
}

// Met à jour un accès temporaire
export async function updateTemporaryAccess(req: Request, res: Response) {
  try {
    // Vérifier les droits d'administrateur
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Non authentifié" });
    }

    const isUserAdmin = await isAdmin(req.user.id);
    if (!isUserAdmin) {
      return res.status(403).json({ success: false, message: "Accès non autorisé. Rôle administrateur requis." });
    }
    
    const accessId = req.params.accessId;
    if (!accessId) {
      return res.status(400).json({ success: false, message: "ID de l'accès temporaire requis" });
    }
    
    const { status, expiresAt, notes, moduleIds } = req.body;
    
    // Vérifier si l'accès existe
    const [existingAccess] = await db
      .select()
      .from(schema.temporaryAccesses)
      .where(eq(schema.temporaryAccesses.id, parseInt(accessId)));
    
    if (!existingAccess) {
      return res.status(404).json({ success: false, message: "Accès temporaire non trouvé" });
    }
    
    // Mettre à jour l'accès temporaire
    const updateData: Partial<schema.TemporaryAccess> = {};
    if (status && ['active', 'expired', 'revoked'].includes(status)) {
      updateData.status = status as any;
    }
    if (expiresAt) {
      updateData.expiresAt = new Date(expiresAt);
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    
    const [updatedAccess] = await db
      .update(schema.temporaryAccesses)
      .set(updateData)
      .where(eq(schema.temporaryAccesses.id, parseInt(accessId)))
      .returning();
    
    // Mettre à jour les modules associés si spécifiés
    if (moduleIds && Array.isArray(moduleIds)) {
      // Vérifier que tous les modules existent
      const modules = await db
        .select()
        .from(schema.applicationModules)
        .where(sql`${schema.applicationModules.id} IN (${moduleIds.join(', ')})`);
      
      if (modules.length !== moduleIds.length) {
        return res.status(400).json({ 
          success: false, 
          message: "Certains modules spécifiés n'existent pas" 
        });
      }
      
      // Supprimer les associations existantes
      await db
        .delete(schema.temporaryAccessModules)
        .where(eq(schema.temporaryAccessModules.temporaryAccessId, parseInt(accessId)));
      
      // Ajouter les nouvelles associations
      const moduleAssociations = moduleIds.map(moduleId => ({
        temporaryAccessId: parseInt(accessId),
        moduleId: parseInt(moduleId)
      }));
      
      await db
        .insert(schema.temporaryAccessModules)
        .values(moduleAssociations);
    }
    
    // Récupérer les détails des modules pour la réponse
    const accessModules = await db
      .select({
        moduleId: schema.applicationModules.id,
        name: schema.applicationModules.name,
        displayName: schema.applicationModules.displayName,
        path: schema.applicationModules.path
      })
      .from(schema.temporaryAccessModules)
      .innerJoin(
        schema.applicationModules, 
        eq(schema.temporaryAccessModules.moduleId, schema.applicationModules.id)
      )
      .where(eq(schema.temporaryAccessModules.temporaryAccessId, parseInt(accessId)));
    
    res.status(200).json({ 
      success: true, 
      temporaryAccess: { ...updatedAccess, modules: accessModules }, 
      message: "Accès temporaire mis à jour avec succès" 
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour d'un accès temporaire:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
}

// Révoque un accès temporaire
export async function revokeTemporaryAccess(req: Request, res: Response) {
  try {
    // Vérifier les droits d'administrateur
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Non authentifié" });
    }

    const isUserAdmin = await isAdmin(req.user.id);
    if (!isUserAdmin) {
      return res.status(403).json({ success: false, message: "Accès non autorisé. Rôle administrateur requis." });
    }
    
    const accessId = req.params.accessId;
    if (!accessId) {
      return res.status(400).json({ success: false, message: "ID de l'accès temporaire requis" });
    }
    
    // Vérifier si l'accès existe
    const [existingAccess] = await db
      .select()
      .from(schema.temporaryAccesses)
      .where(eq(schema.temporaryAccesses.id, parseInt(accessId)));
    
    if (!existingAccess) {
      return res.status(404).json({ success: false, message: "Accès temporaire non trouvé" });
    }
    
    // Mettre à jour le statut de l'accès temporaire
    const [updatedAccess] = await db
      .update(schema.temporaryAccesses)
      .set({
        status: "revoked"
      })
      .where(eq(schema.temporaryAccesses.id, parseInt(accessId)))
      .returning();
    
    res.status(200).json({ 
      success: true, 
      temporaryAccess: updatedAccess, 
      message: "Accès temporaire révoqué avec succès" 
    });
  } catch (error) {
    console.error("Erreur lors de la révocation d'un accès temporaire:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
}

// Renvoie l'email d'invitation pour un accès temporaire
export async function resendInvitation(req: Request, res: Response) {
  try {
    // Vérifier les droits d'administrateur
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Non authentifié" });
    }

    const isUserAdmin = await isAdmin(req.user.id);
    if (!isUserAdmin) {
      return res.status(403).json({ success: false, message: "Accès non autorisé. Rôle administrateur requis." });
    }
    
    const accessId = req.params.accessId;
    if (!accessId) {
      return res.status(400).json({ success: false, message: "ID de l'accès temporaire requis" });
    }
    
    // Vérifier si l'accès existe
    const [existingAccess] = await db
      .select()
      .from(schema.temporaryAccesses)
      .where(eq(schema.temporaryAccesses.id, parseInt(accessId)));
    
    if (!existingAccess) {
      return res.status(404).json({ success: false, message: "Accès temporaire non trouvé" });
    }
    
    if (existingAccess.status !== "active") {
      return res.status(400).json({ 
        success: false, 
        message: "Impossible de renvoyer une invitation pour un accès inactif" 
      });
    }
    
    // Récupérer les modules associés à cet accès
    const accessModules = await db
      .select({
        moduleId: schema.applicationModules.id,
        name: schema.applicationModules.name,
        displayName: schema.applicationModules.displayName,
        path: schema.applicationModules.path
      })
      .from(schema.temporaryAccessModules)
      .innerJoin(
        schema.applicationModules, 
        eq(schema.temporaryAccessModules.moduleId, schema.applicationModules.id)
      )
      .where(eq(schema.temporaryAccessModules.temporaryAccessId, existingAccess.id));
    
    // Envoyer l'email d'invitation
    await sendInvitationEmail(existingAccess, accessModules);
    
    res.status(200).json({ 
      success: true, 
      message: "Invitation renvoyée avec succès" 
    });
  } catch (error) {
    console.error("Erreur lors du renvoi de l'invitation:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
}

// Fonction utilitaire pour envoyer un email d'invitation
async function sendInvitationEmail(
  temporaryAccess: schema.TemporaryAccess, 
  modules: { moduleId: number, name: string, displayName: string, path: string }[]
) {
  try {
    // Configurer le transporteur d'email
    // En production, vous utiliseriez un vrai service d'envoi d'emails
    // Pour le développement, on utilise Ethereal pour tester
    let testAccount = await nodemailer.createTestAccount();
    
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    // Générer le contenu HTML de l'email
    const modulesList = modules.map(m => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${m.displayName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">
          <a href="https://votredomaine.com${m.path}" style="color: #3498db; text-decoration: none;">
            Accéder au module
          </a>
        </td>
      </tr>
    `).join('');
    
    // Format de date français
    const expiresAtDate = temporaryAccess.expiresAt.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        <div style="background-color: #3498db; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Invitation mc2i Learning</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Bonjour,</p>
          
          <p>Vous avez reçu un accès temporaire à des modules de formation sur la plateforme mc2i Learning.</p>
          
          <p><strong>Détails de l'accès :</strong></p>
          <ul>
            <li>Email : ${temporaryAccess.email}</li>
            <li>Date d'expiration : ${expiresAtDate}</li>
            <li>Code d'invitation : ${temporaryAccess.invitationCode}</li>
          </ul>
          
          <p><strong>Modules accessibles :</strong></p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #ddd;">Module</th>
              <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #ddd;">Lien</th>
            </tr>
            ${modulesList}
          </table>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
            <p style="margin: 0;">Pour accéder à ces modules, veuillez vous connecter à la plateforme en utilisant votre adresse email et le code d'invitation fourni ci-dessus.</p>
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <a href="https://votredomaine.com/login" style="background-color: #3498db; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Se connecter à la plateforme
            </a>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #777;">
          <p>Ce message a été envoyé automatiquement. Merci de ne pas y répondre.</p>
          <p>© 2025 mc2i Learning. Tous droits réservés.</p>
        </div>
      </div>
    `;
    
    // Envoyer l'email
    let info = await transporter.sendMail({
      from: '"mc2i Learning" <noreply@mc2i.fr>',
      to: temporaryAccess.email,
      subject: "Invitation - Accès temporaire mc2i Learning",
      html: htmlEmail,
    });
    
    console.log("Email d'invitation envoyé: %s", info.messageId);
    console.log("Aperçu de l'email: %s", nodemailer.getTestMessageUrl(info));
    
    return info;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email d'invitation:", error);
    throw error;
  }
}

// Vérifier si un accès temporaire est valide
export async function verifyTemporaryAccess(req: Request, res: Response) {
  try {
    const { email, invitationCode } = req.body;
    
    if (!email || !invitationCode) {
      return res.status(400).json({ 
        success: false, 
        message: "Veuillez fournir l'email et le code d'invitation" 
      });
    }
    
    // Vérifier si l'accès existe et est actif
    const [temporaryAccess] = await db
      .select()
      .from(schema.temporaryAccesses)
      .where(
        and(
          eq(schema.temporaryAccesses.email, email),
          eq(schema.temporaryAccesses.invitationCode, invitationCode),
          eq(schema.temporaryAccesses.status, "active"),
          gt(schema.temporaryAccesses.expiresAt, new Date())
        )
      );
    
    if (!temporaryAccess) {
      return res.status(404).json({ 
        success: false, 
        message: "Accès temporaire invalide ou expiré" 
      });
    }
    
    // Incrémenter le compteur d'accès
    await db
      .update(schema.temporaryAccesses)
      .set({
        accessCount: temporaryAccess.accessCount + 1,
        lastLogin: new Date()
      })
      .where(eq(schema.temporaryAccesses.id, temporaryAccess.id));
    
    // Récupérer les modules accessibles
    const modules = await db
      .select({
        moduleId: schema.applicationModules.id,
        name: schema.applicationModules.name,
        displayName: schema.applicationModules.displayName,
        path: schema.applicationModules.path,
        category: schema.applicationModules.category,
        description: schema.applicationModules.description,
        icon: schema.applicationModules.icon
      })
      .from(schema.temporaryAccessModules)
      .innerJoin(
        schema.applicationModules, 
        eq(schema.temporaryAccessModules.moduleId, schema.applicationModules.id)
      )
      .where(eq(schema.temporaryAccessModules.temporaryAccessId, temporaryAccess.id))
      .orderBy(schema.applicationModules.category, schema.applicationModules.displayName);
    
    // Regrouper les modules par catégorie
    const modulesByCategory = modules.reduce((acc, module) => {
      if (!acc[module.category]) {
        acc[module.category] = [];
      }
      acc[module.category].push(module);
      return acc;
    }, {});
    
    res.status(200).json({ 
      success: true, 
      temporaryAccess: {
        id: temporaryAccess.id,
        email: temporaryAccess.email,
        role: temporaryAccess.role,
        expiresAt: temporaryAccess.expiresAt,
        modules: modulesByCategory
      }
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de l'accès temporaire:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
}

// Interface d'installation pour initialiser les modules de base
export async function initializeApplicationModules(req: Request, res: Response) {
  try {
    // Vérifier les droits d'administrateur
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Non authentifié" });
    }

    const isUserAdmin = await isAdmin(req.user.id);
    if (!isUserAdmin) {
      return res.status(403).json({ success: false, message: "Accès non autorisé. Rôle administrateur requis." });
    }
    
    // Vérifier si des modules existent déjà
    const existingModules = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.applicationModules);
    
    if (existingModules[0].count > 0) {
      return res.status(409).json({ 
        success: false, 
        message: "Des modules existent déjà dans la base de données" 
      });
    }
    
    // Liste des modules à créer - utiliser schema.userRoleEnum.enumValues pour le typage sûr
    const modulesToCreate = [
      {
        name: "cyber-escape",
        displayName: "CyberEscape",
        description: "Simulation d'entreprise interactive pour apprendre la cybersécurité en pratique.",
        category: "Cyber Arcade",
        path: "/cyber/arcade/cyber-escape",
        icon: "game-controller",
        isPublic: false,
        requiredRole: schema.userRoleEnum.enumValues[0] // "user"
      },
      {
        name: "amoa-test-reflexes",
        displayName: "Test de Réflexes AMOA",
        description: "Testez vos connaissances et réflexes sur les bonnes pratiques AMOA.",
        category: "AMOA",
        path: "/amoa/test-reflexes",
        icon: "brain",
        isPublic: false,
        requiredRole: schema.userRoleEnum.enumValues[0] // "user"
      },
      {
        name: "projet-imposteur",
        displayName: "Le Projet Imposteur",
        description: "Jeu d'investigation pour identifier un imposteur dans une équipe projet.",
        category: "AMOA",
        path: "/amoa/projet-imposteur",
        icon: "user-x",
        isPublic: false,
        requiredRole: schema.userRoleEnum.enumValues[0] // "user"
      },
      {
        name: "mc2i-learning",
        displayName: "mc2i Learning",
        description: "Assistant IA spécialisé dans la formation et l'apprentissage.",
        category: "Outils IA",
        path: "/outils-ia/mc2i-learning",
        icon: "bot",
        isPublic: false,
        requiredRole: schema.userRoleEnum.enumValues[0] // "user"
      },
      {
        name: "code-generator",
        displayName: "Générateur de Code",
        description: "Générez rapidement du code Python, SQL et Excel.",
        category: "Outils IA",
        path: "/outils-ia/code-generator",
        icon: "code",
        isPublic: false,
        requiredRole: schema.userRoleEnum.enumValues[0] // "user"
      }
    ];
    
    // Insérer les modules
    await db.insert(schema.applicationModules).values(modulesToCreate);
    
    res.status(201).json({ 
      success: true, 
      message: "Modules initialisés avec succès", 
      count: modulesToCreate.length 
    });
  } catch (error) {
    console.error("Erreur lors de l'initialisation des modules:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
}

// Promouvoir un utilisateur au rôle d'administrateur
export async function promoteToAdmin(req: Request, res: Response) {
  try {
    // Si aucun admin n'existe encore, permettre cette opération sans vérification
    // Sinon, vérifier les droits d'administrateur
    const adminCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.userProfiles)
      .where(eq(schema.userProfiles.role, "admin"));
    
    const firstAdminSetup = adminCount[0].count === 0;
    
    if (!firstAdminSetup) {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: "Non authentifié" });
      }
      
      const isUserAdmin = await isAdmin(req.user.id);
      if (!isUserAdmin) {
        return res.status(403).json({ success: false, message: "Accès non autorisé. Rôle administrateur requis." });
      }
    }
    
    const { userId, secret } = req.body;
    
    // Pour la première configuration d'admin, exiger un secret spécial
    if (firstAdminSetup) {
      // Le secret devrait être une valeur complexe stockée en variable d'environnement
      const adminSecret = process.env.ADMIN_SETUP_SECRET || "mc2i-admin-secret-2025";
      if (secret !== adminSecret) {
        return res.status(403).json({ success: false, message: "Secret invalide pour la configuration initiale" });
      }
    }
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "ID utilisateur requis" });
    }
    
    // Vérifier si l'utilisateur existe
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, parseInt(userId)));
    
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }
    
    // Vérifier si un profil existe pour cet utilisateur
    let userProfile = await db
      .select()
      .from(schema.userProfiles)
      .where(eq(schema.userProfiles.userId, parseInt(userId)));
    
    if (userProfile.length === 0) {
      // Créer un profil s'il n'existe pas
      [userProfile[0]] = await db
        .insert(schema.userProfiles)
        .values({
          userId: parseInt(userId),
          role: "admin"
        })
        .returning();
    } else {
      // Mettre à jour le profil existant
      [userProfile[0]] = await db
        .update(schema.userProfiles)
        .set({
          role: "admin"
        })
        .where(eq(schema.userProfiles.userId, parseInt(userId)))
        .returning();
    }
    
    res.status(200).json({ 
      success: true, 
      userProfile: userProfile[0], 
      message: "Utilisateur promu administrateur avec succès" 
    });
  } catch (error) {
    console.error("Erreur lors de la promotion d'un utilisateur:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
}

// Fonction pour initialiser le super utilisateur
export async function initializeSuperAdmin(req: Request, res: Response) {
  try {
    // Vérifier si un super admin existe déjà
    const existingConfig = await db
      .select()
      .from(schema.systemConfiguration)
      .limit(1);
    
    if (existingConfig.length > 0 && existingConfig[0].setupComplete) {
      return res.status(409).json({ 
        success: false, 
        message: "La configuration système est déjà complète. Impossible de réinitialiser le super administrateur." 
      });
    }
    
    const { username, password } = req.body;
    
    if (!username || !password || username.length < 3 || password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "Veuillez fournir un nom d'utilisateur (min. 3 caractères) et un mot de passe (min. 8 caractères)" 
      });
    }
    
    // Hacher le mot de passe
    const hashedPassword = await hashPassword(password);
    
    // Supprimer toute configuration existante
    await db.delete(schema.systemConfiguration);
    
    // Créer la nouvelle configuration système avec le super admin
    const [config] = await db
      .insert(schema.systemConfiguration)
      .values({
        superAdminUsername: username,
        superAdminPasswordHash: hashedPassword,
        setupComplete: true,
        allowExternalUsers: true
      })
      .returning();
    
    // Créer ou obtenir l'utilisateur correspondant
    let user;
    
    const [existingUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username));
    
    if (existingUser) {
      user = existingUser;
    } else {
      [user] = await db
        .insert(schema.users)
        .values({
          username: username,
          password: hashedPassword
        })
        .returning();
    }
    
    // Créer ou mettre à jour le profil utilisateur pour qu'il soit super admin
    const [existingProfile] = await db
      .select()
      .from(schema.userProfiles)
      .where(eq(schema.userProfiles.userId, user.id));
    
    if (existingProfile) {
      await db
        .update(schema.userProfiles)
        .set({
          role: "superadmin",
          updatedAt: new Date()
        })
        .where(eq(schema.userProfiles.userId, user.id));
    } else {
      await db
        .insert(schema.userProfiles)
        .values({
          userId: user.id,
          displayName: "Super Administrateur",
          role: "superadmin"
        });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Super Administrateur créé avec succès",
      userId: user.id
    });
  } catch (error) {
    console.error("Erreur lors de l'initialisation du super administrateur:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
}

// Authentification du super utilisateur
export async function authenticateSuperAdmin(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Nom d'utilisateur et mot de passe requis" });
    }
    
    // Récupérer la configuration système
    const [config] = await db
      .select()
      .from(schema.systemConfiguration)
      .limit(1);
    
    if (!config) {
      return res.status(404).json({ 
        success: false, 
        setupRequired: true,
        message: "Configuration système non trouvée. Configuration initiale requise." 
      });
    }
    
    // Vérifier les identifiants du super admin
    if (username !== config.superAdminUsername) {
      return res.status(401).json({ success: false, message: "Identifiants invalides" });
    }
    
    const passwordMatch = await comparePasswords(password, config.superAdminPasswordHash);
    
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Identifiants invalides" });
    }
    
    // Récupérer l'utilisateur correspondant
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username));
    
    if (!user) {
      return res.status(500).json({ 
        success: false, 
        message: "Erreur de configuration: utilisateur super admin introuvable" 
      });
    }
    
    // Vérifier que la session est disponible
    if (!req.session) {
      console.error("Session non initialisée");
      return res.status(500).json({ 
        success: false, 
        message: "Erreur interne du serveur: session non disponible" 
      });
    }
    
    // Mettre à jour la session pour indiquer que l'utilisateur est connecté
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.isAuthenticated = true;
    req.session.isSuperAdmin = true;
    
    // Sauvegarder la session
    req.session.save(err => {
      if (err) {
        console.error("Erreur lors de la sauvegarde de la session:", err);
        return res.status(500).json({ success: false, message: "Erreur lors de la connexion" });
      }
      
      res.status(200).json({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          role: "superadmin"
        }, 
        message: "Authentification réussie" 
      });
    });
  } catch (error) {
    console.error("Erreur lors de l'authentification du super admin:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
}

/**
 * Déconnecte l'utilisateur super administrateur
 */
export async function logoutSuperAdmin(req: Request, res: Response) {
  try {
    // Vérifier que la session est disponible
    if (!req.session) {
      console.error("Session non initialisée");
      return res.status(500).json({ 
        success: false, 
        message: "Erreur interne du serveur: session non disponible" 
      });
    }
    
    // Détruire la session
    req.session.destroy((err) => {
      if (err) {
        console.error("Erreur lors de la déconnexion:", err);
        return res.status(500).json({ success: false, message: "Erreur lors de la déconnexion" });
      }
      
      res.status(200).json({ 
        success: true, 
        message: "Déconnexion réussie" 
      });
    });
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
}

// Vérifier l'état d'initialisation du système
export async function checkSystemSetup(req: Request, res: Response) {
  try {
    const [config] = await db
      .select()
      .from(schema.systemConfiguration)
      .limit(1);
    
    if (!config) {
      return res.status(200).json({
        success: true,
        setupComplete: false,
        message: "Le système nécessite une configuration initiale"
      });
    }
    
    res.status(200).json({
      success: true,
      setupComplete: config.setupComplete,
      message: config.setupComplete 
        ? "La configuration système est complète" 
        : "Le système nécessite une configuration supplémentaire"
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de la configuration système:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
}

export default {
  checkAdminAccess,
  checkSuperAdminAccess,
  isAdmin,
  isSuperAdmin,
  hasModuleAccess,
  getModules,
  upsertModule,
  deleteModule,
  getTemporaryAccesses,
  createTemporaryAccess,
  updateTemporaryAccess,
  revokeTemporaryAccess,
  resendInvitation,
  verifyTemporaryAccess,
  initializeApplicationModules,
  promoteToAdmin,
  initializeSuperAdmin,
  authenticateSuperAdmin,
  logoutSuperAdmin,
  checkSystemSetup
};