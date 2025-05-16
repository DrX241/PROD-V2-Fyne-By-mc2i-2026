import React from 'react';
import { useLocation } from 'wouter';
import { Network, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ModuleType = 'pentest' | 'network';

interface CyberLabNavProps {
  activeModule: ModuleType;
}

export const CyberLabNav: React.FC<CyberLabNavProps> = ({ activeModule }) => {
  const [, setLocation] = useLocation();
  
  const switchModule = (module: ModuleType) => {
    if (module === 'pentest') {
      setLocation('/cyber/pentest-lab');
    } else {
      setLocation('/cyber/network-lab');
    }
  };
  
  return (
    <div className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className={`${
            activeModule === 'pentest' 
              ? 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/40 hover:text-purple-300' 
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
          } flex items-center gap-2`}
          onClick={() => switchModule('pentest')}
        >
          <Code className="h-4 w-4" />
          <span>Atelier de Pentest Web</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className={`${
            activeModule === 'network' 
              ? 'bg-cyan-900/30 text-cyan-300 hover:bg-cyan-900/40 hover:text-cyan-300' 
              : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
          } flex items-center gap-2`}
          onClick={() => switchModule('network')}
        >
          <Network className="h-4 w-4" />
          <span>Laboratoire d'analyse réseau</span>
        </Button>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        className="text-gray-400 hover:text-gray-300 hover:bg-gray-800 border-gray-700"
        onClick={() => setLocation('/cyber/cyber-lab')}
      >
        Retour au CYBER LAB
      </Button>
    </div>
  );
};