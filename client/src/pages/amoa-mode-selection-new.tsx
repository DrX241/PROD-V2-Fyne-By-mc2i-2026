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
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Users, ZoomIn, ZoomOut } from 'lucide-react';
// Import des images mc2i
import mc2iSloganImage from "@assets/image_1747585779637.png";
import mc2iLogoImage from "@assets/image_1747585797449.png";

export default function AmoaModeSelectionNew() {
  // États
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [textSize, setTextSize] = useState(1); // 1 = normal, >1 = larger, <1 = smaller
  const [simplifiedUI, setSimplifiedUI] = useState(false);
  const [accessibilityPanelOpen, setAccessibilityPanelOpen] = useState(false);
  const [, navigate] = useLocation();
  
  // Chargement des préférences d'accessibilité
  React.useEffect(() => {
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
  
  // Sauvegarde des préférences d'accessibilité
  React.useEffect(() => {
    // Utiliser des clés globales pour garantir la cohérence entre tous les modules
    localStorage.setItem('accessibilityTextSize', textSize.toString());
    localStorage.setItem('accessibilityHighContrastMode', highContrastMode.toString());
    localStorage.setItem('accessibilitySimplifiedUI', simplifiedUI.toString());
  }, [textSize, highContrastMode, simplifiedUI]);

  return (
    <HomeLayout>
      <PageTitle title="I AM mc2i" />
      <div 
        className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-800 via-[#006a9e] to-blue-900"
        style={{ fontSize: `${textSize}rem` }}
      >
        {/* Images mc2i en arrière-plan avec chargement progressif */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Overlay semi-transparent pour améliorer le contraste avec le contenu */}
          <div className="absolute inset-0 bg-blue-950/40 z-10"></div>
          
          {/* Fond de base qui s'affiche immédiatement */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900"></div>
          
          {/* Première moitié de l'écran - Slogan */}
          <div className="absolute top-0 left-0 w-1/2 h-full flex items-center justify-center opacity-60">
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${mc2iSloganImage})`,
                filter: 'contrast(1.1) brightness(1.05)',
                backgroundSize: 'cover'
              }}
            ></div>
          </div>
          
          {/* Seconde moitié de l'écran - Logo */}
          <div className="absolute top-0 right-0 w-1/2 h-full flex items-center justify-center bg-blue-950 opacity-60">
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${mc2iLogoImage})`,
                filter: 'contrast(1.2) brightness(1.1)',
                backgroundSize: 'cover'
              }}
            ></div>
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

        {/* Panneau d'accessibilité */}
        <div className="absolute top-4 right-4 z-20">
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
                </div>
              </div>
            </PopoverContent>
          </Popover>
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
                I AM mc2i
              </span>
            </h1>
            <div className={`h-1 bg-gradient-to-r from-blue-400 to-indigo-500 mx-auto my-6 rounded-full`} 
              style={{ width: `calc(10rem * ${textSize})` }}></div>
            <p className={`max-w-3xl mx-auto ${
              highContrastMode ? 'text-gray-300' : 'text-blue-100' 
            }`} style={{ fontSize: `calc(1.25rem * ${textSize})` }}>
              Assistant de formation intelligent pour les métiers de la 
              <span className={`font-semibold ${highContrastMode ? 'text-yellow-300' : 'text-blue-300'}`}>
                transformation numérique
              </span>
            </p>
          </motion.div>

          {/* Modules mc2i */}
          <div className="mt-8 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center max-w-4xl mx-auto">
              {/* mc2i ACADEMIE */}
              <div 
                className={`cyber-edge-distort relative overflow-hidden p-6 ${
                  highContrastMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-gradient-to-br from-indigo-600 to-indigo-900 border-2 border-indigo-400/50 shadow-lg shadow-indigo-500/50'
                } hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-3 rounded-lg ${
                    highContrastMode 
                      ? 'bg-indigo-800' 
                      : 'bg-gradient-to-r from-indigo-500 to-indigo-700 shadow-md'
                  }`}>
                    <BsClipboardCheck 
                      className={`${highContrastMode ? 'text-yellow-300' : 'text-white'}`} 
                      style={{ 
                        height: `calc(2rem * ${textSize})`, 
                        width: `calc(2rem * ${textSize})` 
                      }} 
                    />
                  </div>
                </div>
                <h3 className={`text-center font-bold mb-2 ${highContrastMode ? 'text-yellow-300' : 'text-white'}`} 
                  style={{ 
                    fontSize: `calc(1.5rem * ${textSize})`,
                    lineHeight: "1.2"
                  }}>
                  mc2i ACADEMIE
                </h3>
                <p className={`text-center ${highContrastMode ? 'text-gray-300' : 'text-indigo-300'} mt-2`}
                  style={{ fontSize: `calc(1rem * ${textSize})` }}>
                  Centre de formation aux méthodes et outils de gestion de projet mc2i
                </p>
                <div className="text-center flex flex-col items-center mt-4">
                  <Button 
                    className="bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white px-6 py-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/amoa/sas-academie');
                    }}
                  >
                    Je découvre l'académie
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            
              {/* mc2i ROLE PLAY */}
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
                    <IoVideocam 
                      className={`${highContrastMode ? 'text-yellow-300' : 'text-white'}`} 
                      style={{ 
                        height: `calc(2rem * ${textSize})`, 
                        width: `calc(2rem * ${textSize})` 
                      }} 
                    />
                  </div>
                </div>
                <h3 className={`text-center font-bold mb-2 ${highContrastMode ? 'text-yellow-300' : 'text-white'}`} 
                  style={{ 
                    fontSize: `calc(1.5rem * ${textSize})`,
                    lineHeight: "1.2"
                  }}>
                  mc2i ROLE PLAY
                </h3>
                <p className={`text-center ${highContrastMode ? 'text-gray-300' : 'text-blue-300'} mt-2`}
                  style={{ fontSize: `calc(1rem * ${textSize})` }}>
                  Simulations métier et situations professionnelles interactives
                </p>
                <div className="text-center flex flex-col items-center mt-4">
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/amoa/roleplay');
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
    </HomeLayout>
  );
}