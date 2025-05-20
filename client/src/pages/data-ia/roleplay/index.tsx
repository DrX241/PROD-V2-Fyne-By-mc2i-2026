import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  ArrowRight,
  ArrowLeft,
  Code,
  Database,
  PieChart,
  LineChart,
  Bot,
} from 'lucide-react';
import { IoHome, IoSchoolOutline } from 'react-icons/io5';
import { BsFileEarmarkCode } from 'react-icons/bs';
import { FiSun, FiMoon } from 'react-icons/fi';
import { AiOutlineZoomIn, AiOutlineZoomOut } from 'react-icons/ai';

import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { useTutorial } from '@/contexts/TutorialContext';
import { useTheme } from '@/contexts/ThemeContext';
import { DataButton } from '@/components/DataButton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/PageTitle';

export default function DataIaRoleplay() {
  const [, setLocation] = useLocation();
  const { currentTour, setCurrentTour, startTutorial } = useTutorial();
  const { themeMode } = useTheme();
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [textSize, setTextSize] = useState(1);

  return (
    <HomeLayout>
      <Helmet>
        <title>DATA & IA ROLE PLAY | Simulations immersives</title>
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-[#041b36] to-[#0c142e]"
        style={{ 
          fontSize: `${textSize}rem`
        }}>
        
        {/* Navigation et contrôles */}
        <div className="px-8 py-8 relative max-w-[1600px] w-full mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center">
              <Link href="/data-ia">
                <DataButton 
                  variant="outline"
                  size="lg"
                  className="text-blue-300 border-blue-300/30 hover:bg-blue-900/20"
                  startIcon={<ArrowLeft className="h-5 w-5 mr-2" />}
                >
                  Retour
                </DataButton>
              </Link>
              <PageTitle title="DATA & IA ROLE PLAY" />
            </div>
            
            <div className="flex items-center gap-4">
              {/* Bouton d'aide */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DataButton 
                      variant="outline"
                      className="w-11 h-11 p-0 flex items-center justify-center rounded-full text-blue-300 border-blue-300/30 hover:bg-blue-900/20"
                      onClick={() => {
                        setCurrentTour('data-ia-roleplay');
                        startTutorial();
                      }}
                    >
                      <HelpCircle className="h-5 w-5" />
                    </DataButton>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Afficher le guide</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* Contrôle mode haut contraste */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DataButton 
                      variant="outline"
                      className={`w-11 h-11 p-0 flex items-center justify-center rounded-full ${
                        highContrastMode 
                          ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' 
                          : 'text-blue-300 border-blue-300/30 hover:bg-blue-900/20'
                      }`}
                      onClick={() => setHighContrastMode(!highContrastMode)}
                    >
                      {highContrastMode ? (
                        <FiSun className="h-5 w-5" />
                      ) : (
                        <FiMoon className="h-5 w-5" />
                      )}
                    </DataButton>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{highContrastMode ? 'Désactiver' : 'Activer'} le mode haut contraste</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* Contrôle taille du texte */}
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DataButton 
                        variant="outline"
                        className="w-10 h-10 p-0 flex items-center justify-center rounded-full text-blue-300 border-blue-300/30 hover:bg-blue-900/20"
                        onClick={() => setTextSize(Math.max(0.8, textSize - 0.1))}
                      >
                        <AiOutlineZoomOut className="h-4 w-4" />
                      </DataButton>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Réduire la taille du texte</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DataButton 
                        variant="outline"
                        className="w-10 h-10 p-0 flex items-center justify-center rounded-full text-blue-300 border-blue-300/30 hover:bg-blue-900/20"
                        onClick={() => setTextSize(Math.min(1.2, textSize + 0.1))}
                      >
                        <AiOutlineZoomIn className="h-4 w-4" />
                      </DataButton>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Augmenter la taille du texte</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          
          {/* Titre et sous-titre */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 relative"
          >
            <h1 className="text-5xl font-bold mb-4 font-data-title relative">
              <span className="text-white">Simulations immersives</span>
              <br />
              <span className="text-5xl mt-2 block tracking-wider bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                DATA & IA ROLE PLAY
              </span>
            </h1>
            <div className="w-40 h-1 bg-gradient-to-r from-indigo-400 to-purple-500 mx-auto my-6 rounded-full"></div>
            <p className={`max-w-3xl mx-auto text-xl ${
              highContrastMode ? 'text-gray-300' : 'text-blue-100' 
            }`}>
              Incarnez différents rôles du monde de la Data et de l'IA pour développer vos compétences dans des scénarios réalistes
            </p>
          </motion.div>

          {/* Modules Data & IA Role Play */}
          <div className="mt-8 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center max-w-5xl mx-auto">
              {/* Je suis Data Scientist, je teste mes compétences d'analyse de code */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className={`cyber-edge-distort relative overflow-hidden p-6 ${
                  highContrastMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-gradient-to-br from-indigo-600 to-cyan-900 border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/50'
                } hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 rounded-lg ${
                    highContrastMode 
                      ? 'bg-blue-900' 
                      : 'bg-gradient-to-r from-indigo-500 to-cyan-500 shadow-md'
                  }`}>
                    <Code className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-center text-2xl font-data-title mb-2">Je suis Consultant Data & IA</h3>
                <p className="text-center text-cyan-300 mt-2">
                  je teste mes compétences à travers des QCM
                </p>
                <div className="mt-6">
                  <p className="text-gray-300 text-center mb-4">
                    Analysez du code Python et SQL pour résoudre des problèmes d'analyse de données complexes
                  </p>
                  <div className="text-center">
                    <Button 
                      className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white px-6 py-5 w-full"
                      onClick={(e) => {
                        setLocation('/data-ia/roleplay/read-me-if-you-can');
                      }}
                    >
                      Commencer le défi
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            
              {/* Je suis Développeur Data, je crée et teste des algorithmes */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className={`cyber-edge-distort relative overflow-hidden p-6 ${
                  highContrastMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-gradient-to-br from-violet-600 to-purple-900 border-2 border-violet-400/50 shadow-lg shadow-violet-500/50'
                } hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 rounded-lg ${
                    highContrastMode 
                      ? 'bg-purple-900' 
                      : 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-md'
                  }`}>
                    <BsFileEarmarkCode className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-center text-2xl font-data-title mb-2">Je suis Data Scientist</h3>
                <p className="text-center text-violet-300 mt-2">
                  je crée et teste des algorithmes d'analyse
                </p>
                <div className="mt-6">
                  <p className="text-gray-300 text-center mb-4">
                    Développez et testez des algorithmes dans un environnement interactif avec assistance IA
                  </p>
                  <div className="text-center">
                    <Button 
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-5 w-full"
                      onClick={(e) => {
                        setLocation('/data-ia/roleplay/ia-lab-trainer');
                      }}
                    >
                      Accéder au laboratoire
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Ajoutez d'autres modules de roleplay ici si nécessaire */}

            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}