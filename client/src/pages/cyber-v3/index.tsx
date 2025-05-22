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
  const [animationsReduced, setAnimationsReduced] = useState(false);
  const [accessibilityPanelOpen, setAccessibilityPanelOpen] = useState(false);
  
  // Utilisation d'useEffect pour initialiser les paramètres depuis localStorage
  useEffect(() => {
    const storedTextSize = localStorage.getItem('cyberTextSize');
    if (storedTextSize) {
      setTextSize(parseFloat(storedTextSize));
    }
    
    const storedHighContrastMode = localStorage.getItem('cyberHighContrastMode');
    if (storedHighContrastMode) {
      setHighContrastMode(storedHighContrastMode === 'true');
    }
    
    const storedSimplifiedUI = localStorage.getItem('cyberSimplifiedUI');
    if (storedSimplifiedUI) {
      setSimplifiedUI(storedSimplifiedUI === 'true');
    }
    
    const storedAnimationsReduced = localStorage.getItem('cyberAnimationsReduced');
    if (storedAnimationsReduced) {
      setAnimationsReduced(storedAnimationsReduced === 'true');
    }
  }, []);
  
  // Sauvegarde des préférences utilisateur
  useEffect(() => {
    localStorage.setItem('cyberTextSize', textSize.toString());
    localStorage.setItem('cyberHighContrastMode', highContrastMode.toString());
    localStorage.setItem('cyberSimplifiedUI', simplifiedUI.toString());
    localStorage.setItem('cyberAnimationsReduced', animationsReduced.toString());
  }, [textSize, highContrastMode, simplifiedUI, animationsReduced]);

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
      
      <div className="min-h-screen relative"
        style={{ 
          fontSize: `${textSize}rem`
        }}>
        {/* Fond optimisé avec CSS pour chargement ultra-rapide */}
        <div className="absolute inset-0 z-0" 
          style={{
            backgroundImage: 'linear-gradient(135deg, #000814 0%, #001233 100%), radial-gradient(circle at 30% 40%, rgba(0, 150, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(32, 128, 208, 0.1) 0%, transparent 50%)'
          }}
        >
          {/* Éléments décoratifs pour créer un effet cyber */}
          <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-blue-900/20 to-transparent"></div>
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] rounded-full bg-blue-500/5 blur-3xl"></div>
          <div className="absolute bottom-[30%] left-[20%] w-[20%] h-[30%] rounded-full bg-cyan-500/5 blur-3xl"></div>
        </div>
        
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
                      
                      {/* Réduire les animations */}
                      <div className="flex items-center justify-between">
                        <Label htmlFor="reduce-animations" className="text-blue-100">Réduire les animations</Label>
                        <Switch 
                          id="reduce-animations" 
                          checked={animationsReduced} 
                          onCheckedChange={setAnimationsReduced}
                          aria-label="Réduire les animations"
                        />
                      </div>
                      
                      {/* Mode sombre */}
                      <div className="flex items-center justify-between">
                        <Label htmlFor="dark-mode" className="text-blue-100">Mode sombre</Label>
                        <Switch 
                          id="dark-mode" 
                          checked={themeMode === 'dark'} 
                          onCheckedChange={(checked) => setThemeMode(checked ? 'dark' : 'futuristic')}
                          aria-label="Activer le mode sombre"
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center max-w-4xl mx-auto">
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
                <p className="text-center text-blue-300 mt-2 whitespace-nowrap overflow-hidden text-overflow-ellipsis px-2">
                  Centre de formation complet au métier de la cyber
                </p>
                <div className="mt-6">
                  <div className="text-center">
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-5 w-full"
                      onClick={(e) => {
                        setLocation('/cyber/sas-academie');
                      }}
                    >
                      Je découvre l'académie
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
                <p className="text-center text-cyan-300 mt-2 whitespace-nowrap overflow-hidden text-overflow-ellipsis px-2">
                  Jeux de rôle immersifs pour l'apprentissage en cyber
                </p>
                <div className="mt-6">
                  <div className="text-center">
                    <Button 
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-5 w-full"
                      onClick={(e) => {
                        setLocation('/cyber/roleplay');
                      }}
                    >
                      J'incarne un rôle
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