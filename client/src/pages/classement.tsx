import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Star, Shield, Sword, Award, Trophy, TrendingUp, Target, Zap, Building2 } from 'lucide-react';

const C = {
  bg: '#ffffff',
  surface: '#f8fafc',
  border: '#e2e8f0',
  accent: '#0057ff',
  accentLight: '#eff6ff',
  text: '#0f172a',
  sub: '#64748b',
  muted: '#94a3b8',
  green: '#10b981',
  greenLight: '#ecfdf5',
  amber: '#f59e0b',
  amberLight: '#fffbeb',
  purple: '#7c3aed',
  purpleLight: '#f5f3ff',
  gold: '#f59e0b',
  silver: '#94a3b8',
  bronze: '#b45309',
};

const FONT_DISPLAY = '"Syne", system-ui, sans-serif';
const FONT_BODY = '"DM Sans", system-ui, sans-serif';
const FONT_MONO = '"DM Mono", monospace';

const levels = ['Novice', 'Padawan', 'Chevalier', 'Maître', 'Grand Maître'];
const levelIcons = [<Star size={12} />, <Shield size={12} />, <Sword size={12} />, <Award size={12} />, <Crown size={12} />];
const levelColors = [C.muted, C.green, C.amber, C.purple, C.accent];

interface LeaderboardUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  score: number;
  niveau: string;
  badges: number;
  exercices_realises: number;
  taux_reussite: number;
  company_name?: string;
}

function getRankStyle(rank: number) {
  if (rank === 1) return { color: C.gold, bg: '#fffbeb', border: '#fde68a', icon: <Trophy size={16} /> };
  if (rank === 2) return { color: C.silver, bg: '#f8fafc', border: '#e2e8f0', icon: <Award size={16} /> };
  if (rank === 3) return { color: C.bronze, bg: '#fef3c7', border: '#fde68a', icon: <Award size={16} /> };
  return { color: C.muted, bg: C.surface, border: C.border, icon: null };
}

export default function Classement() {
  const [, setLocation] = useLocation();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/check', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/companies/leaderboard', { credentials: 'include' }).then(r => r.json()),
    ]).then(([authData, lbData]) => {
      if (!authData.authenticated) { setLocation('/'); return; }
      if (!['admin', 'superadmin'].includes(authData.user.role)) { setLocation('/'); return; }
      setCurrentUser(authData.user);
      setIsSuperAdmin(authData.user.role === 'superadmin');
      if (lbData.success) setLeaderboard(lbData.leaderboard);
      setLoading(false);
    }).catch(() => setLocation('/'));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_BODY }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${C.border}`, borderTopColor: C.accent, animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ color: C.muted, fontSize: 13 }}>Chargement…</span>
        </div>
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT_BODY, color: C.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: C.bg, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => setLocation('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: `1px solid ${C.border}`, color: C.sub, cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: '6px 12px', borderRadius: 8, transition: 'all 0.15s', fontFamily: FONT_BODY }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.sub; }}
          >
            <ArrowLeft size={14} /> Retour
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.accentLight, border: `1px solid ${C.accent}30`, borderRadius: 20, padding: '4px 12px 4px 8px' }}>
            <Trophy size={13} color={C.accent} />
            <span style={{ fontSize: 12, fontWeight: 600, color: C.accent, fontFamily: FONT_MONO }}>
              {isSuperAdmin ? 'Classement global' : 'Classement équipe'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Hero */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '56px 0 40px', borderBottom: `1px solid ${C.border}`, marginBottom: 48 }}>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontFamily: FONT_MONO, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            {isSuperAdmin ? 'Vue globale · Toutes les entreprises' : `Équipe · ${leaderboard.length} participants`}
          </p>
          <h1 style={{ margin: '0 0 12px', fontFamily: FONT_DISPLAY, fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 800, lineHeight: 0.95, letterSpacing: '-2px', color: C.text }}>
            Classement<span style={{ color: C.accent }}>.</span>
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: C.sub }}>
            {leaderboard.length} participant{leaderboard.length > 1 ? 's' : ''} classé{leaderboard.length > 1 ? 's' : ''} par score total
          </p>
        </motion.div>

        {leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.muted }}>
            <Trophy size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ fontFamily: FONT_MONO, fontSize: 13 }}>Aucune donnée disponible</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {top3.length > 0 && (
              <div style={{ marginBottom: 48 }}>
                <p style={{ margin: '0 0 20px', fontSize: 11, fontFamily: FONT_MONO, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Podium</p>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, top3.length)}, 1fr)`, gap: 16 }}>
                  {top3.map((u, i) => {
                    const rank = i + 1;
                    const rs = getRankStyle(rank);
                    const levelIdx = Math.max(0, levels.indexOf(u.niveau));
                    const displayName = u.first_name ? `${u.first_name}${u.last_name ? ' ' + u.last_name : ''}` : u.username;
                    return (
                      <motion.div
                        key={u.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        style={{
                          background: rs.bg,
                          border: `1px solid ${rs.border}`,
                          borderRadius: 20,
                          padding: '28px 24px',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {rank === 1 && (
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${C.gold}, #fcd34d)` }} />
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: rs.color + '20', border: `2px solid ${rs.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: rs.color, fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 800 }}>
                            {rank}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.text }}>{displayName}</p>
                            {isSuperAdmin && u.company_name && (
                              <p style={{ margin: '2px 0 0', fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Building2 size={10} />{u.company_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 40, fontWeight: 800, color: C.text, letterSpacing: '-1px', lineHeight: 1 }}>
                          {u.score}<span style={{ fontSize: 14, color: C.muted, fontFamily: FONT_MONO, fontWeight: 400 }}> pts</span>
                        </div>
                        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${levelColors[levelIdx]}15`, border: `1px solid ${levelColors[levelIdx]}30`, borderRadius: 6, padding: '3px 8px', color: levelColors[levelIdx] }}>
                            {levelIcons[levelIdx]}
                            <span style={{ fontSize: 11, fontWeight: 600, fontFamily: FONT_MONO }}>{u.niveau}</span>
                          </div>
                          <span style={{ fontSize: 11, color: C.muted, fontFamily: FONT_MONO }}>{u.exercices_realises} ex.</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Suite du classement */}
            {rest.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <p style={{ margin: 0, fontSize: 11, fontFamily: FONT_MONO, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Classement complet</p>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {rest.map((u, i) => {
                    const rank = i + 4;
                    const levelIdx = Math.max(0, levels.indexOf(u.niveau));
                    const displayName = u.first_name ? `${u.first_name}${u.last_name ? ' ' + u.last_name : ''}` : u.username;
                    const isMe = u.id === currentUser?.id;
                    return (
                      <motion.div
                        key={u.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.04 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 16,
                          background: isMe ? C.accentLight : C.surface,
                          border: `1px solid ${isMe ? C.accent + '40' : C.border}`,
                          borderRadius: 12,
                          padding: '14px 20px',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ width: 28, fontFamily: FONT_MONO, fontSize: 13, color: C.muted, textAlign: 'center', flexShrink: 0 }}>{rank}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text }}>
                            {displayName} {isMe && <span style={{ fontSize: 10, color: C.accent, fontFamily: FONT_MONO, background: C.accentLight, border: `1px solid ${C.accent}30`, borderRadius: 4, padding: '1px 6px', marginLeft: 6 }}>Vous</span>}
                          </p>
                          {isSuperAdmin && u.company_name && (
                            <p style={{ margin: '2px 0 0', fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Building2 size={9} />{u.company_name}
                            </p>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: levelColors[levelIdx], background: `${levelColors[levelIdx]}10`, border: `1px solid ${levelColors[levelIdx]}25`, borderRadius: 6, padding: '2px 8px' }}>
                          {levelIcons[levelIdx]}
                          <span style={{ fontSize: 11, fontWeight: 600, fontFamily: FONT_MONO }}>{u.niveau}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontFamily: FONT_MONO, fontSize: 11, color: C.muted }}>Exercices</p>
                            <p style={{ margin: 0, fontFamily: FONT_MONO, fontSize: 13, fontWeight: 600, color: C.text }}>{u.exercices_realises}</p>
                          </div>
                          <div style={{ textAlign: 'right', minWidth: 70 }}>
                            <p style={{ margin: 0, fontFamily: FONT_MONO, fontSize: 11, color: C.muted }}>Score</p>
                            <p style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 800, color: C.accent, letterSpacing: '-0.5px' }}>{u.score}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
