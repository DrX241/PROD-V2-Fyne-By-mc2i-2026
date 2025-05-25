import React, { createContext, useContext, useState, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Types pour le contexte de décision
interface DecisionOption {
  id: string;
  text: string;
  description: string;
  impacts: {
    security?: 'positive' | 'negative' | 'neutral';
    business?: 'positive' | 'negative' | 'neutral';
    team?: 'positive' | 'negative' | 'neutral';
    legal?: 'positive' | 'negative' | 'neutral';
    career?: 'positive' | 'negative' | 'neutral';
  };
}

interface DecisionScenario {
  id: string;
  situation: string;
  context: string;
  historicalFacts: string;
  consequences: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string;
  options: DecisionOption[];
}

interface DecisionState {
  isInDecisionMode: boolean;
  currentScenario: DecisionScenario | null;
  currentScenarioNumber: number;
  totalScenarios: number;
  isLoading: boolean;
  summary: string | null;
}

interface DecisionContextType extends DecisionState {
  startDecisionFlow: (userId: string, topic: string) => Promise<void>;
  submitDecision: (userId: string, optionId: string) => Promise<void>;
  checkDecisionStatus: (userId: string) => Promise<void>;
  resetDecisionState: () => void;
}

// Création du contexte
const DecisionContext = createContext<DecisionContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useDecision = () => {
  const context = useContext(DecisionContext);
  if (context === undefined) {
    throw new Error('useDecision must be used within a DecisionProvider');
  }
  return context;
};

// Provider du contexte
export const DecisionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DecisionState>({
    isInDecisionMode: false,
    currentScenario: null,
    currentScenarioNumber: 0,
    totalScenarios: 0,
    isLoading: false,
    summary: null
  });

  const { toast } = useToast();

  // Démarrer le flux de décision après un débriefing - version améliorée avec retour immédiat
  const startDecisionFlow = async (userId: string, topic: string) => {
    // Afficher immédiatement un scénario temporaire pour donner un retour visuel instantané
    setState({
      isInDecisionMode: true,
      currentScenario: {
        id: "loading-scenario",
        situation: "Préparation du scénario de décision en cybersécurité...",
        context: "Analyse du contexte de cybersécurité en cours...",
        historicalFacts: "Compilation des incidents récents et bonnes pratiques...",
        consequences: "Évaluation des impacts potentiels des décisions...",
        urgencyLevel: "medium",
        deadline: "Chargement...",
        options: [
          {
            id: "loading-option",
            text: "Préparation des options...",
            description: "Veuillez patienter pendant que nous préparons des choix pertinents basés sur des scénarios réels...",
            impacts: {
              security: "neutral",
              business: "neutral",
              team: "neutral",
              legal: "neutral",
              career: "neutral"
            }
          }
        ]
      },
      currentScenarioNumber: 1,
      totalScenarios: 5, // Valeur par défaut en attendant la réponse de l'API
      isLoading: true,
      summary: null
    });
    
    try {
      const response = await apiRequest<{
        success: boolean;
        scenario: DecisionScenario;
        remainingScenarios: number;
        currentScenario: number;
      }>('/api/cyber-expert/decisions/start', {
        method: 'POST',
        body: JSON.stringify({ userId, topic })
      });
      
      if (response.success) {
        setState({
          isInDecisionMode: true,
          currentScenario: response.scenario,
          currentScenarioNumber: response.currentScenario,
          totalScenarios: response.remainingScenarios + response.currentScenario - 1,
          isLoading: false,
          summary: null
        });
      } else {
        throw new Error("Échec du démarrage du flux de décision");
      }
    } catch (error) {
      console.error("Erreur lors du démarrage du flux de décision:", error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer le flux de décision. Veuillez réessayer.",
        variant: "destructive"
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Soumettre une décision et passer au scénario suivant
  const submitDecision = async (userId: string, optionId: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await apiRequest<{
        success: boolean;
        scenario?: DecisionScenario;
        remainingScenarios?: number;
        currentScenario?: number;
        isComplete?: boolean;
        summary?: string;
      }>('/api/cyber-expert/decisions/submit', {
        method: 'POST',
        body: JSON.stringify({ userId, optionId })
      });
      
      if (response.success) {
        if (response.isComplete) {
          // Parcours de décision terminé
          setState({
            isInDecisionMode: false,
            currentScenario: null,
            currentScenarioNumber: 0,
            totalScenarios: 0,
            isLoading: false,
            summary: response.summary || null
          });
        } else {
          // Passer au scénario suivant
          setState({
            isInDecisionMode: true,
            currentScenario: response.scenario || null,
            currentScenarioNumber: response.currentScenario || 0,
            totalScenarios: (response.remainingScenarios || 0) + (response.currentScenario || 0) - 1,
            isLoading: false,
            summary: null
          });
        }
      } else {
        throw new Error("Échec de la soumission de la décision");
      }
    } catch (error) {
      console.error("Erreur lors de la soumission de la décision:", error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre votre décision. Veuillez réessayer.",
        variant: "destructive"
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Vérifier si l'utilisateur est en mode décision
  const checkDecisionStatus = async (userId: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await apiRequest<{
        isInDecisionMode: boolean;
        scenario?: DecisionScenario;
        remainingScenarios?: number;
        currentScenario?: number;
      }>('/api/cyber-expert/decisions/status', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      
      if (response.isInDecisionMode) {
        setState({
          isInDecisionMode: true,
          currentScenario: response.scenario || null,
          currentScenarioNumber: response.currentScenario || 0,
          totalScenarios: (response.remainingScenarios || 0) + (response.currentScenario || 0) - 1,
          isLoading: false,
          summary: null
        });
      } else {
        setState(prev => ({ 
          ...prev, 
          isInDecisionMode: false,
          isLoading: false 
        }));
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du statut de décision:", error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Réinitialiser l'état de décision
  const resetDecisionState = () => {
    setState({
      isInDecisionMode: false,
      currentScenario: null,
      currentScenarioNumber: 0,
      totalScenarios: 0,
      isLoading: false,
      summary: null
    });
  };

  return (
    <DecisionContext.Provider
      value={{
        ...state,
        startDecisionFlow,
        submitDecision,
        checkDecisionStatus,
        resetDecisionState
      }}
    >
      {children}
    </DecisionContext.Provider>
  );
};