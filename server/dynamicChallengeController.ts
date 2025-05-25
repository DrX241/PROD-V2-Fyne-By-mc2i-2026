/**
 * Contrôleur pour générer des défis de code dynamiques
 * Ce contrôleur utilise Azure OpenAI pour générer des défis en temps réel
 */

import { openAIService } from './services/openai';

/**
 * Génère un défi de code dynamique
 */
export async function generateDynamicChallenge(
  language: 'python' | 'sql',
  difficulty: 'débutant' | 'intermédiaire' | 'avancé'
) {
  try {
    console.log(`Génération d'un défi ${language} de niveau ${difficulty}`);
    
    // Construire le prompt système
    const systemPrompt = `Tu es un expert en programmation chargé de créer des défis de code pour un jeu éducatif appelé "Read Me If You Can".
      
    TÂCHE: Générer un défi de code complet en ${language === 'python' ? 'Python' : 'SQL'} avec une difficulté "${difficulty}".

    NIVEAU DE DIFFICULTÉ:
    - débutant: Concepts de base, syntaxe simple, opérations élémentaires
    - intermédiaire: Combinaison de concepts, algorithmes simples, bibliothèques standard
    - avancé: Algorithmes complexes, concepts avancés, optimisation

    FORMAT DE SORTIE (JSON):
    {
      "challenge": {
        "id": "auto-${language}-${difficulty}-${Date.now()}",
        "code": "string (code source à analyser)",
        "language": "${language}",
        "question": "string (question sur le code)",
        "difficulty": "${difficulty}",
        "responses": [
          {
            "id": "a",
            "text": "string (première option)",
            "isCorrect": boolean
          },
          {
            "id": "b",
            "text": "string (deuxième option)",
            "isCorrect": boolean
          },
          {
            "id": "c",
            "text": "string (troisième option)",
            "isCorrect": boolean
          },
          {
            "id": "d",
            "text": "string (quatrième option)",
            "isCorrect": boolean
          }
        ],
        "explanation": "string (explication détaillée)",
        "hint": "string (indice facultatif)"
      }
    }

    IMPORTANT:
    - Assure-toi qu'il y a exactement UNE seule réponse correcte
    - Le défi doit être adapté au niveau ${difficulty}
    - Assure-toi que le code est valide et sans erreur`;

    // Générer le défi via Azure OpenAI
    const response = await openAIService.getChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Génère un défi de code ${language} de niveau ${difficulty}` }
      ],
      0.7,
      2000
    );
    
    if (!response) {
      throw new Error("Réponse OpenAI vide");
    }
    
    try {
      // Parser la réponse JSON
      const result = JSON.parse(response);
      
      if (!result.challenge) {
        throw new Error("Format de réponse OpenAI invalide");
      }
      
      return {
        success: true,
        challenge: result.challenge
      };
    } catch (error) {
      console.error("Erreur lors du parsing de la réponse OpenAI:", error);
      throw new Error("Erreur lors du parsing de la réponse OpenAI");
    }
  } catch (error) {
    console.error("Erreur lors de la génération du défi:", error);
    throw error;
  }
}