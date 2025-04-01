import { useState, useRef, useEffect } from "react";
import { useChatContext } from "@/contexts/ChatContext";
import ChatMessage from "./ChatMessage";
import DomainSelection from "./DomainSelection";
import ScenarioSelection from "./ScenarioSelection";
import EmailMessage from "./EmailMessage";
import ContextBanner from "./ContextBanner";
import { Send, MessageSquare, UserCircle, RefreshCw, ChevronDown } from "lucide-react";

export default function ChatInterface() {
  const { 
    messages, 
    sendMessage, 
    isTyping,
    userName,
    resetChat
  } = useChatContext();
  
  const [inputMessage, setInputMessage] = useState("");
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Nous avons désactivé le défilement automatique pour donner à l'utilisateur le contrôle
  // de la barre de défilement. Un bouton de défilement manuel vers le bas est disponible.
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
  
  // Fonction pour faire défiler vers le bas manuellement
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Gestion des suggestions de messages basées sur le contexte actuel
  useEffect(() => {
    // Pas de suggestions avant d'avoir un nom d'utilisateur
    if (!userName) {
      setSuggestedMessages([]);
      return;
    }

    // Générer des suggestions basées sur le contexte de la conversation
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    if (messages.length === 1 && lastMessage.type === 'bot') {
      // Première interaction - suggestions pour se présenter
      setSuggestedMessages([
        `Bonjour, je m'appelle ${userName}. Je suis [votre rôle/fonction] avec une expérience de [X années] dans le domaine de la cybersécurité.`,
        `Bonjour, je suis ${userName}, [votre rôle/fonction]. J'ai des connaissances en cybersécurité et j'aimerais approfondir ce sujet.`,
        `Bonjour, je suis ${userName}. Je travaille dans [secteur d'activité] et je souhaite développer mes compétences en cybersécurité.`
      ]);
    } else if (messages.length > 1 && lastMessage.type === 'bot' && 
               (typeof lastMessage.content === 'string' && lastMessage.content.includes("mission"))) {
      // Après réception d'une mission
      setSuggestedMessages([
        "Je comprends la situation. Quelles sont les principales informations dont j'ai besoin pour résoudre ce problème ?",
        "Je vais m'occuper de ce problème. Pouvez-vous me préciser les contraintes ou délais à respecter ?",
        "Je vais analyser cette situation. Y a-t-il des ressources ou des personnes spécifiques que je devrais consulter ?"
      ]);
    } else {
      // Par défaut dans la conversation
      setSuggestedMessages([
        "Pourriez-vous me donner plus de contexte sur cette situation ?",
        "Je comprends. Quelles seraient les prochaines étapes à suivre ?",
        "Merci pour ces informations. Comment devrais-je aborder ce problème ?"
      ]);
    }
  }, [messages, userName]);

  // Focus input on load
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Gérer les entrées clavier, notamment Shift+Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter - ajouter une nouvelle ligne
        return; // Comportement par défaut (insertion d'un saut de ligne)
      } else {
        // Enter simple - envoyer le message
        e.preventDefault(); // Empêcher le saut de ligne
        if (inputMessage.trim()) {
          handleSubmit(e);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === "") return;
    
    const messageToSend = inputMessage;
    setInputMessage("");
    await sendMessage(messageToSend);
    
    // Lorsque l'utilisateur envoie un message, nous lui proposons de défiler vers le bas
    // sans forcer le défilement automatique
    setShowScrollButton(true);
  };
  
  // Fonction pour utiliser une suggestion
  const useSuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const renderMessageContent = (message: any) => {
    switch (message.type) {
      case 'domain-selection':
        return <DomainSelection />;
      case 'scenario-selection':
        return <ScenarioSelection />;
      case 'email':
        return <EmailMessage email={message.content} />;
      case 'user':
      case 'bot':
        return (
          <ChatMessage 
            type={message.type} 
            content={message.content as string} 
            contactName={message.contactName} 
            contactRole={message.contactRole}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full flex flex-col text-blue-50">
      {/* Bannière contextuelle et bouton réinitialisation */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-900/80 to-indigo-900/80 backdrop-blur-md border-b border-blue-700/30 w-full shadow-md">
        <div className="flex justify-end p-2">
          {userName && (
            <button 
              onClick={resetChat}
              className="flex items-center gap-2 text-sm bg-blue-900/50 hover:bg-blue-800/70 text-blue-100 py-2 px-4 rounded-lg transition-all duration-300 font-medium border border-blue-700/50 shadow-inner"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Nouvelle session</span>
            </button>
          )}
        </div>
        <ContextBanner />
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto py-4 sm:py-6 px-2 sm:px-4 relative scrollbar-cyber"
        ref={chatContainerRef}
        style={{ scrollBehavior: 'smooth', height: 'calc(100vh - 200px)' }}
      >
        <div className="w-full max-w-5xl mx-auto px-2 sm:px-6">
          {messages.map((message: any) => (
            <div key={message.id} className="mb-6 sm:mb-8 animate-fadeIn">
              {renderMessageContent(message)}
            </div>
          ))}
          
          {/* Indicateur de saisie */}
          {isTyping && (
            <div className="typing-indicator-container mt-3 sm:mt-4 ml-8 sm:ml-12 animate-pulse">
              <div className="typing-indicator-cyber">
                <div className="typing-dot-cyber" style={{"--dot-index": "0"} as React.CSSProperties}></div>
                <div className="typing-dot-cyber" style={{"--dot-index": "1"} as React.CSSProperties}></div>
                <div className="typing-dot-cyber" style={{"--dot-index": "2"} as React.CSSProperties}></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Bouton de défilement vers le bas */}
        {showScrollButton && (
          <button 
            onClick={scrollToBottom}
            className="fixed right-6 bottom-24 bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full shadow-lg z-20 text-white hover:from-blue-700 hover:to-indigo-700 animate-fadeIn transition-all"
            title="Défiler vers le bas"
            aria-label="Défiler vers le bas de la conversation"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Zone de suggestions de messages */}
      {suggestedMessages.length > 0 && (
        <div className="py-2 px-2 sm:px-4 bg-gradient-to-r from-blue-950/90 to-indigo-950/90 border-t border-blue-800/30">
          <div className="max-w-5xl mx-auto px-2 sm:px-6">
            <div className="flex flex-wrap gap-2">
              {suggestedMessages.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => useSuggestion(suggestion)}
                  className="text-sm bg-blue-800/50 hover:bg-blue-700/70 text-blue-100 py-2 px-3 rounded-lg transition-all duration-300 border border-blue-700/50 text-left flex-shrink min-w-0 max-w-full md:max-w-md overflow-hidden"
                >
                  <span className="line-clamp-1">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Zone de saisie */}
      <div className="py-3 sm:py-4 px-2 sm:px-4 bg-gradient-to-r from-blue-900/90 to-indigo-900/90 backdrop-blur-lg border-t border-blue-700/30 sticky bottom-0 shadow-lg">
        <div className="max-w-5xl mx-auto px-2 sm:px-6">
          <form className="flex items-start gap-2 sm:gap-3" onSubmit={handleSubmit}>
            <div className="relative flex-1 group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <textarea 
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                className="relative w-full py-2.5 sm:py-3.5 px-3 sm:px-4 pr-10 sm:pr-12 rounded-lg bg-gray-900/70 border border-blue-700/50 outline-none text-blue-50 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-blue-300/50 text-sm sm:text-base resize-none overflow-auto"
                placeholder="Tapez votre réponse... (Shift+Entrée pour aller à la ligne)"
                style={{ minHeight: "2.5rem", maxHeight: "8rem" }}
              />
              <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <span className="text-xs text-blue-400/60 hidden sm:inline">Shift+Entrée = nouvelle ligne</span>
              </div>
            </div>
            <button 
              type="submit" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 sm:p-4 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg disabled:shadow-none disabled:bg-blue-900/50 group"
              disabled={!inputMessage.trim()}
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}