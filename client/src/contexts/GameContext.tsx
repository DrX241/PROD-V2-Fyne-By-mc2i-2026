import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { 
  GameState, 
  Player, 
  Scenario, 
  NPC, 
  GameEvent, 
  PlayerRole, 
  NpcRole,
  EventType,
  ScenarioType
} from '@shared/types/challenge';

// Action types
type GameAction = 
  | { type: 'CREATE_GAME'; payload: { playerCount: number } }
  | { type: 'SET_GAME_STATE'; payload: GameState }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'UPDATE_PLAYER'; payload: { playerId: string; updates: Partial<Player> } }
  | { type: 'SET_CURRENT_PLAYER'; payload: number }
  | { type: 'ADD_EVENT'; payload: GameEvent }
  | { type: 'UPDATE_SCENARIO'; payload: Partial<Scenario> }
  | { type: 'END_GAME'; payload?: { reason: string } }
  | { type: 'ADD_NPC'; payload: NPC }
  | { type: 'UPDATE_NPC'; payload: { npcId: string; updates: Partial<NPC> } };

// Context state
interface GameContextState {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  createGame: (playerCount: number) => Promise<void>;
  addPlayer: (name: string, role: PlayerRole) => Promise<void>;
  submitAction: (action: string, targetNpcId?: string) => Promise<void>;
  configureScenario: (difficultyLevel: string, scenarioType: string) => Promise<void>;
  startGame: () => Promise<void>;
  endGame: (reason?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Initial state for a game
const initialGameState: GameState = {
  id: '',
  players: [],
  scenario: {
    title: '',
    description: '',
    type: ScenarioType.RANSOMWARE,
    difficultyLevel: 'medium',
    initialBudget: 400000,
    remainingBudget: 400000,
    maxTurns: 10,
    objectives: [],
    assets: []
  },
  npcs: [],
  gameEvents: [],
  currentPlayerIndex: 0,
  isGameOver: false,
  startedAt: Date.now(),
  endedAt: undefined
};

// Create context
const GameContext = createContext<GameContextState | undefined>(undefined);

// Game reducer function
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'CREATE_GAME':
      return {
        ...initialGameState,
        id: uuidv4(),
        startedAt: Date.now()
      };
      
    case 'SET_GAME_STATE':
      return action.payload;
      
    case 'ADD_PLAYER':
      return {
        ...state,
        players: [...state.players, action.payload]
      };
      
    case 'UPDATE_PLAYER':
      return {
        ...state,
        players: state.players.map(player => 
          player.id === action.payload.playerId 
            ? { ...player, ...action.payload.updates } 
            : player
        )
      };
      
    case 'SET_CURRENT_PLAYER':
      return {
        ...state,
        currentPlayerIndex: action.payload
      };
      
    case 'ADD_EVENT':
      return {
        ...state,
        gameEvents: [...state.gameEvents, action.payload]
      };
      
    case 'UPDATE_SCENARIO':
      return {
        ...state,
        scenario: {
          ...state.scenario,
          ...action.payload
        }
      };
      
    case 'END_GAME':
      return {
        ...state,
        isGameOver: true,
        endedAt: Date.now()
      };
      
    case 'ADD_NPC':
      return {
        ...state,
        npcs: [...state.npcs, action.payload]
      };
      
    case 'UPDATE_NPC':
      return {
        ...state,
        npcs: state.npcs.map(npc => 
          npc.id === action.payload.npcId 
            ? { ...npc, ...action.payload.updates } 
            : npc
        )
      };
      
    default:
      return state;
  }
}

// Provider component
export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create a new game
  const createGame = async (playerCount: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/challenge/games', { playerCount });
      
      if (response.data && response.data.success) {
        const { gameId, game } = response.data;
        
        // Convert the API response to our GameState format
        const newGameState: GameState = {
          id: gameId,
          players: [],
          scenario: {
            title: game.scenarioData.title || 'Nouvelle crise',
            description: game.scenarioData.description || 'Simulation de gestion de crise',
            type: game.scenarioData.type || ScenarioType.RANSOMWARE,
            difficultyLevel: game.scenarioData.difficultyLevel || 'medium',
            initialBudget: game.scenarioData.initialBudget || 400000,
            remainingBudget: game.scenarioData.remainingBudget || 400000,
            maxTurns: game.scenarioData.maxTurns || 10,
            objectives: game.scenarioData.objectives || [],
            assets: game.scenarioData.assets || []
          },
          npcs: [],
          gameEvents: [],
          currentPlayerIndex: 0,
          isGameOver: false,
          startedAt: new Date(game.startedAt).getTime()
        };
        
        dispatch({ type: 'SET_GAME_STATE', payload: newGameState });
      } else {
        setError('Erreur lors de la création du jeu');
      }
    } catch (err) {
      console.error('Error creating game:', err);
      setError('Erreur lors de la création du jeu: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a player to the game
  const addPlayer = async (name: string, role: PlayerRole) => {
    if (!state.id) {
      setError('Aucun jeu n\'a été créé');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`/api/challenge/games/${state.id}/players`, { name, role });
      
      if (response.data && response.data.success) {
        const { player } = response.data;
        
        // Convert the API player to our Player format
        const newPlayer: Player = {
          id: player.playerId,
          name: player.name,
          role: player.role as PlayerRole,
          score: player.score || 0,
          isActive: player.active || false
        };
        
        dispatch({ type: 'ADD_PLAYER', payload: newPlayer });
        
        // Add a system event
        const event: GameEvent = {
          id: uuidv4(),
          timestamp: Date.now(),
          type: EventType.SYSTEM_EVENT,
          content: `${name} a rejoint la cellule de crise en tant que ${role}.`
        };
        
        dispatch({ type: 'ADD_EVENT', payload: event });
      } else {
        setError('Erreur lors de l\'ajout du joueur');
      }
    } catch (err) {
      console.error('Error adding player:', err);
      setError('Erreur lors de l\'ajout du joueur: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Configure the scenario
  const configureScenario = async (difficultyLevel: string, scenarioType: string) => {
    if (!state.id) {
      setError('Aucun jeu n\'a été créé');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`/api/challenge/games/${state.id}/scenario`, { 
        difficultyLevel, 
        scenarioType 
      });
      
      if (response.data && response.data.success) {
        const { game } = response.data;
        
        // Update the scenario
        dispatch({ 
          type: 'UPDATE_SCENARIO', 
          payload: {
            title: game.scenarioData.title,
            description: game.scenarioData.description,
            type: game.scenarioData.type,
            difficultyLevel: game.scenarioData.difficultyLevel,
            initialBudget: game.scenarioData.initialBudget,
            remainingBudget: game.scenarioData.remainingBudget,
            maxTurns: game.scenarioData.maxTurns,
            objectives: game.scenarioData.objectives,
            assets: game.scenarioData.assets,
            timeline: game.scenarioData.timeline,
            stakeholders: game.scenarioData.stakeholders
          } 
        });
        
        // Fetch the game state to get NPCs and events
        await fetchGameState();
      } else {
        setError('Erreur lors de la configuration du scénario');
      }
    } catch (err) {
      console.error('Error configuring scenario:', err);
      setError('Erreur lors de la configuration du scénario: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start the game
  const startGame = async () => {
    if (!state.id) {
      setError('Aucun jeu n\'a été créé');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`/api/challenge/games/${state.id}/start`);
      
      if (response.data && response.data.success) {
        // Fetch the game state
        await fetchGameState();
      } else {
        setError('Erreur lors du démarrage du jeu');
      }
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Erreur lors du démarrage du jeu: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Submit a player action
  const submitAction = async (action: string, targetNpcId?: string) => {
    if (!state.id) {
      setError('Aucun jeu n\'a été créé');
      return;
    }
    
    if (state.isGameOver) {
      setError('Le jeu est terminé');
      return;
    }
    
    if (state.players.length === 0) {
      setError('Aucun joueur n\'a été ajouté');
      return;
    }
    
    const currentPlayer = state.players[state.currentPlayerIndex];
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`/api/challenge/games/${state.id}/actions`, {
        playerId: currentPlayer.id,
        action,
        targetNpcId
      });
      
      if (response.data && response.data.success) {
        const { event, response: responseEvent, evaluation, isGameOver } = response.data;
        
        // Add the player action event
        const playerEvent: GameEvent = {
          id: event.eventId,
          timestamp: new Date(event.timestamp).getTime(),
          type: EventType.PLAYER_ACTION,
          content: event.content,
          playerId: event.playerId,
          npcId: event.npcId
        };
        
        dispatch({ type: 'ADD_EVENT', payload: playerEvent });
        
        // Add the response event if available
        if (responseEvent) {
          const responseGameEvent: GameEvent = {
            id: responseEvent.eventId,
            timestamp: new Date(responseEvent.timestamp).getTime(),
            type: responseEvent.type as EventType,
            content: responseEvent.content,
            playerId: responseEvent.playerId,
            npcId: responseEvent.npcId,
            metadata: {
              points: responseEvent.metadata?.points,
              cost: responseEvent.metadata?.cost,
              remainingBudget: responseEvent.metadata?.remainingBudget
            }
          };
          
          dispatch({ type: 'ADD_EVENT', payload: responseGameEvent });
        }
        
        // Update the player's score
        if (evaluation && evaluation.points) {
          dispatch({ 
            type: 'UPDATE_PLAYER', 
            payload: {
              playerId: currentPlayer.id,
              updates: {
                score: currentPlayer.score + evaluation.points
              }
            } 
          });
        }
        
        // Update the scenario budget
        if (evaluation && evaluation.cost) {
          const newBudget = Math.max(0, state.scenario.remainingBudget - evaluation.cost);
          
          dispatch({ 
            type: 'UPDATE_SCENARIO', 
            payload: {
              remainingBudget: newBudget
            }
          });
        }
        
        // Check if the game is over
        if (isGameOver) {
          dispatch({ type: 'END_GAME' });
        } else {
          // Move to the next player
          const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
          dispatch({ type: 'SET_CURRENT_PLAYER', payload: nextPlayerIndex });
        }
      } else {
        setError('Erreur lors de l\'envoi de l\'action');
      }
    } catch (err) {
      console.error('Error submitting action:', err);
      setError('Erreur lors de l\'envoi de l\'action: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };
  
  // End the game
  const endGame = async (reason?: string) => {
    if (!state.id) {
      setError('Aucun jeu n\'a été créé');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`/api/challenge/games/${state.id}/end`, { reason });
      
      if (response.data && response.data.success) {
        dispatch({ type: 'END_GAME', payload: { reason: reason || 'completed' } });
        
        // Fetch the game state to get the final summary
        await fetchGameState();
      } else {
        setError('Erreur lors de la fin du jeu');
      }
    } catch (err) {
      console.error('Error ending game:', err);
      setError('Erreur lors de la fin du jeu: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch the game state from the API
  const fetchGameState = async () => {
    if (!state.id) {
      return;
    }
    
    try {
      const response = await axios.get(`/api/challenge/games/${state.id}`);
      
      if (response.data) {
        const { game, players: apiPlayers, npcs: apiNpcs, events } = response.data;
        
        // Convert API data to our format
        const players: Player[] = apiPlayers.map(p => ({
          id: p.playerId,
          name: p.name,
          role: p.role,
          score: p.score,
          isActive: p.active
        }));
        
        const npcs: NPC[] = apiNpcs.map(n => ({
          id: n.npcId,
          name: n.name,
          role: n.role,
          personality: n.personality,
          description: n.description || '',
          attitude: n.attitude as 'positive' | 'neutral' | 'negative',
          avatarUrl: n.avatarUrl
        }));
        
        const gameEvents: GameEvent[] = events.map(e => ({
          id: e.eventId,
          timestamp: new Date(e.timestamp).getTime(),
          type: e.type as EventType,
          content: e.content,
          playerId: e.playerId,
          npcId: e.npcId,
          metadata: e.metadata
        }));
        
        const updatedGameState: GameState = {
          id: game.gameId,
          players,
          scenario: {
            title: game.scenarioData.title || '',
            description: game.scenarioData.description || '',
            type: game.scenarioData.type || ScenarioType.RANSOMWARE,
            difficultyLevel: game.scenarioData.difficultyLevel || 'medium',
            initialBudget: game.scenarioData.initialBudget || 400000,
            remainingBudget: game.scenarioData.remainingBudget || 400000,
            maxTurns: game.scenarioData.maxTurns || 10,
            objectives: game.scenarioData.objectives || [],
            assets: game.scenarioData.assets || [],
            timeline: game.scenarioData.timeline || [],
            stakeholders: game.scenarioData.stakeholders || [],
            summary: game.scenarioData.summary
          },
          npcs,
          gameEvents,
          currentPlayerIndex: game.currentPlayerIndex,
          isGameOver: game.isGameOver,
          startedAt: new Date(game.startedAt).getTime(),
          endedAt: game.endedAt ? new Date(game.endedAt).getTime() : undefined
        };
        
        dispatch({ type: 'SET_GAME_STATE', payload: updatedGameState });
      }
    } catch (err) {
      console.error('Error fetching game state:', err);
    }
  };
  
  // Provide the context values
  const contextValue: GameContextState = {
    state,
    dispatch,
    createGame,
    addPlayer,
    submitAction,
    configureScenario,
    startGame,
    endGame,
    isLoading,
    error
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

// Utilitaire pour importer React
import { useState } from 'react';