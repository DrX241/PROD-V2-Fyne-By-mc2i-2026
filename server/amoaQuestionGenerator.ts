/**
 * Contrôleur de génération de questions pour le test de réflexes AMOA
 * Utilise Azure OpenAI GPT-4o pour générer des questions uniques à chaque fois
 */

import { Request, Response } from "express";
import { openAIService } from "./services/openai";

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface AmoaQuestion {
  id: string;
  text: string;
  options: QuestionOption[];
  timeLimit: number;
  category: string;
  difficulty: "facile" | "moyen" | "difficile";
}

// Catégories de questions AMOA pour une génération diversifiée
const AMOA_CATEGORIES = [
  "Recueil des besoins",
  "Gestion des exigences",
  "Tests et recette",
  "Communication client",
  "Gestion de projet",
  "Analyse d'impact",
  "Méthodologie Agile",
  "Rôle et responsabilités",
  "Gestion des parties prenantes",
  "Gestion du changement"
];

/**
 * Génère un ensemble de questions uniques pour le test de réflexes AMOA
 * @param req Requête HTTP contenant le nombre de questions souhaité (max 5)
 * @param res Réponse HTTP avec les questions générées
 */
export async function generateAmoaQuestions(req: Request, res: Response) {
  try {
    const count = Math.min(parseInt(req.query.count as string) || 5, 5); // Limiter à 5 questions maximum
    
    // Système prompt pour la génération de questions précises
    const systemPrompt = `Tu es un expert en Assistance à Maîtrise d'Ouvrage (AMOA) chargé de créer des questions pour évaluer les compétences AMOA.
    
Génère ${count} questions UNIQUES et DIFFÉRENTES de type QCM avec 4 réponses possibles dont une seule est correcte.

Pour chaque question:
1. La question doit être clairement formulée et pertinente pour évaluer un profil AMOA
2. Chaque option doit être plausible mais une seule correcte
3. Fournir une explication détaillée pour chaque option (pourquoi correcte ou incorrecte)
4. Indiquer quelle option est correcte
5. Attribuer une catégorie parmi: ${AMOA_CATEGORIES.join(", ")}
6. Attribuer un niveau de difficulté: facile, moyen ou difficile
7. Définir un temps limite en secondes (entre 20 et 45 secondes)

Format précis à respecter (JSON) :
[
  {
    "id": "q1",
    "text": "Question complète ?",
    "options": [
      {
        "id": "a1",
        "text": "Option 1",
        "isCorrect": false,
        "explanation": "Explication option 1"
      },
      // autres options...
    ],
    "timeLimit": 30,
    "category": "Catégorie",
    "difficulty": "facile" | "moyen" | "difficile"
  },
  // autres questions...
]

Assure-toi que chaque question couvre une problématique différente en AMOA.`;

    const userPrompt = `Génère ${count} questions distinctes pour évaluer les compétences d'un AMOA.`;

    // Appel à Azure OpenAI pour générer les questions via le service OpenAI de l'application
    const response = await openAIService.getChatCompletionWithCache({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      maxTokens: 3000,
      useSecondaryKey: false
    });

    const content = response;
    if (!content) {
      return res.status(500).json({ success: false, error: "Pas de contenu généré" });
    }

    try {
      // Extraire le JSON des questions générées
      const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (!jsonMatch) {
        return res.status(500).json({ 
          success: false, 
          error: "Format JSON non détecté dans la réponse", 
          rawContent: content 
        });
      }

      const questions = JSON.parse(jsonMatch[0]) as AmoaQuestion[];
      
      // Vérifier que nous avons des questions uniques et bien formatées
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(500).json({ 
          success: false, 
          error: "Format de questions incorrect", 
          rawContent: content 
        });
      }
      
      // Assurer que les ID sont uniques et séquentiels
      questions.forEach((q, index) => {
        q.id = `q${index + 1}`;
        q.options.forEach((opt, optIndex) => {
          opt.id = `q${index + 1}_${optIndex + 1}`;
        });
      });

      return res.status(200).json({ 
        success: true, 
        questions: questions.slice(0, count) 
      });
    } catch (jsonError) {
      console.error("Erreur de parsing JSON:", jsonError);
      return res.status(500).json({ 
        success: false, 
        error: "Erreur lors du parsing du JSON", 
        rawContent: content 
      });
    }
  } catch (error) {
    console.error("Erreur lors de la génération des questions:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Erreur lors de la génération des questions",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
}