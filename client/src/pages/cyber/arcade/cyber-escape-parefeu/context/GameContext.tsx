import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Types pour l'état du jeu
export interface GameState {
  currentRoom: string;
  visitedRooms: string[];
  inventory: GameItem[];
  unlockedRooms: string[];
  budget: number;
  timeRemaining: number;
  events: string[];
  puzzlesSolved: string[];
  difficulty: 'easy' | 'normal' | 'hard';
}

export interface GameItem {
  id: string;
  name: string;
  type: 'document' | 'password' | 'tool' | 'clue';
  discovered: boolean;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  isAccessible: boolean;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  traits: string[];
}

export interface ConversationMessage {
  sender: 'player' | 'npc' | 'system';
  content: string;
}

export interface MissionBriefing {
  title: string;
  briefing: string;
  initialObjectives: string[];
  tips: string[];
}

// Interface pour le contexte
interface GameContextType {
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;
  isGameInitialized: boolean;
  missionBriefing: MissionBriefing | null;
  currentRoom: Room | null;
  availableRooms: Room[];
  characters: Character[];
  activeCharacter: Character | null;
  conversationHistory: Record<string, ConversationMessage[]>;
  isShowingSummary: boolean;
  
  // Actions
  initializeGame: (difficulty: 'easy' | 'normal' | 'hard') => Promise<void>;
  enterRoom: (roomId: string) => Promise<void>;
  interactWithNPC: (characterId: string, message: string) => Promise<void>;
  interactWithItem: (itemId: string) => Promise<void>;
  solvePuzzle: (puzzleId: string, solution: string) => Promise<{isCorrect: boolean, feedback: string}>;
  generatePlayerProfile: () => Promise<any>;
  selectCharacter: (character: Character | null) => void;
  setShowingSummary: (show: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Rooms data
const rooms: Room[] = [
  { id: 'hub', name: 'Hub central', isAccessible: true },
  { id: 'rh', name: 'Département RH', isAccessible: true },
  { id: 'it', name: 'Département IT', isAccessible: true },
  { id: 'support', name: 'Support technique', isAccessible: false },
  { id: 'direction', name: 'Bureau Direction', isAccessible: false },
  { id: 'salle-chiffree', name: 'Salle sécurisée', isAccessible: false }
];

// Characters data
const characters: Character[] = [
  { 
    id: 'eddy', 
    name: 'Eddy', 
    role: 'Responsable RH',
    traits: ['Stressé', 'Peu technique', 'Craintif'] 
  },
  { 
    id: 'neil', 
    name: 'Neil', 
    role: 'DSI',
    traits: ['Technique', 'Factuel', 'Exigeant'] 
  },
  { 
    id: 'yousra', 
    name: 'Yousra', 
    role: 'Technicienne Support',
    traits: ['Compétente', 'Paresseuse', 'Calculatrice'] 
  },
  { 
    id: 'guillaume', 
    name: 'Guillaume', 
    role: 'Directeur Général',
    traits: ['Autoritaire', 'Impatient', 'Orienté business'] 
  },
  { 
    id: 'fares', 
    name: 'Farès', 
    role: 'Collègue suspect',
    traits: ['Trop serviable', 'Évasif', 'Suspect'] 
  }
];

// Character room mapping
const characterRoomMap: Record<string, string> = {
  'eddy': 'rh',
  'neil': 'it',
  'yousra': 'support',
  'guillaume': 'direction',
  'fares': 'hub'
};

// Provider component
export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isGameInitialized, setIsGameInitialized] = useState<boolean>(false);
  const [missionBriefing, setMissionBriefing] = useState<MissionBriefing | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Record<string, ConversationMessage[]>>({});
  const [isShowingSummary, setIsShowingSummary] = useState<boolean>(false);

  // Calculate available rooms based on game state
  const availableRooms = React.useMemo(() => {
    if (!gameState) return rooms.filter(r => r.isAccessible);
    
    return rooms.map(room => ({
      ...room,
      isAccessible: gameState.unlockedRooms.includes(room.id)
    }));
  }, [gameState]);

  // Initialize game
  const initializeGame = useCallback(async (difficulty: 'easy' | 'normal' | 'hard' = 'normal') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/cyber/arcade/cyber-escape/init', { difficulty });
      
      setGameState(response.data.gameState);
      setMissionBriefing(response.data.mission);
      setCurrentRoom(rooms.find(r => r.id === 'hub') || null);
      setIsGameInitialized(true);
      
      // Reset conversation history
      setConversationHistory({});
      setActiveCharacter(null);
      setIsShowingSummary(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to initialize game');
      console.error('Error initializing game:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enter a room
  const enterRoom = useCallback(async (roomId: string) => {
    if (!gameState) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const roomData = rooms.find(r => r.id === roomId);
      if (!roomData) {
        throw new Error('Room not found');
      }
      
      const response = await axios.post('/api/cyber/arcade/cyber-escape/enter-room', {
        room: {
          id: roomId,
          name: roomData.name
        },
        gameState
      });
      
      setGameState(response.data.gameState);
      setCurrentRoom(roomData);
      setActiveCharacter(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to enter room');
      console.error('Error entering room:', err);
    } finally {
      setIsLoading(false);
    }
  }, [gameState]);

  // Interact with an NPC
  const interactWithNPC = useCallback(async (characterId: string, message: string) => {
    if (!gameState || !activeCharacter) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Get conversation history for this character
      const history = conversationHistory[characterId] || [];
      
      // Add user message to history
      const updatedHistory = [
        ...history,
        { sender: 'player', content: message } as ConversationMessage
      ];
      
      setConversationHistory(prev => ({
        ...prev,
        [characterId]: updatedHistory
      }));
      
      const response = await axios.post('/api/cyber/arcade/cyber-escape/interact-npc', {
        npcId: characterId,
        userInput: message,
        conversationHistory: updatedHistory,
        gameState
      });
      
      // Update game state
      setGameState(response.data.gameState);
      
      // Add NPC response to conversation history
      const npcResponse = {
        sender: 'npc',
        content: response.data.response.dialogue
      } as ConversationMessage;
      
      setConversationHistory(prev => ({
        ...prev,
        [characterId]: [...(prev[characterId] || []), npcResponse]
      }));
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to interact with character');
      console.error('Error interacting with character:', err);
    } finally {
      setIsLoading(false);
    }
  }, [gameState, activeCharacter, conversationHistory]);

  // Interact with an item
  const interactWithItem = useCallback(async (itemId: string) => {
    if (!gameState) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const item = gameState.inventory.find(i => i.id === itemId);
      
      if (!item) {
        throw new Error('Item not found in inventory');
      }
      
      const response = await axios.post('/api/cyber/arcade/cyber-escape/interact-item', {
        item: {
          id: itemId,
          name: item.name,
          type: item.type
        },
        gameState
      });
      
      // Update game state
      setGameState(response.data.gameState);
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to interact with item');
      console.error('Error interacting with item:', err);
    } finally {
      setIsLoading(false);
    }
  }, [gameState]);

  // Solve a puzzle
  const solvePuzzle = useCallback(async (puzzleId: string, solution: string) => {
    if (!gameState) return { isCorrect: false, feedback: 'Game not initialized' };
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/cyber/arcade/cyber-escape/solve-puzzle', {
        puzzleId,
        proposedSolution: solution,
        gameState
      });
      
      // Update game state
      setGameState(response.data.gameState);
      
      return {
        isCorrect: response.data.isCorrect,
        feedback: response.data.feedback
      };
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to solve puzzle');
      console.error('Error solving puzzle:', err);
      return { isCorrect: false, feedback: 'An error occurred' };
    } finally {
      setIsLoading(false);
    }
  }, [gameState]);

  // Generate player profile (for end-of-game summary)
  const generatePlayerProfile = useCallback(async () => {
    if (!gameState) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/cyber/arcade/cyber-escape/generate-profile', {
        gameState
      });
      
      return response.data;
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate player profile');
      console.error('Error generating player profile:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [gameState]);

  // Select a character to interact with
  const selectCharacter = useCallback((character: Character | null) => {
    setActiveCharacter(character);
    
    // Initialize conversation history for this character if it doesn't exist
    if (character && !conversationHistory[character.id]) {
      setConversationHistory(prev => ({
        ...prev,
        [character.id]: []
      }));
    }
  }, [conversationHistory]);

  // Set showing summary state
  const setShowingSummary = useCallback((show: boolean) => {
    setIsShowingSummary(show);
  }, []);

  // Get available characters for the current room
  const availableCharacters = React.useMemo(() => {
    if (!currentRoom) return [];
    
    return characters.filter(character => {
      return characterRoomMap[character.id] === currentRoom.id;
    });
  }, [currentRoom]);

  return (
    <GameContext.Provider
      value={{
        gameState,
        isLoading,
        error,
        isGameInitialized,
        missionBriefing,
        currentRoom,
        availableRooms,
        characters: availableCharacters,
        activeCharacter,
        conversationHistory,
        isShowingSummary,
        
        // Actions
        initializeGame,
        enterRoom,
        interactWithNPC,
        interactWithItem,
        solvePuzzle,
        generatePlayerProfile,
        selectCharacter,
        setShowingSummary
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

// Custom hook to use the game context
export function useGame() {
  const context = useContext(GameContext);
  
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
}