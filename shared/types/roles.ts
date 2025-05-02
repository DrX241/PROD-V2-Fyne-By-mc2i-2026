// Types pour les rôles de cybersécurité

// Type énuméré pour les différents rôles de cybersécurité
export type CyberRole = 
  | 'analyste_securite'  // Analyste de sécurité
  | 'pentester'          // Pentester
  | 'responsable_securite' // RSSI / Responsable sécurité
  | 'expert_forensique'  // Expert en investigation numérique
  | 'ingenieur_reseau'   // Ingénieur réseau sécurité
  | 'analyste_soc';      // Analyste SOC

// Interface pour les informations de base d'un rôle
export interface CyberRoleInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Interface pour un module de formation lié à un rôle
export interface RoleModule {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  icon: string;
  duration: string;
  skills: string[];
  roleId: string;
}

// Interface pour une question de test d'accès
export interface RoleTestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// Interface pour un test d'accès complet
export interface RoleTest {
  id: string;
  roleId: string;
  moduleId: string;
  questions: RoleTestQuestion[];
  passingScore: number;
  timeLimit: number; // En secondes
  title: string;
}

// Interface pour un brief de mission
export interface MissionBrief {
  id: string;
  title: string;
  roleId: CyberRole;
  moduleId: string;
  organization: string;
  scenario: string;
  objectives: string[];
  constraints: string[];
  context: string;
  initialSituation: string;
  team?: {
    members: Array<{
      name: string;
      role: string;
      expertise?: string;
    }>
  };
}

// Interface pour les choix dans une étape de mission
export interface MissionChoice {
  id: string;
  text: string;
  type: 'technical' | 'managerial' | 'diplomatic' | 'escalation' | 'investigation';
  consequences?: {
    budget?: number; // Impact sur le budget (en %)
    reputation?: number; // Impact sur la réputation (en %)
    security?: number; // Impact sur le niveau de sécurité (en %)
    time?: number; // Impact sur le temps restant (en %)
  };
  isTerminal?: boolean; // Si true, termine la mission (succès ou échec complet)
  terminationReason?: string; // Raison de la terminaison (si applicable)
}

// Interface pour une étape de mission
export interface MissionStep {
  id?: string;
  situation: string;
  choices: MissionChoice[];
}

// Interface pour la conséquence d'un choix
export interface ChoiceConsequence {
  text: string;
  outcome: 'success' | 'partial' | 'failure' | 'termination';
  outcomeDescription: string;
  newSituation: string;
  learningPoints: string[];
}

// Interface pour l'historique des missions
export interface MissionHistory {
  id: string;
  userId: string;
  missionId: string;
  roleId: CyberRole;
  moduleId: string;
  completed: boolean;
  score?: number;
  startedAt: Date;
  completedAt?: Date;
  steps: Array<{
    stepId: string;
    choiceId: string;
    timestamp: Date;
    outcome: string;
  }>;
}