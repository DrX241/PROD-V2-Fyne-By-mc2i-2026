import React from "react";
import { BotMessageSquare, User, Zap } from "lucide-react";
import { CrisisDecisionContent, BinaryDecision, TeamFeedback } from "@shared/types/cyber";
import DecisionChoices from "./DecisionChoices";
import BinaryDecisionMessage from "./BinaryDecisionMessage";
import TeamFeedbackMessage from "./TeamFeedbackMessage";
import { useChatContext } from "@/contexts/ChatContext";
import { v4 as uuidv4 } from 'uuid';

// Formate les montants de budget pour une cohérence visuelle
const formatBudgetAmounts = (content: React.ReactNode): React.ReactNode => {
  if (typeof content !== 'string') return content;
  
  // Recherche les motifs de budget (nombres suivis de €, k€, K€, etc.)
  const budgetRegex = /(\d[\d\s]*[\d.,]*\s*(?:€|k€|K€|euros|EUR|M€))/g;
  
  if (!budgetRegex.test(content)) return content;
  
  const parts = content.split(budgetRegex);
  return parts.map((part, i) => {
    if (budgetRegex.test(part)) {
      // Formatage cohérent du montant de budget
      return <span key={i} className="font-semibold text-[#006a9e]">{part}</span>;
    }
    return part;
  });
};

interface ChatMessageProps {
  type: "user" | "bot" | "scenario-context" | "decision-choices" | "binary-decision";
  content: string | CrisisDecisionContent | BinaryDecision | TeamFeedback;
  contactName?: string;
  contactRole?: string;
  userName?: string; // Ajouter le nom de l'utilisateur pour le formatage du prénom
  isIAMCYBERIntervention?: boolean; // Indique si c'est une intervention du système I AM CYBER
  iamCyberContent?: string; // Contenu spécifique de l'intervention I AM CYBER
  contactContent?: string; // Contenu de la partie contact après l'intervention
}

export default function ChatMessage({ 
  type, 
  content, 
  contactName, 
  contactRole, 
  userName,
  isIAMCYBERIntervention,
  iamCyberContent,
  contactContent 
}: ChatMessageProps) {
  const { 
    sendMessage, 
    messages, 
    setUserName: setContextUserName, 
    userName: contextUserName, 
    userRole, 
    scenario, 
    currentStage, 
    resetChat
  } = useChatContext();
  
  // États locaux pour gérer le traitement des décisions
  const [isTyping, setIsTyping] = React.useState(false);
  
  // Fonction utilitaire pour ajouter un message à la liste
  const setMessages = (updater: (prev: any[]) => any[]) => {
    // Cette fonction n'est pas directement exposée par le contexte, 
    // mais nous pouvons simuler son comportement via sendMessage
    // pour les messages utilisateurs, ou manipuler directement les messages
    // via le contexte pour d'autres cas.
    // Dans cette implémentation, nous utilisons simplement la fonction de
    // l'appelant directement, car nous ne modifions pas l'état local.
    // Le state réel est géré dans le contexte
  };
  
  // Handler pour les choix de décision
  const handleDecisionChoice = (optionId: string) => {
    if (type === 'decision-choices' && typeof content !== 'string') {
      const decisionContent = content as CrisisDecisionContent;
      const selectedOption = decisionContent.options.find(opt => opt.id === optionId);
      
      if (selectedOption) {
        // Nous allons simplement envoyer un message formaté pour montrer le choix
        // et le backend se chargera de traiter cela correctement
        // Le format aidera le backend à détecter qu'il s'agit d'une décision
        sendMessage(`#decision_choice#${decisionContent.id}#${optionId}#${selectedOption.text}`);
      }
    }
  };
  // Fonction pour formater correctement le prénom (première lettre en majuscule, reste en minuscules)
  const formatFirstName = (text: string, name?: string) => {
    if (!text || !name || typeof text !== 'string' || typeof name !== 'string') {
      return text;
    }
    
    try {
      // Obtenir le prénom formaté correctement (première lettre majuscule, reste minuscule)
      const nameParts = name.split(' ');
      const formattedName = nameParts && nameParts.length > 0 ? nameParts[0] : '';
      if (!formattedName) return text;
      
      const properName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1).toLowerCase();
      
      // Remplacer toutes les variations du prénom par la version formatée
      const variations = [
        name.toLowerCase(),
        name.toUpperCase(),
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
        name
      ];
      
      let result = text;
      variations.forEach(variant => {
        result = result.replace(new RegExp(variant, 'g'), properName);
      });
      
      return result;
    } catch (error) {
      console.warn('Erreur lors du formatage du prénom:', error);
      return text;
    }
  };

  // Fonction pour formater le contenu de manière plus professionnelle et concise
  const formatContent = () => {
    // Si c'est un contenu de décision, retourner le composant DecisionChoices
    if (type === 'decision-choices' && typeof content !== 'string') {
      return <DecisionChoices decision={content as CrisisDecisionContent} onSelectOption={handleDecisionChoice} />;
    }
    
    // Formater d'abord le contenu pour corriger les noms
    let formattedContent = content as string;
    if (userName && typeof content === 'string') {
      formattedContent = formatFirstName(content, userName);
    }
    
    // Nettoyer le contenu de tous les formatages markdown
    formattedContent = formattedContent
      .replace(/^\s*#{1,6}\s+/gm, '') // Enlever les # pour les titres
      .replace(/^\s*[>]\s+/gm, '')    // Enlever les > pour les citations
      .replace(/`{1,3}([\s\S]*?)`{1,3}/g, '$1') // Enlever les backticks
      .replace(/!\[(.*?)\]\(.*?\)/g, '[Image: $1]') // Remplacer les images
      .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Supprimer les liens markdown
    
    // Amélioration de la détection des listes - détecte aussi les listes avec numéros (1., 2., etc)
    const paragraphs = formattedContent.split('\n\n');
    
    // Traiter chaque paragraphe avec un style plus compact et élégant
    return (
      <div className="space-y-2">
        {paragraphs.map((paragraph, idx) => {
          const trimmedParagraph = paragraph.trim();
          if (!trimmedParagraph) return null;
          
          // Vérifier si c'est un titre séparé
          const titleMatch = trimmedParagraph.match(/^([A-Z\s]{3,}):?\s*$/);
          if (titleMatch) {
            return (
              <h3 key={idx} className="font-semibold text-[#006a9e] text-base leading-tight mt-1 mb-0.5">
                {titleMatch[1]}
              </h3>
            );
          }
          
          return <div key={idx} className="text-pretty">{processText(trimmedParagraph)}</div>;
        })}
      </div>
    );
  };
  
  // Traitement du texte en gras (** **)
  const processStrongText = (text: string) => {
    if (!text || typeof text !== 'string' || !text.includes('**')) return text;
    
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-[#006a9e] font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };
  
  // Formate les montants de budget pour une cohérence visuelle
  const formatBudgetAmounts = (content: React.ReactNode): React.ReactNode => {
    if (typeof content !== 'string') return content;
    
    // Recherche les motifs de budget (nombres suivis de €, k€, K€, etc.)
    const budgetRegex = /(\d[\d\s]*[\d.,]*\s*(?:€|k€|K€|euros|EUR|M€))/g;
    
    if (!budgetRegex.test(content)) return content;
    
    const parts = content.split(budgetRegex);
    return parts.map((part, i) => {
      if (budgetRegex.test(part)) {
        // Formatage cohérent du montant de budget
        return <span key={i} className="font-semibold text-[#006a9e]">{part}</span>;
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

  // Fonction pour formater un contenu spécifique avec un design élégant et bien structuré
  const formatSpecificContent = (contentToFormat: string) => {
    // Formater d'abord le contenu pour corriger les noms
    let formattedContent = contentToFormat;
    if (userName) {
      formattedContent = formatFirstName(contentToFormat, userName);
    }
    
    // Nettoyer le contenu de tous les formatages markdown
    formattedContent = formattedContent
      .replace(/^\s*#{1,6}\s+/gm, '') // Enlever les # pour les titres
      .replace(/^\s*[>]\s+/gm, '')    // Enlever les > pour les citations
      .replace(/`{1,3}([\s\S]*?)`{1,3}/g, '$1') // Enlever les backticks
      .replace(/!\[(.*?)\]\(.*?\)/g, '[Image: $1]') // Remplacer les images
      .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Supprimer les liens markdown
    
    // Amélioration de la détection des listes - détecte aussi les listes avec numéros (1., 2., etc)
    const paragraphs = formattedContent.split('\n\n');
    
    // Traiter chaque paragraphe avec un espacement optimisé
    return (
      <div className="space-y-2">
        {paragraphs.map((paragraph, idx) => {
          const trimmedParagraph = paragraph.trim();
          if (!trimmedParagraph) return null;
          
          // Vérifier si c'est un titre séparé
          const titleMatch = trimmedParagraph.match(/^([A-Z\s]{3,}):?\s*$/);
          if (titleMatch) {
            return (
              <h3 key={idx} className="font-semibold text-[#006a9e] text-base leading-tight mt-1 mb-0.5">
                {titleMatch[1]}
              </h3>
            );
          }
          
          // Utiliser la même fonction processText améliorée
          return <div key={idx} className="text-pretty">{processText(trimmedParagraph)}</div>;
        })}
      </div>
    );
  };
  
  // Fonction pour traiter un texte et détecter les listes
  const processText = (text: string) => {
    // Nettoyer le texte de tous les formatages markdown restants
    const cleanedText = text
      .replace(/^\s*#{1,6}\s+/gm, '') // Enlever les # pour les titres
      .replace(/^\s*[>]\s+/gm, '')    // Enlever les > pour les citations
      .replace(/`{1,3}([\s\S]*?)`{1,3}/g, '$1') // Enlever les backticks
      .replace(/!\[(.*?)\]\(.*?\)/g, '[Image: $1]') // Remplacer les images
      .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Supprimer les liens markdown
    
    // Détecte si le texte contient une liste
    if (cleanedText.includes('\n- ') || cleanedText.includes('\n• ') || /\n\d+\.\s/.test(cleanedText)) {
      // Diviser en lignes
      const lines = cleanedText.split('\n');
      const items: JSX.Element[] = [];
      let currentList: JSX.Element[] = [];
      let inList = false;
      let listType: 'ul' | 'ol' = 'ul';
      
      lines.forEach((line, i) => {
        // Ligne vide
        if (!line.trim()) {
          if (inList && currentList.length > 0) {
            // Terminer la liste actuelle avec un style amélioré pour la lisibilité
            items.push(
              listType === 'ul' 
                ? <ul key={`ul-${i}`} className="list-disc pl-4 marker:text-[#006a9e] space-y-0.5">{currentList}</ul>
                : <ol key={`ol-${i}`} className="list-decimal pl-4 marker:text-[#006a9e] space-y-0.5">{currentList}</ol>
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
              // Terminer la liste précédente avec un style amélioré
              items.push(
                listType === 'ul' 
                  ? <ul key={`ul-${i}`} className="list-disc pl-4 marker:text-[#006a9e] space-y-0.5">{currentList}</ul>
                  : <ol key={`ol-${i}`} className="list-decimal pl-4 marker:text-[#006a9e] space-y-0.5">{currentList}</ol>
              );
              currentList = [];
            }
            
            listType = newListType;
            inList = true;
          }
          
          // Ajouter l'élément à la liste courante avec un style optimisé
          currentList.push(
            <li key={i} className="text-gray-800 leading-tight text-sm sm:text-base">
              {formatBudgetAmounts(processStrongText(content))}
            </li>
          );
        } else {
          // Ce n'est pas un élément de liste
          if (inList && currentList.length > 0) {
            // Terminer la liste actuelle
            items.push(
              listType === 'ul' 
                ? <ul key={`ul-${i}`} className="list-disc pl-4 marker:text-[#006a9e] space-y-0.5">{currentList}</ul>
                : <ol key={`ol-${i}`} className="list-decimal pl-4 marker:text-[#006a9e] space-y-0.5">{currentList}</ol>
            );
            currentList = [];
            inList = false;
          }
          
          // Vérifier si c'est un titre (en majuscules ou avec :)
          const titleMatch = line.match(/^([A-Z\s]{3,}(?:\s*:)?|[^:]+:)(.*)$/);
          if (titleMatch) {
            items.push(
              <div key={i} className="text-gray-800">
                <span className="font-semibold text-[#006a9e]">{titleMatch[1].trim().replace(/:$/, '')}:</span>{' '}
                <span>{formatBudgetAmounts(processStrongText(titleMatch[2].trim()))}</span>
              </div>
            );
          } else {
            // Paragraphe normal plus compact
            items.push(
              <p key={i} className="text-gray-800 text-sm sm:text-base leading-snug">
                {formatBudgetAmounts(processStrongText(line))}
              </p>
            );
          }
        }
      });
      
      // Terminer la dernière liste si nécessaire
      if (inList && currentList.length > 0) {
        items.push(
          listType === 'ul' 
            ? <ul key="ul-last" className="list-disc pl-4 marker:text-[#006a9e] space-y-0.5">{currentList}</ul>
            : <ol key="ol-last" className="list-decimal pl-4 marker:text-[#006a9e] space-y-0.5">{currentList}</ol>
        );
      }
      
      return <div className="space-y-1.5">{items}</div>;
    } else {
      // Texte normal sans liste - avec mise en forme améliorée
      // Détecter si c'est un titre (en majuscules ou avec :)
      const titleMatch = cleanedText.match(/^([A-Z\s]{3,}(?:\s*:)?|[^:]+:)(.*)$/);
      if (titleMatch) {
        return (
          <p className="text-gray-800 text-sm sm:text-base leading-snug">
            <span className="font-semibold text-[#006a9e]">{titleMatch[1].trim().replace(/:$/, '')}:</span>{' '}
            <span>{formatBudgetAmounts(processStrongText(titleMatch[2].trim()))}</span>
          </p>
        );
      }
      
      // Texte normal plus compact
      return <p className="text-gray-800 text-sm sm:text-base leading-snug">{formatBudgetAmounts(processStrongText(cleanedText))}</p>;
    }
  };
  
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
  
  // Style spécial pour les choix de décision
  if (type === "decision-choices") {
    // Vérifier que le contenu est bien un objet (CrisisDecisionContent)
    if (typeof content !== 'string') {
      return (
        <div className="w-full mb-4 animate-fadeIn">
          <DecisionChoices 
            decision={content as CrisisDecisionContent} 
            onSelectOption={handleDecisionChoice} 
          />
        </div>
      );
    }
  }
  
  // Cas spécial : intervention du système I AM CYBER
  if (type === "bot" && isIAMCYBERIntervention && iamCyberContent && contactContent) {
    return (
      <div className="w-full flex flex-col mb-4 animate-fadeIn">
        {/* Message du système I AM CYBER */}
        <div className="w-full mb-4 animate-fadeIn">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-orange-400">
              <Zap className="h-5 w-5 text-white" />
            </div>
            
            <div className="text-left max-w-[80%] rounded-lg bg-orange-50 border-orange-300 p-4 border shadow-sm">
              <div className="mb-2 pb-2 border-b border-orange-200">
                <div className="font-bold text-orange-700 text-base">I AM CYBER</div>
                <div className="text-xs text-orange-600">Système d'apprentissage</div>
              </div>
              
              <div className="text-sm sm:text-base leading-relaxed">
                {formatSpecificContent(iamCyberContent)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Message du contact après l'intervention */}
        <div className="flex items-start gap-3 mb-2">
          <div className={`w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0 shadow-sm border border-[#006a9e]/20`}>
            <BotMessageSquare className="h-5 w-5 text-white" />
          </div>
          
          <div className="text-left max-w-[80%] rounded-lg bg-blue-50 border-[#006a9e]/30 p-4 border shadow-sm">
            {contactName && contactRole && (
              <div className="mb-2 pb-2 border-b border-[#006a9e]/10">
                <div className="font-bold text-[#006a9e] text-base">{contactName}</div>
                <div className="text-xs text-gray-600">{contactRole}</div>
              </div>
            )}
            
            <div className="text-sm sm:text-base leading-relaxed">
              {formatSpecificContent(contactContent)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rendu standard pour les messages utilisateur/bot - optimisé pour mobile
  return (
    <div className={`flex items-start gap-1 sm:gap-3 mb-3 ${type === 'user' ? 'flex-row-reverse justify-start' : 'flex-row justify-start'} w-full`}>
      {/* Avatar - plus petit sur mobile */}
      <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full ${avatarColor} flex items-center justify-center flex-shrink-0 shadow-sm border border-[#006a9e]/20`}>
        {type === "user" ? (
          <User className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-white" />
        ) : (
          <BotMessageSquare className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-white" />
        )}
      </div>
      
      {/* Message content - optimisé pour mobile */}
      <div className={`${type === 'user' ? 'text-right' : 'text-left'} max-w-[88%] sm:max-w-[80%] rounded-lg ${messageBgColor} p-2.5 sm:p-4 border shadow-sm`}>
        {/* Afficher les informations du contact pour les messages bot si disponibles */}
        {type === "bot" && contactName && contactRole && (
          <div className="mb-1.5 sm:mb-2 pb-1.5 sm:pb-2 border-b border-[#006a9e]/10">
            <div className="font-bold text-[#006a9e] text-xs sm:text-base">{contactName}</div>
            <div className="text-[9px] sm:text-xs text-gray-600">{contactRole}</div>
          </div>
        )}
        
        <div className="text-sm sm:text-base leading-relaxed text-pretty">
          {formatContent()}
        </div>
      </div>
    </div>
  );
}
