import { Settings, HelpCircle, Home } from "lucide-react";
import { useChatContext } from "@/contexts/ChatContext";
import { useLocation } from "wouter";
import mclogo from "@assets/mc2i.png";

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
            <a href="/"
              className="text-neutral-500 hover:text-neutral-700 transition-colors duration-200 flex items-center gap-1 cursor-pointer"
            >
              <Home className="h-5 w-5" />
              <span className="hidden sm:inline">Accueil</span>
            </a>
          )}
          <button className="text-neutral-500 hover:text-neutral-700 transition-colors duration-200">
            <Settings className="h-5 w-5" />
          </button>
          <button className="text-neutral-500 hover:text-neutral-700 transition-colors duration-200">
            <HelpCircle className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            {userName ? (
              <>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                  {userInitial}
                </div>
                <span className="text-neutral-700 font-medium hidden sm:inline-block">
                  Bonjour {userName}
                </span>
              </>
            ) : (
              <span className="text-neutral-700 font-medium">Bienvenue</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
