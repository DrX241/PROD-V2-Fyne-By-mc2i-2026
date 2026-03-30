import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  ArrowRight,
  ArrowLeft,
  Code,
  Bot,
  Users
} from 'lucide-react';
import { BsFileEarmarkCode, BsBarChartFill, BsServer, BsCpu, BsDisplay } from 'react-icons/bs';
import { FiSun, FiMoon } from 'react-icons/fi';

import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTutorial } from '@/contexts/TutorialContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function DataIaRoleplay() {
  const [, setLocation] = useLocation();
  const { currentTour, setCurrentTour, startTutorial } = useTutorial();
  const { themeMode } = useTheme();
  const [highContrastMode, setHighContrastMode] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#041b36] to-[#0c142e] text-white pb-20">
      <Helmet>
        <title>DATA & IA ROLE PLAY | Simulations immersives</title>
      </Helmet>
      
      {/* En-tête grand titre */}
      <div className="mb-12 text-center pt-10 relative z-10 px-6">
        <div className="flex justify-start mb-6 px-6">
          <Link href="/data-ia">
            <Button variant="outline" size="sm" className="bg-black/50 border-blue-800 text-blue-400 hover:bg-black/70 hover:text-blue-300 hover:border-blue-500 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
          </Link>
        </div>
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-400 mb-4">
          DATA &amp; IA ROLE PLAY
        </h1>
        <p className="text-gray-300 max-w-3xl mx-auto text-lg">
          Immergez-vous dans des simulations réalistes pour développer vos compétences Data &amp; IA à travers des scénarios interactifs.
        </p>
      </div>

      <div className="p-6 container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h2 className="text-2xl font-bold">Choisissez votre rôle</h2>
            <p className="text-blue-200 mt-1">Développez vos compétences dans des scénarios réalistes adaptés à votre profil</p>
          </div>
        </div>

        {/* Options de rôles */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-8">
          {/* Option 0: Je suis Monsieur Tout le Monde */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="h-full bg-gradient-to-br from-[#004a70]/60 to-[#001a2e] border-[#006a9e]/60 hover:border-[#006a9e] hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full" style={{ background: 'rgba(0,106,158,0.3)' }}>
                    <Users className="h-10 w-10" style={{ color: '#60c0f0' }} />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center mb-2">Je suis Monsieur Tout le Monde</CardTitle>
                <CardDescription className="text-center text-lg" style={{ color: '#60c0f0' }}>
                  J'apprends à lire et utiliser la data
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-2 mb-6 mx-auto max-w-xs">
                  <li className="flex items-center text-blue-200">
                    <div className="h-2 w-2 rounded-full mr-2" style={{ background: '#006a9e' }}></div>
                    4 domaines · 12 situations interactives
                  </li>
                  <li className="flex items-center text-blue-200">
                    <div className="h-2 w-2 rounded-full mr-2" style={{ background: '#006a9e' }}></div>
                    Score de maturité Data · Feedback
                  </li>
                  <li className="flex items-center text-blue-200">
                    <div className="h-2 w-2 rounded-full mr-2" style={{ background: '#006a9e' }}></div>
                    Badge final : Novice · Praticien · Expert
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button
                  className="text-white px-6 py-5 hover:opacity-90"
                  style={{ background: '#006a9e' }}
                  onClick={() => setLocation('/data-ia/roleplay/monsieur-tout-le-monde')}
                >
                  Commencer le module
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Option 1: Je suis Consultant Data & IA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="h-full bg-gradient-to-br from-indigo-900/40 to-indigo-950 border-indigo-700 hover:border-indigo-500 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-indigo-800/70">
                    <Code className="h-10 w-10 text-indigo-200" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center mb-2">Je suis Consultant Data & IA</CardTitle>
                <CardDescription className="text-indigo-300 text-center text-lg">
                  Je teste mes compétences à travers des QCM
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-2 mb-6 mx-auto max-w-xs">
                  <li className="flex items-center text-indigo-200">
                    <div className="h-2 w-2 rounded-full bg-indigo-400 mr-2"></div>
                    Analyse de code Python et SQL
                  </li>
                  <li className="flex items-center text-indigo-200">
                    <div className="h-2 w-2 rounded-full bg-indigo-400 mr-2"></div>
                    QCM techniques et explicatifs
                  </li>
                  <li className="flex items-center text-indigo-200">
                    <div className="h-2 w-2 rounded-full bg-indigo-400 mr-2"></div>
                    Progression par niveaux de difficulté
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-5"
                  onClick={() => setLocation('/data-ia/roleplay/read-me-if-you-can')}
                >
                  Commencer le défi
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Option 2: Je suis Data Scientist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="h-full bg-gradient-to-br from-blue-900/40 to-blue-950 border-blue-700 hover:border-blue-500 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-blue-800/70">
                    <BsFileEarmarkCode className="h-10 w-10 text-blue-200" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center mb-2">Je suis Data Scientist</CardTitle>
                <CardDescription className="text-blue-300 text-center text-lg">
                  Je crée et teste des algorithmes d'analyse
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-2 mb-6 mx-auto max-w-xs">
                  <li className="flex items-center text-blue-200">
                    <div className="h-2 w-2 rounded-full bg-blue-400 mr-2"></div>
                    Laboratoire de code interactif
                  </li>
                  <li className="flex items-center text-blue-200">
                    <div className="h-2 w-2 rounded-full bg-blue-400 mr-2"></div>
                    Assistance IA pour l'analyse
                  </li>
                  <li className="flex items-center text-blue-200">
                    <div className="h-2 w-2 rounded-full bg-blue-400 mr-2"></div>
                    Environnement Python et SQL
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-5"
                  onClick={() => setLocation('/data-ia/roleplay/ia-lab-trainer')}
                >
                  Accéder au laboratoire
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Option 3: Je suis AI Engineer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="h-full bg-gradient-to-br from-purple-900/40 to-purple-950 border-purple-700 hover:border-purple-500 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-purple-800/70">
                    <BsCpu className="h-10 w-10 text-purple-200" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center mb-2">Je suis AI Engineer</CardTitle>
                <CardDescription className="text-purple-300 text-center text-lg">
                  Je développe des systèmes d'IA
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-2 mb-6 mx-auto max-w-xs">
                  <li className="flex items-center text-purple-200">
                    <div className="h-2 w-2 rounded-full bg-purple-400 mr-2"></div>
                    Développement de modèles ML/DL
                  </li>
                  <li className="flex items-center text-purple-200">
                    <div className="h-2 w-2 rounded-full bg-purple-400 mr-2"></div>
                    Ingénierie de prompts et fine-tuning
                  </li>
                  <li className="flex items-center text-purple-200">
                    <div className="h-2 w-2 rounded-full bg-purple-400 mr-2"></div>
                    MLOps et déploiement de modèles
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-5"
                  onClick={() => setLocation('/data-ia/roleplay/ai-engineer')}
                >
                  Créer des modèles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Option 4: Créateur d'Assistant IA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="h-full bg-gradient-to-br from-cyan-900/40 to-cyan-950 border-cyan-700 hover:border-cyan-500 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-cyan-800/70">
                    <Bot className="h-10 w-10 text-cyan-200" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center mb-2">Créateur d'Assistant IA</CardTitle>
                <CardDescription className="text-cyan-300 text-center text-lg">
                  Concevez un assistant IA
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-2 mb-6 mx-auto max-w-xs">
                  <li className="flex items-center text-cyan-200">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 mr-2"></div>
                    Création d'un assistant IA sur mesure
                  </li>
                  <li className="flex items-center text-cyan-200">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 mr-2"></div>
                    Définition des domaines d'expertise
                  </li>
                  <li className="flex items-center text-cyan-200">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 mr-2"></div>
                    Partage et utilisation collaborative
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-5"
                  onClick={() => setLocation('/cyber/tools/assistant-cyber')}
                >
                  Créer un assistant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Option 5: Je suis Data Analyst - Bientôt disponible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="h-full bg-gradient-to-br from-green-900/40 to-green-950 border-green-700 hover:border-green-500 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-green-800/70">
                    <BsBarChartFill className="h-10 w-10 text-green-200" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center mb-2">Je suis Data Analyst</CardTitle>
                <CardDescription className="text-green-300 text-center text-lg">
                  J'analyse et visualise des données
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-2 mb-6 mx-auto max-w-xs">
                  <li className="flex items-center text-green-200">
                    <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
                    Analyse exploratoire de données
                  </li>
                  <li className="flex items-center text-green-200">
                    <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
                    Création de tableaux de bord
                  </li>
                  <li className="flex items-center text-green-200">
                    <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
                    Statistiques descriptives et reporting
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-5"
                  onClick={() => setLocation('/data-ia/roleplay/data-analyst')}
                >
                  Accéder au module
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Option 5: Je suis Data Engineer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="h-full bg-gradient-to-br from-amber-900/40 to-amber-950 border-amber-700 hover:border-amber-500 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-amber-800/70">
                    <BsServer className="h-10 w-10 text-amber-200" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center mb-2">Je suis Data Engineer</CardTitle>
                <CardDescription className="text-amber-300 text-center text-lg">
                  Je construis des pipelines de données
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-2 mb-6 mx-auto max-w-xs">
                  <li className="flex items-center text-amber-200">
                    <div className="h-2 w-2 rounded-full bg-amber-400 mr-2"></div>
                    Conception de bases de données
                  </li>
                  <li className="flex items-center text-amber-200">
                    <div className="h-2 w-2 rounded-full bg-amber-400 mr-2"></div>
                    ETL et intégration de données
                  </li>
                  <li className="flex items-center text-amber-200">
                    <div className="h-2 w-2 rounded-full bg-amber-400 mr-2"></div>
                    Optimisation de requêtes SQL
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-5"
                  onClick={() => setLocation('/data-ia/not-implemented')}
                >
                  Accéder au module
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* Option 6: Je suis Data Manager */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="h-full bg-gradient-to-br from-rose-900/40 to-rose-950 border-rose-700 hover:border-rose-500 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-rose-800/70">
                    <BsDisplay className="h-10 w-10 text-rose-200" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center mb-2">Je suis Data Manager</CardTitle>
                <CardDescription className="text-rose-300 text-center text-lg">
                  J'organise la gouvernance des données
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-2 mb-6 mx-auto max-w-xs">
                  <li className="flex items-center text-rose-200">
                    <div className="h-2 w-2 rounded-full bg-rose-400 mr-2"></div>
                    Stratégie et gouvernance des données
                  </li>
                  <li className="flex items-center text-rose-200">
                    <div className="h-2 w-2 rounded-full bg-rose-400 mr-2"></div>
                    Gestion des métadonnées et qualité
                  </li>
                  <li className="flex items-center text-rose-200">
                    <div className="h-2 w-2 rounded-full bg-rose-400 mr-2"></div>
                    Politiques de conformité et sécurité
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-5"
                  onClick={() => setLocation('/data-ia/not-implemented')}
                >
                  Accéder au module
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
          
          {/* Option 7: Je suis Développeur IA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="h-full bg-gradient-to-br from-cyan-900/40 to-cyan-950 border-cyan-700 hover:border-cyan-500 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-cyan-800/70">
                    <BsDisplay className="h-10 w-10 text-cyan-200" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center mb-2">Je suis Développeur IA</CardTitle>
                <CardDescription className="text-cyan-300 text-center text-lg">
                  J'intègre l'IA dans des applications
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-left space-y-2 mb-6 mx-auto max-w-xs">
                  <li className="flex items-center text-cyan-200">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 mr-2"></div>
                    Intégration d'APIs d'IA
                  </li>
                  <li className="flex items-center text-cyan-200">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 mr-2"></div>
                    Développement d'interfaces intelligentes
                  </li>
                  <li className="flex items-center text-cyan-200">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 mr-2"></div>
                    Tests et optimisation des solutions
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-5"
                  onClick={() => setLocation('/data-ia/not-implemented')}
                >
                  Accéder au module
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}