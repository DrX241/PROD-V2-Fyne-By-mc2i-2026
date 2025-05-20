import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  ArrowLeft,
  Code,
  Database,
  Lightbulb,
} from 'lucide-react';
import { IoHome } from 'react-icons/io5';
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

export default function DataStudio() {
  const [, setLocation] = useLocation();
  const { currentTour, setCurrentTour, startTutorial } = useTutorial();
  const { themeMode } = useTheme();
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [textSize, setTextSize] = useState(1);

  return (
    <HomeLayout>
      <Helmet>
        <title>DATA & IA | Espace d'Entraînement</title>
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
              <PageTitle title="ESPACE D'ENTRAÎNEMENT" />
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
                        setCurrentTour('data-studio');
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
            className="text-center mb-16 relative"
          >
            <h1 className="text-5xl font-bold mb-4 font-data-title relative">
              <span className="text-white">Espace</span>
              <br />
              <span className="text-6xl mt-2 block tracking-wider bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                d'Entraînement
              </span>
            </h1>
            <div className="w-40 h-1 bg-gradient-to-r from-blue-400 to-cyan-500 mx-auto my-6 rounded-full"></div>
            <p className={`max-w-3xl mx-auto text-xl ${
              highContrastMode ? 'text-gray-300' : 'text-blue-100' 
            }`}>
              Améliorez vos compétences en Python, SQL et Data Science avec nos modules pratiques
            </p>
          </motion.div>

          {/* Options d'entraînement */}
          <div className="mt-8 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center max-w-6xl mx-auto">
              {/* Option 1: Code Challenge */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className={`cyber-edge-distort relative overflow-hidden p-6 ${
                  highContrastMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-gradient-to-br from-blue-600 to-cyan-900 border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/50'
                } hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 rounded-lg ${
                    highContrastMode 
                      ? 'bg-blue-900' 
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md'
                  }`}>
                    <Code className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-center text-2xl font-data-title mb-2">Défis de Code</h3>
                <p className="text-center text-cyan-300 mt-2">
                  Testez vos compétences en analyse de code
                </p>
                <div className="mt-6">
                  <p className="text-gray-300 text-center mb-4">
                    Déchiffrez et analysez du code Python et SQL pour résoudre des problèmes complexes
                  </p>
                  <div className="text-center">
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-5 w-full"
                      onClick={(e) => {
                        setLocation('/data-ia/read-me-if-you-can');
                      }}
                    >
                      Commencer les défis
                    </Button>
                  </div>
                </div>
              </motion.div>
              
              {/* Option 2: Tests Adaptifs */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className={`cyber-edge-distort relative overflow-hidden p-6 ${
                  highContrastMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-gradient-to-br from-indigo-600 to-blue-900 border-2 border-indigo-400/50 shadow-lg shadow-indigo-500/50'
                } hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 rounded-lg ${
                    highContrastMode 
                      ? 'bg-indigo-900' 
                      : 'bg-gradient-to-r from-indigo-500 to-blue-500 shadow-md'
                  }`}>
                    <Database className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-center text-2xl font-data-title mb-2">Tests Adaptifs IA</h3>
                <p className="text-center text-indigo-300 mt-2">
                  Évaluez votre niveau technique
                </p>
                <div className="mt-6">
                  <p className="text-gray-300 text-center mb-4">
                    Tests qui s'adaptent à votre niveau et vous aident à identifier vos points forts et axes d'amélioration
                  </p>
                  <div className="text-center">
                    <Button 
                      className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-5 w-full"
                      disabled
                    >
                      Bientôt disponible
                    </Button>
                  </div>
                </div>
              </motion.div>
              
              {/* Option 3: Projets Pratiques */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className={`cyber-edge-distort relative overflow-hidden p-6 ${
                  highContrastMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-gradient-to-br from-cyan-600 to-blue-900 border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/50'
                } hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 rounded-lg ${
                    highContrastMode 
                      ? 'bg-cyan-900' 
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-md'
                  }`}>
                    <Lightbulb className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-center text-2xl font-data-title mb-2">Projets Pratiques</h3>
                <p className="text-center text-cyan-300 mt-2">
                  Travaillez sur des cas concrets
                </p>
                <div className="mt-6">
                  <p className="text-gray-300 text-center mb-4">
                    Des projets complets guidés pour mettre en pratique vos compétences en Data Science et IA
                  </p>
                  <div className="text-center">
                    <Button 
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-5 w-full"
                      disabled
                    >
                      Bientôt disponible
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}