import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Target,
  Gamepad2,
  FlaskConical,
  ChevronRight,
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
  const progressPct = nextLevel
    ? Math.min(100, ((score - levelInfo.min) / (nextLevel.min - levelInfo.min)) * 100)
    : 100;

  return (
    <HomeLayout>
      <Helmet>
        <title>I AM CYBER | Univers Cybersécurité</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Helmet>

      <div
        className="min-h-screen"
        style={{
          backgroundColor: '#0f1117',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-12">

          {/* ── Hero ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <p
              className="text-xs tracking-widest mb-3"
              style={{ fontFamily: "'DM Mono', monospace", color: '#0057ff' }}
            >
              UNIVERS CYBERSÉCURITÉ
            </p>
            <h1
              className="text-4xl font-bold text-white mb-3"
              style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.01em' }}
            >
              I AM CYBER
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: 480 }}>
              Choisissez votre mode de formation et progressez à votre rythme.
            </p>

            {/* ── Progress bar ── */}
            <div className="mt-8 max-w-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-2">
                  {LEVELS.map((lvl, i) => (
                    <span
                      key={lvl.label}
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '0.65rem',
                        color: i === levelIndex ? '#f1f5f9' : '#334155',
                        fontWeight: i === levelIndex ? 600 : 400,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {lvl.label.toUpperCase()}
                      {i < LEVELS.length - 1 && <span style={{ color: '#1e2d45', marginLeft: 4, marginRight: 4 }}>·</span>}
                    </span>
                  ))}
                </div>
              </div>
              <div
                style={{
                  height: 3,
                  width: '100%',
                  background: '#1e2d45',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  style={{ height: '100%', background: '#0057ff', borderRadius: 2 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: '#475569' }}>
                  {score} pts
                </span>
                {nextLevel && (
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: '#475569' }}>
                    {nextLevel.min} pts → {nextLevel.label}
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── 4 Doors grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOORS.map((door, i) => {
              const Icon = door.icon;
              const isHovered = hoveredDoor === door.id;
              return (
                <motion.div
                  key={door.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="rounded-xl overflow-hidden cursor-pointer"
                  style={{
                    background: isHovered ? '#161d2e' : '#111827',
                    border: `1px solid ${isHovered ? '#1e3a5f' : '#1e2d45'}`,
                    transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: isHovered ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
                  }}
                  onMouseEnter={() => setHoveredDoor(door.id)}
                  onMouseLeave={() => setHoveredDoor(null)}
                  onClick={() => setLocation(door.route)}
                >
                  <div className="p-6 flex flex-col gap-4">
                    {/* Icon */}
                    <div
                      style={{
                        display: 'inline-flex',
                        padding: '10px',
                        borderRadius: 10,
                        background: '#1e2d45',
                        width: 'fit-content',
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: '#0057ff' }} />
                    </div>

                    {/* Title + description */}
                    <div>
                      <h2
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#f1f5f9',
                          letterSpacing: '0.08em',
                          marginBottom: 6,
                        }}
                      >
                        {door.label}
                      </h2>
                      <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 12 }}>
                        {door.sub}
                      </p>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {door.tags.map(tag => (
                          <span
                            key={tag}
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: '#0f1825',
                              color: '#475569',
                              border: '1px solid #1e2d45',
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: 4,
                        borderTop: '1px solid #1e2d45',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: isHovered ? '#0057ff' : '#475569',
                          fontWeight: 500,
                          transition: 'color 0.2s ease',
                        }}
                      >
                        {door.cta}
                      </span>
                      <ChevronRight
                        className="w-4 h-4"
                        style={{
                          color: isHovered ? '#0057ff' : '#334155',
                          transition: 'color 0.2s ease, transform 0.2s ease',
                          transform: isHovered ? 'translateX(3px)' : 'none',
                        }}
                      />
                    </div>
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
