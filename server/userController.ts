import { Request, Response } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * Récupère ou crée un utilisateur en fonction du nom d'utilisateur fourni
 * Cette fonction est cruciale pour assurer la persistance des données utilisateur
 * sans nécessiter d'authentification complète pour la démo
 */
export async function getOrCreateUser(req: Request, res: Response) {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Nom d\'utilisateur requis'
      });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    // Si l'utilisateur existe, renvoyer son ID
    if (existingUser.length > 0) {
      return res.json({
        success: true,
        userId: existingUser[0].id,
        message: 'Utilisateur existant récupéré'
      });
    }
    
    // Sinon, créer un nouvel utilisateur
    const [newUser] = await db.insert(users)
      .values({
        username,
        // Utiliser un mot de passe par défaut sécurisé pour la démo
        // En production, il faudrait utiliser un système d'authentification complet
        password: uuidv4(), // Mot de passe aléatoire pour chaque utilisateur
      })
      .returning({ id: users.id });
    
    return res.status(201).json({
      success: true,
      userId: newUser.id,
      message: 'Nouvel utilisateur créé'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération/création de l\'utilisateur:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération/création de l\'utilisateur'
    });
  }
}

/**
 * Récupère les informations d'un utilisateur par son ID
 */
export async function getUserById(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    if (!userId || isNaN(Number(userId))) {
      return res.status(400).json({
        success: false,
        error: 'ID utilisateur invalide'
      });
    }
    
    const user = await db.select({
      id: users.id,
      username: users.username,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .where(eq(users.id, Number(userId)))
    .limit(1);
    
    if (!user.length) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }
    
    return res.json({
      success: true,
      user: user[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'utilisateur'
    });
  }
}