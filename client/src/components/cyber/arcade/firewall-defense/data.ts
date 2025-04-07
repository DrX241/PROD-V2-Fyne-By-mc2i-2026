import {
  Shield,
  Lock,
  KeyRound,
  Users,
  Eye,
  RefreshCw,
  BarChart4,
  Zap,
  Clock,
  FileText,
  Server,
  Bomb,
  CloudCog,
  Network,
  MonitorSmartphone,
  Fingerprint
} from 'lucide-react';
import { Defense, Level, Difficulty } from './types';
import React from 'react';

// Niveaux faciles (1-5)
export const easyLevels: Level[] = [
  {
    id: 1,
    name: "Protection basique",
    description: "Établissez une protection de base pour un ordinateur personnel.",
    targetTime: 60,
    maxScore: 100,
    defenses: [
      {
        id: "ef1",
        name: "Pare-feu personnel",
        description: "Bloque les connexions non autorisées",
        type: "firewall",
        icon: React.createElement(Shield, { className: "w-5 h-5" }),
        level: 1,
        correctPosition: 1,
        color: "#3b82f6",
        explanation: "Le pare-feu constitue la première ligne de défense en filtrant le trafic réseau entrant et sortant. Il bloque les tentatives de connexion non autorisées avant qu'elles n'atteignent les applications.",
        hint: "Cette défense devrait être placée en premier pour filtrer tout le trafic avant qu'il n'atteigne les autres couches. Le pare-feu est votre première ligne de défense."
      },
      {
        id: "ef2",
        name: "Antivirus",
        description: "Détecte et supprime les logiciels malveillants",
        type: "monitoring",
        icon: React.createElement(Eye, { className: "w-5 h-5" }),
        level: 1,
        correctPosition: 2,
        color: "#10b981",
        explanation: "L'antivirus analyse les fichiers et programmes après leur passage par le pare-feu pour détecter les logiciels malveillants qui auraient pu franchir la première barrière.",
        hint: "Cette défense devrait venir après le pare-feu mais avant les mises à jour. Elle intercepte les menaces qui ont réussi à passer la première ligne de défense."
      },
      {
        id: "ef3",
        name: "Mises à jour auto",
        description: "Maintient le système à jour",
        type: "update",
        icon: React.createElement(RefreshCw, { className: "w-5 h-5" }),
        level: 1,
        correctPosition: 3,
        color: "#f59e0b",
        explanation: "Les mises à jour automatiques maintiennent le système et les applications à jour, corrigeant les vulnérabilités connues pour empêcher leur exploitation par des attaquants.",
        hint: "Cette défense est la dernière ligne de protection qui assure que toutes les failles de sécurité connues sont corrigées après que les autres systèmes de protection aient fait leur travail."
      }
    ],
    connections: [
      { from: "ef1", to: "ef2", isRequired: true },
      { from: "ef2", to: "ef3", isRequired: true }
    ]
  },
  {
    id: 2,
    name: "Protection e-mail",
    description: "Sécurisez votre boîte e-mail contre les attaques et le spam.",
    targetTime: 70,
    maxScore: 150,
    defenses: [
      {
        id: "ef4",
        name: "Filtre anti-spam",
        description: "Bloque les e-mails indésirables",
        type: "firewall",
        icon: React.createElement(FileText, { className: "w-5 h-5" }),
        level: 1,
        correctPosition: 1,
        color: "#3b82f6"
      },
      {
        id: "ef5",
        name: "Authentification",
        description: "Vérifie l'identité des utilisateurs",
        type: "auth",
        icon: React.createElement(Users, { className: "w-5 h-5" }),
        level: 2,
        correctPosition: 2,
        color: "#8b5cf6"
      },
      {
        id: "ef6",
        name: "Analyse de contenu",
        description: "Vérifie les liens et pièces jointes",
        type: "monitoring",
        icon: React.createElement(Eye, { className: "w-5 h-5" }),
        level: 2,
        correctPosition: 3,
        color: "#10b981"
      },
      {
        id: "ef7",
        name: "Chiffrement",
        description: "Protège la confidentialité des messages",
        type: "encryption",
        icon: React.createElement(Lock, { className: "w-5 h-5" }),
        level: 2,
        correctPosition: 4,
        color: "#ec4899"
      }
    ],
    connections: [
      { from: "ef4", to: "ef5", isRequired: true },
      { from: "ef5", to: "ef6", isRequired: true },
      { from: "ef6", to: "ef7", isRequired: true }
    ]
  },
  {
    id: 3,
    name: "Sécurité domestique",
    description: "Protégez votre réseau domestique et vos appareils connectés.",
    targetTime: 80,
    maxScore: 200,
    defenses: [
      {
        id: "ef8",
        name: "Box sécurisée",
        description: "Contrôle l'accès au réseau",
        type: "firewall",
        icon: React.createElement(Network, { className: "w-5 h-5" }),
        level: 2,
        correctPosition: 1,
        color: "#3b82f6"
      },
      {
        id: "ef9",
        name: "Wifi protégé",
        description: "Chiffre les communications sans fil",
        type: "encryption",
        icon: React.createElement(Zap, { className: "w-5 h-5" }),
        level: 2,
        correctPosition: 2,
        color: "#ec4899"
      },
      {
        id: "ef10",
        name: "Contrôle parental",
        description: "Filtre les contenus inappropriés",
        type: "firewall",
        icon: React.createElement(Shield, { className: "w-5 h-5" }),
        level: 1,
        correctPosition: 3,
        color: "#3b82f6"
      },
      {
        id: "ef11",
        name: "Sauvegarde auto",
        description: "Protège contre la perte de données",
        type: "update",
        icon: React.createElement(RefreshCw, { className: "w-5 h-5" }),
        level: 2,
        correctPosition: 4,
        color: "#f59e0b"
      },
      {
        id: "ef12",
        name: "Antivirus réseau",
        description: "Protège tous les appareils connectés",
        type: "monitoring",
        icon: React.createElement(Eye, { className: "w-5 h-5" }),
        level: 2,
        correctPosition: 5,
        color: "#10b981"
      }
    ],
    connections: [
      { from: "ef8", to: "ef9", isRequired: true },
      { from: "ef9", to: "ef10", isRequired: false },
      { from: "ef9", to: "ef12", isRequired: true },
      { from: "ef10", to: "ef11", isRequired: false },
      { from: "ef12", to: "ef11", isRequired: true }
    ]
  },
  {
    id: 4,
    name: "Sécurité mobile",
    description: "Protégez vos appareils mobiles contre les menaces.",
    targetTime: 90,
    maxScore: 250,
    defenses: [
      {
        id: "ef13",
        name: "Verrouillage écran",
        description: "Empêche l'accès non autorisé",
        type: "auth",
        icon: React.createElement(Fingerprint, { className: "w-5 h-5" }),
        level: 1,
        correctPosition: 1,
        color: "#8b5cf6"
      },
      {
        id: "ef14",
        name: "App sécurité",
        description: "Surveille les menaces",
        type: "monitoring",
        icon: React.createElement(Shield, { className: "w-5 h-5" }),
        level: 2,
        correctPosition: 2,
        color: "#10b981"
      },
      {
        id: "ef15",
        name: "Store officiel",
        description: "Limite les apps malveillantes",
        type: "firewall",
        icon: React.createElement(MonitorSmartphone, { className: "w-5 h-5" }),
        level: 2,
        correctPosition: 3,
        color: "#3b82f6"
      },
      {
        id: "ef16",
        name: "VPN mobile",
        description: "Sécurise les connexions publiques",
        type: "encryption",
        icon: React.createElement(Lock, { className: "w-5 h-5" }),
        level: 3,
        correctPosition: 4,
        color: "#ec4899"
      },
      {
        id: "ef17",
        name: "Backup cloud",
        description: "Sauvegarde vos données",
        type: "update",
        icon: React.createElement(CloudCog, { className: "w-5 h-5" }),
        level: 2,
        correctPosition: 5,
        color: "#f59e0b"
      }
    ],
    connections: [
      { from: "ef13", to: "ef14", isRequired: true },
      { from: "ef14", to: "ef15", isRequired: true },
      { from: "ef15", to: "ef16", isRequired: true },
      { from: "ef16", to: "ef17", isRequired: true }
    ]
  },
  {
    id: 5,
    name: "Protection bancaire",
    description: "Sécurisez vos opérations bancaires en ligne.",
    targetTime: 100,
    maxScore: 300,
    defenses: [
      {
        id: "ef18",
        name: "Connexion sécurisée",
        description: "Vérifie l'authenticité du site",
        type: "encryption",
        icon: React.createElement(Lock, { className: "w-5 h-5" }),
        level: 2,
        correctPosition: 1,
        color: "#ec4899"
      },
      {
        id: "ef19",
        name: "Double authentification",
        description: "Ajoute une couche de sécurité",
        type: "auth",
        icon: React.createElement(KeyRound, { className: "w-5 h-5" }),
        level: 3,
        correctPosition: 2,
        color: "#8b5cf6"
      },
      {
        id: "ef20",
        name: "Détection de fraude",
        description: "Identifie les comportements suspects",
        type: "monitoring",
        icon: React.createElement(BarChart4, { className: "w-5 h-5" }),
        level: 3,
        correctPosition: 3,
        color: "#10b981"
      },
      {
        id: "ef21",
        name: "Vérification périodique",
        description: "Contrôle régulier des accès",
        type: "update",
        icon: React.createElement(Clock, { className: "w-5 h-5" }),
        level: 2,
        correctPosition: 4,
        color: "#f59e0b"
      },
      {
        id: "ef22",
        name: "Restriction IP",
        description: "Limite les pays d'origine",
        type: "firewall",
        icon: React.createElement(Shield, { className: "w-5 h-5" }),
        level: 3,
        correctPosition: 5,
        color: "#3b82f6"
      }
    ],
    connections: [
      { from: "ef18", to: "ef19", isRequired: true },
      { from: "ef19", to: "ef20", isRequired: true },
      { from: "ef20", to: "ef21", isRequired: false },
      { from: "ef20", to: "ef22", isRequired: true },
      { from: "ef21", to: "ef22", isRequired: false }
    ]
  }
];

// Niveaux moyens (6-10)
export const mediumLevels: Level[] = [
  {
    id: 6,
    name: "PME en ligne",
    description: "Protégez le site web et les données d'une petite entreprise.",
    targetTime: 110,
    maxScore: 350,
    defenses: [
      {
        id: "mf1",
        name: "WAF",
        description: "Pare-feu d'application web",
        type: "firewall",
        icon: React.createElement(Shield, { className: "w-5 h-5" }),
        level: 3,
        correctPosition: 1,
        color: "#3b82f6"
      },
      {
        id: "mf2",
        name: "SSL/TLS",
        description: "Chiffrement des communications",
        type: "encryption",
        icon: React.createElement(Lock, { className: "w-5 h-5" }),
        level: 3,
        correctPosition: 2,
        color: "#ec4899"
      },
      {
        id: "mf3",
        name: "CDN sécurisé",
        description: "Distribution de contenu protégée",
        type: "firewall",
        icon: React.createElement(Network, { className: "w-5 h-5" }),
        level: 3,
        correctPosition: 3,
        color: "#3b82f6"
      },
      {
        id: "mf4",
        name: "Monitoring 24/7",
        description: "Surveillance continue",
        type: "monitoring",
        icon: React.createElement(Eye, { className: "w-5 h-5" }),
        level: 3,
        correctPosition: 4,
        color: "#10b981"
      },
      {
        id: "mf5",
        name: "Backups quotidiens",
        description: "Sauvegarde des données critiques",
        type: "update",
        icon: React.createElement(RefreshCw, { className: "w-5 h-5" }),
        level: 3,
        correctPosition: 5,
        color: "#f59e0b"
      },
      {
        id: "mf6",
        name: "Anti-DDoS",
        description: "Protection contre les attaques par déni de service",
        type: "firewall",
        icon: React.createElement(Shield, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 6,
        color: "#3b82f6"
      }
    ],
    connections: [
      { from: "mf1", to: "mf2", isRequired: true },
      { from: "mf2", to: "mf3", isRequired: true },
      { from: "mf3", to: "mf4", isRequired: true },
      { from: "mf4", to: "mf5", isRequired: true },
      { from: "mf4", to: "mf6", isRequired: true },
      { from: "mf5", to: "mf6", isRequired: false }
    ]
  },
  // Niveaux 7 à 10 seront similaires, avec complexité croissante
];

// Niveaux difficiles (11-15)
export const hardLevels: Level[] = [
  {
    id: 11,
    name: "Infrastructure critique",
    description: "Protégez un réseau d'infrastructure nationale critique.",
    targetTime: 150,
    maxScore: 600,
    defenses: [
      {
        id: "hf1",
        name: "Pare-feu NextGen",
        description: "Filtrage avancé du trafic",
        type: "firewall",
        icon: React.createElement(Shield, { className: "w-5 h-5" }),
        level: 5,
        correctPosition: 1,
        color: "#3b82f6"
      },
      {
        id: "hf2",
        name: "Segmentation",
        description: "Isolation des réseaux critiques",
        type: "firewall",
        icon: React.createElement(Server, { className: "w-5 h-5" }),
        level: 5,
        correctPosition: 2,
        color: "#3b82f6"
      },
      {
        id: "hf3",
        name: "Authentication MFA",
        description: "Vérification multi-facteurs",
        type: "auth",
        icon: React.createElement(KeyRound, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 3,
        color: "#8b5cf6"
      },
      {
        id: "hf4",
        name: "VPN sécurisé",
        description: "Tunnel crypté pour les accès distants",
        type: "encryption",
        icon: React.createElement(Lock, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 4,
        color: "#ec4899"
      },
      {
        id: "hf5",
        name: "EDR avancé",
        description: "Détection et réponse aux menaces",
        type: "monitoring",
        icon: React.createElement(Eye, { className: "w-5 h-5" }),
        level: 5,
        correctPosition: 5,
        color: "#10b981"
      },
      {
        id: "hf6",
        name: "SIEM",
        description: "Corrélation des événements de sécurité",
        type: "monitoring",
        icon: React.createElement(BarChart4, { className: "w-5 h-5" }),
        level: 5,
        correctPosition: 6,
        color: "#10b981"
      },
      {
        id: "hf7",
        name: "Honeypot",
        description: "Piège pour attaquants",
        type: "monitoring",
        icon: React.createElement(Bomb, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 7,
        color: "#10b981"
      },
      {
        id: "hf8",
        name: "Plan de reprise",
        description: "Restauration après sinistre",
        type: "update",
        icon: React.createElement(RefreshCw, { className: "w-5 h-5" }),
        level: 5,
        correctPosition: 8,
        color: "#f59e0b"
      }
    ],
    connections: [
      { from: "hf1", to: "hf2", isRequired: true },
      { from: "hf2", to: "hf3", isRequired: true },
      { from: "hf3", to: "hf4", isRequired: true },
      { from: "hf4", to: "hf5", isRequired: true },
      { from: "hf5", to: "hf6", isRequired: true },
      { from: "hf5", to: "hf7", isRequired: false },
      { from: "hf6", to: "hf8", isRequired: true },
      { from: "hf7", to: "hf8", isRequired: false }
    ]
  },
  // Niveaux 12 à 15 seront similaires, avec complexité croissante
];

// Tutoriel
export const tutorialSteps = [
  {
    title: "Bienvenue au Puzzle de Défense en Profondeur",
    content: "Votre mission est de placer les défenses de cybersécurité dans le bon ordre pour créer une protection optimale. La défense en profondeur est une stratégie qui consiste à mettre en place plusieurs couches de sécurité."
  },
  {
    title: "Comprendre les défenses",
    content: "Chaque défense a un rôle spécifique. Certaines bloquent les attaques (pare-feu), d'autres détectent les intrusions (monitoring), ou vérifient les identités (authentification). Une configuration efficace combine ces différentes couches."
  },
  {
    title: "Placer les défenses",
    content: "Glissez les défenses disponibles dans les emplacements sur le réseau. L'ordre est crucial : certaines défenses doivent être placées avant d'autres pour être efficaces."
  },
  {
    title: "Vérifier votre configuration",
    content: "Une fois vos défenses placées, validez votre solution. Vous verrez si votre chaîne de défense est correcte et obtiendrez un score basé sur votre performance."
  },
  {
    title: "C'est parti !",
    content: "Commencez par un niveau simple et progressez vers des configurations plus complexes. Bonne chance, expert en cybersécurité !"
  }
];

// Fonction pour obtenir les niveaux en fonction de la difficulté
export function getLevelsByDifficulty(difficulty: Difficulty): Level[] {
  switch (difficulty) {
    case 'Facile':
      return easyLevels;
    case 'Moyen':
      return [...easyLevels.slice(0, 3), ...mediumLevels];
    case 'Difficile':
      return [...easyLevels.slice(0, 2), ...mediumLevels.slice(0, 3), ...hardLevels];
    default:
      return easyLevels;
  }
};