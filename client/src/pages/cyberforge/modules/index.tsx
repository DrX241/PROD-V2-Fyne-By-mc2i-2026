import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Shield, Lock, BookOpen, Terminal, File, Network, Code, Bot, Database, Server, Star, ArrowLeft, ArrowRight, ChevronRight, ChevronDown, Layers, GraduationCap, Compass, HelpCircle, Info, Link, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  chapters: Chapter[];
  isUnlocked: boolean;
  progress: number;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  isUnlocked: boolean;
  progress: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  isCompleted: boolean;
  hasAssessment: boolean;
  isInteractive: boolean;
  type: 'theory' | 'practice' | 'challenge' | 'quiz';
}

function CyberForgeModules() {
  const [, setLocation] = useLocation();
  const { themeMode, isDark } = useTheme();
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isShowingDetailedInfo, setIsShowingDetailedInfo] = useState(false);
  
  const modules: Module[] = [
    {
      id: 'foundations',
      title: 'Fondamentaux de la Cybersécurité',
      description: 'Introduction aux principes essentiels de la sécurité informatique et à la protection des données.',
      icon: <Shield className="h-6 w-6" />,
      color: 'blue',
      isUnlocked: true,
      progress: 75,
      chapters: [
        {
          id: 'foundations-1',
          title: 'Introduction à la cybersécurité',
          description: 'Découvrez les concepts fondamentaux et l\'importance de la cybersécurité dans le monde numérique.',
          isUnlocked: true,
          progress: 100,
          lessons: [
            {
              id: 'foundations-1-1',
              title: 'Qu\'est-ce que la cybersécurité ?',
              description: 'Définition et importance de la protection des systèmes informatiques.',
              duration: '15 min',
              isCompleted: true,
              hasAssessment: true,
              isInteractive: false,
              type: 'theory'
            },
            {
              id: 'foundations-1-2',
              title: 'Évolution des menaces cybernétiques',
              description: 'Historique et tendances des attaques informatiques.',
              duration: '20 min',
              isCompleted: true,
              hasAssessment: true,
              isInteractive: true,
              type: 'theory'
            }
          ]
        },
        {
          id: 'foundations-2',
          title: 'Le modèle CIA (Confidentialité, Intégrité, Disponibilité)',
          description: 'Comprendre les trois piliers fondamentaux de la sécurité de l\'information.',
          isUnlocked: true,
          progress: 50,
          lessons: [
            {
              id: 'foundations-2-1',
              title: 'Concepts de confidentialité',
              description: 'Protection des données contre les accès non autorisés.',
              duration: '15 min',
              isCompleted: true,
              hasAssessment: true,
              isInteractive: false,
              type: 'theory'
            },
            {
              id: 'foundations-2-2',
              title: 'Intégrité des données',
              description: 'Maintenir l\'exactitude et la fiabilité des informations.',
              duration: '15 min',
              isCompleted: false,
              hasAssessment: true,
              isInteractive: true,
              type: 'practice'
            }
          ]
        }
      ]
    },
    {
      id: 'network',
      title: 'Sécurité des Réseaux',
      description: 'Protéger les infrastructures réseau contre les intrusions et garantir des communications sécurisées.',
      icon: <Network className="h-6 w-6" />,
      color: 'orange',
      isUnlocked: true,
      progress: 30,
      chapters: [
        {
          id: 'network-1',
          title: 'Bases de la sécurité réseau',
          description: 'Comprendre les fondements de la protection des réseaux informatiques.',
          isUnlocked: true,
          progress: 60,
          lessons: [
            {
              id: 'network-1-1',
              title: 'Architecture réseau sécurisée',
              description: 'Concevoir des réseaux résistants aux attaques.',
              duration: '25 min',
              isCompleted: true,
              hasAssessment: true,
              isInteractive: false,
              type: 'theory'
            },
            {
              id: 'network-1-2',
              title: 'Protocoles de communication sécurisés',
              description: 'Comprendre SSL/TLS, SSH et autres protocoles sécurisés.',
              duration: '30 min',
              isCompleted: false,
              hasAssessment: true,
              isInteractive: true,
              type: 'practice'
            }
          ]
        }
      ]
    },
    {
      id: 'cryptography',
      title: 'Cryptographie Appliquée',
      description: 'Méthodes et algorithmes pour sécuriser les données et les communications.',
      icon: <Code className="h-6 w-6" />,
      color: 'green',
      isUnlocked: true,
      progress: 45,
      chapters: [
        {
          id: 'crypto-1',
          title: 'Principes fondamentaux de la cryptographie',
          description: 'Les bases du chiffrement et de la protection des données.',
          isUnlocked: true,
          progress: 90,
          lessons: [
            {
              id: 'crypto-1-1',
              title: 'Introduction au chiffrement',
              description: 'Principes de base et importance du chiffrement.',
              duration: '20 min',
              isCompleted: true,
              hasAssessment: true,
              isInteractive: true,
              type: 'theory'
            },
            {
              id: 'crypto-1-2',
              title: 'Chiffrement symétrique vs asymétrique',
              description: 'Différences et applications des deux types de chiffrement.',
              duration: '25 min',
              isCompleted: true,
              hasAssessment: true,
              isInteractive: false,
              type: 'theory'
            }
          ]
        }
      ]
    },
    {
      id: 'ethical-hacking',
      title: 'Hacking Éthique',
      description: 'Techniques et méthodologies pour tester la sécurité des systèmes et identifier les vulnérabilités.',
      icon: <Terminal className="h-6 w-6" />,
      color: 'red',
      isUnlocked: false,
      progress: 0,
      chapters: [
        {
          id: 'ethical-1',
          title: 'Introduction au hacking éthique',
          description: 'Comprendre l\'importance et l\'éthique des tests de pénétration.',
          isUnlocked: false,
          progress: 0,
          lessons: [
            {
              id: 'ethical-1-1',
              title: 'Qu\'est-ce que le hacking éthique ?',
              description: 'Définition, objectifs et aspects légaux.',
              duration: '20 min',
              isCompleted: false,
              hasAssessment: true,
              isInteractive: false,
              type: 'theory'
            }
          ]
        }
      ]
    },
    {
      id: 'threat-intelligence',
      title: 'Renseignement sur les Menaces',
      description: 'Collecte et analyse d\'informations sur les menaces potentielles pour anticiper et prévenir les attaques.',
      icon: <Compass className="h-6 w-6" />,
      color: 'purple',
      isUnlocked: false,
      progress: 0,
      chapters: []
    },
    {
      id: 'security-ai',
      title: 'IA pour la Cybersécurité',
      description: 'Utilisation de l\'intelligence artificielle pour la détection et la prévention des menaces cybernétiques.',
      icon: <Bot className="h-6 w-6" />,
      color: 'indigo',
      isUnlocked: false,
      progress: 0,
      chapters: []
    },
    {
      id: 'cloud-security',
      title: 'Sécurité du Cloud',
      description: 'Stratégies et bonnes pratiques pour sécuriser les environnements cloud et les applications SaaS.',
      icon: <Database className="h-6 w-6" />,
      color: 'cyan',
      isUnlocked: false,
      progress: 0,
      chapters: []
    },
    {
      id: 'compliance',
      title: 'Conformité et Gouvernance',
      description: 'Comprendre les réglementations et normes de sécurité informatique et assurer leur mise en œuvre.',
      icon: <File className="h-6 w-6" />,
      color: 'gray',
      isUnlocked: false,
      progress: 0,
      chapters: []
    },
    {
      id: 'incident-response',
      title: 'Réponse aux Incidents',
      description: 'Méthodes pour détecter, analyser et répondre efficacement aux incidents de sécurité.',
      icon: <Server className="h-6 w-6" />,
      color: 'amber',
      isUnlocked: false,
      progress: 0,
      chapters: []
    }
  ];

  const selectedModule = modules.find(m => m.id === selectedModuleId) || null;
  
  const getModuleColorClass = (color: string, isDark: boolean): string => {
    const colorMap: Record<string, { bg: string, text: string, bgLight: string, textLight: string }> = {
      blue: { bg: 'bg-blue-600', text: 'text-blue-600', bgLight: 'bg-blue-100', textLight: 'text-blue-900' },
      green: { bg: 'bg-green-600', text: 'text-green-600', bgLight: 'bg-green-100', textLight: 'text-green-900' },
      red: { bg: 'bg-red-600', text: 'text-red-600', bgLight: 'bg-red-100', textLight: 'text-red-900' },
      orange: { bg: 'bg-orange-600', text: 'text-orange-600', bgLight: 'bg-orange-100', textLight: 'text-orange-900' },
      purple: { bg: 'bg-purple-600', text: 'text-purple-600', bgLight: 'bg-purple-100', textLight: 'text-purple-900' },
      indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', bgLight: 'bg-indigo-100', textLight: 'text-indigo-900' },
      cyan: { bg: 'bg-cyan-600', text: 'text-cyan-600', bgLight: 'bg-cyan-100', textLight: 'text-cyan-900' },
      amber: { bg: 'bg-amber-600', text: 'text-amber-600', bgLight: 'bg-amber-100', textLight: 'text-amber-900' },
      gray: { bg: 'bg-gray-600', text: 'text-gray-600', bgLight: 'bg-gray-100', textLight: 'text-gray-900' }
    };
    
    return isDark ? colorMap[color]?.bg || 'bg-blue-600' : colorMap[color]?.bgLight || 'bg-blue-100';
  };
  
  const getModuleTextColorClass = (color: string, isDark: boolean): string => {
    const colorMap: Record<string, { bg: string, text: string, bgLight: string, textLight: string }> = {
      blue: { bg: 'bg-blue-600', text: 'text-blue-600', bgLight: 'bg-blue-100', textLight: 'text-blue-900' },
      green: { bg: 'bg-green-600', text: 'text-green-600', bgLight: 'bg-green-100', textLight: 'text-green-900' },
      red: { bg: 'bg-red-600', text: 'text-red-600', bgLight: 'bg-red-100', textLight: 'text-red-900' },
      orange: { bg: 'bg-orange-600', text: 'text-orange-600', bgLight: 'bg-orange-100', textLight: 'text-orange-900' },
      purple: { bg: 'bg-purple-600', text: 'text-purple-600', bgLight: 'bg-purple-100', textLight: 'text-purple-900' },
      indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', bgLight: 'bg-indigo-100', textLight: 'text-indigo-900' },
      cyan: { bg: 'bg-cyan-600', text: 'text-cyan-600', bgLight: 'bg-cyan-100', textLight: 'text-cyan-900' },
      amber: { bg: 'bg-amber-600', text: 'text-amber-600', bgLight: 'bg-amber-100', textLight: 'text-amber-900' },
      gray: { bg: 'bg-gray-600', text: 'text-gray-600', bgLight: 'bg-gray-100', textLight: 'text-gray-900' }
    };
    
    return isDark ? colorMap[color]?.text || 'text-blue-600' : colorMap[color]?.textLight || 'text-blue-900';
  };
  
  const getProgressColor = (progress: number, isDark: boolean): string => {
    if (progress < 25) return isDark ? 'bg-red-600' : 'bg-red-500';
    if (progress < 50) return isDark ? 'bg-orange-600' : 'bg-orange-500';
    if (progress < 75) return isDark ? 'bg-yellow-600' : 'bg-yellow-500';
    return isDark ? 'bg-green-600' : 'bg-green-500';
  };
  
  const selectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setIsShowingDetailedInfo(true);
  };
  
  const handleLessonClick = (moduleId: string, chapterId: string, lessonId: string) => {
    // Implémenter la navigation vers la leçon spécifique
    console.log(`Accessing lesson: ${moduleId}/${chapterId}/${lessonId}`);
    // setLocation(`/cyberforge/modules/${moduleId}/${chapterId}/${lessonId}`);
  };
  
  const backToModuleList = () => {
    setIsShowingDetailedInfo(false);
    setSelectedModuleId(null);
  };
  
  const backToCyberForge = () => {
    setLocation('/cyberforge');
  };
  
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Header avec navigation */}
      <header className={`py-4 px-6 ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-md`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className={`text-2xl font-bold font-mono tracking-tight ${
              isDark 
                ? 'bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text' 
                : 'bg-gradient-to-r from-blue-700 to-indigo-800 text-transparent bg-clip-text'
            }`}>
              CyberForge<span className={isDark ? 'text-blue-300' : 'text-blue-700'}>_</span>Academy
            </h1>
            
            <div className={`px-3 py-1 rounded-md ${isDark ? 'bg-gray-800' : 'bg-gray-100'} flex items-center gap-1 ml-2`}>
              <GraduationCap className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className="text-sm font-medium">Modules de formation</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={backToCyberForge}
            className={`flex items-center gap-1 ${
              isDark 
                ? 'border-gray-600 bg-transparent text-white hover:bg-gray-700' 
                : 'border-gray-300 text-gray-800 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour</span>
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!isShowingDetailedInfo ? (
            <motion.div 
              key="module-list" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-3">Modules de formation</h2>
                <p className={`mb-6 max-w-3xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Explorez nos modules d'apprentissage complets pour développer vos compétences en cybersécurité, 
                  du niveau débutant à expert. Chaque module contient des leçons théoriques et pratiques avec des exercices interactifs.
                </p>
                
                <div className={`p-4 rounded-md flex items-center gap-3 mb-6 ${isDark ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                  <Info className={`h-5 w-5 flex-shrink-0 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
                  <p className={`text-sm ${isDark ? 'text-blue-100' : 'text-blue-800'}`}>
                    Terminez les modules de base pour débloquer des contenus avancés. Les modules verrouillés nécessitent de compléter les prérequis.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => (
                  <Card 
                    key={module.id}
                    className={`${isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white hover:border-gray-300'} border transition-all duration-200 h-full shadow-md`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className={`p-2 rounded-md ${getModuleColorClass(module.color, isDark)}`}>
                          {React.cloneElement(module.icon as React.ReactElement, { 
                            className: `h-5 w-5 ${isDark ? 'text-white' : getModuleTextColorClass(module.color, isDark)}` 
                          })}
                        </div>
                        
                        {!module.isUnlocked && (
                          <div className={`p-1.5 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <Lock className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>
                        )}
                      </div>
                      
                      <CardTitle className="text-xl">
                        {module.title}
                      </CardTitle>
                      
                      <CardDescription className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-4">
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Progression</span>
                          <span className="text-sm font-medium">{module.progress}%</span>
                        </div>
                        <Progress 
                          value={module.progress} 
                          className={`h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} 
                          indicatorClassName={getProgressColor(module.progress, isDark)}
                        />
                      </div>
                      
                      {module.chapters.length > 0 && (
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          <span className="font-medium">{module.chapters.length} chapitres</span>
                          {module.chapters.length > 0 && (
                            <span> • {module.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0)} leçons</span>
                          )}
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        className={`w-full ${
                          module.isUnlocked 
                            ? isDark 
                              ? `${getModuleColorClass(module.color, true)} hover:brightness-110 text-white` 
                              : `${getModuleColorClass(module.color, false)} hover:brightness-95 ${getModuleTextColorClass(module.color, false)}`
                            : isDark 
                              ? 'bg-gray-700 text-gray-300 cursor-not-allowed hover:bg-gray-700'
                              : 'bg-gray-100 text-gray-500 cursor-not-allowed hover:bg-gray-100'
                        }`}
                        onClick={() => module.isUnlocked && selectModule(module.id)}
                        disabled={!module.isUnlocked}
                      >
                        {module.isUnlocked ? (
                          <>
                            {module.progress > 0 ? 'Continuer' : 'Commencer'}
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Verrouillé
                            <Lock className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="module-detail" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {selectedModule && (
                <>
                  <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <Button 
                      variant="outline" 
                      onClick={backToModuleList}
                      className={`flex items-center gap-1 ${
                        isDark 
                          ? 'border-gray-600 bg-transparent text-white hover:bg-gray-700' 
                          : 'border-gray-300 text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Tous les modules</span>
                    </Button>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className={`h-4 w-4 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
                        <span className="text-sm font-medium">120 XP à gagner</span>
                      </div>
                      
                      <div className={`px-2 py-1 rounded flex items-center gap-1 ${
                        isDark ? 'bg-gray-800' : 'bg-gray-100'
                      }`}>
                        <GraduationCap className="h-4 w-4" />
                        <span className="text-sm">Difficulté: Intermédiaire</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className={`p-4 rounded-xl ${
                      isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    } shadow-md flex-1`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-md ${getModuleColorClass(selectedModule.color, isDark)}`}>
                          {React.cloneElement(selectedModule.icon as React.ReactElement, { 
                            className: `h-5 w-5 ${isDark ? 'text-white' : getModuleTextColorClass(selectedModule.color, isDark)}` 
                          })}
                        </div>
                        <h2 className="text-2xl font-bold">{selectedModule.title}</h2>
                      </div>
                      
                      <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {selectedModule.description}
                      </p>
                      
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Progression du module</span>
                          <span className="text-sm font-medium">{selectedModule.progress}%</span>
                        </div>
                        <Progress 
                          value={selectedModule.progress} 
                          className={`h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} 
                          indicatorClassName={getProgressColor(selectedModule.progress, isDark)}
                        />
                      </div>
                      
                      <Tabs defaultValue="content">
                        <TabsList className="mb-4">
                          <TabsTrigger value="content">Contenu</TabsTrigger>
                          <TabsTrigger value="overview">Aperçu</TabsTrigger>
                          <TabsTrigger value="resources">Ressources</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="content" className="space-y-4">
                          <div className={`mb-2 p-3 rounded-lg flex items-center gap-3 ${
                            isDark ? 'bg-blue-900/30 text-blue-200 border border-blue-900' : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}>
                            <HelpCircle className="h-5 w-5 flex-shrink-0" />
                            <p className="text-sm">
                              Sélectionnez un chapitre ci-dessous pour accéder à son contenu. Les cours interactifs sont marqués d'un indicateur.
                            </p>
                          </div>
                          
                          <Accordion type="single" collapsible className="border-none space-y-3">
                            {selectedModule.chapters.map((chapter, index) => (
                              <AccordionItem 
                                key={chapter.id} 
                                value={chapter.id}
                                className={`${
                                  isDark 
                                    ? 'bg-gray-900 border border-gray-700' 
                                    : 'bg-gray-50 border border-gray-200'
                                } rounded-lg overflow-hidden px-0`}
                              >
                                <AccordionTrigger className={`px-4 py-3 hover:no-underline ${
                                  !chapter.isUnlocked ? 'opacity-70' : ''
                                }`}>
                                  <div className="flex items-center gap-3 text-left">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                      isDark 
                                        ? chapter.progress === 100 ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-300' 
                                        : chapter.progress === 100 ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                                    }`}>
                                      {index + 1}
                                    </div>
                                    <div>
                                      <h3 className="font-medium">
                                        {chapter.title}
                                        {!chapter.isUnlocked && (
                                          <Lock className="inline-block ml-2 h-4 w-4" />
                                        )}
                                      </h3>
                                      <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-700 w-24">
                                          <div 
                                            className={`h-full ${getProgressColor(chapter.progress, isDark)}`}
                                            style={{ width: `${chapter.progress}%` }}
                                          ></div>
                                        </div>
                                        <span className="text-xs font-medium">{chapter.progress}%</span>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pt-2 pb-4">
                                  <p className={`mb-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {chapter.description}
                                  </p>
                                  
                                  <ul className="space-y-2">
                                    {chapter.lessons.map((lesson) => (
                                      <li key={lesson.id}>
                                        <button
                                          className={`w-full text-left p-3 rounded-md transition-colors ${
                                            isDark 
                                              ? lesson.isCompleted 
                                                ? 'bg-green-900/30 border border-green-800' 
                                                : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
                                              : lesson.isCompleted 
                                                ? 'bg-green-50 border border-green-200' 
                                                : 'bg-white border border-gray-200 hover:bg-gray-50'
                                          }`}
                                          onClick={() => handleLessonClick(selectedModule.id, chapter.id, lesson.id)}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <div className={`h-6 w-6 flex-shrink-0 rounded-full flex items-center justify-center ${
                                                lesson.isCompleted
                                                  ? isDark ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
                                                  : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                              }`}>
                                                {lesson.isCompleted ? (
                                                  <Check className="h-3.5 w-3.5" />
                                                ) : (
                                                  lesson.type === 'theory' ? (
                                                    <BookOpen className="h-3.5 w-3.5" />
                                                  ) : lesson.type === 'practice' ? (
                                                    <Code className="h-3.5 w-3.5" />
                                                  ) : lesson.type === 'challenge' ? (
                                                    <Terminal className="h-3.5 w-3.5" />
                                                  ) : (
                                                    <HelpCircle className="h-3.5 w-3.5" />
                                                  )
                                                )}
                                              </div>
                                              
                                              <div>
                                                <h4 className="font-medium text-sm">{lesson.title}</h4>
                                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                  {lesson.description}
                                                </p>
                                              </div>
                                            </div>
                                            
                                            <div className="flex gap-2 items-center">
                                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {lesson.duration}
                                              </span>
                                              
                                              {lesson.isInteractive && (
                                                <Badge className={isDark ? 'bg-indigo-900 text-indigo-200 border-0' : 'bg-indigo-100 text-indigo-800 border-0'}>
                                                  Interactif
                                                </Badge>
                                              )}
                                              
                                              {lesson.hasAssessment && (
                                                <Badge className={isDark ? 'bg-amber-900 text-amber-200 border-0' : 'bg-amber-100 text-amber-800 border-0'}>
                                                  Quiz
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </TabsContent>
                        
                        <TabsContent value="overview">
                          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                            <h3 className="text-lg font-medium mb-3">À propos de ce module</h3>
                            <p className="mb-4">
                              Ce module vous permettra de développer une compréhension solide des fondamentaux de la {selectedModule.title.toLowerCase()}. 
                              Vous apprendrez les concepts essentiels et acquerrez des compétences pratiques à travers des exercices interactifs.
                            </p>
                            
                            <h4 className="font-medium mb-2">Ce que vous apprendrez:</h4>
                            <ul className="list-disc list-inside space-y-1 mb-4">
                              <li>Les principes fondamentaux et la terminologie de base</li>
                              <li>Les meilleures pratiques et méthodologies actuelles</li>
                              <li>Des techniques pratiques avec des applications réelles</li>
                              <li>Une approche systématique pour l'analyse et la résolution de problèmes</li>
                            </ul>
                            
                            <h4 className="font-medium mb-2">Prérequis recommandés:</h4>
                            <p>
                              Une connaissance basique de l'informatique est recommandée. Aucune compétence technique avancée n'est nécessaire pour commencer.
                            </p>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="resources">
                          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                            <h3 className="text-lg font-medium mb-3">Ressources complémentaires</h3>
                            <p className="mb-4">
                              Ces ressources vous aideront à approfondir vos connaissances sur les thèmes abordés dans ce module.
                            </p>
                            
                            <ul className="space-y-3">
                              <li className={`p-3 rounded-md ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="flex items-center gap-3">
                                  <File className="h-5 w-5" />
                                  <div>
                                    <h4 className="font-medium text-sm">Guide de référence rapide</h4>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                      PDF, 1.2 MB
                                    </p>
                                  </div>
                                </div>
                              </li>
                              <li className={`p-3 rounded-md ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="flex items-center gap-3">
                                  <Link className="h-5 w-5" />
                                  <div>
                                    <h4 className="font-medium text-sm">Tutoriels vidéo complémentaires</h4>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                      Série de 5 vidéos, 45 min au total
                                    </p>
                                  </div>
                                </div>
                              </li>
                              <li className={`p-3 rounded-md ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                <div className="flex items-center gap-3">
                                  <BookOpen className="h-5 w-5" />
                                  <div>
                                    <h4 className="font-medium text-sm">Glossaire technique</h4>
                                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                      Termes et définitions essentiels
                                    </p>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default CyberForgeModules;