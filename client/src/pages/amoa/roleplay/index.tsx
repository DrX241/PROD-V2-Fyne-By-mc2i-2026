import React from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, MessageSquare, Award, Clock, CheckCircle2, AlertCircle, Timer, Shuffle, Target, Zap, Briefcase, FileText, Brain, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

export default function AmoaRoleplay() {
  const [_, setLocation] = useLocation();
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
              <PageTitle title="mc2i ROLE PLAY" />
            </div>
          </div>

          {/* Description du module */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 max-w-3xl"
          >
            <h2 className="text-2xl font-bold mb-3">Simulations métier et situations professionnelles interactives</h2>
            <p className="text-blue-200 mb-4">
              Développez vos compétences en entretien client, recrutement et prospection commerciale grâce à notre plateforme
              de jeux de rôle alimentée par l'IA. Entraînez-vous à des situations professionnelles réelles dans un environnement
              sécurisé et recevez des feedbacks personnalisés.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-blue-700 hover:bg-blue-600">Entretien client</Badge>
              <Badge className="bg-blue-700 hover:bg-blue-600">Recrutement</Badge>
              <Badge className="bg-blue-700 hover:bg-blue-600">Prospection commerciale</Badge>
              <Badge className="bg-blue-700 hover:bg-blue-600">Intelligence artificielle</Badge>
            </div>
          </motion.div>

          {/* Types de jeux de rôle */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {/* Préparation d'audition */}
            <Card className="bg-gradient-to-br from-blue-900/80 to-blue-950/90 border border-blue-800/30 backdrop-blur-sm hover:shadow-lg hover:border-blue-700/50 transition-all">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 shadow-md">
                    <Briefcase className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-center text-xl font-bold">Préparation d'audition</CardTitle>
                <CardDescription className="text-center text-blue-300">
                  Simulation d'entretien client pour des missions
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="mb-6 text-sm text-blue-200 flex flex-col gap-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span>Dialogues avec clients réalistes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span>Entraînement à la présentation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span>Feedback détaillé</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span>15-20 minutes par session</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  onClick={() => setLocation('/amoa/interview-simulation')}
                >
                  Commencer une préparation
                </Button>
              </CardContent>
            </Card>



            {/* Prospection Challenge (Ancien ProspectPulse) */}
            <Card className="bg-gradient-to-br from-orange-900/80 to-red-950/90 border border-orange-800/30 backdrop-blur-sm hover:shadow-lg hover:border-orange-700/50 transition-all">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-amber-600 to-red-600 shadow-md">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-center text-xl font-bold">Prospection Challenge</CardTitle>
                <CardDescription className="text-center text-orange-300">
                  Simulation de prospection sous pression
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="mb-6 text-sm text-orange-200 flex flex-col gap-2">
                  <li className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    <span>Chat client imprévu en temps réel</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    <span>Réponses limitées à 20 secondes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shuffle className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    <span>Scénarios et profils clients variés</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-400 flex-shrink-0" />
                    <span>Évaluation des compétences commerciales</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white"
                  onClick={() => setLocation('/amoa/prospect-pulse')}
                >
                  Relever le défi
                </Button>
              </CardContent>
            </Card>

            {/* EXPERT AMOA */}
            <Card className="bg-gradient-to-br from-teal-900/80 to-emerald-950/90 border border-teal-800/30 backdrop-blur-sm hover:shadow-lg hover:border-teal-700/50 transition-all">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-700 shadow-md">
                    <BrainCircuit className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-center text-xl font-bold">EXPERT AMOA</CardTitle>
                <CardDescription className="text-center text-teal-300">
                  Chatbot spécialisé pour consultants AMOA
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="mb-6 text-sm text-teal-200 flex flex-col gap-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 flex-shrink-0" />
                    <span>Dialogue libre avec un expert IA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 flex-shrink-0" />
                    <span>Réponses sur mesure et contextuelles</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 flex-shrink-0" />
                    <span>Apprenez les méthodologies mc2i</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-400 flex-shrink-0" />
                    <span>Consultations illimitées</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 text-white"
                  onClick={() => setLocation('/amoa/expert-learning')}
                >
                  Consulter l'expert
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Section évolutions à venir */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-blue-950/50 border border-blue-900/30 rounded-xl p-6 w-full mx-auto"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Évolutions à venir
            </h3>
            <p className="text-blue-200 mb-6">
              Notre module mc2i ROLE PLAY s'enrichira bientôt de nouvelles fonctionnalités pour vous aider à progresser 
              dans toutes les situations professionnelles que vous pourriez rencontrer.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-900/30 rounded-lg p-5 flex items-start gap-4 border border-blue-800/30 hover:border-blue-700/50 transition-all">
                <div className="bg-blue-800/60 p-2 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-300" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-100 text-lg">Situations multi-interlocuteurs</h4>
                  <p className="text-sm text-blue-300 mt-2">Simulations d'entretiens impliquant plusieurs participants avec différents rôles pour des scénarios plus complexes et réalistes.</p>
                </div>
              </div>
              <div className="bg-purple-900/40 rounded-lg p-5 flex items-start gap-4 border border-purple-800/30 hover:border-purple-700/50 transition-all">
                <div className="bg-purple-700/60 p-2 rounded-lg">
                  <Timer className="h-6 w-6 text-purple-300" />
                </div>
                <div>
                  <h4 className="font-medium text-purple-100 flex items-center gap-2 text-lg">
                    Mode Audio en temps réel
                    <Badge className="bg-purple-800/80 text-purple-100 text-xs">COMING SOON</Badge>
                  </h4>
                  <p className="text-sm text-purple-300 mt-2">Interagissez vocalement avec une IA réactive pour des échanges naturels et immédiats, sans délai de traitement, pour une expérience encore plus réaliste.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </HomeLayout>
  );
}