import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  Send,
  User,
  Loader2,
  Bot,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getAvatarPath } from '@/lib/utils';

// Type pour les messages
interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: number;
  contactName?: string;
  contactRole?: string;
  avatar?: string;
}

// Type pour l'NPC
interface NPC {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  avatar: string;
}

export default function CyberNewChat() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // États
  const [npc, setNPC] = useState<NPC | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  // Effet pour initialiser le chat
  useEffect(() => {
    const initChat = async () => {
      setIsLoading(true);
      
      try {
        // Récupérer l'ID de profil
        const profileId = localStorage.getItem('cyberNewProfileId');
        
        if (!profileId) {
          setLocation('/cyber-new-onboarding');
          return;
        }
        
        // Créer une conversation avec Isabelle, la DRH
        const response = await fetch('/api/cyber/new/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profileId,
            npcId: 'drh-isabelle'
          }),
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de l\'initialisation du chat');
        }
        
        const data = await response.json();
        
        // Obtenir l'ID de conversation
        setConversationId(data.conversationId);
        
        // Récupérer les messages et les données associées
        const messagesResponse = await fetch(`/api/cyber/new/conversations/${data.conversationId}/messages`);
        
        if (!messagesResponse.ok) {
          throw new Error('Erreur lors de la récupération des messages');
        }
        
        const messagesData = await messagesResponse.json();
        
        // Mettre à jour l'état avec les données récupérées
        setMessages(messagesData.messages || []);
        setNPC(messagesData.currentNPC || null);
        
        // Ajouter un message de bienvenue système si aucun message n'est présent
        if (messagesData.messages && messagesData.messages.length === 0) {
          // Récupérer le nom du profil
          const profileName = localStorage.getItem('cyberNewProfileName') || 'utilisateur';
          
          const welcomeMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'system',
            content: `Bienvenue ${profileName} dans notre programme de sensibilisation à la cybersécurité. Je suis Isabelle Martin, Directrice des Ressources Humaines. C'est moi qui vous accompagnerai tout au long de ce parcours pour vous aider à comprendre les bonnes pratiques de sécurité dans notre entreprise.`,
            timestamp: Date.now()
          };
          
          setMessages([welcomeMessage]);
        }
        
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error instanceof Error ? error.message : "Une erreur s'est produite lors de l'initialisation du chat",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initChat();
  }, [setLocation, toast]);
  
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
      // Correction: Utiliser 'message' et non 'content' pour respecter l'API
      const response = await fetch(`/api/cyber/new/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageInput,  // Utiliser directement messageInput ici
          type: 'user'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }
      
      const data = await response.json();
      
      // Mettre à jour les messages et le NPC
      setMessages(data.messages || []);
      if (data.currentNPC) {
        setNPC(data.currentNPC);
      }
      
      // Ajout d'un polling pour récupérer la réponse de l'IA
      const pollForResponse = async () => {
        try {
          const pollResponse = await fetch(`/api/cyber/new/conversations/${conversationId}/messages`);
          if (!pollResponse.ok) {
            throw new Error('Erreur lors de la récupération des messages');
          }
          
          const pollData = await pollResponse.json();
          
          // Vérifier si la réponse de l'IA est arrivée
          const userMessageIndex = pollData.messages.findIndex((msg: ChatMessage) => 
            msg.id === tempMessage.id
          );
          
          const hasAiResponse = pollData.messages.some((msg: ChatMessage, index: number) => 
            index > userMessageIndex && msg.type === 'bot' && msg.content !== "Je réfléchis à votre message..."
          );
          
          if (hasAiResponse) {
            // Mettre à jour les messages avec la réponse de l'IA
            setMessages(pollData.messages);
            setIsSending(false);
          } else {
            // Continuer le polling
            setTimeout(pollForResponse, 1000);
          }
        } catch (error) {
          console.error("Erreur pendant le polling:", error);
          setIsSending(false);
        }
      };
      
      // Démarrer le polling seulement si la réponse est en attente
      const waitingForResponse = data.messages.some((msg: ChatMessage) => 
        msg.type === 'bot' && msg.content === "Je réfléchis à votre message..."
      );
      
      if (waitingForResponse) {
        setTimeout(pollForResponse, 1000);
      }
      
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur s'est produite lors de l'envoi du message",
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
  
  const resetChat = async () => {
    if (!conversationId) return;
    
    try {
      setIsLoading(true);
      
      // Récupérer l'ID de profil
      const profileId = localStorage.getItem('cyberNewProfileId');
      
      if (!profileId) {
        setLocation('/cyber-new-onboarding');
        return;
      }
      
      // Créer une nouvelle conversation
      const response = await fetch('/api/cyber/new/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId,
          npcId: 'drh-isabelle'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la réinitialisation du chat');
      }
      
      const data = await response.json();
      
      // Mettre à jour l'ID de conversation
      setConversationId(data.conversationId);
      
      // Récupérer les nouveaux messages
      const messagesResponse = await fetch(`/api/cyber/new/conversations/${data.conversationId}/messages`);
      
      if (!messagesResponse.ok) {
        throw new Error('Erreur lors de la récupération des messages');
      }
      
      const messagesData = await messagesResponse.json();
      
      // Mettre à jour l'état avec les données récupérées
      setMessages(messagesData.messages || []);
      setNPC(messagesData.currentNPC || null);
      
      // Ajouter un message de bienvenue système si aucun message n'est présent
      if (messagesData.messages && messagesData.messages.length === 0) {
        // Récupérer le nom du profil
        const profileName = localStorage.getItem('cyberNewProfileName') || 'utilisateur';
        
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'system',
          content: `Chat réinitialisé. ${profileName}, comment puis-je vous aider aujourd'hui?`,
          timestamp: Date.now()
        };
        
        setMessages([welcomeMessage]);
      }
      
      toast({
        title: "Chat réinitialisé",
        description: "La conversation a été réinitialisée avec succès",
      });
      
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur s'est produite lors de la réinitialisation du chat",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Rendu de l'interface
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full" role="status">
            <span className="sr-only">Chargement...</span>
          </div>
          <h2 className="mt-4 text-xl font-semibold">Initialisation du chat...</h2>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
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
              <h1 className="text-xl font-bold">Chat avec Isabelle Martin - DRH</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              {npc && (
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8 border-2 border-white/50">
                    <AvatarImage src={npc.avatar} alt={npc.name} />
                    <AvatarFallback>{npc.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium">{npc.name}</p>
                    <p className="opacity-80 text-xs">{npc.role}</p>
                  </div>
                </div>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                className="border-white/30 text-white hover:bg-white/20"
                onClick={resetChat}
                disabled={isLoading}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-pink-500" />
                Formation Cybersécurité - Conversation avec la DRH
              </CardTitle>
              <Separator />
            </CardHeader>
            
            <CardContent className="pt-4">
              <div className="space-y-4 h-[calc(65vh-100px)] overflow-y-auto px-1">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'system' && (
                      <div className="bg-pink-50 text-pink-800 rounded-lg p-3 max-w-[85%] text-sm">
                        <p>{message.content}</p>
                      </div>
                    )}
                    
                    {message.type === 'bot' && (
                      <div className="flex space-x-2 max-w-[85%]">
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarImage src={message.avatar || npc?.avatar} alt={message.contactName || npc?.name || 'Bot'} />
                          <AvatarFallback>
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                          <div className="text-xs text-pink-600 font-medium mb-1">
                            {message.contactName || npc?.name || 'Assistant'} • {message.contactRole || npc?.role || 'Conseiller'}
                          </div>
                          <p className="text-gray-800 whitespace-pre-line">{message.content}</p>
                        </div>
                      </div>
                    )}
                    
                    {message.type === 'user' && (
                      <div className="flex space-x-2 max-w-[85%]">
                        <div className="bg-purple-600 text-white rounded-lg p-3">
                          <p>{message.content}</p>
                        </div>
                        
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback className="bg-purple-700 text-white">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Indicateur de chargement de réponse */}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="flex space-x-2 max-w-[85%]">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={npc?.avatar} alt={npc?.name || 'Bot'} />
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '250ms' }}></div>
                          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '500ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Référence pour le défilement automatique */}
                <div ref={messageEndRef} />
              </div>
            </CardContent>
            
            <CardFooter className="pt-2">
              <div className="w-full flex space-x-2">
                <Textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Posez votre question..."
                  className="min-h-[80px] resize-none"
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
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}