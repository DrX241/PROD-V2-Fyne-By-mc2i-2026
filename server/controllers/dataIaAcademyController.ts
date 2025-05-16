import { Request, Response } from 'express';
import { openAIService } from '../services/openai';
import { ChatCompletionRequestMessage } from '../services/openAiTypes';

// Interface pour la structure des requêtes de génération de cours
interface CourseGenerationRequest {
  moduleId: string;
  moduleTitle: string;
  moduleDifficulty: 'débutant' | 'intermédiaire' | 'avancé';
  userLevel?: 'débutant' | 'intermédiaire' | 'avancé';
  previousKnowledge?: string[];
  focusAreas?: string[];
  preferredLearningStyle?: 'textuel' | 'visuel' | 'application pratique';
}

import { dataIaCoursesService } from '../services/dataIaCoursesService';

/**
 * Récupère le contenu d'un cours préenregistré pour un module de la DATA & IA ACADEMY
 * Utilise le service dataIaCoursesService pour obtenir le contenu plutôt que de le générer à la volée
 */
export async function generateCourseContent(req: Request, res: Response) {
  const {
    moduleId,
    moduleTitle
  } = req.body as CourseGenerationRequest;

  if (!moduleId) {
    return res.status(400).json({
      success: false,
      error: "Information du module incomplète. L'identifiant est requis."
    });
  }

  try {
    // Récupération du cours préenregistré
    const course = dataIaCoursesService.getCourse(moduleId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: `Aucun cours trouvé pour le module: ${moduleId}`
      });
    }

    // Envoi de la réponse avec le contenu préenregistré
    return res.json({
      success: true,
      moduleId,
      moduleTitle: course.title,
      content: course.content,
      sections: course.sections,
      exercises: course.exercises,
      resources: course.resources
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du cours:', error);
    
    return res.status(500).json({
      success: false,
      error: "Une erreur est survenue lors de la récupération du contenu du cours. Veuillez réessayer."
    });
  }
}

/**
 * Répond à une question spécifique concernant un module de la DATA & IA ACADEMY
 * Utilise Azure OpenAI pour générer une réponse précise et contextualisée
 */
export async function answerQuestion(req: Request, res: Response) {
  const { moduleId, moduleTitle, question } = req.body;

  if (!question) {
    return res.status(400).json({
      success: false,
      error: "Aucune question fournie."
    });
  }

  try {
    // Préparation du prompt système
    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: `        
Vous êtes un assistant expert en Data Science et Intelligence Artificielle qui répond aux questions des apprenants.
Votre mission est de fournir des réponses précises, informatives et éducatives aux questions sur les technologies data et IA.

DIRECTIVES:
- Répondez de manière claire et directe à la question posée
- Fournissez des exemples concrets et applicables lorsque c'est pertinent
- Utilisez un langage accessible tout en maintenant la précision technique
- Si la question est ambiguë, interprétez-la dans le contexte du module concerné 
- Adaptez votre réponse pour un contexte professionnel, en particulier pour des consultants mc2i
- Incluez des références à des technologies actuelles et pertinentes
- Si la question porte sur du code, incluez des exemples de code fonctionnels

CONTRAINTES DE FORMAT:
- Utilisez un format markdown pour structurer votre réponse
- Limitez votre réponse à l'essentiel
- Utilisez des listes à puces pour les concepts importants
- Placez le code dans des blocs de code avec la syntaxe appropriée`
    };

    // Préparation du contexte spécifique au module
    let contextInfo = "";
    if (moduleId && moduleTitle) {
      contextInfo = `Cette question concerne le module "${moduleTitle}" (ID: ${moduleId}).`;
    }

    // Préparation du prompt utilisateur
    const userMessage: ChatCompletionRequestMessage = {
      role: "user",
      content: `${contextInfo}
      
Question: ${question}

Merci de me fournir une réponse concise et précise, avec des exemples pertinents si nécessaire.`
    };

    // Appel à l'API Azure OpenAI
    const generatedAnswer = await openAIService.getChatCompletion([
      systemMessage,
      userMessage
    ], true, 0.5, 1000);

    // Envoi de la réponse
    return res.json({
      success: true,
      question,
      answer: generatedAnswer
    });

  } catch (error) {
    console.error('Erreur lors de la génération de la réponse:', error);
    
    return res.status(500).json({
      success: false,
      error: "Une erreur est survenue lors de la génération de la réponse. Veuillez réessayer."
    });
  }
}

/**
 * Génère un quiz pour évaluer les connaissances sur un module spécifique
 */
export async function generateQuiz(req: Request, res: Response) {
  const { moduleId, moduleTitle, difficulty = 'intermédiaire', questionCount = 5 } = req.body;

  if (!moduleId || !moduleTitle) {
    return res.status(400).json({
      success: false,
      error: "Information du module incomplète. L'identifiant et le titre sont requis."
    });
  }

  try {
    // Préparation du prompt système
    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: `        
Vous êtes un expert en évaluation pédagogique spécialisé en Data Science et Intelligence Artificielle.
Votre mission est de créer un quiz pertinent et éducatif pour évaluer les connaissances sur le module demandé.

DIRECTIVES:
- Créez exactement ${questionCount} questions à choix multiples (QCM)
- Adaptez les questions au niveau de difficulté demandé: ${difficulty}
- Chaque question doit avoir exactement 4 options de réponse
- Une seule option doit être correcte
- Incluez une explication pour la réponse correcte
- Couvrez les concepts clés et points importants du module
- Assurez-vous que les questions testent la compréhension et non juste la mémorisation
- Variez les types de questions (concepts, application, analyse, etc.)

CONTRAINTES DE FORMAT:
- Retournez UNIQUEMENT un tableau JSON valide avec la structure spécifiée
- Chaque question doit avoir les propriétés: id, question, options (array), correctAnswerIndex (0-3), explanation
- Ne pas inclure de texte explicatif en dehors du tableau JSON
- Assurez-vous que le JSON est correctement formaté et valide`
    };

    // Préparation du prompt utilisateur
    const userMessage: ChatCompletionRequestMessage = {
      role: "user",
      content: `Générez un quiz de ${questionCount} questions à choix multiples pour évaluer les connaissances sur "${moduleTitle}" (ID: ${moduleId}) avec un niveau de difficulté "${difficulty}".

Le format de sortie doit être exactement ce tableau JSON:
[
  {
    "id": "q1",
    "question": "Texte de la question 1",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0,
    "explanation": "Explication de la réponse correcte"
  },
  ...
]

Assurez-vous que les questions:
- Couvrent les aspects importants du sujet "${moduleTitle}"
- Sont claires et sans ambiguïté
- Ont une seule réponse correcte parmi les 4 options

Merci de retourner uniquement le tableau JSON, sans texte supplémentaire.`
    };

    // Appel à l'API Azure OpenAI
    const generatedContent = await openAIService.getChatCompletion([
      systemMessage,
      userMessage
    ], true, 0.5, 1500);
    
    // Tentative de récupération du tableau JSON depuis la réponse
    const jsonMatch = generatedContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Format de réponse invalide - JSON non trouvé");
    }
    
    const quizQuestions = JSON.parse(jsonMatch[0]);

    // Envoi de la réponse
    return res.json({
      success: true,
      moduleId,
      moduleTitle,
      questions: quizQuestions
    });

  } catch (error) {
    console.error('Erreur lors de la génération du quiz:', error);
    
    return res.status(500).json({
      success: false,
      error: "Une erreur est survenue lors de la génération du quiz. Veuillez réessayer."
    });
  }
}