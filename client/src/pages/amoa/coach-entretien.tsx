import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, MessageSquare, Award, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

export default function CoachEntretien() {
  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-950 to-gray-900 pt-16 pb-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/amoa/new">
                <Button variant="outline" className="bg-blue-900/30 text-white border-blue-800/50 hover:bg-blue-800/40">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
              </Link>
              <PageTitle title="COACH ENTRETIEN" />
            </div>
          </div>

          {/* Description du module */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 max-w-3xl"
          >
            <h2 className="text-2xl font-bold mb-3">Simulateur d'entretiens clients intelligent</h2>
            <p className="text-blue-200 mb-4">
              Préparez-vous aux situations d'entretien avec clients grâce à notre simulateur alimenté par l'IA. 
              Entraînez-vous à poser les bonnes questions, à identifier les besoins client et à proposer des solutions 
              adaptées dans différents contextes métier.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-blue-700 hover:bg-blue-600">Entretien client</Badge>
              <Badge className="bg-blue-700 hover:bg-blue-600">Compétences métier</Badge>
              <Badge className="bg-blue-700 hover:bg-blue-600">Collecte de besoins</Badge>
              <Badge className="bg-blue-700 hover:bg-blue-600">Intelligence artificielle</Badge>
            </div>
          </motion.div>

          {/* Types de simulation d'entretien */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
            {/* Mode classique */}
            <Card className="bg-gradient-to-br from-blue-900/80 to-blue-950/90 border border-blue-800/30 backdrop-blur-sm hover:shadow-lg hover:border-blue-700/50 transition-all">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-center text-xl font-bold">Mode Classique</CardTitle>
                <CardDescription className="text-center text-blue-300">
                  Entretien standard avec feedback détaillé
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="mb-6 text-sm text-blue-200 flex flex-col gap-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span>Simulation d'entretien réaliste</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span>Personnalisation du profil client</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span>Feedback détaillé après session</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span>15-20 minutes par session</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                  Lancer une simulation
                </Button>
              </CardContent>
            </Card>

            {/* Mode Interactif */}
            <Card className="bg-gradient-to-br from-blue-900/80 to-blue-950/90 border border-blue-800/30 backdrop-blur-sm hover:shadow-lg hover:border-blue-700/50 transition-all">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-md">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-center text-xl font-bold">Mode Interactif</CardTitle>
                <CardDescription className="text-center text-blue-300">
                  Dialogue libre avec un client virtuel
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="mb-6 text-sm text-blue-200 flex flex-col gap-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span>Conversation ouverte et naturelle</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span>Adaptation du client à vos questions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span>Suggestion de questions pertinentes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span>Durée libre</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white">
                  Démarrer un dialogue
                </Button>
              </CardContent>
            </Card>

            {/* Mode Évaluation */}
            <Card className="bg-gradient-to-br from-blue-900/80 to-blue-950/90 border border-blue-800/30 backdrop-blur-sm hover:shadow-lg hover:border-blue-700/50 transition-all">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-purple-600 to-violet-700 shadow-md">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-center text-xl font-bold">Mode Évaluation</CardTitle>
                <CardDescription className="text-center text-blue-300">
                  Test de compétences avec scénarios complexes
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="mb-6 text-sm text-blue-200 flex flex-col gap-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span>Scénarios clients difficiles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span>Évaluation de performance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span>Rapport d'analyse détaillé</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span>30 minutes par session</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white">
                  Commencer l'évaluation
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Section historique des simulations */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-blue-950/50 border border-blue-900/30 rounded-xl p-6 max-w-4xl mx-auto"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Historique des simulations
            </h3>
            <p className="text-blue-200 mb-6">
              Vos sessions précédentes seront affichées ici, avec la possibilité de consulter 
              vos performances et d'analyser votre progression au fil du temps.
            </p>
            <div className="text-center py-8">
              <p className="text-blue-300 italic">Aucune simulation terminée pour le moment.</p>
              <p className="text-blue-400 text-sm mt-2">Commencez une nouvelle simulation pour voir vos résultats ici.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </HomeLayout>
  );
}