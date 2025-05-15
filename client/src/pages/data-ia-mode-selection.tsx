import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import '../styles/data-ia.css';
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
  BsBriefcase,
  BsGraphUp,
  BsBarChartLine,
  BsDatabase
} from 'react-icons/bs';
import { RiTeamLine, RiUserSettingsLine, RiFilterLine, RiRobot2Line } from 'react-icons/ri';
import { MdOutlineEmojiEvents, MdOutlineDataExploration } from 'react-icons/md';
import { FaProjectDiagram, FaRegChartBar, FaRegChartBar as FaChartLine } from 'react-icons/fa';
import { AiOutlineZoomIn, AiOutlineZoomOut, AiOutlineCloudServer } from 'react-icons/ai';
import { FiMoon, FiSun } from 'react-icons/fi';

import { Button } from '@/components/ui/button';
import DataGlitchText from '@/components/DataGlitchText';
import { DataButton } from '@/components/DataButton';
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

export default function DataIaModeSelection() {
  // États pour les contrôles d'accessibilité
  const [highContrastMode, setHighContrastMode] = useState<boolean>(false);
  const [textSize, setTextSize] = useState<number>(1);
  
  // États pour la filtration et la navigation
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [selectedCareerPath, setSelectedCareerPath] = useState<string | null>(null);
  const [currentTour, setCurrentTour] = useState<string | null>(null);

  // Modules Data & IA disponibles
  const modules: Module[] = [
    {
      id: 'data-trainer',
      title: 'DATA TRAINER',
      description: 'Formez-vous aux fondamentaux de la Data Science à votre rythme. Parcours personnalisé et interactif.',
      icon: <BsGraphUp className="h-5 w-5 text-purple-200" />,
      destination: '/data-ia/data-trainer',
      difficulty: 'débutant',
      isNew: false,
      comingSoon: true
    },
    {
      id: 'ia-concepts',
      title: 'CONCEPTS IA',
      description: 'Maîtrisez les concepts fondamentaux et le vocabulaire de l\'intelligence artificielle.',
      icon: <RiRobot2Line className="h-5 w-5 text-indigo-200" />,
      destination: '/data-ia/ia-concepts',
      difficulty: 'débutant',
      comingSoon: true
    },
    {
      id: 'data-playground',
      title: 'DATA PLAYGROUND',
      description: 'Environnement interactif pour explorer et manipuler des données réelles.',
      icon: <MdOutlineDataExploration className="h-5 w-5 text-cyan-200" />,
      destination: '/data-ia/data-playground',
      difficulty: 'intermédiaire',
      comingSoon: true
    },
    {
      id: 'projets-data-science',
      title: 'PROJETS DATA SCIENCE',
      description: 'Mettez en pratique vos connaissances sur des cas réels issus de projets mc2i.',
      icon: <BsDatabase className="h-5 w-5 text-blue-200" />,
      destination: '/data-ia/projets-data-science',
      difficulty: 'intermédiaire',
      comingSoon: true
    },
    {
      id: 'simulations-ia',
      title: 'SIMULATIONS IA',
      description: 'Pratiquez la conception et l\'implémentation de solutions IA dans des scénarios simulés.',
      icon: <AiOutlineCloudServer className="h-5 w-5 text-violet-200" />,
      destination: '/data-ia/simulations-ia',
      difficulty: 'intermédiaire',
      comingSoon: true
    },
    {
      id: 'datathon',
      title: 'DATATHON',
      description: 'Challenges analytiques chronométrés pour tester vos compétences sous pression.',
      icon: <BsBarChartLine className="h-5 w-5 text-pink-200" />,
      destination: '/data-ia/datathon',
      difficulty: 'avancé',
      comingSoon: true
    },
    {
      id: 'certification-data',
      title: 'CERTIFICATION DATA',
      description: 'Obtenez une certification interne validant vos compétences en Data Science selon les standards mc2i.',
      icon: <MdOutlineEmojiEvents className="h-5 w-5 text-yellow-200" />,
      destination: '/data-ia/certification-data',
      difficulty: 'avancé',
      comingSoon: true
    },
    {
      id: 'data-generator',
      title: 'DATA GENERATOR',
      description: 'Outils pour générer et transformer des données pour vos analyses et modèles.',
      icon: <BsFileEarmarkCode className="h-5 w-5 text-green-200" />,
      destination: '/data-ia/data-generator',
      difficulty: 'intermédiaire',
      isNew: false,
      comingSoon: true
    },
    {
      id: 'modeles-ia',
      title: 'BIBLIOTHÈQUE DE MODÈLES',
      description: 'Accédez à une collection de modèles IA prêts à l\'emploi pour différents cas d\'usage.',
      icon: <BsGearFill className="h-5 w-5 text-violet-200" />,
      destination: '/data-ia/modeles-ia',
      difficulty: 'intermédiaire',
      comingSoon: true
    }
  ];

  // Objectifs d'apprentissage
  const learningObjectives: LearningObjective[] = [
    {
      id: 'seformer',
      title: "SE FORMER",
      description: "Acquérez les bases théoriques et pratiques en Data Science et Intelligence Artificielle",
      icon: <IoBookOutline className="h-6 w-6 text-purple-100" />,
      gradient: 'from-purple-700 to-indigo-900',
      modules: ['data-trainer', 'ia-concepts']
    },
    {
      id: 'sentrainer',
      title: "S'ENTRAÎNER",
      description: "Mettez en pratique vos connaissances sur des datasets et des cas concrets",
      icon: <IoDesktopOutline className="h-6 w-6 text-blue-100" />,
      gradient: 'from-blue-700 to-indigo-900',
      modules: ['data-playground', 'projets-data-science', 'simulations-ia']
    },
    {
      id: 'sevaluer',
      title: "S'ÉVALUER",
      description: "Testez vos compétences dans des conditions de challenge et d'évaluation",
      icon: <IoTrophyOutline className="h-6 w-6 text-pink-100" />,
      gradient: 'from-pink-700 to-purple-900',
      modules: ['datathon', 'certification-data']
    },
    {
      id: 'creer',
      title: "AUTOMATISER",
      description: "Utilisez des outils pour générer et transformer des données, et accédez à des modèles IA",
      icon: <IoConstructOutline className="h-6 w-6 text-blue-100" />,
      gradient: 'from-blue-700 to-cyan-900',
      modules: ['data-generator', 'modeles-ia']
    }
  ];

  // Parcours métiers Data & IA
  const careerPaths: CareerPath[] = [
    {
      id: 'data-analyst',
      title: 'Data Analyst',
      description: "Analyser et interpréter des données pour aider à la prise de décision business",
      icon: <FaChartLine className="h-6 w-6 text-blue-100" />,
      gradient: 'from-blue-700 to-purple-800',
      skills: [
        'Data Visualization',
        'SQL',
        'Reporting',
        'Statistiques descriptives',
        'Excel/Power BI/Tableau'
      ],
      modules: ['data-trainer', 'ia-concepts', 'projets-data-science', 'data-generator']
    },
    {
      id: 'data-scientist',
      title: 'Data Scientist',
      description: "Développer des modèles statistiques et d'IA pour extraire de la valeur des données",
      icon: <BsGraphUp className="h-6 w-6 text-purple-100" />,
      gradient: 'from-purple-700 to-indigo-900',
      skills: [
        'Machine Learning',
        'Python',
        'Statistiques avancées',
        'Feature Engineering',
        'Deep Learning'
      ],
      modules: ['data-trainer', 'projets-data-science', 'simulations-ia', 'datathon']
    },
    {
      id: 'data-engineer',
      title: 'Data Engineer',
      description: "Concevoir et maintenir l'architecture de traitement des données",
      icon: <BsDatabase className="h-6 w-6 text-indigo-100" />,
      gradient: 'from-indigo-700 to-blue-900',
      skills: [
        'Big Data',
        'ETL/ELT',
        'SQL & NoSQL',
        'Cloud Computing',
        'Data Pipelines'
      ],
      modules: ['data-trainer', 'data-playground', 'data-generator']
    },
    {
      id: 'ai-engineer',
      title: 'AI Engineer',
      description: "Développer et déployer des solutions d'intelligence artificielle en production",
      icon: <RiRobot2Line className="h-6 w-6 text-violet-100" />,
      gradient: 'from-violet-700 to-purple-900',
      skills: [
        'MLOps',
        'Deep Learning',
        'NLP/Computer Vision',
        'API Development',
        'Monitoring de modèles'
      ],
      modules: ['ia-concepts', 'simulations-ia', 'datathon', 'modeles-ia']
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
    let color = 'bg-purple-600';
    
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
      <div id="data-ia-mode-selection" className={`min-h-screen pb-20 ${
        highContrastMode 
          ? 'bg-black text-white' 
          : 'bg-gradient-to-b from-[#1e3a5f] to-[#102848] text-white'
      }`} style={{ 
        fontSize: `${textSize}rem`,
        backgroundImage: highContrastMode ? 'none' : 'url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M1 1h18v18H1V1z" fill="none" stroke="rgba(100,149,237,0.05)" stroke-width="0.2"/%3E%3C/svg%3E")',
        backgroundRepeat: 'repeat',
      }}>
        {/* Navigation et contrôles */}
        <div className="px-8 py-8 relative max-w-[1600px] w-full mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center">
              <Link href="/">
                <DataButton 
                  variant="outline"
                  size="lg"
                  className="text-blue-300 border-blue-300/30 hover:bg-blue-900/20"
                  startIcon={<IoHome className="h-6 w-6" />}
                >
                  Accueil
                </DataButton>
              </Link>
              <PageTitle title="I AM DATA & IA" />
            </div>
            
            <div className="flex items-center gap-4">
              {/* Bouton d'aide */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DataButton 
                      variant="outline"
                      className="w-11 h-11 p-0 flex items-center justify-center rounded-full text-blue-300 border-blue-300/30 hover:bg-blue-900/20"
                      onClick={() => {
                        setCurrentTour('data-ia-mode-selection');
                        startTutorial();
                      }}
                      data-id="help-button"
                    >
                      <HelpCircle className="h-5 w-5" />
                    </DataButton>
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
                    <DataButton 
                      variant="outline"
                      className={`w-11 h-11 p-0 flex items-center justify-center rounded-full ${
                        highContrastMode 
                          ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                          : 'text-blue-300 border-blue-300/30 hover:bg-blue-900/20'
                      }`}
                      onClick={() => setHighContrastMode(!highContrastMode)}
                      data-id="contrast-button"
                    >
                      {highContrastMode ? (
                        <FiSun className="h-5 w-5" />
                      ) : (
                        <FiMoon className="h-5 w-5" />
                      )}
                    </DataButton>
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
                      <DataButton 
                        variant="outline"
                        className="w-10 h-10 p-0 flex items-center justify-center rounded-full text-blue-300 border-blue-300/30 hover:bg-blue-900/20"
                        onClick={() => setTextSize(Math.max(0.8, textSize - 0.1))}
                        data-id="text-smaller-button"
                      >
                        <AiOutlineZoomOut className="h-4 w-4" />
                      </DataButton>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Réduire la taille du texte</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DataButton 
                        variant="outline"
                        className="w-10 h-10 p-0 flex items-center justify-center rounded-full text-blue-300 border-blue-300/30 hover:bg-blue-900/20"
                        onClick={() => setTextSize(Math.min(1.2, textSize + 0.1))}
                        data-id="text-larger-button"
                      >
                        <AiOutlineZoomIn className="h-4 w-4" />
                      </DataButton>
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
            className="text-center mb-16 relative"
            data-id="main-title"
          >
            <h1 className="text-5xl font-bold mb-4 font-data-title relative">
              <span className="text-white">Centre de Formation</span>
              <br />
              <span className="text-6xl mt-2 block tracking-wider bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                I AM DATA & IA
              </span>
            </h1>
            <div className="w-40 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 mx-auto my-6 rounded-full"></div>
            <p className={`max-w-3xl mx-auto text-xl ${
              highContrastMode ? 'text-gray-300' : 'text-blue-100' 
            }`}>
              Trouvez votre parcours d'apprentissage personnalisé en <span className="font-semibold text-blue-300">Data Science</span> et <span className="font-semibold text-purple-300">Intelligence Artificielle</span>
            </p>
          </motion.div>

          {/* Modules Data & IA */}
          <div className="mt-8 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Section SE FORMER */}
              <Card className={`h-full ${
                highContrastMode 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-gradient-to-br from-[#1a3a60]/80 to-[#224980]/80 border border-blue-300/30 backdrop-blur-sm'
              } hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}>
                <CardHeader>
                  <div className="flex items-start justify-center">
                    <div className={`p-3 rounded-lg ${
                      highContrastMode 
                        ? 'bg-purple-900' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-md'
                    }`}>
                      <IoBookOutline className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-xl mt-2 font-data-title">SE FORMER</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge className="px-3 py-1.5 bg-amber-400/10 border border-amber-500/30 text-amber-400 text-md mb-3">
                    Bientôt disponible
                  </Badge>
                  <p className={highContrastMode ? 'text-gray-300' : 'text-gray-200'}>
                    Modules de formation en Data Science et Intelligence Artificielle
                  </p>
                </CardContent>
              </Card>
              
              {/* Section S'ENTRAÎNER */}
              <Card className={`h-full ${
                highContrastMode 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-gradient-to-br from-[#1a3a60]/80 to-[#224980]/80 border border-blue-300/30 backdrop-blur-sm'
              } hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}>
                <CardHeader>
                  <div className="flex items-start justify-center">
                    <div className={`p-3 rounded-lg ${
                      highContrastMode 
                        ? 'bg-blue-900' 
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-md'
                    }`}>
                      <IoDesktopOutline className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-xl mt-2 font-data-title">S'ENTRAÎNER</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge className="px-3 py-1.5 bg-amber-400/10 border border-amber-500/30 text-amber-400 text-md mb-3">
                    Bientôt disponible
                  </Badge>
                  <p className={highContrastMode ? 'text-gray-300' : 'text-gray-200'}>
                    Exercices pratiques et projets guidés en Data Science
                  </p>
                </CardContent>
              </Card>
              
              {/* Section S'ÉVALUER */}
              <Card className={`h-full ${
                highContrastMode 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-gradient-to-br from-[#1a3a60]/80 to-[#224980]/80 border border-blue-300/30 backdrop-blur-sm'
              } hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
              onClick={() => setLocation('/data-ia/read-me-if-you-can')}
              >
                <CardHeader>
                  <div className="flex items-start justify-center">
                    <div className={`p-3 rounded-lg ${
                      highContrastMode 
                        ? 'bg-pink-900' 
                        : 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-md'
                    }`}>
                      <IoTrophyOutline className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-xl mt-2 font-data-title">S'ÉVALUER</CardTitle>
                </CardHeader>
                <CardContent className="text-center flex flex-col items-center space-y-3">
                  <div className="space-y-3 w-full">
                    <div 
                      className={`px-3 py-3 rounded-md ${
                        highContrastMode 
                          ? 'bg-blue-900/50 hover:bg-blue-800 border border-blue-700' 
                          : 'bg-gradient-to-r from-pink-600/20 to-rose-600/20 hover:from-pink-600/30 hover:to-rose-600/30 border border-pink-400/30'
                      } transition-colors cursor-pointer`}
                    >
                      <div className="font-bold text-white mb-1 flex items-center justify-center">
                        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">READ ME IF YOU CAN</span>
                      </div>
                      <p className="text-xs text-gray-300">
                        Testez votre compréhension du code Python et SQL
                      </p>
                    </div>
                  </div>
                  <p className={highContrastMode ? 'text-gray-300' : 'text-gray-200'}>
                    Tests et certifications pour valider vos compétences
                  </p>
                </CardContent>
              </Card>
              
              {/* Section AUTOMATISER */}
              <Card className={`h-full ${
                highContrastMode 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-gradient-to-br from-[#1a3a60]/80 to-[#224980]/80 border border-blue-300/30 backdrop-blur-sm'
              } hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}>
                <CardHeader>
                  <div className="flex items-start justify-center">
                    <div className={`p-3 rounded-lg ${
                      highContrastMode 
                        ? 'bg-cyan-900' 
                        : 'bg-gradient-to-r from-blue-400 to-cyan-500 shadow-md'
                    }`}>
                      <IoConstructOutline className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-center text-xl mt-2 font-data-title">AUTOMATISER</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge className="px-3 py-1.5 bg-amber-400/10 border border-amber-500/30 text-amber-400 text-md mb-3">
                    Bientôt disponible
                  </Badge>
                  <p className={highContrastMode ? 'text-gray-300' : 'text-gray-200'}>
                    Outils d'automatisation et bonnes pratiques en IA
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}