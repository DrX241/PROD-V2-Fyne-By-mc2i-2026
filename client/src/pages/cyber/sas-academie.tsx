import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronLeft, BookOpen, ArrowRight, Monitor } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import HomeLayout from '@/components/layout/HomeLayout';

const W = {
  bg:      '#ffffff',
  surface: '#f7f8fa',
  line:    '#e8eaed',
  blue:    '#006a9e',
  pink:    '#dd0061',
  text:    '#0f172a',
  sub:     '#64748b',
  muted:   '#94a3b8',
  red:     '#ef4444',
  green:   '#10b981',
  amber:   '#f59e0b',
  MONO:    "'JetBrains Mono', monospace",
  SANS:    "'Plus Jakarta Sans', sans-serif",
};

const MODES = [
  {
    id: 'formations',
    icon: BookOpen,
    label: 'FORMATIONS STRUCTURÉES',
    sub: 'Modules théorie + pratique + QCM',
    description: 'Suivez des micro-learnings interactifs créés par vos formateurs cyber. Chaque module alterne théorie, mise en situation et validation par QCM.',
    cta: 'Accéder aux formations',
    route: '/cyber/academie',
  },
  {
    id: 'simulator',
    icon: Monitor,
    label: 'MISE EN SITUATION TECHNIQUE',
    sub: 'Simulation d\'attaque cyber en temps réel',
    description: 'Visualisez le déroulé d\'une attaque cyber (phishing, brute force, social engineering) avec curseur animé, terminal et log d\'événements.',
    cta: 'Lancer une simulation',
    route: '/cyber/attack-simulator',
  },
];

export default function SasCyberAcademie() {
  const [, navigate] = useLocation();
  const [hovered, setHovered] = React.useState<string | null>(null);

  return (
    <HomeLayout>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');`}</style>
      <div style={{ minHeight: '100vh', backgroundColor: W.bg, fontFamily: W.SANS, color: W.text }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 40px 80px' }}>

          {/* Breadcrumb */}
          <button
            onClick={() => navigate('/cyber')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: W.muted,
              fontSize: '10px',
              fontFamily: W.MONO,
              letterSpacing: '0.06em',
              marginBottom: 40,
              padding: 0,
            }}
          >
            <ChevronLeft size={12} /> Retour vers I AM CYBER
          </button>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 48 }}>
            <span style={{
              fontFamily: W.MONO,
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: W.blue,
              marginBottom: 8,
              display: 'block',
            }}>
              CYBER ACADÉMIE
            </span>
            <h1 style={{
              fontFamily: W.SANS,
              fontSize: 'clamp(1.6rem, 3vw, 2rem)',
              fontWeight: 700,
              margin: '0 0 8px',
              letterSpacing: '-0.03em',
              color: W.text,
              lineHeight: 1.2,
            }}>
              Choisissez votre mode d'apprentissage
            </h1>
            <p style={{
              fontSize: '14px',
              color: W.sub,
              margin: 0,
              maxWidth: 480,
              lineHeight: 1.6,
            }}>
              Trois approches complémentaires pour maîtriser la cybersécurité à votre rythme.
            </p>
          </motion.div>

          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0 }}>
            <span style={{ fontFamily: W.MONO, fontSize: '10px', textTransform: 'uppercase', color: W.muted }}>MODES</span>
            <div style={{ flex: 1, height: 1, background: W.line }} />
          </div>

          {/* Modes list */}
          <div style={{ borderTop: `1px solid ${W.line}` }}>
            {MODES.map((mode, i) => {
              const Icon = mode.icon;
              const isHovered = hovered === mode.id;
              return (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => navigate(mode.route)}
                  onMouseEnter={() => setHovered(mode.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr auto',
                    alignItems: 'center',
                    gap: 24,
                    padding: '24px 12px',
                    borderBottom: `1px solid ${W.line}`,
                    cursor: 'pointer',
                    background: isHovered ? W.surface : 'transparent',
                    transition: 'background 0.12s ease',
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 36,
                    height: 36,
                    background: isHovered ? W.blue : W.surface,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.12s ease',
                    flexShrink: 0,
                  }}>
                    <Icon size={16} style={{ color: isHovered ? '#fff' : W.sub, transition: 'color 0.12s ease' }} />
                  </div>

                  {/* Content */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 5, flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: W.MONO,
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        color: isHovered ? W.text : W.sub,
                        transition: 'color 0.12s ease',
                      }}>
                        {mode.label}
                      </span>
                      <span style={{ fontFamily: W.SANS, fontSize: '13px', fontStyle: 'italic', color: W.muted }}>
                        {mode.sub}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: W.sub, lineHeight: 1.6, margin: 0, maxWidth: 520 }}>
                      {mode.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.12s ease',
                    whiteSpace: 'nowrap',
                  }}>
                    <span style={{ fontFamily: W.MONO, fontSize: '11px', color: W.blue }}>
                      {mode.cta}
                    </span>
                    <ArrowRight size={12} style={{ color: W.blue }} />
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </HomeLayout>
  );
}
