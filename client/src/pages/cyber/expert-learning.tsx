import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, ChevronDown, RefreshCw, Bot, X, ArrowLeft } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import HomeLayout from "@/components/layout/HomeLayout";
import PageTitle from "@/components/utils/PageTitle";
import { apiRequest } from "@/lib/queryClient";
import DOMPurify from 'dompurify';
import { useLocation } from 'wouter';
import { DecisionProvider, useDecision } from "@/contexts/DecisionContext";
import CyberDecisionFlow from "@/components/cyber/CyberDecisionFlow";

// Fonction pour formater le texte avec une structure visuelle
const formatTextWithStructure = (text: string): string => {
  if (!text) return '';
  
  // Convertir les sauts de ligne en balises <br>
  let formattedText = text.replace(/\n/g, '<br>');
  
  // Détecter et mettre en évidence les styles d'apprentissage entre parenthèses 
  // comme (ACADÉMIQUE), (SIMULATION), (DÉFI), etc.
  formattedText = formattedText.replace(/\((ACADÉMIQUE|ACADEMIC|SIMULATION|DÉFI|CHALLENGE|VISUEL|VISUAL)\)/gi, 
    '<span class="inline-block bg-[#00b4d8]/20 text-[#00b4d8] text-xs px-2 py-0.5 rounded mr-1 uppercase font-mono">$1</span>');
  
  // Remplacer les listes numérotées (1., 2., etc.)
  formattedText = formattedText.replace(/^(\d+\.\s+)(.+)$/gm, '<div class="flex mb-2"><div class="w-6 flex-shrink-0 font-bold">$1</div><div>$2</div></div>');
  
  // Remplacer les listes à puces (-, *, •)
  formattedText = formattedText.replace(/^([-*•]\s+)(.+)$/gm, '<div class="flex mb-2"><div class="w-6 flex-shrink-0">$1</div><div>$2</div></div>');
  
  // Mettre en surbrillance les sections importantes (entre ** ou entourées de MAJUSCULES)
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-blue-300">$1</span>');
  
  // Ajouter une classe pour les sections en majuscules (comme "PHASE INITIALE")
  formattedText = formattedText.replace(/([A-Z]{3,}[\s-][A-Z\s-]+)(\s*-\s*)/g, '<div class="font-bold text-blue-300 mt-3 mb-1">$1</div>');
  
  // Gérer les titres de sections (mais pas ceux déjà traités comme styles d'apprentissage)
  formattedText = formattedText.replace(/(?<!span class="[^"]*">)(.*?):/g, '<span class="font-semibold">$1:</span>');

  return formattedText;
};

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
  readyForDecisionMode?: boolean;
}

// Composant principal avec l'interface d'apprentissage et la prise de décision
function ExpertLearningPageContent() {
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
  const [, setLocation] = useLocation();
  
  // Accès au contexte de décision
  const decision = useDecision();
  
  // Effet pour vérifier le statut de décision à l'initialisation et après l'envoi de messages
  useEffect(() => {
    if (userId) {
      decision.checkDecisionStatus(userId);
    }
  }, [userId]);
  
  // Fonction pour gérer une décision
  const handleDecisionMade = async (optionId: string) => {
    if (userId && decision.currentScenario) {
      await decision.submitDecision(userId, optionId);
    }
  };

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
          
          // Si le serveur indique que le mode décision est prêt
          if (response.sessionStatus.readyForDecisionMode && userId && response.sessionStatus.topic) {
            // Lancer automatiquement le mode décision après le débriefing
            decision.startDecisionFlow(userId, response.sessionStatus.topic);
            
            // Afficher un toast pour informer l'utilisateur du changement de mode
            toast({
              title: "Mode décision activé",
              description: "Vous allez maintenant être confronté à une série de décisions difficiles. Choisissez avec soin!",
              variant: "default"
            });
          }
        }
        
        // Vérifier si l'utilisateur est en mode décision après chaque message
        if (userId) {
          decision.checkDecisionStatus(userId);
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
  
  // Fonction pour retourner à la page précédente
  const handleReturnToPrevious = () => {
    // Si une session est active, demander confirmation avant de quitter
    if (isSessionActive) {
      if (window.confirm("Êtes-vous sûr de vouloir quitter la session ? Votre conversation sera perdue.")) {
        // Terminer la session côté serveur et naviguer à la page précédente
        if (userId) {
          // Faire une requête pour terminer la session sans attendre la réponse
          apiRequest('/api/cyber-expert/terminate', {
            method: 'POST',
            body: JSON.stringify({ userId })
          }).catch(err => console.error("Erreur lors de la fin de la session:", err));
        }
        setLocation('/cyber');
      }
    } else {
      // Si aucune session n'est active, naviguer directement
      setLocation('/cyber');
    }
  };

  return (
    <HomeLayout>
      <PageTitle title="Apprendre en échangeant" />
      
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-[#0a1420]">
        {/* Overlay cybersecurity visualizations */}
        <div className="absolute inset-0 w-full h-full z-0">
          {/* Digital code streams effect */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 180, 216, 0.2)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          {/* Simulated monitors with security data */}
          <div className="absolute top-0 left-0 w-1/4 h-full opacity-15">
            <div className="h-1/3 border border-[#00b4d8]/20 m-2 rounded-md p-4">
              <div className="w-full h-2 bg-[#00b4d8]/30 mb-2 rounded"></div>
              <div className="w-3/4 h-2 bg-[#00b4d8]/20 mb-2 rounded"></div>
              <div className="w-full h-2 bg-[#00b4d8]/10 mb-2 rounded"></div>
              <div className="w-1/2 h-2 bg-[#00b4d8]/20 mb-2 rounded"></div>
            </div>
          </div>
          
          <div className="absolute bottom-0 right-0 w-1/4 h-full opacity-15">
            <div className="h-1/3 border border-[#00b4d8]/20 m-2 rounded-md p-4">
              <div className="w-full h-2 bg-[#00b4d8]/20 mb-2 rounded"></div>
              <div className="w-3/4 h-2 bg-[#00b4d8]/30 mb-2 rounded"></div>
              <div className="w-full h-2 bg-[#00b4d8]/10 mb-2 rounded"></div>
              <div className="w-1/2 h-2 bg-[#00b4d8]/20 mb-2 rounded"></div>
            </div>
          </div>
          
          {/* Network diagram visualization */}
          <div className="absolute bottom-20 left-20 opacity-20">
            <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#e63946" strokeWidth="1" />
              <circle cx="100" cy="100" r="50" fill="none" stroke="#00b4d8" strokeWidth="1" />
              <line x1="30" y1="30" x2="170" y2="170" stroke="#00b4d8" strokeWidth="1" />
              <line x1="30" y1="170" x2="170" y2="30" stroke="#00b4d8" strokeWidth="1" />
              <circle cx="100" cy="100" r="5" fill="#e63946" />
              <circle cx="30" cy="30" r="3" fill="#00b4d8" />
              <circle cx="170" cy="170" r="3" fill="#00b4d8" />
              <circle cx="30" cy="170" r="3" fill="#00b4d8" />
              <circle cx="170" cy="30" r="3" fill="#00b4d8" />
            </svg>
          </div>
          
          {/* Shield icon */}
          <div className="absolute top-20 right-20 opacity-15">
            <svg width="100" height="120" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
              <path d="M50,10 L90,30 L90,60 C90,80 70,100 50,110 C30,100 10,80 10,60 L10,30 L50,10 Z" 
                fill="none" stroke="#e63946" strokeWidth="2" />
              <path d="M40,60 L45,70 L65,50" fill="none" stroke="#00b4d8" strokeWidth="2" />
            </svg>
          </div>
        </div>
        
        <div className="relative z-10 max-w-6xl w-full mx-auto px-4 py-8 sm:px-6 sm:py-12">
          {/* Bouton de retour - style console cybersécurité */}
          <div className="absolute top-0 left-4 mt-4">
            <Button 
              variant="outline" 
              onClick={handleReturnToPrevious}
              className="bg-[#091525] border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#112641] hover:border-[#00b4d8]/50 flex items-center gap-2 font-mono text-xs shadow-[0_0_10px_rgba(0,180,216,0.1)]"
            >
              <span className="text-[#e63946]">←</span>
              <span>RETOUR CONSOLE PRINCIPALE</span>
            </Button>
          </div>
          
          <div className="flex flex-col items-center mb-10 mt-10">
            <div className="flex items-center bg-[#091525]/80 px-4 py-3 rounded-md border border-[#00b4d8]/30 shadow-[0_0_15px_rgba(0,180,216,0.15)] mb-3">
              <div className="mr-4 p-2 rounded-full bg-[#00b4d8]/10 border border-[#00b4d8]/20">
                <Bot className="h-6 w-6 text-[#00b4d8]" />
              </div>
              <div>
                <h2 className="text-xl text-white font-bold tracking-tight">Expert Cyber Conversationnel</h2>
                <p className="text-[#00b4d8] text-sm">Module d'apprentissage personnalisé par IA</p>
              </div>
            </div>
            <p className="text-[#c3d9ee] text-sm text-center max-w-2xl">
              Posez vos questions sur la cybersécurité et adaptez votre apprentissage à votre domaine et votre niveau. 
              L'IA analysera vos besoins et vous guidera avec des explications personnalisées.
            </p>
          </div>
          
          {/* Interface principale conditionnelle */}
          {!isSessionActive && !sessionSummary ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Card className="w-full max-w-xl bg-[#091525]/80 border-[#00b4d8]/30 text-white shadow-[0_0_20px_rgba(0,180,216,0.1)]">
                <CardHeader>
                  <CardTitle className="text-center text-[#00b4d8]">Démarrer une nouvelle session</CardTitle>
                  <CardDescription className="text-center text-[#c3d9ee]">
                    Commencez votre parcours d'apprentissage avec l'expert en cybersécurité
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-[#121e2e] rounded-md border border-[#00b4d8]/20">
                    <h3 className="text-[#00b4d8] font-medium mb-2">Comment ça fonctionne ?</h3>
                    <ul className="space-y-2 text-sm text-[#c3d9ee]">
                      <li className="flex items-start">
                        <span className="text-[#e63946] mr-2">1.</span>
                        <span>Exprimez votre besoin ou votre question en cybersécurité.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#e63946] mr-2">2.</span>
                        <span>L'expert analyse votre demande et identifie le sujet précis.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#e63946] mr-2">3.</span>
                        <span>Vous recevez un contenu personnalisé adapté à votre niveau.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-[#e63946] mr-2">4.</span>
                        <span>Interagissez pour approfondir ou réorienter la discussion.</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={startSession} 
                    disabled={isLoading}
                    className="w-full bg-[#00b4d8] hover:bg-[#00b4d8]/80 text-[#091525] font-mono"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <span className="text-[#091525] mr-1">_</span>
                    )}
                    NOUVELLE SESSION <span className="text-[#091525] ml-1">_</span>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col w-full max-w-4xl mx-auto">
              {/* Mode décision/apprentissage */}
              {decision.isInDecisionMode && decision.currentScenario ? (
                <CyberDecisionFlow 
                  scenario={decision.currentScenario}
                  onDecisionMade={handleDecisionMade}
                  isLoading={decision.isLoading}
                  currentNumber={decision.currentScenarioNumber}
                  totalScenarios={decision.totalScenarios}
                  summary={decision.summary}
                />
              ) : (
                /* Interface de chat et entrée de messages */
                <>
                  {/* Zone de chat avec messages */}
                  <div 
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto bg-[#091525]/80 border border-[#00b4d8]/30 rounded-t-md shadow-[0_0_15px_rgba(0,180,216,0.1)] h-[calc(100vh-350px)] min-h-[400px]"
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
                                ? "bg-[#00b4d8]/30 text-white ml-auto"
                                : "bg-[#121e2e] border border-[#00b4d8]/20 text-white"
                            }`}
                          >
                            {message.type === "bot" ? (
                              <div 
                                className="prose prose-invert max-w-none text-[#c3d9ee]" 
                                dangerouslySetInnerHTML={{ 
                                  __html: DOMPurify.sanitize(formatTextWithStructure(message.content)) 
                                }}
                              />
                            ) : (
                              <p className="text-[#c3d9ee]">{message.content}</p>
                            )}
                            <div className="text-xs text-[#00b4d8]/60 mt-1 text-right">
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
                          <div className="max-w-[85%] p-3 rounded-md bg-[#121e2e] border border-[#00b4d8]/20 text-white">
                            <div className="flex space-x-2">
                              <div className="w-2 h-2 rounded-full bg-[#00b4d8]/30 animate-pulse"></div>
                              <div className="w-2 h-2 rounded-full bg-[#00b4d8]/30 animate-pulse delay-150"></div>
                              <div className="w-2 h-2 rounded-full bg-[#00b4d8]/30 animate-pulse delay-300"></div>
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
                      className="absolute bottom-32 right-8 rounded-full bg-[#091525] border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#112641] hover:border-[#00b4d8]/50 shadow-[0_0_10px_rgba(0,180,216,0.2)]"
                      onClick={scrollToBottom}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  )}
            
                  {/* Zone de saisie de message */}
                  <div className="bg-[#121e2e] p-4 rounded-b-md border-x border-b border-[#00b4d8]/30 shadow-[0_0_15px_rgba(0,180,216,0.1)]">
                    <form onSubmit={handleSubmit} className="flex space-x-2">
                      <div className="flex-1 relative">
                        <textarea
                          ref={textareaRef}
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Posez votre question sur la cybersécurité..."
                          className="w-full p-3 bg-[#091525] text-[#c3d9ee] border border-[#00b4d8]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/50 resize-none min-h-[60px] max-h-[120px] overflow-y-auto"
                          disabled={isLoading}
                          rows={2}
                        />
                        <div className="absolute right-3 bottom-2 text-xs text-[#00b4d8]/60">
                          {inputMessage.length > 0 ? `${inputMessage.length} car.` : 'Entrée: envoyer · Maj+Entrée: nouvelle ligne'}
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isLoading || !inputMessage.trim()} 
                        className="bg-[#00b4d8] hover:bg-[#00b4d8]/80 text-[#091525] self-end h-[60px] w-[60px]"
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
                        className="bg-[#091525] border-[#e63946]/30 text-[#e63946] hover:bg-[#112641] hover:border-[#e63946]/50 text-xs"
                      >
                        Terminer la session
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Résumé de session (modal) */}
          {sessionSummary && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
              <Card className="w-full max-w-2xl bg-[#091525] border-[#00b4d8]/30 text-white shadow-[0_0_20px_rgba(0,180,216,0.2)]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-[#00b4d8]">Résumé de votre session</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeSessionSummary}
                    className="text-[#00b4d8] hover:text-[#00b4d8]/80 hover:bg-[#121e2e]"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-invert max-w-none text-[#c3d9ee]" 
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(formatTextWithStructure(sessionSummary)) 
                    }}
                  />
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                  <Button
                    onClick={startSession}
                    className="bg-[#00b4d8] hover:bg-[#00b4d8]/80 text-[#091525]"
                  >
                    Nouvelle session
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReturnToPrevious}
                    className="border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#112641] hover:border-[#00b4d8]/50"
                  >
                    Retour à l'accueil
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
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