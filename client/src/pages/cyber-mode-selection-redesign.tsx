import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
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
  const [, setLocation] = useLocation();
  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [difficulty, setDifficulty] = useState<string[]>([]);
  const [selectedCareerPath, setSelectedCareerPath] = useState<string | null>(null);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [textSize, setTextSize] = useState(1); // 1 = normal, >1 = larger, <1 = smaller
  
  // Tutorial integration
  const { showTutorial, startTutorial, setCurrentTour, tutorialSeen } = useTutorial();

  // Démarrage du didacticiel lors de la première visite
  useEffect(() => {
    if (!tutorialSeen['cyber-mode-selection-redesign']) {
      setCurrentTour('cyber-mode-selection-redesign');
      const timer = setTimeout(() => {
        startTutorial();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tutorialSeen, setCurrentTour, startTutorial]);

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

  // Rendu du badge de difficulté
  const renderDifficultyBadge = (difficulty: string) => {
    let colorClass = '';
    switch(difficulty) {
      case 'débutant':
        colorClass = 'bg-green-100 text-green-800 border-green-200';
        break;
      case 'intermédiaire':
        colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        break;
      case 'avancé':
        colorClass = 'bg-red-100 text-red-800 border-red-200';
        break;
    }
    
    if (highContrastMode) {
      switch(difficulty) {
        case 'débutant':
          colorClass = 'bg-green-900 text-white border-green-700';
          break;
        case 'intermédiaire':
          colorClass = 'bg-yellow-900 text-white border-yellow-700';
          break;
        case 'avancé':
          colorClass = 'bg-red-900 text-white border-red-700';
          break;
      }
    }
    
    return (
      <Badge variant="outline" className={colorClass + " text-xs capitalize font-medium"}>
        {difficulty}
      </Badge>
    );
  };

  // Rendu d'une carte de module
  const renderModuleCard = (module: Module) => {
    const textSizeClass = textSize > 1 
      ? 'text-lg' 
      : textSize < 1 
        ? 'text-xs' 
        : 'text-base';
        
    return (
      <Card 
        key={module.id}
        className={`h-full transition-all ${
          highContrastMode ? 'bg-gray-900 border-gray-600 text-white' : 'bg-white'
        }`}
        data-id={`module-${module.id}`}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className={`p-2 rounded-md ${
              highContrastMode 
                ? 'bg-blue-900 text-white' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {module.icon}
            </div>
            <div className="flex gap-1 flex-wrap">
              {renderDifficultyBadge(module.difficulty)}
              {module.isNew && (
                <Badge variant="secondary" className={`${
                  highContrastMode ? 'bg-purple-900 text-white' : 'bg-purple-100 text-purple-800'
                }`}>
                  Nouveau
                </Badge>
              )}
            </div>
          </div>
          <CardTitle className={`mt-2 ${textSizeClass}`}>{module.title}</CardTitle>
          <CardDescription className={`${textSizeClass} ${
            highContrastMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {module.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className={`text-sm ${
            highContrastMode ? 'text-gray-300' : 'text-gray-500'
          }`}>
            Durée estimée: {module.duration}
          </p>
        </CardContent>
        <CardFooter>
          <Link 
            href={module.comingSoon ? '#' : module.destination} 
            onClick={(e) => module.comingSoon && e.preventDefault()}
            className="w-full"
          >
            <Button 
              variant={highContrastMode ? "outline" : "default"} 
              className={`w-full ${
                highContrastMode 
                  ? 'border-blue-500 text-white hover:bg-blue-900' 
                  : ''
              }`}
              disabled={module.comingSoon}
            >
              {module.comingSoon ? 'Bientôt disponible' : 'Accéder'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  };

  // Fonction de rendu principal
  return (
    <HomeLayout>
      <PageTitle title="I AM CYBER - Nouvelle interface" />
      <div className={`min-h-[calc(100vh-64px)] relative overflow-hidden ${
        highContrastMode 
          ? 'bg-gray-900 text-white' 
          : 'bg-gradient-to-b from-gray-800 via-gray-900 to-blue-900 text-white'
      }`}>
        {/* Navigation et contrôles */}
        <div className="relative z-20 w-full p-4 flex flex-wrap justify-between items-center gap-2 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className={`${
                highContrastMode 
                  ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
              onClick={() => setLocation('/#modules')}
            >
              <Home className="h-4 w-4 mr-2" />
              Accueil
            </Button>
            <Button 
              variant="outline" 
              className={`${
                highContrastMode 
                  ? 'bg-blue-900 border-blue-700 text-white hover:bg-blue-800' 
                  : 'bg-blue-600/80 border-blue-400 text-white hover:bg-blue-500'
              }`}
              onClick={() => {
                setCurrentTour('cyber-mode-selection-redesign');
                startTutorial();
              }}
              data-id="guide-button"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Guide
            </Button>
          </div>

          {/* Barre de recherche */}
          <div className="flex-grow max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher un module..."
                className={`pl-8 ${
                  highContrastMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400' 
                    : 'bg-white/10 border-white/20 text-white placeholder:text-white/60'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-id="search-input"
              />
            </div>
          </div>

          {/* Contrôles d'accessibilité */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className={`${
                      highContrastMode 
                        ? 'bg-gray-800 border-gray-600 text-white' 
                        : 'bg-white/10 border-white/20 text-white'
                    }`}
                    onClick={() => setHighContrastMode(!highContrastMode)}
                    data-id="contrast-toggle"
                  >
                    {highContrastMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{highContrastMode ? 'Désactiver' : 'Activer'} le mode contraste élevé</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline"
                    size="icon"
                    className={`${
                      highContrastMode 
                        ? 'bg-gray-800 border-gray-600 text-white' 
                        : 'bg-white/10 border-white/20 text-white'
                    }`}
                    onClick={() => setTextSize(Math.min(textSize + 0.1, 1.3))}
                    data-id="text-increase"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Augmenter la taille du texte</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline"
                    size="icon"
                    className={`${
                      highContrastMode 
                        ? 'bg-gray-800 border-gray-600 text-white' 
                        : 'bg-white/10 border-white/20 text-white'
                    }`}
                    onClick={() => setTextSize(Math.max(textSize - 0.1, 0.8))}
                    data-id="text-decrease"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Diminuer la taille du texte</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline"
                    size="icon"
                    className={`${
                      highContrastMode 
                        ? 'bg-gray-800 border-gray-600 text-white' 
                        : 'bg-white/10 border-white/20 text-white'
                    }`}
                    onClick={() => setDifficulty(difficulty.length ? [] : ['débutant', 'intermédiaire', 'avancé'])}
                    data-id="filter-button"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filtrer par niveau de difficulté</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* En-tête */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-6 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 ${
              textSize > 1 ? 'text-5xl' : textSize < 1 ? 'text-3xl' : 'text-4xl'
            }`}>
              I AM CYBER
            </h1>
            <p className={`sm:text-xl max-w-3xl mx-auto ${
              highContrastMode ? 'text-gray-200' : 'text-blue-200'
            } ${
              textSize > 1 ? 'text-xl' : textSize < 1 ? 'text-sm' : 'text-base'
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
                <h2 className="text-lg font-semibold mb-3">Filtrer par niveau</h2>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={difficulty.includes('débutant') ? "default" : "outline"}
                    className={`cursor-pointer ${
                      difficulty.includes('débutant')
                        ? highContrastMode 
                          ? 'bg-green-900 hover:bg-green-800' 
                          : 'bg-green-500 hover:bg-green-600'
                        : highContrastMode 
                          ? 'border-green-700 text-white hover:bg-green-900' 
                          : 'border-green-500 text-green-500 hover:bg-green-100'
                    }`}
                    onClick={() => {
                      if (difficulty.includes('débutant')) {
                        setDifficulty(difficulty.filter(d => d !== 'débutant'));
                      } else {
                        setDifficulty([...difficulty, 'débutant']);
                      }
                    }}
                  >
                    Débutant
                  </Badge>
                  <Badge 
                    variant={difficulty.includes('intermédiaire') ? "default" : "outline"}
                    className={`cursor-pointer ${
                      difficulty.includes('intermédiaire')
                        ? highContrastMode 
                          ? 'bg-yellow-900 hover:bg-yellow-800' 
                          : 'bg-yellow-500 hover:bg-yellow-600'
                        : highContrastMode 
                          ? 'border-yellow-700 text-white hover:bg-yellow-900' 
                          : 'border-yellow-500 text-yellow-500 hover:bg-yellow-100'
                    }`}
                    onClick={() => {
                      if (difficulty.includes('intermédiaire')) {
                        setDifficulty(difficulty.filter(d => d !== 'intermédiaire'));
                      } else {
                        setDifficulty([...difficulty, 'intermédiaire']);
                      }
                    }}
                  >
                    Intermédiaire
                  </Badge>
                  <Badge 
                    variant={difficulty.includes('avancé') ? "default" : "outline"}
                    className={`cursor-pointer ${
                      difficulty.includes('avancé')
                        ? highContrastMode 
                          ? 'bg-red-900 hover:bg-red-800' 
                          : 'bg-red-500 hover:bg-red-600'
                        : highContrastMode 
                          ? 'border-red-700 text-white hover:bg-red-900' 
                          : 'border-red-500 text-red-500 hover:bg-red-100'
                    }`}
                    onClick={() => {
                      if (difficulty.includes('avancé')) {
                        setDifficulty(difficulty.filter(d => d !== 'avancé'));
                      } else {
                        setDifficulty([...difficulty, 'avancé']);
                      }
                    }}
                  >
                    Avancé
                  </Badge>
                </div>
              </div>
              
              {/* Liste de tous les modules */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModules.length > 0 ? (
                  filteredModules.map(module => renderModuleCard(module))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="mx-auto w-16 h-16 rounded-full bg-blue-900/50 flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-blue-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Aucun module ne correspond à votre recherche</h3>
                    <p className={highContrastMode ? 'text-gray-300' : 'text-blue-200'}>
                      Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm('');
                        setDifficulty([]);
                      }}
                    >
                      Réinitialiser les filtres
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </HomeLayout>
  );
}