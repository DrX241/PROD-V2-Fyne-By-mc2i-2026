import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  ArrowRight,
  Shield,
  Terminal,
  Users,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { IoHome, IoSchoolOutline } from 'react-icons/io5';
import { BsShieldLock } from 'react-icons/bs';
import { FiSun, FiMoon } from 'react-icons/fi';
import { AiOutlineZoomIn, AiOutlineZoomOut } from 'react-icons/ai';

// Arrière-plan optimisé en CSS pur pour un chargement rapide

import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
//import CyberScene from '@/components/CyberScene';
import { useTutorial } from '@/contexts/TutorialContext';
import { useTheme } from '@/contexts/ThemeContext';
import { DataButton } from '@/components/DataButton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import HomeLayout from '@/components/layout/HomeLayout';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function CyberV3() {
  const [, setLocation] = useLocation();
  const { currentTour, setCurrentTour, startTutorial } = useTutorial();
  const { themeMode, setThemeMode } = useTheme();
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [textSize, setTextSize] = useState(1);
  const [simplifiedUI, setSimplifiedUI] = useState(false);
  const [accessibilityPanelOpen, setAccessibilityPanelOpen] = useState(false);
  
  // Utilisation d'useEffect pour initialiser les paramètres depuis localStorage avec des clés globales
  useEffect(() => {
    // Utiliser des clés globales pour garantir la cohérence entre tous les modules
    const storedTextSize = localStorage.getItem('accessibilityTextSize');
    if (storedTextSize) {
      setTextSize(parseFloat(storedTextSize));
    }
    
    const storedHighContrastMode = localStorage.getItem('accessibilityHighContrastMode');
    if (storedHighContrastMode) {
      setHighContrastMode(storedHighContrastMode === 'true');
    }
    
    const storedSimplifiedUI = localStorage.getItem('accessibilitySimplifiedUI');
    if (storedSimplifiedUI) {
      setSimplifiedUI(storedSimplifiedUI === 'true');
    }
  }, []);
  
  // Sauvegarde des préférences utilisateur avec des clés globales
  useEffect(() => {
    // Utiliser des clés globales pour garantir la cohérence entre tous les modules
    localStorage.setItem('accessibilityTextSize', textSize.toString());
    localStorage.setItem('accessibilityHighContrastMode', highContrastMode.toString());
    localStorage.setItem('accessibilitySimplifiedUI', simplifiedUI.toString());
  }, [textSize, highContrastMode, simplifiedUI]);

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
      
      <div className="min-h-screen h-screen flex flex-col relative"
        style={{ 
          fontSize: `${textSize}rem`
        }}>
        {/* Fond dynamique cybersécurité en CSS pur - Chargement instantané */}
        <div className="absolute inset-0 z-0 overflow-hidden"> 
          {/* Arrière-plan de base avec dégradé plus visible et dynamique */}
          <div 
            className="absolute inset-0" 
            style={{
              backgroundColor: highContrastMode ? '#000000' : simplifiedUI ? '#091428' : 'transparent',
              backgroundImage: highContrastMode || simplifiedUI 
                ? 'none' 
                : 'linear-gradient(135deg, #000c29 0%, #0a2342 100%)'
            }}
          ></div>
          
          {/* Grille de sécurité numérique - Motif hexagonal */}
          {!highContrastMode && !simplifiedUI && (
            <div 
              className="absolute inset-0 opacity-40" 
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%230ea5e9\' fill-opacity=\'0.15\' d=\'M12,4.5C7,4.5,2.73,7.61,1,12c1.73,4.39,6,7.5,11,7.5s9.27-3.11,11-7.5C21.27,7.61,17,4.5,12,4.5z M12,17c-2.76,0-5-2.24-5-5s2.24-5,5-5,5,2.24,5,5S14.76,17,12,17z M12,9c-1.66,0-3,1.34-3,3s1.34,3,3,3,3-1.34,3-3S13.66,9,12,9z\'/%3E%3C/svg%3E")',
                backgroundSize: '40px 40px'
              }}
            ></div>
          )}
          
          {/* Circuit board effect - Lignes verticales et horizontales */}
          {!highContrastMode && !simplifiedUI && (
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-full h-full" style={{ 
                backgroundImage: 'linear-gradient(90deg, rgba(56,189,248,0.1) 1px, transparent 1px), linear-gradient(180deg, rgba(56,189,248,0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
            </div>
          )}
          
          {/* Points de connexion - Symbolise les noeuds d'un réseau */}
          {!highContrastMode && !simplifiedUI && (
            <div className="absolute inset-0 opacity-30">
              <div className="absolute w-full h-full" style={{
                backgroundImage: 'radial-gradient(circle, rgba(14,165,233,0.3) 1px, transparent 1px)',
                backgroundSize: '60px 60px'
              }}></div>
            </div>
          )}
          
          {/* Éléments lumineux pour un effet "cyber" plus visible */}
          <div className="absolute top-[10%] right-[15%] w-[30%] h-[40%] rounded-full" style={{
            background: 'radial-gradient(circle, rgba(14,165,233,0.3) 0%, transparent 70%)'
          }}></div>
          
          <div className="absolute bottom-[20%] left-[15%] w-[35%] h-[30%] rounded-full" style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)'
          }}></div>
          
          {/* Animation digitale symbolisant les flux de données */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(56, 189, 248, 0.1) 25%, rgba(56, 189, 248, 0.1) 26%, transparent 27%, transparent 74%, rgba(56, 189, 248, 0.1) 75%, rgba(56, 189, 248, 0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(56, 189, 248, 0.1) 25%, rgba(56, 189, 248, 0.1) 26%, transparent 27%, transparent 74%, rgba(56, 189, 248, 0.1) 75%, rgba(56, 189, 248, 0.1) 76%, transparent 77%, transparent)',
            backgroundSize: '80px 80px',
            animation: 'moveVertical 8s linear infinite'
          }}></div>
          
          {/* Ligne horizontale lumineuse représentant l'analyse en temps réel */}
          <div className="absolute top-[50%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-60"></div>
        </div>
        
        {/* Navigation et contrôles - Position fixe */}
        <div className="sticky top-0 left-0 right-0 z-50 bg-blue-900/80 backdrop-blur-sm border-b border-blue-500/30 shadow-md">
          <div className="px-8 py-4 max-w-[1600px] w-full mx-auto">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div
                  onClick={() => {
                    setLocation('/');
                    // Force le scroll vers la section modules après que la page soit chargée
                    setTimeout(() => {
                      document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  <DataButton 
                    variant="outline"
                    size="lg"
                    className="text-cyan-300 border-cyan-300/30 hover:bg-cyan-900/20 cursor-pointer"
                    startIcon={<IoHome className="h-6 w-6" />}
                  >
                    Accueil
                  </DataButton>
                </div>
              </div>
              
              {/* Panneau d'accessibilité */}
              <div className="flex items-center gap-2">
                <Popover open={accessibilityPanelOpen} onOpenChange={setAccessibilityPanelOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="secondary"
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-400"
                      size="sm"
                      aria-label="Options d'accessibilité"
                    >
                      <Users className="h-4 w-4" />
                      <span>Accessibilité</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 bg-slate-900 border border-blue-500 text-white p-4" align="end">
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg text-center text-blue-300">Options d'accessibilité</h3>
                      
                      {/* Taille du texte */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="text-size" className="text-blue-100">Taille du texte</Label>
                          <span className="text-blue-300 text-sm">{Math.round(textSize * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7 rounded-full bg-slate-800 border-blue-500/50"
                            onClick={() => setTextSize(Math.max(0.8, textSize - 0.1))}
                            aria-label="Réduire la taille du texte"
                          >
                            <AiOutlineZoomOut className="h-3.5 w-3.5 text-blue-300" />
                          </Button>
                          <Slider 
                            id="text-size"
                            min={0.8} 
                            max={1.5} 
                            step={0.05} 
                            value={[textSize]} 
                            onValueChange={(value) => setTextSize(value[0])}
                            className="flex-1"
                            aria-label="Ajuster la taille du texte"
                          />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7 rounded-full bg-slate-800 border-blue-500/50"
                            onClick={() => setTextSize(Math.min(1.5, textSize + 0.1))}
                            aria-label="Augmenter la taille du texte"
                          >
                            <AiOutlineZoomIn className="h-3.5 w-3.5 text-blue-300" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Mode haut contraste */}
                        <div className="flex items-center justify-between">
                          <Label htmlFor="high-contrast" className="text-blue-100">Mode haut contraste</Label>
                          <Switch 
                            id="high-contrast" 
                            checked={highContrastMode} 
                            onCheckedChange={setHighContrastMode}
                            aria-label="Activer le mode haut contraste"
                          />
                        </div>
                        
                        {/* Interface simplifiée */}
                        <div className="flex items-center justify-between">
                          <Label htmlFor="simplified-ui" className="text-blue-100">Interface simplifiée</Label>
                          <Switch 
                            id="simplified-ui" 
                            checked={simplifiedUI} 
                            onCheckedChange={setSimplifiedUI}
                            aria-label="Activer l'interface simplifiée"
                          />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contenu principal avec marge pour éviter le chevauchement avec la navigation fixe */}
        <div className="px-8 py-8 relative max-w-[1600px] w-full mx-auto mt-4">
          
          {/* Titre et sous-titre */}
          <motion.div 
            initial={simplifiedUI ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={simplifiedUI ? { duration: 0 } : { duration: 0.5 }}
            className="text-center mb-16 relative z-10"
            style={{ fontSize: `${textSize}rem` }}
          >
            <h1 className="font-bold mb-4 font-data-title relative">
              <div className={`${
                highContrastMode ? 'text-yellow-300' : 'text-white'
              }`} style={{ fontSize: `calc(2.5rem * ${textSize})` }}>Centre de Formation</div>
              <div className={`mt-4 block tracking-wider ${
                highContrastMode 
                  ? 'text-white'
                  : simplifiedUI
                    ? 'text-blue-300'
                    : 'bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent'
              }`} style={{ fontSize: `calc(3.5rem * ${textSize})` }}>
                I AM CYBER
              </div>
            </h1>
            <div className={`h-2 mx-auto my-6 rounded-full ${
              highContrastMode 
                ? 'w-48 bg-white' 
                : simplifiedUI
                  ? 'w-48 bg-blue-500'
                  : 'w-48 bg-gradient-to-r from-cyan-400 to-blue-500'
            }`}></div>
            <p className={`max-w-3xl mx-auto ${
              highContrastMode 
                ? 'text-white' 
                : simplifiedUI
                  ? 'text-blue-50'
                  : 'text-blue-100' 
            }`} style={{ fontSize: `calc(1.8rem * ${textSize})` }}>
              Trouvez votre parcours d'apprentissage personnalisé en <span className={`font-semibold ${
                highContrastMode 
                  ? 'text-yellow-300' 
                  : simplifiedUI 
                    ? 'text-blue-200'
                    : 'text-cyan-300'
              }`}>cybersécurité</span>
            </p>
          </motion.div>

          {/* Modules Cyber */}
          <div className="mt-8 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center max-w-4xl mx-auto">
              {/* CYBER ACADÉMIE */}
              <motion.div 
                whileHover={simplifiedUI ? {} : { scale: 1.03 }}
                className={`cyber-edge-distort relative overflow-hidden p-6 ${
                  highContrastMode 
                    ? 'bg-black border-2 border-white' 
                    : simplifiedUI 
                      ? 'bg-blue-800 border border-blue-400'
                      : 'bg-gradient-to-br from-blue-600 to-blue-900 border-2 border-blue-400/50 shadow-lg shadow-blue-500/50'
                } hover:shadow-xl transition-all duration-300`}
                style={{ fontSize: `${textSize}rem` }}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 rounded-lg ${
                    highContrastMode 
                      ? 'bg-blue-900 border border-white' 
                      : simplifiedUI
                        ? 'bg-blue-700'
                        : 'bg-gradient-to-r from-blue-500 to-blue-700 shadow-md'
                  }`}>
                    <IoSchoolOutline className={`${highContrastMode ? 'text-yellow-300' : 'text-white'}`} 
                      style={{ 
                        height: `calc(2rem * ${textSize})`, 
                        width: `calc(2rem * ${textSize})` 
                      }} />
                  </div>
                </div>
                <h3 className={`text-center font-data-title mb-2 ${highContrastMode ? 'text-yellow-300' : 'text-white'}`} 
                  style={{ 
                    fontSize: `calc(1.75rem * ${textSize})`,
                    lineHeight: "1.2",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "2.5rem"
                  }}>
                  CYBER ACADÉMIE
                </h3>
                <p className={`text-center mt-2 px-2 ${
                  highContrastMode ? 'text-white' : simplifiedUI ? 'text-blue-100' : 'text-blue-300'
                }`} style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: "2",
                  WebkitBoxOrient: "vertical",
                  minHeight: "3rem",
                  lineHeight: "1.4"
                }}>
                  Centre de formation complet au métier de la cyber
                </p>
                <div className="mt-6">
                  <div className="text-center">
                    <Button 
                      className={`px-6 py-5 w-full ${
                        highContrastMode 
                          ? 'bg-blue-900 hover:bg-blue-800 text-white border-2 border-white' 
                          : simplifiedUI
                            ? 'bg-blue-700 hover:bg-blue-600 text-white'
                            : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white'
                      }`}
                      onClick={(e) => {
                        setLocation('/cyber/sas-academie');
                      }}
                    >
                      <span style={{ 
                        fontSize: `calc(1.1rem * ${textSize})`,
                        lineHeight: "1.2", 
                        display: "block" 
                      }}>Je découvre l'académie</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            
              {/* CYBER ROLE PLAY */}
              <motion.div 
                whileHover={simplifiedUI ? {} : { scale: 1.03 }}
                className={`cyber-edge-distort relative overflow-hidden p-6 ${
                  highContrastMode 
                    ? 'bg-black border-2 border-white' 
                    : simplifiedUI 
                      ? 'bg-cyan-800 border border-cyan-400'
                      : 'bg-gradient-to-br from-cyan-600 to-blue-900 border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/50'
                } hover:shadow-xl transition-all duration-300`}
                style={{ fontSize: `${textSize}rem` }}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 rounded-lg ${
                    highContrastMode 
                      ? 'bg-cyan-900 border border-white' 
                      : simplifiedUI
                        ? 'bg-cyan-700'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-md'
                  }`}>
                    <BsShieldLock className={`${highContrastMode ? 'text-yellow-300' : 'text-white'}`} 
                      style={{ 
                        height: `calc(2rem * ${textSize})`, 
                        width: `calc(2rem * ${textSize})` 
                      }} />
                  </div>
                </div>
                <h3 className={`text-center font-data-title mb-2 ${highContrastMode ? 'text-yellow-300' : 'text-white'}`} 
                  style={{ 
                    fontSize: `calc(1.75rem * ${textSize})`,
                    lineHeight: "1.2",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "2.5rem"
                  }}>
                  CYBER ROLE PLAY
                </h3>
                <p className={`text-center mt-2 px-2 ${
                  highContrastMode ? 'text-white' : simplifiedUI ? 'text-cyan-100' : 'text-cyan-300'
                }`} style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis", 
                  display: "-webkit-box",
                  WebkitLineClamp: "2",
                  WebkitBoxOrient: "vertical",
                  minHeight: "3rem",
                  lineHeight: "1.4"
                }}>
                  Jeux de rôle immersifs pour l'apprentissage en cyber
                </p>
                <div className="mt-6">
                  <div className="text-center">
                    <Button 
                      className={`px-6 py-5 w-full ${
                        highContrastMode 
                          ? 'bg-cyan-900 hover:bg-cyan-800 text-white border-2 border-white' 
                          : simplifiedUI
                            ? 'bg-cyan-700 hover:bg-cyan-600 text-white'
                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white'
                      }`}
                      onClick={(e) => {
                        setLocation('/cyber/roleplay');
                      }}
                    >
                      <span style={{ 
                        fontSize: `calc(1.1rem * ${textSize})`,
                        lineHeight: "1.2", 
                        display: "block" 
                      }}>J'incarne un rôle</span>
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