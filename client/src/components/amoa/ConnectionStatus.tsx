import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertTriangle, RefreshCw, CircleOff, CheckCircle, XCircle, LoaderCircle } from 'lucide-react';
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
  const [modelName, setModelName] = useState<string>('GPT-4o');
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
      
      // Utiliser les données réelles de l'API
      setStatus(data.status);
      setLastCheck(data.time);
      setCurrentKey(data.currentApiKey || 'primary');
      setModelName(data.modelName || 'GPT-4o');
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
        throw new Error(`Erreur lors du changement de modèle: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Mettre à jour l'état avec les données réelles retournées par le serveur
      setCurrentKey(data.currentApiKey || newKeyType);
      setModelName(data.modelName || (newKeyType === 'primary' ? 'GPT-4o' : 'GPT-4o-mini'));
      
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
    return key === 'primary' ? 'Standard' : 'Économie';
  };
  
  // Version simplifiée pour mobile
  const MobileVersion = () => (
    <div className="flex items-center max-w-[110px] overflow-visible">
      <div className={cn(
        "flex items-center px-1.5 xs:px-2 py-0.5 rounded-full text-[9px] xs:text-[10px]",
        status === 'connected' ? "bg-green-600 text-white" :
        status === 'reconnecting' ? "bg-yellow-600 text-white" :
        "bg-red-600 text-white"
      )}>
        {status === 'connected' ? (
          <>
            <CheckCircle className="w-2 xs:w-2.5 h-2 xs:h-2.5 mr-0.5" />
            <span className="font-medium">FYNE</span>
          </>
        ) : status === 'reconnecting' ? (
          <>
            <LoaderCircle className="w-2 xs:w-2.5 h-2 xs:h-2.5 mr-0.5 animate-spin" />
            <span>FYNE</span>
          </>
        ) : (
          <>
            <XCircle className="w-2 xs:w-2.5 h-2 xs:h-2.5 mr-0.5" />
            <span className="font-medium">FYNE</span>
          </>
        )}
      </div>
      
      <Badge 
        variant="outline" 
        className={cn(
          "ml-1 py-0.5 px-1 xs:px-1.5 text-[8px] xs:text-[10px]",
          currentKey === 'primary' 
            ? "bg-blue-800/40 text-white border border-blue-500/30" 
            : "bg-purple-800/40 text-white border border-purple-500/30"
        )}
      >
        {currentKey === 'primary' ? "4o" : "mini"}
      </Badge>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-4 xs:h-5 w-4 xs:w-5 ml-0.5" 
        onClick={switchApiKey}
        disabled={switchingKey || status === 'checking' || status === 'reconnecting'}
      >
        {switchingKey ? (
          <RefreshCw className="h-2 xs:h-2.5 w-2 xs:w-2.5 animate-spin" />
        ) : (
          <RefreshCw className="h-2 xs:h-2.5 w-2 xs:w-2.5" />
        )}
      </Button>
    </div>
  );
  
  // Version complète pour desktop
  const DesktopVersion = () => (
    <div className="flex items-center space-x-2">
      <div className={cn(
        "flex items-center px-2 py-1 rounded-full text-xs font-medium",
        status === 'connected' ? "bg-green-600 text-white" :
        status === 'reconnecting' ? "bg-yellow-600 text-white" :
        "bg-red-600 text-white"
      )}>
        {status === 'connected' ? (
          <>
            <CheckCircle className="w-3 h-3 mr-1" />
            <span className="font-medium">FYNE Connecté</span>
          </>
        ) : status === 'reconnecting' ? (
          <>
            <LoaderCircle className="w-3 h-3 mr-1 animate-spin" />
            <span>Reconnexion...</span>
          </>
        ) : (
          <>
            <XCircle className="w-3 h-3 mr-1" />
            <span className="font-medium">FYNE Déconnecté</span>
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
              {modelName}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mode {getKeyLabel(currentKey)}</p>
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
  
  return (
    <>
      {/* Version mobile */}
      <div className="sm:hidden">
        <MobileVersion />
      </div>
      
      {/* Version desktop */}
      <div className="hidden sm:block">
        <DesktopVersion />
      </div>
    </>
  );
}