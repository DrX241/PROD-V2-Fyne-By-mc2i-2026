import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { 
  AlertCircle, CheckCircle, ChevronLeft, ChevronRight, 
  Target, Sparkles, BarChart3, PieChart, LineChart,
  ArrowBigUp, ArrowBigDown, TrendingUp, TrendingDown, Activity,
  Lightbulb, Calculator, Clock, FileBarChart, BarChart4
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Types pour le module
interface RiskFactor {
  id: string;
  name: string;
  description: string;
  impact: number;
  probability: number;
}

interface RiskCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  factors: RiskFactor[];
}

interface AnalysisMethod {
  id: string;
  name: string;
  description: string;
  advantages: string[];
  disadvantages: string[];
  icon: React.ReactNode;
}

// Composant principal
export default function AnalyseRisques() {
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState<string>("introduction");
  const [selectedRiskFactor, setSelectedRiskFactor] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [userScore, setUserScore] = useState<number>(0);
  const [userRank, setUserRank] = useState<string>("Analyste Débutant");
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("qualitative");
  const [userRiskAssessments, setUserRiskAssessments] = useState<{[key: string]: {impact: number; probability: number}}>({});

  // Sections du module
  const moduleSections = [
    { id: "introduction", title: "Introduction", icon: <BarChart3 className="h-4 w-4" /> },
    { id: "concepts", title: "Concepts fondamentaux", icon: <Lightbulb className="h-4 w-4" /> },
    { id: "methodes", title: "Méthodes d'analyse", icon: <FileBarChart className="h-4 w-4" /> },
    { id: "pratique", title: "Mise en pratique", icon: <Activity className="h-4 w-4" /> },
    { id: "conclusion", title: "Ressources et outils", icon: <CheckCircle className="h-4 w-4" /> },
  ];

  // Catégories de risques pour l'analyse
  const riskCategories: RiskCategory[] = [
    {
      id: "technique",
      name: "Risques techniques",
      icon: <BarChart4 className="h-5 w-5 text-blue-400" />,
      factors: [
        { 
          id: "vuln-logiciel", 
          name: "Vulnérabilités logicielles", 
          description: "Failles dans les applications et systèmes d'exploitation.",
          impact: 4,
          probability: 3
        },
        { 
          id: "config-incorrect", 
          name: "Configurations incorrectes", 
          description: "Erreurs dans les paramètres de sécurité des systèmes.",
          impact: 3,
          probability: 4
        },
        { 
          id: "obsolescence", 
          name: "Obsolescence technologique", 
          description: "Composants en fin de vie ou non maintenus.",
          impact: 3,
          probability: 2
        }
      ]
    },
    {
      id: "humain",
      name: "Risques humains",
      icon: <Target className="h-5 w-5 text-red-400" />,
      factors: [
        { 
          id: "erreur-utilisateur", 
          name: "Erreurs utilisateurs", 
          description: "Actions involontaires compromettant la sécurité.",
          impact: 3,
          probability: 4
        },
        { 
          id: "phishing", 
          name: "Phishing et ingénierie sociale", 
          description: "Manipulation psychologique pour obtenir des accès.",
          impact: 4,
          probability: 3
        },
        { 
          id: "malveillance", 
          name: "Malveillance interne", 
          description: "Actions délibérées de la part d'employés ou prestataires.",
          impact: 5,
          probability: 2
        }
      ]
    },
    {
      id: "organisationnel",
      name: "Risques organisationnels",
      icon: <PieChart className="h-5 w-5 text-purple-400" />,
      factors: [
        { 
          id: "procedures", 
          name: "Procédures inadaptées", 
          description: "Absence ou insuffisance des processus de sécurité.",
          impact: 3,
          probability: 3
        },
        { 
          id: "gouvernance", 
          name: "Gouvernance insuffisante", 
          description: "Manque de vision stratégique et d'engagement.",
          impact: 4,
          probability: 2
        },
        { 
          id: "conformite", 
          name: "Non-conformité réglementaire", 
          description: "Non-respect des obligations légales.",
          impact: 4,
          probability: 3
        }
      ]
    }
  ];

  // Méthodes d'analyse de risques
  const analysisMethods: AnalysisMethod[] = [
    {
      id: "qualitative",
      name: "Analyse qualitative",
      description: "Évaluation des risques basée sur des échelles descriptives comme Faible/Moyen/Élevé.",
      advantages: [
        "Facile à mettre en œuvre",
        "Compréhensible par tous les niveaux de l'organisation",
        "Rapide à réaliser"
      ],
      disadvantages: [
        "Subjectivité élevée",
        "Difficile de comparer des risques de nature différente",
        "Moins précis pour la priorisation fine"
      ],
      icon: <LineChart className="h-6 w-6 text-blue-500" />
    },
    {
      id: "quantitative",
      name: "Analyse quantitative",
      description: "Évaluation des risques basée sur des valeurs numériques et financières.",
      advantages: [
        "Permet une comparaison objective entre risques",
        "Facilite les analyses coûts/bénéfices",
        "Fournit des métriques précises pour le suivi"
      ],
      disadvantages: [
        "Nécessite beaucoup de données",
        "Complexe à mettre en œuvre",
        "Peut donner une fausse impression de précision"
      ],
      icon: <Calculator className="h-6 w-6 text-green-500" />
    },
    {
      id: "semi-quantitative",
      name: "Analyse semi-quantitative",
      description: "Approche hybride utilisant des échelles numériques pour des évaluations qualitatives.",
      advantages: [
        "Bon équilibre entre simplicité et précision",
        "Adaptable à différents contextes",
        "Meilleure comparabilité que les méthodes purement qualitatives"
      ],
      disadvantages: [
        "Peut toujours contenir des biais subjectifs",
        "Nécessite une définition claire des échelles",
        "Difficulté à calibrer les échelles de manière cohérente"
      ],
      icon: <Activity className="h-6 w-6 text-amber-500" />
    }
  ];

  // On va simuler un petit délai de chargement
  const { data: moduleData, isLoading } = useQuery({
    queryKey: ["/api/cyber/modules/analyse-risques"],
    queryFn: () => new Promise(resolve => setTimeout(() => resolve({}), 600)),
  });

  // Simule la progression
  const handleMarkCompleted = (section: string) => {
    if (!completedSections.includes(section)) {
      const updatedSections = [...completedSections, section];
      setCompletedSections(updatedSections);
      
      toast({
        title: "Section complétée !",
        description: `Vous avez terminé la section "${moduleSections.find(s => s.id === section)?.title}"`,
      });
      
      // Mise à jour du rang en fonction de la progression
      if (updatedSections.length >= 2) setUserRank("Analyste Intermédiaire");
      if (updatedSections.length >= 4) setUserRank("Analyste Expert");
      
      setUserScore(userScore + 25);
    }
  };

  // Calculer le score de risque
  const calculateRiskScore = (impact: number, probability: number) => {
    return impact * probability;
  };

  // Obtenir la classe de couleur en fonction du score de risque
  const getRiskColorClass = (score: number) => {
    if (score <= 4) return "bg-green-500/20 text-green-400";
    if (score <= 9) return "bg-yellow-500/20 text-yellow-400";
    if (score <= 14) return "bg-orange-500/20 text-orange-400";
    return "bg-red-500/20 text-red-400";
  };

  // Gérer l'évaluation d'un risque par l'utilisateur
  const handleUserRiskAssessment = (factorId: string, field: 'impact' | 'probability', value: number) => {
    setUserRiskAssessments(prev => ({
      ...prev,
      [factorId]: {
        ...prev[factorId] || { impact: 3, probability: 3 },
        [field]: value
      }
    }));
    
    toast({
      title: "Évaluation mise à jour",
      description: `Vous avez évalué le ${field === 'impact' ? 'niveau d\'impact' : 'niveau de probabilité'} à ${value}/5`,
    });
    
    // Ajouter des points si l'évaluation est proche de la "réalité"
    const factor = riskCategories.flatMap(c => c.factors).find(f => f.id === factorId);
    if (factor && Math.abs(factor[field] - value) <= 1) {
      setUserScore(prev => prev + 5);
    }
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
              Analyse et quantification des risques cyber
            </CardTitle>
            <CardDescription className="text-blue-300">
              Transformez l'incertitude en données exploitables pour prioriser vos actions de sécurité
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
                <h2 className="text-2xl font-bold mb-4">📊 Introduction à l'analyse des risques cyber</h2>
                
                <div className="p-5 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-blue-800 shadow-inner">
                  <p className="mb-4">
                    L'<strong>analyse des risques cyber</strong> est le processus qui permet de transformer l'incertitude en données exploitables.
                    C'est une discipline à la croisée de la cybersécurité, des mathématiques et de la psychologie, essentielle pour prendre des décisions éclairées.
                  </p>
                  <p>
                    Dans ce module, vous découvrirez comment identifier, évaluer et prioriser les risques cybersécurité dans une organisation.
                    Vous apprendrez à utiliser différentes méthodes d'analyse, qualitatives et quantitatives, pour transformer des menaces abstraites
                    en indicateurs concrets facilitant la prise de décision.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border-blue-800">
                    <CardHeader>
                      <BarChart3 className="h-8 w-8 text-blue-400 mb-2" />
                      <CardTitle className="text-lg">L'art de la quantification</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-blue-200">
                        Apprenez à mesurer l'impact et la probabilité des menaces pour
                        obtenir une vision claire des priorités de sécurité.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-800">
                    <CardHeader>
                      <Calculator className="h-8 w-8 text-purple-400 mb-2" />
                      <CardTitle className="text-lg">De la théorie à la pratique</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-blue-200">
                        Passez de l'abstraction théorique à l'application concrète 
                        en utilisant des méthodologies reconnues mondialement.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border-amber-800">
                    <CardHeader>
                      <Activity className="h-8 w-8 text-amber-400 mb-2" />
                      <CardTitle className="text-lg">Priorisation stratégique</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-blue-200">
                        Utilisez l'analyse de risques pour allouer efficacement vos ressources
                        et optimiser votre stratégie de cybersécurité.
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <Alert className="bg-blue-900/30 border-blue-700 mt-8">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <AlertTitle>Pourquoi l'analyse des risques est essentielle ?</AlertTitle>
                  <AlertDescription>
                    <p className="mt-2">
                      Dans un monde où les menaces sont innombrables et les ressources limitées, l'analyse des risques permet de
                      focaliser les efforts sur ce qui compte vraiment. Sans cette analyse, les organisations naviguent à l'aveugle,
                      en surprotégeant certains aspects et en négligeant des vulnérabilités critiques.
                    </p>
                  </AlertDescription>
                </Alert>
                
                <div className="mt-8 text-center">
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    onClick={() => {
                      handleMarkCompleted("introduction");
                      setCurrentSection("concepts");
                    }}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Découvrir les concepts fondamentaux
                  </Button>
                </div>
              </div>
            )}

            {/* Section Concepts fondamentaux */}
            {currentSection === "concepts" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">💡 Concepts fondamentaux</h2>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-5 rounded-lg border border-blue-800">
                  <p className="mb-4">
                    Pour maîtriser l'analyse des risques, il est essentiel de comprendre certains concepts clés
                    qui servent de fondement à toute méthodologie. Ces concepts forment le langage commun permettant
                    d'évaluer et de communiquer efficacement sur les risques cybersécurité.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-blue-900/20 border-blue-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-red-400" />
                        L'équation du risque
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-blue-950/40 p-4 rounded-lg mb-4">
                        <p className="text-lg font-medium text-center mb-3">Risque = Impact × Probabilité</p>
                        <p className="text-sm">
                          Cette formule fondamentale combine deux dimensions essentielles du risque :
                        </p>
                        <ul className="mt-3 space-y-2">
                          <li className="flex items-start gap-2">
                            <ArrowBigDown className="h-5 w-5 text-red-400 mt-0.5" />
                            <div>
                              <p className="font-medium">Impact (ou Conséquence)</p>
                              <p className="text-sm text-blue-200">Mesure les dommages potentiels si le risque se matérialise.</p>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <TrendingUp className="h-5 w-5 text-yellow-400 mt-0.5" />
                            <div>
                              <p className="font-medium">Probabilité (ou Vraisemblance)</p>
                              <p className="text-sm text-blue-200">Évalue la chance que le risque se concrétise.</p>
                            </div>
                          </li>
                        </ul>
                      </div>
                      <p className="text-sm">
                        Cette équation, bien que simple en apparence, permet d'établir une hiérarchie des risques
                        et de les comparer entre eux, facilitant ainsi la priorisation des actions.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-blue-900/20 border-blue-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-400" />
                        Les dimensions de l'impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-3 text-sm">
                        L'impact d'un incident de cybersécurité peut se manifester selon plusieurs dimensions :
                      </p>
                      <div className="space-y-3">
                        <div className="bg-blue-950/40 p-3 rounded-lg">
                          <p className="font-medium">🏢 Financier</p>
                          <p className="text-sm text-blue-200">
                            Pertes directes, coûts de remédiation, amendes réglementaires, impact sur le chiffre d'affaires.
                          </p>
                        </div>
                        <div className="bg-blue-950/40 p-3 rounded-lg">
                          <p className="font-medium">👤 Opérationnel</p>
                          <p className="text-sm text-blue-200">
                            Interruption de service, temps d'arrêt, dégradation des capacités.
                          </p>
                        </div>
                        <div className="bg-blue-950/40 p-3 rounded-lg">
                          <p className="font-medium">🤝 Réputationnel</p>
                          <p className="text-sm text-blue-200">
                            Perte de confiance des clients/partenaires, dommage à l'image de marque.
                          </p>
                        </div>
                        <div className="bg-blue-950/40 p-3 rounded-lg">
                          <p className="font-medium">⚖️ Juridique et réglementaire</p>
                          <p className="text-sm text-blue-200">
                            Non-conformité aux lois et règlements, poursuites judiciaires.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-gradient-to-br from-amber-900/20 to-amber-800/20 p-5 rounded-lg border border-amber-800 mt-8">
                  <h3 className="text-lg font-bold mb-3">La matrice de risques</h3>
                  <p className="mb-4">
                    La matrice de risques est une représentation visuelle de l'équation du risque, permettant de catégoriser
                    rapidement les risques selon leur impact et leur probabilité.
                  </p>
                  
                  <div className="bg-blue-950/30 p-5 rounded-lg">
                    <div className="grid grid-cols-6 gap-1">
                      <div className="col-span-1"></div>
                      <div className="col-span-5 grid grid-cols-5 gap-1">
                        <div className="text-center text-xs font-medium">Très faible</div>
                        <div className="text-center text-xs font-medium">Faible</div>
                        <div className="text-center text-xs font-medium">Moyen</div>
                        <div className="text-center text-xs font-medium">Élevé</div>
                        <div className="text-center text-xs font-medium">Très élevé</div>
                      </div>
                      
                      {[5, 4, 3, 2, 1].map((impact) => (
                        <React.Fragment key={impact}>
                          <div className="flex items-center justify-end pr-2 text-xs font-medium">
                            {impact === 5 ? 'Très élevé' :
                             impact === 4 ? 'Élevé' :
                             impact === 3 ? 'Moyen' :
                             impact === 2 ? 'Faible' : 'Très faible'}
                          </div>
                          {[1, 2, 3, 4, 5].map((prob) => {
                            const score = impact * prob;
                            let bgColor = "bg-green-500/30";
                            if (score > 15) bgColor = "bg-red-500/70";
                            else if (score > 10) bgColor = "bg-red-500/50";
                            else if (score > 8) bgColor = "bg-orange-500/50";
                            else if (score > 4) bgColor = "bg-yellow-500/50";
                            
                            return (
                              <div 
                                key={`${impact}-${prob}`}
                                className={`aspect-square rounded-sm ${bgColor} flex items-center justify-center text-white text-xs font-medium`}
                              >
                                {score}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="mt-2 grid grid-cols-5 text-center text-xs">
                      <div>Probabilité →</div>
                      <div>Très faible</div>
                      <div>Faible</div>
                      <div>Moyen</div>
                      <div>Élevé</div>
                      <div>Très élevé</div>
                    </div>
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
                      handleMarkCompleted("concepts");
                      setCurrentSection("methodes");
                    }}
                  >
                    Méthodes d'analyse
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Section Méthodes d'analyse */}
            {currentSection === "methodes" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">🔍 Méthodes d'analyse des risques</h2>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-5 rounded-lg border border-blue-800">
                  <p>
                    Il existe différentes approches pour analyser les risques, chacune avec ses avantages et inconvénients.
                    Ces méthodes se distinguent principalement par leur façon de mesurer et d'exprimer le risque.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {analysisMethods.map(method => (
                    <Card 
                      key={method.id}
                      className={`border-blue-800 hover:border-blue-700 transition-colors cursor-pointer ${
                        selectedMethod === method.id ? 'bg-blue-900/30' : 'bg-blue-900/10'
                      }`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          {method.icon}
                          {selectedMethod === method.id && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <CardTitle className="text-lg">{method.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-blue-200 mb-3">{method.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6 mt-6">
                  {analysisMethods.map(method => (
                    method.id === selectedMethod && (
                      <div key={method.id}>
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                          {method.icon}
                          {method.name}
                        </h3>
                        
                        <p className="mb-4">{method.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                          <div className="bg-blue-950/40 p-4 rounded-lg">
                            <h4 className="font-medium mb-2 flex items-center">
                              <TrendingUp className="h-4 w-4 text-green-400 mr-2" />
                              Avantages
                            </h4>
                            <ul className="space-y-1">
                              {method.advantages.map((adv, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                                  <span>{adv}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="bg-blue-950/40 p-4 rounded-lg">
                            <h4 className="font-medium mb-2 flex items-center">
                              <TrendingDown className="h-4 w-4 text-red-400 mr-2" />
                              Inconvénients
                            </h4>
                            <ul className="space-y-1">
                              {method.disadvantages.map((disadv, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                                  <span>{disadv}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        {method.id === "qualitative" && (
                          <div className="mt-6 bg-blue-950/30 p-4 rounded-lg">
                            <h4 className="font-medium mb-3">Exemple d'échelle qualitative</h4>
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Niveau</TableHead>
                                    <TableHead>Impact</TableHead>
                                    <TableHead>Probabilité</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TableRow>
                                    <TableCell className="font-medium">Très faible</TableCell>
                                    <TableCell>Impact négligeable, aucune perturbation</TableCell>
                                    <TableCell>Événement extrêmement rare</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">Faible</TableCell>
                                    <TableCell>Impact mineur, perturbation limitée</TableCell>
                                    <TableCell>Événement peu probable</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">Moyen</TableCell>
                                    <TableCell>Impact significatif mais gérable</TableCell>
                                    <TableCell>Événement possible</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">Élevé</TableCell>
                                    <TableCell>Impact majeur, perturbation importante</TableCell>
                                    <TableCell>Événement probable</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">Très élevé</TableCell>
                                    <TableCell>Impact catastrophique, perte critique</TableCell>
                                    <TableCell>Événement quasi certain</TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                        
                        {method.id === "quantitative" && (
                          <div className="mt-6 bg-blue-950/30 p-4 rounded-lg">
                            <h4 className="font-medium mb-3">Exemples de métriques quantitatives</h4>
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Métrique</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Exemple</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  <TableRow>
                                    <TableCell className="font-medium">Perte annuelle attendue (ALE)</TableCell>
                                    <TableCell>Coût moyen annuel des pertes liées à un risque</TableCell>
                                    <TableCell>ALE = SLE × ARO<br/>(Valeur de la perte × Fréquence annuelle)</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">Valeur en risque (VaR)</TableCell>
                                    <TableCell>Perte maximale avec un niveau de confiance</TableCell>
                                    <TableCell>VaR(95%) = 100 000€<br/>(95% de chances que la perte soit inférieure à 100 000€)</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">Retour sur investissement sécurité (ROSI)</TableCell>
                                    <TableCell>Bénéfice financier d'un contrôle sécurité</TableCell>
                                    <TableCell>ROSI = (Réduction de risque × Valeur de l'actif) - Coût du contrôle</TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </div>
                
                <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-5 mt-6">
                  <h3 className="text-lg font-bold mb-3">Comparaison des approches</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Critère</TableHead>
                          <TableHead>Qualitative</TableHead>
                          <TableHead>Semi-quantitative</TableHead>
                          <TableHead>Quantitative</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Complexité</TableCell>
                          <TableCell className="text-green-400">Faible</TableCell>
                          <TableCell className="text-yellow-400">Moyenne</TableCell>
                          <TableCell className="text-red-400">Élevée</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Précision</TableCell>
                          <TableCell className="text-red-400">Limitée</TableCell>
                          <TableCell className="text-yellow-400">Moyenne</TableCell>
                          <TableCell className="text-green-400">Élevée</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Besoin en données</TableCell>
                          <TableCell className="text-green-400">Minimal</TableCell>
                          <TableCell className="text-yellow-400">Modéré</TableCell>
                          <TableCell className="text-red-400">Important</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Facilité de communication</TableCell>
                          <TableCell className="text-green-400">Très bonne</TableCell>
                          <TableCell className="text-yellow-400">Bonne</TableCell>
                          <TableCell className="text-yellow-400">Moyenne</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Cas d'usage idéal</TableCell>
                          <TableCell>Analyse initiale, petites organisations</TableCell>
                          <TableCell>Usage courant, organisations moyennes</TableCell>
                          <TableCell>Décisions critiques, grandes organisations</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    className="border-blue-700 text-blue-300"
                    onClick={() => setCurrentSection("concepts")}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Concepts fondamentaux
                  </Button>
                  
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => {
                      handleMarkCompleted("methodes");
                      setCurrentSection("pratique");
                    }}
                  >
                    Mise en pratique
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Section Mise en pratique */}
            {currentSection === "pratique" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">⚒️ Mise en pratique de l'analyse de risques</h2>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-5 rounded-lg border border-blue-800">
                  <p>
                    Passons à la pratique ! Dans cette section, vous allez pouvoir appliquer les concepts appris
                    en réalisant une analyse de risques simplifiée pour une entreprise fictive du secteur e-commerce.
                  </p>
                </div>
                
                <Alert className="bg-blue-900/30 border-blue-700">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <AlertTitle>Mise en situation</AlertTitle>
                  <AlertDescription className="mt-2">
                    <p>
                      Vous êtes responsable sécurité pour <strong>CyberShop</strong>, une entreprise de commerce en ligne
                      qui vend des produits électroniques. L'entreprise dispose d'un site web transactionnel,
                      d'une base de données clients et d'un système de gestion des commandes.
                    </p>
                    <p className="mt-2">
                      Votre mission est d'identifier et d'évaluer les principaux risques auxquels l'entreprise
                      est exposée afin de prioriser les investissements en sécurité.
                    </p>
                  </AlertDescription>
                </Alert>
                
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4">Étape 1: Identification des risques</h3>
                  
                  <p className="mb-4">
                    Voici les principales catégories de risques identifiées pour CyberShop.
                    Explorez chaque catégorie pour découvrir les risques spécifiques.
                  </p>
                  
                  <div className="space-y-4">
                    {riskCategories.map(category => (
                      <Card key={category.id} className="bg-blue-900/20 border-blue-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2">
                            {category.icon}
                            {category.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {category.factors.map(factor => (
                              <div 
                                key={factor.id}
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                  selectedRiskFactor === factor.id 
                                    ? 'bg-blue-800/40 border border-blue-700'
                                    : 'bg-blue-950/40 hover:bg-blue-900/30'
                                }`}
                                onClick={() => setSelectedRiskFactor(factor.id)}
                              >
                                <div className="flex justify-between items-start">
                                  <h4 className="font-medium">{factor.name}</h4>
                                  <Badge 
                                    className={getRiskColorClass(calculateRiskScore(factor.impact, factor.probability))}
                                  >
                                    Score: {calculateRiskScore(factor.impact, factor.probability)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-blue-200 mt-1">{factor.description}</p>
                                
                                {selectedRiskFactor === factor.id && (
                                  <div className="mt-4 pt-4 border-t border-blue-800">
                                    <h5 className="font-medium mb-2">Votre évaluation:</h5>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm mb-2">Impact:</p>
                                        <div className="flex gap-2">
                                          {[1, 2, 3, 4, 5].map(value => (
                                            <Button
                                              key={value}
                                              size="sm"
                                              variant="outline"
                                              className={
                                                (userRiskAssessments[factor.id]?.impact === value)
                                                  ? "bg-blue-700 text-white"
                                                  : "border-blue-700"
                                              }
                                              onClick={() => handleUserRiskAssessment(factor.id, 'impact', value)}
                                            >
                                              {value}
                                            </Button>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <p className="text-sm mb-2">Probabilité:</p>
                                        <div className="flex gap-2">
                                          {[1, 2, 3, 4, 5].map(value => (
                                            <Button
                                              key={value}
                                              size="sm"
                                              variant="outline"
                                              className={
                                                (userRiskAssessments[factor.id]?.probability === value)
                                                  ? "bg-blue-700 text-white"
                                                  : "border-blue-700"
                                              }
                                              onClick={() => handleUserRiskAssessment(factor.id, 'probability', value)}
                                            >
                                              {value}
                                            </Button>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {userRiskAssessments[factor.id] && (
                                      <div className="mt-4 bg-blue-950/40 p-3 rounded-lg">
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm">Votre score de risque:</span>
                                          <Badge 
                                            className={getRiskColorClass(
                                              calculateRiskScore(
                                                userRiskAssessments[factor.id].impact,
                                                userRiskAssessments[factor.id].probability
                                              )
                                            )}
                                          >
                                            {calculateRiskScore(
                                              userRiskAssessments[factor.id].impact,
                                              userRiskAssessments[factor.id].probability
                                            )}
                                          </Badge>
                                        </div>
                                        
                                        {Math.abs(factor.impact - userRiskAssessments[factor.id].impact) <= 1 &&
                                         Math.abs(factor.probability - userRiskAssessments[factor.id].probability) <= 1 ? (
                                          <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
                                            <CheckCircle className="h-4 w-4" />
                                            Votre évaluation est proche de celle des experts !
                                          </p>
                                        ) : (
                                          <p className="text-sm text-yellow-400 mt-2">
                                            Votre évaluation diffère de celle des experts. Réfléchissez aux facteurs qui pourraient influencer votre jugement.
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-5 mt-6">
                  <h3 className="text-lg font-bold mb-3">Étape 2: Priorisation des risques</h3>
                  
                  <p className="mb-4">
                    Une fois que vous avez évalué tous les risques, vous pouvez les prioriser en fonction de leur score.
                    Voici un exemple de tableau de priorisation.
                  </p>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Risque</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Priorité</TableHead>
                          <TableHead>Actions recommandées</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {riskCategories
                          .flatMap(c => c.factors)
                          .sort((a, b) => calculateRiskScore(b.impact, b.probability) - calculateRiskScore(a.impact, a.probability))
                          .map(factor => (
                            <TableRow key={factor.id}>
                              <TableCell className="font-medium">{factor.name}</TableCell>
                              <TableCell>
                                <Badge 
                                  className={getRiskColorClass(calculateRiskScore(factor.impact, factor.probability))}
                                >
                                  {calculateRiskScore(factor.impact, factor.probability)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {calculateRiskScore(factor.impact, factor.probability) >= 15 ? 'Critique' :
                                 calculateRiskScore(factor.impact, factor.probability) >= 10 ? 'Élevée' :
                                 calculateRiskScore(factor.impact, factor.probability) >= 5 ? 'Moyenne' : 'Faible'}
                              </TableCell>
                              <TableCell>
                                {calculateRiskScore(factor.impact, factor.probability) >= 15 ? 'Traitement immédiat requis' :
                                 calculateRiskScore(factor.impact, factor.probability) >= 10 ? 'Plan d\'action prioritaire' :
                                 calculateRiskScore(factor.impact, factor.probability) >= 5 ? 'Contrôles à planifier' : 'Surveillance simple'}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    className="border-blue-700 text-blue-300"
                    onClick={() => setCurrentSection("methodes")}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Méthodes d'analyse
                  </Button>
                  
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => {
                      handleMarkCompleted("pratique");
                      setCurrentSection("conclusion");
                    }}
                  >
                    Ressources et outils
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Section Conclusion et ressources */}
            {currentSection === "conclusion" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">🛠️ Ressources et outils d'analyse des risques</h2>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-5 rounded-lg border border-blue-800">
                  <p>
                    Pour aller plus loin dans votre pratique de l'analyse des risques, cette section présente
                    des frameworks reconnus et des outils qui faciliteront votre travail.
                  </p>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4">Frameworks d'analyse des risques</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-blue-900/20 border-blue-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/Nist_logo.svg" alt="NIST Logo" className="h-6 w-6 bg-white rounded p-0.5" />
                          NIST RMF
                        </CardTitle>
                        <CardDescription className="text-blue-200">
                          Risk Management Framework
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-3">
                          Framework développé par le National Institute of Standards and Technology américain,
                          qui fournit une approche structurée pour gérer les risques de sécurité.
                        </p>
                        <div className="space-y-2">
                          <div className="bg-blue-950/40 p-2 rounded-lg">
                            <p className="text-xs font-medium">Étapes principales:</p>
                            <p className="text-xs text-blue-200">Catégoriser → Sélectionner → Implémenter → Évaluer → Autoriser → Surveiller</p>
                          </div>
                          <div className="bg-blue-950/40 p-2 rounded-lg">
                            <p className="text-xs font-medium">Points forts:</p>
                            <p className="text-xs text-blue-200">Reconnu internationalement, flexible, adapté aux systèmes gouvernementaux</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-900/20 border-blue-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/ISO_27001.svg" alt="ISO Logo" className="h-6 w-6 bg-white rounded p-0.5" />
                          ISO 27005
                        </CardTitle>
                        <CardDescription className="text-blue-200">
                          Gestion des risques liés à la sécurité de l'information
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-3">
                          Norme internationale fournissant des lignes directrices pour la gestion des risques
                          liés à la sécurité de l'information, en complément de la norme ISO 27001.
                        </p>
                        <div className="space-y-2">
                          <div className="bg-blue-950/40 p-2 rounded-lg">
                            <p className="text-xs font-medium">Étapes principales:</p>
                            <p className="text-xs text-blue-200">Établir le contexte → Apprécier les risques → Traiter les risques → Accepter les risques → Communiquer → Surveiller</p>
                          </div>
                          <div className="bg-blue-950/40 p-2 rounded-lg">
                            <p className="text-xs font-medium">Points forts:</p>
                            <p className="text-xs text-blue-200">Standard international, intégré avec ISO 27001, approche structurée</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-900/20 border-blue-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <img src="https://upload.wikimedia.org/wikipedia/fr/0/0f/ANSSI_Logo.png" alt="ANSSI Logo" className="h-6 w-6 bg-white rounded p-0.5" />
                          EBIOS Risk Manager
                        </CardTitle>
                        <CardDescription className="text-blue-200">
                          Expression des Besoins et Identification des Objectifs de Sécurité
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-3">
                          Méthodologie française développée par l'ANSSI, qui propose une approche
                          collaborative et orientée scénarios pour l'analyse des risques.
                        </p>
                        <div className="space-y-2">
                          <div className="bg-blue-950/40 p-2 rounded-lg">
                            <p className="text-xs font-medium">Étapes principales:</p>
                            <p className="text-xs text-blue-200">5 ateliers: Socle de sécurité → Sources de risques → Scénarios stratégiques → Scénarios opérationnels → Traitement</p>
                          </div>
                          <div className="bg-blue-950/40 p-2 rounded-lg">
                            <p className="text-xs font-medium">Points forts:</p>
                            <p className="text-xs text-blue-200">Approche collaborative, focus sur les scénarios réalistes, adapté au contexte européen</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-900/20 border-blue-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/0/0a/FAIR_Institute_logo.png" alt="FAIR Logo" className="h-6 w-8 bg-white rounded p-0.5" />
                          FAIR
                        </CardTitle>
                        <CardDescription className="text-blue-200">
                          Factor Analysis of Information Risk
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-3">
                          Modèle quantitatif standardisé pour l'analyse et la gestion des risques
                          de sécurité de l'information, avec un focus sur les aspects financiers.
                        </p>
                        <div className="space-y-2">
                          <div className="bg-blue-950/40 p-2 rounded-lg">
                            <p className="text-xs font-medium">Composantes principales:</p>
                            <p className="text-xs text-blue-200">Risque = Fréquence de perte × Magnitude de perte (avec des facteurs décomposés)</p>
                          </div>
                          <div className="bg-blue-950/40 p-2 rounded-lg">
                            <p className="text-xs font-medium">Points forts:</p>
                            <p className="text-xs text-blue-200">Approche quantitative, orienté business, facilite la communication avec la direction</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Outils d'analyse des risques</h3>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Outil</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Framework supporté</TableHead>
                          <TableHead>Points forts</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">FAIR-U</TableCell>
                          <TableCell>Commercial</TableCell>
                          <TableCell>FAIR</TableCell>
                          <TableCell>Analyse quantitative complète, dashboards avancés</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">SimpleRisk</TableCell>
                          <TableCell>Open Source / Commercial</TableCell>
                          <TableCell>Multiple</TableCell>
                          <TableCell>Facile à utiliser, version gratuite disponible</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">ISACA COBIT</TableCell>
                          <TableCell>Commercial</TableCell>
                          <TableCell>COBIT</TableCell>
                          <TableCell>Approche orientée gouvernance IT, large adoption</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Microsoft Threat Modeling Tool</TableCell>
                          <TableCell>Gratuit</TableCell>
                          <TableCell>STRIDE</TableCell>
                          <TableCell>Interface graphique, intégration dans le cycle de développement</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">OpenFAIR</TableCell>
                          <TableCell>Open Source</TableCell>
                          <TableCell>FAIR</TableCell>
                          <TableCell>Implémentation ouverte du modèle FAIR, personnalisable</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-l-4 border-green-500 p-4 my-8 rounded-r-lg">
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-400" />
                    Félicitations !
                  </h3>
                  <p className="text-sm">
                    Vous avez terminé le module sur l'analyse et la quantification des risques cyber.
                    Vous avez acquis les connaissances fondamentales pour évaluer et prioriser les risques
                    de sécurité dans votre organisation, et vous disposez maintenant des références vers
                    des frameworks et outils pour approfondir votre pratique.
                  </p>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button 
                    variant="outline" 
                    className="border-blue-700 text-blue-300"
                    onClick={() => setCurrentSection("pratique")}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Mise en pratique
                  </Button>
                  
                  <Button 
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    onClick={() => {
                      handleMarkCompleted("conclusion");
                      setShowConfetti(true);
                      toast({
                        title: "Module terminé !",
                        description: "Félicitations, vous avez complété le module sur l'analyse des risques cyber.",
                      });
                      setTimeout(() => setShowConfetti(false), 3000);
                    }}
                  >
                    Terminer le module
                    <CheckCircle className="ml-2 h-4 w-4" />
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