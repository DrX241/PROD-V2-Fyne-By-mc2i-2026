export type ChatMessageType = 'user' | 'bot' | 'system' | 'email' | 'domain-selection' | 'scenario-selection' | 'scenario-context';

export interface ScenarioContact {
  name: string;
  role: string;
  expertise?: string;
  concern?: string;
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

export interface EmailMessageContent {
  id?: string;
  from?: ScenarioContact;
  to?: string;
  subject: string;
  date?: string;
  body: string;
  attachment?: string;
  
  // Propriétés alternatives pour la rétrocompatibilité
  sender?: string;
  senderRole?: string;
  company?: string;
  recipients?: string[];
  
  // Évaluation du message
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
  
  // Liste des contacts pour le scénario
  scenarioContacts?: ScenarioContact[];
  
  // Horodatage
  timestamp?: number;
}

export interface ChatMessage {
  id: string;
  type: ChatMessageType;
  content: string | EmailMessageContent;
  timestamp: number;
  contactName?: string;
  contactRole?: string;
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
  icon?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export interface CyberScenario {
  id: string;
  domain: string;
  domainId?: string;         // Identifiant du domaine pour la compatibilité
  title: string;
  difficulty: string;
  difficultyColor?: string;  // Couleur associée au niveau de difficulté
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
  userId?: string;         // ID utilisateur pour identification
  profile?: string;        // Profil utilisateur (ex: "Généraliste", "Technique", etc.)
  keyType?: 'primary' | 'secondary';  // Type de clé API utilisée
}

export interface ChatContextType {
  messages: ChatMessage[];
  userName: string;
  isTyping: boolean;
  scenario: ScenarioState;
  config: AIConfig;
  domains: CyberDomain[];
  scenarios: CyberScenario[];
  setUserName: (name: string) => void;
  selectDomain: (domain: CyberDomain) => void;
  selectScenario: (scenario: CyberScenario) => void;
  sendMessage: (message: string) => void;
  updateConfig: (config: Partial<AIConfig>) => void;
  resetChat: () => void;
}