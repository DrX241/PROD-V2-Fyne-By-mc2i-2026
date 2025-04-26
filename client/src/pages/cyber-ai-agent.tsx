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

  // Gestion des messages avec mise à jour des compétences
  const handleMessagesUpdate = (newMessages: any[]) => {
    setMessages(newMessages);
    
    if (newMessages.length > messages.length) {
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage.type === 'user') {
        updateSkills(lastMessage.content);
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
          <div className="text-center text-white mb-6">
            <h2 className="text-2xl font-bold mb-4">Session en cours : {getEnvironmentName(activeEnvironment)}</h2>
            <p className="text-blue-300">Version simplifiée pour le développement</p>
          </div>
          
          <div className="flex justify-end mb-4">
            <Button 
              onClick={completeSession}
              className="bg-red-600 hover:bg-red-700 text-white py-2 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Terminer la mission
            </Button>
          </div>
        </div>
      )}
    </CyberLayout>
  );
}