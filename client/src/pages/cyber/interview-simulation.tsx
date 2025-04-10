import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserCircle, Send, Clock, CheckCircle, AlertCircle, FileCheck, ArrowLeft } from 'lucide-react';
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import HomeLayout from '@/components/layout/HomeLayout';

// Schéma de formulaire pour la configuration de l'entretien
const formSchema = z.object({
  recruiterEmail: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  candidateName: z.string().min(2, {
    message: "Le nom du candidat doit contenir au moins 2 caractères.",
  }),
  profileType: z.string().min(1, {
    message: "Veuillez sélectionner un type de profil.",
  }),
  experienceLevel: z.string().min(1, {
    message: "Veuillez sélectionner un niveau d'expérience.",
  }),
});

// Type d'inférence pour le schéma de formulaire
type FormValues = z.infer<typeof formSchema>;

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
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes en secondes
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  
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
      recruiterEmail: '',
      candidateName: '',
      profileType: '',
      experienceLevel: '',
    },
  });
  
  // Démarrage de la simulation
  const startSimulation = async (values: FormValues) => {
    setIsLoading(true);
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
          content: data.initialMessage || "Bonjour, je suis votre recruteur aujourd'hui. Nous allons évaluer vos compétences en cybersécurité. Présentez-vous et dites-moi ce qui vous intéresse dans ce domaine.",
          timestamp: new Date(),
        },
      ]);
      
      setIsSimulationActive(true);
      setActiveTab('simulation');
      toast({
        title: "Simulation démarrée",
        description: "La simulation d'entretien a commencé. Vous avez 5 minutes.",
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
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/cyber/interview-simulation/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'cyber',
          recruiterEmail: form.getValues('recruiterEmail'),
          candidateName: form.getValues('candidateName'),
          profileType: form.getValues('profileType'),
          experienceLevel: form.getValues('experienceLevel'),
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          duration: 300 - timeRemaining,
        }),
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
        description: "L'évaluation de votre entretien est disponible.",
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
  
  // Vider et recommencer
  const resetSimulation = () => {
    setMessages([]);
    setIsSimulationActive(false);
    setTimeRemaining(300);
    setSimulationComplete(false);
    setEvaluationResult(null);
    setActiveTab('configuration');
    form.reset({
      recruiterEmail: '',
      candidateName: '',
      profileType: '',
      experienceLevel: '',
    });
  };
  
  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto pt-6"
        >
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              className="mr-4 text-white hover:text-white hover:bg-gray-700"
              onClick={() => navigate("/cyber")}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold">Simulation d'Entretien Cybersécurité</h1>
          </div>
          
          <p className="mb-8 text-gray-300">
            Cette simulation vous permet d'évaluer les compétences des candidats aux postes de cybersécurité à travers une conversation de 5 minutes avec un recruteur IA.
          </p>
          
          <Tabs 
            defaultValue="configuration" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
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
                  <CardTitle>Configuration de l'entretien</CardTitle>
                  <CardDescription className="text-gray-400">
                    Configurez les paramètres de la simulation d'entretien
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
                              <FormLabel>Email du recruteur (pour recevoir l'évaluation)</FormLabel>
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
                              <FormLabel>Nom du candidat</FormLabel>
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
                              <FormLabel>Type de profil</FormLabel>
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
                              <FormLabel>Niveau d'expérience</FormLabel>
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
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-[#006a9e] hover:bg-blue-700"
                        disabled={isLoading}
                      >
                        {isLoading ? "Chargement..." : "Démarrer la simulation"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="simulation">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Entretien en cours</CardTitle>
                    <div className={`flex items-center p-2 rounded-md ${
                      timeRemaining > 60 ? "bg-blue-900" : "bg-red-900"
                    }`}>
                      <Clock className="w-5 h-5 mr-2" />
                      <span className="font-mono">{formatTime(timeRemaining)}</span>
                    </div>
                  </div>
                  <CardDescription className="text-gray-400">
                    Vous êtes en conversation avec un recruteur spécialisé en cybersécurité
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
                                    <span className="font-semibold">{form.getValues('candidateName') || 'Candidat'}</span>
                                    <span className="text-xs ml-2 text-gray-300">
                                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <UserCircle className="w-5 h-5 mr-1" />
                                    <span className="font-semibold">Recruteur</span>
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
                    Terminer l'entretien
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="evaluation">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center">
                    <FileCheck className="w-6 h-6 mr-2 text-green-500" />
                    <CardTitle>Évaluation de l'entretien</CardTitle>
                  </div>
                  <CardDescription className="text-gray-400">
                    Résultat de l'évaluation du candidat par l'IA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!evaluationResult ? (
                    <div className="py-8 text-center">
                      <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                      <p className="text-gray-400">Aucune évaluation disponible</p>
                      <p className="text-gray-500 text-sm mt-2">Terminez l'entretien pour voir l'évaluation</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Informations générales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-gray-700 p-3 rounded-md">
                            <p className="text-gray-400 text-sm">Candidat</p>
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
                            <p className="text-gray-400 text-sm">Durée de l'entretien</p>
                            <p>{Math.floor((300 - timeRemaining) / 60)} min {(300 - timeRemaining) % 60} sec</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Note globale</h3>
                        <div className="flex items-center justify-center bg-gray-700 p-6 rounded-md">
                          <div 
                            className={`text-5xl font-bold rounded-full w-24 h-24 flex items-center justify-center
                              ${evaluationResult.overallScore >= 80 ? 'bg-green-900 text-green-300' : 
                                evaluationResult.overallScore >= 60 ? 'bg-blue-900 text-blue-300' : 
                                evaluationResult.overallScore >= 40 ? 'bg-yellow-900 text-yellow-300' : 
                                'bg-red-900 text-red-300'}`}
                          >
                            {evaluationResult.overallScore}/100
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Évaluation par compétence</h3>
                        <div className="space-y-3">
                          {evaluationResult.skillsEvaluation && Object.entries(evaluationResult.skillsEvaluation).map(([skill, score]: [string, any]) => (
                            <div key={skill} className="bg-gray-700 p-3 rounded-md">
                              <div className="flex justify-between mb-2">
                                <span className="font-medium">{skill}</span>
                                <Badge 
                                  className={
                                    score >= 80 ? 'bg-green-800 text-green-200' : 
                                    score >= 60 ? 'bg-blue-800 text-blue-200' : 
                                    score >= 40 ? 'bg-yellow-800 text-yellow-200' : 
                                    'bg-red-800 text-red-200'
                                  }
                                >
                                  {score}/100
                                </Badge>
                              </div>
                              <div className="w-full bg-gray-800 rounded-full h-2.5">
                                <div 
                                  className={`h-2.5 rounded-full ${
                                    score >= 80 ? 'bg-green-500' : 
                                    score >= 60 ? 'bg-blue-500' : 
                                    score >= 40 ? 'bg-yellow-500' : 
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${score}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Commentaires</h3>
                        <div className="bg-gray-700 p-4 rounded-md whitespace-pre-wrap">
                          {evaluationResult.feedback}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Points forts</h3>
                        <div className="bg-gray-700 p-4 rounded-md">
                          <ul className="list-disc pl-5 space-y-1">
                            {evaluationResult.strengths && evaluationResult.strengths.map((strength: string, index: number) => (
                              <li key={index}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Axes d'amélioration</h3>
                        <div className="bg-gray-700 p-4 rounded-md">
                          <ul className="list-disc pl-5 space-y-1">
                            {evaluationResult.areasForImprovement && evaluationResult.areasForImprovement.map((area: string, index: number) => (
                              <li key={index}>{area}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Recommandation</h3>
                        <div className={`p-4 rounded-md ${
                          evaluationResult.recommendation === 'Embaucher' ? 'bg-green-900/50' :
                          evaluationResult.recommendation === 'Envisager' ? 'bg-blue-900/50' :
                          'bg-red-900/50'
                        }`}>
                          <p className="font-medium">{evaluationResult.recommendation}</p>
                        </div>
                      </div>
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
        </motion.div>
      </div>
    </HomeLayout>
  );
};

export default CyberInterviewSimulation;