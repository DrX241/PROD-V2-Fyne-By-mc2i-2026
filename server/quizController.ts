import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { QuizQuestion, QuizResponse, QuizResult, QuizSession } from "@shared/types/quiz";
import { getBalancedQuestions, getRandomQuestions } from "./data/quizQuestions";
import { openAIService } from "./services/openai";

// Stockage en mémoire des sessions de quiz
const quizSessions = new Map<string, QuizSession>();

/**
 * Initialise une nouvelle session de quiz
 */
export async function startQuiz(req: Request, res: Response) {
  try {
    const userId = req.body.userId || "anonymous-" + uuidv4().slice(0, 8);
    const balanced = req.body.balanced !== false; // Par défaut, on utilise des questions équilibrées

    // Générer 4 questions pour le quiz
    const questions = balanced 
      ? getBalancedQuestions(4) 
      : getRandomQuestions(4);
    
    // Créer une nouvelle session
    const sessionId = uuidv4();
    const session: QuizSession = {
      id: sessionId,
      userId,
      startedAt: Date.now(),
      questions,
      responses: []
    };
    
    // Enregistrer la session
    quizSessions.set(sessionId, session);
    
    // Renvoyer l'ID de session et les questions (sans les réponses correctes)
    res.json({
      sessionId,
      questions: questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options.map(o => ({
          id: o.id,
          text: o.text
        })),
        category: q.category,
        difficulty: q.difficulty
      }))
    });
  } catch (error) {
    console.error("Erreur lors de l'initialisation du quiz:", error);
    res.status(500).json({ message: "Erreur serveur lors de la création du quiz" });
  }
}

/**
 * Soumet une réponse à une question du quiz
 */
export async function submitAnswer(req: Request, res: Response) {
  try {
    const { sessionId, questionId, optionId } = req.body;
    
    if (!sessionId || !questionId || !optionId) {
      return res.status(400).json({ message: "Paramètres manquants" });
    }
    
    // Récupérer la session
    const session = quizSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session non trouvée" });
    }
    
    // Vérifier si la question existe
    const question = session.questions.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({ message: "Question non trouvée" });
    }
    
    // Vérifier si l'option existe
    const option = question.options.find(o => o.id === optionId);
    if (!option) {
      return res.status(404).json({ message: "Option non trouvée" });
    }
    
    // Créer la réponse
    const response: QuizResponse = {
      questionId,
      selectedOptionId: optionId,
      isCorrect: option.isCorrect
    };
    
    // Ajouter la réponse à la session (en remplaçant toute réponse existante pour cette question)
    const existingResponseIndex = session.responses.findIndex(r => r.questionId === questionId);
    if (existingResponseIndex !== -1) {
      session.responses[existingResponseIndex] = response;
    } else {
      session.responses.push(response);
    }
    
    // Mettre à jour la session
    quizSessions.set(sessionId, session);
    
    // Renvoyer la réponse avec l'information si elle est correcte
    res.json({
      isCorrect: option.isCorrect,
      explanation: question.explanation
    });
  } catch (error) {
    console.error("Erreur lors de la soumission d'une réponse:", error);
    res.status(500).json({ message: "Erreur serveur lors du traitement de la réponse" });
  }
}

/**
 * Termine le quiz et génère un feedback personnalisé
 */
export async function completeQuiz(req: Request, res: Response) {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ message: "ID de session manquant" });
    }
    
    // Récupérer la session
    const session = quizSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session non trouvée" });
    }
    
    // Vérifier si toutes les questions ont été répondues
    if (session.responses.length < session.questions.length) {
      return res.status(400).json({ 
        message: "Toutes les questions n'ont pas été répondues",
        questionsAnswered: session.responses.length,
        totalQuestions: session.questions.length
      });
    }
    
    // Calculer le score
    const correctAnswers = session.responses.filter(r => r.isCorrect).length;
    const score = (correctAnswers / session.questions.length) * 100;
    
    // Déterminer le niveau de compétence en fonction du score
    let skillLevel: "débutant" | "intermédiaire" | "avancé" = "débutant";
    if (score >= 80) {
      skillLevel = "avancé";
    } else if (score >= 50) {
      skillLevel = "intermédiaire";
    }
    
    // Générer un feedback personnalisé avec l'IA
    const feedback = await generateAIFeedback(session, score, skillLevel);
    
    // Créer le résultat final
    const result: QuizResult = {
      score,
      totalQuestions: session.questions.length,
      responses: session.responses,
      feedback
    };
    
    // Mettre à jour la session avec le résultat
    session.completedAt = Date.now();
    session.result = result;
    quizSessions.set(sessionId, session);
    
    // Renvoyer le résultat
    res.json(result);
  } catch (error) {
    console.error("Erreur lors de la finalisation du quiz:", error);
    res.status(500).json({ message: "Erreur serveur lors de la génération des résultats" });
  }
}

/**
 * Génère un feedback personnalisé avec Azure OpenAI
 */
async function generateAIFeedback(session: QuizSession, score: number, skillLevel: "débutant" | "intermédiaire" | "avancé") {
  try {
    // Préparer les données pour l'IA
    const questionData = session.questions.map((q, index) => {
      const response = session.responses.find(r => r.questionId === q.id);
      const selectedOption = q.options.find(o => o.id === response?.selectedOptionId);
      const correctOption = q.options.find(o => o.isCorrect);
      
      return {
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        userAnswer: selectedOption?.text || "Non répondu",
        correctAnswer: correctOption?.text || "Erreur",
        isCorrect: response?.isCorrect || false
      };
    });
    
    // Construire le prompt pour l'IA
    const prompt = `
Tu es un expert en cybersécurité chargé d'analyser les résultats d'un quiz de cybersécurité.

Voici les résultats d'un candidat qui a obtenu un score de ${score}% (${session.responses.filter(r => r.isCorrect).length}/${session.questions.length} réponses correctes).

Détail des réponses:
${JSON.stringify(questionData, null, 2)}

En fonction de ces résultats, génère un feedback constructif et personnalisé au format JSON avec les propriétés suivantes:
- overallAssessment: Une évaluation globale de 2-3 phrases sur la performance et le niveau de connaissance en cybersécurité
- strengths: Un tableau de 1 à 3 points forts identifiés (catégories où la personne a bien répondu)
- weaknesses: Un tableau de 1 à 3 points faibles ou domaines à améliorer
- recommendedTopics: Un tableau de 2 à 4 sujets spécifiques recommandés pour approfondir ses connaissances
- skillLevel: Le niveau identifié ("débutant", "intermédiaire" ou "avancé")

Ton évaluation doit être basée uniquement sur les résultats fournis et être équilibrée entre encouragement et identification des points à améliorer.
`;

    // Appeler l'API OpenAI
    const response = await openAIService.getChatCompletionWithCache(
      [{ role: "user", content: prompt }],
      0.7,
      800
    );
    
    // Extraire le JSON de la réponse
    let feedback;
    try {
      // Nettoyer la réponse pour s'assurer qu'elle ne contient que du JSON
      const jsonString = response.replace(/```json|```/g, '').trim();
      feedback = JSON.parse(jsonString);
      
      // Vérifier que le feedback a la structure attendue
      if (!feedback.overallAssessment || !Array.isArray(feedback.strengths) || 
          !Array.isArray(feedback.weaknesses) || !Array.isArray(feedback.recommendedTopics)) {
        throw new Error("Structure de feedback incorrecte");
      }
      
      // Forcer le skillLevel à celui calculé par l'algorithme
      feedback.skillLevel = skillLevel;
    } catch (error) {
      console.error("Erreur lors du parsing du feedback:", error);
      // Fallback en cas d'erreur
      feedback = {
        overallAssessment: `Vous avez obtenu un score de ${score}% à ce quiz de cybersécurité, ce qui correspond à un niveau ${skillLevel}.`,
        strengths: ["Connaissance de certains concepts de base en cybersécurité"],
        weaknesses: ["Certains domaines spécifiques nécessitent davantage d'attention"],
        recommendedTopics: ["Les bonnes pratiques de sécurité", "La sensibilisation aux menaces actuelles"],
        skillLevel
      };
    }
    
    return feedback;
  } catch (error) {
    console.error("Erreur lors de la génération du feedback IA:", error);
    // Retourner un feedback par défaut en cas d'erreur
    return {
      overallAssessment: `Vous avez obtenu un score de ${score}% à ce quiz de cybersécurité.`,
      strengths: ["Participation à l'évaluation des connaissances en cybersécurité"],
      weaknesses: ["Des connaissances supplémentaires pourraient être bénéfiques"],
      recommendedTopics: ["Fondamentaux de la cybersécurité", "Bonnes pratiques de sécurité"],
      skillLevel
    };
  }
}