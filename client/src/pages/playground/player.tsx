import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle, XCircle, Trophy, ChevronRight, ChevronLeft,
  AlertTriangle, Send, Target, Zap, Award, Shield,
  Terminal, Mail, BarChart2, Database, Users, FileText,
  Clock, Check, X, Star, TrendingUp, MessageSquare,
  Eye, RefreshCw, ChevronDown, ChevronUp, Presentation,
  Play, BookOpen, Layers, Code2, CheckSquare, Square,
  Lightbulb, Puzzle, Sparkles, HelpCircle,
} from 'lucide-react';

const MonacoEditor = lazy(() => import('@monaco-editor/react').then(m => ({ default: m.default })));

// â”€â”€â”€ Tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const C = {
  bg:        '#0f1117',
  surface:   '#161b22',
  surfaceEl: '#1c2230',
  border:    '#2d3748',
  borderLt:  '#3d4a5c',
  accent:    '#3b82f6',
  accentHov: '#2563eb',
  accentLt:  '#1e3a5f',
  green:     '#10b981',
  greenLt:   '#064e3b',
  red:       '#ef4444',
  redLt:     '#450a0a',
  amber:     '#f59e0b',
  amberLt:   '#451a03',
  text:      '#f1f5f9',
  sub:       '#94a3b8',
  muted:     '#475569',
};
const FONT = '"DM Sans", "Segoe UI", system-ui, sans-serif';
const MONO = '"DM Mono", "Fira Mono", monospace';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type InteractionType = 'free-text' | 'qcm' | 'fill-blank' | 'checkbox' | 'sql-console' | 'python-console' | 'cyber-terminal';

interface QcmOption { text: string; correct: boolean; }
interface QcmQuestion { question: string; options: QcmOption[]; explanation: string; }
interface Situation {
  id: number; category: string; title: string;
  contexte: string; situation: string; attendu: string; trainerNote?: string;
  interactionType?: InteractionType;
  interactionConfig?: any;
  miniLesson?: Lesson;
}
interface SlideBlock { type: 'text'; content: string; }
interface QuickCheckOption { text: string; correct: boolean; feedback: string; }
interface Slide {
  type: 'concept' | 'analogy' | 'example' | 'why-it-matters' | 'quick-check';
  title: string;
  blocks?: string[];
  question?: string;
  options?: QuickCheckOption[];
}
interface Lesson { title: string; subtitle?: string; slides: Slide[]; }

interface Training {
  title: string; tagline: string; deliveryMode?: string;
  objectives: string[]; modules: { title: string; duration: string; type: string }[];
  situations: Situation[]; qcm: QcmQuestion[];
  gamification: { points: number; badge: string; levels: string[] };
  globalLesson?: Lesson;
}
interface EvalResult {
  score: number; appreciation: string; feedback: string;
  pointsForts: string[]; pointsAmelioration: string[]; reponseExperte: string;
}

// â”€â”€â”€ DÃ©tection domaine â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type Domain = 'cyber' | 'rh' | 'finance' | 'data' | 'management' | 'juridique' | 'generic';

function detectDomain(training: Training): Domain {
  const text = [training.title, training.tagline, ...(training.objectives || []),
    ...(training.situations || []).map(s => s.category + ' ' + s.title)].join(' ').toLowerCase();
  if (/cyber|siem|soc|phishing|malware|rgpd|gdpr|iso.?27|sÃ©curitÃ©|pentest|ransomware|vulnÃ©rabilitÃ©|firewall|rÃ©seau|intrusion/.test(text)) return 'cyber';
  if (/rh|ressources.humaines|recrutement|entretien|paie|onboard|collaborateur|talent|carriÃ¨re|formation|compÃ©tence/.test(text)) return 'rh';
  if (/financ|comptab|budget|audit|trÃ©sor|bilan|fiscalitÃ©|tva|rÃ©sultat|rentabilitÃ©|cash/.test(text)) return 'finance';
  if (/data|analyse|bi|tableau.?de.?bord|rapport|pipeline|machine.?learning|ia|modÃ¨le|dataset/.test(text)) return 'data';
  if (/management|manager|leadership|Ã©quipe|rÃ©union|dÃ©cision|stratÃ©gie|projet|agile|scrum/.test(text)) return 'management';
  if (/juridique|contrat|droit|rÃ©glementation|conformitÃ©|lÃ©gal|procÃ©dure|clause/.test(text)) return 'juridique';
  return 'generic';
}

// â”€â”€â”€ Shells d'interface simulÃ©e â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DOMAIN_SHELL: Record<Domain, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  cyber:      { label: 'Console SOC',        icon: <Shield size={14}/>,      color: '#ef4444', bg: '#1a0a0a' },
  rh:         { label: 'Espace RH',          icon: <Users size={14}/>,       color: '#8b5cf6', bg: '#0f0a1a' },
  finance:    { label: 'Dashboard Finance',  icon: <BarChart2 size={14}/>,   color: '#f59e0b', bg: '#1a1000' },
  data:       { label: 'Data Platform',      icon: <Database size={14}/>,    color: '#06b6d4', bg: '#001a1a' },
  management: { label: 'Espace Manager',     icon: <Target size={14}/>,      color: '#10b981', bg: '#001a10' },
  juridique:  { label: 'Espace ConformitÃ©',  icon: <FileText size={14}/>,    color: '#a78bfa', bg: '#0f0a18' },
  generic:    { label: 'Espace de Travail',  icon: <Layers size={14}/>,      color: '#3b82f6', bg: '#0a1020' },
};

// â”€â”€â”€ Chrono â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function useTimer() {
  const [secs, setSecs] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => { ref.current = setInterval(() => setSecs(s => s + 1), 1000); return () => { if (ref.current) clearInterval(ref.current); }; }, []);
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return fmt(secs);
}

// â”€â”€â”€ Barre de progression â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ProgressBar({ current, total, color }: { current: number; total: number; color: string }) {
  return (
    <div style={{ height: 3, background: C.border, flex: 1 }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${(current / total) * 100}%` }}
        transition={{ duration: 0.4 }} style={{ height: '100%', background: color }} />
    </div>
  );
}

// â”€â”€â”€ Score badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? C.green : score >= 50 ? C.amber : C.red;
  const label = score >= 80 ? 'Excellent' : score >= 50 ? 'Bien' : 'Ã€ revoir';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: `${color}22`, border: `1px solid ${color}44`, color, fontFamily: MONO, fontSize: 11, fontWeight: 700 }}>
      {label} Â· {score}/100
    </span>
  );
}

// â”€â”€â”€ Shell Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ShellHeader({ domain, training, step, totalSteps, timer, score }: {
  domain: Domain; training: Training; step: number; totalSteps: number; timer: string; score: number;
}) {
  const shell = DOMAIN_SHELL[domain];
  return (
    <header style={{
      background: C.surface, borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0, fontFamily: FONT,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', height: 48, borderRight: `1px solid ${C.border}`, minWidth: 200 }}>
        <div style={{ width: 28, height: 28, background: `${shell.color}22`, border: `1px solid ${shell.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: shell.color }}>
          {shell.icon}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: shell.color, fontFamily: MONO, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{shell.label}</p>
          <p style={{ margin: 0, fontSize: 10, color: C.muted, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{training.title}</p>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px' }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted, flexShrink: 0 }}>{step}/{totalSteps}</span>
        <ProgressBar current={step} total={totalSteps} color={shell.color} />
        <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: C.sub, flexShrink: 0 }}>{Math.round((step / totalSteps) * 100)}%</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderLeft: `1px solid ${C.border}` }}>
        <div style={{ padding: '0 16px', height: 48, display: 'flex', alignItems: 'center', gap: 6, borderRight: `1px solid ${C.border}` }}>
          <Zap size={12} style={{ color: C.amber }} />
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.amber, fontWeight: 700 }}>{score} pts</span>
        </div>
        <div style={{ padding: '0 16px', height: 48, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={12} style={{ color: C.muted }} />
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted }}>{timer}</span>
        </div>
      </div>
    </header>
  );
}

// â”€â”€â”€ LeÃ§on plein Ã©cran â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SLIDE_TYPE_META = {
  'concept':       { label: 'Concept',      icon: <Lightbulb size={16}/>,  color: '#0057ff' },
  'analogy':       { label: 'Analogie',     icon: <Puzzle size={16}/>,     color: '#7c3aed' },
  'example':       { label: 'Exemple rÃ©el', icon: <Star size={16}/>,       color: '#0f766e' },
  'why-it-matters':{ label: 'Pourquoi ?',   icon: <Sparkles size={16}/>,   color: '#b45309' },
  'quick-check':   { label: 'VÃ©rification', icon: <HelpCircle size={16}/>, color: '#dc2626' },
};

function LessonSlides({ lesson, domain, onDone, label }: {
  lesson: Lesson; domain: Domain; onDone: () => void; label: string;
}) {
  const shell = DOMAIN_SHELL[domain];
  const [slideIdx, setSlideIdx] = useState(0);
  const [revealedBlocks, setRevealedBlocks] = useState(0);
  const [qcAnswer, setQcAnswer] = useState<number | null>(null);
  const [slidesDone, setSlidesDone] = useState<Set<number>>(new Set());

  const slide = lesson.slides[slideIdx];
  const isQc = slide?.type === 'quick-check';
  const blocks = slide?.blocks || [];
  const totalSlides = lesson.slides.length;
  const isLastSlide = slideIdx === totalSlides - 1;
  const currentDone = slidesDone.has(slideIdx);

  const meta = SLIDE_TYPE_META[slide?.type] ?? SLIDE_TYPE_META['concept'];

  const goNext = () => {
    if (!currentDone) return;
    if (isLastSlide) { onDone(); return; }
    setSlideIdx(i => i + 1);
    setRevealedBlocks(0);
    setQcAnswer(null);
  };

  const goPrev = () => {
    if (slideIdx === 0) return;
    setSlideIdx(i => i - 1);
    setRevealedBlocks(blocks.length);
    setQcAnswer(null);
  };

  const reveal = () => {
    if (isQc) return;
    if (revealedBlocks < blocks.length) {
      setRevealedBlocks(r => r + 1);
      if (revealedBlocks + 1 >= blocks.length) markDone();
    }
  };

  const markDone = () => setSlidesDone(s => new Set([...s, slideIdx]));

  const answerQc = (idx: number) => {
    if (qcAnswer !== null) return;
    setQcAnswer(idx);
    markDone();
  };

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); if (!isQc) reveal(); else if (currentDone) goNext(); }
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [slideIdx, revealedBlocks, currentDone, isQc]);

  if (!slide) return null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: DOMAIN_SHELL[domain].bg, fontFamily: FONT, overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px', height: 52, borderBottom: `1px solid ${shell.color}22`, background: `${shell.color}08`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{ color: shell.color }}>{shell.icon}</div>
          <span style={{ fontFamily: MONO, fontSize: 10, color: shell.color, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{label}</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted }}>Â·</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted }}>{lesson.title}</span>
        </div>
        {/* Slide dots */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {lesson.slides.map((_, i) => (
            <div key={i} style={{ width: i === slideIdx ? 20 : 6, height: 6, background: i === slideIdx ? shell.color : slidesDone.has(i) ? `${shell.color}66` : C.border, transition: 'all .3s' }} />
          ))}
        </div>
        <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted, marginLeft: 16 }}>{slideIdx + 1} / {totalSlides}</span>
      </div>

      {/* Slide content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10vw', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <AnimatePresence mode="wait">
          <motion.div key={slideIdx} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>

            {/* Type badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: `${meta.color}18`, border: `1px solid ${meta.color}44`, color: meta.color }}>
                {meta.icon}
                <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{meta.label}</span>
              </div>
            </div>

            {/* Title */}
            <h1 style={{ margin: '0 0 36px', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, color: C.text, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
              {slide.title}
            </h1>

            {/* Content â€” blocks rÃ©vÃ©lÃ©s progressivement */}
            {!isQc && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {blocks.map((block, i) => (
                  <AnimatePresence key={i}>
                    {i < revealedBlocks && (
                      <motion.div
                        initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}
                        style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 18px', background: `${shell.color}0a`, border: `1px solid ${shell.color}22`, borderLeft: `3px solid ${shell.color}` }}>
                        <span style={{ color: shell.color, fontFamily: MONO, fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{String(i + 1).padStart(2, '0')}</span>
                        <span style={{ fontSize: 16, color: C.text, lineHeight: 1.7 }}>{block}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
                {revealedBlocks < blocks.length && (
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.6 }}
                    style={{ fontFamily: MONO, fontSize: 11, color: C.muted, marginTop: 8 }}>
                    â†“ Cliquez ou appuyez sur Espace pour continuer
                  </motion.div>
                )}
              </div>
            )}

            {/* Quick check */}
            {isQc && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ margin: '0 0 20px', fontSize: 18, color: C.text, lineHeight: 1.5, fontWeight: 600 }}>{slide.question}</p>
                {(slide.options || []).map((opt, i) => {
                  const answered = qcAnswer !== null;
                  const isSelected = qcAnswer === i;
                  let bg = `${C.border}44`, border = C.border, color = C.sub;
                  if (answered) {
                    if (opt.correct) { bg = `${C.green}18`; border = C.green; color = C.green; }
                    else if (isSelected && !opt.correct) { bg = `${C.red}18`; border = C.red; color = C.red; }
                  } else if (isSelected) { bg = `${shell.color}18`; border = shell.color; color = shell.color; }

                  return (
                    <motion.button key={i} whileHover={!answered ? { x: 6 } : {}}
                      onClick={() => answerQc(i)}
                      style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '14px 18px', background: bg, border: `1px solid ${border}`, color, cursor: answered ? 'default' : 'pointer', textAlign: 'left', fontFamily: FONT, fontSize: 15, fontWeight: 500, transition: 'all .15s' }}>
                      <span>{opt.text}</span>
                      {answered && isSelected && opt.feedback && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 12, color: opt.correct ? C.green : C.amber, fontWeight: 400, marginTop: 2 }}>
                          {opt.correct ? 'âœ“ ' : 'â†’ '}{opt.feedback}
                        </motion.span>
                      )}
                      {answered && !isSelected && opt.correct && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 12, color: C.green, fontWeight: 400, marginTop: 2 }}>
                          âœ“ {opt.feedback}
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div style={{ padding: '16px 24px', borderTop: `1px solid ${shell.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: `${shell.color}05` }}>
        <button onClick={goPrev} disabled={slideIdx === 0}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'none', border: `1px solid ${C.border}`, color: slideIdx === 0 ? C.muted : C.sub, cursor: slideIdx === 0 ? 'default' : 'pointer', fontFamily: FONT, fontSize: 13 }}>
          <ChevronLeft size={14} /> PrÃ©cÃ©dent
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          {!isQc && !currentDone && (
            <button onClick={reveal}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: shell.color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: FONT, fontWeight: 700, fontSize: 13 }}>
              {revealedBlocks === 0 ? <><Play size={14}/> Commencer</> : <><ChevronRight size={14}/> Suivant</>}
            </button>
          )}
          {currentDone && (
            <button onClick={goNext}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 28px', background: shell.color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: FONT, fontWeight: 700, fontSize: 14 }}>
              {isLastSlide ? <><Play size={14}/> {label.includes('Mini') ? 'DÃ©marrer la mise en situation' : 'Commencer la formation'}</> : <><ChevronRight size={14}/> Slide suivante</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Panneau contexte gauche (partagÃ©) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ContextPane({ situation, domain, idx }: { situation: Situation; domain: Domain; idx: number }) {
  const shell = DOMAIN_SHELL[domain];
  return (
    <div style={{ width: '42%', background: DOMAIN_SHELL[domain].bg, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}22`, display: 'flex', alignItems: 'center', gap: 8, background: `${shell.color}08` }}>
        <div style={{ display: 'flex', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
        </div>
        <span style={{ fontFamily: MONO, fontSize: 10, color: `${shell.color}99`, letterSpacing: '0.06em' }}>{shell.label} â€” {situation.category}</span>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', background: `${shell.color}22`, border: `1px solid ${shell.color}44`, color: shell.color }}>{situation.category}</span>
          <span style={{ fontFamily: MONO, fontSize: 9, color: C.muted }}>Situation #{String(idx + 1).padStart(2, '0')}</span>
        </div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>{situation.title}</h3>
        {situation.contexte && (
          <div style={{ padding: '10px 12px', background: `${shell.color}0d`, border: `1px solid ${shell.color}22`, borderLeft: `3px solid ${shell.color}` }}>
            <p style={{ margin: '0 0 2px', fontFamily: MONO, fontSize: 9, color: shell.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Contexte</p>
            <p style={{ margin: 0, fontSize: 12.5, color: C.sub, lineHeight: 1.6, fontStyle: 'italic' }}>{situation.contexte}</p>
          </div>
        )}
        <div style={{ height: 1, background: `${C.border}66` }} />
        <div>
          <p style={{ margin: '0 0 6px', fontFamily: MONO, fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mise en situation</p>
          <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.75 }}>{situation.situation}</p>
        </div>
        <div style={{ padding: '8px 12px', background: C.surfaceEl, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }} />
          <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted }}>En attente de votre analyse</span>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ EvalDisplay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function EvalDisplay({ eval_, situation, domain, onNext }: {
  eval_: EvalResult; situation: Situation; domain: Domain; onNext: (score: number) => void;
}) {
  const shell = DOMAIN_SHELL[domain];
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{
          width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: eval_.score >= 80 ? `${C.green}22` : eval_.score >= 50 ? `${C.amber}22` : `${C.red}22`,
          border: `2px solid ${eval_.score >= 80 ? C.green : eval_.score >= 50 ? C.amber : C.red}`,
          fontFamily: MONO, fontSize: 20, fontWeight: 800,
          color: eval_.score >= 80 ? C.green : eval_.score >= 50 ? C.amber : C.red,
        }}>{eval_.score}</div>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: C.text }}>{eval_.appreciation}</p>
          <ScoreBadge score={eval_.score} />
        </div>
      </div>
      <div style={{ marginBottom: 16, padding: '12px 14px', background: C.surfaceEl, border: `1px solid ${C.border}` }}>
        <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: 1.65 }}>{eval_.feedback}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {eval_.pointsForts.length > 0 && (
          <div style={{ padding: '10px 12px', background: `${C.green}11`, border: `1px solid ${C.green}33` }}>
            <p style={{ margin: '0 0 6px', fontFamily: MONO, fontSize: 9, color: C.green, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Points forts</p>
            {eval_.pointsForts.map((p, i) => <p key={i} style={{ margin: '0 0 2px', fontSize: 12, color: C.sub }}>+ {p}</p>)}
          </div>
        )}
        {eval_.pointsAmelioration.length > 0 && (
          <div style={{ padding: '10px 12px', background: `${C.amber}11`, border: `1px solid ${C.amber}33` }}>
            <p style={{ margin: '0 0 6px', fontFamily: MONO, fontSize: 9, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ã€ amÃ©liorer</p>
            {eval_.pointsAmelioration.map((p, i) => <p key={i} style={{ margin: '0 0 2px', fontSize: 12, color: C.sub }}>â†’ {p}</p>)}
          </div>
        )}
      </div>
      {eval_.reponseExperte && (
        <div style={{ marginBottom: 20, padding: '12px 14px', background: `${shell.color}11`, border: `1px solid ${shell.color}33`, borderLeft: `3px solid ${shell.color}` }}>
          <p style={{ margin: '0 0 4px', fontFamily: MONO, fontSize: 9, color: shell.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>RÃ©ponse experte</p>
          <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: 1.65 }}>{eval_.reponseExperte}</p>
        </div>
      )}
      <button onClick={() => setExpanded(!expanded)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: `1px solid ${C.border}`, color: C.muted, padding: '6px 12px', cursor: 'pointer', fontFamily: MONO, fontSize: 10, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />} CritÃ¨res d'Ã©valuation
      </button>
      {expanded && (
        <div style={{ padding: '10px 12px', background: C.surfaceEl, border: `1px solid ${C.border}`, marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 12.5, color: C.sub, lineHeight: 1.65, whiteSpace: 'pre-line' }}>{situation.attendu}</p>
        </div>
      )}
      <button onClick={() => onNext(eval_.score)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: shell.color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: FONT, fontWeight: 700, fontSize: 13 }}>
        Situation suivante <ChevronRight size={15} />
      </button>
    </div>
  );
}

// â”€â”€â”€ Free Text Interaction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FreeTextInteraction({ situation, domain, onNext }: {
  situation: Situation; domain: Domain; onNext: (score: number) => void;
}) {
  const shell = DOMAIN_SHELL[domain];
  const [answer, setAnswer] = useState('');
  const [eval_, setEval] = useState<EvalResult | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!answer.trim() || loading) return;
    setLoading(true);
    try {
      const r = await fetch('/api/studio/evaluate-response', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation: situation.situation, contexte: situation.contexte, attendu: situation.attendu, reponse: answer }),
      });
      setEval(await r.json());
    } catch {
      setEval({ score: 50, appreciation: 'Bien', feedback: 'RÃ©ponse enregistrÃ©e.', pointsForts: [], pointsAmelioration: [], reponseExperte: '' });
    }
    setLoading(false);
  };

  if (eval_) return <EvalDisplay eval_={eval_} situation={situation} domain={domain} onNext={onNext} />;

  return (
    <>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
        <p style={{ margin: '0 0 4px', fontFamily: MONO, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Votre analyse</p>
        <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: 1.5 }}>DÃ©crivez votre dÃ©marche, les points Ã  vÃ©rifier, les actions Ã  prendre.</p>
      </div>
      <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="RÃ©digez votre analyse ici..."
          style={{ flex: 1, padding: '14px', fontSize: 13, fontFamily: FONT, background: C.surface, border: `1px solid ${C.border}`, color: C.text, resize: 'none', outline: 'none', lineHeight: 1.65 }}
          onFocus={e => (e.target.style.borderColor = shell.color)}
          onBlur={e => (e.target.style.borderColor = C.border)} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={submit} disabled={!answer.trim() || loading} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: !answer.trim() || loading ? C.border : shell.color, color: '#fff', border: 'none', cursor: !answer.trim() || loading ? 'not-allowed' : 'pointer', fontFamily: FONT, fontWeight: 700, fontSize: 13 }}>
            {loading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Ã‰valuation...</> : <><Send size={14} /> Soumettre</>}
          </button>
        </div>
      </div>
    </>
  );
}

// â”€â”€â”€ Fill Blank Interaction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FillBlankInteraction({ situation, domain, onNext }: {
  situation: Situation; domain: Domain; onNext: (score: number) => void;
}) {
  const shell = DOMAIN_SHELL[domain];
  const config = situation.interactionConfig || {};
  const template: string = config.template || situation.situation;
  const answers: string[] = config.answers || [];

  const parts = template.split(/\[___\]/g);
  const [inputs, setInputs] = useState<string[]>(answers.map(() => ''));
  const [checked, setChecked] = useState(false);

  const check = () => setChecked(true);
  const correct = answers.filter((a, i) => (inputs[i] || '').trim().toLowerCase() === a.toLowerCase()).length;
  const score = Math.round((correct / Math.max(answers.length, 1)) * 100);

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
      <p style={{ margin: '0 0 20px', fontFamily: MONO, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>ComplÃ©tez les trous</p>
      <div style={{ fontSize: 14, color: C.text, lineHeight: 2.2, marginBottom: 28 }}>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            <span>{part}</span>
            {i < answers.length && (
              <input
                value={inputs[i] || ''}
                onChange={e => { const n = [...inputs]; n[i] = e.target.value; setInputs(n); }}
                disabled={checked}
                style={{
                  display: 'inline-block', padding: '2px 8px', width: Math.max(80, (answers[i]?.length || 6) * 9),
                  background: checked
                    ? (inputs[i]?.trim().toLowerCase() === answers[i]?.toLowerCase() ? `${C.green}22` : `${C.red}22`)
                    : C.surfaceEl,
                  border: `1px solid ${checked
                    ? (inputs[i]?.trim().toLowerCase() === answers[i]?.toLowerCase() ? C.green : C.red)
                    : shell.color}`,
                  color: C.text, fontFamily: MONO, fontSize: 13, outline: 'none',
                  marginInline: 4, verticalAlign: 'middle',
                }}
              />
            )}
            {checked && i < answers.length && inputs[i]?.trim().toLowerCase() !== answers[i]?.toLowerCase() && (
              <span style={{ fontFamily: MONO, fontSize: 11, color: C.green, marginLeft: 4 }}>({answers[i]})</span>
            )}
          </React.Fragment>
        ))}
      </div>
      {!checked ? (
        <button onClick={check} disabled={inputs.some(v => !v.trim())} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: inputs.some(v => !v.trim()) ? C.border : shell.color, color: '#fff', border: 'none', cursor: inputs.some(v => !v.trim()) ? 'not-allowed' : 'pointer', fontFamily: FONT, fontWeight: 700, fontSize: 13 }}>
          <Check size={14} /> VÃ©rifier
        </button>
      ) : (
        <div>
          <div style={{ padding: '14px 16px', marginBottom: 16, background: score >= 80 ? `${C.green}18` : `${C.amber}18`, border: `1px solid ${score >= 80 ? C.green : C.amber}44` }}>
            <p style={{ margin: '0 0 4px', fontFamily: MONO, fontSize: 11, color: score >= 80 ? C.green : C.amber, fontWeight: 700 }}>
              {correct}/{answers.length} correct{correct > 1 ? 's' : ''} â€” {score} pts
            </p>
            <p style={{ margin: 0, fontSize: 13, color: C.sub }}>{score >= 80 ? 'Excellent ! Toutes les cases sont bien remplies.' : 'Certaines rÃ©ponses sont incorrectes, les bonnes rÃ©ponses sont affichÃ©es en vert.'}</p>
          </div>
          <button onClick={() => onNext(score)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: shell.color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: FONT, fontWeight: 700, fontSize: 13 }}>
            Situation suivante <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Checkbox Interaction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CheckboxInteraction({ situation, domain, onNext }: {
  situation: Situation; domain: Domain; onNext: (score: number) => void;
}) {
  const shell = DOMAIN_SHELL[domain];
  const config = situation.interactionConfig || {};
  const items: { label: string; correct: boolean }[] = config.items || [];
  const instruction: string = config.instruction || 'SÃ©lectionnez toutes les rÃ©ponses correctes.';

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);

  const toggle = (i: number) => {
    if (checked) return;
    const n = new Set(selected);
    n.has(i) ? n.delete(i) : n.add(i);
    setSelected(n);
  };

  const correctSet = new Set(items.map((it, i) => it.correct ? i : -1).filter(i => i >= 0));
  const check = () => setChecked(true);

  const tp = [...selected].filter(i => correctSet.has(i)).length;
  const fp = [...selected].filter(i => !correctSet.has(i)).length;
  const fn = [...correctSet].filter(i => !selected.has(i)).length;
  const precision = selected.size > 0 ? tp / selected.size : 0;
  const recall = correctSet.size > 0 ? tp / correctSet.size : 0;
  const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;
  const score = Math.round(f1 * 100);

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
      <p style={{ margin: '0 0 6px', fontFamily: MONO, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cases Ã  cocher</p>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: C.sub }}>{instruction}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {items.map((item, i) => {
          const sel = selected.has(i);
          let bg = C.surface, border = C.border, color = C.sub;
          if (checked) {
            if (item.correct && sel) { bg = `${C.green}18`; border = C.green; color = C.green; }
            else if (item.correct && !sel) { bg = `${C.amber}18`; border = C.amber; color = C.amber; }
            else if (!item.correct && sel) { bg = `${C.red}18`; border = C.red; color = C.red; }
          } else if (sel) {
            bg = `${shell.color}18`; border = shell.color; color = shell.color;
          }
          return (
            <button key={i} onClick={() => toggle(i)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: bg, border: `1px solid ${border}`, color, cursor: checked ? 'default' : 'pointer', fontFamily: FONT, fontSize: 13, textAlign: 'left', width: '100%', transition: 'all .15s' }}>
              <div style={{ flexShrink: 0, width: 18, height: 18, border: `2px solid ${sel || checked ? border : C.border}`, background: sel ? `${border}33` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {sel && <Check size={11} />}
                {checked && item.correct && !sel && <span style={{ fontSize: 10, color: C.amber }}>!</span>}
              </div>
              {item.label}
              {checked && item.correct && <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 9, color: C.green }}>CORRECT</span>}
              {checked && !item.correct && sel && <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 9, color: C.red }}>INCORRECT</span>}
            </button>
          );
        })}
      </div>
      {!checked ? (
        <button onClick={check} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: shell.color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: FONT, fontWeight: 700, fontSize: 13 }}>
          <Check size={14} /> Valider ma sÃ©lection
        </button>
      ) : (
        <div>
          <div style={{ padding: '14px 16px', marginBottom: 16, background: `${shell.color}11`, border: `1px solid ${shell.color}33` }}>
            <p style={{ margin: '0 0 4px', fontFamily: MONO, fontSize: 11, color: shell.color, fontWeight: 700 }}>Score : {score} pts</p>
            <p style={{ margin: 0, fontSize: 12, color: C.sub }}>{tp} correctement sÃ©lectionnÃ©{tp > 1 ? 's' : ''} Â· {fp} faux positif{fp > 1 ? 's' : ''} Â· {fn} oubliÃ©{fn > 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => onNext(score)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: shell.color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: FONT, fontWeight: 700, fontSize: 13 }}>
            Situation suivante <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Code Console Interaction (SQL + Python) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CodeConsoleInteraction({ situation, domain, onNext }: {
  situation: Situation; domain: Domain; onNext: (score: number) => void;
}) {
  const shell = DOMAIN_SHELL[domain];
  const lang: 'sql' | 'python' = situation.interactionType === 'sql-console' ? 'sql' : 'python';
  const config = situation.interactionConfig || {};
  const defaultCode: string = config.defaultCode || (lang === 'sql' ? '-- Ã‰crivez votre requÃªte SQL ici\nSELECT ' : '# Ã‰crivez votre code Python ici\n');
  const hint: string = config.hint || '';

  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [eval_, setEval] = useState<EvalResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  const run = async () => {
    if (running) return;
    setRunning(true);
    setOutput('');
    try {
      const endpoint = lang === 'sql' ? '/api/code/execute/sql' : '/api/code/execute/python';
      const r = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await r.json();
      setOutput(data.output || data.result || data.error || 'ExÃ©cutÃ© sans sortie.');
    } catch (e) {
      setOutput('Erreur de connexion au serveur d\'exÃ©cution.');
    }
    setRunning(false);
  };

  const evaluate = async () => {
    setEvaluating(true);
    try {
      const r = await fetch('/api/studio/evaluate-response', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: situation.situation, contexte: situation.contexte,
          attendu: situation.attendu, reponse: `Code ${lang.toUpperCase()}:\n${code}\n\nSortie:\n${output}`,
        }),
      });
      setEval(await r.json());
    } catch {
      setEval({ score: 70, appreciation: 'Bien', feedback: 'Code soumis.', pointsForts: [], pointsAmelioration: [], reponseExperte: '' });
    }
    setEvaluating(false);
  };

  if (eval_) return <EvalDisplay eval_={eval_} situation={situation} domain={domain} onNext={onNext} />;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ padding: '8px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10, background: C.surfaceEl, flexShrink: 0 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: lang === 'sql' ? '#06b6d4' : '#f59e0b', fontWeight: 700, padding: '2px 8px', border: `1px solid ${lang === 'sql' ? '#06b6d444' : '#f59e0b44'}`, background: lang === 'sql' ? '#06b6d411' : '#f59e0b11' }}>
          {lang.toUpperCase()}
        </span>
        {hint && <span style={{ fontSize: 11, color: C.muted, flex: 1 }}>{hint}</span>}
        <button onClick={run} disabled={running} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', background: running ? C.border : C.green, color: '#fff', border: 'none', cursor: running ? 'not-allowed' : 'pointer', fontFamily: MONO, fontSize: 11, fontWeight: 700 }}>
          {running ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Play size={12} />}
          {running ? 'ExÃ©cution...' : 'ExÃ©cuter'}
        </button>
      </div>

      {/* Editor + Output */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <Suspense fallback={<div style={{ flex: 1, background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 11, color: C.muted }}>Chargement Ã©diteur...</div>}>
            <MonacoEditor
              height="100%"
              language={lang}
              value={code}
              onChange={v => setCode(v || '')}
              theme="vs-dark"
              options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, lineNumbers: 'on', wordWrap: 'on', fontFamily: MONO }}
            />
          </Suspense>
        </div>

        {/* Output panel */}
        <div style={{ height: 160, borderTop: `1px solid ${C.border}`, background: '#0d1117', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '6px 14px', borderBottom: `1px solid ${C.border}22`, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Terminal size={11} style={{ color: C.muted }} />
            <span style={{ fontFamily: MONO, fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sortie</span>
            {output && (
              <button onClick={evaluate} disabled={evaluating} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: evaluating ? C.border : shell.color, color: '#fff', border: 'none', cursor: evaluating ? 'not-allowed' : 'pointer', fontFamily: MONO, fontSize: 9, fontWeight: 700 }}>
                {evaluating ? <RefreshCw size={10} style={{ animation: 'spin 1s linear infinite' }} /> : <Award size={10} />}
                Ã‰valuer
              </button>
            )}
          </div>
          <pre style={{ flex: 1, margin: 0, padding: '10px 14px', overflow: 'auto', fontFamily: MONO, fontSize: 12, color: output.toLowerCase().includes('error') || output.toLowerCase().includes('erreur') ? C.red : C.green, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {output || <span style={{ color: C.muted }}>ExÃ©cutez votre code pour voir la sortie...</span>}
          </pre>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Cyber Terminal Interaction â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CYBER_COMMANDS: Record<string, string> = {
  help: `Commandes disponibles: ls, cat <fichier>, netstat, ps aux, iptables -L, whoami, id, find /etc -name "*.conf", grep -r "password" /var/log, history, clear`,
  ls: `total 48
drwxr-xr-x  8 root root 4096 Jun  7 08:21 .
drwxr-xr-x 24 root root 4096 Jun  7 08:00 ..
-rw-r--r--  1 root root  512 Jun  7 07:45 alert_20240607.log
-rw-r--r--  1 root root 1024 Jun  7 08:15 auth.log
drwxr-xr-x  2 root root 4096 Jun  6 23:00 backups
-rw-r-----  1 root root  256 Jun  7 08:21 firewall.rules
drwxr-xr-x  3 www-data www-data 4096 Jun  5 14:33 www`,
  'cat auth.log': `Jun  7 07:43:22 srv sshd[1234]: Failed password for root from 185.220.101.47 port 52341 ssh2
Jun  7 07:43:24 srv sshd[1234]: Failed password for root from 185.220.101.47 port 52342 ssh2
Jun  7 07:43:26 srv sshd[1234]: Failed password for root from 185.220.101.47 port 52343 ssh2
Jun  7 07:43:28 srv sshd[1234]: Failed password for root from 185.220.101.47 port 52344 ssh2
Jun  7 07:44:01 srv sshd[1234]: Accepted publickey for deploy from 10.0.1.15 port 60012 ssh2
Jun  7 08:01:55 srv sshd[2891]: Failed password for invalid user admin from 192.168.1.102 port 48821 ssh2`,
  'cat alert_20240607.log': `[CRITICAL] 07:43:22 - Brute force SSH dÃ©tectÃ©: 185.220.101.47 (47 tentatives en 60s)
[WARNING]  08:01:55 - Tentative connexion user inexistant 'admin' depuis 192.168.1.102
[INFO]     08:15:00 - Scan de ports dÃ©tectÃ© depuis 10.10.0.99 (nmap -sS)
[CRITICAL] 08:18:33 - Exfiltration potentielle: 450MB envoyÃ©s vers 91.198.174.192 (RU)`,
  'cat firewall.rules': `*filter
:INPUT DROP [0:0]
:FORWARD DROP [0:0]
:OUTPUT ACCEPT [0:0]
-A INPUT -i lo -j ACCEPT
-A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
-A INPUT -p tcp --dport 22 -j ACCEPT
-A INPUT -p tcp --dport 443 -j ACCEPT
COMMIT`,
  netstat: `Active Internet connections (only servers)
Proto Local Address    Foreign Address   State       PID/Program
tcp   0.0.0.0:22       0.0.0.0:*         LISTEN      891/sshd
tcp   0.0.0.0:443      0.0.0.0:*         LISTEN      1203/nginx
tcp   127.0.0.1:5432   0.0.0.0:*         LISTEN      1455/postgres
tcp   0.0.0.0:8080     0.0.0.0:*         LISTEN      3312/node
tcp   10.0.1.5:22      185.220.101.47:52341 TIME_WAIT  -
tcp   10.0.1.5:443     91.198.174.192:60241 ESTABLISHED 1203/nginx`,
  'ps aux': `USER       PID  %CPU %MEM COMMAND
root         1   0.0  0.1 /sbin/init
root       891   0.0  0.2 /usr/sbin/sshd -D
www-data  1203   0.1  1.2 nginx: worker process
postgres  1455   0.2  4.1 postgres: checkpointer
node      3312   2.3  8.4 node /app/server.js
root      4421   0.0  0.1 /usr/lib/systemd/systemd-journald
root      9912  45.2  0.8 python3 /tmp/.hidden/miner.py`,
  'iptables -L': `Chain INPUT (policy DROP)
target  prot  source              destination
ACCEPT  all   anywhere            anywhere  /* lo */
ACCEPT  all   anywhere            anywhere  /* established */
ACCEPT  tcp   anywhere            anywhere  tcp dpt:ssh
ACCEPT  tcp   anywhere            anywhere  tcp dpt:https
Chain FORWARD (policy DROP)
Chain OUTPUT (policy ACCEPT)`,
  whoami: 'soc-analyst',
  id: 'uid=1001(soc-analyst) gid=1001(soc-analyst) groups=1001(soc-analyst),4(adm),24(cdrom)',
  'find /etc -name "*.conf"': `/etc/nginx/nginx.conf
/etc/nginx/sites-enabled/default.conf
/etc/postgresql/14/main/pg_hba.conf
/etc/ssh/sshd_config
/etc/fail2ban/jail.conf`,
  'grep -r "password" /var/log': `auth.log:Jun 7 07:43:22 Failed password for root from 185.220.101.47
auth.log:Jun 7 07:43:24 Failed password for root from 185.220.101.47
auth.log:Jun 7 08:01:55 Failed password for invalid user admin from 192.168.1.102`,
  history: `1  last -n 20
2  netstat -tulpn
3  cat /var/log/auth.log
4  grep "Failed" /var/log/auth.log | awk '{print $11}' | sort | uniq -c
5  iptables -L -n
6  ps aux | grep -v "\\[" | sort -k3 -rn | head -20
7  ls -la /tmp/.hidden/`,
  'ls -la /tmp/.hidden/': `total 28
drwxr-xr-x 2 root root 4096 Jun  6 23:14 .
drwxrwxrwt 9 root root 4096 Jun  7 08:00 ..
-rwxr-xr-x 1 root root 8192 Jun  6 23:14 miner.py
-rw-r--r-- 1 root root  256 Jun  7 08:18 config.json`,
  clear: '__CLEAR__',
};

function CyberTerminalInteraction({ situation, domain, onNext }: {
  situation: Situation; domain: Domain; onNext: (score: number) => void;
}) {
  const shell = DOMAIN_SHELL[domain];
  const config = situation.interactionConfig || {};
  const objective: string = config.objective || situation.attendu || 'Analysez la situation et identifiez les menaces.';

  const [lines, setLines] = useState<{ type: 'prompt' | 'output' | 'error'; text: string }[]>([
    { type: 'output', text: `SOC Terminal v2.4.1 â€” ${new Date().toISOString().replace('T', ' ').substring(0, 19)}` },
    { type: 'output', text: 'ConnectÃ© en tant que: soc-analyst@srv-soc-01' },
    { type: 'output', text: 'Tapez "help" pour voir les commandes disponibles.' },
    { type: 'output', text: '' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [done, setDone] = useState(false);
  const [score, setScoreVal] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines]);

  const execCmd = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;
    setHistory(h => [cmd, ...h]);
    setHistIdx(-1);
    setLines(l => [...l, { type: 'prompt', text: `soc@srv-01:~$ ${cmd}` }]);
    const result = CYBER_COMMANDS[trimmed] || CYBER_COMMANDS[trimmed.split(' ')[0]];
    if (result === '__CLEAR__') {
      setLines([]);
    } else if (result) {
      setLines(l => [...l, { type: 'output', text: result }]);
    } else {
      setLines(l => [...l, { type: 'error', text: `bash: ${cmd.trim()}: commande introuvable` }]);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { execCmd(input); setInput(''); }
    else if (e.key === 'ArrowUp') { const idx = Math.min(histIdx + 1, history.length - 1); setHistIdx(idx); setInput(history[idx] || ''); }
    else if (e.key === 'ArrowDown') { const idx = Math.max(histIdx - 1, -1); setHistIdx(idx); setInput(idx === -1 ? '' : history[idx]); }
  };

  const finish = () => {
    const cmdsRun = history.length;
    const s = Math.min(100, Math.max(40, cmdsRun * 12));
    setScoreVal(s);
    setDone(true);
  };

  if (done) return (
    <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
      <div style={{ padding: '14px 16px', marginBottom: 20, background: `${shell.color}11`, border: `1px solid ${shell.color}33` }}>
        <p style={{ margin: '0 0 4px', fontFamily: MONO, fontSize: 11, color: shell.color, fontWeight: 700 }}>Analyse terminÃ©e â€” {score} pts</p>
        <p style={{ margin: 0, fontSize: 13, color: C.sub }}>Vous avez exÃ©cutÃ© {history.length} commande{history.length > 1 ? 's' : ''}.</p>
      </div>
      <div style={{ padding: '12px 14px', marginBottom: 20, background: `${shell.color}0d`, borderLeft: `3px solid ${shell.color}` }}>
        <p style={{ margin: '0 0 4px', fontFamily: MONO, fontSize: 9, color: shell.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Points clÃ©s attendus</p>
        <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: 1.65, whiteSpace: 'pre-line' }}>{objective}</p>
      </div>
      <button onClick={() => onNext(score)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: shell.color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: FONT, fontWeight: 700, fontSize: 13 }}>
        Situation suivante <ChevronRight size={15} />
      </button>
    </div>
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0d0d0d' }}>
      {/* Terminal toolbar */}
      <div style={{ padding: '8px 14px', borderBottom: `1px solid ${C.red}33`, display: 'flex', alignItems: 'center', gap: 8, background: '#1a0a0a', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
        </div>
        <span style={{ fontFamily: MONO, fontSize: 10, color: '#ef444499', letterSpacing: '0.06em', flex: 1 }}>soc-analyst@srv-soc-01 â€” Terminal SOC</span>
        <button onClick={finish} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', background: `${shell.color}22`, border: `1px solid ${shell.color}44`, color: shell.color, cursor: 'pointer', fontFamily: MONO, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <Award size={10} /> Terminer l'analyse
        </button>
      </div>

      {/* Objective banner */}
      <div style={{ padding: '8px 14px', background: '#1a0a0a', borderBottom: `1px solid ${C.red}22`, flexShrink: 0 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: '#ef4444aa' }}>OBJECTIF: </span>
        <span style={{ fontFamily: MONO, fontSize: 10, color: '#ffffff88' }}>{objective.split('\n')[0].substring(0, 120)}</span>
      </div>

      {/* Output */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px', fontFamily: MONO, fontSize: 12 }} onClick={() => inputRef.current?.focus()}>
        {lines.map((line, i) => (
          <div key={i} style={{ lineHeight: 1.7, color: line.type === 'prompt' ? '#10b981' : line.type === 'error' ? '#ef4444' : '#d0d0d0', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {line.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '8px 14px', borderTop: `1px solid ${C.red}22`, display: 'flex', alignItems: 'center', gap: 8, background: '#0d0d0d', flexShrink: 0 }}>
        <span style={{ fontFamily: MONO, fontSize: 12, color: '#10b981', flexShrink: 0 }}>soc@srv-01:~$</span>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: MONO, fontSize: 12, color: '#f0f0f0', caretColor: '#10b981' }}
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
}

// â”€â”€â”€ Situation Screen (dispatch) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SituationScreen({ situation, domain, idx, total, onNext }: {
  situation: Situation; domain: Domain; idx: number; total: number; onNext: (score: number) => void;
}) {
  const itype = situation.interactionType || 'free-text';

  if (itype === 'cyber-terminal') {
    return (
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ContextPane situation={situation} domain={domain} idx={idx} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <CyberTerminalInteraction situation={situation} domain={domain} onNext={onNext} />
        </div>
      </div>
    );
  }

  if (itype === 'sql-console' || itype === 'python-console') {
    return (
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ContextPane situation={situation} domain={domain} idx={idx} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
          <CodeConsoleInteraction situation={situation} domain={domain} onNext={onNext} />
        </div>
      </div>
    );
  }

  if (itype === 'fill-blank') {
    return (
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ContextPane situation={situation} domain={domain} idx={idx} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
          <FillBlankInteraction situation={situation} domain={domain} onNext={onNext} />
        </div>
      </div>
    );
  }

  if (itype === 'checkbox') {
    return (
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ContextPane situation={situation} domain={domain} idx={idx} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
          <CheckboxInteraction situation={situation} domain={domain} onNext={onNext} />
        </div>
      </div>
    );
  }

  // Default: free-text
  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <ContextPane situation={situation} domain={domain} idx={idx} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
        <FreeTextInteraction situation={situation} domain={domain} onNext={onNext} />
      </div>
    </div>
  );
}

// â”€â”€â”€ Situation â€” PrÃ©sentiel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SituationTrainer({ situation, domain, idx, total, onNext }: {
  situation: Situation; domain: Domain; idx: number; total: number; onNext: () => void;
}) {
  const shell = DOMAIN_SHELL[domain];
  const [phase, setPhase] = useState<'context' | 'situation' | 'debrief'>('context');
  const [timerActive, setTimerActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => { setTimerActive(true); timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000); };
  const stopTimer = () => { setTimerActive(false); if (timerRef.current) clearInterval(timerRef.current); };
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const attenduLines = (situation.attendu || '').split('\n').filter(l => l.trim());

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <div style={{ width: '55%', display: 'flex', flexDirection: 'column', background: DOMAIN_SHELL[domain].bg, borderRight: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}22`, background: `${shell.color}08` }}>
          {(['context', 'situation', 'debrief'] as const).map((p, i) => (
            <button key={p} onClick={() => setPhase(p)} style={{ flex: 1, padding: '10px 8px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: phase === p ? shell.color : C.muted, borderBottom: `2px solid ${phase === p ? shell.color : 'transparent'}`, transition: 'color .15s, border-color .15s' }}>
              {i + 1}. {p === 'context' ? 'Contexte' : p === 'situation' ? 'Mise en situation' : 'DÃ©brief'}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          <AnimatePresence mode="wait">
            {phase === 'context' && (
              <motion.div key="ctx" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontFamily: MONO, fontSize: 9, padding: '3px 8px', background: `${shell.color}22`, border: `1px solid ${shell.color}44`, color: shell.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{situation.category}</span>
                </div>
                <h2 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 800, color: C.text, lineHeight: 1.3 }}>{situation.title}</h2>
                {situation.contexte && (
                  <div style={{ padding: '14px 16px', background: `${shell.color}0d`, borderLeft: `3px solid ${shell.color}`, marginBottom: 16 }}>
                    <p style={{ margin: '0 0 4px', fontFamily: MONO, fontSize: 9, color: shell.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Point clÃ©</p>
                    <p style={{ margin: 0, fontSize: 14, color: C.sub, lineHeight: 1.7, fontStyle: 'italic' }}>{situation.contexte}</p>
                  </div>
                )}
                <button onClick={() => setPhase('situation')} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, padding: '10px 20px', background: shell.color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: FONT, fontWeight: 600, fontSize: 13 }}>
                  PrÃ©senter la mise en situation <ChevronRight size={14} />
                </button>
              </motion.div>
            )}
            {phase === 'situation' && (
              <motion.div key="sit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: C.text }}>Ã€ prÃ©senter au groupe</h3>
                <p style={{ margin: '0 0 20px', fontSize: 13.5, color: C.sub, lineHeight: 1.75 }}>{situation.situation}</p>
                <div style={{ padding: '12px 16px', background: C.surfaceEl, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={14} style={{ color: C.amber }} />
                    <span style={{ fontFamily: MONO, fontSize: 12, color: C.amber, fontWeight: 700 }}>{fmtTime(elapsed)}</span>
                    <span style={{ fontSize: 12, color: C.muted }}>â€” ActivitÃ© groupe</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {!timerActive
                      ? <button onClick={startTimer} style={{ padding: '5px 12px', background: C.green, border: 'none', color: '#fff', cursor: 'pointer', fontFamily: FONT, fontWeight: 600, fontSize: 11 }}>DÃ©marrer</button>
                      : <button onClick={stopTimer} style={{ padding: '5px 12px', background: C.red, border: 'none', color: '#fff', cursor: 'pointer', fontFamily: FONT, fontWeight: 600, fontSize: 11 }}>ArrÃªter</button>
                    }
                  </div>
                </div>
                <button onClick={() => setPhase('debrief')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: shell.color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: FONT, fontWeight: 600, fontSize: 13 }}>
                  Passer au dÃ©brief <ChevronRight size={14} />
                </button>
              </motion.div>
            )}
            {phase === 'debrief' && (
              <motion.div key="deb" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: C.text }}>Points de dÃ©brief</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                  {attenduLines.map((line, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', background: `${shell.color}0d`, border: `1px solid ${shell.color}22` }}>
                      <Check size={13} style={{ color: shell.color, flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 13, color: C.sub, lineHeight: 1.5 }}>{line.replace(/^\d+\.\s*/, '')}</span>
                    </div>
                  ))}
                </div>
                {situation.trainerNote && (
                  <div style={{ padding: '12px 14px', background: '#1a1030', border: '1px solid #3730a388', marginBottom: 16 }}>
                    <p style={{ margin: '0 0 4px', fontFamily: MONO, fontSize: 9, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Note formateur</p>
                    <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: 1.6 }}>{situation.trainerNote}</p>
                  </div>
                )}
                <button onClick={onNext} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: shell.color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: FONT, fontWeight: 600, fontSize: 13 }}>
                  Situation suivante <ChevronRight size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div style={{ flex: 1, background: C.bg, overflow: 'auto', padding: '24px' }}>
        <div style={{ padding: '10px 14px', background: '#1a1030', border: '1px solid #3730a388', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <Presentation size={13} style={{ color: '#818cf8' }} />
            <span style={{ fontFamily: MONO, fontSize: 10, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Vue formateur</span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.55 }}>Situation {idx + 1}/{total} Â· Progressez via les onglets Ã  gauche.</p>
        </div>
        <p style={{ margin: '0 0 6px', fontFamily: MONO, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Questions de discussion</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          {["Qu'est-ce qui vous a alertÃ© en premier dans cette situation ?", "Quelles informations manquantes vous auriez demandÃ©es ?", "Y a-t-il eu des erreurs de jugement ? Lesquelles ?"].map((q, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', background: C.surfaceEl, border: `1px solid ${C.border}` }}>
              <MessageSquare size={12} style={{ color: C.muted, flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.5 }}>{q}</span>
            </div>
          ))}
        </div>
        <p style={{ margin: '0 0 6px', fontFamily: MONO, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>DurÃ©e recommandÃ©e</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ phase: 'PrÃ©sentation', t: '2 min' }, { phase: 'ActivitÃ©', t: '10 min' }, { phase: 'DÃ©brief', t: '5 min' }].map((item, i) => (
            <div key={i} style={{ flex: 1, padding: '8px 10px', background: C.surfaceEl, border: `1px solid ${C.border}`, textAlign: 'center' }}>
              <p style={{ margin: '0 0 3px', fontFamily: MONO, fontSize: 10, color: C.muted }}>{item.phase}</p>
              <p style={{ margin: 0, fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.amber }}>{item.t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Question QCM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function QcmScreen({ question, qIdx, total, domain, onNext }: {
  question: QcmQuestion; qIdx: number; total: number; domain: Domain; onNext: (correct: boolean) => void;
}) {
  const shell = DOMAIN_SHELL[domain];
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const correctIdx = question.options.findIndex(o => typeof o === 'object' ? o.correct : false);

  return (
    <div style={{ display: 'flex', flex: 1, alignItems: 'flex-start', justifyContent: 'center', padding: '40px 60px', overflow: 'auto' }}>
      <div style={{ width: '100%', maxWidth: 700 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted, padding: '3px 8px', background: C.surfaceEl, border: `1px solid ${C.border}` }}>QCM {qIdx + 1}/{total}</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: shell.color }}>+50 pts si correct</span>
        </div>
        <h2 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: C.text, lineHeight: 1.4 }}>{question.question}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {(question.options || []).map((opt, i) => {
            const text = typeof opt === 'string' ? opt : opt.text;
            const isCorrect = typeof opt === 'object' ? opt.correct : i === correctIdx;
            const isSelected = selected === i;
            let bg = C.surface, border = C.border, color = C.sub;
            if (answered) {
              if (isCorrect) { bg = `${C.green}18`; border = `${C.green}66`; color = C.green; }
              else if (isSelected && !isCorrect) { bg = `${C.red}18`; border = `${C.red}66`; color = C.red; }
            } else if (isSelected) { bg = `${shell.color}18`; border = `${shell.color}66`; color = shell.color; }
            return (
              <motion.button key={i} whileHover={!answered ? { x: 4 } : {}} onClick={() => !answered && setSelected(i)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: bg, border: `1px solid ${border}`, color, cursor: answered ? 'default' : 'pointer', textAlign: 'left', width: '100%', fontFamily: FONT, fontSize: 13, fontWeight: isSelected || (answered && isCorrect) ? 600 : 400, transition: 'background .15s, border-color .15s, color .15s' }}>
                <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, flexShrink: 0, width: 18 }}>
                  {answered ? (isCorrect ? <Check size={13} /> : isSelected ? <X size={13} /> : String.fromCharCode(65 + i)) : String.fromCharCode(65 + i)}
                </span>
                {text}
              </motion.button>
            );
          })}
        </div>
        <AnimatePresence>
          {answered && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              {question.explanation && (
                <div style={{ padding: '12px 14px', background: C.surfaceEl, border: `1px solid ${C.border}`, marginBottom: 16 }}>
                  <p style={{ margin: '0 0 4px', fontFamily: MONO, fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Explication</p>
                  <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: 1.65 }}>{question.explanation}</p>
                </div>
              )}
              <button onClick={() => onNext(typeof question.options[selected!] === 'object' ? (question.options[selected!] as QcmOption).correct : selected === correctIdx)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: shell.color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: FONT, fontWeight: 700, fontSize: 13 }}>
                {qIdx + 1 < total ? 'Question suivante' : 'Voir les rÃ©sultats'} <ChevronRight size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// â”€â”€â”€ Ã‰cran intro â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function IntroScreen({ training, domain, onStart }: { training: Training; domain: Domain; onStart: () => void }) {
  const shell = DOMAIN_SHELL[domain];
  const isTrainer = training.deliveryMode === 'trainer';
  const interactionTypes = [...new Set((training.situations || []).map(s => s.interactionType || 'free-text'))];
  const typeLabels: Record<InteractionType, string> = {
    'free-text': 'Analyse libre', 'qcm': 'QCM', 'fill-blank': 'Texte Ã  trous',
    'checkbox': 'Cases Ã  cocher', 'sql-console': 'Console SQL', 'python-console': 'Console Python', 'cyber-terminal': 'Terminal SOC',
  };
  return (
    <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 60px', maxWidth: 700 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 42, height: 42, background: `${shell.color}22`, border: `1px solid ${shell.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: shell.color }}>{shell.icon}</div>
        <div>
          <p style={{ margin: 0, fontFamily: MONO, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{shell.label}</p>
          <p style={{ margin: 0, fontFamily: MONO, fontSize: 10, color: isTrainer ? '#a78bfa' : C.green }}>
            {isTrainer ? 'âŠž Mode prÃ©sentiel' : 'âŠ¡ Mode autoformation'}
          </p>
        </div>
      </div>
      <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: '-0.02em', lineHeight: 1.2 }}>{training.title}</h1>
      <p style={{ margin: '0 0 28px', fontSize: 14, color: C.sub, lineHeight: 1.6 }}>{training.tagline}</p>
      <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ margin: '0 0 8px', fontFamily: MONO, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Objectifs</p>
        {(training.objectives || []).map((obj, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: C.sub }}>
            <span style={{ color: shell.color, fontFamily: MONO, fontWeight: 700, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
            {obj}
          </div>
        ))}
      </div>
      {interactionTypes.length > 1 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          {interactionTypes.map(t => (
            <span key={t} style={{ fontFamily: MONO, fontSize: 9, padding: '3px 8px', background: `${shell.color}11`, border: `1px solid ${shell.color}33`, color: shell.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {typeLabels[t as InteractionType] || t}
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, padding: '12px 16px', background: C.surfaceEl, border: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.sub }}>
          <Target size={13} style={{ color: shell.color }} />
          {training.situations?.length || 0} mises en situation
        </div>
        <div style={{ width: 1, height: 16, background: C.border }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.sub }}>
          <BookOpen size={13} style={{ color: shell.color }} />
          {training.qcm?.length || 0} questions QCM
        </div>
        <div style={{ width: 1, height: 16, background: C.border }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.sub }}>
          <Zap size={13} style={{ color: C.amber }} />
          {(training.situations?.length || 0) * 100 + (training.qcm?.length || 0) * 50} pts max
        </div>
      </div>
      <button onClick={onStart} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 28px', background: shell.color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: FONT, fontWeight: 700, fontSize: 14, transition: 'opacity .15s' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
        <Play size={16} />
        {isTrainer ? 'DÃ©marrer la session' : 'Commencer la formation'}
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// â”€â”€â”€ Ã‰cran final â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FinalScreen({ training, domain, score, maxScore, qcmCorrect, qcmTotal, onRestart, onBack }: {
  training: Training; domain: Domain; score: number; maxScore: number;
  qcmCorrect: number; qcmTotal: number; onRestart: () => void; onBack: () => void;
}) {
  const shell = DOMAIN_SHELL[domain];
  const pct = Math.round((score / Math.max(maxScore, 1)) * 100);
  const levels = training.gamification?.levels || ['Novice', 'Praticien', 'Expert'];
  const level = pct >= 80 ? levels[2] : pct >= 50 ? levels[1] : levels[0];
  const levelColor = pct >= 80 ? C.green : pct >= 50 ? C.amber : C.red;
  return (
    <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'flex-start', padding: '40px 80px', overflow: 'auto' }}>
      <div style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{ width: 80, height: 80, border: `3px solid ${levelColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${levelColor}18` }}>
            <Trophy size={32} style={{ color: levelColor }} />
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontFamily: MONO, fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Formation terminÃ©e</p>
            <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: C.text }}>{level}</h2>
            <p style={{ margin: 0, fontFamily: MONO, fontSize: 13, color: levelColor, fontWeight: 700 }}>{score} / {maxScore} pts Â· {pct}%</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 28 }}>
          {[
            { label: 'Score global', value: `${pct}%`, color: levelColor },
            { label: 'QCM rÃ©ussis', value: `${qcmCorrect}/${qcmTotal}`, color: C.green },
            { label: 'Points gagnÃ©s', value: score, color: C.amber },
          ].map((s, i) => (
            <div key={i} style={{ padding: '14px', background: C.surface, border: `1px solid ${C.border}`, textAlign: 'center' }}>
              <p style={{ margin: '0 0 6px', fontFamily: MONO, fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</p>
              <p style={{ margin: 0, fontFamily: MONO, fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', background: 'none', border: `1px solid ${C.border}`, color: C.sub, cursor: 'pointer', fontFamily: FONT, fontWeight: 600, fontSize: 13 }}>
            <ArrowLeft size={14} /> Retour
          </button>
          <button onClick={onRestart} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', background: shell.color, border: 'none', color: '#fff', cursor: 'pointer', fontFamily: FONT, fontWeight: 700, fontSize: 13 }}>
            <RefreshCw size={14} /> Recommencer
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Player principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type Phase = 'loading' | 'error' | 'intro' | 'generating-lesson' | 'global-lesson' | 'mini-lesson' | 'situation' | 'qcm' | 'final';

export default function TrainingPlayer() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [training, setTraining] = useState<Training | null>(null);
  const [domain, setDomain] = useState<Domain>('generic');
  const [phase, setPhase] = useState<Phase>('loading');
  const [error, setError] = useState('');
  const [situationIdx, setSituationIdx] = useState(0);
  const [qcmIdx, setQcmIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [qcmCorrect, setQcmCorrect] = useState(0);
  const timer = useTimer();
  const isTrainer = training?.deliveryMode === 'trainer';

  useEffect(() => {
    fetch(`/api/studio/training/${id}`)
      .then(r => r.json())
      .then(data => {
        let t: Training = data.content || data;
        if (!t.situations && (t as any).scenarios) {
          t.situations = (t as any).scenarios.map((s: any) => ({
            id: s.id, category: s.category || 'Mise en situation',
            title: s.title || 'Situation', contexte: s.context || '',
            situation: s.situation || '', attendu: s.reflexe || '',
          }));
        }
        if (!t.qcm) t.qcm = [];
        if (!t.situations) t.situations = [];
        setTraining(t);
        setDomain(detectDomain(t));
        setPhase('intro');
      })
      .catch(() => { setError('Formation introuvable.'); setPhase('error'); });
  }, [id]);

  const generateLessonOnTheFly = async (t: Training): Promise<Lesson | null> => {
    try {
      const res = await fetch('/api/studio/v2/cobuild', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'global-lesson',
          title: t.title,
          audience: 'professionnel',
          level: 'intermÃ©diaire',
          sector: 'gÃ©nÃ©ral',
        }),
      });
      const data = await res.json();
      return data.lesson || null;
    } catch { return null; }
  };

  if (phase === 'loading') return (
    <div style={{ height: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, color: C.muted }}>
      <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', marginRight: 10 }} /> Chargement...
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (phase === 'error') return (
    <div style={{ height: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: FONT, color: C.sub }}>
      <AlertTriangle size={32} style={{ color: C.red }} />
      <p style={{ margin: 0 }}>{error}</p>
      <button onClick={() => navigate('/')} style={{ padding: '8px 16px', background: C.accent, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Retour au Studio</button>
    </div>
  );
  if (!training) return null;

  const situations = training.situations || [];
  const qcm = training.qcm || [];
  const totalSteps = situations.length + qcm.length + 2;
  const currentStep = phase === 'intro' ? 1
    : phase === 'global-lesson' ? 1
    : phase === 'mini-lesson' ? situationIdx + 2
    : phase === 'situation' ? situationIdx + 2
    : phase === 'qcm' ? situations.length + qcmIdx + 2
    : totalSteps;
  const maxScore = situations.length * 100 + qcm.length * 50;

  const goToSituation = (idx: number) => {
    setSituationIdx(idx);
    const sit = situations[idx];
    if (sit?.miniLesson) setPhase('mini-lesson');
    else setPhase('situation');
  };

  const onSituationNext = (s: number) => {
    setScore(prev => prev + Math.round(s));
    const nextIdx = situationIdx + 1;
    if (nextIdx < situations.length) goToSituation(nextIdx);
    else if (qcm.length > 0) { setQcmIdx(0); setPhase('qcm'); }
    else setPhase('final');
  };
  const onTrainerNext = () => {
    const nextIdx = situationIdx + 1;
    if (nextIdx < situations.length) goToSituation(nextIdx);
    else if (qcm.length > 0) { setQcmIdx(0); setPhase('qcm'); }
    else setPhase('final');
  };
  const onQcmNext = (correct: boolean) => {
    if (correct) { setScore(p => p + 50); setQcmCorrect(p => p + 1); }
    if (qcmIdx + 1 < qcm.length) setQcmIdx(i => i + 1);
    else setPhase('final');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: C.bg, fontFamily: FONT, color: C.text, overflow: 'hidden' }}>
      {phase !== 'intro' && phase !== 'final' && phase !== 'generating-lesson' && phase !== 'global-lesson' && phase !== 'mini-lesson' && (
        <ShellHeader domain={domain} training={training} step={currentStep} totalSteps={totalSteps} timer={timer} score={score} />
      )}

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${C.border}`, background: C.surface }}>
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: FONT }}>
                <ArrowLeft size={14} /> Retour
              </button>
            </div>
            <IntroScreen training={training} domain={domain} onStart={async () => {
              if (training.globalLesson) {
                setPhase('global-lesson');
              } else {
                setPhase('generating-lesson');
                const lesson = await generateLessonOnTheFly(training);
                if (lesson) {
                  setTraining(prev => prev ? { ...prev, globalLesson: lesson } : prev);
                  setPhase('global-lesson');
                } else {
                  if (situations.length > 0) goToSituation(0);
                  else setPhase('qcm');
                }
              }
            }} />
          </motion.div>
        )}

        {phase === 'generating-lesson' && (
          <motion.div key="generating-lesson" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, background: C.bg }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}>
              <BookOpen size={32} style={{ color: DOMAIN_SHELL[domain].color }} />
            </motion.div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 6px', fontFamily: FONT, fontSize: 16, fontWeight: 700, color: C.text }}>PrÃ©paration de votre leÃ§on</p>
              <p style={{ margin: 0, fontFamily: MONO, fontSize: 11, color: C.muted }}>L'IA construit votre parcours thÃ©oriqueâ€¦</p>
            </div>
          </motion.div>
        )}

        {phase === 'global-lesson' && training.globalLesson && (
          <motion.div key="global-lesson" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <LessonSlides
              lesson={training.globalLesson}
              domain={domain}
              label="Introduction gÃ©nÃ©rale"
              onDone={() => {
                if (situations.length > 0) goToSituation(0);
                else setPhase('qcm');
              }}
            />
          </motion.div>
        )}

        {phase === 'mini-lesson' && situations[situationIdx]?.miniLesson && (
          <motion.div key={`mini-lesson-${situationIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <LessonSlides
              lesson={situations[situationIdx].miniLesson!}
              domain={domain}
              label={`Mini-leÃ§on Â· Situation ${situationIdx + 1}`}
              onDone={() => { setSituationIdx(situationIdx); setPhase('situation'); }}
            />
          </motion.div>
        )}

        {phase === 'situation' && situations[situationIdx] && (
          <motion.div key={`sit-${situationIdx}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {isTrainer
              ? <SituationTrainer situation={situations[situationIdx]} domain={domain} idx={situationIdx} total={situations.length} onNext={onTrainerNext} />
              : <SituationScreen situation={situations[situationIdx]} domain={domain} idx={situationIdx} total={situations.length} onNext={onSituationNext} />
            }
          </motion.div>
        )}

        {phase === 'qcm' && qcm[qcmIdx] && (
          <motion.div key={`qcm-${qcmIdx}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>
            <QcmScreen question={qcm[qcmIdx]} qIdx={qcmIdx} total={qcm.length} domain={domain} onNext={onQcmNext} />
          </motion.div>
        )}

        {phase === 'final' && (
          <motion.div key="final" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <FinalScreen
              training={training} domain={domain}
              score={score} maxScore={maxScore}
              qcmCorrect={qcmCorrect} qcmTotal={qcm.length}
              onRestart={() => { setScore(0); setQcmCorrect(0); setSituationIdx(0); setQcmIdx(0); setPhase('intro'); }}
              onBack={() => navigate('/')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
