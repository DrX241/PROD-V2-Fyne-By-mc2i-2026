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
  Laptop,
  Lock,
  Loader2,
  MessageCircle,
  MessageSquare,
  Newspaper,
  Send,
  Shield,
  ShieldAlert,
  Users,
  Wallet,
  X,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { useChatContext } from "@/contexts/ChatContext";
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
  
  // États pour la communication avec les PNJ
  const [showCommunicationPanel, setShowCommunicationPanel] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<Record<string, boolean>>({
    'Presse': false,
    'Autorités': false,
    'Communication': true, // Une demande initiale pour créer de la tension
    'Équipe technique': true, // Une demande initiale pour créer de la tension
    'Direction': false
  });
  const [requestTimers, setRequestTimers] = useState<Record<string, number>>({
    'Presse': 0,
    'Autorités': 0,
    'Communication': 180, // 3 minutes pour répondre
    'Équipe technique': 300, // 5 minutes pour répondre
    'Direction': 0
  });
  const [communicationHistory, setCommunicationHistory] = useState<Record<string, Array<{sender: 'player' | 'npc', message: string, needsResponse?: boolean, choices?: string[]}>>>({
    'Presse': [],
    'Autorités': [],
    'Communication': [
      { 
        sender: 'npc', 
        message: "Nous avons besoin de votre décision rapide concernant la communication externe. Devons-nous préparer une déclaration préliminaire pour les clients ou attendre plus d'informations? Le service juridique préfère attendre, mais les clients commencent à nous contacter.", 
        needsResponse: true,
        choices: [
          "Préparer une déclaration préliminaire immédiatement",
          "Attendre plus d'informations techniques avant de communiquer",
          "Informer uniquement les clients directement concernés"
        ]
      }
    ],
    'Équipe technique': [
      { 
        sender: 'npc', 
        message: "Nous avons détecté des activités suspectes sur les serveurs de production. Je vous recommande d'isoler immédiatement ces systèmes du réseau, mais cela entraînera une interruption de service pour environ 2 heures. Faut-il procéder?", 
        needsResponse: true,
        choices: [
          "Isoler immédiatement les systèmes concernés",
          "Surveiller d'abord pour collecter plus d'informations",
          "Isoler progressivement pour minimiser l'impact"
        ]
      }
    ],
    'Direction': []
  });
  
  // Configurer les événements de crise pour le scénario
  useEffect(() => {
    if (isGameStarted && !gameState.events.length) {
      // Initialiser les événements du scénario
      setGameState(prevState => ({
        ...prevState,
        events: crisisEvents,
      }));
      
      // Pas de toast pour le message d'accueil
    }
  }, [isGameStarted, toast, gameState.events.length]);
  
  // Game timer et gestion des communications avec les PNJ
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isGameStarted && !isPaused && !gameState.gameOver) {
      timer = setInterval(() => {
        // Mettre à jour le temps de jeu
        setGameState(prevState => {
          const newTime = prevState.currentTime + 1 * prevState.timeScale;
          
          // Vérifier si des événements doivent être déclenchés
          const triggerEvent = prevState.events.find(
            e => e.timepoint <= newTime && !prevState.eventLog.some(log => log.event === e.title)
          );
          
          if (triggerEvent) {
            // Déclencher des communications proactives des PNJ en fonction de l'événement
            setTimeout(() => {
              triggerPNJCommunications(triggerEvent);
            }, 1000);
            
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
          
          return {
            ...prevState,
            currentTime: newTime
          };
        });
        
        // Mettre à jour les timers des demandes en attente
        setRequestTimers(prev => {
          const newTimers = {...prev};
          let updated = false;
          
          Object.keys(newTimers).forEach(contact => {
            if (pendingRequests[contact] && newTimers[contact] > 0) {
              newTimers[contact] -= 1;
              updated = true;
              
              // Si le timer arrive à zéro, créer des conséquences négatives
              if (newTimers[contact] === 0) {
                handleExpiredRequest(contact);
              }
            }
          });
          
          return updated ? newTimers : prev;
        });
        
        // Générer aléatoirement de nouvelles demandes des PNJ en fonction de l'état du jeu
        const randomPNJInteraction = () => {
          // Une chance sur 60 pour chaque cycle (environ une demande par minute en moyenne)
          if (Math.random() < 0.0167) {
            const availableContacts = Object.keys(pendingRequests).filter(
              contact => !pendingRequests[contact]
            );
            
            if (availableContacts.length > 0) {
              // Sélectionner un contact aléatoire qui n'a pas déjà une demande en attente
              const randomContact = availableContacts[Math.floor(Math.random() * availableContacts.length)];
              
              // Déclencher une communication proactive de ce PNJ
              generatePNJRequest(randomContact);
            }
          }
        };
        
        // Seulement si la partie est en cours depuis un moment (pour éviter trop de demandes au début)
        if (gameState.currentTime > 30) {
          randomPNJInteraction();
        }
        
      }, 1000); // toutes les secondes
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGameStarted, isPaused, gameState.gameOver, pendingRequests]);
  
  // Fonctions pour gérer les demandes proactives des PNJ
  const triggerPNJCommunications = (event: CrisisEvent) => {
    // Selon le type d'événement, faire réagir différents PNJ
    if (event.source === 'external') {
      generatePNJRequest('Presse');
    } else if (event.source === 'technical') {
      generatePNJRequest('Équipe technique');
    } else if (event.severity === 'high' || event.severity === 'critical') {
      generatePNJRequest('Direction');
    }
  };
  
  const generatePNJRequest = async (contact: string) => {
    // Définir le PNJ comme ayant une demande en attente
    setPendingRequests(prev => ({
      ...prev,
      [contact]: true
    }));
    
    // Définir un délai pour répondre (entre 3 et 5 minutes selon le contact)
    const responseTime = 
      contact === 'Presse' ? 180 : 
      contact === 'Équipe technique' ? 120 :
      contact === 'Autorités' ? 240 :
      contact === 'Direction' ? 120 : 180;
      
    setRequestTimers(prev => ({
      ...prev,
      [contact]: responseTime
    }));
    
    // Créer un message contextuel en fonction de la phase et du contact
    let message = "";
    let choices: string[] = [];
    
    // Chaque type de contact génère un différent type de demande
    if (contact === 'Presse') {
      message = "Un journaliste de CyberInfos vient de nous contacter. Il a entendu parler d'un 'incident' dans votre organisation et prépare un article. Il demande une déclaration officielle pour son édition de demain matin. Comment souhaitez-vous procéder?";
      choices = [
        "Nier tout incident et refuser tout commentaire",
        "Confirmer un 'incident technique' sans donner de détails",
        "Communiquer de façon transparente sur la cyberattaque",
        "Demander un délai pour préparer une réponse officielle"
      ];
    } else if (contact === 'Équipe technique') {
      message = "L'analyse préliminaire montre que les attaquants ont peut-être accédé à la base de données clients. Nous ne sommes pas encore certains de l'étendue de la compromission. Devons-nous lancer une analyse forensique approfondie (6h) ou restaurer immédiatement depuis les sauvegardes (3h)?";
      choices = [
        "Lancer l'analyse forensique complète avant toute action",
        "Restaurer immédiatement depuis les sauvegardes",
        "Effectuer une analyse rapide (2h) puis restaurer",
        "Cloner les systèmes pour analyse tout en restaurant en parallèle"
      ];
    } else if (contact === 'Autorités') {
      message = "L'ANSSI nous a contactés suite à des signalements d'activités suspectes provenant de notre réseau. Ils demandent un rapport détaillé dans les 24h et souhaitent savoir si nous avons déjà pris des mesures de remédiation. Quelle information leur communiquer?";
      choices = [
        "Partager toutes les informations techniques dont nous disposons",
        "Fournir uniquement les informations minimales légalement requises",
        "Demander l'assistance technique de l'ANSSI",
        "Reporter la communication en invoquant l'enquête interne en cours"
      ];
    } else if (contact === 'Communication') {
      message = "Les équipes sont inquiètes et les rumeurs circulent. Plusieurs clients importants ont appelé notre service client. Quelle stratégie de communication interne et externe adopter pour les prochaines 48h?";
      choices = [
        "Communication minimale: 'incident technique en cours d'investigation'",
        "Transparence totale sur la situation avec toutes les parties prenantes",
        "Communication interne complète mais externe limitée",
        "Organiser une réunion de crise avec tous les responsables d'équipe"
      ];
    } else if (contact === 'Direction') {
      message = "Le PDG demande un point de situation immédiat et veut connaître l'impact financier estimé et le délai de retour à la normale. Le conseil d'administration se réunit demain matin. Quelles informations communiquer à la direction?";
      choices = [
        "Présenter uniquement les faits confirmés avec une estimation prudente",
        "Fournir tous les détails techniques et le pire scénario possible",
        "Présenter un plan de remédiation avec calendrier et coûts estimés",
        "Proposer l'intervention d'un prestataire externe spécialisé"
      ];
    }
    
    // Ajouter le message au chat
    setCommunicationHistory(prev => ({
      ...prev,
      [contact]: [
        ...prev[contact],
        { 
          sender: 'npc', 
          message, 
          needsResponse: true,
          choices
        }
      ]
    }));
  };
  
  const handleExpiredRequest = (contact: string) => {
    // Quand un timer expire, créer des conséquences négatives
    setGameState(prev => {
      let reputationImpact = -10;
      let operationalImpact = 0;
      let legalImpact = 5;
      let stressImpact = 10;
      
      // Différentes conséquences selon le contact
      if (contact === 'Presse') {
        reputationImpact = -20;
      } else if (contact === 'Équipe technique') {
        operationalImpact = -15;
      } else if (contact === 'Autorités') {
        legalImpact = 15;
      } else if (contact === 'Direction') {
        stressImpact = 20;
      }
      
      // Ajouter un événement au journal
      const updatedEventLog = [...prev.eventLog, {
        time: prev.currentTime,
        event: `Absence de réponse à ${contact}: conséquences négatives`
      }];
      
      // Envoyer un message du PNJ indiquant les conséquences
      setCommunicationHistory(prevChat => ({
        ...prevChat,
        [contact]: [
          ...prevChat[contact],
          { 
            sender: 'npc', 
            message: `Votre manque de réponse a eu des conséquences négatives. ${
              contact === 'Presse' ? 'Un article négatif a été publié, impactant votre réputation.' :
              contact === 'Équipe technique' ? 'L\'équipe a pris une décision sans directive claire, compromettant l\'efficacité des opérations.' :
              contact === 'Autorités' ? 'Les autorités ont noté votre manque de coopération, augmentant votre exposition légale.' :
              contact === 'Direction' ? 'La direction est mécontente de votre gestion de crise, augmentant la pression interne.' :
              'Votre silence a été interprété négativement.'
            }`
          }
        ]
      }));
      
      // Réinitialiser la demande
      setPendingRequests(prevReq => ({
        ...prevReq,
        [contact]: false
      }));
      
      // Mettre à jour l'état du jeu avec les impacts
      return {
        ...prev,
        reputationScore: Math.max(0, Math.min(100, prev.reputationScore + reputationImpact)),
        operationalScore: Math.max(0, Math.min(100, prev.operationalScore + operationalImpact)),
        legalRisk: Math.max(0, Math.min(100, prev.legalRisk + legalImpact)),
        stressLevel: Math.max(0, Math.min(100, prev.stressLevel + stressImpact)),
        eventLog: updatedEventLog
      };
    });
  };
  
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
      
      // Pas de notification toast, on laisse les événements s'accumuler
      
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
  
  // Fonctions pour la communication avec les PNJ
  const handleContactSelect = (contact: string) => {
    setSelectedContact(contact);
    setShowCommunicationPanel(true);
  };
  
  const sendMessageToPNJ = async () => {
    if (!selectedContact || !newMessage.trim()) return;
    
    setIsSendingMessage(true);
    
    // Vérifier si c'était une réponse à une demande urgente avec choix prédéfinis
    const isUrgentResponse = pendingRequests[selectedContact];
    const lastMessage = communicationHistory[selectedContact]?.length > 0 
      ? communicationHistory[selectedContact][communicationHistory[selectedContact].length - 1] 
      : null;
    const wasChoiceSelected = lastMessage && 'needsResponse' in lastMessage && lastMessage.needsResponse;
    
    // Ajouter le message du joueur à l'historique
    setCommunicationHistory(prev => ({
      ...prev,
      [selectedContact]: [
        ...prev[selectedContact],
        { sender: 'player', message: newMessage }
      ]
    }));
    
    // Créer une copie du message à envoyer avant de le réinitialiser
    const messageCopy = newMessage;
    setNewMessage('');
    
    // Si c'était une réponse à une demande urgente, marquer comme traitée et calculer les impacts
    if (isUrgentResponse) {
      setPendingRequests(prev => ({
        ...prev,
        [selectedContact]: false
      }));
      
      // Ajouter au journal la résolution
      setGameState(prev => ({
        ...prev,
        eventLog: [...prev.eventLog, {
          time: prev.currentTime,
          event: `Réponse à ${selectedContact}: ${messageCopy.substring(0, 30)}${messageCopy.length > 30 ? '...' : ''}`
        }]
      }));
      
      // Appliquer des impacts positifs pour avoir répondu
      let impactFacteur = 1.0;
      
      // Plus le joueur répond vite, meilleur est l'impact
      if (requestTimers[selectedContact] > 120) {
        impactFacteur = 1.0; // Réponse rapide
      } else if (requestTimers[selectedContact] > 60) {
        impactFacteur = 0.7; // Réponse moyenne
      } else {
        impactFacteur = 0.5; // Réponse tardive
      }
      
      // Différents impacts selon le contact
      setGameState(prev => {
        let reputationImpact = 0;
        let operationalImpact = 0;
        let legalImpact = 0;
        let stressImpact = -5 * impactFacteur; // Moins de stress pour tous
        
        if (selectedContact === 'Presse') {
          reputationImpact = 5 * impactFacteur;
        } else if (selectedContact === 'Équipe technique') {
          operationalImpact = 5 * impactFacteur;
        } else if (selectedContact === 'Autorités') {
          legalImpact = -5 * impactFacteur;
        } else if (selectedContact === 'Direction') {
          stressImpact = -10 * impactFacteur;
        }
        
        return {
          ...prev,
          reputationScore: Math.max(0, Math.min(100, prev.reputationScore + reputationImpact)),
          operationalScore: Math.max(0, Math.min(100, prev.operationalScore + operationalImpact)),
          legalRisk: Math.max(0, Math.min(100, prev.legalRisk + legalImpact)),
          stressLevel: Math.max(0, Math.min(100, prev.stressLevel + stressImpact)),
        };
      });
      
      // Si l'utilisateur a choisi parmi les options proposées, créer une réponse contextuelle immédiate
      if (wasChoiceSelected) {
        setTimeout(() => {
          let npcResponse = "";
          
          if (selectedContact === 'Presse') {
            if (messageCopy.includes("Nier tout incident")) {
              npcResponse = "Je comprends votre position officielle d'absence d'incident. Néanmoins, j'ai des sources qui confirment des perturbations dans vos services. Je serai obligé de le mentionner dans mon article. Je vous recontacterai si j'ai d'autres questions.";
              // Impact négatif sur la réputation
              setGameState(prev => ({...prev, reputationScore: Math.max(0, prev.reputationScore - 10)}));
            } else if (messageCopy.includes("incident technique")) {
              npcResponse = "Merci pour cette confirmation. Pourriez-vous préciser quand vos services seront pleinement rétablis et si des données clients ont pu être affectées? Nos lecteurs s'inquiètent pour leurs informations personnelles.";
            } else if (messageCopy.includes("transparente")) {
              npcResponse = "J'apprécie votre transparence. C'est rare dans ce type de situation. J'aimerais vous citer directement dans l'article. Pouvez-vous me confirmer les mesures prises pour éviter que cela ne se reproduise?";
              // Impact positif sur la réputation
              setGameState(prev => ({...prev, reputationScore: Math.min(100, prev.reputationScore + 5)}));
            } else {
              npcResponse = "Je comprends votre besoin de préparer une réponse. Je peux vous accorder jusqu'à demain matin 8h, mais pas au-delà car nous bouclons notre édition. Merci de me contacter dès que possible.";
            }
          } else if (selectedContact === 'Équipe technique') {
            if (messageCopy.includes("forensique complète")) {
              npcResponse = "Compris. L'équipe forensique est mobilisée et commence l'analyse approfondie. Nous allons isoler et préserver toutes les preuves. Premier rapport préliminaire dans 2 heures, mais l'analyse complète prendra bien 6 heures comme prévu.";
              // Impact positif sur le score légal
              setGameState(prev => ({...prev, legalRisk: Math.max(0, prev.legalRisk - 10)}));
            } else if (messageCopy.includes("immédiatement")) {
              npcResponse = "Restauration des sauvegardes lancée immédiatement. Les services critiques seront en ligne dans environ 90 minutes. Note: cette approche nous fait perdre des preuves forensiques et la possibilité d'identifier précisément le vecteur d'attaque.";
              // Impact positif sur l'opérationnel mais négatif sur le légal
              setGameState(prev => ({
                ...prev, 
                operationalScore: Math.min(100, prev.operationalScore + 10),
                legalRisk: Math.min(100, prev.legalRisk + 5)
              }));
            } else if (messageCopy.includes("analyse rapide")) {
              npcResponse = "L'analyse rapide est en cours. Nous aurons une idée des principaux IOCs et du vecteur d'entrée dans 2 heures, puis nous lancerons la restauration des systèmes prioritaires.";
            } else {
              npcResponse = "Excellente décision. Nous allons cloner les systèmes affectés pour analyse forensique tout en lançant la restauration en parallèle. C'est plus complexe mais ça optimise le délai de reprise tout en préservant les preuves.";
              // Bon équilibre des impacts
              setGameState(prev => ({
                ...prev, 
                operationalScore: Math.min(100, prev.operationalScore + 5),
                legalRisk: Math.max(0, prev.legalRisk - 5)
              }));
            }
          } else if (selectedContact === 'Autorités') {
            if (messageCopy.includes("toutes les informations")) {
              npcResponse = "Nous apprécions votre coopération totale. Un analyste de l'ANSSI va vous contacter dans l'heure pour accéder à vos systèmes. Nous vous fournirons également des IOCs complémentaires provenant d'incidents similaires récents.";
              // Impact très positif sur le légal
              setGameState(prev => ({...prev, legalRisk: Math.max(0, prev.legalRisk - 15)}));
            } else if (messageCopy.includes("minimales légalement")) {
              npcResponse = "Nous prenons note de votre approche. Sachez que le cadre légal nous permet de demander des informations complémentaires si nécessaire. Nous attendons votre rapport dans les délais impartis.";
            } else if (messageCopy.includes("assistance technique")) {
              npcResponse = "Nous mettons à votre disposition un expert technique qui pourra vous accompagner dès demain matin. Veuillez préparer un accès sécurisé à vos logs et systèmes affectés pour faciliter son intervention.";
              // Impact positif sur l'opérationnel
              setGameState(prev => ({...prev, operationalScore: Math.min(100, prev.operationalScore + 10)}));
            } else {
              npcResponse = "Nous comprenons la sensibilité de la situation, mais nous vous rappelons l'obligation légale de notifier rapidement. Vous disposez de 72h maximum pour fournir un rapport complet, mais un rapport préliminaire reste attendu sous 24h.";
              // Impact légèrement négatif sur le légal
              setGameState(prev => ({...prev, legalRisk: Math.min(100, prev.legalRisk + 5)}));
            }
          } else if (selectedContact === 'Communication') {
            if (messageCopy.includes("minimale")) {
              npcResponse = "Message de communication minimaliste préparé et diffusé en interne. Les responsables de département ont été briefés pour rassurer leurs équipes. Pour l'externe, nous suivons strictement la ligne 'incident technique en cours'.";
            } else if (messageCopy.includes("Transparence totale")) {
              npcResponse = "Stratégie de transparence mise en place. Communication interne détaillée envoyée à tous les employés. Communiqué externe publié sur notre site et réseaux sociaux, informant de la cyberattaque et des mesures prises.";
              // Impact mitigé: positif sur réputation, négatif sur stress
              setGameState(prev => ({
                ...prev, 
                reputationScore: Math.min(100, prev.reputationScore + 10),
                stressLevel: Math.min(100, prev.stressLevel + 10)
              }));
            } else if (messageCopy.includes("interne complète")) {
              npcResponse = "Communication interne détaillée envoyée à tous les employés avec consignes précises. Communication externe minimaliste préparée pour les clients et partenaires. Les équipes sont rassurées mais restent vigilantes.";
              // Bon équilibre
              setGameState(prev => ({...prev, stressLevel: Math.max(0, prev.stressLevel - 5)}));
            } else {
              npcResponse = "Réunion de crise organisée dans 30 minutes avec tous les responsables d'équipe. Nous préparerons une stratégie de communication coordonnée suite à cette réunion. Entre-temps, consigne de discrétion maintenue.";
            }
          } else if (selectedContact === 'Direction') {
            if (messageCopy.includes("faits confirmés")) {
              npcResponse = "Le PDG apprécie votre prudence et la fiabilité des informations communiquées. Il demande à être informé en temps réel de toute évolution significative avant la réunion du conseil demain.";
              // Impact positif sur le stress
              setGameState(prev => ({...prev, stressLevel: Math.max(0, prev.stressLevel - 10)}));
            } else if (messageCopy.includes("pire scénario")) {
              npcResponse = "Le PDG est très préoccupé par l'ampleur potentielle que vous décrivez. Il a demandé une session de crise immédiate avec le comité exécutif et attend une évaluation plus précise des risques réels d'ici deux heures.";
              // Impact négatif sur le stress
              setGameState(prev => ({...prev, stressLevel: Math.min(100, prev.stressLevel + 15)}));
            } else if (messageCopy.includes("plan de remédiation")) {
              npcResponse = "Votre plan a été bien reçu par la direction. Le PDG vous demande de superviser personnellement sa mise en œuvre et de faire un point d'avancement toutes les 2 heures. Des ressources supplémentaires seront débloquées si nécessaire.";
              // Impact financier mais positif sur l'opérationnel
              setGameState(prev => ({
                ...prev, 
                financialImpact: prev.financialImpact + 30,
                operationalScore: Math.min(100, prev.operationalScore + 10)
              }));
            } else {
              npcResponse = "Le PDG a approuvé le recours à des experts externes. Le contrat avec CyberDefense+ a été signé en urgence et leur équipe sera sur site dans 90 minutes. Ils assisteront l'équipe interne et reporteront directement à vous.";
              // Fort impact financier mais très positif sur l'opérationnel
              setGameState(prev => ({
                ...prev, 
                financialImpact: prev.financialImpact + 80,
                operationalScore: Math.min(100, prev.operationalScore + 20),
                stressLevel: Math.max(0, prev.stressLevel - 15)
              }));
            }
          }
          
          if (npcResponse) {
            setCommunicationHistory(prev => ({
              ...prev,
              [selectedContact]: [
                ...prev[selectedContact],
                { sender: 'npc', message: npcResponse }
              ]
            }));
          }
        }, 1500);
        
        // Sortir tôt de la fonction si c'était une sélection de choix
        setIsSendingMessage(false);
        return;
      }
    }
    
    try {
      // Préparer les données du jeu pour l'API
      const gameStateData = {
        phase: gameState.activePhase,
        currentTime: gameState.currentTime,
        operationalScore: gameState.operationalScore,
        reputationScore: gameState.reputationScore,
        legalRisk: gameState.legalRisk,
        stressLevel: gameState.stressLevel,
        eventLog: gameState.eventLog.slice(-3)
      };
      
      // Envoyer la requête à l'API
      const response = await fetch('/api/cyberchaos/npc-interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactType: selectedContact,
          message: messageCopy,
          gameState: gameStateData
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Ajouter la réponse du PNJ à l'historique de communication
      setCommunicationHistory(prev => ({
        ...prev,
        [selectedContact]: [
          ...prev[selectedContact],
          { sender: 'npc', message: data.response }
        ]
      }));
    } catch (error) {
      console.error("Erreur lors de l'interaction avec le PNJ:", error);
      
      // En cas d'erreur, fournir une réponse contextuelle de secours basée sur l'état actuel du jeu
      let fallbackResponse = "";
      
      if (selectedContact === 'Presse') {
        fallbackResponse = gameState.reputationScore < 50 
          ? "Je vois que votre organisation traverse une crise majeure. Nos sources indiquent que la situation est plus grave que ce que vous admettez. Pouvez-vous commenter?"
          : "Merci pour ces informations. J'aimerais obtenir davantage de détails sur les mesures que vous prenez pour protéger vos clients à l'avenir.";
      } else if (selectedContact === 'Autorités') {
        fallbackResponse = gameState.legalRisk > 50
          ? "Nous avons reçu des rapports inquiétants concernant la violation potentielle de données personnelles. Vous devez nous fournir un rapport détaillé dans les 72 heures conformément au RGPD."
          : "Merci pour votre coopération. Nous vous demandons de continuer à partager toute information pertinente concernant cette cyberattaque.";
      } else if (selectedContact === 'Communication') {
        fallbackResponse = "Notre équipe a préparé un projet de communiqué basé sur vos directives. Souhaitez-vous le réviser avant publication sur notre intranet et les réseaux sociaux?";
      } else if (selectedContact === 'Équipe technique') {
        fallbackResponse = gameState.operationalScore < 60
          ? "La situation se dégrade. Nous avons détecté de nouvelles activités suspectes sur les serveurs de backup. Nous avons besoin d'une autorisation pour isoler complètement ces systèmes également."
          : "Nous avons mis en place les mesures demandées. Les premiers résultats sont encourageants, mais nous aurons besoin de ressources supplémentaires pour terminer l'analyse forensique.";
      } else {
        fallbackResponse = "Le conseil d'administration se réunit en session extraordinaire dans une heure. Ils attendent un rapport préliminaire de votre part concernant l'impact financier et réputationnel de cet incident.";
      }
      
      setCommunicationHistory(prev => ({
        ...prev,
        [selectedContact]: [
          ...prev[selectedContact],
          { sender: 'npc', message: fallbackResponse }
        ]
      }));
    } finally {
      setIsSendingMessage(false);
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowCommunicationPanel(!showCommunicationPanel)}
                      className="hover:bg-blue-800/50 text-cyan-300 border-cyan-300/50"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Communications
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
            
            {/* Panneau de communication avec les PNJ */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="bg-gray-900/80 border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-300" />
                      Centre de Communication
                    </span>
                    {/* Indicateur de demandes urgentes */}
                    {Object.values(pendingRequests).some(pending => pending) && (
                      <Badge variant="destructive" className="animate-pulse">
                        Demandes urgentes! <AlarmClock className="h-3 w-3 ml-1" />
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-hidden">
                    <div className="grid grid-cols-1 divide-y divide-blue-800/50">
                      {/* Carte de contact pour chaque PNJ */}
                      {Object.keys(pendingRequests).map((contact) => (
                        <div 
                          key={contact}
                          onClick={() => handleContactSelect(contact)}
                          className={`cursor-pointer p-3 hover:bg-blue-800/20 transition-colors ${
                            selectedContact === contact ? 'bg-blue-800/30' : ''
                          } ${
                            pendingRequests[contact] ? 'border-l-4 border-l-red-500' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {contact === 'Presse' && <Newspaper className="h-5 w-5 text-cyan-300" />}
                              {contact === 'Autorités' && <Shield className="h-5 w-5 text-amber-300" />}
                              {contact === 'Communication' && <MessageCircle className="h-5 w-5 text-green-300" />}
                              {contact === 'Équipe technique' && <Laptop className="h-5 w-5 text-blue-300" />}
                              {contact === 'Direction' && <Building className="h-5 w-5 text-purple-300" />}
                              <span className="font-medium">{contact}</span>
                            </div>
                            {pendingRequests[contact] && (
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={`${
                                    requestTimers[contact] < 60 
                                      ? "bg-red-900/70 text-red-100 border-red-500 animate-pulse"
                                      : requestTimers[contact] < 120
                                        ? "bg-amber-900/50 text-amber-100 border-amber-500 animate-pulse"
                                        : "bg-red-900/40 text-red-200 border-red-500"
                                  }`}
                                >
                                  <AlarmClock className="h-3 w-3 mr-1" /> 
                                  {Math.floor(requestTimers[contact] / 60)}:{(requestTimers[contact] % 60).toString().padStart(2, '0')}
                                </Badge>
                              </div>
                            )}
                          </div>
                          {pendingRequests[contact] && (
                            <p className={`text-sm mt-1 ${
                              requestTimers[contact] < 60 
                                ? "text-red-300 font-semibold" 
                                : requestTimers[contact] < 120 
                                  ? "text-amber-300"
                                  : "text-red-300"
                            }`}>
                              {requestTimers[contact] < 60 
                                ? "URGENT: Décision requise immédiatement!" 
                                : requestTimers[contact] < 120 
                                  ? "Décision à prendre rapidement."
                                  : "Demande une décision urgente."}
                            </p>
                          )}
                          {!pendingRequests[contact] && communicationHistory[contact].length > 0 && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                              {communicationHistory[contact][communicationHistory[contact].length - 1].sender === 'npc' 
                                ? communicationHistory[contact][communicationHistory[contact].length - 1].message
                                : "Vous: " + communicationHistory[contact][communicationHistory[contact].length - 1].message
                              }
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Panneau de conversation avec le PNJ sélectionné */}
              {selectedContact && (
                <Card className="bg-gray-900/80 border-blue-800 max-h-[500px] flex flex-col">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-blue-800/50">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      {selectedContact === 'Presse' && <Newspaper className="h-5 w-5 text-cyan-300" />}
                      {selectedContact === 'Autorités' && <Shield className="h-5 w-5 text-amber-300" />}
                      {selectedContact === 'Communication' && <MessageCircle className="h-5 w-5 text-green-300" />}
                      {selectedContact === 'Équipe technique' && <Laptop className="h-5 w-5 text-blue-300" />}
                      {selectedContact === 'Direction' && <Building className="h-5 w-5 text-purple-300" />}
                      {selectedContact}
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedContact(null)}
                      className="h-7 w-7 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="flex-grow overflow-y-auto p-3">
                    <div className="space-y-4">
                      {/* Messages */}
                      {communicationHistory[selectedContact].map((msg, index) => (
                        <div 
                          key={index} 
                          className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.sender === 'player' 
                              ? 'bg-blue-700 text-white' 
                              : msg.needsResponse 
                                ? 'bg-amber-900/80 text-white border border-amber-500/50' 
                                : 'bg-gray-800 text-white'
                            }`}
                          >
                            {msg.sender === 'npc' && msg.needsResponse && (
                              <div className="flex items-center mb-2 gap-2">
                                <Badge variant="outline" className="bg-amber-950 text-amber-100 border-amber-500">
                                  <AlarmClock className="h-3 w-3 mr-1" /> Réponse requise
                                </Badge>
                              </div>
                            )}
                            <p className="break-words whitespace-pre-wrap">{msg.message}</p>
                            
                            {/* Boutons de choix pour les messages qui nécessitent une réponse */}
                            {msg.sender === 'npc' && msg.needsResponse && msg.choices && (
                              <div className="mt-3 space-y-2">
                                {msg.choices.map((choice, choiceIndex) => (
                                  <Button
                                    key={choiceIndex}
                                    variant="outline"
                                    className="w-full justify-start text-left border-blue-500 hover:bg-blue-900/50 text-sm"
                                    onClick={() => {
                                      // Répondre avec le choix sélectionné
                                      setNewMessage(choice);
                                      setTimeout(() => {
                                        // Fournir un délai pour permettre à l'état de se mettre à jour
                                        sendMessageToPNJ();
                                      }, 100);
                                    }}
                                  >
                                    {choice}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-3 pt-0 border-t border-blue-800/50">
                    <div className="flex w-full gap-2">
                      <Textarea 
                        placeholder="Tapez votre message..."
                        className="flex-1 min-h-10 resize-none bg-gray-800/50"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessageToPNJ();
                          }
                        }}
                        disabled={isSendingMessage}
                      />
                      <Button 
                        variant="outline" 
                        onClick={sendMessageToPNJ}
                        disabled={isSendingMessage || !newMessage.trim()}
                        className="h-auto border-blue-500 hover:bg-blue-800/50"
                      >
                        {isSendingMessage ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )}
              
              {/* Événement en cours - affiché en plus des PNJ */}
              {gameState.currentEvent && (
                <Card className="bg-gray-900/80 border-blue-800 border-l-4 border-l-amber-500">
                  <CardHeader className="pb-2">
                    <Badge variant="outline" className="w-fit mb-2 border-amber-400 text-amber-300">
                      Événement en cours
                    </Badge>
                    <CardTitle className="text-lg font-medium flex items-center gap-2 overflow-hidden">
                      <span className="flex-shrink-0">
                        {gameState.currentEvent.source === 'technical' ? <Shield className="h-5 w-5" /> :
                         gameState.currentEvent.source === 'internal' ? <Users className="h-5 w-5" /> :
                         gameState.currentEvent.source === 'external' ? <Building className="h-5 w-5" /> :
                         <AlertCircle className="h-5 w-5" />
                        }
                      </span>
                      <span className="truncate">{gameState.currentEvent.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4 break-words whitespace-pre-wrap overflow-auto max-h-24 hover:max-h-full transition-all duration-200">{gameState.currentEvent.description}</p>
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
                        <div className="flex flex-col">
                          <p className="text-xs text-blue-300 font-mono">T+{formatGameTime(entry.time)}</p>
                          <p className="text-sm mt-1 break-words overflow-hidden text-ellipsis whitespace-normal line-clamp-2 hover:line-clamp-none">{entry.event}</p>
                          {entry.decision && (
                            <p className="text-xs text-gray-400 mt-1 italic overflow-hidden text-ellipsis whitespace-normal line-clamp-1 hover:line-clamp-none">{entry.decision}</p>
                          )}
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
      
      {/* Panneau de communication */}
      {showCommunicationPanel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-b from-blue-900 to-gray-900 rounded-lg shadow-xl border border-blue-700 w-full max-w-4xl overflow-hidden"
          >
            <div className="p-4 border-b border-blue-800 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                Communications de crise
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCommunicationPanel(false)}
                className="text-blue-300 hover:text-white hover:bg-blue-800"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-4 h-[600px]">
              {/* Liste des contacts */}
              <div className="border-r border-blue-800 p-4 space-y-2">
                <h4 className="text-sm font-medium text-blue-300 mb-4">Contacts</h4>
                
                {Object.keys(communicationHistory).map((contact) => (
                  <Button 
                    key={contact}
                    variant={selectedContact === contact ? "default" : "outline"}
                    onClick={() => handleContactSelect(contact)}
                    className={`w-full justify-start ${
                      selectedContact === contact 
                        ? "bg-blue-800 hover:bg-blue-700" 
                        : "border-blue-700 text-blue-200 hover:bg-blue-900/50"
                    }`}
                  >
                    {contact === 'Presse' ? <Newspaper className="mr-2 h-4 w-4" /> :
                     contact === 'Autorités' ? <ShieldAlert className="mr-2 h-4 w-4" /> :
                     contact === 'Communication' ? <MessageCircle className="mr-2 h-4 w-4" /> :
                     contact === 'Équipe technique' ? <Laptop className="mr-2 h-4 w-4" /> :
                     <Users className="mr-2 h-4 w-4" />
                    }
                    {contact}
                    {communicationHistory[contact].length > 0 && (
                      <Badge 
                        variant="outline" 
                        className="ml-auto border-blue-500 text-blue-200"
                      >
                        {communicationHistory[contact].length}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
              
              {/* Zone de conversation */}
              <div className="col-span-3 flex flex-col h-full">
                {selectedContact ? (
                  <>
                    {/* En-tête du contact */}
                    <div className="p-3 border-b border-blue-800 bg-blue-900/50">
                      <div className="flex items-center gap-2">
                        {selectedContact === 'Presse' ? <Newspaper className="h-5 w-5 text-blue-300" /> :
                         selectedContact === 'Autorités' ? <ShieldAlert className="h-5 w-5 text-amber-300" /> :
                         selectedContact === 'Communication' ? <MessageCircle className="h-5 w-5 text-green-300" /> :
                         selectedContact === 'Équipe technique' ? <Laptop className="h-5 w-5 text-cyan-300" /> :
                         <Users className="h-5 w-5 text-purple-300" />
                        }
                        <h3 className="font-medium">{selectedContact}</h3>
                      </div>
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {communicationHistory[selectedContact].length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-blue-300/70">
                          <MessageSquare className="h-12 w-12 mb-2" />
                          <p>Aucun message. Commencez la conversation.</p>
                        </div>
                      ) : (
                        communicationHistory[selectedContact].map((msg, idx) => (
                          <div 
                            key={idx} 
                            className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[80%] p-3 rounded-lg ${
                                msg.sender === 'player' 
                                  ? 'bg-blue-800 text-white' 
                                  : 'bg-gray-800 text-blue-100'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {/* Zone de saisie */}
                    <div className="p-3 border-t border-blue-800 bg-gray-900/80">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Entrez votre message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessageToPNJ();
                            }
                          }}
                          className="bg-gray-800 border-blue-700 focus-visible:ring-blue-500"
                        />
                        <Button 
                          onClick={sendMessageToPNJ}
                          disabled={isSendingMessage || !newMessage.trim()}
                          className="bg-blue-700 hover:bg-blue-600"
                        >
                          {isSendingMessage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-blue-300/70">
                    <MessageSquare className="h-16 w-16 mb-4" />
                    <p className="text-lg">Sélectionnez un contact pour communiquer</p>
                    <p className="text-sm mt-2 max-w-md text-center">
                      Échangez avec les différentes parties prenantes pour gérer la crise plus efficacement.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
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