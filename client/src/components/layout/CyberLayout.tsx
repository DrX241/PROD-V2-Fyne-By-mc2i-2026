import Header from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import ConfigPanel from "@/components/cyber/ConfigPanel";
import { useChatContext } from "@/contexts/ChatContext";
import { useState } from "react";
import { ChevronRight, Settings } from "lucide-react";

interface CyberLayoutProps {
  children: React.ReactNode;
}

export default function CyberLayout({ children }: CyberLayoutProps) {
  const { scenario } = useChatContext();
  const isMobile = useIsMobile();
  const [showConfig, setShowConfig] = useState(false);
  
  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 flex w-full overflow-hidden" style={{ height: 'calc(100vh - 70px)' }}>
        {/* Zone principale de contenu */}
        <div className="flex-1 overflow-y-auto flex justify-center">
          <div className="w-full max-w-5xl overflow-y-auto">
            {children}
          </div>
        </div>
        
        {/* Panneau latéral de config (visible uniquement en desktop) */}
        {!isMobile ? (
          <div 
            className={`bg-white border-l border-gray-100 transition-all duration-300 ${
              showConfig ? 'w-80' : 'w-0 opacity-0'
            } overflow-hidden`}
          >
            {showConfig && (
              <div className="p-4 h-full">
                <ConfigPanel />
              </div>
            )}
          </div>
        ) : null}
        
        {/* Bouton pour ouvrir/fermer le panneau de config */}
        {!isMobile && (
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-white border border-gray-100 shadow-sm rounded-l-md p-3 z-20 hover:bg-gray-50"
          >
            <Settings className={`h-5 w-5 text-gray-600 transition-transform ${showConfig ? 'rotate-180' : ''}`} />
          </button>
        )}
      </main>
    </div>
  );
}