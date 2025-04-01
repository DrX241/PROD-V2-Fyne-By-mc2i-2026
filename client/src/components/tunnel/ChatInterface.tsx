import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, ChevronDown, Loader2, ArrowLeft } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

// Interface de l'expert
interface TunnelExpert {
  name: string;
  role: string;
  expertise: string;
  background?: string;
}

interface ChatMessage {
  id: string;
  type: 'user-chat' | 'expert-chat';
  content: string;
  expertName?: string;
  expertRole?: string;
  timestamp: number;
}

interface ChatInterfaceProps {
  sessionId: string;
  currentExpert: TunnelExpert;
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  onBackClick: () => void;
  isLoading: boolean;
}

export default function ChatInterface({
  sessionId,
  currentExpert,
  messages,
  onSendMessage,
  onBackClick,
  isLoading
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Détection de la position de défilement pour montrer/cacher le bouton
  useEffect(() => {
    if (!chatContainerRef.current) return;
    
    const handleScroll = () => {
      if (!chatContainerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);
    };
    
    // Vérifier la position initiale
    handleScroll();
    
    // Ajouter un écouteur de défilement
    chatContainerRef.current.addEventListener('scroll', handleScroll);
    
    return () => {
      chatContainerRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentExpert]);

  // Fonction pour faire défiler vers le bas manuellement
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    try {
      await onSendMessage(inputMessage);
      setInputMessage("");
      
      // Faire défiler vers le bas après l'envoi d'un message
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* En-tête avec informations sur l'expert */}
      <Card className="mb-4 border-amber-500/20 bg-amber-50/5">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBackClick}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-100/10 -ml-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            <CardTitle className="text-amber-600 text-base font-medium">
              Discussion avec {currentExpert.name}
            </CardTitle>
          </div>
          <div className="mt-1 text-sm text-muted-foreground text-center">
            {currentExpert.role} - Expert en {currentExpert.expertise}
          </div>
        </CardHeader>
      </Card>

      {/* Zone de conversation */}
      <div 
        className="flex-1 overflow-y-auto py-4 mb-4 rounded-lg bg-black/10 border border-gray-800/30"
        ref={chatContainerRef}
        style={{ scrollBehavior: 'smooth', minHeight: '300px' }}
      >
        <div className="w-full px-4">
          {messages.length === 0 ? (
            <div className="text-center p-6 text-gray-400">
              <p>Commencez à discuter avec {currentExpert.name}</p>
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={`mb-4 ${message.type === 'user-chat' ? 'text-right' : ''}`}
              >
                <div 
                  className={`
                    inline-block max-w-[85%] rounded-xl p-3 
                    ${message.type === 'user-chat' 
                      ? 'bg-amber-600/20 text-white ml-auto' 
                      : 'bg-gray-700/40 text-gray-100 mr-auto'
                    }
                  `}
                >
                  {message.type === 'expert-chat' && (
                    <div className="text-xs text-amber-400/80 mb-1">
                      {message.expertName || currentExpert.name}
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Indicateur de chargement */}
          {isLoading && (
            <div className="flex items-center mb-4 bg-gray-700/30 p-3 rounded-xl w-max">
              <Loader2 className="h-4 w-4 text-amber-500 animate-spin mr-2" />
              <span className="text-sm text-gray-300">
                {currentExpert.name} est en train d'écrire...
              </span>
            </div>
          )}
        </div>
        
        {/* Bouton de défilement */}
        {showScrollButton && (
          <Button 
            size="sm"
            variant="secondary"
            className="fixed right-8 bottom-32 bg-amber-600/90 text-white hover:bg-amber-700 shadow-lg"
            onClick={scrollToBottom}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Zone de saisie */}
      <div className="mt-auto">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            placeholder={`Posez une question à ${currentExpert.name}...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[80px] bg-black/20 border-gray-700/30 focus:border-amber-500/50 resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-amber-600 hover:bg-amber-700 text-white self-end h-10"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}