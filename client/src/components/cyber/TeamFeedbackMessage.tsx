import React from "react";
import { TeamFeedback } from "@shared/types/cyber";
import { MessageCircle, ThumbsDown, ThumbsUp, Webhook } from "lucide-react";

interface TeamFeedbackMessageProps {
  feedback: TeamFeedback;
}

export default function TeamFeedbackMessage({ feedback }: TeamFeedbackMessageProps) {
  // Déterminer l'icône et la couleur en fonction du sentiment
  const getSentimentIcon = () => {
    switch (feedback.sentiment) {
      case "positive":
        return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case "negative":
        return <ThumbsDown className="h-4 w-4 text-red-600" />;
      default:
        return <Webhook className="h-4 w-4 text-amber-600" />;
    }
  };

  // Déterminer la couleur de fond en fonction du sentiment
  const getBgColor = () => {
    switch (feedback.sentiment) {
      case "positive":
        return "bg-green-50 border-green-200";
      case "negative":
        return "bg-red-50 border-red-200";
      default:
        return "bg-amber-50 border-amber-200";
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getBgColor()} mb-2`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-4">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {/* Initiales du membre de l'équipe */}
            <span className="font-semibold text-gray-700 text-sm">
              {feedback.sender
                .split(" ")
                .map(name => name[0])
                .join("")}
            </span>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <span className="font-semibold text-gray-800 mr-2">{feedback.sender}</span>
            <span className="text-xs text-gray-500">{feedback.senderRole}</span>
          </div>
          
          <p className="text-gray-700 mb-2">{feedback.message}</p>
          
          <div className="flex items-center mt-1">
            {getSentimentIcon()}
            <span className="text-xs text-gray-500 ml-1">
              {feedback.sentiment === "positive" 
                ? "Retour positif" 
                : feedback.sentiment === "negative" 
                  ? "Retour critique" 
                  : "Avis nuancé"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}