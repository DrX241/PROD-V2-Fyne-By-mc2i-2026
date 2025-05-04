import axios from 'axios';

// Interface pour le contenu d'apprentissage
export interface LearningContent {
  title: string;
  introduction: string;
  concepts_clés: string[];
  scenario_interactif: {
    titre: string;
    contexte: string;
    etapes: Array<{
      id: string;
      description: string;
      options: Array<{
        id: string;
        text: string;
      }>;
      correct_option: string;
      explication: string;
    }>;
  };
  questions: Array<{
    id: string;
    question: string;
    key_concepts: string[];
  }>;
  ressources_additionnelles: Array<{
    titre: string;
    description: string;
    lien: string;
  }>;
}

// Interface pour l'évaluation des réponses
export interface ResponseEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  areas_to_improve: string[];
  explanation: string;
}

/**
 * Génère du contenu d'apprentissage en utilisant l'API GPT-4o
 */
export async function generateLearningContent(
  theme: string, 
  userLevel: string, 
  learningHistory: any[]
): Promise<LearningContent> {
  try {
    const response = await axios.post('/api/ai/generate-learning-content', {
      theme,
      userLevel,
      learningHistory
    });
    
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la génération de contenu:", error);
    throw new Error("Impossible de générer le contenu d'apprentissage");
  }
}

/**
 * Évalue la réponse d'un utilisateur à une question
 */
export async function evaluateUserResponse(
  userResponse: string, 
  context: string, 
  expectedConcepts: string[]
): Promise<ResponseEvaluation> {
  try {
    const response = await axios.post('/api/ai/evaluate-response', {
      userResponse,
      context,
      expectedConcepts
    });
    
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'évaluation:", error);
    throw new Error("Impossible d'évaluer la réponse");
  }
}