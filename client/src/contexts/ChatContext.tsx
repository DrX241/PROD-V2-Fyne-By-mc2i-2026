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
  ScenarioContact
} from "../../I_AM_CYBER/types";

// Initial domains data
const initialDomains: CyberDomain[] = [
  {
    id: "network-security",
    name: "Sécurité des réseaux",
    description: "Protection de l'infrastructure réseau, détection d'intrusion, VPN, pare-feu",
    icon: "ri-global-line",
    iconBgColor: "bg-primary-100",
    iconColor: "text-primary-600"
  },
  {
    id: "vulnerability-management",
    name: "Gestion des vulnérabilités",
    description: "Identification et correction des failles de sécurité, tests d'intrusion",
    icon: "ri-bug-line",
    iconBgColor: "bg-secondary-100",
    iconColor: "text-secondary-600"
  },
  {
    id: "data-security",
    name: "Sécurité des données",
    description: "Chiffrement, confidentialité, classification des données, RGPD",
    icon: "ri-lock-password-line",
    iconBgColor: "bg-neutral-100",
    iconColor: "text-neutral-600"
  }
];

// Initial scenarios data
const initialScenarios: CyberScenario[] = [
  {
    id: "network-intrusion",
    title: "Analyse d'une tentative d'intrusion",
    description: "Vous êtes responsable sécurité et devez analyser une possible intrusion détectée par les systèmes d'alerte.",
    contact: {
      name: "Neil LEVIN",
      role: "Expert cybersécurité & CFO"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-orange-100 text-orange-700",
    domainId: "network-security"
  },
  {
    id: "firewall-config",
    title: "Configuration d'un pare-feu nouvelle génération",
    description: "Suite à une mise à jour de l'infrastructure, vous devez établir une nouvelle politique de sécurité réseau.",
    contact: {
      name: "Yousra SAIDANI",
      role: "Experte Cybersécurité & CFO"
    },
    difficulty: "Débutant",
    difficultyColor: "bg-green-100 text-green-700",
    domainId: "network-security"
  },
  {
    id: "vuln-scanning",
    title: "Audit de vulnérabilités sur un système critique",
    description: "Vous êtes responsable d'un audit de vulnérabilités sur un système critique de l'entreprise.",
    contact: {
      name: "Lorenzo Bertola",
      role: "Directeur Général Adjoint et Directeur du pôle BFA"
    },
    difficulty: "Expert",
    difficultyColor: "bg-red-100 text-red-700",
    domainId: "vulnerability-management"
  },
  {
    id: "data-breach",
    title: "Gestion d'une fuite de données",
    description: "Un incident de sécurité a causé une fuite de données sensibles. Vous devez gérer la situation.",
    contact: {
      name: "Marion Lopez",
      role: "Senior Partner et Directrice Marketing, Communication et RSE"
    },
    difficulty: "Intermédiaire",
    difficultyColor: "bg-orange-100 text-orange-700",
    domainId: "data-security"
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
      content: `**Excellent choix, ${userName} !** Vous avez sélectionné la **${selectedDomain.name}**.\n\nJ'ai deux scénarios intéressants à vous proposer. Choisissez celui qui vous intéresse le plus :`,
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
      content: `**Parfait ${userName} !** Vous avez choisi le scénario "${selectedScenario.title}".\n\nJe vais maintenant vous placer dans cette situation d'apprentissage. Vous recevrez bientôt un e-mail de ${selectedScenario.contact.name}, votre interlocuteur pour ce scénario.\n\nPréparez-vous à analyser la situation et à proposer des solutions !`,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, botConfirmation]);
    
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
        scenarioContact: scenario.contact,
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
        
        setMessages(prev => [...prev, emailMessage]);
      } else {
        // Otherwise add as a regular bot message
        const botResponse: ChatMessage = {
          id: uuidv4(),
          type: "bot",
          content: data.content as string,
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, botResponse]);
        
        // Check if the scenario should be reset based on the API response
        if (data.resetScenario) {
          // Créer un message avec un minuteur de 10 secondes
          const timerStart = Date.now();
          const totalTimeMs = 10000; // 10 secondes
          
          // Message initial du minuteur
          const timerMessage: ChatMessage = {
            id: uuidv4(),
            type: "bot",
            content: `Le scénario va être réinitialisé dans 10 secondes...`,
            timestamp: Date.now()
          };
          
          setMessages(prev => [...prev, timerMessage]);
          
          // Mettre à jour le minuteur chaque seconde
          const timerInterval = setInterval(() => {
            const elapsedMs = Date.now() - timerStart;
            const remainingSec = Math.max(0, Math.ceil((totalTimeMs - elapsedMs) / 1000));
            
            // Mettre à jour le message du minuteur
            setMessages(prev => {
              const newMessages = [...prev];
              const timerIndex = newMessages.findIndex(msg => msg.id === timerMessage.id);
              
              if (timerIndex !== -1) {
                newMessages[timerIndex] = {
                  ...timerMessage,
                  content: `Le scénario va être réinitialisé dans ${remainingSec} secondes...`
                };
              }
              
              return newMessages;
            });
            
            // Si le minuteur est terminé, arrêter l'intervalle et réinitialiser
            if (remainingSec <= 0) {
              clearInterval(timerInterval);
              
              // Réinitialiser le chat
              setTimeout(() => {
                handleResetChat();
              }, 500);
            }
          }, 1000);
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
