import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Brain, Sparkles, Loader2, CheckCircle,
  Trophy, Target, Users, Clock, Zap, BookOpen, MessageSquare,
  ChevronRight, RotateCcw, Star, Play, HelpCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import mcLogoPath from '@assets/mc2i.png';

const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';

const AUDIENCES = [
  { value: 'grand_public', label: 'Grand public' },
  { value: 'managers', label: 'Managers & Responsables' },
  { value: 'experts', label: 'Experts techniques' },
  { value: 'rh', label: 'RH & Formation' },
  { value: 'dirigeants', label: 'Dirigeants & COMEX' },
  { value: 'commercial', label: 'Équipes commerciales' },
];

const DURATIONS = [
  { value: '15', label: '15 min', sub: 'micro-learning' },
  { value: '30', label: '30 min', sub: 'express' },
  { value: '60', label: '1 heure', sub: 'standard' },
  { value: '120', label: '2 heures', sub: 'approfondi' },
];

const GAMIFICATION = [
  { value: 'low', label: 'Sérieux', sub: 'axé contenu', icon: '📚' },
  { value: 'medium', label: 'Équilibré', sub: 'contenu + jeu', icon: '⚡' },
  { value: 'high', label: 'Ludique', sub: 'max engagement', icon: '🎮' },
];

const GENERATION_STEPS = [
  'Analyse de votre besoin...',
  'Sélection des meilleures sources...',
  'Structuration du parcours...',
  'Création des scénarios...',
  'Génération des QCM...',
  'Intégration de la gamification...',
  'Finalisation de la formation...',
];

interface TrainingResult {
  title: string;
  tagline: string;
  objectives: string[];
  modules: { title: string; duration: string; type: string }[];
  scenario: { situation: string; choices: { text: string; correct: boolean; feedback: string }[] };
  scenarios?: any[];
  qcm: { question: string; options: { text: string; correct: boolean }[]; explanation: string }[];
  gamification: { points: number; badge: string; levels: any[] };
}

export default function StudioIA() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState<'pitch' | 'config' | 'generating' | 'result'>('pitch');
  const [pitch, setPitch] = useState('');
  const [domain, setDomain] = useState('');
  const [audience, setAudience] = useState('grand_public');
  const [duration, setDuration] = useState('30');
  const [gamification, setGamification] = useState('medium');
  const [genStep, setGenStep] = useState(0);
  const [result, setResult] = useState<TrainingResult | null>(null);
  const [trainingId, setTrainingId] = useState<string | null>(null);
  const [activeScenarioChoice, setActiveScenarioChoice] = useState<number | null>(null);
  const [activeQcm, setActiveQcm] = useState<number | null>(null);

  const progress = step === 'pitch' ? 25 : step === 'config' ? 50 : step === 'generating' ? 75 : 100;

  const generate = async () => {
    setStep('generating');
    setGenStep(0);
    const interval = setInterval(() => {
      setGenStep(prev => prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev);
    }, 800);
    try {
      const res = await fetch('/api/studio/generate-from-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch, domain, audience, duration, gamification }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      clearInterval(interval);
      setGenStep(GENERATION_STEPS.length - 1);
      setTimeout(() => { setResult(data.training); setTrainingId(data.id || null); setStep('result'); }, 500);
    } catch {
      clearInterval(interval);
      toast({ title: 'Erreur', description: 'La génération a échoué. Réessayez.', variant: 'destructive' });
      setStep('config');
    }
  };

  const restart = () => {
    setPitch(''); setDomain(''); setAudience('grand_public');
    setDuration('30'); setGamification('medium');
    setResult(null); setTrainingId(null); setActiveScenarioChoice(null); setActiveQcm(null);
    setStep('pitch');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ color: DARK }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="h-0.5 w-full bg-gray-100">
          <div className="h-full transition-all duration-700" style={{ width: `${progress}%`, background: PINK }} />
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => step === 'pitch' ? setLocation('/playground/module-generator') : restart()}
              className="hover:opacity-60 transition-opacity">
              <ArrowLeft size={18} style={{ color: BLUE }} />
            </button>
            <img src={mcLogoPath} alt="mc2i" className="h-7 w-auto" />
            <div className="h-4 w-px bg-gray-200" />
            <span className="font-bold text-sm" style={{ color: BLUE }}>FYNE</span>
            <div className="h-4 w-px bg-gray-200 hidden sm:block" />
            <span className="text-sm text-gray-500 font-medium hidden sm:block">Studio IA · Génération</span>
          </div>
          {result && (
            <button onClick={restart} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors">
              <RotateCcw size={13} /> Recommencer
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 pt-14">
        <AnimatePresence mode="wait">

          {/* ═══ PITCH ═══════════════════════════════════════════════════════ */}
          {step === 'pitch' && (
            <motion.div key="pitch" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="min-h-screen flex flex-col justify-center px-6 lg:px-16 py-16">
              <div className="max-w-2xl">
                <div className="text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1 inline-block"
                  style={{ background: `${BLUE}12`, color: BLUE }}>
                  Étape 1 sur 2 · Votre besoin
                </div>
                <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4 leading-tight">
                  <span style={{ color: PINK }}>Pitchez</span> votre<br />
                  <span style={{ color: BLUE }}>besoin de formation</span>
                </h1>
                <div className="w-16 h-1 mb-6" style={{ background: PINK }} />
                <p className="text-base text-gray-600 leading-relaxed mb-10">
                  Décrivez en quelques mots ce que vous voulez former. Contexte, problème à résoudre, résultat attendu. Soyez précis.
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      Votre besoin de formation *
                    </label>
                    <textarea
                      value={pitch}
                      onChange={e => setPitch(e.target.value)}
                      placeholder="Ex : Je veux former mes commerciaux aux bonnes pratiques de cybersécurité — phishing, mots de passe, données clients. Ils n'ont aucune base technique."
                      className="w-full border border-gray-200 px-4 py-3 text-sm resize-none focus:outline-none focus:border-gray-400 bg-white"
                      style={{ minHeight: 140, color: DARK }}
                    />
                    <p className="text-xs text-gray-400 mt-1">{pitch.length} / 500 caractères</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      Domaine / secteur (optionnel)
                    </label>
                    <input
                      type="text"
                      value={domain}
                      onChange={e => setDomain(e.target.value)}
                      placeholder="Ex : Cybersécurité, Data, RH, Finance, Vente..."
                      className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-gray-400 bg-white"
                      style={{ color: DARK }}
                    />
                  </div>

                  <div className="border-l-2 pl-4 py-1" style={{ borderColor: BLUE }}>
                    <p className="text-sm text-gray-500">
                      Plus votre pitch est précis, plus la formation sera pertinente et directement utilisable.
                    </p>
                  </div>

                  <button
                    onClick={() => setStep('config')}
                    disabled={pitch.trim().length < 20}
                    className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ background: BLUE }}
                  >
                    Continuer <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ CONFIG ═══════════════════════════════════════════════════════ */}
          {step === 'config' && (
            <motion.div key="config" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="min-h-screen flex flex-col justify-center px-6 lg:px-16 py-16">
              <div className="max-w-2xl">
                <div className="text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1 inline-block"
                  style={{ background: `${BLUE}12`, color: BLUE }}>
                  Étape 2 sur 2 · Paramètres
                </div>
                <h1 className="text-4xl font-black tracking-tight mb-4" style={{ color: DARK }}>
                  Paramétrez<br /><span style={{ color: BLUE }}>la formation</span>
                </h1>
                <div className="w-16 h-1 mb-8" style={{ background: PINK }} />

                <div className="space-y-10">
                  {/* Public */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                      Public cible
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {AUDIENCES.map(a => (
                        <button key={a.value} onClick={() => setAudience(a.value)}
                          className="text-left border px-4 py-3 text-sm font-medium transition-all"
                          style={{
                            borderColor: audience === a.value ? BLUE : '#e5e7eb',
                            background: audience === a.value ? `${BLUE}08` : 'white',
                            color: audience === a.value ? BLUE : DARK,
                          }}>
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Durée */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                      Durée souhaitée
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {DURATIONS.map(d => (
                        <button key={d.value} onClick={() => setDuration(d.value)}
                          className="text-center border px-3 py-4 transition-all"
                          style={{
                            borderColor: duration === d.value ? BLUE : '#e5e7eb',
                            background: duration === d.value ? `${BLUE}08` : 'white',
                          }}>
                          <div className="text-sm font-bold" style={{ color: duration === d.value ? BLUE : DARK }}>{d.label}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{d.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gamification */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                      Niveau de gamification
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {GAMIFICATION.map(g => (
                        <button key={g.value} onClick={() => setGamification(g.value)}
                          className="text-center border px-4 py-5 transition-all"
                          style={{
                            borderColor: gamification === g.value ? BLUE : '#e5e7eb',
                            background: gamification === g.value ? `${BLUE}08` : 'white',
                          }}>
                          <div className="text-3xl mb-2">{g.icon}</div>
                          <div className="text-sm font-bold" style={{ color: gamification === g.value ? BLUE : DARK }}>{g.label}</div>
                          <div className="text-xs text-gray-500">{g.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={generate}
                    className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity"
                    style={{ background: BLUE }}
                  >
                    <Sparkles size={18} /> Générer ma formation
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ GÉNÉRATION ═══════════════════════════════════════════════════ */}
          {step === 'generating' && (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
              <div className="w-16 h-16 border-4 border-gray-100 mb-10 relative"
                style={{ borderTopColor: BLUE, animation: 'spin 1s linear infinite' }}>
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: BLUE }}>
                L'IA crée votre formation
              </div>
              <h2 className="text-2xl font-black text-center mb-2" style={{ color: DARK }}>
                Génération en cours
              </h2>
              <p className="text-gray-500 text-sm mb-12 text-center">Cela prend quelques secondes...</p>

              <div className="w-full max-w-sm space-y-3">
                {GENERATION_STEPS.map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${i <= genStep ? 'opacity-100' : 'opacity-20'}`}>
                    {i < genStep
                      ? <CheckCircle size={16} style={{ color: BLUE, flexShrink: 0 }} />
                      : i === genStep
                      ? <Loader2 size={16} className="animate-spin flex-shrink-0" style={{ color: BLUE }} />
                      : <div className="w-4 h-4 border border-gray-300 flex-shrink-0" />}
                    <span className="text-sm" style={{ color: i === genStep ? DARK : '#9ca3af', fontWeight: i === genStep ? 600 : 400 }}>
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ═══ RÉSULTAT ═══════════════════════════════════════════════════ */}
          {step === 'result' && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="min-h-screen px-6 lg:px-16 py-12">
              <div className="max-w-3xl">
                {/* Titre résultat */}
                <div className="text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 inline-block"
                  style={{ background: `${BLUE}12`, color: BLUE }}>
                  Formation générée
                </div>
                <h1 className="text-4xl font-black mb-2" style={{ color: DARK }}>{result.title}</h1>
                <p className="text-base mb-2" style={{ color: BLUE }}>{result.tagline}</p>
                <div className="w-16 h-1 mb-10" style={{ background: PINK }} />

                <div className="space-y-8">
                  {/* Objectifs */}
                  <div className="border border-gray-200 p-6">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                      <Target size={14} /> Objectifs d'apprentissage
                    </div>
                    <ul className="space-y-2.5">
                      {result.objectives?.map((obj, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm" style={{ color: DARK }}>
                          <ChevronRight size={16} className="flex-shrink-0 mt-0.5" style={{ color: BLUE }} />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Parcours */}
                  <div className="border border-gray-200 p-6">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                      <BookOpen size={14} /> Structure du parcours
                    </div>
                    <div className="space-y-2">
                      {result.modules?.map((mod, i) => (
                        <div key={i} className="flex items-center gap-4 border border-gray-100 px-4 py-3 bg-gray-50">
                          <div className="w-7 h-7 flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                            style={{ background: BLUE }}>{i + 1}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm" style={{ color: DARK }}>{mod.title}</div>
                          </div>
                          <div className="text-xs text-gray-500 whitespace-nowrap">{mod.type} · {mod.duration}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scénario */}
                  <div className="border border-gray-200 p-6">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                      <Play size={14} /> Mise en situation — Aperçu interactif
                    </div>
                    <div className="border-l-2 pl-4 py-2 mb-5 bg-gray-50 px-4"
                      style={{ borderColor: BLUE }}>
                      <p className="text-sm leading-relaxed" style={{ color: DARK }}>{result.scenario?.situation}</p>
                    </div>
                    <div className="space-y-2">
                      {result.scenario?.choices?.map((choice, i) => (
                        <motion.button key={i} onClick={() => setActiveScenarioChoice(i)}
                          whileHover={{ x: 2 }} whileTap={{ scale: 0.99 }}
                          className="w-full text-left border px-5 py-4 transition-all flex items-start gap-4 text-sm"
                          style={{
                            borderColor: activeScenarioChoice === null ? '#e5e7eb'
                              : choice.correct ? '#16a34a'
                              : activeScenarioChoice === i ? PINK : '#e5e7eb',
                            background: activeScenarioChoice === null ? 'white'
                              : choice.correct ? '#f0fdf4'
                              : activeScenarioChoice === i ? `${PINK}08` : '#f9fafb',
                          }}>
                          <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-bold border"
                            style={{
                              borderColor: activeScenarioChoice !== null && choice.correct ? '#16a34a'
                                : activeScenarioChoice === i ? PINK : '#d1d5db',
                              color: activeScenarioChoice !== null && choice.correct ? '#16a34a'
                                : activeScenarioChoice === i ? PINK : '#6b7280',
                            }}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <div>
                            <div style={{ color: DARK }}>{choice.text}</div>
                            {activeScenarioChoice !== null && activeScenarioChoice === i && (
                              <div className="text-xs mt-2" style={{ color: choice.correct ? '#16a34a' : '#9ca3af' }}>
                                {choice.feedback}
                              </div>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* QCM */}
                  <div className="border border-gray-200 p-6">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-5 flex items-center gap-2">
                      <HelpCircle size={14} /> QCM — Exemples
                    </div>
                    <div className="space-y-7">
                      {result.qcm?.slice(0, 2).map((q, qi) => (
                        <div key={qi}>
                          <p className="font-bold text-sm mb-3" style={{ color: DARK }}>{qi + 1}. {q.question}</p>
                          <div className="space-y-2">
                            {q.options?.map((opt, oi) => (
                              <button key={oi} onClick={() => setActiveQcm(qi * 10 + oi)}
                                className="w-full text-left border px-4 py-3 text-xs transition-all"
                                style={{
                                  borderColor: activeQcm === null || Math.floor(activeQcm / 10) !== qi ? '#e5e7eb'
                                    : opt.correct ? '#16a34a'
                                    : activeQcm === qi * 10 + oi ? PINK : '#e5e7eb',
                                  background: activeQcm === null || Math.floor(activeQcm / 10) !== qi ? 'white'
                                    : opt.correct ? '#f0fdf4'
                                    : activeQcm === qi * 10 + oi ? `${PINK}08` : '#f9fafb',
                                  color: DARK,
                                }}>
                                {opt.text}
                              </button>
                            ))}
                          </div>
                          {activeQcm !== null && Math.floor(activeQcm / 10) === qi && (
                            <div className="mt-2 text-xs border-l-2 pl-3 py-1" style={{ borderColor: BLUE, color: '#6b7280' }}>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gamification */}
                  {result.gamification && (
                    <div className="border border-gray-200 p-6">
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                        <Trophy size={14} /> Système de gamification
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="border border-gray-100 p-4 text-center bg-gray-50">
                          <div className="text-2xl font-black mb-1" style={{ color: BLUE }}>{result.gamification.points}</div>
                          <div className="text-xs text-gray-500">points max</div>
                        </div>
                        <div className="border border-gray-100 p-4 text-center bg-gray-50">
                          <div className="text-2xl mb-1">{result.gamification.badge}</div>
                          <div className="text-xs text-gray-500">badge final</div>
                        </div>
                        <div className="border border-gray-100 p-4 text-center bg-gray-50">
                          <div className="text-2xl font-black mb-1" style={{ color: BLUE }}>{result.gamification.levels?.length}</div>
                          <div className="text-xs text-gray-500">niveaux</div>
                        </div>
                      </div>
                      {result.gamification.levels && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {result.gamification.levels.map((level, i) => (
                            <span key={i} className="px-3 py-1 text-xs font-bold"
                              style={{ background: `${BLUE}12`, color: BLUE }}>
                              <Star size={10} className="inline mr-1" />{level}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <div className="border border-gray-200 p-6 bg-gray-50">
                    <div className="mb-4">
                      <div className="font-bold text-sm" style={{ color: DARK }}>Votre formation est prête</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {(result.scenarios?.length || 0) > 0
                          ? `${result.scenarios?.length || 0} scénarios · ${result.qcm?.length || 0} QCM`
                          : `${result.qcm?.length || 0} questions`}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      {trainingId && (
                        <button
                          onClick={() => setLocation(`/playground/player/${trainingId}`)}
                          className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity"
                          style={{ background: PINK }}>
                          <Play size={18} /> Lancer la formation
                        </button>
                      )}
                      <button className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm border-2 hover:opacity-80 transition-opacity"
                        style={{ borderColor: BLUE, color: BLUE }}>
                        <MessageSquare size={16} /> Affiner avec l'IA
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
