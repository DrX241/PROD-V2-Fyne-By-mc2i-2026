import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, LoaderCircle, Zap } from 'lucide-react';
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
  const [currentModel, setCurrentModel] = useState<string>('gpt-4o');
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
        console.log('Réponse API brute:', data);
        
        // Si l'API renvoie un statut de succès, considérer que la connexion est établie
        const connectionStatus = data.status === 'success' ? 'connected' : 'disconnected';
        setStatus(connectionStatus);
        
        // Définir le modèle courant (utiliser model au lieu de currentModel)
        const model = data.model || 'Inconnu';
        setCurrentModel(model);
        
        // Récupérer directement le type de clé depuis la réponse API 
        // (plus fiable que de le déduire du modèle)
        const keyType = data.keyType || 'primary';
        setApiKeyType(keyType as 'primary' | 'secondary');
        
        setLastCheck(data.lastCheck || Date.now());
        
        console.log('État mis à jour :', {
          status: connectionStatus,
          model,
          keyType,
          lastCheck: data.lastCheck || Date.now()
        });
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
        
        // Récupérer le nom du modèle depuis la réponse ou utiliser une valeur par défaut
        const modelName = data.model || (newKeyType === 'primary' ? 'gpt-4o' : 'gpt-4o-mini');
        setCurrentModel(modelName);
        setApiKeyType(newKeyType);
        setStatus('connected');
        
        console.log('Changement de modèle réussi:', {
          newKeyType,
          modelName,
          data
        });
        
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
  
  // Économie activée ou non
  const economyMode = apiKeyType === 'secondary';
  
  // Label du modèle en cours d'utilisation
  const modelLabel = currentModel === 'gpt-4o' ? 'GPT-4o' : 'GPT-4o-mini';
  
  // Styles selon la position
  let positionStyles = '';
  
  if (position === 'fixed-bottom-right') {
    positionStyles = 'fixed bottom-4 right-4 z-50 bg-opacity-90 bg-slate-900 p-2 rounded-md shadow-lg';
  } else if (position === 'fixed-bottom') {
    positionStyles = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-opacity-90 bg-slate-900 p-2 rounded-md shadow-lg';
  } else if (position === 'in-header') {
    positionStyles = 'bg-transparent'; // Style pour l'en-tête
  }
  
  return (
    <div className={`flex items-center space-x-2 ${positionStyles} ${className}`}>
      {/* Indicateur de statut FYNE */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <Badge 
                variant="outline"
                className={`px-2 py-1 flex items-center gap-1 
                  ${status === 'connected' ? 'bg-green-700' : 
                    status === 'disconnected' ? 'bg-red-700' : 'bg-yellow-700'} 
                  text-white border-none`}
              >
                {status === 'connected' ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : status === 'disconnected' ? (
                  <XCircle className="w-3 h-3 mr-1" />
                ) : (
                  <LoaderCircle className="w-3 h-3 mr-1 animate-spin" />
                )}
                <span className="text-xs font-medium">
                  FYNE
                </span>
              </Badge>
              
              <Button 
                variant="outline"
                size="icon"
                className="h-6 w-6 ml-1 rounded-full bg-white"
                onClick={checkStatus}
                disabled={isRefreshing}
              >
                <LoaderCircle className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Statut de connexion FYNE</p>
            <p className="text-xs">Dernière vérification: {formattedLastCheck}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Sélecteur de modèle - Eco mode */}
      {showModelToggle && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center ml-2 space-x-2">
                {/* Badge du modèle actif avec couleur différente selon mode */}
                <Badge 
                  variant={economyMode ? "outline" : "default"}
                  className={`px-2 py-1 ${economyMode ? 
                    'bg-purple-700 hover:bg-purple-600 border-purple-400' : 
                    'bg-blue-700 hover:bg-blue-600'} text-white`}
                >
                  <span className="text-xs font-medium">
                    {modelLabel}
                  </span>
                </Badge>
                
                {/* Switch avec badge d'économie */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm">
                  <Zap className={`h-3.5 w-3.5 ${economyMode ? 'text-purple-600' : 'text-gray-400'}`} />
                  <span className={`text-xs font-semibold ${economyMode ? 'text-purple-700' : 'text-gray-600'}`}>
                    Éco
                  </span>
                  <Switch
                    checked={economyMode}
                    onCheckedChange={toggleModel}
                    disabled={isToggling || status === 'checking'}
                  />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{economyMode ? 'Désactiver' : 'Activer'} le mode économie</p>
              <p className="text-xs">
                {economyMode ? 
                  'Mode économique activé (utilise GPT-4o-mini)' : 
                  'Utilise actuellement le modèle standard (GPT-4o)'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default OpenAIStatusIndicator;