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
  ArrowRight,
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

// Interface pour les scénarios disponibles
interface ScenarioItem {
  id: string;
  title: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  expertise: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

// Type pour les catégories de scénarios
type ScenarioCategoryMap = {
  [key in EmergencyType]: ScenarioItem[];
} & { [key: string]: ScenarioItem[] };

// Interface pour le scénario courant
interface CyberScenario {
  id: string;
  title: string;
  description: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  context: string;
  objectives: string[];
  npcs: {
    id: string;
    name: string;
    role: string;
    personality: string;
    expertise: string[];
  }[];
  initialPrompt: string;
  type: string;
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

// Formater le temps pour affichage (format mm:ss)
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function EmergencyResponsePage() {
  const { toast } = useToast();
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [scenarioTypes, setScenarioTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentScenario, setCurrentScenario] = useState<CyberScenario | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [progress, setProgress] = useState<SessionProgress | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(1200); // 20 minutes
  const [showDebriefing, setShowDebriefing] = useState<boolean>(false);
  const [debriefingHtml, setDebriefingHtml] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  // Gérer les touches (Shift+Entrée pour ajouter une nouvelle ligne, Entrée pour envoyer)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startTimeRef = useRef<number>(0);
  
  // Définir les badges pour les différents niveaux d'urgence
  const urgencyBadges = {
    low: { color: 'bg-blue-500', label: 'FAIBLE' },
    medium: { color: 'bg-yellow-500', label: 'MOYENNE' },
    high: { color: 'bg-orange-500', label: 'ÉLEVÉE' },
    critical: { color: 'bg-red-500 animate-pulse', label: 'CRITIQUE' }
  };

  // Définir les badges d'expertise
  const expertiseBadges = {
    beginner: { color: 'bg-green-500', label: 'DÉBUTANT' },
    intermediate: { color: 'bg-blue-500', label: 'INTERMÉDIAIRE' },
    advanced: { color: 'bg-purple-500', label: 'AVANCÉ' },
    expert: { color: 'bg-red-500', label: 'EXPERT' }
  };

  // Données fictives pour les scénarios disponibles par catégorie
  const scenariosByCategory: ScenarioCategoryMap = {
    [EmergencyType.FORMATION]: [
      { id: 'phishing-formation-1', title: 'Campagne de phishing ciblée', urgency: 'medium', expertise: 'intermediate' },
      { id: 'formation-securite-1', title: 'Programme de sensibilisation urgent', urgency: 'low', expertise: 'beginner' },
      { id: 'formation-direction-1', title: 'Briefing direction générale', urgency: 'high', expertise: 'advanced' }
    ],
    [EmergencyType.CRISE]: [
      { id: 'ransomware-sante-1', title: 'Attaque ransomware - Secteur Santé', urgency: 'critical', expertise: 'expert' },
      { id: 'ddos-services-1', title: 'Attaque DDoS massive', urgency: 'high', expertise: 'advanced' },
      { id: 'crise-supply-chain-1', title: 'Compromission chaîne logistique', urgency: 'high', expertise: 'expert' }
    ],
    [EmergencyType.DONNEES]: [
      { id: 'fuite-donnees-1', title: 'Fuite massive de données personnelles', urgency: 'high', expertise: 'advanced' },
      { id: 'vol-propriete-1', title: 'Vol de propriété intellectuelle', urgency: 'medium', expertise: 'intermediate' },
      { id: 'incident-rgpd-1', title: 'Incident RGPD majeur', urgency: 'high', expertise: 'advanced' }
    ],
    [EmergencyType.VULNERABILITES]: [
      { id: 'zero-day-1', title: 'Exploitation de vulnérabilité 0-day', urgency: 'critical', expertise: 'expert' },
      { id: 'patch-critique-1', title: 'Déploiement de patch critique', urgency: 'high', expertise: 'intermediate' },
      { id: 'scan-infrastructure-1', title: 'Analyse de vulnérabilités post-incident', urgency: 'medium', expertise: 'intermediate' }
    ],
    [EmergencyType.OSINT]: [
      { id: 'fuite-information-1', title: 'Fuites d\'informations stratégiques', urgency: 'medium', expertise: 'intermediate' },
      { id: 'usurpation-identite-1', title: 'Usurpation d\'identité corporate', urgency: 'medium', expertise: 'intermediate' },
      { id: 'exposition-donnees-1', title: 'Exposition de données confidentielles', urgency: 'high', expertise: 'advanced' }
    ],
    [EmergencyType.CONFORMITE]: [
      { id: 'audit-surprise-1', title: 'Audit de conformité surprise', urgency: 'medium', expertise: 'intermediate' },
      { id: 'mise-demeure-1', title: 'Mise en demeure réglementaire', urgency: 'high', expertise: 'advanced' },
      { id: 'non-conformite-1', title: 'Non-conformité critique', urgency: 'high', expertise: 'advanced' }
    ],
    [EmergencyType.STRATEGIE]: [
      { id: 'elevation-menace-1', title: 'Élévation niveau de menace', urgency: 'medium', expertise: 'advanced' },
      { id: 'nouvelle-reglementation-1', title: 'Nouvelle réglementation urgente', urgency: 'medium', expertise: 'intermediate' },
      { id: 'securisation-acquisition-1', title: 'Sécurisation d\'acquisition', urgency: 'high', expertise: 'expert' }
    ],
    [EmergencyType.SUPPLY_CHAIN]: [
      { id: 'fournisseur-compromis-1', title: 'Fournisseur critique compromis', urgency: 'high', expertise: 'advanced' },
      { id: 'software-malveillant-1', title: 'Logiciel malveillant dans la chaîne', urgency: 'critical', expertise: 'expert' },
      { id: 'audit-fournisseurs-1', title: 'Audit de fournisseurs d\'urgence', urgency: 'medium', expertise: 'intermediate' }
    ],
    [EmergencyType.IAM]: [
      { id: 'compromission-admin-1', title: 'Compromission compte admin', urgency: 'critical', expertise: 'expert' },
      { id: 'vol-identifiants-1', title: 'Vol d\'identifiants massif', urgency: 'high', expertise: 'advanced' },
      { id: 'gestion-acces-urgence-1', title: 'Gestion d\'accès d\'urgence', urgency: 'medium', expertise: 'intermediate' }
    ],
    [EmergencyType.CLOUD]: [
      { id: 'compromission-cloud-1', title: 'Compromission environnement cloud', urgency: 'high', expertise: 'advanced' },
      { id: 'fuite-bucket-1', title: 'Fuite d\'accès bucket S3', urgency: 'high', expertise: 'intermediate' },
      { id: 'shadow-it-critique-1', title: 'Shadow IT critique', urgency: 'medium', expertise: 'intermediate' }
    ],
    [EmergencyType.INCIDENTS]: [
      { id: 'incident-major-1', title: 'Incident de sécurité majeur', urgency: 'critical', expertise: 'expert' },
      { id: 'malware-interne-1', title: 'Propagation malware interne', urgency: 'high', expertise: 'advanced' },
      { id: 'attaque-ciblee-1', title: 'Attaque ciblée persistante', urgency: 'high', expertise: 'expert' }
    ],
    [EmergencyType.FORENSICS]: [
      { id: 'analyse-post-incident-1', title: 'Analyse post-incident critique', urgency: 'medium', expertise: 'advanced' },
      { id: 'extraction-logs-1', title: 'Extraction et analyse de logs', urgency: 'medium', expertise: 'intermediate' },
      { id: 'investigation-numerique-1', title: 'Investigation numérique complexe', urgency: 'high', expertise: 'expert' }
    ]
  };

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
            title: "Centre d'urgence activé",
            description: "Tous les modules sont disponibles et prêts à l'emploi",
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
          <Card className="bg-gradient-to-br from-blue-950 to-indigo-900 text-white border-blue-800 max-w-6xl mx-auto">
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
                Sélectionnez un scénario d'urgence cyber pour commencer la simulation. Vous devrez prendre des décisions rapides et pertinentes pour résoudre la situation de crise. Des interlocuteurs experts vous guideront tout au long de l'exercice.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 flex justify-center">
                  <RefreshCw className="h-12 w-12 animate-spin text-blue-400" />
                </div>
              ) : (
                <>
                  {/* Filtres de recherche */}
                  <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <div className="space-x-2">
                      <span className="text-sm text-blue-300">Filtrer par niveau d'urgence:</span>
                      {Object.entries(urgencyBadges).map(([key, value]) => (
                        <Badge key={key} className={`${value.color} hover:opacity-80 cursor-pointer`}>
                          {value.label}
                        </Badge>
                      ))}
                    </div>
                    <div className="space-x-2">
                      <span className="text-sm text-blue-300">Filtrer par niveau d'expertise:</span>
                      {Object.entries(expertiseBadges).map(([key, value]) => (
                        <Badge key={key} className={`${value.color} hover:opacity-80 cursor-pointer`}>
                          {value.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Tabs de catégories */}
                  <div className="border-b border-gray-700 mb-6">
                    <div className="flex flex-wrap gap-2">
                      {scenarioTypes.map((type) => (
                        <button
                          key={type}
                          className={`px-4 py-2 text-sm rounded-t-lg transition-colors ${
                            selectedType === type
                              ? "bg-blue-700 text-white"
                              : "bg-blue-900/40 text-blue-300 hover:bg-blue-800/60 hover:text-white"
                          }`}
                          onClick={() => setSelectedType(type)}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Liste des scénarios disponibles */}
                  {selectedType && scenariosByCategory[selectedType as keyof typeof scenariosByCategory] && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">
                        Scénarios de {selectedType}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {scenariosByCategory[selectedType as keyof typeof scenariosByCategory].map((scenario: ScenarioItem) => (
                          <Card 
                            key={scenario.id} 
                            className="bg-blue-900/40 border-blue-700/50 cursor-pointer transition-all hover:bg-blue-800/40 hover:border-blue-600 hover:shadow-lg hover:translate-y-[-2px]"
                            onClick={() => {
                              setSelectedType(selectedType);
                              startEmergencySession(selectedType);
                            }}
                          >
                            <CardHeader className="py-3 px-4">
                              <div className="flex gap-2 mb-2">
                                <Badge className={urgencyBadges[scenario.urgency as keyof typeof urgencyBadges].color}>
                                  {urgencyBadges[scenario.urgency as keyof typeof urgencyBadges].label}
                                </Badge>
                                <Badge className={expertiseBadges[scenario.expertise as keyof typeof expertiseBadges].color}>
                                  {expertiseBadges[scenario.expertise as keyof typeof expertiseBadges].label}
                                </Badge>
                              </div>
                              <CardTitle className="text-base text-white">{scenario.title}</CardTitle>
                            </CardHeader>
                            <CardFooter className="pt-0 pb-3 px-4 flex justify-between items-center">
                              <div className="text-xs text-blue-300">Durée: 20 minutes</div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-300 hover:text-white hover:bg-blue-700"
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center text-xs text-blue-300 border-t border-blue-800/50 pt-4">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-blue-400" />
                <span>Temps estimé par session: 20 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" />
                <span>Débriefing complet à la fin de chaque session</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="h-[calc(100vh-150px)] flex flex-col">
          {/* En-tête du scénario avec plus d'informations et de badges */}
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
                    
                    {/* Objectifs de la mission */}
                    {progress && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {currentScenario.objectives.map((objective: string, index: number) => (
                          <Badge 
                            key={index} 
                            className={`${
                              progress.completedObjectives.includes(objective) 
                                ? 'bg-green-500 text-white' 
                                : 'bg-blue-900/70 text-gray-300'
                            }`}
                          >
                            {progress.completedObjectives.includes(objective) && (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            )}
                            {objective}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Statistiques de progression interactive */}
                  {progress && (
                    <div className="flex flex-col items-end gap-2 min-w-[160px]">
                      <div className="flex items-center justify-between w-full">
                        <div className="text-xs text-blue-300">Score:</div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={progress.performanceScore} 
                            max={100} 
                            className="w-24 h-2 bg-blue-900/50" 
                          />
                          <div className="text-sm font-mono text-white">{progress.performanceScore}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-blue-300">Temps:</div>
                        <div className="flex items-center gap-1 text-amber-400 font-mono">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(remainingTime)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-blue-300">Phase:</div>
                        <Badge className="bg-purple-600">
                          {progress.currentStage === 1 ? "Analyse" : 
                           progress.currentStage === 2 ? "Action" : "Résolution"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Zone de chat avec avatars et design amélioré */}
          <div className="grid grid-cols-12 h-full">
            {/* Partie gauche avec liste des interlocuteurs */}
            <div className="col-span-3 md:col-span-2 bg-slate-900 border-r border-slate-800 overflow-y-auto">
              <div className="p-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Interlocuteurs</h3>
                
                {currentScenario && currentScenario.npcs && (
                  <div className="space-y-3">
                    {currentScenario.npcs.map((npc: any) => (
                      <div key={npc.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-900/30 cursor-pointer transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-semibold">
                          {npc.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-sm text-white font-medium truncate">{npc.name}</div>
                          <div className="text-xs text-slate-400 truncate">{npc.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Expertise</h3>
                  
                  {currentScenario && currentScenario.npcs && (
                    <div className="space-y-1">
                      {/* Agrégation des compétences de tous les interlocuteurs */}
                      {Array.from(
                        new Set(
                          currentScenario.npcs.flatMap((npc: { expertise: string[] }) => npc.expertise)
                        ) as Set<string>
                      ).map((expertise: string, index: number) => (
                        <Badge key={index} variant="outline" className="mr-1 mb-1 bg-slate-800 text-xs border-slate-700 text-slate-300">
                          {expertise}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Partie droite avec le chat */}
            <div className="col-span-9 md:col-span-10 flex flex-col h-full">
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-cyber"
              >
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn transition-all duration-300 hover:scale-[1.01]`}
                  >
                    {message.type !== 'user' && message.contactName && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-semibold mr-2 mt-2">
                        {message.contactName.charAt(0)}
                      </div>
                    )}
                    
                    <div 
                      className={`max-w-[80%] md:max-w-[70%] rounded-lg px-4 py-3 shadow-md ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white'
                          : message.type === 'system'
                            ? 'bg-red-900/80 text-white border border-red-700'
                            : 'bg-slate-800 text-white border border-slate-700'
                      }`}
                    >
                      {message.type === 'bot' && message.contactName && (
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-blue-300 font-semibold mb-1">
                            {message.contactName} 
                            {message.contactRole && (
                              <span className="text-slate-400"> — {message.contactRole}</span>
                            )}
                          </div>
                          
                          {/* Icône de niveau d'expertise */}
                          <Badge className="bg-indigo-800 text-xs">Expert</Badge>
                        </div>
                      )}
                      
                      {message.type === 'system' && (
                        <div className="text-xs text-red-300 font-semibold mb-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> 
                          Alerte Système
                        </div>
                      )}
                      
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      <div className="flex justify-between mt-2 text-xs opacity-70">
                        <div>
                          {message.type === 'bot' && (
                            <div className="flex gap-1">
                              {/* Tags reliés au message - exemple */}
                              {Math.random() > 0.5 && (
                                <Badge variant="outline" className="text-[10px] bg-transparent border-blue-600/30 text-blue-400">
                                  #Conseil
                                </Badge>
                              )}
                              {Math.random() > 0.7 && (
                                <Badge variant="outline" className="text-[10px] bg-transparent border-green-600/30 text-green-400">
                                  #BonnePratique
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    {message.type === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-teal-700 flex items-center justify-center text-white font-semibold ml-2 mt-2">
                        V
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start animate-fadeIn">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-semibold mr-2"></div>
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
              
              {/* Suggestions et zone de saisie */}
              <div className="p-4 bg-slate-900 border-t border-slate-800">
                {/* Suggestions rapides */}
                <div className="mb-3 flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-blue-900/30 border-blue-800 text-blue-300 hover:bg-blue-800/50 hover:text-white"
                    onClick={() => {
                      setInputMessage("Quelles sont les prochaines étapes à suivre ?");
                      setTimeout(() => sendMessage(), 100);
                    }}
                  >
                    Prochaines étapes ?
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-blue-900/30 border-blue-800 text-blue-300 hover:bg-blue-800/50 hover:text-white"
                    onClick={() => {
                      setInputMessage("Pouvez-vous résumer la situation actuelle ?");
                      setTimeout(() => sendMessage(), 100);
                    }}
                  >
                    Résumer la situation
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-blue-900/30 border-blue-800 text-blue-300 hover:bg-blue-800/50 hover:text-white"
                    onClick={() => {
                      setInputMessage("Quels sont les risques principaux ?");
                      setTimeout(() => sendMessage(), 100);
                    }}
                  >
                    Risques principaux
                  </Button>
                </div>
                
                <form onSubmit={sendMessage} className="flex gap-2">
                  <textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Tapez votre message ou sélectionnez une suggestion..."
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