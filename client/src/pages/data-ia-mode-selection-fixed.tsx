import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { IoSearchOutline, IoBookOutline, IoDesktopOutline, IoTrophyOutline, IoConstructOutline } from 'react-icons/io5';
import { IoMdArrowForward, IoMdHome } from 'react-icons/io';
import { RiTeamLine, RiFilterLine } from 'react-icons/ri';
import { TbLayoutGrid, TbList, TbChartDots } from 'react-icons/tb';
import { BsBarChartFill, BsLightbulb, BsDatabaseFill, BsCpu, BsGraphUp, BsBarChartLine, BsBriefcase, BsGearFill } from 'react-icons/bs';
import { AiOutlineZoomIn, AiOutlineZoomOut } from 'react-icons/ai';
import { FiHelpCircle, FiMoon, FiSun } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

// Types pour l'organisation des modules
interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  destination: string;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé' | 'tous niveaux';
  duration: string;
  isNew?: boolean;
  comingSoon?: boolean;
}

interface LearningObjective {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  modules: string[]; // IDs des modules recommandés
  gradient: string;
  categories?: string[]; // Optionnel: Catégories pour l'objectif
}

interface CareerPath {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  skills: string[];
  modules: string[]; // IDs des modules recommandés
  gradient: string;
}

export default function DataIAModeSelectionFixed() {
  // États
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [textSize, setTextSize] = useState(1); // 1 = normal, >1 = larger, <1 = smaller
  const [, setLocation] = useLocation();

  // Liste complète des modules Data & IA
  const modules: Module[] = [
    // SE FORMER
    {
      id: 'data-academy',
      title: 'Data Academy',
      description: 'Formation complète aux fondamentaux de la Data Science : statistiques, Python, visualisation de données et Machine Learning.',
      icon: <BsBarChartFill className="w-5 h-5 text-white" />,
      destination: '#',
      difficulty: 'débutant',
      duration: '8-10h',
      comingSoon: true
    },
    {
      id: 'ml-bootcamp',
      title: 'Machine Learning Bootcamp',
      description: 'Immersion intensive dans les algorithmes de Machine Learning et leurs applications pratiques.',
      icon: <BsCpu className="w-5 h-5 text-white" />,
      destination: '#',
      difficulty: 'intermédiaire',
      duration: '6-8h',
      comingSoon: true
    },
    {
      id: 'data-trainer',
      title: 'Data Trainer',
      description: 'Modules d\'auto-formation personnalisés pour progresser à votre rythme dans les différents domaines de la Data Science.',
      icon: <IoBookOutline className="w-5 h-5 text-white" />,
      destination: '/data/learning-center/trainer',
      difficulty: 'tous niveaux',
      duration: '1-20h'
    },
    
    // S'ENTRAÎNER
    {
      id: 'data-playground',
      title: 'Data Playground',
      description: 'Environnement interactif pour tester vos compétences en Data Science sur des jeux de données réels.',
      icon: <TbChartDots className="w-5 h-5 text-white" />,
      destination: '#',
      difficulty: 'intermédiaire',
      duration: '1-3h',
      comingSoon: true
    },
    {
      id: 'ml-arena',
      title: 'ML Arena',
      description: 'Compétitions et défis de Machine Learning pour tester vos compétences et améliorer vos modèles.',
      icon: <IoTrophyOutline className="w-5 h-5 text-white" />,
      destination: '#',
      difficulty: 'avancé',
      duration: '3-6h',
      comingSoon: true
    },
    
    // S'ÉVALUER
    {
      id: 'data-certification',
      title: 'Data Certification',
      description: 'Évaluations complètes pour certifier vos compétences en Data Science et Intelligence Artificielle.',
      icon: <BsGraphUp className="w-5 h-5 text-white" />,
      destination: '#',
      difficulty: 'tous niveaux',
      duration: '1-2h',
      comingSoon: true
    },
    {
      id: 'ia-interview-sim',
      title: 'IA Interview Simulator',
      description: 'Préparation aux entretiens techniques dans le domaine de l\'IA avec feedback personnalisé.',
      icon: <RiTeamLine className="w-5 h-5 text-white" />,
      destination: '#',
      difficulty: 'intermédiaire',
      duration: '30-45min',
      comingSoon: true
    },
    
    // CRÉER/AUTOMATISER
    {
      id: 'data-assistant',
      title: 'Data Assistant',
      description: 'Créez votre assistant IA personnalisé spécialisé en analyse de données et visualisation.',
      icon: <IoConstructOutline className="w-5 h-5 text-white" />,
      destination: '#',
      difficulty: 'tous niveaux',
      duration: 'Variable',
      comingSoon: true
    },
    {
      id: 'data-ascension',
      title: 'Data Ascension',
      description: 'Parcours complet pour viser les certifications Data ou affiner son expertise sur des sujets avancés.',
      icon: <BsBarChartLine className="w-5 h-5 text-white" />,
      destination: '#',
      difficulty: 'avancé',
      duration: '20-30h',
      comingSoon: true,
      isNew: true
    }
  ];

  // Objectifs d'apprentissage
  const learningObjectives: LearningObjective[] = [
    {
      id: 'data-fundamentals',
      title: 'Fondamentaux de la Data',
      description: 'Maîtrisez les concepts de base de la Data Science et de l\'analyse de données pour démarrer votre parcours.',
      icon: <BsDatabaseFill className="w-6 h-6 text-white" />,
      gradient: 'from-blue-600 to-blue-900',
      modules: ['data-academy', 'data-trainer']
    },
    {
      id: 'ml-expertise',
      title: 'Expertise en Machine Learning',
      description: 'Développez vos compétences en algorithmes d\'apprentissage automatique et applications pratiques.',
      icon: <BsCpu className="w-6 h-6 text-white" />,
      gradient: 'from-purple-600 to-purple-900',
      modules: ['ml-bootcamp', 'ml-arena', 'data-trainer']
    },
    {
      id: 'career-data',
      title: 'Carrière en Data Science',
      description: 'Préparez-vous efficacement pour une carrière dans le domaine de la Data Science et de l\'IA.',
      icon: <BsGraphUp className="w-6 h-6 text-white" />,
      gradient: 'from-green-600 to-green-900',
      modules: ['data-certification', 'ia-interview-sim', 'data-ascension']
    },
    {
      id: 'data-visualization',
      title: 'Visualisation de données',
      description: 'Apprenez à créer des visualisations efficaces pour communiquer vos analyses de données.',
      icon: <BsBarChartFill className="w-6 h-6 text-white" />,
      gradient: 'from-amber-600 to-amber-900',
      modules: ['data-academy', 'data-playground', 'data-trainer']
    }
  ];

  // Parcours métiers
  const careerPaths: CareerPath[] = [
    {
      id: 'data-analyst',
      title: 'Data Analyst',
      description: 'Devenez expert dans l\'analyse et l\'interprétation des données pour guider les décisions stratégiques.',
      icon: <BsBarChartFill className="w-6 h-6 text-white" />,
      skills: ['SQL', 'Visualisation', 'Statistiques', 'Excel/Tableau', 'Storytelling'],
      modules: ['data-academy', 'data-trainer', 'data-playground'],
      gradient: 'from-blue-600 to-blue-900'
    },
    {
      id: 'data-scientist',
      title: 'Data Scientist',
      description: 'Maîtrisez l\'extraction de connaissances à partir de données complexes via des méthodes statistiques avancées.',
      icon: <BsLightbulb className="w-6 h-6 text-white" />,
      skills: ['Machine Learning', 'Python/R', 'Statistiques avancées', 'Big Data', 'Modélisation'],
      modules: ['ml-bootcamp', 'data-trainer', 'ml-arena', 'data-certification'],
      gradient: 'from-purple-600 to-purple-900'
    },
    {
      id: 'ml-engineer',
      title: 'ML Engineer',
      description: 'Spécialisez-vous dans la conception et le déploiement de systèmes d\'apprentissage automatique.',
      icon: <BsCpu className="w-6 h-6 text-white" />,
      skills: ['MLOps', 'Python', 'Cloud', 'TensorFlow/PyTorch', 'CI/CD'],
      modules: ['ml-bootcamp', 'ml-arena', 'data-ascension'],
      gradient: 'from-green-600 to-green-900'
    },
    {
      id: 'ai-specialist',
      title: 'AI Specialist',
      description: 'Développez une expertise dans les systèmes d\'intelligence artificielle avancés et leur application.',
      icon: <IoConstructOutline className="w-6 h-6 text-white" />,
      skills: ['Deep Learning', 'NLP', 'Computer Vision', 'Reinforcement Learning', 'Ethics'],
      modules: ['ml-bootcamp', 'data-assistant', 'data-ascension', 'ia-interview-sim'],
      gradient: 'from-amber-600 to-amber-900'
    }
  ];
  
  // Filtrage des modules en fonction de la recherche
  const filteredModules = modules.filter((module) =>
    module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <HomeLayout>
      <PageTitle title="I AM Data & IA" />
      <div 
        className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-800 via-[#006a9e] to-blue-900"
        style={{ fontSize: `${textSize}rem` }}
      >
        {/* Bouton retour à l'accueil */}
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="outline" 
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-md border-0 hover:from-blue-700 hover:to-blue-800"
            onClick={() => setLocation('/')}
          >
            <IoMdHome className="h-4 w-4 mr-2" />
            Accueil
          </Button>
        </div>

        {/* Outils d'accessibilité */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {/* Bouton du guide */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-blue-900/30 border-blue-800 text-white hover:bg-blue-800/50"
                  data-id="help-button"
                >
                  <FiHelpCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Guide d'utilisation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Contrôle mode haut contraste */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  size="icon"
                  className={`w-10 h-10 rounded-full ${
                    highContrastMode 
                      ? 'bg-blue-700 border-blue-600 text-white hover:bg-blue-600' 
                      : 'bg-blue-900/30 border-blue-800 text-white hover:bg-blue-800/50'
                  }`}
                  onClick={() => setHighContrastMode(!highContrastMode)}
                  data-id="contrast-button"
                >
                  {highContrastMode ? (
                    <FiSun className="h-5 w-5" />
                  ) : (
                    <FiMoon className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{highContrastMode ? 'Désactiver' : 'Activer'} le mode haut contraste</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="w-9 h-9 rounded-full bg-blue-900/30 border-blue-800 text-white hover:bg-blue-800/50"
                    onClick={() => setTextSize(Math.max(0.8, textSize - 0.1))}
                    data-id="text-smaller-button"
                  >
                    <AiOutlineZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Réduire la taille du texte</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="w-9 h-9 rounded-full bg-blue-900/30 border-blue-800 text-white hover:bg-blue-800/50"
                    onClick={() => setTextSize(Math.min(1.2, textSize + 0.1))}
                    data-id="text-larger-button"
                  >
                    <AiOutlineZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Augmenter la taille du texte</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="relative z-10 max-w-[1600px] w-full mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <div className="text-center mb-10 sm:mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold mb-3"
            >
              Centre de Formation - I AM Data & IA
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto"
            >
              Développez vos compétences en Data Science, Machine Learning et Intelligence Artificielle
            </motion.p>
            
            {/* Barre de recherche et filtres */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 max-w-xl mx-auto relative"
            >
              <div className="relative">
                <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Rechercher un module..."
                  className="pl-10 pr-4 py-2 w-full bg-white/10 border-white/20 text-white placeholder-blue-200/70 focus:border-blue-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </motion.div>
          </div>

          {/* Onglets principaux */}
          <Tabs defaultValue="objectifs" className="w-full" data-id="main-tabs">
            <TabsList className={`w-full mb-4 ${
              highContrastMode ? 'bg-gray-800 border border-gray-700' : 'bg-white/10'
            }`}>
              <TabsTrigger 
                value="objectifs" 
                className={`flex-1 flex items-center justify-center ${
                  highContrastMode ? 'data-[state=active]:bg-blue-900 text-white' : ''
                }`}
                data-id="objectives-tab"
              >
                <IoBookOutline className="h-5 w-5 mr-2" />
                Par objectif d'apprentissage
              </TabsTrigger>
              <TabsTrigger 
                value="metiers" 
                className={`flex-1 flex items-center justify-center ${
                  highContrastMode ? 'data-[state=active]:bg-blue-900 text-white' : ''
                }`}
                data-id="careers-tab"
              >
                <BsBriefcase className="h-5 w-5 mr-2" />
                Par métier
              </TabsTrigger>
              <TabsTrigger 
                value="tous" 
                className={`flex-1 flex items-center justify-center ${
                  highContrastMode ? 'data-[state=active]:bg-blue-900 text-white' : ''
                }`}
                data-id="all-modules-tab"
              >
                <BsGearFill className="h-5 w-5 mr-2" />
                Tous les modules
              </TabsTrigger>
            </TabsList>
            
            {/* Vue Tous les modules */}
            <TabsContent value="tous" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredModules.map((module) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="relative"
                    onMouseEnter={() => setHoveredModule(module.id)}
                    onMouseLeave={() => setHoveredModule(null)}
                  >
                    <div className={`rounded-xl p-6 h-full bg-gradient-to-br from-blue-900 to-slate-900 ${module.comingSoon ? 'opacity-70' : ''}`} data-id={`module-${module.id}`}>
                      <div className="flex flex-col h-full">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="p-2 rounded-full bg-blue-700/50">
                            {module.icon}
                          </div>
                          <div className="flex-1">
                            <h2 className="text-xl font-bold text-white mb-1 line-clamp-2">{module.title}</h2>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs text-white border-white/30">
                                {module.difficulty}
                              </Badge>
                              <Badge variant="outline" className="text-xs text-white border-white/30">
                                {module.duration}
                              </Badge>
                              {module.isNew && (
                                <Badge className="bg-blue-600 text-white">NOUVEAU</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-blue-100 line-clamp-2">
                          {module.description}
                        </p>
                        
                        <div className="mt-auto pt-4">
                          {module.comingSoon ? (
                            <Badge variant="outline" className="bg-gray-700 text-gray-100 w-full flex justify-center py-2">
                              Bientôt disponible
                            </Badge>
                          ) : (
                            <Link href={module.destination} className="w-full">
                              <Button variant="secondary" className="w-full">
                                Accéder au module
                                <IoMdArrowForward className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            
            {/* Vue par objectifs d'apprentissage */}
            <TabsContent value="objectifs" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {learningObjectives.map((objective) => (
                  <motion.div
                    key={objective.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <div className={`rounded-xl p-6 h-full bg-gradient-to-br ${objective.gradient}`} data-id={`objective-${objective.id}`}>
                      <div className="flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-full bg-white/10">
                            {objective.icon}
                          </div>
                          <h2 className="text-xl font-bold text-white">
                            {objective.title}
                          </h2>
                        </div>
                        
                        <p className="mb-4 text-blue-100">
                          {objective.description}
                        </p>
                        
                        <div className="mt-auto">
                          <h3 className="text-white font-medium mb-2">Modules recommandés:</h3>
                          <ul className="space-y-2">
                            {objective.modules.map((moduleId) => {
                              const moduleInfo = modules.find(m => m.id === moduleId);
                              return moduleInfo ? (
                                <li key={moduleId}>
                                  <Link 
                                    href={moduleInfo.comingSoon ? "#" : moduleInfo.destination}
                                    className="block p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium text-white">{moduleInfo.title}</span>
                                      <IoMdArrowForward className="h-4 w-4 text-white" />
                                      {moduleInfo.comingSoon && (
                                        <Badge variant="outline" className="ml-2 border-amber-500 text-amber-400 text-xs shrink-0">
                                          Bientôt
                                        </Badge>
                                      )}
                                    </div>
                                  </Link>
                                </li>
                              ) : null;
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            
            {/* Vue par métiers */}
            <TabsContent value="metiers" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {careerPaths.map((career) => (
                  <motion.div
                    key={career.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <div className={`rounded-xl p-6 h-full bg-gradient-to-br ${career.gradient}`} data-id={`career-${career.id}`}>
                      <div className="flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-full bg-white/10">
                            {career.icon}
                          </div>
                          <h2 className="text-xl font-bold text-white">
                            {career.title}
                          </h2>
                        </div>
                        
                        <p className="mb-4 text-blue-100">
                          {career.description}
                        </p>
                        
                        <div className="mb-4">
                          <h4 className="font-medium text-white text-sm mb-2">Compétences clés:</h4>
                          <div className="flex flex-wrap gap-2">
                            {career.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="bg-white/10 text-white border-white/30">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-auto">
                          <h3 className="text-white font-medium mb-2">Parcours recommandé:</h3>
                          <ul className="space-y-2">
                            {career.modules.map((moduleId) => {
                              const moduleInfo = modules.find(m => m.id === moduleId);
                              return moduleInfo ? (
                                <li key={moduleId}>
                                  <Link 
                                    href={moduleInfo.comingSoon ? "#" : moduleInfo.destination}
                                    className="block p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium text-white">{moduleInfo.title}</span>
                                      <IoMdArrowForward className="h-4 w-4 text-white" />
                                      {moduleInfo.comingSoon && (
                                        <Badge variant="outline" className="ml-2 border-amber-500 text-amber-400 text-xs shrink-0">
                                          Bientôt
                                        </Badge>
                                      )}
                                    </div>
                                  </Link>
                                </li>
                              ) : null;
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </HomeLayout>
  );
}