import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

const palette = {
  bg: '#f8f8fc',
  white: '#ffffff',
  dark: '#1c1c2e',
  pink: '#E8006C',
  blue: '#1B7A9C',
  green: '#22a359',
  amber: '#f0b429',
  muted: '#888888',
  border: '#e5e7eb',
};
const font = { sans: "'DM Sans', sans-serif", mono: "'DM Mono', monospace" };

const navItems = [
  { icon: '⊞', label: 'Accueil', path: '/playground/lms/dashboard' },
  { icon: '◧', label: 'Formations', path: '/playground/lms' },
  { icon: '⊡', label: 'Catalogue', path: '/playground/lms/catalogue' },
  { icon: '⇢', label: 'Parcours', path: '/playground/lms/parcours' },
  { icon: '◎', label: 'Certif.', path: null },
];

export default function LmsDashboardPage() {
  const [, navigate] = useLocation();
  const [userName, setUserName] = useState('Apprenant');

  useEffect(() => {
    fetch('/api/auth/check', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.authenticated && d.user?.firstName) setUserName(d.user.firstName); })
      .catch(() => {});
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', fontFamily: font.sans, background: palette.bg }}>
      {/* Sidebar */}
      <div style={{ width: 60, background: palette.dark, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', flexShrink: 0 }}>
        <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 13, color: palette.pink, marginBottom: 18 }}>FY</div>
        {navItems.map((item) => {
          const isActive = item.path === '/playground/lms/dashboard';
          return (
            <div
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              style={{
                width: 44,
                padding: '8px 0',
                borderRadius: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                cursor: item.path ? 'pointer' : 'default',
                background: isActive ? 'rgba(232,0,108,.18)' : 'transparent',
                color: isActive ? palette.pink : 'rgba(255,255,255,0.55)',
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ fontFamily: font.mono, fontSize: 7, letterSpacing: 0.3 }}>{item.label}</span>
            </div>
          );
        })}
        <div style={{ flex: 1 }} />
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#2B6CB0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>AP</div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '14px 24px', background: palette.white, borderBottom: `1px solid ${palette.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: palette.dark }}>Bonjour, {userName} 👋</div>
          <button
            onClick={() => navigate('/playground/lms/catalogue')}
            style={{ background: palette.pink, color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontFamily: font.sans, fontWeight: 600, fontSize: 13 }}
          >
            + Explorer
          </button>
        </div>

        {/* Content scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* 3 stats cards */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'En cours', value: '2', color: palette.pink },
              { label: 'Terminées', value: '5', color: palette.blue },
              { label: 'Score QCM', value: '82%', color: palette.green },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{ flex: 1, background: palette.white, border: `1px solid ${palette.border}`, borderRadius: 8, padding: 16, textAlign: 'center' }}
              >
                <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: palette.muted, marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Bannière reprendre */}
          <div style={{ background: 'linear-gradient(120deg,#E8006C,#b00059)', borderRadius: 10, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: font.mono, fontSize: 9, color: 'rgba(255,255,255,.7)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                REPRENDRE OÙ VOUS ÉTIEZ
              </div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Sécurité au Travail</div>
              <div style={{ background: 'rgba(255,255,255,.25)', height: 4, borderRadius: 2, marginBottom: 6 }}>
                <div style={{ background: '#fff', width: '43%', height: '100%', borderRadius: 2 }} />
              </div>
              <div style={{ color: '#fff', fontSize: 10 }}>3/7 leçons</div>
            </div>
            <div
              onClick={() => navigate('/playground/lms')}
              style={{ width: 40, height: 40, background: 'rgba(255,255,255,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, cursor: 'pointer', marginLeft: 16, flexShrink: 0 }}
            >
              ▶
            </div>
          </div>

          {/* Mes formations assignées */}
          <div style={{ fontSize: 12, fontWeight: 700, color: palette.dark, marginBottom: 10 }}>Mes formations assignées</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, background: palette.white, border: `1px solid ${palette.border}`, borderRadius: 8, padding: 12 }}>
              <div style={{ background: '#e8e8e8', height: 40, borderRadius: 4, marginBottom: 8 }} />
              <div style={{ fontSize: 11, fontWeight: 600, color: palette.dark, marginBottom: 6 }}>Bien-Être au Travail</div>
              <div style={{ background: '#eee', height: 4, borderRadius: 2, marginBottom: 4 }}>
                <div style={{ background: palette.green, width: '88%', height: '100%', borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 10, color: palette.muted }}>88% · QCM en attente</div>
            </div>
            <div style={{ flex: 1, background: palette.white, border: `1px solid ${palette.border}`, borderRadius: 8, padding: 12 }}>
              <div style={{ background: '#e8e8e8', height: 40, borderRadius: 4, marginBottom: 8 }} />
              <div style={{ fontSize: 11, fontWeight: 600, color: palette.dark, marginBottom: 6 }}>RH Fondamentaux</div>
              <div style={{ background: '#eee', height: 4, borderRadius: 2, marginBottom: 4 }}>
                <div style={{ background: palette.pink, width: '40%', height: '100%', borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 10, color: palette.muted }}>40% · En cours</div>
            </div>
          </div>

          {/* Recommandation IA */}
          <div style={{ background: '#f0f7ff', border: `1.5px dashed ${palette.blue}`, borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontFamily: font.mono, fontSize: 9, color: palette.blue, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>✦ Recommandé par l'IA</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: palette.dark }}>RGPD & Protection des données</div>
            <div style={{ fontSize: 10, color: palette.muted, marginTop: 2 }}>Profil RH · 15 min · Micro Learning</div>
          </div>
        </div>
      </div>
    </div>
  );
}
