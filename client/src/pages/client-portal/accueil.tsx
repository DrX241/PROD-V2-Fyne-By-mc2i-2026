import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Lock } from 'lucide-react';

const BLUE = '#246f9f';
const PINK = '#e5007e';

const accordionItems = [
  { id: 1, moduleId: 'ia',            title: 'Espace IA',             gradient: 'linear-gradient(160deg, #3b1fa3 0%, #7c3aed 50%, #a855f7 100%)' },
  { id: 2, moduleId: 'data',          title: 'Espace Data',            gradient: 'linear-gradient(160deg, #0c4a6e 0%, #0284c7 50%, #22d3ee 100%)' },
  { id: 3, moduleId: 'cyber',         title: 'Espace Cyber',           gradient: 'linear-gradient(160deg, #052e16 0%, #166534 50%, #4ade80 100%)' },
  { id: 4, moduleId: 'reglementaire', title: 'Espace Réglementaire',   gradient: 'linear-gradient(160deg, #1e293b 0%, #334155 50%, #64748b 100%)' },
  { id: 5, moduleId: 'personnalise',  title: 'Espace à personnaliser', gradient: 'linear-gradient(160deg, #78350f 0%, #d97706 50%, #fbbf24 100%)' },
  { id: 6, moduleId: 'evaluation',    title: 'Mode Évaluation',        gradient: 'linear-gradient(160deg, #7f1d1d 0%, #dc2626 50%, #fb7185 100%)' },
  { id: 7, moduleId: 'studio',        title: 'Studio de Formation',    gradient: 'linear-gradient(160deg, #0c2461 0%, #0057ff 50%, #48dbfb 100%)' },
];

const levels = ['Novice', 'Padawan', 'Chevalier', 'Maitre', 'Grand Maitre'];

function computeLevel(score: number) {
  if (score >= 1000) return 'Grand Maitre';
  if (score >= 500)  return 'Maitre';
  if (score >= 250)  return 'Chevalier';
  if (score >= 100)  return 'Padawan';
  return 'Novice';
}
function computeBadges(niveau: string) { return levels.indexOf(niveau); }

interface Kpi {
  prenom: string; nom: string; companyName: string;
  score: number; exercices_realises: number; taux_reussite: number;
  niveau: string; badges: number; classement: number;
  role: string; modulesEnabled: string[];
}

export default function ClientAccueilPage() {
  const [, setLocation] = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [kpi, setKpi] = useState<Kpi>({ prenom: '', nom: '', companyName: '', score: 0, exercices_realises: 0, taux_reussite: 0, niveau: 'Novice', badges: 0, classement: 0, role: 'user', modulesEnabled: [] });
  const [authChecked, setAuthChecked] = useState(false);

  const hour = new Date().getHours();
  const salutation = hour >= 18 || hour < 5 ? 'Bonsoir' : 'Bonjour';

  useEffect(() => {
    fetch('/api/client/auth/check', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (!d.authenticated) {
          setLocation('/portail-client/login');
          return;
        }
        const u = d.user;
        setKpi(prev => ({
          ...prev,
          prenom: u.firstName || '',
          nom: u.lastName || '',
          companyName: u.companyName || '',
          score: u.score ?? 0,
          exercices_realises: u.exercicesRealises ?? 0,
          taux_reussite: u.tauxReussite ?? 0,
          niveau: u.niveau ?? 'Novice',
          badges: u.badges ?? 0,
          classement: u.classement ?? 0,
          role: u.role ?? 'user',
          modulesEnabled: u.modulesEnabled ?? [],
        }));
        setAuthChecked(true);
      })
      .catch(() => setLocation('/portail-client/login'));
  }, []);

  async function handleLogout() {
    await fetch('/api/client/auth/logout', { method: 'POST', credentials: 'include' });
    setLocation('/portail-client/login');
  }

  async function handleExerciceReussi() {
    const newExos = kpi.exercices_realises + 1;
    const newScore = kpi.score + 10;
    const newTaux = Number(((kpi.taux_reussite * kpi.exercices_realises + 100) / newExos).toFixed(2));
    const newNiveau = computeLevel(newScore);
    const newBadges = computeBadges(newNiveau);
    const res = await fetch('/api/client/kpi/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ exercices_realises: newExos, score: newScore, taux_reussite: newTaux, niveau: newNiveau, badges: newBadges }),
    });
    const data = await res.json();
    setKpi(prev => ({ ...prev, exercices_realises: newExos, score: newScore, taux_reussite: newTaux, niveau: newNiveau, badges: newBadges, classement: data.classement ?? prev.classement }));
  }

  if (!authChecked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f8' }}>
        <div style={{ color: BLUE, fontSize: 14 }}>Chargement…</div>
      </div>
    );
  }

  const levelIndex = Math.max(0, levels.indexOf(kpi.niveau));
  const progressPercent = Math.min(100, (kpi.score / 1000) * 100);

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#f7f7f8', fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
      <style>{`
        @keyframes fluid-progress { 0%,100%{ filter:blur(2px) brightness(1.1); } 50%{ filter:blur(4px) brightness(1.2); } }
        .prog-anim { animation: fluid-progress 2.5s infinite linear; }
      `}</style>

      <div style={{ padding: '48px 48px 96px', width: '100%' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: BLUE, margin: 0 }}>
              {salutation}{kpi.prenom ? ` ${kpi.prenom}` : ''}, bienvenue dans ton espace.
            </p>
            {kpi.companyName && (
              <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>{kpi.companyName}</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {kpi.role === 'admin' && (
              <>
                <button
                  onClick={() => setLocation('/portail-client/gestion')}
                  style={{ padding: '8px 16px', borderRadius: 8, background: BLUE, color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 13 }}
                  onMouseEnter={e => (e.currentTarget.style.background = PINK)}
                  onMouseLeave={e => (e.currentTarget.style.background = BLUE)}
                >
                  Gestion des utilisateurs
                </button>
              </>
            )}
            {kpi.role === 'user' && (
              <button
                onClick={() => setLocation('/portail-client/mes-formations')}
                style={{ padding: '8px 16px', borderRadius: 8, background: BLUE, color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 13 }}
                onMouseEnter={e => (e.currentTarget.style.background = PINK)}
                onMouseLeave={e => (e.currentTarget.style.background = BLUE)}
              >
                📚 Mes formations
              </button>
            )}
            <button
              onClick={handleLogout}
              style={{ padding: '8px 16px', borderRadius: 8, background: '#f1f5f9', color: BLUE, fontWeight: 600, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 13 }}
              onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
              onMouseLeave={e => (e.currentTarget.style.background = '#f1f5f9')}
            >
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Bouton test */}
        <button
          style={{ marginBottom: 16, padding: '8px 16px', borderRadius: 6, background: BLUE, color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 14 }}
          onMouseEnter={e => (e.currentTarget.style.background = PINK)}
          onMouseLeave={e => (e.currentTarget.style.background = BLUE)}
          onClick={handleExerciceReussi}
        >
          +1 Exercice réussi (test)
        </button>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16, color: BLUE, marginBottom: 16 }}>
          {[
            { lbl: 'Score',              val: kpi.score },
            { lbl: 'Exercices réalisés', val: kpi.exercices_realises },
            { lbl: 'Taux de réussite',   val: `${kpi.taux_reussite}%` },
            { lbl: 'Rang',               val: kpi.niveau || 'Novice' },
            { lbl: 'Classement',         val: kpi.classement > 0 ? `#${kpi.classement}` : '-' },
          ].map(({ lbl, val }) => (
            <div key={lbl} style={{ padding: 12 }}>
              <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7, margin: '0 0 4px' }}>{lbl}</p>
              <p style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Barre de progression */}
        <div style={{ marginTop: 20, marginBottom: 40 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: BLUE, marginBottom: 12 }}>Barre de progression</p>
          <div style={{ position: 'relative', height: 16, borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #f3e6f9 0%, #e0f1fa 100%)', opacity: 0.7 }} />
            <div className="prog-anim" style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 99, width: `${progressPercent}%`, background: 'repeating-linear-gradient(135deg, #e5007e, #e5007e 10px, #246f9f 20px)', transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }} />
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', fontSize: 11, fontWeight: 700, color: BLUE, textShadow: '0 1px 4px #fff,0 0 2px #fff', userSelect: 'none' }}>{progressPercent.toFixed(1)}%</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, textAlign: 'center', fontSize: 12, color: BLUE }}>
            {levels.map((l, i) => (
              <div key={l} style={{ fontWeight: i <= levelIndex ? 700 : 400, opacity: i <= levelIndex ? 1 : 0.5 }}>{l}</div>
            ))}
          </div>
        </div>

        {/* Hero + Accordion */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 48, width: '100%', minWidth: 0 }}>

          {/* Texte gauche */}
          <div style={{ flex: '0 0 340px', minWidth: 0 }}>
            <h1 style={{ fontSize: 'clamp(1.3rem,2.8vw,2.6rem)', fontWeight: 700, color: BLUE, lineHeight: 1.12, margin: 0 }}>
              <span style={{ display: 'block' }}>
                <span style={{ color: PINK }}>F</span>or{' '}
                <span style={{ color: PINK }}>Y</span>our{' '}
                <span style={{ color: PINK }}>N</span>ext{' '}
                <span style={{ color: PINK }}>E</span>xperience
              </span>
              <span style={{ display: 'block', height: 3, width: 140, margin: '12px 0', borderRadius: 99, background: `linear-gradient(to right, ${PINK}, ${BLUE})` }} />
              <span style={{ display: 'block', fontWeight: 400, fontSize: 'clamp(1rem,1.8vw,1.5rem)' }}>
                Améliorez votre expertise<br />avec <span style={{ color: PINK }}>FYNE</span>
              </span>
            </h1>
            <p style={{ marginTop: 20, fontSize: 15, color: BLUE, lineHeight: 1.6 }}>
              Découvrez une nouvelle dimension d'apprentissage interactif avec nos modules IA innovants qui s'adaptent parfaitement à votre progression.
            </p>
          </div>

          {/* Accordion */}
          <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', gap: 10, overflow: 'hidden', height: 450 }}>
            {accordionItems.map((item, index) => {
              const isLocked = kpi.modulesEnabled.length > 0 && !kpi.modulesEnabled.includes(item.moduleId);
              return (
                <div
                  key={item.id}
                  style={{
                    position: 'relative', height: 450, borderRadius: 16, overflow: 'hidden', cursor: isLocked ? 'default' : 'pointer',
                    transition: 'flex 0.7s ease-in-out',
                    flex: index === activeIndex ? '4 0 0' : '1 0 0',
                    minWidth: 0, background: item.gradient,
                  }}
                  onMouseEnter={() => !isLocked && setActiveIndex(index)}
                >
                  <div style={{ position: 'absolute', inset: 0, background: isLocked ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.15)' }} />
                  {isLocked && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 2 }}>
                      <Lock size={24} color="rgba(255,255,255,0.7)" />
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>Non activé</span>
                    </div>
                  )}
                  <span style={{
                    position: 'absolute', color: isLocked ? 'rgba(255,255,255,0.4)' : 'white', fontSize: 18, fontWeight: 600, whiteSpace: 'nowrap',
                    transition: 'all 0.3s ease-in-out', zIndex: 1,
                    ...(index === activeIndex
                      ? { bottom: 24, left: '50%', transform: 'translateX(-50%) rotate(0deg)' }
                      : { bottom: 96, left: '50%', transform: 'translateX(-50%) rotate(90deg)' }),
                  }}>
                    {item.title}
                  </span>
                  {index === activeIndex && !isLocked && (
                    <div
                      onClick={() => {
                        if (item.moduleId === 'data') setLocation('/portail-client/data');
                        else if (item.moduleId === 'studio') setLocation('/playground/module-generator');
                      }}
                      style={{ position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 16px', fontSize: 12, color: 'white', fontWeight: 500, whiteSpace: 'nowrap', backdropFilter: 'blur(4px)', zIndex: 1, cursor: (item.moduleId === 'data' || item.moduleId === 'studio') ? 'pointer' : 'default' }}
                    >
                      {item.moduleId === 'data' ? '📊 Ouvrir l\'Espace Data' : item.moduleId === 'studio' ? '🎓 Ouvrir le Studio' : 'Bientôt disponible'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
