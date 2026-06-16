import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, useAnimation, animate } from 'framer-motion';
import {
  ArrowRight,
  Users,
  GraduationCap,
  Target,
  Gamepad2,
  FlaskConical,
  TrendingUp,
  Star,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { AiOutlineZoomIn, AiOutlineZoomOut } from 'react-icons/ai';
import { IoHome } from 'react-icons/io5';

import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { useTutorial } from '@/contexts/TutorialContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { DataButton } from '@/components/DataButton';
import HomeLayout from '@/components/layout/HomeLayout';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, target, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [target]);
  return <>{display}{suffix}</>;
}

// ── Level thresholds ──────────────────────────────────────────────────────────
const LEVELS = [
  { label: 'Novice',       min: 0,    max: 99,   color: '#94a3b8' },
  { label: 'Padawan',      min: 100,  max: 299,  color: '#38bdf8' },
  { label: 'Chevalier',    min: 300,  max: 599,  color: '#818cf8' },
  { label: 'Maître',       min: 600,  max: 999,  color: '#f59e0b' },
  { label: 'Grand Maître', min: 1000, max: 9999, color: '#ef4444' },
];

function getLevelInfo(score: number) {
  return LEVELS.find(l => score >= l.min && score <= l.max) ?? LEVELS[0];
}

// ── Door config ───────────────────────────────────────────────────────────────
const DOORS = [
  {
    id: 'decouvrir',
    label: 'DÉCOUVRIR',
    sub: 'Maîtrisez les fondamentaux',
    cta: "J'explore l'académie",
    route: '/cyber/sas-academie',
    icon: GraduationCap,
    accent: '#3b82f6',
    glow: 'rgba(59,130,246,0.35)',
    border: 'rgba(59,130,246,0.4)',
    badge: '2 modes',
    tags: ['Académie', 'Expert IA', 'Conversationnel'],
    bg: 'radial-gradient(ellipse at 30% 30%, rgba(59,130,246,0.18) 0%, transparent 65%), linear-gradient(135deg, #0a1628 0%, #0f172a 100%)',
  },
  {
    id: 'entrainer',
    label: "S'ENTRAÎNER",
    sub: 'Incarnez un rôle, affrontez des scénarios',
    cta: "J'incarne un rôle",
    route: '/cyber/roleplay',
    icon: Target,
    accent: '#8b5cf6',
    glow: 'rgba(139,92,246,0.35)',
    border: 'rgba(139,92,246,0.4)',
    badge: '6 profils',
    tags: ['RSSI', 'COMEX', 'Débutant', 'Pentest'],
    bg: 'radial-gradient(ellipse at 70% 30%, rgba(139,92,246,0.18) 0%, transparent 65%), linear-gradient(135deg, #0f0a28 0%, #0f172a 100%)',
  },
  {
    id: 'challenger',
    label: 'SE CHALLENGER',
    sub: 'Jeux, défis et scores en temps réel',
    cta: 'Je relève le défi',
    route: '/cyber/arcade',
    icon: Gamepad2,
    accent: '#f59e0b',
    glow: 'rgba(245,158,11,0.35)',
    border: 'rgba(245,158,11,0.4)',
    badge: '5 jeux',
    tags: ['Bug Hunter', 'Firewall', 'Brain Hacker', 'Escape'],
    bg: 'radial-gradient(ellipse at 30% 70%, rgba(245,158,11,0.15) 0%, transparent 65%), linear-gradient(135deg, #180f00 0%, #0f172a 100%)',
  },
  {
    id: 'simuler',
    label: 'SIMULER',
    sub: 'Gestion de crise, attaques réelles',
    cta: 'Je simule une crise',
    route: '/cyber/simulations',
    icon: FlaskConical,
    accent: '#ef4444',
    glow: 'rgba(239,68,68,0.35)',
    border: 'rgba(239,68,68,0.4)',
    badge: '3 simulations',
    tags: ['Crise cyber', 'Comex', 'Pentest Lab'],
    bg: 'radial-gradient(ellipse at 70% 70%, rgba(239,68,68,0.15) 0%, transparent 65%), linear-gradient(135deg, #180008 0%, #0f172a 100%)',
  },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function CyberV3() {
  const [, setLocation] = useLocation();
  const { } = useTutorial();
  const { themeMode, setThemeMode } = useTheme();
  const { user } = useAuth();

  const [highContrastMode, setHighContrastMode] = useState(false);
  const [textSize, setTextSize] = useState(1);
  const [simplifiedUI, setSimplifiedUI] = useState(false);
  const [accessibilityPanelOpen, setAccessibilityPanelOpen] = useState(false);
  const [hoveredDoor, setHoveredDoor] = useState<string | null>(null);

  const score = (user as any)?.kpi?.score ?? 0;
  const niveau = (user as any)?.kpi?.niveau ?? 'Novice';
  const levelInfo = getLevelInfo(score);
  const nextLevel = LEVELS[LEVELS.findIndex(l => l.label === levelInfo.label) + 1];
  const progressPct = nextLevel
    ? Math.min(100, ((score - levelInfo.min) / (nextLevel.min - levelInfo.min)) * 100)
    : 100;

  useEffect(() => {
    const s = localStorage.getItem('accessibilityTextSize');
    if (s) setTextSize(parseFloat(s));
    const hc = localStorage.getItem('accessibilityHighContrastMode');
    if (hc) setHighContrastMode(hc === 'true');
    const su = localStorage.getItem('accessibilitySimplifiedUI');
    if (su) setSimplifiedUI(su === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('accessibilityTextSize', textSize.toString());
    localStorage.setItem('accessibilityHighContrastMode', highContrastMode.toString());
    localStorage.setItem('accessibilitySimplifiedUI', simplifiedUI.toString());
  }, [textSize, highContrastMode, simplifiedUI]);

  return (
    <HomeLayout>
      <Helmet>
        <title>I AM CYBER | Univers Cybersécurité</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes glitch {
            0%,100% { clip-path: inset(0 0 100% 0); transform: translate(0); }
            20%      { clip-path: inset(30% 0 50% 0); transform: translate(-3px,1px); }
            40%      { clip-path: inset(60% 0 10% 0); transform: translate(3px,-1px); }
            60%      { clip-path: inset(10% 0 70% 0); transform: translate(-2px,2px); }
            80%      { clip-path: inset(80% 0 5%  0); transform: translate(2px,-2px); }
          }
          @keyframes pulse-live {
            0%,100% { opacity:1; } 50% { opacity:0.3; }
          }
          @keyframes scanline {
            0%   { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
          }
          .glitch-base { position:relative; font-family:'Orbitron',monospace; }
          .glitch-base::before,
          .glitch-base::after {
            content: attr(data-text);
            position: absolute; inset: 0;
            font-family: 'Orbitron', monospace;
          }
          .glitch-base::before {
            color: #00f5ff;
            animation: glitch 4s steps(1) infinite;
            animation-delay: 0.5s;
          }
          .glitch-base::after {
            color: #ff003c;
            animation: glitch 4s steps(1) infinite;
            animation-delay: 1s;
          }
          .door-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
          .door-card:hover { transform: translateY(-6px) scale(1.015); }
          .cyber-grid-bg {
            background-image:
              linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px);
            background-size: 40px 40px;
          }
          .scanline {
            position:fixed; top:0; left:0; width:100%; height:3px;
            background: linear-gradient(transparent, rgba(0,245,255,0.15), transparent);
            animation: scanline 6s linear infinite;
            pointer-events:none; z-index:1;
          }
        `}</style>
      </Helmet>

      {/* Scanline effect */}
      {!simplifiedUI && <div className="scanline" />}

      <div
        className="min-h-screen relative cyber-grid-bg"
        style={{
          backgroundColor: highContrastMode ? '#000' : '#020817',
          fontSize: `${textSize}rem`,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Ambient glows */}
        {!simplifiedUI && !highContrastMode && (
          <>
            <div className="pointer-events-none fixed top-0 left-1/4 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)', filter: 'blur(60px)' }} />
            <div className="pointer-events-none fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', filter: 'blur(60px)' }} />
          </>
        )}

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-8">

          {/* ── Top nav ── */}
          <div className="flex justify-between items-center mb-12">
            <div onClick={() => { setLocation('/'); setTimeout(() => document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>
              <DataButton
                variant="outline"
                size="lg"
                className="text-cyan-300 border-cyan-300/30 hover:bg-cyan-900/20 cursor-pointer"
                startIcon={<IoHome className="h-5 w-5" />}
              >
                Accueil
              </DataButton>
            </div>

            <div className="flex items-center gap-3">
              {/* KPI badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ borderColor: levelInfo.color + '50', background: levelInfo.color + '10' }}>
                <Star className="h-3.5 w-3.5" style={{ color: levelInfo.color }} />
                <span className="text-xs font-semibold" style={{ color: levelInfo.color, fontFamily: "'Orbitron',monospace" }}>{levelInfo.label}</span>
                <span className="text-xs text-slate-400">{score} pts</span>
              </div>

              {/* Accessibility */}
              <Popover open={accessibilityPanelOpen} onOpenChange={setAccessibilityPanelOpen}>
                <PopoverTrigger asChild>
                  <Button variant="secondary" size="sm" className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600" aria-label="Options d'accessibilité">
                    <Users className="h-4 w-4 mr-1" />
                    <span>Accessibilité</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-slate-900 border border-slate-700 text-white p-4" align="end">
                  <div className="space-y-4">
                    <h3 className="font-bold text-center text-cyan-300" style={{ fontFamily: "'Orbitron',monospace", fontSize:'0.85rem' }}>OPTIONS D'ACCESSIBILITÉ</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="text-size" className="text-slate-300">Taille du texte</Label>
                        <span className="text-cyan-400 text-sm">{Math.round(textSize * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-7 w-7 rounded-full bg-slate-800 border-slate-600" onClick={() => setTextSize(Math.max(0.8, textSize - 0.1))}>
                          <AiOutlineZoomOut className="h-3.5 w-3.5 text-cyan-300" />
                        </Button>
                        <Slider id="text-size" min={0.8} max={1.5} step={0.05} value={[textSize]} onValueChange={(v) => setTextSize(v[0])} className="flex-1" />
                        <Button variant="outline" size="icon" className="h-7 w-7 rounded-full bg-slate-800 border-slate-600" onClick={() => setTextSize(Math.min(1.5, textSize + 0.1))}>
                          <AiOutlineZoomIn className="h-3.5 w-3.5 text-cyan-300" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="high-contrast" className="text-slate-300">Mode haut contraste</Label>
                        <Switch id="high-contrast" checked={highContrastMode} onCheckedChange={setHighContrastMode} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="simplified-ui" className="text-slate-300">Interface simplifiée</Label>
                        <Switch id="simplified-ui" checked={simplifiedUI} onCheckedChange={setSimplifiedUI} />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* ── Hero ── */}
          <motion.div
            initial={simplifiedUI ? { opacity: 1 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 relative"
          >
            {/* LIVE badge */}
            {!simplifiedUI && (
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-red-500/40 bg-red-500/10">
                <span className="w-2 h-2 rounded-full bg-red-400" style={{ animation: 'pulse-live 1.4s ease-in-out infinite' }} />
                <span className="text-red-400 text-xs tracking-widest font-semibold" style={{ fontFamily: "'Orbitron',monospace" }}>LIVE</span>
              </div>
            )}

            <h1
              className="glitch-base text-white mb-4 leading-none"
              data-text="I AM CYBER"
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: `clamp(2.8rem, 7vw, 5.5rem)`,
                fontWeight: 900,
                letterSpacing: '0.04em',
                color: highContrastMode ? '#fff' : '#f0fdff',
              }}
            >
              I AM CYBER
            </h1>

            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              L'univers de formation cybersécurité le plus <span className="text-cyan-400 font-semibold">immersif</span>
            </p>

            {/* KPI progress bar */}
            {!simplifiedUI && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                className="max-w-sm mx-auto mb-10"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-500 tracking-wider" style={{ fontFamily: "'Orbitron',monospace" }}>
                    {levelInfo.label.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500">
                    {nextLevel ? `→ ${nextLevel.label} (${nextLevel.min} pts)` : 'Niveau max'}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${levelInfo.color}, ${nextLevel?.color ?? levelInfo.color})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* ── 4 Doors grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto mb-16">
            {DOORS.map((door, i) => {
              const Icon = door.icon;
              const isHovered = hoveredDoor === door.id;
              return (
                <motion.div
                  key={door.id}
                  initial={simplifiedUI ? { opacity: 1 } : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="door-card rounded-2xl overflow-hidden cursor-pointer"
                  style={{
                    background: highContrastMode ? '#000' : door.bg,
                    border: `1px solid ${isHovered ? door.accent : door.border}`,
                    boxShadow: isHovered ? `0 0 32px ${door.glow}, 0 8px 32px rgba(0,0,0,0.6)` : '0 4px 24px rgba(0,0,0,0.4)',
                    minHeight: 280,
                  }}
                  onMouseEnter={() => setHoveredDoor(door.id)}
                  onMouseLeave={() => setHoveredDoor(null)}
                  onClick={() => setLocation(door.route)}
                >
                  <div className="p-7 flex flex-col h-full gap-4">
                    {/* Top row: icon + badge */}
                    <div className="flex items-start justify-between">
                      <div
                        className="p-3.5 rounded-xl"
                        style={{ background: door.accent + '20', border: `1px solid ${door.accent}40` }}
                      >
                        <Icon
                          className="w-8 h-8"
                          style={{ color: door.accent }}
                        />
                      </div>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: door.accent + '20',
                          color: door.accent,
                          border: `1px solid ${door.accent}40`,
                          fontFamily: "'Orbitron',monospace",
                          letterSpacing: '0.05em',
                        }}
                      >
                        {door.badge}
                      </span>
                    </div>

                    {/* Title + description */}
                    <div className="flex-1">
                      <h2
                        className="font-black mb-1.5 tracking-wider"
                        style={{
                          fontFamily: "'Orbitron', monospace",
                          fontSize: `calc(1.15rem * ${textSize})`,
                          color: highContrastMode ? '#fff' : door.accent,
                        }}
                      >
                        {door.label}
                      </h2>
                      <p className="text-slate-400 text-sm leading-relaxed mb-3">
                        {door.sub}
                      </p>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {door.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              color: '#94a3b8',
                              border: '1px solid rgba(255,255,255,0.08)',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      className="w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                      style={{
                        background: isHovered ? door.accent : door.accent + '20',
                        color: isHovered ? '#000' : door.accent,
                        border: `1px solid ${door.accent}60`,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {door.cta}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Stats bar ── */}
          {!simplifiedUI && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex justify-center gap-12 pb-12"
            >
              {[
                { value: 21, suffix: '', label: 'modules', icon: GraduationCap, color: '#3b82f6' },
                { value: 5,  suffix: '',  label: 'jeux',    icon: Gamepad2,     color: '#f59e0b' },
                { value: 50, suffix: '+', label: 'scénarios', icon: Target,    color: '#8b5cf6' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                  className="text-center"
                >
                  <div
                    className="text-3xl font-black mb-0.5"
                    style={{ fontFamily: "'Orbitron',monospace", color: stat.color }}
                  >
                    <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-slate-500 tracking-widest uppercase">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
}
