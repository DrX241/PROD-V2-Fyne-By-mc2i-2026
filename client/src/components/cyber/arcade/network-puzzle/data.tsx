import React from 'react';
import { 
  Server, 
  Laptop, 
  Shield, 
  Network, 
  LayoutGrid, 
  Database, 
  Cloud, 
  Globe 
} from 'lucide-react';
import { NetworkLevel, NetworkNode, NetworkConnection } from './types';

// Nodes pour le niveau 1 (Facile)
const level1Nodes: NetworkNode[] = [
  {
    id: 'internet',
    type: 'internet',
    name: 'Internet',
    description: 'Point d\'accès à internet',
    icon: React.createElement(Globe, { className: "w-6 h-6" }),
    position: { x: 100, y: 150 },
    securityLevel: 1
  },
  {
    id: 'firewall',
    type: 'firewall',
    name: 'Pare-feu',
    description: 'Protège contre les accès non autorisés',
    icon: React.createElement(Shield, { className: "w-6 h-6" }),
    position: { x: 250, y: 150 },
    securityLevel: 4,
    firewall: {
      allowedTraffic: ['HTTP', 'HTTPS'],
      blockedTraffic: ['TELNET', 'FTP'],
      isConfigured: false
    }
  },
  {
    id: 'webserver',
    type: 'server',
    name: 'Serveur Web',
    description: 'Héberge le site web de l\'entreprise',
    icon: React.createElement(Server, { className: "w-6 h-6" }),
    position: { x: 400, y: 100 },
    securityLevel: 3
  },
  {
    id: 'database',
    type: 'database',
    name: 'Base de données',
    description: 'Stocke les données client',
    icon: React.createElement(Database, { className: "w-6 h-6" }),
    position: { x: 400, y: 200 },
    securityLevel: 5
  },
  {
    id: 'client',
    type: 'client',
    name: 'Poste client',
    description: 'Ordinateur d\'un employé',
    icon: React.createElement(Laptop, { className: "w-6 h-6" }),
    position: { x: 550, y: 150 },
    securityLevel: 2
  }
];

// Niveau 1 (Facile)
export const level1: NetworkLevel = {
  id: 1,
  name: 'Infrastructure Web Basique',
  description: 'Créez une infrastructure web sécurisée de base avec un pare-feu, un serveur web et une base de données. Assurez-vous que le trafic passe par le pare-feu.',
  hints: [
    'Le pare-feu doit être placé entre Internet et vos serveurs',
    'La base de données ne doit pas être directement accessible depuis Internet',
    'Configurez le pare-feu pour autoriser uniquement le trafic HTTP/HTTPS'
  ],
  constraints: [
    'Tout trafic depuis Internet doit passer par le pare-feu',
    'La base de données ne doit être accessible que depuis le serveur web',
    'Le client interne doit pouvoir accéder au serveur web'
  ],
  maxScore: 100,
  nodes: level1Nodes,
  connections: [],
  requiredConnections: [
    ['internet', 'firewall'],
    ['firewall', 'webserver'],
    ['webserver', 'database'],
    ['client', 'webserver']
  ],
  forbiddenConnections: [
    ['internet', 'webserver'],
    ['internet', 'database'],
    ['firewall', 'client'],
    ['internet', 'client'],
    ['client', 'database']
  ],
  securityRules: [
    'Le pare-feu doit être configuré pour autoriser uniquement HTTP/HTTPS',
    'Protégez la base de données contre les accès directs'
  ]
};

// Nodes pour le niveau 2 (Moyen)
const level2Nodes: NetworkNode[] = [
  {
    id: 'internet',
    type: 'internet',
    name: 'Internet',
    description: 'Point d\'accès à internet',
    icon: React.createElement(Globe, { className: "w-6 h-6" }),
    position: { x: 100, y: 200 },
    securityLevel: 1
  },
  {
    id: 'firewall1',
    type: 'firewall',
    name: 'Pare-feu externe',
    description: 'Protège la DMZ contre les accès externes',
    icon: React.createElement(Shield, { className: "w-6 h-6" }),
    position: { x: 200, y: 200 },
    securityLevel: 4,
    firewall: {
      allowedTraffic: ['HTTP', 'HTTPS'],
      blockedTraffic: ['TELNET', 'SSH', 'FTP'],
      isConfigured: false
    }
  },
  {
    id: 'router',
    type: 'router',
    name: 'Routeur principal',
    description: 'Dirige le trafic réseau entre zones',
    icon: React.createElement(Network, { className: "w-6 h-6" }),
    position: { x: 300, y: 200 },
    securityLevel: 3
  },
  {
    id: 'webserver',
    type: 'server',
    name: 'Serveur Web (DMZ)',
    description: 'Serveur web dans la zone démilitarisée',
    icon: React.createElement(Server, { className: "w-6 h-6" }),
    position: { x: 300, y: 100 },
    securityLevel: 3
  },
  {
    id: 'firewall2',
    type: 'firewall',
    name: 'Pare-feu interne',
    description: 'Protège le réseau interne',
    icon: React.createElement(Shield, { className: "w-6 h-6" }),
    position: { x: 400, y: 200 },
    securityLevel: 5,
    firewall: {
      allowedTraffic: ['HTTPS', 'SQL'],
      blockedTraffic: ['HTTP', 'TELNET', 'FTP'],
      isConfigured: false
    }
  },
  {
    id: 'database',
    type: 'database',
    name: 'Base de données',
    description: 'Stocke les données confidentielles',
    icon: React.createElement(Database, { className: "w-6 h-6" }),
    position: { x: 500, y: 300 },
    securityLevel: 5
  },
  {
    id: 'internalserver',
    type: 'server',
    name: 'Serveur interne',
    description: 'Serveur applicatif interne',
    icon: React.createElement(Server, { className: "w-6 h-6" }),
    position: { x: 500, y: 200 },
    securityLevel: 4
  },
  {
    id: 'switch',
    type: 'switch',
    name: 'Switch réseau',
    description: 'Connecte les postes clients',
    icon: React.createElement(LayoutGrid, { className: "w-6 h-6" }),
    position: { x: 500, y: 100 },
    securityLevel: 2
  },
  {
    id: 'client1',
    type: 'client',
    name: 'Poste client 1',
    description: 'Poste de travail interne',
    icon: React.createElement(Laptop, { className: "w-6 h-6" }),
    position: { x: 600, y: 80 },
    securityLevel: 2
  },
  {
    id: 'client2',
    type: 'client',
    name: 'Poste client 2',
    description: 'Poste de travail interne',
    icon: React.createElement(Laptop, { className: "w-6 h-6" }),
    position: { x: 600, y: 120 },
    securityLevel: 2
  }
];

// Niveau 2 (Moyen)
export const level2: NetworkLevel = {
  id: 2,
  name: 'Architecture avec DMZ',
  description: 'Établissez une architecture réseau avec une zone démilitarisée (DMZ) pour les serveurs web et un réseau interne protégé pour les données sensibles.',
  hints: [
    'Utilisez deux pare-feu: un entre Internet et la DMZ, et un autre entre la DMZ et le réseau interne',
    'Assurez-vous que le serveur web dans la DMZ n\'a pas d\'accès direct à la base de données',
    'Le trafic depuis les clients internes vers Internet doit passer par les deux pare-feu'
  ],
  constraints: [
    'La DMZ doit être protégée par un pare-feu externe',
    'Le réseau interne doit être protégé par un pare-feu interne',
    'Les postes clients ne doivent pas avoir d\'accès direct au serveur web',
    'La base de données doit être accessible uniquement depuis le serveur interne'
  ],
  maxScore: 200,
  nodes: level2Nodes,
  connections: [],
  requiredConnections: [
    ['internet', 'firewall1'],
    ['firewall1', 'router'],
    ['router', 'webserver'],
    ['router', 'firewall2'],
    ['firewall2', 'internalserver'],
    ['firewall2', 'switch'],
    ['switch', 'client1'],
    ['switch', 'client2'],
    ['internalserver', 'database']
  ],
  forbiddenConnections: [
    ['internet', 'webserver'],
    ['internet', 'router'],
    ['webserver', 'database'],
    ['webserver', 'internalserver'],
    ['webserver', 'switch'],
    ['client1', 'database'],
    ['client2', 'database']
  ],
  securityRules: [
    'Le pare-feu externe doit bloquer tout sauf HTTP/HTTPS',
    'Le pare-feu interne doit autoriser uniquement HTTPS et SQL',
    'Tout trafic vers la base de données doit passer par le serveur interne'
  ]
};

// Nodes pour le niveau 3 (Difficile)
const level3Nodes: NetworkNode[] = [
  {
    id: 'internet',
    type: 'internet',
    name: 'Internet',
    description: 'Accès public à internet',
    icon: React.createElement(Globe, { className: "w-6 h-6" }),
    position: { x: 100, y: 200 },
    securityLevel: 1
  },
  {
    id: 'firewall1',
    type: 'firewall',
    name: 'Pare-feu périmétrique',
    description: 'Première ligne de défense',
    icon: React.createElement(Shield, { className: "w-6 h-6" }),
    position: { x: 180, y: 200 },
    securityLevel: 5,
    firewall: {
      allowedTraffic: ['HTTP', 'HTTPS', 'VPN'],
      blockedTraffic: ['TELNET', 'FTP', 'SSH'],
      isConfigured: false
    }
  },
  {
    id: 'loadbalancer',
    type: 'router',
    name: 'Équilibreur de charge',
    description: 'Distribue les requêtes entrantes',
    icon: React.createElement(Network, { className: "w-6 h-6" }),
    position: { x: 260, y: 200 },
    securityLevel: 3
  },
  {
    id: 'webserver1',
    type: 'server',
    name: 'Serveur Web 1',
    description: 'Serveur d\'application web',
    icon: React.createElement(Server, { className: "w-6 h-6" }),
    position: { x: 340, y: 150 },
    securityLevel: 4
  },
  {
    id: 'webserver2',
    type: 'server',
    name: 'Serveur Web 2',
    description: 'Serveur d\'application web redondant',
    icon: React.createElement(Server, { className: "w-6 h-6" }),
    position: { x: 340, y: 250 },
    securityLevel: 4
  },
  {
    id: 'firewall2',
    type: 'firewall',
    name: 'Pare-feu applicatif',
    description: 'Protège les serveurs d\'applications',
    icon: React.createElement(Shield, { className: "w-6 h-6" }),
    position: { x: 420, y: 200 },
    securityLevel: 5,
    firewall: {
      allowedTraffic: ['HTTPS', 'SQL', 'API'],
      blockedTraffic: ['HTTP', 'ADMIN', 'TELNET'],
      isConfigured: false
    }
  },
  {
    id: 'appserver1',
    type: 'server',
    name: 'Serveur d\'application 1',
    description: 'Traite la logique métier',
    icon: React.createElement(Server, { className: "w-6 h-6" }),
    position: { x: 500, y: 150 },
    securityLevel: 4
  },
  {
    id: 'appserver2',
    type: 'server',
    name: 'Serveur d\'application 2',
    description: 'Traite la logique métier (redondant)',
    icon: React.createElement(Server, { className: "w-6 h-6" }),
    position: { x: 500, y: 250 },
    securityLevel: 4
  },
  {
    id: 'firewall3',
    type: 'firewall',
    name: 'Pare-feu base de données',
    description: 'Protège l\'accès aux données',
    icon: React.createElement(Shield, { className: "w-6 h-6" }),
    position: { x: 580, y: 200 },
    securityLevel: 5,
    firewall: {
      allowedTraffic: ['SQL', 'BACKUP'],
      blockedTraffic: ['HTTP', 'HTTPS', 'ADMIN', 'SSH'],
      isConfigured: false
    }
  },
  {
    id: 'dbserver1',
    type: 'database',
    name: 'Base de données principale',
    description: 'Stocke les données de production',
    icon: React.createElement(Database, { className: "w-6 h-6" }),
    position: { x: 660, y: 150 },
    securityLevel: 5
  },
  {
    id: 'dbserver2',
    type: 'database',
    name: 'Base de données réplique',
    description: 'Réplique de la base principale',
    icon: React.createElement(Database, { className: "w-6 h-6" }),
    position: { x: 660, y: 250 },
    securityLevel: 5
  },
  {
    id: 'vpngateway',
    type: 'firewall',
    name: 'Passerelle VPN',
    description: 'Accès distant sécurisé',
    icon: React.createElement(Shield, { className: "w-6 h-6" }),
    position: { x: 180, y: 300 },
    securityLevel: 4,
    firewall: {
      allowedTraffic: ['VPN', 'HTTPS'],
      blockedTraffic: ['HTTP', 'TELNET', 'FTP'],
      isConfigured: false
    }
  },
  {
    id: 'adminserver',
    type: 'server',
    name: 'Serveur d\'administration',
    description: 'Gestion de l\'infrastructure',
    icon: React.createElement(Server, { className: "w-6 h-6" }),
    position: { x: 260, y: 300 },
    securityLevel: 5
  },
  {
    id: 'backupcloud',
    type: 'cloud',
    name: 'Sauvegarde Cloud',
    description: 'Stockage de sauvegardes externe',
    icon: React.createElement(Cloud, { className: "w-6 h-6" }),
    position: { x: 660, y: 350 },
    securityLevel: 4
  }
];

// Niveau 3 (Difficile)
export const level3: NetworkLevel = {
  id: 3,
  name: 'Architecture d\'entreprise haute disponibilité',
  description: 'Concevez une infrastructure d\'entreprise hautement disponible et sécurisée avec redondance des serveurs, séparation des couches et sécurisation multicouche.',
  hints: [
    'Implémentez la défense en profondeur avec des pare-feu à chaque couche',
    'Utilisez l\'équilibreur de charge pour distribuer le trafic entre les serveurs web redondants',
    'Assurez la protection des bases de données avec un pare-feu dédié',
    'Configurez correctement la passerelle VPN pour l\'administration sécurisée',
    'Les sauvegardes cloud doivent être accessibles de manière sécurisée'
  ],
  constraints: [
    'Au moins 3 niveaux de pare-feu différents',
    'Redondance des serveurs web et d\'application',
    'Réplication des bases de données',
    'Accès administratif uniquement via VPN',
    'Connexion sécurisée au stockage cloud'
  ],
  maxScore: 300,
  nodes: level3Nodes,
  connections: [],
  requiredConnections: [
    ['internet', 'firewall1'],
    ['firewall1', 'loadbalancer'],
    ['loadbalancer', 'webserver1'],
    ['loadbalancer', 'webserver2'],
    ['webserver1', 'firewall2'],
    ['webserver2', 'firewall2'],
    ['firewall2', 'appserver1'],
    ['firewall2', 'appserver2'],
    ['appserver1', 'firewall3'],
    ['appserver2', 'firewall3'],
    ['firewall3', 'dbserver1'],
    ['firewall3', 'dbserver2'],
    ['dbserver1', 'dbserver2'], // Réplication
    ['internet', 'vpngateway'],
    ['vpngateway', 'adminserver'],
    ['adminserver', 'firewall1'],
    ['adminserver', 'firewall2'],
    ['adminserver', 'firewall3'],
    ['dbserver1', 'backupcloud'],
    ['dbserver2', 'backupcloud']
  ],
  forbiddenConnections: [
    ['internet', 'loadbalancer'],
    ['internet', 'webserver1'],
    ['internet', 'webserver2'],
    ['internet', 'adminserver'],
    ['firewall1', 'appserver1'],
    ['firewall1', 'appserver2'],
    ['firewall1', 'dbserver1'],
    ['firewall1', 'dbserver2'],
    ['loadbalancer', 'appserver1'],
    ['loadbalancer', 'appserver2'],
    ['loadbalancer', 'dbserver1'],
    ['loadbalancer', 'dbserver2'],
    ['webserver1', 'dbserver1'],
    ['webserver1', 'dbserver2'],
    ['webserver2', 'dbserver1'],
    ['webserver2', 'dbserver2'],
    ['appserver1', 'backupcloud'],
    ['appserver2', 'backupcloud']
  ],
  securityRules: [
    'Tous les pare-feu doivent être correctement configurés',
    'Le trafic HTTP doit être bloqué après l\'équilibreur de charge',
    'Seul le trafic SQL est autorisé vers les bases de données',
    'L\'accès administratif requiert une authentification VPN',
    'Les sauvegardes cloud doivent être chiffrées'
  ]
};

// Tous les niveaux
export const allLevels: NetworkLevel[] = [
  level1,
  level2,
  level3
];

// Fonction pour obtenir tous les niveaux
export function getLevels(): NetworkLevel[] {
  return allLevels;
}

// Fonction pour obtenir un niveau par id
export function getLevelById(id: number): NetworkLevel | undefined {
  return allLevels.find(level => level.id === id);
}