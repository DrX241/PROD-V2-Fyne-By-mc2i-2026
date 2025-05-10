import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle,
  ChevronRight,
  Clock,
  Code,
  FileText,
  Gauge,
  History,
  Home,
  Lightbulb,
  List,
  Loader2,
  Map,
  MessageCircle,
  Network,
  Send,
  Share2,
  ShieldCheck,
  Target,
  Wrench
} from 'lucide-react';
import { Link } from 'wouter';

// Types
interface ProfessionProfile {
  title: string;
  description: string;
  tasks: string[];
  obligations: string[];
  skills: {
    technical: string[];
    soft: string[];
  };
  tools: string[];
  socialPerception: string;
  evolution: string;
  advice: string[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// Liste prédéfinie des métiers populaires
const popularProfessions = [
  "Analyste SOC",
  "RSSI",
  "Pentester",
  "Auditeur de sécurité",
  "Architecte sécurité",
  "Consultant GRC",
  "Développeur sécurité",
  "Expert forensique",
  "Ingénieur DevSecOps",
  "Responsable sécurité cloud",
  "Analyste Threat Intelligence",
  "Responsable IAM"
];

export default function ProfilPro() {
  // États
  const [selectedProfession, setSelectedProfession] = useState<string>("");
  const [customProfession, setCustomProfession] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>("exploration");
  const [professionProfile, setProfessionProfile] = useState<ProfessionProfile | null>(null);
  const [progress, setProgress] = useState<number>(0);
  
  // États pour la compatibilité avec l'ancien système de quiz (maintenant remplacé par le jeu arcade)
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  
  const resultRef = useRef<HTMLDivElement>(null);
  
  // Gérer la sélection du métier
  const handleProfessionSelect = (value: string) => {
    setSelectedProfession(value);
    setCustomProfession("");
  };
  
  // Gérer la soumission du métier (prédéfini ou personnalisé)
  const handleSubmit = async () => {
    const profession = selectedProfession || customProfession;
    if (!profession) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner ou saisir un métier",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setShowResults(false);
    setQuizCompleted(false);
    
    try {
      // Simulation de l'appel API - À remplacer par un vrai appel API
      setTimeout(() => {
        // Données simulées pour la démonstration
        setProfessionProfile({
          title: profession,
          description: `Le métier de ${profession} consiste à protéger les systèmes d'information et les données sensibles contre les menaces informatiques. Ce professionnel évalue les risques, met en place des mesures de protection, et répond aux incidents de sécurité.`,
          tasks: [
            "Analyse des vulnérabilités et des menaces",
            "Mise en place de solutions de sécurité",
            "Gestion des incidents de sécurité",
            "Veille technologique et réglementaire",
            "Sensibilisation des utilisateurs"
          ],
          obligations: [
            "Respecter les réglementations en vigueur (RGPD, etc.)",
            "Maintenir la confidentialité des informations",
            "Assurer la continuité des services",
            "Documentation des procédures de sécurité"
          ],
          skills: {
            technical: [
              "Connaissance des réseaux et systèmes",
              "Maîtrise des outils d'analyse de sécurité",
              "Compréhension des vecteurs d'attaque",
              "Gestion des technologies de chiffrement"
            ],
            soft: [
              "Communication claire",
              "Gestion du stress",
              "Rigueur et méthode",
              "Adaptabilité",
              "Travail en équipe"
            ]
          },
          tools: [
            "Scanners de vulnérabilités",
            "SIEM (Security Information and Event Management)",
            "Pare-feu et systèmes de détection d'intrusion",
            "Outils d'analyse forensique"
          ],
          socialPerception: `Le ${profession} est souvent perçu comme un expert technique parfois alarmiste. Dans la culture populaire, ce métier est entouré d'une aura de mystère et associé au piratage, bien que la réalité soit plus axée sur la protection et la conformité.`,
          evolution: `Le métier de ${profession} a évolué d'un rôle purement technique à un rôle plus stratégique. À l'origine focalisé sur la protection du périmètre, il intègre désormais la gestion des risques, la conformité réglementaire, et s'adapte aux environnements cloud et mobiles.`,
          advice: [
            "Restez constamment informé des nouvelles menaces",
            "Développez une approche basée sur les risques",
            "Cultivez des compétences en communication",
            "Participez à des communautés de sécurité",
            "Obtenez des certifications reconnues"
          ]
        });
        
        // Génération des questions de quiz
        setQuizQuestions([
          {
            id: "q1",
            question: `Quelle compétence est la moins critique pour un ${profession} débutant ?`,
            options: [
              "Connaissance des bases de la sécurité réseau",
              "Maîtrise des solutions de sécurité cloud avancées",
              "Compréhension des vulnérabilités courantes",
              "Communication des risques aux équipes non techniques"
            ],
            correctAnswer: 1,
            explanation: "Les solutions de sécurité cloud avancées sont généralement maîtrisées avec l'expérience. Pour un débutant, les fondamentaux de la sécurité réseau, la connaissance des vulnérabilités courantes et la communication sont plus essentiels."
          },
          {
            id: "q2",
            question: `Quel est l'angle mort le plus courant dans la carrière d'un ${profession} ?`,
            options: [
              "Sous-estimer l'importance du facteur humain",
              "Trop se concentrer sur les outils au détriment de la stratégie",
              "Négliger les contraintes budgétaires",
              "Toutes les réponses ci-dessus"
            ],
            correctAnswer: 3,
            explanation: "La plupart des professionnels de la cybersécurité font face à ces trois angles morts à un moment de leur carrière. Le facteur humain est souvent le maillon le plus faible, tandis qu'une dépendance excessive aux outils sans vision stratégique et l'ignorance des réalités budgétaires créent des failles dans la posture de sécurité."
          },
          {
            id: "q3",
            question: `Dans l'évolution du métier de ${profession}, quelle tendance n'est PAS d'actualité ?`,
            options: [
              "Intégration de l'intelligence artificielle dans les outils de détection",
              "Retour aux infrastructures physiquement isolées (air-gapped)",
              "Adoption d'approches Zero Trust",
              "Développement de la sécurité adaptative basée sur le comportement"
            ],
            correctAnswer: 1,
            explanation: "Contrairement aux autres options qui représentent des tendances actuelles, le retour massif aux infrastructures totalement isolées n'est pas une tendance dominante. La connectivité reste essentielle, mais avec des contrôles de sécurité renforcés comme le Zero Trust."
          },
          {
            id: "q4",
            question: `Quelle obligation réglementaire n'est généralement PAS directement liée au rôle de ${profession} ?`,
            options: [
              "Maintenir un registre des traitements de données",
              "Réaliser des analyses d'impact sur la vie privée",
              "Établir les déclarations fiscales de l'entreprise",
              "Assurer la notification des violations de données"
            ],
            correctAnswer: 2,
            explanation: "L'établissement des déclarations fiscales relève de la responsabilité des services comptables et financiers, pas directement du professionnel de la cybersécurité, contrairement aux autres options qui touchent à la protection des données et la conformité."
          },
          {
            id: "q5",
            question: `Quel outil est le moins susceptible d'être utilisé quotidiennement par un ${profession} ?`,
            options: [
              "Tableau de bord de surveillance des événements de sécurité",
              "Outils d'analyse de code pour la sécurité applicative",
              "Logiciels de modélisation financière avancée",
              "Solutions d'authentification multi-facteurs"
            ],
            correctAnswer: 2,
            explanation: "Les logiciels de modélisation financière avancée sont rarement utilisés au quotidien par les professionnels de la cybersécurité, qui se concentrent davantage sur les outils de surveillance, d'analyse de sécurité et de gestion des accès."
          }
        ]);
        
        setIsLoading(false);
        setShowResults(true);
        setProgress(100);
        
      }, 2000); // Simulation de délai réseau
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Erreur",
        description: "Impossible d'analyser ce métier pour le moment. Veuillez réessayer plus tard.",
        variant: "destructive"
      });
    }
  };
  
  // État pour le mini-jeu arcade
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [gameLevel, setGameLevel] = useState<number>(1);
  const [gameTime, setGameTime] = useState<number>(60); // 60 secondes par défaut
  const [gameTimerId, setGameTimerId] = useState<NodeJS.Timeout | null>(null);
  
  // Démarrer le jeu arcade
  const startArcadeGame = () => {
    setGameStarted(true);
    setGameScore(0);
    setGameCompleted(false);
    setGameLevel(1);
    setGameTime(60);
    
    // Démarrer le timer
    const timerId = setInterval(() => {
      setGameTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          setGameCompleted(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    setGameTimerId(timerId);
  };
  
  // Terminer le jeu arcade
  const endArcadeGame = () => {
    if (gameTimerId) {
      clearInterval(gameTimerId);
    }
    setGameCompleted(true);
  };
  
  // Générer un défi aléatoire basé sur le métier
  const generateChallenge = (profession: string): { challenge: string, difficulty: number } => {
    // Dans une version réelle, ceci serait généré dynamiquement par l'IA
    // Mais pour cette démo, nous utilisons des défis prédéfinis
    
    const challenges = [
      { challenge: `Détecter rapidement une tentative d'intrusion dans le système`, difficulty: 3 },
      { challenge: `Analyser les logs pour identifier la source d'une attaque`, difficulty: 4 },
      { challenge: `Configurer un pare-feu pour bloquer le trafic malveillant`, difficulty: 2 },
      { challenge: `Répondre à un incident de sécurité en temps réel`, difficulty: 5 },
      { challenge: `Effectuer une analyse de vulnérabilités sur un serveur`, difficulty: 3 }
    ];
    
    return challenges[Math.floor(Math.random() * challenges.length)];
  };
  
  // Gérer une action réussie dans le jeu
  const handleGameSuccess = () => {
    // Augmenter le score en fonction du niveau
    setGameScore((prevScore) => prevScore + (gameLevel * 10));
    
    // Augmenter le niveau
    setGameLevel((prevLevel) => Math.min(prevLevel + 1, 5));
  };
  
  // Démarrer le quiz (maintenu pour compatibilité)
  const startQuiz = () => {
    setShowQuiz(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setScore(0);
  };
  
  // Retourner aux résultats (maintenu pour compatibilité)
  const backToResults = () => {
    setShowQuiz(false);
    setGameStarted(false);
    
    // Faire défiler vers le haut
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Effet pour faire défiler vers le résultat une fois chargé
  useEffect(() => {
    if (showResults && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showResults]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-slate-950 text-white pb-20">
      {/* En-tête */}
      <div className="p-6 container mx-auto">
        <div className="flex items-center mb-2">
          <Link href="/cyber">
            <Button variant="ghost" className="text-white mr-4">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour
            </Button>
          </Link>
          <PageTitle title="DANS LA PEAU DE TON MÉTIER" />
        </div>
          
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">DANS LA PEAU DE TON MÉTIER</h1>
            <p className="text-blue-200 mt-1">Découvrez votre métier en profondeur grâce à l'IA</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Badge variant="outline" className="bg-blue-800 text-blue-200 border-blue-700 text-xs px-3 py-1">
              PROFIL PRO
            </Badge>
          </div>
        </div>
        
        <Card className="mb-8 bg-blue-900/30 backdrop-blur-sm border-blue-700 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-blue-400" />
              Explorer un métier
            </CardTitle>
            <CardDescription className="text-blue-300">
              Sélectionnez ou saisissez un métier pour obtenir une analyse détaillée et tester vos connaissances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="mb-4">
                  <label className="text-sm font-medium mb-1 block text-blue-200">Sélectionnez un métier</label>
                  <Select onValueChange={handleProfessionSelect} value={selectedProfession}>
                    <SelectTrigger className="bg-blue-950/40 border-blue-700 text-white">
                      <SelectValue placeholder="Choisir dans la liste" />
                    </SelectTrigger>
                    <SelectContent className="bg-blue-900 border-blue-700 text-white">
                      {popularProfessions.map((profession) => (
                        <SelectItem key={profession} value={profession} className="hover:bg-blue-800">
                          {profession}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="mb-6">
                  <label className="text-sm font-medium mb-1 block text-blue-200">Ou saisissez votre métier</label>
                  <Input 
                    placeholder="Ex: Ingénieur cybersécurité, Analyste de risques..."
                    value={customProfession}
                    onChange={(e) => setCustomProfession(e.target.value)}
                    disabled={!!selectedProfession}
                    className="bg-blue-950/40 border-blue-700 text-white placeholder:text-blue-300"
                  />
                  {selectedProfession && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedProfession("");
                      }}
                      className="mt-2 text-blue-300 hover:text-blue-100"
                    >
                      Changer de métier
                    </Button>
                  )}
                </div>
                
                <Button 
                  onClick={handleSubmit} 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading || (!selectedProfession && !customProfession)}
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyse en cours...</>
                  ) : (
                    <>Analyser ce métier</>
                  )}
                </Button>
              </div>
              
              <div className="bg-blue-800/20 p-4 rounded-lg border border-blue-700/50 flex flex-col justify-center">
                <h3 className="text-lg font-semibold mb-4 text-blue-200">Pourquoi explorer un métier ?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="bg-blue-800 rounded-full p-1 mt-0.5">
                      <Target className="h-4 w-4 text-blue-200" />
                    </div>
                    <div>
                      <span className="font-medium text-blue-200">Orientation professionnelle</span>
                      <p className="text-sm text-blue-300">Découvrez si ce métier correspond à vos aspirations</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-blue-800 rounded-full p-1 mt-0.5">
                      <Gauge className="h-4 w-4 text-blue-200" />
                    </div>
                    <div>
                      <span className="font-medium text-blue-200">Auto-évaluation</span>
                      <p className="text-sm text-blue-300">Questions conçues pour révéler les angles morts du métier</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-blue-800 rounded-full p-1 mt-0.5">
                      <Lightbulb className="h-4 w-4 text-blue-200" />
                    </div>
                    <div>
                      <span className="font-medium text-blue-200">Explications détaillées</span>
                      <p className="text-sm text-blue-300">Apprenez de vos erreurs avec des clarifications pour chaque question</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {isLoading && (
          <div className="text-center py-10">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
            <h3 className="text-xl font-semibold mb-2">Analyse en cours...</h3>
            <p className="text-blue-300">Notre IA examine les spécificités du métier de {selectedProfession || customProfession}</p>
            <div className="max-w-md mx-auto mt-4">
              <Progress value={progress} className="h-2 bg-blue-900" />
            </div>
          </div>
        )}
        
        {showResults && professionProfile && !showQuiz && (
          <div ref={resultRef} className="mt-8">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-blue-900/30 rounded-lg border border-blue-700/50">
                <TabsTrigger 
                  value="exploration" 
                  className="py-3 data-[state=active]:bg-blue-700 data-[state=active]:text-white"
                >
                  <Map className="mr-2 h-4 w-4" />
                  Explorer le métier
                </TabsTrigger>
                <TabsTrigger 
                  value="evaluation" 
                  className="py-3 data-[state=active]:bg-blue-700 data-[state=active]:text-white"
                >
                  <Target className="mr-2 h-4 w-4" />
                  Jeu arcade
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="exploration" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-blue-900/30 backdrop-blur-sm border-blue-700 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-blue-400" />
                          {professionProfile.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4 text-blue-200">{professionProfile.description}</p>
                        
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <List className="h-5 w-5 text-blue-400" />
                            Responsabilités principales
                          </h3>
                          <ul className="list-disc ml-6 space-y-1 text-blue-200">
                            {professionProfile.tasks.map((task, index) => (
                              <li key={index}>{task}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-400" />
                            Obligations réglementaires et légales
                          </h3>
                          <ul className="list-disc ml-6 space-y-1 text-blue-200">
                            {professionProfile.obligations.map((obligation, index) => (
                              <li key={index}>{obligation}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Network className="h-5 w-5 text-blue-400" />
                            Perception sociale et culturelle
                          </h3>
                          <p className="text-blue-200">{professionProfile.socialPerception}</p>
                        </div>
                        
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <History className="h-5 w-5 text-blue-400" />
                            Évolution du métier
                          </h3>
                          <p className="text-blue-200">{professionProfile.evolution}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-900/30 backdrop-blur-sm border-blue-700 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-blue-400" />
                          Conseils pour réussir
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {professionProfile.advice.map((advice, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="bg-blue-800 rounded-full p-1 mt-0.5 flex-shrink-0">
                                <CheckCircle className="h-4 w-4 text-blue-200" />
                              </div>
                              <span className="text-blue-200">{advice}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-6">
                    <Card className="bg-blue-900/30 backdrop-blur-sm border-blue-700 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Wrench className="h-5 w-5 text-blue-400" />
                          Compétences techniques
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {professionProfile.skills.technical.map((skill, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              <span className="text-blue-200">{skill}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-900/30 backdrop-blur-sm border-blue-700 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageCircle className="h-5 w-5 text-blue-400" />
                          Compétences relationnelles
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {professionProfile.skills.soft.map((skill, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                              <span className="text-blue-200">{skill}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-900/30 backdrop-blur-sm border-blue-700 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="h-5 w-5 text-blue-400" />
                          Outils courants
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {professionProfile.tools.map((tool, index) => (
                            <Badge key={index} className="bg-blue-800 text-blue-200 border-blue-700 hover:bg-blue-700">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Button 
                      onClick={() => setCurrentTab("evaluation")}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Target className="mr-2 h-4 w-4" />
                      Passer au quiz d'auto-évaluation
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="evaluation" className="mt-6">
                {!gameStarted ? (
                  <Card className="bg-blue-900/30 backdrop-blur-sm border-blue-700 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-400" />
                        Testez vos compétences de {professionProfile.title}
                      </CardTitle>
                      <CardDescription className="text-blue-300">
                        Ce jeu d'arcade vous permet de mettre en pratique les compétences essentielles du métier
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-6 text-center">
                        <div className="mb-6">
                          <svg className="w-20 h-20 mx-auto mb-4" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="10" y="30" width="80" height="50" rx="4" fill="#1e40af" stroke="#3b82f6" strokeWidth="2"/>
                            <rect x="20" y="40" width="60" height="30" rx="2" fill="#1d4ed8"/>
                            <circle cx="30" cy="70" r="5" fill="#60a5fa"/>
                            <circle cx="50" cy="70" r="5" fill="#60a5fa"/>
                            <circle cx="70" cy="70" r="5" fill="#60a5fa"/>
                            <path d="M30 50L40 45L50 50L60 45L70 50" stroke="#bfdbfe" strokeWidth="2"/>
                          </svg>
                          <h3 className="text-xl font-semibold mb-2">Jeu d'arcade : La mission du {professionProfile.title}</h3>
                          <p className="text-blue-300 max-w-md mx-auto">
                            Plongez dans l'univers du métier avec ce mini-jeu d'arcade alimenté par l'IA qui simule ses défis quotidiens
                          </p>
                        </div>
                        
                        <ul className="text-sm text-left mb-8 bg-blue-900/50 p-4 rounded-lg border border-blue-700/50 max-w-lg mx-auto">
                          <li className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-blue-400" />
                            <span className="text-blue-200">Durée : 60 secondes chrono</span>
                          </li>
                          <li className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-blue-400" />
                            <span className="text-blue-200">Défis générés par IA spécifiques au métier</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Gauge className="h-4 w-4 text-blue-400" />
                            <span className="text-blue-200">Difficulté croissante basée sur vos performances</span>
                          </li>
                        </ul>
                        
                        <Button 
                          onClick={startArcadeGame}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Lancer le jeu
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : gameCompleted ? (
                  <Card className="bg-blue-900/30 backdrop-blur-sm border-blue-700 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-blue-400" />
                        Résultats - Mission {professionProfile.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-6">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold">{gameScore}</span>
                          </div>
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="40" 
                              fill="none" 
                              stroke="#1e3a8a" 
                              strokeWidth="8"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke={gameScore >= 150 ? "#22c55e" : gameScore >= 80 ? "#eab308" : "#ef4444"}
                              strokeWidth="8"
                              strokeDasharray={`${2 * Math.PI * 40 * Math.min(gameScore/200, 1)} ${2 * Math.PI * 40 * Math.max(1 - gameScore/200, 0)}`}
                              strokeDashoffset="0"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-2">
                          {gameScore >= 150 ? "Expert en action !" : 
                           gameScore >= 80 ? "Bonnes compétences" : 
                           gameScore >= 40 ? "Compétences en développement" : 
                           "Apprenti en formation"}
                        </h3>
                        
                        <div className="bg-blue-900/40 p-4 rounded-lg border border-blue-700 max-w-md mx-auto mb-6">
                          <p className="text-blue-200 mb-2">Analyse IA de votre performance :</p>
                          <p className="text-blue-300">
                            {gameScore >= 150 ? `Vous avez démontré une excellente maîtrise des compétences clés d'un ${professionProfile.title}. Vous savez gérer efficacement les situations critiques sous pression.` : 
                             gameScore >= 80 ? `Vous montrez une bonne compréhension des défis quotidiens d'un ${professionProfile.title}. Continuez à développer vos réflexes pour les situations complexes.` : 
                             gameScore >= 40 ? `Vous avez saisi les bases du métier de ${professionProfile.title}, mais certaines compétences clés nécessitent encore de la pratique.` : 
                             `Cette simulation montre qu'il serait bénéfique de vous familiariser davantage avec les compétences fondamentales du métier de ${professionProfile.title}.`}
                          </p>
                        </div>
                        
                        <div className="flex justify-center gap-4">
                          <Button 
                            onClick={() => setCurrentTab("exploration")}
                            variant="outline"
                            className="border-blue-700 text-blue-300 hover:bg-blue-800 hover:text-white"
                          >
                            <BookOpen className="mr-2 h-4 w-4" />
                            Revoir le profil métier
                          </Button>
                          
                          <Button 
                            onClick={startArcadeGame}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Rejouer
                          </Button>
                        </div>
                      </div>
                      
                      <Separator className="my-6 bg-blue-700" />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Compétences mises en pratique</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg border border-blue-700/50 bg-blue-900/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-5 w-5 text-blue-400" />
                              <h4 className="font-semibold">Réactivité</h4>
                            </div>
                            <div className="flex items-center mb-1">
                              <div className="w-full bg-blue-900 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(gameScore / 2, 100)}%` }}></div>
                              </div>
                              <span className="ml-2 text-sm text-blue-300">{Math.min(Math.round(gameScore / 2), 100)}%</span>
                            </div>
                            <p className="text-sm text-blue-300">Capacité à réagir rapidement aux défis</p>
                          </div>
                          
                          <div className="p-4 rounded-lg border border-blue-700/50 bg-blue-900/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Wrench className="h-5 w-5 text-blue-400" />
                              <h4 className="font-semibold">Technicité</h4>
                            </div>
                            <div className="flex items-center mb-1">
                              <div className="w-full bg-blue-900 rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min((gameScore * 0.8) / 1.6, 100)}%` }}></div>
                              </div>
                              <span className="ml-2 text-sm text-blue-300">{Math.min(Math.round((gameScore * 0.8) / 1.6), 100)}%</span>
                            </div>
                            <p className="text-sm text-blue-300">Maîtrise des outils et technologies</p>
                          </div>
                          
                          <div className="p-4 rounded-lg border border-blue-700/50 bg-blue-900/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Code className="h-5 w-5 text-blue-400" />
                              <h4 className="font-semibold">Analyse</h4>
                            </div>
                            <div className="flex items-center mb-1">
                              <div className="w-full bg-blue-900 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((gameScore * 1.2) / 2.4, 100)}%` }}></div>
                              </div>
                              <span className="ml-2 text-sm text-blue-300">{Math.min(Math.round((gameScore * 1.2) / 2.4), 100)}%</span>
                            </div>
                            <p className="text-sm text-blue-300">Capacité à analyser les situations complexes</p>
                          </div>
                          
                          <div className="p-4 rounded-lg border border-blue-700/50 bg-blue-900/20">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageCircle className="h-5 w-5 text-blue-400" />
                              <h4 className="font-semibold">Communication</h4>
                            </div>
                            <div className="flex items-center mb-1">
                              <div className="w-full bg-blue-900 rounded-full h-2">
                                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${Math.min((gameScore * 0.9) / 1.8, 100)}%` }}></div>
                              </div>
                              <span className="ml-2 text-sm text-blue-300">{Math.min(Math.round((gameScore * 0.9) / 1.8), 100)}%</span>
                            </div>
                            <p className="text-sm text-blue-300">Capacité à communiquer efficacement</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-blue-900/30 backdrop-blur-sm border-blue-700 shadow-lg">
                    <CardHeader>
                      <div className="flex justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-400" />
                            Niveau {gameLevel}: Mission {professionProfile.title}
                          </CardTitle>
                          <CardDescription className="text-blue-300">
                            Relevez les défis du métier en temps réel
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-blue-300" />
                          <span className="text-xl font-bold text-blue-300">{gameTime}s</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-blue-950/60 p-6 rounded-lg border border-blue-700 mb-6 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-6xl font-bold text-blue-200/10">NIVEAU {gameLevel}</div>
                        </div>
                        
                        <div className="relative z-10">
                          <h3 className="text-xl font-semibold mb-4">Défi actuel:</h3>
                          <p className="text-blue-200 text-lg mb-8">
                            {generateChallenge(professionProfile.title).challenge}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <Button 
                              className="bg-green-700 hover:bg-green-800 p-6 h-auto text-left flex flex-col items-start"
                              onClick={handleGameSuccess}
                            >
                              <span className="font-semibold mb-1">Analyser les journaux système</span>
                              <span className="text-sm text-green-100">Identifier les anomalies dans les logs et repérer les patterns suspects</span>
                            </Button>
                            
                            <Button 
                              className="bg-blue-700 hover:bg-blue-800 p-6 h-auto text-left flex flex-col items-start"
                              onClick={handleGameSuccess}
                            >
                              <span className="font-semibold mb-1">Déployer une solution de sécurité</span>
                              <span className="text-sm text-blue-100">Mettre en place un correctif pour colmater la faille détectée</span>
                            </Button>
                            
                            <Button 
                              className="bg-purple-700 hover:bg-purple-800 p-6 h-auto text-left flex flex-col items-start"
                              onClick={handleGameSuccess}
                            >
                              <span className="font-semibold mb-1">Activer le mode forensique</span>
                              <span className="text-sm text-purple-100">Collecter les preuves numériques pour l'analyse approfondie</span>
                            </Button>
                            
                            <Button 
                              className="bg-yellow-700 hover:bg-yellow-800 p-6 h-auto text-left flex flex-col items-start"
                              onClick={handleGameSuccess}
                            >
                              <span className="font-semibold mb-1">Isoler la zone compromise</span>
                              <span className="text-sm text-yellow-100">Établir un périmètre de sécurité pour contenir l'incident</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-300">Score actuel:</span>
                          <span className="font-bold text-xl">{gameScore}</span>
                        </div>
                        
                        <Button
                          variant="outline"
                          onClick={endArcadeGame}
                          className="border-blue-700 text-blue-300 hover:bg-blue-800 hover:text-white"
                        >
                          Terminer le jeu
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {/* L'interface du quiz a été remplacée par le jeu d'arcade */}
        
        {!showResults && !isLoading && (
          <div className="py-8 text-center text-blue-300">
            <p className="mb-2">Sélectionnez ou saisissez un métier pour commencer l'analyse</p>
          </div>
        )}
        
        <div className="flex justify-center mt-10">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/cyber'}
            className="flex items-center gap-2 border-blue-700 text-blue-300 hover:bg-blue-800 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à I AM CYBER
          </Button>
        </div>
      </div>
    </div>
  );
}