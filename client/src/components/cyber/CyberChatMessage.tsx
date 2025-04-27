import React from "react";
import { BotMessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface CyberChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  };
}

export default function CyberChatMessage({ message }: CyberChatMessageProps) {
  // Détermine si c'est un message utilisateur ou IA
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  
  // Formater le contenu avec un support pour le markdown basique
  const formatContent = (content: string) => {
    // Gestion des paragraphes
    const paragraphs = content.split('\n\n');
    
    return (
      <div className="space-y-4">
        {paragraphs.map((paragraph, idx) => {
          const trimmedParagraph = paragraph.trim();
          if (!trimmedParagraph) return null;
          
          // Vérifier si c'est une liste
          if (trimmedParagraph.includes('\n- ') || trimmedParagraph.includes('\n* ') || trimmedParagraph.includes('\n• ')) {
            const lines = trimmedParagraph.split('\n');
            const listItems = lines.filter(line => 
              line.trim().startsWith('- ') || 
              line.trim().startsWith('* ') || 
              line.trim().startsWith('• ')
            ).map((line, i) => (
              <li key={i} className="ml-1 my-1 text-black">
                {line.trim().replace(/^[-*•]\s+/, '')}
              </li>
            ));
            
            if (listItems.length > 0) {
              return (
                <ul key={idx} className="list-disc pl-5 space-y-1">
                  {listItems}
                </ul>
              );
            }
          }
          
          // Vérifier si c'est une liste numérotée
          if (/\n\d+\.\s/.test(trimmedParagraph)) {
            const lines = trimmedParagraph.split('\n');
            const listItems = lines.filter(line => 
              /^\d+\.\s/.test(line.trim())
            ).map((line, i) => (
              <li key={i} className="ml-1 my-1 text-black">
                {line.trim().replace(/^\d+\.\s+/, '')}
              </li>
            ));
            
            if (listItems.length > 0) {
              return (
                <ol key={idx} className="list-decimal pl-5 space-y-1">
                  {listItems}
                </ol>
              );
            }
          }
          
          // Si c'est un bloc de code
          if (trimmedParagraph.startsWith('```') && trimmedParagraph.endsWith('```')) {
            const codeContent = trimmedParagraph.slice(3, -3);
            return (
              <pre key={idx} className="bg-gray-800 text-white p-3 rounded overflow-x-auto">
                <code>{codeContent}</code>
              </pre>
            );
          }
          
          // Texte normal
          return <p key={idx} className="text-black">{trimmedParagraph}</p>;
        })}
      </div>
    );
  };
  
  return (
    <div 
      className={cn(
        "flex items-start gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div 
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
          isUser 
            ? "bg-blue-600 text-white" 
            : isSystem 
              ? "bg-gray-700 text-white" 
              : "bg-cyan-600 text-white"
        )}
      >
        {isUser ? (
          <User className="h-5 w-5" />
        ) : (
          <BotMessageSquare className="h-5 w-5" />
        )}
      </div>
      
      {/* Message content */}
      <div 
        className={cn(
          "max-w-[80%] rounded-lg p-4 shadow-sm",
          isUser 
            ? "bg-white border border-gray-300 text-black" 
            : isSystem 
              ? "bg-gray-100 border border-gray-300 text-black" 
              : "bg-cyan-50 border border-cyan-200 text-black"
        )}
      >
        {formatContent(message.content)}
        
        {/* Timestamp */}
        <div className="text-xs text-gray-500 mt-2">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}