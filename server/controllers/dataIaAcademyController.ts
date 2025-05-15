import { Request, Response } from 'express';
import { azureOpenAI } from '../services/openai';
import { systemPrompts } from '../services/openaiContentGenerator';

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

/**
 * Génère du contenu de cours personnalisé pour un module de la DATA & IA ACADEMY
 * Utilise Azure OpenAI pour créer un contenu adapté selon les besoins de l'utilisateur
 */
export async function generateCourseContent(req: Request, res: Response) {
  const {
    moduleId,
    moduleTitle,
    moduleDifficulty,
    userLevel = 'débutant',
    previousKnowledge = [],
    focusAreas = [],
    preferredLearningStyle = 'application pratique'
  } = req.body as CourseGenerationRequest;

  if (!moduleId || !moduleTitle) {
    return res.status(400).json({
      success: false,
      error: "Information du module incomplète. L'identifiant et le titre sont requis."
    });
  }

  try {
    // Préparation du prompt système
    const systemMessage = {
      role: "system",
      content: `${systemPrompts.general}
        
Vous êtes un formateur expert en Data Science et Intelligence Artificielle qui crée des cours interactifs et personnalisés.
Votre mission est de générer un contenu de formation structuré, informatif et engageant pour le module demandé.

DIRECTIVES:
- Adaptez le contenu au niveau de difficulté demandé: ${moduleDifficulty}
- Utilisez un style d'enseignement ${preferredLearningStyle === 'textuel' ? 'textuel avec des explications détaillées' : 
  preferredLearningStyle === 'visuel' ? 'qui décrit des visualisations et schemas' : 
  'orienté pratique avec des exemples de code et exercices'}
- Structurez votre réponse avec des titres de sections clairs (##)
- Incluez une introduction, des concepts clés, et une conclusion
- Priorisez le contenu pratique et applicable dans un contexte professionnel
- Référencez des cas d'usage réels, particulièrement dans les secteurs: énergie, finance, transport, santé
- Utilisez des exemples concrets liés à mc2i, DIXIT (Direction Data & IA) et IMPULSE (secteurs industriels)
- Incluez des exercices pratiques que l'utilisateur peut réaliser
- Référencez des technologies et outils actuels

CONTRAINTES DE FORMAT:
- Utilisez un format markdown pour structurer votre contenu
- Limitez votre réponse à l'équivalent de 10 minutes de lecture
- Utilisez des listes à puces pour les points importants
- Placez le code dans des blocs de code avec la syntaxe appropriée
- Maintenez un ton professionnel mais accessible`
    };

    // Préparation du prompt utilisateur
    const userMessage = {
      role: "user",
      content: `Générez un cours sur "${moduleTitle}" adapté pour un niveau ${userLevel}.
      
Informations supplémentaires:
- ID du module: ${moduleId}
- Niveau de difficulté ciblé: ${moduleDifficulty}
${previousKnowledge.length > 0 ? `- Connaissances préalables: ${previousKnowledge.join(', ')}` : ''}
${focusAreas.length > 0 ? `- Domaines d'intérêt particuliers: ${focusAreas.join(', ')}` : ''}

Je souhaite un cours structuré avec:
1. Une introduction expliquant l'importance du sujet
2. Les concepts fondamentaux de façon claire et concise
3. Des exemples pratiques et des cas d'usage réels
4. Des exercices pour pratiquer
5. Des ressources pour approfondir

Merci de maintenir un équilibre entre théorie et pratique.`
    };

    // Appel à l'API Azure OpenAI
    const chatCompletion = await azureOpenAI.getCompletion([
      systemMessage,
      userMessage
    ], {
      model: "secondary", // Utiliser le modèle secondaire pour économiser des tokens
      temperature: 0.7,
      max_tokens: 2500,
    });

    // Extraction du contenu généré
    const generatedContent = chatCompletion.content;

    // Envoi de la réponse
    return res.json({
      success: true,
      moduleId,
      moduleTitle,
      content: generatedContent
    });

  } catch (error) {
    console.error('Erreur lors de la génération du cours:', error);
    
    return res.status(500).json({
      success: false,
      error: "Une erreur est survenue lors de la génération du contenu du cours. Veuillez réessayer."
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
    const systemMessage = {
      role: "system",
      content: `${systemPrompts.general}
        
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
    const userMessage = {
      role: "user",
      content: `${contextInfo}
      
Question: ${question}

Merci de me fournir une réponse concise et précise, avec des exemples pertinents si nécessaire.`
    };

    // Appel à l'API Azure OpenAI
    const chatCompletion = await azureOpenAI.getCompletion([
      systemMessage,
      userMessage
    ], {
      model: "secondary",
      temperature: 0.5,
      max_tokens: 1000,
    });

    // Extraction du contenu généré
    const generatedAnswer = chatCompletion.content;

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
    const systemMessage = {
      role: "system",
      content: `${systemPrompts.general}
        
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
    const userMessage = {
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
    const chatCompletion = await azureOpenAI.getCompletion([
      systemMessage,
      userMessage
    ], {
      model: "secondary",
      temperature: 0.5,
      max_tokens: 1500,
    });

    // Extraction et parsing du contenu généré
    const generatedContent = chatCompletion.content;
    
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