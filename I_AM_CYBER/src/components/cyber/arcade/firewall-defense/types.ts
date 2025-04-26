import { ReactNode } from 'react';

export type Difficulty = 'Facile' | 'Moyen' | 'Difficile';

export interface FirewallDefenseGameProps {
  difficulty: Difficulty;
  onGameEnd?: (score: number) => void;
}

export interface Defense {
  id: string;
  name: string;
  description: string;
  type: 'firewall' | 'auth' | 'encryption' | 'monitoring' | 'update';
  icon: ReactNode;
  level: number; // Niveau de défense (1-5)
  correctPosition: number; // Position correcte dans la chaîne (ordre)
  color: string;
  explanation?: string; // Explication pédagogique sur cette défense (pour le feedback)
  hint?: string; // Indice pour aider l'utilisateur si la défense est mal placée
}

export interface Level {
  id: number;
  name: string;
  description: string;
  defenses: Defense[];
  connections: Connection[];
  targetTime?: number; // Facultatif: temps cible en secondes (non utilisé)
  maxScore: number;
}

export interface Connection {
  from: string; // ID de la défense source
  to: string; // ID de la défense cible
  isRequired: boolean; // Si la connexion est obligatoire
}

export interface GameState {
  currentLevel: number;
  maxLevels: number;
  currentScore: number;
  totalScore: number;
  timer: number;
  isComplete: boolean;
  placedDefenses: PlacedDefense[];
  showTutorial: boolean;
  tutorialStep: number;
  gamePhase: 'preparation' | 'playing' | 'completed' | 'results';
}

export interface PlacedDefense {
  defenseId: string;
  position: number;
  isCorrect?: boolean;
}