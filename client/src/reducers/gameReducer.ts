// Reducer pour le jeu "Read Me If You Can"
import { AppState, Action, CodeChallenge } from '../types/dataIaTypes';

// État initial
export const initialState: AppState = {
  currentChallenge: null,
  challengeCache: {
    python: {
      débutant: [],
      intermédiaire: [],
      avancé: []
    },
    sql: {
      débutant: [],
      intermédiaire: [],
      avancé: []
    }
  },
  score: 0,
  questionCount: 0,
  consecutiveFailures: 0,
  userProgress: {
    completedChallenges: [],
    skillLevels: {
      python: 1,
      sql: 1
    }
  },
  uiState: {
    selectedLanguage: 'python',
    selectedDifficulty: 'débutant',
    selectedMode: 'normal',
    highContrastMode: false,
    selectedAnswer: null,
    userJustification: '',
    showResult: false,
    isLoading: false,
    hintRequested: false,
    timeLeft: null,
    timerActive: false
  }
};

// Reducer pour gérer l'état global
export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_CHALLENGE':
      return {
        ...state,
        currentChallenge: action.payload
      };
    case 'ADD_TO_CACHE':
      return {
        ...state,
        challengeCache: {
          ...state.challengeCache,
          [action.payload.language]: {
            ...state.challengeCache[action.payload.language],
            [action.payload.difficulty]: [
              ...state.challengeCache[action.payload.language][action.payload.difficulty],
              action.payload.challenge
            ]
          }
        }
      };
    case 'UPDATE_SCORE':
      return {
        ...state,
        score: action.payload
      };
    case 'INCREMENT_QUESTION_COUNT':
      return {
        ...state,
        questionCount: state.questionCount + 1
      };
    case 'UPDATE_CONSECUTIVE_FAILURES':
      return {
        ...state,
        consecutiveFailures: action.payload
      };
    case 'MARK_CHALLENGE_COMPLETED':
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          completedChallenges: [...state.userProgress.completedChallenges, action.payload]
        }
      };
    case 'UPDATE_SKILL_LEVEL':
      return {
        ...state,
        userProgress: {
          ...state.userProgress,
          skillLevels: {
            ...state.userProgress.skillLevels,
            [action.payload.language]: action.payload.level
          }
        }
      };
    case 'SET_UI_STATE':
      return {
        ...state,
        uiState: {
          ...state.uiState,
          ...action.payload
        }
      };
    case 'RESET_CHALLENGE_STATE':
      return {
        ...state,
        currentChallenge: null,
        score: 0,
        questionCount: 0,
        consecutiveFailures: 0,
        uiState: {
          ...state.uiState,
          selectedAnswer: null,
          userJustification: '',
          showResult: false,
          isLoading: false,
          hintRequested: false,
          timeLeft: null,
          timerActive: false
        }
      };
    default:
      return state;
  }
}