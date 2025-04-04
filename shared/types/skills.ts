// Types pour le système de compétences
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  level: number; // 0-100
  icon: string;
  color: string;
}

export type SkillCategory = 
  | 'technical' // Compétences techniques
  | 'organizational' // Compétences organisationnelles
  | 'communication' // Compétences de communication
  | 'analytical' // Compétences analytiques
  | 'leadership'; // Compétences de leadership

export interface BadgeAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  backgroundColor: string;
  acquiredAt: string; // ISO Date string
  skillCategory?: SkillCategory; // Optionnel: catégorie de compétence associée
}

export interface SkillProgress {
  skillId: string;
  progress: number; // 0-100
  lastUpdated: string; // ISO Date string
}

export interface UserSkillsProfile {
  userId: string;
  skills: Skill[];
  badges: BadgeAchievement[];
  progressHistory: SkillProgress[];
  totalScenarios: number;
  completedScenarios: number;
}

// Fonctions utilitaires pour le système de compétences
export function calculateLevel(progress: number): number {
  // Transforme un progrès 0-100 en un niveau 1-5
  if (progress < 20) return 1;
  if (progress < 40) return 2;
  if (progress < 60) return 3;
  if (progress < 80) return 4;
  return 5;
}

export function getSkillLevelLabel(level: number): string {
  switch (level) {
    case 1: return "Débutant";
    case 2: return "Novice";
    case 3: return "Intermédiaire";
    case 4: return "Avancé";
    case 5: return "Expert";
    default: return "Non évalué";
  }
}

export function getColorForSkillLevel(level: number): string {
  switch (level) {
    case 1: return "bg-green-100 text-green-800 border-green-300";
    case 2: return "bg-blue-100 text-blue-800 border-blue-300";
    case 3: return "bg-purple-100 text-purple-800 border-purple-300";
    case 4: return "bg-amber-100 text-amber-800 border-amber-300";
    case 5: return "bg-red-100 text-red-800 border-red-300";
    default: return "bg-gray-100 text-gray-800 border-gray-300";
  }
}

// Compétences initiales pour chaque domaine
export const defaultSkills: Skill[] = [
  // Compétences techniques
  {
    id: "malware-analysis",
    name: "Analyse de malware",
    description: "Capacité à analyser et comprendre le comportement des logiciels malveillants",
    category: "technical",
    level: 0,
    icon: "ri-bug-line",
    color: "text-red-600"
  },
  {
    id: "threat-hunting",
    name: "Recherche de menaces",
    description: "Capacité à identifier et traquer les menaces potentielles dans les systèmes",
    category: "technical",
    level: 0,
    icon: "ri-search-eye-line",
    color: "text-blue-600"
  },
  {
    id: "forensics",
    name: "Investigation numérique",
    description: "Capacité à collecter et analyser des preuves numériques",
    category: "technical",
    level: 0,
    icon: "ri-fingerprint-line",
    color: "text-purple-600"
  },
  
  // Compétences organisationnelles
  {
    id: "incident-management",
    name: "Gestion d'incidents",
    description: "Capacité à coordonner et gérer efficacement les incidents de sécurité",
    category: "organizational",
    level: 0,
    icon: "ri-alarm-warning-line",
    color: "text-orange-600"
  },
  {
    id: "crisis-communication",
    name: "Communication de crise",
    description: "Capacité à communiquer efficacement pendant une crise",
    category: "communication",
    level: 0,
    icon: "ri-megaphone-line",
    color: "text-amber-600"
  },
  {
    id: "stakeholder-management",
    name: "Gestion des parties prenantes",
    description: "Capacité à impliquer et gérer les différentes parties prenantes",
    category: "leadership",
    level: 0,
    icon: "ri-team-line",
    color: "text-indigo-600"
  },
  
  // Compétences analytiques
  {
    id: "risk-assessment",
    name: "Évaluation des risques",
    description: "Capacité à identifier, évaluer et prioriser les risques de sécurité",
    category: "analytical",
    level: 0,
    icon: "ri-scales-line",
    color: "text-emerald-600"
  },
  {
    id: "decision-making",
    name: "Prise de décision",
    description: "Capacité à prendre des décisions efficaces sous pression",
    category: "leadership",
    level: 0,
    icon: "ri-git-branch-line",
    color: "text-cyan-600"
  }
];

// Badges par défaut disponibles
export const defaultBadges: Omit<BadgeAchievement, 'acquiredAt'>[] = [
  {
    id: "first-mission",
    name: "Première mission",
    description: "Vous avez complété votre premier scénario",
    icon: "ri-rocket-line",
    iconColor: "text-blue-600",
    backgroundColor: "bg-blue-100"
  },
  {
    id: "quick-responder",
    name: "Réponse rapide",
    description: "Vous avez réagi efficacement à un incident en moins de 5 minutes",
    icon: "ri-time-line",
    iconColor: "text-emerald-600",
    backgroundColor: "bg-emerald-100" 
  },
  {
    id: "master-communicator",
    name: "Maître communicateur",
    description: "Vous excellez dans la communication de crise",
    icon: "ri-message-3-line",
    iconColor: "text-amber-600",
    backgroundColor: "bg-amber-100",
    skillCategory: "communication"
  },
  {
    id: "technical-expert",
    name: "Expert technique",
    description: "Vous avez démontré une expertise technique exceptionnelle",
    icon: "ri-code-box-line",
    iconColor: "text-purple-600",
    backgroundColor: "bg-purple-100",
    skillCategory: "technical"
  },
  {
    id: "analytical-mind",
    name: "Esprit analytique",
    description: "Vous avez fait preuve d'excellentes capacités d'analyse",
    icon: "ri-brain-line",
    iconColor: "text-indigo-600",
    backgroundColor: "bg-indigo-100",
    skillCategory: "analytical"
  },
  {
    id: "crisis-leader",
    name: "Leader de crise",
    description: "Vous avez dirigé efficacement pendant une situation de crise",
    icon: "ri-shield-star-line",
    iconColor: "text-red-600",
    backgroundColor: "bg-red-100",
    skillCategory: "leadership"
  }
];

// Fonction pour créer un profil de compétences utilisateur initial
export function createInitialUserSkillsProfile(userId: string): UserSkillsProfile {
  return {
    userId,
    skills: [...defaultSkills], // Copie des compétences par défaut
    badges: [],
    progressHistory: [],
    totalScenarios: 0,
    completedScenarios: 0
  };
}