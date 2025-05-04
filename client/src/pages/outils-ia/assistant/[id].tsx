import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useRoute, useLocation } from 'wouter';
import { ArrowLeft, Send, RefreshCw, Settings, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/theme-provider';
import Layout from '@/components/layout/Layout';
import PageTitle from '@/components/layout/PageTitle';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';

// Type pour un message dans la conversation
interface ChatMessage {
  id: string;
  role: 'system' | 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

// Type pour un assistant personnalisé
interface CustomAssistant {
  id: number;
  name: string;
  description: string;
  personality: string;
  domain: string;
  expertise: string[];
  avatarStyle: string;
  avatarColor: string;
  gamificationLevel: string;
  isPublic: boolean;
  isVerified: boolean;
  usageCount: number;
  rating: number;
  updatedAt: string;
  systemPrompt: string;
}

// Page de conversation avec un assistant
export default function AssistantChatPage() {
  const [match, params] = useRoute('/outils-ia/assistant/:id');
  const [location, setLocation] = useLocation();
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  const { toast } = useToast();
  
  // ID utilisateur temporaire pour les tests
  const [userId] = useState(() => {
    const savedUserId = localStorage.getItem('assistant_user_id');
    if (savedUserId) return savedUserId;
    const newUserId = uuidv4();
    localStorage.setItem('assistant_user_id', newUserId);
    return newUserId;
  });
  
  // États pour la conversation
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Références pour le défilement automatique
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Récupérer les détails de l'assistant
  const { 
    data: assistant,
    isLoading: isLoadingAssistant,
    error: assistantError
  } = useQuery({
    queryKey: ['/api/assistants', params?.id],
    queryFn: async () => {
      // Normalement, on devrait récupérer l'assistant depuis l'API
      // Mais pour l'instant, on utilise un assistant fictif pour la démo
      
      // Essayons quand même de récupérer l'assistant depuis l'API
      try {
        const userAssistantsRes = await axios.get(`/api/assistants/user/${userId}`);
        const assistants = userAssistantsRes.data.assistants || [];
        const assistant = assistants.find((a: CustomAssistant) => a.id === Number(params?.id));
        
        if (assistant) {
          return assistant;
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'assistant:', error);
      }
      
      // Si l'assistant n'est pas trouvé, on utilise un assistant fictif
      return {
        id: Number(params?.id),
        name: "Assistant IA Personnalisé",
        description: "Un assistant IA qui vous aide à répondre à vos questions.",
        personality: "professionnel",
        domain: "general",
        expertise: ["IA", "Réponses aux questions", "Aide"],
        avatarStyle: "robot",
        avatarColor: "violet",
        gamificationLevel: "leger",
        isPublic: false,
        isVerified: false,
        usageCount: 0,
        rating: 0,
        updatedAt: new Date().toISOString(),
        systemPrompt: "Vous êtes un assistant IA professionnel et serviable. Votre objectif est d'aider l'utilisateur à répondre à ses questions de manière claire et précise."
      };
    },
    enabled: !!params?.id,
    staleTime: 60000 * 5,
  });
  
  // Initialiser la conversation
  useEffect(() => {
    if (assistant && !isInitialized) {
      initializeConversation();
    }
  }, [assistant, isInitialized]);
  
  const initializeConversation = async () => {
    if (!assistant) return;
    
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/assistants/conversation/init', {
        assistantId: assistant.id,
        userId
      });
      
      if (response.data.success) {
        if (response.data.isPersistent) {
          setConversationId(response.data.conversationId);
        } else {
          setSessionId(response.data.sessionId);
        }
        
        // Message de bienvenue pour commencer
        const welcomeMsg: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: `Bonjour ! Je suis ${assistant.name}, votre assistant IA personnalisé spécialisé en ${getDomainLabel(assistant.domain)}. Comment puis-je vous aider aujourd'hui ?`,
          timestamp: new Date()
        };
        
        setMessages([welcomeMsg]);
        setIsInitialized(true);
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible d\'initialiser la conversation. Veuillez réessayer.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la conversation:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'initialisation. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Défilement automatique vers le bas lors de l'ajout de nouveaux messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Fonction pour envoyer un message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isLoading || !assistant) return;
    
    // Ajouter le message de l'utilisateur
    const userMessage = newMessage.trim();
    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setNewMessage('');
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/assistants/conversation/message', {
        message: userMessage,
        conversationId,
        sessionId
      });
      
      if (response.data.success) {
        // Ajouter la réponse de l'assistant
        const assistantMsg: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la génération de la réponse.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'envoi du message.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour réinitialiser la conversation
  const handleResetConversation = () => {
    setMessages([]);
    setIsInitialized(false);
    setConversationId(null);
    setSessionId(null);
    initializeConversation();
  };
  
  // Fonction pour obtenir la couleur de l'avatar
  const getAvatarColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      violet: isFuturistic ? 'bg-violet-700 text-white' : 'bg-violet-100 text-violet-800',
      blue: isFuturistic ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800',
      green: isFuturistic ? 'bg-green-700 text-white' : 'bg-green-100 text-green-800',
      yellow: isFuturistic ? 'bg-yellow-700 text-white' : 'bg-yellow-100 text-yellow-800',
      red: isFuturistic ? 'bg-red-700 text-white' : 'bg-red-100 text-red-800',
      orange: isFuturistic ? 'bg-orange-700 text-white' : 'bg-orange-100 text-orange-800',
      pink: isFuturistic ? 'bg-pink-700 text-white' : 'bg-pink-100 text-pink-800',
      gray: isFuturistic ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800',
    };
    
    return colorMap[color] || colorMap.violet;
  };
  
  // Fonction pour obtenir l'icône d'avatar
  const getAvatarIcon = (style: string) => {
    switch (style) {
      case 'robot':
        return '🤖';
      case 'cyborg':
        return '🦾';
      case 'scientist':
        return '🧪';
      case 'teacher':
        return '👩‍🏫';
      case 'professional':
        return '👨‍💼';
      default:
        return '🧠';
    }
  };
  
  // Fonction pour obtenir le label du domaine
  const getDomainLabel = (domain: string) => {
    const domainMap: Record<string, string> = {
      cybersecurite: 'Cybersécurité',
      gestion_projet: 'Gestion de projet',
      amoa: 'AMOA',
      developpement: 'Développement',
      data_ia: 'Data & IA',
      conseil: 'Conseil',
      general: 'Général',
    };
    
    return domainMap[domain] || 'Général';
  };
  
  // Rendu de la page
  if (!match) {
    return null;
  }
  
  return (
    <Layout>
      <PageTitle title={assistant?.name || 'Assistant IA'} />
      
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Link href="/outils-ia/assistant" className="flex items-center text-violet-600 hover:text-violet-700 w-fit transition-colors">
            <ArrowLeft size={16} className="mr-1" />
            <span>Retour aux assistants</span>
          </Link>
        </div>
        
        {isLoadingAssistant ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : assistantError ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2 text-red-500">Erreur</h3>
            <p>Impossible de charger les détails de l'assistant. Veuillez réessayer.</p>
            <Button 
              onClick={() => window.location.reload()}
              className="mt-4"
              variant="outline"
            >
              Recharger la page
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Information sur l'assistant */}
            <div className="lg:col-span-1">
              <Card className={isFuturistic ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader className="space-y-0 pb-2">
                  <CardTitle className={`text-xl ${isFuturistic ? 'text-white' : ''}`}>
                    {assistant?.name || 'Assistant IA'}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 border-b pb-3">
                    <div className={`w-16 h-16 flex items-center justify-center rounded-full text-2xl ${
                      getAvatarColorClass(assistant?.avatarColor || 'violet')
                    }`}>
                      {getAvatarIcon(assistant?.avatarStyle || 'robot')}
                    </div>
                    <div>
                      <Badge variant={isFuturistic ? "outline" : "secondary"} className={
                        isFuturistic ? 'border-violet-400/30 text-violet-300 hover:bg-violet-900/20' : ''
                      }>
                        {getDomainLabel(assistant?.domain || 'general')}
                      </Badge>
                      <p className={`text-sm mt-1 ${isFuturistic ? 'text-gray-300' : 'text-gray-500'}`}>
                        {assistant?.expertise?.join(', ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`text-sm ${isFuturistic ? 'text-gray-300' : 'text-gray-600'}`}>
                    <p>{assistant?.description}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleResetConversation}
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                    >
                      <RefreshCw size={14} className="mr-2" />
                      Nouvelle conversation
                    </Button>
                    
                    <Button 
                      onClick={() => setLocation(`/outils-ia/assistant/edit/${assistant?.id}`)}
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                    >
                      <Settings size={14} className="mr-2" />
                      Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Zone de conversation */}
            <div className="lg:col-span-3 flex flex-col h-[calc(100vh-200px)]">
              <Card className={`${isFuturistic ? 'bg-gray-800 border-gray-700' : ''} flex-grow flex flex-col`}>
                <CardHeader className="border-b pb-3 flex flex-row justify-between items-center">
                  <div className="flex items-center gap-2">
                    <MessageSquare className={`h-5 w-5 ${isFuturistic ? 'text-violet-400' : 'text-violet-600'}`} />
                    <CardTitle className={`text-lg ${isFuturistic ? 'text-white' : ''}`}>
                      Conversation
                    </CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow overflow-hidden p-0">
                  <ScrollArea className="h-full p-4">
                    <AnimatePresence initial={false}>
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                        >
                          <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className={`flex-shrink-0 ${msg.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                              <Avatar className={`w-10 h-10 ${msg.role === 'user' ? 'bg-violet-100' : ''}`}>
                                {msg.role === 'assistant' ? (
                                  <div className={`w-full h-full flex items-center justify-center text-lg ${
                                    getAvatarColorClass(assistant?.avatarColor || 'violet')
                                  }`}>
                                    {getAvatarIcon(assistant?.avatarStyle || 'robot')}
                                  </div>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-violet-600 text-white">
                                    👤
                                  </div>
                                )}
                              </Avatar>
                            </div>
                            
                            {/* Message content */}
                            <div 
                              className={`px-4 py-3 rounded-lg ${
                                msg.role === 'user' 
                                  ? isFuturistic 
                                    ? 'bg-violet-600/90 text-white border border-violet-500/40' 
                                    : 'bg-violet-600 text-white' 
                                  : isFuturistic 
                                    ? 'bg-white/5 border border-gray-700 text-gray-200' 
                                    : 'bg-white border border-gray-200 text-gray-800'
                              }`}
                            >
                              <div 
                                className="whitespace-pre-wrap" 
                                dangerouslySetInnerHTML={{ 
                                  __html: msg.content.replace(/\n/g, '<br/>') 
                                }} 
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Indicateur de chargement */}
                      {isLoading && (
                        <motion.div
                          key="loading-indicator"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex justify-start mb-4"
                        >
                          <div className="flex max-w-[80%]">
                            <div className="flex-shrink-0 mr-3">
                              <Avatar>
                                <div className={`w-full h-full flex items-center justify-center text-lg ${
                                  getAvatarColorClass(assistant?.avatarColor || 'violet')
                                }`}>
                                  {getAvatarIcon(assistant?.avatarStyle || 'robot')}
                                </div>
                              </Avatar>
                            </div>
                            <div className={`px-4 py-3 rounded-lg ${
                              isFuturistic 
                                ? 'bg-white/5 border border-gray-700' 
                                : 'bg-white border border-gray-200'
                            }`}
                            >
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"></div>
                                <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 rounded-full bg-violet-600 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </AnimatePresence>
                  </ScrollArea>
                </CardContent>
                
                <CardFooter className="p-4 border-t mt-auto">
                  <form onSubmit={handleSendMessage} className="flex gap-4 items-end w-full">
                    <div className="relative flex-grow">
                      <Textarea
                        placeholder="Envoyez un message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        className={`resize-none p-3 pr-12 min-h-[80px] ${
                          isFuturistic 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus-visible:ring-violet-500/50' 
                            : 'bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus-visible:ring-violet-500/30'
                        }`}
                        disabled={isLoading}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        className={`absolute bottom-3 right-3 ${
                          isFuturistic 
                            ? 'bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-600 hover:to-indigo-600 text-white border border-violet-500/40' 
                            : 'bg-violet-600 hover:bg-violet-700 text-white'
                        } rounded-full h-9 w-9`}
                        disabled={!newMessage.trim() || isLoading}
                      >
                        <Send size={16} className={isLoading ? 'opacity-50' : ''} />
                      </Button>
                    </div>
                  </form>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}