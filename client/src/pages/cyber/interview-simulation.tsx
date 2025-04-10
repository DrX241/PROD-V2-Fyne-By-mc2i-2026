import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import {
  Clock,
  Send,
  Shield,
  Rocket,
  ArrowLeft,
  Laptop,
  User,
  Mail,
  CheckCircle,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import HomeLayout from '@/components/layout/HomeLayout';

// Schéma de validation pour le formulaire
const formSchema = z.object({
  recruiterEmail: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  candidateName: z.string().min(2, {
    message: "Le nom du candidat doit contenir au moins 2 caractères.",
  }),
  profileType: z.enum(["pentester", "consultant", "analyste_soc", "responsable_securite"], {
    required_error: "Veuillez sélectionner un type de profil.",
  }),
  experienceLevel: z.enum(["junior", "confirme", "senior"], {
    required_error: "Veuillez sélectionner un niveau d'expérience.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

// Composant principal pour la page de simulation d'entretien
export default function InterviewSimulation() {
  const [step, setStep] = useState<'form' | 'simulation' | 'completed'>('form');
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes en secondes
  const [messages, setMessages] = useState<any[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [simulationData, setSimulationData] = useState<FormValues | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  
  // Initialiser le formulaire avec react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recruiterEmail: "",
      candidateName: "",
      profileType: "consultant",
      experienceLevel: "confirme",
    },
  });

  // Gérer la soumission du formulaire
  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    
    try {
      // Stocker les données du formulaire
      setSimulationData(values);
      
      // Démarrer la simulation
      const response = await axios.post('/api/cyber/interview-simulation/start', {
        ...values,
        domain: 'cyber' // Identifier qu'il s'agit du domaine cybersécurité
      });
      
      // Ajouter le message initial de l'IA
      setMessages([
        {
          id: 1,
          role: 'system',
          content: 'Bienvenue dans votre simulation d\'entretien cybersécurité. Vous disposez de 5 minutes pour répondre aux mises en situation.',
          timestamp: new Date().toISOString(),
        },
        {
          id: 2,
          role: 'assistant',
          content: response.data.initialScenario,
          timestamp: new Date().toISOString(),
        }
      ]);
      
      // Passer à l'étape de simulation
      setStep('simulation');
      setSimulationStarted(true);
      
      // Démarrer le chronomètre
      startTimer();
      
    } catch (error) {
      console.error('Erreur lors du démarrage de la simulation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la simulation. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Démarrer le chronomètre
  const startTimer = () => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          completeSimulation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Envoyer un message dans la simulation
  const sendMessage = async () => {
    if (!userInput.trim() || loading) return;
    
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: userInput,
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setLoading(true);
    
    try {
      // Envoyer le message à l'API
      const response = await axios.post('/api/cyber/interview-simulation/message', {
        message: userInput,
        step: currentStep,
        profileType: simulationData?.profileType,
        experienceLevel: simulationData?.experienceLevel,
        previousMessages: messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      });
      
      // Ajouter la réponse de l'IA
      const aiResponse = {
        id: messages.length + 2,
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, aiResponse]);
      
      // Passer à l'étape suivante si nécessaire
      if (response.data.nextStep) {
        setCurrentStep((prev) => prev + 1);
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      const errorMessage = {
        id: messages.length + 2,
        role: 'system',
        content: 'Une erreur est survenue. Veuillez réessayer.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Terminer la simulation
  const completeSimulation = async () => {
    setLoading(true);
    
    try {
      // Envoyer les résultats à l'API
      await axios.post('/api/cyber/interview-simulation/complete', {
        recruiterEmail: simulationData?.recruiterEmail,
        candidateName: simulationData?.candidateName,
        profileType: simulationData?.profileType,
        experienceLevel: simulationData?.experienceLevel,
        messages,
        duration: 300 - timeRemaining, // Durée utilisée
      });
      
      // Afficher un message de confirmation
      setStep('completed');
      
    } catch (error) {
      console.error('Erreur lors de la finalisation de la simulation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer les résultats. Veuillez contacter le support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Formater le temps restant
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Retourner à l'écran principal
  const goBack = () => {
    if (step === 'simulation' && simulationStarted) {
      if (window.confirm('Êtes-vous sûr de vouloir quitter la simulation? Vos progrès seront perdus.')) {
        navigate('/cyber-mode-selection');
      }
    } else {
      navigate('/cyber-mode-selection');
    }
  };

  // Formater le contenu des messages
  const formatMessage = (content: string) => {
    // Simple mise en forme Markdown
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  // Obtenir le libellé du profil
  const getProfileLabel = (profileType: string) => {
    switch (profileType) {
      case 'pentester': return 'Pentester';
      case 'consultant': return 'Consultant Cybersécurité';
      case 'analyste_soc': return 'Analyste SOC';
      case 'responsable_securite': return 'Responsable Sécurité';
      default: return profileType;
    }
  };

  return (
    <HomeLayout>
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={goBack} className="mr-4">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Simulation d'Entretien - Cybersécurité</h1>
          </div>
          {step === 'simulation' && (
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-600" />
              <span className={`font-mono text-lg ${timeRemaining < 60 ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Étape du formulaire initial */}
        {step === 'form' && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Configuration de la simulation</CardTitle>
              <CardDescription>
                Vous allez mettre en place une simulation d'entretien pour un profil cybersécurité.
                Une fois configurée, l'IA simulera une situation réelle pour évaluer les compétences du candidat.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="recruiterEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email du recruteur</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-500" />
                            <Input {...field} placeholder="email@mc2i.fr" />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Les résultats seront envoyés à cette adresse.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="candidateName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du candidat</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-gray-500" />
                            <Input {...field} placeholder="Prénom NOM" />
                          </div>
                        </FormControl>
                        <FormDescription>
                          La personne qui passera l'évaluation.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="profileType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de profil</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un type de profil" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pentester">Pentester</SelectItem>
                              <SelectItem value="consultant">Consultant Cybersécurité</SelectItem>
                              <SelectItem value="analyste_soc">Analyste SOC</SelectItem>
                              <SelectItem value="responsable_securite">Responsable Sécurité</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Rôle principal attendu du candidat.
                          </FormDescription>
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
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un niveau" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="junior">Junior (0-2 ans)</SelectItem>
                              <SelectItem value="confirme">Confirmé (3-5 ans)</SelectItem>
                              <SelectItem value="senior">Senior (6+ ans)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Niveau d'expérience attendu du candidat.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-6 bg-[#006a9e] hover:bg-[#00557e]"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Préparation en cours...
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-2 h-4 w-4" />
                        Démarrer la simulation
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Étape de la simulation active */}
        {step === 'simulation' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Informations de session */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Informations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-500">Candidat</Label>
                    <p className="font-medium">{simulationData?.candidateName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Profil</Label>
                    <p className="font-medium">
                      {simulationData && getProfileLabel(simulationData.profileType)}
                    </p>
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="capitalize">
                        {simulationData?.experienceLevel}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Étape actuelle</Label>
                    <div className="mt-1">
                      <Progress value={(currentStep / 3) * 100} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        Étape {currentStep} sur 3
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Temps restant</Label>
                    <p className={`font-mono text-lg ${timeRemaining < 60 ? 'text-red-600' : 'text-gray-800'}`}>
                      {formatTime(timeRemaining)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Chat de simulation */}
            <div className="lg:col-span-3">
              <Card className="h-[70vh] flex flex-col">
                <CardHeader className="py-3 border-b">
                  <CardTitle className="text-lg font-medium">Scénario Cybersécurité</CardTitle>
                </CardHeader>
                
                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-3/4 rounded-lg p-3 ${
                            message.role === 'user'
                              ? 'bg-[#006a9e] text-white'
                              : message.role === 'system'
                              ? 'bg-gray-200 text-gray-800'
                              : 'bg-white border border-gray-200 text-gray-800'
                          }`}
                        >
                          <div 
                            dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                          />
                        </div>
                      </div>
                    ))}
                    
                    {loading && (
                      <div className="flex justify-start">
                        <div className="max-w-3/4 bg-gray-100 rounded-lg p-3">
                          <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                {/* Saisie du message */}
                <CardFooter className="p-4 border-t">
                  <div className="flex w-full space-x-2">
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Écrivez votre réponse..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      disabled={loading || timeRemaining === 0}
                      className="flex-1"
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={loading || !userInput.trim() || timeRemaining === 0}
                      className="bg-[#006a9e] hover:bg-[#00557e]"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}

        {/* Étape de complétion */}
        {step === 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-center text-2xl">Simulation terminée</CardTitle>
                <CardDescription className="text-center text-lg">
                  Les résultats ont été envoyés avec succès.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-2">Résumé de la simulation</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Candidat</p>
                      <p className="font-medium">{simulationData?.candidateName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Type de profil</p>
                      <p className="font-medium">
                        {simulationData && getProfileLabel(simulationData.profileType)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Niveau d'expérience</p>
                      <p className="font-medium capitalize">{simulationData?.experienceLevel}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Durée utilisée</p>
                      <p className="font-medium">{formatTime(300 - timeRemaining)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex">
                    <div className="mr-3 mt-0.5">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-800 mb-1">Email envoyé</h3>
                      <p className="text-blue-700 text-sm">
                        Un rapport détaillé a été envoyé à l'adresse {simulationData?.recruiterEmail}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={() => navigate('/cyber-mode-selection')} 
                    className="bg-[#006a9e] hover:bg-[#00557e]"
                  >
                    Retour à l'accueil
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </HomeLayout>
  );
}