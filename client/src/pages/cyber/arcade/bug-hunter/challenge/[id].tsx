import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useRoute, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import HomeLayout from '@/components/layout/HomeLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Bug,
  Code,
  PlayCircle,
  CheckCircle,
  Info as InfoIcon,
  Clock,
  Target,
  Flag,
  Trophy,
  BookOpen,
  Lock,
  Shield,
  XCircle,
  HelpCircle,
  Send,
  Lightbulb,
  AlertTriangle,
  Terminal
} from 'lucide-react';

// Types pour cette page
interface Challenge {
  id: string;
  title: string;
  description: string;
  category: VulnerabilityCategory;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  points: number;
  environment: {
    type: 'web' | 'api' | 'mobile';
    details: string;
    url?: string;
  };
  hints: string[];
  objectives: string[];
  timeLimit?: number;
  tutorial?: string;
}

interface BugReportForm {
  title: string;
  vulnerability: VulnerabilityCategory;
  severity: 'faible' | 'moyen' | 'élevé' | 'critique';
  description: string;
  stepsToReproduce: string;
  impactDescription: string;
  proofOfConcept: string;
}

type VulnerabilityCategory = 
  | 'XSS' 
  | 'CSRF' 
  | 'SQLi' 
  | 'AuthZ' 
  | 'AuthN' 
  | 'BusinessLogic' 
  | 'SSRF'
  | 'FileUpload'
  | 'IDOR';

// Composant principal
export default function BugHunterChallengePage() {
  const [match, params] = useRoute('/cyber/arcade/bug-hunter/challenge/:id');
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // État local
  const [activeTab, setActiveTab] = useState('description');
  const [timer, setTimer] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [bugReport, setBugReport] = useState<BugReportForm>({
    title: '',
    vulnerability: 'XSS',
    severity: 'moyen',
    description: '',
    stepsToReproduce: '',
    impactDescription: '',
    proofOfConcept: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [iframeHeight, setIframeHeight] = useState(600);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Requête pour récupérer les détails du défi
  const { 
    data: challenge, 
    isLoading: challengeLoading, 
    error: challengeError 
  } = useQuery({
    queryKey: ['/api/bug-hunter/challenge', params?.id],
    retry: false,
    enabled: !!params?.id,
  });
  
  // Mock data pour le développement
  const mockChallenge: Challenge = {
    id: 'web-store-1',
    title: 'E-commerce vulnérable - Niveau 1',
    description: 'Dans ce défi, vous explorez une boutique en ligne présentant une vulnérabilité XSS stockée dans son système de commentaires produits. Cette vulnérabilité peut permettre à un attaquant d\'injecter et d\'exécuter du code JavaScript malveillant affectant tous les visiteurs de la page.',
    category: 'XSS',
    difficulty: 'débutant',
    points: 100,
    environment: {
      type: 'web',
      details: 'Application web e-commerce avec système de commentaires',
      url: 'https://vulnerable-store-xss-1.bugbountysandbox.com/'
    },
    hints: [
      'Examinez le formulaire de commentaires sur les pages produits',
      'Essayez d\'injecter du code JavaScript simple comme une alerte',
      'Les filtres basiques sont peut-être présents, essayez de les contourner avec des variantes de balises ou d\'attributs',
      'Vérifiez comment les commentaires sont rendus dans la page, y a-t-il un échappement inapproprié?'
    ],
    objectives: [
      'Identifier la vulnérabilité XSS dans le système de commentaires',
      'Démontrer l\'exécution de code JavaScript via cette vulnérabilité',
      'Documenter le vecteur d\'attaque et les étapes pour reproduire',
      'Proposer une méthode de correction pour cette vulnérabilité'
    ],
    tutorial: "Pour ce défi, vous allez explorer comment les attaques Cross-Site Scripting (XSS) fonctionnent. Une vulnérabilité XSS se produit lorsqu'une application intègre des entrées utilisateur non filtrées dans ses pages web. Cela permet à un attaquant d'injecter des scripts qui s'exécuteront dans le navigateur des autres utilisateurs.\n\nPour commencer, naviguez dans la boutique en ligne simulée et recherchez les zones où vous pouvez soumettre du contenu, comme les formulaires de commentaires sur les produits. Essayez d'injecter du code HTML simple avec des balises script pour voir si le site est vulnérable."
  };

  // Utiliser les données réelles ou le mock
  const displayedChallenge = challenge || mockChallenge;

  // Gérer le démarrage du timer
  useEffect(() => {
    if (displayedChallenge?.timeLimit && timerRunning) {
      setTimer(displayedChallenge.timeLimit * 60);
      
      const interval = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer === null || prevTimer <= 1) {
            clearInterval(interval);
            setTimerRunning(false);
            
            // Notification fin de temps
            toast({
              title: "Temps écoulé!",
              description: "Le temps alloué pour ce défi est terminé.",
              variant: "destructive",
            });
            
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [displayedChallenge, timerRunning, toast]);

  // Calcul de la hauteur iframe pour s'adapter au contenu
  useEffect(() => {
    function handleResize() {
      // Dynamiquement ajuster la hauteur basée sur la taille de l'écran
      const windowHeight = window.innerHeight;
      setIframeHeight(Math.max(500, windowHeight * 0.6));
    }
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mutation pour soumettre un rapport de bug
  const submitReportMutation = useMutation({
    mutationFn: async (report: any) => {
      return await apiRequest('POST', `/api/bug-hunter/reports`, report);
    },
    onSuccess: () => {
      toast({
        title: "Rapport soumis!",
        description: "Votre rapport a été soumis avec succès et sera évalué.",
        variant: "default",
      });
      
      // Réinitialiser le formulaire
      setBugReport({
        title: '',
        vulnerability: 'XSS',
        severity: 'moyen',
        description: '',
        stepsToReproduce: '',
        impactDescription: '',
        proofOfConcept: ''
      });
      
      // Invalider les requêtes pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['/api/bug-hunter/reports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bug-hunter/user-stats'] });
      
      // Rediriger vers la page des rapports
      setLocation('/cyber/arcade/bug-hunter');
      setActiveTab('reports');
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la soumission",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // Validation du formulaire
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!bugReport.title.trim()) errors.title = "Le titre est requis";
    if (!bugReport.description.trim()) errors.description = "La description est requise";
    if (!bugReport.stepsToReproduce.trim()) errors.stepsToReproduce = "Les étapes de reproduction sont requises";
    if (!bugReport.impactDescription.trim()) errors.impactDescription = "La description de l'impact est requise";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gestion de la soumission du rapport
  const handleSubmitReport = () => {
    if (!validateForm()) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const report = {
      ...bugReport,
      challengeId: params?.id,
      stepsToReproduce: bugReport.stepsToReproduce.split('\n').filter(step => step.trim()),
      submittedAt: new Date(),
      status: 'en attente'
    };
    
    // Pour le prototype, simulons juste une soumission réussie après un délai
    setTimeout(() => {
      toast({
        title: "Rapport soumis!",
        description: "Votre rapport a été soumis avec succès et sera évalué.",
        variant: "default",
      });
      
      // Réinitialiser le formulaire
      setBugReport({
        title: '',
        vulnerability: 'XSS',
        severity: 'moyen',
        description: '',
        stepsToReproduce: '',
        impactDescription: '',
        proofOfConcept: ''
      });
      
      setIsSubmitting(false);
      
      // Rediriger vers la page principale
      setLocation('/cyber/arcade/bug-hunter');
    }, 1500);
    
    // Dans une implémentation réelle, nous utiliserions la mutation:
    // submitReportMutation.mutate(report);
  };
  
  // Mise à jour du formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBugReport(prev => ({ ...prev, [name]: value }));
    
    // Effacer l'erreur si le champ est rempli
    if (formErrors[name] && value.trim()) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Gestion des choix radio
  const handleRadioChange = (name: string, value: string) => {
    setBugReport(prev => ({ ...prev, [name]: value }));
  };

  // Révéler un indice supplémentaire
  const revealNextHint = () => {
    if (currentHintIndex < displayedChallenge.hints.length - 1) {
      setCurrentHintIndex(prev => prev + 1);
    }
  };

  // Formater le temps restant
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Commencer le défi
  const startChallenge = () => {
    setTimerRunning(true);
    setActiveTab('environment');
    
    toast({
      title: "Défi démarré!",
      description: "Votre temps a commencé. Bonne chance!",
      variant: "default",
    });
  };

  // Fonction pour obtenir le niveau de progression
  const getProgressLevel = () => {
    if (timerRunning) return "en cours";
    if (isSubmitting) return "soumission";
    return "prêt";
  };

  // Contrôle le comportement du bouton de progression
  const getProgressButton = () => {
    const level = getProgressLevel();
    
    switch (level) {
      case "prêt":
        return (
          <Button
            className="w-full bg-blue-700 hover:bg-blue-600"
            onClick={startChallenge}
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            Commencer le défi
          </Button>
        );
      
      case "en cours":
        return (
          <Button
            className="w-full bg-green-700 hover:bg-green-600"
            onClick={() => setActiveTab('submission')}
          >
            <Flag className="mr-2 h-5 w-5" />
            Soumettre un rapport
          </Button>
        );
      
      case "soumission":
        return (
          <Button
            className="w-full"
            disabled
          >
            <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></span>
            Soumission en cours...
          </Button>
        );
    }
  };

  // Si l'ID du défi n'existe pas
  if (!params?.id) {
    return (
      <HomeLayout>
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-blue-900 text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-20">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-4">Défi non trouvé</h1>
              <p className="text-xl text-gray-300 mb-8">
                Le défi que vous recherchez n'existe pas ou n'est pas disponible.
              </p>
              <Link href="/cyber/arcade/bug-hunter">
                <Button className="bg-blue-700 hover:bg-blue-600">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour aux défis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Link href="/cyber/arcade/bug-hunter">
                <Button variant="ghost" className="text-white hover:bg-blue-800/20 mr-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{displayedChallenge.title}</h1>
                <div className="flex items-center mt-1">
                  <Badge variant="outline" className="bg-slate-800 text-blue-300 border-slate-700 mr-2">
                    {displayedChallenge.category}
                  </Badge>
                  {displayedChallenge.difficulty === 'débutant' && (
                    <Badge variant="outline" className="bg-green-900/30 text-green-300 border-green-800">
                      Débutant
                    </Badge>
                  )}
                  {displayedChallenge.difficulty === 'intermédiaire' && (
                    <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-800">
                      Intermédiaire
                    </Badge>
                  )}
                  {displayedChallenge.difficulty === 'avancé' && (
                    <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-800">
                      Avancé
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Timer (affiché uniquement si le défi a un time limit) */}
            {displayedChallenge.timeLimit && (
              <div className={`px-4 py-2 rounded-lg flex items-center ${
                timerRunning 
                  ? timer && timer < 60 
                    ? 'bg-red-900/30 border border-red-800' 
                    : 'bg-blue-900/30 border border-blue-800'
                  : 'bg-slate-800/80 border border-slate-700'
              }`}>
                <Clock className={`mr-2 h-5 w-5 ${
                  timerRunning 
                    ? timer && timer < 60 
                      ? 'text-red-400' 
                      : 'text-blue-400'
                    : 'text-slate-400'
                }`} />
                <span className={`font-mono text-xl ${
                  timerRunning 
                    ? timer && timer < 60 
                      ? 'text-red-300' 
                      : 'text-blue-300'
                    : 'text-slate-300'
                }`}>
                  {formatTime(timer)}
                </span>
              </div>
            )}
          </div>

          {/* Point indicators */}
          <div className="flex items-center mb-6 bg-blue-900/30 p-3 rounded-lg border border-blue-800">
            <div className="flex items-center">
              <Trophy className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-blue-200 mr-1">Points:</span>
              <span className="font-bold text-white">{displayedChallenge.points}</span>
            </div>
            
            <div className="mx-4 h-5 border-r border-blue-700"></div>
            
            <div className="flex items-center">
              <Target className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-blue-200 mr-1">Objectifs:</span>
              <span className="font-bold text-white">{displayedChallenge.objectives?.length || '?'}</span>
            </div>
            
            {timerRunning && (
              <>
                <div className="mx-4 h-5 border-r border-blue-700"></div>
                <div className="flex items-center">
                  <span className="text-blue-200 mr-1">Progression:</span>
                  <span className="font-bold text-white">En cours</span>
                </div>
              </>
            )}
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left sidebar with navigation */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800/80 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Target className="mr-2 h-5 w-5 text-blue-400" />
                    Navigation
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${activeTab === 'description' ? 'bg-blue-900/30 text-blue-200' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}
                      onClick={() => setActiveTab('description')}
                    >
                      <InfoIcon className="mr-2 h-5 w-5" />
                      Description
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${activeTab === 'objectives' ? 'bg-blue-900/30 text-blue-200' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}
                      onClick={() => setActiveTab('objectives')}
                    >
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Objectifs
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${activeTab === 'tutorial' ? 'bg-blue-900/30 text-blue-200' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}
                      onClick={() => setActiveTab('tutorial')}
                    >
                      <BookOpen className="mr-2 h-5 w-5" />
                      Tutoriel
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${activeTab === 'environment' ? 'bg-blue-900/30 text-blue-200' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}
                      onClick={() => setActiveTab('environment')}
                      disabled={!timerRunning}
                    >
                      <Code className="mr-2 h-5 w-5" />
                      Environnement
                      {!timerRunning && <Lock className="ml-auto h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${activeTab === 'hints' ? 'bg-blue-900/30 text-blue-200' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}
                      onClick={() => {
                        setActiveTab('hints');
                        setShowHints(true);
                      }}
                      disabled={!timerRunning}
                    >
                      <Lightbulb className="mr-2 h-5 w-5" />
                      Indices
                      {!timerRunning && <Lock className="ml-auto h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${activeTab === 'submission' ? 'bg-blue-900/30 text-blue-200' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}
                      onClick={() => setActiveTab('submission')}
                      disabled={!timerRunning}
                    >
                      <Flag className="mr-2 h-5 w-5" />
                      Soumettre
                      {!timerRunning && <Lock className="ml-auto h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  {!timerRunning && getProgressButton()}
                </CardFooter>
              </Card>
              
              {/* Help card */}
              <Card className="bg-slate-800/80 border-slate-700 mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <HelpCircle className="mr-2 h-5 w-5 text-purple-400" />
                    Aide
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm text-slate-300 space-y-2">
                    <p>
                      <strong>Comment participer:</strong> Commencez le défi en cliquant sur le bouton "Commencer le défi". Cela lancera le chronomètre et débloquera l'environnement de test.
                    </p>
                    <p>
                      <strong>Objectifs:</strong> Examinez les objectifs pour comprendre ce que vous devez accomplir.
                    </p>
                    <p>
                      <strong>Indices:</strong> Si vous êtes bloqué, utilisez les indices disponibles dans l'onglet correspondant.
                    </p>
                    <p>
                      <strong>Soumission:</strong> Une fois la vulnérabilité identifiée, soumettez un rapport détaillé pour gagner des points.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main content area */}
            <div className="lg:col-span-2">
              {/* Description */}
              {activeTab === 'description' && (
                <Card className="bg-slate-800/80 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <InfoIcon className="mr-2 h-5 w-5 text-blue-400" />
                      Description du défi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      <p>{displayedChallenge.description}</p>
                      
                      <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-800">
                        <h3 className="text-lg font-medium mb-2 flex items-center">
                          <Terminal className="mr-2 h-5 w-5 text-green-400" />
                          Environnement
                        </h3>
                        <p>
                          <strong>Type:</strong> {displayedChallenge.environment.type === 'web' 
                            ? 'Application Web' 
                            : displayedChallenge.environment.type === 'api' 
                              ? 'API REST' 
                              : 'Application Mobile'}
                        </p>
                        <p><strong>Détails:</strong> {displayedChallenge.environment.details}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {!timerRunning && getProgressButton()}
                  </CardFooter>
                </Card>
              )}
              
              {/* Objectives */}
              {activeTab === 'objectives' && (
                <Card className="bg-slate-800/80 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                      Objectifs du défi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {displayedChallenge.objectives?.map((objective, index) => (
                        <div 
                          key={index}
                          className="p-3 border rounded-lg flex items-start bg-slate-900/30 border-slate-700"
                        >
                          <div className="bg-blue-900/30 rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5">
                            <span className="text-sm font-medium text-blue-300">{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-white">{objective}</p>
                          </div>
                        </div>
                      ))}
                      
                      {!displayedChallenge.objectives?.length && (
                        <div className="text-center py-6">
                          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                          <p className="text-gray-300">
                            Les objectifs de ce défi ne sont pas disponibles.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {!timerRunning && getProgressButton()}
                  </CardFooter>
                </Card>
              )}
              
              {/* Tutorial */}
              {activeTab === 'tutorial' && (
                <Card className="bg-slate-800/80 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="mr-2 h-5 w-5 text-purple-400" />
                      Tutoriel: {displayedChallenge.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {displayedChallenge.tutorial ? (
                      <div className="prose prose-invert max-w-none">
                        {displayedChallenge.tutorial.split('\n\n').map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                        <p className="text-gray-300">
                          Le tutoriel pour ce défi n'est pas disponible.
                        </p>
                      </div>
                    )}
                    
                    {/* Conseils supplémentaires spécifiques à la catégorie */}
                    {displayedChallenge.category === 'XSS' && (
                      <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-800">
                        <h3 className="text-lg font-medium mb-2">Conseils pour les vulnérabilités XSS</h3>
                        <ul className="list-disc list-inside space-y-2 text-blue-200">
                          <li>Recherchez les champs texte où l'entrée utilisateur est reflétée dans la page</li>
                          <li>Testez des payloads de base comme <code className="bg-slate-700 px-1 rounded">&lt;script&gt;alert('XSS')&lt;/script&gt;</code></li>
                          <li>Si des filtres sont présents, essayez des techniques de contournement comme les encodages ou attributs alternatifs</li>
                          <li>Vérifiez si l'injection persiste (stockée) ou si elle n'affecte que votre session (réfléchie)</li>
                        </ul>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    {!timerRunning && getProgressButton()}
                  </CardFooter>
                </Card>
              )}
              
              {/* Environment */}
              {activeTab === 'environment' && (
                <Card className="bg-slate-800/80 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Code className="mr-2 h-5 w-5 text-blue-400" />
                      Environnement de test
                    </CardTitle>
                    {!timerRunning && (
                      <CardDescription className="text-yellow-300">
                        <AlertTriangle className="inline mr-1 h-4 w-4" />
                        Vous devez commencer le défi pour accéder à l'environnement
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {timerRunning ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium">{displayedChallenge.environment.type === 'web' ? 'Application Web Vulnérable' : 'API Vulnérable'}</h3>
                            <p className="text-sm text-slate-300">Explorez cet environnement pour identifier des vulnérabilités</p>
                          </div>
                          
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-slate-700 hover:bg-slate-600"
                              onClick={() => window.open(displayedChallenge.environment.url, '_blank')}
                            >
                              Ouvrir dans un nouvel onglet
                            </Button>
                          </div>
                        </div>
                        
                        {/* iFrame de l'environnement simulé */}
                        <div className="bg-black rounded-lg border border-slate-700 overflow-hidden">
                          <div className="p-2 bg-slate-800 flex items-center">
                            <div className="flex space-x-1.5">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="mx-auto font-mono text-xs text-slate-400">
                              {displayedChallenge.environment.url || 'Environnement simulé'}
                            </div>
                          </div>
                          
                          {displayedChallenge.environment.url ? (
                            <iframe
                              ref={iframeRef}
                              src={displayedChallenge.environment.url}
                              className="w-full border-0"
                              style={{ height: `${iframeHeight}px` }}
                              title="Environnement de test de vulnérabilités"
                              sandbox="allow-same-origin allow-scripts allow-forms"
                            ></iframe>
                          ) : (
                            <div className="flex flex-col items-center justify-center" style={{ height: `${iframeHeight}px` }}>
                              <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                              <p className="text-gray-300">
                                Cette simulation n'est pas encore disponible dans cette version de démonstration.
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                          <div className="flex items-start">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm text-yellow-300">
                                Rappel: Exploitez uniquement cet environnement sécurisé. Les techniques apprises ici ne doivent jamais être utilisées sur des systèmes réels sans autorisation explicite.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Lock className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-slate-300 mb-2">Environnement verrouillé</h3>
                        <p className="text-slate-400 max-w-md mx-auto mb-6">
                          Vous devez commencer le défi pour accéder à l'environnement de test.
                        </p>
                        {getProgressButton()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Hints */}
              {activeTab === 'hints' && (
                <Card className="bg-slate-800/80 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5 text-yellow-400" />
                      Indices
                    </CardTitle>
                    {!timerRunning && (
                      <CardDescription className="text-yellow-300">
                        <AlertTriangle className="inline mr-1 h-4 w-4" />
                        Vous devez commencer le défi pour accéder aux indices
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {timerRunning && showHints ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-orange-900/20 border border-orange-800 rounded-lg mb-4">
                          <div className="flex items-start">
                            <AlertTriangle className="h-5 w-5 text-orange-400 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm text-orange-300">
                                Utiliser des indices peut réduire les points gagnés pour ce défi. Révélez-les progressivement si nécessaire.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {displayedChallenge.hints.slice(0, currentHintIndex + 1).map((hint, index) => (
                          <div
                            key={index}
                            className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg"
                          >
                            <div className="flex items-start">
                              <div className="bg-blue-900 rounded-full h-6 w-6 flex items-center justify-center mr-3 mt-0.5">
                                <span className="text-sm font-medium text-blue-300">{index + 1}</span>
                              </div>
                              <div>
                                <p className="text-blue-200">{hint}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {currentHintIndex < displayedChallenge.hints.length - 1 && (
                          <div className="text-center mt-6">
                            <Button
                              variant="outline"
                              className="bg-blue-900/30 border-blue-800 hover:bg-blue-800/30"
                              onClick={revealNextHint}
                            >
                              <Lightbulb className="mr-2 h-4 w-4" />
                              Révéler un autre indice
                            </Button>
                            <p className="text-xs text-slate-400 mt-2">
                              {displayedChallenge.hints.length - currentHintIndex - 1} indices restants
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        {!timerRunning ? (
                          <>
                            <Lock className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-slate-300 mb-2">Indices verrouillés</h3>
                            <p className="text-slate-400 max-w-md mx-auto mb-6">
                              Vous devez commencer le défi pour accéder aux indices.
                            </p>
                            {getProgressButton()}
                          </>
                        ) : (
                          <>
                            <Lightbulb className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-slate-300 mb-2">Indices disponibles</h3>
                            <p className="text-slate-400 max-w-md mx-auto mb-6">
                              Vous pouvez révéler des indices pour vous aider à résoudre ce défi.
                              Notez que l'utilisation d'indices peut réduire les points gagnés.
                            </p>
                            <Button
                              className="bg-yellow-700 hover:bg-yellow-600"
                              onClick={() => setShowHints(true)}
                            >
                              <Lightbulb className="mr-2 h-4 w-4" />
                              Afficher les indices
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Submission */}
              {activeTab === 'submission' && (
                <Card className="bg-slate-800/80 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Flag className="mr-2 h-5 w-5 text-green-400" />
                      Soumettre un rapport de vulnérabilité
                    </CardTitle>
                    {!timerRunning && (
                      <CardDescription className="text-yellow-300">
                        <AlertTriangle className="inline mr-1 h-4 w-4" />
                        Vous devez commencer le défi pour soumettre un rapport
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {timerRunning ? (
                      <div className="space-y-6">
                        <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg mb-4">
                          <p className="text-sm text-green-300">
                            <InfoIcon className="inline mr-1 h-4 w-4" />
                            Soumettez un rapport détaillé de la vulnérabilité que vous avez découverte. Plus votre rapport est clair et précis, plus votre score sera élevé.
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="title" className="text-white">Titre de la vulnérabilité</Label>
                            <Input
                              id="title"
                              name="title"
                              placeholder="Ex: Vulnérabilité XSS stockée dans les commentaires produits"
                              className="bg-slate-900 border-slate-700 mt-1.5"
                              value={bugReport.title}
                              onChange={handleInputChange}
                            />
                            {formErrors.title && (
                              <p className="text-red-400 text-sm mt-1">{formErrors.title}</p>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-white">Type de vulnérabilité</Label>
                              <RadioGroup
                                defaultValue={bugReport.vulnerability}
                                className="mt-1.5"
                                onValueChange={(value) => handleRadioChange('vulnerability', value)}
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="XSS" id="r-xss" />
                                  <Label htmlFor="r-xss" className="text-slate-200">XSS (Cross-Site Scripting)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="CSRF" id="r-csrf" />
                                  <Label htmlFor="r-csrf" className="text-slate-200">CSRF (Cross-Site Request Forgery)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="SQLi" id="r-sqli" />
                                  <Label htmlFor="r-sqli" className="text-slate-200">SQLi (Injection SQL)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="IDOR" id="r-idor" />
                                  <Label htmlFor="r-idor" className="text-slate-200">IDOR (Insecure Direct Object Reference)</Label>
                                </div>
                              </RadioGroup>
                            </div>
                            
                            <div>
                              <Label className="text-white">Niveau de sévérité</Label>
                              <RadioGroup
                                defaultValue={bugReport.severity}
                                className="mt-1.5"
                                onValueChange={(value) => handleRadioChange('severity', value)}
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="critique" id="r-critical" />
                                  <Label htmlFor="r-critical" className="text-red-300">Critique</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="élevé" id="r-high" />
                                  <Label htmlFor="r-high" className="text-orange-300">Élevé</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="moyen" id="r-medium" />
                                  <Label htmlFor="r-medium" className="text-yellow-300">Moyen</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="faible" id="r-low" />
                                  <Label htmlFor="r-low" className="text-blue-300">Faible</Label>
                                </div>
                              </RadioGroup>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="description" className="text-white">Description de la vulnérabilité</Label>
                            <Textarea
                              id="description"
                              name="description"
                              placeholder="Décrivez la vulnérabilité et son fonctionnement..."
                              className="bg-slate-900 border-slate-700 min-h-[80px] mt-1.5"
                              value={bugReport.description}
                              onChange={handleInputChange}
                            />
                            {formErrors.description && (
                              <p className="text-red-400 text-sm mt-1">{formErrors.description}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="stepsToReproduce" className="text-white">Étapes pour reproduire</Label>
                            <Textarea
                              id="stepsToReproduce"
                              name="stepsToReproduce"
                              placeholder="1. Accéder à la page produit\n2. Insérer le payload dans le champ commentaire\n3. ..."
                              className="bg-slate-900 border-slate-700 min-h-[120px] mt-1.5"
                              value={bugReport.stepsToReproduce}
                              onChange={handleInputChange}
                            />
                            {formErrors.stepsToReproduce && (
                              <p className="text-red-400 text-sm mt-1">{formErrors.stepsToReproduce}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="impactDescription" className="text-white">Impact de la vulnérabilité</Label>
                            <Textarea
                              id="impactDescription"
                              name="impactDescription"
                              placeholder="Quel impact cette vulnérabilité pourrait avoir sur les utilisateurs ou le système..."
                              className="bg-slate-900 border-slate-700 min-h-[80px] mt-1.5"
                              value={bugReport.impactDescription}
                              onChange={handleInputChange}
                            />
                            {formErrors.impactDescription && (
                              <p className="text-red-400 text-sm mt-1">{formErrors.impactDescription}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="proofOfConcept" className="text-white">Preuve de concept (PoC)</Label>
                            <Textarea
                              id="proofOfConcept"
                              name="proofOfConcept"
                              placeholder="Code, payload ou commandes utilisés pour exploiter la vulnérabilité..."
                              className="bg-slate-900 border-slate-700 min-h-[100px] mt-1.5 font-mono text-sm"
                              value={bugReport.proofOfConcept}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Lock className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-slate-300 mb-2">Rapport verrouillé</h3>
                        <p className="text-slate-400 max-w-md mx-auto mb-6">
                          Vous devez commencer le défi pour pouvoir soumettre un rapport.
                        </p>
                        {getProgressButton()}
                      </div>
                    )}
                  </CardContent>
                  {timerRunning && (
                    <CardFooter>
                      <Button
                        className="w-full bg-green-700 hover:bg-green-600"
                        onClick={handleSubmitReport}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                            Soumission en cours...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Soumettre le rapport
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}