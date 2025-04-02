import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useRoute } from 'wouter';
import {
  ShieldCheck as ShieldIcon,
  ArrowLeft,
  Send,
  User,
  RefreshCw,
  Loader2,
  Check,
  X,
  Info,
  ChevronDown,
  MessageSquare,
  Clock,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from '@/hooks/use-toast';
import { getAvatarPath } from '@/lib/utils';

// Types
interface Mission {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  domain: string;
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  objectives?: Array<{
    id: string;
    description: string;
    completed: boolean;
  }>;
  primaryNPC: string;
  supportNPCs: string[];
}

interface NPC {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  avatar: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: number;
  contactName?: string;
  contactRole?: string;
  avatar?: string;
}

export default function CyberNewMission() {
  const [, params] = useRoute('/cyber-new-mission/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // État
  const [mission, setMission] = useState<Mission | null>(null);
  const [currentNPC, setCurrentNPC] = useState<NPC | null>(null);
  const [availableNPCs, setAvailableNPCs] = useState<NPC[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  // Effet pour récupérer les données de la mission et créer une conversation
  useEffect(() => {
    const fetchMissionData = async () => {
      if (!params?.id) return;
      
      setIsLoading(true);
      try {
        // Simuler la récupération des données de mission et la création d'une conversation
        const profileId = localStorage.getItem('cyberNewProfileId');
        
        if (!profileId) {
          setLocation('/cyber-new-onboarding');
          return;
        }
        
        // Simulation d'une conversation existante ou création d'une nouvelle
        const convResponse = await fetch('/api/cyber/new/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profileId,
            missionId: params.id
          }),
        });
        
        if (!convResponse.ok) {
          throw new Error('Erreur lors de la création de la conversation');
        }
        
        const convData = await convResponse.json();
        setConversationId(convData.id);
        
        // Récupérer les messages de la conversation
        const messagesResponse = await fetch(`/api/cyber/new/conversations/${convData.id}/messages`);
        if (!messagesResponse.ok) {
          throw new Error('Erreur lors de la récupération des messages');
        }
        
        const { messages, mission, currentNPC, availableNPCs } = await messagesResponse.json();
        
        setMission(mission);
        setCurrentNPC(currentNPC);
        setAvailableNPCs(availableNPCs);
        setMessages(messages);
        
        // Créer un message de bienvenue si c'est une nouvelle conversation
        if (messages.length === 0) {
          // Ce message sera ajouté par le serveur
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMissionData();
  }, [params, setLocation]);

  // Effet pour faire défiler vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !conversationId) return;
    
    const tempMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageInput,
      timestamp: Date.now()
    };
    
    // Ajouter temporairement le message à l'interface
    setMessages([...messages, tempMessage]);
    setMessageInput('');
    setIsSending(true);
    
    try {
      // Envoyer le message à l'API
      const response = await fetch(`/api/cyber/new/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: tempMessage.content,
          type: 'user'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }
      
      const { message: botResponse } = await response.json();
      
      // Ajouter la réponse du bot
      setMessages(prevMessages => [...prevMessages, botResponse]);
      
      // Vérifier si des objectifs ont été complétés
      if (mission && botResponse.completedObjectives?.length > 0) {
        toast({
          title: "Objectif complété !",
          description: "Vous avez progressé dans la mission.",
        });
        
        // Mettre à jour les objectifs de la mission
        setMission(prevMission => {
          if (!prevMission) return null;
          
          return {
            ...prevMission,
            objectives: prevMission.objectives?.map(obj => 
              botResponse.completedObjectives.includes(obj.id) 
                ? { ...obj, completed: true } 
                : obj
            )
          };
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err instanceof Error ? err.message : "Erreur lors de l'envoi du message",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChangeNPC = async (npcId: string) => {
    if (!conversationId || !npcId) return;
    
    try {
      const response = await fetch(`/api/cyber/new/conversations/${conversationId}/change-npc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ npcId }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du changement d\'interlocuteur');
      }
      
      const { npc, systemMessage } = await response.json();
      
      // Mettre à jour l'interlocuteur actuel
      setCurrentNPC(npc);
      
      // Ajouter un message système pour indiquer le changement
      if (systemMessage) {
        setMessages(prevMessages => [...prevMessages, systemMessage]);
      }
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err instanceof Error ? err.message : "Erreur lors du changement d'interlocuteur",
      });
    }
  };

  const calculateProgress = () => {
    if (!mission || !mission.objectives) return 0;
    
    const completedCount = mission.objectives.filter(obj => obj.completed).length;
    const totalCount = mission.objectives.length;
    
    return Math.round((completedCount / totalCount) * 100);
  };

  // Afficher l'état de chargement
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full" role="status">
            <span className="sr-only">Chargement...</span>
          </div>
          <h2 className="mt-4 text-xl font-semibold">Chargement de la mission...</h2>
        </div>
      </div>
    );
  }

  // Afficher une erreur
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  // Si pas de mission trouvée
  if (!mission) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 mb-4">
            <Info className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mission non trouvée</h2>
          <p className="text-gray-600 mb-4">Impossible de trouver la mission demandée.</p>
          <Button onClick={() => setLocation('/cyber-new-dashboard')}>Retour au tableau de bord</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20" 
                onClick={() => setLocation('/cyber-new-dashboard')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tableau de bord
              </Button>
              <h1 className="text-xl font-bold">I AM CYBER NEW</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={`
                ${mission.difficulty === 'Débutant' ? 'bg-green-500' : 
                  mission.difficulty === 'Intermédiaire' ? 'bg-amber-500' : 
                  'bg-red-500'}
              `}>
                {mission.difficulty}
              </Badge>
              <Badge variant="outline" className="border-white/40 text-white">
                {mission.domain}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Mission Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>{mission.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-500">{mission.description}</p>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Progression</p>
                    <Progress value={calculateProgress()} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1 text-right">{calculateProgress()}%</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Objectifs */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Objectifs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {mission.objectives?.map((objective) => (
                      <li key={objective.id} className="flex items-start space-x-2">
                        <span className="mt-0.5">
                          {objective.completed ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                        </span>
                        <span className={`text-sm ${objective.completed ? 'text-gray-500' : 'text-gray-700'}`}>
                          {objective.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              {/* Interlocuteurs */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Interlocuteurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {availableNPCs.map((npc) => (
                      <li key={npc.id}>
                        <Button 
                          variant={currentNPC?.id === npc.id ? "secondary" : "outline"} 
                          className="w-full justify-start"
                          onClick={() => handleChangeNPC(npc.id)}
                          disabled={currentNPC?.id === npc.id}
                        >
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={npc.avatar} alt={npc.name} />
                              <AvatarFallback>{npc.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                              <div className="text-sm font-medium">{npc.name}</div>
                              <div className="text-xs text-gray-500">{npc.role}</div>
                            </div>
                          </div>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              {/* Actions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.location.reload()}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Rafraîchir
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-orange-600 border-orange-200 bg-orange-50 hover:bg-orange-100"
                      onClick={() => setLocation('/cyber-new-dashboard')}
                    >
                      <Award className="mr-2 h-4 w-4" />
                      Terminer plus tard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Chat Area */}
            <div className="lg:col-span-3">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-2 border-b">
                  <div className="flex items-center">
                    {currentNPC && (
                      <>
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={currentNPC.avatar} alt={currentNPC.name} />
                          <AvatarFallback>{currentNPC.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{currentNPC.name}</h3>
                          <p className="text-sm text-gray-500">{currentNPC.role}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow overflow-y-auto h-[400px] p-4 space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} ${
                        message.type === 'system' ? 'justify-center' : ''
                      }`}
                    >
                      {message.type === 'system' ? (
                        <div className="bg-gray-100 text-gray-700 rounded-md py-2 px-3 text-sm max-w-[80%] text-center">
                          {message.content}
                        </div>
                      ) : message.type === 'user' ? (
                        <div className="bg-blue-600 text-white rounded-lg py-2 px-4 max-w-[80%]">
                          {message.content}
                        </div>
                      ) : (
                        <div className="flex gap-2 max-w-[80%]">
                          <Avatar className="h-8 w-8">
                            <AvatarImage 
                              src={message.avatar || currentNPC?.avatar} 
                              alt={message.contactName || currentNPC?.name || ''} 
                            />
                            <AvatarFallback>
                              {(message.contactName || currentNPC?.name || '??').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-white border border-gray-200 rounded-lg py-2 px-4 shadow-sm">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {message.contactName || currentNPC?.name}
                              <span className="text-xs font-normal text-gray-500 ml-2">
                                {message.contactRole || currentNPC?.role}
                              </span>
                            </p>
                            <p className="text-gray-700">{message.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </CardContent>
                
                <CardFooter className="border-t p-4">
                  <div className="flex w-full space-x-2">
                    <Textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Écrivez votre message ici..."
                      className="min-h-[80px]"
                      disabled={isSending}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!messageInput.trim() || isSending}
                      className="self-end"
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <ShieldIcon className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900">I AM CYBER NEW</span>
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Tous droits réservés
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}