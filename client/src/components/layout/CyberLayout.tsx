import Header from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import ConfigPanel from "@/components/cyber/ConfigPanel";
import ConnectionStatus from "@/components/cyber/ConnectionStatus";
import { useChatContext } from "@/contexts/ChatContext";
import { useState, useEffect } from "react";
import { ShieldCheck, Settings, Lock, AlertCircle, Shield, Cpu, Code, Server, Database } from "lucide-react";

interface CyberLayoutProps {
  children: React.ReactNode;
}

export default function CyberLayout({ children }: CyberLayoutProps) {
  const { scenario } = useChatContext();
  const isMobile = useIsMobile();
  const [showConfig, setShowConfig] = useState(false);
  const [animationItems, setAnimationItems] = useState<Array<{
    icon: JSX.Element;
    x: number;
    y: number;
    size: number;
    opacity: number;
    speed: number;
    direction: number;
  }>>([]);

  // Génération et animation des icônes de cybersécurité flottantes
  useEffect(() => {
    // Création d'icônes de cybersécurité flottantes
    const icons = [
      <Shield size={24} />,
      <Lock size={24} />,
      <AlertCircle size={24} />,
      <Cpu size={24} />,
      <Code size={24} />,
      <Server size={24} />,
      <Database size={24} />
    ];
    
    // Génération d'éléments animés
    const items = Array.from({ length: 12 }, (_, i) => ({
      icon: icons[Math.floor(Math.random() * icons.length)],
      x: Math.random() * 100,
      y: Math.random() * 100, 
      size: 0.7 + Math.random() * 0.5,
      opacity: 0.05 + Math.random() * 0.1,
      speed: 0.1 + Math.random() * 0.2,
      direction: Math.random() > 0.5 ? 1 : -1
    }));
    
    setAnimationItems(items);
    
    // Animation des éléments
    const interval = setInterval(() => {
      setAnimationItems(prev => 
        prev.map(item => ({
          ...item,
          x: (item.x + item.speed * item.direction) % 100,
          y: (item.y + Math.sin(item.x / 20) * 0.1) % 100,
        }))
      );
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white">
      <Header />
      
      {/* Affichage du statut de connexion */}
      <div className="absolute top-4 right-4 z-30">
        <ConnectionStatus workflow_name="Start application" />
      </div>
      
      {/* Background animation elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-50">
        {animationItems.map((item, index) => (
          <div 
            key={index}
            className="absolute text-blue-500 opacity-20"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `scale(${item.size})`,
              opacity: item.opacity,
            }}
          >
            {item.icon}
          </div>
        ))}
        
        {/* Grille cyber */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(29,78,216,0.15)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-3xl"></div>
      </div>

      <main className="flex-1 flex w-full overflow-hidden relative z-10" style={{ height: 'calc(100vh - 70px)' }}>
        {/* Zone principale de contenu */}
        <div className="flex-1 overflow-y-auto flex justify-center">
          <div className="w-full max-w-5xl overflow-y-auto backdrop-blur-sm bg-black/10 rounded-lg shadow-xl my-4 mx-4">
            {children}
          </div>
        </div>
        
        {/* Panneau latéral de config (visible uniquement en desktop) */}
        {!isMobile ? (
          <div 
            className={`backdrop-blur-md bg-black/20 border-l border-gray-700/50 transition-all duration-500 ${
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
            className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-blue-900/80 hover:bg-blue-800/90 backdrop-blur-sm border border-blue-700/50 shadow-lg rounded-l-md p-3 z-20 transition-all duration-300"
          >
            <Settings className={`h-5 w-5 text-blue-100 transition-transform duration-300 ${showConfig ? 'rotate-180' : ''}`} />
          </button>
        )}
      </main>
    </div>
  );
}