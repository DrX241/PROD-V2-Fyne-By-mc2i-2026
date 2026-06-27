import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";

import {
  Globe,
  Share2,
  Users,
  ChevronRight,
  Lock,
} from 'lucide-react';
import mcLogoPath from "@assets/mc2i.png";
import fyneCharacterPath from "../assets/fyne-character.png";
import { UserSubscriptionBadge } from "@/components/UserSubscriptionBadge";
import { UserMenu } from "@/components/auth/UserMenu";

interface Module {
  id: string;
  moduleKey: string;
  title: string;
  description: string;
  route: string;
  external?: boolean;
}

const CyberHomePage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { themeMode, setThemeMode } = useTheme();
  const { user } = useAuth();

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
      title: 'ESPACE CYBER',
      description: 'Plongez au cœur des enjeux de la cybersécurité avec des simulations réalistes et des agents IA.',
      route: '/cyber',
    },
    {
      id: 'data',
      moduleKey: 'data',
      title: 'ESPACE DATA & IA',
      description: 'Maîtrisez les concepts de data science et d\'intelligence artificielle à travers des simulations pratiques.',
      route: '/data-ia',
    },
    {
      id: 'si-champion',
      moduleKey: 'evaluation',
      title: 'ESPACE CHALLENGE',
      description: 'Pilotez vos campagnes d\'évaluation et faites passer vos tests dans un espace dédié.',
      route: '/evaluation',
    },
    {
      id: 'module-generator',
      moduleKey: 'playground',
      title: 'ESPACE STUDIO',
      description: 'Créez votre propre parcours d\'apprentissage personnalisé avec notre IA générative.',
      route: '/playground/module-generator',
    },
  ];

  // Determine which modules the current user can access
  const userModules: string[] = user?.modulesEnabled ?? ['cyber','data','amoa','evaluation','playground'];
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const hasAccess = (moduleKey: string) => isAdmin || userModules.includes(moduleKey);


  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `@keyframes chFadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`;
    document.head.appendChild(style);

    let activeId: string | null = null;

    const activate = (item: Element) => {
      const target = item.getAttribute('data-ch-target');
      const color = item.getAttribute('data-ch-color') || '#006a9e';
      if (!target || target === activeId) return;
      activeId = target;

      document.querySelectorAll('.ch-space-item').forEach(el => {
        (el as HTMLElement).style.background = 'transparent';
      });
      (item as HTMLElement).style.background = '#fff';

      const cursor = document.getElementById('ch-cursor');
      if (cursor) {
        const itemsEl = document.getElementById('ch-items');
        const itemRect = (item as HTMLElement).getBoundingClientRect();
        const itemsRect = itemsEl?.getBoundingClientRect();
        cursor.style.top = `${itemRect.top - (itemsRect?.top ?? 0)}px`;
        cursor.style.height = `${itemRect.height}px`;
        cursor.style.background = color;
      }

      document.querySelectorAll('[id^="ch-panel-"]').forEach(panel => {
        (panel as HTMLElement).style.display = 'none';
      });
      const panel = document.getElementById(`ch-panel-${target}`);
      if (panel) {
        panel.style.display = 'flex';
        panel.style.animation = 'none';
        void panel.offsetHeight;
        panel.style.animation = 'chFadeUp 0.2s ease';
      }
    };

    const initCursor = () => {
      const firstItem = document.querySelector('.ch-space-item') as HTMLElement | null;
      if (firstItem) {
        const cursor = document.getElementById('ch-cursor');
        const itemsEl = document.getElementById('ch-items');
        if (cursor && itemsEl) {
          const itemRect = firstItem.getBoundingClientRect();
          const itemsRect = itemsEl.getBoundingClientRect();
          cursor.style.top = `${itemRect.top - itemsRect.top}px`;
          cursor.style.height = `${itemRect.height}px`;
          const color = firstItem.getAttribute('data-ch-color') || '#006a9e';
          cursor.style.background = color;
        }
      }
    };

    const timer = setTimeout(initCursor, 100);

    const handler = (e: Event) => {
      const target = (e.target as Element).closest('.ch-space-item');
      if (target) activate(target);
    };
    document.addEventListener('mouseenter', handler, true);
    document.addEventListener('click', handler, true);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseenter', handler, true);
      document.removeEventListener('click', handler, true);
      document.head.removeChild(style);
    };
  }, []);

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
            <div className="flex items-center gap-2">
              <UserSubscriptionBadge />
              <div className="h-5 w-px bg-gray-200 mx-1" />
              <UserMenu />
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
                Découvrez une nouvelle dimension d'apprentissage avec nos espaces de simulation IA qui s'adaptent à votre niveau et vos objectifs.
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

        {/* Section Modules — Cockpit V3 */}
        <section id="modules" className="relative z-20 bg-white w-full">
          <div className="w-full px-8 py-16">

            {/* En-tête */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
              <div>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a0a0b8', marginBottom: '8px' }}>
                  Espaces d'entraînement
                </p>
                <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, color: '#0d0d12' }}>
                  Choisissez votre prochain défi.
                </h2>
              </div>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#a0a0b8', textAlign: 'right', lineHeight: 2 }}>
                {modules.filter(m => hasAccess(m.moduleKey)).length} espaces accessibles
              </p>
            </div>

            {/* Cockpit split */}
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', border: '1px solid #ebebf0', minHeight: '440px' }}>

              {/* Sélecteur gauche */}
              <div style={{ borderRight: '1px solid #ebebf0', display: 'flex', flexDirection: 'column', background: '#f9f9fb', position: 'relative' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #ebebf0' }}>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '8px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a0a0b8', marginBottom: '2px' }}>Sélection</p>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#0d0d12' }}>Espace actif</p>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }} id="ch-items">
                  <div id="ch-cursor" style={{ position: 'absolute', left: 0, width: '2px', background: '#6366f1', transition: 'top 0.28s cubic-bezier(0.16,1,0.3,1), height 0.28s cubic-bezier(0.16,1,0.3,1)', zIndex: 10 }} />
                  {modules.map((module, i) => {
                    const accessible = hasAccess(module.moduleKey);
                    const accentHex =
                      module.id === 'cyber'            ? '#0057ff' :
                      module.id === 'data'             ? '#059669' :
                      module.id === 'si-champion'      ? '#7c3aed' :
                      module.id === 'module-generator' ? '#dc2626' :
                      '#006a9e';
                    return (
                      <div
                        key={module.id}
                        data-ch-target={module.id}
                        data-ch-color={accentHex}
                        data-ch-accessible={accessible ? 'true' : 'false'}
                        className="ch-space-item"
                        onClick={() => {
                          if (!accessible) return;
                          if (module.external) window.open(module.route, '_blank', 'noopener,noreferrer');
                          else setLocation(module.route);
                        }}
                        style={{
                          padding: '14px 20px',
                          borderBottom: i < modules.length - 1 ? '1px solid #ebebf0' : 'none',
                          cursor: accessible ? 'pointer' : 'not-allowed',
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          gap: '3px',
                          transition: 'background 0.12s',
                          opacity: accessible ? 1 : 0.45,
                          background: i === 0 ? '#fff' : 'transparent',
                        }}
                      >
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '8px', letterSpacing: '0.16em', textTransform: 'uppercase', color: accessible ? accentHex : '#a0a0b8' }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '-0.01em', color: '#0d0d12', lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {module.title}
                          {!accessible && <Lock style={{ width: '11px', height: '11px', color: '#a0a0b8', flexShrink: 0 }} />}
                        </span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '8px', letterSpacing: '0.04em', color: '#a0a0b8' }}>
                          {module.description.slice(0, 48)}…
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Panneau détail droite */}
              <div style={{ position: 'relative', background: '#fff', overflow: 'hidden' }}>
                {modules.map((module, pi) => {
                  const accessible = hasAccess(module.moduleKey);
                  const accentHex =
                    module.id === 'cyber'            ? '#0057ff' :
                    module.id === 'data'             ? '#059669' :
                    module.id === 'si-champion'      ? '#7c3aed' :
                    module.id === 'module-generator' ? '#dc2626' :
                    '#006a9e';
                  const tags: Record<string, string[]> = {
                    cyber:             ['Défense réseau', 'Agent IA', 'QCM', 'Simulation'],
                    data:              ['SQL', 'Python', 'Excel', 'IA Lab', 'Sandbox'],
                    'si-champion':     ['Évaluation', 'QCM', 'Reporting', 'Campagnes'],
                    'module-generator': ['IA générative', 'Parcours sur mesure', 'Studio'],
                  };
                  return (
                    <div
                      key={module.id}
                      id={`ch-panel-${module.id}`}
                      style={{ display: pi === 0 ? 'flex' : 'none', flexDirection: 'column', height: '100%', padding: '28px 36px', animation: 'chFadeUp 0.2s ease' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '8px', letterSpacing: '0.18em', color: '#a0a0b8' }}>
                          {String(pi + 1).padStart(2, '0')} / {String(modules.length).padStart(2, '0')}
                        </span>
                        <div style={{ flex: 1, height: '1px', background: '#ebebf0' }} />
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '8px', letterSpacing: '0.12em', padding: '2px 8px', border: `1px solid ${accessible ? accentHex + '44' : '#ebebf0'}`, color: accessible ? accentHex : '#a0a0b8' }}>
                          {accessible ? 'Actif' : 'Accès restreint'}
                        </span>
                      </div>

                      <div style={{ fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 0.92, color: accessible ? accentHex : '#d1d5db', marginBottom: '16px' }}>
                        {module.title.split(' ').slice(0, 2).join(' ')}<br />
                        {module.title.split(' ').slice(2).join(' ')}
                      </div>

                      <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#5a5a70', maxWidth: '440px', marginBottom: '16px', flex: 1 }}>
                        {module.description}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '20px' }}>
                        {(tags[module.id] || []).map(tag => (
                          <span key={tag} style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '3px 8px', border: '1px solid #ebebf0', color: '#a0a0b8' }}>{tag}</span>
                        ))}
                      </div>

                      <div>
                        {accessible ? (
                          <button
                            onClick={() => {
                              if (module.external) window.open(module.route, '_blank', 'noopener,noreferrer');
                              else setLocation(module.route);
                            }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', color: '#fff', background: accentHex }}
                          >
                            Accéder →
                          </button>
                        ) : (
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.12em', color: '#a0a0b8', textTransform: 'uppercase' }}>
                            🔒 Accès non autorisé
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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
