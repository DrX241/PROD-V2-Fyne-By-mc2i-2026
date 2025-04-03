// Types pour les missions cybersécurité

export interface Contact {
  name: string;
  role: string;
  expertise: string;
  shortBio?: string;
  responseStyle?: string; // Style de communication du PNJ (formel, technique, etc.)
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
    role: "Directrice Communication et Marketing",
    expertise: "Communication de crise, gestion de l'image, relations publiques",
    responseStyle: "Orientée vers l'image externe et l'impact médiatique"
  },
  {
    name: "Arnaud Gauthier",
    role: "Président",
    expertise: "Stratégie d'entreprise, gestion des risques majeurs, leadership",
    responseStyle: "Directif, centré sur les résultats et la réputation de l'entreprise"
  },
  {
    name: "Olivier Hervo",
    role: "Directeur Général",
    expertise: "Opérations, gestion d'entreprise, supervision des pôles",
    responseStyle: "Orienté solutions, pragmatique, centré sur la continuité d'activité"
  },
  {
    name: "Lorenzo Bertola",
    role: "Directeur Général Adjoint et Directeur du pôle BFA",
    expertise: "Banque, Finance, Assurance, conformité réglementaire",
    responseStyle: "Analytique, attentif aux impacts réglementaires et financiers"
  },
  {
    name: "Anthony Frescal",
    role: "Directeur Général Adjoint et Directeur du pôle ENERGIES & UTILITIES",
    expertise: "Infrastructures critiques, énergie, services essentiels",
    responseStyle: "Technique, focus sur la résilience des systèmes critiques"
  },
  {
    name: "Vincent Pascal",
    role: "Directeur Général Adjoint et Directeur du Développement",
    expertise: "Stratégie de croissance, innovation, nouvelles opportunités",
    responseStyle: "Visionnaire, orienté vers les opportunités d'innovation et d'expansion"
  },
  {
    name: "Guillaume Lechevallier",
    role: "Directeur Général Adjoint et Directeur du pôle IMPULSE",
    expertise: "Industrie, Médias, Mobilités, Secteur Public, Protection Sociale, Santé",
    responseStyle: "Diplomate, conscient des enjeux politiques et sociaux"
  },
  {
    name: "Julien Grimault",
    role: "Senior Partner et Sponsor Cybersécurité",
    expertise: "Stratégie de cybersécurité, gouvernance, risques cyber",
    responseStyle: "Expert technique, centré sur les meilleures pratiques de sécurité"
  },
  {
    name: "Nosing Doeuk",
    role: "Senior Partner et Directeur DIXIT",
    expertise: "Data & IA, Cybersécurité et UX BFA",
    responseStyle: "Innovant, à la pointe des technologies, orienté données"
  },
  {
    name: "Thomas Mercier",
    role: "Responsable CERT",
    expertise: "Réponse aux incidents, analyse forensique, threat hunting",
    responseStyle: "Technique, précis, méthodique dans la résolution d'incidents"
  },
  {
    name: "Sarah Dumont",
    role: "Juriste Spécialisée RGPD",
    expertise: "Conformité légale, protection des données, notification d'incidents",
    responseStyle: "Factuelle, centrée sur la conformité légale et les obligations réglementaires"
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