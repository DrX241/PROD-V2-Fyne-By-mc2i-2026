import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle, XCircle, Trophy, RefreshCw,
  ChevronRight, Star, Target, Zap, Loader2, AlertTriangle,
  Play, BookOpen, HelpCircle, Award, Send, ThumbsUp, ThumbsDown, MessageSquare
} from 'lucide-react';
import mcLogoPath from '@assets/mc2i.png';

const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';

interface Choice {
  text: string;
  correct: boolean;
  feedback: string;
  points?: number;
}

interface Scenario {
  id: number;
  category: string;
  title: string;
  context?: string;
  situation: string;
  choices: Choice[];
  reflexe: string;
}

interface Situation {
  id: number;
  category: string;
  title: string;
  contexte?: string;
  situation: string;
  attendu: string;
}

interface SituationEval {
  score: number;
  appreciation: string;
  feedback: string;
  pointsForts: string[];
  pointsAmelioration: string[];
  reponseExperte: string;
}

interface QcmOption {
  text: string;
  correct: boolean;
}

interface QcmQuestion {
  question: string;
  options: QcmOption[];
  explanation: string;
}

interface GamifLevel {
  name: string;
  threshold: number;
}

interface Training {
  title: string;
  tagline: string;
  objectives: string[];
  modules: { title: string; duration: string; type: string }[];
  situations?: Situation[];
  scenarios?: Scenario[];
  scenario?: any;
  qcm: QcmQuestion[];
  gamification: {
    points: number;
    badge: string;
    levels: (string | GamifLevel)[];
  };
}

type Phase = 'loading' | 'error' | 'intro'
  | 'situation' | 'situation-evaluated'
  | 'scenario' | 'scenario-answered'
  | 'qcm' | 'qcm-answered'
  | 'final';

function getLevelName(levels: (string | GamifLevel)[], score: number, maxScore: number): string {
  const pct = maxScore > 0 ? score / maxScore : 0;
  const normalized = levels.map(l =>
    typeof l === 'string' ? { name: l, threshold: 0 } : l
  );
  const sorted = [...normalized].sort((a, b) => b.threshold - a.threshold);
  if (pct >= 0.85) return sorted[0]?.name || 'Expert';
  if (pct >= 0.5) return sorted[1]?.name || 'Praticien';
  return sorted[sorted.length - 1]?.name || 'Novice';
}

export default function TrainingPlayer() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const [phase, setPhase] = useState<Phase>('loading');
  const [training, setTraining] = useState<Training | null>(null);
  const [error, setError] = useState('');

  // Situation state (open-ended, AI-evaluated)
  const [situationIndex, setSituationIndex] = useState(0);
  const [situationResponse, setSituationResponse] = useState('');
  const [situationEval, setSituationEval] = useState<SituationEval | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [situationScores, setSituationScores] = useState<number[]>([]);

  // Legacy scenario state (choice-based, backward compat)
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [scenarioScores, setScenarioScores] = useState<number[]>([]);

  // QCM state
  const [qcmIndex, setQcmIndex] = useState(0);
  const [selectedQcmOption, setSelectedQcmOption] = useState<number | null>(null);
  const [qcmScores, setQcmScores] = useState<number[]>([]);

  // Load training from API
  useEffect(() => {
    if (!id) { setError('ID de formation manquant'); setPhase('error'); return; }
    fetch(`/api/studio/training/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        const content: Training = data.content;
        // Normalize: situations first (new format), then scenarios (old format)
        const toSituationStr = (v: any): string => {
          if (typeof v === 'string') return v;
          if (v && typeof v === 'object' && typeof v.situation === 'string') return v.situation;
          return '';
        };
        if (!content.situations || !Array.isArray(content.situations) || content.situations.length === 0) {
          if (content.scenarios && Array.isArray(content.scenarios) && content.scenarios.length > 0) {
            content.situations = content.scenarios.map((s: Scenario) => ({
              id: s.id,
              category: s.category || 'Mise en situation',
              title: s.title,
              contexte: s.context || '',
              situation: toSituationStr(s.situation),
              attendu: s.reflexe || 'Appliquez les bonnes pratiques.',
            }));
          } else if (content.scenario) {
            content.situations = [{
              id: 1,
              category: 'Mise en situation',
              title: 'Scénario',
              situation: toSituationStr(content.scenario.situation) || toSituationStr(content.scenario),
              attendu: 'Appliquez les bonnes pratiques.',
            }];
          } else {
            content.situations = [];
          }
        } else {
          // Defensive: fix any corrupted situations where situation field is an object
          content.situations = content.situations.map((s: any) => ({
            ...s,
            situation: toSituationStr(s.situation),
            attendu: typeof s.attendu === 'string' ? s.attendu : 'Appliquez les bonnes pratiques.',
          }));
        }
        setTraining(content);
        setPhase('intro');
      })
      .catch(() => { setError('Formation introuvable ou erreur de chargement.'); setPhase('error'); });
  }, [id]);

  const situations = training?.situations || [];
  const qcm = training?.qcm || [];
  const currentSituation = situations[situationIndex];
  const currentQcm = qcm[qcmIndex];

  const maxSituationPoints = situations.length * 100;
  const maxQcmPoints = qcm.length * 100;
  const maxTotalPoints = maxSituationPoints + maxQcmPoints;

  const totalScore =
    situationScores.reduce((a, b) => a + b, 0) +
    scenarioScores.reduce((a, b) => a + b, 0) +
    qcmScores.reduce((a, b) => a + b, 0);

  // ─── Situation handlers ────────────────────────────────────────────────────
  const handleSituationSubmit = async () => {
    if (!situationResponse.trim() || evaluating || !currentSituation) return;
    setEvaluating(true);
    try {
      const res = await fetch('/api/studio/evaluate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: currentSituation.situation,
          contexte: currentSituation.contexte || '',
          attendu: currentSituation.attendu,
          reponse: situationResponse,
        }),
      });
      const evalData: SituationEval = await res.json();
      setSituationEval(evalData);
      setSituationScores(prev => [...prev, evalData.score]);
      setPhase('situation-evaluated');
    } catch {
      setSituationEval({
        score: 50,
        appreciation: 'Bien',
        feedback: 'Votre réponse a été prise en compte.',
        pointsForts: [],
        pointsAmelioration: [],
        reponseExperte: currentSituation.attendu,
      });
      setSituationScores(prev => [...prev, 50]);
      setPhase('situation-evaluated');
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextSituation = () => {
    if (situationIndex < situations.length - 1) {
      setSituationIndex(prev => prev + 1);
      setSituationResponse('');
      setSituationEval(null);
      setPhase('situation');
    } else {
      if (qcm.length > 0) setPhase('qcm');
      else setPhase('final');
    }
  };

  // ─── Legacy scenario handlers ──────────────────────────────────────────────
  const handleChoiceSelect = (index: number) => {
    const scenarios = training?.scenarios || [];
    const currentScenario = scenarios[scenarioIndex];
    if (selectedChoice !== null || !currentScenario) return;
    setSelectedChoice(index);
    const choice = currentScenario.choices[index];
    setScenarioScores(prev => [...prev, choice.points ?? (choice.correct ? 100 : 0)]);
    setPhase('scenario-answered');
  };

  const handleNextScenario = () => {
    const scenarios = training?.scenarios || [];
    if (scenarioIndex < scenarios.length - 1) {
      setScenarioIndex(prev => prev + 1);
      setSelectedChoice(null);
      setPhase('scenario');
    } else {
      if (qcm.length > 0) setPhase('qcm');
      else setPhase('final');
    }
  };

  // ─── QCM handlers ──────────────────────────────────────────────────────────
  const handleQcmSelect = (index: number) => {
    if (selectedQcmOption !== null) return;
    setSelectedQcmOption(index);
    const opt = currentQcm.options[index];
    setQcmScores(prev => [...prev, opt.correct ? 100 : 0]);
    setPhase('qcm-answered');
  };

  const handleNextQcm = () => {
    if (qcmIndex < qcm.length - 1) {
      setQcmIndex(prev => prev + 1);
      setSelectedQcmOption(null);
      setPhase('qcm');
    } else {
      setPhase('final');
    }
  };

  // ─── Progress ──────────────────────────────────────────────────────────────
  const progress = phase === 'loading' || phase === 'error' ? 0
    : phase === 'intro' ? 5
    : (phase === 'situation' || phase === 'situation-evaluated')
      ? 5 + Math.round(((situationIndex + (situationEval ? 1 : 0)) / Math.max(situations.length, 1)) * 45)
    : (phase === 'scenario' || phase === 'scenario-answered')
      ? 5 + Math.round(((scenarioIndex + (selectedChoice !== null ? 1 : 0)) / Math.max((training?.scenarios || []).length, 1)) * 45)
    : (phase === 'qcm' || phase === 'qcm-answered')
      ? 50 + Math.round(((qcmIndex + (selectedQcmOption !== null ? 1 : 0)) / Math.max(qcm.length, 1)) * 45)
    : 100;

  const situationLabel = currentSituation
    ? `Mise en situation ${situationIndex + 1} / ${situations.length} — ${currentSituation.category}`
    : '';

  const scoreColor = situationEval
    ? situationEval.score >= 75 ? '#16a34a'
    : situationEval.score >= 50 ? '#f59e0b'
    : PINK
    : BLUE;

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ color: DARK }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="h-0.5 w-full bg-gray-100">
          <div className="h-full transition-all duration-700" style={{ width: `${progress}%`, background: PINK }} />
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation('/playground/module-generator')}
              className="hover:opacity-60 transition-opacity">
              <ArrowLeft size={18} style={{ color: BLUE }} />
            </button>
            <img src={mcLogoPath} alt="mc2i" className="h-7 w-auto" />
            <div className="h-4 w-px bg-gray-200" />
            <span className="font-bold text-sm" style={{ color: BLUE }}>FYNE</span>
            <div className="h-4 w-px bg-gray-200 hidden sm:block" />
            <span className="text-sm text-gray-500 font-medium hidden sm:block">
              {training?.title ? training.title.slice(0, 40) + (training.title.length > 40 ? '…' : '') : 'Lecteur de formation'}
            </span>
          </div>
          {phase !== 'loading' && phase !== 'error' && phase !== 'intro' && (
            <div className="flex items-center gap-3">
              <div className="text-xs font-bold px-3 py-1" style={{ background: `${BLUE}12`, color: BLUE }}>
                {totalScore} pts
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 pt-14">
        <AnimatePresence mode="wait">

          {/* ═══ LOADING ═══════════════════════════════════════════════════════ */}
          {phase === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center gap-6">
              <div className="w-14 h-14 border-4 border-gray-100 relative"
                style={{ borderTopColor: BLUE, animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p className="text-sm text-gray-500">Chargement de la formation...</p>
            </motion.div>
          )}

          {/* ═══ ERROR ═════════════════════════════════════════════════════════ */}
          {phase === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="min-h-screen flex flex-col items-center justify-center px-6 gap-6">
              <AlertTriangle size={40} style={{ color: PINK }} />
              <div className="text-center">
                <h2 className="text-xl font-black mb-2" style={{ color: DARK }}>Formation introuvable</h2>
                <p className="text-sm text-gray-500 mb-6">{error}</p>
              </div>
              <button onClick={() => setLocation('/playground/module-generator')}
                className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-sm"
                style={{ background: BLUE }}>
                <ArrowLeft size={16} /> Retour au Studio
              </button>
            </motion.div>
          )}

          {/* ═══ INTRO ═════════════════════════════════════════════════════════ */}
          {phase === 'intro' && training && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40 }}
              className="min-h-screen flex flex-col justify-center px-6 lg:px-16 py-20">
              <div className="max-w-2xl">
                <div className="text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1 inline-block"
                  style={{ background: `${BLUE}12`, color: BLUE }}>
                  Formation interactive · FYNE Studio
                </div>
                <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-3 leading-tight" style={{ color: DARK }}>
                  {training.title}
                </h1>
                <p className="text-lg mb-2" style={{ color: BLUE }}>{training.tagline}</p>
                <div className="w-16 h-1 mb-8" style={{ background: PINK }} />

                {/* Stats */}
                <div className="flex items-center gap-6 mb-10">
                  <div className="text-center">
                    <div className="text-2xl font-black" style={{ color: BLUE }}>{situations.length}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">situations</div>
                  </div>
                  <div className="h-10 w-px bg-gray-200" />
                  <div className="text-center">
                    <div className="text-2xl font-black" style={{ color: BLUE }}>{qcm.length}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">questions QCM</div>
                  </div>
                  <div className="h-10 w-px bg-gray-200" />
                  <div className="text-center">
                    <div className="text-2xl font-black" style={{ color: BLUE }}>{maxTotalPoints}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">points max</div>
                  </div>
                </div>

                {/* Objectifs */}
                {training.objectives && training.objectives.length > 0 && (
                  <div className="border border-gray-200 p-5 mb-8">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                      <Target size={13} /> Objectifs de la formation
                    </div>
                    <ul className="space-y-2">
                      {training.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm" style={{ color: DARK }}>
                          <ChevronRight size={15} className="flex-shrink-0 mt-0.5" style={{ color: BLUE }} />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Parcours */}
                {training.modules && training.modules.length > 0 && (
                  <div className="border border-gray-200 p-5 mb-10">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                      <BookOpen size={13} /> Parcours de formation
                    </div>
                    <div className="space-y-2">
                      {training.modules.map((mod, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <div className="w-6 h-6 flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                            style={{ background: BLUE }}>{i + 1}</div>
                          <span className="flex-1 font-medium" style={{ color: DARK }}>{mod.title}</span>
                          <span className="text-xs text-gray-400">{mod.type} · {mod.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setPhase(situations.length > 0 ? 'situation' : qcm.length > 0 ? 'qcm' : 'final')}
                  className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity"
                  style={{ background: PINK }}>
                  <Play size={18} /> Lancer la formation
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ MISE EN SITUATION (open-ended) ════════════════════════════════ */}
          {(phase === 'situation' || phase === 'situation-evaluated') && currentSituation && (
            <motion.div key={`situation-${situationIndex}`}
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="min-h-screen flex flex-col justify-center px-6 lg:px-16 py-20">
              <div className="max-w-2xl">
                <div className="text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1 inline-block"
                  style={{ background: `${BLUE}12`, color: BLUE }}>
                  {situationLabel}
                </div>
                <h2 className="text-3xl font-black mb-2" style={{ color: DARK }}>
                  {currentSituation.title}
                </h2>
                <div className="w-12 h-1 mb-8" style={{ background: PINK }} />

                {/* Contexte */}
                {currentSituation.contexte && (
                  <div className="border-l-2 pl-4 py-2 mb-4 text-sm bg-gray-50 px-4"
                    style={{ borderColor: BLUE, color: '#6b7280' }}>
                    {currentSituation.contexte}
                  </div>
                )}

                {/* Situation */}
                <div className="border border-gray-200 p-5 mb-7 bg-white">
                  <p className="text-base leading-relaxed" style={{ color: DARK }}>
                    {currentSituation.situation}
                  </p>
                </div>

                {/* Réponse ou Évaluation */}
                {phase === 'situation' ? (
                  <>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      Votre réponse — comment réagissez-vous dans cette situation ?
                    </label>
                    <textarea
                      value={situationResponse}
                      onChange={e => setSituationResponse(e.target.value)}
                      placeholder="Décrivez votre analyse et les actions que vous prendriez..."
                      className="w-full border border-gray-200 px-4 py-3 text-sm resize-none focus:outline-none focus:border-gray-400 bg-white mb-4"
                      style={{ minHeight: 130, color: DARK }}
                      disabled={evaluating}
                    />
                    <button
                      onClick={handleSituationSubmit}
                      disabled={!situationResponse.trim() || evaluating}
                      className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: PINK }}>
                      {evaluating
                        ? <><Loader2 size={18} className="animate-spin" /> Évaluation en cours…</>
                        : <><Send size={18} /> Soumettre ma réponse</>}
                    </button>
                  </>
                ) : situationEval && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Score */}
                    <div className="border p-5 mb-4 flex items-center gap-6"
                      style={{ borderColor: scoreColor, background: `${scoreColor}08` }}>
                      <div className="text-center flex-shrink-0">
                        <div className="text-4xl font-black" style={{ color: scoreColor }}>
                          {situationEval.score}
                        </div>
                        <div className="text-xs text-gray-500">/ 100 pts</div>
                      </div>
                      <div>
                        <div className="font-bold text-sm mb-1" style={{ color: scoreColor }}>
                          {situationEval.appreciation}
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: DARK }}>
                          {situationEval.feedback}
                        </p>
                      </div>
                    </div>

                    {/* Points forts */}
                    {situationEval.pointsForts && situationEval.pointsForts.length > 0 && (
                      <div className="border border-gray-100 p-4 mb-3 bg-green-50">
                        <div className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-green-700">
                          <ThumbsUp size={12} /> Points forts
                        </div>
                        <ul className="space-y-1">
                          {situationEval.pointsForts.map((p, i) => (
                            <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                              <CheckCircle size={13} className="flex-shrink-0 mt-0.5 text-green-600" /> {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Points à améliorer */}
                    {situationEval.pointsAmelioration && situationEval.pointsAmelioration.length > 0 && (
                      <div className="border border-gray-100 p-4 mb-3 bg-orange-50">
                        <div className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-orange-700">
                          <ThumbsDown size={12} /> À améliorer
                        </div>
                        <ul className="space-y-1">
                          {situationEval.pointsAmelioration.map((p, i) => (
                            <li key={i} className="text-sm text-orange-800 flex items-start gap-2">
                              <ChevronRight size={13} className="flex-shrink-0 mt-0.5" /> {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Réponse experte */}
                    <div className="border p-4 mb-6 flex items-start gap-3"
                      style={{ borderColor: BLUE, background: `${BLUE}08` }}>
                      <MessageSquare size={16} className="flex-shrink-0 mt-0.5" style={{ color: BLUE }} />
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: BLUE }}>
                          Réponse experte
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: DARK }}>
                          {situationEval.reponseExperte}
                        </p>
                      </div>
                    </div>

                    <button onClick={handleNextSituation}
                      className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity"
                      style={{ background: BLUE }}>
                      {situationIndex < situations.length - 1
                        ? <>Situation suivante <ChevronRight size={18} /></>
                        : qcm.length > 0
                        ? <>Passer au QCM <ChevronRight size={18} /></>
                        : <>Voir mon score <ChevronRight size={18} /></>}
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ SCÉNARIO (legacy choice-based, backward compat) ════════════ */}
          {(phase === 'scenario' || phase === 'scenario-answered') && (() => {
            const scenarios = training?.scenarios || [];
            const currentScenario = scenarios[scenarioIndex];
            if (!currentScenario) return null;
            const scenarioLabel = `Scénario ${scenarioIndex + 1} / ${scenarios.length} — ${currentScenario.category}`;
            return (
              <motion.div key={`scenario-${scenarioIndex}`}
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                className="min-h-screen flex flex-col justify-center px-6 lg:px-16 py-20">
                <div className="max-w-2xl">
                  <div className="text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1 inline-block"
                    style={{ background: `${BLUE}12`, color: BLUE }}>
                    {scenarioLabel}
                  </div>
                  <h2 className="text-3xl font-black mb-2" style={{ color: DARK }}>
                    {currentScenario.title}
                  </h2>
                  <div className="w-12 h-1 mb-8" style={{ background: PINK }} />

                  {currentScenario.context && (
                    <div className="border-l-2 pl-4 py-2 mb-4 text-sm bg-gray-50 px-4"
                      style={{ borderColor: BLUE, color: '#6b7280' }}>
                      {currentScenario.context}
                    </div>
                  )}

                  <div className="border border-gray-200 p-5 mb-7 bg-white">
                    <p className="text-base leading-relaxed" style={{ color: DARK }}>
                      {currentScenario.situation}
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    {currentScenario.choices.map((choice, i) => {
                      const answered = selectedChoice !== null;
                      const isSelected = selectedChoice === i;
                      const isCorrect = choice.correct;
                      return (
                        <motion.button key={i}
                          onClick={() => handleChoiceSelect(i)}
                          disabled={answered}
                          whileHover={!answered ? { x: 3 } : {}}
                          className="w-full text-left border px-5 py-4 transition-all flex items-start gap-4 text-sm disabled:cursor-default"
                          style={{
                            borderColor: !answered ? '#e5e7eb' : isCorrect ? '#16a34a' : isSelected ? PINK : '#e5e7eb',
                            background: !answered ? 'white' : isCorrect ? '#f0fdf4' : isSelected ? `${PINK}08` : '#f9fafb',
                          }}>
                          <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-black border"
                            style={{
                              borderColor: answered && isCorrect ? '#16a34a' : answered && isSelected ? PINK : '#d1d5db',
                              color: answered && isCorrect ? '#16a34a' : answered && isSelected ? PINK : '#6b7280',
                              background: answered && isCorrect ? '#f0fdf4' : 'transparent',
                            }}>
                            {answered ? isCorrect ? <CheckCircle size={14} /> : isSelected ? <XCircle size={14} /> : String.fromCharCode(65 + i) : String.fromCharCode(65 + i)}
                          </span>
                          <div className="flex-1">
                            <div style={{ color: DARK, fontWeight: isSelected ? 600 : 400 }}>{choice.text}</div>
                            {answered && isSelected && choice.feedback && (
                              <div className="text-xs mt-2 leading-relaxed"
                                style={{ color: isCorrect ? '#15803d' : '#9ca3af' }}>
                                {choice.feedback}
                              </div>
                            )}
                            {answered && !isSelected && isCorrect && choice.feedback && (
                              <div className="text-xs mt-2 leading-relaxed" style={{ color: '#15803d' }}>
                                ✓ {choice.feedback}
                              </div>
                            )}
                          </div>
                          {answered && (
                            <div className="flex-shrink-0 text-xs font-bold px-2 py-1"
                              style={{
                                background: isCorrect ? '#dcfce7' : isSelected ? `${PINK}15` : 'transparent',
                                color: isCorrect ? '#15803d' : PINK,
                              }}>
                              {isCorrect ? `+${choice.points ?? 100} pts` : isSelected ? '0 pt' : ''}
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {phase === 'scenario-answered' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="border p-4 mb-6 flex items-start gap-3"
                      style={{ borderColor: BLUE, background: `${BLUE}08` }}>
                      <Zap size={16} className="flex-shrink-0 mt-0.5" style={{ color: BLUE }} />
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: BLUE }}>
                          Réflexe à retenir
                        </div>
                        <p className="text-sm" style={{ color: DARK }}>{currentScenario.reflexe}</p>
                      </div>
                    </motion.div>
                  )}

                  {phase === 'scenario-answered' && (
                    <button onClick={handleNextScenario}
                      className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity"
                      style={{ background: BLUE }}>
                      {scenarioIndex < (training?.scenarios || []).length - 1
                        ? <>Scénario suivant <ChevronRight size={18} /></>
                        : qcm.length > 0
                        ? <>Passer au QCM <ChevronRight size={18} /></>
                        : <>Voir mon score <ChevronRight size={18} /></>}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })()}

          {/* ═══ QCM ═══════════════════════════════════════════════════════════ */}
          {(phase === 'qcm' || phase === 'qcm-answered') && currentQcm && (
            <motion.div key={`qcm-${qcmIndex}`}
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="min-h-screen flex flex-col justify-center px-6 lg:px-16 py-20">
              <div className="max-w-2xl">
                <div className="text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1 inline-block"
                  style={{ background: `${PINK}12`, color: PINK }}>
                  QCM Immersif · Question {qcmIndex + 1} / {qcm.length}
                </div>

                <div className="mb-6">
                  <p className="text-xl font-black leading-snug" style={{ color: DARK }}>
                    {currentQcm.question}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {currentQcm.options.map((opt, i) => {
                    const answered = selectedQcmOption !== null;
                    const isSelected = selectedQcmOption === i;
                    const isCorrect = opt.correct;
                    return (
                      <motion.button key={i}
                        onClick={() => handleQcmSelect(i)}
                        disabled={answered}
                        whileHover={!answered ? { x: 3 } : {}}
                        className="w-full text-left border px-5 py-4 transition-all flex items-center gap-4 text-sm disabled:cursor-default"
                        style={{
                          borderColor: !answered ? '#e5e7eb' : isCorrect ? '#16a34a' : isSelected ? PINK : '#e5e7eb',
                          background: !answered ? 'white' : isCorrect ? '#f0fdf4' : isSelected ? `${PINK}08` : '#f9fafb',
                        }}>
                        <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-black border"
                          style={{
                            borderColor: answered && isCorrect ? '#16a34a' : answered && isSelected ? PINK : '#d1d5db',
                            color: answered && isCorrect ? '#16a34a' : answered && isSelected ? PINK : '#6b7280',
                          }}>
                          {answered ? isCorrect ? <CheckCircle size={14} /> : isSelected ? <XCircle size={14} /> : String.fromCharCode(65 + i) : String.fromCharCode(65 + i)}
                        </span>
                        <span style={{ color: DARK, fontWeight: isSelected ? 600 : 400 }}>{opt.text}</span>
                        {answered && isCorrect && (
                          <span className="ml-auto text-xs font-bold px-2 py-1"
                            style={{ background: '#dcfce7', color: '#15803d' }}>
                            +100 pts
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {phase === 'qcm-answered' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="border-l-2 pl-4 py-3 mb-6 bg-gray-50 px-4"
                    style={{ borderColor: BLUE }}>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"
                      style={{ color: BLUE }}>
                      <HelpCircle size={12} /> Explication
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: DARK }}>
                      {currentQcm.explanation}
                    </p>
                  </motion.div>
                )}

                {phase === 'qcm-answered' && (
                  <button onClick={handleNextQcm}
                    className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity"
                    style={{ background: BLUE }}>
                    {qcmIndex < qcm.length - 1
                      ? <>Question suivante <ChevronRight size={18} /></>
                      : <>Voir mon score <ChevronRight size={18} /></>}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ SCORE FINAL ════════════════════════════════════════════════════ */}
          {phase === 'final' && training && (
            <motion.div key="final"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="min-h-screen flex flex-col justify-center px-6 lg:px-16 py-20">
              <div className="max-w-2xl">
                <div className="text-6xl mb-4">{training.gamification?.badge || '🏆'}</div>
                <div className="text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 inline-block"
                  style={{ background: `${PINK}12`, color: PINK }}>
                  Formation terminée
                </div>
                <h1 className="text-4xl font-black mb-2" style={{ color: DARK }}>
                  {getLevelName(training.gamification?.levels || [], totalScore, maxTotalPoints)}
                </h1>
                <p className="text-base mb-2" style={{ color: BLUE }}>{training.title}</p>
                <div className="w-16 h-1 mb-10" style={{ background: PINK }} />

                {/* Score principal */}
                <div className="border border-gray-200 p-8 mb-6 text-center">
                  <div className="text-6xl font-black mb-2"
                    style={{ color: totalScore >= maxTotalPoints * 0.7 ? BLUE : totalScore >= maxTotalPoints * 0.4 ? '#f59e0b' : PINK }}>
                    {totalScore}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">points sur {maxTotalPoints}</div>
                  <div className="w-full bg-gray-100 h-2 mt-4">
                    <div className="h-full transition-all duration-1000"
                      style={{
                        width: `${maxTotalPoints > 0 ? Math.round((totalScore / maxTotalPoints) * 100) : 0}%`,
                        background: totalScore >= maxTotalPoints * 0.7 ? BLUE : totalScore >= maxTotalPoints * 0.4 ? '#f59e0b' : PINK,
                      }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {maxTotalPoints > 0 ? Math.round((totalScore / maxTotalPoints) * 100) : 0}% de réussite
                  </div>
                </div>

                {/* Détail par section */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {situations.length > 0 && (
                    <div className="border border-gray-200 p-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                        <MessageSquare size={12} /> Mises en situation
                      </div>
                      <div className="text-2xl font-black" style={{ color: BLUE }}>
                        {situationScores.reduce((a, b) => a + b, 0)}
                        <span className="text-sm font-normal text-gray-400"> / {maxSituationPoints}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {situationScores.length} / {situations.length} complétées
                      </div>
                    </div>
                  )}
                  {qcm.length > 0 && (
                    <div className="border border-gray-200 p-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                        <HelpCircle size={12} /> QCM
                      </div>
                      <div className="text-2xl font-black" style={{ color: BLUE }}>
                        {qcmScores.reduce((a, b) => a + b, 0)}
                        <span className="text-sm font-normal text-gray-400"> / {maxQcmPoints}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {qcmScores.filter(s => s > 0).length} / {qcm.length} corrects
                      </div>
                    </div>
                  )}
                </div>

                {/* Niveaux */}
                {training.gamification?.levels && training.gamification.levels.length > 0 && (
                  <div className="border border-gray-100 p-4 mb-8 bg-gray-50">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                      <Star size={12} /> Niveaux de la formation
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {training.gamification.levels.map((level, i) => {
                        const name = typeof level === 'string' ? level : level.name;
                        const currentLevel = getLevelName(training.gamification.levels, totalScore, maxTotalPoints);
                        const isActive = name === currentLevel;
                        return (
                          <span key={i} className="px-3 py-1.5 text-xs font-bold"
                            style={{
                              background: isActive ? BLUE : `${BLUE}12`,
                              color: isActive ? 'white' : BLUE,
                            }}>
                            {isActive && <Award size={11} className="inline mr-1" />}
                            {name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      setSituationIndex(0); setSituationResponse(''); setSituationEval(null); setSituationScores([]);
                      setScenarioIndex(0); setSelectedChoice(null); setScenarioScores([]);
                      setQcmIndex(0); setSelectedQcmOption(null); setQcmScores([]);
                      setPhase('intro');
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm border-2 hover:opacity-80 transition-opacity"
                    style={{ borderColor: BLUE, color: BLUE }}>
                    <RefreshCw size={16} /> Recommencer
                  </button>
                  <button
                    onClick={() => setLocation('/playground/module-generator')}
                    className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-sm hover:opacity-90 transition-opacity"
                    style={{ background: BLUE }}>
                    Créer une autre formation
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
