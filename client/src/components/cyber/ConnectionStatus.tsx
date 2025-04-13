import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertTriangle, RefreshCw, CircleOff } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type ApiKeyType = 'primary' | 'secondary';

export default function ConnectionStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'reconnecting' | 'checking'>('checking');
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [currentKey, setCurrentKey] = useState<ApiKeyType>('primary');
  const [switchingKey, setSwitchingKey] = useState<boolean>(false);
  
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
      
      // Utiliser les données réelles de l'API sans référence au modèle
      setStatus(data.status);
      setLastCheck(data.time);
      setCurrentKey(data.currentApiKey || 'primary');
    } catch (error) {
      console.error('Error checking connection status:', error);
      // En cas d'erreur, indiquer déconnecté
      setStatus('disconnected');
    }
  };
  
  const switchApiKey = async () => {
    try {
      setSwitchingKey(true);
      // Basculer vers l'autre clé
      const newKeyType: ApiKeyType = currentKey === 'primary' ? 'secondary' : 'primary';
      
      // Envoi de la requête au serveur
      const response = await fetch('/api/cyber/switch-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyType: newKeyType })
      });
      
      if (!response.ok) {
        console.error(`Error switching API key: ${response.status} ${response.statusText}`);
        throw new Error(`Erreur lors du changement de mode: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Mettre à jour l'état avec les données réelles retournées par le serveur
      setCurrentKey(data.currentApiKey || newKeyType);
      
      // Vérifier l'état de la connexion après le changement
      setTimeout(checkStatus, 500);
    } catch (error) {
      console.error('Error switching API key:', error);
      // En cas d'erreur, ne pas changer l'état et vérifier la connexion
      setTimeout(checkStatus, 500);
    } finally {
      setSwitchingKey(false);
    }
  };
  
  useEffect(() => {
    // Vérifier au chargement
    checkStatus();
    
    // Puis vérifier toutes les minutes
    const interval = setInterval(checkStatus, 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getKeyLabel = (key: ApiKeyType): string => {
    return key === 'primary' ? 'Standard' : 'Économique';
  };
  
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
              className={cn(
                "py-1 text-xs font-medium",
                currentKey === 'primary' 
                  ? "bg-blue-800/40 hover:bg-blue-800/60 text-white border border-blue-500/30" 
                  : "bg-purple-800/40 hover:bg-purple-800/60 text-white border border-purple-500/30"
              )}
            >
              Mode {currentKey === 'primary' ? 'Standard' : 'Économique'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sélectionner le mode de fonctionnement</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={switchApiKey}
              disabled={switchingKey || status === 'checking' || status === 'reconnecting'}
            >
              {switchingKey ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : status === 'disconnected' ? (
                <CircleOff className="h-3.5 w-3.5" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Basculer vers le mode {getKeyLabel(currentKey === 'primary' ? 'secondary' : 'primary')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}