import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { HelpCircle, Search, Circle } from 'lucide-react';
// Remplacer les icônes Lucide par des icônes modernes
import { IoHome, IoSearchOutline, IoBookOutline, IoDesktopOutline, IoTrophyOutline, IoConstructOutline } from 'react-icons/io5';
import { IoMdArrowForward } from 'react-icons/io';
import { BsShieldCheck, BsBarChartFill, BsEye, BsCpu, BsCodeSlash, BsCloud, BsPeopleFill, 
         BsBookmarkCheck, BsBriefcase, BsGearFill, BsChevronRight, BsFilterLeft, 
         BsLightningCharge, BsExclamationCircleFill } from 'react-icons/bs';
import { FiSun, FiMoon } from 'react-icons/fi';
import { AiOutlineZoomIn, AiOutlineZoomOut } from 'react-icons/ai';
import { FaGraduationCap, FaRobot } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { useTutorial } from '@/contexts/TutorialContext';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
}

export default function CyberModeSelectionFixedPage() {
  // État pour les paramètres d'accessibilité
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [fontSize, setFontSize] = useState(1);
  const { startTutorial } = useTutorial();

  // Objectifs d'apprentissage en cybersécurité
  const learningObjectives: LearningObjective[] = [
    {
      id: 'apprendre',
      title: 'Apprendre',
      description: 'Découvrez et maîtrisez les concepts fondamentaux de la cybersécurité.',
      icon: <BsBookmarkCheck className="h-5 w-5 text-white" />,
      modules: ['expert-learning', 'cyberacademie', 'pentest-simulator', 'cyberglosses'],
      gradient: 'from-blue-500 to-blue-700'
    },
    {
      id: 'pratiquer',
      title: 'Pratiquer',
      description: 'Mettez vos connaissances à l\'épreuve avec des exercices pratiques.',
      icon: <BsShieldCheck className="h-5 w-5 text-white" />,
      modules: ['firewall-defense', 'pentest-simulator', 'cyber-escape'],
      gradient: 'from-green-500 to-green-700'
    },
    {
      id: 'evaluer',
      title: 'S\'évaluer',
      description: 'Testez votre niveau de compétence et identifiez vos axes d\'amélioration.',
      icon: <BsBarChartFill className="h-5 w-5 text-white" />,
      modules: ['adaptive-quiz', 'cyber-defense-challenge', 'certification-test'],
      gradient: 'from-purple-500 to-purple-700'
    },
    {
      id: 'sentrainer',
      title: 'S\'entraîner',
      description: 'Perfectionnez vos compétences avec des exercices avancés.',
      icon: <BsLightningCharge className="h-5 w-5 text-white" />,
      modules: ['cyber-defense-challenge', 'cyber-escape', 'pentest-simulator'],
      gradient: 'from-orange-500 to-orange-700'
    }
  ];

  // Modules disponibles en cybersécurité
  const modules: Module[] = [
    {
      id: 'expert-learning',
      title: 'Expert Learning',
      description: 'Apprenez la cybersécurité avec un expert IA qui s\'adapte à vos besoins et répond à toutes vos questions.',
      icon: <FaRobot className="h-5 w-5 text-white" />,
      destination: '/cyber/expert-learning',
      difficulty: 'tous niveaux',
      duration: '30-60 min',
      isNew: true
    },
    {
      id: 'cyberacademie',
      title: 'Cyber Académie',
      description: 'Parcours structuré pour apprendre les fondamentaux de la cybersécurité et les bonnes pratiques.',
      icon: <BsBookmarkCheck className="h-5 w-5 text-white" />,
      destination: '/cyber/academie',
      difficulty: 'débutant',
      duration: '1-2 heures'
    },
    {
      id: 'adaptive-quiz',
      title: 'Quiz Adaptatif',
      description: 'Testez vos connaissances avec des questions adaptées à votre niveau.',
      icon: <BsEye className="h-5 w-5 text-white" />,
      destination: '/cyber/adaptive-quiz',
      difficulty: 'tous niveaux',
      duration: '15-30 min'
    },
    {
      id: 'firewall-defense',
      title: 'Firewall Defense',
      description: 'Jeu interactif pour comprendre les mécanismes de défense d\'un pare-feu.',
      icon: <BsShieldCheck className="h-5 w-5 text-white" />,
      destination: '/cyber/firewall-defense',
      difficulty: 'intermédiaire',
      duration: '15-20 min'
    },
    {
      id: 'pentest-simulator',
      title: 'Pentest Simulator',
      description: 'Simulation de test d\'intrusion pour comprendre les techniques utilisées par les attaquants.',
      icon: <BsCodeSlash className="h-5 w-5 text-white" />,
      destination: '/cyber/pentest-simulator',
      difficulty: 'avancé',
      duration: '30-45 min'
    },
    {
      id: 'cyber-defense-challenge',
      title: 'Cyber Defense Challenge',
      description: 'Défi de défense contre des attaques simulées pour mettre en pratique vos connaissances.',
      icon: <BsCloud className="h-5 w-5 text-white" />,
      destination: '/cyber/defense-challenge',
      difficulty: 'avancé',
      duration: '45-60 min'
    },
    {
      id: 'cyber-escape',
      title: 'Cyber Escape',
      description: 'Escape game virtuel sur les thématiques de la cybersécurité.',
      icon: <BsCpu className="h-5 w-5 text-white" />,
      destination: '/cyber/escape',
      difficulty: 'intermédiaire',
      duration: '30-45 min'
    },
    {
      id: 'certification-test',
      title: 'Test de Certification',
      description: 'Évaluez votre niveau pour vous préparer aux certifications officielles.',
      icon: <FaGraduationCap className="h-5 w-5 text-white" />,
      destination: '/cyber/certification-test',
      difficulty: 'avancé',
      duration: '60 min',
      comingSoon: true
    },
    {
      id: 'cyberglosses',
      title: 'CyberGlosses',
      description: 'Glossaire complet des termes techniques de cybersécurité.',
      icon: <BsBookmarkCheck className="h-5 w-5 text-white" />,
      destination: '/cyber/cyberglosses',
      difficulty: 'débutant',
      duration: 'référence',
      comingSoon: true
    }
  ];

  // Fonction pour obtenir les modules correspondant à un objectif
  function getModulesForObjective(objectiveId: string): Module[] {
    const objective = learningObjectives.find(obj => obj.id === objectiveId);
    if (!objective) return [];
    
    return modules.filter(module => objective.modules.includes(module.id));
  }

  // Fonction pour afficher un badge de difficulté
  function renderDifficultyBadge(difficulty: string) {
    let badgeClasses = "";
    let icon = null;
    
    switch(difficulty) {
      case 'débutant':
        badgeClasses = highContrastMode ? "bg-green-900 text-white" : "bg-green-600 text-white";
        icon = <Circle className="h-2 w-2 mr-1" />;
        break;
      case 'intermédiaire':
        badgeClasses = highContrastMode ? "bg-blue-900 text-white" : "bg-blue-600 text-white";
        icon = <Circle className="h-2 w-2 mr-1" />;
        break;
      case 'avancé':
        badgeClasses = highContrastMode ? "bg-purple-900 text-white" : "bg-purple-600 text-white";
        icon = <Circle className="h-2 w-2 mr-1" />;
        break;
      default:
        badgeClasses = highContrastMode ? "bg-gray-700 text-white" : "bg-gray-600 text-white";
    }
    
    return (
      <Badge variant="secondary" className={`${badgeClasses} ml-2 h-6 py-1 pl-2 pr-3 text-xs font-medium`}>
        <div className="flex items-center">
          {icon}
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </div>
      </Badge>
    );
  }

  // Alternance entre les modes de contraste
  const toggleContrastMode = () => {
    setHighContrastMode(!highContrastMode);
  };

  // Augmenter la taille de la police
  const increaseFontSize = () => {
    if (fontSize < 1.4) setFontSize(fontSize + 0.1);
  };

  // Diminuer la taille de la police
  const decreaseFontSize = () => {
    if (fontSize > 0.8) setFontSize(fontSize - 0.1);
  };

  return (
    <HomeLayout>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* En-tête avec navigation et titre */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <Link href="/" className="flex items-center mr-4 text-white">
                <IoHome className="h-5 w-5 mr-2" />
                <span>Accueil</span>
              </Link>
              <span className="text-gray-400 mx-2">/</span>
              <span className="text-blue-400">Mode Cyber</span>
            </div>
            
            {/* Outils d'accessibilité */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="p-2"
                onClick={toggleContrastMode}
                title="Changer le mode de contraste"
              >
                {highContrastMode ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="p-2"
                onClick={decreaseFontSize}
                title="Réduire la taille du texte"
              >
                <AiOutlineZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="p-2"
                onClick={increaseFontSize}
                title="Augmenter la taille du texte"
              >
                <AiOutlineZoomIn className="h-4 w-4" />
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="p-2"
                      onClick={() => startTutorial('cyber')}
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Démarrer le tutoriel</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Titre principal et description */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <PageTitle title="Cybersécurité" />
            <p className={`mt-4 text-lg text-blue-100 max-w-3xl mx-auto`} style={{ fontSize: `${fontSize}rem` }}>
              Trouvez votre parcours d'apprentissage personnalisé en cybersécurité
            </p>
          </motion.div>

          {/* Titre section Objectifs d'apprentissage */}
          <div className="flex items-center mb-8">
            <IoBookOutline className="h-6 w-6 mr-3 text-blue-400" />
            <h2 className="text-xl font-bold">Par objectif d'apprentissage</h2>
          </div>

          {/* Contenu des objectifs d'apprentissage */}
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
                            href={module.destination}
                            className={`block p-3 rounded-lg ${
                              highContrastMode 
                                ? 'bg-gray-700 hover:bg-gray-600' 
                                : 'bg-white/10 hover:bg-white/20'
                            } transition-colors`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{module.title}</span>
                              <IoMdArrowForward className="h-5 w-5" />
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
        </div>
      </div>
    </HomeLayout>
  );
}