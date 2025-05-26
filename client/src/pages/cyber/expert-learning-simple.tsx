import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, ChevronDown, RefreshCw, Bot, X, ArrowLeft, FileText, Plus, Home, Lightbulb as LightbulbIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import HomeLayout from "@/components/layout/HomeLayout";
import PageTitle from "@/components/utils/PageTitle";
import { apiRequest } from "@/lib/queryClient";
import DOMPurify from 'dompurify';
import { useLocation } from 'wouter';

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: number;
}

// Fonction pour formater le texte avec une structure visuelle
const formatTextWithStructure = (text: string): string => {
  if (!text) return '';
  
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#00b4d8] font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-[#c3d9ee] italic">$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-[#091525] text-[#00b4d8] px-2 py-1 rounded text-sm font-mono">$1</code>')
    .replace(/^\#\#\# (.*$)/gim, '<h3 class="text-[#00b4d8] text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^\#\# (.*$)/gim, '<h2 class="text-[#00b4d8] text-xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^\# (.*$)/gim, '<h1 class="text-[#00b4d8] text-2xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/^\- (.*$)/gim, '<li class="ml-4 text-[#c3d9ee]">• $1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 text-[#c3d9ee] list-decimal">$1</li>')
    .replace(/\n/g, '<br>');
};

export default function ExpertLearningPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialisation de la session
  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await apiRequest<{success: boolean, userId: string}>('/api/cyber-expert/init', {
          method: 'POST'
        });
        
        if (response.success) {
          setUserId(response.userId);
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
      }
    };
    
    initSession();
  }, []);

  // Auto-scroll en bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gestion du scroll pour afficher/masquer le bouton
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isNearBottom && messages.length > 3);
      }
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [messages]);

  // Gestion de l'envoi de message
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;
    
    const messageContent = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);
    
    // Créer un message utilisateur
    const userMessage: Message = {
      id: uuidv4(),
      type: "user",
      content: messageContent,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await apiRequest<{success: boolean, message: string}>('/api/cyber-expert/message', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          message: messageContent
        })
      });
      
      if (response.success) {
        const botResponse: Message = {
          id: uuidv4(),
          type: "bot",
          content: response.message,
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, botResponse]);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion des touches du clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Nouvelle session
  const startSession = () => {
    setMessages([]);
    setSessionSummary(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Fin de session
  const endSession = async () => {
    if (messages.length === 0) {
      toast({
        title: "Session vide",
        description: "Il n'y a pas de contenu à résumer dans cette session.",
        variant: "default"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiRequest<{success: boolean, summary: string}>('/api/cyber-expert/end-session', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      
      if (response.success) {
        setSessionSummary(response.summary);
      }
    } catch (error) {
      console.error("Erreur lors de la fin de session:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le résumé de session.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeSessionSummary = () => {
    setSessionSummary(null);
  };

  const handleReturnToPrevious = () => {
    setLocation('/cyber');
  };

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#1a1f3a] to-[#0a0e1a] text-white relative overflow-hidden">
        <PageTitle 
          title="Expert Learning - Cybersécurité"
          subtitle="Approfondissez vos connaissances avec notre expert IA"
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col w-full max-w-6xl mx-auto">
            <div className="flex flex-col w-full">
              {/* Barre de statut */}
              <div className="bg-[#091525] border border-[#00b4d8]/30 border-b-0 rounded-t-md p-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Bot className="h-5 w-5 text-[#00b4d8] mr-2" />
                    <span className="text-[#00b4d8] text-sm font-mono">Expert IA Cybersécurité</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReturnToPrevious}
                  className="text-[#00b4d8] hover:text-[#00b4d8]/80 hover:bg-[#112641] text-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Retour
                </Button>
              </div>

              {/* Zone de conversation */}
              <div className="relative bg-[#0d1929] border-x border-[#00b4d8]/30 h-[600px] flex flex-col">
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar cyber-expert"
                >
                  {messages.map((message, index) => (
                    <div key={message.id}>
                      <div className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] p-4 rounded-md ${
                          message.type === "user"
                            ? "bg-[#00b4d8]/30 text-white ml-auto shadow-[0_2px_10px_rgba(0,180,216,0.15)]"
                            : "bg-[#121e2e] border border-[#00b4d8]/20 text-white shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
                        }`}>
                          {message.type === "bot" ? (
                            <div 
                              className="prose prose-invert max-w-none text-[#c3d9ee] text-base" 
                              dangerouslySetInnerHTML={{ 
                                __html: DOMPurify.sanitize(formatTextWithStructure(message.content)) 
                              }}
                            />
                          ) : (
                            <p className="text-[#c3d9ee] text-base">{message.content}</p>
                          )}
                          <div className="text-xs text-[#00b4d8]/60 mt-2 text-right">
                            {new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] p-4 rounded-md bg-[#121e2e] border border-[#00b4d8]/20 text-white">
                        <div className="flex items-center gap-3">
                          <div className="flex space-x-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#00b4d8]/50 animate-pulse"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#00b4d8]/50 animate-pulse delay-150"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#00b4d8]/50 animate-pulse delay-300"></div>
                          </div>
                          <span className="text-xs text-[#00b4d8]/70">Génération d'une réponse personnalisée...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Bouton de défilement vers le bas */}
                {showScrollButton && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute bottom-32 right-8 rounded-full bg-[#091525] border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#112641] hover:border-[#00b4d8]/50"
                    onClick={scrollToBottom}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                )}

                {/* Zone de saisie */}
                <div className="bg-[#121e2e] p-6 rounded-b-md border-x border-b border-[#00b4d8]/30">
                  {/* Suggestions simples */}
                  {messages.length === 0 && (
                    <div className="mb-4">
                      <p className="text-[#00b4d8] text-sm font-mono mb-2">SUGGESTIONS:</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInputMessage("Comment me protéger contre le phishing ?")}
                          className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
                        >
                          Protection phishing
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInputMessage("Explique-moi les ransomwares")}
                          className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
                        >
                          Ransomwares
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInputMessage("Comment sécuriser mon Wi-Fi ?")}
                          className="border-[#00b4d8]/30 bg-[#091525]/80 text-[#c3d9ee] hover:bg-[#112641] hover:text-[#00b4d8] text-xs py-1"
                        >
                          Sécurité Wi-Fi
                        </Button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="flex space-x-3">
                    <div className="flex-1 relative">
                      <textarea
                        ref={textareaRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Posez votre question sur la cybersécurité..."
                        className="w-full p-4 bg-[#091525] text-[#c3d9ee] border border-[#00b4d8]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/50 resize-none min-h-[70px] max-h-[150px] overflow-y-auto text-base"
                        disabled={isLoading}
                        rows={2}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading || !inputMessage.trim()} 
                      className="bg-[#00b4d8] hover:bg-[#00b4d8]/80 text-[#091525] self-end h-[70px] w-[70px]"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-6 w-6 animate-spin" />
                      ) : (
                        <Send className="h-6 w-6" />
                      )}
                    </Button>
                  </form>

                  {/* Bouton de fin de session */}
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={endSession}
                      disabled={isLoading}
                      className="bg-[#091525] border-[#e63946]/30 text-[#e63946] hover:bg-[#112641] hover:border-[#e63946]/50"
                    >
                      Terminer la session
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal de résumé */}
          {sessionSummary && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75">
              <Card className="w-full max-w-4xl bg-[#091525] border border-[#00b4d8]/40 text-white">
                <CardHeader className="flex flex-row items-center justify-between border-b border-[#00b4d8]/20 pb-4">
                  <CardTitle className="text-[#00b4d8] text-xl font-mono flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Résumé de votre session
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeSessionSummary}
                    className="text-[#00b4d8] hover:text-[#00b4d8]/80 hover:bg-[#121e2e]"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent className="py-6 max-h-[60vh] overflow-y-auto">
                  <div 
                    className="prose prose-invert max-w-none text-[#c3d9ee] text-base" 
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(formatTextWithStructure(sessionSummary)) 
                    }}
                  />
                </CardContent>
                <CardFooter className="flex justify-center gap-6 border-t border-[#00b4d8]/20 pt-5">
                  <Button
                    onClick={startSession}
                    className="bg-[#00b4d8] hover:bg-[#00b4d8]/80 text-[#091525]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle session
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReturnToPrevious}
                    className="border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#112641] hover:border-[#00b4d8]/50"
                  >
                    <Home className="mr-2 h-4 w-4" />
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