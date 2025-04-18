import { useState, useRef, useEffect } from "react";
import { Send, RefreshCw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface AmoaChatInterfaceProps {
  apiEndpoint: string;
  initialMessages: any[];
  onMessagesUpdate?: (messages: any[]) => void;
}

export default function AmoaChatInterface({ apiEndpoint, initialMessages, onMessagesUpdate }: AmoaChatInterfaceProps) {
  const [messages, setMessages] = useState<any[]>(initialMessages || []);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Gestion du défilement
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
    
    // Ajouter le message de l'utilisateur à l'interface
    const userMessage = {
      role: "user",
      content: trimmedMessage
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Indiquer que l'IA est en train de répondre
    setIsTyping(true);
    
    try {
      // Appel API pour obtenir la réponse de l'IA
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedMessage,
          chatHistory: updatedMessages
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Mettre à jour les messages avec la réponse de l'IA
        setMessages(data.data.updatedChatHistory);
      } else {
        // Gérer l'erreur API
        toast({
          variant: "destructive",
          title: "Erreur",
          description: data.error || "Une erreur est survenue lors de la communication avec l'IA."
        });
        
        // Ajouter un message d'erreur dans le chat
        setMessages([
          ...updatedMessages,
          {
            role: "assistant",
            content: "Désolé, une erreur est survenue lors du traitement de votre message. Veuillez réessayer."
          }
        ]);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de communiquer avec le serveur. Veuillez réessayer."
      });
      
      // Ajouter un message d'erreur dans le chat
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Désolé, la connexion au service a échoué. Veuillez réessayer ultérieurement."
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };
  
  // Gérer la soumission du formulaire avec Entrée (sauf avec Shift+Entrée)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] rounded-lg bg-gradient-to-br from-blue-50 to-slate-100 shadow-lg border border-blue-200">
      {/* Zone des messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 mb-1"
      >
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
      </div>
    </div>
  );
}