import { Request, Response } from 'express';
import { openAIService } from './services/openai';
import { extractJsonFromOpenAiResponse, createFallbackJson } from "./openAiResponseHelper";
import { ChatCompletionRequestMessage } from "@shared/schema";

// Interface pour les termes du glossaire
export interface GlossaryTerm {
  id: string;
  term: string;
  acronym?: string;
  definition: string;
  extendedDefinition: string;
  examples?: string[];
  category: string;
  tags: string[];
  relatedTerms: string[];
  isFavorite: boolean;
  isBookmarked: boolean;
  icon?: any; // Cette partie est gérée côté client
}

// Cache des termes générés pour éviter trop d'appels API
let glossaryTermsCache: Map<string, GlossaryTerm> = new Map();
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 heure

/**
 * Recherche un terme dans le glossaire de cybersécurité ou génère une explication détaillée
 */
export async function searchGlossaryTerm(req: Request, res: Response) {
  try {
    const { term } = req.body;
    
    if (!term) {
      return res.status(400).json({ success: false, message: 'Le terme à rechercher est requis' });
    }
    
    // Vérifier si le terme existe déjà dans le cache
    const cacheKey = term.toLowerCase().trim();
    if (glossaryTermsCache.has(cacheKey)) {
      const cachedTerm = glossaryTermsCache.get(cacheKey);
      return res.status(200).json({ success: true, term: cachedTerm });
    }
    
    // Générer un nouvel ID pour le terme
    const termId = `gen-${Date.now()}-${cacheKey.replace(/[^a-z0-9]/g, '-')}`;
    
    // Générer le terme avec OpenAI
    const prompt = `Agis comme un expert en cybersécurité chargé de créer des définitions précises pour un glossaire visuel interactif. Génère une entrée de glossaire détaillée pour le terme "${term}". Le résultat doit être au format JSON avec les champs suivants :

{
  "term": "le terme en question",
  "acronym": "s'il s'agit d'un acronyme, sinon null",
  "definition": "définition concise (max 2 phrases)",
  "extendedDefinition": "définition plus détaillée (4-5 phrases)",
  "examples": ["exemple d'utilisation ou de contexte", "autre exemple si pertinent"],
  "category": "une des catégories suivantes: threats, defense, tools, data, network, compliance",
  "tags": ["liste", "de", "mots-clés", "associés", "au", "terme"],
  "relatedTerms": ["liste vide pour maintenant"]
}

Important : La réponse doit être EXCLUSIVEMENT le JSON valide, sans intro, commentaire ou explication. Adapte la longueur et le détail à l'importance du terme.`;

    // Faire l'appel à l'API
    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: "Tu es un expert en cybersécurité chargé de créer des définitions précises pour un glossaire visuel interactif. Réponds uniquement avec du JSON valide."
    };
    
    const userMessage: ChatCompletionRequestMessage = {
      role: "user",
      content: prompt
    };
    
    const response = await openAIService.getChatCompletion([systemMessage, userMessage], 0.7, 1500);
    
    // Extraire et parser le JSON de la réponse
    const parsedResponse = extractJsonFromOpenAiResponse(response);
    
    // Si le parsing a échoué, créer un JSON par défaut
    const termData = parsedResponse || createFallbackJson({
      term: term,
      acronym: null,
      definition: "Définition non disponible",
      extendedDefinition: "Définition détaillée non disponible",
      examples: [],
      category: "tools",
      tags: [term],
      relatedTerms: []
    });
    
    // Ajouter les champs manquants
    const glossaryTerm: GlossaryTerm = {
      id: termId,
      ...termData,
      isFavorite: false,
      isBookmarked: false
    };
    
    // Mettre en cache
    glossaryTermsCache.set(cacheKey, glossaryTerm);
    
    // Définir un timeout pour supprimer du cache
    setTimeout(() => {
      glossaryTermsCache.delete(cacheKey);
    }, CACHE_EXPIRY);
    
    return res.status(200).json({ success: true, term: glossaryTerm });
  } catch (error) {
    console.error('Erreur lors de la génération du terme de glossaire:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la génération du terme de glossaire',
      error: error.message 
    });
  }
}

/**
 * Génère une explication personnalisée pour un concept de cybersécurité
 */
export async function explainConcept(req: Request, res: Response) {
  try {
    const { concept, context } = req.body;
    
    if (!concept) {
      return res.status(400).json({ success: false, message: 'Le concept à expliquer est requis' });
    }
    
    // Construire un prompt en fonction du contexte fourni
    let prompt = `En tant qu'expert en cybersécurité, explique le concept de "${concept}" `;
    
    if (context) {
      prompt += `dans le contexte de "${context}" `;
    }
    
    prompt += `de manière claire et pédagogique. Ta réponse doit être structurée avec:
1. Une définition simple (1-2 phrases)
2. Une explication plus détaillée (3-4 phrases)
3. Des exemples concrets d'application ou de contexte
4. Des concepts connexes à explorer

Formate ta réponse en Markdown en utilisant des titres, des listes et des emphases pour plus de clarté.`;
    
    // Faire l'appel à l'API
    const systemMessage: ChatCompletionRequestMessage = {
      role: "system",
      content: "Tu es un expert en cybersécurité spécialisé dans l'explication de concepts complexes de manière pédagogique."
    };
    
    const userMessage: ChatCompletionRequestMessage = {
      role: "user",
      content: prompt
    };
    
    const explanation = await openAIService.getChatCompletion([systemMessage, userMessage], 0.7, 2000);
    
    return res.status(200).json({ success: true, explanation });
  } catch (error) {
    console.error('Erreur lors de l\'explication du concept:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'explication du concept',
      error: error.message 
    });
  }
}

/**
 * Compare deux termes de cybersécurité et explique leurs différences et similitudes
 */
export async function compareTerms(req: Request, res: Response) {
  try {
    const { term1, term2 } = req.body;
    
    if (!term1 || !term2) {
      return res.status(400).json({ success: false, message: 'Deux termes à comparer sont requis' });
    }
    
    // Construire le prompt
    const prompt = `Compare les concepts de cybersécurité "${term1}" et "${term2}" en détaillant:

1. Une brève définition de chaque terme
2. Leurs principales différences
3. Leurs similitudes ou complémentarités
4. Contextes d'utilisation typiques pour chacun
5. Importance relative dans la cybersécurité moderne

Présente ta réponse en Markdown, bien structurée avec des titres, des listes et des tableaux si pertinent.`;
    
    // Faire l'appel à l'API
    const comparison = await openAIService.getCompletion(prompt, "glossary_assistant");
    
    return res.status(200).json({ success: true, comparison });
  } catch (error) {
    console.error('Erreur lors de la comparaison des termes:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la comparaison des termes',
      error: error.message 
    });
  }
}

/**
 * Génère un quiz sur un terme spécifique ou sur des concepts généraux de cybersécurité
 */
export async function generateQuiz(req: Request, res: Response) {
  try {
    const { term, difficulty } = req.body;
    
    // Niveau de difficulté par défaut
    const level = difficulty || 'moyen';
    
    // Construire le prompt
    let prompt = `Crée un quiz de 5 questions à choix multiples `;
    
    if (term) {
      prompt += `sur le concept de cybersécurité "${term}" `;
    } else {
      prompt += `sur les concepts fondamentaux de cybersécurité `;
    }
    
    prompt += `avec un niveau de difficulté ${level}. Pour chaque question, fournis:
1. La question
2. 4 options possibles (de A à D)
3. La réponse correcte
4. Une brève explication de la réponse

Le résultat doit être structuré en JSON comme suit:
{
  "title": "titre du quiz",
  "questions": [
    {
      "question": "texte de la question",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": "B", // index de la bonne réponse (A, B, C ou D)
      "explanation": "explication de la réponse"
    },
    // autres questions...
  ]
}

Important: Retourne UNIQUEMENT le JSON valide sans texte supplémentaire.`;
    
    // Faire l'appel à l'API
    const response = await openAIService.getCompletion(prompt, "glossary_assistant");
    
    // Extraire et parser le JSON de la réponse
    const quizData = extractJsonFromOpenAiResponse(response);
    
    // Si le parsing a échoué, créer un quiz par défaut
    const quiz = quizData || {
      title: term ? `Quiz sur ${term}` : "Quiz sur la cybersécurité",
      questions: [
        {
          question: "Question non disponible",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: "A",
          explanation: "Explication non disponible"
        }
      ]
    };
    
    return res.status(200).json({ success: true, quiz });
  } catch (error) {
    console.error('Erreur lors de la génération du quiz:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la génération du quiz',
      error: error.message 
    });
  }
}