import { Home, Trash2 } from "lucide-react";
import { useChatContext } from "@/contexts/ChatContext";
import { useLocation, Link } from "wouter";
import mclogo from "@assets/mc2i.png";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  isFeny?: boolean;
}

export default function Header({ isFeny = false }: HeaderProps) {
  const { userName } = useChatContext();
  const [location] = useLocation();
  
  // Get the first letter of the username for the avatar
  const userInitial = userName ? userName.charAt(0).toUpperCase() : "U";

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
                  Bonjour {userName}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    if (window.confirm("Êtes-vous sûr de vouloir effacer toutes vos données et recommencer à zéro ? Cette action est irréversible.")) {
                      localStorage.clear();
                      window.location.href = "/";
                    }
                  }}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  <span className="hidden md:inline">Réinitialiser</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
