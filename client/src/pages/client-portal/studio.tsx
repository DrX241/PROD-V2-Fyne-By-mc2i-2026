import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import {
  Plus, Trash2, GripVertical, Sparkles, BookOpen, CheckSquare,
  AlignLeft, Dumbbell, Users, Award, Eye, EyeOff, ArrowLeft,
  Loader2, X, Send, Play, ChevronDown, Check, Globe,
  Clock, Target, Layers, Zap, Edit2, Terminal, Wand2,
  ChevronRight, MoreHorizontal
} from 'lucide-react';

type ModuleType = 'cours' | 'qcm' | 'texte_a_trous' | 'exercice_libre' | 'roleplay' | 'certification';

interface TrainingModule {
  id?: number;
  position: number;
  type: ModuleType;
  title: string;
  content: any;
  is_certification: boolean;
  _isNew?: boolean;
  _dirty?: boolean;
}

interface TrainingPath {
  id: number;
  title: string;
  description: string | null;
  cover_color: string;
  cover_emoji: string;
  status: 'draft' | 'published';
  certification_min_score: number;
  estimated_minutes: number;
}

interface ClientUser { id: number; first_name: string; last_name: string; email: string; }

const MODULE_TYPES: { type: ModuleType; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { type: 'cours',          label: 'Cours',          icon: <BookOpen size={14} />,    color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  { type: 'qcm',            label: 'QCM',            icon: <CheckSquare size={14} />, color: '#00f5a0', bg: 'rgba(0,245,160,0.1)' },
  { type: 'texte_a_trous',  label: 'Texte à trous',  icon: <AlignLeft size={14} />,   color: '#f6ab2f', bg: 'rgba(246,171,47,0.1)' },
  { type: 'exercice_libre', label: 'Exercice libre', icon: <Dumbbell size={14} />,    color: '#c084fc', bg: 'rgba(192,132,252,0.1)' },
  { type: 'roleplay',       label: 'Roleplay IA',    icon: <Users size={14} />,       color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
  { type: 'certification',  label: 'Certification',  icon: <Award size={14} />,       color: '#f6ab2f', bg: 'rgba(246,171,47,0.1)' },
];

const COLORS = ['#0057ff','#0f766e','#7c3aed','#be185d','#b45309','#0369a1','#15803d','#9f1239'];
const EMOJIS = ['🎓','🚀','💡','🔐','📊','🤖','⚡','🎯','🌐','🛡️','📱','🔬','🧠','💎','🔥','✨'];

function getMeta(mod: TrainingModule) {
  const t = mod.is_certification ? 'certification' : mod.type;
  return MODULE_TYPES.find(x => x.type === t) || MODULE_TYPES[0];
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────

interface OnboardingProps {
  onDraftReady: (path: TrainingPath, modules: TrainingModule[]) => void;
  onSkip: () => void;
}

function OnboardingChat({ onDraftReady, onSkip }: OnboardingProps) {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: "Bonjour ! Je suis votre assistant de création de formation.\n\nJe peux générer pour vous un parcours complet en quelques secondes — avec une leçon de cours, un QCM de compréhension et un exercice pratique.\n\nDites-moi simplement **quel sujet** vous souhaitez aborder, pour **quel public**, et l'objectif pédagogique visé." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'chat' | 'generating'>('chat');
  const [genLogs, setGenLogs] = useState<string[]>([]);
  const [genProgress, setGenProgress] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const addLog = (log: string) => setGenLogs(p => [...p, log]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(p => [...p, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const r = await fetch('/api/client/training/ai/chat', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `Tu es un assistant expert en création de formations e-learning. L'utilisateur décrit une formation qu'il veut créer. Tu dois :
1. Si la description est suffisamment précise (sujet + public cible OU objectif), répondre EXACTEMENT par : "READY_TO_GENERATE: <resume en 1 phrase du besoin>"
2. Si la description est trop vague, poser UNE SEULE question de clarification courte et précise.
Sois chaleureux, professionnel, et concis.` },
            { role: 'user', content: userMsg }
          ]
        }),
      });
      const d = await r.json();
      if (!d.success) throw new Error();
      const reply: string = d.reply;
      if (reply.startsWith('READY_TO_GENERATE:')) {
        const brief = reply.replace('READY_TO_GENERATE:', '').trim();
        setMessages(p => [...p, { role: 'ai', text: `Parfait ! Génération du parcours : **${brief}**\n\nLancement en cours…` }]);
        setStep('generating');
        await generateDraft(brief, userMsg);
      } else {
        setMessages(p => [...p, { role: 'ai', text: reply }]);
      }
    } catch {
      setMessages(p => [...p, { role: 'ai', text: "Désolé, une erreur s'est produite. Réessayez." }]);
    } finally {
      setLoading(false);
    }
  };

  const generateDraft = async (brief: string, originalRequest: string) => {
    setGenLogs([]);
    setGenProgress(0);
    try {
      addLog('> Initialisation du moteur de génération…');
      setGenProgress(3);
      await new Promise(r => setTimeout(r, 300));

      addLog('> Analyse de la demande avec Claude AI…');
      setGenProgress(8);
      const metaR = await fetch('/api/client/training/ai/chat', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Tu génères des métadonnées JSON pour un parcours de formation. Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans backticks.' },
            { role: 'user', content: `Génère les métadonnées pour cette formation : "${brief}". Format JSON exact : {"title":"Titre court et percutant (max 6 mots)","description":"Description engageante en 2 phrases qui donne envie d'apprendre","cover_color":"une couleur hex parmi [#0057ff,#0f766e,#7c3aed,#be185d,#b45309,#0891b2]","cover_emoji":"emoji pertinent","estimated_minutes":N,"audience":"public cible","objectives":["objectif 1","objectif 2","objectif 3"]}` }
          ]
        }),
      });
      const metaD = await metaR.json();
      let pathMeta: any = { title: brief, description: '', cover_color: '#0057ff', cover_emoji: '🎓', estimated_minutes: 45 };
      try { pathMeta = { ...pathMeta, ...JSON.parse(metaD.reply.replace(/```json|```/g, '').trim()) }; } catch {}
      addLog(`> Parcours : "${pathMeta.title}" ${pathMeta.cover_emoji}`);
      setGenProgress(15);

      addLog('> Création du parcours en base de données…');
      const pathR = await fetch('/api/client/training/paths', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pathMeta, certification_min_score: 70 }),
      });
      const pathD = await pathR.json();
      if (!pathD.success) throw new Error('path creation failed');
      const path = pathD.path;
      setGenProgress(20);

      // Séquence pédagogique complète : cours détaillé → QCM → exercice pratique → roleplay → certification
      const moduleTypes: { type: 'cours' | 'qcm' | 'exercice_libre' | 'roleplay'; label: string; context?: string }[] = [
        { type: 'cours', label: 'Cours complet', context: `Public : ${pathMeta.audience || 'professionnels'}. Objectifs : ${(pathMeta.objectives || []).join(', ')}` },
        { type: 'qcm', label: 'QCM de compréhension', context: `Vérifier la compréhension du cours sur ${brief}` },
        { type: 'exercice_libre', label: 'Mise en pratique', context: `Exercice pratique ancré dans la réalité professionnelle sur ${brief}` },
        { type: 'roleplay', label: 'Simulation IA', context: `Simulation professionnelle pour appliquer les compétences de ${brief} dans une situation réelle` },
      ];
      const generatedModules: TrainingModule[] = [];
      const totalMods = moduleTypes.length;

      for (let mi = 0; mi < totalMods; mi++) {
        const { type, label, context: modContext } = moduleTypes[mi];
        const pctStart = 20 + mi * Math.floor(70 / totalMods);
        addLog(`> Module [${mi+1}/${totalMods}] — ${label}…`);
        setGenProgress(pctStart);

        const genR = await fetch('/api/client/training/ai/generate', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, topic: originalRequest, context: modContext }),
        });
        const genD = await genR.json();
        const content = genD.success ? genD.content : {};
        addLog(`  ✓ ${label} généré`);

        const modR = await fetch(`/api/client/training/paths/${path.id}/modules`, {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, title: content.title || label, content, is_certification: false }),
        });
        const modD = await modR.json();
        if (modD.success) generatedModules.push(modD.module);
        setGenProgress(pctStart + Math.floor(65 / totalMods));
      }

      addLog('> Finalisation du parcours…');
      setGenProgress(95);
      await new Promise(r => setTimeout(r, 400));
      addLog(`> ✓ Parcours complet généré — ${totalMods} modules prêts !`);
      setGenProgress(100);
      await new Promise(r => setTimeout(r, 600));

      onDraftReady(path, generatedModules);
    } catch {
      setMessages(p => [...p, { role: 'ai', text: "Une erreur est survenue lors de la génération. Réessayez ou créez manuellement." }]);
      setStep('chat');
    }
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
    <div style={{ position: 'fixed', inset: 0, background: '#02040a', display: 'flex', fontFamily: "'DM Sans',sans-serif", overflow: 'hidden' }}>
      {/* Grid background */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,87,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,87,255,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(0,87,255,0.12) 0%, transparent 65%)' }} />

      {/* Left panel — branding */}
      <div style={{
        width: 420, flexShrink: 0, borderRight: '1px solid rgba(0,87,255,0.15)',
        display: 'flex', flexDirection: 'column', padding: '60px 48px',
        position: 'relative', overflow: 'hidden',
        opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(-24px)',
        transition: 'all 0.6s cubic-bezier(0.22,1,0.36,1)',
      }}>
        <div style={{ position: 'absolute', top: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,87,255,0.12) 0%, transparent 70%)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
          <div style={{ width: 40, height: 40, background: '#0057ff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
            <Wand2 size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: '#0057ff', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>FYNE</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>Studio Formation</div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 42, fontWeight: 900, color: '#f8fafc', margin: '0 0 20px', lineHeight: 1.0, letterSpacing: '-0.03em' }}>
            Créez votre<br /><span style={{ color: '#0057ff' }}>formation</span><br />avec l'IA
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, lineHeight: 1.7, margin: '0 0 48px' }}>
            Décrivez votre besoin pédagogique en langage naturel. L'IA génère un parcours complet, structuré et prêt à l'emploi.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: <BookOpen size={16} />, label: 'Leçon de cours', desc: 'Contenu structuré et détaillé', color: '#60a5fa' },
              { icon: <CheckSquare size={16} />, label: 'QCM de compréhension', desc: 'Questions avec correction auto', color: '#00f5a0' },
              { icon: <Dumbbell size={16} />, label: 'Exercice pratique', desc: 'Mise en situation concrète', color: '#c084fc' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onSkip} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 16px', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 7, width: 'fit-content', transition: 'all 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}>
          Créer manuellement <ChevronRight size={13} />
        </button>
      </div>

      {/* Right panel — chat */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 48px',
        opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.6s 0.1s cubic-bezier(0.22,1,0.36,1)',
      }}>
        {step === 'generating' ? (
          /* Generation terminal */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 640, margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
              <div style={{ width: 36, height: 36, background: '#0057ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Terminal size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>Génération en cours</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Mono',monospace" }}>{genProgress}% complété</div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, marginBottom: 28, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${genProgress}%`, background: 'linear-gradient(90deg, #0057ff, #00f5a0)', borderRadius: 2, transition: 'width 0.5s ease', boxShadow: '0 0 10px rgba(0,87,255,0.5)' }} />
            </div>

            {/* Terminal logs */}
            <div style={{ flex: 1, background: '#050810', border: '1px solid rgba(0,87,255,0.2)', borderRadius: 12, padding: '20px 24px', overflow: 'auto', fontFamily: "'DM Mono',monospace", fontSize: 13 }}>
              {genLogs.map((log, i) => (
                <div key={i} style={{ color: log.includes('✓') ? '#00f5a0' : log.startsWith('  ') ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.7)', marginBottom: 6, animation: 'fadeIn 0.3s ease' }}>
                  {log}
                </div>
              ))}
              {genProgress < 100 && <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                {[0,1,2].map(j => <span key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: '#0057ff', display: 'block', animation: `pulse 1s ${j*0.2}s infinite` }} />)}
              </div>}
            </div>
          </div>
        ) : (
          /* Chat interface */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 640, margin: '0 auto', width: '100%' }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f8fafc', margin: '0 0 6px', letterSpacing: '-0.02em' }}>Décrivez votre formation</h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', margin: 0, fontSize: 14 }}>Plus vous êtes précis, meilleur sera le résultat.</p>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 8 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 10 }}>
                  {m.role === 'ai' && (
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: '#0057ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <Sparkles size={13} color="#fff" />
                    </div>
                  )}
                  <div style={{
                    maxWidth: '82%', padding: '13px 17px',
                    borderRadius: m.role === 'user' ? '14px 14px 3px 14px' : '3px 14px 14px 14px',
                    background: m.role === 'user' ? '#0057ff' : 'rgba(255,255,255,0.05)',
                    border: m.role === 'ai' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    color: m.role === 'user' ? '#fff' : 'rgba(255,255,255,0.75)',
                    fontSize: 14, lineHeight: 1.7,
                  }}>
                    {renderText(m.text)}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: '#0057ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={13} color="#fff" />
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px 14px 14px 14px', padding: '14px 18px', display: 'flex', gap: 6 }}>
                    {[0,1,2].map(j => <span key={j} style={{ width: 7, height: 7, borderRadius: '50%', background: '#0057ff', display: 'block', animation: `pulse 1s ${j*0.2}s infinite` }} />)}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' }}
              onFocus={() => {}} >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Ex : Formation sur la cybersécurité pour des collaborateurs non-techniques, objectif : identifier les tentatives de phishing…"
                rows={3}
                style={{ width: '100%', background: 'transparent', border: 'none', padding: '16px 18px 8px', color: '#e2e8f0', fontSize: 14, outline: 'none', resize: 'none', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.65, boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 12px 12px' }}>
                <button onClick={send} disabled={!input.trim() || loading}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, background: input.trim() ? '#0057ff' : 'rgba(255,255,255,0.06)', border: 'none', color: input.trim() ? '#fff' : 'rgba(255,255,255,0.3)', borderRadius: 9, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: input.trim() ? 'pointer' : 'default', transition: 'all 0.15s', fontFamily: "'DM Sans',sans-serif" }}>
                  <Send size={14} /> Envoyer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
      `}</style>
    </div>
  );
}

// ─── MAIN STUDIO ──────────────────────────────────────────────────────────────

export default function StudioPage() {
  const [, setLocation] = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [screen, setScreen] = useState<'onboarding' | 'list' | 'editor'>('onboarding');
  const [paths, setPaths] = useState<TrainingPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<TrainingPath | null>(null);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ user_ids: [] as number[], due_date: '', is_mandatory: false });
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const dragIdx = useRef<number | null>(null);

  const notify = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3200); };

  useEffect(() => {
    fetch('/api/client/auth/check', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (!d.authenticated) { setLocation('/portail-client/login'); return; }
        if (d.user.role !== 'admin') { setLocation('/portail-client/accueil'); return; }
        setAuthChecked(true);
      });
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    Promise.all([
      fetch('/api/client/training/paths', { credentials: 'include' }).then(r => r.json()).then(d => { if (d.success) { setPaths(d.paths); if (d.paths.length > 0) setScreen('list'); } }),
      fetch('/api/client/admin/users', { credentials: 'include' }).then(r => r.json()).then(d => { if (d.success) setUsers(d.users); }),
    ]).finally(() => setLoading(false));
  }, [authChecked]);

  const openEditor = async (path: TrainingPath) => {
    setSelectedPath(path);
    setActiveIdx(null);
    setScreen('editor');
    const r = await fetch(`/api/client/training/paths/${path.id}`, { credentials: 'include' });
    const d = await r.json();
    if (d.success) setModules(d.modules);
  };

  const handleDraftReady = (path: TrainingPath, mods: TrainingModule[]) => {
    setPaths(p => [path, ...p]);
    setSelectedPath(path);
    setModules(mods);
    setScreen('editor');
    notify(`Parcours "${path.title}" généré avec ${mods.length} modules !`);
  };

  const togglePublish = async (path: TrainingPath) => {
    const status = path.status === 'published' ? 'draft' : 'published';
    const r = await fetch(`/api/client/training/paths/${path.id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    const d = await r.json();
    if (d.success) {
      setPaths(p => p.map(x => x.id === path.id ? { ...x, status } : x));
      if (selectedPath?.id === path.id) setSelectedPath(p => p ? { ...p, status } : p);
      notify(status === 'published' ? 'Parcours publié !' : 'Dépublié');
    }
  };

  const deletePath = async (id: number) => {
    if (!confirm('Supprimer définitivement ce parcours ?')) return;
    await fetch(`/api/client/training/paths/${id}`, { method: 'DELETE', credentials: 'include' });
    setPaths(p => p.filter(x => x.id !== id));
    if (selectedPath?.id === id) { setScreen('list'); setSelectedPath(null); }
    notify('Supprimé');
  };

  const addModule = (type: ModuleType) => {
    const isCert = type === 'certification';
    const mod: TrainingModule = { position: modules.length, type: isCert ? 'qcm' : type, title: MODULE_TYPES.find(t => t.type === type)!.label, content: {}, is_certification: isCert, _isNew: true, _dirty: true };
    setModules(p => [...p, mod]);
    setActiveIdx(modules.length);
    setShowAiPanel(false);
  };

  const updateModule = (idx: number, u: Partial<TrainingModule>) =>
    setModules(p => p.map((m, i) => i === idx ? { ...m, ...u, _dirty: true } : m));

  const saveModule = async (idx: number) => {
    const mod = modules[idx];
    if (!mod._dirty) return;
    setSaving(true);
    try {
      if (mod._isNew) {
        const r = await fetch(`/api/client/training/paths/${selectedPath!.id}/modules`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: mod.type, title: mod.title, content: mod.content, is_certification: mod.is_certification }) });
        const d = await r.json();
        if (d.success) setModules(p => p.map((m, i) => i === idx ? { ...d.module, _dirty: false } : m));
      } else {
        await fetch(`/api/client/training/modules/${mod.id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: mod.title, content: mod.content }) });
        setModules(p => p.map((m, i) => i === idx ? { ...m, _dirty: false } : m));
      }
      notify('Sauvegardé');
    } finally { setSaving(false); }
  };

  const deleteModule = async (idx: number) => {
    const mod = modules[idx];
    if (!mod._isNew && mod.id) await fetch(`/api/client/training/modules/${mod.id}`, { method: 'DELETE', credentials: 'include' });
    setModules(p => p.filter((_, i) => i !== idx));
    setActiveIdx(null);
    notify('Module supprimé');
  };

  const generateAI = async (idx: number) => {
    if (!aiTopic.trim()) return;
    const mod = modules[idx];
    setAiLoading(true);
    try {
      const r = await fetch('/api/client/training/ai/generate', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: mod.is_certification ? 'qcm' : mod.type, topic: aiTopic }) });
      const d = await r.json();
      if (d.success) { updateModule(idx, { content: d.content, title: d.content.title || mod.title }); setShowAiPanel(false); setAiTopic(''); notify('Contenu généré !'); }
    } finally { setAiLoading(false); }
  };

  const assignPath = async () => {
    if (!assignForm.user_ids.length) return;
    const r = await fetch(`/api/client/training/paths/${selectedPath!.id}/assign`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(assignForm) });
    const d = await r.json();
    if (d.success) { setShowAssign(false); notify(`Assigné à ${assignForm.user_ids.length} utilisateur(s)`); }
  };

  const reorderModules = async (reordered: TrainingModule[]) => {
    setModules(reordered.map((m, i) => ({ ...m, position: i })));
    const ids = reordered.filter(m => m.id).map(m => m.id!);
    if (ids.length && selectedPath) await fetch(`/api/client/training/paths/${selectedPath.id}/reorder`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: ids }) });
  };

  if (!authChecked || loading) return (
    <div style={{ background: '#02040a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={24} style={{ color: '#0057ff', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (screen === 'onboarding') return <OnboardingChat onDraftReady={handleDraftReady} onSkip={() => setScreen('list')} />;

  // ─── LIST ─────────────────────────────────────────────────────────────────

  if (screen === 'list') return (
    <div style={{ background: '#02040a', minHeight: '100vh', color: '#e2e8f0', fontFamily: "'DM Sans',sans-serif" }}>
      <Toast toast={toast} />
      {/* Grid bg */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(0,87,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,87,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ background: 'rgba(2,4,10,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', height: 56, display: 'flex', alignItems: 'center', padding: '0 32px', gap: 16 }}>
          <button onClick={() => setLocation('/portail-client/accueil')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 13, transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'}>
            <ArrowLeft size={14} /> Accueil
          </button>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: '#0057ff', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>Studio</span>
          <div style={{ flex: 1 }} />
          <button onClick={() => setScreen('onboarding')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#0057ff', border: 'none', color: '#fff', borderRadius: 7, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.15s' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
            <Sparkles size={14} /> Créer avec l'IA
          </button>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '52px 40px' }}>
          <div style={{ marginBottom: 48 }}>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: '#f8fafc', margin: '0 0 8px', letterSpacing: '-0.03em' }}>Mes parcours</h1>
            <p style={{ color: 'rgba(255,255,255,0.3)', margin: 0, fontSize: 14, fontFamily: "'DM Mono',monospace" }}>{paths.length} parcours · formation continue</p>
          </div>

          {paths.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 40px', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 16 }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🎓</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f8fafc', margin: '0 0 10px' }}>Aucun parcours</h3>
              <p style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 28 }}>Créez votre premier parcours de formation avec l'IA</p>
              <button onClick={() => setScreen('onboarding')} style={{ ...btnBlue, fontSize: 15, padding: '12px 28px', borderRadius: 10 }}><Sparkles size={16} /> Créer avec l'IA</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 16 }}>
              {paths.map(path => (
                <PathCard key={path.id} path={path}
                  onEdit={() => openEditor(path)}
                  onToggle={() => togglePublish(path)}
                  onDelete={() => deletePath(path.id)}
                  onTest={() => setLocation(`/portail-client/formation/${path.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <GlobalStyles />
    </div>
  );

  // ─── EDITOR ───────────────────────────────────────────────────────────────

  const activeMod = activeIdx !== null ? modules[activeIdx] : null;
  const activeMeta = activeMod ? getMeta(activeMod) : null;
  const dirty = modules.filter(m => m._dirty).length;

  return (
    <div style={{ background: '#02040a', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans',sans-serif", overflow: 'hidden' }}>
      <Toast toast={toast} />

      {/* Topbar */}
      <div style={{ background: 'rgba(2,4,10,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', height: 52, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flexShrink: 0, zIndex: 10 }}>
        <button onClick={() => { setScreen('list'); setSelectedPath(null); setModules([]); }}
          style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 6, borderRadius: 6, transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'}>
          <ArrowLeft size={15} />
        </button>
        <span style={{ fontSize: 18 }}>{selectedPath?.cover_emoji}</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedPath?.title}</span>
        <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", fontWeight: 700, padding: '2px 8px', borderRadius: 3,
          background: selectedPath?.status === 'published' ? 'rgba(0,245,160,0.1)' : 'rgba(255,255,255,0.05)',
          color: selectedPath?.status === 'published' ? '#00f5a0' : 'rgba(255,255,255,0.3)',
          border: `1px solid ${selectedPath?.status === 'published' ? 'rgba(0,245,160,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
          {selectedPath?.status === 'published' ? '● PUBLIÉ' : '○ BROUILLON'}
        </span>
        {dirty > 0 && <span style={{ fontSize: 11, color: '#f6ab2f', background: 'rgba(246,171,47,0.1)', padding: '2px 8px', borderRadius: 3, fontFamily: "'DM Mono',monospace", border: '1px solid rgba(246,171,47,0.2)' }}>{dirty} non sauvegardé{dirty > 1 ? 's' : ''}</span>}
        <div style={{ flex: 1 }} />
        <button onClick={() => setLocation(`/portail-client/formation/${selectedPath?.id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}>
          <Play size={12} /> Tester
        </button>
        <button onClick={() => setShowAssign(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
          <Users size={12} /> Assigner
        </button>
        <button onClick={() => selectedPath && togglePublish(selectedPath)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: selectedPath?.status === 'published' ? 'rgba(255,255,255,0.05)' : '#0057ff', border: selectedPath?.status === 'published' ? '1px solid rgba(255,255,255,0.08)' : 'none', color: selectedPath?.status === 'published' ? 'rgba(255,255,255,0.4)' : '#fff', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
          {selectedPath?.status === 'published' ? <><EyeOff size={12} /> Dépublier</> : <><Globe size={12} /> Publier</>}
        </button>
      </div>

      {/* 3 cols */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left: modules list */}
        <div style={{ width: 256, flexShrink: 0, background: 'rgba(255,255,255,0.015)', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'DM Mono',monospace" }}>Modules · {modules.length}</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
            {modules.length === 0 && (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>Aucun module</div>
            )}
            {modules.map((mod, idx) => {
              const meta = getMeta(mod);
              const active = activeIdx === idx;
              return (
                <div key={idx} draggable
                  onDragStart={() => { dragIdx.current = idx; }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => {
                    if (dragIdx.current === null || dragIdx.current === idx) return;
                    const arr = [...modules];
                    const [m] = arr.splice(dragIdx.current, 1);
                    arr.splice(idx, 0, m);
                    reorderModules(arr);
                    if (activeIdx === dragIdx.current) setActiveIdx(idx);
                    dragIdx.current = null;
                  }}
                  onClick={() => setActiveIdx(active ? null : idx)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', marginBottom: 2, background: active ? `${meta.color}10` : 'transparent', border: `1px solid ${active ? meta.color + '30' : 'transparent'}`, transition: 'all 0.1s' }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <GripVertical size={11} style={{ color: 'rgba(255,255,255,0.12)', cursor: 'grab', flexShrink: 0 }} />
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color, flexShrink: 0 }}>{meta.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: active ? '#f8fafc' : 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mod.title}</div>
                    <div style={{ fontSize: 10, color: meta.color, fontFamily: "'DM Mono',monospace", opacity: 0.8 }}>{meta.label}</div>
                  </div>
                  {mod._dirty && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f6ab2f', flexShrink: 0 }} />}
                </div>
              );
            })}
          </div>

          {/* Add module buttons */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '10px 8px' }}>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'DM Mono',monospace", margin: '0 4px 7px' }}>Ajouter un module</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              {MODULE_TYPES.map(({ type, label, icon, color, bg }) => (
                <button key={type} onClick={() => addModule(type)}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5, padding: '7px 8px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = bg; (e.currentTarget as HTMLElement).style.borderColor = color + '40'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
                >
                  <span style={{ color, display: 'flex', flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: editor */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#02040a' }}>
          {!activeMod ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.1)', textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 18, opacity: 0.25 }}>✏️</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.2)', margin: '0 0 8px' }}>Sélectionnez un module</p>
              <p style={{ fontSize: 13, margin: 0, color: 'rgba(255,255,255,0.1)' }}>ou ajoutez-en un depuis la colonne gauche</p>
            </div>
          ) : (
            <div style={{ maxWidth: 740, margin: '0 auto', padding: '32px 36px 80px' }}>
              {/* Module header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: activeMeta!.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeMeta!.color }}>{activeMeta!.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <input value={activeMod.title} onChange={e => updateModule(activeIdx!, { title: e.target.value })}
                    style={{ background: 'none', border: 'none', outline: 'none', fontSize: 22, fontWeight: 800, color: '#f8fafc', width: '100%', fontFamily: "'DM Sans',sans-serif", letterSpacing: '-0.02em' }} />
                  <div style={{ fontSize: 11, color: activeMeta!.color, fontFamily: "'DM Mono',monospace", marginTop: 1 }}>{activeMeta!.label}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {activeMod._dirty && (
                    <button onClick={() => saveModule(activeIdx!)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#0057ff', border: 'none', color: '#fff', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      {saving ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={12} />} Sauv.
                    </button>
                  )}
                  <button onClick={() => deleteModule(activeIdx!)}
                    style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: '1px solid rgba(255,59,78,0.2)', borderRadius: 6, padding: '6px 10px', color: '#ff3b4e', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,59,78,0.08)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* AI panel */}
              <div style={{ marginBottom: 28 }}>
                <button onClick={() => setShowAiPanel(p => !p)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: showAiPanel ? 'rgba(0,87,255,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${showAiPanel ? 'rgba(0,87,255,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 8, padding: '10px 14px', color: showAiPanel ? '#60a5fa' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 13, fontWeight: 600, width: '100%', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Sparkles size={14} /> Générer le contenu avec l'IA</div>
                  <ChevronDown size={13} style={{ transform: showAiPanel ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {showAiPanel && (
                  <div style={{ background: 'rgba(0,87,255,0.05)', border: '1px solid rgba(0,87,255,0.15)', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: 14 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input value={aiTopic} onChange={e => setAiTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && generateAI(activeIdx!)}
                        placeholder="Décrivez le sujet à générer…"
                        style={{ flex: 1, background: '#02040a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '9px 12px', color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: "'DM Sans',sans-serif" }} />
                      <button onClick={() => generateAI(activeIdx!)} disabled={aiLoading || !aiTopic.trim()}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0057ff', border: 'none', color: '#fff', borderRadius: 6, padding: '9px 14px', fontSize: 13, fontWeight: 700, cursor: aiTopic.trim() ? 'pointer' : 'default', opacity: aiTopic.trim() ? 1 : 0.4, whiteSpace: 'nowrap' }}>
                        {aiLoading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={13} />}
                        {aiLoading ? 'En cours…' : 'Générer'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <ModuleContentEditor mod={activeMod} onUpdate={u => updateModule(activeIdx!, u)} />
            </div>
          )}
        </div>

        {/* Right: path properties */}
        <div style={{ width: 236, flexShrink: 0, background: 'rgba(255,255,255,0.015)', borderLeft: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', padding: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'DM Mono',monospace", margin: '0 0 16px' }}>Propriétés</p>
          {selectedPath && (
            <PathProps path={selectedPath} onUpdate={async patch => {
              const r = await fetch(`/api/client/training/paths/${selectedPath.id}`, { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
              const d = await r.json();
              if (d.success) { setSelectedPath(p => p ? { ...p, ...patch } : p); notify('Sauvegardé'); }
            }} />
          )}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 18, paddingTop: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'DM Mono',monospace", margin: '0 0 12px' }}>Stats</p>
            {[['Modules', modules.length], ['Durée', `${selectedPath?.estimated_minutes} min`], ['Score certif.', `${selectedPath?.certification_min_score}%`]].map(([l, v]) => (
              <div key={l as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>{l}</span>
                <span style={{ color: 'rgba(255,255,255,0.65)', fontFamily: "'DM Mono',monospace" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assign modal */}
      {showAssign && (
        <Modal title="Assigner le parcours" onClose={() => setShowAssign(false)} width={460}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <Lbl>Utilisateurs</Lbl>
              <div style={{ background: '#050810', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, maxHeight: 200, overflowY: 'auto' }}>
                {users.map(u => (
                  <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <input type="checkbox" checked={assignForm.user_ids.includes(u.id)} onChange={e => setAssignForm(p => ({ ...p, user_ids: e.target.checked ? [...p.user_ids, u.id] : p.user_ids.filter(id => id !== u.id) }))} />
                    <div><div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{u.first_name} {u.last_name}</div><div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{u.email}</div></div>
                  </label>
                ))}
              </div>
            </div>
            <div><Lbl>Échéance</Lbl><input type="date" value={assignForm.due_date} onChange={e => setAssignForm(p => ({ ...p, due_date: e.target.value }))} style={fi} /></div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={assignForm.is_mandatory} onChange={e => setAssignForm(p => ({ ...p, is_mandatory: e.target.checked }))} />
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>Formation obligatoire</span>
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 8 }}>
              <button onClick={() => setShowAssign(false)} style={ghost}>Annuler</button>
              <button onClick={assignPath} disabled={!assignForm.user_ids.length} style={{ ...btnBlue, opacity: assignForm.user_ids.length ? 1 : 0.4 }}><Send size={13} /> Assigner</button>
            </div>
          </div>
        </Modal>
      )}
      <GlobalStyles />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PathProps({ path, onUpdate }: { path: TrainingPath; onUpdate: (p: any) => void }) {
  const [title, setTitle] = useState(path.title);
  const [desc, setDesc] = useState(path.description || '');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      <div><Lbl>Titre</Lbl><input value={title} onChange={e => setTitle(e.target.value)} onBlur={() => onUpdate({ title })} style={fi} /></div>
      <div><Lbl>Description</Lbl><textarea value={desc} onChange={e => setDesc(e.target.value)} onBlur={() => onUpdate({ description: desc })} rows={2} style={{ ...fi, resize: 'vertical' }} /></div>
      <div>
        <Lbl>Couleur</Lbl>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => onUpdate({ cover_color: c })}
              style={{ width: 22, height: 22, background: c, border: path.cover_color === c ? '2px solid #fff' : '2px solid transparent', borderRadius: 4, cursor: 'pointer', transition: 'transform 0.1s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.15)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
            />
          ))}
        </div>
      </div>
      <div>
        <Lbl>Icône</Lbl>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {EMOJIS.map(e => (
            <button key={e} onClick={() => onUpdate({ cover_emoji: e })}
              style={{ width: 28, height: 28, background: path.cover_emoji === e ? 'rgba(0,87,255,0.2)' : 'transparent', border: `1px solid ${path.cover_emoji === e ? 'rgba(0,87,255,0.5)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 5, cursor: 'pointer', fontSize: 14, transition: 'all 0.1s' }}>
              {e}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PathCard({ path, onEdit, onToggle, onDelete, onTest }: any) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border = `1px solid ${path.cover_color}40`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${path.cover_color}15`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
      <div onClick={onEdit} style={{ height: 100, background: `linear-gradient(135deg, ${path.cover_color}cc 0%, ${path.cover_color}66 100%)`, display: 'flex', alignItems: 'center', padding: '0 22px', gap: 16, position: 'relative' }}>
        <span style={{ fontSize: 40 }}>{path.cover_emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: '#fff', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{path.title}</div>
          {path.description && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{path.description}</div>}
        </div>
        <span style={{ position: 'absolute', top: 12, right: 14, fontSize: 10, fontFamily: "'DM Mono',monospace", fontWeight: 700, padding: '2px 7px', borderRadius: 3, background: path.status === 'published' ? 'rgba(0,245,160,0.2)' : 'rgba(0,0,0,0.35)', color: path.status === 'published' ? '#00f5a0' : 'rgba(255,255,255,0.5)' }}>
          {path.status === 'published' ? '● PUBLIÉ' : '○ BROUILLON'}
        </span>
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', gap: 5 }}>
        <button onClick={onEdit} style={{ ...btnBlue, flex: 1, justifyContent: 'center', fontSize: 12, padding: '7px', borderRadius: 6 }}><Edit2 size={12} /> Éditer</button>
        <button onClick={onTest} style={iconBtn}><Play size={13} /></button>
        <button onClick={onToggle} style={iconBtn}>{path.status === 'published' ? <EyeOff size={13} /> : <Eye size={13} />}</button>
        <button onClick={onDelete} style={{ ...iconBtn, color: '#ff3b4e', borderColor: 'rgba(255,59,78,0.2)' }}><Trash2 size={13} /></button>
      </div>
    </div>
  );
}

function ModuleContentEditor({ mod, onUpdate }: { mod: TrainingModule; onUpdate: (u: Partial<TrainingModule>) => void }) {
  const c = mod.content || {};
  const upd = (patch: any) => onUpdate({ content: { ...c, ...patch } });

  if (mod.type === 'cours') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div><Lbl>Résumé introductif</Lbl><textarea value={c.summary||''} onChange={e=>upd({summary:e.target.value})} rows={2} placeholder="Résumé de la leçon…" style={{...fi,resize:'vertical'}} /></div>
      {(c.sections||[]).map((s:any,i:number)=>(
        <div key={i} style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,padding:16}}>
          <div style={{display:'flex',gap:8,marginBottom:10}}>
            <input value={s.heading||''} placeholder="Titre de la section" onChange={e=>{const ss=[...(c.sections||[])];ss[i]={...ss[i],heading:e.target.value};upd({sections:ss});}} style={{...fi,fontWeight:700,fontSize:15}} />
            <button onClick={()=>upd({sections:(c.sections||[]).filter((_:any,j:number)=>j!==i)})} style={{background:'transparent',border:'1px solid rgba(255,59,78,0.2)',borderRadius:7,padding:'8px 10px',color:'#ff3b4e',cursor:'pointer',flexShrink:0}}><Trash2 size={12}/></button>
          </div>
          <textarea value={s.body||''} rows={5} placeholder="Contenu de la section…" onChange={e=>{const ss=[...(c.sections||[])];ss[i]={...ss[i],body:e.target.value};upd({sections:ss});}} style={{...fi,resize:'vertical',fontFamily:"'DM Mono',monospace",fontSize:13,lineHeight:1.65}} />
        </div>
      ))}
      <button onClick={()=>upd({sections:[...(c.sections||[]),{heading:'',body:''}]})} style={{...ghost,alignSelf:'flex-start'}}><Plus size={12}/> Ajouter une section</button>
    </div>
  );

  if (mod.type==='qcm'||mod.is_certification) return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div><Lbl>Instructions</Lbl><input value={c.instructions||''} placeholder="Répondez aux questions ci-dessous…" onChange={e=>upd({instructions:e.target.value})} style={fi}/></div>
      {(c.questions||[]).map((q:any,qi:number)=>(
        <div key={qi} style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,padding:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <span style={{fontSize:10,color:'#60a5fa',fontFamily:"'DM Mono',monospace",fontWeight:700,background:'rgba(96,165,250,0.1)',padding:'2px 8px',borderRadius:3}}>Q{qi+1}</span>
            <button onClick={()=>upd({questions:(c.questions||[]).filter((_:any,j:number)=>j!==qi)})} style={{background:'transparent',border:'none',color:'rgba(255,59,78,0.6)',cursor:'pointer',padding:4}}><X size={13}/></button>
          </div>
          <textarea value={q.question||''} rows={2} placeholder="Énoncé de la question…" onChange={e=>{const qs=[...(c.questions||[])];qs[qi]={...qs[qi],question:e.target.value};upd({questions:qs});}} style={{...fi,resize:'vertical',marginBottom:12}} />
          {(q.options||['','','','']).map((opt:string,oi:number)=>(
            <div key={oi} style={{display:'flex',alignItems:'center',gap:8,marginBottom:7}}>
              <div onClick={()=>{const qs=[...(c.questions||[])];qs[qi]={...qs[qi],correct_index:oi};upd({questions:qs});}} style={{width:16,height:16,borderRadius:'50%',border:`2px solid ${q.correct_index===oi?'#00f5a0':'rgba(255,255,255,0.15)'}`,background:q.correct_index===oi?'#00f5a0':'transparent',cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}>
                {q.correct_index===oi&&<div style={{width:5,height:5,borderRadius:'50%',background:'#02040a'}}/>}
              </div>
              <input value={opt} placeholder={`Réponse ${String.fromCharCode(65+oi)}`} onChange={e=>{const qs=[...(c.questions||[])];const opts=[...(qs[qi].options||['','','',''])];opts[oi]=e.target.value;qs[qi]={...qs[qi],options:opts};upd({questions:qs});}} style={{...fi,flex:1}}/>
            </div>
          ))}
          <textarea value={q.explanation||''} rows={2} placeholder="Explication (affichée après correction)…" onChange={e=>{const qs=[...(c.questions||[])];qs[qi]={...qs[qi],explanation:e.target.value};upd({questions:qs});}} style={{...fi,resize:'vertical',marginTop:10,fontSize:12,color:'rgba(255,255,255,0.45)'}}/>
        </div>
      ))}
      <button onClick={()=>upd({questions:[...(c.questions||[]),{question:'',options:['','','',''],correct_index:0,explanation:''}]})} style={{...ghost,alignSelf:'flex-start'}}><Plus size={12}/> Ajouter une question</button>
    </div>
  );

  if (mod.type==='texte_a_trous') return (
    <div style={{display:'flex',flexDirection:'column',gap:18}}>
      <div><Lbl>Instructions</Lbl><input value={c.instructions||''} placeholder="Complétez les blancs…" onChange={e=>upd({instructions:e.target.value})} style={fi}/></div>
      <div><Lbl>Texte avec <span style={{color:'#60a5fa',fontFamily:"'DM Mono',monospace"}}>[BLANK_1]</span></Lbl><textarea value={c.text_with_blanks||''} rows={6} placeholder="Le [BLANK_1] protège les données…" onChange={e=>upd({text_with_blanks:e.target.value})} style={{...fi,resize:'vertical',fontFamily:"'DM Mono',monospace",fontSize:13,lineHeight:1.7}}/></div>
      <div>
        <Lbl>Réponses attendues</Lbl>
        {(c.blanks||[]).map((b:any,i:number)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'100px 1fr 1fr 32px',gap:6,marginBottom:6,alignItems:'center'}}>
            <span style={{fontSize:11,color:'#60a5fa',fontFamily:"'DM Mono',monospace",fontWeight:600}}>{b.id||`BLANK_${i+1}`}</span>
            <input value={b.answer||''} placeholder="Réponse" onChange={e=>{const bs=[...(c.blanks||[])];bs[i]={...bs[i],answer:e.target.value};upd({blanks:bs});}} style={fi}/>
            <input value={b.hint||''} placeholder="Indice" onChange={e=>{const bs=[...(c.blanks||[])];bs[i]={...bs[i],hint:e.target.value};upd({blanks:bs});}} style={{...fi,color:'rgba(255,255,255,0.4)'}}/>
            <button onClick={()=>upd({blanks:(c.blanks||[]).filter((_:any,j:number)=>j!==i)})} style={{background:'transparent',border:'1px solid rgba(255,59,78,0.2)',borderRadius:5,padding:'7px',color:'#ff3b4e',cursor:'pointer',display:'flex'}}><X size={12}/></button>
          </div>
        ))}
        <button onClick={()=>upd({blanks:[...(c.blanks||[]),{id:`BLANK_${(c.blanks||[]).length+1}`,answer:'',hint:''}]})} style={{...ghost,marginTop:4}}><Plus size={12}/> Ajouter</button>
      </div>
    </div>
  );

  if (mod.type==='exercice_libre') return (
    <div style={{display:'flex',flexDirection:'column',gap:18}}>
      <div><Lbl>Scénario</Lbl><textarea value={c.scenario||''} rows={3} placeholder="Mise en contexte…" onChange={e=>upd({scenario:e.target.value})} style={{...fi,resize:'vertical'}}/></div>
      <div><Lbl>Instructions</Lbl><textarea value={c.instructions||''} rows={4} placeholder="Ce que l'apprenant doit produire…" onChange={e=>upd({instructions:e.target.value})} style={{...fi,resize:'vertical'}}/></div>
      <div><Lbl>Exemple de réponse <span style={{color:'rgba(255,255,255,0.25)',fontWeight:400}}>(affiché après soumission)</span></Lbl><textarea value={c.example_solution||''} rows={3} placeholder="Réponse modèle…" onChange={e=>upd({example_solution:e.target.value})} style={{...fi,resize:'vertical',color:'rgba(255,255,255,0.4)'}}/></div>
    </div>
  );

  if (mod.type==='roleplay') return (
    <div style={{display:'flex',flexDirection:'column',gap:18}}>
      <div><Lbl>Scénario</Lbl><textarea value={c.scenario||''} rows={3} placeholder="Contexte de la simulation…" onChange={e=>upd({scenario:e.target.value})} style={{...fi,resize:'vertical'}}/></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <div><Lbl>Nom du personnage IA</Lbl><input value={c.ai_persona?.name||''} placeholder="Sophie, DRH" onChange={e=>upd({ai_persona:{...(c.ai_persona||{}),name:e.target.value}})} style={fi}/></div>
        <div><Lbl>Rôle de l'apprenant</Lbl><input value={c.learner_role||''} placeholder="Consultant" onChange={e=>upd({learner_role:e.target.value})} style={fi}/></div>
      </div>
      <div><Lbl>Personnalité IA</Lbl><textarea value={c.ai_persona?.personality||''} rows={2} placeholder="Exigeante, directe…" onChange={e=>upd({ai_persona:{...(c.ai_persona||{}),personality:e.target.value}})} style={{...fi,resize:'vertical'}}/></div>
      <div><Lbl>Prompt système</Lbl><textarea value={c.ai_persona?.system_prompt||''} rows={5} placeholder="Instructions injectées dans l'IA…" onChange={e=>upd({ai_persona:{...(c.ai_persona||{}),system_prompt:e.target.value}})} style={{...fi,resize:'vertical',fontFamily:"'DM Mono',monospace",fontSize:12,lineHeight:1.6}}/></div>
    </div>
  );

  return null;
}

function Modal({ title, onClose, children, width = 480 }: any) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#080d14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16, color: '#f8fafc' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', padding: 4 }}><X size={16} /></button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ toast }: { toast: { msg: string; ok: boolean } | null }) {
  if (!toast) return null;
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: toast.ok ? 'rgba(0,245,160,0.1)' : 'rgba(255,59,78,0.1)', border: `1px solid ${toast.ok ? 'rgba(0,245,160,0.3)' : 'rgba(255,59,78,0.3)'}`, color: toast.ok ? '#00f5a0' : '#ff3b4e', padding: '11px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', backdropFilter: 'blur(16px)' }}>
      {toast.ok ? <Check size={14} /> : <X size={14} />} {toast.msg}
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'DM Mono',monospace" }}>{children}</label>;
}

const fi: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '8px 12px', color: '#e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans',sans-serif", transition: 'border-color 0.15s' };
const btnBlue: React.CSSProperties = { background: '#0057ff', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: "'DM Sans',sans-serif", transition: 'opacity 0.15s' };
const ghost: React.CSSProperties = { background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: "'DM Sans',sans-serif" };
const iconBtn: React.CSSProperties = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '7px 10px', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.15s' };

function GlobalStyles() {
  return <style>{`
    @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
    *{box-sizing:border-box}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
    input[type=date]{color-scheme:dark}
  `}</style>;
}
