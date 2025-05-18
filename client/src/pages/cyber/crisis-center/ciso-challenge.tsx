import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import HomeLayout from '@/components/layout/HomeLayout';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertCircle,
  Clock,
  PauseCircle,
  PlayCircle,
  BarChart4,
  MessageSquare,
  Users,
  Cpu,
  Shield,
  AlertTriangle,
  Check,
  X,
  FastForward,
  ChevronRight,
  Bot,
  Sparkles,
  BrainCircuit,
  Lightbulb,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { AvatarImage } from '@/components/ui/avatar';
import { AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

// Types
type TeamMember = {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  avatar: string;
  morale: number;
  fatigue: number;
  assigned: boolean;
  aiAssistance?: boolean; // Indique si le membre bénéficie d'une assistance IA
};

type Resource = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  cost: number;
  type: "technical" | "human" | "financial";
  aiPowered?: boolean; // Indique si la ressource est améliorée par l'IA
};

type ScenarioEvent = {
  id: string;
  title: string;
  description: string;
  timeStamp: string;
  severity: "low" | "medium" | "high" | "critical";
  read: boolean;
  aiRecommendation?: string; // Recommandation d'action générée par l'IA
};

type DecisionOption = {
  id: string;
  text: string;
  consequences: {
    threatDelta: number;
    reputationDelta: number;
    budgetDelta: number;
    timeDelta: number;
    moraleDelta: number;
    description: string;
  };
};

type Decision = {
  id: string;
  title: string;
  description: string;
  options: DecisionOption[];
  deadline?: number;
  triggered: boolean;
  resolved: boolean;
};

type Communication = {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  content: string;
  timeStamp: string;
  read: boolean;
  replied: boolean;
  options?: {
    id: string;
    text: string;
    consequences: {
      threatDelta: number;
      reputationDelta: number;
      budgetDelta: number;
      description: string;
    };
  }[];
};

type LogEntry = {
  id: string;
  text: string;
  timeStamp: string;
  category: string;
};

type ScoreBreakdown = {
  category: string;
  value: number;
  description: string;
};

type GameState = {
  scenarioId: string;
  scenarioTitle: string;
  scenarioDescription: string;
  currentTime: number;
  elapsedRealTime: number;
  threatLevel: number;
  reputation: number;
  budget: number;
  timeRemaining: number;
  gameSpeed: number;
  paused: boolean;
  team: TeamMember[];
  resources: Resource[];
  events: ScenarioEvent[];
  decisions: Decision[];
  communications: Communication[];
  logs: LogEntry[];
  score: {
    current: number;
    breakdown: ScoreBreakdown[];
  };
  gameOver: boolean;
  gameOverReason?: string;
  gameWon: boolean;
  aiAssistantActive: boolean; // Indique si l'assistant IA est actif
  aiSuggestion: string | null; // Dernière suggestion de l'assistant IA
  aiAnalysisInProgress: boolean; // Indique si une analyse IA est en cours
};

// Utilitaires et données

// Formater le temps de jeu en heures:minutes AM/PM
function formatGameTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

// Déterminer la couleur de la sévérité
function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'low':
      return 'bg-green-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'high':
      return 'bg-orange-500';
    case 'critical':
      return 'bg-red-500';
    default:
      return 'bg-blue-500';
  }
}

// Déterminer la couleur du niveau de menace
function getThreatLevelColor(level: number): string {
  if (level < 25) return 'bg-green-500';
  if (level < 50) return 'bg-yellow-500';
  if (level < 75) return 'bg-orange-500';
  return 'bg-red-500';
}

// Déterminer la couleur de la réputation
function getReputationColor(reputation: number): string {
  if (reputation < 25) return 'bg-red-500';
  if (reputation < 50) return 'bg-orange-500';
  if (reputation < 75) return 'bg-yellow-500';
  return 'bg-green-500';
}

// Initialiser l'état du jeu pour un scénario donné
function initializeGameState(scenarioId: string): GameState {
  // Données de scénario fictives pour la démonstration
  const scenarios = {
    'ransomware': {
      title: 'Attaque par Rançongiciel',
      description: 'L\'organisation a été touchée par une attaque sophistiquée de rançongiciel affectant les systèmes critiques. Les fichiers ont été chiffrés et une demande de rançon exige un paiement sous 48 heures.',
      threatLevel: 80,
      reputation: 70,
      budget: 50000,
      timeRemaining: 48 * 60, // 48 heures en minutes
    },
    'data-breach': {
      title: 'Customer Data Breach',
      description: 'A potential data breach has been detected involving customer personal and financial information. The extent of the breach is still unknown.',
      threatLevel: 70,
      reputation: 85,
      budget: 75000,
      timeRemaining: 72 * 60, // 72 hours in minutes
    },
    'ddos': {
      title: 'DDoS Attack',
      description: 'The organization is experiencing a massive Distributed Denial of Service (DDoS) attack targeting our customer-facing services.',
      threatLevel: 60,
      reputation: 75,
      budget: 40000,
      timeRemaining: 24 * 60, // 24 hours in minutes
    },
    'insider-threat': {
      title: 'Insider Threat',
      description: 'Suspicious activity has been detected suggesting a possible insider threat. Sensitive internal systems may have been compromised.',
      threatLevel: 65,
      reputation: 90,
      budget: 60000,
      timeRemaining: 36 * 60, // 36 hours in minutes
    },
    'supply-chain': {
      title: 'Supply Chain Compromise',
      description: 'A critical software vendor has reported a security breach that might have affected their products used in our infrastructure.',
      threatLevel: 75,
      reputation: 80,
      budget: 55000,
      timeRemaining: 60 * 60, // 60 hours in minutes
    },
  };

  // Sélectionner le scénario ou utiliser 'ransomware' par défaut
  const scenario = scenarios[scenarioId as keyof typeof scenarios] || scenarios.ransomware;

  // Équipe par défaut
  const defaultTeam: TeamMember[] = [
    {
      id: 'tm1',
      name: 'Alex Morgan',
      role: 'Security Operations Lead',
      expertise: ['Incident Response', 'Threat Hunting', 'SIEM'],
      avatar: '/security-operations-lead.png',
      morale: 90,
      fatigue: 0,
      assigned: false
    },
    {
      id: 'tm2',
      name: 'Sam Chen',
      role: 'Technical Security Specialist',
      expertise: ['Malware Analysis', 'Forensics', 'System Hardening'],
      avatar: '/technical-security-specialist.png',
      morale: 85,
      fatigue: 0,
      assigned: false
    },
    {
      id: 'tm3',
      name: 'Jordan Taylor',
      role: 'Communications Officer',
      expertise: ['PR Management', 'Crisis Communications', 'Stakeholder Relations'],
      avatar: '/placeholder-txu4e.png',
      morale: 95,
      fatigue: 0,
      assigned: false
    },
    {
      id: 'tm4',
      name: 'Jamie Rivera',
      role: 'Compliance Specialist',
      expertise: ['Regulatory Requirements', 'Legal Implications', 'Documentation'],
      avatar: '/placeholder-txu4e.png',
      morale: 90,
      fatigue: 0,
      assigned: false
    }
  ];

  // Ressources par défaut
  const defaultResources: Resource[] = [
    {
      id: 'res1',
      name: 'Forensic Analysis Team',
      description: 'External specialists in digital forensics and incident response',
      quantity: 0,
      cost: 15000,
      type: 'human'
    },
    {
      id: 'res2',
      name: 'Enhanced Backup Solution',
      description: 'Secure, isolated backup system for critical data recovery',
      quantity: 0,
      cost: 10000,
      type: 'technical'
    },
    {
      id: 'res3',
      name: 'Endpoint Protection',
      description: 'Advanced protection for all endpoints with threat detection',
      quantity: 0,
      cost: 8000,
      type: 'technical'
    },
    {
      id: 'res4',
      name: 'Bitcoin Reserve',
      description: 'Cryptocurrency reserve for potential ransom payment',
      quantity: 0,
      cost: 20000,
      type: 'financial'
    },
    {
      id: 'res5',
      name: 'PR Agency Services',
      description: 'Professional PR management and damage control',
      quantity: 0,
      cost: 12000,
      type: 'human'
    }
  ];

  // Événements initiaux
  const initialEvents: ScenarioEvent[] = [
    {
      id: 'evt1',
      title: 'Initial Detection Alert',
      description: scenarioId === 'ransomware' 
        ? 'Multiple systems reporting unauthorized encryption activity' 
        : 'Suspicious activity detected in network logs',
      timeStamp: formatGameTime(0),
      severity: 'high',
      read: false
    }
  ];

  // Décisions initiales
  const initialDecisions: Decision[] = [
    {
      id: 'dec1',
      title: 'Initial Response',
      description: 'How do you want to respond to the initial incident?',
      options: [
        {
          id: 'opt1',
          text: 'Isolate affected systems immediately',
          consequences: {
            threatDelta: -15,
            reputationDelta: -5,
            budgetDelta: -5000,
            timeDelta: 0,
            moraleDelta: 0,
            description: 'Reduced immediate threat but disrupted business operations'
          }
        },
        {
          id: 'opt2',
          text: 'Investigate while maintaining systems online',
          consequences: {
            threatDelta: 5,
            reputationDelta: 0,
            budgetDelta: -2000,
            timeDelta: 0,
            moraleDelta: 0,
            description: 'Maintained operations but allowed threat to potentially spread'
          }
        },
        {
          id: 'opt3',
          text: 'Deploy monitoring solution to all systems',
          consequences: {
            threatDelta: -5,
            reputationDelta: 0,
            budgetDelta: -8000,
            timeDelta: 0,
            moraleDelta: 5,
            description: 'Enhanced visibility with minimal operational impact'
          }
        }
      ],
      triggered: true,
      resolved: false
    }
  ];

  // Communications initiales
  const initialCommunications: Communication[] = [
    {
      id: 'com1',
      sender: 'CEO',
      recipient: 'CISO',
      subject: 'Security Incident',
      content: 'I\'ve just been informed about the security incident. What\'s our current status and what are you doing to address it?',
      timeStamp: formatGameTime(15),
      read: false,
      replied: false,
      options: [
        {
          id: 'rep1',
          text: 'We\'re investigating with minimal details to share at this point',
          consequences: {
            threatDelta: 0,
            reputationDelta: -5,
            budgetDelta: 0,
            description: 'CEO is concerned about lack of information'
          }
        },
        {
          id: 'rep2',
          text: 'Provide detailed technical explanation of the incident',
          consequences: {
            threatDelta: 0,
            reputationDelta: 0,
            budgetDelta: 0,
            description: 'CEO appreciates thoroughness but was overwhelmed by technical details'
          }
        },
        {
          id: 'rep3',
          text: 'Explain the situation, current actions, and recommend next steps',
          consequences: {
            threatDelta: 0,
            reputationDelta: 5,
            budgetDelta: 5000,
            description: 'CEO is impressed with your handling of the situation'
          }
        }
      ]
    }
  ];

  // Logs initiaux
  const initialLogs: LogEntry[] = [
    {
      id: 'log1',
      text: 'Security incident detected',
      timeStamp: formatGameTime(0),
      category: 'system'
    },
    {
      id: 'log2',
      text: 'Crisis management initiated',
      timeStamp: formatGameTime(5),
      category: 'action'
    }
  ];

  // Retourner l'état initial du jeu
  return {
    scenarioId,
    scenarioTitle: scenario.title,
    scenarioDescription: scenario.description,
    currentTime: 0, // Démarrer à 0 minutes
    elapsedRealTime: 0,
    threatLevel: scenario.threatLevel,
    reputation: scenario.reputation,
    budget: scenario.budget,
    timeRemaining: scenario.timeRemaining,
    gameSpeed: 1, // Vitesse normale au départ
    paused: true, // Démarrer en pause
    team: defaultTeam,
    resources: defaultResources,
    events: initialEvents,
    decisions: initialDecisions,
    communications: initialCommunications,
    logs: initialLogs,
    score: {
      current: 0,
      breakdown: []
    },
    gameOver: false,
    gameWon: false,
    aiAssistantActive: true,
    aiSuggestion: `L'analyse de la menace "${scenario.title}" indique un niveau de risque ${scenario.threatLevel > 75 ? 'critique' : scenario.threatLevel > 50 ? 'élevé' : 'modéré'}. Recommandation initiale : évaluez l'étendue de l'incident et mobilisez l'équipe de réponse.`,
    aiAnalysisInProgress: false
  };
}

export default function CISOChallenge() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [scenarioId, setScenarioId] = useState<string>('ransomware');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showDecisionDialog, setShowDecisionDialog] = useState<boolean>(false);
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null);
  const [gameOverDialog, setGameOverDialog] = useState<boolean>(false);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState<boolean>(false);
  const [showAiAssistant, setShowAiAssistant] = useState<boolean>(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialiser le jeu
  useEffect(() => {
    try {
      const initialState = initializeGameState(scenarioId || 'ransomware');
      setGameState(initialState);
      
      // Initialiser l'assistant IA
      if (initialState.aiSuggestion) {
        setAiSuggestion(initialState.aiSuggestion);
      }
    } catch (error) {
      console.error("Échec d'initialisation du jeu:", error);
      toast({
        title: 'Erreur',
        description: "Échec de l'initialisation du scénario de jeu",
        variant: 'destructive'
      });
    }
  }, [scenarioId, toast]);

  // Système de timer
  useEffect(() => {
    if (!gameState || gameState.paused || gameState.gameOver) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setGameState((prevState) => {
        if (!prevState) return prevState;

        const newTime = prevState.currentTime + 1;
        const newTimeRemaining = prevState.timeRemaining - 1;
        const newElapsedRealTime = prevState.elapsedRealTime + 1;

        // Vérifier les conditions de fin de jeu
        let gameOver = prevState.gameOver;
        let gameOverReason = prevState.gameOverReason;
        let gameWon = prevState.gameWon;

        if (newTimeRemaining <= 0) {
          gameOver = true;
          gameOverReason = 'Time expired';
        } else if (prevState.threatLevel >= 100) {
          gameOver = true;
          gameOverReason = 'Threat level critical';
        } else if (prevState.reputation <= 0) {
          gameOver = true;
          gameOverReason = 'Reputation depleted';
        } else if (prevState.threatLevel <= 0) {
          gameOver = true;
          gameWon = true;
          gameOverReason = 'Threat eliminated';
        }

        // Vérifier les déclencheurs de décision (exemple simple)
        const decisions = prevState.decisions.map(decision => {
          if (!decision.triggered && !decision.resolved && newTime % 20 === 0) {
            // Exemple simple: déclencher une nouvelle décision toutes les 20 minutes de jeu
            return { ...decision, triggered: true };
          }
          return decision;
        });

        // Si le jeu est terminé, afficher le dialogue
        if (gameOver && !prevState.gameOver) {
          setTimeout(() => setGameOverDialog(true), 500);
        }

        return {
          ...prevState,
          currentTime: newTime,
          timeRemaining: newTimeRemaining,
          elapsedRealTime: newElapsedRealTime,
          decisions,
          gameOver,
          gameOverReason,
          gameWon
        };
      });
    }, 1000 / (gameState.gameSpeed || 1));

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState?.paused, gameState?.gameOver, gameState?.gameSpeed]);

  // Vérifier les décisions non résolues
  useEffect(() => {
    if (gameState && !gameState.paused && !gameState.gameOver) {
      const pendingDecision = gameState.decisions.find(d => d.triggered && !d.resolved);
      if (pendingDecision && !showDecisionDialog) {
        setCurrentDecision(pendingDecision);
        setShowDecisionDialog(true);
      }
    }
  }, [gameState, showDecisionDialog]);

  // Gérer une prise de décision
  const handleDecision = (decision: Decision, optionId: string) => {
    if (!gameState) return;

    const selectedOption = decision.options.find(opt => opt.id === optionId);
    if (!selectedOption) return;

    setShowDecisionDialog(false);

    // Appliquer les conséquences
    setGameState(prevState => {
      if (!prevState) return prevState;

      const consequences = selectedOption.consequences;
      const newThreatLevel = Math.max(0, Math.min(100, prevState.threatLevel + consequences.threatDelta));
      const newReputation = Math.max(0, Math.min(100, prevState.reputation + consequences.reputationDelta));
      const newBudget = prevState.budget + consequences.budgetDelta;
      const newTimeRemaining = prevState.timeRemaining + consequences.timeDelta;

      // Mettre à jour les décisions
      const updatedDecisions = prevState.decisions.map(d => {
        if (d.id === decision.id) {
          return { ...d, resolved: true };
        }
        return d;
      });

      // Ajouter aux logs
      const newLogs = [
        ...prevState.logs,
        {
          id: `log-${Date.now()}`,
          text: `Decision made: ${decision.title} - ${selectedOption.text}`,
          timeStamp: formatGameTime(prevState.currentTime),
          category: 'decision'
        }
      ];

      return {
        ...prevState,
        threatLevel: newThreatLevel,
        reputation: newReputation,
        budget: newBudget,
        timeRemaining: newTimeRemaining,
        decisions: updatedDecisions,
        logs: newLogs
      };
    });

    // Notification
    toast({
      title: 'Decision made',
      description: selectedOption.consequences.description,
    });
  };

  // Gérer la pause/reprise
  const togglePause = () => {
    if (!gameState) return;

    setGameState(prevState => {
      if (!prevState) return prevState;
      return { ...prevState, paused: !prevState.paused };
    });

    toast({
      title: gameState.paused ? 'Game resumed' : 'Game paused',
      duration: 2000,
    });
  };

  // Ajuster la vitesse de jeu
  const adjustGameSpeed = (speed: number) => {
    if (!gameState) return;

    setGameState(prevState => {
      if (!prevState) return prevState;
      return { ...prevState, gameSpeed: speed };
    });

    toast({
      title: `Game speed: ${speed}x`,
      duration: 2000,
    });
  };

  // Acheter une ressource
  const purchaseResource = (resourceId: string) => {
    if (!gameState) return;

    const resource = gameState.resources.find(r => r.id === resourceId);
    if (!resource) return;

    if (gameState.budget < resource.cost) {
      toast({
        title: 'Insufficient budget',
        description: `You need ${resource.cost} budget to purchase this resource`,
        variant: 'destructive'
      });
      return;
    }

    setGameState(prevState => {
      if (!prevState) return prevState;

      // Mettre à jour la ressource
      const updatedResources = prevState.resources.map(r => {
        if (r.id === resourceId) {
          return { ...r, quantity: r.quantity + 1 };
        }
        return r;
      });

      // Mettre à jour le budget
      const newBudget = prevState.budget - resource.cost;

      // Ajouter aux logs
      const newLogs = [
        ...prevState.logs,
        {
          id: `log-${Date.now()}`,
          text: `Resource purchased: ${resource.name}`,
          timeStamp: formatGameTime(prevState.currentTime),
          category: 'resource'
        }
      ];

      return {
        ...prevState,
        resources: updatedResources,
        budget: newBudget,
        logs: newLogs
      };
    });

    toast({
      title: 'Resource purchased',
      description: `You have purchased ${resource.name}`,
    });
  };

  // Répondre à une communication
  const respondToCommunication = (communicationId: string, optionId: string) => {
    if (!gameState) return;

    const communication = gameState.communications.find(c => c.id === communicationId);
    if (!communication || !communication.options) return;

    const option = communication.options.find(o => o.id === optionId);
    if (!option) return;

    setGameState(prevState => {
      if (!prevState) return prevState;

      // Appliquer les conséquences
      const newThreatLevel = Math.max(0, Math.min(100, prevState.threatLevel + option.consequences.threatDelta));
      const newReputation = Math.max(0, Math.min(100, prevState.reputation + option.consequences.reputationDelta));
      const newBudget = prevState.budget + option.consequences.budgetDelta;

      // Mettre à jour la communication
      const updatedCommunications = prevState.communications.map(c => {
        if (c.id === communicationId) {
          return { ...c, replied: true };
        }
        return c;
      });

      // Ajouter aux logs
      const newLogs = [
        ...prevState.logs,
        {
          id: `log-${Date.now()}`,
          text: `Responded to ${communication.sender}: ${option.text}`,
          timeStamp: formatGameTime(prevState.currentTime),
          category: 'communication'
        }
      ];

      return {
        ...prevState,
        threatLevel: newThreatLevel,
        reputation: newReputation,
        budget: newBudget,
        communications: updatedCommunications,
        logs: newLogs
      };
    });

    toast({
      title: 'Response sent',
      description: option.consequences.description,
    });
  };

  // Assigner un membre de l'équipe
  const assignTeamMember = (memberId: string, assigned: boolean) => {
    if (!gameState) return;

    setGameState(prevState => {
      if (!prevState) return prevState;

      // Mettre à jour l'équipe
      const updatedTeam = prevState.team.map(member => {
        if (member.id === memberId) {
          return { ...member, assigned };
        }
        return member;
      });

      // Ajouter aux logs
      const member = prevState.team.find(m => m.id === memberId);
      const newLogs = [
        ...prevState.logs,
        {
          id: `log-${Date.now()}`,
          text: `Team member ${member?.name} ${assigned ? 'assigned' : 'unassigned'}`,
          timeStamp: formatGameTime(prevState.currentTime),
          category: 'team'
        }
      ];

      return {
        ...prevState,
        team: updatedTeam,
        logs: newLogs
      };
    });
  };

  // Marquer un événement comme lu
  const markEventAsRead = (eventId: string) => {
    if (!gameState) return;

    setGameState(prevState => {
      if (!prevState) return prevState;

      // Mettre à jour les événements
      const updatedEvents = prevState.events.map(event => {
        if (event.id === eventId) {
          return { ...event, read: true };
        }
        return event;
      });

      return {
        ...prevState,
        events: updatedEvents
      };
    });
  };

  // Marquer une communication comme lue
  const markCommunicationAsRead = (communicationId: string) => {
    if (!gameState) return;

    setGameState(prevState => {
      if (!prevState) return prevState;

      // Mettre à jour les communications
      const updatedCommunications = prevState.communications.map(comm => {
        if (comm.id === communicationId) {
          return { ...comm, read: true };
        }
        return comm;
      });

      return {
        ...prevState,
        communications: updatedCommunications
      };
    });
  };

  // Redémarrer le jeu
  const restartGame = () => {
    try {
      const initialState = initializeGameState(scenarioId || 'ransomware');
      setGameState(initialState);
      setGameOverDialog(false);
      setActiveTab('dashboard');
      toast({
        title: 'Game restarted',
        description: 'The scenario has been reset',
      });
    } catch (error) {
      console.error("Failed to restart game:", error);
      toast({
        title: 'Error',
        description: 'Failed to restart the game',
        variant: 'destructive'
      });
    }
  };

  // Changer de scénario
  const changeScenario = (newScenarioId: string) => {
    setScenarioId(newScenarioId);
    try {
      const initialState = initializeGameState(newScenarioId);
      setGameState(initialState);
      setGameOverDialog(false);
      setActiveTab('dashboard');
      toast({
        title: 'Scenario changed',
        description: `Now playing: ${initialState.scenarioTitle}`,
      });
    } catch (error) {
      console.error("Failed to change scenario:", error);
      toast({
        title: 'Error',
        description: 'Failed to change the scenario',
        variant: 'destructive'
      });
    }
  };

  // Calcul des notifications non lues
  const unreadEvents = gameState?.events.filter(event => !event.read).length || 0;
  const unreadCommunications = gameState?.communications.filter(comm => !comm.read).length || 0;

  // Rendu de l'interface
  if (!gameState) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Loading CISO Challenge...</h2>
          <div className="w-16 h-16 border-4 border-t-cyan-500 border-gray-700 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <HomeLayout>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-900 to-black">
        {/* En-tête */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">{gameState.scenarioTitle}</h1>
            <p className="text-slate-400 text-sm">{gameState.scenarioDescription}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-cyan-400 mr-2" />
              <span className="text-white font-mono text-lg">{formatGameTime(gameState.currentTime)}</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePause}
                className="border-cyan-700 bg-slate-800 hover:bg-slate-700"
              >
                {gameState.paused ? 
                  <PlayCircle className="w-5 h-5 text-green-500 mr-1" /> : 
                  <PauseCircle className="w-5 h-5 text-cyan-500 mr-1" />
                }
                {gameState.paused ? 'Start' : 'Pause'}
              </Button>
              <div className="flex items-center space-x-2 bg-slate-700 rounded-md px-2 py-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => adjustGameSpeed(1)}
                  className={`px-2 py-1 ${gameState.gameSpeed === 1 ? 'bg-cyan-900 text-cyan-400' : 'text-slate-400'}`}
                >
                  1x
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => adjustGameSpeed(2)}
                  className={`px-2 py-1 ${gameState.gameSpeed === 2 ? 'bg-cyan-900 text-cyan-400' : 'text-slate-400'}`}
                >
                  2x
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => adjustGameSpeed(4)}
                  className={`px-2 py-1 ${gameState.gameSpeed === 4 ? 'bg-cyan-900 text-cyan-400' : 'text-slate-400'}`}
                >
                  <FastForward className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex h-[calc(100vh-64px)]">
          {/* Panneau latéral */}
          <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
            {/* Indicateurs */}
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">Status Indicators</h2>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-300">Threat Level</span>
                    <span className="text-sm font-medium text-white">{gameState.threatLevel}%</span>
                  </div>
                  <Progress 
                    value={gameState.threatLevel} 
                    className={`h-2 ${getThreatLevelColor(gameState.threatLevel)}`} 
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-300">Reputation</span>
                    <span className="text-sm font-medium text-white">{gameState.reputation}%</span>
                  </div>
                  <Progress 
                    value={gameState.reputation} 
                    className={`h-2 ${getReputationColor(gameState.reputation)}`} 
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-300">Budget</span>
                    <span className="text-sm font-medium text-white">${gameState.budget.toLocaleString()}</span>
                  </div>
                  <Progress 
                    value={gameState.budget / 100000 * 100} 
                    max={100}
                    className="h-2 bg-blue-500" 
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-300">Time Remaining</span>
                    <span className="text-sm font-medium text-white">{Math.floor(gameState.timeRemaining / 60)}h {gameState.timeRemaining % 60}m</span>
                  </div>
                  <Progress 
                    value={gameState.timeRemaining / (48 * 60) * 100} 
                    max={100}
                    className="h-2 bg-cyan-600" 
                  />
                </div>
              </div>
            </div>

            {/* Équipe */}
            <div className="p-4 border-b border-slate-700 flex-1 overflow-auto">
              <h2 className="text-lg font-semibold text-white mb-4">Security Team</h2>

              <div className="space-y-3">
                {gameState.team.map(member => (
                  <div key={member.id} className="p-2 bg-slate-700 rounded-md">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-sm font-medium text-white">{member.name}</h3>
                        <p className="text-xs text-slate-400">{member.role}</p>
                      </div>
                    </div>

                    <div className="mt-2 flex justify-between text-xs text-slate-400">
                      <span>Morale: {member.morale}%</span>
                      <span>Fatigue: {member.fatigue}%</span>
                    </div>

                    <div className="mt-2">
                      <Button
                        variant={member.assigned ? "destructive" : "secondary"}
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => assignTeamMember(member.id, !member.assigned)}
                      >
                        {member.assigned ? 'Unassign' : 'Assign to Incident'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scénarios */}
            <div className="p-4 border-t border-slate-700">
              <select
                value={scenarioId}
                onChange={(e) => changeScenario(e.target.value)}
                className="w-full p-2 bg-slate-700 text-white rounded-md border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="ransomware">Ransomware Attack</option>
                <option value="data-breach">Customer Data Breach</option>
                <option value="ddos">DDoS Attack</option>
                <option value="insider-threat">Insider Threat</option>
                <option value="supply-chain">Supply Chain Compromise</option>
              </select>

              <Button
                variant="outline"
                className="w-full mt-2 border-cyan-700 bg-slate-800 hover:bg-slate-700"
                onClick={restartGame}
              >
                Restart Scenario
              </Button>
            </div>
          </div>

          {/* Panneau principal */}
          <div className="flex-1 bg-gray-900 overflow-hidden flex flex-col">
            {/* Onglets */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="bg-slate-800 px-4 border-b border-slate-700">
                <TabsList className="bg-slate-700">
                  <TabsTrigger 
                    value="dashboard" 
                    className="data-[state=active]:bg-cyan-900 data-[state=active]:text-cyan-400"
                  >
                    <BarChart4 className="w-4 h-4 mr-2" />
                    Dashboard
                  </TabsTrigger>

                  <TabsTrigger 
                    value="events" 
                    className="data-[state=active]:bg-cyan-900 data-[state=active]:text-cyan-400"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Events
                    {unreadEvents > 0 && (
                      <Badge className="ml-2 bg-red-500">{unreadEvents}</Badge>
                    )}
                  </TabsTrigger>

                  <TabsTrigger 
                    value="communications" 
                    className="data-[state=active]:bg-cyan-900 data-[state=active]:text-cyan-400"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Communications
                    {unreadCommunications > 0 && (
                      <Badge className="ml-2 bg-red-500">{unreadCommunications}</Badge>
                    )}
                  </TabsTrigger>

                  <TabsTrigger 
                    value="team" 
                    className="data-[state=active]:bg-cyan-900 data-[state=active]:text-cyan-400"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Team
                  </TabsTrigger>

                  <TabsTrigger 
                    value="resources" 
                    className="data-[state=active]:bg-cyan-900 data-[state=active]:text-cyan-400"
                  >
                    <Cpu className="w-4 h-4 mr-2" />
                    Resources
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Contenu des onglets */}
              <div className="flex-1 overflow-auto p-4">
                {/* Dashboard */}
                <TabsContent value="dashboard" className="mt-0 h-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                    
<Card className="bg-slate-800 border-slate-700 text-white">
              <CardHeader>
                <CardTitle>Aperçu du Scénario</CardTitle>
                <CardDescription className="text-slate-400">Situation actuelle et objectifs</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">{gameState.scenarioDescription}</p>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Time elapsed:</span>
                            <span className="text-white">{Math.floor(gameState.currentTime / 60)}h {gameState.currentTime % 60}m</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Time remaining:</span>
                            <span className="text-white">{Math.floor(gameState.timeRemaining / 60)}h {gameState.timeRemaining % 60}m</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Team members assigned:</span>
                            <span className="text-white">{gameState.team.filter(t => t.assigned).length} / {gameState.team.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Resources purchased:</span>
                            <span className="text-white">{gameState.resources.reduce((sum, r) => sum + r.quantity, 0)}</span>
                          </div>
                        </div>

                        <div className="bg-slate-700 p-3 rounded-md">
                          <h3 className="text-cyan-400 font-semibold mb-2">Objectives</h3>
                          <ul className="space-y-2 text-slate-300">
                            <li className="flex items-start">
                              <Shield className="w-4 h-4 text-cyan-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>Reduce threat level to zero</span>
                            </li>
                            <li className="flex items-start">
                              <Clock className="w-4 h-4 text-cyan-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>Resolve the incident before time runs out</span>
                            </li>
                            <li className="flex items-start">
                              <Users className="w-4 h-4 text-cyan-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>Maintain organizational reputation</span>
                            </li>
                            <li className="flex items-start">
                              <Cpu className="w-4 h-4 text-cyan-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>Use resources efficiently</span>
                            </li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700 text-white">
                      <CardHeader>
                        <CardTitle>Activity Log</CardTitle>
                        <CardDescription className="text-slate-400">Recent events and actions</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[calc(100%-88px)] overflow-auto">
                        <ScrollArea className="h-full pr-4">
                          <div className="space-y-3">
                            {gameState.logs.slice().reverse().map(log => (
                              <div key={log.id} className="border-l-2 border-slate-600 pl-3 py-1">
                                <div className="flex justify-between items-start">
                                  <span className="text-sm font-medium text-white">{log.text}</span>
                                  <span className="text-xs text-slate-400">{log.timeStamp}</span>
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  {log.category === 'system' && 'System Alert'}
                                  {log.category === 'action' && 'User Action'}
                                  {log.category === 'decision' && 'Decision'}
                                  {log.category === 'resource' && 'Resource Management'}
                                  {log.category === 'communication' && 'Communication'}
                                  {log.category === 'team' && 'Team Management'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Events */}
                <TabsContent value="events" className="mt-0">
                  <h2 className="text-xl font-semibold text-white mb-4">Security Events</h2>

                  {gameState.events.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <AlertCircle className="w-10 h-10 mx-auto mb-2 text-slate-500" />
                      <p>No security events detected yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {gameState.events.map(event => (
                        <Card 
                          key={event.id} 
                          className={`bg-slate-800 border-slate-700 ${!event.read ? 'border-l-4 border-l-yellow-500' : ''}`}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2 ${getSeverityColor(event.severity)}`}></div>
                                <CardTitle className="text-white text-lg">{event.title}</CardTitle>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {event.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <CardDescription className="text-slate-400">{event.timeStamp}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-slate-300">{event.description}</p>
                          </CardContent>
                          <CardFooter>
                            {!event.read && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="ml-auto border-slate-600 hover:bg-slate-700"
                                onClick={() => markEventAsRead(event.id)}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Mark as Read
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Communications */}
                <TabsContent value="communications" className="mt-0">
                  <h2 className="text-xl font-semibold text-white mb-4">Stakeholder Communications</h2>

                  {gameState.communications.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-500" />
                      <p>No communications received yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {gameState.communications.map(comm => (
                        <Card 
                          key={comm.id} 
                          className={`bg-slate-800 border-slate-700 ${!comm.read ? 'border-l-4 border-l-blue-500' : ''}`}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-white text-lg">{comm.subject}</CardTitle>
                              {comm.replied && (
                                <Badge className="bg-green-600">Replied</Badge>
                              )}
                            </div>
                            <CardDescription className="text-slate-400">
                              From: {comm.sender} | To: {comm.recipient} | {comm.timeStamp}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-slate-300 whitespace-pre-line">{comm.content}</p>

                            {comm.options && !comm.replied && (
                              <div className="mt-4 bg-slate-700 p-3 rounded-md">
                                <h3 className="text-white font-medium mb-2">Response Options:</h3>
                                <div className="space-y-2">
                                  {comm.options.map(option => (
                                    <Button
                                      key={option.id}
                                      variant="outline"
                                      className="w-full justify-start text-left border-slate-600 hover:bg-slate-600"
                                      onClick={() => respondToCommunication(comm.id, option.id)}
                                    >
                                      <ChevronRight className="w-4 h-4 mr-2 flex-shrink-0" />
                                      <span>{option.text}</span>
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter>
                            {!comm.read && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="ml-auto border-slate-600 hover:bg-slate-700"
                                onClick={() => markCommunicationAsRead(comm.id)}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Mark as Read
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Team */}
                <TabsContent value="team" className="mt-0">
                  <h2 className="text-xl font-semibold text-white mb-4">Security Team Management</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gameState.team.map(member => (
                      <Card key={member.id} className="bg-slate-800 border-slate-700">
                        <CardHeader>
                          <div className="flex items-center">
                            <Avatar className="h-12 w-12 mr-4">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-white">{member.name}</CardTitle>
                              <CardDescription className="text-slate-400">{member.role}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4">
                            <h3 className="text-sm font-medium text-white mb-2">Areas of Expertise</h3>
                            <div className="flex flex-wrap gap-2">
                              {member.expertise.map((skill, i) => (
                                <Badge key={i} variant="secondary" className="bg-slate-700">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-slate-300">Morale</span>
                                <span className="text-sm font-medium text-white">{member.morale}%</span>
                              </div>
                              <Progress 
                                value={member.morale} 
                                className="h-2 bg-green-500" 
                              />
                            </div>

                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-slate-300">Fatigue</span>
                                <span className="text-sm font-medium text-white">{member.fatigue}%</span>
                              </div>
                              <Progress 
                                value={member.fatigue} 
                                className="h-2 bg-red-500" 
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant={member.assigned ? "destructive" : "default"}
                            className="w-full"
                            onClick={() => assignTeamMember(member.id, !member.assigned)}
                          >
                            {member.assigned ? 'Remove from Incident' : 'Assign to Incident'}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Resources */}
                <TabsContent value="resources" className="mt-0">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">Resource Management</h2>
                    <div className="bg-slate-800 px-3 py-1 rounded-md border border-slate-700">
                      <span className="text-sm text-slate-400 mr-2">Available Budget:</span>
                      <span className="text-lg font-medium text-white">${gameState.budget.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gameState.resources.map(resource => (
                      <Card key={resource.id} className="bg-slate-800 border-slate-700">
                        <CardHeader>
                          <CardTitle className="text-white">{resource.name}</CardTitle>
                          <CardDescription className="text-slate-400">
                            {resource.type === 'human' && 'Human Resource'}
                            {resource.type === 'technical' && 'Technical Resource'}
                            {resource.type === 'financial' && 'Financial Resource'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-300 mb-4">{resource.description}</p>

                          <div className="flex justify-between items-center bg-slate-700 p-2 rounded-md">
                            <div>
                              <p className="text-xs text-slate-400">Cost</p>
                              <p className="text-sm font-medium text-white">${resource.cost.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400">Owned</p>
                              <p className="text-sm font-medium text-white text-center">{resource.quantity}</p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant="default"
                            className="w-full"
                            disabled={gameState.budget < resource.cost}
                            onClick={() => purchaseResource(resource.id)}
                          >
                            Purchase
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Dialogue de décision */}
        <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
          <DialogContent className="bg-slate-800 text-white border-slate-700 w-11/12 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl text-cyan-400">
                {currentDecision?.title || 'Decision Required'}
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                {currentDecision?.description || 'Make your choice carefully as it will impact the outcome of the incident.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4">
              {currentDecision?.options.map(option => (
                <Button
                  key={option.id}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 border-slate-600 hover:bg-slate-700"
                  onClick={() => currentDecision && handleDecision(currentDecision, option.id)}
                >
                  <div>
                    <p className="font-medium text-white mb-2">{option.text}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      {option.consequences.threatDelta !== 0 && (
                        <span className={option.consequences.threatDelta < 0 ? 'text-green-400' : 'text-red-400'}>
                          Threat: {option.consequences.threatDelta > 0 ? '+' : ''}{option.consequences.threatDelta}%
                        </span>
                      )}
                      {option.consequences.reputationDelta !== 0 && (
                        <span className={option.consequences.reputationDelta > 0 ? 'text-green-400' : 'text-red-400'}>
                          Reputation: {option.consequences.reputationDelta > 0 ? '+' : ''}{option.consequences.reputationDelta}%
                        </span>
                      )}
                      {option.consequences.budgetDelta !== 0 && (
                        <span className={option.consequences.budgetDelta > 0 ? 'text-green-400' : 'text-red-400'}>
                          Budget: {option.consequences.budgetDelta > 0 ? '+' : ''}${option.consequences.budgetDelta.toLocaleString()}
                        </span>
                      )}
                      {option.consequences.timeDelta !== 0 && (
                        <span className={option.consequences.timeDelta > 0 ? 'text-green-400' : 'text-red-400'}>
                          Time: {option.consequences.timeDelta > 0 ? '+' : ''}{option.consequences.timeDelta}m
                        </span>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialogue de fin de jeu */}
        <Dialog open={gameOverDialog} onOpenChange={setGameOverDialog}>
          <DialogContent className="bg-slate-800 text-white border-slate-700 w-11/12 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">
                {gameState.gameWon ? (
                  <span className="text-green-400">Incident Resolved Successfully</span>
                ) : (
                  <span className="text-red-400">Mission Failed</span>
                )}
              </DialogTitle>
              <DialogDescription className="text-center text-slate-300">
                {gameState.gameWon 
                  ? 'Congratulations! You have successfully managed the security incident.'
                  : `The incident could not be contained: ${gameState.gameOverReason}`
                }
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="bg-slate-700 p-4 rounded-md mb-4">
                <h3 className="font-medium text-white mb-2">Performance Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Time elapsed:</span>
                    <span className="text-white">{Math.floor(gameState.currentTime / 60)}h {gameState.currentTime % 60}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Final threat level:</span>
                    <span className="text-white">{gameState.threatLevel}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Ending reputation:</span>
                    <span className="text-white">{gameState.reputation}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Budget remaining:</span>
                    <span className="text-white">${gameState.budget.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1 border-slate-600 hover:bg-slate-700"
                onClick={() => setLocation('/cyber/crisis-center')}
              >
                Return to Scenarios
              </Button>
              <Button
                className="flex-1"
                onClick={restartGame}
              >
                Restart Scenario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </HomeLayout>
  );
}