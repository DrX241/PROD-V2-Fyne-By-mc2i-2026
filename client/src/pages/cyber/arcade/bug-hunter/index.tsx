import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Trophy,
  Target,
  Search,
  Code,
  Bug,
  Shield,
  Brain,
  Wrench,
  FileType,
  Lock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Info,
  HelpCircle
} from 'lucide-react';

// Types définis pour le module Bug Hunter
interface Challenge {
  id: string;
  title: string;
  description: string;
  category: VulnerabilityCategory;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  points: number;
  completed: boolean;
  locked: boolean;
  prerequisites?: string[];
  environment: {
    type: 'web' | 'api' | 'mobile';
    details: string;
  };
  hints: string[];
}

interface BugReport {
  id: string;
  challengeId: string;
  title: string;
  vulnerability: VulnerabilityCategory;
  severity: 'faible' | 'moyen' | 'élevé' | 'critique';
  description: string;
  stepsToReproduce: string[];
  impactDescription: string;
  proofOfConcept: string;
  submittedAt: Date;
  status: 'en attente' | 'validé' | 'rejeté' | 'en cours de revue';
  score?: number;
  feedback?: string;
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

interface UserStats {
  totalPoints: number;
  rank: string;
  completedChallenges: number;
  validatedReports: number;
  rejectedReports: number;
  averageScore: number;
  badgesEarned: Badge[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  dateEarned: Date;
}

// Composant principal de Bug Hunter
export default function BugHunterPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Requête pour récupérer les défis
  const { 
    data: challenges, 
    isLoading: challengesLoading, 
    error: challengesError 
  } = useQuery({
    queryKey: ['/api/bug-hunter/challenges'],
    retry: false,
  });
  
  // Requête pour récupérer les statistiques utilisateur
  const { 
    data: userStats, 
    isLoading: statsLoading, 
    error: statsError 
  } = useQuery({
    queryKey: ['/api/bug-hunter/user-stats'],
    retry: false,
  });
  
  // Requête pour récupérer les rapports de bugs
  const { 
    data: bugReports, 
    isLoading: reportsLoading, 
    error: reportsError 
  } = useQuery({
    queryKey: ['/api/bug-hunter/reports'],
    retry: false,
  });
  
  // Effet pour afficher un toast en cas d'erreur
  useEffect(() => {
    if (challengesError || statsError || reportsError) {
      toast({
        title: 'Erreur de chargement',
        description: 'Impossible de charger les données. Veuillez réessayer.',
        variant: 'destructive',
      });
    }
  }, [challengesError, statsError, reportsError, toast]);

  // Données de démonstration pour le développement initial
  const mockChallenges: Challenge[] = [
    {
      id: 'web-store-1',
      title: 'E-commerce vulnérable - Niveau 1',
      description: 'Explorez une boutique en ligne et trouvez des vulnérabilités XSS stockées dans les commentaires produits.',
      category: 'XSS',
      difficulty: 'débutant',
      points: 100,
      completed: false,
      locked: false,
      environment: {
        type: 'web',
        details: 'Application web e-commerce avec système de commentaires'
      },
      hints: [
        'Examinez le formulaire de commentaires sur les pages produits',
        'Essayez d\'injecter du code JavaScript simple comme une alerte'
      ]
    },
    {
      id: 'api-bank-1',
      title: 'API Bancaire - Niveau 1',
      description: 'Découvrez les failles IDOR dans cette API bancaire permettant d\'accéder aux comptes d\'autres utilisateurs.',
      category: 'IDOR',
      difficulty: 'intermédiaire',
      points: 200,
      completed: false,
      locked: false,
      environment: {
        type: 'api',
        details: 'API REST avec endpoints pour gérer des comptes bancaires'
      },
      hints: [
        'Analysez les identifiants dans les requêtes',
        'Que se passe-t-il si vous modifiez l\'ID utilisateur dans la requête?'
      ]
    },
    {
      id: 'admin-portal-1',
      title: 'Portail d\'administration - Niveau 1',
      description: 'Tentez de contourner l\'authentification de ce portail admin par injection SQL.',
      category: 'SQLi',
      difficulty: 'avancé',
      points: 300,
      completed: false,
      locked: true,
      prerequisites: ['web-store-1', 'api-bank-1'],
      environment: {
        type: 'web',
        details: 'Interface d\'administration avec connexion et gestion des utilisateurs'
      },
      hints: [
        'Le formulaire de connexion est vulnérable',
        'Analysez comment la requête SQL est construite'
      ]
    }
  ];

  const mockUserStats: UserStats = {
    totalPoints: 0,
    rank: 'Débutant',
    completedChallenges: 0,
    validatedReports: 0,
    rejectedReports: 0,
    averageScore: 0,
    badgesEarned: []
  };

  const mockBugReports: BugReport[] = [];

  // Utiliser les données réelles ou les mocks
  const displayedChallenges = challenges || mockChallenges;
  const displayedUserStats = userStats || mockUserStats;
  const displayedBugReports = bugReports || mockBugReports;

  // Fonction pour démarrer un défi
  const startChallenge = (challengeId: string) => {
    setLocation(`/cyber/arcade/bug-hunter/challenge/${challengeId}`);
  };

  // Rendu de l'icône pour une catégorie de vulnérabilité
  const renderVulnerabilityIcon = (category: VulnerabilityCategory) => {
    switch (category) {
      case 'XSS':
        return <Code className="h-5 w-5" />;
      case 'CSRF':
        return <Shield className="h-5 w-5" />;
      case 'SQLi':
        return <Database className="h-5 w-5" />;
      case 'AuthZ':
      case 'AuthN':
        return <Lock className="h-5 w-5" />;
      case 'BusinessLogic':
        return <Brain className="h-5 w-5" />;
      case 'SSRF':
        return <Globe className="h-5 w-5" />;
      case 'FileUpload':
        return <FileType className="h-5 w-5" />;
      case 'IDOR':
        return <Target className="h-5 w-5" />;
      default:
        return <Bug className="h-5 w-5" />;
    }
  };

  // Rendu du badge de difficulté
  const renderDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'débutant':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Débutant</Badge>;
      case 'intermédiaire':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Intermédiaire</Badge>;
      case 'avancé':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Avancé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // Rendu de l'état d'un rapport
  const renderReportStatus = (status: string) => {
    switch (status) {
      case 'validé':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Validé</Badge>;
      case 'rejeté':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejeté</Badge>;
      case 'en cours de revue':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">En cours de revue</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">En attente</Badge>;
    }
  };

  // Rendu du niveau de sévérité
  const renderSeverityLevel = (severity: string) => {
    switch (severity) {
      case 'critique':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Critique</Badge>;
      case 'élevé':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Élevé</Badge>;
      case 'moyen':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Moyen</Badge>;
      case 'faible':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Faible</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Non défini</Badge>;
    }
  };

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header avec navigation */}
          <div className="flex items-center mb-8">
            <Link href="/cyber/arcade">
              <Button variant="ghost" className="text-white hover:bg-blue-800/20 mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
              </Button>
            </Link>
            <PageTitle title="BUG HUNTER" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Bug Hunter: Sécurité Offensive</h1>
                <p className="text-blue-200 max-w-3xl">
                  Découvrez et exploitez des vulnérabilités dans des environnements sécurisés pour améliorer vos compétences en bug bounty et en sécurité offensive.
                </p>
              </div>
              
              {/* Stats rapides */}
              <div className="flex gap-4 bg-blue-900/30 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{displayedUserStats.totalPoints}</div>
                  <div className="text-xs text-blue-300">POINTS</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{displayedUserStats.completedChallenges}</div>
                  <div className="text-xs text-blue-300">DÉFIS</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{displayedUserStats.validatedReports}</div>
                  <div className="text-xs text-blue-300">RAPPORTS</div>
                </div>
              </div>
            </div>

            {/* Navigation principale */}
            <Tabs 
              defaultValue={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full mb-8 bg-blue-900/20">
                <TabsTrigger value="dashboard" className="flex-1">
                  <Trophy className="mr-2 h-4 w-4" />
                  Tableau de bord
                </TabsTrigger>
                <TabsTrigger value="challenges" className="flex-1">
                  <Target className="mr-2 h-4 w-4" />
                  Défis
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex-1">
                  <Bug className="mr-2 h-4 w-4" />
                  Mes rapports
                </TabsTrigger>
                <TabsTrigger value="learn" className="flex-1">
                  <Book className="mr-2 h-4 w-4" />
                  Apprendre
                </TabsTrigger>
              </TabsList>

              {/* Contenu du tableau de bord */}
              <TabsContent value="dashboard" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-blue-900/20 border-blue-800 text-white">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
                        Progression
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-blue-200">Niveau {displayedUserStats.rank}</span>
                            <span className="text-sm text-blue-200">{displayedUserStats.totalPoints} pts</span>
                          </div>
                          <Progress value={25} className="h-2 bg-blue-950" indicatorClassName="bg-blue-500" />
                        </div>
                        <div className="pt-2">
                          <p className="text-sm text-blue-200">
                            Prochain niveau: <span className="font-medium">Investigateur</span> (300 pts)
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-900/20 border-blue-800 text-white">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <Target className="mr-2 h-5 w-5 text-green-400" />
                        Défis complétés
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Débutant</span>
                        <div className="flex items-center">
                          <span className="mr-2">0/{displayedChallenges.filter(c => c.difficulty === 'débutant').length}</span>
                          <Progress value={0} className="w-20 h-2 bg-blue-950" indicatorClassName="bg-green-500" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Intermédiaire</span>
                        <div className="flex items-center">
                          <span className="mr-2">0/{displayedChallenges.filter(c => c.difficulty === 'intermédiaire').length}</span>
                          <Progress value={0} className="w-20 h-2 bg-blue-950" indicatorClassName="bg-blue-500" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Avancé</span>
                        <div className="flex items-center">
                          <span className="mr-2">0/{displayedChallenges.filter(c => c.difficulty === 'avancé').length}</span>
                          <Progress value={0} className="w-20 h-2 bg-blue-950" indicatorClassName="bg-purple-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-900/20 border-blue-800 text-white">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <Bug className="mr-2 h-5 w-5 text-purple-400" />
                        Rapports soumis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Validés:</span>
                          <span className="font-medium text-green-400">{displayedUserStats.validatedReports}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>En attente:</span>
                          <span className="font-medium text-yellow-400">
                            {displayedBugReports.filter(r => r.status === 'en attente' || r.status === 'en cours de revue').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rejetés:</span>
                          <span className="font-medium text-red-400">{displayedUserStats.rejectedReports}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Score moyen:</span>
                          <span className="font-medium">{displayedUserStats.averageScore || '-'}/10</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Badges gagnés */}
                <Card className="bg-blue-900/20 border-blue-800 text-white">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <Sparkles className="mr-2 h-5 w-5 text-yellow-400" />
                      Badges et récompenses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {displayedUserStats.badgesEarned && displayedUserStats.badgesEarned.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {displayedUserStats.badgesEarned.map(badge => (
                          <div key={badge.id} className="text-center">
                            <div className="w-16 h-16 bg-blue-800/50 rounded-full flex items-center justify-center mx-auto mb-2">
                              {badge.iconName === 'bug' && <Bug className="h-8 w-8 text-purple-400" />}
                              {badge.iconName === 'shield' && <Shield className="h-8 w-8 text-green-400" />}
                              {badge.iconName === 'code' && <Code className="h-8 w-8 text-blue-400" />}
                            </div>
                            <p className="text-sm font-medium">{badge.name}</p>
                            <p className="text-xs text-blue-300">{new Date(badge.dateEarned).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-blue-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Trophy className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-400">Aucun badge gagné pour le moment</p>
                        <p className="text-sm text-blue-300 mt-2">
                          Complétez des défis pour débloquer des badges et des récompenses !
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contenu des défis */}
              <TabsContent value="challenges" className="space-y-6">
                <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
                  <p className="text-blue-200">
                    <Info className="inline mr-2 h-5 w-5" />
                    Choisissez un défi adapté à votre niveau. Complétez les défis de niveau inférieur pour débloquer les plus difficiles.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {challengesLoading ? (
                    <div className="col-span-2 text-center py-12">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                      <p className="mt-4 text-blue-300">Chargement des défis...</p>
                    </div>
                  ) : displayedChallenges.map(challenge => (
                    <Card 
                      key={challenge.id}
                      className={`bg-slate-800/90 border border-slate-700 transition-all ${challenge.locked ? 'opacity-60' : 'hover:border-blue-500'}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div className="flex items-center">
                            {renderVulnerabilityIcon(challenge.category)}
                            <Badge variant="outline" className="ml-2 bg-slate-700">
                              {challenge.category}
                            </Badge>
                          </div>
                          <div>
                            {renderDifficultyBadge(challenge.difficulty)}
                          </div>
                        </div>
                        <CardTitle className="mt-2">{challenge.title}</CardTitle>
                        <CardDescription className="text-blue-200">
                          {challenge.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center mb-2">
                          <Target className="mr-2 h-4 w-4 text-blue-400" />
                          <span className="text-sm text-blue-300">
                            Type: {challenge.environment.type === 'web' ? 'Application Web' : 
                                 challenge.environment.type === 'api' ? 'API REST' : 'Application Mobile'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Trophy className="mr-2 h-4 w-4 text-yellow-400" />
                          <span className="text-sm text-blue-300">{challenge.points} points</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        {challenge.locked ? (
                          <div className="w-full">
                            <Button 
                              variant="outline" 
                              className="w-full bg-slate-800 border-slate-700 text-slate-400"
                              disabled
                            >
                              <Lock className="mr-2 h-4 w-4" />
                              Défi verrouillé
                            </Button>
                            {challenge.prerequisites && (
                              <p className="text-xs text-slate-400 mt-2">
                                Pour débloquer, complétez d'abord les défis précédents
                              </p>
                            )}
                          </div>
                        ) : challenge.completed ? (
                          <Button 
                            variant="outline" 
                            className="w-full bg-green-900/20 border-green-800 text-green-400"
                            onClick={() => startChallenge(challenge.id)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Rejouer le défi
                          </Button>
                        ) : (
                          <Button 
                            className="w-full bg-blue-700 hover:bg-blue-600"
                            onClick={() => startChallenge(challenge.id)}
                          >
                            Commencer le défi
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Contenu des rapports */}
              <TabsContent value="reports" className="space-y-6">
                <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <Info className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="text-blue-200">
                        Consultez vos rapports de vulnérabilités soumis et leur statut. Chaque rapport est évalué sur son impact, sa qualité et sa précision.
                      </p>
                    </div>
                  </div>
                </div>

                {reportsLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                    <p className="mt-4 text-blue-300">Chargement de vos rapports...</p>
                  </div>
                ) : displayedBugReports.length > 0 ? (
                  <div className="space-y-4">
                    {displayedBugReports.map(report => (
                      <Card 
                        key={report.id}
                        className="bg-slate-800/90 border border-slate-700 transition-all"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <div className="flex items-center">
                              <Bug className="h-5 w-5 mr-2" />
                              <Badge variant="outline" className="bg-slate-700">
                                {report.vulnerability}
                              </Badge>
                              {renderSeverityLevel(report.severity)}
                            </div>
                            <div>
                              {renderReportStatus(report.status)}
                            </div>
                          </div>
                          <CardTitle className="mt-2">{report.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <p className="text-sm text-blue-200">{report.description}</p>
                            
                            {report.status === 'validé' && (
                              <div className="mt-2 p-3 bg-green-900/20 border border-green-800 rounded-md">
                                <div className="flex">
                                  <div className="bg-green-900 rounded-full h-6 w-6 flex items-center justify-center mr-2">
                                    <Trophy className="h-3 w-3 text-green-400" />
                                  </div>
                                  <div className="text-sm text-green-400 font-medium">
                                    Score: {report.score}/10
                                  </div>
                                </div>
                                {report.feedback && (
                                  <p className="text-xs mt-2 text-blue-200">{report.feedback}</p>
                                )}
                              </div>
                            )}

                            {report.status === 'rejeté' && (
                              <div className="mt-2 p-3 bg-red-900/20 border border-red-800 rounded-md">
                                <div className="flex">
                                  <div className="bg-red-900 rounded-full h-6 w-6 flex items-center justify-center mr-2">
                                    <AlertCircle className="h-3 w-3 text-red-400" />
                                  </div>
                                  <div className="text-sm text-red-400 font-medium">
                                    Rapport rejeté
                                  </div>
                                </div>
                                {report.feedback && (
                                  <p className="text-xs mt-2 text-blue-200">{report.feedback}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            variant="outline"
                            className="w-full"
                            onClick={() => setLocation(`/cyber/arcade/bug-hunter/report/${report.id}`)}
                          >
                            Voir les détails
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700">
                    <Bug className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-slate-300 mb-2">Aucun rapport soumis</h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                      Vous n'avez pas encore soumis de rapport de vulnérabilité. Complétez des défis pour soumettre vos découvertes.
                    </p>
                    <Button 
                      className="mt-6 bg-blue-700 hover:bg-blue-600"
                      onClick={() => setActiveTab('challenges')}
                    >
                      Explorer les défis
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Contenu d'apprentissage */}
              <TabsContent value="learn" className="space-y-6">
                <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <Book className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="text-blue-200">
                        Ressources d'apprentissage pour améliorer vos compétences en bug bounty et en sécurité offensive.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card className="bg-slate-800/90 border border-slate-700">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Book className="mr-2 h-5 w-5 text-blue-400" />
                          Introduction au Bug Bounty
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="prose prose-invert max-w-none">
                          <p>
                            Le bug bounty est une pratique où des organisations offrent des récompenses aux chercheurs en sécurité
                            qui découvrent et rapportent des vulnérabilités dans leurs systèmes. Cette approche collaborative
                            améliore la sécurité tout en offrant aux chercheurs une reconnaissance pour leurs compétences.
                          </p>
                          
                          <h3 className="text-lg font-medium mt-4 mb-2">Principes fondamentaux</h3>
                          <ul className="space-y-2">
                            <li>Recherchez uniquement sur les systèmes autorisés</li>
                            <li>Respectez toujours le périmètre défini par le programme</li>
                            <li>Documentez précisément vos découvertes</li>
                            <li>Pratiquez une divulgation responsable</li>
                            <li>Ne conservez jamais de données sensibles</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-slate-800/90 border border-slate-700 h-fit">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Wrench className="mr-2 h-5 w-5 text-purple-400" />
                        Outils essentiels
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="burp" className="border-slate-700">
                          <AccordionTrigger className="text-blue-300 hover:text-blue-200">
                            Burp Suite
                          </AccordionTrigger>
                          <AccordionContent className="text-slate-300">
                            Proxy web intermédiaire permettant d'intercepter, d'inspecter et de modifier les requêtes HTTP/HTTPS.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="nmap" className="border-slate-700">
                          <AccordionTrigger className="text-blue-300 hover:text-blue-200">
                            Nmap
                          </AccordionTrigger>
                          <AccordionContent className="text-slate-300">
                            Scanner de ports et outil de découverte réseau, essentiel pour l'énumération initiale.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="owasp-zap" className="border-slate-700">
                          <AccordionTrigger className="text-blue-300 hover:text-blue-200">
                            OWASP ZAP
                          </AccordionTrigger>
                          <AccordionContent className="text-slate-300">
                            Alternative open-source à Burp Suite, avec scanner automatisé et outils d'analyse.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="ffuf" className="border-slate-700">
                          <AccordionTrigger className="text-blue-300 hover:text-blue-200">
                            Ffuf
                          </AccordionTrigger>
                          <AccordionContent className="text-slate-300">
                            Outil rapide de fuzzing web, idéal pour la découverte de contenus cachés et l'énumération.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-slate-800/90 border border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="mr-2 h-5 w-5 text-red-400" />
                      Vulnérabilités courantes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                        <h3 className="text-lg font-medium flex items-center text-white mb-2">
                          <Code className="mr-2 h-5 w-5 text-yellow-400" />
                          Cross-Site Scripting (XSS)
                        </h3>
                        <p className="text-sm text-slate-300">
                          Permet d'injecter des scripts malveillants qui s'exécutent dans le navigateur des utilisateurs.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                        <h3 className="text-lg font-medium flex items-center text-white mb-2">
                          <Database className="mr-2 h-5 w-5 text-blue-400" />
                          Injection SQL
                        </h3>
                        <p className="text-sm text-slate-300">
                          Manipulation des requêtes SQL pour accéder, modifier ou supprimer des données non autorisées.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                        <h3 className="text-lg font-medium flex items-center text-white mb-2">
                          <Shield className="mr-2 h-5 w-5 text-green-400" />
                          CSRF
                        </h3>
                        <p className="text-sm text-slate-300">
                          Force les utilisateurs authentifiés à exécuter des actions non intentionnelles.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                        <h3 className="text-lg font-medium flex items-center text-white mb-2">
                          <Lock className="mr-2 h-5 w-5 text-purple-400" />
                          Broken Authentication
                        </h3>
                        <p className="text-sm text-slate-300">
                          Failles dans les mécanismes d'authentification permettant l'usurpation d'identité.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                        <h3 className="text-lg font-medium flex items-center text-white mb-2">
                          <Globe className="mr-2 h-5 w-5 text-red-400" />
                          SSRF
                        </h3>
                        <p className="text-sm text-slate-300">
                          Manipulation du serveur pour accéder à des ressources internes normalement inaccessibles.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                        <h3 className="text-lg font-medium flex items-center text-white mb-2">
                          <Target className="mr-2 h-5 w-5 text-orange-400" />
                          IDOR
                        </h3>
                        <p className="text-sm text-slate-300">
                          Accès non autorisé aux ressources en manipulant les références d'objets.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Modal d'aide - pourrait être ajouté plus tard */}
    </HomeLayout>
  );
}

// Composants manquants pour l'import
function Database(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}

function Globe(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function Book(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}