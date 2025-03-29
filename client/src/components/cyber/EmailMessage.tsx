import React, { useState } from "react";
import { EmailMessageContent } from "../../../I_AM_CYBER/types";
import { Paperclip } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface EmailMessageProps {
  email: EmailMessageContent;
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
      
      const response = await apiRequest('GET', `/api/cyber/documents/${attachmentId}`, undefined);
      const blob = await response.blob();
      
      // Create a downloadable link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = email.attachments.find(a => a.id === attachmentId)?.fileName || 'document.txt';
      a.click();
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading attachment:', error);
    } finally {
      setIsAttachmentLoading((prev) => ({ ...prev, [attachmentId]: false }));
    }
  };

  // Convert email body text to paragraphs
  const formattedBody = email.body.split('\n').map((line, i) => {
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
    
    return <p key={i} className="mb-3">{line}</p>;
  });

  // Group list items into proper lists
  const renderBody = () => {
    let result = [];
    let currentList: JSX.Element[] = [];
    let isOrderedList = false;
    let listKey = 0;
    
    formattedBody.forEach((element, index) => {
      if (React.isValidElement(element) && element.type === 'li') {
        // Check if this is a numbered list item
        const originalLine = email.body.split('\n')[index];
        const isNumbered = originalLine.trim().match(/^\d+\.\s/);
        
        // If switching list types, close current list and start new one
        if (isNumbered !== isOrderedList && currentList.length > 0) {
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
      <div className="email-header p-4 rounded-t-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center text-neutral-600 mr-3">
              <span className="font-medium">
                {email.from.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-neutral-800">{email.from.name}</h3>
              <p className="text-neutral-500 text-sm">{email.from.role}</p>
            </div>
          </div>
          <div className="text-neutral-500 text-sm">
            {formatDate(email.date)}
          </div>
        </div>
        <div className="flex items-center">
          <p className="font-medium text-neutral-800">À : </p>
          <p className="ml-2 text-neutral-700">{email.to}</p>
        </div>
        <div className="flex items-center mt-1">
          <p className="font-medium text-neutral-800">Objet : </p>
          <p className="ml-2 text-neutral-700">{email.subject}</p>
        </div>
      </div>
      <div className="p-4">
        {renderBody()}
      </div>
      {email.attachments && email.attachments.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          {email.attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center">
              <Paperclip className="text-neutral-500 mr-2 h-5 w-5" />
              <button 
                onClick={() => handleAttachmentClick(attachment.id)}
                disabled={isAttachmentLoading[attachment.id]}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {attachment.fileName}
              </button>
              <span className="text-neutral-500 text-sm ml-2">({attachment.fileSize})</span>
              {isAttachmentLoading[attachment.id] && (
                <span className="ml-2 text-neutral-500 text-sm">Chargement...</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
