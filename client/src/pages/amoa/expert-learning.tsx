import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import DOMPurify from 'dompurify';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, ChevronDown, RefreshCw, Send, X, Play, CheckSquare, Sparkles, Download } from "lucide-react";
import HomeLayout from '@/components/layout/HomeLayout';
import { DecisionProvider, useDecision } from '@/contexts/DecisionContext';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

function formatTextWithStructure(text: string): string {
  // Remplace les liens
  const linkified = text.replace(
    /(https?:\/\/[^\s]+)/g, 
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>'
  );
  
  // Format minimal pour un rendu élégant - moins académique
  const formatted = linkified
    // Conserver le formatage basique (gras/italique) pour l'emphase
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-200">$1</strong>') // Gras subtil
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italique
    
    // Conserver le code mais avec un style plus discret
    .replace(/```([\s\S]*?)```/g, '<div class="bg-blue-900/20 p-2 rounded my-2 overflow-x-auto border-l-2 border-blue-400/30">$1</div>') // Code block simplifié
    .replace(/`([^`]+)`/g, '<span class="text-blue-300">$1</span>') // Inline code subtil
    
    // Supprime les titres markdown pour un style plus conversationnel
    .replace(/^### (.*?)$/gm, '<div class="text-blue-300 font-medium mt-2 mb-0">$1</div>') 
    .replace(/^## (.*?)$/gm, '<div class="text-blue-300 font-medium mt-2 mb-0">$1</div>') 
    .replace(/^# (.*?)$/gm, '<div class="text-blue-300 font-medium mt-2 mb-0">$1</div>') 
    
    // Citations plus subtiles 
    .replace(/^> (.*?)$/gm, '<div class="border-l-2 border-blue-500/40 pl-2 my-1 text-blue-300/80">$1</div>') 
    
    // Listes avec espacement réduit
    .replace(/^- (.*?)$/gm, '<div class="flex mb-0 py-0">• <span class="ml-1">$1</span></div>') // Puces très compactes
    .replace(/^(\d+)\. (.*?)$/gm, '<div class="flex mb-0 py-0"><span class="text-blue-400 mr-1">$1.</span> <span>$2</span></div>') // Numération très compacte
    
    // Paragraphes avec espacement minimal
    .replace(/\n\n/g, '<div class="mt-0.5"></div>') // Espace très réduit
    .replace(/\n/g, '<br>'); // Simple saut de ligne
  
  return formatted;
}

// Contenu principal de la page
function ExpertLearningPageContent() {
  const [, setLocation] = useLocation();
  const decision = useDecision();
  // États pour le mode décision
  const [isDecisionMode, setIsDecisionMode] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<any>(null);
  const [scenarioNumber, setScenarioNumber] = useState(0);
  const [totalScenarios, setTotalScenarios] = useState(0);
  const [isLoadingScenario, setIsLoadingScenario] = useState(false);
  const [scenarioSummary, setScenarioSummary] = useState<string | null>(null);
  
  // Fonction pour démarrer un scénario de décision
  const startDecisionScenario = async () => {
    if (!sessionId) return;
    
    setIsLoadingScenario(true);
    
    try {
      const response = await axios.post('/api/amoa-expert/generate-scenario', {
        userId: sessionId
      });
      
      if (response.data.success) {
        setCurrentScenario(response.data.scenario);
        setScenarioNumber(response.data.currentNumber);
        setTotalScenarios(response.data.totalScenarios);
        setIsDecisionMode(true);
      } else {
        throw new Error(response.data.error || "Erreur lors du démarrage du mode décision");
      }
    } catch (error) {
      console.error("Erreur lors du démarrage du mode décision:", error);
    } finally {
      setIsLoadingScenario(false);
    }
  };
  
  // Fonction pour gérer une décision prise
  const handleDecisionMade = async (scenarioId: string, optionId: string) => {
    if (!sessionId) return;
    
    setIsLoadingScenario(true);
    
    try {
      const response = await axios.post('/api/amoa-expert/decision', {
        userId: sessionId,
        scenarioId,
        optionId
      });
      
      if (response.data.success) {
        if (response.data.isComplete) {
          // Session terminée
          setScenarioSummary(response.data.summary);
          setIsDecisionMode(false);
          setCurrentScenario(null);
        } else {
          // Passer au scénario suivant
          setCurrentScenario(response.data.nextScenario);
          setScenarioNumber(response.data.currentNumber);
          setTotalScenarios(response.data.totalScenarios);
        }
      } else {
        throw new Error(response.data.error || "Erreur lors du traitement de la décision");
      }
    } catch (error) {
      console.error("Erreur lors du traitement de la décision:", error);
    } finally {
      setIsLoadingScenario(false);
    }
  };
  
  // États du chat
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionSummary, setSessionSummary] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Références
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Gestion du défilement et du bouton de défilement
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
      }
    };
    
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Défilement automatique vers le bas lors de l'ajout de nouveaux messages
  useEffect(() => {
    if (messages.length > 0 && !showScrollButton) {
      scrollToBottom();
    }
  }, [messages, showScrollButton]);
  
  // Ajuster la hauteur du textarea quand le contenu change
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [inputMessage]);
  
  // Démarrer automatiquement la session au chargement de la page
  useEffect(() => {
    if (!isSessionActive && !sessionSummary && !isLoading) {
      startSession();
    }
  }, []);
  
  // Fonction pour faire défiler jusqu'au bas du chat
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };
  
  // Démarrer une nouvelle session d'apprentissage
  const startSession = async () => {
    setIsLoading(true);
    setMessages([]);
    setSessionSummary(null);
    
    try {
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      
      const response = await axios.post('/api/amoa-expert/init', {
        userId: newSessionId
      });
      
      if (response.data.success) {
        const newMessage: Message = {
          id: uuidv4(),
          type: 'bot',
          content: response.data.message,
          timestamp: new Date()
        };
        
        setMessages([newMessage]);
        setIsSessionActive(true);
      } else {
        console.error('Failed to initialize AMOA expert session');
      }
    } catch (error) {
      console.error('Error starting AMOA expert session:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Terminer la session actuelle
  const endSession = async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/amoa-expert/end', {
        userId: sessionId
      });
      
      if (response.data.success) {
        setSessionSummary(response.data.summary);
        setIsSessionActive(false);
        setIsDecisionMode(false);
        setCurrentScenario(null);
      }
    } catch (error) {
      console.error('Error ending AMOA expert session:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fermer le résumé de session et réinitialiser
  const closeSessionSummary = () => {
    setSessionSummary(null);
    setSessionId(null);
  };
  
  // Gérer la soumission du formulaire de message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !sessionId || isLoading) return;
    
    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: uuidv4(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/amoa-expert/message', {
        userId: sessionId,
        message: userMessage.content
      });
      
      if (response.data.success) {
        const botMessage: Message = {
          id: uuidv4(),
          type: 'bot',
          content: response.data.message,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        
        // Si l'IA recommande de passer en mode décision, l'activer
        if (response.data.activateDecisionMode) {
          startDecisionScenario();
        }
      }
    } catch (error) {
      console.error('Error sending message to AMOA expert:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Gérer les touches spéciales (notamment Entrée pour envoyer)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  // Retour à la page précédente
  const handleReturnToPrevious = () => {
    setLocation('/amoa/sas-academie');
  };
  
  return (
    <HomeLayout gradientBg>
      <div className="min-h-screen relative overflow-hidden">
        {/* Background de style console AMOA avec effet de lignes numériques */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-950 to-blue-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-700/10 via-transparent to-transparent opacity-30"></div>
          
          {/* Lignes de code stylisées */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="text-xs text-blue-300 font-mono whitespace-nowrap">
                {Array.from({ length: 50 }).map((_, j) => (
                  <span key={j} className="mr-2">
                    {Math.random() > 0.5 ? '{' : Math.random() > 0.5 ? '}' : Math.random() > 0.5 ? '(' : ')'}
                    {Math.random().toString(36).substring(2, 4)}{Math.random() > 0.7 ? '()' : ''}
                    {Math.random() > 0.8 ? ';' : ''}
                  </span>
                ))}
              </div>
            ))}
          </div>
          
          {/* Icône "check" stylisée pour compléter le thème AMOA */}
          <div className="absolute bottom-5 right-5 opacity-30">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <path d="M40,60 L45,70 L65,50" fill="none" stroke="#60a5fa" strokeWidth="2" />
            </svg>
          </div>
        </div>
        
        <div className="relative z-10 max-w-6xl w-full mx-auto px-4 py-8 sm:px-6 sm:py-12">
          {/* Bouton de retour - style console AMOA */}
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={handleReturnToPrevious}
              className="bg-blue-900 border-blue-400/30 text-blue-300 hover:bg-blue-800 hover:border-blue-400/50 flex items-center gap-2 font-mono text-xs shadow-[0_0_10px_rgba(139,178,250,0.1)]"
            >
              <span className="text-blue-200">←</span>
              <span>RETOUR MODULES AMOA</span>
            </Button>
          </div>
          
          <div className="flex flex-col items-center justify-center h-full pt-6">
            {false ? ( // Désactivation complète de la page intermédiaire
              <div></div>
            ) : (
              <div className="flex flex-col w-full max-w-4xl mx-auto">
                {/* Mode décision ou chat standard */}
                {isDecisionMode && currentScenario ? (
                  <div className="w-full">
                    {/* Affichage du mode décision quand on a un scénario */}
                    <div className="bg-blue-950 p-3 rounded-lg mb-3 shadow-lg border border-blue-400/30">
                      <h2 className="text-blue-200 text-lg font-bold mb-1">Mode Décision AMOA</h2>
                      <p className="text-blue-100">Scénario {scenarioNumber} sur {totalScenarios}</p>
                    </div>
                    {/* Interface de scénario */}
                    <div className="bg-blue-950 p-4 rounded-lg border border-blue-400/30 shadow-lg">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-blue-200 mb-2">{currentScenario.title}</h3>
                        <p className="text-blue-100 mb-3 text-sm">{currentScenario.description}</p>
                        <div className="bg-blue-900/40 p-3 rounded-md border border-blue-700/50 mb-3">
                          <h4 className="text-blue-300 font-medium mb-1 text-sm">Contexte</h4>
                          <p className="text-blue-100 text-xs">{currentScenario.context}</p>
                        </div>
                      </div>
                      <div className="space-y-4 mb-6">
                        <h4 className="text-blue-300 font-medium">Options</h4>
                        {currentScenario.options.map((option: any) => (
                          <div 
                            key={option.id}
                            className="p-3 rounded-md bg-blue-900/40 border border-blue-700/50 hover:bg-blue-800/50 cursor-pointer"
                            onClick={() => handleDecisionMade(currentScenario.id, option.id)}
                          >
                            <h5 className="font-medium text-blue-200 mb-0">{option.text}</h5>
                            <p className="text-blue-100 text-xs">{option.description}</p>
                          </div>
                        ))}
                      </div>
                      {isLoadingScenario && (
                        <div className="flex justify-center p-2">
                          <span className="text-blue-300 text-xs">Traitement en cours...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col w-full">
                    {/* Zone de chat avec messages */}
                    <div 
                      ref={chatContainerRef}
                      className="flex-1 overflow-y-auto bg-blue-950/80 border border-blue-400/30 rounded-t-md shadow-[0_0_15px_rgba(139,178,250,0.1)] h-[calc(100vh-180px)] min-h-[700px] w-full"
                    >
                      <div className="p-6 space-y-3">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.type === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[85%] p-4 rounded-md ${
                                message.type === "user"
                                  ? "bg-blue-600/40 text-white ml-auto"
                                  : "bg-blue-900 border border-blue-400/20 text-white"
                              }`}
                            >
                              {message.type === "bot" ? (
                                <div 
                                  className="prose prose-invert prose-p:my-1 prose-headings:mt-2 prose-headings:mb-1 prose-li:my-0 prose-ol:my-1 prose-ul:my-1 max-w-none text-blue-100" 
                                  dangerouslySetInnerHTML={{ 
                                    __html: DOMPurify.sanitize(formatTextWithStructure(message.content)) 
                                  }}
                                />
                              ) : (
                                <p className="text-blue-100">{message.content}</p>
                              )}
                              <div className="text-xs text-blue-400/60 mt-2 text-right">
                                {new Date(message.timestamp).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="max-w-[85%] p-4 rounded-md bg-blue-900 border border-blue-400/20 text-white">
                              <div className="flex space-x-2">
                                <div className="w-2 h-2 rounded-full bg-blue-400/30 animate-pulse"></div>
                                <div className="w-2 h-2 rounded-full bg-blue-400/30 animate-pulse delay-150"></div>
                                <div className="w-2 h-2 rounded-full bg-blue-400/30 animate-pulse delay-300"></div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Suggestions de questions interactives */}
                        {messages.length > 0 && messages[messages.length-1].type === "bot" && !isLoading && (
                          <div className="flex justify-start mt-2">
                            <div className="max-w-[85%] p-3 rounded-md bg-blue-950 border border-blue-400/10 text-white">
                              <p className="text-sm text-blue-300 mb-2">Questions suggérées :</p>
                              <div className="flex flex-wrap gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setInputMessage("Pouvez-vous m'expliquer le rôle d'un AMOA dans un projet Agile ?")}
                                  className="text-xs bg-blue-900/40 border-blue-400/20 text-blue-200 hover:bg-blue-800/60"
                                >
                                  Rôle AMOA en Agile
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setInputMessage("Quelles sont les compétences clés pour réussir en tant qu'AMOA ?")}
                                  className="text-xs bg-blue-900/40 border-blue-400/20 text-blue-200 hover:bg-blue-800/60"
                                >
                                  Compétences clés AMOA
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setInputMessage("Comment rédiger un bon cahier des charges ?")}
                                  className="text-xs bg-blue-900/40 border-blue-400/20 text-blue-200 hover:bg-blue-800/60"
                                >
                                  Cahier des charges
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
              
                    {/* Bouton de défilement vers le bas */}
                    {showScrollButton && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute bottom-32 right-8 rounded-full bg-blue-950 border-blue-400/30 text-blue-400 hover:bg-blue-900 hover:border-blue-400/50 shadow-[0_0_10px_rgba(139,178,250,0.2)]"
                        onClick={scrollToBottom}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    )}
              
                    {/* Zone de saisie de message - masquée en mode décision */}
                    {!isDecisionMode && (
                      <div className="bg-blue-900 p-4 rounded-b-md border-x border-b border-blue-400/30 shadow-[0_0_15px_rgba(139,178,250,0.1)]">
                        {/* Options d'interaction */}
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-300 hover:text-blue-200 hover:bg-blue-800/60 text-xs flex items-center"
                              onClick={() => setInputMessage("Mettons-nous en situation : je dois rédiger un cahier des charges pour un projet e-commerce.")}
                            >
                              <Play className="h-3.5 w-3.5 mr-1" />
                              Simulation
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-300 hover:text-blue-200 hover:bg-blue-800/60 text-xs flex items-center"
                              onClick={() => setInputMessage("Propose-moi un quiz sur les rôles et responsabilités d'un AMOA.")}
                            >
                              <CheckSquare className="h-3.5 w-3.5 mr-1" />
                              Quiz
                            </Button>
                          </div>
                          <div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-300 hover:text-blue-200 hover:bg-blue-800/60 text-xs"
                              onClick={() => setInputMessage("Quelles sont les dernières tendances en matière d'AMOA ?")}
                            >
                              <Sparkles className="h-3.5 w-3.5 mr-1" />
                              Tendances
                            </Button>
                          </div>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="flex space-x-2">
                          <div className="flex-1 relative">
                            <textarea
                              ref={textareaRef}
                              value={inputMessage}
                              onChange={(e) => setInputMessage(e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="Posez votre question sur l'AMOA..."
                              className="w-full p-4 bg-blue-950 text-blue-100 border border-blue-400/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none min-h-[70px] max-h-[120px] overflow-y-auto"
                              disabled={isLoading}
                              rows={2}
                            />
                            <div className="absolute right-3 bottom-2 text-xs text-blue-400/60">
                              {inputMessage.length > 0 ? `${inputMessage.length} car.` : 'Entrée: envoyer · Maj+Entrée: nouvelle ligne'}
                            </div>
                          </div>
                          <Button 
                            type="submit" 
                            disabled={isLoading || !inputMessage.trim()} 
                            className="bg-blue-600 hover:bg-blue-500 text-white self-end h-[70px] w-[70px]"
                          >
                            {isLoading ? (
                              <RefreshCw className="h-5 w-5 animate-spin" />
                            ) : (
                              <Send className="h-5 w-5" />
                            )}
                          </Button>
                        </form>
                        
                        {/* Boutons d'action */}
                        <div className="mt-3 flex justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {}}
                            className="text-xs bg-blue-800/40 border-blue-400/20 text-blue-200 hover:bg-blue-800/60"
                          >
                            <Download className="h-3.5 w-3.5 mr-1" />
                            Télécharger la conversation
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={endSession}
                            disabled={isLoading}
                            className="bg-blue-950 border-blue-400/30 text-blue-300 hover:bg-blue-900 hover:border-blue-400/50 text-xs"
                          >
                            Terminer la session
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Résumé de session (modal) */}
            {sessionSummary && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                <Card className="w-full max-w-3xl bg-blue-950 border-blue-400/30 text-white shadow-[0_0_20px_rgba(139,178,250,0.2)]">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-blue-400">Résumé de votre session</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={closeSessionSummary}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-900"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="max-h-[60vh] overflow-y-auto">
                    {sessionSummary === "Aucune interaction n'a été enregistrée pendant cette session." ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <p className="text-blue-100 mb-2">{sessionSummary}</p>
                        <p className="text-blue-300/70 text-sm">Pour obtenir un résumé détaillé, échangez des messages avec l'assistant pendant la session.</p>
                      </div>
                    ) : (
                      <div 
                        className="prose prose-invert max-w-none text-blue-100" 
                        dangerouslySetInnerHTML={{ 
                          __html: DOMPurify.sanitize(formatTextWithStructure(sessionSummary)) 
                        }}
                      />
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-center gap-4">
                    <Button
                      onClick={startSession}
                      className="bg-blue-600 hover:bg-blue-500 text-white"
                    >
                      Nouvelle session
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReturnToPrevious}
                      className="border-blue-400/30 text-blue-400 hover:bg-blue-900 hover:border-blue-400/50"
                    >
                      Retour aux modules AMOA
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

// Wrapper avec le contexte de décision
export default function ExpertLearningPage() {
  return (
    <DecisionProvider>
      <ExpertLearningPageContent />
    </DecisionProvider>
  );
}