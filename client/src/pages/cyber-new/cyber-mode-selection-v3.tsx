import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  ArrowRight,
  Shield,
  Terminal,
  Laptop,
  Code,
  Database,
  Server
} from 'lucide-react';
import { 
  IoHome,
  IoSchoolOutline
} from 'react-icons/io5';
import { 
  IoMdArrowForward 
} from 'react-icons/io';
import { 
  BsFileEarmarkCode,
  BsShieldLock,
  BsGearFill
} from 'react-icons/bs';
import { 
  FiSun, 
  FiMoon 
} from 'react-icons/fi';
import { 
  AiOutlineZoomIn, 
  AiOutlineZoomOut 
} from 'react-icons/ai';

import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import CyberScene from '@/components/CyberScene';
import { useTutorial } from '@/contexts/TutorialContext';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PageTitle from '@/components/utils/PageTitle';
import { DataButton } from '@/components/DataButton';
import HomeLayout from '@/components/layout/HomeLayout';

export default function CyberModeSelectionV3() {
  const [, setLocation] = useLocation();
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [textSize, setTextSize] = useState(1);
  const { currentTour, setCurrentTour, startTutorial } = useTutorial();
  
  // Utilisation d'useEffect pour initialiser le textSize à partir de localStorage
  useEffect(() => {
    const storedTextSize = localStorage.getItem('cyberTextSize');
    if (storedTextSize) {
      setTextSize(parseFloat(storedTextSize));
    }
    
    const storedHighContrastMode = localStorage.getItem('cyberHighContrastMode');
    if (storedHighContrastMode) {
      setHighContrastMode(storedHighContrastMode === 'true');
    }
  }, []);
  
  // Utilisation d'useEffect pour stocker les préférences utilisateur
  useEffect(() => {
    localStorage.setItem('cyberTextSize', textSize.toString());
    localStorage.setItem('cyberHighContrastMode', highContrastMode.toString());
  }, [textSize, highContrastMode]);
  
  const startTour = () => {
    console.log('Démarrage du tutoriel:', currentTour);
    // Implémentation à venir
  };

  return (
    <HomeLayout>
      <div id="cyber-mode-selection" className={`min-h-screen pb-20 ${
        highContrastMode 
          ? 'bg-black text-white' 
          : 'text-white'
      }`} style={{ 
        fontSize: `${textSize}rem`,
        backgroundImage: highContrastMode 
          ? 'none' 
          : 'linear-gradient(135deg, #0c2340 0%, #051020 100%), radial-gradient(circle at 30% 40%, rgba(0, 150, 136, 0.15) 0%, transparent 70%), radial-gradient(circle at 70% 60%, rgba(33, 150, 243, 0.1) 0%, transparent 70%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}>
        {/* Overlay pour assurer la lisibilité du contenu */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#051428]/80 to-[#020a16]/90 z-0"></div>
        
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
                    className="text-cyan-300 border-cyan-300/30 hover:bg-cyan-900/20"
                    startIcon={<IoHome className="h-6 w-6" />}
                  >
                    Accueil
                  </DataButton>
                </Link>
                <PageTitle title="I AM CYBER" />
              </div>
              
              {/* Les contrôles ont été supprimés à la demande de l'utilisateur */}
              <div></div>
            </div>
          </div>
          
          {/* Titre et sous-titre */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16 relative px-4"
            data-id="main-title"
          >
            <h1 className="text-5xl font-bold mb-4 font-cyber-title relative">
              <span className="text-white">Centre de formation</span>
              <br />
              <span className="text-6xl mt-2 block tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                I AM CYBER
              </span>
            </h1>
            <div className="w-40 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto my-6 rounded-full"></div>
            <p className={`max-w-3xl mx-auto text-xl ${
              highContrastMode ? 'text-gray-300' : 'text-cyan-100' 
            }`}>
              Trouvez votre parcours d'apprentissage personnalisé
            </p>
          </motion.div>

          {/* Grille des modules Cyber */}
          <div className="mt-8 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-center max-w-6xl mx-auto">
              
              {/* CYBER ACADÉMIE */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`shadow-lg ${
                  highContrastMode 
                    ? 'bg-gray-800 border-2 border-gray-700' 
                    : 'bg-gradient-to-br from-cyan-900/50 to-blue-900/30 border-2 border-cyan-500/20'
                } rounded-lg overflow-hidden hover:scale-[1.03] transition-all duration-300`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      highContrastMode 
                        ? 'bg-cyan-800' 
                        : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20'
                    }`}>
                      <IoSchoolOutline className="h-8 w-8 text-cyan-400" />
                    </div>
                  </div>
                  <h3 className="text-center text-xl font-cyber-title mb-2 text-cyan-300">ACADÉMIE CYBERSÉCURITÉ</h3>
                  <p className="text-center text-gray-300 mt-2 mb-6">
                    Accédez à notre centre de formation complet en cybersécurité
                  </p>
                  <Button 
                    className={`w-full py-6 ${
                      highContrastMode 
                        ? 'bg-cyan-700 hover:bg-cyan-600 text-white' 
                        : 'bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white'
                    }`}
                    onClick={() => {
                      setLocation('/cyber/academy');
                    }}
                  >
                    Démarrer l'apprentissage
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
              
              {/* EXPÉRIENCES IMMERSIVES */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`shadow-lg ${
                  highContrastMode 
                    ? 'bg-gray-800 border-2 border-gray-700' 
                    : 'bg-gradient-to-br from-blue-900/50 to-indigo-900/30 border-2 border-blue-500/20'
                } rounded-lg overflow-hidden hover:scale-[1.03] transition-all duration-300`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      highContrastMode 
                        ? 'bg-blue-800' 
                        : 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20'
                    }`}>
                      <Terminal className="h-8 w-8 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-center text-xl font-cyber-title mb-2 text-blue-300">EXPÉRIENCES IMMERSIVES</h3>
                  <p className="text-center text-gray-300 mt-2 mb-6">
                    Vivez des simulations cyber réalistes et engageantes
                  </p>
                  <Button 
                    className={`w-full py-6 ${
                      highContrastMode 
                        ? 'bg-blue-700 hover:bg-blue-600 text-white' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white'
                    }`}
                    onClick={() => {
                      setLocation('/cyber/escape-room');
                    }}
                  >
                    Entrer en immersion
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
              
              {/* LABORATOIRE CYBER */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`shadow-lg ${
                  highContrastMode 
                    ? 'bg-gray-800 border-2 border-gray-700' 
                    : 'bg-gradient-to-br from-indigo-900/50 to-purple-900/30 border-2 border-indigo-500/20'
                } rounded-lg overflow-hidden hover:scale-[1.03] transition-all duration-300`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      highContrastMode 
                        ? 'bg-indigo-800' 
                        : 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20'
                    }`}>
                      <Code className="h-8 w-8 text-indigo-400" />
                    </div>
                  </div>
                  <h3 className="text-center text-xl font-cyber-title mb-2 text-indigo-300">LABORATOIRE CYBER</h3>
                  <p className="text-center text-gray-300 mt-2 mb-6">
                    Accédez à nos outils de cybersécurité interactifs
                  </p>
                  <Button 
                    className={`w-full py-6 ${
                      highContrastMode 
                        ? 'bg-indigo-700 hover:bg-indigo-600 text-white' 
                        : 'bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white'
                    }`}
                    onClick={() => {
                      setLocation('/cyber/tools');
                    }}
                  >
                    Ouvrir le laboratoire
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
