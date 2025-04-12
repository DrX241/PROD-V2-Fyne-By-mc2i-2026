export interface CaseData {
  id: string;
  title: string;
  description: string;
  difficulty: 'débutant' | 'intermédiaire' | 'expert';
  objectives: string[];
  hints: string[];
}

export interface InvestigationResult {
  caseId: string;
  caseTitle: string;
  evidenceCollected: any[];
  score: number;
  maxScore: number;
  status: 'success' | 'partial' | 'failure';
  conclusion: string;
}

export interface SocialProfile {
  id: string;
  username: string;
  displayName: string;
  profileImage?: string;
  bio?: string;
  followers?: number;
  following?: number;
  location?: string;
  joinDate?: string;
  lastActive?: string;
  verified?: boolean;
  platform: 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'other';
  posts: SocialPost[];
}

export interface SocialPost {
  id: string;
  content: string;
  date: string;
  likes: number;
  shares: number;
  comments: number;
  attachments?: {
    type: 'image' | 'video' | 'link';
    url: string;
    description?: string;
  }[];
  location?: string;
  tags?: string[];
  evidenceValue: 'very_high' | 'high' | 'medium' | 'low';
}

export interface DatabaseRecord {
  id: string;
  type: 'person' | 'organization' | 'event' | 'location' | 'article' | 'property' | 'financial' | 'other';
  title: string;
  content: string;
  metadata: {
    [key: string]: string | number | boolean | string[];
  };
  source: string;
  date: string;
  relevance: number; // 0-1
  evidenceValue: 'very_high' | 'high' | 'medium' | 'low';
}