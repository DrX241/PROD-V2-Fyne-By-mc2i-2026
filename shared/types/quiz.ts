// Types pour le nouveau concept de quiz cyber
export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizResponse {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  responses: QuizResponse[];
  feedback: QuizFeedback;
}

export interface QuizFeedback {
  overallAssessment: string;
  strengths: string[];
  weaknesses: string[];
  recommendedTopics: string[];
  skillLevel: "débutant" | "intermédiaire" | "avancé";
}

export interface QuizSession {
  id: string;
  userId: string;
  startedAt: number;
  completedAt?: number;
  questions: QuizQuestion[];
  responses: QuizResponse[];
  result?: QuizResult;
}