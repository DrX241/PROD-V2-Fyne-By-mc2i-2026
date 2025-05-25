// Types pour le jeu "Read Me If You Can"

export interface QuizResponse {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface CodeChallenge {
  id: string;
  code: string;
  language: 'python' | 'sql';
  question: string;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  responses: QuizResponse[];
  explanation: string;
  hint?: string;
}

// État global de l'application
export interface AppState {
  currentChallenge: CodeChallenge | null;
  challengeCache: {
    python: {
      débutant: CodeChallenge[];
      intermédiaire: CodeChallenge[];
      avancé: CodeChallenge[];
    };
    sql: {
      débutant: CodeChallenge[];
      intermédiaire: CodeChallenge[];
      avancé: CodeChallenge[];
    };
  };
  score: number;
  questionCount: number;
  consecutiveFailures: number;
  userProgress: {
    completedChallenges: string[];
    skillLevels: {
      python: number;
      sql: number;
    };
  };
  uiState: {
    selectedLanguage: 'python' | 'sql';
    selectedDifficulty: 'débutant' | 'intermédiaire' | 'avancé';
    selectedMode: 'normal' | 'analyse' | 'défense' | 'vitesse';
    highContrastMode: boolean;
    selectedAnswer: string | null;
    userJustification: string;
    showResult: boolean;
    isLoading: boolean;
    hintRequested: boolean;
    timeLeft: number | null;
    timerActive: boolean;
  };
}

// Actions pour le reducer
export type Action =
  | { type: 'SET_CHALLENGE'; payload: CodeChallenge }
  | { type: 'ADD_TO_CACHE'; payload: { language: 'python' | 'sql'; difficulty: 'débutant' | 'intermédiaire' | 'avancé'; challenge: CodeChallenge } }
  | { type: 'UPDATE_SCORE'; payload: number }
  | { type: 'INCREMENT_QUESTION_COUNT' }
  | { type: 'UPDATE_CONSECUTIVE_FAILURES'; payload: number }
  | { type: 'MARK_CHALLENGE_COMPLETED'; payload: string }
  | { type: 'UPDATE_SKILL_LEVEL'; payload: { language: 'python' | 'sql'; level: number } }
  | { type: 'SET_UI_STATE'; payload: Partial<AppState['uiState']> }
  | { type: 'RESET_CHALLENGE_STATE' };