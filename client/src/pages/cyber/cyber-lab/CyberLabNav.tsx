import React from 'react';
import { useLocation } from 'wouter';
import { 
  ArrowLeft,
  Network,
  Shield,
  Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ModuleType = 'pentest' | 'network';

interface CyberLabNavProps {
  activeModule: ModuleType;
}

export const CyberLabNav: React.FC<CyberLabNavProps> = ({ activeModule }) => {
  const [, setLocation] = useLocation();
  
  const switchModule = (module: ModuleType) => {
    if (module === 'pentest') {
      setLocation('/cyber/pentest-lab');
    } else if (module === 'network') {
      setLocation('/cyber/network-lab');
    }
  };
  
  return (
    <div className="bg-black/70 backdrop-blur-sm border-b border-cyan-900/50 py-2 px-6 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocation('/cyber')}
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors duration-200 py-2 px-3 rounded-md hover:bg-cyan-950/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </button>
          
          <span className="text-gray-600 mx-2">|</span>
          
          <div className="text-lg font-medium text-cyan-300">CYBER LAB</div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => switchModule('pentest')}
            className={cn(
              "flex items-center gap-2 py-2 px-4 rounded-md transition-all duration-200",
              activeModule === 'pentest'
                ? "bg-purple-900/40 text-purple-300 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-purple-300 hover:bg-purple-900/20"
            )}
          >
            <Terminal className="w-4 h-4" />
            <span>Atelier de Pentest Web</span>
          </button>
          
          <button
            onClick={() => switchModule('network')}
            className={cn(
              "flex items-center gap-2 py-2 px-4 rounded-md transition-all duration-200",
              activeModule === 'network'
                ? "bg-cyan-900/40 text-cyan-300 border-b-2 border-cyan-400"
                : "text-gray-400 hover:text-cyan-300 hover:bg-cyan-900/20"
            )}
          >
            <Network className="w-4 h-4" />
            <span>Analyse de trafic réseau</span>
          </button>
        </div>
      </div>
    </div>
  );
};