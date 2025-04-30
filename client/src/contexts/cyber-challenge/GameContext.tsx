import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types pour les rôles et modes de jeu
export type GameRole = 'rssi' | 'ethical-hacker' | 'developer' | 'sysadmin' | 'consultant';
export type GameMode = 'classic' | 'tunnel';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Type pour les scénarios
export interface Scenario {
  id: string;
  title: string;
  description: string;
  briefing: string;
  difficulty: DifficultyLevel;
  objectives: string[];
  backgroundContext?: string;
}

// Interface pour le contexte du jeu
interface GameContextProps {
  // État du jeu
  selectedRole: GameRole | null;
  selectedMode: GameMode | null;
  difficultyLevel: DifficultyLevel;
  currentScenario: Scenario | null;
  completedObjectives: string[];
  score: number;
  username: string;
  timeRemaining: number;
  isGameActive: boolean;
  
  // Actions du jeu
  setSelectedRole: (role: GameRole) => void;
  setSelectedMode: (mode: GameMode) => void;
  setDifficultyLevel: (level: DifficultyLevel) => void;
  setCurrentScenario: (scenario: Scenario) => void;
  completeObjective: (objectiveId: string) => void;
  updateScore: (points: number) => void;
  setUsername: (name: string) => void;
  setTimeRemaining: (time: number) => void;
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
}

// Création du contexte avec valeurs par défaut
const GameContext = createContext<GameContextProps>({
  // État par défaut
  selectedRole: null,
  selectedMode: null,
  difficultyLevel: 'intermediate',
  currentScenario: null,
  completedObjectives: [],
  score: 0,
  username: '',
  timeRemaining: 600, // 10 minutes en secondes
  isGameActive: false,
  
  // Fonctions vides par défaut
  setSelectedRole: () => {},
  setSelectedMode: () => {},
  setDifficultyLevel: () => {},
  setCurrentScenario: () => {},
  completeObjective: () => {},
  updateScore: () => {},
  setUsername: () => {},
  setTimeRemaining: () => {},
  startGame: () => {},
  endGame: () => {},
  resetGame: () => {},
});

// Props du provider
interface GameProviderProps {
  children: ReactNode;
}

// Provider qui fournit le contexte aux composants enfants
export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  // État du jeu
  const [selectedRole, setSelectedRole] = useState<GameRole | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('intermediate');
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [completedObjectives, setCompletedObjectives] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);
  const [username, setUsername] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(600); // 10 minutes
  const [isGameActive, setIsGameActive] = useState<boolean>(false);

  // Actions du jeu
  const completeObjective = (objectiveId: string) => {
    if (!completedObjectives.includes(objectiveId)) {
      setCompletedObjectives([...completedObjectives, objectiveId]);
      
      // Ajout de points en fonction de la difficulté
      const points = difficultyLevel === 'beginner' ? 10 :
                    difficultyLevel === 'intermediate' ? 20 : 30;
      updateScore(points);
    }
  };

  const updateScore = (points: number) => {
    setScore(prevScore => prevScore + points);
  };

  const startGame = () => {
    setIsGameActive(true);
    setScore(0);
    setCompletedObjectives([]);
    // Le timer serait démarré ici dans une implémentation complète
  };

  const endGame = () => {
    setIsGameActive(false);
    // Le timer serait arrêté ici
  };

  const resetGame = () => {
    setSelectedRole(null);
    setSelectedMode(null);
    setDifficultyLevel('intermediate');
    setCurrentScenario(null);
    setCompletedObjectives([]);
    setScore(0);
    setTimeRemaining(600);
    setIsGameActive(false);
  };

  // Valeurs fournies par le contexte
  const value = {
    selectedRole,
    selectedMode,
    difficultyLevel,
    currentScenario,
    completedObjectives,
    score,
    username,
    timeRemaining,
    isGameActive,
    
    setSelectedRole,
    setSelectedMode,
    setDifficultyLevel,
    setCurrentScenario,
    completeObjective,
    updateScore,
    setUsername,
    setTimeRemaining,
    startGame,
    endGame,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte
export const useGameContext = () => useContext(GameContext);

export default GameContext;