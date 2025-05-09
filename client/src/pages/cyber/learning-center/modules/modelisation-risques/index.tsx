import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { 
  AlertCircle, BookOpen, CheckCircle, ChevronLeft, ChevronRight, 
  Shield, Target, Zap, FileText, Sparkles, Brain, Scale, FlaskConical,
  BarChart3, Lightbulb, PieChart, Lock, CheckCheck, Command, MapPin, Compass,
  Clock as LucideClock, BrainCircuit
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Types pour le module
interface RiskComponent {
  id: string;
  title: string;
  description: string;
  tooltip: string;
}

interface RiskFactorCategory {
  id: string;
  name: string;
  factors: { id: string; name: string; value: number }[];
}

interface Standard {
  id: string;
  name: string;
  fullName: string;
  domain: string;
  icon: React.ReactNode;
  description: string;
  key_requirements: string[];
}

interface Character {
  id: string;
  name: string;
  role: string;
  avatar: string;
  description: string;
  speciality: string[];
}

// Composant principal
export default function ModelisationRisques() {
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState<string>("introduction");
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [draggedThreat, setDraggedThreat] = useState<string | null>(null);
  const [riskMatrix, setRiskMatrix] = useState<{[key: string]: number}>({});
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [showChallengeModal, setShowChallengeModal] = useState<boolean>(false);
  const [showAiAssistant, setShowAiAssistant] = useState<boolean>(false);
  const [activeStandard, setActiveStandard] = useState<string | null>(null);
  const [userScore, setUserScore] = useState<number>(0);
  const [userRank, setUserRank] = useState<string>("Novice Analyste");
  const [expandedRiskArea, setExpandedRiskArea] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [missionCompleted, setMissionCompleted] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // On va simuler un petit délai de chargement
  const { data: moduleData, isLoading } = useQuery({
    queryKey: ["/api/cyber/modules/modelisation-risques"],
    queryFn: () => new Promise(resolve => setTimeout(() => resolve({}), 800)),
  });

  // Sections du module
  const moduleSections = [
    { id: "introduction", title: "Introduction", icon: <BookOpen className="h-4 w-4" /> },
    { id: "modelisation", title: "Modélisation des menaces", icon: <Target className="h-4 w-4" /> },
    { id: "analyse", title: "Analyse des risques", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "normes", title: "Normes et standards", icon: <CheckCheck className="h-4 w-4" /> },
    { id: "atelier", title: "Atelier pratique", icon: <FlaskConical className="h-4 w-4" /> },
  ];

  // Modèles de modélisation des menaces
  const threatModels = [
    {
      id: "stride",
      name: "STRIDE",
      description: "Focus sur les types de menaces pour les systèmes",
      icon: <Compass className="h-6 w-6 text-purple-400" />,
      elements: [
        { id: "spoofing", name: "Spoofing", description: "Usurpation d'identité" },
        { id: "tampering", name: "Tampering", description: "Falsification de données" },
        { id: "repudiation", name: "Repudiation", description: "Répudiation d'actions" },
        { id: "information-disclosure", name: "Information Disclosure", description: "Divulgation d'informations" },
        { id: "denial-of-service", name: "Denial of Service", description: "Déni de service" },
        { id: "elevation-of-privilege", name: "Elevation of Privilege", description: "Élévation de privilèges" }
      ],
      color: "purple",
      example: "Un attaquant usurpe l'identité d'un administrateur pour accéder à des données confidentielles."
    },
    {
      id: "pasta",
      name: "PASTA",
      description: "Process for Attack Simulation and Threat Analysis",
      icon: <MapPin className="h-6 w-6 text-blue-400" />,
      elements: [
        { id: "define-objectives", name: "Définir les objectifs", description: "Identifier les exigences et les objectifs métier" },
        { id: "tech-scope", name: "Portée technique", description: "Déterminer le périmètre d'analyse" },
        { id: "application-decomposition", name: "Décomposition", description: "Décomposer l'application en composants" },
        { id: "threat-analysis", name: "Analyse des menaces", description: "Identifier les menaces applicables" },
        { id: "vulnerability-analysis", name: "Analyse des vulnérabilités", description: "Rechercher les vulnérabilités" },
        { id: "attack-modeling", name: "Modélisation des attaques", description: "Simuler des scénarios d'attaque" },
        { id: "risk-analysis", name: "Analyse des risques", description: "Évaluation et cotation des risques" }
      ],
      color: "blue",
      example: "Une équipe modélise les chemins d'attaque contre un système de paiement pour anticiper les risques financiers."
    },
    {
      id: "linddun",
      name: "LINDDUN",
      description: "Focus sur les menaces liées à la vie privée",
      icon: <Lock className="h-6 w-6 text-teal-400" />,
      elements: [
        { id: "linkability", name: "Linkability", description: "Possibilité de lier des informations" },
        { id: "identifiability", name: "Identifiability", description: "Possibilité d'identifier un utilisateur" },
        { id: "non-repudiation", name: "Non-repudiation", description: "Impossibilité de nier une action" },
        { id: "detectability", name: "Detectability", description: "Détectabilité d'une action" },
        { id: "disclosure", name: "Disclosure", description: "Divulgation d'informations" },
        { id: "unawareness", name: "Unawareness", description: "Méconnaissance du traitement des données" },
        { id: "non-compliance", name: "Non-compliance", description: "Non-conformité aux règlements" }
      ],
      color: "teal",
      example: "Une analyse LINDDUN révèle que des données médicales anonymisées peuvent être réidentifiées lorsqu'elles sont croisées avec d'autres sources publiques."
    },
    {
      id: "octave",
      name: "OCTAVE",
      description: "Operationally Critical Threat, Asset, and Vulnerability Evaluation",
      icon: <Target className="h-6 w-6 text-red-400" />,
      elements: [
        { id: "org-view", name: "Vue organisationnelle", description: "Identifier les actifs critiques" },
        { id: "tech-view", name: "Vue technique", description: "Identifier les vulnérabilités techniques" },
        { id: "risk-analysis", name: "Analyse des risques", description: "Développer des stratégies de protection" }
      ],
      color: "red",
      example: "Une organisation utilise OCTAVE pour évaluer systématiquement ses actifs critiques et créer des plans de mitigation des risques."
    }
  ];

  // Composants clés d'analyse de risque
  const riskComponents: RiskComponent[] = [
    { 
      id: "asset", 
      title: "Actif", 
      description: "Tout élément de valeur pour l'organisation", 
      tooltip: "Données, logiciels, matériel, personnes, bâtiments" 
    },
    { 
      id: "threat", 
      title: "Menace", 
      description: "Source potentielle d'un événement indésirable", 
      tooltip: "Hackers, malwares, erreurs humaines, catastrophes naturelles" 
    },
    { 
      id: "vulnerability", 
      title: "Vulnérabilité", 
      description: "Faiblesse pouvant être exploitée", 
      tooltip: "Logiciel non patché, mauvaise configuration, absence de contrôle" 
    },
    { 
      id: "risk", 
      title: "Risque", 
      description: "Probabilité × Impact d'une menace exploitant une vulnérabilité", 
      tooltip: "Représente l'exposition potentielle à un danger" 
    },
    { 
      id: "control", 
      title: "Contrôle", 
      description: "Mesure pour réduire un risque", 
      tooltip: "Mécanismes techniques, procédures, politiques, formations" 
    }
  ];

  // Méthodes d'analyse de risques
  const riskMethods = [
    {
      id: "ebios",
      name: "EBIOS Risk Manager",
      origin: "France (ANSSI)",
      description: "Méthode d'appréciation et de traitement des risques axée sur les scénarios stratégiques",
      approach: "Workshop collaboratif en 5 ateliers",
      strengths: ["Focus sur les scénarios opérationnels", "Adapté aux enjeux métier", "Reconnu par l'ANSSI"],
      color: "blue"
    },
    {
      id: "mehari",
      name: "MEHARI",
      origin: "France (CLUSIF)",
      description: "Méthode d'analyse et de gestion harmonisée des risques",
      approach: "Analyse détaillée des services de sécurité",
      strengths: ["Base de connaissances riche", "Approche modulaire", "Évaluation quantitative avancée"],
      color: "green"
    },
    {
      id: "cramm",
      name: "CRAMM",
      origin: "Royaume-Uni",
      description: "CCTA Risk Analysis and Management Method",
      approach: "Analyse systématique en trois phases",
      strengths: ["Extensif et détaillé", "Forte documentation", "Adapté aux grandes organisations"],
      color: "purple"
    },
    {
      id: "fair",
      name: "FAIR",
      origin: "États-Unis",
      description: "Factor Analysis of Information Risk",
      approach: "Modèle quantitatif et taxonomie",
      strengths: ["Mesure financière des risques", "Compatible avec d'autres frameworks", "Approche par la valeur"],
      color: "amber"
    }
  ];

  // Principales normes et standards de sécurité
  const standards: Standard[] = [
    {
      id: "iso27001",
      name: "ISO 27001",
      fullName: "ISO/IEC 27001:2022",
      domain: "Management de la sécurité de l'information",
      icon: <Shield className="h-5 w-5 text-blue-400" />,
      description: "Norme internationale pour les systèmes de management de la sécurité de l'information (SMSI)",
      key_requirements: [
        "Leadership et engagement de la direction",
        "Évaluation et traitement des risques",
        "Déclaration d'applicabilité (SOA)",
        "Contrôles de sécurité (Annexe A)",
        "Amélioration continue"
      ]
    },
    {
      id: "iso27005",
      name: "ISO 27005",
      fullName: "ISO/IEC 27005:2022",
      domain: "Gestion des risques liés à la sécurité de l'information",
      icon: <Target className="h-5 w-5 text-red-400" />,
      description: "Fournit des lignes directrices pour la gestion des risques de sécurité de l'information",
      key_requirements: [
        "Établissement du contexte",
        "Appréciation des risques",
        "Traitement des risques",
        "Communication et concertation",
        "Surveillance et réexamen"
      ]
    },
    {
      id: "nist-csf",
      name: "NIST CSF",
      fullName: "NIST Cybersecurity Framework",
      domain: "Cadre de cybersécurité multi-sectoriel",
      icon: <Command className="h-5 w-5 text-green-400" />,
      description: "Framework flexible pour améliorer la gestion des risques de cybersécurité",
      key_requirements: [
        "Identifier (assets, business environment, governance...)",
        "Protéger (contrôles d'accès, formations, maintenance...)",
        "Détecter (anomalies, événements, surveillance...)",
        "Répondre (planification, communications, analyse...)",
        "Récupérer (plans de reprise, améliorations, communications...)"
      ]
    },
    {
      id: "pci-dss",
      name: "PCI DSS",
      fullName: "Payment Card Industry Data Security Standard",
      domain: "Sécurité des données de cartes de paiement",
      icon: <Zap className="h-5 w-5 text-yellow-400" />,
      description: "Ensemble d'exigences de sécurité pour les organisations qui traitent les cartes de paiement",
      key_requirements: [
        "Construire et maintenir un réseau sécurisé",
        "Protéger les données des titulaires de cartes",
        "Maintenir un programme de gestion des vulnérabilités",
        "Mettre en œuvre des mesures de contrôle d'accès",
        "Surveiller et tester régulièrement les réseaux",
        "Maintenir une politique de sécurité de l'information"
      ]
    }
  ];

  // Personnages pour le jeu de rôle dans l'atelier
  const characters: Character[] = [
    {
      id: "risk-analyst",
      name: "Ana Riskov",
      role: "Analyste de risques",
      avatar: "👩‍💼",
      description: "Experte en évaluation et quantification des risques cyber",
      speciality: ["FAIR", "Analyse quantitative", "Communication des risques"]
    },
    {
      id: "threat-modeler",
      name: "Théo Modello",
      role: "Modélisateur de menaces",
      avatar: "👨‍💻",
      description: "Spécialiste en identification et modélisation des menaces",
      speciality: ["STRIDE", "PASTA", "Diagrammes de flux de données"]
    },
    {
      id: "compliance-officer",
      name: "Clara Normis",
      role: "Responsable conformité",
      avatar: "👩‍⚖️",
      description: "Veille à l'application des normes et à la conformité réglementaire",
      speciality: ["ISO 27001", "NIS 2", "RGPD"]
    },
    {
      id: "ciso",
      name: "Samuel Sécu",
      role: "RSSI",
      avatar: "🧙‍♂️",
      description: "Responsable de la stratégie de sécurité et de la gouvernance",
      speciality: ["Gouvernance", "Gestion de crise", "Leadership"]
    }
  ];

  // Simule la progression
  const handleMarkCompleted = (section: string) => {
    if (!completedSections.includes(section)) {
      const updatedSections = [...completedSections, section];
      setCompletedSections(updatedSections);
      
      toast({
        title: "Section complétée !",
        description: `Vous avez terminé la section "${moduleSections.find(s => s.id === section)?.title}"`,
      });
    }
  };

  // Fonction pour les interactions avec la matrice de risque
  const handleRiskMatrixInteraction = (severity: string, likelihood: string) => {
    const key = `${severity}-${likelihood}`;
    
    // Simuler l'interaction avec la matrice
    setRiskMatrix({
      ...riskMatrix,
      [key]: (riskMatrix[key] || 0) + 1
    });
    
    // Afficher un toast pour l'interaction
    const riskLevel = getRiskLevel(severity, likelihood);
    toast({
      title: `Risque ${riskLevel.label}`,
      description: `Vous avez identifié un risque de sévérité ${severity} et probabilité ${likelihood}`,
      variant: riskLevel.variant,
    });
  };
  
  // Obtenir le niveau de risque basé sur la sévérité et la probabilité
  const getRiskLevel = (severity: string, likelihood: string) => {
    const severityValue = { "faible": 1, "moyen": 2, "élevé": 3, "critique": 4 };
    const likelihoodValue = { "rare": 1, "peu probable": 2, "probable": 3, "très probable": 4 };
    
    const riskScore = (severityValue[severity as keyof typeof severityValue] || 0) * 
                      (likelihoodValue[likelihood as keyof typeof likelihoodValue] || 0);
    
    if (riskScore <= 3) return { label: "Faible", variant: "default" as const };
    if (riskScore <= 8) return { label: "Moyen", variant: "default" as const };
    if (riskScore <= 12) return { label: "Élevé", variant: "destructive" as const };
    return { label: "Critique", variant: "destructive" as const };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-blue-300">Chargement du module...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white">
      <div className="container mx-auto p-6 pt-4">
        <Card className="border-blue-800 bg-gradient-to-br from-blue-950 to-slate-950 shadow-xl">
          <CardHeader className="border-b border-blue-800 pb-4">
            <div className="flex items-center mb-2">
              <Link href="/cyber/learning-center">
                <Button variant="ghost" className="text-white">
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  Retour
                </Button>
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Modélisation des menaces, Analyses des risques, Normes et standards de sécurité
            </CardTitle>
            <CardDescription className="text-blue-300">
              Anticipez les menaces, quantifiez les risques et naviguez dans le paysage réglementaire
            </CardDescription>
            
            {/* Progression globale */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-blue-300">Progression du module</span>
                <span className="text-sm font-medium text-blue-300">
                  {Math.round((completedSections.length / moduleSections.length) * 100)}%
                </span>
              </div>
              <Progress 
                value={(completedSections.length / moduleSections.length) * 100} 
                className="h-2 bg-blue-950"
              />
              
              {userScore > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className="bg-blue-900/30 text-blue-200 border-blue-700"
                  >
                    <Target className="h-3.5 w-3.5 mr-1 text-blue-400" />
                    {userScore} points
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="bg-purple-900/30 text-purple-200 border-purple-700"
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-400" />
                    {userRank}
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {/* Menu de navigation du module */}
            <div className="flex overflow-x-auto gap-2 mb-8 pb-2">
              {moduleSections.map((section, index) => (
                <Button
                  key={section.id}
                  size="sm"
                  variant={currentSection === section.id ? "default" : "outline"} 
                  className={`rounded-full ${currentSection === section.id ? 'bg-blue-700' : 'border-blue-700'}`}
                  onClick={() => setCurrentSection(section.id)}
                >
                  <div className="flex items-center">
                    {section.icon}
                    {index > 0 && completedSections.includes(moduleSections[index - 1].id) && 
                      <CheckCircle className="h-3 w-3 ml-1 text-green-400" />}
                  </div>
                  <span className="ml-2">{section.title}</span>
                </Button>
              ))}
            </div>
            
            {/* Section Introduction */}
            {currentSection === "introduction" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">🛡️ Introduction à la Modélisation des Menaces et à l'Analyse des Risques</h2>
                
                <div className="p-5 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-800 shadow-inner">
                  <p className="mb-4">
                    Dans un monde numérique en perpétuelle évolution, la capacité à <strong>anticiper les menaces</strong> et à 
                    <strong>quantifier les risques</strong> est devenue une compétence fondamentale pour tout professionnel de la cybersécurité.
                  </p>
                  <p>
                    Ce module vous guidera à travers l'art et la science de la modélisation des menaces, 
                    de l'analyse des risques et de la navigation dans le paysage des normes et standards. 
                    Vous allez apprendre à penser comme un attaquant, à évaluer les vulnérabilités comme un stratège, 
                    et à implementer des contrôles comme un architecte.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border-blue-800">
                    <CardHeader>
                      <Target className="h-8 w-8 text-blue-400 mb-2" />
                      <CardTitle className="text-lg">Modélisation des menaces</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-blue-200">
                        Apprenez à identifier et à visualiser les menaces potentielles contre vos systèmes
                        à l'aide de méthodologies structurées.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-800">
                    <CardHeader>
                      <BarChart3 className="h-8 w-8 text-purple-400 mb-2" />
                      <CardTitle className="text-lg">Analyse des risques</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-blue-200">
                        Transformez les menaces abstraites en valeurs quantifiables pour prendre
                        des décisions éclairées basées sur les risques.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border-amber-800">
                    <CardHeader>
                      <CheckCheck className="h-8 w-8 text-amber-400 mb-2" />
                      <CardTitle className="text-lg">Normes et standards</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-blue-200">
                        Découvrez les référentiels qui guident les bonnes pratiques en matière
                        de gestion des risques cybersécurité.
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <Alert className="bg-blue-900/30 border-blue-700 mt-8">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <AlertTitle>Mode d'emploi</AlertTitle>
                  <AlertDescription>
                    Naviguez à travers les sections en utilisant les onglets ci-dessus. Chaque section contient des connaissances 
                    théoriques et des activités pratiques. Complétez toutes les sections pour valider ce module.
                  </AlertDescription>
                </Alert>
                
                <div className="mt-8 text-center">
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    onClick={() => {
                      handleMarkCompleted("introduction");
                      setCurrentSection("modelisation");
                    }}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Commencer l'aventure
                  </Button>
                </div>
              </div>
            )}

            {/* Section Modélisation des menaces */}
            {currentSection === "modelisation" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-6 rounded-xl border border-purple-700/50">
                  <h2 className="text-2xl font-bold mb-3">La Cartographie des Menaces : Une Aventure Stratégique</h2>
                  <p className="mb-4">
                    La modélisation des menaces ressemble à une partie de stratégie où vous visualisez tous les mouvements possibles 
                    de vos adversaires avant même qu'ils ne commencent à jouer. C'est l'art de penser comme un attaquant 
                    pour mieux se défendre.
                  </p>
                  
                  <div className="p-4 bg-blue-950/40 rounded-lg mb-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-700/30 p-2 rounded-full mt-1">
                        <Lightbulb className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-amber-300">Concept fondamental</h4>
                        <p className="text-blue-200">
                          La modélisation des menaces est un exercice <strong>proactif</strong> qui intervient idéalement 
                          avant même le développement d'un système ou au début de sa conception.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mt-8 mb-4">Les grands modèles de modélisation des menaces</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {threatModels.map((model) => (
                    <div 
                      key={model.id}
                      className={`bg-${model.color}-900/20 border border-${model.color}-800 rounded-lg overflow-hidden`}
                    >
                      <div 
                        className="p-4 cursor-pointer"
                        onClick={() => setExpandedModel(expandedModel === model.id ? null : model.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            {model.icon}
                            <div>
                              <h4 className="font-bold text-lg">{model.name}</h4>
                              <p className="text-sm text-blue-300">{model.description}</p>
                            </div>
                          </div>
                          <ChevronRight 
                            className={`transition-transform duration-300 ${expandedModel === model.id ? 'rotate-90' : ''}`}
                          />
                        </div>
                      </div>
                      
                      {expandedModel === model.id && (
                        <div className="p-4 border-t border-blue-800 bg-blue-950/30 space-y-3">
                          <div className="grid grid-cols-1 gap-2">
                            {model.elements.map((element) => (
                              <div 
                                key={element.id} 
                                className={`p-3 rounded-md bg-${model.color}-900/30 hover:bg-${model.color}-900/40 transition-colors`}
                                draggable={true}
                                onDragStart={() => setDraggedThreat(element.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h5 className="font-medium">{element.name}</h5>
                                    <p className="text-sm text-blue-300">{element.description}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-3 p-3 bg-blue-950/50 rounded-md">
                            <h5 className="font-medium mb-1">Exemple</h5>
                            <p className="text-sm text-blue-200">{model.example}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="bg-blue-900/20 border border-blue-800 p-5 rounded-lg mt-8">
                  <h3 className="text-lg font-bold mb-3">Exercice pratique</h3>
                  <p className="mb-4">
                    Essayez d'identifier les types de menaces qui pourraient affecter un système de paiement en ligne
                    en utilisant le modèle STRIDE. Faites glisser les éléments du modèle vers cette zone.
                  </p>
                  
                  <div 
                    className="border-2 border-dashed border-blue-700 rounded-lg p-4 min-h-[100px] bg-blue-950/20"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedThreat) {
                        toast({
                          title: "Très bien !",
                          description: `Vous avez identifié une menace de type ${
                            threatModels
                              .flatMap(m => m.elements)
                              .find(e => e.id === draggedThreat)?.name
                          }`,
                        });
                        setUserScore(userScore + 10);
                        setDraggedThreat(null);
                      }
                    }}
                  >
                    <p className="text-center text-blue-400 text-sm">
                      {Object.keys(riskMatrix).length === 0 
                        ? "Faites glisser les éléments ici pour construire votre modèle"
                        : "Excellent travail, continuez à identifier d'autres menaces !"}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    className="border-blue-700 text-blue-300"
                    onClick={() => setCurrentSection("introduction")}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Introduction
                  </Button>
                  
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => {
                      handleMarkCompleted("modelisation");
                      setCurrentSection("analyse");
                    }}
                  >
                    Analyse des risques
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Section Analyse des risques */}
            {currentSection === "analyse" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">📊 Analyse des Risques : Science, Art et Stratégie</h2>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-5 rounded-lg border border-blue-800">
                  <p>
                    L'analyse des risques transforme les menaces abstraites en valeurs quantifiables.
                    C'est l'art de donner forme à l'incertitude, de peser les probabilités et de calculer les impacts.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">L'Alchimie des Risques</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    {riskComponents.map((component) => (
                      <TooltipProvider key={component.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Card className={`bg-blue-900/30 border-blue-800 hover:bg-blue-900/50 transition-colors ${
                              expandedRiskArea === component.id ? 'ring-2 ring-blue-500' : ''
                            }`}>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-md">{component.title}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-xs text-blue-200">{component.description}</p>
                              </CardContent>
                            </Card>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p className="text-xs max-w-[200px]">{component.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">Méthodes d'analyse des risques</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {riskMethods.map((method) => (
                      <Card 
                        key={method.id} 
                        className={`border-${method.color}-800 bg-gradient-to-br from-${method.color}-900/20 to-blue-900/10`}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">{method.name}</CardTitle>
                          <CardDescription className="text-blue-300">Origine: {method.origin}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-blue-200">{method.description}</p>
                          <div>
                            <h4 className="text-sm font-medium mb-2">Approche:</h4>
                            <p className="text-sm text-blue-300">{method.approach}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-2">Points forts:</h4>
                            <ul className="list-disc list-inside text-sm text-blue-300">
                              {method.strengths.map((strength, index) => (
                                <li key={index}>{strength}</li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/20 p-5 rounded-lg border border-amber-800 mt-8">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5 text-amber-400" />
                    Mini-challenge: Matrice des risques
                  </h3>
                  <p className="mb-4">
                    Essayez d'évaluer les risques suivants en cliquant sur la matrice pour indiquer leur sévérité et leur probabilité.
                  </p>
                  
                  <div className="bg-blue-950/40 p-4 rounded-lg">
                    <div className="grid grid-cols-5 gap-1">
                      <div className="col-span-1"></div>
                      {["faible", "moyen", "élevé", "critique"].map((severity) => (
                        <div key={severity} className="text-center text-sm font-medium">
                          {severity.charAt(0).toUpperCase() + severity.slice(1)}
                        </div>
                      ))}
                      
                      {["très probable", "probable", "peu probable", "rare"].map((likelihood) => (
                        <React.Fragment key={likelihood}>
                          <div className="text-right pr-2 text-sm font-medium">
                            {likelihood.charAt(0).toUpperCase() + likelihood.slice(1)}
                          </div>
                          {["faible", "moyen", "élevé", "critique"].map((severity) => {
                            const cellKey = `${severity}-${likelihood}`;
                            const count = riskMatrix[cellKey] || 0;
                            let bgColor = "bg-blue-950/50";
                            
                            const riskLevel = getRiskLevel(severity, likelihood);
                            if (riskLevel.label === "Faible") bgColor = "bg-green-900/50";
                            if (riskLevel.label === "Moyen") bgColor = "bg-amber-900/50";
                            if (riskLevel.label === "Élevé") bgColor = "bg-orange-900/60";
                            if (riskLevel.label === "Critique") bgColor = "bg-red-900/60";
                            
                            return (
                              <div 
                                key={cellKey}
                                className={`aspect-square rounded-md ${bgColor} flex items-center justify-center cursor-pointer hover:opacity-80`}
                                onClick={() => handleRiskMatrixInteraction(severity, likelihood)}
                              >
                                {count > 0 && (
                                  <span className="text-white font-medium text-sm">{count}</span>
                                )}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    className="border-blue-700 text-blue-300"
                    onClick={() => setCurrentSection("modelisation")}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Modélisation des menaces
                  </Button>
                  
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => {
                      handleMarkCompleted("analyse");
                      setCurrentSection("normes");
                    }}
                  >
                    Normes et standards
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Section Normes et standards */}
            {currentSection === "normes" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">📏 Normes et Standards : La Cartographie des Terres Connues</h2>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-5 rounded-lg border border-blue-800">
                  <p>
                    Les normes et standards sont comme des cartes qui nous guident à travers le territoire complexe 
                    de la cybersécurité. Ils représentent la sagesse collective et les meilleures pratiques accumulées
                    au fil des années.
                  </p>
                </div>
                
                <h3 className="text-xl font-bold mb-4 mt-8">Principales normes de sécurité</h3>
                
                <Tabs defaultValue={standards[0].id}>
                  <TabsList className="w-full grid grid-cols-2 md:grid-cols-4">
                    {standards.map(standard => (
                      <TabsTrigger key={standard.id} value={standard.id}>
                        <div className="flex items-center gap-2">
                          {standard.icon}
                          {standard.name}
                        </div>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {standards.map(standard => (
                    <TabsContent key={standard.id} value={standard.id} className="mt-4">
                      <Card className="border-blue-800 bg-gradient-to-r from-blue-900/10 to-indigo-900/10">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {standard.icon}
                                {standard.fullName}
                              </CardTitle>
                              <CardDescription className="text-blue-300">
                                {standard.domain}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <p className="text-blue-200">{standard.description}</p>
                          
                          <div>
                            <h4 className="font-medium mb-2">Exigences principales:</h4>
                            <ul className="space-y-2">
                              {standard.key_requirements.map((req, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
                
                <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-5 mt-8">
                  <h3 className="text-lg font-bold mb-3">Comment choisir le bon standard ?</h3>
                  <p>
                    Le choix d'un standard ou d'une norme dépend de nombreux facteurs : le secteur d'activité, 
                    les exigences réglementaires, la taille de l'organisation, sa maturité en cybersécurité, et ses objectifs spécifiques.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-blue-950/40 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Pour une organisation débutante</h4>
                      <p className="text-sm text-blue-200">
                        Commencez par le NIST CSF ou l'ISO 27001 en mode "gap analysis" pour identifier les écarts et
                        construire une feuille de route progressive.
                      </p>
                    </div>
                    
                    <div className="bg-blue-950/40 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Pour un secteur spécifique</h4>
                      <p className="text-sm text-blue-200">
                        Privilégiez les standards sectoriels comme PCI DSS pour les paiements,
                        HDS pour la santé en France, ou TISAX pour l'automobile.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    className="border-blue-700 text-blue-300"
                    onClick={() => setCurrentSection("analyse")}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Analyse des risques
                  </Button>
                  
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => {
                      handleMarkCompleted("normes");
                      setCurrentSection("atelier");
                    }}
                  >
                    Atelier pratique
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Section Atelier pratique */}
            {currentSection === "atelier" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">🔬 Atelier Pratique : Missions Cybersécurité</h2>
                
                <Alert className="bg-blue-900/30 border-blue-700">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <AlertTitle>Mission d'équipe</AlertTitle>
                  <AlertDescription>
                    Dans cette section, vous allez mettre en pratique les concepts appris en jouant le rôle
                    d'un professionnel de la cybersécurité au sein d'une équipe.
                  </AlertDescription>
                </Alert>
                
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4">Choisissez votre personnage</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {characters.map(character => (
                      <div key={character.id} className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 rounded-lg overflow-hidden border border-blue-800">
                        <div className="p-4">
                          <div className="text-center mb-3">
                            <div className="text-4xl mb-2">{character.avatar}</div>
                            <h4 className="font-bold text-lg">{character.name}</h4>
                            <p className="text-sm text-blue-300">{character.role}</p>
                          </div>
                          
                          <p className="text-xs text-blue-200 mb-3">{character.description}</p>
                          
                          <div className="mt-3">
                            <p className="text-xs font-medium mb-1">Spécialités:</p>
                            <div className="flex flex-wrap gap-1">
                              {character.speciality.map((spec, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-blue-700 bg-blue-900/30">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-blue-950/50 p-3 flex justify-center">
                          <Button 
                            variant={selectedCharacter === character.id ? "default" : "outline"}
                            className={selectedCharacter === character.id ? "bg-blue-700" : "border-blue-700"}
                            size="sm"
                            onClick={() => setSelectedCharacter(character.id)}
                          >
                            {selectedCharacter === character.id ? "Sélectionné" : "Choisir"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedCharacter && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Votre mission</h3>
                  
                  <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-lg p-6 border border-indigo-800">
                    <h4 className="text-lg font-semibold mb-3">Sécurisation d'une plateforme e-commerce</h4>
                    
                    <p className="mb-4">
                      Votre entreprise développe une nouvelle plateforme e-commerce qui traitera des données de cartes
                      bancaires. En tant que {characters.find(c => c.id === selectedCharacter)?.role}, vous devez contribuer
                      à la sécurisation du projet.
                    </p>
                    
                    <div className="bg-blue-950/50 p-4 rounded-lg mb-4">
                      <h5 className="font-medium mb-2">Vos objectifs:</h5>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          <span>Identifier les principales menaces pour la plateforme</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          <span>Évaluer les risques associés aux menaces identifiées</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          <span>Proposer des contrôles adaptés selon les standards du secteur</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-amber-900/20 border border-amber-800/50 p-4 rounded-lg">
                      <h5 className="font-medium mb-2">Contraintes spécifiques:</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• La plateforme doit être conforme à PCI DSS</li>
                        <li>• L'entreprise dispose d'un budget limité pour la sécurité</li>
                        <li>• Le délai de mise en production est de 3 mois</li>
                        <li>• L'application sera hébergée dans le cloud public</li>
                      </ul>
                    </div>
                  </div>
                </div>
                )}
                
                {selectedCharacter && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Recommandations</h3>
                  
                  <div className="mt-4 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 p-5 rounded-lg border border-blue-800">
                    <p className="mb-4">En tant que {characters.find(c => c.id === selectedCharacter)?.role}, quelles recommandations pourriez-vous faire ?</p>
                    
                    <div className="space-y-3">
                      <div className="bg-blue-950/40 p-3 rounded-lg">
                        <h5 className="font-medium mb-2">1. Pour l'identification des menaces</h5>
                        <p className="text-sm text-blue-200">Utiliser la méthodologie STRIDE pour identifier les menaces spécifiques aux applications de paiement en ligne.</p>
                      </div>
                      
                      <div className="bg-blue-950/40 p-3 rounded-lg">
                        <h5 className="font-medium mb-2">2. Pour l'analyse des risques</h5>
                        <p className="text-sm text-blue-200">Appliquer la méthode FAIR pour quantifier les impacts financiers potentiels des incidents de sécurité.</p>
                      </div>
                      
                      <div className="bg-blue-950/40 p-3 rounded-lg">
                        <h5 className="font-medium mb-2">3. Pour les normes et standards</h5>
                        <p className="text-sm text-blue-200">Se concentrer sur les exigences du PCI DSS pour le traitement des données de cartes, complété par les bonnes pratiques de l'ISO 27001.</p>
                      </div>
                      
                      <div className="bg-blue-950/40 p-3 rounded-lg">
                        <h5 className="font-medium mb-2">4. Approche progressive</h5>
                        <p className="text-sm text-blue-200">Développer une feuille de route de sécurité en plusieurs phases, en priorisant les contrôles critiques pour la mise en production initiale.</p>
                      </div>
                    </div>
                  </div>
                </div>
                )}
                
                <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-l-4 border-green-500 p-4 my-4 rounded-r-lg">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-400" />
                    Félicitations !
                  </h3>
                  <p className="text-sm">
                    Vous avez terminé le module sur la modélisation des menaces, l'analyse des risques et les normes de sécurité.
                    Vous avez acquis des connaissances essentielles pour anticiper les menaces, évaluer les risques et naviguer
                    dans le paysage des standards de sécurité.
                  </p>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button 
                    variant="outline" 
                    className="border-blue-700 text-blue-300"
                    onClick={() => setCurrentSection("normes")}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Normes et standards
                  </Button>
                  
                  <Button 
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    onClick={() => {
                      handleMarkCompleted("atelier");
                      setMissionCompleted(true);
                      setShowConfetti(true);
                      toast({
                        title: "Module terminé !",
                        description: "Félicitations, vous avez complété le module sur la modélisation des menaces et l'analyse des risques.",
                      });
                      setTimeout(() => setShowConfetti(false), 3000);
                    }}
                  >
                    Terminer le module
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Composant d'horloge pour le module
const Clock = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
};