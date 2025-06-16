import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { 
  Brain, 
  Zap, 
  Target, 
  Users, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  Star,
  Clock,
  TrendingUp,
  PlayCircle,
  Award,
  BarChart3,
  Lightbulb,
  Code,
  Database,
  Bot,
  Eye,
  MessageSquare,
  Shield
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import HomeLayout from '@/components/layout/HomeLayout';

const IAHomePage = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-blue-500" />,
      title: "IA Personnalisée",
      description: "Formation adaptée à votre profil et vos objectifs",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: <Target className="w-8 h-8 text-green-500" />,
      title: "Parcours Ciblés",
      description: "Modules spécialisés selon votre domaine d'activité",
      color: "from-green-500 to-blue-500"
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Apprentissage Rapide",
      description: "Méthodes optimisées pour une montée en compétences efficace",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-500" />,
      title: "Mentoring IA",
      description: "Accompagnement personnalisé par des experts",
      color: "from-purple-500 to-pink-500"
    }
  ];

  const learningPaths = [
    {
      id: 'beginner',
      title: 'Débutant en IA',
      description: 'Partez de zéro et maîtrisez les concepts fondamentaux',
      duration: '40-60h',
      modules: 8,
      level: 'Débutant',
      color: 'bg-green-600',
      skills: ['Concepts de base', 'Python', 'Machine Learning', 'Applications pratiques']
    },
    {
      id: 'developer',
      title: 'Développeur IA',
      description: 'Développez des applications intelligentes',
      duration: '60-80h',
      modules: 12,
      level: 'Intermédiaire',
      color: 'bg-blue-600',
      skills: ['Deep Learning', 'TensorFlow', 'PyTorch', 'MLOps']
    },
    {
      id: 'business',
      title: 'Business & IA',
      description: 'Pilotez des projets IA en entreprise',
      duration: '30-40h',
      modules: 6,
      level: 'Professionnel',
      color: 'bg-purple-600',
      skills: ['Stratégie IA', 'ROI', 'Gestion de projet', 'Éthique']
    },
    {
      id: 'specialist',
      title: 'Spécialiste IA',
      description: 'Expertise avancée dans un domaine spécifique',
      duration: '80-100h',
      modules: 15,
      level: 'Expert',
      color: 'bg-orange-600',
      skills: ['Recherche', 'Architectures avancées', 'Optimisation', 'Innovation']
    }
  ];

  const specializations = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'NLP & Chatbots',
      description: 'Traitement du langage naturel et agents conversationnels',
      projects: 5,
      color: 'bg-blue-500'
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'Computer Vision',
      description: 'Analyse d\'images et reconnaissance visuelle',
      projects: 4,
      color: 'bg-green-500'
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Data Science',
      description: 'Analyse de données et modélisation prédictive',
      projects: 6,
      color: 'bg-purple-500'
    },
    {
      icon: <Bot className="w-6 h-6" />,
      title: 'IA Générative',
      description: 'Création de contenu avec l\'IA générative',
      projects: 3,
      color: 'bg-pink-500'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'IA Éthique',
      description: 'Développement responsable et sécurisé',
      projects: 4,
      color: 'bg-yellow-500'
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'MLOps',
      description: 'Déploiement et maintenance de modèles IA',
      projects: 5,
      color: 'bg-indigo-500'
    }
  ];

  const stats = [
    { label: 'Apprenants formés', value: '10,000+', icon: <Users className="w-5 h-5" /> },
    { label: 'Heures de contenu', value: '500+', icon: <Clock className="w-5 h-5" /> },
    { label: 'Projets pratiques', value: '150+', icon: <Code className="w-5 h-5" /> },
    { label: 'Taux de réussite', value: '95%', icon: <Award className="w-5 h-5" /> }
  ];

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        {/* Hero Section */}
        <div className="relative py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <Brain className="w-20 h-20 text-blue-400 mr-4" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-yellow-800" />
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-6xl font-bold text-white mb-2">
                    I AM IA
                  </h1>
                  <p className="text-xl text-blue-200">
                    Votre parcours personnalisé vers l'expertise IA
                  </p>
                </div>
              </div>
              
              <p className="text-lg text-gray-300 mb-8 max-w-4xl mx-auto">
                Développez vos compétences en Intelligence Artificielle avec un parcours entièrement adapté 
                à votre profil, votre expérience et vos objectifs professionnels. De l'initiation à l'expertise, 
                nous vous accompagnons à chaque étape.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                  onClick={() => setLocation('/ia/evaluation-profil')}
                >
                  <Target className="w-5 h-5 mr-2" />
                  Évaluer mon profil
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-blue-500 text-blue-300 hover:bg-blue-600 px-8 py-4 text-lg"
                  onClick={() => setActiveTab("paths")}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Voir les parcours
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center mb-2">
                      {stat.icon}
                      <span className="text-2xl font-bold text-white ml-2">{stat.value}</span>
                    </div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 mb-12 bg-gray-800 border-gray-700">
                <TabsTrigger value="overview" className="text-white data-[state=active]:bg-blue-600">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Vue d'ensemble
                </TabsTrigger>
                <TabsTrigger value="paths" className="text-white data-[state=active]:bg-blue-600">
                  <Target className="w-4 h-4 mr-2" />
                  Parcours
                </TabsTrigger>
                <TabsTrigger value="specializations" className="text-white data-[state=active]:bg-blue-600">
                  <Star className="w-4 h-4 mr-2" />
                  Spécialisations
                </TabsTrigger>
                <TabsTrigger value="features" className="text-white data-[state=active]:bg-blue-600">
                  <Zap className="w-4 h-4 mr-2" />
                  Avantages
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700">
                      <CardHeader>
                        <CardTitle className="text-white text-2xl flex items-center">
                          <BarChart3 className="w-6 h-6 mr-3" />
                          Commencez par évaluer votre profil
                        </CardTitle>
                        <CardDescription className="text-blue-200">
                          Notre IA analyse vos compétences actuelles et définit un parcours sur mesure
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Users className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Profil personnel</h3>
                            <p className="text-gray-300 text-sm">Rôle, expérience, objectifs</p>
                          </div>
                          <div className="text-center">
                            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                              <BarChart3 className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Évaluation technique</h3>
                            <p className="text-gray-300 text-sm">Niveau actuel en IA et programmation</p>
                          </div>
                          <div className="text-center">
                            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Target className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Recommandations</h3>
                            <p className="text-gray-300 text-sm">Parcours et modules personnalisés</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <Button 
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                            onClick={() => setLocation('/ia/evaluation-profil')}
                          >
                            <PlayCircle className="w-5 h-5 mr-2" />
                            Démarrer l'évaluation (5 min)
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              <TabsContent value="paths">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {learningPaths.map((path, index) => (
                    <motion.div
                      key={path.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="bg-gray-800/50 border-gray-700 hover:border-blue-500 transition-colors h-full">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-12 h-12 rounded-lg ${path.color} flex items-center justify-center mr-4`}>
                                <Brain className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-white text-xl">{path.title}</CardTitle>
                                <Badge variant="outline" className="text-gray-400 border-gray-600 mt-1">
                                  {path.level}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-gray-400 mb-4">
                            {path.description}
                          </CardDescription>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center text-gray-300">
                              <Clock className="w-4 h-4 mr-2" />
                              <span className="text-sm">{path.duration}</span>
                            </div>
                            <div className="flex items-center text-gray-300">
                              <BookOpen className="w-4 h-4 mr-2" />
                              <span className="text-sm">{path.modules} modules</span>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="text-white font-medium mb-2">Compétences développées:</h4>
                            <div className="flex flex-wrap gap-2">
                              {path.skills.map((skill, skillIndex) => (
                                <Badge key={skillIndex} variant="secondary" className="bg-gray-700 text-gray-300">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <Button 
                            className="w-full border-blue-500 text-blue-300 hover:bg-blue-600"
                            variant="outline"
                            onClick={() => setLocation('/ia/evaluation-profil')}
                          >
                            Évaluer pour ce parcours
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="specializations">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {specializations.map((spec, index) => (
                    <motion.div
                      key={spec.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="bg-gray-800/50 border-gray-700 hover:border-blue-500 transition-colors h-full">
                        <CardHeader>
                          <div className="flex items-center">
                            <div className={`w-12 h-12 rounded-lg ${spec.color} flex items-center justify-center mr-4`}>
                              {spec.icon}
                            </div>
                            <div>
                              <CardTitle className="text-white text-lg">{spec.title}</CardTitle>
                              <p className="text-gray-400 text-sm">{spec.projects} projets pratiques</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-gray-400 mb-4">
                            {spec.description}
                          </CardDescription>
                          <Button 
                            className="w-full border-blue-500 text-blue-300 hover:bg-blue-600"
                            variant="outline"
                            disabled
                          >
                            Bientôt disponible
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="features">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors h-full">
                        <CardHeader className="text-center">
                          <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                            {feature.icon}
                          </div>
                          <CardTitle className="text-white text-lg">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-400 text-center">{feature.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Call to Action */}
        <div className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8"
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Prêt à devenir un expert en IA ?
              </h2>
              <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
                Rejoignez des milliers de professionnels qui ont déjà transformé leur carrière 
                grâce à nos formations personnalisées en Intelligence Artificielle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
                  onClick={() => setLocation('/ia/evaluation-profil')}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Commencer maintenant
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 px-8 py-3"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Voir la démo
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default IAHomePage;