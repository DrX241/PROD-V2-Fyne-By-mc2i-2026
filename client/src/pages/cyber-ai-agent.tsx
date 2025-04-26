import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CyberLayout from "@/components/layout/CyberLayout";
import EnhancedChatInterface from "@/components/cyber/EnhancedChatInterface";
import PageTitle from "@/components/utils/PageTitle";
import { Link } from "wouter";
import { 
  ArrowLeft, Clock, Mail, AreaChart, Send, Command, Microscope, AlertCircle, 
  Bot, Info, Code, BarChart3, Shield, MessageCircle, User, LogOut
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

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
  const [currentNPC, setCurrentNPC] = useState<string>("SOC Analyst");
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
                      <h3 className="text-2xl font-bold text-white">
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
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {/* CARTE #1: CENTRE DE COMMANDEMENT */}
                                    <motion.div
                                      whileHover={{ y: -8, scale: 1.02 }}
                                      transition={{ duration: 0.3 }}
                                      className={`relative overflow-hidden rounded-xl border-2 p-0 h-[260px] cursor-pointer group
                                        ${field.value === "command-center" 
                                          ? "border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/20" 
                                          : "border-gray-700/50 shadow-md hover:shadow-lg hover:shadow-cyan-900/20"
                                        }`}
                                      onClick={() => field.onChange("command-center")}
                                    >
                                      {/* Arrière-plan avec overlay gradient */}
                                      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/30 via-blue-900/40 to-gray-900/90 z-10"></div>
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
                                        <div className="mt-auto p-5">
                                          <div className="mb-4 bg-cyan-700/70 p-3 rounded-lg w-min">
                                            <Command className="h-8 w-8 text-cyan-200" />
                                          </div>
                                          <h3 className="font-bold text-xl text-white mb-2">Centre de Commandement</h3>
                                          <p className="text-sm text-cyan-100/80 line-clamp-2 group-hover:line-clamp-none transition-all">
                                            Planification stratégique et coordination d'équipe pour répondre aux incidents cyber avancés.
                                          </p>
                                        </div>
                                      </div>
                                    </motion.div>
                                    
                                    {/* CARTE #2: LABORATOIRE D'ANALYSE */}
                                    <motion.div
                                      whileHover={{ y: -8, scale: 1.02 }}
                                      transition={{ duration: 0.3 }}
                                      className={`relative overflow-hidden rounded-xl border-2 p-0 h-[260px] cursor-pointer group
                                        ${field.value === "analysis-lab" 
                                          ? "border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/20" 
                                          : "border-gray-700/50 shadow-md hover:shadow-lg hover:shadow-indigo-900/20"
                                        }`}
                                      onClick={() => field.onChange("analysis-lab")}
                                    >
                                      {/* Arrière-plan avec overlay gradient */}
                                      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/30 via-indigo-900/40 to-gray-900/90 z-10"></div>
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
                                        <div className="mt-auto p-5">
                                          <div className="mb-4 bg-indigo-700/70 p-3 rounded-lg w-min">
                                            <Microscope className="h-8 w-8 text-indigo-200" />
                                          </div>
                                          <h3 className="font-bold text-xl text-white mb-2">Laboratoire d'Analyse</h3>
                                          <p className="text-sm text-indigo-100/80 line-clamp-2 group-hover:line-clamp-none transition-all">
                                            Investigation technique et analyse forensique pour découvrir les sources d'attaque.
                                          </p>
                                        </div>
                                      </div>
                                    </motion.div>
                                    
                                    {/* CARTE #3: SALLE DE CRISE */}
                                    <motion.div
                                      whileHover={{ y: -8, scale: 1.02 }}
                                      transition={{ duration: 0.3 }}
                                      className={`relative overflow-hidden rounded-xl border-2 p-0 h-[260px] cursor-pointer group
                                        ${field.value === "crisis-room" 
                                          ? "border-violet-500 ring-2 ring-violet-500/30 shadow-lg shadow-violet-500/20" 
                                          : "border-gray-700/50 shadow-md hover:shadow-lg hover:shadow-violet-900/20"
                                        }`}
                                      onClick={() => field.onChange("crisis-room")}
                                    >
                                      {/* Arrière-plan avec overlay gradient */}
                                      <div className="absolute inset-0 bg-gradient-to-b from-violet-900/30 via-violet-900/40 to-gray-900/90 z-10"></div>
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
                                        <div className="mt-auto p-5">
                                          <div className="mb-4 bg-violet-700/70 p-3 rounded-lg w-min">
                                            <AlertCircle className="h-8 w-8 text-violet-200" />
                                          </div>
                                          <h3 className="font-bold text-xl text-white mb-2">Salle de Crise</h3>
                                          <p className="text-sm text-violet-100/80 line-clamp-2 group-hover:line-clamp-none transition-all">
                                            Gestion d'incidents critiques et coordination de la réponse d'urgence sous pression.
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
                          </div>
                        </form>
                      </Form>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Information sur la session en bas de page (horizontal) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 max-w-6xl mx-auto"
          >
            <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-blue-900/40 rounded-lg p-5 border border-blue-700/30 shadow-lg">
              <div className="flex items-center justify-center space-x-2">
                <div className="bg-blue-600/20 p-2 rounded-full shrink-0">
                  <Info className="h-5 w-5 text-blue-300" />
                </div>
                <p className="text-blue-200 text-center">
                  <span className="font-medium text-blue-300">Information sur la session:</span> La session durera 10 minutes. Un rapport d'évaluation détaillé de vos compétences sera produit dans le centre de crise à la fin de la simulation.
                </p>
              </div>
            </div>
          </motion.div>
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
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <AreaChart className="mr-2 h-5 w-5 text-cyan-400" />
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
              <h4 className="text-sm font-medium text-blue-300 mb-3 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Expert actuel
              </h4>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white font-bold border-2 border-blue-500/30 shadow-md">
                  {currentNPC.split(' ')[0][0]}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{currentNPC}</p>
                  <p className="text-xs text-blue-300 flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
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