import { useEffect } from 'react';

interface PageTitleProps {
  title: string;
}

// Composant pour mettre à jour dynamiquement le titre de la page
export default function PageTitle({ title }: PageTitleProps) {
  useEffect(() => {
    // Sauvegarde du titre original pour le restaurer au démontage
    const originalTitle = document.title;
    
    // Met à jour le titre avec le format "FYNE - [titre de la page]"
    document.title = `FYNE - ${title}`;
    
    // Nettoie au démontage du composant
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
  
  // Ce composant ne rend rien dans le DOM
  return null;
}