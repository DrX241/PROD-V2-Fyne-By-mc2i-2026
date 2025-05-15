import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import CyberButton from '@/components/CyberButton';
import { Loader2, Clock, AlertCircle, Send, ArrowRight, FileText, MessageCircle, BarChart3, Users, Brain, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';

// Interfaces

// Rôles disponibles dans le jeu
type PlayerRole = 'DSI' | 'RSSI' | 'DG' | 'Juriste' | 'Communication' | 'Expert Forensic';

// Types de messages possibles
type MessageType = 'system' | 'private' | 'decision' | 'player' | 'ai';

// Interface représentant un joueur
interface PlayerInfo {
  id: string;
  name: string;
  role: PlayerRole;
  isAI: boolean;
  expertise?: number; // Niveau d'expertise de 1 à 10
  avatar?: string;    // URL de l'avatar
}

// Interface d'une décision à prendre par un joueur
interface DecisionOption {
  id: string;        // Identifiant unique de l'option
  text: string;      // Description de l'option
  impact?: string;   // Impact potentiel (peut être caché)
}

// Interface pour un message dans le jeu
interface GameMessage {
  id: string;
  timestamp: number;
  type: MessageType;
  sender?: string;        // Nom du joueur
  senderRole?: PlayerRole; // Rôle du joueur
  targetPlayer?: string;  // ID du joueur cible (pour messages privés)
  content: string;        // Contenu du message (supporte markdown)
  isHighlighted?: boolean; // Pour les messages importants
  decisions?: DecisionOption[]; // Options de décision possibles
  selectedOption?: string; // ID de l'option choisie
  turnNumber?: number;     // Numéro du tour associé
}

// Indicateurs de la crise
interface CrisisMetrics {
  integrity: number;     // Intégrité des systèmes (0-100)
  availability: number;  // Disponibilité des services (0-100)
  compliance: number;    // Conformité légale (0-100)
  cost: number;          // Coût estimé en euros
  trust: number;         // Confiance interne/externe (0-100)
  securityLevel: number; // Niveau de sécurité global (0-100)
}

// Structure d'un tour de jeu
interface GameTurn {
  number: number;
  title: string;
  description: string;
  startTime?: number;
  endTime?: number;
  decisions: Record<string, string>; // playerId -> decisionId
  narrativeDelivered: boolean;
  privateMessagesDelivered: boolean;
  decisionsDelivered: boolean;
  completed: boolean;
}

// État global du jeu
interface GameState {
  id?: string;
  status: 'setup' | 'ready' | 'playing' | 'paused' | 'completed';
  players: PlayerInfo[];
  messages: GameMessage[];
  currentTurn: number;  // Numéro du tour actuel (0-5)
  turns: GameTurn[];    // Détails des 6 tours
  startTime?: number;   // Timestamp du début du jeu
  endTime?: number;     // Timestamp de fin du jeu
  metrics: CrisisMetrics; // État des métriques de crise
  simulatedTimeHour: number; // Heure simulée (8 à 9)
  simulatedTimeMinute: number; // Minute simulée (0 à 30)
}

// Fonction pour générer un ID unique
const generateId = () => `id_${Math.random().toString(36).substr(2, 9)}`;

// Composant principal
export default function CryptoLockReborn() {
  // États
  const [game, setGame] = useState<GameState>({
    status: 'setup',
    players: [],
    messages: [],
    currentTurn: 0,
    turns: [
      {
        number: 1,
        title: 'Détection & mobilisation',
        description: 'Comprendre l\'attaque, mobiliser l\'équipe',
        narrativeDelivered: false,
        privateMessagesDelivered: false,
        decisionsDelivered: false,
        completed: false,
        decisions: {}
      },
      {
        number: 2,
        title: 'Containment & isolement',
        description: 'Stopper la propagation de l\'attaque',
        narrativeDelivered: false,
        privateMessagesDelivered: false,
        decisionsDelivered: false,
        completed: false,
        decisions: {}
      },
      {
        number: 3,
        title: 'Investigation & vecteur',
        description: 'Identifier le vecteur d\'attaque',
        narrativeDelivered: false,
        privateMessagesDelivered: false,
        decisionsDelivered: false,
        completed: false,
        decisions: {}
      },
      {
        number: 4,
        title: 'Décisions critiques',
        description: 'Prendre les décisions stratégiques',
        narrativeDelivered: false,
        privateMessagesDelivered: false,
        decisionsDelivered: false,
        completed: false,
        decisions: {}
      },
      {
        number: 5,
        title: 'Rétablissement & gestion',
        description: 'Commencer la restauration des services',
        narrativeDelivered: false,
        privateMessagesDelivered: false,
        decisionsDelivered: false,
        completed: false,
        decisions: {}
      },
      {
        number: 6,
        title: 'Débrief & leçons',
        description: 'Bilan et leçons apprises',
        narrativeDelivered: false,
        privateMessagesDelivered: false,
        decisionsDelivered: false,
        completed: false,
        decisions: {}
      }
    ],
    metrics: {
      integrity: 90,
      availability: 90,
      compliance: 80,
      cost: 0,
      trust: 70,
      securityLevel: 80
    },
    simulatedTimeHour: 8,
    simulatedTimeMinute: 0
  });

  const [playerName, setPlayerName] = useState('');
  const [playerRole, setPlayerRole] = useState<PlayerRole | ''>('');
  const [availableRoles, setAvailableRoles] = useState<PlayerRole[]>([
    'RSSI', 'DSI', 'DG', 'Juriste', 'Communication', 'Expert Forensic'
  ]);
  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(0);
  const [currentPlayerSetup, setCurrentPlayerSetup] = useState<number>(0);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  
  const [gameId, setGameId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState('salle-de-crise');
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPlayerSetupDialog, setShowPlayerSetupDialog] = useState(false);
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [turnTimeLeft, setTurnTimeLeft] = useState(300); // 5 minutes par tour en secondes
  const [showTurnEndDialog, setShowTurnEndDialog] = useState(false);
  const [playersReadyForNextTurn, setPlayersReadyForNextTurn] = useState<string[]>([]);
  const [viewingMessageId, setViewingMessageId] = useState<string | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Format du temps écoulé
  const formatElapsedTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format du temps restant pour le tour
  const formatTurnTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format de l'heure simulée
  const formatSimulatedTime = () => {
    const hour = game.simulatedTimeHour.toString().padStart(2, '0');
    const minute = game.simulatedTimeMinute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
  };

  // Effet pour mettre à jour le compteur de temps toutes les secondes
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (game.status === 'playing' && game.startTime) {
      intervalId = setInterval(() => {
        const now = Date.now();
        setElapsedTime(now - game.startTime!);
        
        // Calcul du temps restant pour le tour actuel
        // Utilise la valeur du temps actuel comme fallback pour éviter undefined
        const currentTurnStartTime: number = game.turns[game.currentTurn]?.startTime ?? game.startTime ?? now;
        const turnElapsed = now - currentTurnStartTime;
        const turnTimeLeftSeconds = Math.max(0, 300 - Math.floor(turnElapsed / 1000));
        setTurnTimeLeft(turnTimeLeftSeconds);
        
        // Si le temps est écoulé pour ce tour, afficher la boîte de dialogue de fin de tour
        if (turnTimeLeftSeconds === 0 && !showTurnEndDialog && game.currentTurn < 5) {
          setShowTurnEndDialog(true);
        }
      }, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [game.status, game.startTime, game.currentTurn, game.turns, showTurnEndDialog]);
  
  // Effet pour rafraîchir périodiquement l'état du jeu si connecté à l'API
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (gameId && game.status === 'playing') {
      intervalId = setInterval(() => {
        refreshGameState();
      }, 5000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [gameId, game.status]);

  // Défilement automatique des messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Effet pour faire défiler vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    scrollToBottom();
  }, [game.messages.length]);

  // Filtrage des messages en fonction de l'onglet actif
  const getFilteredMessages = () => {
    if (activeTab === 'salle-de-crise') {
      return game.messages.filter(m => 
        m.type === 'system' || 
        m.type === 'player' || 
        (m.type === 'ai' && !m.targetPlayer) ||
        (m.type === 'decision' && !m.targetPlayer)
      );
    } else if (activeTab === 'messages-prives') {
      const currentPlayer = game.players.find(p => !p.isAI);
      if (!currentPlayer) return [];
      return game.messages.filter(m => 
        (m.type === 'private' && m.targetPlayer === currentPlayer.id) ||
        (m.type === 'decision' && m.targetPlayer === currentPlayer.id)
      );
    } else if (activeTab === 'decisions') {
      const currentPlayer = game.players.find(p => !p.isAI);
      if (!currentPlayer) return [];
      return game.messages.filter(m => 
        m.type === 'decision' && 
        m.targetPlayer === currentPlayer.id &&
        !m.selectedOption
      );
    } else if (activeTab === 'journal') {
      // Tous les messages, organisés par tour
      return game.messages.sort((a, b) => a.timestamp - b.timestamp);
    }
    return [];
  };

  // Fonctions pour commencer la configuration
  const startConfiguration = () => {
    setShowPlayerSetupDialog(true);
  };

  // Fonction pour ajouter un joueur
  const addHumanPlayer = () => {
    if (!playerName.trim() || !playerRole) {
      toast({
        title: "Information incomplète",
        description: "Veuillez entrer un nom et choisir un rôle",
        variant: "destructive"
      });
      return;
    }
    
    const newPlayer: PlayerInfo = {
      id: generateId(),
      name: playerName.trim(),
      role: playerRole as PlayerRole,
      isAI: false
    };
    
    setGame(prev => ({
      ...prev,
      players: [...prev.players, newPlayer]
    }));
    
    // Mettre à jour les rôles disponibles
    setAvailableRoles(prev => prev.filter(r => r !== playerRole));
    
    // Réinitialiser les champs
    setPlayerName('');
    setPlayerRole('');
    setCurrentPlayerSetup(prev => prev + 1);
    
    // Si tous les joueurs sont configurés, passer à l'étape suivante
    if (currentPlayerSetup + 1 >= numberOfPlayers) {
      completePlayerSetup();
    }
  };

  // Fonction pour terminer la configuration des joueurs
  const completePlayerSetup = () => {
    // Créer des joueurs IA pour les rôles restants
    const aiPlayers: PlayerInfo[] = availableRoles.map(role => ({
      id: generateId(),
      name: getRandomNameForRole(role),
      role: role,
      isAI: true
    }));
    
    setGame(prev => ({
      ...prev,
      players: [...prev.players, ...aiPlayers],
      status: 'ready'
    }));
    
    setShowPlayerSetupDialog(false);
    
    // Afficher un toast pour indiquer que la configuration est terminée
    toast({
      title: "Configuration terminée",
      description: `${aiPlayers.length} rôles IA ajoutés. Le jeu est prêt à démarrer.`,
      duration: 5000
    });
  };

  // Fonction pour obtenir un nom aléatoire en fonction du rôle
  const getRandomNameForRole = (role: PlayerRole): string => {
    const namesByRole: Record<PlayerRole, string[]> = {
      'DSI': ['Thomas', 'Fatima', 'Laurent', 'Sophie'],
      'RSSI': ['Julien', 'Emma', 'Nicolas', 'Léa'],
      'DG': ['Philippe', 'Isabelle', 'Marc', 'Hélène'],
      'Juriste': ['Maître Dupont', 'Maître Lemoine', 'Maître Bernard', 'Maître Renard'],
      'Communication': ['Théo', 'Sarah', 'Vincent', 'Aurélie'],
      'Expert Forensic': ['Alex', 'Camille', 'Marc', 'Jeanne']
    };
    
    const names = namesByRole[role] || ['Anonyme'];
    return names[Math.floor(Math.random() * names.length)];
  };

  // Fonction pour commencer le jeu
  const startGame = async () => {
    if (gameId) {
      await startGameOnServer(gameId);
    } else {
      // Démarrage local
      setGame(prev => ({
        ...prev,
        status: 'playing',
        startTime: Date.now(),
        turns: prev.turns.map((turn, idx) => 
          idx === 0 ? { ...turn, startTime: Date.now() } : turn
        )
      }));
      
      // Afficher la cinématique d'introduction
      addSystemMessage(`🎮 **CryptoLock - Simulation d'une attaque Ransomware** 🎮

Lundi, 07h58.
Quelques utilisateurs signalent des problèmes d'accès à leurs fichiers.
À 08h00, un message s'affiche sur plusieurs postes :

🔐 "Vos fichiers sont chiffrés. Payez 3 bitcoins sous 72h ou tout sera perdu."

Les sauvegardes sont inaccessibles.
Le réseau ralentit.
Vous êtes dans la salle de crise.
Chaque minute compte.`);

      // Lancer le premier tour
      setTimeout(() => {
        startTurn(1);
      }, 1000);
    }
  };

  // Fonction pour lancer un nouveau tour
  const startTurn = (turnNumber: number) => {
    if (turnNumber < 1 || turnNumber > 6) return;
    
    const turn = game.turns[turnNumber - 1];
    
    // Mettre à jour l'état du jeu
    setGame(prev => ({
      ...prev,
      currentTurn: turnNumber - 1,
      simulatedTimeHour: 8,
      simulatedTimeMinute: (turnNumber - 1) * 5,
      turns: prev.turns.map((t, idx) => 
        idx === turnNumber - 1 
          ? { ...t, startTime: Date.now(), narrativeDelivered: false, privateMessagesDelivered: false, decisionsDelivered: false } 
          : t
      )
    }));
    
    // Réinitialiser le tableau des joueurs prêts pour le prochain tour
    setPlayersReadyForNextTurn([]);
    
    // Ajouter le message de narration du tour
    addSystemMessage(`**Tour ${turnNumber}: ${turn.title}**

${turn.description}

🕒 Il est maintenant ${formatSimulatedTime()} simulé dans la crise.`, true);

    // En mode local, simuler la progression du tour
    if (!gameId) {
      simulateTurnProgression(turnNumber);
    }
  };

  // Simuler la progression d'un tour (envoi de messages, décisions, etc.)
  const simulateTurnProgression = (turnNumber: number) => {
    // Après quelques secondes, envoyer des messages privés aux joueurs
    setTimeout(() => {
      // Mettre à jour l'indicateur de messages privés délivrés
      setGame(prev => ({
        ...prev,
        turns: prev.turns.map((t, idx) => 
          idx === turnNumber - 1 ? { ...t, privateMessagesDelivered: true } : t
        )
      }));
      
      // Envoyer un message privé à chaque joueur humain
      const humanPlayers = game.players.filter(p => !p.isAI);
      humanPlayers.forEach(player => {
        const messageContent = generatePrivateMessage(player.role, turnNumber);
        addPrivateMessage(player.id, messageContent);
      });
      
      // Simuler des messages des PNJ après quelques secondes de plus
      setTimeout(() => {
        const aiPlayers = game.players.filter(p => p.isAI);
        aiPlayers.forEach((aiPlayer, index) => {
          setTimeout(() => {
            const aiMessage = generateAIMessage(aiPlayer.role, turnNumber);
            addAIMessage(aiPlayer.name, aiPlayer.role, aiMessage);
          }, index * 2000); // Étaler les messages des PNJ
        });
        
        // Après encore quelques secondes, envoyer des décisions à prendre
        setTimeout(() => {
          // Mettre à jour l'indicateur de décisions délivrées
          setGame(prev => ({
            ...prev,
            turns: prev.turns.map((t, idx) => 
              idx === turnNumber - 1 ? { ...t, decisionsDelivered: true } : t
            )
          }));
          
          // Envoyer une décision à chaque joueur humain
          humanPlayers.forEach(player => {
            const decision = generateDecision(player.role, turnNumber);
            addDecisionMessage(player.id, decision.prompt, decision.options);
          });
        }, 5000);
      }, 3000);
    }, 2000);
  };

  // Générer un message privé pour un rôle spécifique à un tour donné
  const generatePrivateMessage = (role: PlayerRole, turnNumber: number): string => {
    const messages: Record<PlayerRole, Record<number, string>> = {
      'RSSI': {
        1: "L'équipe SOC a détecté une activité anormale sur le serveur AD01 depuis 06:34. Des fichiers sont en cours de chiffrement dans le dossier partagé RH.",
        2: "Le segment Achat est désormais touché. Le SOC confirme des flux anormaux sortants vers une IP russe via HTTP.",
        3: "Le compte \"admin-dev01\" semble avoir été utilisé comme point d'entrée. Tu peux forcer sa désactivation, mais cela coupera l'accès à plusieurs outils DevOps.",
        4: "Le système de sauvegarde est en train d'être chiffré. Il te reste 2 options principales.",
        5: "Un serveur métier est prêt à être restauré depuis une sauvegarde. Mais tu n'as pas eu le temps de le scanner entièrement.",
        6: "Tu dois faire une recommandation finale au COMEX concernant la sécurité à long terme."
      },
      'DSI': {
        1: "L'infrastructure montre des signes de surcharge. 21 postes affichent déjà le message de rançon. Les services techniques sont en panique.",
        2: "Le plan d'isolement est prêt mais attend la validation du DG. Pendant ce temps, la propagation continue vers les serveurs Finance.",
        3: "Les environnements de développement semblent compromis. L'attaquant pourrait avoir les clés SSH de l'équipe DevOps.",
        4: "Les backups s'écrivent trop lentement. À ce rythme, nous ne pourrons pas sauver les données critiques avant leur chiffrement.",
        5: "Nous pouvons remonter un environnement minimal pour le service client sans exposer les environnements critiques.",
        6: "Une refonte complète du SI nous prendrait 3 mois. Un renforcement progressif 6 semaines. Je dois faire une recommandation."
      },
      'DG': {
        1: "Vous recevez un SMS du président du groupe : \"Est-ce que c'est sérieux ? Dois-je prévenir le board ? Qu'est-ce que tu proposes ?\" Le COMEX se réunit dans 20 minutes.",
        2: "Fatima (DSI) vous a transmis un brouillon de plan d'isolement total. Elle veut votre validation immédiate. En parallèle, le DRH vous appelle : \"Je ne peux plus accéder aux contrats.\"",
        3: "Le COMEX est divisé : certains veulent payer. L'attaque est remontée dans la presse. Le site Les Jours vient de publier : \"Une entreprise française paralysée par une cyberattaque.\"",
        4: "Les syndicats demandent des garanties. Un journaliste t'attend en visio à 08:30. Tu dois décider de ta communication.",
        5: "Le COMEX pousse à reprendre la production avant midi. Le DAF propose de payer la rançon pour \"raccourcir les délais\".",
        6: "Tu dois préparer un message final à adresser aux collaborateurs à 09:00."
      },
      'Juriste': {
        1: "J'ai commencé à analyser nos obligations légales. Si des données personnelles sont compromises, nous avons 72 heures pour notifier la CNIL.",
        2: "Le chiffrement du dossier RH implique une fuite possible de données sensibles. Je dois savoir si je déclenche la procédure RGPD maintenant.",
        3: "La presse parle de nous. Notre communication doit être extrêmement prudente pour éviter tout risque juridique supplémentaire.",
        4: "Payer la rançon n'est pas illégal en soi, mais cela pourrait être interprété comme une faute de gestion par les actionnaires.",
        5: "Les contrats d'assurance cyber exigent que nous ayons pris toutes les mesures préventives. Je vérifie nos couvertures.",
        6: "Je prépare la documentation juridique complète pour la CNIL et les éventuelles actions en justice."
      },
      'Communication': {
        1: "Les équipes sont inquiètes. Il y a déjà des rumeurs internes. Je dois préparer une communication officielle rapidement.",
        2: "Twitter commence à parler de nous, avec le hashtag #ransomware. Les journalistes appellent. Il faut une ligne officielle.",
        3: "Je prépare un communiqué de presse. On parle de perturbations techniques ou on assume publiquement l'attaque ?",
        4: "Les médias sociaux s'enflamment. Clients, partenaires et journalistes demandent des explications claires.",
        5: "La transparence ou le silence ? Je dois finaliser la stratégie de communication pour les prochaines 24h.",
        6: "Il faut préparer un bilan de crise pour les médias, avec un narratif rassurant mais honnête."
      },
      'Expert Forensic': {
        1: "J'ai commencé l'analyse des logs. L'attaque a débuté il y a environ 3 heures. Je détecte des connexions suspectes sur les VPN.",
        2: "Une backdoor a été implantée sur 2 postes techniques. Ce n'est plus une simple attaque opportuniste.",
        3: "Le compte admin-dev01 a été utilisé pour pivote. C'est un compte anonyme ou connaissez-vous son propriétaire ?",
        4: "J'ai identifié une exfiltration de données vers l'Ukraine. Environ 2 Go de données ont quitté notre réseau.",
        5: "L'analyse est terminée. Je peux confirmer que ce ransomware est de la famille BlackMatter, connu pour ses attaques destructrices.",
        6: "Voici mon rapport final : vecteur d'entrée par phishing, élévation de privilèges via exploit CVE-2023-xxxxx, mouvement latéral via RDP."
      }
    };
    
    return messages[role][turnNumber] || "Information non disponible pour ce tour.";
  };

  // Générer un message IA pour un rôle spécifique à un tour donné
  const generateAIMessage = (role: PlayerRole, turnNumber: number): string => {
    const messages: Record<PlayerRole, Record<number, string>> = {
      'RSSI': {
        1: "Le SOC détecte des comportements anormaux depuis 3 heures. J'ai besoin d'un accès prioritaire à tous les logs.",
        2: "Je vais devoir isoler d'urgence le segment Finance. L'attaquant évolue trop vite.",
        3: "J'ai lancé un scan de vulnérabilité sur tous les serveurs accessibles. Résultats dans 15 minutes.",
        4: "Le CERT-FR nous conseille de ne pas payer la rançon. Ils ont identifié un schéma similaire chez un autre client.",
        5: "Nous devons définir les prérequis de sécurité pour toute restauration. Je ne veux pas que l'on réinjecte le malware.",
        6: "Mon équipe prépare une matrice de recommandations pour éviter ce type d'incident à l'avenir."
      },
      'DSI': {
        1: "Je viens de recevoir plusieurs alertes du système de surveillance. Des postes de travail et certains serveurs de fichiers semblent inaccessibles.",
        2: "David, je perds un temps précieux. Vous jouez avec le feu. J'engage de mon propre chef l'isolement d'urgence des serveurs Finance.",
        3: "Les environnements de recette sont maintenant touchés. On risque de perdre le code source des applications critiques.",
        4: "Nous devons discuter de l'option restauration d'urgence. Ça implique 4h de downtime complet.",
        5: "J'ai un plan de reprise partielle qui préserve l'intégrité du SI tout en redonnant accès au CRM.",
        6: "Je recommande une segmentation complète du réseau et un déploiement d'EDR sur tous les postes. Budget estimé : 350K€."
      },
      'DG': {
        1: "Il faut mobiliser toutes les équipes. Je dois savoir rapidement l'impact sur nos services critiques et clients.",
        2: "Ne prenez aucun risque. Protégez les données clients et la propriété intellectuelle en priorité.",
        3: "Le board est informé. Ils veulent un point toutes les 30 minutes. Il faut des résultats rapides.",
        4: "La situation évolue rapidement. Nous devons adapter notre stratégie en conséquence. Quelles sont vos recommandations ?",
        5: "La reprise d'activité est prioritaire, mais pas au détriment de la sécurité. Quel est notre plan B ?",
        6: "Il nous faut un plan de transformation cyber à présenter au conseil dans 48h. Budget, délais, priorités."
      },
      'Juriste': {
        1: "J'ai commencé à documenter l'incident pour le dossier CNIL. Nous devons être irréprochables sur la chronologie.",
        2: "J'ai ouvert un dossier préliminaire. Il faut identifier précisément les données concernées par la violation.",
        3: "Si nous communiquons sur l'attaque, nous devons éviter tout aveu de négligence qui pourrait être utilisé contre nous.",
        4: "Les actionnaires pourraient nous tenir responsables si nous n'avons pas pris toutes les mesures raisonnables.",
        5: "Notre cyber-assurance exige une communication formelle dans les 24h. J'ai préparé le dossier.",
        6: "Les coûts juridiques pourraient être importants : notifications, possibles amendes CNIL, actions en justice..."
      },
      'Communication': {
        1: "Communiqué envoyé aux managers pour rassurer les équipes. À ce stade, je parle d'incident technique.",
        2: "Des clients se plaignent d'erreurs sur le site. Si je n'ai pas de message officiel à diffuser dans 10 minutes, je vais devoir improviser.",
        3: "J'ai dû gérer 3 appels de journalistes. Ils ont des sources internes qui parlent. Il faut une stratégie claire.",
        4: "Communiqué envoyé à 08:12. On parle de perturbation temporaire. Je n'ai pas mentionné les données chiffrées.",
        5: "Les réseaux sociaux s'affolent. J'ai préparé un script pour le service client et un communiqué de presse.",
        6: "Je propose une communication de crise complète avec : communiqué, FAQ, interview et réponses social media."
      },
      'Expert Forensic': {
        1: "J'ai commencé l'analyse des logs. Il semble que l'attaque ait débuté il y a environ 3 heures. Je détecte des connexions suspectes sur les VPN.",
        2: "Analyse en cours. J'ai identifié une signature connue de Ryuk dans les process actifs. IOCs en cours d'extraction.",
        3: "La chronologie de l'attaque montre une élévation de privilèges via un compte inactif mais non désactivé.",
        4: "J'ai isolé le binaire du ransomware. Il est spécifiquement configuré pour votre réseau - ce n'est pas une attaque opportuniste.",
        5: "Analyse en cours. J'ai détecté une tentative de persistance. Bonne décision d'attendre.",
        6: "Mon analyse finale montre que l'attaquant était dans votre réseau depuis 17 jours. Il a utilisé 3 comptes compromis."
      }
    };
    
    return messages[role][turnNumber] || "Pas d'information disponible pour ce tour.";
  };

  // Générer une décision pour un rôle spécifique à un tour donné
  const generateDecision = (role: PlayerRole, turnNumber: number): { prompt: string, options: DecisionOption[] } => {
    const decisions: Record<PlayerRole, Record<number, { prompt: string, options: DecisionOption[] }>> = {
      'RSSI': {
        1: {
          prompt: "Quelle action immédiate pour contenir l'attaque ?",
          options: [
            { id: "cut-all", text: "Couper immédiatement tous les accès réseau" },
            { id: "isolate-segment", text: "Isoler uniquement le segment RH et AD01" },
            { id: "wait-forensic", text: "Attendre confirmation du Forensic avant toute action" }
          ]
        },
        2: {
          prompt: "Comment gérer la propagation qui continue ?",
          options: [
            { id: "disconnect-firewall", text: "Débrancher immédiatement le pare-feu principal du datacenter" },
            { id: "cut-internet", text: "Couper l'accès Internet uniquement" },
            { id: "wait-more", text: "Ne rien faire tant que le Forensic n'a pas confirmé" }
          ]
        },
        3: {
          prompt: "Que faire du compte admin-dev01 compromis ?",
          options: [
            { id: "disable-account", text: "Forcer la désactivation du compte immédiatement" },
            { id: "honeypot", text: "Créer un leurre avec ce compte pour piéger l'attaquant" },
            { id: "wait-approval", text: "Attendre validation de la direction" }
          ]
        },
        4: {
          prompt: "Comment protéger les sauvegardes ?",
          options: [
            { id: "disconnect-backups", text: "Débrancher physiquement les disques de backup" },
            { id: "emergency-restore", text: "Lancer une restauration d'urgence sur un serveur parallèle" }
          ]
        },
        5: {
          prompt: "Faut-il restaurer le serveur métier maintenant ?",
          options: [
            { id: "restore-now", text: "Restaurer tout de suite pour redémarrer le service client" },
            { id: "wait-analysis", text: "Attendre une analyse complète du Forensic (15 minutes)" }
          ]
        },
        6: {
          prompt: "Quelle recommandation finale au COMEX ?",
          options: [
            { id: "full-redesign", text: "Refonte complète du SI avec PRA/PCA" },
            { id: "training", text: "Formation de l'ensemble des métiers à la cybersécurité" },
            { id: "progressive", text: "Renforcement progressif des accès à privilèges uniquement" }
          ]
        }
      },
      'DSI': {
        1: {
          prompt: "Quelle action technique immédiate ?",
          options: [
            { id: "shutdown-servers", text: "Arrêter tous les serveurs non critiques" },
            { id: "block-external", text: "Bloquer tous les accès externes" },
            { id: "monitor-only", text: "Surveiller uniquement et collecter des preuves" }
          ]
        },
        2: {
          prompt: "Comment isoler les systèmes critiques ?",
          options: [
            { id: "physical-disconnect", text: "Déconnexion physique des segments critiques" },
            { id: "vlan-isolation", text: "Isolation par VLAN des segments compromis" },
            { id: "controlled-shutdown", text: "Arrêt contrôlé des systèmes infectés uniquement" }
          ]
        },
        3: {
          prompt: "Comment gérer les accès privilégiés ?",
          options: [
            { id: "reset-all", text: "Réinitialiser tous les mots de passe administrateur" },
            { id: "new-admin", text: "Créer de nouveaux comptes admin temporaires" },
            { id: "2fa-mandatory", text: "Activer 2FA d'urgence sur tous les accès sensibles" }
          ]
        },
        4: {
          prompt: "Quelle stratégie pour les sauvegardes ?",
          options: [
            { id: "offsite-backup", text: "Transférer une copie hors site immédiatement" },
            { id: "read-only", text: "Passer tous les backups en lecture seule" },
            { id: "new-backup", text: "Lancer un nouveau backup complet sur média isolé" }
          ]
        },
        5: {
          prompt: "Comment redémarrer les services critiques ?",
          options: [
            { id: "clean-rebuild", text: "Reconstruire depuis zéro sur infrastructure saine" },
            { id: "sandbox-restore", text: "Restaurer en sandbox et migrer progressivement" },
            { id: "partial-service", text: "Remonter uniquement les services front-end" }
          ]
        },
        6: {
          prompt: "Quelle recommandation technique pour l'avenir ?",
          options: [
            { id: "zero-trust", text: "Architecture Zero Trust complète" },
            { id: "segmentation", text: "Micro-segmentation du réseau" },
            { id: "edr-deployment", text: "Déploiement EDR et SOC 24/7" }
          ]
        }
      },
      'DG': {
        1: {
          prompt: "Comment gérer la communication initiale ?",
          options: [
            { id: "inform-board", text: "Informer immédiatement le président et alerter le board" },
            { id: "internal-only", text: "Garder la communication interne pour l'instant" },
            { id: "wait-com", text: "Demander au Com une note avant toute décision" }
          ]
        },
        2: {
          prompt: "Quelle position sur l'isolation réseau ?",
          options: [
            { id: "approve-isolation", text: "Valider l'isolement total proposé par la DSI" },
            { id: "progressive-plan", text: "Demander un plan progressif plus maîtrisé" },
            { id: "wait-comex", text: "Ne rien valider avant le prochain COMEX" }
          ]
        },
        3: {
          prompt: "Comment réagir à la couverture médiatique ?",
          options: [
            { id: "emergency-comex", text: "Réunir le COMEX en urgence pour envisager un paiement" },
            { id: "reassuring-com", text: "Faire un communiqué rassurant sans parler de la rançon" },
            { id: "lawyer-validation", text: "Ne rien communiquer tant que l'avocat ne valide" }
          ]
        },
        4: {
          prompt: "Quelle stratégie de communication adopter ?",
          options: [
            { id: "full-transparency", text: "Assumer publiquement une cyberattaque majeure" },
            { id: "vague-incident", text: "Rester flou : \"Incident informatique en cours de résolution\"" }
          ]
        },
        5: {
          prompt: "Position sur le paiement de la rançon ?",
          options: [
            { id: "refuse-payment", text: "Refuser catégoriquement le paiement" },
            { id: "negotiate", text: "Lancer un canal confidentiel de négociation" },
            { id: "defer-decision", text: "Revoir cette question avec le COMEX plus tard" }
          ]
        },
        6: {
          prompt: "Message final aux collaborateurs ?",
          options: [
            { id: "transparent-message", text: "Message transparent sur l'attaque, les impacts et les leçons" },
            { id: "reassuring-message", text: "Message rassurant : \"incident clos, pas d'impact majeur\"" },
            { id: "no-communication", text: "Ne pas communiquer davantage, laisser passer l'orage" }
          ]
        }
      },
      'Juriste': {
        1: {
          prompt: "Quelle action juridique immédiate ?",
          options: [
            { id: "notify-cnil", text: "Notifier immédiatement la CNIL par précaution" },
            { id: "prepare-file", text: "Préparer le dossier mais attendre confirmation de fuite" },
            { id: "legal-counsel", text: "Consulter un cabinet spécialisé en cybercriminalité" }
          ]
        },
        2: {
          prompt: "Procédure RGPD à suivre ?",
          options: [
            { id: "trigger-rgpd", text: "Déclencher la procédure RGPD complète maintenant" },
            { id: "preliminary-notice", text: "Faire une notification préliminaire sans détails" },
            { id: "wait-confirmation", text: "Attendre confirmation des données compromises" }
          ]
        },
        3: {
          prompt: "Position juridique sur la communication ?",
          options: [
            { id: "minimum-legal", text: "Communiquer le minimum légal requis" },
            { id: "transparent-legal", text: "Recommander une transparence encadrée juridiquement" },
            { id: "delay-legal", text: "Retarder toute communication externe" }
          ]
        },
        4: {
          prompt: "Conseil juridique sur la rançon ?",
          options: [
            { id: "legal-payment", text: "Préparer un cadre juridique pour un potentiel paiement" },
            { id: "advise-against", text: "Déconseiller formellement tout paiement" },
            { id: "law-enforcement", text: "Recommander contact autorités judiciaires" }
          ]
        },
        5: {
          prompt: "Vérification de l'assurance cyber ?",
          options: [
            { id: "claim-insurance", text: "Déclencher immédiatement le sinistre auprès de l'assurance" },
            { id: "review-policy", text: "Vérifier les clauses d'exclusion avant déclaration" },
            { id: "legal-options", text: "Explorer options légales contre les attaquants" }
          ]
        },
        6: {
          prompt: "Recommandation juridique finale ?",
          options: [
            { id: "compliance-program", text: "Programme complet de mise en conformité" },
            { id: "litigation-preparation", text: "Préparation aux potentiels litiges client/CNIL" },
            { id: "contract-revision", text: "Révision des contrats et assurances" }
          ]
        }
      },
      'Communication': {
        1: {
          prompt: "Communication interne immédiate ?",
          options: [
            { id: "inform-managers", text: "Informer uniquement les managers" },
            { id: "inform-all", text: "Message à tous les employés sur incident technique" },
            { id: "delay-com", text: "Retarder toute communication le temps d'en savoir plus" }
          ]
        },
        2: {
          prompt: "Réponse aux médias sociaux ?",
          options: [
            { id: "acknowledge", text: "Reconnaître l'incident sans détails" },
            { id: "technical-issue", text: "Évoquer une 'maintenance technique non planifiée'" },
            { id: "no-response", text: "Ne pas répondre aux spéculations pour l'instant" }
          ]
        },
        3: {
          prompt: "Stratégie pour le communiqué de presse ?",
          options: [
            { id: "admit-attack", text: "Admettre l'attaque avec transparence limitée" },
            { id: "technical-disruption", text: "Parler de perturbations techniques uniquement" },
            { id: "delay-statement", text: "Reporter tout communiqué officiel" }
          ]
        },
        4: {
          prompt: "Gestion de la réputation en ligne ?",
          options: [
            { id: "proactive-media", text: "Communication proactive sur tous les canaux" },
            { id: "reactive-only", text: "Répondre uniquement aux sollicitations directes" },
            { id: "social-monitoring", text: "Surveillance accrue sans intervention" }
          ]
        },
        5: {
          prompt: "Communication avec les clients ?",
          options: [
            { id: "client-notification", text: "Notification directe à tous les clients" },
            { id: "targeted-com", text: "Communication ciblée aux clients impactés uniquement" },
            { id: "prepare-response", text: "Préparer réponses sans communication proactive" }
          ]
        },
        6: {
          prompt: "Stratégie de communication post-crise ?",
          options: [
            { id: "transparency-campaign", text: "Campagne de transparence sur les leçons apprises" },
            { id: "minimal-reference", text: "Mentions minimales, focus sur l'avenir" },
            { id: "positive-spin", text: "Transformation en histoire positive de résilience" }
          ]
        }
      },
      'Expert Forensic': {
        1: {
          prompt: "Priorité d'investigation immédiate ?",
          options: [
            { id: "collect-iocs", text: "Collecter les IOCs pour bloquer la propagation" },
            { id: "timeline", text: "Établir la timeline précise de l'attaque" },
            { id: "malware-sample", text: "Isoler un échantillon du malware pour analyse" }
          ]
        },
        2: {
          prompt: "Action forensique prioritaire ?",
          options: [
            { id: "memory-dumps", text: "Extraire des dumps mémoire des systèmes compromis" },
            { id: "track-lateral", text: "Tracer les mouvements latéraux de l'attaquant" },
            { id: "identify-c2", text: "Identifier les serveurs de commande et contrôle" }
          ]
        },
        3: {
          prompt: "Analyse du compte compromis ?",
          options: [
            { id: "account-audit", text: "Audit complet de toutes les actions du compte" },
            { id: "similar-accounts", text: "Vérifier tous les comptes avec privilèges similaires" },
            { id: "pattern-search", text: "Rechercher le pattern de compromission sur autres comptes" }
          ]
        },
        4: {
          prompt: "Investigation sur l'exfiltration ?",
          options: [
            { id: "data-scope", text: "Déterminer le périmètre exact des données exfiltrées" },
            { id: "exfil-methods", text: "Analyser les méthodes d'exfiltration utilisées" },
            { id: "block-channels", text: "Identifier et bloquer tous les canaux d'exfiltration" }
          ]
        },
        5: {
          prompt: "Analyse du ransomware ?",
          options: [
            { id: "identify-family", text: "Identifier la famille et variante précise" },
            { id: "recovery-options", text: "Rechercher des faiblesses pour décryptage possible" },
            { id: "attribution", text: "Tenter une attribution à un groupe connu" }
          ]
        },
        6: {
          prompt: "Rapport final ?",
          options: [
            { id: "detailed-report", text: "Rapport technique détaillé avec timeline complète" },
            { id: "executive-summary", text: "Synthèse exécutive avec recommandations prioritaires" },
            { id: "prevention-focus", text: "Focus sur les mesures de prévention futures" }
          ]
        }
      }
    };
    
    return decisions[role][turnNumber] || { 
      prompt: "Décision non disponible pour ce tour", 
      options: [{ id: "no-options", text: "Aucune option disponible" }] 
    };
  };

  // Ajouter un message système
  const addSystemMessage = (content: string, isHighlighted: boolean = false) => {
    const newMessage: GameMessage = {
      id: generateId(),
      type: 'system',
      content,
      timestamp: Date.now(),
      isHighlighted,
      turnNumber: game.currentTurn + 1
    };
    
    setGame(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  };

  // Ajouter un message privé à un joueur
  const addPrivateMessage = (playerId: string, content: string) => {
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    
    const newMessage: GameMessage = {
      id: generateId(),
      type: 'private',
      targetPlayer: playerId,
      content,
      timestamp: Date.now(),
      turnNumber: game.currentTurn + 1
    };
    
    setGame(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
    
    // Si ce n'est pas l'onglet des messages privés actif, alerter l'utilisateur
    if (activeTab !== 'messages-prives') {
      toast({
        title: "Message privé reçu",
        description: `Vous avez reçu un message privé concernant votre rôle de ${player.role}`,
        duration: 5000
      });
    }
  };

  // Ajouter un message d'une IA
  const addAIMessage = (sender: string, role: PlayerRole, content: string) => {
    const newMessage: GameMessage = {
      id: generateId(),
      type: 'ai',
      sender,
      senderRole: role,
      content,
      timestamp: Date.now(),
      turnNumber: game.currentTurn + 1
    };
    
    setGame(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  };

  // Ajouter un message de décision pour un joueur
  const addDecisionMessage = (playerId: string, prompt: string, options: DecisionOption[]) => {
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    
    const newMessage: GameMessage = {
      id: generateId(),
      type: 'decision',
      targetPlayer: playerId,
      content: `**Décision à prendre**: ${prompt}`,
      decisions: options,
      timestamp: Date.now(),
      turnNumber: game.currentTurn + 1
    };
    
    setGame(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
    
    // Si ce n'est pas l'onglet des décisions actif, alerter l'utilisateur
    if (activeTab !== 'decisions') {
      toast({
        title: "Décision à prendre",
        description: `Vous devez prendre une décision critique en tant que ${player.role}`,
        duration: 5000
      });
    }
  };

  // Envoyer un message du joueur
  const handlePlayerMessage = async () => {
    if (!messageInput.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    // Trouver le joueur humain
    const humanPlayer = game.players.find(p => !p.isAI);
    if (!humanPlayer) {
      setIsProcessing(false);
      return;
    }
    
    // Garder une copie du message et vider l'input
    const message = messageInput;
    setMessageInput('');
    
    // Ajouter le message localement
    const newMessage: GameMessage = {
      id: generateId(),
      type: 'player',
      sender: humanPlayer.name,
      senderRole: humanPlayer.role,
      content: message,
      timestamp: Date.now(),
      turnNumber: game.currentTurn + 1
    };
    
    setGame(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
    
    try {
      if (gameId) {
        // Si nous avons un gameId, envoyer le message à l'API
        await sendPlayerMessage(message, humanPlayer.id);
      } else {
        // Simuler la réponse locale
        setTimeout(() => {
          // Chercher un PNJ aléatoire pour répondre
          const aiPlayers = game.players.filter(p => p.isAI);
          if (aiPlayers.length > 0) {
            const randomAI = aiPlayers[Math.floor(Math.random() * aiPlayers.length)];
            const response = `Je comprends votre point de vue, ${humanPlayer.name}. En tant que ${randomAI.role}, je pense que nous devrions aussi considérer...`;
            
            addAIMessage(randomAI.name, randomAI.role, response);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre message",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Gérer une sélection de décision
  const handleChoiceSelection = async (choiceId: string, messageId: string) => {
    setIsProcessing(true);
    
    // Trouver le message de décision
    const decisionMessage = game.messages.find(m => m.id === messageId);
    if (!decisionMessage) {
      setIsProcessing(false);
      return;
    }
    
    // Trouver le joueur humain
    const humanPlayer = game.players.find(p => !p.isAI);
    if (!humanPlayer) {
      setIsProcessing(false);
      return;
    }
    
    // Mettre à jour la décision dans le message
    setGame(prev => ({
      ...prev,
      messages: prev.messages.map(m => 
        m.id === messageId 
          ? { ...m, selectedOption: choiceId } 
          : m
      ),
      turns: prev.turns.map((t, idx) => 
        idx === prev.currentTurn 
          ? { 
              ...t, 
              decisions: { 
                ...t.decisions, 
                [humanPlayer.id]: choiceId 
              } 
            } 
          : t
      )
    }));
    
    try {
      if (gameId) {
        // Si nous avons un gameId, envoyer la décision à l'API
        await makePlayerChoice(choiceId, messageId, humanPlayer.id);
      } else {
        // Simuler les conséquences locales de la décision
        const selectedOption = decisionMessage.decisions?.find(o => o.id === choiceId);
        
        // Ajouter un message système décrivant les conséquences
        setTimeout(() => {
          addSystemMessage(`**Décision prise par ${humanPlayer.name} (${humanPlayer.role})** : ${selectedOption?.text}`);
          
          // Mettre à jour les métriques en fonction de la décision
          updateMetricsBasedOnDecision(choiceId, humanPlayer.role);
          
          // Vérifier si toutes les décisions du tour ont été prises
          checkTurnCompletion();
        }, 1000);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de la décision:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre décision",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Mettre à jour les métriques en fonction d'une décision
  const updateMetricsBasedOnDecision = (choiceId: string, playerRole: PlayerRole) => {
    // Simuler des impacts différents selon les décisions
    // En production, cela viendrait de l'API qui évaluerait les conséquences
    
    let integrityChange = 0;
    let availabilityChange = 0;
    let complianceChange = 0;
    let costChange = 0;
    let trustChange = 0;
    
    // Décisions RSSI - Tour 1
    if (playerRole === 'RSSI' && game.currentTurn === 0) {
      if (choiceId === 'cut-all') {
        integrityChange = +5; // Protège mieux
        availabilityChange = -15; // Impact sévère sur les opérations
        costChange = 20000; // Coût d'arrêt opérationnel
        trustChange = -10; // Frustration interne
      } else if (choiceId === 'isolate-segment') {
        integrityChange = -5; // Moins efficace
        availabilityChange = -5; // Impact limité
        costChange = 5000; 
        trustChange = -2;
      } else if (choiceId === 'wait-forensic') {
        integrityChange = -15; // Risque élevé
        availabilityChange = 0; // Pas d'impact immédiat
        costChange = 0;
        trustChange = +5; // Apprécié pour la prudence
      }
    }
    // Décisions DG - Tour 1
    else if (playerRole === 'DG' && game.currentTurn === 0) {
      if (choiceId === 'inform-board') {
        complianceChange = +10; // Bonne gouvernance
        trustChange = +5; 
        costChange = 0;
      } else if (choiceId === 'internal-only') {
        complianceChange = 0;
        trustChange = -5;
        costChange = 0;
      } else if (choiceId === 'wait-com') {
        complianceChange = -5; // Risque de retard
        trustChange = 0;
        costChange = 2000; // Petite perte de temps
      }
    }
    
    // Appliquer les changements
    setGame(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        integrity: Math.max(0, Math.min(100, prev.metrics.integrity + integrityChange)),
        availability: Math.max(0, Math.min(100, prev.metrics.availability + availabilityChange)),
        compliance: Math.max(0, Math.min(100, prev.metrics.compliance + complianceChange)),
        cost: prev.metrics.cost + costChange,
        trust: Math.max(0, Math.min(100, prev.metrics.trust + trustChange)),
      }
    }));
  };

  // Vérifier si le tour actuel est terminé
  const checkTurnCompletion = () => {
    // Vérifier si toutes les décisions du tour ont été prises
    const currentTurnObj = game.turns[game.currentTurn];
    const humanPlayers = game.players.filter(p => !p.isAI);
    
    const allDecisionsTaken = humanPlayers.every(p => 
      Object.keys(currentTurnObj.decisions).includes(p.id)
    );
    
    if (allDecisionsTaken) {
      // Marquer le tour comme terminé
      setGame(prev => ({
        ...prev,
        turns: prev.turns.map((t, idx) => 
          idx === prev.currentTurn 
            ? { ...t, completed: true, endTime: Date.now() } 
            : t
        )
      }));
      
      // Si ce n'est pas le dernier tour, afficher la boîte de dialogue de fin de tour
      if (game.currentTurn < 5) {
        setTimeout(() => {
          setShowTurnEndDialog(true);
        }, 3000);
      } else {
        // C'est le dernier tour, terminer le jeu
        setTimeout(() => {
          setShowGameOverDialog(true);
          setGame(prev => ({
            ...prev,
            status: 'completed',
            endTime: Date.now()
          }));
        }, 5000);
      }
    }
  };

  // Signaler que le joueur est prêt pour le prochain tour
  const markPlayerReadyForNextTurn = () => {
    const humanPlayer = game.players.find(p => !p.isAI);
    if (!humanPlayer) return;
    
    setPlayersReadyForNextTurn(prev => [...prev, humanPlayer.id]);
    
    // Dans un jeu multi-joueurs réel, on vérifierait si tous les joueurs sont prêts
    // Pour la démo, passer au tour suivant immédiatement
    startTurn(game.currentTurn + 2);
    setShowTurnEndDialog(false);
  };

  // Fonctions API
  const initializeGameOnServer = async () => {
    try {
      setIsProcessing(true);
      setApiError(null);
      
      const response = await fetch('/api/cryptolock/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          players: game.players
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'initialisation du jeu');
      }
      
      const data = await response.json();
      setGameId(data.gameId);
      setGame(prev => ({
        ...prev,
        id: data.gameId,
        ...data.gameState
      }));
      
      return data.gameId;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du jeu:', error);
      setApiError((error as Error).message);
      toast({
        title: "Erreur d'initialisation",
        description: (error as Error).message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const startGameOnServer = async (gameId: string) => {
    try {
      setIsProcessing(true);
      setApiError(null);
      
      const response = await fetch(`/api/cryptolock/${gameId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du démarrage du jeu');
      }
      
      const data = await response.json();
      setGame(prev => ({
        ...prev,
        ...data.gameState
      }));
    } catch (error) {
      console.error('Erreur lors du démarrage du jeu:', error);
      setApiError((error as Error).message);
      toast({
        title: "Erreur de démarrage",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const sendPlayerMessage = async (message: string, playerId: string) => {
    if (!gameId) {
      toast({
        title: "Erreur",
        description: "ID de jeu non trouvé",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      setApiError(null);
      
      const response = await fetch(`/api/cryptolock/${gameId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          playerId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'envoi du message');
      }
      
      const data = await response.json();
      setGame(prev => ({
        ...prev,
        ...data.gameState
      }));
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setApiError((error as Error).message);
      
      toast({
        title: "Erreur de communication",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const makePlayerChoice = async (choiceId: string, messageId: string, playerId: string) => {
    if (!gameId) {
      toast({
        title: "Erreur",
        description: "ID de jeu non trouvé",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      setApiError(null);
      
      const response = await fetch(`/api/cryptolock/${gameId}/choice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          choiceId,
          messageId,
          playerId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la sélection du choix');
      }
      
      const data = await response.json();
      setGame(prev => ({
        ...prev,
        ...data.gameState
      }));
    } catch (error) {
      console.error('Erreur lors de la sélection du choix:', error);
      setApiError((error as Error).message);
      
      toast({
        title: "Erreur de communication",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const refreshGameState = async () => {
    if (!gameId) return;
    
    try {
      setApiError(null);
      
      const response = await fetch(`/api/cryptolock/${gameId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération de l\'état du jeu');
      }
      
      const data = await response.json();
      setGame(prev => ({
        ...prev,
        ...data.gameState
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'état du jeu:', error);
      setApiError((error as Error).message);
    }
  };

  // Rendu des messages
  const renderMessage = (message: GameMessage) => {
    // Pour les décisions, rendu différent
    if (message.type === 'decision') {
      return renderDecisionMessage(message);
    }
    
    let className = "mb-4 p-4 rounded-lg ";
    let headerContent = null;
    
    if (message.type === 'system') {
      className += message.isHighlighted 
        ? "bg-red-950 border-2 border-red-500 text-white" 
        : "bg-neutral-900 text-white";
      
      if (message.isHighlighted) {
        headerContent = (
          <div className="flex items-center mb-2 text-red-400">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span className="text-sm font-semibold">Alerte Système</span>
          </div>
        );
      }
    } else if (message.type === 'player') {
      className += "bg-blue-950 border border-blue-700 text-white";
      headerContent = (
        <div className="flex items-center mb-2 text-blue-400">
          <span className="text-sm font-semibold">{message.sender} ({message.senderRole})</span>
          <span className="ml-auto text-xs text-neutral-400">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
      );
    } else if (message.type === 'ai') {
      className += "bg-neutral-800 border border-neutral-700 text-white";
      headerContent = (
        <div className="flex items-center mb-2 text-neutral-400">
          <span className="text-sm font-semibold">{message.sender} ({message.senderRole})</span>
          <span className="ml-auto text-xs text-neutral-400">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
      );
    } else if (message.type === 'private') {
      className += "bg-purple-950 border border-purple-700 text-white";
      const targetPlayer = game.players.find(p => p.id === message.targetPlayer);
      headerContent = (
        <div className="flex items-center mb-2 text-purple-400">
          <span className="text-sm font-semibold">Message privé pour {targetPlayer?.name} ({targetPlayer?.role})</span>
          <span className="ml-auto text-xs text-neutral-400">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
      );
    }
    
    return (
      <div key={message.id} className={className}>
        {headerContent}
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    );
  };

  // Rendu des messages de décision
  const renderDecisionMessage = (message: GameMessage) => {
    const targetPlayer = game.players.find(p => p.id === message.targetPlayer);
    
    return (
      <Card key={message.id} className="mb-4 bg-amber-950 border-amber-700 text-white">
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-amber-400" />
            <CardTitle className="text-sm text-amber-400">
              Décision pour {targetPlayer?.name} ({targetPlayer?.role})
            </CardTitle>
            <span className="ml-auto text-xs text-neutral-400">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <CardDescription className="text-white">
            {message.content}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!message.selectedOption ? (
            <div className="space-y-2">
              {message.decisions?.map(option => (
                <Button
                  key={option.id}
                  variant="outline"
                  className="w-full justify-start border-amber-600 hover:bg-amber-900 hover:text-white"
                  onClick={() => handleChoiceSelection(option.id, message.id)}
                >
                  {option.text}
                </Button>
              ))}
            </div>
          ) : (
            <div className="p-2 bg-amber-900 border border-amber-700 rounded">
              <p className="text-sm text-white">
                <span className="font-semibold">Décision prise:</span>{' '}
                {message.decisions?.find(d => d.id === message.selectedOption)?.text}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Rendu des métriques de crise
  const renderMetrics = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="p-3">
            <CardTitle className="text-sm flex items-center">
              <div className="bg-red-900 p-1 rounded mr-2">
                <ShieldAlert className="h-4 w-4 text-red-300" />
              </div>
              Intégrité
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <Progress 
              value={game.metrics.integrity} 
              className="h-2" 
              indicatorClassName={cn(
                game.metrics.integrity > 70 ? "bg-green-500" :
                game.metrics.integrity > 40 ? "bg-amber-500" :
                "bg-red-500"
              )} 
            />
            <p className="text-xs mt-1 text-neutral-400">{game.metrics.integrity}%</p>
          </CardContent>
        </Card>
        
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="p-3">
            <CardTitle className="text-sm flex items-center">
              <div className="bg-blue-900 p-1 rounded mr-2">
                <BarChart3 className="h-4 w-4 text-blue-300" />
              </div>
              Disponibilité
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <Progress 
              value={game.metrics.availability} 
              className="h-2" 
              indicatorClassName={cn(
                game.metrics.availability > 70 ? "bg-green-500" :
                game.metrics.availability > 40 ? "bg-amber-500" :
                "bg-red-500"
              )} 
            />
            <p className="text-xs mt-1 text-neutral-400">{game.metrics.availability}%</p>
          </CardContent>
        </Card>
        
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="p-3">
            <CardTitle className="text-sm flex items-center">
              <div className="bg-purple-900 p-1 rounded mr-2">
                <FileText className="h-4 w-4 text-purple-300" />
              </div>
              Conformité
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <Progress 
              value={game.metrics.compliance} 
              className="h-2" 
              indicatorClassName={cn(
                game.metrics.compliance > 70 ? "bg-green-500" :
                game.metrics.compliance > 40 ? "bg-amber-500" :
                "bg-red-500"
              )} 
            />
            <p className="text-xs mt-1 text-neutral-400">{game.metrics.compliance}%</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Rendu conditionnel basé sur l'état du jeu
  const renderGameContent = () => {
    if (game.status === 'setup') {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white">CryptoLock</h2>
              <p className="mt-2 text-lg text-neutral-400">
                Simulation immersive de gestion de crise ransomware
              </p>
            </div>
            
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>
                  Configurez le jeu selon vos besoins
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">
                    Nombre de joueurs humains
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <Button
                        key={num}
                        variant={numberOfPlayers === num ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNumberOfPlayers(num)}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <CyberButton 
                  className="w-full" 
                  onClick={startConfiguration}
                  disabled={numberOfPlayers === 0}
                >
                  Configurer les joueurs
                </CyberButton>
              </CardFooter>
            </Card>
          </div>
        </div>
      );
    } else if (game.status === 'ready') {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white">CryptoLock</h2>
              <p className="mt-2 text-lg text-neutral-400">
                Simulation immersive de gestion de crise ransomware
              </p>
            </div>
            
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle>Prêt à commencer</CardTitle>
                <CardDescription>
                  {game.players.length} participants configurés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-neutral-800 rounded-lg">
                    <h3 className="text-sm font-medium text-white mb-2">Joueurs configurés :</h3>
                    <ul className="space-y-2">
                      {game.players.map(player => (
                        <li key={player.id} className="flex items-center">
                          <Badge variant={player.isAI ? "outline" : "default"} className="mr-2">
                            {player.isAI ? 'IA' : 'Humain'}
                          </Badge>
                          <span>{player.name} - <strong>{player.role}</strong></span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <CyberButton 
                  className="w-full" 
                  onClick={startGame}
                >
                  Lancer la simulation
                </CyberButton>
              </CardFooter>
            </Card>
          </div>
        </div>
      );
    } else if (game.status === 'playing') {
      return (
        <div className="h-full flex flex-col">
          {/* Header avec informations de jeu */}
          <div className="bg-neutral-900 p-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-4">
                <Badge variant="outline" className="bg-red-950 text-red-400 border-red-800">
                  Tour {game.currentTurn + 1}/6
                </Badge>
                <h2 className="text-lg font-bold text-white mt-1">
                  {game.turns[game.currentTurn].title}
                </h2>
              </div>
              
              <div>
                <p className="text-xs text-neutral-400">Temps écoulé</p>
                <p className="text-sm font-mono">{formatElapsedTime(elapsedTime)}</p>
              </div>
              
              <Separator orientation="vertical" className="h-10 mx-4" />
              
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-amber-500 mr-2" />
                <div>
                  <p className="text-xs text-neutral-400">Temps restant</p>
                  <p className={cn(
                    "text-sm font-mono",
                    turnTimeLeft < 60 ? "text-red-500" : 
                    turnTimeLeft < 120 ? "text-amber-500" : "text-white"
                  )}>
                    {formatTurnTimeLeft(turnTimeLeft)}
                  </p>
                </div>
              </div>
              
              <Separator orientation="vertical" className="h-10 mx-4" />
              
              <div>
                <p className="text-xs text-neutral-400">Heure simulée</p>
                <p className="text-sm font-mono">{formatSimulatedTime()}</p>
              </div>
            </div>
            
            <div>
              {/* Afficher les comptes à rebours */}
            </div>
          </div>
          
          {/* Contenu principal avec onglets */}
          <div className="flex-1 flex flex-col">
            <Tabs defaultValue="salle-de-crise" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="border-b border-neutral-800 bg-neutral-900">
                <div className="container mx-auto px-4">
                  <TabsList className="bg-transparent h-12">
                    <TabsTrigger 
                      value="salle-de-crise"
                      className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Salle de crise
                    </TabsTrigger>
                    <TabsTrigger 
                      value="messages-prives"
                      className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Messages privés
                    </TabsTrigger>
                    <TabsTrigger 
                      value="decisions"
                      className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Décisions
                      {game.messages.filter(m => 
                        m.type === 'decision' && 
                        !m.selectedOption && 
                        m.targetPlayer === game.players.find(p => !p.isAI)?.id
                      ).length > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {game.messages.filter(m => 
                            m.type === 'decision' && 
                            !m.selectedOption && 
                            m.targetPlayer === game.players.find(p => !p.isAI)?.id
                          ).length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="journal"
                      className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Journal
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
              
              <div className="flex-1 flex">
                {/* Panneau principal */}
                <div className="flex-1 flex flex-col bg-neutral-950 overflow-hidden">
                  <TabsContent value="salle-de-crise" className="flex-1 flex flex-col p-4 overflow-y-auto data-[state=active]:flex-1 mt-0">
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {getFilteredMessages().map(renderMessage)}
                      <div ref={messagesEndRef} />
                    </div>
                    
                    <div className="mt-auto">
                      <div className="flex">
                        <Input
                          className="bg-neutral-900 border-neutral-700"
                          placeholder="Entrez votre message..."
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handlePlayerMessage()}
                          ref={messageInputRef}
                        />
                        <Button 
                          className="ml-2" 
                          onClick={handlePlayerMessage}
                          disabled={isProcessing || !messageInput.trim()}
                        >
                          {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="messages-prives" className="flex-1 flex flex-col p-4 overflow-y-auto data-[state=active]:flex-1 mt-0">
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {getFilteredMessages().map(renderMessage)}
                      <div ref={messagesEndRef} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="decisions" className="flex-1 flex flex-col p-4 overflow-y-auto data-[state=active]:flex-1 mt-0">
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {getFilteredMessages().length > 0 ? (
                        getFilteredMessages().map(renderMessage)
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                          <Brain className="h-16 w-16 mb-4 opacity-20" />
                          <p>Aucune décision en attente</p>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="journal" className="flex-1 flex flex-col p-4 overflow-y-auto data-[state=active]:flex-1 mt-0">
                    <div className="flex-1 overflow-y-auto space-y-6 mb-4">
                      {Array.from({ length: game.currentTurn + 1 }).map((_, index) => (
                        <div key={index} className="space-y-4">
                          <div className="sticky top-0 bg-neutral-950 pt-2 pb-2 z-10">
                            <Badge variant="outline" className="bg-neutral-900 border-neutral-700">
                              Tour {index + 1}: {game.turns[index].title}
                            </Badge>
                          </div>
                          {getFilteredMessages()
                            .filter(m => m.turnNumber === index + 1)
                            .map(renderMessage)}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </TabsContent>
                </div>
                
                {/* Panneau latéral avec métriques et infos */}
                <div className="w-80 bg-neutral-900 border-l border-neutral-800 p-4 hidden lg:block">
                  <h3 className="text-sm font-semibold text-white mb-4">Indicateurs de crise</h3>
                  {renderMetrics()}
                  
                  <Separator className="my-6" />
                  
                  <h3 className="text-sm font-semibold text-white mb-4">Participants</h3>
                  <div className="space-y-2">
                    {game.players.map(player => (
                      <div key={player.id} className="flex items-center p-2 rounded bg-neutral-800">
                        <div className={cn(
                          "w-2 h-2 rounded-full mr-2",
                          player.isAI ? "bg-amber-500" : "bg-green-500"
                        )} />
                        <span className="text-sm">{player.name}</span>
                        <Badge variant="outline" className="ml-auto">
                          {player.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <h3 className="text-sm font-semibold text-white mb-4">Coût estimé</h3>
                  <div className="p-3 bg-neutral-800 rounded">
                    <p className="text-xl font-mono text-white">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(game.metrics.cost)}
                    </p>
                  </div>
                </div>
              </div>
            </Tabs>
          </div>
        </div>
      );
    } else if (game.status === 'completed') {
      // Affichage du résumé de fin de jeu
      return (
        <div className="h-full flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-4xl space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white">Simulation terminée</h2>
              <p className="mt-2 text-lg text-neutral-400">
                Bilan de la crise ransomware
              </p>
            </div>
            
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle>Résumé</CardTitle>
                <CardDescription>
                  Voici une synthèse de votre gestion de crise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-white mb-2">Indicateurs finaux</h3>
                  {renderMetrics()}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-white mb-2">Coût total estimé</h3>
                  <p className="text-2xl font-mono">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(game.metrics.cost)}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-white mb-2">Décisions clés</h3>
                  <div className="space-y-2">
                    {game.turns.map((turn, index) => {
                      const decisions = Object.entries(turn.decisions);
                      if (decisions.length === 0) return null;
                      
                      return (
                        <div key={index} className="p-3 bg-neutral-800 rounded">
                          <h4 className="text-xs text-neutral-400">Tour {index + 1}: {turn.title}</h4>
                          <ul className="mt-1 space-y-1">
                            {decisions.map(([playerId, choiceId]) => {
                              const player = game.players.find(p => p.id === playerId);
                              const message = game.messages.find(m => 
                                m.type === 'decision' && 
                                m.targetPlayer === playerId &&
                                m.turnNumber === index + 1
                              );
                              const choice = message?.decisions?.find(d => d.id === choiceId);
                              
                              return (
                                <li key={playerId} className="text-sm">
                                  <span className="font-medium">{player?.name} ({player?.role}):</span>{' '}
                                  {choice?.text || 'Décision non trouvée'}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-white mb-2">Évaluation des participants</h3>
                  {game.players.filter(p => !p.isAI).map(player => {
                    // Générer des commentaires personnalisés basés sur les décisions
                    const playerDecisions = game.turns.flatMap((turn, index) => {
                      const choiceId = turn.decisions[player.id];
                      if (!choiceId) return [];
                      
                      const message = game.messages.find(m => 
                        m.type === 'decision' && 
                        m.targetPlayer === player.id &&
                        m.turnNumber === index + 1
                      );
                      
                      const choice = message?.decisions?.find(d => d.id === choiceId);
                      return [{ 
                        turn: index + 1, 
                        title: turn.title,
                        choiceId, 
                        choiceText: choice?.text 
                      }];
                    });
                    
                    // Score basé sur les métriques finales (simplifié)
                    const score = Math.round((
                      game.metrics.integrity * 0.25 + 
                      game.metrics.availability * 0.25 + 
                      game.metrics.compliance * 0.25 + 
                      game.metrics.trust * 0.25
                    ) / 5);
                    
                    return (
                      <Card key={player.id} className="bg-neutral-800 border-neutral-700 mb-4">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{player.name} ({player.role})</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="font-semibold">Note globale:</span> {score}/20
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">Points forts:</span> {' '}
                              {score > 15 ? 'Excellente gestion stratégique et technique.' : 
                               score > 10 ? 'Bonnes décisions dans l\'ensemble, quelques points à améliorer.' :
                               'Vous avez su rester calme face à la situation de crise.'}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">Points d'amélioration:</span> {' '}
                              {score > 15 ? 'Communication d\'équipe à optimiser.' : 
                               score > 10 ? 'Réactivité et analyse de risque à affiner.' :
                               'Approfondissement technique et anticipation des menaces recommandés.'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => window.location.reload()}
                >
                  Recommencer une simulation
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="h-screen bg-neutral-950 text-white flex flex-col">
      {renderGameContent()}
      
      {/* Boîte de dialogue de configuration des joueurs */}
      <AlertDialog open={showPlayerSetupDialog}>
        <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Configuration du joueur {currentPlayerSetup + 1}/{numberOfPlayers}</AlertDialogTitle>
            <AlertDialogDescription>
              Entrez les informations du joueur
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prénom</label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Entrez votre prénom"
                className="bg-neutral-800 border-neutral-700"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Rôle</label>
              <div className="grid grid-cols-2 gap-2">
                {availableRoles.map(role => (
                  <Button
                    key={role}
                    variant={playerRole === role ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPlayerRole(role)}
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={addHumanPlayer}
              disabled={!playerName.trim() || !playerRole}
            >
              {currentPlayerSetup + 1 >= numberOfPlayers ? 'Terminer' : 'Suivant'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Boîte de dialogue de fin de tour */}
      <AlertDialog open={showTurnEndDialog}>
        <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Fin du Tour {game.currentTurn + 1}</AlertDialogTitle>
            <AlertDialogDescription>
              Tour terminé : {game.turns[game.currentTurn].title}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <div className="p-3 bg-neutral-800 rounded mb-4">
              <h3 className="text-sm font-medium text-white mb-2">Résultats du tour</h3>
              {renderMetrics()}
            </div>
            
            <p className="text-sm mt-4">
              Êtes-vous prêt à passer au Tour {game.currentTurn + 2} ?
            </p>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogAction onClick={markPlayerReadyForNextTurn}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Passer au Tour {game.currentTurn + 2}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Boîte de dialogue de fin de jeu */}
      <AlertDialog open={showGameOverDialog}>
        <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Simulation terminée</AlertDialogTitle>
            <AlertDialogDescription>
              Vous avez terminé les 6 tours de la simulation
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <p className="mb-4">
              Un bilan complet de votre gestion de crise est disponible.
            </p>
            
            <div className="p-3 bg-neutral-800 rounded mb-4">
              <h3 className="text-sm font-medium text-white mb-2">État final des indicateurs</h3>
              {renderMetrics()}
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => {
                setShowGameOverDialog(false);
                setGame(prev => ({ ...prev, status: 'completed' }));
              }}
            >
              Voir le bilan complet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}