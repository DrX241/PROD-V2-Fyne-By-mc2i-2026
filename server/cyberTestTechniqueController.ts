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

// Format de base pour les questions
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: string;
  tags?: string[];
}

// Cache pour les questions générées
interface QuestionCache {
  questions: QuizQuestion[];
  category: string;
  difficulty: string;
  timestamp: number;
}

// Durée de validité du cache en ms (30 min)
const CACHE_EXPIRY = 30 * 60 * 1000;

// Stockage du cache
const questionCaches: QuestionCache[] = [];

/**
 * Génère dynamiquement des questions de test technique en cybersécurité
 * en utilisant l'IA
 */
export async function generateQuestions(req: Request, res: Response) {
  try {
    const { category, difficulty, count = 10 } = req.body;

    if (!category || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Category and difficulty are required'
      });
    }

    // Vérifier si des questions sont déjà en cache
    const cachedQuestions = getCachedQuestions(category, difficulty);
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
    const systemPrompt = `Tu es un expert en cybersécurité spécialisé dans la conception de tests techniques.
Génère ${count} questions à choix multiples dans la catégorie "${categoryInfo.name}" avec un niveau de difficulté "${difficultyInfo.name}".
Les questions doivent être pertinentes, précises et refléter les connaissances et compétences attendues d'un professionnel de la cybersécurité.
Chaque question doit avoir exactement 4 options de réponse, avec une seule réponse correcte.
Fournit également une explication détaillée pour chaque réponse correcte, qui sera affichée après que l'utilisateur ait répondu.

Réponds UNIQUEMENT au format JSON suivant:
[
  {
    "id": "question_unique_id",
    "question": "Question complète",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0, // Index de la réponse correcte (0-3)
    "explanation": "Explication détaillée de la réponse correcte",
    "category": "${category}",
    "difficulty": "${difficulty}",
    "tags": ["tag1", "tag2"] // Mots-clés pertinents pour la question
  },
  ...
]
`;

    // Appel à Azure OpenAI
    const openAIResponse = await callAzureOpenAI(systemPrompt);
    
    if (!openAIResponse) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate questions'
      });
    }

    // Parser et valider les questions générées
    let questions: QuizQuestion[];
    try {
      questions = JSON.parse(openAIResponse);
      
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
      cacheQuestions(questions, category, difficulty);

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
        error: error.message
      });
    }
  } catch (error) {
    console.error('Error generating questions:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

/**
 * Évalue les réponses de l'utilisateur et fournit un feedback détaillé
 */
export async function evaluateResponses(req: Request, res: Response) {
  try {
    const { responses, category, difficulty } = req.body;

    if (!responses || !Array.isArray(responses)) {
      return res.status(400).json({
        success: false,
        message: 'Valid responses array is required'
      });
    }

    // Récupérer les questions du cache
    const cachedQuestions = getCachedQuestions(category, difficulty);
    
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
    const detailedResults = responses.map(response => {
      const question = questionsMap.get(response.questionId);
      
      if (!question) {
        return {
          questionId: response.questionId,
          isCorrect: false,
          message: 'Question not found',
          userAnswer: response.answer,
          correctAnswer: null,
          explanation: null
        };
      }

      const isCorrect = response.answer === question.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        questionId: response.questionId,
        isCorrect,
        userAnswer: response.answer,
        correctAnswer: question.correctAnswer,
        question: question.question,
        options: question.options,
        explanation: question.explanation
      };
    });

    const score = (correctCount / responses.length) * 100;

    // Génération d'une analyse par l'IA
    const analysisPrompt = `En tant qu'expert en cybersécurité spécialisé dans l'évaluation des compétences, analyse ces résultats de test:
- Catégorie: ${category}
- Niveau de difficulté: ${difficulty}
- Score: ${score.toFixed(1)}% (${correctCount}/${responses.length} réponses correctes)
- Détails des erreurs: ${detailedResults.filter(r => !r.isCorrect).map(r => r.question).join('; ')}

Fournis:
1) Une analyse des forces et faiblesses basée sur ces résultats
2) Des recommandations personnalisées pour améliorer les compétences dans les domaines faibles
3) Des ressources d'apprentissage recommandées
4) Le niveau estimé actuel et le potentiel de progression

Réponds avec un JSON de la forme:
{
  "summary": "Résumé global des performances",
  "strengths": ["Point fort 1", "Point fort 2", ...],
  "weaknesses": ["Point faible 1", "Point faible 2", ...],
  "recommendations": ["Recommandation 1", "Recommandation 2", ...],
  "resources": [{"title": "Titre ressource", "url": "URL optionnelle", "description": "Description courte"}, ...],
  "skillLevel": "Niveau estimé actuel",
  "nextSteps": "Prochaines étapes suggérées"
}`;

    const analysisResponse = await callAzureOpenAI(analysisPrompt);
    let analysis;
    
    try {
      analysis = analysisResponse ? JSON.parse(analysisResponse) : null;
    } catch (error) {
      console.error('Error parsing analysis:', error);
      analysis = null;
    }

    return res.status(200).json({
      success: true,
      score,
      correctCount,
      totalQuestions: responses.length,
      detailedResults,
      analysis
    });
  } catch (error) {
    console.error('Error evaluating responses:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
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
      error: error.message
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
      difficulties: DIFFICULTY_LEVELS
    });
  } catch (error) {
    console.error('Error getting test options:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

/**
 * Récupère des questions du cache
 */
function getCachedQuestions(category: string, difficulty: string): QuizQuestion[] {
  const cache = questionCaches.find(c => 
    c.category === category && 
    c.difficulty === difficulty && 
    (Date.now() - c.timestamp) < CACHE_EXPIRY
  );
  
  return cache ? cache.questions : [];
}

/**
 * Stocke des questions dans le cache
 */
function cacheQuestions(questions: QuizQuestion[], category: string, difficulty: string): void {
  // Supprimer l'ancien cache pour cette catégorie/difficulté s'il existe
  const existingCacheIndex = questionCaches.findIndex(c => 
    c.category === category && c.difficulty === difficulty
  );
  
  if (existingCacheIndex !== -1) {
    questionCaches.splice(existingCacheIndex, 1);
  }
  
  // Ajouter le nouveau cache
  questionCaches.push({
    questions,
    category,
    difficulty,
    timestamp: Date.now()
  });
}

/**
 * Appelle Azure OpenAI avec une invite système
 */
async function callAzureOpenAI(systemPrompt: string): Promise<string | null> {
  try {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_KEY;
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = "2024-02-01";
    
    if (!endpoint || !apiKey || !deploymentName) {
      console.error('Azure OpenAI configuration missing');
      return null;
    }

    const url = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;
    
    const response = await axios.post(
      url,
      {
        messages: [
          { role: "system", content: systemPrompt }
        ],
        temperature: 0.2,
        top_p: 0.95,
        max_tokens: 2000
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Azure OpenAI:', error);
    return null;
  }
}