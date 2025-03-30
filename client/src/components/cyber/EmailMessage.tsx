import React, { useState } from "react";
import { Paperclip, FileCheck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Définir les interfaces temporaires ici en attendant que les modules importés soient disponibles
interface EmailAttachment {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  content?: string;
}

interface EmailContact {
  name: string;
  role: string;
  expertise?: string;  // Expertise spécifique de l'interlocuteur
  concern?: string;    // Préoccupation principale de l'interlocuteur
}

interface EmailContent {
  id: string;
  from: EmailContact;
  to: string;
  subject: string;
  date: string;
  body: string;
  attachments: EmailAttachment[];
  scenarioContacts?: EmailContact[]; // Liste des interlocuteurs du scénario
  evaluation?: EmailAttachment; // Pièce jointe d'évaluation finale (si présente)
}

interface EmailMessageProps {
  email: EmailContent;
}

export default function EmailMessage({ email }: EmailMessageProps) {
  const [isAttachmentLoading, setIsAttachmentLoading] = useState<{[key: string]: boolean}>({});

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  const handleAttachmentClick = async (attachmentId: string) => {
    try {
      setIsAttachmentLoading((prev) => ({ ...prev, [attachmentId]: true }));
      
      // Ouvrir directement le PDF dans un nouvel onglet
      window.open(`/api/cyber/documents/${attachmentId}`, '_blank');
    } catch (error) {
      console.error('Error opening attachment:', error);
    } finally {
      setIsAttachmentLoading((prev) => ({ ...prev, [attachmentId]: false }));
    }
  };

  // Convert email body text to paragraphs
  const formattedBody = email.body.split('\n').map((line: string, i: number) => {
    if (line.trim() === '') return <div key={i} className="h-4"></div>;
    
    // Handle bullet points or numbered lists
    if (line.trim().match(/^[•\-*]\s/)) {
      return <li key={i} className="ml-6 mb-1">{line.replace(/^[•\-*]\s/, '')}</li>;
    }
    
    // Check for numbered list items
    const numberedListMatch = line.trim().match(/^(\d+\.)\s(.+)/);
    if (numberedListMatch) {
      return <li key={i} className="ml-6 mb-1">{numberedListMatch[2]}</li>;
    }
    
    // Traiter le texte en gras sans les ** ou __ en début et fin de mail
    if (line.trim().match(/^\*\*.*\*\*$/) || line.trim().match(/^__.*__$/)) {
      const boldText = line.replace(/^\*\*|\*\*$|^__|__$/g, '');
      return <p key={i} className="mb-3 font-medium">{boldText}</p>;
    }
    
    // Check for inline bold text and convert to <strong>
    if (line.includes('**') || line.includes('__')) {
      // Remplacer **text** par du texte en gras
      const processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                               .replace(/__(.*?)__/g, '<strong>$1</strong>');
      return <p key={i} className="mb-3" dangerouslySetInnerHTML={{ __html: processedLine }} />;
    }
    
    return <p key={i} className="mb-3">{line}</p>;
  });

  // Group list items into proper lists
  const renderBody = () => {
    let result = [];
    let currentList: JSX.Element[] = [];
    let isOrderedList = false;
    let listKey = 0;
    
    formattedBody.forEach((element: React.ReactNode, index: number) => {
      if (React.isValidElement(element) && element.type === 'li') {
        // Check if this is a numbered list item
        const originalLine = email.body.split('\n')[index];
        const isNumbered = originalLine.trim().match(/^\d+\.\s/);
        
        // If switching list types, close current list and start new one
        if ((isNumbered === null) !== isOrderedList && currentList.length > 0) {
          result.push(
            isOrderedList ? 
              <ol key={`list-${listKey++}`} className="list-decimal mb-3">{currentList}</ol> : 
              <ul key={`list-${listKey++}`} className="list-disc mb-3">{currentList}</ul>
          );
          currentList = [];
        }
        
        isOrderedList = Boolean(isNumbered);
        currentList.push(element);
      } else {
        // If we have list items, add the list before adding the non-list element
        if (currentList.length > 0) {
          result.push(
            isOrderedList ? 
              <ol key={`list-${listKey++}`} className="list-decimal mb-3">{currentList}</ol> : 
              <ul key={`list-${listKey++}`} className="list-disc mb-3">{currentList}</ul>
          );
          currentList = [];
        }
        result.push(element);
      }
    });
    
    // Add any remaining list items
    if (currentList.length > 0) {
      result.push(
        isOrderedList ? 
          <ol key={`list-${listKey++}`} className="list-decimal mb-3">{currentList}</ol> : 
          <ul key={`list-${listKey++}`} className="list-disc mb-3">{currentList}</ul>
      );
    }
    
    return result;
  };

  return (
    <div className="my-8 max-w-4xl mx-auto">
      <div className="backdrop-blur-md bg-gray-900/60 rounded-xl border border-blue-800/40 overflow-hidden shadow-glow-md">
        {/* Email Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border-b border-blue-700/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600/50 to-indigo-700/50 rounded-full flex items-center justify-center text-blue-100 mr-4 border border-blue-500/30 shadow-glow-sm">
                <span className="font-semibold">
                  {email.from.name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-blue-50 text-lg">{email.from.name}</h3>
                <p className="text-blue-300 text-sm">{email.from.role}</p>
              </div>
            </div>
            <div className="text-blue-300 text-sm bg-blue-900/50 px-3 py-1 rounded-md border border-blue-700/30">
              {formatDate(email.date)}
            </div>
          </div>
          
          <div className="space-y-3 pt-3 border-t border-blue-700/30">
            <div className="flex">
              <p className="font-medium text-blue-300 w-16">À :</p>
              <p className="text-blue-100">{email.to}</p>
            </div>
            <div className="flex">
              <p className="font-medium text-blue-300 w-16">Objet :</p>
              <p className="text-blue-50 font-medium">{email.subject}</p>
            </div>
          </div>
        </div>
        
        {/* Email Body */}
        <div className="p-6 text-blue-100 prose prose-invert max-w-none prose-blue">
          {renderBody()}
        </div>
        
        {/* Interlocuteurs */}
        {email.scenarioContacts && email.scenarioContacts.length > 0 && (
          <div className="mx-6 my-4 p-5 bg-blue-900/40 rounded-lg border border-blue-700/30 backdrop-blur-sm">
            <h4 className="font-bold text-blue-100 mb-4 flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-400" />
              <span>Interlocuteurs du scénario</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {email.scenarioContacts.map((contact: EmailContact, index: number) => (
                <div 
                  key={index} 
                  className="flex p-4 backdrop-blur-sm bg-gradient-to-br from-gray-900/70 to-blue-900/40 rounded-lg border border-blue-800/40 shadow-md hover:shadow-glow-sm transition-all duration-300"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-700/60 to-indigo-700/60 rounded-full flex items-center justify-center text-blue-100 mr-3 flex-shrink-0 border border-blue-500/30 shadow-glow-sm">
                    <span className="font-semibold text-sm">
                      {contact.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div className="w-full">
                    <h5 className="font-bold text-blue-50">{contact.name}</h5>
                    <p className="text-blue-300 text-sm mb-2">{contact.role}</p>
                    {(contact.expertise || contact.concern) && (
                      <div className="mt-2 p-2 rounded-md bg-blue-950/50 border border-blue-800/40 space-y-2">
                        {contact.expertise && (
                          <p className="text-xs text-blue-200">
                            <span className="font-medium text-blue-300">Expertise:</span> {contact.expertise}
                          </p>
                        )}
                        {contact.concern && (
                          <p className="text-xs text-blue-200">
                            <span className="font-medium text-blue-300">Préoccupation:</span> {contact.concern}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-blue-300/90 mt-4">
              Ces interlocuteurs interviendront dans ce scénario pour vous offrir différentes perspectives sur la problématique cyber centrale.
            </p>
          </div>
        )}
        
        {/* Evaluation */}
        {email?.evaluation && (
          <div className="mx-6 my-4 p-5 bg-green-900/30 rounded-lg border border-green-700/30 backdrop-blur-sm">
            <h4 className="font-bold text-green-100 mb-3 flex items-center">
              <FileCheck className="mr-2 h-5 w-5 text-green-400" />
              <span>Évaluation finale</span>
            </h4>
            <p className="text-sm text-green-200 mb-4">
              Votre performance dans ce scénario a été évaluée. Consultez le document d'évaluation pour découvrir vos points forts, axes d'amélioration et les concepts clés à retenir.
            </p>
            {email.evaluation && (
              <button 
                className="px-4 py-2.5 bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-800 hover:to-emerald-800 text-white rounded-md flex items-center space-x-2 transition-all duration-300 shadow-md hover:shadow-glow-sm border border-green-600/50"
                onClick={() => handleAttachmentClick(email.evaluation!.id)}
                disabled={Boolean(isAttachmentLoading[email.evaluation.id])}
              >
                <FileCheck className="h-5 w-5" />
                <span>Voir mon évaluation complète</span>
                {isAttachmentLoading[email.evaluation.id] && (
                  <div className="ml-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                )}
              </button>
            )}
          </div>
        )}
        
        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="border-t border-blue-800/40 p-5 bg-gray-900/50">
            <h4 className="font-medium text-blue-100 mb-3 flex items-center">
              <Paperclip className="mr-2 h-4 w-4 text-blue-400" />
              <span>Pièces jointes</span>
            </h4>
            <div className="flex flex-wrap gap-3">
              {email.attachments.map((attachment: EmailAttachment) => (
                <button 
                  key={attachment.id}
                  className="flex items-center gap-2 bg-blue-900/50 hover:bg-blue-800/60 text-blue-100 px-4 py-2 rounded-full transition-all duration-300 border border-blue-700/40 hover:border-blue-600/50 shadow-md hover:shadow-glow-sm"
                  onClick={() => handleAttachmentClick(attachment.id)}
                  disabled={isAttachmentLoading[attachment.id]}
                >
                  <Paperclip className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">
                    {attachment.fileName}
                    <span className="text-blue-400 ml-1.5">({attachment.fileSize})</span>
                  </span>
                  {isAttachmentLoading[attachment.id] && (
                    <div className="ml-1 h-3 w-3 border-2 border-t-transparent border-blue-400 rounded-full animate-spin"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
