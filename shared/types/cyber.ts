// Types pour les missions cybersécurité

export interface Contact {
  name: string;
  role: string;
  expertise: string;
  shortBio?: string;
  responseStyle?: string; // Style de communication du PNJ (formel, technique, etc.)
  isExecutive?: boolean; // Indique si le contact est un supérieur hiérarchique
  canEvaluate?: boolean; // Indique si le contact peut évaluer les décisions de l'utilisateur
  evaluationDomain?: string; // Domaine d'expertise pour l'évaluation (finances, communication, technique, etc.)
}

export interface Decision {
  id: string;
  description: string;
  options: Array<{
    id: string;
    text: string;
    consequences: {
      positive: string[];
      negative: string[];
    };
    score: number; // -10 à +10, impact sur l'évaluation
  }>;
  madeChoice?: string; // ID de l'option choisie par l'utilisateur
  feedback?: string; // Feedback des responsables sur cette décision
}

export interface Objective {
  id: string;
  description: string;
  completed: boolean;
  evaluationCriteria: string[];
  decisions: Decision[]; // Décisions liées à cet objectif
  requiredSkills?: string[]; // Compétences nécessaires pour réussir
}

// Définition des compétences mesurables
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: "technique" | "communication" | "leadership" | "analyse" | "stratégie";
  level: number; // 0-100
  icon?: string; // Nom de l'icône Lucide
}

// Définition d'un événement d'apprentissage
export interface LearningEvent {
  id: string;
  timestamp: number;
  description: string;
  skillsImpacted: Array<{
    skillId: string;
    gainedPoints: number;
  }>;
  relatedDecisionId?: string;
  relatedObjectiveId?: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: "Débutant" | "Intermédiaire" | "Expert";
  duration: string;
  tags: string[];
  scenario: string;
  objectives: Objective[];
  contacts: Contact[];
  supervisors: Contact[]; // Responsables qui évaluent les performances
  userRole: string; // Rôle assigné à l'utilisateur dans la mission
  evaluationSystem: {
    maxPoints: number;
    penaltyThreshold: number; // Seuil de points en dessous duquel des pénalités sont appliquées
    rewards: string[]; // Récompenses potentielles pour une bonne performance
    penalties: string[]; // Pénalités potentielles pour une mauvaise performance
  };
  currentScore?: number; // Score actuel accumulé par l'utilisateur
  requiredSkills?: string[]; // Compétences recommandées pour cette mission
  skillsProgress?: Skill[]; // Progression des compétences durant cette mission
  learningEvents?: LearningEvent[]; // Événements d'apprentissage
}

export interface Message {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  sender?: string;
  senderRole?: string;
  timestamp: number;
  additionalResponse?: boolean; // Indique si ce message est une réaction à un message précédent
  decisionPrompt?: boolean; // Indique si ce message attend une décision de l'utilisateur
  decisionId?: string; // ID de la décision associée si applicable
  evaluation?: boolean; // Indique si ce message est une évaluation d'une décision
  systemAlert?: boolean; // Indique une alerte système importante
}

// Liste des contacts disponibles dans le système
export const availableContacts: Contact[] = [
  {
    name: "Marion Lopez",
    role: "Directeur communication et marketing",
    expertise: "Communication de crise, gestion de l'image, relations publiques",
    responseStyle: "Orientée vers l'image externe et l'impact médiatique",
    isExecutive: true,
    canEvaluate: true,
    evaluationDomain: "communication"
  },
  {
    name: "Arnaud Gauthier",
    role: "Président",
    expertise: "Stratégie d'entreprise, gestion des risques majeurs, leadership",
    responseStyle: "Directif, centré sur les résultats et la réputation de l'entreprise",
    isExecutive: true,
    canEvaluate: true,
    evaluationDomain: "stratégie"
  },
  {
    name: "Olivier Hervo",
    role: "Directeur Général",
    expertise: "Opérations, gestion d'entreprise, supervision des pôles",
    responseStyle: "Orienté solutions, pragmatique, centré sur la continuité d'activité",
    isExecutive: true,
    canEvaluate: true,
    evaluationDomain: "opérations"
  },
  {
    name: "Lorenzo Bertola",
    role: "Directeur Général Adjoint et Directeur du pôle BFA",
    expertise: "Banque, Finance, Assurance, conformité réglementaire",
    responseStyle: "Analytique, attentif aux impacts réglementaires et financiers",
    isExecutive: true,
    canEvaluate: true,
    evaluationDomain: "finance"
  },
  {
    name: "Anthony Frescal",
    role: "Directeur Général Adjoint et Directeur du pôle ENERGIES & UTILITIES",
    expertise: "Infrastructures critiques, énergie, services essentiels",
    responseStyle: "Technique, focus sur la résilience des systèmes critiques",
    isExecutive: true,
    canEvaluate: true,
    evaluationDomain: "infrastructure"
  },
  {
    name: "Vincent Pascal",
    role: "Directeur Général Adjoint et Directeur du Développement",
    expertise: "Stratégie de croissance, innovation, nouvelles opportunités",
    responseStyle: "Visionnaire, orienté vers les opportunités d'innovation et d'expansion",
    isExecutive: true,
    canEvaluate: true,
    evaluationDomain: "innovation"
  },
  {
    name: "Guillaume Lechevallier",
    role: "Directeur Général Adjoint et Directeur du pôle IMPULSE",
    expertise: "Industrie, Médias, Mobilités, Secteur Public, Protection Sociale, Santé",
    responseStyle: "Diplomate, conscient des enjeux politiques et sociaux",
    isExecutive: true,
    canEvaluate: true,
    evaluationDomain: "relations"
  },
  {
    name: "Julien Grimault",
    role: "Senior Partner et Sponsor Cybersécurité",
    expertise: "Stratégie de cybersécurité, gouvernance, risques cyber",
    responseStyle: "Expert technique, centré sur les meilleures pratiques de sécurité",
    isExecutive: true,
    canEvaluate: true,
    evaluationDomain: "cybersécurité"
  },
  {
    name: "Nosing Doeuk",
    role: "Senior Partner et Directeur DIXIT",
    expertise: "Data & IA, Cybersécurité et UX BFA",
    responseStyle: "Innovant, à la pointe des technologies, orienté données",
    isExecutive: true,
    canEvaluate: true,
    evaluationDomain: "technologie"
  },
  {
    name: "Thomas Mercier",
    role: "Responsable CERT",
    expertise: "Réponse aux incidents, analyse forensique, threat hunting",
    responseStyle: "Technique, précis, méthodique dans la résolution d'incidents",
    isExecutive: false,
    canEvaluate: false
  },
  {
    name: "Sarah Dumont",
    role: "Juriste Spécialisée RGPD",
    expertise: "Conformité légale, protection des données, notification d'incidents",
    responseStyle: "Factuelle, centrée sur la conformité légale et les obligations réglementaires",
    isExecutive: false,
    canEvaluate: false
  }
];

// Fonctions utilitaires
export function getContactByName(name: string): Contact | undefined {
  return availableContacts.find(contact => 
    contact.name.toLowerCase() === name.toLowerCase() ||
    contact.name.split(' ')[0].toLowerCase() === name.toLowerCase()
  );
}

export function getRandomContacts(count: number, exclude: string[] = []): Contact[] {
  const availableForSelection = availableContacts.filter(
    contact => !exclude.includes(contact.name)
  );
  
  const shuffled = [...availableForSelection].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getExecutiveContacts(): Contact[] {
  return availableContacts.filter(contact => contact.isExecutive === true);
}

export function getEvaluators(): Contact[] {
  return availableContacts.filter(contact => contact.canEvaluate === true);
}

export function getEvaluatorsByDomain(domain: string): Contact[] {
  return availableContacts.filter(
    contact => contact.canEvaluate === true && 
    contact.evaluationDomain?.toLowerCase() === domain.toLowerCase()
  );
}

export function getDirectContacts(): Contact[] {
  return availableContacts.filter(contact => contact.isExecutive !== true);
}