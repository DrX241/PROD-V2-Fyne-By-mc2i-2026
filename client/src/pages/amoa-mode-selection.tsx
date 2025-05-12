import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  HelpCircle, 
  Search 
} from 'lucide-react';
import { 
  IoHome, 
  IoBookOutline, 
  IoDesktopOutline, 
  IoTrophyOutline, 
  IoConstructOutline
} from 'react-icons/io5';
import { IoMdArrowForward } from 'react-icons/io';
import { FaGraduationCap } from 'react-icons/fa';
import { 
  BsKanban, 
  BsPeopleFill, 
  BsClipboardCheck, 
  BsGearFill,
  BsLightbulb, 
  BsBookmarkCheck, 
  BsClipboardData, 
  BsFileEarmarkText,
  BsFileEarmarkCode, 
  BsBriefcase 
} from 'react-icons/bs';
import { RiTeamLine, RiUserSettingsLine, RiFilterLine } from 'react-icons/ri';
import { MdOutlineEmojiEvents } from 'react-icons/md';
import { FaProjectDiagram, FaRegChartBar } from 'react-icons/fa';
import { AiOutlineZoomIn, AiOutlineZoomOut } from 'react-icons/ai';
import { FiMoon, FiSun } from 'react-icons/fi';

import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

// Types pour l'organisation des modules
interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  destination: string;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé' | 'tous niveaux';
  duration?: string;
  isNew?: boolean;
  comingSoon?: boolean;
}

interface LearningObjective {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  modules: string[]; // IDs des modules recommandés
}

interface CareerPath {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  skills: string[];
  modules: string[]; // IDs des modules recommandés
}

export default function AmoaModeSelection() {
  // États pour les contrôles d'accessibilité
  const [highContrastMode, setHighContrastMode] = useState<boolean>(false);
  const [textSize, setTextSize] = useState<number>(1);
  
  // États pour la filtration et la navigation
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [selectedCareerPath, setSelectedCareerPath] = useState<string | null>(null);
  const [currentTour, setCurrentTour] = useState<string | null>(null);

  // Modules AMOA disponibles
  const modules: Module[] = [
    {
      id: 'agent-ia',
      title: 'AGENT IA',
      description: 'Explorez le métier d\'AMOA avec notre expert IA. Dialoguez pour apprendre les concepts et répondez à des scénarios de décision réels.',
      icon: <BsLightbulb className="h-5 w-5 text-indigo-200" />,
      destination: '/amoa/expert-learning',
      difficulty: 'tous niveaux',
      isNew: true,
      comingSoon: false
    },
    {
      id: 'amoa-academie',
      title: 'AMOA ACADÉMIE',
      description: 'Centre de formation structuré avec parcours rapide AMOA, modules interactifs et suivi IA personnalisé.',
      icon: <FaGraduationCap className="h-5 w-5 text-violet-200" />,
      destination: '/amoa/learning-center',
      difficulty: 'tous niveaux',
      isNew: true,
      comingSoon: false
    },
    {
      id: 'projet-imposteur',
      title: 'QUI EST L\'IMPOSTEUR ?',
      description: 'Jeu de rôle pour apprendre à identifier les incohérences dans la gestion de projet.',
      icon: <BsPeopleFill className="h-5 w-5 text-orange-200" />,
      destination: '/amoa/projet-imposteur',
      difficulty: 'intermédiaire',
      comingSoon: false
    },
    {
      id: 'simulation-reunion',
      title: 'SIMULATION RÉUNION',
      description: 'Pratiquez l\'animation de réunions client avec différents scénarios et profils.',
      icon: <RiTeamLine className="h-5 w-5 text-purple-200" />,
      destination: '/amoa/simulation-reunion',
      difficulty: 'intermédiaire',
      comingSoon: true
    },
    {
      id: 'analyse-besoins',
      title: 'ATELIER BESOINS',
      description: 'Exercices pratiques pour maîtriser l\'expression et l\'analyse des besoins client.',
      icon: <BsLightbulb className="h-5 w-5 text-yellow-200" />,
      destination: '/amoa/analyse-besoins',
      difficulty: 'intermédiaire',
      comingSoon: true
    },
    {
      id: 'interview-simulation',
      title: 'AUDITION CLIENT',
      description: 'Entraînez-vous à l\'entretien client avec notre simulateur intelligent.',
      icon: <BsClipboardCheck className="h-5 w-5 text-blue-200" />,
      destination: '/amoa/interview-simulation',
      difficulty: 'avancé',
      comingSoon: false
    },
    {
      id: 'test-reflexes',
      title: 'TEST DE RÉFLEXES',
      description: 'Testez vos réflexes AMOA face à des situations complexes en temps limité.',
      icon: <IoTrophyOutline className="h-5 w-5 text-red-200" />,
      destination: '/amoa/test-reflexes',
      difficulty: 'avancé',
      comingSoon: false
    },
    {
      id: 'certification-interne',
      title: 'CERTIFICATION INTERNE',
      description: 'Validez officiellement vos compétences AMOA selon les standards mc2i.',
      icon: <MdOutlineEmojiEvents className="h-5 w-5 text-yellow-200" />,
      destination: '/amoa/certification',
      difficulty: 'avancé',
      comingSoon: true
    },
    {
      id: 'generateur-livrables',
      title: 'GÉNÉRATEUR DE LIVRABLES',
      description: 'Assistant IA pour créer rapidement des livrables AMOA professionnels.',
      icon: <BsFileEarmarkCode className="h-5 w-5 text-green-200" />,
      destination: '/amoa/generateur-livrables',
      difficulty: 'intermédiaire',
      isNew: true,
      comingSoon: true
    },
    {
      id: 'toolkit-amoa',
      title: 'TOOLKIT AMOA',
      description: 'Boîte à outils complète pour automatiser vos tâches AMOA quotidiennes.',
      icon: <BsGearFill className="h-5 w-5 text-blue-200" />,
      destination: '/amoa/toolkit',
      difficulty: 'intermédiaire',
      comingSoon: true
    }
  ];

  // Objectifs d'apprentissage
  const learningObjectives: LearningObjective[] = [
    {
      id: 'seformer',
      title: "SE FORMER",
      description: "Développez vos connaissances fondamentales en AMOA et gestion de projet",
      icon: <IoBookOutline className="h-6 w-6 text-blue-100" />,
      gradient: 'from-blue-700 to-blue-900',
      modules: ['agent-ia', 'amoa-academie']
    },
    {
      id: 'sentrainer',
      title: "S'ENTRAÎNER",
      description: "Mettez en pratique vos connaissances avec des exercices interactifs et des simulations",
      icon: <IoDesktopOutline className="h-6 w-6 text-indigo-100" />,
      gradient: 'from-indigo-700 to-indigo-900',
      modules: ['projet-imposteur', 'simulation-reunion', 'analyse-besoins']
    },
    {
      id: 'sevaluer',
      title: "S'ÉVALUER",
      description: "Testez vos compétences dans des conditions réelles d'examen ou d'entretien",
      icon: <IoTrophyOutline className="h-6 w-6 text-purple-100" />,
      gradient: 'from-purple-700 to-purple-900',
      modules: ['interview-simulation', 'test-reflexes', 'certification-interne']
    },
    {
      id: 'creer',
      title: "AUTOMATISER",
      description: "Utilisez des outils pour générer du contenu et automatiser des tâches AMOA",
      icon: <IoConstructOutline className="h-6 w-6 text-cyan-100" />,
      gradient: 'from-cyan-700 to-cyan-900',
      modules: ['generateur-livrables', 'toolkit-amoa']
    }
  ];

  // Parcours métiers AMOA
  const careerPaths: CareerPath[] = [
    {
      id: 'consultant-amoa',
      title: 'Consultant AMOA',
      description: "Accompagner les projets informatiques depuis l'expression de besoin jusqu'au déploiement",
      icon: <BsClipboardData className="h-6 w-6 text-blue-100" />,
      gradient: 'from-blue-600 to-blue-800',
      skills: [
        'Expression et analyse des besoins',
        'Rédaction de spécifications',
        'Animation d\'ateliers',
        'Conduite du changement',
        'Recette fonctionnelle'
      ],
      modules: ['agent-ia', 'interview-simulation', 'projet-imposteur', 'amoa-academie']
    },
    {
      id: 'product-owner',
      title: 'Product Owner',
      description: "Gérer le backlog produit et prioriser les fonctionnalités dans un contexte Agile",
      icon: <BsKanban className="h-6 w-6 text-green-100" />,
      gradient: 'from-green-600 to-green-800',
      skills: [
        'Gestion de backlog',
        'Priorisation',
        'User stories',
        'Méthodes Agiles',
        'Relation client'
      ],
      modules: ['agent-ia', 'analyse-besoins', 'amoa-academie']
    },
    {
      id: 'business-analyst',
      title: 'Business Analyst',
      description: "Analyser et modéliser les processus métier pour concevoir des solutions optimales",
      icon: <FaRegChartBar className="h-6 w-6 text-amber-100" />,
      gradient: 'from-amber-600 to-amber-800',
      skills: [
        'Modélisation de processus',
        'Analyse de données',
        'KPIs',
        'Business Intelligence',
        'Transformation digitale'
      ],
      modules: ['agent-ia', 'analyse-besoins', 'test-reflexes', 'amoa-academie']
    },
    {
      id: 'chef-projet',
      title: 'Chef de Projet',
      description: "Piloter des projets informatiques en respectant le budget, les délais et la qualité",
      icon: <FaProjectDiagram className="h-6 w-6 text-red-100" />,
      gradient: 'from-red-600 to-red-800',
      skills: [
        'Planification',
        'Gestion d\'équipe',
        'Gestion des risques',
        'Reporting',
        'Pilotage budgétaire'
      ],
      modules: ['agent-ia', 'test-reflexes', 'simulation-reunion', 'certification-interne', 'amoa-academie']
    }
  ];

  // Fonction pour récupérer les modules pour un objectif
  const getModulesForObjective = (objectiveId: string): Module[] => {
    const objective = learningObjectives.find(obj => obj.id === objectiveId);
    if (!objective) return [];
    
    return modules.filter(module => objective.modules.includes(module.id));
  };

  // Fonction pour récupérer les modules pour un parcours métier
  const getModulesForCareer = (careerId: string): Module[] => {
    const career = careerPaths.find(c => c.id === careerId);
    if (!career) return [];
    
    return modules.filter(module => career.modules.includes(module.id));
  };

  // Fonction pour filtrer les modules selon les critères de recherche et de difficulté
  const getFilteredModules = (): Module[] => {
    return modules.filter(module => {
      const matchesSearch = searchTerm === '' || 
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        module.description.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesDifficulty = difficulty.length === 0 || 
        difficulty.includes(module.difficulty);
        
      return matchesSearch && matchesDifficulty;
    });
  };

  // Fonction pour basculer un filtre de difficulté
  const toggleDifficultyFilter = (level: string) => {
    setDifficulty(prev => 
      prev.includes(level) 
        ? prev.filter(d => d !== level) 
        : [...prev, level]
    );
  };

  // Fonction pour afficher les badges de difficulté
  const renderDifficultyBadge = (level: string) => {
    let color = 'bg-blue-600';
    
    if (highContrastMode) {
      if (level === 'débutant') color = 'bg-green-900';
      if (level === 'intermédiaire') color = 'bg-blue-900';
      if (level === 'avancé') color = 'bg-purple-900';
    } else {
      if (level === 'débutant') color = 'bg-green-600';
      if (level === 'intermédiaire') color = 'bg-blue-600';
      if (level === 'avancé') color = 'bg-purple-600';
    }
    
    return (
      <Badge className={`${color} text-white`}>
        {level}
      </Badge>
    );
  };

  // Fonction pour démarrer le tutoriel (simulée)
  const startTutorial = () => {
    console.log('Démarrage du tutoriel:', currentTour);
    // Implémentation à venir
  };

  return (
    <HomeLayout>
      <div id="amoa-mode-selection" className={`min-h-screen pb-20 ${
        highContrastMode ? 'bg-black text-white' : 'bg-gradient-to-b from-teal-900 via-green-950 to-black text-white'
      }`} style={{ fontSize: `${textSize}rem` }}>
        {/* Navigation et contrôles */}
        <div className="px-8 py-8 relative max-w-[1600px] w-full mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center">
              <Link href="/">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900 text-lg px-6 py-2 h-auto rounded-xl shadow-lg hover:shadow-blue-800/30 transition-all"
                >
                  <IoHome className="mr-3 h-6 w-6" />
                  Accueil
                </Button>
              </Link>
              <PageTitle title="I AM mc2i" />
            </div>
            
            <div className="flex items-center gap-4">
              {/* Bouton d'aide */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline"
                      size="icon"
                      className="w-11 h-11 rounded-full bg-blue-900/30 border-blue-800 text-white hover:bg-blue-800/50"
                      onClick={() => {
                        setCurrentTour('amoa-mode-selection');
                        startTutorial();
                      }}
                      data-id="help-button"
                    >
                      <HelpCircle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Afficher le guide</p>
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
                      className={`w-11 h-11 rounded-full ${
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
              
              {/* Contrôle taille du texte */}
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline"
                        size="icon"
                        className="w-10 h-10 rounded-full bg-blue-900/30 border-blue-800 text-white hover:bg-blue-800/50"
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
                        className="w-10 h-10 rounded-full bg-blue-900/30 border-blue-800 text-white hover:bg-blue-800/50"
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
          </div>
          
          {/* Titre et sous-titre */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
            data-id="main-title"
          >
            <h1 className="text-5xl font-bold mb-4">
              Centre de Transformation Numérique - I AM mc2i
            </h1>
            <p className={`max-w-3xl mx-auto text-xl ${
              highContrastMode ? 'text-gray-300' : 'text-teal-200' 
            }`}>
              Trouvez votre parcours d'apprentissage personnalisé en transformation numérique
            </p>
          </motion.div>

          {/* Onglets principaux */}
          <Tabs defaultValue="objectifs" className="w-full" data-id="main-tabs">
            <TabsList className={`w-full mb-8 p-1.5 ${
              highContrastMode ? 'bg-gray-800 border border-gray-700' : 'bg-white/10'
            }`}>
              <TabsTrigger 
                value="objectifs" 
                className={`flex-1 flex items-center justify-center py-3 ${
                  highContrastMode ? 'data-[state=active]:bg-blue-900 text-white' : ''
                }`}
                data-id="objectives-tab"
              >
                <IoBookOutline className="h-5 w-5 mr-3" />
                Par objectif d'apprentissage
              </TabsTrigger>
              <TabsTrigger 
                value="metiers" 
                className={`flex-1 flex items-center justify-center py-3 ${
                  highContrastMode ? 'data-[state=active]:bg-blue-900 text-white' : ''
                }`}
                data-id="careers-tab"
              >
                <BsBriefcase className="h-5 w-5 mr-3" />
                Par métier
              </TabsTrigger>
              <TabsTrigger 
                value="tous" 
                className={`flex-1 flex items-center justify-center py-3 ${
                  highContrastMode ? 'data-[state=active]:bg-blue-900 text-white' : ''
                }`}
                data-id="all-modules-tab"
              >
                <BsGearFill className="h-5 w-5 mr-3" />
                Tous les modules
              </TabsTrigger>
            </TabsList>

            {/* Contenu des onglets */}
            <TabsContent value="objectifs" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {learningObjectives.map((objective) => (
                  <motion.div
                    key={objective.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`rounded-xl p-8 shadow-lg ${
                      highContrastMode 
                        ? 'bg-gray-800 border border-gray-700' 
                        : `bg-gradient-to-br ${objective.gradient}`
                    }`}
                    data-id={`objective-${objective.id}`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-full ${
                          highContrastMode ? 'bg-blue-900' : 'bg-white/10'
                        }`}>
                          {objective.icon}
                        </div>
                        <h2 className="text-2xl font-bold text-white">
                          {objective.title}
                        </h2>
                      </div>
                      
                      <p className={`mb-6 ${
                        highContrastMode ? 'text-gray-300' : 'text-blue-100'
                      }`}>
                        {objective.description}
                      </p>
                      
                      <div className="mt-auto">
                        <h3 className="text-white font-medium mb-3">Modules recommandés:</h3>
                        <ul className="space-y-3">
                          {getModulesForObjective(objective.id).map(module => (
                            <li key={module.id}>
                              <Link 
                                href={module.comingSoon ? "#" : module.destination}
                                onClick={(e) => module.comingSoon && e.preventDefault()}
                                className={`block p-3 rounded-lg ${
                                  highContrastMode 
                                    ? 'bg-gray-700 hover:bg-gray-600' 
                                    : 'bg-white/10 hover:bg-white/20'
                                } transition-colors`}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <span className="font-medium">{module.title}</span>
                                    {module.isNew && (
                                      <Badge className="ml-2 bg-blue-600 text-white text-xs">
                                        NOUVEAU
                                      </Badge>
                                    )}
                                    {module.comingSoon && (
                                      <Badge variant="outline" className="ml-2 border-amber-500 text-amber-400 text-xs">
                                        Bientôt
                                      </Badge>
                                    )}
                                  </div>
                                  {!module.comingSoon && <IoMdArrowForward className="h-5 w-5" />}
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="metiers" className="mt-0">
              <div className="flex flex-col gap-6">
                {/* Sélection du parcours métier */}
                <div className={`p-4 rounded-lg ${
                  highContrastMode ? 'bg-gray-800 border border-gray-700' : 'bg-white/10'
                }`}>
                  <h2 className="text-xl font-bold mb-4">Parcours métiers en transformation numérique</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {careerPaths.map(career => (
                      <Button
                        key={career.id}
                        variant={highContrastMode ? "outline" : "secondary"}
                        className={`h-auto py-3 justify-start min-h-[52px] ${
                          selectedCareerPath === career.id 
                            ? highContrastMode 
                              ? 'bg-blue-900 border-blue-700' 
                              : 'bg-blue-600 text-white' 
                            : highContrastMode 
                              ? 'bg-gray-800 border-gray-700' 
                              : ''
                        }`}
                        onClick={() => setSelectedCareerPath(career.id)}
                        data-id={`career-${career.id}`}
                      >
                        <div className="flex items-start gap-2 w-full">
                          <div className={`p-1.5 rounded-full shrink-0 ${
                            highContrastMode 
                              ? 'bg-gray-700' 
                              : 'bg-white/20'
                          }`}>
                            {career.icon}
                          </div>
                          <span className="text-sm font-medium text-left line-clamp-2">{career.title}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Détails du parcours métier sélectionné */}
                {selectedCareerPath && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-lg ${
                      highContrastMode ? 'bg-gray-800 border border-gray-700' : 'bg-white/10'
                    }`}
                  >
                    {careerPaths
                      .filter(career => career.id === selectedCareerPath)
                      .map(career => (
                        <div key={career.id}>
                          <div className="flex items-start gap-4 mb-6">
                            <div className={`p-3 rounded-full ${
                              highContrastMode ? 'bg-blue-900' : `bg-gradient-to-br ${career.gradient}`
                            }`}>
                              {career.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h2 className="text-2xl font-bold line-clamp-2">{career.title}</h2>
                              <p className={`${highContrastMode ? 'text-gray-300' : 'text-blue-200'} line-clamp-2`}>
                                {career.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Compétences clés */}
                            <div>
                              <h3 className="text-lg font-semibold mb-3">Compétences clés</h3>
                              <ul className="space-y-2">
                                {career.skills.map((skill, index) => (
                                  <li 
                                    key={index}
                                    className={`px-3 py-2 rounded-lg ${
                                      highContrastMode ? 'bg-gray-700' : 'bg-white/10'
                                    }`}
                                  >
                                    {skill}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            {/* Modules recommandés */}
                            <div className="lg:col-span-2">
                              <h3 className="text-lg font-semibold mb-3">Parcours d'apprentissage recommandé</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {getModulesForCareer(career.id).map((module, index) => (
                                  <Card 
                                    key={module.id}
                                    className={`flex flex-col h-full border ${
                                      highContrastMode ? 'bg-gray-700 border-gray-600' : 'bg-white/10 border-white/20'
                                    }`}
                                  >
                                    <CardHeader className="pb-2">
                                      <div className="flex justify-between">
                                        <div className="flex gap-2 items-start">
                                          <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${
                                            highContrastMode ? 'bg-blue-900' : 'bg-white/10'
                                          }`}>
                                            {module.icon}
                                          </div>
                                          <CardTitle className="text-lg line-clamp-2 text-left">
                                            {module.title}
                                            {module.isNew && (
                                              <Badge className="ml-2 bg-blue-600 text-white text-xs">
                                                NOUVEAU
                                              </Badge>
                                            )}
                                          </CardTitle>
                                        </div>
                                        {renderDifficultyBadge(module.difficulty)}
                                      </div>
                                    </CardHeader>
                                    <CardContent>
                                      <p className={`${highContrastMode ? 'text-gray-300' : 'text-blue-100'} line-clamp-2`}>
                                        {module.description}
                                      </p>
                                    </CardContent>
                                    <CardFooter className="mt-auto pt-2">
                                      {module.comingSoon ? (
                                        <Button 
                                          variant={highContrastMode ? "outline" : "secondary"} 
                                          className="w-full opacity-70 cursor-not-allowed"
                                          disabled
                                        >
                                          Bientôt disponible
                                        </Button>
                                      ) : (
                                        <Link href={module.destination} className="w-full">
                                          <Button 
                                            variant={highContrastMode ? "outline" : "secondary"} 
                                            className="w-full"
                                          >
                                            Accéder au module
                                            <IoMdArrowForward className="ml-2 h-4 w-4" />
                                          </Button>
                                        </Link>
                                      )}
                                    </CardFooter>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </motion.div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tous" className="mt-0">
              {/* Filtres de difficulté */}
              {difficulty.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-6 px-2">
                  <div className="text-sm py-1 font-medium">Filtres actifs:</div>
                  {difficulty.map(level => (
                    <Badge 
                      key={level}
                      variant="outline"
                      className={`${
                        highContrastMode 
                          ? 'bg-blue-900 text-white border-blue-700' 
                          : 'bg-blue-100 text-blue-800'
                      } cursor-pointer px-3 py-1 text-sm`}
                      onClick={() => setDifficulty(difficulty.filter(d => d !== level))}
                    >
                      {level}
                      <button className="ml-2 text-xs">×</button>
                    </Badge>
                  ))}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-8"
                    onClick={() => setDifficulty([])}
                  >
                    Effacer tous les filtres
                  </Button>
                </div>
              )}

              {/* Sélection des filtres */}
              <div className={`mb-10 p-6 rounded-xl shadow-lg ${
                highContrastMode ? 'bg-gray-800 border border-gray-700' : 'bg-white/10'
              }`}>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      placeholder="Rechercher un module..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-12 py-6 h-12 text-base ${
                        highContrastMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' 
                          : 'bg-white/10 border-white/20 text-white placeholder:text-gray-300'
                      }`}
                      data-id="search-input"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <RiFilterLine className="h-5 w-5 text-gray-400" />
                    <span className="text-base font-medium">Difficulté:</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={difficulty.includes('débutant') ? 'default' : 'outline'}
                        className={`h-9 px-4 text-sm ${
                          difficulty.includes('débutant')
                            ? highContrastMode 
                              ? 'bg-green-900 hover:bg-green-800' 
                              : 'bg-green-600 hover:bg-green-700'
                            : highContrastMode 
                              ? 'border-gray-600 text-white' 
                              : 'border-white/20'
                        }`}
                        onClick={() => toggleDifficultyFilter('débutant')}
                        data-id="beginner-filter"
                      >
                        Débutant
                      </Button>
                      <Button
                        size="sm"
                        variant={difficulty.includes('intermédiaire') ? 'default' : 'outline'}
                        className={`h-9 px-4 text-sm ${
                          difficulty.includes('intermédiaire')
                            ? highContrastMode 
                              ? 'bg-blue-900 hover:bg-blue-800' 
                              : 'bg-blue-600 hover:bg-blue-700'
                            : highContrastMode 
                              ? 'border-gray-600 text-white' 
                              : 'border-white/20'
                        }`}
                        onClick={() => toggleDifficultyFilter('intermédiaire')}
                        data-id="intermediate-filter"
                      >
                        Intermédiaire
                      </Button>
                      <Button
                        size="sm"
                        variant={difficulty.includes('avancé') ? 'default' : 'outline'}
                        className={`h-9 px-4 text-sm ${
                          difficulty.includes('avancé')
                            ? highContrastMode 
                              ? 'bg-purple-900 hover:bg-purple-800' 
                              : 'bg-purple-600 hover:bg-purple-700'
                            : highContrastMode 
                              ? 'border-gray-600 text-white' 
                              : 'border-white/20'
                        }`}
                        onClick={() => toggleDifficultyFilter('avancé')}
                        data-id="advanced-filter"
                      >
                        Avancé
                      </Button>
                      <Button
                        size="sm"
                        variant={difficulty.includes('tous niveaux') ? 'default' : 'outline'}
                        className={`h-9 px-4 text-sm ${
                          difficulty.includes('tous niveaux')
                            ? highContrastMode 
                              ? 'bg-yellow-900 hover:bg-yellow-800' 
                              : 'bg-yellow-600 hover:bg-yellow-700'
                            : highContrastMode 
                              ? 'border-gray-600 text-white' 
                              : 'border-white/20'
                        }`}
                        onClick={() => toggleDifficultyFilter('tous niveaux')}
                        data-id="all-levels-filter"
                      >
                        Tous niveaux
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste de tous les modules filtrés */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredModules().map(module => (
                  <Card
                    key={module.id}
                    className={`h-full border ${
                      highContrastMode 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-white/10 border-white/20 hover:bg-white/15'
                    } transition-all duration-200`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className={`p-2.5 rounded-lg ${
                            highContrastMode 
                              ? 'bg-blue-900' 
                              : 'bg-gradient-to-br from-blue-600 to-blue-800'
                          }`}>
                            {module.icon}
                          </div>
                          <div>
                            <CardTitle className="text-xl mb-1 flex items-center">
                              {module.title}
                              {module.isNew && (
                                <Badge className="ml-2 bg-blue-600 text-white text-xs">
                                  NOUVEAU
                                </Badge>
                              )}
                            </CardTitle>
                            <div className="flex gap-2">
                              {renderDifficultyBadge(module.difficulty)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className={highContrastMode ? 'text-gray-300' : 'text-blue-100'}>
                        {module.description}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-between items-center">
                      {module.comingSoon ? (
                        <Badge variant="outline" className="px-3 py-1.5 border-amber-500 text-amber-400">
                          Bientôt disponible
                        </Badge>
                      ) : (
                        <Link href={module.destination} className="w-full">
                          <Button 
                            className={`w-full ${
                              highContrastMode 
                                ? 'bg-blue-900 hover:bg-blue-800' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            Accéder au module
                            <IoMdArrowForward className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Message si aucun module ne correspond */}
              {getFilteredModules().length === 0 && (
                <div className={`p-10 rounded-xl text-center ${
                  highContrastMode ? 'bg-gray-800' : 'bg-white/10'
                }`}>
                  <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-blue-900/50">
                    <Search className="h-8 w-8 text-blue-300" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Aucun module trouvé</h3>
                  <p className={highContrastMode ? 'text-gray-400' : 'text-blue-200'}>
                    Essayez d'ajuster vos critères de recherche ou de filtres.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </HomeLayout>
  );
}