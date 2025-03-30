import Header from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import ConfigPanel from "@/components/cyber/ConfigPanel";
import { useChatContext } from "@/contexts/ChatContext";
import { useState } from "react";
import { Settings, Shield } from "lucide-react";

interface CyberLayoutProps {
  children: React.ReactNode;
}

export default function CyberLayout({ children }: CyberLayoutProps) {
  const { scenario } = useChatContext();
  const isMobile = useIsMobile();
  const [showConfig, setShowConfig] = useState(false);
  
  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white">
      <Header />

      <main className="flex-1 flex w-full overflow-hidden relative z-10" style={{ height: 'calc(100vh - 70px)' }}>
        {/* Zone principale de contenu - simplifiée, sans panneaux latéraux */}
        <div className="flex-1 overflow-y-auto flex justify-center">
          <div className="w-full max-w-5xl overflow-y-auto backdrop-blur-sm bg-black/10 rounded-lg shadow-xl my-4 mx-4">
            {children}
          </div>
        </div>
        
        {/* Bouton pour ouvrir/fermer le panneau de config */}
        {!isMobile && (
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-blue-900/80 hover:bg-blue-800/90 backdrop-blur-sm border border-blue-700/50 shadow-lg rounded-l-md p-3 z-20 transition-all duration-300"
          >
            <Settings className={`h-5 w-5 text-blue-100 transition-transform duration-300 ${showConfig ? 'rotate-180' : ''}`} />
          </button>
        )}
        
        {/* Panneau de configuration flottant minimal */}
        {!isMobile && showConfig && (
          <div className="fixed right-0 top-1/2 transform -translate-y-1/2 translate-x-[-80px] w-80 max-h-[60vh] overflow-y-auto scrollbar-cyber bg-gray-900/90 backdrop-blur-md border border-blue-700/50 rounded-l-lg shadow-xl z-10 p-4">
            <ConfigPanel />
          </div>
        )}
      </main>
    </div>
  );
}