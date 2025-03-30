import React from "react";

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
      return <li key={i} className="ml-5">{line.replace(/^[•-]\s*/, '')}</li>;
    }
    
    // If the line is empty, return a small spacing element
    if (line.trim() === '') {
      return <div key={i} className="h-2"></div>;
    }
    
    // Check if line contains strong text
    if (line.includes('**')) {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className={i > 0 ? "mt-2" : ""}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    }
    
    return <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>;
  });

  const renderContent = () => {
    // If content has bullet points, wrap them in a ul
    if (content.includes('•') || content.includes('-')) {
      return (
        <div>
          {formattedContent.map((element, i) => {
            if (React.isValidElement(element) && element.type === 'li') {
              return <ul key={i} className="list-disc">{element}</ul>;
            }
            return element;
          })}
        </div>
      );
    }
    
    return formattedContent;
  };

  return (
    <div className={`chat-message ${type}`}>
      {/* Afficher les informations du contact pour les messages bot si disponibles */}
      {type === "bot" && contactName && contactRole && (
        <div className="contact-info mb-3">
          <div className="font-bold text-primary">{contactName}</div>
          <div className="text-xs text-gray-500 mt-0.5">{contactRole}</div>
        </div>
      )}
      <div className="prose prose-sm max-w-none">
        {renderContent()}
      </div>
    </div>
  );
}
