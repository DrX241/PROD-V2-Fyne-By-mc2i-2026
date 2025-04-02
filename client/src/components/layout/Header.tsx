import { Home, Menu, X, ChevronDown, BrainCircuit, ShieldCheck, Sparkles, Globe, Search } from "lucide-react";
import { useLocation, Link } from "wouter";
import mclogo from "@assets/mc2i.png";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface HeaderProps {
  isFeny?: boolean;
}

export default function Header({ isFeny = false }: HeaderProps) {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Détection du défilement pour les effets visuels
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation pour les éléments du menu
  const menuAnimation = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const logoText = isFeny ? 'FYNE' : (
    location.includes('/cyber') ? 'I AM CYBER' : 
    location.includes('/data-ia') ? 'I AM DATA & IA' : 
    location.includes('/amoa') ? 'I AM AMOA' : 
    'FYNE'
  );

  return (
    <header className={`w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50" 
        : "bg-transparent"
    }`}>
      {/* Barre supérieure avec effet de dégradé */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600"></div>
      
      {/* Contenu principal du header */}
      <div className="w-full px-5 sm:px-8 py-5 flex items-center justify-between">
        {/* Logo et nom */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <a href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="relative overflow-hidden rounded-full p-0.5 bg-gradient-to-r from-blue-500 to-indigo-600">
              <img src={mclogo} alt="mc2i Logo" className="h-10 w-auto relative z-10 bg-white rounded-full p-1 transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-80 transition-opacity duration-500 animate-spin-slow"></div>
            </div>
            <span className="text-neutral-300">|</span>
            <div className={`font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${
              isScrolled ? "from-blue-700 to-indigo-700" : "from-white to-blue-100"
            }`}>
              {logoText}
            </div>
          </a>
        </motion.div>

        {/* Menu de navigation - Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-6">
            {['Modules', 'Fonctionnalités', 'Technologie', 'Entreprise'].map((item, i) => (
              <motion.div
                key={item}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={menuAnimation}
              >
                <a 
                  href="/" 
                  className={`group flex items-center gap-1 font-medium transition-colors px-1 py-2 border-b-2 border-transparent hover:border-blue-500 ${
                    isScrolled ? "text-gray-800 hover:text-blue-700" : "text-white hover:text-blue-200"
                  }`}
                >
                  {item}
                  <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                </a>
              </motion.div>
            ))}
          </nav>
          
          <div className="flex items-center gap-3">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 rounded-full transition-colors ${
                isScrolled 
                  ? "hover:bg-gray-100 text-gray-600" 
                  : "hover:bg-white/10 text-white"
              }`}
            >
              <Search className="h-5 w-5" />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <Button 
                variant={isScrolled ? "default" : "secondary"}
                className={
                  isScrolled 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md" 
                    : "bg-white text-blue-700 hover:bg-blue-50"
                }
              >
                Commencer
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Bouton menu mobile */}
        <div className="flex md:hidden items-center">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-full transition-colors ${
              isScrolled 
                ? "hover:bg-gray-100 text-gray-600" 
                : "hover:bg-white/10 text-white"
            }`}
          >
            {mobileMenuOpen ? 
              <X className="h-6 w-6" /> : 
              <Menu className="h-6 w-6" />
            }
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: searchOpen ? "60px" : "0px",
          opacity: searchOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="w-full bg-white border-t border-gray-100 overflow-hidden"
      >
        <div className="container mx-auto px-5 py-3 flex items-center">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Rechercher des modules, fonctionnalités..." 
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </motion.div>

      {/* Menu mobile */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: mobileMenuOpen ? "auto" : "0px",
          opacity: mobileMenuOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden w-full bg-white border-t border-gray-100 overflow-hidden shadow-lg"
      >
        <div className="container mx-auto px-5 py-5">
          <nav className="flex flex-col gap-4">
            {['Modules', 'Fonctionnalités', 'Technologie', 'Entreprise'].map((item) => (
              <a 
                key={item}
                href="/" 
                className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 text-gray-800"
              >
                <span className="font-medium">{item}</span>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </a>
            ))}
            <div className="pt-4 mt-2 border-t border-gray-100">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white">
                Commencer
              </Button>
            </div>
          </nav>
        </div>
      </motion.div>
    </header>
  );
}
