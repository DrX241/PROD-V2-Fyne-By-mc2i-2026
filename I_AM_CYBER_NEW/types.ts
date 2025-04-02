export interface UserProfile {
  id: string;
  name: string;
  avatarId: string;
  roleId: string;
  level: number;
  experience: number;
  skills: Array<{
    id: string;
    name: string;
    level: number;
    category: string;
    description: string;
  }>;
  completedMissions: string[];
  badges: string[];
}

export interface NPC {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  avatar: string;
  personality: string;
  promptTemplate: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Expert';
  contactName: string;
  contactRole: string;
  contactAvatar: string;
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  domain: string;
  primaryNPC?: string;
  supportNPCs?: string[];
  objectives?: Array<{
    id: string;
    description: string;
    completed: boolean;
  }>;
  badgeId?: string;
}

export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: number;
  contactName?: string;
  contactRole?: string;
  avatar?: string;
}

export type MessageType = 'user' | 'bot' | 'system';

export interface Conversation {
  id: string;
  messages: ChatMessage[];
  currentNPC: NPC;
  contextualData: {
    activeMission?: Mission;
    userLevel: string;
    previousInteractions: string[];
    userProfile?: UserProfile;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  difficulty: string;
  earnedDate?: Date;
}

export interface Avatar {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  unlockRequirement?: string;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  icon: string;
  benefits: string[];
}