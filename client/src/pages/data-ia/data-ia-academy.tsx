import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  Database, 
  Code, 
  Layers, 
  Terminal, 
  Brain, 
  BookMarked,
  TrendingUp,
  FileText,
  Bot,
  Server,
  Users,
  Award,
  BarChart2,
  Cpu,
  GitBranch
} from 'lucide-react';
import { BsGraphUp, BsTools, BsPeopleFill, BsBook } from 'react-icons/bs';
import { RiRobot2Line } from 'react-icons/ri';
import { IoMdArrowForward } from 'react-icons/io';
import { MdOutlineDataExploration } from 'react-icons/md';

import DataTopNavigation from '@/components/DataTopNavigation';
import { DataButton } from '@/components/DataButton';
import PageTitle from '@/components/utils/PageTitle';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

// Types
interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'languages' | 'concepts' | 'tools' | 'careers' | 'projects';
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  duration: string;
  progress?: number;
  locked?: boolean;
  comingSoon?: boolean;
}

export default function DataIaAcademy() {
  // États
  const [modules, setModules] = useState<Module[]>([
    // Modules Langages
    {
      id: 'python-basics',
      title: 'Fondamentaux Python',
      description: 'Maîtrisez les bases de Python pour l\'analyse de données et le machine learning',
      icon: <Terminal className="h-10 w-10 text-green-400" />,
      category: 'languages',
      difficulty: 'débutant',
      duration: '4h',
      progress: 0
    },
    {
      id: 'python-data-science',
      title: 'Python pour la Data Science',
      description: 'Pandas, NumPy et Matplotlib pour manipuler et visualiser vos données',
      icon: <TrendingUp className="h-10 w-10 text-green-400" />,
      category: 'languages',
      difficulty: 'intermédiaire',
      duration: '6h',
      progress: 0,
      locked: true
    },
    {
      id: 'sql-fundamentals',
      title: 'SQL Fondamentaux',
      description: 'Interrogez vos bases de données efficacement avec SQL',
      icon: <Database className="h-10 w-10 text-blue-400" />,
      category: 'languages',
      difficulty: 'débutant',
      duration: '3h',
      progress: 0
    },
    {
      id: 'advanced-sql',
      title: 'SQL Avancé',
      description: 'Requêtes complexes, optimisation et analyse performante',
      icon: <Database className="h-10 w-10 text-blue-500" />,
      category: 'languages',
      difficulty: 'avancé',
      duration: '5h',
      progress: 0,
      locked: true
    },
    
    // Modules Concepts
    {
      id: 'data-science-intro',
      title: 'Introduction à la Data Science',
      description: 'Fondements théoriques et applications pratiques de la Data Science',
      icon: <MdOutlineDataExploration className="h-10 w-10 text-purple-400" />,
      category: 'concepts',
      difficulty: 'débutant',
      duration: '3h',
      progress: 0
    },
    {
      id: 'machine-learning-basics',
      title: 'Fondamentaux du Machine Learning',
      description: 'Algorithmes supervisés et non-supervisés, évaluation de modèles',
      icon: <Brain className="h-10 w-10 text-purple-500" />,
      category: 'concepts',
      difficulty: 'intermédiaire',
      duration: '8h',
      progress: 0,
      locked: true
    },
    {
      id: 'deep-learning',
      title: 'Deep Learning',
      description: 'Réseaux de neurones profonds et applications avancées',
      icon: <Layers className="h-10 w-10 text-purple-600" />,
      category: 'concepts',
      difficulty: 'avancé',
      duration: '10h',
      progress: 0,
      locked: true
    },
    {
      id: 'data-engineering',
      title: 'Data Engineering',
      description: 'Pipeline de données, ETL, et infrastructures Big Data',
      icon: <Server className="h-10 w-10 text-blue-500" />,
      category: 'concepts',
      difficulty: 'intermédiaire',
      duration: '6h',
      progress: 0,
      locked: true
    },
    
    // Modules Outils
    {
      id: 'jupyter-notebooks',
      title: 'Jupyter Notebooks',
      description: 'Créez des analyses interactives et des visualisations partageables',
      icon: <BookOpen className="h-10 w-10 text-orange-400" />,
      category: 'tools',
      difficulty: 'débutant',
      duration: '2h',
      progress: 0
    },
    {
      id: 'scikit-learn',
      title: 'Scikit-Learn',
      description: 'Bibliothèque incontournable pour le machine learning en Python',
      icon: <BsTools className="h-10 w-10 text-orange-500" />,
      category: 'tools',
      difficulty: 'intermédiaire',
      duration: '5h',
      progress: 0,
      locked: true
    },
    {
      id: 'tensorflow-keras',
      title: 'TensorFlow & Keras',
      description: 'Frameworks pour le deep learning et l\'intelligence artificielle',
      icon: <Cpu className="h-10 w-10 text-orange-600" />,
      category: 'tools',
      difficulty: 'avancé',
      duration: '8h',
      progress: 0,
      locked: true
    },
    {
      id: 'power-bi',
      title: 'Power BI',
      description: 'Créez des tableaux de bord interactifs et des visualisations business',
      icon: <BarChart2 className="h-10 w-10 text-yellow-500" />,
      category: 'tools',
      difficulty: 'intermédiaire',
      duration: '4h',
      progress: 0,
      locked: true
    },
    
    // Modules Métiers
    {
      id: 'data-analyst',
      title: 'Data Analyst',
      description: 'Compétences, outils et cas pratiques du métier de Data Analyst',
      icon: <FileText className="h-10 w-10 text-cyan-400" />,
      category: 'careers',
      difficulty: 'débutant',
      duration: '4h',
      progress: 0
    },
    {
      id: 'data-scientist',
      title: 'Data Scientist',
      description: 'Modélisation prédictive, statistiques avancées et machine learning',
      icon: <BsGraphUp className="h-10 w-10 text-cyan-500" />,
      category: 'careers',
      difficulty: 'intermédiaire',
      duration: '6h',
      progress: 0,
      locked: true
    },
    {
      id: 'data-engineer',
      title: 'Data Engineer',
      description: 'Conception et maintenance d\'architectures de données robustes',
      icon: <GitBranch className="h-10 w-10 text-cyan-600" />,
      category: 'careers',
      difficulty: 'intermédiaire',
      duration: '5h',
      progress: 0,
      locked: true
    },
    {
      id: 'ai-engineer',
      title: 'IA Engineer',
      description: 'Développement et déploiement de solutions d\'IA en production',
      icon: <RiRobot2Line className="h-10 w-10 text-indigo-500" />,
      category: 'careers',
      difficulty: 'avancé',
      duration: '7h',
      progress: 0,
      locked: true
    },
    
    // Modules Projets
    {
      id: 'data-analysis-project',
      title: 'Projet d\'analyse de données',
      description: 'Analyse de données réelles du secteur énergie pour optimiser la production',
      icon: <MdOutlineDataExploration className="h-10 w-10 text-green-500" />,
      category: 'projects',
      difficulty: 'intermédiaire',
      duration: '6h',
      progress: 0,
      locked: true
    },
    {
      id: 'ml-prediction-project',
      title: 'Projet prédictif',
      description: 'Développez un modèle de prédiction des comportements clients dans le retail',
      icon: <Brain className="h-10 w-10 text-indigo-400" />,
      category: 'projects',
      difficulty: 'intermédiaire',
      duration: '8h',
      progress: 0,
      locked: true
    },
    {
      id: 'nlp-project',
      title: 'Projet NLP',
      description: 'Analyse de sentiment sur des données textuelles pour un acteur du secteur bancaire',
      icon: <Bot className="h-10 w-10 text-purple-500" />,
      category: 'projects',
      difficulty: 'avancé',
      duration: '10h',
      progress: 0,
      locked: true
    },
    {
      id: 'data-dashboard-project',
      title: 'Dashboard interactif',
      description: 'Création d\'un tableau de bord analytique pour le suivi d\'indicateurs critiques',
      icon: <BarChart2 className="h-10 w-10 text-blue-400" />,
      category: 'projects',
      difficulty: 'intermédiaire',
      duration: '5h',
      progress: 0,
      locked: true
    }
  ]);
  
  const [activeCategory, setActiveCategory] = useState<'languages' | 'concepts' | 'tools' | 'careers' | 'projects'>('languages');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [aiAssistantActive, setAiAssistantActive] = useState<boolean>(false);
  const [aiAssistantMessage, setAiAssistantMessage] = useState<string>("");
  
  // Effet pour simuler un message d'accueil de l'assistant
  useEffect(() => {
    setTimeout(() => {
      setAiAssistantActive(true);
      setAiAssistantMessage("Bienvenue dans la DATA & IA ACADEMY ! Je suis votre assistant d'apprentissage IA. Vous pouvez commencer par explorer les modules fondamentaux comme 'Fondamentaux Python' ou 'Introduction à la Data Science'. Comment puis-je vous aider ?");
    }, 1500);
  }, []);
  
  // Fonction pour démarrer un module
  const startModule = (module: Module) => {
    if (module.locked) {
      toast({
        title: "Module verrouillé",
        description: "Vous devez d'abord compléter les modules prérequis",
        variant: "destructive"
      });
      return;
    }
    
    if (module.comingSoon) {
      toast({
        title: "Module à venir",
        description: "Ce module sera disponible prochainement",
        variant: "default"
      });
      return;
    }
    
    setSelectedModule(module);
    
    // Simulation d'une interaction IA
    setAiAssistantMessage(`Excellent choix ! Le module "${module.title}" vous permettra d'acquérir des compétences essentielles en ${module.category === 'languages' ? 'programmation' : module.category === 'concepts' ? 'théorie' : module.category === 'tools' ? 'utilisation d\'outils' : module.category === 'careers' ? 'métiers de la data' : 'mise en pratique'}. Voulez-vous commencer par une introduction interactive ou directement par les exercices pratiques ?`);
  };
  
  // Fonction pour générer un cours avec l'IA
  const generateCourseContent = async () => {
    if (!selectedModule) return;
    
    setAiAssistantMessage("Génération de votre cours personnalisé en cours...");
    
    try {
      const response = await fetch('/api/data-ia/generate-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          moduleId: selectedModule.id,
          moduleTitle: selectedModule.title,
          moduleDifficulty: selectedModule.difficulty
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération du cours');
      }
      
      const data = await response.json();
      
      // Simuler un délai pour représenter le chargement du contenu
      setTimeout(() => {
        setAiAssistantMessage(
          `Voici votre cours personnalisé sur "${selectedModule.title}" :\n\n` +
          `${data.content || "L'implémentation de ce module est en cours de développement. Veuillez réessayer ultérieurement."}`
        );
        
        // Mettre à jour le progrès si le cours est généré avec succès
        if (data.content) {
          setModules(prevModules => 
            prevModules.map(m => 
              m.id === selectedModule.id 
                ? { ...m, progress: 25 } 
                : m
            )
          );
        }
      }, 3000);
      
    } catch (error) {
      console.error('Erreur:', error);
      setAiAssistantMessage("Je suis désolé, mais j'ai rencontré une erreur lors de la génération de votre cours. Veuillez réessayer ou choisir un autre module.");
    }
  };
  
  // Fonction pour répondre à l'IA
  const respondToAi = (response: string) => {
    // Pour l'instant, on simule simplement une réponse
    setAiAssistantMessage("Excellente question ! Je vais vous préparer un contenu personnalisé sur ce sujet. Cela prendra quelques instants...");
    
    // Simuler un délai pour la réponse de l'IA
    setTimeout(generateCourseContent, 1500);
  };
  
  // Filtrer les modules par catégorie active
  const filteredModules = modules.filter(module => module.category === activeCategory);
  
  // Rendu du composant
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <DataTopNavigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/data-ia-mode-selection">
            <DataButton 
              variant="outline"
              className="mr-4 text-blue-300 border-blue-300/30 hover:bg-blue-900/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </DataButton>
          </Link>
          <PageTitle title="DATA & IA ACADEMY" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h2 className="text-2xl text-blue-300 font-semibold mb-2">
            Apprenez, expérimentez et maîtrisez les compétences Data & IA
          </h2>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Une académie complète et interactive pour découvrir et approfondir tous les aspects 
            de la Data Science et de l'Intelligence Artificielle, guidée par un assistant IA personnalisé.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Navigation des catégories */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-900/80 border border-blue-300/20 shadow-lg h-full">
              <CardHeader>
                <CardTitle className="text-xl text-blue-300">Catégories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant={activeCategory === 'languages' ? 'default' : 'outline'}
                    className={`justify-start ${activeCategory === 'languages' ? 'bg-blue-600 hover:bg-blue-700' : 'text-white hover:bg-slate-800/70'}`}
                    onClick={() => setActiveCategory('languages')}
                  >
                    <Code className="mr-2 h-5 w-5" />
                    Langages de programmation
                  </Button>
                  
                  <Button 
                    variant={activeCategory === 'concepts' ? 'default' : 'outline'}
                    className={`justify-start ${activeCategory === 'concepts' ? 'bg-purple-600 hover:bg-purple-700' : 'text-white hover:bg-slate-800/70'}`}
                    onClick={() => setActiveCategory('concepts')}
                  >
                    <Brain className="mr-2 h-5 w-5" />
                    Concepts Data & IA
                  </Button>
                  
                  <Button 
                    variant={activeCategory === 'tools' ? 'default' : 'outline'}
                    className={`justify-start ${activeCategory === 'tools' ? 'bg-orange-600 hover:bg-orange-700' : 'text-white hover:bg-slate-800/70'}`}
                    onClick={() => setActiveCategory('tools')}
                  >
                    <BsTools className="mr-2 h-5 w-5" />
                    Outils & Frameworks
                  </Button>
                  
                  <Button 
                    variant={activeCategory === 'careers' ? 'default' : 'outline'}
                    className={`justify-start ${activeCategory === 'careers' ? 'bg-cyan-600 hover:bg-cyan-700' : 'text-white hover:bg-slate-800/70'}`}
                    onClick={() => setActiveCategory('careers')}
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Métiers Data & IA
                  </Button>
                  
                  <Button 
                    variant={activeCategory === 'projects' ? 'default' : 'outline'}
                    className={`justify-start ${activeCategory === 'projects' ? 'bg-green-600 hover:bg-green-700' : 'text-white hover:bg-slate-800/70'}`}
                    onClick={() => setActiveCategory('projects')}
                  >
                    <BookMarked className="mr-2 h-5 w-5" />
                    Projets pratiques
                  </Button>
                </div>
                
                <Separator className="my-6 bg-blue-900/50" />
                
                {/* Module sélectionné (s'il y en a un) */}
                {selectedModule && (
                  <div className="bg-slate-800/70 p-4 rounded-lg border border-blue-500/30">
                    <h3 className="text-blue-300 font-semibold mb-2">Module sélectionné</h3>
                    <p className="text-white font-medium mb-2">{selectedModule.title}</p>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Progression</span>
                      <span className="text-xs text-gray-400">{selectedModule.progress || 0}%</span>
                    </div>
                    <Progress value={selectedModule.progress || 0} className="h-2 bg-slate-700" />
                    
                    <Button 
                      onClick={generateCourseContent}
                      className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Générer le cours IA
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Liste des modules */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-900/80 border border-blue-300/20 shadow-lg overflow-hidden h-full">
              <CardHeader>
                <CardTitle className="text-xl text-blue-300">
                  {activeCategory === 'languages' && "Langages de programmation"}
                  {activeCategory === 'concepts' && "Concepts Data & IA"}
                  {activeCategory === 'tools' && "Outils & Frameworks"}
                  {activeCategory === 'careers' && "Métiers Data & IA"}
                  {activeCategory === 'projects' && "Projets pratiques"}
                </CardTitle>
                <CardDescription>
                  {activeCategory === 'languages' && "Apprenez les langages essentiels pour la Data Science et l'IA"}
                  {activeCategory === 'concepts' && "Maîtrisez les fondements théoriques et pratiques"}
                  {activeCategory === 'tools' && "Découvrez les outils indispensables du domaine"}
                  {activeCategory === 'careers' && "Explorez les métiers et leurs compétences spécifiques"}
                  {activeCategory === 'projects' && "Mettez en pratique vos connaissances sur des cas réels"}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredModules.map((module) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`relative rounded-lg p-4 cursor-pointer
                        ${module.locked 
                          ? 'bg-slate-800/50 border border-slate-700/50 opacity-70' 
                          : 'bg-slate-800/80 border border-blue-500/20 hover:border-blue-500/50 hover:shadow-md'}
                        transition-all duration-200`}
                      onClick={() => startModule(module)}
                    >
                      <div className="flex items-start">
                        <div className={`p-2 rounded-lg mr-3 
                          ${activeCategory === 'languages' ? 'bg-green-900/50' : 
                            activeCategory === 'concepts' ? 'bg-purple-900/50' : 
                            activeCategory === 'tools' ? 'bg-orange-900/50' : 
                            activeCategory === 'careers' ? 'bg-cyan-900/50' : 
                            'bg-blue-900/50'}`}
                        >
                          {module.icon}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-blue-300 font-semibold mb-1">{module.title}</h3>
                          <p className="text-sm text-gray-300 mb-2">{module.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {module.difficulty}
                              </Badge>
                              <Badge variant="outline" className="text-xs bg-blue-900/30 text-blue-300">
                                {module.duration}
                              </Badge>
                            </div>
                            
                            {module.progress !== undefined && module.progress > 0 && (
                              <div className="text-xs text-blue-400">{module.progress}% complété</div>
                            )}
                          </div>
                          
                          {(module.progress !== undefined && module.progress > 0) && (
                            <Progress value={module.progress} className="h-1 mt-2 bg-slate-700" />
                          )}
                        </div>
                      </div>
                      
                      {module.locked && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-slate-700 text-gray-300">
                            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Verrouillé
                          </Badge>
                        </div>
                      )}
                      
                      {module.comingSoon && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-indigo-900/80 text-indigo-200">
                            Bientôt disponible
                          </Badge>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Section détaillée du module sélectionné */}
        {selectedModule && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 mb-10"
          >
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-blue-400/20 shadow-lg overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-900/50 to-indigo-900/50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 mr-4">
                      {selectedModule.icon}
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-blue-300">{selectedModule.title}</CardTitle>
                      <div className="flex items-center mt-1">
                        <Badge className="bg-blue-600 mr-2">{selectedModule.difficulty}</Badge>
                        <Badge variant="outline" className="border-blue-400/30 text-blue-300">{selectedModule.duration}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-blue-300 hover:text-blue-100 hover:bg-blue-800/50"
                    onClick={() => setSelectedModule(null)}
                  >
                    Fermer
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Colonne gauche - Description et objectifs */}
                  <div className="lg:col-span-1 space-y-4">
                    <div>
                      <h3 className="text-lg text-blue-300 mb-2 font-medium">Description</h3>
                      <p className="text-gray-300">{selectedModule.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg text-blue-300 mb-2 font-medium">Objectifs d'apprentissage</h3>
                      <ul className="space-y-1 text-gray-300">
                        <li className="flex items-start">
                          <div className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-blue-400"></div>
                          <span>Maîtriser les concepts fondamentaux</span>
                        </li>
                        <li className="flex items-start">
                          <div className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-blue-400"></div>
                          <span>Appliquer ces connaissances en contexte réel</span>
                        </li>
                        <li className="flex items-start">
                          <div className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-blue-400"></div>
                          <span>Développer des compétences pratiques</span>
                        </li>
                        <li className="flex items-start">
                          <div className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-blue-400"></div>
                          <span>Préparer des projets réels</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg text-blue-300 mb-2 font-medium">Progression</h3>
                      <Progress 
                        value={selectedModule.progress || 0} 
                        className="h-2 bg-gray-700"
                        indicatorClassName="bg-gradient-to-r from-blue-500 to-indigo-600"
                      />
                      <p className="text-sm text-gray-400 mt-1">
                        {selectedModule.progress || 0}% complété
                      </p>
                    </div>
                  </div>
                  
                  {/* Colonne droite - Options d'apprentissage */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-lg text-blue-300 mb-3 font-medium">Options d'apprentissage</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button 
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-auto py-3 text-left flex items-center justify-between"
                          onClick={generateCourseContent}
                        >
                          <div className="flex items-center">
                            <BookOpen className="h-5 w-5 mr-3" />
                            <div>
                              <div className="font-medium">Cours interactif</div>
                              <div className="text-xs text-blue-200/80">Généré pour votre niveau</div>
                            </div>
                          </div>
                          <IoMdArrowForward className="h-5 w-5" />
                        </Button>
                        
                        <Button 
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-auto py-3 text-left flex items-center justify-between"
                          onClick={() => {
                            setAiAssistantMessage("Préparation des exercices pratiques en cours...");
                            setTimeout(() => {
                              setAiAssistantMessage("Voici une série d'exercices pratiques pour mettre en application vos connaissances sur " + selectedModule.title + ". Ces exercices sont adaptés à votre niveau et vous permettront de progresser étape par étape.");
                            }, 2000);
                          }}
                        >
                          <div className="flex items-center">
                            <Code className="h-5 w-5 mr-3" />
                            <div>
                              <div className="font-medium">Exercices pratiques</div>
                              <div className="text-xs text-purple-200/80">Appliquez vos connaissances</div>
                            </div>
                          </div>
                          <IoMdArrowForward className="h-5 w-5" />
                        </Button>
                        
                        <Button
                          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 h-auto py-3 text-left flex items-center justify-between"
                          onClick={() => {
                            setAiAssistantMessage("Génération d'un quiz d'évaluation en cours...");
                            fetch('/api/data-ia/generate-quiz', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({
                                moduleId: selectedModule.id,
                                moduleTitle: selectedModule.title,
                                difficulty: selectedModule.difficulty
                              })
                            })
                            .then(response => response.json())
                            .then(data => {
                              if (data.success && data.questions) {
                                const quizIntro = `# Quiz sur ${selectedModule.title}\n\nTestez vos connaissances avec ces ${data.questions.length} questions :\n\n`;
                                const questionsText = data.questions.map((q, i) => 
                                  `**Question ${i+1}**: ${q.question}\n` +
                                  q.options.map((opt, j) => `${j === q.correctAnswerIndex ? '✓' : ' '} ${opt}`).join('\n') +
                                  `\n\n*Explication: ${q.explanation}*\n\n`
                                ).join('\n');
                                
                                setAiAssistantMessage(quizIntro + questionsText);
                              } else {
                                setAiAssistantMessage("Désolé, je n'ai pas pu générer de quiz pour le moment. Veuillez réessayer plus tard.");
                              }
                            })
                            .catch(error => {
                              console.error('Erreur:', error);
                              setAiAssistantMessage("Une erreur est survenue lors de la génération du quiz. Veuillez réessayer.");
                            });
                          }}
                        >
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 mr-3" />
                            <div>
                              <div className="font-medium">Quiz d'évaluation</div>
                              <div className="text-xs text-cyan-200/80">Testez vos connaissances</div>
                            </div>
                          </div>
                          <IoMdArrowForward className="h-5 w-5" />
                        </Button>
                        
                        <Button 
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-auto py-3 text-left flex items-center justify-between"
                          onClick={() => {
                            setAiAssistantMessage("Préparation du projet guidé en cours...");
                            setTimeout(() => {
                              setAiAssistantMessage(`# Projet guidé : Mise en pratique de ${selectedModule.title}\n\nCe projet vous permettra d'appliquer vos connaissances dans un contexte réel, avec l'aide de votre assistant IA à chaque étape. Suivez les instructions ci-dessous pour créer votre solution.\n\n## Contexte du projet\n\nVous travaillez pour mc2i, au sein de la direction DIXIT (Data & IA), et devez développer une solution pour un client du secteur de l'énergie qui cherche à optimiser sa consommation énergétique en analysant les données de ses installations.\n\n## Votre mission\n\n1. Analyser les données de consommation\n2. Identifier les facteurs influençant les pics de consommation\n3. Créer un modèle prédictif simple\n4. Proposer des recommandations concrètes\n\nVous pouvez me poser des questions à chaque étape pour recevoir des conseils personnalisés.`);
                            }, 2000);
                          }}
                        >
                          <div className="flex items-center">
                            <BsGraphUp className="h-5 w-5 mr-3" />
                            <div>
                              <div className="font-medium">Projet guidé</div>
                              <div className="text-xs text-pink-200/80">Cas pratique avec assistance</div>
                            </div>
                          </div>
                          <IoMdArrowForward className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="px-4 py-3 bg-blue-900/30 rounded-lg border border-blue-500/20">
                      <h3 className="text-lg text-blue-300 mb-2 font-medium flex items-center">
                        <RiRobot2Line className="h-5 w-5 mr-2" />
                        Assistance IA personnalisée
                      </h3>
                      <p className="text-gray-300 text-sm mb-3">
                        Posez des questions spécifiques sur ce module pour obtenir des explications adaptées à votre niveau.
                      </p>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder={`Question sur "${selectedModule.title}"...`} 
                          className="flex-1 px-4 py-2 rounded-lg bg-gray-800/70 border border-blue-500/30 text-white focus:outline-none focus:border-blue-500/70"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value) {
                              const question = e.currentTarget.value;
                              e.currentTarget.value = '';
                              
                              // Appel API pour répondre à la question
                              setAiAssistantMessage(`Analyse de votre question sur ${selectedModule.title}...`);
                              
                              fetch('/api/data-ia/answer-question', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                  moduleId: selectedModule.id,
                                  moduleTitle: selectedModule.title,
                                  question
                                })
                              })
                              .then(response => response.json())
                              .then(data => {
                                if (data.success && data.answer) {
                                  setAiAssistantMessage(data.answer);
                                } else {
                                  setAiAssistantMessage("Je n'ai pas pu trouver une réponse précise à votre question. Pourriez-vous la reformuler ou me donner plus de détails?");
                                }
                              })
                              .catch(error => {
                                console.error('Erreur:', error);
                                setAiAssistantMessage("Une erreur est survenue lors du traitement de votre question. Veuillez réessayer.");
                              });
                            }
                          }}
                        />
                        <Button 
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          Envoyer
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Chatbot d'assistance IA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ 
            opacity: aiAssistantActive ? 1 : 0, 
            y: aiAssistantActive ? 0 : 50,
            height: aiAssistantActive ? 'auto' : 0
          }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          {aiAssistantActive && (
            <Card className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border border-purple-300/30 shadow-lg overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 mr-3">
                      <RiRobot2Line className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-purple-300">Assistant IA - DATA ACADEMY</CardTitle>
                      <CardDescription className="text-purple-200/70">
                        Votre guide personnalisé pour l'apprentissage
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-purple-300 hover:text-purple-100 hover:bg-purple-800/50"
                    onClick={() => setAiAssistantActive(false)}
                  >
                    Minimiser
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="p-4 bg-gray-900/50 rounded-lg border border-purple-500/20 text-gray-200 mb-4 whitespace-pre-line">
                  {aiAssistantMessage}
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Posez une question à votre assistant IA..." 
                    className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-purple-500/30 text-white focus:outline-none focus:border-purple-500/70"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        respondToAi(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    onClick={() => respondToAi("Génère-moi du contenu sur ce sujet")}
                  >
                    Envoyer
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
}