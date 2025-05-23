import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import CyberButton from '@/components/CyberButton';
import { useChatContext } from "@/contexts/ChatContext";
import { useTheme } from "@/contexts/ThemeContext";
// Le contexte GptModel a été temporairement retiré

import { 
  RocketIcon, 
  Zap, 
  Globe,
  Share2,
  Users,
  ShieldCheck,
  Brain,
  ChevronRight,
  Power,
  Check,
  ArrowRight
} from 'lucide-react';
import mcLogoPath from "@assets/mc2i.png";
import fyneCharacterPath from "../assets/fyne-character.png";
import { Switch } from "@/components/ui/switch";

// Interface pour les modules
interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  accentColor: string;
  route: string;
  comingSoon?: boolean;
}

const CyberHomePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { userName } = useChatContext();
  const { themeMode, setThemeMode } = useTheme();
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  
  // Force le thème futuriste pour cette page
  useEffect(() => {
    const previousTheme = themeMode;
    setThemeMode('futuristic');
    
    return () => {
      // Restore le thème précédent quand on quitte la page
      setThemeMode(previousTheme);
    };
  }, []);

  // Liste des modules principaux
  const modules: Module[] = [
    {
      id: 'cyber',
      title: 'I AM CYBER',
      description: 'Plongez au cœur des enjeux de la cyber avec des simulations réalistes',
      icon: <div className="w-5 h-5 bg-indigo-500"></div>,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      accentColor: 'border-indigo-500',
      route: '/cyber'
    },
    {
      id: 'data',
      title: 'I AM DATA & IA',
      description: 'Maîtrisez les technologies d\'analyse de données et d\'intelligence artificielle',
      icon: <div className="w-5 h-5 bg-purple-500"></div>,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      accentColor: 'border-purple-500',
      route: '/data-ia'
    },
    {
      id: 'mc2i',
      title: 'I AM mc2i',
      description: 'Développez vos compétences en assistance à maîtrise d\'ouvrage',
      icon: <div className="w-5 h-5 bg-emerald-500"></div>,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      accentColor: 'border-emerald-500',
      route: '/amoa-mode-selection-new'
    },
    {
      id: 'generator',
      title: 'SOYEZ QUI VOUS VOULEZ',
      description: 'Créez vos propres modules de formation personnalisés',
      icon: <div className="w-5 h-5 bg-rose-500"></div>,
      color: 'text-rose-600',
      bgColor: 'bg-rose-100',
      accentColor: 'border-rose-500',
      route: '/playground/module-generator',
      comingSoon: true
    }
  ];

  // Mode ÉCO temporairement simulé avec un état local
  const [isEcoMode, setIsEcoMode] = useState(false);

  const toggleEcoMode = () => {
    setIsEcoMode(!isEcoMode);
  };

  return (
    <div className="min-h-screen bg-white text-[#061019]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={mcLogoPath} alt="mc2i" className="h-8 w-auto" />
              <div className="h-5 w-px bg-gray-300"></div>
              <span className="text-xl font-bold text-[#006a9e]">FYNE</span>
            </div>
            
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                {/* L'indicateur a été supprimé à la demande de l'utilisateur */}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="relative">
        {/* Contenu principal */}
        <section className="relative z-10 min-h-screen flex items-center justify-center pt-28 pb-32">
          <div className="container mx-auto px-8 flex flex-col md:flex-row items-center">
            {/* Character à droite en desktop */}
            <div className="hidden md:block absolute right-0 bottom-0 z-10">
              <motion.img 
                src={fyneCharacterPath}
                alt="FYNE Character"
                className="object-contain relative z-20"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{ maxHeight: "80vh", maxWidth: "30vw" }}
              />
            </div>

            <motion.div 
              className="max-w-5xl mx-auto text-center relative z-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
                <span className="text-[#dd0061]">F</span><span className="text-[#006a9e]">or </span>
                <span className="text-[#dd0061]">Y</span><span className="text-[#006a9e]">our </span>
                <span className="text-[#dd0061]">N</span><span className="text-[#006a9e]">ext </span>
                <span className="text-[#dd0061]">E</span><span className="text-[#006a9e]">xperience</span>
              </h1>
              
              <div className="w-32 h-1 bg-[#006a9e] mx-auto mb-12"></div>
              
              <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                <span className="text-gray-900">Améliorez </span>
                <span className="text-[#006a9e]">votre expertise</span>
              </h2>
              
              <h2 className="text-5xl md:text-7xl font-bold mb-12 tracking-tight">
                <span className="text-gray-900">avec </span>
                <span className="text-[#006a9e]">FYNE</span>
              </h2>
              
              <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
                Découvrez une nouvelle dimension d'apprentissage interactif avec nos modules IA innovants qui s'adaptent parfaitement à votre progression.
              </p>
              
              <div className="flex items-center justify-center mt-10">
                <motion.button
                  onClick={() => setLocation('/fyne-about')}
                  className="px-8 py-5 bg-gradient-to-r from-[#006a9e] to-[#0085c7] hover:from-[#0085c7] hover:to-[#006a9e] text-white rounded-md text-lg font-semibold shadow-lg transition-all duration-300 flex items-center"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>DÉCOUVREZ FYNE</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Section Modules */}
        <section className="relative z-20 py-24 bg-gray-50">
          <div className="container mx-auto px-8">
            <div className="text-center mb-16">
              <div className="inline-block">
                <span className="px-4 py-1 rounded-full text-sm font-semibold bg-[#006a9e]/10 text-[#006a9e] tracking-wide border border-[#006a9e]/30">
                  Modules Exclusifs
                </span>
              </div>
              <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-wider text-[#061019]">
                Des <span className="text-[#dd0061]">formations</span> pour tous les besoins
              </h2>
              <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                Explorez nos modules spécialisés conçus pour développer vos compétences dans des domaines stratégiques.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mx-auto max-w-7xl">
              {modules.map((module) => (
                <motion.div 
                  key={module.id}
                  className={`bg-white rounded-3xl overflow-hidden shadow-lg transition-all duration-300
                    ${module.id === 'cyber' ? 'border-t-8 border-t-indigo-500' : ''}
                    ${module.id === 'data' ? 'border-t-8 border-t-purple-500' : ''}
                    ${module.id === 'mc2i' ? 'border-t-8 border-t-emerald-500' : ''}
                    ${module.id === 'generator' ? 'border-t-8 border-t-rose-500' : ''}`
                  }
                  onMouseEnter={() => setHoveredModule(module.id)}
                  onMouseLeave={() => setHoveredModule(null)}
                  whileHover={{ y: -10, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => !module.comingSoon && setLocation(module.route)}
                  style={{ cursor: module.comingSoon ? 'default' : 'pointer' }}
                >
                  <div className="p-6">
                    <div 
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 
                        ${module.bgColor}`
                      }
                    >
                      <div>
                        {module.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-3 text-gray-800">{module.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{module.description}</p>
                    <div className="flex items-center text-sm font-medium">
                      {module.comingSoon ? (
                        <span className="text-gray-500 flex items-center">
                          Bientôt disponible
                        </span>
                      ) : (
                        <>
                          <span className={module.color}>
                            Explorer
                          </span>
                          <ChevronRight className={`ml-1 w-4 h-4 ${module.color}`} />
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="relative z-20 py-12 border-t border-gray-200 bg-white">
          <div className="container mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <img src={mcLogoPath} alt="mc2i" className="h-8 w-auto" />
                  <div className="h-5 w-px bg-gray-300"></div>
                  <div className="text-xl font-bold text-[#006a9e]">
                    FYNE
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Propulsez votre formation avec notre plateforme IA de simulation immersive.
                </p>
              </div>
              
              <div>
                <h4 className="text-[#006a9e] font-bold mb-4 text-sm uppercase tracking-wider">Modules</h4>
                <ul className="space-y-2">
                  {modules.map(module => (
                    <li key={module.id}>
                      <Link 
                        href={module.route}
                        className="text-gray-600 hover:text-[#dd0061] transition-colors duration-300 text-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setLocation(module.route);
                        }}
                      >
                        {module.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-[#006a9e] font-bold mb-4 text-sm uppercase tracking-wider">Ressources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 hover:text-[#dd0061] transition-colors duration-300 text-sm">Documentation</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-[#dd0061] transition-colors duration-300 text-sm">Tutoriels</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-[#dd0061] transition-colors duration-300 text-sm">Blog</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-[#dd0061] transition-colors duration-300 text-sm">Support</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-[#006a9e] font-bold mb-4 text-sm uppercase tracking-wider">Contact</h4>
                <div className="flex items-center gap-4">
                  <a href="#" className="text-gray-600 hover:text-[#dd0061] transition-colors duration-300">
                    <Globe size={20} />
                  </a>
                  <a href="#" className="text-gray-600 hover:text-[#dd0061] transition-colors duration-300">
                    <Share2 size={20} />
                  </a>
                  <a href="#" className="text-gray-600 hover:text-[#dd0061] transition-colors duration-300">
                    <Users size={20} />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                &copy; {new Date().getFullYear()} FYNE by mc2i. Tous droits réservés.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default CyberHomePage;