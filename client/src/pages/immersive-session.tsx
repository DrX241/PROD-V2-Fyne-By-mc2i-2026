import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertCircle, 
  ChevronLeft, 
  Clock, 
  MessageSquare, 
  ClipboardList, 
  User, 
  FileText, 
  Bell, 
  BarChart,
  Shield,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  SimulationSession, 
  DecisionOption, 
  ScenarioEvent,
  NPCCharacter,
  Notification as SimNotification,
  ImmersiveConversation
} from '@/types/immersive-cyber';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

export default function ImmersiveSession() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute<{ id: string }>('/immersive-simulation/session/:id');
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('main');
  const [currentConversation, setCurrentConversation] = useState<ImmersiveConversation | null>(null);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  
  // Récupérer les données de la session
  const { 
    data: sessionData, 
    isLoading: isLoadingSession, 
    error: sessionError,
    refetch: refetchSession
  } = useQuery<{ success: boolean, session: SimulationSession }>({
    queryKey: ['/api/immersive-simulation/sessions', params?.id],
    enabled: !!params?.id,
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  // Requête pour récupérer les personnages disponibles
  const { 
    data: charactersData,
    isLoading: isLoadingCharacters
  } = useQuery<{ success: boolean, characters: NPCCharacter[] }>({
    queryKey: ['/api/immersive-simulation/sessions', params?.id, 'characters'],
    enabled: !!params?.id && !!sessionData?.session,
  });

  // Requête pour récupérer les conversations
  const { 
    data: conversationsData,
    isLoading: isLoadingConversations,
    refetch: refetchConversations
  } = useQuery<{ success: boolean, conversations: ImmersiveConversation[] }>({
    queryKey: ['/api/immersive-simulation/sessions', params?.id, 'conversations'],
    enabled: !!params?.id && !!sessionData?.session,
  });

  // Mutation pour prendre une décision
  const decisionMutation = useMutation({
    mutationFn: async (decisionId: string) => {
      return apiRequest(`/api/immersive-simulation/sessions/${params?.id}/decisions`, {
        method: 'POST',
        body: JSON.stringify({
          decisionId
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/immersive-simulation/sessions', params?.id] });
      setShowDecisionDialog(false);
      toast({
        title: "Décision prise",
        description: "Votre décision a été enregistrée et le scénario va évoluer en conséquence.",
      });
    }
  });

  // Mutation pour démarrer une conversation
  const startConversationMutation = useMutation({
    mutationFn: async (characterId: string) => {
      return apiRequest(`/api/immersive-simulation/sessions/${params?.id}/conversations`, {
        method: 'POST',
        body: JSON.stringify({
          characterId
        })
      });
    },
    onSuccess: (data) => {
      if (data.success && data.conversation) {
        setCurrentConversation(data.conversation);
        setActiveTab('conversation');
        refetchConversations();
      }
    }
  });

  // Mutation pour envoyer un message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentConversation) return null;
      
      return apiRequest(`/api/immersive-simulation/conversations/${currentConversation.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          content,
          sessionId: params?.id
        })
      });
    },
    onSuccess: (data) => {
      if (data?.success && data.conversation) {
        setCurrentConversation(data.conversation);
        setMessageInput('');
      }
      refetchConversations();
    }
  });

  // Gestion des erreurs
  useEffect(() => {
    if (sessionError) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la session. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  }, [sessionError, toast]);

  if (isLoadingSession) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="mb-6">
              <CardHeader>
                <Skeleton className="h-6 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionData?.success || !sessionData.session) {
    return (
      <div className="container mx-auto p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Session introuvable</h2>
        <p className="mb-4">La session demandée n'existe pas ou n'est plus disponible.</p>
        <Button onClick={() => setLocation('/immersive-simulation')}>
          Retour aux scénarios
        </Button>
      </div>
    );
  }

  const session = sessionData.session;
  const currentPhase = session.currentPhase;
  const pendingDecisions = currentPhase?.decisionPoints?.filter(dp => 
    !session.decisions.some(d => d.decisionPointId === dp.id)
  ) || [];
  
  const notifications = currentPhase?.notifications?.filter(notif => 
    notif.visibleToRoles.includes(session.userRole)
  ) || [];
  
  const events = currentPhase?.events?.filter(event => 
    !event.visibleToRoles || event.visibleToRoles.includes(session.userRole)
  ) || [];

  const handleSelectDecision = (decisionId: string) => {
    setSelectedDecisionId(decisionId);
    setShowDecisionDialog(true);
  };

  const handleMakeDecision = () => {
    if (selectedDecisionId) {
      decisionMutation.mutate(selectedDecisionId);
    }
  };

  const handleStartConversation = (characterId: string) => {
    startConversationMutation.mutate(characterId);
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && currentConversation) {
      sendMessageMutation.mutate(messageInput.trim());
    }
  };

  const findDecisionOption = (decisionId: string): DecisionOption | undefined => {
    let option: DecisionOption | undefined;
    
    pendingDecisions.forEach(decision => {
      const found = decision.options.find(opt => opt.id === decisionId);
      if (found) option = found;
    });
    
    return option;
  };

  const findCharacterById = (id: string): NPCCharacter | undefined => {
    return charactersData?.characters.find(char => char.id === id);
  };

  const getEventIcon = (event: ScenarioEvent) => {
    switch(event.type) {
      case 'notification':
        return <Bell className="h-5 w-5 text-yellow-500" />;
      case 'communication':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'system':
        return <Shield className="h-5 w-5 text-green-500" />;
      case 'decision':
        return <CheckCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getProgressColor = (value: number): string => {
    if (value >= 70) return 'bg-green-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => setLocation('/immersive-simulation')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Quitter la simulation
        </Button>
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-4 w-4" /> Phase {session.currentPhaseIndex + 1}/{session.totalPhases}
        </Badge>
      </div>
      
      <Tabs 
        defaultValue="main" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="main">Principale</TabsTrigger>
          <TabsTrigger value="characters">Personnages</TabsTrigger>
          <TabsTrigger value="conversation">Conversation</TabsTrigger>
          <TabsTrigger value="metrics">Métriques</TabsTrigger>
        </TabsList>
        
        {/* Onglet principal */}
        <TabsContent value="main" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Situation actuelle</CardTitle>
                  <CardDescription>
                    Phase: {currentPhase?.title}
                    {session.userRole && (
                      <span className="ml-2">• Rôle: {session.userRole}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-6">{currentPhase?.description}</p>
                  
                  {events.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-3">Événements récents</h3>
                      <ScrollArea className="h-[200px] rounded-md border p-4">
                        <div className="space-y-4">
                          {events.map((event) => (
                            <div key={event.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                              <div className="mt-1">
                                {getEventIcon(event)}
                              </div>
                              <div>
                                <p className="font-medium">{event.title}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {event.narrative}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                  
                  {pendingDecisions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-3">Décisions à prendre</h3>
                      <div className="space-y-4">
                        {pendingDecisions.map((decision) => (
                          <Card key={decision.id} className="border-2 border-blue-200 dark:border-blue-800">
                            <CardHeader>
                              <CardTitle className="text-lg">{decision.title}</CardTitle>
                              <CardDescription>{decision.context}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="mb-4">{decision.description}</p>
                              <div className="grid grid-cols-1 gap-3">
                                {decision.options
                                  .filter(option => !option.requiredRole || option.requiredRole.includes(session.userRole))
                                  .map((option) => (
                                    <Button 
                                      key={option.id} 
                                      variant="outline" 
                                      className="justify-start h-auto py-3 px-4 text-left"
                                      onClick={() => handleSelectDecision(option.id)}
                                    >
                                      {option.text}
                                    </Button>
                                  ))
                                }
                              </div>
                            </CardContent>
                            {decision.timeLimit && (
                              <CardFooter className="text-sm text-gray-500">
                                <Clock className="h-4 w-4 mr-1" /> Temps limité: {decision.timeLimit} minutes
                              </CardFooter>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              {/* Notifications */}
              {notifications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Bell className="h-5 w-5 mr-2" /> Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[230px]">
                      <div className="space-y-4">
                        {notifications.map((notification) => (
                          <div key={notification.id} className="p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-start">
                              {notification.type === 'warning' && (
                                <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                              )}
                              {notification.type === 'alert' && (
                                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                              )}
                              {notification.type === 'info' && (
                                <Bell className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                              )}
                              <div>
                                <h4 className="font-medium mb-1">{notification.title}</h4>
                                <p className="text-sm">{notification.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            
              {/* Métriques rapides */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BarChart className="h-5 w-5 mr-2" /> Métriques de performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {session.currentMetrics && Object.entries(session.currentMetrics).map(([key, value]) => (
                      <div key={key} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                          </label>
                          <span className="text-sm text-gray-500">{value}%</span>
                        </div>
                        <Progress value={value} className={getProgressColor(value)} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Onglet personnages */}
        <TabsContent value="characters">
          <Card>
            <CardHeader>
              <CardTitle>Personnages disponibles</CardTitle>
              <CardDescription>
                Interagissez avec ces personnages pour obtenir des informations et progresser dans le scénario
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCharacters ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div>
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-24 mt-2" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-16 w-full" />
                      </CardContent>
                      <CardFooter>
                        <Skeleton className="h-9 w-full" />
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {charactersData?.characters.map((character) => (
                    <Card key={character.id}>
                      <CardHeader>
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={character.avatar} />
                            <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{character.name}</h3>
                            <p className="text-sm text-gray-500">{character.role}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-3">
                          <p className="text-sm line-clamp-3">{character.background || "Ce personnage peut vous aider dans votre mission."}</p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {character.expertise.map((exp, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{exp}</Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleStartConversation(character.id)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" /> Discuter
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet conversation */}
        <TabsContent value="conversation">
          <Card className="border-0 shadow-none">
            <CardHeader className="px-0">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  {currentConversation && findCharacterById(currentConversation.characterId) && (
                    <>
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={findCharacterById(currentConversation.characterId)?.avatar} />
                        <AvatarFallback>
                          {findCharacterById(currentConversation.characterId)?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {findCharacterById(currentConversation.characterId)?.name} 
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          {findCharacterById(currentConversation.characterId)?.role}
                        </span>
                      </span>
                    </>
                  )}
                  {!currentConversation && "Sélectionnez un personnage pour discuter"}
                </CardTitle>
                {currentConversation && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveTab('characters')}
                  >
                    Changer
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!currentConversation ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <User className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium mb-2">Aucune conversation active</h3>
                  <p className="text-gray-500 mb-6 text-center max-w-md">
                    Sélectionnez un personnage dans l'onglet "Personnages" pour démarrer une conversation
                  </p>
                  <Button onClick={() => setActiveTab('characters')}>
                    Voir les personnages
                  </Button>
                </div>
              ) : (
                <>
                  <ScrollArea className="h-[400px] px-4 py-4 border rounded-md mb-4">
                    <div className="space-y-4">
                      {currentConversation.messages.map((message, index) => (
                        <div 
                          key={index} 
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.sender === 'user' 
                                ? 'bg-blue-100 dark:bg-blue-900' 
                                : 'bg-gray-100 dark:bg-gray-800'
                            }`}
                          >
                            <p>{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="flex items-end gap-2">
                    <Textarea 
                      placeholder="Tapez votre message..." 
                      className="flex-1" 
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!messageInput.trim() || sendMessageMutation.isPending}
                    >
                      Envoyer
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet métriques */}
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Métriques et impacts</CardTitle>
              <CardDescription>
                Visualisez l'impact de vos décisions sur différents aspects de la gestion de crise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Métriques actuelles</h3>
                  <div className="space-y-6">
                    {session.currentMetrics && Object.entries(session.currentMetrics).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-medium">
                            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                          </label>
                          <span className="text-sm font-medium">{value}%</span>
                        </div>
                        <Progress value={value} className={getProgressColor(value)} />
                        <p className="text-sm text-gray-500">
                          {getMetricDescription(key, value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Historique des impacts</h3>
                  {session.decisions.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        Aucune décision prise pour le moment. L'historique des impacts s'affichera ici.
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {session.decisions.map((decision, index) => (
                          <Card key={index} className="border">
                            <CardHeader className="py-3">
                              <CardTitle className="text-base">{decision.title || 'Décision #' + (index + 1)}</CardTitle>
                            </CardHeader>
                            <CardContent className="py-2">
                              <p className="text-sm mb-3">{decision.description}</p>
                              <div className="space-y-2">
                                {decision.impacts.map((impact, i) => (
                                  <div key={i} className="flex items-center justify-between text-sm">
                                    <span>{impact.metricId.charAt(0).toUpperCase() + impact.metricId.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                                    <Badge variant={impact.change > 0 ? 'success' : impact.change < 0 ? 'destructive' : 'outline'}>
                                      {impact.change > 0 ? '+' : ''}{impact.change}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialogue de confirmation de décision */}
      <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer votre décision</DialogTitle>
            <DialogDescription>
              Cette décision aura un impact sur le déroulement du scénario et ne pourra pas être annulée.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md my-4">
            <p className="font-medium mb-2">Vous avez choisi :</p>
            <p>{selectedDecisionId ? findDecisionOption(selectedDecisionId)?.text : ''}</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDecisionDialog(false)}>Annuler</Button>
            <Button 
              onClick={handleMakeDecision} 
              disabled={decisionMutation.isPending}
            >
              {decisionMutation.isPending ? 'Traitement...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Fonction utilitaire pour générer des descriptions de métriques
function getMetricDescription(metricKey: string, value: number): string {
  const descriptions: Record<string, [string, string, string]> = {
    securityPosture: [
      "Posture de sécurité critique, vulnérabilités majeures présentes", 
      "Niveau de sécurité acceptable mais des améliorations sont nécessaires", 
      "Excellente posture de sécurité, systèmes bien protégés"
    ],
    businessContinuity: [
      "Opérations fortement perturbées, impact critique sur l'activité", 
      "Certaines perturbations mais les fonctions essentielles sont maintenues", 
      "Continuité d'activité optimale, impact minimal sur les opérations"
    ],
    stakeholderTrust: [
      "Confiance sérieusement détériorée, relations avec les parties prenantes tendues", 
      "Niveau de confiance modéré, communication à améliorer", 
      "Confiance élevée des parties prenantes, excellente gestion perçue"
    ],
    legalCompliance: [
      "Risques réglementaires élevés, non-conformités potentielles", 
      "Conformité basique respectée mais des zones d'amélioration existent", 
      "Pleine conformité avec toutes les exigences légales et réglementaires"
    ],
    reputationScore: [
      "Réputation sérieusement endommagée, couverture médiatique négative", 
      "Image publique stable mais fragile", 
      "Excellente réputation publique, perception positive maintenue"
    ],
    employeeAwareness: [
      "Faible niveau de sensibilisation, personnel vulnérable aux attaques", 
      "Sensibilisation de base mais inconsistante selon les équipes", 
      "Personnel hautement sensibilisé et formé aux bonnes pratiques"
    ],
    userSatisfaction: [
      "Forte insatisfaction des utilisateurs, nombreuses plaintes", 
      "Satisfaction modérée, quelques frustrations exprimées", 
      "Utilisateurs très satisfaits, expérience positive"
    ],
    incidentContainment: [
      "Incident non maîtrisé, propagation active", 
      "Incident partiellement contenu, quelques risques persistent", 
      "Incident totalement maîtrisé et isolé"
    ]
  };
  
  const defaultDesc = ["Faible", "Moyen", "Élevé"];
  const [low, medium, high] = descriptions[metricKey] || defaultDesc;
  
  if (value < 40) return low;
  if (value < 70) return medium;
  return high;
}