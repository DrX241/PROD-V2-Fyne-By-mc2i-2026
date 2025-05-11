import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserCircle, Send, Clock, CheckCircle, AlertCircle, FileCheck, ArrowLeft, ArrowRight, Mail, User } from 'lucide-react';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import HomeLayout from '@/components/layout/HomeLayout';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

// Schéma de validation pour le formulaire principal
const formSchema = z.object({
  profileType: z.string().min(1, "Le type de profil est requis"),
  experienceLevel: z.string().min(1, "Le niveau d'expérience est requis"),
  trainerEmail: z.string().email("Email invalide").optional().or(z.literal('')),
  candidateName: z.string().optional().or(z.literal('')),
  candidateEmail: z.string().email("Email invalide").optional().or(z.literal(''))
});

// Schéma de validation pour le formulaire de contact
const contactFormSchema = z.object({
  trainerEmail: z.string().email("Email invalide").optional().or(z.literal('')),
  candidateName: z.string().min(1, "Votre nom est requis"),
  profileType: z.string().min(1, "Le type de profil est requis"),
  experienceLevel: z.string().min(1, "Le niveau d'expérience est requis"),
  candidateEmail: z.string().email("Email invalide").optional().or(z.literal(''))
});

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
      profileType: "",
      experienceLevel: "",
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
      profileType: "",
      experienceLevel: "",
      candidateEmail: ""
    }
  });
  
  // Gestion du démarrage de la simulation
  const handleStartSimulation = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cyber/interview-simulation/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'cyber',
          profileType: values.profileType,
          experienceLevel: values.experienceLevel,
          trainerEmail: values.trainerEmail || undefined,
          candidateName: values.candidateName || undefined,
          candidateEmail: values.candidateEmail || undefined
        }),
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
          profileType: profileType,
          experienceLevel: experienceLevel
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
  const handleSendMessage = async () => {
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
          experienceLevel: form.getValues('experienceLevel')
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }
      
      const data = await response.json();
      
      // Ajouter la réponse de l'assistant
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }]);
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
  
  // Terminer la simulation
  const handleSimulationComplete = async () => {
    setIsLoading(true);
    setSimulationComplete(true);
    
    try {
      const response = await fetch('/api/cyber/interview-simulation/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'cyber',
          profileType: form.getValues('profileType'),
          experienceLevel: form.getValues('experienceLevel'),
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          duration: 600 - timeRemaining // Durée en secondes
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la finalisation de la simulation');
      }
      
      const data = await response.json();
      
      setEvaluationResult(data.evaluation);
      setActiveTab('evaluation');
      
      // Si nous n'avons pas les informations de contact, nous les demandons maintenant
      if (!form.getValues('candidateName') && !form.getValues('candidateEmail') && !isSkippedInfo) {
        setShowContactForm(true);
      }
      
      toast({
        title: "Entretien terminé",
        description: "Votre évaluation est prête. Consultez l'onglet Évaluation.",
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
  
  // Soumettre les informations de contact et finaliser
  const handleSubmitContactForm = async (values: z.infer<typeof contactFormSchema>) => {
    setShowContactForm(false);
    
    try {
      // Mettre à jour les valeurs dans le formulaire principal
      form.setValue('candidateName', values.candidateName);
      form.setValue('candidateEmail', values.candidateEmail);
      form.setValue('trainerEmail', values.trainerEmail);
      
      toast({
        title: "Informations enregistrées",
        description: "Vos informations ont été enregistrées avec succès.",
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'enregistrer vos informations. Veuillez réessayer.",
      });
    }
  };
  
  // Soumettre l'évaluation par email
  const handleSubmitEvaluation = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setIsSkippedInfo(true); // Pour masquer le formulaire après soumission
    
    try {
      const response = await fetch('/api/cyber/interview-simulation/download-synthesis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'cyber',
          evaluation: evaluationResult,
          candidateName: values.candidateName,
          candidateEmail: values.candidateEmail,
          trainerEmail: values.trainerEmail,
          profileType: form.getValues('profileType'),
          experienceLevel: form.getValues('experienceLevel')
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'évaluation');
      }
      
      toast({
        title: "Évaluation envoyée",
        description: "L'évaluation a été envoyée avec succès.",
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer l'évaluation. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Réinitialiser la simulation
  const resetSimulation = () => {
    setIsSimulationActive(false);
    setSimulationComplete(false);
    setMessages([]);
    setTimeRemaining(600);
    setEvaluationResult(null);
    setActiveTab('configuration');
    setIsSkippedInfo(false);
  };
  
  return (
    <HomeLayout>
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-blue-950 to-black text-white">
        {/* Alertes de démarrage et de fin */}
        {timeRemaining < 60 && isSimulationActive && !simulationComplete && (
          <div className="fixed top-20 right-4 z-50">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-600 text-white px-4 py-2 rounded-md shadow-lg"
            >
              <p className="font-bold">Attention !</p>
              <p className="text-sm">Plus que {timeRemaining} secondes</p>
            </motion.div>
          </div>
        )}
        
        {/* Boîte de dialogue pour les informations de contact */}
        <AlertDialog open={showContactForm} onOpenChange={setShowContactForm}>
          <AlertDialogContent className="bg-gray-800 text-white border border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-blue-300">Finalisez votre simulation</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Avant de consulter votre évaluation complète, merci de fournir quelques informations supplémentaires.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <Form {...contactForm}>
              <form onSubmit={contactForm.handleSubmit(handleSubmitContactForm)} className="space-y-4 mt-4">
                {/* Information du candidat */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-300">Informations personnelles</h3>
                  
                  <FormField
                    control={contactForm.control}
                    name="candidateName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Votre nom complet</FormLabel>
                        <FormControl>
                          <Input placeholder="Prénom Nom" {...field} className="bg-gray-700 border-gray-600 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={contactForm.control}
                    name="candidateEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Votre email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} className="bg-gray-700 border-gray-600 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={contactForm.control}
                    name="trainerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email du recruteur (optionnel)</FormLabel>
                        <FormControl>
                          <Input placeholder="recruteur@example.com" {...field} className="bg-gray-700 border-gray-600 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
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
        
        <div className="cyber-interview-test">
          <div className="container mx-auto py-8 px-4">
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center font-[Rajdhani]">Simulation d'entretien technique</CardTitle>
                <CardDescription className="text-center">
                  Préparez-vous aux entretiens d'embauche en cybersécurité avec une IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-950/30 p-4 rounded-md">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-300" />
                    Comment ça fonctionne
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-blue-100">
                    <li>Simulation chronométrée de 10 minutes</li>
                    <li>Conversation réaliste avec un recruteur spécialisé</li>
                    <li>Questions techniques en cybersécurité adaptées au profil</li>
                    <li>À la fin, une IA analysera vos réponses et générera un profil d'évaluation</li>
                    <li>Vous recevrez une analyse de vos forces et axes d'amélioration</li>
                  </ul>
                </div>

                <div className="bg-amber-950/30 p-4 rounded-md">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-amber-300" />
                    À savoir avant de commencer
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-blue-100">
                    <li>L'entretien sera chronométré dès que vous cliquerez sur "Commencer"</li>
                    <li>Assurez-vous d'être dans un environnement calme et sans distractions</li>
                    <li>Répondez comme vous le feriez dans un véritable entretien</li>
                    <li>Soyez précis et concis dans vos réponses</li>
                  </ul>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleStartSimulation)} className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="profileType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type de profil</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionnez un profil" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="analyste_soc">Analyste SOC</SelectItem>
                                <SelectItem value="pentester">Pentester</SelectItem>
                                <SelectItem value="responsable_securite">Responsable Sécurité</SelectItem>
                                <SelectItem value="consultant_cybersecurite">Consultant Cybersécurité</SelectItem>
                                <SelectItem value="ingenieur_securite">Ingénieur Sécurité</SelectItem>
                                <SelectItem value="architecte_securite">Architecte Sécurité</SelectItem>
                                <SelectItem value="auditeur_securite">Auditeur Sécurité</SelectItem>
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
                            <FormLabel>Niveau d'expérience</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionnez un niveau" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
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
                    
                    <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center">
                        <OpenAIStatusIndicator inline={true} />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => navigate('/cyber')}
                          variant="outline"
                          type="button"
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Retour
                        </Button>
                        
                        <Button 
                          type="submit"
                          className="bg-[#006a9e] hover:bg-blue-700"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>Préparation...</>
                          ) : (
                            <>
                              Commencer
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default CyberInterviewSimulation;