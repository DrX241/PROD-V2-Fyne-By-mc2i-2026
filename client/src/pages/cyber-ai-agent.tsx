import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CyberLayout from "@/components/layout/CyberLayout";
import EnhancedChatInterface from "@/components/cyber/EnhancedChatInterface";
import PageTitle from "@/components/utils/PageTitle";
import { Link } from "wouter";
import { ArrowLeft, Clock, Mail, AreaChart, Send, Command, Microscope, AlertCircle } from "lucide-react";
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
  userEmail: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  userName: z.string().min(2, {
    message: "Votre nom doit contenir au moins 2 caractères.",
  }),
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
      userEmail: "",
      userName: "",
      virtualEnvironment: "command-center",
    },
  });

  // Fonction pour démarrer la session
  const startSession = async (values: FormValues) => {
    try {
      const response = await apiRequest('/api/cyber/ai-agent/start', {
        method: 'POST',
        body: JSON.stringify({
          userEmail: values.userEmail,
          userName: values.userName,
          virtualEnvironment: values.virtualEnvironment
        })
      });
      
      if (response.success) {
        setSessionData({
          userEmail: values.userEmail,
          userName: values.userName,
          virtualEnvironment: values.virtualEnvironment,
          startTime: Date.now()
        });
        setActiveEnvironment(values.virtualEnvironment);
        setIsSessionActive(true);
        startTimeRef.current = Date.now();

        toast({
          title: "Session démarrée",
          description: "Votre session Agent IA Immersif a démarré. Un rapport sera envoyé à votre email à la fin.",
        });
      } else {
        console.warn("Réponse sans succès:", response);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: response?.error || "Impossible de démarrer la session. Veuillez réessayer.",
        });
      }
    } catch (error) {
      console.error("Erreur lors du démarrage de la session:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de démarrer la session. Veuillez réessayer.",
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
        // Option: ajouter notification visuelle subtile des compétences mises à jour
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des compétences:", error);
      // Continuer sans mise à jour des compétences si erreur
    }
  };

  // Fonction pour terminer la session et envoyer le rapport
  const completeSession = async () => {
    if (!sessionData) return;

    const duration = Date.now() - startTimeRef.current;
    
    try {
      const response = await apiRequest('/api/cyber/ai-agent/complete', {
        method: 'POST',
        body: JSON.stringify({
          userEmail: sessionData.userEmail,
          userName: sessionData.userName,
          messages, // Historique complet des messages
          duration, // Durée en millisecondes
          skillAssessment // État final des compétences
        })
      });
      
      if (response.success) {
        toast({
          title: "Session terminée",
          description: "Un rapport d'évaluation personnalisé a été envoyé à votre adresse email.",
        });

        // Réinitialiser la session
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
        console.warn("Réponse sans succès (complete):", response);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: response?.error || "Impossible d'envoyer le rapport. Veuillez contacter le support.",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la finalisation de la session:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le rapport. Veuillez contacter le support.",
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
    
    // Si un nouveau message de l'utilisateur a été ajouté
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
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Agent IA Immersif</h2>
                <p className="text-blue-200 mb-6">
                  Plongez dans une expérience d'apprentissage avancée en cybersécurité avec évaluation des compétences en temps réel.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-900/30 border border-blue-800/60 rounded-lg p-3 text-center">
                    <Command className="h-8 w-8 mx-auto mb-2 text-cyan-400" />
                    <h3 className="font-medium text-white text-sm">Centre de commandement</h3>
                  </div>
                  <div className="bg-blue-900/30 border border-blue-800/60 rounded-lg p-3 text-center">
                    <Microscope className="h-8 w-8 mx-auto mb-2 text-indigo-400" />
                    <h3 className="font-medium text-white text-sm">Laboratoire d'analyse</h3>
                  </div>
                  <div className="bg-blue-900/30 border border-blue-800/60 rounded-lg p-3 text-center">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                    <h3 className="font-medium text-white text-sm">Salle de crise</h3>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-900/60 to-indigo-900/60 rounded-lg p-4 border border-blue-700/50">
                  <p className="text-sm text-blue-200">
                    La session durera 10 minutes. Un rapport d'évaluation détaillé de vos compétences sera envoyé à l'adresse email indiquée.
                  </p>
                </div>
              </motion.div>
            </div>
            
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-gray-900 to-blue-950 border border-blue-800/80 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl text-white">Configuration de la session</CardTitle>
                    <CardDescription className="text-blue-200">
                      Entrez vos informations pour personnaliser l'expérience
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(startSession)} className="space-y-5">
                        <FormField
                          control={form.control}
                          name="userEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-100 font-medium">Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                                  <Input 
                                    placeholder="votre.email@exemple.com" 
                                    className="pl-10 bg-blue-900/40 border-blue-700/80 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="userName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-100 font-medium">Nom complet</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Prénom Nom" 
                                  className="bg-blue-900/40 border-blue-700/80 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="virtualEnvironment"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-blue-100 font-medium">Environnement virtuel</FormLabel>
                              <FormControl>
                                <Tabs
                                  defaultValue="command-center"
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  className="w-full"
                                >
                                  <TabsList className="grid grid-cols-3 w-full bg-gray-800 border border-blue-800/40 p-1">
                                    <TabsTrigger 
                                      value="command-center" 
                                      className="data-[state=active]:bg-blue-700 data-[state=active]:text-white text-gray-300 px-3 py-1.5"
                                    >
                                      <Command className="h-4 w-4 mr-2" />
                                      <span className="hidden sm:inline">Centre de commandement</span>
                                      <span className="inline sm:hidden">Centre</span>
                                    </TabsTrigger>
                                    <TabsTrigger 
                                      value="analysis-lab" 
                                      className="data-[state=active]:bg-indigo-700 data-[state=active]:text-white text-gray-300 px-3 py-1.5"
                                    >
                                      <Microscope className="h-4 w-4 mr-2" />
                                      <span className="hidden sm:inline">Laboratoire d'analyse</span>
                                      <span className="inline sm:hidden">Labo</span>
                                    </TabsTrigger>
                                    <TabsTrigger 
                                      value="crisis-room" 
                                      className="data-[state=active]:bg-purple-700 data-[state=active]:text-white text-gray-300 px-3 py-1.5"
                                    >
                                      <AlertCircle className="h-4 w-4 mr-2" />
                                      <span className="hidden sm:inline">Salle de crise</span>
                                      <span className="inline sm:hidden">Crise</span>
                                    </TabsTrigger>
                                  </TabsList>
                                  <TabsContent value="command-center" className="mt-3 text-sm text-blue-200 bg-blue-900/20 p-3 rounded-md border border-blue-800/30">
                                    <p>Environnement idéal pour la planification stratégique et la coordination des équipes en cybersécurité.</p>
                                  </TabsContent>
                                  <TabsContent value="analysis-lab" className="mt-3 text-sm text-blue-200 bg-indigo-900/20 p-3 rounded-md border border-indigo-800/30">
                                    <p>Espace technique pour l'investigation d'incidents et l'analyse forensique approfondie.</p>
                                  </TabsContent>
                                  <TabsContent value="crisis-room" className="mt-3 text-sm text-blue-200 bg-purple-900/20 p-3 rounded-md border border-purple-800/30">
                                    <p>Centre de gestion pour les incidents critiques nécessitant une réponse rapide et coordonnée.</p>
                                  </TabsContent>
                                </Tabs>
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        <div className="pt-2">
                          <Button 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 font-medium shadow-lg"
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Démarrer la session immersive
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-160px)]">
          <div className="md:col-span-3 h-full">
            <EnhancedChatInterface 
              onMessagesUpdate={handleMessagesUpdate} 
              generateSuggestions={generateSuggestions}
              environmentContext={activeEnvironment}
            />
          </div>
          <div className="hidden md:block bg-gray-900 rounded-lg p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <AreaChart className="mr-2 h-5 w-5" />
              Évaluation des compétences
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-blue-200">Technique</span>
                  <span className="text-sm font-medium text-white">{skillAssessment.technical}%</span>
                </div>
                <Progress value={skillAssessment.technical} className="h-2 bg-blue-950" indicatorClassName="bg-cyan-500" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-blue-200">Analytique</span>
                  <span className="text-sm font-medium text-white">{skillAssessment.analytical}%</span>
                </div>
                <Progress value={skillAssessment.analytical} className="h-2 bg-blue-950" indicatorClassName="bg-indigo-500" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-blue-200">Stratégique</span>
                  <span className="text-sm font-medium text-white">{skillAssessment.strategic}%</span>
                </div>
                <Progress value={skillAssessment.strategic} className="h-2 bg-blue-950" indicatorClassName="bg-violet-500" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-blue-200">Communication</span>
                  <span className="text-sm font-medium text-white">{skillAssessment.communication}%</span>
                </div>
                <Progress value={skillAssessment.communication} className="h-2 bg-blue-950" indicatorClassName="bg-emerald-500" />
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h4 className="text-sm font-medium text-blue-300 mb-2">Expert actuel</h4>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {currentNPC.split(' ')[0][0]}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{currentNPC}</p>
                  <p className="text-xs text-gray-400">Expert en cybersécurité</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={completeSession}
              className="w-full mt-8 bg-red-900 hover:bg-red-800 text-white"
            >
              Terminer la session
            </Button>
          </div>
        </div>
      )}
    </CyberLayout>
  );
}