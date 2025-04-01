import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Définition des avatars disponibles
export const avatars = [
  { 
    id: "avatar1", 
    src: "/avatars/avatar1.svg", 
    fallback: "A1",
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="#4299e1" />
      <circle cx="40" cy="40" r="5" fill="white" />
      <circle cx="60" cy="40" r="5" fill="white" />
      <path d="M 40 65 Q 50 75 60 65" stroke="white" fill="none" stroke-width="3" />
    </svg>`
  },
  { 
    id: "avatar2", 
    src: "/avatars/avatar2.svg", 
    fallback: "A2",
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="#ed8936" />
      <circle cx="40" cy="40" r="5" fill="white" />
      <circle cx="60" cy="40" r="5" fill="white" />
      <path d="M 35 60 Q 50 70 65 60" stroke="white" fill="none" stroke-width="3" />
    </svg>`
  },
  { 
    id: "avatar3", 
    src: "/avatars/avatar3.svg", 
    fallback: "A3",
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="#38a169" />
      <circle cx="40" cy="40" r="5" fill="white" />
      <circle cx="60" cy="40" r="5" fill="white" />
      <path d="M 40 60 Q 50 60 60 60" stroke="white" fill="none" stroke-width="3" />
    </svg>`
  },
  { 
    id: "avatar4", 
    src: "/avatars/avatar4.svg", 
    fallback: "A4",
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="#805ad5" />
      <circle cx="40" cy="40" r="5" fill="white" />
      <circle cx="60" cy="40" r="5" fill="white" />
      <path d="M 40 65 Q 50 55 60 65" stroke="white" fill="none" stroke-width="3" />
    </svg>`
  },
  { 
    id: "avatar5", 
    src: "/avatars/avatar5.svg", 
    fallback: "A5",
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="#d53f8c" />
      <circle cx="40" cy="40" r="5" fill="white" />
      <circle cx="60" cy="40" r="5" fill="white" />
      <path d="M 40 60 Q 50 70 60 60" stroke="white" fill="none" stroke-width="3" />
    </svg>`
  },
  { 
    id: "avatar6", 
    src: "/avatars/avatar6.svg", 
    fallback: "A6",
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="#e53e3e" />
      <circle cx="40" cy="40" r="5" fill="white" />
      <circle cx="60" cy="40" r="5" fill="white" />
      <path d="M 30 55 Q 50 75 70 55" stroke="white" fill="none" stroke-width="3" />
    </svg>`
  },
];

// Fonction pour sauvegarder les avatars en SVG
export const saveAvatars = () => {
  avatars.forEach(avatar => {
    try {
      if (typeof window !== 'undefined') {
        const blob = new Blob([avatar.svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${avatar.id}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde de l'avatar ${avatar.id}:`, error);
    }
  });
};

// Fonction pour obtenir un avatar par ID
export const getAvatarById = (avatarId: string) => {
  return avatars.find(avatar => avatar.id === avatarId) || avatars[0];
};

// Composant pour afficher un avatar
interface AvatarDisplayProps {
  avatarId: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ 
  avatarId, 
  size = "md", 
  className = "" 
}) => {
  const avatar = getAvatarById(avatarId);
  
  // Déterminer la taille en fonction du paramètre
  const sizeClass = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24"
  }[size];
  
  return (
    <Avatar className={`${sizeClass} ${className}`}>
      {/* Pas besoin d'AvatarImage car on utilise le fallback SVG */}
      <AvatarFallback 
        className="flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: avatar.svgContent }}
      />
    </Avatar>
  );
};

// Composant pour sélectionner un avatar
interface AvatarSelectorProps {
  selectedAvatar: string;
  onSelectAvatar: (avatarId: string) => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({ 
  selectedAvatar, 
  onSelectAvatar 
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      {avatars.map((avatar) => (
        <div 
          key={avatar.id}
          onClick={() => onSelectAvatar(avatar.id)}
          className={`cursor-pointer transition-all flex flex-col items-center p-3 rounded-lg ${
            selectedAvatar === avatar.id ? 'bg-blue-100 ring-2 ring-blue-500' : 'hover:bg-gray-100'
          }`}
        >
          <Avatar className="h-16 w-16 mb-2">
            <AvatarFallback 
              className="flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: avatar.svgContent }}
            />
          </Avatar>
          <span className="text-sm text-gray-500">{avatar.fallback}</span>
        </div>
      ))}
    </div>
  );
};

export default {
  avatars,
  AvatarDisplay,
  AvatarSelector,
  saveAvatars,
  getAvatarById
};