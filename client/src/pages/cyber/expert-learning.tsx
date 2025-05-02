import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, ChevronDown, RefreshCw, Bot, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import HomeLayout from "@/components/layout/HomeLayout";
import PageTitle from "@/components/shared/PageTitle";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: number;
}

interface SessionStatus {
  currentStage: "initial" | "questioning" | "confirmation" | "learning";
  needIdentified: boolean;
  needConfirmed: boolean;
  topic?: string;
}

export default function ExpertLearningPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [sessionSummary, setSessionSummary] = useState<string | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Fonction pour démarrer une nouvelle session
  const startSession = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest<{success: boolean, userId: string, message: string}>('/api/cyber-expert/init', {
        method: 'POST'
      });

      if (response.success && response.userId) {
        setUserId(response.userId);
        setIsSessionActive(true);
        
        // Ajouter le message de bienvenue
        const welcomeMessage: Message = {
          id: uuidv4(),
          type: "bot",
          content: response.message,
          timestamp: Date.now()
        };
        setMessages([welcomeMessage]);
      } else {
        throw new Error("Échec de l'initialisation de la session");
      }
    } catch (error) {
      console.error("Erreur lors du démarrage de la session:", error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la session. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour terminer la session actuelle
  const endSession = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const response = await apiRequest<{success: boolean, summary?: string}>('/api/cyber-expert/terminate', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });

      if (response.success) {
        // Afficher le résumé si disponible
        if (response.summary) {
          setSessionSummary(response.summary);
        }
        
        // Réinitialiser l'état
        setIsSessionActive(false);
        setUserId(null);
        
        toast({
          title: "Session terminée",
          description: "Votre session d'apprentissage a été terminée avec succès.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la fin de la session:", error);
      toast({
        title: "Erreur",
        description: "Impossible de terminer la session. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour envoyer un message
  const sendMessage = async () => {
    if (!inputMessage.trim() || !userId) return;
    
    // Créer un message utilisateur
    const userMessage: Message = {
      id: uuidv4(),
      type: "user",
      content: inputMessage,
      timestamp: Date.now()
    };
    
    // Ajouter à la liste des messages
    setMessages(prev => [...prev, userMessage]);
    
    // Vider le champ de saisie
    setInputMessage("");
    
    // Focus sur le champ de saisie après envoi
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    
    setIsLoading(true);
    try {
      const response = await apiRequest<{success: boolean, message: string, sessionStatus: SessionStatus}>('/api/cyber-expert/message', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          message: userMessage.content
        })
      });

      if (response.success) {
        // Ajouter la réponse du bot
        const botResponse: Message = {
          id: uuidv4(),
          type: "bot",
          content: response.message,
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, botResponse]);
        
        // Mettre à jour le statut de la session
        if (response.sessionStatus) {
          setSessionStatus(response.sessionStatus);
        }
      } else {
        throw new Error("Échec de l'envoi du message");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre message. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de l'envoi du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  // Gestion des touches (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter - ajouter une nouvelle ligne
        return; // Comportement par défaut (insertion d'un saut de ligne)
      } else {
        // Enter simple - envoyer le message
        e.preventDefault(); // Empêcher le saut de ligne
        if (inputMessage.trim()) {
          handleSubmit(e);
        }
      }
    }
  };

  // Détecter le défilement pour afficher/masquer le bouton de défilement vers le bas
  useEffect(() => {
    if (!chatContainerRef.current) return;
    
    const handleScroll = () => {
      if (!chatContainerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);
    };
    
    // Vérifier la position initiale
    handleScroll();
    
    // Ajouter un écouteur de défilement
    chatContainerRef.current.addEventListener('scroll', handleScroll);
    
    return () => {
      chatContainerRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, [messages]);

  // Fonction pour faire défiler vers le bas
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Focus sur le champ de saisie au chargement
  useEffect(() => {
    if (textareaRef.current && isSessionActive) {
      textareaRef.current.focus();
    }
  }, [isSessionActive]);

  // Faire défiler vers le bas lors de l'ajout de nouveaux messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fermer le résumé et réinitialiser les états pour une nouvelle session
  const closeSessionSummary = () => {
    setSessionSummary(null);
    setMessages([]);
    setSessionStatus(null);
  };

  return (
    <HomeLayout>
      <PageTitle title="Apprendre en échangeant" />
      
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-900 to-blue-900">
        <div className="absolute inset-0 w-full h-full z-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative z-10 max-w-6xl w-full mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center">
              <Bot className="mr-3 h-8 w-8" /> 
              Apprendre en échangeant
            </h1>
            <p className="text-blue-100 mt-3 text-center max-w-3xl">
              Explorez des sujets de cybersécurité, résolvez des problèmes ou approfondissez vos connaissances en dialoguant avec un expert virtuel
            </p>
          </div>
          
          {/* Affichage du résumé de session */}
          {sessionSummary && !isSessionActive && (
            <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Résumé de votre session</h2>
                <Button 
                  variant="ghost" 
                  onClick={closeSessionSummary}
                  className="p-2 rounded-full h-auto"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sessionSummary.replace(/\n/g, '<br>') }} />
              <div className="mt-6 flex justify-center">
                <Button onClick={startSession} className="bg-blue-600 hover:bg-blue-700">
                  Démarrer une nouvelle session
                </Button>
              </div>
            </div>
          )}
          
          {!isSessionActive && !sessionSummary ? (
            <div className="max-w-lg mx-auto">
              <Card className="bg-gradient-to-br from-blue-800 to-indigo-900 text-white border-blue-700">
                <CardHeader>
                  <CardTitle className="text-xl text-center">Discutez avec un expert en cybersécurité</CardTitle>
                  <CardDescription className="text-blue-200 text-center">
                    Notre expert IA vous accompagne pour résoudre des problèmes, explorer des concepts ou approfondir vos connaissances
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-800/40 rounded-lg p-4 border border-blue-700/50">
                    <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                      Précisez votre besoin
                    </h3>
                    <p className="text-blue-100 text-sm">L'expert vous aide à clarifier votre besoin : résoudre un problème, explorer un sujet ou apprendre un concept</p>
                  </div>
                  
                  <div className="bg-blue-800/40 rounded-lg p-4 border border-blue-700/50">
                    <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
                      Échangez de manière interactive
                    </h3>
                    <p className="text-blue-100 text-sm">Bénéficiez d'explications personnalisées, d'exemples réels et de mises en situation pratiques</p>
                  </div>
                  
                  <div className="bg-blue-800/40 rounded-lg p-4 border border-blue-700/50">
                    <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
                      Testez vos connaissances
                    </h3>
                    <p className="text-blue-100 text-sm">Des mini-tests et exercices pratiques vous permettent de valider votre compréhension</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button 
                    onClick={startSession} 
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-6 text-lg w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                        Initialisation...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Bot className="mr-2 h-5 w-5" />
                        Discuter avec l'expert
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : isSessionActive && (
            <div className="bg-gradient-to-r from-blue-900/80 to-indigo-900/80 backdrop-blur-sm rounded-xl border border-blue-800/50 overflow-hidden shadow-xl max-w-5xl mx-auto">
              {/* En-tête de la conversation */}
              <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 border-b border-blue-800/50 flex justify-between items-center">
                <div className="flex items-center">
                  <Bot className="h-6 w-6 mr-2 text-blue-300" />
                  <h2 className="text-xl font-bold text-white">Expert Cybersécurité</h2>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={endSession} 
                  className="hover:bg-blue-800/50 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="flex items-center space-x-2">
                      <X className="h-5 w-5" />
                      <span>Terminer</span>
                    </span>
                  )}
                </Button>
              </div>
              
              {/* Conteneur des messages */}
              <div 
                ref={chatContainerRef}
                className="h-[calc(100vh-280px)] overflow-y-auto p-4 space-y-4"
              >
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-800/60 border border-blue-700/50 text-blue-50'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))}
                
                {isLoading && messages.length > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-blue-800/40 text-white p-3 rounded-lg flex items-center space-x-2 border border-blue-700/50">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Bouton de défilement vers le bas */}
              {showScrollButton && (
                <button 
                  onClick={scrollToBottom}
                  className="fixed right-6 bottom-24 bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full shadow-lg z-20 text-white hover:from-blue-700 hover:to-indigo-700 transition-all"
                  title="Défiler vers le bas"
                  aria-label="Défiler vers le bas de la conversation"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              )}
              
              {/* Zone de saisie */}
              <div className="p-4 border-t border-blue-800/50 bg-gradient-to-r from-blue-900 to-indigo-900">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <div className="relative flex-1">
                    <textarea 
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Posez votre question ou expliquez votre besoin..."
                      className="w-full px-4 py-3 bg-blue-800/40 border border-blue-700/50 rounded-lg text-white placeholder-blue-300 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={1}
                      disabled={isLoading}
                      style={{ minHeight: "2.5rem", maxHeight: "8rem" }}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full flex-shrink-0 h-auto w-auto"
                    disabled={!inputMessage.trim() || isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
}