import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import BoringAvatar from 'boring-avatars';

// Types pour les avatars
type AvatarVariant = 'marble' | 'beam' | 'pixel' | 'sunset' | 'ring' | 'bauhaus';

interface CyberAvatar {
  id: string;
  variant: AvatarVariant;
  colors: string[];
  name: string;
  fallback: string;
}

// Fonction pour générer les avatars
function generateAvatars(): CyberAvatar[] {
  // Types d'avatars disponibles
  const avatarVariants: AvatarVariant[] = ['beam', 'pixel', 'bauhaus', 'ring', 'sunset', 'marble'];

  // Palettes de couleurs pour les avatars
  const colorPalettes = [
    ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'], // Earth tones
    ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d'], // Rainbow
    ['#577590', '#43aa8b', '#90be6d', '#f9c74f', '#f8961e'], // Ocean
    ['#22223b', '#4a4e69', '#9a8c98', '#c9ada7', '#f2e9e4'], // Lavender
    ['#390099', '#9e0059', '#ff0054', '#ff5400', '#ffbd00'], // Neon
    ['#011627', '#fdfffc', '#2ec4b6', '#e71d36', '#ff9f1c'], // Modern
    ['#5f0f40', '#9a031e', '#fb8b24', '#e36414', '#0f4c5c'], // Autumn
    ['#2b2d42', '#8d99ae', '#edf2f4', '#ef233c', '#d90429'], // Bold
    ['#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'], // Pastel
    ['#7400b8', '#6930c3', '#5e60ce', '#5390d9', '#4ea8de'], // Purple Blue
    ['#d8f3dc', '#b7e4c7', '#95d5b2', '#74c69d', '#52b788'], // Forest
    ['#ffb3c1', '#ffb3b3', '#ffbe86', '#c5ce95', '#b3effa'], // Soft
  ];

  const result: CyberAvatar[] = [];

  // Générer 12 avatars avec des combinaisons variées
  for (let i = 0; i < 12; i++) {
    const variantIndex = i % avatarVariants.length;
    const paletteIndex = Math.floor(i / 2) % colorPalettes.length;

    // Utiliser un nom unique pour chaque avatar
    const name = `avatar${i + 1}`;

    result.push({
      id: `avatar${i + 1}`,
      variant: avatarVariants[variantIndex],
      colors: colorPalettes[paletteIndex],
      name: name,
      fallback: `A${i + 1}`,
    });
  }

  return result;
}

// Génération des avatars avec différentes combinaisons
export const avatars: CyberAvatar[] = generateAvatars();

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
  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96
  };

  const sizeValue = sizeMap[size];
  const sizeClass = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24"
  }[size];

  return (
    <div className={`${sizeClass} ${className} overflow-hidden rounded-full`}>
      <BoringAvatar
        size={sizeValue}
        name={avatar.name}
        variant={avatar.variant as any}
        colors={avatar.colors}
        square={false}
      />
    </div>
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {avatars.map((avatar) => (
        <div 
          key={avatar.id}
          onClick={() => onSelectAvatar(avatar.id)}
          className={`cursor-pointer transition-all flex flex-col items-center p-3 rounded-lg ${
            selectedAvatar === avatar.id ? 'bg-blue-100 ring-2 ring-blue-500 scale-105' : 'hover:bg-gray-100 hover:scale-105'
          }`}
        >
          <div className="h-16 w-16 mb-2 overflow-hidden rounded-full">
            <BoringAvatar
              size={64}
              name={avatar.name}
              variant={avatar.variant as any}
              colors={avatar.colors}
              square={false}
            />
          </div>
          <span className="text-sm text-gray-500 font-medium">Avatar {avatar.fallback}</span>
        </div>
      ))}
    </div>
  );
};

// Ne pas exporter l'objet par défaut, uniquement les exports nommés