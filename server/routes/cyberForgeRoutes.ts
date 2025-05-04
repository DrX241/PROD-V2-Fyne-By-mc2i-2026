import { Router, Request, Response } from 'express';
import { generateLearningContent, evaluateUserResponse } from '../cyberForgeController';

const router = Router();

/**
 * Génère du contenu d'apprentissage en cybersécurité
 * @route POST /api/ai/generate-learning-content
 */
router.post('/generate-learning-content', async (req: Request, res: Response) => {
  try {
    const { theme, userLevel, learningHistory } = req.body;
    
    if (!theme) {
      return res.status(400).json({ error: 'Le thème est requis' });
    }
    
    const content = await generateLearningContent(theme, userLevel, learningHistory);
    res.json(content);
  } catch (error) {
    console.error('Erreur lors de la génération de contenu:', error);
    res.status(500).json({ error: 'Erreur lors de la génération de contenu' });
  }
});

/**
 * Évalue la réponse d'un utilisateur à une question
 * @route POST /api/ai/evaluate-response
 */
router.post('/evaluate-response', async (req: Request, res: Response) => {
  try {
    const { userResponse, context, expectedConcepts } = req.body;
    
    if (!userResponse || !context) {
      return res.status(400).json({ error: 'La réponse et le contexte sont requis' });
    }
    
    const evaluation = await evaluateUserResponse(userResponse, context, expectedConcepts);
    res.json(evaluation);
  } catch (error) {
    console.error('Erreur lors de l\'évaluation:', error);
    res.status(500).json({ error: 'Erreur lors de l\'évaluation de la réponse' });
  }
});

export default router;