import { Request, Response } from 'express';
import { openAIService } from './services/openai';
import { extractJsonFromOpenAiResponse } from "./openAiResponseHelper";
import { ChatCompletionRequestMessage } from "@shared/schema";

/**
 * Interface pour les questions de quiz
 */
export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  category: string;
  isVraiOuFaux?: boolean;
}

/**
 * Interface pour l'ensemble du quiz
 */
export interface Quiz {
  title: string;
  description: string;
  questions: QuizQuestion[];
}

/**
 * Cache des questions de quiz pour minimiser les appels API
 */
const questionCache: Map<string, QuizQuestion[]> = new Map();
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 heures

/**
 * Génère une question de quiz basée sur la catégorie et la difficulté
 */
export async function generateQuizQuestion(req: Request, res: Response) {
  try {
    const { category = 'all', difficulty = 'intermédiaire' } = req.body;
    
    // Clé de cache unique qui inclut le timestamp pour assurer la variété
    const timestamp = Date.now();
    const cacheKey = `${category}-${difficulty}-${Math.floor(timestamp / 600000)}`; // Change toutes les 10 minutes
    
    // Vérifier le cache
    if (questionCache.has(cacheKey)) {
      const cachedQuestions = questionCache.get(cacheKey)!;
      // Si existe dans le cache, retourner une question aléatoire
      const randomIndex = Math.floor(Math.random() * cachedQuestions.length);
      const question = cachedQuestions[randomIndex];
      
      return res.status(200).json({ success: true, question });
    }
    
    // Mapper les catégories aux domaines spécifiques pour l'IA
    const categoryMap: Record<string, string> = {
      'all': 'tous les domaines de cybersécurité',
      'threats': 'menaces et attaques informatiques',
      'defense': 'défense et protection des systèmes',
      'data': 'sécurité et protection des données',
      'identity': 'gestion des identités et des accès',
      'governance': 'gouvernance, risque et conformité'
    };
    
    // Assurer que la difficulté est correctement formatée
    const difficultyFormatted = difficulty === 'avancé' ? 'avancé' : 
                                difficulty === 'intermédiaire' ? 'intermédiaire' : 'débutant';
    
    const categoryDescription = categoryMap[category] || category;
    
    // Générer un identifiant unique pour la question
    const questionId = `gen-${timestamp}-${category}-${difficultyFormatted}`;
    
    // Construire le prompt pour l'IA
    const prompt = `Crée une question de quiz unique et instructive sur la ${categoryDescription}, avec un niveau de difficulté ${difficultyFormatted}.

CONTRAINTES SPÉCIFIQUES:
1. Le niveau de difficulté "${difficultyFormatted}" doit être STRICTEMENT respecté:
   - débutant: concepts fondamentaux accessibles aux novices
   - intermédiaire: notions plus avancées nécessitant une connaissance de base
   - avancé: concepts techniques, détaillés ou pointus pour experts

2. Question type: ${Math.random() > 0.3 ? 'QCM classique' : 'Vrai ou Faux'}
${timestamp % 7 === 0 ? '3. Inclure un scénario pratique ou une situation réelle' : ''}
${timestamp % 5 === 0 ? '3. Formuler la question sous forme de problème à résoudre' : ''}
${timestamp % 3 === 0 ? '3. La question doit porter sur un aspect récent ou moderne de la cybersécurité' : ''}

FORMAT DE RÉPONSE JSON REQUIS:
{
  "question": "texte de la question",
  "options": ["option A", "option B", "option C", "option D"], // ou ["Vrai", "Faux"] pour les questions vrai/faux
  "correctAnswer": 0, // index numérique de la bonne réponse (0, 1, 2 ou 3)
  "explanation": "explication détaillée de la réponse correcte (4-5 phrases)",
  "difficulty": "${difficultyFormatted}",
  "category": "${category}",
  "isVraiOuFaux": false // mettre à true pour les questions vrai/faux
}

IMPORTANT: Retourne UNIQUEMENT le JSON valide, sans texte supplémentaire.`;

    // Faire l'appel à l'API
    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: "Tu es un expert en cybersécurité spécialisé dans la création de contenu éducatif. Génère des questions de quiz uniques, précises et engageantes qui respectent exactement le niveau de difficulté demandé."
    };
    
    const userMessage: ChatCompletionRequestMessage = {
      role: "user",
      content: prompt
    };
    
    const response = await openAIService.getChatCompletion([systemMessage, userMessage], 0.7, 1200);
    
    // Extraire et parser le JSON de la réponse
    const parsedQuestion = extractJsonFromOpenAiResponse(response);
    
    if (!parsedQuestion) {
      throw new Error("Impossible de générer une question de quiz valide");
    }
    
    // Ajouter l'ID à la question
    const questionWithId: QuizQuestion = {
      id: questionId,
      ...parsedQuestion
    };
    
    // Mettre en cache un tableau de questions pour ce cacheKey
    const newCacheEntry = [questionWithId];
    questionCache.set(cacheKey, newCacheEntry);
    
    // Définir un timeout pour supprimer du cache
    setTimeout(() => {
      questionCache.delete(cacheKey);
    }, CACHE_EXPIRY);
    
    return res.status(200).json({ success: true, question: questionWithId });
  } catch (error: any) {
    console.error('Erreur lors de la génération de la question de quiz:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la génération de la question de quiz',
      error: error.message || String(error) 
    });
  }
}

/**
 * Génère un indice IA pour une question de quiz
 */
export async function generateQuizHint(req: Request, res: Response) {
  try {
    const { question, options, difficulty } = req.body;
    
    if (!question) {
      return res.status(400).json({ success: false, message: 'La question est requise pour générer un indice' });
    }
    
    // Construire le prompt
    const prompt = `En tant qu'expert en cybersécurité, fournir un indice utile mais subtil pour aider à répondre à cette question:

Question: ${question}

Options:
${options.map((opt: string, idx: number) => `${idx + 1}. ${opt}`).join('\n')}

Niveau de difficulté: ${difficulty}

Important: Ne pas révéler directement la réponse. L'indice doit orienter la réflexion sans donner la solution. Commence ta réponse par "Indice IA : " suivi directement de ton indice en 1-2 phrases.`;

    // Faire l'appel à l'API
    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: "Tu es un assistant pédagogique spécialisé en cybersécurité. Ta mission est de fournir des indices utiles sans révéler directement les réponses aux questions."
    };
    
    const userMessage: ChatCompletionRequestMessage = {
      role: "user",
      content: prompt
    };
    
    const hint = await openAIService.getChatCompletionSecondary({
      messages: [
        { role: 'system', content: systemMessage.content },
        { role: 'user', content: userMessage.content }
      ],
      temperature: 0.7
    });
    
    if (!hint) {
      throw new Error("Échec de la génération de l'indice");
    }
    
    const hintContent = hint.choices[0].message.content;
    
    return res.status(200).json({ success: true, hint: hintContent });
  } catch (error: any) {
    console.error('Erreur lors de la génération de l\'indice:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la génération de l\'indice',
      error: error.message || String(error) 
    });
  }
}

/**
 * Génère un ensemble complet de quiz avec plusieurs questions
 */
export async function generateFullQuiz(req: Request, res: Response) {
  try {
    const { category = 'all', difficulty = 'intermédiaire', count = 5 } = req.body;
    
    // Limiter le nombre de questions demandées
    const questionCount = Math.min(Math.max(1, count), 10);
    
    // Mapper les catégories aux domaines spécifiques pour l'IA
    const categoryMap: Record<string, string> = {
      'all': 'tous les domaines de cybersécurité',
      'threats': 'menaces et attaques informatiques',
      'defense': 'défense et protection des systèmes',
      'data': 'sécurité et protection des données',
      'identity': 'gestion des identités et des accès',
      'governance': 'gouvernance, risque et conformité'
    };
    
    const categoryDescription = categoryMap[category] || category;
    
    // Construire le prompt pour l'IA
    const prompt = `Crée un quiz complet de ${questionCount} questions sur la ${categoryDescription}, avec un niveau de difficulté ${difficulty}.

CONTRAINTES SPÉCIFIQUES:
1. Le niveau "${difficulty}" doit être STRICTEMENT respecté pour toutes les questions:
   - débutant: concepts fondamentaux accessibles aux novices
   - intermédiaire: notions plus avancées nécessitant une connaissance de base
   - avancé: concepts techniques, détaillés ou pointus pour experts

2. Inclure une variété de formats:
   - Au moins une question Vrai/Faux
   - Des questions à choix multiples (4 options)
   - Si possible, un scénario ou une situation pratique à analyser

3. Assurer que les questions sont diversifiées et couvrent différents aspects du domaine

FORMAT DE RÉPONSE JSON REQUIS:
{
  "title": "Titre du quiz",
  "description": "Brève description du contenu et objectifs du quiz",
  "questions": [
    {
      "question": "texte de la question",
      "options": ["option A", "option B", "option C", "option D"], // ou ["Vrai", "Faux"] pour les questions vrai/faux
      "correctAnswer": 0, // index numérique de la bonne réponse (0, 1, 2 ou 3)
      "explanation": "explication détaillée de la réponse correcte",
      "difficulty": "${difficulty}",
      "category": "${category}",
      "isVraiOuFaux": false // mettre à true pour les questions vrai/faux
    },
    // autres questions...
  ]
}

IMPORTANT: Retourne UNIQUEMENT le JSON valide, sans texte supplémentaire.`;

    // Faire l'appel à l'API
    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: "Tu es un expert en cybersécurité spécialisé dans la création de contenu éducatif. Génère des quiz précis, variés et engageants qui respectent exactement le niveau de difficulté demandé."
    };
    
    const userMessage: ChatCompletionRequestMessage = {
      role: "user",
      content: prompt
    };
    
    const response = await openAIService.getChatCompletion([systemMessage, userMessage], 0.7, 2500);
    
    // Extraire et parser le JSON de la réponse
    const parsedQuiz = extractJsonFromOpenAiResponse(response);
    
    if (!parsedQuiz || !parsedQuiz.questions || !Array.isArray(parsedQuiz.questions)) {
      throw new Error("Impossible de générer un quiz valide");
    }
    
    // Ajouter des IDs aux questions
    const timestamp = Date.now();
    const quizWithIds: Quiz = {
      ...parsedQuiz,
      questions: parsedQuiz.questions.map((q: QuizQuestion, index: number) => ({
        id: `gen-${timestamp}-${category}-${difficulty}-${index}`,
        ...q
      }))
    };
    
    return res.status(200).json({ success: true, quiz: quizWithIds });
  } catch (error: any) {
    console.error('Erreur lors de la génération du quiz complet:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la génération du quiz complet',
      error: error.message || String(error) 
    });
  }
}