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
  Brain,
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
  Search,
  Send,
  Share2,
  ShieldCheck,
  Target,
  Wrench,
  XCircle,
  Zap
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

// Interface pour les questions du quiz
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

// Type pour les différents types de jeux
type GameType = 'decision' | 'impostor' | 'intruder';

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
  
  // États pour la compatibilité avec l'ancien système de quiz (maintenant remplacé par le quiz amélioré)
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  
  const resultRef = useRef<HTMLDivElement>(null);
  
  // États pour le jeu arcade transformé en quiz
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [gameLevel, setGameLevel] = useState<number>(1);
  const [gameTime, setGameTime] = useState<number>(60); // 60 secondes par défaut
  const [gameTimerId, setGameTimerId] = useState<NodeJS.Timeout | null>(null);
  const [selectedGameType, setSelectedGameType] = useState<GameType>('decision');
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<{
    isCorrect: boolean;
    message: string;
  } | null>(null);
  
  // États pour le quiz
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [totalCorrect, setTotalCorrect] = useState<number>(0);
  
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
    
    try {
      // Simulation de l'appel API - À remplacer par un vrai appel API
      setTimeout(() => {
        // Données simulées pour la démonstration
        setProfessionProfile({
          title: profession,
          description: `Le métier de ${profession} consiste à protéger les systèmes d'information et les données sensibles contre les menaces informatiques. Ce professionnel évalue les risques, met en place des mesures de protection, et répond aux incidents de sécurité.`,
          tasks: [
            "Analyse des vulnérabilités et des menaces",
            "Élaboration et mise en œuvre des politiques de sécurité",
            "Gestion des incidents de sécurité",
            "Veille technologique et réglementaire",
            "Formation et sensibilisation des utilisateurs"
          ],
          obligations: [
            "Assurer la conformité aux réglementations",
            "Protéger les données sensibles",
            "Anticiper les menaces émergentes",
            "Équilibrer sécurité et expérience utilisateur",
            "Évoluer avec les nouvelles technologies"
          ],
          skills: {
            technical: [
              "Sécurité des réseaux et systèmes",
              "Gestion des vulnérabilités",
              "Techniques de cryptographie",
              "Analyse de risques",
              "Connaissance des frameworks (ISO 27001, NIST)"
            ],
            soft: [
              "Communication et pédagogie",
              "Gestion de crise",
              "Analyse et résolution de problèmes",
              "Travail en équipe",
              "Adaptabilité et apprentissage continu"
            ]
          },
          tools: [
            "Solutions SIEM", "Scanners de vulnérabilités", "Firewalls", "Outils de cryptographie", 
            "Gestion des identités", "Antivirus", "Plateformes de sécurité cloud"
          ],
          socialPerception: "Ce métier est perçu comme essentiel et de plus en plus stratégique face à l'augmentation des cybermenaces. Les professionnels sont vus comme des experts techniques, parfois comme contraignants mais indispensables à la protection des organisations.",
          evolution: "Le métier évolue vers une approche plus proactive et intégrée aux processus métiers. Les compétences cloud, DevSecOps, et IA deviennent incontournables, avec une dimension de conseil et de gouvernance croissante.",
          advice: [
            "Maintenez une veille technologique constante",
            "Développez une vision globale au-delà de la technique",
            "Adoptez une approche pédagogique pour sensibiliser efficacement",
            "Cultivez vos compétences en gestion de crise",
            "Obtenez des certifications reconnues (CISSP, CEH...)"
          ]
        });
        
        setIsLoading(false);
        setShowResults(true);
        
        // Générer le quiz lorsque le profil est chargé
        setGameLevel(1);
        
        // Faire défiler vers le résultat
        setTimeout(() => {
          if (resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Erreur",
        description: "Impossible d'analyser ce métier pour le moment",
        variant: "destructive"
      });
    }
  };
  
  // Générer des questions de quiz pour un métier spécifique
  const generateQuizQuestions = async () => {
    if (!professionProfile?.title) return;
    
    // Dans une vraie implémentation, cette fonction devrait appeler l'API Azure OpenAI
    // Voici un exemple de simulation des questions générées
    
    const questions: QuizQuestion[] = [
      {
        question: `En tant que ${professionProfile.title}, quelle est la première action à entreprendre face à une faille de sécurité critique détectée dans un système en production ?`,
        options: [
          "Corriger immédiatement sans consultation",
          "Évaluer l'impact et établir un plan de correction",
          "Informer uniquement la direction",
          "Ignorer si aucun impact n'est immédiatement visible"
        ],
        correctAnswerIndex: 1,
        explanation: "L'évaluation de l'impact est primordiale pour comprendre l'étendue du problème et mettre en place une solution proportionnée qui prend en compte tous les aspects (techniques, opérationnels, légaux)."
      },
      {
        question: `Quelle compétence est généralement la plus valorisée pour un ${professionProfile.title} ?`,
        options: [
          "Expertise technique spécifique",
          "Communication et pédagogie", 
          "Gestion de projet et méthodologie",
          "Connaissance des normes et standards"
        ],
        correctAnswerIndex: 1,
        explanation: "La communication et la pédagogie sont essentielles pour ce rôle qui nécessite de traduire des concepts techniques complexes en termes compréhensibles pour les différentes parties prenantes et d'obtenir l'adhésion aux bonnes pratiques."
      },
      {
        question: `Quel est le principal défi auquel fait face un ${professionProfile.title} aujourd'hui ?`,
        options: [
          "L'évolution rapide des technologies",
          "La pénurie de talents qualifiés",
          "L'équilibre entre sécurité et expérience utilisateur",
          "La conformité aux réglementations"
        ],
        correctAnswerIndex: 2,
        explanation: "L'équilibre entre sécurité et expérience utilisateur représente un défi constant, car il faut assurer la protection des systèmes sans entraver la productivité ou dégrader l'expérience des utilisateurs."
      },
      {
        question: `Dans le contexte du ${professionProfile.title}, quelle approche est généralement recommandée face à un risque de sécurité ?`,
        options: [
          "Éliminer complètement tous les risques quoi qu'il en coûte",
          "Accepter certains risques après évaluation coût-bénéfice",
          "Transférer systématiquement les risques via l'assurance",
          "Ignorer les risques à faible probabilité"
        ],
        correctAnswerIndex: 1,
        explanation: "Une approche équilibrée basée sur l'analyse coût-bénéfice est essentielle. Certains risques peuvent être acceptés si leur impact potentiel est faible et que le coût de mitigation est disproportionné."
      },
      {
        question: `Quelle méthode est la plus efficace pour un ${professionProfile.title} souhaitant rester à jour dans son domaine ?`,
        options: [
          "Se concentrer uniquement sur les certifications",
          "Participer à des CTF et challenges pratiques",
          "Combiner veille technologique, formation continue et échanges avec ses pairs",
          "Se spécialiser dans une seule technologie"
        ],
        correctAnswerIndex: 2,
        explanation: "Une approche holistique combinant veille technologique, formation continue et participation à des communautés professionnelles permet de développer une vision large et actualisée du domaine, essentielle pour anticiper les évolutions."
      }
    ];
    
    setQuizQuestions(questions);
    return questions;
  };
  
  // Démarrer le quiz
  const startArcadeGame = async () => {
    setGameStarted(true);
    setGameScore(0);
    setGameCompleted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setShowExplanation(false);
    setIsAnswerCorrect(null);
    setTotalCorrect(0);
    
    const questions = await generateQuizQuestions();
    if (questions) {
      setQuizQuestions(questions);
    }
  };
  
  // Terminer le jeu arcade
  const endArcadeGame = () => {
    if (gameTimerId) {
      clearInterval(gameTimerId);
    }
    
    setShowFeedback(false);
    setGameCompleted(true);
  };
  
  // Fonction pour passer à la prochaine question du quiz
  const goToNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswerIndex(null);
      setShowExplanation(false);
      setIsAnswerCorrect(null);
    } else {
      // Fin du quiz
      endArcadeGame();
    }
  };
  
  // Traiter la sélection d'une réponse
  const handleAnswerSelection = (index: number) => {
    if (showExplanation) return; // Empêcher de changer la réponse après avoir vu l'explication
    
    setSelectedAnswerIndex(index);
    const isCorrect = index === quizQuestions[currentQuestionIndex]?.correctAnswerIndex;
    setIsAnswerCorrect(isCorrect);
    
    if (isCorrect) {
      setTotalCorrect(prev => prev + 1);
      setGameScore(prev => prev + 10); // 10 points par bonne réponse
    }
    
    setShowExplanation(true);
  };
  
  // Fonction remplacée par startArcadeGame
  const startQuiz = () => {
    startArcadeGame();
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
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-navy-800 to-blue-950">
      <PageTitle title="PROFIL PRO" />
      
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center text-white mb-2">
            <span className="text-blue-400">Dans la peau de ton métier</span>
          </h1>
          <p className="text-center text-blue-300 max-w-3xl mx-auto">
            Explorez un métier de la cybersécurité en profondeur et découvrez ses responsabilités, compétences et défis quotidiens
          </p>
        </div>
        
        <Card className="bg-blue-900/30 backdrop-blur-sm border-blue-700 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-blue-100">Sélectionnez un métier à explorer</CardTitle>
            <CardDescription className="text-blue-300">
              Choisissez parmi les métiers populaires ou saisissez un autre métier de la cybersécurité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">
                  Métiers populaires
                </label>
                <Select value={selectedProfession} onValueChange={handleProfessionSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un métier" />
                  </SelectTrigger>
                  <SelectContent>
                    {popularProfessions.map((profession) => (
                      <SelectItem key={profession} value={profession}>
                        {profession}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-300 mb-2">
                  Autre métier (précisez)
                </label>
                <div className="flex gap-4">
                  <Input
                    value={customProfession}
                    onChange={(e) => {
                      setCustomProfession(e.target.value);
                      setSelectedProfession("");
                    }}
                    placeholder="Ex: Analyste de sécurité Cloud"
                    className="bg-blue-950/70 border-blue-700 text-blue-100 placeholder:text-blue-500"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || (!selectedProfession && !customProfession)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analyser ce métier
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {showResults && professionProfile && (
          <div ref={resultRef}>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-bold text-white">
                Profil du métier: <span className="text-blue-400">{professionProfile.title}</span>
              </h2>
            </div>
            
            <Tabs defaultValue="exploration" value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="bg-blue-900/50 border border-blue-700 p-1">
                <TabsTrigger value="exploration" className="data-[state=active]:bg-blue-700">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Exploration
                </TabsTrigger>
                <TabsTrigger value="evaluation" className="data-[state=active]:bg-blue-700">
                  <Target className="h-4 w-4 mr-2" />
                  Évaluation
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="exploration" className="mt-6">
                <div className="mb-6 bg-blue-900/30 backdrop-blur-sm border border-blue-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-blue-100 mb-4">Vue d'ensemble</h3>
                  <p className="text-blue-200 mb-4">{professionProfile.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-lg font-semibold text-blue-100 mb-3 flex items-center">
                        <Briefcase className="h-5 w-5 mr-2 text-blue-400" />
                        Responsabilités principales
                      </h4>
                      <ul className="space-y-2">
                        {professionProfile.tasks.map((task, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="mt-1">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            </div>
                            <span className="text-blue-200">{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-blue-100 mb-3 flex items-center">
                        <ShieldCheck className="h-5 w-5 mr-2 text-blue-400" />
                        Contraintes et obligations
                      </h4>
                      <ul className="space-y-2">
                        {professionProfile.obligations.map((obligation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="mt-1">
                              <div className="h-2 w-2 rounded-full bg-red-500"></div>
                            </div>
                            <span className="text-blue-200">{obligation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-blue-100 mb-3 flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-blue-400" />
                      Conseils pour réussir
                    </h4>
                    <ul className="space-y-2">
                      {professionProfile.advice.map((advice, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                          <span className="text-blue-200">{advice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-blue-900/30 backdrop-blur-sm border-blue-700 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5 text-blue-400" />
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
                        Évaluez vos connaissances du métier avec des questions personnalisées et recevez un feedback détaillé
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-6 text-center">
                        <div className="mb-6">
                          <svg className="w-20 h-20 mx-auto mb-4" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="10" y="10" width="80" height="80" rx="5" fill="#1e40af" stroke="#3b82f6" strokeWidth="2"/>
                            <rect x="20" y="20" width="60" height="60" rx="3" fill="#1d4ed8"/>
                            <path d="M30 50 L70 50" stroke="#bfdbfe" strokeWidth="2"/>
                            <path d="M30 65 L70 65" stroke="#bfdbfe" strokeWidth="2"/>
                            <path d="M30 35 L70 35" stroke="#bfdbfe" strokeWidth="2"/>
                            <circle cx="25" cy="50" r="3" fill="#60a5fa"/>
                            <circle cx="25" cy="35" r="3" fill="#60a5fa"/>
                            <circle cx="25" cy="65" r="3" fill="#60a5fa"/>
                          </svg>
                          <h3 className="text-xl font-semibold mb-2">Quiz : Les compétences du {professionProfile.title}</h3>
                          <p className="text-blue-300 max-w-md mx-auto">
                            Testez vos connaissances avec un quiz personnalisé et bénéficiez d'un feedback enrichi par l'IA
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-2xl mx-auto">
                          <div className="bg-blue-900/50 p-4 rounded-lg border border-blue-700/50 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-blue-300 mb-2">5</span>
                            <span className="text-sm text-blue-200">Questions personnalisées</span>
                          </div>
                          <div className="bg-blue-900/50 p-4 rounded-lg border border-blue-700/50 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-blue-300 mb-2">100%</span>
                            <span className="text-sm text-blue-200">Feedback adapté au métier</span>
                          </div>
                        </div>
                        
                        <ul className="text-sm text-left mb-8 bg-blue-900/50 p-4 rounded-lg border border-blue-700/50 max-w-lg mx-auto">
                          <li className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-blue-200">Questions adaptées au profil du {professionProfile.title}</span>
                          </li>
                          <li className="flex items-center gap-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-blue-200">Explications détaillées après chaque réponse</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-blue-200">Résumé de compétences à la fin du quiz</span>
                          </li>
                        </ul>
                        
                        <Button 
                          onClick={startArcadeGame}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Commencer le quiz
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : !gameCompleted ? (
                  <Card className="bg-blue-900/30 backdrop-blur-sm border-blue-700 shadow-lg">
                    <CardHeader>
                      <div className="flex justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-400" />
                            Quiz : Les compétences du {professionProfile.title}
                          </CardTitle>
                          <CardDescription className="text-blue-300">
                            Question {currentQuestionIndex + 1} sur {quizQuestions.length}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-blue-300">Score:</span>
                          <Badge className="bg-blue-700">{gameScore}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {quizQuestions.length > 0 && currentQuestionIndex < quizQuestions.length && (
                        <div className="bg-blue-950/60 p-6 rounded-lg border border-blue-700 mb-6">
                          {/* Barre de progression */}
                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-blue-400 mb-1">
                              <span>Progression</span>
                              <span>{Math.round(((currentQuestionIndex + 1) / quizQuestions.length) * 100)}%</span>
                            </div>
                            <Progress 
                              value={((currentQuestionIndex + 1) / quizQuestions.length) * 100} 
                              className="h-2 bg-blue-950" 
                            />
                          </div>
                          
                          {/* Question */}
                          <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-4 text-white">
                              {quizQuestions[currentQuestionIndex].question}
                            </h3>
                          </div>
                          
                          {/* Options */}
                          <div className="space-y-3">
                            {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                              <div 
                                key={index}
                                onClick={() => !showExplanation && handleAnswerSelection(index)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                  selectedAnswerIndex === index 
                                    ? isAnswerCorrect 
                                      ? 'bg-green-900/50 border-green-500 text-white' 
                                      : 'bg-red-900/50 border-red-500 text-white'
                                    : 'bg-blue-900/40 border-blue-700 text-blue-100 hover:bg-blue-800/50'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 mt-0.5 ${
                                    selectedAnswerIndex === index 
                                      ? isAnswerCorrect 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-red-500 text-white'
                                      : 'bg-blue-700 text-white'
                                  }`}>
                                    {String.fromCharCode(65 + index)}
                                  </div>
                                  <span>{option}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Explication */}
                          {showExplanation && (
                            <div className={`mt-6 p-4 rounded-lg border ${
                              isAnswerCorrect 
                                ? 'bg-green-900/30 border-green-700 text-green-100' 
                                : 'bg-red-900/30 border-red-700 text-red-100'
                            }`}>
                              <div className="flex items-center mb-2">
                                {isAnswerCorrect ? (
                                  <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                                ) : (
                                  <XCircle className="h-5 w-5 mr-2 text-red-400" />
                                )}
                                <span className="font-semibold">
                                  {isAnswerCorrect ? 'Bonne réponse!' : 'Réponse incorrecte'}
                                </span>
                              </div>
                              <p className="mb-4">{quizQuestions[currentQuestionIndex].explanation}</p>
                              <Button 
                                onClick={goToNextQuestion}
                                className="mt-2"
                              >
                                {currentQuestionIndex < quizQuestions.length - 1 ? 'Question suivante' : 'Terminer le quiz'}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-300">Bonnes réponses:</span>
                          <span className="font-bold text-xl">{totalCorrect} / {currentQuestionIndex + (showExplanation ? 1 : 0)}</span>
                        </div>
                        
                        <Button
                          variant="outline"
                          onClick={endArcadeGame}
                          className="border-blue-700 text-blue-300 hover:bg-blue-800 hover:text-white"
                        >
                          Abandonner
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-blue-900/30 backdrop-blur-sm border-blue-700 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-blue-400" />
                        Résultats - Quiz {professionProfile.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center mb-6">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold">{totalCorrect}</span>
                            <span className="text-xl">/ {quizQuestions.length}</span>
                          </div>
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="45" 
                              fill="none" 
                              stroke="#1e3a8a" 
                              strokeWidth="10" 
                            />
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="45" 
                              fill="none" 
                              stroke={totalCorrect >= 4 ? "#22c55e" : totalCorrect >= 2 ? "#f59e0b" : "#ef4444"}
                              strokeWidth="10" 
                              strokeDasharray="282.7"
                              strokeDashoffset={282.7 - ((totalCorrect / quizQuestions.length) * 282.7)}
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                          {totalCorrect >= 4 ? "Excellent!" : totalCorrect >= 2 ? "Bon travail!" : "Encore un peu d'effort!"}
                        </h3>
                        <p className="text-blue-300 max-w-md mx-auto mb-6">
                          {totalCorrect >= 4 
                            ? `Vous avez une excellente compréhension du métier de ${professionProfile.title}!` 
                            : totalCorrect >= 2 
                              ? `Vous avez une bonne base de connaissances sur le métier de ${professionProfile.title}.` 
                              : `Vous pourriez approfondir vos connaissances sur le métier de ${professionProfile.title}.`}
                        </p>
                      </div>
                      
                      <h4 className="font-semibold text-lg mb-4 text-center">Évaluation des compétences</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-lg border border-blue-700/50 bg-blue-900/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-5 w-5 text-blue-400" />
                            <h4 className="font-semibold">Compréhension du métier</h4>
                          </div>
                          <div className="flex items-center mb-1">
                            <div className="w-full bg-blue-900 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((totalCorrect / quizQuestions.length) * 100, 100)}%` }}></div>
                            </div>
                            <span className="ml-2 text-sm text-blue-300">{Math.round((totalCorrect / quizQuestions.length) * 100)}%</span>
                          </div>
                          <p className="text-sm text-blue-300">Votre compréhension globale des responsabilités</p>
                        </div>
                        
                        <div className="p-4 rounded-lg border border-blue-700/50 bg-blue-900/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-5 w-5 text-blue-400" />
                            <h4 className="font-semibold">Prise de décision</h4>
                          </div>
                          <div className="flex items-center mb-1">
                            <div className="w-full bg-blue-900 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((gameScore * 1.2) / 2.4, 100)}%` }}></div>
                            </div>
                            <span className="ml-2 text-sm text-blue-300">{Math.min(Math.round((gameScore * 1.2) / 2.4), 100)}%</span>
                          </div>
                          <p className="text-sm text-blue-300">Capacité à analyser les situations complexes</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-center space-x-4">
                        <Button 
                          onClick={startArcadeGame}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Zap className="mr-2 h-4 w-4" />
                          Recommencer le quiz
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => setCurrentTab("exploration")}
                          className="border-blue-700 text-blue-300 hover:bg-blue-800 hover:text-white"
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Revoir le profil métier
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