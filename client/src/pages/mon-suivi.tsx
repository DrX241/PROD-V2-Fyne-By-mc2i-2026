import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Award, Target, Zap, BarChart2 } from 'lucide-react';

const BLUE = '#0057ff';
const BG = '#0a0d14';
const SURFACE = '#111827';
const CARD = '#161d2e';
const BORDER = '#1e2d45';
const TEXT = '#f1f5f9';
const SUB = '#94a3b8';
const GREEN = '#10b981';
const AMBER = '#f59e0b';

const levels = ['Novice', 'Padawan', 'Chevalier', 'Maître', 'Grand Maître'];

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

export default function MonSuivi() {
  const [, setLocation] = useLocation();
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/check', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (!d.authenticated) { setLocation('/'); return; }
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
        setLoading(false);
      })
      .catch(() => setLocation('/'));
  }, []);

  if (loading || !kpi) {
    return (
      <div style={{ minHeight: '100vh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: SUB, fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>Chargement…</div>
      </div>
    );
  }

  const levelIndex = Math.max(0, levels.indexOf(kpi.niveau));
  const progressPercent = Math.min(100, (kpi.score / 1000) * 100);
  const displayName = kpi.firstName || kpi.username;

  const stats = [
    { label: 'Score total', value: kpi.score, icon: <Zap size={18} />, color: BLUE, suffix: 'pts' },
    { label: 'Exercices réalisés', value: kpi.exercicesRealises, icon: <Target size={18} />, color: GREEN, suffix: '' },
    { label: 'Taux de réussite', value: kpi.tauxReussite, icon: <TrendingUp size={18} />, color: AMBER, suffix: '%' },
    { label: 'Badges obtenus', value: kpi.badges, icon: <Award size={18} />, color: '#8b5cf6', suffix: '' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, background: SURFACE }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => setLocation('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: SUB, cursor: 'pointer', fontSize: 13, padding: '6px 10px', borderRadius: 8, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = CARD; e.currentTarget.style.color = TEXT; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = SUB; }}
          >
            <ArrowLeft size={15} /> Retour
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: TEXT }}>Mon Suivi</h1>
            <p style={{ margin: 0, fontSize: 12, color: SUB }}>Progression de {displayName}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '8px 14px' }}>
            <BarChart2 size={15} color={BLUE} />
            <span style={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>{kpi.niveau}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>

        {/* Barre de progression niveau */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '28px 32px', marginBottom: 24 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: SUB, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Niveau actuel</p>
              <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: TEXT }}>{kpi.niveau}</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 2px', fontSize: 12, color: SUB }}>Score</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: BLUE, fontFamily: 'DM Mono, monospace' }}>{kpi.score}<span style={{ fontSize: 13, color: SUB, fontWeight: 400 }}> pts</span></p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ position: 'relative', height: 8, borderRadius: 99, background: SURFACE, overflow: 'hidden', marginBottom: 16 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${BLUE}, #48dbfb)` }}
            />
          </div>

          {/* Niveaux */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${levels.length}, 1fr)`, gap: 4 }}>
            {levels.map((l, i) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', margin: '0 auto 6px',
                  background: i <= levelIndex ? BLUE : BORDER,
                  boxShadow: i === levelIndex ? `0 0 8px ${BLUE}` : 'none',
                }} />
                <p style={{ margin: 0, fontSize: 10, color: i <= levelIndex ? TEXT : SUB, fontWeight: i === levelIndex ? 700 : 400, fontFamily: 'DM Mono, monospace' }}>{l}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '24px 28px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${stat.color}18`, border: `1px solid ${stat.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                  {stat.icon}
                </div>
                <p style={{ margin: 0, fontSize: 12, color: SUB, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</p>
              </div>
              <p style={{ margin: 0, fontSize: 36, fontWeight: 700, color: TEXT, fontFamily: 'DM Mono, monospace', lineHeight: 1 }}>
                {stat.value}<span style={{ fontSize: 16, color: SUB, fontWeight: 400 }}>{stat.suffix}</span>
              </p>
            </motion.div>
          ))}
        </div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '28px 32px' }}
        >
          <p style={{ margin: '0 0 20px', fontSize: 12, color: SUB, fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Badges débloqués</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {levels.slice(0, kpi.badges + 1).map((l, i) => (
              <div key={l} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: i <= kpi.badges ? `${BLUE}15` : SURFACE,
                border: `1px solid ${i <= kpi.badges ? `${BLUE}40` : BORDER}`,
                borderRadius: 10, padding: '8px 14px',
              }}>
                <Award size={14} color={i <= kpi.badges ? BLUE : SUB} />
                <span style={{ fontSize: 13, fontWeight: 600, color: i <= kpi.badges ? TEXT : SUB }}>{l}</span>
              </div>
            ))}
            {Array.from({ length: Math.max(0, levels.length - kpi.badges - 1) }).map((_, i) => (
              <div key={`locked-${i}`} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: SURFACE, border: `1px solid ${BORDER}`,
                borderRadius: 10, padding: '8px 14px', opacity: 0.4,
              }}>
                <Award size={14} color={SUB} />
                <span style={{ fontSize: 13, color: SUB }}>???</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
