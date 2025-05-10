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
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [score, setScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  
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
  
  // Démarrer le quiz
  const startQuiz = () => {
    setShowQuiz(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setScore(0);
  };
  
  // Sélectionner une réponse au quiz
  const selectAnswer = (questionId: string, answerIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex
    });
  };
  
  // Passer à la question suivante
  const goToNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculer le score
      let correctCount = 0;
      Object.entries(selectedAnswers).forEach(([questionId, answer]) => {
        const question = quizQuestions.find(q => q.id === questionId);
        if (question && answer === question.correctAnswer) {
          correctCount++;
        }
      });
      
      setScore(Math.round((correctCount / quizQuestions.length) * 100));
      setQuizCompleted(true);
    }
  };
  
  // Revenir à la question précédente
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Retourner aux résultats
  const backToResults = () => {
    setShowQuiz(false);
    // Faire défiler vers le haut
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Afficher la question actuelle
  const currentQuestion = quizQuestions[currentQuestionIndex];
  
  // Effet pour faire défiler vers le résultat une fois chargé
  useEffect(() => {
    if (showResults && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showResults]);
  
  return (
    <HomeLayout>
      <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-blue-950 to-indigo-900 text-white font-['Exo 2', 'Rajdhani', 'sans-serif']">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => window.location.href = '/'}
              >
                <Home className="h-4 w-4" />
                Accueil
              </Button>
              <ChevronRight className="h-4 w-4 text-gray-300" />
              <span className="text-sm text-gray-300">Dans la peau de ton métier</span>
            </div>
            <PageTitle title="Dans la peau de ton métier" />
            <p className="text-gray-300 mt-2 max-w-2xl">
              Découvrez votre métier en profondeur grâce à l'IA : rôles, compétences, évolution, défis et auto-évaluation personnalisée.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-3 py-1">
              PROFIL PRO
            </Badge>
          </div>
        </div>
        
        <Card className="mb-8 bg-blue-900/30 backdrop-blur-sm border-blue-700 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-purple-600" />
              Explorer un métier
            </CardTitle>
            <CardDescription>
              Sélectionnez ou saisissez un métier pour obtenir une analyse détaillée et tester vos connaissances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="mb-4">
                  <label className="text-sm font-medium mb-1 block">Sélectionnez un métier</label>
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
                  <label className="text-sm font-medium mb-1 block">Ou saisissez votre métier</label>
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
                      className="mt-2 text-xs"
                      onClick={() => setSelectedProfession("")}
                    >
                      Effacer la sélection
                    </Button>
                  )}
                </div>
                
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  onClick={handleSubmit}
                  disabled={isLoading || (!selectedProfession && !customProfession)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      Analyser ce métier
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              
              <div className="bg-blue-950/30 backdrop-blur-sm rounded-lg p-4 border border-blue-700 md:col-span-1 text-white">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Ce que vous découvrirez
                </h4>
                <ul className="space-y-2 text-sm text-blue-100">
                  <li className="flex items-start gap-2">
                    <Map className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    <span>Un portrait complet et objectif de votre métier</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span>Compétences clés requises et outils essentiels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <History className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <span>Évolution historique et tendances futures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MessageCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Perception sociale et idées reçues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Award className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <span>Quiz personnalisé pour tester vos connaissances</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
          {isLoading && (
            <CardFooter>
              <div className="w-full">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Analyse en cours...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardFooter>
          )}
        </Card>
        
        {showResults && professionProfile && (
          <div ref={resultRef}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-purple-600" />
              {professionProfile.title}
            </h2>
            
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full mb-8">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="exploration" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Exploration du métier
                </TabsTrigger>
                <TabsTrigger value="quiz" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Auto-évaluation
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="exploration" className="mt-6">
                {!showQuiz && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-blue-900/20 backdrop-blur-sm border-blue-700 shadow-lg">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Map className="h-5 w-5 text-blue-600" />
                          Définition et mission
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-blue-100">{professionProfile.description}</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-900/20 backdrop-blur-sm border-blue-700 shadow-lg">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl flex items-center gap-2">
                          <List className="h-5 w-5 text-blue-400" />
                          Tâches principales
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {professionProfile.tasks.map((task, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                              <span className="text-blue-100">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-900/20 backdrop-blur-sm border-blue-700 shadow-lg">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-red-400" />
                          Obligations et responsabilités
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {professionProfile.obligations.map((obligation, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <FileText className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                              <span className="text-blue-100">{obligation}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-900/20 backdrop-blur-sm border-blue-700 shadow-lg">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Code className="h-5 w-5 text-purple-400" />
                          Compétences requises
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <h4 className="font-semibold mb-2 text-blue-300">Compétences techniques</h4>
                        <ul className="space-y-1 mb-4">
                          {professionProfile.skills.technical.map((skill, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-purple-400 font-medium">•</span>
                              <span className="text-blue-100">{skill}</span>
                            </li>
                          ))}
                        </ul>
                        <h4 className="font-semibold mb-2 text-blue-300">Compétences interpersonnelles</h4>
                        <ul className="space-y-1">
                          {professionProfile.skills.soft.map((skill, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-400 font-medium">•</span>
                              <span className="text-blue-100">{skill}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-blue-900/20 backdrop-blur-sm border-blue-700 shadow-lg">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Wrench className="h-5 w-5 text-teal-400" />
                          Outils et technologies
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {professionProfile.tools.map((tool, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-teal-400 font-medium">⚙️</span>
                              <span className="text-blue-100">{tool}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white border-amber-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl flex items-center gap-2">
                          <MessageCircle className="h-5 w-5 text-amber-600" />
                          Perception sociale
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{professionProfile.socialPerception}</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-white border-green-100 md:col-span-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl flex items-center gap-2">
                          <History className="h-5 w-5 text-green-600" />
                          Évolution du métier
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">{professionProfile.evolution}</p>
                        <h4 className="font-semibold mb-2 text-gray-700">Comment garder une longueur d'avance</h4>
                        <ul className="space-y-2">
                          {professionProfile.advice.map((advice, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <ArrowRight className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                              <span>{advice}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <div className="md:col-span-2 mt-4">
                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={() => {
                          setCurrentTab("quiz");
                          setTimeout(() => startQuiz(), 300);
                        }}
                      >
                        Tester vos connaissances sur ce métier
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="quiz" className="mt-6">
                {!showQuiz ? (
                  <Card className="bg-white border-purple-100">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Award className="h-5 w-5 text-purple-600" />
                        Quiz: Testez vos connaissances sur {professionProfile.title}
                      </CardTitle>
                      <CardDescription>
                        Ce quiz personnalisé évalue votre compréhension des défis, compétences et évolutions de ce métier
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-purple-50 rounded-lg p-6 mb-6">
                        <h3 className="font-semibold text-lg mb-2">Ce qui vous attend</h3>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <div className="bg-purple-100 rounded-full p-1 mt-0.5">
                              <Clock className="h-4 w-4 text-purple-700" />
                            </div>
                            <div>
                              <span className="font-medium">5 questions</span>
                              <p className="text-sm text-gray-600">Durée estimée: 5-7 minutes</p>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                              <Gauge className="h-4 w-4 text-blue-700" />
                            </div>
                            <div>
                              <span className="font-medium">Difficulté adaptative</span>
                              <p className="text-sm text-gray-600">Questions conçues pour révéler les angles morts du métier</p>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <div className="bg-green-100 rounded-full p-1 mt-0.5">
                              <Lightbulb className="h-4 w-4 text-green-700" />
                            </div>
                            <div>
                              <span className="font-medium">Explications détaillées</span>
                              <p className="text-sm text-gray-600">Apprenez de vos erreurs avec des clarifications pour chaque question</p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={startQuiz}
                      >
                        Commencer le quiz
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ) : !quizCompleted ? (
                  <Card className="bg-white border-purple-100">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xl">
                          Question {currentQuestionIndex + 1}/{quizQuestions.length}
                        </CardTitle>
                        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-none">
                          {professionProfile.title}
                        </Badge>
                      </div>
                      <Progress 
                        value={((currentQuestionIndex + 1) / quizQuestions.length) * 100} 
                        className="h-2 mt-2" 
                      />
                    </CardHeader>
                    <CardContent>
                      <h3 className="text-lg font-medium mb-6">{currentQuestion?.question}</h3>
                      
                      <div className="space-y-3 mb-6">
                        {currentQuestion?.options.map((option, index) => (
                          <div 
                            key={index}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedAnswers[currentQuestion?.id] === index
                                ? 'bg-purple-100 border-purple-300'
                                : 'bg-white hover:bg-gray-50 border-gray-200'
                            }`}
                            onClick={() => selectAnswer(currentQuestion?.id, index)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 ${
                                selectedAnswers[currentQuestion?.id] === index
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {String.fromCharCode(65 + index)}
                              </div>
                              <span>{option}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={goToPreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Précédent
                      </Button>
                      
                      <Button
                        onClick={goToNextQuestion}
                        disabled={!(currentQuestion?.id in selectedAnswers)}
                      >
                        {currentQuestionIndex === quizQuestions.length - 1 ? (
                          <>Terminer le quiz</>
                        ) : (
                          <>
                            Suivant
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    <Card className="bg-white border-purple-100">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Award className="h-6 w-6 text-purple-600" />
                          Votre résultat
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="inline-flex mb-4">
                          <div className="relative">
                            <svg className="w-32 h-32">
                              <circle
                                className="text-gray-200"
                                strokeWidth="8"
                                stroke="currentColor"
                                fill="transparent"
                                r="58"
                                cx="64"
                                cy="64"
                              />
                              <circle
                                className={`${
                                  score >= 80 ? 'text-green-500' : 
                                  score >= 60 ? 'text-blue-500' : 
                                  score >= 40 ? 'text-amber-500' : 'text-red-500'
                                }`}
                                strokeWidth="8"
                                strokeDasharray={58 * 2 * Math.PI}
                                strokeDashoffset={58 * 2 * Math.PI * (1 - score / 100)}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="58"
                                cx="64"
                                cy="64"
                              />
                            </svg>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                              <span className="text-3xl font-bold">{score}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-2">
                          {score >= 80 ? 'Excellent !' :
                           score >= 60 ? 'Bon résultat !' :
                           score >= 40 ? 'Résultat moyen' : 'Des progrès à faire'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {score >= 80 ? 'Vous maîtrisez parfaitement les spécificités de ce métier, y compris ses aspects les plus subtils.' :
                           score >= 60 ? 'Vous avez une bonne connaissance de ce métier, avec quelques points à approfondir.' :
                           score >= 40 ? 'Vous avez des bases sur ce métier, mais plusieurs aspects importants vous échappent encore.' :
                           'Vous avez encore beaucoup à apprendre sur ce métier et ses spécificités.'}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-medium text-blue-700 mb-2">Points forts identifiés</h4>
                            <p className="text-sm text-gray-700">
                              {score >= 70 ? 'Excellente compréhension des aspects techniques et stratégiques du métier' :
                               score >= 50 ? 'Bonne connaissance des fondamentaux du métier' :
                               'Conscience de certains aspects essentiels du métier'}
                            </p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4">
                            <h4 className="font-medium text-amber-700 mb-2">Axes d'amélioration</h4>
                            <p className="text-sm text-gray-700">
                              {score >= 80 ? 'Perfectionnez votre connaissance des dernières évolutions du métier' :
                               score >= 60 ? 'Approfondissez les aspects réglementaires et les tendances émergentes' :
                               'Concentrez-vous sur les fondamentaux et les obligations associées à ce métier'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col sm:flex-row gap-3">
                        <Button
                          variant="outline"
                          className="sm:flex-1"
                          onClick={backToResults}
                        >
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Retour à l'analyse
                        </Button>
                        <Button
                          className="sm:flex-1 bg-purple-600 hover:bg-purple-700"
                          onClick={() => {
                            // Reset pour un nouveau quiz
                            startQuiz();
                          }}
                        >
                          <Network className="mr-2 h-4 w-4" />
                          Recommencer le quiz
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className="bg-white border-indigo-100">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-indigo-600" />
                          Explications des questions
                        </CardTitle>
                        <CardDescription>
                          Comprendre les réponses pour approfondir votre connaissance du métier
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {quizQuestions.map((question, i) => {
                            // Récupération sécurisée de la réponse utilisateur
                            const userAnswer = typeof selectedAnswers === 'object' && selectedAnswers !== null 
                              ? (selectedAnswers as Record<string, number>)[question.id] || undefined
                              : undefined;
                            const isCorrect = userAnswer === question.correctAnswer;
                            
                            return (
                              <div key={question.id} className="border-b pb-4 last:border-0">
                                <div className="flex items-start gap-3 mb-2">
                                  <div className={`rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 ${
                                    isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    {i + 1}
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-1">{question.question}</h4>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                      {question.options.map((option, j) => (
                                        <Badge
                                          key={j}
                                          variant="outline"
                                          className={`
                                            ${j === question.correctAnswer 
                                              ? 'bg-green-100 text-green-800 border-green-300' 
                                              : j === userAnswer 
                                                ? 'bg-red-100 text-red-800 border-red-300' 
                                                : 'bg-gray-100 text-gray-800 border-gray-300'
                                            }
                                          `}
                                        >
                                          {String.fromCharCode(65 + j)}: {option}
                                        </Badge>
                                      ))}
                                    </div>
                                    <div className={`p-3 rounded-lg text-sm ${
                                      isCorrect ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'
                                    }`}>
                                      {question.explanation}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() => window.location.href = '/'}
                        className="flex items-center gap-2"
                      >
                        <Home className="h-4 w-4" />
                        Retour à I AM CYBER
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {!showResults && !isLoading && (
          <div className="py-8 text-center text-gray-500">
            <p className="mb-2">Sélectionnez ou saisissez un métier pour commencer l'analyse</p>
          </div>
        )}
      </div>
    </HomeLayout>
  );
}