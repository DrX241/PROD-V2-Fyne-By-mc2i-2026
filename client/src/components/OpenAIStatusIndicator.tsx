import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, LoaderCircle, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

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
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'checking' | 'reconnecting'>('checking');
  const [currentModel, setCurrentModel] = useState<string>('Claude 3.5 Sonnet');
  const [apiKeyType, setApiKeyType] = useState<'primary' | 'secondary'>('primary');
  const [lastCheck, setLastCheck] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const { toast } = useToast();

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

        // Définir le modèle courant
        const model = data.currentModel || 'Inconnu';
        setCurrentModel(model);

        // Ne pas changer automatiquement le type de clé API si un changement est déjà en cours
        // ou si l'utilisateur vient de changer le mode manuellement
        if (!isToggling) {
          // Déterminer le type de clé API en fonction du modèle
          // Si le modèle contient 'Haiku' ou 'mini', nous sommes en mode économique
          const keyType = (model.includes('Haiku') || model.includes('mini')) ? 'secondary' : 'primary';
          setApiKeyType(keyType);
        }

        setLastCheck(data.lastCheck || Date.now());

        console.log('État mis à jour :', {
          status: data.connectionStatus,
          model,
          keyType: !isToggling ? ((model.includes('Haiku') || model.includes('mini')) ? 'secondary' : 'primary') : 'inchangé',
          lastCheck: data.lastCheck
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

  // Fonction pour forcer la reconnexion à Azure OpenAI
  const forceReconnect = async () => {
    setIsReconnecting(true);
    setStatus('reconnecting');
    try {
      const response = await fetch('/api/openai/reconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          setStatus('connected');
          toast({
            title: 'Reconnexion réussie',
            description: 'La connexion à FYNE a été rétablie avec succès.',
            variant: 'default',
          });
        } else {
          setStatus('reconnecting');
          toast({
            title: 'Reconnexion en cours',
            description: 'Tentative de reconnexion à FYNE en cours. Veuillez patienter...',
            variant: 'default',
          });

          // Vérifier à nouveau après 5 secondes
          setTimeout(checkStatus, 5000);
        }

        // Mettre à jour les autres informations
        setLastCheck(data.lastCheck || Date.now());
        const modelName = data.currentModel || 'Claude 3 Haiku';
        setCurrentModel(modelName);
        const keyType = (modelName.includes('Haiku') || modelName.includes('mini')) ? 'secondary' : 'primary';
        setApiKeyType(keyType);

        console.log('Tentative de reconnexion:', data);
      } else {
        setStatus('disconnected');
        toast({
          title: 'Échec de la reconnexion',
          description: 'Impossible de se reconnecter à FYNE. Veuillez réessayer plus tard.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erreur lors de la tentative de reconnexion à Azure OpenAI:', error);
      setStatus('disconnected');
      toast({
        title: 'Erreur de reconnexion',
        description: 'Une erreur est survenue lors de la tentative de reconnexion à FYNE.',
        variant: 'destructive',
      });
    } finally {
      setIsReconnecting(false);
    }
  };

  // Fonction pour basculer entre les modèles
  const toggleModel = async () => {
    // Bloquer les changements multiples rapides
    if (isToggling) return;
    
    setIsToggling(true);
    try {
      // Récupérer le nouveau type de clé
      const newKeyType = apiKeyType === 'primary' ? 'secondary' : 'primary';

      // Définir d'abord localement le mode éco
      setApiKeyType(newKeyType);
      
      // Mettre à jour le modèle de façon préemptive pour éviter le clignotement
      setCurrentModel(newKeyType === 'primary' ? 'Claude 3.5 Sonnet' : 'Claude 3 Haiku');

      // Puis faire la demande au serveur
      const response = await fetch('/api/cyber/switch-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyType: newKeyType }),
      });

      if (response.ok) {
        const data = await response.json();

        // Récupérer le nom du modèle depuis la réponse
        if (data.modelName) {
          setCurrentModel(data.modelName);
        }

        // Mettre à jour le statut si fourni
        if (data.status === 'success') {
          setStatus('connected');
        } else if (data.connectionStatus) {
          setStatus(data.connectionStatus);
        }

        console.log('Changement de modèle réussi:', {
          newKeyType,
          modelName: data.modelName || (newKeyType === 'primary' ? 'Claude 3.5 Sonnet' : 'Claude 3 Haiku'),
          data
        });

        // Une seule vérification après un délai raisonnable
        setTimeout(checkStatus, 3000);
      } else {
        // En cas d'erreur, revenir à l'état précédent
        setApiKeyType(apiKeyType);
        setCurrentModel(apiKeyType === 'primary' ? 'Claude 3.5 Sonnet' : 'Claude 3 Haiku');
        toast({
          title: "Échec du changement de mode",
          description: "Impossible de changer le mode de l'API. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors du changement de modèle:', error);
      // En cas d'erreur, revenir à l'état précédent
      setApiKeyType(apiKeyType);
      setCurrentModel(apiKeyType === 'primary' ? 'Claude 3.5 Sonnet' : 'Claude 3 Haiku');
      toast({
        title: "Erreur de communication",
        description: "Une erreur est survenue lors du changement de mode.",
        variant: "destructive",
      });
    } finally {
      // Attendre un délai minimal avant de permettre un nouveau basculement
      setTimeout(() => {
        setIsToggling(false);
      }, 1000);
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
  const modelLabel = currentModel;

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
    <div className={`flex items-center space-x-1 sm:space-x-2 ${positionStyles} ${className}`}>
      {/* Indicateur de statut FYNE */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <Badge 
                variant="outline"
                className={`px-1 sm:px-2 py-0.5 sm:py-1 flex items-center gap-0.5 sm:gap-1 
                  ${status === 'connected' ? 'bg-green-700' : 
                    status === 'disconnected' ? 'bg-red-700' : 
                    status === 'reconnecting' ? 'bg-orange-700' : 'bg-yellow-700'} 
                  text-white border-none`}
              >
                {status === 'connected' ? (
                  <CheckCircle className="w-2.5 sm:w-3 h-2.5 sm:h-3 mr-0.5 sm:mr-1" />
                ) : status === 'disconnected' ? (
                  <XCircle className="w-2.5 sm:w-3 h-2.5 sm:h-3 mr-0.5 sm:mr-1" />
                ) : (
                  <LoaderCircle className="w-2.5 sm:w-3 h-2.5 sm:h-3 mr-0.5 sm:mr-1 animate-spin" />
                )}
                <span className="text-[10px] sm:text-xs font-medium">
                  {status === 'connected' ? 'FYNE Connecté' : status === 'disconnected' ? 'Déconnecté' : status === 'reconnecting' ? 'Reconnexion...' : 'Vérification...'}
                </span>
              </Badge>

              {/* Bouton de vérification ou de reconnexion selon l'état - responsive */}
              {status === 'disconnected' ? (
                <Button 
                  variant="outline"
                  size="icon"
                  className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 ml-1 rounded-full bg-white"
                  onClick={forceReconnect}
                  disabled={isReconnecting}
                  title="Forcer la reconnexion"
                >
                  <RefreshCw className={`h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3 ${isReconnecting ? 'animate-spin' : ''} text-red-500`} />
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  size="icon"
                  className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 ml-1 rounded-full bg-white"
                  onClick={checkStatus}
                  disabled={isRefreshing}
                  title="Vérifier la connexion"
                >
                  <LoaderCircle className={`h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">Statut de connexion</p>
            <p className="text-xs mt-1">
              État: <span className={
                status === 'connected' ? 'text-green-500 font-medium' : 
                status === 'disconnected' ? 'text-red-500 font-medium' :
                status === 'reconnecting' ? 'text-orange-500 font-medium' : 
                'text-yellow-500 font-medium'
              }>
                {status === 'connected' ? 'Connecté' : 
                 status === 'disconnected' ? 'Déconnecté' :
                 status === 'reconnecting' ? 'Reconnexion en cours' : 
                 'Vérification'
                }
              </span>
            </p>
            <p className="text-xs">Modèle actif: <span className="font-medium">{modelLabel}</span></p>
            <p className="text-xs">Mode Éco: <span className="font-medium">{economyMode ? 'Activé' : 'Désactivé'}</span></p>
            <p className="text-xs">Dernière vérification: <span className="font-medium">{formattedLastCheck}</span></p>
            {status === 'disconnected' && (
              <p className="text-xs mt-1 text-red-400">
                Cliquez sur le bouton <RefreshCw className="inline h-3 w-3 text-red-400" /> pour forcer une reconnexion
              </p>
            )}
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
                    'bg-blue-700 hover:bg-blue-600'} text-white hidden md:flex`}
                >
                  <span className="text-xs font-medium">
                    {economyMode ? `Mode ÉCO (${modelLabel})` : modelLabel}
                  </span>
                </Badge>

                {/* Switch avec badge d'économie - adapté pour le responsive */}
                
                <Switch
                  checked={economyMode}
                  onCheckedChange={(checked) => {
                    setApiKeyType(checked ? 'secondary' : 'primary');
                    setTimeout(toggleModel, 50);
                  }}
                  disabled={isToggling || status === 'checking'}
                  className="scale-75 sm:scale-100"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{economyMode ? 'Désactiver' : 'Activer'} le mode économie</p>
              <p className="text-xs">
                {economyMode ? 
                  'Mode ÉCO activé (utilise Claude 3 Haiku pour réduire la consommation)' : 
                  'Mode standard activé (utilise Claude 3.5 Sonnet pour des performances optimales)'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default OpenAIStatusIndicator;