import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, ChevronLeft, RefreshCw, User, Bot, ArrowLeft, Briefcase } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import HomeLayout from "@/components/layout/HomeLayout";
import PageTitle from "@/components/utils/PageTitle";
import DOMPurify from 'dompurify';

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: number;
}

export default function InterviewTestPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Effet pour initialiser la session lors du chargement de la page
  useEffect(() => {
    startSession();
  }, []);
  
  // Fonction pour démarrer une nouvelle session
  const startSession = async () => {
    setIsLoading(true);
    setMessages([]);
    
    try {
      // Simulation d'initialisation d'une session d'entretien
      const newSessionId = uuidv4();
      setSessionId(newSessionId);
      
      // Message de bienvenue initial
      const welcomeMessage: Message = {
        id: uuidv4(),
        type: "bot",
        content: `Bonjour, je suis Arthur Dupont, responsable recrutement chez CyberShield, une entreprise spécialisée en cybersécurité. 
        
Nous recherchons actuellement un analyste en cybersécurité pour rejoindre notre équipe. Merci d'avoir postulé à ce poste.

Aujourd'hui, je vais vous poser quelques questions pour mieux comprendre votre profil et vos compétences en cybersécurité. Êtes-vous prêt à commencer l'entretien ?`,
        timestamp: Date.now()
      };
      
      setMessages([welcomeMessage]);
      setIsSessionActive(true);
      
      // Notifier l'utilisateur que la session a démarré
      toast({
        title: "Session d'entretien démarrée",
        description: "Vous êtes maintenant en conversation avec un recruteur virtuel.",
        duration: 3000
      });
    } catch (error) {
      console.error("Erreur lors du démarrage de la session:", error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la session d'entretien. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour terminer la session actuelle
  const endSession = () => {
    // Confirmation avant de terminer
    if (window.confirm("Êtes-vous sûr de vouloir terminer cet entretien ? Votre conversation sera perdue.")) {
      // Message de conclusion
      const conclusionMessage: Message = {
        id: uuidv4(),
        type: "bot",
        content: `Merci pour cet entretien. Nous avons terminé notre échange pour aujourd'hui. 

Je vais transmettre mes notes à l'équipe de recrutement, et nous reviendrons vers vous dans les prochains jours avec notre décision.

Avez-vous des questions finales concernant le poste ou l'entreprise ?`,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, conclusionMessage]);
      setIsSessionActive(false);
      
      toast({
        title: "Entretien terminé",
        description: "L'entretien est maintenant terminé. Vous pouvez continuer la conversation ou quitter.",
        duration: 5000
      });
    }
  };
  
  // Fonction pour envoyer un message
  const handleSendMessage = () => {
    if (!inputMessage.trim() || !sessionId) return;
    
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
    
    // Simuler une réponse du recruteur (pour l'exemple)
    setIsLoading(true);
    setTimeout(() => {
      const responses = [
        "Pouvez-vous me parler de votre expérience en matière de détection et de réponse aux incidents de sécurité ?",
        "Comment restez-vous informé des dernières tendances et menaces en cybersécurité ?",
        "Avez-vous déjà participé à une analyse forensique après une intrusion ? Pouvez-vous décrire votre approche ?",
        "Quelles solutions de sécurité avez-vous déjà implémentées dans vos précédentes expériences ?",
        "Comment aborderiez-vous la mise en place d'une politique de sécurité dans une entreprise qui n'en a pas encore ?",
        "Pouvez-vous décrire votre expérience avec les outils d'analyse de vulnérabilités et de tests d'intrusion ?",
        "Intéressant. Et comment géreriez-vous une situation où un employé contourne délibérément les protocoles de sécurité ?",
        "Merci pour ces précisions. Parlons maintenant de vos certifications en cybersécurité. Lesquelles possédez-vous ?"
      ];
      
      const botResponse: Message = {
        id: uuidv4(),
        type: "bot",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 2000);
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };
  
  // Gérer les raccourcis clavier (Entrée pour envoyer, Shift+Entrée pour sauter une ligne)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Rendre le texte formaté avec sécurité
  const renderMessage = (content: string) => {
    // Formatter le texte ici (ajout de paragraphes, etc.)
    const formatted = content.replace(/\n/g, '<br>');
    return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formatted) }} />;
  };
  
  // Faire défiler jusqu'en bas après l'ajout de nouveaux messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Fonction pour retourner à la page précédente
  const handleReturnToPrevious = () => {
    // Si une session est active, demander confirmation avant de quitter
    if (isSessionActive) {
      if (window.confirm("Êtes-vous sûr de vouloir quitter l'entretien ? Votre conversation sera perdue.")) {
        setLocation("/cyber/roleplay");
      }
    } else {
      // Si aucune session n'est active, naviguer directement
      setLocation("/cyber/roleplay");
    }
  };
  
  return (
    <HomeLayout>
      <PageTitle title="Simulation d'entretien | Cybersécurité" />
      
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-950 to-slate-900 text-white relative overflow-hidden">
        {/* Bouton de retour */}
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="outline"
            size="sm"
            className="bg-black/50 border-blue-800 text-blue-400 hover:bg-black/70 hover:text-blue-300"
            onClick={handleReturnToPrevious}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
        </div>
        
        {/* Interface principale */}
        <div className="container mx-auto pt-16 pb-8 px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* En-tête */}
            <Card className="bg-blue-900/40 border-blue-700/50 mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-200 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Entretien d'embauche : Analyste en Cybersécurité
                </CardTitle>
                <CardDescription className="text-blue-300/80">
                  Préparez-vous à un entretien avec un recruteur virtuel pour un poste en cybersécurité
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* Zone de chat */}
            <div className="bg-gradient-to-br from-blue-950 to-slate-900 border border-blue-800/50 rounded-t-md shadow-lg">
              <div 
                ref={chatContainerRef}
                className="h-[calc(100vh-300px)] overflow-y-auto p-4 space-y-4"
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-3xl p-4 rounded-lg ${
                        message.type === "user"
                          ? "bg-blue-700/40 ml-10 border border-blue-600/30"
                          : "bg-gray-800/70 mr-10 border border-blue-900/30"
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        {message.type === "user" ? (
                          <>
                            <span className="font-medium text-blue-300 mr-auto">Vous</span>
                            <User className="h-4 w-4 text-blue-300 ml-2" />
                          </>
                        ) : (
                          <>
                            <Bot className="h-4 w-4 text-blue-300 mr-2" />
                            <span className="font-medium text-blue-300">Arthur Dupont</span>
                            <span className="text-xs text-blue-400/60 ml-2">Recruteur</span>
                          </>
                        )}
                      </div>
                      <div className="text-blue-100">
                        {renderMessage(message.content)}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800/70 p-4 rounded-lg border border-blue-900/30">
                      <div className="flex items-center">
                        <Bot className="h-4 w-4 text-blue-300 mr-2" />
                        <span className="text-blue-300 font-medium">Arthur Dupont</span>
                      </div>
                      <div className="flex space-x-2 mt-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Zone de saisie */}
              <div className="border-t border-blue-800/50 p-4 bg-blue-950/80">
                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                  <div className="flex-1 bg-slate-900/80 rounded-md border border-blue-900/50 overflow-hidden">
                    <textarea
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={2}
                      placeholder="Tapez votre réponse..."
                      className="w-full bg-transparent text-blue-100 p-3 focus:outline-none resize-none"
                      disabled={!isSessionActive || isLoading}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={!isSessionActive || isLoading || !inputMessage.trim()}
                      className="bg-blue-700 hover:bg-blue-600 text-white"
                    >
                      {isLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                    {isSessionActive && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={endSession}
                        className="bg-red-700 hover:bg-red-600"
                      >
                        Terminer
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>
            
            {/* Conseils pour l'entretien */}
            <div className="mt-6 text-sm text-blue-300/70 max-w-4xl mx-auto text-center">
              <p>Conseil : Montrez votre connaissance technique tout en expliquant clairement les concepts de cybersécurité.</p>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}