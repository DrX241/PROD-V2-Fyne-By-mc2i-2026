import { createContext, useContext, useState, ReactNode } from 'react';

// Types des rôles disponibles dans le jeu
export type GameRole = 
  | 'rssi'
  | 'ethical-hacker'
  | 'soc-analyst'
  | 'secure-developer'
  | 'cybersecurity-consultant'
  | 'system-administrator'
  | 'cyber-legal'
  | 'financial-director';

// Types des modes de jeu disponibles
export type GameMode = 
  | 'classic-challenge'
  | 'tunnel-effect'
  | 'pca-scenario'
  | 'hackathon';

// Définition de l'interface du contexte
interface GameContextType {
  // État du jeu
  selectedRole: GameRole | null;
  selectedMode: GameMode | null;
  score: number;
  timeElapsed: number;
  gameStarted: boolean;
  gameCompleted: boolean;
  currentStage: number;
  maxStages: number;
  logs: string[];
  
  // Méthodes
  selectRole: (role: GameRole) => void;
  selectMode: (mode: GameMode) => void;
  startGame: () => void;
  completeGame: () => void;
  incrementScore: (points: number) => void;
  resetGame: () => void;
  advanceStage: () => void;
  addLogEntry: (entry: string) => void;
}

// Création du contexte avec une valeur par défaut undefined
const GameContext = createContext<GameContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame doit être utilisé à l\'intérieur d\'un GameProvider');
  }
  return context;
}

// Provider qui enveloppe notre application
export function GameProvider({ children }: { children: ReactNode }) {
  // État initial du jeu
  const [selectedRole, setSelectedRole] = useState<GameRole | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [maxStages, setMaxStages] = useState(10);
  const [logs, setLogs] = useState<string[]>([]);

  // Sélection du rôle
  const selectRole = (role: GameRole) => {
    setSelectedRole(role);
    addLogEntry(`Rôle sélectionné: ${role}`);
  };

  // Sélection du mode de jeu
  const selectMode = (mode: GameMode) => {
    setSelectedMode(mode);
    
    // Définir le nombre d'étapes en fonction du mode
    let stages = 10;
    
    switch (mode) {
      case 'classic-challenge':
        stages = 15; // 15 niveaux pour le défi classique
        break;
      case 'tunnel-effect':
        stages = 10; // 10 questions rapides pour l'effet tunnel
        break;
      case 'pca-scenario':
        stages = 8; // 8 étapes pour le scénario PCA
        break;
      case 'hackathon':
        stages = 10; // 10 indices à trouver pour le hackathon
        break;
    }
    
    setMaxStages(stages);
    addLogEntry(`Mode sélectionné: ${mode} (${stages} étapes)`);
  };

  // Démarrer le jeu
  const startGame = async () => {
    if (!selectedRole || !selectedMode) {
      addLogEntry('Impossible de démarrer: rôle ou mode non sélectionné');
      return;
    }
    
    setGameStarted(true);
    setCurrentStage(1);
    setScore(0);
    setTimeElapsed(0);
    setGameCompleted(false);
    
    // Démarrer le chronomètre
    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      setTimeElapsed(elapsedSeconds);
    }, 1000);
    
    // Enregistrer l'intervalle dans localStorage pour pouvoir le nettoyer plus tard
    // @ts-ignore
    window.gameTimerInterval = timerInterval;
    
    addLogEntry('Jeu démarré');
  };

  // Terminer le jeu
  const completeGame = () => {
    setGameCompleted(true);
    
    // Arrêter le chronomètre
    // @ts-ignore
    if (window.gameTimerInterval) {
      // @ts-ignore
      clearInterval(window.gameTimerInterval);
    }
    
    addLogEntry(`Jeu terminé avec un score de ${score} en ${formatTime(timeElapsed)}`);
  };

  // Incrémenter le score
  const incrementScore = (points: number) => {
    setScore(prevScore => {
      const newScore = prevScore + points;
      addLogEntry(`Score ${points >= 0 ? 'augmenté' : 'diminué'} de ${Math.abs(points)} points (${prevScore} → ${newScore})`);
      return newScore;
    });
  };

  // Réinitialiser le jeu
  const resetGame = () => {
    setSelectedRole(null);
    setSelectedMode(null);
    setScore(0);
    setTimeElapsed(0);
    setGameStarted(false);
    setGameCompleted(false);
    setCurrentStage(0);
    setLogs([]);
    
    // Arrêter le chronomètre s'il est en cours
    // @ts-ignore
    if (window.gameTimerInterval) {
      // @ts-ignore
      clearInterval(window.gameTimerInterval);
    }
    
    addLogEntry('Jeu réinitialisé');
  };

  // Avancer d'une étape
  const advanceStage = () => {
    if (currentStage < maxStages) {
      setCurrentStage(prev => prev + 1);
      addLogEntry(`Progression à l'étape ${currentStage + 1}/${maxStages}`);
    } else {
      completeGame();
    }
  };

  // Ajouter une entrée au journal
  const addLogEntry = (entry: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${entry}`]);
  };

  // Formater le temps (secondes → MM:SS)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Valeur du contexte à fournir
  const value: GameContextType = {
    selectedRole,
    selectedMode,
    score,
    timeElapsed,
    gameStarted,
    gameCompleted,
    currentStage,
    maxStages,
    logs,
    selectRole,
    selectMode,
    startGame,
    completeGame,
    incrementScore,
    resetGame,
    advanceStage,
    addLogEntry
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}