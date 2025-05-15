import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdArrowBack, IoMdSend, IoMdInformationCircleOutline } from 'react-icons/io';
import { 
  Shield, Clock, AlertTriangle, Terminal, CheckCircle, XCircle, 
  User, Users, ServerCrash, Zap, Database, Lock, Unlock, BriefcaseBusiness
} from 'lucide-react';
import { BsShieldLock, BsGear } from 'react-icons/bs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import OpenAIStatusIndicator from '@/components/OpenAIStatusIndicator';

// Types pour le jeu
type GameRole = 'DSI' | 'RSSI' | 'DG' | 'Juriste' | 'Communication' | 'Expert Forensic';

type PlayerInfo = {
  id: string;
  name: string;
  role: GameRole;
  isAI: boolean;
};

type GameMetrics = {
  integrity: number;
  availability: number;
  compliance: number;
  cost: number;
  trust: number;
};

type GameMessage = {
  id: string;
  sender: string;
  senderRole: GameRole | 'System';
  content: string;
  timestamp: number;
  isAI: boolean;
  isSystem: boolean;
  isChoice?: boolean;
  choices?: Array<{
    id: string;
    text: string;
    targetRole?: GameRole;
  }>;
  selectedChoice?: string;
};

type GameState = {
  status: 'setup' | 'playing' | 'completed';
  currentTurn: number;
  totalTurns: 6;
  messages: GameMessage[];
  players: PlayerInfo[];
  metrics: GameMetrics;
  waitingForPlayer?: string;
  timestamp: number;
  startTime?: number;
};

// Constantes
const ROLES: GameRole[] = ['DSI', 'RSSI', 'DG', 'Juriste', 'Communication', 'Expert Forensic'];

const ROLE_DESCRIPTIONS = {
  'DSI': 'Responsable de l\'infrastructure IT et de la disponibilité des systèmes.',
  'RSSI': 'Expert en sécurité chargé de la protection du SI et de la réponse aux incidents.',
  'DG': 'Prend les décisions stratégiques et gère la crise à haut niveau.',
  'Juriste': 'Conseille sur les aspects légaux, RGPD et obligations de notification.',
  'Communication': 'Gère les communications internes et externes en situation de crise.',
  'Expert Forensic': 'Spécialiste en investigation numérique et analyse des attaques.'
};

const ROLE_ICONS = {
  'DSI': <Terminal className="h-5 w-5" />,
  'RSSI': <Shield className="h-5 w-5" />,
  'DG': <BriefcaseBusiness className="h-5 w-5" />,
  'Juriste': <Users className="h-5 w-5" />,
  'Communication': <User className="h-5 w-5" />,
  'Expert Forensic': <Database className="h-5 w-5" />,
  'System': <ServerCrash className="h-5 w-5" />
};

// Fonctions utilitaires
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Formatter le temps écoulé en HH:MM:SS
const formatElapsedTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Composant principal
export default function CryptoLockGame() {
  const [, setLocation] = useLocation();
  const [game, setGame] = useState<GameState>({
    status: 'setup',
    currentTurn: 0,
    totalTurns: 6,
    messages: [],
    players: [],
    metrics: {
      integrity: 100,
      availability: 100,
      compliance: 100,
      cost: 100,
      trust: 100
    },
    timestamp: Date.now(),
  });
  
  const [playerName, setPlayerName] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<GameRole | ''>('');
  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(1);
  const [setupStep, setSetupStep] = useState<number>(1);
  const [currentPlayerSetup, setCurrentPlayerSetup] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [messageInput, setMessageInput] = useState<string>('');
  const [showExitDialog, setShowExitDialog] = useState<boolean>(false);
  const [showGameOverDialog, setShowGameOverDialog] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  
  // Effet pour mettre à jour le compteur de temps toutes les secondes
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (game.status === 'playing' && game.startTime) {
      intervalId = setInterval(() => {
        setElapsedTime(Date.now() - game.startTime!);
      }, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [game.status, game.startTime]);
  
  // Défilement automatique des messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [game.messages]);
  
  // Fonction pour ajouter un message système
  const addSystemMessage = (content: string, isChoice: boolean = false, choices: any[] = []) => {
    setGame(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: generateId(),
          sender: 'Système',
          senderRole: 'System',
          content,
          timestamp: Date.now(),
          isAI: false,
          isSystem: true,
          isChoice,
          choices
        }
      ]
    }));
  };
  
  // Fonction pour ajouter un message de l'IA (simulant un rôle spécifique)
  const addAIMessage = (role: GameRole, content: string) => {
    // Trouver le joueur AI avec ce rôle
    const aiPlayer = game.players.find(p => p.role === role && p.isAI);
    if (!aiPlayer) return;
    
    setGame(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: generateId(),
          sender: aiPlayer.name,
          senderRole: role,
          content,
          timestamp: Date.now(),
          isAI: true,
          isSystem: false
        }
      ]
    }));
  };
  
  // Fonction pour gérer les réponses des joueurs
  const handlePlayerMessage = async () => {
    if (!messageInput.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    // Ajouter le message du joueur
    const humanPlayer = game.players.find(p => !p.isAI);
    if (!humanPlayer) {
      setIsProcessing(false);
      return;
    }
    
    const newMessage: GameMessage = {
      id: generateId(),
      sender: humanPlayer.name,
      senderRole: humanPlayer.role,
      content: messageInput,
      timestamp: Date.now(),
      isAI: false,
      isSystem: false
    };
    
    setGame(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
    
    setMessageInput('');
    
    // Simuler une réponse de l'IA
    setTimeout(async () => {
      try {
        // Déterminer quel membre d'équipe IA répond en fonction du contexte
        // Pour cet exemple, nous simulons des réponses prédéfinies
        
        // Progression du jeu - réponses adaptées au tour actuel
        if (game.currentTurn === 0) {
          // Afficher un message système à propos de l'alerte
          addSystemMessage(`⚠️ **Alerte de sécurité détectée** ⚠️

Plusieurs utilisateurs signalent l'impossibilité d'accéder à leurs fichiers. Un message de rançon s'affiche sur certains écrans. Le système de monitoring détecte une activité anormale sur le réseau.`);
          
          // Simuler des réponses d'équipe
          setTimeout(() => {
            // L'IA joue le rôle du DSI si non pris par un humain
            if (!game.players.some(p => p.role === 'DSI' && !p.isAI)) {
              addAIMessage('DSI', "Je viens de recevoir plusieurs alertes du système de surveillance. Des postes de travail et certains serveurs de fichiers semblent inaccessibles. Les premiers rapports suggèrent un ransomware. Que devons-nous faire immédiatement ?");
            }
            
            // Ajouter une réponse de l'expert forensic après quelques secondes
            setTimeout(() => {
              if (!game.players.some(p => p.role === 'Expert Forensic' && !p.isAI)) {
                addAIMessage('Expert Forensic', "J'ai commencé l'analyse des logs. Il semble que l'attaque ait débuté il y a environ 3 heures. Je détecte des connexions suspectes sur les VPN. Procédons à une collecte des IOCs.");
              }
            }, 2000);
            
            // Ajouter une réponse du RSSI après quelques secondes de plus
            setTimeout(() => {
              if (!game.players.some(p => p.role === 'RSSI' && !p.isAI)) {
                addAIMessage('RSSI', "Les procédures de crise doivent être activées immédiatement. Nous devons prendre une décision concernant l'isolation du réseau pour limiter la propagation.");
              }
              
              // Après les messages de l'équipe, passer au tour suivant avec des choix
              setTimeout(() => {
                // Mise à jour du tour
                setGame(prev => ({
                  ...prev,
                  currentTurn: prev.currentTurn + 1
                }));
                
                // Deuxième tour - décision de confinement
                addSystemMessage(`**Tour 2: Confinement**

La propagation du ransomware continue. Des décisions de confinement doivent être prises rapidement pour limiter les dégâts.`, true, [
                  { id: "isolate-all", text: "Isoler complètement le réseau (impact majeur sur les opérations)" },
                  { id: "isolate-affected", text: "Isoler uniquement les systèmes affectés (risque de propagation)" },
                  { id: "continue-monitoring", text: "Continuer à surveiller sans isoler (risque très élevé)" }
                ]);
                
                // Simuler un impact sur les métriques
                setGame(prev => ({
                  ...prev,
                  metrics: {
                    ...prev.metrics,
                    integrity: prev.metrics.integrity - 15,
                    availability: prev.metrics.availability - 20
                  }
                }));
              }, 3000);
            }, 4000);
          }, 1000);
        } else if (game.currentTurn > 3) {
          // Tours plus avancés - simulation d'événements dynamiques
          const dynamicEvents = [
            "Une nouvelle variante du ransomware a été détectée sur les serveurs de sauvegarde.",
            "Les attaquants ont contacté le PDG personnellement par téléphone.",
            "Certains fichiers critiques semblent avoir été modifiés avant le chiffrement.",
            "Des médias ont contacté le service de communication pour un commentaire."
          ];
          
          // Choisir un événement aléatoire
          const randomEvent = dynamicEvents[Math.floor(Math.random() * dynamicEvents.length)];
          addSystemMessage(`**Développement critique**\n\n${randomEvent}`);
          
          // Ajouter une réponse IA correspondante
          setTimeout(() => {
            if (!game.players.some(p => p.role === 'DG' && !p.isAI)) {
              addAIMessage('DG', "La situation évolue rapidement. Nous devons adapter notre stratégie en conséquence. Quelles sont vos recommandations ?");
            }
          }, 2000);
          
          // Si c'est le dernier tour, préparer la fin du jeu
          if (game.currentTurn >= 5) {
            setTimeout(() => {
              addSystemMessage("**Phase finale de la crise**\n\nLes 72 heures sont presque écoulées. Des décisions finales doivent être prises.");
              
              setTimeout(() => {
                setShowGameOverDialog(true);
                setGame(prev => ({
                  ...prev,
                  status: 'completed'
                }));
              }, 5000);
            }, 7000);
          } else {
            // Avancer au tour suivant
            setGame(prev => ({
              ...prev,
              currentTurn: prev.currentTurn + 1
            }));
          }
        }
        
      } catch (error) {
        console.error("Erreur lors de la communication avec l'IA:", error);
        addSystemMessage("Une erreur s'est produite lors de la communication avec le système. Veuillez réessayer.");
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };
  
  // Gérer la sélection de choix par le joueur
  const handleChoiceSelection = (choiceId: string) => {
    // Trouver le message de choix actuel
    const choiceMessage = game.messages.find(m => m.isChoice && !m.selectedChoice);
    if (!choiceMessage) return;
    
    // Mettre à jour le choix
    setGame(prev => ({
      ...prev,
      messages: prev.messages.map(m => 
        m.id === choiceMessage.id 
          ? { ...m, selectedChoice: choiceId } 
          : m
      )
    }));
    
    // Simuler la conséquence du choix (après un court délai)
    setTimeout(() => {
      if (choiceId === 'isolate-all') {
        addSystemMessage("Vous avez choisi d'isoler complètement le réseau. L'entreprise est à l'arrêt, mais la propagation du ransomware est stoppée.");
        setGame(prev => ({
          ...prev,
          metrics: {
            ...prev.metrics,
            availability: prev.metrics.availability - 30,
            integrity: prev.metrics.integrity + 10,
            cost: prev.metrics.cost - 25
          },
          currentTurn: prev.currentTurn + 1
        }));
      } else if (choiceId === 'isolate-affected') {
        addSystemMessage("Vous avez choisi d'isoler uniquement les systèmes affectés. Certaines opérations continuent, mais il y a un risque de propagation.");
        setGame(prev => ({
          ...prev,
          metrics: {
            ...prev.metrics,
            availability: prev.metrics.availability - 15,
            integrity: prev.metrics.integrity - 10
          },
          currentTurn: prev.currentTurn + 1
        }));
      } else if (choiceId === 'continue-monitoring') {
        addSystemMessage("Vous avez choisi de continuer à surveiller sans isoler. Le ransomware continue à se propager rapidement à travers le réseau !");
        setGame(prev => ({
          ...prev,
          metrics: {
            ...prev.metrics,
            integrity: prev.metrics.integrity - 40,
            trust: prev.metrics.trust - 20
          },
          currentTurn: prev.currentTurn + 1
        }));
      }
      
      // Afficher un message de progression vers le prochain tour après un délai
      setTimeout(() => {
        const nextTurn = game.currentTurn + 1;
        if (nextTurn <= game.totalTurns) {
          addSystemMessage(`Progression vers le tour ${nextTurn}/${game.totalTurns} - Des développements importants se produisent...`);
          
          // Si nous sommes au tour 2, programmer les choix du tour 3
          if (nextTurn === 3) {
            setTimeout(() => {
              addSystemMessage(`**Tour 3: Communication**

La crise est maintenant connue des employés et des partenaires. Une stratégie de communication doit être définie.`, true, [
                { id: "comm-transparent", text: "Communication transparente immédiate (risque de panique, mais rassure les parties prenantes)" },
                { id: "comm-limited", text: "Communication limitée aux autorités et personnes clés (contrôle du message)" },
                { id: "comm-delay", text: "Retarder toute communication externe (gain de temps mais risque de fuites)" }
              ]);
            }, 3000);
          }
        }
      }, 2000);
    }, 1000);
  };
  
  // Démarrer le jeu avec les joueurs configurés
  const startGame = () => {
    if (game.players.length === 0) {
      toast({
        title: "Erreur de configuration",
        description: "Veuillez ajouter au moins un joueur pour commencer.",
        variant: "destructive"
      });
      return;
    }
    
    setGame(prev => ({
      ...prev,
      status: 'playing',
      startTime: Date.now()
    }));
    
    // Message d'introduction
    addSystemMessage(`🎮 **CryptoLock - 72H de Tension** 🎮

Lundi, 7h58.

Les premiers employés ouvrent leurs ordinateurs. Quelques secondes plus tard, les premiers appels tombent.

"Je n'arrive plus à accéder à mes fichiers..."

Une fenêtre rouge s'ouvre sur les écrans : 🔒 "Vos fichiers ont été chiffrés. Payez 3 bitcoins dans les 72h. Chaque heure compte."

Le réseau ralentit. Les sauvegardes sont inaccessibles.

La panique monte. Vous êtes la cellule de crise. Chaque décision comptera.`);
    
    // Focus sur l'input de message
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 500);
  };
  
  // Gérer la configuration des joueurs
  const handlePlayerSetup = () => {
    if (!playerName.trim() || !selectedRole) {
      toast({
        title: "Information manquante",
        description: "Veuillez entrer un nom et sélectionner un rôle.",
        variant: "destructive"
      });
      return;
    }
    
    // Créer le joueur humain
    const newPlayer: PlayerInfo = {
      id: generateId(),
      name: playerName,
      role: selectedRole as GameRole,
      isAI: false
    };
    
    // Ajouter le joueur à la liste
    setGame(prev => ({
      ...prev,
      players: [...prev.players, newPlayer]
    }));
    
    // Si tous les joueurs humains sont configurés, générer les joueurs IA pour les rôles restants
    if (currentPlayerSetup >= numberOfPlayers) {
      const assignedRoles = new Set(game.players.map(p => p.role).concat(selectedRole as GameRole));
      
      // Créer des joueurs IA pour les rôles non assignés
      const aiPlayers: PlayerInfo[] = ROLES
        .filter(role => !assignedRoles.has(role))
        .map(role => ({
          id: generateId(),
          name: `IA-${role}`,
          role,
          isAI: true
        }));
      
      // Ajouter les joueurs IA
      setGame(prev => ({
        ...prev,
        players: [...prev.players, ...aiPlayers]
      }));
      
      // Passer à l'étape suivante
      setSetupStep(3);
    } else {
      // Passer au joueur humain suivant
      setCurrentPlayerSetup(prev => prev + 1);
      setPlayerName('');
      setSelectedRole('');
    }
  };
  
  // Rendu des indicateurs de métriques
  const renderMetrics = () => {
    return (
      <div className="grid grid-cols-5 gap-2 mt-4">
        <MetricIndicator 
          label="Intégrité" 
          value={game.metrics.integrity} 
          icon={<Lock className="h-4 w-4" />} 
          color="cyan"
        />
        <MetricIndicator 
          label="Disponibilité" 
          value={game.metrics.availability} 
          icon={<ServerCrash className="h-4 w-4" />} 
          color="blue"
        />
        <MetricIndicator 
          label="Conformité" 
          value={game.metrics.compliance} 
          icon={<CheckCircle className="h-4 w-4" />} 
          color="purple"
        />
        <MetricIndicator 
          label="Coût" 
          value={game.metrics.cost} 
          icon={<BsGear className="h-4 w-4" />} 
          color="amber"
        />
        <MetricIndicator 
          label="Confiance" 
          value={game.metrics.trust} 
          icon={<Users className="h-4 w-4" />} 
          color="green"
        />
      </div>
    );
  };
  
  // Composant pour les indicateurs de métriques
  const MetricIndicator = ({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) => {
    // Définir des classes de couleur statiques par couleur au lieu de dynamiques
    const getColorClass = () => {
      const colorMap: Record<string, { bg: string, text: string }> = {
        'cyan': { 
          bg: value > 66 ? 'bg-cyan-500' : value > 33 ? 'bg-cyan-600' : 'bg-cyan-800',
          text: 'text-cyan-400'
        },
        'blue': { 
          bg: value > 66 ? 'bg-blue-500' : value > 33 ? 'bg-blue-600' : 'bg-blue-800',
          text: 'text-blue-400'
        },
        'purple': { 
          bg: value > 66 ? 'bg-purple-500' : value > 33 ? 'bg-purple-600' : 'bg-purple-800',
          text: 'text-purple-400'
        },
        'amber': { 
          bg: value > 66 ? 'bg-amber-500' : value > 33 ? 'bg-amber-600' : 'bg-amber-800',
          text: 'text-amber-400'
        },
        'green': { 
          bg: value > 66 ? 'bg-green-500' : value > 33 ? 'bg-green-600' : 'bg-green-800',
          text: 'text-green-400'
        },
      };
      return colorMap[color] || { bg: 'bg-slate-500', text: 'text-slate-400' };
    };
    
    const colorClass = getColorClass();
    
    return (
      <div className="flex flex-col items-center bg-slate-900/60 p-2 rounded-md border border-slate-800">
        <div className="flex items-center gap-1 text-xs text-slate-300 mb-1">
          <span className={colorClass.text}>{icon}</span>
          <span>{label}</span>
        </div>
        <Progress 
          value={value} 
          className={`h-1.5 w-full ${colorClass.bg}`}
        />
        <span className={`text-xs font-bold mt-1 ${colorClass.text}`}>{value}%</span>
      </div>
    );
  };
  
  // Rendu de l'écran de configuration (setup)
  const renderSetup = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-950 flex flex-col">
        <header className="p-4 bg-slate-900/80 border-b border-cyan-900 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto flex justify-between items-center">
            <Button
              variant="ghost"
              className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/50"
              onClick={() => setLocation('/cyber/crisis-management')}
            >
              <IoMdArrowBack className="mr-2 h-5 w-5" />
              Retour
            </Button>
            
            <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
              <h1 className="text-2xl font-cyber font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                CryptoLock
              </h1>
              <p className="text-xs font-cyber-accent text-cyan-500">72H DE TENSION</p>
            </div>
            
            <OpenAIStatusIndicator position="in-header" />
          </div>
        </header>
        
        <main className="flex-1 container mx-auto p-6 max-w-4xl">
          <Card className="bg-slate-900/60 border border-cyan-900/50 text-white shadow-xl">
            <CardHeader className="border-b border-cyan-900/30 bg-gradient-to-r from-slate-900 to-cyan-950">
              <CardTitle className="text-2xl font-cyber-title text-cyan-400">
                Configuration de la Simulation
              </CardTitle>
              <CardDescription className="text-slate-300">
                Préparez votre équipe pour faire face à une attaque par ransomware
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6">
              {setupStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-xl font-semibold text-cyan-400 mb-4">
                    Nombre de joueurs
                  </h2>
                  <p className="mb-4 text-slate-300">
                    Combien de personnes vont participer à cette simulation ? 
                    Les rôles non attribués seront joués par l'intelligence artificielle.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 my-6">
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <Button
                        key={num}
                        variant={numberOfPlayers === num ? "default" : "outline"}
                        className={numberOfPlayers === num 
                          ? "bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-500" 
                          : "border-slate-700 text-slate-300 hover:border-cyan-700"
                        }
                        onClick={() => setNumberOfPlayers(num)}
                      >
                        {num} {num === 1 ? 'joueur' : 'joueurs'}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button 
                      onClick={() => setSetupStep(2)}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                      Suivant
                    </Button>
                  </div>
                </motion.div>
              )}
              
              {setupStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-xl font-semibold text-cyan-400 mb-4">
                    Configuration du joueur {currentPlayerSetup}
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Nom du joueur
                      </label>
                      <Input
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Entrez votre nom"
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Rôle
                      </label>
                      <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as GameRole)}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                          <SelectValue placeholder="Sélectionnez un rôle" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                          {ROLES
                            .filter(role => !game.players.some(p => p.role === role))
                            .map(role => (
                              <SelectItem key={role} value={role} className="cursor-pointer">
                                <div className="flex items-center gap-2">
                                  {ROLE_ICONS[role]}
                                  <span>{role}</span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      
                      {selectedRole && (
                        <p className="mt-2 text-sm text-slate-400">
                          {ROLE_DESCRIPTIONS[selectedRole]}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setSetupStep(1)}
                      className="border-slate-700 text-slate-300 hover:border-cyan-700"
                    >
                      Retour
                    </Button>
                    <Button 
                      onClick={handlePlayerSetup}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                      {currentPlayerSetup >= numberOfPlayers ? 'Terminer' : 'Joueur suivant'}
                    </Button>
                  </div>
                </motion.div>
              )}
              
              {setupStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-xl font-semibold text-cyan-400 mb-4">
                    Récapitulatif de la configuration
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-800/50 rounded-md border border-slate-700">
                      <h3 className="text-md font-medium text-slate-300 mb-2">
                        Joueurs ({game.players.length})
                      </h3>
                      <div className="space-y-2">
                        {game.players.map(player => (
                          <div 
                            key={player.id} 
                            className={`flex items-center gap-2 p-2 rounded-md ${
                              player.isAI ? 'bg-slate-800' : 'bg-cyan-900/30'
                            }`}
                          >
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              player.isAI ? 'bg-slate-700' : 'bg-cyan-700'
                            }`}>
                              {ROLE_ICONS[player.role]}
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                {player.name}
                              </div>
                              <div className="text-xs text-slate-400 flex items-center">
                                {player.role}
                                {player.isAI && (
                                  <Badge variant="outline" className="ml-2 bg-purple-900/50 border-purple-700 text-xs">
                                    IA
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-slate-800/50 rounded-md border border-slate-700">
                      <h3 className="text-md font-medium text-slate-300 mb-2">
                        Scénario
                      </h3>
                      <p className="text-sm text-slate-400">
                        CryptoLock - 72H de Tension. Votre entreprise vient d'être touchée par une attaque de ransomware. 
                        Vos fichiers sont chiffrés et les attaquants demandent une rançon. 
                        Vous devez gérer cette crise en 6 tours de jeu représentant 72 heures critiques.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-slate-800/50 rounded-md border border-slate-700">
                      <h3 className="text-md font-medium text-slate-300 mb-2">
                        Objectifs
                      </h3>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li className="flex items-start">
                          <span className="text-cyan-500 mr-2">•</span>
                          <span>Contenir la propagation du ransomware</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-cyan-500 mr-2">•</span>
                          <span>Restaurer les services critiques</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-cyan-500 mr-2">•</span>
                          <span>Assurer la conformité légale (RGPD, notifications)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-cyan-500 mr-2">•</span>
                          <span>Gérer la communication de crise</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-cyan-500 mr-2">•</span>
                          <span>Minimiser l'impact financier et sur la réputation</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSetupStep(2);
                        setCurrentPlayerSetup(numberOfPlayers);
                        // Retirer les joueurs IA
                        setGame(prev => ({
                          ...prev,
                          players: prev.players.filter(p => !p.isAI)
                        }));
                      }}
                      className="border-slate-700 text-slate-300 hover:border-cyan-700"
                    >
                      Retour
                    </Button>
                    <Button 
                      onClick={startGame}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Démarrer la simulation
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  };
  
  // Rendu du jeu en cours
  const renderPlayingGame = () => {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white">
        {/* Header avec info session */}
        <header className="p-4 bg-slate-900/80 border-b border-cyan-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto flex flex-wrap justify-between items-center gap-2">
            <Button
              variant="ghost"
              className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-800/50"
              onClick={() => setShowExitDialog(true)}
            >
              <IoMdArrowBack className="mr-2 h-5 w-5" />
              Quitter
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <h1 className="text-lg md:text-xl font-cyber-title font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  CryptoLock: 72H de Tension
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-cyan-700/50 border-cyan-500/30 text-xs">
                    Tour {game.currentTurn}/{game.totalTurns}
                  </Badge>
                  <Badge className={`text-xs ${game.currentTurn <= 2 ? 'bg-green-700/50 border-green-500/30' : 
                    game.currentTurn <= 4 ? 'bg-yellow-700/50 border-yellow-500/30' : 
                    'bg-red-700/50 border-red-500/30'}`}>
                    {game.currentTurn <= 2 ? 'Phase Initiale' : 
                     game.currentTurn <= 4 ? 'Phase Critique' : 
                     'Phase Finale'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-800/80 px-3 py-1 rounded-md border border-slate-700">
                <Clock className="h-4 w-4 text-cyan-500 mr-2" />
                <span className="text-sm font-mono">
                  {game.startTime ? formatElapsedTime(elapsedTime) : '00:00:00'}
                </span>
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-slate-700 bg-slate-800/50 hover:bg-slate-700"
                      onClick={() => setShowGameOverDialog(true)}
                    >
                      <IoMdInformationCircleOutline className="h-5 w-5 text-cyan-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Informations sur la simulation
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </header>
        
        {/* Contenu principal */}
        <div className="flex-1 container mx-auto py-4 flex flex-col md:flex-row gap-4">
          {/* Zone de messages */}
          <div className="flex-1 flex flex-col">
            <Card className="flex-1 bg-slate-900/60 border-slate-800">
              <CardContent className="p-0 flex flex-col h-[calc(100vh-180px)]">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {game.messages.map((message) => (
                      <div key={message.id} className="animate-fadeIn">
                        {message.isSystem ? (
                          <div className="p-3 bg-slate-800/70 border border-slate-700 rounded-md">
                            <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
                              <div className="flex items-center">
                                <ServerCrash className="inline-block h-3 w-3 mr-1 text-cyan-500" />
                                <span>Système</span>
                              </div>
                              <span>{formatTime(message.timestamp)}</span>
                            </div>
                            <div 
                              className="text-slate-200 text-sm"
                              dangerouslySetInnerHTML={{ 
                                __html: message.content.replace(/\n/g, '<br />').replace(
                                  /\*\*(.*?)\*\*/g, '<span class="font-bold text-cyan-400">$1</span>'
                                )
                              }} 
                            />
                            
                            {message.isChoice && !message.selectedChoice && message.choices && (
                              <div className="mt-3 flex flex-col gap-2">
                                {message.choices.map(choice => (
                                  <Button
                                    key={choice.id}
                                    variant="outline"
                                    className="text-left justify-start border-slate-700 hover:bg-cyan-900/30 hover:border-cyan-700"
                                    onClick={() => handleChoiceSelection(choice.id)}
                                  >
                                    {choice.text}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}>
                            <div 
                              className={`max-w-[80%] p-3 rounded-md ${
                                message.isAI 
                                  ? 'bg-slate-800 border border-slate-700' 
                                  : 'bg-cyan-900/30 border border-cyan-800/50'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src="" alt={message.sender} />
                                  <AvatarFallback className={message.isAI ? 'bg-slate-700' : 'bg-cyan-700'}>
                                    {ROLE_ICONS[message.senderRole]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 flex justify-between items-center">
                                  <div className="text-xs flex items-center gap-1">
                                    <span className="font-medium">{message.sender}</span>
                                    <span className="text-slate-400">({message.senderRole})</span>
                                  </div>
                                  <span className="text-xs text-slate-400">
                                    {formatTime(message.timestamp)}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm">{message.content}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                {/* Métriques */}
                <div className="p-4 border-t border-slate-800">
                  {renderMetrics()}
                </div>
                
                {/* Saisie de message */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/80">
                  <div className="flex gap-2">
                    <Input
                      ref={messageInputRef}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Entrez votre message ou décision..."
                      className="flex-1 bg-slate-800 border-slate-700 text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handlePlayerMessage();
                        }
                      }}
                      disabled={isProcessing || game.status === 'completed'}
                    />
                    <Button 
                      onClick={handlePlayerMessage}
                      disabled={isProcessing || !messageInput.trim() || game.status === 'completed'}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                      {isProcessing ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <IoMdSend className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Dialogues */}
        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent className="bg-slate-900 border border-cyan-900/50 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Quitter la simulation ?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                Votre progression ne sera pas sauvegardée. Êtes-vous sûr de vouloir quitter ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                Continuer la simulation
              </AlertDialogCancel>
              <AlertDialogAction 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => setLocation('/cyber/crisis-management')}
              >
                Quitter
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <AlertDialog open={showGameOverDialog} onOpenChange={setShowGameOverDialog}>
          <AlertDialogContent className="bg-slate-900 border border-cyan-900/50 text-white max-w-md">
            {game.status === 'completed' ? (
              <>
                <AlertDialogHeader>
                  <AlertDialogTitle>Simulation terminée</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-300">
                    Vous avez terminé la simulation CryptoLock.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <h3 className="text-lg font-semibold text-cyan-400 mb-3">Résultats finaux</h3>
                  {renderMetrics()}
                  <div className="mt-4 p-3 bg-slate-800 rounded-md border border-slate-700">
                    <h4 className="text-sm font-medium text-cyan-300 mb-2">Analyse de performance</h4>
                    <p className="text-sm text-slate-300">
                      Vous avez géré cette crise avec un niveau d'efficacité {' '}
                      {(() => {
                        const avg = Object.values(game.metrics).reduce((a, b) => a + b, 0) / 5;
                        if (avg > 80) return 'excellent';
                        if (avg > 60) return 'bon';
                        if (avg > 40) return 'moyen';
                        return 'faible';
                      })()}.
                      
                      La crise est maintenant sous contrôle, mais les actions prises 
                      aujourd'hui auront des conséquences durables sur l'entreprise.
                    </p>
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogAction 
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                    onClick={() => setLocation('/cyber/crisis-management')}
                  >
                    Retour au menu
                  </AlertDialogAction>
                </AlertDialogFooter>
              </>
            ) : (
              <>
                <AlertDialogHeader>
                  <AlertDialogTitle>Informations sur la simulation</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="py-4">
                  <h3 className="text-md font-semibold text-cyan-400 mb-2">Indicateurs</h3>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li className="flex items-start">
                      <span className="text-cyan-500 mr-2">•</span>
                      <span><strong>Intégrité :</strong> État de sécurité des données et systèmes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-500 mr-2">•</span>
                      <span><strong>Disponibilité :</strong> Capacité des services à fonctionner</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-500 mr-2">•</span>
                      <span><strong>Conformité :</strong> Respect des obligations légales</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-500 mr-2">•</span>
                      <span><strong>Coût :</strong> Impact financier de la crise et sa gestion</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-500 mr-2">•</span>
                      <span><strong>Confiance :</strong> Perception des parties prenantes</span>
                    </li>
                  </ul>
                  
                  <h3 className="text-md font-semibold text-cyan-400 mt-4 mb-2">Objectifs</h3>
                  <p className="text-sm text-slate-300">
                    Résoudre la crise en prenant les meilleures décisions possibles 
                    selon votre rôle et en équilibrant les indicateurs ci-dessus.
                  </p>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                    Fermer
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </>
            )}
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };
  
  // Conditionnellement rendre le setup ou le jeu en cours
  return game.status === 'setup' ? renderSetup() : renderPlayingGame();
}