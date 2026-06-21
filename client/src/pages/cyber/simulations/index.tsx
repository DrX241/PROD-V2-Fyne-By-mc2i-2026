import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, AlertTriangle, BrainCircuit, Terminal, Cpu } from 'lucide-react';

const SANS = "'Plus Jakarta Sans', sans-serif";
const MONO = "'JetBrains Mono', monospace";

const SIMULATIONS = [
  {
    id: 'crisis',
    title: 'Je suis RSSI',
    sub: 'Gestion de crise cyber en temps réel',
    description: "Prenez les décisions stratégiques lors d'une cyberattaque majeure. Communication interne, remédiation, médias — tout va vite.",
    route: '/cyber/crisis-management',
    icon: AlertTriangle,
    accent: '#ef4444',
    tags: ['Ransomware', 'Décisions temps réel', 'Communication de crise'],
    badge: 'Avancé',
  },
  {
    id: 'comex',
    title: 'Je suis Membre du COMEX',
    sub: 'Enjeux stratégiques de cybersécurité',
    description: 'Comprenez les risques numériques au niveau direction. Budgets, conformité, priorisation des investissements sécurité.',
    route: '/cyber/comex-training',
    icon: BrainCircuit,
    accent: '#8b5cf6',
    tags: ['Gouvernance', 'Conformité', 'Risques stratégiques'],
    badge: 'Direction',
  },
  {
    id: 'pentest',
    title: 'Je suis Expert Pentest',
    sub: 'Exploitation de vulnérabilités en lab sécurisé',
    description: 'Environnement complet pour pratiquer XSS, injection SQL, escalade de privilèges dans un cadre légal et pédagogique.',
    route: '/cyber/pentest-lab',
    icon: Terminal,
    accent: '#06b6d4',
    tags: ['XSS', 'SQL Injection', 'Privilege Escalation'],
    badge: 'Expert',
  },
  {
    id: 'cyber-lab',
    title: 'Cyber Lab',
    sub: "Atelier d'expérimentation pratique",
    description: "Environnement sandbox pour tester vos scripts, analyser du trafic réseau et expérimenter avec l'assistant IA cyber.",
    route: '/cyber/cyber-lab',
    icon: Cpu,
    accent: '#10b981',
    tags: ['Sandbox', 'Analyse réseau', 'Assistant IA'],
    badge: 'Lab',
  },
];

export default function CyberSimulations() {
  const [, setLocation] = useLocation();
  const [hoveredSim, setHoveredSim] = useState<string | null>(null);

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
            SIMULER
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
            Simulations
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
            Immergez-vous dans des scénarios réalistes. Gestion de crise, pentest en conditions réelles, formation COMEX — choisissez votre mission.
          </p>
        </motion.div>

        {/* Section separator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <span style={{ fontFamily: MONO, fontSize: 10, textTransform: 'uppercase', color: '#94a3b8' }}>
            {SIMULATIONS.length} SIMULATIONS
          </span>
          <div style={{ flex: 1, height: 1, background: '#e8eaed' }} />
        </div>

        {/* Grid 2 colonnes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1,
            background: '#e8eaed',
          }}
        >
          {SIMULATIONS.map((sim, i) => {
            const Icon = sim.icon;
            const isHovered = hoveredSim === sim.id;

            return (
              <motion.div
                key={sim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setLocation(sim.route)}
                onMouseEnter={() => setHoveredSim(sim.id)}
                onMouseLeave={() => setHoveredSim(null)}
                style={{
                  background: isHovered ? '#f7f8fa' : '#ffffff',
                  padding: '24px',
                  cursor: 'pointer',
                  position: 'relative',
                  borderLeft: `4px solid ${sim.accent}`,
                  transition: 'background 0.12s ease',
                }}
              >
                {/* Badge + Icon row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      background: `${sim.accent}12`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={16} color={sim.accent} />
                  </div>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 7px',
                      background: `${sim.accent}10`,
                      color: sim.accent,
                      border: `1px solid ${sim.accent}25`,
                      borderRadius: 0,
                    }}
                  >
                    {sim.badge}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: SANS,
                    fontWeight: 700,
                    fontSize: 15,
                    color: '#0f172a',
                    margin: '0 0 4px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {sim.title}
                </h3>
                <p
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    color: sim.accent,
                    margin: '0 0 8px',
                  }}
                >
                  {sim.sub}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: '#64748b',
                    lineHeight: 1.6,
                    margin: '0 0 16px',
                  }}
                >
                  {sim.description}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 20 }}>
                  {sim.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        padding: '2px 6px',
                        background: '#f7f8fa',
                        color: '#94a3b8',
                        border: '1px solid #e8eaed',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 16,
                    borderTop: '1px solid #e8eaed',
                  }}
                >
                  <span
                    style={{
                      fontFamily: SANS,
                      fontSize: 13,
                      fontWeight: 600,
                      color: isHovered ? sim.accent : '#64748b',
                    }}
                  >
                    Accéder à la simulation
                  </span>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      background: isHovered ? sim.accent : '#f7f8fa',
                      border: '1px solid #e8eaed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ChevronRight size={13} color={isHovered ? '#fff' : '#94a3b8'} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
