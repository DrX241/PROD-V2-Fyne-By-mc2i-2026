import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  BookOpen,
  Shield,
  FileText,
  Search,
  Briefcase,
  Users,
  LineChart,
  Calendar,
  FileQuestion,
  BarChart3,
  ListChecks,
  BrainCircuit,
  Layers,
  Sparkles,
  MessageCircle,
  GraduationCap
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
import PageTitle from '@/components/utils/PageTitle';

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
  category: 'technique' | 'méthodologie' | 'mixte';
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

export default function AmoaAcademie() {
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

  // Modules de base (fondamentaux de l'AMOA)
  const basicModules: Module[] = [
    {
      id: 'intro-amoa',
      title: 'Introduction à l\'AMOA',
      description: 'Le rôle, les responsabilités et la place de l\'AMOA dans les projets',
      icon: <BookOpen />,
      duration: '2-3h',
      level: 'débutant',
      category: 'fondamentaux',
      tags: ['concepts', 'rôles', 'introduction'],
      progress: 0,
      destination: '/amoa/academie/modules/intro-amoa',
      comingSoon: true
    },
    {
      id: 'expression-besoins',
      title: 'Expression des besoins',
      description: 'Techniques d\'élicitation et formalisation des besoins métier',
      icon: <FileText />,
      duration: '3-4h',
      level: 'débutant',
      category: 'fondamentaux',
      tags: ['besoins', 'analyse', 'recueil'],
      progress: 0,
      destination: '/amoa/academie/modules/expression-besoins',
      comingSoon: true
    },
    {
      id: 'specifications-fonctionnelles',
      title: 'Spécifications fonctionnelles',
      description: 'Rédaction et structuration des spécifications',
      icon: <FileQuestion />,
      duration: '4-5h',
      level: 'intermédiaire',
      category: 'fondamentaux',
      tags: ['spécifications', 'exigences', 'documentation'],
      progress: 0,
      destination: '/amoa/academie/modules/specifications-fonctionnelles',
      comingSoon: true
    },
    {
      id: 'gestion-tests',
      title: 'Gestion des tests',
      description: 'Stratégies et plans de test, recette utilisateurs',
      icon: <ListChecks />,
      duration: '3-4h',
      level: 'intermédiaire',
      category: 'fondamentaux',
      tags: ['tests', 'recette', 'qualité'],
      progress: 0,
      destination: '/amoa/academie/modules/gestion-tests',
      comingSoon: true
    }
  ];

  // Modules spécialisés
  const specializedModules: Module[] = [
    {
      id: 'animation-ateliers',
      title: 'Animation d\'ateliers',
      description: 'Techniques d\'animation et de facilitation de groupes',
      icon: <Users />,
      duration: '3-4h',
      level: 'intermédiaire',
      category: 'compétences transverses',
      tags: ['animation', 'facilitation', 'ateliers'],
      progress: 0,
      destination: '/amoa/academie/modules/animation-ateliers',
      comingSoon: true
    },
    {
      id: 'pilotage-projet',
      title: 'Pilotage et suivi de projet',
      description: 'Indicateurs, tableaux de bord et reporting',
      icon: <LineChart />,
      duration: '4-6h',
      level: 'avancé',
      category: 'gestion de projet',
      tags: ['pilotage', 'indicateurs', 'reporting'],
      progress: 0,
      destination: '/amoa/academie/modules/pilotage-projet',
      comingSoon: true
    },
    {
      id: 'conduite-changement',
      title: 'Conduite du changement',
      description: 'Accompagnement des utilisateurs et gestion de la transformation',
      icon: <Briefcase />,
      duration: '5-7h',
      level: 'intermédiaire',
      category: 'compétences transverses',
      tags: ['changement', 'accompagnement', 'transformation'],
      progress: 0,
      destination: '/amoa/academie/modules/conduite-changement',
      comingSoon: true
    },
    {
      id: 'analyse-processus',
      title: 'Analyse des processus métier',
      description: 'Modélisation et optimisation des processus',
      icon: <Layers />,
      duration: '4-6h',
      level: 'intermédiaire',
      category: 'méthodologie',
      tags: ['processus', 'modélisation', 'optimisation'],
      progress: 0,
      destination: '/amoa/academie/modules/analyse-processus',
      comingSoon: true
    }
  ];

  // Parcours d'apprentissage
  const learningPaths: LearningPath[] = [
    {
      id: 'amoa-fondamental',
      title: 'Parcours AMOA Fondamental',
      description: 'Les compétences essentielles pour débuter en AMOA',
      icon: <Shield />,
      modules: ['intro-amoa', 'expression-besoins', 'specifications-fonctionnelles', 'gestion-tests'],
      duration: '12-16h',
      level: 'débutant',
      category: 'mixte',
      objectives: [
        'Comprendre le rôle et les responsabilités de l\'AMOA',
        'Maîtriser les techniques de recueil des besoins',
        'Savoir rédiger des spécifications fonctionnelles',
        'Élaborer une stratégie de test et recette'
      ],
      tags: ['débutant', 'fondamentaux', 'certification'],
      progress: 0,
      certification: 'Certification AMOA Fondamental',
      isNew: true,
      gradient: 'from-blue-600 to-blue-800'
    },
    {
      id: 'amoa-methodologie',
      title: 'Parcours Méthodologie Projet',
      description: 'Maîtriser les méthodologies de gestion de projet',
      icon: <Calendar />,
      modules: ['pilotage-projet', 'animation-ateliers', 'conduite-changement'],
      duration: '12-16h',
      level: 'intermédiaire',
      category: 'méthodologie',
      objectives: [
        'Piloter efficacement un projet',
        'Animer des ateliers et réunions',
        'Accompagner la conduite du changement',
        'Gérer les risques et problèmes'
      ],
      tags: ['intermédiaire', 'méthodologie', 'certification'],
      progress: 0,
      certification: 'Certification Méthodologie Projet',
      isNew: true,
      gradient: 'from-indigo-600 to-indigo-800'
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

  // Filtres pour les modules
  const filteredBasicModules = basicModules.filter(module => 
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    module.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSpecializedModules = specializedModules.filter(module => 
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    module.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLearningPaths = learningPaths.filter(path => 
    path.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    path.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Génération de contenu avec l'IA
  const handleAIAssistant = () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Veuillez entrer une question",
        description: "Posez une question au sujet de l'AMOA pour obtenir une réponse",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    // Ici, vous appelleriez Azure OpenAI pour générer une réponse
    setTimeout(() => {
      toast({
        title: "Assistant IA",
        description: "Fonctionnalité à venir prochainement",
        variant: "default"
      });
      setIsGenerating(false);
      setAiPrompt('');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-slate-950 text-white pb-20">
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
            <p className="text-indigo-200 mt-1">Centre de formation complet en AMOA et gestion de projet</p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              size="sm"
              className="border-indigo-500 text-indigo-200 hover:bg-indigo-800/30"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Visite guidée
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="border-indigo-500 text-indigo-200 hover:bg-indigo-800/30"
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
            >
              <BrainCircuit className="mr-2 h-4 w-4" />
              Assistant IA
            </Button>
          </div>
        </div>
        
        {/* Panel Assistant IA */}
        {aiPanelOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card className="bg-indigo-900/30 border-indigo-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BrainCircuit className="mr-2 h-5 w-5 text-indigo-400" />
                  Assistant IA AMOA
                </CardTitle>
                <CardDescription className="text-indigo-300">
                  Posez une question sur l'AMOA ou la gestion de projet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ex: Quelles sont les meilleures pratiques pour analyser les besoins ?"
                    className="bg-indigo-950/50 border-indigo-700 text-white"
                  />
                  <Button 
                    onClick={handleAIAssistant}
                    disabled={isGenerating}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isGenerating ? "Génération..." : "Générer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Filtres et recherche */}
        <div className="bg-indigo-900/20 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-indigo-400" />
                <Input
                  type="text"
                  placeholder="Rechercher des modules, parcours..."
                  className="pl-9 bg-indigo-950/50 border-indigo-700 text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-full md:w-[180px] bg-indigo-950/50 border-indigo-700 text-white">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent className="bg-indigo-900 border-indigo-700 text-white">
                <SelectItem value="all">Tous les niveaux</SelectItem>
                <SelectItem value="débutant">Débutant</SelectItem>
                <SelectItem value="intermédiaire">Intermédiaire</SelectItem>
                <SelectItem value="avancé">Avancé</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px] bg-indigo-950/50 border-indigo-700 text-white">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent className="bg-indigo-900 border-indigo-700 text-white">
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="fondamentaux">Fondamentaux</SelectItem>
                <SelectItem value="méthodologie">Méthodologie</SelectItem>
                <SelectItem value="gestion de projet">Gestion de projet</SelectItem>
                <SelectItem value="compétences transverses">Compétences transverses</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedDuration} onValueChange={setSelectedDuration}>
              <SelectTrigger className="w-full md:w-[180px] bg-indigo-950/50 border-indigo-700 text-white">
                <SelectValue placeholder="Durée" />
              </SelectTrigger>
              <SelectContent className="bg-indigo-900 border-indigo-700 text-white">
                <SelectItem value="all">Toutes les durées</SelectItem>
                <SelectItem value="court">Court (moins de 3h)</SelectItem>
                <SelectItem value="moyen">Moyen (3-5h)</SelectItem>
                <SelectItem value="long">Long (plus de 5h)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Onglets principaux */}
        <Tabs defaultValue="modules" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-indigo-900/30 border border-indigo-700">
            <TabsTrigger value="modules" className="data-[state=active]:bg-indigo-700">Modules</TabsTrigger>
            <TabsTrigger value="parcours" className="data-[state=active]:bg-indigo-700">Parcours</TabsTrigger>
          </TabsList>
          
          {/* Contenu des modules */}
          <TabsContent value="modules" className="mt-6">
            <div className="space-y-8">
              {/* Modules fondamentaux */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-indigo-400" />
                  Fondamentaux AMOA
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredBasicModules.map((module, i) => (
                    <motion.div
                      key={module.id}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Card className="bg-indigo-900/20 border border-indigo-700 h-full flex flex-col">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="p-2 rounded-full bg-indigo-800/50 mb-2">
                              {module.icon}
                            </div>
                            <Badge variant="outline" className="bg-indigo-800/30 border-indigo-600 text-indigo-200">
                              {module.level}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                          <CardDescription className="text-indigo-300">
                            {module.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {module.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="bg-indigo-900/50 text-indigo-200 border-none">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="mt-2 text-sm text-indigo-300 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {module.duration}
                          </div>
                          {module.progress !== undefined && (
                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progression</span>
                                <span>{module.progress}%</span>
                              </div>
                              <Progress value={module.progress} className="h-2 bg-indigo-950" />
                            </div>
                          )}
                        </CardContent>
                        <CardFooter>
                          <Link href={module.comingSoon ? "#" : (module.destination || "#")}>
                            <Button className={`w-full ${module.comingSoon ? 'bg-indigo-800/50 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                              {module.comingSoon ? 'Bientôt disponible' : 'Accéder au module'}
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Modules spécialisés */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5 text-indigo-400" />
                  Compétences Avancées
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredSpecializedModules.map((module, i) => (
                    <motion.div
                      key={module.id}
                      custom={i}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Card className="bg-indigo-900/20 border border-indigo-700 h-full flex flex-col">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="p-2 rounded-full bg-indigo-800/50 mb-2">
                              {module.icon}
                            </div>
                            <Badge variant="outline" className="bg-indigo-800/30 border-indigo-600 text-indigo-200">
                              {module.level}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                          <CardDescription className="text-indigo-300">
                            {module.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {module.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="bg-indigo-900/50 text-indigo-200 border-none">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="mt-2 text-sm text-indigo-300 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {module.duration}
                          </div>
                          {module.progress !== undefined && (
                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progression</span>
                                <span>{module.progress}%</span>
                              </div>
                              <Progress value={module.progress} className="h-2 bg-indigo-950" />
                            </div>
                          )}
                        </CardContent>
                        <CardFooter>
                          <Link href={module.comingSoon ? "#" : (module.destination || "#")}>
                            <Button className={`w-full ${module.comingSoon ? 'bg-indigo-800/50 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                              {module.comingSoon ? 'Bientôt disponible' : 'Accéder au module'}
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Contenu des parcours */}
          <TabsContent value="parcours" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredLearningPaths.map((path, i) => (
                <motion.div
                  key={path.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className={`rounded-xl p-6 h-full bg-gradient-to-br ${path.gradient}`}>
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-full bg-white/10">
                          {path.icon}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            {path.title}
                          </h2>
                          <p className="text-sm text-indigo-200">{path.duration} • {path.level}</p>
                        </div>
                      </div>
                      
                      <p className="mb-4 text-indigo-100">
                        {path.description}
                      </p>
                      
                      <div className="mb-4">
                        <h4 className="font-medium text-white text-sm mb-2">Objectifs d'apprentissage:</h4>
                        <ul className="space-y-1 text-indigo-200 text-sm">
                          {path.objectives.map((objective, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-medium text-white text-sm mb-2">Modules inclus:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {path.modules.map((moduleId) => {
                            const moduleInfo = [...basicModules, ...specializedModules].find(m => m.id === moduleId);
                            return moduleInfo ? (
                              <div key={moduleId} className="p-2 rounded-lg bg-white/10 text-sm">
                                {moduleInfo.title}
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                      
                      {path.certification && (
                        <div className="mb-4 mt-2 flex items-center">
                          <GraduationCap className="h-5 w-5 text-indigo-300 mr-2" />
                          <span className="text-indigo-200 text-sm">{path.certification}</span>
                        </div>
                      )}
                      
                      <div className="mt-auto pt-2">
                        <Button className="w-full bg-white/10 hover:bg-white/20 text-white">
                          Explorer ce parcours
                        </Button>
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
  );
}