import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Character, VirtualRoom, virtualRooms } from '../data/rooms';

// Types pour le système de choix et de conséquences
export interface Choice {
  id: string;
  text: string;
  impact: number;
  consequence: string;
  isSecurityBest: boolean;
}

export interface GameAction {
  id: string;
  timestamp: Date;
  type: 'advice' | 'choice' | 'challenge';
  characterId: string;
  points: number;
  description: string;
}

export interface BestPractice {
  id: string;
  title: string;
  description: string;
  category: 'passwords' | 'phishing' | 'data' | 'devices' | 'network' | 'general';
  importance: 'critical' | 'high' | 'medium' | 'low';
}

export interface GameSummary {
  totalPoints: number;
  successRate: number;
  bestPractices: BestPractice[];
  keyDecisions: GameAction[];
  challengesCompleted: number;
  securityLevel: number;
}

interface GameContextType {
  // État du jeu
  currentRoom: VirtualRoom;
  currentCharacter: Character | null;
  securityPoints: number;
  completedChallenges: string[];
  currentConversation: string | null;
  gameActions: GameAction[];
  isGameOver: boolean;
  showSummary: boolean;
  gameSummary: GameSummary | null;
  discoveredBestPractices: BestPractice[];
  
  // Méthodes
  changeRoom: (roomId: string) => void;
  selectCharacter: (characterId: string | null) => void;
  selectConversation: (conversationId: string | null) => void;
  addSecurityPoints: (points: number, reason?: string) => void;
  deductPoints: (points: number, reason: string) => void;
  completeChallenge: (challengeId: string, success: boolean) => void;
  resetGame: () => void;
  makeChoice: (choiceId: string, choice: Choice) => void;
  giveAdvice: (characterId: string, advice: string, impact: number) => void;
  setShowSummary: (show: boolean) => void;
  generateGameSummary: () => void;
  discoverBestPractice: (practice: BestPractice) => void;
  
  // Méthodes utilitaires
  isRoomAccessible: (room: VirtualRoom) => boolean;
  isChallengeCompleted: (challengeId: string) => boolean;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // État du jeu
  const [currentRoomId, setCurrentRoomId] = useState('lobby');
  const [currentCharacterId, setCurrentCharacterId] = useState<string | null>(null);
  const [securityPoints, setSecurityPoints] = useState(20); // Commencer avec des points
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [gameActions, setGameActions] = useState<GameAction[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [gameSummary, setGameSummary] = useState<GameSummary | null>(null);
  const [discoveredBestPractices, setDiscoveredBestPractices] = useState<BestPractice[]>([]);

  // Trouver la salle actuelle
  const currentRoom = virtualRooms.find(room => room.id === currentRoomId) || virtualRooms[0];
  
  // Trouver le personnage actuel
  const currentCharacter = currentCharacterId
    ? currentRoom.characters.find(char => char.id === currentCharacterId) || null
    : null;

  // Vérifier si le jeu est terminé quand les points de sécurité deviennent négatifs
  useEffect(() => {
    if (securityPoints < 0 && !isGameOver) {
      setIsGameOver(true);
      // Générer le résumé automatiquement à la fin du jeu
      generateGameSummary();
      setShowSummary(true);
    }
  }, [securityPoints, isGameOver]);

  // Changer de salle
  const changeRoom = (roomId: string) => {
    const targetRoom = virtualRooms.find(room => room.id === roomId);
    if (targetRoom && isRoomAccessible(targetRoom) && !isGameOver) {
      setCurrentRoomId(roomId);
      setCurrentCharacterId(null);
      setCurrentConversation(null);
    }
  };

  // Sélectionner un personnage
  const selectCharacter = (characterId: string | null) => {
    if (!isGameOver) {
      setCurrentCharacterId(characterId);
      setCurrentConversation(characterId ? 'introduction' : null);
    }
  };

  // Sélectionner une conversation
  const selectConversation = (conversationId: string | null) => {
    if (!isGameOver) {
      setCurrentConversation(conversationId);
    }
  };

  // Ajouter des points de sécurité
  const addSecurityPoints = (points: number, reason: string = "Action positive") => {
    if (isGameOver) return;
    
    setSecurityPoints(prev => prev + points);
    
    if (currentCharacterId) {
      const newAction: GameAction = {
        id: `action-${Date.now()}`,
        timestamp: new Date(),
        type: 'challenge',
        characterId: currentCharacterId,
        points,
        description: reason
      };
      
      setGameActions(prev => [...prev, newAction]);
    }
  };

  // Déduire des points de sécurité
  const deductPoints = (points: number, reason: string) => {
    if (isGameOver) return;
    
    setSecurityPoints(prev => prev - points);
    
    if (currentCharacterId) {
      const newAction: GameAction = {
        id: `action-${Date.now()}`,
        timestamp: new Date(),
        type: 'challenge',
        characterId: currentCharacterId,
        points: -points,
        description: reason
      };
      
      setGameActions(prev => [...prev, newAction]);
    }
  };

  // Marquer un défi comme terminé avec succès ou échec
  const completeChallenge = (challengeId: string, success: boolean) => {
    if (isGameOver) return;
    
    if (!completedChallenges.includes(challengeId)) {
      setCompletedChallenges(prev => [...prev, challengeId]);
    }
  };

  // Enregistrer un choix effectué par le joueur
  const makeChoice = (choiceId: string, choice: Choice) => {
    if (isGameOver) return;
    
    if (currentCharacterId) {
      // Ajouter ou déduire des points en fonction de l'impact du choix
      setSecurityPoints(prev => prev + choice.impact);
      
      const newAction: GameAction = {
        id: choiceId,
        timestamp: new Date(),
        type: 'choice',
        characterId: currentCharacterId,
        points: choice.impact,
        description: `Choix: ${choice.text}. Conséquence: ${choice.consequence}`
      };
      
      setGameActions(prev => [...prev, newAction]);
    }
  };
  
  // Enregistrer un conseil donné par le joueur
  const giveAdvice = (characterId: string, advice: string, impact: number) => {
    if (isGameOver) return;
    
    setSecurityPoints(prev => prev + impact);
    
    const newAction: GameAction = {
      id: `advice-${Date.now()}`,
      timestamp: new Date(),
      type: 'advice',
      characterId: characterId,
      points: impact,
      description: `Conseil: ${advice}`
    };
    
    setGameActions(prev => [...prev, newAction]);
  };
  
  // Découvrir une nouvelle bonne pratique
  const discoverBestPractice = (practice: BestPractice) => {
    if (discoveredBestPractices.find(p => p.id === practice.id)) return;
    
    setDiscoveredBestPractices(prev => [...prev, practice]);
  };
  
  // Générer un résumé de fin de partie
  const generateGameSummary = () => {
    // Calcul du taux de réussite (décisions positives / total des décisions)
    const positiveActions = gameActions.filter(action => action.points > 0);
    const successRate = gameActions.length > 0 
      ? (positiveActions.length / gameActions.length) * 100 
      : 0;
    
    // Récupérer les décisions clés (plus grand impact positif et négatif)
    const sortedActions = [...gameActions].sort((a, b) => Math.abs(b.points) - Math.abs(a.points));
    const keyDecisions = sortedActions.slice(0, 5);
    
    // Calcul du niveau de sécurité final
    const securityLevel = Math.max(1, Math.min(5, Math.floor(securityPoints / 25) + 1));
    
    const summary: GameSummary = {
      totalPoints: securityPoints,
      successRate,
      bestPractices: discoveredBestPractices,
      keyDecisions,
      challengesCompleted: completedChallenges.length,
      securityLevel
    };
    
    setGameSummary(summary);
  };

  // Réinitialiser le jeu
  const resetGame = () => {
    setCurrentRoomId('lobby');
    setCurrentCharacterId(null);
    setSecurityPoints(20); // Points de départ
    setCompletedChallenges([]);
    setCurrentConversation(null);
    setGameActions([]);
    setIsGameOver(false);
    setShowSummary(false);
    setGameSummary(null);
    setDiscoveredBestPractices([]);
  };

  // Vérifier si une salle est accessible
  const isRoomAccessible = (room: VirtualRoom) => {
    return !room.isLocked || (room.requiredPoints !== undefined && securityPoints >= room.requiredPoints);
  };

  // Vérifier si un défi est terminé
  const isChallengeCompleted = (challengeId: string) => {
    return completedChallenges.includes(challengeId);
  };

  const value = {
    currentRoom,
    currentCharacter,
    securityPoints,
    completedChallenges,
    currentConversation,
    gameActions,
    isGameOver,
    showSummary,
    gameSummary,
    discoveredBestPractices,
    changeRoom,
    selectCharacter,
    selectConversation,
    addSecurityPoints,
    deductPoints,
    completeChallenge,
    resetGame,
    makeChoice,
    giveAdvice,
    setShowSummary,
    generateGameSummary,
    discoverBestPractice,
    isRoomAccessible,
    isChallengeCompleted
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};