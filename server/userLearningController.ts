import { Request, Response } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from './db';
import { userLearningProgress, type InsertUserLearningProgress } from '@shared/schema';

/**
 * Récupère la progression d'un utilisateur dans un module spécifique
 */
export async function getUserProgress(req: Request, res: Response) {
  try {
    const { userId, moduleId } = req.params;

    if (!userId || !moduleId) {
      return res.status(400).json({ error: 'userId et moduleId sont requis' });
    }

    const progress = await db.select()
      .from(userLearningProgress)
      .where(
        and(
          eq(userLearningProgress.userId, userId),
          eq(userLearningProgress.moduleId, moduleId)
        )
      );

    if (progress.length === 0) {
      return res.status(404).json({ error: 'Progression non trouvée' });
    }

    return res.status(200).json(progress[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération de la progression utilisateur:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * Initialise ou met à jour la progression d'un utilisateur
 */
export async function saveUserProgress(req: Request, res: Response) {
  try {
    const { userId, userName, moduleId, xp, level, completedLevels, badges, stats, rank } = req.body;

    if (!userId || !userName || !moduleId) {
      return res.status(400).json({ error: 'userId, userName et moduleId sont requis' });
    }

    // Vérifier si une progression existe déjà
    const existingProgress = await db.select()
      .from(userLearningProgress)
      .where(
        and(
          eq(userLearningProgress.userId, userId),
          eq(userLearningProgress.moduleId, moduleId)
        )
      );

    let result;
    if (existingProgress.length > 0) {
      // Mise à jour
      result = await db.update(userLearningProgress)
        .set({
          xp,
          level,
          completedLevels,
          badges,
          stats,
          rank,
          lastUpdated: new Date()
        })
        .where(
          and(
            eq(userLearningProgress.userId, userId),
            eq(userLearningProgress.moduleId, moduleId)
          )
        )
        .returning();
    } else {
      // Création
      const newProgress: InsertUserLearningProgress = {
        userId,
        userName,
        moduleId,
        xp: xp || 0,
        level: level || 1,
        completedLevels: completedLevels || [],
        badges: badges || [],
        stats: stats || [],
        rank: rank || 'Débutant',
      };

      result = await db.insert(userLearningProgress)
        .values(newProgress)
        .returning();
    }

    return res.status(200).json(result[0]);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la progression utilisateur:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}