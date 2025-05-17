import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import HomeLayout from '@/components/layout/HomeLayout';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart2,
  Calendar,
  CheckCircle2,
  Clock,
  Code,
  Eye,
  FileText,
  HelpCircle,
  Info,
  Lock,
  MessageCircle,
  Phone,
  PlayCircle,
  Send,
  Server,
  Shield,
  Terminal,
  Timer,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

// Types
interface CrisisTeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  avatarFallback: string;
  expertise: string[];
  availability: 'available' | 'busy' | 'unavailable';
  confidence: number;
  stress: number;
  responseTime: number;
  lastContact?: string;
}

interface Message {
  id: string;
  sender: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  urgent: boolean;
  attachments?: {
    name: string;
    type: string;
    url: string;
  }[];
  decisions?: {
    id: string;
    text: string;
    impact: 'positive' | 'negative' | 'neutral';
    timeImpact: number;
    securityImpact: number;
    reputationImpact: number;
    costImpact: number;
  }[];
}

interface Indicator {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  critical: number;
  danger: number;
  warning: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

interface Alert {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  source: string;
  description: string;
  status: 'new' | 'investigating' | 'mitigated' | 'resolved';
}

interface CrisisScenario {
  id: string;
  title: string;
  description: string;
  threat: string;
  initialMessage: string;
  timeLimit: number; // en minutes
  difficulty: 'basique' | 'intermédiaire' | 'avancé' | 'expert';
  phases: {
    id: string;
    name: string;
    description: string;
    alerts: Alert[];
    messages: Message[];
    decisions: {
      id: string;
      text: string;
      options: {
        id: string;
        text: string;
        impact: {
          security: number;
          time: number;
          reputation: number;
          cost: number;
        };
        consequences: string[];
        triggers?: string[];
      }[];
    }[];
    timeTriggers: {
      time: number; // en secondes depuis le début de la phase
      action: 'alert' | 'message' | 'indicator' | 'decision';
      target: string; // ID de l'alerte, message, etc.
    }[];
  }[];
}

// Le scénario de la crise "Ransomware critique"
const ransomwareScenario: CrisisScenario = {
  id: 'critical-ransomware',
  title: 'Attaque Ransomware Critique',
  description: 'Une attaque ransomware sophistiquée a infecté les systèmes critiques de l\'entreprise, chiffrant des données sensibles et menaçant les opérations.',
  threat: 'Groupe de cybercriminels sophistiqué utilisant un ransomware de type double extorsion',
  initialMessage: 'ALERTE CRITIQUE: Les serveurs de production sont inaccessibles. Plusieurs utilisateurs signalent des messages de rançon sur leurs écrans.',
  timeLimit: 120, // 2 heures en minutes
  difficulty: 'avancé',
  phases: [
    {
      id: 'phase-1',
      name: 'Détection et confinement initial',
      description: 'Détecter l\'étendue de l\'infection et prendre les premières mesures de confinement',
      alerts: [
        {
          id: 'alert-1',
          title: 'Multiples serveurs inaccessibles',
          severity: 'critical',
          timestamp: new Date(),
          source: 'Monitoring système',
          description: 'Plusieurs serveurs de production ne répondent plus. Les journaux montrent de nombreuses tentatives d\'accès avant la perte de connexion.',
          status: 'new'
        },
        {
          id: 'alert-2',
          title: 'Ransomware détecté',
          severity: 'critical',
          timestamp: new Date(Date.now() + 2 * 60 * 1000), // +2 minutes
          source: 'EDR',
          description: 'L\'EDR a identifié des signatures connues du ransomware BlackCat/ALPHV sur plusieurs postes. Plusieurs fichiers ont été chiffrés.',
          status: 'new'
        }
      ],
      messages: [
        {
          id: 'msg-1',
          sender: 'Daniel Martin',
          senderId: 'team-1',
          content: 'Nos systèmes de détection ont identifié une activité suspecte massive. Plusieurs serveurs de production ne répondent plus et nous avons des rapports d\'utilisateurs voyant des messages de rançon. J\'ai besoin de vos directives immédiates.',
          timestamp: new Date(),
          read: false,
          urgent: true
        },
        {
          id: 'msg-2',
          sender: 'Julie Leblanc',
          senderId: 'team-2',
          content: 'L\'équipe d\'assistance reçoit de nombreux appels d\'utilisateurs. Leurs fichiers sont inaccessibles et un message exige une rançon de 2 millions d\'euros en cryptomonnaie. Que devons-nous leur dire ?',
          timestamp: new Date(Date.now() + 3 * 60 * 1000), // +3 minutes
          read: false,
          urgent: true
        }
      ],
      decisions: [
        {
          id: 'decision-1',
          text: 'Comment réagir immédiatement à cette crise ?',
          options: [
            {
              id: 'option-1-1',
              text: 'Isoler immédiatement le réseau de l\'entreprise d\'Internet',
              impact: {
                security: 80,
                time: -20,
                reputation: -10,
                cost: -20
              },
              consequences: [
                'L\'isolation limite la propagation du ransomware',
                'Les communications externes sont coupées',
                'Les services cloud deviennent inaccessibles'
              ]
            },
            {
              id: 'option-1-2',
              text: 'Analyser d\'abord l\'étendue de l\'infection avant d\'agir',
              impact: {
                security: -30,
                time: 20,
                reputation: 0,
                cost: 10
              },
              consequences: [
                'L\'infection continue de se propager pendant l\'analyse',
                'Vous obtenez une meilleure visibilité sur l\'étendue des dégâts',
                'Les opérations continuent partiellement'
              ]
            },
            {
              id: 'option-1-3',
              text: 'Arrêter tous les systèmes immédiatement',
              impact: {
                security: 50,
                time: -50,
                reputation: -40,
                cost: -60
              },
              consequences: [
                'L\'arrêt complet stoppe la propagation mais paralysé l\'entreprise',
                'Impact financier immédiat très important',
                'Perturbation majeure des opérations client'
              ]
            }
          ]
        }
      ],
      timeTriggers: [
        {
          time: 120, // 2 minutes
          action: 'alert',
          target: 'alert-2'
        },
        {
          time: 180, // 3 minutes
          action: 'message',
          target: 'msg-2'
        }
      ]
    },
    {
      id: 'phase-2',
      name: 'Investigation et identification',
      description: 'Enquêter sur l\'origine de l\'attaque et identifier l\'étendue des dommages',
      alerts: [
        {
          id: 'alert-3',
          title: 'Exfiltration de données détectée',
          severity: 'high',
          timestamp: new Date(),
          source: 'Sonde réseau',
          description: 'Transferts massifs de données vers des adresses IP inconnues détectés durant les 72 dernières heures.',
          status: 'new'
        },
        {
          id: 'alert-4',
          title: 'Compromission des identifiants admin',
          severity: 'critical',
          timestamp: new Date(Date.now() + 5 * 60 * 1000), // +5 minutes
          source: 'Audit de sécurité',
          description: 'Plusieurs comptes administrateurs ont été utilisés pour accéder à des ressources critiques pendant les heures non-ouvrées.',
          status: 'new'
        }
      ],
      messages: [
        {
          id: 'msg-3',
          sender: 'Thomas Girard',
          senderId: 'team-3',
          content: 'Mon équipe a identifié l\'origine de l\'infection : un email de phishing ciblant la direction financière il y a 5 jours. Les attaquants ont eu plusieurs jours d\'accès avant d\'activer le ransomware. Nous avons trouvé des preuves d\'exfiltration de données sensibles.',
          timestamp: new Date(),
          read: false,
          urgent: true
        },
        {
          id: 'msg-4',
          sender: 'Vincent Rossi',
          senderId: 'team-4',
          content: 'Nos sauvegardes de la semaine dernière semblent intactes mais celles des derniers jours ont été compromises. Les attaquants ont clairement ciblé notre infrastructure de backup avant de déclencher le chiffrement.',
          timestamp: new Date(Date.now() + 7 * 60 * 1000), // +7 minutes
          read: false,
          urgent: true
        }
      ],
      decisions: [
        {
          id: 'decision-2',
          text: 'Quelle stratégie adopter concernant les données ?',
          options: [
            {
              id: 'option-2-1',
              text: 'Lancer immédiatement la restauration depuis les sauvegardes intactes',
              impact: {
                security: 30,
                time: 40,
                reputation: 20,
                cost: 20
              },
              consequences: [
                'Récupération partielle des systèmes et données',
                'Perte des données des 5 derniers jours',
                'Risque que la restauration réintroduise des vulnérabilités'
              ]
            },
            {
              id: 'option-2-2',
              text: 'Reconstruire l\'infrastructure critique avant restauration',
              impact: {
                security: 70,
                time: -30,
                reputation: 10,
                cost: -40
              },
              consequences: [
                'Système plus sécurisé après reconstruction',
                'Délai de reprise significativement plus long',
                'Coûts supplémentaires pour la reconstruction'
              ]
            },
            {
              id: 'option-2-3',
              text: 'Considérer le paiement de la rançon en dernier recours',
              impact: {
                security: -60,
                time: 60,
                reputation: -70,
                cost: -80
              },
              consequences: [
                'Aucune garantie de récupération même après paiement',
                'Risque juridique et réputationnel majeur',
                'Encouragement des activités cybercriminelles'
              ]
            }
          ]
        }
      ],
      timeTriggers: [
        {
          time: 300, // 5 minutes
          action: 'alert',
          target: 'alert-4'
        },
        {
          time: 420, // 7 minutes
          action: 'message',
          target: 'msg-4'
        }
      ]
    },
    {
      id: 'phase-3',
      name: 'Communication et notification',
      description: 'Gérer la communication avec les parties prenantes et les obligations légales',
      alerts: [
        {
          id: 'alert-5',
          title: 'Violation de données confirmée',
          severity: 'high',
          timestamp: new Date(),
          source: 'Équipe d\'investigation',
          description: 'Confirmation de l\'exfiltration de données clients et employés, incluant des données personnelles et financières.',
          status: 'new'
        }
      ],
      messages: [
        {
          id: 'msg-5',
          sender: 'Marie Dupont',
          senderId: 'team-5',
          content: 'Le PDG et le conseil d\'administration demandent un point de situation immédiat. Plusieurs clients importants ont également contacté la direction suite à l\'interruption de service. Comment souhaitez-vous procéder avec la communication externe ?',
          timestamp: new Date(),
          read: false,
          urgent: true
        },
        {
          id: 'msg-6',
          sender: 'Alexandre Fournier',
          senderId: 'team-6',
          content: 'Le service juridique confirme que nous devons notifier la CNIL dans les 72 heures compte tenu de la nature des données compromises. Nous avons également des obligations contractuelles de notification envers nos clients majeurs sous 24 heures.',
          timestamp: new Date(Date.now() + 6 * 60 * 1000), // +6 minutes
          read: false,
          urgent: true
        },
        {
          id: 'msg-7',
          sender: 'Paul Mercier',
          senderId: 'team-7',
          content: 'Nous avons des journalistes qui commencent à nous contacter. Des rumeurs circulent déjà sur les réseaux sociaux concernant une attaque majeure. Les relations presse ont besoin de directives claires rapidement.',
          timestamp: new Date(Date.now() + 10 * 60 * 1000), // +10 minutes
          read: false,
          urgent: true
        }
      ],
      decisions: [
        {
          id: 'decision-3',
          text: 'Quelle stratégie de communication adopter ?',
          options: [
            {
              id: 'option-3-1',
              text: 'Communication transparente et immédiate avec toutes les parties prenantes',
              impact: {
                security: 0,
                time: -10,
                reputation: 40,
                cost: -20
              },
              consequences: [
                'Confiance renforcée des clients et partenaires à long terme',
                'Couverture médiatique importante mais contrôlée',
                'Respect des obligations légales et contractuelles'
              ]
            },
            {
              id: 'option-3-2',
              text: 'Communication minimale le temps de maîtriser la situation technique',
              impact: {
                security: 10,
                time: 30,
                reputation: -40,
                cost: 10
              },
              consequences: [
                'Moins de pression immédiate sur les équipes techniques',
                'Risque de fuites d\'informations non contrôlées',
                'Possible non-respect des délais légaux de notification'
              ]
            },
            {
              id: 'option-3-3',
              text: 'Communication stratégique : informer d\'abord les autorités et clients critiques uniquement',
              impact: {
                security: 20,
                time: 10,
                reputation: -10,
                cost: 0
              },
              consequences: [
                'Équilibre entre transparence et contrôle de l\'information',
                'Respect des obligations légales prioritaires',
                'Possibilité de préparer une stratégie de communication plus élaborée'
              ]
            }
          ]
        }
      ],
      timeTriggers: [
        {
          time: 360, // 6 minutes
          action: 'message',
          target: 'msg-6'
        },
        {
          time: 600, // 10 minutes
          action: 'message',
          target: 'msg-7'
        }
      ]
    },
    {
      id: 'phase-4',
      name: 'Reprise d\'activité et leçons apprises',
      description: 'Rétablir les opérations et capitaliser sur l\'expérience',
      alerts: [
        {
          id: 'alert-6',
          title: 'Publication des données sur le darkweb',
          severity: 'high',
          timestamp: new Date(),
          source: 'Veille cybersécurité',
          description: 'Les attaquants ont commencé à publier des échantillons de données sur leur site de leak, menaçant de tout publier sous 48h.',
          status: 'new'
        }
      ],
      messages: [
        {
          id: 'msg-8',
          sender: 'Daniel Martin',
          senderId: 'team-1',
          content: 'Nous avons réussi à restaurer 60% des systèmes critiques. Mais les attaquants viennent de publier un échantillon de données sur le darkweb avec un ultimatum de 48h pour le paiement avant publication complète. Comment devons-nous réagir à cette nouvelle menace ?',
          timestamp: new Date(),
          read: false,
          urgent: true
        },
        {
          id: 'msg-9',
          sender: 'Sophie Laurent',
          senderId: 'team-8',
          content: 'La direction financière évalue l\'impact de l\'incident à plusieurs millions d\'euros en pertes d\'activité, sans compter les coûts de remédiation et les possibles amendes. Ils demandent un plan détaillé de reprise et une estimation des coûts restants.',
          timestamp: new Date(Date.now() + 5 * 60 * 1000), // +5 minutes
          read: false,
          urgent: true
        }
      ],
      decisions: [
        {
          id: 'decision-4',
          text: 'Quelle approche adopter face aux nouvelles menaces et pour la reprise d\'activité ?',
          options: [
            {
              id: 'option-4-1',
              text: 'Maintenir le refus de paiement et accélérer les notifications aux personnes concernées par la fuite',
              impact: {
                security: 40,
                time: -20,
                reputation: 20,
                cost: -30
              },
              consequences: [
                'Position éthique et juridique claire contre le ransomware',
                'Préparation proactive à l\'impact des fuites de données',
                'Coûts supplémentaires pour la gestion des notifications et le support'
              ]
            },
            {
              id: 'option-4-2',
              text: 'Engager des négociations avec les attaquants pour gagner du temps',
              impact: {
                security: -10,
                time: 30,
                reputation: -30,
                cost: -10
              },
              consequences: [
                'Possibilité de retarder la publication des données',
                'Risque d\'encourager les attaquants',
                'Zone grise éthique et juridique'
              ]
            },
            {
              id: 'option-4-3',
              text: 'Concentrer toutes les ressources sur la reprise d\'activité et la sécurisation des systèmes restants',
              impact: {
                security: 60,
                time: 10,
                reputation: -10,
                cost: -20
              },
              consequences: [
                'Retour à la normale plus rapide pour les opérations critiques',
                'Préparation insuffisante face aux conséquences des fuites',
                'Approche pragmatique mais risquée sur le plan réputationnel'
              ]
            }
          ]
        }
      ],
      timeTriggers: [
        {
          time: 300, // 5 minutes
          action: 'message',
          target: 'msg-9'
        }
      ]
    }
  ]
};

// Équipe de crise avec différents membres
const crisisTeam: CrisisTeamMember[] = [
  {
    id: 'team-1',
    name: 'Daniel Martin',
    role: 'Responsable SOC',
    department: 'Sécurité',
    avatar: '',
    avatarFallback: 'DM',
    expertise: ['Détection', 'Analyse forensique', 'Réponse aux incidents'],
    availability: 'available',
    confidence: 90,
    stress: 70,
    responseTime: 2 // minutes
  },
  {
    id: 'team-2',
    name: 'Julie Leblanc',
    role: 'Responsable Support IT',
    department: 'IT',
    avatar: '',
    avatarFallback: 'JL',
    expertise: ['Support utilisateurs', 'Systèmes Windows', 'Gestion de parc'],
    availability: 'available',
    confidence: 75,
    stress: 85,
    responseTime: 3
  },
  {
    id: 'team-3',
    name: 'Thomas Girard',
    role: 'Expert Forensique',
    department: 'Sécurité',
    avatar: '',
    avatarFallback: 'TG',
    expertise: ['Investigation numérique', 'Malware analysis', 'Reconstruction chronologique'],
    availability: 'available',
    confidence: 95,
    stress: 60,
    responseTime: 5
  },
  {
    id: 'team-4',
    name: 'Vincent Rossi',
    role: 'Architecte Infrastructure',
    department: 'IT',
    avatar: '',
    avatarFallback: 'VR',
    expertise: ['Architecture réseau', 'Cloud sécurité', 'Systèmes critiques'],
    availability: 'available',
    confidence: 85,
    stress: 75,
    responseTime: 4
  },
  {
    id: 'team-5',
    name: 'Marie Dupont',
    role: 'Directrice Communication',
    department: 'Communication',
    avatar: '',
    avatarFallback: 'MD',
    expertise: ['Communication de crise', 'Relations publiques', 'Communication interne'],
    availability: 'available',
    confidence: 80,
    stress: 90,
    responseTime: 3
  },
  {
    id: 'team-6',
    name: 'Alexandre Fournier',
    role: 'Responsable Juridique',
    department: 'Juridique',
    avatar: '',
    avatarFallback: 'AF',
    expertise: ['Conformité RGPD', 'Contractuel', 'Notification d\'incidents'],
    availability: 'available',
    confidence: 90,
    stress: 80,
    responseTime: 7
  },
  {
    id: 'team-7',
    name: 'Paul Mercier',
    role: 'Relations Presse',
    department: 'Communication',
    avatar: '',
    avatarFallback: 'PM',
    expertise: ['Gestion médias', 'Réseaux sociaux', 'Communication externe'],
    availability: 'available',
    confidence: 75,
    stress: 95,
    responseTime: 2
  },
  {
    id: 'team-8',
    name: 'Sophie Laurent',
    role: 'Directrice Financière',
    department: 'Finance',
    avatar: '',
    avatarFallback: 'SL',
    expertise: ['Impact financier', 'Assurances', 'Business continuity'],
    availability: 'available',
    confidence: 85,
    stress: 85,
    responseTime: 5
  },
];

// Indicateurs de crise
const initialIndicators: Indicator[] = [
  {
    id: 'security-level',
    name: 'Niveau de sécurité',
    value: 20,
    previousValue: 85,
    critical: 30,
    danger: 50,
    warning: 70,
    trend: 'down',
    icon: <Shield className="h-5 w-5" />
  },
  {
    id: 'operational-status',
    name: 'Statut opérationnel',
    value: 15,
    previousValue: 95,
    critical: 30,
    danger: 50,
    warning: 70,
    trend: 'down',
    icon: <Server className="h-5 w-5" />
  },
  {
    id: 'reputation-impact',
    name: 'Impact réputationnel',
    value: 70,
    previousValue: 10,
    critical: 70,
    danger: 50,
    warning: 30,
    trend: 'up',
    icon: <Users className="h-5 w-5" />
  },
  {
    id: 'financial-impact',
    name: 'Impact financier',
    value: 65,
    previousValue: 5,
    critical: 70,
    danger: 50,
    warning: 30,
    trend: 'up',
    icon: <BarChart2 className="h-5 w-5" />
  },
  {
    id: 'time-pressure',
    name: 'Pression temporelle',
    value: 80,
    previousValue: 30,
    critical: 70,
    danger: 50,
    warning: 30,
    trend: 'up',
    icon: <Clock className="h-5 w-5" />
  }
];

// Composant principal de simulation de crise
export default function CrisisSimulation() {
  const { toast } = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // États
  const [scenario, setScenario] = useState<CrisisScenario>(ransomwareScenario);
  const [phase, setPhase] = useState<number>(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [teamMembers, setTeamMembers] = useState<CrisisTeamMember[]>(crisisTeam);
  const [indicators, setIndicators] = useState<Indicator[]>(initialIndicators);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [crisisStarted, setCrisisStarted] = useState<boolean>(false);
  const [showBriefing, setShowBriefing] = useState<boolean>(true);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState<string>('');
  const [showDecision, setShowDecision] = useState<boolean>(false);
  const [currentDecision, setCurrentDecision] = useState<any>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [notificationCount, setNotificationCount] = useState({
    messages: 0,
    alerts: 0
  });
  
  // Effet pour faire défiler automatiquement le chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Effet pour gérer le temps de la simulation
  useEffect(() => {
    if (crisisStarted && !timer) {
      const interval = setInterval(() => {
        setElapsedSeconds(prev => {
          const newValue = prev + 1;
          
          // Vérifier les déclencheurs temporels
          if (scenario.phases[phase] && scenario.phases[phase].timeTriggers) {
            scenario.phases[phase].timeTriggers.forEach(trigger => {
              if (trigger.time === newValue) {
                handleTimeTrigger(trigger);
              }
            });
          }
          
          return newValue;
        });
        setCurrentTime(new Date(Date.now() + 1000)); // Simulation du temps qui passe
      }, 1000);
      
      setTimer(interval);
      
      return () => {
        clearInterval(interval);
        setTimer(null);
      };
    }
  }, [crisisStarted, timer, phase, scenario]);
  
  // Fonction pour démarrer la crise
  const startCrisis = () => {
    setCrisisStarted(true);
    setShowBriefing(false);
    
    // Ajouter le message initial
    const initialSystemMessage: Message = {
      id: 'initial-message',
      sender: 'Système',
      senderId: 'system',
      content: scenario.initialMessage,
      timestamp: new Date(),
      read: true,
      urgent: true
    };
    
    setMessages([initialSystemMessage]);
    
    // Ajouter les alertes initiales s'il y en a
    if (scenario.phases[0].alerts && scenario.phases[0].alerts.length > 0) {
      setAlerts(scenario.phases[0].alerts.filter(alert => alert.timestamp <= new Date()));
    }
    
    // Ajouter les messages initiales s'il y en a
    if (scenario.phases[0].messages && scenario.phases[0].messages.length > 0) {
      const initialMessages = scenario.phases[0].messages
        .filter(msg => msg.timestamp <= new Date())
        .map(msg => ({...msg, read: false}));
      
      if (initialMessages.length > 0) {
        setMessages(prev => [...prev, ...initialMessages]);
        setNotificationCount(prev => ({...prev, messages: prev.messages + initialMessages.length}));
      }
    }
    
    // Décision initiale s'il y en a une
    if (scenario.phases[0].decisions && scenario.phases[0].decisions.length > 0) {
      setTimeout(() => {
        setCurrentDecision(scenario.phases[0].decisions[0]);
        setShowDecision(true);
      }, 10000); // Afficher la première décision après 10 secondes
    }
    
    toast({
      title: 'Simulation de crise démarrée',
      description: 'Vous êtes maintenant en charge de la gestion de cette crise. Bonne chance!',
      variant: 'default',
    });
  };
  
  // Gérer les déclencheurs temporels
  const handleTimeTrigger = (trigger: any) => {
    switch (trigger.action) {
      case 'alert':
        const newAlert = scenario.phases[phase].alerts.find(a => a.id === trigger.target);
        if (newAlert) {
          setAlerts(prev => [...prev, newAlert]);
          setNotificationCount(prev => ({...prev, alerts: prev.alerts + 1}));
          
          toast({
            title: `Nouvelle alerte: ${newAlert.title}`,
            description: `${newAlert.description.substring(0, 60)}...`,
            variant: 'destructive',
          });
        }
        break;
      case 'message':
        const newMessage = scenario.phases[phase].messages.find(m => m.id === trigger.target);
        if (newMessage) {
          setMessages(prev => [...prev, {...newMessage, read: false}]);
          setNotificationCount(prev => ({...prev, messages: prev.messages + 1}));
          
          toast({
            title: `Nouveau message de ${newMessage.sender}`,
            description: `${newMessage.content.substring(0, 60)}...`,
            variant: 'default',
          });
        }
        break;
      case 'decision':
        const newDecision = scenario.phases[phase].decisions.find(d => d.id === trigger.target);
        if (newDecision) {
          setCurrentDecision(newDecision);
          setShowDecision(true);
        }
        break;
      default:
        break;
    }
  };
  
  // Envoyer un message à un membre de l'équipe
  const sendMessage = () => {
    if (!messageInput.trim() || !selectedTeamMember) return;
    
    const targetTeamMember = teamMembers.find(tm => tm.id === selectedTeamMember);
    
    if (!targetTeamMember) return;
    
    const newMessage: Message = {
      id: `user-msg-${Date.now()}`,
      sender: 'Vous (RSSI)',
      senderId: 'user',
      content: messageInput,
      timestamp: new Date(),
      read: true,
      urgent: false
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
    
    // Simuler une réponse après un délai
    setTimeout(() => {
      // Cette partie pourrait être remplacée par un appel API à Azure OpenAI
      // pour générer une réponse contextuelle du membre de l'équipe
      generateTeamMemberResponse(targetTeamMember, messageInput);
    }, targetTeamMember.responseTime * 1000);
  };
  
  // Générer une réponse automatique d'un membre de l'équipe (placeholder)
  const generateTeamMemberResponse = (teamMember: CrisisTeamMember, query: string) => {
    // Ici on pourrait appeler Azure OpenAI ou simuler une réponse contextuelle
    const response: Message = {
      id: `response-${Date.now()}`,
      sender: teamMember.name,
      senderId: teamMember.id,
      content: `En réponse à votre demande, je vais m'occuper de ${query.substring(0, 30)}... Je vous tiendrai informé des avancées dès que possible.`,
      timestamp: new Date(),
      read: false,
      urgent: false
    };
    
    setMessages(prev => [...prev, response]);
    setNotificationCount(prev => ({...prev, messages: prev.messages + 1}));
  };
  
  // Marquage des messages comme lus
  const markMessagesAsRead = () => {
    setMessages(prev => prev.map(m => ({...m, read: true})));
    setNotificationCount(prev => ({...prev, messages: 0}));
  };
  
  // Marquage des alertes comme lues
  const markAlertsAsRead = () => {
    setNotificationCount(prev => ({...prev, alerts: 0}));
  };
  
  // Sélectionner une option de décision
  const selectDecisionOption = (option: any) => {
    // Appliquer les impacts de la décision
    updateIndicators(option.impact);
    
    // Ajouter un message système sur la décision prise
    const decisionMessage: Message = {
      id: `decision-${Date.now()}`,
      sender: 'Système',
      senderId: 'system',
      content: `Décision prise: ${option.text}`,
      timestamp: new Date(),
      read: true,
      urgent: false,
      decisions: [{
        id: option.id,
        text: option.text,
        impact: 'neutral',
        timeImpact: option.impact.time,
        securityImpact: option.impact.security,
        reputationImpact: option.impact.reputation,
        costImpact: option.impact.cost
      }]
    };
    
    setMessages(prev => [...prev, decisionMessage]);
    
    // Notifier l'utilisateur des conséquences
    toast({
      title: 'Décision appliquée',
      description: option.consequences[0],
      variant: 'default',
    });
    
    // Fermer la boîte de dialogue de décision
    setShowDecision(false);
    
    // Si c'était la dernière décision de la phase, passer à la phase suivante après un délai
    const currentPhaseDecisions = scenario.phases[phase].decisions;
    if (currentDecision.id === currentPhaseDecisions[currentPhaseDecisions.length - 1].id) {
      if (phase < scenario.phases.length - 1) {
        setTimeout(() => {
          goToNextPhase();
        }, 5000);
      } else {
        // Fin du scénario
        setTimeout(() => {
          endCrisisSimulation();
        }, 5000);
      }
    } else {
      // Préparer la prochaine décision
      const currentIndex = currentPhaseDecisions.findIndex(d => d.id === currentDecision.id);
      if (currentIndex >= 0 && currentIndex < currentPhaseDecisions.length - 1) {
        setTimeout(() => {
          setCurrentDecision(currentPhaseDecisions[currentIndex + 1]);
          setShowDecision(true);
        }, 15000); // 15 secondes avant la prochaine décision
      }
    }
  };
  
  // Mettre à jour les indicateurs en fonction des décisions
  const updateIndicators = (impact: any) => {
    setIndicators(prev => prev.map(indicator => {
      let newValue = indicator.value;
      
      switch (indicator.id) {
        case 'security-level':
          newValue += impact.security;
          break;
        case 'operational-status':
          newValue += impact.time;
          break;
        case 'reputation-impact':
          newValue -= impact.reputation;  // Inverse car valeur élevée = mauvais impact réputationnel
          break;
        case 'financial-impact':
          newValue -= impact.cost;  // Inverse car valeur élevée = mauvais impact financier
          break;
        case 'time-pressure':
          newValue -= impact.time / 2;  // La pression temporelle diminue si on gagne du temps
          break;
      }
      
      // Limiter les valeurs entre 0 et 100
      newValue = Math.max(0, Math.min(100, newValue));
      
      return {
        ...indicator,
        previousValue: indicator.value,
        value: newValue,
        trend: newValue > indicator.value ? 'up' : newValue < indicator.value ? 'down' : 'stable'
      };
    }));
  };
  
  // Passer à la phase suivante
  const goToNextPhase = () => {
    const nextPhase = phase + 1;
    
    if (nextPhase < scenario.phases.length) {
      setPhase(nextPhase);
      
      // Notifier l'utilisateur du changement de phase
      toast({
        title: `Phase ${nextPhase + 1}: ${scenario.phases[nextPhase].name}`,
        description: scenario.phases[nextPhase].description,
        variant: 'default',
      });
      
      // Ajouter les alertes et messages initiaux de la nouvelle phase
      if (scenario.phases[nextPhase].alerts && scenario.phases[nextPhase].alerts.length > 0) {
        const initialAlerts = scenario.phases[nextPhase].alerts.filter(alert => alert.timestamp <= new Date());
        setAlerts(prev => [...prev, ...initialAlerts]);
        setNotificationCount(prev => ({...prev, alerts: prev.alerts + initialAlerts.length}));
      }
      
      if (scenario.phases[nextPhase].messages && scenario.phases[nextPhase].messages.length > 0) {
        const initialMessages = scenario.phases[nextPhase].messages
          .filter(msg => msg.timestamp <= new Date())
          .map(msg => ({...msg, read: false}));
        
        if (initialMessages.length > 0) {
          setMessages(prev => [...prev, ...initialMessages]);
          setNotificationCount(prev => ({...prev, messages: prev.messages + initialMessages.length}));
        }
      }
      
      // Décision initiale de la nouvelle phase s'il y en a une
      if (scenario.phases[nextPhase].decisions && scenario.phases[nextPhase].decisions.length > 0) {
        setTimeout(() => {
          setCurrentDecision(scenario.phases[nextPhase].decisions[0]);
          setShowDecision(true);
        }, 10000); // Afficher la première décision après 10 secondes
      }
    }
  };
  
  // Terminer la simulation
  const endCrisisSimulation = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    
    setCrisisStarted(false);
    
    // Calculer le score final basé sur les indicateurs
    const securityScore = indicators.find(i => i.id === 'security-level')?.value || 0;
    const operationalScore = indicators.find(i => i.id === 'operational-status')?.value || 0;
    const reputationScore = 100 - (indicators.find(i => i.id === 'reputation-impact')?.value || 0);
    const financialScore = 100 - (indicators.find(i => i.id === 'financial-impact')?.value || 0);
    
    const totalScore = Math.round((securityScore + operationalScore + reputationScore + financialScore) / 4);
    
    // Message de fin et analyse
    const finalMessage: Message = {
      id: `final-${Date.now()}`,
      sender: 'Système',
      senderId: 'system',
      content: `Simulation terminée. Score final: ${totalScore}/100. Une analyse détaillée de votre gestion de crise est disponible dans l'onglet Analyse.`,
      timestamp: new Date(),
      read: true,
      urgent: false
    };
    
    setMessages(prev => [...prev, finalMessage]);
    
    toast({
      title: 'Simulation terminée',
      description: `Score final: ${totalScore}/100`,
      variant: 'default',
    });
  };
  
  // Formatage du temps écoulé
  const formatElapsedTime = () => {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Rendu du briefing initial
  const renderBriefing = () => {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card max-w-3xl w-full rounded-xl border border-red-800/50 shadow-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-red-900 to-red-950 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-700/50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-100" />
              </div>
              <h2 className="text-2xl font-bold text-white">ALERTE CRITIQUE: {scenario.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80">
              <div>
                <p className="text-xs font-semibold uppercase mb-1 text-red-300">Complexité</p>
                <p className="text-sm flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                  {scenario.difficulty === 'expert' ? 'Expert' : 
                   scenario.difficulty === 'avancé' ? 'Avancé' : 
                   scenario.difficulty === 'intermédiaire' ? 'Intermédiaire' : 'Basique'}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase mb-1 text-red-300">Durée estimée</p>
                <p className="text-sm flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {scenario.timeLimit} minutes
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase mb-1 text-red-300">Menace</p>
                <p className="text-sm">{scenario.threat}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase mb-1 text-red-300">Phases</p>
                <p className="text-sm">{scenario.phases.length} phases d'escalade</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Briefing de situation</h3>
            <p className="mb-6 text-muted-foreground">
              {scenario.description}
            </p>
            
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                Votre rôle
              </h4>
              <p className="text-sm mb-4">
                En tant que RSSI, vous êtes responsable de la coordination de la réponse à cet incident. Vous devrez prendre des décisions critiques qui affecteront la capacité de l'organisation à se remettre de cette attaque.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-blue-950/30 border border-blue-900/30 rounded-md p-3">
                  <h5 className="font-semibold text-blue-300 mb-1">Objectifs</h5>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Contenir l'incident</li>
                    <li>Minimiser les dommages</li>
                    <li>Restaurer les services</li>
                    <li>Respecter les obligations légales</li>
                  </ul>
                </div>
                <div className="bg-blue-950/30 border border-blue-900/30 rounded-md p-3">
                  <h5 className="font-semibold text-blue-300 mb-1">Ressources</h5>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Équipe de crise (8 experts)</li>
                    <li>Sauvegardes système</li>
                    <li>Plan de continuité d'activité</li>
                    <li>Outils d'analyse forensique</li>
                  </ul>
                </div>
                <div className="bg-blue-950/30 border border-blue-900/30 rounded-md p-3">
                  <h5 className="font-semibold text-blue-300 mb-1">Contraintes</h5>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Pression temporelle forte</li>
                    <li>Risque réputationnel élevé</li>
                    <li>Impact financier potentiel</li>
                    <li>Obligations légales (RGPD)</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white"
                onClick={startCrisis}
              >
                <AlertTriangle className="mr-2 h-5 w-5" />
                Prendre en charge la crise
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };
  
  // Rendu des indicateurs de crise
  const renderIndicators = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 mb-4">
        {indicators.map((indicator) => {
          let statusColor = '';
          if (indicator.value <= indicator.critical) {
            statusColor = 'bg-red-500';
          } else if (indicator.value <= indicator.danger) {
            statusColor = 'bg-amber-500';
          } else if (indicator.value <= indicator.warning) {
            statusColor = 'bg-yellow-500';
          } else {
            statusColor = 'bg-green-500';
          }
          
          return (
            <Card key={indicator.id} className="border-border/40 bg-card/80">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-muted rounded">
                      {indicator.icon}
                    </div>
                    <h3 className="text-xs font-medium">{indicator.name}</h3>
                  </div>
                  <Badge variant="outline" className="text-xs font-normal py-0 h-5">
                    {indicator.value}%
                  </Badge>
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full">
                  <div className={`h-full rounded-full ${statusColor}`} style={{width: `${indicator.value}%`}}></div>
                </div>
                <div className="flex items-center justify-end mt-1">
                  <span className={`text-xs ${
                    indicator.trend === 'up' ? 'text-red-500' : 
                    indicator.trend === 'down' ? 'text-green-500' : 
                    'text-muted-foreground'
                  }`}>
                    {indicator.trend === 'up' ? '↑' : indicator.trend === 'down' ? '↓' : '→'}
                    {Math.abs(indicator.value - indicator.previousValue)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };
  
  // Rendu du chat de crise
  const renderChat = () => {
    return (
      <div className="flex flex-col h-full">
        <ScrollArea className="flex-grow pr-4 -mr-4">
          <div className="space-y-4 mb-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.senderId === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.senderId === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : message.senderId === 'system'
                        ? 'bg-muted border border-border' 
                        : 'bg-card border border-border'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.senderId !== 'user' && (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className={`text-xs ${
                          message.senderId === 'system' 
                            ? 'bg-muted-foreground text-background' 
                            : 'bg-blue-600'
                        }`}>
                          {message.senderId === 'system' ? 'SYS' : 
                           message.sender.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span className={`text-xs font-semibold ${message.senderId === 'user' ? '' : 'text-foreground'}`}>
                      {message.sender}
                    </span>
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.urgent && (
                      <Badge variant="destructive" className="text-xs py-0 h-5">Urgent</Badge>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.decisions && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <h4 className="text-xs font-semibold mb-1">Impacts de la décision:</h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          <span>Sécurité: </span>
                          <span className={message.decisions[0].securityImpact >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {message.decisions[0].securityImpact >= 0 ? '+' : ''}{message.decisions[0].securityImpact}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Temps: </span>
                          <span className={message.decisions[0].timeImpact >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {message.decisions[0].timeImpact >= 0 ? '+' : ''}{message.decisions[0].timeImpact}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>Réputation: </span>
                          <span className={message.decisions[0].reputationImpact >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {message.decisions[0].reputationImpact >= 0 ? '+' : ''}{message.decisions[0].reputationImpact}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart2 className="h-3 w-3" />
                          <span>Coût: </span>
                          <span className={message.decisions[0].costImpact >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {message.decisions[0].costImpact >= 0 ? '+' : ''}{message.decisions[0].costImpact}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>
        
        <div className="mt-4 pt-2 border-t border-border">
          <div className="flex gap-2 mb-2">
            <Select
              value={selectedTeamMember || ''}
              onValueChange={setSelectedTeamMember}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Choisir un destinataire" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs bg-blue-600">
                          {member.avatarFallback}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                      {member.availability === 'busy' && (
                        <Badge variant="outline" className="ml-1">Occupé</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="p-2 w-10 h-10">
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Appel téléphonique (à venir)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex gap-2">
            <Textarea
              placeholder="Entrez votre message ici..."
              className="flex-grow min-h-[80px]"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              disabled={!selectedTeamMember}
            />
            <Button className="self-end" onClick={sendMessage} disabled={!selectedTeamMember || !messageInput.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  // Rendu des alertes
  const renderAlerts = () => {
    return (
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-10">
            <CheckCircle2 className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold">Aucune alerte active</h3>
            <p className="text-sm text-muted-foreground">
              Les alertes apparaîtront ici lorsqu'elles seront détectées
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className="border-red-500/50">
              <CardHeader className="bg-red-950/20 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-full bg-red-500/20">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                    <CardTitle className="text-base">{alert.title}</CardTitle>
                  </div>
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'}>
                    {alert.severity === 'critical' ? 'Critique' :
                     alert.severity === 'high' ? 'Élevée' :
                     alert.severity === 'medium' ? 'Moyenne' :
                     'Basse'}
                  </Badge>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Source: {alert.source}</span>
                  <span>{alert.timestamp.toLocaleTimeString()}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-sm">{alert.description}</p>
                
                <div className="flex justify-between mt-3">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                    {alert.status === 'new' ? 'Nouvelle' :
                     alert.status === 'investigating' ? 'En investigation' :
                     alert.status === 'mitigated' ? 'Atténuée' :
                     'Résolue'}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };
  
  // Rendu du dialogue de décision
  const renderDecisionDialog = () => {
    if (!currentDecision) return null;
    
    return (
      <Dialog open={showDecision} onOpenChange={setShowDecision}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-1 bg-amber-500/20 rounded-full">
                <HelpCircle className="h-5 w-5 text-amber-500" />
              </div>
              Décision critique requise
            </DialogTitle>
            <DialogDescription>
              Cette décision aura un impact important sur l'évolution de la crise.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="text-lg font-semibold mb-4">{currentDecision.text}</h3>
            
            <div className="space-y-4">
              {currentDecision.options.map((option: any) => (
                <Card 
                  key={option.id}
                  className="relative border-border/50 hover:border-primary/50 cursor-pointer transition-all"
                  onClick={() => selectDecisionOption(option)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{option.text}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h4 className="text-sm font-semibold mb-1">Conséquences potentielles:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside mb-4">
                      {option.consequences.map((consequence: string, i: number) => (
                        <li key={i}>{consequence}</li>
                      ))}
                    </ul>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="text-sm mr-1">Sécurité:</span>
                        <span className={`text-sm font-medium ${option.impact.security >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {option.impact.security >= 0 ? '+' : ''}{option.impact.security}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm mr-1">Temps:</span>
                        <span className={`text-sm font-medium ${option.impact.time >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {option.impact.time >= 0 ? '+' : ''}{option.impact.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm mr-1">Réputation:</span>
                        <span className={`text-sm font-medium ${option.impact.reputation >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {option.impact.reputation >= 0 ? '+' : ''}{option.impact.reputation}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BarChart2 className="h-4 w-4 text-primary" />
                        <span className="text-sm mr-1">Coût:</span>
                        <span className={`text-sm font-medium ${option.impact.cost >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {option.impact.cost >= 0 ? '+' : ''}{option.impact.cost}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <div className="w-full flex justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Timer className="h-4 w-4" />
                <span>Cette décision impactera directement l'évolution de la crise</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDecision(false)}
              >
                Réfléchir plus tard
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <HomeLayout>
      {/* Briefing initial */}
      {showBriefing && renderBriefing()}
      
      {/* Interface principale de gestion de crise */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/cyber">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
              </Link>
              <Badge 
                variant="outline" 
                className="bg-red-500/10 text-red-500 border-red-500/30"
              >
                Simulation en cours
              </Badge>
            </div>
            <h1 className="text-3xl font-bold">{scenario.title}</h1>
            <p className="text-muted-foreground mt-1">
              Phase {phase + 1}/{scenario.phases.length}: {scenario.phases[phase]?.name}
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Temps écoulé</span>
              <span className="text-xl font-mono font-bold">{formatElapsedTime()}</span>
            </div>
            
            <Separator orientation="vertical" className="h-8 hidden md:block" />
            
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Horloge de simulation</span>
              <span className="text-xl font-mono font-bold">{currentTime.toLocaleTimeString()}</span>
            </div>
            
            <Button 
              variant="destructive" 
              className="whitespace-nowrap"
              onClick={endCrisisSimulation}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Terminer la simulation
            </Button>
          </div>
        </div>
        
        {/* Indicateurs */}
        {renderIndicators()}
        
        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Liste des membres de l'équipe */}
          <Card className="border-border/40 bg-card/80 overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Équipe de crise</CardTitle>
                <Badge variant="outline" className="py-0 h-5">
                  {teamMembers.length}
                </Badge>
              </div>
              <CardDescription>
                Collaborateurs disponibles
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="space-y-1 px-4">
                  {teamMembers.map((member) => (
                    <div 
                      key={member.id}
                      className={`flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer ${
                        selectedTeamMember === member.id 
                          ? 'bg-primary/10' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedTeamMember(member.id)}
                    >
                      <Avatar>
                        <AvatarFallback className="bg-blue-600">
                          {member.avatarFallback}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{member.name}</h3>
                          <Badge 
                            variant="outline" 
                            className={`ml-2 py-0 h-5 ${
                              member.availability === 'available' 
                                ? 'bg-green-500/10 text-green-500 border-green-500/30' 
                                : member.availability === 'busy'
                                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                                  : 'bg-red-500/10 text-red-500 border-red-500/30'
                            }`}
                          >
                            {member.availability === 'available' ? 'Disponible' : 
                             member.availability === 'busy' ? 'Occupé' : 'Indisponible'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="h-1 flex-grow bg-muted rounded-full">
                            <div
                              className={`h-full rounded-full ${
                                member.stress > 80 ? 'bg-red-500' : 
                                member.stress > 60 ? 'bg-amber-500' : 
                                'bg-green-500'
                              }`}
                              style={{ width: `${member.stress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground">Stress</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          {/* Section principale */}
          <Card className="lg:col-span-3 border-border/40 bg-card/80">
            <CardHeader className="pb-2">
              <Tabs value={activeTab} onValueChange={(value) => {
                setActiveTab(value);
                if (value === 'chat') markMessagesAsRead();
                if (value === 'alerts') markAlertsAsRead();
              }}>
                <div className="flex justify-between items-center">
                  <TabsList>
                    <TabsTrigger value="chat" className="relative">
                      Messages
                      {notificationCount.messages > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                          {notificationCount.messages}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="alerts" className="relative">
                      Alertes
                      {notificationCount.alerts > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                          {notificationCount.alerts}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="briefing">
                      Briefing
                    </TabsTrigger>
                    <TabsTrigger value="team">
                      Expertise
                    </TabsTrigger>
                  </TabsList>
                  
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    Phase {phase + 1}/{scenario.phases.length}
                  </Badge>
                </div>
              </Tabs>
            </CardHeader>
            <CardContent className="h-[calc(100vh-350px)]">
              <TabsContent value="chat" className="h-full mt-0">
                {renderChat()}
              </TabsContent>
              
              <TabsContent value="alerts" className="h-full mt-0">
                <ScrollArea className="h-full pr-4 -mr-4">
                  {renderAlerts()}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="briefing" className="h-full mt-0">
                <ScrollArea className="h-full pr-4 -mr-4">
                  <div className="space-y-4">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-primary" />
                        Situation actuelle
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {scenario.description}
                      </p>
                      
                      <h4 className="font-semibold mb-2">Objectifs de cette phase :</h4>
                      <p className="text-muted-foreground mb-4">
                        {scenario.phases[phase]?.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Ressources critiques</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li>Équipe de crise complète (8 experts)</li>
                            <li>Équipe SOC et analystes</li>
                            <li>Infrastructure de secours</li>
                            <li>Sauvegardes de données</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Contraintes</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li>Temps limité avant escalade</li>
                            <li>Exposition médiatique potentielle</li>
                            <li>Obligations réglementaires (72h)</li>
                            <li>Continuité des opérations critiques</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold mb-3">Chronologie des événements</h3>
                      <div className="space-y-4">
                        {messages.filter(m => m.senderId === 'system' || m.urgent).map((message, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-16 text-right text-muted-foreground text-xs whitespace-nowrap pt-0.5">
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                            <div className="w-0.5 bg-border relative flex-shrink-0">
                              <div className="w-2 h-2 rounded-full bg-primary absolute -left-[3px] top-1"></div>
                            </div>
                            <div className="pb-4">
                              <h4 className="text-sm font-semibold">
                                {message.urgent && (
                                  <Badge variant="destructive" className="mr-2 text-xs">Urgent</Badge>
                                )}
                                {message.sender}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="team" className="h-full mt-0">
                <ScrollArea className="h-full pr-4 -mr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamMembers.map((member) => (
                      <Card key={member.id} className="border-primary/20">
                        <CardHeader className="pb-2">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-blue-600 text-xl">
                                {member.avatarFallback}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{member.name}</CardTitle>
                              <CardDescription>{member.role}</CardDescription>
                              <Badge className="mt-1">{member.department}</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <h4 className="text-sm font-semibold mb-2">Expertise</h4>
                          <div className="flex flex-wrap gap-1 mb-4">
                            {member.expertise.map((exp, i) => (
                              <Badge key={i} variant="secondary">{exp}</Badge>
                            ))}
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Confiance</span>
                                <span>{member.confidence}%</span>
                              </div>
                              <Progress value={member.confidence} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Niveau de stress</span>
                                <span>{member.stress}%</span>
                              </div>
                              <Progress 
                                value={member.stress} 
                                className="h-2" 
                                indicatorClassName={`${
                                  member.stress > 80 ? 'bg-red-500' : 
                                  member.stress > 60 ? 'bg-amber-500' : 
                                  'bg-green-500'
                                }`}
                              />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Temps de réponse moyen</span>
                                <span>{member.responseTime} min</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          {member.lastContact && (
                            <span className="text-xs text-muted-foreground">
                              Dernier contact: {member.lastContact}
                            </span>
                          )}
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => setSelectedTeamMember(member.id)}
                          >
                            <MessageCircle className="mr-1 h-4 w-4" />
                            Contacter
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Dialogue de décision */}
      {renderDecisionDialog()}
    </HomeLayout>
  );
}