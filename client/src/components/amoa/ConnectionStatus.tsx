import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertTriangle, RefreshCw, CircleOff, CheckCircle, XCircle, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  const [modelName, setModelName] = useState<string>('Claude 3.5 Sonnet');
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
      
      // La valeur currentApiKey est une chaîne représentant le type de clé (primary ou secondary)
      if (typeof data.currentApiKey === 'string') {
        setCurrentKey(data.currentApiKey as ApiKeyType);
      } else {
        // Si on reçoit un objet de configuration complet au lieu d'une chaîne, 
        // déterminer le type en fonction du nom du modèle
        setCurrentKey((data.modelName && (data.modelName.includes('Haiku') || data.modelName.includes('mini'))) ? 'secondary' : 'primary');
      }
      
      // Mettre à jour le nom du modèle en fonction des données ou du type de clé
      setModelName(data.modelName || (data.currentApiKey === 'primary' ? 'Claude 3.5 Sonnet' : 'Claude 3 Haiku'));
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
      // La réponse de l'API contient la valeur 'primary' ou 'secondary' dans currentApiKey
      if (data && data.currentApiKey) {
        if (typeof data.currentApiKey === 'string') {
          setCurrentKey(data.currentApiKey as ApiKeyType);
        } else {
          // Si on reçoit un objet au lieu d'une chaîne, utiliser le nouveau type comme fallback
          setCurrentKey(newKeyType);
        }
      } else {
        // Fallback au nouveau type si la réponse ne contient pas de currentApiKey
        setCurrentKey(newKeyType);
      }
      
      // Mettre à jour le nom du modèle en fonction des données retournées ou du type de clé
      if (data && data.modelName) {
        setModelName(data.modelName);
      } else {
        setModelName(newKeyType === 'primary' ? 'Claude 3.5 Sonnet' : 'Claude 3 Haiku');
      }
      
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
    <div className="flex items-center gap-1.5">
      {/* Badge FYNE */}
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
      
      {/* Bouton de rechargement */}
      <Button 
        variant="outline" 
        size="icon" 
        className="h-5 w-5 rounded-full border-slate-300 p-0 min-w-0 bg-white" 
        onClick={checkStatus}
        disabled={status === 'checking' || status === 'reconnecting'}
      >
        {status === 'checking' ? (
          <RefreshCw className="h-2.5 w-2.5 animate-spin text-slate-600" />
        ) : (
          <RefreshCw className="h-2.5 w-2.5 text-slate-600" />
        )}
      </Button>
      
      {/* Switch Eco (version simplifiée) */}
      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white rounded-full shadow-sm">
        <span className="text-[8px] font-medium text-slate-700">Eco</span>
        <Switch
          checked={currentKey === 'secondary'}
          onCheckedChange={(checked: boolean) => {
            if (checked !== (currentKey === 'secondary')) {
              switchApiKey();
            }
          }}
          disabled={switchingKey || status === 'checking' || status === 'reconnecting'}
          className="scale-75"
        />
      </div>
    </div>
  );
  
  // Version complète pour desktop
  const DesktopVersion = () => (
    <div className="flex items-center space-x-3">
      {/* Badge FYNE Connecté */}
      <div className={cn(
        "flex items-center px-3 py-1.5 rounded-full text-xs font-medium",
        status === 'connected' ? "bg-green-600 text-white" :
        status === 'reconnecting' ? "bg-yellow-600 text-white" :
        "bg-red-600 text-white"
      )}>
        {status === 'connected' ? (
          <>
            <CheckCircle className="w-3 h-3 mr-1.5" />
            <span className="font-medium">FYNE Connecté</span>
          </>
        ) : status === 'reconnecting' ? (
          <>
            <LoaderCircle className="w-3 h-3 mr-1.5 animate-spin" />
            <span>FYNE Reconnexion...</span>
          </>
        ) : (
          <>
            <XCircle className="w-3 h-3 mr-1.5" />
            <span className="font-medium">FYNE Déconnecté</span>
          </>
        )}
      </div>
      
      {/* Bouton de rechargement */}
      <Button 
        variant="outline" 
        size="icon" 
        className="h-8 w-8 rounded-full border-slate-300 bg-white" 
        onClick={checkStatus}
        disabled={status === 'checking' || status === 'reconnecting'}
      >
        {status === 'checking' ? (
          <RefreshCw className="h-4 w-4 animate-spin text-slate-600" />
        ) : (
          <RefreshCw className="h-4 w-4 text-slate-600" />
        )}
      </Button>
      
      {/* Switch Eco */}
      <div className="flex items-center gap-2 px-2 py-1 bg-white rounded-full shadow-sm">
        <span className="text-xs font-medium text-slate-700">Eco</span>
        <Switch
          checked={currentKey === 'secondary'}
          onCheckedChange={(checked: boolean) => {
            if (checked !== (currentKey === 'secondary')) {
              switchApiKey();
            }
          }}
          disabled={switchingKey || status === 'checking' || status === 'reconnecting'}
          className={switchingKey ? "opacity-50" : ""}
        />
      </div>
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