import React, { useState, useEffect } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { Loader2, ArrowLeft, Book, Code, Gamepad2, Trophy, Brain } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import HomeLayout from '@/components/layout/HomeLayout';

const CustomModule = () => {
  const [match, params] = useRoute('/custom-module/:id');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [module, setModule] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    // Si aucun paramètre d'ID n'est trouvé, retourner à la page d'accueil
    if (!params || !params.id) {
      navigate('/');
      return;
    }

    // Pour éviter les appels API répétitifs
    const moduleId = params.id;
    const cachedFetch = {};
    const cacheKey = `module-${moduleId}`;

    // Vérifier si nous avons déjà les données du module
    if (module && module.id === parseInt(moduleId)) {
      return;
    }

    let isMounted = true;

    const fetchModule = async () => {
      try {
        if (cachedFetch[cacheKey]) {
          return;
        }

        cachedFetch[cacheKey] = true;
        setLoading(true);
        
        const response = await fetch(`/api/module-generator/modules/${moduleId}`);
        
        if (!response.ok) {
          throw new Error('Module non trouvé');
        }

        const data = await response.json();
        if (data.success && data.module && isMounted) {
          console.log("Module chargé:", data.module);
          setModule(data.module);
        } else {
          throw new Error(data.message || 'Erreur lors du chargement du module');
        }
      } catch (error) {
        console.error('Erreur:', error);
        if (isMounted) {
          toast({
            title: 'Erreur',
            description: error instanceof Error ? error.message : 'Une erreur est survenue lors du chargement du module',
            variant: 'destructive',
          });
          navigate('/');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchModule();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  // Fonction pour formater le niveau de difficulté
  const formatDifficulty = (difficulty: string) => {
    switch(difficulty) {
      case 'beginner':
        return 'Débutant';
      case 'intermediate':
        return 'Intermédiaire';
      case 'advanced':
        return 'Avancé';
      default:
        return difficulty;
    }
  };

  // Fonction pour formater le niveau de gamification
  const formatGamification = (level: string) => {
    switch(level) {
      case 'leger':
        return 'Léger';
      case 'modere':
        return 'Modéré';
      case 'eleve':
        return 'Élevé';
      default:
        return level;
    }
  };

  // Fonction pour formater le style d'apprentissage
  const formatLearningStyle = (style: string) => {
    switch(style) {
      case 'reading':
        return 'Lecture';
      case 'interactive':
        return 'Interactif';
      case 'mixed':
        return 'Mixte';
      default:
        return style;
    }
  };

  // Fonction pour générer la couleur de l'icône de badge en fonction du niveau de difficulté
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'beginner':
        return 'bg-green-500 text-white';
      case 'intermediate':
        return 'bg-yellow-500 text-white';
      case 'advanced':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Page de chargement
  if (loading) {
    return (
      <HomeLayout>
        <div className="h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg font-medium">Chargement du module...</p>
          </div>
        </div>
      </HomeLayout>
    );
  }

  // Si le module n'est pas trouvé
  if (!module) {
    return (
      <HomeLayout>
        <div className="h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium mb-4">Module non trouvé</p>
            <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
          </div>
        </div>
      </HomeLayout>
    );
  }

  // Récupération des données du module
  const { moduleData } = module;

  return (
    <HomeLayout>
      <div className="container mx-auto py-8 px-4">
        {/* En-tête avec bouton de retour */}
        <div className="flex items-center mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate('/')} className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-blue-800 dark:text-white">{module.iamName}</h1>
            <p className="text-gray-600 dark:text-gray-300">{module.description}</p>
          </div>
        </div>

        {/* Informations du module */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Domaine</p>
                  <p>{module.domain}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Difficulté</p>
                  <Badge className={`${getDifficultyColor(module.difficulty)}`}>
                    {formatDifficulty(module.difficulty)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gamification</p>
                  <p>{formatGamification(module.gamificationLevel)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Style d'apprentissage</p>
                  <p>{formatLearningStyle(module.learningStyle)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sujets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {module.topics && module.topics.map((topic: string, index: number) => (
                  <Badge key={index} variant="outline">{topic}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Composants du module</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {module.includeTrainerModule && (
                  <div className="flex items-center">
                    <Book className="h-4 w-4 mr-2 text-green-500" />
                    <span>Module Trainer</span>
                  </div>
                )}
                {module.includeOpsModule && (
                  <div className="flex items-center">
                    <Code className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Module OPS</span>
                  </div>
                )}
                {module.includeTestModule && (
                  <div className="flex items-center">
                    <Gamepad2 className="h-4 w-4 mr-2 text-purple-500" />
                    <span>Module Test</span>
                  </div>
                )}
                {module.includeAscensionModule && (
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 mr-2 text-amber-500" />
                    <span>Module Ascension</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenu détaillé du module */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 md:grid-cols-5 lg:flex mb-8">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            {module.includeTrainerModule && (
              <TabsTrigger value="trainer">Trainer</TabsTrigger>
            )}
            {module.includeOpsModule && (
              <TabsTrigger value="ops">OPS</TabsTrigger>
            )}
            {module.includeTestModule && (
              <TabsTrigger value="test">Test</TabsTrigger>
            )}
            {module.includeAscensionModule && (
              <TabsTrigger value="ascension">Ascension</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vue d'ensemble du module</CardTitle>
                <CardDescription>Description générale et structure du module</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-gray-700 dark:text-gray-300">{moduleData?.description || module.description}</p>
                </div>
                {moduleData?.contentStructure && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Structure du contenu</h3>
                    <p className="text-gray-700 dark:text-gray-300">{moduleData.contentStructure}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => navigate('/')}>
                  Retour à l'accueil
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Module Trainer */}
          {module.includeTrainerModule && (
            <TabsContent value="trainer">
              <Card>
                <CardHeader>
                  <CardTitle>{moduleData?.trainerModule?.name || 'Module Trainer'}</CardTitle>
                  <CardDescription>Module théorique et connaissances fondamentales</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {moduleData?.trainerModule?.description && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Description</h3>
                      <p className="text-gray-700 dark:text-gray-300">{moduleData.trainerModule.description}</p>
                    </div>
                  )}
                  
                  {moduleData?.trainerModule?.features && moduleData.trainerModule.features.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Caractéristiques</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                        {moduleData.trainerModule.features.map((feature: string, index: number) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {moduleData?.trainerModule?.contentOutline && moduleData.trainerModule.contentOutline.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Plan du contenu</h3>
                      <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                        {moduleData.trainerModule.contentOutline.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Module OPS */}
          {module.includeOpsModule && (
            <TabsContent value="ops">
              <Card>
                <CardHeader>
                  <CardTitle>{moduleData?.opsModule?.name || 'Module OPS'}</CardTitle>
                  <CardDescription>Module pratique et applications concrètes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {moduleData?.opsModule?.description && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Description</h3>
                      <p className="text-gray-700 dark:text-gray-300">{moduleData.opsModule.description}</p>
                    </div>
                  )}
                  
                  {moduleData?.opsModule?.features && moduleData.opsModule.features.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Caractéristiques</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                        {moduleData.opsModule.features.map((feature: string, index: number) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {moduleData?.opsModule?.contentOutline && moduleData.opsModule.contentOutline.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Plan du contenu</h3>
                      <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                        {moduleData.opsModule.contentOutline.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Module Test */}
          {module.includeTestModule && (
            <TabsContent value="test">
              <Card>
                <CardHeader>
                  <CardTitle>{moduleData?.testModule?.name || 'Module Test'}</CardTitle>
                  <CardDescription>Module d'évaluation et de vérification des connaissances</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {moduleData?.testModule?.description && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Description</h3>
                      <p className="text-gray-700 dark:text-gray-300">{moduleData.testModule.description}</p>
                    </div>
                  )}
                  
                  {moduleData?.testModule?.features && moduleData.testModule.features.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Caractéristiques</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                        {moduleData.testModule.features.map((feature: string, index: number) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {moduleData?.testModule?.contentOutline && moduleData.testModule.contentOutline.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Plan du contenu</h3>
                      <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                        {moduleData.testModule.contentOutline.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Module Ascension */}
          {module.includeAscensionModule && (
            <TabsContent value="ascension">
              <Card>
                <CardHeader>
                  <CardTitle>{moduleData?.ascensionModule?.name || 'Module Ascension'}</CardTitle>
                  <CardDescription>Module avancé et perfectionnement des compétences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {moduleData?.ascensionModule?.description && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Description</h3>
                      <p className="text-gray-700 dark:text-gray-300">{moduleData.ascensionModule.description}</p>
                    </div>
                  )}
                  
                  {moduleData?.ascensionModule?.features && moduleData.ascensionModule.features.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Caractéristiques</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                        {moduleData.ascensionModule.features.map((feature: string, index: number) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {moduleData?.ascensionModule?.contentOutline && moduleData.ascensionModule.contentOutline.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Plan du contenu</h3>
                      <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                        {moduleData.ascensionModule.contentOutline.map((item: string, index: number) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </HomeLayout>
  );
};

export default CustomModule;