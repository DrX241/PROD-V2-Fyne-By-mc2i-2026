import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Shield, Network, Server, AlertCircle, CheckCircle, 
  Lock, Wifi, User, Database, Layers, FileKey, ShieldAlert, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import DefenseBoard from './DefenseBoard';

// Types
interface Level {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  completed: boolean;
  locked: boolean;
}

// Composants de sécurité disponibles
interface SecurityComponent {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  category: 'firewall' | 'authentication' | 'segmentation' | 'monitoring' | 'other';
  power: number; // 1-10
  cost: number; // 1-10
  compatibility: string[];
}

export default function FirewallTactique() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  
  // Niveaux du jeu
  const levels: Level[] = [
    {
      id: 'level1',
      name: 'Niveau 1 - Protection de base',
      description: 'Protégez un réseau simple contre des attaques basiques en utilisant des composants essentiels.',
      difficulty: 'beginner',
      completed: false,
      locked: false,
    },
    {
      id: 'level2',
      name: 'Niveau 2 - Segmentation réseau',
      description: 'Apprenez à diviser votre réseau en zones de sécurité pour limiter la propagation des attaques.',
      difficulty: 'beginner',
      completed: false,
      locked: true,
    },
    {
      id: 'level3',
      name: 'Niveau 3 - Défense en profondeur',
      description: 'Implémentez plusieurs couches de sécurité pour une protection optimale contre des attaques plus sophistiquées.',
      difficulty: 'intermediate',
      completed: false,
      locked: true,
    },
    {
      id: 'level4',
      name: 'Niveau 4 - Réponse aux incidents',
      description: 'Détectez et répondez aux incidents de sécurité en temps réel en combinant surveillance et défense active.',
      difficulty: 'advanced',
      completed: false,
      locked: true,
    },
    {
      id: 'level5',
      name: 'Niveau 5 - Menaces persistantes avancées',
      description: 'Protégez votre infrastructure contre des attaquants sophistiqués utilisant des techniques d\'intrusion avancées.',
      difficulty: 'expert',
      completed: false,
      locked: true,
    },
  ];

  // Composants de sécurité disponibles
  const securityComponents: SecurityComponent[] = [
    {
      id: 'firewall-basic',
      name: 'Pare-feu de base',
      icon: <Shield className="h-5 w-5 text-orange-400" />,
      description: 'Filtre le trafic réseau entrant et sortant selon des règles simples.',
      category: 'firewall',
      power: 3,
      cost: 2,
      compatibility: ['auth-basic', 'monitoring-ids', 'segmentation-vlan']
    },
    {
      id: 'firewall-advanced',
      name: 'Pare-feu avancé',
      icon: <ShieldAlert className="h-5 w-5 text-red-400" />,
      description: 'Pare-feu de nouvelle génération avec inspection approfondie des paquets.',
      category: 'firewall',
      power: 7,
      cost: 6,
      compatibility: ['auth-mfa', 'monitoring-siem', 'segmentation-micro']
    },
    {
      id: 'auth-basic',
      name: 'Authentification simple',
      icon: <User className="h-5 w-5 text-blue-400" />,
      description: 'Système d\'authentification par mot de passe standard.',
      category: 'authentication',
      power: 2,
      cost: 1,
      compatibility: ['firewall-basic', 'monitoring-ids']
    },
    {
      id: 'auth-mfa',
      name: 'Authentification MFA',
      icon: <Lock className="h-5 w-5 text-green-400" />,
      description: 'Authentification à plusieurs facteurs (MFA) pour une sécurité renforcée.',
      category: 'authentication',
      power: 6,
      cost: 4,
      compatibility: ['firewall-advanced', 'monitoring-siem']
    },
    {
      id: 'segmentation-vlan',
      name: 'Segmentation VLAN',
      icon: <Layers className="h-5 w-5 text-purple-400" />,
      description: 'Division du réseau en segments logiques isolés.',
      category: 'segmentation',
      power: 4,
      cost: 3,
      compatibility: ['firewall-basic', 'monitoring-ids']
    },
    {
      id: 'segmentation-micro',
      name: 'Micro-segmentation',
      icon: <Database className="h-5 w-5 text-indigo-400" />,
      description: 'Segmentation fine au niveau des charges de travail individuelles.',
      category: 'segmentation',
      power: 8,
      cost: 7,
      compatibility: ['firewall-advanced', 'monitoring-siem']
    },
    {
      id: 'monitoring-ids',
      name: 'Système de détection d\'intrusion',
      icon: <Eye className="h-5 w-5 text-yellow-400" />,
      description: 'Surveille le trafic réseau pour détecter les activités suspectes.',
      category: 'monitoring',
      power: 5,
      cost: 4,
      compatibility: ['firewall-basic', 'auth-basic', 'segmentation-vlan']
    },
    {
      id: 'monitoring-siem',
      name: 'SIEM',
      icon: <Server className="h-5 w-5 text-cyan-400" />,
      description: 'Système de gestion des informations et des événements de sécurité.',
      category: 'monitoring',
      power: 9,
      cost: 8,
      compatibility: ['firewall-advanced', 'auth-mfa', 'segmentation-micro']
    },
  ];

  // Fonction pour obtenir la couleur selon la difficulté
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-700/20 text-green-500';
      case 'intermediate': return 'bg-blue-700/20 text-blue-500';
      case 'advanced': return 'bg-orange-700/20 text-orange-500';
      case 'expert': return 'bg-red-700/20 text-red-500';
      default: return 'bg-gray-700/20 text-gray-500';
    }
  };

  // Fonction pour obtenir la couleur selon la catégorie du composant
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'firewall': return 'bg-orange-700/20 text-orange-500';
      case 'authentication': return 'bg-green-700/20 text-green-500';
      case 'segmentation': return 'bg-purple-700/20 text-purple-500';
      case 'monitoring': return 'bg-blue-700/20 text-blue-500';
      default: return 'bg-gray-700/20 text-gray-500';
    }
  };

  // Gestion du lancement d'un niveau
  const handleStartLevel = (levelId: string) => {
    setSelectedLevel(levelId);
    setActiveTab('play');
  };

  return (
    <HomeLayout>
      <PageTitle title="Firewall Tactique - Architecture défensive" />
      
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900">
        {/* Contenu principal */}
        <div className="container mx-auto p-4 relative z-10">
          {/* En-tête */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start">
            <div>
              <Link href="/cyber/arcade">
                <Button variant="ghost" className="text-indigo-300 hover:text-indigo-100 p-0 mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour à Cyber Arcade
                </Button>
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
                <Network className="mr-2 h-8 w-8 text-indigo-400" />
                Firewall Tactique
              </h1>
              <p className="text-indigo-200 max-w-3xl">
                Construisez une architecture réseau sécurisée en plaçant stratégiquement les composants de défense
                pour contrer différents types d'attaques informatiques.
              </p>
            </div>
          </div>

          {/* Onglets principaux */}
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-indigo-500/30 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-indigo-500/20">
                <TabsList className="bg-transparent border-b border-indigo-500/20 rounded-none w-full justify-start h-auto p-0">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-indigo-950/60 data-[state=active]:text-white data-[state=active]:shadow-none py-3 px-5 rounded-none text-gray-400"
                  >
                    Présentation
                  </TabsTrigger>
                  <TabsTrigger
                    value="levels"
                    className="data-[state=active]:bg-indigo-950/60 data-[state=active]:text-white data-[state=active]:shadow-none py-3 px-5 rounded-none text-gray-400"
                  >
                    Niveaux
                  </TabsTrigger>
                  <TabsTrigger
                    value="components"
                    className="data-[state=active]:bg-indigo-950/60 data-[state=active]:text-white data-[state=active]:shadow-none py-3 px-5 rounded-none text-gray-400"
                  >
                    Composants
                  </TabsTrigger>
                  <TabsTrigger
                    value="play"
                    className="data-[state=active]:bg-indigo-950/60 data-[state=active]:text-white data-[state=active]:shadow-none py-3 px-5 rounded-none text-gray-400"
                    disabled={!selectedLevel}
                  >
                    Jouer
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                {/* Onglet Présentation */}
                <TabsContent value="overview" className="m-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-indigo-950/40 border-indigo-500/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Network className="mr-2 h-5 w-5 text-indigo-400" />
                          Concept du jeu
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-indigo-100">
                        <p className="mb-4">
                          Firewall Tactique est un jeu stratégique de défense réseau où vous devez positionner judicieusement
                          différents composants de sécurité (pare-feu, systèmes d'authentification, segmentation réseau, etc.)
                          pour protéger votre infrastructure contre des attaques informatiques.
                        </p>
                        <p>
                          Avant le lancement d'une attaque simulée, vous devrez construire votre architecture défensive en
                          plaçant des composants sur une grille représentant votre réseau. Les combinaisons stratégiques
                          de composants offriront des bonus de protection supplémentaires.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-indigo-950/40 border-indigo-500/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Server className="mr-2 h-5 w-5 text-indigo-400" />
                          Fonctionnement
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-indigo-100">
                        <div className="flex">
                          <div className="bg-indigo-900/40 rounded-full p-1 mr-3 h-7 w-7 flex-shrink-0 flex items-center justify-center text-indigo-200">1</div>
                          <p>Analysez les informations sur la menace attendue pour le niveau.</p>
                        </div>
                        <div className="flex">
                          <div className="bg-indigo-900/40 rounded-full p-1 mr-3 h-7 w-7 flex-shrink-0 flex items-center justify-center text-indigo-200">2</div>
                          <p>Sélectionnez et placez stratégiquement vos composants de sécurité sur la grille.</p>
                        </div>
                        <div className="flex">
                          <div className="bg-indigo-900/40 rounded-full p-1 mr-3 h-7 w-7 flex-shrink-0 flex items-center justify-center text-indigo-200">3</div>
                          <p>Lancez la simulation d'attaque pour voir si votre défense résiste.</p>
                        </div>
                        <div className="flex">
                          <div className="bg-indigo-900/40 rounded-full p-1 mr-3 h-7 w-7 flex-shrink-0 flex items-center justify-center text-indigo-200">4</div>
                          <p>Recevez une évaluation détaillée et des conseils d'amélioration.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-indigo-950/40 border-indigo-500/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <CheckCircle className="mr-2 h-5 w-5 text-indigo-400" />
                        Objectifs d'apprentissage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-indigo-900/20 p-4 rounded-lg">
                          <h3 className="font-medium text-indigo-300 mb-2">Architecture réseau</h3>
                          <p className="text-indigo-100 text-sm">
                            Comprendre les principes fondamentaux d'une architecture réseau sécurisée et les bonnes pratiques de conception.
                          </p>
                        </div>
                        <div className="bg-indigo-900/20 p-4 rounded-lg">
                          <h3 className="font-medium text-indigo-300 mb-2">Défense en profondeur</h3>
                          <p className="text-indigo-100 text-sm">
                            Maîtriser le concept de défense en profondeur avec plusieurs couches de protection complémentaires.
                          </p>
                        </div>
                        <div className="bg-indigo-900/20 p-4 rounded-lg">
                          <h3 className="font-medium text-indigo-300 mb-2">Contre-mesures</h3>
                          <p className="text-indigo-100 text-sm">
                            Identifier les contre-mesures appropriées pour différents types d'attaques et de menaces.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <p className="text-indigo-200 text-sm">
                        <AlertCircle className="h-4 w-4 inline mr-2" />
                        L'objectif est de vous faire penser comme un architecte sécurité, capable d'anticiper et de contrer les menaces.
                      </p>
                    </CardFooter>
                  </Card>

                  <div className="flex justify-center mt-6">
                    <Button onClick={() => setActiveTab("levels")} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      Voir les niveaux disponibles
                    </Button>
                  </div>
                </TabsContent>

                {/* Onglet Niveaux */}
                <TabsContent value="levels" className="m-0">
                  <div className="grid gap-6">
                    {levels.map((level) => (
                      <motion.div
                        key={level.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className={`border ${level.locked ? 'bg-gray-900/40 border-gray-700/30' : 'bg-indigo-950/40 border-indigo-500/20'}`}>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                              <CardTitle className={`text-xl ${level.locked ? 'text-gray-400' : 'text-white'}`}>{level.name}</CardTitle>
                              <CardDescription className={level.locked ? 'text-gray-500' : 'text-indigo-200'}>
                                {level.description}
                              </CardDescription>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(level.difficulty)}`}>
                              {level.difficulty === 'beginner' ? 'Débutant' : 
                               level.difficulty === 'intermediate' ? 'Intermédiaire' : 
                               level.difficulty === 'advanced' ? 'Avancé' : 'Expert'}
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4">
                            {level.locked ? (
                              <div className="flex items-center text-gray-500">
                                <AlertCircle className="h-5 w-5 mr-2" />
                                <span>Terminez les niveaux précédents pour débloquer ce niveau</span>
                              </div>
                            ) : level.completed ? (
                              <div className="flex items-center text-green-400">
                                <CheckCircle className="h-5 w-5 mr-2" />
                                <span>Niveau complété</span>
                              </div>
                            ) : (
                              <div className="text-indigo-100">
                                <p>Ce niveau vous apprendra à :</p>
                                {level.id === 'level1' && (
                                  <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Comprendre les bases de la sécurité périmétrique</li>
                                    <li>Utiliser efficacement un pare-feu de base</li>
                                    <li>Mettre en place une authentification simple</li>
                                  </ul>
                                )}
                                {level.id === 'level2' && (
                                  <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Segmenter un réseau en zones de sécurité</li>
                                    <li>Implémenter des VLANs de manière sécurisée</li>
                                    <li>Limiter la propagation d'une attaque sur le réseau</li>
                                  </ul>
                                )}
                                {level.id === 'level3' && (
                                  <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Appliquer le principe de défense en profondeur</li>
                                    <li>Combiner plusieurs technologies de protection</li>
                                    <li>Créer des synergies entre composants de sécurité</li>
                                  </ul>
                                )}
                                {level.id === 'level4' && (
                                  <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Mettre en place une surveillance réseau efficace</li>
                                    <li>Détecter les intrusions en temps réel</li>
                                    <li>Réagir automatiquement aux menaces détectées</li>
                                  </ul>
                                )}
                                {level.id === 'level5' && (
                                  <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Contrer des attaques sophistiquées et persistantes</li>
                                    <li>Protéger contre les techniques d'évasion avancées</li>
                                    <li>Construire une architecture de sécurité résiliente</li>
                                  </ul>
                                )}
                              </div>
                            )}
                          </CardContent>
                          <CardFooter>
                            {!level.locked && (
                              <Button 
                                className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                                onClick={() => handleStartLevel(level.id)}
                              >
                                {level.completed ? 'Rejouer le niveau' : 'Commencer le niveau'}
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                {/* Onglet Composants */}
                <TabsContent value="components" className="m-0">
                  <Alert className="mb-6 bg-indigo-900/20 border-indigo-500/30 text-indigo-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Astuce</AlertTitle>
                    <AlertDescription>
                      Combiner des composants compatibles offre des bonus de protection supplémentaires. Étudiez bien les compatibilités!
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {securityComponents.map((component) => (
                      <Card key={component.id} className="bg-slate-900/80 border-indigo-500/20">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="mr-2 p-2 rounded-full bg-indigo-950">
                                {component.icon}
                              </div>
                              <CardTitle className="text-lg text-white">{component.name}</CardTitle>
                            </div>
                            <Badge className={getCategoryColor(component.category)}>
                              {component.category === 'firewall' ? 'Pare-feu' : 
                               component.category === 'authentication' ? 'Authentification' : 
                               component.category === 'segmentation' ? 'Segmentation' : 
                               component.category === 'monitoring' ? 'Surveillance' : 'Autre'}
                            </Badge>
                          </div>
                          <CardDescription className="text-indigo-200 mt-1">
                            {component.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-indigo-900/20 p-2 rounded-lg">
                              <span className="text-indigo-300 font-medium">Puissance:</span>
                              <div className="mt-1 flex items-center">
                                <div className="h-2 flex-1 bg-slate-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-indigo-500 rounded-full"
                                    style={{ width: `${component.power * 10}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-white">{component.power}/10</span>
                              </div>
                            </div>
                            <div className="bg-indigo-900/20 p-2 rounded-lg">
                              <span className="text-indigo-300 font-medium">Coût:</span>
                              <div className="mt-1 flex items-center">
                                <div className="h-2 flex-1 bg-slate-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-amber-500 rounded-full"
                                    style={{ width: `${component.cost * 10}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-white">{component.cost}/10</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4">
                            <span className="text-indigo-300 text-sm font-medium">Compatible avec:</span>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {component.compatibility.map(compId => {
                                const compat = securityComponents.find(c => c.id === compId);
                                return compat ? (
                                  <TooltipProvider key={compId}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge variant="outline" className="border-indigo-500/30 text-indigo-200">
                                          <div className="mr-1">{compat.icon}</div>
                                          {compat.name}
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">{compat.description}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Onglet Jouer */}
                <TabsContent value="play" className="m-0">
                  {selectedLevel && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">
                          {levels.find(l => l.id === selectedLevel)?.name || 'Niveau'}
                        </h2>
                        <Button variant="outline" onClick={() => setActiveTab("levels")} className="text-indigo-300 border-indigo-500/30">
                          Retour aux niveaux
                        </Button>
                      </div>
                      
                      <Alert className="mb-6 bg-indigo-900/20 border-indigo-500/30 text-indigo-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Objectif</AlertTitle>
                        <AlertDescription>
                          {selectedLevel === 'level1' && 'Protégez le réseau contre une attaque de force brute et une tentative d\'intrusion basique.'}
                          {selectedLevel === 'level2' && 'Empêchez la propagation latérale d\'une attaque en segmentant correctement votre réseau.'}
                          {selectedLevel === 'level3' && 'Créez une défense en profondeur pour contrer plusieurs vecteurs d\'attaque simultanés.'}
                          {selectedLevel === 'level4' && 'Détectez et bloquez une intrusion en temps réel en combinant surveillance et défense active.'}
                          {selectedLevel === 'level5' && 'Défendez-vous contre une APT (Advanced Persistent Threat) sophistiquée utilisant plusieurs techniques.'}
                        </AlertDescription>
                      </Alert>
                      
                      {/* Intégration du tableau de jeu */}
                      <DefenseBoard 
                        levelId={selectedLevel} 
                        availableComponents={securityComponents}
                      />
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}