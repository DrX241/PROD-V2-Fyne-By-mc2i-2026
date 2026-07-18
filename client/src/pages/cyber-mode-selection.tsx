import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTutorial } from '@/contexts/TutorialContext';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

interface ModeOption {
  id: string;
  modeLabel: string;
  title: string;
  description: string;
  tags: string[];
  meta: { value: string; key: string }[];
  ctaLabel: string;
  destination: string;
  accent: string;
  accentRgb: string;
  icon: React.ReactNode;
}

const IconAcademie = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <rect x="6" y="12" width="28" height="20" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 18h28" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M14 12V8l6-3 6 3v4" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="20" cy="25" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M14 32c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
  </svg>
);

const IconRoleplay = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <circle cx="20" cy="14" r="5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 32c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
    <path d="M28 10l4-4M28 18l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
    <rect x="30" y="4" width="6" height="6" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="30" y="20" width="6" height="6" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const IconArcade = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <rect x="6" y="16" width="28" height="18" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M14 22v6M11 25h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
    <circle cx="27" cy="25" r="1.5" fill="currentColor"/>
    <path d="M20 6l2.5 6H26l-3.5 2.5 1.5 5.5L20 17l-4 3 1.5-5.5L14 12h3.5L20 6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="bevel"/>
  </svg>
);

const modes: ModeOption[] = [
  {
    id: 'academie',
    modeLabel: 'Découvrir',
    title: "L'Académie Cyber",
    description: "Maîtrisez les fondamentaux de la cybersécurité grâce à un coach IA expert et des parcours progressifs adaptés à votre niveau.",
    tags: ['Académie', 'Expert IA', 'Conversationnel'],
    meta: [
      { value: '14', key: 'Modules' },
      { value: '~4h', key: 'Par module' },
      { value: 'Tous', key: 'Niveaux' },
    ],
    ctaLabel: "Accéder à l'académie",
    destination: '/cyber/expert-learning',
    accent: '#0057ff',
    accentRgb: '0, 87, 255',
    icon: <IconAcademie />,
  },
  {
    id: 'roleplay',
    modeLabel: "S'entraîner",
    title: 'Roleplay & Scénarios',
    description: "Incarnez un rôle professionnel et affrontez des scénarios réalistes : RSSI, analyste SOC, consultant en sécurité.",
    tags: ['Professionnel', 'Roleplay', 'Scénarios'],
    meta: [
      { value: '8', key: 'Rôles' },
      { value: '~2h', key: 'Par scénario' },
      { value: 'Inter.', key: 'Niveau requis' },
    ],
    ctaLabel: 'Accéder aux rôles',
    destination: '/cyber-defense-new',
    accent: '#059669',
    accentRgb: '5, 150, 105',
    icon: <IconRoleplay />,
  },
  {
    id: 'arcade',
    modeLabel: 'Se challenger',
    title: 'Arcade & Défis',
    description: "Jeux interactifs, défis chronométrés et classements en temps réel pour tester vos réflexes et votre instinct cyber.",
    tags: ['Bug Hunter', 'Firewall', 'Brain Hacker', 'Escape'],
    meta: [
      { value: '9', key: 'Défis' },
      { value: '~20m', key: 'Par défi' },
      { value: 'Expert', key: 'Niveau requis' },
    ],
    ctaLabel: 'Accéder aux jeux',
    destination: '/cyber/arcade',
    accent: '#dc2626',
    accentRgb: '220, 38, 38',
    icon: <IconArcade />,
  },
];

export default function CyberModeSelection() {
  const [, setLocation] = useLocation();
  const [hovered, setHovered] = useState<string | null>(null);
  const { showTutorial, startTutorial, setCurrentTour, tutorialSeen } = useTutorial();

  useEffect(() => {
    if (!tutorialSeen['cyber-mode-selection']) {
      setCurrentTour('cyber-mode-selection');
      const timer = setTimeout(() => startTutorial(), 1000);
      return () => clearTimeout(timer);
    }
  }, [tutorialSeen, setCurrentTour, startTutorial]);

  return (
    <HomeLayout>
      <PageTitle title="ESPACE CYBER" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .cyber-page {
          background: #f5f6f7;
          min-height: calc(100vh - 64px);
          font-family: 'DM Sans', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .cyber-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 32px 80px;
        }
        .cyber-breadcrumb {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #9ca3af;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 28px;
        }
        .cyber-breadcrumb-sep { color: #e5e7eb; }
        .cyber-breadcrumb-current { color: #6b7280; }
        .cyber-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 32px;
          gap: 32px;
        }
        .cyber-title {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 32px;
          font-weight: 700;
          color: #0d0d0d;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin-bottom: 8px;
        }
        .cyber-title-accent { color: #0057ff; }
        .cyber-subtitle {
          font-size: 14px;
          color: #6b7280;
          font-weight: 400;
        }
        .cyber-kpis {
          display: flex;
          align-items: center;
          gap: 1px;
          background: #e5e7eb;
          border: 1px solid #e5e7eb;
          flex-shrink: 0;
        }
        .cyber-kpi {
          background: #ffffff;
          padding: 14px 24px;
          text-align: center;
          min-width: 90px;
        }
        .cyber-kpi-value {
          font-family: 'DM Mono', monospace;
          font-size: 22px;
          font-weight: 500;
          color: #0d0d0d;
          display: block;
          line-height: 1;
          margin-bottom: 4px;
        }
        .cyber-kpi-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9ca3af;
          display: block;
        }
        .cyber-prog {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          padding: 16px 24px;
          margin-bottom: 48px;
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .cyber-prog-label {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9ca3af;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .cyber-prog-track {
          flex: 1;
          height: 3px;
          background: #e5e7eb;
          position: relative;
        }
        .cyber-prog-fill {
          position: absolute;
          left: 0; top: 0;
          height: 100%;
          width: 0%;
          background: #0057ff;
        }
        .cyber-prog-milestones {
          position: absolute;
          top: 0; left: 0; right: 0;
          display: flex;
          justify-content: space-between;
        }
        .cyber-prog-milestone {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          transform: translateY(-16px);
        }
        .cyber-prog-rank {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #0d0d0d;
          white-space: nowrap;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .cyber-prog-badge {
          font-size: 10px;
          color: #9ca3af;
          background: #f5f6f7;
          padding: 2px 7px;
          border: 1px solid #e5e7eb;
          font-family: 'DM Mono', monospace;
        }
        .cyber-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #9ca3af;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .cyber-eyebrow::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }
        .cyber-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #e5e7eb;
        }
        .cyber-card {
          background: #ffffff;
          display: flex;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          min-height: 480px;
          transition: background 0.2s;
        }
        .cyber-card-strip {
          width: 36px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 1px solid #e5e7eb;
          transition: background 0.25s ease, border-color 0.25s ease;
        }
        .cyber-card-strip-text {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #9ca3af;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          white-space: nowrap;
          transition: color 0.25s ease;
        }
        .cyber-card-topbar {
          position: absolute;
          top: 0; left: 36px; right: 0;
          height: 2px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .cyber-card:hover .cyber-card-topbar {
          transform: scaleX(1);
        }
        .cyber-card-body {
          padding: 28px 28px 28px 24px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .cyber-card-mode {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        .cyber-card:hover .cyber-card-mode { opacity: 1; }
        .cyber-card-mode::before {
          content: '';
          width: 16px;
          height: 1px;
          background: currentColor;
        }
        .cyber-card-icon {
          width: 40px;
          height: 40px;
          margin-bottom: 20px;
          opacity: 0.85;
          transition: opacity 0.2s;
        }
        .cyber-card:hover .cyber-card-icon { opacity: 1; }
        .cyber-card-title {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #0d0d0d;
          letter-spacing: -0.015em;
          line-height: 1.2;
          margin-bottom: 12px;
        }
        .cyber-card-desc {
          font-size: 13.5px;
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 20px;
          flex: 1;
        }
        .cyber-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 24px;
        }
        .cyber-tag {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.06em;
          padding: 3px 8px;
          border: 1px solid #e5e7eb;
          color: #9ca3af;
          background: #f5f6f7;
          transition: border-color 0.2s, color 0.2s;
        }
        .cyber-card-meta {
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
          margin-bottom: 20px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .cyber-meta-value {
          font-family: 'DM Mono', monospace;
          font-size: 16px;
          font-weight: 500;
          color: #0d0d0d;
          display: block;
          line-height: 1;
          margin-bottom: 3px;
        }
        .cyber-meta-key {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9ca3af;
          display: block;
        }
        .cyber-cta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 600;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          text-align: left;
        }
        .cyber-cta-text {
          position: relative;
        }
        .cyber-cta-text::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 0;
          width: 0;
          height: 1px;
          background: currentColor;
          transition: width 0.25s ease;
        }
        .cyber-card:hover .cyber-cta-text::after { width: 100%; }
        .cyber-cta-arrow {
          display: inline-block;
          transition: transform 0.25s ease;
        }
        .cyber-card:hover .cyber-cta-arrow { transform: translateX(5px); }

        @media (max-width: 900px) {
          .cyber-grid { grid-template-columns: 1fr; }
          .cyber-card { min-height: auto; }
          .cyber-header { flex-direction: column; }
        }
        @media (max-width: 600px) {
          .cyber-inner { padding: 24px 16px 60px; }
          .cyber-title { font-size: 24px; }
        }
      `}</style>

      <div className="cyber-page">
        <div className="cyber-inner">

          {/* Breadcrumb */}
          <nav className="cyber-breadcrumb" aria-label="Fil d'Ariane">
            FYNE
            <span className="cyber-breadcrumb-sep">/</span>
            Univers
            <span className="cyber-breadcrumb-sep">/</span>
            <span className="cyber-breadcrumb-current">Espace Cyber</span>
          </nav>

          {/* Header */}
          <div className="cyber-header">
            <div>
              <h1 className="cyber-title">
                Univers <span className="cyber-title-accent">Cybersécurité</span>
              </h1>
              <p className="cyber-subtitle">Choisissez votre mode d'entraînement et progressez à votre rythme.</p>
            </div>
            <div className="cyber-kpis" role="list" aria-label="Statistiques">
              <div className="cyber-kpi" role="listitem">
                <span className="cyber-kpi-value">31</span>
                <span className="cyber-kpi-label">Modules</span>
              </div>
              <div className="cyber-kpi" role="listitem">
                <span className="cyber-kpi-value">8</span>
                <span className="cyber-kpi-label">Rôles</span>
              </div>
              <div className="cyber-kpi" role="listitem">
                <span className="cyber-kpi-value">Novice</span>
                <span className="cyber-kpi-label">Rang</span>
              </div>
            </div>
          </div>

          {/* Progression */}
          <div className="cyber-prog" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100} aria-label="Progression vers Padawan">
            <span className="cyber-prog-label">Progression</span>
            <div className="cyber-prog-track">
              <div className="cyber-prog-fill" />
              <div className="cyber-prog-milestones" aria-hidden="true">
                {['Novice','Padawan','Chevalier','Maître','Grand Maître'].map(m => (
                  <span key={m} className="cyber-prog-milestone">{m}</span>
                ))}
              </div>
            </div>
            <div className="cyber-prog-rank">
              <span className="cyber-prog-badge">NOVICE</span>
              100 pts pour Padawan
            </div>
          </div>

          {/* Section label */}
          <div className="cyber-eyebrow">3 modes d'apprentissage</div>

          {/* Cards */}
          <div className="cyber-grid">
            {modes.map(mode => (
              <div
                key={mode.id}
                className="cyber-card"
                onMouseEnter={() => setHovered(mode.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setLocation(mode.destination)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setLocation(mode.destination)}
                aria-label={mode.title}
              >
                {/* Accent top bar */}
                <div
                  className="cyber-card-topbar"
                  style={{ background: mode.accent }}
                />

                {/* Vertical strip */}
                <div
                  className="cyber-card-strip"
                  style={hovered === mode.id ? {
                    background: `rgba(${mode.accentRgb}, 0.04)`,
                    borderColor: `rgba(${mode.accentRgb}, 0.2)`,
                  } : {}}
                >
                  <span
                    className="cyber-card-strip-text"
                    style={hovered === mode.id ? { color: mode.accent } : {}}
                  >
                    {mode.modeLabel}
                  </span>
                </div>

                {/* Body */}
                <div className="cyber-card-body">
                  <div className="cyber-card-mode" style={{ color: mode.accent }}>
                    {mode.title}
                  </div>

                  <div className="cyber-card-icon" style={{ color: mode.accent }}>
                    {mode.icon}
                  </div>

                  <h2 className="cyber-card-title">{mode.title}</h2>
                  <p className="cyber-card-desc">{mode.description}</p>

                  <div className="cyber-card-tags">
                    {mode.tags.map(tag => (
                      <span
                        key={tag}
                        className="cyber-tag"
                        style={hovered === mode.id ? {
                          borderColor: `rgba(${mode.accentRgb}, 0.3)`,
                          color: '#6b7280',
                        } : {}}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="cyber-card-meta">
                    {mode.meta.map(m => (
                      <div key={m.key}>
                        <span className="cyber-meta-value">{m.value}</span>
                        <span className="cyber-meta-key">{m.key}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className="cyber-cta"
                    style={{ color: mode.accent }}
                    onClick={e => { e.stopPropagation(); setLocation(mode.destination); }}
                  >
                    <span className="cyber-cta-text">{mode.ctaLabel}</span>
                    <span className="cyber-cta-arrow" aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </HomeLayout>
  );
}
