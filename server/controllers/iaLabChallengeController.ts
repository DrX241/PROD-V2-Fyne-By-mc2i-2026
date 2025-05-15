import { Request, Response } from 'express';
import { openAIService } from '../services/openai';

// Types pour les défis
export interface Challenge {
  id: string;
  title: string;
  description: string;
  language: 'python' | 'sql';
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  initialCode: string;
  expectedOutput?: string;
  validationCriteria?: string[];
  hints: string[];
  solution?: string;
  category: string;
}

// Structure de données pour les catégories de défis
const CHALLENGE_CATEGORIES = {
  python: [
    'Manipulation de données',
    'Algorithmes',
    'Structures de données',
    'Data Science',
    'Machine Learning',
    'Visualisation'
  ],
  sql: [
    'Requêtes simples',
    'Jointures',
    'Agrégation',
    'Sous-requêtes',
    'DDL',
    'Optimisation'
  ]
};

// Fonction pour générer un défi via l'IA
export async function generateChallenge(req: Request, res: Response) {
  try {
    const { language, difficulty, category } = req.body;
    
    // Validation
    if (!language || !difficulty || !category) {
      return res.status(400).json({
        success: false,
        error: 'Les paramètres language, difficulty et category sont requis'
      });
    }
    
    // Créer la prompt pour l'IA
    const systemMessage = {
      role: 'system' as 'system',
      content: `Tu es un expert en création de cas pratiques professionnels de programmation ${language === 'python' ? 'Python' : 'SQL'}.
      Génère un cas d'usage professionnel de difficulté ${difficulty} dans la catégorie "${category}".
      
      CONTEXTE PROFESSIONNEL À CHOISIR ALÉATOIREMENT:
      - Utilise toujours le cabinet de conseil mc2i comme employeur ou prestataire
      - Pour un scénario impliquant une direction Data & IA, utilise le nom DIXIT
      - Pour un scénario impliquant une entité dans l'industrie, transport, service public ou santé, utilise le nom IMPULSE
      
      INSTRUCTIONS IMPORTANTES:
      - CHOISIS DE FAÇON ALÉATOIRE ENTRE UN CLIENT DIXIT ET UN CLIENT IMPULSE
      - SÉLECTIONNE DE FAÇON ALÉATOIRE DEUX OU TROIS PERSONNAGES PARMI LA LISTE CI-DESSOUS
      - VARIE LES RÔLES ET LES INTERACTIONS ENTRE LES PERSONNAGES
      - NE FAVORISE PAS CERTAINS PERSONNAGES, ASSURE UNE DISTRIBUTION ÉQUITABLE
      
      PERSONNAGES DISPONIBLES (CHOISIS-EN ALÉATOIREMENT 2 OU 3):
        * Eddy MISSONI (consultant data)
        * Neil LEVIN (data scientist senior)
        * Yousra SAIDANI (cheffe de projet)
        * Fares SAYADI (consultant BI)
        * Guillaume LECHEVALLIER (Directeur IMPULSE)
        * Nosing DOEUK (Directeur IMPULSE)
        * Arnaud GAUTHIER (Président)
        * Olivier HERVO (Directeur Général)
      
      Structure ta réponse en JSON valide STRICTEMENT avec le format suivant, sans aucun texte avant ou après:
      {
        "title": "Titre court et concis sur le cas d'usage professionnel",
        "description": "Mise en situation professionnelle détaillée incluant le contexte, les personnages nommés ci-dessus, le cabinet mc2i, et les entités DIXIT ou IMPULSE selon le cas. Décris précisément les objectifs métier, les contraintes techniques et les livrables attendus.",
        "initialCode": "Code de départ que l'utilisateur pourra modifier",
        "expectedOutput": "Description ou exemple de la sortie attendue",
        "validationCriteria": ["Critère 1", "Critère 2"],
        "hints": ["Indice 1", "Indice 2"],
        "solution": "Code solution complète de référence",
        "difficulty": "${difficulty}",
        "category": "${category}",
        "language": "${language}"
      }
      
      IMPORTANT: Ta réponse NE DOIT CONTENIR QUE le JSON VALIDE, sans aucun autre texte, markdown ou formatage. Veille à ce que toutes les guillemets soient correctement échappées dans les chaînes de caractères.
      
      Pour Python:
      - Crée un cas d'usage réaliste d'entreprise (analyse de données clients, automatisation, prédiction, etc.)
      - Assure-toi que le code initial est fonctionnel mais incomplet
      - Inclus des commentaires pédagogiques
      - Si c'est un exercice de Data Science, utilise des bibliothèques standard (pandas, numpy, matplotlib)
      
      Pour SQL:
      - Crée un cas d'usage réaliste d'entreprise (analyse de base client, reporting, optimisation de requêtes, etc.)
      - Inclus des commentaires expliquant le schéma de la base de données
      - Utilise des noms de tables et colonnes intuitifs liés au contexte métier
      - Si le niveau est avancé, inclus des considérations de performance`
    };

    const userMessage = {
      role: 'user' as 'user',
      content: `Génère un cas pratique professionnel de programmation ${language} de niveau ${difficulty} dans la catégorie ${category}. Choisis aléatoirement entre DIXIT et IMPULSE, et sélectionne aléatoirement 2 ou 3 personnages parmi la liste fournie. Assure-toi de bien varier les personnages et les rôles d'un scénario à l'autre.`
    };

    // Appel à l'API Azure OpenAI
    const response = await openAIService.getChatCompletion(
      [systemMessage, userMessage],
      true, // useSecondaryKey
      0.7,  // temperature pour plus de créativité
      1200  // max_tokens pour réponses plus longues
    );

    try {
      // Extraire le JSON de la réponse
      let jsonContent = response;
      
      // Chercher d'abord à isoler le JSON s'il est entouré de texte
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```|```\s*([\s\S]*?)\s*```|\{[\s\S]*\}/);
      if (jsonMatch) {
        // Prendre le premier groupe non undefined ou la correspondance complète
        jsonContent = jsonMatch[1] || jsonMatch[2] || jsonMatch[0];
      }
      
      // Nettoyer le json: enlever les caractères non-JSON potentiels en début et fin
      jsonContent = jsonContent.trim();
      if (!jsonContent.startsWith('{')) {
        jsonContent = jsonContent.substring(jsonContent.indexOf('{'));
      }
      if (!jsonContent.endsWith('}')) {
        jsonContent = jsonContent.substring(0, jsonContent.lastIndexOf('}') + 1);
      }
      
      // Parser le JSON nettoyé
      const challenge = JSON.parse(jsonContent);
      
      // Générer un ID unique
      challenge.id = `challenge-${language}-${Date.now()}`;
      
      return res.status(200).json({
        success: true,
        challenge
      });
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      return res.status(500).json({
        success: false,
        error: 'Format de réponse incorrect',
        rawResponse: response
      });
    }
  } catch (error) {
    console.error('Erreur de génération de défi:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération du défi'
    });
  }
}

// Fonction pour évaluer la solution d'un utilisateur
export async function evaluateChallengeSolution(req: Request, res: Response) {
  try {
    const { challengeId, userCode, executionResult, language, challenge } = req.body;
    
    // Validation
    if (!userCode || !executionResult || !language || !challenge) {
      return res.status(400).json({
        success: false,
        error: 'Paramètres manquants pour l\'évaluation'
      });
    }
    
    // Créer la prompt pour l'IA
    const systemMessage = {
      role: 'system' as 'system',
      content: `Tu es un évaluateur expert en programmation ${language === 'python' ? 'Python' : 'SQL'}.
      Analyse la solution proposée par l'utilisateur pour un exercice et évalue sa qualité.
      
      Réponds UNIQUEMENT en JSON valide avec le format suivant, sans aucun texte avant ou après:
      {
        "isCorrect": boolean (true si la solution est correcte),
        "score": nombre entre 0 et 100,
        "feedback": "Feedback détaillé sur la solution",
        "strengths": ["Point fort 1", "Point fort 2"],
        "improvements": ["Suggestion d'amélioration 1", "Suggestion d'amélioration 2"],
        "nextSteps": "Suggestion pour aller plus loin"
      }
      
      IMPORTANT: Ta réponse NE DOIT CONTENIR QUE le JSON VALIDE, sans aucun autre texte, markdown ou formatage. Veille à ce que toutes les guillemets soient correctement échappées dans les chaînes de caractères.
      
      Sois encourageant dans ton feedback, même si la solution n'est pas parfaite.
      Si le code ne répond pas du tout au problème, explique pourquoi et donne des indices.
      Sois précis dans tes suggestions d'amélioration.`
    };

    const userMessage = {
      role: 'user' as 'user',
      content: `Voici l'exercice à résoudre:
      
      Titre: ${challenge.title}
      Description: ${challenge.description}
      Sortie attendue: ${challenge.expectedOutput || 'Non spécifiée'}
      
      Voici la solution proposée par l'utilisateur:
      \`\`\`${language}
      ${userCode}
      \`\`\`
      
      Et voici le résultat de l'exécution:
      \`\`\`
      ${executionResult}
      \`\`\`
      
      Évalue cette solution selon les critères suivants:
      ${challenge.validationCriteria ? '- ' + challenge.validationCriteria.join('\n- ') : 'Pas de critères spécifiques'}`
    };

    // Appel à l'API Azure OpenAI
    const response = await openAIService.getChatCompletion(
      [systemMessage, userMessage],
      true, // useSecondaryKey
      0.5,  // temperature
      1000  // max_tokens
    );

    try {
      // Extraire le JSON de la réponse
      let jsonContent = response;
      
      // Chercher d'abord à isoler le JSON s'il est entouré de texte
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```|```\s*([\s\S]*?)\s*```|\{[\s\S]*\}/);
      if (jsonMatch) {
        // Prendre le premier groupe non undefined ou la correspondance complète
        jsonContent = jsonMatch[1] || jsonMatch[2] || jsonMatch[0];
      }
      
      // Nettoyer le json: enlever les caractères non-JSON potentiels en début et fin
      jsonContent = jsonContent.trim();
      if (!jsonContent.startsWith('{')) {
        jsonContent = jsonContent.substring(jsonContent.indexOf('{'));
      }
      if (!jsonContent.endsWith('}')) {
        jsonContent = jsonContent.substring(0, jsonContent.lastIndexOf('}') + 1);
      }
      
      // Parser le JSON nettoyé
      const evaluation = JSON.parse(jsonContent);
      
      return res.status(200).json({
        success: true,
        evaluation
      });
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError);
      return res.status(500).json({
        success: false,
        error: 'Format de réponse incorrect',
        rawResponse: response
      });
    }
  } catch (error) {
    console.error('Erreur d\'évaluation:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'évaluation de la solution'
    });
  }
}

// Fonction pour obtenir les catégories de défis
export function getChallengeCategories(req: Request, res: Response) {
  try {
    const { language } = req.params;
    
    if (language !== 'python' && language !== 'sql') {
      return res.status(400).json({
        success: false,
        error: 'Language non supporté. Valeurs acceptées: python, sql'
      });
    }
    
    return res.status(200).json({
      success: true,
      categories: CHALLENGE_CATEGORIES[language]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
}

// Fonction pour obtenir un indice supplémentaire
export async function getAdditionalHint(req: Request, res: Response) {
  try {
    const { challengeId, userCode, language, challenge, usedHints } = req.body;
    
    // Validation
    if (!userCode || !language || !challenge) {
      return res.status(400).json({
        success: false,
        error: 'Paramètres manquants'
      });
    }
    
    // Créer la prompt pour l'IA
    const systemMessage = {
      role: 'system' as 'system',
      content: `Tu es un tuteur expert en programmation ${language === 'python' ? 'Python' : 'SQL'}.
      L'utilisateur est bloqué sur un exercice et a besoin d'un indice supplémentaire.
      
      Analyse son code actuel et fournit un indice utile, sans donner directement la solution.
      L'indice doit être précis et adapté au niveau de l'exercice (${challenge.difficulty}).
      
      Sois encourageant et pédagogique.`
    };

    const userMessage = {
      role: 'user' as 'user',
      content: `Je suis bloqué(e) sur cet exercice:
      
      Titre: ${challenge.title}
      Description: ${challenge.description}
      
      Voici mon code actuel:
      \`\`\`${language}
      ${userCode}
      \`\`\`
      
      J'ai déjà utilisé les indices suivants:
      ${usedHints && usedHints.length > 0 ? '- ' + usedHints.join('\n- ') : 'Aucun indice utilisé jusqu\'à présent.'}
      
      Pourrais-tu me donner un indice supplémentaire qui m'aiderait à avancer sans me donner directement la solution?`
    };

    // Appel à l'API Azure OpenAI
    const hint = await openAIService.getChatCompletion(
      [systemMessage, userMessage],
      true, // useSecondaryKey
      0.7,  // temperature
      400   // max_tokens
    );
    
    return res.status(200).json({
      success: true,
      hint: hint.trim()
    });
  } catch (error) {
    console.error('Erreur lors de la génération d\'indice:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la génération d\'indice'
    });
  }
}