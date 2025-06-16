import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { 
  Brain, 
  Cpu, 
  Database, 
  Target, 
  TrendingUp, 
  Users, 
  Code, 
  BarChart3,
  ArrowRight,
  Play,
  CheckCircle,
  Clock,
  User,
  BookOpen,
  Lightbulb,
  Zap
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HomeLayout from '@/components/layout/HomeLayout';

const IAHomePage = () => {
  const [, setLocation] = useLocation();
  const [userProfile, setUserProfile] = useState(null);

  // Modules de formation IA personnalisés
  const trainingModules = [
    {
      id: 'ia-fundamentals',
      title: 'Fondamentaux de l\'IA',
      description: 'Bases théoriques et pratiques de l\'intelligence artificielle',
      icon: <Brain className="w-6 h-6" />,
      level: 'Débutant',
      duration: '4-6 heures',
      topics: ['Machine Learning', 'Deep Learning', 'Réseaux de neurones', 'Algorithmes'],
      adaptiveContent: true,
      prerequisite: 'Aucun',
      color: 'bg-blue-600'
    },
    {
      id: 'ml-practical',
      title: 'Machine Learning Pratique',
      description: 'Mise en œuvre d\'algorithmes ML avec Python et scikit-learn',
      icon: <Cpu className="w-6 h-6" />,
      level: 'Intermédiaire',
      duration: '6-8 heures',
      topics: ['Python ML', 'Scikit-learn', 'Pandas', 'Preprocessing', 'Modélisation'],
      adaptiveContent: true,
      prerequisite: 'Fondamentaux IA',
      color: 'bg-green-600'
    },
    {
      id: 'data-science',
      title: 'Data Science & Analyse',
      description: 'Analyse de données, visualisation et insights business',
      icon: <Database className="w-6 h-6" />,
      level: 'Intermédiaire',
      duration: '5-7 heures',
      topics: ['EDA', 'Visualisation', 'Statistiques', 'Business Intelligence'],
      adaptiveContent: true,
      prerequisite: 'Bases en données',
      color: 'bg-purple-600'
    },
    {
      id: 'nlp-processing',
      title: 'Traitement du Langage Naturel',
      description: 'NLP, analyse de texte et chatbots intelligents',
      icon: <BookOpen className="w-6 h-6" />,
      level: 'Avancé',
      duration: '7-9 heures',
      topics: ['NLTK', 'Transformers', 'GPT', 'Sentiment Analysis', 'Chatbots'],
      adaptiveContent: true,
      prerequisite: 'ML Pratique',
      color: 'bg-indigo-600'
    },
    {
      id: 'computer-vision',
      title: 'Vision par Ordinateur',
      description: 'Analyse d\'images, reconnaissance et détection d\'objets',
      icon: <Target className="w-6 h-6" />,
      level: 'Avancé',
      duration: '8-10 heures',
      topics: ['OpenCV', 'CNN', 'YOLO', 'Classification', 'Détection'],
      adaptiveContent: true,
      prerequisite: 'Deep Learning',
      color: 'bg-red-600'
    },
    {
      id: 'ai-business',
      title: 'IA en Entreprise',
      description: 'Stratégie IA, ROI et transformation digitale',
      icon: <TrendingUp className="w-6 h-6" />,
      level: 'Expert',
      duration: '6-8 heures',
      topics: ['Stratégie IA', 'ROI', 'Éthique', 'Gouvernance', 'Innovation'],
      adaptiveContent: true,
      prerequisite: 'Expérience IA',
      color: 'bg-orange-600'
    }
  ];

  // Outils IA pratiques
  const practicalTools = [
    {
      id: 'prompt-engineering',
      title: 'Atelier Prompt Engineering',
      description: 'Maîtriser l\'art des prompts pour ChatGPT, Claude et autres LLM',
      icon: <Lightbulb className="w-5 h-5" />,
      category: 'Pratique',
      difficulty: 'Tous niveaux',
      estimatedTime: '2-3h'
    },
    {
      id: 'model-comparison',
      title: 'Comparateur de Modèles IA',
      description: 'Outil interactif pour comparer les performances des modèles IA',
      icon: <BarChart3 className="w-5 h-5" />,
      category: 'Analyse',
      difficulty: 'Intermédiaire',
      estimatedTime: '1-2h'
    },
    {
      id: 'ai-ethics-simulator',
      title: 'Simulateur d\'Éthique IA',
      description: 'Cas pratiques sur les dilemmes éthiques en intelligence artificielle',
      icon: <Users className="w-5 h-5" />,
      category: 'Éthique',
      difficulty: 'Avancé',
      estimatedTime: '3-4h'
    },
    {
      id: 'code-ai-assistant',
      title: 'Assistant de Code IA',
      description: 'Générateur et optimiseur de code avec IA intégrée',
      icon: <Code className="w-5 h-5" />,
      category: 'Développement',
      difficulty: 'Tous niveaux',
      estimatedTime: '1-2h'
    }
  ];

  // Parcours de formation adaptés
  const learningPaths = [
    {
      id: 'path-beginner',
      title: 'Découverte IA',
      description: 'Pour les débutants qui veulent comprendre l\'IA',
      modules: ['ia-fundamentals', 'ml-practical', 'data-science'],
      duration: '15-21 heures',
      level: 'Débutant',
      icon: <User className="w-5 h-5" />,
      color: 'bg-blue-500'
    },
    {
      id: 'path-developer',
      title: 'Développeur IA',
      description: 'Pour les développeurs qui veulent implémenter l\'IA',
      modules: ['ml-practical', 'nlp-processing', 'computer-vision'],
      duration: '21-27 heures',
      level: 'Intermédiaire',
      icon: <Code className="w-5 h-5" />,
      color: 'bg-green-500'
    },
    {
      id: 'path-manager',
      title: 'Manager IA',
      description: 'Pour les managers qui veulent piloter des projets IA',
      modules: ['ia-fundamentals', 'ai-business', 'data-science'],
      duration: '16-22 heures',
      level: 'Expert',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-purple-500'
    }
  ];

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <Brain className="w-16 h-16 text-blue-400 mr-4" />
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">
                I AM <span className="text-blue-400">IA</span>
              </h1>
              <p className="text-xl text-blue-200">
                Formation Intelligence Artificielle Personnalisée
              </p>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-300 mb-8">
              Développez vos compétences en IA avec un parcours adapté à votre profil, 
              votre niveau et vos objectifs professionnels. Formation interactive, 
              pratique et mise à jour en continu.
            </p>
          </div>
        </motion.div>

        <Tabs defaultValue="modules" className="w-full max-w-7xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 bg-blue-900/30 border-blue-700">
            <TabsTrigger value="modules" className="text-white data-[state=active]:bg-blue-600">
              Modules de Formation
            </TabsTrigger>
            <TabsTrigger value="paths" className="text-white data-[state=active]:bg-blue-600">
              Parcours Guidés
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-white data-[state=active]:bg-blue-600">
              Outils Pratiques
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-white data-[state=active]:bg-blue-600">
              Mon Profil IA
            </TabsTrigger>
          </TabsList>

          {/* Modules de Formation */}
          <TabsContent value="modules" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainingModules.map((module, index) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-blue-800/50 border-blue-700 hover:bg-blue-800/70 transition-all duration-300 h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-3 rounded-lg ${module.color}`}>
                          {module.icon}
                        </div>
                        <Badge variant="outline" className="text-blue-300 border-blue-500">
                          {module.level}
                        </Badge>
                      </div>
                      <CardTitle className="text-white">{module.title}</CardTitle>
                      <CardDescription className="text-blue-200">
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center text-sm text-blue-300">
                          <Clock className="w-4 h-4 mr-2" />
                          Durée: {module.duration}
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {module.topics.slice(0, 3).map((topic) => (
                            <Badge key={topic} variant="secondary" className="bg-blue-900/50 text-blue-200 text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {module.topics.length > 3 && (
                            <Badge variant="secondary" className="bg-blue-900/50 text-blue-200 text-xs">
                              +{module.topics.length - 3}
                            </Badge>
                          )}
                        </div>

                        {module.adaptiveContent && (
                          <div className="flex items-center text-sm text-green-400">
                            <Zap className="w-4 h-4 mr-2" />
                            Contenu adaptatif
                          </div>
                        )}

                        <div className="pt-4">
                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => setLocation(`/ia/formation/${module.id}`)}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Commencer
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Parcours Guidés */}
          <TabsContent value="paths" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {learningPaths.map((path, index) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-blue-800/50 border-blue-700 hover:bg-blue-800/70 transition-all duration-300 h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-3 rounded-lg ${path.color}`}>
                          {path.icon}
                        </div>
                        <Badge variant="outline" className="text-blue-300 border-blue-500">
                          {path.level}
                        </Badge>
                      </div>
                      <CardTitle className="text-white">{path.title}</CardTitle>
                      <CardDescription className="text-blue-200">
                        {path.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center text-sm text-blue-300">
                          <Clock className="w-4 h-4 mr-2" />
                          Durée totale: {path.duration}
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-blue-300 font-medium">Modules inclus:</p>
                          {path.modules.map((moduleId) => {
                            const module = trainingModules.find(m => m.id === moduleId);
                            return (
                              <div key={moduleId} className="flex items-center text-sm text-blue-200">
                                <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                                {module?.title}
                              </div>
                            );
                          })}
                        </div>

                        <div className="pt-4">
                          <Button 
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => setLocation(`/ia/parcours/${path.id}`)}
                          >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Démarrer le parcours
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Outils Pratiques */}
          <TabsContent value="tools" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {practicalTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-blue-800/50 border-blue-700 hover:bg-blue-800/70 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-3 rounded-lg bg-purple-600">
                          {tool.icon}
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-purple-300 border-purple-500">
                            {tool.category}
                          </Badge>
                          <Badge variant="outline" className="text-blue-300 border-blue-500">
                            {tool.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-white">{tool.title}</CardTitle>
                      <CardDescription className="text-blue-200">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-blue-300">
                          <Clock className="w-4 h-4 mr-2" />
                          {tool.estimatedTime}
                        </div>
                        <Button 
                          variant="outline" 
                          className="border-purple-500 text-purple-300 hover:bg-purple-600"
                          onClick={() => setLocation(`/ia/outils/${tool.id}`)}
                        >
                          Utiliser
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Profil Utilisateur */}
          <TabsContent value="profile" className="mt-8">
            <div className="max-w-4xl mx-auto">
              <Card className="bg-blue-800/50 border-blue-700">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Profil d'Apprentissage IA</CardTitle>
                  <CardDescription className="text-blue-200">
                    Votre formation IA personnalisée selon votre profil et objectifs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Votre niveau actuel</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-300">Fondamentaux IA</span>
                            <span className="text-blue-300">Débutant</span>
                          </div>
                          <Progress value={25} className="bg-blue-900" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-300">Machine Learning</span>
                            <span className="text-blue-300">Novice</span>
                          </div>
                          <Progress value={10} className="bg-blue-900" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-300">Data Science</span>
                            <span className="text-blue-300">Novice</span>
                          </div>
                          <Progress value={15} className="bg-blue-900" />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Recommandations</h3>
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-700 rounded-lg">
                            <p className="text-sm text-blue-100">
                              <strong>Prochaine étape:</strong> Commencer par "Fondamentaux de l'IA"
                            </p>
                          </div>
                          <div className="p-3 bg-green-700 rounded-lg">
                            <p className="text-sm text-green-100">
                              <strong>Parcours suggéré:</strong> "Découverte IA" (15-21h)
                            </p>
                          </div>
                          <div className="p-3 bg-purple-700 rounded-lg">
                            <p className="text-sm text-purple-100">
                              <strong>Outil recommandé:</strong> "Atelier Prompt Engineering"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-blue-700">
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={() => setLocation('/ia/evaluation-profil')}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Évaluer mon profil IA
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </HomeLayout>
  );
};

export default IAHomePage;