import React from "react";
import { BotMessageSquare, User } from "lucide-react";

interface ChatMessageProps {
  type: "user" | "bot";
  content: string;
  contactName?: string;
  contactRole?: string;
}

export default function ChatMessage({ type, content, contactName, contactRole }: ChatMessageProps) {
  // Convert line breaks to paragraph elements
  const formattedContent = content.split('\n').map((line, i) => {
    // If the line starts with a bullet point, make it a list item
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      return <li key={i} className="ml-5 text-blue-100">{line.replace(/^[•-]\s*/, '')}</li>;
    }
    
    // If the line is empty, return a small spacing element
    if (line.trim() === '') {
      return <div key={i} className="h-2"></div>;
    }
    
    // Check if line contains strong text
    if (line.includes('**')) {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className={i > 0 ? "mt-3" : ""}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="text-blue-200 font-semibold">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    }
    
    return <p key={i} className={i > 0 ? "mt-3" : ""}>{line}</p>;
  });

  const renderContent = () => {
    // If content has bullet points, wrap them in a ul
    if (content.includes('•') || content.includes('-')) {
      return (
        <div>
          {formattedContent.map((element, i) => {
            if (React.isValidElement(element) && element.type === 'li') {
              return <ul key={i} className="list-disc marker:text-blue-400">{element}</ul>;
            }
            return element;
          })}
        </div>
      );
    }
    
    return formattedContent;
  };

  const avatarColor = type === "user" ? "from-indigo-600 to-blue-600" : "from-blue-700 to-indigo-800";
  const messageBgColor = type === "user" 
    ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-indigo-500/30" 
    : "bg-gradient-to-r from-gray-900/50 to-blue-900/30 border-blue-700/30";

  return (
    <div className={`flex items-start gap-3 ${type === 'user' ? 'flex-row-reverse justify-start' : 'flex-row justify-start'} w-full`}>
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center flex-shrink-0 shadow-glow-sm border border-blue-500/30`}>
        {type === "user" ? (
          <User className="h-5 w-5 text-blue-100" />
        ) : (
          <BotMessageSquare className="h-5 w-5 text-blue-200" />
        )}
      </div>
      
      {/* Message content */}
      <div className={`${type === 'user' ? 'text-right' : 'text-left'} max-w-[75%] rounded-lg ${messageBgColor} p-4 border backdrop-blur-sm shadow-md`}>
        {/* Afficher les informations du contact pour les messages bot si disponibles */}
        {type === "bot" && contactName && contactRole && (
          <div className="mb-3 pb-2 border-b border-blue-700/30">
            <div className="font-bold text-blue-200">{contactName}</div>
            <div className="text-xs text-blue-300/80">{contactRole}</div>
          </div>
        )}
        
        <div className={`prose prose-invert prose-sm max-w-none ${type === "user" ? "text-blue-50" : "text-blue-100"}`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
