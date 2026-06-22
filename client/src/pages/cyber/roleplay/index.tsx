import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronLeft,
  Shield,
} from 'lucide-react';

const SANS = "'Plus Jakarta Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const RoleplayHub: React.FC = () => {
  const [, setLocation] = useLocation();
  const [hoveredScenario, setHoveredScenario] = useState<string | null>(null);

  const scenarios = [
    {
      id: 'debutant-cyber',
      title: "Je suis Monsieur Tout le Monde",
      description: "Je veux apprendre à me protéger des risques numériques au quotidien",
      link: '/cyber/learning-center/modules/debutant-cyber',
      details: [
        "4 modules immersifs avec scénarios réels",
        "Choix interactifs et feedback immédiat",
        "Score de risque personnel + badge final"
      ],
      comingSoon: false,
    },
  ];

  const getIcon = (_id: string) => Shield;

  return (
    <div
      style={{
        background: '#ffffff',
        minHeight: '100vh',
        fontFamily: SANS,
        color: '#0f172a',
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');`}</style>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 40px 80px' }}>

        {/* Back */}
        <button
          onClick={() => setLocation('/cyber')}
          style={{
            fontFamily: MONO,
            fontSize: 11,
            color: '#94a3b8',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: 44,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: 0,
          }}
        >
          <ChevronLeft size={13} />
          Retour vers I AM CYBER
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 48 }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#006a9e',
              display: 'block',
              marginBottom: 8,
            }}
          >
            ROLEPLAY
          </span>
          <h1
            style={{
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              letterSpacing: '-0.035em',
              color: '#0f172a',
              margin: '0 0 8px',
            }}
          >
            Cyber Role Play
          </h1>
          <p
            style={{
              fontSize: 14,
              color: '#64748b',
              margin: 0,
              maxWidth: 480,
              lineHeight: 1.6,
            }}
          >
            Immergez-vous dans des simulations de rôles réalistes pour développer vos compétences en cybersécurité à travers des interactions dynamiques avec l'IA.
          </p>
        </motion.div>

        {/* Section label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <span style={{ fontFamily: MONO, fontSize: 10, textTransform: 'uppercase', color: '#94a3b8' }}>
            {scenarios.length} SCÉNARIOS
          </span>
          <div style={{ flex: 1, height: 1, background: '#e8eaed' }} />
        </div>

        {/* Liste verticale */}
        <div style={{ borderTop: '1px solid #e8eaed' }}>
          {scenarios.map((scenario, i) => {
            const Icon = getIcon(scenario.id);
            const isHovered = hoveredScenario === scenario.id;

            return (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => !scenario.comingSoon && setLocation(scenario.link)}
                onMouseEnter={() => setHoveredScenario(scenario.id)}
                onMouseLeave={() => setHoveredScenario(null)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 24,
                  padding: '24px 12px',
                  borderBottom: '1px solid #e8eaed',
                  cursor: scenario.comingSoon ? 'default' : 'pointer',
                  background: isHovered && !scenario.comingSoon ? '#f7f8fa' : '#ffffff',
                  transition: 'background 0.12s ease',
                  opacity: scenario.comingSoon ? 0.5 : 1,
                }}
              >
                {/* Left content */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        background: '#f7f8fa',
                        border: '1px solid #e8eaed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={13} color="#64748b" />
                    </div>
                    <span
                      style={{
                        fontFamily: SANS,
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#0f172a',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {scenario.title}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: 13,
                      color: '#64748b',
                      lineHeight: 1.6,
                      margin: 0,
                      maxWidth: 560,
                    }}
                  >
                    {scenario.description}
                  </p>

                  {/* Details */}
                  <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {scenario.details.map((detail, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontFamily: MONO,
                          fontSize: 10,
                          padding: '2px 6px',
                          background: '#f7f8fa',
                          color: '#94a3b8',
                          border: '1px solid #e8eaed',
                        }}
                      >
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA button */}
                <div style={{ display: 'flex', alignItems: 'center', alignSelf: 'center' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!scenario.comingSoon) setLocation(scenario.link);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '9px 16px',
                      background: scenario.comingSoon ? '#f7f8fa' : '#006a9e',
                      color: scenario.comingSoon ? '#94a3b8' : '#ffffff',
                      border: scenario.comingSoon ? '1px solid #e8eaed' : 'none',
                      cursor: scenario.comingSoon ? 'not-allowed' : 'pointer',
                      fontFamily: MONO,
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {scenario.comingSoon ? 'Bientôt' : 'Accéder'}
                    {!scenario.comingSoon && <ArrowRight size={11} />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoleplayHub;
