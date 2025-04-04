// Types pour la gestion des compétences

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  level: number;
  maxLevel: number;
  icon?: string;
  progress: number;
  lastUpdated: number;
}

export enum SkillCategory {
  TECHNICAL = "technical",
  GOVERNANCE = "governance",
  MANAGEMENT = "management",
  ANALYSIS = "analysis",
  RESPONSE = "response",
  AWARENESS = "awareness"
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  color: string;
  requiredSkills: {
    skillId: string;
    minLevel: number;
  }[];
  unlocked: boolean;
  unlockedDate?: number;
}

export interface ScenarioProgress {
  scenarioId: string;
  name: string;
  completed: boolean;
  score?: number;
  date: number;
  skillsGained: {
    skillId: string;
    points: number;
  }[];
}

export interface SkillsState {
  skills: Skill[];
  badges: Badge[];
  scenarioHistory: ScenarioProgress[];
  lastUpdated: number;
}

// Compétences par défaut
export const DEFAULT_SKILLS: Skill[] = [
  {
    id: "risk-assessment",
    name: "Évaluation des risques",
    category: SkillCategory.GOVERNANCE,
    description: "Capacité à identifier, évaluer et hiérarchiser les risques de sécurité.",
    level: 1,
    maxLevel: 5,
    progress: 0,
    lastUpdated: Date.now()
  },
  {
    id: "incident-response",
    name: "Réponse aux incidents",
    category: SkillCategory.RESPONSE,
    description: "Capacité à gérer efficacement les incidents de sécurité.",
    level: 1,
    maxLevel: 5,
    progress: 0,
    lastUpdated: Date.now()
  },
  {
    id: "threat-intelligence",
    name: "Renseignement sur les menaces",
    category: SkillCategory.ANALYSIS,
    description: "Capacité à collecter et analyser les informations sur les menaces potentielles.",
    level: 1,
    maxLevel: 5,
    progress: 0,
    lastUpdated: Date.now()
  },
  {
    id: "network-security",
    name: "Sécurité des réseaux",
    category: SkillCategory.TECHNICAL,
    description: "Connaissance des mécanismes de protection des infrastructures réseau.",
    level: 1,
    maxLevel: 5,
    progress: 0,
    lastUpdated: Date.now()
  },
  {
    id: "compliance",
    name: "Conformité réglementaire",
    category: SkillCategory.GOVERNANCE,
    description: "Connaissance des réglementations et normes de sécurité applicables.",
    level: 1,
    maxLevel: 5,
    progress: 0,
    lastUpdated: Date.now()
  },
  {
    id: "security-awareness",
    name: "Sensibilisation à la sécurité",
    category: SkillCategory.AWARENESS,
    description: "Capacité à sensibiliser les utilisateurs aux bonnes pratiques de sécurité.",
    level: 1,
    maxLevel: 5,
    progress: 0,
    lastUpdated: Date.now()
  },
  {
    id: "crisis-management",
    name: "Gestion de crise",
    category: SkillCategory.MANAGEMENT,
    description: "Capacité à gérer efficacement une crise de cybersécurité.",
    level: 1,
    maxLevel: 5,
    progress: 0,
    lastUpdated: Date.now()
  },
  {
    id: "vulnerability-management",
    name: "Gestion des vulnérabilités",
    category: SkillCategory.TECHNICAL,
    description: "Capacité à identifier, classer et corriger les vulnérabilités.",
    level: 1,
    maxLevel: 5,
    progress: 0,
    lastUpdated: Date.now()
  }
];

// Badges par défaut
export const DEFAULT_BADGES: Badge[] = [
  {
    id: "first-responder",
    name: "Premier intervenant",
    description: "Vous avez acquis les compétences essentielles pour être le premier à répondre efficacement aux incidents.",
    color: "blue",
    requiredSkills: [
      { skillId: "incident-response", minLevel: 2 },
      { skillId: "crisis-management", minLevel: 1 }
    ],
    unlocked: false
  },
  {
    id: "threat-hunter",
    name: "Chasseur de menaces",
    description: "Vous excellez dans l'identification et l'analyse des menaces cybernétiques avancées.",
    color: "red",
    requiredSkills: [
      { skillId: "threat-intelligence", minLevel: 3 },
      { skillId: "network-security", minLevel: 2 }
    ],
    unlocked: false
  },
  {
    id: "governance-expert",
    name: "Expert en gouvernance",
    description: "Vous maîtrisez les aspects de gouvernance et de conformité en cybersécurité.",
    color: "green",
    requiredSkills: [
      { skillId: "risk-assessment", minLevel: 3 },
      { skillId: "compliance", minLevel: 3 }
    ],
    unlocked: false
  },
  {
    id: "security-evangelist",
    name: "Évangéliste de la sécurité",
    description: "Vous excellez dans la sensibilisation et la communication sur les enjeux de cybersécurité.",
    color: "purple",
    requiredSkills: [
      { skillId: "security-awareness", minLevel: 3 }
    ],
    unlocked: false
  },
  {
    id: "technical-guardian",
    name: "Gardien technique",
    description: "Vous êtes le protecteur des infrastructures techniques contre les menaces cybernétiques.",
    color: "orange",
    requiredSkills: [
      { skillId: "network-security", minLevel: 3 },
      { skillId: "vulnerability-management", minLevel: 3 }
    ],
    unlocked: false
  }
];