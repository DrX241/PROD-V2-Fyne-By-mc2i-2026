import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, AlertTriangle, Lock, Clock, Shield, ChevronRight, Info, 
  AlertOctagon, Users, Activity, Banknote, Scale, ShieldAlert
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import HomeLayout from "@/components/layout/HomeLayout";
import PageTitle from "@/components/utils/PageTitle";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Scenario {
  id: string;
  title: string;
  description: string;
  situation: string;
  timeline: {
    time: string;
    event: string;
  }[];
  decisions: Decision[];
  currentDecisionIndex: number;
  impactAreas: {
    reputation: number;
    operations: number;
    financial: number;
    legal: number;
  };
  severity: "critical" | "high" | "medium" | "low";
  timeRemaining: number;
}

interface Decision {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    consequences: {
      description: string;
      impactChanges: {
        reputation: number;
        operations: number;
        financial: number;
        legal: number;
      };
    };
  }[];
  selectedOption?: string;
}

export default function CrisisManagementPage() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Échantillon de scénario de crise (ransomware)
  const sampleScenario: Scenario = {
    id: uuidv4(),
    title: "Crise Ransomware - Attaque majeure",
    description: "Votre entreprise est victime d'une attaque par ransomware. En tant que RSSI, vous devez gérer la crise et minimiser les impacts.",
    situation: `Il est 7h30 du matin lorsque vous recevez un appel d'urgence du responsable des opérations IT. 
    
Un message de rançon est apparu sur plusieurs serveurs critiques et des postes de travail dans toute l'entreprise. Les fichiers semblent être chiffrés et inaccessibles.

L'équipe technique confirme une propagation rapide du ransomware. Plusieurs systèmes sont déjà hors service, dont le système de gestion des commandes clients et la base de données produits. 

La demande de rançon s'élève à 500 000 € en Bitcoin, avec une menace de publication des données exfiltrées et une augmentation du montant après 48 heures.`,
    timeline: [
      { time: "7h30", event: "Détection initiale de l'incident" },
      { time: "7h45", event: "Premier rapport technique confirmant le ransomware" },
      { time: "8h00", event: "Réunion de crise initiale" },
      { time: "8h15", event: "Évaluation préliminaire de l'impact" }
    ],
    decisions: [
      {
        id: "decision1",
        question: "Quelle est votre première action prioritaire face à cette crise ?",
        options: [
          {
            id: "d1-o1",
            text: "Isoler immédiatement les systèmes infectés en déconnectant les serveurs du réseau",
            consequences: {
              description: "Vous avez rapidement isolé les systèmes infectés, limitant la propagation du ransomware. Cependant, cette action a temporairement impacté certains services critiques.",
              impactChanges: { reputation: 0, operations: -10, financial: -5, legal: +10 }
            }
          },
          {
            id: "d1-o2",
            text: "Contacter les autorités (ANSSI, police) avant toute action technique",
            consequences: {
              description: "Pendant que vous contactiez les autorités, le ransomware a continué sa propagation. Les autorités ont été informées rapidement, mais l'impact opérationnel s'est aggravé.",
              impactChanges: { reputation: +5, operations: -20, financial: -15, legal: +15 }
            }
          },
          {
            id: "d1-o3",
            text: "Activer le plan de continuité d'activité et basculer sur les systèmes de secours",
            consequences: {
              description: "Le basculement vers les systèmes de secours a permis de maintenir une partie des opérations. Cependant, certains systèmes de secours étaient également compromis.",
              impactChanges: { reputation: +5, operations: -5, financial: -10, legal: 0 }
            }
          },
          {
            id: "d1-o4",
            text: "Analyser d'abord l'étendue de l'infection avant de prendre des mesures",
            consequences: {
              description: "Le temps passé à analyser l'étendue a permis de mieux comprendre l'attaque, mais a laissé le ransomware se propager davantage.",
              impactChanges: { reputation: -5, operations: -25, financial: -20, legal: -5 }
            }
          }
        ]
      },
      {
        id: "decision2",
        question: "Comment gérez-vous la communication autour de cet incident ?",
        options: [
          {
            id: "d2-o1",
            text: "Communication limitée en interne uniquement aux équipes concernées",
            consequences: {
              description: "La limitation de la communication a créé de la confusion et des rumeurs en interne. Les employés n'ont pas su comment réagir correctement.",
              impactChanges: { reputation: -10, operations: -15, financial: -5, legal: -10 }
            }
          },
          {
            id: "d2-o2",
            text: "Communication transparente à tous les employés et parties prenantes externes",
            consequences: {
              description: "Votre transparence a été appréciée par les employés et clients, mais a temporairement impacté la réputation de l'entreprise et attiré l'attention médiatique.",
              impactChanges: { reputation: -5, operations: +5, financial: -5, legal: +10 }
            }
          },
          {
            id: "d2-o3",
            text: "Communication ciblée aux employés avec consignes précises et report de l'annonce externe",
            consequences: {
              description: "Cette approche équilibrée a permis de préparer les équipes internes tout en vous donnant le temps d'élaborer une stratégie de communication externe.",
              impactChanges: { reputation: +5, operations: +10, financial: 0, legal: +5 }
            }
          },
          {
            id: "d2-o4",
            text: "Aucune communication jusqu'à la résolution complète de l'incident",
            consequences: {
              description: "Le manque de communication a créé une atmosphère de méfiance et a empêché les employés de prendre les précautions nécessaires, aggravant la situation.",
              impactChanges: { reputation: -20, operations: -20, financial: -10, legal: -15 }
            }
          }
        ]
      },
      {
        id: "decision3",
        question: "Quelle est votre position concernant la demande de rançon ?",
        options: [
          {
            id: "d3-o1",
            text: "Refuser catégoriquement le paiement et se concentrer sur la restauration depuis les sauvegardes",
            consequences: {
              description: "Le refus de payer a envoyé un message fort, mais la restauration a pris plus de temps que prévu, prolongeant la période d'indisponibilité.",
              impactChanges: { reputation: +10, operations: -15, financial: -10, legal: +15 }
            }
          },
          {
            id: "d3-o2",
            text: "Négocier avec les attaquants pour gagner du temps pendant que vous restaurez les systèmes",
            consequences: {
              description: "La négociation a permis de gagner du temps pour restaurer certains systèmes critiques, sans payer la rançon ni encourager les attaquants.",
              impactChanges: { reputation: 0, operations: +5, financial: -5, legal: +5 }
            }
          },
          {
            id: "d3-o3",
            text: "Payer la rançon pour minimiser les temps d'arrêt et éviter la fuite de données",
            consequences: {
              description: "Le paiement a permis une récupération plus rapide mais a créé un précédent risqué. Des doutes subsistent sur la suppression réelle des données exfiltrées.",
              impactChanges: { reputation: -15, operations: +15, financial: -25, legal: -20 }
            }
          },
          {
            id: "d3-o4",
            text: "Consulter les experts en sécurité et les autorités avant de prendre une décision",
            consequences: {
              description: "Cette approche prudente a fourni de précieux conseils, mais a ralenti la prise de décision, prolongeant la période d'incertitude.",
              impactChanges: { reputation: +5, operations: -10, financial: -5, legal: +10 }
            }
          }
        ]
      },
      {
        id: "decision4",
        question: "Comment envisagez-vous la reprise d'activité ?",
        options: [
          {
            id: "d4-o1",
            text: "Restauration complète depuis les sauvegardes après nettoyage complet des systèmes",
            consequences: {
              description: "Cette approche prudente et méthodique a pris du temps mais a assuré un environnement propre et sécurisé pour la reprise.",
              impactChanges: { reputation: +10, operations: -5, financial: -15, legal: +15 }
            }
          },
          {
            id: "d4-o2",
            text: "Reprise progressive par ordre de priorité des services critiques",
            consequences: {
              description: "La reprise progressive a permis de rétablir rapidement les fonctions essentielles tout en maintenant un niveau de sécurité acceptable.",
              impactChanges: { reputation: +15, operations: +10, financial: -5, legal: +5 }
            }
          },
          {
            id: "d4-o3",
            text: "Reconstruire une infrastructure parallèle sécurisée puis migrer les données",
            consequences: {
              description: "Cette solution innovante a créé une nouvelle infrastructure plus sécurisée, mais le coût et le temps nécessaires ont été considérables.",
              impactChanges: { reputation: +20, operations: -15, financial: -30, legal: +10 }
            }
          },
          {
            id: "d4-o4",
            text: "Restauration rapide sans changement majeur pour minimiser les temps d'arrêt",
            consequences: {
              description: "La restauration rapide a limité l'impact financier immédiat, mais des vulnérabilités ont potentiellement subsisté, créant des risques futurs.",
              impactChanges: { reputation: -5, operations: +15, financial: +5, legal: -20 }
            }
          }
        ]
      },
      {
        id: "decision5",
        question: "Quelles mesures post-incident mettez-vous en place ?",
        options: [
          {
            id: "d5-o1",
            text: "Audit complet de sécurité et renforcement de l'infrastructure",
            consequences: {
              description: "L'audit a révélé plusieurs failles qui ont été corrigées, améliorant significativement la posture de sécurité de l'entreprise.",
              impactChanges: { reputation: +15, operations: +5, financial: -10, legal: +10 }
            }
          },
          {
            id: "d5-o2",
            text: "Formation intensive de tous les employés à la sécurité",
            consequences: {
              description: "Le programme de formation a considérablement amélioré la vigilance des employés, créant une première ligne de défense humaine plus efficace.",
              impactChanges: { reputation: +10, operations: +10, financial: -5, legal: +5 }
            }
          },
          {
            id: "d5-o3",
            text: "Investissement dans des solutions de détection et réponse avancées",
            consequences: {
              description: "Les nouvelles solutions technologiques ont renforcé la capacité de détection précoce, mais ont nécessité un investissement significatif.",
              impactChanges: { reputation: +5, operations: +5, financial: -20, legal: +15 }
            }
          },
          {
            id: "d5-o4",
            text: "Révision des plans de continuité et de reprise après sinistre",
            consequences: {
              description: "La mise à jour des plans a amélioré la préparation de l'entreprise aux futures crises, mais certaines vulnérabilités techniques n'ont pas été adressées.",
              impactChanges: { reputation: +5, operations: +15, financial: -5, legal: +5 }
            }
          }
        ]
      }
    ],
    currentDecisionIndex: 0,
    impactAreas: {
      reputation: 70, // Sur 100
      operations: 70, // Sur 100
      financial: 70, // Sur 100
      legal: 70 // Sur 100
    },
    severity: "critical",
    timeRemaining: 600 // 10 minutes en secondes
  };
  
  // Démarrer le scénario au chargement
  useEffect(() => {
    startScenario();
    
    // Nettoyage lors du démontage du composant
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);
  
  // Fonction pour démarrer un scénario
  const startScenario = () => {
    setIsLoading(true);
    setSessionId(uuidv4());
    
    // Utiliser le scénario d'exemple
    setTimeout(() => {
      setScenario(sampleScenario);
      setIsLoading(false);
      
      // Démarrer le timer de 10 minutes
      const interval = setInterval(() => {
        setScenario(prevScenario => {
          if (!prevScenario) return null;
          
          const newTimeRemaining = prevScenario.timeRemaining - 1;
          
          // Si le temps est écoulé, terminer le scénario
          if (newTimeRemaining <= 0) {
            clearInterval(interval);
            setShowSummary(true);
            return {
              ...prevScenario,
              timeRemaining: 0
            };
          }
          
          return {
            ...prevScenario,
            timeRemaining: newTimeRemaining
          };
        });
      }, 1000);
      
      setTimer(interval);
      
      toast({
        title: "Crise en cours",
        description: "Vous êtes maintenant en charge de la gestion de cette crise. Prenez des décisions rapidement !",
        duration: 5000
      });
    }, 1500);
  };
  
  // Fonction pour faire un choix de décision
  const makeDecision = (optionId: string) => {
    if (!scenario) return;
    
    // Mise à jour du scénario avec la décision prise
    setScenario(prevScenario => {
      if (!prevScenario) return null;
      
      const currentDecision = prevScenario.decisions[prevScenario.currentDecisionIndex];
      const selectedOption = currentDecision.options.find(opt => opt.id === optionId);
      
      if (!selectedOption) return prevScenario;
      
      // Calculer les nouveaux impacts
      const newImpacts = { ...prevScenario.impactAreas };
      const changes = selectedOption.consequences.impactChanges;
      
      newImpacts.reputation = Math.max(0, Math.min(100, newImpacts.reputation + changes.reputation));
      newImpacts.operations = Math.max(0, Math.min(100, newImpacts.operations + changes.operations));
      newImpacts.financial = Math.max(0, Math.min(100, newImpacts.financial + changes.financial));
      newImpacts.legal = Math.max(0, Math.min(100, newImpacts.legal + changes.legal));
      
      // Mise à jour des décisions
      const updatedDecisions = [...prevScenario.decisions];
      updatedDecisions[prevScenario.currentDecisionIndex] = {
        ...currentDecision,
        selectedOption: optionId
      };
      
      // Déterminer si c'est la dernière décision
      const isLastDecision = prevScenario.currentDecisionIndex === prevScenario.decisions.length - 1;
      
      // Si c'est la dernière décision, montrer le résumé
      if (isLastDecision) {
        if (timer) {
          clearInterval(timer);
        }
        setShowSummary(true);
      }
      
      // Retourner le scénario mis à jour
      return {
        ...prevScenario,
        decisions: updatedDecisions,
        currentDecisionIndex: isLastDecision ? prevScenario.currentDecisionIndex : prevScenario.currentDecisionIndex + 1,
        impactAreas: newImpacts
      };
    });
    
    // Notification de la décision prise
    toast({
      title: "Décision enregistrée",
      description: "Votre choix a un impact sur la gestion de crise.",
      duration: 3000
    });
  };
  
  // Fonction pour formater le temps restant
  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Fonction pour redémarrer le scénario
  const restartScenario = () => {
    if (timer) {
      clearInterval(timer);
    }
    setShowSummary(false);
    startScenario();
  };
  
  // Fonction pour retourner à la page précédente
  const handleReturnToPrevious = () => {
    // Si un scénario est en cours, demander confirmation
    if (scenario && !showSummary) {
      if (window.confirm("Êtes-vous sûr de vouloir abandonner cette simulation ? Votre progression sera perdue.")) {
        if (timer) {
          clearInterval(timer);
        }
        setLocation("/cyber/roleplay");
      }
    } else {
      // Si aucun scénario n'est en cours ou si le résumé est affiché, naviguer directement
      setLocation("/cyber/roleplay");
    }
  };
  
  // Calculer le score global
  const calculateOverallScore = () => {
    if (!scenario) return 0;
    
    const { reputation, operations, financial, legal } = scenario.impactAreas;
    return Math.round((reputation + operations + financial + legal) / 4);
  };
  
  return (
    <HomeLayout>
      <PageTitle title="Gestion de Crise | Cybersécurité" />
      
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-rose-950 to-slate-900 text-white relative overflow-hidden">
        {/* Bouton de retour */}
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="outline"
            size="sm"
            className="bg-black/50 border-rose-800 text-rose-400 hover:bg-black/70 hover:text-rose-300"
            onClick={handleReturnToPrevious}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
        </div>
        
        {/* Overlay d'éléments de crise en arrière-plan - Effet visuel amélioré */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Grille de fond façon "réseau compromis" */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          {/* Éléments dynamiques */}
          <div className="absolute top-20 left-10 transform -rotate-12 animate-pulse">
            <div className="text-6xl font-mono text-rose-500 font-bold tracking-tighter">ERROR</div>
            <div className="text-4xl font-mono text-rose-400 tracking-wide">SECURITY BREACH</div>
          </div>
          
          <div className="absolute bottom-20 right-10 transform rotate-12 animate-pulse" style={{animationDelay: '1.5s'}}>
            <div className="text-5xl font-mono text-rose-500 font-bold tracking-tighter">ALERT</div>
            <div className="text-3xl font-mono text-rose-400 tracking-wide">CRITICAL FAILURE</div>
          </div>
          
          <div className="absolute top-1/3 left-1/3 transform -rotate-45 animate-pulse" style={{animationDelay: '0.8s'}}>
            <div className="text-7xl font-mono text-rose-500/50 font-bold tracking-tighter">INCIDENT</div>
          </div>
          
          {/* Simulation d'écran de système compromis */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-full h-full flex flex-col gap-3 overflow-hidden p-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="text-xs font-mono text-rose-500 whitespace-nowrap overflow-hidden" 
                     style={{opacity: Math.random() * 0.7 + 0.3}}>
                  {Array.from({ length: Math.floor(Math.random() * 20) + 10 }).map((_, j) => (
                    <span key={j} className="inline-block mx-1">
                      {Math.random() > 0.5 ? 
                        (Math.random() > 0.7 ? "ACCESS_DENIED" : "ERROR_0x8007") : 
                        (Math.random() > 0.6 ? "BREACH_DETECTED" : "SYSTEM_FAILURE")}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          {/* Lignes et connexions simulant un réseau attaqué */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#991b1b" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {Array.from({ length: 20 }).map((_, i) => {
              const x1 = Math.random() * 100;
              const y1 = Math.random() * 100;
              const x2 = Math.random() * 100;
              const y2 = Math.random() * 100;
              return (
                <line 
                  key={i}
                  x1={`${x1}%`} 
                  y1={`${y1}%`} 
                  x2={`${x2}%`} 
                  y2={`${y2}%`} 
                  stroke="url(#redGradient)" 
                  strokeWidth="1"
                  opacity={Math.random() * 0.5 + 0.2}
                />
              );
            })}
          </svg>
        </div>
        
        {/* Ajout d'un filtre sur tout le contenu pour renforcer l'ambiance de crise */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-950/10 to-slate-950/10 mix-blend-multiply z-0"></div>
        
        {/* Bannière en cours de développement */}
        <div className="mx-auto max-w-4xl mb-4 mt-2">
          <div className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-900/30 border border-amber-500/30 rounded-md">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <p className="font-medium text-amber-400">Module en cours de développement (15% terminé)</p>
          </div>
        </div>
        
        {/* Contenu principal */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-screen">
            <AlertTriangle className="h-16 w-16 text-rose-500 animate-pulse" />
            <h2 className="text-2xl font-bold mt-4">Initialisation de la simulation de crise...</h2>
            <p className="text-gray-400 mt-2">Préparation du scénario d'incident</p>
          </div>
        ) : (
          <div className="container mx-auto pt-16 pb-8 px-4 relative z-10">
            {scenario && !showSummary ? (
              <div className="max-w-4xl mx-auto">
                {/* En-tête avec infos de crise */}
                <Card className="bg-rose-900/40 border-rose-700/50 mb-6">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-rose-200 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-rose-400" />
                        {scenario.title}
                        <Badge variant="destructive" className="ml-3 bg-rose-700">
                          {scenario.severity === "critical" ? "CRITIQUE" : 
                           scenario.severity === "high" ? "ÉLEVÉ" : 
                           scenario.severity === "medium" ? "MOYEN" : "FAIBLE"}
                        </Badge>
                      </CardTitle>
                      <div className="text-rose-300 text-xl font-mono font-bold flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        {formatTimeRemaining(scenario.timeRemaining)}
                      </div>
                    </div>
                    <CardDescription className="text-rose-300/80">
                      {scenario.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                {/* Ligne de temps et indicateurs d'impact */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-slate-900/60 border-rose-900/40 col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-rose-300">Chronologie des événements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {scenario.timeline.map((event, index) => (
                          <div key={index} className="flex items-start">
                            <div className="bg-rose-800/30 text-rose-300 px-2 py-1 rounded font-mono text-xs w-14 text-center mr-3">
                              {event.time}
                            </div>
                            <div className="text-sm text-gray-300">{event.event}</div>
                          </div>
                        ))}
                        {/* Événement en cours */}
                        <div className="flex items-start">
                          <div className="bg-rose-600/50 text-white px-2 py-1 rounded font-mono text-xs w-14 text-center mr-3 animate-pulse">
                            EN COURS
                          </div>
                          <div className="text-sm text-white font-medium">
                            Prise de décision : Étape {scenario.currentDecisionIndex + 1}/{scenario.decisions.length}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-900/60 border-rose-900/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-rose-300">Indicateurs d'impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <div className="flex items-center">
                              <ShieldAlert className="h-3 w-3 mr-1 text-rose-400" />
                              <span className="text-rose-200">Réputation</span>
                            </div>
                            <div className="flex items-center">
                              <span 
                                className={`text-rose-300 font-mono ${
                                  scenario.impactAreas.reputation > 70 ? "text-red-400 animate-pulse" : ""
                                }`}
                              >
                                {scenario.impactAreas.reputation}%
                              </span>
                              {scenario.impactAreas.reputation > 50 && (
                                <AlertTriangle className="h-3 w-3 ml-1 text-red-400" />
                              )}
                            </div>
                          </div>
                          <Progress 
                            value={scenario.impactAreas.reputation} 
                            className="h-2 bg-rose-950" 
                            indicatorClassName={`${
                              scenario.impactAreas.reputation > 70 
                                ? "bg-red-500 animate-pulse" 
                                : scenario.impactAreas.reputation > 50 
                                ? "bg-red-600" 
                                : "bg-rose-500"
                            }`} 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <div className="flex items-center">
                              <Activity className="h-3 w-3 mr-1 text-rose-400" />
                              <span className="text-rose-200">Opérations</span>
                            </div>
                            <div className="flex items-center">
                              <span 
                                className={`text-rose-300 font-mono ${
                                  scenario.impactAreas.operations > 70 ? "text-red-400 animate-pulse" : ""
                                }`}
                              >
                                {scenario.impactAreas.operations}%
                              </span>
                              {scenario.impactAreas.operations > 50 && (
                                <AlertTriangle className="h-3 w-3 ml-1 text-red-400" />
                              )}
                            </div>
                          </div>
                          <Progress 
                            value={scenario.impactAreas.operations} 
                            className="h-2 bg-rose-950" 
                            indicatorClassName={`${
                              scenario.impactAreas.operations > 70 
                                ? "bg-red-500 animate-pulse" 
                                : scenario.impactAreas.operations > 50 
                                ? "bg-red-600" 
                                : "bg-rose-500"
                            }`} 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <div className="flex items-center">
                              <Banknote className="h-3 w-3 mr-1 text-rose-400" />
                              <span className="text-rose-200">Financier</span>
                            </div>
                            <div className="flex items-center">
                              <span 
                                className={`text-rose-300 font-mono ${
                                  scenario.impactAreas.financial > 70 ? "text-red-400 animate-pulse" : ""
                                }`}
                              >
                                {scenario.impactAreas.financial}%
                              </span>
                              {scenario.impactAreas.financial > 50 && (
                                <AlertTriangle className="h-3 w-3 ml-1 text-red-400" />
                              )}
                            </div>
                          </div>
                          <Progress 
                            value={scenario.impactAreas.financial} 
                            className="h-2 bg-rose-950" 
                            indicatorClassName={`${
                              scenario.impactAreas.financial > 70 
                                ? "bg-red-500 animate-pulse" 
                                : scenario.impactAreas.financial > 50 
                                ? "bg-red-600" 
                                : "bg-rose-500"
                            }`} 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-xs mb-1">
                            <div className="flex items-center">
                              <Scale className="h-3 w-3 mr-1 text-rose-400" />
                              <span className="text-rose-200">Juridique</span>
                            </div>
                            <div className="flex items-center">
                              <span 
                                className={`text-rose-300 font-mono ${
                                  scenario.impactAreas.legal > 70 ? "text-red-400 animate-pulse" : ""
                                }`}
                              >
                                {scenario.impactAreas.legal}%
                              </span>
                              {scenario.impactAreas.legal > 50 && (
                                <AlertTriangle className="h-3 w-3 ml-1 text-red-400" />
                              )}
                            </div>
                          </div>
                          <Progress 
                            value={scenario.impactAreas.legal} 
                            className="h-2 bg-rose-950" 
                            indicatorClassName={`${
                              scenario.impactAreas.legal > 70 
                                ? "bg-red-500 animate-pulse" 
                                : scenario.impactAreas.legal > 50 
                                ? "bg-red-600" 
                                : "bg-rose-500"
                            }`} 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Situation actuelle - Carte améliorée avec alertes visuelles */}
                <Card className="bg-gradient-to-br from-slate-900/80 to-rose-950/40 border-rose-700/40 shadow-lg shadow-rose-900/20 mb-6 overflow-hidden relative">
                  {/* Arrière-plan dynamique */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-800 to-red-500 opacity-70"></div>
                    <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-rose-800 to-transparent opacity-70"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent to-rose-800 opacity-70"></div>
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent to-rose-800 opacity-70"></div>
                  </div>
                  
                  <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-rose-300 flex items-center">
                      <AlertOctagon className="h-5 w-5 mr-2 text-rose-500" />
                      Situation actuelle
                      {scenario.severity === "critical" && (
                        <Badge variant="destructive" className="ml-3 bg-red-800 animate-pulse">CRITIQUE</Badge>
                      )}
                    </CardTitle>
                    
                    {/* Tags supplémentaires selon la situation */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-rose-950/50 text-rose-300 border border-rose-800/40">
                        <Clock className="h-3 w-3 mr-1" /> Temps restant: {formatTimeRemaining(scenario.timeRemaining)}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-rose-950/50 text-rose-300 border border-rose-800/40">
                        <Shield className="h-3 w-3 mr-1" /> Systèmes impactés: {Math.floor(Math.random() * 5) + 3}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-rose-950/50 text-rose-300 border border-rose-800/40">
                        <Users className="h-3 w-3 mr-1" /> Équipes mobilisées: {Math.floor(Math.random() * 3) + 2}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="prose prose-invert max-w-none relative z-10">
                    {/* Encadré d'avertissement */}
                    <div className="mb-4 p-3 bg-red-950/30 border-l-4 border-red-500 rounded">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-red-300 text-sm m-0">
                          <span className="font-semibold">Alerte SOC:</span> La situation évolue rapidement et nécessite une prise de décision immédiate. Les impacts peuvent s'aggraver si aucune action n'est prise.
                        </p>
                      </div>
                    </div>
                    
                    {/* Contenu principal avec mise en évidence */}
                    <div className="text-gray-200 whitespace-pre-line leading-relaxed">
                      {scenario.situation.split('\n').map((paragraph, i) => (
                        <p key={i} className={i === 0 ? "text-base font-medium text-rose-100" : "text-sm text-gray-300"}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    
                    {/* Indicateurs temps réel */}
                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                      <div className="flex flex-col items-center justify-center p-2 bg-rose-950/30 rounded border border-rose-900/30">
                        <span className="font-mono text-rose-300">CPU</span>
                        <span className="font-mono text-rose-400 animate-pulse">{Math.floor(Math.random() * 25) + 75}%</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 bg-rose-950/30 rounded border border-rose-900/30">
                        <span className="font-mono text-rose-300">MEM</span>
                        <span className="font-mono text-rose-400">{Math.floor(Math.random() * 20) + 60}%</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-2 bg-rose-950/30 rounded border border-rose-900/30">
                        <span className="font-mono text-rose-300">ALRT</span>
                        <span className="font-mono text-rose-400">{Math.floor(Math.random() * 100) + 150}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Décision actuelle - Redesign complet */}
                <Card className="bg-gradient-to-br from-rose-950/50 to-black border-red-900/50 mb-6 overflow-hidden shadow-lg shadow-rose-900/20 relative">
                  {/* Arrière-plan animé pour effet urgence */}
                  <div className="absolute inset-0 overflow-hidden z-0">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-700 via-red-500 to-red-700 animate-pulse"></div>
                    <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-red-700 via-red-500 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-red-700"></div>
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-700 via-red-500 to-transparent"></div>
                  </div>
                  
                  <CardHeader className="relative z-10 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-rose-100 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-red-500 animate-pulse" />
                        <span className="mr-2">Décision critique</span>
                        <Badge className="bg-red-900 text-rose-100 animate-pulse">
                          {scenario.currentDecisionIndex + 1}/{scenario.decisions.length}
                        </Badge>
                      </CardTitle>
                      
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-rose-400" />
                        <span className="text-sm font-mono text-rose-300">
                          {formatTimeRemaining(scenario.timeRemaining)}
                        </span>
                      </div>
                    </div>
                    
                    <CardDescription className="text-rose-100 text-lg font-medium mt-4 border-l-4 border-red-700 pl-3 py-1">
                      {scenario.decisions[scenario.currentDecisionIndex].question}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    {/* Avertissement pré-décision */}
                    <div className="mb-4 p-3 bg-red-950/40 rounded border border-red-900/40">
                      <div className="flex items-start">
                        <Info className="h-4 w-4 text-rose-400 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-rose-300 m-0">
                          Chaque décision affectera différemment les indicateurs d'impact. Choisissez judicieusement en fonction de vos priorités de gestion de crise.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {scenario.decisions[scenario.currentDecisionIndex].options.map((option, index) => (
                        <div 
                          key={option.id}
                          className="relative overflow-hidden rounded-md group transition-all duration-300"
                        >
                          <Button
                            variant="outline"
                            className="w-full justify-start py-6 px-4 border-rose-800/60 bg-gradient-to-r from-slate-900/80 to-rose-950/30 
                                      hover:bg-gradient-to-r hover:from-rose-950/40 hover:to-slate-900/70 hover:border-red-600/70 text-left
                                      group-hover:shadow-md group-hover:shadow-rose-900/30 transition-all duration-300"
                            onClick={() => makeDecision(option.id)}
                          >
                            <div className="flex flex-col w-full">
                              <div className="flex items-center mb-1">
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-rose-900/50 mr-3 
                                              border border-rose-800/50 group-hover:bg-rose-800 transition-colors duration-300">
                                  <span className="text-rose-200 font-bold text-sm">{index + 1}</span>
                                </div>
                                <div className="font-medium text-rose-100 group-hover:text-white transition-colors duration-300">{option.text}</div>
                              </div>
                              
                              {/* Affichage stylisé du type de réponse */}
                              <div className="ml-10 mt-1 text-xs">
                                <span className={`inline-block px-2 py-0.5 rounded-full ${
                                  option.text.includes("immédiatement") || option.text.includes("urgent") ? 
                                  "bg-red-900/40 text-red-300 border border-red-800/40" : 
                                  option.text.includes("attendre") || option.text.includes("observer") ? 
                                  "bg-amber-900/40 text-amber-300 border border-amber-800/40" :
                                  "bg-blue-900/40 text-blue-300 border border-blue-800/40"
                                }`}>
                                  {option.text.includes("immédiatement") || option.text.includes("urgent") ? 
                                    "Action immédiate" : 
                                    option.text.includes("attendre") || option.text.includes("observer") ? 
                                    "Approche progressive" :
                                    "Action stratégique"}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 ml-auto text-rose-400 group-hover:text-white transition-colors duration-300" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Rappel du temps restant */}
                    <div className="mt-4 flex items-center justify-center">
                      <div className="px-3 py-1 bg-gradient-to-r from-red-950/40 to-rose-950/40 rounded-full border border-rose-900/30 
                                  animate-pulse flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-rose-400" />
                        <span className="text-xs font-mono text-rose-300">
                          Délai critique: {formatTimeRemaining(scenario.timeRemaining)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Décisions précédentes */}
                {scenario.currentDecisionIndex > 0 && (
                  <Card className="bg-slate-900/60 border-rose-900/40 mb-6">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-rose-300">Décisions précédentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {scenario.decisions.slice(0, scenario.currentDecisionIndex).map((decision, index) => {
                          if (!decision.selectedOption) return null;
                          
                          const selectedOption = decision.options.find(o => o.id === decision.selectedOption);
                          if (!selectedOption) return null;
                          
                          return (
                            <div key={index} className="bg-slate-800/40 p-3 rounded-md border border-rose-900/20">
                              <div className="font-medium text-rose-200 text-sm mb-1">
                                Décision {index + 1}: {decision.question}
                              </div>
                              <div className="text-gray-400 text-xs flex items-start">
                                <div className="bg-rose-900/30 p-1 rounded-full mr-2 mt-0.5">
                                  <Shield className="h-3 w-3 text-rose-400" />
                                </div>
                                <div>
                                  <span className="text-rose-300">Votre choix:</span> {selectedOption.text}
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-gray-400 italic border-l-2 border-rose-700/30 pl-2">
                                {selectedOption.consequences.description}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : showSummary && scenario ? (
              <div className="max-w-4xl mx-auto">
                {/* Résumé de la crise */}
                <Card className="bg-slate-900/60 border-rose-700/50 mb-6">
                  <CardHeader>
                    <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-rose-900/50 flex items-center justify-center">
                      <Shield className="h-10 w-10 text-rose-300" />
                    </div>
                    <CardTitle className="text-2xl text-center text-rose-300">
                      Simulation de crise terminée
                    </CardTitle>
                    <CardDescription className="text-center text-rose-200/80 text-lg mt-2">
                      Votre score final: {calculateOverallScore()}/100
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center space-x-6 mb-8">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-rose-300">{scenario.impactAreas.reputation}%</div>
                        <div className="text-xs text-rose-200/80">Réputation</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-rose-300">{scenario.impactAreas.operations}%</div>
                        <div className="text-xs text-rose-200/80">Opérations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-rose-300">{scenario.impactAreas.financial}%</div>
                        <div className="text-xs text-rose-200/80">Financier</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-rose-300">{scenario.impactAreas.legal}%</div>
                        <div className="text-xs text-rose-200/80">Juridique</div>
                      </div>
                    </div>
                    
                    <Separator className="mb-6 bg-rose-900/30" />
                    
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-rose-300">Résumé de vos décisions</h3>
                      {scenario.decisions.map((decision, index) => {
                        if (!decision.selectedOption) return null;
                        
                        const selectedOption = decision.options.find(o => o.id === decision.selectedOption);
                        if (!selectedOption) return null;
                        
                        return (
                          <div key={index} className="bg-slate-800/40 p-4 rounded-md border border-rose-900/20">
                            <div className="font-medium text-rose-200 mb-2">
                              Décision {index + 1}: {decision.question}
                            </div>
                            <div className="flex items-start">
                              <div className="bg-rose-900/30 p-1 rounded-full mr-2 mt-0.5">
                                <Shield className="h-3 w-3 text-rose-300" />
                              </div>
                              <div className="text-sm text-gray-300">
                                <strong>Votre choix:</strong> {selectedOption.text}
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-400 border-l-2 border-rose-700/30 pl-3 py-1">
                              <strong>Conséquence:</strong> {selectedOption.consequences.description}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-8 p-4 bg-slate-800/50 rounded-md border border-rose-900/30">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-rose-400 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-300">
                          <strong className="text-rose-300">Analyse:</strong> Votre gestion de crise montre {calculateOverallScore() >= 80 ? "une excellente" : calculateOverallScore() >= 60 ? "une bonne" : "une approche qui pourrait être améliorée"}. Les meilleures pratiques incluent l'isolement rapide des systèmes infectés, une communication transparente mais mesurée, et la mise en place d'un plan de reprise progressif.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center space-x-4">
                    <Button 
                      variant="outline" 
                      className="border-rose-700 text-rose-300 hover:bg-rose-900/30"
                      onClick={restartScenario}
                    >
                      Recommencer la simulation
                    </Button>
                    <Button 
                      className="bg-rose-700 hover:bg-rose-600 text-white"
                      onClick={handleReturnToPrevious}
                    >
                      Retour aux scénarios
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-screen">
                <AlertTriangle className="h-16 w-16 text-rose-500 animate-pulse" />
                <h2 className="text-2xl font-bold mt-4">Erreur de chargement du scénario</h2>
                <Button 
                  onClick={startScenario} 
                  className="mt-4 bg-rose-700 hover:bg-rose-600"
                >
                  Réessayer
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </HomeLayout>
  );
}