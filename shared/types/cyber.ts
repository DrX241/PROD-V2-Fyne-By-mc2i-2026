export type ChatMessageType = 'user' | 'bot' | 'system' | 'email' | 'domain-selection' | 'scenario-selection' | 'scenario-context' | 'role-selection' | 'decision-choices';

export interface UserRole {
  id: string;
  name: string;
  description: string;
  available?: boolean;
}

export const USER_ROLES: UserRole[] = [
  { id: 'rssi', name: 'RSSI', description: 'Responsable de la Sécurité des Systèmes d\'Information', available: true },
  { id: 'hacker', name: 'Hacker éthique', description: 'Expert en tests d\'intrusion et sécurité', available: true },
  { id: 'developpeur', name: 'Développeur', description: 'Développeur sensibilisé aux vulnérabilités logicielles', available: true },
  { id: 'admin', name: 'Administrateur Système', description: 'Gestionnaire de l\'infrastructure sécurisée', available: true },
  { id: 'consultant', name: 'Consultant en cybersécurité', description: 'Spécialiste des audits de sécurité', available: true },
  { id: 'analyste', name: 'Analyste SOC', description: 'Expert en détection et analyse des menaces cyber', available: true }
];

export interface ScenarioContact {
  name: string;
  role: string;
  expertise?: string;
  concern?: string;
  company?: string;
}

// Type pour les missions de défense cyber
export interface Skill {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  category?: string;
  badges?: {
    name: string;
    description: string;
    icon: string;
    level: number;
    unlocked: boolean;
  }[];
}

export interface LearningEvent {
  id: string;
  timestamp: number;
  description: string;
  importance: 'low' | 'medium' | 'high';
  type?: string;
  skillsImpacted?: {
    skillId: string;
    points: number;
    gainedPoints?: number;
  }[];
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  level: 'Débutant' | 'Intermédiaire' | 'Expert';
  domain: string;
  secteurActivite: string;
  companyName: string;
  objectives: Objective[];
  decisions: Decision[];
  primaryContact: Contact;
  additionalContacts: Contact[];
  
  // Champs additionnels pour la compatibilité
  difficulty?: 'Débutant' | 'Intermédiaire' | 'Expert'; // Alias pour level
  userRole?: string;
  scenario?: string;
  contacts?: Contact[];
  duration?: string;
  tags?: string[];
  skillsProgress?: Skill[];
  learningEvents?: LearningEvent[];
}

export interface Contact extends ScenarioContact {
  id: string;
}

export interface Objective {
  id: string;
  description: string;
  actionOptions?: string[];
  evaluationCriteria?: string[];
}

export interface Decision {
  id: string;
  question: string;
  description?: string;
  options: {
    id: string;
    text: string;
    score?: number;
  }[];
}

// Jeu de contacts disponibles pour les missions
export const availableContacts: Contact[] = [
  {
    id: "yousra-saidani",
    name: "Yousra Saidani",
    role: "Senior Partner et Directrice Marketing, Communication et RSE",
    expertise: "Communication de crise et gestion de la réputation",
    concern: "Préoccupée par l'impact des incidents de sécurité sur l'image et la réputation de l'entreprise"
  },
  {
    id: "arnaud-gauthier",
    name: "Arnaud Gauthier",
    role: "Président",
    expertise: "Vision stratégique et gouvernance de la cybersécurité",
    concern: "Centré sur les enjeux stratégiques à long terme et la responsabilité du conseil d'administration"
  },
  {
    id: "olivier-hervo",
    name: "Olivier Hervo",
    role: "Directeur Général",
    expertise: "Arbitrage risques/opportunités en matière de sécurité",
    concern: "Recherche l'équilibre entre sécurité et développement business, protection et innovation"
  },
  {
    id: "lorenzo-bertola",
    name: "Lorenzo Bertola",
    role: "Directeur Général Adjoint et Directeur du pôle BFA",
    expertise: "Cybersécurité dans le secteur bancaire et financier",
    concern: "S'inquiète des implications réglementaires spécifiques au secteur financier (ACPR, réglementation bancaire) et de la protection des transactions"
  },
  {
    id: "anthony-frescal",
    name: "Anthony Frescal",
    role: "Directeur Général Adjoint et Directeur du pôle ENERGIES & UTILITIES",
    expertise: "Sécurité des infrastructures critiques énergétiques",
    concern: "Centré sur la protection des installations industrielles sensibles et la continuité de service des réseaux énergétiques"
  },
  {
    id: "julien-grimault",
    name: "Julien Grimault",
    role: "Senior Partner - Directeur d'unité, Sponsor du centre d'expertise Cybersécurité",
    expertise: "Stratégie cyber et accompagnement des entreprises",
    concern: "Intéressé par la mise en œuvre d'une stratégie cyber adaptée à la maturité des entreprises"
  },
  {
    id: "nosing-doeuk",
    name: "Nosing Doeuk",
    role: "Senior Partner - Directeur du pôle DIXIT",
    expertise: "Gestion des crises cyber dans les entreprises technologiques",
    concern: "Axé sur l'impact des disruptions technologiques dans la gestion de crise"
  },
  {
    id: "eddy-missoni",
    name: "Eddy MISSONI IDEMBI",
    role: "Expert Data / IA & CTO",
    expertise: "Sécurisation des modèles d'IA et protection des données",
    concern: "Préoccupé par les risques spécifiques aux systèmes d'IA (empoisonnement des données, détournement des modèles)"
  },
  {
    id: "thomas-mercier",
    name: "Thomas Mercier",
    role: "RSSI",
    expertise: "Gestion opérationnelle de la sécurité et réponse aux incidents",
    concern: "Focalisé sur les aspects techniques et la mise en œuvre des solutions de sécurité"
  },
  {
    id: "sarah-dumont",
    name: "Sarah Dumont",
    role: "Directrice Juridique",
    expertise: "Aspects juridiques de la cybersécurité et protection des données",
    concern: "Préoccupée par la conformité réglementaire (RGPD, NIS2) et les implications légales des incidents"
  }
];

// Fonction pour récupérer un contact par son nom
export function getContactByName(name: string): Contact | undefined {
  return availableContacts.find(contact => contact.name === name);
}

// Fonction pour récupérer les contacts de direction
export function getExecutiveContacts(): Contact[] {
  return availableContacts.filter(contact => 
    contact.role.toLowerCase().includes('président') || 
    contact.role.toLowerCase().includes('directeur') ||
    contact.role.toLowerCase().includes('partner')
  );
}

// Fonction pour récupérer les évaluateurs pour les missions
export function getEvaluators(): Contact[] {
  // Les contacts qui peuvent évaluer les performances
  return [
    getContactByName('Arnaud Gauthier')!,
    getContactByName('Olivier Hervo')!,
    getContactByName('Thomas Mercier')!
  ];
}

// Fonction pour récupérer les évaluateurs par domaine
export function getEvaluatorsByDomain(domain: string): Contact[] {
  const allEvaluators = getEvaluators();
  
  if (domain.toLowerCase().includes('finance') || domain.toLowerCase().includes('banque')) {
    return [getContactByName('Lorenzo Bertola')!];
  }
  
  if (domain.toLowerCase().includes('énergie') || domain.toLowerCase().includes('energie')) {
    return [getContactByName('Anthony Frescal')!];
  }
  
  if (domain.toLowerCase().includes('juridique') || domain.toLowerCase().includes('rgpd')) {
    return [getContactByName('Sarah Dumont')!];
  }
  
  return allEvaluators;
}

// Fonction pour récupérer les contacts directs (contacts de premier niveau)
export function getDirectContacts(): Contact[] {
  return [
    getContactByName('Yousra Saidani')!,
    getContactByName('Thomas Mercier')!,
    getContactByName('Julien Grimault')!
  ];
}

// Fonction pour calculer la progression globale des compétences
export function calculateGlobalSkillProgress(skillsProgress: { [skill: string]: number }): number {
  if (!skillsProgress || Object.keys(skillsProgress).length === 0) {
    return 0;
  }
  
  const sum = Object.values(skillsProgress).reduce((acc, val) => acc + val, 0);
  return Math.round(sum / Object.keys(skillsProgress).length);
}

// Interface pour les métadonnées des pièces jointes
export interface AttachmentMetadata {
  id: string;
  filename: string;
  type: string;
  createdAt: string;
  scenarioId: string;
  size: number;
  url: string;
}

export interface EmailMessageContent {
  id: string;
  from: ScenarioContact;
  to: string;
  subject: string;
  date: string;
  body: string;
  // Support de l'ancien format pour la rétrocompatibilité
  attachment?: string;
  // Nouveau format avec support de multiples pièces jointes
  attachments?: AttachmentMetadata[];
  evaluation?: {
    id: string;
    title: string;
    score: number;
    maxScore: number;
    feedback: string;
    details?: {
      [category: string]: {
        score: number;
        maxScore: number;
        feedback: string;
      }
    }
  };
  scenarioContacts?: ScenarioContact[];
}

export interface CrisisDecisionOption {
  id: string;
  text: string;
  description: string;
  impact: {
    budget?: number;             // Impact sur le budget (valeur négative = réduction)
    timeline?: number;           // Impact sur le délai en jours (valeur négative = gain de temps)
    reputation?: number;         // Impact sur la réputation (échelle -10 à 10)
    security?: number;           // Impact sur le niveau de sécurité (échelle -10 à 10)
    employment?: boolean;        // Potentiel impact sur l'emploi (licenciements)
    missionCritical?: boolean;   // Pourrait mettre fin à la mission si échoue
  };
}

export interface CrisisDecisionContent {
  id: string;
  situation: string;
  context: string;
  historicalFacts: string;
  consequences: string;
  options: CrisisDecisionOption[];
  deadline?: string;
  urgencyLevel?: 'faible' | 'modérée' | 'élevée' | 'critique';
}

export interface ChatMessage {
  id: string;
  type: ChatMessageType;
  content: string | EmailMessageContent | CrisisDecisionContent;
  timestamp: number;
  contactName?: string;
  contactRole?: string;
  isIAMCYBERIntervention?: boolean;
  iamCyberContent?: string;
  contactContent?: string;
}

export interface Message {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: number;
  sender?: string;
  senderRole?: string;
  evaluation?: {
    score: number;
    feedback: string;
    impact: {
      skillId: string;
      points: number;
    }[];
  };
}

export interface ScenarioState {
  activeScenario: CyberScenario | null;
  activeDomain: CyberDomain | null;
  scenarioContacts?: ScenarioContact[];
  contact?: {
    name: string;
    role: string;
  };
}

export interface CyberDomain {
  id: string;
  name: string;
  description: string;
  icon?: string; // Icône associée au domaine
  iconBgColor?: string; // Couleur de fond de l'icône
  iconColor?: string; // Couleur de l'icône elle-même
  applicableRoles?: string[]; // Rôles pour lesquels ce domaine est applicable
}

export interface CyberScenario {
  id: string;
  domain: string; // ID du domaine parent
  domainId?: string; // Alias pour domain (compatibilité)
  title: string;
  difficulty: string;
  difficultyColor?: string; // Couleur associée au niveau de difficulté
  description?: string;
  contact: {
    name: string;
    role: string;
  };
  skillsProgress?: {
    [skill: string]: number;
  };
}

export interface AIConfig {
  difficultyLevel: 'Débutant' | 'Intermédiaire' | 'Expert';
  responseStyle: 'Professionnel' | 'Détaillé et pédagogique' | 'Concis et direct';
  temperature?: number;
  maxTokens?: number;
}

export interface ChatContextType {
  messages: ChatMessage[];
  userName: string;
  userRole: string;
  isTyping: boolean;
  scenario: ScenarioState;
  config: AIConfig;
  domains: CyberDomain[];
  scenarios: CyberScenario[];
  currentStage: number;
  passwordValidated: boolean;
  missionBriefConfirmed: boolean;
  missionBriefReceived: boolean;
  setUserName: (name: string) => void;
  setUserRole: (role: string) => void;
  selectDomain: (domain: CyberDomain) => void;
  selectScenario: (scenario: CyberScenario) => void;
  sendMessage: (message: string) => void;
  updateConfig: (config: Partial<AIConfig>) => void;
  resetChat: () => void;
  setPasswordValidated: (validated: boolean) => void;
  confirmMissionBrief: () => void;
}