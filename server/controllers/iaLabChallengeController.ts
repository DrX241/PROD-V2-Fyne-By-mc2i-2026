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

// Fonction utilitaire pour traiter une chaîne de caractères et extraire un JSON valide
function extractValidJSON(content: string): string {
  console.log("Tentative d'extraction d'un JSON valide...");
  
  // 1. Nettoyage général
  let cleanedContent = content.trim();
  
  // 2. Rechercher le premier '{' et le dernier '}'
  const startIndex = cleanedContent.indexOf('{');
  const endIndex = cleanedContent.lastIndexOf('}');
  
  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    console.error("Impossible de trouver un objet JSON valide dans la chaîne");
    return "{}"; // JSON minimal valide
  }
  
  // 3. Extraire le JSON potentiel
  let jsonContent = cleanedContent.substring(startIndex, endIndex + 1);
  
  // 4. Essayer de parser pour voir si c'est déjà valide
  try {
    JSON.parse(jsonContent);
    console.log("JSON valide trouvé sans modifications");
    return jsonContent;
  } catch (error) {
    console.log("JSON initial non valide, tentative de correction...");
  }
  
  // 5. Nettoyer les problèmes courants
  try {
    // Échapper les guillemets et caractères spéciaux
    let fixedJson = jsonContent
      // Réparer les guillemets et échappements
      .replace(/\\\\/g, "\\")
      .replace(/\\"/g, '"')
      .replace(/(?<!\\)"/g, '\\"')
      .replace(/\\\\"/g, '\\"')
      // Réparer les sauts de ligne non échappés dans les chaînes
      .replace(/(?<=")[\n\r]+(?!")/g, "\\n")
      // Normaliser les guillemets (simples vers doubles)
      .replace(/'/g, '"');
    
    try {
      JSON.parse(fixedJson);
      console.log("JSON corrigé avec succès");
      return fixedJson;
    } catch (e) {
      console.log("Échec de la première méthode de correction");
    }
    
    // Tenter avec une méthode simplifiée: créer un JSON minimal avec les informations essentielles
    try {
      // Extraire le titre s'il existe
      const titleMatch = jsonContent.match(/"title"\s*:\s*"([^"]+)"/);
      const title = titleMatch ? titleMatch[1] : "Défi généré";
      
      // Extraire la description s'il existe
      const descMatch = jsonContent.match(/"description"\s*:\s*"([^"]+)"/);
      const description = descMatch ? descMatch[1] : "Pas de description disponible";
      
      // Créer un objet minimal valide
      const minimalObject = {
        title,
        description,
        initialCode: "# Défi généré automatiquement\n# Écrivez votre solution ici",
        hints: ["Analysez bien le problème", "Pensez étape par étape", "N'hésitez pas à utiliser des fonctions auxiliaires"],
      };
      
      console.log("Utilisation d'un objet minimal comme fallback");
      return JSON.stringify(minimalObject);
    } catch (e2) {
      console.error("Impossible de créer un objet minimal:", e2);
      return "{}";
    }
  } catch (error) {
    console.error("Erreur lors du nettoyage du JSON:", error);
    return "{}";
  }
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

// Secteurs d'activité supprimés selon les instructions

// Fonction pour générer un défi via l'IA
export async function generateChallenge(req: Request, res: Response) {
  try {
    const { language, difficulty, category, sector } = req.body;
    
    // Validation
    if (!language || !difficulty || !category) {
      return res.status(400).json({
        success: false,
        error: 'Les paramètres language, difficulty et category sont requis'
      });
    }
    
    // Le secteur est optionnel
    
    // Générer une graine aléatoire pour la sélection des personnages
    const generateRandomSeed = (minVal = 1, maxVal = 1000) => Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
    
    // Créer la prompt pour l'IA
    const systemMessage = {
      role: 'system' as 'system',
      content: `Tu es un expert en création d'exercices et défis de programmation ${language === 'python' ? 'Python' : 'SQL'}.
      Génère un défi concis de difficulté ${difficulty} dans la catégorie "${category}".
      
      FORMAT SIMPLIFIÉ:
      - Crée un défi court et précis, sans noms de personnes ou d'entreprises spécifiques
      - Privilégie le format direct: "Voici votre mission... Voici les données dont vous disposez..."
      - Évite les situations narratives complexes avec des personnages
      - Utilise un maximum de 3-4 paragraphes pour l'ensemble de la description
      - Focalise-toi sur les compétences techniques plutôt que sur le contexte
      
      CONSIGNES DE FORMATAGE POUR TA RÉPONSE:
      1. Ta réponse doit être UNIQUEMENT un objet JSON VALIDE, sans texte avant ou après, similaire à :
      {
        "title": "Titre court",
        "description": "Description structurée en sections",
        "initialCode": "Code de départ",
        "expectedOutput": "Format de sortie attendu",
        "hints": ["Indice 1", "Indice 2", "Indice 3"],
        "solution": "Solution complète",
        "difficulty": "${difficulty}",
        "category": "${category}",
        "language": "${language}"
      }

      2. Pour la description, utilise exactement cette structure:
      "description": "## CONTEXTE\\nContexte professionnel avec les 3 personnages.\\n\\n## DONNÉES\\nDonnées disponibles avec exemples.\\n\\n## OBJECTIF\\nTâche à accomplir."
      
      3. Pour l'initialCode, inclus:
      - Import des bibliothèques 
      - Commentaires explicatifs
      - Squelette de fonction avec TODO
      - Échantillon de données d'exemple
      
      4. PROBLÈMES COURANTS À ÉVITER:
      - N'utilise pas d'échappements complexes comme \\\\n (utilise \\n)
      - N'utilise pas de triple guillemets
      - Assure-toi que les guillemets dans les chaînes sont correctement échappés
      - Vérifie qu'il n'y a pas de virgule après le dernier élément d'un objet/tableau
      
      IMPORTANT: NE réponds qu'avec le JSON pur. PAS de texte avant, pas de texte après, pas de ```json```, juste l'objet JSON.
      
      Pour Python:
      - Crée un cas d'usage réaliste d'entreprise (analyse de données clients, automatisation, prédiction, etc.)
      - La section DONNÉES doit inclure des exemples précis et concrets des données disponibles (DataFrame, dictionnaires, listes, etc.)
      - La section OBJECTIF doit expliquer clairement ce que l'utilisateur doit accomplir et les critères d'évaluation
      - Assure-toi que le code initial est fonctionnel mais incomplet, avec des commentaires TODO explicites
      - Inclus des commentaires pédagogiques expliquant le format des données et les attentes
      - Si c'est un exercice de Data Science, utilise des bibliothèques standard (pandas, numpy, matplotlib)
      - Fournis un exemple clair du résultat attendu
      
      Pour SQL:
      - Crée un cas d'usage réaliste d'entreprise (analyse de base client, reporting, optimisation de requêtes, etc.)
      - La section DONNÉES doit décrire précisément les tables, leurs colonnes et les relations entre elles
      - La section OBJECTIF doit expliquer clairement quelles informations doivent être extraites et pourquoi
      - Inclus des commentaires expliquant le schéma de la base de données avec des exemples de données
      - Utilise des noms de tables et colonnes intuitifs liés au contexte métier
      - Fournis un exemple de résultat attendu avec la structure des colonnes
      - Si le niveau est avancé, inclus des considérations de performance`
    };

    const userMessage = {
      role: 'user' as 'user',
      content: `Génère un défi concis de programmation ${language} de niveau ${difficulty} dans la catégorie ${category}.
      
      INSTRUCTIONS:
      1. Crée un exercice technique direct sans histoire complexe ni personnages.
      2. Structure la description en 3 parties: MISSION, DONNÉES, OBJECTIF.
      3. Utilise un contexte professionnel réaliste et concis.
      
      RAPPEL DE FORMATAGE:
      - Ta réponse doit être un objet JSON VALIDE pur, sans texte additionnel.
      - Évite les structures complexes qui pourraient causer des erreurs de parsing JSON.
      - Échappe correctement les guillemets et sauts de ligne.
      - N'utilise que des guillemets doubles pour les noms de propriétés et les chaînes.`
    };

    // Appel à l'API Azure OpenAI
    const response = await openAIService.getChatCompletion(
      [systemMessage, userMessage],
      true, // useSecondaryKey
      0.7,  // temperature pour plus de créativité
      1200  // max_tokens pour réponses plus longues
    );

    try {
      console.log("Réponse brute reçue du modèle (25 premiers caractères):", response.substring(0, 25) + "...");
      
      // Utiliser la fonction utilitaire pour extraire un JSON valide
      const validJsonStr = extractValidJSON(response);
      console.log("JSON validé obtenu (25 premiers caractères):", validJsonStr.substring(0, 25) + "...");
      
      // Parser le JSON validé
      let challenge;
      try {
        challenge = JSON.parse(validJsonStr);
        console.log("Parsing JSON réussi, propriétés trouvées:", Object.keys(challenge).join(", "));
      } catch (error) {
        console.error("Erreur lors du parsing JSON final:", error);
        
        // Créer un objet challenge minimal en dernier recours
        challenge = {
          title: "Défi généré automatiquement",
          description: "## MISSION\nUn défi a été créé mais n'a pas pu être correctement formaté. Vous pouvez toujours essayer de résoudre le problème suivant.\n\n## DONNÉES\nUtilisez votre créativité et vos compétences en programmation.\n\n## OBJECTIF\nÉcrire un programme qui résout un problème de traitement de données simple.",
          initialCode: `# Défi de programmation ${language}
# Écrivez votre solution ici
`,
          hints: ["Analysez le problème étape par étape", "Utilisez des structures de données appropriées", "Testez votre code avec différents cas"],
          difficulty: difficulty,
          category: category,
          language: language
        };
        console.log("Utilisation d'un objet challenge minimal en dernier recours");
      }
      
      // Générer un ID unique
      challenge.id = `challenge-${language}-${Date.now()}`;
      
      // Section secteur supprimée selon les instructions
      
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
      console.log("Réponse d'évaluation brute (25 premiers caractères):", response.substring(0, 25) + "...");
      
      // Utiliser la fonction utilitaire pour extraire un JSON valide
      const validJsonStr = extractValidJSON(response);
      console.log("JSON d'évaluation validé (25 premiers caractères):", validJsonStr.substring(0, 25) + "...");
      
      // Parser le JSON validé
      let evaluation;
      try {
        evaluation = JSON.parse(validJsonStr);
        console.log("Parsing JSON d'évaluation réussi, propriétés:", Object.keys(evaluation).join(", "));
      } catch (error) {
        console.error("Erreur lors du parsing JSON d'évaluation final:", error);
        
        // Créer un objet d'évaluation minimal en dernier recours
        evaluation = {
          isCorrect: false,
          score: 50,
          feedback: "Impossible d'évaluer précisément votre code en raison d'une erreur technique. Voici quelques conseils généraux : vérifiez la syntaxe de votre code, assurez-vous qu'il répond bien à tous les critères du défi, et testez-le avec différents cas.",
          strengths: ["Tentative de résolution du problème"],
          improvements: ["Vérifiez votre syntaxe", "Assurez-vous de répondre à tous les critères du défi"],
          nextSteps: "Révisez votre solution et soumettez-la à nouveau."
        };
        console.log("Utilisation d'un objet d'évaluation minimal en dernier recours");
      }
      
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

// Fonction pour obtenir les secteurs d'activité supprimée selon les instructions

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