import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Home } from 'lucide-react';
// Icônes modernes de React Icons
import { IoHome as IoHomeIcon, IoSearchOutline, IoBookOutline, IoDesktopOutline, IoTrophyOutline, IoConstructOutline } from 'react-icons/io5';
import { IoMdArrowForward } from 'react-icons/io';
import { BsKanban, BsPeopleFill, BsClipboardCheck, BsGearFill, 
         BsCalendarCheck, BsBarChartFill, BsLightbulb, BsChevronRight,
         BsBookmarkCheck, BsClipboardData, BsFileEarmarkText, BsFileEarmarkCode } from 'react-icons/bs';
import { RiTeamLine, RiUserSettingsLine } from 'react-icons/ri';
import { MdOutlineEmojiEvents } from 'react-icons/md';
import { FaProjectDiagram, FaRegChartBar } from 'react-icons/fa';
import { TbChartDots, TbReportAnalytics } from 'react-icons/tb';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";

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

export default function AmoaModeSelectionFixed() {
  // États
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [textSize, setTextSize] = useState(1); // 1 = normal, >1 = larger, <1 = smaller

  // Liste complète des modules AMOA
  const modules: Module[] = [
    // SE FORMER
    {
      id: 'mc2i-ai-learning',
      title: 'mc2i AI LEARNING',
      description: "Assistant IA expert en AMOA pour approfondir vos connaissances en mode conversationnel",
      icon: <RiUserSettingsLine className="h-5 w-5" />,
      destination: '/outils-ia/mc2i-learning',
      difficulty: 'tous niveaux',
      duration: '10-60 min',
      isNew: true
    },
    {
      id: 'modules-express',
      title: 'MODULES EXPRESS',
      description: "Capsules de formation concises sur les fondamentaux AMOA et la gestion de projet",
      icon: <BsBookmarkCheck className="h-5 w-5" />,
      destination: '/amoa/modules-express',
      difficulty: 'débutant',
      duration: '5-15 min'
    },
    {
      id: 'referentiel-amoa',
      title: 'RÉFÉRENTIEL AMOA',
      description: "Base documentaire complète: méthodes, templates et bonnes pratiques AMOA",
      icon: <BsFileEarmarkText className="h-5 w-5" />,
      destination: '/amoa/referentiel',
      difficulty: 'tous niveaux',
      duration: 'variable',
      comingSoon: true
    },
    
    // S'ENTRAÎNER
    {
      id: 'projet-imposteur',
      title: 'QUI EST L\'IMPOSTEUR ?',
      description: "Détectez le stakeholder qui tente de saboter votre projet informatique",
      icon: <BsPeopleFill className="h-5 w-5" />,
      destination: '/amoa/projet-imposteur',
      difficulty: 'intermédiaire',
      duration: '15-30 min'
    },
    {
      id: 'simulation-reunion',
      title: 'SIMULATION RÉUNION',
      description: "Entraînez-vous à animer des réunions projet avec différents profils de participants",
      icon: <RiTeamLine className="h-5 w-5" />,
      destination: '/amoa/simulation-reunion',
      difficulty: 'intermédiaire', 
      duration: '20-40 min',
      comingSoon: true
    },
    {
      id: 'analyse-besoins',
      title: 'ATELIER BESOINS',
      description: "Pratiquez l'élicitation et l'analyse des besoins métier en environnement simulé",
      icon: <BsLightbulb className="h-5 w-5" />,
      destination: '/amoa/analyse-besoins',
      difficulty: 'intermédiaire',
      duration: '30-45 min',
      comingSoon: true
    },
    
    // S'ÉVALUER
    {
      id: 'interview-simulation',
      title: 'AUDITION CLIENT',
      description: "Préparez-vous aux auditions client avec des scénarios réalistes",
      icon: <BsClipboardCheck className="h-5 w-5" />,
      destination: '/amoa/interview-simulation',
      difficulty: 'avancé',
      duration: '30-45 min'
    },
    {
      id: 'test-reflexes',
      title: 'TEST DE RÉFLEXES',
      description: "Évaluez votre capacité à réagir aux situations critiques en gestion de projet",
      icon: <IoTrophyOutline className="h-5 w-5" />,
      destination: '/amoa/test-reflexes',
      difficulty: 'avancé',
      duration: '15-30 min'
    },
    {
      id: 'certification-interne',
      title: 'CERTIFICATION INTERNE',
      description: "Validez vos compétences AMOA via notre parcours complet de certification",
      icon: <MdOutlineEmojiEvents className="h-5 w-5" />,
      destination: '/amoa/certification',
      difficulty: 'avancé',
      duration: '60-90 min',
      comingSoon: true
    },
    
    // CRÉER/AUTOMATISER
    {
      id: 'generateur-livrables',
      title: 'GÉNÉRATEUR DE LIVRABLES',
      description: "Créez rapidement des livrables AMOA professionnels avec assistance IA",
      icon: <BsFileEarmarkCode className="h-5 w-5" />,
      destination: '/amoa/generateur-livrables',
      difficulty: 'intermédiaire',
      duration: 'variable',
      comingSoon: true,
      isNew: true
    },
    {
      id: 'toolkit-amoa',
      title: 'TOOLKIT AMOA',
      description: "Suite d'outils pour optimiser votre productivité sur les tâches AMOA récurrentes",
      icon: <BsGearFill className="h-5 w-5" />,
      destination: '/amoa/toolkit',
      difficulty: 'intermédiaire',
      duration: 'variable',
      comingSoon: true
    }
  ];

  // Définition des objectifs d'apprentissage
  const learningObjectives: LearningObjective[] = [
    {
      id: 'seformer',
      title: "SE FORMER",
      description: "Développer vos connaissances fondamentales en AMOA et gestion de projet",
      icon: <IoBookOutline className="h-6 w-6 text-blue-100" />,
      modules: [
        'mc2i-ai-learning',      // Assistant IA pour répondre aux questions
        'modules-express',       // Modules courts de formation
        'referentiel-amoa'       // Référentiel documentaire
      ],
      gradient: 'from-blue-700 to-blue-900',
      categories: [
        'Fondamentaux AMOA',
        'Gestion de projet',
        'Méthodologies',
        'Outils et techniques'
      ]
    },
    {
      id: 'sentrainer',
      title: "S'ENTRAÎNER",
      description: "Mettre en pratique vos connaissances avec des exercices interactifs et des simulations",
      icon: <IoDesktopOutline className="h-6 w-6 text-indigo-100" />,
      modules: [
        'projet-imposteur',      // Jeu de détection d'imposteur
        'simulation-reunion',    // Simulation de réunion projet
        'analyse-besoins'        // Atelier d'analyse des besoins
      ],
      gradient: 'from-indigo-700 to-indigo-900'
    },
    {
      id: 'sevaluer',
      title: "S'ÉVALUER",
      description: "Tester vos compétences dans des conditions réelles d'examen ou d'entretien",
      icon: <IoTrophyOutline className="h-6 w-6 text-purple-100" />,
      modules: [
        'interview-simulation',  // Préparation d'audition client
        'test-reflexes',         // Test de réflexes AMOA
        'certification-interne'  // Parcours de certification
      ],
      gradient: 'from-purple-700 to-purple-900'
    },
    {
      id: 'creer',
      title: "CRÉER/AUTOMATISER",
      description: "Utiliser des outils pour générer du contenu et automatiser des tâches AMOA",
      icon: <IoConstructOutline className="h-6 w-6 text-cyan-100" />,
      modules: [
        'generateur-livrables',  // Générateur de livrables AMOA
        'toolkit-amoa'           // Toolkit d'automatisation AMOA
      ],
      gradient: 'from-cyan-700 to-cyan-900'
    }
  ];

  // Parcours métiers AMOA
  const careerPaths: CareerPath[] = [
    {
      id: 'consultant-amoa',
      title: 'Consultant AMOA',
      description: "Accompagner les projets informatiques depuis l'expression de besoin jusqu'au déploiement",
      icon: <BsClipboardData className="h-6 w-6 text-blue-100" />,
      skills: ['Analyse de besoins', 'Rédaction spécifications', 'Test', 'Conduite du changement'],
      modules: ['mc2i-ai-learning', 'modules-express', 'interview-simulation', 'projet-imposteur'],
      gradient: 'from-blue-600 to-blue-800'
    },
    {
      id: 'product-owner',
      title: 'Product Owner',
      description: "Gérer le backlog produit et prioriser les fonctionnalités dans un contexte Agile",
      icon: <BsKanban className="h-6 w-6 text-green-100" />,
      skills: ['Gestion de backlog', 'User stories', 'Agile', 'Priorisation'],
      modules: ['mc2i-ai-learning', 'modules-express', 'analyse-besoins'],
      gradient: 'from-green-600 to-green-800'
    },
    {
      id: 'business-analyst',
      title: 'Business Analyst',
      description: "Analyser et modéliser les processus métier pour concevoir des solutions optimales",
      icon: <FaRegChartBar className="h-6 w-6 text-amber-100" />,
      skills: ['Analyse processus', 'Modélisation', 'Data analytics', 'Business case'],
      modules: ['mc2i-ai-learning', 'analyse-besoins', 'test-reflexes'],
      gradient: 'from-amber-600 to-amber-800'
    },
    {
      id: 'chef-projet',
      title: 'Chef de Projet',
      description: "Piloter des projets informatiques en respectant le budget, les délais et la qualité",
      icon: <FaProjectDiagram className="h-6 w-6 text-red-100" />,
      skills: ['Gestion de projet', 'Planification', 'Gestion risques', 'Pilotage d\'équipe'],
      modules: ['modules-express', 'test-reflexes', 'simulation-reunion', 'certification-interne'],
      gradient: 'from-red-600 to-red-800'
    }
  ];

  // Filtrage des modules basé sur la recherche
  const filteredModules = modules.filter(module => 
    module.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    module.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <HomeLayout>
      <PageTitle title="I AM mc2i" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-800 via-[#006a9e] to-blue-900">
        {/* Bouton retour à l'accueil */}
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="outline" 
            className="bg-gradient-to-r from-blue-600 to-blue-800 border-white/20 text-white hover:bg-blue-700 hover:text-white"
            onClick={() => window.location.href = '/'}
          >
            <IoHomeIcon className="h-4 w-4 mr-2" />
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
              className="text-4xl font-bold mb-3"
            >
              Centre de Formation - I AM mc2i
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto"
            >
              Assistant de formation intelligent pour les métiers de la transformation numérique
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
                <BsPeopleFill className="h-5 w-5 mr-2" />
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
              {/* Catégories de modules */}
              <div className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Button 
                    variant="outline" 
                    className={`p-3 h-auto flex flex-col items-center justify-center gap-2 text-center rounded-xl bg-blue-900/30 hover:bg-blue-800/50 border-blue-800 text-white`}
                  >
                    <IoBookOutline className="h-6 w-6" />
                    <span className="text-sm font-medium">SE FORMER</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className={`p-3 h-auto flex flex-col items-center justify-center gap-2 text-center rounded-xl bg-blue-900/30 hover:bg-blue-800/50 border-blue-800 text-white`}
                  >
                    <IoTrophyOutline className="h-6 w-6" />
                    <span className="text-sm font-medium">S'ENTRAÎNER</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className={`p-3 h-auto flex flex-col items-center justify-center gap-2 text-center rounded-xl bg-blue-900/30 hover:bg-blue-800/50 border-blue-800 text-white`}
                  >
                    <TbChartDots className="h-6 w-6" />
                    <span className="text-sm font-medium">S'ÉVALUER</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className={`p-3 h-auto flex flex-col items-center justify-center gap-2 text-center rounded-xl bg-blue-900/30 hover:bg-blue-800/50 border-blue-800 text-white`}
                  >
                    <IoConstructOutline className="h-6 w-6" />
                    <span className="text-sm font-medium">CRÉER / AUTOMATISER</span>
                  </Button>
                </div>
              </div>
              
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