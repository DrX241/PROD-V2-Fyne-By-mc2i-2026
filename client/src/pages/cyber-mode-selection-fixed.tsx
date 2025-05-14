import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { HelpCircle, Search, Circle } from 'lucide-react';
// Remplacer les icônes Lucide par des icônes modernes
import { IoHome, IoSearchOutline, IoBookOutline, IoDesktopOutline, IoTrophyOutline, IoConstructOutline } from 'react-icons/io5';
import { IoMdArrowForward } from 'react-icons/io';
import { BsShieldCheck, BsBarChartFill, BsEye, BsCpu, BsCodeSlash, BsCloud, BsPeopleFill, 
         BsBookmarkCheck, BsBriefcase, BsGearFill, BsChevronRight, BsFilterLeft, 
         BsLightningCharge, BsExclamationCircleFill, BsDatabaseCheck, BsPersonCheck } from 'react-icons/bs';
import { FiSun, FiMoon } from 'react-icons/fi';
import { AiOutlineZoomIn, AiOutlineZoomOut } from 'react-icons/ai';
import { RiLockFill, RiFilterLine } from 'react-icons/ri';
import { TbLayoutGrid, TbList, TbCheckbox } from 'react-icons/tb';
import { FaGraduationCap, FaRobot } from 'react-icons/fa';
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
  difficulty: 'débutant' | 'intermédiaire' | 'avancé' | 'tous niveaux';
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
  categories?: string[]; // Optionnel: Catégories pour l'objectif
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

  // État pour stocker les modules personnalisés
  const [customModules, setCustomModules] = useState<Module[]>([]);
  
  // Fonction pour charger les modules personnalisés
  useEffect(() => {
    const fetchCustomModules = async () => {
      try {
        const response = await fetch('/api/module-generator/modules');
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.modules)) {
            // Conversion des modules personnalisés au format Module[]
            const formattedModules = data.modules.map((customModule: any) => {
              // Utiliser le nom de l'icône pour créer le composant React
              let iconComponent;
              const iconName = customModule.moduleData?.icon || "BsBookmarkCheck";
              
              // Choix de l'icône en fonction du nom défini ou du domaine
              if (iconName === "BsShieldCheck" || customModule.domain?.toLowerCase().includes('cyber') || customModule.iamName?.toLowerCase().includes('cyber')) {
                iconComponent = <BsShieldCheck className="h-5 w-5 text-cyan-100" />;
              } else if (iconName === "BsDatabaseCheck" || customModule.domain?.toLowerCase().includes('data') || customModule.iamName?.toLowerCase().includes('data')) {
                iconComponent = <BsDatabaseCheck className="h-5 w-5 text-blue-100" />;
              } else if (iconName === "BsPersonCheck" || customModule.domain?.toLowerCase().includes('client') || customModule.iamName?.toLowerCase().includes('client')) {
                iconComponent = <BsPersonCheck className="h-5 w-5 text-green-100" />;
              } else if (iconName === "BsCodeSlash" || customModule.domain?.toLowerCase().includes('dev') || customModule.iamName?.toLowerCase().includes('dev')) {
                iconComponent = <BsCodeSlash className="h-5 w-5 text-yellow-100" />;
              } else {
                iconComponent = <BsBookmarkCheck className="h-5 w-5 text-purple-100" />;
              }
              
              return {
                id: `custom-${customModule.id}`,
                title: customModule.moduleData?.title || customModule.iamName || customModule.name,
                description: customModule.description,
                icon: iconComponent,
                destination: customModule.moduleData?.destination || `/playground/module/${customModule.id}`,
                difficulty: customModule.moduleData?.difficulty || 'intermédiaire',
                duration: customModule.moduleData?.duration || '20-30 min',
                isNew: customModule.moduleData?.isNew || true
              };
            });
            
            setCustomModules(formattedModules);
          }
        } else {
          console.error('Erreur lors du chargement des modules personnalisés:', await response.text());
        }
      } catch (error) {
        console.error('Exception lors du chargement des modules personnalisés:', error);
      }
    };
    
    fetchCustomModules();
  }, []);
  
  // Tous les modules disponibles (statiques + personnalisés)
  const allModules: Module[] = [
    {
      id: 'profil-pro',
      title: 'DANS LA PEAU DE TON MÉTIER',
      description: "Explorez votre métier avec l'IA : rôles, compétences, évolution et défis. Testez vos connaissances avec un quiz personnalisé.",
      icon: <BsBriefcase className="h-5 w-5" />,
      destination: 'cyber/profil-pro',
      difficulty: 'tous niveaux',
      duration: '20-30 min',
      isNew: true
    },
    {
      id: 'agent-ia',
      title: 'AGENT IA',
      description: "Discutez avec un expert en cybersécurité IA qui répond à toutes vos questions",
      icon: <BsShieldCheck className="h-5 w-5" />,
      destination: '/cyber/expert-learning',
      difficulty: 'débutant',
      duration: '15-30 min'
    },

    {
      id: 'entree',
      title: 'L\'ENTRÉE',
      description: "Module de formation au premier contact avec le client et simulations d'entretiens",
      icon: <BsPersonCheck className="h-5 w-5" />,
      destination: '/cyber/interview-preparation',
      difficulty: 'intermédiaire',
      duration: '20-40 min',
    },

    {
      id: 'cyber-pulse',
      title: 'CYBERPULSE',
      description: "Jouez avec un chatbot ludique et immersif qui génère des défis et des jeux en cybersécurité",
      icon: <BsLightningCharge className="h-5 w-5" />,
      destination: '/cyber/cyber-pulse',
      difficulty: 'débutant',
      duration: '10-20 min',
      isNew: true
    },

    {
      id: 'cyber-arcade',
      title: 'CYBERARCADE',
      description: "Apprenez les fondamentaux de la cybersécurité à travers des jeux interactifs",
      icon: <IoDesktopOutline className="h-5 w-5" />,
      destination: '/cyber/arcade',
      difficulty: 'débutant',
      duration: '10-20 min'
    },


    {
      id: 'plan-continuité',
      title: 'PLAN DE CONTINUITÉ D\'ACTIVITÉ',
      description: "Apprenez à concevoir, déployer et tester un Plan de Continuité d'Activité efficace pour garantir la résilience de votre organisation",
      icon: <BsShieldCheck className="h-5 w-5" />,
      destination: '/cyber/plan-continuite',
      difficulty: 'intermédiaire',
      duration: '30-45 min',
      isNew: true,
      comingSoon: true
    },
    {
      id: 'gestion-crise',
      title: 'GESTION DE CRISE',
      description: "Entraînez-vous à gérer des situations de crise cybersécurité en temps réel",
      icon: <BsExclamationCircleFill className="h-5 w-5" />,
      destination: '/cyber/crisis-management',
      difficulty: 'avancé',
      duration: '45-60 min',
      isNew: true,
      comingSoon: true
    },
    {
      id: 'mode-entretien',
      title: 'MODE ENTRETIEN',
      description: "Testez vos connaissances comme lors d'un entretien d'embauche en cybersécurité",
      icon: <IoTrophyOutline className="h-5 w-5" />,
      destination: '/cyber/interview-test',
      difficulty: 'avancé',
      duration: '45-60 min',
      isNew: true
    },
    {
      id: 'test-technique',
      title: 'TEST TECHNIQUE',
      description: "Évaluez vos compétences techniques sur des problèmes concrets de sécurité",
      icon: <BsCpu className="h-5 w-5" />,
      destination: '/cyber/test-technique',
      difficulty: 'avancé',
      duration: '60-90 min',
      isNew: true
    },
    {
      id: 'policy-converter',
      title: 'CONVERTISSEUR DE POLITIQUES',
      description: "Transformez des politiques techniques en versions accessibles pour différents publics",
      icon: <IoConstructOutline className="h-5 w-5" />,
      destination: '/cyber/tools/policy-converter',
      difficulty: 'intermédiaire',
      duration: '15-30 min'
    },
    {
      id: 'phishing-simulator',
      title: 'SIMULATEUR DE PHISHING',
      description: "Créez et analysez des simulations de phishing pour la sensibilisation",
      icon: <BsEye className="h-5 w-5" />,
      destination: '/cyber/tools/phishing-simulator',
      difficulty: 'intermédiaire',
      duration: '20-30 min',
      isNew: true
    },
    {
      id: 'assistant-cyber',
      title: 'CRÉER VOTRE ASSISTANT CYBER',
      description: "Configurez un assistant IA personnalisé pour répondre à vos besoins en cybersécurité",
      icon: <FaRobot className="h-5 w-5" />,
      destination: '/cyber/tools/assistant-cyber',
      difficulty: 'tous niveaux',
      duration: '15-20 min',
      isNew: true
    },
    {
      id: 'ascension-progression',
      title: 'CYBERASCENSION',
      description: "Suivez un parcours complet pour préparer des certifications professionnelles",
      icon: <BsBarChartFill className="h-5 w-5" />,
      destination: '/cyber/ascension',
      difficulty: 'avancé',
      duration: '10-15h',
      isNew: true
    },
    {
      id: 'centre-apprentissage',
      title: 'CYBER ACADÉMIE',
      description: "Centre d'apprentissage complet avec parcours thématiques, modules interactifs et suivi IA personnalisé",
      icon: <FaGraduationCap className="h-5 w-5" />,
      destination: '/cyber/learning-center',
      difficulty: 'tous niveaux',
      duration: 'adaptatif',
      isNew: true
    }
  ];

  // Objectifs d'apprentissage
  const learningObjectives: LearningObjective[] = [
    {
      id: 'se-former',
      title: 'SE FORMER',
      description: "Acquérir des connaissances théoriques et comprendre les concepts fondamentaux de la cybersécurité",
      icon: <IoBookOutline className="h-6 w-6 text-blue-100" />,
      modules: [
        'agent-ia',                // Assistant IA pour répondre aux questions
        'cyber-pulse',            // CyberPULSE - Générateur de jeux et scenarios
        'ascension-progression',   // Parcours structuré de formation
        'centre-apprentissage'     // Nouveau module centralisant les ressources de formation
      ],
      gradient: 'from-blue-700 to-blue-900',
      categories: [
        'Fondamentaux',
        'Sécurité technique',
        'Gouvernance',
        'Conformité'
      ]
    },
    {
      id: 'sentrainer',
      title: "S'ENTRAÎNER",
      description: "Mettre en pratique vos connaissances avec des exercices interactifs et des simulations",
      icon: <IoDesktopOutline className="h-6 w-6 text-indigo-100" />,
      modules: [
        'cyber-arcade',            // Jeux interactifs d'apprentissage
        'entree',                  // Check List Audition
        'gestion-crise',           // Gestion de crise en temps réel
        'plan-continuité'          // Plan de Continuité d'Activité
      ],
      gradient: 'from-indigo-700 to-indigo-900'
    },
    {
      id: 'sevaluer',
      title: "S'ÉVALUER",
      description: "Tester vos compétences dans des conditions réelles d'examen ou d'entretien",
      icon: <IoTrophyOutline className="h-6 w-6 text-purple-100" />,
      modules: [
        'profil-pro',              // Exploration et auto-évaluation des métiers avec IA
        'mode-entretien',          // Simulation d'entretien d'embauche
        'test-technique'           // Évaluation technique approfondie
      ],
      gradient: 'from-purple-700 to-purple-900'
    },
    {
      id: 'creer',
      title: "AUTOMATISER",
      description: "Utiliser des outils pour générer du contenu et automatiser des tâches de cybersécurité",
      icon: <IoConstructOutline className="h-6 w-6 text-teal-100" />,
      modules: [
        'policy-converter',        // Conversion de politiques pour différents publics
        'phishing-simulator',      // Création de simulations de phishing
        'assistant-cyber'          // Création d'assistants IA personnalisés
      ],
      gradient: 'from-teal-700 to-teal-900'
    }
  ];

  // Parcours métiers
  const careerPaths: CareerPath[] = [
    {
      id: 'grc',
      title: 'Gouvernance, Risque et Conformité',
      description: "Pour les métiers orientés pilotage et stratégie (RSSI, Consultant GRC, Auditeur SSI)",
      icon: <RiLockFill className="h-6 w-6 text-blue-100" />,
      skills: ['Gestion des risques', 'Conformité réglementaire', 'Politique de sécurité', 'Audit'],
      modules: ['agent-ia', 'policy-converter', 'ascension-progression'],
      gradient: 'from-blue-700 to-blue-900'
    },
    {
      id: 'secops',
      title: 'Sécurité Opérationnelle',
      description: "Pour les métiers techniques de surveillance et défense (Analyste SOC, Incident Responder)",
      icon: <BsShieldCheck className="h-6 w-6 text-red-100" />,
      skills: ['Détection d\'incidents', 'Analyse de logs', 'Gestion de crise', 'Forensique'],
      modules: ['mise-en-situation', 'test-technique', 'agent-ia', 'ascension-progression'],
      gradient: 'from-red-700 to-red-900'
    },
    {
      id: 'architecture',
      title: 'Architecture et Sécurisation',
      description: "Pour les concepteurs de systèmes sécurisés (Architecte sécurité, Ingénieur sécurité)",
      icon: <BsCpu className="h-6 w-6 text-teal-100" />,
      skills: ['Conception de systèmes', 'Infrastructure sécurisée', 'Authentification', 'Chiffrement'],
      modules: ['agent-ia', 'test-technique', 'ascension-progression'],
      gradient: 'from-teal-700 to-teal-900'
    },
    {
      id: 'pentest',
      title: 'Test d\'intrusion et Red Team',
      description: "Pour les métiers offensifs (Pentester, Red Team, Ethical Hacker)",
      icon: <BsLightningCharge className="h-6 w-6 text-purple-100" />,
      skills: ['Exploitation de vulnérabilités', 'Techniques d\'attaque', 'Social engineering', 'Post-exploitation'],
      modules: ['mise-en-situation', 'test-technique', 'phishing-simulator', 'ascension-progression'],
      gradient: 'from-purple-700 to-purple-900'
    },
    {
      id: 'devsecops',
      title: 'Sécurité des applications & DevSecOps',
      description: "Pour intégrer la sécurité dans le développement (DevSecOps, Security Champion)",
      icon: <BsCodeSlash className="h-6 w-6 text-yellow-100" />,
      skills: ['Analyse de code', 'Sécurité applicative', 'CI/CD sécurisé', 'Tests automatisés'],
      modules: ['agent-ia', 'test-technique', 'ascension-progression'],
      gradient: 'from-yellow-700 to-yellow-900'
    },
    {
      id: 'emerging',
      title: 'Cloud, OT, et IoT',
      description: "Pour les domaines techniques émergents (Cloud Security Engineer, OT Security)",
      icon: <BsCloud className="h-6 w-6 text-indigo-100" />,
      skills: ['Sécurité cloud', 'Systèmes industriels', 'Objets connectés', 'Sécurité du hardware'],
      modules: ['agent-ia', 'mise-en-situation', 'ascension-progression'],
      gradient: 'from-indigo-700 to-indigo-900'
    },
    {
      id: 'awareness',
      title: 'Sensibilisation et formation',
      description: "Pour l'acculturation et la formation (Responsable sensibilisation, Formateur)",
      icon: <BsPeopleFill className="h-6 w-6 text-green-100" />,
      skills: ['Conception de formations', 'Communication', 'Gamification', 'Mesure d\'efficacité'],
      modules: ['cyber-arcade', 'agent-ia', 'phishing-simulator', 'policy-converter'],
      gradient: 'from-green-700 to-green-900'
    },
    {
      id: 'research',
      title: 'R&D et veille',
      description: "Pour l'innovation et le suivi de la menace (Chercheur, Veilleur en cybersécurité)",
      icon: <BsBookmarkCheck className="h-6 w-6 text-amber-100" />,
      skills: ['Recherche avancée', 'Threat intelligence', 'Analyse de malware', 'Reverse engineering'],
      modules: ['agent-ia', 'test-technique', 'ascension-progression'],
      gradient: 'from-amber-700 to-amber-900'
    }
  ];

  // Filtrer les modules par recherche
  // Combiner les modules standard et personnalisés
  const combinedModules = [...allModules, ...customModules];
  
  // Filtrer les modules selon les critères
  const filteredModules = combinedModules.filter(module => {
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
    <HomeLayout gradientBg={true}>
      <div id="cyber-mode-selection" className={`min-h-screen pb-20 w-full ${
        highContrastMode ? 'bg-black text-white' : 'bg-gradient-to-b from-blue-950 to-black text-white'
      }`} style={{ fontSize: `${textSize}rem` }}>
        {/* Navigation et contrôles */}
        <div className="px-4 md:px-8 py-8 relative w-full">
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
              <PageTitle title="Cyber Académie" />
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
              Centre de Formation Cybersécurité - I AM CYBER
            </h1>
            <p className={`max-w-3xl mx-auto text-xl ${
              highContrastMode ? 'text-gray-300' : 'text-blue-200' 
            }`}>
              Trouvez votre parcours d'apprentissage personnalisé en cybersécurité
            </p>
          </motion.div>

          {/* Onglets principaux - TabsList masqué et remplacé par une marge minimale */}
          <Tabs defaultValue="objectifs" className="w-full" data-id="main-tabs">
            {/* TabsList masqué mais gardé dans le DOM pour maintenir la fonctionnalité */}
            <TabsList className="hidden">
              <TabsTrigger value="objectifs" data-id="objectives-tab">Par objectif</TabsTrigger>
              <TabsTrigger value="metiers" data-id="careers-tab">Par métier</TabsTrigger>
              <TabsTrigger value="tous" data-id="all-modules-tab">Tous les modules</TabsTrigger>
            </TabsList>
            
            {/* Espace réduit pour remonter les cartes */}
            <div className="mb-2"></div>

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
            </TabsContent>

            <TabsContent value="metiers" className="mt-0">
              <div className="flex flex-col gap-6">
                {/* Bannière d'information sur la refonte */}
                <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${
                  highContrastMode ? 'bg-blue-900/30 text-white' : 'bg-blue-600/20 text-blue-100'
                }`}>
                  <div className="flex items-start">
                    <div className="mr-3 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Refonte des parcours métiers en cours</h3>
                      <p className="text-sm opacity-90">
                        Nous sommes en train de restructurer cette section pour offrir des parcours d'apprentissage plus complets et personnalisés par métier. La version améliorée sera bientôt disponible avec de nouveaux contenus et fonctionnalités.
                      </p>
                    </div>
                  </div>
                </div>
                
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
                                      <Link href={module.destination} className="w-full">
                                        <Button 
                                          variant={highContrastMode ? "outline" : "secondary"} 
                                          className="w-full"
                                        >
                                          Accéder au module
                                          <IoMdArrowForward className="ml-2 h-4 w-4" />
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
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className={`p-2 rounded-lg ${activeView === 'grid' ? 'bg-blue-900/50 shadow-md' : ''}`}
                      onClick={() => setActiveView('grid')}
                      data-id="grid-view-button"
                    >
                      <TbLayoutGrid className="h-6 w-6" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className={`p-2 rounded-lg ${activeView === 'list' ? 'bg-blue-900/50 shadow-md' : ''}`}
                      onClick={() => setActiveView('list')}
                      data-id="list-view-button"
                    >
                      <TbList className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Liste des modules en grille ou liste */}
              {filteredModules.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-xl mb-4">Aucun module ne correspond à votre recherche</p>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="px-6"
                    onClick={() => {
                      setSearchTerm('');
                      setDifficulty([]);
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : activeView === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredModules.map(module => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card 
                        className={`h-full border shadow-lg ${
                          highContrastMode 
                            ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                            : 'bg-white/5 border-white/20 hover:bg-white/10'
                        } transition-colors`}
                        data-id={`module-card-${module.id}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start">
                              <div className={`p-3 rounded-lg shrink-0 mt-0.5 ${
                                highContrastMode ? 'bg-blue-900' : 'bg-blue-900/40'
                              } mr-4`}>
                                {module.icon}
                              </div>
                              <div>
                                <CardTitle className="text-xl flex flex-wrap items-center gap-2">
                                  <span className="line-clamp-2 text-left">{module.title}</span>
                                  {module.isNew && (
                                    <Badge variant="secondary" className="bg-blue-600 text-white text-xs px-2 py-1">
                                      Nouveau
                                    </Badge>
                                  )}
                                </CardTitle>
                                <CardDescription className={`text-sm mt-1.5 ${
                                  highContrastMode ? 'text-gray-400' : 'text-gray-300'
                                }`}>
                                  {module.duration}
                                </CardDescription>
                              </div>
                            </div>
                            {renderDifficultyBadge(module.difficulty)}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-2 pb-6">
                          <p className={`${highContrastMode ? 'text-gray-300' : 'text-blue-100'} line-clamp-3 text-base`}>
                            {module.description}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-2 pb-4">
                          {module.comingSoon ? (
                            <Button disabled variant="outline" className="w-full h-11 text-base">
                              Bientôt disponible
                            </Button>
                          ) : (
                            <Link href={module.destination} className="w-full">
                              <Button 
                                className="w-full h-11 text-base shadow-md" 
                                variant={highContrastMode ? "outline" : "secondary"}
                              >
                                Accéder au module
                                <IoMdArrowForward className="ml-3 h-5 w-5" />
                              </Button>
                            </Link>
                          )}
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredModules.map(module => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div 
                        className={`flex items-center justify-between p-5 border rounded-xl shadow-md ${
                          highContrastMode 
                            ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                            : 'bg-white/5 border-white/20 hover:bg-white/10'
                        } transition-colors`}
                        data-id={`module-list-${module.id}`}
                      >
                        <div className="flex items-start gap-5">
                          <div className={`p-3 rounded-lg shrink-0 mt-0.5 ${
                            highContrastMode ? 'bg-blue-900' : 'bg-blue-900/40'
                          }`}>
                            {module.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-bold text-left line-clamp-1">{module.title}</h3>
                              {module.isNew && (
                                <Badge variant="secondary" className="bg-blue-600 text-white text-xs px-2 py-0.5">
                                  Nouveau
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap mt-2 gap-4">
                              <p className={`text-base line-clamp-1 max-w-[500px] ${
                                highContrastMode ? 'text-gray-300' : 'text-blue-100'
                              }`}>
                                {module.description}
                              </p>
                              <div className="text-sm shrink-0">{renderDifficultyBadge(module.difficulty)}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className={`text-sm font-medium ${highContrastMode ? 'text-gray-400' : 'text-gray-300'}`}>
                            {module.duration}
                          </span>
                          {module.comingSoon ? (
                            <Button disabled variant="outline" size="lg" className="px-5 h-10">
                              Bientôt disponible
                            </Button>
                          ) : (
                            <Link href={module.destination}>
                              <Button 
                                size="lg"
                                className="px-5 h-10 shadow-md"
                                variant={highContrastMode ? "outline" : "secondary"}
                              >
                                Accéder
                                <IoMdArrowForward className="ml-2 h-5 w-5" />
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