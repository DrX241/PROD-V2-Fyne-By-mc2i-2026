import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Character, VirtualRoom, virtualRooms } from '../data/rooms';

interface GameContextType {
  // État du jeu
  currentRoom: VirtualRoom;
  currentCharacter: Character | null;
  securityPoints: number;
  completedChallenges: string[];
  currentConversation: string | null;
  
  // Méthodes
  changeRoom: (roomId: string) => void;
  selectCharacter: (characterId: string | null) => void;
  selectConversation: (conversationId: string | null) => void;
  addSecurityPoints: (points: number) => void;
  completeChallenge: (challengeId: string) => void;
  resetGame: () => void;
  
  // Méthodes utilitaires
  isRoomAccessible: (room: VirtualRoom) => boolean;
  isChallengeCompleted: (challengeId: string) => boolean;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRoomId, setCurrentRoomId] = useState('lobby');
  const [currentCharacterId, setCurrentCharacterId] = useState<string | null>(null);
  const [securityPoints, setSecurityPoints] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);

  // Trouver la salle actuelle
  const currentRoom = virtualRooms.find(room => room.id === currentRoomId) || virtualRooms[0];
  
  // Trouver le personnage actuel
  const currentCharacter = currentCharacterId
    ? currentRoom.characters.find(char => char.id === currentCharacterId) || null
    : null;

  // Changer de salle
  const changeRoom = (roomId: string) => {
    const targetRoom = virtualRooms.find(room => room.id === roomId);
    if (targetRoom && isRoomAccessible(targetRoom)) {
      setCurrentRoomId(roomId);
      setCurrentCharacterId(null);
      setCurrentConversation(null);
    }
  };

  // Sélectionner un personnage
  const selectCharacter = (characterId: string | null) => {
    setCurrentCharacterId(characterId);
    setCurrentConversation(characterId ? 'introduction' : null);
  };

  // Sélectionner une conversation
  const selectConversation = (conversationId: string | null) => {
    setCurrentConversation(conversationId);
  };

  // Ajouter des points de sécurité
  const addSecurityPoints = (points: number) => {
    setSecurityPoints(prev => prev + points);
  };

  // Marquer un défi comme terminé
  const completeChallenge = (challengeId: string) => {
    if (!completedChallenges.includes(challengeId)) {
      setCompletedChallenges(prev => [...prev, challengeId]);
    }
  };

  // Réinitialiser le jeu
  const resetGame = () => {
    setCurrentRoomId('lobby');
    setCurrentCharacterId(null);
    setSecurityPoints(0);
    setCompletedChallenges([]);
    setCurrentConversation(null);
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
    changeRoom,
    selectCharacter,
    selectConversation,
    addSecurityPoints,
    completeChallenge,
    resetGame,
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