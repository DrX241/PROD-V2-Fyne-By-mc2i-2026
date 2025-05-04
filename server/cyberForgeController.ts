import { Request, Response } from 'express';
import { openAIService } from './services/openai';

/**
 * Interface pour le contenu d'apprentissage
 */
interface LearningContent {
  theme: string;
  level: string;
  sections: {
    title: string;
    content: string;
    type: 'theory' | 'scenario' | 'quiz';
  }[];
  resources: {
    title: string;
    url: string;
    description: string;
  }[];
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
}

/**
 * Génère du contenu d'apprentissage personnalisé basé sur un thème et niveau
 */
export async function generateLearningContent(req: Request, res: Response) {
  try {
    const { theme, level, subtheme } = req.body;

    if (!theme || !level) {
      return res.status(400).json({ message: 'Theme et niveau requis' });
    }

    const prompt = `
    Génère un module d'apprentissage de cybersécurité pour le thème: "${theme}" ${subtheme ? `(sous-thème: "${subtheme}")` : ''} 
    avec un niveau de difficulté: "${level}".
    
    Le contenu doit être structuré en français et inclure:
    1. Une introduction théorique concise et claire
    2. Un scénario pratique réaliste illustrant les concepts
    3. Trois questions de quiz avec 4 réponses possibles chacune
    4. Des ressources externes pertinentes (ANSSI, CNIL, ENISA, etc.)
    
    Structure la réponse en JSON avec le format suivant:
    {
      "theme": "Titre du module",
      "level": "Niveau de difficulté",
      "sections": [
        {
          "title": "Introduction",
          "content": "Contenu théorique",
          "type": "theory"
        },
        {
          "title": "Mise en pratique",
          "content": "Scénario",
          "type": "scenario"
        }
      ],
      "resources": [
        {
          "title": "Titre de la ressource",
          "url": "URL",
          "description": "Description de la ressource"
        }
      ],
      "quiz": [
        {
          "question": "Question du quiz",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": 0,
          "explanation": "Explication de la réponse correcte"
        }
      ]
    }
    
    Veille à ce que le contenu soit techniquement précis, à jour, et conforme aux meilleures pratiques actuelles de cybersécurité en 2025.
    `;

    const response = await openAIService.getChatCompletion(
      [{ role: 'user', content: prompt }],
      0.3, // Température basse pour des réponses plus cohérentes
      4000 // Plus de tokens pour un contenu détaillé
    );

    // Extraction du JSON de la réponse
    let learningContent: LearningContent;
    try {
      // Nettoyer la réponse pour s'assurer qu'elle contient uniquement du JSON valide
      const jsonStr = response.trim().replace(/```json|```/g, '');
      learningContent = JSON.parse(jsonStr);
    } catch (error) {
      console.error('Erreur lors du parsing du JSON:', error);
      return res.status(500).json({ 
        message: 'Erreur lors de la génération du contenu',
        error: String(error)
      });
    }

    res.json(learningContent);
  } catch (error) {
    console.error('Erreur lors de la génération du contenu d\'apprentissage:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la génération du contenu', 
      error: String(error)
    });
  }
}

/**
 * Évalue la réponse d'un utilisateur à une question
 */
export async function evaluateUserResponse(req: Request, res: Response) {
  try {
    const { question, userResponse, correctAnswer, theme, level } = req.body;

    if (!question || !userResponse) {
      return res.status(400).json({ message: 'Question et réponse requises' });
    }

    const prompt = `
    Évalue la réponse d'un utilisateur à une question de cybersécurité.
    
    Question: "${question}"
    Réponse de l'utilisateur: "${userResponse}"
    Réponse correcte: "${correctAnswer || 'Non fournie'}"
    Thème: "${theme || 'Cybersécurité'}"
    Niveau: "${level || 'Intermédiaire'}"
    
    Fournir une évaluation détaillée au format JSON:
    {
      "isCorrect": true/false,
      "score": 0-100,
      "feedback": "Commentaire constructif sur la réponse",
      "improvements": "Suggestions d'améliorations",
      "additionalResources": [
        {
          "title": "Titre de la ressource",
          "url": "URL"
        }
      ]
    }
    
    Sois juste mais exigeant dans ton évaluation.
    `;

    const response = await openAIService.getChatCompletion(
      [{ role: 'user', content: prompt }],
      0.3,
      2000
    );

    // Extraction du JSON de la réponse
    try {
      const jsonStr = response.trim().replace(/```json|```/g, '');
      const evaluation = JSON.parse(jsonStr);
      res.json(evaluation);
    } catch (error) {
      console.error('Erreur lors du parsing du JSON:', error);
      res.status(500).json({ 
        message: 'Erreur lors de l\'évaluation', 
        error: String(error)
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'évaluation de la réponse:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'évaluation', 
      error: String(error)
    });
  }
}