import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { 
  AlertCircle, BookOpen, CheckCircle, ChevronLeft, ChevronRight, 
  Shield, Target, Zap, FileText, Sparkles, Brain, Scale, FlaskConical,
  BarChart3, Lightbulb, PieChart, Lock, CheckCheck, Command, MapPin, Compass,
  Clock, BrainCircuit
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
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-blue-300">Chargement du monde des risques...</p>
        </div>
      </div>
    );
  }

  // Rendu principal
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* En-tête du module */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-blue-700"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
            
            <div className="ml-2 flex items-center text-sm text-blue-300">
              <Target className="h-4 w-4 mr-1 text-blue-400" />
              <span>Module avancé</span>
              <span className="mx-2">•</span>
              <Clock className="h-4 w-4 mr-1 text-blue-400" />
              <span>45 min</span>
            </div>
            
            <div className="ml-auto flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-blue-700"
                onClick={() => setShowAiAssistant(true)}
              >
                <BrainCircuit className="h-4 w-4 mr-1 text-blue-400" />
                Assistant IA
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="border-blue-700"
                onClick={() => toast({
                  title: "Module ajouté à vos favoris",
                  description: "Vous retrouverez ce module dans votre espace personnel",
                })}
              >
                <BookOpen className="h-4 w-4 mr-1 text-blue-400" />
                Favoris
              </Button>
            </div>
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <h1 className="text-2xl font-bold">L'Art de la Modélisation des Risques</h1>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-4">
            <div>
              <p className="text-blue-300 mt-1 md:mt-0">
                Explorer l'univers fascinant de l'analyse et de la gestion des risques cyber
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="border-blue-700">
                  <Target className="h-3 w-3 mr-1" />
                  Niveau avancé
                </Badge>
                <Badge variant="outline" className="border-blue-700">
                  <Clock className="h-3 w-3 mr-1" />
                  45 minutes
                </Badge>
                <Badge className="bg-blue-700">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Module interactif
                </Badge>
              </div>
            </div>
            
            <div className="w-full md:w-auto">
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg px-4 py-3 backdrop-blur-sm border border-blue-700/50">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-2">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="text-sm font-medium">Progression</div>
                      <div className="text-xs text-blue-300">{Math.round((completedSections.length / moduleSections.length) * 100)}%</div>
                    </div>
                    <Progress value={(completedSections.length / moduleSections.length) * 100} className="h-1.5 mt-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation entre les sections */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-1 min-w-max">
            {moduleSections.map((section, index) => (
              <Button 
                key={section.id}
                variant={currentSection === section.id ? "default" : "outline"} 
                className={`rounded-full ${currentSection === section.id ? 'bg-blue-700' : 'border-blue-700'}`}
                onClick={() => setCurrentSection(section.id)}
              >
                {section.icon}
                <span className="ml-2">{section.title}</span>
                {completedSections.includes(section.id) && (
                  <CheckCircle className="h-3.5 w-3.5 ml-1.5 text-green-400" />
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Contenu principal du module */}
        <Card className="border-blue-800 bg-blue-950/30 backdrop-blur-sm">
          <CardContent className="p-6">
            {/* Section Introduction */}
            {currentSection === "introduction" && (
              <div className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl blur-xl"></div>
                  <div className="relative bg-gradient-to-r from-blue-900/50 to-indigo-900/50 p-6 rounded-xl border border-blue-700/50">
                    <h2 className="text-2xl font-bold mb-3 text-gradient-blue-purple">Bienvenue dans l'Univers Stratégique des Risques</h2>
                    <p>
                      Imaginez que vous êtes le maître du jeu dans une partie d'échecs contre des adversaires invisibles. 
                      Vos pièces représentent vos actifs, et votre capacité à anticiper les mouvements de l'adversaire 
                      est votre plus grand atout. Dans ce module, vous découvrirez comment devenir un grand stratège 
                      de la cybersécurité grâce à la modélisation des menaces et l'analyse des risques.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 rounded-lg p-4 border border-blue-800/50">
                    <div className="bg-blue-600/20 p-2 rounded-lg inline-block mb-3">
                      <Target className="h-6 w-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Anticipez les Menaces</h3>
                    <p className="text-blue-200">
                      Comme un joueur d'échecs qui prévoit plusieurs coups à l'avance, 
                      vous apprendrez à identifier les menaces avant qu'elles ne se matérialisent.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-900/30 to-indigo-900/10 rounded-lg p-4 border border-indigo-800/50">
                    <div className="bg-indigo-600/20 p-2 rounded-lg inline-block mb-3">
                      <BarChart3 className="h-6 w-6 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Quantifiez l'Incertitude</h3>
                    <p className="text-blue-200">
                      Transformez l'incertain en mesurable. Découvrez comment évaluer 
                      et prioriser les risques pour prendre des décisions éclairées.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 rounded-lg p-4 border border-purple-800/50">
                    <div className="bg-purple-600/20 p-2 rounded-lg inline-block mb-3">
                      <CheckCheck className="h-6 w-6 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Maîtrisez les Standards</h3>
                    <p className="text-blue-200">
                      Les normes sont vos alliées stratégiques. Apprenez à les utiliser 
                      comme une boussole dans le labyrinthe de la sécurité.
                    </p>
                  </div>
                </div>

                <div className="my-8">
                  <Separator className="my-6 bg-blue-800/50" />
                  <h3 className="text-xl font-bold mb-4">Pourquoi ce module est-il crucial ?</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-900/20 p-5 rounded-lg border border-blue-800">
                      <h4 className="font-bold flex items-center mb-3">
                        <Zap className="h-5 w-5 mr-2 text-amber-400" />
                        La Grande Illusion de la Sécurité Parfaite
                      </h4>
                      <p className="text-sm">
                        L'une des plus grandes erreurs en cybersécurité est de croire qu'une protection totale est possible. 
                        La vérité ? Le risque zéro n'existe pas. L'analyse de risque vous permet d'accepter cette réalité 
                        et de concentrer vos ressources là où elles auront le plus d'impact.
                      </p>
                      <div className="mt-3 p-2 bg-blue-950/50 rounded text-xs italic text-blue-300">
                        "Si vous connaissez vos risques et les acceptez en connaissance de cause, 
                        vous n'aurez pas de mauvaises surprises." — Bruce Schneier
                      </div>
                    </div>
                    
                    <div className="bg-blue-900/20 p-5 rounded-lg border border-blue-800">
                      <h4 className="font-bold flex items-center mb-3">
                        <Scale className="h-5 w-5 mr-2 text-green-400" />
                        L'Équilibre Subtil entre Sécurité et Opérations
                      </h4>
                      <p className="text-sm">
                        Trop de sécurité peut paralyser votre organisation, pas assez peut l'exposer à des désastres. 
                        La modélisation des risques est votre gouvernail pour naviguer entre ces deux écueils, 
                        en adaptant votre approche à vos enjeux métier spécifiques.
                      </p>
                      <div className="mt-3 p-2 bg-blue-950/50 rounded text-xs italic text-blue-300">
                        "La sécurité est un compromis. La question n'est pas de savoir si nous devons faire des compromis, 
                        mais lesquels sont acceptables." — Ross Anderson
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-l-4 border-blue-500 p-4 my-4 rounded-r-lg">
                  <h4 className="font-bold text-blue-300">🧠 À retenir</h4>
                  <p className="mt-1">
                    La modélisation des menaces et l'analyse des risques transforment l'art de la défense en une science 
                    stratégique. Elles vous permettent d'être proactif plutôt que réactif, et d'allouer intelligemment 
                    vos ressources limitées pour une protection optimale.
                  </p>
                </div>
                
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
                          lors des phases de conception, mais qui peut être appliqué à tout moment sur un système existant. 
                          Elle transforme l'abstrait en concret, l'invisible en visible.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="my-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-purple-400" />
                    Les Quatre Dimensions de la Modélisation des Menaces
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-blue-900/20 border-blue-800/50">
                      <CardHeader className="pb-2">
                        <div className="bg-blue-800/30 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                          <span className="text-xl font-bold text-blue-300">1</span>
                        </div>
                        <CardTitle>Décomposer le Système</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">
                          Comme un cartographe, commencez par dresser une carte complète du territoire : 
                          composants, flux de données, frontières de confiance, interactions avec l'extérieur.
                        </p>
                        <div className="bg-blue-950/50 p-3 rounded-md">
                          <h5 className="text-sm font-medium mb-1 text-blue-300">Techniques clés</h5>
                          <ul className="list-disc list-inside text-xs space-y-1">
                            <li>Diagrammes de flux de données (DFD)</li>
                            <li>Architecture de sécurité</li>
                            <li>Modélisation des actifs</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-purple-900/20 border-purple-800/50">
                      <CardHeader className="pb-2">
                        <div className="bg-purple-800/30 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                          <span className="text-xl font-bold text-purple-300">2</span>
                        </div>
                        <CardTitle>Identifier les Menaces</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">
                          Tel un stratège militaire, analysez les différentes façons dont un adversaire 
                          pourrait attaquer votre système, en utilisant des modèles comme STRIDE.
                        </p>
                        <div className="bg-purple-950/50 p-3 rounded-md">
                          <h5 className="text-sm font-medium mb-1 text-purple-300">Application pratique</h5>
                          <ul className="list-disc list-inside text-xs space-y-1">
                            <li>Pour chaque composant, posez-vous: "Comment pourrait-il être compromis?"</li>
                            <li>Utilisez les catégories STRIDE sur chaque flux de données</li>
                            <li>Pensez aux motivations des attaquants potentiels</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-indigo-900/20 border-indigo-800/50">
                      <CardHeader className="pb-2">
                        <div className="bg-indigo-800/30 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                          <span className="text-xl font-bold text-indigo-300">3</span>
                        </div>
                        <CardTitle>Évaluer les Contrôles</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">
                          Comme un ingénieur inspectant les défenses d'une forteresse, identifiez 
                          les contrôles existants et évaluez leur efficacité contre les menaces identifiées.
                        </p>
                        <div className="bg-indigo-950/50 p-3 rounded-md">
                          <h5 className="text-sm font-medium mb-1 text-indigo-300">Points d'attention</h5>
                          <ul className="list-disc list-inside text-xs space-y-1">
                            <li>Contrôles préventifs vs détectifs vs correctifs</li>
                            <li>Défense en profondeur et principe du moindre privilège</li>
                            <li>Identification des lacunes dans la protection</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-green-900/20 border-green-800/50">
                      <CardHeader className="pb-2">
                        <div className="bg-green-800/30 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                          <span className="text-xl font-bold text-green-300">4</span>
                        </div>
                        <CardTitle>Prioriser et Documenter</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">
                          À la manière d'un chef de projet, organisez les menaces par ordre de priorité 
                          et documentez clairement vos découvertes pour guider l'implémentation des contrôles.
                        </p>
                        <div className="bg-green-950/50 p-3 rounded-md">
                          <h5 className="text-sm font-medium mb-1 text-green-300">Meilleures pratiques</h5>
                          <ul className="list-disc list-inside text-xs space-y-1">
                            <li>Créez une matrice de menaces avec scores DREAD ou CVSS</li>
                            <li>Documentez les hypothèses et les limitations</li>
                            <li>Maintenez un backlog de sécurité pour le suivi</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <Separator className="my-8 bg-blue-800/50" />
                
                <div>
                  <h3 className="text-xl font-bold mb-4">Les Modèles de Menaces : Votre Arsenal Stratégique</h3>
                  <p className="mb-6">
                    Explorez les différentes approches de modélisation des menaces, chacune offrant un angle unique pour identifier et comprendre les menaces potentielles.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {threatModels.map((model) => (
                      <Card key={model.id} className={`border border-${model.color}-800 bg-${model.color}-900/10`}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-md bg-${model.color}-900/50`}>
                                {model.icon}
                              </div>
                              <div>
                                <CardTitle>{model.name}</CardTitle>
                                <CardDescription>{model.description}</CardDescription>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setExpandedModel(expandedModel === model.id ? null : model.id)}
                            >
                              {expandedModel === model.id ? (
                                <ChevronLeft className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        
                        {expandedModel === model.id && (
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2 text-sm">Composantes du modèle</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                  {model.elements.map((element) => (
                                    <div 
                                      key={element.id} 
                                      className={`p-3 rounded-md bg-${model.color}-900/20 border border-${model.color}-800/30`}
                                    >
                                      <div className="font-medium text-sm">{element.name}</div>
                                      <div className="text-xs mt-1 text-blue-300">{element.description}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="bg-blue-950/50 p-3 rounded-md">
                                <h4 className="font-medium mb-1 text-sm">Exemple concret</h4>
                                <p className="text-xs italic">{model.example}</p>
                              </div>
                              
                              <div className="mt-4 p-3 bg-blue-950/40 rounded-lg">
                                <h4 className="font-medium mb-1 text-sm flex items-center">
                                  <Lightbulb className="h-4 w-4 mr-1 text-amber-400" />
                                  Quand utiliser ce modèle ?
                                </h4>
                                {model.id === "stride" && (
                                  <p className="text-xs">
                                    Idéal pour les systèmes complexes où vous devez identifier méthodiquement 
                                    tous les types de menaces. Particulièrement efficace pour les développeurs 
                                    qui cherchent à intégrer la sécurité dans leur code.
                                  </p>
                                )}
                                {model.id === "pasta" && (
                                  <p className="text-xs">
                                    Parfait pour une approche centrée sur les risques métier, où l'impact 
                                    business des attaques est primordial. Convient aux projets de grande 
                                    envergure nécessitant une analyse approfondie.
                                  </p>
                                )}
                                {model.id === "linddun" && (
                                  <p className="text-xs">
                                    Essentiel pour les systèmes manipulant des données personnelles 
                                    ou sensibles. Utilisez LINDDUN lorsque la confidentialité et la 
                                    conformité réglementaire sont des enjeux critiques.
                                  </p>
                                )}
                                {model.id === "octave" && (
                                  <p className="text-xs">
                                    Adapté aux organisations qui souhaitent une approche holistique 
                                    intégrant les perspectives business et techniques. Excellent pour 
                                    créer une vision partagée des risques entre équipes.
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div className="mt-8 p-5 bg-blue-900/30 rounded-lg border border-blue-800">
                  <h3 className="text-lg font-bold mb-3 flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-blue-400" />
                    Au-delà des Modèles : L'Art de Penser comme un Adversaire
                  </h3>
                  <p className="mb-3">
                    Les modèles ne sont que des outils. La véritable compétence réside dans votre capacité à 
                    adopter l'état d'esprit d'un attaquant tout en conservant la rigueur d'un défenseur.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-blue-950/50 p-3 rounded-md">
                      <h4 className="font-medium text-blue-300 mb-2">Exercice "Red Team" Mental</h4>
                      <p className="text-sm">
                        Pour chaque composant, posez-vous: "Si j'étais un attaquant motivé avec des 
                        connaissances approfondies, comment exploiterais-je ce système?" Cette pratique 
                        vous aidera à développer une intuition pour les vulnérabilités qui échappent aux approches formelles.
                      </p>
                    </div>
                    <div className="bg-blue-950/50 p-3 rounded-md">
                      <h4 className="font-medium text-blue-300 mb-2">Approche Systémique</h4>
                      <p className="text-sm">
                        N'oubliez jamais que les menaces les plus dangereuses exploitent souvent les 
                        interactions entre différents composants. La sécurité de chaque élément 
                        individuellement ne garantit pas la sécurité du système dans son ensemble.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 text-center">
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                    onClick={() => {
                      handleMarkCompleted("modelisation");
                      setCurrentSection("analyse");
                      setUserScore(userScore + 10);
                      toast({
                        title: "Niveau débloqué !",
                        description: "Vous avez gagné 10 points et débloqué la section Analyse des risques",
                      });
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Maîtriser la modélisation des menaces
                  </Button>
                </div>
              </div>
                <h2 className="text-2xl font-bold mb-4">🎯 Modélisation des Menaces : L'Art de Penser comme l'Adversaire</h2>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-5 rounded-lg border border-blue-800">
                  <p>
                    La modélisation des menaces est comme un jeu d'échecs mental où vous anticipez les mouvements de vos adversaires.
                    Cette discipline vous permet d'identifier méthodiquement les menaces potentielles, les vecteurs d'attaque, et les contre-mesures appropriées.
                  </p>

                  <Alert className="mt-4 bg-amber-900/30 border-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                    <AlertTitle className="text-amber-400">Principe fondamental</AlertTitle>
                    <AlertDescription>
                      Penser comme un attaquant est l'essence même de la modélisation des menaces. 
                      C'est adopter leur perspective pour découvrir des vulnérabilités que vous n'auriez pas vues autrement.
                    </AlertDescription>
                  </Alert>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Les Grands Modèles Stratégiques</h3>
                  <p className="mb-4">
                    Plusieurs frameworks existent pour structurer votre réflexion. Chacun a ses forces et faiblesses, 
                    comme différentes écoles d'arts martiaux adaptées à des situations spécifiques.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 mt-6">
                    {threatModels.map((model) => (
                      <div key={model.id} className="rounded-lg overflow-hidden">
                        <div 
                          className={`cursor-pointer bg-${model.color}-900/20 p-4 border border-${model.color}-800/50 rounded-lg transition-all`}
                          onClick={() => setExpandedModel(expandedModel === model.id ? null : model.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {model.icon}
                              <div>
                                <h4 className="font-bold text-lg">{model.name}</h4>
                                <p className="text-sm text-blue-300">{model.description}</p>
                              </div>
                            </div>
                            <ChevronRight className={`h-5 w-5 transition-transform ${expandedModel === model.id ? 'rotate-90' : ''}`} />
                          </div>
                        </div>
                        
                        {expandedModel === model.id && (
                          <div className={`bg-${model.color}-900/10 p-5 rounded-b-lg border-x border-b border-${model.color}-800/50 mt-px`}>
                            <h5 className="font-medium mb-3">Composantes clés :</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {model.elements.map((element) => (
                                <div key={element.id} className={`bg-${model.color}-900/20 p-3 rounded-lg`}>
                                  <h6 className={`font-medium text-${model.color}-300`}>{element.name}</h6>
                                  <p className="text-sm">{element.description}</p>
                                </div>
                              ))}
                            </div>
                            
                            <div className="mt-4 p-3 bg-blue-950/40 rounded-lg">
                              <h5 className="font-medium mb-1 flex items-center">
                                <Lightbulb className="h-4 w-4 mr-1 text-yellow-400" />
                                Exemple concret
                              </h5>
                              <p className="text-sm italic">{model.example}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">🎮 Mini-jeu interactif : Le Chasseur de Menaces</h3>
                  <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg p-6 border border-blue-800">
                    <p className="mb-4">
                      Mettez-vous dans la peau d'un attaquant ciblant un système de paiement en ligne. 
                      Identifiez les menaces potentielles en utilisant le modèle STRIDE.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-950/40 p-4 rounded-lg border border-blue-800">
                        <h4 className="font-medium mb-3">Vecteurs d'attaque potentiels</h4>
                        <div className="space-y-2">
                          {threatModels[0].elements.map((threat) => (
                            <div 
                              key={threat.id}
                              className="p-2 bg-blue-900/20 rounded cursor-grab hover:bg-blue-800/30 transition-colors"
                              draggable
                              onDragStart={() => setDraggedThreat(threat.id)}
                            >
                              <div className="flex items-center justify-between">
                                <span>{threat.name}</span>
                                <Zap className="h-4 w-4 text-amber-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-900/10 to-indigo-900/10 p-4 rounded-lg border border-blue-800">
                        <h4 className="font-medium mb-3">Système de paiement en ligne</h4>
                        <div className="relative h-60 border-2 border-dashed border-blue-700 rounded-lg flex items-center justify-center">
                          <div 
                            className="absolute inset-0 flex items-center justify-center"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (draggedThreat) {
                                const threat = threatModels[0].elements.find(t => t.id === draggedThreat);
                                if (threat) {
                                  toast({
                                    title: `Menace identifiée : ${threat.name}`,
                                    description: `Vous avez correctement identifié une vulnérabilité de type ${threat.name}`,
                                  });
                                }
                                setDraggedThreat(null);
                              }
                            }}
                          >
                            <div className="text-center">
                              <Target className="h-16 w-16 mx-auto text-blue-500/70 mb-3" />
                              <p className="text-sm text-blue-400">Faites glisser les menaces ici pour les identifier</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-l-4 border-indigo-500 p-4 my-4 rounded-r-lg">
                  <h4 className="font-bold text-indigo-300">🎯 À retenir</h4>
                  <p className="mt-1">
                    La modélisation des menaces n'est pas une étape ponctuelle mais un processus continu. 
                    Comme un grand maître d'échecs qui s'adapte aux mouvements de son adversaire, 
                    vous devez constamment réévaluer les menaces dans un paysage cybernétique en évolution.
                  </p>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button 
                    variant="outline" 
                    className="border-blue-700"
                    onClick={() => setCurrentSection("introduction")}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Section précédente
                  </Button>
                  
                  <Button
                    onClick={() => handleMarkCompleted("modelisation")}
                    className="bg-blue-700 hover:bg-blue-800"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Marquer comme terminé
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="border-blue-700"
                    onClick={() => {
                      handleMarkCompleted("modelisation");
                      setCurrentSection("analyse");
                    }}
                  >
                    Section suivante
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
                            <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800 hover:bg-blue-800/30 transition-colors cursor-help">
                              <h4 className="font-bold text-center mb-2">{component.title}</h4>
                              <p className="text-sm text-center">{component.description}</p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm max-w-xs">{component.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>

                  <div className="bg-blue-900/10 p-5 rounded-lg border border-blue-800 mb-8">
                    <h4 className="font-bold mb-3 flex items-center">
                      <Scale className="h-5 w-5 mr-2 text-blue-400" />
                      La formule fondamentale du risque
                    </h4>
                    
                    <div className="bg-blue-950/50 p-3 rounded-lg text-center">
                      <p className="text-lg font-mono">
                        Risque = Probabilité × Impact
                      </p>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2 text-blue-300">Probabilité</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Fréquence d'occurrence attendue</li>
                          <li>Facilité d'exploitation des vulnérabilités</li>
                          <li>Motivation et capacités des attaquants</li>
                          <li>Contrôles préventifs existants</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2 text-blue-300">Impact</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Pertes financières directes et indirectes</li>
                          <li>Atteinte à la réputation</li>
                          <li>Perturbation opérationnelle</li>
                          <li>Implications légales et réglementaires</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">Les Écoles de Pensée</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {riskMethods.map((method) => (
                      <div key={method.id} className={`bg-${method.color}-900/20 p-4 rounded-lg border border-${method.color}-800`}>
                        <h4 className="font-bold flex items-center gap-2">
                          <span className={`h-3 w-3 rounded-full bg-${method.color}-500`}></span>
                          {method.name}
                        </h4>
                        <p className="text-sm text-blue-200 mb-1">Origine : {method.origin}</p>
                        <p className="mb-3">{method.description}</p>
                        
                        <div className="bg-blue-950/40 p-3 rounded-lg">
                          <h5 className="font-medium mb-2 text-blue-300">Approche</h5>
                          <p className="text-sm">{method.approach}</p>
                          
                          <h5 className="font-medium mt-3 mb-2 text-blue-300">Forces</h5>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {method.strengths.map((strength, index) => (
                              <li key={index}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">🎮 La Matrice des Risques Interactive</h3>
                  
                  <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg p-6 border border-blue-800">
                    <p className="mb-4">
                      Expérimentez avec la matrice de risques ci-dessous. Cliquez sur les cellules pour simuler l'identification 
                      de risques avec différents niveaux de sévérité et de probabilité.
                    </p>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="p-2 border border-blue-700"></th>
                            <th className="p-2 border border-blue-700 bg-blue-900/30">Rare</th>
                            <th className="p-2 border border-blue-700 bg-blue-900/30">Peu Probable</th>
                            <th className="p-2 border border-blue-700 bg-blue-900/30">Probable</th>
                            <th className="p-2 border border-blue-700 bg-blue-900/30">Très Probable</th>
                          </tr>
                        </thead>
                        <tbody>
                          {["faible", "moyen", "élevé", "critique"].map((severity, sIndex) => (
                            <tr key={severity}>
                              <td className="p-2 border border-blue-700 bg-blue-900/30 font-medium">
                                {severity.charAt(0).toUpperCase() + severity.slice(1)}
                              </td>
                              {["rare", "peu probable", "probable", "très probable"].map((likelihood, lIndex) => {
                                const key = `${severity}-${likelihood}`;
                                const riskLevel = getRiskLevel(severity, likelihood);
                                let bgColor = "bg-blue-900/20";
                                
                                if (riskLevel.label === "Faible") bgColor = "bg-blue-900/20";
                                if (riskLevel.label === "Moyen") bgColor = "bg-yellow-900/20";
                                if (riskLevel.label === "Élevé") bgColor = "bg-orange-900/20";
                                if (riskLevel.label === "Critique") bgColor = "bg-red-900/20";
                                
                                return (
                                  <td 
                                    key={likelihood}
                                    className={`p-3 border border-blue-700 text-center ${bgColor} hover:opacity-80 cursor-pointer transition-opacity`}
                                    onClick={() => handleRiskMatrixInteraction(severity, likelihood)}
                                  >
                                    <div className="font-medium">{riskLevel.label}</div>
                                    {riskMatrix[key] && (
                                      <div className="mt-1 text-xs">
                                        {riskMatrix[key]} risque{riskMatrix[key] > 1 ? 's' : ''} identifié{riskMatrix[key] > 1 ? 's' : ''}
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-900/20 mr-2"></div>
                        <span>Risque faible</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-900/20 mr-2"></div>
                        <span>Risque moyen</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-orange-900/20 mr-2"></div>
                        <span>Risque élevé</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-900/20 mr-2"></div>
                        <span>Risque critique</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-l-4 border-teal-500 p-4 my-4 rounded-r-lg">
                  <h4 className="font-bold text-teal-300">📊 À retenir</h4>
                  <p className="mt-1">
                    L'analyse des risques est à la fois une science exacte et un art de l'interprétation. 
                    Les chiffres ne racontent qu'une partie de l'histoire ; votre expertise et votre 
                    compréhension du contexte sont essentielles pour donner du sens aux données.
                  </p>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button 
                    variant="outline" 
                    className="border-blue-700"
                    onClick={() => setCurrentSection("modelisation")}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Section précédente
                  </Button>
                  
                  <Button
                    onClick={() => handleMarkCompleted("analyse")}
                    className="bg-blue-700 hover:bg-blue-800"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Marquer comme terminé
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="border-blue-700"
                    onClick={() => {
                      handleMarkCompleted("analyse");
                      setCurrentSection("normes");
                    }}
                  >
                    Section suivante
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
                    Les normes de sécurité sont comme des cartes détaillées réalisées par de nombreux explorateurs 
                    avant vous. Elles vous évitent de réinventer la roue et vous offrent un cadre éprouvé pour structurer 
                    votre approche de la gestion des risques.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">Les Piliers de la Sagesse Collective</h3>
                  
                  <Tabs defaultValue="iso27001" className="mt-6">
                    <TabsList className="grid grid-cols-2 md:grid-cols-4 bg-blue-950/50">
                      {standards.map(standard => (
                        <TabsTrigger key={standard.id} value={standard.id} className="flex items-center gap-2">
                          {standard.icon}
                          <span>{standard.name}</span>
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
                              <Badge variant="outline" className="border-blue-700">
                                Standard international
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p>{standard.description}</p>
                            
                            <div className="mt-4">
                              <h5 className="font-medium mb-2">Principales exigences :</h5>
                              <ul className="space-y-2">
                                {standard.key_requirements.map((req, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <div className="mt-1 h-4 w-4 rounded-full bg-blue-700 flex items-center justify-center flex-shrink-0">
                                      <span className="text-[10px] font-bold">{index + 1}</span>
                                    </div>
                                    <span>{req}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                          <CardFooter className="bg-blue-950/30 flex justify-between">
                            <p className="text-sm text-blue-300">
                              <FileText className="h-4 w-4 inline mr-1" />
                              Documentation complète disponible
                            </p>
                            <Button variant="outline" className="border-blue-700">
                              Ressources supplémentaires
                            </Button>
                          </CardFooter>
                        </Card>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">L'Interconnexion des Standards</h3>
                  
                  <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg p-6 border border-blue-800">
                    <p className="mb-6">
                      Les normes et standards ne sont pas des îles isolées mais forment un archipel interconnecté. 
                      Comprendre leurs relations vous permet de construire un système de gestion intégré et cohérent.
                    </p>
                    
                    <div className="bg-blue-950/50 p-5 rounded-lg relative overflow-hidden">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3 text-blue-300">Gouvernance et Management</h4>
                          <div className="bg-blue-900/30 p-3 rounded-lg mb-3 border border-blue-800">
                            <h5 className="font-medium flex items-center">
                              <Shield className="h-4 w-4 mr-1 text-blue-400" />
                              ISO 27001
                            </h5>
                            <p className="text-sm mt-1">Cadre global de gouvernance de la sécurité</p>
                          </div>
                          
                          <div className="pl-6 space-y-3">
                            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-800">
                              <h5 className="font-medium text-sm flex items-center">
                                <Target className="h-3 w-3 mr-1 text-red-400" />
                                ISO 27005
                              </h5>
                              <p className="text-xs mt-1">Méthodologie de gestion des risques</p>
                            </div>
                            
                            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-800">
                              <h5 className="font-medium text-sm flex items-center">
                                <Command className="h-3 w-3 mr-1 text-green-400" />
                                NIST CSF
                              </h5>
                              <p className="text-xs mt-1">Framework opérationnel</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3 text-blue-300">Domaines Spécifiques</h4>
                          <div className="space-y-3">
                            <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-800">
                              <h5 className="font-medium flex items-center">
                                <Zap className="h-4 w-4 mr-1 text-yellow-400" />
                                PCI DSS
                              </h5>
                              <p className="text-sm mt-1">Sécurité des cartes de paiement</p>
                            </div>
                            
                            <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-800">
                              <h5 className="font-medium flex items-center">
                                <FileText className="h-4 w-4 mr-1 text-purple-400" />
                                RGPD
                              </h5>
                              <p className="text-sm mt-1">Protection des données personnelles</p>
                            </div>
                            
                            <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-800">
                              <h5 className="font-medium flex items-center">
                                <Target className="h-4 w-4 mr-1 text-blue-400" />
                                NIS 2
                              </h5>
                              <p className="text-sm mt-1">Sécurité des réseaux et systèmes d'information</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Lignes de connexion stylisées */}
                      <div className="absolute inset-0 pointer-events-none">
                        <svg width="100%" height="100%" className="absolute inset-0">
                          <path d="M200,80 C250,80 250,180 300,180" stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeDasharray="4,4" />
                          <path d="M200,80 C250,80 250,240 300,240" stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeDasharray="4,4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">🧩 L'Art de la Conformité Stratégique</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-900/20 to-blue-900/10 p-5 rounded-lg border border-blue-800">
                      <h4 className="font-bold flex items-center mb-3">
                        <CheckCheck className="h-5 w-5 mr-2 text-green-400" />
                        Approche éclairée vs approche mécanique
                      </h4>
                      <p className="text-sm">
                        La vraie conformité ne consiste pas à cocher des cases, mais à comprendre l'esprit des normes 
                        et à les adapter intelligemment à votre contexte. Une approche mécanique crée une illusion 
                        de sécurité ; une approche éclairée transforme les standards en avantage stratégique.
                      </p>
                      <div className="mt-3 p-3 bg-blue-950/50 rounded text-xs italic text-blue-300">
                        "La conformité sans compréhension est comme suivre une carte sans connaître sa destination."
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-900/20 to-indigo-900/10 p-5 rounded-lg border border-indigo-800">
                      <h4 className="font-bold flex items-center mb-3">
                        <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
                        Transformer les contraintes en opportunités
                      </h4>
                      <p className="text-sm">
                        Les exigences des normes peuvent sembler contraignantes, mais elles sont aussi l'occasion de 
                        repenser vos processus, d'innover dans vos approches sécuritaires, et de créer un avantage 
                        concurrentiel basé sur la confiance et la résilience.
                      </p>
                      <div className="mt-3 p-3 bg-blue-950/50 rounded text-xs italic text-blue-300">
                        "La sécurité n'est pas une destination mais un voyage continu d'amélioration."
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-l-4 border-purple-500 p-4 my-4 rounded-r-lg">
                  <h4 className="font-bold text-purple-300">📏 À retenir</h4>
                  <p className="mt-1">
                    Les normes et standards sont des guides, pas des dogmes. Ils offrent une base solide de connaissances 
                    collectives et de meilleures pratiques, mais c'est votre intelligence stratégique qui transformera 
                    ces directives en un système de défense adapté à vos enjeux spécifiques.
                  </p>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button 
                    variant="outline" 
                    className="border-blue-700"
                    onClick={() => setCurrentSection("analyse")}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Section précédente
                  </Button>
                  
                  <Button
                    onClick={() => handleMarkCompleted("normes")}
                    className="bg-blue-700 hover:bg-blue-800"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Marquer comme terminé
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="border-blue-700"
                    onClick={() => {
                      handleMarkCompleted("normes");
                      setCurrentSection("atelier");
                    }}
                  >
                    Section suivante
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Section Atelier pratique */}
            {currentSection === "atelier" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">🧪 Atelier Pratique : Le Grand Conseil des Stratèges</h2>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-5 rounded-lg border border-blue-800">
                  <p>
                    Bienvenue dans le "Grand Conseil des Stratèges", une simulation immersive où vous allez mettre 
                    en pratique tout ce que vous avez appris. Vous incarnerez différents rôles dans une équipe de 
                    gestion des risques face à un scénario critique.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-4">🎭 Les Protagonistes</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {characters.map(character => (
                      <div key={character.id} className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 rounded-lg overflow-hidden border border-blue-800">
                        <div className="p-4">
                          <div className="text-center mb-3">
                            <div className="text-4xl mb-2">{character.avatar}</div>
                            <h4 className="font-bold">{character.name}</h4>
                            <p className="text-sm text-blue-300">{character.role}</p>
                          </div>
                          
                          <p className="text-sm">{character.description}</p>
                          
                          <div className="mt-3">
                            <h5 className="text-xs font-medium text-blue-400 mb-1">Spécialités :</h5>
                            <div className="flex flex-wrap gap-1">
                              {character.speciality.map((spec, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-blue-700">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-blue-950/50 p-3 flex justify-center">
                          <Button variant="outline" size="sm" className="border-blue-700 text-sm">
                            Choisir ce personnage
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">📜 Le Scénario</h3>
                  
                  <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-lg p-6 border border-indigo-800">
                    <h4 className="text-lg font-semibold mb-3 text-purple-300">
                      Crise imminente : Fusion-acquisition et risques cachés
                    </h4>
                    
                    <p className="mb-4">
                      Votre entreprise, une société de technologie financière en pleine croissance, est sur le point 
                      d'acquérir une startup prometteuse spécialisée dans les paiements mobiles. Mais à quelques jours 
                      de la signature finale, votre équipe de due diligence a découvert des problèmes potentiels de 
                      sécurité dans les systèmes de la cible d'acquisition.
                    </p>
                    
                    <div className="bg-blue-950/50 p-4 rounded-lg mb-4">
                      <h5 className="font-medium mb-2 text-blue-300">Éléments découverts :</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Absence d'une politique formelle de gestion des risques</li>
                        <li>Plusieurs vulnérabilités critiques non corrigées dans l'application principale</li>
                        <li>Aucune certification PCI DSS malgré le traitement de données de paiement</li>
                        <li>Incidents de sécurité précédents non documentés, mentionnés officieusement par un employé</li>
                        <li>Architecture de sécurité inadéquate pour protéger les données sensibles</li>
                      </ul>
                    </div>
                    
                    <div className="bg-amber-900/20 border border-amber-800/50 p-4 rounded-lg">
                      <h5 className="font-medium mb-2 text-amber-300">Votre mission :</h5>
                      <p className="text-sm">
                        En tant qu'équipe de gestion des risques, vous devez rapidement :
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-sm mt-2">
                        <li>Réaliser une modélisation des menaces pour identifier les risques potentiels</li>
                        <li>Effectuer une analyse quantitative des risques pour évaluer l'impact financier</li>
                        <li>Proposer une stratégie de traitement des risques (accepter, transférer, éviter, réduire)</li>
                        <li>Élaborer un plan de mise en conformité aux normes pertinentes</li>
                        <li>Préparer une présentation au comité exécutif qui doit prendre la décision finale</li>
                      </ol>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">🎮 Simulation Interactive</h3>
                  
                  <Alert className="bg-blue-900/20 border-blue-700">
                    <Lightbulb className="h-4 w-4 text-blue-400" />
                    <AlertTitle>Simulation immersive</AlertTitle>
                    <AlertDescription>
                      Cette section sera bientôt disponible avec une simulation interactive complète où vous pourrez 
                      incarner chaque personnage et prendre des décisions stratégiques dans un scénario évolutif.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="mt-4 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 p-5 rounded-lg border border-blue-800">
                    <h4 className="font-bold mb-3">En attendant, réfléchissez à ces questions :</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-blue-950/40 p-3 rounded-lg">
                        <p className="text-blue-200">
                          1. Quelle méthodologie de modélisation des menaces serait la plus adaptée à ce scénario et pourquoi ?
                        </p>
                      </div>
                      
                      <div className="bg-blue-950/40 p-3 rounded-lg">
                        <p className="text-blue-200">
                          2. Comment quantifieriez-vous l'impact financier des risques de sécurité dans le cadre 
                             d'une fusion-acquisition ?
                        </p>
                      </div>
                      
                      <div className="bg-blue-950/40 p-3 rounded-lg">
                        <p className="text-blue-200">
                          3. Quelles normes et standards seraient les plus pertinents pour structurer votre analyse 
                             et justifier vos recommandations ?
                        </p>
                      </div>
                      
                      <div className="bg-blue-950/40 p-3 rounded-lg">
                        <p className="text-blue-200">
                          4. Comment présenteriez-vous les risques identifiés à des décideurs non techniques 
                             pour qu'ils comprennent les enjeux sans être submergés par les détails techniques ?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-l-4 border-green-500 p-4 my-4 rounded-r-lg">
                  <h4 className="font-bold text-green-300">🏆 Conclusion du module</h4>
                  <p className="mt-1">
                    Félicitations ! Vous avez parcouru les territoires complexes de la modélisation des menaces, 
                    de l'analyse des risques et des standards de sécurité. Ces compétences font partie des plus 
                    stratégiques et les plus valorisées dans le domaine de la cybersécurité, car elles transforment 
                    la sécurité d'un centre de coûts en un véritable avantage compétitif.
                  </p>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button 
                    variant="outline" 
                    className="border-blue-700"
                    onClick={() => setCurrentSection("normes")}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Section précédente
                  </Button>
                  
                  <Button
                    onClick={() => handleMarkCompleted("atelier")}
                    className="bg-blue-700 hover:bg-blue-800"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Marquer comme terminé
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="border-blue-700"
                    onClick={() => window.history.back()}
                  >
                    Retour au centre d'apprentissage
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
};