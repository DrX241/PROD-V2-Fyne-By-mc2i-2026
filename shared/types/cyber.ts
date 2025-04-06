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

// Types de compétences cybersécurité
export type SkillCategory = 
  | "technique" 
  | "communication" 
  | "leadership" 
  | "analyse" 
  | "stratégie" 
  | "juridique" 
  | "gestion_crise";

// Niveaux de maîtrise des compétences
export type SkillLevel = 
  | "débutant" 
  | "intermédiaire" 
  | "avancé" 
  | "expert";

// Badge obtenu suite à une progression significative
export interface SkillBadge {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  requiredLevel: number; // Niveau requis pour obtenir ce badge
  dateObtained?: number; // Timestamp d'obtention
  category: SkillCategory;
}

// Définition des compétences mesurables
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  level: number; // 0-100
  icon?: string; // Nom de l'icône Lucide
  badges?: SkillBadge[]; // Badges débloqués pour cette compétence
  levelLabel?: SkillLevel; // Label textuel du niveau actuel
  lastProgress?: number; // Timestamp de la dernière progression
  recommendations?: string[]; // Conseils pour améliorer cette compétence
}

// Type d'événement d'apprentissage
export type LearningEventType = 
  | "decision_made" 
  | "objective_completed" 
  | "knowledge_acquired" 
  | "feedback_received"
  | "challenge_completed"
  | "simulation_success"
  | "expert_advice_applied";

// Définition d'un événement d'apprentissage
export interface LearningEvent {
  id: string;
  timestamp: number;
  description: string;
  type: LearningEventType;
  skillsImpacted: Array<{
    skillId: string;
    gainedPoints: number;
    newLevel?: number; // Nouveau niveau après gain
    badgeUnlocked?: string; // ID du badge débloqué si applicable
  }>;
  relatedDecisionId?: string;
  relatedObjectiveId?: string;
  feedback?: string; // Commentaire du système sur cet événement d'apprentissage
  importance: "low" | "medium" | "high"; // Importance de cet événement d'apprentissage
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: "Débutant" | "Intermédiaire" | "Expert";
  duration: string;
  tags: string[];
  scenario: string;
  companyName: string; // Nom de l'entreprise
  secteurActivite: string; // Secteur d'activité
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
  if (!name) return undefined;
  
  return availableContacts.find(contact => 
    contact && contact.name && (
      contact.name.toLowerCase() === name.toLowerCase() ||
      contact.name.split(' ')[0].toLowerCase() === name.toLowerCase()
    )
  );
}

export function getRandomContacts(count: number, exclude: string[] = []): Contact[] {
  const availableForSelection = availableContacts.filter(
    contact => contact && contact.name && !exclude.includes(contact.name)
  );
  
  const shuffled = [...availableForSelection].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getExecutiveContacts(): Contact[] {
  return availableContacts.filter(contact => contact && contact.isExecutive === true);
}

export function getEvaluators(): Contact[] {
  return availableContacts.filter(contact => contact && contact.canEvaluate === true);
}

export function getEvaluatorsByDomain(domain: string): Contact[] {
  if (!domain) return [];
  
  return availableContacts.filter(
    contact => contact && contact.canEvaluate === true && 
    contact.evaluationDomain && contact.evaluationDomain.toLowerCase() === domain.toLowerCase()
  );
}

export function getDirectContacts(): Contact[] {
  return availableContacts.filter(contact => contact && contact.isExecutive !== true);
}

// Fonctions utilitaires pour les compétences
export function getSkillLevelLabel(level: number): SkillLevel {
  if (level < 25) return "débutant";
  if (level < 50) return "intermédiaire";
  if (level < 80) return "avancé";
  return "expert";
}

export function calculateGlobalSkillProgress(skills: Skill[]): number {
  if (!skills || skills.length === 0) return 0;
  
  const totalPoints = skills.reduce((acc, skill) => acc + skill.level, 0);
  const maxPossiblePoints = skills.length * 100;
  
  return Math.round((totalPoints / maxPossiblePoints) * 100);
}

export function getSkillsRecommendations(skill: Skill): string[] {
  // Recommandations par défaut selon la catégorie de compétence
  const defaultRecommendations: Record<SkillCategory, string[]> = {
    technique: [
      "Approfondissez vos connaissances des outils d'analyse forensique",
      "Pratiquez l'identification des indicateurs de compromission",
      "Explorez les techniques avancées de détection d'intrusion"
    ],
    communication: [
      "Améliorez votre communication en situation de crise",
      "Pratiquez la vulgarisation des concepts techniques",
      "Développez des stratégies de communication inter-équipes"
    ],
    leadership: [
      "Renforcez votre prise de décision sous pression",
      "Développez des compétences de coordination d'équipe",
      "Améliorez la délégation et la supervision des tâches critiques"
    ],
    analyse: [
      "Approfondissez vos compétences d'analyse de risque",
      "Développez une méthodologie structurée d'investigation",
      "Pratiquez l'analyse des causes profondes d'incidents"
    ],
    stratégie: [
      "Améliorez l'élaboration de plans de réponse aux incidents",
      "Développez une vision holistique de la sécurité",
      "Apprenez à aligner la cybersécurité avec les objectifs business"
    ],
    juridique: [
      "Approfondissez vos connaissances des obligations réglementaires",
      "Développez des compétences en notification d'incidents",
      "Maîtrisez les aspects juridiques de la gestion de crise"
    ],
    gestion_crise: [
      "Améliorez vos compétences en coordination d'équipes multidisciplinaires",
      "Développez des stratégies de continuité d'activité",
      "Pratiquez les simulations de crise avec différents scénarios"
    ]
  };
  
  // Si des recommandations personnalisées existent, les utiliser
  if (skill.recommendations && skill.recommendations.length > 0) {
    return skill.recommendations;
  }
  
  // Sinon, retourner les recommandations par défaut pour cette catégorie
  return defaultRecommendations[skill.category] || [];
}

// Générer un badge lorsqu'un niveau significatif est atteint
export function generateBadgeForSkillLevel(skill: Skill): SkillBadge | null {
  // Seuils pour obtenir des badges
  const badgeThresholds = [25, 50, 75, 100];
  
  // Si le niveau actuel ne correspond pas à un seuil, ne pas générer de badge
  const threshold = badgeThresholds.find(t => skill.level >= t && (!skill.lastProgress || skill.level - skill.lastProgress < t));
  if (!threshold) return null;
  
  // Noms des badges par niveau
  const badgeNames: Record<number, string> = {
    25: "Initié",
    50: "Qualifié",
    75: "Expert",
    100: "Maître"
  };
  
  // Descriptions des badges par catégorie et niveau
  const badgeDescriptions: Record<SkillCategory, Record<number, string>> = {
    technique: {
      25: "Vous maîtrisez les bases des outils techniques de cybersécurité",
      50: "Vous êtes capable d'utiliser efficacement les outils d'analyse et de détection",
      75: "Vous êtes un expert dans l'utilisation avancée des outils techniques",
      100: "Vous êtes un maître incontesté des technologies de cybersécurité"
    },
    communication: {
      25: "Vous savez communiquer efficacement sur les sujets de base",
      50: "Vous êtes capable de vulgariser des concepts techniques complexes",
      75: "Vous excellez dans la communication stratégique en situation de crise",
      100: "Vous êtes un communicant d'exception en cybersécurité"
    },
    leadership: {
      25: "Vous savez diriger une équipe dans des situations standard",
      50: "Vous êtes capable de coordonner efficacement des équipes multidisciplinaires",
      75: "Vous excellez dans le leadership en situation de crise",
      100: "Vous êtes un leader visionnaire en cybersécurité"
    },
    analyse: {
      25: "Vous maîtrisez les bases de l'analyse de risque",
      50: "Vous êtes capable d'analyser des situations complexes avec méthodologie",
      75: "Vous excellez dans l'analyse approfondie des menaces avancées",
      100: "Vous êtes un analyste d'exception capable de déceler les patterns les plus subtils"
    },
    stratégie: {
      25: "Vous savez élaborer des stratégies de défense de base",
      50: "Vous êtes capable de développer des plans de défense efficaces",
      75: "Vous excellez dans l'élaboration de stratégies de sécurité holistiques",
      100: "Vous êtes un stratège d'exception en cybersécurité"
    },
    juridique: {
      25: "Vous comprenez les bases légales de la cybersécurité",
      50: "Vous êtes capable d'identifier les implications juridiques complexes",
      75: "Vous excellez dans l'application des cadres réglementaires",
      100: "Vous êtes une référence en matière de droit appliqué à la cybersécurité"
    },
    gestion_crise: {
      25: "Vous savez réagir efficacement aux incidents mineurs",
      50: "Vous êtes capable de gérer des crises de moyenne envergure",
      75: "Vous excellez dans la coordination de réponse aux incidents majeurs",
      100: "Vous êtes un expert incontesté de la gestion de crise cybernétique"
    }
  };
  
  return {
    id: `${skill.id}_${threshold}`,
    name: `${badgeNames[threshold]} en ${skill.name}`,
    description: badgeDescriptions[skill.category][threshold] || `Vous avez atteint un niveau ${badgeNames[threshold]} dans cette compétence`,
    requiredLevel: threshold,
    dateObtained: Date.now(),
    category: skill.category
  };
}