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

export default function DataIAModeSelection() {
  const [, setLocation] = useLocation();
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [textSize, setTextSize] = useState(1);
  const { currentTour, setCurrentTour, startTutorial } = useTutorial();
  
  // Utilisation d'useEffect pour initialiser le textSize à partir de localStorage
  useEffect(() => {
    const storedTextSize = localStorage.getItem('dataIATextSize');
    if (storedTextSize) {
      setTextSize(parseFloat(storedTextSize));
    }
    
    const storedHighContrastMode = localStorage.getItem('dataIAHighContrastMode');
    if (storedHighContrastMode) {
      setHighContrastMode(storedHighContrastMode === 'true');
    }
  }, []);
  
  // Utilisation d'useEffect pour stocker les préférences utilisateur
  useEffect(() => {
    localStorage.setItem('dataIATextSize', textSize.toString());
    localStorage.setItem('dataIAHighContrastMode', highContrastMode.toString());
  }, [textSize, highContrastMode]);
  
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
              
              {/* Les contrôles ont été supprimés à la demande de l'utilisateur */}
            </div>
            
            {/* Titre et sous-titre */}
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
                  I AM DATA & IA
                </span>
              </h1>
              <div className="w-40 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 mx-auto my-6 rounded-full"></div>
              <p className={`max-w-3xl mx-auto text-xl ${
                highContrastMode ? 'text-gray-300' : 'text-blue-100' 
              }`}>
                Trouvez votre parcours d'apprentissage personnalisé en <span className="font-semibold text-blue-300">Data Science</span> et <span className="font-semibold text-purple-300">Intelligence Artificielle</span>
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
                      <IoBookOutline className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-center text-2xl font-data-title mb-2">DATA & IA ACADÉMIE</h3>
                  <p className="text-center text-blue-300 mt-2">
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
                      <BsFileEarmarkCode className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-center text-2xl font-data-title mb-2">DATA & IA ROLE PLAY</h3>
                  <p className="text-center text-violet-300 mt-2">
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
