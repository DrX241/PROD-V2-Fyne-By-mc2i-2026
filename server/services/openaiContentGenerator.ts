// Utiliser le service Azure OpenAI existant qui est déjà configuré dans le projet
import { openAIService } from './openai';

// Note: Le service Azure OpenAI utilise les modèles gpt-4o et gpt-4o-mini
// Nous utilisons le service existant au lieu de créer une nouvelle connexion

// Types pour les données générées
export interface GeneratedSection {
  title: string;
  content: string;
  code?: string;
}

export interface GeneratedQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface GeneratedExercise {
  instructions: string;
  startingCode: string;
  solutionCode: string;
}

export interface GeneratedModuleContent {
  title: string;
  introduction: string;
  sections: GeneratedSection[];
  quiz: GeneratedQuizQuestion[];
  codeExercises?: GeneratedExercise[];
}

/**
 * Génère du contenu pour un module d'apprentissage
 */
export async function generateModuleContent(
  topic: string,
  difficulty: 'débutant' | 'intermédiaire' | 'avancé',
  numSections: number = 5,
  numQuizQuestions: number = 5,
  numExercises: number = 2,
  withCode: boolean = true
): Promise<GeneratedModuleContent> {
  try {
    const systemPrompt = `Tu es un expert en éducation dans le domaine de la data science, l'IA et la programmation. 
    Ta mission est de créer un module d'apprentissage complet, structuré et pédagogique sur le sujet demandé.
    Le contenu doit être adapté à un niveau ${difficulty}, être précis, informatif et avoir un ton pédagogique.
    Génère un contenu riche avec des explications claires et des exemples pratiques.`;

    const userPrompt = `Crée un module d'apprentissage sur "${topic}" de niveau ${difficulty} avec:
    1. Un titre captivant
    2. Une introduction générale (environ 3-5 phrases)
    3. ${numSections} sections (chacune avec un titre et un contenu détaillé${withCode ? ' incluant des exemples de code' : ''})
    4. ${numQuizQuestions} questions de quiz (avec 4 options de réponse, l'index de la réponse correcte et une explication)
    ${withCode ? `5. ${numExercises} exercices pratiques (avec instructions, code de départ et solution)` : ''}
    
    Le format de la réponse doit être en JSON structuré comme suit:
    {
      "title": "Titre du module",
      "introduction": "Introduction générale...",
      "sections": [
        {
          "title": "Titre de la section 1",
          "content": "Contenu détaillé...",
          "code": "Exemple de code..." // facultatif
        }
      ],
      "quiz": [
        {
          "id": "q1",
          "question": "Question du quiz?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0, // Index de la bonne réponse (0-3)
          "explanation": "Explication de la réponse..."
        }
      ],
      "codeExercises": [ // si withCode est true
        {
          "instructions": "Instructions pour l'exercice...",
          "startingCode": "Code de départ...",
          "solutionCode": "Solution complète..."
        }
      ]
    }`;

    console.log(`Génération de contenu pour un module sur: ${topic} (niveau ${difficulty})`);

    // Utilisation du service Azure OpenAI existant au lieu de l'API OpenAI standard
    const response = await openAIService.getChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      true, // utiliser le modèle secondaire pour éviter de surcharger le modèle principal
      0.7, // temperature
      3000, // max_tokens
      { responseFormat: 'json_object' } // demander une réponse en format JSON
    );

    if (!response) {
      throw new Error('Aucun contenu généré');
    }

    const parsedContent = JSON.parse(response);
    
    // Validation de base du contenu reçu
    if (!parsedContent.title || !parsedContent.introduction || 
        !parsedContent.sections || !Array.isArray(parsedContent.sections) || 
        !parsedContent.quiz || !Array.isArray(parsedContent.quiz)) {
      throw new Error('Le contenu généré ne respecte pas la structure attendue');
    }

    // Ajouter des identifiants uniques si nécessaire
    parsedContent.quiz = parsedContent.quiz.map((q: any, index: number) => ({
      ...q,
      id: q.id || `q${index + 1}`
    }));

    console.log(`Contenu généré avec succès: ${parsedContent.title}`);
    return parsedContent as GeneratedModuleContent;
  } catch (error) {
    console.error('Erreur lors de la génération de contenu:', error);
    throw error;
  }
}

/**
 * Génère un feedback personnalisé sur une réponse à un quiz
 */
export async function generateQuizFeedback(
  question: string,
  correctAnswer: string,
  userAnswer: string,
  isCorrect: boolean
): Promise<string> {
  try {
    // Utilisation du service Azure OpenAI existant
    const response = await openAIService.getChatCompletion(
      [
        { 
          role: 'system', 
          content: 'Tu es un assistant pédagogique expert. Fournis des explications claires, encourageantes et informatives.' 
        },
        { 
          role: 'user', 
          content: `Pour la question: "${question}"
          
          La réponse correcte est: "${correctAnswer}"
          
          L'utilisateur a répondu: "${userAnswer}"
          
          La réponse est ${isCorrect ? 'correcte' : 'incorrecte'}.
          
          Fournis un feedback personnalisé et éducatif qui explique pourquoi la réponse est ${isCorrect ? 'correcte' : 'incorrecte'} et approfondit le concept pour améliorer la compréhension de l'utilisateur.`
        }
      ],
      true,  // utiliser le modèle secondaire
      0.7, // temperature
      250 // max_tokens
    );

    return response || 'Pas de feedback disponible.';
  } catch (error) {
    console.error('Erreur lors de la génération du feedback:', error);
    return 'Impossible de générer un feedback. Veuillez réessayer.';
  }
}

/**
 * Évalue un code soumis pour un exercice
 */
export async function evaluateCodeSubmission(
  instructions: string,
  expectedSolution: string,
  userCode: string
): Promise<{ 
  isCorrect: boolean; 
  feedback: string; 
  score: number;  // Score sur 100
  suggestions?: string;
}> {
  try {
    // Utilisation du service Azure OpenAI existant
    const response = await openAIService.getChatCompletion(
      [
        { 
          role: 'system', 
          content: `Tu es un évaluateur de code expert. Évalue la solution soumise par rapport à la solution attendue.
          Sois juste, informatif et pédagogique. Fournis un score sur 100 et un feedback constructif.`
        },
        { 
          role: 'user', 
          content: `Instructions de l'exercice: "${instructions}"
          
          Solution attendue:
          \`\`\`
          ${expectedSolution}
          \`\`\`
          
          Code soumis par l'utilisateur:
          \`\`\`
          ${userCode}
          \`\`\`
          
          Évalue le code soumis en vérifiant s'il répond aux exigences et fonctionne comme la solution attendue.
          Fournis une réponse JSON avec:
          1. isCorrect: boolean indiquant si la solution est globalement correcte
          2. score: nombre entre 0 et 100 
          3. feedback: feedback détaillé sur la solution
          4. suggestions: suggestions d'amélioration (si nécessaire)`
        }
      ],
      true, // utiliser le modèle secondaire
      0.7,  // temperature
      1000, // max_tokens
      { responseFormat: 'json_object' } // demander une réponse en format JSON
    );

    if (!response) {
      throw new Error('Aucune évaluation générée');
    }

    const evaluation = JSON.parse(response);
    
    // Valeurs par défaut si certaines propriétés sont manquantes
    return {
      isCorrect: evaluation.isCorrect || false,
      score: evaluation.score || 0,
      feedback: evaluation.feedback || 'Pas de feedback disponible.',
      suggestions: evaluation.suggestions
    };
  } catch (error) {
    console.error('Erreur lors de l\'évaluation du code:', error);
    return {
      isCorrect: false,
      score: 0,
      feedback: 'Impossible d\'évaluer le code. Veuillez réessayer.'
    };
  }
}

export default {
  generateModuleContent,
  generateQuizFeedback,
  evaluateCodeSubmission
};