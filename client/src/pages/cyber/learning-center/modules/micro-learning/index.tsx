import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ArrowLeft,
  BookOpen,
  Shield,
  Lock,
  Database,
  Network,
  Server,
  UserCheck,
  FileWarning,
  Mail,
  Fingerprint,
  Smartphone,
  Building,
  BarChart3,
  PenTool,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import PageTitle from '@/components/utils/PageTitle';

// Types
interface MicroLearningTopic {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  progress?: number;
  path: string;
}

interface MicroLearningSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  topics: MicroLearningTopic[];
}

export default function MicroLearningHub() {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('all');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Sections de micro-learning
  const microlearningSections: MicroLearningSection[] = [
    {
      id: 'fondamentaux',
      title: 'Fondamentaux',
      description: 'Les concepts essentiels de la cybersécurité à maîtriser',
      icon: <Shield className="h-6 w-6" />,
      color: 'from-blue-600 to-blue-800',
      topics: [
        {
          id: 'principes-base',
          title: 'Principes de base',
          description: 'Confidentialité, intégrité, disponibilité et autres piliers fondamentaux',
          duration: '15 min',
          difficulty: 'débutant',
          progress: 0,
          path: '/cyber/learning-center/modules/micro-learning/fondamentaux/principes-base'
        },
        {
          id: 'modeles-menaces',
          title: 'Modèles de menaces',
          description: 'Comment identifier et évaluer les risques de sécurité',
          duration: '20 min',
          difficulty: 'intermédiaire',
          progress: 0,
          path: '/cyber/learning-center/modules/micro-learning/fondamentaux/modeles-menaces'
        }
      ]
    },
    {
      id: 'techniques',
      title: 'Techniques',
      description: 'Compétences pratiques et outils de cybersécurité',
      icon: <Lock className="h-6 w-6" />,
      color: 'from-indigo-600 to-indigo-800',
      topics: [
        {
          id: 'cryptographie',
          title: 'Cryptographie moderne',
          description: 'Principes et applications des techniques de chiffrement',
          duration: '25 min',
          difficulty: 'intermédiaire',
          progress: 0,
          path: '/cyber/learning-center/modules/micro-learning/techniques/cryptographie'
        },
        {
          id: 'securite-reseau',
          title: 'Sécurité réseau',
          description: 'Protéger les infrastructures de communication',
          duration: '20 min',
          difficulty: 'intermédiaire',
          progress: 0,
          path: '/cyber/learning-center/modules/micro-learning/techniques/securite-reseau'
        }
      ]
    },
    {
      id: 'operationnel',
      title: 'Opérationnel',
      description: 'Gestion quotidienne de la sécurité',
      icon: <Server className="h-6 w-6" />,
      color: 'from-purple-600 to-purple-800',
      topics: [
        {
          id: 'gestion-incidents',
          title: 'Gestion des incidents',
          description: 'Détecter, analyser et répondre aux incidents de sécurité',
          duration: '25 min',
          difficulty: 'intermédiaire',
          progress: 0,
          path: '/cyber/learning-center/modules/micro-learning/operationnel/gestion-incidents'
        },
        {
          id: 'monitoring-securite',
          title: 'Monitoring de sécurité',
          description: 'Surveiller efficacement son infrastructure pour détecter les menaces',
          duration: '20 min',
          difficulty: 'intermédiaire',
          progress: 0,
          path: '/cyber/learning-center/modules/micro-learning/operationnel/monitoring-securite'
        }
      ]
    },
    {
      id: 'gouvernance',
      title: 'Gouvernance',
      description: 'Politiques, normes et gestion des risques',
      icon: <Building className="h-6 w-6" />,
      color: 'from-green-600 to-green-800',
      topics: [
        {
          id: 'normes-cybersecurite',
          title: 'Normes de cybersécurité',
          description: 'Comprendre ISO 27001, NIST et autres référentiels',
          duration: '20 min',
          difficulty: 'intermédiaire',
          progress: 0,
          path: '/cyber/learning-center/modules/micro-learning/gouvernance/normes-cybersecurite'
        },
        {
          id: 'conformite-rgpd',
          title: 'Conformité RGPD',
          description: 'Exigences clés et bonnes pratiques',
          duration: '25 min',
          difficulty: 'intermédiaire',
          progress: 0,
          path: '/cyber/learning-center/modules/micro-learning/gouvernance/conformite-rgpd'
        }
      ]
    },
    {
      id: 'menaces',
      title: 'Menaces & Attaques',
      description: 'Comprendre les techniques offensives',
      icon: <FileWarning className="h-6 w-6" />,
      color: 'from-orange-600 to-orange-800',
      topics: [
        {
          id: 'ransomware',
          title: 'Ransomware',
          description: 'Fonctionnement, prévention et réponse aux attaques par rançongiciel',
          duration: '20 min',
          difficulty: 'intermédiaire',
          progress: 0,
          path: '/cyber/learning-center/modules/micro-learning/menaces/ransomware'
        },
        {
          id: 'phishing',
          title: 'Phishing avancé',
          description: "Techniques sophistiquées d'hameçonnage et contre-mesures",
          duration: '15 min',
          difficulty: 'débutant',
          progress: 0,
          path: '/cyber/learning-center/modules/micro-learning/menaces/phishing'
        }
      ]
    },
    {
      id: 'identite',
      title: 'Identité & Accès',
      description: "Gestion des identités et des contrôles d'accès",
      icon: <Fingerprint className="h-6 w-6" />,
      color: 'from-red-600 to-red-800',
      topics: [
        {
          id: 'authentification-mfa',
          title: 'Authentification MFA',
          description: "Implémentation et bonnes pratiques de l'authentification multifacteur",
          duration: '15 min',
          difficulty: 'débutant',
          progress: 0,
          path: '/cyber/learning-center/modules/micro-learning/identite/authentification-mfa'
        },
        {
          id: 'gestion-acces',
          title: 'Gestion des accès',
          description: 'Principes du moindre privilège et de la séparation des tâches',
          duration: '20 min',
          difficulty: 'intermédiaire',
          progress: 0,
          path: '/cyber/learning-center/modules/micro-learning/identite/gestion-acces'
        }
      ]
    }
  ];

  // Filtrer les topics en fonction de l'onglet actif
  const getFilteredTopics = () => {
    if (activeTab === 'all') {
      return microlearningSections.flatMap(section => section.topics);
    } else {
      const section = microlearningSections.find(s => s.id === activeTab);
      return section ? section.topics : [];
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/cyber/learning-center">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au centre d'apprentissage
          </Button>
        </Link>
        <PageTitle
          title="Micro-Learning"
          subtitle="Sessions d'apprentissage courtes et ciblées pour maîtriser rapidement des concepts clés"
          icon={<BookOpen className="h-8 w-8 text-blue-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panneau latéral */}
        <Card className="bg-blue-900/20 border-blue-800 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Catégories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <Button 
                variant={activeTab === 'all' ? "default" : "ghost"} 
                className={`w-full justify-start ${activeTab === 'all' ? 'bg-blue-700 hover:bg-blue-800' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Toutes les sessions
              </Button>
              
              <Separator className="my-2 bg-blue-800/50" />
              
              {microlearningSections.map((section) => (
                <Button 
                  key={section.id}
                  variant={activeTab === section.id ? "default" : "ghost"} 
                  className={`w-full justify-start ${activeTab === section.id ? 'bg-blue-700 hover:bg-blue-800' : ''}`}
                  onClick={() => setActiveTab(section.id)}
                >
                  {section.icon}
                  <span className="ml-2">{section.title}</span>
                </Button>
              ))}
            </div>
            
            <Separator className="my-4 bg-blue-800/50" />
            
            <div className="p-3 bg-blue-800/30 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center">
                <PenTool className="h-4 w-4 mr-2" />
                À propos du Micro-Learning
              </h3>
              <p className="text-sm text-blue-200">
                Sessions courtes et ciblées conçues pour s'intégrer facilement dans votre emploi du temps.
                Chaque module peut être complété en 15-25 minutes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="cards" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="cards">Cartes</TabsTrigger>
              <TabsTrigger value="list">Liste</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cards">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {getFilteredTopics().map((topic, index) => (
                  <motion.div key={topic.id} variants={itemVariants} custom={index}>
                    <Link href={topic.path}>
                      <Card className="bg-blue-900/20 border-blue-800 hover:bg-blue-800/30 transition-all cursor-pointer h-full">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <CardTitle className="text-lg">{topic.title}</CardTitle>
                            <Badge variant="outline" className="bg-blue-950/50 border-blue-700 text-blue-200">
                              {topic.duration}
                            </Badge>
                          </div>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={topic.difficulty === 'débutant' ? 'default' : 'outline'} className={`
                              ${topic.difficulty === 'débutant' ? 'bg-green-600' : 'bg-blue-950/50 border-blue-700 text-blue-200'}
                            `}>
                              {topic.difficulty}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-300 mb-4">{topic.description}</p>
                          
                          {topic.progress !== undefined && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progression</span>
                                <span>{topic.progress}%</span>
                              </div>
                              <Progress value={topic.progress} className="h-1.5" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="list">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardContent className="p-0">
                  <div className="divide-y divide-blue-800">
                    {getFilteredTopics().map((topic) => (
                      <Link key={topic.id} href={topic.path}>
                        <div className="flex items-center justify-between p-4 hover:bg-blue-800/30 transition-colors cursor-pointer">
                          <div className="flex-1">
                            <h3 className="font-medium">{topic.title}</h3>
                            <p className="text-sm text-blue-200">{topic.description}</p>
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="mr-2 bg-blue-950/50 border-blue-700 text-blue-200">
                                {topic.duration}
                              </Badge>
                              <Badge variant={topic.difficulty === 'débutant' ? 'default' : 'outline'} className={`
                                ${topic.difficulty === 'débutant' ? 'bg-green-600' : 'bg-blue-950/50 border-blue-700 text-blue-200'}
                              `}>
                                {topic.difficulty}
                              </Badge>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-blue-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}