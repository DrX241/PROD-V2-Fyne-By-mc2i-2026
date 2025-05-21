import { useEffect } from 'react';
import { ReactNode } from 'react';

export interface PageTitleProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

// Composant pour mettre à jour dynamiquement le titre de la page et l'afficher visuellement
export default function PageTitle({ title, subtitle, icon }: PageTitleProps) {
  useEffect(() => {
    // Sauvegarde du titre original pour le restaurer au démontage
    const originalTitle = document.title;
    
    // Met à jour le titre avec le format "FYNE - For Your Next Experience - [titre de la page]"
    document.title = `FYNE - For Your Next Experience - ${title}`;
    
    // Nettoie au démontage du composant
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
  
  // Si aucun subtitle ou icon n'est fourni, ne rend rien dans le DOM
  if (!subtitle && !icon) {
    return null;
  }

  // Sinon, rend un en-tête visuel
  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        {icon && <div className="mr-3">{icon}</div>}
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-white mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}