import React from 'react';
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

type StepStatus = 'done' | 'active' | 'locked';

const steps: { title: string; status: StepStatus; score?: number; progress?: number; detail: string }[] = [
  { title: 'Bien-Être au Travail', status: 'done', score: 91, detail: '7 chapitres · QCM validé' },
  { title: 'Gestion RH Fondamentaux', status: 'done', score: 78, detail: '6 chapitres · QCM validé' },
  { title: 'Sécurité au Travail', status: 'active', progress: 43, detail: '3/7 leçons en cours' },
  { title: "RGPD & Protection des données", status: 'locked', detail: "Déverrouille après l'étape 3" },
];

export default function LmsParcoursPage() {
  const [, navigate] = useLocation();

  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', fontFamily: font.sans, background: palette.bg }}>
      {/* Sidebar */}
      <div style={{ width: 60, background: palette.dark, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', flexShrink: 0 }}>
        <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 13, color: palette.pink, marginBottom: 18 }}>FY</div>
        {navItems.map((item) => {
          const isActive = item.path === '/playground/lms/parcours';
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
        <div style={{ padding: '14px 24px', background: palette.white, borderBottom: `1px solid ${palette.border}`, flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: palette.dark }}>Mon Parcours</div>
        </div>

        {/* Content scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Progress global card */}
          <div style={{ background: palette.white, border: `1px solid ${palette.border}`, borderRadius: 8, padding: '14px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: palette.dark }}>Progression globale</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: palette.pink }}>2 / 4</span>
              </div>
              <div style={{ background: '#eee', height: 8, borderRadius: 4 }}>
                <div style={{ background: 'linear-gradient(90deg,#E8006C,#1B7A9C)', width: '50%', height: '100%', borderRadius: 4 }} />
              </div>
            </div>
            <div style={{ fontSize: 10, color: palette.muted, whiteSpace: 'nowrap' }}>~45 min restantes</div>
          </div>

          {/* Timeline */}
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            <div style={{ position: 'absolute', left: 12, top: 8, bottom: 8, width: 2, background: '#e0e0e0' }} />

            {steps.map((step, i) => {
              const isDone = step.status === 'done';
              const isActive = step.status === 'active';
              const isLocked = step.status === 'locked';

              const indicatorBg = isDone ? palette.green : isActive ? palette.pink : '#ddd';
              const indicatorColor = isDone || isActive ? '#fff' : '#aaa';
              const indicatorIcon = isDone ? '✓' : isActive ? '▶' : '🔒';

              const cardBg = isLocked ? '#f5f5f5' : palette.white;
              const cardOpacity = isLocked ? 0.7 : 1;
              const cardBorder = isDone
                ? '1px solid #d4eeda'
                : isActive
                ? `2px solid ${palette.pink}`
                : '1px dashed #ddd';

              const titleColor = isLocked ? '#aaa' : palette.dark;

              return (
                <div key={i} style={{ position: 'relative', marginBottom: 14 }}>
                  <div style={{
                    position: 'absolute',
                    left: -28,
                    top: 4,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: indicatorBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    color: indicatorColor,
                  }}>
                    {indicatorIcon}
                  </div>

                  <div style={{ background: cardBg, opacity: cardOpacity, border: cardBorder, borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: titleColor }}>{step.title}</span>
                      {isDone && step.score !== undefined && (
                        <span style={{ fontSize: 9, fontFamily: font.mono, background: '#d4eeda', color: palette.green, padding: '2px 6px', borderRadius: 10 }}>
                          {step.score}%
                        </span>
                      )}
                      {isActive && (
                        <span style={{ fontSize: 9, fontFamily: font.mono, background: 'rgba(232,0,108,.12)', color: palette.pink, padding: '2px 6px', borderRadius: 10 }}>
                          En cours
                        </span>
                      )}
                      {isLocked && (
                        <span style={{ fontSize: 9, fontFamily: font.mono, color: '#aaa' }}>Verrouillé</span>
                      )}
                    </div>
                    <div style={{ fontSize: 9, color: palette.muted }}>{step.detail}</div>

                    {isActive && step.progress !== undefined && (
                      <>
                        <div style={{ background: '#eee', height: 4, borderRadius: 2, marginTop: 8, marginBottom: 6 }}>
                          <div style={{ background: palette.pink, width: `${step.progress}%`, height: '100%', borderRadius: 2 }} />
                        </div>
                        <div
                          onClick={() => navigate('/playground/lms')}
                          style={{
                            background: palette.pink,
                            color: '#fff',
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '6px 0',
                            borderRadius: 5,
                            width: '100%',
                            textAlign: 'center',
                            cursor: 'pointer',
                            marginTop: 6,
                            boxSizing: 'border-box',
                          }}
                        >
                          Continuer →
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bannière certificat */}
          <div style={{ background: '#fffbf0', border: `1.5px dashed ${palette.amber}`, borderRadius: 8, padding: '12px 14px', marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>🏅</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: palette.dark }}>Certificat disponible à la fin</div>
              <div style={{ fontSize: 10, color: palette.muted }}>Onboarding RH · mc2i FYNE</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
