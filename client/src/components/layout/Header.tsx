import { Settings, HelpCircle, Shield } from "lucide-react";
import { useChatContext } from "@/contexts/ChatContext";

export default function Header() {
  const { userName } = useChatContext();
  
  // Get the first letter of the username for the avatar
  const userInitial = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <header className="bg-white shadow-sm w-full border-b border-gray-100">
      <div className="w-full px-5 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-1.5 rounded-md">
              <Shield className="h-5 w-5" />
            </div>
            <div className="text-primary text-xl font-bold heading hover-underline cursor-pointer">FENY</div>
            <span className="text-neutral-300">|</span>
            <div className="text-secondary text-lg font-medium hover-underline cursor-pointer">I AM CYBER</div>
          </div>
        </div>
        <div className="flex items-center gap-5">
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
