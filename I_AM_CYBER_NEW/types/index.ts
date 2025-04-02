/**
 * Types de base pour I AM CYBER NEW
 */

// Types pour les avatars
export interface Avatar {
  id: string;
  name: string;
  imagePath: string;
}

// Types pour les rôles des utilisateurs
export type UserRoleType = 'débutant' | 'analyste' | 'expert';

export interface UserRole {
  id: string;
  name: string;
  description: string;
  type: UserRoleType;
}

// Types pour les niveaux de difficulté
export type DifficultyLevel = 'Débutant' | 'Intermédiaire' | 'Expert';

// Types pour les compétences
export interface Skill {
  id: string;
  name: string;
  description: string;
  level: number; // 0-100
  category: string;
}

// Types pour les missions
export interface Mission {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: DifficultyLevel;
  domain: string;
  objectives: MissionObjective[];
  primaryNPC: string; // ID du PNJ principal
  supportNPCs: string[]; // IDs des PNJ secondaires
  rewards: {
    points: number;
    badges?: string[];
    unlockedMissions?: string[];
  };
  status: 'locked' | 'available' | 'in-progress' | 'completed';
}

export interface MissionObjective {
  id: string;
  description: string;
  validationMethod: 'chat' | 'quiz' | 'code';
  validationCriteria: string;
  completed: boolean;
}

// Types pour les PNJ (Personnages Non-Joueurs)
export interface NPC {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  avatar: string;
  personality: string;
  promptTemplate: string;
}

// Types pour les messages de chat
export type MessageType = 'user' | 'bot' | 'email' | 'system' | 'question';

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string | EmailMessageContent;
  timestamp: number;
  contactName?: string;
  contactRole?: string;
  avatar?: string;
}

export interface EmailMessageContent {
  subject: string;
  from: {
    name: string;
    email: string;
    role?: string;
  };
  to: string;
  body: string;
  attachments?: string[];
}

// Types pour les domaines de cybersécurité
export interface CyberDomain {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
}

// Types pour le profil utilisateur
export interface UserProfile {
  id: string;
  name: string;
  avatarId: string;
  roleId: string;
  level: number;
  experience: number;
  skills: Skill[];
  completedMissions: string[];
  badges: string[];
}

// Types pour la conversation
export interface Conversation {
  id: string;
  messages: ChatMessage[];
  currentNPC: NPC;
  contextualData: {
    activeMission?: Mission;
    userLevel: string;
    previousInteractions: string[];
  }
}

// Types pour la configuration de l'IA
export interface AIConfig {
  difficultyLevel: DifficultyLevel;
  responseStyle: 'Détaillé et pédagogique' | 'Professionnel' | 'Concis et direct';
  temperature: number;
  maxTokens: number;
}

// Types pour les badges
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  difficulty: string;
  earnedDate?: Date;
}