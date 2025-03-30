import { Settings, HelpCircle } from "lucide-react";
import { useChatContext } from "@/contexts/ChatContext";

export default function Header() {
  const { userName } = useChatContext();
  
  // Get the first letter of the username for the avatar
  const userInitial = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center gap-2">
            <div className="text-primary-600 text-xl font-bold heading">FENY</div>
            <span className="text-neutral-300">|</span>
            <div className="text-secondary-600 text-lg font-medium">I AM CYBER</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-neutral-500 hover:text-neutral-700">
            <Settings className="h-5 w-5" />
          </button>
          <button className="text-neutral-500 hover:text-neutral-700">
            <HelpCircle className="h-5 w-5" />
          </button>
          <div className="flex items-center">
            <span className="text-neutral-700 font-medium">
              {userName ? `Bonjour ${userName}` : "Bienvenue"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
