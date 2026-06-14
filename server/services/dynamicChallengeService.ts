/**
 * Service de génération dynamique de défis pour "Read Me If You Can"
 * Ce service permet de générer des défis en arrière-plan pendant que l'utilisateur
 * répond aux défis préconstruits, afin d'offrir une expérience continue
 */

import { openAIService } from './openai';

// Interface pour représenter un défi de code
export interface CodeChallenge {
  id: string;
  code: string;
  language: 'python' | 'sql';
  question: string;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  responses: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  hint?: string;
}

// Cache de défis générés
const challengeCache: {
  [key: string]: CodeChallenge[];
} = {
  'python-débutant': [],
  'python-intermédiaire': [],
  'python-avancé': [],
  'sql-débutant': [],
  'sql-intermédiaire': [],
  'sql-avancé': []
};

// Nombre maximum de défis à conserver dans le cache
const MAX_CACHE_SIZE = 5;

/**
 * Génère un identifiant unique pour un défi
 */
function generateUniqueId(language: string, difficulty: string): string {
  return `${language}-${difficulty}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Génère un nouveau défi via Azure OpenAI
 */
export async function generateChallenge(
  language: 'python' | 'sql',
  difficulty: 'débutant' | 'intermédiaire' | 'avancé'
): Promise<CodeChallenge | null> {
  try {
    console.log(`Génération d'un défi ${language} de niveau ${difficulty} en cours...`);
    
    // Construire le prompt système
    const systemPrompt = `Tu es un expert en programmation chargé de créer des défis de code pour un jeu éducatif appelé "Read Me If You Can".
      
    TÂCHE: Générer un défi de code complet en ${language === 'python' ? 'Python' : 'SQL'} avec une difficulté "${difficulty}".

    NIVEAU DE DIFFICULTÉ:
    - débutant: Concepts de base, syntaxe simple, opérations élémentaires
    - intermédiaire: Combinaison de concepts, algorithmes simples, utilisation de bibliothèques standard
    - avancé: Algorithmes complexes, concepts avancés, optimisation

    FORMAT DE SORTIE (JSON):
    {
      "challenge": {
        "code": "string (code source qui doit être analysé)",
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
        "explanation": "string (explication détaillée de la réponse correcte)",
        "hint": "string (indice facultatif)"
      }
    }

    IMPORTANT:
    - Assure-toi qu'il y a exactement UNE seule réponse correcte (isCorrect: true)
    - Les défis doivent être uniques et éducatifs
    - Le niveau ${difficulty} implique ${
      difficulty === 'débutant' 
        ? 'des concepts de base uniquement' 
        : difficulty === 'intermédiaire' 
          ? 'une combinaison de concepts de difficulté modérée' 
          : 'des concepts avancés et des algorithmes complexes'
    }`;

    // Construire le prompt utilisateur
    const userPrompt = `Génère un défi de code ${language} de niveau ${difficulty} qui soit instructif et intéressant.`;

    // Appeler Azure OpenAI
    const response = await openAIService.getChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      0.7,
      2000
    );

    if (!response) {
      console.error("Réponse OpenAI vide");
      return null;
    }

    try {
      // Analyser la réponse JSON
      const parsed = JSON.parse(response);
      
      if (!parsed.challenge) {
        console.error("Format de réponse OpenAI invalide (pas de challenge)");
        return null;
      }
      
      // Ajouter un ID unique
      const challenge: CodeChallenge = {
        ...parsed.challenge,
        id: generateUniqueId(language, difficulty)
      };
      
      // Vérifier que tous les champs nécessaires sont présents
      const requiredFields = ['code', 'language', 'question', 'difficulty', 'responses', 'explanation'];
      for (const field of requiredFields) {
        if (!challenge[field as keyof CodeChallenge]) {
          console.error(`Le champ ${field} est manquant dans le challenge`);
          return null;
        }
      }
      
      // Vérifier les réponses
      if (!Array.isArray(challenge.responses) || challenge.responses.length !== 4) {
        console.error("Format des réponses invalide");
        return null;
      }
      
      // Vérifier qu'il y a exactement une réponse correcte
      const correctResponses = challenge.responses.filter(r => r.isCorrect);
      if (correctResponses.length !== 1) {
        console.error("Il doit y avoir exactement une réponse correcte");
        return null;
      }
      
      console.log(`Défi ${language} de niveau ${difficulty} généré avec succès`);
      return challenge;
      
    } catch (error) {
      console.error("Erreur lors du parsing de la réponse OpenAI:", error);
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la génération du défi:", error);
    return null;
  }
}

/**
 * Ajoute un défi au cache
 */
export function addToCache(challenge: CodeChallenge): void {
  const key = `${challenge.language}-${challenge.difficulty}`;
  
  // Ajouter le défi au début du cache
  challengeCache[key].unshift(challenge);
  
  // Limiter la taille du cache
  if (challengeCache[key].length > MAX_CACHE_SIZE) {
    challengeCache[key].pop();
  }
  
  console.log(`Défi ajouté au cache pour ${key}. Taille du cache: ${challengeCache[key].length}`);
}

/**
 * Récupère un défi du cache ou en génère un nouveau
 */
export async function getChallenge(
  language: 'python' | 'sql', 
  difficulty: 'débutant' | 'intermédiaire' | 'avancé'
): Promise<CodeChallenge | null> {
  const key = `${language}-${difficulty}`;
  
  // Si le cache contient des défis, en retourner un
  if (challengeCache[key] && challengeCache[key].length > 0) {
    console.log(`Utilisation d'un défi du cache pour ${key}`);
    return challengeCache[key].pop() || null;
  }
  
  // Sinon, générer un nouveau défi
  console.log(`Cache vide pour ${key}, génération d'un nouveau défi`);
  return generateChallenge(language, difficulty);
}

/**
 * Précharge des défis en arrière-plan
 */
export async function preloadChallenges(): Promise<void> {
  console.log("Préchargement des défis en arrière-plan...");
  
  const combinations = [
    { language: 'python' as const, difficulty: 'débutant' as const },
    { language: 'python' as const, difficulty: 'intermédiaire' as const },
    { language: 'python' as const, difficulty: 'avancé' as const },
    { language: 'sql' as const, difficulty: 'débutant' as const },
    { language: 'sql' as const, difficulty: 'intermédiaire' as const },
    { language: 'sql' as const, difficulty: 'avancé' as const }
  ];
  
  for (const { language, difficulty } of combinations) {
    const key = `${language}-${difficulty}`;
    
    // Ne générer que si le cache n'est pas plein
    if (!challengeCache[key] || challengeCache[key].length < MAX_CACHE_SIZE) {
      try {
        const challenge = await generateChallenge(language, difficulty);
        if (challenge) {
          addToCache(challenge);
        }
      } catch (error) {
        console.error(`Erreur lors du préchargement d'un défi ${key}:`, error);
      }
      
      // Pause entre les générations pour ne pas surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.log("Préchargement des défis terminé");
}

// Lancer le préchargement initial après un délai
setTimeout(() => {
  preloadChallenges();
}, 15000); // 15 secondes après le démarrage

// Pas de polling permanent — le cache se remplit à la demande (économie CPU)

export default {
  getChallenge,
  generateChallenge,
  preloadChallenges,
  addToCache
};