import React, { useState } from "react";
import { Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Définir les interfaces temporaires ici en attendant que les modules importés soient disponibles
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
  scenarioContacts?: EmailContact[]; // Liste des interlocuteurs du scénario
  isRead?: boolean; // Added isRead property
}

interface EmailMessageProps {
  email: EmailContent;
}

export default function EmailMessage({ email }: EmailMessageProps) {
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

  // Convert email body text to paragraphs
  const formattedBody = email.body.split('\n').map((line: string, i: number) => {
    if (line.trim() === '') return <div key={i} className="h-4"></div>;

    // Handle bullet points or numbered lists
    if (line.trim().match(/^[•\-*]\s/)) {
      return <li key={i} className="ml-6 mb-1 text-white">{line.replace(/^[•\-*]\s/, '')}</li>;
    }

    // Check for numbered list items
    const numberedListMatch = line.trim().match(/^(\d+\.)\s(.+)/);
    if (numberedListMatch) {
      return <li key={i} className="ml-6 mb-1 text-white">{numberedListMatch[2]}</li>;
    }

    // Traitement amélioré pour les titres et sous-titres (qui étaient en markdown)
    if (line.trim().match(/^\*\*.*\*\*$/) || line.trim().match(/^__.*__$/)) {
      const boldText = line.replace(/^\*\*|\*\*$|^__|__$/g, '');
      return <p key={i} className="mb-3 font-medium text-white">{boldText}</p>;
    }

    // Convertir tout le markdown en HTML correct
    if (line.includes('**') || line.includes('__')) {
      // Convertir le markdown en HTML propre
      let processedLine = line;

      // Remplacer **text** par du texte en gras
      processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
      processedLine = processedLine.replace(/__(.*?)__/g, '<strong class="text-white">$1</strong>');

      // Ajouter d'autres conversions markdown au besoin (italique, etc.)
      processedLine = processedLine.replace(/\*(.*?)\*/g, '<em class="text-white">$1</em>');
      processedLine = processedLine.replace(/_(.*?)_/g, '<em class="text-white">$1</em>');

      return <p key={i} className="mb-3 text-white" dangerouslySetInnerHTML={{ __html: processedLine }} />;
    }

    return <p key={i} className="mb-3 text-white">{line}</p>;
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
              <ol key={`list-${listKey++}`} className="list-decimal mb-3 text-white">{currentList}</ol> : 
              <ul key={`list-${listKey++}`} className="list-disc mb-3 text-white">{currentList}</ul>
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
              <ol key={`list-${listKey++}`} className="list-decimal mb-3 text-white">{currentList}</ol> : 
              <ul key={`list-${listKey++}`} className="list-disc mb-3 text-white">{currentList}</ul>
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
          <ol key={`list-${listKey++}`} className="list-decimal mb-3 text-white">{currentList}</ol> : 
          <ul key={`list-${listKey++}`} className="list-disc mb-3 text-white">{currentList}</ul>
      );
    }

    return result;
  };

  return (
    <div className="my-6 sm:my-8 max-w-4xl mx-auto">
      <div className="backdrop-blur-md bg-gray-900/60 rounded-xl border border-blue-800/40 overflow-hidden shadow-glow-md">
        {/* Email Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border-b border-blue-700/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600/50 to-indigo-700/50 rounded-full flex items-center justify-center text-white mr-3 sm:mr-4 border border-blue-500/30 shadow-glow-sm">
                <span className="font-semibold text-sm sm:text-base">
                  {email.from.name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-white text-base sm:text-lg">{email.from.name}</h3>
                <p className="text-white text-xs sm:text-sm">{email.from.role}</p>
              </div>
            </div>
            <div className="text-white text-xs sm:text-sm bg-blue-900/50 px-3 py-1 rounded-md border border-blue-700/30 self-start sm:self-auto">
              {formatDate(email.date)}
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 pt-3 border-t border-blue-700/30">
            <div className="flex flex-wrap sm:flex-nowrap">
              <p className="font-medium text-white w-12 sm:w-16 text-sm sm:text-base">À :</p>
              <p className="text-white text-sm sm:text-base">{email.to}</p>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap">
              <p className="font-medium text-white w-12 sm:w-16 text-sm sm:text-base">Objet :</p>
              <p className={`text-white font-medium text-sm sm:text-base ${!email.isRead ? 'underline' : ''}`}>{email.subject}</p>
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div className="p-4 sm:p-6 text-white prose prose-invert max-w-none prose-blue text-sm sm:text-base">
          {renderBody()}
        </div>

        {/* Zone de réponse */}
        <div className="p-4 sm:p-6 border-t border-blue-700/30">
          <ChatInterface
            contactName={email.from.name}
            contactRole={email.from.role || ""}
            userAvatar="avatar1"
            userName="Vous"
            userRole="Apprenant"
            height="h-[400px]"
            initialMessage={`Je suis prêt(e) à répondre à votre email concernant "${email.subject}"`}
          />
        </div>

        {/* Interlocuteurs */}
        {email.scenarioContacts && email.scenarioContacts.length > 0 && (
          <div className="mx-3 sm:mx-6 my-3 sm:my-4 p-3 sm:p-5 bg-blue-900/40 rounded-lg border border-blue-700/30 backdrop-blur-sm">
            <h4 className="font-bold text-white mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
              <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" />
              <span>Interlocuteurs du scénario</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {email.scenarioContacts.map((contact: EmailContact, index: number) => (
                <div 
                  key={index} 
                  className="flex p-3 sm:p-4 backdrop-blur-sm bg-gradient-to-br from-gray-900/70 to-blue-900/40 rounded-lg border border-blue-800/40 shadow-md hover:shadow-glow-sm transition-all duration-300"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-700/60 to-indigo-700/60 rounded-full flex items-center justify-center text-white mr-2 sm:mr-3 flex-shrink-0 border border-blue-500/30 shadow-glow-sm">
                    <span className="font-semibold text-xs sm:text-sm">
                      {contact.name.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div className="w-full">
                    <h5 className="font-bold text-white text-sm sm:text-base">{contact.name}</h5>
                    <p className="text-white text-xs sm:text-sm mb-1 sm:mb-2">{contact.role}</p>
                    {(contact.expertise || contact.concern) && (
                      <div className="mt-1 sm:mt-2 p-1.5 sm:p-2 rounded-md bg-blue-950/50 border border-blue-800/40 space-y-1 sm:space-y-2">
                        {contact.expertise && (
                          <p className="text-[10px] sm:text-xs text-white">
                            <span className="font-medium text-white">Expertise:</span> {contact.expertise}
                          </p>
                        )}
                        {contact.concern && (
                          <p className="text-[10px] sm:text-xs text-white">
                            <span className="font-medium text-white">Préoccupation:</span> {contact.concern}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs sm:text-sm text-white mt-3 sm:mt-4">
              Ces interlocuteurs interviendront dans ce scénario pour vous offrir différentes perspectives sur la problématique cyber centrale.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}