import React from "react";
import Header from "./Header";
import { cn } from "@/lib/utils";
import { useChatContext } from "@/contexts/ChatContext";
import OpenAIStatusIndicator from "@/components/OpenAIStatusIndicator";

interface AmoaLayoutProps {
  children: React.ReactNode;
  className?: string;
}

// Layout spécifique pour les pages AMOA
const AmoaLayout: React.FC<AmoaLayoutProps> = ({ children, className }) => {
  const { userName } = useChatContext();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Header />
      <div className={cn("container mx-auto pb-16 pt-20", className)}>
        {children}
      </div>
      
      {/* Indicateur de statut OpenAI fixe en bas à droite */}
      <div className="fixed bottom-4 right-4 z-50">
        <OpenAIStatusIndicator position="fixed-bottom-right" />
      </div>
    </div>
  );
};

export default AmoaLayout;