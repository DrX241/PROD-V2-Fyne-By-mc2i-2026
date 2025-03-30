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
  ScenarioContact
} from "../../I_AM_CYBER/types";

// Initial domains data
const initialDomains: CyberDomain[] = [
  {
    id: "formation-sensibilisation",
    name: "Formation et sensibilisation à la cybersécurité",
    description: "Programmes de formation, sensibilisation des employés, simulation d'attaques",
    icon: "ri-graduation-cap-line",
    iconBgColor: "bg-blue-100",
    iconColor: "text-blue-600"
  },
  {
    id: "osint",
    name: "L'OSINT",
    description: "Open Source Intelligence, collecte et analyse d'informations accessibles publiquement",
    icon: "ri-search-eye-line",
    iconBgColor: "bg-indigo-100",
    iconColor: "text-indigo-600"
  },
  {
    id: "conformite-cyber",
    name: "La conformité cyber en entreprise",
    description: "Respect des normes et réglementations en matière de cybersécurité",
    icon: "ri-file-list-3-line",
    iconBgColor: "bg-purple-100",
    iconColor: "text-purple-600"
  },
  {
    id: "strategie-cyber",
    name: "Définir une stratégie cyber et sa feuille de route",
    description: "Élaboration et mise en œuvre de stratégies de sécurité",
    icon: "ri-road-map-line",
    iconBgColor: "bg-pink-100",
    iconColor: "text-pink-600"
  },
  {
    id: "gestion-crise",
    name: "Gestion de crise cyber",
    description: "Planification et réponse aux incidents de sécurité majeurs",
    icon: "ri-alarm-warning-line",
    iconBgColor: "bg-red-100",
    iconColor: "text-red-600"
  },
  {
    id: "supply-chain",
    name: "La sécurité de la supply chain",
    description: "Protection de la chaîne d'approvisionnement contre les cybermenaces",
    icon: "ri-link-m",
    iconBgColor: "bg-orange-100",
    iconColor: "text-orange-600"
  },
  {
    id: "iam",
    name: "L'IAM",
    description: "Identity and Access Management, gestion des identités et des accès",
    icon: "ri-shield-keyhole-line",
    iconBgColor: "bg-amber-100",
    iconColor: "text-amber-600"
  },
  {
    id: "cloud-security",
    name: "La cybersécurité dans le cloud",
    description: "Sécurisation des environnements cloud et des services SaaS",
    icon: "ri-cloud-line",
    iconBgColor: "bg-yellow-100",
    iconColor: "text-yellow-600"
  },
  {
    id: "donnees-personnelles",
    name: "Sécurisation des données personnelles",
    description: "Protection des informations personnelles et respect du RGPD",
    icon: "ri-profile-line",
    iconBgColor: "bg-lime-100",
    iconColor: "text-lime-600"
  },
  {
    id: "analyse-vulnerabilites",
    name: "Analyse des vulnérabilités et tests de pénétration",
    description: "Identification des failles et simulation d'attaques",
    icon: "ri-bug-line",
    iconBgColor: "bg-green-100",
    iconColor: "text-green-600"
  },
  {
    id: "gestion-incidents",
    name: "Gestion des incidents de sécurité",
    description: "Détection, analyse et réponse aux incidents de sécurité",
    icon: "ri-service-line",
    iconBgColor: "bg-emerald-100",
    iconColor: "text-emerald-600"
  },
  {
    id: "forensics",
    name: "Forensics",
    description: "Analyse post-incident et investigation en cybersécurité",
    icon: "ri-microscope-line",
    iconBgColor: "bg-teal-100",
    iconColor: "text-teal-600"
  }
];

// Initial scenarios data
const initialScenarios: CyberScenario[] = [
  // Formation et sensibilisation
  {
    id: "phishing-simulation",
    title: "Simulation d'attaque phishing",
    description: "Vous devez préparer et exécuter une campagne de simulation de phishing pour évaluer et sensibiliser les employés.",
    contact: {
      name: "Marion Lopez",
      role: "Senior Partner et Directrice Marketing, Communication et RSE"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-green-100 text-green-700",
    domainId: "formation-sensibilisation"
  },
  {
    id: "security-training",
    title: "Programme de formation à la cybersécurité",
    description: "Élaboration d'un programme de formation complet pour les différents niveaux de l'entreprise.",
    contact: {
      name: "Isabelle Dubacq",
      role: "Senior Partner, Directrice des Ressources Humaines"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-orange-100 text-orange-700",
    domainId: "formation-sensibilisation"
  },
  
  // OSINT
  {
    id: "osint-basics",
    title: "Initiation à l'OSINT - Sources publiques",
    description: "Découvrez les bases de l'OSINT en utilisant des sources publiques pour collecter des informations sur votre entreprise.",
    contact: {
      name: "Sophie Martin",
      role: "Responsable Communication"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-green-100 text-green-700",
    domainId: "osint"
  },
  {
    id: "osint-investigation",
    title: "Investigation d'une menace potentielle",
    description: "Utilisez l'OSINT pour enquêter sur une menace potentielle visant votre organisation.",
    contact: {
      name: "Neil LEVIN",
      role: "Expert cybersécurité & CFO"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-orange-100 text-orange-700",
    domainId: "osint"
  },
  {
    id: "digital-footprint",
    title: "Analyse avancée de l'empreinte numérique",
    description: "Évaluez l'empreinte numérique de votre organisation pour identifier les vulnérabilités exposées publiquement.",
    contact: {
      name: "Yousra SAIDANI",
      role: "Experte Cybersécurité & CFO"
    },
    difficulty: "Expert",
    difficultyColor: "bg-red-100 text-red-700",
    domainId: "osint"
  },
  
  // Conformité cyber
  {
    id: "compliance-basics",
    title: "Initiation aux normes de conformité cyber",
    description: "Découvrez les principales réglementations et normes de cybersécurité qui s'appliquent à votre secteur.",
    contact: {
      name: "Julie Moreau",
      role: "Responsable Qualité"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-green-100 text-green-700",
    domainId: "conformite-cyber"
  },
  {
    id: "gdpr-compliance",
    title: "Mise en conformité RGPD",
    description: "Vous devez évaluer et améliorer la conformité RGPD de votre organisation suite à des changements réglementaires.",
    contact: {
      name: "Vincent Terrier",
      role: "Senior Partner, Directeur Financier"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-orange-100 text-orange-700",
    domainId: "conformite-cyber"
  },
  {
    id: "iso-certification",
    title: "Préparation à la certification ISO 27001",
    description: "Vous préparez votre organisation à une certification ISO 27001 et devez identifier les écarts à combler.",
    contact: {
      name: "Vincent Pascal",
      role: "Directeur Général Adjoint et Directeur du Développement"
    },
    difficulty: "Expert",
    difficultyColor: "bg-red-100 text-red-700",
    domainId: "conformite-cyber"
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
    difficultyColor: "bg-green-100 text-green-700",
    domainId: "strategie-cyber"
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
    difficultyColor: "bg-orange-100 text-orange-700",
    domainId: "strategie-cyber"
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
    difficultyColor: "bg-red-100 text-red-700",
    domainId: "strategie-cyber"
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
    difficultyColor: "bg-green-100 text-green-700",
    domainId: "gestion-crise"
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
    domainId: "gestion-crise"
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
    difficultyColor: "bg-red-100 text-red-700",
    domainId: "gestion-crise"
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
    difficultyColor: "bg-green-100 text-green-700",
    domainId: "supply-chain"
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
    domainId: "supply-chain"
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
    difficultyColor: "bg-red-100 text-red-700",
    domainId: "supply-chain"
  },
  
  // IAM
  {
    id: "iam-basics",
    title: "Les bases de la gestion des identités et des accès",
    description: "Découvrez les principes fondamentaux de l'IAM et son importance pour la sécurité.",
    contact: {
      name: "Thomas Mercier",
      role: "Administrateur Système"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-green-100 text-green-700",
    domainId: "iam"
  },
  {
    id: "iam-implementation",
    title: "Mise en place d'une solution IAM",
    description: "Vous dirigez l'implémentation d'une nouvelle solution de gestion des identités et des accès.",
    contact: {
      name: "Eddy MISSONI",
      role: "Chef de Projet & Expert IA"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-orange-100 text-orange-700",
    domainId: "iam"
  },
  {
    id: "privileged-access",
    title: "Gestion des accès privilégiés",
    description: "Concevez une stratégie de gestion des accès privilégiés pour réduire les risques de sécurité.",
    contact: {
      name: "Eddy MISSONI IDEMBI",
      role: "Expert Data / IA & CTO"
    },
    difficulty: "Expert",
    difficultyColor: "bg-red-100 text-red-700",
    domainId: "iam"
  },
  
  // Cloud Security
  {
    id: "cloud-basics",
    title: "Comprendre les fondamentaux de la sécurité cloud",
    description: "Découvrez les principes de base de la sécurité dans le cloud et les responsabilités partagées.",
    contact: {
      name: "Alex Laurent",
      role: "Ingénieur Cloud"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-green-100 text-green-700",
    domainId: "cloud-security"
  },
  {
    id: "cloud-migration",
    title: "Sécurisation d'une migration vers le cloud",
    description: "Votre entreprise migre ses applications critiques vers le cloud. Assurez la sécurité de cette transition.",
    contact: {
      name: "Fares SAYADI",
      role: "Spécialiste Data / IA"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-orange-100 text-orange-700",
    domainId: "cloud-security"
  },
  {
    id: "cloud-security-posture",
    title: "Évaluation de la posture de sécurité cloud",
    description: "Évaluez et améliorez la posture de sécurité de votre infrastructure cloud multi-fournisseurs.",
    contact: {
      name: "Yousra SAIDANI",
      role: "Experte Cybersécurité & CFO"
    },
    difficulty: "Expert",
    difficultyColor: "bg-red-100 text-red-700",
    domainId: "cloud-security"
  },
  
  // Données personnelles
  {
    id: "data-classification",
    title: "Classification des données sensibles",
    description: "Mettez en place un système de classification des données pour protéger les informations sensibles.",
    contact: {
      name: "Marion Lopez",
      role: "Senior Partner et Directrice Marketing, Communication et RSE"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-green-100 text-green-700",
    domainId: "donnees-personnelles"
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
    domainId: "donnees-personnelles"
  },
  
  // Analyse des vulnérabilités
  {
    id: "vuln-basics",
    title: "Introduction à l'analyse des vulnérabilités",
    description: "Découvrez les principes de base de l'identification et de l'analyse des vulnérabilités.",
    contact: {
      name: "Sarah Dubois",
      role: "Analyste en Cybersécurité Junior"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-green-100 text-green-700",
    domainId: "analyse-vulnerabilites"
  },
  {
    id: "pentest-planning",
    title: "Planification d'un test d'intrusion",
    description: "Préparez et planifiez un test d'intrusion complet pour votre infrastructure critique.",
    contact: {
      name: "Neil LEVIN",
      role: "Expert cybersécurité & CFO"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-orange-100 text-orange-700",
    domainId: "analyse-vulnerabilites"
  },
  {
    id: "vuln-management",
    title: "Programme de gestion des vulnérabilités",
    description: "Développez un programme de gestion des vulnérabilités efficace pour votre organisation.",
    contact: {
      name: "Yousra SAIDANI",
      role: "Experte Cybersécurité & CFO"
    },
    difficulty: "Expert",
    difficultyColor: "bg-red-100 text-red-700",
    domainId: "analyse-vulnerabilites"
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
    difficultyColor: "bg-green-100 text-green-700",
    domainId: "gestion-incidents"
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
    domainId: "gestion-incidents"
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
    difficultyColor: "bg-red-100 text-red-700",
    domainId: "gestion-incidents"
  },
  
  // Forensics
  {
    id: "forensics-basics",
    title: "Introduction à l'investigation numérique",
    description: "Découvrez les principes fondamentaux de l'investigation numérique et de l'analyse post-incident.",
    contact: {
      name: "Jean Dubois",
      role: "Technicien en Investigation Numérique"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-green-100 text-green-700",
    domainId: "forensics"
  },
  {
    id: "evidence-collection",
    title: "Collecte et préservation des preuves numériques",
    description: "Établissez un processus robuste pour la collecte et la préservation des preuves numériques.",
    contact: {
      name: "Yousra SAIDANI",
      role: "Experte Cybersécurité & CFO"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-orange-100 text-orange-700",
    domainId: "forensics"
  },
  {
    id: "forensic-investigation",
    title: "Investigation numérique après un incident",
    description: "Menez une investigation numérique complète suite à une intrusion détectée sur vos systèmes.",
    contact: {
      name: "Neil LEVIN",
      role: "Expert cybersécurité & CFO"
    },
    difficulty: "Expert",
    difficultyColor: "bg-red-100 text-red-700",
    domainId: "forensics"
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
const initialScenarioState: ScenarioState = {};

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [scenario, setScenario] = useState<ScenarioState>(initialScenarioState);
  const [config, setConfig] = useState<AIConfig>(initialConfig);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the chat with a welcome message
  useEffect(() => {
    if (!isInitialized) {
      // Initial welcome message
      const initialMessage: ChatMessage = {
        id: uuidv4(),
        type: "bot",
        content: "👋 Bonjour !\n\nJe suis CyberGuide, votre assistant virtuel dans le monde passionnant de la cybersécurité. Je suis là pour vous accompagner dans une expérience d'apprentissage immersive et interactive.\n\nComment puis-je vous appeler ?",
        timestamp: Date.now()
      };
      
      setMessages([initialMessage]);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Handler to set the user's name
  const handleSetUserName = (name: string) => {
    if (!name) return;
    
    setIsTyping(true);
    setUserName(name);
    
    // Add user's name message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      type: "user",
      content: `Je m'appelle ${name}`,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: uuidv4(),
        type: "bot",
        content: `Merci ${name} ! Ravi de vous rencontrer. J'espère que vous allez bien aujourd'hui.\n\nNous allons explorer ensemble différents aspects de la cybersécurité. Veuillez choisir un domaine qui vous intéresse parmi les options suivantes :`,
        timestamp: Date.now()
      };
      
      const domainSelection: ChatMessage = {
        id: uuidv4(),
        type: "domain-selection",
        content: "",
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, botResponse, domainSelection]);
      setIsTyping(false);
    }, 1000);
  };

  // Handler to select a domain
  const handleSelectDomain = async (domainId: string) => {
    const selectedDomain = initialDomains.find(d => d.id === domainId);
    if (!selectedDomain) return;
    
    setIsTyping(true);
    setScenario(prev => ({ ...prev, activeDomain: selectedDomain }));
    
    // Bot confirmation message
    const botConfirmation: ChatMessage = {
      id: uuidv4(),
      type: "bot",
      content: `**Excellent choix, ${userName} !** Vous avez sélectionné la **${selectedDomain.name}**.\n\nJ'ai plusieurs scénarios de différents niveaux à vous proposer. Choisissez celui qui vous intéresse le plus :`,
      timestamp: Date.now()
    };
    
    // Add scenario selection component
    const scenarioSelection: ChatMessage = {
      id: uuidv4(),
      type: "scenario-selection",
      content: "",
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, botConfirmation, scenarioSelection]);
    setIsTyping(false);
  };

  // Handler to select a scenario
  const handleSelectScenario = async (scenarioId: string) => {
    const selectedScenario = initialScenarios.find(s => s.id === scenarioId);
    if (!selectedScenario) return;
    
    setIsTyping(true);
    setScenario(prev => ({ 
      ...prev, 
      activeScenario: selectedScenario,
      contact: selectedScenario.contact
    }));
    
    // Bot confirmation message
    const botConfirmation: ChatMessage = {
      id: uuidv4(),
      type: "bot",
      content: `**Parfait ${userName} !** Vous avez choisi le scénario "${selectedScenario.title}".\n\nJe vais maintenant vous placer dans cette situation d'apprentissage.`,
      timestamp: Date.now()
    };
    
    // Contexte détaillé avant l'email
    const scenarioContext: ChatMessage = {
      id: uuidv4(),
      type: "bot",
      content: `**Contexte du scénario :** ${selectedScenario.description}\n\nVous allez interagir avec plusieurs interlocuteurs qui ont des préoccupations différentes liées à ce scénario. Chaque interlocuteur apportera un point de vue unique (finance, cybersécurité, réputation, etc.).\n\nVous recevrez bientôt un e-mail de ${selectedScenario.contact.name}, ${selectedScenario.contact.role}, qui sera votre premier interlocuteur pour ce scénario.\n\nPréparez-vous à analyser la situation et à proposer des solutions adaptées !`,
      timestamp: Date.now() + 100
    };
    
    setMessages(prev => [...prev, botConfirmation, scenarioContext]);
    
    // Send the scenario selection to the server to generate initial email
    try {
      const response = await apiRequest('POST', '/api/cyber/start-scenario', {
        scenarioId,
        userName,
        config
      });
      
      const data = await response.json();
      
      // Add the email message
      const emailMessage: ChatMessage = {
        id: uuidv4(),
        type: "email",
        content: data.email as EmailMessageContent,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, emailMessage]);
    } catch (error) {
      console.error('Error starting scenario:', error);
      
      // Fallback message if there's an error
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        type: "bot",
        content: "Je suis désolé, une erreur s'est produite lors de la génération du scénario. Veuillez réessayer.",
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
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
      
      // Send message to server for processing
      const response = await apiRequest('POST', '/api/cyber/chat', {
        message: messageText,
        userName,
        scenarioId: scenario.activeScenario?.id,
        config,
        chatHistory: relevantMessages,
        scenarioContacts: scenario.scenarioContacts // Transmettre la liste des interlocuteurs
      });
      
      const data = await response.json();
      
      // Si nous recevons les contacts du scénario, mettons à jour notre état
      if (data.scenarioContacts && Array.isArray(data.scenarioContacts)) {
        setScenario(prev => ({
          ...prev,
          scenarioContacts: data.scenarioContacts
        }));
      }
      
      // If response contains an email, add it as an email message
      if (data.type === 'email') {
        const emailContent = data.content as EmailMessageContent;
        
        // Si l'email contient une évaluation, vérifions que c'est une pièce jointe valide
        if (emailContent.evaluation && !emailContent.evaluation.id) {
          console.warn("Evaluation attachment is missing ID", emailContent.evaluation);
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
      } else {
        // Otherwise add as a regular bot message with contact info
        const botResponse: ChatMessage = {
          id: uuidv4(),
          type: "bot",
          content: data.content as string,
          timestamp: Date.now(),
          contactName: data.contactName,
          contactRole: data.contactRole
        };
        
        setMessages(prev => [...prev, botResponse]);
        
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
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        type: "bot",
        content: "Je suis désolé, une erreur s'est produite lors du traitement de votre message. Veuillez réessayer.",
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
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
    setScenario(initialScenarioState);
    setConfig(initialConfig);
    setIsInitialized(false);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        userName,
        isTyping,
        scenario,
        config,
        domains: initialDomains,
        scenarios: initialScenarios,
        setUserName: handleSetUserName,
        selectDomain: handleSelectDomain,
        selectScenario: handleSelectScenario,
        sendMessage: handleSendMessage,
        updateConfig: handleUpdateConfig,
        resetChat: handleResetChat
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
