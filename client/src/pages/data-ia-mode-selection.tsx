import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import '../styles/data-ia.css';
import { motion } from 'framer-motion';
import { 
  ArrowRight,
  Trophy
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
      <div id="data-ia-mode-selection" className={`min-h-screen pb-20 relative ${
        highContrastMode 
          ? 'bg-black text-white' 
          : 'text-white'
      }`} style={{ fontSize: `${textSize}rem` }}>
        
        {/* Fond innovant Data & IA en CSS pur - Chargement instantané */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Dégradé de base plus moderne et vibrant */}
          <div 
            className="absolute inset-0" 
            style={{
              backgroundColor: highContrastMode ? '#000000' : simplifiedUI ? '#1E1E3F' : 'transparent',
              backgroundImage: highContrastMode || simplifiedUI
                ? 'none'
                : 'linear-gradient(135deg, #231942 0%, #5E548E 100%)'
            }}
          ></div>
          
          {/* Grille de données - Matrices et vecteurs */}
          {!highContrastMode && !simplifiedUI && (
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-full h-full" style={{
                backgroundImage: 'linear-gradient(90deg, rgba(147,51,234,0.1) 1px, transparent 1px), linear-gradient(180deg, rgba(147,51,234,0.1) 1px, transparent 1px)',
                backgroundSize: '25px 25px'
              }}></div>
            </div>
          )}
          
          {/* Éléments symbolisant des structures de données */}
          {!highContrastMode && !simplifiedUI && (
            <div className="absolute inset-0 opacity-30">
              <div className="absolute w-full h-full" style={{
                backgroundImage: 'radial-gradient(circle, rgba(192,132,252,0.3) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }}></div>
            </div>
          )}
          
          {/* Motif représentant des connexions neuronales */}
          {!highContrastMode && !simplifiedUI && (
            <div 
              className="absolute inset-0 opacity-20" 
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Cg fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.3\'%3E%3Cpath opacity=\'.5\' d=\'M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                backgroundSize: '100px 100px'
              }}
            ></div>
          )}
          
          {/* Clusters lumineux représentant les centres de données */}
          <div className="absolute top-[20%] right-[20%] w-[35%] h-[35%] rounded-full" style={{
            background: 'radial-gradient(circle, rgba(167,139,250,0.4) 0%, transparent 70%)'
          }}></div>
          
          <div className="absolute bottom-[10%] left-[25%] w-[30%] h-[40%] rounded-full" style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)'
          }}></div>
          
          {/* Effet de vagues de données */}
          <div className="absolute bottom-0 left-0 w-full h-[50%]" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1200 120\' preserveAspectRatio=\'none\'%3E%3Cpath d=\'M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z\' fill=\'%238b5cf6\' fill-opacity=\'0.2\'%3E%3C/path%3E%3C/svg%3E")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: '0.4'
          }}></div>
          
          {/* Lignes horizontales symbolisant le traitement parallèle des données */}
          <div className="absolute top-[30%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60"></div>
          <div className="absolute top-[70%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60"></div>
        </div>
        
        {/* Contenu de la page, avec z-10 pour le mettre au-dessus du fond */}
        <div className="relative z-10">
          {/* Navigation et contrôles */}
          <div className="px-8 py-8 relative max-w-[1600px] w-full mx-auto">
            <div className="flex justify-between items-center mb-10">
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
                    className="text-blue-300 border-blue-300/30 hover:bg-blue-900/20 cursor-pointer"
                    startIcon={<IoHome className="h-6 w-6" />}
                  >
                    Accueil
                  </DataButton>
                </div>
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
                Trouvez votre parcours d'apprentissage personnalisé en{' '}
                <span className={`font-semibold ${highContrastMode ? 'text-yellow-300' : 'text-blue-300'}`}>
                  Data Science
                </span>{' '}et{' '}
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

                {/* DATA CHALLENGE */}
                <div 
                  className={`cyber-edge-distort relative overflow-hidden p-6 col-span-1 md:col-span-2 ${
                    highContrastMode 
                      ? 'bg-gray-800 border border-gray-700' 
                      : 'bg-gradient-to-br from-sky-600/60 to-indigo-900 border-2 border-sky-400/50 shadow-lg shadow-sky-500/30'
                  } hover:shadow-lg hover:scale-[1.01] transition-all duration-300`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-center justify-center md:justify-start">
                      <div className={`p-3 rounded-lg ${
                        highContrastMode 
                          ? 'bg-yellow-800' 
                          : 'bg-gradient-to-r from-sky-500 to-blue-600 shadow-md'
                      }`}>
                        <Trophy 
                          className={`${highContrastMode ? 'text-yellow-300' : 'text-white'}`} 
                          style={{ 
                            height: `calc(2rem * ${textSize})`, 
                            width: `calc(2rem * ${textSize})` 
                          }} 
                        />
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className={`font-data-title mb-1 ${highContrastMode ? 'text-yellow-300' : 'text-white'}`} 
                        style={{ 
                          fontSize: `calc(1.5rem * ${textSize})`,
                          lineHeight: "1.2"
                        }}>
                        DATA CHALLENGE
                      </h3>
                      <p className={`${highContrastMode ? 'text-gray-300' : 'text-sky-200'}`}
                        style={{ fontSize: `calc(0.95rem * ${textSize})` }}>
                        Testez vos connaissances SQL, Power BI, Python et Excel avec des quiz à 3 niveaux
                      </p>
                    </div>
                    <div className="flex justify-center md:justify-end">
                      <Button 
                        className="bg-gradient-to-r from-sky-500 to-blue-700 hover:from-sky-600 hover:to-blue-800 text-white px-6 py-5 whitespace-nowrap"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation('/data-ia/data-challenge');
                        }}
                      >
                        Je me challenge
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
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
