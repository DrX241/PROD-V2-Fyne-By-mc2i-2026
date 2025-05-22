import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import '../styles/data-ia.css';
import { motion } from 'framer-motion';
import { 
  ArrowRight
} from 'lucide-react';

// Fond d'écran optimisé via CSS au lieu d'image lourde
import { 
  IoHome, 
  IoBookOutline, 
  IoDesktopOutline, 
  IoTrophyOutline, 
  IoConstructOutline
} from 'react-icons/io5';
import { IoMdArrowForward } from 'react-icons/io';
import { Users, ZoomIn, ZoomOut } from 'lucide-react';
import { 
  BsKanban, 
  BsPeopleFill, 
  BsClipboardCheck, 
  BsGearFill,
  BsLightbulb, 
  BsBookmarkCheck, 
  BsClipboardData, 
  BsFileEarmarkText,
  BsFileEarmarkCode, 
  BsBriefcase,
  BsGraphUp,
} from 'react-icons/bs';

import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import { useTutorial } from '@/contexts/TutorialContext';
import { DataButton } from '@/components/DataButton';
import PageTitle from '@/components/utils/PageTitle';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function DataIAModeSelection() {
  const [, setLocation] = useLocation();
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [textSize, setTextSize] = useState(1);
  const [simplifiedUI, setSimplifiedUI] = useState(false);
  const [accessibilityPanelOpen, setAccessibilityPanelOpen] = useState(false);
  const { currentTour, setCurrentTour, startTutorial } = useTutorial();
  
  // Utilisation d'useEffect pour initialiser le textSize à partir de localStorage
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
  
  // Utilisation d'useEffect pour stocker les préférences utilisateur
  useEffect(() => {
    // Utiliser des clés globales pour garantir la cohérence entre tous les modules
    localStorage.setItem('accessibilityTextSize', textSize.toString());
    localStorage.setItem('accessibilityHighContrastMode', highContrastMode.toString());
    localStorage.setItem('accessibilitySimplifiedUI', simplifiedUI.toString());
  }, [textSize, highContrastMode, simplifiedUI]);
  
  const startTour = () => {
    console.log('Démarrage du tutoriel:', currentTour);
    // Implémentation à venir
  };

  return (
    <HomeLayout>
      <div id="data-ia-mode-selection" className={`min-h-screen pb-20 ${
        highContrastMode 
          ? 'bg-black text-white' 
          : 'text-white'
      }`} style={{ 
        fontSize: `${textSize}rem`,
        backgroundImage: highContrastMode 
          ? 'none' 
          : 'linear-gradient(135deg, #1a365d 0%, #0f2240 100%), radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.2) 0%, transparent 70%), radial-gradient(circle at 70% 60%, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}>
        {/* Overlay pour assurer la lisibilité du contenu */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a5f]/80 to-[#102848]/90 z-0"></div>
        
        {/* Contenu de la page, avec z-10 pour le mettre au-dessus de l'overlay */}
        <div className="relative z-10">
          {/* Navigation et contrôles */}
          <div className="px-8 py-8 relative max-w-[1600px] w-full mx-auto">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center">
                <Link href="/">
                  <DataButton 
                    variant="outline"
                    size="lg"
                    className="text-blue-300 border-blue-300/30 hover:bg-blue-900/20"
                    startIcon={<IoHome className="h-6 w-6" />}
                  >
                    Accueil
                  </DataButton>
                </Link>
                <PageTitle title="I AM DATA & IA" />
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
                            <ZoomOut className="h-3.5 w-3.5 text-blue-300" />
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
                            <ZoomIn className="h-3.5 w-3.5 text-blue-300" />
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
            
            {/* Titre et sous-titre */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16 relative"
              data-id="main-title"
            >
              <h1 className="font-bold mb-4 font-data-title relative" style={{ fontSize: `calc(3rem * ${textSize})` }}>
                <span className={`${highContrastMode ? 'text-yellow-100' : 'text-white'}`}>
                  Centre de Formation
                </span>
                <br />
                <span className={`mt-2 block tracking-wider ${
                  highContrastMode 
                    ? 'text-yellow-300' 
                    : 'bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent'
                }`} style={{ fontSize: `calc(3.5rem * ${textSize})` }}>
                  I AM DATA & IA
                </span>
              </h1>
              <div className={`w-40 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 mx-auto my-6 rounded-full`} 
                style={{ width: `calc(10rem * ${textSize})` }}></div>
              <p className={`max-w-3xl mx-auto ${
                highContrastMode ? 'text-gray-300' : 'text-blue-100' 
              }`} style={{ fontSize: `calc(1.25rem * ${textSize})` }}>
                Trouvez votre parcours d'apprentissage personnalisé en 
                <span className={`font-semibold ${highContrastMode ? 'text-yellow-300' : 'text-blue-300'}`}>
                  Data Science
                </span> et 
                <span className={`font-semibold ${highContrastMode ? 'text-yellow-300' : 'text-purple-300'}`}>
                  Intelligence Artificielle
                </span>
              </p>
            </motion.div>

            {/* Modules Data & IA */}
            <div className="mt-8 px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center max-w-4xl mx-auto">
                {/* DATA & IA ACADEMY - CAMPUS FORMATION */}
                <div 
                  className={`cyber-edge-distort relative overflow-hidden p-6 ${
                    highContrastMode 
                      ? 'bg-gray-800 border border-gray-700' 
                      : 'bg-gradient-to-br from-blue-600 to-blue-900 border-2 border-blue-400/50 shadow-lg shadow-blue-500/50'
                  } hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
                >
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-lg ${
                      highContrastMode 
                        ? 'bg-blue-800' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-700 shadow-md'
                    }`}>
                      <IoBookOutline 
                        className={`${highContrastMode ? 'text-yellow-300' : 'text-white'}`} 
                        style={{ 
                          height: `calc(2rem * ${textSize})`, 
                          width: `calc(2rem * ${textSize})` 
                        }} 
                      />
                    </div>
                  </div>
                  <h3 className={`text-center font-data-title mb-2 ${highContrastMode ? 'text-yellow-300' : 'text-white'}`} 
                    style={{ 
                      fontSize: `calc(1.5rem * ${textSize})`,
                      lineHeight: "1.2"
                    }}>
                    DATA & IA ACADÉMIE
                  </h3>
                  <p className={`text-center ${highContrastMode ? 'text-gray-300' : 'text-blue-300'} mt-2`}
                    style={{ fontSize: `calc(1rem * ${textSize})` }}>
                    Centre de formation complet en data science, IA et métiers de la data
                  </p>
                  <div className="text-center flex flex-col items-center mt-6">
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-5"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation('/data-ia/sas-academie');
                      }}
                    >
                      Je découvre l'académie
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* DATA & IA ROLE PLAY */}
                <div 
                  className={`cyber-edge-distort relative overflow-hidden p-6 ${
                    highContrastMode 
                      ? 'bg-gray-800 border border-gray-700' 
                      : 'bg-gradient-to-br from-violet-600 to-purple-900 border-2 border-violet-400/50 shadow-lg shadow-violet-500/50'
                  } hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
                >
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-lg ${
                      highContrastMode 
                        ? 'bg-purple-900' 
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md'
                    }`}>
                      <BsFileEarmarkCode 
                      className={`${highContrastMode ? 'text-yellow-300' : 'text-white'}`} 
                      style={{ 
                        height: `calc(2rem * ${textSize})`, 
                        width: `calc(2rem * ${textSize})` 
                      }} 
                    />
                    </div>
                  </div>
                  <h3 className={`text-center font-data-title mb-2 ${highContrastMode ? 'text-yellow-300' : 'text-white'}`} 
                    style={{ 
                      fontSize: `calc(1.5rem * ${textSize})`,
                      lineHeight: "1.2"
                    }}>
                    DATA & IA ROLE PLAY
                  </h3>
                  <p className={`text-center ${highContrastMode ? 'text-gray-300' : 'text-violet-300'} mt-2`}
                    style={{ fontSize: `calc(1rem * ${textSize})` }}>
                    Jeux de rôle immersifs pour l'apprentissage data et IA
                  </p>
                  <div className="text-center flex flex-col items-center mt-6">
                    <Button 
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-5"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation('/data-ia/roleplay');
                      }}
                    >
                      J'incarne un rôle
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
