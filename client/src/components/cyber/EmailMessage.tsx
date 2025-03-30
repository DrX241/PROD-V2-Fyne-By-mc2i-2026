import React, { useState } from "react";
import { Paperclip } from "lucide-react";
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
    
    // Check for bold text (surrounded by ** or __) and convert to <strong>
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
    <div className="my-4 email-container">
      <div className="email-header">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
              <span className="font-semibold">
                {email.from.name.split(' ').map((n: string) => n[0]).join('')}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">{email.from.name}</h3>
              <p className="text-gray-500 text-sm">{email.from.role}</p>
            </div>
          </div>
          <div className="text-gray-500 text-sm">
            {formatDate(email.date)}
          </div>
        </div>
        
        <div className="space-y-1 border-t border-gray-100 pt-3">
          <div className="flex">
            <p className="font-medium text-gray-700 w-16">À :</p>
            <p className="text-gray-800">{email.to}</p>
          </div>
          <div className="flex">
            <p className="font-medium text-gray-700 w-16">Objet :</p>
            <p className="text-gray-800 font-medium">{email.subject}</p>
          </div>
        </div>
      </div>
      
      <div className="email-body">
        {renderBody()}
      </div>
      
      {/* Afficher les interlocuteurs du scénario si disponibles */}
      {email.scenarioContacts && email.scenarioContacts.length > 0 && (
        <div className="email-interlocutors mt-6 mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="font-medium text-gray-800 mb-3">Interlocuteurs du scénario</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {email.scenarioContacts.map((contact: EmailContact, index: number) => (
              <div key={index} className="flex items-center p-2 bg-white rounded-md shadow-sm">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-3 flex-shrink-0">
                  <span className="font-semibold text-sm">
                    {contact.name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h5 className="font-medium text-gray-800">{contact.name}</h5>
                  <p className="text-gray-500 text-xs">{contact.role}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Ces interlocuteurs interviendront dans ce scénario pour vous offrir différentes perspectives et expertises.
          </p>
        </div>
      )}
      
      {email.attachments && email.attachments.length > 0 && (
        <div className="email-attachments">
          <h4 className="font-medium text-gray-700 mb-2">Pièces jointes</h4>
          <div className="flex flex-wrap gap-2">
            {email.attachments.map((attachment: EmailAttachment) => (
              <button 
                key={attachment.id}
                className="attachment-badge"
                onClick={() => handleAttachmentClick(attachment.id)}
                disabled={isAttachmentLoading[attachment.id]}
              >
                <Paperclip className="h-4 w-4" />
                <span>
                  {attachment.fileName}
                  <span className="text-gray-500 ml-1">({attachment.fileSize})</span>
                </span>
                {isAttachmentLoading[attachment.id] && (
                  <div className="ml-1 h-3 w-3 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
