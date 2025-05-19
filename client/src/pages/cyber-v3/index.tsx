import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  ArrowRight,
  Shield,
  Terminal,
  Users,
} from 'lucide-react';
import { IoHome, IoSchoolOutline } from 'react-icons/io5';
import { BsShieldLock } from 'react-icons/bs';
import { FiSun, FiMoon } from 'react-icons/fi';
import { AiOutlineZoomIn, AiOutlineZoomOut } from 'react-icons/ai';

import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import CyberScene from '@/components/CyberScene';
import { useTutorial } from '@/contexts/TutorialContext';
import { useTheme } from '@/contexts/ThemeContext';
import { DataButton } from '@/components/DataButton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import HomeLayout from '@/components/layout/HomeLayout';
import OpenAIStatusIndicator from '@/components/OpenAIStatusIndicator';

export default function CyberV3() {
  const [, setLocation] = useLocation();
  const { currentTour, setCurrentTour, startTutorial } = useTutorial();
  const { themeMode } = useTheme();
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [textSize, setTextSize] = useState(1);

  return (
    <HomeLayout>
      <Helmet>
        <title>I AM CYBER | Nouvelle interface</title>
        <style>
          {`
            @keyframes moveVertical {
              0% { background-position-y: 0; }
              100% { background-position-y: 100%; }
            }
          `}
        </style>
      </Helmet>
      
      <div className="min-h-screen relative cyber-bg"
        style={{ 
          fontSize: `${textSize}rem`,
          backgroundColor: '#000000',
          backgroundImage: highContrastMode ? 'none' : 'url("data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M1 1h18v18H1V1z" fill="none" stroke="rgba(6,182,212,0.05)" stroke-width="0.2"/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
        }}>
        {/* Arrière-plan animé */}
        <CyberScene />
        
        {/* Éléments visuels supplémentaires */}
        {!highContrastMode && (
          <>
            {/* Circuit patterns cybernétiques */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXR0ZXJuIGlkPSJjaXJjdWl0IiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGgxMDB2MTAwSDIwMHYxMDBoLTEwMHYtMTAwSDB6IiBmaWxsPSJub25lIiBzdHJva2U9IiMwZmIzZDEiIHN0cm9rZS13aWR0aD0iMSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMyIgZmlsbD0iIzBmYjNkMSIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjIwMCIgcj0iMyIgZmlsbD0iIzBmYjNkMSIvPjxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIzIiBmaWxsPSIjMGZiM2QxIi8+PGNpcmNsZSBjeD0iMjAwIiBjeT0iMCIgcj0iMyIgZmlsbD0iIzBmYjNkMSIvPjxjaXJjbGUgY3g9IjAiIGN5PSIyMDAiIHI9IjMiIGZpbGw9IiMwZmIzZDEiLz48L3BhdHRlcm4+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNjaXJjdWl0KSIgb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')]" 
                 style={{ opacity: 0.05 }}></div>
            
            {/* Scanlines animées */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent bg-repeat-y" 
                  style={{ 
                    backgroundSize: '100% 8px', 
                    animation: 'moveVertical 8s linear infinite',
                    opacity: 0.2
                  }}>
              </div>
            </div>
            
            {/* Points lumineux */}
            <div className="absolute top-1/5 right-1/4 w-2 h-2 bg-cyan-300 rounded-full opacity-70 animate-pulse shadow-[0_0_30px_15px_rgba(34,211,238,0.5)]"></div>
            <div className="absolute bottom-1/3 left-1/5 w-1 h-1 bg-pink-300 rounded-full opacity-60 animate-pulse shadow-[0_0_20px_10px_rgba(236,72,153,0.4)]"></div>
          </>
        )}
        
        {/* Navigation et contrôles */}
        <div className="px-8 py-8 relative max-w-[1600px] w-full mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center">
              <Link href="/">
                <DataButton 
                  variant="outline"
                  size="lg"
                  className="text-cyan-300 border-cyan-300/30 hover:bg-cyan-900/20"
                  startIcon={<IoHome className="h-6 w-6" />}
                >
                  Accueil
                </DataButton>
              </Link>

            </div>
            
            <div className="flex items-center gap-4">
              {/* Bouton d'aide */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DataButton 
                      variant="outline"
                      className="w-11 h-11 p-0 flex items-center justify-center rounded-full text-cyan-300 border-cyan-300/30 hover:bg-cyan-900/20"
                      onClick={() => {
                        setCurrentTour('cyber-v3');
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
                          : 'text-cyan-300 border-cyan-300/30 hover:bg-cyan-900/20'
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
                        className="w-10 h-10 p-0 flex items-center justify-center rounded-full text-cyan-300 border-cyan-300/30 hover:bg-cyan-900/20"
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
                        className="w-10 h-10 p-0 flex items-center justify-center rounded-full text-cyan-300 border-cyan-300/30 hover:bg-cyan-900/20"
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
            className="text-center mb-16 relative z-10"
          >
            <h1 className="text-5xl font-bold mb-4 font-data-title relative">
              <span className="text-white">Centre de Formation</span>
              <br />
              <span className="text-6xl mt-2 block tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                I AM CYBER
              </span>
            </h1>
            <div className="w-40 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto my-6 rounded-full"></div>
            <p className={`max-w-3xl mx-auto text-xl ${
              highContrastMode ? 'text-gray-300' : 'text-blue-100' 
            }`}>
              Trouvez votre parcours d'apprentissage personnalisé en <span className="font-semibold text-cyan-300">cybersécurité</span>
            </p>
          </motion.div>

          {/* Modules Cyber */}
          <div className="mt-8 px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center max-w-6xl mx-auto">
              {/* CYBER ACADÉMIE */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className={`cyber-edge-distort relative overflow-hidden p-6 ${
                  highContrastMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-gradient-to-br from-blue-600 to-blue-900 border-2 border-blue-400/50 shadow-lg shadow-blue-500/50'
                } hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 rounded-lg ${
                    highContrastMode 
                      ? 'bg-blue-800' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-700 shadow-md'
                  }`}>
                    <IoSchoolOutline className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-center text-2xl font-data-title mb-2">CYBER ACADÉMIE</h3>
                <p className="text-center text-blue-300 mt-2">
                  Centre de formation complet aux métiers de la cybersécurité
                </p>
                <div className="mt-6">
                  <div className="text-center">
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-5 w-full"
                      onClick={(e) => {
                        setLocation('/cyber/learning-center');
                      }}
                    >
                      Explorer l'académie
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            
              {/* CYBER ROLE PLAY */}
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
                    <BsShieldLock className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-center text-2xl font-data-title mb-2">CYBER ROLE PLAY</h3>
                <p className="text-center text-cyan-300 mt-2">
                  Jeux de rôle immersifs pour l'apprentissage cyber
                </p>
                <div className="mt-6">
                  <div className="text-center">
                    <Button 
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-5 w-full"
                      onClick={(e) => {
                        setLocation('/cyber/roleplay');
                      }}
                    >
                      Accéder aux simulations
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* CYBER LAB */}
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className={`cyber-edge-distort relative overflow-hidden p-6 ${
                  highContrastMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-gradient-to-br from-violet-600 to-blue-900 border-2 border-violet-400/50 shadow-lg shadow-violet-500/50'
                } hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 rounded-lg ${
                    highContrastMode 
                      ? 'bg-violet-900' 
                      : 'bg-gradient-to-r from-violet-600 to-blue-600 shadow-md'
                  }`}>
                    <Terminal className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-center text-2xl font-data-title mb-2">CYBER LAB</h3>
                <p className="text-center text-violet-300 mt-2">
                  Environnement pratique d'analyse de sécurité
                </p>
                <div className="mt-4">
                  <div className="text-center">
                    <Button 
                      className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white px-6 py-5"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation('/cyber/cyber-lab');
                      }}
                    >
                      Accéder au laboratoire
                      <ArrowRight className="ml-2 h-4 w-4" />
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