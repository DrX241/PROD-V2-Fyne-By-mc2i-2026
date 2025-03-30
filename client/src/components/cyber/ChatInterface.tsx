import { useState, useRef, useEffect } from "react";
import { useChatContext } from "@/contexts/ChatContext";
import ChatMessage from "./ChatMessage";
import DomainSelection from "./DomainSelection";
import ScenarioSelection from "./ScenarioSelection";
import EmailMessage from "./EmailMessage";
import NpcMessage from "./NpcMessage";
import ChatRoom from "./ChatRoom"; 
import ContactSelector from "./ContactSelector";
import { Send, Paperclip, Sparkles, BotMessageSquare, UserCircle } from "lucide-react";

export default function ChatInterface() {
  const { 
    messages, 
    sendMessage, 
    sendMessageToChatRoom,
    isTyping,
    userName,
    scenario
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
    
    // Si une salle de discussion est active, envoyer le message à la salle
    if (scenario.chatRoomActive) {
      await sendMessageToChatRoom(messageToSend);
    } else {
      // Sinon, envoyer le message normalement
      await sendMessage(messageToSend);
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
      case 'npc':
        return <NpcMessage content={message.content} sender={message.sender} />;
      case 'chat-room':
        return <ChatRoom content={message.content} />;
      case 'user':
      case 'bot':
        return (
          <div className="flex items-start gap-3">
            {message.type === 'bot' ? (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                <BotMessageSquare className="h-4 w-4 text-blue-600" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                <UserCircle className="h-5 w-5 text-gray-600" />
              </div>
            )}
            <ChatMessage type={message.type} content={message.content as string} />
          </div>
        );
      default:
        return null;
    }
  };

  // Récupération des métriques de l'utilisateur
  const { reputation, budget, successRate } = scenario.metrics;
  const hasActiveScenario = !!scenario.activeScenario;
  
  return (
    <div className="chat-container">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">CyberGuide</h1>
            <p className="text-xs text-gray-500">Formation cybersécurité interactive</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasActiveScenario && (
            <div className="flex items-center gap-2 text-sm">
              <div className="px-2 py-1 bg-green-100 text-green-800 rounded-md">
                Réputation: {reputation}/100
              </div>
              <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
                Budget: {budget}€
              </div>
              <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md">
                Réussite: {successRate}%
              </div>
            </div>
          )}
          {userName && <div className="text-sm text-gray-600">Bonjour, {userName}</div>}
        </div>
      </div>
      
      {/* Contact Selector - Only shown when a scenario is active */}
      {hasActiveScenario && scenario.activeContacts && scenario.activeContacts.length > 0 && (
        <div className="bg-white border-b border-gray-100 px-4 py-2">
          <ContactSelector />
        </div>
      )}
      
      {/* Chat messages */}
      <div 
        className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50" 
        ref={chatContainerRef}
      >
        <div className="message-container">
          {messages.map((message: any) => (
            <div key={message.id} className="message-wrapper">
              {renderMessageContent(message)}
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                <BotMessageSquare className="h-4 w-4 text-blue-600" />
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
      <div className="chat-input-container">
        <div className="max-w-3xl mx-auto">
          <form className="flex items-center gap-2" onSubmit={handleSubmit}>
            <div className="relative flex-1">
              <input 
                type="text"
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="chat-input"
                placeholder="Tapez votre réponse..."
              />
              <button 
                type="button" 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <Paperclip className="h-5 w-5" />
              </button>
            </div>
            <button 
              type="submit" 
              className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 flex items-center justify-center transition-colors shadow-sm"
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
