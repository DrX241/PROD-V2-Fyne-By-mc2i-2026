import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserCircle, Send, Clock, CheckCircle, AlertCircle, FileCheck, ArrowLeft, ArrowRight, Mail, User } from 'lucide-react';

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
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import HomeLayout from '@/components/layout/HomeLayout';

// Formulaire de configuration
const formSchema = z.object({
  experience: z.string().min(1, { message: "Veuillez sélectionner votre niveau d'expérience" }),
  techDomain: z.string().min(1, { message: "Veuillez sélectionner un domaine technique" }),
  softDomain: z.string().min(1, { message: "Veuillez sélectionner un domaine fonctionnel" }),
  trainerEmail: z.string().email({ message: "Veuillez saisir une adresse email valide" }).optional().or(z.literal('')),
  candidateName: z.string().min(2, { message: "Veuillez saisir votre nom" }).optional().or(z.literal('')),
  candidateEmail: z.string().email({ message: "Veuillez saisir une adresse email valide" }).optional().or(z.literal('')),
});

// Formulaire de contact
const contactFormSchema = z.object({
  trainerEmail: z.string().email({ message: "Veuillez saisir une adresse email valide" }),
  candidateName: z.string().min(2, { message: "Veuillez saisir votre nom" }),
  candidateEmail: z.string().email({ message: "Veuillez saisir une adresse email valide" }),
});

// Type pour le message
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
  
  // Effet pour le décompte du temps
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isSimulationActive && !simulationComplete && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleSimulationComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSimulationActive, simulationComplete, timeRemaining]);
  
  // Formatage du temps pour l'affichage
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Configuration du formulaire principal
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      experience: "",
      techDomain: "",
      softDomain: "",
      trainerEmail: "",
      candidateName: "",
      candidateEmail: ""
    }
  });
  
  // Configuration du formulaire de contact
  const contactForm = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      trainerEmail: "",
      candidateName: "",
      candidateEmail: ""
    }
  });
  
  // Gestion du démarrage de la simulation
  const handleStartSimulation = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cyber-interview-test/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          experience: values.experience,
          techDomain: values.techDomain,
          softDomain: values.softDomain,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du démarrage de la simulation');
      }
      
      const data = await response.json();
      
      setMessages([
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.initialMessage,
          timestamp: new Date(),
        },
      ]);
      
      setIsSimulationActive(true);
      setTimeRemaining(600); // Réinitialisation à 10 minutes
      setActiveTab('simulation');
      
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
  
  // Envoi d'un message utilisateur
  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    const newUserMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: userInput,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cyber-interview-test/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          history: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          timeRemaining,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }
      
      const data = await response.json();
      
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        },
      ]);
      
      // Vérifier si l'entretien est terminé
      if (data.shouldEndInterview) {
        handleSimulationComplete();
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de l'envoi du message. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Gestion du temps écoulé ou de la fin de simulation
  const handleSimulationComplete = async () => {
    if (simulationComplete) return;
    
    setIsLoading(true);
    setSimulationComplete(true);
    
    try {
      const response = await fetch('/api/cyber-interview-test/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          experience: form.getValues('experience'),
          techDomain: form.getValues('techDomain'),
          softDomain: form.getValues('softDomain'),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'évaluation');
      }
      
      const data = await response.json();
      setEvaluationResult(data.evaluation);
      setActiveTab('evaluation');
      
      toast({
        title: "Simulation terminée",
        description: "Votre évaluation a été générée avec succès.",
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de l'évaluation. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Gestion du formulaire d'évaluation
  const handleSubmitEvaluation = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cyber-interview-test/send-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainerEmail: values.trainerEmail,
          candidateName: values.candidateName,
          candidateEmail: values.candidateEmail,
          evaluation: evaluationResult,
          conversation: messages,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du rapport');
      }
      
      toast({
        title: "Rapport envoyé",
        description: "Le rapport d'évaluation a été envoyé par email.",
      });
      
      setIsSkippedInfo(false);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de l'envoi du rapport. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Réinitialisation de la simulation
  const resetSimulation = () => {
    setMessages([]);
    setIsSimulationActive(false);
    setSimulationComplete(false);
    setTimeRemaining(600);
    setEvaluationResult(null);
    setActiveTab('configuration');
    setIsSkippedInfo(false);
    form.reset();
  };
  
  return (
    <HomeLayout>
        {/* Dialogue pour saisir les informations de contact à la fin de la simulation */}
        <AlertDialog open={showContactForm} onOpenChange={setShowContactForm}>
          <AlertDialogContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-blue-200 dark:border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl text-blue-800 dark:text-white">Informations pour finaliser la simulation</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                Veuillez remplir tous les champs ci-dessous pour finaliser la simulation et recevoir l'évaluation par email.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <Form {...contactForm}>
              <form onSubmit={contactForm.handleSubmit((data) => {
                // Transférer toutes les données du contactForm vers le form principal
                form.setValue('trainerEmail', data.trainerEmail);
                form.setValue('candidateName', data.candidateName);
                form.setValue('candidateEmail', data.candidateEmail);
                
                // Soumettre le formulaire principal
                handleSubmitEvaluation(form.getValues());
                setShowContactForm(false);
              })}>
                <FormField
                  control={contactForm.control}
                  name="trainerEmail"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="text-gray-800 dark:text-white">Email du recruteur</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-white dark:bg-gray-700 border-blue-200 dark:border-gray-600 text-gray-800 dark:text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={contactForm.control}
                  name="candidateName"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="text-gray-800 dark:text-white">Nom du candidat</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-white dark:bg-gray-700 border-blue-200 dark:border-gray-600 text-gray-800 dark:text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={contactForm.control}
                  name="candidateEmail"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="text-gray-800 dark:text-white">Email du candidat</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-white dark:bg-gray-700 border-blue-200 dark:border-gray-600 text-gray-800 dark:text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <AlertDialogFooter className="gap-2 mt-6">
                  <Button
                    type="submit" 
                    className="bg-[#006a9e] hover:bg-blue-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Chargement..." : "Soumettre et finaliser"}
                  </Button>
                </AlertDialogFooter>
              </form>
            </Form>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Chronomètre flottant */}
        {isSimulationActive && !simulationComplete && (
          <div className="fixed top-4 right-4 z-50 flex items-center p-2 rounded-md shadow-lg bg-blue-900/80 border border-blue-700">
            <Clock className="w-5 h-5 mr-2 text-white" />
            <span className="font-mono text-white">{formatTime(timeRemaining)}</span>
          </div>
        )}
        
        {/* Écran d'introduction */}
        {!isSimulationActive && !simulationComplete && activeTab === 'configuration' && (
          <div className="container mx-auto py-8 px-4">
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-blue-800 dark:text-white font-[Rajdhani]">Simulation d'entretien technique</CardTitle>
                <CardDescription className="text-center text-gray-800 dark:text-white">
                  Préparez-vous aux entretiens d'embauche en cybersécurité avec une IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-md">
                  <h3 className="font-semibold mb-2 flex items-center text-blue-800 dark:text-white">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Comment ça fonctionne
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-800 dark:text-gray-200">
                    <li>Simulation chronométrée de 10 minutes</li>
                    <li>Conversation réaliste avec un recruteur spécialisé en cybersécurité</li>
                    <li>Questions techniques adaptées au profil spécifié</li>
                    <li>À la fin, une IA analysera vos réponses et générera un profil d'évaluation</li>
                    <li>Vous recevrez une analyse de vos forces et axes d'amélioration</li>
                  </ul>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-md">
                  <h3 className="font-semibold mb-2 flex items-center text-blue-800 dark:text-white">
                    <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
                    À savoir avant de commencer
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-800 dark:text-blue-100">
                    <li>L'entretien sera chronométré dès que vous cliquerez sur "Commencer"</li>
                    <li>Répondez comme vous le feriez dans un véritable entretien</li>
                    <li>Soyez précis et concis dans vos réponses</li>
                    <li>Assurez-vous d'être dans un environnement calme et sans distractions</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  onClick={() => navigate('/cyber')} 
                  variant="outline"
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour à I AM CYBER
                </Button>
                <Button 
                  onClick={() => handleStartSimulation(form.getValues())}
                  className="md:w-auto bg-[#006a9e] hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Chargement..." : "Démarrer l'entretien"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
        
        {/* Interface principale avec onglets */}
        <div className="container mx-auto py-4 px-4">
          <Tabs 
            defaultValue="configuration" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full max-w-4xl mx-auto"
          >
            <TabsList className="grid grid-cols-3 mb-8 bg-blue-100 dark:bg-blue-950/60">
              <TabsTrigger 
                value="configuration"
                disabled={isSimulationActive && !simulationComplete}
                className="text-gray-800 dark:text-white data-[state=active]:bg-blue-700 data-[state=active]:text-white"
              >
                Configuration
              </TabsTrigger>
              <TabsTrigger 
                value="simulation" 
                disabled={!isSimulationActive || simulationComplete}
                className="text-gray-800 dark:text-white data-[state=active]:bg-blue-700 data-[state=active]:text-white"
              >
                Simulation
              </TabsTrigger>
              <TabsTrigger 
                value="evaluation" 
                disabled={!simulationComplete}
                className="text-gray-800 dark:text-white data-[state=active]:bg-blue-700 data-[state=active]:text-white"
              >
                Évaluation
              </TabsTrigger>
            </TabsList>
            
            {/* Onglet Configuration */}
            <TabsContent value="configuration">
              <Card className="bg-white dark:bg-blue-900/20 border-blue-300 dark:border-blue-800 shadow-md">
                <CardHeader>
                  <CardTitle className="font-[Rajdhani] text-blue-800 dark:text-white">Configuration de l'entretien technique</CardTitle>
                  <CardDescription className="text-gray-800 dark:text-blue-300">
                    Personnalisez votre entretien en fonction de votre profil et de vos intérêts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleStartSimulation)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-800 dark:text-white">Niveau d'expérience</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-gray-800 dark:text-white">
                                  <SelectValue placeholder="Sélectionnez votre niveau" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white dark:bg-blue-950 border-blue-300 dark:border-blue-700 text-gray-800 dark:text-white">
                                <SelectItem value="junior">Junior (0-2 ans)</SelectItem>
                                <SelectItem value="intermediaire">Intermédiaire (3-5 ans)</SelectItem>
                                <SelectItem value="senior">Senior (6+ ans)</SelectItem>
                                <SelectItem value="expert">Expert / Lead (10+ ans)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="techDomain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-800 dark:text-white">Domaine technique principal</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-gray-800 dark:text-white">
                                  <SelectValue placeholder="Sélectionnez un domaine technique" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white dark:bg-blue-950 border-blue-300 dark:border-blue-700 text-gray-800 dark:text-white">
                                <SelectItem value="securityArchitecture">Architecture de sécurité</SelectItem>
                                <SelectItem value="penetrationTesting">Tests d'intrusion</SelectItem>
                                <SelectItem value="securityOperations">Opérations de sécurité (SOC)</SelectItem>
                                <SelectItem value="cloudSecurity">Sécurité Cloud</SelectItem>
                                <SelectItem value="networkSecurity">Sécurité réseau</SelectItem>
                                <SelectItem value="applicationSecurity">Sécurité applicative</SelectItem>
                                <SelectItem value="identityAccess">Gestion des identités et des accès</SelectItem>
                                <SelectItem value="securityAudit">Audit de sécurité / Conformité</SelectItem>
                                <SelectItem value="incidentResponse">Réponse aux incidents</SelectItem>
                                <SelectItem value="threatIntelligence">Renseignement sur les menaces</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="softDomain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-800 dark:text-white">Domaine fonctionnel</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-gray-800 dark:text-white">
                                  <SelectValue placeholder="Sélectionnez un domaine fonctionnel" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white dark:bg-blue-950 border-blue-300 dark:border-blue-700 text-gray-800 dark:text-white">
                                <SelectItem value="finance">Finance / Banque</SelectItem>
                                <SelectItem value="healthcare">Santé / Pharmaceutique</SelectItem>
                                <SelectItem value="retail">Commerce / Distribution</SelectItem>
                                <SelectItem value="manufacturing">Industrie / Production</SelectItem>
                                <SelectItem value="government">Gouvernement / Secteur public</SelectItem>
                                <SelectItem value="telecom">Télécommunications</SelectItem>
                                <SelectItem value="energy">Énergie / Utilities</SelectItem>
                                <SelectItem value="defense">Défense / Sécurité nationale</SelectItem>
                                <SelectItem value="tech">Technologie / Software</SelectItem>
                                <SelectItem value="consulting">Conseil / Services</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4 flex justify-end">
                        <Button 
                          type="submit" 
                          className="bg-[#006a9e] hover:bg-blue-700"
                          disabled={isLoading}
                        >
                          {isLoading ? "Chargement..." : "Démarrer la simulation"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Onglet Simulation */}
            <TabsContent value="simulation">
              <Card className="bg-white dark:bg-blue-900/20 border-blue-300 dark:border-blue-800 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-[Rajdhani] text-blue-800 dark:text-white">Entretien technique en cours</CardTitle>
                      <div className="flex items-center mt-1">
                        <Badge className="bg-blue-600">
                          {form.getValues('experience') === 'junior' && 'Junior'}
                          {form.getValues('experience') === 'intermediaire' && 'Intermédiaire'}
                          {form.getValues('experience') === 'senior' && 'Senior'}
                          {form.getValues('experience') === 'expert' && 'Expert'}
                        </Badge>
                        <Badge className="ml-2 bg-indigo-600">
                          {form.getValues('techDomain') === 'securityArchitecture' && 'Architecture de sécurité'}
                          {form.getValues('techDomain') === 'penetrationTesting' && 'Tests d\'intrusion'}
                          {form.getValues('techDomain') === 'securityOperations' && 'SOC'}
                          {form.getValues('techDomain') === 'cloudSecurity' && 'Sécurité Cloud'}
                          {form.getValues('techDomain') === 'networkSecurity' && 'Sécurité réseau'}
                          {form.getValues('techDomain') === 'applicationSecurity' && 'Sécurité applicative'}
                          {form.getValues('techDomain') === 'identityAccess' && 'IAM'}
                          {form.getValues('techDomain') === 'securityAudit' && 'Audit / Conformité'}
                          {form.getValues('techDomain') === 'incidentResponse' && 'Réponse aux incidents'}
                          {form.getValues('techDomain') === 'threatIntelligence' && 'Threat Intelligence'}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-gray-800 dark:text-blue-300">
                      Temps restant: <span className="font-mono text-blue-800 dark:text-blue-100">{formatTime(timeRemaining)}</span>
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4 mb-4 max-h-[400px] overflow-y-auto bg-blue-50 dark:bg-blue-950/40 p-4 rounded-md border border-blue-100 dark:border-blue-800/50">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === 'assistant' ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg max-w-[80%] ${
                            message.role === 'assistant'
                              ? 'bg-blue-100 dark:bg-blue-900/50 text-gray-800 dark:text-white border border-blue-200 dark:border-blue-800/50'
                              : 'bg-blue-200 dark:bg-blue-700/50 text-gray-800 dark:text-white border border-blue-300 dark:border-blue-600/50'
                          }`}
                        >
                          <div className="flex items-center mb-1">
                            {message.role === 'assistant' ? (
                              <>
                                <UserCircle className="h-4 w-4 text-blue-600 dark:text-blue-300 mr-2" />
                                <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold">Recruteur</span>
                              </>
                            ) : (
                              <>
                                <User className="h-4 w-4 text-blue-600 dark:text-blue-300 mr-2" />
                                <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold">Candidat</span>
                              </>
                            )}
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-gray-800 dark:text-white border border-blue-200 dark:border-blue-800/50">
                          <div className="flex items-center mb-1">
                            <UserCircle className="h-4 w-4 text-blue-600 dark:text-blue-300 mr-2" />
                            <span className="text-xs text-blue-700 dark:text-blue-300">Recruteur</span>
                          </div>
                          <div className="flex space-x-1 items-center">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-0"></div>
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-300"></div>
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-600"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Tapez votre réponse..."
                      className="flex-1 bg-white dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50 text-gray-800 dark:text-white placeholder:text-blue-400/70 dark:placeholder:text-blue-300/50"
                      disabled={isLoading || simulationComplete}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      className="bg-[#006a9e] hover:bg-blue-700 text-white"
                      onClick={handleSendMessage}
                      disabled={isLoading || !userInput.trim() || simulationComplete}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full flex justify-end">
                    <Button
                      onClick={handleSimulationComplete}
                      className="bg-amber-600 hover:bg-amber-700"
                      disabled={isLoading || simulationComplete}
                    >
                      Terminer l'entretien
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Onglet Évaluation */}
            <TabsContent value="evaluation">
              <Card className="bg-white dark:bg-blue-900/20 border-blue-300 dark:border-blue-800 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-[Rajdhani] text-blue-800 dark:text-white">Évaluation technique</CardTitle>
                  </div>
                  <CardDescription className="text-gray-800 dark:text-blue-300">
                    Analyse de votre performance lors de l'entretien technique
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {evaluationResult ? (
                    <div className="space-y-6">
                      <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/50 p-4 rounded-md">
                        <h3 className="text-lg font-semibold mb-2 font-[Rajdhani] text-blue-800 dark:text-white">Profil du candidat</h3>
                        <p className="text-gray-800 dark:text-blue-100">{evaluationResult.profile}</p>
                      </div>
                      
                      <div className="bg-green-50 dark:bg-blue-950/60 border border-green-200 dark:border-blue-800/50 p-4 rounded-md">
                        <h3 className="text-lg font-semibold mb-2 font-[Rajdhani] text-blue-800 dark:text-white">Points forts</h3>
                        <ul className="list-disc list-inside space-y-1 text-green-700 dark:text-emerald-300">
                          {evaluationResult.strengths.map((strength: string, index: number) => (
                            <li key={index}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-amber-50 dark:bg-blue-950/60 border border-amber-200 dark:border-blue-800/50 p-4 rounded-md">
                        <h3 className="text-lg font-semibold mb-2 font-[Rajdhani] text-blue-800 dark:text-white">Axes d'amélioration</h3>
                        <ul className="list-disc list-inside space-y-1 text-amber-700 dark:text-amber-300">
                          {evaluationResult.improvements.map((improvement: string, index: number) => (
                            <li key={index}>{improvement}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/50 p-4 rounded-md">
                        <h3 className="text-lg font-semibold mb-2 font-[Rajdhani] text-blue-800 dark:text-white">Compétences techniques</h3>
                        <p className="text-gray-800 dark:text-blue-100">{evaluationResult.technicalSkillsAssessment}</p>
                      </div>
                      
                      <div className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/50 p-4 rounded-md">
                        <h3 className="text-lg font-semibold mb-2 font-[Rajdhani] text-blue-800 dark:text-white">Compétences de communication</h3>
                        <p className="text-gray-800 dark:text-blue-100">{evaluationResult.communicationSkillsAssessment}</p>
                      </div>
                      
                      {evaluationResult.recommendation && (
                        <div className="bg-emerald-50 dark:bg-blue-950/60 border border-emerald-200 dark:border-emerald-800/40 p-4 rounded-md">
                          <h3 className="text-lg font-semibold mb-1 font-[Rajdhani] text-blue-800 dark:text-white">Recommandation</h3>
                          <p className="font-medium text-emerald-700 dark:text-emerald-200">{evaluationResult.recommendation}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8">
                      <AlertCircle className="w-16 h-16 text-blue-600 dark:text-blue-400 mb-4" />
                      <h3 className="text-xl font-semibold mb-2 text-blue-800 dark:text-white">Aucune évaluation disponible</h3>
                      <p className="text-center text-blue-700 dark:text-blue-300">
                        Terminez d'abord une simulation d'entretien pour recevoir une évaluation détaillée.
                      </p>
                    </div>
                  )}
                  
                  {evaluationResult && !isSkippedInfo && (
                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/40 rounded-lg border border-blue-300 dark:border-blue-700/50 shadow-sm">
                      <h3 className="text-lg font-medium mb-4 font-[Rajdhani] flex items-center text-blue-800 dark:text-white">
                        <Mail className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-300" />
                        Recevoir l'évaluation par email
                      </h3>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmitEvaluation)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="trainerEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-800 dark:text-white">Email du recruteur (optionnel)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="recruteur@entreprise.fr"
                                    className="bg-white dark:bg-blue-950/60 border-blue-200 dark:border-blue-700 text-gray-800 dark:text-white"
                                  />
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
                                <FormLabel className="text-gray-800 dark:text-white">Votre nom (optionnel)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Prénom Nom"
                                    className="bg-white dark:bg-blue-950/60 border-blue-200 dark:border-blue-700 text-gray-800 dark:text-white"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="candidateEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-800 dark:text-white">Votre email (optionnel)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="candidat@email.fr"
                                    className="bg-white dark:bg-blue-950/60 border-blue-200 dark:border-blue-700 text-gray-800 dark:text-white"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-between pt-2">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-blue-900/50"
                              onClick={() => setIsSkippedInfo(true)}
                            >
                              Ignorer
                            </Button>
                            <Button 
                              type="submit" 
                              className="bg-[#006a9e] hover:bg-blue-700 text-white"
                              disabled={isLoading}
                            >
                              Envoyer l'évaluation
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={resetSimulation}
                    className="w-full bg-[#006a9e] hover:bg-blue-700 text-white"
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