import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { apiRequest } from "@/lib/queryClient";
import type {
  ChatContextType,
  ChatMessage,
  CyberDomain,
  CyberScenario,
  AIConfig,
  ScenarioState,
  EmailMessageContent,
  ScenarioContact,
  CrisisDecisionContent,
  CrisisDecisionOption
} from "@shared/types/cyber";
import { USER_ROLES } from "@shared/types/cyber";

/**
 * Fonction utilitaire pour extraire le prénom d'un texte contenant potentiellement 
 * des formules d'introduction comme "Je suis", "Je m'appelle", "Mon nom est", etc.
 */
const extractFirstName = (input: string): string => {
  if (!input) return "";
  
  // Étape 1: Nettoyer l'entrée
  let cleanedInput = input.trim().toLowerCase();
  
  // Étape 2: Liste étendue des patterns d'introduction à supprimer
  const introPatterns = [
    /(je\s+suis)/gi,
    /(je\s+m['']\s*appelle)/gi,
    /(mon\s+nom\s+est)/gi,
    /(mon\s+prénom\s+est)/gi,
    /(je\s+me\s+prénomme)/gi,
    /(je\s+me\s+nomme)/gi,
    /(je\s+me\s+présente)/gi,
    /(c'est)/gi,
    /(moi\s+c'est)/gi
  ];
  
  // Étape 3: Supprimer toutes les formules d'introduction
  for (const pattern of introPatterns) {
    cleanedInput = cleanedInput.replace(pattern, '');
  }
  
  // Étape 4: Supprimer les caractères de ponctuation et espaces excessifs
  cleanedInput = cleanedInput.replace(/[,.;:!?]/g, '').trim();
  
  // Étape 5: Extraire le premier mot (prénom)
  const firstWord = cleanedInput.split(/\s+/)[0];
  
  // Étape 6: Mettre la première lettre en majuscule et le reste en minuscules 
  // pour assurer que peu importe comment l'utilisateur a écrit son prénom
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
};

// Initial domains data
const initialDomains: CyberDomain[] = [
  // Domaines pour le rôle RSSI
  {
    id: "gestion-crise",
    name: "Gestion de crise cyber",
    description: "Préparation et réponse aux incidents de sécurité majeurs",
    icon: "ri-alarm-warning-line",
    iconBgColor: "bg-[#006a9e]/10",
    iconColor: "text-[#006a9e]",
    applicableRoles: ["rssi", "consultant"]
  },
  {
    id: "supply-chain",
    name: "Sécurité de la chaîne d'approvisionnement",
    description: "Protection contre les risques liés aux fournisseurs et partenaires",
    icon: "ri-link-m",
    iconBgColor: "bg-orange-100",
    iconColor: "text-orange-600",
    applicableRoles: ["rssi", "consultant"]
  },
  {
    id: "strategie-cyber",
    name: "Stratégie et gouvernance cybersécurité",
    description: "Élaboration et mise en œuvre d'une stratégie de défense numérique",
    icon: "ri-road-map-line",
    iconBgColor: "bg-pink-100",
    iconColor: "text-pink-600",
    applicableRoles: ["rssi", "consultant"]
  },
  {
    id: "gouvernance-risques",
    name: "Gouvernance et gestion des risques",
    description: "Évaluation et priorisation des risques de sécurité",
    icon: "ri-scales-3-line",
    iconBgColor: "bg-indigo-100",
    iconColor: "text-indigo-600",
    applicableRoles: ["rssi"]
  },
  {
    id: "conformite-reglementaire",
    name: "Conformité réglementaire",
    description: "Respect des normes et réglementations en cybersécurité",
    icon: "ri-file-list-3-line",
    iconBgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    applicableRoles: ["rssi"]
  },
  {
    id: "securite-cloud",
    name: "Sécurité du cloud",
    description: "Protection des environnements et données dans le cloud",
    icon: "ri-cloud-line",
    iconBgColor: "bg-cyan-100",
    iconColor: "text-cyan-600",
    applicableRoles: ["rssi"]
  },
  
  // Domaines pour le rôle Hacker éthique
  {
    id: "pentest-externe",
    name: "Tests d'intrusion externe",
    description: "Évaluation de la sécurité périmétrique et des accès externes",
    icon: "ri-door-lock-line",
    iconBgColor: "bg-red-100",
    iconColor: "text-red-600",
    applicableRoles: ["hacker"]
  },
  {
    id: "pentest-applicatif",
    name: "Tests d'intrusion applicatif",
    description: "Identification des vulnérabilités dans les applications web",
    icon: "ri-bug-line",
    iconBgColor: "bg-yellow-100",
    iconColor: "text-yellow-600",
    applicableRoles: ["hacker", "developpeur"]
  },
  {
    id: "red-team",
    name: "Red Team",
    description: "Simulation d'attaques avancées et persistantes",
    icon: "ri-sword-line",
    iconBgColor: "bg-red-100",
    iconColor: "text-red-600",
    applicableRoles: ["hacker"]
  },
  {
    id: "reverse-engineering",
    name: "Rétro-ingénierie et analyse de malware",
    description: "Analyse de code malveillant et de binaires",
    icon: "ri-file-code-line",
    iconBgColor: "bg-purple-100",
    iconColor: "text-purple-600",
    applicableRoles: ["hacker"]
  },
  {
    id: "ingenierie-sociale",
    name: "Ingénierie sociale et phishing",
    description: "Détection et prévention des tentatives de manipulation humaine",
    icon: "ri-user-voice-line",
    iconBgColor: "bg-amber-100",
    iconColor: "text-amber-600",
    applicableRoles: ["hacker", "analyste"]
  },
  {
    id: "securite-iot",
    name: "Sécurité des objets connectés",
    description: "Évaluation des risques liés à l'Internet des Objets",
    icon: "ri-device-line",
    iconBgColor: "bg-green-100",
    iconColor: "text-green-600",
    applicableRoles: ["hacker"]
  },
  
  // Domaines pour le rôle Développeur
  {
    id: "devops-securise",
    name: "DevSecOps",
    description: "Intégration de la sécurité dans le développement continu",
    icon: "ri-recycle-line",
    iconBgColor: "bg-teal-100",
    iconColor: "text-teal-600",
    applicableRoles: ["developpeur"]
  },
  {
    id: "securite-code",
    name: "Sécurité du code",
    description: "Pratiques de développement sécurisé et analyse statique",
    icon: "ri-code-s-slash-line",
    iconBgColor: "bg-indigo-100",
    iconColor: "text-indigo-600",
    applicableRoles: ["developpeur"]
  },
  {
    id: "securite-api",
    name: "Sécurité des API",
    description: "Protection des interfaces de programmation",
    icon: "ri-brackets-line",
    iconBgColor: "bg-violet-100",
    iconColor: "text-violet-600",
    applicableRoles: ["developpeur"]
  },
  {
    id: "donnees-personnelles",
    name: "Protection des données personnelles",
    description: "Mise en œuvre de la protection des données dans le code",
    icon: "ri-profile-line",
    iconBgColor: "bg-lime-100",
    iconColor: "text-lime-600",
    applicableRoles: ["developpeur", "admin"]
  },
  {
    id: "crypto-securite",
    name: "Cryptographie appliquée",
    description: "Mise en œuvre de solutions cryptographiques",
    icon: "ri-lock-line",
    iconBgColor: "bg-emerald-100",
    iconColor: "text-emerald-600",
    applicableRoles: ["developpeur"]
  },
  {
    id: "auth-securisee",
    name: "Authentification et autorisation",
    description: "Mise en place de systèmes d'identification robustes",
    icon: "ri-shield-keyhole-line",
    iconBgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    applicableRoles: ["developpeur", "admin"]
  },
  
  // Domaines pour le rôle Administrateur Système
  {
    id: "securite-infra",
    name: "Sécurité de l'infrastructure",
    description: "Sécurisation des serveurs, réseaux et environnements techniques",
    icon: "ri-server-line",
    iconBgColor: "bg-gray-100",
    iconColor: "text-gray-600",
    applicableRoles: ["admin"]
  },
  {
    id: "gestion-vulnerabilites",
    name: "Gestion des vulnérabilités",
    description: "Identification et correction des failles de sécurité",
    icon: "ri-error-warning-line",
    iconBgColor: "bg-orange-100",
    iconColor: "text-orange-600",
    applicableRoles: ["admin", "analyste"]
  },
  {
    id: "gestion-incidents",
    name: "Gestion des incidents de sécurité",
    description: "Détection, analyse et résolution des incidents de sécurité",
    icon: "ri-service-line",
    iconBgColor: "bg-emerald-100",
    iconColor: "text-emerald-600",
    applicableRoles: ["admin", "analyste"]
  },
  {
    id: "securite-endpoints",
    name: "Sécurité des postes de travail",
    description: "Protection des terminaux utilisateurs contre les menaces",
    icon: "ri-computer-line",
    iconBgColor: "bg-indigo-100",
    iconColor: "text-indigo-600",
    applicableRoles: ["admin"]
  },
  {
    id: "securite-reseau",
    name: "Sécurité réseau",
    description: "Protection des flux de données et segmentation de sécurité",
    icon: "ri-wifi-line",
    iconBgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    applicableRoles: ["admin"]
  },
  {
    id: "gestion-identites",
    name: "Gestion des identités et des accès",
    description: "Contrôle des droits d'accès et authentification",
    icon: "ri-user-settings-line",
    iconBgColor: "bg-purple-100",
    iconColor: "text-purple-600",
    applicableRoles: ["admin"]
  },
  
  // Domaines pour le rôle Consultant cybersécurité
  {
    id: "audit-securite",
    name: "Audit de sécurité",
    description: "Évaluation globale de la posture de sécurité",
    icon: "ri-search-line",
    iconBgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    applicableRoles: ["consultant"]
  },
  {
    id: "conseil-strategie",
    name: "Conseil en stratégie cybersécurité",
    description: "Accompagnement dans l'élaboration de la stratégie de sécurité",
    icon: "ri-compass-3-line",
    iconBgColor: "bg-indigo-100",
    iconColor: "text-indigo-600",
    applicableRoles: ["consultant"]
  },
  {
    id: "conformite-rgpd",
    name: "Conformité RGPD",
    description: "Mise en conformité aux exigences de protection des données",
    icon: "ri-shield-check-line",
    iconBgColor: "bg-green-100",
    iconColor: "text-green-600",
    applicableRoles: ["consultant"]
  },
  {
    id: "gestion-tiers",
    name: "Gestion des risques liés aux tiers",
    description: "Évaluation et gestion de la sécurité des prestataires",
    icon: "ri-team-line",
    iconBgColor: "bg-amber-100",
    iconColor: "text-amber-600",
    applicableRoles: ["consultant"]
  },
  {
    id: "mise-en-conformite",
    name: "Mise en conformité sectorielles",
    description: "Adaptation aux normes spécifiques (finance, santé, industrie)",
    icon: "ri-bookmark-line",
    iconBgColor: "bg-purple-100",
    iconColor: "text-purple-600",
    applicableRoles: ["consultant"]
  },
  {
    id: "analyse-risques",
    name: "Analyse des risques cyber",
    description: "Évaluation méthodique des risques de sécurité",
    icon: "ri-bubble-chart-line",
    iconBgColor: "bg-red-100",
    iconColor: "text-red-600",
    applicableRoles: ["consultant"]
  },
  
  // Domaines pour le rôle Analyste SOC
  {
    id: "detection-menaces",
    name: "Détection des menaces avancées",
    description: "Identification des comportements suspects et anomalies",
    icon: "ri-radar-line",
    iconBgColor: "bg-red-100",
    iconColor: "text-red-600",
    applicableRoles: ["analyste"]
  },
  {
    id: "cyber-threat-intelligence",
    name: "Cyber Threat Intelligence",
    description: "Analyse des acteurs malveillants et de leurs techniques",
    icon: "ri-spy-line",
    iconBgColor: "bg-orange-100",
    iconColor: "text-orange-600",
    applicableRoles: ["analyste"]
  },
  {
    id: "analyse-forensique",
    name: "Analyse forensique",
    description: "Investigation numérique post-incident",
    icon: "ri-criminal-line",
    iconBgColor: "bg-violet-100",
    iconColor: "text-violet-600",
    applicableRoles: ["analyste"]
  },
  {
    id: "monitoring-securite",
    name: "Monitoring de sécurité",
    description: "Surveillance continue des systèmes d'information",
    icon: "ri-sensor-line",
    iconBgColor: "bg-cyan-100",
    iconColor: "text-cyan-600",
    applicableRoles: ["analyste"]
  },
  {
    id: "hunting-menaces",
    name: "Hunting de menaces",
    description: "Recherche proactive des menaces non détectées",
    icon: "ri-crosshair-line",
    iconBgColor: "bg-yellow-100",
    iconColor: "text-yellow-600",
    applicableRoles: ["analyste"]
  },
  {
    id: "analyse-malware",
    name: "Analyse de malware",
    description: "Étude des logiciels malveillants et de leur fonctionnement",
    icon: "ri-virus-line",
    iconBgColor: "bg-red-100",
    iconColor: "text-red-600",
    applicableRoles: ["analyste", "hacker"]
  }
];

// Initial scenarios data
const initialScenarios: CyberScenario[] = [
  // Ingénierie sociale et phishing
  {
    id: "phishing-awareness",
    title: "Sensibilisation aux attaques de phishing",
    description: "Apprenez à identifier les différents types d'attaques de phishing et les techniques de manipulation utilisées.",
    contact: {
      name: "Yousra Saidani",
      role: "Senior Partner et Directrice Marketing, Communication et RSE"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-[#006a9e]/20 text-[#006a9e]",
    domain: "ingenierie-sociale",
    domainId: "ingenierie-sociale"
  },
  {
    id: "social-engineering-incident",
    title: "Gestion d'un incident d'ingénierie sociale",
    description: "Un employé a été victime d'une attaque d'ingénierie sociale. Analysez l'incident et mettez en place des mesures correctives.",
    contact: {
      name: "Isabelle Dubacq",
      role: "Senior Partner, Directrice des Ressources Humaines"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-[#006a9e]/10 text-[#006a9e]",
    domain: "ingenierie-sociale",
    domainId: "ingenierie-sociale"
  },
  {
    id: "advanced-social-attacks",
    title: "Prévention des attaques sophistiquées",
    description: "Élaborez une stratégie complète pour protéger votre organisation contre des attaques d'ingénierie sociale ciblées et avancées.",
    contact: {
      name: "Arnaud Gauthier",
      role: "Président"
    },
    difficulty: "Expert",
    difficultyColor: "bg-[#006a9e]/20 text-[#006a9e]",
    domain: "ingenierie-sociale"
  },
  
  // Stratégie cyber
  {
    id: "security-awareness",
    title: "Sensibilisation aux enjeux de la stratégie cyber",
    description: "Identifiez les enjeux principaux de sécurité pour votre entreprise et communiquez leur importance.",
    contact: {
      name: "Martin Fournier",
      role: "Directeur de la Communication"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-[#006a9e]/20 text-[#006a9e]",
    domain: "strategie-cyber"
  },
  {
    id: "security-roadmap",
    title: "Feuille de route de sécurité",
    description: "Créez une feuille de route détaillée pour mettre en œuvre la nouvelle stratégie de cybersécurité.",
    contact: {
      name: "Olivier Hervo",
      role: "Directeur Général"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-[#006a9e]/10 text-[#006a9e]",
    domain: "strategie-cyber"
  },
  {
    id: "cyber-strategy",
    title: "Élaboration de la stratégie cybersécurité avancée",
    description: "Développez une stratégie de cybersécurité complète pour les 3 prochaines années.",
    contact: {
      name: "Arnaud Gauthier",
      role: "Président"
    },
    difficulty: "Expert",
    difficultyColor: "bg-[#006a9e]/20 text-[#006a9e]",
    domain: "strategie-cyber"
  },
  
  // Gestion de crise
  {
    id: "crisis-basics",
    title: "Introduction à la gestion de crise cyber",
    description: "Apprenez les principes fondamentaux de la gestion d'une crise cybersécurité et identifiez les rôles clés.",
    contact: {
      name: "Claire Dufour",
      role: "Responsable Communication de Crise"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-[#006a9e]/20 text-[#006a9e]",
    domain: "gestion-crise"
  },
  {
    id: "crisis-plan",
    title: "Plan de gestion de crise cyber",
    description: "Élaborez un plan de gestion de crise cyber complet pour votre organisation.",
    contact: {
      name: "Guillaume Lechevallier",
      role: "Directeur Général Adjoint et Directeur du pôle IMPULSE"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-orange-100 text-orange-700",
    domain: "gestion-crise"
  },
  {
    id: "ransomware-crisis",
    title: "Gestion d'une attaque avancée par ransomware",
    description: "Votre organisation est victime d'une attaque par ransomware. Gérez la crise efficacement.",
    contact: {
      name: "Lorenzo Bertola",
      role: "Directeur Général Adjoint et Directeur du pôle BFA"
    },
    difficulty: "Expert",
    difficultyColor: "bg-[#006a9e]/20 text-[#006a9e]",
    domain: "gestion-crise"
  },
  
  // Supply Chain
  {
    id: "supply-chain-basics",
    title: "Introduction aux risques de la chaîne d'approvisionnement",
    description: "Découvrez les principes fondamentaux de la sécurité dans la chaîne d'approvisionnement.",
    contact: {
      name: "Marie Bernard",
      role: "Responsable Achats"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-[#006a9e]/20 text-[#006a9e]",
    domain: "supply-chain"
  },
  {
    id: "vendor-assessment",
    title: "Évaluation de la sécurité des fournisseurs",
    description: "Développez et mettez en œuvre un processus d'évaluation de la sécurité pour vos fournisseurs critiques.",
    contact: {
      name: "Nicolas Paolantonacci",
      role: "Senior Partner et Directeur du pôle RETAIL & LUXE"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-orange-100 text-orange-700",
    domain: "supply-chain"
  },
  {
    id: "supply-chain-incident",
    title: "Incident de sécurité dans la chaîne d'approvisionnement",
    description: "Un fournisseur critique a subi une violation de données. Évaluez l'impact et prenez les mesures nécessaires.",
    contact: {
      name: "Anthony Frescal",
      role: "Directeur Général Adjoint et Directeur du pôle ENERGIES & UTILITIES"
    },
    difficulty: "Expert",
    difficultyColor: "bg-[#006a9e]/20 text-[#006a9e]",
    domain: "supply-chain"
  },
  
  // Données personnelles / RGPD
  {
    id: "data-classification",
    title: "Classification des données sensibles",
    description: "Mettez en place un système de classification des données pour protéger les informations sensibles.",
    contact: {
      name: "Yousra Saidani",
      role: "Senior Partner et Directrice Marketing, Communication et RSE"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-[#006a9e]/20 text-[#006a9e]",
    domain: "donnees-personnelles"
  },
  {
    id: "data-breach-response",
    title: "Réponse à une violation de données personnelles",
    description: "Une violation de données personnelles a été détectée. Gérez la situation conformément au RGPD.",
    contact: {
      name: "Vincent Terrier",
      role: "Senior Partner, Directeur Financier"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-orange-100 text-orange-700",
    domain: "donnees-personnelles"
  },
  {
    id: "rgpd-compliance-program",
    title: "Programme de conformité RGPD avancé",
    description: "Élaborez un programme complet de conformité RGPD pour votre organisation internationale.",
    contact: {
      name: "Vincent Pascal",
      role: "Directeur Général Adjoint et Directeur du Développement"
    },
    difficulty: "Expert",
    difficultyColor: "bg-[#006a9e]/20 text-[#006a9e]",
    domain: "donnees-personnelles"
  },
  
  // Gestion des incidents
  {
    id: "incident-basics",
    title: "Introduction à la gestion des incidents",
    description: "Découvrez les principes fondamentaux de détection et de réponse aux incidents de sécurité.",
    contact: {
      name: "Philippe Martin",
      role: "Responsable SOC Junior"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-[#006a9e]/20 text-[#006a9e]",
    domain: "gestion-incidents"
  },
  {
    id: "incident-response",
    title: "Mise en place d'un processus de réponse aux incidents",
    description: "Développez et mettez en œuvre un processus de réponse aux incidents de sécurité efficace.",
    contact: {
      name: "Eddy MISSONI",
      role: "Chef de Projet & Expert IA"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-orange-100 text-orange-700",
    domain: "gestion-incidents"
  },
  {
    id: "security-monitoring",
    title: "Optimisation de la surveillance de sécurité",
    description: "Améliorez les capacités de détection et de surveillance de sécurité de votre organisation.",
    contact: {
      name: "Eddy MISSONI IDEMBI",
      role: "Expert Data / IA & CTO"
    },
    difficulty: "Expert",
    difficultyColor: "bg-[#006a9e]/20 text-[#006a9e]",
    domain: "gestion-incidents"
  }
];

// Initial configuration
const initialConfig: AIConfig = {
  difficultyLevel: "Intermédiaire",
  responseStyle: "Professionnel",
  temperature: 0.7,
  maxTokens: 2000
};

// Initial scenario state
const initialScenarioState: ScenarioState = {
  activeScenario: null,
  activeDomain: null
};

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [scenario, setScenario] = useState<ScenarioState>(initialScenarioState);
  const [config, setConfig] = useState<AIConfig>(initialConfig);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [passwordValidated, setPasswordValidated] = useState<boolean>(false);
  const [missionBriefConfirmed, setMissionBriefConfirmed] = useState<boolean>(false);
  const [missionBriefReceived, setMissionBriefReceived] = useState<boolean>(false);

  // Initialize the chat with a welcome message
  useEffect(() => {
    if (!isInitialized) {
      // Initial welcome message exactement comme demandé
      const initialMessage: ChatMessage = {
        id: uuidv4(),
        type: "bot",
        content: "Bonjour !\nJe suis I AM CYBER, votre assistant virtuel dans le cadre de cette mise en situation. Je suis là pour vous accompagner dans une expérience d'apprentissage immersive et interactive.\nPour commencer, Quel est votre prénom ?",
        timestamp: Date.now()
      };
      
      setMessages([initialMessage]);
      setIsInitialized(true);
    }
  }, [isInitialized]);
  
  // Effet pour gérer la réception du brief de mission après validation du mot de passe
  useEffect(() => {
    const handleMissionBrief = async () => {
      if (passwordValidated && missionBriefConfirmed && !missionBriefReceived && scenario.activeDomain) {
        setIsTyping(true);
        
        try {
          // Récupérer le brief de mission
          const response = await apiRequest('/api/cyber/send-mission-brief', {
            method: 'POST',
            body: JSON.stringify({
              userRole,
              domain: scenario.activeDomain.id,
              userName,
              companyName: 'mc2i'
            })
          });
          
          if (response.success && response.email) {
            // Attendez un court délai pour simuler le temps de traitement
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Ajouter l'email au chat
            const newMessage: ChatMessage = {
              id: uuidv4(),
              type: 'email',
              content: response.email,
              timestamp: Date.now()
            };
            
            setMessages(prev => [...prev, newMessage]);
            setMissionBriefReceived(true);
            
            // Masquer l'indicateur de saisie
            setIsTyping(false);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du brief de mission:', error);
          setIsTyping(false);
          
          // Message d'erreur
          const errorMessage: ChatMessage = {
            id: uuidv4(),
            type: "bot",
            content: "Je suis désolé, une erreur s'est produite lors de la génération du brief de mission. Veuillez réessayer ultérieurement.",
            timestamp: Date.now()
          };
          
          setMessages(prev => [...prev, errorMessage]);
        }
      }
    };
    
    handleMissionBrief();
  }, [passwordValidated, missionBriefConfirmed, missionBriefReceived, scenario.activeDomain, userRole, userName]);

  // Handler to set the user's name
  const handleSetUserName = (name: string) => {
    if (!name) return;
    
    setIsTyping(true);
    setUserName(name);
    
    // Add user's name message - Utiliser le texte tel qu'il a été saisi
    // sans ajouter automatiquement "Je m'appelle"
    const userMessage: ChatMessage = {
      id: uuidv4(),
      type: "user",
      content: name, // Utiliser le nom tel quel, sans préfixe
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate bot response
    setTimeout(() => {
      // Obtenir le prénom extrait
      const firstName = extractFirstName(name);
      
      const botResponse: ChatMessage = {
        id: uuidv4(),
        type: "bot",
        content: `Merci ${firstName} ! Ravi de vous rencontrer. J'espère que vous allez bien aujourd'hui.\n\nPour personnaliser votre expérience d'apprentissage, veuillez choisir le rôle que vous souhaitez incarner :`,
        timestamp: Date.now()
      };
      
      const roleSelection: ChatMessage = {
        id: uuidv4(),
        type: "role-selection",
        content: "",
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, botResponse, roleSelection]);
      setCurrentStage(currentStage + 1);
      setIsTyping(false);
    }, 1000);
  };
  
  // Fonction pour générer le descriptif détaillé du rôle
  const getRoleDescription = (roleId: string): string => {
    switch (roleId) {
      case 'rssi':
        return "En tant que Responsable de la Sécurité des Systèmes d'Information (RSSI), vous êtes chargé(e) d'élaborer et de mettre en œuvre la politique de sécurité informatique de l'entreprise. Vos missions principales incluent l'analyse des risques, la définition des procédures de sécurité, la sensibilisation des collaborateurs, et la gestion des incidents de sécurité. Vous êtes également responsable de la conformité règlementaire (RGPD, NIS2, etc.) et devez régulièrement rendre compte à la direction générale de l'état de la sécurité.";
      
      case 'hacker':
        return "En tant que Hacker éthique, vous êtes spécialisé(e) dans les tests d'intrusion et d'audit de sécurité. Votre mission est d'identifier les vulnérabilités des systèmes avant que des acteurs malveillants ne les exploitent. Vous utilisez des techniques avancées comme le pentesting, le social engineering et l'analyse de code pour détecter les failles de sécurité. Vous devez ensuite produire des rapports détaillés et proposer des solutions concrètes pour renforcer la sécurité des infrastructures testées.";
      
      case 'developpeur':
        return "En tant que Développeur sensibilisé aux vulnérabilités logicielles, vous intégrez la sécurité à chaque étape du cycle de développement (Security by Design). Vos responsabilités incluent la mise en œuvre de bonnes pratiques de codage sécurisé, la réalisation de tests de sécurité (SAST, DAST), et la correction des vulnérabilités identifiées. Vous devez rester constamment informé(e) des nouvelles menaces et développer des applications résilientes face aux attaques comme les injections SQL, XSS, ou les problèmes d'authentification.";
      
      case 'admin':
        return "En tant qu'Administrateur Système spécialisé en sécurité, vous êtes responsable de la protection de l'infrastructure informatique. Vos missions comprennent la configuration sécurisée des serveurs et réseaux, la gestion des mises à jour et correctifs, l'implémentation de solutions de détection d'intrusion, et la surveillance active des systèmes. Vous devez également gérer les droits d'accès, maintenir les sauvegardes, et être capable de réagir rapidement en cas d'incident pour assurer la continuité de service.";
      
      case 'consultant':
        return "En tant que Consultant en cybersécurité, vous accompagnez les organisations dans l'amélioration de leur posture de sécurité. Vos missions incluent la réalisation d'audits de sécurité, l'analyse des risques, et la formulation de recommandations adaptées aux enjeux métiers. Vous devez avoir une vision globale de la cybersécurité (technique, organisationnelle et humaine) et être capable de traduire des concepts complexes en termes compréhensibles pour les décideurs. Vous intervenez souvent lors des phases de transformation numérique pour garantir que la sécurité est bien intégrée.";
      
      default:
        return "Vous avez choisi un rôle spécialisé en cybersécurité. Dans ce contexte, vous allez pouvoir explorer différentes problématiques liées à la protection des systèmes d'information.";
    }
  };

  // Handler to set the user's role
  const handleSetUserRole = (roleId: string) => {
    // Empêcher la sélection de plusieurs rôles
    if (!roleId || userRole) return;
    
    setIsTyping(true);
    setUserRole(roleId);
    
    // Get role name
    const role = USER_ROLES.find(r => r.id === roleId);
    if (!role) {
      setIsTyping(false);
      return;
    }
    
    // Add user's role selection message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      type: "user",
      content: `J'ai choisi le rôle de ${role.name}`,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simuler la réponse du bot avec un descriptif détaillé du rôle
    setTimeout(() => {
      // Obtenir le prénom extrait
      const firstName = extractFirstName(userName);
      
      // Obtenir le descriptif détaillé du rôle
      const roleDetailedDescription = getRoleDescription(roleId);
      
      const botResponse: ChatMessage = {
        id: uuidv4(),
        type: "bot",
        content: `Excellent choix, ${firstName} ! Vous allez incarner le rôle de **${role.name}**.\n\n${roleDetailedDescription}\n\nCe rôle est désormais verrouillé pour votre session de formation. Nous allons explorer ensemble différents aspects de la cybersécurité adaptés à votre expertise. Veuillez choisir un domaine qui vous intéresse parmi les options suivantes :`,
        timestamp: Date.now()
      };
      
      const domainSelection: ChatMessage = {
        id: uuidv4(),
        type: "domain-selection",
        content: "",
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, botResponse, domainSelection]);
      setCurrentStage(currentStage + 1);
      setIsTyping(false);
    }, 1000);
  };

  // Fonction wrapper pour adapter l'interface
  const selectDomainWrapper = (domain: CyberDomain) => {
    console.log("selectDomainWrapper appelé avec:", domain);
    handleSelectDomain(domain.id);
  };
  
  // Handler interne pour sélectionner un domaine par son ID
  const handleSelectDomain = async (domainId: string) => {
    console.log("handleSelectDomain appelé avec ID:", domainId);
    
    // Empêcher la sélection de plusieurs domaines
    if (scenario.activeDomain !== null) {
      console.log("Un domaine est déjà actif, sélection ignorée");
      return;
    }
    
    const selectedDomain = initialDomains.find(d => d.id === domainId);
    if (!selectedDomain) {
      console.error("Domaine non trouvé dans initialDomains:", domainId);
      console.log("Domaines disponibles:", initialDomains);
      return;
    }
    
    console.log("Domaine trouvé:", selectedDomain);
    setIsTyping(true);
    setScenario(prev => ({ ...prev, activeDomain: selectedDomain }));
    
    // Bot confirmation message
    // Obtenir le prénom extrait
    const firstName = extractFirstName(userName);
    
    // Créer un message avec des explications et anecdotes sur le domaine sélectionné
    let explanationContent = `**Excellent choix, ${firstName} !** Vous avez sélectionné la **${selectedDomain.name}**.\n\n`;
    
    // Ajouter des explications spécifiques au domaine avec des anecdotes
    switch (domainId) {
      case "gestion-crise":
        explanationContent += `La gestion de crise cyber est un domaine crucial qui exige préparation et réactivité. Saviez-vous que selon une étude récente, les organisations avec un plan de gestion de crise formalisé réduisent en moyenne de 38% le coût d'une cyberattaque ? Une anecdote intéressante : lors de l'attaque NotPetya en 2017, la société maritime Maersk a dû reconstruire son infrastructure informatique complète en quelques semaines. Leur résilience est devenue un cas d'école en matière de gestion de crise.`;
        break;
      case "donnees-personnelles":
        explanationContent += `La protection des données personnelles est devenue incontournable avec le RGPD. Une anecdote marquante : en 2019, une entreprise hôtelière internationale a été sanctionnée à hauteur de 110 millions d'euros pour ne pas avoir suffisamment protégé les données de ses clients. Ce cas démontre l'importance de traiter la conformité comme un investissement plutôt qu'une contrainte.`;
        break;
      case "ingenierie-sociale":
        explanationContent += `L'ingénierie sociale reste le vecteur d'attaque le plus efficace car elle cible la vulnérabilité humaine. Un exemple frappant : en 2020, des pirates ont réussi à compromettre les comptes Twitter de personnalités comme Bill Gates et Elon Musk simplement en manipulant des employés par téléphone. Cette technique appelée "vishing" (phishing vocal) prouve que la sécurité technique ne suffit pas sans sensibilisation humaine.`;
        break;
      case "gestion-incidents":
        explanationContent += `La gestion des incidents de sécurité est l'art de détecter, analyser et remédier efficacement aux menaces. Une statistique intéressante : le temps moyen de détection d'une brèche est de 197 jours (IBM, 2022). Un cas d'école : la société Equifax a mis plus de 76 jours pour détecter une intrusion massive qui a compromis les données de 147 millions de personnes, démontrant l'importance cruciale d'une détection précoce.`;
        break;
      case "supply-chain":
        explanationContent += `La sécurité de la chaîne d'approvisionnement est devenue un enjeu majeur avec l'attaque SolarWinds en 2020, où des hackers ont compromis le code source d'un logiciel utilisé par des milliers d'entreprises et administrations. Cette attaque a démontré qu'une organisation peut être parfaitement sécurisée mais vulnérable via ses fournisseurs - on n'est jamais plus fort que le maillon le plus faible de sa chaîne.`;
        break;
      case "strategie-cyber":
        explanationContent += `La stratégie et gouvernance cybersécurité est l'épine dorsale de toute protection efficace. Une analogie pertinente : tout comme un général ne part pas au combat sans plan, une entreprise ne devrait pas aborder sa sécurité numérique sans stratégie. Le WannaCry de 2017 illustre parfaitement ce point : les organisations avec une stratégie de mise à jour claire ont été largement épargnées, tandis que d'autres ont subi des pertes considérables.`;
        break;
      default:
        explanationContent += `Ce domaine de la cybersécurité représente un enjeu majeur pour les organisations modernes. À travers des cas concrets et des mises en situation, nous allons explorer ensemble les meilleures pratiques et développer votre expertise.`;
    }
    
    // Ajouter l'annonce d'un email à venir
    explanationContent += `\n\nJe vais maintenant vous envoyer un premier email avec un problème concret à résoudre dans ce domaine. Cet exercice vous permettra de mettre en pratique vos connaissances.`;
    
    const botConfirmation: ChatMessage = {
      id: uuidv4(),
      type: "bot",
      content: explanationContent,
      timestamp: Date.now()
    };
    
    // Nous n'affichons plus le sélecteur de scénario, car nous allons directement
    // envoyer un email après l'explication
    setMessages(prev => [...prev, botConfirmation]);
    setCurrentStage(currentStage + 1);
    
    // Sélectionner automatiquement un scénario de difficulté intermédiaire pour ce domaine
    const scenariosForDomain = initialScenarios.filter(s => s.domainId === domainId);
    let selectedScenario = scenariosForDomain.find(s => s.difficulty === "Intermédiaire");
    
    // Si pas de scénario intermédiaire, prendre le premier disponible
    if (!selectedScenario && scenariosForDomain.length > 0) {
      selectedScenario = scenariosForDomain[0];
    }
    
    // Si un scénario est trouvé, le sélectionner automatiquement
    if (selectedScenario) {
      setTimeout(() => {
        handleSelectScenario(selectedScenario!.id);
      }, 3000); // Attendre 3 secondes pour que l'utilisateur puisse lire les explications
    }
    setIsTyping(false);
  };

  // Fonction wrapper pour adapter l'interface
  const selectScenarioWrapper = (scenario: CyberScenario) => {
    handleSelectScenario(scenario.id);
  };

  // Handler interne pour sélectionner un scénario par son ID
  const handleSelectScenario = async (scenarioId: string) => {
    // Empêcher la sélection de plusieurs scénarios
    if (scenario.activeScenario !== null) return;
    
    const selectedScenario = initialScenarios.find(s => s.id === scenarioId);
    if (!selectedScenario) return;
    
    setIsTyping(true);
    setScenario(prev => ({ 
      ...prev, 
      activeScenario: selectedScenario,
      contact: selectedScenario.contact
    }));
    
    // Bot confirmation message
    // Obtenir le prénom extrait
    const firstName = extractFirstName(userName);
    
    const botMessage: ChatMessage = {
      id: uuidv4(),
      type: "bot",
      content: `Je vous prépare maintenant un email avec un problème concret à résoudre dans le domaine que vous avez choisi. Cet exercice vous permettra de mettre en pratique vos connaissance.`,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, botMessage]);
    
    // Send the scenario selection to the server to generate initial email
    try {
      const data = await apiRequest<any>('/api/cyber/start-scenario', {
        method: 'POST',
        body: JSON.stringify({
          scenarioId,
          userName,
          userRole, // Transmettre le rôle de l'utilisateur
          config,
          currentStage
        })
      });
      
      // Vérifier que l'email existe bien dans la réponse
      if (!data.email) {
        throw new Error("Erreur: Le serveur n'a pas retourné de contenu d'email valide");
      }

      // Add the email message
      const emailMessage: ChatMessage = {
        id: uuidv4(),
        type: "email",
        content: data.email as EmailMessageContent,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, emailMessage]);
      setCurrentStage(currentStage + 1);
    } catch (error) {
      console.error('Error starting scenario:', error);
      
      // Détermine le message d'erreur détaillé
      let errorDetail = "";
      if (error instanceof Error) {
        errorDetail = error.message;
        console.log("Error message:", error.message);
        console.log("Error stack:", error.stack);
      } else if (typeof error === 'object' && error !== null) {
        errorDetail = JSON.stringify(error);
        console.log("JSON Error:", errorDetail);
      } else {
        errorDetail = String(error);
        console.log("String Error:", errorDetail);
      }
      
      // Tenter de récupérer des informations supplémentaires si disponibles
      let serverErrorMsg = "Erreur inconnue";
      let modelUsed = "inconnu";
      
      // Extraire les détails additionnels de la réponse si disponible
      try {
        // Vérifier si l'erreur est une instance de Response
        if (error instanceof Response) {
          // Capture la promesse pour éviter les erreurs non interceptées
          const jsonPromise = error.json();
          jsonPromise
            .then((responseData: Record<string, string>) => {
              console.log("Réponse serveur complète:", responseData);
              if (responseData.message) serverErrorMsg = responseData.message;
              if (responseData.model) modelUsed = responseData.model;
            })
            .catch((parseError: Error) => {
              console.error("Impossible de traiter la réponse JSON:", parseError);
            });
        } 
        // Vérifier si l'erreur est un objet qui a une méthode json
        else if (error && typeof error === 'object' && 'json' in error && typeof (error as { json: Function }).json === 'function') {
          try {
            const jsonFn = (error as { json: () => Promise<Record<string, string>> }).json;
            jsonFn()
              .then((responseData: Record<string, string>) => {
                console.log("Réponse serveur complète:", responseData);
                if (responseData.message) serverErrorMsg = responseData.message;
                if (responseData.model) modelUsed = responseData.model;
              })
              .catch((parseError: Error) => {
                console.error("Impossible de traiter la réponse JSON:", parseError);
              });
          } catch (jsonMethodError) {
            console.error("Erreur lors de l'appel de la méthode json:", jsonMethodError);
          }
        } else if (error instanceof Error && error.cause && typeof error.cause === 'object') {
          const cause = error.cause as any;
          if (cause.data) {
            console.log("Error cause data:", cause.data);
            if (cause.data.message) serverErrorMsg = cause.data.message;
            if (cause.data.model) modelUsed = cause.data.model;
          }
        }
      } catch (parseError) {
        console.error("Erreur lors de l'analyse des détails supplémentaires:", parseError);
      }
      
      // Message d'erreur plus informatif
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        type: "bot",
        content: `Je suis désolé, une erreur s'est produite lors de la génération du scénario avec le modèle ${modelUsed}. Cela peut être dû à une interruption de la connexion à l'API Azure OpenAI.\n\nDétail de l'erreur: ${serverErrorMsg}\n\nVeuillez vérifier que l'indicateur FYNE est vert (connecté) et réessayer. Si le problème persiste, veuillez contacter l'administrateur système.`,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      // Même en cas d'erreur, nous incrémentons le stage pour éviter que l'utilisateur ne soit bloqué
      setCurrentStage(currentStage + 1);
    }
    
    setIsTyping(false);
  };

  // Handler to send a message
  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;
    
    // If no username set yet, treat this as the username
    if (!userName) {
      handleSetUserName(messageText);
      return;
    }
    
    // Otherwise, process as a regular message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      type: "user",
      content: messageText,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      // Get recent chat history to provide context
      // We filter to only include relevant messages (user and bot) and limit to recent messages
      const relevantMessages = messages
        .filter(msg => msg.type === 'user' || msg.type === 'bot')
        .slice(-10); // Get last 10 messages for context
      
      // Vérifier si nous avons un scénario actif
      let data;
      if (scenario.activeScenario?.id) {
        // Si un scénario est actif, utiliser l'API de chat contextuel
        data = await apiRequest<any>('/api/cyber/chat', {
          method: 'POST',
          body: JSON.stringify({
            message: messageText,
            userName,
            userRole, // Transmettre le rôle de l'utilisateur
            scenarioId: scenario.activeScenario.id,
            config,
            chatHistory: relevantMessages,
            scenarioContacts: scenario.scenarioContacts, // Transmettre la liste des interlocuteurs
            currentStage: currentStage // Ajouter l'information de progression
          })
        });
      } else {
        // Si aucun scénario n'est actif, utiliser l'API de chat simple
        console.log("Aucun scénario actif, utilisation du chat simple");
        data = await apiRequest<any>('/api/cyber/simple-chat', {
          method: 'POST',
          body: JSON.stringify({
            message: messageText,
            config,
            userName,
            userRole,
          })
        });
      }
      
      // Si nous recevons les contacts du scénario, mettons à jour notre état
      if (data.scenarioContacts && Array.isArray(data.scenarioContacts)) {
        setScenario(prev => ({
          ...prev,
          scenarioContacts: data.scenarioContacts
        }));
      }
      
      // Si la réponse contient une décision
      if (data.type === 'decision-choices') {
        const decisionContent = data.content as CrisisDecisionContent;
        
        const decisionMessage: ChatMessage = {
          id: uuidv4(),
          type: "decision-choices",
          content: decisionContent,
          timestamp: Date.now(),
          contactName: data.contactName || "Système",
          contactRole: data.contactRole || "Situation de crise"
        };
        
        setMessages(prev => [...prev, decisionMessage]);
        setCurrentStage(currentStage + 1);
      }
      // If response contains an email, add it as an email message
      else if (data.type === 'email') {
        const emailContent = data.content as EmailMessageContent;
        
        // Si l'email contient une évaluation, vérifions qu'elle est valide
        if (emailContent.evaluation && !emailContent.evaluation.id) {
          console.warn("Evaluation is missing ID", emailContent.evaluation);
          delete emailContent.evaluation;
        }
        
        const emailMessage: ChatMessage = {
          id: uuidv4(),
          type: "email",
          content: emailContent,
          timestamp: Date.now()
        };
        
        // Si l'email contient des interlocuteurs, mettons à jour l'état
        if (emailContent.scenarioContacts && Array.isArray(emailContent.scenarioContacts)) {
          setScenario(prev => ({
            ...prev,
            scenarioContacts: emailContent.scenarioContacts
          }));
        }
        
        setMessages(prev => [...prev, emailMessage]);
        setCurrentStage(currentStage + 1);
      } else {
        // Otherwise add as a regular bot message with contact info
        const botResponse: ChatMessage = {
          id: uuidv4(),
          type: "bot",
          content: data.content as string,
          timestamp: Date.now(),
          contactName: data.contactName,
          contactRole: data.contactRole,
          isIAMCYBERIntervention: data.isIAMCYBERIntervention,
          iamCyberContent: data.iamCyberContent,
          contactContent: data.contactContent
        };
        
        setMessages(prev => [...prev, botResponse]);
        setCurrentStage(currentStage + 1);
        
        // Check if the scenario should be reset based on the API response
        if (data.resetScenario) {
          // Wait a moment before resetting so the user can read the final message
          setTimeout(() => {
            const resetMessage: ChatMessage = {
              id: uuidv4(),
              type: "bot",
              content: "Le scénario va être réinitialisé. Préparation d'un nouveau scénario...",
              timestamp: Date.now()
            };
            
            setMessages(prev => [...prev, resetMessage]);
            
            // Wait another moment before actual reset
            setTimeout(() => {
              handleResetChat();
            }, 3000);
          }, 5000);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Détermine le message d'erreur détaillé
      let errorDetail = "";
      if (error instanceof Error) {
        errorDetail = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorDetail = JSON.stringify(error);
      } else {
        errorDetail = String(error);
      }
      
      // Message d'erreur plus informatif
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        type: "bot",
        content: "Je suis désolé, une erreur s'est produite lors du traitement de votre message. Cela peut être dû à une interruption de la connexion à l'API Azure OpenAI.\n\nVeuillez vérifier que l'indicateur FYNE est vert (connecté) et réessayer. Si le problème persiste, veuillez contacter l'administrateur système.",
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      // Même en cas d'erreur, nous incrémentons le stage pour éviter que l'utilisateur ne soit bloqué
      setCurrentStage(currentStage + 1);
    }
    
    setIsTyping(false);
  };

  // Handler to update configuration
  const handleUpdateConfig = (newConfig: Partial<AIConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  // Handler to reset the chat
  const handleResetChat = () => {
    setMessages([]);
    setUserName("");
    setUserRole("");
    setScenario(initialScenarioState);
    setConfig(initialConfig);
    setCurrentStage(0);
    setIsInitialized(false);
  };

  // Fonction pour confirmer le brief de mission et déclencher le scénario de crise
  const handleConfirmMissionBrief = async () => {
    setMissionBriefConfirmed(true);
    setMissionBriefReceived(true);  // Débloquer la zone de saisie après confirmation
    setIsTyping(true);
    
    try {
      // Envoyer une requête pour obtenir le message de bienvenue et les choix initiaux
      const response = await apiRequest('/api/cyber/decision', {
        method: 'POST',
        body: JSON.stringify({
          userRole,
          domain: scenario.activeDomain?.id,
          userName,
          action: 'START_CRISIS',
          currentStage,
          companyName: 'mc2i'
        })
      });
      
      if (response.success) {
        // Ajouter d'abord le message de bienvenue contextuel
        if (response.welcomeMessage) {
          const welcomeMessage: ChatMessage = {
            id: uuidv4(),
            type: 'bot',
            content: response.welcomeMessage,
            timestamp: Date.now(),
            contactName: response.contactName || scenario.contact?.name,
            contactRole: response.contactRole || scenario.contact?.role
          };
          
          setMessages(prev => [...prev, welcomeMessage]);
        }
        
        // Attendre un peu pour simuler le temps de réflexion (0.8s)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Puis ajouter les choix de décision
        if (response.decision) {
          const decisionMessage: ChatMessage = {
            id: uuidv4(),
            type: 'decision-choices',
            content: response.decision,
            timestamp: Date.now()
          };
          
          setMessages(prev => [...prev, decisionMessage]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du démarrage du scénario de crise:', error);
      
      // Message d'erreur
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        type: 'bot',
        content: "Je suis désolé, une erreur s'est produite lors du démarrage de la simulation de crise. Veuillez réessayer ultérieurement.",
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsTyping(false);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        userName,
        userRole,
        isTyping,
        scenario,
        config,
        domains: initialDomains,
        scenarios: initialScenarios,
        currentStage,
        passwordValidated,
        missionBriefConfirmed,
        missionBriefReceived,
        setUserName: handleSetUserName,
        setUserRole: handleSetUserRole,
        selectDomain: selectDomainWrapper,
        selectScenario: selectScenarioWrapper,
        sendMessage: handleSendMessage,
        updateConfig: handleUpdateConfig,
        resetChat: handleResetChat,
        setPasswordValidated: (validated: boolean) => setPasswordValidated(validated),
        confirmMissionBrief: handleConfirmMissionBrief
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
