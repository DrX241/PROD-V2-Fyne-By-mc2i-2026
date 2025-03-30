import { Settings, HelpCircle, Shield, Home } from "lucide-react";
import { useChatContext } from "@/contexts/ChatContext";
import { Link } from "wouter";
import mclogo from "@assets/mc2i.png";

export default function Header() {
  const { userName } = useChatContext();
  
  // Get the first letter of the username for the avatar
  const userInitial = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <header className="bg-white shadow-sm w-full border-b border-gray-100">
      <div className="w-full px-5 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <a className="flex items-center gap-3">
              <img src={mclogo} alt="mc2i Logo" className="h-8" />
              <span className="text-neutral-300">|</span>
              <div className="text-primary text-lg font-bold heading">I AM CYBER</div>
            </a>
          </Link>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/">
            <a className="text-neutral-500 hover:text-neutral-700 transition-colors duration-200 flex items-center gap-1">
              <Home className="h-5 w-5" />
              <span className="hidden sm:inline">Accueil</span>
            </a>
          </Link>
          <button className="text-neutral-500 hover:text-neutral-700 transition-colors duration-200">
            <Settings className="h-5 w-5" />
          </button>
          <button className="text-neutral-500 hover:text-neutral-700 transition-colors duration-200">
            <HelpCircle className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            {userName ? (
              <>
                <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-medium">
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
