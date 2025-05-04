import { 
  ImmersiveScenario,
  NPCCharacter,
  ScenarioPhase
} from '../../../shared/types/immersive-cyber';
import { v4 as uuidv4 } from 'uuid';

// Personnages simplifiés pour le jeu, keeping original characters where possible.
const securityAnalyst: NPCCharacter = {
  id: uuidv4(),
  name: "Sophie Lambert",
  role: "Analyste SOC Senior",
  avatar: "/assets/characters/security-analyst.jpg",
  expertise: ["Surveillance", "Détection", "Analyse des menaces"]
};

const ciso: NPCCharacter = {
  id: uuidv4(),
  name: "Thomas Mercier", //Using edited name
  role: "RSSI", //Using edited role
  avatar: "/assets/characters/ciso.jpg", //Using edited avatar
  expertise: ["Stratégie de sécurité", "Gestion des risques"]
};

const hrManager: NPCCharacter = {
  id: uuidv4(),
  name: "Isabelle Dubacq",
  role: "DRH",
  avatar: "/assets/characters/hr-manager.jpg",
  expertise: ["Communication interne", "Gestion du personnel"]
};

// Phase initiale avec choix immédiats
const initialPhase: ScenarioPhase = {
  id: uuidv4(),
  name: "Réponse immédiate",
  description: "ALERTE CRITIQUE: Une campagne de phishing massive vient d'être détectée. Plus de 50 employés ont déjà cliqué sur les liens malveillants. Les premiers rapports indiquent des tentatives de connexion suspectes aux systèmes critiques. En tant que responsable sécurité, quelle est votre première action ?",
  timeLimit: 300,
  decisions: [
    {
      id: uuidv4(),
      title: "Bloquer immédiatement",
      description: "Bloquer tous les accès externes et réinitialiser les mots de passe de tous les employés",
      consequences: {
        security: +3,
        business: -4,
        reputation: -2,
        narrative: "Vous avez stoppé l'attaque mais paralysé l'entreprise"
      }
    },
    {
      id: uuidv4(),
      title: "Analyser d'abord",
      description: "Lancer une analyse rapide des logs pendant que l'attaque se poursuit",
      consequences: {
        security: -2,
        business: 0,
        reputation: -1,
        narrative: "Vous gagnez en visibilité mais l'attaque progresse"
      }
    },
    {
      id: uuidv4(),
      title: "Communication d'urgence",
      description: "Alerter immédiatement tous les employés sur la menace",
      consequences: {
        security: +1,
        business: -1,
        reputation: +2,
        narrative: "Vous limitez les dégâts mais créez une panique"
      }
    }
  ]
};

// Scénario principal, adapted from original
export const phishingCampaignAdvanced: ImmersiveScenario = {
  id: 'phishing-campaign-advanced-001',
  title: "Crise de Phishing - Décisions Critiques",
  description: "Une attaque de phishing sophistiquée est en cours. Chaque décision compte.",
  difficulty: "Intermédiaire",
  sector: "RETAIL & LUXE",
  availableRoles: ["RSSI", "CrisisManager"], //Keeping original roles
  initialPhase: initialPhase,
  characters: [securityAnalyst, ciso, hrManager], //Keeping original characters where possible
  metrics: {
    security: {
      name: "Niveau de sécurité",
      initial: 5,
      min: 0,
      max: 10
    },
    business: {
      name: "Continuité d'activité",
      initial: 8,
      min: 0,
      max: 10
    },
    reputation: {
      name: "Réputation",
      initial: 7,
      min: 0,
      max: 10
    }
  },
  companyProfile: { //Keeping original company profile
    name: "ELITE RETAIL SECURITY",
    sector: "RETAIL & LUXE",
    size: "ETI",
    revenue: "250 millions €",
    employeeCount: 1200,
    locations: ["Paris (siège)", "Lyon", "Bordeaux", "Milan", "Bruxelles"],
    infrastructure: {
      cloudServices: ["Microsoft 365", "Azure", "Salesforce"],
      onPremSystems: ["SAP Retail", "Systèmes de caisses", "Entrepôt logistique"],
      criticalApplications: ["ERP Retail", "CRM", "Système d'inventaire", "Plateforme e-commerce"],
      securityTools: ["EDR", "SIEM", "Email Gateway", "MFA"],
      networkTopology: "Réseau hybride avec VPN pour les magasins distants et SD-WAN pour le siège",
      dataClassification: [
        {
          category: "Données clients",
          sensitivity: "Confidentiel",
          storageLocations: ["CRM", "Base de données marketing"],
          regimes: ["RGPD", "Loi Informatique et Libertés"]
        },
        {
          category: "Données financières",
          sensitivity: "Secret",
          storageLocations: ["ERP", "Finance Database"],
          regimes: ["PCI-DSS", "Normes comptables"]
        }
      ]
    },
    businessCriticalSystems: ["Système de caisse", "Site e-commerce", "Gestion des stocks", "Supply chain"],
    regulatoryObligations: ["RGPD", "PCI-DSS", "Loi Informatique et Libertés", "Droit du travail"],
    stakeholders: [
      {
        name: "Arnaud Gauthier",
        role: "Président",
        influence: 10,
        interests: ["Croissance", "Image de marque", "Innovation"],
        attitude: "Supportive"
      },
      {
        name: "Comité exécutif",
        role: "Direction",
        influence: 8,
        interests: ["Performance", "Gestion des risques"],
        attitude: "Neutral"
      },
      {
        name: "Employés en magasin",
        role: "Vendeurs et responsables",
        influence: 5,
        interests: ["Facilité d'utilisation", "Efficacité"],
        attitude: "Neutral"
      }
    ]
  },
  initialSituation: `
OBJET: [URGENT] Alerte de sécurité - Incident d'ingénierie sociale en cours

${new Date().toLocaleDateString('fr-FR')} - 09:47

Bonjour,

Je vous contacte en urgence suite à la détection d'une campagne d'ingénierie sociale sophistiquée ciblant actuellement ELITE RETAIL SECURITY. Notre SOC a identifié plusieurs tentatives d'accès non autorisés aux systèmes critiques dans les dernières heures.

SITUATION ACTUELLE:
- Plusieurs employés ont déjà interagi avec des emails malveillants
- Tentatives d'accès suspectes aux systèmes critiques
- Potentielle compromission des identifiants

Une analyse préliminaire de l'incident et les recommandations initiales sont disponibles. Vous devez impérativement identifier le mot de passe de sécurité pour accéder aux systèmes de réponse à incident.

ACTIONS REQUISES IMMÉDIATEMENT:
1. Identifier et communiquer le mot de passe desécurité
2. Préparer le plan de réponse initial

Nous comptons sur votre expertise pour gérer cette situation avec la plus grande attention.

Cordialement,
Sophie Lambert
Analyste SOC Senior
ELITE RETAIL SECURITY
`,
  timeframe: "Le scénario se déroule sur 3 heures simulées, avec des décisions critiques à prendre dans les premières 30 minutes.",
  assets: {
    documents: [],
    tools: [],
    simulatedSystems: []
  },
  learningObjectives: [
    "Comprendre les étapes clés de la gestion d'un incident de phishing",
    "Maîtriser l'équilibre entre sécurité et continuité d'activité",
    "Développer des compétences en communication de crise",
    "Apprendre à coordonner efficacement les différentes parties prenantes",
    "Mettre en place des mesures préventives pour éviter les incidents futurs"
  ]
};