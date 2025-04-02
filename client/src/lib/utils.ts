import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Fonction pour obtenir le chemin de l'avatar en fonction de son ID
 * @param avatarId ID de l'avatar
 * @returns Chemin vers l'image de l'avatar
 */
export function getAvatarPath(avatarId: string): string {
  // Récupère les images des avatars depuis le dossier public
  if (avatarId === 'avatar1') {
    return '/cyber-new/avatars/avatar1.jpg';
  } else if (avatarId === 'avatar2') {
    return '/cyber-new/avatars/avatar2.jpg';
  } else if (avatarId === 'avatar3') {
    return '/cyber-new/avatars/avatar3.jpg';
  } else if (avatarId === 'avatar4') {
    return '/cyber-new/avatars/avatar4.png';
  }
  
  // Avatar par défaut en cas d'ID non reconnu
  return '/cyber-new/avatars/avatar1.jpg';
}
