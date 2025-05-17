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

// Membres de l'équipe de crise avec différents rôles et personnalités
const crisisTeamMembers = [
  {
    id: 'soc-lead',
    name: 'Thomas Girard',
    role: 'Responsable SOC',
    expertise: 'Analyse technique des incidents',
    avatar: 'TG',
    color: '#4C9AFF', // Bleu technique
    firstMessage: "Monsieur/Madame le/la RSSI, nous sommes face à une situation critique. J'ai déjà mobilisé l'équipe d'incident response et nous analysons l'étendue de la compromission. Nos premiers résultats sont inquiétants. Quelle est votre directive prioritaire?",
    delay: 5000
  },
  {
    id: 'cio',
    name: 'Laurent Dubois',
    role: 'DSI',
    expertise: 'Infrastructure et opérations IT',
    avatar: 'LD',
    color: '#36B37E', // Vert systèmes
    firstMessage: "Je suis avec les équipes IT. Attention, notre priorité est la continuité de service! Si on isole complètement les systèmes, on perd 200K€ par heure d'interruption. Le PDG m'a déjà appelé deux fois. Quelles mesures d'urgence MINIMALES peut-on mettre en place?",
    delay: 8000
  },
  {
    id: 'legal',
    name: 'Sophie Renard',
    role: 'Directrice Juridique',
    expertise: 'Conformité et obligations légales',
    avatar: 'SR',
    color: '#FF5630', // Rouge légal
    firstMessage: "Nous devons IMMÉDIATEMENT évaluer nos obligations réglementaires. Si des données personnelles sont compromises, nous avons 72h pour notifier la CNIL. Et le non-respect des délais peut entraîner une amende de 4% du CA mondial. Avons-nous une preuve de compromission de données clients?",
    delay: 12000
  },
  {
    id: 'comms',
    name: 'Alexandre Martin',
    role: 'Directeur Communication',
    expertise: 'Communication de crise',
    avatar: 'AM',
    color: '#6554C0', // Violet communication
    firstMessage: "Les journalistes commencent déjà à appeler nos attachés de presse! Comment gérer la communication? Devons-nous préparer un communiqué préventif ou attendre? Notre réputation est en jeu, et le cours de l'action pourrait chuter si la nouvelle se répand mal.",
    delay: 20000
  },
  {
    id: 'security-analyst',
    name: 'Emma Chen',
    role: 'Analyste Sécurité Senior',
    expertise: 'Analyse forensic et threat hunting',
    avatar: 'EC',
    color: '#00B8D9', // Cyan analyste
    firstMessage: "J'ai trouvé des IOCs qui correspondent à une campagne d'APT active. Les logs montrent des connexions suspectes depuis 3 semaines. C'est plus grave que ce que Thomas pense. On a besoin de plus de ressources pour l'investigation, et VITE.",
    delay: 25000
  },
  {
    id: 'cfo',
    name: 'Mathieu Leroy',
    role: 'Directeur Financier',
    expertise: 'Contrôle financier et budget',
    avatar: 'ML',
    color: '#FFAB00', // Orange finance
    firstMessage: "Je dois comprendre l'impact financier potentiel. Quels sont les risques financiers directs? Et combien va nous coûter votre plan d'action? Le conseil d'administration exige un budget précis avant d'approuver des dépenses exceptionnelles.",
    delay: 40000
  },
  {
    id: 'ceo',
    name: 'Philippe Legrand',
    role: 'PDG',
    expertise: 'Direction exécutive',
    avatar: 'PL',
    color: '#172B4D', // Bleu foncé exécutif
    firstMessage: "Je viens d'être informé de la situation en pleine réunion avec nos investisseurs. J'ai BESOIN dans l'heure d'un rapport clair: Quel est le risque RÉEL? Quel impact sur notre activité? Quelles sont VOS recommandations? Et surtout, comment VOUS comptez gérer cette crise?",
    delay: 50000
  }
];

// Options de décision pour la première phase avec des impacts sur divers aspects
const initialDecisions = [
  {
    id: 'isolate-network',
    text: 'Isoler complètement les systèmes critiques du réseau',
    impact: {
      security: 'Bloque la propagation immédiatement',
      operations: 'Arrêt complet des services client (perte de 200K€/heure)',
      legal: 'Position défendable en cas de procédure',
      financial: 'Impact financier immédiat très élevé'
    },
    supporters: ['soc-lead', 'security-analyst', 'legal'],
    opposants: ['cio', 'cfo', 'ceo'],
    consequence: "Le DSI est furieux et escalade au PDG, qui remet en question votre jugement."
  },
  {
    id: 'partial-isolation',
    text: 'Isoler sélectivement uniquement les systèmes déjà compromis',
    impact: {
      security: 'Risque de propagation non détectée',
      operations: 'Perturbation modérée (20-30% des services affectés)',
      legal: 'Position défendable si bien documentée',
      financial: 'Impact financier modéré (50K€/heure)'
    },
    supporters: ['cio', 'comms'],
    opposants: ['security-analyst', 'legal'],
    consequence: "L'analyste sécurité conteste votre décision."
  },
  {
    id: 'monitor-analyze',
    text: 'Ne rien isoler: surveiller et analyser en profondeur d\'abord',
    impact: {
      security: 'Risque élevé de propagation et persistance',
      operations: 'Continuité totale des opérations',
      legal: 'Position difficile à défendre en cas de fuite',
      financial: 'Aucun impact immédiat, risque futur élevé'
    },
    supporters: ['cfo', 'cio'],
    opposants: ['soc-lead', 'security-analyst', 'legal'],
    consequence: "Votre équipe de sécurité est démotivée."
  },
  {
    id: 'activate-crisis',
    text: 'Activer formellement la cellule de crise et mobiliser toutes les équipes',
    impact: {
      security: 'Mobilisation complète des experts',
      operations: 'Perturbation organisationnelle majeure',
      legal: 'Procédures formelles documentées',
      financial: 'Coût immédiat (50-100K€)'
    },
    supporters: ['legal', 'comms', 'ceo'],
    opposants: ['cfo'],
    consequence: "Le Directeur Financier s'inquiète du coût."
  },
  {
    id: 'external-help',
    text: 'Faire appel immédiatement à un cabinet spécialisé en réponse à incident',
    impact: {
      security: 'Expertise pointue rapidement disponible',
      operations: 'Impact limité sur les opérations',
      legal: 'Décharge partielle de responsabilité',
      financial: 'Coût élevé immédiat (100-150K€)'
    },
    supporters: ['security-analyst', 'legal'],
    opposants: ['cfo', 'cio'],
    consequence: "Le Directeur Financier bloque temporairement le budget."
  }
];

// Effets sonores pour l'immersion - chemins commentés car fichiers non disponibles
// Si besoin d'ajouter des sons, créer d'abord les fichiers correspondants
const alarmSound = ''; // '/sounds/alarm.mp3'
const notificationSound = ''; // '/sounds/notification.mp3'
const messageSound = ''; // '/sounds/message.mp3';

export default function ImmersiveCrisis() {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const alarmRef = useRef<HTMLAudioElement>(null);
  const notificationRef = useRef<HTMLAudioElement>(null);
  const messagesRef = useRef<HTMLAudioElement>(null);
  
  // États
  const [phase, setPhase] = useState<'intro' | 'tutorial' | 'alert' | 'crisis' | 'debrief'>('intro');
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
  const [tutorialStep, setTutorialStep] = useState<number>(1);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [lastInterventionTime, setLastInterventionTime] = useState<number | null>(null);
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
  
  // Planifier uniquement le premier message - les autres apparaîtront au besoin
  const scheduleTeamMessages = () => {
    // Effacer les timers existants
    scenarioTimersRef.current.forEach(timer => clearTimeout(timer));
    scenarioTimersRef.current = [];
    
    // Ajouter le message d'intro du système pour guider l'utilisateur
    const introMessage = {
      id: generateId(),
      sender: {
        name: "Système",
        role: "Centre de crise",
        avatar: "SYS"
      },
      content: "Bienvenue au centre de crise. Vous êtes en communication avec le premier intervenant qui va vous présenter la situation. Les autres membres de l'équipe n'interviendront que lorsque cela deviendra nécessaire.",
      timestamp: new Date(),
      isUser: false
    };
    
    addMessage(introMessage);
    
    // Trouver le premier membre à présenter (généralement le responsable SOC)
    const firstResponder = crisisTeamMembers.find(m => m.id === 'soc-lead') || crisisTeamMembers[0];
    
    // Programmer uniquement le premier message avec une notification
    const timer = setTimeout(() => {
      // Montrer une notification système indiquant que le premier membre rejoint la conversation
      const notification: Notification = {
        id: generateId(),
        type: 'system' as NotificationType,
        source: 'Centre de crise',
        title: 'Premier contact',
        content: `${firstResponder.name} (${firstResponder.role}) établit le contact`,
        timestamp: new Date()
      };
      
      setNotifications(prev => [...prev, notification]);
      
      // Jouer un son de notification si activé
      if (isSoundEnabled && notificationRef.current) {
        notificationRef.current.play();
      }
      
      // Ajouter le message du premier intervenant après une courte pause
      setTimeout(() => {
        addMessage({
          id: generateId(),
          sender: {
            name: firstResponder.name,
            role: firstResponder.role,
            avatar: firstResponder.avatar
          },
          content: firstResponder.firstMessage,
          timestamp: new Date(),
          isUser: false
        });
        
        // Faire défiler vers le nouveau message
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        
        // Après ce premier message, ajouter une entrée dans les logs
        addConsoleOutput([
          `# Communication établie avec ${firstResponder.name}`,
          `> Les autres membres n'interviendront que si nécessaire`
        ]);
      }, 1500);
    }, 4000);
    
    scenarioTimersRef.current.push(timer);
  };
  
  // Ajouter un message à la conversation
  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    
    // Jouer le son de notification (si disponible)
    if (isSoundEnabled && messagesRef.current && !message.isUser && messagesRef.current.src) {
      messagesRef.current.play().catch(err => {
        console.log('Notification sonore non disponible');
      });
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
  
  // Envoyer un message avec intervention dynamique et contextuelle des PNJ
  const sendMessage = async () => {
    if (!userMessage.trim()) {
      toast({
        title: "Message incomplet",
        description: "Veuillez saisir un message.",
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
    
    // Identifier qui devrait répondre en fonction du contexte
    let respondingMemberId = selectedTeamMember;
    
    // Si aucun membre n'est explicitement sélectionné, déterminer qui doit répondre
    if (!respondingMemberId) {
      // Chercher des mentions explicites de membres dans le message
      const mentionedRole = findMentionedRole(userMessage);
      if (mentionedRole) {
        // Le membre mentionné répond
        respondingMemberId = mentionedRole;
      } else {
        // Par défaut, le dernier interlocuteur non-utilisateur répond
        const lastSpeaker = findLastSpeaker();
        if (lastSpeaker) {
          respondingMemberId = lastSpeaker;
        } else {
          // Si personne n'a parlé, c'est le responsable SOC qui répond par défaut
          respondingMemberId = 'soc-lead';
        }
      }
    }
    
    // Ajouter de nouveaux outputs console
    addConsoleOutput([`$ message envoyé`, `> traitement en cours...`]);
    
    // Obtenir le membre qui va répondre
    const member = crisisTeamMembers.find(m => m.id === respondingMemberId);
    
    if (member) {
      // Simuler un délai de réponse réaliste (plus court que précédemment)
      setTimeout(async () => {
        try {
          // Obtenir une réponse contextuelle via l'API Azure OpenAI
          const aiResponse = await generateContextualResponse(userMessage, member.role);
          
          // Formater la réponse
          const responseMsg: Message = {
            id: generateId(),
            sender: {
              name: member.name,
              role: member.role,
              avatar: member.avatar
            },
            content: aiResponse,
            timestamp: new Date(),
            isUser: false
          };
          
          // Ajouter la réponse à la conversation
          addMessage(responseMsg);
          
          // Déterminer si un autre membre devrait intervenir en fonction du contenu
          analyzeForInterventions(userMessage, aiResponse, member.id);
        } catch (error) {
          console.error('Erreur lors de la génération de réponse:', error);
          
          // Notification d'erreur
          toast({
            title: "Problème de communication",
            description: "Un problème est survenu lors de la communication avec l'équipe de crise.",
            variant: "destructive",
          });
        }
      }, 1200 + Math.random() * 1000); // Délai plus court pour une meilleure réactivité
    }
  };
  
  // Trouver quel membre de l'équipe était le dernier à parler
  const findLastSpeaker = (): string => {
    // Filtrer pour ne garder que les messages des membres de l'équipe (non-système, non-utilisateur)
    const teamMessages = messages.filter(m => 
      !m.isUser && m.sender.role !== 'Centre de crise' && m.sender.role !== 'Système'
    );
    
    if (teamMessages.length > 0) {
      // Prendre le plus récent message
      const lastMessage = teamMessages[teamMessages.length - 1];
      
      // Trouver l'ID du membre correspondant
      const member = crisisTeamMembers.find(m => m.name === lastMessage.sender.name);
      if (member) {
        return member.id;
      }
    }
    
    // Par défaut, retourner le responsable SOC
    return 'soc-lead';
  };
  
  // Trouver si un rôle est mentionné dans le message
  const findMentionedRole = (message: string): string | null => {
    const lowerMessage = message.toLowerCase();
    
    // Rechercher les mentions explicites de rôles ou de noms
    for (const member of crisisTeamMembers) {
      if (lowerMessage.includes(member.name.toLowerCase()) || 
          lowerMessage.includes(member.role.toLowerCase())) {
        return member.id;
      }
    }
    
    // Rechercher les mots-clés liés à certains domaines
    const roleKeywords = {
      'soc-lead': ['attaque', 'incident', 'détection', 'analyse', 'forensic', 'technique', 'soc'],
      'cio': ['système', 'informatique', 'infrastructure', 'métier', 'opérations', 'disponibilité'],
      'legal': ['juridique', 'légal', 'rgpd', 'cnil', 'notification', 'obligation', 'autorité'],
      'comms': ['communication', 'presse', 'média', 'message', 'public', 'client', 'réputation'],
      'security': ['sécurité', 'politique', 'procédure', 'conformité', 'audit']
    };
    
    for (const [roleId, keywords] of Object.entries(roleKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return roleId;
      }
    }
    
    return null;
  };
  
  // Analyser le contenu pour déterminer si un autre membre devrait intervenir
  const analyzeForInterventions = (userMessage: string, aiResponse: string, currentSpeakerId: string) => {
    // Éviter trop d'interventions rapprochées
    if (lastInterventionTime && (Date.now() - lastInterventionTime) < 30000) {
      // Pas d'intervention si la dernière était il y a moins de 30 secondes
      return;
    }
    
    // Définir des sujets qui pourraient déclencher une intervention
    const interventionTopics = [
      { id: 'legal', keywords: ['juridique', 'légal', 'rgpd', 'cnil', 'notification', 'amende', 'régulateur'], 
        importance: (msg: string) => msg.includes('obligation') ? 2 : 1 },
      { id: 'cio', keywords: ['systèmes', 'impact', 'métier', 'business', 'opérations', 'coût', 'perte', 'production'],
        importance: (msg: string) => msg.includes('critique') ? 2 : 1 },
      { id: 'comms', keywords: ['média', 'presse', 'communication', 'clients', 'image', 'réputation', 'externe'],
        importance: (msg: string) => msg.includes('public') ? 2 : 1 },
      { id: 'security', keywords: ['vulnérabilité', 'sécurité', 'menace', 'compromission', 'attaquant'],
        importance: (msg: string) => msg.includes('critique') ? 2 : 1 }
    ];
    
    // Calculer des scores d'intervention pour chaque membre
    const combinedText = (userMessage + ' ' + aiResponse).toLowerCase();
    const interventionScores = new Map<string, number>();
    
    interventionTopics.forEach(topic => {
      if (topic.id !== currentSpeakerId) { // On n'intervient pas si c'est le même rôle
        const matchingKeywords = topic.keywords.filter(kw => combinedText.includes(kw));
        if (matchingKeywords.length > 0) {
          const importanceMultiplier = topic.importance(combinedText);
          interventionScores.set(topic.id, matchingKeywords.length * importanceMultiplier);
        }
      }
    });
    
    // Intervention possible seulement pour les thèmes avec un score suffisant
    const potentialInterventions = Array.from(interventionScores.entries())
      .filter(([_, score]) => score > 1) // Score minimum pour une intervention
      .sort((a, b) => b[1] - a[1]); // Trier par score décroissant
    
    if (potentialInterventions.length > 0) {
      // Faire intervenir le membre avec le score le plus élevé
      const interveningMemberId = potentialInterventions[0][0];
      const interveningMember = crisisTeamMembers.find(m => m.id === interveningMemberId);
      
      if (interveningMember) {
        // Enregistrer l'heure de l'intervention
        setLastInterventionTime(Date.now());
        
        // Préparer l'intervention après un délai
        setTimeout(async () => {
          // Montrer une notification indiquant qu'un autre membre souhaite intervenir
          const notif: Notification = {
            id: generateId(),
            type: 'system' as NotificationType,
            source: 'Centre de crise',
            title: 'Intervention non sollicitée',
            content: `${interveningMember.name} (${interveningMember.role}) intervient dans la discussion`,
            timestamp: new Date()
          };
          
          setNotifications(prev => [...prev, notif]);
          
          // Générer une réponse pour ce membre qui intervient spontanément
          setTimeout(async () => {
            // Créer un prompt contextualisé pour le membre qui intervient
            const interventionPrompt = `${messages[messages.length-1].sender.name} vient de dire: "${aiResponse}" en réponse à un message du RSSI concernant "${userMessage}". Tu dois intervenir en fonction de ton rôle et de tes priorités.`;
            
            // Obtenir une réponse via l'API pour ce membre
            const interventionResponse = await generateContextualResponse(interventionPrompt, interveningMember.role);
            
            // Ajouter l'intervention à la conversation
            addMessage({
              id: generateId(),
              sender: {
                name: interveningMember.name,
                role: interveningMember.role,
                avatar: interveningMember.avatar
              },
              content: interventionResponse,
              timestamp: new Date(),
              isUser: false
            });
            
          }, 1500);
        }, 4000 + Math.random() * 2000);
      }
    }
  };
  
  // Générer une réponse contextuelle avec l'API de simulation de crise - Version améliorée
  const generateContextualResponse = async (userMessage: string, role: string) => {
    try {
      // Ajouter un indicateur de chargement pendant l'appel à l'API
      // Pour améliorer l'UX, indiquer clairement que la réponse est en cours de génération
      const loadingMessage = {
        id: generateId(),
        sender: {
          name: "Système",
          role: "Centre de crise",
          avatar: "SYS"
        },
        content: `${role} est en train de répondre...`,
        timestamp: new Date(),
        isUser: false
      };
      
      // Ajouter temporairement le message de chargement
      setMessages(prev => [...prev, loadingMessage]);
      
      // On vérifie d'abord si l'API OpenAI est disponible
      const statusResponse = await fetch('/api/openai/status');
      const statusData = await statusResponse.json();
      
      // Si l'API n'est pas disponible, lancer une erreur immédiatement
      if (statusData.connectionStatus !== 'connected') {
        throw new Error('API Azure OpenAI non disponible: ' + statusData.lastErrorMessage);
      }
      
      // Appeler notre API dédiée de simulation de crise avec tous les détails de contexte
      const response = await fetch('/api/immersive-crisis/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          role: role,
          context: {
            scenario: crisisScenarios[scenarioIndex].title,
            tension: showDecisions ? 'modérée' : 'élevée',
            stage: Math.floor(elapsedTime / 300), // Tension qui augmente avec le temps
            impactedSystems: crisisScenarios[scenarioIndex].systems,
            elapsedTime: Math.floor(elapsedTime / 60), // Temps écoulé en minutes pour le contexte
            pastMessages: messages
              .slice(-5) // Limiter aux 5 derniers messages pour le contexte
              .map(m => ({
                role: m.isUser ? 'RSSI' : m.sender.role,
                content: m.content
              }))
          }
        }),
      });
      
      // Supprimer le message de chargement
      setMessages(prev => prev.filter(m => m.id !== loadingMessage.id));
      
      // Vérifier si la réponse est valide
      if (!response.ok) {
        console.error('Erreur API:', await response.text());
        throw new Error(`Erreur de connexion à l'API: ${response.status}`);
      }
      
      // Parser la réponse
      const data = await response.json();
      
      // Vérifier que data.response existe
      if (!data.response || typeof data.response !== 'string' || data.response.trim() === '') {
        console.error('Réponse vide ou invalide:', data);
        throw new Error('Réponse API invalide');
      }
      
      // Ajouter au journal de debug
      addConsoleOutput([
        `# Réponse API reçue pour ${role}`,
        `> Longueur: ${data.response.length} caractères`
      ]);
      
      return data.response;
    } catch (error) {
      console.error('Erreur lors de l\'appel à l\'API de simulation:', error);
      
      // Supprimer tout message de chargement qui pourrait être présent
      setMessages(prev => prev.filter(m => !m.sender.role.includes("en train de répondre")));
      
      // Ajouter l'erreur aux logs pour le debug
      addConsoleOutput([
        `# ERREUR API: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        '> Utilisation de la réponse de secours'
      ]);
      
      // Réponses de secours plus élaborées et variées selon le rôle et le contexte
      const securityRoles = ['RSSI', 'Responsable SOC', 'Analyste Sécurité', 'Expert Forensic'];
      const businessRoles = ['DSI', 'Directeur Général', 'DSI', 'Responsable métier'];
      const commsRoles = ['Directeur Communication', 'Directrice Juridique', 'Responsable RH'];
      
      // Personnaliser selon le rôle
      if (securityRoles.some(r => role.includes(r))) {
        if (userMessage.toLowerCase().includes('isoler') || userMessage.toLowerCase().includes('couper')) {
          return "D'après mon analyse technique, l'isolation des systèmes est notre meilleure option pour contenir l'attaque. J'ai déjà identifié les points de segmentation réseau à activer. Nous devons agir maintenant avant que l'attaquant n'étende son accès à d'autres systèmes critiques.";
        } else {
          return "Je termine l'analyse technique des IoCs et traces d'activité malveillante. Les premiers résultats confirment une compromission avancée avec des techniques d'élévation de privilèges. Je vous envoie mon rapport détaillé dans 10 minutes avec les recommandations techniques.";
        }
      } else if (businessRoles.some(r => role.includes(r))) {
        if (userMessage.toLowerCase().includes('isoler')) {
          return "Attention, l'isolation complète des systèmes aura un impact financier direct de 50 000€ par heure sur nos opérations et affectera 2300 utilisateurs. Pouvons-nous envisager une isolation partielle des segments les plus critiques uniquement?";
        } else {
          return "Je comprends l'urgence de la situation mais nous devons aussi considérer l'impact sur les opérations. Les équipes métiers m'alertent déjà sur des perturbations significatives. Pouvons-nous trouver un équilibre entre sécurité et continuité d'activité?";
        }
      } else if (commsRoles.some(r => role.includes(r))) {
        return "J'ai préparé trois scénarios de communication: interne uniquement, notification aux autorités, ou communication complète. Chaque option comporte des risques juridiques et d'image différents. La CNIL nous impose des délais stricts si des données personnelles sont compromises.";
      }
      
      // Réponse par défaut
      return "Je travaille sur votre demande. Cette situation nécessite une coordination entre plusieurs équipes et j'aurai besoin d'informations supplémentaires pour vous fournir une réponse complète.";
    }
  };
  
  // Prendre une décision
  const makeDecision = async (decisionId: string) => {
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
      
      // Définir quels rôles vont supporter ou s'opposer à la décision
      let supporters: string[] = [];
      let opposants: string[] = [];
      
      if (decisionId === 'isolate-network') {
        supporters = ['soc', 'security']; // Le SOC et la sécurité priorisent la protection
        opposants = ['cio', 'business']; // Le DSI et le métier s'inquiètent de l'impact sur l'activité
      } else if (decisionId === 'monitor-analyze') {
        supporters = ['cio', 'business']; // Le DSI et le métier préfèrent maintenir l'activité
        opposants = ['soc', 'security']; // Le SOC et la sécurité veulent contenir rapidement
      } else if (decisionId === 'activate-crisis') {
        supporters = ['security', 'legal']; // La sécurité et le juridique veulent formaliser la réponse
        opposants = ['cio', 'comms']; // Le DSI et la communication s'inquiètent de l'impact médiatique
      }
      
      // Ajouter des sorties console
      addConsoleOutput([
        `# Décision enregistrée: ${decision.text}`,
        `> Impact sécurité: ${decision.impact.security}`,
        `> Impact opérationnel: ${decision.impact.operations}`
      ]);
      
      // Première réaction à la décision - message automatique
      setTimeout(() => {
        // Ajouter un message automatique basé sur la décision (comme avant)
        if (decisionId === 'isolate-network') {
          addMessage({
            id: generateId(),
            sender: {
              name: 'Laurent Dubois',
              role: 'DSI',
              avatar: 'LD'
            },
            content: "L'isolation du réseau est en cours. Les équipes sont mobilisées mais des services critiques sont maintenant inaccessibles. Les utilisateurs commencent à appeler le support. Cela nous coûte environ 50 000€ par heure d'interruption.",
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
            content: "Nous continuons l'analyse sans isoler le réseau. Attention, nous observons des signes que l'attaquant est toujours actif et continue d'accéder à nos systèmes. Le risque d'exfiltration de données augmente.",
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
            content: "La cellule de crise est officiellement activée. J'ai informé tous les membres clés et le premier point de situation aura lieu dans 15 minutes. Quelles sont vos directives immédiates? Nous avons besoin d'un plan de communication pour gérer notre image.",
            timestamp: new Date(),
            isUser: false
          });
        }
        
        // Simuler un débat entre membres de l'équipe
        setTimeout(async () => {
          try {
            // Sélectionner un supporter et un opposant au hasard
            const supporterId = supporters[Math.floor(Math.random() * supporters.length)];
            const opposantId = opposants[Math.floor(Math.random() * opposants.length)];
            
            const supporter = crisisTeamMembers.find(m => m.id === supporterId);
            const opposant = crisisTeamMembers.find(m => m.id === opposantId);
            
            if (supporter && opposant) {
              // Appeler l'API pour simuler une conversation entre les membres
              const response = await fetch('/api/immersive-crisis/team-interaction', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  decision: decision.text,
                  supportingRole: `${supporter.name} (${supporter.role})`,
                  opposingRole: `${opposant.name} (${opposant.role})`,
                  scenario: crisisScenarios[scenarioIndex].title
                })
              });
              
              if (response.ok) {
                const data = await response.json();
                if (data.conversation) {
                  // Analyser la conversation et la transformer en messages individuels
                  const conversationLines = data.conversation.split('\n')
                    .filter((line: string) => line.trim().length > 0);
                  
                  // Ajouter les messages à la conversation avec un délai entre chaque
                  for (let i = 0; i < conversationLines.length; i++) {
                    const line = conversationLines[i];
                    setTimeout(() => {
                      // Déterminer qui parle en fonction du début du message
                      let speakingMember = supporter;
                      
                      // Si la ligne contient le nom de l'opposant, c'est lui qui parle
                      if (line.toLowerCase().includes(opposant.name.toLowerCase()) || 
                          (i % 2 === 1)) { // Alternance - premier message par supporter, deuxième par opposant
                        speakingMember = opposant;
                      }
                      
                      // Nettoyer le message
                      let messageContent = line;
                      if (messageContent.includes(':')) {
                        messageContent = messageContent.split(':').slice(1).join(':').trim();
                      } else if (messageContent.includes('(') && messageContent.includes(')')) {
                        // Nettoyer les indications de type "(en colère)" ou "(sarcastique)"
                        messageContent = messageContent.replace(/\([^)]*\)/g, '').trim();
                      }
                      
                      // Ajouter le message
                      addMessage({
                        id: generateId(),
                        sender: {
                          name: speakingMember.name,
                          role: speakingMember.role,
                          avatar: speakingMember.avatar
                        },
                        content: messageContent,
                        timestamp: new Date(),
                        isUser: false
                      });
                    }, 8000 + (i * 4000)); // Espacer les messages
                  }
                } else {
                  // Fallback en cas de problème avec la réponse
                  fallbackTeamConversation(supporter, opposant, decision);
                }
              } else {
                // Fallback en cas d'erreur de l'API
                fallbackTeamConversation(supporter, opposant, decision);
              }
            }
          } catch (error) {
            console.error('Erreur lors de la simulation des interactions d\'équipe:', error);
            // Utiliser un fallback sans appel API
            const supporter = crisisTeamMembers.find(m => m.id === supporters[0]);
            const opposant = crisisTeamMembers.find(m => m.id === opposants[0]);
            
            if (supporter && opposant) {
              fallbackTeamConversation(supporter, opposant, decision);
            }
          }
        }, 7000);
      }, 5000);
      
      // Avancer la simulation en générant une nouvelle alerte après un délai
      setTimeout(async () => {
        try {
          // Appeler l'API pour générer une mise à jour de la crise
          const updateResponse = await fetch('/api/immersive-crisis/crisis-update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              currentStage: Math.min(2, Math.floor(elapsedTime / 300)),
              pastDecisions: [decision.text],
              scenario: crisisScenarios[scenarioIndex].title,
              elapsedTime: Math.floor(elapsedTime / 60)
            })
          });
          
          if (updateResponse.ok) {
            const alertData = await updateResponse.json();
            
            if (alertData && alertData.title && alertData.content) {
              const newAlert: Notification = {
                id: generateId(),
                type: 'alert',
                level: (alertData.level || 'moyenne') as AlertLevel,
                source: alertData.source || 'Système de surveillance',
                title: alertData.title,
                content: alertData.content,
                timestamp: new Date()
              };
              
              setNotifications(prev => [...prev, newAlert]);
            } else {
              // Utiliser le développement de scénario par défaut si le format n'est pas correct
              addScenarioDevelopment(decisionId);
            }
          } else {
            // Fallback en cas d'erreur de l'API
            addScenarioDevelopment(decisionId);
          }
        } catch (error) {
          console.error('Erreur lors de la génération de mise à jour de crise:', error);
          // Fallback: utiliser le développement de scénario par défaut
          addScenarioDevelopment(decisionId);
        }
      }, 20000);
    }
  };
  
  // Fallback pour simuler une conversation entre membres de l'équipe sans API
  const fallbackTeamConversation = (supporter: any, opposant: any, decision: any) => {
    setTimeout(() => {
      addMessage({
        id: generateId(),
        sender: {
          name: supporter.name,
          role: supporter.role,
          avatar: supporter.avatar
        },
        content: `Je soutiens la décision du RSSI. ${decision.text} est la meilleure option compte tenu des circonstances et des risques identifiés.`,
        timestamp: new Date(),
        isUser: false
      });
      
      setTimeout(() => {
        addMessage({
          id: generateId(),
          sender: {
            name: opposant.name,
            role: opposant.role,
            avatar: opposant.avatar
          },
          content: `Je ne partage pas cette analyse. Cette décision va avoir des conséquences importantes sur nos opérations et notre réputation. Nous devrions envisager d'autres alternatives.`,
          timestamp: new Date(),
          isUser: false
        });
        
        setTimeout(() => {
          addMessage({
            id: generateId(),
            sender: {
              name: supporter.name,
              role: supporter.role,
              avatar: supporter.avatar
            },
            content: `La sécurité doit rester notre priorité. Les conséquences d'une inaction seraient bien plus graves à long terme.`,
            timestamp: new Date(),
            isUser: false
          });
        }, 4000);
      }, 4000);
    }, 8000);
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
              {/* Légende expliquant le mode de conversation contextuel */}
              <div className="mb-2 text-xs text-blue-400 italic">
                <p className="flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  Les membres de l'équipe répondront automatiquement en fonction du contexte de votre message.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Textarea
                  placeholder="Saisissez votre message à l'équipe de crise..."
                  className="min-h-[80px] resize-none bg-gray-800 border border-gray-700 text-white"
                  value={userMessage}
                  onChange={handleTyping}
                />
                <Button 
                  className="self-end"
                  onClick={sendMessage}
                  disabled={!userMessage.trim()}
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
      {/* Audio éléments commentés car les fichiers audio ne sont pas disponibles */}
      {/* <audio ref={alarmRef} src={alarmSound} />
      <audio ref={notificationRef} src={notificationSound} />
      <audio ref={messagesRef} src={messageSound} /> */}
      
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