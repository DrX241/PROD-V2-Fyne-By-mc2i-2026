import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, AlertTriangle, Lock, Clock, Shield, ChevronRight, Info, 
  AlertOctagon, Users, Activity, Banknote, Scale, ShieldAlert, Send,
  Phone, FileText, PanelLeft, MessageSquare, Server, BellRing, BarChart,
  UserCircle2, Crown, Mail, X, Check, Radiation, Loader, Bot
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import HomeLayout from "@/components/layout/HomeLayout";
import PageTitle from "@/components/utils/PageTitle";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import { getStakeholderResponse } from "@/utils/stakeholderResponse";

// Types des parties prenantes (PNJ) dans la crise
interface Stakeholder {
  id: string;
  name: string;
  role: string;
  avatar: string; // URL de l'avatar
  personality: "calm" | "anxious" | "authoritative" | "technical" | "diplomatic";
  department: "IT" | "Executive" | "Communication" | "Legal" | "Operations" | "External";
  expertise: number; // 1-10
  stress: number; // 1-100
  trust: number; // 1-100, confiance envers le RSSI (joueur)
  isAvailable: boolean;
}

// Messages de conversation avec les parties prenantes
interface Message {
  id: string;
  senderId: string; // ID de la partie prenante ou "player" pour le joueur
  content: string;
  timestamp: Date;
  isPrivate?: boolean; // Message uniquement visible par certains participants
  reactionType?: "positive" | "negative" | "neutral";
  isTyping?: boolean; // Indique si le message est en cours de frappe (animation "...")
}

// Conversation avec une partie prenante
interface Conversation {
  id: string;
  stakeholderId: string;
  messages: Message[];
  status: "active" | "paused" | "completed";
  lastActivity: Date;
}

// Système technique impacté
interface AffectedSystem {
  id: string;
  name: string;
  type: "database" | "web-server" | "network" | "endpoint" | "cloud-service" | "application";
  criticalityLevel: number; // 1-10
  status: "compromised" | "at-risk" | "isolated" | "secure" | "unknown";
  impactDetails: string;
  recoveryProgress: number; // 0-100%
  containmentStatus: boolean;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  situation: string;
  incidentType: "ransomware" | "data-breach" | "ddos" | "insider-threat" | "supply-chain" | "zero-day";
  aiMasterPrompt: string; // Prompt pour guider l'IA dans ses réponses
  affectedSystems: AffectedSystem[];
  stakeholders: Stakeholder[];
  conversations: Conversation[];
  warRoom: Message[]; // Messages dans la salle de crise (visible par tous)
  timeline: {
    time: string;
    event: string;
    severity?: "critical" | "high" | "medium" | "low";
  }[];
  decisions: Decision[];
  currentDecisionIndex: number;
  impactAreas: {
    reputation: number;
    operations: number;
    financial: number;
    legal: number;
    dataLoss: number; // Nouveau: mesure les données perdues/compromises
    responseEfficiency: number; // Nouveau: mesure l'efficacité globale de la réponse
  };
  severity: "critical" | "high" | "medium" | "low";
  timeRemaining: number;
  phase: "detection" | "analysis" | "containment" | "eradication" | "recovery" | "lessons-learned";
  realTimeEvents: string[]; // Nouveaux événements inattendus qui peuvent se produire
  currentStakeholderInFocus: string | null; // ID du stakeholder actuellement en conversation
}

interface Decision {
  id: string;
  question: string;
  context?: string; // Contexte supplémentaire pour la décision
  requiredConsultation?: string[]; // IDs des parties prenantes qu'il faut consulter avant de décider
  timeLimit?: number; // Temps limité pour prendre la décision (secondes)
  options: {
    id: string;
    text: string;
    requiredExpertise?: string; // Expertise nécessaire pour comprendre cette option
    stakeholderReactions?: {
      stakeholderId: string;
      reaction: "strongly-approve" | "approve" | "neutral" | "disapprove" | "strongly-disapprove";
      comment: string;
    }[];
    consequences: {
      description: string;
      impactChanges: {
        reputation: number;
        operations: number;
        financial: number;
        legal: number;
        dataLoss: number;
        responseEfficiency: number;
      };
      systemStatusChanges?: { 
        systemId: string; 
        newStatus: AffectedSystem["status"];
        recoveryChange: number;
      }[];
      stakeholderChanges?: {
        stakeholderId: string;
        stressChange: number;
        trustChange: number;
      }[];
      unlockNewStakeholders?: string[]; // IDs des nouvelles parties prenantes débloquées
      triggerEvents?: string[]; // Événements déclenchés par cette décision
    };
  }[];
  selectedOption?: string;
  consultedStakeholders?: string[]; // IDs des parties prenantes qui ont été consultées
  timeSpent?: number; // Temps passé à prendre la décision
}

export default function CrisisManagementPage() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState<'warroom' | 'stakeholders' | 'systems' | 'decisions'>('warroom');
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [focusedStakeholderId, setFocusedStakeholderId] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [consultationDialog, setConsultationDialog] = useState(false);
  const [stakeholdersConsulted, setStakeholdersConsulted] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Générateur d'avatars pour les parties prenantes
  const generateAvatar = (name: string, role: string, department: string) => {
    const colorMap: Record<string, string> = {
      'IT': 'blue-600',
      'Executive': 'purple-700',
      'Communication': 'green-600',
      'Legal': 'amber-700',
      'Operations': 'orange-600',
      'External': 'slate-700'
    };
    
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${colorMap[department]}&color=fff&size=128`;
  };
  
  // Personnages clés customisés - Dirigeants mc2i
  const sampleStakeholders: Stakeholder[] = [
    {
      id: "president",
      name: "Arnaud Gauthier",
      role: "Président",
      avatar: generateAvatar("Arnaud Gauthier", "Président", "Executive"),
      personality: "authoritative",
      department: "Executive",
      expertise: 8,
      stress: 85,
      trust: 90,
      isAvailable: true
    },
    {
      id: "dg",
      name: "Olivier Hervo",
      role: "Directeur Général",
      avatar: generateAvatar("Olivier Hervo", "DG", "Executive"),
      personality: "authoritative",
      department: "Executive",
      expertise: 7,
      stress: 80,
      trust: 85,
      isAvailable: true
    },
    {
      id: "dga-bfa",
      name: "Lorenzo Bertola",
      role: "DGA et Directeur du pôle BFA",
      avatar: generateAvatar("Lorenzo Bertola", "DGA BFA", "Executive"),
      personality: "calm",
      department: "Executive",
      expertise: 6,
      stress: 75,
      trust: 80,
      isAvailable: true
    },
    {
      id: "dga-impulse",
      name: "Guillaume Lechevallier",
      role: "DGA et Directeur du pôle IMPULSE",
      avatar: generateAvatar("Guillaume Lechevallier", "DGA Impulse", "IT"),
      personality: "technical",
      department: "IT",
      expertise: 9,
      stress: 95,
      trust: 90,
      isAvailable: true
    },
    {
      id: "dga-dev",
      name: "Vincent Pascal",
      role: "DGA et Directeur du Développement",
      avatar: generateAvatar("Vincent Pascal", "DGA Développement", "Communication"),
      personality: "diplomatic",
      department: "Communication",
      expertise: 7,
      stress: 65,
      trust: 85,
      isAvailable: true
    },
    {
      id: "dir-finance",
      name: "Vincent Terrier",
      role: "Senior Partner, Directeur Financier",
      avatar: generateAvatar("Vincent Terrier", "Dir. Financier", "Executive"),
      personality: "authoritative",
      department: "Executive",
      expertise: 8,
      stress: 65,
      trust: 90,
      isAvailable: true
    },
    {
      id: "dir-comm",
      name: "Marion Lopez",
      role: "Senior Partner, Directrice Communication et Marketing",
      avatar: generateAvatar("Marion Lopez", "Dir. Communication", "Communication"),
      personality: "diplomatic",
      department: "Communication",
      expertise: 7,
      stress: 70,
      trust: 85,
      isAvailable: true
    },
    {
      id: "president",
      name: "Arnaud Gauthier",
      role: "Président",
      avatar: generateAvatar("Arnaud Gauthier", "Président", "Executive"),
      personality: "calm",
      department: "Executive",
      expertise: 9,
      stress: 60,
      trust: 95,
      isAvailable: true
    },
    {
      id: "dg",
      name: "Olivier Hervo",
      role: "Directeur Général",
      avatar: generateAvatar("Olivier Hervo", "Dir. Général", "Executive"),
      personality: "technical",
      department: "Executive",
      expertise: 10,
      stress: 75,
      trust: 90,
      isAvailable: true
    }
  ];
  
  // Exemples de systèmes affectés
  const sampleAffectedSystems: AffectedSystem[] = [
    {
      id: "crm-system",
      name: "Système CRM",
      type: "application",
      criticalityLevel: 9,
      status: "compromised",
      impactDetails: "Base de données client chiffrée. Accès aux données commerciales impossible.",
      recoveryProgress: 0,
      containmentStatus: false
    },
    {
      id: "email-server",
      name: "Serveur de messagerie",
      type: "web-server",
      criticalityLevel: 8,
      status: "at-risk",
      impactDetails: "Service encore fonctionnel mais présente des signes de compromission.",
      recoveryProgress: 0,
      containmentStatus: false
    },
    {
      id: "financial-db",
      name: "Base de données financière",
      type: "database",
      criticalityLevel: 10,
      status: "compromised",
      impactDetails: "Chiffrement complet. Données comptables et financières inaccessibles.",
      recoveryProgress: 0,
      containmentStatus: false
    },
    {
      id: "file-servers",
      name: "Serveurs de fichiers",
      type: "network",
      criticalityLevel: 7,
      status: "compromised",
      impactDetails: "Partages réseau inaccessibles. Fichiers de travail chiffrés.",
      recoveryProgress: 0,
      containmentStatus: false
    },
    {
      id: "vpn-gateway",
      name: "Passerelle VPN",
      type: "network",
      criticalityLevel: 8,
      status: "at-risk",
      impactDetails: "Connexions à distance compromises. Potentiel point d'entrée.",
      recoveryProgress: 0,
      containmentStatus: false
    },
    {
      id: "erp-system",
      name: "Système ERP",
      type: "application",
      criticalityLevel: 9,
      status: "compromised",
      impactDetails: "Gestion des stocks et chaîne d'approvisionnement affectée.",
      recoveryProgress: 0,
      containmentStatus: false
    }
  ];
  
  // Initialisation des conversations
  const initialWarRoomMessages: Message[] = [
    {
      id: uuidv4(),
      senderId: "dga-impulse",
      content: "Alerte CRITIQUE : Notre infrastructure IT vient d'être touchée par une cyberattaque. Plusieurs serveurs affichent un message de rançon et les systèmes critiques sont inaccessibles.",
      timestamp: new Date(new Date().getTime() - 3600000), // 1 heure plus tôt
      reactionType: "negative"
    },
    {
      id: uuidv4(),
      senderId: "ciso",
      content: "Analyse préliminaire : il s'agit du ransomware BlackCrypt. Propagation via SMB, techniques d'escalade de privilèges avancées. Premier scan montre une compromission étendue de nos systèmes critiques.",
      timestamp: new Date(new Date().getTime() - 3000000), // 50 minutes plus tôt
      reactionType: "negative"
    },
    {
      id: uuidv4(),
      senderId: "dg",
      content: "Situation extrêmement critique. Nous devons activer immédiatement le Plan de Continuité d'Activité. Tous les dirigeants doivent se mobiliser. @RSSI, coordonnez la réponse technique à cet incident.",
      timestamp: new Date(new Date().getTime() - 2400000), // 40 minutes plus tôt
      reactionType: "neutral"
    }
  ];
  
  // Construction des conversations 1:1
  const initialConversations: Conversation[] = sampleStakeholders
    .filter(s => s.isAvailable)
    .map(stakeholder => {
      // Messages personnalisés selon le rôle
      let initialMessages: Message[] = [];
      
      switch(stakeholder.id) {
        case "president":
          initialMessages = [
            {
              id: uuidv4(),
              senderId: "president",
              content: "Cette attaque est inacceptable et menace directement notre réputation. Je veux une évaluation complète de la situation et des perspectives de résolution. Quelles sont vos directives immédiates ?",
              timestamp: new Date(new Date().getTime() - 2000000),
              reactionType: "negative"
            }
          ];
          break;
        case "dg":
          initialMessages = [
            {
              id: uuidv4(),
              senderId: "dg",
              content: "Nous devons gérer cette crise de manière stratégique. J'ai besoin de savoir les implications business précises et le délai de retour à la normale. Devons-nous envisager le paiement de la rançon ?",
              timestamp: new Date(new Date().getTime() - 1950000),
              reactionType: "negative"
            }
          ];
          break;
        case "dga-impulse":
          initialMessages = [
            {
              id: uuidv4(),
              senderId: "dga-impulse",
              content: "Notre infrastructure IT est gravement compromise ! Tous nos systèmes critiques sont touchés. La situation est alarmante, nous avons besoin d'un plan d'action immédiat. Que devons-nous faire en priorité ?",
              timestamp: new Date(new Date().getTime() - 1800000),
              reactionType: "negative"
            }
          ];
          break;
        case "dga-bfa":
          initialMessages = [
            {
              id: uuidv4(),
              senderId: "dga-bfa",
              content: "Je m'inquiète particulièrement des implications financières de cette attaque. Pouvez-vous évaluer l'impact sur nos activités critiques et leurs conséquences économiques ?",
              timestamp: new Date(new Date().getTime() - 1600000),
              reactionType: "neutral"
            }
          ];
          break;
        case "dga-dev":
          initialMessages = [
            {
              id: uuidv4(),
              senderId: "dga-dev",
              content: "Cette situation pourrait impacter gravement notre image auprès des clients. Comment prévoyez-vous de gérer la communication externe ? Devons-nous informer tous nos clients ?",
              timestamp: new Date(new Date().getTime() - 1550000),
              reactionType: "neutral"
            }
          ];
          break;
        case "dir-finance":
          initialMessages = [
            {
              id: uuidv4(),
              senderId: "dir-finance",
              content: "En tant que Directeur Financier, je dois évaluer l'impact économique de cette attaque. Avez-vous une estimation des coûts potentiels pour les différents scénarios de résolution ?",
              timestamp: new Date(new Date().getTime() - 1700000),
              reactionType: "neutral"
            }
          ];
          break;
        case "dir-comm":
          initialMessages = [
            {
              id: uuidv4(),
              senderId: "dir-comm",
              content: "La communication est cruciale dans cette crise. Nous devons préparer une stratégie à destination des clients et des médias. Quelles informations puis-je communiquer sans aggraver notre situation ?",
              timestamp: new Date(new Date().getTime() - 1650000),
              reactionType: "neutral"
            }
          ];
          break;
        default:
          // Messages génériques pour les autres parties prenantes
          initialMessages = [
            {
              id: uuidv4(),
              senderId: stakeholder.id,
              content: `En tant que ${stakeholder.role}, j'ai besoin de comprendre la situation exacte et les actions que vous préconisez pour gérer cette crise.`,
              timestamp: new Date(new Date().getTime() - Math.random() * 1800000),
              reactionType: "neutral"
            }
          ];
      }
      
      return {
        id: uuidv4(),
        stakeholderId: stakeholder.id,
        messages: initialMessages,
        status: "active",
        lastActivity: initialMessages[0]?.timestamp || new Date()
      };
    });
  
  // Échantillon de scénario de crise (ransomware)
  const sampleScenario: Scenario = {
    id: uuidv4(),
    title: "Crise Ransomware - Attaque BlackCrypt",
    description: "Votre entreprise est victime d'une attaque par ransomware. En tant que RSSI, vous devez gérer la crise et minimiser les impacts.",
    situation: `Il est 7h30 du matin lorsque vous recevez un appel d'urgence du responsable des opérations IT. 
    
Un message de rançon est apparu sur plusieurs serveurs critiques et des postes de travail dans toute l'entreprise. Les fichiers semblent être chiffrés et inaccessibles.

L'équipe technique confirme une propagation rapide du ransomware BlackCrypt. Plusieurs systèmes critiques sont déjà hors service, dont le système CRM, la base de données financière, et les serveurs de fichiers.

La demande de rançon s'élève à 500 000 € en Bitcoin, avec une menace de publication des données exfiltrées et une augmentation du montant après 48 heures.`,
    incidentType: "ransomware",
    aiMasterPrompt: `Tu es le maître du jeu d'une simulation de crise cybersécurité de type ransomware. 
    
Tu joues le rôle de différentes parties prenantes (stakeholders) qui interagissent avec le joueur qui est le RSSI.
    
Adapte tes réponses au style de personnalité de chaque stakeholder:
- Arnaud Gauthier (Président): autoritaire, orienté vision globale, préoccupé par la réputation de l'entreprise
- Olivier Hervo (Directeur Général): autoritaire, stratégique, soucieux des implications business
- Lorenzo Bertola (DGA pôle BFA): calme, analytique, attentif aux impacts financiers
- Anthony Frescal (DGA pôle ENERGIES): technique, méthodique, pragmatique dans ses approches
- Guillaume Lechevallier (DGA pôle IMPULSE): technique, anxieux face à la crise, orienté solutions informatiques
- Vincent Pascal (DGA Développement): diplomatique, préoccupé par l'image publique et les relations clients
- Marc Durand (Directeur Juridique): prudent, orienté conformité réglementaire, soucieux des implications légales
- Sophie Lambert (Experte Cybersécurité): très technique, factuelle, précise dans ses analyses et recommandations

Tu dois fournir des informations réalistes sur une crise ransomware et créer un sentiment d'urgence. Le ransomware s'appelle BlackCrypt et a chiffré plusieurs systèmes critiques de mc2i. 

N'invente pas de résolution magique et n'accepte pas de raccourcis techniques irréalistes. Les décisions du joueur doivent avoir des conséquences réalistes.`,
    stakeholders: sampleStakeholders,
    affectedSystems: sampleAffectedSystems,
    conversations: initialConversations,
    warRoom: initialWarRoomMessages,
    timeline: [
      {
        time: "05:23",
        event: "Premières traces d'activité suspecte détectées dans les logs VPN",
        severity: "low"
      },
      {
        time: "06:15",
        event: "Activité anormale sur plusieurs serveurs - exécution de scripts PowerShell non identifiés",
        severity: "medium"
      },
      {
        time: "06:42",
        event: "Première apparition du fichier de rançon sur un serveur de fichiers",
        severity: "high"
      },
      {
        time: "07:05",
        event: "Multiplication rapide des fichiers chiffrés à travers le réseau",
        severity: "critical"
      },
      {
        time: "07:21",
        event: "Alerte des équipes IT - Confirmation de l'attaque par ransomware",
        severity: "critical"
      },
      {
        time: "07:30",
        event: "Activation de la cellule de crise - Début de la gestion d'incident",
        severity: "high"
      }
    ],
    decisions: [
      {
        id: "initial-containment",
        question: "Quelle stratégie d'isolement initiale recommandez-vous ?",
        context: "L'attaque est en cours et les systèmes continuent d'être infectés. Une action rapide est nécessaire pour limiter la propagation.",
        requiredConsultation: ["security-analyst", "it-ops"],
        options: [
          {
            id: "isolate-all",
            text: "Isoler immédiatement TOUS les systèmes informatiques du réseau",
            stakeholderReactions: [
              {
                stakeholderId: "ceo",
                reaction: "strongly-disapprove",
                comment: "C'est radical ! Avons-nous vraiment besoin d'arrêter toute l'activité ?"
              },
              {
                stakeholderId: "security-analyst",
                reaction: "strongly-approve",
                comment: "C'est la seule façon d'être certain de stopper la propagation immédiatement."
              }
            ],
            consequences: {
              description: "La propagation a été stoppée net, mais toutes les opérations informatiques sont à l'arrêt, paralysant l'entreprise.",
              impactChanges: {
                reputation: 10,
                operations: 80,
                financial: 60,
                legal: 5,
                dataLoss: 25,
                responseEfficiency: 80
              },
              systemStatusChanges: [
                { systemId: "email-server", newStatus: "isolated", recoveryChange: 0 },
                { systemId: "vpn-gateway", newStatus: "isolated", recoveryChange: 0 }
              ],
              stakeholderChanges: [
                { stakeholderId: "dg", stressChange: 20, trustChange: -15 },
                { stakeholderId: "president", stressChange: 25, trustChange: -5 },
                { stakeholderId: "dir-finance", stressChange: -10, trustChange: 10 }
              ]
            }
          },
          {
            id: "isolate-affected",
            text: "Isoler uniquement les systèmes visiblement affectés et les systèmes critiques",
            stakeholderReactions: [
              {
                stakeholderId: "dg",
                reaction: "approve",
                comment: "Une approche plus équilibrée, j'approuve."
              },
              {
                stakeholderId: "dir-finance",
                reaction: "neutral",
                comment: "C'est un compromis financier acceptable, mais surveillons l'impact potentiel sur notre activité."
              }
            ],
            consequences: {
              description: "La propagation a ralenti mais continue sur certains systèmes non-isolés. L'activité est partiellement maintenue.",
              impactChanges: {
                reputation: 20,
                operations: 45,
                financial: 40,
                legal: 20,
                dataLoss: 50,
                responseEfficiency: 50
              }
            }
          },
          {
            id: "monitor-only",
            text: "Surveiller attentivement sans isoler de systèmes pour l'instant",
            stakeholderReactions: [
              {
                stakeholderId: "dg",
                reaction: "approve",
                comment: "Cela nous permet de rester opérationnels, c'est ma préférence."
              },
              {
                stakeholderId: "dir-comm",
                reaction: "strongly-disapprove",
                comment: "C'est extrêmement risqué pour notre réputation ! Nous devons montrer que nous agissons de manière proactive !"
              }
            ],
            consequences: {
              description: "La propagation continue sans entrave, infectant de plus en plus de systèmes. Les opérations continuent temporairement mais la situation s'aggrave.",
              impactChanges: {
                reputation: 40,
                operations: 20,
                financial: 15,
                legal: 50,
                dataLoss: 90,
                responseEfficiency: 10
              }
            }
          }
        ],
        selectedOption: undefined
      }
    ],
    currentDecisionIndex: 0,
    impactAreas: {
      reputation: 20,
      operations: 40,
      financial: 35,
      legal: 25,
      dataLoss: 30,
      responseEfficiency: 50
    },
    severity: "critical",
    timeRemaining: 3600, // 1 heure en secondes
    phase: "detection",
    realTimeEvents: [
      "Le PDG vient d'être contacté par des journalistes au sujet d'une possible fuite de données",
      "Un employé rapporte des comportements suspects sur son poste avant l'attaque",
      "Un client important signale ne plus pouvoir accéder au portail de commandes"
    ],
    currentStakeholderInFocus: null
  };
  
  // État pour suivre combien de parties prenantes doivent être consultées pour la décision actuelle
  const [requiredConsultations, setRequiredConsultations] = useState<{
    required: string[];
    consulted: string[];
  }>({ required: [], consulted: [] });
  
  // Initialisation du scénario
  useEffect(() => {
    const initScenario = async () => {
      setIsLoading(true);
      // Simulation d'un chargement
      setTimeout(() => {
        setScenario(sampleScenario);
        setIsLoading(false);
        startTimer();
        
        // S'il y a des consultations requises, les initialiser
        if (sampleScenario.decisions[0].requiredConsultation) {
          setRequiredConsultations({
            required: sampleScenario.decisions[0].requiredConsultation,
            consulted: []
          });
        }
        
        toast({
          title: "Simulation de crise démarrée",
          description: "Attaque ransomware BlackCrypt en cours. Prenez vos premières décisions rapidement.",
          variant: "destructive",
        });
      }, 1500);
    };
    
    initScenario();
    
    // Cleanup
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);
  
  // Scroll automatique vers le bas des messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scenario?.warRoom, focusedStakeholderId]);
  
  // Démarrer le timer de la crise
  const startTimer = () => {
    if (timer) {
      clearInterval(timer);
    }
    
    const newTimer = setInterval(() => {
      setScenario((prev) => {
        if (!prev) return prev;
        
        const newTimeRemaining = prev.timeRemaining - 1;
        
        if (newTimeRemaining <= 0) {
          clearInterval(newTimer);
          setShowSummary(true);
          return {
            ...prev,
            timeRemaining: 0
          };
        }
        
        // Déclencher des événements aléatoires occasionnellement
        if (newTimeRemaining % 120 === 0 && Math.random() > 0.7) {
          triggerRandomEvent();
        }
        
        return {
          ...prev,
          timeRemaining: newTimeRemaining
        };
      });
    }, 1000);
    
    setTimer(newTimer);
  };
  
  // Trigger un événement aléatoire pendant la crise
  const triggerRandomEvent = () => {
    if (!scenario) return;
    
    const eventTypes = [
      "Un employé vient de publier sur les réseaux sociaux à propos de l'incident.",
      "Un journaliste a contacté le service communication à propos de rumeurs d'attaque.",
      "Les premiers clients commencent à se plaindre de l'indisponibilité des services.",
      "L'équipe juridique signale que les autorités doivent être notifiées rapidement.",
      "Un nouveau groupe de fichiers vient d'être chiffré dans un département qui semblait épargné."
    ];
    
    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    setNotificationMessage(randomEvent);
    setShowNotification(true);
    
    // Ajouter l'événement à la timeline
    setScenario(prev => {
      if (!prev) return prev;
      const currentTime = new Date();
      const timeString = `${currentTime.getHours()}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
      
      return {
        ...prev,
        timeline: [...prev.timeline, {
          time: timeString,
          event: randomEvent,
          severity: "medium"
        }]
      };
    });
    
    // Notification
    toast({
      title: "Nouvel événement !",
      description: randomEvent,
      variant: "destructive",
    });
    
    // Masquer la notification après quelques secondes
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };
  
  // Formater le temps restant en MM:SS
  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Gérer le choix d'une décision
  const makeDecision = (optionId: string) => {
    if (!scenario) return;
    
    // Vérifier si les consultations requises ont été faites
    const currentDecision = scenario.decisions[scenario.currentDecisionIndex];
    if (currentDecision.requiredConsultation && 
        !currentDecision.requiredConsultation.every(stakeholderId => 
          requiredConsultations.consulted.includes(stakeholderId))) {
      
      // Ouvrir le dialogue de consultation si des parties prenantes n'ont pas été consultées
      setConsultationDialog(true);
      return;
    }
    
    // Appliquer les conséquences de la décision
    const decision = scenario.decisions[scenario.currentDecisionIndex];
    const selectedOption = decision.options.find(opt => opt.id === optionId);
    
    if (!selectedOption) return;
    
    // Mettre à jour le scénario avec la décision prise
    setScenario(prev => {
      if (!prev) return prev;
      
      // Mettre à jour les indicateurs d'impact
      const newImpactAreas = { ...prev.impactAreas };
      Object.keys(selectedOption.consequences.impactChanges).forEach(key => {
        const impactKey = key as keyof typeof newImpactAreas;
        const currentValue = newImpactAreas[impactKey] || 0;
        const change = selectedOption.consequences.impactChanges[impactKey as keyof typeof selectedOption.consequences.impactChanges] || 0;
        
        // Limiter les valeurs entre 0 et 100
        newImpactAreas[impactKey] = Math.max(0, Math.min(100, currentValue + change));
      });
      
      // Mettre à jour les statuts des systèmes si spécifié
      const newAffectedSystems = [...prev.affectedSystems];
      if (selectedOption.consequences.systemStatusChanges) {
        selectedOption.consequences.systemStatusChanges.forEach(change => {
          const systemIndex = newAffectedSystems.findIndex(sys => sys.id === change.systemId);
          if (systemIndex !== -1) {
            newAffectedSystems[systemIndex] = {
              ...newAffectedSystems[systemIndex],
              status: change.newStatus,
              recoveryProgress: newAffectedSystems[systemIndex].recoveryProgress + (change.recoveryChange || 0)
            };
          }
        });
      }
      
      // Mettre à jour les parties prenantes si spécifié
      const newStakeholders = [...prev.stakeholders];
      if (selectedOption.consequences.stakeholderChanges) {
        selectedOption.consequences.stakeholderChanges.forEach(change => {
          const stakeholderIndex = newStakeholders.findIndex(s => s.id === change.stakeholderId);
          if (stakeholderIndex !== -1) {
            newStakeholders[stakeholderIndex] = {
              ...newStakeholders[stakeholderIndex],
              stress: Math.max(0, Math.min(100, newStakeholders[stakeholderIndex].stress + change.stressChange)),
              trust: Math.max(0, Math.min(100, newStakeholders[stakeholderIndex].trust + change.trustChange))
            };
          }
        });
      }
      
      // Débloquer de nouvelles parties prenantes si spécifié
      if (selectedOption.consequences.unlockNewStakeholders) {
        selectedOption.consequences.unlockNewStakeholders.forEach(id => {
          const stakeholderIndex = newStakeholders.findIndex(s => s.id === id);
          if (stakeholderIndex !== -1) {
            newStakeholders[stakeholderIndex] = {
              ...newStakeholders[stakeholderIndex],
              isAvailable: true
            };
            
            // Notification nouveau PNJ disponible
            toast({
              title: "Nouveau contact disponible",
              description: `${newStakeholders[stakeholderIndex].name} (${newStakeholders[stakeholderIndex].role}) est maintenant disponible pour consultation.`,
              variant: "default",
            });
          }
        });
      }
      
      // Mettre à jour la timeline
      const currentTime = new Date();
      const timeString = `${currentTime.getHours()}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
      const newTimeline = [...prev.timeline, {
        time: timeString,
        event: `Décision prise: ${selectedOption.text}`,
        severity: "high"
      }];
      
      // Mettre à jour les décisions
      const newDecisions = [...prev.decisions];
      newDecisions[prev.currentDecisionIndex] = {
        ...newDecisions[prev.currentDecisionIndex],
        selectedOption: optionId,
        consultedStakeholders: requiredConsultations.consulted
      };
      
      // Si c'était la dernière décision
      if (prev.currentDecisionIndex === prev.decisions.length - 1) {
        // Fin de la simulation
        return {
          ...prev,
          affectedSystems: newAffectedSystems,
          stakeholders: newStakeholders,
          impactAreas: newImpactAreas,
          decisions: newDecisions,
          timeline: newTimeline,
          phase: "containment" // Avancer la phase
        };
      }
      
      // Si ce n'est pas la dernière décision, passer à la suivante
      const nextRequiredConsultation = newDecisions[prev.currentDecisionIndex + 1].requiredConsultation || [];
      setRequiredConsultations({
        required: nextRequiredConsultation,
        consulted: []
      });
      
      return {
        ...prev,
        affectedSystems: newAffectedSystems,
        stakeholders: newStakeholders,
        impactAreas: newImpactAreas,
        decisions: newDecisions,
        timeline: newTimeline,
        currentDecisionIndex: prev.currentDecisionIndex + 1
      };
    });
    
    // Notification de décision prise
    toast({
      title: "Décision prise",
      description: selectedOption.consequences.description,
    });
  };
  
  // Calculer un score global pour le résumé final
  const calculateOverallScore = (): number => {
    if (!scenario) return 0;
    
    const weights = {
      reputation: 0.15,
      operations: 0.25,
      financial: 0.20,
      legal: 0.15,
      dataLoss: 0.15,
      responseEfficiency: 0.10
    };
    
    // Pour le score, on inverse certaines métriques (plus c'est bas, mieux c'est)
    const inversedMetrics = ['dataLoss'];
    
    let score = 0;
    Object.keys(weights).forEach(key => {
      const metricKey = key as keyof typeof weights;
      const weight = weights[metricKey];
      let value = scenario.impactAreas[metricKey as keyof typeof scenario.impactAreas] || 0;
      
      // Inverser certaines métriques (100 - valeur)
      if (inversedMetrics.includes(key)) {
        value = 100 - value;
      }
      
      score += weight * value;
    });
    
    return Math.round(score);
  };
  
  // Fonction pour redémarrer le scénario
  const restartScenario = () => {
    setIsLoading(true);
    setShowSummary(false);
    setFocusedStakeholderId(null);
    setRequiredConsultations({ required: [], consulted: [] });
    
    // Simuler un temps de chargement
    setTimeout(() => {
      setScenario(sampleScenario);
      setIsLoading(false);
      startTimer();
      
      // Initialiser les consultations requises pour la première décision
      if (sampleScenario.decisions[0].requiredConsultation) {
        setRequiredConsultations({
          required: sampleScenario.decisions[0].requiredConsultation,
          consulted: []
        });
      }
      
      toast({
        title: "Scénario redémarré",
        description: "Nouvelle simulation lancée. Bonne chance !",
        variant: "default",
      });
    }, 1500);
  };
  
  // Fonction pour retourner à la page précédente
  const handleReturnToPrevious = () => {
    setLocation('/cyber');
  };
  
  // Gérer les consultations avec les parties prenantes
  const consultStakeholder = (stakeholderId: string) => {
    setFocusedStakeholderId(stakeholderId);
    setActiveTab('stakeholders');
    
    // Marquer cette partie prenante comme consultée
    if (requiredConsultations.required.includes(stakeholderId) && 
        !requiredConsultations.consulted.includes(stakeholderId)) {
      setRequiredConsultations(prev => ({
        ...prev,
        consulted: [...prev.consulted, stakeholderId]
      }));
    }
  };
  
  // Générer une réponse IA pour un stakeholder
  const generateAIResponse = async (stakeholderId: string, userMessage: string) => {
    try {
      if (!scenario) return;
      
      // Trouver le stakeholder
      const stakeholder = scenario.stakeholders.find(s => s.id === stakeholderId);
      if (!stakeholder) return;
      
      // Trouver la conversation
      const conversation = scenario.conversations.find(c => c.stakeholderId === stakeholderId);
      if (!conversation) return;
      
      // Créer un message de "typing" (..." pour indiquer que l'IA est en train d'écrire)
      const typingMessage: Message = {
        id: uuidv4(),
        senderId: stakeholderId,
        content: "...",
        timestamp: new Date(),
        isTyping: true
      };
      
      // Ajouter le message "typing" temporairement
      setScenario(prev => {
        if (!prev) return prev;
        
        const conversationIndex = prev.conversations.findIndex(c => c.stakeholderId === stakeholderId);
        if (conversationIndex === -1) return prev;
        
        const updatedConversations = [...prev.conversations];
        updatedConversations[conversationIndex] = {
          ...updatedConversations[conversationIndex],
          messages: [...updatedConversations[conversationIndex].messages, typingMessage],
          lastActivity: new Date()
        };
        
        return {
          ...prev,
          conversations: updatedConversations
        };
      });
      
      // Activer l'indicateur d'état "typing"
      setIsTyping(true);
      
      // Attendre la réponse de l'IA via le service dédié
      const { message, stressChange, trustChange } = await getStakeholderResponse(
        stakeholder,
        conversation.messages,
        userMessage
      );
      
      // Mettre à jour le scénario avec la réponse de l'IA
      setScenario(prev => {
        if (!prev) return prev;
        
        const conversationIndex = prev.conversations.findIndex(c => c.stakeholderId === stakeholderId);
        if (conversationIndex === -1) return prev;
        
        // Filtrer pour retirer le message "typing"
        const filteredMessages = prev.conversations[conversationIndex].messages
          .filter(msg => !msg.isTyping);
        
        const updatedConversations = [...prev.conversations];
        updatedConversations[conversationIndex] = {
          ...updatedConversations[conversationIndex],
          messages: [...filteredMessages, message],
          lastActivity: new Date()
        };
        
        // Mise à jour des statistiques du stakeholder
        const updatedStakeholders = prev.stakeholders.map(s => {
          if (s.id === stakeholderId) {
            return {
              ...s,
              stress: Math.max(0, Math.min(100, s.stress + stressChange)),
              trust: Math.max(0, Math.min(100, s.trust + trustChange))
            };
          }
          return s;
        });
        
        return {
          ...prev,
          conversations: updatedConversations,
          stakeholders: updatedStakeholders
        };
      });
      
    } catch (error) {
      console.error("Erreur lors de la génération de la réponse:", error);
      toast({
        title: "Erreur de communication",
        description: "Impossible de générer une réponse pour ce contact.",
        variant: "destructive",
      });
    } finally {
      // Désactiver l'indicateur de frappe
      setIsTyping(false);
    }
  };
  
  // Gérer l'envoi de messages dans la conversation
  const handleSendMessage = () => {
    if (!messageInput.trim() || !scenario) return;
    
    const userMessageContent = messageInput; // Sauvegarder le contenu
    setIsSending(true);
    
    // Construire le nouveau message du joueur
    const newMessage: Message = {
      id: uuidv4(),
      senderId: "player",
      content: userMessageContent,
      timestamp: new Date()
    };
    
    // Effacer le message après l'envoi
    setMessageInput("");
    
    // Destination du message selon l'onglet actif
    if (activeTab === 'warroom') {
      // Message dans la war room (tous les participants)
      setScenario(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          warRoom: [...prev.warRoom, newMessage]
        };
      });
      
      // Terminer l'envoi du message
      setIsSending(false);
      
    } else if (activeTab === 'stakeholders' && focusedStakeholderId) {
      // Message privé à une partie prenante spécifique
      setScenario(prev => {
        if (!prev) return prev;
        
        const conversationIndex = prev.conversations.findIndex(
          c => c.stakeholderId === focusedStakeholderId
        );
        
        if (conversationIndex === -1) return prev;
        
        const updatedConversations = [...prev.conversations];
        updatedConversations[conversationIndex] = {
          ...updatedConversations[conversationIndex],
          messages: [...updatedConversations[conversationIndex].messages, newMessage],
          lastActivity: new Date()
        };
        
        return {
          ...prev,
          conversations: updatedConversations
        };
      });
      
      // Terminer l'envoi du message
      setIsSending(false);
      
      // Déclencher une réponse du PNJ après un court délai
      setTimeout(() => {
        // Appeler la fonction de génération de réponse IA
        generateAIResponse(focusedStakeholderId, userMessageContent);
      }, 1000);
    }
  };
        
        // Créer le prompt système pour Azure OpenAI
        const systemPrompt = `Tu incarnes ${stakeholder.name}, ${stakeholder.role} chez mc2i, une entreprise de conseil en transformation numérique. 
Tu fais face à une attaque par ransomware critique qui a touché les systèmes informatiques de l'entreprise.
Ta personnalité est "${stakeholder.personality === "technical" ? "technique et analytique" : 
                       stakeholder.personality === "anxious" ? "stressée et inquiète" :
                       stakeholder.personality === "authoritative" ? "autoritaire et exigeante" :
                       stakeholder.personality === "diplomatic" ? "diplomatique et mesurée" : "calme et réfléchie"}".
Ton niveau de stress actuel est ${stakeholder.stress < 30 ? "faible" : stakeholder.stress < 70 ? "modéré" : "très élevé"}.
Ta confiance envers le RSSI (l'utilisateur) est ${stakeholder.trust < 50 ? "limitée" : stakeholder.trust < 80 ? "moyenne" : "élevée"}.
Tu t'occupes de ${stakeholder.department === "IT" ? "l'informatique et la technologie" :
                 stakeholder.department === "Executive" ? "la direction stratégique" :
                 stakeholder.department === "Communication" ? "la communication et les relations publiques" :
                 stakeholder.department === "Legal" ? "les aspects juridiques et réglementaires" : "les opérations"}.
Réponds de façon brève (maximum 2-3 phrases), avec la personnalité indiquée, en tenant compte de la crise actuelle. Ne dépasse pas 150 mots.`;
        
        // Appel à l'API Azure OpenAI
        const response = await axios.post('/api/openai/generate-response', {
          model: "gpt-4o-mini",
          systemPrompt,
          messages: recentMessages,
          temperature: 0.7,
          max_tokens: 150
        });
        
        const aiResponse = response.data?.response || 
          "Je dois réfléchir à la situation avant de vous donner une réponse complète.";
        
        // Déterminer le ton émotionnel de la réponse
        let reactionType: "positive" | "negative" | "neutral" = "neutral";
        
        if (aiResponse.toLowerCase().includes("inqui") || 
            aiResponse.toLowerCase().includes("préoccup") || 
            aiResponse.toLowerCase().includes("stress") || 
            aiResponse.toLowerCase().includes("urgent") || 
            aiResponse.toLowerCase().includes("crise")) {
          reactionType = "negative";
        } else if (aiResponse.toLowerCase().includes("satisf") || 
                  aiResponse.toLowerCase().includes("confian") || 
                  aiResponse.toLowerCase().includes("bien") || 
                  aiResponse.toLowerCase().includes("solution") || 
                  aiResponse.toLowerCase().includes("d'accord")) {
          reactionType = "positive";
        }
        
        // Créer la réponse finale
        const responseMessage: Message = {
          id: uuidv4(),
          senderId: focusedStakeholderId,
          content: aiResponse,
          timestamp: new Date(),
          reactionType: reactionType
        };
        
        // Mettre à jour le scénario en remplaçant le message "typing"
        setScenario(prev => {
          if (!prev) return prev;
          
          const conversationIndex = prev.conversations.findIndex(
            c => c.stakeholderId === focusedStakeholderId
          );
          
          if (conversationIndex === -1) return prev;
          
          // Filtrer pour retirer le message "typing"
          const filteredMessages = prev.conversations[conversationIndex].messages
            .filter(msg => !msg.isTyping);
          
          const updatedConversations = [...prev.conversations];
          updatedConversations[conversationIndex] = {
            ...updatedConversations[conversationIndex],
            messages: [...filteredMessages, responseMessage],
            lastActivity: new Date()
          };
          
          // Mise à jour des statistiques du stakeholder
          const updatedStakeholders = prev.stakeholders.map(s => {
            if (s.id === focusedStakeholderId) {
              // Calculer les changements en fonction du contenu
              let stressChange = 0;
              let trustChange = 0;
              
              if (messageInput.toLowerCase().includes("plan") || 
                  messageInput.toLowerCase().includes("solution") || 
                  messageInput.toLowerCase().includes("sécuris")) {
                stressChange = -5;
                trustChange = +3;
              } else if (messageInput.toLowerCase().includes("problème") || 
                        messageInput.toLowerCase().includes("risque") || 
                        messageInput.toLowerCase().includes("urgent")) {
                stressChange = +3;
                trustChange = -2;
              }
              
              // Ajuster en fonction de la réaction de l'IA
              if (reactionType === "positive") {
                stressChange -= 2;
                trustChange += 2;
              } else if (reactionType === "negative") {
                stressChange += 2;
                trustChange -= 1;
              }
              
              return {
                ...s,
                stress: Math.max(0, Math.min(100, s.stress + stressChange)),
                trust: Math.max(0, Math.min(100, s.trust + trustChange))
              };
            }
            return s;
          });
          
          return {
            ...prev,
            conversations: updatedConversations,
            stakeholders: updatedStakeholders
          };
        });

      } catch (error) {
        console.error("Erreur lors de la génération de réponse IA:", error);
        
        // Fallback en cas d'erreur d'API
        setScenario(prev => {
          if (!prev) return prev;
          
          const conversationIndex = prev.conversations.findIndex(
            c => c.stakeholderId === focusedStakeholderId
          );
          
          if (conversationIndex === -1) return prev;
          
          // Filtrer pour retirer le message "typing"
          const filteredMessages = prev.conversations[conversationIndex].messages
            .filter(msg => !msg.isTyping);
          
          // Message de fallback
          const fallbackMessage: Message = {
            id: uuidv4(),
            senderId: focusedStakeholderId,
            content: "Je dois réfléchir à la situation. Revenons à ça dans un moment.",
            timestamp: new Date(),
            reactionType: "neutral"
          };
          
          const updatedConversations = [...prev.conversations];
          updatedConversations[conversationIndex] = {
            ...updatedConversations[conversationIndex],
            messages: [...filteredMessages, fallbackMessage],
            lastActivity: new Date()
          };
          
          return {
            ...prev,
            conversations: updatedConversations
          };
        });
        
        toast({
          title: "Problème de communication",
          description: "Impossible de joindre ce contact pour le moment.",
          variant: "destructive",
        });
      } finally {
        setIsTyping(false);
      }
    }
    
    setMessageInput('');
    setIsSending(false);
  };
  
  // Obtenir les messages de la conversation en cours
  const getCurrentConversationMessages = () => {
    if (!scenario) return [];
    
    if (activeTab === 'warroom') {
      return scenario.warRoom;
    } else if (activeTab === 'stakeholders' && focusedStakeholderId) {
      const conversation = scenario.conversations.find(
        c => c.stakeholderId === focusedStakeholderId
      );
      return conversation ? conversation.messages : [];
    }
    
    return [];
  };
  
  // Obtenir les informations du stakeholder en cours de conversation
  const getFocusedStakeholder = () => {
    if (!scenario || !focusedStakeholderId) return null;
    return scenario.stakeholders.find(s => s.id === focusedStakeholderId);
  };
  
  // Rendu de l'interface utilisateur
  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden relative">
        {/* Overlay d'éléments de crise en arrière-plan - Effet visuel amélioré */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Grille de fond façon "réseau compromis" */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          {/* Éléments dynamiques */}
          <div className="absolute top-20 left-10 transform -rotate-12 animate-pulse">
            <div className="text-6xl font-mono text-rose-500 font-bold tracking-tighter">ERROR</div>
            <div className="text-4xl font-mono text-rose-400 tracking-wide">SECURITY BREACH</div>
          </div>
          
          <div className="absolute bottom-20 right-10 transform rotate-12 animate-pulse" style={{animationDelay: '1.5s'}}>
            <div className="text-5xl font-mono text-rose-500 font-bold tracking-tighter">ALERT</div>
            <div className="text-3xl font-mono text-rose-400 tracking-wide">CRITICAL FAILURE</div>
          </div>
          
          <div className="absolute top-1/3 left-1/3 transform -rotate-45 animate-pulse" style={{animationDelay: '0.8s'}}>
            <div className="text-7xl font-mono text-rose-500/50 font-bold tracking-tighter">INCIDENT</div>
          </div>
          
          {/* Simulation d'écran de système compromis */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-full h-full flex flex-col gap-3 overflow-hidden p-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="text-xs font-mono text-rose-500 whitespace-nowrap overflow-hidden" 
                     style={{opacity: Math.random() * 0.7 + 0.3}}>
                  {Array.from({ length: Math.floor(Math.random() * 20) + 10 }).map((_, j) => (
                    <span key={j} className="inline-block mx-1">
                      {Math.random() > 0.5 ? 
                        (Math.random() > 0.7 ? "ACCESS_DENIED" : "ERROR_0x8007") : 
                        (Math.random() > 0.6 ? "BREACH_DETECTED" : "SYSTEM_FAILURE")}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          {/* Lignes et connexions simulant un réseau attaqué */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#991b1b" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {Array.from({ length: 20 }).map((_, i) => {
              const x1 = Math.random() * 100;
              const y1 = Math.random() * 100;
              const x2 = Math.random() * 100;
              const y2 = Math.random() * 100;
              return (
                <line 
                  key={i}
                  x1={`${x1}%`} 
                  y1={`${y1}%`} 
                  x2={`${x2}%`} 
                  y2={`${y2}%`} 
                  stroke="url(#redGradient)" 
                  strokeWidth="1"
                  opacity={Math.random() * 0.5 + 0.2}
                />
              );
            })}
          </svg>
        </div>
        
        {/* Ajout d'un filtre sur tout le contenu pour renforcer l'ambiance de crise */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-950/10 to-slate-950/10 mix-blend-multiply z-0"></div>

        {/* Bouton de retour */}
        <div className="relative z-10 p-4">
          <Button 
            variant="outline" 
            onClick={handleReturnToPrevious}
            className="bg-gray-900/60 text-gray-300 border-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
        
        {/* Bannière en cours de développement */}
        <div className="mx-auto max-w-6xl mb-4 mt-2 relative z-10">
          <div className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-900/30 border border-amber-500/30 rounded-md">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <p className="font-medium text-amber-400">Module en cours de développement</p>
          </div>
        </div>
        
        {/* Notification d'événement en temps réel */}
        {showNotification && (
          <div className="fixed top-5 right-5 z-50 max-w-md animate-slide-in-right bg-red-900/90 border border-red-700 p-4 rounded-md shadow-lg">
            <div className="flex items-start">
              <BellRing className="h-6 w-6 text-red-400 mr-3 flex-shrink-0 animate-pulse" />
              <div>
                <h3 className="font-bold text-white">Alerte en temps réel</h3>
                <p className="text-red-200 text-sm mt-1">{notificationMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Dialogue de consultation requise */}
        <Dialog open={consultationDialog} onOpenChange={setConsultationDialog}>
          <DialogContent className="bg-gray-900 border-red-900 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-rose-300 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
                Consultation requise
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Vous devez consulter ces parties prenantes avant de prendre cette décision :
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3 my-4">
              {requiredConsultations.required.map(stakeholderId => {
                const stakeholder = scenario?.stakeholders.find(s => s.id === stakeholderId);
                if (!stakeholder) return null;
                
                const isConsulted = requiredConsultations.consulted.includes(stakeholderId);
                
                return (
                  <div key={stakeholderId} className="flex items-center gap-3 p-3 rounded-md bg-gray-800/50 border border-gray-700">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={stakeholder.avatar} />
                      <AvatarFallback className={`bg-${stakeholder.department === 'IT' ? 'blue' : stakeholder.department === 'Executive' ? 'purple' : 'amber'}-800`}>
                        {stakeholder.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-white font-medium">{stakeholder.name}</p>
                      <p className="text-gray-400 text-xs">{stakeholder.role}</p>
                    </div>
                    {isConsulted ? (
                      <Badge className="bg-green-800 text-green-100">
                        <Check className="h-3 w-3 mr-1" />
                        Consulté
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={() => {
                        consultStakeholder(stakeholderId);
                        setConsultationDialog(false);
                      }}>
                        Consulter
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            
            <DialogFooter>
              <Button onClick={() => setConsultationDialog(false)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Contenu principal */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-screen relative z-10">
            <div className="flex flex-col items-center justify-center gap-4 max-w-md text-center">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full bg-red-900/30 animate-ping"></div>
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-red-900/50 border border-red-700 animate-pulse">
                  <AlertTriangle className="h-12 w-12 text-red-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mt-4 text-white">Initialisation de la simulation de crise...</h2>
              <p className="text-gray-400 mt-2">Connexion au SOC, préparation des intervenants et du scénario d'incident</p>
              
              <div className="w-full mt-6">
                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-900 to-rose-600 animate-progress-indeterminate"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 pb-16 relative z-10">
            {scenario && !showSummary ? (
              <>
                {/* En-tête d'information sur la crise */}
                <div className="max-w-6xl mx-auto mb-6">
                  <Card className="bg-gradient-to-r from-gray-900/90 to-rose-950/40 border-red-900/40 shadow-lg overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700"></div>
                    
                    <CardHeader className="pb-2">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                          <CardTitle className="flex items-center text-2xl text-white">
                            <AlertOctagon className="h-6 w-6 mr-2 text-red-500" />
                            {scenario.title}
                            <Badge variant="destructive" className="ml-3 bg-red-800 animate-pulse">
                              {scenario.severity === "critical" ? "CRITIQUE" : 
                               scenario.severity === "high" ? "ÉLEVÉ" : 
                               scenario.severity === "medium" ? "MOYEN" : "FAIBLE"}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="text-gray-300 mt-1">
                            Phase: <span className="text-red-400 font-medium">{
                              scenario.phase === "detection" ? "Détection" :
                              scenario.phase === "analysis" ? "Analyse" :
                              scenario.phase === "containment" ? "Confinement" :
                              scenario.phase === "eradication" ? "Éradication" :
                              scenario.phase === "recovery" ? "Récupération" :
                              "Retour d'expérience"
                            }</span> | Type d'incident: <span className="text-red-400 font-medium">{
                              scenario.incidentType === "ransomware" ? "Ransomware" :
                              scenario.incidentType === "data-breach" ? "Violation de données" :
                              scenario.incidentType === "ddos" ? "DDoS" :
                              scenario.incidentType === "insider-threat" ? "Menace interne" :
                              scenario.incidentType === "supply-chain" ? "Chaîne d'approvisionnement" :
                              "Zero Day"
                            }</span>
                          </CardDescription>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="px-4 py-2 bg-gray-800/70 rounded-md border border-gray-700 flex items-center">
                            <Clock className="h-5 w-5 mr-2 text-red-400" />
                            <div className="text-xl font-mono font-bold text-red-300 animate-pulse">
                              {formatTimeRemaining(scenario.timeRemaining)}
                            </div>
                          </div>
                          
                          <div className="hidden md:flex px-4 py-2 bg-gray-800/70 rounded-md border border-gray-700 items-center">
                            <Shield className="h-5 w-5 mr-2 text-amber-400" />
                            <div className="text-sm text-gray-300">
                              Score: <span className="text-amber-300 font-bold">{calculateOverallScore()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </div>
                
                {/* Interface principale divisée en tabs */}
                <div className="max-w-6xl mx-auto">
                  <Tabs 
                    defaultValue="warroom" 
                    value={activeTab} 
                    onValueChange={(value) => setActiveTab(value as any)}
                    className="w-full"
                  >
                    <div className="border-b border-gray-800 mb-4">
                      <TabsList className="h-14 bg-transparent w-full justify-start border-b border-gray-800 rounded-none">
                        <TabsTrigger 
                          value="warroom"
                          className="flex items-center gap-2 px-5 data-[state=active]:text-red-400 data-[state=active]:border-red-500"
                        >
                          <MessageSquare className="h-5 w-5" />
                          <span>Salle de crise</span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="stakeholders"
                          className="flex items-center gap-2 px-5 data-[state=active]:text-red-400 data-[state=active]:border-red-500"
                        >
                          <Users className="h-5 w-5" />
                          <span>Parties prenantes</span>
                          {focusedStakeholderId && (
                            <Badge className="ml-2 bg-gray-700 text-gray-200">
                              {scenario.stakeholders.find(s => s.id === focusedStakeholderId)?.name.split(' ')[0]}
                            </Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger 
                          value="systems"
                          className="flex items-center gap-2 px-5 data-[state=active]:text-red-400 data-[state=active]:border-red-500"
                        >
                          <Server className="h-5 w-5" />
                          <span>Systèmes impactés</span>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="decisions"
                          className="flex items-center gap-2 px-5 data-[state=active]:text-red-400 data-[state=active]:border-red-500"
                        >
                          <FileText className="h-5 w-5" />
                          <span>Décisions</span>
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    
                    {/* Contenu de l'onglet Salle de crise (War Room) */}
                    <TabsContent value="warroom" className="m-0">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Panneau gauche: Timeline des événements */}
                        <div className="lg:col-span-1">
                          <Card className="bg-gray-900/60 border-gray-800">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                Chronologie des événements
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-2">
                                  {scenario.timeline.map((event, index) => (
                                    <div key={index} className="flex items-start group relative">
                                      <div className={`flex-shrink-0 w-14 py-1 px-2 text-center rounded font-mono text-xs font-medium mr-3 ${
                                        event.severity === "critical" ? "bg-red-900/60 text-red-300" :
                                        event.severity === "high" ? "bg-amber-900/60 text-amber-300" :
                                        event.severity === "medium" ? "bg-blue-900/60 text-blue-300" :
                                        "bg-gray-800/60 text-gray-300"
                                      }`}>
                                        {event.time}
                                      </div>
                                      <div className="flex-1">
                                        <div className={`text-sm pb-3 ${
                                          event.severity === "critical" ? "text-red-200" :
                                          event.severity === "high" ? "text-amber-200" :
                                          event.severity === "medium" ? "text-blue-200" :
                                          "text-gray-300"
                                        }`}>
                                          {event.event}
                                        </div>
                                        <div className="absolute left-[6.5px] top-[28px] bottom-0 w-1 bg-gray-800 group-last:hidden"></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </CardContent>
                          </Card>

                          {/* Indicateurs d'impact */}
                          <Card className="bg-gray-900/60 border-gray-800 mt-4">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
                                <BarChart className="h-4 w-4 mr-2 text-gray-400" />
                                Indicateurs d'impact
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between items-center text-xs mb-1">
                                    <div className="flex items-center">
                                      <ShieldAlert className="h-3 w-3 mr-1 text-rose-400" />
                                      <span className="text-gray-300">Réputation</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span 
                                        className={`text-gray-300 font-mono ${
                                          scenario.impactAreas.reputation > 70 ? "text-red-400 animate-pulse" : ""
                                        }`}
                                      >
                                        {scenario.impactAreas.reputation}%
                                      </span>
                                      {scenario.impactAreas.reputation > 50 && (
                                        <AlertTriangle className="h-3 w-3 ml-1 text-red-400" />
                                      )}
                                    </div>
                                  </div>
                                  <Progress 
                                    value={scenario.impactAreas.reputation} 
                                    className="h-1.5 bg-gray-800" 
                                    indicatorClassName={`${
                                      scenario.impactAreas.reputation > 70 
                                        ? "bg-red-500 animate-pulse" 
                                        : scenario.impactAreas.reputation > 50 
                                        ? "bg-red-600" 
                                        : "bg-rose-500"
                                    }`} 
                                  />
                                </div>
                                <div>
                                  <div className="flex justify-between items-center text-xs mb-1">
                                    <div className="flex items-center">
                                      <Activity className="h-3 w-3 mr-1 text-rose-400" />
                                      <span className="text-gray-300">Opérations</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span 
                                        className={`text-gray-300 font-mono ${
                                          scenario.impactAreas.operations > 70 ? "text-red-400 animate-pulse" : ""
                                        }`}
                                      >
                                        {scenario.impactAreas.operations}%
                                      </span>
                                      {scenario.impactAreas.operations > 50 && (
                                        <AlertTriangle className="h-3 w-3 ml-1 text-red-400" />
                                      )}
                                    </div>
                                  </div>
                                  <Progress 
                                    value={scenario.impactAreas.operations} 
                                    className="h-1.5 bg-gray-800" 
                                    indicatorClassName={`${
                                      scenario.impactAreas.operations > 70 
                                        ? "bg-red-500 animate-pulse" 
                                        : scenario.impactAreas.operations > 50 
                                        ? "bg-red-600" 
                                        : "bg-rose-500"
                                    }`} 
                                  />
                                </div>
                                <div>
                                  <div className="flex justify-between items-center text-xs mb-1">
                                    <div className="flex items-center">
                                      <Banknote className="h-3 w-3 mr-1 text-rose-400" />
                                      <span className="text-gray-300">Financier</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span 
                                        className={`text-gray-300 font-mono ${
                                          scenario.impactAreas.financial > 70 ? "text-red-400 animate-pulse" : ""
                                        }`}
                                      >
                                        {scenario.impactAreas.financial}%
                                      </span>
                                      {scenario.impactAreas.financial > 50 && (
                                        <AlertTriangle className="h-3 w-3 ml-1 text-red-400" />
                                      )}
                                    </div>
                                  </div>
                                  <Progress 
                                    value={scenario.impactAreas.financial} 
                                    className="h-1.5 bg-gray-800" 
                                    indicatorClassName={`${
                                      scenario.impactAreas.financial > 70 
                                        ? "bg-red-500 animate-pulse" 
                                        : scenario.impactAreas.financial > 50 
                                        ? "bg-red-600" 
                                        : "bg-rose-500"
                                    }`} 
                                  />
                                </div>
                                <div>
                                  <div className="flex justify-between items-center text-xs mb-1">
                                    <div className="flex items-center">
                                      <Scale className="h-3 w-3 mr-1 text-rose-400" />
                                      <span className="text-gray-300">Juridique</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span 
                                        className={`text-gray-300 font-mono ${
                                          scenario.impactAreas.legal > 70 ? "text-red-400 animate-pulse" : ""
                                        }`}
                                      >
                                        {scenario.impactAreas.legal}%
                                      </span>
                                      {scenario.impactAreas.legal > 50 && (
                                        <AlertTriangle className="h-3 w-3 ml-1 text-red-400" />
                                      )}
                                    </div>
                                  </div>
                                  <Progress 
                                    value={scenario.impactAreas.legal} 
                                    className="h-1.5 bg-gray-800" 
                                    indicatorClassName={`${
                                      scenario.impactAreas.legal > 70 
                                        ? "bg-red-500 animate-pulse" 
                                        : scenario.impactAreas.legal > 50 
                                        ? "bg-red-600" 
                                        : "bg-rose-500"
                                    }`} 
                                  />
                                </div>
                                <div>
                                  <div className="flex justify-between items-center text-xs mb-1">
                                    <div className="flex items-center">
                                      <Radiation className="h-3 w-3 mr-1 text-rose-400" />
                                      <span className="text-gray-300">Perte de données</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span 
                                        className={`text-gray-300 font-mono ${
                                          scenario.impactAreas.dataLoss > 70 ? "text-red-400 animate-pulse" : ""
                                        }`}
                                      >
                                        {scenario.impactAreas.dataLoss}%
                                      </span>
                                      {scenario.impactAreas.dataLoss > 50 && (
                                        <AlertTriangle className="h-3 w-3 ml-1 text-red-400" />
                                      )}
                                    </div>
                                  </div>
                                  <Progress 
                                    value={scenario.impactAreas.dataLoss} 
                                    className="h-1.5 bg-gray-800" 
                                    indicatorClassName={`${
                                      scenario.impactAreas.dataLoss > 70 
                                        ? "bg-red-500 animate-pulse" 
                                        : scenario.impactAreas.dataLoss > 50 
                                        ? "bg-red-600" 
                                        : "bg-rose-500"
                                    }`} 
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        {/* Panneau droit: Conversation en cours et messages */}
                        <div className="lg:col-span-3">
                          <Card className="bg-gray-900/60 border-gray-800 h-[600px] flex flex-col">
                            <CardHeader className="pb-2 border-b border-gray-800 flex-shrink-0">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-gray-200 flex items-center text-base">
                                  {activeTab === 'warroom' ? (
                                    <>
                                      <MessageSquare className="h-5 w-5 mr-2 text-red-400" />
                                      Salle de crise - Communication d'équipe
                                    </>
                                  ) : activeTab === 'stakeholders' && focusedStakeholderId ? (
                                    <>
                                      <div className="flex items-center">
                                        <Avatar className="h-8 w-8 mr-2">
                                          <AvatarImage src={getFocusedStakeholder()?.avatar} />
                                          <AvatarFallback className={`bg-${getFocusedStakeholder()?.department === 'IT' ? 'blue' : getFocusedStakeholder()?.department === 'Executive' ? 'purple' : 'amber'}-800`}>
                                            {getFocusedStakeholder()?.name.split(' ').map(n => n[0]).join('')}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <div className="font-medium">{getFocusedStakeholder()?.name}</div>
                                          <div className="text-xs text-gray-400">{getFocusedStakeholder()?.role}</div>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <UserCircle2 className="h-5 w-5 mr-2 text-gray-400" />
                                      Sélectionnez une partie prenante
                                    </>
                                  )}
                                </CardTitle>
                                
                                {activeTab === 'stakeholders' && focusedStakeholderId && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setFocusedStakeholderId(null)}
                                    className="text-gray-400 hover:text-white"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            
                            <CardContent className="flex-1 overflow-y-auto py-4 px-4">
                              <div className="space-y-4">
                                {getCurrentConversationMessages().map((message) => {
                                  const sender = message.senderId === "player" 
                                    ? { name: "Vous (RSSI)", isPlayer: true } 
                                    : {
                                        name: scenario.stakeholders.find(s => s.id === message.senderId)?.name || "Inconnu",
                                        department: scenario.stakeholders.find(s => s.id === message.senderId)?.department || "External",
                                        avatar: scenario.stakeholders.find(s => s.id === message.senderId)?.avatar,
                                        isPlayer: false
                                      };
                                  
                                  return (
                                    <div key={message.id} className={`flex ${sender.isPlayer ? 'justify-end' : 'justify-start'}`}>
                                      <div className={`flex gap-3 max-w-[80%] ${sender.isPlayer ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {!sender.isPlayer && (
                                          <Avatar className="h-8 w-8 flex-shrink-0">
                                            <AvatarImage src={sender.avatar} />
                                            <AvatarFallback className={`bg-${sender.department === 'IT' ? 'blue' : sender.department === 'Executive' ? 'purple' : sender.department === 'Communication' ? 'green' : sender.department === 'Legal' ? 'amber' : 'slate'}-800`}>
                                              {sender.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                          </Avatar>
                                        )}
                                        
                                        <div className={`flex flex-col ${sender.isPlayer ? 'items-end' : 'items-start'}`}>
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs ${sender.isPlayer ? 'text-blue-400' : 'text-gray-400'}`}>
                                              {sender.name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                            {message.reactionType && (
                                              <Badge className={`${
                                                message.reactionType === 'negative' ? 'bg-red-900/50 text-red-300' :
                                                message.reactionType === 'positive' ? 'bg-green-900/50 text-green-300' :
                                                'bg-gray-800 text-gray-300'
                                              } text-[10px] px-1`}>
                                                {message.reactionType === 'negative' ? '👎' :
                                                 message.reactionType === 'positive' ? '👍' : '😐'}
                                              </Badge>
                                            )}
                                          </div>
                                          
                                          <div className={`px-4 py-2 rounded-lg ${
                                            sender.isPlayer 
                                              ? 'bg-blue-900/40 text-blue-50 border border-blue-800/50' 
                                              : 'bg-gray-800 text-gray-100 border border-gray-700'
                                          }`}>
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                                
                                {/* Indicateur de "X est en train d'écrire..." */}
                                {isTyping && (
                                  <div className="flex justify-start">
                                    <div className="flex gap-3 max-w-[80%]">
                                      {focusedStakeholderId && (
                                        <Avatar className="h-8 w-8">
                                          <AvatarImage src={getFocusedStakeholder()?.avatar} />
                                          <AvatarFallback className={`bg-${getFocusedStakeholder()?.department === 'IT' ? 'blue' : getFocusedStakeholder()?.department === 'Executive' ? 'purple' : 'amber'}-800`}>
                                            {getFocusedStakeholder()?.name.split(' ').map(n => n[0]).join('')}
                                          </AvatarFallback>
                                        </Avatar>
                                      )}
                                      
                                      <div className="px-4 py-3 rounded-lg bg-gray-800/80 border border-gray-700">
                                        <div className="flex space-x-1">
                                          <div className="w-2 h-2 rounded-full bg-gray-500 animate-typing"></div>
                                          <div className="w-2 h-2 rounded-full bg-gray-500 animate-typing" style={{animationDelay: '0.2s'}}></div>
                                          <div className="w-2 h-2 rounded-full bg-gray-500 animate-typing" style={{animationDelay: '0.4s'}}></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                <div ref={messagesEndRef} /> {/* Pour le scroll automatique */}
                              </div>
                            </CardContent>
                            
                            {/* Zone de saisie de message */}
                            <div className="p-4 border-t border-gray-800 mt-auto flex-shrink-0">
                              <form 
                                className="flex gap-2" 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleSendMessage();
                                }}
                              >
                                <Textarea 
                                  value={messageInput}
                                  onChange={(e) => setMessageInput(e.target.value)}
                                  placeholder={`Écrivez un message ${activeTab === 'stakeholders' && focusedStakeholderId ? `à ${getFocusedStakeholder()?.name.split(' ')[0]}` : 'à l\'équipe de crise'}...`}
                                  className="min-h-[42px] max-h-32 bg-gray-800 border-gray-700 focus-visible:ring-red-400"
                                  disabled={activeTab === 'stakeholders' && !focusedStakeholderId}
                                />
                                <Button 
                                  type="submit" 
                                  size="icon"
                                  disabled={(activeTab === 'stakeholders' && !focusedStakeholderId) || isSending || !messageInput.trim()}
                                  className="h-[42px] w-[42px] bg-red-800 hover:bg-red-700 focus:ring-red-500"
                                >
                                  <Send className="h-5 w-5" />
                                </Button>
                              </form>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* Contenu de l'onglet Parties prenantes */}
                    <TabsContent value="stakeholders" className="m-0">
                      {!focusedStakeholderId ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {scenario.stakeholders
                            .filter(stakeholder => stakeholder.isAvailable)
                            .map(stakeholder => (
                              <Card 
                                key={stakeholder.id}
                                className={`bg-gray-900/60 border-gray-800 hover:border-gray-700 transition-all cursor-pointer relative overflow-hidden ${
                                  requiredConsultations.required.includes(stakeholder.id) && !requiredConsultations.consulted.includes(stakeholder.id)
                                  ? 'ring-2 ring-red-500/50'
                                  : ''
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setFocusedStakeholderId(stakeholder.id);
                                }}
                              >
                                {/* Indicateur de consultation requise */}
                                {requiredConsultations.required.includes(stakeholder.id) && !requiredConsultations.consulted.includes(stakeholder.id) && (
                                  <div className="absolute top-2 right-2 z-10">
                                    <Badge className="bg-red-800 text-red-100 animate-pulse">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Consultation requise
                                    </Badge>
                                  </div>
                                )}
                                
                                {/* Indicateur de type de département */}
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                                  stakeholder.department === 'IT' ? 'bg-blue-600' :
                                  stakeholder.department === 'Executive' ? 'bg-purple-700' :
                                  stakeholder.department === 'Communication' ? 'bg-green-600' :
                                  stakeholder.department === 'Legal' ? 'bg-amber-700' :
                                  stakeholder.department === 'Operations' ? 'bg-orange-600' :
                                  'bg-slate-700'
                                }`}></div>
                                
                                <CardContent className="flex items-start gap-4 p-6">
                                  <Avatar className="h-16 w-16 rounded-md">
                                    <AvatarImage src={stakeholder.avatar} />
                                    <AvatarFallback className={`bg-${
                                      stakeholder.department === 'IT' ? 'blue' :
                                      stakeholder.department === 'Executive' ? 'purple' :
                                      stakeholder.department === 'Communication' ? 'green' :
                                      stakeholder.department === 'Legal' ? 'amber' :
                                      stakeholder.department === 'Operations' ? 'orange' :
                                      'slate'
                                    }-800 rounded-md text-lg`}>
                                      {stakeholder.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  
                                  <div className="flex-1">
                                    <h3 className="font-medium text-white">{stakeholder.name}</h3>
                                    <p className="text-gray-400 text-sm">{stakeholder.role}</p>
                                    
                                    <div className="mt-3 flex items-center gap-1">
                                      <Badge className={`${
                                        stakeholder.department === 'IT' ? 'bg-blue-900/50 text-blue-300 border-blue-800/50' :
                                        stakeholder.department === 'Executive' ? 'bg-purple-900/50 text-purple-300 border-purple-800/50' :
                                        stakeholder.department === 'Communication' ? 'bg-green-900/50 text-green-300 border-green-800/50' :
                                        stakeholder.department === 'Legal' ? 'bg-amber-900/50 text-amber-300 border-amber-800/50' :
                                        stakeholder.department === 'Operations' ? 'bg-orange-900/50 text-orange-300 border-orange-800/50' :
                                        'bg-slate-900/50 text-slate-300 border-slate-800/50'
                                      }`}>
                                        {stakeholder.department}
                                      </Badge>
                                      
                                      <Badge className="bg-gray-800 text-gray-300 border-gray-700 ml-1">
                                        {stakeholder.personality === 'technical' ? 'Technique' :
                                        stakeholder.personality === 'anxious' ? 'Anxieux' :
                                        stakeholder.personality === 'authoritative' ? 'Autoritaire' :
                                        stakeholder.personality === 'diplomatic' ? 'Diplomatique' :
                                        'Calme'}
                                      </Badge>
                                    </div>
                                    
                                    <div className="mt-4 space-y-2">
                                      <div>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span className="text-gray-400">Stress</span>
                                          <span className={`${stakeholder.stress > 80 ? 'text-red-400' : 'text-gray-400'}`}>
                                            {stakeholder.stress}%
                                          </span>
                                        </div>
                                        <Progress 
                                          value={stakeholder.stress} 
                                          className="h-1 bg-gray-800" 
                                          indicatorClassName={`${
                                            stakeholder.stress > 80 ? 'bg-red-500' :
                                            stakeholder.stress > 60 ? 'bg-amber-500' :
                                            'bg-blue-500'
                                          }`}
                                        />
                                      </div>
                                      
                                      <div>
                                        <div className="flex justify-between text-xs mb-1">
                                          <span className="text-gray-400">Confiance</span>
                                          <span className={`${stakeholder.trust < 50 ? 'text-red-400' : 'text-gray-400'}`}>
                                            {stakeholder.trust}%
                                          </span>
                                        </div>
                                        <Progress 
                                          value={stakeholder.trust} 
                                          className="h-1 bg-gray-800" 
                                          indicatorClassName={`${
                                            stakeholder.trust < 50 ? 'bg-red-500' :
                                            stakeholder.trust < 70 ? 'bg-amber-500' :
                                            'bg-green-500'
                                          }`}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      ) : (
                        // Si une partie prenante est sélectionnée, nous sommes déjà dans l'interface de conversation
                        // qui est gérée par l'onglet actif (activeTab)
                        <div></div>
                      )}
                    </TabsContent>
                    
                    {/* Contenu de l'onglet Systèmes impactés */}
                    <TabsContent value="systems" className="m-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scenario.affectedSystems.map(system => (
                          <Card 
                            key={system.id}
                            className={`bg-gray-900/60 border-gray-800 overflow-hidden relative ${
                              system.status === 'compromised' ? 'border-l-4 border-l-red-700' :
                              system.status === 'at-risk' ? 'border-l-4 border-l-amber-700' :
                              system.status === 'isolated' ? 'border-l-4 border-l-blue-700' :
                              system.status === 'secure' ? 'border-l-4 border-l-green-700' :
                              'border-l-4 border-l-gray-700'
                            }`}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg text-white flex items-center gap-2">
                                    {system.type === 'database' ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                                      </svg>
                                    ) : system.type === 'web-server' ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                                        <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                                        <line x1="6" y1="6" x2="6.01" y2="6"></line>
                                        <line x1="6" y1="18" x2="6.01" y2="18"></line>
                                      </svg>
                                    ) : system.type === 'network' ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="6" y1="3" x2="6" y2="15"></line>
                                        <circle cx="18" cy="6" r="3"></circle>
                                        <circle cx="6" cy="18" r="3"></circle>
                                        <path d="M18 9a9 9 0 0 1-9 9"></path>
                                      </svg>
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                                        <path d="M12 9v6"></path>
                                        <path d="M9 12h6"></path>
                                      </svg>
                                    )}
                                    {system.name}
                                  </CardTitle>
                                  <CardDescription className="text-gray-400 mt-1">
                                    Type: {system.type === 'database' ? 'Base de données' :
                                          system.type === 'web-server' ? 'Serveur web' :
                                          system.type === 'network' ? 'Réseau' :
                                          system.type === 'endpoint' ? 'Poste de travail' :
                                          system.type === 'cloud-service' ? 'Service cloud' :
                                          'Application'}
                                  </CardDescription>
                                </div>
                                
                                <Badge className={`${
                                  system.status === 'compromised' ? 'bg-red-900/50 text-red-300 border-red-800/50' :
                                  system.status === 'at-risk' ? 'bg-amber-900/50 text-amber-300 border-amber-800/50' :
                                  system.status === 'isolated' ? 'bg-blue-900/50 text-blue-300 border-blue-800/50' :
                                  system.status === 'secure' ? 'bg-green-900/50 text-green-300 border-green-800/50' :
                                  'bg-gray-900/50 text-gray-300 border-gray-800/50'
                                }`}>
                                  {system.status === 'compromised' ? 'Compromis' :
                                   system.status === 'at-risk' ? 'À risque' :
                                   system.status === 'isolated' ? 'Isolé' :
                                   system.status === 'secure' ? 'Sécurisé' :
                                   'Statut inconnu'}
                                </Badge>
                              </div>
                            </CardHeader>
                            
                            <CardContent>
                              <div className="text-sm text-gray-300 mb-4 border-l-2 border-gray-700 pl-3 py-1">
                                {system.impactDetails}
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between items-center text-xs mb-1">
                                    <span className="text-gray-400">Criticité</span>
                                    <span className={`${system.criticalityLevel >= 8 ? 'text-red-400' : 'text-gray-400'}`}>
                                      Niveau {system.criticalityLevel}/10
                                    </span>
                                  </div>
                                  <Progress 
                                    value={system.criticalityLevel * 10} 
                                    className="h-1 bg-gray-800" 
                                    indicatorClassName={`${
                                      system.criticalityLevel >= 8 ? 'bg-red-500' :
                                      system.criticalityLevel >= 5 ? 'bg-amber-500' :
                                      'bg-blue-500'
                                    }`}
                                  />
                                </div>
                                
                                <div>
                                  <div className="flex justify-between items-center text-xs mb-1">
                                    <span className="text-gray-400">Récupération</span>
                                    <span className="text-gray-400">
                                      {system.recoveryProgress}%
                                    </span>
                                  </div>
                                  <Progress 
                                    value={system.recoveryProgress} 
                                    className="h-1 bg-gray-800" 
                                    indicatorClassName="bg-green-500"
                                  />
                                </div>
                                
                                <div className="flex items-center justify-between text-xs pt-2">
                                  <span className="text-gray-400">Confinement</span>
                                  <Badge className={system.containmentStatus ? 'bg-green-900/50 text-green-300' : 'bg-gray-800 text-gray-300'}>
                                    {system.containmentStatus ? 'Confiné' : 'Non confiné'}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                    
                    {/* Contenu de l'onglet Décisions */}
                    <TabsContent value="decisions" className="m-0">
                      <div className="max-w-4xl mx-auto">
                        {/* Décision actuelle */}
                        <Card className="bg-gradient-to-br from-gray-900/90 to-rose-950/30 border-red-900/40 mb-6 overflow-hidden shadow-lg relative">
                          {/* Arrière-plan animé pour effet urgence */}
                          <div className="absolute inset-0 overflow-hidden z-0">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700 animate-pulse"></div>
                            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-red-700 via-red-500 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-red-700"></div>
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-700 via-red-500 to-transparent"></div>
                          </div>
                          
                          <CardHeader className="relative z-10">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-xl text-red-100 flex items-center">
                                <AlertTriangle className="h-5 w-5 mr-2 text-red-500 animate-pulse" />
                                <span className="mr-2">Décision critique</span>
                                <Badge className="bg-red-900 text-red-100">
                                  {scenario.currentDecisionIndex + 1}/{scenario.decisions.length}
                                </Badge>
                              </CardTitle>
                              
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-red-400" />
                                <span className="text-sm font-mono text-red-300 animate-pulse">
                                  {formatTimeRemaining(scenario.timeRemaining)}
                                </span>
                              </div>
                            </div>
                            
                            <CardDescription className="text-red-100 text-lg font-medium mt-4 border-l-4 border-red-700 pl-3 py-1">
                              {scenario.decisions[scenario.currentDecisionIndex].question}
                            </CardDescription>
                            
                            {scenario.decisions[scenario.currentDecisionIndex].context && (
                              <div className="mt-3 text-gray-300 text-sm">
                                {scenario.decisions[scenario.currentDecisionIndex].context}
                              </div>
                            )}
                          </CardHeader>
                          
                          <CardContent className="relative z-10">
                            {/* Avertissement pré-décision */}
                            {requiredConsultations.required.length > 0 && (
                              <div className="mb-4 p-3 bg-amber-950/30 rounded border border-amber-900/40 flex items-start">
                                <Info className="h-4 w-4 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm text-amber-300 m-0 font-medium">
                                    Consultation requise
                                  </p>
                                  <p className="text-xs text-amber-200/80 mt-1">
                                    Vous devez consulter {requiredConsultations.required.map(id => 
                                      scenario.stakeholders.find(s => s.id === id)?.name
                                    ).join(' et ')} avant de prendre cette décision.
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {requiredConsultations.required.map(stakeholderId => {
                                      const stakeholder = scenario.stakeholders.find(s => s.id === stakeholderId);
                                      const isConsulted = requiredConsultations.consulted.includes(stakeholderId);
                                      
                                      return (
                                        <Badge 
                                          key={stakeholderId}
                                          className={isConsulted ? 
                                            "bg-green-900/50 text-green-300 border border-green-800/50" :
                                            "bg-amber-900/50 text-amber-300 border border-amber-800/50"}
                                        >
                                          {isConsulted ? <Check className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                                          {stakeholder?.name}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="space-y-3">
                              {scenario.decisions[scenario.currentDecisionIndex].options.map((option, index) => (
                                <div 
                                  key={option.id}
                                  className="relative overflow-hidden rounded-md group transition-all duration-300"
                                >
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start py-6 px-4 border-gray-800 bg-gradient-to-r from-gray-900/80 to-gray-950/90 
                                              hover:bg-gradient-to-r hover:from-red-950/40 hover:to-gray-900/60 hover:border-red-900/70 text-left
                                              group-hover:shadow-md group-hover:shadow-red-900/10 transition-all duration-300"
                                    onClick={() => makeDecision(option.id)}
                                  >
                                    <div className="flex flex-col w-full">
                                      <div className="flex items-center mb-2">
                                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-800 mr-3 
                                                      border border-gray-700 group-hover:bg-red-900 transition-colors duration-300">
                                          <span className="text-gray-200 font-bold text-sm">{index + 1}</span>
                                        </div>
                                        <div className="font-medium text-gray-100 group-hover:text-red-100 transition-colors duration-300">
                                          {option.text}
                                        </div>
                                      </div>
                                      
                                      {/* Réactions des parties prenantes */}
                                      {option.stakeholderReactions && (
                                        <div className="ml-10 mt-2 flex flex-wrap gap-2">
                                          {option.stakeholderReactions.map(reaction => {
                                            const stakeholder = scenario.stakeholders.find(s => s.id === reaction.stakeholderId);
                                            return (
                                              <div key={reaction.stakeholderId} className="inline-flex items-center text-xs">
                                                <Avatar className="h-5 w-5 mr-1">
                                                  <AvatarImage src={stakeholder?.avatar} />
                                                  <AvatarFallback className={`bg-${stakeholder?.department === 'IT' ? 'blue' : stakeholder?.department === 'Executive' ? 'purple' : 'amber'}-800 text-[8px]`}>
                                                    {stakeholder?.name.split(' ').map(n => n[0]).join('')}
                                                  </AvatarFallback>
                                                </Avatar>
                                                <Badge className={`
                                                  ${reaction.reaction === 'strongly-approve' ? 'bg-green-900/50 text-green-300' :
                                                   reaction.reaction === 'approve' ? 'bg-green-900/30 text-green-300' :
                                                   reaction.reaction === 'neutral' ? 'bg-gray-800 text-gray-300' :
                                                   reaction.reaction === 'disapprove' ? 'bg-red-900/30 text-red-300' :
                                                   'bg-red-900/50 text-red-300'}
                                                  `}
                                                >
                                                  {reaction.reaction === 'strongly-approve' ? '👍 Fortement favorable' :
                                                   reaction.reaction === 'approve' ? '✓ Favorable' :
                                                   reaction.reaction === 'neutral' ? '⚖️ Neutre' :
                                                   reaction.reaction === 'disapprove' ? '✗ Défavorable' :
                                                   '👎 Fortement défavorable'}
                                                </Badge>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                    <ChevronRight className="h-5 w-5 ml-auto text-gray-400 group-hover:text-red-300 transition-colors duration-300" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            
                            {/* Rappel du temps restant */}
                            <div className="mt-6 flex items-center justify-center">
                              <div className="px-3 py-1 bg-gradient-to-r from-red-950/40 to-rose-950/40 rounded-full border border-red-900/30 
                                          animate-pulse flex items-center">
                                <Clock className="h-3 w-3 mr-1 text-red-400" />
                                <span className="text-xs font-mono text-red-300">
                                  Délai critique: {formatTimeRemaining(scenario.timeRemaining)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        
                        {/* Décisions précédentes */}
                        {scenario.currentDecisionIndex > 0 && (
                          <Card className="bg-gray-900/60 border-gray-800 mb-6">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-gray-400" />
                                Décisions précédentes
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {scenario.decisions.slice(0, scenario.currentDecisionIndex).map((decision, index) => {
                                  if (!decision.selectedOption) return null;
                                  
                                  const selectedOption = decision.options.find(o => o.id === decision.selectedOption);
                                  if (!selectedOption) return null;
                                  
                                  return (
                                    <div key={index} className="bg-gray-800/40 p-4 rounded-md border border-gray-700">
                                      <div className="font-medium text-gray-200 mb-2">
                                        Décision {index + 1}: {decision.question}
                                      </div>
                                      <div className="flex items-start">
                                        <div className="bg-gray-700/50 p-1 rounded-full mr-2 mt-0.5">
                                          <Shield className="h-3 w-3 text-gray-300" />
                                        </div>
                                        <div className="text-sm text-gray-300">
                                          <strong>Votre choix:</strong> {selectedOption.text}
                                        </div>
                                      </div>
                                      <div className="mt-2 text-sm text-gray-400 border-l-2 border-gray-700 pl-3 py-1">
                                        <strong>Conséquence:</strong> {selectedOption.consequences.description}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            ) : showSummary && scenario ? (
              // Résumé de la simulation
              <div className="max-w-4xl mx-auto">
                <Card className="bg-gradient-to-br from-gray-900/90 to-gray-950/90 border-gray-800 mb-6 overflow-hidden">
                  <CardHeader>
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full bg-gray-800/80 border-4 border-red-800/50 flex items-center justify-center mb-4">
                        <Shield className="h-12 w-12 text-red-500" />
                      </div>
                      <CardTitle className="text-2xl text-center text-white">
                        Simulation de crise terminée
                      </CardTitle>
                      <CardDescription className="text-center text-gray-300 text-lg mt-2">
                        Score final: <span className="text-amber-400 font-bold">{calculateOverallScore()}/100</span>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex justify-center space-x-6 mb-8">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-400">{scenario.impactAreas.reputation}%</div>
                        <div className="text-xs text-gray-400">Réputation</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-400">{scenario.impactAreas.operations}%</div>
                        <div className="text-xs text-gray-400">Opérations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-400">{scenario.impactAreas.financial}%</div>
                        <div className="text-xs text-gray-400">Financier</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-400">{scenario.impactAreas.legal}%</div>
                        <div className="text-xs text-gray-400">Juridique</div>
                      </div>
                    </div>
                    
                    <Separator className="mb-6 bg-gray-800" />
                    
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-white">Résumé de vos décisions</h3>
                      {scenario.decisions.map((decision, index) => {
                        if (!decision.selectedOption) return null;
                        
                        const selectedOption = decision.options.find(o => o.id === decision.selectedOption);
                        if (!selectedOption) return null;
                        
                        return (
                          <div key={index} className="bg-gray-800/40 p-4 rounded-md border border-gray-700">
                            <div className="font-medium text-white mb-2">
                              Décision {index + 1}: {decision.question}
                            </div>
                            <div className="flex items-start">
                              <div className="bg-gray-700 p-1 rounded-full mr-2 mt-0.5">
                                <Shield className="h-3 w-3 text-gray-300" />
                              </div>
                              <div className="text-sm text-gray-300">
                                <strong>Votre choix:</strong> {selectedOption.text}
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-400 border-l-2 border-gray-700 pl-3 py-1">
                              <strong>Conséquence:</strong> {selectedOption.consequences.description}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-8 p-4 bg-gray-800/50 rounded-md border border-gray-700">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-300">
                          <strong className="text-amber-300">Analyse:</strong> Votre gestion de crise montre {calculateOverallScore() >= 80 ? "une excellente maîtrise" : calculateOverallScore() >= 60 ? "une bonne compréhension" : "des opportunités d'amélioration"}. Les meilleures pratiques en cas de ransomware incluent l'isolement rapide des systèmes infectés, une communication transparente mais mesurée avec les parties prenantes, et la mise en place d'un plan de récupération progressif plutôt que de céder aux demandes des attaquants.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-center space-x-4">
                    <Button 
                      variant="outline" 
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                      onClick={restartScenario}
                    >
                      Recommencer la simulation
                    </Button>
                    <Button 
                      className="bg-red-800 hover:bg-red-700 text-white"
                      onClick={handleReturnToPrevious}
                    >
                      Retour au menu principal
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh]">
                <AlertTriangle className="h-16 w-16 text-red-500 animate-pulse" />
                <h2 className="text-2xl font-bold mt-4 text-white">Erreur de chargement du scénario</h2>
                <Button 
                  onClick={restartScenario} 
                  className="mt-4 bg-red-800 hover:bg-red-700"
                >
                  Réessayer
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes typing {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes progress-indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes slide-in-right {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        .animate-typing {
          animation: typing 1s infinite;
        }
        
        .animate-progress-indeterminate {
          animation: progress-indeterminate 1.5s infinite ease-in-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s forwards;
        }
        
        .bg-grid-pattern {
          background-image: linear-gradient(to right, #111 1px, transparent 1px), 
                            linear-gradient(to bottom, #111 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </HomeLayout>
  );
}