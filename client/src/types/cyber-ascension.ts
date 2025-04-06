// Types pour le module CYBER ASCENSION
export type AscensionTheme = 
  | 'SécuritéRéseau' 
  | 'CyberDéfense' 
  | 'SécuritéCloud' 
  | 'OSINT' 
  | 'GouvernanceCyber'
  | 'SécuritéApplicative'
  | 'GestionDesIdentités'
  | 'RéponsesAuxIncidents'
  | 'ForensicCyber'
  | 'SécuritéIoT'
  | 'ArchitectureSécurisée'
  | 'CryptographieAppliquée'
  | 'AuditSécurité'
  | 'ZéroTrust'
  | 'SecDevOps';

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface AscensionLevel {
  id: number;
  name: string;
  description: string;
  difficulty: DifficultyLevel;
  unlocked: boolean;
  completed: boolean;
  objectives: string[];
  timeEstimate: string; // e.g., "10-15 min"
  xpReward: number;
  badgeId?: string;
}

export interface AscensionThemeDetails {
  id: string;
  name: string;
  description: string;
  icon: string;
  levels: AscensionLevel[];
  progress: number; // 0-100
  unlockedLevels: number;
  totalLevels: number;
  themeColor: string;
}

export interface LevelChallenge {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'scenario' | 'simulation' | 'analysis';
  content: LevelContent;
}

export interface LevelContent {
  introduction: string;
  scenario?: string;
  questions?: QuizQuestion[];
  simulationSteps?: SimulationStep[];
  resources?: Resource[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of the correct option
  explanation: string;
}

export interface SimulationStep {
  id: string;
  situation: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  guidance?: string;
}

export interface Resource {
  title: string;
  type: 'article' | 'video' | 'tool' | 'reference';
  url?: string;
  content?: string;
}

export interface LevelAttempt {
  levelId: number;
  themeId: string;
  userId: string;
  startTime: number;
  endTime?: number;
  score?: number;
  success: boolean;
  answers?: {
    questionId: string;
    selectedAnswer: any;
    correct: boolean;
  }[];
}

export interface UserAscensionProgress {
  userId: string;
  totalXp: number;
  rank: string;
  badges: string[];
  completedLevels: {
    themeId: string;
    levelId: number;
    score: number;
    completedAt: number;
  }[];
  currentTheme?: string;
  currentLevel?: number;
}

export interface AscensionSettings {
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  language: 'fr' | 'en';
  enableHints: boolean;
  timeLimit?: number; // minutes per level, undefined means no limit
}