import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Types pour les messages et conversations
export type MessageRole = 'user' | 'system' | 'assistant';

export interface Message {
  role: MessageRole;
  content: string;
  timestamp?: number;
}

export interface ChatContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  lastResponseTime: number | null;
  setLastResponseTime: (time: number | null) => void;
}

// Création du contexte
const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

// Provider pour le contexte
export function ChatProvider({ children }: ChatProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponseTime, setLastResponseTime] = useState<number | null>(null);

  // Fonction pour ajouter un message à la conversation
  const addMessage = useCallback((message: Message) => {
    // Ajouter un timestamp si non fourni
    const messageWithTimestamp = {
      ...message,
      timestamp: message.timestamp || Date.now(),
    };
    
    setMessages((prevMessages) => [...prevMessages, messageWithTimestamp]);
  }, []);

  // Fonction pour vider tous les messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        addMessage,
        clearMessages,
        isLoading,
        setIsLoading,
        error,
        setError,
        lastResponseTime,
        setLastResponseTime,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat doit être utilisé à l'intérieur d'un ChatProvider");
  }
  return context;
}