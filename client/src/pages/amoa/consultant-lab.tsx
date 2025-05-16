import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart, Archive, Briefcase, Clock, CheckCircle2, PieChart, FileText, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

export default function ConsultantLab() {
  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-950 to-gray-900 pt-16 pb-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/amoa/new">
                <Button variant="outline" className="bg-purple-900/30 text-white border-purple-800/50 hover:bg-purple-800/40">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
              </Link>
              <PageTitle title="CONSULTANT LAB" />
            </div>
          </div>

          {/* Description du module */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 max-w-3xl"
          >
            <h2 className="text-2xl font-bold mb-3">Environnement d'apprentissage pour l'analyse et la transformation métier</h2>
            <p className="text-purple-200 mb-4">
              Développez vos compétences d'analyse avec des exercices pratiques et interactifs. 
              Ce laboratoire vous permet d'explorer les méthodes et outils utilisés par les consultants 
              mc2i pour analyser les besoins métier et concevoir des solutions innovantes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-purple-700 hover:bg-purple-600">Analyse métier</Badge>
              <Badge className="bg-purple-700 hover:bg-purple-600">Cadrage de solution</Badge>
              <Badge className="bg-purple-700 hover:bg-purple-600">Ateliers clients</Badge>
              <Badge className="bg-purple-700 hover:bg-purple-600">Innovation</Badge>
            </div>
          </motion.div>

          {/* Tabs pour les différentes sections */}
          <Tabs defaultValue="exercices" className="mb-10">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 bg-purple-950/50">
              <TabsTrigger value="exercices" className="data-[state=active]:bg-purple-800">Exercices</TabsTrigger>
              <TabsTrigger value="techniques" className="data-[state=active]:bg-purple-800">Techniques</TabsTrigger>
              <TabsTrigger value="ressources" className="data-[state=active]:bg-purple-800">Ressources</TabsTrigger>
            </TabsList>
            
            <TabsContent value="exercices" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Exercice 1 */}
                <Card className="bg-gradient-to-br from-purple-900/80 to-purple-950/90 border border-purple-800/30 backdrop-blur-sm hover:shadow-lg hover:border-purple-700/50 transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 shadow-md">
                        <BarChart className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-center text-xl font-bold">Analyse des besoins</CardTitle>
                    <CardDescription className="text-center text-purple-300">
                      Simulation d'atelier de recueil
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <ul className="mb-6 text-sm text-purple-200 flex flex-col gap-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0" />
                        <span>Interview des parties prenantes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0" />
                        <span>Identification des besoins clés</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0" />
                        <span>Formalisation des exigences</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-400 flex-shrink-0" />
                        <span>45 minutes environ</span>
                      </li>
                    </ul>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                      Démarrer l'exercice
                    </Button>
                  </CardContent>
                </Card>

                {/* Exercice 2 */}
                <Card className="bg-gradient-to-br from-purple-900/80 to-purple-950/90 border border-purple-800/30 backdrop-blur-sm hover:shadow-lg hover:border-purple-700/50 transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-700 shadow-md">
                        <Archive className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-center text-xl font-bold">Modélisation de processus</CardTitle>
                    <CardDescription className="text-center text-purple-300">
                      Cartographie et optimisation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <ul className="mb-6 text-sm text-purple-200 flex flex-col gap-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0" />
                        <span>Création de diagrammes BPMN</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0" />
                        <span>Analyse des flux de travail</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0" />
                        <span>Optimisation des processus</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-400 flex-shrink-0" />
                        <span>60 minutes environ</span>
                      </li>
                    </ul>
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white">
                      Explorer les processus
                    </Button>
                  </CardContent>
                </Card>

                {/* Exercice 3 */}
                <Card className="bg-gradient-to-br from-purple-900/80 to-purple-950/90 border border-purple-800/30 backdrop-blur-sm hover:shadow-lg hover:border-purple-700/50 transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 shadow-md">
                        <Briefcase className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-center text-xl font-bold">Étude de cas client</CardTitle>
                    <CardDescription className="text-center text-purple-300">
                      Résolution de problèmes complexes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <ul className="mb-6 text-sm text-purple-200 flex flex-col gap-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0" />
                        <span>Analyse de cas réels</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0" />
                        <span>Élaboration de solutions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-400 flex-shrink-0" />
                        <span>Présentation au client</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-400 flex-shrink-0" />
                        <span>90 minutes environ</span>
                      </li>
                    </ul>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white">
                      Résoudre le cas
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="techniques" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Technique 1 */}
                <Card className="bg-gradient-to-br from-purple-900/80 to-purple-950/90 border border-purple-800/30 backdrop-blur-sm hover:shadow-lg hover:border-purple-700/50 transition-all">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-400" />
                      Design Thinking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-200 mb-4">
                      Méthodologie centrée utilisateur pour résoudre les problèmes complexes et innovants.
                      Apprendre à utiliser l'empathie, la définition, l'idéation, le prototypage et les tests.
                    </p>
                    <Button variant="outline" className="w-full bg-purple-900/30 border-purple-800/50 hover:bg-purple-800/40 text-white">
                      Découvrir la technique
                    </Button>
                  </CardContent>
                </Card>

                {/* Technique 2 */}
                <Card className="bg-gradient-to-br from-purple-900/80 to-purple-950/90 border border-purple-800/30 backdrop-blur-sm hover:shadow-lg hover:border-purple-700/50 transition-all">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-blue-400" />
                      Analyse d'impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-200 mb-4">
                      Évaluation des effets potentiels d'un changement ou d'un projet sur l'organisation.
                      Techniques pour identifier les risques, les opportunités et les parties prenantes.
                    </p>
                    <Button variant="outline" className="w-full bg-purple-900/30 border-purple-800/50 hover:bg-purple-800/40 text-white">
                      Explorer l'analyse
                    </Button>
                  </CardContent>
                </Card>

                {/* Technique 3 */}
                <Card className="bg-gradient-to-br from-purple-900/80 to-purple-950/90 border border-purple-800/30 backdrop-blur-sm hover:shadow-lg hover:border-purple-700/50 transition-all">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-400" />
                      Ateliers collaboratifs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-200 mb-4">
                      Méthodes pour animer des ateliers interactifs avec les parties prenantes.
                      Techniques de facilitation, d'idéation et de prise de décision en groupe.
                    </p>
                    <Button variant="outline" className="w-full bg-purple-900/30 border-purple-800/50 hover:bg-purple-800/40 text-white">
                      Apprendre les techniques
                    </Button>
                  </CardContent>
                </Card>

                {/* Technique 4 */}
                <Card className="bg-gradient-to-br from-purple-900/80 to-purple-950/90 border border-purple-800/30 backdrop-blur-sm hover:shadow-lg hover:border-purple-700/50 transition-all">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-red-400" />
                      Analyse des données
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-200 mb-4">
                      Méthodes pour collecter, analyser et interpréter les données des clients.
                      Techniques pour extraire des insights actionnables et appuyer la prise de décision.
                    </p>
                    <Button variant="outline" className="w-full bg-purple-900/30 border-purple-800/50 hover:bg-purple-800/40 text-white">
                      Maîtriser l'analyse
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="ressources" className="mt-6">
              <div className="bg-purple-950/50 border border-purple-900/30 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Ressources et modèles</h3>
                <p className="text-purple-200 mb-6">
                  Bibliothèque de ressources, modèles et outils pour vous aider dans vos missions AMOA.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="bg-purple-900/30 border-purple-800/50 hover:bg-purple-800/40 text-white justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Template d'analyse des besoins
                  </Button>
                  <Button variant="outline" className="bg-purple-900/30 border-purple-800/50 hover:bg-purple-800/40 text-white justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Modèle de cartographie processus
                  </Button>
                  <Button variant="outline" className="bg-purple-900/30 border-purple-800/50 hover:bg-purple-800/40 text-white justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Guide d'atelier collaboratif
                  </Button>
                  <Button variant="outline" className="bg-purple-900/30 border-purple-800/50 hover:bg-purple-800/40 text-white justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Questionnaire d'interview client
                  </Button>
                  <Button variant="outline" className="bg-purple-900/30 border-purple-800/50 hover:bg-purple-800/40 text-white justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Template étude d'opportunité
                  </Button>
                  <Button variant="outline" className="bg-purple-900/30 border-purple-800/50 hover:bg-purple-800/40 text-white justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Modèle de présentation client
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Call to action */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-10"
          >
            <h3 className="text-xl font-bold mb-3">Prêt à devenir un expert de l'analyse métier ?</h3>
            <p className="text-purple-200 mb-6 max-w-2xl mx-auto">
              Commencez votre parcours dès maintenant en choisissant un exercice ou une technique à explorer.
              Développez vos compétences et devenez un consultant AMOA de premier plan.
            </p>
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white px-8">
              Commencer l'exploration
            </Button>
          </motion.div>
        </div>
      </div>
    </HomeLayout>
  );
}