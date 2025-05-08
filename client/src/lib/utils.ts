import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Récupère les initiales d'un nom d'utilisateur
 * @param name Le nom d'utilisateur
 * @returns Les initiales (maximum 2 caractères)
 */
export function getInitials(name: string): string {
  if (!name) return "?";
  
  // Supprimer les caractères spéciaux et chiffres
  const cleanName = name.replace(/[^a-zA-Z\s]/g, "");
  
  // Diviser par les espaces pour récupérer les parties du nom
  const nameParts = cleanName.split(/\s+/).filter(Boolean);
  
  if (nameParts.length === 0) return "?";
  
  if (nameParts.length === 1) {
    // Pour un seul mot, prendre les deux premières lettres ou la première lettre si un seul caractère
    const part = nameParts[0];
    return part.length > 1 ? part.substring(0, 2).toUpperCase() : part.toUpperCase();
  }
  
  // Pour plusieurs mots, prendre la première lettre de chaque mot (maximum 2)
  return nameParts
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join("");
}

/**
 * Formatte un nom d'utilisateur pour l'affichage
 * @param username Le nom d'utilisateur
 * @returns Le nom formatté
 */
export function formatUsername(username: string): string {
  if (!username) return "";
  
  // Supprimer les caractères spéciaux
  const cleanName = username.replace(/[^a-zA-Z0-9\s]/g, "");
  
  // Mettre en majuscule la première lettre de chaque mot
  return cleanName
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Tronque un texte à la longueur spécifiée et ajoute des points de suspension si nécessaire
 * @param text Texte à tronquer
 * @param maxLength Longueur maximale
 * @returns Texte tronqué
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + "...";
}