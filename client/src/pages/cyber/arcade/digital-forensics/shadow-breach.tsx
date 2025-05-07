import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, FileText, Clock, ChevronRight, 
  Terminal, Database, Network, Eye, Check,
  AlertTriangle, HelpCircle, Search, Download,
  Send, Brain, Fingerprint, RefreshCw, PlusCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

// Types pour les preuves
interface Evidence {
  id: string;
  name: string;
  type: string;
  description: string;
  content: string;
  discovered: boolean;
  metadata?: {
    timestamp?: string;
    size?: string;
    source?: string;
    format?: string;
  };
}

// Types pour les défis
interface Challenge {
  id: string;
  title: string;
  question: string;
  relatedEvidenceIds: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  hints: string[];
  completed: boolean;
}

// Types pour les sessions d'analyse forensique
interface ForensicSession {
  id: string;
  userId: string;
  scenarioId: string;
  discoveredEvidenceIds: string[];
  completedChallengeIds: string[];
  startTime: Date;
  lastActivity: Date;
  score: number;
  status: 'in_progress' | 'completed';
  currentTab?: string;
  userHypothesis?: string;
}

// Types pour les évaluations de réponses aux défis
interface ChallengeEvaluation {
  score: number;
  correct: boolean;
  feedback: string;
  key_insights: string[];
  missing_elements: string[];
  additional_resources: string[];
}

// Types pour les hypothèses d'attaque
interface AttackHypothesis {
  timeline: Array<{
    timestamp: string;
    stage: string;
    technique: string;
    description: string;
  }>;
  attack_vector: string;
  motive: string;
  impact: string;
  indicators_of_compromise: string[];
  additional_comments: string;
  missing_evidence: string[];
  confidence_level: string;
}

export default function ShadowBreach() {
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('briefing');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [challengeList, setChallengeList] = useState<Challenge[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [hypothesisText, setHypothesisText] = useState('');
  const [session, setSession] = useState<ForensicSession | null>(null);
  const [evaluation, setEvaluation] = useState<ChallengeEvaluation | null>(null);
  const [hypothesis, setHypothesis] = useState<AttackHypothesis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGeneratingHypothesis, setIsGeneratingHypothesis] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialiser la session
  useEffect(() => {
    initSession();
  }, []);

  // Timer pour le temps écoulé
  useEffect(() => {
    const interval = setInterval(() => {
      if (session && session.status === 'in_progress') {
        setTimeElapsed(prev => prev + 1);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [session]);

  // Mettre à jour l'onglet actif
  useEffect(() => {
    if (session?.id) {
      updateSessionTab(activeTab);
    }
  }, [activeTab, session]);
  
  // Initialiser les tableaux vides dans session si nécessaire
  useEffect(() => {
    if (session && !session.completedChallengeIds) {
      setSession({
        ...session,
        completedChallengeIds: [],
        discoveredEvidenceIds: session.discoveredEvidenceIds || []
      });
    }
  }, [session]);

  // Fonctions d'interaction avec l'API
  const initSession = async () => {
    try {
      setIsInitializing(true);
      // Dans un vrai système, on devrait récupérer l'ID utilisateur
      const userId = localStorage.getItem('userId') || 'user-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('userId', userId);
      
      const response = await fetch('/api/cyber/arcade/digital-forensics/session/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          scenarioId: 'shadow-breach'
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'initialisation de la session');
      }
      
      const data = await response.json();
      
      if (data.success && data.sessionId) {
        // Assurer que les propriétés nécessaires existent
        const safeSession = {
          ...data.session,
          completedChallengeIds: data.session.completedChallengeIds || [],
          discoveredEvidenceIds: data.session.discoveredEvidenceIds || []
        };
        
        setSession(safeSession);
        loadEvidence(data.sessionId);
        loadChallenges(data.sessionId);
      } else {
        throw new Error('Session invalide');
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la session:', error);
      toast({
        title: "Erreur d'initialisation",
        description: "Impossible d'initialiser la session d'analyse forensique.",
        variant: "destructive"
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const loadEvidence = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/cyber/arcade/digital-forensics/evidence?scenarioId=shadow-breach&sessionId=${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des preuves');
      }
      
      const data = await response.json();
      
      if (data.success && data.evidenceList) {
        setEvidenceList(data.evidenceList);
      } else {
        throw new Error('Données de preuves invalides');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des preuves:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les preuves.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadChallenges = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/cyber/arcade/digital-forensics/challenges?scenarioId=shadow-breach&sessionId=${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des défis');
      }
      
      const data = await response.json();
      
      if (data.success && data.challengeList) {
        setChallengeList(data.challengeList);
      } else {
        throw new Error('Données de défis invalides');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des défis:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les défis.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const discoverEvidence = async (evidenceId: string) => {
    if (!session?.id) return;
    
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', `/api/cyber/arcade/digital-forensics/evidence/shadow-breach/${evidenceId}/${session.id}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la découverte de la preuve');
      }
      
      const data = await response.json();
      
      if (data.success && data.evidence) {
        // Mettre à jour la liste des preuves
        setEvidenceList(prevList => 
          prevList.map(evidence => 
            evidence.id === evidenceId 
              ? { ...evidence, discovered: true } 
              : evidence
          )
        );
        
        setSelectedEvidence(data.evidence);
        
        // Si c'est la première preuve découverte, passer à l'onglet preuves
        if (!evidenceList.some(e => e.discovered)) {
          setActiveTab('evidence');
        }
        
        // Recharger la session pour avoir la liste mise à jour des preuves découvertes
        if (session?.id) {
          await loadSession(session.id);
        }
        
        toast({
          title: "Preuve découverte",
          description: `Vous avez découvert une nouvelle preuve: ${data.evidence.name}`,
        });
      } else {
        throw new Error('Données de preuve invalides');
      }
    } catch (error) {
      console.error('Erreur lors de la découverte de la preuve:', error);
      toast({
        title: "Erreur de découverte",
        description: "Impossible de découvrir cette preuve.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const response = await apiRequest('GET', `/api/cyber/arcade/digital-forensics/session/${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la session');
      }
      
      const data = await response.json();
      
      if (data.success && data.session) {
        setSession(data.session);
      } else {
        throw new Error('Données de session invalides');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la session:', error);
    }
  };

  const updateSessionTab = async (tab: string) => {
    if (!session?.id) return;
    
    try {
      await apiRequest('POST', '/api/cyber/arcade/digital-forensics/session/tab', {
        sessionId: session.id,
        tab: tab
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'onglet de session:', error);
    }
  };

  const submitAnswer = async () => {
    if (!session?.id || !selectedChallenge || !answerText.trim()) return;
    
    try {
      setIsEvaluating(true);
      const response = await apiRequest('POST', '/api/cyber/arcade/digital-forensics/challenge/analyze', {
        sessionId: session.id,
        challengeId: selectedChallenge.id,
        answer: answerText
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse de la réponse');
      }
      
      const data = await response.json();
      
      if (data.success && data.evaluation) {
        setEvaluation(data.evaluation);
        
        // Si la réponse est correcte, marquer le défi comme terminé
        if (data.evaluation.correct) {
          setChallengeList(prevList => 
            prevList.map(challenge => 
              challenge.id === selectedChallenge.id 
                ? { ...challenge, completed: true } 
                : challenge
            )
          );
          
          // Recharger la session pour avoir la liste mise à jour des défis complétés
          if (session?.id) {
            await loadSession(session.id);
          }
          
          toast({
            title: "Défi réussi",
            description: `Vous avez correctement résolu le défi: ${selectedChallenge.title}`,
          });
        } else {
          toast({
            title: "Réponse incorrecte",
            description: "Votre réponse n'est pas suffisamment précise. Consultez l'évaluation pour plus de détails.",
            variant: "destructive"
          });
        }
      } else {
        throw new Error('Données d\'évaluation invalides');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission de la réponse:', error);
      toast({
        title: "Erreur d'évaluation",
        description: "Impossible d'évaluer votre réponse.",
        variant: "destructive"
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const generateHypothesis = async () => {
    if (!session?.id) return;
    
    try {
      setIsGeneratingHypothesis(true);
      const response = await apiRequest('POST', '/api/cyber/arcade/digital-forensics/hypothesis', {
        sessionId: session.id,
        userHypothesis: hypothesisText
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération de l\'hypothèse');
      }
      
      const data = await response.json();
      
      if (data.success && data.hypothesis) {
        setHypothesis(data.hypothesis);
        
        toast({
          title: "Hypothèse générée",
          description: "L'IA a généré une hypothèse d'attaque basée sur vos analyses.",
        });
      } else {
        throw new Error('Données d\'hypothèse invalides');
      }
    } catch (error) {
      console.error('Erreur lors de la génération de l\'hypothèse:', error);
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer l'hypothèse d'attaque.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingHypothesis(false);
    }
  };

  const completeSession = async () => {
    if (!session?.id) return;
    
    try {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/cyber/arcade/digital-forensics/session/complete', {
        sessionId: session.id
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la finalisation de la session');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Mettre à jour la session
        if (session?.id) {
          await loadSession(session.id);
        }
        
        toast({
          title: "Investigation terminée",
          description: "Félicitations! Vous avez terminé l'investigation forensique.",
        });
        
        // Rediriger vers la page d'accueil après un court délai
        setTimeout(() => {
          navigate('/cyber/arcade/digital-forensics');
        }, 3000);
      } else {
        throw new Error('Erreur lors de la finalisation de la session');
      }
    } catch (error) {
      console.error('Erreur lors de la finalisation de la session:', error);
      toast({
        title: "Erreur de finalisation",
        description: "Impossible de finaliser la session d'analyse forensique.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calcul des statistiques
  const calculateProgress = (): number => {
    if (!session || !session.completedChallengeIds || challengeList.length === 0) return 0;
    return Math.floor((session.completedChallengeIds.length / challengeList.length) * 100);
  };

  // Formater le temps écoulé
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fonction pour obtenir l'icône d'une preuve en fonction de son type
  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'log':
        return <FileText className="h-5 w-5 text-blue-400" />;
      case 'file':
        return <Database className="h-5 w-5 text-purple-400" />;
      case 'network':
        return <Network className="h-5 w-5 text-green-400" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  // Fonction pour obtenir la couleur de difficulté
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return "bg-green-900/20 text-green-400 border-green-500/30";
      case 'intermediate':
        return "bg-amber-900/20 text-amber-400 border-amber-500/30";
      case 'advanced':
        return "bg-red-900/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-900/20 text-gray-400 border-gray-700";
    }
  };

  if (isInitializing) {
    return (
      <HomeLayout>
        <PageTitle title="Chargement de l'analyse forensique..." />
        <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-900 via-emerald-900 to-gray-900 flex flex-col items-center justify-center">
          <Fingerprint className="h-16 w-16 text-emerald-400 animate-pulse mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Initialisation de l'environnement forensique</h2>
          <p className="text-gray-300 mb-8">Préparation de votre session d'analyse...</p>
          <Progress 
            value={45} 
            className="w-64 h-2 bg-gray-800" 
          />
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <PageTitle title="Infiltration Fantôme - Analyse Forensique" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-900 via-emerald-900 to-gray-900">
        <div className="absolute inset-0 w-full h-full z-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* En-tête */}
        <div className="relative z-10 w-full mx-auto px-4 py-4 sm:px-6 sm:pt-6 sm:pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
            <div className="flex items-center">
              <Link href="/cyber/arcade/digital-forensics">
                <Button variant="ghost" className="text-white hover:bg-emerald-800/20 mr-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center">
                Infiltration Fantôme 
                <Badge className="ml-3 bg-emerald-700 text-white text-xs">FORENSIC</Badge>
              </h1>
            </div>
            
            {/* Statistiques */}
            <div className="flex space-x-4 mt-4 md:mt-0">
              <div className="flex items-center text-emerald-200">
                <Clock className="h-4 w-4 mr-1 text-emerald-400" />
                <span className="text-sm">{formatTime(timeElapsed)}</span>
              </div>
              <div className="flex items-center text-emerald-200">
                <Search className="h-4 w-4 mr-1 text-emerald-400" />
                <span className="text-sm">{session?.discoveredEvidenceIds.length || 0}/{evidenceList.length} preuves</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${calculateProgress()}%` }}
                        />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-white border-gray-700">
                    <p>Progression: {calculateProgress()}%</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Navigation par onglets */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-gray-800/50 border border-gray-700">
              <TabsTrigger value="briefing" className="data-[state=active]:bg-emerald-700">
                Briefing
              </TabsTrigger>
              <TabsTrigger value="evidence" className="data-[state=active]:bg-emerald-700">
                Preuves <Badge className="ml-1 bg-emerald-800">{session?.discoveredEvidenceIds.length || 0}</Badge>
              </TabsTrigger>
              <TabsTrigger value="challenges" className="data-[state=active]:bg-emerald-700">
                Défis <Badge className="ml-1 bg-emerald-800">{session?.completedChallengeIds.length || 0}</Badge>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-emerald-700">
                Chronologie
              </TabsTrigger>
            </TabsList>
            
            {/* Contenu de l'onglet Briefing */}
            <TabsContent value="briefing" className="pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-gray-900/60 border-gray-800 col-span-1 lg:col-span-2">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Rapport d'incident: FinTech Security Breach
                    </h2>
                    <p className="text-gray-300 mb-4">
                      <strong className="text-emerald-400">Date:</strong> 6 mai 2025<br />
                      <strong className="text-emerald-400">Entreprise:</strong> TradeSphere Financial Technologies<br />
                      <strong className="text-emerald-400">Incident:</strong> Transactions suspectes détectées sur la plateforme
                    </p>
                    <Separator className="my-4 bg-gray-700" />
                    <p className="text-gray-300 mb-4">
                      Le 5 mai 2025, l'équipe de sécurité de TradeSphere a détecté des transactions financières anormales 
                      sur leur plateforme d'échanges. Les transactions semblent avoir été initiées par des comptes légitimes, 
                      mais les montants et les destinataires ne correspondent pas aux modèles habituels.
                    </p>
                    <p className="text-gray-300 mb-4">
                      Une analyse préliminaire suggère qu'un acteur malveillant a pu accéder aux systèmes de l'entreprise et
                      mettre en place un mécanisme pour détourner des fonds. Vous êtes chargé(e) d'analyser les preuves
                      forensiques disponibles pour déterminer:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-1 mb-4 ml-2">
                      <li>Comment l'attaquant a obtenu l'accès initial</li>
                      <li>Comment il a maintenu sa présence dans le système</li>
                      <li>Quelles données ont été exfiltrées</li>
                      <li>Quels mécanismes ont été utilisés pour mener l'attaque</li>
                    </ul>
                    <p className="text-gray-300">
                      Analysez les preuves disponibles, établissez une chronologie de l'attaque et identifiez les tactiques, 
                      techniques et procédures (TTP) utilisées par l'attaquant. <span className="text-emerald-400 font-medium">Cette fois-ci, vous devrez résoudre des défis concrets et vos réponses seront évaluées par une IA spécialisée en analyse forensique.</span>
                    </p>
                    
                    <div className="mt-6 flex justify-end">
                      <Button 
                        className="bg-emerald-700 hover:bg-emerald-800 text-white"
                        onClick={() => setActiveTab('evidence')}
                      >
                        Commencer l'analyse <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="space-y-6 col-span-1">
                  {/* Progression des défis */}
                  <Card className="bg-gray-900/60 border-gray-800">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                        <Check className="h-5 w-5 mr-2 text-emerald-400" />
                        Défis à résoudre
                      </h3>
                      {isLoading ? (
                        <div className="space-y-4">
                          <div className="flex items-start">
                            <Skeleton className="w-5 h-5 rounded-full mt-0.5" />
                            <div className="ml-3 space-y-2">
                              <Skeleton className="w-40 h-5" />
                              <Skeleton className="w-64 h-3" />
                            </div>
                          </div>
                          <div className="flex items-start">
                            <Skeleton className="w-5 h-5 rounded-full mt-0.5" />
                            <div className="ml-3 space-y-2">
                              <Skeleton className="w-48 h-5" />
                              <Skeleton className="w-64 h-3" />
                            </div>
                          </div>
                          <div className="flex items-start">
                            <Skeleton className="w-5 h-5 rounded-full mt-0.5" />
                            <div className="ml-3 space-y-2">
                              <Skeleton className="w-44 h-5" />
                              <Skeleton className="w-64 h-3" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {challengeList.map((challenge) => (
                            <div key={challenge.id} className="relative">
                              <div className="flex items-start">
                                <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center ${challenge.completed ? 'bg-emerald-600' : 'bg-gray-700'}`}>
                                  {challenge.completed && <Check className="h-3 w-3 text-white" />}
                                </div>
                                <div className="ml-3">
                                  <h4 className={`font-medium ${challenge.completed ? 'text-emerald-400' : 'text-gray-300'}`}>
                                    {challenge.title}
                                  </h4>
                                  <p className="text-gray-400 text-sm mt-1">
                                    {challenge.difficulty === 'beginner' && 'Niveau débutant'}
                                    {challenge.difficulty === 'intermediate' && 'Niveau intermédiaire'}
                                    {challenge.difficulty === 'advanced' && 'Niveau avancé'}
                                    {' • '}{challenge.points} points
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Aide / Conseils */}
                  <Card className="bg-gray-900/60 border-gray-800">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-white flex items-center">
                          <HelpCircle className="h-5 w-5 mr-2 text-amber-400" />
                          Besoin d'aide?
                        </h3>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-amber-400 border-amber-400/30 hover:bg-amber-900/20"
                          onClick={() => setShowHint(!showHint)}
                        >
                          {showHint ? 'Masquer' : 'Indice'}
                        </Button>
                      </div>
                      
                      {showHint ? (
                        <div className="bg-amber-950/20 border border-amber-800/30 rounded-md p-3 text-amber-200 text-sm">
                          <p>Commencez par examiner les journaux d'authentification pour identifier toute activité suspecte 
                          comme des tentatives de connexion échouées ou des connexions à des heures inhabituelles.</p>
                          <p className="mt-2">Recherchez ensuite des preuves de mouvements latéraux ou d'élévation de privilèges 
                          dans les journaux de sécurité.</p>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">
                          Si vous êtes bloqué(e), vous pouvez demander un indice. 
                          Cela n'affectera pas votre progression, mais essayez d'abord de résoudre par vous-même!
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Contenu de l'onglet Preuves */}
            <TabsContent value="evidence" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <Card className="bg-gray-900/60 border-gray-800 h-full">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-medium text-white mb-4 flex items-center">
                        <Search className="h-5 w-5 mr-2 text-emerald-400" />
                        Preuves disponibles
                      </h2>
                      {isLoading ? (
                        <div className="space-y-3">
                          <Skeleton className="w-full h-16" />
                          <Skeleton className="w-full h-16" />
                          <Skeleton className="w-full h-16" />
                        </div>
                      ) : (
                        <>
                          <div className="space-y-3">
                            {evidenceList.filter(e => e.discovered).length === 0 && (
                              <p className="text-gray-400 text-sm italic">
                                Aucune preuve découverte pour le moment. Commencez par explorer les serveurs.
                              </p>
                            )}
                            
                            {evidenceList.filter(e => e.discovered).map((evidence) => (
                              <div 
                                key={evidence.id}
                                className={`flex items-center p-3 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors border ${selectedEvidence?.id === evidence.id ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-gray-800'}`}
                                onClick={() => setSelectedEvidence(evidence)}
                              >
                                <div className="mr-3">
                                  {getEvidenceIcon(evidence.type)}
                                </div>
                                <div>
                                  <h3 className="text-white font-medium text-sm">{evidence.name}</h3>
                                  <p className="text-gray-400 text-xs">{evidence.type}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <Separator className="my-5 bg-gray-700" />
                          
                          <h3 className="text-md font-medium text-white mb-3">Explorer les serveurs</h3>
                          <div className="space-y-3">
                            {evidenceList.filter(e => !e.discovered).map((evidence) => (
                              <div 
                                key={evidence.id}
                                className="flex items-center p-3 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors border border-gray-800"
                                onClick={() => discoverEvidence(evidence.id)}
                              >
                                <div className="mr-3 text-gray-500">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                  <h3 className="text-gray-300 font-medium text-sm">{evidence.name}</h3>
                                  <p className="text-gray-500 text-xs">{evidence.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  {selectedEvidence ? (
                    <Card className="bg-gray-900/60 border-gray-800 h-full">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h2 className="text-lg font-medium text-white flex items-center">
                              {getEvidenceIcon(selectedEvidence.type)}
                              <span className="ml-2">{selectedEvidence.name}</span>
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">{selectedEvidence.description}</p>
                          </div>
                          <div className="text-right">
                            {selectedEvidence.metadata?.timestamp && (
                              <div className="text-xs text-gray-400">Collecté le {selectedEvidence.metadata.timestamp}</div>
                            )}
                            {selectedEvidence.metadata?.size && (
                              <div className="text-xs text-gray-400">Taille: {selectedEvidence.metadata.size}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-gray-950 border border-gray-800 rounded-md p-4 font-mono text-xs text-gray-300 overflow-x-auto whitespace-pre mt-4">
                          {selectedEvidence.content}
                        </div>
                        
                        <div className="mt-6 flex justify-end space-x-3">
                          <Button 
                            variant="outline"
                            className="text-blue-400 border-blue-500/30 hover:bg-blue-900/20"
                          >
                            <Download className="h-4 w-4 mr-2" /> Exporter
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                className="bg-emerald-700 hover:bg-emerald-800 text-white"
                              >
                                <Brain className="h-4 w-4 mr-2" /> Analyser avec IA
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800 text-white">
                              <DialogHeader>
                                <DialogTitle>Analyse de preuve avec IA</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                  L'IA vous aide à extraire des indices et des observations clés de cette preuve.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-3 py-4">
                                <h4 className="text-emerald-400 text-sm font-medium">Observations critiques:</h4>
                                {selectedEvidence.type === 'log' && (
                                  <ul className="space-y-2 text-gray-200">
                                    <li className="flex items-start">
                                      <div className="text-emerald-400 mr-2 mt-0.5">•</div>
                                      <span>Des tentatives d'accès au compte root depuis l'IP 198.51.100.43 sont visibles, suggérant une tentative de brute force.</span>
                                    </li>
                                    <li className="flex items-start">
                                      <div className="text-emerald-400 mr-2 mt-0.5">•</div>
                                      <span>Une connexion réussie au compte "admin" depuis la même IP a été établie à 04:37:01.</span>
                                    </li>
                                    <li className="flex items-start">
                                      <div className="text-emerald-400 mr-2 mt-0.5">•</div>
                                      <span>Un nouvel utilisateur "newuser" a été créé et a exécuté des commandes suspectes avec privilèges root.</span>
                                    </li>
                                    <li className="flex items-start">
                                      <div className="text-emerald-400 mr-2 mt-0.5">•</div>
                                      <span>Des actions d'élévation de privilèges sont visibles, notamment la création d'un binaire setuid dans /tmp/.hidden/bsh.</span>
                                    </li>
                                  </ul>
                                )}
                                
                                {selectedEvidence.type === 'network' && (
                                  <ul className="space-y-2 text-gray-200">
                                    <li className="flex items-start">
                                      <div className="text-emerald-400 mr-2 mt-0.5">•</div>
                                      <span>Des connexions SSH depuis l'IP 198.51.100.43 vers le serveur fintech coïncident avec les heures d'accès non autorisés.</span>
                                    </li>
                                    <li className="flex items-start">
                                      <div className="text-emerald-400 mr-2 mt-0.5">•</div>
                                      <span>Une connexion inhabituelle vers le port 6667 (IRC) à 203.0.113.5 indique un probable canal de commande et contrôle (C2).</span>
                                    </li>
                                    <li className="flex items-start">
                                      <div className="text-emerald-400 mr-2 mt-0.5">•</div>
                                      <span>Un large transfert de données (8192 octets) vers 203.0.113.5 sur le port 1337 suggère une exfiltration de données sensibles.</span>
                                    </li>
                                  </ul>
                                )}
                                
                                {selectedEvidence.type === 'file' && (
                                  <ul className="space-y-2 text-gray-200">
                                    <li className="flex items-start">
                                      <div className="text-emerald-400 mr-2 mt-0.5">•</div>
                                      <span>Un compte utilisateur "newuser" a été créé récemment (le 03/05/2025).</span>
                                    </li>
                                    <li className="flex items-start">
                                      <div className="text-emerald-400 mr-2 mt-0.5">•</div>
                                      <span>Ce compte n'est pas associé à un département ou une fonction légitime dans l'entreprise.</span>
                                    </li>
                                    <li className="flex items-start">
                                      <div className="text-emerald-400 mr-2 mt-0.5">•</div>
                                      <span>La création de ce compte coïncide avec la période des activités suspectes identifiées.</span>
                                    </li>
                                  </ul>
                                )}
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setActiveTab('challenges')}
                                >
                                  Répondre aux défis <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-gray-900/60 border-gray-800 h-full">
                      <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                        <div className="p-6 rounded-full bg-gray-800/50">
                          <Eye className="h-12 w-12 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-400 mt-4">Sélectionnez une preuve</h3>
                        <p className="text-gray-500 text-center max-w-md mt-2">
                          Choisissez une preuve dans la liste à gauche pour l'examiner ou explorez les serveurs pour en découvrir de nouvelles.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Contenu de l'onglet Défis */}
            <TabsContent value="challenges" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <Card className="bg-gray-900/60 border-gray-800 h-full">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-medium text-white mb-4 flex items-center">
                        <Brain className="h-5 w-5 mr-2 text-emerald-400" />
                        Défis à résoudre
                      </h2>
                      {isLoading ? (
                        <div className="space-y-4">
                          <Skeleton className="w-full h-24" />
                          <Skeleton className="w-full h-24" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {challengeList.length === 0 && (
                            <p className="text-gray-400 text-sm italic">
                              Aucun défi disponible. Explorez d'abord les preuves pour débloquer les défis.
                            </p>
                          )}
                          
                          {challengeList.map((challenge) => (
                            <div 
                              key={challenge.id}
                              className={`p-4 rounded-lg border cursor-pointer hover:bg-gray-800/50 transition-colors ${selectedChallenge?.id === challenge.id ? 'border-emerald-500/50 bg-emerald-900/10' : (challenge.completed ? 'border-emerald-800/50 bg-emerald-900/5' : 'border-gray-800')}`}
                              onClick={() => {
                                setSelectedChallenge(challenge);
                                setAnswerText('');
                                setEvaluation(null);
                              }}
                            >
                              <div className="flex items-start">
                                <div className={`p-1 rounded mr-3 ${challenge.completed ? 'bg-emerald-900/50' : 'bg-gray-800'}`}>
                                  {challenge.completed ? (
                                    <Check className="h-5 w-5 text-emerald-400" />
                                  ) : (
                                    <Brain className="h-5 w-5 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <h3 className={`font-medium ${challenge.completed ? 'text-emerald-400' : 'text-white'}`}>
                                    {challenge.title}
                                  </h3>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
                                      {challenge.difficulty === 'beginner' && 'Débutant'}
                                      {challenge.difficulty === 'intermediate' && 'Intermédiaire'}
                                      {challenge.difficulty === 'advanced' && 'Avancé'}
                                    </Badge>
                                    <Badge variant="outline" className="bg-gray-800/40 text-white border-gray-700">
                                      {challenge.points} points
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  {selectedChallenge ? (
                    <Card className="bg-gray-900/60 border-gray-800 h-full">
                      <CardContent className="p-6">
                        <h2 className="text-xl font-medium text-white mb-2">
                          {selectedChallenge.title}
                        </h2>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline" className={getDifficultyColor(selectedChallenge.difficulty)}>
                            {selectedChallenge.difficulty === 'beginner' && 'Débutant'}
                            {selectedChallenge.difficulty === 'intermediate' && 'Intermédiaire'}
                            {selectedChallenge.difficulty === 'advanced' && 'Avancé'}
                          </Badge>
                          <Badge variant="outline" className="bg-gray-800/40 text-white border-gray-700">
                            {selectedChallenge.points} points
                          </Badge>
                          {selectedChallenge.completed && (
                            <Badge variant="outline" className="bg-emerald-900/20 text-emerald-400 border-emerald-700/30">
                              Complété
                            </Badge>
                          )}
                        </div>
                        
                        <div className="bg-gray-800/50 border border-gray-700 rounded-md p-4 mb-4">
                          <p className="text-gray-100">{selectedChallenge.question}</p>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-sm text-emerald-400 mb-1 flex items-center">
                            <FileText className="h-4 w-4 mr-1" /> Preuves associées
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedChallenge.relatedEvidenceIds.map((evidenceId) => {
                              const evidence = evidenceList.find(e => e.id === evidenceId);
                              return evidence ? (
                                <Badge 
                                  key={evidenceId} 
                                  variant="outline" 
                                  className={`cursor-pointer ${evidence.discovered ? 'bg-blue-900/20 text-blue-400 border-blue-700/30' : 'bg-gray-800 text-gray-400 border-gray-700'}`}
                                  onClick={() => {
                                    if (evidence.discovered) {
                                      setSelectedEvidence(evidence);
                                      setActiveTab('evidence');
                                    } else {
                                      toast({
                                        title: "Preuve non découverte",
                                        description: "Explorez d'abord cette preuve dans l'onglet Preuves.",
                                        variant: "destructive"
                                      });
                                    }
                                  }}
                                >
                                  {evidence.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                        
                        {selectedChallenge.hints.length > 0 && (
                          <div className="mb-6">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="text-sm text-amber-400 flex items-center">
                                <HelpCircle className="h-4 w-4 mr-1" /> Indices disponibles
                              </h4>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-6 px-2 text-amber-400"
                                  onClick={() => setCurrentHintIndex(prev => Math.max(0, prev - 1))}
                                  disabled={currentHintIndex === 0}
                                >
                                  &lt;
                                </Button>
                                <span className="text-xs text-gray-400">
                                  {currentHintIndex + 1}/{selectedChallenge.hints.length}
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-6 px-2 text-amber-400"
                                  onClick={() => setCurrentHintIndex(prev => Math.min(selectedChallenge.hints.length - 1, prev + 1))}
                                  disabled={currentHintIndex === selectedChallenge.hints.length - 1}
                                >
                                  &gt;
                                </Button>
                              </div>
                            </div>
                            <div className="bg-amber-950/20 border border-amber-800/30 rounded-md p-3 text-amber-200 text-sm">
                              <p>{selectedChallenge.hints[currentHintIndex]}</p>
                            </div>
                          </div>
                        )}
                        
                        {evaluation && (
                          <div className={`mb-6 p-4 rounded-md border ${evaluation.correct ? 'bg-emerald-900/20 border-emerald-800/30' : 'bg-red-900/20 border-red-800/30'}`}>
                            <h4 className={`font-medium mb-2 ${evaluation.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                              {evaluation.correct ? 'Réponse correcte!' : 'Réponse incorrecte'}
                              <span className="text-sm font-normal ml-2">
                                Score: {evaluation.score}/100
                              </span>
                            </h4>
                            <p className="text-gray-200 text-sm mb-3">{evaluation.feedback}</p>
                            
                            {evaluation.key_insights.length > 0 && (
                              <div className="mb-3">
                                <h5 className="text-xs uppercase text-gray-400 mb-1">Points clés identifiés</h5>
                                <ul className="space-y-1">
                                  {evaluation.key_insights.map((insight, index) => (
                                    <li key={index} className="text-xs flex items-start">
                                      <div className="text-emerald-500 mr-1.5 mt-0.5">✓</div>
                                      <span className="text-gray-300">{insight}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {evaluation.missing_elements.length > 0 && (
                              <div className="mb-3">
                                <h5 className="text-xs uppercase text-gray-400 mb-1">Éléments manquants</h5>
                                <ul className="space-y-1">
                                  {evaluation.missing_elements.map((element, index) => (
                                    <li key={index} className="text-xs flex items-start">
                                      <div className="text-red-500 mr-1.5 mt-0.5">✗</div>
                                      <span className="text-gray-300">{element}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {evaluation.additional_resources.length > 0 && (
                              <div>
                                <h5 className="text-xs uppercase text-gray-400 mb-1">Ressources additionnelles</h5>
                                <ul className="space-y-1">
                                  {evaluation.additional_resources.map((resource, index) => (
                                    <li key={index} className="text-xs flex items-start">
                                      <div className="text-blue-500 mr-1.5 mt-0.5">→</div>
                                      <span className="text-gray-300">{resource}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="space-y-3">
                          <h4 className="text-sm text-white">Votre réponse:</h4>
                          <Textarea 
                            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                            placeholder="Entrez votre réponse détaillée ici..."
                            rows={6}
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            disabled={isEvaluating || selectedChallenge.completed}
                          />
                        </div>
                        
                        <div className="mt-6 flex justify-end space-x-3">
                          {selectedChallenge.completed ? (
                            <Button
                              variant="outline"
                              className="text-emerald-400 border-emerald-400/30"
                              onClick={() => {
                                const nextChallengeIndex = challengeList.findIndex(c => c.id === selectedChallenge.id) + 1;
                                if (nextChallengeIndex < challengeList.length) {
                                  setSelectedChallenge(challengeList[nextChallengeIndex]);
                                  setAnswerText('');
                                  setEvaluation(null);
                                }
                              }}
                            >
                              Défi suivant <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          ) : (
                            <Button 
                              className="bg-emerald-700 hover:bg-emerald-800 text-white"
                              onClick={submitAnswer}
                              disabled={!answerText.trim() || isEvaluating}
                            >
                              {isEvaluating ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> 
                                  Analyse en cours...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4 mr-2" /> 
                                  Soumettre la réponse
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-gray-900/60 border-gray-800 h-full">
                      <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                        <div className="p-6 rounded-full bg-gray-800/50">
                          <Brain className="h-12 w-12 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-400 mt-4">Sélectionnez un défi</h3>
                        <p className="text-gray-500 text-center max-w-md mt-2">
                          Choisissez un défi dans la liste à gauche pour commencer à l'analyser et à y répondre.
                          Examinez d'abord les preuves pour mieux comprendre l'incident.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Contenu de l'onglet Chronologie */}
            <TabsContent value="timeline" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <Card className="bg-gray-900/60 border-gray-800">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-medium text-white mb-6 flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-emerald-400" />
                        Chronologie de l'attaque
                      </h2>
                      
                      {session?.completedChallengeIds.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <Terminal className="h-8 w-8 text-gray-600" />
                          </div>
                          <h3 className="text-gray-400 text-lg mb-2">Chronologie en construction</h3>
                          <p className="text-gray-500 max-w-md mx-auto">
                            Résolvez des défis pour reconstruire la chronologie de l'attaque.
                            Chaque défi résolu vous permettra de mieux comprendre le déroulement de l'incident.
                          </p>
                        </div>
                      ) : (
                        <>
                          {!hypothesis ? (
                            <div className="space-y-4">
                              <p className="text-gray-300">
                                Vous avez résolu {session.completedChallengeIds.length} défi(s) sur {challengeList.length}.
                                Vous pouvez maintenant formuler une hypothèse complète de l'attaque.
                              </p>
                              
                              <div className="space-y-3">
                                <Textarea 
                                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                                  placeholder="Décrivez votre hypothèse sur le déroulement de l'attaque, les techniques utilisées, et les motivations de l'attaquant..."
                                  rows={8}
                                  value={hypothesisText}
                                  onChange={(e) => setHypothesisText(e.target.value)}
                                  disabled={isGeneratingHypothesis}
                                />
                                
                                <div className="flex justify-end">
                                  <Button 
                                    className="bg-emerald-700 hover:bg-emerald-800 text-white"
                                    onClick={generateHypothesis}
                                    disabled={isGeneratingHypothesis}
                                  >
                                    {isGeneratingHypothesis ? (
                                      <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> 
                                        Génération en cours...
                                      </>
                                    ) : (
                                      <>
                                        <Brain className="h-4 w-4 mr-2" /> 
                                        Générer la chronologie avec IA
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="p-4 bg-blue-900/10 border border-blue-800/20 rounded-md">
                                <h3 className="text-lg font-medium text-blue-300 mb-1">Vecteur d'attaque</h3>
                                <p className="text-gray-300">{hypothesis.attack_vector}</p>
                              </div>
                              
                              <div className="relative border-l-2 border-gray-700 pl-6 ml-3 space-y-8">
                                {hypothesis.timeline.map((event, index) => (
                                  <div key={index} className="relative">
                                    <div className="absolute -left-[34px] bg-emerald-700 w-6 h-6 rounded-full flex items-center justify-center">
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    </div>
                                    <div>
                                      <div className="flex items-baseline gap-3 flex-wrap mb-1">
                                        <h3 className="text-emerald-400 font-medium">{event.stage}</h3>
                                        <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-700/30">
                                          {event.technique}
                                        </Badge>
                                      </div>
                                      <p className="text-gray-300 mt-1">
                                        {event.description}
                                      </p>
                                      <p className="text-gray-400 text-sm mt-2">{event.timestamp}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                <div className="p-4 bg-amber-900/10 border border-amber-800/20 rounded-md">
                                  <h3 className="text-lg font-medium text-amber-300 mb-1">Motivation</h3>
                                  <p className="text-gray-300">{hypothesis.motive}</p>
                                </div>
                                
                                <div className="p-4 bg-red-900/10 border border-red-800/20 rounded-md">
                                  <h3 className="text-lg font-medium text-red-300 mb-1">Impact</h3>
                                  <p className="text-gray-300">{hypothesis.impact}</p>
                                </div>
                              </div>
                              
                              <div className="p-4 bg-emerald-900/10 border border-emerald-800/20 rounded-md">
                                <h3 className="text-lg font-medium text-emerald-300 mb-2">Indicateurs de compromission (IOC)</h3>
                                <ul className="space-y-1 text-gray-300">
                                  {hypothesis.indicators_of_compromise.map((ioc, index) => (
                                    <li key={index} className="flex items-start">
                                      <div className="text-emerald-500 mr-2 mt-0.5">•</div>
                                      <span>{ioc}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              {hypothesis.missing_evidence.length > 0 && (
                                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-md">
                                  <h3 className="text-lg font-medium text-gray-300 mb-2">Preuves manquantes</h3>
                                  <ul className="space-y-1 text-gray-400">
                                    {hypothesis.missing_evidence.map((evidence, index) => (
                                      <li key={index} className="flex items-start">
                                        <div className="text-gray-500 mr-2 mt-0.5">•</div>
                                        <span>{evidence}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {hypothesis.additional_comments && (
                                <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-md">
                                  <h3 className="text-lg font-medium text-gray-300 mb-1">Commentaires additionnels</h3>
                                  <p className="text-gray-400">{hypothesis.additional_comments}</p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {calculateProgress() >= 50 && (
                            <div className="mt-8 p-4 bg-emerald-900/20 border border-emerald-800/50 rounded-lg">
                              <h3 className="text-emerald-400 font-medium text-lg mb-2 flex items-center">
                                <Check className="h-5 w-5 mr-2" /> Investigation complétée
                              </h3>
                              <p className="text-gray-300">
                                Félicitations! Vous avez réussi à reconstruire la chronologie de l'attaque et à 
                                identifier les principales techniques utilisées par l'attaquant. Ces informations sont 
                                cruciales pour remédier à l'incident et améliorer la sécurité des systèmes de TradeSphere.
                              </p>
                              <div className="mt-4 flex justify-end">
                                <Button 
                                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                                  onClick={completeSession}
                                  disabled={isLoading}
                                >
                                  {isLoading ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> 
                                      Finalisation...
                                    </>
                                  ) : (
                                    <>
                                      Terminer l'investigation
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="col-span-1">
                  <Card className="bg-gray-900/60 border-gray-800 mb-6">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                        <Check className="h-5 w-5 mr-2 text-emerald-400" />
                        Progression
                      </h3>
                      <div>
                        <div className="flex justify-between text-xs text-emerald-200 mb-1">
                          <span>Investigation</span>
                          <span>{calculateProgress()}%</span>
                        </div>
                        <Progress value={calculateProgress()} className="h-2 bg-gray-800" />
                      </div>
                      <div className="mt-4 text-xs text-gray-400">
                        <span className="text-amber-400 font-medium">{session?.completedChallengeIds.length || 0}/{challengeList.length}</span> défis résolus
                      </div>
                      
                      <Separator className="my-4 bg-gray-700" />
                      
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-white">Statistiques</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-800/50 rounded-md p-3">
                            <div className="text-gray-400 text-xs mb-1">Preuves découvertes</div>
                            <div className="text-lg font-medium text-emerald-400">
                              {session?.discoveredEvidenceIds.length || 0}/{evidenceList.length}
                            </div>
                          </div>
                          <div className="bg-gray-800/50 rounded-md p-3">
                            <div className="text-gray-400 text-xs mb-1">Score</div>
                            <div className="text-lg font-medium text-emerald-400">
                              {session?.score || 0} pts
                            </div>
                          </div>
                          <div className="bg-gray-800/50 rounded-md p-3">
                            <div className="text-gray-400 text-xs mb-1">Temps écoulé</div>
                            <div className="text-lg font-medium text-emerald-400">
                              {formatTime(timeElapsed)}
                            </div>
                          </div>
                          <div className="bg-gray-800/50 rounded-md p-3">
                            <div className="text-gray-400 text-xs mb-1">Niveau max.</div>
                            <div className="text-lg font-medium text-emerald-400">
                              {(() => {
                                const completedDifficulties = challengeList
                                  .filter(c => session?.completedChallengeIds.includes(c.id))
                                  .map(c => c.difficulty);
                                
                                if (completedDifficulties.includes('advanced')) return 'Avancé';
                                if (completedDifficulties.includes('intermediate')) return 'Intermédiaire';
                                if (completedDifficulties.includes('beginner')) return 'Débutant';
                                return 'Aucun';
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-900/60 border-gray-800">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium text-white mb-3">Conseils d'analyse</h3>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-start">
                          <div className="text-emerald-500 mr-2 mt-0.5">•</div>
                          <span>Recherchez des motifs d'activité anormale dans les logs d'authentification.</span>
                        </li>
                        <li className="flex items-start">
                          <div className="text-emerald-500 mr-2 mt-0.5">•</div>
                          <span>Comparez les adresses IP entre différentes sources de preuves pour établir des corrélations.</span>
                        </li>
                        <li className="flex items-start">
                          <div className="text-emerald-500 mr-2 mt-0.5">•</div>
                          <span>Vérifiez les commandes exécutées par les utilisateurs, particulièrement celles avec élévation de privilèges.</span>
                        </li>
                        <li className="flex items-start">
                          <div className="text-emerald-500 mr-2 mt-0.5">•</div>
                          <span>Élaborez une chronologie des événements pour comprendre la séquence d'actions de l'attaquant.</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </HomeLayout>
  );
}