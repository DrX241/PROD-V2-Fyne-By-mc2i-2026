/**
 * Service de génération dynamique de défis de programmation
 * Ce service utilise Azure OpenAI pour générer des défis en arrière-plan
 * pendant que l'utilisateur répond aux défis préconstruits
 */

import { openAIService } from './openai';

// Interface pour les défis générés
export interface GeneratedChallenge {
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

// Cache en mémoire pour stocker les défis générés
const challengeCache: {
  python: {
    débutant: GeneratedChallenge[];
    intermédiaire: GeneratedChallenge[];
    avancé: GeneratedChallenge[];
  };
  sql: {
    débutant: GeneratedChallenge[];
    intermédiaire: GeneratedChallenge[];
    avancé: GeneratedChallenge[];
  };
} = {
  python: {
    débutant: [],
    intermédiaire: [],
    avancé: []
  },
  sql: {
    débutant: [],
    intermédiaire: [],
    avancé: []
  }
};

// Nombre de défis à conserver dans le cache pour chaque catégorie
const CACHE_SIZE = 5;

// Générer un ID unique
function generateUniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Génère un défi de programmation via Azure OpenAI
 */
export async function generateChallenge(
  language: 'python' | 'sql',
  difficulty: 'débutant' | 'intermédiaire' | 'avancé'
): Promise<GeneratedChallenge | null> {
  try {
    // Construire le prompt système
    const systemPrompt = `Tu es un expert en programmation chargé de créer des défis de code pour un jeu éducatif appelé "Read Me If You Can".
      
    TÂCHE: Générer un défi de code complet en ${language === 'python' ? 'Python' : 'SQL'} avec une difficulté "${difficulty}".

    NIVEAU DE DIFFICULTÉ:
    - débutant: Concepts de base, syntaxe simple, opérations élémentaires
    - intermédiaire: Combinaison de concepts, algorithmes simples, utilisation de bibliothèques standard
    - avancé: Algorithmes complexes, concepts avancés, optimisation

    CONTENU REQUIS:
    1. Un extrait de code ${language === 'python' ? 'Python' : 'SQL'} de niveau ${difficulty}
    2. Une question pertinente sur ce code
    3. Quatre options de réponse dont une seule correcte
    4. Une explication détaillée de la bonne réponse
    5. Un indice facultatif pour aider l'utilisateur

    CONSIGNES POUR ${language === 'python' ? 'PYTHON' : 'SQL'}:
    ${language === 'python' 
      ? `- Débutant: variables, structures de contrôle simples, listes, dictionnaires
      - Intermédiaire: compréhensions, fonctions, classes simples, modules standard
      - Avancé: décorateurs, générateurs, métaclasses, programmation fonctionnelle` 
      : `- Débutant: SELECT simple, WHERE, JOIN basique, GROUP BY
      - Intermédiaire: Sous-requêtes, HAVING, fonctions de fenêtrage simples
      - Avancé: CTEs, requêtes récursives, fonctions de fenêtrage avancées, optimisation`}
      
    FORMAT DE SORTIE: JSON pur selon ce schéma précis, sans texte additionnel:
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

    IMPORTANT: Assure-toi qu'il y a exactement UNE seule réponse correcte (isCorrect: true) et que les trois autres sont incorrectes.`;

    // Construire le prompt utilisateur
    const userPrompt = `Génère un défi de code ${language} de niveau ${difficulty} qui soit différent des défis couramment utilisés. Assure-toi que le code est correct et que la question est claire.`;

    // Appeler Azure OpenAI
    const response = await openAIService.getChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      0.7,
      2000,
      { type: "json_object" }
    );

    // Analyser la réponse
    if (!response) {
      console.error('Réponse OpenAI vide');
      return null;
    }

    try {
      const parsedResponse = JSON.parse(response);
      
      if (!parsedResponse.challenge) {
        console.error('Format de réponse OpenAI invalide');
        return null;
      }

      // Ajouter un ID unique au défi
      const challenge: GeneratedChallenge = {
        ...parsedResponse.challenge,
        id: generateUniqueId(`${language}-${difficulty}`)
      };

      return challenge;
    } catch (error) {
      console.error('Erreur lors du parsing de la réponse OpenAI:', error);
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la génération du défi:', error);
    return null;
  }
}

/**
 * Ajoute un défi généré au cache
 */
export function addChallengeToCache(challenge: GeneratedChallenge): void {
  const { language, difficulty } = challenge;
  
  // Ajouter le défi au début du cache
  challengeCache[language][difficulty].unshift(challenge);
  
  // Limiter la taille du cache
  if (challengeCache[language][difficulty].length > CACHE_SIZE) {
    challengeCache[language][difficulty].pop();
  }
}

/**
 * Génère des défis en arrière-plan pour remplir le cache
 */
export async function preloadChallenges(): Promise<void> {
  console.log('Préchargement des défis en arrière-plan...');
  
  // Liste des combinaisons à générer
  const combinations = [
    { language: 'python' as const, difficulty: 'débutant' as const },
    { language: 'python' as const, difficulty: 'intermédiaire' as const },
    { language: 'python' as const, difficulty: 'avancé' as const },
    { language: 'sql' as const, difficulty: 'débutant' as const },
    { language: 'sql' as const, difficulty: 'intermédiaire' as const },
    { language: 'sql' as const, difficulty: 'avancé' as const },
  ];

  // Générer un défi pour chaque combinaison
  for (const { language, difficulty } of combinations) {
    // Ne générer que si le cache n'est pas plein
    if (challengeCache[language][difficulty].length < CACHE_SIZE) {
      try {
        const challenge = await generateChallenge(language, difficulty);
        if (challenge) {
          addChallengeToCache(challenge);
          console.log(`Défi généré pour ${language} ${difficulty}`);
        }
      } catch (error) {
        console.error(`Erreur lors de la génération du défi ${language} ${difficulty}:`, error);
      }
      
      // Pause entre les générations pour ne pas surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

/**
 * Récupère un défi du cache ou en génère un nouveau si le cache est vide
 */
export async function getOrGenerateChallenge(
  language: 'python' | 'sql',
  difficulty: 'débutant' | 'intermédiaire' | 'avancé'
): Promise<GeneratedChallenge | null> {
  // Si le cache contient des défis, en retourner un
  if (challengeCache[language][difficulty].length > 0) {
    // Retirer le dernier défi du cache
    return challengeCache[language][difficulty].pop() || null;
  }
  
  // Sinon, générer un nouveau défi
  return generateChallenge(language, difficulty);
}

// Préchargement uniquement au démarrage — pas de polling permanent (économie CPU)
setTimeout(preloadChallenges, 10000);