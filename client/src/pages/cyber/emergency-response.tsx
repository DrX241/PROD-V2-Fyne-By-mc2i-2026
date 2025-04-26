import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import CyberLayout from "@/components/layout/CyberLayout";
import PageTitle from "@/components/utils/PageTitle";
import { Link } from "wouter";
import { 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Send, 
  ArrowLeft, 
  RefreshCw, 
  ChevronDown,
  CheckCircle2,
  FileText,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";

// Types d'urgences disponibles
enum EmergencyType {
  FORMATION = "Formation et sensibilisation à la cybersécurité",
  OSINT = "L'OSINT",
  CONFORMITE = "La conformité cyber en entreprise",
  STRATEGIE = "Définir une stratégie cyber et sa feuille de route",
  CRISE = "Gestion de crise cyber",
  SUPPLY_CHAIN = "La sécurité de la supply chain",
  IAM = "L'IAM",
  CLOUD = "La cybersécurité dans le cloud",
  DONNEES = "Sécurisation des données personnelles",
  VULNERABILITES = "Analyse des vulnérabilités et tests de pénétration",
  INCIDENTS = "Gestion des incidents de sécurité",
  FORENSICS = "Forensics"
}

// Interface pour un message dans la conversation
interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: number;
  contactName?: string;
  contactRole?: string;
}

// Interface pour la progression de la session
interface SessionProgress {
  currentStage: number;
  completedObjectives: string[];
  performanceScore: number;
}

const getUrgencyBadge = (level: string) => {
  switch (level) {
    case 'critical':
      return <Badge variant="destructive" className="animate-pulse">CRITIQUE</Badge>;
    case 'high':
      return <Badge className="bg-orange-500">ÉLEVÉE</Badge>;
    case 'medium':
      return <Badge className="bg-yellow-500">MOYENNE</Badge>;
    default:
      return <Badge className="bg-blue-500">FAIBLE</Badge>;
  }
};

export default function EmergencyResponsePage() {
  const { toast } = useToast();
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [scenarioTypes, setScenarioTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentScenario, setCurrentScenario] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [progress, setProgress] = useState<SessionProgress | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(1200); // 20 minutes
  const [showDebriefing, setShowDebriefing] = useState<boolean>(false);
  const [debriefingHtml, setDebriefingHtml] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startTimeRef = useRef<number>(0);
  
  // Au chargement, récupérer la liste des types de scénarios d'urgence
  useEffect(() => {
    const fetchScenarioTypes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/cyber/emergency/scenarios");
        const data = await response.json();
        
        if (data.success) {
          setScenarioTypes(data.scenarioTypes);
          setCurrentDateTime(data.currentDateTime);
          toast({
            title: "Système d'urgence initialisé",
            description: "Sélectionnez un type d'urgence pour commencer",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de récupérer les scénarios d'urgence",
          });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des scénarios:", error);
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: "Impossible de se connecter au service d'urgence",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchScenarioTypes();
  }, [toast]);
  
  // Démarrer une session d'urgence
  const startEmergencySession = async (emergencyType: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/cyber/emergency/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emergencyType }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSessionId(data.sessionId);
        setCurrentScenario(data.scenario);
        setMessages([data.initialMessage]);
        setProgress({
          currentStage: 1,
          completedObjectives: [],
          performanceScore: 0
        });
        setIsSessionActive(true);
        startTimeRef.current = Date.now();
        
        toast({
          title: "Urgence activée",
          description: `Scénario: ${data.scenario.title}`,
        });
        
        // Focus sur la zone de texte
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        }, 100);
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: data.error || "Impossible de démarrer la session d'urgence",
        });
      }
    } catch (error) {
      console.error("Erreur lors du démarrage de la session:", error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Impossible de démarrer la session d'urgence",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Envoyer un message
  const sendMessage = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!inputMessage.trim() || !sessionId) return;
    
    const messageToSend = inputMessage;
    setInputMessage("");
    
    // Ajouter le message de l'utilisateur
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: messageToSend,
      timestamp: Date.now()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      const response = await fetch("/api/cyber/emergency/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          message: messageToSend
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Ajouter la réponse du PNJ
        setMessages((prev) => [...prev, data.message]);
        
        // Mettre à jour la progression
        if (data.progressUpdate) {
          setProgress(data.progressUpdate);
        }
        
        // Défilement automatique
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        }, 100);
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: data.error || "Impossible de traiter le message",
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Impossible d'envoyer le message",
      });
    } finally {
      setIsTyping(false);
    }
  };
  
  // Effet pour le compte à rebours
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isSessionActive && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSessionActive, remainingTime]);
  
  // Compléter la session et obtenir le débriefing
  const completeSession = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch("/api/cyber/emergency/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          // Ces champs sont optionnels, ils seraient utilisés si l'utilisateur veut recevoir le rapport par email
          userEmail: "",
          userName: ""
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDebriefingHtml(data.debriefingHtml);
        setShowDebriefing(true);
        
        toast({
          title: "Session terminée",
          description: "Débriefing disponible",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: data.error || "Impossible de finaliser la session",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la finalisation de la session:", error);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Impossible de finaliser la session",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Réinitialiser la session
  const resetSession = () => {
    setIsSessionActive(false);
    setSessionId(null);
    setCurrentScenario(null);
    setMessages([]);
    setProgress(null);
    setRemainingTime(1200);
    setSelectedType(null);
    setShowDebriefing(false);
    setDebriefingHtml("");
  };
  
  // Formater le temps restant
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  // Gérer les touches du clavier pour l'envoi de messages
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  return (
    <CyberLayout>
      <PageTitle title="CENTRE D'URGENCE CYBER" />
      
      <div className="mb-4 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 bg-gray-950/80 backdrop-blur-sm py-2 shadow-md">
        <Link href="/cyber" className="inline-flex items-center text-[#46cada] hover:text-blue-600 transition-colors">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Retour à I AM CYBER
        </Link>
        
        {isSessionActive && (
          <div className="flex items-center gap-4">
            {currentScenario && (
              <div className="hidden sm:flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">{currentScenario.title}</span>
                {getUrgencyBadge(currentScenario.urgencyLevel)}
              </div>
            )}
            
            <div className="flex items-center text-white bg-red-600/80 px-3 py-1 rounded-full">
              <Clock className="mr-2 h-4 w-4" />
              <span className="font-mono">{formatTime(remainingTime)}</span>
            </div>
          </div>
        )}
      </div>
      
      {!isSessionActive ? (
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-gradient-to-br from-blue-950 to-indigo-900 text-white border-blue-800 max-w-3xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <CardTitle className="text-2xl">Centre d'Urgence Cyber</CardTitle>
                </div>
                {currentDateTime && (
                  <div className="text-right">
                    <div className="text-xs text-gray-400">HORODATAGE</div>
                    <div className="text-sm font-mono">{currentDateTime}</div>
                  </div>
                )}
              </div>
              <CardDescription className="text-blue-200 mt-2">
                Sélectionnez le type d'urgence cyber que vous souhaitez traiter. Vous devrez prendre des décisions rapides et pertinentes pour résoudre la situation de crise.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                  <div className="col-span-2 py-8 flex justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
                  </div>
                ) : (
                  scenarioTypes.map((type) => (
                    <Card 
                      key={type} 
                      className={`bg-blue-900/40 border-blue-700/50 cursor-pointer transition-all hover:bg-blue-800/40 hover:border-blue-600 ${selectedType === type ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => setSelectedType(type)}
                    >
                      <CardHeader className="py-3 px-4">
                        <CardTitle className="text-base text-white">{type}</CardTitle>
                      </CardHeader>
                    </Card>
                  ))
                )}
              </div>
              
              {selectedType && (
                <div className="mt-6 flex justify-center">
                  <Button 
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-6"
                    onClick={() => startEmergencySession(selectedType)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <AlertTriangle className="mr-2 h-5 w-5" />
                    )}
                    Activer le protocole d'urgence
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between text-xs text-blue-300 border-t border-blue-800/50 pt-4">
              <div>Temps estimé de l'exercice: 20 minutes</div>
              <div>Niveau de difficulté: Adaptable</div>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="h-[calc(100vh-150px)] flex flex-col">
          {/* En-tête du scénario */}
          {currentScenario && (
            <div className="bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border-b border-blue-700/50 px-4 py-3">
              <div className="container mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-red-500" />
                      {currentScenario.title}
                      {getUrgencyBadge(currentScenario.urgencyLevel)}
                    </h2>
                    <p className="text-sm text-blue-200">{currentScenario.description}</p>
                  </div>
                  
                  {progress && (
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-blue-300">Score:</div>
                      <Progress 
                        value={progress.performanceScore} 
                        max={100} 
                        className="w-24 h-2 bg-blue-900/50" 
                      />
                      <div className="text-sm font-mono text-white">{progress.performanceScore}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Zone de chat */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-cyber"
          >
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div 
                  className={`max-w-[80%] md:max-w-[70%] rounded-lg px-4 py-3 ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white'
                      : message.type === 'system'
                        ? 'bg-red-900/80 text-white border border-red-700'
                        : 'bg-slate-800 text-white border border-slate-700'
                  }`}
                >
                  {message.type === 'bot' && message.contactName && (
                    <div className="text-xs text-blue-300 font-semibold mb-1">
                      {message.contactName} {message.contactRole && `— ${message.contactRole}`}
                    </div>
                  )}
                  
                  {message.type === 'system' && (
                    <div className="text-xs text-red-300 font-semibold mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> 
                      Alerte Système
                    </div>
                  )}
                  
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  <div className="text-right mt-1 text-xs opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Zone de saisie */}
          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <form onSubmit={sendMessage} className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tapez votre message..."
                className="flex-1 min-h-[50px] max-h-24 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={remainingTime <= 0}
              />
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!inputMessage.trim() || remainingTime <= 0}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
            
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <div>Shift+Entrée pour nouvelle ligne • Entrée pour envoyer</div>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-auto"
                onClick={completeSession}
              >
                <Timer className="h-3 w-3 mr-1" />
                Terminer la session
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Dialog de débriefing */}
      <Dialog open={showDebriefing} onOpenChange={setShowDebriefing}>
        <DialogContent className="bg-slate-900 text-white border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-center flex items-center justify-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Débriefing de la session d'urgence
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-center">
              Analyse de vos actions et recommandations pour améliorer votre réponse aux incidents.
            </DialogDescription>
          </DialogHeader>
          
          <div 
            className="mt-4 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: debriefingHtml }}
          />
          
          <div className="mt-6 flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={resetSession}
              className="border-blue-700 text-blue-400 hover:bg-blue-900/30"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Nouvelle session
            </Button>
            
            <Link href="/cyber">
              <Button className="bg-slate-800 hover:bg-slate-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à I AM CYBER
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </CyberLayout>
  );
}