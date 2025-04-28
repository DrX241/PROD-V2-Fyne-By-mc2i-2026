import { useState, useRef, useEffect } from "react";
import { useChatContext } from "@/contexts/ChatContext";
import ChatMessage from "./ChatMessage";
import DomainSelection from "./DomainSelection";
import ScenarioSelection from "./ScenarioSelection";
import EmailMessage from "./EmailMessage";
import ContextBanner from "./ContextBanner";
import { Send, RefreshCw, ChevronDown } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

interface ChatInterfaceProps {
  onMessagesUpdate?: (messages: any[]) => void;
}

export default function ChatInterface({ onMessagesUpdate }: ChatInterfaceProps) {
  const { 
    messages, 
    sendMessage, 
    isTyping,
    userName,
    resetChat,
    scenarioState,
    setScenarioState
  } = useChatContext();

  const [inputMessage, setInputMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    if (!chatContainerRef.current) return;

    const handleScroll = () => {
      if (!chatContainerRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);
    };

    handleScroll();

    chatContainerRef.current.addEventListener('scroll', handleScroll);

    return () => {
      chatContainerRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, [messages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (onMessagesUpdate) {
      onMessagesUpdate(messages);
    }
  }, [messages, onMessagesUpdate]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return; 
      } else {
        e.preventDefault(); 
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
    const currentStage = scenarioState.currentStage || 1;
    try {
      await sendMessage({message: messageToSend, stage: currentStage});
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: uuidv4(),
        type: 'error',
        content: `Une erreur est survenue: ${error instanceof Error ? error.message : 'An unknown error occurred'}`,
        timestamp: Date.now()
      }]);
    }
    setShowScrollButton(true);
  };

  const renderMessageContent = (message: any) => {
    switch (message.type) {
      case 'domain-selection':
        return <DomainSelection />;
      case 'scenario-selection':
        return <ScenarioSelection />;
      case 'email':
        return <EmailMessage email={message.content} />;
      case 'scenario-context':
        return (
          <ChatMessage 
            type={message.type} 
            content={message.content as string}
            contactName="Système" 
            contactRole="Contexte de mission"
            userName={userName}
          />
        );
      case 'user':
      case 'bot':
        return (
          <ChatMessage 
            type={message.type} 
            content={message.content as string} 
            contactName={message.contactName} 
            contactRole={message.contactRole}
            userName={userName}
            isIAMCYBERIntervention={message.isIAMCYBERIntervention}
            iamCyberContent={message.iamCyberContent}
            contactContent={message.contactContent}
          />
        );
      case 'error':
        return <ChatMessage type="error" content={message.content} contactName="Error" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full flex flex-col text-blue-50">
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
                className="relative w-full py-2.5 sm:py-3.5 px-3 sm:px-4 pr-10 sm:pr-12 rounded-lg bg-white border border-blue-700/50 outline-none text-black focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-gray-500/80 text-sm sm:text-base resize-none overflow-auto"
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