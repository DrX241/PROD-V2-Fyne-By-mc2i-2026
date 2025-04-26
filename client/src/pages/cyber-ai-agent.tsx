import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CyberLayout from "@/components/layout/CyberLayout";
import EnhancedChatInterface from "@/components/cyber/EnhancedChatInterface";
import PageTitle from "@/components/utils/PageTitle";
import { Link } from "wouter";
import { 
  ArrowLeft, Clock, Mail, AreaChart, Send, Command, Microscope, AlertCircle, Play,
  Bot, Info, Code, BarChart3, Shield, MessageCircle, User, LogOut, File, Layers,
  ChevronRight, BarChart2, Lock, Unlock, Search, AlertTriangle, PanelRight, PanelLeft,
  FileText, Activity, ChevronDown, ArrowRight, BellRing, Server, Database, Terminal,
  Target, Check, X
} from "lucide-react";
import FyneRobotImage from "@assets/image_1745662756764.png";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

// Définition des phases de l'expérience immersive
enum Phase {
  INTRO = "intro",           // Introduction et vidéo de mise en contexte
  SELECTION = "selection",   // Sélection de l'environnement immersif
  BRIEFING = "briefing",     // Briefing de la mission
  MISSION = "mission",       // Phase de mission interactive principale
  EVALUATION = "evaluation", // Débriefing et évaluation finale
}

// Types d'interactions disponibles
type InteractionType = "dialog" | "choice" | "analysis" | "terminal" | "document";

// Interface pour les documents disponibles
interface Document {
  id: string;
  title: string;
  type: "rapport" | "email" | "log" | "schema" | "memo";
  content: string;
  discovered: boolean;
}

// Interface pour les choix
interface Choice {
  id: string;
  text: string;
  approach: "technique" | "analytique" | "stratégique";
  consequence?: string;
  skillImpact: {
    primary: "technical" | "analytical" | "strategic" | "communication";
    secondary: "technical" | "analytical" | "strategic" | "communication";
  };
}

// Interface pour les interactions
interface Interaction {
  id: string;
  type: InteractionType;
  npc?: string;
  content: string;
  choices?: Choice[];
  document?: Document;
  completed: boolean;
}

// Interface pour les étapes de mission
interface MissionStep {
  id: string;
  title: string;
  description: string;
  interactions: Interaction[];
  completed: boolean;
  unlocked: boolean;
}

// Schéma de formulaire pour la configuration de la session Agent IA
const formSchema = z.object({
  virtualEnvironment: z.enum(["command-center", "analysis-lab", "crisis-room"], {
    required_error: "Veuillez sélectionner un environnement virtuel.",
  }),
});

// Type d'inférence pour le schéma de formulaire
type FormValues = z.infer<typeof formSchema>;

// Schéma de validation pour le message
const messageSchema = z.object({
  message: z.string().min(1, {
    message: "Le message ne peut pas être vide.",
  }),
});

// Type pour le message
type MessageValues = z.infer<typeof messageSchema>;

export default function CyberAiAgentPage() {
  const { toast } = useToast();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes en secondes
  const [messages, setMessages] = useState<any[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);
  const [activeEnvironment, setActiveEnvironment] = useState<string>("command-center");
  const [skillAssessment, setSkillAssessment] = useState({
    technical: 20,
    analytical: 20,
    strategic: 20,
    communication: 20
  });
  const [currentNPC, setCurrentNPC] = useState<string>("Sarah Chen");
  const startTimeRef = useRef<number>(0);
  const [currentPhase, setCurrentPhase] = useState<Phase>(Phase.INTRO);
  const [missionSteps, setMissionSteps] = useState<MissionStep[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [discoveredDocuments, setDiscoveredDocuments] = useState<Document[]>([]);
  const [notifications, setNotifications] = useState<{id: string, message: string, urgent: boolean}[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Configurer le formulaire
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      virtualEnvironment: "command-center",
    },
  });

  // Fonction pour démarrer la session
  const startSession = async (values: FormValues) => {
    try {
      const response = await apiRequest('/api/cyber/ai-agent/start', {
        method: 'POST',
        body: JSON.stringify({
          virtualEnvironment: values.virtualEnvironment
        })
      });
      
      if (response.success) {
        setSessionData({
          virtualEnvironment: values.virtualEnvironment,
          startTime: Date.now()
        });
        setActiveEnvironment(values.virtualEnvironment);
        setIsSessionActive(true);
        startTimeRef.current = Date.now();
        setCurrentPhase(Phase.MISSION);
        
        // Mettre à jour le NPC en fonction de l'environnement choisi
        if (values.virtualEnvironment === "command-center") {
          setCurrentNPC("Sarah Chen");
        } else if (values.virtualEnvironment === "analysis-lab") {
          setCurrentNPC("Alex Dupont");
        } else if (values.virtualEnvironment === "crisis-room") {
          setCurrentNPC("Malik Johnson");
          // Ajouter un message de bienvenue spécifique à la Salle de Crise
          setTimeout(() => {
            setMessages([
              {
                type: 'assistant',
                content: "Bienvenue dans la Salle de Crise. Nous sommes confrontés à un incident de cybersécurité critique sur notre système SCADA. Les indicateurs montrent une possible intrusion sur notre réseau industriel avec des tentatives de manipulation des valeurs de contrôle. Nous devons agir rapidement pour évaluer la situation et limiter l'impact potentiel.",
                timestamp: new Date().toLocaleTimeString()
              }
            ]);
          }, 1000);
        }

        // Créer des étapes de mission fictives (à remplacer par des données réelles)
        const demoMissionSteps: MissionStep[] = [
          {
            id: "step1",
            title: "Évaluation initiale de la situation",
            description: "Analyser le contexte et comprendre la menace actuelle",
            completed: false,
            unlocked: true,
            interactions: [
              {
                id: "interaction1",
                type: "dialog",
                npc: currentNPC,
                content: "Bienvenue dans cette simulation. Nous devons d'abord évaluer la situation actuelle.",
                completed: false
              }
            ]
          },
          {
            id: "step2",
            title: "Collecte de preuves",
            description: "Recueillir et analyser les données disponibles",
            completed: false,
            unlocked: false,
            interactions: []
          },
          {
            id: "step3",
            title: "Élaboration de la stratégie",
            description: "Développer un plan d'action pour répondre à la menace",
            completed: false,
            unlocked: false,
            interactions: []
          }
        ];
        
        setMissionSteps(demoMissionSteps);

        toast({
          title: "Environnement virtuel activé",
          description: `Session immersive démarrée dans ${getEnvironmentName(values.virtualEnvironment)}.`,
        });
      } else {
        console.warn("Réponse sans succès:", response);
        toast({
          variant: "destructive",
          title: "Erreur d'initialisation",
          description: response?.error || "Impossible d'activer l'environnement virtuel. Veuillez réessayer.",
        });
      }
    } catch (error) {
      console.error("Erreur lors du démarrage de la session:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'initialisation",
        description: "Impossible d'activer l'environnement virtuel. Veuillez réessayer.",
      });
    }
  };

  // Fonction pour mettre à jour l'évaluation des compétences
  const updateSkills = async (userMessage: string) => {
    if (!sessionData) return;
    
    try {
      const response = await apiRequest('/api/cyber/ai-agent/update-skills', {
        method: 'POST',
        body: JSON.stringify({
          userInput: userMessage,
          currentSkills: skillAssessment,
          context: currentNPC
        })
      });
      
      if (response.success) {
        setSkillAssessment(response.skillAssessment);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des compétences:", error);
    }
  };

  // Fonction pour terminer la session et générer un rapport d'évaluation
  const completeSession = async () => {
    if (!sessionData) return;

    const duration = Date.now() - startTimeRef.current;
    
    try {
      const response = await apiRequest('/api/cyber/ai-agent/complete', {
        method: 'POST',
        body: JSON.stringify({
          virtualEnvironment: sessionData.virtualEnvironment,
          messages,
          duration,
          skillAssessment
        })
      });
      
      if (response.success) {
        toast({
          title: "Mission accomplie",
          description: "Le centre de crise a reçu votre rapport d'évaluation final.",
        });

        setIsSessionActive(false);
        setTimeRemaining(600);
        setMessages([]);
        setSessionData(null);
        setCurrentPhase(Phase.INTRO);
        setSkillAssessment({
          technical: 20,
          analytical: 20,
          strategic: 20,
          communication: 20
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur de transmission",
          description: response?.error || "Impossible de transmettre les données au centre de crise.",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la finalisation de la session:", error);
      toast({
        variant: "destructive",
        title: "Erreur de transmission",
        description: "Impossible de transmettre les données au centre de crise.",
      });
    }
  };

  // Effet pour le compte à rebours
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isSessionActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSessionActive, timeRemaining]);

  // Formater le temps restant
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Réponses prédéfinies pour la salle de crise
  const crisisRoomResponses = [
    "Nous devons évaluer rapidement la situation. D'après nos premières analyses, il s'agit d'une attaque sophistiquée ciblant notre système SCADA. Les systèmes de contrôle industriel montrent des comportements anormaux depuis 45 minutes.",
    "Excellente observation. Les journaux système indiquent une activité inhabituelle sur notre réseau OT. Nous avons détecté des tentatives de manipulation des valeurs de pression dans les conduites principales.",
    "C'est une approche judicieuse. Nous devons établir un périmètre de sécurité et isoler les systèmes critiques. Les procédures d'urgence de la norme ISO 27001 recommandent d'activer notre plan de continuité d'activité.",
    "Je suis d'accord avec votre analyse. Les indicateurs de compromission suggèrent un acteur étatique. La signature correspond à des attaques précédemment documentées contre des infrastructures critiques.",
    "Votre stratégie est cohérente avec notre plan de gestion de crise. Nous devrions également notifier les autorités compétentes conformément à la directive NIS2 sur la cybersécurité des infrastructures critiques.",
    "Les données forensiques que nous avons collectées révèlent une compromission initiale via un email de phishing ciblé envoyé à un membre de l'équipe technique il y a environ trois semaines.",
    "Je vous recommande d'activer immédiatement notre cellule de crise et de mettre en place une communication coordonnée avec les parties prenantes. Nous devons éviter toute panique tout en assurant la transparence nécessaire."
  ];

  // Fonction pour générer une réponse automatique basée sur le contexte
  const generateAIResponse = (userMessage: string) => {
    // Simulation d'une réponse IA contextualisée
    const randomIndex = Math.floor(Math.random() * crisisRoomResponses.length);
    return {
      type: 'assistant',
      content: crisisRoomResponses[randomIndex],
      timestamp: new Date().toLocaleTimeString()
    };
  };

  // Gestion des messages avec simulation de réponse IA
  const handleMessagesUpdate = (newMessages: any[]) => {
    setMessages(newMessages);
    
    if (newMessages.length > messages.length) {
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage.type === 'user') {
        // Mettre à jour les compétences
        updateSkills(lastMessage.content);
        
        // Simuler la réponse de l'IA
        setIsTyping(true);
        
        // Temps de délai dynamique basé sur la longueur du message (entre 1.5 et 4 secondes)
        const typingDelay = Math.min(1500 + lastMessage.content.length * 20, 4000);
        
        setTimeout(() => {
          setIsTyping(false);
          
          // Ajouter la réponse de l'IA après le délai de frappe
          const aiResponse = generateAIResponse(lastMessage.content);
          setMessages(prev => [...prev, aiResponse]);
          
          // Mettre à jour les compétences aléatoirement pour simuler une analyse de l'IA
          const randomSkillIncrement = {
            technical: Math.floor(Math.random() * 5) + 2,
            analytical: Math.floor(Math.random() * 5) + 2,
            strategic: Math.floor(Math.random() * 5) + 2,
            communication: Math.floor(Math.random() * 5) + 2
          };
          
          setSkillAssessment(prev => ({
            technical: Math.min(prev.technical + randomSkillIncrement.technical, 100),
            analytical: Math.min(prev.analytical + randomSkillIncrement.analytical, 100),
            strategic: Math.min(prev.strategic + randomSkillIncrement.strategic, 100),
            communication: Math.min(prev.communication + randomSkillIncrement.communication, 100)
          }));
          
          // Mise à jour aléatoire des objectifs si compétences suffisantes
          if (Math.random() > 0.7) { // 30% de chance de compléter une étape
            setMissionSteps(prev => {
              const updatedSteps = [...prev];
              if (activeStepIndex < updatedSteps.length && !updatedSteps[activeStepIndex].completed) {
                updatedSteps[activeStepIndex].completed = true;
                
                // Débloquer l'étape suivante si elle existe
                if (activeStepIndex + 1 < updatedSteps.length) {
                  updatedSteps[activeStepIndex + 1].unlocked = true;
                  setActiveStepIndex(activeStepIndex + 1);
                }
              }
              return updatedSteps;
            });
          }
        }, typingDelay);
      }
    }
  };

  // Générer des suggestions de réponses
  const generateSuggestions = async (currentMessage: string) => {
    if (!sessionData) return [];
    
    try {
      const response = await apiRequest('/api/cyber/ai-agent/suggestions', {
        method: 'POST',
        body: JSON.stringify({
          currentMessage,
          conversationHistory: messages,
          userSkills: skillAssessment
        })
      });
      
      if (response.success) {
        return response.suggestions;
      }
      return [];
    } catch (error) {
      console.error("Erreur lors de la génération des suggestions:", error);
      return [];
    }
  };

  const getEnvironmentIcon = (environment: string) => {
    switch (environment) {
      case 'command-center':
        return <Command className="h-5 w-5" />;
      case 'analysis-lab':
        return <Microscope className="h-5 w-5" />;
      case 'crisis-room':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Command className="h-5 w-5" />;
    }
  };

  const getEnvironmentName = (environment: string) => {
    switch (environment) {
      case 'command-center':
        return "Centre de commandement";
      case 'analysis-lab':
        return "Laboratoire d'analyse";
      case 'crisis-room':
        return "Salle de crise";
      default:
        return "Environnement";
    }
  };

  // Rendu de l'interface principale
  return (
    <CyberLayout>
      <PageTitle title="AGENT IA IMMERSIF" />
      <div className="mb-2 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 bg-gray-950/80 backdrop-blur-sm py-2 shadow-md">
        <Link href="/cyber" className="inline-flex items-center text-[#46cada] hover:text-blue-600 transition-colors">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Retour à I AM CYBER
        </Link>
        
        <div className="flex items-center space-x-3">
          {isSessionActive && (
            <div className="flex items-center text-white bg-indigo-600/80 px-3 py-1 rounded-full">
              {getEnvironmentIcon(activeEnvironment)}
              <span className="ml-2 font-medium">{getEnvironmentName(activeEnvironment)}</span>
            </div>
          )}
          
          <div className="flex items-center text-white bg-blue-600/80 px-3 py-1 rounded-full">
            <Clock className="mr-2 h-4 w-4" />
            <span className="font-mono">{isSessionActive ? formatTime(timeRemaining) : "10:00"}</span>
          </div>
        </div>
      </div>

      {!isSessionActive ? (
        <div className="container mx-auto px-4 py-4">
          {/* Titre principal en haut */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 text-center"
          >
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 flex items-center justify-center">
              Agent IA Immersif
            </h2>
            
            <p className="text-blue-200 mb-6 max-w-2xl mx-auto">
              Plongez dans une expérience d'apprentissage avancée en cybersécurité avec évaluation des compétences en temps réel.
            </p>
          </motion.div>
        
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Image du Robot FYNE à GAUCHE */}
            <div className="lg:col-span-5 flex items-center justify-center lg:justify-start">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="relative"
              >
                <img 
                  src={FyneRobotImage} 
                  alt="Robot FYNE - Assistant IA" 
                  className="h-[350px] sm:h-[450px] md:h-[550px] w-auto drop-shadow-2xl object-contain"
                />

              </motion.div>
            </div>
            
            {/* Contenu à DROITE */}
            <div className="lg:col-span-7">
              <div className="flex flex-col h-full">
                {/* Sélection d'environnement */}
                <div className="flex-grow">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-white mb-6">
                        Environnement Immersif
                      </h3>
                      
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(startSession)} className="space-y-6">
                          <FormField
                            control={form.control}
                            name="virtualEnvironment"
                            render={({ field }) => (
                              <FormItem className="space-y-5">
                                <FormControl>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* CARTE #1: CENTRE DE COMMANDEMENT */}
                                    <motion.div
                                      whileHover={{ y: -8, scale: 1.02 }}
                                      transition={{ duration: 0.3 }}
                                      className={`relative overflow-hidden rounded-xl border-2 p-0 h-[280px] cursor-pointer group
                                        ${field.value === "command-center" 
                                          ? "border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/20" 
                                          : "border-gray-700/50 shadow-md hover:shadow-lg hover:shadow-cyan-900/20"
                                        }`}
                                      onClick={() => field.onChange("command-center")}
                                    >
                                      {/* Arrière-plan avec overlay gradient */}
                                      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/30 via-blue-900/50 to-gray-900/95 z-10"></div>
                                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-50"></div>
                                      
                                      {/* Contenu de la carte */}
                                      <div className="relative z-20 h-full flex flex-col">
                                        {/* Badge de sélection */}
                                        {field.value === "command-center" && (
                                          <div className="absolute top-2 right-2 bg-cyan-500 text-xs p-1 px-2 rounded-full text-white flex items-center space-x-1">
                                            <span className="h-2 w-2 rounded-full bg-white"></span>
                                            <span>Sélectionné</span>
                                          </div>
                                        )}
                                        
                                        {/* Icône et détails */}
                                        <div className="mt-auto p-6">
                                          <div className="mb-3 bg-cyan-700/70 p-2 rounded-lg w-min">
                                            <Command className="h-6 w-6 text-cyan-200" />
                                          </div>
                                          <h3 className="font-bold text-base text-white mb-3 drop-shadow-md">Centre de Commandement</h3>
                                          <p className="text-sm text-cyan-100/80 line-clamp-2 group-hover:line-clamp-3 transition-all">
                                            Planification stratégique et coordination d'équipe.
                                          </p>
                                        </div>
                                      </div>
                                    </motion.div>
                                    
                                    {/* CARTE #2: LABORATOIRE D'ANALYSE */}
                                    <motion.div
                                      whileHover={{ y: -8, scale: 1.02 }}
                                      transition={{ duration: 0.3 }}
                                      className={`relative overflow-hidden rounded-xl border-2 p-0 h-[280px] cursor-pointer group
                                        ${field.value === "analysis-lab" 
                                          ? "border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/20" 
                                          : "border-gray-700/50 shadow-md hover:shadow-lg hover:shadow-indigo-900/20"
                                        }`}
                                      onClick={() => field.onChange("analysis-lab")}
                                    >
                                      {/* Arrière-plan avec overlay gradient */}
                                      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/30 via-indigo-900/50 to-gray-900/95 z-10"></div>
                                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581093196277-9f608bb3a604?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-50"></div>
                                      
                                      {/* Contenu de la carte */}
                                      <div className="relative z-20 h-full flex flex-col">
                                        {/* Badge de sélection */}
                                        {field.value === "analysis-lab" && (
                                          <div className="absolute top-2 right-2 bg-indigo-500 text-xs p-1 px-2 rounded-full text-white flex items-center space-x-1">
                                            <span className="h-2 w-2 rounded-full bg-white"></span>
                                            <span>Sélectionné</span>
                                          </div>
                                        )}
                                        
                                        {/* Icône et détails */}
                                        <div className="mt-auto p-6">
                                          <div className="mb-3 bg-indigo-700/70 p-2 rounded-lg w-min">
                                            <Microscope className="h-6 w-6 text-indigo-200" />
                                          </div>
                                          <h3 className="font-bold text-base text-white mb-3 drop-shadow-md">Laboratoire d'Analyse</h3>
                                          <p className="text-sm text-indigo-100/80 line-clamp-2 group-hover:line-clamp-3 transition-all">
                                            Investigation technique et analyse forensique.
                                          </p>
                                        </div>
                                      </div>
                                    </motion.div>
                                    
                                    {/* CARTE #3: SALLE DE CRISE */}
                                    <motion.div
                                      whileHover={{ y: -8, scale: 1.02 }}
                                      transition={{ duration: 0.3 }}
                                      className={`relative overflow-hidden rounded-xl border-2 p-0 h-[280px] cursor-pointer group
                                        ${field.value === "crisis-room" 
                                          ? "border-violet-500 ring-2 ring-violet-500/30 shadow-lg shadow-violet-500/20" 
                                          : "border-gray-700/50 shadow-md hover:shadow-lg hover:shadow-violet-900/20"
                                        }`}
                                      onClick={() => field.onChange("crisis-room")}
                                    >
                                      {/* Arrière-plan avec overlay gradient */}
                                      <div className="absolute inset-0 bg-gradient-to-b from-violet-900/30 via-violet-900/50 to-gray-900/95 z-10"></div>
                                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-50"></div>
                                      
                                      {/* Contenu de la carte */}
                                      <div className="relative z-20 h-full flex flex-col">
                                        {/* Badge de sélection */}
                                        {field.value === "crisis-room" && (
                                          <div className="absolute top-2 right-2 bg-violet-500 text-xs p-1 px-2 rounded-full text-white flex items-center space-x-1">
                                            <span className="h-2 w-2 rounded-full bg-white"></span>
                                            <span>Sélectionné</span>
                                          </div>
                                        )}
                                        
                                        {/* Icône et détails */}
                                        <div className="mt-auto p-6">
                                          <div className="mb-3 bg-violet-700/70 p-2 rounded-lg w-min">
                                            <AlertCircle className="h-6 w-6 text-violet-200" />
                                          </div>
                                          <h3 className="font-bold text-base text-white mb-3 drop-shadow-md">Salle de Crise</h3>
                                          <p className="text-sm text-violet-100/80 line-clamp-2 group-hover:line-clamp-3 transition-all">
                                            Gestion d'incidents critiques et coordination.
                                          </p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  </div>
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <div className="pt-2">
                            <Button 
                              type="submit" 
                              className="w-full py-6 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                            >
                              Commencer la session immersive
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-4">
          {/* Section Salle de Crise */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Zone principale - Salle de Crise */}
            <div className="lg:col-span-8">
              <Card className="bg-gray-900/90 border-violet-900/50 shadow-lg overflow-hidden mb-6">
                <div className="p-0 relative bg-gradient-to-r from-violet-900/30 to-indigo-900/30">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-950/80 to-indigo-950/80">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-violet-300 mr-2" />
                      <span className="font-medium text-white">Salle de Crise - Incident en cours</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-violet-300 mr-1" />
                      <span className="text-sm font-mono text-violet-100">{formatTime(timeRemaining)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-950 h-[600px] flex flex-col">
                  {/* Messages area */}
                  <div className="flex-grow overflow-y-auto mb-4 p-2 space-y-4 scrollbar-thin">
                    {/* Message de présentation du NPC */}
                    <div className="flex items-start gap-3 text-white">
                      <Avatar className="h-9 w-9 border border-violet-600/30">
                        <AvatarFallback className="bg-violet-900 text-violet-200">MJ</AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-800/50 rounded-lg p-3 max-w-[85%] space-y-2 shadow-md border border-violet-900/20">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-violet-300">{currentNPC}</span>
                          <span className="text-xs text-gray-500">Coordinateur de crise</span>
                        </div>
                        <p className="text-gray-200 text-sm">
                          Bienvenue dans la Salle de Crise. Nous sommes confrontés à un incident de cybersécurité majeur. 
                          Notre système de contrôle industriel montre des signes d'activité suspecte. 
                          Nous devons agir rapidement pour évaluer la situation et mettre en place une réponse appropriée.
                        </p>
                      </div>
                    </div>
                    
                    {/* Affichage des messages */}
                    {messages.map((msg, index) => (
                      <div key={index} className={`flex items-start gap-3 ${msg.type === 'user' ? 'justify-end' : ''}`}>
                        {msg.type !== 'user' && (
                          <Avatar className="h-9 w-9 border border-violet-600/30">
                            <AvatarFallback className="bg-violet-900 text-violet-200">MJ</AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`rounded-lg p-3 max-w-[85%] space-y-1 shadow-md ${
                          msg.type === 'user' 
                            ? 'bg-violet-900/30 text-white border border-violet-700/30' 
                            : 'bg-gray-800/50 text-white border border-violet-900/20'
                        }`}>
                          <div className="flex justify-between items-center">
                            <span className={`font-semibold ${msg.type === 'user' ? 'text-violet-200' : 'text-violet-300'}`}>
                              {msg.type === 'user' ? 'Vous' : currentNPC}
                            </span>
                            <span className="text-xs text-gray-500">{msg.timestamp || 'Maintenant'}</span>
                          </div>
                          <p className="text-gray-200 text-sm">{msg.content}</p>
                        </div>
                        
                        {msg.type === 'user' && (
                          <Avatar className="h-9 w-9 border border-indigo-600/30">
                            <AvatarFallback className="bg-indigo-900 text-indigo-200">
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    
                    {/* Message de saisie de l'IA - effet d'écriture en temps réel */}
                    {isTyping && (
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9 border border-violet-600/30">
                          <AvatarFallback className="bg-violet-900 text-violet-200">MJ</AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-800/50 rounded-lg p-3 max-w-[85%] shadow-md border border-violet-900/20">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-violet-300">{currentNPC}</span>
                            <span className="text-xs text-gray-500">Maintenant</span>
                          </div>
                          <div className="flex space-x-1 mt-2">
                            <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse"></div>
                            <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse delay-75"></div>
                            <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse delay-150"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Input area */}
                  <div className="mt-auto">
                    <div className="flex gap-2">
                      <div className="flex-grow relative">
                        <Textarea
                          placeholder="Tapez votre message..."
                          className="min-h-[60px] resize-none border-violet-800/30 bg-gray-800/30 text-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              const messageText = e.currentTarget.value.trim();
                              if (messageText) {
                                const newMessage = {
                                  type: 'user',
                                  content: messageText,
                                  timestamp: new Date().toLocaleTimeString()
                                };
                                const updatedMessages = [...messages, newMessage];
                                handleMessagesUpdate(updatedMessages);
                                // Réinitialiser le champ de texte
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <Button 
                        onClick={() => {
                          const textarea = document.querySelector('textarea');
                          if (textarea) {
                            const messageText = textarea.value.trim();
                            if (messageText) {
                              const newMessage = {
                                type: 'user',
                                content: messageText,
                                timestamp: new Date().toLocaleTimeString()
                              };
                              const updatedMessages = [...messages, newMessage];
                              handleMessagesUpdate(updatedMessages);
                              // Réinitialiser le champ de texte
                              textarea.value = '';
                            }
                          }
                        }}
                        className="h-[60px] px-4 bg-violet-700 hover:bg-violet-600"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Panneau latéral - Informations sur la crise */}
            <div className="lg:col-span-4 space-y-6">
              {/* Carte de progression des compétences */}
              <Card className="border-violet-800/30 bg-gray-900/60 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-violet-900/80 to-indigo-900/80 pb-2 pt-4 px-4">
                  <div className="text-base font-medium text-white flex items-center">
                    <BarChart2 className="mr-2 h-5 w-5 text-violet-300" />
                    Évaluation des compétences
                  </div>
                </div>
                <div className="p-4 pt-4">
                  <div className="space-y-4">
                    {/* Compétence technique */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-cyan-400 flex items-center">
                          <Code className="h-3.5 w-3.5 mr-1" /> Technique
                        </span>
                        <span className="text-cyan-300 font-medium">{skillAssessment.technical}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-800/70 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-700 rounded-full" 
                          style={{ width: `${skillAssessment.technical}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Compétence analytique */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-indigo-400 flex items-center">
                          <BarChart3 className="h-3.5 w-3.5 mr-1" /> Analytique
                        </span>
                        <span className="text-indigo-300 font-medium">{skillAssessment.analytical}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-800/70 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full" 
                          style={{ width: `${skillAssessment.analytical}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Compétence stratégique */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-violet-400 flex items-center">
                          <Shield className="h-3.5 w-3.5 mr-1" /> Stratégique
                        </span>
                        <span className="text-violet-300 font-medium">{skillAssessment.strategic}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-800/70 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-600 to-purple-800 rounded-full" 
                          style={{ width: `${skillAssessment.strategic}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Compétence communication */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-emerald-400 flex items-center">
                          <MessageCircle className="h-3.5 w-3.5 mr-1" /> Communication
                        </span>
                        <span className="text-emerald-300 font-medium">{skillAssessment.communication}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-800/70 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full" 
                          style={{ width: `${skillAssessment.communication}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Objectifs de mission */}
              <Card className="border-violet-800/30 bg-gray-900/60 shadow-lg">
                <div className="bg-gradient-to-r from-violet-900/80 to-indigo-900/80 pb-2 pt-4 px-4">
                  <div className="text-base font-medium text-white flex items-center">
                    <Target className="mr-2 h-5 w-5 text-violet-300" />
                    Objectifs de mission
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {missionSteps.map((step, index) => (
                      <div 
                        key={step.id}
                        className={`p-2 rounded-md border border-violet-900/30 ${
                          index === activeStepIndex 
                            ? "bg-violet-900/30 border-l-4 border-l-violet-500" 
                            : step.completed 
                              ? "bg-green-900/20 border-l-4 border-l-green-500" 
                              : "bg-indigo-950/30"
                        }`}
                      >
                        <div className="flex items-center">
                          {step.completed ? (
                            <div className="h-5 w-5 mr-2 rounded-full bg-green-500 flex items-center justify-center">
                              <Check className="h-3 w-3 text-green-950" />
                            </div>
                          ) : index === activeStepIndex ? (
                            <div className="h-5 w-5 mr-2 rounded-full bg-violet-500 flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                            </div>
                          ) : (
                            <div className="h-5 w-5 mr-2 rounded-full border-2 border-gray-600"></div>
                          )}
                          
                          <span className={`text-sm font-medium ${
                            step.completed 
                              ? "text-green-300" 
                              : index === activeStepIndex 
                                ? "text-violet-300" 
                                : "text-gray-400"
                          }`}>
                            {step.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              
              {/* Bouton terminer mission */}
              <Button 
                onClick={completeSession}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Terminer la mission
              </Button>
            </div>
          </div>
        </div>
      )}
    </CyberLayout>
  );
}