import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, AlertCircle, Code, Server, CheckCircle, BookOpen } from 'lucide-react';
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

// Types
interface Level {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  completed: boolean;
  locked: boolean;
}

export default function CodeShield() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Niveaux du jeu basés sur la description fournie
  const levels: Level[] = [
    {
      id: 'signatures',
      name: 'Niveau 1 - Signatures',
      description: 'Apprenez à reconnaître les menaces les plus simples à l\'aide de signatures et d\'empreintes numériques.',
      difficulty: 'beginner',
      completed: false,
      locked: false,
    },
    {
      id: 'static-analysis',
      name: 'Niveau 2 - Analyse statique',
      description: 'Identifiez les logiciels malveillants en repérant des motifs suspects dans leur contenu.',
      difficulty: 'beginner',
      completed: false,
      locked: true,
    },
    {
      id: 'behavioral-analysis',
      name: 'Niveau 3 - Comportement suspect',
      description: 'Observez ce que fait un fichier plutôt que ce qu\'il contient pour détecter les comportements typiques d\'un virus.',
      difficulty: 'intermediate',
      completed: false,
      locked: true,
    },
    {
      id: 'sandbox',
      name: 'Niveau 4 - Sandbox',
      description: 'Simulez l\'exécution de fichiers dans un environnement protégé pour observer leurs effets sans risque.',
      difficulty: 'advanced',
      completed: false,
      locked: true,
    },
    {
      id: 'polymorphic',
      name: 'Niveau 5 - Virus polymorphe',
      description: 'Affrontez un virus qui change de forme à chaque partie et créez des règles intelligentes pour le détecter.',
      difficulty: 'expert',
      completed: false,
      locked: true,
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

  return (
    <HomeLayout>
      <PageTitle title="CodeShield - Créez votre propre antivirus" />
      
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
        {/* Contenu principal */}
        <div className="container mx-auto p-4 relative z-10">
          {/* En-tête */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start">
            <div>
              <Link href="/cyber/arcade">
                <Button variant="ghost" className="text-blue-300 hover:text-blue-100 p-0 mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour à Cyber Arcade
                </Button>
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center">
                <Shield className="mr-2 h-8 w-8 text-blue-400" />
                CodeShield
              </h1>
              <p className="text-blue-200 max-w-3xl">
                Devenez un expert en cybersécurité en créant votre propre antivirus. Apprenez à détecter,
                bloquer et neutraliser des malwares de plus en plus sophistiqués.
              </p>
            </div>
          </div>

          {/* Onglets principaux */}
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-blue-500/20">
                <TabsList className="bg-transparent border-b border-blue-500/20 rounded-none w-full justify-start h-auto p-0">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-blue-950/60 data-[state=active]:text-white data-[state=active]:shadow-none py-3 px-5 rounded-none text-gray-400"
                  >
                    Présentation
                  </TabsTrigger>
                  <TabsTrigger
                    value="levels"
                    className="data-[state=active]:bg-blue-950/60 data-[state=active]:text-white data-[state=active]:shadow-none py-3 px-5 rounded-none text-gray-400"
                  >
                    Niveaux
                  </TabsTrigger>
                  <TabsTrigger
                    value="lab"
                    className="data-[state=active]:bg-blue-950/60 data-[state=active]:text-white data-[state=active]:shadow-none py-3 px-5 rounded-none text-gray-400"
                  >
                    Laboratoire
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                {/* Onglet Présentation */}
                <TabsContent value="overview" className="m-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-blue-950/40 border-blue-500/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Shield className="mr-2 h-5 w-5 text-blue-400" />
                          Concept du jeu
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-blue-100">
                        <p className="mb-4">
                          CodeShield est un jeu pédagogique et immersif dans lequel vous incarnez un analyste en
                          cybersécurité chargé de construire un antivirus personnalisé. Au fil des niveaux, vous apprendrez
                          à détecter, bloquer et neutraliser des malwares de plus en plus sophistiqués.
                        </p>
                        <p>
                          Guidé(e) par une intelligence artificielle, vous développerez des compétences essentielles
                          en cybersécurité tout en relevant des défis progressifs.
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-950/40 border-blue-500/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Server className="mr-2 h-5 w-5 text-blue-400" />
                          Fonctionnement
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-blue-100">
                        <div className="flex">
                          <div className="bg-blue-900/40 rounded-full p-1 mr-3 h-7 w-7 flex-shrink-0 flex items-center justify-center text-blue-200">1</div>
                          <p>Recevez une liste de fichiers simulés, certains sont sains, d'autres infectés.</p>
                        </div>
                        <div className="flex">
                          <div className="bg-blue-900/40 rounded-full p-1 mr-3 h-7 w-7 flex-shrink-0 flex items-center justify-center text-blue-200">2</div>
                          <p>Créez des règles de détection simplifiées pour repérer les logiciels malveillants.</p>
                        </div>
                        <div className="flex">
                          <div className="bg-blue-900/40 rounded-full p-1 mr-3 h-7 w-7 flex-shrink-0 flex items-center justify-center text-blue-200">3</div>
                          <p>Lancez une analyse simulée comme le ferait un vrai antivirus.</p>
                        </div>
                        <div className="flex">
                          <div className="bg-blue-900/40 rounded-full p-1 mr-3 h-7 w-7 flex-shrink-0 flex items-center justify-center text-blue-200">4</div>
                          <p>Recevez un score et des conseils d'amélioration de l'IA experte.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-blue-950/40 border-blue-500/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <CheckCircle className="mr-2 h-5 w-5 text-blue-400" />
                        Objectifs d'apprentissage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-900/20 p-4 rounded-lg">
                          <h3 className="font-medium text-blue-300 mb-2">Comprendre</h3>
                          <p className="text-blue-100 text-sm">
                            Maîtriser les mécanismes de base d'un antivirus et les différentes stratégies de détection.
                          </p>
                        </div>
                        <div className="bg-blue-900/20 p-4 rounded-lg">
                          <h3 className="font-medium text-blue-300 mb-2">Identifier</h3>
                          <p className="text-blue-100 text-sm">
                            Reconnaître différentes formes de menaces numériques et leurs caractéristiques spécifiques.
                          </p>
                        </div>
                        <div className="bg-blue-900/20 p-4 rounded-lg">
                          <h3 className="font-medium text-blue-300 mb-2">Créer</h3>
                          <p className="text-blue-100 text-sm">
                            Élaborer une stratégie de défense cohérente et efficace contre diverses menaces.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <p className="text-blue-200 text-sm">
                        <AlertCircle className="h-4 w-4 inline mr-2" />
                        L'objectif final est de vous faire penser comme un analyste en cybersécurité, pas comme un simple utilisateur.
                      </p>
                    </CardFooter>
                  </Card>

                  <div className="flex justify-center mt-6">
                    <Button onClick={() => setActiveTab("levels")} className="bg-blue-600 hover:bg-blue-700 text-white">
                      Commencer l'aventure
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
                        <Card className={`border ${level.locked ? 'bg-gray-900/40 border-gray-700/30' : 'bg-blue-950/40 border-blue-500/20'}`}>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                              <CardTitle className={`text-xl ${level.locked ? 'text-gray-400' : 'text-white'}`}>{level.name}</CardTitle>
                              <CardDescription className={level.locked ? 'text-gray-500' : 'text-blue-200'}>
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
                              <div className="text-blue-100">
                                <p>Ce niveau vous apprendra à :</p>
                                {level.id === 'signatures' && (
                                  <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Reconnaître les signatures de malwares connus</li>
                                    <li>Utiliser des empreintes numériques pour identifier les menaces</li>
                                    <li>Comprendre les limites de la détection par signature</li>
                                  </ul>
                                )}
                                {level.id === 'static-analysis' && (
                                  <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Analyser le contenu des fichiers sans les exécuter</li>
                                    <li>Repérer des motifs suspects dans le code</li>
                                    <li>Filtrer les faux positifs</li>
                                  </ul>
                                )}
                                {level.id === 'behavioral-analysis' && (
                                  <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Observer les actions réalisées par un fichier</li>
                                    <li>Identifier les comportements typiques d'un virus</li>
                                    <li>Détecter les activités suspectes même si le code est caché</li>
                                  </ul>
                                )}
                                {level.id === 'sandbox' && (
                                  <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Utiliser un environnement isolé pour tester des fichiers</li>
                                    <li>Analyser les effets d'un logiciel potentiellement malveillant</li>
                                    <li>Détecter les tentatives d'évasion de sandbox</li>
                                  </ul>
                                )}
                                {level.id === 'polymorphic' && (
                                  <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Comprendre comment les virus polymorphes changent de forme</li>
                                    <li>Créer des règles de détection avancées et adaptatives</li>
                                    <li>Appliquer toutes vos connaissances pour vaincre les menaces évolutives</li>
                                  </ul>
                                )}
                              </div>
                            )}
                          </CardContent>
                          <CardFooter>
                            <Button
                              className={`${level.locked ? 'bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                              disabled={level.locked}
                            >
                              {level.completed ? 'Rejouer' : 'Commencer'}
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                {/* Onglet Laboratoire (fonctionnalité à venir) */}
                <TabsContent value="lab" className="m-0">
                  <Card className="bg-blue-950/40 border-blue-500/20">
                    <CardHeader>
                      <CardTitle className="text-white">Laboratoire d'expérimentation</CardTitle>
                      <CardDescription className="text-blue-200">
                        Un espace pour créer et tester votre propre antivirus
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="bg-blue-900/20 p-6 rounded-lg text-center max-w-md">
                        <Code className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">Fonctionnalité à venir</h3>
                        <p className="text-blue-200 mb-4">
                          Le laboratoire d'expérimentation vous permettra de créer librement votre propre système de détection
                          et de le tester contre des vagues de menaces générées par l'IA.
                        </p>
                        <p className="text-blue-300 text-sm">
                          Terminez les 5 niveaux du jeu pour débloquer cette fonctionnalité.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}