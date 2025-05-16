import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from "@/contexts/ThemeContext";
import { 
  Brain, 
  ShieldCheck, 
  Zap,
  Code,
  Database,
  ChevronRight,
  CheckCircle2,
  Play,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import mcLogoPath from "@assets/mc2i.png";
import fyneCharacterPath from "../assets/fyne-character.png";

const ModernHomePage = () => {
  const [location, setLocation] = useLocation();
  const { themeMode } = useTheme();
  const [scrollY, setScrollY] = useState(0);
  const [activeModule, setActiveModule] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const modules = [
    {
      id: 'cyber',
      title: 'I AM CYBER',
      description: 'Explorez le monde de la cybersécurité à travers des simulations immersives et des défis pratiques.',
      icon: <ShieldCheck className="h-5 w-5 text-blue-400" />,
      color: 'blue',
      position: { x: '20%', y: '25%' }
    },
    {
      id: 'data',
      title: 'I AM DATA & IA',
      description: 'Plongez dans le monde des données et de l\'intelligence artificielle avec des exercices pratiques.',
      icon: <Database className="h-5 w-5 text-emerald-400" />,
      color: 'emerald',
      position: { x: '80%', y: '25%' }
    },
    {
      id: 'mc2i',
      title: 'I AM mc2i',
      description: 'Développez vos compétences en gestion de projet et management de transformation digitale.',
      icon: <Code className="h-5 w-5 text-purple-400" />,
      color: 'purple',
      position: { x: '30%', y: '70%' }
    },
    {
      id: 'generator',
      title: 'SOYEZ QUI VOUS VOULEZ',
      description: 'Créez votre propre parcours d\'apprentissage en générant des modules personnalisés.',
      icon: <Zap className="h-5 w-5 text-amber-400" />,
      color: 'amber',
      position: { x: '70%', y: '70%' }
    }
  ];

  const navigateToModule = (moduleId: string) => {
    if (moduleId === 'cyber') {
      setLocation('/cyber');
    } else if (moduleId === 'data') {
      setLocation('/data-ia');
    } else if (moduleId === 'mc2i') {
      setLocation('/amoa-mode-selection-fixed');
    } else {
      setLocation('/playground/module-generator-new');
    }
  };

  return (
    <div className="w-full min-h-screen bg-black overflow-hidden relative">
      {/* Background gradient effect - more subtle with green tint like reference design */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-[#101a19] opacity-95"></div>
      
      {/* Glowing center point like in the reference */}
      <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#1a2b28]/20 blur-[120px]"></div>
      
      {/* Decorative lines - thinner and more subtle */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-0 right-0 h-[0.5px] bg-gradient-to-r from-transparent via-[#38a891]/50 to-transparent" style={{ top: '30%' }}></div>
        <div className="absolute left-0 right-0 h-[0.5px] bg-gradient-to-r from-transparent via-[#38a891]/50 to-transparent" style={{ top: '60%' }}></div>
        <div className="absolute top-0 bottom-0 w-[0.5px] bg-gradient-to-b from-transparent via-[#38a891]/50 to-transparent" style={{ left: '35%' }}></div>
        <div className="absolute top-0 bottom-0 w-[0.5px] bg-gradient-to-b from-transparent via-[#38a891]/50 to-transparent" style={{ left: '65%' }}></div>
      </div>
      
      {/* Curved decorative line like in reference design */}
      <svg className="absolute top-0 left-0 w-full h-full opacity-10 overflow-visible" viewBox="0 0 1000 800">
        <path 
          d="M100,200 Q250,100 400,200 T700,200 T1000,200" 
          fill="none" 
          stroke="url(#gradientLine)" 
          strokeWidth="1"
        />
        <defs>
          <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#38a891" stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>

      {/* Header - inspired by reference design */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Logo with subtle glow effect */}
            <div className="relative">
              <div className="absolute -inset-1 bg-[#38a891]/20 rounded-full blur-sm"></div>
              <img src={mcLogoPath} alt="mc2i" className="h-8 w-auto relative z-10" />
            </div>
            <div className="h-5 w-px bg-[#38a891]/30"></div>
            <div className="text-xl font-bold text-white tracking-wider">
              FYNE
            </div>
          </div>
          
          {/* Centered navigation - minimal and clean */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="text-white hover:text-[#38a891] transition-colors text-sm font-medium">Accueil</Link>
            <Link href="/cyber" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">I AM CYBER</Link>
            <Link href="/data-ia" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">I AM DATA & IA</Link>
            <Link href="/amoa-mode-selection-fixed" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">I AM mc2i</Link>
            <Link href="/playground/module-generator-new" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Générateur</Link>
          </nav>
          
          {/* Right-aligned elements */}
          <div className="flex items-center gap-3">
            {/* Connection status with subtle styling */}
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm py-1.5 px-3 rounded-full border border-[#38a891]/20">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#38a891]" />
              <span className="text-xs font-medium text-gray-300">FYNE Connecté</span>
            </div>
            
            {/* User icon in a circle */}
            <div className="w-8 h-8 rounded-full bg-black/40 border border-[#38a891]/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative pt-24">
        <div className="container mx-auto px-6 relative z-10">
          {/* Hero section - inspired by reference design */}
          <section className="min-h-[90vh] flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 overflow-hidden">
              {/* Interactive node elements */}
              {modules.map((module, index) => (
                <React.Fragment key={module.id}>
                  {/* Node point */}
                  <motion.div
                    className="absolute"
                    style={{ 
                      left: module.position.x, 
                      top: module.position.y,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                  >
                    <div className="relative">
                      {/* Pulse animation */}
                      <motion.div 
                        className={`absolute w-3 h-3 rounded-full bg-[#38a891]/20`}
                        animate={{ 
                          scale: [1, 2.5, 1],
                          opacity: [0.3, 0.1, 0.3]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      
                      {/* Core node */}
                      <div className={`relative w-3 h-3 rounded-full bg-[#38a891]`} />
                      
                      {/* Node label */}
                      <div className="absolute whitespace-nowrap text-xs text-gray-400 ml-5 -mt-2 font-mono">
                        <span className="opacity-50">•</span> {module.title.split(' ')[1]} 
                        <span className="ml-1 text-[10px] opacity-60">{Math.floor(Math.random() * 10)}.{Math.floor(Math.random() * 1000)}</span>
                      </div>
                    </div>
                  </motion.div>
                </React.Fragment>
              ))}
              
              {/* Connection lines - thinner and more subtle with gradient */}
              <svg className="absolute inset-0 w-full h-full">
                <line 
                  x1="20%" y1="25%" 
                  x2="80%" y2="25%" 
                  stroke="url(#lineGradient)" 
                  strokeWidth="0.5"
                />
                <line 
                  x1="30%" y1="70%" 
                  x2="70%" y2="70%" 
                  stroke="url(#lineGradient)" 
                  strokeWidth="0.5"
                />
                <line 
                  x1="20%" y1="25%" 
                  x2="30%" y2="70%" 
                  stroke="url(#lineGradient)" 
                  strokeWidth="0.5"
                />
                <line 
                  x1="80%" y1="25%" 
                  x2="70%" y2="70%" 
                  stroke="url(#lineGradient)" 
                  strokeWidth="0.5"
                />
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38a89133" />
                    <stop offset="50%" stopColor="#38a89166" />
                    <stop offset="100%" stopColor="#38a89133" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            {/* Play button in center like reference */}
            <motion.div 
              className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <button className="w-14 h-14 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center border border-[#38a891]/20 group">
                <Play className="w-5 h-5 text-[#38a891] group-hover:text-white transition-colors" />
              </button>
            </motion.div>
            
            {/* Center feature button like in reference */}
            <motion.div
              className="absolute left-1/2 top-[55%] -translate-x-1/2 w-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <button
                className="bg-black/40 backdrop-blur-sm text-white text-sm py-2.5 px-4 rounded-full font-medium border border-[#38a891]/30 flex items-center gap-2 hover:bg-black/60 transition-all"
                onClick={() => setLocation('/cyber')}
              >
                <span className="text-[#38a891]">→</span> Démarrer votre formation maintenant
                <span className="text-[#38a891]">→</span>
              </button>
            </motion.div>
            
            {/* Main content - simplified and centered like reference */}
            <div className="text-center max-w-5xl mx-auto">              
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="text-6xl md:text-8xl font-bold mb-4 tracking-tight"
              >
                <div className="inline-block">
                  <span className="text-white">FOR YOUR NEXT</span>{' '}
                </div>
                <div className="inline-block bg-gradient-to-r from-[#38a891] to-blue-400 text-transparent bg-clip-text">
                  EXPERIENCE
                </div>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto font-light"
              >
                Explorez l'univers de la formation assistée par l'IA, où technologie et expertise se rencontrent
                pour une expérience d'apprentissage personnalisée et immersive.
              </motion.p>
            </div>
            
            {/* Scroll indicator */}
            <motion.div
              className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">02/03 · Défiler vers le bas</span>
                <ChevronDown className="h-4 w-4 text-[#38a891]" />
              </div>
            </motion.div>
          </section>
          
          {/* Modules section - refined with glass cards like reference */}
          <section className="py-32">
            <div className="flex flex-col mb-20">
              <div className="flex items-center gap-2 mb-3 mx-auto">
                <div className="w-2 h-2 rounded-full bg-[#38a891]"></div>
                <span className="uppercase text-xs tracking-wider text-gray-500 font-medium">Expériences Immersives</span>
                <div className="w-2 h-2 rounded-full bg-[#38a891]"></div>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 text-center">
                <span className="opacity-80">Choisissez votre</span>{' '}
                <span className="bg-gradient-to-r from-[#38a891] to-blue-400 text-transparent bg-clip-text">parcours d'excellence</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-center text-lg font-light">
                Quatre univers spécialisés conçus pour transformer votre apprentissage en une expérience d'immersion complète et interactive.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {modules.map((module, index) => (
                <motion.div
                  key={module.id}
                  className="group relative h-[340px] overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  {/* Card background with glass effect */}
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-md border border-[#38a891]/10 rounded-xl overflow-hidden group-hover:border-[#38a891]/30 transition-all duration-300">
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"></div>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#38a891]/5 rounded-bl-full"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-16 bg-[#38a891]/5 rounded-tr-full"></div>
                    
                    {/* Content */}
                    <div className="relative h-full p-6 flex flex-col">
                      {/* Module icon with animation */}
                      <div className="mb-6 relative">
                        <div className="absolute -inset-1 bg-[#38a891]/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="w-14 h-14 rounded-full bg-black/50 border border-[#38a891]/20 flex items-center justify-center relative z-10">
                          {module.icon}
                        </div>
                      </div>
                      
                      {/* Module title */}
                      <h3 className="text-xl font-bold text-white mb-3 tracking-wide">
                        {module.title}
                      </h3>
                      
                      {/* Divider line */}
                      <div className="w-12 h-0.5 bg-gradient-to-r from-[#38a891] to-transparent mb-4"></div>
                      
                      {/* Description */}
                      <p className="text-gray-300 mb-auto font-light">
                        {module.description}
                      </p>
                      
                      {/* Stats section */}
                      <div className="flex items-center gap-4 mb-5 pt-5 border-t border-[#38a891]/10">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#38a891]/70"></div>
                          <span className="text-xs text-gray-400">15+ modules</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#38a891]/70"></div>
                          <span className="text-xs text-gray-400">Adaptatif</span>
                        </div>
                      </div>
                      
                      {/* Action button */}
                      <button 
                        className="w-full py-2.5 px-4 bg-black/30 border border-[#38a891]/20 rounded-lg font-medium text-white flex items-center justify-between hover:bg-black/50 hover:border-[#38a891]/40 transition-all"
                        onClick={() => navigateToModule(module.id)}
                      >
                        <span>Explorer</span>
                        <ArrowRight className="h-4 w-4 text-[#38a891]" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
          
          {/* Feature section */}
          <section className="py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block py-1 px-3 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700 mb-3">
                  Technologie Propriétaire
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Une plateforme <span className="text-blue-400">intelligente</span> qui évolue avec vous
                </h2>
                <p className="text-gray-300 mb-8">
                  Notre technologie d'IA adapte vos parcours de formation en temps réel pour garantir une progression optimale et personnalisée. Chaque module évalue votre niveau et ajuste les défis pour maximiser votre apprentissage.
                </p>
                
                <div className="space-y-4">
                  {[
                    { icon: <Brain className="h-5 w-5 text-blue-400" />, title: "Apprentissage Adaptatif", description: "Contenu personnalisé qui s'ajuste à votre rythme et niveau" },
                    { icon: <ShieldCheck className="h-5 w-5 text-blue-400" />, title: "Simulations Réalistes", description: "Mises en situation inspirées de cas réels du monde professionnel" },
                    { icon: <Zap className="h-5 w-5 text-blue-400" />, title: "Évaluation Continue", description: "Feedback instantané et suivi de progression détaillé" }
                  ].map((feature, index) => (
                    <div key={index} className="flex gap-4 p-4 rounded-lg bg-gray-900/60 border border-gray-800">
                      <div className="rounded-full p-2 bg-blue-900/40 border border-blue-500/30">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                        <p className="text-gray-400">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative h-[500px]">
                <div className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-gray-800 bg-gradient-to-br from-gray-900 to-black">
                  {/* Image du personnage FYNE */}
                  <div className="absolute right-0 bottom-0 z-10 h-full">
                    <motion.img 
                      src={fyneCharacterPath}
                      alt="FYNE Character"
                      className="h-full object-contain object-bottom"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  
                  {/* Animated UI elements */}
                  <div className="absolute inset-0 p-8">
                    <div className="w-full h-full flex flex-col">
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4 max-w-xs">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          <div className="text-xs text-blue-400 font-mono">INTERACTION AI.03</div>
                        </div>
                        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden mb-2">
                          <motion.div
                            className="h-full bg-blue-500"
                            initial={{ width: "0%" }}
                            animate={{ width: "60%" }}
                            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                          ></motion.div>
                        </div>
                        <div className="text-xs text-gray-400">Analyse de compétences en cours...</div>
                      </div>
                      
                      <motion.div
                        className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-lg p-4 max-w-[250px] ml-auto mt-auto"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-xs text-blue-400 font-mono">MODULE STATUS</div>
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        </div>
                        <div className="text-sm text-white mb-2">I AM CYBER: Niveau 2 débloqué</div>
                        <div className="flex gap-2">
                          <div className="text-xs py-1 px-2 rounded bg-green-500/20 text-green-400">Progression +15%</div>
                          <div className="text-xs py-1 px-2 rounded bg-blue-500/20 text-blue-400">3 modules</div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <img src={mcLogoPath} alt="mc2i" className="h-8 w-auto" />
              <div className="h-5 w-px bg-gray-700"></div>
              <div className="text-xl font-bold text-white">FYNE</div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} FYNE by mc2i. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernHomePage;