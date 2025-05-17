import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import HomeLayout from '@/components/layout/HomeLayout';
import {
  AlertTriangle, 
  Clock, 
  Shield, 
  Server, 
  Database, 
  User, 
  Users, 
  BarChart2,
  MessageSquare,
  Lock,
  Unlock,
  Send,
  RefreshCw,
  Play,
  Pause,
  Zap,
  X,
  ChevronRight,
  Terminal,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// Les types de messages d'alerte
type AlertLevel = 'critique' | 'haute' | 'moyenne' | 'basse';
type NotificationType = 'alert' | 'system' | 'message';

// Format des alertes dans les scénarios
interface ScenarioAlert {
  id: string;
  type: string;
  level?: string;
  source: string;
  title: string;
  content: string;
  timestamp: Date;
}

// Structure d'une notification
interface Notification {
  id: string;
  type: NotificationType;
  level?: AlertLevel;
  source: string;
  title: string;
  content: string;
  timestamp: Date;
}

// Structure d'un message de discussion
interface Message {
  id: string;
  sender: {
    name: string;
    role: string;
    avatar: string;
  };
  content: string;
  timestamp: Date;
  isUser: boolean;
}

// Scénarios de crise prédéfinis
const crisisScenarios = [
  {
    id: 'ransomware',
    title: 'Attaque Ransomware Critique',
    description: 'Des fichiers chiffrés ont été détectés sur plusieurs serveurs critiques. Une demande de rançon a été reçue.',
    systems: ['Serveurs de production', 'Partages de fichiers', 'Bases de données clients'],
    initialAlerts: [
      {
        id: 'alert-1',
        type: 'alert',
        level: 'critique',
        source: 'EDR - SentinelOne',
        title: 'Activité ransomware détectée',
        content: 'Des signatures de ransomware ont été identifiées sur plusieurs serveurs. Plusieurs fichiers sensibles ont été chiffrés.',
        timestamp: new Date()
      },
      {
        id: 'alert-2',
        type: 'system',
        source: 'SOC',
        title: 'Anomalie de trafic réseau',
        content: 'Détection de trafic réseau anormal vers des serveurs externes inconnus durant la nuit.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000)
      }
    ]
  },
  {
    id: 'data-breach',
    title: 'Violation de données client massive',
    description: 'Une exfiltration massive de données clients a été détectée. Données personnelles et financières potentiellement compromises.',
    systems: ['Base de données clients', 'Serveurs CRM', 'Applications web commerciales'],
    initialAlerts: [
      {
        id: 'alert-1',
        type: 'alert',
        level: 'critique',
        source: 'DLP - Forcepoint',
        title: 'Exfiltration massive de données',
        content: 'Détection d\'un transfert anormal de données sensibles vers des points de terminaison externes non autorisés.',
        timestamp: new Date()
      },
      {
        id: 'alert-2',
        type: 'system',
        source: 'CERT Interne',
        title: 'Compromission d\'identifiants',
        content: 'Des identifiants administratifs ont été utilisés pour accéder à des ressources sensibles en dehors des heures normales.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000)
      }
    ]
  },
  {
    id: 'apt-attack',
    title: 'Intrusion APT en cours',
    description: 'Un acteur menaçant sophistiqué a pénétré le réseau et maintient une présence persistante depuis plusieurs semaines.',
    systems: ['Infrastructure DNS', 'Contrôleurs de domaine', 'Systèmes d\'authentification'],
    initialAlerts: [
      {
        id: 'alert-1',
        type: 'alert',
        level: 'haute',
        source: 'EDR - CrowdStrike',
        title: 'Comportement d\'APT détecté',
        content: 'Techniques de mouvement latéral et d\'élévation de privilèges correspondant à des groupes APT connus.',
        timestamp: new Date()
      },
      {
        id: 'alert-2',
        type: 'system',
        source: 'Threat Intelligence',
        title: 'Indicateurs de compromission identifiés',
        content: 'Les IOCs détectés correspondent à la campagne "ShadowHarvest" ciblant votre secteur d\'activité.',
        timestamp: new Date(Date.now() - 120 * 60 * 1000)
      }
    ]
  }
];

// Membres de l'équipe de crise avec différents rôles
const crisisTeamMembers = [
  {
    id: 'soc-lead',
    name: 'Thomas Girard',
    role: 'Responsable SOC',
    expertise: 'Analyse technique des incidents',
    avatar: 'TG',
    firstMessage: "Monsieur/Madame le/la RSSI, nous avons une situation critique en cours. J'ai mobilisé l'équipe d'incident response et nous sommes en train d'analyser l'étendue de la compromission.",
    delay: 5000
  },
  {
    id: 'ciso',
    name: 'Marie Lambert',
    role: 'Directrice Sécurité',
    expertise: 'Gestion stratégique des incidents',
    avatar: 'ML',
    firstMessage: "Le Comité de Direction demande un point de situation dans 30 minutes. Nous devons préparer une analyse préliminaire et les premières recommandations d'urgence.",
    delay: 12000
  },
  {
    id: 'cio',
    name: 'Laurent Dubois',
    role: 'DSI',
    expertise: 'Infrastructure et opérations IT',
    avatar: 'LD',
    firstMessage: "Je suis en ligne avec les équipes IT. Quelles mesures d'urgence devons-nous mettre en place? L'isolement des systèmes critiques va impacter nos opérations.",
    delay: 20000
  },
  {
    id: 'legal',
    name: 'Sophie Renard',
    role: 'Directrice Juridique',
    expertise: 'Conformité et obligations légales',
    avatar: 'SR',
    firstMessage: "Nous devons évaluer nos obligations réglementaires de notification. Si des données personnelles sont compromises, nous avons 72h pour notifier la CNIL.",
    delay: 35000
  },
  {
    id: 'comms',
    name: 'Alexandre Martin',
    role: 'Directeur Communication',
    expertise: 'Communication de crise',
    avatar: 'AM',
    firstMessage: "Les équipes de communication sont en attente. J'ai besoin de directives sur les messages internes et externes à préparer en cas d'escalade de la situation.",
    delay: 50000
  },
  {
    id: 'ceo',
    name: 'Philippe Legrand',
    role: 'PDG',
    expertise: 'Direction exécutive',
    avatar: 'PL',
    firstMessage: "Je viens d'être informé de la situation. J'ai besoin d'un rapport direct de votre part sur la gravité de l'incident et l'impact sur la continuité de nos activités.",
    delay: 80000
  }
];

// Options de décision pour la première phase (communes à tous les scénarios)
const initialDecisions = [
  {
    id: 'isolate-network',
    text: 'Isoler les systèmes critiques du réseau',
    impact: {
      security: 'Réduit la propagation',
      operations: 'Impact opérationnel majeur',
      legal: 'Démontre une action responsable',
      reputation: 'Montre proactivité'
    }
  },
  {
    id: 'monitor-analyze',
    text: 'Continuer à surveiller et analyser sans isoler',
    impact: {
      security: 'Risque de propagation',
      operations: 'Continuité des opérations',
      legal: 'Position plus difficile à défendre',
      reputation: 'Risque de critique pour inaction'
    }
  },
  {
    id: 'activate-crisis',
    text: 'Activer formellement la cellule de crise',
    impact: {
      security: 'Mobilisation des experts',
      operations: 'Perturbation organisationnelle',
      legal: 'Procédures formelles documentées',
      reputation: 'Démontre le sérieux de la situation'
    }
  }
];

// Effets sonores pour l'immersion
const alarmSound = '/sounds/alarm.mp3'; // À remplacer par les chemins réels si disponibles
const notificationSound = '/sounds/notification.mp3';
const messageSound = '/sounds/message.mp3';

export default function ImmersiveCrisis() {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const alarmRef = useRef<HTMLAudioElement>(null);
  const notificationRef = useRef<HTMLAudioElement>(null);
  const messagesRef = useRef<HTMLAudioElement>(null);
  
  // États
  const [phase, setPhase] = useState<'intro' | 'alert' | 'crisis' | 'debrief'>('intro');
  const [scenarioIndex, setScenarioIndex] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userMessage, setUserMessage] = useState<string>('');
  const [selectedTeamMember, setSelectedTeamMember] = useState<string | null>(null);
  const [showDecisions, setShowDecisions] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [showBrief, setShowBrief] = useState<boolean>(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>(['# Console de sécurité initialisée', '> Détection des menaces en cours...']);
  
  // Timers
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scenarioTimersRef = useRef<NodeJS.Timeout[]>([]);
  
  // Génère un identifiant unique
  const generateId = () => Math.random().toString(36).substring(2, 11);
  
  // Obtenir le scenario actif
  const currentScenario = crisisScenarios[scenarioIndex];
  
  // Démarrer la crise avec un scénario aléatoire
  const startRandomCrisis = () => {
    const randomIndex = Math.floor(Math.random() * crisisScenarios.length);
    setScenarioIndex(randomIndex);
    setPhase('alert');
    
    // Jouer le son d'alarme
    if (isSoundEnabled && alarmRef.current) {
      alarmRef.current.play();
    }
    
    // Ajouter les alertes initiales avec un délai
    setTimeout(() => {
      // Convertir les alertes pour s'assurer que les types sont corrects
      const typedAlerts: Notification[] = crisisScenarios[randomIndex].initialAlerts.map(alert => ({
        ...alert,
        type: alert.type as NotificationType,
        level: alert.level as AlertLevel | undefined
      }));
      
      setNotifications(typedAlerts);
      
      // Ajouter automatiquement les premiers messages des membres de l'équipe
      scheduleTeamMessages();
      
      // Démarrer le timer
      startTimer();
      
      // Après quelques secondes, afficher les options de décision
      setTimeout(() => {
        setShowDecisions(true);
      }, 15000);
      
      // Ajouter des entrées console
      addConsoleOutput(['# Alerte de sécurité détectée', `> Scénario: ${crisisScenarios[randomIndex].title}`]);
    }, 3000);
  };
  
  // Planifier les messages automatiques des membres de l'équipe
  const scheduleTeamMessages = () => {
    // Effacer les timers existants
    scenarioTimersRef.current.forEach(timer => clearTimeout(timer));
    scenarioTimersRef.current = [];
    
    // Programmer les nouveaux messages
    crisisTeamMembers.forEach(member => {
      const timer = setTimeout(() => {
        addMessage({
          id: generateId(),
          sender: {
            name: member.name,
            role: member.role,
            avatar: member.avatar
          },
          content: member.firstMessage,
          timestamp: new Date(),
          isUser: false
        });
      }, member.delay);
      
      scenarioTimersRef.current.push(timer);
    });
  };
  
  // Ajouter un message à la conversation
  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    
    // Jouer le son de notification
    if (isSoundEnabled && messagesRef.current && !message.isUser) {
      messagesRef.current.play();
    }
    
    // Faire défiler vers le bas
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  // Saisir au clavier
  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserMessage(e.target.value);
  };
  
  // Envoyer un message
  const sendMessage = () => {
    if (!userMessage.trim() || !selectedTeamMember) {
      toast({
        title: "Message incomplet",
        description: "Veuillez sélectionner un destinataire et saisir un message.",
        variant: "destructive",
      });
      return;
    }
    
    // Ajouter le message de l'utilisateur
    const userMsg: Message = {
      id: generateId(),
      sender: {
        name: 'Vous (RSSI)',
        role: 'Responsable Sécurité',
        avatar: 'RS'
      },
      content: userMessage,
      timestamp: new Date(),
      isUser: true
    };
    
    addMessage(userMsg);
    setUserMessage('');
    
    // Ajouter de nouveaux outputs console
    addConsoleOutput([`$ message envoyé à ${selectedTeamMember}`, `> traitement des directives...`]);
    
    // Simuler une réponse après un délai (à remplacer par l'appel à l'IA)
    const member = crisisTeamMembers.find(m => m.id === selectedTeamMember);
    if (member) {
      setTimeout(() => {
        // Ici on pourrait appeler l'API IA pour générer une réponse contextuelle
        const responseMsg: Message = {
          id: generateId(),
          sender: {
            name: member.name,
            role: member.role,
            avatar: member.avatar
          },
          content: `En réponse à vos instructions, je vais procéder immédiatement. ${generateContextualResponse(userMessage, member.role)}`,
          timestamp: new Date(),
          isUser: false
        };
        
        addMessage(responseMsg);
      }, 1500 + Math.random() * 2000);
    }
  };
  
  // Générer une réponse contextuelle basique (à remplacer par l'appel à l'IA)
  const generateContextualResponse = (userMessage: string, role: string) => {
    // Version simplifiée pour la démo
    if (userMessage.toLowerCase().includes('isoler') || userMessage.toLowerCase().includes('couper')) {
      return 'Je vais immédiatement procéder à l\'isolation des systèmes concernés.';
    } else if (userMessage.toLowerCase().includes('analyse') || userMessage.toLowerCase().includes('investigation')) {
      return 'Je lance une analyse approfondie et vous tiendrai informé des résultats dès que possible.';
    } else if (userMessage.toLowerCase().includes('communication') || userMessage.toLowerCase().includes('notification')) {
      return 'Je prépare les communications comme demandé et vous soumettrai une proposition rapidement.';
    }
    
    return 'Je m\'en occupe immédiatement et vous ferai un retour dès que possible.';
  };
  
  // Prendre une décision
  const makeDecision = (decisionId: string) => {
    // Trouver la décision correspondante
    const decision = initialDecisions.find(d => d.id === decisionId);
    
    if (decision) {
      toast({
        title: "Décision validée",
        description: `Vous avez choisi: ${decision.text}`,
      });
      
      setShowDecisions(false);
      
      // Ajouter une notification système concernant la décision
      const notif: Notification = {
        id: generateId(),
        type: 'system',
        source: 'Cellule de crise',
        title: 'Décision stratégique prise',
        content: `Le RSSI a décidé de ${decision.text.toLowerCase()}.`,
        timestamp: new Date()
      };
      
      setNotifications(prev => [...prev, notif]);
      
      // Ajouter un message automatique basé sur la décision
      setTimeout(() => {
        if (decisionId === 'isolate-network') {
          addMessage({
            id: generateId(),
            sender: {
              name: 'Laurent Dubois',
              role: 'DSI',
              avatar: 'LD'
            },
            content: "L'isolation du réseau est en cours. Les équipes sont mobilisées mais des services critiques sont maintenant inaccessibles. Les utilisateurs commencent à appeler le support.",
            timestamp: new Date(),
            isUser: false
          });
        } else if (decisionId === 'monitor-analyze') {
          addMessage({
            id: generateId(),
            sender: {
              name: 'Thomas Girard',
              role: 'Responsable SOC',
              avatar: 'TG'
            },
            content: "Nous continuons l'analyse sans isoler le réseau. Attention, nous observons des signes que l'attaquant est toujours actif et continue d'accéder à nos systèmes.",
            timestamp: new Date(),
            isUser: false
          });
        } else if (decisionId === 'activate-crisis') {
          addMessage({
            id: generateId(),
            sender: {
              name: 'Marie Lambert',
              role: 'Directrice Sécurité',
              avatar: 'ML'
            },
            content: "La cellule de crise est officiellement activée. J'ai informé tous les membres clés et le premier point de situation aura lieu dans 15 minutes. Quelles sont vos directives immédiates?",
            timestamp: new Date(),
            isUser: false
          });
        }
      }, 5000);
      
      // Ajouter des sorties console
      addConsoleOutput([
        `# Décision enregistrée: ${decision.text}`,
        `> Impact sécurité: ${decision.impact.security}`,
        `> Impact opérationnel: ${decision.impact.operations}`
      ]);
      
      // Avancer la simulation
      setTimeout(() => {
        // Ajouter de nouvelles alertes en fonction de la décision
        addScenarioDevelopment(decisionId);
      }, 15000);
    }
  };
  
  // Ajouter une évolution du scénario basée sur la décision prise
  const addScenarioDevelopment = (decisionId: string) => {
    if (decisionId === 'isolate-network') {
      const newAlert: Notification = {
        id: generateId(),
        type: 'alert',
        level: 'haute',
        source: 'Infrastructure',
        title: 'Impact opérationnel critique',
        content: 'L\'isolation des systèmes a empêché la propagation de l\'attaque mais a rendu plusieurs services métiers critiques indisponibles.',
        timestamp: new Date()
      };
      
      setNotifications(prev => [...prev, newAlert]);
    } else if (decisionId === 'monitor-analyze') {
      const newAlert: Notification = {
        id: generateId(),
        type: 'alert',
        level: 'critique',
        source: 'EDR',
        title: 'Propagation de la compromission',
        content: 'L\'attaquant a étendu son accès à d\'autres systèmes critiques. Des données supplémentaires sont en cours d\'exfiltration.',
        timestamp: new Date()
      };
      
      setNotifications(prev => [...prev, newAlert]);
    } else if (decisionId === 'activate-crisis') {
      const newAlert: Notification = {
        id: generateId(),
        type: 'system',
        source: 'Cellule de crise',
        title: 'Mobilisation des équipes',
        content: 'Toutes les équipes nécessaires ont été mobilisées. Les premières analyses sont en cours et un plan de remédiation est en préparation.',
        timestamp: new Date()
      };
      
      setNotifications(prev => [...prev, newAlert]);
    }
  };
  
  // Démarrer le timer
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      if (!isPaused) {
        setElapsedTime(prev => prev + 1);
      }
    }, 1000);
  };
  
  // Formater le temps écoulé
  const formatElapsedTime = () => {
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Ajouter des lignes à la console
  const addConsoleOutput = (lines: string[]) => {
    setConsoleOutput(prev => [...prev, ...lines]);
  };
  
  // Nettoyer les timers à la déconnexion
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      scenarioTimersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, []);
  
  // Faire défiler la console vers le bas lorsqu'elle est mise à jour
  useEffect(() => {
    const consoleElement = document.getElementById('security-console');
    if (consoleElement) {
      consoleElement.scrollTop = consoleElement.scrollHeight;
    }
  }, [consoleOutput]);
  
  // Animation des bulles cybernétiques en arrière-plan (effet visuel)
  const renderCyberBubbles = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-500/10 border border-blue-500/20"
            style={{
              width: `${20 + Math.random() * 100}px`,
              height: `${20 + Math.random() * 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${10 + Math.random() * 20}s`,
              animationDelay: `${Math.random() * 5}s`,
              animation: 'float infinite'
            }}
          />
        ))}
        <style>{`
          @keyframes float {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 0.1;
            }
            50% {
              transform: translate(20px, -20px) scale(1.2);
              opacity: 0.3;
            }
            100% {
              transform: translate(0, 0) scale(1);
              opacity: 0.1;
            }
          }
        `}</style>
      </div>
    );
  };
  
  // Rendu de l'écran d'introduction
  const renderIntroScreen = () => {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-amber-500"
        >
          Alerte Critique Imminente
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-gray-300 mb-8"
        >
          Une brèche de sécurité a été détectée dans les systèmes critiques de l'entreprise.
          <strong className="block mt-2">En tant que RSSI, vous devez prendre le contrôle de la situation.</strong>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-8 max-w-2xl"
        >
          <h2 className="text-xl font-bold mb-3 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            Votre mission
          </h2>
          <p className="text-gray-300 mb-4">
            Vous allez être plongé dans une simulation de crise cyber en temps réel. Vous devrez :
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4">
            <li>Analyser la menace et évaluer son impact</li>
            <li>Coordonner l'équipe de gestion de crise</li>
            <li>Prendre des décisions critiques sous pression</li>
            <li>Communiquer efficacement avec les parties prenantes</li>
            <li>Gérer la réponse à l'incident et la continuité d'activité</li>
          </ul>
          <p className="text-gray-300 italic">
            Vos décisions auront des conséquences directes sur l'évolution de la crise.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white"
            onClick={startRandomCrisis}
          >
            <AlertTriangle className="mr-2 h-5 w-5" />
            ACTIVER LE CENTRE DE CRISE
          </Button>
        </motion.div>
      </div>
    );
  };
  
  // Rendu de l'écran d'alerte
  const renderAlertScreen = () => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4"
      >
        <div className="w-full max-w-4xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-red-950/50 border-2 border-red-500 rounded-lg p-8 mb-6 text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-red-500 mb-2">ALERTE DE SÉCURITÉ CRITIQUE</h1>
            <p className="text-xl text-red-200 mb-6">Incident en cours - Réponse immédiate requise</p>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 bg-black/50 border border-red-500/30 rounded p-4 text-left">
                <h3 className="text-lg font-semibold text-red-300 mb-2">Incident détecté</h3>
                <p className="text-gray-300">{currentScenario.title}</p>
                <p className="text-sm text-gray-400 mt-2">{currentScenario.description}</p>
              </div>
              
              <div className="flex-1 bg-black/50 border border-red-500/30 rounded p-4 text-left">
                <h3 className="text-lg font-semibold text-red-300 mb-2">Systèmes affectés</h3>
                <ul className="text-gray-300 list-disc list-inside space-y-1">
                  {currentScenario.systems.map((system, index) => (
                    <li key={index}>{system}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="text-left bg-black/50 border border-red-500/30 rounded p-4 mb-8">
              <h3 className="text-lg font-semibold text-red-300 mb-2">Instructions</h3>
              <p className="text-gray-300 mb-2">
                En tant que RSSI (Responsable de la Sécurité des Systèmes d'Information), votre intervention immédiate est requise.
              </p>
              <p className="text-gray-300">
                Le centre de crise est activé. Rejoignez-le immédiatement pour coordonner la réponse à l'incident.
              </p>
            </div>
            
            <div className="flex items-center justify-center">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => setPhase('crisis')}
              >
                <AlertTriangle className="mr-2 h-5 w-5" />
                ACCÉDER AU CENTRE DE CRISE
              </Button>
            </div>
          </motion.div>
          
          <div className="flex justify-center">
            <p className="text-sm text-gray-500">SIMULATION D'ENTRAÎNEMENT - NON RÉEL</p>
          </div>
        </div>
        
        {/* Barre de progression qui se remplit automatiquement */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 3 }}
          className="fixed bottom-0 left-0 h-1 bg-red-500"
        />
      </motion.div>
    );
  };
  
  // Rendu du centre de crise
  const renderCrisisCenter = () => {
    return (
      <div className="min-h-screen bg-[#0a0a12] text-white overflow-hidden flex flex-col">
        {/* Header avec statut et temps écoulé */}
        <header className="bg-gray-900/80 border-b border-red-900/50 p-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center">
            <div className="p-1.5 bg-red-900/30 rounded-md mr-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Centre de Crise</h1>
              <div className="flex items-center text-xs text-gray-400">
                <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {new Date().toLocaleTimeString()}</span>
                <span className="mx-2">|</span>
                <span className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-red-500 mr-1.5 animate-pulse"></span>
                  Incident en cours: {currentScenario.title}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
              onClick={() => setShowBrief(!showBrief)}
            >
              <Info className="h-4 w-4 mr-1" />
              Brief
            </Button>
            
            <div className="bg-gray-800 text-gray-300 border border-gray-700 rounded px-3 py-1.5 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="font-mono">{formatElapsedTime()}</span>
              <Button
                variant="ghost"
                size="sm"
                className="p-0.5 h-6 w-6"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-300"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            >
              {isSoundEnabled ? (
                <span className="flex items-center"><Zap className="h-4 w-4" /></span>
              ) : (
                <span className="flex items-center"><Zap className="h-4 w-4 opacity-50" /></span>
              )}
            </Button>
          </div>
        </header>
        
        {/* Contenu principal */}
        <div className="flex-grow flex flex-col md:flex-row h-[calc(100vh-60px)]">
          {/* Panneau latéral gauche (22%) */}
          <div className="w-full md:w-[22%] border-r border-gray-800 flex flex-col">
            <div className="p-3 border-b border-gray-800 bg-gray-900/50">
              <h2 className="text-sm font-semibold flex items-center">
                <Shield className="h-4 w-4 mr-2 text-blue-400" />
                Équipe de crise
              </h2>
            </div>
            
            <ScrollArea className="flex-grow">
              <div className="p-1.5">
                {crisisTeamMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center gap-2 p-2 rounded mb-1 cursor-pointer transition-colors ${
                      selectedTeamMember === member.id
                        ? 'bg-blue-900/30 border border-blue-500/30'
                        : 'border border-transparent hover:bg-gray-800/80'
                    }`}
                    onClick={() => setSelectedTeamMember(member.id)}
                  >
                    <div className="h-8 w-8 bg-gray-800 rounded-full flex items-center justify-center text-sm border border-gray-700">
                      {member.avatar}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-medium text-sm truncate">{member.name}</p>
                      <p className="text-xs text-gray-400 truncate">{member.role}</p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {/* Console de sécurité */}
            <div className="h-1/3 border-t border-gray-800 flex flex-col">
              <div className="p-2 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-xs font-mono flex items-center">
                  <Terminal className="h-3 w-3 mr-1.5 text-gray-400" />
                  Console Sécurité
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => setConsoleOutput(['# Console réinitialisée', '> Analyse en cours...'])}
                >
                  <RefreshCw className="h-3 w-3 text-gray-500" />
                </Button>
              </div>
              <div 
                id="security-console"
                className="flex-grow bg-black font-mono text-xs text-green-500 p-2 overflow-auto"
              >
                {consoleOutput.map((line, i) => (
                  <div key={i} className={
                    line.startsWith('#') 
                      ? 'text-yellow-500 font-bold' 
                      : line.startsWith('>') 
                        ? 'text-blue-400' 
                        : line.startsWith('$') 
                          ? 'text-purple-400'
                          : ''
                  }>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Panneau central (48%) */}
          <div className="w-full md:w-[48%] flex flex-col border-r border-gray-800">
            <div className="p-3 border-b border-gray-800 bg-gray-900/50">
              <h2 className="text-sm font-semibold flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-blue-400" />
                Communications
              </h2>
            </div>
            
            <ScrollArea className="flex-grow">
              <div className="p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] p-3 rounded-lg ${
                        message.isUser
                          ? 'bg-blue-600/30 border border-blue-500/30 text-white ml-auto'
                          : 'bg-gray-800/80 border border-gray-700/50 text-white'
                      }`}
                    >
                      {!message.isUser && (
                        <div className="flex items-center mb-1.5">
                          <div className="h-6 w-6 bg-gray-700 rounded-full flex items-center justify-center text-xs mr-2">
                            {message.sender.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{message.sender.name}</p>
                            <p className="text-xs text-gray-400">{message.sender.role}</p>
                          </div>
                          <span className="ml-auto text-xs text-gray-500">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                      
                      <div className={`text-sm ${message.isUser ? '' : 'pl-8'}`}>
                        {message.content}
                      </div>
                      
                      {message.isUser && (
                        <div className="flex justify-end mt-1">
                          <span className="text-xs text-gray-400">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Zone de saisie */}
            <div className="p-3 border-t border-gray-800 bg-gray-900/50">
              <div className="flex gap-2 mb-2">
                <select
                  className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 flex-grow"
                  value={selectedTeamMember || ''}
                  onChange={(e) => setSelectedTeamMember(e.target.value)}
                >
                  <option value="">Sélectionnez un destinataire...</option>
                  {crisisTeamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2">
                <Textarea
                  placeholder="Entrez votre message..."
                  className="min-h-[80px] resize-none bg-gray-800 border border-gray-700 text-white"
                  value={userMessage}
                  onChange={handleTyping}
                />
                <Button 
                  className="self-end"
                  onClick={sendMessage}
                  disabled={!selectedTeamMember || !userMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Panneau droit (30%) */}
          <div className="w-full md:w-[30%] flex flex-col">
            <div className="p-3 border-b border-gray-800 bg-gray-900/50">
              <h2 className="text-sm font-semibold flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                Alertes et notifications
              </h2>
            </div>
            
            <ScrollArea className="flex-grow">
              <div className="p-3 space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.type === 'alert'
                        ? notification.level === 'critique'
                          ? 'bg-red-950/30 border-red-500/50'
                          : notification.level === 'haute'
                            ? 'bg-amber-950/30 border-amber-500/50'
                            : notification.level === 'moyenne'
                              ? 'bg-yellow-950/30 border-yellow-500/50'
                              : 'bg-blue-950/30 border-blue-500/50'
                        : 'bg-gray-800/80 border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center">
                        {notification.type === 'alert' ? (
                          <AlertTriangle className={`h-4 w-4 mr-2 ${
                            notification.level === 'critique'
                              ? 'text-red-500'
                              : notification.level === 'haute'
                                ? 'text-amber-500'
                                : notification.level === 'moyenne'
                                  ? 'text-yellow-500'
                                  : 'text-blue-500'
                          }`} />
                        ) : (
                          <Server className="h-4 w-4 mr-2 text-blue-400" />
                        )}
                        <span className="text-xs text-gray-400">{notification.source}</span>
                      </div>
                      
                      <span className="text-xs text-gray-500">
                        {notification.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <h3 className="font-medium mb-1">{notification.title}</h3>
                    <p className="text-sm text-gray-300">{notification.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {/* Zone de décision */}
            {showDecisions && (
              <div className="border-t border-gray-800 p-3 bg-gray-900/60">
                <h3 className="font-medium mb-2 flex items-center">
                  <svg className="h-4 w-4 mr-1.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Décision stratégique requise
                </h3>
                
                <div className="space-y-2">
                  {initialDecisions.map((decision) => (
                    <button
                      key={decision.id}
                      className="w-full text-left p-2.5 rounded-md bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-colors"
                      onClick={() => makeDecision(decision.id)}
                    >
                      <p className="font-medium text-sm">{decision.text}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Popup de briefing */}
        {showBrief && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
              <div className="p-4 border-b border-gray-800 flex justify-between">
                <h2 className="text-lg font-bold">Briefing de situation</h2>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowBrief(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-5">
                <div className="mb-5">
                  <h3 className="text-lg font-semibold text-amber-500 mb-2">{currentScenario.title}</h3>
                  <p className="text-gray-300 mb-4">{currentScenario.description}</p>
                  
                  <h4 className="font-medium border-l-2 border-blue-500 pl-3 mb-2">Systèmes affectés</h4>
                  <ul className="list-disc list-inside mb-4 text-gray-300 ml-2">
                    {currentScenario.systems.map((system, i) => (
                      <li key={i}>{system}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-5">
                  <h4 className="font-medium border-l-2 border-blue-500 pl-3 mb-2">Votre rôle: RSSI</h4>
                  <p className="text-gray-300 mb-2">
                    En tant que Responsable de la Sécurité des Systèmes d'Information, vous êtes chargé de :
                  </p>
                  <ul className="list-disc list-inside mb-2 text-gray-300 ml-2">
                    <li>Coordonner la réponse à l'incident</li>
                    <li>Prendre les décisions stratégiques</li>
                    <li>Arbitrer entre sécurité et continuité d'activité</li>
                    <li>Assurer la communication avec les parties prenantes</li>
                    <li>Documenter les actions pour analyse post-incident</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium border-l-2 border-blue-500 pl-3 mb-2">Équipe de crise</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {crisisTeamMembers.map((member) => (
                      <div key={member.id} className="bg-gray-800 rounded p-2 border border-gray-700">
                        <div className="flex items-center mb-1">
                          <div className="h-6 w-6 bg-gray-700 rounded-full flex items-center justify-center text-xs mr-2">
                            {member.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-gray-400">{member.role}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-300 pl-8">{member.expertise}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-800 flex justify-end">
                <Button onClick={() => setShowBrief(false)}>
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Retourner au centre de crise
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <HomeLayout>
      {/* Éléments audio */}
      <audio ref={alarmRef} src={alarmSound} />
      <audio ref={notificationRef} src={notificationSound} />
      <audio ref={messagesRef} src={messageSound} />
      
      {/* Bulles cybernétiques */}
      {renderCyberBubbles()}
      
      {/* Contenu principal */}
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-900 to-black">
        {phase === 'intro' && renderIntroScreen()}
        {phase === 'alert' && renderAlertScreen()}
        {phase === 'crisis' && renderCrisisCenter()}
      </div>
    </HomeLayout>
  );
}