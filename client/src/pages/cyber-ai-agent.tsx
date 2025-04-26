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
        
        // Mettre à jour le NPC en fonction de l'environnement choisi
        if (values.virtualEnvironment === "command-center") {
          setCurrentNPC("Sarah Chen");
        } else if (values.virtualEnvironment === "analysis-lab") {
          setCurrentNPC("Alex Dupont");
        } else if (values.virtualEnvironment === "crisis-room") {
          setCurrentNPC("Malik Johnson");
        }

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

  // État pour la phase actuelle de l'expérience immersive
  const [currentPhase, setCurrentPhase] = useState<Phase>(Phase.INTRO);
  
  // État pour les étapes de mission
  const [missionSteps, setMissionSteps] = useState<MissionStep[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  
  // État pour les documents découverts
  const [discoveredDocuments, setDiscoveredDocuments] = useState<Document[]>([]);
  
  // État pour les notifications et interruptions
  const [notifications, setNotifications] = useState<{id: string, message: string, urgent: boolean}[]>([]);
  const [showInterruption, setShowInterruption] = useState<boolean>(false);
  const [interruptionContent, setInterruptionContent] = useState<string>("");
  
  // État pour les outils de simulation
  const [activeTools, setActiveTools] = useState<string[]>([]);
  
  // État pour l'affichage des panneaux latéraux
  const [showDocPanel, setShowDocPanel] = useState<boolean>(false);
  const [showSkillsPanel, setShowSkillsPanel] = useState<boolean>(false);
  
  // Références pour les animations
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Gérer le changement de phase
  const handlePhaseChange = (newPhase: Phase) => {
    setCurrentPhase(newPhase);
    
    // Actions spécifiques à chaque transition de phase
    if (newPhase === Phase.BRIEFING) {
      // Initialiser les étapes de mission selon l'environnement
      initializeMissionSteps(activeEnvironment);
    }
    
    if (newPhase === Phase.MISSION) {
      // Ajouter un délai avant d'afficher la première notification
      setTimeout(() => {
        addNotification("Analyse de vulnérabilité requise sur le serveur principal", false);
      }, 30000);
      
      // Planifier une interruption dramatique après quelques minutes
      setTimeout(() => {
        triggerInterruption("ALERTE: Une intrusion a été détectée dans le réseau ! Nous avons besoin d'une réponse immédiate.");
      }, 120000);
    }
  };
  
  // Initialiser les étapes de mission selon l'environnement choisi
  const initializeMissionSteps = (environment: string) => {
    let steps: MissionStep[] = [];
    
    if (environment === "command-center") {
      steps = [
        {
          id: "step1",
          title: "Évaluation des menaces",
          description: "Analyser le paysage des menaces actuelles et identifier les risques prioritaires",
          interactions: [
            {
              id: "interaction1",
              type: "dialog",
              npc: "Sarah Chen",
              content: "Bienvenue au Centre de Commandement. Nous avons des rapports de menaces à évaluer. Par où souhaitez-vous commencer?",
              completed: false
            }
          ],
          completed: false,
          unlocked: true
        },
        {
          id: "step2",
          title: "Élaboration de stratégie",
          description: "Développer un plan d'action pour contrer les menaces identifiées",
          interactions: [],
          completed: false,
          unlocked: false
        },
        {
          id: "step3",
          title: "Coordination des équipes",
          description: "Assigner des tâches et coordonner les ressources disponibles",
          interactions: [],
          completed: false,
          unlocked: false
        }
      ];
    } else if (environment === "analysis-lab") {
      steps = [
        {
          id: "step1",
          title: "Analyse de logiciel malveillant",
          description: "Examiner les échantillons de malware détectés sur le réseau",
          interactions: [
            {
              id: "interaction1",
              type: "dialog",
              npc: "Alex Dupont",
              content: "Notre système a isolé plusieurs échantillons de code suspect. Nous devons déterminer leur fonctionnement et origine.",
              completed: false
            }
          ],
          completed: false,
          unlocked: true
        },
        {
          id: "step2",
          title: "Analyse forensique",
          description: "Examiner les traces laissées par l'attaque sur les systèmes compromis",
          interactions: [],
          completed: false,
          unlocked: false
        },
        {
          id: "step3",
          title: "Identification de l'auteur",
          description: "Rassembler les preuves pour identifier le groupe responsable de l'attaque",
          interactions: [],
          completed: false,
          unlocked: false
        }
      ];
    } else if (environment === "crisis-room") {
      steps = [
        {
          id: "step1",
          title: "Confinement de l'incident",
          description: "Limiter la propagation de l'attaque en cours et isoler les systèmes compromis",
          interactions: [
            {
              id: "interaction1",
              type: "dialog",
              npc: "Malik Johnson",
              content: "Nous sommes en pleine crise ! Plusieurs systèmes critiques ont été compromis. Nous devons agir rapidement pour limiter les dégâts.",
              completed: false
            }
          ],
          completed: false,
          unlocked: true
        },
        {
          id: "step2",
          title: "Communication de crise",
          description: "Préparer la communication interne et externe sur l'incident",
          interactions: [],
          completed: false,
          unlocked: false
        },
        {
          id: "step3",
          title: "Plan de restauration",
          description: "Définir la stratégie pour restaurer les systèmes et retourner à la normale",
          interactions: [],
          completed: false,
          unlocked: false
        }
      ];
    }
    
    setMissionSteps(steps);
  };
  
  // Ajouter une notification
  const addNotification = (message: string, urgent: boolean = false) => {
    const newNotification = {
      id: `notif-${Date.now()}`,
      message,
      urgent
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Supprimer automatiquement la notification après un certain temps
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, urgent ? 15000 : 10000);
  };
  
  // Déclencher une interruption dramatique
  const triggerInterruption = (content: string) => {
    setInterruptionContent(content);
    setShowInterruption(true);
    
    // Jouer un son d'alerte (à implémenter)
  };
  
  // Gérer la fermeture d'une interruption
  const handleInterruptionClose = () => {
    setShowInterruption(false);
    
    // Ajouter un document lié à l'interruption
    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      title: "Rapport d'incident",
      type: "rapport",
      content: `Détails de l'alerte : ${interruptionContent}\n\nHorodatage: ${new Date().toLocaleString()}\n\nSystèmes affectés: Serveur principal, Base de données clients\n\nIndications d'origine: Connexions suspectes depuis l'adresse IP 198.51.100.123`,
      discovered: true
    };
    
    setDiscoveredDocuments(prev => [...prev, newDocument]);
    addNotification("Nouveau document disponible: Rapport d'incident", true);
  };
  
  // Compléter une interaction
  const completeInteraction = (stepId: string, interactionId: string) => {
    setMissionSteps(prevSteps => 
      prevSteps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            interactions: step.interactions.map(interaction => {
              if (interaction.id === interactionId) {
                return {
                  ...interaction,
                  completed: true
                };
              }
              return interaction;
            })
          };
        }
        return step;
      })
    );
    
    // Vérifier si toutes les interactions de l'étape sont complétées
    const updatedSteps = missionSteps.map(step => {
      if (step.id === stepId) {
        const allCompleted = step.interactions.every(i => i.id === interactionId || i.completed);
        return { ...step, completed: allCompleted };
      }
      return step;
    });
    
    // Débloquer l'étape suivante si nécessaire
    if (updatedSteps.find(step => step.id === stepId)?.completed) {
      const currentIndex = updatedSteps.findIndex(step => step.id === stepId);
      if (currentIndex < updatedSteps.length - 1) {
        updatedSteps[currentIndex + 1].unlocked = true;
        setActiveStepIndex(currentIndex + 1);
      } else {
        // Toutes les étapes sont complétées, passer à la phase d'évaluation
        handlePhaseChange(Phase.EVALUATION);
      }
    }
    
    setMissionSteps(updatedSteps);
  };
  
  // Rendu des différentes phases
  const renderPhaseContent = () => {
    switch (currentPhase) {
      case Phase.INTRO:
        return renderIntroPhase();
      case Phase.SELECTION:
        return renderSelectionPhase();
      case Phase.BRIEFING:
        return renderBriefingPhase();
      case Phase.MISSION:
        return renderMissionPhase();
      case Phase.EVALUATION:
        return renderEvaluationPhase();
      default:
        return null;
    }
  };
  
  // Rendu de la phase d'introduction
  const renderIntroPhase = () => {
    return (
      <div className="relative w-full h-[calc(100vh-128px)] bg-gradient-to-b from-gray-900 to-blue-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full opacity-10">
          {/* Grille cybersécurité en arrière-plan */}
          <div className="absolute top-0 left-0 right-0 bottom-0 grid grid-cols-12 gap-3 opacity-30">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-r border-blue-500/20 h-full"></div>
            ))}
          </div>
          <div className="absolute top-0 left-0 right-0 bottom-0 grid grid-rows-12 gap-3 opacity-30">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-b border-blue-500/20 w-full"></div>
            ))}
          </div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl w-full mx-auto px-6 py-12 z-10 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Bienvenue dans l'expérience <span className="text-blue-400">AGENT IA IMMERSIF</span>
          </h1>
          
          <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl mb-8 text-left mx-auto max-w-4xl">
            <h2 className="text-2xl font-semibold text-blue-300 mb-4">Simulation de Cybersécurité Avancée</h2>
            <p className="text-gray-200 mb-4">
              Vous êtes sur le point de plonger dans une simulation immersive où vous endosserez le rôle d'un expert en cybersécurité 
              faisant face à des scénarios réalistes de menaces et d'incidents.
            </p>
            <p className="text-gray-200 mb-4">
              Au cours de cette simulation, vous devrez analyser les menaces, prendre des décisions stratégiques,
              et collaborer avec une équipe virtuelle d'experts pour résoudre des incidents de sécurité.
            </p>
            <p className="text-gray-200 mb-6">
              Vos compétences techniques, analytiques, stratégiques et de communication seront évaluées en temps réel
              en fonction de vos décisions et actions.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700/50">
                <h3 className="text-blue-300 font-medium mb-2 flex items-center">
                  <Command className="mr-2 h-5 w-5" />
                  Centre de Commandement
                </h3>
                <p className="text-gray-300 text-sm">Gestion stratégique et coordination des réponses aux incidents</p>
              </div>
              
              <div className="bg-purple-900/40 p-4 rounded-lg border border-purple-700/50">
                <h3 className="text-purple-300 font-medium mb-2 flex items-center">
                  <Microscope className="mr-2 h-5 w-5" />
                  Laboratoire d'Analyse
                </h3>
                <p className="text-gray-300 text-sm">Analyse technique des logiciels malveillants et forensique numérique</p>
              </div>
              
              <div className="bg-red-900/40 p-4 rounded-lg border border-red-700/50">
                <h3 className="text-red-300 font-medium mb-2 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Salle de Crise
                </h3>
                <p className="text-gray-300 text-sm">Gestion d'urgence pendant un incident de sécurité actif</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center my-8">
            <Button 
              onClick={() => setCurrentPhase(Phase.SELECTION)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg"
            >
              Commencer la simulation
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  };
  
  // Rendu de la phase de sélection
  const renderSelectionPhase = () => {
    return (
      <div className="relative w-full min-h-[calc(100vh-128px)] bg-gradient-to-b from-gray-900 to-blue-900 py-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto px-4"
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-4">Sélection de l'Environnement Virtuel</h1>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Choisissez l'environnement dans lequel vous souhaitez mener votre mission de cybersécurité.
              Chaque environnement présente des défis uniques et requiert différentes compétences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-xl overflow-hidden shadow-xl border border-blue-800/40"
            >
              <div className="h-48 bg-blue-800/30 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Command className="h-20 w-20 text-blue-500/50" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900 to-transparent h-24"></div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-blue-300 mb-2">Centre de Commandement</h3>
                <p className="text-base text-gray-300 mb-4">
                  Coordonnez la réponse à une menace émergente depuis le centre névralgique de la cybersécurité de l'entreprise.
                </p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-400">
                    <Shield className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Accent sur la stratégie et la coordination</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <User className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Interaction avec Sarah Chen, Directrice SOC</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <BarChart2 className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Difficulté: Modérée</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    form.setValue("virtualEnvironment", "command-center");
                    startSession(form.getValues());
                    handlePhaseChange(Phase.BRIEFING);
                  }}
                  className="w-full bg-blue-700 hover:bg-blue-600"
                >
                  Sélectionner
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-900 to-purple-950 rounded-xl overflow-hidden shadow-xl border border-purple-800/40"
            >
              <div className="h-48 bg-purple-800/30 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Microscope className="h-20 w-20 text-purple-500/50" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-900 to-transparent h-24"></div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-purple-300 mb-2">Laboratoire d'Analyse</h3>
                <p className="text-base text-gray-300 mb-4">
                  Analysez des malwares sophistiqués et menez l'enquête technique sur une intrusion avancée.
                </p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-400">
                    <Code className="h-4 w-4 mr-2 text-purple-500" />
                    <span>Accent sur l'analyse technique et forensique</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <User className="h-4 w-4 mr-2 text-purple-500" />
                    <span>Interaction avec Alex Dupont, Expert Malware</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <BarChart2 className="h-4 w-4 mr-2 text-purple-500" />
                    <span>Difficulté: Élevée</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    form.setValue("virtualEnvironment", "analysis-lab");
                    startSession(form.getValues());
                    handlePhaseChange(Phase.BRIEFING);
                  }}
                  className="w-full bg-purple-700 hover:bg-purple-600"
                >
                  Sélectionner
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-red-900 to-red-950 rounded-xl overflow-hidden shadow-xl border border-red-800/40"
            >
              <div className="h-48 bg-red-800/30 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <AlertCircle className="h-20 w-20 text-red-500/50" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-900 to-transparent h-24"></div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-red-300 mb-2">Salle de Crise</h3>
                <p className="text-base text-gray-300 mb-4">
                  Gérez un incident de sécurité majeur en cours avec des systèmes critiques compromis.
                </p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-400">
                    <Activity className="h-4 w-4 mr-2 text-red-500" />
                    <span>Accent sur la gestion de crise et la mitigation</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <User className="h-4 w-4 mr-2 text-red-500" />
                    <span>Interaction avec Malik Johnson, CISO</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <BarChart2 className="h-4 w-4 mr-2 text-red-500" />
                    <span>Difficulté: Très élevée</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    form.setValue("virtualEnvironment", "crisis-room");
                    startSession(form.getValues());
                    handlePhaseChange(Phase.BRIEFING);
                  }}
                  className="w-full bg-red-700 hover:bg-red-600"
                >
                  Sélectionner
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  };
  
  // Rendu de la phase de briefing
  const renderBriefingPhase = () => {
    // Définir l'environnement actif pour le briefing
    const environmentColors = {
      'command-center': 'bg-blue-900/70 border-blue-600/50 text-blue-200',
      'analysis-lab': 'bg-purple-900/70 border-purple-600/50 text-purple-200',
      'crisis-room': 'bg-red-900/70 border-red-600/50 text-red-200'
    };
    
    const environmentTitles = {
      'command-center': 'Centre de Commandement - Briefing de Mission',
      'analysis-lab': 'Laboratoire d\'Analyse - Briefing de Mission',
      'crisis-room': 'Salle de Crise - Briefing de Mission'
    };
    
    const environmentDescriptions = {
      'command-center': 'L\'entreprise TechSecure fait face à des menaces sophistiquées qui ciblent ses infrastructures critiques. Vous devez coordonner la réponse et protéger les actifs de l\'entreprise.',
      'analysis-lab': 'Un nouveau malware a été détecté dans les systèmes de l\'entreprise RéseauPlus. Votre mission est d\'analyser ce logiciel malveillant et de comprendre son fonctionnement.',
      'crisis-room': 'SecurBank subit actuellement une attaque active. Des systèmes critiques ont été compromis et vous devez gérer cette crise en temps réel.'
    };
    
    const environmentClass = environmentColors[activeEnvironment as keyof typeof environmentColors] || environmentColors['command-center'];
    const environmentTitle = environmentTitles[activeEnvironment as keyof typeof environmentTitles] || environmentTitles['command-center'];
    const environmentDescription = environmentDescriptions[activeEnvironment as keyof typeof environmentDescriptions] || environmentDescriptions['command-center'];
    
    return (
      <div className="relative w-full min-h-[calc(100vh-128px)] bg-gradient-to-b from-gray-900 to-blue-950 py-8 overflow-hidden">
        {/* Éléments d'arrière-plan animés */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 right-0 bottom-0 grid grid-cols-12 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-r border-blue-500/20 h-full"></div>
              ))}
            </div>
            <div className="absolute top-0 left-0 right-0 bottom-0 grid grid-rows-12 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-b border-blue-500/20 w-full"></div>
              ))}
            </div>
          </div>
          
          {/* Éléments animés pour donner une sensation tech */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              opacity: [0.5, 0.7, 0.5]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute top-20 right-32 w-32 h-32 rounded-full bg-blue-500/10 blur-xl"
          />
          
          <motion.div
            animate={{
              x: [0, 30, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute bottom-40 left-20 w-48 h-48 rounded-full bg-purple-500/10 blur-xl"
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto px-4 relative z-10"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{environmentTitle}</h1>
            <p className="text-gray-300 max-w-3xl mx-auto">{environmentDescription}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`rounded-xl overflow-hidden border shadow-lg p-6 ${environmentClass}`}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Info className="mr-2 h-5 w-5" />
                Contexte de la mission
              </h2>
              
              <div className="space-y-4 text-gray-200">
                <p>
                  {activeEnvironment === 'command-center' && (
                    "Suite à une série d'attaques ciblées contre plusieurs entreprises de votre secteur, TechSecure a détecté des activités suspectes sur ses réseaux. L'équipe de sécurité a besoin de votre expertise pour évaluer la situation et coordonner une réponse efficace."
                  )}
                  {activeEnvironment === 'analysis-lab' && (
                    "Un nouveau ransomware a été détecté dans les systèmes informatiques de RéseauPlus. Plusieurs postes de travail ont été infectés et l'équipe de sécurité a isolé des échantillons du malware pour analyse. Ils ont besoin de votre expertise pour comprendre le fonctionnement du malware et développer des contre-mesures."
                  )}
                  {activeEnvironment === 'crisis-room' && (
                    "SecurBank subit une attaque en cours qui a déjà compromis plusieurs systèmes critiques. Des transactions suspectes ont été détectées et certains services clients sont indisponibles. La direction a activé la cellule de crise et vous a désigné pour gérer la réponse à l'incident."
                  )}
                </p>
                <p>
                  {activeEnvironment === 'command-center' && (
                    "Des indicateurs de compromission (IoC) ont été identifiés sur certains serveurs. Le CERT-FR a également émis une alerte concernant un groupe APT qui utilise des techniques similaires à celles observées dans votre réseau."
                  )}
                  {activeEnvironment === 'analysis-lab' && (
                    "Le malware semble utiliser des techniques avancées d'évasion et de persistance. Les antivirus traditionnels ne le détectent pas, et il présente des caractéristiques qui suggèrent qu'il pourrait être lié à un groupe APT connu."
                  )}
                  {activeEnvironment === 'crisis-room' && (
                    "L'attaque semble sophistiquée et ciblée. Les premiers indicateurs suggèrent qu'il s'agit d'un groupe organisé qui a pu avoir accès au réseau pendant plusieurs semaines avant de déclencher l'attaque finale."
                  )}
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className={`rounded-xl overflow-hidden border shadow-lg p-6 ${environmentClass}`}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Objectifs
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Objectif principal</h3>
                  <p className="text-gray-200">
                    {activeEnvironment === 'command-center' && (
                      "Évaluer l'étendue de la menace et mettre en place une stratégie de défense complète pour protéger les actifs critiques de TechSecure."
                    )}
                    {activeEnvironment === 'analysis-lab' && (
                      "Analyser le ransomware, comprendre son fonctionnement et développer une méthode pour récupérer les fichiers chiffrés sans payer la rançon."
                    )}
                    {activeEnvironment === 'crisis-room' && (
                      "Contenir l'incident en cours, minimiser l'impact sur les opérations bancaires et restaurer les services critiques de manière sécurisée."
                    )}
                  </p>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Objectifs secondaires</h3>
                  <ul className="list-disc list-inside space-y-2 pl-2 text-gray-200">
                    {activeEnvironment === 'command-center' && (
                      <>
                        <li>Identifier les vecteurs d'attaque potentiels</li>
                        <li>Coordonner la réponse des différentes équipes</li>
                        <li>Établir un plan de communication avec les parties prenantes</li>
                        <li>Analyser les tendances de menaces pour anticiper les futures attaques</li>
                      </>
                    )}
                    {activeEnvironment === 'analysis-lab' && (
                      <>
                        <li>Identifier le vecteur d'infection initial</li>
                        <li>Comprendre les mécanismes de persistance utilisés</li>
                        <li>Analyser la structure de chiffrement et les algorithmes</li>
                        <li>Développer des outils de détection pour prévenir de futures infections</li>
                      </>
                    )}
                    {activeEnvironment === 'crisis-room' && (
                      <>
                        <li>Isoler les systèmes compromis pour limiter la propagation</li>
                        <li>Identifier l'étendue de la compromission</li>
                        <li>Établir une stratégie de communication avec les clients</li>
                        <li>Développer un plan de remédiation et de retour à la normale</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex justify-center mt-8"
          >
            <Button 
              onClick={() => handlePhaseChange(Phase.MISSION)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
            >
              Commencer la mission
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  };
  
  // Rendu de la phase de mission
  const renderMissionPhase = () => {
    // On récupère l'étape actuelle et ses interactions
    const activeStep = missionSteps[activeStepIndex] || missionSteps[0];
    
    let backgroundClass = '';
    let accentColor = '';
    
    switch (activeEnvironment) {
      case 'command-center':
        backgroundClass = 'bg-gradient-to-b from-gray-900 via-gray-900 to-blue-950';
        accentColor = 'border-blue-600 text-blue-400';
        break;
      case 'analysis-lab':
        backgroundClass = 'bg-gradient-to-b from-gray-900 via-gray-900 to-purple-950';
        accentColor = 'border-purple-600 text-purple-400';
        break;
      case 'crisis-room':
        backgroundClass = 'bg-gradient-to-b from-gray-900 via-gray-900 to-red-950';
        accentColor = 'border-red-600 text-red-400';
        break;
      default:
        backgroundClass = 'bg-gradient-to-b from-gray-900 via-gray-900 to-blue-950';
        accentColor = 'border-blue-600 text-blue-400';
    }
    
    return (
      <div className={`w-full h-[calc(100vh-128px)] ${backgroundClass} flex flex-col lg:flex-row overflow-hidden`}>
        {/* Barre latérale avec étapes de mission */}
        <div className="w-full lg:w-64 lg:min-h-full bg-gray-950 border-r border-gray-800 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-white font-medium">Étapes de mission</h2>
          </div>
          
          <div className="flex-grow overflow-y-auto">
            {missionSteps.map((step, index) => (
              <div 
                key={step.id}
                className={`border-l-4 p-3 mb-1 cursor-pointer transition-colors ${
                  index === activeStepIndex 
                    ? `${accentColor} bg-gray-900` 
                    : 'border-gray-700 hover:bg-gray-900 text-gray-400'
                } ${!step.unlocked && 'opacity-50'}`}
                onClick={() => step.unlocked && setActiveStepIndex(index)}
              >
                <div className="flex items-center">
                  {step.completed ? (
                    <div className="h-5 w-5 rounded-full bg-green-500 mr-2 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  ) : (
                    <div className={`h-5 w-5 rounded-full border ${step.unlocked ? 'border-gray-500' : 'border-gray-700'} mr-2`} />
                  )}
                  <span className={step.unlocked ? "text-gray-200" : "text-gray-600"}>{step.title}</span>
                </div>
                {index === activeStepIndex && (
                  <p className="text-xs text-gray-400 mt-1 pl-7">{step.description}</p>
                )}
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Progression de mission</span>
              <span className="text-xs text-gray-400">
                {missionSteps.filter(s => s.completed).length}/{missionSteps.length}
              </span>
            </div>
            <Progress 
              value={(missionSteps.filter(s => s.completed).length / missionSteps.length) * 100}
              className="h-2 bg-gray-800"
            />
          </div>
        </div>
        
        {/* Panneau principal d'interaction */}
        <div className="flex-grow flex flex-col overflow-hidden">
          {/* Interface de chat */}
          <div className="flex-grow overflow-hidden flex flex-col">
            <EnhancedChatInterface
              messages={messages}
              onMessagesUpdate={handleMessagesUpdate}
              onSuggestionSelect={(suggestion) => {
                // Implémenter la sélection de suggestion
              }}
              generateSuggestions={generateSuggestions}
              currentNPC={currentNPC}
              environment={activeEnvironment}
              timeRemaining={formatTime(timeRemaining)}
              skillAssessment={skillAssessment}
              showSuggestions={true}
            />
          </div>
        </div>
        
        {/* Panneau latéral droit (optionnel, affiché selon l'état) */}
        {showDocPanel && (
          <div className="w-80 lg:min-h-full bg-gray-950 border-l border-gray-800 flex flex-col overflow-y-auto">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-white font-medium">Documents</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowDocPanel(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4">
              {discoveredDocuments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Aucun document découvert</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {discoveredDocuments.map(doc => (
                    <div 
                      key={doc.id} 
                      className="p-3 border border-gray-800 rounded-lg bg-gray-900 hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center mb-2">
                        {doc.type === 'rapport' && <FileText className="h-4 w-4 mr-2 text-blue-400" />}
                        {doc.type === 'email' && <Mail className="h-4 w-4 mr-2 text-green-400" />}
                        {doc.type === 'log' && <Terminal className="h-4 w-4 mr-2 text-amber-400" />}
                        {doc.type === 'schema' && <Layers className="h-4 w-4 mr-2 text-purple-400" />}
                        {doc.type === 'memo' && <FileText className="h-4 w-4 mr-2 text-gray-400" />}
                        <span className="text-sm font-medium text-gray-200">{doc.title}</span>
                      </div>
                      <p className="text-xs text-gray-400">{doc.content.substring(0, 50)}...</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Boutons flottants pour les actions */}
        <div className="absolute bottom-6 right-6 flex flex-col space-y-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-gray-900/80 backdrop-blur-sm h-10 w-10 rounded-full shadow-lg border-gray-700"
            onClick={() => setShowDocPanel(!showDocPanel)}
          >
            <FileText className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="bg-gray-900/80 backdrop-blur-sm h-10 w-10 rounded-full shadow-lg border-gray-700"
            onClick={() => setShowSkillsPanel(!showSkillsPanel)}
          >
            <BarChart3 className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Modal pour le tableau de compétences */}
        <Dialog open={showSkillsPanel} onOpenChange={setShowSkillsPanel}>
          <DialogContent className="bg-gray-900 border-gray-800 text-gray-100">
            <DialogHeader>
              <DialogTitle>Évaluation des compétences</DialogTitle>
              <DialogDescription className="text-gray-400">
                Progression actuelle de vos compétences dans cette mission
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Compétences techniques</span>
                  <span className="text-sm font-medium">{skillAssessment.technical}%</span>
                </div>
                <Progress value={skillAssessment.technical} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Compétences analytiques</span>
                  <span className="text-sm font-medium">{skillAssessment.analytical}%</span>
                </div>
                <Progress value={skillAssessment.analytical} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Compétences stratégiques</span>
                  <span className="text-sm font-medium">{skillAssessment.strategic}%</span>
                </div>
                <Progress value={skillAssessment.strategic} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Compétences de communication</span>
                  <span className="text-sm font-medium">{skillAssessment.communication}%</span>
                </div>
                <Progress value={skillAssessment.communication} className="h-2" />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowSkillsPanel(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Modal d'interruption dramatique */}
        <Dialog open={showInterruption} onOpenChange={setShowInterruption}>
          <DialogContent className="bg-red-950 border-red-800 text-gray-100 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-red-300 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-red-400" />
                ALERTE PRIORITAIRE
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-lg text-gray-200 mb-4">{interruptionContent}</p>
              <p className="text-sm text-gray-400">Cette situation nécessite une attention immédiate et peut modifier vos priorités de mission.</p>
            </div>
            
            <DialogFooter>
              <Button 
                className="bg-red-700 hover:bg-red-600" 
                onClick={handleInterruptionClose}
              >
                Prendre en compte
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Zone de notifications */}
        <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
          <AnimatePresence>
            {notifications.map(notification => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className={`p-3 rounded-lg shadow-lg ${
                  notification.urgent 
                    ? 'bg-red-900/90 border border-red-700' 
                    : 'bg-gray-800/90 border border-gray-700'
                } backdrop-blur-sm`}
              >
                <div className="flex items-start">
                  {notification.urgent ? (
                    <BellRing className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                  ) : (
                    <Info className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm text-gray-200">{notification.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };
  
  // Rendu de la phase d'évaluation
  const renderEvaluationPhase = () => {
    return (
      <div className="w-full min-h-[calc(100vh-128px)] bg-gradient-to-b from-gray-900 to-indigo-950 py-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto px-4 relative z-10"
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-4">Évaluation de Mission</h1>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Félicitations pour avoir complété votre mission. Voici l'évaluation détaillée de vos performances.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-xl"
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <BarChart3 className="mr-2 h-6 w-6 text-blue-400" />
                Évaluation des compétences
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Compétences techniques</span>
                    <span className="text-blue-300 font-medium">{skillAssessment.technical}%</span>
                  </div>
                  <div className="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${skillAssessment.technical}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {skillAssessment.technical < 30 && "Besoin d'amélioration dans l'application des concepts techniques."}
                    {skillAssessment.technical >= 30 && skillAssessment.technical < 60 && "Bonne compréhension des concepts techniques, mais peut s'améliorer dans leur application."}
                    {skillAssessment.technical >= 60 && skillAssessment.technical < 85 && "Excellente maîtrise technique avec une bonne application pratique."}
                    {skillAssessment.technical >= 85 && "Expertise technique exceptionnelle avec application stratégique des concepts."}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Compétences analytiques</span>
                    <span className="text-purple-300 font-medium">{skillAssessment.analytical}%</span>
                  </div>
                  <div className="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${skillAssessment.analytical}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                      className="h-full bg-purple-500 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {skillAssessment.analytical < 30 && "Besoin de développer davantage la capacité d'analyse des problèmes."}
                    {skillAssessment.analytical >= 30 && skillAssessment.analytical < 60 && "Bonne capacité d'analyse, mais peut améliorer la profondeur de l'examen."}
                    {skillAssessment.analytical >= 60 && skillAssessment.analytical < 85 && "Excellente analyse avec identification précise des problèmes clés."}
                    {skillAssessment.analytical >= 85 && "Capacité d'analyse exceptionnelle avec une compréhension complète des enjeux."}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Compétences stratégiques</span>
                    <span className="text-amber-300 font-medium">{skillAssessment.strategic}%</span>
                  </div>
                  <div className="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${skillAssessment.strategic}%` }}
                      transition={{ duration: 1, delay: 0.6 }}
                      className="h-full bg-amber-500 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {skillAssessment.strategic < 30 && "Besoin de développer une vision plus stratégique et à long terme."}
                    {skillAssessment.strategic >= 30 && skillAssessment.strategic < 60 && "Bonnes bases stratégiques, mais manque parfois de vision globale."}
                    {skillAssessment.strategic >= 60 && skillAssessment.strategic < 85 && "Excellent sens stratégique avec une bonne anticipation."}
                    {skillAssessment.strategic >= 85 && "Vision stratégique exceptionnelle avec une excellente planification."}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Compétences de communication</span>
                    <span className="text-green-300 font-medium">{skillAssessment.communication}%</span>
                  </div>
                  <div className="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${skillAssessment.communication}%` }}
                      transition={{ duration: 1, delay: 0.8 }}
                      className="h-full bg-green-500 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {skillAssessment.communication < 30 && "Besoin d'améliorer la clarté et l'efficacité de la communication."}
                    {skillAssessment.communication >= 30 && skillAssessment.communication < 60 && "Communication claire, mais pourrait être plus percutante."}
                    {skillAssessment.communication >= 60 && skillAssessment.communication < 85 && "Excellente communication avec une bonne adaptation aux interlocuteurs."}
                    {skillAssessment.communication >= 85 && "Communication exceptionnelle, précise et adaptée à tous les contextes."}
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-xl"
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <MessageCircle className="mr-2 h-6 w-6 text-green-400" />
                Feedback d'experts
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full bg-blue-900 flex items-center justify-center text-blue-300 font-bold mr-3">
                    {activeEnvironment === 'command-center' ? 'SC' : activeEnvironment === 'analysis-lab' ? 'AD' : 'MJ'}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">
                      {activeEnvironment === 'command-center' && "Sarah Chen, Directrice SOC"}
                      {activeEnvironment === 'analysis-lab' && "Alex Dupont, Expert Malware"}
                      {activeEnvironment === 'crisis-room' && "Malik Johnson, CISO"}
                    </h3>
                    <p className="text-gray-300 text-sm mt-2">
                      {activeEnvironment === 'command-center' && "Vous avez démontré une bonne capacité à évaluer les menaces et à coordonner les actions. Votre approche méthodique a permis d'identifier rapidement les priorités et de mobiliser efficacement les ressources."}
                      {activeEnvironment === 'analysis-lab' && "Votre analyse technique du malware était approfondie et précise. Vous avez su identifier les mécanismes clés et proposer des solutions concrètes pour neutraliser la menace."}
                      {activeEnvironment === 'crisis-room' && "Face à cette crise, vous avez su garder votre sang-froid et prendre des décisions rapides mais réfléchies. Votre gestion de la communication avec les différentes parties prenantes était particulièrement efficace."}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full bg-purple-900 flex items-center justify-center text-purple-300 font-bold mr-3">
                    DG
                  </div>
                  <div>
                    <h3 className="text-white font-medium">David Garcia, Formateur Senior</h3>
                    <p className="text-gray-300 text-sm mt-2">
                      "Dans l'ensemble, votre performance démontre une bonne maîtrise des fondamentaux de la cybersécurité. 
                      Vous avez particulièrement brillé dans {
                        skillAssessment.technical > skillAssessment.analytical && 
                        skillAssessment.technical > skillAssessment.strategic && 
                        skillAssessment.technical > skillAssessment.communication
                          ? "la résolution technique des problèmes"
                          : skillAssessment.analytical > skillAssessment.technical && 
                            skillAssessment.analytical > skillAssessment.strategic && 
                            skillAssessment.analytical > skillAssessment.communication
                              ? "l'analyse des situations complexes"
                              : skillAssessment.strategic > skillAssessment.technical && 
                                skillAssessment.strategic > skillAssessment.analytical && 
                                skillAssessment.strategic > skillAssessment.communication
                                  ? "la planification stratégique"
                                  : "la communication et coordination d'équipe"
                      }. Pour progresser davantage, je vous recommande de vous concentrer sur {
                        skillAssessment.technical < skillAssessment.analytical && 
                        skillAssessment.technical < skillAssessment.strategic && 
                        skillAssessment.technical < skillAssessment.communication
                          ? "le développement de vos connaissances techniques"
                          : skillAssessment.analytical < skillAssessment.technical && 
                            skillAssessment.analytical < skillAssessment.strategic && 
                            skillAssessment.analytical < skillAssessment.communication
                              ? "l'amélioration de vos capacités d'analyse"
                              : skillAssessment.strategic < skillAssessment.technical && 
                                skillAssessment.strategic < skillAssessment.analytical && 
                                skillAssessment.strategic < skillAssessment.communication
                                  ? "le développement de votre vision stratégique"
                                  : "l'amélioration de vos compétences en communication"
                      }."
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-xl mb-12"
          >
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Target className="mr-2 h-6 w-6 text-red-400" />
              Domaines d'amélioration recommandés
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-red-900/50 flex items-center justify-center text-red-300 mr-3">
                  1
                </div>
                <div>
                  <h3 className="text-white font-medium">
                    {skillAssessment.technical < 60 && "Approfondissement technique"}
                    {skillAssessment.analytical < 60 && "Développement de l'analyse"}
                    {skillAssessment.strategic < 60 && "Vision stratégique"}
                    {skillAssessment.communication < 60 && "Communication efficace"}
                    {skillAssessment.technical >= 60 && skillAssessment.analytical >= 60 && 
                     skillAssessment.strategic >= 60 && skillAssessment.communication >= 60 && 
                     "Perfectionnement avancé"}
                  </h3>
                  <p className="text-gray-300 text-sm mt-1">
                    {skillAssessment.technical < 60 && "Approfondissez vos connaissances techniques en cybersécurité, notamment sur les outils d'analyse et de réponse aux incidents."}
                    {skillAssessment.analytical < 60 && "Développez votre capacité à analyser les situations complexes et à identifier les indicateurs de compromission."}
                    {skillAssessment.strategic < 60 && "Travaillez sur votre vision stratégique à long terme et votre capacité à anticiper les évolutions des menaces."}
                    {skillAssessment.communication < 60 && "Améliorez votre communication avec les différentes parties prenantes, en adaptant votre discours selon l'audience."}
                    {skillAssessment.technical >= 60 && skillAssessment.analytical >= 60 && 
                     skillAssessment.strategic >= 60 && skillAssessment.communication >= 60 && 
                     "Vous maîtrisez déjà les compétences essentielles. Concentrez-vous sur des domaines spécialisés comme la threat intelligence ou l'analyse forensique avancée."}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-amber-900/50 flex items-center justify-center text-amber-300 mr-3">
                  2
                </div>
                <div>
                  <h3 className="text-white font-medium">Expérimentation pratique</h3>
                  <p className="text-gray-300 text-sm mt-1">
                    Essayez d'autres environnements de simulation pour développer vos compétences dans différents contextes. Chaque environnement met l'accent sur des compétences spécifiques.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-green-900/50 flex items-center justify-center text-green-300 mr-3">
                  3
                </div>
                <div>
                  <h3 className="text-white font-medium">Formation continue</h3>
                  <p className="text-gray-300 text-sm mt-1">
                    La cybersécurité évolue constamment. Restez à jour avec les dernières tendances et technologies à travers des formations spécialisées et la veille technologique.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => setCurrentPhase(Phase.SELECTION)}
              className="bg-blue-700 hover:bg-blue-600"
            >
              Essayer un autre environnement
            </Button>
            
            <Link href="/cyber">
              <Button variant="outline">
                Retour aux modules
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  };

  // Ce rendu sera remplacé par le contenu de chaque phase
  const renderContent = () => {
    if (!isSessionActive || currentPhase === Phase.INTRO || currentPhase === Phase.SELECTION) {
      return renderPhaseContent();
    } else {
      return renderPhaseContent();
    }
  };

  return (
    <CyberLayout>
      <PageTitle title="AGENT IA IMMERSIF" />
      <div className="mb-2 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 bg-gray-950/80 backdrop-blur-sm py-2 shadow-md">
        <Link href="/cyber" className="inline-flex items-center text-[#46cada] hover:text-blue-600 transition-colors">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Retour à I AM CYBER
        </Link>
        
        <div className="flex items-center space-x-3">
          {currentPhase === Phase.MISSION && isSessionActive && (
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
                              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 font-medium shadow-lg rounded-lg text-base"
                            >
                              <Send className="mr-2 h-5 w-5" />
                              Démarrer la session immersive
                            </Button>
                            
                            {/* Information sur la session en dessous du bouton */}
                            <div className="mt-6 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-blue-900/40 rounded-lg p-5 border border-blue-700/30 shadow-lg">
                              <div className="flex items-center justify-center space-x-2">
                                <div className="bg-blue-600/20 p-2 rounded-full shrink-0">
                                  <Info className="h-5 w-5 text-blue-300" />
                                </div>
                                <p className="text-blue-200 text-center">
                                  <span className="font-medium text-blue-300">Information sur la session:</span> La session durera 10 minutes. Un rapport d'évaluation détaillé de vos compétences sera produit dans le centre de crise à la fin de la simulation.
                                </p>
                              </div>
                            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
          <div className="md:col-span-3 h-full">
            <EnhancedChatInterface 
              onMessagesUpdate={handleMessagesUpdate} 
              generateSuggestions={generateSuggestions}
              environmentContext={activeEnvironment}
            />
          </div>
          <div className="hidden md:block bg-gradient-to-b from-gray-900 to-blue-950/80 rounded-lg p-4 overflow-y-auto border border-blue-900/30 shadow-md my-3 mr-3">
            <h3 className="text-lg font-semibold text-white mb-4">
              Évaluation des compétences
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <Code className="h-4 w-4 mr-2 text-cyan-400" />
                    <span className="text-sm font-medium text-blue-200">Technique</span>
                  </div>
                  <span className="text-sm font-medium text-white px-1.5 py-0.5 bg-gray-800/80 rounded-md">{skillAssessment.technical}%</span>
                </div>
                <Progress 
                  value={skillAssessment.technical} 
                  className="h-3 bg-blue-950/50 rounded-full border border-blue-900/20" 
                  indicatorClassName="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full" 
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2 text-indigo-400" />
                    <span className="text-sm font-medium text-blue-200">Analytique</span>
                  </div>
                  <span className="text-sm font-medium text-white px-1.5 py-0.5 bg-gray-800/80 rounded-md">{skillAssessment.analytical}%</span>
                </div>
                <Progress 
                  value={skillAssessment.analytical} 
                  className="h-3 bg-blue-950/50 rounded-full border border-blue-900/20" 
                  indicatorClassName="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" 
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-violet-400" />
                    <span className="text-sm font-medium text-blue-200">Stratégique</span>
                  </div>
                  <span className="text-sm font-medium text-white px-1.5 py-0.5 bg-gray-800/80 rounded-md">{skillAssessment.strategic}%</span>
                </div>
                <Progress 
                  value={skillAssessment.strategic} 
                  className="h-3 bg-blue-950/50 rounded-full border border-blue-900/20" 
                  indicatorClassName="bg-gradient-to-r from-violet-500 to-violet-600 rounded-full" 
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2 text-emerald-400" />
                    <span className="text-sm font-medium text-blue-200">Communication</span>
                  </div>
                  <span className="text-sm font-medium text-white px-1.5 py-0.5 bg-gray-800/80 rounded-md">{skillAssessment.communication}%</span>
                </div>
                <Progress 
                  value={skillAssessment.communication} 
                  className="h-3 bg-blue-950/50 rounded-full border border-blue-900/20" 
                  indicatorClassName="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full" 
                />
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gradient-to-br from-gray-800/90 to-blue-950/90 rounded-lg border border-blue-900/30 shadow-md">
              <h4 className="text-sm font-medium text-blue-300 mb-3">
                Expert actuel
              </h4>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white font-bold border-2 border-blue-500/30 shadow-md">
                  {currentNPC.split(' ')[0][0]}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{currentNPC}</p>
                  <p className="text-xs text-blue-300">
                    Expert en cybersécurité
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={completeSession}
              className="w-full mt-8 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white border border-red-700/50 shadow-md py-2"
              variant="outline"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Terminer la session
            </Button>
          </div>
        </div>
      )}
    </CyberLayout>
  );
}