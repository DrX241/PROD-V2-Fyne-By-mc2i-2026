import { useEffect, useState, useRef } from 'react';

const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';

const AGENTS = {
  superviseur: { name: 'Superviseur IA', color: PINK,      initial: 'S', label: 'Supervision' },
  analyste:    { name: 'Analyste',       color: BLUE,      initial: 'A', label: 'Analyse' },
  pedagogue:   { name: 'Pédagogue',      color: '#7c3aed', initial: 'P', label: 'Pédagogie' },
  redacteur:   { name: 'Rédacteur',      color: '#059669', initial: 'R', label: 'Rédaction' },
  qcm:         { name: 'Agent QCM',      color: '#d97706', initial: 'Q', label: 'Évaluation' },
} as const;
type AgentKey = keyof typeof AGENTS;

const W = 560;
const H = 340;

const POS: Record<AgentKey, { x: number; y: number }> = {
  superviseur: { x: 280, y: 52  },
  analyste:    { x: 68,  y: 188 },
  pedagogue:   { x: 492, y: 188 },
  redacteur:   { x: 135, y: 316 },
  qcm:         { x: 425, y: 316 },
};

const CONNECTIONS: [AgentKey, AgentKey][] = [
  ['superviseur', 'analyste'],
  ['superviseur', 'pedagogue'],
  ['superviseur', 'redacteur'],
  ['superviseur', 'qcm'],
  ['analyste',    'pedagogue'],
  ['analyste',    'redacteur'],
  ['analyste',    'qcm'],
  ['pedagogue',   'qcm'],
  ['pedagogue',   'redacteur'],
  ['redacteur',   'qcm'],
];

const ACTIVITIES: Record<AgentKey, string[]> = {
  superviseur: [
    'Orchestration de l\'équipe en cours…',
    'Contrôle qualité pédagogique…',
    'Synchronisation des modules…',
    'Validation de la cohérence globale…',
  ],
  analyste: [
    'Décomposition des concepts clés…',
    'Analyse sémantique du contenu…',
    'Identification des prérequis…',
    'Extraction des points essentiels…',
  ],
  pedagogue: [
    'Structuration de l\'architecture pédagogique…',
    'Séquençage des apprentissages…',
    'Équilibrage théorie / pratique…',
    'Optimisation de la progression…',
  ],
  redacteur: [
    'Rédaction des slides théorie…',
    'Création des mises en pratique…',
    'Formulation des exemples concrets…',
    'Finalisation du contenu…',
  ],
  qcm: [
    'Génération des questions d\'évaluation…',
    'Conception des distracteurs…',
    'Calibrage de la difficulté…',
    'Validation des explications…',
  ],
};

interface Pulse {
  id: number;
  from: AgentKey;
  to: AgentKey;
  color: string;
  startTime: number;
  duration: number;
}

interface Props {
  mode?: 'prompt' | 'docs';
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

export default function AgentLoadingScreen({ mode = 'prompt' }: Props) {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [activeAgent, setActiveAgent] = useState<AgentKey>('superviseur');
  const [activityMsg, setActivityMsg] = useState(ACTIVITIES.superviseur[0]);
  const [, forceUpdate] = useState(0);

  const nextId = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastPulseRef = useRef(0);
  const nextIntervalRef = useRef(700);
  const pulsesRef = useRef<Pulse[]>([]);

  useEffect(() => {
    pulsesRef.current = pulses;
  }, [pulses]);

  useEffect(() => {
    const loop = (timestamp: number) => {
      const now = Date.now();

      // Spawn new pulse?
      if (now - lastPulseRef.current > nextIntervalRef.current) {
        lastPulseRef.current = now;
        nextIntervalRef.current = 550 + Math.random() * 600;

        const conn = CONNECTIONS[Math.floor(Math.random() * CONNECTIONS.length)];
        const [from, to] = (Math.random() > 0.5 ? conn : [conn[1], conn[0]]) as [AgentKey, AgentKey];
        const duration = 900 + Math.random() * 500;

        const pulse: Pulse = {
          id: nextId.current++,
          from, to,
          color: AGENTS[from].color,
          startTime: now,
          duration,
        };

        setPulses(prev => {
          const alive = prev.filter(p => now - p.startTime < p.duration + 100);
          return [...alive, pulse];
        });

        setActiveAgent(from);
        const msgs = ACTIVITIES[from];
        setActivityMsg(msgs[Math.floor(Math.random() * msgs.length)]);
      }

      forceUpdate(n => n + 1);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, []);

  const now = Date.now();
  const ag = AGENTS[activeAgent];
  const NODE_SIZE = 44;
  const HALF = NODE_SIZE / 2;

  return (
    <div style={{
      minHeight: '100vh', background: '#f8fafc',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>

      {/* Header */}
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 14px', background: `${PINK}10`, marginBottom: 12,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: PINK, display: 'inline-block',
            animation: 'nn-pulse 1.1s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: PINK, textTransform: 'uppercase' }}>
            Réseau d'agents · Génération en cours
          </span>
        </div>
        <div style={{ fontSize: 14, color: '#6b7280', minHeight: 22 }}>
          <span style={{ color: ag.color, fontWeight: 700 }}>{ag.name}</span>
          <span style={{ margin: '0 6px', color: '#d1d5db' }}>·</span>
          <span>{activityMsg}</span>
        </div>
      </div>

      {/* Network */}
      <div style={{ width: '100%', maxWidth: W }}>
        <svg
          width="100%"
          viewBox={`0 0 ${W} ${H}`}
          style={{ overflow: 'visible', display: 'block' }}
        >
          {/* Connection lines */}
          {CONNECTIONS.map(([a, b]) => {
            const pa = POS[a];
            const pb = POS[b];
            const active = pulses.some(p =>
              (p.from === a && p.to === b) || (p.from === b && p.to === a)
            );
            return (
              <line
                key={`line-${a}-${b}`}
                x1={pa.x} y1={pa.y}
                x2={pb.x} y2={pb.y}
                stroke={active ? '#c7d2da' : '#e5e7eb'}
                strokeWidth={active ? 1.5 : 1}
                strokeDasharray={active ? undefined : '3 5'}
              />
            );
          })}

          {/* Pulses */}
          {pulses.map(pulse => {
            const t = (now - pulse.startTime) / pulse.duration;
            if (t < 0 || t > 1) return null;
            const from = POS[pulse.from];
            const to = POS[pulse.to];
            const x = lerp(from.x, to.x, t);
            const y = lerp(from.y, to.y, t);
            const opacity = t < 0.12 ? t / 0.12 : t > 0.82 ? (1 - t) / 0.18 : 1;
            return (
              <g key={`pulse-${pulse.id}`}>
                <circle cx={x} cy={y} r={9} fill={pulse.color} opacity={opacity * 0.18} />
                <circle cx={x} cy={y} r={4.5} fill={pulse.color} opacity={opacity * 0.9} />
                <circle cx={x} cy={y} r={2} fill="white" opacity={opacity * 0.8} />
              </g>
            );
          })}

          {/* Nodes */}
          {(Object.keys(AGENTS) as AgentKey[]).map(key => {
            const a = AGENTS[key];
            const p = POS[key];
            const isSender   = pulses.some(pl => pl.from === key && (now - pl.startTime) / pl.duration < 0.25);
            const isReceiver = pulses.some(pl => pl.to === key   && (now - pl.startTime) / pl.duration > 0.75);
            const isActive   = key === activeAgent;
            const lit        = isSender || isReceiver || isActive;

            return (
              <g key={key} transform={`translate(${p.x - HALF}, ${p.y - HALF})`}>
                {/* Outer glow when active */}
                {lit && (
                  <rect
                    x={-5} y={-5}
                    width={NODE_SIZE + 10} height={NODE_SIZE + 10}
                    fill={`${a.color}18`}
                    stroke={a.color}
                    strokeWidth={1}
                  />
                )}
                {/* Node square */}
                <rect
                  width={NODE_SIZE} height={NODE_SIZE}
                  fill={isActive ? a.color : lit ? `${a.color}10` : 'white'}
                  stroke={a.color}
                  strokeWidth={lit ? 2 : 1.5}
                />
                {/* Initial */}
                <text
                  x={HALF} y={HALF + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={15} fontWeight={800}
                  fill={isActive ? 'white' : a.color}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {a.initial}
                </text>
                {/* Label */}
                <text
                  x={HALF} y={NODE_SIZE + 14}
                  textAnchor="middle"
                  fontSize={9.5} fontWeight={600}
                  fill={lit ? a.color : '#9ca3af'}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {a.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Pulse count indicator */}
      <div style={{ marginTop: 24, display: 'flex', gap: 6, alignItems: 'center' }}>
        {pulses.filter(p => (now - p.startTime) / p.duration < 1).map(p => (
          <div key={p.id} style={{
            width: 6, height: 6,
            background: p.color,
            opacity: 0.6,
            transition: 'opacity 0.3s',
          }} />
        ))}
      </div>

      <style>{`
        @keyframes nn-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
}
