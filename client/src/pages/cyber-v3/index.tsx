import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Target,
  Gamepad2,
  ArrowRight,
  Shield,
  Trophy,
  TrendingUp,
  ChevronRight,
  BookOpen,
  Zap,
  Star,
  Users,
  Lock,
} from 'lucide-react';

import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import HomeLayout from '@/components/layout/HomeLayout';

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:       '#ffffff',
  surface:  '#f5f6f8',
  border:   '#ebedf0',
  borderMid:'#d8dce3',
  blue:     '#006a9e',
  pink:     '#dd0061',
  text:     '#0f172a',
  sub:      '#64748b',
  muted:    '#94a3b8',
  hoverBg:  '#f0f3f7',
  activeBg: '#eaf3f9',
};

// ── Level thresholds ──────────────────────────────────────────────────────────
const LEVELS = [
  { label: 'Novice',       min: 0,    max: 99,   color: '#94a3b8' },
  { label: 'Padawan',      min: 100,  max: 299,  color: '#38bdf8' },
  { label: 'Chevalier',    min: 300,  max: 599,  color: '#006a9e' },
  { label: 'Maître',       min: 600,  max: 999,  color: '#7c3aed' },
  { label: 'Grand Maître', min: 1000, max: 9999, color: '#dd0061' },
];

function getLevelInfo(score: number) {
  return LEVELS.find(l => score >= l.min && score <= l.max) ?? LEVELS[0];
}

// ── Module cards ──────────────────────────────────────────────────────────────
const MODULES = [
  {
    id: 'decouvrir',
    label: 'Découvrir',
    headline: "L'Académie Cyber",
    description: 'Maîtrisez les fondamentaux de la cybersécurité grâce à un coach IA expert et des parcours progressifs.',
    cta: "Accéder à l'académie",
    route: '/cyber/sas-academie',
    Icon: GraduationCap,
    accent: T.blue,
    lightBg: '#deeef8',
    tags: ['Académie', 'Expert IA', 'Conversationnel'],
    stat: { label: 'modules', value: '12' },
  },
  {
    id: 'entrainer',
    label: "S'entraîner",
    headline: 'Roleplay & Scénarios',
    description: 'Incarnez un rôle professionnel et affrontez des scénarios réalistes : RSSI, analyste SOC, consultant...',
    cta: 'Accéder aux rôles',
    route: '/cyber/roleplay',
    Icon: Target,
    accent: '#7c3aed',
    lightBg: '#ede9fb',
    tags: ['Professionnel', 'Roleplay', 'Scénarios'],
    stat: { label: 'rôles', value: '8' },
  },
  {
    id: 'challenger',
    label: 'Se challenger',
    headline: 'Arcade & Défis',
    description: 'Jeux interactifs, défis chronométrés et classements en temps réel pour tester vos réflexes cyber.',
    cta: 'Accéder aux jeux',
    route: '/cyber/arcade',
    Icon: Gamepad2,
    accent: '#059669',
    lightBg: '#d5f0e6',
    tags: ['Bug Hunter', 'Firewall', 'Brain Hacker', 'Escape'],
    stat: { label: 'jeux', value: '6' },
  },
];

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'decouvrir',  label: "L'académie",    Icon: BookOpen,    route: '/cyber/sas-academie' },
  { id: 'entrainer',  label: 'Roleplay',       Icon: Users,       route: '/cyber/roleplay' },
  { id: 'challenger', label: 'Arcade',         Icon: Zap,         route: '/cyber/arcade' },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function CyberV3() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeNav, setActiveNav]   = useState<string | null>(null);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  const score = (user as any)?.kpi?.score ?? 0;
  const levelInfo = getLevelInfo(score);
  const levelIndex = LEVELS.findIndex(l => l.label === levelInfo.label);
  const nextLevel  = LEVELS[levelIndex + 1];
  const segmentPct = nextLevel
    ? Math.min(100, ((score - levelInfo.min) / (nextLevel.min - levelInfo.min)) * 100)
    : 100;

  return (
    <HomeLayout>
      <Helmet>
        <title>I AM CYBER | Univers Cybersécurité</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <style>{`* { box-sizing: border-box; }`}</style>
      </Helmet>

      {/* ── Root shell ── */}
      <div style={{
        minHeight: '100vh',
        backgroundColor: T.bg,
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        color: T.text,
        display: 'flex',
      }}>

        {/* ══════════════════════════════════════════════
            LEFT SIDEBAR
        ══════════════════════════════════════════════ */}
        <aside style={{
          width: 248,
          minHeight: '100vh',
          backgroundColor: T.surface,
          borderRight: `1px solid ${T.border}`,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          height: '100vh',
          overflowY: 'auto',
        }}>

          {/* Brand wordmark */}
          <div style={{
            padding: '22px 20px 20px',
            borderBottom: `1px solid ${T.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
              <div style={{
                width: 30,
                height: 30,
                background: T.blue,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Shield size={15} color="#fff" strokeWidth={2.2} />
              </div>
              <div>
                <div style={{
                  fontWeight: 700,
                  fontSize: '13px',
                  color: T.text,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}>
                  I AM CYBER
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px',
                  color: T.muted,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginTop: 1,
                }}>
                  Univers · FYNE
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ padding: '14px 10px', flex: 1 }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              fontWeight: 500,
              color: T.muted,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '0 10px',
              marginBottom: 6,
            }}>
              Navigation
            </div>

            {NAV_ITEMS.map(item => {
              const isActive = activeNav === item.id;
              const isHov = hoveredNav === item.id;
              return (
                <button
                  key={item.id}
                  className="cyber-nav-btn"
                  onClick={() => { setActiveNav(item.id); setLocation(item.route); }}
                  onMouseEnter={() => setHoveredNav(item.id)}
                  onMouseLeave={() => setHoveredNav(null)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    padding: '8px 10px',
                    border: 'none',
                    background: isActive ? '#e8f0f6' : isHov ? T.hoverBg : 'transparent',
                    color: isActive ? T.blue : T.sub,
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    textAlign: 'left',
                    marginBottom: 1,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    position: 'relative',
                  }}
                >
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      background: T.blue,
                    }} />
                  )}
                  <item.Icon size={14} strokeWidth={isActive ? 2.2 : 1.8} />
                  {item.label}
                  {isActive && (
                    <ChevronRight size={11} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Divider */}
          <div style={{ height: 1, background: T.border, margin: '0 10px 14px' }} />

          {/* Level widget */}
          <div style={{
            margin: '0 10px 20px',
            padding: '14px 16px',
            background: T.bg,
            borderTop: `1px solid ${T.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                fontWeight: 500,
                color: T.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Mon niveau
              </span>
              <Trophy size={12} color={levelInfo.color} strokeWidth={2} />
            </div>
            <div style={{
              fontSize: '15px',
              fontWeight: 700,
              color: levelInfo.color,
              marginBottom: 3,
              letterSpacing: '-0.01em',
            }}>
              {levelInfo.label}
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              color: T.muted,
              marginBottom: 10,
            }}>
              {score} pts
              {nextLevel && (
                <span style={{ color: T.border, marginLeft: 6 }}>
                  · {nextLevel.min - score} → {nextLevel.label}
                </span>
              )}
            </div>
            <div style={{ height: 3, background: T.border, overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', background: levelInfo.color }}
                initial={{ width: 0 }}
                animate={{ width: `${segmentPct}%` }}
                transition={{ delay: 0.5, duration: 0.9, ease: 'easeOut' }}
              />
            </div>
          </div>
        </aside>

        {/* ══════════════════════════════════════════════
            MAIN CONTENT
        ══════════════════════════════════════════════ */}
        <main style={{
          flex: 1,
          padding: '36px 52px 72px',
          overflowY: 'auto',
          maxWidth: 1100,
        }}>

          {/* ── Breadcrumb ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              marginBottom: 28,
            }}
          >
            {['FYNE', 'Univers', 'I AM CYBER'].map((crumb, i, arr) => (
              <React.Fragment key={crumb}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  color: i === arr.length - 1 ? T.blue : T.muted,
                  fontWeight: i === arr.length - 1 ? 600 : 400,
                  letterSpacing: '0.03em',
                }}>
                  {crumb}
                </span>
                {i < arr.length - 1 && (
                  <ChevronRight size={11} color={T.border} strokeWidth={2} />
                )}
              </React.Fragment>
            ))}
          </motion.div>

          {/* ── Page header ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ marginBottom: 36 }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 20,
            }}>
              <div>
                <h1 style={{
                  fontSize: 'clamp(1.5rem, 2.8vw, 2rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.035em',
                  color: T.text,
                  margin: '0 0 6px',
                  lineHeight: 1.1,
                }}>
                  Univers{' '}
                  <span style={{
                    color: T.blue,
                    position: 'relative',
                  }}>
                    Cybersécurité
                  </span>
                </h1>
                <p style={{
                  fontSize: '14px',
                  color: T.sub,
                  margin: 0,
                  maxWidth: 480,
                  lineHeight: 1.6,
                  fontWeight: 400,
                }}>
                  Choisissez votre mode de formation et progressez à votre rythme avec des outils IA de pointe.
                </p>
              </div>

              {/* Stats strip */}
              <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                {[
                  { icon: <BookOpen size={13} color={T.blue} strokeWidth={2} />, label: 'Modules', value: '31' },
                  { icon: <Users size={13} color="#059669" strokeWidth={2} />, label: 'Rôles', value: '8' },
                  { icon: <Trophy size={13} color={T.pink} strokeWidth={2} />, label: 'Votre rang', value: levelInfo.label },
                ].map((stat, i) => (
                  <div key={i} style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    minWidth: 82,
                  }}>
                    {stat.icon}
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: T.text,
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                    }}>
                      {stat.value}
                    </div>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '10px',
                      color: T.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Progression tracker ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.35 }}
            style={{
              background: T.surface,
              borderTop: `1px solid ${T.border}`,
              borderBottom: `1px solid ${T.border}`,
              padding: '18px 24px',
              marginBottom: 36,
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <TrendingUp size={14} color={T.blue} strokeWidth={2} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: T.text }}>
                  Votre progression
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  background: `${levelInfo.color}14`,
                  color: levelInfo.color,
                  border: `1px solid ${levelInfo.color}28`,
                  letterSpacing: '0.02em',
                }}>
                  {levelInfo.label}
                </span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  color: T.muted,
                }}>
                  {score} pts
                </span>
              </div>
            </div>

            {/* Segmented level bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 5,
              marginBottom: 10,
            }}>
              {LEVELS.map((lvl, i) => {
                const isPast   = i < levelIndex;
                const isActive = i === levelIndex;
                return (
                  <div key={lvl.label}>
                    <div style={{
                      height: 6,
                      background: isPast ? `${lvl.color}30` : T.surface,
                      borderRadius: 0,
                      overflow: 'hidden',
                      border: `1px solid ${isActive ? `${lvl.color}40` : T.border}`,
                      position: 'relative',
                    }}>
                      {isPast && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: lvl.color,
                          opacity: 0.55,
                          borderRadius: 0,
                        }} />
                      )}
                      {isActive && (
                        <motion.div
                          style={{ height: '100%', background: lvl.color, borderRadius: 3 }}
                          initial={{ width: 0 }}
                          animate={{ width: `${segmentPct}%` }}
                          transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                        />
                      )}
                    </div>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '10px',
                      marginTop: 5,
                      color: isActive ? lvl.color : T.muted,
                      fontWeight: isActive ? 600 : 400,
                      letterSpacing: '0.02em',
                    }}>
                      {lvl.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {nextLevel && (
              <div style={{
                fontSize: '12px',
                color: T.muted,
                marginTop: 2,
                fontWeight: 400,
              }}>
                <strong style={{ color: T.sub, fontWeight: 600 }}>{nextLevel.min - score} pts</strong>
                {' '}pour atteindre{' '}
                <strong style={{ color: nextLevel.color, fontWeight: 600 }}>{nextLevel.label}</strong>
              </div>
            )}
          </motion.div>

          {/* ── Section label ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.3 }}
            style={{ marginBottom: 16 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                fontWeight: 500,
                color: T.muted,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                Modes d'apprentissage
              </span>
              <div style={{ flex: 1, height: 1, background: T.border }} />
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                color: T.muted,
              }}>
                {MODULES.length} modules
              </span>
            </div>
          </motion.div>

          {/* ── Module cards grid ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1,
            background: T.border,
          }}>
            {MODULES.map((mod, i) => {
              const isHov = hoveredCard === mod.id;
              return (
                <motion.div
                  key={mod.id}
                  className="cyber-module-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 + i * 0.07, duration: 0.35 }}
                  onClick={() => setLocation(mod.route)}
                  onMouseEnter={() => setHoveredCard(mod.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: isHov ? T.surface : T.bg,
                    padding: '22px 22px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'background 0.12s ease',
                  }}
                >
                  {/* Icon + badge row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                  }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      background: T.surface,
                      border: `1px solid ${T.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <mod.Icon size={18} color={mod.accent} strokeWidth={2} />
                    </div>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: mod.accent,
                      background: `${mod.accent}10`,
                      padding: '2px 7px',
                      border: `1px solid ${mod.accent}20`,
                    }}>
                      {mod.label}
                    </div>
                  </div>

                  {/* Headline */}
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: T.text,
                    margin: '0 0 7px',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.3,
                  }}>
                    {mod.headline}
                  </h3>

                  {/* Description */}
                  <p style={{
                    fontSize: '13px',
                    color: T.sub,
                    lineHeight: 1.6,
                    margin: '0 0 14px',
                    flex: 1,
                    fontWeight: 400,
                  }}>
                    {mod.description}
                  </p>

                  {/* Tags */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 4,
                    marginBottom: 16,
                  }}>
                    {mod.tags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 7px',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '10px',
                          fontWeight: 500,
                          letterSpacing: '0.02em',
                          background: `${mod.accent}08`,
                          color: mod.accent,
                          border: `1px solid ${mod.accent}18`,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 14,
                    borderTop: `1px solid ${T.border}`,
                  }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: isHov ? mod.accent : T.sub,
                      transition: 'color 0.15s ease',
                      letterSpacing: '-0.01em',
                    }}>
                      {mod.cta}
                    </span>
                    <div style={{
                      width: 26,
                      height: 26,
                      background: isHov ? T.blue : T.surface,
                      border: `1px solid ${T.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'background 0.12s ease',
                    }}>
                      <ArrowRight
                        size={13}
                        color={isHov ? '#fff' : T.muted}
                        strokeWidth={2.2}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Footer status bar ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            style={{
              marginTop: 1,
              padding: '14px 20px',
              background: T.surface,
              borderTop: `1px solid ${T.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Lock size={13} color={T.muted} strokeWidth={2} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '13px', color: T.muted, margin: 0, fontWeight: 400 }}>
              Tous vos progrès sont sauvegardés en temps réel.{' '}
              <span
                style={{ color: T.blue, fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setLocation('/mon-suivi')}
              >
                Consulter mon suivi →
              </span>
            </p>
          </motion.div>

        </main>
      </div>
    </HomeLayout>
  );
}
