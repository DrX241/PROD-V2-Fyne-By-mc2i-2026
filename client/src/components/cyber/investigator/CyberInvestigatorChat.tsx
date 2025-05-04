import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Minimize2, Maximize2, Send, X, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/queryClient';

type MessageType = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
};

interface CyberInvestigatorChatProps {
  className?: string;
  initialContext?: string;
  caseId?: string;
  minimizable?: boolean;
  onClose?: () => void;
}

export default function CyberInvestigatorChat({
  className,
  initialContext,
  caseId = 'general',
  minimizable = true,
  onClose
}: CyberInvestigatorChatProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Récupération des informations du cas si un ID est fourni
  const { data: caseData } = useQuery({
    queryKey: ['cyber-investigator', 'case-info', caseId],
    queryFn: async () => {
      if (caseId === 'general') return null;
      return apiRequest<any>(`/api/cyber-investigator/case/${caseId}`, {
        method: 'GET'
      });
    },
    enabled: caseId !== 'general',
  });

  // Initialisation du chat avec un message de bienvenue
  useEffect(() => {
    // Message de bienvenue initial
    const initialMessage: MessageType = {
      id: 'welcome',
      role: 'assistant',
      content: caseId === 'general' 
        ? 'Bonjour, je suis votre assistant en investigation numérique. Je peux vous aider à comprendre les techniques, méthodologies et bonnes pratiques d\'investigation. Comment puis-je vous aider aujourd\'hui?'
        : `Bienvenue dans l'investigation "${caseData?.case?.title}". Je vous aiderai à analyser les preuves numériques et à résoudre ce cas. Que souhaitez-vous examiner en premier?`,
      timestamp: new Date()
    };

    setMessages([initialMessage]);
  }, [caseId, caseData]);

  // Envoi d'un message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Création du message utilisateur
    const userMessage: MessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    // Mise à jour de l'interface
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Appel API
      const response = await apiRequest<{ message: string, caseId: string }>(
        '/api/cyber-investigator/chat',
        {
          method: 'POST',
          body: {
            message: userMessage.content,
            caseId: caseId,
            history: messages
          }
        }
      );

      // Création du message assistant
      const assistantMessage: MessageType = {
        id: `response-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };

      // Mise à jour des messages
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      // Message d'erreur
      const errorMessage: MessageType = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Je suis désolé, une erreur est survenue lors du traitement de votre message. Veuillez réessayer.',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll automatique vers le dernier message
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (isMinimized) {
      setHasNewMessages(true);
    }
  }, [messages, isMinimized]);

  // Focus sur l'input quand le chat est maximisé
  useEffect(() => {
    if (!isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMinimized]);

  // Handler pour l'envoi via touche Entrée
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Style conditionnel pour le chat minimisé/maximisé
  const chatContainerClasses = cn(
    "transition-all duration-300 ease-in-out",
    className,
    isMinimized 
      ? "h-14 rounded-t-lg w-64" 
      : "w-full md:w-[450px] h-[500px] rounded-t-lg"
  );

  return (
    <Card className={chatContainerClasses}>
      {/* Header du chat */}
      <CardHeader className="flex flex-row items-center justify-between p-3 bg-blue-600 text-white rounded-t-lg">
        <CardTitle 
          className="text-md font-medium cursor-pointer"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          {caseId === 'general' ? 'Assistant Cyber Investigateur' : caseData?.case?.title || 'Investigation'}
          {isMinimized && hasNewMessages && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              Nouveau
            </span>
          )}
        </CardTitle>
        <div className="flex items-center space-x-1">
          {minimizable && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 w-7 p-0 text-white hover:bg-blue-700"
              onClick={() => {
                setIsMinimized(!isMinimized);
                setHasNewMessages(false);
              }}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
          )}
          {onClose && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-7 w-7 p-0 text-white hover:bg-blue-700"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Contenu du chat (visible uniquement en mode maximisé) */}
      {!isMinimized && (
        <>
          <ScrollArea 
            className="flex-1 p-4 h-[400px] overflow-y-auto bg-gray-50 dark:bg-gray-900"
            ref={scrollAreaRef}
          >
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={cn(
                    "flex",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div className="flex items-start max-w-[80%]">
                    {message.role === 'assistant' && (
                      <Avatar className="mr-2 mt-0.5">
                        <AvatarFallback className="bg-blue-100 text-blue-600">AI</AvatarFallback>
                        <AvatarImage src="/ai-avatar.png" />
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "p-3 rounded-lg text-sm",
                        message.role === 'user' 
                          ? "bg-blue-600 text-white rounded-br-none" 
                          : "bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-bl-none"
                      )}
                    >
                      {message.content}
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="ml-2 mt-0.5">
                        <AvatarFallback className="bg-green-100 text-green-600">U</AvatarFallback>
                        <AvatarImage src="/user-avatar.png" />
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messageEndRef} />

              {/* Indicateur de chargement */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center max-w-[80%]">
                    <Avatar className="mr-2">
                      <AvatarFallback className="bg-blue-100 text-blue-600">AI</AvatarFallback>
                      <AvatarImage src="/ai-avatar.png" />
                    </Avatar>
                    <div className="p-3 rounded-lg text-sm bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center space-x-2">
                      <Spinner size="sm" />
                      <span>Réflexion en cours...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <CardContent className="p-3 border-t bg-white dark:bg-gray-950">
            <div className="flex space-x-2">
              <Input
                placeholder="Posez une question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                ref={inputRef}
                className="flex-grow"
                disabled={isLoading}
              />
              <Button 
                size="icon"
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </>
      )}

      {/* Bouton de scroll vers le bas (uniquement affiché quand nécessaire) */}
      {!isMinimized && messages.length > 3 && (
        <Button
          size="icon"
          className="absolute right-3 bottom-16 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 shadow-md"
          onClick={() => messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ArrowDown className="h-4 w-4 text-white" />
        </Button>
      )}
    </Card>
  );
}