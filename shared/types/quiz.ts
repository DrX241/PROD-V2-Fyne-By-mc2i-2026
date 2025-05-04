/**
 * Types pour le système de quiz de cybersécurité
 */

/**
 * Option d'une question de quiz
 */
export interface QuizOption {
  id: string;
  text: string;
}

/**
 * Question de quiz
 */
export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  correctOptionId: string; // ID de l'option correcte (visible uniquement côté serveur)
  explanation?: string; // Explication de la bonne réponse
}

/**
 * Réponse à une question de quiz
 */
export interface QuizResponse {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  explanation: string;
}

/**
 * Évaluation du quiz
 */
export interface QuizFeedback {
  overallAssessment: string;
  strengths: string[];
  weaknesses: string[];
  recommendedTopics: string[];
  skillLevel: "débutant" | "intermédiaire" | "avancé";
}

/**
 * Résultat final du quiz
 */
export interface QuizResult {
  score: number;
  totalQuestions: number;
  responses: QuizResponse[];
  feedback: QuizFeedback;
}