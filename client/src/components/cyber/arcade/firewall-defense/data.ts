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
  Fingerprint,
  Brain,
  CircuitBoard
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
        color: "#3b82f6",
        explanation: "Le WAF (Web Application Firewall) est spécialement conçu pour protéger les applications web en filtrant et surveillant le trafic HTTP. Il constitue la première ligne de défense contre les attaques web spécifiques.",
        hint: "Cette défense devrait être placée en première position car elle filtre le trafic malveillant avant qu'il n'atteigne les autres couches de l'application web."
      },
      {
        id: "mf2",
        name: "SSL/TLS",
        description: "Chiffrement des communications",
        type: "encryption",
        icon: React.createElement(Lock, { className: "w-5 h-5" }),
        level: 3,
        correctPosition: 2,
        color: "#ec4899",
        explanation: "Le protocole SSL/TLS assure le chiffrement des communications entre le client et le serveur, protégeant les données en transit contre l'espionnage et l'interception.",
        hint: "Après avoir filtré le trafic avec le WAF, il est important de chiffrer les communications légitimes pour protéger leur confidentialité."
      },
      {
        id: "mf3",
        name: "CDN sécurisé",
        description: "Distribution de contenu protégée",
        type: "firewall",
        icon: React.createElement(Network, { className: "w-5 h-5" }),
        level: 3,
        correctPosition: 3,
        color: "#3b82f6",
        explanation: "Un CDN sécurisé distribue le contenu à travers différents serveurs géographiquement dispersés tout en ajoutant des couches de protection contre les attaques DDoS et autres menaces.",
        hint: "Le CDN sécurisé devrait être mis en place après le chiffrement pour distribuer efficacement le contenu tout en maintenant un niveau de sécurité élevé."
      },
      {
        id: "mf4",
        name: "Monitoring 24/7",
        description: "Surveillance continue",
        type: "monitoring",
        icon: React.createElement(Eye, { className: "w-5 h-5" }),
        level: 3,
        correctPosition: 4,
        color: "#10b981",
        explanation: "Le monitoring 24/7 permet de détecter en temps réel les comportements anormaux et les tentatives d'intrusion pour réagir avant qu'une attaque ne réussisse.",
        hint: "Après avoir mis en place les défenses préventives, il est crucial de surveiller leur efficacité et de détecter les menaces qui pourraient passer à travers."
      },
      {
        id: "mf5",
        name: "Backups quotidiens",
        description: "Sauvegarde des données critiques",
        type: "update",
        icon: React.createElement(RefreshCw, { className: "w-5 h-5" }),
        level: 3,
        correctPosition: 5,
        color: "#f59e0b",
        explanation: "Les sauvegardes quotidiennes garantissent que les données critiques peuvent être restaurées en cas de corruption, suppression accidentelle ou attaque destructrice comme un ransomware.",
        hint: "Les sauvegardes constituent une mesure essentielle de résilience, à mettre en place après avoir sécurisé et surveillé l'infrastructure."
      },
      {
        id: "mf6",
        name: "Anti-DDoS",
        description: "Protection contre les attaques par déni de service",
        type: "firewall",
        icon: React.createElement(Shield, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 6,
        color: "#3b82f6",
        explanation: "Les solutions Anti-DDoS sont spécialisées dans l'absorption et la mitigation des attaques massives visant à saturer les ressources réseau et rendre le service indisponible.",
        hint: "Cette défense spécialisée contre les attaques volumétriques complète l'ensemble de la stratégie de protection, travaillant conjointement avec les autres mesures."
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
  {
    id: 7,
    name: "Système bancaire",
    description: "Sécurisez une plateforme de services bancaires en ligne contre les intrusions.",
    targetTime: 120,
    maxScore: 400,
    defenses: [
      {
        id: "mf7",
        name: "Pare-feu périmétrique",
        description: "Filtrage du trafic réseau entrant et sortant",
        type: "firewall",
        icon: React.createElement(Shield, { className: "w-5 h-5" }),
        level: 3,
        correctPosition: 1,
        color: "#3b82f6",
        explanation: "Le pare-feu périmétrique établit une barrière stricte entre l'internet public et le réseau bancaire interne, contrôlant rigoureusement tous les flux de trafic.",
        hint: "Cette défense doit être placée en premier pour filtrer tout le trafic au niveau réseau avant qu'il n'atteigne les systèmes internes."
      },
      {
        id: "mf8",
        name: "WAF bancaire",
        description: "Protection des applications web financières",
        type: "firewall",
        icon: React.createElement(Shield, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 2,
        color: "#3b82f6",
        explanation: "Le WAF spécialisé pour le secteur bancaire protège contre les attaques ciblant spécifiquement les portails financiers comme l'injection SQL ou les tentatives de fraude.",
        hint: "Après le filtrage réseau, une protection spécifique aux applications web bancaires est nécessaire pour contrer les attaques ciblées."
      },
      {
        id: "mf9",
        name: "Authentification multi-facteurs",
        description: "Vérification d'identité à plusieurs niveaux",
        type: "auth",
        icon: React.createElement(KeyRound, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 3,
        color: "#8b5cf6",
        explanation: "L'authentification multi-facteurs combine plusieurs méthodes de vérification (mot de passe, code SMS, empreinte biométrique) pour garantir l'identité des utilisateurs.",
        hint: "Une fois les premières barrières franchies, cette défense garantit que seuls les utilisateurs légitimes peuvent accéder à leurs comptes."
      },
      {
        id: "mf10",
        name: "Chiffrement bout-en-bout",
        description: "Protection intégrale des données sensibles",
        type: "encryption",
        icon: React.createElement(Lock, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 4,
        color: "#ec4899",
        explanation: "Le chiffrement bout-en-bout assure que les données bancaires sensibles restent cryptées tout au long de leur traitement, même lorsqu'elles sont manipulées par les systèmes internes.",
        hint: "Une fois l'authentification validée, cette défense protège les données financières tout au long de leur cycle de vie."
      },
      {
        id: "mf11",
        name: "SOC financier",
        description: "Centre opérationnel de sécurité spécialisé",
        type: "monitoring",
        icon: React.createElement(Eye, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 5,
        color: "#10b981",
        explanation: "Le SOC (Security Operations Center) financier combine technologies et expertise humaine pour surveiller en continu tous les événements de sécurité dans l'infrastructure bancaire.",
        hint: "Après avoir mis en place les protections techniques, une surveillance humaine experte est nécessaire pour détecter les menaces avancées."
      },
      {
        id: "mf12",
        name: "Système anti-fraude",
        description: "Détection des comportements suspects",
        type: "monitoring",
        icon: React.createElement(BarChart4, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 6,
        color: "#10b981",
        explanation: "Les systèmes anti-fraude utilisent l'analyse comportementale et l'intelligence artificielle pour détecter en temps réel les activités financières suspectes ou anormales.",
        hint: "Cette défense spécialisée travaille en complément du SOC pour identifier spécifiquement les tentatives de fraude financière."
      }
    ],
    connections: [
      { from: "mf7", to: "mf8", isRequired: true },
      { from: "mf8", to: "mf9", isRequired: true },
      { from: "mf9", to: "mf10", isRequired: true },
      { from: "mf10", to: "mf11", isRequired: true },
      { from: "mf11", to: "mf12", isRequired: true }
    ]
  },
  {
    id: 8,
    name: "Infrastructure cloud",
    description: "Sécurisez un environnement cloud multilocataire pour une entreprise.",
    targetTime: 120,
    maxScore: 450,
    defenses: [
      {
        id: "mf13",
        name: "IAM",
        description: "Gestion des identités et des accès",
        type: "auth",
        icon: React.createElement(Users, { className: "w-5 h-5" }),
        level: 3,
        correctPosition: 1,
        color: "#8b5cf6",
        explanation: "Le système IAM (Identity and Access Management) contrôle précisément qui peut accéder à quelles ressources cloud et avec quels privilèges, selon le principe du moindre privilège.",
        hint: "Cette défense doit être placée en premier car tous les accès aux ressources cloud passent par la vérification des identités et des permissions."
      },
      {
        id: "mf14",
        name: "Cloud WAF",
        description: "Protection des applications hébergées",
        type: "firewall",
        icon: React.createElement(Shield, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 2,
        color: "#3b82f6",
        explanation: "Le WAF cloud protège spécifiquement les applications hébergées dans le cloud contre les attaques ciblant la couche applicative, comme l'injection de code ou le cross-site scripting.",
        hint: "Après avoir contrôlé les accès légitimes, cette défense filtre les tentatives d'attaque contre les applications cloud exposées."
      },
      {
        id: "mf15",
        name: "Cloisonnement réseau",
        description: "Séparation des environnements clients",
        type: "firewall",
        icon: React.createElement(Server, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 3,
        color: "#3b82f6",
        explanation: "Le cloisonnement réseau dans le cloud garantit qu'un client ne peut jamais accéder aux données ou ressources d'un autre client, même en cas de compromission.",
        hint: "Cette défense isole les environnements clients après le filtrage des attaques, créant des barrières étanches entre différentes zones du cloud."
      },
      {
        id: "mf16",
        name: "CASB",
        description: "Sécurisation des services cloud",
        type: "monitoring",
        icon: React.createElement(CloudCog, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 4,
        color: "#10b981",
        explanation: "Le CASB (Cloud Access Security Broker) surveille et contrôle l'utilisation des services cloud, appliquant les politiques de sécurité et déclassant les risques.",
        hint: "Après la mise en place du cloisonnement, cette solution assure la visibilité et le contrôle sur tous les usages des services cloud."
      },
      {
        id: "mf17",
        name: "Chiffrement des données",
        description: "Protection des données au repos",
        type: "encryption",
        icon: React.createElement(Lock, { className: "w-5 h-5" }),
        level: 3,
        correctPosition: 5,
        color: "#ec4899",
        explanation: "Le chiffrement des données au repos garantit que toutes les informations stockées dans le cloud restent protégées même en cas d'accès physique non autorisé aux serveurs.",
        hint: "Même avec toutes les défenses précédentes, le chiffrement des données stockées reste essentiel pour protéger les informations au repos."
      },
      {
        id: "mf18",
        name: "CSPM",
        description: "Gestion de la posture de sécurité cloud",
        type: "monitoring",
        icon: React.createElement(RefreshCw, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 6,
        color: "#f59e0b",
        explanation: "Le CSPM (Cloud Security Posture Management) évalue en continu la configuration de l'infrastructure cloud pour détecter les mauvaises configurations et les écarts par rapport aux bonnes pratiques.",
        hint: "Cette défense complète l'ensemble en vérifiant continuellement que toutes les autres protections sont correctement configurées et conformes."
      }
    ],
    connections: [
      { from: "mf13", to: "mf14", isRequired: true },
      { from: "mf14", to: "mf15", isRequired: true },
      { from: "mf15", to: "mf16", isRequired: true },
      { from: "mf16", to: "mf17", isRequired: true },
      { from: "mf17", to: "mf18", isRequired: true }
    ]
  },
  {
    id: 9,
    name: "Télétravail sécurisé",
    description: "Protégez une infrastructure d'entreprise accessible à distance par les employés.",
    targetTime: 130,
    maxScore: 500,
    defenses: [
      {
        id: "mf19",
        name: "VPN d'entreprise",
        description: "Réseau privé virtuel sécurisé",
        type: "encryption",
        icon: React.createElement(Lock, { className: "w-5 h-5" }),
        level: 3,
        correctPosition: 1,
        color: "#ec4899",
        explanation: "Le VPN d'entreprise crée un tunnel chiffré pour les connexions distantes, protégeant les communications entre les employés en télétravail et le réseau de l'entreprise.",
        hint: "Cette défense doit être placée en premier car elle établit une connexion sécurisée avant tout accès aux ressources de l'entreprise."
      },
      {
        id: "mf20",
        name: "Zero Trust",
        description: "Vérification continue des accès",
        type: "auth",
        icon: React.createElement(KeyRound, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 2,
        color: "#8b5cf6",
        explanation: "L'architecture Zero Trust applique le principe 'never trust, always verify', exigeant une vérification constante des identités et des contextes d'accès, même à l'intérieur du réseau.",
        hint: "Après avoir établi la connexion VPN, cette défense vérifie rigoureusement chaque tentative d'accès, sans confiance implicite."
      },
      {
        id: "mf21",
        name: "EDR",
        description: "Détection et réponse sur les terminaux",
        type: "monitoring",
        icon: React.createElement(MonitorSmartphone, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 3,
        color: "#10b981",
        explanation: "L'EDR (Endpoint Detection and Response) surveille les comportements suspects sur les appareils des télétravailleurs pour détecter et neutraliser les menaces avancées.",
        hint: "Cette défense doit être installée sur les postes distants pour protéger contre les malwares qui contourneraient le VPN et le contrôle d'accès."
      },
      {
        id: "mf22",
        name: "DLP",
        description: "Prévention de fuite de données",
        type: "firewall",
        icon: React.createElement(Shield, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 4,
        color: "#3b82f6",
        explanation: "Le DLP (Data Loss Prevention) surveille et contrôle le transfert de données sensibles, empêchant leur exfiltration intentionnelle ou accidentelle hors de l'environnement sécurisé.",
        hint: "Après la sécurisation des accès et des appareils, cette défense empêche les fuites de données confidentielles par les canaux autorisés."
      },
      {
        id: "mf23",
        name: "Sensibilisation",
        description: "Formation continue des employés",
        type: "update",
        icon: React.createElement(Brain, { className: "w-5 h-5" }),
        level: 3,
        correctPosition: 5,
        color: "#f59e0b",
        explanation: "Les programmes de sensibilisation à la cybersécurité transforment les employés en première ligne de défense en leur apprenant à identifier et éviter les menaces comme le phishing.",
        hint: "Le facteur humain reste crucial : cette défense 'non technique' complète les protections techniques en réduisant les risques d'erreur humaine."
      },
      {
        id: "mf24",
        name: "Surveillance comportementale",
        description: "Détection des anomalies d'usage",
        type: "monitoring",
        icon: React.createElement(Eye, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 6,
        color: "#10b981",
        explanation: "L'analyse comportementale établit une référence des activités normales pour chaque utilisateur et détecte les déviations qui pourraient indiquer un compte compromis.",
        hint: "Cette défense complète l'ensemble en surveillant les comportements anormaux même après authentification correcte et accès légitime."
      }
    ],
    connections: [
      { from: "mf19", to: "mf20", isRequired: true },
      { from: "mf20", to: "mf21", isRequired: true },
      { from: "mf21", to: "mf22", isRequired: true },
      { from: "mf22", to: "mf23", isRequired: false },
      { from: "mf22", to: "mf24", isRequired: true },
      { from: "mf23", to: "mf24", isRequired: false }
    ]
  },
  {
    id: 10,
    name: "Plateforme IoT",
    description: "Sécurisez un écosystème d'objets connectés et leur infrastructure.",
    targetTime: 140,
    maxScore: 550,
    defenses: [
      {
        id: "mf25",
        name: "Segmentation IoT",
        description: "Isolation du réseau des objets connectés",
        type: "firewall",
        icon: React.createElement(Network, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 1,
        color: "#3b82f6",
        explanation: "La segmentation du réseau IoT isole complètement les objets connectés du reste de l'infrastructure informatique, limitant la propagation en cas de compromission.",
        hint: "Cette défense doit être placée en premier pour créer un périmètre de sécurité dédié aux objets connectés, souvent moins sécurisés."
      },
      {
        id: "mf26",
        name: "Gateway sécurisée",
        description: "Point d'entrée contrôlé pour les appareils",
        type: "firewall",
        icon: React.createElement(Server, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 2,
        color: "#3b82f6",
        explanation: "La gateway sécurisée sert d'intermédiaire entre les objets connectés et le reste du réseau, filtrant le trafic et appliquant des règles de sécurité strictes.",
        hint: "Après la segmentation réseau, cette passerelle contrôle rigoureusement tous les échanges entre les objets IoT et les autres systèmes."
      },
      {
        id: "mf27",
        name: "Authentification des appareils",
        description: "Vérification de l'identité des objets",
        type: "auth",
        icon: React.createElement(Fingerprint, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 3,
        color: "#8b5cf6",
        explanation: "L'authentification robuste des appareils IoT utilise des certificats uniques et des clés cryptographiques pour garantir que seuls les appareils légitimes peuvent se connecter.",
        hint: "Cette défense vérifie l'identité de chaque objet connecté avant d'autoriser sa communication avec le reste de l'écosystème IoT."
      },
      {
        id: "mf28",
        name: "Chiffrement embarqué",
        description: "Protection des données des capteurs",
        type: "encryption",
        icon: React.createElement(Lock, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 4,
        color: "#ec4899",
        explanation: "Le chiffrement embarqué protège les données dès leur collecte par les objets connectés, assurant leur confidentialité même si l'appareil ou le canal de transmission est compromis.",
        hint: "Après l'authentification des appareils, cette défense protège les données sensibles qu'ils collectent ou transmettent."
      },
      {
        id: "mf29",
        name: "Analyse de firmware",
        description: "Vérification des mises à jour d'appareils",
        type: "update",
        icon: React.createElement(CircuitBoard, { className: "w-5 h-5" }),
        level: 4,
        correctPosition: 5,
        color: "#f59e0b",
        explanation: "L'analyse automatique des firmware IoT vérifie l'authenticité et l'intégrité des mises à jour avant leur déploiement pour éviter l'installation de code malveillant.",
        hint: "Cette défense garantit que seules les mises à jour légitimes et sécurisées sont déployées sur les objets connectés."
      },
      {
        id: "mf30",
        name: "Détection d'anomalies IoT",
        description: "Surveillance des comportements anormaux",
        type: "monitoring",
        icon: React.createElement(BarChart4, { className: "w-5 h-5" }),
        level: 5,
        correctPosition: 6,
        color: "#10b981",
        explanation: "Les systèmes de détection d'anomalies spécialisés pour l'IoT apprennent les schémas normaux de communication et d'activité pour identifier les comportements suspects des appareils.",
        hint: "Cette défense finale surveille en permanence le comportement des objets connectés pour détecter les signes de compromission ou de dysfonctionnement."
      }
    ],
    connections: [
      { from: "mf25", to: "mf26", isRequired: true },
      { from: "mf26", to: "mf27", isRequired: true },
      { from: "mf27", to: "mf28", isRequired: true },
      { from: "mf28", to: "mf29", isRequired: true },
      { from: "mf29", to: "mf30", isRequired: true }
    ]
  }
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

// Fonction pour obtenir les niveaux de progression
export function getAllLevels(): Level[] {
  // Combinaison des 10 premiers niveaux de toutes les difficultés
  const allLevels = [
    ...easyLevels,               // Niveaux 1-5
    ...mediumLevels.slice(0, 5)  // Niveaux 6-10
  ];
  
  // S'assurer que nous avons exactement 10 niveaux
  return allLevels.slice(0, 10);
}

// Fonction pour obtenir les niveaux en fonction de la difficulté - gardée pour compatibilité
export function getLevelsByDifficulty(difficulty: Difficulty): Level[] {
  // Ignorer la difficulté et retourner tous les niveaux
  return getAllLevels();
};