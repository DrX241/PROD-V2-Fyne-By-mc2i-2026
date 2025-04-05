import React from "react";
import { BotMessageSquare, User } from "lucide-react";

interface ChatMessageProps {
  type: "user" | "bot";
  content: string;
  contactName?: string;
  contactRole?: string;
}

export default function ChatMessage({ type, content, contactName, contactRole }: ChatMessageProps) {
  // Fonction pour formater le contenu de manière plus professionnelle et concise
  const formatContent = () => {
    // Diviser le contenu en paragraphes
    const paragraphs = content.split('\n\n');
    
    return (
      <div className="space-y-3">
        {paragraphs.map((paragraph, idx) => {
          const trimmedParagraph = paragraph.trim();
          
          // Ignorer les paragraphes vides
          if (trimmedParagraph === '') return null;
          
          // Détection des listes (points ou tirets)
          if (paragraph.includes('\n') && (paragraph.includes('• ') || paragraph.includes('- '))) {
            const lines = paragraph.split('\n');
            const title = lines[0].trim().startsWith('•') || lines[0].trim().startsWith('-') 
              ? null 
              : lines.shift();
            
            // Formater les éléments de liste
            const listItems = lines
              .filter(line => line.trim())
              .map((line, i) => {
                const content = line.replace(/^[•-]\s*/, '').trim();
                if (!content) return null;
                
                return (
                  <li key={i} className="ml-1 text-white my-1">
                    {processStrongText(content)}
                  </li>
                );
              });
            
            return (
              <div key={idx} className="mb-1">
                {title && <p className="font-medium text-white mb-1">{processStrongText(title)}</p>}
                <ul className="list-disc pl-5 marker:text-blue-300 space-y-1">
                  {listItems}
                </ul>
              </div>
            );
          }
          
          // Mise en forme des paragraphes normaux
          return (
            <p key={idx} className="text-white">
              {processStrongText(trimmedParagraph)}
            </p>
          );
        })}
      </div>
    );
  };
  
  // Traitement du texte en gras (** **)
  const processStrongText = (text: string) => {
    if (!text.includes('**')) return text;
    
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-blue-200 font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Couleurs avec contraste optimal
  const avatarColor = type === "user" ? "from-indigo-600 to-blue-600" : "from-blue-700 to-indigo-800";
  
  // Message de l'utilisateur ou de l'assistant
  const messageBgColor = type === "user" 
    ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-indigo-500/50" 
    : "bg-gradient-to-r from-gray-900/80 to-blue-900/60 border-blue-700/50";

  return (
    <div className={`flex items-start gap-2 sm:gap-3 ${type === 'user' ? 'flex-row-reverse justify-start' : 'flex-row justify-start'} w-full`}>
      {/* Avatar */}
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center flex-shrink-0 shadow-glow-sm border border-blue-500/40`}>
        {type === "user" ? (
          <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        ) : (
          <BotMessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        )}
      </div>
      
      {/* Message content */}
      <div className={`${type === 'user' ? 'text-right' : 'text-left'} max-w-[85%] sm:max-w-[75%] rounded-lg ${messageBgColor} p-3 sm:p-4 border backdrop-blur-sm shadow-md`}>
        {/* Afficher les informations du contact pour les messages bot si disponibles */}
        {type === "bot" && contactName && contactRole && (
          <div className="mb-3 pb-2 border-b border-blue-700/40">
            <div className="font-bold text-blue-100 text-sm sm:text-base">{contactName}</div>
            <div className="text-[10px] sm:text-xs text-blue-200/90">{contactRole}</div>
          </div>
        )}
        
        <div className="text-white text-sm sm:text-base leading-relaxed">
          {formatContent()}
        </div>
      </div>
    </div>
  );
}
