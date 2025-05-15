import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
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
  // État pour le mode haut contraste/lisibilité
  const [highContrastMode, setHighContrastMode] = useState(false);
  
  // État pour la taille du texte
  const [textSize, setTextSize] = useState(1);
  
  // État pour le filtre de difficulté
  const [difficulty, setDifficulty] = useState<string[]>([]);
  
  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState('');
  
  // État pour le parcours métier sélectionné
  const [selectedCareerPath, setSelectedCareerPath] = useState<string | null>(null);
  
  // État pour la sélection du tutoriel
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  
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

  // Modules simulés pour le mode Data et Intelligence Artificielle
  const modules: Module[] = [
    // Liste des modules...
  ];

  // Objectifs d'apprentissage simulés
  const learningObjectives: LearningObjective[] = [
    {
      id: "data-fundamentals",
      title: "Fondamentaux de la Data",
      description: "Apprenez les concepts fondamentaux de la science des données et de l'analyse de données.",
      icon: <BsDatabase className="h-6 w-6" />,
      gradient: "from-blue-600 to-cyan-600",
      modules: ["data-101", "data-visualization", "sql-basics"]
    },
    {
      id: "ml-basics",
      title: "Machine Learning",
      description: "Découvrez les principes du Machine Learning et ses applications pratiques.",
      icon: <BsGraphUp className="h-6 w-6" />,
      gradient: "from-indigo-600 to-blue-600",
      modules: ["ml-intro", "ml-supervised", "ml-unsupervised"]
    },
    {
      id: "ai-ethics",
      title: "Éthique de l'IA",
      description: "Comprenez les implications éthiques et sociétales de l'Intelligence Artificielle.",
      icon: <BsLightbulb className="h-6 w-6" />,
      gradient: "from-purple-600 to-indigo-600",
      modules: ["ai-ethics-101", "responsible-ai", "ai-governance"]
    },
    {
      id: "data-engineering",
      title: "Data Engineering",
      description: "Maîtrisez les infrastructures et pipelines de données pour des projets à grande échelle.",
      icon: <AiOutlineCloudServer className="h-6 w-6" />,
      gradient: "from-blue-600 to-green-600",
      modules: ["data-pipelines", "big-data", "cloud-data"]
    }
  ];

  // Parcours métiers simulés
  const careerPaths: CareerPath[] = [
    {
      id: "data-analyst",
      title: "Data Analyst",
      description: "Transformez des données brutes en insights business exploitables",
      icon: <BsBarChartLine className="h-5 w-5" />,
      gradient: "from-blue-500 to-cyan-500",
      skills: [
        "Analyse statistique",
        "Visualisation de données",
        "SQL",
        "Excel avancé",
        "Business Intelligence"
      ],
      modules: ["data-101", "data-visualization", "sql-basics", "bi-tools"]
    },
    {
      id: "data-scientist",
      title: "Data Scientist",
      description: "Combinez statistiques, programmation et IA pour résoudre des problèmes complexes",
      icon: <MdOutlineDataExploration className="h-5 w-5" />,
      gradient: "from-purple-500 to-blue-500",
      skills: [
        "Machine Learning",
        "Analyse prédictive",
        "Python",
        "Statistiques avancées",
        "NLP"
      ],
      modules: ["ml-intro", "ml-supervised", "ml-unsupervised", "python-ds", "nlp-basics"]
    },
    {
      id: "ai-engineer",
      title: "Ingénieur(e) IA",
      description: "Développez et déployez des modèles d'IA avancés",
      icon: <RiRobot2Line className="h-5 w-5" />,
      gradient: "from-indigo-500 to-purple-500",
      skills: [
        "Deep Learning",
        "MLOps",
        "Frameworks IA",
        "Optimisation d'algorithmes",
        "Cloud Computing"
      ],
      modules: ["deep-learning", "mlops", "frameworks-ia", "cloud-ai"]
    },
    {
      id: "data-engineer",
      title: "Data Engineer",
      description: "Concevez et maintenez l'infrastructure de données critique",
      icon: <AiOutlineCloudServer className="h-5 w-5" />,
      gradient: "from-green-500 to-blue-500",
      skills: [
        "Architecture de données",
        "Big Data",
        "ETL/ELT",
        "Data Warehousing",
        "Hadoop/Spark"
      ],
      modules: ["data-pipelines", "big-data", "cloud-data", "databases"]
    }
  ];

  return (
    <HomeLayout>
      <div id="data-ia-mode-selection" className={`min-h-screen pb-20 ${
        highContrastMode ? 'bg-black text-white' : 'bg-gradient-to-b from-[#f0f8ff] via-[#e6f0ff] to-[#d8e8ff] text-gray-800'
      }`} style={{ fontSize: `${textSize}rem` }}>
        {/* Navigation et contrôles */}
        <div className="px-8 py-8 relative max-w-[1600px] w-full mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center">
              <Link href="/">
                <DataButton 
                  variant="glow"
                  size="lg"
                  dataEffect="flow"
                  className="font-data-title"
                  startIcon={<IoHome className="h-6 w-6" />}
                >
                  Accueil
                </DataButton>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Contrôles d'accessibilité */}
              <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full p-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setTextSize(prev => Math.max(0.8, prev - 0.1))}
                        className={`rounded-full ${highContrastMode ? 'text-gray-200 hover:bg-gray-700' : 'text-white/80'}`}
                      >
                        <AiOutlineZoomOut className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Réduire la taille du texte</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setTextSize(prev => Math.min(1.3, prev + 0.1))}
                        className={`rounded-full ${highContrastMode ? 'text-gray-200 hover:bg-gray-700' : 'text-white/80'}`}
                      >
                        <AiOutlineZoomIn className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Augmenter la taille du texte</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setHighContrastMode(prev => !prev)}
                        className={`rounded-full ${highContrastMode ? 'text-gray-200 hover:bg-gray-700' : 'text-white/80'}`}
                      >
                        {highContrastMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{highContrastMode ? 'Mode standard' : 'Mode haut contraste'}</p>
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
              <span className={highContrastMode ? "text-white" : "text-gray-800"}>Centre de Formation Data & IA</span>
              <br />
              <span className="text-6xl mt-2 block tracking-wider text-blue-600">
                I AM DATA
              </span>
            </h1>
            <div className="w-20 h-1 bg-blue-500 mx-auto my-6"></div>
            <p className={`max-w-3xl mx-auto text-xl ${
              highContrastMode ? 'text-gray-300' : 'text-gray-600' 
            }`}>
              Trouvez votre parcours d'apprentissage personnalisé en <span className="font-semibold text-blue-600">Data Science</span> et <span className="font-semibold text-purple-600">Intelligence Artificielle</span>
            </p>
          </motion.div>

          {/* Contenu principal */}
          <div className="w-full mb-10">
            <h2 className={`text-2xl font-bold mb-6 font-data-title ${highContrastMode ? 'text-white' : 'text-gray-800'}`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-full mr-3 ${highContrastMode ? 'bg-blue-800' : 'bg-blue-100 text-blue-600'}`}>
                  <IoBookOutline className="h-6 w-6" />
                </div>
                Objectifs d'apprentissage
              </div>
            </h2>

            {/* Contenu des objectifs d'apprentissage */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {learningObjectives.map((objective) => (
                <motion.div
                  key={objective.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`rounded-xl p-8 shadow-lg relative overflow-hidden ${
                    highContrastMode 
                      ? 'bg-gray-800 border border-gray-700' 
                      : 'bg-white border border-blue-100'
                  }`}
                  data-id={`objective-${objective.id}`}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-full ${
                        highContrastMode ? 'bg-purple-900' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {objective.icon}
                      </div>
                      <h2 className={`text-2xl font-bold font-data-title ${
                        highContrastMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {objective.title}
                      </h2>
                    </div>
                    
                    <p className={`mb-6 ${
                      highContrastMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {objective.description}
                    </p>
                    
                    <div className="mt-auto">
                      <h3 className={`font-medium mb-3 font-data flex items-center ${
                        highContrastMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                        Modules:
                      </h3>
                      <div className="p-4 rounded-lg bg-gray-50 text-center border border-gray-200">
                        <Badge className="px-3 py-1.5 bg-amber-50 border-amber-300 text-amber-600 text-md mb-2">
                          Bientôt disponible
                        </Badge>
                        <p className="text-gray-600 text-sm">Les modules de cette section seront disponibles prochainement.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Section Parcours Métier */}
            <h2 className={`text-2xl font-bold mb-6 mt-16 font-data-title ${highContrastMode ? 'text-white' : 'text-gray-800'}`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-full mr-3 ${highContrastMode ? 'bg-purple-800' : 'bg-purple-100 text-purple-600'}`}>
                  <BsBriefcase className="h-6 w-6" />
                </div>
                Parcours métiers en Data & IA
              </div>
            </h2>
            
            <div className="flex flex-col gap-6">
              {/* Sélection du parcours métier */}
              <div className={`p-4 rounded-lg ${
                highContrastMode ? 'bg-gray-800 border border-gray-700' : 'bg-white/80 border border-blue-100 shadow-sm'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {careerPaths.map(career => (
                    <Button
                      key={career.id}
                      variant={highContrastMode ? "outline" : "secondary"}
                      className={`h-auto py-3 justify-start min-h-[52px] ${
                        selectedCareerPath === career.id 
                          ? highContrastMode 
                            ? 'bg-purple-900 border-purple-700' 
                            : 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : highContrastMode 
                            ? 'bg-gray-800 border-gray-700' 
                            : 'bg-white text-gray-700 border border-gray-200'
                      }`}
                      onClick={() => setSelectedCareerPath(career.id)}
                      data-id={`career-${career.id}`}
                    >
                      <div className="flex items-start gap-2 w-full">
                        <div className={`p-1.5 rounded-full shrink-0 ${
                          highContrastMode 
                            ? 'bg-gray-700' 
                            : 'bg-blue-50'
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
                    highContrastMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-blue-100 shadow-sm'
                  }`}
                >
                  {careerPaths
                    .filter(career => career.id === selectedCareerPath)
                    .map(career => (
                      <div key={career.id}>
                        <div className="flex items-start gap-4 mb-6">
                          <div className={`p-3 rounded-full ${
                            highContrastMode ? 'bg-purple-900' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {career.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className={`text-2xl font-bold line-clamp-2 ${
                              highContrastMode ? 'text-white' : 'text-gray-800'
                            }`}>
                              {career.title}
                            </h2>
                            <p className={`line-clamp-2 ${
                              highContrastMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {career.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Compétences clés */}
                          <div>
                            <h3 className={`text-lg font-semibold mb-3 ${
                              highContrastMode ? 'text-white' : 'text-gray-800'
                            }`}>
                              Compétences clés
                            </h3>
                            <ul className="space-y-2">
                              {career.skills.map((skill, index) => (
                                <li 
                                  key={index}
                                  className={`px-3 py-2 rounded-lg ${
                                    highContrastMode ? 'bg-gray-700' : 'bg-gray-50 text-gray-700 border border-gray-200'
                                  }`}
                                >
                                  {skill}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Modules recommandés */}
                          <div className="lg:col-span-2">
                            <h3 className={`text-lg font-semibold mb-3 ${
                              highContrastMode ? 'text-white' : 'text-gray-800'
                            }`}>
                              Parcours d'apprentissage
                            </h3>
                            <div className="p-6 rounded-lg bg-gray-50 text-center border border-gray-200">
                              <Badge className="px-3 py-1.5 bg-amber-50 border-amber-300 text-amber-600 text-md mb-3">
                                Bientôt disponible
                              </Badge>
                              <p className="text-gray-600">Les modules pour ce parcours métier seront disponibles prochainement.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </motion.div>
              )}
            </div>

            {/* Section Tous les modules */}
            <h2 className={`text-2xl font-bold mb-6 mt-16 font-data-title ${highContrastMode ? 'text-white' : 'text-gray-800'}`}>
              <div className="flex items-center">
                <div className={`p-2 rounded-full mr-3 ${highContrastMode ? 'bg-gray-800' : 'bg-gray-100 text-gray-600'}`}>
                  <BsGearFill className="h-6 w-6" />
                </div>
                Tous les modules
              </div>
            </h2>

            {/* Filtres de difficulté */}
            {difficulty.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6 px-2">
                <div className={`text-sm py-1 font-medium ${highContrastMode ? 'text-white' : 'text-gray-700'}`}>
                  Filtres actifs:
                </div>
                {difficulty.map(level => (
                  <Badge 
                    key={level}
                    variant="outline"
                    className={`${
                      highContrastMode 
                        ? 'bg-purple-900 text-white border-purple-700' 
                        : 'bg-blue-50 text-blue-800 border-blue-200'
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
                  className={`text-xs h-8 ${highContrastMode ? 'text-white' : 'text-gray-600'}`}
                  onClick={() => setDifficulty([])}
                >
                  Effacer tous les filtres
                </Button>
              </div>
            )}

            {/* Sélection des filtres */}
            <div className={`mb-10 p-6 rounded-xl shadow-sm ${
              highContrastMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-blue-100'
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
                        : 'bg-white border-gray-200 text-gray-800 placeholder:text-gray-400'
                    }`}
                    data-id="search-input"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <RiFilterLine className={`h-5 w-5 ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-base font-medium ${highContrastMode ? 'text-white' : 'text-gray-700'}`}>
                    Difficulté:
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={difficulty.includes('débutant') ? 'default' : 'outline'}
                      className={`h-9 px-4 text-sm ${
                        difficulty.includes('débutant')
                          ? highContrastMode 
                            ? 'bg-green-900 hover:bg-green-800' 
                            : 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200'
                          : highContrastMode 
                            ? 'border-gray-600 text-white' 
                            : 'border-gray-200 text-gray-700'
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
                            : 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200'
                          : highContrastMode 
                            ? 'border-gray-600 text-white' 
                            : 'border-gray-200 text-gray-700'
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
                            : 'bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-200'
                          : highContrastMode 
                            ? 'border-gray-600 text-white' 
                            : 'border-gray-200 text-gray-700'
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
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200'
                          : highContrastMode 
                            ? 'border-gray-600 text-white' 
                            : 'border-gray-200 text-gray-700'
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

            {/* Affichage du message "Bientôt disponible" pour tous les modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Section SE FORMER */}
              <Card className={`h-full border ${highContrastMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <CardHeader>
                  <div className="flex items-start justify-center">
                    <div className={`p-3 rounded-lg ${highContrastMode ? 'bg-purple-900' : 'bg-blue-50'}`}>
                      <IoBookOutline className={`h-6 w-6 ${highContrastMode ? 'text-purple-100' : 'text-blue-600'}`} />
                    </div>
                  </div>
                  <CardTitle className={`text-center text-xl mt-2 ${highContrastMode ? 'text-white' : 'text-gray-800'}`}>
                    SE FORMER
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge className="px-3 py-1.5 bg-amber-50 border-amber-300 text-amber-600 text-md mb-3">
                    Bientôt disponible
                  </Badge>
                  <p className={highContrastMode ? 'text-gray-300' : 'text-gray-600'}>
                    Modules de formation Data & IA à venir prochainement.
                  </p>
                </CardContent>
              </Card>
              
              {/* Section S'ENTRAÎNER */}
              <Card className={`h-full border ${highContrastMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <CardHeader>
                  <div className="flex items-start justify-center">
                    <div className={`p-3 rounded-lg ${highContrastMode ? 'bg-blue-900' : 'bg-blue-50'}`}>
                      <IoDesktopOutline className={`h-6 w-6 ${highContrastMode ? 'text-blue-100' : 'text-blue-600'}`} />
                    </div>
                  </div>
                  <CardTitle className={`text-center text-xl mt-2 ${highContrastMode ? 'text-white' : 'text-gray-800'}`}>
                    S'ENTRAÎNER
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge className="px-3 py-1.5 bg-amber-50 border-amber-300 text-amber-600 text-md mb-3">
                    Bientôt disponible
                  </Badge>
                  <p className={highContrastMode ? 'text-gray-300' : 'text-gray-600'}>
                    Modules d'entraînement Data & IA à venir prochainement.
                  </p>
                </CardContent>
              </Card>
              
              {/* Section S'ÉVALUER */}
              <Card className={`h-full border ${highContrastMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <CardHeader>
                  <div className="flex items-start justify-center">
                    <div className={`p-3 rounded-lg ${highContrastMode ? 'bg-pink-900' : 'bg-purple-50'}`}>
                      <IoTrophyOutline className={`h-6 w-6 ${highContrastMode ? 'text-pink-100' : 'text-purple-600'}`} />
                    </div>
                  </div>
                  <CardTitle className={`text-center text-xl mt-2 ${highContrastMode ? 'text-white' : 'text-gray-800'}`}>
                    S'ÉVALUER
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge className="px-3 py-1.5 bg-amber-50 border-amber-300 text-amber-600 text-md mb-3">
                    Bientôt disponible
                  </Badge>
                  <p className={highContrastMode ? 'text-gray-300' : 'text-gray-600'}>
                    Modules d'évaluation Data & IA à venir prochainement.
                  </p>
                </CardContent>
              </Card>
              
              {/* Section AUTOMATISER */}
              <Card className={`h-full border ${highContrastMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <CardHeader>
                  <div className="flex items-start justify-center">
                    <div className={`p-3 rounded-lg ${highContrastMode ? 'bg-cyan-900' : 'bg-cyan-50'}`}>
                      <IoConstructOutline className={`h-6 w-6 ${highContrastMode ? 'text-cyan-100' : 'text-cyan-600'}`} />
                    </div>
                  </div>
                  <CardTitle className={`text-center text-xl mt-2 ${highContrastMode ? 'text-white' : 'text-gray-800'}`}>
                    AUTOMATISER
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge className="px-3 py-1.5 bg-amber-50 border-amber-300 text-amber-600 text-md mb-3">
                    Bientôt disponible
                  </Badge>
                  <p className={highContrastMode ? 'text-gray-300' : 'text-gray-600'}>
                    Modules d'automatisation Data & IA à venir prochainement.
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