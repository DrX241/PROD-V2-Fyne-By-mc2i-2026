// Types pour l'application OSINT Investigator

// Données d'un cas d'investigation
export interface CaseData {
  id: string;
  title: string;
  description: string;
  difficulty: 'débutant' | 'intermédiaire' | 'expert';
  objectives: string[];
  hints: string[];
}

// Résultat d'une recherche
export interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'web' | 'document' | 'profile' | 'image' | 'database';
  relevance: number;
  source: string;
  metadata?: Record<string, any>;
}

// Type pour un profil de réseau social
export interface SocialProfile {
  id: string;
  platformId: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joined?: string;
  followers?: number;
  following?: number;
  posts?: SocialPost[];
  connections?: string[];
}

// Type pour un post sur réseau social
export interface SocialPost {
  id: string;
  content: string;
  date: string;
  likes?: number;
  shares?: number;
  comments?: number;
  attachments?: {
    type: 'image' | 'video' | 'link';
    url: string;
    description?: string;
  }[];
}

// Résultat final d'une investigation
export interface InvestigationResult {
  caseId: string;
  caseTitle: string;
  evidenceCollected: any[];
  score: number;
  maxScore: number;
  status: 'success' | 'partial' | 'failed';
  conclusion: string;
  insights?: string[];
}

// Interface pour une source de données
export interface DataSource {
  id: string;
  name: string;
  type: 'general' | 'social' | 'database' | 'advanced';
  description: string;
  icon?: React.ReactNode;
}