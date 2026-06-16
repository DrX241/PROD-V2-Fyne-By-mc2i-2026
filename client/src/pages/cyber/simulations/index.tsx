import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, AlertTriangle, BrainCircuit, Terminal, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SIMULATIONS = [
  {
    id: 'crisis',
    title: 'Je suis RSSI',
    sub: 'Gestion de crise cyber en temps réel',
    description: 'Prenez les décisions stratégiques lors d\'une cyberattaque majeure. Communication interne, remédiation, médias — tout va vite.',
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
    sub: 'Atelier d\'expérimentation pratique',
    description: 'Environnement sandbox pour tester vos scripts, analyser du trafic réseau et expérimenter avec l\'assistant IA cyber.',
    route: '/cyber/cyber-lab',
    icon: Cpu,
    accent: '#10b981',
    tags: ['Sandbox', 'Analyse réseau', 'Assistant IA'],
    badge: 'Lab',
  },
];

export default function CyberSimulations() {
  const [, setLocation] = useLocation();

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: '#020817',
        backgroundImage: 'linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Back */}
        <button
          onClick={() => setLocation('/cyber')}
          className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors mb-10 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour vers I AM CYBER
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-xs tracking-widest text-red-400 font-semibold"
              style={{ fontFamily: "'Orbitron',monospace" }}
            >
              SIMULER
            </span>
            <div className="h-px flex-1 bg-red-500/20" />
          </div>
          <h1
            className="text-4xl font-black text-white mb-3"
            style={{ fontFamily: "'Orbitron',monospace" }}
          >
            SIMULATIONS
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Immergez-vous dans des scénarios réalistes. Gestion de crise, pentest en conditions réelles, formation COMEX — choisissez votre mission.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SIMULATIONS.map((sim, i) => {
            const Icon = sim.icon;
            return (
              <motion.div
                key={sim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl p-6 flex flex-col gap-4 cursor-pointer group transition-all duration-200"
                style={{
                  background: `radial-gradient(ellipse at 30% 30%, ${sim.accent}15 0%, transparent 60%), #0a0f1e`,
                  border: `1px solid ${sim.accent}30`,
                }}
                onClick={() => setLocation(sim.route)}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = sim.accent + '70';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${sim.accent}25`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = sim.accent + '30';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl" style={{ background: sim.accent + '20', border: `1px solid ${sim.accent}40` }}>
                    <Icon className="w-6 h-6" style={{ color: sim.accent }} />
                  </div>
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: sim.accent + '20', color: sim.accent, border: `1px solid ${sim.accent}40`, fontFamily: "'Orbitron',monospace" }}
                  >
                    {sim.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-white font-bold text-lg mb-0.5">{sim.title}</h3>
                  <p className="text-sm mb-2" style={{ color: sim.accent }}>{sim.sub}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{sim.description}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {sim.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.07)' }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 mt-auto group-hover:opacity-100"
                  style={{ background: sim.accent + '20', color: sim.accent, border: `1px solid ${sim.accent}50` }}
                >
                  Accéder à la simulation
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
