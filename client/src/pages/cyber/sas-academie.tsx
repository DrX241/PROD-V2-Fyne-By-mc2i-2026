import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronLeft, BookOpen, MessageSquare, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import HomeLayout from '@/components/layout/HomeLayout';

const ACC = '#0057ff';
const BG = '#0f1117';
const SURFACE = '#111827';
const BORDER = '#1e2d45';
const TEXT = '#f1f5f9';
const SUB = '#64748b';
const MONO = "'DM Mono', monospace";
const SANS = "'DM Sans', sans-serif";

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
    id: 'expert',
    icon: MessageSquare,
    label: 'APPRENTISSAGE CONVERSATIONNEL',
    sub: 'Discussion libre avec un expert IA',
    description: 'Posez vos questions à un expert virtuel en cybersécurité. Format libre, adaptatif, sans contrainte de parcours.',
    cta: 'Discuter avec un expert',
    route: '/cyber/expert-learning',
  },
];

export default function SasCyberAcademie() {
  const [, navigate] = useLocation();
  const [hovered, setHovered] = React.useState<string | null>(null);

  return (
    <HomeLayout>
      <div style={{ minHeight: '100vh', backgroundColor: BG, fontFamily: SANS, color: TEXT }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '56px 32px 80px' }}>

          {/* Back */}
          <button
            onClick={() => navigate('/cyber')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: SUB, fontSize: '0.8rem', marginBottom: 48, padding: 0, fontFamily: MONO }}
          >
            <ChevronLeft size={14} /> Retour vers I AM CYBER
          </button>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 56 }}>
            <p style={{ fontFamily: MONO, fontSize: '0.65rem', letterSpacing: '0.15em', color: ACC, marginBottom: 12 }}>
              CYBER ACADÉMIE
            </p>
            <h1 style={{ fontFamily: MONO, fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 600, margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Choisissez votre<br />mode d'apprentissage
            </h1>
            <p style={{ color: SUB, fontSize: '0.95rem', maxWidth: 480, margin: 0 }}>
              Deux approches complémentaires pour maîtriser la cybersécurité à votre rythme.
            </p>
          </motion.div>

          {/* Mode rows */}
          <div style={{ borderTop: `1px solid ${BORDER}` }}>
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
                    gridTemplateColumns: '48px 1fr auto',
                    alignItems: 'center',
                    gap: 24,
                    padding: '28px 0',
                    borderBottom: `1px solid ${BORDER}`,
                    cursor: 'pointer',
                    background: isHovered ? `rgba(0,87,255,0.03)` : 'transparent',
                    transition: 'background 0.15s ease',
                    position: 'relative',
                  }}
                >
                  {/* Active indicator */}
                  <div style={{
                    position: 'absolute', left: -32, top: 0, bottom: 0, width: 2,
                    background: ACC, opacity: isHovered ? 1 : 0, transition: 'opacity 0.15s ease',
                  }} />

                  {/* Icon */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} style={{ color: isHovered ? ACC : '#334155', transition: 'color 0.15s ease' }} />
                  </div>

                  {/* Content */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: MONO, fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em', color: isHovered ? TEXT : '#94a3b8', transition: 'color 0.15s ease' }}>
                        {mode.label}
                      </span>
                      <span style={{ fontFamily: SANS, fontSize: '0.8rem', color: SUB, fontStyle: 'italic' }}>
                        {mode.sub}
                      </span>
                    </div>
                    <p style={{ fontFamily: SANS, fontSize: '0.82rem', color: '#475569', margin: 0, lineHeight: 1.6, maxWidth: 560 }}>
                      {mode.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    opacity: isHovered ? 1 : 0, transition: 'opacity 0.15s ease', whiteSpace: 'nowrap',
                  }}>
                    <span style={{ fontFamily: MONO, fontSize: '0.7rem', color: ACC, letterSpacing: '0.06em' }}>
                      {mode.cta}
                    </span>
                    <ArrowRight size={14} style={{ color: ACC }} />
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
