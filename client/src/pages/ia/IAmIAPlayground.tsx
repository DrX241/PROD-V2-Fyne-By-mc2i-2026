import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Brain, MessageCircle, Send, Sparkles, User, Bot, Lightbulb, Code, FileText, Zap } from "lucide-react";

interface UserProfile {
  firstName: string;
  company: string;
  activityDomain: string;
  currentRole: string;
  aiGenerativeLevel: string;
  learningObjectives: string[];
  specificNeeds: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function IAmIAPlayground() {
  const [showProfile, setShowProfile] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: "",
    company: "",
    activityDomain: "",
    currentRole: "",
    aiGenerativeLevel: "",
    learningObjectives: [],
    specificNeeds: ""
  });
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [playgroundMode, setPlaygroundMode] = useState<'chat' | 'exercises' | 'examples'>('chat');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const activityDomains = [
    "Technologie", "Finance", "Santé", "Éducation", "Commerce", "Industrie",
    "Services", "Médias", "Agriculture", "Immobilier", "Transport", "Autre"
  ];

  const aiLevels = [
    { value: "debutant", label: "Débutant - Jamais utilisé d'IA générative" },
    { value: "novice", label: "Novice - Quelques essais avec ChatGPT" },
    { value: "intermediaire", label: "Intermédiaire - Usage régulier d'outils IA" },
    { value: "avance", label: "Avancé - Intégration dans mon workflow" }
  ];

  const learningObjectivesList = [
    "Prompting efficace",
    "Automatisation de tâches",
    "Création de contenu",
    "Analyse de données",
    "Code et développement",
    "Stratégie d'entreprise",
    "Formation d'équipe"
  ];

  // Mutation pour démarrer le playground
  const startPlaygroundMutation = useMutation({
    mutationFn: async (profile: UserProfile) => {
      return await apiRequest('/api/ia/playground/start', {
        method: 'POST',
        body: JSON.stringify(profile),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      setShowProfile(false);
      setChatMessages([{
        role: 'assistant',
        content: data.welcomeMessage,
        timestamp: new Date()
      }]);
      toast({
        title: "Playground activé",
        description: `Bienvenue ${userProfile.firstName} ! Votre environnement d'apprentissage IA est prêt.`
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de démarrer le playground",
        variant: "destructive"
      });
    }
  });

  // Mutation pour envoyer des messages
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiRequest('/api/ia/playground/message', {
        method: 'POST',
        body: JSON.stringify({ 
          message, 
          mode: playgroundMode,
          userProfile 
        }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: (data) => {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }]);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    }
  });

  const handleStartPlayground = () => {
    if (!userProfile.firstName || !userProfile.company || !userProfile.aiGenerativeLevel) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir au minimum votre prénom, entreprise et niveau IA",
        variant: "destructive"
      });
      return;
    }
    startPlaygroundMutation.mutate(userProfile);
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate(userInput);
    setUserInput("");
  };

  // Auto-scroll vers le bas
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatMessages]);

  if (showProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                I AM IA - Playground
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-2">
              Playground d'apprentissage IA générative personnalisé
            </p>
            <p className="text-gray-400">
              Créez votre profil et accédez immédiatement à votre environnement d'apprentissage
            </p>
          </div>

          <Card className="shadow-xl border-0 bg-slate-800/90 backdrop-blur text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6 text-blue-600" />
                Configurez votre playground
              </CardTitle>
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
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise *</Label>
                  <Input
                    id="company"
                    value={userProfile.company}
                    onChange={(e) => setUserProfile(prev => ({...prev, company: e.target.value}))}
                    placeholder="Nom de votre entreprise"
                    className="bg-slate-700 border-slate-600"
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
                    <SelectTrigger className="bg-slate-700 border-slate-600">
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
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Niveau actuel en IA générative *</Label>
                <Select
                  value={userProfile.aiGenerativeLevel}
                  onValueChange={(value) => setUserProfile(prev => ({...prev, aiGenerativeLevel: value}))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600">
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
                <Label>Objectifs d'apprentissage</Label>
                <div className="grid grid-cols-2 gap-3">
                  {learningObjectivesList.map(objective => (
                    <div key={objective} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={objective}
                        checked={userProfile.learningObjectives.includes(objective)}
                        onChange={(e) => {
                          if (e.target.checked) {
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
                        className="rounded border-slate-600"
                      />
                      <Label htmlFor={objective} className="text-sm text-gray-300">
                        {objective}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="needs">Besoins spécifiques (optionnel)</Label>
                <Textarea
                  id="needs"
                  value={userProfile.specificNeeds}
                  onChange={(e) => setUserProfile(prev => ({...prev, specificNeeds: e.target.value}))}
                  placeholder="Décrivez vos besoins particuliers, projets spécifiques..."
                  rows={3}
                  className="bg-slate-700 border-slate-600"
                />
              </div>

              <Button 
                onClick={handleStartPlayground}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={startPlaygroundMutation.isPending}
              >
                {startPlaygroundMutation.isPending ? (
                  <><Sparkles className="mr-2 h-4 w-4 animate-spin" /> Préparation du playground...</>
                ) : (
                  <><Zap className="mr-2 h-4 w-4" /> Lancer mon playground IA</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Playground IA - {userProfile.firstName}
              </h1>
              <p className="text-gray-400 text-sm">
                {userProfile.company} • {userProfile.aiGenerativeLevel}
              </p>
            </div>
          </div>
          
          {/* Mode Selector */}
          <div className="flex gap-2">
            <Button
              variant={playgroundMode === 'chat' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPlaygroundMode('chat')}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Chat IA
            </Button>
            <Button
              variant={playgroundMode === 'exercises' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPlaygroundMode('exercises')}
            >
              <Lightbulb className="h-4 w-4 mr-1" />
              Exercices
            </Button>
            <Button
              variant={playgroundMode === 'examples' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPlaygroundMode('examples')}
            >
              <Code className="h-4 w-4 mr-1" />
              Exemples
            </Button>
          </div>
        </div>

        {/* Main Playground */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col bg-slate-800/90 backdrop-blur border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white">
                  <MessageCircle className="h-5 w-5" />
                  {playgroundMode === 'chat' && 'Assistant IA Personnalisé'}
                  {playgroundMode === 'exercises' && 'Exercices Pratiques'}
                  {playgroundMode === 'examples' && 'Exemples Métier'}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                  <div className="space-y-4">
                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start gap-3 max-w-[80%]`}>
                          {message.role === 'assistant' && (
                            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex-shrink-0">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                          )}
                          <div
                            className={`p-4 rounded-lg ${
                              message.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-700 text-gray-100 border border-slate-600'
                            }`}
                          >
                            <div className="whitespace-pre-wrap text-sm">
                              {message.content}
                            </div>
                            <div className="text-xs opacity-60 mt-2">
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                          {message.role === 'user' && (
                            <div className="p-2 bg-blue-600 rounded-full flex-shrink-0">
                              <User className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                {/* Input Area */}
                <div className="p-4 border-t border-slate-600">
                  <div className="flex gap-2">
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder={
                        playgroundMode === 'chat' ? "Posez votre question sur l'IA générative..." :
                        playgroundMode === 'exercises' ? "Demandez un exercice pratique..." :
                        "Demandez un exemple pour votre secteur..."
                      }
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={sendMessageMutation.isPending}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={sendMessageMutation.isPending || !userInput.trim()}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="bg-slate-800/90 backdrop-blur border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">Votre Profil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs">
                  <p className="text-gray-400">Entreprise</p>
                  <p className="text-white">{userProfile.company}</p>
                </div>
                <div className="text-xs">
                  <p className="text-gray-400">Secteur</p>
                  <p className="text-white">{userProfile.activityDomain || 'Non spécifié'}</p>
                </div>
                <div className="text-xs">
                  <p className="text-gray-400">Niveau IA</p>
                  <Badge variant="secondary" className="text-xs">
                    {userProfile.aiGenerativeLevel}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/90 backdrop-blur border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-xs text-gray-300"
                    onClick={() => setUserInput("Comment améliorer mes prompts ?")}
                  >
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Améliorer mes prompts
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-xs text-gray-300"
                    onClick={() => setUserInput("Montre-moi un exemple pour mon secteur")}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Exemple métier
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-xs text-gray-300"
                    onClick={() => setUserInput("Donne-moi un exercice pratique")}
                  >
                    <Code className="h-3 w-3 mr-1" />
                    Exercice pratique
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}