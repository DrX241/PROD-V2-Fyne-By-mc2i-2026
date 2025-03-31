import React, { useState, useEffect, useRef } from "react";
import { 
  Clock, AlertTriangle, BarChart, Users, CheckCircle, 
  ChevronRight, Lightbulb, BadgeAlert, ArrowLeft, Layers,
  Mail, MessageSquare, Video, Radio, Camera, PieChart, Building,
  DollarSign, Shield, User, Play, Pause, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useChatContext } from "@/contexts/ChatContext";
import { Link } from "wouter";
import CyberLayout from "@/components/layout/CyberLayout";
import { CrisisInfo, ChatMessage, MessageType } from "../../../shared/schema";

// Composant pour le chronomètre
const CrisisTimer: React.FC<{ elapsed: string; pressureLevel: string }> = ({ elapsed, pressureLevel }) => {
  const pressureColors: Record<string, string> = {
    low: "text-green-500",
    medium: "text-amber-500",
    high: "text-orange-500",
    critical: "text-red-500",
  };

  return (
    <Card className="bg-slate-800 text-white shadow-md border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Chronomètre de crise
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-mono font-bold text-center my-2">
          {elapsed || "00:00:00"}
        </div>
        <div className={`text-sm font-medium text-center ${pressureColors[pressureLevel] || "text-green-500"}`}>
          Niveau de pression: {pressureLevel === "low" ? "Faible" : 
                                pressureLevel === "medium" ? "Moyen" : 
                                pressureLevel === "high" ? "Élevé" : "Critique"}
        </div>
        {pressureLevel === "high" || pressureLevel === "critical" ? (
          <div className="mt-2 text-xs text-red-400 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Action rapide requise
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

// Composant pour le statut des médias
const MediaStatus: React.FC<{ tone: string; perception: number; pendingRequests: string[] }> = ({ 
  tone, perception, pendingRequests 
}) => {
  const getToneLabel = (t: string) => {
    switch (t) {
      case "neutral": return "Neutre";
      case "concerned": return "Préoccupé";
      case "critical": return "Critique";
      case "hostile": return "Hostile";
      default: return "Inconnu";
    }
  };

  const getToneColor = (t: string) => {
    switch (t) {
      case "neutral": return "bg-blue-500";
      case "concerned": return "bg-amber-500";
      case "critical": return "bg-orange-500";
      case "hostile": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Card className="bg-slate-800 text-white shadow-md border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <BarChart className="w-5 h-5 mr-2" />
          Statut médiatique
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-2">
          <div className={`h-3 w-3 rounded-full ${getToneColor(tone)} mr-2`}></div>
          <div className="text-sm">Ton actuel: <span className="font-medium">{getToneLabel(tone)}</span></div>
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between mb-1 text-xs">
            <span>Perception publique</span>
            <span>{perception}%</span>
          </div>
          <Progress value={perception} className="h-2" />
        </div>
        
        {pendingRequests && pendingRequests.length > 0 ? (
          <div className="mt-3">
            <div className="text-xs font-medium mb-1">Demandes de presse en attente:</div>
            <ul className="text-xs space-y-1">
              {pendingRequests.map((req, idx) => (
                <li key={idx} className="flex items-center">
                  <BadgeAlert className="w-3 h-3 mr-1 text-amber-400" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

// Composant pour le statut des équipes
const TeamStatus: React.FC<{ stressLevel: string; experts: string[]; needsRotation: boolean }> = ({ 
  stressLevel, experts, needsRotation 
}) => {
  const getStressColor = (level: string) => {
    switch (level) {
      case "normal": return "bg-green-500";
      case "elevated": return "bg-amber-500";
      case "high": return "bg-orange-500";
      case "burnout": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStressLabel = (level: string) => {
    switch (level) {
      case "normal": return "Normal";
      case "elevated": return "Élevé";
      case "high": return "Très élevé";
      case "burnout": return "Burnout imminent";
      default: return "Inconnu";
    }
  };

  return (
    <Card className="bg-slate-800 text-white shadow-md border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Users className="w-5 h-5 mr-2" />
          État des équipes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-3">
          <div className={`h-3 w-3 rounded-full ${getStressColor(stressLevel)} mr-2`}></div>
          <div className="text-sm">Niveau de stress: <span className="font-medium">{getStressLabel(stressLevel)}</span></div>
        </div>
        
        {needsRotation && (
          <div className="mb-3 text-xs flex items-center text-amber-400">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Rotation d'équipe recommandée
          </div>
        )}
        
        {experts && experts.length > 0 ? (
          <div>
            <div className="text-xs font-medium mb-1">Experts disponibles:</div>
            <div className="flex flex-wrap gap-1">
              {experts.map((expert, idx) => (
                <span key={idx} className="text-xs bg-slate-700 px-2 py-1 rounded-full">
                  {expert}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400">Aucun expert disponible actuellement</div>
        )}
      </CardContent>
    </Card>
  );
};

// Composant pour les phases de crise
const CrisisPhases: React.FC<{ activePhase: string }> = ({ activePhase }) => {
  const phases = [
    { id: "detection", label: "Détection" },
    { id: "analyse", label: "Analyse" },
    { id: "confinement", label: "Confinement" },
    { id: "eradication", label: "Éradication" },
    { id: "retablissement", label: "Rétablissement" },
    { id: "retour", label: "Retour d'expérience" }
  ];

  return (
    <Card className="bg-slate-800 text-white shadow-md border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Layers className="w-5 h-5 mr-2" />
          Phases de crise
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute h-full w-0.5 bg-slate-600 left-1.5 top-0 z-0"></div>
          {phases.map((phase) => (
            <div key={phase.id} className="relative z-10 flex items-center mb-3 last:mb-0">
              <div 
                className={`h-3 w-3 rounded-full mr-3 ${
                  phase.id === activePhase 
                    ? "bg-blue-500 ring-2 ring-blue-300 ring-opacity-50" 
                    : phases.indexOf(phases.find(p => p.id === activePhase)!) > phases.indexOf(phase)
                      ? "bg-green-500"
                      : "bg-slate-600"
                }`}
              ></div>
              <div className={`text-sm ${phase.id === activePhase ? "font-medium text-white" : "text-slate-400"}`}>
                {phase.label}
                {phase.id === activePhase && (
                  <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full">
                    En cours
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Types d'entreprises pour les scénarios
const companyTypes = [
  { id: "banking", name: "Banque & Finance" },
  { id: "healthcare", name: "Santé" },
  { id: "retail", name: "Commerce de détail" },
  { id: "manufacturing", name: "Industrie" },
  { id: "energy", name: "Énergie" },
  { id: "transportation", name: "Transport & Logistique" },
  { id: "telecom", name: "Télécommunications" },
  { id: "government", name: "Secteur public" }
];

// Scénarios de crise prédéfinis
const crisisScenarios = [
  {
    id: "ransomware",
    title: "Attaque par ransomware",
    description: "Une attaque par ransomware a chiffré des systèmes critiques et exige une rançon.",
    difficulty: "Intermédiaire",
    difficultyColor: "text-amber-500",
    timeEstimate: "45-60 min"
  },
  {
    id: "data-breach",
    title: "Fuite de données",
    description: "Une fuite majeure de données clients a été détectée et pourrait bientôt être rendue publique.",
    difficulty: "Expert",
    difficultyColor: "text-red-500",
    timeEstimate: "60-75 min"
  },
  {
    id: "supply-chain",
    title: "Compromission de la chaîne d'approvisionnement",
    description: "Un fournisseur critique a été compromis, affectant potentiellement vos systèmes.",
    difficulty: "Expert",
    difficultyColor: "text-red-500",
    timeEstimate: "60-90 min"
  },
  {
    id: "insider-threat",
    title: "Menace interne",
    description: "Un employé malveillant a potentiellement exfiltré des données sensibles.",
    difficulty: "Intermédiaire",
    difficultyColor: "text-amber-500",
    timeEstimate: "45-60 min"
  },
  {
    id: "ddos-attack",
    title: "Attaque DDoS",
    description: "Une attaque par déni de service distribué affecte la disponibilité de vos services critiques.",
    difficulty: "Débutant",
    difficultyColor: "text-green-500",
    timeEstimate: "30-45 min"
  }
];

// Interface principale de la page
export default function ArcadeCrise() {
  const { messages, sendMessage } = useChatContext();
  const [selectedScenario, setSelectedScenario] = useState<string | null>("ransomware");
  const [selectedCompanyType, setSelectedCompanyType] = useState("banking");
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // État des médias pour les demandes d'interview
  const [mediaRequests, setMediaRequests] = useState([
    {
      id: "tv-interview",
      type: "TV",
      source: "France Info",
      title: "Interview en direct",
      description: "Demande d'interview en direct concernant l'incident de sécurité",
      status: "pending",
      icon: <Video className="h-5 w-5" />,
      deadline: "15 minutes",
      impact: "Fort impact médiatique"
    },
    {
      id: "newspaper-comment",
      type: "Presse",
      source: "Le Monde",
      title: "Commentaire pour article",
      description: "Sollicitation de commentaires officiels pour un article à paraître demain",
      status: "pending",
      icon: <Mail className="h-5 w-5" />,
      deadline: "2 heures",
      impact: "Influence l'opinion publique"
    }
  ]);
  
  // État des PNJ pour les interactions
  const [stakeholders, setStakeholders] = useState([
    {
      id: "ceo",
      name: "Jean Martin",
      role: "PDG",
      avatar: "JM",
      priority: "high",
      concern: "Impact sur la réputation de l'entreprise",
      message: "J'ai besoin d'un point de situation immédiat. Le conseil d'administration s'inquiète.",
      status: "waiting",
      budget: 100,
      trust: 75
    },
    {
      id: "ciso",
      name: "Marie Dubois",
      role: "RSSI",
      avatar: "MD",
      priority: "high",
      concern: "Mesures techniques à déployer",
      message: "Nous avons besoin de ressources supplémentaires pour contenir la menace.",
      status: "available",
      budget: 100,
      trust: 90
    },
    {
      id: "comms",
      name: "Thomas Lefebvre",
      role: "Dir. Communication",
      avatar: "TL",
      priority: "medium",
      concern: "Stratégie de communication externe",
      message: "Les médias me harcèlent. Quelle est notre ligne officielle?",
      status: "available",
      budget: 100,
      trust: 85
    }
  ]);
  
  // Gestion des dialogues
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [dialogContent, setDialogContent] = useState<any>(null);
  const [userResponse, setUserResponse] = useState("");
  
  // État de la crise simulée
  const [crisisInfo, setCrisisInfo] = useState<CrisisInfo>({
    timeInfo: {
      elapsedTime: "00:00:00",
      deadlines: ["Communiqué de presse (30 min)", "Brief direction (15 min)"],
      pressureLevel: "medium"
    },
    mediaInfo: {
      currentTone: "concerned",
      publicPerception: 60,
      pendingRequests: ["France Info: Interview en direct", "Le Monde: Commentaire pour article"]
    },
    teamInfo: {
      stressLevel: "elevated",
      availableExperts: ["RSSI", "Expert forensique", "Communication de crise"],
      teamRotation: false
    },
    activePhase: "analyse"
  });

  // Récupérer les messages de la simulation actuelle
  const simulationMessages = messages.filter(
    (msg: ChatMessage) => msg.type === "email" || msg.type === "user" || msg.type === "bot"
  );

  const startSimulation = async () => {
    if (!selectedCompanyType || !selectedScenario) return;
    
    setIsSimulationActive(true);
    
    // Envoyer un message pour démarrer la simulation
    const scenario = crisisScenarios.find(s => s.id === selectedScenario);
    const company = companyTypes.find(c => c.id === selectedCompanyType);
    
    await sendMessage(`Démarrer une simulation de crise: ${scenario?.title} dans le secteur ${company?.name}. Utiliser le contexte de crise pour suivre la progression.`);
  };

  const resetSimulation = () => {
    setIsSimulationActive(false);
    setSelectedScenario(null);
    // Réinitialiser l'état de crise
    setCrisisInfo({
      timeInfo: {
        elapsedTime: "00:00:00",
        deadlines: [],
        pressureLevel: "low"
      },
      mediaInfo: {
        currentTone: "neutral",
        publicPerception: 80,
        pendingRequests: []
      },
      teamInfo: {
        stressLevel: "normal",
        availableExperts: [],
        teamRotation: false
      },
      activePhase: "detection"
    });
  };

  // Extraire les infos de crise des messages si disponibles
  useEffect(() => {
    // Chercher les informations de crise dans les messages email
    const emailMessages = messages.filter(msg => msg.type === "email") as ChatMessage[];
    
    // Trouver le dernier message email avec des infos de crise
    for (let i = emailMessages.length - 1; i >= 0; i--) {
      const msg = emailMessages[i];
      if (msg.type === "email" && typeof msg.content !== "string") {
        const emailContent = msg.content;
        if (emailContent.crisisInfo) {
          setCrisisInfo(emailContent.crisisInfo);
          break;
        }
      }
    }
  }, [messages]);

  return (
    <CyberLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link href="/cyber" className="text-blue-600 hover:text-blue-800 flex items-center mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour aux modules cyber
          </Link>
          <h1 className="text-3xl font-bold mb-2">Arcade Crise</h1>
          <p className="text-gray-600 mb-4">
            Testez vos compétences en gestion de crise avec ces scénarios chronométrés dans des contextes réalistes.
          </p>
          
          <div className="flex items-center bg-amber-50 border border-amber-200 p-3 rounded-md text-amber-800 mb-6">
            <Lightbulb className="w-5 h-5 mr-2 text-amber-600" />
            <p className="text-sm">
              Ces simulations vous permettent de vous entraîner à la gestion de crise avec des contraintes de temps réelles. 
              Suivez les indicateurs de crise et adaptez votre stratégie en fonction de l'évolution de la situation.
            </p>
          </div>
        </div>

        {!isSimulationActive ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">1. Choisissez votre secteur d'activité</h2>
              <div className="mb-6">
                <Select onValueChange={setSelectedCompanyType} value={selectedCompanyType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {companyTypes.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <h2 className="text-xl font-semibold mb-4">2. Choisissez un scénario</h2>
              <div className="space-y-3">
                {crisisScenarios.map((scenario) => (
                  <Card 
                    key={scenario.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedScenario === scenario.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedScenario(scenario.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{scenario.title}</CardTitle>
                        <span className={`text-xs font-medium ${scenario.difficultyColor}`}>
                          {scenario.difficulty}
                        </span>
                      </div>
                      <CardDescription>{scenario.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-0 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Durée estimée: {scenario.timeEstimate}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h2 className="text-xl font-semibold mb-4">Aperçu de la simulation</h2>
              {selectedCompanyType && selectedScenario ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">
                      {crisisScenarios.find(s => s.id === selectedScenario)?.title}
                    </h3>
                    <p className="text-slate-600 mb-4">
                      Secteur: {companyTypes.find(c => c.id === selectedCompanyType)?.name}
                    </p>
                    <div className="text-sm text-slate-600">
                      <p className="mb-2">
                        Vous allez participer à une simulation de crise en temps réel où vous devrez:
                      </p>
                      <ul className="list-disc list-inside space-y-1 mb-4">
                        <li>Coordonner la réponse à l'incident</li>
                        <li>Gérer la communication interne et externe</li>
                        <li>Prendre des décisions sous pression temporelle</li>
                        <li>Adapter votre stratégie en fonction de l'évolution de la situation</li>
                        <li>Documenter les actions entreprises</li>
                      </ul>
                    </div>
                  </div>
                  <Button 
                    onClick={startSimulation}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Lancer la simulation
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <AlertTriangle className="h-12 w-12 mb-4 opacity-30" />
                  <p className="text-center">
                    Veuillez sélectionner un secteur d'activité et un scénario pour continuer
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-between items-center mb-4">
                <TabsList className="grid grid-cols-2 w-[400px]">
                  <TabsTrigger value="overview">Tableau de bord</TabsTrigger>
                  <TabsTrigger value="chat">Communication ({simulationMessages.length})</TabsTrigger>
                </TabsList>
                <Button variant="outline" onClick={resetSimulation} className="text-red-600 hover:bg-red-50">
                  Réinitialiser la simulation
                </Button>
              </div>

              <TabsContent value="overview" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {crisisInfo.timeInfo && (
                    <CrisisTimer 
                      elapsed={crisisInfo.timeInfo.elapsedTime || "00:00:00"} 
                      pressureLevel={crisisInfo.timeInfo.pressureLevel || "low"} 
                    />
                  )}
                  
                  {crisisInfo.mediaInfo && (
                    <MediaStatus 
                      tone={crisisInfo.mediaInfo.currentTone || "neutral"} 
                      perception={crisisInfo.mediaInfo.publicPerception || 80} 
                      pendingRequests={crisisInfo.mediaInfo.pendingRequests || []} 
                    />
                  )}
                  
                  {crisisInfo.teamInfo && (
                    <TeamStatus 
                      stressLevel={crisisInfo.teamInfo.stressLevel || "normal"} 
                      experts={crisisInfo.teamInfo.availableExperts || []} 
                      needsRotation={crisisInfo.teamInfo.teamRotation || false} 
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    {crisisInfo.activePhase && (
                      <CrisisPhases activePhase={crisisInfo.activePhase} />
                    )}
                  </div>
                  
                  <div className="md:col-span-3">
                    <Card>
                      <CardHeader>
                        <CardTitle>Journal de crise</CardTitle>
                        <CardDescription>
                          Historique des événements et actions entreprises
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {simulationMessages.length > 0 ? (
                            simulationMessages.map((msg, idx) => (
                              <div key={idx} className="border-b pb-3 last:border-0">
                                <div className="flex justify-between text-sm text-gray-500 mb-1">
                                  <span className="font-medium">
                                    {msg.type === "user" ? "Vous" : 
                                      msg.type === "bot" ? (msg.contactName || "Intervenant") : 
                                      msg.type === "email" && typeof msg.content !== "string" ? msg.content.from.name : 
                                      "Système"}
                                  </span>
                                  <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-gray-700">
                                  {typeof msg.content === "string" 
                                    ? msg.content 
                                    : `Email: ${msg.content.subject}`}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-gray-500">
                              Aucune action enregistrée. Commencez à interagir avec la simulation.
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="chat" className="mt-0">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Communication en cours</h2>
                  <p className="text-gray-600 mb-6">
                    Utilisez l'interface de chat I AM CYBER standard pour communiquer avec les acteurs de la crise.
                    Les mises à jour du tableau de bord se feront automatiquement en fonction de vos actions.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-800 mb-6">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 mr-2 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium mb-1">La simulation est active</p>
                        <p className="text-sm">
                          Le module I AM CYBER standard est maintenant configuré en mode crise. 
                          Toute votre interaction se fera via l'interface habituelle, mais avec le contexte de crise activé.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-6 bg-slate-50">
                    <p className="text-center text-gray-500 mb-4">
                      Basculez vers l'onglet "Tableau de bord" pour voir les indicateurs de crise en temps réel.
                    </p>
                    <div className="flex justify-center">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("overview")}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        Voir le tableau de bord
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </CyberLayout>
  );
}