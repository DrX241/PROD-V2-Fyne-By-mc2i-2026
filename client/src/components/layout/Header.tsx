import { useChatContext } from "@/contexts/ChatContext";
import { useLocation } from "wouter";
import mclogo from "@/assets/mc2i.png";
import OpenAIStatusIndicator from '@/components/OpenAIStatusIndicator';

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
    <header className="bg-white shadow-sm w-full border-b border-gray-100 max-w-[100vw] overflow-hidden fixed top-0 left-0 right-0 z-50">
      <div className="w-full px-3 sm:px-5 md:px-8 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center">
          <a href="/"
            className="flex items-center gap-2 sm:gap-3 cursor-pointer"
          >
            <img src={mclogo} alt="mc2i Logo" className="h-6 sm:h-8" />
            <span className="text-neutral-300 hidden xs:inline-block">|</span>
            <div className="text-blue-600 text-base sm:text-xl font-bold whitespace-nowrap">
              {isFeny ? 'FYNE' : (
                location.includes('/cyber') ? 'I AM CYBER' : 
                location.includes('/data-ia') ? 'I AM DATA & IA' : 
                location.includes('/amoa') ? 'I AM AMOA' : 
                'FYNE'
              )}
            </div>
          </a>
        </div>
        <div className="flex items-center gap-2 sm:gap-5">
          {/* Indicateur OpenAI affiché dans tous les cas */}
          <div className="flex items-center">
            <OpenAIStatusIndicator position="in-header" showModelToggle={true} />
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {userName && (
              <>
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-xs sm:text-base">
                  {userInitial}
                </div>
                <span className="text-neutral-700 text-xs sm:text-sm font-medium hidden sm:inline-block">
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
