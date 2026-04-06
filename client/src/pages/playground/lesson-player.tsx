import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, BookOpen, Zap, CheckCircle,
  Lightbulb, Target, ArrowLeft, Eye, EyeOff, Award, XCircle, HelpCircle,
  Flame
} from 'lucide-react';

const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';
const GREEN = '#059669';
const RED = '#dc2626';

interface SlideIntro {
  id: number; type: 'intro';
  titre: string; contenu: string; objectifs: string[];
}
interface SlideTheorie {
  id: number; type: 'theorie';
  titre: string; contenu: string; pointsCles: string[]; exemple: string;
}
interface SlidePratique {
  id: number; type: 'pratique';
  titre: string; contexte: string; question: string; indice: string; reponse: string;
}
interface SlideConclusion {
  id: number; type: 'conclusion';
  titre: string; points: string[]; message: string;
}
type Slide = SlideIntro | SlideTheorie | SlidePratique | SlideConclusion;

interface QcmQuestion {
  id: number;
  question: string;
  choix: string[];
  bonneReponse: number;
  explication: string;
}

interface Lesson {
  title: string; subtitle: string; description: string;
  slides: Slide[];
  qcm?: QcmQuestion[];
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

type Phase = 'slides' | 'qcm' | 'score';

export default function LessonPlayer() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<Phase>('slides');

  // QCM state
  const [qcmIdx, setQcmIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  // Gamification state
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [xpNotif, setXpNotif] = useState<{ amount: number; key: number; label?: string } | null>(null);
  const [wrongShake, setWrongShake] = useState(false);
  const [correctFlash, setCorrectFlash] = useState(false);
  const [slideXpEarned, setSlideXpEarned] = useState<Set<number>>(new Set());
  const [revealXpEarned, setRevealXpEarned] = useState<Set<number>>(new Set());

  const gainXp = useCallback((amount: number, label?: string) => {
    setXp(prev => prev + amount);
    setXpNotif({ amount, key: Date.now(), label });
  }, []);

  useEffect(() => {
    if (!xpNotif) return;
    const t = setTimeout(() => setXpNotif(null), 1900);
    return () => clearTimeout(t);
  }, [xpNotif?.key]);

  useEffect(() => {
    fetch(`/api/studio/training/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        const content = data.content;
        if (!content?.slides || !Array.isArray(content.slides)) {
          setError('Cette leçon n\'a pas pu être chargée.');
          return;
        }
        setLesson(content as Lesson);
      })
      .catch(() => setError('Leçon introuvable.'));
  }, [id]);

  if (error) return (
    <div style={{ minHeight: '100vh', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: 'white', fontSize: 18 }}>{error}</p>
      <button onClick={() => navigate('/playground/module-generator')} style={{ color: BLUE, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Retour</button>
    </div>
  );

  if (!lesson) return (
    <div style={{ minHeight: '100vh', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: `3px solid ${BLUE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Chargement de la leçon...</p>
      </div>
    </div>
  );

  const slides = lesson.slides;
  const total = slides.length;
  const slide = slides[currentIdx];
  const progress = ((currentIdx + 1) / total) * 100;
  const hasQcm = lesson.qcm && lesson.qcm.length > 0;

  const goNext = () => {
    if (currentIdx < total - 1) {
      setDirection(1);
      setCurrentIdx(i => {
        const next = i + 1;
        if (!slideXpEarned.has(next)) {
          gainXp(5, 'Slide suivante');
          setSlideXpEarned(prev => new Set(prev).add(next));
        }
        return next;
      });
    } else if (hasQcm) {
      setPhase('qcm');
      setAnswers(new Array(lesson.qcm!.length).fill(null));
      gainXp(20, 'Slides terminées !');
    } else {
      setPhase('score');
    }
  };
  const goPrev = () => {
    if (currentIdx > 0) { setDirection(-1); setCurrentIdx(i => i - 1); }
  };
  const toggleReveal = (idx: number) => {
    if (!revealed[idx] && !revealXpEarned.has(idx)) {
      gainXp(15, 'Défi relevé !');
      setRevealXpEarned(prev => new Set(prev).add(idx));
    }
    setRevealed(r => ({ ...r, [idx]: !r[idx] }));
  };

  const handleRestart = () => {
    setCurrentIdx(0); setPhase('slides'); setRevealed({});
    setQcmIdx(0); setSelected(null); setAnswers([]); setConfirmed(false);
    setXp(0); setStreak(0); setMaxStreak(0);
    setSlideXpEarned(new Set()); setRevealXpEarned(new Set());
  };

  // ── QCM PHASE ──────────────────────────────────────────────────────────────
  if (phase === 'qcm' && hasQcm) {
    const questions = lesson.qcm!;
    const q = questions[qcmIdx];
    const isLast = qcmIdx === questions.length - 1;
    const isCorrect = confirmed && selected === q.bonneReponse;

    const confirmAnswer = () => {
      if (selected === null) return;
      const correct = selected === q.bonneReponse;
      const newAnswers = [...answers];
      newAnswers[qcmIdx] = selected;
      setAnswers(newAnswers);
      setConfirmed(true);

      if (correct) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        setMaxStreak(s => Math.max(s, newStreak));
        const bonus = newStreak >= 3 ? Math.round(30 * (newStreak - 2)) : 0;
        gainXp(50 + bonus, newStreak >= 3 ? `🔥 Combo x${newStreak} !` : undefined);
        setCorrectFlash(true);
        setTimeout(() => setCorrectFlash(false), 700);
      } else {
        setStreak(0);
        setWrongShake(true);
        setTimeout(() => setWrongShake(false), 500);
      }
    };

    const goNextQ = () => {
      setSelected(null);
      setConfirmed(false);
      if (isLast) setPhase('score');
      else setQcmIdx(i => i + 1);
    };

    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <style>{`
          @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
          @keyframes xpFloat { 0%{opacity:0;transform:translateY(20px) scale(0.8)} 20%{opacity:1;transform:translateY(0) scale(1.1)} 80%{opacity:1;transform:translateY(-8px) scale(1)} 100%{opacity:0;transform:translateY(-20px) scale(0.9)} }
        `}</style>

        {/* Correct flash overlay */}
        <AnimatePresence>
          {correctFlash && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              style={{ position: 'fixed', inset: 0, background: `${GREEN}18`, zIndex: 200, pointerEvents: 'none' }} />
          )}
        </AnimatePresence>

        {/* XP notification */}
        <AnimatePresence>
          {xpNotif && (
            <motion.div key={xpNotif.key} initial={{ opacity: 0, y: 24, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -16 }}
              style={{ position: 'fixed', top: 72, right: 24, zIndex: 300, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#d97706', color: 'white', fontWeight: 800, fontSize: 14 }}>
              ⚡ +{xpNotif.amount} XP {xpNotif.label && <span style={{ fontWeight: 600, fontSize: 12 }}>{xpNotif.label}</span>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 50 }}>
          <button onClick={() => navigate('/playground/module-generator')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <ArrowLeft size={16} /> Retour
          </button>
          <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: DARK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lesson.title}</p>
          </div>
          {streak >= 2 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#fef3c7', color: '#d97706', fontSize: 12, fontWeight: 800 }}>
              <Flame size={13} /> Combo x{streak}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: '#fef3c7', color: '#d97706', fontSize: 12, fontWeight: 800 }}>
            ⚡ {xp} XP
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: `rgba(221,0,97,0.1)`, color: PINK, fontSize: 12, fontWeight: 700 }}>
            <HelpCircle size={12} /> {qcmIdx + 1}/{questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: '#e5e7eb' }}>
          <motion.div style={{ height: '100%', background: PINK }} animate={{ width: `${((qcmIdx + 1) / questions.length) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>

        {/* Question dots */}
        <div style={{ padding: '10px 24px', display: 'flex', gap: 5, justifyContent: 'center', flexWrap: 'wrap', background: 'white', borderBottom: '1px solid #f3f4f6' }}>
          {questions.map((_, i) => (
            <div key={i} style={{ width: 24, height: 8, background: i === qcmIdx ? PINK : i < qcmIdx ? (answers[i] === questions[i].bonneReponse ? GREEN : RED) : '#e5e7eb', transition: 'background 0.3s' }} />
          ))}
        </div>

        {/* Question card */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 24px' }}>
          <div style={{ width: '100%', maxWidth: 720 }}>
            <AnimatePresence mode="wait">
              <motion.div key={qcmIdx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}>

                {/* Question */}
                <div style={{ background: 'white', border: '1px solid #e5e7eb', marginBottom: 14 }}>
                  <div style={{ height: 4, background: PINK }} />
                  <div style={{ padding: '24px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: PINK, textTransform: 'uppercase' }}>Question {qcmIdx + 1}</span>
                      <span style={{ fontSize: 10, color: '#9ca3af' }}>· +50 XP si correct</span>
                      {streak >= 3 && <span style={{ fontSize: 10, color: '#d97706', fontWeight: 700 }}>+{Math.round(30 * (streak - 2))} XP bonus combo</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: 19, fontWeight: 700, color: DARK, lineHeight: 1.5 }}>{q.question}</p>
                  </div>
                </div>

                {/* Choices */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16, animation: wrongShake ? 'shake 0.5s ease' : 'none' }}>
                  {q.choix.map((choix, ci) => {
                    let bg = 'white';
                    let borderColor = selected === ci ? PINK : '#e5e7eb';
                    let textColor = DARK;
                    if (confirmed) {
                      if (ci === q.bonneReponse) { bg = `${GREEN}15`; borderColor = GREEN; textColor = GREEN; }
                      else if (ci === selected && selected !== q.bonneReponse) { bg = `${RED}10`; borderColor = RED; textColor = RED; }
                      else { borderColor = '#e5e7eb'; }
                    }
                    return (
                      <button key={ci} disabled={confirmed}
                        onClick={() => setSelected(ci)}
                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', background: bg, border: `2px solid ${borderColor}`, cursor: confirmed ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                        <div style={{ width: 30, height: 30, border: `2px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: selected === ci && !confirmed ? `${PINK}15` : 'transparent' }}>
                          {confirmed && ci === q.bonneReponse ? <CheckCircle size={15} style={{ color: GREEN }} /> :
                           confirmed && ci === selected && selected !== q.bonneReponse ? <XCircle size={15} style={{ color: RED }} /> :
                           <span style={{ fontSize: 12, fontWeight: 700, color: borderColor }}>{'ABCD'[ci]}</span>}
                        </div>
                        <span style={{ fontSize: 15, fontWeight: selected === ci ? 600 : 400, color: textColor, lineHeight: 1.4 }}>{choix}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback */}
                <AnimatePresence>
                  {confirmed && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <div style={{ padding: '14px 18px', background: isCorrect ? `${GREEN}12` : `${RED}08`, borderLeft: `3px solid ${isCorrect ? GREEN : RED}`, marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                          {isCorrect ? <CheckCircle size={15} style={{ color: GREEN }} /> : <XCircle size={15} style={{ color: RED }} />}
                          <span style={{ fontWeight: 800, fontSize: 14, color: isCorrect ? GREEN : RED }}>
                            {isCorrect ? (streak >= 3 ? `🔥 Combo x${streak} — Excellent !` : 'Bonne réponse !') : `Incorrect — bonne réponse : ${['A','B','C','D'][q.bonneReponse]}`}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{q.explication}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', bottom: 0, zIndex: 40 }}>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>
            {answers.filter((a, i) => a !== null && a === questions[i]?.bonneReponse).length} bonne{answers.filter((a, i) => a !== null && a === questions[i]?.bonneReponse).length > 1 ? 's' : ''} sur {qcmIdx} répondue{qcmIdx > 1 ? 's' : ''}
          </span>
          {!confirmed ? (
            <button onClick={confirmAnswer} disabled={selected === null}
              style={{ padding: '12px 32px', border: 'none', background: selected === null ? '#e5e7eb' : PINK, color: 'white', cursor: selected === null ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14 }}>
              Valider ma réponse
            </button>
          ) : (
            <button onClick={goNextQ}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', border: 'none', background: isCorrect ? GREEN : BLUE, color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
              {isLast ? '🏆 Voir mes résultats' : 'Question suivante'} <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── SCORE PHASE ─────────────────────────────────────────────────────────────
  if (phase === 'score') {
    const questions = lesson.qcm || [];
    const score = questions.length > 0
      ? answers.filter((a, i) => a === questions[i].bonneReponse).length
      : 0;
    const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 100;
    const mention = pct >= 90 ? 'Maître !' : pct >= 75 ? 'Excellent !' : pct >= 60 ? 'Bien joué !' : pct >= 40 ? 'En progression' : 'À retravailler';
    const mentionColor = pct >= 75 ? GREEN : pct >= 60 ? BLUE : pct >= 40 ? '#f59e0b' : RED;
    const badge = pct >= 90 ? { icon: '🏆', label: 'Maître de la leçon', color: '#f59e0b' }
                : pct >= 75 ? { icon: '⭐', label: 'Expert validé', color: GREEN }
                : pct >= 60 ? { icon: '🎯', label: 'Objectif atteint', color: BLUE }
                : pct >= 40 ? { icon: '📈', label: 'En progression', color: '#f59e0b' }
                :             { icon: '💪', label: 'Continue à pratiquer', color: '#9ca3af' };

    const particles = Array.from({ length: pct >= 60 ? 20 : 8 }, (_, i) => ({
      id: i, left: Math.random() * 100, delay: Math.random() * 1.5,
      color: [PINK, BLUE, GREEN, '#f59e0b', '#7c3aed'][i % 5],
      size: 4 + Math.random() * 6,
    }));

    return (
      <div style={{ minHeight: '100vh', background: DARK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '48px 24px', overflowX: 'hidden', position: 'relative' }}>
        <style>{`
          @keyframes particle { 0%{transform:translateY(100vh) rotate(0deg);opacity:1} 100%{transform:translateY(-20vh) rotate(720deg);opacity:0} }
          @keyframes glow { 0%,100%{box-shadow:0 0 20px ${PINK}40} 50%{box-shadow:0 0 40px ${PINK}80} }
        `}</style>

        {/* Gradient top bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${BLUE}, ${PINK})` }} />

        {/* Particles */}
        {particles.map(p => (
          <div key={p.id} style={{
            position: 'fixed', bottom: -10, left: `${p.left}%`,
            width: p.size, height: p.size, background: p.color,
            animation: `particle ${2 + p.delay}s ease-out ${p.delay}s 1 forwards`,
            pointerEvents: 'none', zIndex: 0,
          }} />
        ))}

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 600, position: 'relative', zIndex: 1 }}>

          {/* Badge */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 52, marginBottom: 10 }}>{badge.icon}</div>
            <span style={{ display: 'inline-block', padding: '5px 16px', background: `${badge.color}20`, color: badge.color, fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
              {badge.label}
            </span>
            <p style={{ margin: '0 0 4px', fontSize: 32, fontWeight: 900, color: 'white' }}>{mention}</p>
            <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.5)' }}>{score}/{questions.length} bonnes réponses · {pct}%</p>
          </div>

          {/* XP Total */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
            <div style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.06)', textAlign: 'center', minWidth: 100 }}>
              <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 900, color: '#f59e0b' }}>⚡ {xp}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>XP Total</p>
            </div>
            {maxStreak >= 2 && (
              <div style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.06)', textAlign: 'center', minWidth: 100 }}>
                <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 900, color: '#d97706' }}>🔥 x{maxStreak}</p>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>Meilleur combo</p>
              </div>
            )}
            <div style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.06)', textAlign: 'center', minWidth: 100 }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{pct >= 75 ? '✅' : pct >= 60 ? '📊' : '📝'}</div>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>Score</p>
            </div>
          </div>

          {/* Per-question recap */}
          {questions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32, textAlign: 'left' }}>
              {questions.map((q, i) => {
                const correct = answers[i] === q.bonneReponse;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderLeft: `3px solid ${correct ? GREEN : RED}` }}>
                    {correct
                      ? <CheckCircle size={14} style={{ color: GREEN, flexShrink: 0, marginTop: 3 }} />
                      : <XCircle size={14} style={{ color: RED, flexShrink: 0, marginTop: 3 }} />}
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 3px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>{q.question}</p>
                      {!correct && <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>✓ {q.choix[q.bonneReponse]}</p>}
                    </div>
                    {correct && <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, flexShrink: 0 }}>+50 XP</span>}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={handleRestart}
              style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
              Recommencer
            </button>
            <button onClick={() => navigate('/playground/module-generator')}
              style={{ padding: '12px 28px', background: PINK, border: 'none', color: 'white', cursor: 'pointer', fontWeight: 800, fontSize: 14 }}>
              Retour au studio
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── SLIDES PHASE ────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* XP notification */}
      <AnimatePresence>
        {xpNotif && (
          <motion.div key={xpNotif.key} initial={{ opacity: 0, y: 24, scale: 0.85 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -16 }}
            style={{ position: 'fixed', top: 72, right: 24, zIndex: 300, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#d97706', color: 'white', fontWeight: 800, fontSize: 14 }}>
            ⚡ +{xpNotif.amount} XP {xpNotif.label && <span style={{ fontWeight: 600, fontSize: 12 }}>{xpNotif.label}</span>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate('/playground/module-generator')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <ArrowLeft size={16} /> Retour
        </button>
        <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: DARK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lesson.title}</p>
        </div>
        {hasQcm && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: `rgba(221,0,97,0.08)`, color: PINK, fontSize: 11, fontWeight: 600 }}>
            <HelpCircle size={11} /> QCM après les slides
          </span>
        )}
        {xp > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: '#fef3c7', color: '#d97706', fontSize: 12, fontWeight: 800 }}>
            ⚡ {xp} XP
          </span>
        )}
        <span style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>{currentIdx + 1} / {total}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: '#e5e7eb' }}>
        <motion.div style={{ height: '100%', background: slide.type === 'pratique' ? PINK : BLUE }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
      </div>

      {/* Slide pills */}
      <div style={{ padding: '12px 24px', display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', background: 'white', borderBottom: '1px solid #f3f4f6' }}>
        {slides.map((s, i) => (
          <button key={i} onClick={() => { setDirection(i > currentIdx ? 1 : -1); setCurrentIdx(i); }}
            style={{ width: 28, height: 8, border: 'none', cursor: 'pointer', borderRadius: 0, transition: 'all 0.2s',
              background: i === currentIdx ? (s.type === 'pratique' ? PINK : BLUE) : i < currentIdx ? (s.type === 'pratique' ? 'rgba(221,0,97,0.3)' : 'rgba(0,106,158,0.3)') : '#e5e7eb' }} />
        ))}
        {/* QCM pill */}
        {hasQcm && <div style={{ width: 8, height: 8, background: PINK, opacity: 0.4, alignSelf: 'center', marginLeft: 4 }} />}
      </div>

      {/* Slide content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: 860 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={currentIdx} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeInOut' }}>
              {slide.type === 'intro' && <IntroSlide slide={slide as SlideIntro} />}
              {slide.type === 'theorie' && <TheorieSlide slide={slide as SlideTheorie} />}
              {slide.type === 'pratique' && <PratiqueSlide slide={slide as SlidePratique} idx={currentIdx} revealed={!!revealed[currentIdx]} onToggle={() => toggleReveal(currentIdx)} />}
              {slide.type === 'conclusion' && <ConclusionSlide slide={slide as SlideConclusion} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer navigation */}
      <div style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', bottom: 0, zIndex: 40 }}>
        <button onClick={goPrev} disabled={currentIdx === 0}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', border: '1px solid #e5e7eb', background: 'white', cursor: currentIdx === 0 ? 'not-allowed' : 'pointer', opacity: currentIdx === 0 ? 0.4 : 1, fontWeight: 500, fontSize: 14, color: DARK }}>
          <ChevronLeft size={18} /> Précédent
        </button>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <TypeBadge type={slide.type} />
        </div>

        <button onClick={goNext}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', border: 'none', background: slide.type === 'pratique' ? PINK : BLUE, color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
          {currentIdx === total - 1 ? (hasQcm ? 'Passer au QCM' : 'Terminer') : 'Suivant'} <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  if (type === 'theorie') return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: `rgba(0,106,158,0.1)`, color: BLUE, fontSize: 12, fontWeight: 600 }}>
      <BookOpen size={12} /> THÉORIE
    </span>
  );
  if (type === 'pratique') return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: `rgba(221,0,97,0.1)`, color: PINK, fontSize: 12, fontWeight: 600 }}>
      <Zap size={12} /> PRATIQUE
    </span>
  );
  if (type === 'intro') return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#f3f4f6', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>
      <Target size={12} /> INTRODUCTION
    </span>
  );
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#f3f4f6', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>
      <Award size={12} /> CONCLUSION
    </span>
  );
}

function IntroSlide({ slide }: { slide: SlideIntro }) {
  return (
    <div style={{ background: DARK, padding: '64px 56px', minHeight: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${BLUE}, ${PINK})` }} />
      <div style={{ position: 'absolute', top: -120, right: -80, width: 320, height: 320, borderRadius: '50%', background: `${BLUE}18` }} />
      <div style={{ position: 'absolute', bottom: -80, left: -40, width: 200, height: 200, borderRadius: '50%', background: `${PINK}12` }} />
      <div style={{ position: 'relative' }}>
        <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: BLUE, textTransform: 'uppercase' }}>Introduction</p>
        <h1 style={{ margin: '0 0 16px', fontSize: 36, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{slide.titre}</h1>
        <p style={{ margin: '0 0 40px', fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>{slide.contenu}</p>
        <div>
          <p style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 600, color: BLUE, textTransform: 'uppercase', letterSpacing: 2 }}>Objectifs de cette leçon</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {slide.objectifs?.map((obj, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', background: 'rgba(255,255,255,0.06)', borderLeft: `3px solid ${BLUE}` }}>
                <CheckCircle size={14} style={{ color: BLUE, marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{obj}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TheorieSlide({ slide }: { slide: SlideTheorie }) {
  return (
    <div style={{ background: 'white', minHeight: 480, border: '1px solid #e5e7eb' }}>
      <div style={{ height: 4, background: BLUE }} />
      <div style={{ padding: '40px 48px' }}>
        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: BLUE, textTransform: 'uppercase' }}>Théorie</p>
        <h2 style={{ margin: '0 0 24px', fontSize: 28, fontWeight: 700, color: DARK }}>{slide.titre}</h2>
        <p style={{ margin: '0 0 32px', fontSize: 16, color: '#374151', lineHeight: 1.8 }}>{slide.contenu}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: 1.5 }}>Points clés</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {slide.pointsCles?.map((pt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', background: `rgba(0,106,158,0.05)`, borderLeft: `3px solid ${BLUE}` }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: BLUE, minWidth: 20, lineHeight: 1.5 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontSize: 14, color: DARK, lineHeight: 1.5 }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1.5 }}>Exemple concret</p>
            <div style={{ padding: '20px', background: '#f9fafb', borderLeft: '3px solid #e5e7eb', position: 'relative' }}>
              <Lightbulb size={18} style={{ color: '#f59e0b', position: 'absolute', top: 16, right: 16 }} />
              <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.7, fontStyle: 'italic' }}>{slide.exemple}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PratiqueSlide({ slide, idx, revealed, onToggle }: { slide: SlidePratique; idx: number; revealed: boolean; onToggle: () => void }) {
  return (
    <div style={{ background: DARK, minHeight: 480, border: `2px solid ${PINK}20`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -100, right: -60, width: 280, height: 280, borderRadius: '50%', background: `${PINK}08` }} />
      <div style={{ height: 4, background: PINK }} />
      <div style={{ padding: '40px 48px', position: 'relative' }}>
        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: PINK, textTransform: 'uppercase' }}>Mise en pratique</p>
        <h2 style={{ margin: '0 0 24px', fontSize: 28, fontWeight: 700, color: 'white' }}>{slide.titre}</h2>
        <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.06)', borderLeft: `3px solid rgba(255,255,255,0.2)`, marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8 }}>{slide.contexte}</p>
        </div>
        <div style={{ padding: '20px 24px', background: `${PINK}15`, borderLeft: `3px solid ${PINK}`, marginBottom: 20 }}>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: PINK, textTransform: 'uppercase', letterSpacing: 1.5 }}>Votre défi</p>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'white', lineHeight: 1.6 }}>{slide.question}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', background: 'rgba(255,255,255,0.04)', marginBottom: 24 }}>
          <Lightbulb size={14} style={{ color: '#f59e0b', marginTop: 2, flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontStyle: 'italic' }}>{slide.indice}</p>
        </div>
        <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: revealed ? 'rgba(255,255,255,0.12)' : PINK, border: 'none', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14, marginBottom: revealed ? 20 : 0 }}>
          {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
          {revealed ? 'Masquer la réponse' : 'Révéler la réponse idéale'}
        </button>
        <AnimatePresence>
          {revealed && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
              <div style={{ padding: '20px 24px', background: 'rgba(0,106,158,0.15)', borderLeft: `3px solid ${BLUE}` }}>
                <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: 1.5 }}>Réponse idéale</p>
                <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 1.8 }}>{slide.reponse}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ConclusionSlide({ slide }: { slide: SlideConclusion }) {
  return (
    <div style={{ background: DARK, minHeight: 480, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${BLUE}, ${PINK})` }} />
      <div style={{ position: 'absolute', top: -80, right: -60, width: 240, height: 240, borderRadius: '50%', background: `${BLUE}12` }} />
      <div style={{ padding: '48px 56px', position: 'relative' }}>
        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#9ca3af', textTransform: 'uppercase' }}>Conclusion</p>
        <h2 style={{ margin: '0 0 32px', fontSize: 32, fontWeight: 700, color: 'white' }}>{slide.titre}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
          {slide.points?.map((pt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 20px', background: 'rgba(255,255,255,0.06)' }}>
              <div style={{ width: 24, height: 24, background: i % 2 === 0 ? BLUE : PINK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{i + 1}</span>
              </div>
              <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>{pt}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '20px 24px', background: `${BLUE}20`, borderLeft: `3px solid ${BLUE}` }}>
          <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, fontStyle: 'italic' }}>{slide.message}</p>
        </div>
      </div>
    </div>
  );
}
