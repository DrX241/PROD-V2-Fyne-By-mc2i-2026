import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { apiRequest } from "@/lib/queryClient";

// Types basiques pour le chat
export type ChatMessageType = "user" | "bot" | "system";

export interface ChatMessage {
  id: string;
  type: ChatMessageType;
  content: string;
  timestamp: number;
}

export interface ChatContextType {
  messages: ChatMessage[];
  isTyping: boolean;
  userName: string;
  sendMessage: (message: string) => void;
  setUserName: (name: string) => void;
}

// Fonction utilitaire pour extraire le prénom
const extractFirstName = (input: string): string => {
  if (!input) return "";
  
  // Nettoyer l'entrée
  let cleanedInput = input.trim().toLowerCase();
  
  // Liste des patterns d'introduction à supprimer
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
  
  // Supprimer toutes les formules d'introduction
  for (const pattern of introPatterns) {
    cleanedInput = cleanedInput.replace(pattern, '');
  }
  
  // Supprimer les caractères de ponctuation et espaces excessifs
  cleanedInput = cleanedInput.replace(/[,.;:!?]/g, '').trim();
  
  // Extraire le premier mot (prénom)
  const firstWord = cleanedInput.split(/\s+/)[0];
  
  // Mettre la première lettre en majuscule
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
};

// Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
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
    
    // Add user's name message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      type: "user",
      content: name,
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
        content: `Merci ${firstName} ! Ravi de vous rencontrer. J'espère que vous allez bien aujourd'hui.\n\nNous allons explorer ensemble différents aspects de la cybersécurité.`,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  // Handler to send a message
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      type: "user",
      content: message,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Simulate bot response (à remplacer par une vraie intégration API)
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: uuidv4(),
        type: "bot",
        content: `Je comprends votre message. Le module de cybersécurité est actuellement en cours de reconstruction pour offrir une meilleure expérience d'apprentissage.`,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        isTyping,
        userName,
        sendMessage,
        setUserName: handleSetUserName
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