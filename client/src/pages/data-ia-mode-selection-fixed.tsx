import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { IoSearchOutline, IoBookOutline, IoDesktopOutline, IoTrophyOutline, IoConstructOutline } from 'react-icons/io5';
import { IoMdArrowForward } from 'react-icons/io';
import { RiTeamLine, RiFilterLine } from 'react-icons/ri';
import { TbLayoutGrid, TbList, TbChartDots } from 'react-icons/tb';
import { BsBarChartFill, BsLightbulb, BsDatabaseFill, BsCpu, BsGraphUp, BsBarChartLine } from 'react-icons/bs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('objectives');
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
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-800 via-[#006a9e] to-blue-900">
        {/* Bouton retour à l'accueil */}
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="outline" 
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-md border-0 hover:from-blue-700 hover:to-blue-800"
            onClick={() => setLocation('/')}
          >
            <IoBookOutline className="h-4 w-4 mr-2" />
            Accueil
          </Button>
        </div>
        
        {/* Contenu principal */}
        <div className="relative z-10 max-w-[1600px] w-full mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <div className="text-center mb-10 sm:mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
            >
              I AM <span className="text-[#0076be]">Data & IA</span>
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

          {/* Tabs pour sélectionner la vue */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="mx-auto bg-blue-950/50 border border-blue-800">
              <TabsTrigger value="modules" className="data-[state=active]:bg-blue-700">
                Par modules
              </TabsTrigger>
              <TabsTrigger value="objectives" className="data-[state=active]:bg-blue-700">
                Par objectifs
              </TabsTrigger>
              <TabsTrigger value="careers" className="data-[state=active]:bg-blue-700">
                Par métiers
              </TabsTrigger>
            </TabsList>
            
            {/* Vue par modules */}
            <TabsContent value="modules" className="mt-6">
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
                    <Card className={`h-full shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden ${module.comingSoon ? 'opacity-70' : ''}`}>
                      <CardHeader className="p-4 pb-2 bg-gradient-to-br from-blue-900 to-slate-900">
                        <div className="flex justify-between">
                          <div className="flex-1">
                            <div className="flex items-start space-x-4 mb-2">
                              <div className="bg-blue-700/50 p-2 rounded-lg">
                                {module.icon}
                              </div>
                              <CardTitle className="text-lg line-clamp-2 text-left">
                                {module.title}
                              </CardTitle>
                              {module.isNew && (
                                <Badge className="ml-auto bg-blue-600 text-white shrink-0">NOUVEAU</Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline" className="text-xs text-white border-white/30">
                                {module.difficulty}
                              </Badge>
                              <Badge variant="outline" className="text-xs text-white border-white/30">
                                {module.duration}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2 bg-gradient-to-br from-blue-900 to-slate-900">
                        <p className="text-blue-100 line-clamp-2 min-h-[48px]">
                          {module.description}
                        </p>
                      </CardContent>
                      <CardFooter className="p-4 pt-2 mt-auto bg-gradient-to-br from-blue-900 to-slate-900">
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
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            
            {/* Vue par objectifs d'apprentissage */}
            <TabsContent value="objectives" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {learningObjectives.map((objective) => (
                  <motion.div
                    key={objective.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <Card className="h-full shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      <CardHeader className={`p-4 pb-3 bg-gradient-to-br ${objective.gradient}`}>
                        <div className="flex items-center space-x-4">
                          <div className="bg-white/20 p-2 rounded-lg">
                            {objective.icon}
                          </div>
                          <CardTitle className="text-xl text-white">
                            {objective.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className={`p-4 pt-2 bg-gradient-to-br ${objective.gradient}`}>
                        <p className="text-blue-100 mb-4">
                          {objective.description}
                        </p>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-white text-sm mb-2">Modules recommandés:</h4>
                          {objective.modules.map((moduleId) => {
                            const moduleInfo = modules.find(m => m.id === moduleId);
                            return moduleInfo ? (
                              <Link key={moduleId} href={moduleInfo.comingSoon ? "#" : moduleInfo.destination}>
                                <div className="flex items-center p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                                  <div className="bg-blue-700/40 p-1 rounded-lg mr-2">
                                    {moduleInfo.icon}
                                  </div>
                                  <span className="text-sm text-white line-clamp-1">{moduleInfo.title}</span>
                                  {moduleInfo.comingSoon && (
                                    <Badge variant="outline" className="ml-auto border-amber-500 text-amber-400 text-xs shrink-0">
                                      Bientôt
                                    </Badge>
                                  )}
                                </div>
                              </Link>
                            ) : null;
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            
            {/* Vue par parcours métiers */}
            <TabsContent value="careers" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {careerPaths.map((career) => (
                  <motion.div
                    key={career.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <Card className="h-full shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      <CardHeader className={`p-4 pb-3 bg-gradient-to-br ${career.gradient}`}>
                        <div className="flex items-center space-x-4">
                          <div className="bg-white/20 p-2 rounded-lg">
                            {career.icon}
                          </div>
                          <CardTitle className="text-xl text-white">
                            {career.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className={`p-4 pt-2 bg-gradient-to-br ${career.gradient}`}>
                        <p className="text-blue-100 mb-4">
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
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-white text-sm mb-2">Parcours recommandé:</h4>
                          {career.modules.map((moduleId) => {
                            const moduleInfo = modules.find(m => m.id === moduleId);
                            return moduleInfo ? (
                              <Link key={moduleId} href={moduleInfo.comingSoon ? "#" : moduleInfo.destination}>
                                <div className="flex items-center p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                                  <div className="bg-blue-700/40 p-1 rounded-lg mr-2">
                                    {moduleInfo.icon}
                                  </div>
                                  <span className="text-sm text-white line-clamp-1">{moduleInfo.title}</span>
                                  {moduleInfo.comingSoon && (
                                    <Badge variant="outline" className="ml-auto border-amber-500 text-amber-400 text-xs shrink-0">
                                      Bientôt
                                    </Badge>
                                  )}
                                </div>
                              </Link>
                            ) : null;
                          })}
                        </div>
                      </CardContent>
                    </Card>
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