import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  BookOpen,
  Cpu,
  GraduationCap,
  Clock,
  Users,
  FileText,
  Search,
  Folder,
  BarChart3,
  Calendar,
  Bot,
  BrainCircuit,
  Layers,
  Sparkles,
  ClipboardList,
  LineChart,
  Presentation,
  FileCheck,
  Target,
  PenTool,
  ScrollText,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';
import { useTutorial } from '@/contexts/TutorialContext';
import PageTitle from '@/components/utils/PageTitle';
import HomeLayout from '@/components/layout/HomeLayout';

// Types pour l'organisation du contenu
interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
  level: 'débutant' | 'intermédiaire' | 'avancé' | 'tous niveaux';
  category: string;
  tags: string[];
  progress?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  comingSoon?: boolean;
  destination?: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  modules: string[];
  duration: string;
  level: 'débutant' | 'intermédiaire' | 'avancé' | 'tous niveaux';
  category: 'méthodologie' | 'technique' | 'soft skills' | 'mixte';
  objectives: string[];
  tags: string[];
  progress?: number;
  certification?: string;
  isNew?: boolean;
  gradient: string;
}

interface ResourceCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  modules: Module[];
  gradient: string;
}

export default function AmoaLearningCenter() {
  // États
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [activeTab, setActiveTab] = useState('modules');
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  
  const { toast } = useToast();
  const { setCurrentTour, startTutorial } = useTutorial();

  // Modules disponibles dans AMOA Académie
  const allModules: Module[] = [
    {
      id: 'intro-amoa',
      title: 'Introduction à l\'AMOA',
      description: 'Découvrez les fondamentaux du métier d\'assistant à maîtrise d\'ouvrage et son rôle essentiel dans les projets.',
      icon: <BookOpen className="h-5 w-5 text-violet-400" />,
      duration: '15 min',
      level: 'débutant',
      category: 'fondamentaux',
      tags: ['AMOA', 'Bases', 'Méthodologie'],
      progress: 0,
      isNew: true,
      destination: '/amoa/learning-center/modules/intro-amoa'
    },
    {
      id: 'methodologie-projet',
      title: 'Méthodologies de Projet',
      description: 'Maîtrisez les méthodologies agiles et traditionnelles pour piloter efficacement vos projets AMOA.',
      icon: <Layers className="h-5 w-5 text-violet-400" />,
      duration: '20 min',
      level: 'intermédiaire',
      category: 'méthodologie',
      tags: ['Agile', 'Waterfall', 'Méthodologie'],
      progress: 0,
      isNew: true,
      destination: '/amoa/learning-center/modules/methodologie-projet'
    },
    {
      id: 'analyse-besoins',
      title: 'Recueil et Analyse des Besoins',
      description: 'Techniques efficaces pour collecter, analyser et formaliser les besoins utilisateurs.',
      icon: <ClipboardList className="h-5 w-5 text-violet-400" />,
      duration: '25 min',
      level: 'intermédiaire',
      category: 'méthodologie',
      tags: ['Besoins', 'User Stories', 'Spécifications'],
      progress: 0,
      isNew: true,
      destination: '/amoa/learning-center/modules/analyse-besoins'
    },
    {
      id: 'conduite-reunion',
      title: 'Animation de Réunion et Ateliers',
      description: 'Techniques d\'animation pour des réunions et ateliers productifs avec les parties prenantes.',
      icon: <Users className="h-5 w-5 text-violet-400" />,
      duration: '15 min',
      level: 'intermédiaire',
      category: 'soft skills',
      tags: ['Communication', 'Animation', 'Atelier'],
      progress: 0,
      isNew: true,
      destination: '/amoa/learning-center/modules/conduite-reunion'
    },
    {
      id: 'gestion-relation-client',
      title: 'Gestion de la Relation Client',
      description: 'Développez une relation client de confiance et gérez efficacement les attentes.',
      icon: <Target className="h-5 w-5 text-violet-400" />,
      duration: '20 min',
      level: 'intermédiaire',
      category: 'soft skills',
      tags: ['Client', 'Communication', 'Gestion d\'attentes'],
      progress: 0,
      isNew: true,
      destination: '/amoa/learning-center/modules/relation-client'
    },
    {
      id: 'redaction-cahier-charges',
      title: 'Rédaction de Cahier des Charges',
      description: 'Structurez et rédigez des cahiers des charges clairs, complets et exploitables.',
      icon: <FileCheck className="h-5 w-5 text-violet-400" />,
      duration: '25 min',
      level: 'intermédiaire',
      category: 'technique',
      tags: ['Documentation', 'Spécifications', 'Cahier des charges'],
      progress: 0,
      isNew: true,
      destination: '/amoa/learning-center/modules/cahier-charges'
    },
    {
      id: 'pilotage-projet',
      title: 'Pilotage et Suivi de Projet',
      description: 'Outils et méthodes pour suivre l\'avancement, gérer les risques et communiquer efficacement.',
      icon: <LineChart className="h-5 w-5 text-violet-400" />,
      duration: '30 min',
      level: 'avancé',
      category: 'méthodologie',
      tags: ['Pilotage', 'Reporting', 'Gestion des risques'],
      progress: 0,
      isNew: true,
      destination: '/amoa/learning-center/modules/pilotage-projet'
    },
    {
      id: 'recette-fonctionnelle',
      title: 'Stratégie de Recette Fonctionnelle',
      description: 'Élaborez une stratégie de test efficace et réalisez des recettes fonctionnelles de qualité.',
      icon: <FileCheck className="h-5 w-5 text-violet-400" />,
      duration: '25 min',
      level: 'avancé',
      category: 'technique',
      tags: ['Recette', 'Test', 'Qualité'],
      progress: 0,
      isNew: true,
      destination: '/amoa/learning-center/modules/recette-fonctionnelle'
    },
    {
      id: 'conduite-changement',
      title: 'Conduite du Changement',
      description: 'Accompagnez efficacement la transformation organisationnelle lors de la mise en place de nouveaux systèmes.',
      icon: <Settings className="h-5 w-5 text-violet-400" />,
      duration: '20 min',
      level: 'avancé',
      category: 'soft skills',
      tags: ['Change Management', 'Formation', 'Adoption'],
      progress: 0,
      isNew: true,
      destination: '/amoa/learning-center/modules/conduite-changement'
    }
  ];

  // Parcours d'apprentissage rapide pour AMOA
  const learningPaths: LearningPath[] = [
    {
      id: 'parcours-rapide',
      title: 'Parcours Rapide AMOA',
      description: 'Maîtrisez les compétences essentielles de l\'AMOA en 5 modules concis et pratiques.',
      icon: <GraduationCap className="h-6 w-6 text-violet-100" />,
      modules: ['intro-amoa', 'analyse-besoins', 'redaction-cahier-charges', 'pilotage-projet', 'recette-fonctionnelle'],
      duration: '2 heures',
      level: 'tous niveaux',
      category: 'mixte',
      objectives: [
        'Comprendre le rôle et les responsabilités de l\'AMOA',
        'Maîtriser les techniques de recueil des besoins',
        'Savoir rédiger un cahier des charges efficace',
        'Apprendre à piloter un projet et gérer les risques',
        'Concevoir une stratégie de recette fonctionnelle adaptée'
      ],
      tags: ['Fondamentaux', 'AMOA', 'Projet', 'Méthodologie'],
      progress: 0,
      isNew: true,
      gradient: 'from-violet-700 to-indigo-900'
    }
  ];

  // Catégories de ressources
  const resourceCategories: ResourceCategory[] = [
    {
      id: 'methodologie',
      title: 'Méthodologie & Gestion de Projet',
      description: 'Méthodes et outils pour structurer et piloter vos projets AMOA.',
      icon: <Presentation className="h-6 w-6 text-violet-100" />,
      modules: allModules.filter(m => m.category === 'méthodologie'),
      gradient: 'from-violet-700 to-indigo-900'
    },
    {
      id: 'technique',
      title: 'Compétences Techniques',
      description: 'Maîtrisez les aspects techniques du métier d\'AMOA.',
      icon: <Cpu className="h-6 w-6 text-indigo-100" />,
      modules: allModules.filter(m => m.category === 'technique'),
      gradient: 'from-indigo-700 to-blue-900'
    },
    {
      id: 'soft-skills',
      title: 'Soft Skills & Communication',
      description: 'Développez vos compétences relationnelles et de communication.',
      icon: <Users className="h-6 w-6 text-blue-100" />,
      modules: allModules.filter(m => m.category === 'soft skills'),
      gradient: 'from-blue-700 to-indigo-900'
    },
    {
      id: 'fondamentaux',
      title: 'Fondamentaux AMOA',
      description: 'Les bases essentielles pour comprendre le métier d\'AMOA.',
      icon: <BookOpen className="h-6 w-6 text-purple-100" />,
      modules: allModules.filter(m => m.category === 'fondamentaux'),
      gradient: 'from-purple-700 to-violet-900'
    }
  ];

  // Animation des cartes
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5
      }
    })
  };

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-b from-violet-950 to-slate-950 text-white pb-20">
        {/* En-tête */}
        <div className="p-6 container mx-auto">
          <div className="flex items-center mb-2">
            <Link href="/amoa">
              <Button variant="ghost" className="text-white mr-4">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Retour
              </Button>
            </Link>
            <PageTitle title="AMOA ACADÉMIE" />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">AMOA Académie</h1>
              <p className="text-violet-200 mt-1">Centre de formation en assistance à maîtrise d'ouvrage</p>
            </div>
            
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button 
                variant="outline" 
                size="sm"
                className="border-violet-500 text-violet-200 hover:bg-violet-800/30"
                onClick={() => {
                  setCurrentTour('amoa-academie');
                  startTutorial();
                }}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Visite guidée
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="border-violet-500 text-violet-200 hover:bg-violet-800/30"
                onClick={() => setAiPanelOpen(!aiPanelOpen)}
              >
                <BrainCircuit className="mr-2 h-4 w-4" />
                Assistant IA
              </Button>
            </div>
          </div>
          
          {/* Assistant IA - Panel */}
          {aiPanelOpen && (
            <div className="mb-6 p-4 bg-violet-900/20 rounded-lg border border-violet-700">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <BrainCircuit className="mr-2 h-5 w-5 text-violet-400" />
                Assistant IA AMOA
              </h3>
              <p className="text-sm text-violet-200 mb-3">
                Posez une question sur l'AMOA ou demandez des ressources personnalisées selon vos besoins.
              </p>
              <div className="flex gap-2">
                <Input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ex: Comment rédiger un bon cahier des charges ?"
                  className="bg-violet-900/20 border-violet-700 text-white placeholder:text-violet-400"
                />
                <Button 
                  onClick={() => {
                    if (!aiPrompt.trim()) {
                      toast({
                        title: "Prompt vide",
                        description: "Veuillez entrer une question ou une demande.",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    setIsGenerating(true);
                    
                    // Simulation d'appel API (à remplacer par un vrai appel API)
                    setTimeout(() => {
                      setIsGenerating(false);
                      toast({
                        title: "Fonctionnalité en cours de développement",
                        description: "Cette fonctionnalité sera disponible prochainement.",
                        variant: "default"
                      });
                    }, 1500);
                  }}
                  disabled={isGenerating}
                  className="bg-violet-700 hover:bg-violet-600"
                >
                  {isGenerating ? "Génération..." : "Générer"}
                </Button>
              </div>
            </div>
          )}
          
          {/* Barre de recherche et filtres */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-violet-400" />
              <Input
                type="text"
                placeholder="Rechercher un module ou un sujet..."
                className="pl-10 bg-violet-900/20 border-violet-700 text-white placeholder:text-violet-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-[140px] bg-violet-900/20 border-violet-700 text-white">
                  <SelectValue placeholder="Niveau" />
                </SelectTrigger>
                <SelectContent className="bg-violet-950 border-violet-700 text-white">
                  <SelectItem value="">Tous les niveaux</SelectItem>
                  <SelectItem value="débutant">Débutant</SelectItem>
                  <SelectItem value="intermédiaire">Intermédiaire</SelectItem>
                  <SelectItem value="avancé">Avancé</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] bg-violet-900/20 border-violet-700 text-white">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent className="bg-violet-950 border-violet-700 text-white">
                  <SelectItem value="">Toutes catégories</SelectItem>
                  <SelectItem value="méthodologie">Méthodologie</SelectItem>
                  <SelectItem value="technique">Technique</SelectItem>
                  <SelectItem value="soft skills">Soft Skills</SelectItem>
                  <SelectItem value="fondamentaux">Fondamentaux</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                <SelectTrigger className="w-[140px] bg-violet-900/20 border-violet-700 text-white">
                  <SelectValue placeholder="Durée" />
                </SelectTrigger>
                <SelectContent className="bg-violet-950 border-violet-700 text-white">
                  <SelectItem value="">Toutes durées</SelectItem>
                  <SelectItem value="court">Court (moins de 20 min)</SelectItem>
                  <SelectItem value="moyen">Moyen (20-30 min)</SelectItem>
                  <SelectItem value="long">Long (plus de 30 min)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Navigation par onglets */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-violet-900/20 border border-violet-800 p-1">
              <TabsTrigger 
                value="modules" 
                className="data-[state=active]:bg-violet-700 data-[state=active]:text-white text-violet-300"
              >
                <Folder className="h-4 w-4 mr-2" /> 
                Modules
              </TabsTrigger>
              <TabsTrigger 
                value="parcours" 
                className="data-[state=active]:bg-violet-700 data-[state=active]:text-white text-violet-300"
              >
                <GraduationCap className="h-4 w-4 mr-2" /> 
                Parcours
              </TabsTrigger>
              <TabsTrigger 
                value="categories" 
                className="data-[state=active]:bg-violet-700 data-[state=active]:text-white text-violet-300"
              >
                <Layers className="h-4 w-4 mr-2" /> 
                Catégories
              </TabsTrigger>
            </TabsList>
            
            {/* Contenu de l'onglet Modules */}
            <TabsContent value="modules" className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">Modules d'apprentissage AMOA</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allModules.map((module, i) => (
                  <motion.div
                    key={module.id}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Card className="bg-gradient-to-br from-violet-900/50 to-slate-900 border-violet-700 overflow-hidden h-full flex flex-col">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="p-2 rounded-md bg-violet-800/50">
                            {module.icon}
                          </div>
                          <div className="flex gap-1">
                            {module.isNew && (
                              <Badge className="bg-violet-600 hover:bg-violet-700">Nouveau</Badge>
                            )}
                            <Badge variant="outline" className="border-violet-700 text-violet-300">
                              {module.level}
                            </Badge>
                          </div>
                        </div>
                        <CardTitle className="mt-3 text-lg">{module.title}</CardTitle>
                        <CardDescription className="text-violet-200">{module.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2 flex-grow">
                        <div className="flex flex-wrap gap-1 mb-3">
                          {module.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="bg-violet-900/50 text-violet-300 hover:bg-violet-800">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center text-sm text-violet-300 gap-4">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {module.duration}
                          </div>
                          {module.progress !== undefined && module.progress > 0 && (
                            <div className="flex items-center flex-grow">
                              <Progress value={module.progress} className="h-2 bg-violet-900/30" />
                              <span className="ml-2">{module.progress}%</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full bg-violet-700 hover:bg-violet-600"
                          onClick={() => {
                            if (module.comingSoon) {
                              toast({
                                title: "Module à venir",
                                description: "Ce module sera disponible prochainement.",
                                variant: "default"
                              });
                              return;
                            }
                            
                            window.location.href = module.destination || '#';
                          }}
                        >
                          {module.comingSoon ? "Bientôt disponible" : "Commencer"}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            
            {/* Contenu de l'onglet Parcours */}
            <TabsContent value="parcours" className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">Parcours d'apprentissage structurés</h2>
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {learningPaths.map((path, i) => (
                  <motion.div
                    key={path.id}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Card className={`bg-gradient-to-br ${path.gradient} border-violet-700 overflow-hidden`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="p-3 rounded-md bg-violet-800/50">
                            {path.icon}
                          </div>
                          <div className="flex gap-1">
                            {path.isNew && (
                              <Badge className="bg-violet-600 hover:bg-violet-700">Nouveau</Badge>
                            )}
                            <Badge variant="outline" className="border-violet-100/20 text-violet-100">
                              {path.level}
                            </Badge>
                          </div>
                        </div>
                        <CardTitle className="mt-3 text-xl">{path.title}</CardTitle>
                        <CardDescription className="text-violet-100">{path.description}</CardDescription>
                        
                        <div className="flex items-center text-sm text-violet-200 gap-4 mt-2">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            {path.duration}
                          </div>
                          <div className="flex items-center">
                            <Folder className="mr-1 h-4 w-4" />
                            {path.modules.length} modules
                          </div>
                          {path.certification && (
                            <div className="flex items-center">
                              <GraduationCap className="mr-1 h-4 w-4" />
                              {path.certification}
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <h4 className="font-medium mb-2 text-violet-100">Objectifs d'apprentissage</h4>
                        <ul className="space-y-1 mb-4 list-disc pl-5 text-violet-200">
                          {path.objectives.map((objective, i) => (
                            <li key={i}>{objective}</li>
                          ))}
                        </ul>
                        
                        <h4 className="font-medium mb-2 text-violet-100">Modules inclus</h4>
                        <div className="space-y-2 mb-4">
                          {path.modules.map((moduleId, i) => {
                            const module = allModules.find(m => m.id === moduleId);
                            return module ? (
                              <div key={moduleId} className="flex items-center justify-between p-2 rounded-md bg-black/20">
                                <div className="flex items-center">
                                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-violet-700 text-white text-xs mr-3">
                                    {i + 1}
                                  </div>
                                  <div>
                                    <div className="font-medium">{module.title}</div>
                                    <div className="text-xs text-violet-300">{module.duration}</div>
                                  </div>
                                </div>
                                <Badge variant="outline" className="border-violet-700/50 text-violet-300">
                                  {module.level}
                                </Badge>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          className="flex-grow bg-violet-700 hover:bg-violet-600 border-violet-500"
                          onClick={() => {
                            if (path.modules.length > 0) {
                              const firstModule = allModules.find(m => m.id === path.modules[0]);
                              if (firstModule && firstModule.destination) {
                                window.location.href = firstModule.destination;
                              }
                            }
                          }}
                        >
                          Démarrer le parcours
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-grow border-violet-600 text-violet-100 hover:bg-violet-700/50"
                          onClick={() => {
                            toast({
                              title: "Parcours enregistré",
                              description: "Le parcours a été ajouté à votre liste de favoris.",
                              variant: "default"
                            });
                          }}
                        >
                          Ajouter aux favoris
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            
            {/* Contenu de l'onglet Catégories */}
            <TabsContent value="categories" className="mt-6">
              <h2 className="text-2xl font-semibold mb-4">Explorer par catégorie</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resourceCategories.map((category, i) => (
                  <motion.div
                    key={category.id}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Card className={`bg-gradient-to-br ${category.gradient} border-violet-700 overflow-hidden`}>
                      <CardHeader className="pb-2">
                        <div className="p-3 rounded-md bg-black/20 w-fit">
                          {category.icon}
                        </div>
                        <CardTitle className="mt-3">{category.title}</CardTitle>
                        <CardDescription className="text-violet-100">{category.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-violet-200 mb-3">{category.modules.length} modules disponibles</p>
                        <div className="space-y-2">
                          {category.modules.slice(0, 3).map((module) => (
                            <div key={module.id} className="flex justify-between items-center p-2 rounded-md bg-black/20">
                              <div className="flex items-center">
                                <div className="p-1 mr-2 rounded-md bg-violet-800/50">
                                  {module.icon}
                                </div>
                                <span>{module.title}</span>
                              </div>
                              <div className="flex items-center text-xs text-violet-300">
                                <Clock className="mr-1 h-3 w-3" />
                                {module.duration}
                              </div>
                            </div>
                          ))}
                          {category.modules.length > 3 && (
                            <p className="text-center text-sm text-violet-300 mt-2">
                              + {category.modules.length - 3} autres modules
                            </p>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full bg-violet-700 hover:bg-violet-600"
                          onClick={() => {
                            // Filtrer les modules par catégorie
                            setSelectedCategory(category.id);
                            setActiveTab('modules');
                          }}
                        >
                          Explorer cette catégorie
                        </Button>
                      </CardFooter>
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