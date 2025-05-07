import { createContext, useContext, useReducer, useState, useEffect, ReactNode } from 'react';
import { GameStatus, GameActionType, ExitStatus, ObjectState } from '../types/game-enums';
import { rooms, initialGameData } from '../data/rooms';
import {
  GameState,
  GameAction,
  InventoryItem,
  RoomData,
  RoomObject,
  RoomNPC,
  RoomExit,
  ChallengeResult
} from '../types/game';

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
      // Déplacer le joueur vers une nouvelle salle
      return {
        ...state,
        currentRoomId: action.payload,
        messages: [...state.messages, `Vous entrez dans ${rooms[action.payload].name}.`]
      };
      
    case GameActionType.INTERACT:
      // Interaction avec un objet
      return {
        ...state,
        messages: [...state.messages, action.payload.message]
      };
      
    case GameActionType.COLLECT_ITEM:
      // Collecter un objet dans l'inventaire
      return {
        ...state,
        inventory: {
          ...state.inventory,
          [action.payload.id]: action.payload
        },
        messages: [...state.messages, `Vous avez obtenu: ${action.payload.name}`]
      };
      
    case GameActionType.START_CHALLENGE:
      // Démarrer un défi
      return {
        ...state,
        status: GameStatus.CHALLENGE_ACTIVE,
        activeChallengeId: action.payload,
        isTimerActive: true
      };
      
    case GameActionType.COMPLETE_CHALLENGE:
      const result = action.payload as ChallengeResult;
      
      // Vérifier si le challenge est un succès
      if (result.success) {
        const currentRoom = rooms[state.currentRoomId];
        const nextStage = state.currentStage + 1;
        // Ajouter le nouveau niveau aux niveaux débloqués
        const unlockedStages = state.unlockedStages.includes(nextStage) 
          ? state.unlockedStages 
          : [...state.unlockedStages, nextStage];
          
        // Mettre à jour le temps restant avec le bonus de temps
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
      // Mettre à jour le temps restant
      const newTimeRemaining = state.timeRemaining - 1;
      
      // Si le temps est écoulé, passer en game over
      if (newTimeRemaining <= 0) {
        return {
          ...state,
          timeRemaining: 0,
          isTimerActive: false,
          status: GameStatus.GAME_OVER,
          messages: [...state.messages, "Temps écoulé! La mission a échoué."]
        };
      }
      
      return {
        ...state,
        timeRemaining: newTimeRemaining
      };
      
    case 'PAUSE_GAME':
      return {
        ...state,
        status: GameStatus.PAUSED,
        isTimerActive: false
      };
      
    case 'RESUME_GAME':
      return {
        ...state,
        status: GameStatus.PLAYING,
        isTimerActive: true
      };
      
    case 'RESTART_GAME':
      return {
        ...initialState,
        status: GameStatus.PLAYING,
        isTimerActive: true
      };
      
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
      
    case 'UNLOCK_EXIT':
      // Débloquer une sortie
      return {
        ...state,
        messages: [...state.messages, action.payload?.message || "Sortie déverrouillée!"]
      };
      
    case 'GAME_VICTORY':
      return {
        ...state,
        status: GameStatus.VICTORY,
        isTimerActive: false,
        gameCompleted: true,
        messages: [...state.messages, "Mission accomplie! Vous avez rétabli la sécurité du système."]
      };
      
    case 'INIT_COMPLETE':
      return {
        ...state,
        status: GameStatus.PLAYING,
        isTimerActive: true
      };
      
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
  
  // Obtenir la salle actuelle
  const currentRoom = rooms[state.currentRoomId];
  
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
      // Simuler un petit délai pour l'initialisation
      const timer = setTimeout(() => {
        dispatch({ type: 'INIT_COMPLETE' });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [state.status]);
  
  // Gérer les interactions avec les éléments du jeu
  const handleInteract = (type: string, targetId: string) => {
    switch (type) {
      case 'object':
        const object = currentRoom.objects.find(obj => obj.id === targetId);
        if (!object) return;
        
        if (object.id === 'terminal_phishing' && currentRoom.challenge?.type === 'phishing') {
          // Lancer le défi de phishing
          dispatch({ 
            type: GameActionType.START_CHALLENGE, 
            payload: currentRoom.challenge.id 
          });
        } else {
          // Message d'examen standard
          dispatch({ 
            type: GameActionType.INTERACT, 
            payload: { 
              message: `Vous examinez ${object.name}: ${object.description}` 
            } 
          });
        }
        break;
        
      case 'npc':
        const npc = currentRoom.npcs.find(n => n.id === targetId);
        if (!npc) return;
        
        dispatch({ 
          type: GameActionType.INTERACT, 
          payload: { 
            message: `${npc.name}: "Bonjour, je suis ${npc.name}, ${npc.role}. Je peux vous aider dans cette mission."` 
          } 
        });
        break;
        
      case 'exit':
        const exit = currentRoom.exits[targetId];
        if (!exit || exit.status === ExitStatus.LOCKED) {
          if (exit?.status === ExitStatus.LOCKED) {
            dispatch({ 
              type: 'ADD_MESSAGE', 
              payload: `Cette sortie est verrouillée. Vous devez d'abord relever le défi de cette salle.` 
            });
          }
          return;
        }
        
        dispatch({ type: GameActionType.MOVE, payload: exit.roomId });
        break;
        
      default:
        console.log("Type d'interaction non géré:", type);
    }
  };
  
  // Gérer la fin d'un défi
  const handleChallengeComplete = (success: boolean, score: number, timeBonus: number) => {
    dispatch({
      type: GameActionType.COMPLETE_CHALLENGE,
      payload: {
        success,
        score,
        timeBonus
      }
    });
    
    // Si le défi est réussi, débloquer la sortie correspondante
    if (success) {
      // Débloquer virtuellement la sortie
      // Note: dans un vrai jeu, nous modifierions l'état physique de la salle
      dispatch({
        type: 'UNLOCK_EXIT'
      });
    }
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