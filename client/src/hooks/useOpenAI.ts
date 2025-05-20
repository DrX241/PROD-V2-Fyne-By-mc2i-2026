import { useState, useEffect, useCallback } from 'react';

export type OpenAIStatus = 'connected' | 'disconnected' | 'checking' | 'reconnecting';
export type ApiKeyType = 'primary' | 'secondary';

interface OpenAIStatusData {
  connectionStatus: OpenAIStatus;
  currentModel: string;
  keyType: ApiKeyType;
  lastCheck: number;
}

export function useOpenAI() {
  const [status, setStatus] = useState<OpenAIStatus>('checking');
  const [currentModel, setCurrentModel] = useState<string>('gpt-4o-mini');
  const [apiKeyType, setApiKeyType] = useState<ApiKeyType>('secondary');
  const [lastCheck, setLastCheck] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fonction pour vérifier le statut
  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/openai/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data.connectionStatus || 'disconnected');

        // Définir le modèle courant
        const model = data.currentModel || 'gpt-4o-mini';
        setCurrentModel(model);

        // Déterminer le type de clé API en fonction du modèle
        const keyType = (model === 'gpt-4o-mini') ? 'secondary' : 'primary';
        setApiKeyType(keyType);

        setLastCheck(data.lastCheck || Date.now());
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut OpenAI:', error);
      setStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fonction pour basculer entre les modèles
  const toggleModel = useCallback(async () => {
    setIsLoading(true);
    try {
      const newModel = currentModel === 'gpt-4o' ? 'gpt-4o-mini' : 'gpt-4o';
      const response = await fetch('/api/openai/toggle-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          model: newModel 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentModel(data.currentModel);
        setApiKeyType(data.currentModel === 'gpt-4o-mini' ? 'secondary' : 'primary');
        setStatus(data.connectionStatus);
        setLastCheck(data.lastCheck || Date.now());
      }
    } catch (error) {
      console.error('Erreur lors du changement de modèle:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentModel]);

  // Fonction pour effectuer un appel à l'API Chat
  const sendChatMessage = useCallback(async (messages: any[], temperature = 0.7, max_tokens = 500) => {
    try {
      // On vérifie le statut mais on n'empêche pas l'exécution
      if (status !== 'connected') {
        await checkStatus();
        console.warn('Statut de la connexion:', status);
      }

      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model: currentModel,
          temperature,
          max_tokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'appel à l\'API OpenAI');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Erreur dans sendChatMessage:', error);
      throw error;
    }
  }, [status, currentModel, checkStatus]);

  // Vérifier le statut au chargement
  useEffect(() => {
    checkStatus();
    
    // Vérifier périodiquement (toutes les 30 secondes)
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return {
    connectionStatus: status,
    currentModel,
    apiKeyType,
    lastCheck,
    isLoading,
    checkStatus,
    toggleModel,
    sendChatMessage
  };
}