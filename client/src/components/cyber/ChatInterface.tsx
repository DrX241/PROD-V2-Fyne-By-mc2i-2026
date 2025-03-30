import { useState, useRef, useEffect } from "react";
import { useChatContext } from "@/contexts/ChatContext";
import ChatMessage from "./ChatMessage";
import DomainSelection from "./DomainSelection";
import ScenarioSelection from "./ScenarioSelection";
import EmailMessage from "./EmailMessage";
import ContextBanner from "./ContextBanner";
import { Send, Paperclip, Sparkles, BotMessageSquare, UserCircle, RefreshCw } from "lucide-react";

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
          <div className="flex items-start gap-3">
            {message.type === 'bot' ? (
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                {message.contactName ? (
                  <span className="text-primary font-medium text-sm">
                    {message.contactName.charAt(0)}
                  </span>
                ) : (
                  <BotMessageSquare className="h-4 w-4 text-primary" />
                )}
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
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
    <div className="chat-container">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-5 sticky top-0 z-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2 rounded-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">CyberGuide</h1>
            <p className="text-xs text-gray-500 mt-0.5">Formation cybersécurité interactive</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
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
      </div>
      
      {/* Bandeau contextuel */}
      <ContextBanner />
      
      {/* Chat messages */}
      <div 
        className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 w-full" 
        ref={chatContainerRef}
      >
        <div className="message-container w-full py-4">
          {messages.map((message: any) => (
            <div key={message.id} className="message-wrapper w-full">
              {renderMessageContent(message)}
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start gap-3 w-full max-w-4xl mx-auto">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                <BotMessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div className="chat-message bot flex items-center p-3">
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

      {/* Chat input */}
      <div className="chat-input-container w-full">
        <div className="max-w-4xl mx-auto w-full">
          <form className="flex items-center gap-3 w-full" onSubmit={handleSubmit}>
            <div className="relative flex-1 w-full">
              <input 
                type="text"
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="chat-input w-full"
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
              className="bg-primary text-white p-3.5 rounded-full hover:bg-primary/90 flex items-center justify-center transition-colors shadow-sm flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
