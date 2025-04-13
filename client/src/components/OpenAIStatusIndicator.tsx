import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, LoaderCircle, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OpenAIStatusProps {
  className?: string;
  showModelToggle?: boolean;
  position?: 'inline' | 'fixed-bottom-right' | 'fixed-bottom' | 'in-header';
}

const OpenAIStatusIndicator: React.FC<OpenAIStatusProps> = ({ 
  className, 
  showModelToggle = true, 
  position = 'fixed-bottom-right' 
}) => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [currentModel, setCurrentModel] = useState<string>('');
  const [apiKeyType, setApiKeyType] = useState<'primary' | 'secondary'>('primary');
  const [lastCheck, setLastCheck] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  
  // Formate la date du dernier check
  const formattedLastCheck = lastCheck ? new Date(lastCheck).toLocaleTimeString() : 'Jamais';
  
  // Fonction pour vérifier le statut
  const checkStatus = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/openai/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data.connectionStatus || 'disconnected');
        setCurrentModel(data.currentModel || 'Inconnu');
        setApiKeyType(data.apiKeyType || 'primary');
        setLastCheck(data.lastCheck || Date.now());
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut OpenAI:', error);
      setStatus('disconnected');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Fonction pour basculer entre les modèles
  const toggleModel = async () => {
    setIsToggling(true);
    try {
      const newKeyType = apiKeyType === 'primary' ? 'secondary' : 'primary';
      const response = await fetch('/api/cyber/switch-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyType: newKeyType }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentModel(data.modelName || (newKeyType === 'primary' ? 'gpt-4o' : 'gpt-4o-mini'));
        setApiKeyType(newKeyType);
        setStatus(data.connectionStatus || 'checking');
        
        // Vérifier le statut après le changement
        setTimeout(checkStatus, 1000);
      }
    } catch (error) {
      console.error('Erreur lors du changement de modèle OpenAI:', error);
    } finally {
      setIsToggling(false);
    }
  };
  
  // Vérifier le statut au chargement et périodiquement
  useEffect(() => {
    checkStatus();
    
    // Vérifier le statut toutes les 5 minutes
    const intervalId = setInterval(checkStatus, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Couleurs et icônes selon le statut
  const statusColors = {
    connected: 'bg-green-600',
    disconnected: 'bg-red-600',
    checking: 'bg-yellow-600'
  };
  
  const StatusIcon = status === 'connected' ? CheckCircle :
                     status === 'disconnected' ? XCircle : LoaderCircle;
  
  const modelLabel = currentModel === 'gpt-4o' ? 'GPT-4o' : 
                     currentModel === 'gpt-4o-mini' ? 'GPT-4o-mini' : 
                     'Modèle inconnu';
  
  const economyMode = apiKeyType === 'secondary';
  
  // Styles conditionnels selon la position
  let positionStyles = '';
  
  if (position === 'fixed-bottom-right') {
    positionStyles = 'fixed bottom-4 right-4 z-50 bg-opacity-90 bg-slate-900 p-2 rounded-md shadow-lg';
  } else if (position === 'fixed-bottom') {
    positionStyles = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-opacity-90 bg-slate-900 p-2 rounded-md shadow-lg';
  } else if (position === 'in-header') {
    positionStyles = 'bg-transparent'; // Style pour s'intégrer dans l'en-tête
  }
  
  return (
    <div className={`flex items-center space-x-2 ${positionStyles} ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <div className={`relative flex items-center ${status === 'checking' ? 'animate-pulse' : ''}`}>
                <Badge 
                  variant="outline" 
                  className={`px-2 py-1 flex items-center gap-1 ${statusColors[status]} text-white ${position === 'in-header' ? 'scale-75 xs:scale-90' : ''}`}
                >
                  <StatusIcon className={`${position === 'in-header' ? 'w-2 h-2 xs:w-3 xs:h-3' : 'w-3 h-3'}`} />
                  <span className={`${position === 'in-header' ? 'text-[10px] xs:text-xs' : 'text-xs'} font-medium`}>
                    FYNE {status === 'connected' ? 'Connecté' : status === 'disconnected' ? 'Déconnecté' : 'Vérification...'}
                    {position === 'in-header' && currentModel ? ` ${currentModel === 'gpt-4o' ? 'gpt-4o' : 'gpt-4o-mini'}` : ''}
                  </span>
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`p-1 ml-1 bg-blue-100 text-gray-800 border border-blue-300 rounded-full hover:bg-blue-200 ${position === 'in-header' ? 'h-4 w-4 xs:h-5 xs:w-5' : 'h-6 w-6'}`}
                  onClick={checkStatus} 
                  disabled={isRefreshing}
                >
                  <LoaderCircle className={`${position === 'in-header' ? 'w-2 h-2 xs:w-3 xs:h-3' : 'w-3 h-3'} ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Statut de connexion à Azure OpenAI</p>
            <p className="text-xs">Dernière vérification: {formattedLastCheck}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {showModelToggle && (
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`flex items-center ml-1 ${position === 'in-header' ? 'space-x-1' : 'ml-2 space-x-2'}`}>
                  {position !== 'in-header' && (
                    <span className={`text-xs font-medium ${economyMode ? 'text-yellow-500' : 'text-blue-500'}`}>
                      {modelLabel}
                    </span>
                  )}
                  
                  <div className="flex items-center">
                    <span className={`${position === 'in-header' ? 'text-[10px] xs:text-xs' : 'text-xs'} mr-1 font-semibold text-gray-800`}>
                      {position === 'in-header' ? 'Éco' : 'Eco'}
                    </span>
                    <Switch
                      checked={economyMode}
                      onCheckedChange={toggleModel}
                      disabled={isToggling || status === 'checking'}
                      className={`${isToggling ? 'opacity-50' : ''} ${position === 'in-header' ? 'h-3 w-6 xs:h-4 xs:w-8' : ''}`}
                    />
                    <Gauge className={`${position === 'in-header' ? 'w-2 h-2 xs:w-3 xs:h-3' : 'w-3 h-3'} ml-1 text-gray-800`} />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Basculer entre les modèles</p>
                <p className="text-xs">GPT-4o (standard) / GPT-4o-mini (économie)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};

export default OpenAIStatusIndicator;