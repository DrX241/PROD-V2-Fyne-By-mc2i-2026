import axios from 'axios';

// Types pour l'API DATA ACADÉMIE
export interface Module {
  id: string;
  title: string;
  description: string;
  category: 'fondamentaux' | 'intelligence_artificielle' | 'sql' | 'python' | 'data_engineering';
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  duration: string;
  thumbnail?: string;
  content?: ModuleContent;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModuleContent {
  title: string;
  introduction: string;
  sections: {
    title: string;
    content: string;
    code?: string;
  }[];
  quiz: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  codeExercises?: {
    instructions: string;
    startingCode: string;
    solutionCode: string;
  }[];
}

export interface NewModuleRequest {
  topic: string;
  category: 'fondamentaux' | 'intelligence_artificielle' | 'sql' | 'python' | 'data_engineering';
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
}

export interface QuizFeedbackRequest {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
}

export interface CodeEvaluationRequest {
  instructions: string;
  expectedSolution: string;
  userCode: string;
}

export interface CodeEvaluationResponse {
  isCorrect: boolean;
  score: number;
  feedback: string;
  suggestions?: string;
}

/**
 * Service pour l'API DATA ACADÉMIE
 */
const dataAcademieApi = {
  /**
   * Récupérer tous les modules disponibles
   */
  getModules: async (category?: string): Promise<Module[]> => {
    try {
      const url = category 
        ? `/api/data-academie/modules?category=${category}`
        : '/api/data-academie/modules';
      const response = await axios.get(url);
      return response.data.modules || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des modules:', error);
      return [];
    }
  },

  /**
   * Récupérer un module par son ID
   */
  getModule: async (id: string): Promise<Module | null> => {
    try {
      const response = await axios.get(`/api/data-academie/modules/${id}`);
      return response.data.module || null;
    } catch (error) {
      console.error(`Erreur lors de la récupération du module ${id}:`, error);
      return null;
    }
  },

  /**
   * Générer un nouveau module
   */
  generateModule: async (moduleRequest: NewModuleRequest): Promise<Module | null> => {
    try {
      const response = await axios.post('/api/data-academie/modules/generate', moduleRequest);
      return response.data.module || null;
    } catch (error) {
      console.error('Erreur lors de la génération du module:', error);
      return null;
    }
  },

  /**
   * Générer un feedback pour une réponse de quiz
   */
  generateQuizFeedback: async (feedbackRequest: QuizFeedbackRequest): Promise<string> => {
    try {
      const response = await axios.post('/api/data-academie/quiz/feedback', feedbackRequest);
      return response.data.feedback || '';
    } catch (error) {
      console.error('Erreur lors de la génération du feedback:', error);
      return 'Impossible de générer un feedback pour cette réponse.';
    }
  },

  /**
   * Évaluer un code soumis
   */
  evaluateCode: async (evaluationRequest: CodeEvaluationRequest): Promise<CodeEvaluationResponse> => {
    try {
      const response = await axios.post('/api/data-academie/code/evaluate', evaluationRequest);
      return response.data.evaluation || {
        isCorrect: false,
        score: 0,
        feedback: 'Impossible d\'évaluer votre code.'
      };
    } catch (error) {
      console.error('Erreur lors de l\'évaluation du code:', error);
      return {
        isCorrect: false,
        score: 0,
        feedback: 'Une erreur est survenue lors de l\'évaluation.'
      };
    }
  }
};

export default dataAcademieApi;