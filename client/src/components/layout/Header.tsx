import { useChatContext } from "@/contexts/ChatContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation } from "wouter";
import mclogo from "@/assets/mc2i.png";
import OpenAIStatusIndicator from '@/components/OpenAIStatusIndicator';
import ThemeSwitch from '@/components/ThemeSwitch';

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

export default function Header() {
  const { userName } = useChatContext();
  const { themeMode } = useTheme();
  
  // Extraire le prénom propre et obtenir son initiale
  const displayName = userName ? extractFirstName(userName) : "";
  const userInitial = displayName ? displayName.charAt(0).toUpperCase() : "U";
  
  // Détermine les styles en fonction du thème
  const headerBgClass = themeMode === 'futuristic' 
    ? 'bg-gray-900 shadow-md border-b border-blue-900/50' 
    : 'bg-white shadow-sm border-b border-gray-100';
    
  // Classes pour l'affichage de l'utilisateur  
  const userInitialBgClass = themeMode === 'futuristic'
    ? 'bg-blue-900 text-cyan-300'
    : 'bg-blue-100 text-blue-600';
    
  const userNameClass = themeMode === 'futuristic'
    ? 'text-blue-200'
    : 'text-neutral-700';

  return (
    <header className={`w-full max-w-[100vw] overflow-hidden fixed top-0 left-0 right-0 z-50 ${headerBgClass}`}>
      <div className="w-full px-3 sm:px-5 md:px-8 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center">
          {/* Switch de thème classique/futuriste - rendu bien visible */}
          <div className="flex items-center mr-6">
            <ThemeSwitch className="z-20" />
          </div>

          <a href="/"
            className="flex items-center cursor-pointer"
          >
            <img src={mclogo} alt="mc2i Logo" className="h-7 sm:h-9" />
          </a>
        </div>
        <div className="flex items-center gap-2 sm:gap-5">
          {/* Indicateur OpenAI affiché dans tous les cas */}
          <div className="flex items-center">
            <OpenAIStatusIndicator position="in-header" showModelToggle={true} />
          </div>
          
          {/* Affichage de l'utilisateur existant */}
          {userName && (
            <div className="flex items-center gap-1 sm:gap-2 mr-3">
              <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full ${userInitialBgClass} flex items-center justify-center font-medium text-xs sm:text-base`}>
                {userInitial}
              </div>
              <span className={`${userNameClass} text-xs sm:text-sm font-medium hidden sm:inline-block`}>
                Bonjour {displayName}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
