import Header from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import ConfigPanel from "@/components/cyber/ConfigPanel";
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
    rotation: number;
    rotationSpeed: number;
  }>>([]);

  // Génération et animation des icônes de cybersécurité flottantes
  useEffect(() => {
    // Création d'icônes de cybersécurité flottantes
    const icons = [
      <Shield size={32} />,
      <Lock size={32} />,
      <AlertCircle size={32} />,
      <Cpu size={32} />,
      <Code size={32} />,
      <Server size={32} />,
      <Database size={32} />
    ];
    
    // Génération d'éléments animés - augmentation du nombre et de la taille
    const items = Array.from({ length: 25 }, (_, i) => ({
      icon: icons[Math.floor(Math.random() * icons.length)],
      x: Math.random() * 100,
      y: Math.random() * 100, 
      size: 1 + Math.random() * 1.2, // Tailles plus grandes
      opacity: 0.15 + Math.random() * 0.25, // Opacité plus forte
      speed: 0.15 + Math.random() * 0.3, // Vitesse plus rapide
      direction: Math.random() > 0.5 ? 1 : -1,
      rotation: Math.random() * 360, // Ajout d'une rotation
      rotationSpeed: (Math.random() - 0.5) * 0.5 // Vitesse de rotation
    }));
    
    setAnimationItems(items);
    
    // Animation des éléments avec rotation, trajectoire sinusoïdale plus prononcée
    const interval = setInterval(() => {
      setAnimationItems(prev => 
        prev.map(item => ({
          ...item,
          x: (item.x + item.speed * item.direction + 100) % 100,
          y: (item.y + Math.sin(item.x / 10) * 0.4 + 100) % 100, // Amplitude de mouvement augmentée
          rotation: (item.rotation + item.rotationSpeed) % 360,
          // Variation d'opacité légère pour effet de scintillement
          opacity: item.opacity * (0.9 + Math.random() * 0.2),
        }))
      );
    }, 30); // Interval encore plus court pour animation plus fluide
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white">
      <Header />
      
      {/* Background animation elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {animationItems.map((item, index) => (
          <div 
            key={index}
            className="absolute text-blue-500 cyber-icon-trail"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `scale(${item.size}) rotate(${item.rotation}deg)`,
              opacity: item.opacity,
              filter: "drop-shadow(0 0 12px rgba(59, 130, 246, 0.7))",
            }}
          >
            {item.icon}
          </div>
        ))}
        
        {/* Grille cyber */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(29,78,216,0.25)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-indigo-500/20 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-2/3 left-1/3 w-72 h-72 bg-cyan-500/15 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
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