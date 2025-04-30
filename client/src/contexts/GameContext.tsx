import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  GameState, Player, Scenario, NPC, GameEvent, PlayerRole,
  UrgencyLevel, NPCAttitude, EventType
} from '@shared/types/challenge';

// État initial du jeu
const initialGameState: GameState = {
  id: '',
  players: [],
  scenario: {
    id: '',
    title: '',
    companyName: '',
    initialBudget: 400000,
    remainingBudget: 400000,
    simulatedDate: '',
    urgencyLevel: UrgencyLevel.MEDIUM,
    description: '',
    initialEmail: {
      id: '',
      sender: {
        name: '',
        email: '',
        role: ''
      },
      recipient: '',
      subject: '',
      content: '',
      timestamp: Date.now(),
      isUrgent: false
    },
    currentStage: 0,
    maxStages: 5
  },
  npcs: [],
  gameEvents: [],
  currentPlayerIndex: 0,
  isGameOver: false,
  startedAt: Date.now()
};

// Actions disponibles pour modifier l'état du jeu
type GameAction =
  | { type: 'INITIALIZE_GAME', payload: { id: string } }
  | { type: 'ADD_PLAYER', payload: { name: string, role: PlayerRole } }
  | { type: 'SET_SCENARIO', payload: Partial<Scenario> }
  | { type: 'ADD_NPC', payload: Omit<NPC, 'id'> }
  | { type: 'ADD_GAME_EVENT', payload: Omit<GameEvent, 'id' | 'timestamp'> }
  | { type: 'UPDATE_BUDGET', payload: number }
  | { type: 'NEXT_PLAYER' }
  | { type: 'UPDATE_PLAYER_SCORE', payload: { playerId: string, points: number } }
  | { type: 'END_GAME' }
  | { type: 'SET_GAME_STATE', payload: Partial<GameState> };

// Reducer pour gérer les changements d'état
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INITIALIZE_GAME':
      return {
        ...state,
        id: action.payload.id,
        startedAt: Date.now(),
        isGameOver: false,
        players: [],
        npcs: [],
        gameEvents: [],
        currentPlayerIndex: 0
      };
      
    case 'ADD_PLAYER':
      const newPlayer: Player = {
        id: uuidv4(),
        name: action.payload.name,
        role: action.payload.role,
        score: 0,
        active: state.players.length === 0 // Premier joueur actif par défaut
      };
      
      return {
        ...state,
        players: [...state.players, newPlayer]
      };
      
    case 'SET_SCENARIO':
      return {
        ...state,
        scenario: {
          ...state.scenario,
          ...action.payload
        }
      };
      
    case 'ADD_NPC':
      const newNpc: NPC = {
        id: uuidv4(),
        name: action.payload.name,
        role: action.payload.role,
        personality: action.payload.personality,
        attitude: action.payload.attitude,
        avatarUrl: action.payload.avatarUrl
      };
      
      return {
        ...state,
        npcs: [...state.npcs, newNpc]
      };
      
    case 'ADD_GAME_EVENT':
      const newEvent: GameEvent = {
        id: uuidv4(),
        timestamp: Date.now(),
        ...action.payload
      };
      
      return {
        ...state,
        gameEvents: [...state.gameEvents, newEvent]
      };
      
    case 'UPDATE_BUDGET':
      return {
        ...state,
        scenario: {
          ...state.scenario,
          remainingBudget: state.scenario.remainingBudget - action.payload
        }
      };
      
    case 'NEXT_PLAYER':
      const currentActiveIndex = state.players.findIndex(p => p.active);
      const nextPlayerIndex = (currentActiveIndex + 1) % state.players.length;
      
      return {
        ...state,
        players: state.players.map((player, index) => ({
          ...player,
          active: index === nextPlayerIndex
        })),
        currentPlayerIndex: nextPlayerIndex
      };
      
    case 'UPDATE_PLAYER_SCORE':
      return {
        ...state,
        players: state.players.map(player => 
          player.id === action.payload.playerId 
            ? { ...player, score: player.score + action.payload.points } 
            : player
        )
      };
      
    case 'END_GAME':
      return {
        ...state,
        isGameOver: true,
        endedAt: Date.now()
      };
      
    case 'SET_GAME_STATE':
      return {
        ...state,
        ...action.payload
      };
      
    default:
      return state;
  }
}

// Interface de contexte pour le jeu
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  
  // Fonctions utilitaires
  createGame: () => Promise<string>;
  addPlayer: (name: string, role: PlayerRole) => void;
  generateScenario: () => Promise<void>;
  submitPlayerAction: (action: string) => Promise<void>;
  endGame: () => Promise<void>;
  getActivePlayer: () => Player | undefined;
  
  // États
  isLoading: boolean;
  error: string | null;
}

// Création du contexte
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider du contexte
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Crée un nouveau jeu
  const createGame = async (): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/challenge/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerCount: 1 // Par défaut, on crée un jeu pour 1 joueur
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create game');
      }
      
      const data = await response.json();
      
      dispatch({
        type: 'INITIALIZE_GAME',
        payload: {
          id: data.gameId
        }
      });
      
      return data.gameId;
    } catch (error) {
      setError('Error creating game: ' + (error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Ajoute un joueur au jeu
  const addPlayer = (name: string, role: PlayerRole) => {
    if (!state.id) {
      setError('Cannot add player: No game initialized');
      return;
    }
    
    // Vérifier que le nom et le rôle sont valides
    if (!name.trim()) {
      setError('Player name cannot be empty');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    fetch(`/api/challenge/games/${state.id}/players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        role
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to add player');
        }
        
        return response.json();
      })
      .then(data => {
        dispatch({
          type: 'ADD_PLAYER',
          payload: {
            name: data.name,
            role: data.role
          }
        });
      })
      .catch(error => {
        setError('Error adding player: ' + (error as Error).message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  
  // Génère un scénario pour le jeu
  const generateScenario = async (): Promise<void> => {
    if (!state.id) {
      setError('Cannot generate scenario: No game initialized');
      return;
    }
    
    if (state.players.length === 0) {
      setError('Cannot generate scenario: No players added');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/challenge/games/${state.id}/scenario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate scenario');
      }
      
      const data = await response.json();
      
      // Mettre à jour le scénario
      dispatch({
        type: 'SET_SCENARIO',
        payload: data.scenario
      });
      
      // Ajouter les PNJ
      data.scenario.npcs.forEach((npc: any) => {
        dispatch({
          type: 'ADD_NPC',
          payload: npc
        });
      });
      
      // Ajouter l'email initial comme événement
      dispatch({
        type: 'ADD_GAME_EVENT',
        payload: {
          type: EventType.EMAIL,
          content: JSON.stringify(data.scenario.initialEmail),
          npcId: 'system'
        }
      });
      
      // Ajouter un événement système pour indiquer le début du jeu
      dispatch({
        type: 'ADD_GAME_EVENT',
        payload: {
          type: EventType.SYSTEM_EVENT,
          content: `Crise cybersécurité déclenchée chez ${data.scenario.companyName}. Budget initial: ${data.scenario.initialBudget}€`
        }
      });
      
    } catch (error) {
      setError('Error generating scenario: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Soumet une action d'un joueur
  const submitPlayerAction = async (action: string): Promise<void> => {
    if (!state.id) {
      setError('Cannot submit action: No game initialized');
      return;
    }
    
    const activePlayer = getActivePlayer();
    
    if (!activePlayer) {
      setError('Cannot submit action: No active player');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Ajouter l'action comme événement avant même l'appel à l'API
      dispatch({
        type: 'ADD_GAME_EVENT',
        payload: {
          type: EventType.PLAYER_ACTION,
          content: action,
          playerId: activePlayer.id
        }
      });
      
      const response = await fetch(`/api/challenge/games/${state.id}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerId: activePlayer.id,
          action
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to process player action');
      }
      
      const data = await response.json();
      
      // Mettre à jour le score du joueur
      dispatch({
        type: 'UPDATE_PLAYER_SCORE',
        payload: {
          playerId: activePlayer.id,
          points: data.evaluation.points
        }
      });
      
      // Mettre à jour le budget
      if (data.evaluation.cost > 0) {
        dispatch({
          type: 'UPDATE_BUDGET',
          payload: data.evaluation.cost
        });
        
        // Ajouter un événement pour le budget
        dispatch({
          type: 'ADD_GAME_EVENT',
          payload: {
            type: EventType.BUDGET_UPDATE,
            content: `Budget utilisé: ${data.evaluation.cost}€`,
            metadata: {
              budgetChange: -data.evaluation.cost,
              remainingBudget: state.scenario.remainingBudget - data.evaluation.cost
            }
          }
        });
      }
      
      // Ajouter les réponses des PNJ
      data.npcResponses.forEach((response: any) => {
        dispatch({
          type: 'ADD_GAME_EVENT',
          payload: {
            type: EventType.NPC_RESPONSE,
            content: response.content,
            npcId: response.npcId
          }
        });
      });
      
      // Passer au joueur suivant
      dispatch({ type: 'NEXT_PLAYER' });
      
    } catch (error) {
      setError('Error submitting action: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Termine le jeu
  const endGame = async (): Promise<void> => {
    if (!state.id) {
      setError('Cannot end game: No game initialized');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/challenge/games/${state.id}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to end game');
      }
      
      const data = await response.json();
      
      // Ajouter le résumé comme événement
      dispatch({
        type: 'ADD_GAME_EVENT',
        payload: {
          type: EventType.SYSTEM_EVENT,
          content: data.summary
        }
      });
      
      // Marquer le jeu comme terminé
      dispatch({ type: 'END_GAME' });
      
    } catch (error) {
      setError('Error ending game: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Récupère le joueur actif
  const getActivePlayer = (): Player | undefined => {
    return state.players.find(player => player.active);
  };
  
  // Charger les données du jeu si un ID est présent
  useEffect(() => {
    if (state.id) {
      setIsLoading(true);
      
      fetch(`/api/challenge/games/${state.id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch game details');
          }
          
          return response.json();
        })
        .then(data => {
          dispatch({
            type: 'SET_GAME_STATE',
            payload: {
              players: data.players,
              scenario: data.game.scenarioData,
              npcs: data.npcs,
              gameEvents: data.events,
              currentPlayerIndex: data.game.currentPlayerIndex,
              isGameOver: data.game.isGameOver
            }
          });
        })
        .catch(error => {
          setError('Error fetching game details: ' + (error as Error).message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [state.id]);
  
  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        createGame,
        addPlayer,
        generateScenario,
        submitPlayerAction,
        endGame,
        getActivePlayer,
        isLoading,
        error
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

// Hook pour utiliser le contexte
export function useGame() {
  const context = useContext(GameContext);
  
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
}

import { useState } from 'react';