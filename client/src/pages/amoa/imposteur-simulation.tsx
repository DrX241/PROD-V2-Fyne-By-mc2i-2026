import React, { useState, useEffect } from 'react';
import { useNavigate } from 'wouter';
import { HomeLayout } from '@/components/layout/HomeLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ClockIcon,
  UserIcon, 
  Building2Icon, 
  LightbulbIcon, 
  BriefcaseIcon,
  FileTextIcon,
  SendIcon,
  RefreshCwIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface SimulationState {
  isStarted: boolean;
  isCompleted: boolean;
  messages: Message[];
  userInput: string;
  remainingTime: number;
  candidateProfile: CandidateProfile;
}

interface CandidateProfile {
  experienceYears: string;
  sector: string;
  specialty: string;
}

const sectors = [
  { id: 'transport', name: 'Transport et mobilités' },
  { id: 'banking', name: 'Banque et finance' },
  { id: 'public', name: 'Services publics' },
  { id: 'health', name: 'Santé' },
  { id: 'social', name: 'Protection sociale' },
  { id: 'retail', name: 'Retail et luxe' },
  { id: 'insurance', name: 'Assurance' },
  { id: 'industry', name: 'Industrie' }
];

const specialties = [
  { id: 'data', name: 'Data & IA' },
  { id: 'cyber', name: 'Cybersécurité' },
  { id: 'uxui', name: 'UX/UI' },
  { id: 'change', name: 'Change & Adoption' },
  { id: 'agile', name: 'Agilité' },
  { id: 'marketing', name: 'Marketing et expérience client' }
];

export default function ImposteurSimulation() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'setup' | 'simulation' | 'results'>('setup');
  const [simulation, setSimulation] = useState<SimulationState>({
    isStarted: false,
    isCompleted: false,
    messages: [],
    userInput: '',
    remainingTime: 10 * 60, // 10 minutes en secondes
    candidateProfile: {
      experienceYears: '',
      sector: '',
      specialty: ''
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackResults, setFeedbackResults] = useState<any>(null);

  // Timer pour le compte à rebours
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (simulation.isStarted && !simulation.isCompleted && simulation.remainingTime > 0) {
      timer = setInterval(() => {
        setSimulation(prev => ({
          ...prev,
          remainingTime: prev.remainingTime - 1
        }));
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [simulation.isStarted, simulation.isCompleted, simulation.remainingTime]);

  // Effet pour terminer automatiquement quand le temps est écoulé
  useEffect(() => {
    if (simulation.isStarted && !simulation.isCompleted && simulation.remainingTime <= 0) {
      completeSimulation();
    }
  }, [simulation.remainingTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSimulation(prev => ({
      ...prev,
      userInput: e.target.value
    }));
  };

  const handleProfileChange = (field: keyof CandidateProfile, value: string) => {
    setSimulation(prev => ({
      ...prev,
      candidateProfile: {
        ...prev.candidateProfile,
        [field]: value
      }
    }));
  };

  const startSimulation = async () => {
    // Validation du profil
    if (!simulation.candidateProfile.experienceYears || 
        !simulation.candidateProfile.sector || 
        !simulation.candidateProfile.specialty) {
      toast({
        title: "Informations incomplètes",
        description: "Veuillez remplir tous les champs du profil candidat pour commencer.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/amoa/imposteur-simulation/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateProfile: simulation.candidateProfile
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du démarrage de la simulation');
      }

      const data = await response.json();

      setSimulation(prev => ({
        ...prev,
        isStarted: true,
        messages: [
          { role: 'assistant', content: data.initialMessage || 'Bonjour, je suis votre recruteur pour cet entretien. Pouvez-vous vous présenter et me parler de votre parcours professionnel?' }
        ]
      }));

      setActiveView('simulation');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du démarrage de la simulation. Veuillez réessayer.",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!simulation.userInput.trim()) return;

    // Ajout du message utilisateur
    const userMessage = { role: 'user' as const, content: simulation.userInput.trim() };
    
    setSimulation(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      userInput: ''
    }));

    setIsLoading(true);

    try {
      const response = await fetch('/api/amoa/imposteur-simulation/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          candidateProfile: simulation.candidateProfile,
          remainingTime: simulation.remainingTime
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }

      const data = await response.json();

      // Ajout de la réponse de l'assistant
      setSimulation(prev => ({
        ...prev,
        messages: [...prev.messages, { role: 'assistant', content: data.message }]
      }));
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeSimulation = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/amoa/imposteur-simulation/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: simulation.messages,
          candidateProfile: simulation.candidateProfile
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la finalisation de la simulation');
      }

      const data = await response.json();

      setFeedbackResults(data);
      setSimulation(prev => ({
        ...prev,
        isCompleted: true
      }));
      setActiveView('results');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la finalisation de la simulation. Veuillez réessayer.",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSimulation = () => {
    setSimulation({
      isStarted: false,
      isCompleted: false,
      messages: [],
      userInput: '',
      remainingTime: 10 * 60,
      candidateProfile: {
        experienceYears: '',
        sector: '',
        specialty: ''
      }
    });
    setFeedbackResults(null);
    setActiveView('setup');
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <HomeLayout>
      <div className="container max-w-6xl py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Qui est l'imposteur ?</h1>
            <p className="text-lg text-muted-foreground mt-1">
              Simulation d'entretien avec analyse des réponses
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/amoa-mode-selection')}
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>

        <Card className="mb-8">
          {activeView === 'setup' && (
            <>
              <CardHeader>
                <CardTitle>Configuration de la simulation</CardTitle>
                <CardDescription>
                  Renseignez les informations du profil pour commencer la simulation d'entretien
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="experienceYears">Années d'expérience</Label>
                    <Select
                      value={simulation.candidateProfile.experienceYears}
                      onValueChange={(value) => handleProfileChange('experienceYears', value)}
                    >
                      <SelectTrigger id="experienceYears">
                        <SelectValue placeholder="Sélectionnez..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-2">0-2 ans</SelectItem>
                        <SelectItem value="3-5">3-5 ans</SelectItem>
                        <SelectItem value="6-10">6-10 ans</SelectItem>
                        <SelectItem value="10+">Plus de 10 ans</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="sector">Secteur d'activité</Label>
                    <Select
                      value={simulation.candidateProfile.sector}
                      onValueChange={(value) => handleProfileChange('sector', value)}
                    >
                      <SelectTrigger id="sector">
                        <SelectValue placeholder="Sélectionnez..." />
                      </SelectTrigger>
                      <SelectContent>
                        {sectors.map(sector => (
                          <SelectItem key={sector.id} value={sector.id}>
                            {sector.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="specialty">Spécialité</Label>
                    <Select
                      value={simulation.candidateProfile.specialty}
                      onValueChange={(value) => handleProfileChange('specialty', value)}
                    >
                      <SelectTrigger id="specialty">
                        <SelectValue placeholder="Sélectionnez..." />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map(specialty => (
                          <SelectItem key={specialty.id} value={specialty.id}>
                            {specialty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-md border border-amber-200 mt-6">
                  <div className="flex gap-2 text-amber-800">
                    <LightbulbIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Comment ça fonctionne ?</p>
                      <p className="mt-1 text-sm">
                        Cette simulation d'entretien dure 10 minutes. L'IA va vous poser des questions adaptées 
                        à votre profil et à vos expériences supposées. À la fin, une analyse détaillée de vos 
                        réponses sera générée pour évaluer votre cohérence et vos compétences.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3">
                <Button
                  onClick={startSimulation}
                  disabled={isLoading}
                >
                  {isLoading ? 'Initialisation...' : 'Commencer la simulation'}
                </Button>
              </CardFooter>
            </>
          )}

          {activeView === 'simulation' && (
            <>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Simulation d'entretien en cours</CardTitle>
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-amber-500 mr-2" />
                    <span className={`font-mono text-lg ${simulation.remainingTime < 60 ? 'text-red-500 font-bold' : ''}`}>
                      {formatTime(simulation.remainingTime)}
                    </span>
                  </div>
                </div>
                <CardDescription className="mt-1">
                  Échangez avec l'IA comme dans un véritable entretien
                </CardDescription>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                    {
                      simulation.candidateProfile.experienceYears === "0-2" ? "Junior" : 
                      simulation.candidateProfile.experienceYears === "3-5" ? "Confirmé" : 
                      simulation.candidateProfile.experienceYears === "6-10" ? "Senior" : "Expert"
                    }
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                    {sectors.find(s => s.id === simulation.candidateProfile.sector)?.name || simulation.candidateProfile.sector}
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
                    {specialties.find(s => s.id === simulation.candidateProfile.specialty)?.name || simulation.candidateProfile.specialty}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Separator className="my-3" />
                
                <div className="h-[400px] overflow-y-auto p-4 border rounded-md mb-4 bg-gray-50">
                  {simulation.messages.map((message, index) => (
                    <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block max-w-[80%] rounded-lg p-3 
                        ${message.role === 'user' 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'bg-white border text-gray-900'}`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="inline-block max-w-[80%] rounded-lg p-3 bg-white border">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                          <span className="text-sm text-gray-400 ml-1">En train d'écrire...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <Textarea
                    value={simulation.userInput}
                    onChange={handleInputChange}
                    placeholder="Tapez votre réponse ici..."
                    className="flex-1"
                    rows={3}
                    disabled={isLoading || simulation.isCompleted}
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || simulation.isCompleted || !simulation.userInput.trim()}
                    >
                      <SendIcon className="h-4 w-4 mr-2" />
                      Envoyer
                    </Button>
                    <Button
                      variant="outline"
                      onClick={completeSimulation}
                      disabled={isLoading || simulation.isCompleted}
                    >
                      Terminer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {activeView === 'results' && feedbackResults && (
            <>
              <CardHeader>
                <CardTitle>Résultats de l'évaluation</CardTitle>
                <CardDescription>
                  Analyse détaillée de vos réponses et de votre cohérence
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="strengths">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="strengths">Points forts</TabsTrigger>
                    <TabsTrigger value="weaknesses">Points à améliorer</TabsTrigger>
                    <TabsTrigger value="overall">Évaluation globale</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="strengths" className="mt-4 space-y-4">
                    <div className="bg-green-50 p-5 rounded-md border border-green-200">
                      <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                        <CheckCircleIcon className="mr-2 h-5 w-5" />
                        Forces identifiées
                      </h3>
                      <div className="space-y-3">
                        {feedbackResults.strengths?.map((strength: string, i: number) => (
                          <div key={i} className="flex gap-2">
                            <div className="bg-green-200 text-green-800 rounded-full w-6 h-6 flex-shrink-0 flex items-center justify-center mt-0.5">
                              {i + 1}
                            </div>
                            <p className="text-green-800">{strength}</p>
                          </div>
                        ))}
                        {(!feedbackResults.strengths || feedbackResults.strengths.length === 0) && (
                          <p className="text-gray-500 italic">Aucune force identifiée.</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="weaknesses" className="mt-4 space-y-4">
                    <div className="bg-amber-50 p-5 rounded-md border border-amber-200">
                      <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center">
                        <AlertCircleIcon className="mr-2 h-5 w-5" />
                        Points à améliorer
                      </h3>
                      <div className="space-y-3">
                        {feedbackResults.weaknesses?.map((weakness: string, i: number) => (
                          <div key={i} className="flex gap-2">
                            <div className="bg-amber-200 text-amber-800 rounded-full w-6 h-6 flex-shrink-0 flex items-center justify-center mt-0.5">
                              {i + 1}
                            </div>
                            <p className="text-amber-800">{weakness}</p>
                          </div>
                        ))}
                        {(!feedbackResults.weaknesses || feedbackResults.weaknesses.length === 0) && (
                          <p className="text-gray-500 italic">Aucun point d'amélioration identifié.</p>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="overall" className="mt-4 space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle>Évaluation générale</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Cohérence du discours</h4>
                            <Progress value={feedbackResults.coherenceScore || 0} className="h-3" />
                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                              <span>Faible</span>
                              <span>Excellente</span>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Pertinence professionnelle</h4>
                            <Progress value={feedbackResults.relevanceScore || 0} className="h-3" />
                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                              <span>Faible</span>
                              <span>Excellente</span>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Expertise technique</h4>
                            <Progress value={feedbackResults.technicalScore || 0} className="h-3" />
                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                              <span>Faible</span>
                              <span>Excellente</span>
                            </div>
                          </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Commentaire général</h4>
                          <p className="text-gray-700 whitespace-pre-line">
                            {feedbackResults.overallComment || "Aucun commentaire disponible."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={resetSimulation}
                >
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  Recommencer
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </HomeLayout>
  );
}