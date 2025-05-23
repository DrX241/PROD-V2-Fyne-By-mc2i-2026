import React, { useState, useEffect, useCallback } from 'react';
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

// Optimisation de la navigation avec mise en cache du composant

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
        className="h-screen flex flex-col relative overflow-hidden bg-gradient-to-b from-gray-800 via-[#006a9e] to-blue-900"
        style={{ 
          fontSize: `${textSize}rem`,
          overflowY: "auto"
        }}
      >
        {/* Fond d'écran élégant en CSS pur avec tracés graphiques - version plus claire */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Overlay semi-transparent pour améliorer le contraste avec le contenu - réduit */}
          <div className="absolute inset-0 bg-blue-950/20 z-10"></div>
          
          {/* Fond de base dégradé qui s'affiche immédiatement - plus clair */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-800"></div>
          
          {/* Motifs géométriques abstraits - côté gauche */}
          <div className="absolute top-0 left-0 w-1/2 h-full">
            {/* Cercles concentriques - plus visibles */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border-4 border-blue-200 opacity-40"></div>
            <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full border-2 border-blue-300 opacity-50 ml-12 mt-12"></div>
            
            {/* Lignes diagonales - plus visibles */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute top-0 left-1/3 w-1 h-[150%] bg-gradient-to-b from-transparent via-blue-200 to-transparent transform rotate-45 opacity-50"></div>
              <div className="absolute top-0 left-1/2 w-1 h-[150%] bg-gradient-to-b from-transparent via-blue-300 to-transparent transform rotate-45 opacity-40"></div>
              <div className="absolute top-0 left-2/3 w-1 h-[150%] bg-gradient-to-b from-transparent via-blue-200 to-transparent transform rotate-45 opacity-30"></div>
            </div>
            
            {/* Grille de points - plus visible */}
            <div className="absolute inset-0 opacity-50" 
                 style={{
                   backgroundImage: 'radial-gradient(circle, rgba(191,219,254,0.7) 1px, transparent 1px)',
                   backgroundSize: '30px 30px'
                 }}>
            </div>
          </div>
          
          {/* Motifs géométriques abstraits - côté droit */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-900/20">
            {/* Hexagones - plus visibles */}
            <div className="absolute inset-0 opacity-40"
                 style={{
                   backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'49\' viewBox=\'0 0 28 49\'%3E%3Cg fill-rule=\'evenodd\'%3E%3Cg id=\'hexagons\' fill=\'%238db0fe\' fill-opacity=\'0.6\' fill-rule=\'nonzero\'%3E%3Cpath d=\'M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                 }}>
            </div>
            
            {/* Vagues stylisées - plus visibles */}
            <div className="absolute bottom-0 right-0 w-full h-2/3 opacity-40"
                 style={{
                   backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1200 120\' preserveAspectRatio=\'none\'%3E%3Cpath d=\'M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z\' fill=\'%2393c5fd\' fill-opacity=\'0.5\'%3E%3C/path%3E%3C/svg%3E")',
                   backgroundSize: 'cover',
                   backgroundPosition: 'center'
                 }}>
            </div>
            
            {/* Cercle lumineux - plus visible */}
            <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full opacity-60"
                 style={{
                   background: 'radial-gradient(circle, rgba(147,197,253,0.7) 0%, rgba(59,130,246,0) 70%)'
                 }}>
            </div>
          </div>
          
          {/* Ligne de séparation centrale avec animation subtile - plus visible */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-blue-200 to-transparent opacity-70"></div>
        </div>
        {/* Bouton retour à l'accueil */}
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="outline" 
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-md border-0 hover:from-blue-700 hover:to-blue-800"
            onClick={() => {
              navigate('/');
              // Force le scroll vers la section modules après que la page soit chargée
              setTimeout(() => {
                document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
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
              Assistant de formation intelligent pour les métiers de la{' '}
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