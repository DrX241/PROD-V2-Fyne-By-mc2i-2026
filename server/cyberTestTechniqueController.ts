import { Request, Response } from 'express';
import axios from 'axios';

// Catégories de tests disponibles
export const TEST_CATEGORIES = [
  { id: 'network-security', name: 'Sécurité Réseau', icon: 'network' },
  { id: 'web-security', name: 'Sécurité Web', icon: 'globe' },
  { id: 'cryptography', name: 'Cryptographie', icon: 'lock' },
  { id: 'malware-analysis', name: 'Analyse de Malware', icon: 'virus' },
  { id: 'forensics', name: 'Investigation Numérique', icon: 'search' },
  { id: 'cloud-security', name: 'Sécurité Cloud', icon: 'cloud' },
  { id: 'secure-coding', name: 'Programmation Sécurisée', icon: 'code' },
  { id: 'incident-response', name: 'Réponse aux Incidents', icon: 'alert' }
];

// Niveaux de difficulté
export const DIFFICULTY_LEVELS = [
  { id: 'beginner', name: 'Débutant' },
  { id: 'intermediate', name: 'Intermédiaire' },
  { id: 'advanced', name: 'Avancé' },
  { id: 'expert', name: 'Expert' }
];

// Types d'exercices
export const EXERCISE_TYPES = [
  { id: 'mcq', name: 'QCM', description: 'Questions à choix multiples' },
  { id: 'code', name: 'Code', description: 'Exercices de code à compléter' },
  { id: 'scenario', name: 'Mise en situation', description: 'Scénarios concrets à analyser' },
  { id: 'open', name: 'Questions ouvertes', description: 'Questions nécessitant une réponse détaillée' },
];

// Format de base pour les questions
interface QuizQuestion {
  id: string;
  type: 'mcq' | 'code' | 'scenario' | 'open';
  question: string;
  options?: string[];
  correctAnswer?: number;
  code?: string;
  codeLanguage?: string;
  solution?: string;
  expectedOutput?: string;
  context?: string;
  explanation: string;
  category: string;
  difficulty: string;
  tags?: string[];
  points?: number;
}

// Cache pour les questions générées
interface QuestionCache {
  questions: QuizQuestion[];
  category: string;
  difficulty: string;
  exerciseType?: string;  // Type d'exercice optionnel
  timestamp: number;
}

// Durée de validité du cache en ms (30 min)
const CACHE_EXPIRY = 30 * 60 * 1000;

// Stockage du cache
const questionCaches: QuestionCache[] = [];

/**
 * Génère des questions de secours basiques en cas d'échec de l'IA
 * Cette fonction fournit des questions prédéfinies pour éviter une erreur complète
 */
function generateFallbackQuestions(category: string, difficulty: string, count: number, exerciseType?: string): QuizQuestion[] {
  // Si un type d'exercice est spécifié, générer des questions de ce type uniquement
  const questionType = exerciseType || 'mcq'; // Par défaut, on génère des QCM
  
  const fallbackQuestions: QuizQuestion[] = [
    {
      id: `${category}_${difficulty}_fallback_1`,
      type: questionType as 'mcq' | 'code' | 'scenario' | 'open',
      question: 'Quelle mesure de sécurité protège contre les attaques par force brute sur les mots de passe?',
      options: ['Limitation du nombre de tentatives', 'Chiffrement des données', 'Pare-feu applicatif', 'Sauvegarde régulière'],
      correctAnswer: 0,
      explanation: 'La limitation du nombre de tentatives est une mesure efficace contre les attaques par force brute car elle empêche un attaquant de tester un grand nombre de mots de passe en peu de temps.',
      category,
      difficulty,
      tags: ['authentication', 'password-security'],
      points: 10
    },
    {
      id: `${category}_${difficulty}_fallback_2`,
      type: 'mcq',
      question: 'Quel protocole cryptographique remplace HTTP pour sécuriser les communications web?',
      options: ['FTP', 'SMTP', 'HTTPS', 'DHCP'],
      correctAnswer: 2,
      explanation: 'HTTPS (HyperText Transfer Protocol Secure) est la version sécurisée du protocole HTTP, utilisant TLS/SSL pour chiffrer les communications entre le navigateur et le serveur web.',
      category,
      difficulty,
      tags: ['web-security', 'encryption'],
      points: 10
    },
    {
      id: `${category}_${difficulty}_fallback_3`,
      type: 'mcq',
      question: 'Quelle technique permet de contrôler les accès aux ressources informatiques en fonction des rôles des utilisateurs?',
      options: ['RBAC (Role-Based Access Control)', 'VPN (Virtual Private Network)', 'DDoS (Distributed Denial of Service)', 'DNS (Domain Name System)'],
      correctAnswer: 0,
      explanation: 'Le contrôle d\'accès basé sur les rôles (RBAC) permet d\'attribuer des permissions en fonction du rôle de l\'utilisateur dans l\'organisation, simplifiant ainsi la gestion des accès.',
      category,
      difficulty,
      tags: ['access-control', 'identity-management'],
      points: 10
    },
    {
      id: `${category}_${difficulty}_fallback_4`,
      type: 'mcq',
      question: 'Quel type de logiciel malveillant chiffre les données de l\'utilisateur et demande une rançon pour les déchiffrer?',
      options: ['Ver informatique', 'Ransomware', 'Adware', 'Spyware'],
      correctAnswer: 1,
      explanation: 'Le ransomware est un type de logiciel malveillant qui chiffre les données de la victime et exige un paiement (rançon) pour fournir la clé de déchiffrement.',
      category,
      difficulty,
      tags: ['malware', 'ransomware'],
      points: 10
    },
    {
      id: `${category}_${difficulty}_fallback_5`,
      type: 'mcq',
      question: 'Quelle technique consiste à envoyer un email frauduleux pour obtenir des informations sensibles?',
      options: ['Phishing', 'Pharming', 'Spoofing', 'Sniffing'],
      correctAnswer: 0,
      explanation: 'Le phishing est une technique d\'ingénierie sociale où l\'attaquant se fait passer pour une entité de confiance afin d\'inciter la victime à révéler des informations sensibles.',
      category,
      difficulty,
      tags: ['social-engineering', 'phishing'],
      points: 10
    },
    {
      id: `${category}_${difficulty}_fallback_6`,
      type: 'mcq',
      question: 'Quel élément de sécurité réseau filtre le trafic entre différents réseaux?',
      options: ['Firewall', 'Router', 'Switch', 'Hub'],
      correctAnswer: 0,
      explanation: 'Un firewall (pare-feu) est conçu pour filtrer le trafic réseau entrant et sortant selon des règles de sécurité prédéfinies, protégeant ainsi le réseau contre les accès non autorisés.',
      category,
      difficulty,
      tags: ['network-security', 'firewall'],
      points: 10
    },
    {
      id: `${category}_${difficulty}_fallback_7`,
      type: 'mcq',
      question: 'Quelle technologie permet d\'établir une connexion sécurisée à travers un réseau public comme Internet?',
      options: ['DNS', 'DHCP', 'VPN', 'NAT'],
      correctAnswer: 2,
      explanation: 'Un VPN (Virtual Private Network) crée un tunnel chiffré à travers un réseau public, permettant une connexion sécurisée et privée entre des réseaux distants ou un utilisateur et un réseau.',
      category,
      difficulty,
      tags: ['network-security', 'vpn'],
      points: 10
    },
    {
      id: `${category}_${difficulty}_fallback_8`,
      type: 'mcq',
      question: 'Quel principe de sécurité consiste à utiliser plusieurs couches de protection?',
      options: ['Défense en profondeur', 'Principe du moindre privilège', 'Séparation des tâches', 'Sécurité par l\'obscurité'],
      correctAnswer: 0,
      explanation: 'La défense en profondeur est une stratégie qui utilise plusieurs couches de sécurité, de sorte que si une couche est compromise, d\'autres couches continuent à protéger le système.',
      category,
      difficulty,
      tags: ['security-principles', 'defense-in-depth'],
      points: 10
    },
    {
      id: `${category}_${difficulty}_fallback_9`,
      type: 'mcq',
      question: 'Quel type d\'attaque exploite les vulnérabilités dans le code d\'une application web pour injecter du code malveillant?',
      options: ['Cross-Site Scripting (XSS)', 'SQL Injection', 'Brute Force', 'Social Engineering'],
      correctAnswer: 0,
      explanation: 'Le Cross-Site Scripting (XSS) permet à un attaquant d\'injecter du code JavaScript malveillant qui s\'exécute dans le navigateur de la victime, pouvant ainsi voler des informations ou effectuer des actions non autorisées.',
      category,
      difficulty,
      tags: ['web-security', 'xss'],
      points: 10
    },
    {
      id: `${category}_${difficulty}_fallback_10`,
      type: 'mcq',
      question: 'Quelle méthode d\'authentification utilise des caractéristiques physiques ou comportementales pour vérifier l\'identité?',
      options: ['Biométrie', 'Authentification à deux facteurs', 'Single Sign-On', 'CAPTCHA'],
      correctAnswer: 0,
      explanation: 'La biométrie utilise des caractéristiques uniques comme les empreintes digitales, la reconnaissance faciale ou vocale pour authentifier les utilisateurs de manière plus sécurisée que les mots de passe traditionnels.',
      category,
      difficulty,
      tags: ['authentication', 'biometrics'],
      points: 10
    }
  ];
  
  // Retourner le nombre demandé de questions, avec un minimum de 5
  return fallbackQuestions.slice(0, Math.max(5, count));
}

/**
 * Génère dynamiquement des questions de test technique en cybersécurité
 * en utilisant l'IA
 */
export async function generateQuestions(req: Request, res: Response) {
  try {
    const { category, difficulty, exerciseType, count = 10 } = req.body;

    if (!category || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Category and difficulty are required'
      });
    }
    
    // Valider le type d'exercice s'il est fourni
    if (exerciseType && !EXERCISE_TYPES.some(t => t.id === exerciseType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exercise type'
      });
    }

    // Vérifier si des questions sont déjà en cache
    const cachedQuestions = getCachedQuestions(category, difficulty, exerciseType);
    if (cachedQuestions.length > 0) {
      return res.status(200).json({
        success: true,
        questions: cachedQuestions.slice(0, count),
        fromCache: true
      });
    }

    // Configuration de la requête OpenAI
    const categoryInfo = TEST_CATEGORIES.find(c => c.id === category);
    const difficultyInfo = DIFFICULTY_LEVELS.find(d => d.id === difficulty);

    if (!categoryInfo || !difficultyInfo) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category or difficulty'
      });
    }

    // Systemprompt pour l'IA
    const systemPrompt = `Tu es un expert en cybersécurité spécialisé dans la conception de tests techniques avancés.
Génère ${count} questions variées dans la catégorie "${categoryInfo.name}" avec un niveau de difficulté "${difficultyInfo.name}".
Les questions doivent être pertinentes, précises et refléter les connaissances et compétences attendues d'un professionnel de la cybersécurité.

Crée un MÉLANGE des types de questions suivants:
1. QCM (type: "mcq"): Questions à choix multiples avec 4 options et une seule bonne réponse
2. Exercices de code (type: "code"): Snippets de code à compléter ou à corriger
3. Mises en situation (type: "scenario"): Scénarios d'entreprise où il faut proposer une solution
4. Questions ouvertes (type: "open"): Questions nécessitant une réponse développée

Fournit également une explication détaillée pour chaque réponse correcte, qui sera affichée après que l'utilisateur ait répondu.
Attribue un nombre de points pour chaque question (plus de points pour les questions difficiles).

Réponds UNIQUEMENT au format JSON suivant:
[
  {
    "id": "question_unique_id",
    "type": "mcq", // Type de question: "mcq", "code", "scenario", "open"
    "question": "Question complète",
    "options": ["Option A", "Option B", "Option C", "Option D"], // Pour les QCM uniquement
    "correctAnswer": 0, // Index de la réponse correcte (0-3) pour les QCM uniquement
    "code": "// Code à compléter ou corriger\\nfunction detectMalware() {\\n  // Code incomplet\\n}", // Pour les exercices de code uniquement
    "codeLanguage": "javascript", // Langage du code (pour les exercices de code uniquement)
    "solution": "// Solution attendue\\nfunction detectMalware() {\\n  // Code complet\\n}", // Pour les exercices de code uniquement
    "expectedOutput": "Résultat attendu", // Pour les exercices de code uniquement
    "context": "Description du contexte de l'entreprise", // Pour les mises en situation uniquement
    "explanation": "Explication détaillée de la réponse correcte",
    "category": "${category}",
    "difficulty": "${difficulty}",
    "tags": ["tag1", "tag2"], // Mots-clés pertinents pour la question
    "points": 10 // Nombre de points pour cette question
  },
  ...
]
`;

    // Ajuster les instructions selon le type d'exercice spécifiquement demandé
    let exerciseTypesForDifficulty = "";
    
    // Si un type d'exercice spécifique est demandé, on se concentre uniquement sur ce type
    if (exerciseType) {
      const exerciseTypeInfo = EXERCISE_TYPES.find(t => t.id === exerciseType);
      if (exerciseTypeInfo) {
        // Donner la priorité au type d'exercice sélectionné par l'utilisateur
        const typeName = exerciseTypeInfo.name;
        exerciseTypesForDifficulty = `IMPORTANT: Génère UNIQUEMENT des questions de type "${exerciseType}" (${typeName}).
Toutes les questions doivent être de ce type exact, ne génère aucun autre type de question.`;
      }
    } 
    // Sinon, on s'appuie sur la difficulté pour définir les ratios
    else {
      if (difficulty === 'beginner') {
        exerciseTypesForDifficulty = `Pour ce niveau débutant, inclus principalement des QCM (80%) et quelques questions de code simples (20%).`;
      } else if (difficulty === 'intermediate') {
        exerciseTypesForDifficulty = `Pour ce niveau intermédiaire, inclus un mélange de QCM (60%), exercices de code (30%) et scénarios pratiques (10%).`;
      } else if (difficulty === 'advanced') {
        exerciseTypesForDifficulty = `Pour ce niveau avancé, inclus un mélange équilibré de QCM (40%), exercices de code complexes (40%) et scénarios pratiques détaillés (20%).`;
      } else if (difficulty === 'expert') {
        exerciseTypesForDifficulty = `Pour ce niveau expert, privilégie les exercices de code complexes (50%), scénarios pratiques avancés (30%) et quelques QCM pointus (20%).`;
      }
    }
    
    // Ajouter des consignes spécifiques pour la catégorie
    let categorySpecificInstructions = "";
    if (category === 'secure-coding') {
      categorySpecificInstructions = `
Pour les exercices de code, utilise des langages comme Python, JavaScript, Java ou C++.
Voici quelques exemples:
1. Exercice de correction de vulnérabilités SQL Injection
2. Implémentation d'authentification sécurisée
3. Validation de données d'entrée
4. Gestion sécurisée des erreurs`;
    } else if (category === 'network-security') {
      categorySpecificInstructions = `
Pour les exercices pratiques, utilise des exemples comme:
1. Analyse de logs de pare-feu
2. Configuration de règles VPN
3. Détection d'intrusion réseau
4. Mise en place de segmentation réseau`;
    } else if (category === 'cloud-security') {
      categorySpecificInstructions = `
Pour les exercices pratiques, utilise des exemples comme:
1. Configuration de sécurité AWS/Azure/GCP
2. Mise en place de stratégies IAM
3. Chiffrement des données dans le cloud
4. Architecture de sécurité cloud`;
    }
    
    const updatedSystemPrompt = `${systemPrompt}

${exerciseTypesForDifficulty}
${categorySpecificInstructions}

IMPORTANT: 
1. N'AJOUTE PAS de commentaires, explications ou formatage markdown autour du JSON.
2. VÉRIFIE que le JSON généré est strictement valide avant de répondre.
3. Pour les exercices de code, fournis un code à compléter ou corriger avec une solution claire.
4. Pour les exercices de type "scenario", décris un contexte professionnel réaliste avec un problème à résoudre.
5. Augmente progressivement la difficulté des questions en fonction du niveau demandé.`;

    // Appel à Azure OpenAI avec le prompt modifié
    const openAIResponse = await callAzureOpenAI(updatedSystemPrompt);
    
    if (!openAIResponse) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate questions'
      });
    }

    // Parser et valider les questions générées
    let questions: QuizQuestion[];
    try {
      // Extraire le JSON des réponses qui pourraient contenir des délimiteurs markdown
      let jsonStr = openAIResponse;
      console.log('Réponse JSON brute:', jsonStr.substring(0, 100) + '...');
      
      // Nettoyage de la réponse JSON
      try {
        // Si la réponse contient des délimiteurs de code markdown, extraire uniquement le JSON
        if (jsonStr.includes('```json')) {
          jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
        } else if (jsonStr.includes('```')) {
          jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
        }
        
        // Remplacer les sauts de ligne par des espaces pour éviter les erreurs de parsing JSON
        jsonStr = jsonStr.replace(/\n/g, ' ');
        
        // Nettoyer les échappements de caractères potentiellement problématiques
        jsonStr = jsonStr.replace(/\\\\/g, '\\').replace(/\\"/g, '"').replace(/\\'/g, "'");
        
        // Supprimer les commentaires en ligne qui ne sont pas valides en JSON
        jsonStr = jsonStr.replace(/\/\/.*$/gm, '');
        
        // Corriger les chaînes non terminées
        const regex = /"([^"]*)$/g;
        jsonStr = jsonStr.replace(regex, '"$1"');
        
        // Tentative de réparation supplémentaire pour les JSON incomplets
        // Vérifier si le JSON se termine correctement
        if (!jsonStr.trim().endsWith(']')) {
          // Récupérer uniquement la partie valide jusqu'au dernier objet JSON complet
          const lastValidBraceIndex = jsonStr.lastIndexOf('}');
          if (lastValidBraceIndex > 0) {
            jsonStr = jsonStr.substring(0, lastValidBraceIndex + 1) + ']';
          }
        }
        
        // Tenter de parser le JSON réparé
        try {
          questions = JSON.parse(jsonStr);
        } catch (parseError) {
          // Si échec, essayer avec des questions par défaut
          console.error('Erreur de parsing JSON, utilisation de questions de secours:', parseError);
          
          // Générer des questions de secours basiques pour éviter une erreur complète
          questions = generateFallbackQuestions(category, difficulty, count, exerciseType);
        }
      } catch (jsonFixError) {
        console.error('Erreur lors de la réparation du JSON:', jsonFixError);
        console.error('JSON problématique:', jsonStr);
        
        // Générer des questions de secours basiques pour éviter une erreur complète
        questions = generateFallbackQuestions(category, difficulty, count, exerciseType);
      }
      
      // Validation basique
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid response format');
      }

      // S'assurer que chaque question a le bon format
      questions = questions.map((q, index) => ({
        ...q,
        id: q.id || `${category}_${difficulty}_${index}`,
        category: category,
        difficulty: difficulty
      }));

      // Stocker dans le cache
      cacheQuestions(questions, category, difficulty, exerciseType);

      return res.status(200).json({
        success: true,
        questions,
        fromCache: false
      });
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return res.status(500).json({
        success: false,
        message: 'Error parsing questions from AI',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  } catch (error) {
    console.error('Error generating questions:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Évalue les réponses de l'utilisateur et fournit un feedback détaillé
 */
export async function evaluateResponses(req: Request, res: Response) {
  try {
    const { responses, category, difficulty, exerciseType } = req.body;

    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({
        success: false,
        message: 'Valid responses array is required'
      });
    }

    // Récupérer les questions du cache
    const cachedQuestions = getCachedQuestions(category, difficulty, exerciseType);
    
    if (cachedQuestions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Questions not found in cache. Please generate questions first.'
      });
    }

    // Créer un dictionnaire des questions pour un accès facile
    const questionsMap = new Map<string, QuizQuestion>();
    cachedQuestions.forEach(q => questionsMap.set(q.id, q));

    // Calculer les résultats
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    
    const detailedResults = responses.map(response => {
      const question = questionsMap.get(response.questionId);
      
      if (!question) {
        return {
          questionId: response.questionId,
          isCorrect: false,
          message: 'Question not found',
          userAnswer: response.answer,
          correctAnswer: null,
          explanation: null,
          type: 'unknown'
        };
      }
      
      // Ajouter les points de la question au total
      const questionPoints = question.points || 10; // Valeur par défaut si non spécifié
      totalPoints += questionPoints;
      
      let isCorrect = false;
      
      // Évaluation différente selon le type de question
      switch (question.type) {
        case 'mcq':
          // Pour les QCM, vérifier si la réponse est exactement l'index correct
          isCorrect = response.answer === question.correctAnswer;
          break;
          
        case 'code':
          // Pour les exercices de code, utiliser une évaluation par l'IA
          // mais pour l'instant, considérer comme correct si la réponse contient certains mots clés de la solution
          if (question.solution && response.answer) {
            const solutionKeywords = question.solution.toLowerCase().split(/\s+/).filter(k => k.length > 4);
            const answerText = String(response.answer).toLowerCase();
            const matchPercentage = solutionKeywords.filter(keyword => answerText.includes(keyword)).length / solutionKeywords.length;
            isCorrect = matchPercentage > 0.7; // Plus de 70% des mots clés importants sont présents
          }
          break;
          
        case 'scenario':
        case 'open':
          // Pour les questions ouvertes et scénarios, utiliser une évaluation par l'IA
          // mais pour l'instant, considérer comme partiellement correct si la réponse est substantielle
          if (response.answer && String(response.answer).length > 50) {
            isCorrect = true; // Simplification temporaire
          }
          break;
          
        default:
          isCorrect = false;
      }
      
      // Ajouter les points au total gagné
      if (isCorrect) {
        correctCount++;
        earnedPoints += questionPoints;
      }

      return {
        questionId: response.questionId,
        isCorrect,
        userAnswer: response.answer,
        correctAnswer: question.type === 'mcq' ? question.correctAnswer : null,
        solution: question.type === 'code' ? question.solution : null,
        expectedOutput: question.type === 'code' ? question.expectedOutput : null,
        question: question.question,
        type: question.type,
        options: question.options,
        code: question.code,
        codeLanguage: question.codeLanguage,
        context: question.context,
        explanation: question.explanation,
        points: questionPoints,
        earnedPoints: isCorrect ? questionPoints : 0
      };
    });

    // Calculer le score basé sur les points
    const scoreByPoints = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const score = (correctCount / responses.length) * 100;

    // Analyser les résultats par type d'exercice
    const resultsByType = EXERCISE_TYPES.map(type => {
      const questionsOfType = detailedResults.filter(r => r.type === type.id);
      const correctOfType = questionsOfType.filter(r => r.isCorrect).length;
      const totalOfType = questionsOfType.length;
      const scoreOfType = totalOfType > 0 ? (correctOfType / totalOfType) * 100 : 0;
      
      return {
        type: type.id,
        name: type.name,
        totalQuestions: totalOfType,
        correctAnswers: correctOfType,
        score: scoreOfType
      };
    }).filter(t => t.totalQuestions > 0);

    // Génération d'une analyse par l'IA
    const analysisPrompt = `En tant qu'expert en cybersécurité spécialisé dans l'évaluation des compétences, analyse ces résultats de test:
- Catégorie: ${category}
- Niveau de difficulté: ${difficulty}
- Score global: ${score.toFixed(1)}% (${correctCount}/${responses.length} réponses correctes)
- Score pondéré par points: ${scoreByPoints.toFixed(1)}% (${earnedPoints}/${totalPoints} points)
- Performances par type d'exercice: ${resultsByType.map(t => 
  `${t.name}: ${t.score.toFixed(1)}% (${t.correctAnswers}/${t.totalQuestions})`).join(', ')}
- Détails des erreurs: ${detailedResults.filter(r => !r.isCorrect && r.question).map(r => 
  `[${r.type || 'unknown'}] ${String(r.question).substring(0, 50)}...`).join('; ')}

Fournis:
1) Une analyse des forces et faiblesses basée sur ces résultats
2) Des recommandations personnalisées pour améliorer les compétences dans les domaines faibles
3) Des ressources d'apprentissage recommandées pour chaque type d'exercice 
4) Le niveau estimé actuel et le potentiel de progression

Réponds avec un JSON de la forme:
{
  "summary": "Résumé global des performances",
  "strengths": ["Point fort 1", "Point fort 2", ...],
  "weaknesses": ["Point faible 1", "Point faible 2", ...],
  "recommendations": ["Recommandation 1", "Recommandation 2", ...],
  "performanceByType": [
    {"type": "mcq", "analysis": "Analyse des performances aux QCM"},
    {"type": "code", "analysis": "Analyse des performances aux exercices de code"},
    {"type": "scenario", "analysis": "Analyse des performances aux mises en situation"},
    {"type": "open", "analysis": "Analyse des performances aux questions ouvertes"}
  ],
  "resources": [
    {"title": "Titre ressource", "url": "URL optionnelle", "description": "Description courte", "type": "mcq"},
    {"title": "Titre ressource", "url": "URL optionnelle", "description": "Description courte", "type": "code"}
  ],
  "skillLevel": "Niveau estimé actuel",
  "nextSteps": "Prochaines étapes suggérées"
}`;

    const analysisResponse = await callAzureOpenAI(analysisPrompt);
    let analysis;
    
    try {
      if (analysisResponse) {
        console.log('Réponse d\'analyse brute:', analysisResponse.substring(0, 100) + '...');
        
        // Nettoyage de la réponse JSON
        try {
          let jsonStr = analysisResponse;
          // Si la réponse contient des délimiteurs de code markdown, extraire uniquement le JSON
          if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
          } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
          }
          
          // Remplacer les sauts de ligne par des espaces pour éviter les erreurs de parsing JSON
          jsonStr = jsonStr.replace(/\n/g, ' ');
          
          // Nettoyer les échappements de caractères potentiellement problématiques
          jsonStr = jsonStr.replace(/\\\\/g, '\\').replace(/\\"/g, '"').replace(/\\'/g, "'");
          
          // Supprimer les commentaires en ligne qui ne sont pas valides en JSON
          jsonStr = jsonStr.replace(/\/\/.*$/gm, '');
          
          // Corriger les chaînes non terminées
          const regex = /"([^"]*)$/g;
          jsonStr = jsonStr.replace(regex, '"$1"');
          
          // Tenter de parser le JSON réparé
          analysis = JSON.parse(jsonStr);
        } catch (jsonFixError) {
          console.error('Erreur lors de la réparation du JSON d\'analyse:', jsonFixError);
          console.error('JSON d\'analyse problématique:', analysisResponse);
          analysis = null;
        }
      } else {
        analysis = null;
      }
    } catch (error) {
      console.error('Error parsing analysis:', error);
      analysis = null;
    }

    return res.status(200).json({
      success: true,
      score,
      scoreByPoints,
      correctCount,
      totalQuestions: responses.length,
      totalPoints,
      earnedPoints,
      resultsByType,
      detailedResults,
      analysis
    });
  } catch (error) {
    console.error('Error evaluating responses:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Génère un certificat de réussite pour un test technique
 */
export async function generateCertificate(req: Request, res: Response) {
  try {
    const { name, category, difficulty, score, timestamp } = req.body;

    if (!name || !category || !difficulty || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, difficulty, and score are required'
      });
    }

    const categoryInfo = TEST_CATEGORIES.find(c => c.id === category);
    const difficultyInfo = DIFFICULTY_LEVELS.find(d => d.id === difficulty);

    if (!categoryInfo || !difficultyInfo) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category or difficulty'
      });
    }

    // Date pour le certificat
    const certDate = timestamp ? new Date(timestamp) : new Date();
    const dateString = certDate.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Génération d'un ID de certificat
    const certificateId = `CERT-${category.substr(0, 3).toUpperCase()}-${Math.floor(Math.random() * 10000)}-${Math.floor(Date.now() / 1000).toString(36).toUpperCase()}`;

    // Certificat au format HTML (pour pouvoir être imprimé ou converti en PDF côté client)
    const certificateHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificat de Compétence Cyber - mc2i</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      color: #333;
    }
    .certificate-container {
      max-width: 800px;
      margin: 50px auto;
      padding: 30px;
      background-color: white;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
      border-radius: 10px;
      position: relative;
      overflow: hidden;
    }
    .certificate-header {
      text-align: center;
      margin-bottom: 30px;
    }
    .certificate-title {
      font-size: 32px;
      color: #006a9e;
      margin-bottom: 10px;
      font-weight: bold;
    }
    .certificate-subtitle {
      font-size: 18px;
      color: #666;
    }
    .certificate-body {
      text-align: center;
      margin: 40px 0;
    }
    .recipient-name {
      font-size: 26px;
      color: #333;
      border-bottom: 2px solid #006a9e;
      padding-bottom: 5px;
      display: inline-block;
      margin-bottom: 20px;
    }
    .certificate-text {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .score {
      font-weight: bold;
      font-size: 24px;
      color: ${score >= 80 ? '#2e7d32' : score >= 60 ? '#ff9800' : '#e53935'};
    }
    .certificate-footer {
      margin-top: 50px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .signature-container {
      text-align: center;
    }
    .signature {
      border-top: 1px solid #666;
      padding-top: 5px;
      width: 200px;
      margin: 0 auto;
      font-style: italic;
    }
    .certificate-date {
      text-align: right;
      font-style: italic;
    }
    .certificate-id {
      position: absolute;
      bottom: 10px;
      right: 20px;
      font-size: 12px;
      color: #999;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 100px;
      opacity: 0.05;
      color: #006a9e;
      font-weight: bold;
      pointer-events: none;
      z-index: 0;
    }
    .badge {
      display: inline-block;
      padding: 5px 15px;
      background-color: #006a9e;
      color: white;
      border-radius: 20px;
      font-size: 14px;
      margin: 5px;
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    <div class="watermark">mc2i</div>
    <div class="certificate-header">
      <div class="certificate-title">Certificat de Compétence Cybersécurité</div>
      <div class="certificate-subtitle">I AM CYBER - Programme de Formation</div>
    </div>
    
    <div class="certificate-body">
      <div>Ce certificat atteste que</div>
      <div class="recipient-name">${name}</div>
      <div class="certificate-text">
        a démontré avec succès ses compétences en cybersécurité dans le domaine de
        <div class="badge">${categoryInfo.name}</div>
        avec un niveau de difficulté
        <div class="badge">${difficultyInfo.name}</div>
        <br><br>
        Score obtenu: <span class="score">${score}%</span>
      </div>
    </div>
    
    <div class="certificate-footer">
      <div class="signature-container">
        <div class="signature">Responsable Formation Cyber</div>
      </div>
      <div class="certificate-date">
        Délivré le ${dateString}
      </div>
    </div>
    
    <div class="certificate-id">
      ID: ${certificateId}
    </div>
  </div>
</body>
</html>
    `;

    return res.status(200).json({
      success: true,
      certificateId,
      certificateHTML,
      dateIssued: certDate,
      name,
      category: categoryInfo.name,
      difficulty: difficultyInfo.name,
      score
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Récupère les catégories et niveaux de difficulté disponibles
 */
export function getTestOptions(req: Request, res: Response) {
  try {
    return res.status(200).json({
      success: true,
      categories: TEST_CATEGORIES,
      difficulties: DIFFICULTY_LEVELS,
      exerciseTypes: EXERCISE_TYPES
    });
  } catch (error) {
    console.error('Error getting test options:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

/**
 * Récupère des questions du cache
 */
function getCachedQuestions(category: string, difficulty: string, exerciseType?: string): QuizQuestion[] {
  const cache = questionCaches.find(c => 
    c.category === category && 
    c.difficulty === difficulty &&
    c.exerciseType === exerciseType && 
    (Date.now() - c.timestamp) < CACHE_EXPIRY
  );
  
  return cache ? cache.questions : [];
}

/**
 * Stocke des questions dans le cache
 */
function cacheQuestions(questions: QuizQuestion[], category: string, difficulty: string, exerciseType?: string): void {
  // Supprimer l'ancien cache pour cette catégorie/difficulté/type d'exercice s'il existe
  const existingCacheIndex = questionCaches.findIndex(c => 
    c.category === category && 
    c.difficulty === difficulty && 
    c.exerciseType === exerciseType
  );
  
  if (existingCacheIndex !== -1) {
    questionCaches.splice(existingCacheIndex, 1);
  }
  
  // Ajouter le nouveau cache
  questionCaches.push({
    questions,
    category,
    difficulty,
    exerciseType,
    timestamp: Date.now()
  });
}

/**
 * Appelle Azure OpenAI avec une invite système
 * Utilise le modèle gpt-4o-mini qui est plus adapté pour des réponses de format spécifique
 */
async function callAzureOpenAI(systemPrompt: string): Promise<string | null> {
  try {
    // Utilisation du modèle gpt-4o-mini explicitement configuré dans l'application
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_KEY;
    
    // Utiliser le déploiement du modèle gpt-4o-mini spécifiquement
    const deploymentName = "Eddy-02-2025-gpt-4o-mini"; // Nom exact du déploiement observé dans les logs
    const apiVersion = "2024-12-01-preview"; // Version API observée dans les logs
    
    if (!endpoint || !apiKey) {
      console.error('Azure OpenAI configuration missing');
      return null;
    }

    // Ajouter une instruction pour garantir que la réponse est un JSON valide
    const enhancedPrompt = systemPrompt + `\n\nIMPORTANT: Ta réponse doit être un JSON valide et bien formaté. Assure-toi que les chaînes de caractères sont correctement échappées, qu'il n'y a pas de commentaires dans le JSON et que toutes les guillemets sont fermés correctement. Fournis uniquement le JSON brut sans aucun texte additionnel, sans délimiteurs de code markdown ni préfixes.`;

    const url = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;
    
    console.log(`Appel Azure OpenAI URL: ${url}`);
    
    const response = await axios.post(
      url,
      {
        messages: [
          { role: "system", content: enhancedPrompt }
        ],
        temperature: 0.2,
        top_p: 0.95,
        max_tokens: 2000,
        response_format: { type: "json_object" } // Forcer le format JSON pour les modèles récents
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey
        }
      }
    );

    console.log('Réponse Azure OpenAI reçue');
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Azure OpenAI:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}