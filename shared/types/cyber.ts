export interface CrisisScenario {
  id: string;
  title: string;
  description: string;
  duration: string;
  complexity: 'Basique' | 'Intermédiaire' | 'Avancé' | 'Expert';
  phases: number;
  participants: number;
  category: string;
  tags: string[];
  objectives: string[];
  stats?: {
    completions: number;
    avgScore: number;
    bestTime: string;
  };
  image?: string;
  available: boolean;
  featured: boolean;
  new: boolean;
  threat?: string;
  initialMessage?: string;
  timeLimit?: number;
}

export interface CrisisPhase {
  id: string;
  name: string;
  description: string;
  alerts: Alert[];
  messages: Message[];
  decisions: Decision[];
  timeTriggers: TimeTrigger[];
}

export interface Alert {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  source: string;
  description: string;
  status: 'new' | 'investigating' | 'mitigated' | 'resolved';
}

export interface Message {
  id: string;
  sender: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  urgent: boolean;
  attachments?: {
    name: string;
    type: string;
    url: string;
  }[];
  decisions?: CrisisDecisionContent[];
}

export interface Decision {
  id: string;
  text: string;
  options: DecisionOption[];
}

export interface DecisionOption {
  id: string;
  text: string;
  impact: {
    security: number;
    time: number;
    reputation: number;
    cost: number;
  };
  consequences: string[];
  triggers?: string[];
}

export interface CrisisDecisionContent {
  id: string;
  text: string;
  impact: 'positive' | 'negative' | 'neutral';
  timeImpact: number;
  securityImpact: number;
  reputationImpact: number;
  costImpact: number;
}

export interface TimeTrigger {
  time: number;
  action: 'alert' | 'message' | 'indicator' | 'decision';
  target: string;
}

export interface CrisisTeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  avatarFallback: string;
  expertise: string[];
  availability: 'available' | 'busy' | 'unavailable';
  confidence: number;
  stress: number;
  responseTime: number;
  lastContact?: string;
}

export interface CrisisIndicator {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  critical: number;
  danger: number;
  warning: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CrisisEventEvaluation {
  analysis: string;
  impacts: {
    domain: 'sécurité' | 'temps' | 'réputation' | 'coût';
    impact: number;
    description: string;
  }[];
  recommendations: string[];
  score: number;
}