import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, BookText, Layers, FileText, Clock, CheckCircle2, ScrollText, PieChart, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

export default function MciiAcademie() {
  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-indigo-950 to-gray-900 pt-16 pb-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/amoa/new">
                <Button variant="outline" className="bg-indigo-900/30 text-white border-indigo-800/50 hover:bg-indigo-800/40">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
              </Link>
              <PageTitle title="mc2i ACADEMIE" />
            </div>
          </div>

          {/* Description du module */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 max-w-3xl"
          >
            <h2 className="text-2xl font-bold mb-3">Centre de formation aux méthodologies et outils de gestion de projet</h2>
            <p className="text-indigo-200 mb-4">
              Maîtrisez les bonnes pratiques, méthodologies agiles et gestion documentaire essentielles 
              à la conduite de projets de transformation numérique. Apprenez les techniques et outils utilisés 
              par les consultants mc2i pour gérer efficacement les projets clients.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-indigo-700 hover:bg-indigo-600">Gestion de projet</Badge>
              <Badge className="bg-indigo-700 hover:bg-indigo-600">Méthodologies Agiles</Badge>
              <Badge className="bg-indigo-700 hover:bg-indigo-600">Documentation</Badge>
              <Badge className="bg-indigo-700 hover:bg-indigo-600">Planification</Badge>
            </div>
          </motion.div>

          {/* Votre progression */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10 bg-indigo-950/50 border border-indigo-900/30 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold mb-4">Votre progression</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-indigo-200">Fondamentaux de gestion de projet</span>
                  <span className="text-sm font-medium text-indigo-300">0%</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-indigo-200">Méthodologies Agiles</span>
                  <span className="text-sm font-medium text-indigo-300">0%</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-indigo-200">Documentation et livrables</span>
                  <span className="text-sm font-medium text-indigo-300">0%</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
            </div>
          </motion.div>

          {/* Parcours de formation */}
          <h3 className="text-xl font-bold mb-6">Parcours de formation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            {/* Module 1 */}
            <Card className="bg-gradient-to-br from-indigo-900/80 to-indigo-950/90 border border-indigo-800/30 backdrop-blur-sm hover:shadow-lg hover:border-indigo-700/50 transition-all">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-md">
                    <BookText className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-center text-xl font-bold">Fondamentaux de gestion de projet</CardTitle>
                <CardDescription className="text-center text-indigo-300">
                  Principes et concepts essentiels
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="mb-6 text-sm text-indigo-200 flex flex-col gap-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    <span>Cycle de vie des projets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    <span>Gestion des parties prenantes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    <span>Planification et estimation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    <span>3 heures de formation</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white">
                  Commencer le module
                </Button>
              </CardContent>
            </Card>

            {/* Module 2 */}
            <Card className="bg-gradient-to-br from-indigo-900/80 to-indigo-950/90 border border-indigo-800/30 backdrop-blur-sm hover:shadow-lg hover:border-indigo-700/50 transition-all">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-700 shadow-md">
                    <Layers className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-center text-xl font-bold">Méthodologies Agiles</CardTitle>
                <CardDescription className="text-center text-indigo-300">
                  Scrum, Kanban et pratiques hybrides
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="mb-6 text-sm text-indigo-200 flex flex-col gap-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    <span>Principes et valeurs agiles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    <span>Mise en œuvre de Scrum</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    <span>Méthodes hybrides mc2i</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    <span>4 heures de formation</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white">
                  Découvrir l'agilité
                </Button>
              </CardContent>
            </Card>

            {/* Module 3 */}
            <Card className="bg-gradient-to-br from-indigo-900/80 to-indigo-950/90 border border-indigo-800/30 backdrop-blur-sm hover:shadow-lg hover:border-indigo-700/50 transition-all">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 shadow-md">
                    <ScrollText className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-center text-xl font-bold">Documentation et livrables</CardTitle>
                <CardDescription className="text-center text-indigo-300">
                  Production de livrables professionnels
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="mb-6 text-sm text-indigo-200 flex flex-col gap-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    <span>Spécifications fonctionnelles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    <span>Cahiers des charges</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    <span>Rapports de tests et recette</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                    <span>3 heures de formation</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white">
                  Explorer les livrables
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Outils de gestion de projet */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-indigo-950/50 border border-indigo-900/30 rounded-xl p-6 max-w-4xl mx-auto"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <ClipboardList className="mr-2 h-5 w-5" />
              Boîte à outils du chef de projet
            </h3>
            <p className="text-indigo-200 mb-6">
              Accédez à une collection d'outils et modèles de documents prêts à l'emploi 
              pour vos projets. Ces ressources ont été conçues selon les meilleures pratiques mc2i.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" className="bg-indigo-900/30 border-indigo-800/50 hover:bg-indigo-800/40 text-white flex items-center justify-center gap-2">
                <FileText className="h-4 w-4" />
                Modèle de cahier des charges
              </Button>
              <Button variant="outline" className="bg-indigo-900/30 border-indigo-800/50 hover:bg-indigo-800/40 text-white flex items-center justify-center gap-2">
                <PieChart className="h-4 w-4" />
                Outil de planification
              </Button>
              <Button variant="outline" className="bg-indigo-900/30 border-indigo-800/50 hover:bg-indigo-800/40 text-white flex items-center justify-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Templates Scrum
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </HomeLayout>
  );
}