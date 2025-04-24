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

// Schéma de formulaire pour la configuration de l'audition
const formSchema = z.object({
  // Champs optionnels (peuvent être ignorés au début)
  trainerEmail: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }).optional().or(z.literal('')),
  candidateName: z.string().min(2, {
    message: "Le nom du consultant doit contenir au moins 2 caractères.",
  }).optional().or(z.literal('')),
  
  // Champs obligatoires pour la simulation
  profileType: z.string().min(1, {
    message: "Veuillez sélectionner un type de profil.",
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
    message: "Le nom du consultant doit contenir au moins 2 caractères.",
  }),
  
  // On inclut également les champs importants pour l'évaluation
  profileType: z.string().min(1, {
    message: "Veuillez sélectionner un type de profil.",
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

const CyberInterviewSimulation: React.FC<{}> = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('configuration');
  
  // États pour l'audition
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes en secondes
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [isSkippedInfo, setIsSkippedInfo] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  
  // États pour les notes et la synthèse
  const [notesText, setNotesText] = useState('');
  const [isAnalyzingNotes, setIsAnalyzingNotes] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<any>(null);
  
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
  
  // Démarrage de l'audition
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
          content: data.initialMessage || "Bonjour, je suis un client potentiel qui cherche des services en cybersécurité. Pouvez-vous me présenter votre expertise et me dire comment vous pourriez répondre à mes besoins en matière de sécurité informatique ?",
          timestamp: new Date(),
        },
      ]);
      
      setIsSimulationActive(true);
      setActiveTab('simulation');
      
      // Démarrer le timer
      startTimer();
      
      toast({
        title: "Simulation démarrée",
        description: "La simulation d'audition a commencé. Vous avez 10 minutes.",
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
  
  // Configuration du compte à rebours
  const startTimer = () => {
    console.log("Démarrage du timer...");
    setTimeRemaining(600); // 10 minutes en secondes
  };
  
  // Fonction pour ignorer la saisie des informations de contact (uniquement email et nom)
  const skipInfoAndStart = async () => {
    console.log("Fonction skipInfoAndStart appelée");
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
    
    console.log("Valeurs du formulaire:", { profileType, experienceLevel });

    // Appel direct à l'API sans passer par la validation complète du formulaire
    setIsLoading(true);
    
    // Variable pour stocker la réponse JSON
    let responseData: any = null;
    
    try {
      console.log("Envoi de la requête API...");
      
      // Préparer les données à envoyer (sans les informations de contact)
      const payload = {
        domain: 'cyber',
        profileType,
        experienceLevel
      };
      
      console.log("Payload:", payload);
      
      const response = await fetch('/api/cyber/interview-simulation/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      console.log("Réponse API status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur API:", errorText);
        throw new Error(`Erreur lors du démarrage de la simulation: ${response.status}`);
      }
      
      // Récupérer le texte de la réponse d'abord
      const responseText = await response.text();
      console.log("Réponse brute:", responseText.substring(0, 100)); // Log une portion du texte pour le débogage
      
      try {
        // Tenter de parser la réponse en JSON
        responseData = JSON.parse(responseText);
        console.log("Données de réponse:", responseData);
      } catch (parseError) {
        console.error("Erreur de parsing JSON:", parseError);
        // En cas d'erreur de parsing, utiliser un objet par défaut
        responseData = { initialMessage: "Bonjour, je suis un client potentiel qui cherche des services en cybersécurité. Pouvez-vous me présenter votre expertise et me dire comment vous pourriez répondre à mes besoins en matière de sécurité informatique ?" };
      }
      
      // Pas besoin de vérifier data.success, la réponse 200 suffit
      
      // Ajouter le message initial de l'assistant
      const initialMessage = responseData.initialMessage || "Bonjour, je suis un client potentiel qui cherche des services en cybersécurité. Pouvez-vous me présenter votre expertise et me dire comment vous pourriez répondre à mes besoins en matière de sécurité informatique ?";
      console.log("Message initial:", initialMessage);
      
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: initialMessage,
          timestamp: new Date(),
        },
      ]);
      
      // Activer la simulation
      setIsSimulationActive(true);
      setActiveTab('simulation');
      
      // Démarrer le timer
      startTimer();
      
      toast({
        title: "Simulation démarrée",
        description: "La simulation d'audition a commencé. Vous avez 10 minutes.",
      });
    } catch (error: any) {
      console.error('Erreur lors de l\'initialisation sans contact:', error);
      
      // Vérifier si la réponse est déjà arrivée avec succès malgré l'erreur de parsing
      if (responseData && responseData.initialMessage) {
        return; // Ne pas afficher d'erreur si nous avons déjà des données valides
      }
      
      toast({
        variant: "destructive",
        title: "Erreur",
        description: (error && error.message) ? error.message : "Impossible de démarrer la simulation. Veuillez réessayer.",
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
          message: userInput,
          profileType: form.getValues('profileType'),
          experienceLevel: form.getValues('experienceLevel'),
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }
      
      // Récupérer le texte de la réponse d'abord
      const responseText = await response.text();
      console.log("Réponse message brute:", responseText.substring(0, 100));
      
      let data;
      try {
        // Tenter de parser la réponse en JSON
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Erreur de parsing JSON (message):", parseError);
        // En cas d'erreur de parsing, utiliser un objet par défaut
        data = { response: "Je suis désolé, il semble y avoir un problème technique. Pouvez-vous reformuler votre question?" };
      }
      
      // Limiter à 5 échanges maximum
      if (messages.filter(m => m.role === 'user').length >= 5) {
        completeSimulation();
        toast({
          title: "Limite atteinte",
          description: "La simulation est limitée à 5 questions. Finalisation en cours..."
        });
        return;
      }
      
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
  
  // Finalisation de l'audition
  const completeSimulation = async () => {
    if (simulationComplete) return;
    
    // Vérifier si toutes les informations nécessaires sont disponibles
    const trainerEmail = form.getValues('trainerEmail');
    const candidateName = form.getValues('candidateName');
    const profileType = form.getValues('profileType');
    const experienceLevel = form.getValues('experienceLevel');
    
    // Si l'utilisateur a ignoré la saisie des informations de contact OU si email/nom manquent, demander les infos
    if (isSkippedInfo || !trainerEmail || !candidateName) {
      // Pré-remplir le formulaire final avec les valeurs déjà entrées
      contactForm.setValue('profileType', profileType);
      contactForm.setValue('experienceLevel', experienceLevel);
      if (trainerEmail) contactForm.setValue('trainerEmail', trainerEmail);
      if (candidateName) contactForm.setValue('candidateName', candidateName);
      
      setShowContactForm(true);
      return;
    }
    
    await finalizeSimulation();
  };
  
  // Soumettre les informations de contact finales et terminer la simulation
  const submitContactInfo = async (contactInfo: ContactFormValues) => {
    // Mettre à jour le formulaire avec toutes les nouvelles valeurs
    form.setValue('trainerEmail', contactInfo.trainerEmail);
    form.setValue('candidateName', contactInfo.candidateName);
    form.setValue('profileType', contactInfo.profileType);
    form.setValue('experienceLevel', contactInfo.experienceLevel);
    
    // Fermer le formulaire de contact
    setShowContactForm(false);
    
    // Finaliser la simulation avec les nouvelles informations
    await finalizeSimulation();
  };
  
  // Finalisation réelle de la simulation après avoir toutes les informations
  const finalizeSimulation = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cyber/interview-simulation/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'cyber',
          trainerEmail: form.getValues('trainerEmail'),
          candidateName: form.getValues('candidateName'),
          profileType: form.getValues('profileType'),
          experienceLevel: form.getValues('experienceLevel'),
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          duration: 600 - timeRemaining,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la finalisation de la simulation');
      }
      
      const data = await response.json();
      
      // Récupération de l'évaluation directement depuis la réponse
      if (data.evaluation) {
        setEvaluationResult({
          content: data.evaluation,
          domain: 'cyber',
          profileType: form.getValues('profileType'),
          experienceLevel: form.getValues('experienceLevel'),
          candidateName: form.getValues('candidateName'),
          duration: 600 - timeRemaining
        });
      } else {
        setEvaluationResult(data);
      }
      
      setSimulationComplete(true);
      setActiveTab('evaluation');
      
      const emailReceiver = form.getValues('trainerEmail');
      if (emailReceiver) {
        toast({
          title: "Simulation terminée",
          description: "L'évaluation de votre audition a été envoyée à " + emailReceiver,
        });
      } else {
        toast({
          title: "Simulation terminée",
          description: "L'évaluation de votre audition est disponible dans l'onglet Évaluation.",
        });
      }
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
  
  // Vider et recommencer
  const resetSimulation = () => {
    setMessages([]);
    setIsSimulationActive(false);
    setTimeRemaining(600);
    setSimulationComplete(false);
    setEvaluationResult(null);
    setActiveTab('configuration');
    setIsSkippedInfo(false);
    setShowContactForm(false);
    setNotesText('');
    setSynthesisResult(null);
    form.reset({
      trainerEmail: '',
      candidateName: '',
      profileType: '',
      experienceLevel: '',
    });
  };
  
  // Analyser les notes et générer une synthèse structurée
  const analyzeNotes = async () => {
    if (!notesText.trim()) {
      toast({
        variant: "destructive",
        title: "Notes vides",
        description: "Veuillez saisir vos notes avant de générer une synthèse."
      });
      return;
    }
    
    setIsAnalyzingNotes(true);
    
    try {
      const response = await fetch('/api/cyber/interview-simulation/analyze-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: notesText,
          candidateName: form.getValues('candidateName'),
          profileType: form.getValues('profileType'),
          experienceLevel: form.getValues('experienceLevel'),
          evaluationResult: evaluationResult
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse des notes');
      }
      
      const data = await response.json();
      setSynthesisResult(data.synthesis);
      setActiveTab('synthese');
      
      toast({
        title: "Synthèse générée",
        description: "Vos notes ont été analysées et structurées avec succès."
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'analyser les notes. Veuillez réessayer."
      });
    } finally {
      setIsAnalyzingNotes(false);
    }
  };
  
  // Configuration du formulaire de contact à la fin
  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      trainerEmail: '',
      candidateName: '',
      // Copier les données déjà saisies à partir du formulaire principal
      profileType: form.getValues('profileType'),
      experienceLevel: form.getValues('experienceLevel'),
    },
  });
  
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
              
              {/* Informations d'évaluation */}
              <div className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-300">Paramètres d'évaluation</h3>
                
                <FormField
                  control={contactForm.control}
                  name="profileType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Type de profil *</FormLabel>
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
                      <FormLabel className="text-white">Niveau d'expérience *</FormLabel>
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
      
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            className="text-white hover:text-white hover:bg-gray-700"
            onClick={() => navigate("/cyber")}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Préparation d'audition auprès d'un client</h1>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Cette simulation vous permet de préparer vos consultants à des auditions auprès de clients ou partenaires commerciaux à travers une conversation de 10 minutes avec un client potentiel simulé par l'IA.
          </p>
        </div>
          
          {/* L'indicateur de statut OpenAI est maintenant affiché dans le Header */}
          
          {isSimulationActive && !simulationComplete && (
            <div className="fixed top-4 right-4 z-50 flex items-center p-2 rounded-md shadow-lg bg-gray-800 border border-gray-700">
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
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger 
                value="configuration"
                disabled={isSimulationActive && !simulationComplete}
              >
                Configuration
              </TabsTrigger>
              <TabsTrigger 
                value="simulation"
                disabled={!isSimulationActive}
              >
                Simulation
              </TabsTrigger>
              <TabsTrigger 
                value="evaluation"
                disabled={!simulationComplete}
              >
                Évaluation
              </TabsTrigger>

            </TabsList>
            
            <TabsContent value="configuration">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Configuration de l'audition</CardTitle>
                  <CardDescription className="text-gray-400">
                    Configurez les paramètres de la simulation d'audition
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
                              <FormLabel>Email du formateur (pour recevoir l'évaluation)</FormLabel>
                              <FormControl>
                                <Input placeholder="email@exemple.com" {...field} className="bg-gray-700 border-gray-600 text-white" />
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
                              <FormLabel>Nom du consultant</FormLabel>
                              <FormControl>
                                <Input placeholder="Nom complet" {...field} className="bg-gray-700 border-gray-600 text-white" />
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
                              <FormLabel>Type de profil *</FormLabel>
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
                          control={form.control}
                          name="experienceLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Niveau d'expérience *</FormLabel>
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
                      
                      <div className="flex gap-4">
                        <Button 
                          type="submit" 
                          className="flex-1 bg-[#006a9e] hover:bg-blue-700"
                          disabled={isLoading}
                        >
                          {isLoading ? "Chargement..." : "Démarrer la simulation"}
                        </Button>
                        
                        <Button 
                          type="button" 
                          variant="outline"
                          className="flex-1 border-gray-600 bg-gray-700 hover:bg-gray-600"
                          disabled={isLoading}
                          onClick={() => {
                            console.log("Bouton Ignorer cliqué");
                            skipInfoAndStart();
                          }}
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
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Audition en cours</CardTitle>
                    <div className={`flex items-center p-2 rounded-md ${
                      timeRemaining > 60 ? "bg-blue-900" : "bg-red-900"
                    }`}>
                      <Clock className="w-5 h-5 mr-2" />
                      <span className="font-mono">{formatTime(timeRemaining)}</span>
                    </div>
                  </div>
                  <CardDescription className="text-gray-400">
                    Vous êtes en conversation avec un client potentiel cherchant des services en cybersécurité
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 overflow-y-auto mb-4 bg-gray-900 rounded-md p-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
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
                                  ? 'bg-[#006a9e] text-white'
                                  : 'bg-gray-700 text-white'
                              }`}
                            >
                              <div className="flex items-center mb-1">
                                {message.role === 'user' ? (
                                  <>
                                    <span className="font-semibold">{form.getValues('candidateName') || 'Consultant'}</span>
                                    <span className="text-xs ml-2 text-gray-300">
                                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <UserCircle className="w-5 h-5 mr-1" />
                                    <span className="font-semibold">Client</span>
                                    <span className="text-xs ml-2 text-gray-300">
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
                      className="resize-none bg-gray-700 border-gray-600 text-white"
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
                      className="bg-[#006a9e] hover:bg-blue-700"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={completeSimulation}
                    disabled={isLoading || simulationComplete || messages.length < 3}
                    className="w-full bg-green-700 hover:bg-green-800"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Terminer l'audition
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="evaluation">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center">
                    <FileCheck className="w-6 h-6 mr-2 text-green-500" />
                    <CardTitle>Évaluation de l'audition</CardTitle>
                  </div>
                  <CardDescription className="text-gray-400">
                    Résultat de l'évaluation du consultant par l'IA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!evaluationResult ? (
                    <div className="py-8 text-center">
                      <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                      <p className="text-gray-400">Aucune évaluation disponible</p>
                      <p className="text-gray-500 text-sm mt-2">Terminez l'audition pour voir l'évaluation</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Informations générales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-gray-700 p-3 rounded-md">
                            <p className="text-gray-400 text-sm">Consultant</p>
                            <p>{form.getValues('candidateName')}</p>
                          </div>
                          <div className="bg-gray-700 p-3 rounded-md">
                            <p className="text-gray-400 text-sm">Profil</p>
                            <p>{form.getValues('profileType')?.replace(/_/g, ' ')}</p>
                          </div>
                          <div className="bg-gray-700 p-3 rounded-md">
                            <p className="text-gray-400 text-sm">Expérience</p>
                            <p>{form.getValues('experienceLevel')}</p>
                          </div>
                          <div className="bg-gray-700 p-3 rounded-md">
                            <p className="text-gray-400 text-sm">Durée de l'audition</p>
                            <p>{Math.floor((600 - timeRemaining) / 60)} min {(600 - timeRemaining) % 60} sec</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-700 p-4 rounded-md overflow-auto max-h-[600px]">
                        <h3 className="text-xl font-semibold mb-3">Évaluation détaillée</h3>
                        <div className="prose prose-invert max-w-none">
                          {typeof evaluationResult === 'string' ? (
                            <div dangerouslySetInnerHTML={{ __html: evaluationResult.replace(/\n/g, '<br>') }} />
                          ) : evaluationResult.evaluation ? (
                            <div dangerouslySetInnerHTML={{ __html: evaluationResult.evaluation.replace(/\n/g, '<br>') }} />
                          ) : evaluationResult.content ? (
                            <div dangerouslySetInnerHTML={{ __html: evaluationResult.content.replace(/\n/g, '<br>') }} />
                          ) : (
                            <p className="text-gray-200 whitespace-pre-wrap">{evaluationResult.feedback || "Aucun détail d'évaluation disponible."}</p>
                          )}
                        </div>
                      </div>
                      
                      {evaluationResult.recommendation && (
                        <div className={`p-4 rounded-md ${
                          evaluationResult.recommendation === 'Embaucher' ? 'bg-green-900/50 border border-green-600' :
                          evaluationResult.recommendation === 'Envisager' ? 'bg-blue-900/50 border border-blue-600' :
                          'bg-red-900/50 border border-red-600'
                        }`}>
                          <h3 className="text-lg font-semibold mb-1">Recommandation</h3>
                          <p className="font-medium">{evaluationResult.recommendation}</p>
                        </div>
                      )}
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