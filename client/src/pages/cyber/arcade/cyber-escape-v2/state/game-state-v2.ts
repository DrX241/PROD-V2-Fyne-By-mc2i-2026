import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameStatus, GameActionType, ExitStatus, ObjectState } from '../types/game-enums';
import { GameState, GameAction, RoomData, ChallengeResult } from '../types/game';

// Imports temporaires en attendant le fichier rooms.ts
const rooms: Record<string, RoomData> = {};
const initialGameData = {
  currentStage: 1,
  currentRoomId: 'server_room',
  inventory: {},
  messages: ['Bienvenue dans Cyber Escape v2.0! Le pare-feu est tombé, et vous devez restaurer la sécurité.'],
  timeRemaining: 900 // 15 minutes
};

// État initial du jeu
const initialState: GameState = {
  status: GameStatus.INITIALIZING,
  currentStage: initialGameData.currentStage,
  currentRoomId: initialGameData.currentRoomId,
  inventory: initialGameData.inventory,
  messages: initialGameData.messages,
  timeRemaining: initialGameData.timeRemaining,
  isTimerActive: false,
  gameCompleted: false,
  unlockedStages: [1] // Le niveau 1 est débloqué par défaut
};

// Reducer pour gérer les actions de jeu
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case GameActionType.MOVE:
      return {
        ...state,
        currentRoomId: action.payload,
        messages: [...state.messages, `Vous entrez dans ${rooms[action.payload]?.name || 'une nouvelle salle'}.`]
      };
    case GameActionType.INTERACT:
      return {
        ...state,
        messages: [...state.messages, action.payload.message]
      };
    case GameActionType.COLLECT_ITEM:
      return {
        ...state,
        inventory: {
          ...state.inventory,
          [action.payload.id]: action.payload
        },
        messages: [...state.messages, `Vous avez obtenu: ${action.payload.name}`]
      };
    case GameActionType.START_CHALLENGE:
      return {
        ...state,
        status: GameStatus.CHALLENGE_ACTIVE,
        activeChallengeId: action.payload,
        isTimerActive: true
      };
    case GameActionType.COMPLETE_CHALLENGE:
      const result = action.payload as ChallengeResult;
      if (result.success) {
        const nextStage = state.currentStage + 1;
        const unlockedStages = state.unlockedStages.includes(nextStage) 
          ? state.unlockedStages 
          : [...state.unlockedStages, nextStage];
        const timeRemaining = state.timeRemaining + result.timeBonus;
        
        return {
          ...state,
          status: GameStatus.PLAYING,
          currentStage: nextStage,
          activeChallengeId: undefined,
          unlockedStages,
          timeRemaining,
          messages: [
            ...state.messages, 
            `Défi réussi avec un score de ${result.score}! Vous gagnez ${result.timeBonus} secondes de temps bonus.`,
            result.message || `Niveau ${nextStage} débloqué!`
          ]
        };
      } else {
        return {
          ...state,
          status: GameStatus.PLAYING,
          activeChallengeId: undefined,
          messages: [
            ...state.messages, 
            `Défi échoué avec un score de ${result.score}. Essayez à nouveau.`,
          ]
        };
      }
    case 'UPDATE_TIME':
      const newTimeRemaining = state.timeRemaining - 1;
      if (newTimeRemaining <= 0) {
        return {
          ...state,
          timeRemaining: 0,
          isTimerActive: false,
          status: GameStatus.GAME_OVER,
          messages: [...state.messages, "Temps écoulé! La mission a échoué."]
        };
      }
      return { ...state, timeRemaining: newTimeRemaining };
    case 'PAUSE_GAME':
      return { ...state, status: GameStatus.PAUSED, isTimerActive: false };
    case 'RESUME_GAME':
      return { ...state, status: GameStatus.PLAYING, isTimerActive: true };
    case 'RESTART_GAME':
      return { ...initialState, status: GameStatus.PLAYING, isTimerActive: true };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UNLOCK_EXIT':
      return { ...state, messages: [...state.messages, action.payload?.message || "Sortie déverrouillée!"] };
    case 'GAME_VICTORY':
      return {
        ...state,
        status: GameStatus.VICTORY,
        isTimerActive: false,
        gameCompleted: true,
        messages: [...state.messages, "Mission accomplie! Vous avez rétabli la sécurité du système."]
      };
    case 'INIT_COMPLETE':
      return { ...state, status: GameStatus.PLAYING, isTimerActive: true };
    default:
      return state;
  }
}

// Interface pour le contexte du jeu
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  currentRoom: RoomData;
  handleInteract: (type: string, targetId: string) => void;
  handleChallengeComplete: (success: boolean, score: number, timeBonus: number) => void;
  formatTime: (seconds: number) => string;
}

// Créer le contexte
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider pour le contexte du jeu
export function GameProvider({ children }: { children: ReactNode }) {
  // Utiliser le reducer pour gérer l'état
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  // Obtenir la salle actuelle (temporaire)
  const currentRoom = rooms[state.currentRoomId] || {
    id: 'temp',
    name: 'Salle temporaire',
    description: 'Cette salle est en cours de développement',
    backgroundPath: '',
    objects: [],
    npcs: [],
    exits: {}
  };
  
  // Effet pour gérer le timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (state.isTimerActive && state.timeRemaining > 0) {
      timer = setInterval(() => {
        dispatch({ type: 'UPDATE_TIME' });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state.isTimerActive, state.timeRemaining]);
  
  // Effet pour initialiser le jeu
  useEffect(() => {
    if (state.status === GameStatus.INITIALIZING) {
      const timer = setTimeout(() => {
        dispatch({ type: 'INIT_COMPLETE' });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [state.status]);
  
  // Gérer les interactions avec les éléments du jeu
  const handleInteract = (type: string, targetId: string) => {
    dispatch({ 
      type: GameActionType.INTERACT, 
      payload: { 
        message: `Interaction avec ${type}: ${targetId}` 
      } 
    });
  };
  
  // Gérer la fin d'un défi
  const handleChallengeComplete = (success: boolean, score: number, timeBonus: number) => {
    dispatch({
      type: GameActionType.COMPLETE_CHALLENGE,
      payload: { success, score, timeBonus }
    });
  };
  
  // Formater le temps pour l'affichage
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const contextValue: GameContextType = {
    state,
    dispatch,
    currentRoom,
    handleInteract,
    handleChallengeComplete,
    formatTime
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

// Hook pour utiliser le contexte du jeu
export function useGameState(): GameContextType {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameProvider');
  }
  return context;
}
