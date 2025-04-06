import React from "react";
import { BotMessageSquare, User } from "lucide-react";

interface ChatMessageProps {
  type: "user" | "bot" | "scenario-context";
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
      <div className="space-y-2">
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
                  <li key={i} className="ml-1 my-1 text-gray-800">
                    {processStrongText(content)}
                  </li>
                );
              });
            
            return (
              <div key={idx} className="mb-1">
                {title && <p className="font-medium mb-1 text-gray-800">{processStrongText(title)}</p>}
                <ul className="list-disc pl-5 marker:text-[#006a9e] space-y-1">
                  {listItems}
                </ul>
              </div>
            );
          }
          
          // Mise en forme des paragraphes normaux
          return (
            <p key={idx} className="text-gray-800">
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
        return <strong key={i} className="text-[#006a9e] font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Couleurs avec contraste optimal
  const avatarColor = type === "user" ? "bg-[#006a9e]/90" : "bg-[#006a9e]";
  
  // Message de l'utilisateur ou de l'assistant
  let messageBgColor = "bg-white border-[#006a9e]/20";
  if (type === "user") {
    messageBgColor = "bg-gray-100 border-gray-300";
  } else if (type === "scenario-context") {
    messageBgColor = "bg-blue-50 border-[#006a9e]/30";
  }

  // Style spécial pour le contexte de scénario
  if (type === "scenario-context") {
    return (
      <div className="w-full mb-4 animate-fadeIn">
        <div className={`rounded-lg ${messageBgColor} p-4 sm:p-5 border shadow-sm mx-auto max-w-[90%]`}>
          {/* En-tête du contexte */}
          {contactName && contactRole && (
            <div className="mb-3 pb-2 border-b border-[#006a9e]/20 flex items-center">
              <div className={`w-8 h-8 rounded-full bg-[#006a9e] flex items-center justify-center mr-3`}>
                <BotMessageSquare className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-[#006a9e] text-sm sm:text-base">{contactName}</div>
                <div className="text-[10px] sm:text-xs text-gray-600">{contactRole}</div>
              </div>
            </div>
          )}
          
          <div className="text-sm sm:text-base leading-relaxed">
            {formatContent()}
          </div>
        </div>
      </div>
    );
  }

  // Rendu standard pour les messages utilisateur/bot
  return (
    <div className={`flex items-start gap-2 sm:gap-3 mb-4 ${type === 'user' ? 'flex-row-reverse justify-start' : 'flex-row justify-start'} w-full`}>
      {/* Avatar */}
      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0 shadow-sm border border-[#006a9e]/20`}>
        {type === "user" ? (
          <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        ) : (
          <BotMessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        )}
      </div>
      
      {/* Message content */}
      <div className={`${type === 'user' ? 'text-right' : 'text-left'} max-w-[85%] sm:max-w-[80%] rounded-lg ${messageBgColor} p-3 sm:p-4 border shadow-sm`}>
        {/* Afficher les informations du contact pour les messages bot si disponibles */}
        {type === "bot" && contactName && contactRole && (
          <div className="mb-2 pb-2 border-b border-[#006a9e]/10">
            <div className="font-bold text-[#006a9e] text-sm sm:text-base">{contactName}</div>
            <div className="text-[10px] sm:text-xs text-gray-600">{contactRole}</div>
          </div>
        )}
        
        <div className="text-sm sm:text-base leading-relaxed">
          {formatContent()}
        </div>
      </div>
    </div>
  );
}
