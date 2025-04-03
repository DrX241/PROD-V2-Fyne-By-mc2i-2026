import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  AmoaContextType, 
  AmoaScenario, 
  AmoaMessage, 
  AmoaPhase,
  LearningEvent,
  SkillImpact
} from '../../shared/types/amoa';

const defaultContext: AmoaContextType = {
  userName: '',
  setUserName: () => {},
  userRole: '',
  setUserRole: () => {},
  currentScenario: null,
  setCurrentScenario: () => {},
  messages: [],
  addMessage: () => {},
  setMessages: () => {},
  progress: 0,
  updateScenarioProgress: () => {},
  recordDecision: () => {},
  updateSkill: () => {},
  addLearningEvent: () => {}
};

const AmoaContext = createContext<AmoaContextType>(defaultContext);

export const useAmoaContext = () => useContext(AmoaContext);

export const AmoaProvider = ({ children }: { children: ReactNode }) => {
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [currentScenario, setCurrentScenarioState] = useState<AmoaScenario | null>(null);
  const [messages, setMessages] = useState<AmoaMessage[]>([]);
  const [progress, setProgress] = useState<number>(0);
  
  // Charger les données sauvegardées si elles existent
  useEffect(() => {
    const savedUserName = localStorage.getItem('amoa_userName');
    const savedUserRole = localStorage.getItem('amoa_userRole');
    const savedScenario = localStorage.getItem('amoa_currentScenario');
    const savedMessages = localStorage.getItem('amoa_messages');
    
    if (savedUserName) setUserName(savedUserName);
    if (savedUserRole) setUserRole(savedUserRole);
    if (savedScenario) setCurrentScenarioState(JSON.parse(savedScenario));
    if (savedMessages) setMessages(JSON.parse(savedMessages));
  }, []);
  
  // Sauvegarder les données quand elles changent
  useEffect(() => {
    if (userName) localStorage.setItem('amoa_userName', userName);
    if (userRole) localStorage.setItem('amoa_userRole', userRole);
    if (currentScenario) localStorage.setItem('amoa_currentScenario', JSON.stringify(currentScenario));
    if (messages.length > 0) localStorage.setItem('amoa_messages', JSON.stringify(messages));
    
    // Calculer le progrès
    if (currentScenario) {
      const completedObjectives = currentScenario.objectives.filter(obj => obj.completed).length;
      const totalObjectives = currentScenario.objectives.length;
      
      const newProgress = Math.round((completedObjectives / totalObjectives) * 100);
      setProgress(newProgress);
      
      // Mettre à jour le scénario avec le progrès
      if (currentScenario.progress !== newProgress) {
        setCurrentScenarioState({
          ...currentScenario,
          progress: newProgress
        });
      }
    }
  }, [userName, userRole, currentScenario, messages]);
  
  // Fonctions pour gérer le scénario et les messages
  const setCurrentScenario = (scenario: AmoaScenario) => {
    setCurrentScenarioState(scenario);
  };
  
  const addMessage = (message: AmoaMessage) => {
    const newMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };
  
  const updateScenarioProgress = (phase: AmoaPhase, progressValue: number) => {
    if (!currentScenario) return;
    
    const updatedScenario = {
      ...currentScenario,
      currentPhase: phase
    };
    
    if (progressValue > 0) {
      updatedScenario.progress = progressValue;
    }
    
    setCurrentScenarioState(updatedScenario);
  };
  
  const recordDecision = (decisionId: string, choiceId: string, evaluation: string) => {
    if (!currentScenario) return;
    
    const updatedScenario = { ...currentScenario };
    
    // Mettre à jour la décision
    if (updatedScenario.decisions) {
      const decisionIndex = updatedScenario.decisions.findIndex(d => d.id === decisionId);
      
      if (decisionIndex !== -1) {
        updatedScenario.decisions[decisionIndex] = {
          ...updatedScenario.decisions[decisionIndex],
          selectedOption: choiceId,
          madeAt: new Date().toISOString(),
          evaluation
        };
      }
    }
    
    // Mettre à jour les objectifs liés à cette décision (simulation)
    const randomObjective = updatedScenario.objectives.find(obj => !obj.completed);
    if (randomObjective) {
      const objectiveIndex = updatedScenario.objectives.findIndex(obj => obj.id === randomObjective.id);
      if (objectiveIndex !== -1) {
        updatedScenario.objectives[objectiveIndex] = {
          ...randomObjective,
          completed: true,
          completedAt: new Date().toISOString()
        };
      }
    }
    
    setCurrentScenarioState(updatedScenario);
  };
  
  const updateSkill = (skillId: string, pointsToAdd: number) => {
    if (!currentScenario || !currentScenario.skillsProgress) return;
    
    const updatedScenario = { ...currentScenario };
    const skillIndex = updatedScenario.skillsProgress.findIndex(s => s.id === skillId);
    
    if (skillIndex !== -1) {
      const currentLevel = updatedScenario.skillsProgress[skillIndex].level;
      const newLevel = Math.min(100, currentLevel + pointsToAdd);
      
      updatedScenario.skillsProgress[skillIndex] = {
        ...updatedScenario.skillsProgress[skillIndex],
        level: newLevel
      };
      
      setCurrentScenarioState(updatedScenario);
    }
  };
  
  const addLearningEvent = (description: string, skillId: string, pointsGained: number) => {
    if (!currentScenario) return;
    
    // Mettre à jour la compétence
    updateSkill(skillId, pointsGained);
    
    // Créer un événement d'apprentissage
    const newEvent: LearningEvent = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      description,
      skillsImpacted: [
        {
          skillId,
          gainedPoints: pointsGained
        } as SkillImpact
      ]
    };
    
    // Ajouter l'événement au scénario
    const updatedScenario = { ...currentScenario };
    if (!updatedScenario.learningEvents) {
      updatedScenario.learningEvents = [];
    }
    
    updatedScenario.learningEvents = [...updatedScenario.learningEvents, newEvent];
    setCurrentScenarioState(updatedScenario);
  };
  
  const contextValue: AmoaContextType = {
    userName,
    setUserName,
    userRole,
    setUserRole,
    currentScenario,
    setCurrentScenario,
    messages,
    addMessage,
    setMessages,
    progress,
    updateScenarioProgress,
    recordDecision,
    updateSkill,
    addLearningEvent
  };
  
  return (
    <AmoaContext.Provider value={contextValue}>
      {children}
    </AmoaContext.Provider>
  );
};