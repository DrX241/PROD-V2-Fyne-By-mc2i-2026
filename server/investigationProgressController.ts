import { Request, Response } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from './db';
import { v4 as uuidv4 } from 'uuid';
import { investigationProgress, type InsertInvestigationProgress } from '@shared/schema';
import { openAIService } from './services/openai';
import { ChatCompletionRequestMessage } from '@shared/schema';

/**
 * Récupère la progression d'un utilisateur dans un jeu d'investigation spécifique
 */
export async function getInvestigationProgress(req: Request, res: Response) {
  try {
    const { userId, gameId, sessionId } = req.params;

    if (!userId || !gameId) {
      return res.status(400).json({ error: 'userId et gameId sont requis' });
    }

    let query = db.select()
      .from(investigationProgress)
      .where(
        and(
          eq(investigationProgress.userId, userId),
          eq(investigationProgress.gameId, gameId)
        )
      );
    
    // Si sessionId est fourni, ajouter un filtre supplémentaire dans la clause where
    if (sessionId) {
      const progress = await query;
      // Si sessionId est fourni, filtrer les résultats
      const filteredProgress = progress.filter(p => p.sessionId === sessionId);
      return filteredProgress.length === 0 
        ? res.status(200).json({ 
            progress: {
              userId,
              gameId,
              currentLevel: 'Débutant',
              score: 0,
              bestScore: 0,
              completedScenarios: [],
              attempts: 0,
              lastFeedback: {},
              sessionId: sessionId
            } 
          })
        : res.status(200).json({ progress: filteredProgress[0] });
    }

    const progress = await query;

    if (progress.length === 0) {
      // Pour un nouvel utilisateur, renvoyer un objet vide mais pas d'erreur
      return res.status(200).json({ 
        progress: {
          userId,
          gameId,
          currentLevel: 'Débutant',
          score: 0,
          bestScore: 0,
          completedScenarios: [],
          attempts: 0,
          lastFeedback: {},
          sessionId: sessionId || uuidv4()
        } 
      });
    }

    return res.status(200).json({ progress: progress[0] });
  } catch (error) {
    console.error('Erreur lors de la récupération de la progression du jeu:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * Enregistre ou met à jour la progression d'un utilisateur
 */
export async function saveInvestigationProgress(req: Request, res: Response) {
  try {
    const { 
      userId, 
      userName, 
      gameId, 
      currentLevel,
      score,
      bestScore,
      completedScenarios,
      attempts,
      lastFeedback,
      sessionId
    } = req.body;

    if (!userId || !userName || !gameId || !sessionId) {
      return res.status(400).json({ error: 'userId, userName, gameId et sessionId sont requis' });
    }

    // Vérifier si une progression existe déjà pour cette session
    const existingProgress = await db.select()
      .from(investigationProgress)
      .where(
        and(
          eq(investigationProgress.userId, userId),
          eq(investigationProgress.gameId, gameId),
          eq(investigationProgress.sessionId, sessionId)
        )
      );

    let result;
    if (existingProgress.length > 0) {
      // Mise à jour
      result = await db.update(investigationProgress)
        .set({
          currentLevel,
          score,
          bestScore: Math.max(bestScore, existingProgress[0].bestScore),
          completedScenarios,
          attempts,
          lastFeedback,
          lastUpdated: new Date()
        })
        .where(
          and(
            eq(investigationProgress.userId, userId),
            eq(investigationProgress.gameId, gameId),
            eq(investigationProgress.sessionId, sessionId)
          )
        )
        .returning();
    } else {
      // Création
      const newProgress: InsertInvestigationProgress = {
        userId,
        userName,
        gameId,
        currentLevel: currentLevel || 'Débutant',
        score: score || 0,
        bestScore: bestScore || 0,
        completedScenarios: completedScenarios || [],
        attempts: attempts || 1,
        lastFeedback: lastFeedback || {},
        sessionId,
        lastUpdated: new Date()
      };

      result = await db.insert(investigationProgress).values(newProgress).returning();
    }

    return res.status(200).json({ 
      success: true, 
      progress: result[0],
      message: 'Progression sauvegardée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la progression du jeu:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * Évalue les notes de l'utilisateur et détermine s'il peut passer au niveau supérieur
 */
export async function evaluateUserNotes(req: Request, res: Response) {
  try {
    const { 
      userId, 
      gameId, 
      currentLevel,
      notes,
      evidencesAnalyzed,
      totalEvidences,
      accusedSuspect,
      correctSuspect,
      suspects,
      sessionId
    } = req.body;

    if (!userId || !gameId || !notes || !sessionId) {
      return res.status(400).json({ 
        error: 'Paramètres manquants', 
        details: 'userId, gameId, notes et sessionId sont requis' 
      });
    }

    // Construction du prompt pour l'évaluation IA des notes
    const messages: ChatCompletionRequestMessage[] = [
      {
        role: "system",
        content: `Tu es un expert en investigation numérique et en cybersécurité, chargé d'évaluer les notes 
        prises par un apprenant lors d'une enquête sur une fuite de données.
        
        Tu dois évaluer ces notes selon plusieurs critères:
        1. Pertinence des observations par rapport au cas
        2. Capacité à identifier les indices clés dans les preuves
        3. Rigueur et méthodologie d'investigation
        4. Capacité à faire des liens entre différentes preuves
        5. Formulation d'hypothèses et raisonnement logique
        
        Niveau actuel de l'apprenant: ${currentLevel || 'Débutant'}
        
        En fonction de ton évaluation et du niveau actuel, tu dois déterminer:
        - Si l'apprenant peut passer au niveau supérieur (de Débutant à Intermédiaire, ou d'Intermédiaire à Expert)
        - Les points forts des notes
        - Les points à améliorer
        - Des conseils spécifiques pour progresser
        
        Réponds au format JSON avec les champs suivants:
        {
          "evaluation": {
            "score": (note sur 100),
            "strengths": [(points forts, max 3)],
            "weaknesses": [(points à améliorer, max 3)],
            "advice": [(conseils, max 3)]
          },
          "progression": {
            "canLevelUp": true/false,
            "recommendedLevel": "Débutant"/"Intermédiaire"/"Expert",
            "justification": (explication de la décision)
          }
        }`
      },
      {
        role: "user",
        content: `Voici les notes que j'ai prises lors de mon enquête sur une fuite de données:
        
        ${notes}
        
        Informations complémentaires:
        - J'ai analysé ${evidencesAnalyzed || 0} preuves sur un total de ${totalEvidences || 0}
        - J'ai accusé le suspect: ${accusedSuspect || 'Non spécifié'}
        - ${correctSuspect ? `Le coupable réel était: ${correctSuspect}` : ''}
        
        Merci d'évaluer mes notes et de déterminer si je peux passer au niveau supérieur.`
      }
    ];

    // Appel à l'API OpenAI
    const evaluationContent = await openAIService.getChatCompletion(
      messages,
      0.7,
      1500
    );

    // Extraire le JSON de la réponse
    let parsedEvaluation;
    try {
      // Rechercher d'abord les délimiteurs de code JSON
      const jsonMatch = evaluationContent.match(/```json\s*([\s\S]*?)\s*```|```\s*([\s\S]*?)\s*```|\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonContent = jsonMatch[1] || jsonMatch[2] || jsonMatch[0];
        parsedEvaluation = JSON.parse(jsonContent);
      } else {
        // Si pas de délimiteurs, essayer de parser directement
        parsedEvaluation = JSON.parse(evaluationContent);
      }
    } catch (jsonError) {
      console.error("Erreur lors du parsing du JSON d'évaluation des notes:", jsonError);
      // Créer une évaluation par défaut
      parsedEvaluation = {
        evaluation: {
          score: 70,
          strengths: ["Bonnes observations générales"],
          weaknesses: ["Pourrait être plus détaillé"],
          advice: ["Prendre des notes plus structurées"]
        },
        progression: {
          canLevelUp: false,
          recommendedLevel: currentLevel || "Débutant",
          justification: "Les notes ne montrent pas encore assez de maîtrise pour passer au niveau supérieur."
        }
      };
    }

    // Récupérer la progression actuelle pour mettre à jour le score
    const existingProgress = await db.select()
      .from(investigationProgress)
      .where(
        and(
          eq(investigationProgress.userId, userId),
          eq(investigationProgress.gameId, gameId),
          eq(investigationProgress.sessionId, sessionId)
        )
      );

    // Mettre à jour la progression avec l'évaluation
    if (existingProgress.length > 0) {
      await db.update(investigationProgress)
        .set({
          score: parsedEvaluation.evaluation.score,
          bestScore: Math.max(parsedEvaluation.evaluation.score, existingProgress[0].bestScore),
          currentLevel: parsedEvaluation.progression.recommendedLevel,
          lastFeedback: parsedEvaluation,
          lastUpdated: new Date()
        })
        .where(
          and(
            eq(investigationProgress.userId, userId),
            eq(investigationProgress.gameId, gameId),
            eq(investigationProgress.sessionId, sessionId)
          )
        );
    } else {
      // Créer une nouvelle entrée si nécessaire
      const newProgress: InsertInvestigationProgress = {
        userId,
        userName: userId, // Fallback
        gameId,
        currentLevel: parsedEvaluation.progression.recommendedLevel,
        score: parsedEvaluation.evaluation.score,
        bestScore: parsedEvaluation.evaluation.score,
        completedScenarios: [],
        attempts: 1,
        lastFeedback: parsedEvaluation,
        sessionId,
        lastUpdated: new Date()
      };

      await db.insert(investigationProgress).values(newProgress);
    }

    return res.status(200).json({
      success: true,
      evaluation: parsedEvaluation
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur lors de l\'évaluation des notes:', error);
    return res.status(500).json({
      error: 'Erreur lors de l\'évaluation des notes',
      details: errorMessage
    });
  }
}