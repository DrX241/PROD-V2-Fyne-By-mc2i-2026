import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserCircle, Send, Clock, CheckCircle, AlertCircle, FileCheck, ArrowLeft, Mail, User } from 'lucide-react';
import OpenAIStatusIndicator from '@/components/OpenAIStatusIndicator';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import HomeLayout from '@/components/layout/HomeLayout';

// Schéma de formulaire pour la configuration de l'entretien technique de cybersécurité
const formSchema = z.object({
  // Champs optionnels (peuvent être ignorés au début)
  trainerEmail: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }).optional().or(z.literal('')),
  candidateName: z.string().min(2, {
    message: "Le nom du candidat doit contenir au moins 2 caractères.",
  }).optional().or(z.literal('')),
  
  // Champs obligatoires pour la simulation
  profileType: z.string().min(1, {
    message: "Veuillez sélectionner un poste cible.",
  }),
  experienceLevel: z.string().min(1, {
    message: "Veuillez sélectionner un niveau d'expérience.",
  }),
});

// Schéma pour le formulaire de contact à la fin de la simulation (tous les champs sont obligatoires)
const contactFormSchema = z.object({
  // Champs de contact qui étaient optionnels au début, maintenant obligatoires
  trainerEmail: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  candidateName: z.string().min(2, {
    message: "Le nom du candidat doit contenir au moins 2 caractères.",
  }),
  
  // On inclut également les champs importants pour l'évaluation
  profileType: z.string().min(1, {
    message: "Veuillez sélectionner un poste cible.",
  }),
  experienceLevel: z.string().min(1, {
    message: "Veuillez sélectionner un niveau d'expérience.",
  }),
});

// Types d'inférence pour les schémas de formulaire
type FormValues = z.infer<typeof formSchema>;
type ContactFormValues = z.infer<typeof contactFormSchema>;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const CyberInterviewSimulation: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('configuration');
  
  // États pour la simulation
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes en secondes
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [isSkippedInfo, setIsSkippedInfo] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  
  // Référence pour le défilement
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Effet pour faire défiler vers le bas à chaque nouveau message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Effet pour le compte à rebours
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isSimulationActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            if (!simulationComplete) {
              completeSimulation();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSimulationActive, timeRemaining, simulationComplete]);
  
  // Formatage du temps restant
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Configuration du formulaire
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trainerEmail: '',
      candidateName: '',
      profileType: '',
      experienceLevel: '',
    },
  });
  
  // Configuration du formulaire de contact
  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      trainerEmail: '',
      candidateName: '',
      profileType: form.getValues('profileType') || '',
      experienceLevel: form.getValues('experienceLevel') || '',
    },
  });
  
  // Démarrage de la simulation
  const startSimulation = async (values: FormValues) => {
    setIsLoading(true);
    
    // Vérifier si les informations ont été ignorées
    if (!values.trainerEmail || !values.candidateName) {
      setIsSkippedInfo(true);
    } else {
      setIsSkippedInfo(false);
    }
    
    try {
      const response = await fetch('/api/cyber/interview-simulation/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'cyber',
          ...values,
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du démarrage de la simulation');
      }
      
      const data = await response.json();
      
      // Ajouter le message initial de l'assistant
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: data.initialMessage || "Bonjour, je suis le recruteur technique pour le poste que vous visez. Pour commencer cet entretien, pourriez-vous me présenter votre parcours et vos compétences en cybersécurité?",
          timestamp: new Date(),
        },
      ]);
      
      setIsSimulationActive(true);
      setActiveTab('simulation');
      
      // Démarrer le timer
      setTimeRemaining(600); // 10 minutes en secondes
      
      toast({
        title: "Entretien démarré",
        description: "L'entretien technique a commencé. Vous avez 10 minutes.",
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de démarrer la simulation. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour ignorer la saisie des informations de contact (uniquement email et nom)
  const skipInfoAndStart = async () => {
    console.log("Bouton Ignorer cliqué");
    setIsSkippedInfo(true);
    
    // Récupérer les valeurs obligatoires
    const profileType = form.getValues('profileType');
    const experienceLevel = form.getValues('experienceLevel');
    
    // Vérifier que tous les champs obligatoires sont remplis
    if (!profileType || !experienceLevel) {
      toast({
        variant: "destructive",
        title: "Champs obligatoires manquants",
        description: "Les champs Type de profil et Niveau d'expérience sont obligatoires."
      });
      return;
    }
    
    // Appel direct à l'API sans passer par la validation complète du formulaire
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cyber/interview-simulation/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'cyber',
          profileType,
          experienceLevel
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du démarrage de la simulation');
      }
      
      const data = await response.json();
      
      // Ajouter le message initial de l'assistant
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: data.initialMessage || "Bonjour, je suis le recruteur technique pour le poste que vous visez. Pour commencer cet entretien, pourriez-vous me présenter votre parcours et vos compétences en cybersécurité?",
          timestamp: new Date(),
        },
      ]);
      
      setIsSimulationActive(true);
      setActiveTab('simulation');
      
      // Démarrer le timer
      setTimeRemaining(600); // 10 minutes en secondes
      
      toast({
        title: "Simulation démarrée",
        description: "L'entretien technique a commencé. Vous avez 10 minutes.",
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de démarrer la simulation. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Envoi d'un message
  const sendMessage = async () => {
    if (!userInput.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: userInput,
      timestamp: new Date(),
    };
    
    // Ajouter immédiatement le message de l'utilisateur
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cyber/interview-simulation/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'cyber',
          message: userMessage.content,
          profileType: form.getValues('profileType'),
          experienceLevel: form.getValues('experienceLevel'),
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }
      
      const data = await response.json();
      
      const assistantMessage = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: data.response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Finalisation de la simulation
  const completeSimulation = async () => {
    if (simulationComplete) return;
    
    // Vérifier si toutes les informations nécessaires sont disponibles
    if (isSkippedInfo) {
      setShowContactForm(true);
      return;
    }
    
    await finalizeSimulation();
  };
  
  // Finalisation effective de la simulation
  const finalizeSimulation = async () => {
    setIsLoading(true);
    
    const trainerEmail = form.getValues('trainerEmail');
    const candidateName = form.getValues('candidateName');
    const profileType = form.getValues('profileType');
    const experienceLevel = form.getValues('experienceLevel');
    
    try {
      const response = await fetch('/api/cyber/interview-simulation/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'cyber',
          trainerEmail,
          candidateName,
          profileType,
          experienceLevel,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          duration: 600 - timeRemaining,
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la finalisation de la simulation');
      }
      
      const data = await response.json();
      
      setEvaluationResult(data.evaluation);
      setSimulationComplete(true);
      setActiveTab('evaluation');
      
      toast({
        title: "Simulation terminée",
        description: "L'évaluation de l'entretien est disponible.",
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de finaliser la simulation. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Réinitialisation de la simulation
  const resetSimulation = () => {
    setIsSimulationActive(false);
    setSimulationComplete(false);
    setMessages([]);
    setTimeRemaining(600);
    setActiveTab('configuration');
    setEvaluationResult(null);
    setIsSkippedInfo(false);
    form.reset();
  };
  
  return (
    <HomeLayout>
      {/* Dialogue pour saisir les informations de contact à la fin de la simulation */}
      <AlertDialog open={showContactForm} onOpenChange={setShowContactForm}>
        <AlertDialogContent className="bg-gray-800 text-white border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Informations pour finaliser la simulation</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Veuillez remplir tous les champs ci-dessous pour finaliser la simulation et recevoir l'évaluation par email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <Form {...contactForm}>
            <form onSubmit={contactForm.handleSubmit((data) => {
              // Transférer toutes les données du contactForm vers le form principal
              form.setValue('trainerEmail', data.trainerEmail);
              form.setValue('candidateName', data.candidateName);
              form.setValue('profileType', data.profileType);
              form.setValue('experienceLevel', data.experienceLevel);
              
              // Fermer et finaliser
              setShowContactForm(false);
              finalizeSimulation();
            })} className="space-y-4 my-4">
              {/* Informations de contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Informations de contact</h3>
                
                <FormField
                  control={contactForm.control}
                  name="trainerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email du formateur</FormLabel>
                      <FormControl>
                        <Input placeholder="email@exemple.com" {...field} className="bg-gray-700 border-gray-600 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={contactForm.control}
                  name="candidateName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Nom du consultant</FormLabel>
                      <FormControl>
                        <Input placeholder="Prénom Nom" {...field} className="bg-gray-700 border-gray-600 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Paramètres de profil */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Paramètres de profil</h3>
                
                <FormField
                  control={contactForm.control}
                  name="profileType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Type de profil</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Sélectionnez un profil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-700 border-gray-600 text-white">
                          <SelectItem value="analyste_soc">Analyste SOC</SelectItem>
                          <SelectItem value="pentester">Pentester</SelectItem>
                          <SelectItem value="responsable_securite">Responsable Sécurité</SelectItem>
                          <SelectItem value="consultant_cybersecurite">Consultant Cybersécurité</SelectItem>
                          <SelectItem value="ingenieur_securite">Ingénieur Sécurité</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={contactForm.control}
                  name="experienceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Niveau d'expérience</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Sélectionnez un niveau" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-700 border-gray-600 text-white">
                          <SelectItem value="junior">Junior (0-2 ans)</SelectItem>
                          <SelectItem value="intermediaire">Intermédiaire (3-5 ans)</SelectItem>
                          <SelectItem value="senior">Senior (6-9 ans)</SelectItem>
                          <SelectItem value="expert">Expert (10+ ans)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <AlertDialogFooter className="gap-2 mt-6">
                <Button
                  type="submit" 
                  className="bg-[#006a9e] hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Chargement..." : "Soumettre et finaliser"}
                </Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black text-white p-4">
        {/* En-tête style CYBER ACADÉMIE */}
        <div className="container mx-auto">
          <div className="flex items-center mb-2">
            <Button 
              variant="ghost" 
              className="text-white hover:text-white hover:bg-blue-900/30 mr-4"
              onClick={() => navigate('/cyber')}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour
            </Button>
            <h1 className="text-xl md:text-2xl font-bold font-[Exo_2]">CYBER ENTRETIEN</h1>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold font-[Rajdhani]">Simulation d'entretien technique</h1>
              <p className="text-blue-200 mt-1">Entraînez-vous à un entretien d'embauche réaliste en cybersécurité</p>
            </div>
          </div>
        </div>
        
        {/* Description du module */}
        <div className="container mx-auto max-w-6xl bg-blue-900/20 backdrop-blur-sm rounded-lg p-6 mb-8 border border-blue-800/40">
          <h2 className="text-2xl font-bold mb-4 font-[Rajdhani]">Préparation d'entretien technique</h2>
          <p className="text-blue-100 max-w-4xl">
            Cette simulation vous permet de vous entraîner à un entretien d'embauche technique en cybersécurité avec un recruteur spécialisé, simulé par une IA rigoureuse qui évaluera vos compétences techniques et votre cohérence. L'entretien dure 10 minutes et est suivi d'une évaluation détaillée.
          </p>
        </div>
          
        {/* L'indicateur de statut OpenAI est maintenant affiché dans le Header */}
        
        {isSimulationActive && !simulationComplete && (
          <div className="fixed top-4 right-4 z-50 flex items-center p-2 rounded-md shadow-lg bg-blue-900/80 border border-blue-700">
            <Clock className="w-5 h-5 mr-2 text-white" />
            <span className="font-mono text-white">{formatTime(timeRemaining)}</span>
          </div>
        )}
        
        <Tabs 
          defaultValue="configuration" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-4xl mx-auto"
        >
          <TabsList className="grid grid-cols-3 mb-8 bg-blue-950/60">
            <TabsTrigger 
              value="configuration"
              disabled={isSimulationActive && !simulationComplete}
              className="text-white data-[state=active]:bg-blue-700"
            >
              Configuration
            </TabsTrigger>
            <TabsTrigger 
              value="simulation"
              disabled={!isSimulationActive}
              className="text-white data-[state=active]:bg-blue-700"
            >
              Simulation
            </TabsTrigger>
            <TabsTrigger 
              value="evaluation"
              disabled={!simulationComplete}
              className="text-white data-[state=active]:bg-blue-700"
            >
              Évaluation
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="configuration">
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader>
                <CardTitle className="font-[Rajdhani]">Configuration de l'entretien technique</CardTitle>
                <CardDescription className="text-blue-300">
                  Configurez les paramètres de la simulation d'entretien d'embauche
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(startSimulation)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="trainerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-100">Votre email (pour recevoir l'évaluation)</FormLabel>
                            <FormControl>
                              <Input placeholder="email@exemple.com" {...field} className="bg-blue-950/40 border-blue-800 text-white placeholder:text-blue-400" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="candidateName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-100">Votre nom</FormLabel>
                            <FormControl>
                              <Input placeholder="Nom complet" {...field} className="bg-blue-950/40 border-blue-800 text-white placeholder:text-blue-400" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="profileType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-100">Poste visé *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-blue-950/40 border-blue-800 text-white">
                                  <SelectValue placeholder="Sélectionnez un poste" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-blue-950 border-blue-800 text-white">
                                <SelectItem value="analyste_soc">Analyste SOC</SelectItem>
                                <SelectItem value="pentester">Pentester</SelectItem>
                                <SelectItem value="responsable_securite">Responsable Sécurité</SelectItem>
                                <SelectItem value="consultant_cybersecurite">Consultant Cybersécurité</SelectItem>
                                <SelectItem value="ingenieur_securite">Ingénieur Sécurité</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="experienceLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-100">Niveau d'expérience *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-blue-950/40 border-blue-800 text-white">
                                  <SelectValue placeholder="Sélectionnez un niveau" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-blue-950 border-blue-800 text-white">
                                <SelectItem value="junior">Junior (0-2 ans)</SelectItem>
                                <SelectItem value="intermediaire">Intermédiaire (3-5 ans)</SelectItem>
                                <SelectItem value="senior">Senior (6-9 ans)</SelectItem>
                                <SelectItem value="expert">Expert (10+ ans)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                        disabled={isLoading}
                      >
                        {isLoading ? "Chargement..." : "Démarrer la simulation"}
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outline"
                        className="flex-1 border-blue-800 bg-blue-950/40 hover:bg-blue-900/50 text-blue-200"
                        disabled={isLoading}
                        onClick={skipInfoAndStart}
                      >
                        Ignorer les informations de contact
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="simulation">
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="font-[Rajdhani]">Entretien technique en cours</CardTitle>
                  <div className={`flex items-center p-2 rounded-md ${
                    timeRemaining > 60 ? "bg-blue-800/60" : "bg-red-800/60"
                  } border border-blue-700`}>
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="font-mono">{formatTime(timeRemaining)}</span>
                  </div>
                </div>
                <CardDescription className="text-blue-300">
                  Vous êtes en entretien d'embauche avec un recruteur technique spécialisé en cybersécurité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 overflow-y-auto mb-4 bg-blue-950/60 backdrop-blur-sm rounded-md p-4 border border-blue-800/50">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-blue-400">
                      <p>La conversation va commencer...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div 
                          key={message.id}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white'
                                : 'bg-blue-900/50 border border-blue-800/50 text-white'
                            }`}
                          >
                            <div className="flex items-center mb-1">
                              {message.role === 'user' ? (
                                <>
                                  <span className="font-semibold">{form.getValues('candidateName') || 'Candidat'}</span>
                                  <span className="text-xs ml-2 text-blue-200">
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <UserCircle className="w-5 h-5 mr-1" />
                                  <span className="font-semibold">Recruteur</span>
                                  <span className="text-xs ml-2 text-blue-200">
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </>
                              )}
                            </div>
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="resize-none bg-blue-950/40 border-blue-800 text-white placeholder:text-blue-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={isLoading || simulationComplete || timeRemaining === 0}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !userInput.trim() || simulationComplete || timeRemaining === 0}
                    className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={completeSimulation}
                  disabled={isLoading || simulationComplete || messages.length < 3}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {isLoading ? "Chargement..." : "Terminer l'entretien"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="evaluation">
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader>
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-emerald-500" />
                  <CardTitle className="font-[Rajdhani]">Évaluation technique</CardTitle>
                </div>
                <CardDescription className="text-blue-300">
                  Analyse de vos compétences techniques démontrées pendant l'entretien
                </CardDescription>
              </CardHeader>
              <CardContent>
                {evaluationResult ? (
                  <div className="space-y-6">
                    <div className="bg-blue-950/60 border border-blue-800/50 p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-2 font-[Rajdhani]">Résumé de l'évaluation technique</h3>
                      <p className="text-blue-100">{evaluationResult.summary}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-950/60 border border-emerald-800/30 p-4 rounded-md">
                        <h3 className="text-lg font-semibold mb-2 font-[Rajdhani]">Points forts</h3>
                        <ul className="list-disc ml-5 space-y-1 text-blue-100">
                          {evaluationResult.strengths && evaluationResult.strengths.map((strength: string, index: number) => (
                            <li key={`strength-${index}`}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-blue-950/60 border border-red-800/30 p-4 rounded-md">
                        <h3 className="text-lg font-semibold mb-2 font-[Rajdhani]">Axes d'amélioration</h3>
                        <ul className="list-disc ml-5 space-y-1 text-blue-100">
                          {evaluationResult.weaknesses && evaluationResult.weaknesses.map((weakness: string, index: number) => (
                            <li key={`weakness-${index}`}>{weakness}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-blue-950/60 border border-blue-800/50 p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-2 font-[Rajdhani]">Compétences techniques</h3>
                      <p className="text-blue-100">{evaluationResult.technicalSkills}</p>
                    </div>
                    
                    <div className="bg-blue-950/60 border border-blue-800/50 p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-2 font-[Rajdhani]">Compétences de communication</h3>
                      <p className="text-blue-100">{evaluationResult.communicationSkills}</p>
                    </div>
                    
                    {evaluationResult.recommendation && (
                      <div className="bg-blue-950/60 border border-emerald-800/40 p-4 rounded-md">
                        <h3 className="text-lg font-semibold mb-1 font-[Rajdhani]">Recommandation</h3>
                        <p className="font-medium text-emerald-200">{evaluationResult.recommendation}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8">
                    <AlertCircle className="w-16 h-16 text-blue-400 mb-4" />
                    <h3 className="text-xl font-bold mb-2 font-[Rajdhani]">Aucune évaluation disponible</h3>
                    <p className="text-blue-300 text-center mb-4">
                      Vous n'avez pas encore terminé la simulation ou une erreur s'est produite lors de l'évaluation.
                    </p>
                    <Button onClick={resetSimulation} className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900">
                      Démarrer une nouvelle simulation
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={resetSimulation}
                  className="w-full bg-[#006a9e] hover:bg-blue-700"
                >
                  Nouvelle simulation
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </HomeLayout>
  );
};

export default CyberInterviewSimulation;