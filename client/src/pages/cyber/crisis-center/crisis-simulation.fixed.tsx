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
    // ... autres phases ici
  ]
};

// L'équipe de crise
const crisisTeam: CrisisTeamMember[] = [
  {
    id: 'team-1',
    name: 'Daniel Martin',
    role: 'Responsable SOC',
    department: 'Sécurité',
    avatar: '',
    avatarFallback: 'DM',
    expertise: ['Détection', 'Analyse malware', 'SIEM', 'Forensics'],
    availability: 'available',
    confidence: 85,
    stress: 50,
    responseTime: 5
  },
  {
    id: 'team-2',
    name: 'Julie Leblanc',
    role: 'Responsable Support',
    department: 'IT',
    avatar: '',
    avatarFallback: 'JL',
    expertise: ['Support utilisateur', 'Communication', 'Gestion incidents'],
    availability: 'busy',
    confidence: 70,
    stress: 75,
    responseTime: 15,
    lastContact: '10:45'
  },
  {
    id: 'team-3',
    name: 'Thomas Girard',
    role: 'Analyste Sécurité Sr.',
    department: 'Sécurité',
    avatar: '',
    avatarFallback: 'TG',
    expertise: ['Analyse forensique', 'Malware', 'Threat hunting'],
    availability: 'available',
    confidence: 90,
    stress: 40,
    responseTime: 10
  },
  {
    id: 'team-4',
    name: 'Vincent Rossi',
    role: 'Ingénieur Système',
    department: 'IT',
    avatar: '',
    avatarFallback: 'VR',
    expertise: ['Infrastructure', 'Backups', 'Virtualisation'],
    availability: 'available',
    confidence: 80,
    stress: 60,
    responseTime: 8
  },
  {
    id: 'team-5',
    name: 'Marie Dupont',
    role: 'Directrice Communication',
    department: 'Communication',
    avatar: '',
    avatarFallback: 'MD',
    expertise: ['Relations presse', 'Comm. de crise', 'Médias'],
    availability: 'busy',
    confidence: 75,
    stress: 80,
    responseTime: 20,
    lastContact: '10:30'
  },
  {
    id: 'team-6',
    name: 'Alexandre Fournier',
    role: 'Juriste',
    department: 'Juridique',
    avatar: '',
    avatarFallback: 'AF',
    expertise: ['RGPD', 'Notification incidents', 'Conformité'],
    availability: 'unavailable',
    confidence: 65,
    stress: 70,
    responseTime: 30,
    lastContact: '09:15'
  }
];

// Indicateurs de crise initiaux
const initialIndicators: Indicator[] = [
  {
    id: 'threat-level',
    name: 'Niveau de menace',
    value: 85,
    previousValue: 30,
    critical: 80,
    danger: 60,
    warning: 40,
    trend: 'up',
    icon: <AlertTriangle className="h-5 w-5" />
  },
  {
    id: 'system-impact',
    name: 'Impact système',
    value: 70,
    previousValue: 0,
    critical: 70,
    danger: 50,
    warning: 30,
    trend: 'up',
    icon: <Server className="h-5 w-5" />
  },
  {
    id: 'data-risk',
    name: 'Risque sur les données',
    value: 90,
    previousValue: 10,
    critical: 80,
    danger: 60,
    warning: 40,
    trend: 'up',
    icon: <Shield className="h-5 w-5" />
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
  
  // Calculer les alertes actives (non résolues)
  const activeAlerts = alerts.filter(alert => alert.status !== 'resolved');
  
  // Démarrer la simulation
  const startCrisis = () => {
    if (crisisStarted) return;
    
    setCrisisStarted(true);
    setShowBriefing(false);
    
    // Ajouter le message initial
    const initialSystemMessage: Message = {
      id: 'system-init',
      sender: 'Système',
      senderId: 'system',
      content: scenario.initialMessage,
      timestamp: new Date(),
      read: false,
      urgent: true
    };
    
    setMessages([initialSystemMessage]);
    
    // Ajouter les alertes initiales
    if (scenario.phases[phase].alerts.length > 0) {
      const initialAlerts = scenario.phases[phase].alerts.filter(a => 
        !scenario.phases[phase].timeTriggers.some(t => 
          t.action === 'alert' && t.target === a.id
        )
      );
      
      setAlerts(initialAlerts);
      setNotificationCount(prev => ({
        ...prev,
        alerts: initialAlerts.length
      }));
    }
    
    // Démarrer le timer
    const t = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
      setCurrentTime(new Date());
    }, 1000);
    
    setTimer(t);
    
    // Simuler le premier message de l'équipe après quelques secondes
    setTimeout(() => {
      if (scenario.phases[phase].messages.length > 0) {
        const initialMessages = scenario.phases[phase].messages.filter(m => 
          !scenario.phases[phase].timeTriggers.some(t => 
            t.action === 'message' && t.target === m.id
          )
        );
        
        if (initialMessages.length > 0) {
          setMessages(prev => [...prev, ...initialMessages]);
          setNotificationCount(prev => ({
            ...prev,
            messages: prev.messages + initialMessages.length
          }));
        }
      }
    }, 5000);
    
    // Simuler la première décision après quelques secondes
    setTimeout(() => {
      if (scenario.phases[phase].decisions.length > 0) {
        const firstDecision = scenario.phases[phase].decisions[0];
        setCurrentDecision(firstDecision);
        setShowDecision(true);
      }
    }, 15000);
  };
  
  // Arrêter la simulation
  const stopCrisis = () => {
    if (timer) clearInterval(timer);
    setCrisisStarted(false);
    
    toast({
      title: "Simulation terminée",
      description: "Vous avez terminé la simulation de crise.",
    });
  };
  
  // Marquer les messages comme lus
  const markMessagesAsRead = () => {
    if (messages.some(m => !m.read)) {
      setMessages(messages.map(m => ({ ...m, read: true })));
      setNotificationCount(prev => ({
        ...prev,
        messages: 0
      }));
    }
  };
  
  // Marquer les alertes comme lues
  const markAlertsAsRead = () => {
    if (alerts.some(a => a.status === 'new')) {
      setAlerts(alerts.map(a => 
        a.status === 'new' ? { ...a, status: 'investigating' } : a
      ));
      setNotificationCount(prev => ({
        ...prev,
        alerts: 0
      }));
    }
  };
  
  // Gérer l'envoi d'un message
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'Vous',
      senderId: 'user',
      content: messageInput,
      timestamp: new Date(),
      read: true,
      urgent: false
    };
    
    setMessages([...messages, newMessage]);
    setMessageInput('');
    
    // Scroll to bottom
    setTimeout(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    
    // Simuler une réponse
    if (selectedTeamMember) {
      const member = teamMembers.find(m => m.id === selectedTeamMember);
      if (member) {
        setTimeout(() => {
          const responseMessage: Message = {
            id: `${member.id}-${Date.now()}`,
            sender: member.name,
            senderId: member.id,
            content: `Je vais m'occuper de cela immédiatement. J'ai bien compris votre demande concernant ${messageInput.length > 30 ? messageInput.substring(0, 30) + '...' : messageInput}`,
            timestamp: new Date(),
            read: false,
            urgent: false
          };
          
          setMessages(prev => [...prev, responseMessage]);
          setNotificationCount(prev => ({
            ...prev,
            messages: prev.messages + 1
          }));
          
          // Scroll to bottom
          setTimeout(() => {
            if (chatEndRef.current) {
              chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
          
          // Mettre à jour le statut du membre
          setTeamMembers(prev => prev.map(m => 
            m.id === member.id ? { 
              ...m, 
              availability: 'busy',
              lastContact: new Date().toLocaleTimeString(),
              stress: Math.min(100, m.stress + 5) 
            } : m
          ));
          
          setSelectedTeamMember(null);
        }, 1000 + Math.random() * 2000);
      }
    }
  };
  
  // Gérer le choix d'une décision
  const handleDecisionChoice = (option: any) => {
    // Simuler l'impact de la décision
    const securityChange = option.impact.security;
    const timeImpact = option.impact.time;
    const reputationImpact = option.impact.reputation;
    const costImpact = option.impact.cost;
    
    // Mettre à jour les indicateurs
    setIndicators(prev => prev.map(indicator => {
      let newValue = indicator.value;
      
      if (indicator.id === 'threat-level') {
        newValue = Math.max(0, Math.min(100, indicator.value - securityChange * 0.3));
      } else if (indicator.id === 'time-pressure') {
        newValue = Math.max(0, Math.min(100, indicator.value - timeImpact * 0.3));
      }
      
      return {
        ...indicator,
        previousValue: indicator.value,
        value: newValue,
        trend: newValue < indicator.value ? 'down' : newValue > indicator.value ? 'up' : 'stable'
      };
    }));
    
    // Ajouter un message système sur la décision
    const consequencesText = option.consequences.map((c: string) => `• ${c}`).join('\n');
    const decisionMessage: Message = {
      id: `decision-${Date.now()}`,
      sender: 'Système',
      senderId: 'system',
      content: `Vous avez choisi: "${option.text}"\n\nConséquences:\n${consequencesText}`,
      timestamp: new Date(),
      read: true,
      urgent: false,
      decisions: [
        {
          id: currentDecision.id,
          text: option.text,
          impact: securityChange > 0 ? 'positive' : securityChange < 0 ? 'negative' : 'neutral',
          timeImpact,
          securityImpact: securityChange,
          reputationImpact,
          costImpact
        }
      ]
    };
    
    setMessages([...messages, decisionMessage]);
    setShowDecision(false);
    
    toast({
      title: "Décision prise",
      description: `Vous avez choisi: ${option.text}`,
    });
  };
  
  // Vérifier les déclencheurs basés sur le temps
  useEffect(() => {
    if (!crisisStarted || !scenario.phases[phase]) return;
    
    const triggers = scenario.phases[phase].timeTriggers;
    triggers.forEach(trigger => {
      if (elapsedSeconds === trigger.time) {
        if (trigger.action === 'alert') {
          const alertToTrigger = scenario.phases[phase].alerts.find(a => a.id === trigger.target);
          if (alertToTrigger) {
            setAlerts(prev => [...prev, alertToTrigger]);
            setNotificationCount(prev => ({
              ...prev,
              alerts: prev.alerts + 1
            }));
            
            toast({
              title: "Nouvelle alerte critique",
              description: alertToTrigger.title,
              variant: "destructive",
            });
          }
        } else if (trigger.action === 'message') {
          const messageToTrigger = scenario.phases[phase].messages.find(m => m.id === trigger.target);
          if (messageToTrigger) {
            setMessages(prev => [...prev, messageToTrigger]);
            setNotificationCount(prev => ({
              ...prev,
              messages: prev.messages + 1
            }));
            
            if (messageToTrigger.urgent) {
              toast({
                title: "Message urgent",
                description: `De: ${messageToTrigger.sender}`,
                variant: "destructive",
              });
            }
          }
        }
      }
    });
  }, [elapsedSeconds, crisisStarted, phase, scenario]);
  
  // Nettoyer le timer si on quitte la page
  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);
  
  // Faire défiler la conversation vers le bas lorsqu'un nouveau message arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Formatage du temps écoulé
  const formatElapsedTime = () => {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Rendu de la liste des messages
  const renderChat = () => {
    return (
      <div className="flex flex-col h-full">
        <ScrollArea className="flex-grow pr-4 -mr-4">
          <div className="space-y-4 pb-4">
            {messages.map((message, index) => (
              <div 
                key={message.id} 
                className={`flex ${message.senderId === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.senderId === 'user' 
                      ? 'bg-primary/10 text-foreground' 
                      : message.senderId === 'system'
                        ? 'bg-destructive/10 text-foreground border border-destructive/20'
                        : 'bg-card/50 border border-border/50 text-foreground'
                  } ${!message.read && message.senderId !== 'user' ? 'ring-1 ring-primary' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {message.senderId !== 'user' && (
                        <span className="font-semibold text-sm">
                          {message.sender}
                          {message.urgent && (
                            <Badge variant="destructive" className="ml-2 text-[10px] h-4">Urgent</Badge>
                          )}
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="text-sm whitespace-pre-line">
                    {message.content}
                  </div>
                  
                  {message.decisions && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <div className="font-semibold text-xs text-muted-foreground mb-1">
                        Décision prise:
                      </div>
                      {message.decisions.map((decision, i) => (
                        <div key={i} className="text-xs">
                          <span className={`inline-flex items-center gap-1 font-medium ${
                            decision.impact === 'positive' ? 'text-green-500' : 
                            decision.impact === 'negative' ? 'text-red-500' : 
                            'text-muted-foreground'
                          }`}>
                            {decision.impact === 'positive' ? <CheckCircle2 className="h-3 w-3" /> : 
                             decision.impact === 'negative' ? <XCircle className="h-3 w-3" /> : 
                             <Info className="h-3 w-3" />}
                            {decision.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>
        
        <div className="mt-4 flex gap-2">
          {selectedTeamMember ? (
            <div className="flex items-center bg-primary/10 rounded-lg px-3 py-1 text-sm">
              <span className="mr-2">Destinataire:</span>
              <Badge>
                {teamMembers.find(m => m.id === selectedTeamMember)?.name || 'Équipe'}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 ml-2" 
                onClick={() => setSelectedTeamMember(null)}
              >
                <XCircle className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Select onValueChange={setSelectedTeamMember}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Choisir destinataire" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center">
                      <span>{member.name}</span>
                      <Badge 
                        variant={
                          member.availability === 'available' ? 'default' : 
                          member.availability === 'busy' ? 'outline' : 
                          'secondary'
                        }
                        className="ml-2 h-1.5 w-1.5 rounded-full p-0"
                      />
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <div className="flex-grow relative">
            <Textarea
              placeholder="Tapez votre message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="resize-none h-[80px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              size="sm" 
              className="absolute bottom-2 right-2"
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
            >
              <Send className="h-4 w-4 mr-1" /> Envoyer
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  // Rendu de la liste des alertes
  const renderAlerts = () => {
    return (
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune alerte active pour le moment.
          </div>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className={`
              border-l-4
              ${alert.severity === 'critical' ? 'border-l-red-500' : 
                alert.severity === 'high' ? 'border-l-amber-500' : 
                alert.severity === 'medium' ? 'border-l-yellow-500' : 
                'border-l-blue-500'}
              ${alert.status === 'new' ? 'ring-1 ring-primary' : ''}
            `}>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        alert.severity === 'critical' ? 'destructive' : 
                        alert.severity === 'high' ? 'default' : 
                        alert.severity === 'medium' ? 'outline' : 
                        'secondary'
                      }
                    >
                      {alert.severity === 'critical' ? 'Critique' : 
                        alert.severity === 'high' ? 'Élevée' : 
                        alert.severity === 'medium' ? 'Moyenne' : 
                        'Faible'}
                    </Badge>
                    <Badge variant="outline">
                      {alert.status === 'new' ? 'Nouveau' : 
                        alert.status === 'investigating' ? 'En cours' : 
                        alert.status === 'mitigated' ? 'Mitigé' : 
                        'Résolu'}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {alert.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <CardTitle className="text-base mt-1">
                  {alert.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  Source: {alert.source}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3 pt-0">
                <p className="text-sm text-muted-foreground">
                  {alert.description}
                </p>
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Décision à prendre
            </DialogTitle>
            <DialogDescription>
              Cette décision aura un impact sur le déroulement de la crise
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="text-lg font-semibold mb-4">{currentDecision.text}</h3>
            
            <div className="space-y-4">
              {currentDecision.options.map((option: any) => (
                <Card key={option.id} className="hover:shadow-md transition-all cursor-pointer border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{option.text}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm text-muted-foreground space-y-1 mb-3">
                      {option.consequences.map((consequence: string, i: number) => (
                        <p key={i}>• {consequence}</p>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-muted-foreground mb-1">Sécurité</span>
                        <Badge className={
                          option.impact.security > 0 ? 'bg-green-500' : 
                          option.impact.security < 0 ? 'bg-red-500' : 
                          'bg-gray-500'
                        }>
                          {option.impact.security > 0 ? '+' : ''}{option.impact.security}%
                        </Badge>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-muted-foreground mb-1">Temps</span>
                        <Badge className={
                          option.impact.time > 0 ? 'bg-green-500' : 
                          option.impact.time < 0 ? 'bg-red-500' : 
                          'bg-gray-500'
                        }>
                          {option.impact.time > 0 ? '+' : ''}{option.impact.time}%
                        </Badge>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-muted-foreground mb-1">Réputation</span>
                        <Badge className={
                          option.impact.reputation > 0 ? 'bg-green-500' : 
                          option.impact.reputation < 0 ? 'bg-red-500' : 
                          'bg-gray-500'
                        }>
                          {option.impact.reputation > 0 ? '+' : ''}{option.impact.reputation}%
                        </Badge>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-muted-foreground mb-1">Coût</span>
                        <Badge className={
                          option.impact.cost > 0 ? 'bg-green-500' : 
                          option.impact.cost < 0 ? 'bg-red-500' : 
                          'bg-gray-500'
                        }>
                          {option.impact.cost > 0 ? '+' : ''}{option.impact.cost}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => handleDecisionChoice(option)}
                    >
                      Choisir cette option
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDecision(false)}
            >
              Reporter la décision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <HomeLayout>
      <div className="container max-w-7xl my-6">
        {/* Bannière supérieure */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-card/80 backdrop-blur-sm p-4 rounded-lg border border-border/40 mb-6">
          <div className="flex items-center">
            <Link href="/cyber/crisis-center" className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
            
            <div>
              <h1 className="text-2xl font-bold">{scenario.title}</h1>
              <p className="text-muted-foreground">
                {scenario.difficulty === 'basique' ? 'Niveau: Basique' : 
                  scenario.difficulty === 'intermédiaire' ? 'Niveau: Intermédiaire' : 
                  scenario.difficulty === 'avancé' ? 'Niveau: Avancé' : 
                  'Niveau: Expert'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {crisisStarted ? (
              <>
                <div className="flex items-center bg-card/50 rounded-lg px-3 py-1.5 border border-border/20">
                  <Timer className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm font-mono">{formatElapsedTime()}</span>
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={stopCrisis}
                      >
                        Terminer la simulation
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Terminer la simulation avant la fin.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : (
              <Button 
                variant="default" 
                onClick={startCrisis}
                className="gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                Démarrer la simulation
              </Button>
            )}
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panneau latéral */}
          <Card className="border-border/40 bg-card/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <BarChart2 className="h-5 w-5 text-primary" />
                </div>
                État de la crise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {indicators.map((indicator) => (
                <div key={indicator.id}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <div className="mr-2">{indicator.icon}</div>
                      <span className="text-sm">{indicator.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold">{indicator.value}%</span>
                      {indicator.trend === 'up' && <ArrowRight className="h-3 w-3 text-red-500 rotate-45" />}
                      {indicator.trend === 'down' && <ArrowRight className="h-3 w-3 text-green-500 rotate-[135deg]" />}
                    </div>
                  </div>
                  <Progress 
                    value={indicator.value} 
                    className="h-2" 
                    indicatorClassName={`${
                      indicator.value >= indicator.critical ? 'bg-red-500' : 
                      indicator.value >= indicator.danger ? 'bg-amber-500' : 
                      indicator.value >= indicator.warning ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                  />
                </div>
              ))}
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="text-sm font-semibold mb-2">Équipe de crise</h3>
                <div className="grid grid-cols-2 gap-2">
                  {teamMembers.map((member) => (
                    <Button 
                      key={member.id}
                      variant="outline"
                      size="sm"
                      className={`justify-start px-2 ${
                        member.availability === 'available' ? 'border-green-500/30' : 
                        member.availability === 'busy' ? 'border-amber-500/30' : 
                        'border-red-500/30 opacity-60'
                      }`}
                      disabled={member.availability === 'unavailable'}
                      onClick={() => setSelectedTeamMember(member.id)}
                    >
                      <div className="flex items-center w-full">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarFallback className="text-xs">
                            {member.avatarFallback}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs truncate">{member.name}</span>
                        <div className={`h-2 w-2 rounded-full ml-auto ${
                          member.availability === 'available' ? 'bg-green-500' : 
                          member.availability === 'busy' ? 'bg-amber-500' : 
                          'bg-red-500'
                        }`} />
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Section principale */}
          <Card className="lg:col-span-3 border-border/40 bg-card/80">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center mb-4">
                <Badge variant="outline" className="gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  Phase {phase + 1}/{scenario.phases.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100vh-350px)]">
              <Tabs value={activeTab} onValueChange={(value) => {
                setActiveTab(value);
                if (value === 'chat') markMessagesAsRead();
                if (value === 'alerts') markAlertsAsRead();
              }} className="h-full">
                <TabsList className="mb-4">
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
                
                <TabsContent value="chat" className="h-[calc(100%-40px)] mt-0">
                  {renderChat()}
                </TabsContent>
                
                <TabsContent value="alerts" className="h-[calc(100%-40px)] mt-0">
                  <ScrollArea className="h-full pr-4 -mr-4">
                    {renderAlerts()}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="briefing" className="h-[calc(100%-40px)] mt-0">
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
                
                <TabsContent value="team" className="h-[calc(100%-40px)] mt-0">
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
                              {member.expertise.map((skill, i) => (
                                <Badge key={i} variant="outline">{skill}</Badge>
                              ))}
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Confiance</span>
                                  <span>{member.confidence}%</span>
                                </div>
                                <Progress 
                                  value={member.confidence} 
                                  className="h-2" 
                                  indicatorClassName={`${
                                    member.confidence > 70 ? 'bg-green-500' : 
                                    member.confidence > 40 ? 'bg-amber-500' : 
                                    'bg-red-500'
                                  }`}
                                />
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
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Dialogue de décision */}
      {renderDecisionDialog()}
    </HomeLayout>
  );
}