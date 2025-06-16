import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Brain, 
  User, 
  Building2, 
  Target, 
  Clock, 
  BookOpen, 
  Sparkles,
  ChevronRight,
  CheckCircle,
  PlayCircle,
  MessageCircle,
  Lightbulb,
  Trophy,
  Download
} from "lucide-react";

interface UserProfile {
  firstName: string;
  company: string;
  activityDomain: string;
  currentRole: string;
  aiGenerativeLevel: string;
  learningObjectives: string[];
  specificNeeds: string;
  timeAvailable: string;
  learningStyle: string;
}

interface PersonalizedProgram {
  programId: string;
  title: string;
  description: string;
  modules: TrainingModule[];
  estimatedDuration: string;
  personalizedRecommendations: string[];
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  exercises: Exercise[];
  practicalExamples: string[];
  keyLearnings: string[];
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  type: string;
  content: string;
  solution?: string;
}

interface LearningSession {
  sessionId: string;
  welcomeMessage: string;
  currentExercise?: Exercise;
  progress: number;
  completedExercises: string[];
}

export default function IAmIA() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: "",
    company: "",
    activityDomain: "",
    currentRole: "",
    aiGenerativeLevel: "",
    learningObjectives: [],
    specificNeeds: "",
    timeAvailable: "",
    learningStyle: ""
  });
  const [personalizedProgram, setPersonalizedProgram] = useState<PersonalizedProgram | null>(null);
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [userInput, setUserInput] = useState("");

  const { toast } = useToast();

  // Génération du programme personnalisé
  const generateProgramMutation = useMutation({
    mutationFn: async (profile: UserProfile) => {
      return await apiRequest('/api/ia/generate-personalized-program', {
        method: 'POST',
        body: JSON.stringify(profile),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      setPersonalizedProgram(data);
      setCurrentStep(3);
      toast({
        title: "Programme généré avec succès",
        description: "Votre formation personnalisée est prête !",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de générer votre programme personnalisé",
        variant: "destructive",
      });
    }
  });

  // Démarrage d'une session d'apprentissage
  const startSessionMutation = useMutation({
    mutationFn: async ({ programId, moduleId }: { programId: string, moduleId: string }) => {
      return await apiRequest(`/api/ia/training/${programId}/module/${moduleId}/start-session`, {
        method: 'POST',
        body: JSON.stringify({ userProfile }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      setCurrentSession(data);
      setChatMessages([{ role: 'assistant', content: data.welcomeMessage }]);
      setCurrentStep(4);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la session d'apprentissage",
        variant: "destructive",
      });
    }
  });

  // Envoi d'un message dans la session d'apprentissage
  const sendMessageMutation = useMutation({
    mutationFn: async ({ sessionId, message }: { sessionId: string, message: string }) => {
      return await apiRequest(`/api/ia/training/session/${sessionId}/message`, {
        method: 'POST',
        body: JSON.stringify({ message, userProfile }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      setChatMessages(prev => [...prev, 
        { role: 'user', content: userInput },
        { role: 'assistant', content: data.response }
      ]);
      setUserInput("");
      if (data.progress) {
        setCurrentSession(prev => prev ? { ...prev, progress: data.progress } : null);
      }
    }
  });

  const handleProfileSubmit = () => {
    if (!userProfile.firstName || !userProfile.company || !userProfile.aiGenerativeLevel) {
      toast({
        title: "Profil incomplet",
        description: "Veuillez remplir les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    generateProgramMutation.mutate(userProfile);
  };

  const handleStartSession = (moduleId: string) => {
    if (personalizedProgram) {
      startSessionMutation.mutate({
        programId: personalizedProgram.programId,
        moduleId
      });
    }
  };

  const handleSendMessage = () => {
    if (userInput.trim() && currentSession) {
      sendMessageMutation.mutate({
        sessionId: currentSession.sessionId,
        message: userInput.trim()
      });
    }
  };

  const aiLevels = [
    { value: "debutant", label: "Débutant - Aucune expérience avec l'IA" },
    { value: "initie", label: "Initié - Quelques connaissances de base" },
    { value: "intermediaire", label: "Intermédiaire - Utilise déjà des outils IA" },
    { value: "avance", label: "Avancé - Expertise technique en IA" }
  ];

  const learningObjectivesList = [
    "Comprendre les fondamentaux de l'IA générative",
    "Maîtriser ChatGPT et autres outils conversationnels",
    "Apprendre le prompt engineering",
    "Intégrer l'IA dans mon travail quotidien",
    "Développer des applications avec l'IA",
    "Comprendre les enjeux éthiques et légaux",
    "Optimiser ma productivité avec l'IA",
    "Former mes équipes à l'IA"
  ];

  const activityDomains = [
    "Marketing & Communication",
    "Ressources Humaines",
    "Finance & Comptabilité",
    "Informatique & Technologie",
    "Santé & Médical",
    "Éducation & Formation",
    "Commerce & Vente",
    "Industrie & Manufacturing",
    "Conseil & Consulting",
    "Juridique",
    "Autre"
  ];

  const timeOptions = [
    { value: "15min", label: "15 minutes par jour" },
    { value: "30min", label: "30 minutes par jour" },
    { value: "1h", label: "1 heure par jour" },
    { value: "2h", label: "2 heures par jour" },
    { value: "weekend", label: "Week-ends uniquement" }
  ];

  const learningStyles = [
    { value: "pratique", label: "Apprentissage pratique - Exercices concrets" },
    { value: "theorique", label: "Apprentissage théorique - Concepts et fondements" },
    { value: "mixte", label: "Apprentissage mixte - Théorie + Pratique" },
    { value: "contextuel", label: "Apprentissage contextuel - Exemples métier" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              I AM IA
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-2">
            Formation personnalisée à l'Intelligence Artificielle Générative
          </p>
          <p className="text-gray-400">
            Développez vos compétences IA avec un programme 100% adapté à votre profil
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
            <span>Étape {currentStep} sur 4</span>
            <span>{Math.round((currentStep / 4) * 100)}% terminé</span>
          </div>
          <Progress value={(currentStep / 4) * 100} className="h-2" />
        </div>

        {/* Step 1: Évaluation de profil */}
        {currentStep === 1 && (
          <Card className="shadow-xl border-0 bg-slate-800/90 backdrop-blur text-white">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <User className="h-6 w-6 text-blue-600" />
                Évaluation de votre profil
              </CardTitle>
              <CardDescription className="text-gray-300">
                Aidez-nous à créer votre programme de formation personnalisé
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={userProfile.firstName}
                    onChange={(e) => setUserProfile(prev => ({...prev, firstName: e.target.value}))}
                    placeholder="Votre prénom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise *</Label>
                  <Input
                    id="company"
                    value={userProfile.company}
                    onChange={(e) => setUserProfile(prev => ({...prev, company: e.target.value}))}
                    placeholder="Nom de votre entreprise"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Secteur d'activité</Label>
                  <Select
                    value={userProfile.activityDomain}
                    onValueChange={(value) => setUserProfile(prev => ({...prev, activityDomain: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre secteur" />
                    </SelectTrigger>
                    <SelectContent>
                      {activityDomains.map(domain => (
                        <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Poste actuel</Label>
                  <Input
                    id="role"
                    value={userProfile.currentRole}
                    onChange={(e) => setUserProfile(prev => ({...prev, currentRole: e.target.value}))}
                    placeholder="Votre fonction"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Niveau actuel en IA générative *</Label>
                <Select
                  value={userProfile.aiGenerativeLevel}
                  onValueChange={(value) => setUserProfile(prev => ({...prev, aiGenerativeLevel: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Évaluez votre niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {aiLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Objectifs d'apprentissage (plusieurs choix possibles)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {learningObjectivesList.map(objective => (
                    <div key={objective} className="flex items-center space-x-2">
                      <Checkbox
                        id={objective}
                        checked={userProfile.learningObjectives.includes(objective)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setUserProfile(prev => ({
                              ...prev,
                              learningObjectives: [...prev.learningObjectives, objective]
                            }));
                          } else {
                            setUserProfile(prev => ({
                              ...prev,
                              learningObjectives: prev.learningObjectives.filter(obj => obj !== objective)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={objective} className="text-sm">
                        {objective}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Temps disponible pour la formation</Label>
                <Select
                  value={userProfile.timeAvailable}
                  onValueChange={(value) => setUserProfile(prev => ({...prev, timeAvailable: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Combien de temps pouvez-vous consacrer ?" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Style d'apprentissage préféré</Label>
                <Select
                  value={userProfile.learningStyle}
                  onValueChange={(value) => setUserProfile(prev => ({...prev, learningStyle: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Comment préférez-vous apprendre ?" />
                  </SelectTrigger>
                  <SelectContent>
                    {learningStyles.map(style => (
                      <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="needs">Besoins spécifiques (optionnel)</Label>
                <Textarea
                  id="needs"
                  value={userProfile.specificNeeds}
                  onChange={(e) => setUserProfile(prev => ({...prev, specificNeeds: e.target.value}))}
                  placeholder="Décrivez vos besoins particuliers, contraintes ou objectifs spécifiques..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleProfileSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={generateProgramMutation.isPending}
              >
                {generateProgramMutation.isPending ? (
                  "Génération de votre programme..."
                ) : (
                  <>
                    Générer mon programme personnalisé
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Génération en cours */}
        {currentStep === 2 && (
          <Card className="shadow-xl border-0 bg-slate-800/90 backdrop-blur text-white">
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                  <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-blue-600 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Génération de votre programme personnalisé</h3>
                  <p className="text-gray-300">
                    Notre IA analyse votre profil pour créer un parcours adapté à vos besoins...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Programme généré */}
        {currentStep === 3 && personalizedProgram && (
          <div className="space-y-6">
            <Card className="shadow-xl border-0 bg-slate-800/90 backdrop-blur text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                  {personalizedProgram.title}
                </CardTitle>
                <CardDescription>{personalizedProgram.description}</CardDescription>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {personalizedProgram.estimatedDuration}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {personalizedProgram.modules.length} modules
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Recommandations personnalisées :</h4>
                  <ul className="space-y-1">
                    {personalizedProgram.personalizedRecommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-4">
                  {personalizedProgram.modules.map((module, index) => (
                    <Card key={module.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{module.title}</CardTitle>
                            <CardDescription>{module.description}</CardDescription>
                          </div>
                          <Badge variant={module.level === 'debutant' ? 'secondary' : module.level === 'intermediaire' ? 'default' : 'destructive'}>
                            {module.level}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {module.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {module.exercises.length} exercices
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-sm mb-1">Apprentissages clés :</h5>
                            <div className="flex flex-wrap gap-1">
                              {module.keyLearnings.map((learning, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {learning}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleStartSession(module.id)}
                            className="w-full"
                            disabled={startSessionMutation.isPending}
                          >
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Commencer ce module
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Session d'apprentissage active */}
        {currentStep === 4 && currentSession && (
          <div className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                  Session d'apprentissage active
                </CardTitle>
                <div className="flex items-center justify-between">
                  <CardDescription>
                    Session ID: {currentSession.sessionId}
                  </CardDescription>
                  <div className="text-sm text-gray-600">
                    Progression: {currentSession.progress}%
                  </div>
                </div>
                <Progress value={currentSession.progress} className="h-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chat Interface */}
                  <ScrollArea className="h-96 border rounded-lg p-4 bg-gray-50">
                    <div className="space-y-4">
                      {chatMessages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border shadow-sm'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="flex gap-2">
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Tapez votre réponse ou question..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={sendMessageMutation.isPending || !userInput.trim()}
                    >
                      Envoyer
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>
                      Retour au programme
                    </Button>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger le résumé
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}