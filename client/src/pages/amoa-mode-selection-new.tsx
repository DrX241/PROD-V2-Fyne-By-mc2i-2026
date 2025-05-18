import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
// Icônes modernes de React Icons
import { IoHome as IoHomeIcon, IoVideocam, IoAnalytics } from 'react-icons/io5';
import { BsClipboardCheck } from 'react-icons/bs';
import { AiOutlineZoomIn, AiOutlineZoomOut } from 'react-icons/ai';
import { FiHelpCircle, FiMoon, FiSun } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
// Import des images mc2i
import mc2iSloganImage from "@assets/image_1747585779637.png";
import mc2iLogoImage from "@assets/image_1747585797449.png";

export default function AmoaModeSelectionNew() {
  // États
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [textSize, setTextSize] = useState(1); // 1 = normal, >1 = larger, <1 = smaller
  const [, navigate] = useLocation();

  return (
    <HomeLayout>
      <PageTitle title="I AM mc2i" />
      <div 
        className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-800 via-[#006a9e] to-blue-900"
        style={{ fontSize: `${textSize}rem` }}
      >
        {/* Images mc2i en arrière-plan - grande taille et plus visibles */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Overlay semi-transparent pour améliorer le contraste avec le contenu */}
          <div className="absolute inset-0 bg-blue-950/40 z-10"></div>
          
          {/* Première moitié de l'écran - Slogan */}
          <div className="absolute top-0 left-0 w-1/2 h-full flex items-center justify-center opacity-60">
            <img 
              src={mc2iSloganImage} 
              alt="Éclairer et transformer les organisations" 
              className="w-full h-full object-cover object-center" 
              style={{ filter: 'contrast(1.1) brightness(1.05)' }}
            />
          </div>
          
          {/* Seconde moitié de l'écran - Logo */}
          <div className="absolute top-0 right-0 w-1/2 h-full flex items-center justify-center bg-blue-950 opacity-60">
            <img 
              src={mc2iLogoImage} 
              alt="Logo mc2i" 
              className="w-full h-full object-cover object-center" 
              style={{ filter: 'contrast(1.2) brightness(1.1)' }}
            />
          </div>
        </div>
        {/* Bouton retour à l'accueil */}
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="outline" 
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-md border-0 hover:from-blue-700 hover:to-blue-800"
            onClick={() => window.location.href = '/'}
          >
            <IoHomeIcon className="h-4 w-4 mr-2" />
            Accueil
          </Button>
        </div>

        {/* Outils d'accessibilité */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {/* Bouton du guide */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-blue-900/30 border-blue-800 text-white hover:bg-blue-800/50"
                  data-id="help-button"
                >
                  <FiHelpCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Guide d'utilisation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Contrôle mode haut contraste */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  size="icon"
                  className={`w-10 h-10 rounded-full ${
                    highContrastMode 
                      ? 'bg-blue-700 border-blue-600 text-white hover:bg-blue-600' 
                      : 'bg-blue-900/30 border-blue-800 text-white hover:bg-blue-800/50'
                  }`}
                  onClick={() => setHighContrastMode(!highContrastMode)}
                  data-id="contrast-button"
                >
                  {highContrastMode ? (
                    <FiSun className="h-5 w-5" />
                  ) : (
                    <FiMoon className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{highContrastMode ? 'Désactiver' : 'Activer'} le mode haut contraste</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="w-9 h-9 rounded-full bg-blue-900/30 border-blue-800 text-white hover:bg-blue-800/50"
                    onClick={() => setTextSize(Math.max(0.8, textSize - 0.1))}
                    data-id="text-smaller-button"
                  >
                    <AiOutlineZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Réduire la taille du texte</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="w-9 h-9 rounded-full bg-blue-900/30 border-blue-800 text-white hover:bg-blue-800/50"
                    onClick={() => setTextSize(Math.min(1.2, textSize + 0.1))}
                    data-id="text-larger-button"
                  >
                    <AiOutlineZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Augmenter la taille du texte</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="relative z-10 max-w-[1600px] w-full mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16 relative"
            data-id="main-title"
          >
            <h1 className="text-5xl font-bold mb-4 font-data-title relative">
              <span className="text-white">Centre de Formation</span>
              <br />
              <span className="text-6xl mt-2 block tracking-wider bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                I AM mc2i
              </span>
            </h1>
            <div className="w-40 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 mx-auto my-6 rounded-full"></div>
            <p className={`max-w-3xl mx-auto text-xl ${
              highContrastMode ? 'text-gray-300' : 'text-blue-100' 
            }`}>
              Assistant de formation intelligent pour les métiers de la <span className="font-semibold text-blue-300">transformation numérique</span>
            </p>
          </motion.div>

          {/* Modules mc2i */}
          <div className="mt-8 px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center max-w-6xl mx-auto">
              {/* mc2i ROLE PLAY */}
              <div 
                className={`cyber-edge-distort relative overflow-hidden p-6 cursor-pointer ${
                  highContrastMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-gradient-to-br from-blue-600 to-blue-900 border-2 border-blue-400/50 shadow-lg shadow-blue-500/50'
                } hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
                onClick={() => navigate('/amoa/roleplay')}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 rounded-lg ${
                    highContrastMode 
                      ? 'bg-blue-800' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-700 shadow-md'
                  }`}>
                    <IoVideocam className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-center text-2xl font-bold mb-2">mc2i ROLE PLAY</h3>
                <p className="text-center text-blue-300 mt-2">
                  Simulations métier et situations professionnelles interactives
                </p>
                <div className="text-center flex flex-col items-center mt-4">
                  <p className="text-gray-200 mb-4">
                    Développez vos compétences en entretien client, recrutement et prospection commerciale
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/amoa/roleplay');
                    }}
                  >
                    Accéder aux jeux de rôle
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            
              {/* PROJET ACADEMY */}
              <div 
                className={`cyber-edge-distort relative overflow-hidden p-6 cursor-pointer ${
                  highContrastMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-gradient-to-br from-indigo-600 to-indigo-900 border-2 border-indigo-400/50 shadow-lg shadow-indigo-500/50'
                } hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
                onClick={() => navigate('/amoa/projet-academy')}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 rounded-lg ${
                    highContrastMode 
                      ? 'bg-indigo-800' 
                      : 'bg-gradient-to-r from-indigo-500 to-indigo-700 shadow-md'
                  }`}>
                    <BsClipboardCheck className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-center text-2xl font-bold mb-2">PROJET ACADEMY</h3>
                <p className="text-center text-indigo-300 mt-2">
                  Centre de formation aux méthodes et outils de gestion de projet mc2i
                </p>
                <div className="text-center flex flex-col items-center mt-4">
                  <p className="text-gray-200 mb-4">
                    Maîtrisez les bonnes pratiques, méthodologies agiles et gestion documentaire
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white px-6 py-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/amoa/projet-academy');
                    }}
                  >
                    Explorer les formations
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* CONSULTANT LAB */}
              <div 
                className={`cyber-edge-distort relative overflow-hidden p-6 cursor-pointer ${
                  highContrastMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-gradient-to-br from-purple-600 to-indigo-900 border-2 border-purple-400/50 shadow-lg shadow-purple-500/50'
                } hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
                onClick={() => navigate('/amoa/consultant-lab')}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 rounded-lg ${
                    highContrastMode 
                      ? 'bg-purple-800' 
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md'
                  }`}>
                    <IoAnalytics className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-center text-2xl font-bold mb-2">CONSULTANT LAB</h3>
                <p className="text-center text-purple-300 mt-2">
                  Environnement d'apprentissage pour maîtriser l'analyse et la transformation métier
                </p>
                <div className="text-center flex flex-col items-center mt-4">
                  <p className="text-gray-200 mb-4">
                    Développez vos compétences d'analyse avec des exercices pratiques et interactifs
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/amoa/consultant-lab');
                    }}
                  >
                    Accéder au laboratoire
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}