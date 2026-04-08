import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Trophy, RotateCcw, CheckCircle2, XCircle,
  ChevronRight, Zap, Loader2, Swords,
  Database, Code2, BarChart3, Table2, Star, Brain
} from 'lucide-react';

// ─── Config technologies ────────────────────────────────────────────────────
const TECH_CONFIG = {
  sql:     { label: 'SQL',      color: '#0EA5E9', bg: 'from-sky-700 to-sky-950',     border: 'border-sky-400',     icon: Database, desc: 'Requêtes · Jointures · Optimisation' },
  powerbi: { label: 'Power BI', color: '#F59E0B', bg: 'from-amber-700 to-amber-950', border: 'border-amber-400',   icon: BarChart3, desc: 'DAX · Modélisation · Visuels' },
  python:  { label: 'Python',   color: '#8B5CF6', bg: 'from-violet-700 to-violet-950', border: 'border-violet-400', icon: Code2,    desc: 'pandas · numpy · Data Science' },
  excel:   { label: 'Excel',    color: '#10B981', bg: 'from-emerald-700 to-emerald-950', border: 'border-emerald-400', icon: Table2, desc: 'Formules · TCD · Power Query' },
} as const;

type TechKey  = keyof typeof TECH_CONFIG;
type Diff     = 'débutant' | 'intermédiaire' | 'expert';
type Screen   = 'hub' | 'loading' | 'duel' | 'reveal' | 'results';

// Précision de l'IA selon la difficulté
const AI_ACCURACY: Record<Diff, number> = { débutant: 0.60, intermédiaire: 0.78, expert: 0.90 };
// Temps de "réflexion" IA en ms
const AI_THINK_MIN = 1400;
const AI_THINK_MAX = 3200;

interface Question {
  question:    string;
  choices:     string[];
  correct:     number;
  explanation: string;
}

interface RoundResult {
  question:       string;
  userAnswer:     number | null;
  aiAnswer:       number;
  correct:        number;
  userCorrect:    boolean;
  aiCorrect:      boolean;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function aiDecides(correct: number, choices: string[], accuracy: number): number {
  if (Math.random() < accuracy) return correct;
  const wrong = [0, 1, 2, 3].filter(i => i !== correct);
  return wrong[Math.floor(Math.random() * wrong.length)];
}

async function fetchQuestion(tech: string, difficulty: string, previousQuestions: string[]): Promise<Question> {
  const res = await fetch('/api/data-challenge/question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tech, difficulty, previousQuestions }),
  });
  if (!res.ok) throw new Error('Erreur réseau');
  return res.json();
}

// ─── Sous-composant : Avatar IA ──────────────────────────────────────────────
function AIAvatar({ thinking, correct, answered }: { thinking: boolean; correct?: boolean; answered: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2 transition-all duration-300 ${
          answered
            ? correct ? 'border-green-400 bg-green-900/40' : 'border-red-400 bg-red-900/40'
            : thinking ? 'border-blue-400 bg-blue-900/40 animate-pulse' : 'border-blue-700 bg-blue-900/30'
        }`}>
          🤖
        </div>
        {thinking && (
          <div className="absolute -bottom-1 -right-1">
            <Loader2 size={16} className="text-blue-400 animate-spin" />
          </div>
        )}
        {answered && (
          <div className="absolute -bottom-1 -right-1">
            {correct
              ? <CheckCircle2 size={18} className="text-green-400 fill-green-900" />
              : <XCircle      size={18} className="text-red-400 fill-red-900"   />}
          </div>
        )}
      </div>
      <span className="text-xs font-bold text-blue-300">IA FYNE</span>
    </div>
  );
}

// ─── Sous-composant : Avatar Joueur ──────────────────────────────────────────
function PlayerAvatar({ correct, answered }: { correct?: boolean; answered: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2 transition-all duration-300 ${
        answered
          ? correct ? 'border-green-400 bg-green-900/40' : 'border-red-400 bg-red-900/40'
          : 'border-blue-500 bg-blue-900/40'
      }`}>
        👤
      </div>
      {answered && (
        <div className="relative -mt-2 ml-10">
          {correct
            ? <CheckCircle2 size={18} className="text-green-400 fill-green-900" />
            : <XCircle      size={18} className="text-red-400 fill-red-900"   />}
        </div>
      )}
      <span className="text-xs font-bold text-blue-300">Vous</span>
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────
const TOTAL_ROUNDS = 8;
const TIMER_SECONDS = 25;

export default function DataChallenge() {
  const [, setLocation] = useLocation();

  // Navigation
  const [screen,     setScreen]     = useState<Screen>('hub');
  const [tech,       setTech]       = useState<TechKey | null>(null);
  const [difficulty, setDifficulty] = useState<Diff>('intermédiaire');

  // Jeu
  const [round,          setRound]          = useState(0);
  const [question,       setQuestion]       = useState<Question | null>(null);
  const [nextQuestion,   setNextQuestion]   = useState<Question | null>(null);
  const [userScore,      setUserScore]      = useState(0);
  const [aiScore,        setAiScore]        = useState(0);
  const [userAnswer,     setUserAnswer]     = useState<number | null>(null);
  const [aiAnswer,       setAiAnswer]       = useState<number | null>(null);
  const [aiThinking,     setAiThinking]     = useState(false);
  const [results,        setResults]        = useState<RoundResult[]>([]);
  const [prevQuestions,  setPrevQuestions]  = useState<string[]>([]);
  const [errorMsg,       setErrorMsg]       = useState('');

  // Timer
  const [timeLeft,    setTimeLeft]    = useState(TIMER_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const techCfg = tech ? TECH_CONFIG[tech] : null;
  const accuracy = difficulty ? AI_ACCURACY[difficulty] : 0.75;

  // ── Prefetch prochaine question ───────────────────────────────────────────
  const prefetchNext = useCallback(async (currentTech: string, currentDiff: string, currentPrev: string[]) => {
    try {
      const q = await fetchQuestion(currentTech, currentDiff, currentPrev);
      setNextQuestion(q);
    } catch { /* silencieux */ }
  }, []);

  // ── Démarrer le duel ─────────────────────────────────────────────────────
  const startDuel = async () => {
    if (!tech) return;
    setScreen('loading');
    setRound(0);
    setUserScore(0);
    setAiScore(0);
    setResults([]);
    setPrevQuestions([]);
    setNextQuestion(null);
    setErrorMsg('');
    try {
      const q = await fetchQuestion(tech, difficulty, []);
      setQuestion(q);
      setUserAnswer(null);
      setAiAnswer(null);
      setAiThinking(false);
      setTimeLeft(TIMER_SECONDS);
      setScreen('duel');
      setTimerActive(true);
      // Prefetch round 2
      prefetchNext(tech, difficulty, [q.question]);
    } catch {
      setErrorMsg('Impossible de charger une question. Vérifie ta connexion.');
      setScreen('hub');
    }
  };

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!timerActive) { if (timerRef.current) clearTimeout(timerRef.current); return; }
    if (timeLeft <= 0) { handlePlayerAnswer(-1); return; }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timerActive, timeLeft]);

  // ── Répondre ─────────────────────────────────────────────────────────────
  const handlePlayerAnswer = useCallback((idx: number) => {
    if (userAnswer !== null || !question || screen !== 'duel') return;
    setTimerActive(false);
    setUserAnswer(idx);

    // IA "réfléchit" puis répond
    setAiThinking(true);
    const thinkTime = randomBetween(AI_THINK_MIN, AI_THINK_MAX);
    setTimeout(() => {
      const ia = aiDecides(question.correct, question.choices, accuracy);
      setAiAnswer(ia);
      setAiThinking(false);

      const userCorrect = idx === question.correct;
      const aiCorrect   = ia  === question.correct;

      setUserScore(s => s + (userCorrect ? 1 : 0));
      setAiScore(s  => s + (aiCorrect   ? 1 : 0));
      setResults(r  => [...r, {
        question:    question.question,
        userAnswer:  idx,
        aiAnswer:    ia,
        correct:     question.correct,
        userCorrect,
        aiCorrect,
      }]);
      setPrevQuestions(p => [...p, question.question]);
      setScreen('reveal');
    }, thinkTime);
  }, [userAnswer, question, screen, accuracy]);

  // ── Passer au round suivant ───────────────────────────────────────────────
  const goNextRound = useCallback(async () => {
    const newRound = round + 1;
    if (newRound >= TOTAL_ROUNDS) { setScreen('results'); return; }
    setRound(newRound);
    setUserAnswer(null);
    setAiAnswer(null);
    setAiThinking(false);

    if (nextQuestion) {
      setQuestion(nextQuestion);
      setNextQuestion(null);
      setTimeLeft(TIMER_SECONDS);
      setScreen('duel');
      setTimerActive(true);
      // Prefetch round n+2
      if (tech) prefetchNext(tech, difficulty, [...prevQuestions, nextQuestion.question]);
    } else {
      setScreen('loading');
      try {
        const q = await fetchQuestion(tech!, difficulty, prevQuestions);
        setQuestion(q);
        setTimeLeft(TIMER_SECONDS);
        setScreen('duel');
        setTimerActive(true);
        if (tech) prefetchNext(tech, difficulty, [...prevQuestions, q.question]);
      } catch {
        setScreen('results');
      }
    }
  }, [round, nextQuestion, tech, difficulty, prevQuestions, prefetchNext]);

  const replay = () => {
    setNextQuestion(null);
    startDuel();
  };

  // ── Calculs résultats ────────────────────────────────────────────────────
  const userWins = userScore > aiScore;
  const tie      = userScore === aiScore;
  const pct      = Math.round((userScore / TOTAL_ROUNDS) * 100);

  const diffColors: Record<Diff, string> = {
    débutant:       '#10B981',
    intermédiaire:  '#F59E0B',
    expert:         '#EF4444',
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#030d1a] text-white relative overflow-hidden">
      {/* Fond grille */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(14,165,233,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <AnimatePresence mode="wait">

        {/* ══════════════ HUB ══════════════ */}
        {screen === 'hub' && (
          <motion.div key="hub" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="relative z-10 max-w-4xl mx-auto px-6 py-10">

            <button onClick={() => setLocation('/data-ia')} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mb-10 transition-colors">
              <ArrowLeft size={16} /> Retour
            </button>

            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 border border-blue-500/40">
                  <Swords size={22} className="text-blue-400" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-blue-400">Duel 1v1</span>
              </div>
              <h1 className="text-5xl font-black tracking-tight mb-2">
                <span className="text-blue-300">DATA</span>{' '}
                <span className="text-white">CHALLENGE</span>
              </h1>
              <div className="w-20 h-1 bg-blue-400 mb-4" />
              <p className="text-blue-200 max-w-lg">
                Affrontez l'IA FYNE en duel. <strong className="text-white">8 questions</strong> générées en temps réel par Gemini. Chaque question est unique.
              </p>
              {errorMsg && (
                <p className="mt-3 text-sm text-red-400 flex items-center gap-2"><XCircle size={14} />{errorMsg}</p>
              )}
            </div>

            {/* Sélection technologie */}
            <div className="mb-8">
              <p className="text-xs font-black uppercase tracking-widest text-blue-400 mb-4">Choisissez votre domaine</p>
              <div className="grid grid-cols-2 gap-4">
                {(Object.entries(TECH_CONFIG) as [TechKey, typeof TECH_CONFIG[TechKey]][]).map(([key, cfg], i) => {
                  const Icon = cfg.icon;
                  const sel = tech === key;
                  return (
                    <motion.button key={key} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setTech(key)}
                      className={`text-left p-5 border-2 bg-gradient-to-br ${cfg.bg} transition-all duration-200 relative`}
                      style={{ borderColor: sel ? cfg.color : `${cfg.color}30` }}>
                      {sel && <div className="absolute top-3 right-3"><CheckCircle2 size={16} style={{ color: cfg.color }} /></div>}
                      <div className="flex items-center gap-3 mb-2">
                        <Icon size={20} style={{ color: cfg.color }} />
                        <span className="font-black text-lg" style={{ color: cfg.color }}>{cfg.label}</span>
                      </div>
                      <p className="text-xs text-blue-200">{cfg.desc}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Difficulté */}
            <div className="mb-10">
              <p className="text-xs font-black uppercase tracking-widest text-blue-400 mb-4">Niveau de difficulté</p>
              <div className="flex gap-3 flex-wrap">
                {(['débutant', 'intermédiaire', 'expert'] as Diff[]).map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`px-5 py-2.5 text-sm font-bold border-2 transition-all ${difficulty === d ? 'text-white' : 'text-blue-300 border-blue-800 hover:border-blue-600'}`}
                    style={difficulty === d ? { background: diffColors[d], borderColor: diffColors[d] } : {}}>
                    {d === 'débutant' ? '🌱' : d === 'intermédiaire' ? '⚡' : '🔥'} {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-blue-400 mt-3">
                Précision de l'IA adverse :{' '}
                <strong style={{ color: diffColors[difficulty] }}>
                  {Math.round(AI_ACCURACY[difficulty] * 100)}%
                </strong>
              </p>
            </div>

            {/* Aperçu duel */}
            {tech && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-6 mb-8 p-4 bg-blue-900/20 border border-blue-800/50">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-800/50 border border-blue-600 flex items-center justify-center text-xl mb-1">👤</div>
                  <span className="text-xs text-blue-300 font-bold">Vous</span>
                </div>
                <div className="flex flex-col items-center">
                  <Swords size={24} className="text-blue-400" />
                  <span className="text-xs text-blue-400 font-black uppercase mt-1">VS</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-800/50 border border-blue-600 flex items-center justify-center text-xl mb-1">🤖</div>
                  <span className="text-xs text-blue-300 font-bold">IA FYNE</span>
                </div>
              </motion.div>
            )}

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={startDuel} disabled={!tech}
              className={`flex items-center gap-3 px-8 py-4 font-black text-lg text-white transition-all ${!tech ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90'}`}
              style={{ background: tech ? TECH_CONFIG[tech].color : '#1e3a5f' }}>
              <Swords size={20} /> Lancer le duel <ChevronRight size={20} />
            </motion.button>
            {tech && <p className="mt-2 text-xs text-blue-400">8 rounds · 25 secondes par question · Questions générées par IA</p>}
          </motion.div>
        )}

        {/* ══════════════ LOADING ══════════════ */}
        {screen === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-4">
            <Loader2 size={40} className="text-blue-400 animate-spin" />
            <p className="text-blue-200 font-bold">L'IA génère votre question…</p>
          </motion.div>
        )}

        {/* ══════════════ DUEL ══════════════ */}
        {(screen === 'duel' || screen === 'reveal') && question && techCfg && (
          <motion.div key="duel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="relative z-10 max-w-3xl mx-auto px-6 py-8">

            {/* ─ Scoreboard ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-6 gap-4">
              {/* Score joueur */}
              <div className="flex-1 bg-blue-900/30 border border-blue-700/50 p-3 text-center">
                <div className="text-2xl font-black" style={{ color: techCfg.color }}>{userScore}</div>
                <div className="text-xs text-blue-400 font-bold">Vous</div>
              </div>

              {/* Round */}
              <div className="text-center px-4">
                <div className="text-xs text-blue-400 font-black uppercase tracking-widest mb-1">Round</div>
                <div className="text-2xl font-black text-white">{round + 1}<span className="text-blue-500 text-base">/{TOTAL_ROUNDS}</span></div>
              </div>

              {/* Score IA */}
              <div className="flex-1 bg-blue-900/30 border border-blue-700/50 p-3 text-center">
                <div className="text-2xl font-black text-blue-300">{aiScore}</div>
                <div className="text-xs text-blue-400 font-bold">IA FYNE</div>
              </div>
            </div>

            {/* ─ Progress rounds ──────────────────────────────────────── */}
            <div className="flex gap-1 mb-6">
              {Array.from({ length: TOTAL_ROUNDS }, (_, i) => {
                const r = results[i];
                return (
                  <div key={i} className={`flex-1 h-1.5 transition-all ${
                    r ? (r.userCorrect ? 'bg-green-500' : 'bg-red-500') : i === round ? 'bg-blue-400' : 'bg-blue-900'
                  }`} />
                );
              })}
            </div>

            {/* ─ Avatars + Timer ──────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-6">
              <PlayerAvatar answered={userAnswer !== null} correct={userAnswer === question.correct} />

              {/* Timer ring */}
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="27" fill="none" stroke="#1e3a5f" strokeWidth="5" />
                  {screen === 'duel' && (
                    <circle cx="32" cy="32" r="27" fill="none" strokeWidth="5"
                      stroke={timeLeft <= 8 ? '#EF4444' : techCfg.color}
                      strokeDasharray={`${2 * Math.PI * 27}`}
                      strokeDashoffset={`${2 * Math.PI * 27 * (1 - timeLeft / TIMER_SECONDS)}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                  )}
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center font-black text-lg ${timeLeft <= 8 && screen === 'duel' ? 'text-red-400' : 'text-white'}`}>
                  {screen === 'reveal' ? <Brain size={20} className="text-blue-400" /> : timeLeft}
                </span>
              </div>

              <AIAvatar thinking={aiThinking} answered={aiAnswer !== null} correct={aiAnswer === question.correct} />
            </div>

            {/* ─ Question ─────────────────────────────────────────────── */}
            <motion.div key={round} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest px-2 py-0.5" style={{ background: `${techCfg.color}20`, color: techCfg.color }}>
                  {techCfg.label}
                </span>
                <span className="text-xs text-blue-400 capitalize">{difficulty}</span>
              </div>
              <h2 className="text-lg font-bold text-white leading-relaxed mb-6">{question.question}</h2>

              {/* ─ Choix ──────────────────────────────────────────────── */}
              <div className="space-y-3 mb-6">
                {question.choices.map((choice, i) => {
                  const isCorrect   = i === question.correct;
                  const userPicked  = i === userAnswer;
                  const aiPicked    = i === aiAnswer;
                  const inReveal    = screen === 'reveal';

                  let borderColor = techCfg.color + '40';
                  let bgColor     = 'rgba(14,30,60,0.4)';
                  let textColor   = 'text-blue-100';

                  if (inReveal) {
                    if (isCorrect) { borderColor = '#10B981'; bgColor = 'rgba(16,185,129,0.15)'; }
                    else if (userPicked || aiPicked) { borderColor = '#EF4444'; bgColor = 'rgba(239,68,68,0.12)'; }
                    else { borderColor = '#1e3a5f'; bgColor = 'rgba(14,30,60,0.2)'; textColor = 'text-blue-400'; }
                  }

                  return (
                    <motion.button key={i} whileHover={!inReveal && userAnswer === null ? { x: 4 } : {}}
                      onClick={() => handlePlayerAnswer(i)}
                      disabled={screen !== 'duel' || userAnswer !== null}
                      className={`w-full text-left p-4 border-2 transition-all duration-150 flex items-center gap-4 ${textColor}`}
                      style={{ borderColor, background: bgColor }}>
                      <span className="flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black"
                        style={{ borderColor }}>
                        {inReveal && isCorrect ? <CheckCircle2 size={14} className="text-green-400" /> :
                         inReveal && (userPicked || aiPicked) ? <XCircle size={14} className="text-red-400" /> :
                         String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1 text-sm font-medium">{choice}</span>
                      {/* Badges qui a choisi quoi */}
                      {inReveal && (
                        <div className="flex gap-1.5 flex-shrink-0">
                          {userPicked && <span className="text-xs px-1.5 py-0.5 font-black" style={{ background: `${techCfg.color}30`, color: techCfg.color }}>Vous</span>}
                          {aiPicked   && <span className="text-xs px-1.5 py-0.5 bg-blue-800/60 text-blue-300 font-black">IA</span>}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* ─ Explication (reveal) ──────────────────────────────── */}
              <AnimatePresence>
                {screen === 'reveal' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Résultat du round */}
                    <div className="flex gap-4 text-sm">
                      <div className={`flex-1 p-2.5 border-l-4 text-center font-bold ${userAnswer === question.correct ? 'border-green-500 bg-green-900/20 text-green-300' : userAnswer === null ? 'border-yellow-500 bg-yellow-900/20 text-yellow-300' : 'border-red-500 bg-red-900/20 text-red-300'}`}>
                        {userAnswer === null ? '⏱ Temps écoulé' : userAnswer === question.correct ? '✓ Vous' : '✗ Vous'}
                      </div>
                      <div className={`flex-1 p-2.5 border-l-4 text-center font-bold ${aiAnswer === question.correct ? 'border-green-500 bg-green-900/20 text-green-300' : 'border-red-500 bg-red-900/20 text-red-300'}`}>
                        {aiAnswer === question.correct ? '✓ IA' : '✗ IA'}
                      </div>
                    </div>

                    {/* Explication */}
                    <div className="p-3 bg-blue-900/20 border border-blue-800/50 border-l-4" style={{ borderLeftColor: techCfg.color }}>
                      <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: techCfg.color }}>Explication</p>
                      <p className="text-sm text-blue-100">{question.explanation}</p>
                    </div>

                    <button onClick={goNextRound}
                      className="w-full py-3.5 font-black text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                      style={{ background: techCfg.color }}>
                      {round + 1 >= TOTAL_ROUNDS
                        ? <><Trophy size={16} /> Voir les résultats finaux</>
                        : <>Round {round + 2} <ChevronRight size={16} /></>}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Waiting for AI */}
              {screen === 'duel' && userAnswer !== null && aiThinking && (
                <div className="flex items-center gap-2 text-blue-400 text-sm mt-4">
                  <Loader2 size={14} className="animate-spin" /> L'IA réfléchit…
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* ══════════════ RESULTS ══════════════ */}
        {screen === 'results' && techCfg && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="relative z-10 max-w-2xl mx-auto px-6 py-10">

            {/* Vainqueur */}
            <div className="text-center mb-10">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.15 }}
                className="w-24 h-24 rounded-full border-4 flex items-center justify-center text-4xl mx-auto mb-5"
                style={{ borderColor: techCfg.color, background: `${techCfg.color}15` }}>
                {tie ? '🤝' : userWins ? '🏆' : '🤖'}
              </motion.div>
              <h2 className="text-3xl font-black mb-1">
                {tie ? 'Égalité !' : userWins ? 'Victoire !' : 'L'IA gagne !'}
              </h2>
              <p className="text-blue-300">
                {tie ? 'Vous êtes à égalité avec l'IA.' : userWins ? 'Vous avez battu l'IA FYNE !' : 'L'IA FYNE vous a devancé cette fois.'}
              </p>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-6 bg-blue-900/30 border border-blue-700/40 text-center">
                <div className="text-5xl font-black mb-1" style={{ color: techCfg.color }}>{userScore}</div>
                <div className="text-sm text-blue-300">Vous · {pct}%</div>
                <div className="flex gap-1 mt-3 justify-center">
                  {results.map((r, i) => (
                    <div key={i} className="w-4 h-1.5 rounded-full" style={{ background: r.userCorrect ? '#10B981' : '#EF4444' }} />
                  ))}
                </div>
              </div>
              <div className="p-6 bg-blue-900/30 border border-blue-700/40 text-center">
                <div className="text-5xl font-black mb-1 text-blue-300">{aiScore}</div>
                <div className="text-sm text-blue-400">IA FYNE · {Math.round((aiScore / TOTAL_ROUNDS) * 100)}%</div>
                <div className="flex gap-1 mt-3 justify-center">
                  {results.map((r, i) => (
                    <div key={i} className="w-4 h-1.5 rounded-full" style={{ background: r.aiCorrect ? '#10B981' : '#EF4444' }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3].map(s => (
                <Star key={s} size={30} fill={pct >= s * 34 ? '#F59E0B' : 'none'} className={pct >= s * 34 ? 'text-amber-400' : 'text-blue-800'} />
              ))}
            </div>

            {/* Détail rounds */}
            <div className="mb-8">
              <p className="text-xs font-black uppercase tracking-widest text-blue-400 mb-3">Détail des rounds</p>
              <div className="space-y-2">
                {results.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-blue-900/20 border border-blue-900/50 text-sm">
                    <span className="text-blue-500 font-bold w-6 flex-shrink-0">{i + 1}</span>
                    <span className="flex-1 text-blue-200 truncate">{r.question.slice(0, 60)}{r.question.length > 60 ? '…' : ''}</span>
                    <span>{r.userCorrect ? <CheckCircle2 size={14} className="text-green-400" /> : <XCircle size={14} className="text-red-400" />}</span>
                    <span className="text-blue-500 text-xs w-5 text-right">vs</span>
                    <span>{r.aiCorrect ? <CheckCircle2 size={14} className="text-green-400" /> : <XCircle size={14} className="text-red-400" />}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 flex-wrap">
              <button onClick={replay}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 font-black text-white hover:opacity-90 transition-opacity"
                style={{ background: techCfg.color }}>
                <RotateCcw size={16} /> Rejouer
              </button>
              <button onClick={() => { setScreen('hub'); setTech(null); }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 font-bold border border-blue-700 text-blue-300 hover:border-blue-500 transition-colors">
                <ArrowLeft size={16} /> Changer
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
