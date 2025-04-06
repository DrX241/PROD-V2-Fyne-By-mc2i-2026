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
  const [modelName, setModelName] = useState<string>('GPT-4o');
  const [switchingKey, setSwitchingKey] = useState<boolean>(false);
  
  const checkStatus = async () => {
    try {
      setStatus('checking');
      const response = await apiRequest('GET', '/api/cyber/status');
      const data = await response.json();
      setStatus(data.status);
      setLastCheck(data.time);
      setCurrentKey(data.currentApiKey || 'primary');
      setModelName(data.modelName || 'GPT-4o');
    } catch (error) {
      console.error('Error checking connection status:', error);
      setStatus('disconnected');
    }
  };
  
  const switchApiKey = async () => {
    try {
      setSwitchingKey(true);
      // Basculer vers l'autre clé
      const newKeyType: ApiKeyType = currentKey === 'primary' ? 'secondary' : 'primary';
      
      const response = await apiRequest('POST', '/api/cyber/switch-api-key', {
        keyType: newKeyType
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setCurrentKey(data.currentApiKey);
        setModelName(data.modelName);
        
        // Vérifier immédiatement le statut de la connexion
        await checkStatus();
      }
    } catch (error) {
      console.error('Error switching API key:', error);
    } finally {
      setSwitchingKey(false);
    }
  };
  
  useEffect(() => {
    // Vérifier au chargement
    checkStatus();
    
    // Puis vérifier toutes les 2 minutes
    const interval = setInterval(checkStatus, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getKeyLabel = (key: ApiKeyType): string => {
    return key === 'primary' ? 'Standard' : 'Économique';
  };
  
  return (
    <div className="flex items-center space-x-2">
      <div className={cn(
        "flex items-center px-3 py-1 rounded-full text-xs font-medium",
        status === 'connected' ? "bg-[#006a9e]/40 text-white border border-[#006a9e]/30" :
        status === 'reconnecting' ? "bg-yellow-800/40 text-white border border-yellow-500/30" :
        "bg-[#006a9e]/40 text-white border border-[#006a9e]/30"
      )}>
        {status === 'connected' ? (
          <>
            <Wifi className="w-3 h-3 mr-1 text-[#006a9e]" />
            <span>FYNE connecté</span>
          </>
        ) : status === 'reconnecting' ? (
          <>
            <AlertTriangle className="w-3 h-3 mr-1 text-yellow-400" />
            <span>Reconnexion en cours...</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 mr-1 text-[#006a9e]" />
            <span>FYNE déconnecté</span>
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
}