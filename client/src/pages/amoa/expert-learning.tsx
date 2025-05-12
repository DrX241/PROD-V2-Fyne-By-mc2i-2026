import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import DOMPurify from 'dompurify';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, ChevronDown, RefreshCw, Send, X } from "lucide-react";
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
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-violet-400 hover:text-violet-300 underline">$1</a>'
  );
  
  // Préserve les retours à la ligne et ajoute quelques mises en forme
  const formatted = linkified
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Gras
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italique
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-violet-900/30 p-3 rounded my-2 overflow-x-auto"><code>$1</code></pre>') // Code block
    .replace(/`([^`]+)`/g, '<code class="bg-violet-900/30 px-1 rounded">$1</code>') // Inline code
    .replace(/^### (.*?)$/gm, '<h3 class="text-lg font-bold text-violet-300 mt-4 mb-2">$1</h3>') // h3
    .replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold text-violet-300 mt-4 mb-2">$1</h2>') // h2
    .replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold text-violet-300 mt-4 mb-2">$1</h1>') // h1
    .replace(/^> (.*?)$/gm, '<blockquote class="border-l-4 border-violet-500 pl-4 italic text-violet-300/80 my-2">$1</blockquote>') // blockquote
    .replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>') // unordered list items
    .replace(/^(\d+)\. (.*?)$/gm, '<li class="ml-4"><span class="text-violet-400">$1.</span> $2</li>') // ordered list items
    .replace(/<\/li>\n<li/g, '</li><li') // Fix adjacent list items
    .replace(/\n\n/g, '<br/><br/>') // Double line breaks
    .replace(/\n/g, '<br/>'); // Single line breaks
  
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
    setLocation('/amoa-mode-selection');
  };
  
  return (
    <HomeLayout gradientBg>
      <div className="min-h-screen relative overflow-hidden">
        {/* Background de style console AMOA avec effet de lignes numériques */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-violet-950 to-indigo-950">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-700/10 via-transparent to-transparent opacity-30"></div>
          
          {/* Lignes de code stylisées */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="text-xs text-violet-300 font-mono whitespace-nowrap">
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
              <path d="M40,60 L45,70 L65,50" fill="none" stroke="#a78bfa" strokeWidth="2" />
            </svg>
          </div>
        </div>
        
        <div className="relative z-10 max-w-6xl w-full mx-auto px-4 py-8 sm:px-6 sm:py-12">
          {/* Bouton de retour - style console AMOA */}
          <div className="absolute top-0 left-4 mt-4">
            <Button 
              variant="outline" 
              onClick={handleReturnToPrevious}
              className="bg-violet-950 border-violet-400/30 text-violet-400 hover:bg-violet-900 hover:border-violet-400/50 flex items-center gap-2 font-mono text-xs shadow-[0_0_10px_rgba(167,139,250,0.1)]"
            >
              <span className="text-red-400">←</span>
              <span>RETOUR CONSOLE PRINCIPALE</span>
            </Button>
          </div>
          
          <div className="flex flex-col items-center justify-center h-full pt-16">
            {!isSessionActive && !sessionSummary ? (
              // Page d'accueil - style terminal AMOA
              <Card className="w-full max-w-2xl bg-violet-950 border border-violet-400/30 text-white shadow-[0_0_15px_rgba(167,139,250,0.1)]">
                <CardHeader className="border-b border-violet-400/20">
                  <CardTitle className="font-mono text-violet-400 flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    EXPERT AMOA - INTERFACE DE DIALOGUE
                  </CardTitle>
                  <CardDescription className="text-violet-100/70 font-mono">
                    VERSION 2.5.3 | ÉTAT: <span className="text-violet-300">PRÊT</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-6 space-y-4 text-violet-100">
                  <div className="font-mono text-sm border-l-2 border-violet-400/50 pl-4">
                    <p>Bienvenue sur le module <span className="text-violet-400">APPRENDRE EN ÉCHANGEANT</span>.</p>
                    <p className="mt-2">Cette interface vous permet d'interagir avec un expert en Assistance à Maîtrise d'Ouvrage pour explorer des concepts adaptés à votre niveau et à vos besoins spécifiques.</p>
                  </div>
                  
                  <div className="bg-violet-900 p-4 rounded-md border border-violet-400/30 font-mono text-sm space-y-3">
                    <p className="text-red-400">► FONCTIONNALITÉS:</p>
                    <ul className="space-y-2 pl-6 list-disc text-violet-100">
                      <li>Dialogue avec un expert en AMOA pour identifier vos besoins d'apprentissage</li>
                      <li>Contenu personnalisé adapté à votre niveau et votre domaine professionnel</li>
                      <li>Formats d'apprentissage flexibles (méthodologies, ateliers, livrables)</li>
                      <li>Références actualisées aux méthodes et bonnes pratiques en gestion de projet</li>
                      <li>Mode décision avec scénarios complexes et choix stratégiques</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-violet-400/20 pt-4 flex justify-center">
                  <Button 
                    onClick={startSession}
                    disabled={isLoading}
                    className="bg-violet-600 hover:bg-violet-500 text-white font-mono"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        INITIALISATION...
                      </>
                    ) : (
                      <>DÉMARRER UNE SESSION</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="flex flex-col w-full max-w-4xl mx-auto">
                {/* Mode décision ou chat standard */}
                {isDecisionMode && currentScenario ? (
                  <div className="w-full">
                    {/* Affichage du mode décision quand on a un scénario */}
                    <div className="bg-indigo-950 p-4 rounded-lg mb-4 shadow-lg border border-indigo-400/30">
                      <h2 className="text-indigo-200 text-xl font-bold mb-2">Mode Décision AMOA</h2>
                      <p className="text-indigo-100">Scénario {scenarioNumber} sur {totalScenarios}</p>
                    </div>
                    {/* Interface de scénario */}
                    <div className="bg-indigo-950 p-6 rounded-lg border border-indigo-400/30 shadow-lg">
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-indigo-200 mb-3">{currentScenario.title}</h3>
                        <p className="text-indigo-100 mb-4">{currentScenario.description}</p>
                        <div className="bg-indigo-900/40 p-4 rounded-md border border-indigo-700/50 mb-4">
                          <h4 className="text-indigo-300 font-medium mb-2">Contexte</h4>
                          <p className="text-indigo-100">{currentScenario.context}</p>
                        </div>
                      </div>
                      <div className="space-y-4 mb-6">
                        <h4 className="text-indigo-300 font-medium">Options</h4>
                        {currentScenario.options.map((option: any) => (
                          <div 
                            key={option.id}
                            className="p-4 rounded-md bg-indigo-900/40 border border-indigo-700/50 hover:bg-indigo-800/50 cursor-pointer"
                            onClick={() => handleDecisionMade(currentScenario.id, option.id)}
                          >
                            <h5 className="font-medium text-indigo-200 mb-1">{option.text}</h5>
                            <p className="text-indigo-100 text-sm">{option.description}</p>
                          </div>
                        ))}
                      </div>
                      {isLoadingScenario && (
                        <div className="flex justify-center p-4">
                          <span className="text-indigo-300">Traitement en cours...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col w-full">
                    {/* Zone de chat avec messages */}
                    <div 
                      ref={chatContainerRef}
                      className="flex-1 overflow-y-auto bg-violet-950/80 border border-violet-400/30 rounded-t-md shadow-[0_0_15px_rgba(167,139,250,0.1)] h-[calc(100vh-350px)] min-h-[400px]"
                    >
                      <div className="p-4 space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.type === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[85%] p-3 rounded-md ${
                                message.type === "user"
                                  ? "bg-violet-600/30 text-white ml-auto"
                                  : "bg-violet-900 border border-violet-400/20 text-white"
                              }`}
                            >
                              {message.type === "bot" ? (
                                <div 
                                  className="prose prose-invert max-w-none text-violet-100" 
                                  dangerouslySetInnerHTML={{ 
                                    __html: DOMPurify.sanitize(formatTextWithStructure(message.content)) 
                                  }}
                                />
                              ) : (
                                <p className="text-violet-100">{message.content}</p>
                              )}
                              <div className="text-xs text-violet-400/60 mt-1 text-right">
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
                            <div className="max-w-[85%] p-3 rounded-md bg-violet-900 border border-violet-400/20 text-white">
                              <div className="flex space-x-2">
                                <div className="w-2 h-2 rounded-full bg-violet-400/30 animate-pulse"></div>
                                <div className="w-2 h-2 rounded-full bg-violet-400/30 animate-pulse delay-150"></div>
                                <div className="w-2 h-2 rounded-full bg-violet-400/30 animate-pulse delay-300"></div>
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
                        className="absolute bottom-32 right-8 rounded-full bg-violet-950 border-violet-400/30 text-violet-400 hover:bg-violet-900 hover:border-violet-400/50 shadow-[0_0_10px_rgba(167,139,250,0.2)]"
                        onClick={scrollToBottom}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    )}
              
                    {/* Zone de saisie de message - masquée en mode décision */}
                    {!isDecisionMode && (
                      <div className="bg-violet-900 p-4 rounded-b-md border-x border-b border-violet-400/30 shadow-[0_0_15px_rgba(167,139,250,0.1)]">
                        <form onSubmit={handleSubmit} className="flex space-x-2">
                          <div className="flex-1 relative">
                            <textarea
                              ref={textareaRef}
                              value={inputMessage}
                              onChange={(e) => setInputMessage(e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="Posez votre question sur l'AMOA..."
                              className="w-full p-3 bg-violet-950 text-violet-100 border border-violet-400/30 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-400/50 resize-none min-h-[60px] max-h-[120px] overflow-y-auto"
                              disabled={isLoading}
                              rows={2}
                            />
                            <div className="absolute right-3 bottom-2 text-xs text-violet-400/60">
                              {inputMessage.length > 0 ? `${inputMessage.length} car.` : 'Entrée: envoyer · Maj+Entrée: nouvelle ligne'}
                            </div>
                          </div>
                          <Button 
                            type="submit" 
                            disabled={isLoading || !inputMessage.trim()} 
                            className="bg-violet-600 hover:bg-violet-500 text-white self-end h-[60px] w-[60px]"
                          >
                            {isLoading ? (
                              <RefreshCw className="h-5 w-5 animate-spin" />
                            ) : (
                              <Send className="h-5 w-5" />
                            )}
                          </Button>
                        </form>
                        
                        {/* Bouton de fin de session */}
                        <div className="mt-3 flex justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={endSession}
                            disabled={isLoading}
                            className="bg-violet-950 border-red-400/30 text-red-400 hover:bg-violet-900 hover:border-red-400/50 text-xs"
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
                <Card className="w-full max-w-3xl bg-violet-950 border-violet-400/30 text-white shadow-[0_0_20px_rgba(167,139,250,0.2)]">
                  <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-violet-950 to-indigo-900 border-b border-violet-400/20">
                    <CardTitle className="text-violet-200 flex items-center gap-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-violet-300">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#c4b5fd" />
                      </svg>
                      <span>Bilan de votre aventure AMOA</span>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={closeSessionSummary}
                      className="text-violet-300 hover:text-violet-100 hover:bg-violet-800/50"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="max-h-[60vh] overflow-y-auto pt-6">
                    {sessionSummary === "Aucune interaction n'a été enregistrée pendant cette session." ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="w-16 h-16 mb-4 rounded-full bg-violet-900/50 flex items-center justify-center">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <p className="text-violet-100 mb-3 text-lg font-medium">{sessionSummary}</p>
                        <p className="text-violet-300/70 text-sm px-6">Pour obtenir un bilan personnalisé et débloquer de nouvelles compétences, échangez avec Sam lors de votre prochaine session.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-violet-900/30 p-4 rounded-lg border border-violet-500/20 shadow-inner">
                          <div 
                            className="prose prose-invert max-w-none text-violet-100" 
                            dangerouslySetInnerHTML={{ 
                              __html: DOMPurify.sanitize(formatTextWithStructure(sessionSummary)) 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-center gap-4 pt-6 pb-6">
                    <Button
                      onClick={startSession}
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-[0_0_15px_rgba(109,40,217,0.25)] font-medium px-6"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" className="mr-2" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 8L16 12L10 16V8Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Démarrer une nouvelle aventure
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReturnToPrevious}
                      className="border-violet-400/30 text-violet-300 hover:bg-violet-800/50 hover:text-violet-100 hover:border-violet-400/50"
                    >
                      Retour à la console principale
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