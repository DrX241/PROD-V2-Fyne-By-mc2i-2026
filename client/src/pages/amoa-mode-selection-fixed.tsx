import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
// Icônes modernes de React Icons
import { IoHome as IoHomeIcon, IoVideocam, IoAnalytics } from 'react-icons/io5';
import { BsClipboardCheck } from 'react-icons/bs';
import { AiOutlineZoomIn, AiOutlineZoomOut } from 'react-icons/ai';
import { FiHelpCircle, FiMoon, FiSun } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

export default function AmoaModeSelectionFixed() {
  // États
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [textSize, setTextSize] = useState(1); // 1 = normal, >1 = larger, <1 = smaller
  const [, navigate] = useLocation();

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
      id: 'amoa-academie',
      title: 'AMOA ACADÉMIE',
      description: "Centre d'apprentissage complet en AMOA avec parcours thématiques, modules interactifs et suivi IA personnalisé",
      icon: <FaGraduationCap className="h-5 w-5" />,
      destination: '/amoa/academie',
      difficulty: 'tous niveaux',
      duration: 'adaptatif',
      isNew: true
    },
    {
      id: 'parcours-amoa',
      title: 'AMOA ASCENSION',
      description: "Suivez un parcours complet de gestion de projet AMOA avec l'IA comme guide pour préparer votre certification",
      icon: <BsBarChartFill className="h-5 w-5" />,
      destination: '/amoa/parcours',
      difficulty: 'tous niveaux',
      duration: '10-15h',
      isNew: true
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
      id: 'mc2i-interview-preparation',
      title: 'ENTRETIEN mc2i',
      description: "Simulation d'entretien de recrutement avec un consultant mc2i pour évaluer vos compétences AMOA",
      icon: <BsClipboardCheck className="h-5 w-5" />,
      destination: '/amoa/mc2i-interview-preparation-fixed',
      difficulty: 'tous niveaux',
      duration: '10 min',
      isNew: true
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
        'amoa-academie',         // Centre d'apprentissage en AMOA
        'parcours-amoa'          // Parcours progressif personnalisé
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
        'interview-simulation',     // Préparation d'audition client
        'mc2i-interview-preparation', // Préparation audition mc2i
        'test-reflexes',            // Test de réflexes AMOA
        'certification-interne'     // Parcours de certification
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
      modules: ['mc2i-ai-learning', 'amoa-academie', 'interview-simulation', 'mc2i-interview-preparation', 'projet-imposteur'],
      gradient: 'from-blue-600 to-blue-800'
    },
    {
      id: 'product-owner',
      title: 'Product Owner',
      description: "Gérer le backlog produit et prioriser les fonctionnalités dans un contexte Agile",
      icon: <BsKanban className="h-6 w-6 text-green-100" />,
      skills: ['Gestion de backlog', 'User stories', 'Agile', 'Priorisation'],
      modules: ['mc2i-ai-learning', 'amoa-academie', 'analyse-besoins'],
      gradient: 'from-green-600 to-green-800'
    },
    {
      id: 'business-analyst',
      title: 'Business Analyst',
      description: "Analyser et modéliser les processus métier pour concevoir des solutions optimales",
      icon: <FaRegChartBar className="h-6 w-6 text-amber-100" />,
      skills: ['Analyse processus', 'Modélisation', 'Data analytics', 'Business case'],
      modules: ['mc2i-ai-learning', 'analyse-besoins', 'parcours-amoa'],
      gradient: 'from-amber-600 to-amber-800'
    },
    {
      id: 'chef-projet',
      title: 'Chef de Projet',
      description: "Piloter des projets informatiques en respectant le budget, les délais et la qualité",
      icon: <FaProjectDiagram className="h-6 w-6 text-red-100" />,
      skills: ['Gestion de projet', 'Planification', 'Gestion risques', 'Pilotage d\'équipe'],
      modules: ['parcours-amoa', 'test-reflexes', 'simulation-reunion', 'certification-interne'],
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
      <div 
        className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-800 via-[#006a9e] to-blue-900"
        style={{ fontSize: `${textSize}rem` }}
      >
        {/* Bouton retour à l'accueil */}
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="outline" 
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-md border-0 hover:from-blue-700 hover:to-blue-800"
            onClick={() => window.location.href = '/'}
          >
            <IoHomeIcon className="h-4 w-4 mr-2" />
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
              I AM mc2i
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto"
            >
              Assistant de formation intelligent pour les métiers de la transformation numérique
            </motion.p>
          </div>

          {/* Modules mc2i */}
          <div className="mt-8 px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center max-w-6xl mx-auto">
              {/* COACH ENTRETIEN */}
              <Card 
                className={`w-full ${
                  highContrastMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-gradient-to-br from-[#1a3a60]/80 to-[#224980]/80 border border-blue-300/30 backdrop-blur-sm'
                } hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
                onClick={() => navigate('/amoa/coach-entretien')}
              >
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-lg ${
                      highContrastMode 
                        ? 'bg-blue-800' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-700 shadow-md'
                    }`}>
                      <IoVideocam className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-2xl font-bold">COACH ENTRETIEN</CardTitle>
                  <CardDescription className="text-center text-blue-300 mt-2">
                    Simulateur d'entretiens clients avec intelligence artificielle
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center flex flex-col items-center">
                  <p className="text-gray-200 mb-4">
                    Préparez-vous aux différents scénarios d'entretien avec feedback personnalisé
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-5"
                    onClick={() => setLocation('/amoa/coach-entretien')}
                  >
                    Démarrer une simulation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            
              {/* PROJET ACADEMY */}
              <Card 
                className={`w-full ${
                  highContrastMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-gradient-to-br from-[#1a3a60]/80 to-[#224980]/80 border border-blue-300/30 backdrop-blur-sm'
                } hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
                onClick={() => setLocation('/amoa/projet-academy')}
              >
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-lg ${
                      highContrastMode 
                        ? 'bg-blue-900' 
                        : 'bg-gradient-to-r from-indigo-500 to-indigo-700 shadow-md'
                    }`}>
                      <BsClipboardCheck className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-2xl font-bold">PROJET ACADEMY</CardTitle>
                  <CardDescription className="text-center text-blue-300 mt-2">
                    Centre de formation aux méthodes et outils de gestion de projet mc2i
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center flex flex-col items-center">
                  <p className="text-gray-200 mb-4">
                    Maîtrisez les bonnes pratiques, méthodologies agiles et gestion documentaire
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white px-6 py-5"
                    onClick={() => setLocation('/amoa/projet-academy')}
                  >
                    Explorer les formations
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* CONSULTANT LAB */}
              <Card 
                className={`w-full ${
                  highContrastMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-gradient-to-br from-[#1a3a60]/80 to-[#224980]/80 border border-blue-300/30 backdrop-blur-sm'
                } hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
                onClick={() => setLocation('/amoa/consultant-lab')}
              >
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-lg ${
                      highContrastMode 
                        ? 'bg-purple-900' 
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md'
                    }`}>
                      <IoAnalytics className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-2xl font-bold">CONSULTANT LAB</CardTitle>
                  <CardDescription className="text-center text-blue-300 mt-2">
                    Environnement d'apprentissage pour maîtriser l'analyse et la transformation métier
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center flex flex-col items-center">
                  <p className="text-gray-200 mb-4">
                    Développez vos compétences d'analyse avec des exercices pratiques et interactifs
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-5"
                    onClick={() => setLocation('/amoa/consultant-lab')}
                  >
                    Accéder au laboratoire
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}