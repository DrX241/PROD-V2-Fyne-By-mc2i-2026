import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  AlarmClock,
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Building,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  Lock,
  Users,
  Wallet,
  MessageSquare,
  Shield,
  Zap
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { useChatContext } from "@/contexts/ChatContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import "@/components/cyber/cyber-academie.css";

// Types pour le module CYBERCHAOS
interface Decision {
  id: string;
  title: string;
  description: string;
  impacts: {
    operational: number;
    financial: number;
    reputation: number;
    legal: number;
    stress: number;
  };
  duration: number; // en minutes
  risk: 'low' | 'medium' | 'high';
  icon: React.ReactNode;
}

interface CrisisEvent {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timepoint: number; // en minutes depuis le début
  decisions: Decision[];
  source: 'technical' | 'internal' | 'external' | 'management';
  icon: React.ReactNode;
}

interface GameState {
  currentTime: number; // minutes depuis le début de la crise
  operationalScore: number; // 0-100
  financialImpact: number; // coût en k€
  reputationScore: number; // 0-100
  legalRisk: number; // 0-100
  stressLevel: number; // 0-100
  events: CrisisEvent[];
  currentEvent: CrisisEvent | null;
  eventLog: Array<{
    time: number;
    event: string;
    decision?: string;
  }>;
  activePhase: 'detection' | 'containment' | 'eradication' | 'recovery' | 'lessons';
  gameOver: boolean;
  timeScale: number; // Multiplicateur de vitesse de jeu
}

// Style pour l'interface complète
const pageStyle = "min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white pb-10";

// Composant principal
const CyberChaos: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const chatContext = useChatContext();
  
  // Fonction pour naviguer
  const navigate = (path: string) => {
    setLocation(path);
  };
  
  // État initial du jeu
  const [gameState, setGameState] = useState<GameState>({
    currentTime: 0,
    operationalScore: 100,
    financialImpact: 0,
    reputationScore: 100,
    legalRisk: 0,
    stressLevel: 10,
    events: [],
    currentEvent: null,
    eventLog: [{
      time: 0,
      event: "Début de la crise - Détection d'une activité suspecte sur le réseau",
    }],
    activePhase: 'detection',
    gameOver: false,
    timeScale: 1,
  });
  
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  
  // Configurer les événements de crise pour le scénario
  useEffect(() => {
    if (isGameStarted && !gameState.events.length) {
      // Initialiser les événements du scénario
      setGameState(prevState => ({
        ...prevState,
        events: crisisEvents,
      }));
      
      // Message d'accueil
      toast({
        title: "Crise cyber détectée!",
        description: "Une activité suspecte a été signalée sur votre réseau. En tant que RSSI, vous devez gérer cette crise.",
        action: <ToastAction altText="Ok">Compris</ToastAction>,
      });
    }
  }, [isGameStarted, toast, gameState.events.length]);
  
  // Game timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isGameStarted && !isPaused && !gameState.gameOver) {
      timer = setInterval(() => {
        setGameState(prevState => {
          const newTime = prevState.currentTime + 1 * prevState.timeScale;
          
          // Vérifier si des événements doivent être déclenchés
          const triggerEvent = prevState.events.find(
            e => e.timepoint <= newTime && !prevState.eventLog.some(log => log.event === e.title)
          );
          
          if (triggerEvent) {
            toast({
              title: `${getEventIcon(triggerEvent.severity)} Nouvel événement: ${triggerEvent.title}`,
              description: triggerEvent.description,
              variant: getEventToastVariant(triggerEvent.severity),
            });
            
            return {
              ...prevState,
              currentTime: newTime,
              currentEvent: triggerEvent,
              eventLog: [...prevState.eventLog, {
                time: newTime,
                event: triggerEvent.title
              }]
            };
          }
          
          // Mise à jour du temps sans nouvel événement
          return {
            ...prevState,
            currentTime: newTime
          };
        });
      }, 1000); // Chaque seconde en temps réel = 1 minute en jeu
    }
    
    return () => clearInterval(timer);
  }, [isGameStarted, isPaused, gameState.gameOver, gameState.timeScale, toast]);
  
  // Fonction pour obtenir l'icône selon la sévérité
  const getEventIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };
  
  // Déterminer la variante Toast selon la sévérité
  const getEventToastVariant = (severity: string): "default" | "destructive" => {
    return severity === 'critical' || severity === 'high' ? "destructive" : "default";
  };
  
  // Gérer le choix d'une décision
  const handleDecisionSelect = (decision: Decision) => {
    if (!gameState.currentEvent) return;
    
    // Appliquer les impacts de la décision
    setGameState(prevState => {
      // Calculer les nouveaux scores
      let newOperational = Math.max(0, Math.min(100, prevState.operationalScore + decision.impacts.operational));
      let newFinancial = prevState.financialImpact + decision.impacts.financial;
      let newReputation = Math.max(0, Math.min(100, prevState.reputationScore + decision.impacts.reputation));
      let newLegal = Math.max(0, Math.min(100, prevState.legalRisk + decision.impacts.legal));
      let newStress = Math.max(0, Math.min(100, prevState.stressLevel + decision.impacts.stress));
      
      // Vérifier les conditions de fin de jeu
      const gameOver = newOperational <= 0 || newStress >= 100;
      
      // Déterminer la phase active en fonction du temps écoulé
      let newPhase = prevState.activePhase;
      if (prevState.currentTime >= 240) newPhase = 'recovery';
      else if (prevState.currentTime >= 120) newPhase = 'eradication';
      else if (prevState.currentTime >= 30) newPhase = 'containment';
      
      // Ajouter la décision au journal
      const newEventLog = [...prevState.eventLog, {
        time: prevState.currentTime,
        event: `Décision: ${decision.title}`,
        decision: decision.description
      }];
      
      // Message de feedback
      toast({
        title: `Décision appliquée: ${decision.title}`,
        description: `Impact principal: ${getMainImpactDescription(decision.impacts)}`,
      });
      
      return {
        ...prevState,
        operationalScore: newOperational,
        financialImpact: newFinancial,
        reputationScore: newReputation,
        legalRisk: newLegal,
        stressLevel: newStress,
        currentEvent: null, // Résoudre l'événement actuel
        eventLog: newEventLog,
        activePhase: newPhase,
        gameOver: gameOver
      };
    });
  };
  
  // Obtenir la description principale de l'impact
  const getMainImpactDescription = (impacts: Decision['impacts']) => {
    const impactEntries = Object.entries(impacts);
    const sortedImpacts = impactEntries.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    
    if (!sortedImpacts.length) return "";
    
    const [category, value] = sortedImpacts[0];
    const direction = value >= 0 ? "+" : "";
    
    switch (category) {
      case 'operational': return `Opérationnel ${direction}${value}%`;
      case 'financial': return `Financier ${value}k€`;
      case 'reputation': return `Réputation ${direction}${value}%`;
      case 'legal': return `Risque légal ${direction}${value}%`;
      case 'stress': return `Niveau de stress ${direction}${value}%`;
      default: return "";
    }
  };
  
  // Fonction pour redémarrer le jeu
  const restartGame = () => {
    setGameState({
      currentTime: 0,
      operationalScore: 100,
      financialImpact: 0,
      reputationScore: 100,
      legalRisk: 0,
      stressLevel: 10,
      events: [],
      currentEvent: null,
      eventLog: [{
        time: 0,
        event: "Début de la crise - Détection d'une activité suspecte sur le réseau",
      }],
      activePhase: 'detection',
      gameOver: false,
      timeScale: 1,
    });
    setIsGameStarted(false);
    setIsPaused(false);
    setFeedbackMode(false);
  };
  
  // Fonction pour terminer le jeu et afficher l'analyse
  const endGame = () => {
    setGameState(prev => ({ ...prev, gameOver: true }));
    setFeedbackMode(true);
    setIsPaused(true);
  };
  
  // Fonction pour demander une analyse IA de votre gestion de crise
  const requestAIAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisResult("Analyse en cours...");
    setIsAnalysisModalOpen(true);
    // Préparer le message pour l'analyse
    const analysisRequest = {
      userMessage: `Tu es un expert en gestion de crise cybersécurité qui va analyser les choix fait par un joueur dans une simulation de crise cyber.
      
      Voici l'état final de la simulation:
      - Durée totale de la crise: ${gameState.currentTime} minutes
      - Score opérationnel final: ${gameState.operationalScore}/100
      - Impact financier total: ${gameState.financialImpact}k€
      - Score de réputation: ${gameState.reputationScore}/100
      - Niveau de risque légal: ${gameState.legalRisk}/100
      - Niveau de stress interne: ${gameState.stressLevel}/100
      
      Historique des événements et décisions:
      ${gameState.eventLog.map(entry => `[T+${entry.time}min] ${entry.event}${entry.decision ? ` - ${entry.decision}` : ''}`).join('\n')}
      
      Analyse les choix du joueur et donne une évaluation détaillée de sa gestion de crise sous ces aspects:
      1. Réactivité et rapidité de décision
      2. Priorisation des actions (protection des actifs critiques)
      3. Communication et gestion des parties prenantes
      4. Équilibre entre continuité d'activité et sécurité
      5. Conformité légale et réglementaire
      
      Termine par une note globale sur 10 et des recommandations concrètes pour améliorer la gestion de crise cyber.`,
      model: "gpt-4o-mini",
      missionContext: {
        title: "CYBERCHAOS - Gestion de crise",
        companyName: "ACIA Technologies",
        secteurActivite: "Technologies de l'information",
        userRole: "RSSI",
        difficulty: "Intermédiaire"
      },
      previousMessages: []
    };
    
    // Appel direct à l'API
    fetch("/api/cyber-defense/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(analysisRequest),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Erreur réseau lors de la demande");
      }
      return response.json();
    })
    .then(data => {
      setIsAnalyzing(false);
      // Afficher le résultat dans un dialog plus élaboré avec le contenu formaté
      setAnalysisResult(data.response || data.message || "Analyse non disponible");
      setIsAnalysisModalOpen(true);
      
      // Notification toast
      toast({
        title: "Analyse de crise complétée",
        description: "Votre rapport d'analyse est prêt.",
        action: (
          <ToastAction altText="Voir" onClick={() => setIsAnalysisModalOpen(true)}>
            Voir l'analyse
          </ToastAction>
        ),
      });
    })
    .catch(error => {
      console.error('Erreur:', error);
      toast({
        title: "Erreur d'analyse",
        description: "Impossible d'obtenir l'analyse pour le moment.",
        variant: "destructive"
      });
    });
  };
  
  // Format du temps (minutes en format h:mm)
  const formatGameTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours ? hours + 'h' : ''}${mins.toString().padStart(2, '0')}`;
  };
  
  // Fonction de génération d'icône selon la phase
  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'detection': return <AlertCircle className="w-5 h-5 text-blue-200" />;
      case 'containment': return <Lock className="w-5 h-5 text-yellow-200" />;
      case 'eradication': return <Zap className="w-5 h-5 text-orange-200" />;
      case 'recovery': return <Shield className="w-5 h-5 text-green-200" />;
      case 'lessons': return <FileText className="w-5 h-5 text-purple-200" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };
  
  // Rendu de la page
  return (
    <div className={pageStyle}>
      {/* Header et navigation */}
      <header className="border-b border-white/10 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/mode-selection')}
                className="hover:bg-blue-800/50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <h1 className="text-2xl font-rajdhani tracking-wider text-white">
                CYBERCHAOS
              </h1>
              <Badge variant="outline" className="ml-2 border-blue-500 text-blue-200">
                {gameState.activePhase === 'detection' ? 'DÉTECTION' : 
                 gameState.activePhase === 'containment' ? 'CONFINEMENT' :
                 gameState.activePhase === 'eradication' ? 'ÉRADICATION' :
                 gameState.activePhase === 'recovery' ? 'REPRISE' : 'BILAN'
                }
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              {isGameStarted && !gameState.gameOver && (
                <>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-blue-200" />
                    <span className="text-sm font-mono">T+{formatGameTime(gameState.currentTime)}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsPaused(!isPaused)}
                      className="hover:bg-blue-800/50"
                    >
                      {isPaused ? 'Reprendre' : 'Pause'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={endGame}
                      className="hover:bg-blue-800/50 text-amber-300 border-amber-300/50"
                    >
                      Terminer
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-6">
        {!isGameStarted ? (
          /* Écran d'introduction */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-gray-900/80 border-blue-800">
              <CardHeader>
                <CardTitle className="text-3xl font-rajdhani tracking-wider text-white">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                    CYBERCHAOS
                    <Badge className="ml-2 bg-blue-700 text-white">SIMULATION CRISE</Badge>
                  </div>
                </CardTitle>
                <CardDescription className="text-lg text-blue-200">
                  Tiens ton SI debout. Jusqu'au bout.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-blue-950/50 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Scénario</h3>
                    <p className="mb-3">
                      Vous êtes le RSSI d'une organisation qui vient de subir une attaque informatique majeure.
                      Votre mission est de gérer cette crise cybernétique en prenant des décisions critiques
                      qui impacteront différents aspects de votre organisation.
                    </p>
                    <p>
                      Gérez le temps, les ressources et les communications pour minimiser l'impact 
                      de la crise tout en maintenant les activités critiques de l'entreprise.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-950/50 p-4 rounded-lg">
                      <h3 className="text-xl font-semibold mb-2">Objectifs</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Shield className="h-5 w-5 mr-2 shrink-0 text-blue-400" />
                          <span>Maintenir l'activité essentielle</span>
                        </li>
                        <li className="flex items-start">
                          <Zap className="h-5 w-5 mr-2 shrink-0 text-blue-400" />
                          <span>Activer les plans de secours appropriés</span>
                        </li>
                        <li className="flex items-start">
                          <Users className="h-5 w-5 mr-2 shrink-0 text-blue-400" />
                          <span>Gérer les pressions internes et externes</span>
                        </li>
                        <li className="flex items-start">
                          <BarChart3 className="h-5 w-5 mr-2 shrink-0 text-blue-400" />
                          <span>Limiter les impacts métier et juridiques</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-950/50 p-4 rounded-lg">
                      <h3 className="text-xl font-semibold mb-2">Mécaniques de jeu</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <AlarmClock className="h-5 w-5 mr-2 shrink-0 text-blue-400" />
                          <span>Compte à rebours en temps réel (1s = 1min en jeu)</span>
                        </li>
                        <li className="flex items-start">
                          <MessageSquare className="h-5 w-5 mr-2 shrink-0 text-blue-400" />
                          <span>Événements aléatoires nécessitant des décisions rapides</span>
                        </li>
                        <li className="flex items-start">
                          <ExternalLink className="h-5 w-5 mr-2 shrink-0 text-blue-400" />
                          <span>Gestion de multiples parties prenantes</span>
                        </li>
                        <li className="flex items-start">
                          <Lock className="h-5 w-5 mr-2 shrink-0 text-blue-400" />
                          <span>Choix entre protection et continuité d'activité</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button 
                  onClick={() => setIsGameStarted(true)}
                  className="w-full sm:w-auto bg-blue-700 hover:bg-blue-600"
                >
                  Démarrer la simulation
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/mode-selection')}
                  className="w-full sm:w-auto border-blue-700 text-blue-200 hover:bg-blue-900/50"
                >
                  Retour à l'accueil
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ) : gameState.gameOver || feedbackMode ? (
          /* Écran de bilan */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-gray-900/80 border-blue-800">
              <CardHeader>
                <CardTitle className="text-3xl font-rajdhani tracking-wider text-white flex items-center gap-3">
                  <FileText className="h-7 w-7 text-blue-400" />
                  Bilan de crise
                </CardTitle>
                <CardDescription className="text-lg text-blue-200">
                  Analyse de votre gestion de la crise cyber
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4 bg-blue-950/80">
                    <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                    <TabsTrigger value="events">Chronologie</TabsTrigger>
                    <TabsTrigger value="analysis">Analyse</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview">
                    <div className="space-y-5">
                      <div className="bg-blue-950/50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold mb-3">Résultats finaux</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm mb-1 text-blue-200">Activité opérationnelle</p>
                            <div className="flex items-center">
                              <Progress value={gameState.operationalScore} className="flex-1 mr-2" />
                              <span className="text-sm font-medium">{gameState.operationalScore}%</span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm mb-1 text-blue-200">Réputation</p>
                            <div className="flex items-center">
                              <Progress value={gameState.reputationScore} className="flex-1 mr-2" />
                              <span className="text-sm font-medium">{gameState.reputationScore}%</span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm mb-1 text-blue-200">Risque légal</p>
                            <div className="flex items-center">
                              <Progress value={gameState.legalRisk} className="flex-1 mr-2" />
                              <span className="text-sm font-medium">{gameState.legalRisk}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                          <div className="flex items-center gap-3 bg-blue-900/30 p-3 rounded-lg">
                            <Wallet className="h-8 w-8 text-amber-300" />
                            <div>
                              <p className="text-sm text-blue-200">Impact financier</p>
                              <p className="text-2xl font-semibold">{gameState.financialImpact.toLocaleString()} k€</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 bg-blue-900/30 p-3 rounded-lg">
                            <Building className="h-8 w-8 text-amber-300" />
                            <div>
                              <p className="text-sm text-blue-200">Stress interne</p>
                              <p className="text-2xl font-semibold">{gameState.stressLevel}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-950/50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold mb-3">Résumé de la crise</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-blue-200">Durée de la crise</span>
                            <span className="text-xl font-medium">{Math.floor(gameState.currentTime / 60)}h {gameState.currentTime % 60}min</span>
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-sm text-blue-200">Événements gérés</span>
                            <span className="text-xl font-medium">{gameState.eventLog.filter(e => !e.event.startsWith("Début") && !e.event.startsWith("Décision")).length}</span>
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-sm text-blue-200">Décisions prises</span>
                            <span className="text-xl font-medium">{gameState.eventLog.filter(e => e.event.startsWith("Décision")).length}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <span className="text-sm text-blue-200">Phase finale atteinte</span>
                          <div className="flex items-center mt-1">
                            {getPhaseIcon(gameState.activePhase)}
                            <span className="ml-2 font-medium capitalize">{gameState.activePhase}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="events">
                    <div className="bg-blue-950/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                      <h3 className="text-xl font-semibold mb-3">Chronologie des événements</h3>
                      <div className="space-y-3">
                        {gameState.eventLog.map((entry, index) => (
                          <div key={index} className="border-l-2 border-blue-500 pl-4 pb-4 relative">
                            <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-blue-500"></div>
                            <p className="text-sm text-blue-300">T+{formatGameTime(entry.time)}</p>
                            <p className="font-medium">{entry.event}</p>
                            {entry.decision && (
                              <p className="text-sm text-gray-300 mt-1">{entry.decision}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="analysis">
                    <div className="bg-blue-950/50 p-4 rounded-lg">
                      <h3 className="text-xl font-semibold mb-3">Analyse de votre gestion de crise</h3>
                      <p className="mb-4">
                        Demandez une analyse détaillée de votre gestion de crise par notre assistant IA spécialisé en cybersécurité.
                        L'analyse évaluera vos compétences en matière de:
                      </p>
                      <ul className="space-y-2 mb-4">
                        <li className="flex items-start">
                          <AlarmClock className="h-5 w-5 mr-2 shrink-0 text-blue-400" />
                          <span>Réactivité et rapidité de décision</span>
                        </li>
                        <li className="flex items-start">
                          <Shield className="h-5 w-5 mr-2 shrink-0 text-blue-400" />
                          <span>Priorisation des actions et protection des actifs critiques</span>
                        </li>
                        <li className="flex items-start">
                          <Users className="h-5 w-5 mr-2 shrink-0 text-blue-400" />
                          <span>Communication et gestion des parties prenantes</span>
                        </li>
                        <li className="flex items-start">
                          <Building className="h-5 w-5 mr-2 shrink-0 text-blue-400" />
                          <span>Équilibre entre continuité d'activité et sécurité</span>
                        </li>
                        <li className="flex items-start">
                          <FileText className="h-5 w-5 mr-2 shrink-0 text-blue-400" />
                          <span>Conformité légale et réglementaire</span>
                        </li>
                      </ul>
                      <Button 
                        onClick={requestAIAnalysis}
                        className="w-full bg-blue-700 hover:bg-blue-600"
                      >
                        Obtenir l'analyse IA
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Button 
                  onClick={restartGame}
                  className="w-full sm:w-auto bg-blue-700 hover:bg-blue-600"
                >
                  Rejouer
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/mode-selection')}
                  className="w-full sm:w-auto border-blue-700 text-blue-200 hover:bg-blue-900/50"
                >
                  Retour à l'accueil
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ) : (
          /* Interface de jeu principale */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tableau de bord */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-auto">
              {/* Niveau opérationnel */}
              <Card className="bg-gray-900/80 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Activité opérationnelle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Progress value={gameState.operationalScore} className="flex-1 mr-2" />
                    <span className="text-xl font-bold">{gameState.operationalScore}%</span>
                  </div>
                  <p className="text-sm mt-2 text-blue-200">
                    {gameState.operationalScore > 80 ? 'Fonctionnement quasi-normal' :
                     gameState.operationalScore > 50 ? 'Services critiques maintenus' :
                     gameState.operationalScore > 30 ? 'Perturbations majeures' :
                     'Activité sévèrement compromise'
                    }
                  </p>
                </CardContent>
              </Card>
              
              {/* Coût financier */}
              <Card className="bg-gray-900/80 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Impact financier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{gameState.financialImpact.toLocaleString()} k€</div>
                  <p className="text-sm text-blue-200">
                    {gameState.financialImpact < 50 ? 'Coûts limités' :
                     gameState.financialImpact < 200 ? 'Impact modéré sur le budget' :
                     gameState.financialImpact < 500 ? 'Coûts significatifs' :
                     'Impact financier majeur'
                    }
                  </p>
                </CardContent>
              </Card>
              
              {/* Réputation */}
              <Card className="bg-gray-900/80 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Réputation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Progress value={gameState.reputationScore} className="flex-1 mr-2" />
                    <span className="text-xl font-bold">{gameState.reputationScore}%</span>
                  </div>
                  <p className="text-sm mt-2 text-blue-200">
                    {gameState.reputationScore > 80 ? 'Confiance maintenue' :
                     gameState.reputationScore > 50 ? 'Image légèrement ternie' :
                     gameState.reputationScore > 30 ? 'Réputation compromise' :
                     'Crise d\'image majeure'
                    }
                  </p>
                </CardContent>
              </Card>
              
              {/* Risque légal */}
              <Card className="bg-gray-900/80 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Risque légal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Progress value={gameState.legalRisk} className="flex-1 mr-2" />
                    <span className="text-xl font-bold">{gameState.legalRisk}%</span>
                  </div>
                  <p className="text-sm mt-2 text-blue-200">
                    {gameState.legalRisk < 20 ? 'Risque minimal' :
                     gameState.legalRisk < 50 ? 'Exposition légale limitée' :
                     gameState.legalRisk < 80 ? 'Risques juridiques élevés' :
                     'Exposition légale critique'
                    }
                  </p>
                </CardContent>
              </Card>
              
              {/* Niveau de stress */}
              <Card className="bg-gray-900/80 border-blue-800 sm:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Niveau de stress interne
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Progress 
                      value={gameState.stressLevel} 
                      className={`flex-1 mr-2 ${
                        gameState.stressLevel > 80 ? 'bg-red-900' : 
                        gameState.stressLevel > 60 ? 'bg-orange-900' : 
                        gameState.stressLevel > 30 ? 'bg-yellow-900' : 
                        'bg-blue-900'
                      }`} 
                    />
                    <span className="text-xl font-bold">{gameState.stressLevel}%</span>
                  </div>
                  <p className="text-sm mt-2 text-blue-200">
                    {gameState.stressLevel < 30 ? 'Équipes sous contrôle' :
                     gameState.stressLevel < 60 ? 'Tension palpable' :
                     gameState.stressLevel < 80 ? 'Stress élevé' :
                     'Situation critique, risque de burn-out'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Panneau événements et décisions */}
            <div className="lg:col-span-1 space-y-4">
              {/* Événement en cours */}
              {gameState.currentEvent ? (
                <Card className="bg-gray-900/80 border-blue-800 border-l-4 border-l-amber-500">
                  <CardHeader className="pb-2">
                    <Badge variant="outline" className="w-fit mb-2 border-amber-400 text-amber-300">
                      Événement en cours
                    </Badge>
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      {gameState.currentEvent.source === 'technical' ? <Shield className="h-5 w-5" /> :
                       gameState.currentEvent.source === 'internal' ? <Users className="h-5 w-5" /> :
                       gameState.currentEvent.source === 'external' ? <Building className="h-5 w-5" /> :
                       <AlertCircle className="h-5 w-5" />
                      }
                      {gameState.currentEvent.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{gameState.currentEvent.description}</p>
                    <div className="space-y-3">
                      <h4 className="text-md font-medium">Options disponibles:</h4>
                      {gameState.currentEvent.decisions.map(decision => (
                        <Button 
                          key={decision.id}
                          onClick={() => handleDecisionSelect(decision)}
                          variant="outline" 
                          className="w-full justify-start text-left h-auto py-3 border-blue-800"
                        >
                          <div className="flex items-start">
                            <div className="mr-3 mt-0.5">
                              {decision.icon}
                            </div>
                            <div>
                              <p className="font-medium">{decision.title}</p>
                              <p className="text-sm text-gray-300">{decision.description}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline" className={
                                  decision.risk === 'high' ? 'border-red-500 text-red-300' :
                                  decision.risk === 'medium' ? 'border-amber-500 text-amber-300' :
                                  'border-green-500 text-green-300'
                                }>
                                  Risque {
                                    decision.risk === 'high' ? 'élevé' :
                                    decision.risk === 'medium' ? 'moyen' : 'faible'
                                  }
                                </Badge>
                                <Badge variant="outline" className="border-blue-500 text-blue-300">
                                  {decision.duration} min
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-900/80 border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Situation en cours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">
                      En attente du prochain événement. Profitez de ce moment pour évaluer votre stratégie et préparer votre équipe.
                    </p>
                    <div className="flex items-center justify-center py-8">
                      <AlarmClock className="h-12 w-12 animate-pulse text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Journal des événements */}
              <Card className="bg-gray-900/80 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Journal des événements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-56 overflow-y-auto">
                    {gameState.eventLog.slice().reverse().map((entry, index) => (
                      <div key={index} className="border-l-2 border-blue-500 pl-3 py-1">
                        <div className="flex">
                          <p className="text-xs text-blue-300 font-mono">T+{formatGameTime(entry.time)}</p>
                          <p className="text-sm ml-2">{entry.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      
      {/* Modal d'analyse de performance */}
      <Dialog open={isAnalysisModalOpen} onOpenChange={setIsAnalysisModalOpen}>
        <DialogContent className="bg-gray-900 border border-blue-700 text-white max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-rajdhani text-blue-200">Analyse de votre gestion de crise</DialogTitle>
            <DialogDescription className="text-gray-300">
              Évaluation de vos décisions et de l'impact sur l'organisation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <Card className="bg-gray-800 border-blue-800">
              <CardContent className="pt-6">
                <div className="prose prose-invert">
                  {analysisResult.split('\n').map((line, i) => {
                    // Styliser les titres et sous-titres
                    if (line.match(/^#+\s/)) {
                      return <h3 key={i} className="text-blue-300 font-rajdhani">{line.replace(/^#+\s/, '')}</h3>;
                    }
                    
                    // Mettre en évidence les points numérotés
                    if (line.match(/^\d+\.\s/)) {
                      return <p key={i} className="text-amber-200 font-semibold">{line}</p>;
                    }
                    
                    // Format normal pour les autres lignes
                    return <p key={i}>{line || ' '}</p>;
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAnalysisModalOpen(false)}
              className="border-blue-500 hover:bg-blue-900/50"
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Définition des événements de crise pour le scénario
const crisisEvents: CrisisEvent[] = [
  {
    id: 'detect-1',
    title: 'Alerte de sécurité: trafic réseau suspect',
    description: 'Le SOC a détecté un volume anormal de trafic sortant vers des adresses IP inconnues depuis plusieurs postes de travail.',
    severity: 'medium',
    timepoint: 5,
    source: 'technical',
    icon: <AlertCircle />,
    decisions: [
      {
        id: 'detect-1-a',
        title: 'Analyser le trafic sans bloquer',
        description: 'Continuer la surveillance en analysant les flux sans couper les communications.',
        impacts: {
          operational: 0,
          financial: -10,
          reputation: 0,
          legal: 5,
          stress: 5
        },
        duration: 10,
        risk: 'medium',
        icon: <Shield />
      },
      {
        id: 'detect-1-b',
        title: 'Isoler immédiatement les machines concernées',
        description: 'Déconnecter les postes suspects du réseau pour stopper toute fuite potentielle.',
        impacts: {
          operational: -15,
          financial: -15,
          reputation: 0,
          legal: -10,
          stress: 10
        },
        duration: 20,
        risk: 'low',
        icon: <Lock />
      },
      {
        id: 'detect-1-c',
        title: 'Convoquer la cellule de crise',
        description: 'Rassembler les responsables techniques et métiers pour évaluer la situation.',
        impacts: {
          operational: -5,
          financial: -5,
          reputation: 0,
          legal: 0,
          stress: 0
        },
        duration: 15,
        risk: 'low',
        icon: <Users />
      }
    ]
  },
  {
    id: 'detect-2',
    title: 'Confirmation d\'intrusion: malware détecté',
    description: 'L\'analyse a confirmé la présence d\'un malware de type ransomware en phase préliminaire sur plusieurs postes.',
    severity: 'high',
    timepoint: 20,
    source: 'technical',
    icon: <Shield />,
    decisions: [
      {
        id: 'detect-2-a',
        title: 'Activer le PCA (Plan de Continuité d\'Activité)',
        description: 'Déclencher les procédures d\'urgence et basculer vers les systèmes de secours.',
        impacts: {
          operational: -20,
          financial: -50,
          reputation: 5,
          legal: -5,
          stress: 15
        },
        duration: 30,
        risk: 'medium',
        icon: <Zap />
      },
      {
        id: 'detect-2-b',
        title: 'Déconnecter l\'ensemble du réseau d\'entreprise',
        description: 'Shutdown complet pour stopper la propagation, y compris les services critiques.',
        impacts: {
          operational: -60,
          financial: -100,
          reputation: -15,
          legal: -15,
          stress: 25
        },
        duration: 45,
        risk: 'high',
        icon: <Lock />
      },
      {
        id: 'detect-2-c',
        title: 'Isoler uniquement les segments infectés',
        description: 'Segmenter le réseau pour contenir l\'infection tout en maintenant les services essentiels.',
        impacts: {
          operational: -30,
          financial: -35,
          reputation: 0,
          legal: 5,
          stress: 10
        },
        duration: 25,
        risk: 'medium',
        icon: <Shield />
      }
    ]
  },
  {
    id: 'contain-1',
    title: 'Pression de la Direction',
    description: 'Le Comex exige un rapport sur la situation et des garanties que les données clients sont sécurisées.',
    severity: 'medium',
    timepoint: 40,
    source: 'management',
    icon: <Users />,
    decisions: [
      {
        id: 'contain-1-a',
        title: 'Rapport complet avec communication des risques',
        description: 'Préparer un rapport détaillé incluant tous les risques identifiés.',
        impacts: {
          operational: 0,
          financial: -5,
          reputation: 0,
          legal: -5,
          stress: 5
        },
        duration: 15,
        risk: 'low',
        icon: <FileText />
      },
      {
        id: 'contain-1-b',
        title: 'Rapport partiel rassurant',
        description: 'Fournir un rapport qui minimise les risques pour éviter la panique.',
        impacts: {
          operational: 5,
          financial: 0,
          reputation: -10,
          legal: 15,
          stress: -5
        },
        duration: 10,
        risk: 'high',
        icon: <FileText />
      },
      {
        id: 'contain-1-c',
        title: 'Demander plus de temps pour l\'analyse',
        description: 'Expliquer que l\'enquête est en cours et qu\'un rapport prématuré serait inexact.',
        impacts: {
          operational: 5,
          financial: 0,
          reputation: -5,
          legal: 0,
          stress: 10
        },
        duration: 5,
        risk: 'medium',
        icon: <AlarmClock />
      }
    ]
  },
  {
    id: 'contain-2',
    title: 'Indisponibilité des applications métiers',
    description: 'Plusieurs applications critiques sont inaccessibles, affectant la production et le service client.',
    severity: 'high',
    timepoint: 60,
    source: 'internal',
    icon: <Building />,
    decisions: [
      {
        id: 'contain-2-a',
        title: 'Activer les procédures de travail dégradé',
        description: 'Basculer vers les procédures manuelles et alternatives prévues dans le PCA.',
        impacts: {
          operational: -15,
          financial: -30,
          reputation: -5,
          legal: 0,
          stress: 10
        },
        duration: 20,
        risk: 'low',
        icon: <FileText />
      },
      {
        id: 'contain-2-b',
        title: 'Restaurer à partir des sauvegardes',
        description: 'Utiliser les dernières sauvegardes pour remettre en service les applications essentielles.',
        impacts: {
          operational: 20,
          financial: -60,
          reputation: 10,
          legal: -5,
          stress: 5
        },
        duration: 40,
        risk: 'medium',
        icon: <Shield />
      },
      {
        id: 'contain-2-c',
        title: 'Déployer des VM isolées pour les services critiques',
        description: 'Créer un environnement parallèle sécurisé pour les fonctions essentielles.',
        impacts: {
          operational: 30,
          financial: -80,
          reputation: 15,
          legal: -5,
          stress: 10
        },
        duration: 60,
        risk: 'medium',
        icon: <Zap />
      }
    ]
  },
  {
    id: 'contain-3',
    title: 'Inquiétude des employés et fuites sur les réseaux sociaux',
    description: 'Les employés commencent à parler de la situation sur les réseaux sociaux, provoquant des spéculations.',
    severity: 'medium',
    timepoint: 90,
    source: 'internal',
    icon: <Users />,
    decisions: [
      {
        id: 'contain-3-a',
        title: 'Communication interne transparente',
        description: 'Informer tous les employés de la situation avec des consignes claires.',
        impacts: {
          operational: 10,
          financial: -5,
          reputation: 15,
          legal: -5,
          stress: -10
        },
        duration: 10,
        risk: 'low',
        icon: <MessageSquare />
      },
      {
        id: 'contain-3-b',
        title: 'Limiter strictement la communication',
        description: 'Interdire toute communication externe et limiter les informations en interne.',
        impacts: {
          operational: -5,
          financial: 0,
          reputation: -15,
          legal: 5,
          stress: 20
        },
        duration: 5,
        risk: 'high',
        icon: <Lock />
      },
      {
        id: 'contain-3-c',
        title: 'Briefing des managers uniquement',
        description: 'Former les managers pour qu\'ils diffusent un message contrôlé à leurs équipes.',
        impacts: {
          operational: 5,
          financial: -10,
          reputation: 5,
          legal: 0,
          stress: 5
        },
        duration: 15,
        risk: 'medium',
        icon: <Users />
      }
    ]
  },
  {
    id: 'eradicate-1',
    title: 'Demande de rançon reçue',
    description: 'Les attaquants ont envoyé une demande de rançon de 500 000€ en échange d\'une clé de déchiffrement.',
    severity: 'critical',
    timepoint: 120,
    source: 'external',
    icon: <AlertCircle />,
    decisions: [
      {
        id: 'eradicate-1-a',
        title: 'Refuser catégoriquement',
        description: 'Ne pas négocier avec les attaquants et concentrer les efforts sur la restauration.',
        impacts: {
          operational: -10,
          financial: -50,
          reputation: 10,
          legal: -10,
          stress: 15
        },
        duration: 5,
        risk: 'medium',
        icon: <Shield />
      },
      {
        id: 'eradicate-1-b',
        title: 'Consulter les autorités (ANSSI)',
        description: 'Contacter les autorités compétentes pour obtenir assistance et conseil.',
        impacts: {
          operational: 0,
          financial: -20,
          reputation: 15,
          legal: -20,
          stress: 5
        },
        duration: 30,
        risk: 'low',
        icon: <Building />
      },
      {
        id: 'eradicate-1-c',
        title: 'Évaluer les options de paiement',
        description: 'Sans s\'engager, explorer la possibilité de payer pour récupérer rapidement l\'activité.',
        impacts: {
          operational: 5,
          financial: -10,
          reputation: -10,
          legal: 25,
          stress: 10
        },
        duration: 15,
        risk: 'high',
        icon: <Wallet />
      }
    ]
  },
  {
    id: 'eradicate-2',
    title: 'Contact des journalistes',
    description: 'Des journalistes ont eu vent de l\'incident et demandent une confirmation officielle.',
    severity: 'high',
    timepoint: 150,
    source: 'external',
    icon: <MessageSquare />,
    decisions: [
      {
        id: 'eradicate-2-a',
        title: 'Communiqué de presse limité',
        description: 'Publier un communiqué reconnaissant un "incident technique" sans détails.',
        impacts: {
          operational: 0,
          financial: -5,
          reputation: 5,
          legal: 0,
          stress: 5
        },
        duration: 10,
        risk: 'low',
        icon: <FileText />
      },
      {
        id: 'eradicate-2-b',
        title: 'Transparence complète',
        description: 'Communiquer ouvertement sur l\'attaque et les mesures prises.',
        impacts: {
          operational: 5,
          financial: -15,
          reputation: -5,
          legal: -15,
          stress: 15
        },
        duration: 15,
        risk: 'medium',
        icon: <MessageSquare />
      },
      {
        id: 'eradicate-2-c',
        title: 'Refuser tout commentaire',
        description: 'Indiquer qu\'une communication officielle sera faite ultérieurement.',
        impacts: {
          operational: 0,
          financial: 0,
          reputation: -15,
          legal: 5,
          stress: 0
        },
        duration: 5,
        risk: 'high',
        icon: <Lock />
      }
    ]
  },
  {
    id: 'recovery-1',
    title: 'Découverte d\'une perte de données client potentielle',
    description: 'L\'analyse forensique suggère que les attaquants ont pu extraire des données clients sensibles.',
    severity: 'critical',
    timepoint: 240,
    source: 'technical',
    icon: <AlertCircle />,
    decisions: [
      {
        id: 'recovery-1-a',
        title: 'Notifier la CNIL immédiatement',
        description: 'Respecter l\'obligation légale de notification d\'une violation de données personnelles.',
        impacts: {
          operational: -5,
          financial: -40,
          reputation: -10,
          legal: -30,
          stress: 15
        },
        duration: 15,
        risk: 'medium',
        icon: <FileText />
      },
      {
        id: 'recovery-1-b',
        title: 'Informer les clients concernés',
        description: 'Contacter directement les clients dont les données ont pu être compromises.',
        impacts: {
          operational: -15,
          financial: -60,
          reputation: -20,
          legal: -25,
          stress: 25
        },
        duration: 30,
        risk: 'high',
        icon: <Users />
      },
      {
        id: 'recovery-1-c',
        title: 'Poursuivre l\'analyse avant notification',
        description: 'Approfondir l\'enquête pour confirmer la nature exacte des données exfiltrées.',
        impacts: {
          operational: 0,
          financial: -20,
          reputation: 0,
          legal: 20,
          stress: 5
        },
        duration: 20,
        risk: 'high',
        icon: <Shield />
      }
    ]
  },
  {
    id: 'recovery-2',
    title: 'Proposition d\'un prestataire spécialisé',
    description: 'Une entreprise spécialisée en réponse aux incidents propose ses services pour accélérer le rétablissement.',
    severity: 'medium',
    timepoint: 300,
    source: 'external',
    icon: <Shield />,
    decisions: [
      {
        id: 'recovery-2-a',
        title: 'Engager le prestataire',
        description: 'Faire appel à l\'expertise externe pour renforcer la capacité de réponse.',
        impacts: {
          operational: 20,
          financial: -120,
          reputation: 10,
          legal: -15,
          stress: -15
        },
        duration: 30,
        risk: 'low',
        icon: <Users />
      },
      {
        id: 'recovery-2-b',
        title: 'Continuer avec les ressources internes',
        description: 'S\'appuyer uniquement sur les compétences de l\'équipe interne.',
        impacts: {
          operational: -10,
          financial: -20,
          reputation: 0,
          legal: 5,
          stress: 20
        },
        duration: 60,
        risk: 'high',
        icon: <Shield />
      },
      {
        id: 'recovery-2-c',
        title: 'Collaboration mixte',
        description: 'Engager le prestataire pour des tâches spécifiques en complément de l\'équipe interne.',
        impacts: {
          operational: 15,
          financial: -70,
          reputation: 5,
          legal: -5,
          stress: 0
        },
        duration: 45,
        risk: 'medium',
        icon: <Users />
      }
    ]
  }
];

export default CyberChaos;