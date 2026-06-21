import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Target,
  Gamepad2,
  FlaskConical,
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
  Activity,
} from 'lucide-react';

import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import HomeLayout from '@/components/layout/HomeLayout';

// ── Palette mc2i ──────────────────────────────────────────────────────────────
const BLUE   = '#006a9e';
const PINK   = '#dd0061';
const GRAY50 = '#f8fafc';
const GRAY100= '#f1f5f9';
const GRAY200= '#e2e8f0';
const GRAY400= '#94a3b8';
const GRAY500= '#64748b';
const GRAY700= '#334155';
const GRAY900= '#0f172a';

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
    accent: BLUE,
    lightBg: '#eff8ff',
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
    lightBg: '#f5f3ff',
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
    lightBg: '#ecfdf5',
    tags: ['Bug Hunter', 'Firewall', 'Brain Hacker', 'Escape'],
    stat: { label: 'jeux', value: '6' },
  },
  {
    id: 'simuler',
    label: 'Simuler',
    headline: 'Simulations Avancées',
    description: 'Gestion de crise COMEX, pentest lab et simulations d\'incidents pour les profils experts.',
    cta: 'Accéder aux simulations',
    route: '/cyber/simulations',
    Icon: FlaskConical,
    accent: PINK,
    lightBg: '#fff1f6',
    tags: ['RSSI', 'COMEX', 'Pentest Lab', 'Crise'],
    stat: { label: 'simulations', value: '5' },
  },
];

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'decouvrir',  label: "L'académie",    Icon: BookOpen,    route: '/cyber/sas-academie' },
  { id: 'entrainer',  label: 'Roleplay',       Icon: Users,       route: '/cyber/roleplay' },
  { id: 'challenger', label: 'Arcade',         Icon: Zap,         route: '/cyber/arcade' },
  { id: 'simuler',    label: 'Simulations',    Icon: Activity,    route: '/cyber/simulations' },
  { id: 'profil',     label: 'Mon profil',     Icon: Star,        route: '/cyber/profil-pro' },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function CyberV3() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeNav, setActiveNav]   = useState<string | null>(null);

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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          .cyber-card-hover { transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease; }
          .cyber-card-hover:hover { transform: translateY(-2px); }
          .nav-item-hover { transition: background 0.15s ease, color 0.15s ease; }
          .tag-chip { display:inline-flex; align-items:center; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:500; letter-spacing:0.02em; }
        `}</style>
      </Helmet>

      {/* ── Root shell ── */}
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: GRAY900,
        display: 'flex',
      }}>

        {/* ══════════════════════════════════════════════
            LEFT SIDEBAR
        ══════════════════════════════════════════════ */}
        <aside style={{
          width: 220,
          minHeight: '100vh',
          backgroundColor: GRAY50,
          borderRight: `1px solid ${GRAY200}`,
          display: 'flex',
          flexDirection: 'column',
          padding: '28px 0',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          height: '100vh',
          overflowY: 'auto',
        }}>
          {/* Brand */}
          <div style={{ padding: '0 20px 24px', borderBottom: `1px solid ${GRAY200}` }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 6,
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${BLUE}, ${PINK})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Shield size={16} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: GRAY900 }}>I AM CYBER</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: GRAY400, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Univers Cybersécurité
            </span>
          </div>

          {/* Navigation */}
          <nav style={{ padding: '16px 8px', flex: 1 }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, color: GRAY400, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 12px', marginBottom: 8 }}>
              Navigation
            </div>
            {NAV_ITEMS.map(item => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  className="nav-item-hover"
                  onClick={() => { setActiveNav(item.id); setLocation(item.route); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: isActive ? `${BLUE}15` : 'transparent',
                    color: isActive ? BLUE : GRAY500,
                    cursor: 'pointer',
                    fontSize: '0.83rem',
                    fontWeight: isActive ? 600 : 400,
                    textAlign: 'left',
                    marginBottom: 2,
                  }}
                >
                  <item.Icon size={15} />
                  {item.label}
                  {isActive && <ChevronRight size={12} style={{ marginLeft: 'auto' }} />}
                </button>
              );
            })}
          </nav>

          {/* Score widget */}
          <div style={{
            margin: '0 12px',
            padding: '14px 14px',
            background: '#fff',
            border: `1px solid ${GRAY200}`,
            borderRadius: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: GRAY700 }}>Mon niveau</span>
              <Trophy size={13} color={levelInfo.color} />
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: levelInfo.color, marginBottom: 2 }}>
              {levelInfo.label}
            </div>
            <div style={{ fontSize: '0.7rem', color: GRAY400, marginBottom: 8 }}>
              {score} pts
              {nextLevel && ` · ${nextLevel.min - score} pts → ${nextLevel.label}`}
            </div>
            <div style={{ height: 4, background: GRAY100, borderRadius: 999, overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', background: levelInfo.color, borderRadius: 999 }}
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
        <main style={{ flex: 1, padding: '40px 48px 64px', overflowY: 'auto' }}>

          {/* ── Breadcrumb ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32 }}
          >
            <span style={{ fontSize: '0.75rem', color: GRAY400 }}>FYNE</span>
            <ChevronRight size={12} color={GRAY400} />
            <span style={{ fontSize: '0.75rem', color: GRAY400 }}>Univers</span>
            <ChevronRight size={12} color={GRAY400} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: BLUE }}>I AM CYBER</span>
          </motion.div>

          {/* ── Hero header ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginBottom: 40 }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 style={{
                  fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: GRAY900,
                  margin: '0 0 8px',
                  lineHeight: 1.15,
                }}>
                  Univers <span style={{ color: BLUE }}>Cybersécurité</span>
                </h1>
                <p style={{ fontSize: '0.92rem', color: GRAY500, margin: 0, maxWidth: 520 }}>
                  Choisissez votre mode de formation et progressez à votre rythme avec des outils IA de pointe.
                </p>
              </div>

              {/* Stats strip */}
              <div style={{ display: 'flex', gap: 16 }}>
                {[
                  { icon: <BookOpen size={14} color={BLUE} />, label: 'Modules', value: '31' },
                  { icon: <Users size={14} color='#059669' />, label: 'Rôles', value: '8' },
                  { icon: <Trophy size={14} color={PINK} />, label: 'Votre rang', value: levelInfo.label },
                ].map((stat, i) => (
                  <div key={i} style={{
                    background: GRAY50,
                    border: `1px solid ${GRAY200}`,
                    borderRadius: 8,
                    padding: '10px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: 80,
                  }}>
                    <div style={{ marginBottom: 4 }}>{stat.icon}</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: GRAY900, lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontSize: '0.65rem', color: GRAY400, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Progression tracker ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            style={{
              background: '#fff',
              border: `1px solid ${GRAY200}`,
              borderRadius: 12,
              padding: '20px 24px',
              marginBottom: 40,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={15} color={BLUE} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: GRAY700 }}>Progression globale</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 999,
                  background: `${levelInfo.color}18`,
                  color: levelInfo.color,
                  border: `1px solid ${levelInfo.color}30`,
                }}>
                  {levelInfo.label}
                </span>
                <span style={{ fontSize: '0.72rem', color: GRAY400 }}>{score} pts</span>
              </div>
            </div>

            {/* Segmented bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, marginBottom: 10 }}>
              {LEVELS.map((lvl, i) => {
                const isPast = i < levelIndex;
                const isActive = i === levelIndex;
                return (
                  <div key={lvl.label} style={{ position: 'relative' }}>
                    <div style={{
                      height: 6,
                      background: isPast ? `${lvl.color}40` : GRAY100,
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: isActive ? `1px solid ${lvl.color}50` : `1px solid ${GRAY200}`,
                    }}>
                      {isActive && (
                        <motion.div
                          style={{ height: '100%', background: lvl.color, borderRadius: 3 }}
                          initial={{ width: 0 }}
                          animate={{ width: `${segmentPct}%` }}
                          transition={{ delay: 0.5, duration: 0.9, ease: 'easeOut' }}
                        />
                      )}
                      {isPast && (
                        <div style={{ position: 'absolute', inset: 0, background: lvl.color, opacity: 0.6 }} />
                      )}
                    </div>
                    <div style={{
                      fontSize: '0.6rem',
                      marginTop: 4,
                      color: isActive ? GRAY700 : GRAY400,
                      fontWeight: isActive ? 600 : 400,
                    }}>
                      {isActive && <span style={{ color: lvl.color }}>● </span>}
                      {lvl.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {nextLevel && (
              <div style={{ fontSize: '0.72rem', color: GRAY400, marginTop: 4 }}>
                Il vous reste <strong style={{ color: GRAY700 }}>{nextLevel.min - score} pts</strong> pour atteindre le niveau <strong style={{ color: nextLevel.color }}>{nextLevel.label}</strong>.
              </div>
            )}
          </motion.div>

          {/* ── Section title ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            style={{ marginBottom: 20 }}
          >
            <h2 style={{ fontSize: '0.78rem', fontWeight: 600, color: GRAY400, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
              Modes d'apprentissage
            </h2>
          </motion.div>

          {/* ── Module cards grid ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {MODULES.map((mod, i) => {
              const isHovered = hoveredCard === mod.id;
              return (
                <motion.div
                  key={mod.id}
                  className="cyber-card-hover"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.07, duration: 0.4 }}
                  onClick={() => setLocation(mod.route)}
                  onMouseEnter={() => setHoveredCard(mod.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: '#fff',
                    border: `1.5px solid ${isHovered ? mod.accent : GRAY200}`,
                    borderRadius: 14,
                    padding: 24,
                    cursor: 'pointer',
                    boxShadow: isHovered
                      ? `0 8px 24px ${mod.accent}18, 0 2px 8px rgba(0,0,0,0.06)`
                      : '0 1px 3px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Top accent line */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: isHovered ? mod.accent : 'transparent',
                    borderRadius: '14px 14px 0 0',
                    transition: 'background 0.2s ease',
                  }} />

                  {/* Icon + label row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: mod.lightBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <mod.Icon size={20} color={mod.accent} />
                    </div>
                    <div style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: mod.accent,
                      background: `${mod.accent}12`,
                      padding: '3px 8px',
                      borderRadius: 4,
                    }}>
                      {mod.label}
                    </div>
                  </div>

                  {/* Headline */}
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: GRAY900,
                    margin: '0 0 8px',
                    letterSpacing: '-0.01em',
                  }}>
                    {mod.headline}
                  </h3>

                  {/* Description */}
                  <p style={{
                    fontSize: '0.82rem',
                    color: GRAY500,
                    lineHeight: 1.55,
                    margin: '0 0 16px',
                    flex: 1,
                  }}>
                    {mod.description}
                  </p>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 18 }}>
                    {mod.tags.map(tag => (
                      <span key={tag} className="tag-chip" style={{
                        background: `${mod.accent}0f`,
                        color: mod.accent,
                        border: `1px solid ${mod.accent}20`,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 14,
                    borderTop: `1px solid ${GRAY100}`,
                  }}>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: isHovered ? mod.accent : GRAY700,
                      transition: 'color 0.15s ease',
                    }}>
                      {mod.cta}
                    </span>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: isHovered ? mod.accent : GRAY100,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.15s ease',
                      flexShrink: 0,
                    }}>
                      <ArrowRight size={14} color={isHovered ? '#fff' : GRAY400} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Footer hint ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            style={{
              marginTop: 48,
              padding: '18px 24px',
              background: `${BLUE}07`,
              border: `1px solid ${BLUE}20`,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Lock size={15} color={BLUE} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.8rem', color: GRAY500, margin: 0 }}>
              Tous vos progrès sont sauvegardés en temps réel.&nbsp;
              <span style={{ color: BLUE, fontWeight: 500, cursor: 'pointer' }}
                onClick={() => setLocation('/mon-suivi')}>
                Consulter mon suivi →
              </span>
            </p>
          </motion.div>

        </main>
      </div>
    </HomeLayout>
  );
}
