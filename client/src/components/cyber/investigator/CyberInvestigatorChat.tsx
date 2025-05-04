import React, { useState, useRef, useEffect } from 'react';
import { Send, Cpu, User, Info, X, Maximize, Minimize, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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
  initialContext = '',
  caseId = 'general',
  minimizable = true,
  onClose
}: CyberInvestigatorChatProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialisation du chat
  useEffect(() => {
    // Message initial de l'assistant
    const initialMessage: MessageType = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Bonjour, je suis votre assistant virtuel pour l'enquête cyber. ${
        initialContext 
          ? `\n\nContexte actuel : ${initialContext}`
          : "Je peux vous aider à comprendre les concepts de cybersécurité liés à l'investigation numérique, analyser des indices, et vous guider dans votre enquête."
      }`,
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
  }, [initialContext]);

  // Scroll automatique vers le bas lors de nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isMinimized]);

  // Envoi d'un message
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Identifiant unique pour le message
    const userMessageId = Date.now().toString();
    
    // Ajouter le message de l'utilisateur à la liste
    const userMessage: MessageType = {
      id: userMessageId,
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Appel à l'API pour obtenir une réponse
      const response = await axios.post('/api/cyber-investigator/chat', {
        message: input,
        caseId,
        history: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });
      
      // Ajouter la réponse de l'assistant à la liste
      const assistantMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.message || "Je n'ai pas pu traiter votre demande. Veuillez réessayer.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      // Message d'erreur en cas d'échec
      const errorMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Désolé, une erreur s'est produite lors de la communication avec le serveur. Veuillez réessayer plus tard.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Focus sur le champ de saisie après l'envoi
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Gestion de la touche Entrée pour envoyer un message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Reset du chat
  const resetChat = () => {
    // Message initial de l'assistant
    const initialMessage: MessageType = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Bonjour, je suis votre assistant virtuel pour l'enquête cyber. ${
        initialContext 
          ? `\n\nContexte actuel : ${initialContext}`
          : "Je peux vous aider à comprendre les concepts de cybersécurité liés à l'investigation numérique, analyser des indices, et vous guider dans votre enquête."
      }`,
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
  };

  return (
    <Card className={cn(
      "border border-indigo-500/30 bg-indigo-950/40 backdrop-blur-sm shadow-lg w-full overflow-hidden transition-all duration-300",
      isMinimized ? "h-14" : "h-[550px]",
      className
    )}>
      {/* En-tête du chat */}
      <CardHeader className="p-3 bg-indigo-900/60 border-b border-indigo-500/30 flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2 bg-indigo-700">
            <AvatarFallback>CI</AvatarFallback>
            <AvatarImage src="/assets/cyber-ai-avatar.png" alt="Cyber AI" />
          </Avatar>
          <div>
            <h3 className="text-sm font-medium text-white">Assistant d'investigation</h3>
            {!isMinimized && (
              <p className="text-xs text-indigo-200">Propulsé par IA</p>
            )}
          </div>
        </div>
        <div className="flex space-x-1">
          {minimizable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full bg-indigo-800/30 hover:bg-indigo-700/50 text-indigo-200"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize size={14} /> : <Minimize size={14} />}
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full bg-indigo-800/30 hover:bg-red-900/50 text-indigo-200"
              onClick={onClose}
            >
              <X size={14} />
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Corps du chat (messages) */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="p-0 overflow-y-auto h-[calc(100%-110px)]">
              <div className="flex flex-col p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex w-full",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg p-3",
                        message.role === "user"
                          ? "bg-indigo-700/50 text-white"
                          : "bg-indigo-900/30 border border-indigo-600/30 text-indigo-100"
                      )}
                    >
                      <div className="flex items-center mb-1">
                        {message.role === "assistant" ? (
                          <Cpu size={14} className="mr-1 text-indigo-400" />
                        ) : (
                          <User size={14} className="mr-1 text-indigo-300" />
                        )}
                        <span className="text-xs font-medium">
                          {message.role === "assistant" ? "Assistant IA" : "Vous"}
                        </span>
                        <span className="text-xs ml-2 opacity-50">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            {/* Pied de page (zone de saisie) */}
            <CardFooter className="p-3 border-t border-indigo-500/30 bg-indigo-900/20">
              <div className="flex w-full items-end space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-9 w-9 rounded-full border-indigo-500/30 bg-indigo-800/20 hover:bg-indigo-700/30 text-indigo-300"
                  onClick={resetChat}
                >
                  <RotateCcw size={15} />
                </Button>
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question..."
                  className="min-h-[40px] w-full resize-none rounded-xl border-indigo-500/30 bg-indigo-800/20 placeholder:text-indigo-400/50 focus-visible:ring-indigo-500/40 text-indigo-100"
                  rows={2}
                  style={{ maxHeight: '120px', minHeight: '40px' }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="shrink-0 h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Send size={15} className={isLoading ? "animate-pulse" : ""} />
                </Button>
              </div>
            </CardFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}