import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { apiRequest } from "@/lib/queryClient";
import {
  ChatContextType,
  ChatMessage,
  CyberDomain,
  CyberScenario,
  AIConfig,
  ScenarioState,
  EmailMessageContent,
  ScenarioContact,
  NpcMessageContent,
  ChatRoomContent,
  UserMetrics
} from "@shared/schema";

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

// Initial scenarios data - Avec le nouveau format
const initialScenarios: CyberScenario[] = [
  // Formation et sensibilisation
  {
    id: "phishing-simulation",
    title: "Simulation d'attaque phishing",
    description: "Vous devez préparer et exécuter une campagne de simulation de phishing pour évaluer et sensibiliser les employés.",
    contacts: [
      {
        id: "contact-1",
        name: "Marion Lopez",
        role: "Senior Partner et Directrice Marketing, Communication et RSE",
        department: "Marketing",
        email: "marion.lopez@mc2i.fr"
      },
      {
        id: "contact-2",
        name: "Vincent Terrier",
        role: "Senior Partner, Directeur Financier",
        department: "Finance",
        email: "vincent.terrier@mc2i.fr"
      },
      {
        id: "contact-3",
        name: "Eddy MISSONI",
        role: "Chef de Projet & Expert IA",
        department: "IT",
        email: "eddy.missoni@mc2i.fr"
      }
    ],
    primaryContact: "contact-1",
    difficulty: "Débutant",
    difficultyColor: "bg-green-100 text-green-700",
    domainId: "formation-sensibilisation"
  },
  {
    id: "security-training",
    title: "Programme de formation à la cybersécurité",
    description: "Élaboration d'un programme de formation complet pour les différents niveaux de l'entreprise.",
    contacts: [
      {
        id: "contact-4",
        name: "Isabelle Dubacq",
        role: "Senior Partner, Directrice des Ressources Humaines",
        department: "RH",
        email: "isabelle.dubacq@mc2i.fr"
      },
      {
        id: "contact-5",
        name: "Olivier Hervo",
        role: "Directeur Général",
        department: "Direction",
        email: "olivier.hervo@mc2i.fr"
      },
      {
        id: "contact-6",
        name: "Neil LEVIN",
        role: "Expert cybersécurité & CFO",
        department: "Finance",
        email: "neil.levin@mc2i.fr"
      }
    ],
    primaryContact: "contact-4",
    difficulty: "Intermédiaire",
    difficultyColor: "bg-orange-100 text-orange-700",
    domainId: "formation-sensibilisation"
  },
  
  // OSINT
  {
    id: "osint-investigation",
    title: "Investigation d'une menace potentielle",
    description: "Utilisez l'OSINT pour enquêter sur une menace potentielle visant votre organisation.",
    contacts: [
      {
        id: "contact-7",
        name: "Neil LEVIN",
        role: "Expert cybersécurité & CFO",
        department: "Finance",
        email: "neil.levin@mc2i.fr"
      },
      {
        id: "contact-8",
        name: "Vincent Pascal",
        role: "Directeur Général Adjoint et Directeur du Développement",
        department: "Développement",
        email: "vincent.pascal@mc2i.fr"
      },
      {
        id: "contact-9",
        name: "Marion Lopez",
        role: "Senior Partner et Directrice Marketing, Communication et RSE",
        department: "Communication",
        email: "marion.lopez@mc2i.fr"
      }
    ],
    primaryContact: "contact-7",
    difficulty: "Intermédiaire",
    difficultyColor: "bg-orange-100 text-orange-700",
    domainId: "osint"
  },
  {
    id: "digital-footprint",
    title: "Analyse de l'empreinte numérique",
    description: "Évaluez l'empreinte numérique de votre organisation pour identifier les vulnérabilités exposées publiquement.",
    contacts: [
      {
        id: "contact-10",
        name: "Yousra SAIDANI",
        role: "Experte Cybersécurité & CFO",
        department: "Finance",
        email: "yousra.saidani@mc2i.fr"
      },
      {
        id: "contact-11",
        name: "Eddy MISSONI IDEMBI",
        role: "Expert Data / IA & CTO",
        department: "IT",
        email: "eddy.missoni.idembi@mc2i.fr"
      },
      {
        id: "contact-12",
        name: "Fares SAYADI",
        role: "Spécialiste Data / IA",
        department: "IT",
        email: "fares.sayadi@mc2i.fr"
      }
    ],
    primaryContact: "contact-10",
    difficulty: "Expert",
    difficultyColor: "bg-red-100 text-red-700",
    domainId: "osint"
  },
  
  // Conformité cyber
  {
    id: "gdpr-compliance",
    title: "Mise en conformité RGPD",
    description: "Vous devez évaluer et améliorer la conformité RGPD de votre organisation suite à des changements réglementaires.",
    contacts: [
      {
        id: "contact-13",
        name: "Vincent Terrier",
        role: "Senior Partner, Directeur Financier",
        department: "Finance",
        email: "vincent.terrier@mc2i.fr"
      },
      {
        id: "contact-14",
        name: "Isabelle Dubacq",
        role: "Senior Partner, Directrice des Ressources Humaines",
        department: "RH",
        email: "isabelle.dubacq@mc2i.fr"
      },
      {
        id: "contact-15",
        name: "Lorenzo Bertola",
        role: "Directeur Général Adjoint et Directeur du pôle BFA",
        department: "BFA",
        email: "lorenzo.bertola@mc2i.fr"
      }
    ],
    primaryContact: "contact-13",
    difficulty: "Intermédiaire",
    difficultyColor: "bg-orange-100 text-orange-700",
    domainId: "conformite-cyber"
  },
  {
    id: "iso-certification",
    title: "Préparation à la certification ISO 27001",
    description: "Vous préparez votre organisation à une certification ISO 27001 et devez identifier les écarts à combler.",
    contacts: [
      {
        id: "contact-16",
        name: "Vincent Pascal",
        role: "Directeur Général Adjoint et Directeur du Développement",
        department: "Développement",
        email: "vincent.pascal@mc2i.fr"
      },
      {
        id: "contact-17",
        name: "Neil LEVIN",
        role: "Expert cybersécurité & CFO",
        department: "Finance",
        email: "neil.levin@mc2i.fr"
      },
      {
        id: "contact-18",
        name: "Anthony Frescal",
        role: "Directeur Général Adjoint et Directeur du pôle ENERGIES & UTILITIES",
        department: "Énergie",
        email: "anthony.frescal@mc2i.fr"
      }
    ],
    primaryContact: "contact-16",
    difficulty: "Expert",
    difficultyColor: "bg-red-100 text-red-700",
    domainId: "conformite-cyber"
  },
  
  // Stratégie cyber
  {
    id: "cyber-strategy",
    title: "Élaboration de la stratégie cybersécurité",
    description: "Développez une stratégie de cybersécurité complète pour les 3 prochaines années.",
    contacts: [
      {
        id: "contact-19",
        name: "Arnaud Gauthier",
        role: "Président",
        department: "Direction",
        email: "arnaud.gauthier@mc2i.fr"
      },
      {
        id: "contact-20",
        name: "Olivier Hervo",
        role: "Directeur Général",
        department: "Direction",
        email: "olivier.hervo@mc2i.fr"
      },
      {
        id: "contact-21",
        name: "Yousra SAIDANI",
        role: "Experte Cybersécurité & CFO",
        department: "Finance",
        email: "yousra.saidani@mc2i.fr"
      }
    ],
    primaryContact: "contact-19",
    difficulty: "Expert",
    difficultyColor: "bg-red-100 text-red-700",
    domainId: "strategie-cyber"
  }
];

// Initial configuration
const initialConfig: AIConfig = {
  difficultyLevel: "Intermédiaire",
  responseStyle: "Professionnel",
  temperature: 0.7,
  maxTokens: 2000
};

// Initial metrics
const initialMetrics: UserMetrics = {
  reputation: 50,
  budget: 10000,
  successRate: 0,
  responseQuality: 0,
  level: 1,
  completedScenarios: []
};

// Initial scenario state
const initialScenarioState: ScenarioState = {
  metrics: initialMetrics,
  chatRoomActive: false
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
    
    setMessages((prev) => [...prev, userMessage]);
    
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
      
      setMessages((prev) => [...prev, botResponse, domainSelection]);
      setIsTyping(false);
    }, 1000);
  };

  // Handler to select a domain
  const handleSelectDomain = async (domainId: string) => {
    const selectedDomain = initialDomains.find(d => d.id === domainId);
    if (!selectedDomain) return;
    
    setIsTyping(true);
    setScenario((prev) => ({ ...prev, activeDomain: selectedDomain }));
    
    // Bot confirmation message
    const botConfirmation: ChatMessage = {
      id: uuidv4(),
      type: "bot",
      content: `Excellent choix, ${userName} ! Vous avez sélectionné la ${selectedDomain.name}.\n\nJ'ai deux scénarios intéressants à vous proposer. Choisissez celui qui vous intéresse le plus :`,
      timestamp: Date.now()
    };
    
    // Add scenario selection component
    const scenarioSelection: ChatMessage = {
      id: uuidv4(),
      type: "scenario-selection",
      content: "",
      timestamp: Date.now()
    };
    
    setMessages((prev) => [...prev, botConfirmation, scenarioSelection]);
    setIsTyping(false);
  };

  // Handler to select a scenario
  const handleSelectScenario = async (scenarioId: string) => {
    const selectedScenario = initialScenarios.find(s => s.id === scenarioId);
    if (!selectedScenario) return;

    const primaryContactId = selectedScenario.primaryContact;
    const primaryContact = selectedScenario.contacts.find(c => c.id === primaryContactId);
    
    setIsTyping(true);
    setScenario((prev) => ({ 
      ...prev, 
      activeScenario: selectedScenario,
      activeContacts: selectedScenario.contacts,
      currentContactId: primaryContactId
    }));
    
    // Bot confirmation message
    const botConfirmation: ChatMessage = {
      id: uuidv4(),
      type: "bot",
      content: `Parfait ${userName} ! Vous avez choisi le scénario "${selectedScenario.title}".\n\nJe vais maintenant vous placer dans cette situation d'apprentissage. Vous recevrez bientôt un e-mail de ${primaryContact?.name}, votre interlocuteur principal pour ce scénario.\n\nPréparez-vous à analyser la situation et à proposer des solutions !`,
      timestamp: Date.now()
    };
    
    setMessages((prev) => [...prev, botConfirmation]);
    
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
      
      setMessages((prev) => [...prev, emailMessage]);
    } catch (error) {
      console.error('Error starting scenario:', error);
      
      // Fallback message if there's an error
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        type: "bot",
        content: "Je suis désolé, une erreur s'est produite lors de la génération du scénario. Veuillez réessayer.",
        timestamp: Date.now()
      };
      
      setMessages((prev) => [...prev, errorMessage]);
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
    
    setMessages((prev) => [...prev, userMessage]);
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
        chatHistory: relevantMessages
      });
      
      const data = await response.json();
      
      // If response contains an email, add it as an email message
      if (data.type === 'email') {
        const emailMessage: ChatMessage = {
          id: uuidv4(),
          type: "email",
          content: data.content as EmailMessageContent,
          timestamp: Date.now()
        };
        
        setMessages((prev) => [...prev, emailMessage]);
      } else {
        // Otherwise add as a regular bot message
        const botResponse: ChatMessage = {
          id: uuidv4(),
          type: "bot",
          content: data.content as string,
          timestamp: Date.now()
        };
        
        setMessages((prev) => [...prev, botResponse]);
        
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
            
            setMessages((prev) => [...prev, resetMessage]);
            
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
      
      setMessages((prev) => [...prev, errorMessage]);
    }
    
    setIsTyping(false);
  };

  // Handler to send a message to a specific contact
  const handleSendMessageToContact = async (messageText: string, contactId: string) => {
    if (!messageText.trim() || !contactId) return;
    
    const activeContacts = scenario.activeContacts;
    if (!activeContacts) return;
    
    const contact = activeContacts.find(c => c.id === contactId);
    if (!contact) return;
    
    // Set this contact as current
    setScenario((prev) => ({
      ...prev,
      currentContactId: contactId
    }));
    
    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      type: "user",
      content: messageText,
      timestamp: Date.now()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      // Get recent chat history for context
      const relevantMessages = messages
        .filter(msg => msg.type === 'user' || msg.type === 'npc')
        .slice(-10);
      
      // Send to API
      const response = await apiRequest('POST', '/api/cyber/contact-chat', {
        message: messageText,
        userName,
        scenarioId: scenario.activeScenario?.id,
        contactId,
        config,
        chatHistory: relevantMessages
      });
      
      const data = await response.json();
      
      // Create NPC message
      const npcContent: NpcMessageContent = {
        contactId,
        text: data.content
      };
      
      const npcMessage: ChatMessage = {
        id: uuidv4(),
        type: "npc",
        content: npcContent,
        timestamp: Date.now(),
        sender: contact
      };
      
      setMessages((prev) => [...prev, npcMessage]);
      
      // Update metrics if provided
      if (data.metrics) {
        handleUpdateMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error sending message to contact:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        type: "bot",
        content: "Je suis désolé, une erreur s'est produite lors de la communication avec ce contact. Veuillez réessayer.",
        timestamp: Date.now()
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    }
    
    setIsTyping(false);
  };

  // Handler to send a message to a chat room
  const handleSendMessageToChatRoom = async (messageText: string) => {
    if (!messageText.trim() || !scenario.chatRoomActive) return;
    
    const activeContacts = scenario.activeContacts;
    if (!activeContacts) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      type: "user",
      content: messageText,
      timestamp: Date.now()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      // Find the most recent chat room message for context
      const lastChatRoomMessage = [...messages]
        .reverse()
        .find(msg => msg.type === 'chat-room');
      
      let chatRoomContent: ChatRoomContent;
      
      if (lastChatRoomMessage && typeof lastChatRoomMessage.content !== 'string') {
        // Cast to ChatRoomContent (we know it's this type since we filtered by type)
        chatRoomContent = lastChatRoomMessage.content as ChatRoomContent;
        
        // Add user message to the chat room
        chatRoomContent.messages.push({
          contactId: 'user',
          text: messageText,
          timestamp: Date.now()
        });
      } else {
        // Create new chat room if none exists
        chatRoomContent = {
          participants: activeContacts,
          messages: [{
            contactId: 'user',
            text: messageText,
            timestamp: Date.now()
          }]
        };
      }
      
      // Send to API
      const response = await apiRequest('POST', '/api/cyber/chatroom', {
        message: messageText,
        userName,
        scenarioId: scenario.activeScenario?.id,
        participants: activeContacts.map(c => c.id),
        config,
        chatHistory: chatRoomContent.messages.slice(-10)
      });
      
      const data = await response.json();
      
      // Add responses from contacts to chat room
      for (const response of data.responses) {
        chatRoomContent.messages.push({
          contactId: response.contactId,
          text: response.content,
          timestamp: Date.now() + chatRoomContent.messages.length * 100 // Stagger timestamps
        });
      }
      
      // Create new chat room message
      const chatRoomMessage: ChatMessage = {
        id: uuidv4(),
        type: "chat-room",
        content: chatRoomContent,
        timestamp: Date.now()
      };
      
      setMessages((prev) => {
        // Replace previous chat room message if it exists
        if (lastChatRoomMessage) {
          return prev.filter(msg => msg.id !== lastChatRoomMessage.id).concat(chatRoomMessage);
        }
        return [...prev, chatRoomMessage];
      });
      
      // Update metrics if provided
      if (data.metrics) {
        handleUpdateMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error sending message to chat room:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        type: "bot",
        content: "Je suis désolé, une erreur s'est produite lors de la communication dans la salle de discussion. Veuillez réessayer.",
        timestamp: Date.now()
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    }
    
    setIsTyping(false);
  };

  // Handler to update metrics
  const handleUpdateMetrics = (newMetrics: Partial<UserMetrics>) => {
    setScenario((prev) => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        ...newMetrics
      }
    }));
  };

  // Handler to activate chat room
  const handleActivateChatRoom = (participantIds: string[]) => {
    if (!scenario.activeContacts) return;
    
    const participants = scenario.activeContacts.filter(c => 
      participantIds.includes(c.id)
    );
    
    if (participants.length === 0) return;
    
    setScenario((prev) => ({
      ...prev,
      chatRoomActive: true
    }));
    
    // Create initial chat room message
    const chatRoomContent: ChatRoomContent = {
      participants,
      messages: [{
        contactId: 'system',
        text: "Bienvenue dans la salle de discussion. Vous pouvez maintenant échanger avec tous les participants.",
        timestamp: Date.now()
      }]
    };
    
    const chatRoomMessage: ChatMessage = {
      id: uuidv4(),
      type: "chat-room",
      content: chatRoomContent,
      timestamp: Date.now()
    };
    
    setMessages((prev) => [...prev, chatRoomMessage]);
  };

  // Handler to deactivate chat room
  const handleDeactivateChatRoom = () => {
    setScenario((prev) => ({
      ...prev,
      chatRoomActive: false
    }));
    
    // Add message about leaving the chat room
    const infoMessage: ChatMessage = {
      id: uuidv4(),
      type: "bot",
      content: "Vous avez quitté la salle de discussion. Vous pouvez maintenant communiquer individuellement avec les différents contacts.",
      timestamp: Date.now()
    };
    
    setMessages((prev) => [...prev, infoMessage]);
  };

  // Handler to update configuration
  const handleUpdateConfig = (newConfig: Partial<AIConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
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
        sendMessageToContact: handleSendMessageToContact,
        sendMessageToChatRoom: handleSendMessageToChatRoom,
        updateConfig: handleUpdateConfig,
        updateMetrics: handleUpdateMetrics,
        activateChatRoom: handleActivateChatRoom,
        deactivateChatRoom: handleDeactivateChatRoom,
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