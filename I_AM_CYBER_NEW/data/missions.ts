import { Mission } from '../types';

/**
 * Liste des missions disponibles
 */
export const MISSIONS: Mission[] = [
  {
    id: 'intro-cyber-awareness',
    title: 'Introduction à la Sensibilisation Cyber',
    description: 'Découvrez les fondamentaux de la cybersécurité et apprenez à identifier les menaces courantes.',
    type: 'onboarding',
    difficulty: 'Débutant',
    domain: 'network-security',
    objectives: [
      {
        id: 'obj-1',
        description: 'Comprendre les concepts de base de la cybersécurité',
        validationMethod: 'chat',
        validationCriteria: 'L\'utilisateur doit démontrer sa compréhension des concepts de base lors de la conversation',
        completed: false
      },
      {
        id: 'obj-2',
        description: 'Identifier 3 types de menaces cybernétiques courantes',
        validationMethod: 'quiz',
        validationCriteria: 'L\'utilisateur doit identifier correctement les menaces dans le quiz',
        completed: false
      }
    ],
    primaryNPC: 'mentor-claire',
    supportNPCs: [],
    rewards: {
      points: 100,
      badges: ['cyber-initiate'],
      unlockedMissions: ['phishing-detection']
    },
    status: 'available'
  },
  {
    id: 'phishing-detection',
    title: 'Détection de Phishing',
    description: 'Apprenez à identifier et à vous protéger contre les tentatives de phishing.',
    type: 'awareness',
    difficulty: 'Débutant',
    domain: 'data-protection',
    objectives: [
      {
        id: 'obj-1',
        description: 'Comprendre les mécanismes du phishing',
        validationMethod: 'chat',
        validationCriteria: 'L\'utilisateur doit expliquer clairement les mécanismes du phishing',
        completed: false
      },
      {
        id: 'obj-2',
        description: 'Analyser 3 exemples d\'emails de phishing',
        validationMethod: 'quiz',
        validationCriteria: 'L\'utilisateur doit identifier les indicateurs de phishing dans les exemples',
        completed: false
      },
      {
        id: 'obj-3',
        description: 'Établir un protocole de signalement de phishing',
        validationMethod: 'chat',
        validationCriteria: 'L\'utilisateur doit proposer un protocole adéquat pour signaler les tentatives de phishing',
        completed: false
      }
    ],
    primaryNPC: 'mentor-claire',
    supportNPCs: [],
    rewards: {
      points: 150,
      badges: ['phishing-detector'],
      unlockedMissions: ['password-security']
    },
    status: 'locked'
  },
  {
    id: 'password-security',
    title: 'Sécurité des Mots de Passe',
    description: 'Apprenez les bonnes pratiques pour créer et gérer des mots de passe sécurisés.',
    type: 'awareness',
    difficulty: 'Débutant',
    domain: 'identity-access',
    objectives: [
      {
        id: 'obj-1',
        description: 'Comprendre les critères d\'un mot de passe fort',
        validationMethod: 'chat',
        validationCriteria: 'L\'utilisateur doit identifier les caractéristiques d\'un mot de passe sécurisé',
        completed: false
      },
      {
        id: 'obj-2',
        description: 'Configurer l\'authentification à deux facteurs',
        validationMethod: 'chat',
        validationCriteria: 'L\'utilisateur doit expliquer le processus de configuration de l\'authentification à deux facteurs',
        completed: false
      }
    ],
    primaryNPC: 'specialist-fatima',
    supportNPCs: ['mentor-claire'],
    rewards: {
      points: 150,
      badges: ['password-master'],
      unlockedMissions: ['network-basics']
    },
    status: 'locked'
  },
  {
    id: 'network-basics',
    title: 'Fondamentaux des Réseaux',
    description: 'Découvrez comment fonctionnent les réseaux informatiques et les principes de leur sécurisation.',
    type: 'technical',
    difficulty: 'Intermédiaire',
    domain: 'network-security',
    objectives: [
      {
        id: 'obj-1',
        description: 'Comprendre les principes de base des réseaux TCP/IP',
        validationMethod: 'quiz',
        validationCriteria: 'L\'utilisateur doit répondre correctement aux questions sur les protocoles réseau',
        completed: false
      },
      {
        id: 'obj-2',
        description: 'Analyser les vulnérabilités courantes des réseaux WiFi',
        validationMethod: 'chat',
        validationCriteria: 'L\'utilisateur doit identifier au moins 3 vulnérabilités courantes des réseaux WiFi',
        completed: false
      },
      {
        id: 'obj-3',
        description: 'Proposer des mesures de sécurisation d\'un réseau domestique',
        validationMethod: 'chat',
        validationCriteria: 'L\'utilisateur doit proposer au moins 5 mesures pertinentes',
        completed: false
      }
    ],
    primaryNPC: 'analyst-thomas',
    supportNPCs: ['mentor-claire'],
    rewards: {
      points: 200,
      badges: ['network-sentinel'],
      unlockedMissions: ['incident-response-basics']
    },
    status: 'locked'
  },
  {
    id: 'incident-response-basics',
    title: 'Fondamentaux de la Réponse aux Incidents',
    description: 'Apprenez à détecter, analyser et répondre à des incidents de sécurité.',
    type: 'simulation',
    difficulty: 'Intermédiaire',
    domain: 'threat-intelligence',
    objectives: [
      {
        id: 'obj-1',
        description: 'Comprendre les étapes du processus de réponse aux incidents',
        validationMethod: 'chat',
        validationCriteria: 'L\'utilisateur doit décrire correctement les étapes du processus',
        completed: false
      },
      {
        id: 'obj-2',
        description: 'Analyser un scénario d\'incident et identifier les indicateurs de compromission',
        validationMethod: 'quiz',
        validationCriteria: 'L\'utilisateur doit identifier correctement les IOCs dans le scénario',
        completed: false
      },
      {
        id: 'obj-3',
        description: 'Élaborer un plan de réponse pour un incident spécifique',
        validationMethod: 'chat',
        validationCriteria: 'L\'utilisateur doit proposer un plan de réponse structuré et pertinent',
        completed: false
      }
    ],
    primaryNPC: 'analyst-thomas',
    supportNPCs: ['mentor-claire', 'specialist-fatima'],
    rewards: {
      points: 250,
      badges: ['incident-responder'],
      unlockedMissions: []
    },
    status: 'locked'
  }
];

export const getMissionById = (id: string): Mission | undefined => {
  return MISSIONS.find(mission => mission.id === id);
};

export const getAvailableMissions = (): Mission[] => {
  return MISSIONS.filter(mission => mission.status === 'available');
};

export const getMissionsByDomain = (domainId: string): Mission[] => {
  return MISSIONS.filter(mission => mission.domain === domainId);
};