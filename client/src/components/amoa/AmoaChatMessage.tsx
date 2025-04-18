import React from "react";
import { BotMessageSquare, User } from "lucide-react";

interface AmoaChatMessageProps {
  type: "user" | "bot" | "scenario-context";
  content: string;
  contactName?: string;
  contactRole?: string;
}

export default function AmoaChatMessage({ type, content, contactName, contactRole }: AmoaChatMessageProps) {
  // Fonction pour formater le contenu de manière plus professionnelle et concise
  const formatContent = () => {
    // Amélioration de la détection des listes - détecte aussi les listes avec numéros (1., 2., etc)
    const paragraphs = content.split('\n\n');
    
    // Traitement spécial pour les listes dans le texte (- ou • ou 1.)
    const processText = (text: string) => {
      // Détecte si le texte contient une liste
      if (text.includes('\n- ') || text.includes('\n• ') || /\n\d+\.\s/.test(text)) {
        // Diviser en lignes
        const lines = text.split('\n');
        const items: JSX.Element[] = [];
        let currentList: JSX.Element[] = [];
        let inList = false;
        let listType: 'ul' | 'ol' = 'ul';
        
        lines.forEach((line, i) => {
          // Ligne vide
          if (!line.trim()) {
            if (inList && currentList.length > 0) {
              // Terminer la liste actuelle
              items.push(
                listType === 'ul' 
                  ? <ul key={`ul-${i}`} className="list-disc pl-5 marker:text-[#006a9e] space-y-1">{currentList}</ul>
                  : <ol key={`ol-${i}`} className="list-decimal pl-5 marker:text-[#006a9e] space-y-1">{currentList}</ol>
              );
              currentList = [];
              inList = false;
            }
            return;
          }
          
          // Détecte si c'est un élément de liste
          const bulletMatch = line.trim().match(/^[•-]\s+(.+)$/);
          const numberMatch = line.trim().match(/^(\d+)\.\s+(.+)$/);
          
          if (bulletMatch || numberMatch) {
            // C'est un élément de liste
            const content = bulletMatch ? bulletMatch[1] : (numberMatch ? numberMatch[2] : '');
            
            // Si on n'était pas déjà dans une liste, ou si on change de type de liste
            const newListType = numberMatch ? 'ol' : 'ul';
            if (!inList || (inList && listType !== newListType)) {
              if (inList && currentList.length > 0) {
                // Terminer la liste précédente
                items.push(
                  listType === 'ul' 
                    ? <ul key={`ul-${i}`} className="list-disc pl-5 marker:text-[#006a9e] space-y-1">{currentList}</ul>
                    : <ol key={`ol-${i}`} className="list-decimal pl-5 marker:text-[#006a9e] space-y-1">{currentList}</ol>
                );
                currentList = [];
              }
              
              listType = newListType;
              inList = true;
            }
            
            // Ajouter l'élément à la liste courante
            currentList.push(
              <li key={i} className="ml-1 my-1 text-gray-800">
                {processStrongText(content)}
              </li>
            );
          } else {
            // Ce n'est pas un élément de liste
            if (inList && currentList.length > 0) {
              // Terminer la liste actuelle
              items.push(
                listType === 'ul' 
                  ? <ul key={`ul-${i}`} className="list-disc pl-5 marker:text-[#006a9e] space-y-1">{currentList}</ul>
                  : <ol key={`ol-${i}`} className="list-decimal pl-5 marker:text-[#006a9e] space-y-1">{currentList}</ol>
              );
              currentList = [];
              inList = false;
            }
            
            // Ajouter le paragraphe normal
            items.push(
              <p key={i} className="text-gray-800">
                {processStrongText(line)}
              </p>
            );
          }
        });
        
        // Terminer la dernière liste si nécessaire
        if (inList && currentList.length > 0) {
          items.push(
            listType === 'ul' 
              ? <ul key="ul-last" className="list-disc pl-5 marker:text-[#006a9e] space-y-1">{currentList}</ul>
              : <ol key="ol-last" className="list-decimal pl-5 marker:text-[#006a9e] space-y-1">{currentList}</ol>
          );
        }
        
        return <div className="space-y-2">{items}</div>;
      } else {
        // Texte normal sans liste
        return <p className="text-gray-800">{processStrongText(text)}</p>;
      }
    };
    
    // Traiter chaque paragraphe
    return (
      <div className="space-y-4">
        {paragraphs.map((paragraph, idx) => {
          const trimmedParagraph = paragraph.trim();
          if (!trimmedParagraph) return null;
          
          return <div key={idx}>{processText(trimmedParagraph)}</div>;
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
  let messageBgColor = "bg-blue-50 border-[#006a9e]/30"; // Fond bleu par défaut pour tous les messages PNJ/système
  if (type === "user") {
    messageBgColor = "bg-white border-gray-300"; // Fond blanc uniquement pour les messages du joueur
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