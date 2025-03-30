import { useState, useRef, useEffect } from "react";
import { useChatContext } from "@/contexts/ChatContext";
import ChatMessage from "./ChatMessage";
import DomainSelection from "./DomainSelection";
import ScenarioSelection from "./ScenarioSelection";
import EmailMessage from "./EmailMessage";
import ContextBanner from "./ContextBanner";
import { Send, Paperclip, BotMessageSquare, UserCircle, RefreshCw } from "lucide-react";

export default function ChatInterface() {
  const { 
    messages, 
    sendMessage, 
    isTyping,
    userName,
    resetChat
  } = useChatContext();
  
  const [inputMessage, setInputMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === "") return;
    
    const messageToSend = inputMessage;
    setInputMessage("");
    await sendMessage(messageToSend);
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
          <div className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
            {message.type === 'bot' ? (
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-1">
                {message.contactName ? (
                  <span className="text-primary font-medium text-sm">
                    {message.contactName.charAt(0)}
                  </span>
                ) : (
                  <BotMessageSquare className="h-4 w-4 text-primary" />
                )}
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                <UserCircle className="h-5 w-5 text-gray-600" />
              </div>
            )}
            <ChatMessage 
              type={message.type} 
              content={message.content as string} 
              contactName={message.contactName} 
              contactRole={message.contactRole}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Bannière contextuelle et bouton réinitialisation */}
      <div className="sticky top-0 z-10 bg-gray-50">
        <div className="flex justify-end p-2">
          {userName && (
            <button 
              onClick={resetChat}
              className="flex items-center gap-2 text-sm bg-primary/10 hover:bg-primary/15 text-primary py-2 px-4 rounded-lg transition-colors font-medium"
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
        className="flex-1 overflow-y-auto py-4 px-2" 
        ref={chatContainerRef}
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="max-w-4xl mx-auto px-4">
          {messages.map((message: any) => (
            <div key={message.id} className="mb-6">
              {renderMessageContent(message)}
            </div>
          ))}
          
          {/* Indicateur de saisie */}
          {isTyping && (
            <div className="flex items-start gap-3 w-full">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-1">
                <BotMessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center">
                <div className="typing-indicator">
                  <div className="typing-dot" style={{"--dot-index": "0"} as React.CSSProperties}></div>
                  <div className="typing-dot" style={{"--dot-index": "1"} as React.CSSProperties}></div>
                  <div className="typing-dot" style={{"--dot-index": "2"} as React.CSSProperties}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone de saisie */}
      <div className="py-3 px-2 border-t border-gray-100 bg-white sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4">
          <form className="flex items-center gap-3" onSubmit={handleSubmit}>
            <div className="relative flex-1">
              <input 
                type="text"
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="w-full py-3 px-4 pr-12 rounded-lg border border-gray-200 outline-none text-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Tapez votre réponse..."
              />
              <button 
                type="button" 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <Paperclip className="h-5 w-5" />
              </button>
            </div>
            <button 
              type="submit" 
              className="bg-primary text-white p-3.5 rounded-full hover:bg-primary/90 flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              disabled={!inputMessage.trim()}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}