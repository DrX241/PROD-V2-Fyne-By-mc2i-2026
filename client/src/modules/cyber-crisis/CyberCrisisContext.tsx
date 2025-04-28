import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';
import {
  CrisisChatContextType,
  CrisisState,
  CrisisMessage,
  UserRole,
  CrisisScenario,
  PersonalityProfile
} from './types';
import userRoles from './UserRoles';
import crisisScenarios from './ScenarioList';
import personalityProfiles from './PersonalityProfiles';

// Valeurs par défaut du contexte
const defaultCrisisState: CrisisState = {
  userName: '',
  userRole: null,
  scenario: null,
  currentEvent: null,
  activePersonalities: [],
  messages: [],
  budget: 0,
  score: 0,
  reputation: 100,
  isSimulationActive: false,
  alertLevel: 'normal'
};

// Création du contexte
const CyberCrisisContext = createContext<CrisisChatContextType>({
  state: defaultCrisisState,
  setUserName: () => {},
  selectRole: () => {},
  selectScenario: () => {},
  sendMessage: async () => {},
  resetSimulation: () => {},
  startSimulation: () => {},
  endSimulation: () => {}
});

// Hook personnalisé pour utiliser le contexte
export const useCyberCrisisContext = () => useContext(CyberCrisisContext);

// Provider du contexte
export const CyberCrisisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CrisisState>(defaultCrisisState);
  
  // Mise à jour du nom d'utilisateur
  const setUserName = useCallback((name: string) => {
    setState(prevState => ({
      ...prevState,
      userName: name
    }));
  }, []);
  
  // Sélection du rôle utilisateur
  const selectRole = useCallback((roleId: string) => {
    const selectedRole = userRoles[roleId];
    if (selectedRole) {
      setState(prevState => ({
        ...prevState,
        userRole: selectedRole
      }));
    }
  }, []);
  
  // Sélection du scénario
  const selectScenario = useCallback((scenarioId: string) => {
    const selectedScenario = crisisScenarios[scenarioId];
    if (selectedScenario) {
      // Déterminer les personnalités actives basées sur le scénario
      const mainPersonality = personalityProfiles[selectedScenario.mainPersonality];
      const supportPersonalities = selectedScenario.supportPersonalities
        .map(id => personalityProfiles[id])
        .filter(Boolean);
      
      // Tous les personnages actifs pour ce scénario
      const activePersonalities = [mainPersonality, ...supportPersonalities];
      
      setState(prevState => ({
        ...prevState,
        scenario: selectedScenario,
        budget: selectedScenario.initialBudget,
        score: 0,
        reputation: 100,
        activePersonalities,
        currentEvent: selectedScenario.initialEvent
      }));
    }
  }, []);
  
  // Envoi d'un message
  const sendMessage = useCallback(async (message: string) => {
    if (!state.isSimulationActive) return;
    
    // Créer et ajouter le message de l'utilisateur
    const userMessageId = `user_${Date.now()}`;
    const userMessage: CrisisMessage = {
      id: userMessageId,
      content: message,
      timestamp: Date.now(),
      type: 'user',
      sender: 'user'
    };
    
    // Mettre à jour l'état avec le message de l'utilisateur
    setState(prevState => ({
      ...prevState,
      messages: [...prevState.messages, userMessage]
    }));
    
    try {
      // Préparer les données pour l'appel API
      const apiRequestData = {
        message,
        userName: state.userName,
        userRole: state.userRole,
        scenario: state.scenario,
        currentEvent: state.currentEvent,
        activePersonalities: state.activePersonalities,
        messages: state.messages,
        budget: state.budget,
        score: state.score,
        reputation: state.reputation
      };
      
      // Appel à l'API
      const response = await axios.post('/api/cyber/crisis-chat', apiRequestData);
      
      // Traiter la réponse
      const responseData = response.data;
      
      // Mise à jour de l'état avec la réponse
      setState(prevState => {
        // Construire le nouveau message
        const aiMessage: CrisisMessage = {
          id: `ai_${Date.now()}`,
          content: responseData.message,
          timestamp: Date.now(),
          type: responseData.messageType || 'personality',
          sender: responseData.sender || state.scenario?.mainPersonality,
          metadata: {
            budgetImpact: responseData.budgetImpact || 0,
            scoreImpact: responseData.scoreImpact || 0,
            eventTriggered: responseData.eventTriggered,
            alertLevel: responseData.alertLevel
          }
        };
        
        // Calcul des nouvelles valeurs
        const newBudget = prevState.budget + (responseData.budgetImpact || 0);
        const newScore = prevState.score + (responseData.scoreImpact || 0);
        const newReputation = Math.max(0, Math.min(100, prevState.reputation + (responseData.reputationImpact || 0)));
        
        // Nouveau niveau d'alerte
        const newAlertLevel = responseData.alertLevel || prevState.alertLevel;
        
        // Nouvel événement s'il est déclenché
        const newCurrentEvent = responseData.eventTriggered || prevState.currentEvent;
        
        return {
          ...prevState,
          messages: [...prevState.messages, aiMessage],
          budget: newBudget,
          score: newScore,
          reputation: newReputation,
          alertLevel: newAlertLevel as 'normal' | 'elevated' | 'high' | 'critical',
          currentEvent: newCurrentEvent
        };
      });
      
      // Si la simulation doit se terminer (budget épuisé, score trop bas, etc.)
      if (responseData.endSimulation) {
        endSimulation();
      }
      
    } catch (error) {
      console.error('Erreur lors de la communication avec l\'API:', error);
      
      // Ajout d'un message d'erreur dans le chat
      const errorMessage: CrisisMessage = {
        id: `error_${Date.now()}`,
        content: "Une erreur est survenue dans la communication avec le système de crise. Veuillez réessayer.",
        timestamp: Date.now(),
        type: 'system',
        metadata: {
          alertLevel: 'warning'
        }
      };
      
      setState(prevState => ({
        ...prevState,
        messages: [...prevState.messages, errorMessage]
      }));
    }
  }, [state]);
  
  // Démarrage de la simulation
  const startSimulation = useCallback(() => {
    if (!state.scenario || !state.userRole) return;
    
    // Message initial basé sur le scénario
    const initialMessage: CrisisMessage = {
      id: `initial_${Date.now()}`,
      content: state.scenario.initialMessage,
      timestamp: Date.now(),
      type: 'alert',
      sender: 'system',
      metadata: {
        alertLevel: 'critical'
      }
    };
    
    // Welcome message from main personality
    const mainPersonality = state.activePersonalities.find(p => p.id === state.scenario?.mainPersonality);
    
    let welcomeContent = "";
    if (mainPersonality) {
      welcomeContent = `Bonjour ${state.userName}, je suis ${mainPersonality.name}, ${mainPersonality.role}. Nous faisons face à une situation critique qui nécessite votre expertise en tant que ${state.userRole.title}. Aidez-nous à gérer cette crise.`;
    }
    
    const welcomeMessage: CrisisMessage = {
      id: `welcome_${Date.now()}`,
      content: welcomeContent,
      timestamp: Date.now() + 500,
      type: 'personality',
      sender: mainPersonality?.id
    };
    
    setState(prevState => ({
      ...prevState,
      messages: [initialMessage, welcomeMessage],
      isSimulationActive: true,
      simulationStartTime: Date.now(),
      alertLevel: 'critical'
    }));
  }, [state.scenario, state.userRole, state.userName, state.activePersonalities]);
  
  // Fin de la simulation
  const endSimulation = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      isSimulationActive: false,
      simulationEndTime: Date.now(),
    }));
    
    // Générer un message de bilan final
    const simulationDuration = state.simulationStartTime ? Math.floor((Date.now() - state.simulationStartTime) / 60000) : 0;
    
    let resultMessage = "";
    
    if (state.budget <= 0) {
      resultMessage = `SIMULATION TERMINÉE — Budget épuisé!\n\nVous avez épuisé l'intégralité du budget de crise de ${state.scenario?.initialBudget}€.\nScore final: ${state.score} points\nRéputation: ${state.reputation}/100\nDurée: ${simulationDuration} minutes`;
    } else {
      resultMessage = `SIMULATION TERMINÉE\n\nBudget restant: ${state.budget}€ sur ${state.scenario?.initialBudget}€\nScore final: ${state.score} points\nRéputation: ${state.reputation}/100\nDurée: ${simulationDuration} minutes`;
    }
    
    const finalMessage: CrisisMessage = {
      id: `final_${Date.now()}`,
      content: resultMessage,
      timestamp: Date.now(),
      type: 'system',
      metadata: {
        alertLevel: 'info'
      }
    };
    
    setState(prevState => ({
      ...prevState,
      messages: [...prevState.messages, finalMessage]
    }));
  }, [state.budget, state.scenario, state.score, state.reputation, state.simulationStartTime]);
  
  // Réinitialisation de la simulation
  const resetSimulation = useCallback(() => {
    setState(defaultCrisisState);
  }, []);
  
  // Événements basés sur le temps
  useEffect(() => {
    // Vérifier si la simulation est active
    if (!state.isSimulationActive || !state.scenario || !state.currentEvent) return;
    
    // Récupérer l'événement actuel
    const currentEventData = state.scenario.events[state.currentEvent];
    if (!currentEventData) return;
    
    // Vérifier si des événements sont déclenchés par le temps
    const timeBasedEvents = Object.values(state.scenario.events).filter(
      event => event.trigger === 'time' && 
      event.triggerThreshold && 
      currentEventData.nextEvents?.includes(event.id)
    );
    
    // Pour chaque événement basé sur le temps, configurer un timer
    timeBasedEvents.forEach(event => {
      const timer = setTimeout(() => {
        // Vérifier si l'événement n'a pas déjà été déclenché
        if (state.messages.some(m => m.metadata?.eventTriggered === event.id)) return;
        
        // Créer un message pour l'événement
        const eventMessage: CrisisMessage = {
          id: `event_${Date.now()}`,
          content: event.description,
          timestamp: Date.now(),
          type: 'event',
          metadata: {
            eventTriggered: event.id,
            budgetImpact: event.budgetImpact,
            scoreImpact: event.scoreImpact
          }
        };
        
        // Mettre à jour l'état
        setState(prevState => ({
          ...prevState,
          messages: [...prevState.messages, eventMessage],
          budget: prevState.budget + event.budgetImpact,
          score: prevState.score + event.scoreImpact,
          reputation: Math.max(0, Math.min(100, prevState.reputation + event.reputationImpact)),
          currentEvent: event.id
        }));
        
      }, (event.triggerThreshold || 0) * 60 * 1000); // Convertir minutes en millisecondes
      
      // Nettoyage du timer si le composant est démonté
      return () => clearTimeout(timer);
    });
  }, [state.isSimulationActive, state.scenario, state.currentEvent, state.messages]);
  
  const contextValue = {
    state,
    setUserName,
    selectRole,
    selectScenario,
    sendMessage,
    resetSimulation,
    startSimulation,
    endSimulation
  };
  
  return (
    <CyberCrisisContext.Provider value={contextValue}>
      {children}
    </CyberCrisisContext.Provider>
  );
};

export default CyberCrisisContext;