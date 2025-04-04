import { Home } from "lucide-react";
import { useChatContext } from "@/contexts/ChatContext";
import { useLocation, Link } from "wouter";
import mclogo from "@assets/mc2i.png";

// Fonction utilitaire pour extraire le prénom (dupliquée ici pour éviter les dépendances circulaires)
const extractFirstName = (input: string): string => {
  if (!input) return "";
  
  // Étape 1: Nettoyer l'entrée
  let cleanedInput = input.trim().toLowerCase();
  
  // Étape 2: Liste étendue des patterns d'introduction à supprimer
  const introPatterns = [
    /(je\s+suis)/gi,
    /(je\s+m['']\s*appelle)/gi,
    /(mon\s+nom\s+est)/gi,
    /(mon\s+prénom\s+est)/gi,
    /(je\s+me\s+prénomme)/gi,
    /(je\s+me\s+nomme)/gi,
    /(je\s+me\s+présente)/gi,
    /(c'est)/gi,
    /(moi\s+c'est)/gi
  ];
  
  // Étape 3: Supprimer toutes les formules d'introduction
  for (const pattern of introPatterns) {
    cleanedInput = cleanedInput.replace(pattern, '');
  }
  
  // Étape 4: Supprimer les caractères de ponctuation et espaces excessifs
  cleanedInput = cleanedInput.replace(/[,.;:!?]/g, '').trim();
  
  // Étape 5: Extraire le premier mot (prénom)
  const firstWord = cleanedInput.split(/\s+/)[0];
  
  // Étape 6: Mettre la première lettre en majuscule
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
};

interface HeaderProps {
  isFeny?: boolean;
}

export default function Header({ isFeny = false }: HeaderProps) {
  const { userName } = useChatContext();
  const [location] = useLocation();
  
  // Extraire le prénom propre et obtenir son initiale
  const displayName = userName ? extractFirstName(userName) : "";
  const userInitial = displayName ? displayName.charAt(0).toUpperCase() : "U";

  return (
    <header className="bg-white shadow-sm w-full border-b border-gray-100">
      <div className="w-full px-5 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <a href="/"
            className="flex items-center gap-3 cursor-pointer"
          >
            <img src={mclogo} alt="mc2i Logo" className="h-8" />
            <span className="text-neutral-300">|</span>
            <div className="text-blue-600 text-xl font-bold">
              {isFeny ? 'FYNE' : (
                location.includes('/cyber') ? 'I AM CYBER' : 
                location.includes('/data-ia') ? 'I AM DATA & IA' : 
                location.includes('/amoa') ? 'I AM AMOA' : 
                'FYNE'
              )}
            </div>
          </a>
        </div>
        <div className="flex items-center gap-5">
          {!isFeny && (
            <Link href="/"
              className="text-neutral-500 hover:text-neutral-700 transition-colors duration-200 flex items-center gap-1 cursor-pointer"
            >
              <Home className="h-5 w-5" />
              <span className="hidden sm:inline">Accueil</span>
            </Link>
          )}
          <div className="flex items-center gap-2">
            {userName && (
              <>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                  {userInitial}
                </div>
                <span className="text-neutral-700 font-medium hidden sm:inline-block">
                  Bonjour {displayName}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
