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
} from "@shared/types/cyber";

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
  
  // Étape 6: Mettre la première lettre en majuscule
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
};

// Initial domains data
const initialDomains: CyberDomain[] = [
  {
    id: "banque",
    name: "Secteur Bancaire & Finance",
    description: "Projets AMOA dans le secteur bancaire, adaptation aux réglementations (RGPD, DSP2) et transformation digitale des services financiers",
    icon: "ri-bank-line",
    iconBgColor: "bg-blue-50",
    iconColor: "text-blue-600"
  },
  {
    id: "assurance",
    name: "Assurance & Mutuelles",
    description: "Gestion de projets de refonte SI assurantiel, optimisation des parcours client et mise en conformité réglementaire",
    icon: "ri-shield-check-line",
    iconBgColor: "bg-indigo-50",
    iconColor: "text-indigo-600"
  },
  {
    id: "energie",
    name: "Énergie & Utilities",
    description: "Accompagnement des transformations énergétiques, projets Smart Grid et optimisation des processus industriels",
    icon: "ri-flashlight-line",
    iconBgColor: "bg-yellow-50",
    iconColor: "text-yellow-600"
  },
  {
    id: "secteur-public",
    name: "Secteur Public",
    description: "Modernisation des services publics, transformation numérique des administrations et conduite du changement",
    icon: "ri-government-line",
    iconBgColor: "bg-teal-50",
    iconColor: "text-teal-600"
  },
  {
    id: "industrie",
    name: "Industrie & Manufacturing",
    description: "Projets Industrie 4.0, optimisation des chaînes logistiques et digital workplace dans l'environnement industriel",
    icon: "ri-building-2-line",
    iconBgColor: "bg-purple-50",
    iconColor: "text-purple-600"
  },
  {
    id: "methodologies",
    name: "Méthodologies & Outils",
    description: "Expertise en méthodes agiles, cycle en V, PMI, Prince2 et outils de gestion de projet (Jira, MS Project, etc.)",
    icon: "ri-tools-line",
    iconBgColor: "bg-gray-50",
    iconColor: "text-gray-600"
  }
];

// Initial scenarios data
const initialScenarios: CyberScenario[] = [
  // Secteur Bancaire & Finance
  {
    id: "banque-digitalisation",
    title: "Digitalisation des parcours clients",
    description: "Accompagner la transformation des parcours clients pour une banque nationale avec une approche orientée expérience utilisateur.",
    contact: {
      name: "Sophie Martin",
      role: "Directrice de la Transformation Digitale"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-blue-100 text-blue-800",
    domainId: "banque"
  },
  {
    id: "banque-psd2",
    title: "Mise en conformité PSD2",
    description: "Piloter le projet de mise en conformité avec la directive européenne sur les services de paiement (PSD2) pour un acteur bancaire majeur.",
    contact: {
      name: "Thomas Dubois",
      role: "Responsable Conformité Réglementaire"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-blue-200 text-blue-800",
    domainId: "banque"
  },
  {
    id: "banque-core-banking",
    title: "Refonte du Core Banking System",
    description: "Gérer un projet complexe de remplacement du système bancaire central impliquant des migrations de données critiques et une transformation profonde des processus.",
    contact: {
      name: "Laurent Mercier",
      role: "Directeur des Systèmes d'Information"
    },
    difficulty: "Expert",
    difficultyColor: "bg-blue-300 text-blue-900",
    domainId: "banque"
  },
  
  // Assurance & Mutuelles
  {
    id: "assurance-parcours-digital",
    title: "Parcours digital de souscription",
    description: "Moderniser le parcours de souscription d'assurance avec une approche omnicanale et des outils digitaux innovants.",
    contact: {
      name: "Caroline Petit",
      role: "Responsable Marketing Digital"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-indigo-100 text-indigo-800",
    domainId: "assurance"
  },
  {
    id: "assurance-sinistres",
    title: "Optimisation du processus de gestion des sinistres",
    description: "Analyser et refondre le processus de gestion des sinistres pour une compagnie d'assurance, avec intégration de solutions d'IA pour la détection de fraude.",
    contact: {
      name: "Pierre Legrand",
      role: "Directeur des Opérations"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-indigo-200 text-indigo-800",
    domainId: "assurance"
  },
  {
    id: "assurance-data-analytics",
    title: "Stratégie Data & Analytics",
    description: "Définir et mettre en œuvre une stratégie data pour valoriser le patrimoine informationnel d'un groupe d'assurance, incluant l'élaboration d'une gouvernance des données.",
    contact: {
      name: "Emma Rousseau",
      role: "Chief Data Officer"
    },
    difficulty: "Expert",
    difficultyColor: "bg-indigo-300 text-indigo-900",
    domainId: "assurance"
  },
  
  // Énergie & Utilities
  {
    id: "energie-smart-metering",
    title: "Déploiement Smart Metering",
    description: "Coordonner le déploiement de compteurs intelligents pour un acteur majeur de l'énergie, avec gestion du planning et des parties prenantes multiples.",
    contact: {
      name: "Jean Dupont",
      role: "Chef de Projet Smart Grid"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-yellow-100 text-yellow-800",
    domainId: "energie"
  },
  {
    id: "energie-transition",
    title: "Accompagnement transition énergétique",
    description: "Accompagner un énergéticien dans sa transition vers les énergies renouvelables, avec refonte des processus métiers et adaptation du SI.",
    contact: {
      name: "Marie Leclerc",
      role: "Directrice de la Transition Énergétique"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-yellow-200 text-yellow-800",
    domainId: "energie"
  },
  {
    id: "energie-optimisation",
    title: "Optimisation de la production énergétique",
    description: "Concevoir et déployer une solution de pilotage intelligent de la production énergétique basée sur des algorithmes prédictifs et l'IoT industriel.",
    contact: {
      name: "Nicolas Lambert",
      role: "Directeur Innovation"
    },
    difficulty: "Expert",
    difficultyColor: "bg-yellow-300 text-yellow-900",
    domainId: "energie"
  },
  
  // Secteur Public
  {
    id: "public-eadministration",
    title: "Mise en place d'un portail e-administration",
    description: "Piloter la création d'un portail de services numériques pour une administration publique, avec focus sur l'accessibilité et l'expérience utilisateur.",
    contact: {
      name: "Sylvie Moreau",
      role: "Directrice de la Modernisation"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-teal-100 text-teal-800",
    domainId: "secteur-public"
  },
  {
    id: "public-performance",
    title: "Optimisation de la performance des services publics",
    description: "Analyser et redéfinir les processus d'une administration pour améliorer la qualité de service et réduire les délais de traitement.",
    contact: {
      name: "Michel Bernard",
      role: "Directeur de la Performance"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-teal-200 text-teal-800",
    domainId: "secteur-public"
  },
  {
    id: "public-mutualisation",
    title: "Programme de mutualisation SI inter-administrations",
    description: "Conduire un vaste programme de mutualisation des systèmes d'information entre plusieurs organismes publics, avec impacts organisationnels majeurs.",
    contact: {
      name: "Philippe Durant",
      role: "Directeur Interministériel du Numérique"
    },
    difficulty: "Expert",
    difficultyColor: "bg-teal-300 text-teal-900",
    domainId: "secteur-public"
  },
  
  // Industrie & Manufacturing
  {
    id: "industrie-iot",
    title: "Déploiement IoT en milieu industriel",
    description: "Mettre en place une solution IoT pour la maintenance prédictive d'équipements industriels, avec intégration au système de GMAO existant.",
    contact: {
      name: "Antoine Girard",
      role: "Responsable Maintenance Industrielle"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-purple-100 text-purple-800",
    domainId: "industrie"
  },
  {
    id: "industrie-supply-chain",
    title: "Optimisation de la chaîne logistique",
    description: "Refondre les processus de la supply chain d'un acteur industriel pour réduire les délais et optimiser les stocks avec une approche lean.",
    contact: {
      name: "Julien Leroy",
      role: "Directeur Supply Chain"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-purple-200 text-purple-800",
    domainId: "industrie"
  },
  {
    id: "industrie-40",
    title: "Transformation Industrie 4.0",
    description: "Élaborer et déployer une feuille de route complète de transformation vers l'Industrie 4.0 pour un groupe industriel international.",
    contact: {
      name: "Claire Dubois",
      role: "Directrice de la Transformation Digitale"
    },
    difficulty: "Expert",
    difficultyColor: "bg-purple-300 text-purple-900",
    domainId: "industrie"
  },
  
  // Méthodologies & Outils
  {
    id: "methodo-agile",
    title: "Transformation Agile",
    description: "Accompagner une DSI dans sa transition vers les méthodes agiles, avec mise en place des outils et formation des équipes.",
    contact: {
      name: "Sarah Fischer",
      role: "Coach Agile"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-gray-100 text-gray-800",
    domainId: "methodologies"
  },
  {
    id: "methodo-pmo",
    title: "Mise en place d'un PMO",
    description: "Concevoir et déployer un Project Management Office efficace pour le suivi de portefeuille de projets dans une grande organisation.",
    contact: {
      name: "Olivier Martin",
      role: "Directeur des Projets"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-gray-200 text-gray-800",
    domainId: "methodologies"
  },
  {
    id: "methodo-hybride",
    title: "Méthodologie hybride pour grands programmes",
    description: "Élaborer une méthodologie sur mesure combinant approches prédictives et agiles pour gérer des programmes complexes multi-entités.",
    contact: {
      name: "François Renard",
      role: "Directeur des Programmes Stratégiques"
    },
    difficulty: "Expert",
    difficultyColor: "bg-gray-300 text-gray-900",
    domainId: "methodologies"
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
        content: "Bonjour !\n\nJe suis I AM CYBER, votre assistant virtuel dans le monde passionnant de la cybersécurité. Je suis là pour vous accompagner dans une expérience d'apprentissage immersive et interactive.\n\nComment puis-je vous appeler ?",
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
        content: `Merci ${firstName} ! Ravi de vous rencontrer. J'espère que vous allez bien aujourd'hui.\n\nNous allons explorer ensemble différents aspects de la cybersécurité. Veuillez choisir un domaine qui vous intéresse parmi les options suivantes :`,
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
  const handleSelectDomain = async (domainInput: CyberDomain | string) => {
    // Si on reçoit un objet domain, extraire l'id
    const domainId = typeof domainInput === 'string' ? domainInput : domainInput.id;
    const selectedDomain = initialDomains.find(d => d.id === domainId);
    if (!selectedDomain) return;
    
    setIsTyping(true);
    setScenario(prev => ({ ...prev, activeDomain: selectedDomain }));
    
    // Bot confirmation message
    // Obtenir le prénom extrait
    const firstName = extractFirstName(userName);
    
    const botConfirmation: ChatMessage = {
      id: uuidv4(),
      type: "bot",
      content: `**Excellent choix, ${firstName} !** Vous avez sélectionné la **${selectedDomain.name}**.\n\nJ'ai plusieurs scénarios de différents niveaux à vous proposer. Choisissez celui qui vous intéresse le plus :`,
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
  const handleSelectScenario = async (scenarioInput: CyberScenario | string) => {
    // Si on reçoit un objet scénario, extraire l'id
    const scenarioId = typeof scenarioInput === 'string' ? scenarioInput : scenarioInput.id;
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
    
    const botConfirmation: ChatMessage = {
      id: uuidv4(),
      type: "bot",
      content: `**Parfait, ${firstName} !** Vous avez sélectionné le scénario **${selectedScenario.title}**.\n\nVoici le contexte de ce scenario :`,
      timestamp: Date.now()
    };
    
    const scenarioContext: ChatMessage = {
      id: uuidv4(),
      type: "scenario-context",
      content: selectedScenario.description,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, botConfirmation, scenarioContext]);
    
    // Send the scenario selection to the server to generate initial email
    try {
      const data = await apiRequest<any>('/api/cyber/start-scenario', {
        method: 'POST',
        body: JSON.stringify({
          scenarioId,
          userName,
          config
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
        if (error instanceof Response || (error && typeof error === 'object' && 'json' in error)) {
          error.json().then(data => {
            console.log("Réponse serveur complète:", data);
            if (data.message) serverErrorMsg = data.message;
            if (data.model) modelUsed = data.model;
          }).catch(jsonError => console.error("Impossible de traiter la réponse JSON:", jsonError));
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
    }
    
    setIsTyping(false);
  };

  // Handler to send a message
  const handleSendMessage = async (messageText: string, endpoint = '/api/cyber/chat') => {
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
      const data = await apiRequest<any>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          message: messageText,
          userName,
          scenarioId: scenario.activeScenario?.id,
          config,
          chatHistory: relevantMessages,
          scenarioContacts: scenario.scenarioContacts // Transmettre la liste des interlocuteurs
        })
      });
      
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
        // Propriétés pour les sélecteurs
        selectedDomain: scenario.activeDomain,
        selectedScenario: scenario.activeScenario,
        // Gestionnaires d'événements
        setUserName: handleSetUserName,
        selectDomain: handleSelectDomain,
        selectScenario: handleSelectScenario,
        sendMessage: handleSendMessage,
        updateConfig: handleUpdateConfig,
        resetChat: handleResetChat,
        // Alias pour les composants AMOA
        onDomainSelect: handleSelectDomain,
        onScenarioSelect: handleSelectScenario
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
