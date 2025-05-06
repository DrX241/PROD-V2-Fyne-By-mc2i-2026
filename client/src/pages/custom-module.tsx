import React, { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Loader2, ArrowLeft, Book, Code, Gamepad2, Trophy, Home, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import HomeLayout from '@/components/layout/HomeLayout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from 'framer-motion';

const CustomModule = () => {
  const [match, params] = useRoute('/custom-module/:id');
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [module, setModule] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    // Si aucun paramètre d'ID n'est trouvé, retourner à la page d'accueil
    if (!params || !params.id) {
      navigate('/');
      return;
    }

    // Pour éviter les appels API répétitifs
    const moduleId = params.id;
    const cachedFetch: Record<string, boolean> = {};
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

  // Fonction pour supprimer le module
  const deleteModule = async () => {
    try {
      if (!module || !params?.id) return;
      
      setIsDeleting(true);
      const moduleId = params.id;
      
      const response = await fetch(`/api/module-generator/modules/${moduleId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du module');
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Succès',
          description: 'Module supprimé avec succès',
          variant: 'default',
        });
        navigate('/');
      } else {
        throw new Error(data.message || 'Erreur lors de la suppression du module');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression du module',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Fonction pour obtenir le gradient du module en fonction du domaine
  const getModuleGradient = (domain: string) => {
    switch (domain.toLowerCase()) {
      case 'cybersécurité':
      case 'cybersecurite':
      case 'cyber':
        return 'from-blue-700 to-blue-900';
      case 'data science':
      case 'data & ia':
      case 'data':
      case 'ia':
        return 'from-indigo-700 to-indigo-900';
      case 'developpement web':
      case 'développement web':
      case 'web':
      case 'développement':
      case 'developpement':
        return 'from-purple-700 to-purple-900';
      case 'ux/ui':
        return 'from-pink-700 to-pink-900';
      default:
        return 'from-blue-700 to-blue-900';
    }
  };

  // Page de chargement
  if (loading) {
    return (
      <HomeLayout>
        <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-800 via-gray-900 to-blue-900 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-white" />
            <p className="text-lg font-medium text-white">Chargement du module...</p>
          </div>
        </div>
      </HomeLayout>
    );
  }

  // Si le module n'est pas trouvé
  if (!module) {
    return (
      <HomeLayout>
        <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-800 via-gray-900 to-blue-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium mb-4 text-white">Module non trouvé</p>
            <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white">
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </HomeLayout>
    );
  }

  // Récupération des données du module
  const { moduleData } = module;
  const moduleGradient = getModuleGradient(module.domain);
  
  const getModuleComponents = () => {
    const components = [];
    
    if (module.includeTrainerModule) {
      components.push({
        id: 'trainer',
        title: `${module.domain.toUpperCase()}TRAINER`,
        description: moduleData?.trainerModule?.description || "Module théorique et connaissances fondamentales",
        icon: <Book className="h-5 w-5 mr-2" />,
        gradient: 'from-green-700 to-green-900'
      });
    }
    
    if (module.includeOpsModule) {
      components.push({
        id: 'ops',
        title: `${module.domain.toUpperCase()}OPS`,
        description: moduleData?.opsModule?.description || "Module pratique et application des connaissances",
        icon: <Code className="h-5 w-5 mr-2" />,
        gradient: 'from-blue-700 to-blue-900'
      });
    }
    
    if (module.includeTestModule) {
      components.push({
        id: 'test',
        title: `${module.domain.toUpperCase()}TEST`,
        description: moduleData?.testModule?.description || "Module d'évaluation des connaissances",
        icon: <Gamepad2 className="h-5 w-5 mr-2" />,
        gradient: 'from-purple-700 to-purple-900'
      });
    }
    
    if (module.includeAscensionModule) {
      components.push({
        id: 'ascension',
        title: `${module.domain.toUpperCase()}ASCENSION`,
        description: moduleData?.ascensionModule?.description || "Module avancé et perfectionnement",
        icon: <Trophy className="h-5 w-5 mr-2" />,
        gradient: 'from-amber-700 to-amber-900'
      });
    }
    
    return components;
  };

  const moduleComponents = getModuleComponents();

  return (
    <HomeLayout>
      {/* Boîte de dialogue de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Êtes-vous sûr de vouloir supprimer ce module personnalisé ? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
              disabled={isDeleting}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={deleteModule}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-800 via-gray-900 to-blue-900">
        {/* Bouton retour à l'accueil */}
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4 mr-2" />
            Accueil
          </Button>
        </div>
        
        {/* Bouton supprimer */}
        <div className="absolute top-4 right-4 z-20">
          <Button 
            variant="outline" 
            className="bg-red-500/20 border-red-500/30 text-white hover:bg-red-500/40 hover:text-white"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
        
        {/* Arrière-plan cybersécurité simplifié */}
        <div className="absolute inset-0 w-full h-full opacity-20">
          <div className="absolute inset-0 bg-[#001529] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 bottom-0 grid grid-cols-12 gap-3 opacity-30">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-r border-blue-500/20 h-full"></div>
              ))}
            </div>
            <div className="absolute top-0 left-0 right-0 bottom-0 grid grid-rows-12 gap-3 opacity-30">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-b border-blue-500/20 w-full"></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="relative z-10 max-w-[1600px] w-full mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 mt-4"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
              {module.iamName}
            </h1>
            <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto">
              {module.description}
            </p>
          </motion.div>

          {/* Sélecteur de modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-3 sm:px-6 max-w-full mx-auto">
            {moduleComponents.map((component, index) => (
              <motion.div
                key={component.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative overflow-hidden shadow-xl transform transition-all duration-300 hover:shadow-2xl rounded-xl"
                onMouseEnter={() => setHoveredButton(component.id)}
                onMouseLeave={() => setHoveredButton(null)}
                onClick={() => setActiveTab(component.id)}
              >
                {/* Gradient background */}
                <div className={`bg-gradient-to-br ${component.gradient} p-5 lg:p-6 h-full flex flex-col relative overflow-hidden rounded-xl cursor-pointer`}>
                  {/* Glow effect on hover */}
                  {hoveredButton === component.id && (
                    <div className="absolute inset-0 bg-white opacity-5"></div>
                  )}
                  
                  {/* Éléments décoratifs */}
                  <div className="absolute h-16 w-16 -top-8 -right-8 bg-white opacity-20 rounded-full blur-md"></div>
                  
                  <div className="flex flex-col h-full relative z-10">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg sm:text-xl font-bold text-white mb-3">
                        {component.title}
                      </h2>
                      {component.icon}
                    </div>
                    
                    <p className="text-blue-100 mb-4 text-sm flex-grow">
                      {component.description.length > 120 ? 
                        `${component.description.substring(0, 120)}...` : 
                        component.description
                      }
                    </p>
                    
                    <div className="flex items-center mt-auto">
                      <span className="text-white text-sm font-medium">Explorer</span>
                      <div className="ml-auto text-white bg-white/20 p-1 rounded-full">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contenu détaillé du module sélectionné */}
          <div className="mt-12">
            <div className={activeTab === 'overview' ? 'block' : 'hidden'}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-white shadow-xl border border-white/20"
              >
                <h2 className="text-2xl font-bold mb-4">Vue d'ensemble du module</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-medium mb-2 text-blue-200">Description</h3>
                    <p className="text-gray-200">{moduleData?.description || module.description}</p>
                  </div>
                  
                  {moduleData?.contentStructure && (
                    <div>
                      <h3 className="text-xl font-medium mb-2 text-blue-200">Structure du contenu</h3>
                      <p className="text-gray-200">{moduleData.contentStructure}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <h4 className="font-medium mb-2 text-blue-200">Domaine</h4>
                      <p className="text-white">{module.domain}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <h4 className="font-medium mb-2 text-blue-200">Difficulté</h4>
                      <p className="text-white">{
                        module.difficulty === 'beginner' ? 'Débutant' :
                        module.difficulty === 'intermediate' ? 'Intermédiaire' : 
                        module.difficulty === 'advanced' ? 'Avancé' : 
                        module.difficulty
                      }</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <h4 className="font-medium mb-2 text-blue-200">Style d'apprentissage</h4>
                      <p className="text-white">{
                        module.learningStyle === 'reading' ? 'Lecture' :
                        module.learningStyle === 'interactive' ? 'Interactif' : 
                        module.learningStyle === 'mixed' ? 'Mixte' : 
                        module.learningStyle
                      }</p>
                    </div>
                  </div>
                  
                  {/* Sujets */}
                  {module.topics && module.topics.length > 0 && (
                    <div>
                      <h3 className="text-xl font-medium mb-2 text-blue-200">Sujets</h3>
                      <div className="flex flex-wrap gap-2">
                        {module.topics.map((topic: string, index: number) => (
                          <span key={index} className="bg-blue-500/20 text-blue-100 px-3 py-1 rounded-full text-sm">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Module Trainer */}
            {module.includeTrainerModule && (
              <div className={activeTab === 'trainer' ? 'block' : 'hidden'}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-white shadow-xl border border-white/20"
                >
                  <div className="flex items-center mb-4">
                    <Button 
                      variant="outline" 
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white mr-4"
                      onClick={() => setActiveTab('overview')}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Retour
                    </Button>
                    <h2 className="text-2xl font-bold">{moduleData?.trainerModule?.name || `${module.domain.toUpperCase()}TRAINER`}</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {moduleData?.trainerModule?.description && (
                      <div>
                        <h3 className="text-xl font-medium mb-2 text-blue-200">Description</h3>
                        <p className="text-gray-200">{moduleData.trainerModule.description}</p>
                      </div>
                    )}
                    
                    {moduleData?.trainerModule?.features && moduleData.trainerModule.features.length > 0 && (
                      <div>
                        <h3 className="text-xl font-medium mb-2 text-blue-200">Caractéristiques</h3>
                        <ul className="space-y-2 text-gray-200">
                          {moduleData.trainerModule.features.map((feature: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="inline-block h-2 w-2 bg-green-400 rounded-full mt-2 mr-2"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {moduleData?.trainerModule?.contentOutline && moduleData.trainerModule.contentOutline.length > 0 && (
                      <div>
                        <h3 className="text-xl font-medium mb-2 text-blue-200">Plan du contenu</h3>
                        <ol className="space-y-2 text-gray-200 list-decimal list-inside">
                          {moduleData.trainerModule.contentOutline.map((item: string, index: number) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Module OPS */}
            {module.includeOpsModule && (
              <div className={activeTab === 'ops' ? 'block' : 'hidden'}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-white shadow-xl border border-white/20"
                >
                  <div className="flex items-center mb-4">
                    <Button 
                      variant="outline" 
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white mr-4"
                      onClick={() => setActiveTab('overview')}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Retour
                    </Button>
                    <h2 className="text-2xl font-bold">{moduleData?.opsModule?.name || `${module.domain.toUpperCase()}OPS`}</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {moduleData?.opsModule?.description && (
                      <div>
                        <h3 className="text-xl font-medium mb-2 text-blue-200">Description</h3>
                        <p className="text-gray-200">{moduleData.opsModule.description}</p>
                      </div>
                    )}
                    
                    {moduleData?.opsModule?.features && moduleData.opsModule.features.length > 0 && (
                      <div>
                        <h3 className="text-xl font-medium mb-2 text-blue-200">Caractéristiques</h3>
                        <ul className="space-y-2 text-gray-200">
                          {moduleData.opsModule.features.map((feature: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="inline-block h-2 w-2 bg-blue-400 rounded-full mt-2 mr-2"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {moduleData?.opsModule?.contentOutline && moduleData.opsModule.contentOutline.length > 0 && (
                      <div>
                        <h3 className="text-xl font-medium mb-2 text-blue-200">Plan du contenu</h3>
                        <ol className="space-y-2 text-gray-200 list-decimal list-inside">
                          {moduleData.opsModule.contentOutline.map((item: string, index: number) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Module Test */}
            {module.includeTestModule && (
              <div className={activeTab === 'test' ? 'block' : 'hidden'}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-white shadow-xl border border-white/20"
                >
                  <div className="flex items-center mb-4">
                    <Button 
                      variant="outline" 
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white mr-4"
                      onClick={() => setActiveTab('overview')}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Retour
                    </Button>
                    <h2 className="text-2xl font-bold">{moduleData?.testModule?.name || `${module.domain.toUpperCase()}TEST`}</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {moduleData?.testModule?.description && (
                      <div>
                        <h3 className="text-xl font-medium mb-2 text-blue-200">Description</h3>
                        <p className="text-gray-200">{moduleData.testModule.description}</p>
                      </div>
                    )}
                    
                    {moduleData?.testModule?.features && moduleData.testModule.features.length > 0 && (
                      <div>
                        <h3 className="text-xl font-medium mb-2 text-blue-200">Caractéristiques</h3>
                        <ul className="space-y-2 text-gray-200">
                          {moduleData.testModule.features.map((feature: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="inline-block h-2 w-2 bg-purple-400 rounded-full mt-2 mr-2"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {moduleData?.testModule?.contentOutline && moduleData.testModule.contentOutline.length > 0 && (
                      <div>
                        <h3 className="text-xl font-medium mb-2 text-blue-200">Plan du contenu</h3>
                        <ol className="space-y-2 text-gray-200 list-decimal list-inside">
                          {moduleData.testModule.contentOutline.map((item: string, index: number) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Module Ascension */}
            {module.includeAscensionModule && (
              <div className={activeTab === 'ascension' ? 'block' : 'hidden'}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-white shadow-xl border border-white/20"
                >
                  <div className="flex items-center mb-4">
                    <Button 
                      variant="outline" 
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white mr-4"
                      onClick={() => setActiveTab('overview')}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Retour
                    </Button>
                    <h2 className="text-2xl font-bold">{moduleData?.ascensionModule?.name || `${module.domain.toUpperCase()}ASCENSION`}</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {moduleData?.ascensionModule?.description && (
                      <div>
                        <h3 className="text-xl font-medium mb-2 text-blue-200">Description</h3>
                        <p className="text-gray-200">{moduleData.ascensionModule.description}</p>
                      </div>
                    )}
                    
                    {moduleData?.ascensionModule?.features && moduleData.ascensionModule.features.length > 0 && (
                      <div>
                        <h3 className="text-xl font-medium mb-2 text-blue-200">Caractéristiques</h3>
                        <ul className="space-y-2 text-gray-200">
                          {moduleData.ascensionModule.features.map((feature: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="inline-block h-2 w-2 bg-amber-400 rounded-full mt-2 mr-2"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {moduleData?.ascensionModule?.contentOutline && moduleData.ascensionModule.contentOutline.length > 0 && (
                      <div>
                        <h3 className="text-xl font-medium mb-2 text-blue-200">Plan du contenu</h3>
                        <ol className="space-y-2 text-gray-200 list-decimal list-inside">
                          {moduleData.ascensionModule.contentOutline.map((item: string, index: number) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default CustomModule;