import React from "react";
import { User, MessageSquare } from "lucide-react";

interface ChatMessageProps {
  type: "user-chat" | "expert-chat";
  content: string;
  expertName?: string;
  expertRole?: string;
}

export default function ChatMessage({ type, content, expertName, expertRole }: ChatMessageProps) {
  // Convert line breaks to paragraph elements
  const formattedContent = content.split('\n').map((line, i) => {
    // If the line starts with a bullet point, make it a list item
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      return <li key={i} className="ml-5 text-white">{line.replace(/^[•-]\s*/, '')}</li>;
    }
    
    // If the line is empty, return a small spacing element
    if (line.trim() === '') {
      return <div key={i} className="h-2"></div>;
    }
    
    // Check if line contains strong text
    if (line.includes('**')) {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className={i > 0 ? "mt-3 text-white" : "text-white"}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    }
    
    return <p key={i} className={i > 0 ? "mt-3 text-white" : "text-white"}>{line}</p>;
  });

  const renderContent = () => {
    // If content has bullet points, wrap them in a ul
    if (content.includes('•') || content.includes('-')) {
      return (
        <div>
          {formattedContent.map((element, i) => {
            if (React.isValidElement(element) && element.type === 'li') {
              return <ul key={i} className="list-disc marker:text-white">{element}</ul>;
            }
            return element;
          })}
        </div>
      );
    }
    
    return formattedContent;
  };

  const avatarColor = type === "user-chat" ? "from-amber-500 to-amber-600" : "from-amber-700 to-amber-800";
  const messageBgColor = type === "user-chat" 
    ? "bg-gradient-to-r from-amber-600/20 to-amber-600/20 border-amber-500/30" 
    : "bg-gradient-to-r from-gray-900/50 to-amber-900/30 border-amber-700/30";

  return (
    <div className={`flex items-start gap-2 sm:gap-3 ${type === 'user-chat' ? 'flex-row-reverse justify-start' : 'flex-row justify-start'} w-full`}>
      {/* Avatar */}
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center flex-shrink-0 shadow-glow-sm border border-amber-500/30`}>
        {type === "user-chat" ? (
          <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        ) : (
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        )}
      </div>
      
      {/* Message content */}
      <div className={`${type === 'user-chat' ? 'text-right' : 'text-left'} max-w-[85%] sm:max-w-[75%] rounded-lg ${messageBgColor} p-3 sm:p-4 border backdrop-blur-sm shadow-md`}>
        {/* Afficher les informations de l'expert pour les messages expert si disponibles */}
        {type === "expert-chat" && expertName && expertRole && (
          <div className="mb-2 sm:mb-3 pb-2 border-b border-amber-700/30">
            <div className="font-bold text-white text-sm sm:text-base">{expertName}</div>
            <div className="text-[10px] sm:text-xs text-white/80">{expertRole}</div>
          </div>
        )}
        
        <div className={`prose prose-invert prose-sm max-w-none text-white text-sm sm:text-base`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}