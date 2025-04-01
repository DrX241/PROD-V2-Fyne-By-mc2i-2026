export interface Mission {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Expert';
  contactName: string;
  contactRole: string;
  contactAvatar: string;
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  domain: string;
  badgeId?: string;
}

export const MISSION_TYPES = {
  TECHNICAL: 'technical',
  ARCADE: 'arcade',
  CONVERSATION: 'conversation',
  EDUCATIONAL: 'educational'
};

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  difficulty: string;
  earnedDate?: Date;
}

// Exemples de badges pour la démonstration
export const BADGES = [
  {
    id: 'decoder',
    name: 'Décodeur',
    description: 'A réussi à déchiffrer des énigmes cryptographiques de base',
    icon: 'puzzle-piece',
    type: MISSION_TYPES.ARCADE,
    difficulty: 'Débutant'
  },
  {
    id: 'crypto-expert',
    name: 'Expert Cryptographique',
    description: 'Maîtrise les principes avancés de la cryptographie',
    icon: 'lock',
    type: MISSION_TYPES.ARCADE,
    difficulty: 'Intermédiaire'
  },
  {
    id: 'log-analyst',
    name: 'Analyste de Logs',
    description: 'Capable d\'identifier des indicateurs de compromission dans des logs',
    icon: 'file-text',
    type: MISSION_TYPES.TECHNICAL,
    difficulty: 'Débutant'
  },
  {
    id: 'firewall-guru',
    name: 'Maître Pare-feu',
    description: 'Expert en configuration de pare-feu et sécurité périmétrique',
    icon: 'shield',
    type: MISSION_TYPES.TECHNICAL,
    difficulty: 'Intermédiaire'
  },
  {
    id: 'crisis-manager',
    name: 'Gestionnaire de Crise',
    description: 'Compétent dans la gestion et la communication en situation de crise',
    icon: 'alert-triangle',
    type: MISSION_TYPES.CONVERSATION,
    difficulty: 'Expert'
  },
  {
    id: 'rgpd-certified',
    name: 'Certifié RGPD',
    description: 'Maîtrise les fondamentaux du Règlement Général sur la Protection des Données',
    icon: 'file-lock',
    type: MISSION_TYPES.EDUCATIONAL,
    difficulty: 'Débutant'
  },
  {
    id: 'threat-expert',
    name: 'Expert des Menaces',
    description: 'Connaît en profondeur le paysage des menaces cyber actuelles',
    icon: 'radar',
    type: MISSION_TYPES.EDUCATIONAL,
    difficulty: 'Intermédiaire'
  }
];