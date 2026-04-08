import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, BookOpen, Zap, CheckCircle,
  Lightbulb, Target, ArrowLeft, Eye, EyeOff, Award, XCircle, HelpCircle,
  Flame, PenLine, ToggleLeft, RefreshCw, AlertCircle
} from 'lucide-react';

const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';
const GREEN = '#059669';
const RED = '#dc2626';
const PURPLE = '#7c3aed';
const AMBER = '#d97706';

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
interface SlideFillBlank {
  id: number; type: 'fill-blank';
  titre: string;
  instruction: string;
  phrase: string;
  mots: string[];
  explication: string;
}
interface SlideVraiFaux {
  id: number; type: 'vrai-faux';
  titre: string;
  affirmations: { texte: string; reponse: boolean; explication: string }[];
}
type Slide = SlideIntro | SlideTheorie | SlidePratique | SlideConclusion | SlideFillBlank | SlideVraiFaux;

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

  // Mini-game state
  const [mgInputs, setMgInputs] = useState<string[]>([]);
  const [mgVFAnswers, setMgVFAnswers] = useState<(boolean | null)[]>([]);
  const [mgSubmitted, setMgSubmitted] = useState(false);
  const [mgXpEarned, setMgXpEarned] = useState<Set<number>>(new Set());

  useEffect(() => {
    setMgSubmitted(false);
  }, [currentIdx]);

  useEffect(() => {
    fetch(`/api/studio/training/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        const content = data.content;
        if (!content?.slides || !Array.isArray(content.slides)) {
          setError('Ce micro learning n\'a pas pu être chargé.');
          return;
        }
        setLesson(content as Lesson);
      })
      .catch(() => setError('Module introuvable.'));
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
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Chargement du micro learning...</p>
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
          gainXp(5, 'Étape suivante');
          setSlideXpEarned(prev => new Set(prev).add(next));
        }
        return next;
      });
    } else if (hasQcm) {
      setPhase('qcm');
      setAnswers(new Array(lesson.qcm!.length).fill(null));
      gainXp(20, 'Modules terminés !');
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
    setMgInputs([]); setMgVFAnswers([]); setMgSubmitted(false); setMgXpEarned(new Set());
  };

  const handleFillBlankSubmit = (slide: SlideFillBlank) => {
    setMgSubmitted(true);
    if (mgXpEarned.has(currentIdx)) return;
    const mots = slide.mots || [];
    const allCorrect = mots.every((mot, i) => {
      const input = (mgInputs[i] || '').trim().toLowerCase();
      const expected = mot.trim().toLowerCase();
      return input === expected || expected.startsWith(input) && input.length >= 3;
    });
    const partialCount = mots.filter((mot, i) => {
      const input = (mgInputs[i] || '').trim().toLowerCase();
      return input === mot.trim().toLowerCase();
    }).length;
    const xpAmount = allCorrect ? 30 : partialCount > 0 ? 15 : 5;
    const label = allCorrect ? 'Parfait !' : partialCount > 0 ? `${partialCount}/${mots.length} corrects` : 'À retravailler';
    gainXp(xpAmount, label);
    setMgXpEarned(prev => new Set(prev).add(currentIdx));
  };

  const handleVraiFauxSubmit = (slide: SlideVraiFaux) => {
    setMgSubmitted(true);
    if (mgXpEarned.has(currentIdx)) return;
    const affirmations = slide.affirmations || [];
    const correctCount = affirmations.filter((a, i) => mgVFAnswers[i] === a.reponse).length;
    const xpAmount = correctCount === affirmations.length ? 30 : correctCount > 0 ? 15 : 5;
    const label = correctCount === affirmations.length ? 'Score parfait !' : `${correctCount}/${affirmations.length} corrects`;
    gainXp(xpAmount, label);
    setMgXpEarned(prev => new Set(prev).add(currentIdx));
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
    const badge = pct >= 90 ? { label: 'Maître du module', color: '#f59e0b' }
                : pct >= 75 ? { label: 'Expert validé', color: GREEN }
                : pct >= 60 ? { label: 'Objectif atteint', color: BLUE }
                : pct >= 40 ? { label: 'En progression', color: '#f59e0b' }
                :             { label: 'Continue à pratiquer', color: '#9ca3af' };

    const wrongQs = questions.map((q, i) => ({ q, i, correct: answers[i] === q.bonneReponse })).filter(x => !x.correct);
    const correctQs = questions.map((q, i) => ({ q, i, correct: answers[i] === q.bonneReponse })).filter(x => x.correct);

    // Extract lesson key points from slides
    const theorieSlides = (lesson.slides || []).filter((s: any) => s.type === 'theorie');
    const conclusionSlide = (lesson.slides || []).find((s: any) => s.type === 'conclusion') as SlideConclusion | undefined;
    const keyPoints: { titre: string; points: string[] }[] = theorieSlides.map((s: any) => ({
      titre: s.titre || '',
      points: (s.pointsCles || []).slice(0, 2),
    }));
    if (conclusionSlide?.points?.length) {
      keyPoints.push({ titre: 'Points essentiels à retenir', points: conclusionSlide.points });
    }

    const particles = Array.from({ length: pct >= 60 ? 18 : 6 }, (_, i) => ({
      id: i, left: Math.random() * 100, delay: Math.random() * 1.5,
      color: [PINK, BLUE, GREEN, '#f59e0b', '#7c3aed'][i % 5],
      size: 4 + Math.random() * 5,
    }));

    return (
      <div style={{ minHeight: '100vh', background: DARK, display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>
        <style>{`
          @keyframes particle { 0%{transform:translateY(100vh) rotate(0deg);opacity:1} 100%{transform:translateY(-20vh) rotate(720deg);opacity:0} }
        `}</style>

        {/* Top bar */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${BLUE}, ${PINK})`, flexShrink: 0 }} />

        {/* Particles */}
        {particles.map(p => (
          <div key={p.id} style={{
            position: 'fixed', bottom: -10, left: `${p.left}%`,
            width: p.size, height: p.size, background: p.color,
            animation: `particle ${2 + p.delay}s ease-out ${p.delay}s 1 forwards`,
            pointerEvents: 'none', zIndex: 0,
          }} />
        ))}

        {/* Header */}
        <div style={{ padding: '28px 48px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'relative', zIndex: 1 }}>
          <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>Résultats de la formation</p>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'white' }}>{lesson.title}</h1>
        </div>

        {/* Two-column body */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr', position: 'relative', zIndex: 1 }}>

          {/* ── LEFT PANEL ── */}
          <div style={{ borderRight: '1px solid rgba(255,255,255,0.07)', padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: 20, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>

            {/* Score circle */}
            <div style={{ textAlign: 'center', paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 110, height: 110, border: `4px solid ${badge.color}`, borderRadius: '50%', marginBottom: 16, position: 'relative' }}>
                <div>
                  <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color: 'white', lineHeight: 1 }}>{pct}%</p>
                  <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{score}/{questions.length}</p>
                </div>
              </div>
              <span style={{ display: 'inline-block', padding: '4px 14px', background: `${badge.color}20`, color: badge.color, fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
                {badge.label}
              </span>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'white' }}>{mention}</p>
            </div>

            {/* XP & combo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>XP Total</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#f59e0b' }}>⚡ {xp}</span>
              </div>
              {maxStreak >= 2 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Meilleur combo</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: '#d97706' }}>🔥 ×{maxStreak}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Bonnes réponses</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: GREEN }}>{correctQs.length}/{questions.length}</span>
              </div>
              {wrongQs.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>À revoir</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: RED }}>{wrongQs.length} question{wrongQs.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={handleRestart}
                style={{ width: '100%', padding: '13px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <RefreshCw size={15} /> Recommencer
              </button>
              <button onClick={() => navigate('/playground/module-generator')}
                style={{ width: '100%', padding: '13px', background: PINK, border: 'none', color: 'white', cursor: 'pointer', fontWeight: 800, fontSize: 14 }}>
                Retour au studio
              </button>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div style={{ padding: '36px 48px', overflowY: 'auto' }}>

            {/* Résumé des points abordés */}
            {keyPoints.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <BookOpen size={16} style={{ color: BLUE }} />
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: BLUE, textTransform: 'uppercase' }}>Résumé de la formation</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                  {keyPoints.map((kp, i) => (
                    <div key={i} style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.04)', borderLeft: `3px solid ${BLUE}` }}>
                      <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{kp.titre}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {kp.points.map((pt, j) => (
                          <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <div style={{ width: 4, height: 4, background: BLUE, marginTop: 6, flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* À revoir */}
            {wrongQs.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <AlertCircle size={16} style={{ color: RED }} />
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: RED, textTransform: 'uppercase' }}>Points à revoir</p>
                  <span style={{ padding: '2px 8px', background: `${RED}20`, color: RED, fontSize: 11, fontWeight: 700 }}>{wrongQs.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {wrongQs.map(({ q, i }) => (
                    <div key={i} style={{ padding: '16px 20px', background: `${RED}08`, border: `1px solid ${RED}25`, borderLeft: `3px solid ${RED}` }}>
                      <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{q.question}</p>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 12px', background: `${GREEN}12`, borderLeft: `2px solid ${GREEN}` }}>
                        <CheckCircle size={13} style={{ color: GREEN, marginTop: 1, flexShrink: 0 }} />
                        <div>
                          <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 700, color: GREEN, textTransform: 'uppercase', letterSpacing: 0.8 }}>Bonne réponse</p>
                          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{q.choix[q.bonneReponse]}</p>
                        </div>
                      </div>
                      {q.explication && (
                        <p style={{ margin: '10px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, fontStyle: 'italic' }}>{q.explication}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Questions réussies */}
            {correctQs.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <CheckCircle size={16} style={{ color: GREEN }} />
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: GREEN, textTransform: 'uppercase' }}>Déjà maîtrisé</p>
                  <span style={{ padding: '2px 8px', background: `${GREEN}20`, color: GREEN, fontSize: 11, fontWeight: 700 }}>{correctQs.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {correctQs.map(({ q, i }) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${GREEN}40` }}>
                      <CheckCircle size={13} style={{ color: `${GREEN}70`, marginTop: 2, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>{q.question}</p>
                        <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{q.choix[q.bonneReponse]}</p>
                      </div>
                      <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, flexShrink: 0 }}>+50 XP</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
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
            <HelpCircle size={11} /> QCM après les modules
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
        {slides.map((s, i) => {
          const activeColor = s.type === 'pratique' ? PINK : s.type === 'fill-blank' ? PURPLE : s.type === 'vrai-faux' ? AMBER : BLUE;
          const pastColor = s.type === 'pratique' ? 'rgba(221,0,97,0.35)' : s.type === 'fill-blank' ? 'rgba(124,58,237,0.35)' : s.type === 'vrai-faux' ? 'rgba(217,119,6,0.35)' : 'rgba(0,106,158,0.3)';
          return (
            <button key={i} onClick={() => { setDirection(i > currentIdx ? 1 : -1); setCurrentIdx(i); }}
              style={{ width: 28, height: 8, border: 'none', cursor: 'pointer', borderRadius: 0, transition: 'all 0.2s',
                background: i === currentIdx ? activeColor : i < currentIdx ? pastColor : '#e5e7eb' }} />
          );
        })}
        {/* QCM pill */}
        {hasQcm && <div style={{ width: 8, height: 8, background: PINK, opacity: 0.4, alignSelf: 'center', marginLeft: 4 }} />}
      </div>

      {/* Slide content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '16px 24px' }}>
        <div style={{ width: '100%', maxWidth: 1040 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={currentIdx} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeInOut' }}>
              {slide.type === 'intro' && <IntroSlide slide={slide as SlideIntro} />}
              {slide.type === 'theorie' && <TheorieSlide slide={slide as SlideTheorie} />}
              {slide.type === 'pratique' && <PratiqueSlide slide={slide as SlidePratique} idx={currentIdx} revealed={!!revealed[currentIdx]} onToggle={() => toggleReveal(currentIdx)} />}
              {slide.type === 'conclusion' && <ConclusionSlide slide={slide as SlideConclusion} />}
              {slide.type === 'fill-blank' && (
                <FillBlankSlide
                  slide={slide as SlideFillBlank}
                  inputs={mgInputs}
                  onInputChange={(i, v) => setMgInputs(arr => { const n = [...arr]; n[i] = v; return n; })}
                  submitted={mgSubmitted}
                  onSubmit={() => handleFillBlankSubmit(slide as SlideFillBlank)}
                />
              )}
              {slide.type === 'vrai-faux' && (
                <VraiFauxSlide
                  slide={slide as SlideVraiFaux}
                  answers={mgVFAnswers}
                  onAnswerChange={(i, v) => setMgVFAnswers(arr => { const n = [...arr]; n[i] = v; return n; })}
                  submitted={mgSubmitted}
                  onSubmit={() => handleVraiFauxSubmit(slide as SlideVraiFaux)}
                />
              )}
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
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', border: 'none',
            background: slide.type === 'pratique' ? PINK : slide.type === 'fill-blank' ? PURPLE : slide.type === 'vrai-faux' ? AMBER : BLUE,
            color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
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
  if (type === 'fill-blank') return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: `rgba(124,58,237,0.1)`, color: PURPLE, fontSize: 12, fontWeight: 600 }}>
      <PenLine size={12} /> TEXTE À TROUS
    </span>
  );
  if (type === 'vrai-faux') return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: `rgba(217,119,6,0.1)`, color: AMBER, fontSize: 12, fontWeight: 600 }}>
      <ToggleLeft size={12} /> VRAI OU FAUX
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
    <div style={{ background: DARK, padding: '64px 56px', minHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${BLUE}, ${PINK})` }} />
      <div style={{ position: 'absolute', top: -120, right: -80, width: 320, height: 320, borderRadius: '50%', background: `${BLUE}18` }} />
      <div style={{ position: 'absolute', bottom: -80, left: -40, width: 200, height: 200, borderRadius: '50%', background: `${PINK}12` }} />
      <div style={{ position: 'relative' }}>
        <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: BLUE, textTransform: 'uppercase' }}>Introduction</p>
        <h1 style={{ margin: '0 0 16px', fontSize: 36, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{slide.titre}</h1>
        <p style={{ margin: '0 0 40px', fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>{slide.contenu}</p>
        <div>
          <p style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 600, color: BLUE, textTransform: 'uppercase', letterSpacing: 2 }}>Objectifs de ce module</p>
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
    <div style={{ background: 'white', minHeight: 'calc(100vh - 200px)', border: '1px solid #e5e7eb' }}>
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
    <div style={{ background: DARK, minHeight: 'calc(100vh - 200px)', border: `2px solid ${PINK}20`, position: 'relative', overflow: 'hidden' }}>
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
    <div style={{ background: DARK, minHeight: 'calc(100vh - 200px)', position: 'relative', overflow: 'hidden' }}>
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

// ── parseFillBlank helper ───────────────────────────────────────────────────
function parseFillBlank(phrase: string) {
  const parts: Array<{ type: 'text' | 'blank'; content: string; blankIdx: number }> = [];
  const regex = /\[([^\]]+)\]/g;
  let lastIdx = 0;
  let blankIdx = 0;
  let match;
  while ((match = regex.exec(phrase)) !== null) {
    if (match.index > lastIdx) parts.push({ type: 'text', content: phrase.slice(lastIdx, match.index), blankIdx: -1 });
    parts.push({ type: 'blank', content: match[1], blankIdx: blankIdx++ });
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < phrase.length) parts.push({ type: 'text', content: phrase.slice(lastIdx), blankIdx: -1 });
  return parts;
}

// ── FillBlankSlide ──────────────────────────────────────────────────────────
function FillBlankSlide({ slide, inputs, onInputChange, submitted, onSubmit }: {
  slide: SlideFillBlank;
  inputs: string[];
  onInputChange: (i: number, v: string) => void;
  submitted: boolean;
  onSubmit: () => void;
}) {
  const mots = slide.mots || [];
  const segments = parseFillBlank(slide.phrase || '');
  const blankCount = segments.filter(s => s.type === 'blank').length;

  // blankToWordIdx[blankIdx] = index in mots[], or null if empty
  const [blankToWordIdx, setBlankToWordIdx] = useState<(number | null)[]>(() => new Array(blankCount).fill(null));
  const [selectedWordIdx, setSelectedWordIdx] = useState<number | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  const usedWordIndices = new Set(blankToWordIdx.filter(x => x !== null) as number[]);
  const allFilled = blankToWordIdx.length === blankCount && blankToWordIdx.every(x => x !== null);

  const isCorrect = (bi: number) => {
    const wi = blankToWordIdx[bi];
    if (wi === null) return false;
    return mots[wi]?.trim().toLowerCase() === mots[bi]?.trim().toLowerCase();
  };
  const allCorrect = submitted && mots.every((_, i) => isCorrect(i));

  const handleWordClick = (wi: number) => {
    if (submitted) return;
    if (usedWordIndices.has(wi)) return;
    setSelectedWordIdx(prev => prev === wi ? null : wi);
  };

  const handleBlankClick = (bi: number) => {
    if (submitted) return;
    if (selectedWordIdx !== null) {
      // If the selected word is already in another blank, remove it from there first
      const prevBlank = blankToWordIdx.findIndex(x => x === selectedWordIdx);
      const next = [...blankToWordIdx];
      if (prevBlank !== -1) { next[prevBlank] = null; onInputChange(prevBlank, ''); }
      // If this blank had a word, it goes back to pool automatically (just overwrite)
      next[bi] = selectedWordIdx;
      setBlankToWordIdx(next);
      onInputChange(bi, mots[selectedWordIdx]);
      setSelectedWordIdx(null);
    } else {
      // Remove word from blank → back to pool
      if (blankToWordIdx[bi] !== null) {
        const next = [...blankToWordIdx];
        next[bi] = null;
        setBlankToWordIdx(next);
        onInputChange(bi, '');
      }
    }
  };

  return (
    <div style={{ background: 'white', minHeight: 'calc(100vh - 200px)', border: `2px solid ${PURPLE}25`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ height: 4, background: PURPLE }} />
      <div style={{ position: 'absolute', top: -80, right: -60, width: 200, height: 200, borderRadius: '50%', background: `${PURPLE}06` }} />
      <div style={{ padding: '40px 48px', position: 'relative' }}>
        <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: PURPLE, textTransform: 'uppercase' }}>Mini-jeu · Texte à trous</p>
        <h2 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 700, color: DARK }}>{slide.titre}</h2>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#6b7280' }}>{slide.instruction || 'Place les mots dans les bons emplacements.'}</p>

        {/* Phrase with clickable blanks */}
        <div style={{ padding: '20px 24px', background: `${PURPLE}04`, border: `1px solid ${PURPLE}18`, marginBottom: 20, lineHeight: 3, fontSize: 17, color: DARK, fontWeight: 500 }}>
          {segments.map((seg, si) => {
            if (seg.type === 'text') return <span key={si}>{seg.content}</span>;
            const bi = seg.blankIdx;
            const wi = blankToWordIdx[bi] ?? null;
            const hasWord = wi !== null;
            const correct = submitted ? isCorrect(bi) : null;
            const isDropTarget = selectedWordIdx !== null && !submitted;
            return (
              <span key={si}
                onClick={() => handleBlankClick(bi)}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  minWidth: Math.max(90, (mots[bi]?.length || 6) * 11),
                  height: 38, margin: '0 6px', padding: '0 14px',
                  border: `2px ${hasWord ? 'solid' : 'dashed'} ${submitted ? (correct ? GREEN : RED) : hasWord ? PURPLE : isDropTarget ? `${PURPLE}80` : '#c4b5fd'}`,
                  background: submitted ? (correct ? `${GREEN}12` : `${RED}10`) : hasWord ? `${PURPLE}15` : isDropTarget ? `${PURPLE}08` : `${PURPLE}04`,
                  color: submitted ? (correct ? GREEN : RED) : hasWord ? PURPLE : '#a78bfa',
                  fontWeight: hasWord ? 800 : 400, fontSize: 15,
                  cursor: !submitted ? 'pointer' : 'default',
                  transition: 'all 0.15s', verticalAlign: 'middle',
                  boxShadow: isDropTarget && !hasWord ? `0 0 0 3px ${PURPLE}30` : 'none',
                }}>
                {hasWord ? mots[wi!] : '···'}
                {submitted && hasWord && (correct
                  ? <CheckCircle size={14} style={{ color: GREEN }} />
                  : <XCircle size={14} style={{ color: RED }} />
                )}
              </span>
            );
          })}
        </div>

        {/* Instruction contextuelle */}
        {!submitted && (
          <p style={{ margin: '0 0 12px', fontSize: 12, color: selectedWordIdx !== null ? PURPLE : '#9ca3af', fontWeight: selectedWordIdx !== null ? 700 : 400, transition: 'color 0.2s' }}>
            {selectedWordIdx !== null
              ? `"${mots[selectedWordIdx]}" sélectionné — clique sur un emplacement pour le placer`
              : 'Clique sur un mot ci-dessous pour le sélectionner, puis sur un emplacement'}
          </p>
        )}

        {/* Banque de mots */}
        {!submitted && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            {mots.map((mot, wi) => {
              const isPlaced = usedWordIndices.has(wi);
              const isSelected = selectedWordIdx === wi;
              return (
                <button key={wi} onClick={() => handleWordClick(wi)}
                  style={{
                    padding: '9px 18px', fontWeight: 700, fontSize: 14,
                    border: `2px solid ${isSelected ? PURPLE : isPlaced ? '#e5e7eb' : `${PURPLE}55`}`,
                    background: isSelected ? PURPLE : isPlaced ? '#f3f4f6' : `${PURPLE}08`,
                    color: isSelected ? 'white' : isPlaced ? '#c4b5fd' : PURPLE,
                    cursor: isPlaced ? 'default' : 'pointer',
                    opacity: isPlaced ? 0.45 : 1,
                    transition: 'all 0.15s',
                    transform: isSelected ? 'scale(1.06)' : 'scale(1)',
                    boxShadow: isSelected ? `0 4px 12px ${PURPLE}40` : 'none',
                  }}>
                  {mot}
                  {isPlaced && <span style={{ marginLeft: 6, fontSize: 11 }}>✓</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Correction après soumission */}
        <AnimatePresence>
          {submitted && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {!allCorrect && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>Ordre attendu</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {mots.map((mot, i) => (
                      <span key={i} style={{ padding: '4px 12px', background: `${GREEN}15`, border: `1px solid ${GREEN}50`, color: GREEN, fontSize: 14, fontWeight: 700 }}>
                        {i + 1}. {mot}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ padding: '14px 18px', background: allCorrect ? `${GREEN}10` : `${PURPLE}06`, borderLeft: `3px solid ${allCorrect ? GREEN : PURPLE}` }}>
                <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: allCorrect ? GREEN : PURPLE, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {allCorrect ? '✓ Parfait !' : 'Explication'}
                </p>
                <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{slide.explication}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        {!submitted && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 4 }}>
            <button onClick={onSubmit} disabled={!allFilled}
              style={{ padding: '12px 32px', border: 'none', background: allFilled ? PURPLE : '#e5e7eb', color: 'white', cursor: allFilled ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s' }}>
              <PenLine size={16} /> Valider mes réponses
            </button>
            <button onClick={() => setShowAnswers(s => !s)}
              style={{ padding: '10px 18px', border: `1px solid ${PURPLE}40`, background: showAnswers ? `${PURPLE}10` : 'transparent', color: PURPLE, cursor: 'pointer', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Eye size={14} /> {showAnswers ? 'Masquer les réponses' : 'Voir les réponses'}
            </button>
          </div>
        )}
        <AnimatePresence>
          {showAnswers && !submitted && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} style={{ marginTop: 12 }}>
              <div style={{ padding: '12px 16px', background: `${PURPLE}08`, border: `1px solid ${PURPLE}30`, borderLeft: `3px solid ${PURPLE}` }}>
                <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: PURPLE, textTransform: 'uppercase', letterSpacing: 1.5 }}>Réponses attendues (dans l'ordre)</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {mots.map((mot, i) => (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', background: `${PURPLE}15`, border: `1px solid ${PURPLE}40`, color: PURPLE, fontSize: 14, fontWeight: 700 }}>
                      <span style={{ fontSize: 10, opacity: 0.55 }}>Blanc {i + 1} :</span> {mot}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── VraiFauxSlide ───────────────────────────────────────────────────────────
function VraiFauxSlide({ slide, answers, onAnswerChange, submitted, onSubmit }: {
  slide: SlideVraiFaux;
  answers: (boolean | null)[];
  onAnswerChange: (i: number, v: boolean) => void;
  submitted: boolean;
  onSubmit: () => void;
}) {
  const affirmations = slide.affirmations || [];
  const allAnswered = affirmations.every((_, i) => answers[i] !== null && answers[i] !== undefined);
  const correctCount = submitted ? affirmations.filter((a, i) => answers[i] === a.reponse).length : 0;
  const allCorrect = submitted && correctCount === affirmations.length;

  return (
    <div style={{ background: 'white', minHeight: 'calc(100vh - 200px)', border: `2px solid ${AMBER}25`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ height: 4, background: AMBER }} />
      <div style={{ position: 'absolute', top: -80, right: -60, width: 200, height: 200, borderRadius: '50%', background: `${AMBER}06` }} />
      <div style={{ padding: '36px 48px', position: 'relative' }}>
        <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: AMBER, textTransform: 'uppercase' }}>Mini-jeu · Vrai ou Faux</p>
        <h2 style={{ margin: '0 0 28px', fontSize: 26, fontWeight: 700, color: DARK }}>{slide.titre}</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          {affirmations.map((aff, i) => {
            const userAnswer = answers[i];
            const isAnswered = userAnswer !== null && userAnswer !== undefined;
            const correct = submitted ? userAnswer === aff.reponse : null;

            return (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <div style={{
                  border: `2px solid ${submitted ? (correct ? GREEN : RED) : isAnswered ? AMBER : '#e5e7eb'}`,
                  background: submitted ? (correct ? `${GREEN}08` : `${RED}06`) : 'white',
                  overflow: 'hidden',
                }}>
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    {/* Result icon */}
                    <div style={{ width: 24, flexShrink: 0, marginTop: 2 }}>
                      {submitted ? (
                        correct ? <CheckCircle size={20} style={{ color: GREEN }} /> : <XCircle size={20} style={{ color: RED }} />
                      ) : (
                        <span style={{ width: 20, height: 20, border: `2px solid #d1d5db`, display: 'inline-block', borderRadius: '50%' }} />
                      )}
                    </div>
                    <p style={{ margin: 0, flex: 1, fontSize: 16, color: DARK, lineHeight: 1.55, fontWeight: 500 }}>{aff.texte}</p>

                    {/* Vrai / Faux buttons */}
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      {[true, false].map(val => {
                        const label = val ? 'Vrai' : 'Faux';
                        const selected = userAnswer === val;
                        const btnColor = val ? GREEN : RED;
                        return (
                          <button key={String(val)} disabled={submitted}
                            onClick={() => onAnswerChange(i, val)}
                            style={{
                              padding: '7px 16px', border: `2px solid ${selected ? btnColor : '#e5e7eb'}`,
                              background: selected ? `${btnColor}15` : 'white',
                              color: selected ? btnColor : '#9ca3af',
                              cursor: submitted ? 'default' : 'pointer',
                              fontWeight: 700, fontSize: 13,
                              transition: 'all 0.15s',
                            }}>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation revealed after submit */}
                  <AnimatePresence>
                    {submitted && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0 }}>
                        <div style={{ padding: '10px 20px 14px 60px', background: correct ? `${GREEN}08` : `${RED}06`, borderTop: `1px solid ${correct ? GREEN : RED}20` }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: correct ? GREEN : RED }}>
                            {aff.reponse ? '✓ Vrai' : '✓ Faux'} —{' '}
                          </span>
                          <span style={{ fontSize: 13, color: '#374151' }}>{aff.explication}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {submitted ? (
          <div style={{ padding: '14px 18px', background: allCorrect ? `${GREEN}12` : `${AMBER}10`, borderLeft: `3px solid ${allCorrect ? GREEN : AMBER}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>{allCorrect ? '🏆' : correctCount >= affirmations.length / 2 ? '👍' : '💪'}</span>
            <div>
              <p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: 14, color: allCorrect ? GREEN : AMBER }}>
                {correctCount}/{affirmations.length} correct{correctCount > 1 ? 's' : ''}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                {allCorrect ? 'Excellent ! Tu maîtrises le sujet.' : 'Relis les explications pour consolider tes connaissances.'}
              </p>
            </div>
          </div>
        ) : (
          <button onClick={onSubmit} disabled={!allAnswered}
            style={{ padding: '12px 32px', border: 'none', background: allAnswered ? AMBER : '#e5e7eb', color: 'white', cursor: allAnswered ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ToggleLeft size={16} /> Valider mes réponses
          </button>
        )}
      </div>
    </div>
  );
}
