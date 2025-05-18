import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Bot,
  Zap,
  BarChart,
  Target,
  Brain,
  MessageSquare,
  TimerOff,
  Hourglass,
  BrainCircuit,
  FileText,
  Settings,
  Shield,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsItem, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

// Définir les types pour le module
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'client';
  timestamp: Date;
}

interface ClientProfile {
  id: string;
  type: 'pressé' | 'hostile' | 'indécis' | 'technique' | 'débutant';
  personality: string;
  context: string;
  initialMessage: string;
}

interface SimulationSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  messages: Message[];
  clientProfile: ClientProfile;
  timeLimit: number; // en secondes
  responseTimeLimit: number; // en secondes
  completed: boolean;
  score?: {
    reactivité: number;
    clarté: number;
    impact: number;
    conclusion: number;
    total: number;
  };
  feedback?: string;
}

// Composant principal
export default function ProspectPulse() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // États de l'application
  const [activeSession, setActiveSession] = useState<SimulationSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [globalTimeLeft, setGlobalTimeLeft] = useState(0);
  const [responseTimeLeft, setResponseTimeLeft] = useState(0);
  const [isSurpriseMode, setIsSurpriseMode] = useState(false);
  const [surpriseCountdown, setSurpriseCountdown] = useState<number | null>(null);
  const [showSurpriseAlert, setShowSurpriseAlert] = useState(false);
  const [sessionResults, setSessionResults] = useState<SimulationSession | null>(null);
  const [historySessions, setHistorySessions] = useState<SimulationSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingResponse, setIsFetchingResponse] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [clientTypes] = useState<ClientProfile[]>([
    {
      id: 'pressed',
      type: 'pressé',
      personality: 'Impatient, direct, regarde souvent sa montre',
      context: 'A un besoin urgent à résoudre, peu de temps disponible',
      initialMessage: 'J\'ai une problématique urgente à te poser. Tu peux m\'aider ou pas ?'
    },
    {
      id: 'hostile',
      type: 'hostile',
      personality: 'Méfiant, critique, teste constamment vos réponses',
      context: 'A eu de mauvaises expériences avec des prestataires',
      initialMessage: 'On m\'a recommandé votre cabinet, mais franchement j\'ai des doutes.'
    },
    {
      id: 'indecis',
      type: 'indécis',
      personality: 'Hésitant, pose beaucoup de questions, change régulièrement d\'avis',
      context: 'N\'arrive pas à déterminer clairement ses besoins',
      initialMessage: 'Je ne sais pas trop si c\'est ce qu\'il nous faut, mais voilà notre situation...'
    },
    {
      id: 'technique',
      type: 'technique',
      personality: 'Précis, utilise un vocabulaire technique, attend des réponses expertes',
      context: 'Connaît bien son domaine et veut vérifier votre expertise',
      initialMessage: 'Bonjour, j\'aimerais discuter d\'une problématique d\'architecture SI qui nous pose problème.'
    },
    {
      id: 'debutant',
      type: 'débutant',
      personality: 'Peu familier avec le conseil, utilise un vocabulaire simple',
      context: 'Premier contact avec un cabinet de conseil',
      initialMessage: 'Bonjour, c\'est la première fois que je fais appel à un consultant...'
    }
  ]);
  
  // Paramètres de la simulation
  const [settings, setSettings] = useState({
    globalTimeLimit: 5 * 60, // 5 minutes en secondes
    responseTimeLimit: 20, // 20 secondes
    surpriseFrequency: [10, 30], // entre 10 et 30 minutes
    selectedClientType: 'random'
  });
  
  // Effets pour gérer les timers
  useEffect(() => {
    // Gestion du timer global
    let globalTimer: NodeJS.Timeout;
    
    if (activeSession && globalTimeLeft > 0) {
      globalTimer = setInterval(() => {
        setGlobalTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(globalTimer);
            endSessionWithTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (globalTimer) clearInterval(globalTimer);
    };
  }, [activeSession, globalTimeLeft]);
  
  useEffect(() => {
    // Gestion du timer de réponse
    let responseTimer: NodeJS.Timeout;
    
    if (activeSession && responseTimeLeft > 0) {
      responseTimer = setInterval(() => {
        setResponseTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(responseTimer);
            handleTimeoutForResponse();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (responseTimer) clearInterval(responseTimer);
    };
  }, [activeSession, responseTimeLeft]);
  
  useEffect(() => {
    // Gestion du mode surprise
    let surpriseTimer: NodeJS.Timeout;
    
    if (isSurpriseMode && !activeSession && !showSurpriseAlert) {
      const randomMinutes = Math.floor(
        Math.random() * (settings.surpriseFrequency[1] - settings.surpriseFrequency[0] + 1) + 
        settings.surpriseFrequency[0]
      );
      const randomMilliseconds = randomMinutes * 60 * 1000;
      
      surpriseTimer = setTimeout(() => {
        triggerSurpriseSession();
      }, randomMilliseconds);
      
      console.log(`Mode surprise activé. Prochaine session dans ~${randomMinutes} minutes`);
    }
    
    return () => {
      if (surpriseTimer) clearTimeout(surpriseTimer);
    };
  }, [isSurpriseMode, activeSession, showSurpriseAlert]);
  
  // Effet pour faire défiler vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Fonction pour déclencher une session surprise
  const triggerSurpriseSession = () => {
    setShowSurpriseAlert(true);
    setSurpriseCountdown(10); // 10 secondes pour répondre
    
    // Timer pour le compte à rebours
    const countdownTimer = setInterval(() => {
      setSurpriseCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownTimer);
          setShowSurpriseAlert(false);
          // L'utilisateur n'a pas répondu à temps
          toast({
            title: "Session manquée!",
            description: "Vous n'avez pas répondu à temps à la demande du client.",
            variant: "destructive",
          });
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Fonction pour répondre à l'alerte surprise
  const handleSurpriseResponse = (accept: boolean) => {
    setShowSurpriseAlert(false);
    setSurpriseCountdown(null);
    
    if (accept) {
      startNewSession();
    } else {
      toast({
        title: "Session déclinée",
        description: "Vous avez décliné la demande du client. Une autre opportunité se présentera plus tard.",
        variant: "default",
      });
    }
  };
  
  // Fonction pour démarrer une nouvelle session
  const startNewSession = async () => {
    setIsLoading(true);
    
    try {
      // Choisir aléatoirement un type de client ou utiliser celui sélectionné
      let selectedClient: ClientProfile;
      
      if (settings.selectedClientType === 'random') {
        const randomIndex = Math.floor(Math.random() * clientTypes.length);
        selectedClient = clientTypes[randomIndex];
      } else {
        selectedClient = clientTypes.find(c => c.id === settings.selectedClientType) || clientTypes[0];
      }
      
      // Créer une nouvelle session
      const newSession: SimulationSession = {
        id: `session-${Date.now()}`,
        startTime: new Date(),
        messages: [],
        clientProfile: selectedClient,
        timeLimit: settings.globalTimeLimit,
        responseTimeLimit: settings.responseTimeLimit,
        completed: false
      };
      
      // Initialiser les timers
      setGlobalTimeLeft(settings.globalTimeLimit);
      setResponseTimeLeft(settings.responseTimeLimit);
      
      // Générer le premier message du client via l'API
      const initialClientMessage = await generateClientMessage(selectedClient, [], true);
      
      // Ajouter le message initial
      const initialMessage: Message = {
        id: `msg-${Date.now()}`,
        content: initialClientMessage || selectedClient.initialMessage,
        sender: 'client',
        timestamp: new Date()
      };
      
      // Mettre à jour l'état
      newSession.messages = [initialMessage];
      setActiveSession(newSession);
      setMessages([initialMessage]);
      setIsLoading(false);
      
      // Focus sur le champ de saisie
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
      
    } catch (error) {
      console.error("Erreur lors du démarrage de la session:", error);
      setIsLoading(false);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la session. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };
  
  // Fonction pour envoyer un message
  const sendMessage = async () => {
    if (!inputMessage.trim() || !activeSession) return;
    
    // Créer le message de l'utilisateur
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    // Mettre à jour les messages
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    
    // Réinitialiser le timer de réponse
    setResponseTimeLeft(0);
    
    // Simuler la réponse du client
    setIsTyping(true);
    setIsFetchingResponse(true);
    
    try {
      // Générer la réponse du client via l'API
      const clientResponse = await generateClientMessage(
        activeSession.clientProfile,
        updatedMessages
      );
      
      // Ajouter la réponse du client
      if (clientResponse) {
        const clientMessage: Message = {
          id: `msg-${Date.now()}`,
          content: clientResponse,
          sender: 'client',
          timestamp: new Date()
        };
        
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [...prev, clientMessage]);
          
          // Réinitialiser le timer de réponse
          setResponseTimeLeft(settings.responseTimeLimit);
          setIsFetchingResponse(false);
        }, 1000 + Math.random() * 2000); // Délai aléatoire pour simuler la frappe
      } else {
        setIsTyping(false);
        setIsFetchingResponse(false);
        setResponseTimeLeft(settings.responseTimeLimit);
      }
    } catch (error) {
      console.error("Erreur lors de la génération de la réponse:", error);
      setIsTyping(false);
      setIsFetchingResponse(false);
      setResponseTimeLeft(settings.responseTimeLimit);
      
      toast({
        title: "Erreur",
        description: "Impossible de générer la réponse du client. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };
  
  // Fonction pour générer la réponse du client via Azure OpenAI
  const generateClientMessage = async (
    clientProfile: ClientProfile,
    currentMessages: Message[],
    isInitial: boolean = false
  ): Promise<string> => {
    try {
      const formattedMessages = currentMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      const systemPrompt = `Tu es un client qui contacte un Senior Manager de cabinet de conseil. 
Tu as le profil suivant :
- Type: ${clientProfile.type}
- Personnalité: ${clientProfile.personality}
- Contexte: ${clientProfile.context}

${isInitial 
  ? "Commence la conversation en demandant de l'aide pour une problématique. Sois bref (max 2 phrases)." 
  : "Continue la conversation en fonction des réponses du consultant. Ne donne pas trop d'informations d'un coup, sois réaliste."
}

Ton objectif est de tester sa réactivité, sa capacité à poser les bonnes questions et à convaincre.
Si le consultant fait une proposition pertinente qui correspond à tes besoins, montre de l'intérêt.
Si ses réponses sont vagues ou inappropriées, montre ton insatisfaction.
`;
      
      const payload = {
        messages: [
          { role: 'system', content: systemPrompt },
          ...formattedMessages
        ],
        clientProfile: clientProfile,
        isInitial: isInitial
      };
      
      const response = await fetch('/api/prospect-pulse/generate-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec le serveur');
      }
      
      const data = await response.json();
      return data.message;
      
    } catch (error) {
      console.error("Erreur lors de la génération du message:", error);
      
      // Message de secours en cas d'erreur
      if (isInitial) {
        return clientProfile.initialMessage;
      } else {
        return "Pardonnez-moi, mais je dois prendre un autre appel. Je vous recontacterai plus tard.";
      }
    }
  };
  
  // Fonction pour terminer la session en cas de timeout
  const endSessionWithTimeout = () => {
    if (!activeSession) return;
    
    toast({
      title: "Temps écoulé !",
      description: "Le temps imparti pour cette session est terminé.",
      variant: "destructive",
    });
    
    completeSession(true);
  };
  
  // Fonction pour gérer le timeout de réponse
  const handleTimeoutForResponse = () => {
    if (!activeSession) return;
    
    toast({
      title: "Attention !",
      description: "Vous avez mis trop de temps à répondre. Le client s'impatiente.",
      variant: "warning",
    });
    
    // Ajouter un message d'impatience du client
    const timeoutMessage: Message = {
      id: `msg-${Date.now()}`,
      content: "Vous mettez beaucoup de temps à répondre... J'ai d'autres rendez-vous, je ne peux pas attendre indéfiniment.",
      sender: 'client',
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, timeoutMessage]);
    setResponseTimeLeft(settings.responseTimeLimit);
  };
  
  // Fonction pour terminer volontairement la session
  const endSessionManually = () => {
    if (!activeSession) return;
    
    completeSession(false);
  };
  
  // Fonction commune pour compléter la session et générer l'évaluation
  const completeSession = async (isTimeout: boolean) => {
    if (!activeSession) return;
    
    setIsLoading(true);
    
    try {
      // Préparer les données de la session
      const sessionToComplete = {
        ...activeSession,
        messages: messages,
        endTime: new Date(),
        completed: true
      };
      
      // Générer l'évaluation via l'API
      const evaluationResponse = await fetch('/api/prospect-pulse/evaluate-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session: sessionToComplete,
          isTimeout: isTimeout
        }),
      });
      
      if (!evaluationResponse.ok) {
        throw new Error('Erreur lors de l\'évaluation de la session');
      }
      
      const evaluationData = await evaluationResponse.json();
      
      // Mettre à jour la session avec les résultats
      const completedSession: SimulationSession = {
        ...sessionToComplete,
        score: evaluationData.score,
        feedback: evaluationData.feedback
      };
      
      // Mettre à jour l'historique
      setHistorySessions((prev) => [completedSession, ...prev]);
      
      // Afficher les résultats
      setSessionResults(completedSession);
      setActiveSession(null);
      
    } catch (error) {
      console.error("Erreur lors de la complétion de la session:", error);
      
      // En cas d'erreur, créer une évaluation par défaut
      const defaultScore = {
        reactivité: Math.floor(Math.random() * 40) + 50, // 50-90
        clarté: Math.floor(Math.random() * 40) + 50,
        impact: Math.floor(Math.random() * 40) + 50,
        conclusion: Math.floor(Math.random() * 40) + 50,
        total: Math.floor(Math.random() * 30) + 60 // 60-90
      };
      
      const defaultFeedback = isTimeout
        ? "Session interrompue par manque de temps. Essayez d'être plus concis dans vos réponses."
        : "Vous avez fait preuve d'engagement, mais certaines réponses pourraient être améliorées.";
      
      const completedSession: SimulationSession = {
        ...activeSession,
        messages: messages,
        endTime: new Date(),
        completed: true,
        score: defaultScore,
        feedback: defaultFeedback
      };
      
      // Mettre à jour l'historique
      setHistorySessions((prev) => [completedSession, ...prev]);
      
      // Afficher les résultats
      setSessionResults(completedSession);
      setActiveSession(null);
      
      toast({
        title: "Erreur lors de l'évaluation",
        description: "Nous avons rencontré un problème lors de l'évaluation. Une évaluation provisoire a été générée.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Convertir les secondes en format MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Rendu conditionnel pour l'alerte de surprise
  const renderSurpriseAlert = () => {
    if (!showSurpriseAlert) return null;
    
    return (
      <Dialog open={showSurpriseAlert} onOpenChange={setShowSurpriseAlert}>
        <DialogContent className="bg-gradient-to-br from-amber-900 to-red-950 border-amber-500 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              Demande client entrante !
            </DialogTitle>
            <DialogDescription className="text-amber-200">
              Un prospect souhaite vous parler immédiatement.
              Vous avez {surpriseCountdown} secondes pour répondre.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Progress value={(surpriseCountdown || 0) * 10} max={100} className="h-2 bg-amber-900" />
          </div>
          
          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              className="border-amber-600 text-amber-200 hover:bg-amber-950"
              onClick={() => handleSurpriseResponse(false)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Décliner
            </Button>
            <Button
              className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white"
              onClick={() => handleSurpriseResponse(true)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Répondre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Rendu des résultats de la session
  const renderSessionResults = () => {
    if (!sessionResults) return null;
    
    const { score, feedback } = sessionResults;
    
    return (
      <Dialog open={!!sessionResults} onOpenChange={(open) => !open && setSessionResults(null)}>
        <DialogContent className="bg-gradient-to-b from-blue-900 to-blue-950 border-blue-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <BarChart className="h-5 w-5 text-blue-400" />
              Évaluation de la session
            </DialogTitle>
            <DialogDescription className="text-blue-200">
              Analyse de votre performance lors de cet entretien client
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Scores */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-2">Compétences évaluées</h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-blue-200">Réactivité</span>
                    <span className="text-white font-medium">{score?.reactivité || 0}/100</span>
                  </div>
                  <Progress value={score?.reactivité || 0} max={100} className="h-2 bg-blue-900" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-blue-200">Clarté des explications</span>
                    <span className="text-white font-medium">{score?.clarté || 0}/100</span>
                  </div>
                  <Progress value={score?.clarté || 0} max={100} className="h-2 bg-blue-900" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-blue-200">Impact commercial</span>
                    <span className="text-white font-medium">{score?.impact || 0}/100</span>
                  </div>
                  <Progress value={score?.impact || 0} max={100} className="h-2 bg-blue-900" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-blue-200">Capacité à conclure</span>
                    <span className="text-white font-medium">{score?.conclusion || 0}/100</span>
                  </div>
                  <Progress value={score?.conclusion || 0} max={100} className="h-2 bg-blue-900" />
                </div>
                
                <div className="pt-2 border-t border-blue-800">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white font-semibold">Score global</span>
                    <span className="text-white font-bold">{score?.total || 0}/100</span>
                  </div>
                  <Progress 
                    value={score?.total || 0} 
                    max={100} 
                    className="h-3 bg-blue-900" 
                    indicatorClassName={`${
                      (score?.total || 0) < 50 ? 'bg-red-500' :
                      (score?.total || 0) < 70 ? 'bg-amber-500' :
                      (score?.total || 0) < 85 ? 'bg-green-500' :
                      'bg-emerald-400'
                    }`}
                  />
                </div>
              </div>
            </div>
            
            {/* Feedback */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Feedback personnalisé</h3>
              <div className="bg-blue-950 border border-blue-800 rounded-md p-4 text-blue-100">
                <p className="whitespace-pre-line">{feedback}</p>
              </div>
              
              <div className="mt-4">
                <h4 className="text-md font-semibold text-white mb-2">Profil client</h4>
                <div className="flex items-center gap-2 text-sm text-blue-200">
                  <Badge className="bg-blue-700">{sessionResults.clientProfile.type}</Badge>
                  <span>{sessionResults.clientProfile.personality}</span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              onClick={() => setSessionResults(null)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Rendu de la fenêtre de paramètres
  const renderSettingsDialog = () => {
    return (
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-400" />
              Paramètres de simulation
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Personnalisez les paramètres du simulateur ProspectPulse
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Durée totale de session</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min={60} 
                  max={600} 
                  step={30}
                  value={settings.globalTimeLimit}
                  onChange={(e) => setSettings({...settings, globalTimeLimit: parseInt(e.target.value)})}
                  className="flex-1"
                />
                <span className="text-slate-300 w-16 text-right">{Math.floor(settings.globalTimeLimit / 60)} min</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Temps de réponse maximal</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min={10} 
                  max={60} 
                  step={5}
                  value={settings.responseTimeLimit}
                  onChange={(e) => setSettings({...settings, responseTimeLimit: parseInt(e.target.value)})}
                  className="flex-1"
                />
                <span className="text-slate-300 w-16 text-right">{settings.responseTimeLimit} sec</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Type de client</label>
              <select
                value={settings.selectedClientType}
                onChange={(e) => setSettings({...settings, selectedClientType: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-slate-200"
              >
                <option value="random">Aléatoire</option>
                {clientTypes.map(client => (
                  <option key={client.id} value={client.id}>{client.type}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Fréquence des surprises</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min={5} 
                  max={60} 
                  step={5}
                  value={settings.surpriseFrequency[0]}
                  onChange={(e) => setSettings({
                    ...settings, 
                    surpriseFrequency: [parseInt(e.target.value), settings.surpriseFrequency[1]]
                  })}
                  className="flex-1"
                />
                <span className="text-slate-300 w-48 text-right">{settings.surpriseFrequency[0]}-{settings.surpriseFrequency[1]} min</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
              onClick={() => setShowSettings(false)}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Rendu principal de l'interface de la session active
  const renderActiveSession = () => {
    if (!activeSession) return null;
    
    return (
      <div className="bg-gradient-to-br from-blue-950 to-blue-900 rounded-lg border border-blue-800/70 shadow-xl overflow-hidden">
        {/* En-tête de la session */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-950 border-b border-blue-800/80 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-800/50 p-2 rounded-full">
                <Brain className="h-5 w-5 text-blue-200" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Session en cours</h3>
                <p className="text-sm text-blue-300">Client: <Badge className="bg-blue-700 hover:bg-blue-600">{activeSession.clientProfile.type}</Badge></p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-200">
                    {formatTime(globalTimeLeft)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Timer className={`h-3 w-3 ${responseTimeLeft < 5 ? 'text-red-400' : 'text-blue-400'}`} />
                  <span className={`text-xs ${responseTimeLeft < 5 ? 'text-red-300 font-medium' : 'text-blue-300'}`}>
                    {formatTime(responseTimeLeft)}
                  </span>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="border-red-800 text-red-400 hover:bg-red-950/50 hover:text-red-300"
                onClick={endSessionManually}
              >
                <TimerOff className="h-4 w-4 mr-1" />
                Terminer
              </Button>
            </div>
          </div>
        </div>
        
        {/* Fenêtre de conversation */}
        <div className="h-[50vh] md:h-[60vh] overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] md:max-w-[70%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-800 text-gray-100'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    <div className="flex items-center">
                      {message.sender === 'user' ? (
                        <>
                          <span className="text-xs font-medium text-blue-200">Vous</span>
                          <User className="h-3 w-3 ml-1 text-blue-300" />
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-medium text-slate-300">Client</span>
                          <MessageSquare className="h-3 w-3 ml-1 text-slate-400" />
                        </>
                      )}
                    </div>
                    <span className="text-xs ml-2 text-opacity-70 text-slate-300">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] md:max-w-[70%] p-3 rounded-lg bg-slate-800 text-gray-100">
                  <div className="flex items-center mb-1">
                    <span className="text-xs font-medium text-slate-300">Client</span>
                    <MessageSquare className="h-3 w-3 ml-1 text-slate-400" />
                    <span className="text-xs ml-2 text-slate-400">écrit...</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Zone de saisie */}
        <div className="p-4 bg-gradient-to-r from-blue-950 to-blue-900 border-t border-blue-800/60">
          <div className="flex items-end gap-2">
            <Textarea
              ref={messageInputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tapez votre réponse..."
              className="flex-1 bg-blue-950 border-blue-800/60 text-white"
              rows={2}
              disabled={isTyping || isFetchingResponse}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              onClick={sendMessage}
              disabled={isTyping || isFetchingResponse || !inputMessage.trim()}
            >
              {isFetchingResponse ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-5 w-5 mr-1" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-blue-400">
            <p>Conseil: Soyez concis et précis. Posez des questions pour mieux comprendre les besoins du client.</p>
          </div>
        </div>
      </div>
    );
  };
  
  // Rendu principal de la page
  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-950 to-gray-900 pt-16 pb-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/amoa/coach-entretien">
                <Button variant="outline" className="bg-blue-900/30 text-white border-blue-800/50 hover:bg-blue-800/40">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
              </Link>
              <div>
                <PageTitle title="PROSPECTPULSE" subtitle="Simulateur de prospection sous pression" />
                <div className="flex gap-2 mt-1">
                  <Badge className="bg-amber-700">Temps réel</Badge>
                  <Badge className="bg-amber-700">Challenge</Badge>
                  <Badge className="bg-amber-700">IA avancée</Badge>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="border-blue-800/50 text-white hover:bg-blue-800/40"
                      onClick={() => setShowSettings(true)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-blue-950 text-white border-blue-800">
                    <p>Paramètres du simulateur</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`border-amber-600/70 hover:bg-amber-900/30 ${
                        isSurpriseMode ? 'bg-amber-900/30 text-amber-300' : 'text-white'
                      }`}
                      onClick={() => setIsSurpriseMode(!isSurpriseMode)}
                    >
                      <Zap className={`mr-2 h-4 w-4 ${isSurpriseMode ? 'text-amber-400' : ''}`} />
                      {isSurpriseMode ? 'Mode Surprise Actif' : 'Activer le Mode Surprise'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-amber-950 text-white border-amber-800">
                    <p>Reçois des demandes clients aléatoires pendant ta navigation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Zone principale */}
          {activeSession ? (
            renderActiveSession()
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Démarrer une session */}
              <div className="lg:col-span-2">
                <Card className="bg-gradient-to-br from-blue-900/80 to-blue-950/90 border border-blue-800/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <BrainCircuit className="h-5 w-5 text-blue-400" />
                      Simulateur de prospection client
                    </CardTitle>
                    <CardDescription className="text-blue-300">
                      Exercez vos compétences de prospection dans des situations de stress réel
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-blue-200">
                        Dans ce simulateur, vous incarnez un Senior Manager en situation de prospection client.
                        Vous devrez réagir rapidement, identifier les besoins, gérer les objections et proposer des solutions.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-950/50 border border-blue-900/30 rounded-lg p-4">
                          <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                            <Timer className="h-4 w-4 text-blue-400" />
                            Contraintes temporelles
                          </h3>
                          <ul className="space-y-1 text-sm text-blue-200">
                            <li>• Sessions limitées à {Math.floor(settings.globalTimeLimit / 60)} minutes</li>
                            <li>• {settings.responseTimeLimit} secondes maximum par réponse</li>
                            <li>• L'inactivité entraîne l'impatience du client</li>
                          </ul>
                        </div>
                        
                        <div className="bg-blue-950/50 border border-blue-900/30 rounded-lg p-4">
                          <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-400" />
                            Profils clients variés
                          </h3>
                          <ul className="space-y-1 text-sm text-blue-200">
                            <li>• Client pressé et direct</li>
                            <li>• Client méfiant ou hostile</li>
                            <li>• Client indécis ou technique</li>
                            <li>• Scénarios générés dynamiquement</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex justify-center">
                        <Button 
                          className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white py-6 px-8 text-lg"
                          onClick={startNewSession}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          ) : (
                            <Zap className="mr-2 h-5 w-5" />
                          )}
                          Démarrer une simulation
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Statistiques et informations */}
              <div>
                <Card className="bg-gradient-to-br from-blue-900/80 to-blue-950/90 border border-blue-800/30 backdrop-blur-sm mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-400" />
                      Vos performances
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {historySessions.length > 0 ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-blue-300 mb-1">Score moyen</h4>
                          <div className="text-2xl font-bold text-white">
                            {Math.round(
                              historySessions.reduce((acc, session) => acc + (session.score?.total || 0), 0) / 
                              historySessions.length
                            )}
                            <span className="text-lg text-blue-400">/100</span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-blue-300 mb-1">Sessions complétées</h4>
                          <div className="text-2xl font-bold text-white">
                            {historySessions.length}
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t border-blue-800/50">
                          <h4 className="text-sm font-medium text-blue-300 mb-2">Dernières sessions</h4>
                          <div className="space-y-2">
                            {historySessions.slice(0, 3).map((session) => (
                              <div 
                                key={session.id} 
                                className="flex items-center justify-between bg-blue-950/50 rounded p-2 cursor-pointer hover:bg-blue-900/30"
                                onClick={() => setSessionResults(session)}
                              >
                                <div className="flex items-center">
                                  <Badge className="bg-blue-700 mr-2">{session.clientProfile.type}</Badge>
                                  <span className="text-xs text-blue-200">
                                    {new Date(session.startTime).toLocaleDateString()}
                                  </span>
                                </div>
                                <span className="font-medium">
                                  {session.score?.total || 0}
                                  <span className="text-blue-400 text-xs">/100</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-blue-300">
                        <FileText className="h-10 w-10 mx-auto mb-2 text-blue-500/50" />
                        <p>Aucune session complétée</p>
                        <p className="text-sm text-blue-400 mt-1">
                          Commencez une simulation pour voir vos performances
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-900/80 to-blue-950/90 border border-blue-800/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-400" />
                      Conseils de prospection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-blue-200">
                      <li className="flex items-start gap-2">
                        <div className="bg-blue-900/50 p-1 rounded mt-0.5">
                          <MessageSquare className="h-3 w-3 text-blue-400" />
                        </div>
                        <span>Posez des questions ouvertes pour identifier les besoins réels</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-blue-900/50 p-1 rounded mt-0.5">
                          <MessageSquare className="h-3 w-3 text-blue-400" />
                        </div>
                        <span>Soyez concis et allez droit au but, surtout avec les clients pressés</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-blue-900/50 p-1 rounded mt-0.5">
                          <MessageSquare className="h-3 w-3 text-blue-400" />
                        </div>
                        <span>Avec les clients méfiants, établissez la confiance avant de vendre</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-blue-900/50 p-1 rounded mt-0.5">
                          <MessageSquare className="h-3 w-3 text-blue-400" />
                        </div>
                        <span>Proposez toujours une prochaine étape concrète à la fin</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Dialogs et autres interfaces */}
      {renderSurpriseAlert()}
      {renderSessionResults()}
      {renderSettingsDialog()}
    </HomeLayout>
  );
}