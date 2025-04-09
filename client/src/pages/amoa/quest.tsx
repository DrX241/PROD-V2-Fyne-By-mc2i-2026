import React, { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  User, 
  FileText, 
  Send, 
  Briefcase, 
  RefreshCw, 
  Brain, 
  Info,
  HelpCircle,
  ChevronRight,
  Clock,
  CheckCircle2,
  ShieldCheck,
  BarChart4,
  Route
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

// Types pour l'aventure
interface Character {
  id: string;
  name: string;
  role: string;
  avatar: string;
  mood?: string;
}

interface DialogOption {
  id: string;
  text: string;
  impact?: {
    stakeholder?: number;
    technical?: number;
    budget?: number;
    timeline?: number;
  };
}

interface NarrativeStep {
  id: string;
  type: "narrative" | "decision" | "document" | "choice" | "feedback";
  character?: Character;
  content: string;
  options?: DialogOption[];
  documents?: {
    title: string;
    content: string;
    type: "requirement" | "specification" | "email" | "report";
  }[];
  feedback?: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
}

interface QuestPhase {
  id: string;
  title: string;
  description: string;
  steps: NarrativeStep[];
}

interface QuestState {
  currentPhaseId: string;
  currentStepIndex: number;
  completedSteps: string[];
  playerChoices: Record<string, string>;
  playerMetrics: {
    stakeholderSatisfaction: number;
    technicalQuality: number;
    budgetAdherence: number;
    timelineAdherence: number;
  };
  feedback: Record<string, string[]>;
  documents: Record<string, any[]>;
}

// Composant pour l'avatar du personnage
const CharacterAvatar: React.FC<{ character: Character }> = ({ character }) => {
  const moodEmoji: Record<string, string> = {
    happy: "😊",
    neutral: "😐",
    concerned: "😟",
    serious: "🧐",
    excited: "😃",
    angry: "😠",
    thoughtful: "🤔"
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-amoa-blue/10 flex items-center justify-center overflow-hidden border-2 border-white">
          {character.avatar ? (
            <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
          ) : (
            <User className="h-6 w-6 text-amoa-blue" />
          )}
        </div>
        {character.mood && (
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {moodEmoji[character.mood] || "😐"}
          </div>
        )}
      </div>
      <div>
        <div className="font-medium text-sm text-gray-900">{character.name}</div>
        <div className="text-xs text-gray-500">{character.role}</div>
      </div>
    </div>
  );
};

// Composant de document
const DocumentViewer: React.FC<{ document: { title: string; content: string; type: string } }> = ({ document }) => {
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "requirement": return <FileText className="h-5 w-5 text-amoa-blue" />;
      case "specification": return <FileText className="h-5 w-5 text-green-500" />;
      case "email": return <Send className="h-5 w-5 text-amber-500" />;
      case "report": return <Briefcase className="h-5 w-5 text-purple-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDocumentBg = (type: string) => {
    switch (type) {
      case "requirement": return "bg-amoa-blue/10 border-amoa-blue/20 text-gray-900";
      case "specification": return "bg-green-50 border-green-200 text-gray-900";
      case "email": return "bg-amber-50 border-amber-200 text-gray-900";
      case "report": return "bg-purple-50 border-purple-200 text-gray-900";
      default: return "bg-gray-50 border-gray-200 text-gray-900";
    }
  };

  return (
    <div className={`rounded-lg p-4 mb-4 ${getDocumentBg(document.type)} border`}>
      <div className="flex items-center mb-2">
        {getDocumentIcon(document.type)}
        <h3 className="ml-2 font-medium">{document.title}</h3>
      </div>
      <div className="text-sm whitespace-pre-line">{document.content}</div>
    </div>
  );
};

// Composant principal AMOA Quest
export default function AmoaQuestPage() {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [freeformMessage, setFreeformMessage] = useState("");
  const [freeformConversation, setFreeformConversation] = useState<{
    role: "user" | "assistant";
    content: string;
    character?: Character;
  }[]>([]);
  const [questPhases, setQuestPhases] = useState<QuestPhase[]>([]);
  const [questState, setQuestState] = useState<QuestState>({
    currentPhaseId: "",
    currentStepIndex: 0,
    completedSteps: [],
    playerChoices: {},
    playerMetrics: {
      stakeholderSatisfaction: 75,
      technicalQuality: 75,
      budgetAdherence: 75,
      timelineAdherence: 75
    },
    feedback: {},
    documents: {}
  });

  // Effet pour faire défiler jusqu'au dernier message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [questState.currentStepIndex]);

  // Initialisation du jeu
  useEffect(() => {
    const initializeQuest = async () => {
      try {
        setInitializing(true);
        
        // Appel à l'API pour récupérer le scénario généré dynamiquement
        const response = await apiRequest("/api/amoa/quest/initialize", { method: "POST" });
        
        if (response && response.phases && response.phases.length > 0) {
          setQuestPhases(response.phases);
          setQuestState({
            ...questState,
            currentPhaseId: response.phases[0]?.id || "",
            currentStepIndex: 0
          });
        } else {
          throw new Error("Données de quête invalides");
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation de la quête:", error);
        toast({
          title: "Erreur",
          description: "Impossible d'initialiser l'aventure. Veuillez réessayer.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
        setInitializing(false);
      }
    };

    // Lancer l'initialisation
    initializeQuest();
  }, []);

  // Obtenir la phase et l'étape actuelles
  const getCurrentPhase = () => {
    return questPhases.find(phase => phase.id === questState.currentPhaseId) || null;
  };

  const getCurrentStep = () => {
    const currentPhase = getCurrentPhase();
    if (!currentPhase) return null;
    return currentPhase.steps[questState.currentStepIndex] || null;
  };

  // Progression vers l'étape suivante
  const goToNextStep = () => {
    const currentPhase = getCurrentPhase();
    if (!currentPhase) return;

    if (questState.currentStepIndex < currentPhase.steps.length - 1) {
      // Passer à l'étape suivante dans la même phase
      setQuestState({
        ...questState,
        currentStepIndex: questState.currentStepIndex + 1,
        completedSteps: [...questState.completedSteps, currentPhase.steps[questState.currentStepIndex].id]
      });
    } else {
      // Trouver la phase suivante
      const currentPhaseIndex = questPhases.findIndex(phase => phase.id === questState.currentPhaseId);
      if (currentPhaseIndex < questPhases.length - 1) {
        const nextPhase = questPhases[currentPhaseIndex + 1];
        setQuestState({
          ...questState,
          currentPhaseId: nextPhase.id,
          currentStepIndex: 0,
          completedSteps: [...questState.completedSteps, currentPhase.steps[questState.currentStepIndex].id]
        });
      } else {
        // Aventure terminée
        toast({
          title: "Félicitations !",
          description: "Vous avez terminé l'aventure AMOA Quest.",
          variant: "default"
        });
      }
    }
  };

  // Gérer la sélection d'une option
  const handleOptionSelect = async (option: DialogOption) => {
    setLoading(true);
    const currentStep = getCurrentStep();
    const currentPhase = getCurrentPhase();
    
    if (!currentStep || !currentPhase) return;

    try {
      // Mettre à jour les métriques du joueur en fonction de l'impact de l'option
      const newMetrics = { ...questState.playerMetrics };
      if (option.impact) {
        if (option.impact.stakeholder) {
          newMetrics.stakeholderSatisfaction = Math.min(100, Math.max(0, newMetrics.stakeholderSatisfaction + option.impact.stakeholder));
        }
        if (option.impact.technical) {
          newMetrics.technicalQuality = Math.min(100, Math.max(0, newMetrics.technicalQuality + option.impact.technical));
        }
        if (option.impact.budget) {
          newMetrics.budgetAdherence = Math.min(100, Math.max(0, newMetrics.budgetAdherence + option.impact.budget));
        }
        if (option.impact.timeline) {
          newMetrics.timelineAdherence = Math.min(100, Math.max(0, newMetrics.timelineAdherence + option.impact.timeline));
        }
      }

      // Enregistrer le choix du joueur
      const newChoices = {
        ...questState.playerChoices,
        [currentStep.id]: option.id
      };

      // Mettre à jour l'état de la quête avec les nouvelles métriques et le choix
      setQuestState({
        ...questState,
        playerChoices: newChoices,
        playerMetrics: newMetrics
      });
      
      // Appeler l'API pour générer la suite du scénario en fonction du choix
      const response = await apiRequest("/api/amoa/quest/choice", {
        method: "POST",
        body: JSON.stringify({
          phaseId: currentPhase.id,
          phaseTitle: currentPhase.title,
          stepId: currentStep.id,
          stepContent: currentStep.content,
          optionId: option.id,
          optionText: option.text,
          playerMetrics: newMetrics,
          playerChoices: newChoices,
          currentCharacter: currentStep.character
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response && response.narrativeStep && response.nextStep) {
        // Ajouter les nouvelles étapes générées à la phase actuelle
        const updatedPhases = [...questPhases];
        const phaseIndex = updatedPhases.findIndex(p => p.id === currentPhase.id);
        
        if (phaseIndex >= 0) {
          // Ajouter la réponse narrative à la suite des étapes existantes
          updatedPhases[phaseIndex].steps.push(response.narrativeStep);
          // Ajouter l'étape suivante (question, décision, etc.)
          updatedPhases[phaseIndex].steps.push(response.nextStep);
          
          // Mettre à jour les phases de la quête
          setQuestPhases(updatedPhases);
          
          // Passer à l'étape de la réponse narrative (qui est juste après l'étape actuelle)
          setQuestState(prevState => ({
            ...prevState,
            currentStepIndex: prevState.currentStepIndex + 1,
            completedSteps: [...prevState.completedSteps, currentStep.id]
          }));
        }
      } else {
        // Si la réponse est invalide, passer simplement à l'étape suivante
        goToNextStep();
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la sélection d'une option:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement de votre choix.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  // Rendu des étapes narratives
  const renderNarrativeStep = (step: NarrativeStep) => {
    return (
      <div className="flex mb-4">
        {step.character && (
          <div className="mr-3 flex-shrink-0">
            <CharacterAvatar character={step.character} />
          </div>
        )}
        <div className="bg-white p-4 rounded-lg shadow-sm border max-w-2xl">
          <p className="text-gray-900 whitespace-pre-line">{step.content}</p>
          
          <div className="mt-4 text-right">
            <Button 
              size="sm" 
              onClick={goToNextStep}
              disabled={loading}
            >
              Continuer
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Rendu des étapes de décision
  const renderDecisionStep = (step: NarrativeStep) => {
    if (!step.options) return null;
    
    return (
      <div className="mb-4">
        <div className="bg-amoa-blue/10 p-4 rounded-lg border border-amoa-blue/20 mb-4">
          <p className="text-amoa-blue font-semibold">{step.content}</p>
        </div>
        
        <div className="space-y-3">
          {step.options.map(option => (
            <Button
              key={option.id}
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4 text-left bg-white hover:bg-amoa-blue/5"
              onClick={() => handleOptionSelect(option)}
              disabled={loading}
            >
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-amoa-blue flex items-center justify-center mr-3 flex-shrink-0">
                  <ChevronRight className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-900">{option.text}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>
    );
  };

  // Rendu des étapes de document
  const renderDocumentStep = (step: NarrativeStep) => {
    if (!step.documents) return null;
    
    return (
      <div className="mb-4">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
          <p className="text-gray-900">{step.content}</p>
        </div>
        
        <div className="space-y-4">
          {step.documents.map((doc, index) => (
            <DocumentViewer key={index} document={doc} />
          ))}
        </div>
        
        <div className="mt-4 text-right">
          <Button 
            size="sm" 
            onClick={goToNextStep}
            disabled={loading}
          >
            J'ai compris
            <CheckCircle2 className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Rendu de l'étape actuelle
  const renderCurrentStep = () => {
    const currentStep = getCurrentStep();
    if (!currentStep) return null;

    switch (currentStep.type) {
      case "narrative":
        return renderNarrativeStep(currentStep);
      case "decision":
        return renderDecisionStep(currentStep);
      case "document":
        return renderDocumentStep(currentStep);
      default:
        return null;
    }
  };

  // Rendu des métriques du joueur
  const renderPlayerMetrics = () => {
    const metrics = [
      { 
        label: "Satisfaction des parties prenantes", 
        value: questState.playerMetrics.stakeholderSatisfaction,
        color: "bg-amoa-blue" 
      },
      { 
        label: "Qualité technique", 
        value: questState.playerMetrics.technicalQuality,
        color: "bg-gray-700" 
      },
      { 
        label: "Respect du budget", 
        value: questState.playerMetrics.budgetAdherence,
        color: "bg-amber-700" 
      },
      { 
        label: "Respect des délais", 
        value: questState.playerMetrics.timelineAdherence,
        color: "bg-purple-800" 
      }
    ];

    return (
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{metric.label}</span>
              <span className="font-medium">{metric.value}%</span>
            </div>
            <Progress 
              value={metric.value} 
              className="h-2" 
              indicatorClassName={metric.color} 
            />
          </div>
        ))}
      </div>
    );
  };

  // Fonction pour gérer la conversation libre
  const handleFreeformChat = async () => {
    if (!freeformMessage.trim() || loading) return;
    
    setLoading(true);
    const userMessage = freeformMessage.trim();
    setFreeformMessage("");
    
    // Ajouter le message de l'utilisateur à la conversation
    setFreeformConversation(prev => [
      ...prev, 
      {
        role: "user",
        content: userMessage
      }
    ]);
    
    try {
      const currentPhase = getCurrentPhase();
      
      // Appeler l'API pour gérer la conversation libre
      const response = await apiRequest("/api/amoa/quest/chat", {
        method: "POST",
        body: JSON.stringify({
          message: userMessage,
          phaseId: currentPhase?.id || "phase1",
          phaseTitle: currentPhase?.title || "Cadrage",
          playerMetrics: questState.playerMetrics,
          conversationHistory: freeformConversation
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response && response.message) {
        // Trouver un personnage approprié pour répondre
        let character: Character = {
          id: "assistant",
          name: "Mathilde Comte",
          role: "Directrice de Projet",
          avatar: "",
          mood: "neutral"
        };
        
        // Si l'API a spécifié un personnage, l'utiliser
        if (response.character) {
          character = response.character;
        } 
        // Sinon, utiliser le personnage de l'étape actuelle s'il existe
        else {
          const currentStep = getCurrentStep();
          if (currentStep?.character) {
            character = currentStep.character;
          }
        }
        
        // Ajouter la réponse de l'assistant à la conversation
        setFreeformConversation(prev => [
          ...prev, 
          {
            role: "assistant",
            content: response.message,
            character: character
          }
        ]);
        
        // Si une métrique est impactée par cette conversation, mettre à jour
        if (response.impact && typeof response.impact === 'object') {
          const newMetrics = { ...questState.playerMetrics };
          
          if (response.impact.stakeholder) {
            newMetrics.stakeholderSatisfaction = Math.min(100, Math.max(0, newMetrics.stakeholderSatisfaction + response.impact.stakeholder));
          }
          if (response.impact.technical) {
            newMetrics.technicalQuality = Math.min(100, Math.max(0, newMetrics.technicalQuality + response.impact.technical));
          }
          if (response.impact.budget) {
            newMetrics.budgetAdherence = Math.min(100, Math.max(0, newMetrics.budgetAdherence + response.impact.budget));
          }
          if (response.impact.timeline) {
            newMetrics.timelineAdherence = Math.min(100, Math.max(0, newMetrics.timelineAdherence + response.impact.timeline));
          }
          
          setQuestState(prev => ({
            ...prev,
            playerMetrics: newMetrics
          }));
        }
      } else {
        throw new Error("Réponse invalide");
      }
    } catch (error) {
      console.error("Erreur lors de la conversation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la conversation. Veuillez réessayer.",
        variant: "destructive"
      });
      
      // En cas d'erreur, ajouter un message d'erreur dans la conversation
      setFreeformConversation(prev => [
        ...prev, 
        {
          role: "assistant",
          content: "Désolé, je n'ai pas pu traiter votre message. Veuillez réessayer.",
          character: {
            id: "system",
            name: "Système",
            role: "Assistant",
            avatar: "",
            mood: "concerned"
          }
        }
      ]);
    } finally {
      setLoading(false);
      
      // Faire défiler jusqu'au dernier message
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  // Calculer la progression globale
  const calculateProgress = () => {
    const currentPhase = getCurrentPhase();
    if (!currentPhase) return 0;
    
    const currentPhaseIndex = questPhases.findIndex(phase => phase.id === questState.currentPhaseId);
    const completedPhases = currentPhaseIndex;
    const totalPhases = questPhases.length;
    
    const stepsInCurrentPhase = currentPhase.steps.length;
    const completedStepsInCurrentPhase = questState.currentStepIndex;
    
    // Calcul de la progression en pourcentage
    const progressPerPhase = 1 / totalPhases;
    const progressForCompletedPhases = completedPhases * progressPerPhase;
    const progressForCurrentPhase = (completedStepsInCurrentPhase / stepsInCurrentPhase) * progressPerPhase;
    
    return Math.min(100, Math.round((progressForCompletedPhases + progressForCurrentPhase) * 100));
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent border-amoa-blue rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-700">Initialisation de l'aventure...</h2>
          <p className="text-gray-500 mt-2">Préparation des personnages et des scénarios</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Introduction à AMOA Quest */}
      <Dialog open={showIntro} onOpenChange={setShowIntro}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl">
              <Route className="h-6 w-6 text-amoa-blue mr-2" />
              Bienvenue dans AMOA Quest
            </DialogTitle>
            <DialogDescription>
              Votre aventure interactive pour maîtriser les compétences d'Assistance à Maîtrise d'Ouvrage
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <p>
              Vous incarnez un.e Assistant.e à Maîtrise d'Ouvrage récemment embauché.e pour travailler sur un projet stratégique. 
              À travers cette simulation, vous devrez faire face à des situations réelles et prendre des décisions qui influenceront 
              le déroulement du projet et la satisfaction des parties prenantes.
            </p>
            
            <div className="bg-amoa-blue p-4 rounded-lg border border-amoa-blue/90">
              <h3 className="font-semibold text-white mb-2 flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Comment jouer
              </h3>
              <ul className="space-y-2 text-sm text-white">
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-white" />
                  <span>Lisez attentivement les dialogues et les documents qui vous sont présentés</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-white" />
                  <span>Prenez des décisions réfléchies en fonction du contexte et des objectifs du projet</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-white" />
                  <span>Suivez l'évolution de vos métriques pour ajuster votre approche</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 text-white" />
                  <span>Complétez les différentes phases du projet pour développer vos compétences</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <h3 className="font-semibold text-amber-900 mb-2 flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Intelligence Artificielle
              </h3>
              <p className="text-sm text-amber-900">
                Cette simulation est alimentée par l'intelligence artificielle qui adapte l'histoire et les réactions des personnages 
                en fonction de vos décisions. Chaque parcours est unique et personnalisé.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setShowIntro(false)}
              className="bg-amoa-blue hover:bg-amoa-blue/90"
            >
              Commencer l'aventure
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Aide contextuelle */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 text-amoa-blue mr-2" />
              Aide et conseils
            </DialogTitle>
            <DialogDescription>
              Guide pour réussir votre mission d'AMOA
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-2">Bonnes pratiques AMOA</h3>
              <ul className="space-y-2 text-sm text-gray-900">
                <li>• Recueillir les besoins de manière approfondie</li>
                <li>• Documenter clairement les spécifications</li>
                <li>• Assurer une communication fluide entre les parties prenantes</li>
                <li>• Anticiper les risques et proposer des solutions</li>
                <li>• Veiller à l'alignement avec les objectifs stratégiques</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-2">Métriques de performance</h3>
              <ul className="text-sm text-gray-900 space-y-1">
                <li>
                  <span className="text-amoa-blue font-medium">Satisfaction des parties prenantes :</span> Reflète la qualité de vos interactions
                </li>
                <li>
                  <span className="text-gray-900 font-medium">Qualité technique :</span> Évalue la rigueur de vos spécifications
                </li>
                <li>
                  <span className="text-amber-700 font-medium">Respect du budget :</span> Mesure votre attention aux contraintes financières
                </li>
                <li>
                  <span className="text-purple-900 font-medium">Respect des délais :</span> Indique votre capacité à tenir les échéances
                </li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHelp(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header avec navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/amoa" className="mr-4">
              <Button variant="outline" size="sm" className="text-amoa-blue">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">AMOA Quest</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowHelp(true)}
              className="text-amoa-blue"
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Aide
            </Button>
            
            <div className="bg-amoa-blue text-white text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Progression : {calculateProgress()}%
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Panneau principal de l'aventure */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Phase actuelle */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="bg-white text-amoa-blue border-amoa-blue/30">
                  Phase {questPhases.findIndex(phase => phase.id === questState.currentPhaseId) + 1}/{questPhases.length}
                </Badge>
                <h2 className="text-xl font-bold text-gray-900">{getCurrentPhase()?.title}</h2>
              </div>
              <p className="text-gray-600">{getCurrentPhase()?.description}</p>
            </div>
            
            {/* Conversation et interactions simplifiées */}
            <div className="bg-gray-100 rounded-lg p-4 min-h-[400px]">
              {/* Introduction à la phase actuelle */}
              <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
                <div className="flex items-start">
                  <div className="mr-3 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-amoa-blue flex items-center justify-center text-white">
                      <Info className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Objectif de cette phase</h3>
                    <p className="text-gray-700 text-sm whitespace-pre-line">
                      Dans cette phase, vous allez travailler sur {getCurrentPhase()?.title}. 
                      {getCurrentPhase()?.description}
                      
                      Utilisez la zone de conversation ci-dessous pour dialoguer avec les parties prenantes et obtenir les informations nécessaires pour votre mission d'AMOA.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Affichage simplifié du contexte narratif */}
              {getCurrentPhase()?.steps.slice(0, 1).map((step, index) => (
                <div key={index} className="mb-6">
                  {step.character && (
                    <div className="flex mb-4">
                      <div className="mr-3 flex-shrink-0">
                        <CharacterAvatar character={step.character} />
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm border max-w-2xl">
                        <p className="text-gray-900 whitespace-pre-line">{step.content}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Interface de conversation libre avec les parties prenantes */}
              <div className="mt-8 border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <User className="h-4 w-4 mr-2 text-amoa-blue" />
                  Discuter avec les parties prenantes
                </h3>
                <div className="bg-white rounded-lg border p-3 mb-3">
                  <p className="text-sm text-gray-700">
                    Posez des questions ou engagez une conversation avec les parties prenantes du projet pour obtenir plus d'informations et mieux comprendre leurs besoins.
                  </p>
                </div>
                
                {/* Afficher la conversation existante */}
                {freeformConversation.length > 0 && (
                  <div className="mb-4 space-y-3">
                    {freeformConversation.map((message, index) => (
                      <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : ''}`}>
                        {message.role === 'assistant' && message.character && (
                          <div className="mr-3 flex-shrink-0">
                            <CharacterAvatar character={message.character} />
                          </div>
                        )}
                        
                        <div className={`p-3 rounded-lg max-w-[80%] ${
                          message.role === 'user' 
                            ? 'bg-amoa-blue text-white' 
                            : 'bg-white border shadow-sm'
                        }`}>
                          <p className={`text-sm whitespace-pre-line ${
                            message.role === 'user' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {message.content}
                          </p>
                        </div>
                        
                        {message.role === 'user' && (
                          <div className="ml-3 flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-amoa-blue">
                              <User className="h-5 w-5" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="relative">
                  <textarea 
                    className="w-full border rounded-lg p-3 pr-10 min-h-[100px] focus:ring-1 focus:ring-amoa-blue"
                    placeholder="Tapez votre message ici pour discuter avec les parties prenantes du projet..."
                    value={freeformMessage}
                    onChange={(e) => setFreeformMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        e.preventDefault();
                        handleFreeformChat();
                      }
                    }}
                  />
                  <Button 
                    size="sm" 
                    className="absolute bottom-3 right-3 bg-amoa-blue hover:bg-amoa-blue/90"
                    disabled={!freeformMessage.trim() || loading}
                    onClick={handleFreeformChat}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {loading && (
                  <div className="text-center mt-2">
                    <div className="w-5 h-5 border-2 border-t-transparent border-amoa-blue rounded-full animate-spin inline-block mr-2"></div>
                    <span className="text-xs text-gray-700">Traitement en cours...</span>
                  </div>
                )}
              </div>
              
              {/* Référence pour faire défiler jusqu'au dernier message */}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
        
        {/* Panneau latéral avec informations et métriques */}
        <div className="md:w-80 lg:w-96 bg-white border-t md:border-t-0 md:border-l">
          <div className="p-4">
            <Tabs defaultValue="metrics">
              <TabsList className="w-full">
                <TabsTrigger value="metrics" className="flex-1">
                  <BarChart4 className="h-4 w-4 mr-1" />
                  Métriques
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex-1">
                  <FileText className="h-4 w-4 mr-1" />
                  Documents
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="metrics" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      <div className="flex items-center">
                        <ShieldCheck className="h-5 w-5 mr-2 text-amoa-blue" />
                        Performance du projet
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderPlayerMetrics()}
                  </CardContent>
                  <CardFooter className="pt-0 text-xs text-gray-700 font-medium">
                    Ces métriques évoluent en fonction de vos décisions
                  </CardFooter>
                </Card>
                
                <div className="mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        <div className="flex items-center">
                          <Briefcase className="h-5 w-5 mr-2 text-amoa-blue" />
                          Progression globale
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Avancement de l'aventure</span>
                            <span className="font-medium">{calculateProgress()}%</span>
                          </div>
                          <Progress value={calculateProgress()} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          {questPhases.map((phase, index) => {
                            const isCurrentPhase = phase.id === questState.currentPhaseId;
                            const isCompleted = index < questPhases.findIndex(p => p.id === questState.currentPhaseId);
                            const stepsCompleted = isCurrentPhase ? questState.currentStepIndex : (isCompleted ? phase.steps.length : 0);
                            
                            return (
                              <div key={phase.id} className={cn(
                                "p-2 rounded-lg border text-sm",
                                isCurrentPhase ? "bg-amoa-blue border-amoa-blue/80" : 
                                isCompleted ? "bg-gray-700 border-gray-600" : "bg-gray-200 border-gray-300"
                              )}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className={cn(
                                    "font-medium",
                                    isCurrentPhase ? "text-white" : 
                                    isCompleted ? "text-white" : "text-gray-900"
                                  )}>
                                    {index + 1}. {phase.title}
                                  </span>
                                  <span className={cn(
                                    "text-xs",
                                    isCurrentPhase || isCompleted ? "text-white" : "text-gray-900"
                                  )}>
                                    {stepsCompleted}/{phase.steps.length}
                                  </span>
                                </div>
                                <Progress 
                                  value={(stepsCompleted / phase.steps.length) * 100} 
                                  className="h-1.5"
                                  indicatorClassName={
                                    isCurrentPhase ? "bg-white" : 
                                    isCompleted ? "bg-white" : "bg-gray-400"
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Documents du projet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(questState.documents).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(questState.documents).map(([category, docs]) => (
                          <div key={category}>
                            <h3 className="text-sm font-medium mb-1">{category}</h3>
                            <div className="space-y-1">
                              {docs.map((doc: any, index: number) => (
                                <Button 
                                  key={index} 
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start text-xs"
                                >
                                  <FileText className="h-3 w-3 mr-2" />
                                  {doc.title}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-700 font-medium">Aucun document collecté pour le moment</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}