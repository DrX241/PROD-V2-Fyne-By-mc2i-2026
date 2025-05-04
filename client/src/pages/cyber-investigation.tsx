import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Fingerprint, Shield, ArrowLeft, Send, RefreshCw, MessageCircle, MessageSquare, User, Bot, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import HomeLayout from '@/components/layout/HomeLayout';
import { toast } from '@/hooks/use-toast';
import Markdown from 'react-markdown';
import { apiRequest } from '@/lib/queryClient';
import { v4 as uuidv4 } from 'uuid';

// Types pour la session d'enquête
interface Message {
  id: string;
  role: "user" | "assistant" | "system"; 
  content: string;
  timestamp: number;
}

interface InvestigationState {
  sessionId: string | null;
  messages: Message[];
  isLoading: boolean;
  userName: string;
  questionCount: number;
  conceptRevealed: boolean;
  currentStage: number;
}

const CyberInvestigation: React.FC = () => {
  // État local
  const [state, setState] = useState<InvestigationState>({
    sessionId: null,
    messages: [],
    isLoading: false,
    userName: "Détective",
    questionCount: 0,
    conceptRevealed: false,
    currentStage: 0
  });
  
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFuturistic, setIsFuturistic] = useState(true);
  
  // Effet pour faire défiler vers le bas lorsque de nouveaux messages arrivent
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.messages]);
  
  // Démarrer une nouvelle enquête
  const startNewInvestigation = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const { sessionId, welcomeMessage } = await apiRequest('/api/cyber-investigation/start', {
        method: 'POST',
        body: JSON.stringify({
          userId: localStorage.getItem('userId') || uuidv4(),
          userName: state.userName || 'Détective'
        })
      });
      
      const newMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: welcomeMessage,
        timestamp: Date.now()
      };
      
      setState(prev => ({
        ...prev,
        sessionId,
        messages: [newMessage],
        isLoading: false,
        conceptRevealed: false,
        questionCount: 0,
        currentStage: 0
      }));
      
      // Enregistrer l'ID utilisateur pour les futures sessions
      if (!localStorage.getItem('userId')) {
        localStorage.setItem('userId', uuidv4());
      }
      
      // Focus sur le champ de saisie
      if (inputRef.current) {
        inputRef.current.focus();
      }
      
    } catch (error) {
      console.error("Erreur lors du démarrage de l'enquête:", error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'enquête. Veuillez réessayer.",
        variant: "destructive"
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };
  
  // Envoyer un message
  const sendMessage = async () => {
    if (!inputMessage.trim() || !state.sessionId) return;
    
    try {
      // Ajouter le message utilisateur localement
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: inputMessage,
        timestamp: Date.now()
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true
      }));
      
      setInputMessage("");
      
      // Envoyer au serveur
      const response = await apiRequest('/api/cyber-investigation/message', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: state.sessionId,
          message: inputMessage
        })
      });
      
      // Mettre à jour l'état avec la réponse
      const botMessage: Message = {
        id: response.message.id || uuidv4(),
        role: 'assistant',
        content: response.message.content,
        timestamp: response.message.timestamp || Date.now()
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isLoading: false,
        questionCount: response.questionCount || prev.questionCount,
        conceptRevealed: response.conceptRevealed || prev.conceptRevealed,
        currentStage: response.currentStage || prev.currentStage
      }));
      
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre message. Veuillez réessayer.",
        variant: "destructive"
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };
  
  // Réinitialiser la session
  const resetSession = async () => {
    // Nettoyer la session actuelle si elle existe
    if (state.sessionId) {
      try {
        await apiRequest(`/api/cyber-investigation/session/${state.sessionId}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error("Erreur lors de la suppression de la session:", error);
      }
    }
    
    // Réinitialiser l'état
    setState({
      sessionId: null,
      messages: [],
      isLoading: false,
      userName: state.userName,
      questionCount: 0,
      conceptRevealed: false,
      currentStage: 0
    });
  };
  
  // Gérer la soumission avec Entrée
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Afficher la progression de l'enquête
  const renderProgress = () => {
    if (!state.sessionId) return null;
    
    let progressText = "";
    let progressColor = "";
    
    if (state.conceptRevealed) {
      progressText = state.currentStage === 0 
        ? "Concept révélé" 
        : "Phase finale";
      progressColor = "bg-green-500";
    } else {
      progressText = `Question ${state.questionCount}/6`;
      progressColor = "bg-blue-500";
    }
    
    return (
      <Badge variant="outline" className="ml-2 py-1">
        <span className={`inline-block w-2 h-2 rounded-full ${progressColor} mr-2`}></span>
        {progressText}
      </Badge>
    );
  };
  
  // Formater le contenu du message pour Markdown
  const formatMessageContent = (content: string) => {
    // Protéger contre les erreurs de contenu null ou undefined
    if (!content) return "";
    return content;
  };
  
  return (
    <HomeLayout>
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex items-center mb-6 space-x-2">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          
          <div className="flex items-center">
            <Fingerprint className="h-6 w-6 text-indigo-600 mr-2" />
            <h1 className="text-2xl font-bold">Enquête Cybersécurité</h1>
            {renderProgress()}
          </div>
          
          <div className="flex-grow"></div>
          
          <div className="flex space-x-3">
            {/* Toggle pour le style d'interface */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFuturistic(!isFuturistic)}
                    className="h-9 w-9 p-0"
                  >
                    {isFuturistic ? (
                      <MessageCircle className="h-5 w-5 text-indigo-600" />
                    ) : (
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Changer le style d'interface</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Bouton pour démarrer une nouvelle enquête */}
            <Button 
              onClick={state.sessionId ? resetSession : startNewInvestigation} 
              variant={state.sessionId ? "outline" : "default"}
              size="sm"
              className={state.sessionId ? "border-indigo-200 hover:bg-indigo-50" : ""}
            >
              {state.sessionId ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Nouvelle enquête
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Démarrer l'enquête
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Zone principale */}
        <div className={`rounded-lg overflow-hidden border ${
          isFuturistic 
            ? 'border-indigo-200 bg-gradient-to-b from-indigo-50/50 to-white' 
            : 'border-gray-200 bg-white'
        } shadow-md mb-4 flex flex-col h-[calc(100vh-240px)]`}>
          {!state.sessionId ? (
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
              <div className={`p-4 rounded-full mb-6 ${isFuturistic ? 'bg-indigo-100' : 'bg-blue-100'}`}>
                <Shield className={`h-12 w-12 ${isFuturistic ? 'text-indigo-500' : 'text-blue-500'}`} />
              </div>
              <h2 className="text-2xl font-semibold mb-3">I AM CYBER</h2>
              <p className="text-gray-600 max-w-md mb-6">
                Plongez dans une enquête interactive sur un concept de cybersécurité.
                Analysez les indices, répondez aux questions et découvrez le concept étudié.
              </p>
              <Button 
                onClick={startNewInvestigation} 
                className={isFuturistic ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}
              >
                <Shield className="h-4 w-4 mr-2" />
                Démarrer l'enquête
              </Button>
            </div>
          ) : (
            <>
              {/* Zone de messages */}
              <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence initial={false}>
                  {state.messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
                    >
                      <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                          <Avatar className={`w-10 h-10 ${
                            isFuturistic 
                              ? 'border-2 border-indigo-200' 
                              : 'border border-gray-200'
                          }`}>
                            <AvatarFallback className={`${
                              message.role === 'user'
                                ? 'bg-indigo-100 text-indigo-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {message.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        {/* Message */}
                        <div className={`p-3 rounded-lg ${
                          message.role === 'user'
                            ? isFuturistic 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-blue-600 text-white'
                            : isFuturistic
                              ? 'bg-white border border-indigo-100 shadow-sm'
                              : 'bg-gray-100'
                        }`}>
                          <div className="prose max-w-none">
                            <Markdown>
                              {formatMessageContent(message.content)}
                            </Markdown>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Message de chargement */}
                  {state.isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start mb-4"
                    >
                      <div className="flex max-w-[80%]">
                        <div className="mr-3">
                          <Avatar className={`w-10 h-10 ${
                            isFuturistic 
                              ? 'border-2 border-indigo-200' 
                              : 'border border-gray-200'
                          }`}>
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              <Bot size={18} />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className={`p-3 px-4 rounded-lg ${
                          isFuturistic
                            ? 'bg-white border border-indigo-100 shadow-sm'
                            : 'bg-gray-100'
                        }`}>
                          <div className="flex space-x-2">
                            <div className={`w-2 h-2 rounded-full ${isFuturistic ? 'bg-indigo-400' : 'bg-blue-400'} animate-ping`}></div>
                            <div className={`w-2 h-2 rounded-full ${isFuturistic ? 'bg-indigo-400' : 'bg-blue-400'} animate-ping [animation-delay:0.2s]`}></div>
                            <div className={`w-2 h-2 rounded-full ${isFuturistic ? 'bg-indigo-400' : 'bg-blue-400'} animate-ping [animation-delay:0.4s]`}></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </AnimatePresence>
              </div>
              
              {/* Zone de saisie */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Votre réponse..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={state.isLoading}
                    className={`flex-1 ${
                      isFuturistic 
                        ? 'border-indigo-200 focus-visible:ring-indigo-400' 
                        : 'border-gray-300 focus-visible:ring-blue-400'
                    }`}
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={state.isLoading || !inputMessage.trim()}
                    className={isFuturistic ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Carte d'information */}
        <Card className={isFuturistic ? 'border-indigo-100 shadow-sm' : 'border-gray-200'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-indigo-500" />
              À propos de cette enquête
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Cette enquête interactive vous fait découvrir un concept de cybersécurité de façon ludique. 
              L'IA génère un scénario unique à chaque fois. Votre mission : comprendre et identifier le concept 
              en suivant les indices et en répondant aux questions.
            </p>
          </CardContent>
        </Card>
      </div>
    </HomeLayout>
  );
};

export default CyberInvestigation;