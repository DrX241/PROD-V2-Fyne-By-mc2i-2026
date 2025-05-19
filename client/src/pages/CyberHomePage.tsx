import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import CyberButton from '@/components/CyberButton';
import { useChatContext } from "@/contexts/ChatContext";
import { useTheme } from "@/contexts/ThemeContext";
// Le contexte GptModel a été temporairement retiré
import OpenAIStatusIndicator from "@/components/OpenAIStatusIndicator";
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
  Check
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
      title: 'CYBER ACADEMY',
      description: 'Plongez au cœur des enjeux de la cybersécurité avec des simulations réalistes',
      icon: <ShieldCheck size={24} />,
      color: 'text-[#006a9e]',
      bgColor: 'bg-[#006a9e]/10',
      accentColor: 'border-[#006a9e]/50',
      route: '/cyber'
    },
    {
      id: 'data',
      title: 'DATA & IA',
      description: 'Maîtrisez les technologies d\'analyse de données et d\'intelligence artificielle',
      icon: <Brain size={24} />,
      color: 'text-[#006a9e]',
      bgColor: 'bg-[#006a9e]/10',
      accentColor: 'border-[#006a9e]/50',
      route: '/data-ia'
    },
    {
      id: 'mc2i',
      title: 'AMOA ACADEMY',
      description: 'Développez vos compétences en assistance à maîtrise d\'ouvrage',
      icon: <RocketIcon size={24} />,
      color: 'text-[#006a9e]',
      bgColor: 'bg-[#006a9e]/10',
      accentColor: 'border-[#006a9e]/50',
      route: '/amoa/new'
    },
    {
      id: 'generator',
      title: 'SOYEZ QUI VOUS VOULEZ',
      description: 'Créez vos propres modules de formation personnalisés',
      icon: <Zap size={24} />,
      color: 'text-[#006a9e]',
      bgColor: 'bg-[#006a9e]/10',
      accentColor: 'border-[#006a9e]/50',
      route: '/playground/module-generator-new'
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
                <OpenAIStatusIndicator />
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${isEcoMode ? 'text-amber-600' : 'text-gray-500'}`}>
                  Mode ÉCO {isEcoMode ? 'ON' : 'OFF'}
                </span>
                <Switch 
                  checked={isEcoMode} 
                  onCheckedChange={toggleEcoMode}
                  className={isEcoMode ? 'bg-amber-500' : ''}
                />
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
              className="max-w-4xl mx-auto text-center md:text-left md:ml-0 md:mr-auto relative z-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="text-3xl md:text-5xl font-bold mb-8 tracking-widest">
                <h1 className="font-bold tracking-widest">
                  <span className="text-[#dd0061]">F</span>OR 
                  <span className="text-[#006a9e]"> Y</span>OUR 
                  <span className="text-green-600"> N</span>EXT 
                  <span className="text-orange-500"> E</span>XPERIENCE
                </h1>
              </div>
              
              <p className="text-xl md:text-2xl text-[#061019] mb-8 leading-relaxed max-w-3xl mx-auto">
                Transformez votre <span className="text-[#dd0061] font-semibold">expérience de formation</span> avec notre plateforme immersive alimentée par l'IA. <span className="text-[#006a9e] font-semibold">FYNE</span> redéfinit l'apprentissage pour l'adapter à vos besoins.
              </p>
              
              <div className="flex items-center justify-center md:justify-start mt-10">
                <motion.button
                  onClick={() => setLocation('/fyne-about')}
                  className="px-8 py-4 bg-[#006a9e] hover:bg-[#006a9e]/90 text-white rounded-md text-lg font-semibold shadow-lg transition-all duration-300 flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>DÉCOUVREZ FYNE</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="ml-2"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {modules.map((module) => (
                <motion.div 
                  key={module.id}
                  className={`bg-white border-2 rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
                    hoveredModule === module.id 
                      ? `border-[#dd0061]` 
                      : `border-[#006a9e]/20`
                  }`}
                  onMouseEnter={() => setHoveredModule(module.id)}
                  onMouseLeave={() => setHoveredModule(null)}
                  whileHover={{ y: -10 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setLocation(module.route)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="p-6">
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 
                      ${hoveredModule === module.id ? 'bg-[#dd0061]/20' : 'bg-[#006a9e]/20'}`}
                    >
                      <div className={hoveredModule === module.id ? 'text-[#dd0061]' : 'text-[#006a9e]'}>
                        {module.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-[#061019]">{module.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{module.description}</p>
                    <div className="flex items-center text-sm font-medium">
                      <span className={hoveredModule === module.id ? 'text-[#dd0061]' : 'text-[#006a9e]'}>
                        Découvrir
                      </span>
                      <ChevronRight className={`ml-1 w-4 h-4 ${
                        hoveredModule === module.id ? 'text-[#dd0061]' : 'text-[#006a9e]'
                      }`} />
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