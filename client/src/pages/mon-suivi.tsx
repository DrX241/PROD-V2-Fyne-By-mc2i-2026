import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { ArrowLeft, TrendingUp, Award, Target, Zap, BarChart2, Lock, Star, Shield, Sword, Crown, BookOpen, Play } from 'lucide-react';

const C = {
  bg: '#ffffff',
  surface: '#f8fafc',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',
  accent: '#0057ff',
  accentLight: '#eff6ff',
  accentMid: '#dbeafe',
  text: '#0f172a',
  sub: '#64748b',
  muted: '#94a3b8',
  green: '#10b981',
  greenLight: '#ecfdf5',
  amber: '#f59e0b',
  amberLight: '#fffbeb',
  purple: '#7c3aed',
  purpleLight: '#f5f3ff',
  red: '#ef4444',
};

const FONT_DISPLAY = '"Syne", system-ui, sans-serif';
const FONT_BODY = '"DM Sans", system-ui, sans-serif';
const FONT_MONO = '"DM Mono", monospace';

const levels = ['Novice', 'Padawan', 'Chevalier', 'Maître', 'Grand Maître'];

const levelIcons = [
  <Star size={16} />,
  <Shield size={16} />,
  <Sword size={16} />,
  <Award size={16} />,
  <Crown size={16} />,
];

const levelColors = [C.sub, C.green, C.amber, C.purple, C.accent];

interface KpiData {
  score: number;
  exercicesRealises: number;
  tauxReussite: number;
  niveau: string;
  badges: number;
  username: string;
  firstName: string;
  lastName: string;
  companyId: number | null;
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionVal, value, { duration: 1.4, ease: 'easeOut' });
    const unsubscribe = motionVal.on('change', (v) => {
      if (ref.current) ref.current.textContent = Math.round(v) + suffix;
    });
    return () => { controls.stop(); unsubscribe(); };
  }, [isInView, value, suffix, motionVal]);

  return <span ref={ref}>0{suffix}</span>;
}

interface TeamMember {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  score: number;
  niveau: string;
  badges: number;
  exercices_realises: number;
}

interface AssignedModule {
  id: number;
  name: string;
  domain: string;
  description: string;
  icon_path: string | null;
  difficulty: string;
}

export default function MonSuivi() {
  const [, setLocation] = useLocation();
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignedModules, setAssignedModules] = useState<AssignedModule[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/check', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/companies/team', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/modules/assigned', { credentials: 'include' }).then(r => r.json()).catch(() => ({ success: false, modules: [] })),
    ]).then(([d, teamData, modulesData]) => {
      if (!d.authenticated) { setLocation('/'); return; }
      setCurrentUserId(d.user.id);
      setKpi({
        score: d.user.score ?? 0,
        exercicesRealises: d.user.exercicesRealises ?? 0,
        tauxReussite: d.user.tauxReussite ?? 0,
        niveau: d.user.niveau ?? 'Novice',
        badges: d.user.badges ?? 0,
        username: d.user.username ?? '',
        firstName: d.user.firstName ?? '',
        lastName: d.user.lastName ?? '',
        companyId: d.user.companyId ?? null,
      });
      if (teamData.success) setTeam(teamData.team);
      if (modulesData.success && Array.isArray(modulesData.modules)) setAssignedModules(modulesData.modules);
      setLoading(false);
    }).catch(() => setLocation('/'));
  }, []);

  if (loading || !kpi) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_BODY }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: `2px solid ${C.border}`,
            borderTopColor: C.accent,
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ color: C.muted, fontSize: 13 }}>Chargement…</span>
        </div>
      </div>
    );
  }

  const levelIndex = Math.max(0, levels.indexOf(kpi.niveau));
  const progressPercent = Math.min(100, (kpi.score / 1000) * 100);
  const displayName = kpi.firstName || kpi.username;

  const stats = [
    { label: 'Score total', value: kpi.score, icon: <Zap size={20} />, color: C.accent, bg: C.accentLight, suffix: ' pts' },
    { label: 'Exercices réalisés', value: kpi.exercicesRealises, icon: <Target size={20} />, color: C.green, bg: C.greenLight, suffix: '' },
    { label: 'Taux de réussite', value: kpi.tauxReussite, icon: <TrendingUp size={20} />, color: C.amber, bg: C.amberLight, suffix: '%' },
    { label: 'Badges obtenus', value: kpi.badges, icon: <Award size={20} />, color: C.purple, bg: C.purpleLight, suffix: '' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT_BODY, color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.08) !important; }
        .badge-unlocked:hover { transform: scale(1.03); }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: C.bg, position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(8px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => setLocation('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: `1px solid ${C.border}`, color: C.sub, cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: '6px 12px', borderRadius: 8, transition: 'all 0.15s', fontFamily: FONT_BODY }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderStrong; e.currentTarget.style.color = C.text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.sub; }}
          >
            <ArrowLeft size={14} /> Retour
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: C.accentLight, border: `1px solid ${C.accentMid}`,
              borderRadius: 20, padding: '4px 12px 4px 8px',
            }}>
              <BarChart2 size={13} color={C.accent} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.accent, fontFamily: FONT_MONO }}>{kpi.niveau}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{ padding: '64px 0 48px', borderBottom: `1px solid ${C.border}`, marginBottom: 48 }}
        >
          <p style={{ margin: '0 0 8px', fontSize: 12, fontFamily: FONT_MONO, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Mon Suivi · FYNE by mc2i
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            style={{ margin: '0 0 16px', fontFamily: FONT_DISPLAY, fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 800, lineHeight: 0.95, letterSpacing: '-2px', color: C.text }}
          >
            {displayName}<span style={{ color: C.accent }}>.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ margin: 0, fontSize: 16, color: C.sub, maxWidth: 480, lineHeight: 1.6 }}
          >
            Voici ta progression sur la plateforme FYNE. Continue à avancer pour débloquer de nouveaux niveaux.
          </motion.p>
        </motion.div>

        {/* Progression niveau */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          style={{ marginBottom: 48 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontFamily: FONT_MONO, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Niveau actuel</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `${levelColors[levelIndex]}15`,
                  border: `1.5px solid ${levelColors[levelIndex]}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: levelColors[levelIndex],
                }}>
                  {levelIcons[levelIndex]}
                </div>
                <h2 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: '-0.5px' }}>{kpi.niveau}</h2>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 2px', fontSize: 11, fontFamily: FONT_MONO, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Score</p>
              <p style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 32, fontWeight: 800, color: C.accent, letterSpacing: '-1px' }}>
                {kpi.score}<span style={{ fontSize: 14, color: C.muted, fontFamily: FONT_MONO, fontWeight: 400 }}> pts</span>
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ position: 'relative', height: 6, borderRadius: 99, background: C.surface, overflow: 'hidden', marginBottom: 20, border: `1px solid ${C.border}` }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 99,
                background: `linear-gradient(90deg, ${C.accent}, #3b82f6)`,
                boxShadow: `0 0 12px ${C.accent}60`,
              }}
            />
          </div>

          {/* Level dots */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${levels.length}, 1fr)` }}>
            {levels.map((l, i) => (
              <div key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: i <= levelIndex ? levelColors[i] : C.border,
                  transition: 'all 0.3s',
                }} />
                <p style={{
                  margin: 0, fontSize: 10, fontFamily: FONT_MONO,
                  color: i === levelIndex ? C.text : C.muted,
                  fontWeight: i === levelIndex ? 600 : 400,
                  textAlign: 'center',
                }}>{l}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Section Formations assignées */}
        {assignedModules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            style={{ marginBottom: 48 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 11, fontFamily: FONT_MONO, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Formations assignées</p>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <p style={{ margin: 0, fontSize: 11, fontFamily: FONT_MONO, color: C.muted, whiteSpace: 'nowrap' }}>{assignedModules.length} module{assignedModules.length > 1 ? 's' : ''}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
              {assignedModules.map((mod, i) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  style={{
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: '20px 20px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,87,255,0.08)'; (e.currentTarget as HTMLDivElement).style.borderColor = C.accentMid; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; (e.currentTarget as HTMLDivElement).style.borderColor = C.border; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 8, background: C.accentLight, border: `1px solid ${C.accentMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent }}>
                      <BookOpen size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mod.name}</p>
                      {mod.domain && (
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', background: C.accentLight, color: C.accent, borderRadius: 4, fontFamily: FONT_MONO }}>
                          {mod.domain}
                        </span>
                      )}
                    </div>
                  </div>
                  {mod.description && (
                    <p style={{ margin: 0, fontSize: 12, color: C.sub, lineHeight: 1.5, overflow: 'hidden', maxHeight: '2.8em' }}>
                      {mod.description}
                    </p>
                  )}
                  <button
                    onClick={() => setLocation(`/playground/player/${mod.id}`)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: C.accent, color: 'white', fontWeight: 700, fontSize: 12, border: 'none', borderRadius: 8, cursor: 'pointer', alignSelf: 'flex-start', marginTop: 4 }}>
                    <Play size={12} /> Accéder
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Divider label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 11, fontFamily: FONT_MONO, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Statistiques</p>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 48 }}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.5 }}
              style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: '28px 28px 24px',
                cursor: 'default',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Top accent line */}
              <div style={{ position: 'absolute', top: 0, left: 28, right: 28, height: 2, borderRadius: '0 0 2px 2px', background: `${stat.color}30` }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <p style={{ margin: 0, fontSize: 11, fontFamily: FONT_MONO, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</p>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: stat.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: stat.color,
                }}>
                  {stat.icon}
                </div>
              </div>

              <p style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 48, fontWeight: 800, color: C.text, lineHeight: 1, letterSpacing: '-2px' }}>
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </p>
            </motion.div>
          ))}
        </div>

        {/* Divider label badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 11, fontFamily: FONT_MONO, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Badges</p>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <p style={{ margin: 0, fontSize: 11, fontFamily: FONT_MONO, color: C.muted, whiteSpace: 'nowrap' }}>{kpi.badges + 1} / {levels.length}</p>
        </div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}
        >
          {levels.map((l, i) => {
            const unlocked = i <= kpi.badges;
            const color = levelColors[i];
            return (
              <div
                key={l}
                className={unlocked ? 'badge-unlocked' : ''}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  padding: '20px 12px',
                  borderRadius: 16,
                  border: `1px solid ${unlocked ? `${color}30` : C.border}`,
                  background: unlocked ? `${color}08` : C.surface,
                  transition: 'all 0.2s ease',
                  cursor: unlocked ? 'default' : 'not-allowed',
                  opacity: unlocked ? 1 : 0.5,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {unlocked && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                    background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                    opacity: 0.6,
                  }} />
                )}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: unlocked ? `${color}15` : C.border + '30',
                  border: `2px solid ${unlocked ? `${color}40` : C.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: unlocked ? color : C.muted,
                }}>
                  {unlocked ? levelIcons[i] : <Lock size={14} />}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: unlocked ? C.text : C.muted, fontFamily: FONT_BODY }}>{l}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 10, fontFamily: FONT_MONO, color: unlocked ? color : C.muted }}>
                    {unlocked ? 'Obtenu' : '???'}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Section Équipe */}
        {team.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ marginTop: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 11, fontFamily: FONT_MONO, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Mon équipe</p>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <p style={{ margin: 0, fontSize: 11, fontFamily: FONT_MONO, color: C.muted, whiteSpace: 'nowrap' }}>{team.length} membres</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {team.map((member, i) => {
                const isMe = member.id === currentUserId;
                const levelIdx = Math.max(0, levels.indexOf(member.niveau));
                const color = levelColors[levelIdx];
                const name = member.first_name
                  ? `${member.first_name}${member.last_name ? ' ' + member.last_name : ''}`
                  : member.username;
                const initial = (member.first_name || member.username || '?').charAt(0).toUpperCase();
                return (
                  <div
                    key={member.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      background: isMe ? C.accentLight : C.surface,
                      border: `1px solid ${isMe ? C.accent + '40' : C.border}`,
                      borderRadius: 12, padding: '12px 18px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ width: 24, fontFamily: FONT_MONO, fontSize: 12, color: C.muted, textAlign: 'center', flexShrink: 0 }}>#{i + 1}</span>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: isMe ? C.accent : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isMe ? '#fff' : C.sub, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {initial}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text }}>
                        {name}
                        {isMe && <span style={{ fontSize: 10, color: C.accent, fontFamily: FONT_MONO, background: C.accentLight, border: `1px solid ${C.accent}30`, borderRadius: 4, padding: '1px 6px', marginLeft: 8 }}>Vous</span>}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: C.muted, fontFamily: FONT_MONO }}>{member.exercices_realises} exercices</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${color}10`, border: `1px solid ${color}25`, borderRadius: 6, padding: '2px 8px', color, flexShrink: 0 }}>
                      {levelIcons[levelIdx]}
                      <span style={{ fontSize: 11, fontWeight: 600, fontFamily: FONT_MONO }}>{member.niveau}</span>
                    </div>
                    <p style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 800, color: isMe ? C.accent : C.text, letterSpacing: '-0.5px', flexShrink: 0, minWidth: 60, textAlign: 'right' }}>
                      {member.score}<span style={{ fontSize: 11, color: C.muted, fontFamily: FONT_MONO, fontWeight: 400 }}> pts</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 64, paddingTop: 32, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: 12, fontFamily: FONT_MONO, color: C.muted }}>FYNE by mc2i · 2026</p>
          <p style={{ margin: 0, fontSize: 12, fontFamily: FONT_MONO, color: C.muted }}>Score mis à jour en temps réel</p>
        </div>

      </div>
    </div>
  );
}
