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

export interface UserRole {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  available?: boolean;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

// Définition des types pour les contacts
export interface Contact {
  id: string;
  name: string;
  role: string;
  department: string;
  email?: string;
  phone?: string;
  availability?: 'available' | 'busy' | 'unavailable';
  expertise?: string[];
  avatarUrl?: string;
  concern?: string;
}

// Liste des contacts disponibles dans l'application
export const availableContacts: Contact[] = [
  {
    id: 'contact-1',
    name: 'Yousra Saidani',
    role: 'RSSI',
    department: 'Sécurité',
    email: 'y.saidani@exemple.com',
    expertise: ['Gestion de crise', 'Gouvernance', 'Gestion des risques'],
    availability: 'available'
  },
  {
    id: 'contact-2',
    name: 'Arnaud Gauthier',
    role: 'DSI',
    department: 'IT',
    email: 'a.gauthier@exemple.com',
    expertise: ['Infrastructure', 'Transformation digitale', 'Stratégie IT'],
    availability: 'available'
  },
  {
    id: 'contact-3',
    name: 'Olivier Hervo',
    role: 'Lead SOC',
    department: 'Sécurité',
    email: 'o.hervo@exemple.com',
    expertise: ['Détection', 'Réponse incident', 'Monitoring'],
    availability: 'available'
  },
  {
    id: 'contact-4',
    name: 'Lorenzo Bertola',
    role: 'Analyste Sécurité',
    department: 'Sécurité',
    email: 'l.bertola@exemple.com',
    expertise: ['Analyse forensique', 'Malware', 'Reverse engineering'],
    availability: 'available'
  },
  {
    id: 'contact-5',
    name: 'Anthony Frescal',
    role: 'Responsable infrastructure',
    department: 'IT',
    email: 'a.frescal@exemple.com',
    expertise: ['Cloud', 'Réseau', 'Systèmes'],
    availability: 'available'
  },
  {
    id: 'contact-6',
    name: 'Sarah Dumont',
    role: 'DG',
    department: 'Direction',
    email: 's.dumont@exemple.com',
    expertise: ['Leadership', 'Stratégie d\'entreprise'],
    availability: 'busy'
  },
  {
    id: 'contact-7',
    name: 'Julien Grimault',
    role: 'Responsable juridique',
    department: 'Juridique',
    email: 'j.grimault@exemple.com',
    expertise: ['RGPD', 'Conformité', 'Contrats'],
    availability: 'available'
  },
  {
    id: 'contact-8',
    name: 'Nosing Doeuk',
    role: 'Architecte Cyber',
    department: 'Sécurité',
    email: 'n.doeuk@exemple.com',
    expertise: ['Architecture sécurisée', 'DevSecOps', 'IAM'],
    availability: 'available'
  },
  {
    id: 'contact-9',
    name: 'Thomas Mercier',
    role: 'Responsable Communication',
    department: 'Communication',
    email: 't.mercier@exemple.com',
    expertise: ['Communication de crise', 'Relations presse'],
    availability: 'available'
  }
];

// Fonction pour récupérer un contact par son nom
export function getContactByName(name: string): Contact | undefined {
  return availableContacts.find(contact => contact.name === name);
}

// Fonction pour récupérer les contacts de direction
export function getExecutiveContacts(): Contact[] {
  return availableContacts.filter(
    contact => contact.role.includes('DG') || 
              contact.role.includes('Directeur') || 
              contact.role.includes('Direction')
  );
}

// Fonction pour récupérer les contacts évaluateurs
export function getEvaluators(): Contact[] {
  return availableContacts.filter(
    contact => contact.role.includes('RSSI') || 
              contact.role.includes('DSI') || 
              contact.role.includes('Chef')
  );
}

// Fonction pour récupérer les évaluateurs par domaine
export function getEvaluatorsByDomain(domain: string): Contact[] {
  if (domain.toLowerCase().includes('securite') || domain.toLowerCase().includes('sécurité')) {
    return availableContacts.filter(contact => 
      contact.department.toLowerCase().includes('sécurité') ||
      contact.expertise?.some(e => e.toLowerCase().includes('sécurité'))
    );
  } else if (domain.toLowerCase().includes('dev') || domain.toLowerCase().includes('application')) {
    return availableContacts.filter(contact => 
      contact.expertise?.some(e => 
        e.toLowerCase().includes('dev') || 
        e.toLowerCase().includes('application')
      )
    );
  }
  return getEvaluators();
}

// Fonction pour récupérer les contacts directs
export function getDirectContacts(): Contact[] {
  return availableContacts.filter(c => c.availability === 'available');
}

// Interfaces pour les missions
export interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert';
  category: string;
  objectives: Objective[];
  contact: Contact;
  decisions?: Decision[];
  isCompleted?: boolean;
  progress?: number;
  timeEstimate?: string;
  xpReward?: number;
  domain?: string;
}

// Interface pour les objectifs
export interface Objective {
  id: string;
  description: string;
  isCompleted?: boolean;
  isOptional?: boolean;
}

// Interface pour les décisions
export interface Decision {
  id: string;
  question: string;
  options: { id: string; text: string; }[];
  context?: string;
  correctOptionId?: string;
}

export const USER_ROLES: UserRole[] = [
  {
    id: 'blue-team',
    name: 'Équipe Bleue',
    description: 'Défendre les systèmes contre les attaques et gérer la réponse aux incidents.',
    color: 'blue',
    available: true,
    skillLevel: 'intermediate'
  },
  {
    id: 'red-team',
    name: 'Équipe Rouge',
    description: 'Tester les défenses et identifier les vulnérabilités par des simulations d\'attaque.',
    color: 'red',
    available: true,
    skillLevel: 'advanced'
  },
  {
    id: 'secops',
    name: 'Sécurité Opérationnelle',
    description: 'Maintenir la sécurité quotidienne et surveiller les activités suspectes.',
    color: 'green',
    available: true,
    skillLevel: 'intermediate'
  },
  {
    id: 'secarch',
    name: 'Architecte Sécurité',
    description: 'Concevoir des systèmes sécurisés et établir les standards de sécurité.',
    color: 'purple',
    available: true,
    skillLevel: 'expert'
  },
  {
    id: 'secdev',
    name: 'Développeur Sécurité',
    description: 'Intégrer la sécurité dans le cycle de développement logiciel.',
    color: 'cyan',
    available: true,
    skillLevel: 'advanced'
  },
  {
    id: 'secgov',
    name: 'Gouvernance Sécurité',
    description: 'Gérer les politiques, les risques et la conformité en matière de sécurité.',
    color: 'amber',
    available: true,
    skillLevel: 'intermediate'
  }
];