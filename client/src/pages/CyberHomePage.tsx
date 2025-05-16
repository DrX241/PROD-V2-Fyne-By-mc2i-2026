import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, useScroll, useTransform } from 'framer-motion';
import CyberScene from '@/components/CyberScene';
import CyberGlitchText from '@/components/CyberGlitchText';
import CyberButton from '@/components/CyberButton';
import { gsap } from 'gsap';
import { useChatContext } from "@/contexts/ChatContext";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  Cpu, 
  ShieldCheck, 
  Brain, 
  RocketIcon, 
  Zap, 
  ChevronRight,
  Lock,
  LineChart,
  Network,
  Users,
  Globe,
  Share2
} from 'lucide-react';
import mcLogoPath from "@assets/mc2i.png";
import fyneAvatarPath from "@assets/image_1745520990954.png";
import fyneCharacterPath from "../assets/fyne-character.png";

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
  const [scrollY, setScrollY] = useState(0);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  
  // Force le thème futuriste pour cette page
  useEffect(() => {
    const previousTheme = themeMode;
    setThemeMode('futuristic');
    
    return () => {
      // Restore le thème précédent quand on quitte la page
      setThemeMode(previousTheme);
    };
  }, []);

  // Animation de scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Transformations basées sur le scroll
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  // Liste des modules avec style cyberpunk
  const modules: Module[] = [
    {
      id: 'cyber',
      title: 'I AM CYBER',
      description: 'Formation immersive en cybersécurité et simulations de crises',
      icon: <ShieldCheck size={24} />,
      color: 'text-cyan-400',
      bgColor: 'bg-blue-900/20',
      accentColor: 'border-cyan-500/50',
      route: '/cyber'
    },
    {
      id: 'data',
      title: 'I AM DATA & IA',
      description: 'Maîtrisez les technologies IA et l\'analyse de données',
      icon: <Brain size={24} />,
      color: 'text-cyan-400',
      bgColor: 'bg-blue-900/20',
      accentColor: 'border-cyan-500/50',
      route: '/data-ia'
    },
    {
      id: 'mc2i',
      title: 'I AM mc2i',
      description: 'Simulation d\'entretiens et gestion de projets innovants',
      icon: <RocketIcon size={24} />,
      color: 'text-cyan-400',
      bgColor: 'bg-blue-900/20',
      accentColor: 'border-cyan-500/50',
      route: '/amoa-mode-selection-fixed'
    },
    {
      id: 'generator',
      title: 'SOYEZ QUI VOUS VOULEZ',
      description: 'Créez vos propres modules de formation personnalisés',
      icon: <Zap size={24} />,
      color: 'text-cyan-400',
      bgColor: 'bg-blue-900/20',
      accentColor: 'border-cyan-500/50',
      route: '/playground/module-generator-new'
    }
  ];

  // Liste des fonctionnalités principales
  const features = [
    {
      icon: <Cpu className="w-10 h-10 text-cyan-400" />,
      title: "IA Prédictive",
      description: "Algorithmie avancée s'adaptant en temps réel à votre niveau et vos besoins spécifiques."
    },
    {
      icon: <ShieldCheck className="w-10 h-10 text-cyan-400" />,
      title: "Simulations Immersives",
      description: "Scénarios réalistes et adaptatifs avec feedback personnalisé et évolution dynamique."
    },
    {
      icon: <Network className="w-10 h-10 text-cyan-400" />,
      title: "Environnement Interactif",
      description: "Interfaces multi-sensorielles conçues pour maximiser l'engagement et l'apprentissage."
    },
    {
      icon: <Lock className="w-10 h-10 text-cyan-400" />,
      title: "Sécurité Maximale",
      description: "Protection de vos données et conformité RGPD à chaque étape du processus."
    },
    {
      icon: <LineChart className="w-10 h-10 text-cyan-400" />,
      title: "Analyse de Performance",
      description: "Métriques détaillées sur vos progrès avec visualisation en temps réel."
    },
    {
      icon: <Users className="w-10 h-10 text-cyan-400" />,
      title: "Collaboration Avancée",
      description: "Outils de partage et environnements multi-utilisateurs synchronisés."
    }
  ];

  // Effet de hover sur les modules
  const handleModuleHover = (id: string | null) => {
    setHoveredModule(id);
  };

  return (
    <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden font-cyber">
      {/* Scène 3D de fond */}
      <CyberScene />
      
      {/* Background amélioré avec plusieurs couches */}
      <div className="absolute inset-0 z-0">
        {/* Overlay gradient principal */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-blue-950/40 to-black/80"></div>
        
        {/* Grille de fond cyberpunk inclinée */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDMwKSI+PHBhdGggZD0iTSAxMDAgMCBMIDAgMCAwIDEwMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMWQ0ZWQ4IiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvcGF0dGVybj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')]" style={{ opacity: 0.12 }}></div>
        
        {/* Texture de bruit pour donner de la profondeur */}
        <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]"></div>
        
        {/* Circuit patterns cybernétiques */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXR0ZXJuIGlkPSJjaXJjdWl0IiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGgxMDB2MTAwSDIwMHYxMDBoLTEwMHYtMTAwSDB6IiBmaWxsPSJub25lIiBzdHJva2U9IiMwZmIzZDEiIHN0cm9rZS13aWR0aD0iMSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMyIgZmlsbD0iIzBmYjNkMSIvPjxjaXJjbGUgY3g9IjIwMCIgY3k9IjIwMCIgcj0iMyIgZmlsbD0iIzBmYjNkMSIvPjxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIzIiBmaWxsPSIjMGZiM2QxIi8+PGNpcmNsZSBjeD0iMjAwIiBjeT0iMCIgcj0iMyIgZmlsbD0iIzBmYjNkMSIvPjxjaXJjbGUgY3g9IjAiIGN5PSIyMDAiIHI9IjMiIGZpbGw9IiMwZmIzZDEiLz48L3BhdHRlcm4+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNjaXJjdWl0KSIgb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')]" style={{ opacity: 0.08 }}></div>
        
        {/* Scanlines animées */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent bg-repeat-y" 
              style={{ 
                backgroundSize: '100% 8px', 
                animation: 'moveVertical 8s linear infinite',
                opacity: 0.3
              }}>
          </div>
        </div>
        
        {/* Éclats de lumière */}
        <div className="absolute top-1/6 right-1/6 w-3 h-3 bg-cyan-300 rounded-full opacity-70 animate-pulse shadow-[0_0_40px_20px_rgba(34,211,238,0.6)]"></div>
        <div className="absolute bottom-1/4 left-1/6 w-2 h-2 bg-pink-300 rounded-full opacity-60 animate-pulse shadow-[0_0_30px_15px_rgba(236,72,153,0.5)]"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 pt-6 px-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={mcLogoPath} alt="mc2i" className="h-8 w-auto" />
              <div className="h-5 w-px bg-cyan-500/50"></div>
              <div className="text-xl font-cyber-title text-cyan-400 tracking-wider font-bold">
                FYNE
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              {modules.map((module) => (
                <Link 
                  key={module.id}
                  href={module.route}
                  className={`text-sm font-cyber-accent ${module.color} hover:underline tracking-wide transition-colors duration-300 uppercase`}
                >
                  {module.title}
                </Link>
              ))}
            </nav>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs uppercase text-green-400 tracking-wider">FYNE Connecté</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <main className="relative z-10">
        <section className="relative min-h-[90vh] flex items-center">
          <div className="container mx-auto px-8 py-20 relative">
            {/* Image du personnage FYNE sur la droite */}
            <div className="absolute right-0 bottom-0 h-[90vh] z-10 hidden md:block">
              <motion.img 
                src={fyneCharacterPath}
                alt="FYNE Character"
                className="h-full object-contain object-bottom"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>

            <motion.div 
              className="max-w-4xl mx-auto text-center md:text-left md:ml-0 md:mr-auto relative z-20"
              style={{ opacity, y, scale }}
            >
              <div className="text-3xl md:text-5xl text-cyan-500 font-cyber-title mb-8 tracking-widest">
                <CyberGlitchText 
                  text="FOR - YOUR - NEXT - EXPERIENCE" 
                  textSize="text-3xl md:text-5xl" 
                  color="text-cyan-500"
                  highlightColor="text-pink-400" 
                  glitchIntensity="medium"
                  className="tracking-widest"
                />
              </div>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 font-cyber leading-relaxed max-w-3xl mx-auto">
                Transformez votre <span className="text-pink-400">expérience de formation</span> avec notre plateforme immersive alimentée par l'IA. <span className="text-cyan-400">FYNE</span> redéfinit l'apprentissage pour l'adapter à vos besoins.
              </p>
              
              <div className="flex items-center justify-center mt-10">
                <CyberButton 
                  variant="primary"
                  size="lg"
                  glowIntensity="high"
                  onClick={() => setLocation('/cyber')}
                >
                  ACCÉDER À I AM CYBER
                </CyberButton>
              </div>
            </motion.div>
            
            {/* Scroll indicator */}
            <motion.div 
              className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-xs text-cyan-400 uppercase tracking-widest mb-2">
                Défiler
              </span>
              <div className="w-6 h-10 border-2 border-cyan-400 rounded-full flex justify-center pt-2">
                <motion.div 
                  className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Section Modules */}
        <section className="relative z-20 py-24 cyber-bg-fade">
          <div className="container mx-auto px-8">
            <div className="text-center mb-16">
              <div className="inline-block">
                <span className="px-4 py-1 rounded-full text-sm font-semibold bg-blue-900/30 text-cyan-300 font-cyber-accent tracking-wide border border-blue-500/30 backdrop-blur-sm">
                  Modules Exclusifs
                </span>
              </div>
              <h2 className="mt-4 text-4xl md:text-5xl font-cyber-title tracking-wider text-white">
                Expériences <span className="text-cyan-400">Adaptatives</span>
              </h2>
              <p className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto">
                Trois univers d'apprentissage conçus pour transformer votre formation en expérience immersive et interactive.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {modules.map((module) => (
                <motion.div
                  key={module.id}
                  className={`cyber-edge-distort relative overflow-hidden ${module.bgColor} border ${module.accentColor} p-6 transition-all duration-500`}
                  onMouseEnter={() => handleModuleHover(module.id)}
                  onMouseLeave={() => handleModuleHover(null)}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: '0 0 25px rgba(0, 255, 255, 0.3)'
                  }}
                  animate={{
                    boxShadow: hoveredModule === module.id 
                      ? '0 0 25px rgba(0, 255, 255, 0.3)'
                      : '0 0 5px rgba(0, 255, 255, 0.1)'
                  }}
                >
                  {/* Module header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-md ${module.bgColor} border ${module.accentColor}`}>
                      {module.icon}
                    </div>
                    <h3 className={`text-xl font-cyber-title ${module.color}`}>
                      {module.title}
                    </h3>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-300 mb-6 min-h-[4rem]">
                    {module.description}
                  </p>
                  
                  {/* Ligne scan - Ajustée pour tous les modules */}
                  <div 
                    className={`absolute top-0 left-0 h-full w-px ${module.color.replace('text', 'bg')}`}
                    style={{
                      opacity: hoveredModule === module.id ? 0.8 : 0,
                      transform: 'translateX(-100%)',
                      animation: hoveredModule === module.id ? 'scanLine 1.5s linear infinite' : 'none'
                    }}
                  />
                  
                  {/* Ligne scan horizontale pour tous les modules */}
                  <div 
                    className={`absolute top-0 left-0 w-full h-px ${module.color.replace('text', 'bg')}`}
                    style={{
                      opacity: hoveredModule === module.id ? 0.8 : 0,
                      transform: 'translateY(-100%)',
                      animation: hoveredModule === module.id ? 'scanLineHorizontal 1.5s linear infinite' : 'none'
                    }}
                  />
                  
                  {/* Button */}
                  <div className="mt-auto pt-4">
                    <CyberButton 
                      variant="primary"
                      onClick={() => {
                        // Utiliser les routes directes pour s'assurer que les liens fonctionnent
                        if (module.id === 'cyber') {
                          setLocation('/cyber');
                        } else if (module.id === 'data') {
                          setLocation('/data-ia');
                        } else if (module.id === 'mc2i') {
                          setLocation('/amoa-mode-selection-fixed');
                        } else {
                          setLocation('/playground/module-generator-new');
                        }
                      }}
                      className="w-full"
                    >
                      Accéder
                      <ChevronRight className="ml-2" size={16} />
                    </CyberButton>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Section Fonctionnalités */}
        <section className="relative z-20 py-24 cyber-grid">
          <div className="absolute inset-0 bg-black/80 z-0"></div>
          <div className="container mx-auto px-8 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block">
                <span className="px-4 py-1 rounded-full text-sm font-semibold bg-blue-900/30 text-cyan-300 font-cyber-accent tracking-wide border border-blue-500/30 backdrop-blur-sm">
                  Technologie Propriétaire
                </span>
              </div>
              <h2 className="mt-4 text-4xl md:text-5xl font-cyber-title tracking-wider text-white">
                Avancées <span className="text-pink-400">Technologiques</span>
              </h2>
              <p className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto">
                Une infrastructure numérique conçue pour propulser votre apprentissage vers de nouveaux horizons.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="cyber-hud-frame backdrop-blur-md"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 p-3 rounded-full bg-blue-900/20 border border-cyan-500/30 neon-pulse">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-cyber-title text-cyan-300 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="relative z-20 py-12 border-t border-cyan-900/30">
          <div className="container mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <img src={mcLogoPath} alt="mc2i" className="h-8 w-auto" />
                  <div className="h-5 w-px bg-cyan-500/50"></div>
                  <div className="text-xl font-cyber-title text-cyan-400 tracking-wider font-bold">
                    FYNE
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  Propulsez votre formation avec notre plateforme IA de simulation immersive.
                </p>
              </div>
              
              <div>
                <h4 className="text-cyan-400 font-cyber-title mb-4 text-sm uppercase tracking-wider">Modules</h4>
                <ul className="space-y-2">
                  {modules.map(module => (
                    <li key={module.id}>
                      <Link 
                        href={
                          module.id === 'cyber' ? '/cyber' :
                          module.id === 'data' ? '/data-ia' :
                          module.id === 'mc2i' ? '/amoa-mode-selection-fixed' :
                          '/playground/module-generator-new'
                        }
                        className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          if (module.id === 'cyber') {
                            setLocation('/cyber');
                          } else if (module.id === 'data') {
                            setLocation('/data-ia');
                          } else if (module.id === 'mc2i') {
                            setLocation('/amoa-mode-selection-fixed');
                          } else {
                            setLocation('/playground/module-generator-new');
                          }
                        }}
                      >
                        {module.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-cyan-400 font-cyber-title mb-4 text-sm uppercase tracking-wider">Ressources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm">Documentation</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm">Tutoriels</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm">Support</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-cyan-400 font-cyber-title mb-4 text-sm uppercase tracking-wider">Contact</h4>
                <div className="flex items-center gap-4">
                  <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300">
                    <Globe size={20} />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300">
                    <Share2 size={20} />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300">
                    <Users size={20} />
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-cyan-900/30 text-center">
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