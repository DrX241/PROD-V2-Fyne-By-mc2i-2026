import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { LayoutDashboard, BookOpen, BookMarked, TrendingUp, Award, ArrowLeft, LogOut, ChevronRight, Play } from 'lucide-react';

const P = {
  bg: '#f4f5f7',
  white: '#ffffff',
  dark: '#111827',
  pink: '#E8006C',
  blue: '#0057ff',
  green: '#059669',
  amber: '#d97706',
  muted: '#6b7280',
  border: '#e5e7eb',
  sidebarBg: '#111827',
  sidebarActive: 'rgba(232,0,108,0.15)',
};
const F = { sans: "'DM Sans', sans-serif", mono: "'DM Mono', monospace" };

const NAV = [
  { icon: LayoutDashboard, label: 'Accueil', path: '/playground/lms/dashboard' },
  { icon: BookOpen, label: 'Mes cours', path: '/playground/lms' },
  { icon: BookMarked, label: 'Catalogue', path: '/playground/lms/catalogue' },
  { icon: TrendingUp, label: 'Parcours', path: '/playground/lms/parcours' },
  { icon: Award, label: 'Certifs', path: null },
];

function Sidebar({ active }: { active: string }) {
  const [, nav] = useLocation();
  return (
    <div style={{ width: 220, background: P.sidebarBg, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 18, color: P.pink, letterSpacing: '-0.5px' }}>FYNE</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontFamily: F.mono }}>Espace Apprenant</div>
      </div>
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {NAV.map(({ icon: Icon, label, path }) => {
          const isActive = path === active;
          return (
            <div
              key={label}
              onClick={() => path && nav(path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                cursor: path ? 'pointer' : 'default',
                background: isActive ? P.sidebarActive : 'transparent',
                color: isActive ? P.pink : 'rgba(255,255,255,0.55)',
                transition: 'background 0.15s',
              }}
            >
              <Icon size={16} />
              <span style={{ fontFamily: F.sans, fontSize: 14, fontWeight: isActive ? 600 : 400 }}>{label}</span>
            </div>
          );
        })}
      </nav>
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div
          onClick={() => nav('/playground')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}
        >
          <ArrowLeft size={16} />
          <span style={{ fontFamily: F.sans, fontSize: 13 }}>Retour au Studio</span>
        </div>
      </div>
    </div>
  );
}

export default function LmsDashboardPage() {
  const [, nav] = useLocation();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetch('/api/auth/check', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) {
          const u = d.user;
          setUserName(u?.firstName || u?.username || u?.email?.split('@')[0] || 'Apprenant');
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', fontFamily: F.sans, overflow: 'hidden' }}>
      <Sidebar active="/playground/lms/dashboard" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: P.bg }}>
        {/* Topbar */}
        <div style={{ background: P.white, borderBottom: `1px solid ${P.border}`, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: P.dark }}>
              Bonjour{userName ? `, ${userName}` : ''} 👋
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: P.muted }}>Voici votre tableau de bord de formation</p>
          </div>
          <button
            onClick={() => nav('/playground/lms/catalogue')}
            style={{ background: P.pink, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontFamily: F.sans, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            Explorer le catalogue <ChevronRight size={14} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Formations en cours', value: '2', color: P.pink, sub: 'À compléter' },
              { label: 'Formations terminées', value: '5', color: P.blue, sub: 'Certifiées' },
              { label: 'Score QCM moyen', value: '82%', color: P.green, sub: 'Sur vos derniers QCM' },
            ].map(s => (
              <div key={s.label} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: s.color, fontFamily: F.mono, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: P.dark, margin: '8px 0 2px' }}>{s.label}</div>
                <div style={{ fontSize: 12, color: P.muted }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Reprendre */}
          <div style={{
            background: 'linear-gradient(135deg, #E8006C 0%, #9d004a 100%)',
            borderRadius: 14, padding: '24px 28px', marginBottom: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F.mono, fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Reprendre où vous étiez
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Sécurité au Travail</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.25)', height: 6, borderRadius: 3 }}>
                  <div style={{ background: '#fff', width: '43%', height: '100%', borderRadius: 3 }} />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontFamily: F.mono, whiteSpace: 'nowrap' }}>3 / 7 leçons</span>
              </div>
            </div>
            <button
              onClick={() => nav('/playground/lms')}
              style={{
                marginLeft: 28, width: 52, height: 52, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <Play size={20} fill="#fff" color="#fff" />
            </button>
          </div>

          {/* Mes formations */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: P.dark, margin: '0 0 16px' }}>Mes formations en cours</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { title: 'Bien-Être au Travail', pct: 88, color: P.green, status: 'QCM en attente', chapters: 7 },
                { title: 'RH Fondamentaux', pct: 40, color: P.pink, status: 'En cours', chapters: 6 },
              ].map(f => (
                <div key={f.title} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: 20, cursor: 'pointer' }} onClick={() => nav('/playground/lms')}>
                  <div style={{ background: '#f3f4f6', borderRadius: 8, height: 80, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={28} color={P.muted} />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: P.dark, marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: P.muted, marginBottom: 12 }}>{f.chapters} chapitres</div>
                  <div style={{ background: '#f3f4f6', height: 6, borderRadius: 3, marginBottom: 6 }}>
                    <div style={{ background: f.color, width: `${f.pct}%`, height: '100%', borderRadius: 3 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: P.muted }}>{f.status}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: f.color, fontFamily: F.mono }}>{f.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommandation IA */}
          <div style={{ background: '#eff6ff', border: `1.5px dashed ${P.blue}`, borderRadius: 12, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: F.mono, fontSize: 11, color: P.blue, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>✦ Recommandé par l'IA</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: P.dark, marginBottom: 4 }}>RGPD & Protection des données</div>
              <div style={{ fontSize: 13, color: P.muted }}>Profil RH · 15 min · Micro Learning</div>
            </div>
            <button
              onClick={() => nav('/playground/lms/catalogue')}
              style={{ background: P.blue, color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontFamily: F.sans, fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}
            >
              Voir →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
