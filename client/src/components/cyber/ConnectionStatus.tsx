import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ConnectionStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'reconnecting' | 'checking'>('checking');
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  // GPT-4o est désormais le seul modèle utilisé
  const [modelName, setModelName] = useState<string>('GPT-4o');
  
  const checkStatus = async () => {
    try {
      setStatus('checking');
      const response = await fetch('/api/cyber/status');
      
      if (!response.ok) {
        console.error(`Error response: ${response.status} ${response.statusText}`);
        setStatus('disconnected');
        return;
      }
      
      const data = await response.json();
      
      // Utiliser les données réelles de l'API
      setStatus(data.status);
      setLastCheck(data.time);
      setModelName(data.modelName || 'GPT-4o');
    } catch (error) {
      console.error('Error checking connection status:', error);
      // En cas d'erreur, indiquer déconnecté
      setStatus('disconnected');
    }
  };
  
  useEffect(() => {
    // Vérifier au chargement
    checkStatus();
    
    // Puis vérifier toutes les minutes
    const interval = setInterval(checkStatus, 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex items-center space-x-2">
      <div className={cn(
        "flex items-center px-3 py-1 rounded-full text-xs font-medium",
        status === 'connected' ? "bg-green-800/40 text-white border border-green-500/30" :
        status === 'reconnecting' ? "bg-yellow-800/40 text-white border border-yellow-500/30" :
        "bg-red-800/40 text-white border border-red-500/30"
      )}>
        {status === 'connected' ? (
          <>
            <Wifi className="w-3 h-3 mr-1 text-green-500" />
            <span className="text-green-500 font-medium">FYNE connecté</span>
          </>
        ) : status === 'reconnecting' ? (
          <>
            <AlertTriangle className="w-3 h-3 mr-1 text-yellow-400" />
            <span>Reconnexion en cours...</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 mr-1 text-red-500" />
            <span className="text-red-500 font-medium">FYNE déconnecté</span>
          </>
        )}
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className="py-1 text-xs font-medium bg-blue-800/40 text-white border border-blue-500/30"
            >
              {modelName}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>GPT-4o</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}