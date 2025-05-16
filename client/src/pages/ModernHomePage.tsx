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
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800 opacity-90"></div>
      
      {/* Decorative lines */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent" style={{ top: '30%' }}></div>
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent" style={{ top: '60%' }}></div>
        <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-400 to-transparent" style={{ left: '35%' }}></div>
        <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-400 to-transparent" style={{ left: '65%' }}></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={mcLogoPath} alt="mc2i" className="h-8 w-auto" />
            <div className="h-5 w-px bg-cyan-500/50"></div>
            <div className="text-xl font-bold text-white">
              FYNE
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-300 hover:text-white transition">Accueil</Link>
            <Link href="/cyber" className="text-gray-300 hover:text-white transition">I AM CYBER</Link>
            <Link href="/data-ia" className="text-gray-300 hover:text-white transition">I AM DATA & IA</Link>
            <Link href="/amoa-mode-selection-fixed" className="text-gray-300 hover:text-white transition">I AM mc2i</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-900/60 py-1 px-3 rounded-full border border-gray-700">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-300">FYNE Connecté</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative pt-24">
        <div className="container mx-auto px-6 relative z-10">
          {/* Hero section */}
          <section className="min-h-[80vh] flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 overflow-hidden">
              {/* Animated nodes */}
              {modules.map((module) => (
                <motion.div
                  key={module.id}
                  className={`absolute w-3 h-3 rounded-full bg-${module.color}-500`}
                  style={{ 
                    left: module.position.x, 
                    top: module.position.y,
                    boxShadow: `0 0 20px rgba(${module.color === 'blue' ? '59, 130, 246' : module.color === 'emerald' ? '16, 185, 129' : module.color === 'purple' ? '168, 85, 247' : '245, 158, 11'}, 0.6)`
                  }}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 2
                  }}
                  onMouseEnter={() => setActiveModule(module.id)}
                  onMouseLeave={() => setActiveModule(null)}
                />
              ))}
              
              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full">
                <line 
                  x1="20%" y1="25%" 
                  x2="80%" y2="25%" 
                  stroke="rgba(156, 163, 175, 0.3)" 
                  strokeWidth="1"
                />
                <line 
                  x1="30%" y1="70%" 
                  x2="70%" y2="70%" 
                  stroke="rgba(156, 163, 175, 0.3)" 
                  strokeWidth="1"
                />
                <line 
                  x1="20%" y1="25%" 
                  x2="30%" y2="70%" 
                  stroke="rgba(156, 163, 175, 0.3)" 
                  strokeWidth="1"
                />
                <line 
                  x1="80%" y1="25%" 
                  x2="70%" y2="70%" 
                  stroke="rgba(156, 163, 175, 0.3)" 
                  strokeWidth="1"
                />
              </svg>
            </div>
            
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-6"
              >
                <span className="inline-block py-1 px-3 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Formation Assistée par IA
                </span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl md:text-7xl font-bold mb-6"
              >
                <span className="text-white">FOR YOUR NEXT </span>
                <span className="text-blue-400">EXPERIENCE</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto"
              >
                Améliorez votre expertise avec <span className="text-blue-400 font-bold">FYNE</span>.
                Découvrez une nouvelle dimension d'apprentissage interactif avec nos
                modules IA innovants qui s'adaptent parfaitement à votre progression.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-wrap gap-4 justify-center"
              >
                <button 
                  className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-8 rounded-lg font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                  onClick={() => setLocation('/cyber')}
                >
                  Démarrer une expérience
                  <ArrowRight className="h-5 w-5" />
                </button>
                
                <button className="bg-black/40 backdrop-blur-sm text-white py-3 px-8 rounded-lg font-medium border border-gray-700 flex items-center gap-2 hover:bg-black/60 transition-all">
                  <Play className="h-5 w-5" />
                  Voir la démo
                </button>
              </motion.div>
            </div>
            
            {/* Scroll indicator */}
            <motion.div
              className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown className="h-6 w-6 text-gray-400" />
            </motion.div>
          </section>
          
          {/* Modules section */}
          <section className="py-24">
            <div className="text-center mb-16">
              <span className="inline-block py-1 px-3 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700 mb-3">
                Expériences Adaptatives
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Des<span className="text-blue-400"> modules d'excellence</span> pour votre formation
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Trois univers d'apprentissage conçus pour transformer votre formation en expérience immersive et interactive.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {modules.map((module) => (
                <motion.div
                  key={module.id}
                  className={`bg-gradient-to-br from-gray-900 to-black border-2 border-${module.color}-500/40 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-${module.color}-500/20 transition-all`}
                  whileHover={{ 
                    y: -5,
                    borderColor: `rgba(${module.color === 'blue' ? '59, 130, 246' : module.color === 'emerald' ? '16, 185, 129' : module.color === 'purple' ? '168, 85, 247' : '245, 158, 11'}, 0.6)`
                  }}
                >
                  <div className="p-6">
                    <div className={`w-12 h-12 rounded-full bg-${module.color}-900/60 flex items-center justify-center mb-4 border border-${module.color}-500/30`}>
                      {module.icon}
                    </div>
                    <h3 className={`text-xl font-bold text-${module.color}-400 mb-2`}>
                      {module.title}
                    </h3>
                    <p className="text-gray-400 mb-6 min-h-[4rem]">
                      {module.description}
                    </p>
                    <button 
                      className={`w-full py-2 px-4 rounded-lg bg-${module.color}-500/20 text-${module.color}-400 font-medium border border-${module.color}-500/40 flex items-center justify-between hover:bg-${module.color}-500/30 transition-colors`}
                      onClick={() => navigateToModule(module.id)}
                    >
                      <span>Accéder</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
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