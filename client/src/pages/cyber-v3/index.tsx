import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Target,
  Gamepad2,
  FlaskConical,
  ArrowRight,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import HomeLayout from '@/components/layout/HomeLayout';

// ── Level thresholds ──────────────────────────────────────────────────────────
const LEVELS = [
  { label: 'Novice',       min: 0,    max: 99   },
  { label: 'Padawan',      min: 100,  max: 299  },
  { label: 'Chevalier',    min: 300,  max: 599  },
  { label: 'Maître',       min: 600,  max: 999  },
  { label: 'Grand Maître', min: 1000, max: 9999 },
];

function getLevelInfo(score: number) {
  return LEVELS.find(l => score >= l.min && score <= l.max) ?? LEVELS[0];
}

// ── Door config ───────────────────────────────────────────────────────────────
const DOORS = [
  {
    id: 'decouvrir',
    label: 'DÉCOUVRIR',
    sub: 'Maîtrisez les fondamentaux de la cybersécurité',
    cta: "Accéder à l'académie",
    route: '/cyber/sas-academie',
    icon: GraduationCap,
    tags: ['Académie', 'Expert IA', 'Conversationnel'],
  },
  {
    id: 'entrainer',
    label: "S'ENTRAÎNER",
    sub: 'Incarnez un rôle et affrontez des scénarios réalistes',
    cta: 'Accéder aux rôles',
    route: '/cyber/roleplay',
    icon: Target,
    tags: ['Monsieur Tout le Monde', 'Formation', 'Professionnel'],
  },
  {
    id: 'challenger',
    label: 'SE CHALLENGER',
    sub: 'Jeux, défis et scores en temps réel',
    cta: 'Accéder aux jeux',
    route: '/cyber/arcade',
    icon: Gamepad2,
    tags: ['Bug Hunter', 'Firewall', 'Brain Hacker', 'Escape'],
  },
  {
    id: 'simuler',
    label: 'SIMULER',
    sub: 'Gestion de crise, pentest et simulations avancées',
    cta: 'Accéder aux simulations',
    route: '/cyber/simulations',
    icon: FlaskConical,
    tags: ['RSSI', 'COMEX', 'Pentest Lab'],
  },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function CyberV3() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [hoveredDoor, setHoveredDoor] = useState<string | null>(null);

  const score = (user as any)?.kpi?.score ?? 0;
  const levelInfo = getLevelInfo(score);
  const levelIndex = LEVELS.findIndex(l => l.label === levelInfo.label);
  const nextLevel = LEVELS[levelIndex + 1];

  // Progress within the current level segment (0–100%)
  const segmentPct = nextLevel
    ? Math.min(100, ((score - levelInfo.min) / (nextLevel.min - levelInfo.min)) * 100)
    : 100;

  // Overall position across full bar: each level = 1/5 of total width
  const overallPct = (levelIndex / LEVELS.length) * 100 + segmentPct / LEVELS.length;

  return (
    <HomeLayout>
      <Helmet>
        <title>I AM CYBER | Univers Cybersécurité</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
          .cursor-blink { animation: blink 1.1s step-end infinite; }
        `}</style>
      </Helmet>

      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0f1117',
          fontFamily: "'DM Sans', sans-serif",
          color: '#f1f5f9',
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '56px 32px 80px' }}>

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ marginBottom: 56 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.65rem',
                letterSpacing: '0.15em',
                color: '#0057ff',
                textTransform: 'uppercase',
              }}>
                Univers Cybersécurité
              </span>
              <span className="cursor-blink" style={{ color: '#0057ff', fontSize: '0.8rem' }}>▋</span>
            </div>

            <h1 style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#f1f5f9',
              margin: '0 0 8px',
              lineHeight: 1.1,
            }}>
              I AM CYBER
            </h1>
            <p style={{ color: '#475569', fontSize: '0.95rem', margin: 0, maxWidth: 440 }}>
              Choisissez votre mode de formation et progressez à votre rythme.
            </p>
          </motion.div>

          {/* ── Full-width progression tracker ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            style={{ marginBottom: 64 }}
          >
            {/* Level labels row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 10 }}>
              {LEVELS.map((lvl, i) => {
                const isActive = i === levelIndex;
                const isPast = i < levelIndex;
                return (
                  <div key={lvl.label} style={{ paddingRight: i < 4 ? 8 : 0 }}>
                    <div style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '0.6rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: isActive ? '#f1f5f9' : isPast ? '#334155' : '#1e293b',
                      fontWeight: isActive ? 600 : 400,
                      marginBottom: 4,
                    }}>
                      {isActive && <span style={{ color: '#0057ff', marginRight: 4 }}>▸</span>}
                      {lvl.label}
                    </div>
                    <div style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '0.55rem',
                      color: isActive ? '#475569' : '#1e293b',
                    }}>
                      {lvl.min === 0 ? '0' : lvl.min}+ pts
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Segmented progress bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3 }}>
              {LEVELS.map((lvl, i) => {
                const isPast = i < levelIndex;
                const isActive = i === levelIndex;
                return (
                  <div
                    key={lvl.label}
                    style={{
                      height: 6,
                      background: '#161b27',
                      border: '1px solid #1e2d45',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {isPast && (
                      <div style={{ position: 'absolute', inset: 0, background: '#0057ff', opacity: 0.35 }} />
                    )}
                    {isActive && (
                      <motion.div
                        style={{
                          position: 'absolute',
                          top: 0, left: 0, bottom: 0,
                          background: '#0057ff',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${segmentPct}%` }}
                        transition={{ delay: 0.4, duration: 0.9, ease: 'easeOut' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Score info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.65rem',
                color: '#334155',
              }}>
                Score actuel :&nbsp;
                <span style={{ color: '#0057ff' }}>{score} pts</span>
              </span>
              {nextLevel && (
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '0.65rem',
                  color: '#334155',
                }}>
                  {nextLevel.min - score} pts → {nextLevel.label}
                </span>
              )}
              {!nextLevel && (
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '0.65rem',
                  color: '#0057ff',
                }}>
                  Niveau maximum atteint
                </span>
              )}
            </div>
          </motion.div>

          {/* ── Command rows ── */}
          <div style={{ borderTop: '1px solid #1a2236' }}>
            {DOORS.map((door, i) => {
              const Icon = door.icon;
              const isHovered = hoveredDoor === door.id;
              return (
                <motion.div
                  key={door.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.35 }}
                  onClick={() => setLocation(door.route)}
                  onMouseEnter={() => setHoveredDoor(door.id)}
                  onMouseLeave={() => setHoveredDoor(null)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '48px 1fr auto',
                    alignItems: 'center',
                    gap: 24,
                    padding: '22px 0',
                    borderBottom: '1px solid #1a2236',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.15s ease',
                    background: isHovered ? 'rgba(0,87,255,0.04)' : 'transparent',
                    marginLeft: isHovered ? 0 : 0,
                  }}
                >
                  {/* Active left bar */}
                  <div style={{
                    position: 'absolute',
                    left: -32,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background: '#0057ff',
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.15s ease',
                  }} />

                  {/* Index + icon */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '0.6rem',
                      color: isHovered ? '#0057ff' : '#1e2d45',
                      letterSpacing: '0.05em',
                      transition: 'color 0.15s ease',
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <Icon
                      size={18}
                      style={{
                        color: isHovered ? '#0057ff' : '#334155',
                        transition: 'color 0.15s ease',
                        flexShrink: 0,
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 5 }}>
                      <span style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        color: isHovered ? '#f1f5f9' : '#94a3b8',
                        transition: 'color 0.15s ease',
                      }}>
                        {door.label}
                      </span>
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '0.82rem',
                        color: '#334155',
                        fontStyle: 'italic',
                      }}>
                        {door.sub}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {door.tags.map(tag => (
                        <span
                          key={tag}
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: '0.6rem',
                            color: '#334155',
                            letterSpacing: '0.06em',
                            padding: '1px 6px',
                            border: '1px solid #1a2236',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}>
                    <span style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: '0.7rem',
                      color: '#0057ff',
                      letterSpacing: '0.06em',
                    }}>
                      {door.cta}
                    </span>
                    <ArrowRight size={14} style={{ color: '#0057ff' }} />
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
