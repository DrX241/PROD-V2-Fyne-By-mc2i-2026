import { useState, useRef, useEffect } from "react";
import { useChatContext } from "@/contexts/ChatContext";
import { Send, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AmoaChatInterfaceProps {
  onMessagesUpdate?: (messages: any[]) => void;
}

export default function AmoaChatInterface({ onMessagesUpdate }: AmoaChatInterfaceProps) {
  const { 
    messages, 
    sendMessage, 
    isTyping,
    userName,
    resetChat
  } = useChatContext();
  
  const [inputMessage, setInputMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Nous avons désactivé le défilement automatique pour donner à l'utilisateur le contrôle
  // de la barre de défilement. Un bouton de défilement manuel vers le bas est disponible.
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Mise à jour des messages vers le composant parent
  useEffect(() => {
    if (onMessagesUpdate) {
      onMessagesUpdate(messages);
    }
  }, [messages, onMessagesUpdate]);
  
  // Détection de la position de défilement pour montrer/cacher le bouton de défilement
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
  }, []);
  
  // Défiler automatiquement vers le bas lorsqu'un nouveau message est ajouté
  useEffect(() => {
    if (chatContainerRef.current && !showScrollButton) {
      const { scrollHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({
        top: scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, showScrollButton]);
  
  // Fonction pour scroller vers le bas manuellement
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({
        top: scrollHeight,
        behavior: 'smooth'
      });
      setShowScrollButton(false);
    }
  };
  
  // Gérer le redimensionnement automatique de la zone de texte
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);
  
  // Envoyer un message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;
    
    const trimmedMessage = inputMessage.trim();
    setInputMessage("");
    
    // Utiliser le sendMessage du contexte
    sendMessage(trimmedMessage);
  };
  
  // Gérer la soumission du formulaire avec Entrée (sauf avec Shift+Entrée)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Fonction pour redémarrer la session en cours
  const handleReset = () => {
    resetChat();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] rounded-lg bg-gradient-to-br from-blue-50 to-slate-100 shadow-lg border border-blue-200">
      {/* Zone des messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 mb-1"
      >
        {messages.length === 0 ? (
          <div className="space-y-8 py-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 sm:flex sm:items-start">
              <div className="sm:flex-1">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Assistant AMOA Intelligent
                </h3>
                <p className="text-sm text-blue-600">
                  Je suis votre assistant conversationnel AMOA, spécialisé dans l'assistance à maîtrise d'ouvrage.
                  Je peux répondre à vos questions sur les problématiques AMOA, vous aider avec vos projets, ou discuter des meilleures pratiques.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`max-w-3xl p-3 rounded-lg ${
                    message.role === "user" 
                      ? "bg-blue-500 text-white rounded-br-none" 
                      : "bg-white border border-gray-200 shadow-sm rounded-bl-none"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            
            {/* Indicateur de frappe */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-3xl p-3 rounded-lg bg-white border border-gray-200 shadow-sm rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-150"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-300"></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Bouton de défilement vers le bas */}
            {showScrollButton && (
              <div className="absolute bottom-24 right-8">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full shadow-md bg-white hover:bg-gray-100"
                  onClick={scrollToBottom}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Barre de saisie */}
      <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tapez votre message ici..."
          className="flex-1 min-h-[50px] max-h-[200px] resize-none focus-visible:ring-blue-400"
          rows={1}
        />
        <Button 
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isTyping}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Send className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          title="Redémarrer la conversation"
          className="border-blue-200 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}