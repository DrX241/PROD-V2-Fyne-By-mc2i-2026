import { useState, useRef, useEffect } from "react";
import { useChatContext } from "@/contexts/ChatContext";
import ChatMessage from "./ChatMessage";
import DomainSelection from "./DomainSelection";
import ScenarioSelection from "./ScenarioSelection";
import EmailMessage from "./EmailMessage";
import { Send } from "lucide-react";
import { Paperclip } from "lucide-react";

export default function ChatInterface() {
  const { 
    messages, 
    sendMessage, 
    isTyping
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
        return <ChatMessage type={message.type} content={message.content as string} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat messages */}
      <div 
        className="flex-1 overflow-y-auto" 
        ref={chatContainerRef}
      >
        <div className="message-container">
          {messages.map((message) => (
            <div key={message.id} className="message-wrapper">
              {renderMessageContent(message)}
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="chat-message bot flex items-center p-4 mt-2">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <form className="flex items-center gap-2" onSubmit={handleSubmit}>
            <div className="relative flex-1">
              <input 
                type="text"
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="w-full py-3 px-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
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
              className="bg-primary-600 text-white p-3 rounded-lg hover:bg-primary-700 flex items-center justify-center"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
