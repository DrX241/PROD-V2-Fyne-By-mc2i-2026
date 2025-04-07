import React from 'react';
import { 
  ShieldCheck, Zap, Wifi, Database, Server, Bug, Divide, Skull, 
  HardDrive, Network, Cloud, Lock, Users, MonitorSmartphone
} from 'lucide-react';
import { 
  DefenseType, 
  ZoneType, 
  AttackType, 
  Defense, 
  Zone, 
  Attack, 
  PlayerResources 
} from './types';

// Fonction pour générer les défenses disponibles
export const generateDefenses = (): Defense[] => [
  {
    id: 'defense-firewall',
    type: DefenseType.FIREWALL,
    name: 'Firewall de nouvelle génération',
    description: 'Protège contre les attaques réseau et filtre le trafic.',
    cost: 200,
    manpower: 5,
    icon: <ShieldCheck className="h-8 w-8 text-white" />,
    color: '#2196f3',
    effectiveness: {
      [AttackType.DDOS]: 7,
      [AttackType.MITM]: 6,
      [AttackType.PHISHING]: 2,
      [AttackType.XSS]: 3
    },
    usesLeft: 3
  },
  {
    id: 'defense-ids',
    type: DefenseType.IDS,
    name: 'Système de détection d\'intrusion',
    description: 'Détecte les comportements suspects et les tentatives d\'intrusion.',
    cost: 250,
    manpower: 8,
    icon: <Wifi className="h-8 w-8 text-white" />,
    color: '#9c27b0',
    effectiveness: {
      [AttackType.MALWARE]: 8,
      [AttackType.MITM]: 7,
      [AttackType.SQL_INJECTION]: 5,
      [AttackType.XSS]: 5
    },
    usesLeft: 3
  },
  {
    id: 'defense-antivirus',
    type: DefenseType.ANTIVIRUS,
    name: 'Solution antivirus avancée',
    description: 'Protège contre les logiciels malveillants et les virus.',
    cost: 150,
    manpower: 3,
    icon: <Bug className="h-8 w-8 text-white" />,
    color: '#4caf50',
    effectiveness: {
      [AttackType.MALWARE]: 9,
      [AttackType.RANSOMWARE]: 7,
      [AttackType.PHISHING]: 4
    },
    usesLeft: 3
  },
  {
    id: 'defense-waf',
    type: DefenseType.WAF,
    name: 'Pare-feu d\'application Web',
    description: 'Filtre et surveille le trafic HTTP/HTTPS.',
    cost: 300,
    manpower: 6,
    icon: <Server className="h-8 w-8 text-white" />,
    color: '#f44336',
    effectiveness: {
      [AttackType.SQL_INJECTION]: 8,
      [AttackType.XSS]: 9,
      [AttackType.DDOS]: 5
    },
    usesLeft: 3
  },
  {
    id: 'defense-encryption',
    type: DefenseType.ENCRYPTION,
    name: 'Chiffrement de données',
    description: 'Sécurise les données sensibles en les rendant illisibles.',
    cost: 180,
    manpower: 4,
    icon: <Lock className="h-8 w-8 text-white" />,
    color: '#3f51b5',
    effectiveness: {
      [AttackType.MITM]: 8,
      [AttackType.RANSOMWARE]: 6,
      [AttackType.SQL_INJECTION]: 3
    },
    usesLeft: 3
  },
  {
    id: 'defense-team',
    type: DefenseType.SECURITY_TEAM,
    name: 'Équipe de réponse aux incidents',
    description: 'Équipe dédiée à la surveillance et la réponse aux incidents de sécurité.',
    cost: 350,
    manpower: 10,
    icon: <Users className="h-8 w-8 text-white" />,
    color: '#ff9800',
    effectiveness: {
      [AttackType.PHISHING]: 7,
      [AttackType.RANSOMWARE]: 8,
      [AttackType.MALWARE]: 6,
      [AttackType.DDOS]: 4,
      [AttackType.SQL_INJECTION]: 4,
      [AttackType.XSS]: 4,
      [AttackType.MITM]: 5
    },
    usesLeft: 3
  }
];

// Fonction pour générer les zones
export const generateZones = (): Zone[] => [
  {
    id: 'zone-internet',
    type: ZoneType.INTERNET_GATEWAY,
    name: 'Passerelle Internet',
    description: 'Point d\'entrée depuis l\'Internet public.',
    importance: 7,
    icon: <Network className="h-8 w-8 text-white" />,
    color: '#ff9800',
    position: { x: 50, y: 80 },
    width: 200,
    height: 130,
    defenses: []
  },
  {
    id: 'zone-dmz',
    type: ZoneType.DMZ,
    name: 'DMZ',
    description: 'Zone démilitarisée pour les services exposés.',
    importance: 8,
    icon: <Server className="h-8 w-8 text-white" />,
    color: '#2196f3',
    position: { x: 300, y: 200 },
    width: 200,
    height: 130,
    defenses: []
  },
  {
    id: 'zone-internal',
    type: ZoneType.INTERNAL_NETWORK,
    name: 'Réseau Interne',
    description: 'Réseau d\'entreprise pour les employés.',
    importance: 9,
    icon: <MonitorSmartphone className="h-8 w-8 text-white" />,
    color: '#4caf50',
    position: { x: 550, y: 80 },
    width: 200,
    height: 130,
    defenses: []
  },
  {
    id: 'zone-database',
    type: ZoneType.DATABASE_ZONE,
    name: 'Zone Base de Données',
    description: 'Stockage des données critiques de l\'entreprise.',
    importance: 10,
    icon: <Database className="h-8 w-8 text-white" />,
    color: '#e91e63',
    position: { x: 300, y: 380 },
    width: 200,
    height: 130,
    defenses: []
  },
  {
    id: 'zone-cloud',
    type: ZoneType.CLOUD_SERVICES,
    name: 'Services Cloud',
    description: 'Services hébergés dans le cloud.',
    importance: 8,
    icon: <Cloud className="h-8 w-8 text-white" />,
    color: '#9c27b0',
    position: { x: 550, y: 380 },
    width: 200,
    height: 130,
    defenses: []
  }
];

// Fonction pour générer les attaques selon la difficulté
export const generateAttacks = (difficulty: 'Facile' | 'Moyen' | 'Difficile'): Attack[] => {
  const attacks: Attack[] = [
    {
      id: 'attack-ddos',
      type: AttackType.DDOS,
      name: 'Attaque DDoS',
      description: 'Attaque par déni de service distribué visant à saturer les ressources réseau.',
      targetZoneId: 'zone-internet',
      severity: 7,
      probability: difficulty === 'Facile' ? 5 : (difficulty === 'Moyen' ? 7 : 9),
      icon: <Zap className="h-6 w-6" />,
      color: '#ff5252'
    },
    {
      id: 'attack-sql',
      type: AttackType.SQL_INJECTION,
      name: 'Injection SQL',
      description: 'Tentative d\'exploitation des vulnérabilités de base de données.',
      targetZoneId: 'zone-database',
      severity: 8,
      probability: difficulty === 'Facile' ? 4 : (difficulty === 'Moyen' ? 6 : 8),
      icon: <Database className="h-6 w-6" />,
      color: '#2196f3'
    },
    {
      id: 'attack-malware',
      type: AttackType.MALWARE,
      name: 'Malware',
      description: 'Logiciel malveillant visant à compromettre les systèmes.',
      targetZoneId: 'zone-internal',
      severity: 6,
      probability: difficulty === 'Facile' ? 6 : (difficulty === 'Moyen' ? 7 : 8),
      icon: <Bug className="h-6 w-6" />,
      color: '#7c4dff'
    },
    {
      id: 'attack-phishing',
      type: AttackType.PHISHING,
      name: 'Phishing',
      description: 'Tentative d\'obtention d\'informations sensibles par usurpation d\'identité.',
      targetZoneId: 'zone-internal',
      severity: 5,
      probability: difficulty === 'Facile' ? 7 : (difficulty === 'Moyen' ? 8 : 9),
      icon: <MonitorSmartphone className="h-6 w-6" />,
      color: '#4caf50'
    }
  ];
  
  // Ajouter des attaques plus complexes pour les difficultés moyennes et difficiles
  if (difficulty !== 'Facile') {
    attacks.push(
      {
        id: 'attack-xss',
        type: AttackType.XSS,
        name: 'Cross-Site Scripting',
        description: 'Injection de scripts malveillants dans les applications web.',
        targetZoneId: 'zone-dmz',
        severity: 6,
        probability: difficulty === 'Moyen' ? 6 : 8,
        icon: <Divide className="h-6 w-6" />,
        color: '#ff9800'
      },
      {
        id: 'attack-mitm',
        type: AttackType.MITM,
        name: 'Man-in-the-Middle',
        description: 'Interception de communications entre deux parties.',
        targetZoneId: 'zone-internet',
        severity: 7,
        probability: difficulty === 'Moyen' ? 5 : 7,
        icon: <Network className="h-6 w-6" />,
        color: '#ffeb3b'
      }
    );
  }
  
  // Ajouter ransomware pour la difficulté difficile
  if (difficulty === 'Difficile') {
    attacks.push({
      id: 'attack-ransomware',
      type: AttackType.RANSOMWARE,
      name: 'Ransomware',
      description: 'Logiciel malveillant qui chiffre les données et exige une rançon.',
      targetZoneId: 'zone-database',
      severity: 9,
      probability: 8,
      icon: <Skull className="h-6 w-6" />,
      color: '#d50000'
    });
    
    // En difficulté difficile, ajout d'une attaque cloud
    attacks.push({
      id: 'attack-cloud',
      type: AttackType.MALWARE,
      name: 'Compromission Cloud',
      description: 'Attaque ciblant spécifiquement les infrastructures cloud.',
      targetZoneId: 'zone-cloud',
      severity: 8,
      probability: 7,
      icon: <Cloud className="h-6 w-6" />,
      color: '#9c27b0'
    });
  }
  
  return attacks;
};

// Fonction pour générer les ressources initiales du joueur selon la difficulté
export const generateInitialResources = (difficulty: 'Facile' | 'Moyen' | 'Difficile'): PlayerResources => ({
  budget: difficulty === 'Facile' ? 1000 : (difficulty === 'Moyen' ? 800 : 600),
  manpower: difficulty === 'Facile' ? 30 : (difficulty === 'Moyen' ? 25 : 20)
});

// Étapes du tutoriel
export const tutorialSteps = [
  {
    title: "Bienvenue dans Firewall Defense",
    content: "Dans ce jeu, vous devez protéger votre infrastructure réseau contre diverses cyberattaques. Vous êtes le responsable de la sécurité informatique d'une entreprise."
  },
  {
    title: "Votre Infrastructure",
    content: "Votre réseau est divisé en zones : Passerelle Internet, DMZ, Réseau Interne, Zone Base de Données et Services Cloud. Chaque zone a une importance stratégique différente."
  },
  {
    title: "Les Défenses",
    content: "Vous disposez de défenses comme des firewalls, antivirus et systèmes de détection d'intrusion. Placez-les stratégiquement dans vos zones en les faisant glisser."
  },
  {
    title: "Vos Ressources",
    content: "Vous avez un budget et du personnel limités. Chaque défense coûte des ressources, alors choisissez judicieusement ce que vous déployez et où."
  },
  {
    title: "Les Attaques",
    content: "Différentes attaques cibleront vos zones. Selon les défenses que vous aurez placées, ces attaques seront bloquées ou réussiront."
  },
  {
    title: "Efficacité des Défenses",
    content: "Chaque défense a une efficacité variable contre différents types d'attaques. Par exemple, un firewall est efficace contre les DDoS mais moins contre le phishing."
  },
  {
    title: "Simulation",
    content: "Une fois votre configuration prête, lancez la simulation pour voir comment vos défenses résistent aux attaques. Prêt à relever le défi?"
  }
];