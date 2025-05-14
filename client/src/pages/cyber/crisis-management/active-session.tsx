import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  FileText, 
  HelpCircle,
  Info,
  MessageSquare, 
  PanelLeftClose, 
  PanelLeftOpen, 
  PauseCircle,
  PlayCircle,
  RefreshCw, 
  Save, 
  Send, 
  Settings, 
  ShieldAlert,
  Trash2, 
  Users, 
  X,
  AlertTriangle,
  BarChart4,
  Download,
  Printer,
  Share2
} from 'lucide-react';
import {
  BsExclamationCircleFill,
  BsLaptop,
  BsBuilding,
  BsShieldLock,
  BsFileEarmarkText,
  BsChatSquareText,
  BsClock,
  BsGear,
  BsPeople
} from 'react-icons/bs';
import { 
  IoMdArrowBack, 
  IoMdCheckmarkCircle, 
  IoMdClose, 
  IoMdHelpCircle, 
  IoMdInformationCircle,
  IoMdTime
} from 'react-icons/io';

// Définition des types pour le composant
interface CrisisScenario {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  totalStages: number;
  timeLimit: number;
}

interface Stakeholder {
  id: string;
  role: string;
  name: string;
  department: string;
  expertise: string[];
  attitude: 'helpful' | 'neutral' | 'resistant';
  availability: number;
}

interface TimelineEvent {
  id: string;
  timestamp: number;
  type: string;
  title: string;
  description: string;
  severity: string;
  relatedStakeholders?: string[];
  impact?: string;
}

interface ResourceAllocation {
  technical: number;
  communication: number;
  legal: number;
  management: number;
  financial: number;
}

interface CrisisMetrics {
  technicalResponse: number;
  communicationEffectiveness: number;
  businessContinuity: number;
  legalCompliance: number;
  overallEffectiveness: number;
  timeEfficiency: number;
  reputationProtection: number;
}

interface Message {
  role: string;
  content: string;
}

interface Decision {
  id: string;
  timestamp: number;
  stage: number;
  decisionPoint: string;
  options: { id: string; text: string; consequences?: string }[];
  selectedOption: string;
  justification?: string;
  impact: {
    technical: number;
    communication: number;
    business: number;
    legal: number;
  };
}

interface CrisisSessionData {
  scenario: CrisisScenario;
  timeline: TimelineEvent[];
  resources: ResourceAllocation;
  metrics: CrisisMetrics;
  status: 'active' | 'paused' | 'completed';
  currentStage: number;
  elapsedTime: number;
  stakeholders: Stakeholder[];
  messages: Message[];
  decisions: Decision[];
}

export default function ActiveCrisisSession() {
  const [, navigate] = useLocation();
  const { sessionId } = useParams();
  const { toast } = useToast();
  
  // États pour la gestion de session
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sessionData, setSessionData] = useState<CrisisSessionData | null>(null);
  const [message, setMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('situation');
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [currentDecision, setCurrentDecision] = useState({ 
    decisionPoint: '', 
    options: [{ id: '1', text: '' }, { id: '2', text: '' }], 
    selectedOption: '',
    justification: '' 
  });
  const [resourcesDialogOpen, setResourcesDialogOpen] = useState(false);
  const [resourcesForm, setResourcesForm] = useState<ResourceAllocation>({ 
    technical: 20, 
    communication: 20, 
    legal: 20, 
    management: 20, 
    financial: 20 
  });
  const [timer, setTimer] = useState<{ hours: number; minutes: number; seconds: number }>({ 
    hours: 0, 
    minutes: 0, 
    seconds: 0 
  });
  const [sessionReport, setSessionReport] = useState<any>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  
  // Références
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Effet pour charger les données de la session au démarrage
  useEffect(() => {
    if (sessionId) {
      loadSessionData();
    } else {
      navigate('/cyber/crisis-management');
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionId]);
  
  // Effet pour mettre à jour le timer
  useEffect(() => {
    if (sessionData && sessionData.status === 'active') {
      startTimer();
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionData?.status]);
  
  // Effet pour faire défiler vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom();
  }, [sessionData?.messages?.length]);
  
  // Effet pour mettre à jour le formulaire de ressources quand les ressources changent
  useEffect(() => {
    if (sessionData?.resources) {
      setResourcesForm(sessionData.resources);
    }
  }, [sessionData?.resources]);
  
  // Fonction pour générer des données mockées pour la démo
  const generateMockSessionData = (): CrisisSessionData => {
    return {
      scenario: {
        id: sessionId || 'demo-scenario',
        title: 'Attaque de ransomware massive',
        description: 'Une attaque de ransomware a paralysé les systèmes critiques de l\'entreprise. Les fichiers sont chiffrés et les pirates demandent une rançon de 500 000 euros.',
        difficulty: 'intermédiaire',
        totalStages: 5,
        timeLimit: 120,
      },
      timeline: [
        {
          id: '1',
          timestamp: Date.now() - 60000,
          type: 'incident',
          title: 'Détection de l\'attaque',
          description: 'Les équipes informatiques ont détecté une activité suspecte sur les serveurs principaux.',
          severity: 'high',
          impact: 'Indisponibilité des systèmes critiques'
        }
      ],
      resources: {
        technical: 30,
        communication: 20,
        legal: 10,
        management: 20,
        financial: 20
      },
      metrics: {
        technicalResponse: 40,
        communicationEffectiveness: 35,
        businessContinuity: 30,
        legalCompliance: 45,
        overallEffectiveness: 38,
        timeEfficiency: 50,
        reputationProtection: 40
      },
      status: 'active',
      currentStage: 1,
      elapsedTime: 300, // 5 minutes en secondes
      stakeholders: [
        {
          id: '1',
          role: 'DSI',
          name: 'Thomas Martin',
          department: 'IT',
          expertise: ['Infrastructure', 'Cybersécurité', 'Gestion de crise'],
          attitude: 'helpful',
          availability: 9
        },
        {
          id: '2',
          role: 'DG',
          name: 'Sophie Dubois',
          department: 'Direction',
          expertise: ['Business Continuity', 'Management'],
          attitude: 'neutral',
          availability: 5
        }
      ],
      messages: [
        {
          role: 'system',
          content: 'Bienvenue dans cette simulation de gestion de crise. Je suis l\'assistant qui vous guidera tout au long de ce scénario.'
        },
        {
          role: 'system',
          content: 'Un ransomware a été détecté sur les systèmes critiques de l\'entreprise à 09:30 ce matin. Les fichiers des départements Finance, RH et R&D ont été chiffrés. Nous avons reçu une demande de rançon de 500 000 euros. Que souhaitez-vous faire en priorité?'
        }
      ],
      decisions: []
    };
  };

  // Fonction pour charger les données de la session
  const loadSessionData = async () => {
    setLoading(true);
    try {
      // Pour la démonstration, on utilise des données mockées
      // Dans une implémentation réelle, on ferait un appel à l'API
      setTimeout(() => {
        const mockData = generateMockSessionData();
        setSessionData(mockData);
        updateTimerFromElapsedTime(mockData.elapsedTime);
        setLoading(false);
      }, 1500); // Simuler un délai réseau
    } catch (error) {
      console.error("Erreur lors du chargement de la session:", error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur",
        variant: "destructive"
      });
      setLoading(false);
      navigate('/cyber/crisis-management');
    }
  };
  
  // Fonction pour envoyer un message
  const sendMessage = async () => {
    if (!message.trim() || !sessionId || sending) return;
    
    setSending(true);
    try {
      // Simuler une réponse de l'IA pour la démonstration
      setTimeout(() => {
        const userMsg = message.trim();
        
        // Ajouter le message de l'utilisateur et une réponse simulée
        setSessionData(prevData => {
          if (!prevData) return null;
          
          const newMessages = [
            ...prevData.messages,
            { role: 'user', content: userMsg },
            { 
              role: 'assistant', 
              content: getAiResponse(userMsg, prevData.currentStage)
            }
          ];
          
          // Simuler une progression dans le scénario
          let newStage = prevData.currentStage;
          if (prevData.messages.length > 5 && newStage < prevData.scenario.totalStages) {
            newStage += 1;
          }
          
          // Simuler un changement dans les métriques
          const newMetrics = { ...prevData.metrics };
          const metrics = Object.keys(newMetrics);
          metrics.forEach(metric => {
            // Ajouter une variation aléatoire entre -5 et +10
            const variation = Math.floor(Math.random() * 15) - 5;
            newMetrics[metric] = Math.max(0, Math.min(100, newMetrics[metric] + variation));
          });
          
          return {
            ...prevData,
            messages: newMessages,
            currentStage: newStage,
            metrics: newMetrics
          };
        });
        
        setMessage('');
        setSending(false);
        
        // Faire défiler automatiquement vers le bas
        setTimeout(scrollToBottom, 100);
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur",
        variant: "destructive"
      });
      setSending(false);
    }
  };
  
  // Fonction pour générer une réponse simulée de l'IA
  const getAiResponse = (userMessage: string, stage: number): string => {
    // Quelques réponses prédéfinies en fonction du stade de la crise
    if (stage === 1) {
      if (userMessage.toLowerCase().includes('technique') || userMessage.toLowerCase().includes('systeme')) {
        return "C'est une bonne idée de commencer par une évaluation technique. L'équipe IT a constaté que tous les fichiers des départements Finance, RH et R&D sont cryptés avec l'extension .lockyou. Les sauvegardes des dernières 48h semblent également compromises. Souhaitez-vous isoler certains systèmes du réseau pour éviter la propagation?";
      }
      if (userMessage.toLowerCase().includes('communication') || userMessage.toLowerCase().includes('inform')) {
        return "La communication est effectivement prioritaire dans ce contexte. Qui souhaitez-vous informer en premier? Les employés, les clients, les autorités réglementaires?";
      }
      return "Nous devons agir rapidement. Les premiers rapports indiquent que le ransomware a touché environ 60% de nos serveurs. Nous avons isolé quelques systèmes critiques, mais la propagation continue. Quelles mesures souhaitez-vous prendre maintenant?";
    } else if (stage === 2) {
      return "La situation évolue. Nous avons reçu un message des pirates précisant qu'ils ont également exfiltré environ 2 To de données confidentielles. Ils menacent de les publier si nous ne payons pas la rançon dans les 48 heures. Parallèlement, l'équipe technique a identifié la souche du ransomware comme étant REvil, une variante connue. Comment souhaitez-vous ajuster notre stratégie?";
    } else {
      return "Nos équipes travaillent conformément à vos instructions. Nous avons besoin de votre décision sur la prochaine étape à suivre. Nos experts en cybersécurité suggèrent de renforcer notre architecture de défense pour éviter de futures attaques similaires.";
    }
  };
  
  // Fonction pour mettre en pause ou reprendre la session
  const togglePauseSession = async () => {
    if (!sessionId) return;
    
    try {
      // Simuler la pause ou la reprise pour la démonstration
      setTimeout(() => {
        setSessionData(prevData => {
          if (!prevData) return null;
          
          const newStatus = prevData.status === 'active' ? 'paused' : 'active';
          
          if (newStatus === 'active') {
            // Reprendre le timer
            startTimer();
          }
          
          return {
            ...prevData,
            status: newStatus
          };
        });
        
        setShowPauseDialog(false);
        
        const newStatus = sessionData?.status === 'active' ? 'paused' : 'active';
        if (newStatus === 'active') {
          toast({
            title: "Session reprise",
            description: "La simulation de crise a été reprise",
          });
        } else {
          toast({
            title: "Session en pause",
            description: "La simulation de crise a été mise en pause",
          });
        }
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de la modification de l'état de la session:", error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur",
        variant: "destructive"
      });
    }
  };
  
  // Fonction pour terminer la session
  const endSession = async () => {
    if (!sessionId) return;
    
    try {
      // Génération d'un rapport de synthèse pour la démonstration
      setTimeout(() => {
        const mockReport = {
          title: "Rapport de fin de simulation de crise",
          summary: "Vous avez géré une crise de ransomware avec des résultats mitigés. Votre réponse technique était forte, mais la communication aurait pu être améliorée.",
          metrics: sessionData?.metrics || {},
          strengths: [
            "Rapidité de réaction initiale",
            "Bonne isolation des systèmes critiques",
            "Implication des parties prenantes appropriées"
          ],
          weaknesses: [
            "Communication externe tardive",
            "Manque de préparation en matière de sauvegarde",
            "Ressources techniques insuffisantes"
          ],
          recommendations: [
            "Mettre en place un plan de réponse aux incidents plus détaillé",
            "Former les équipes à la communication de crise",
            "Améliorer la stratégie de sauvegarde et de restauration",
            "Investir dans des outils de détection des menaces avancés"
          ]
        };
        
        setSessionReport(mockReport);
        setShowReportDialog(true);
        setShowEndDialog(false);
        
        // Mettre à jour l'état de la session
        setSessionData(prevData => {
          if (!prevData) return null;
          
          return {
            ...prevData,
            status: 'completed'
          };
        });
        
        toast({
          title: "Session terminée",
          description: "La simulation de crise a été terminée",
        });
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la fin de session:", error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur",
        variant: "destructive"
      });
    }
  };
  
  // Fonction pour enregistrer une décision
  const saveDecision = async () => {
    if (!sessionId || !currentDecision.decisionPoint || !currentDecision.selectedOption) return;
    
    try {
      // Simuler l'enregistrement de décision pour la démonstration
      setTimeout(() => {
        // Création d'une décision avec impact simulé
        const newDecision: Decision = {
          id: `decision-${Date.now()}`,
          timestamp: Date.now(),
          stage: sessionData?.currentStage || 1,
          decisionPoint: currentDecision.decisionPoint,
          options: currentDecision.options,
          selectedOption: currentDecision.selectedOption,
          justification: currentDecision.justification,
          impact: {
            technical: Math.floor(Math.random() * 8) - 3,
            communication: Math.floor(Math.random() * 8) - 3,
            business: Math.floor(Math.random() * 8) - 3,
            legal: Math.floor(Math.random() * 8) - 3
          }
        };
        
        // Créer un nouvel événement dans la timeline
        const newEvent: TimelineEvent = {
          id: `event-${Date.now()}`,
          timestamp: Date.now(),
          type: 'decision',
          title: `Décision: ${currentDecision.decisionPoint}`,
          description: `Option choisie: ${currentDecision.options.find(o => o.id === currentDecision.selectedOption)?.text || ''}`,
          severity: 'medium'
        };
        
        // Mettre à jour les métriques en fonction de la décision
        const updatedMetrics: CrisisMetrics = { 
          ...(sessionData?.metrics || {
            technicalResponse: 50,
            communicationEffectiveness: 50,
            businessContinuity: 50,
            legalCompliance: 50,
            overallEffectiveness: 50,
            timeEfficiency: 50,
            reputationProtection: 50
          })
        };
        if (newDecision.impact.technical > 0) updatedMetrics.technicalResponse = Math.min(100, (updatedMetrics.technicalResponse || 50) + newDecision.impact.technical * 2);
        if (newDecision.impact.communication > 0) updatedMetrics.communicationEffectiveness = Math.min(100, (updatedMetrics.communicationEffectiveness || 50) + newDecision.impact.communication * 2);
        if (newDecision.impact.business > 0) updatedMetrics.businessContinuity = Math.min(100, (updatedMetrics.businessContinuity || 50) + newDecision.impact.business * 2);
        if (newDecision.impact.legal > 0) updatedMetrics.legalCompliance = Math.min(100, (updatedMetrics.legalCompliance || 50) + newDecision.impact.legal * 2);
        
        // Calculer l'efficacité globale
        updatedMetrics.overallEffectiveness = Math.floor(
          (updatedMetrics.technicalResponse + updatedMetrics.communicationEffectiveness + 
           updatedMetrics.businessContinuity + updatedMetrics.legalCompliance) / 4
        );
        
        setSessionData(prevData => {
          if (!prevData) return null;
          
          return {
            ...prevData,
            timeline: [...prevData.timeline, newEvent],
            metrics: updatedMetrics,
            decisions: [...(prevData.decisions || []), newDecision]
          };
        });
        
        setShowDecisionDialog(false);
        setCurrentDecision({
          decisionPoint: '',
          options: [{ id: '1', text: '' }, { id: '2', text: '' }],
          selectedOption: '',
          justification: ''
        });
        
        toast({
          title: "Décision enregistrée",
          description: "Votre décision a été enregistrée et prise en compte",
        });
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la décision:", error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur",
        variant: "destructive"
      });
    }
  };
  
  // Fonction pour mettre à jour l'allocation des ressources
  const updateResources = async () => {
    if (!sessionId) return;
    
    // Vérifier que les ressources totalisent 100%
    const total = Object.values(resourcesForm).reduce((sum, value) => sum + value, 0);
    if (Math.abs(total - 100) > 0.01) {
      toast({
        title: "Erreur",
        description: "L'allocation totale des ressources doit être de 100%",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Simuler la mise à jour des ressources pour la démonstration
      setTimeout(() => {
        // Calculer l'impact sur les métriques en fonction des changements d'allocation
        const oldResources = sessionData?.resources || {
          technical: 20,
          communication: 20,
          legal: 20,
          management: 20,
          financial: 20
        };
        
        const updatedMetrics: CrisisMetrics = { 
          ...(sessionData?.metrics || {
            technicalResponse: 50,
            communicationEffectiveness: 50,
            businessContinuity: 50,
            legalCompliance: 50,
            overallEffectiveness: 50,
            timeEfficiency: 50,
            reputationProtection: 50
          })
        };
        
        // Impact sur la réponse technique
        if (resourcesForm.technical > oldResources.technical) {
          updatedMetrics.technicalResponse = Math.min(100, updatedMetrics.technicalResponse + (resourcesForm.technical - oldResources.technical) / 2);
        }
        
        // Impact sur la communication
        if (resourcesForm.communication > oldResources.communication) {
          updatedMetrics.communicationEffectiveness = Math.min(100, updatedMetrics.communicationEffectiveness + (resourcesForm.communication - oldResources.communication) / 2);
        }
        
        // Impact sur la conformité légale
        if (resourcesForm.legal > oldResources.legal) {
          updatedMetrics.legalCompliance = Math.min(100, updatedMetrics.legalCompliance + (resourcesForm.legal - oldResources.legal) / 2);
        }
        
        // Impact sur la continuité des affaires
        if (resourcesForm.management > oldResources.management) {
          updatedMetrics.businessContinuity = Math.min(100, updatedMetrics.businessContinuity + (resourcesForm.management - oldResources.management) / 2);
        }
        
        // Recalculer l'efficacité globale
        updatedMetrics.overallEffectiveness = Math.floor(
          (updatedMetrics.technicalResponse + updatedMetrics.communicationEffectiveness + 
          updatedMetrics.businessContinuity + updatedMetrics.legalCompliance) / 4
        );
        
        // Mettre à jour les données de session
        setSessionData(prevData => {
          if (!prevData) return null;
          
          return {
            ...prevData,
            resources: resourcesForm,
            metrics: updatedMetrics
          };
        });
        
        setResourcesDialogOpen(false);
        
        toast({
          title: "Ressources mises à jour",
          description: "L'allocation des ressources a été mise à jour",
        });
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des ressources:", error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur",
        variant: "destructive"
      });
    }
  };
  
  // Fonction pour démarrer le timer
  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setTimer(prevTimer => {
        const newSeconds = prevTimer.seconds + 1;
        
        if (newSeconds >= 60) {
          const newMinutes = prevTimer.minutes + 1;
          
          if (newMinutes >= 60) {
            return {
              hours: prevTimer.hours + 1,
              minutes: 0,
              seconds: 0
            };
          }
          
          return {
            hours: prevTimer.hours,
            minutes: newMinutes,
            seconds: 0
          };
        }
        
        return {
          hours: prevTimer.hours,
          minutes: prevTimer.minutes,
          seconds: newSeconds
        };
      });
    }, 1000);
  };
  
  // Fonction pour mettre à jour le timer à partir du temps écoulé
  const updateTimerFromElapsedTime = (elapsedTimeMs: number) => {
    const totalSeconds = Math.floor(elapsedTimeMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    setTimer({ hours, minutes, seconds });
  };
  
  // Fonction pour formater le temps
  const formatTime = (time: { hours: number; minutes: number; seconds: number }) => {
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
  };
  
  // Fonction pour faire défiler vers le bas
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Fonction pour formater le texte avec une structure
  const formatTextWithMarkdown = (text: string): string => {
    if (!text) return '';
    
    let formattedText = text
      // Titres
      .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mb-2 mt-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-lg font-bold mb-2 mt-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-base font-bold mb-1 mt-2">$1</h3>')
      
      // Listes
      .replace(/^\s*\- (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
      .replace(/^\s*\* (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
      .replace(/^\s*\+ (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
      .replace(/^\s*\d+\. (.*$)/gm, '<li class="ml-4 mb-1 list-decimal">$1</li>')
      
      // Formatage de texte
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\_\_(.*?)\_\_/g, '<strong>$1</strong>')
      .replace(/\_(.*?)\_/g, '<em>$1</em>')
      
      // Paragraphes et sauts de ligne
      .replace(/\n\n/g, '</p><p class="mb-2">')
      .replace(/\n/g, '<br>');
    
    // Envelopper dans des balises p si nécessaire
    if (!formattedText.startsWith('<h') && !formattedText.startsWith('<p')) {
      formattedText = `<p class="mb-2">${formattedText}</p>`;
    }
    
    // Regrouper les balises li consécutives dans des ul ou ol
    formattedText = formattedText
      .replace(/<li class="ml-4 mb-1">/g, '<ul class="list-disc ml-4 mb-3"><li class="ml-4 mb-1">')
      .replace(/<\/li>\s*<li class="ml-4 mb-1">/g, '</li><li class="ml-4 mb-1">')
      .replace(/<\/li>(?!\s*<li|\s*<\/ul)/g, '</li></ul>');
    
    formattedText = formattedText
      .replace(/<li class="ml-4 mb-1 list-decimal">/g, '<ol class="list-decimal ml-4 mb-3"><li class="ml-4 mb-1">')
      .replace(/<\/li>\s*<li class="ml-4 mb-1 list-decimal">/g, '</li><li class="ml-4 mb-1">')
      .replace(/<\/li>(?!\s*<li|\s*<\/ol)/g, '</li></ol>');
    
    return formattedText;
  };
  
  // Fonction pour obtenir la couleur en fonction de la valeur
  const getColorForValue = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-blue-500';
    if (value >= 40) return 'bg-yellow-500';
    if (value >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Fonction pour obtenir la couleur en fonction de la sévérité
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-orange-500 text-white';
      case 'low': return 'bg-yellow-500 text-black';
      default: return 'bg-blue-500 text-white';
    }
  };
  
  // Fonction pour obtenir l'icône en fonction du type d'événement
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'incident': return <ShieldAlert className="h-4 w-4" />;
      case 'decision': return <CheckCircle className="h-4 w-4" />;
      case 'update': return <RefreshCw className="h-4 w-4" />;
      case 'communication': return <MessageSquare className="h-4 w-4" />;
      case 'escalation': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };
  
  // Fonction pour formater un timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Fonction pour imprimer le rapport
  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const content = document.getElementById('report-content');
    if (!content) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Rapport de Crise - ${sessionData?.scenario.title}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            h1 { color: #2563eb; }
            h2 { color: #1e40af; margin-top: 20px; }
            p { margin-bottom: 10px; }
            .metrics { display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0; }
            .metric { border: 1px solid #ccc; padding: 10px; width: calc(50% - 5px); }
            .footer { margin-top: 50px; font-size: 0.8em; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Rapport de Crise</h1>
          <h2>${sessionData?.scenario.title}</h2>
          ${content.innerHTML}
          <div class="metrics">
            <div class="metric">
              <h3>Réponse technique</h3>
              <p>${sessionData?.metrics.technicalResponse}%</p>
            </div>
            <div class="metric">
              <h3>Efficacité de la communication</h3>
              <p>${sessionData?.metrics.communicationEffectiveness}%</p>
            </div>
            <div class="metric">
              <h3>Continuité des activités</h3>
              <p>${sessionData?.metrics.businessContinuity}%</p>
            </div>
            <div class="metric">
              <h3>Conformité légale</h3>
              <p>${sessionData?.metrics.legalCompliance}%</p>
            </div>
          </div>
          <div class="footer">
            <p>Session de gestion de crise terminée le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}</p>
            <p>Durée totale: ${formatTime(timer)}</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 via-blue-950 to-black">
        <Card className="w-full max-w-md bg-blue-950/80 border-blue-700">
          <CardContent className="p-8 flex flex-col items-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <ShieldAlert className="h-12 w-12 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Chargement de la session de crise</h2>
              <Progress value={50} className="w-full h-2 bg-blue-800/50" />
              <p className="text-blue-200 text-center">
                Préparation des données et initialisation du scénario...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!sessionData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 via-blue-950 to-black">
        <Card className="w-full max-w-md bg-blue-950/80 border-blue-700">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-4">
              <AlertTriangle className="h-12 w-12 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Session non trouvée</h2>
              <p className="text-blue-200 text-center">
                Impossible de charger la session de gestion de crise.
              </p>
              <Button 
                onClick={() => navigate('/cyber/crisis-management')}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Retour à la page principale
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-950 to-black text-white">
      {/* Header avec informations de session et contrôles */}
      <header className="bg-blue-950 border-b border-blue-800 sticky top-0 z-10 shadow-md">
        <div className="container mx-auto py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/cyber/crisis-management')}
                className="text-white hover:bg-blue-800/30"
              >
                <IoMdArrowBack className="mr-2 h-5 w-5" />
                Quitter
              </Button>
              
              <div>
                <h1 className="text-lg font-bold flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  {sessionData.scenario.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-blue-200">
                  <Badge variant="outline" className="bg-blue-900/50 border-blue-700 text-xs">
                    {sessionData.scenario.difficulty}
                  </Badge>
                  <span className="flex items-center">
                    <IoMdTime className="mr-1 h-4 w-4" />
                    Étape {sessionData.currentStage + 1}/{sessionData.scenario.totalStages}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Timer */}
              <div className={`flex items-center gap-1 px-3 py-1 rounded-md ${
                sessionData.status === 'active' ? 'bg-green-900/70' : 'bg-yellow-900/70'
              }`}>
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm font-mono">{formatTime(timer)}</span>
              </div>
              
              {/* Actions */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowPauseDialog(true)}
                      className="h-8 w-8 border-blue-700 bg-blue-900/50"
                    >
                      {sessionData.status === 'active' ? (
                        <PauseCircle className="h-4 w-4 text-yellow-400" />
                      ) : (
                        <PlayCircle className="h-4 w-4 text-green-400" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {sessionData.status === 'active' ? 'Pause' : 'Reprendre'}
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setResourcesDialogOpen(true)}
                      className="h-8 w-8 border-blue-700 bg-blue-900/50"
                    >
                      <Settings className="h-4 w-4 text-blue-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Allocation des ressources
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowDecisionDialog(true)}
                      className="h-8 w-8 border-blue-700 bg-blue-900/50"
                    >
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Enregistrer une décision
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowEndDialog(true)}
                      className="h-8 w-8 border-blue-700 bg-blue-900/50"
                    >
                      <FileText className="h-4 w-4 text-red-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Terminer la session
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="h-8 w-8 border-blue-700 bg-blue-900/50 md:hidden"
                    >
                      {sidebarOpen ? (
                        <PanelLeftClose className="h-4 w-4 text-blue-400" />
                      ) : (
                        <PanelLeftOpen className="h-4 w-4 text-blue-400" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {sidebarOpen ? 'Masquer le panneau' : 'Afficher le panneau'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </header>
      
      {/* Contenu principal */}
      <div className="container mx-auto py-4 px-4 flex flex-col md:flex-row gap-4">
        {/* Panneau latéral */}
        {sidebarOpen && (
          <div className="w-full md:w-80 shrink-0 space-y-4">
            <Card className="bg-blue-950/70 border-blue-800">
              <Tabs defaultValue="situation" className="w-full" onValueChange={setActiveTab}>
                <CardHeader className="pb-2">
                  <TabsList className="w-full bg-blue-900/50">
                    <TabsTrigger 
                      value="situation" 
                      className="flex-1 data-[state=active]:bg-blue-700"
                    >
                      Situation
                    </TabsTrigger>
                    <TabsTrigger 
                      value="timeline" 
                      className="flex-1 data-[state=active]:bg-blue-700"
                    >
                      Chronologie
                    </TabsTrigger>
                    <TabsTrigger 
                      value="metrics" 
                      className="flex-1 data-[state=active]:bg-blue-700"
                    >
                      Métriques
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-2">
                  <TabsContent value="situation" className="mt-2">
                  <ScrollArea className="h-[calc(100vh-280px)] pr-2">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-blue-400 flex items-center">
                          <Info className="mr-2 h-4 w-4" />
                          SCÉNARIO
                        </h3>
                        <p className="text-sm text-blue-100 mt-1">
                          {sessionData.scenario.description}
                        </p>
                      </div>
                      
                      <Separator className="bg-blue-800/50" />
                      
                      <div>
                        <h3 className="text-sm font-semibold text-blue-400 flex items-center">
                          <BsShieldLock className="mr-2 h-4 w-4" />
                          OBJECTIFS
                        </h3>
                        <ul className="mt-1 space-y-1">
                          {/* Objectifs simulés pour la démonstration */}
                          {[
                            "Contenir la propagation du ransomware",
                            "Restaurer les services critiques",
                            "Communiquer efficacement avec les parties prenantes",
                            "Prévenir les risques juridiques et réglementaires"
                          ].map((objective, index) => (
                            <li key={index} className="text-sm text-blue-100 flex items-start">
                              <span className="text-blue-400 mr-2">•</span>
                              <span>{objective}</span>
                            </li>
                          )) || (
                            <li className="text-sm text-blue-100">
                              Gérer la crise efficacement en équilibrant les aspects techniques, communication, continuité d'activité et conformité légale.
                            </li>
                          )}
                        </ul>
                      </div>
                      
                      <Separator className="bg-blue-800/50" />
                      
                      <div>
                        <h3 className="text-sm font-semibold text-blue-400 flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          PARTIES PRENANTES
                        </h3>
                        <Accordion type="single" collapsible className="mt-1">
                          {sessionData.stakeholders.map((stakeholder) => (
                            <AccordionItem 
                              key={stakeholder.id} 
                              value={stakeholder.id}
                              className="border-blue-800/50"
                            >
                              <AccordionTrigger className="text-sm py-2 hover:no-underline">
                                <div className="flex items-center">
                                  <Badge 
                                    variant="outline" 
                                    className={`h-2 w-2 p-0 mr-2 rounded-full ${
                                      stakeholder.attitude === 'helpful' ? 'bg-green-500' :
                                      stakeholder.attitude === 'neutral' ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`}
                                  />
                                  <span className="text-left">{stakeholder.role}</span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-1 pb-2">
                                <div className="pl-4 text-xs space-y-1 text-blue-100">
                                  <p><span className="text-blue-400">Nom:</span> {stakeholder.name}</p>
                                  <p><span className="text-blue-400">Service:</span> {stakeholder.department}</p>
                                  <p>
                                    <span className="text-blue-400">Expertise:</span>{' '}
                                    {stakeholder.expertise.join(', ')}
                                  </p>
                                  <p>
                                    <span className="text-blue-400">Disponibilité:</span>{' '}
                                    <Progress 
                                      value={stakeholder.availability * 10} 
                                      className="h-1.5 w-24 inline-block ml-1 align-middle bg-blue-900/50" 
                                    />
                                  </p>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                      
                      <Separator className="bg-blue-800/50" />
                      
                      <div>
                        <h3 className="text-sm font-semibold text-blue-400 flex items-center">
                          <BsGear className="mr-2 h-4 w-4" />
                          ALLOCATION DES RESSOURCES
                        </h3>
                        <div className="mt-2 space-y-2">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-blue-100">Technique</span>
                              <span className="text-blue-300">{sessionData.resources.technical}%</span>
                            </div>
                            <Progress 
                              value={sessionData.resources.technical} 
                              className="h-1.5 bg-blue-900/50" 
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-blue-100">Communication</span>
                              <span className="text-blue-300">{sessionData.resources.communication}%</span>
                            </div>
                            <Progress 
                              value={sessionData.resources.communication} 
                              className="h-1.5 bg-blue-900/50" 
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-blue-100">Juridique</span>
                              <span className="text-blue-300">{sessionData.resources.legal}%</span>
                            </div>
                            <Progress 
                              value={sessionData.resources.legal} 
                              className="h-1.5 bg-blue-900/50" 
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-blue-100">Management</span>
                              <span className="text-blue-300">{sessionData.resources.management}%</span>
                            </div>
                            <Progress 
                              value={sessionData.resources.management} 
                              className="h-1.5 bg-blue-900/50" 
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-blue-100">Financier</span>
                              <span className="text-blue-300">{sessionData.resources.financial}%</span>
                            </div>
                            <Progress 
                              value={sessionData.resources.financial} 
                              className="h-1.5 bg-blue-900/50" 
                            />
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setResourcesDialogOpen(true)}
                          className="w-full mt-3 border-blue-700 bg-blue-900/30 hover:bg-blue-800/50 text-xs"
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Ajuster l'allocation
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="timeline" className="mt-2">
                  <ScrollArea className="h-[calc(100vh-280px)] pr-2">
                    <div className="relative pl-4 border-l border-blue-700">
                      {sessionData.timeline.map((event, index) => (
                        <div key={event.id} className="mb-4 relative">
                          <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full ${getSeverityColor(event.severity)}`}>
                            {getEventIcon(event.type)}
                          </div>
                          <div className="ml-4">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="text-sm font-medium text-blue-200">
                                {event.title}
                              </h4>
                              <span className="text-xs text-blue-400">
                                {formatTimestamp(event.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-blue-100">
                              {event.description}
                            </p>
                            {event.relatedStakeholders && event.relatedStakeholders.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {event.relatedStakeholders.map(stakeholderId => {
                                  const stakeholder = sessionData.stakeholders.find(s => s.id === stakeholderId);
                                  return stakeholder ? (
                                    <Badge 
                                      key={stakeholderId} 
                                      variant="outline" 
                                      className="text-xs border-blue-800 bg-blue-900/30"
                                    >
                                      {stakeholder.role}
                                    </Badge>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="metrics" className="mt-2">
                  <ScrollArea className="h-[calc(100vh-280px)] pr-2">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-blue-400 flex items-center mb-2">
                          <BarChart4 className="mr-2 h-4 w-4" />
                          EFFICACITÉ GLOBALE
                        </h3>
                        <div className="bg-blue-900/30 rounded-md p-3 border border-blue-800">
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={sessionData.metrics.overallEffectiveness} 
                              className={`h-2.5 flex-1 ${getColorForValue(sessionData.metrics.overallEffectiveness)}`} 
                            />
                            <span className="text-lg font-bold text-blue-100">
                              {sessionData.metrics.overallEffectiveness}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-950/70 rounded-md p-3 border border-blue-800">
                          <h4 className="text-xs font-medium text-blue-400 mb-1">Réponse technique</h4>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={sessionData.metrics.technicalResponse} 
                              className={`h-2 flex-1 ${getColorForValue(sessionData.metrics.technicalResponse)}`} 
                            />
                            <span className="text-sm font-bold text-blue-100">
                              {sessionData.metrics.technicalResponse}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-blue-950/70 rounded-md p-3 border border-blue-800">
                          <h4 className="text-xs font-medium text-blue-400 mb-1">Communication</h4>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={sessionData.metrics.communicationEffectiveness} 
                              className={`h-2 flex-1 ${getColorForValue(sessionData.metrics.communicationEffectiveness)}`} 
                            />
                            <span className="text-sm font-bold text-blue-100">
                              {sessionData.metrics.communicationEffectiveness}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-blue-950/70 rounded-md p-3 border border-blue-800">
                          <h4 className="text-xs font-medium text-blue-400 mb-1">Continuité d'activité</h4>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={sessionData.metrics.businessContinuity} 
                              className={`h-2 flex-1 ${getColorForValue(sessionData.metrics.businessContinuity)}`} 
                            />
                            <span className="text-sm font-bold text-blue-100">
                              {sessionData.metrics.businessContinuity}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-blue-950/70 rounded-md p-3 border border-blue-800">
                          <h4 className="text-xs font-medium text-blue-400 mb-1">Conformité légale</h4>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={sessionData.metrics.legalCompliance} 
                              className={`h-2 flex-1 ${getColorForValue(sessionData.metrics.legalCompliance)}`} 
                            />
                            <span className="text-sm font-bold text-blue-100">
                              {sessionData.metrics.legalCompliance}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-blue-950/70 rounded-md p-3 border border-blue-800">
                          <h4 className="text-xs font-medium text-blue-400 mb-1">Efficacité temporelle</h4>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={sessionData.metrics.timeEfficiency} 
                              className={`h-2 flex-1 ${getColorForValue(sessionData.metrics.timeEfficiency)}`} 
                            />
                            <span className="text-sm font-bold text-blue-100">
                              {sessionData.metrics.timeEfficiency}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-blue-950/70 rounded-md p-3 border border-blue-800">
                          <h4 className="text-xs font-medium text-blue-400 mb-1">Protection réputation</h4>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={sessionData.metrics.reputationProtection} 
                              className={`h-2 flex-1 ${getColorForValue(sessionData.metrics.reputationProtection)}`} 
                            />
                            <span className="text-sm font-bold text-blue-100">
                              {sessionData.metrics.reputationProtection}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="bg-blue-800/50" />
                      
                      <div>
                        <h3 className="text-sm font-semibold text-blue-400 flex items-center mb-2">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          DÉCISIONS PRISES
                        </h3>
                        
                        {sessionData.decisions && sessionData.decisions.length > 0 ? (
                          <div className="space-y-2">
                            {sessionData.decisions.map((decision) => (
                              <div key={decision.id} className="bg-blue-950/70 rounded-md p-3 border border-blue-800">
                                <h4 className="text-xs font-medium text-blue-400 mb-1">
                                  {decision.decisionPoint}
                                </h4>
                                <p className="text-xs text-blue-100 mb-1">
                                  Option choisie: {decision.selectedOption}
                                </p>
                                {decision.justification && (
                                  <p className="text-xs text-blue-300 italic">
                                    "{decision.justification}"
                                  </p>
                                )}
                                <div className="grid grid-cols-2 gap-1 mt-2">
                                  <div className="flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${
                                      decision.impact.technical > 0 ? 'bg-green-500' : 'bg-red-500'
                                    }`} />
                                    <span className="text-xs text-blue-200">Tech: {decision.impact.technical > 0 ? '+' : ''}{decision.impact.technical}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${
                                      decision.impact.communication > 0 ? 'bg-green-500' : 'bg-red-500'
                                    }`} />
                                    <span className="text-xs text-blue-200">Comm: {decision.impact.communication > 0 ? '+' : ''}{decision.impact.communication}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${
                                      decision.impact.business > 0 ? 'bg-green-500' : 'bg-red-500'
                                    }`} />
                                    <span className="text-xs text-blue-200">Business: {decision.impact.business > 0 ? '+' : ''}{decision.impact.business}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${
                                      decision.impact.legal > 0 ? 'bg-green-500' : 'bg-red-500'
                                    }`} />
                                    <span className="text-xs text-blue-200">Legal: {decision.impact.legal > 0 ? '+' : ''}{decision.impact.legal}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-blue-950/70 rounded-md p-3 border border-blue-800 text-center">
                            <p className="text-xs text-blue-300">
                              Aucune décision enregistrée
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowDecisionDialog(true)}
                              className="mt-2 border-blue-700 bg-blue-900/30 hover:bg-blue-800/50 text-xs"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Enregistrer une décision
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </CardContent>
              </Tabs>
            </Card>
          </div>
        )}
        
        {/* Zone de chat principale */}
        <div className="flex-1">
          <Card className="bg-blue-950/70 border-blue-800 h-full flex flex-col">
            <CardContent className="p-0 flex-1 flex flex-col">
              {/* Messages */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {sessionData.messages.filter(m => m.role !== 'system').map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600/30 ml-auto'
                          : 'bg-blue-950 border border-blue-800'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div 
                          className="prose prose-invert max-w-none" 
                          dangerouslySetInnerHTML={{ 
                            __html: DOMPurify.sanitize(formatTextWithMarkdown(message.content)) 
                          }}
                        />
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-blue-950 border border-blue-800 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-100"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Contrôles de saisie */}
              <div className="border-t border-blue-800 p-4">
                <div className="flex gap-2">
                  <Textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Entrez votre message ou décision..."
                    disabled={sessionData.status !== 'active' || sending}
                    className="flex-1 min-h-[80px] bg-blue-900/30 border-blue-700 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <div className="flex flex-col gap-2">
                    <Button 
                      onClick={sendMessage}
                      disabled={!message.trim() || sessionData.status !== 'active' || sending}
                      className="h-10 px-4 bg-blue-600 hover:bg-blue-700"
                    >
                      {sending ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowDecisionDialog(true)}
                            disabled={sessionData.status !== 'active'}
                            className="h-10 border-blue-700 bg-blue-900/50"
                          >
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Enregistrer une décision importante
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                {/* Statut de la session */}
                <div className="flex justify-between items-center mt-2 text-xs text-blue-300">
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                      sessionData.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    {sessionData.status === 'active' ? 'Session active' : 'Session en pause'}
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Étape {sessionData.currentStage + 1}/{sessionData.scenario.totalStages}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Dialogue de pause */}
      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent className="bg-blue-950 border-blue-700 text-white">
          <DialogHeader>
            <DialogTitle>
              {sessionData.status === 'active' ? 'Mettre en pause la session' : 'Reprendre la session'}
            </DialogTitle>
            <DialogDescription className="text-blue-200">
              {sessionData.status === 'active' 
                ? 'La simulation sera mise en pause. Le timer sera arrêté jusqu\'à ce que vous repreniez la session.'
                : 'Vous allez reprendre la gestion de la crise. Le timer continuera de s\'écouler.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-4">
            {sessionData.status === 'active' ? (
              <PauseCircle className="h-16 w-16 text-yellow-400" />
            ) : (
              <PlayCircle className="h-16 w-16 text-green-400" />
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPauseDialog(false)}
              className="border-blue-700 bg-blue-900/30"
            >
              Annuler
            </Button>
            <Button
              onClick={togglePauseSession}
              className={sessionData.status === 'active' 
                ? 'bg-yellow-600 hover:bg-yellow-700' 
                : 'bg-green-600 hover:bg-green-700'
              }
            >
              {sessionData.status === 'active' ? 'Mettre en pause' : 'Reprendre'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de fin de session */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent className="bg-blue-950 border-blue-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Terminer la session de crise</AlertDialogTitle>
            <AlertDialogDescription className="text-blue-200">
              Êtes-vous sûr de vouloir terminer cette session de gestion de crise ? 
              Un rapport sera généré avec l'analyse de vos performances et décisions.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-blue-700 bg-blue-900/30 text-white hover:bg-blue-800/50 hover:text-white">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={endSession}
              className="bg-red-600 hover:bg-red-700"
            >
              Terminer la session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Dialogue de décision */}
      <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
        <DialogContent className="bg-blue-950 border-blue-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Enregistrer une décision majeure
            </DialogTitle>
            <DialogDescription className="text-blue-200">
              Documenter les décisions importantes améliore la traçabilité et permet une meilleure analyse post-crise.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Point de décision
              </label>
              <Input
                value={currentDecision.decisionPoint}
                onChange={(e) => setCurrentDecision({
                  ...currentDecision,
                  decisionPoint: e.target.value
                })}
                placeholder="Ex: Payer la rançon ou restaurer depuis les backups"
                className="bg-blue-900/30 border-blue-700"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Options considérées
              </label>
              <div className="space-y-2">
                {currentDecision.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option.text}
                      onChange={(e) => {
                        const newOptions = [...currentDecision.options];
                        newOptions[index].text = e.target.value;
                        setCurrentDecision({
                          ...currentDecision,
                          options: newOptions
                        });
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="bg-blue-900/30 border-blue-700"
                    />
                    {currentDecision.options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newOptions = currentDecision.options.filter((_, i) => i !== index);
                          setCurrentDecision({
                            ...currentDecision,
                            options: newOptions,
                            selectedOption: currentDecision.selectedOption === option.id ? '' : currentDecision.selectedOption
                          });
                        }}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentDecision({
                      ...currentDecision,
                      options: [
                        ...currentDecision.options,
                        { id: (currentDecision.options.length + 1).toString(), text: '' }
                      ]
                    });
                  }}
                  className="mt-1 border-blue-700 bg-blue-900/30 hover:bg-blue-800/50 text-sm"
                >
                  Ajouter une option
                </Button>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Option choisie
              </label>
              <Select
                value={currentDecision.selectedOption}
                onValueChange={(value) => setCurrentDecision({
                  ...currentDecision,
                  selectedOption: value
                })}
              >
                <SelectTrigger className="bg-blue-900/30 border-blue-700">
                  <SelectValue placeholder="Sélectionnez l'option choisie" />
                </SelectTrigger>
                <SelectContent className="bg-blue-950 border-blue-700">
                  {currentDecision.options.map((option, index) => (
                    <SelectItem key={index} value={option.text} disabled={!option.text}>
                      {option.text || `Option ${index + 1} (vide)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Justification (optionnelle)
              </label>
              <Textarea
                value={currentDecision.justification}
                onChange={(e) => setCurrentDecision({
                  ...currentDecision,
                  justification: e.target.value
                })}
                placeholder="Pourquoi avez-vous choisi cette option?"
                className="bg-blue-900/30 border-blue-700 min-h-[80px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDecisionDialog(false)}
              className="border-blue-700 bg-blue-900/30"
            >
              Annuler
            </Button>
            <Button
              onClick={saveDecision}
              disabled={!currentDecision.decisionPoint || !currentDecision.selectedOption}
              className="bg-green-600 hover:bg-green-700"
            >
              Enregistrer la décision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue d'allocation des ressources */}
      <Dialog open={resourcesDialogOpen} onOpenChange={setResourcesDialogOpen}>
        <DialogContent className="bg-blue-950 border-blue-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-400" />
              Allocation des ressources
            </DialogTitle>
            <DialogDescription className="text-blue-200">
              Ajustez l'allocation des ressources pour mieux répondre à la crise. 
              L'allocation totale doit être de 100%.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium">
                  Technique: {resourcesForm.technical}%
                </label>
                <div className="flex items-center gap-1 text-xs text-blue-300">
                  <BsLaptop />
                  <span>Équipes IT, Sécurité, Infrastructure</span>
                </div>
              </div>
              <Slider
                value={[resourcesForm.technical]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => setResourcesForm({
                  ...resourcesForm,
                  technical: value[0]
                })}
                className="py-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium">
                  Communication: {resourcesForm.communication}%
                </label>
                <div className="flex items-center gap-1 text-xs text-blue-300">
                  <BsChatSquareText />
                  <span>Relations publiques, Communication</span>
                </div>
              </div>
              <Slider
                value={[resourcesForm.communication]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => setResourcesForm({
                  ...resourcesForm,
                  communication: value[0]
                })}
                className="py-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium">
                  Juridique: {resourcesForm.legal}%
                </label>
                <div className="flex items-center gap-1 text-xs text-blue-300">
                  <BsFileEarmarkText />
                  <span>Conformité, Juridique</span>
                </div>
              </div>
              <Slider
                value={[resourcesForm.legal]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => setResourcesForm({
                  ...resourcesForm,
                  legal: value[0]
                })}
                className="py-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium">
                  Management: {resourcesForm.management}%
                </label>
                <div className="flex items-center gap-1 text-xs text-blue-300">
                  <BsPeople />
                  <span>Direction, Coordination</span>
                </div>
              </div>
              <Slider
                value={[resourcesForm.management]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => setResourcesForm({
                  ...resourcesForm,
                  management: value[0]
                })}
                className="py-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium">
                  Financier: {resourcesForm.financial}%
                </label>
                <div className="flex items-center gap-1 text-xs text-blue-300">
                  <BsBuilding />
                  <span>Finance, Achats</span>
                </div>
              </div>
              <Slider
                value={[resourcesForm.financial]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => setResourcesForm({
                  ...resourcesForm,
                  financial: value[0]
                })}
                className="py-2"
              />
            </div>
            
            <Separator className="bg-blue-800/50" />
            
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">Total:</div>
              <div className={`text-lg font-bold ${
                Math.abs(Object.values(resourcesForm).reduce((sum, value) => sum + value, 0) - 100) > 0.01
                  ? 'text-red-400'
                  : 'text-green-400'
              }`}>
                {Object.values(resourcesForm).reduce((sum, value) => sum + value, 0)}%
              </div>
            </div>
            
            {Math.abs(Object.values(resourcesForm).reduce((sum, value) => sum + value, 0) - 100) > 0.01 && (
              <div className="text-xs text-red-400">
                L'allocation totale des ressources doit être de 100%
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setResourcesForm(sessionData.resources);
                setResourcesDialogOpen(false);
              }}
              className="border-blue-700 bg-blue-900/30"
            >
              Annuler
            </Button>
            <Button
              onClick={updateResources}
              disabled={Math.abs(Object.values(resourcesForm).reduce((sum, value) => sum + value, 0) - 100) > 0.01}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Appliquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de rapport */}
      <Dialog open={showReportDialog} onOpenChange={(open) => {
        if (!open && sessionReport) {
          navigate('/cyber/crisis-management');
        }
        setShowReportDialog(open);
      }}>
        <DialogContent className="bg-blue-950 border-blue-700 text-white max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Rapport de crise - {sessionData.scenario.title}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 max-h-[calc(90vh-12rem)]">
            <div className="py-2 space-y-4" id="report-content">
              {sessionReport ? (
                <>
                  <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700">
                    <h2 className="text-xl font-bold text-blue-200 mb-2">
                      {sessionReport.title}
                    </h2>
                    <p className="text-blue-100">
                      {sessionReport.description}
                    </p>
                  </div>
                  
                  <Separator className="bg-blue-800/50" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1 bg-blue-900/20 rounded-lg p-4 border border-blue-800">
                      <h3 className="text-lg font-bold text-blue-200 mb-3">Analyse des performances</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-blue-100">Réponse technique</span>
                            <span className="text-blue-300">{sessionData.metrics.technicalResponse}%</span>
                          </div>
                          <Progress 
                            value={sessionData.metrics.technicalResponse} 
                            className={`h-2 ${getColorForValue(sessionData.metrics.technicalResponse)}`} 
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-blue-100">Communication</span>
                            <span className="text-blue-300">{sessionData.metrics.communicationEffectiveness}%</span>
                          </div>
                          <Progress 
                            value={sessionData.metrics.communicationEffectiveness} 
                            className={`h-2 ${getColorForValue(sessionData.metrics.communicationEffectiveness)}`} 
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-blue-100">Continuité d'activité</span>
                            <span className="text-blue-300">{sessionData.metrics.businessContinuity}%</span>
                          </div>
                          <Progress 
                            value={sessionData.metrics.businessContinuity} 
                            className={`h-2 ${getColorForValue(sessionData.metrics.businessContinuity)}`} 
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-blue-100">Conformité légale</span>
                            <span className="text-blue-300">{sessionData.metrics.legalCompliance}%</span>
                          </div>
                          <Progress 
                            value={sessionData.metrics.legalCompliance} 
                            className={`h-2 ${getColorForValue(sessionData.metrics.legalCompliance)}`} 
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-blue-100">Performance globale</span>
                            <span className="text-blue-300">{sessionData.metrics.overallEffectiveness}%</span>
                          </div>
                          <Progress 
                            value={sessionData.metrics.overallEffectiveness} 
                            className={`h-2.5 ${getColorForValue(sessionData.metrics.overallEffectiveness)}`} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-2 md:col-span-1 bg-blue-900/20 rounded-lg p-4 border border-blue-800">
                      <h3 className="text-lg font-bold text-blue-200 mb-3">Décisions clés</h3>
                      {sessionData.decisions && sessionData.decisions.length > 0 ? (
                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                          {sessionData.decisions.map((decision) => (
                            <div key={decision.id} className="bg-blue-950/70 rounded-md p-3 border border-blue-800">
                              <h4 className="text-sm font-medium text-blue-300 mb-1">
                                {decision.decisionPoint}
                              </h4>
                              <p className="text-xs text-blue-100">
                                Choix: {decision.selectedOption}
                              </p>
                              {decision.justification && (
                                <p className="text-xs text-blue-200 mt-1 italic">
                                  "{decision.justification}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-blue-300 text-sm">
                          Aucune décision formelle n'a été enregistrée durant cette session.
                        </p>
                      )}
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-blue-300 mb-2">Durée de la session</h4>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-400" />
                          <span className="text-blue-100">{formatTime(timer)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-2 bg-blue-900/20 rounded-lg p-4 border border-blue-800">
                      <h3 className="text-lg font-bold text-blue-200 mb-3">Analyse détaillée</h3>
                      <div 
                        className="prose prose-invert max-w-none" 
                        dangerouslySetInnerHTML={{ 
                          __html: DOMPurify.sanitize(formatTextWithMarkdown(sessionReport.content || '')) 
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <RefreshCw className="h-12 w-12 text-blue-400 animate-spin mb-4" />
                  <p className="text-blue-200">Génération du rapport en cours...</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter className="border-t border-blue-800 pt-4 mt-4">
            <div className="flex gap-3 w-full justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={printReport}
                  className="border-blue-700 bg-blue-900/30"
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Imprimer
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Téléchargement (simplifié)
                    const element = document.createElement('a');
                    const file = new Blob([JSON.stringify(sessionReport, null, 2)], {type: 'application/json'});
                    element.href = URL.createObjectURL(file);
                    element.download = `rapport-crise-${sessionData.scenario.id}-${Date.now()}.json`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="border-blue-700 bg-blue-900/30"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Télécharger
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-700 bg-blue-900/30"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Partager
                </Button>
              </div>
              
              <Button
                onClick={() => navigate('/cyber/crisis-management')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Retour à l'accueil
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}