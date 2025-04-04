import React from "react";
import { User, Bot, Shield, Zap, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Interlocutor } from "@/types/interlocutors";

// Définir les tailles disponibles pour l'avatar
type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

// Définir les types de statut
type StatusType = "online" | "away" | "busy" | "offline";

interface AvatarProps {
  interlocutor: Interlocutor;
  size?: AvatarSize;
  showStatus?: boolean;
  statusType?: StatusType;
  className?: string;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  interlocutor,
  size = "md",
  showStatus = false,
  statusType = "online",
  className = "",
  onClick
}) => {
  // Déterminer les classes CSS en fonction de la taille
  const getSizeClasses = (): string => {
    switch (size) {
      case "xs": return "w-6 h-6 text-xs";
      case "sm": return "w-8 h-8 sm:w-10 sm:h-10 text-sm";
      case "md": return "w-12 h-12 text-base";
      case "lg": return "w-16 h-16 text-lg";
      case "xl": return "w-20 h-20 text-xl";
      default: return "w-12 h-12 text-base";
    }
  };

  // Déterminer la couleur du statut
  const getStatusColor = (): string => {
    switch (statusType) {
      case "online": return "bg-green-500";
      case "away": return "bg-yellow-500";
      case "busy": return "bg-red-500";
      case "offline": return "bg-gray-500";
      default: return "bg-green-500";
    }
  };

  // Sélectionner l'icône en fonction du rôle de l'interlocuteur
  const getIcon = () => {
    // Par défaut, utiliser l'icône Bot
    const IconComponent = Bot;
    
    // Si un avatar personnalisé est défini, renvoyer null (utiliser l'avatar)
    if (interlocutor.avatarUrl) return null;
    
    // Utiliser une icône par défaut basée sur l'ID de l'interlocuteur
    const id = interlocutor.id.toLowerCase();
    
    if (id.includes('i-am-cyber')) {
      return <Sparkles className="w-1/2 h-1/2" />;
    } else if (id.includes('directeur') || id.includes('chef') || id.includes('responsable')) {
      return <Shield className="w-1/2 h-1/2" />;
    } else if (id.includes('expert') || id.includes('ingenieur') || id.includes('analyste')) {
      return <Zap className="w-1/2 h-1/2" />;
    } else {
      return <IconComponent className="w-1/2 h-1/2" />;
    }
  };

  // Déterminer la classe de base pour l'arrière-plan de l'avatar
  const defaultBgColor = interlocutor.backgroundColor || "bg-blue-900";
  
  // Si l'avatar a une image, l'afficher, sinon afficher une lettre ou une icône
  return (
    <div 
      className={cn(
        "relative rounded-full flex items-center justify-center text-white font-semibold shadow-md",
        getSizeClasses(),
        interlocutor.avatarUrl ? "" : defaultBgColor,
        onClick ? "cursor-pointer hover:opacity-90 transition-opacity" : "",
        className
      )}
      onClick={onClick}
      title={interlocutor.name}
    >
      {interlocutor.avatarUrl ? (
        <img 
          src={interlocutor.avatarUrl} 
          alt={interlocutor.name} 
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        getIcon() || interlocutor.name.charAt(0).toUpperCase()
      )}
      
      {/* Indicateur de statut */}
      {showStatus && (
        <span 
          className={cn(
            "absolute block rounded-full border-2 border-black",
            getStatusColor(),
            size === "xs" ? "w-2 h-2 -right-0.5 -bottom-0.5" :
            size === "sm" ? "w-3 h-3 -right-0.5 -bottom-0.5" :
            size === "md" ? "w-3.5 h-3.5 -right-1 -bottom-1" :
            size === "lg" ? "w-4 h-4 -right-1 -bottom-1" :
            "w-5 h-5 -right-1.5 -bottom-1.5"
          )}
        />
      )}
    </div>
  );
};

export default Avatar;