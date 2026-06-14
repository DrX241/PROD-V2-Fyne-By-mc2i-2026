import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useRoute } from 'wouter';
import {
  ArrowLeft, ArrowRight, Check, Lock, Award, Loader2,
  BookOpen, CheckSquare, AlignLeft, Dumbbell, Users,
  Sparkles, Send, ChevronRight, X, Download,
  MessageSquare, Lightbulb, Target, Clock, ChevronDown,
  Play, RotateCcw
} from 'lucide-react';

type ModuleType = 'cours' | 'qcm' | 'texte_a_trous' | 'exercice_libre' | 'roleplay';

interface TrainingModule {
  id: number;
  path_id: number;
  position: number;
  type: ModuleType;
  title: string;
  content: any;
  is_certification: boolean;
}

interface TrainingPath {
  id: number;
  title: string;
  description: string;
  cover_color: string;
  cover_emoji: string;
  certification_min_score: number;
  estimated_minutes: number;
}

interface Progress {
  module_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  answers?: any;
}

const TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; darkBg: string }> = {
  cours:          { label: 'Cours',         icon: <BookOpen size={15} />,    color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  darkBg: 'rgba(96,165,250,0.06)' },
  qcm:            { label: 'QCM',           icon: <CheckSquare size={15} />, color: '#00f5a0', bg: 'rgba(0,245,160,0.1)',   darkBg: 'rgba(0,245,160,0.06)' },
  texte_a_trous:  { label: 'Exercice',      icon: <AlignLeft size={15} />,   color: '#f6ab2f', bg: 'rgba(246,171,47,0.1)',  darkBg: 'rgba(246,171,47,0.06)' },
  exercice_libre: { label: 'Pratique',      icon: <Dumbbell size={15} />,    color: '#c084fc', bg: 'rgba(192,132,252,0.1)', darkBg: 'rgba(192,132,252,0.06)' },
  roleplay:       { label: 'Simulation IA', icon: <Users size={15} />,       color: '#f472b6', bg: 'rgba(244,114,182,0.1)', darkBg: 'rgba(244,114,182,0.06)' },
  certification:  { label: 'Certification', icon: <Award size={15} />,       color: '#f6ab2f', bg: 'rgba(246,171,47,0.1)',  darkBg: 'rgba(246,171,47,0.06)' },
};

function getMeta(mod: TrainingModule) {
  return TYPE_META[mod.is_certification ? 'certification' : mod.type] || TYPE_META['cours'];
}

// ─── COACH IA PANEL ───────────────────────────────────────────────────────────

function CoachPanel({ module: mod, path, onClose }: { module: TrainingModule; path: TrainingPath; onClose: () => void }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: `Bonjour ! Je suis votre coach IA pour ce module **"${mod.title}"**.\n\nJe suis là pour vous aider à comprendre les concepts, répondre à vos questions, et vous guider si vous bloquez. Qu'est-ce qui n'est pas clair ?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMsg = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    setMessages(p => [...p, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const systemPrompt = `Tu es un coach pédagogique expert et bienveillant. L'apprenant suit le module "${mod.title}" dans la formation "${path.title}".
Contexte du module : ${JSON.stringify(mod.content).substring(0, 600)}
Ton rôle : aider l'apprenant à comprendre, pas lui donner les réponses directement.
- Reformule les concepts difficiles avec des analogies
- Pose des questions de Socrate pour guider la réflexion
- Encourage et valorise les bonnes intuitions
- Si l'apprenant bloque sur un exercice, donne des indices progressifs
- Reste concis (max 3-4 phrases par réponse)`;
      const r = await fetch('/api/client/training/ai/chat', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text.replace(/\*\*/g, '') })),
            { role: 'user', content: msg }
          ]
        }),
      });
      const d = await r.json();
      if (d.success) setMessages(p => [...p, { role: 'ai', text: d.reply }]);
    } finally { setLoading(false); }
  };

  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {parts.map((p, j) => p.startsWith('**') && p.endsWith('**')
            ? <strong key={j} style={{ color: '#f8fafc' }}>{p.slice(2, -2)}</strong>
            : <span key={j}>{p}</span>
          )}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 360, background: '#060b12', borderLeft: '1px solid rgba(0,87,255,0.2)', display: 'flex', flexDirection: 'column', zIndex: 50, boxShadow: '-20px 0 60px rgba(0,0,0,0.5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #0057ff, #00b4d8)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles size={16} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>Coach IA</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: "'DM Mono',monospace" }}>Disponible pour vous aider</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 6, display: 'flex', borderRadius: 6, transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'}>
          <X size={16} />
        </button>
      </div>

      {/* Quick prompts */}
      <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {["Je ne comprends pas", "Donne-moi un exemple", "Aide-moi à débloquer"].map(q => (
          <button key={q} onClick={() => { setInput(q); }}
            style={{ fontSize: 11, background: 'rgba(0,87,255,0.1)', border: '1px solid rgba(0,87,255,0.2)', borderRadius: 20, padding: '4px 10px', color: '#60a5fa', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,87,255,0.18)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,87,255,0.1)'}>
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 13 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 9, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'ai' && (
              <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #0057ff, #00b4d8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <Sparkles size={11} color="#fff" />
              </div>
            )}
            <div style={{ maxWidth: '84%', padding: '10px 14px', borderRadius: m.role === 'user' ? '13px 13px 3px 13px' : '3px 13px 13px 13px', background: m.role === 'user' ? '#0057ff' : 'rgba(255,255,255,0.05)', border: m.role === 'ai' ? '1px solid rgba(255,255,255,0.07)' : 'none', color: m.role === 'user' ? '#fff' : 'rgba(255,255,255,0.72)', fontSize: 13.5, lineHeight: 1.7 }}>
              {renderText(m.text)}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 9 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #0057ff, #00b4d8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={11} color="#fff" />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '3px 13px 13px 13px', padding: '12px 16px', display: 'flex', gap: 5 }}>
              {[0,1,2].map(j => <span key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: '#0057ff', display: 'block', animation: `pulse 1s ${j*0.18}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8, flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} placeholder="Posez votre question…"
          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '10px 13px', color: '#f8fafc', fontSize: 13, outline: 'none', fontFamily: "'DM Sans',sans-serif" }} />
        <button onClick={sendMsg} disabled={!input.trim() || loading}
          style={{ width: 38, height: 38, background: input.trim() ? '#0057ff' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 9, cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}>
          <Send size={15} color={input.trim() ? '#fff' : 'rgba(255,255,255,0.25)'} />
        </button>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}`}</style>
    </div>
  );
}

// ─── MAIN PLAYER ──────────────────────────────────────────────────────────────

export default function PlayerPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/portail-client/formation/:pathId');
  const pathId = params?.pathId ? parseInt(params.pathId) : null;

  const [authChecked, setAuthChecked] = useState(false);
  const [path, setPath] = useState<TrainingPath | null>(null);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [certification, setCertification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCoach, setShowCoach] = useState(false);

  const [slideIdx, setSlideIdx] = useState(-1);
  const [sliding, setSliding] = useState(false);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right');
  const [slideVisible, setSlideVisible] = useState(true);

  // Module state
  const [qcmAnswers, setQcmAnswers] = useState<Record<number, number>>({});
  const [qcmSubmitted, setQcmSubmitted] = useState(false);
  const [blanksAnswers, setBlanksAnswers] = useState<Record<string, string>>({});
  const [blanksSubmitted, setBlanksSubmitted] = useState(false);
  const [freeText, setFreeText] = useState('');
  const [freeSubmitted, setFreeSubmitted] = useState(false);
  const [rpMessages, setRpMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [rpInput, setRpInput] = useState('');
  const [rpLoading, setRpLoading] = useState(false);
  const [certAnswers, setCertAnswers] = useState<Record<number, number>>({});
  const [certResult, setCertResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [coursReadPct, setCoursReadPct] = useState(0);
  const rpEndRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/client/auth/check', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (!d.authenticated) { setLocation('/portail-client/login'); return; } setAuthChecked(true); });
  }, []);

  useEffect(() => {
    if (!authChecked || !pathId) return;
    fetch(`/api/client/training/paths/${pathId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) { setPath(d.path); setModules(d.modules); setProgress(d.progress || []); setCertification(d.certification); }
        else setLocation('/portail-client/accueil');
      })
      .finally(() => setLoading(false));
  }, [authChecked, pathId]);

  useEffect(() => { rpEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [rpMessages]);

  // Track scroll progress for cours
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onScroll = () => {
      const pct = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100) || 0;
      setCoursReadPct(Math.min(100, pct));
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [slideIdx]);

  const getProgress = (modId: number) => progress.find(p => p.module_id === modId);
  const isUnlocked = (idx: number) => idx === 0 || getProgress(modules[idx - 1]?.id)?.status === 'completed';
  const completedCount = modules.filter(m => getProgress(m.id)?.status === 'completed').length;
  const totalProgress = modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0;

  const saveProgress = async (moduleId: number, status: string, score?: number, answers?: any) => {
    const r = await fetch('/api/client/training/progress', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path_id: pathId, module_id: moduleId, status, score, answers }),
    });
    const d = await r.json();
    if (d.success) {
      setProgress(prev => {
        const updated = { module_id: moduleId, status: status as any, score, answers };
        const existing = prev.findIndex(p => p.module_id === moduleId);
        if (existing >= 0) { const n = [...prev]; n[existing] = updated; return n; }
        return [...prev, updated];
      });
    }
  };

  const goToSlide = (newIdx: number) => {
    if (sliding) return;
    const dir = newIdx > slideIdx ? 'right' : 'left';
    setSlideDir(dir);
    setSliding(true);
    setSlideVisible(false);
    setShowCoach(false);
    setTimeout(() => {
      setSlideIdx(newIdx);
      resetModuleState();
      setSlideVisible(true);
      setSliding(false);
      if (newIdx >= 0) {
        const mod = modules[newIdx];
        if (mod && getProgress(mod.id)?.status !== 'completed') saveProgress(mod.id, 'in_progress');
        if (modules[newIdx]?.type === 'roleplay') {
          const m = modules[newIdx];
          const opening = m.content?.opening_message || `Bonjour ! Je suis ${m.content?.ai_persona?.name || 'votre interlocuteur'}. ${m.content?.scenario || ''}`;
          setRpMessages([{ role: 'ai', text: opening }]);
        }
      }
    }, 320);
  };

  const resetModuleState = () => {
    setQcmAnswers({}); setQcmSubmitted(false);
    setBlanksAnswers({}); setBlanksSubmitted(false);
    setFreeText(''); setFreeSubmitted(false);
    setRpMessages([]); setRpInput('');
    setCertAnswers({}); setCertResult(null);
    setCoursReadPct(0);
  };

  const submitQcm = async () => {
    const mod = modules[slideIdx];
    const qs = mod.content?.questions || [];
    const correct = qs.filter((q: any, i: number) => qcmAnswers[i] === q.correct_index).length;
    const score = qs.length > 0 ? Math.round((correct / qs.length) * 100) : 0;
    setQcmSubmitted(true);
    await saveProgress(mod.id, 'completed', score, qcmAnswers);
  };

  const submitBlanks = async () => {
    const mod = modules[slideIdx];
    const blanks = mod.content?.blanks || [];
    const correct = blanks.filter((b: any) => (blanksAnswers[b.id] || '').trim().toLowerCase() === b.answer.toLowerCase()).length;
    const score = blanks.length > 0 ? Math.round((correct / blanks.length) * 100) : 0;
    setBlanksSubmitted(true);
    await saveProgress(mod.id, 'completed', score, blanksAnswers);
  };

  const submitFree = async () => {
    if (!freeText.trim()) return;
    setFreeSubmitted(true);
    await saveProgress(modules[slideIdx].id, 'completed', 100, { response: freeText });
  };

  const completeCours = async () => {
    await saveProgress(modules[slideIdx].id, 'completed', 100);
  };

  const sendRoleplay = async () => {
    if (!rpInput.trim() || rpLoading) return;
    const mod = modules[slideIdx];
    const msg = rpInput.trim();
    setRpInput('');
    setRpMessages(p => [...p, { role: 'user', text: msg }]);
    setRpLoading(true);
    try {
      const sp = mod.content?.ai_persona?.system_prompt || `Tu es ${mod.content?.ai_persona?.name}. ${mod.content?.ai_persona?.personality || ''}`;
      const r = await fetch('/api/client/training/ai/chat', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: sp },
            ...rpMessages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
            { role: 'user', content: msg }
          ]
        }),
      });
      const d = await r.json();
      if (d.success) setRpMessages(p => [...p, { role: 'ai', text: d.reply }]);
    } finally { setRpLoading(false); }
  };

  const submitCert = async () => {
    const mod = modules[slideIdx];
    const qs = mod.content?.questions || [];
    if (Object.keys(certAnswers).length < qs.length) return;
    setSubmitting(true);
    try {
      const r = await fetch('/api/client/training/certify', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path_id: pathId, answers: qs.map((_: any, i: number) => certAnswers[i] ?? -1) }),
      });
      const d = await r.json();
      if (d.success) { setCertResult(d); setCertification({ score: d.score, passed: d.passed }); }
    } finally { setSubmitting(false); }
  };

  if (!authChecked || loading) {
    return (
      <div style={{ background: '#02040a', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={26} style={{ color: '#0057ff', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }
  if (!path) return null;

  const currentMod = slideIdx >= 0 ? modules[slideIdx] : null;
  const currentMeta = currentMod ? getMeta(currentMod) : null;
  const currentProg = currentMod ? getProgress(currentMod.id) : null;
  const isDone = currentProg?.status === 'completed';
  const isLast = slideIdx === modules.length - 1;
  const coachTarget = currentMod;

  // ─── COVER SLIDE ──────────────────────────────────────────────────────────────

  const coverSlide = (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 30% 40%, ${path.cover_color}20 0%, transparent 55%), radial-gradient(ellipse at 75% 15%, ${path.cover_color}12 0%, transparent 45%)` }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />

      <div style={{ position: 'relative', textAlign: 'center', maxWidth: 780, padding: '0 60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginBottom: 28, position: 'relative' }}>
          <div style={{ position: 'absolute', inset: -24, background: `radial-gradient(circle, ${path.cover_color}18 0%, transparent 65%)`, borderRadius: '50%' }} />
          <div style={{ fontSize: 90, lineHeight: 1, filter: `drop-shadow(0 0 28px ${path.cover_color}55)` }}>{path.cover_emoji}</div>
        </div>
        <h1 style={{ fontSize: 'clamp(30px,5vw,58px)', fontWeight: 900, color: '#f8fafc', margin: '0 0 16px', letterSpacing: '-0.04em', lineHeight: 1.0 }}>{path.title}</h1>
        {path.description && <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', margin: '0 0 36px', lineHeight: 1.7, maxWidth: 560 }}>{path.description}</p>}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 42, flexWrap: 'wrap' }}>
          {[
            { icon: <Target size={14} />, label: `${modules.length} modules` },
            { icon: <Clock size={14} />, label: `${path.estimated_minutes} min` },
            { icon: <Award size={14} />, label: `Certification ${path.certification_min_score}%` },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 9, padding: '9px 16px', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600 }}>
              <span style={{ color: path.cover_color }}>{icon}</span> {label}
            </div>
          ))}
        </div>

        {/* Module roadmap */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 44, maxWidth: 560, width: '100%' }}>
          {modules.map((mod, i) => {
            const meta = getMeta(mod);
            const done = getProgress(mod.id)?.status === 'completed';
            return (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: done ? '#00f5a0' : meta.bg, border: `1px solid ${done ? '#00f5a0' : meta.color + '40'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: done ? '#02040a' : meta.color, transition: 'all 0.3s' }}>
                    {done ? <Check size={16} /> : meta.icon}
                  </div>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: "'DM Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{meta.label}</span>
                </div>
                {i < modules.length - 1 && <div style={{ flex: 1, height: 1, background: done ? '#00f5a033' : 'rgba(255,255,255,0.07)', margin: '0 4px 16px' }} />}
              </React.Fragment>
            );
          })}
        </div>

        {certification?.passed && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(0,245,160,0.08)', border: '1px solid rgba(0,245,160,0.2)', borderRadius: 10, padding: '10px 18px', marginBottom: 28 }}>
            <Award size={16} color="#00f5a0" />
            <span style={{ color: '#00f5a0', fontWeight: 700, fontSize: 13 }}>Certifié · {certification.score}%</span>
            <button onClick={() => window.open(`/api/client/training/attestation/${pathId}`, '_blank')} style={{ background: '#00f5a0', border: 'none', borderRadius: 5, padding: '3px 10px', color: '#02040a', fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Download size={10} /> PDF
            </button>
          </div>
        )}

        <button onClick={() => goToSlide(0)} style={{ background: path.cover_color, border: 'none', borderRadius: 14, padding: '18px 48px', fontSize: 17, fontWeight: 900, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: `0 0 36px ${path.cover_color}45, 0 8px 28px ${path.cover_color}30`, letterSpacing: '-0.01em', transition: 'all 0.15s', fontFamily: "'DM Sans',sans-serif" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 50px ${path.cover_color}60, 0 12px 36px ${path.cover_color}40`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 36px ${path.cover_color}45, 0 8px 28px ${path.cover_color}30`; }}>
          <Play size={20} /> {totalProgress > 0 ? 'Continuer la formation' : 'Commencer la formation'}
        </button>
      </div>
    </div>
  );

  // ─── MODULE SLIDE ─────────────────────────────────────────────────────────────

  const moduleSlide = currentMod && currentMeta ? (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Tint bg */}
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 85% 10%, ${currentMeta.color}06 0%, transparent 45%)`, pointerEvents: 'none', zIndex: 0 }} />

      {/* Module sub-header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 48px', height: 52, borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0, background: 'rgba(2,4,10,0.5)', backdropFilter: 'blur(8px)', position: 'relative', zIndex: 2 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: currentMeta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentMeta.color }}>{currentMeta.icon}</div>
        <span style={{ fontWeight: 800, fontSize: 13.5, color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.01em' }}>{currentMod.title}</span>
        <span style={{ fontSize: 10, color: currentMeta.color, fontFamily: "'DM Mono',monospace", background: currentMeta.bg, padding: '2px 8px', borderRadius: 3, border: `1px solid ${currentMeta.color}20` }}>{currentMeta.label}</span>
        {isDone && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#00f5a0', background: 'rgba(0,245,160,0.08)', border: '1px solid rgba(0,245,160,0.18)', padding: '2px 8px', borderRadius: 3, fontFamily: "'DM Mono',monospace" }}><Check size={9} /> Complété</span>}
        <div style={{ flex: 1 }} />
        {/* Coach button — always visible */}
        {!showCoach && (
          <button onClick={() => setShowCoach(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,87,255,0.1)', border: '1px solid rgba(0,87,255,0.25)', borderRadius: 7, padding: '5px 12px', color: '#60a5fa', cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,87,255,0.18)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,87,255,0.1)'; }}>
            <Sparkles size={13} /> Coach IA
          </button>
        )}
      </div>

      {/* Content */}
      <div ref={contentRef} style={{ flex: 1, overflowY: 'auto', padding: `36px ${showCoach ? 420 : 64}px 56px`, position: 'relative', zIndex: 1, transition: 'padding 0.3s ease' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {currentMod.type === 'cours' && !currentMod.is_certification && <CoursSlide mod={currentMod} done={isDone} readPct={coursReadPct} onComplete={completeCours} />}
          {currentMod.type === 'qcm' && !currentMod.is_certification && <QcmSlide mod={currentMod} answers={qcmAnswers} submitted={qcmSubmitted} onAnswer={(qi, ai) => setQcmAnswers(p => ({ ...p, [qi]: ai }))} onSubmit={submitQcm} />}
          {currentMod.type === 'texte_a_trous' && <BlanksSlide mod={currentMod} answers={blanksAnswers} submitted={blanksSubmitted} onAnswer={(id, v) => setBlanksAnswers(p => ({ ...p, [id]: v }))} onSubmit={submitBlanks} />}
          {currentMod.type === 'exercice_libre' && <FreeSlide mod={currentMod} text={freeText} submitted={freeSubmitted} onChange={setFreeText} onSubmit={submitFree} />}
          {currentMod.type === 'roleplay' && <RoleplaySlide mod={currentMod} messages={rpMessages} input={rpInput} loading={rpLoading} done={isDone} onInput={setRpInput} onSend={sendRoleplay} onComplete={() => saveProgress(currentMod.id, 'completed', 100)} endRef={rpEndRef} />}
          {currentMod.is_certification && <CertSlide mod={currentMod} path={path} answers={certAnswers} result={certResult} submitting={submitting} existingCert={certification} onAnswer={(qi, ai) => setCertAnswers(p => ({ ...p, [qi]: ai }))} onSubmit={submitCert} onDownload={() => window.open(`/api/client/training/attestation/${pathId}`, '_blank')} />}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div style={{ background: '#02040a', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans',sans-serif", color: '#e2e8f0', position: 'relative' }}>

      {/* TOPBAR */}
      <div style={{ height: 54, background: 'rgba(2,4,10,0.94)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14, flexShrink: 0, zIndex: 30 }}>
        <button onClick={() => setLocation('/portail-client/accueil')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '5px 10px', transition: 'all 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; }}>
          <ArrowLeft size={13} /> Quitter
        </button>
        <span style={{ fontSize: 18 }}>{path.cover_emoji}</span>
        <span style={{ fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.75)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{path.title}</span>
        <div style={{ flex: 1 }} />

        {/* Dots */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button onClick={() => goToSlide(-1)} style={{ width: slideIdx === -1 ? 28 : 7, height: 7, borderRadius: 4, background: slideIdx === -1 ? '#fff' : 'rgba(255,255,255,0.18)', border: 'none', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)', padding: 0 }} />
          {modules.map((mod, i) => {
            const done = getProgress(mod.id)?.status === 'completed';
            const active = slideIdx === i;
            const unlocked = isUnlocked(i);
            return (
              <button key={i} onClick={() => unlocked && goToSlide(i)} disabled={!unlocked}
                style={{ width: active ? 28 : 7, height: 7, borderRadius: 4, border: 'none', cursor: unlocked ? 'pointer' : 'default', background: done ? '#00f5a0' : active ? '#fff' : unlocked ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.06)', transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)', padding: 0 }} />
            );
          })}
        </div>

        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', fontFamily: "'DM Mono',monospace", minWidth: 40, textAlign: 'right' }}>
          {slideIdx === -1 ? '0' : `${slideIdx + 1}`}/{modules.length}
        </span>
        <div style={{ width: 72, height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 1, overflow: 'hidden' }}>
          <div style={{ width: `${totalProgress}%`, height: '100%', background: 'linear-gradient(90deg, #0057ff, #00f5a0)', transition: 'width 0.5s ease' }} />
        </div>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', fontFamily: "'DM Mono',monospace" }}>{totalProgress}%</span>
      </div>

      {/* SLIDE AREA */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 12% 88%, ${path.cover_color}10 0%, transparent 40%), radial-gradient(ellipse at 88% 12%, rgba(0,87,255,0.05) 0%, transparent 35%)` }} />
        <div style={{
          position: 'absolute', inset: 0,
          opacity: slideVisible ? 1 : 0,
          transform: slideVisible ? 'translateX(0) scale(1)' : `translateX(${slideDir === 'right' ? '36px' : '-36px'}) scale(0.99)`,
          transition: slideVisible ? 'opacity 0.32s cubic-bezier(0.22,1,0.36,1), transform 0.32s cubic-bezier(0.22,1,0.36,1)' : 'opacity 0.18s ease, transform 0.18s ease',
          display: 'flex', flexDirection: 'column',
        }}>
          {slideIdx === -1 ? coverSlide : moduleSlide}
        </div>
      </div>

      {/* BOTTOM NAV */}
      {slideIdx >= 0 && (
        <div style={{ height: 64, background: 'rgba(2,4,10,0.94)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', flexShrink: 0, zIndex: 30 }}>
          <button onClick={() => goToSlide(slideIdx - 1)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, padding: '9px 20px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}>
            <ArrowLeft size={14} /> {slideIdx === 0 ? 'Intro' : 'Précédent'}
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 160, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
              <div style={{ width: `${totalProgress}%`, height: '100%', background: 'linear-gradient(90deg,#0057ff,#00f5a0)', transition: 'width 0.5s ease' }} />
            </div>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', fontFamily: "'DM Mono',monospace" }}>{completedCount}/{modules.length} complétés</span>
          </div>

          {isLast ? (
            <button onClick={() => goToSlide(-1)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#0057ff', border: 'none', borderRadius: 9, padding: '9px 26px', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 800, boxShadow: '0 0 20px rgba(0,87,255,0.3)', transition: 'all 0.15s' }}>
              Terminer <Check size={14} />
            </button>
          ) : (
            <button onClick={() => isDone && goToSlide(slideIdx + 1)} disabled={!isDone}
              style={{ display: 'flex', alignItems: 'center', gap: 7, background: isDone ? '#0057ff' : 'rgba(255,255,255,0.04)', border: isDone ? 'none' : '1px solid rgba(255,255,255,0.07)', borderRadius: 9, padding: '9px 26px', color: isDone ? '#fff' : 'rgba(255,255,255,0.16)', cursor: isDone ? 'pointer' : 'default', fontSize: 13, fontWeight: 800, transition: 'all 0.2s', boxShadow: isDone ? '0 0 20px rgba(0,87,255,0.3)' : 'none' }}>
              Suivant <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}

      {/* COACH PANEL */}
      {showCoach && coachTarget && path && <CoachPanel module={coachTarget} path={path} onClose={() => setShowCoach(false)} />}

      <PlayerStyles />
    </div>
  );
}

// ─── COURS SLIDE ─────────────────────────────────────────────────────────────

function CoursSlide({ mod, done, readPct, onComplete }: any) {
  const c = mod.content || {};
  return (
    <div>
      {/* Objective badge */}
      {c.objective && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.18)', borderRadius: 8, padding: '8px 16px', marginBottom: 28, fontSize: 13, color: '#60a5fa', fontWeight: 600 }}>
          <Target size={13} /> {c.objective}
        </div>
      )}

      {/* Summary */}
      {c.summary && (
        <div style={{ background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.12)', borderLeft: '3px solid #60a5fa', borderRadius: '0 12px 12px 0', padding: '18px 24px', marginBottom: 40 }}>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16, margin: 0, lineHeight: 1.8, fontStyle: 'italic' }}>{c.summary}</p>
        </div>
      )}

      {/* Sections */}
      {(c.sections || []).map((s: any, i: number) => (
        <div key={i} style={{ marginBottom: 48 }}>
          {/* Section heading */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Mono',monospace", fontSize: 11, fontWeight: 800, color: '#60a5fa', flexShrink: 0 }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <h2 style={{ fontSize: 21, fontWeight: 800, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em' }}>{s.heading}</h2>
          </div>

          {/* Body */}
          <div style={{ color: 'rgba(255,255,255,0.68)', fontSize: 16, lineHeight: 1.9 }}>
            {(s.body || '').split('\n\n').map((para: string, pi: number) => (
              <p key={pi} style={{ margin: '0 0 16px' }}>{para}</p>
            ))}
          </div>

          {/* Example block */}
          {s.example && (
            <div style={{ background: 'rgba(0,87,255,0.06)', border: '1px solid rgba(0,87,255,0.15)', borderRadius: 10, padding: '16px 20px', marginTop: 18, marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Exemple concret</div>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.62)', fontSize: 14.5, lineHeight: 1.75 }}>{s.example}</p>
            </div>
          )}

          {/* Tip block */}
          {s.tip && (
            <div style={{ display: 'flex', gap: 12, background: 'rgba(246,171,47,0.06)', border: '1px solid rgba(246,171,47,0.15)', borderRadius: 10, padding: '14px 18px', marginTop: 14 }}>
              <Lightbulb size={16} style={{ color: '#f6ab2f', flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.58)', fontSize: 14, lineHeight: 1.7 }}>{s.tip}</p>
            </div>
          )}

          {/* Key points */}
          {(s.key_points || []).length > 0 && (
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {s.key_points.map((kp: string, j: number) => (
                <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 14px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>
                  <ChevronRight size={13} style={{ color: '#60a5fa', flexShrink: 0, marginTop: 2 }} /> {kp}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Takeaways */}
      {(c.takeaways || []).length > 0 && (
        <div style={{ background: 'rgba(0,245,160,0.05)', border: '1px solid rgba(0,245,160,0.15)', borderRadius: 12, padding: '20px 24px', marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: '#00f5a0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>À retenir</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {c.takeaways.map((t: string, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14.5, color: 'rgba(255,255,255,0.62)' }}>
                <Check size={14} style={{ color: '#00f5a0', flexShrink: 0, marginTop: 2 }} /> {t}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion */}
      {!done ? (
        <button onClick={onComplete} style={btnPrimary}>
          <Check size={15} /> J'ai lu et compris ce cours
        </button>
      ) : (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#00f5a0', fontWeight: 700, fontSize: 14, background: 'rgba(0,245,160,0.07)', border: '1px solid rgba(0,245,160,0.18)', borderRadius: 9, padding: '10px 18px' }}>
          <Check size={14} /> Cours terminé — passez à la suite
        </div>
      )}
    </div>
  );
}

// ─── QCM SLIDE ────────────────────────────────────────────────────────────────

function QcmSlide({ mod, answers, submitted, onAnswer, onSubmit }: any) {
  const qs = mod.content?.questions || [];
  const allAnswered = Object.keys(answers).length === qs.length;
  const correct = submitted ? qs.filter((q: any, i: number) => answers[i] === q.correct_index).length : 0;
  const score = submitted && qs.length > 0 ? Math.round((correct / qs.length) * 100) : 0;
  const [currentQ, setCurrentQ] = useState(0);

  const answeredCount = Object.keys(answers).length;

  return (
    <div>
      {mod.content?.instructions && (
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14.5, marginBottom: 28, lineHeight: 1.65 }}>{mod.content.instructions}</p>
      )}

      {/* Progress bar */}
      {!submitted && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${(answeredCount / qs.length) * 100}%`, height: '100%', background: '#00f5a0', transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: "'DM Mono',monospace", flexShrink: 0 }}>{answeredCount}/{qs.length}</span>
        </div>
      )}

      {qs.map((q: any, qi: number) => {
        const answered = answers[qi] !== undefined;
        const ok_final = submitted && answers[qi] === q.correct_index;
        const ko_final = submitted && answers[qi] !== q.correct_index;
        return (
          <div key={qi} style={{ marginBottom: 36, opacity: !submitted && answered && qi !== qs.length - 1 ? 0.7 : 1, transition: 'opacity 0.3s' }}>
            <p style={{ fontWeight: 700, fontSize: 18, color: '#f8fafc', margin: '0 0 16px', lineHeight: 1.4, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: '#00f5a0', background: 'rgba(0,245,160,0.1)', padding: '3px 8px', borderRadius: 3, fontWeight: 700, flexShrink: 0, marginTop: 3, border: '1px solid rgba(0,245,160,0.2)' }}>Q{qi + 1}</span>
              {q.question}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(q.options || []).map((opt: string, oi: number) => {
                const sel = answers[qi] === oi;
                const ok = submitted && oi === q.correct_index;
                const ko = submitted && sel && oi !== q.correct_index;
                return (
                  <button key={oi} onClick={() => !submitted && onAnswer(qi, oi)} disabled={submitted}
                    style={{ background: ok ? 'rgba(0,245,160,0.08)' : ko ? 'rgba(255,59,78,0.08)' : sel ? 'rgba(0,87,255,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${ok ? 'rgba(0,245,160,0.35)' : ko ? 'rgba(255,59,78,0.35)' : sel ? 'rgba(0,87,255,0.5)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 11, padding: '13px 18px', cursor: submitted ? 'default' : 'pointer', textAlign: 'left', color: ok ? '#00f5a0' : ko ? '#ff3b4e' : sel ? '#fff' : 'rgba(255,255,255,0.55)', fontSize: 15, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 12 }}
                    onMouseEnter={e => { if (!submitted && !sel) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { if (!submitted && !sel) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}>
                    <span style={{ width: 22, height: 22, borderRadius: 5, background: ok ? '#00f5a0' : ko ? '#ff3b4e' : sel ? '#0057ff' : 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'DM Mono',monospace", fontWeight: 800, fontSize: 10, color: ok || ko || sel ? '#02040a' : 'rgba(255,255,255,0.35)', transition: 'all 0.15s' }}>
                      {ok ? <Check size={12} /> : ko ? <X size={12} /> : String.fromCharCode(65 + oi)}
                    </span>
                    <span style={{ flex: 1 }}>{opt}</span>
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <div style={{ marginTop: 12, background: ok_final ? 'rgba(0,245,160,0.05)' : 'rgba(255,59,78,0.05)', border: `1px solid ${ok_final ? 'rgba(0,245,160,0.12)' : 'rgba(255,59,78,0.12)'}`, borderRadius: 9, padding: '12px 16px', fontSize: 13.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
                <span style={{ color: '#f6ab2f', marginRight: 6 }}>💡</span>{q.explanation}
              </div>
            )}
          </div>
        );
      })}

      {!submitted ? (
        <button onClick={onSubmit} disabled={!allAnswered} style={{ ...btnPrimary, opacity: allAnswered ? 1 : 0.3 }}>
          <Check size={15} /> Valider mes réponses
        </button>
      ) : (
        <div style={{ background: score >= 70 ? 'rgba(0,245,160,0.07)' : 'rgba(246,171,47,0.07)', border: `1px solid ${score >= 70 ? 'rgba(0,245,160,0.2)' : 'rgba(246,171,47,0.2)'}`, borderRadius: 14, padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: score >= 70 ? '#00f5a0' : '#f6ab2f', fontFamily: "'DM Mono',monospace", letterSpacing: '-0.02em' }}>{score}%</div>
          <div>
            <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: 17, letterSpacing: '-0.01em', marginBottom: 4 }}>{correct}/{qs.length} bonnes réponses</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{score >= 70 ? '✓ Excellent ! Passez à la suite.' : 'Relisez le cours et recommencez si besoin.'}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BLANKS SLIDE ─────────────────────────────────────────────────────────────

function BlanksSlide({ mod, answers, submitted, onAnswer, onSubmit }: any) {
  const blanks = mod.content?.blanks || [];
  const text = mod.content?.text_with_blanks || '';
  const parts = text.split(/(\[BLANK_\d+\])/g);
  const allFilled = blanks.every((b: any) => answers[b.id]?.trim());

  return (
    <div>
      {mod.content?.instructions && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, marginBottom: 28 }}>{mod.content.instructions}</p>}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '32px 36px', fontSize: 17, lineHeight: 2.5, marginBottom: 32 }}>
        {parts.map((part: string, i: number) => {
          const match = part.match(/\[BLANK_(\d+)\]/);
          if (match) {
            const id = `BLANK_${match[1]}`;
            const b = blanks.find((x: any) => x.id === id);
            const ok = submitted && (answers[id] || '').trim().toLowerCase() === b?.answer?.toLowerCase();
            const ko = submitted && !ok && answers[id];
            return (
              <span key={i} style={{ display: 'inline-block', position: 'relative' }}>
                <input value={answers[id] || ''} onChange={e => !submitted && onAnswer(id, e.target.value)} disabled={submitted}
                  style={{ width: 150, margin: '0 4px', background: ok ? 'rgba(0,245,160,0.1)' : ko ? 'rgba(255,59,78,0.1)' : 'rgba(255,255,255,0.07)', border: `1px solid ${ok ? '#00f5a0' : ko ? '#ff3b4e' : 'rgba(255,255,255,0.18)'}`, borderRadius: 7, padding: '4px 12px', color: ok ? '#00f5a0' : ko ? '#ff3b4e' : '#f8fafc', fontSize: 15, outline: 'none', fontFamily: "'DM Mono',monospace", textAlign: 'center', transition: 'all 0.15s', boxSizing: 'border-box' }} />
                {submitted && b?.hint && <span style={{ position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap' }}>{b.answer}</span>}
              </span>
            );
          }
          return <span key={i} style={{ color: 'rgba(255,255,255,0.75)' }}>{part}</span>;
        })}
      </div>
      {!submitted ? (
        <button onClick={onSubmit} disabled={!allFilled} style={{ ...btnPrimary, opacity: allFilled ? 1 : 0.3 }}><Check size={15} /> Valider</button>
      ) : (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#00f5a0', fontWeight: 700, background: 'rgba(0,245,160,0.07)', border: '1px solid rgba(0,245,160,0.18)', borderRadius: 9, padding: '10px 18px' }}>
          <Check size={14} /> Exercice terminé
        </div>
      )}
    </div>
  );
}

// ─── FREE SLIDE ───────────────────────────────────────────────────────────────

function FreeSlide({ mod, text, submitted, onChange, onSubmit }: any) {
  const c = mod.content || {};
  return (
    <div>
      {/* Scenario */}
      {c.scenario && (
        <div style={{ background: 'rgba(192,132,252,0.06)', border: '1px solid rgba(192,132,252,0.15)', borderRadius: 12, padding: '20px 24px', marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: '#c084fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Contexte</div>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 15.5, lineHeight: 1.8 }}>{c.scenario}</p>
        </div>
      )}

      {/* Instructions */}
      <p style={{ fontWeight: 800, fontSize: 19, color: '#f8fafc', marginBottom: 20, lineHeight: 1.4, letterSpacing: '-0.01em' }}>{c.instructions}</p>

      {/* Tasks */}
      {(c.tasks || []).length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: '#c084fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Ce qu'on attend de vous</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {c.tasks.map((t: string, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 14px', background: 'rgba(192,132,252,0.05)', border: '1px solid rgba(192,132,252,0.12)', borderRadius: 8, fontSize: 14.5, color: 'rgba(255,255,255,0.6)' }}>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: '#c084fc', fontWeight: 800, flexShrink: 0, marginTop: 2 }}>{i + 1}.</span> {t}
              </div>
            ))}
          </div>
        </div>
      )}

      {!submitted ? (
        <>
          <textarea value={text} onChange={e => onChange(e.target.value)} rows={8} placeholder="Votre réponse…"
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '18px 22px', color: '#f8fafc', fontSize: 15.5, resize: 'vertical', outline: 'none', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.8, boxSizing: 'border-box', transition: 'border-color 0.15s' }} />
          <button onClick={onSubmit} disabled={!text.trim()} style={{ ...btnPrimary, marginTop: 16, opacity: text.trim() ? 1 : 0.3 }}>
            <Send size={14} /> Soumettre ma réponse
          </button>
        </>
      ) : (
        <div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px', marginBottom: 22, color: 'rgba(255,255,255,0.68)', fontSize: 15.5, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{text}</div>
          {c.example_solution && (
            <div style={{ background: 'rgba(0,245,160,0.05)', border: '1px solid rgba(0,245,160,0.15)', borderRadius: 12, padding: '18px 22px' }}>
              <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#00f5a0', fontSize: 12, fontFamily: "'DM Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.1em' }}>Exemple de réponse attendue</p>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{c.example_solution}</p>
            </div>
          )}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#00f5a0', fontWeight: 700, background: 'rgba(0,245,160,0.07)', border: '1px solid rgba(0,245,160,0.18)', borderRadius: 9, padding: '10px 18px', marginTop: 16 }}>
            <Check size={14} /> Exercice soumis
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ROLEPLAY SLIDE ───────────────────────────────────────────────────────────

function RoleplaySlide({ mod, messages, input, loading, done, onInput, onSend, onComplete, endRef }: any) {
  const c = mod.content || {};
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 240px)', maxHeight: 600 }}>
      {/* Context briefing */}
      {c.context_briefing && (
        <div style={{ background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.15)', borderRadius: 10, padding: '14px 18px', marginBottom: 16, flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: '#f472b6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Votre brief</div>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: 13.5, lineHeight: 1.65 }}>{c.context_briefing}</p>
        </div>
      )}
      {/* Persona header */}
      <div style={{ background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.15)', borderRadius: '10px 10px 0 0', padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(244,114,182,0.15)', border: '1px solid rgba(244,114,182,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6', fontWeight: 900, fontSize: 15 }}>
          {c.ai_persona?.name?.[0]?.toUpperCase() || 'AI'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#f8fafc' }}>{c.ai_persona?.name || 'Interlocuteur'}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{c.ai_persona?.role || 'Simulation IA'}{c.learner_role ? ` · Votre rôle : ${c.learner_role}` : ''}</div>
        </div>
        {!done && <button onClick={onComplete} style={{ background: 'rgba(0,245,160,0.1)', border: '1px solid rgba(0,245,160,0.22)', borderRadius: 7, padding: '6px 13px', color: '#00f5a0', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Terminer</button>}
      </div>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderTop: 'none', padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m: any, i: number) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '74%', padding: '11px 16px', borderRadius: m.role === 'user' ? '14px 14px 3px 14px' : '3px 14px 14px 14px', background: m.role === 'user' ? '#0057ff' : 'rgba(255,255,255,0.06)', border: m.role === 'ai' ? '1px solid rgba(255,255,255,0.08)' : 'none', color: 'rgba(255,255,255,0.85)', fontSize: 14.5, lineHeight: 1.65 }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px 14px 14px 14px', padding: '12px 16px', display: 'flex', gap: 5 }}>
              {[0,1,2].map(j => <span key={j} style={{ width: 7, height: 7, borderRadius: '50%', background: '#f472b6', display: 'block', animation: `pulse 1s ${j*0.18}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      {/* Input */}
      {!done ? (
        <div style={{ background: 'rgba(2,4,10,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '10px', display: 'flex', gap: 8, flexShrink: 0 }}>
          <input value={input} onChange={e => onInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && onSend()} placeholder="Votre réponse…"
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, padding: '9px 14px', color: '#f8fafc', fontSize: 14, outline: 'none', fontFamily: "'DM Sans',sans-serif" }} />
          <button onClick={onSend} disabled={!input.trim() || loading} style={{ ...btnPrimary, padding: '9px 14px' }}><Send size={14} /></button>
        </div>
      ) : (
        <div style={{ background: 'rgba(0,245,160,0.05)', border: '1px solid rgba(0,245,160,0.15)', borderRadius: '0 0 10px 10px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8, color: '#00f5a0', fontWeight: 700 }}><Check size={14} /> Simulation terminée</div>
      )}
    </div>
  );
}

// ─── CERT SLIDE ───────────────────────────────────────────────────────────────

function CertSlide({ mod, path, answers, result, submitting, existingCert, onAnswer, onSubmit, onDownload }: any) {
  const qs = mod.content?.questions || [];
  const allAnswered = Object.keys(answers).length === qs.length;

  if (result) return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <div style={{ fontSize: 88, marginBottom: 24, filter: result.passed ? 'drop-shadow(0 0 30px rgba(0,245,160,0.4))' : 'none' }}>{result.passed ? '🏆' : '📚'}</div>
      <h2 style={{ fontSize: 36, fontWeight: 900, color: result.passed ? '#00f5a0' : '#f6ab2f', margin: '0 0 14px', letterSpacing: '-0.03em' }}>{result.passed ? 'Certification obtenue !' : 'Pas encore…'}</h2>
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 18, marginBottom: 40 }}>Score : <strong style={{ color: '#f8fafc', fontSize: 28, letterSpacing: '-0.02em' }}>{result.score}%</strong> · {result.correct}/{result.total} bonnes réponses</p>
      {result.passed ? (
        <button onClick={onDownload} style={{ ...btnPrimary, background: '#00f5a0', color: '#02040a', fontSize: 16, padding: '16px 36px', borderRadius: 14, fontWeight: 900, boxShadow: '0 0 30px rgba(0,245,160,0.3)' }}><Download size={18} /> Télécharger l'attestation PDF</button>
      ) : (
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 15 }}>Score requis : {path.certification_min_score}%</p>
      )}
    </div>
  );

  if (existingCert?.passed) return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <div style={{ fontSize: 88, marginBottom: 24, filter: 'drop-shadow(0 0 30px rgba(0,245,160,0.4))' }}>🏆</div>
      <h2 style={{ fontSize: 30, fontWeight: 900, color: '#00f5a0', margin: '0 0 14px', letterSpacing: '-0.02em' }}>Déjà certifié(e) !</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 32, fontSize: 16 }}>Score : <strong style={{ color: '#f8fafc' }}>{existingCert.score}%</strong></p>
      <button onClick={onDownload} style={{ ...btnPrimary, background: '#00f5a0', color: '#02040a', fontSize: 15, padding: '13px 30px', borderRadius: 12, fontWeight: 900 }}><Download size={16} /> Attestation PDF</button>
    </div>
  );

  return (
    <div>
      <div style={{ background: 'rgba(246,171,47,0.07)', border: '1px solid rgba(246,171,47,0.18)', borderRadius: 12, padding: '16px 22px', marginBottom: 36, display: 'flex', gap: 14, alignItems: 'center' }}>
        <Award size={24} color="#f6ab2f" />
        <div><div style={{ fontWeight: 800, color: '#f6ab2f', fontSize: 15 }}>Certification finale</div><div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>Score minimum requis : {path.certification_min_score}% · Attestation PDF générée si réussi</div></div>
      </div>
      {mod.content?.instructions && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, marginBottom: 28 }}>{mod.content.instructions}</p>}
      {qs.map((q: any, qi: number) => (
        <div key={qi} style={{ marginBottom: 30 }}>
          <p style={{ fontWeight: 700, fontSize: 17, color: '#f8fafc', margin: '0 0 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: '#f6ab2f', background: 'rgba(246,171,47,0.1)', padding: '3px 8px', borderRadius: 3, fontWeight: 700, flexShrink: 0, marginTop: 3 }}>Q{qi+1}</span>
            {q.question}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(q.options||[]).map((opt: string, oi: number) => (
              <button key={oi} onClick={() => onAnswer(qi, oi)}
                style={{ background: answers[qi]===oi ? 'rgba(246,171,47,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${answers[qi]===oi ? 'rgba(246,171,47,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10, padding: '13px 18px', cursor: 'pointer', textAlign: 'left', color: answers[qi]===oi ? '#f6ab2f' : 'rgba(255,255,255,0.55)', fontSize: 15, display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s' }}>
                <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 800, fontSize: 11, flexShrink: 0 }}>{String.fromCharCode(65+oi)}</span>
                {opt}
                {answers[qi]===oi && <Check size={13} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={onSubmit} disabled={!allAnswered || submitting} style={{ ...btnPrimary, background: '#f6ab2f', color: '#02040a', opacity: allAnswered && !submitting ? 1 : 0.35, fontSize: 15, padding: '14px 30px', borderRadius: 12, fontWeight: 900 }}>
        {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Envoi…</> : <><Award size={16} /> Valider la certification</>}
      </button>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  background: '#0057ff', color: '#fff', border: 'none', borderRadius: 11,
  padding: '13px 26px', fontSize: 15, fontWeight: 800, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 9,
  fontFamily: "'DM Sans',sans-serif", letterSpacing: '-0.01em',
  boxShadow: '0 0 20px rgba(0,87,255,0.25)', transition: 'all 0.15s',
};

function PlayerStyles() {
  return <style>{`
    @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}
    *{box-sizing:border-box}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
    input:focus,textarea:focus{border-color:rgba(0,87,255,0.4)!important}
  `}</style>;
}
