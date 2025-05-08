import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Home, 
  HelpCircle, 
  Search, 
  BookOpen, 
  Monitor, 
  Award, 
  Wrench, 
  Shield, 
  LineChart, 
  Eye, 
  Cpu, 
  Code, 
  Cloud, 
  Users, 
  BookMarked,
  Briefcase,
  Settings,
  ChevronRight,
  Filter,
  Zap,
  AlertCircle,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  Lock,
  LayoutGrid,
  List,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { useTutorial } from '@/contexts/TutorialContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  duration: string;
  isNew?: boolean;
  comingSoon?: boolean;
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

interface LearningObjective {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  modules: string[]; // IDs des modules recommandés
  gradient: string;
}

export default function CyberModeSelectionRedesign() {
  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [selectedCareerPath, setSelectedCareerPath] = useState<string | null>(null);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [textSize, setTextSize] = useState(1); // 1 = normal, >1 = larger, <1 = smaller
  
  // Tutorial integration
  const { showTutorial, startTutorial, setCurrentTour, tutorialSeen, isTutorialActive } = useTutorial();

  // Démarrage du didacticiel au chargement initial
  useEffect(() => {
    // Utilisons une variable dans le localStorage pour marquer que le tutoriel a été démarré
    const hasTutorialStarted = sessionStorage.getItem('tutorialStarted');
    
    if (!hasTutorialStarted) {
      // Marquer que le tutoriel a démarré pour cette session
      sessionStorage.setItem('tutorialStarted', 'true');
      
      setCurrentTour('cyber-mode-selection-redesign');
      const timer = setTimeout(() => {
        startTutorial();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [setCurrentTour, startTutorial]);
  
  // Effet pour bloquer le défilement pendant le tutoriel
  useEffect(() => {
    if (isTutorialActive) {
      // Empêcher le défilement et forcer le haut de la page
      window.scrollTo(0, 0);
      document.body.style.overflow = 'hidden';
      
      // Ajouter une classe CSS au corps pour éviter le rebond sur mobile
      document.body.classList.add('tutorial-active');
    } else {
      // Réactiver le défilement normal
      document.body.style.overflow = '';
      document.body.classList.remove('tutorial-active');
    }
    
    return () => {
      // Nettoyage au démontage du composant
      document.body.style.overflow = '';
      document.body.classList.remove('tutorial-active');
    };
  }, [isTutorialActive]);

  // Tous les modules disponibles
  const allModules: Module[] = [
    {
      id: 'agent-ia',
      title: 'AGENT IA',
      description: "Discutez avec un expert en cybersécurité IA qui répond à toutes vos questions",
      icon: <Shield className="h-5 w-5" />,
      destination: '/cyber/expert-learning',
      difficulty: 'débutant',
      duration: '15-30 min'
    },
    {
      id: 'cyber-arcade',
      title: 'CYBERARCADE',
      description: "Apprenez les fondamentaux de la cybersécurité à travers des jeux interactifs",
      icon: <Monitor className="h-5 w-5" />,
      destination: '/cyber/arcade',
      difficulty: 'débutant',
      duration: '10-20 min'
    },
    {
      id: 'mise-en-situation',
      title: 'MISE EN SITUATION',
      description: "Entraînez-vous à gérer des incidents de sécurité dans des scénarios réalistes",
      icon: <AlertCircle className="h-5 w-5" />,
      destination: '/cyber-defense-new',
      difficulty: 'intermédiaire',
      duration: '20-40 min'
    },
    {
      id: 'preparation-audition',
      title: 'PRÉPARATION AUDITION CLIENT',
      description: "Simulez des entretiens avec des clients pour des missions de cybersécurité",
      icon: <Users className="h-5 w-5" />,
      destination: '/cyber/interview-simulation',
      difficulty: 'intermédiaire',
      duration: '30-45 min'
    },
    {
      id: 'mode-entretien',
      title: 'MODE ENTRETIEN',
      description: "Testez vos connaissances comme lors d'un entretien d'embauche en cybersécurité",
      icon: <Award className="h-5 w-5" />,
      destination: '/cyber/interview-test',
      difficulty: 'avancé',
      duration: '45-60 min',
      isNew: true
    },
    {
      id: 'test-technique',
      title: 'TEST TECHNIQUE',
      description: "Évaluez vos compétences techniques sur des problèmes concrets de sécurité",
      icon: <Cpu className="h-5 w-5" />,
      destination: '/cyber/test-technique',
      difficulty: 'avancé',
      duration: '60-90 min',
      isNew: true
    },
    {
      id: 'policy-converter',
      title: 'CONVERTISSEUR DE POLITIQUES',
      description: "Transformez des politiques techniques en versions accessibles pour différents publics",
      icon: <Wrench className="h-5 w-5" />,
      destination: '/cyber/tools/policy-converter',
      difficulty: 'intermédiaire',
      duration: '15-30 min'
    },
    {
      id: 'phishing-simulator',
      title: 'SIMULATEUR DE PHISHING',
      description: "Créez et analysez des simulations de phishing pour la sensibilisation",
      icon: <Eye className="h-5 w-5" />,
      destination: '/cyber/tools/phishing-simulator',
      difficulty: 'intermédiaire',
      duration: '20-30 min',
      isNew: true
    },
    {
      id: 'ascension-progression',
      title: 'CYBERASCENSION',
      description: "Suivez un parcours complet pour préparer des certifications professionnelles",
      icon: <LineChart className="h-5 w-5" />,
      destination: '/cyber/ascension',
      difficulty: 'avancé',
      duration: '10-15h',
      isNew: true
    }
  ];

  // Objectifs d'apprentissage
  const learningObjectives: LearningObjective[] = [
    {
      id: 'se-former',
      title: 'SE FORMER',
      description: "Contenus éducatifs et formations pour acquérir de nouvelles connaissances",
      icon: <BookOpen className="h-6 w-6 text-blue-100" />,
      modules: ['agent-ia', 'ascension-progression'],
      gradient: 'from-blue-700 to-blue-900'
    },
    {
      id: 'sentrainer',
      title: "S'ENTRAÎNER",
      description: "Activités pratiques et simulations pour développer vos compétences",
      icon: <Monitor className="h-6 w-6 text-indigo-100" />,
      modules: ['cyber-arcade', 'mise-en-situation', 'preparation-audition'],
      gradient: 'from-indigo-700 to-indigo-900'
    },
    {
      id: 'sevaluer',
      title: "S'ÉVALUER",
      description: "Tests et évaluations pour mesurer votre niveau",
      icon: <Award className="h-6 w-6 text-purple-100" />,
      modules: ['mode-entretien', 'test-technique'],
      gradient: 'from-purple-700 to-purple-900'
    },
    {
      id: 'creer',
      title: "CRÉER/AUTOMATISER",
      description: "Outils pour automatiser et simplifier les tâches de cybersécurité",
      icon: <Wrench className="h-6 w-6 text-teal-100" />,
      modules: ['policy-converter', 'phishing-simulator'],
      gradient: 'from-teal-700 to-teal-900'
    }
  ];

  // Parcours métiers
  const careerPaths: CareerPath[] = [
    {
      id: 'grc',
      title: 'Gouvernance, Risque et Conformité',
      description: "Pour les métiers orientés pilotage et stratégie (RSSI, Consultant GRC, Auditeur SSI)",
      icon: <Lock className="h-6 w-6 text-blue-100" />,
      skills: ['Gestion des risques', 'Conformité réglementaire', 'Politique de sécurité', 'Audit'],
      modules: ['agent-ia', 'preparation-audition', 'policy-converter', 'ascension-progression'],
      gradient: 'from-blue-700 to-blue-900'
    },
    {
      id: 'secops',
      title: 'Sécurité Opérationnelle',
      description: "Pour les métiers techniques de surveillance et défense (Analyste SOC, Incident Responder)",
      icon: <Shield className="h-6 w-6 text-red-100" />,
      skills: ['Détection d\'incidents', 'Analyse de logs', 'Gestion de crise', 'Forensique'],
      modules: ['mise-en-situation', 'test-technique', 'agent-ia', 'ascension-progression'],
      gradient: 'from-red-700 to-red-900'
    },
    {
      id: 'architecture',
      title: 'Architecture et Sécurisation',
      description: "Pour les concepteurs de systèmes sécurisés (Architecte sécurité, Ingénieur sécurité)",
      icon: <Cpu className="h-6 w-6 text-teal-100" />,
      skills: ['Conception de systèmes', 'Infrastructure sécurisée', 'Authentification', 'Chiffrement'],
      modules: ['agent-ia', 'test-technique', 'ascension-progression'],
      gradient: 'from-teal-700 to-teal-900'
    },
    {
      id: 'pentest',
      title: 'Test d\'intrusion et Red Team',
      description: "Pour les métiers offensifs (Pentester, Red Team, Ethical Hacker)",
      icon: <Zap className="h-6 w-6 text-purple-100" />,
      skills: ['Exploitation de vulnérabilités', 'Techniques d\'attaque', 'Social engineering', 'Post-exploitation'],
      modules: ['mise-en-situation', 'test-technique', 'phishing-simulator', 'ascension-progression'],
      gradient: 'from-purple-700 to-purple-900'
    },
    {
      id: 'devsecops',
      title: 'Sécurité des applications & DevSecOps',
      description: "Pour intégrer la sécurité dans le développement (DevSecOps, Security Champion)",
      icon: <Code className="h-6 w-6 text-yellow-100" />,
      skills: ['Analyse de code', 'Sécurité applicative', 'CI/CD sécurisé', 'Tests automatisés'],
      modules: ['agent-ia', 'test-technique', 'ascension-progression'],
      gradient: 'from-yellow-700 to-yellow-900'
    },
    {
      id: 'emerging',
      title: 'Cloud, OT, et IoT',
      description: "Pour les domaines techniques émergents (Cloud Security Engineer, OT Security)",
      icon: <Cloud className="h-6 w-6 text-indigo-100" />,
      skills: ['Sécurité cloud', 'Systèmes industriels', 'Objets connectés', 'Sécurité du hardware'],
      modules: ['agent-ia', 'mise-en-situation', 'ascension-progression'],
      gradient: 'from-indigo-700 to-indigo-900'
    },
    {
      id: 'awareness',
      title: 'Sensibilisation et formation',
      description: "Pour l'acculturation et la formation (Responsable sensibilisation, Formateur)",
      icon: <Users className="h-6 w-6 text-green-100" />,
      skills: ['Conception de formations', 'Communication', 'Gamification', 'Mesure d\'efficacité'],
      modules: ['cyber-arcade', 'agent-ia', 'phishing-simulator', 'policy-converter'],
      gradient: 'from-green-700 to-green-900'
    },
    {
      id: 'research',
      title: 'R&D et veille',
      description: "Pour l'innovation et le suivi de la menace (Chercheur, Veilleur en cybersécurité)",
      icon: <BookMarked className="h-6 w-6 text-amber-100" />,
      skills: ['Recherche avancée', 'Threat intelligence', 'Analyse de malware', 'Reverse engineering'],
      modules: ['agent-ia', 'test-technique', 'ascension-progression'],
      gradient: 'from-amber-700 to-amber-900'
    }
  ];

  // Filtrer les modules par recherche
  const filteredModules = allModules.filter(module => {
    const matchesSearch = searchTerm === '' || 
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = difficulty.length === 0 || 
      difficulty.includes(module.difficulty);
    
    return matchesSearch && matchesDifficulty;
  });

  // Obtenir les modules pour un objectif d'apprentissage
  const getModulesForObjective = (objectiveId: string) => {
    const objective = learningObjectives.find(obj => obj.id === objectiveId);
    if (!objective) return [];
    return allModules.filter(module => objective.modules.includes(module.id));
  };

  // Obtenir les modules pour un parcours métier
  const getModulesForCareer = (careerId: string) => {
    const career = careerPaths.find(path => path.id === careerId);
    if (!career) return [];
    return allModules.filter(module => career.modules.includes(module.id));
  };

  // Rendu d'un badge de difficulté
  const renderDifficultyBadge = (difficulty: string) => {
    let colorClass = '';
    
    if (highContrastMode) {
      switch(difficulty) {
        case 'débutant':
          colorClass = 'bg-green-900 text-white border-green-700';
          break;
        case 'intermédiaire':
          colorClass = 'bg-blue-900 text-white border-blue-700';
          break;
        case 'avancé':
          colorClass = 'bg-purple-900 text-white border-purple-700';
          break;
        default:
          colorClass = 'bg-gray-700 text-white border-gray-600';
      }
    } else {
      switch(difficulty) {
        case 'débutant':
          colorClass = 'bg-green-100 text-green-800 border-green-200';
          break;
        case 'intermédiaire':
          colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
          break;
        case 'avancé':
          colorClass = 'bg-purple-100 text-purple-800 border-purple-200';
          break;
        default:
          colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
    
    return (
      <Badge variant="outline" className={`${colorClass} border`}>
        {difficulty}
      </Badge>
    );
  };

  // Toggle filter
  const toggleDifficultyFilter = (level: string) => {
    if (difficulty.includes(level)) {
      setDifficulty(difficulty.filter(d => d !== level));
    } else {
      setDifficulty([...difficulty, level]);
    }
  };

  return (
    <HomeLayout>
      <div id="cyber-mode-selection" className={`min-h-screen pb-20 ${
        highContrastMode ? 'bg-black text-white' : 'bg-gradient-to-b from-blue-950 to-black text-white'
      }`} style={{ fontSize: `${textSize}rem` }}>
        {/* Navigation et contrôles */}
        <div className="p-6 relative container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" className="text-white text-lg px-5 py-2 h-auto">
                  <Home className="mr-2 h-6 w-6" />
                  Accueil
                </Button>
              </Link>
              <PageTitle title="I AM CYBER" />
              <div className="ml-4">
                <h2 className="text-xl font-bold">I AM CYBER</h2>
                <p className="text-sm text-gray-300">Explorez les ressources et modules de formation</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Bouton d'aide */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline"
                      size="icon"
                      className="w-10 h-10 rounded-full bg-blue-900/30 border-blue-800 text-white hover:bg-blue-800/50"
                      onClick={() => {
                        setCurrentTour('cyber-mode-selection-redesign');
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
                      className={`w-10 h-10 rounded-full ${
                        highContrastMode 
                          ? 'bg-blue-700 border-blue-600 text-white hover:bg-blue-600' 
                          : 'bg-blue-900/30 border-blue-800 text-white hover:bg-blue-800/50'
                      }`}
                      onClick={() => setHighContrastMode(!highContrastMode)}
                      data-id="contrast-button"
                    >
                      {highContrastMode ? (
                        <Sun className="h-5 w-5" />
                      ) : (
                        <Moon className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{highContrastMode ? 'Désactiver' : 'Activer'} le mode haut contraste</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* Contrôle taille du texte */}
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
                        <ZoomOut className="h-4 w-4" />
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
                        <ZoomIn className="h-4 w-4" />
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
            className="text-center mb-10"
            data-id="main-title"
          >
            <h1 className="text-4xl font-bold mb-3">
              Bienvenue dans I AM CYBER
            </h1>
            <p className={`max-w-3xl mx-auto ${
              highContrastMode ? 'text-gray-300' : 'text-blue-200' 
            }`}>
              Trouvez votre parcours d'apprentissage personnalisé en cybersécurité
            </p>
          </motion.div>

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
                <BookOpen className="h-5 w-5 mr-2" />
                Par objectif d'apprentissage
              </TabsTrigger>
              <TabsTrigger 
                value="metiers" 
                className={`flex-1 flex items-center justify-center ${
                  highContrastMode ? 'data-[state=active]:bg-blue-900 text-white' : ''
                }`}
                data-id="careers-tab"
              >
                <Briefcase className="h-5 w-5 mr-2" />
                Par métier
              </TabsTrigger>
              <TabsTrigger 
                value="tous" 
                className={`flex-1 flex items-center justify-center ${
                  highContrastMode ? 'data-[state=active]:bg-blue-900 text-white' : ''
                }`}
                data-id="all-modules-tab"
              >
                <Settings className="h-5 w-5 mr-2" />
                Tous les modules
              </TabsTrigger>
            </TabsList>

            {/* Contenu des onglets */}
            <TabsContent value="objectifs" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {learningObjectives.map((objective) => (
                  <motion.div
                    key={objective.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`rounded-xl p-6 ${
                      highContrastMode 
                        ? 'bg-gray-800 border border-gray-700' 
                        : `bg-gradient-to-br ${objective.gradient}`
                    }`}
                    data-id={`objective-${objective.id}`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-full ${
                          highContrastMode ? 'bg-blue-900' : 'bg-white/10'
                        }`}>
                          {objective.icon}
                        </div>
                        <h2 className="text-xl font-bold text-white">
                          {objective.title}
                        </h2>
                      </div>
                      
                      <p className={`mb-4 ${
                        highContrastMode ? 'text-gray-300' : 'text-blue-100'
                      }`}>
                        {objective.description}
                      </p>
                      
                      <div className="mt-auto">
                        <h3 className="text-white font-medium mb-2">Modules recommandés:</h3>
                        <ul className="space-y-2">
                          {getModulesForObjective(objective.id).map(module => (
                            <li key={module.id}>
                              <Link 
                                href={module.destination}
                                className={`block p-2 rounded-lg ${
                                  highContrastMode 
                                    ? 'bg-gray-700 hover:bg-gray-600' 
                                    : 'bg-white/10 hover:bg-white/20'
                                } transition-colors`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{module.title}</span>
                                  <ArrowRight className="h-4 w-4" />
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
                  <h2 className="text-xl font-bold mb-4">Parcours métiers en cybersécurité</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {careerPaths.map(career => (
                      <Button
                        key={career.id}
                        variant={highContrastMode ? "outline" : "secondary"}
                        className={`h-auto py-3 justify-start ${
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
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-full ${
                            highContrastMode 
                              ? 'bg-gray-700' 
                              : 'bg-white/20'
                          }`}>
                            {career.icon}
                          </div>
                          <span className="text-sm font-medium">{career.title}</span>
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
                            <div>
                              <h2 className="text-2xl font-bold">{career.title}</h2>
                              <p className={highContrastMode ? 'text-gray-300' : 'text-blue-200'}>
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
                                        <div className="flex gap-2 items-center">
                                          <div className={`p-1.5 rounded-md ${
                                            highContrastMode ? 'bg-blue-900' : 'bg-white/10'
                                          }`}>
                                            {module.icon}
                                          </div>
                                          <CardTitle className="text-lg">
                                            {index + 1}. {module.title}
                                          </CardTitle>
                                        </div>
                                        {renderDifficultyBadge(module.difficulty)}
                                      </div>
                                    </CardHeader>
                                    <CardContent>
                                      <p className={highContrastMode ? 'text-gray-300' : 'text-blue-100'}>
                                        {module.description}
                                      </p>
                                    </CardContent>
                                    <CardFooter className="mt-auto pt-2">
                                      <Link href={module.destination} className="w-full">
                                        <Button 
                                          variant={highContrastMode ? "outline" : "secondary"} 
                                          className="w-full"
                                        >
                                          Accéder au module
                                          <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                      </Link>
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
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="text-sm py-1">Filtres actifs:</div>
                  {difficulty.map(level => (
                    <Badge 
                      key={level}
                      variant="outline"
                      className={`${
                        highContrastMode 
                          ? 'bg-blue-900 text-white' 
                          : 'bg-blue-100 text-blue-800'
                      } cursor-pointer`}
                      onClick={() => setDifficulty(difficulty.filter(d => d !== level))}
                    >
                      {level}
                      <button className="ml-1 text-xs">×</button>
                    </Badge>
                  ))}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-7"
                    onClick={() => setDifficulty([])}
                  >
                    Effacer tous les filtres
                  </Button>
                </div>
              )}

              {/* Sélection des filtres */}
              <div className={`mb-6 p-4 rounded-lg ${
                highContrastMode ? 'bg-gray-800 border border-gray-700' : 'bg-white/10'
              }`}>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      placeholder="Rechercher un module..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 ${
                        highContrastMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' 
                          : 'bg-white/10 border-white/20 text-white placeholder:text-gray-300'
                      }`}
                      data-id="search-input"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">Difficulté:</span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={difficulty.includes('débutant') ? 'default' : 'outline'}
                        className={`h-7 text-xs ${
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
                        className={`h-7 text-xs ${
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
                        className={`h-7 text-xs ${
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
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className={`p-1 ${activeView === 'grid' ? 'bg-blue-900/30' : ''}`}
                      onClick={() => setActiveView('grid')}
                      data-id="grid-view-button"
                    >
                      <LayoutGrid className="h-5 w-5" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className={`p-1 ${activeView === 'list' ? 'bg-blue-900/30' : ''}`}
                      onClick={() => setActiveView('list')}
                      data-id="list-view-button"
                    >
                      <List className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Liste des modules en grille ou liste */}
              {filteredModules.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg mb-2">Aucun module ne correspond à votre recherche</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setDifficulty([]);
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : activeView === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredModules.map(module => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card 
                        className={`h-full border ${
                          highContrastMode 
                            ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                            : 'bg-white/5 border-white/20 hover:bg-white/10'
                        } transition-colors`}
                        data-id={`module-card-${module.id}`}
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg ${
                                highContrastMode ? 'bg-blue-900' : 'bg-blue-900/40'
                              } mr-3`}>
                                {module.icon}
                              </div>
                              <div>
                                <CardTitle className="flex items-center">
                                  {module.title}
                                  {module.isNew && (
                                    <Badge variant="secondary" className="ml-2 bg-blue-600 text-white text-xs">
                                      Nouveau
                                    </Badge>
                                  )}
                                </CardTitle>
                                <CardDescription className={
                                  highContrastMode ? 'text-gray-400' : 'text-gray-300'
                                }>
                                  {module.duration}
                                </CardDescription>
                              </div>
                            </div>
                            {renderDifficultyBadge(module.difficulty)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className={highContrastMode ? 'text-gray-300' : 'text-blue-100'}>
                            {module.description}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-0">
                          {module.comingSoon ? (
                            <Button disabled variant="outline" className="w-full">
                              Bientôt disponible
                            </Button>
                          ) : (
                            <Link href={module.destination} className="w-full">
                              <Button 
                                className="w-full" 
                                variant={highContrastMode ? "outline" : "secondary"}
                              >
                                Accéder au module
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredModules.map(module => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div 
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          highContrastMode 
                            ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                            : 'bg-white/5 border-white/20 hover:bg-white/10'
                        } transition-colors`}
                        data-id={`module-list-${module.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            highContrastMode ? 'bg-blue-900' : 'bg-blue-900/40'
                          }`}>
                            {module.icon}
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-bold">{module.title}</h3>
                              {module.isNew && (
                                <Badge variant="secondary" className="ml-2 bg-blue-600 text-white text-xs">
                                  Nouveau
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center mt-1 gap-3">
                              <p className={`text-sm ${
                                highContrastMode ? 'text-gray-300' : 'text-blue-100'
                              }`}>
                                {module.description}
                              </p>
                              <div className="text-sm">{renderDifficultyBadge(module.difficulty)}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`text-sm ${highContrastMode ? 'text-gray-400' : 'text-gray-300'}`}>
                            {module.duration}
                          </span>
                          {module.comingSoon ? (
                            <Button disabled variant="outline" size="sm">
                              Bientôt disponible
                            </Button>
                          ) : (
                            <Link href={module.destination}>
                              <Button 
                                size="sm" 
                                variant={highContrastMode ? "outline" : "secondary"}
                              >
                                Accéder
                                <ArrowRight className="ml-1 h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </HomeLayout>
  );
}