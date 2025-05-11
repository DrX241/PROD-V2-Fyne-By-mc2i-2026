import { Request, Response } from 'express';
import { openAIService } from './services/openai';

/**
 * Interface pour les résultats d'analyse IA
 */
interface AIAnalysisResult {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  badge: {
    name: string;
    description: string;
    icon: string;
  };
  ranking?: {
    position: number;
    totalParticipants: number;
    percentile: number;
  };
  improvementSuggestions: string[];
  professionalInsight: string;
}

/**
 * Évalue les performances d'un utilisateur après un test de réflexes AMOA
 */
export async function evaluateUserPerformance(req: Request, res: Response) {
  try {
    const { 
      answers, 
      baseResults
    } = req.body;
    
    const {
      score, 
      correctAnswers, 
      totalQuestions, 
      categoryScores, 
      averageResponseTime, 
      difficulty 
    } = baseResults;

    // Les données sont déjà formatées grâce à la collecte pendant le test
    const answersFormatted = answers;

    // Système prompt pour l'IA
    const systemPrompt = `
      Tu es un expert en Assistance à Maîtrise d'Ouvrage (AMOA) spécialisé dans l'évaluation des compétences professionnelles.
      Ton rôle est d'analyser les performances d'un utilisateur sur un test de réflexes en AMOA et de fournir une évaluation détaillée.
      
      Sois précis, professionnel et constructif dans ton évaluation.
      Fournis une analyse approfondie basée uniquement sur les données reçues.
      Ton analyse doit inclure:
      - Un score global sur 100 points
      - 2-3 points forts spécifiques identifiés
      - 2-3 points faibles ou axes d'amélioration spécifiques
      - Un badge qui représente le niveau de l'utilisateur (Novice AMOA, AMOA Junior, AMOA Confirmé, AMOA Expert, AMOA Émérite)
      - Un classement simulé parmi d'autres professionnels
      - 3-4 suggestions d'amélioration concrètes et actionnables
      - Une conclusion professionnelle et motivante
      
      Tes réponses doivent être formatées uniquement au format JSON comme suit:
      {
        "score": number, // Le score global sur 100
        "feedback": string, // Appréciation générale en 1-2 phrases
        "strengths": string[], // Liste de 2-3 points forts
        "weaknesses": string[], // Liste de 2-3 axes d'amélioration
        "badge": {
          "name": string, // Nom du badge
          "description": string, // Description courte du badge
          "icon": string // Nom de l'icône (parmi: "trophy", "medal", "star", "certificate", "award")
        },
        "ranking": {
          "position": number, // Position simulée (entre 1 et totalParticipants)
          "totalParticipants": number, // Nombre total de participants simulé (entre 100 et 500)
          "percentile": number // Percentile (calculé, entre 0 et 100)
        },
        "improvementSuggestions": string[], // Liste de 3-4 suggestions d'amélioration
        "professionalInsight": string // Conclusion professionnelle en 2-3 phrases
      }
    `;

    // Message utilisateur contenant les données à analyser
    const userPrompt = `
      Voici les résultats d'un test de réflexes en AMOA:
      
      Score brut: ${score}%
      Réponses correctes: ${correctAnswers}/${totalQuestions}
      Temps de réponse moyen: ${averageResponseTime.toFixed(1)} secondes
      Niveau de difficulté global: ${difficulty}
      
      Détails des réponses:
      ${JSON.stringify(answersFormatted, null, 2)}
      
      Scores par catégorie:
      ${JSON.stringify(categoryScores, null, 2)}
      
      Analyse ces résultats et fournis une évaluation professionnelle complète.
    `;

    // Appel à l'API OpenAI
    const aiResponse = await openAIService.getChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      true, // useSecondaryKey: true - utiliser le modèle gpt-4o-mini
      0.5,  // temperature
      1000  // maxTokens
    );

    // Analyse de la réponse
    let analysisResult: AIAnalysisResult;
    
    try {
      // Tenter de parser la réponse JSON
      analysisResult = JSON.parse(aiResponse);
      
      // Vérifier que tous les champs requis sont présents
      if (!analysisResult.score || !analysisResult.feedback || !analysisResult.strengths || 
          !analysisResult.weaknesses || !analysisResult.badge || !analysisResult.improvementSuggestions ||
          !analysisResult.professionalInsight) {
        throw new Error("Réponse incomplète de l'IA");
      }
      
      return res.status(200).json({
        success: true,
        analysis: analysisResult
      });
    } catch (parseError) {
      console.error("Erreur de parsing de la réponse de l'IA:", parseError);
      console.error("Réponse brute de l'IA:", aiResponse);
      
      // Réponse de secours en cas d'échec du parsing
      return res.status(200).json({
        success: true,
        analysis: {
          score: score,
          feedback: "Analyse complétée avec succès.",
          strengths: ["Bonne connaissance du domaine AMOA"],
          weaknesses: ["Points à améliorer identifiés dans certaines catégories"],
          badge: {
            name: "AMOA en progression",
            description: "Vous développez vos compétences AMOA",
            icon: "certificate"
          },
          ranking: {
            position: Math.floor(100 - score * 0.7),
            totalParticipants: 100,
            percentile: score
          },
          improvementSuggestions: ["Continuer à vous former sur les bonnes pratiques AMOA"],
          professionalInsight: "Continuez à développer vos compétences."
        }
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'évaluation des performances:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'analyse des performances"
    });
  }
}

/**
 * Génère un message d'encouragement ou de soutien contextualisé en fonction de la progression
 */
export async function generateFeedbackMessage(req: Request, res: Response) {
  try {
    const { 
      consecutiveCorrect, 
      consecutiveWrong, 
      scorePercent, 
      currentStreak,
      difficulty,
      category
    } = req.body;

    // Système prompt pour l'IA
    const systemPrompt = `
      Tu es un coach professionnel spécialisé en AMOA (Assistance à Maîtrise d'Ouvrage).
      Ta mission est de fournir un message d'encouragement ou de soutien court, pertinent et motivant
      adapté à la situation actuelle de l'utilisateur pendant un test d'évaluation.
      
      Ton message doit être:
      - Court (maximum 2 phrases)
      - Professionnel mais chaleureux
      - Spécifique à la situation de l'utilisateur
      - Motivant sans être infantilisant
      - En rapport avec l'AMOA quand c'est possible
      
      Réponds uniquement avec le message d'encouragement, sans introduction ni conclusion.
    `;

    // Message utilisateur contenant le contexte
    let userPrompt = "";
    
    if (consecutiveCorrect >= 3) {
      userPrompt = `L'utilisateur vient d'enchaîner ${consecutiveCorrect} bonnes réponses d'affilée dans la catégorie "${category}". Son score actuel est de ${scorePercent}%. Donne-lui un message d'encouragement positif qui souligne sa performance.`;
    } else if (consecutiveWrong >= 2) {
      userPrompt = `L'utilisateur vient de faire ${consecutiveWrong} erreurs d'affilée dans la catégorie "${category}". Son score actuel est de ${scorePercent}%. Donne-lui un message de soutien pour qu'il ne se décourage pas.`;
    } else if (difficulty === "difficile" && currentStreak > 0) {
      userPrompt = `L'utilisateur vient de répondre correctement à une question difficile dans la catégorie "${category}". Son score actuel est de ${scorePercent}%. Félicite-le pour cette réussite.`;
    } else if (scorePercent >= 80) {
      userPrompt = `L'utilisateur maintient un excellent score de ${scorePercent}% dans le test. Encourage-le à maintenir ce niveau.`;
    } else {
      userPrompt = `L'utilisateur progresse dans le test avec un score de ${scorePercent}%. Donne-lui un message général d'encouragement pour la suite.`;
    }

    // Appel à l'API OpenAI avec le modèle gpt-4o-mini pour réduire la latence
    const aiResponse = await openAIService.getChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      true, // useSecondaryKey: true - utiliser le modèle gpt-4o-mini
      0.7,  // temperature
      100   // maxTokens
    );

    return res.status(200).json({
      success: true,
      message: aiResponse.trim()
    });
  } catch (error) {
    console.error("Erreur lors de la génération du message de feedback:", error);
    
    // Réponses de secours en cas d'erreur
    let fallbackMessage = "";
    
    if (req.body.consecutiveCorrect >= 3) {
      fallbackMessage = "Excellente série de réponses ! Vous maîtrisez parfaitement ce sujet.";
    } else if (req.body.consecutiveWrong >= 2) {
      fallbackMessage = "Ne vous découragez pas, chaque erreur est une opportunité d'apprentissage.";
    } else if (req.body.scorePercent >= 80) {
      fallbackMessage = "Vous maintenez un excellent niveau ! Continuez ainsi.";
    } else {
      fallbackMessage = "Restez concentré, vous progressez à chaque question.";
    }
    
    return res.status(200).json({
      success: true,
      message: fallbackMessage
    });
  }
}