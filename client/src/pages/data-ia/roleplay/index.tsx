import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  ArrowRight,
  ArrowLeft,
  Code,
} from 'lucide-react';
import { BsFileEarmarkCode } from 'react-icons/bs';
import { FiSun, FiMoon } from 'react-icons/fi';

import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTutorial } from '@/contexts/TutorialContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PageTitle from '@/components/utils/PageTitle';

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
      
      {/* En-tête */}
      <div className="p-6 container mx-auto">
        <div className="flex items-center mb-2">
          <Link href="/data-ia">
            <Button variant="ghost" className="text-white mr-4">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour
            </Button>
          </Link>
          <PageTitle title="DATA & IA ROLE PLAY" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Choisissez votre rôle</h1>
            <p className="text-blue-200 mt-1">Développez vos compétences dans des scénarios réalistes adaptés à votre profil</p>
          </div>
          
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              size="sm"
              className={`border-blue-500/30 text-blue-300 hover:bg-blue-900/20 ${highContrastMode ? 'bg-gray-800' : ''}`}
              onClick={() => setHighContrastMode(!highContrastMode)}
            >
              {highContrastMode ? <FiSun className="mr-2 h-4 w-4" /> : <FiMoon className="mr-2 h-4 w-4" />}
              {highContrastMode ? 'Mode standard' : 'Mode haut contraste'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="border-blue-500/30 text-blue-300 hover:bg-blue-900/20"
              onClick={() => {
                setCurrentTour('data-ia-roleplay');
                startTutorial();
              }}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Aide
            </Button>
          </div>
        </div>

        {/* Options de rôles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-8">
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
                <p className="mb-6 text-indigo-200">
                  Analysez du code Python et SQL pour résoudre des problèmes d'analyse de données complexes et testez vos connaissances techniques.
                </p>
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
                <p className="mb-6 text-blue-200">
                  Développez et testez des algorithmes dans un environnement interactif avec assistance IA pour améliorer vos compétences pratiques.
                </p>
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
        </div>
      </div>
    </div>
  );
}