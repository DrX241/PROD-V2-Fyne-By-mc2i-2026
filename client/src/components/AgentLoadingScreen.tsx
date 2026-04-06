import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';

const AGENTS = {
  analyste:    { name: 'Agent Analyste',   color: BLUE,      initial: 'A' },
  pedagogue:   { name: 'Agent Pédagogue',  color: '#7c3aed', initial: 'P' },
  redacteur:   { name: 'Agent Rédacteur',  color: '#059669', initial: 'R' },
  qcm:         { name: 'Agent QCM',        color: '#d97706', initial: 'Q' },
  superviseur: { name: 'Superviseur IA',   color: PINK,      initial: 'S' },
} as const;

type AgentKey = keyof typeof AGENTS;

interface AgentMessage {
  from: AgentKey;
  to: string;
  text: string;
  delay: number;
}

const MESSAGES_PROMPT: AgentMessage[] = [
  { from: 'analyste',    to: 'Équipe',       text: 'Analyse du pitch en cours… Je décompose les concepts clés à couvrir.', delay: 0 },
  { from: 'pedagogue',   to: 'Analyste',     text: 'Reçu. Je structure l\'architecture : intro + slides théorie/pratique + conclusion.', delay: 2000 },
  { from: 'analyste',    to: 'Pédagogue',    text: 'Profil apprenant identifié. Adapte le niveau de langage et les exemples en conséquence.', delay: 4000 },
  { from: 'redacteur',   to: 'Pédagogue',    text: 'Je démarre la rédaction des slides. Combien de théorie dois-je prévoir ?', delay: 5800 },
  { from: 'pedagogue',   to: 'Rédacteur',    text: '3 slides théorie alternées avec 3 mises en pratique. Inclure des exemples terrain.', delay: 7400 },
  { from: 'qcm',         to: 'Équipe',       text: 'Je prépare 5 questions QCM avec distracteurs pertinents basés sur les concepts clés.', delay: 9200 },
  { from: 'redacteur',   to: 'QCM',          text: 'Slides finalisées. Je vous transmets les points centraux pour les questions.', delay: 11000 },
  { from: 'superviseur', to: 'Équipe',       text: 'Vérification qualité : cohérence pédagogique, clarté, progressivité…', delay: 13000 },
  { from: 'superviseur', to: 'Équipe',       text: '✓ Leçon validée. Compilation et sauvegarde en cours.', delay: 15000 },
];

const MESSAGES_DOCS: AgentMessage[] = [
  { from: 'analyste',    to: 'Équipe',       text: 'Analyse des documents fournis… Extraction du contenu sémantique.', delay: 0 },
  { from: 'pedagogue',   to: 'Analyste',     text: 'Je reçois les données. J\'identifie la structure pédagogique optimale.', delay: 2000 },
  { from: 'analyste',    to: 'Pédagogue',    text: 'Contenu riche détecté. Priorité aux concepts les plus actionnables.', delay: 4000 },
  { from: 'redacteur',   to: 'Pédagogue',    text: 'Démarrage de la mise en forme en slides. Théorie puis mise en pratique.', delay: 5800 },
  { from: 'pedagogue',   to: 'Rédacteur',    text: 'Valide. Alterne exposition théorique et application concrète pour chaque thème.', delay: 7400 },
  { from: 'qcm',         to: 'Équipe',       text: 'Extraction des éléments évaluables… Génération des 5 questions QCM en cours.', delay: 9200 },
  { from: 'redacteur',   to: 'QCM',          text: 'Slides prêtes. Je vous transmets les points clés pour le quiz de validation.', delay: 11000 },
  { from: 'superviseur', to: 'Équipe',       text: 'Contrôle final : cohérence avec les sources, clarté des consignes pratiques…', delay: 13000 },
  { from: 'superviseur', to: 'Équipe',       text: '✓ Leçon validée. Sauvegarde et préparation du player en cours.', delay: 15000 },
];

interface Props {
  mode?: 'prompt' | 'docs';
}

export default function AgentLoadingScreen({ mode = 'prompt' }: Props) {
  const messages = mode === 'docs' ? MESSAGES_DOCS : MESSAGES_PROMPT;
  const [visible, setVisible] = useState<number[]>([]);
  const [typing, setTyping] = useState<number | null>(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    messages.forEach((msg, i) => {
      timers.push(setTimeout(() => {
        setTyping(i);
      }, msg.delay));
      timers.push(setTimeout(() => {
        setVisible(prev => [...prev, i]);
        setTyping(i + 1 < messages.length ? i + 1 : null);
      }, msg.delay + 900));
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: `${PINK}10`, marginBottom: 12 }}>
          <span style={{ width: 6, height: 6, background: PINK, borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: PINK, textTransform: 'uppercase' }}>
            Équipe IA · Génération en cours
          </span>
        </div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: DARK }}>Vos agents travaillent sur la leçon</h2>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6b7280' }}>Chaque agent prend en charge une partie de la création…</p>
      </div>

      {/* Agents roster */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        {(Object.keys(AGENTS) as AgentKey[]).map(key => {
          const ag = AGENTS[key];
          const isActive = typing !== null && messages[typing]?.from === key;
          const hasDone = visible.some(i => messages[i].from === key);
          return (
            <div key={key} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
              border: `1px solid ${isActive ? ag.color : hasDone ? `${ag.color}50` : '#e5e7eb'}`,
              background: isActive ? `${ag.color}10` : 'white',
              transition: 'all 0.3s',
            }}>
              <div style={{
                width: 28, height: 28, background: isActive ? ag.color : hasDone ? `${ag.color}30` : '#f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: isActive ? 'white' : hasDone ? ag.color : '#9ca3af',
                transition: 'all 0.3s',
              }}>
                {ag.initial}
              </div>
              <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? ag.color : '#6b7280', whiteSpace: 'nowrap' }}>
                {ag.name}
              </span>
              {isActive && (
                <span style={{ display: 'flex', gap: 2 }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 4, height: 4, background: ag.color, borderRadius: '50%',
                      animation: `bounce 0.9s ease-in-out ${i * 0.15}s infinite`,
                    }} />
                  ))}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Chat panel */}
      <div style={{ width: '100%', maxWidth: 580, border: '1px solid #e5e7eb', background: 'white' }}>
        {/* Panel header */}
        <div style={{ borderBottom: '1px solid #f3f4f6', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ width: 8, height: 8, background: '#e5e7eb' }} />
            <div style={{ width: 8, height: 8, background: '#e5e7eb' }} />
            <div style={{ width: 8, height: 8, background: '#e5e7eb' }} />
          </div>
          <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, letterSpacing: 1 }}>CANAL · FYNE STUDIO</span>
        </div>

        {/* Messages */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 320, maxHeight: 360, overflowY: 'auto' }}>
          <AnimatePresence>
            {visible.map(i => {
              const msg = messages[i];
              const ag = AGENTS[msg.from];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}
                >
                  <div style={{
                    width: 30, height: 30, background: ag.color, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: 'white',
                  }}>
                    {ag.initial}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: ag.color }}>{ag.name}</span>
                      <span style={{ fontSize: 10, color: '#9ca3af' }}>→ {msg.to}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.55, padding: '8px 12px', background: '#f9fafb', borderLeft: `2px solid ${ag.color}` }}>
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicator */}
          {typing !== null && typing < messages.length && (
            <motion.div
              key={`typing-${typing}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', gap: 10, alignItems: 'center' }}
            >
              <div style={{
                width: 30, height: 30, background: `${AGENTS[messages[typing].from].color}20`, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: AGENTS[messages[typing].from].color,
                border: `1px solid ${AGENTS[messages[typing].from].color}40`,
              }}>
                {AGENTS[messages[typing].from].initial}
              </div>
              <div style={{ display: 'flex', gap: 4, padding: '8px 12px', background: '#f9fafb', border: '1px solid #f3f4f6' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 6, height: 6, background: '#9ca3af', borderRadius: '50%',
                    animation: `bounce 0.9s ease-in-out ${i * 0.15}s infinite`,
                  }} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
