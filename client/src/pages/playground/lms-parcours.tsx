import React from 'react';
import { useLocation } from 'wouter';
import { LayoutDashboard, BookOpen, BookMarked, TrendingUp, Award, ArrowLeft, CheckCircle2, PlayCircle, Lock, Medal } from 'lucide-react';

const P = {
  bg: '#f4f5f7', white: '#ffffff', dark: '#111827', pink: '#E8006C',
  blue: '#0057ff', green: '#059669', amber: '#d97706', muted: '#6b7280',
  border: '#e5e7eb', sidebarBg: '#111827', sidebarActive: 'rgba(232,0,108,0.15)',
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
            <div key={label} onClick={() => path && nav(path)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              borderRadius: 8, marginBottom: 2, cursor: path ? 'pointer' : 'default',
              background: isActive ? P.sidebarActive : 'transparent',
              color: isActive ? P.pink : 'rgba(255,255,255,0.55)',
            }}>
              <Icon size={16} />
              <span style={{ fontFamily: F.sans, fontSize: 14, fontWeight: isActive ? 600 : 400 }}>{label}</span>
            </div>
          );
        })}
      </nav>
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div onClick={() => nav('/playground')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
          <ArrowLeft size={16} />
          <span style={{ fontFamily: F.sans, fontSize: 13 }}>Retour au Studio</span>
        </div>
      </div>
    </div>
  );
}

type StepStatus = 'done' | 'active' | 'locked';

const STEPS: { title: string; status: StepStatus; score?: number; progress?: number; detail: string }[] = [
  { title: 'Bien-Être au Travail', status: 'done', score: 91, detail: '7 chapitres · QCM validé' },
  { title: 'Gestion RH Fondamentaux', status: 'done', score: 78, detail: '6 chapitres · QCM validé' },
  { title: 'Sécurité au Travail', status: 'active', progress: 43, detail: '3 / 7 leçons complétées' },
  { title: 'RGPD & Protection des données', status: 'locked', detail: "Déverrouillé après l'étape 3" },
];

export default function LmsParcoursPage() {
  const [, nav] = useLocation();

  return (
    <div style={{ height: '100vh', display: 'flex', fontFamily: F.sans, overflow: 'hidden' }}>
      <Sidebar active="/playground/lms/parcours" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: P.bg }}>
        {/* Topbar */}
        <div style={{ background: P.white, borderBottom: `1px solid ${P.border}`, padding: '16px 32px', flexShrink: 0 }}>
          <h1 style={{ margin: '0 0 2px', fontSize: 22, fontWeight: 700, color: P.dark }}>Mon Parcours</h1>
          <p style={{ margin: 0, fontSize: 13, color: P.muted }}>Onboarding RH — assigné par votre manager</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

          {/* Progression globale */}
          <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: '20px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: P.dark }}>Progression globale</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: P.pink, fontFamily: F.mono }}>2 / 4 modules</span>
              </div>
              <div style={{ background: '#f3f4f6', height: 10, borderRadius: 5 }}>
                <div style={{ background: 'linear-gradient(90deg, #E8006C, #0057ff)', width: '50%', height: '100%', borderRadius: 5 }} />
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 13, color: P.muted }}>~45 min restantes</div>
              <div style={{ fontSize: 12, color: P.muted, marginTop: 2 }}>Certificat à la clé</div>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ position: 'relative', paddingLeft: 20, maxWidth: 640 }}>
            {/* Ligne verticale */}
            <div style={{ position: 'absolute', left: 19, top: 20, bottom: 20, width: 2, background: P.border }} />

            {STEPS.map((step, i) => {
              const isDone = step.status === 'done';
              const isActive = step.status === 'active';
              const isLocked = step.status === 'locked';

              return (
                <div key={i} style={{ position: 'relative', marginBottom: 16, paddingLeft: 44 }}>
                  {/* Indicateur */}
                  <div style={{
                    position: 'absolute', left: 0, top: 16,
                    width: 40, height: 40, borderRadius: '50%',
                    background: isDone ? P.green : isActive ? P.pink : '#e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1,
                    boxShadow: isActive ? `0 0 0 4px rgba(232,0,108,0.15)` : 'none',
                  }}>
                    {isDone && <CheckCircle2 size={20} color="#fff" />}
                    {isActive && <PlayCircle size={20} color="#fff" />}
                    {isLocked && <Lock size={18} color={P.muted} />}
                  </div>

                  {/* Card */}
                  <div style={{
                    background: isLocked ? '#fafafa' : P.white,
                    border: isDone ? `1px solid #bbf7d0` : isActive ? `2px solid ${P.pink}` : `1px solid ${P.border}`,
                    borderRadius: 12,
                    padding: '18px 20px',
                    opacity: isLocked ? 0.65 : 1,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: isLocked ? P.muted : P.dark }}>{step.title}</div>
                      {isDone && step.score !== undefined && (
                        <div style={{ background: '#dcfce7', color: P.green, fontFamily: F.mono, fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                          {step.score}%
                        </div>
                      )}
                      {isActive && (
                        <div style={{ background: 'rgba(232,0,108,0.1)', color: P.pink, fontFamily: F.mono, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                          En cours
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: P.muted, marginBottom: isActive ? 14 : 0 }}>{step.detail}</div>

                    {isActive && step.progress !== undefined && (
                      <>
                        <div style={{ background: '#f3f4f6', height: 6, borderRadius: 3, marginBottom: 14 }}>
                          <div style={{ background: P.pink, width: `${step.progress}%`, height: '100%', borderRadius: 3 }} />
                        </div>
                        <button
                          onClick={() => nav('/playground/lms')}
                          style={{ background: P.pink, color: '#fff', border: 'none', width: '100%', padding: '12px 0', borderRadius: 8, fontFamily: F.sans, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                        >
                          Continuer la formation →
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bannière certificat */}
          <div style={{ background: '#fffbeb', border: `1.5px dashed ${P.amber}`, borderRadius: 12, padding: '18px 22px', marginTop: 8, maxWidth: 640, display: 'flex', alignItems: 'center', gap: 16 }}>
            <Medal size={32} color={P.amber} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: P.dark, marginBottom: 2 }}>Certificat disponible à la fin du parcours</div>
              <div style={{ fontSize: 13, color: P.muted }}>Onboarding RH · mc2i FYNE — Complétez les 4 modules pour l'obtenir</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
