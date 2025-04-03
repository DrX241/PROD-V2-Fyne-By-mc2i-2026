/**
 * Types pour le système I AM AMOA (Assistance à la Maîtrise d'Ouvrage)
 */

// Phases d'un projet
export type AmoaPhase = 
  | 'initialisation' 
  | 'recueil_besoins' 
  | 'analyse' 
  | 'conception' 
  | 'developpement' 
  | 'tests' 
  | 'deploiement';

// Type de personnalité d'une partie prenante
export type PersonalityType = 'analytique' | 'directif' | 'expressif' | 'aimable';

// Niveau de disponibilité d'une partie prenante
export type AvailabilityLevel = 'basse' | 'moyenne' | 'haute';

// Une partie prenante du projet
export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  department: string;
  personality: PersonalityType;
  priorities: string[];
  expertise: string[];
  availabilityLevel: AvailabilityLevel;
  avatar?: string;
}

// Un document lié au projet
export interface AmoaDocument {
  id: string;
  title: string;
  author: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  content: string;
  lastModified: string;
  comments?: {
    id: string;
    author: string;
    date: string;
    text: string;
  }[];
}

// Un objectif du projet
export interface AmoaObjective {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'functional' | 'technical' | 'business' | 'project';
}

// Une compétence d'AMOA à développer
export interface AmoaSkill {
  id: string;
  name: string;
  description: string;
  level: number; // 0-100
  category: string;
}

// Un événement d'apprentissage
export interface AmoaLearningEvent {
  id: string;
  timestamp: string;
  description: string;
  skillId: string;
  gainedPoints: number;
}

// Option de décision
export interface DecisionOption {
  id: string;
  text: string;
  consequences?: string;
}

// Décision à prendre
export interface AmoaDecision {
  id: string;
  title: string;
  description: string;
  context: string;
  phase: AmoaPhase;
  options: DecisionOption[];
  selectedOption?: string;
  madeAt?: string;
  evaluation?: string;
}

// Message dans la conversation
export interface AmoaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  sender?: string;
  senderRole?: string;
}

// Scénario AMOA complet
export interface AmoaScenario {
  id: string;
  title: string;
  description: string;
  context: string;
  complexity: 'débutant' | 'intermédiaire' | 'avancé';
  domain: string;
  objectives: AmoaObjective[];
  stakeholders: Stakeholder[];
  documents: AmoaDocument[];
  decisions?: AmoaDecision[];
  learningEvents?: AmoaLearningEvent[];
  skillsProgress?: AmoaSkill[];
  currentPhase: AmoaPhase;
  progress?: number;
  completed?: boolean;
  completedAt?: string;
}