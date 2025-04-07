// Types pour le jeu Firewall Defense

// Types d'attaques
export enum AttackType {
  DDOS = 'DDoS',
  MALWARE = 'Malware',
  RANSOMWARE = 'Ransomware',
  SQL_INJECTION = 'SQL Injection',
  XSS = 'Cross-Site Scripting',
  PHISHING = 'Phishing',
  MITM = 'Man-in-the-Middle'
}

// Types de défenses
export enum DefenseType {
  FIREWALL = 'Firewall',
  IDS = 'Intrusion Detection',
  ANTIVIRUS = 'Antivirus',
  WAF = 'Web Application Firewall',
  ENCRYPTION = 'Chiffrement',
  SECURITY_TEAM = 'Équipe de sécurité'
}

// Types de zones à protéger
export enum ZoneType {
  INTERNET_GATEWAY = 'Passerelle Internet',
  DMZ = 'DMZ',
  INTERNAL_NETWORK = 'Réseau Interne',
  DATABASE_ZONE = 'Zone Base de Données',
  CLOUD_SERVICES = 'Services Cloud'
}

// Interface pour une défense
export interface Defense {
  id: string;
  type: DefenseType;
  name: string;
  description: string;
  cost: number; // Coût financier
  manpower: number; // Ressources humaines nécessaires
  icon: React.ReactNode;
  color: string;
  effectiveness: {
    [key in AttackType]?: number; // Efficacité contre chaque type d'attaque (0-10)
  };
  usesLeft?: number; // Nombre d'utilisations restantes
}

// Interface pour une zone du réseau
export interface Zone {
  id: string;
  type: ZoneType;
  name: string;
  description: string;
  importance: number; // 1-10, impact sur le score si compromis
  icon: React.ReactNode;
  color: string;
  position: { x: number; y: number }; // Position sur la grille (coordonnées absolues pour le drag n drop)
  width: number; // Largeur de la zone
  height: number; // Hauteur de la zone
  defenses: string[]; // IDs des défenses placées dans cette zone
}

// Interface pour une attaque
export interface Attack {
  id: string;
  type: AttackType;
  name: string;
  description: string;
  targetZoneId: string;
  severity: number; // 1-10
  probability: number; // 1-10
  icon: React.ReactNode;
  color: string;
}

// Interface pour une simulation d'attaque
export interface AttackSimulation {
  wave: number;
  attacks: {
    id: string;
    type: AttackType;
    targetZoneId: string;
    blocked: boolean;
    blockingDefenseId?: string;
    progress: number; // Progression de l'attaque (0-100)
    position: { x: number, y: number }; // Position actuelle de l'attaque
    isActive: boolean; // Indique si l'attaque est en cours
  }[];
  results: {
    successfulAttacks: number;
    blockedAttacks: number;
    compromisedZones: string[];
    score: number;
  };
  feedback: string;
  level: number; // Niveau actuel
  maxLevel: number; // Nombre total de niveaux
}

// Interface pour les ressources du joueur
export interface PlayerResources {
  budget: number; // Ressources financières
  manpower: number; // Personnel disponible
}

// État du jeu
export interface GameState {
  phase: 'setup' | 'simulation' | 'results';
  level: number;
  maxLevel: number;
  showTutorial: boolean;
  tutorialStep: number;
  defenseInventory: Defense[];
  zones: Zone[];
  resources: PlayerResources;
  attackTypes: Attack[];
  simulationResults: AttackSimulation | null;
  score: number;
  simulationTimeLeft: number;
  activeAttacks: {
    id: string;
    type: AttackType;
    targetZoneId: string;
    progress: number;
    blocked: boolean;
    blockingDefenseId?: string;
    position: { x: number, y: number };
    isActive: boolean;
    icon: React.ReactNode;
    color: string;
  }[];
}

// Propriétés du jeu
export interface FirewallDefenseGameProps {
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  onGameEnd?: (score: number) => void;
}