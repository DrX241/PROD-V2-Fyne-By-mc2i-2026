import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import CyberButton from '@/components/CyberButton';
import { useChatContext } from "@/contexts/ChatContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";

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
  Settings,
  Lock,
} from 'lucide-react';
import mcLogoPath from "@assets/mc2i.png";
import fyneCharacterPath from "../assets/fyne-character.png";
import { Switch } from "@/components/ui/switch";
import { ModelSelector } from "@/components/ModelSelector";
import { UserSubscriptionBadge } from "@/components/UserSubscriptionBadge";

interface Module {
  id: string;
  // Key used in modulesEnabled array (may differ from display id)
  moduleKey: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  accentColor: string;
  route: string;
  comingSoon?: boolean;
  external?: boolean;
}

const CyberHomePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { userName } = useChatContext();
  const { themeMode, setThemeMode } = useTheme();
  const { user } = useAuth();
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousTheme = themeMode;
    setThemeMode('futuristic');
    window.scrollTo(0, 0);
    const preventScroll = () => { window.scrollTo(0, 0); };
    window.addEventListener('scroll', preventScroll, { passive: false });
    const timer = setTimeout(() => { window.removeEventListener('scroll', preventScroll); }, 1000);
    return () => {
      window.removeEventListener('scroll', preventScroll);
      clearTimeout(timer);
      setThemeMode(previousTheme);
    };
  }, []);

  const modules: Module[] = [
    {
      id: 'cyber',
      moduleKey: 'cyber',
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
      moduleKey: 'data',
      title: 'I AM DATA & IA',
      description: 'Maîtrisez les concepts de data science et d\'intelligence artificielle à travers des simulations pratiques.',
      icon: <div className="w-5 h-5 bg-purple-500"></div>,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      accentColor: 'border-purple-500',
      route: '/data-ia'
    },
    {
      id: 'si-champion',
      moduleKey: 'evaluation',
      title: 'I AM SI CHAMPION',
      description: 'Pilotez vos campagnes d\'évaluation et faites passer vos tests dans un espace dédié',
      icon: <div className="w-5 h-5 bg-amber-500"></div>,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      accentColor: 'border-amber-500',
      route: '/evaluation'
    },
    {
      id: 'formation-data',
      moduleKey: 'formation-data',
      title: 'FORMATION DATA',
      description: 'SQL, Python, Excel — parcours progressifs avec sandbox réelle et coach IA.',
      icon: <div className="w-5 h-5 bg-[#006a9e]"></div>,
      color: 'text-[#006a9e]',
      bgColor: 'bg-[#006a9e]/10',
      accentColor: 'border-[#006a9e]',
      route: '/cyber/formation-data'
    },
    {
      id: 'module-generator',
      moduleKey: 'playground',
      title: 'Soyez qui vous voulez',
      description: 'Créez votre propre parcours d\'apprentissage personnalisé avec notre IA générative.',
      icon: <div className="w-5 h-5 bg-rose-500"></div>,
      color: 'text-rose-600',
      bgColor: 'bg-rose-100',
      accentColor: 'border-rose-500',
      route: '/playground/module-generator'
    },
  ];

  // Determine which modules the current user can access
  const userModules: string[] = user?.modulesEnabled ?? ['cyber','data','amoa','formation-data','evaluation','playground'];
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const hasAccess = (moduleKey: string) => isAdmin || userModules.includes(moduleKey);

  const [isEcoMode, setIsEcoMode] = useState(false);
  const toggleEcoMode = () => { setIsEcoMode(!isEcoMode); };

  return (
    <div ref={pageRef} className="min-h-screen bg-white text-[#061019]">
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
              <UserSubscriptionBadge />
              <ModelSelector />
              {(user?.role === 'admin' || user?.role === 'superadmin') && (
                <button
                  onClick={() => setLocation('/admin')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#006a9e] border border-[#006a9e]/30 rounded-lg hover:bg-[#006a9e]/5 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Administration
                </button>
              )}
              {user?.role === 'superadmin' && (
                <button
                  onClick={() => setLocation('/superadmin')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-600 border border-amber-500/30 rounded-lg hover:bg-amber-500/5 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 11H9v-2h2v2zm0-4H9V7h2v4z"/></svg>
                  Super Admin
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero */}
        <section className="relative z-10 min-h-screen flex items-center justify-center pt-28 pb-32">
          <div className="container mx-auto px-8 flex flex-col md:flex-row items-center">
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
              <div className="flex flex-col items-center justify-center mt-10 gap-2">
                <motion.button
                  onClick={() => document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex flex-col items-center gap-1 group focus:outline-none"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="text-[#006a9e] font-semibold text-base tracking-wide group-hover:text-[#0085c7] transition-colors">
                    Découvrez FYNE
                  </span>
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex flex-col items-center"
                  >
                    <ChevronRight className="rotate-90 h-6 w-6 text-[#006a9e] group-hover:text-[#0085c7] transition-colors" />
                    <ChevronRight className="rotate-90 h-6 w-6 text-[#006a9e]/50 group-hover:text-[#0085c7]/50 -mt-3 transition-colors" />
                  </motion.div>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section Modules */}
        <section id="modules" className="relative z-20 py-24 bg-gray-50">
          <div className="container mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-wider text-[#061019]">
                Des <span className="text-[#dd0061]">formations</span> pour tous les besoins
              </h2>
              <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
                Explorez nos modules spécialisés conçus pour développer vos compétences dans des domaines stratégiques.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mx-auto max-w-5xl">
              {modules.map((module, i) => {
                const accessible = hasAccess(module.moduleKey);
                const accentHex =
                  module.id === 'cyber'       ? '#6366f1' :
                  module.id === 'data'        ? '#a855f7' :
                  module.id === 'mc2i'        ? '#10b981' :
                  module.id === 'si-champion' ? '#f59e0b' :
                  module.id === 'generator'   ? '#f43f5e' :
                  '#006a9e';

                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    onClick={() => {
                      if (!accessible) return;
                      if (module.external) window.open(module.route, '_blank', 'noopener,noreferrer');
                      else setLocation(module.route);
                    }}
                    className={`group relative flex items-center gap-5 px-6 py-5 rounded-xl transition-all duration-200
                      ${accessible
                        ? 'bg-white hover:bg-white cursor-pointer hover:shadow-md'
                        : 'bg-gray-50/60 cursor-not-allowed opacity-60'
                      }`}
                    style={{ borderLeft: `3px solid ${accessible ? accentHex : '#d1d5db'}` }}
                  >
                    {/* Color dot */}
                    <div
                      className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: `${accentHex}18` }}
                    >
                      <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: accentHex }} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900 truncate">{module.title}</h3>
                        {!accessible && <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{module.description}</p>
                    </div>

                    {/* Arrow */}
                    {accessible && (
                      <ChevronRight
                        className="w-4 h-4 flex-shrink-0 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-200"
                      />
                    )}
                  </motion.div>
                );
              })}
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
                  <div className="text-xl font-bold text-[#006a9e]">FYNE</div>
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
                      <span className="text-gray-400 cursor-not-allowed text-sm">{module.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-[#006a9e] font-bold mb-4 text-sm uppercase tracking-wider">Ressources</h4>
                <ul className="space-y-2">
                  <li><span className="text-gray-400 cursor-not-allowed text-sm">Documentation</span></li>
                  <li><span className="text-gray-400 cursor-not-allowed text-sm">Tutoriels</span></li>
                  <li><span className="text-gray-400 cursor-not-allowed text-sm">Blog</span></li>
                  <li><span className="text-gray-400 cursor-not-allowed text-sm">Support</span></li>
                </ul>
              </div>
              <div>
                <h4 className="text-[#006a9e] font-bold mb-4 text-sm uppercase tracking-wider">Contact</h4>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 cursor-not-allowed"><Globe size={20} /></span>
                  <span className="text-gray-400 cursor-not-allowed"><Share2 size={20} /></span>
                  <span className="text-gray-400 cursor-not-allowed"><Users size={20} /></span>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} FYNE by mc2i. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default CyberHomePage;
