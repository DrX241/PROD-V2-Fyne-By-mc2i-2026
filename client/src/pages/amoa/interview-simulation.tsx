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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import HomeLayout from '@/components/layout/HomeLayout';

// Schéma de formulaire pour la configuration de l'entretien
const formSchema = z.object({
  // Champs optionnels (peuvent être ignorés au début)
  recruiterEmail: z.string().email({
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
  sectorFocus: z.string().min(1, {
    message: "Veuillez sélectionner un secteur d'activité.",
  }),
});

// Schéma pour le formulaire de contact à la fin de la simulation (tous les champs sont obligatoires)
const contactFormSchema = z.object({
  // Champs de contact qui étaient optionnels au début, maintenant obligatoires
  recruiterEmail: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  candidateName: z.string().min(2, {
    message: "Le nom du consultant doit contenir au moins 2 caractères.",
  }),
  
  // On inclut également les champs importants pour l'évaluation si jamais ils n'ont pas été correctement
  // définis précédemment (même si en théorie ils devraient déjà avoir été validés)
  profileType: z.string().min(1, {
    message: "Veuillez sélectionner un type de profil.",
  }),
  experienceLevel: z.string().min(1, {
    message: "Veuillez sélectionner un niveau d'expérience.",
  }),
  sectorFocus: z.string().min(1, {
    message: "Veuillez sélectionner un secteur d'activité.",
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

const AmoaInterviewSimulation: React.FC = () => {
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
  
  // Configuration du compte à rebours
  const startTimer = () => {
    console.log("Démarrage du timer...");
    setTimeRemaining(600); // 10 minutes en secondes
  };
  
  // Configuration du formulaire
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recruiterEmail: '',
      candidateName: '',
      profileType: '',
      experienceLevel: '',
      sectorFocus: '',
    },
  });
  
  // Démarrage de la simulation
  const startSimulation = async (values: FormValues) => {
    setIsLoading(true);
    
    // Vérifier si les informations ont été ignorées
    if (!values.recruiterEmail || !values.candidateName) {
      setIsSkippedInfo(true);
    } else {
      setIsSkippedInfo(false);
    }
    
    try {
      const response = await fetch('/api/amoa/interview-simulation/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'amoa',
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
          content: data.initialMessage || "Bonjour, je suis votre interlocuteur client aujourd'hui. Nous allons évaluer vos compétences en assistance à maîtrise d'ouvrage. Présentez-vous et dites-moi ce qui vous intéresse dans ce domaine.",
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
      console.error('Erreur globale:', error);
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
    console.log("Fonction skipInfoAndStart appelée");
    setIsSkippedInfo(true);
    
    // Récupérer les valeurs obligatoires (type de profil, niveau d'expérience, secteur)
    const profileType = form.getValues('profileType');
    const experienceLevel = form.getValues('experienceLevel');
    const sectorFocus = form.getValues('sectorFocus');
    
    // Vérifier que tous les champs obligatoires sont remplis
    if (!profileType || !experienceLevel || !sectorFocus) {
      toast({
        variant: "destructive",
        title: "Champs obligatoires manquants",
        description: "Les champs Type de profil, Niveau d'expérience et Secteur d'activité sont obligatoires."
      });
      return;
    }
    
    console.log("Valeurs du formulaire:", { profileType, experienceLevel, sectorFocus });

    // Appel direct à l'API sans passer par la validation complète du formulaire
    setIsLoading(true);
    
    try {
      console.log("Envoi de la requête API...");
      
      // Préparer les données à envoyer (sans les informations de contact)
      const payload = {
        domain: 'amoa',
        profileType,
        experienceLevel,
        sectorFocus
      };
      
      console.log("Payload:", payload);
      
      const response = await fetch('/api/amoa/interview-simulation/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      console.log("Réponse API status:", response.status);
      
      // Lire le contenu de la réponse
      const responseText = await response.text();
      console.log("Réponse API brute:", responseText);
      
      if (!response.ok) {
        throw new Error(`Erreur lors du démarrage de la simulation: ${responseText}`);
      }
      
      // Convertir la réponse en JSON
      const data = responseText ? JSON.parse(responseText) : {};
      console.log("Données de réponse:", data);
      
      if (!data || !data.success) {
        throw new Error("La réponse de l'API n'est pas dans le format attendu");
      }
      
      // Ajouter le message initial de l'assistant
      const initialMessage = data.initialMessage || "Bonjour, je suis votre interlocuteur client aujourd'hui. Nous allons évaluer vos compétences en assistance à maîtrise d'ouvrage. Présentez-vous et dites-moi ce qui vous intéresse dans ce domaine.";
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
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de démarrer la simulation. Veuillez réessayer.",
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
      const response = await fetch('/api/amoa/interview-simulation/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'amoa',
          message: userMessage.content,
          profileType: form.getValues('profileType'),
          experienceLevel: form.getValues('experienceLevel'),
          sectorFocus: form.getValues('sectorFocus'),
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }
      
      const data = await response.json();
      
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
  
  // Finalisation de la simulation
  const completeSimulation = async () => {
    if (simulationComplete) return;
    
    // Vérifier si toutes les informations nécessaires sont disponibles
    const recruiterEmail = form.getValues('recruiterEmail');
    const candidateName = form.getValues('candidateName');
    const profileType = form.getValues('profileType');
    const experienceLevel = form.getValues('experienceLevel');
    const sectorFocus = form.getValues('sectorFocus');
    
    // Si l'utilisateur a ignoré la saisie des informations de contact OU si email/nom manquent, demander les infos
    if (isSkippedInfo || !recruiterEmail || !candidateName) {
      // Pré-remplir le formulaire final avec les valeurs déjà entrées
      contactForm.setValue('profileType', profileType);
      contactForm.setValue('experienceLevel', experienceLevel);
      contactForm.setValue('sectorFocus', sectorFocus);
      if (recruiterEmail) contactForm.setValue('recruiterEmail', recruiterEmail);
      if (candidateName) contactForm.setValue('candidateName', candidateName);
      
      setShowContactForm(true);
      return;
    }
    
    await finalizeSimulation();
  };
  
  // Soumettre les informations de contact finales et terminer la simulation
  const submitContactInfo = async (contactInfo: ContactFormValues) => {
    // Mettre à jour le formulaire avec toutes les nouvelles valeurs
    form.setValue('recruiterEmail', contactInfo.recruiterEmail);
    form.setValue('candidateName', contactInfo.candidateName);
    form.setValue('profileType', contactInfo.profileType);
    form.setValue('experienceLevel', contactInfo.experienceLevel);
    form.setValue('sectorFocus', contactInfo.sectorFocus);
    
    // Fermer le formulaire de contact
    setShowContactForm(false);
    
    // Finaliser la simulation avec les nouvelles informations
    await finalizeSimulation();
  };
  
  // Finalisation réelle de la simulation après avoir toutes les informations
  const finalizeSimulation = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/amoa/interview-simulation/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'amoa',
          recruiterEmail: form.getValues('recruiterEmail'),
          candidateName: form.getValues('candidateName'),
          profileType: form.getValues('profileType'),
          experienceLevel: form.getValues('experienceLevel'),
          sectorFocus: form.getValues('sectorFocus'),
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          duration: 600 - timeRemaining,
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la finalisation de la simulation');
      }
      
      const data = await response.json();
      
      setEvaluationResult(data);
      setSimulationComplete(true);
      setActiveTab('evaluation');
      
      toast({
        title: "Simulation terminée",
        description: "L'évaluation de votre audition a été envoyée à " + form.getValues('recruiterEmail'),
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
      const response = await fetch('/api/amoa/interview-simulation/analyze-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: notesText,
          candidateName: form.getValues('candidateName'),
          profileType: form.getValues('profileType'),
          experienceLevel: form.getValues('experienceLevel'),
          sectorFocus: form.getValues('sectorFocus'),
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
      recruiterEmail: '',
      candidateName: '',
      profileType: '',
      experienceLevel: '',
      sectorFocus: '',
    });
  };
  
  // Configuration du formulaire de contact à la fin
  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      recruiterEmail: '',
      candidateName: '',
      // Copier les données déjà saisies à partir du formulaire principal
      profileType: form.getValues('profileType'),
      experienceLevel: form.getValues('experienceLevel'),
      sectorFocus: form.getValues('sectorFocus'),
    },
  });
  
  return (
    <HomeLayout>
      {/* Dialogue pour saisir les informations de contact à la fin de la simulation */}
      <AlertDialog open={showContactForm} onOpenChange={setShowContactForm}>
        <AlertDialogContent className="bg-blue-800 text-white border-blue-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Informations pour finaliser la simulation</AlertDialogTitle>
            <AlertDialogDescription className="text-blue-200">
              Veuillez remplir tous les champs ci-dessous pour finaliser la simulation et recevoir l'évaluation par email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <Form {...contactForm}>
            <form onSubmit={contactForm.handleSubmit((data) => {
              // Transférer toutes les données du contactForm vers le form principal
              form.setValue('recruiterEmail', data.recruiterEmail);
              form.setValue('candidateName', data.candidateName);
              form.setValue('profileType', data.profileType);
              form.setValue('experienceLevel', data.experienceLevel);
              form.setValue('sectorFocus', data.sectorFocus);
              
              // Fermer et finaliser
              setShowContactForm(false);
              finalizeSimulation();
            })} className="space-y-4 my-4">
              {/* Informations de contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-200">Informations de contact</h3>
                
                <FormField
                  control={contactForm.control}
                  name="recruiterEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email du responsable</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <Mail className="w-5 h-5 mr-2 text-blue-300 self-center" />
                          <Input placeholder="email@exemple.com" {...field} className="bg-blue-700 border-blue-600 text-white" />
                        </div>
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
                        <div className="flex">
                          <User className="w-5 h-5 mr-2 text-blue-300 self-center" />
                          <Input placeholder="Prénom Nom" {...field} className="bg-blue-700 border-blue-600 text-white" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Informations d'évaluation */}
              <div className="space-y-4 mt-4">
                <h3 className="text-lg font-semibold text-blue-200">Paramètres d'évaluation</h3>
                
                <FormField
                  control={contactForm.control}
                  name="profileType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Type de profil *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-blue-700 border-blue-600 text-white">
                            <SelectValue placeholder="Sélectionnez un profil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-blue-700 border-blue-600 text-white">
                          <SelectItem value="amoa_junior">AMOA Junior</SelectItem>
                          <SelectItem value="amoa_confirme">AMOA Confirmé</SelectItem>
                          <SelectItem value="amoa_expert">AMOA Expert</SelectItem>
                          <SelectItem value="chef_de_projet">Chef de Projet</SelectItem>
                          <SelectItem value="amoa_agile">AMOA Agile/Scrum</SelectItem>
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
                          <SelectTrigger className="bg-blue-700 border-blue-600 text-white">
                            <SelectValue placeholder="Sélectionnez un niveau" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-blue-700 border-blue-600 text-white">
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
                
                <FormField
                  control={contactForm.control}
                  name="sectorFocus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Secteur d'activité *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-blue-700 border-blue-600 text-white">
                            <SelectValue placeholder="Sélectionnez un secteur" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-blue-700 border-blue-600 text-white">
                          <SelectItem value="banque_finance">Banque / Finance</SelectItem>
                          <SelectItem value="assurance">Assurance</SelectItem>
                          <SelectItem value="secteur_public">Secteur Public</SelectItem>
                          <SelectItem value="energie">Énergie</SelectItem>
                          <SelectItem value="telecoms">Télécommunications</SelectItem>
                          <SelectItem value="transport">Transport & Logistique</SelectItem>
                          <SelectItem value="sante">Santé</SelectItem>
                          <SelectItem value="retail">Distribution / Retail</SelectItem>
                          <SelectItem value="industrie">Industrie</SelectItem>
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
                  className="bg-[#006a9e] hover:bg-blue-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Chargement..." : "Soumettre et finaliser"}
                </Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-indigo-800 text-white p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto pt-6"
        >
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              className="mr-4 text-white hover:text-white hover:bg-blue-800"
              onClick={() => navigate("/amoa")}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold">Préparation d'audition auprès d'un client</h1>
          </div>
          
          <p className="text-blue-100 mb-8">
            Cette simulation vous permet de préparer vos consultants AMOA à des auditions auprès de clients ou partenaires commerciaux à travers une conversation de 10 minutes avec un client potentiel simulé par l'IA.
          </p>
          
          {/* L'indicateur de statut OpenAI est maintenant affiché dans le Header */}
          
          {isSimulationActive && !simulationComplete && (
            <div className="fixed top-4 right-4 z-50 flex items-center p-2 rounded-md shadow-lg bg-blue-800 border border-blue-700">
              <Clock className="w-5 h-5 mr-2 text-white" />
              <span className="font-mono text-white">{formatTime(timeRemaining)}</span>
            </div>
          )}
          
          <Tabs 
            defaultValue="configuration" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-5 mb-8">
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
              <TabsTrigger 
                value="notes"
                disabled={!simulationComplete}
              >
                Notes
              </TabsTrigger>
              <TabsTrigger 
                value="synthese"
                disabled={!simulationComplete}
              >
                Synthèse
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="configuration">
              <Card className="bg-blue-800 border-blue-700">
                <CardHeader>
                  <CardTitle>Configuration de l'audition</CardTitle>
                  <CardDescription className="text-blue-200">
                    Configurez les paramètres de la simulation d'audition client
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(startSimulation)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="recruiterEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email du responsable (pour recevoir l'évaluation)</FormLabel>
                              <FormControl>
                                <Input placeholder="email@exemple.com" {...field} className="bg-blue-700 border-blue-600 text-white" />
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
                                <Input placeholder="Nom complet" {...field} className="bg-blue-700 border-blue-600 text-white" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="profileType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type de profil *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-blue-700 border-blue-600 text-white">
                                    <SelectValue placeholder="Sélectionnez un profil" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-blue-700 border-blue-600 text-white">
                                  <SelectItem value="amoa_junior">AMOA Junior</SelectItem>
                                  <SelectItem value="amoa_confirme">AMOA Confirmé</SelectItem>
                                  <SelectItem value="amoa_expert">AMOA Expert</SelectItem>
                                  <SelectItem value="chef_de_projet">Chef de Projet</SelectItem>
                                  <SelectItem value="amoa_agile">AMOA Agile/Scrum</SelectItem>
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
                                  <SelectTrigger className="bg-blue-700 border-blue-600 text-white">
                                    <SelectValue placeholder="Sélectionnez un niveau" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-blue-700 border-blue-600 text-white">
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
                        
                        <FormField
                          control={form.control}
                          name="sectorFocus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Secteur d'activité *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-blue-700 border-blue-600 text-white">
                                    <SelectValue placeholder="Sélectionnez un secteur" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-blue-700 border-blue-600 text-white">
                                  <SelectItem value="banque_finance">Banque & Finance</SelectItem>
                                  <SelectItem value="assurance">Assurance</SelectItem>
                                  <SelectItem value="sante">Santé</SelectItem>
                                  <SelectItem value="industrie">Industrie</SelectItem>
                                  <SelectItem value="secteur_public">Secteur Public</SelectItem>
                                  <SelectItem value="telecom">Télécommunications</SelectItem>
                                  <SelectItem value="energie">Énergie & Utilities</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex gap-4 mt-6">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex-1 border-[#006a9e] text-white hover:bg-blue-700"
                          onClick={() => {
                            console.log("Bouton Ignorer cliqué");
                            skipInfoAndStart();
                          }}
                          disabled={isLoading}
                        >
                          Ignorer les informations de contact
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1 bg-[#006a9e] hover:bg-blue-600"
                          disabled={isLoading}
                        >
                          {isLoading ? "Chargement..." : "Démarrer la simulation"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="simulation">
              <Card className="bg-blue-800 border-blue-700">
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
                  <CardDescription className="text-blue-200">
                    Vous êtes en conversation avec un client potentiel dans le secteur {form.getValues('sectorFocus')?.replace(/_/g, ' ') || 'sélectionné'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 overflow-y-auto mb-4 bg-blue-900 rounded-md p-4">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-blue-300">
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
                                  : 'bg-blue-700 text-white'
                              }`}
                            >
                              <div className="flex items-center mb-1">
                                {message.role === 'user' ? (
                                  <>
                                    <span className="font-semibold">{form.getValues('candidateName') || 'Consultant'}</span>
                                    <span className="text-xs ml-2 text-blue-200">
                                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <UserCircle className="w-5 h-5 mr-1" />
                                    <span className="font-semibold">Client</span>
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
                      className="resize-none bg-blue-700 border-blue-600 text-white"
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
                      className="bg-[#006a9e] hover:bg-blue-600"
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
              <Card className="bg-blue-800 border-blue-700">
                <CardHeader>
                  <div className="flex items-center">
                    <FileCheck className="w-6 h-6 mr-2 text-green-400" />
                    <CardTitle>Évaluation de l'audition</CardTitle>
                  </div>
                  <CardDescription className="text-blue-200">
                    Résultat de l'évaluation de la prestation par l'IA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!evaluationResult ? (
                    <div className="py-8 text-center">
                      <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                      <p className="text-blue-200">Aucune évaluation disponible</p>
                      <p className="text-blue-300 text-sm mt-2">Terminez l'audition pour voir l'évaluation</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Informations générales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-blue-700 p-3 rounded-md">
                            <p className="text-blue-200 text-sm">Consultant</p>
                            <p>{form.getValues('candidateName')}</p>
                          </div>
                          <div className="bg-blue-700 p-3 rounded-md">
                            <p className="text-blue-200 text-sm">Profil</p>
                            <p>{form.getValues('profileType')?.replace(/_/g, ' ')}</p>
                          </div>
                          <div className="bg-blue-700 p-3 rounded-md">
                            <p className="text-blue-200 text-sm">Expérience</p>
                            <p>{form.getValues('experienceLevel')}</p>
                          </div>
                          <div className="bg-blue-700 p-3 rounded-md">
                            <p className="text-blue-200 text-sm">Secteur</p>
                            <p>{form.getValues('sectorFocus')?.replace(/_/g, ' ')}</p>
                          </div>
                          <div className="bg-blue-700 p-3 rounded-md col-span-2">
                            <p className="text-blue-200 text-sm">Durée de l'audition</p>
                            <p>{Math.floor((600 - timeRemaining) / 60)} min {(600 - timeRemaining) % 60} sec</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-700 p-4 rounded-md overflow-auto max-h-[600px]">
                        <h3 className="text-xl font-semibold mb-3">Évaluation détaillée</h3>
                        <div className="prose prose-invert max-w-none">
                          {typeof evaluationResult === 'string' ? (
                            <div dangerouslySetInnerHTML={{ __html: evaluationResult.replace(/\n/g, '<br>') }} />
                          ) : evaluationResult.evaluation ? (
                            <div dangerouslySetInnerHTML={{ __html: evaluationResult.evaluation.replace(/\n/g, '<br>') }} />
                          ) : evaluationResult.content ? (
                            <div dangerouslySetInnerHTML={{ __html: evaluationResult.content.replace(/\n/g, '<br>') }} />
                          ) : (
                            <p className="text-blue-200 whitespace-pre-wrap">{evaluationResult.feedback || "Aucun détail d'évaluation disponible."}</p>
                          )}
                        </div>
                      </div>
                      
                      {evaluationResult.recommendation && (
                        <div className={`p-4 rounded-md ${
                          evaluationResult.recommendation === 'Embaucher' ? 'bg-green-800/50 border border-green-600' :
                          evaluationResult.recommendation === 'Envisager' ? 'bg-blue-900/50 border border-blue-600' :
                          'bg-red-800/50 border border-red-600'
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
                    className="w-full bg-[#006a9e] hover:bg-blue-600"
                  >
                    Nouvelle simulation
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Onglet Notes */}
            <TabsContent value="notes">
              <Card className="bg-blue-800 border-blue-700">
                <CardHeader>
                  <div className="flex items-center">
                    <FileCheck className="w-6 h-6 mr-2 text-green-500" />
                    <CardTitle>Notes du responsable</CardTitle>
                  </div>
                  <CardDescription className="text-blue-200">
                    Ajoutez vos notes sur le consultant pour générer une synthèse structurée
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-blue-700 p-4 rounded-md">
                      <h3 className="text-xl font-semibold mb-4">Guide pour vos notes</h3>
                      <p className="text-blue-200 mb-3">
                        Copiez-collez vos notes en format libre. L'IA structurera ensuite ces informations dans les sections suivantes :
                      </p>
                      <ul className="list-disc ml-5 space-y-1 text-blue-200 text-sm">
                        <li>Présentation générale du profil</li>
                        <li>Description du parcours</li>
                        <li>Premières impressions, posture</li>
                        <li>Motivations conseil, SI, mc2i</li>
                        <li>Projet professionnel et perspectives</li>
                        <li>Potentiel du candidat vs Ambition</li>
                        <li>Autres processus en cours</li>
                        <li>Critères d'évaluation</li>
                        <li>Forces et faiblesses</li>
                        <li>Spécificités stagiaires/alternants</li>
                        <li>Synthèse écrite et raison de la décision</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-700 p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-4">Vos notes sur le consultant</h3>
                      <Textarea 
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        placeholder="Collez ici vos notes d'audition en format libre..."
                        className="min-h-[300px] resize-y bg-blue-900 border-blue-600 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    onClick={resetSimulation}
                    variant="outline"
                    className="border-blue-600 bg-blue-700 hover:bg-blue-600"
                  >
                    Nouvelle simulation
                  </Button>
                  <Button
                    onClick={analyzeNotes}
                    className="bg-[#006a9e] hover:bg-blue-700"
                    disabled={isAnalyzingNotes || !notesText.trim()}
                  >
                    {isAnalyzingNotes ? "Analyse en cours..." : "Analyser et créer la synthèse"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Onglet Synthèse */}
            <TabsContent value="synthese">
              <Card className="bg-blue-800 border-blue-700">
                <CardHeader>
                  <div className="flex items-center">
                    <FileCheck className="w-6 h-6 mr-2 text-green-500" />
                    <CardTitle>Synthèse structurée de l'audition</CardTitle>
                  </div>
                  <CardDescription className="text-blue-200">
                    Synthèse structurée générée à partir de vos notes et de l'évaluation IA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {synthesisResult ? (
                    <div className="space-y-6">
                      <div className="bg-blue-700 p-4 rounded-md">
                        <h3 className="text-xl font-semibold mb-4">Présentation générale du profil</h3>
                        <p className="whitespace-pre-wrap text-blue-100">{synthesisResult.presentation || "Information non disponible"}</p>
                      </div>
                      
                      <div className="bg-blue-700 p-4 rounded-md">
                        <h3 className="text-xl font-semibold mb-4">Description du parcours</h3>
                        <p className="whitespace-pre-wrap text-blue-100">{synthesisResult.parcours || "Information non disponible"}</p>
                      </div>
                      
                      <div className="bg-blue-700 p-4 rounded-md">
                        <h3 className="text-xl font-semibold mb-4">Premières impressions, posture</h3>
                        <p className="whitespace-pre-wrap text-blue-100">{synthesisResult.impressions || "Information non disponible"}</p>
                      </div>
                      
                      <div className="bg-blue-700 p-4 rounded-md">
                        <h3 className="text-xl font-semibold mb-4">Motivations conseil, SI, mc2i</h3>
                        <p className="whitespace-pre-wrap text-blue-100">{synthesisResult.motivations || "Information non disponible"}</p>
                      </div>
                      
                      <div className="bg-blue-700 p-4 rounded-md">
                        <h3 className="text-xl font-semibold mb-4">Projet professionnel et perspectives</h3>
                        <p className="whitespace-pre-wrap text-blue-100">{synthesisResult.projet || "Information non disponible"}</p>
                      </div>
                      
                      <div className="bg-blue-700 p-4 rounded-md">
                        <h3 className="text-xl font-semibold mb-4">Potentiel du candidat vs Ambition</h3>
                        <p className="whitespace-pre-wrap text-blue-100">{synthesisResult.potentiel || "Information non disponible"}</p>
                      </div>
                      
                      {synthesisResult.processus && (
                        <div className="bg-blue-700 p-4 rounded-md">
                          <h3 className="text-xl font-semibold mb-4">Autres processus en cours</h3>
                          <p className="whitespace-pre-wrap text-blue-100">{synthesisResult.processus}</p>
                        </div>
                      )}
                      
                      <div className="bg-blue-700 p-4 rounded-md">
                        <h3 className="text-xl font-semibold mb-4">Critères et évaluation des compétences</h3>
                        <p className="whitespace-pre-wrap text-blue-100">{synthesisResult.criteres || "Information non disponible"}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-700 p-4 rounded-md">
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                            Forces de la candidature
                          </h3>
                          <p className="whitespace-pre-wrap text-blue-100">{synthesisResult.forces || "Information non disponible"}</p>
                        </div>
                        
                        <div className="bg-blue-700 p-4 rounded-md">
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
                            Faiblesses ou points à approfondir
                          </h3>
                          <p className="whitespace-pre-wrap text-blue-100">{synthesisResult.faiblesses || "Information non disponible"}</p>
                        </div>
                      </div>
                      
                      {synthesisResult.anglais && (
                        <div className="bg-blue-700 p-4 rounded-md">
                          <h3 className="text-xl font-semibold mb-4">Niveau d'Anglais</h3>
                          <p className="whitespace-pre-wrap text-blue-100">{synthesisResult.anglais}</p>
                        </div>
                      )}
                      
                      {synthesisResult.stage && (
                        <div className="bg-blue-700 p-4 rounded-md">
                          <h3 className="text-xl font-semibold mb-4">Informations stagiaire/alternant</h3>
                          <p className="whitespace-pre-wrap text-blue-100">{synthesisResult.stage}</p>
                        </div>
                      )}
                      
                      <div className="bg-blue-700 p-4 rounded-md">
                        <h3 className="text-xl font-semibold mb-4">Synthèse écrite</h3>
                        <p className="whitespace-pre-wrap text-blue-100">{synthesisResult.synthese || "Information non disponible"}</p>
                      </div>
                      
                      <div className="bg-blue-700 p-4 rounded-md">
                        <h3 className="text-xl font-semibold mb-4">Raison principale de la décision</h3>
                        <p className="whitespace-pre-wrap text-blue-100">{synthesisResult.raison || "Information non disponible"}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-blue-200 mb-4">Aucune synthèse disponible. Veuillez d'abord analyser vos notes.</p>
                      <Button 
                        onClick={() => setActiveTab('notes')}
                        className="bg-[#006a9e] hover:bg-blue-700"
                      >
                        Aller à l'onglet Notes
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    onClick={resetSimulation}
                    variant="outline"
                    className="border-blue-600 bg-blue-700 hover:bg-blue-600"
                  >
                    Nouvelle simulation
                  </Button>
                  {synthesisResult && (
                    <Button
                      onClick={() => {/* À implémenter: téléchargement de la synthèse */}}
                      className="bg-[#006a9e] hover:bg-blue-700"
                    >
                      Télécharger la synthèse
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </HomeLayout>
  );
};

export default AmoaInterviewSimulation;