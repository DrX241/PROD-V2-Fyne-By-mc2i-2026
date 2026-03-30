import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Brain, Sparkles, Loader2, CheckCircle,
  Trophy, Target, Users, Clock, Zap, BookOpen, MessageSquare,
  ChevronRight, RotateCcw, Star, Play, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const AUDIENCES = [
  { value: 'grand_public', label: 'Grand public' },
  { value: 'managers', label: 'Managers & Responsables' },
  { value: 'experts', label: 'Experts techniques' },
  { value: 'rh', label: 'RH & Formation' },
  { value: 'dirigeants', label: 'Dirigeants & COMEX' },
  { value: 'commercial', label: 'Équipes commerciales' },
];

const DURATIONS = [
  { value: '15', label: '15 minutes — micro-learning' },
  { value: '30', label: '30 minutes — express' },
  { value: '60', label: '1 heure — standard' },
  { value: '120', label: '2 heures — approfondi' },
];

const GAMIFICATION = [
  { value: 'low', label: 'Sérieux — axé contenu', icon: '📚' },
  { value: 'medium', label: 'Équilibré — contenu + jeu', icon: '⚡' },
  { value: 'high', label: 'Ludique — maximum d\'engagement', icon: '🎮' },
];

interface TrainingResult {
  title: string;
  tagline: string;
  objectives: string[];
  modules: { title: string; duration: string; type: string; description: string }[];
  scenario: { situation: string; choices: { text: string; correct: boolean; feedback: string }[] };
  qcm: { question: string; options: { text: string; correct: boolean }[]; explanation: string }[];
  gamification: { points: number; badge: string; levels: string[] };
}

const GENERATION_STEPS = [
  "Analyse de votre besoin...",
  "Sélection des meilleures sources...",
  "Structuration du parcours...",
  "Création des scénarios...",
  "Génération des QCM...",
  "Intégration de la gamification...",
  "Finalisation de la formation...",
];

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
  const [activeScenarioChoice, setActiveScenarioChoice] = useState<number | null>(null);
  const [activeQcm, setActiveQcm] = useState<number | null>(null);

  const generate = async () => {
    setStep('generating');
    setGenStep(0);

    const interval = setInterval(() => {
      setGenStep(prev => {
        if (prev < GENERATION_STEPS.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 800);

    try {
      const res = await fetch('/api/studio/generate-from-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch, domain, audience, duration, gamification }),
      });
      if (!res.ok) throw new Error('Erreur serveur');
      const data = await res.json();
      clearInterval(interval);
      setGenStep(GENERATION_STEPS.length - 1);
      setTimeout(() => {
        setResult(data.training);
        setStep('result');
      }, 600);
    } catch {
      clearInterval(interval);
      toast({ title: 'Erreur', description: "La génération a échoué. Réessayez.", variant: 'destructive' });
      setStep('config');
    }
  };

  const restart = () => {
    setPitch('');
    setDomain('');
    setAudience('grand_public');
    setDuration('30');
    setGamification('medium');
    setResult(null);
    setActiveScenarioChoice(null);
    setActiveQcm(null);
    setStep('pitch');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#060d1a] to-[#0a1628] text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => step === 'pitch' ? setLocation('/playground/module-generator') : setStep(step === 'config' ? 'pitch' : 'pitch')}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {step === 'pitch' ? 'Retour' : 'Recommencer'}
          </button>
          <div className="flex-1 flex gap-1.5">
            {(['pitch', 'config', 'generating', 'result'] as const).map((s, i) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all ${
                ['pitch', 'config', 'generating', 'result'].indexOf(step) >= i
                  ? 'bg-violet-500' : 'bg-white/10'
              }`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'pitch' && (
            <motion.div key="pitch" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-5">
                  <Brain className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-black mb-2">Pitchez votre besoin</h1>
                <p className="text-gray-400">Décrivez en quelques mots la formation que vous souhaitez créer. Soyez précis : contexte, problème à résoudre, résultat attendu.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-gray-300 mb-2 block">Votre besoin de formation *</Label>
                  <Textarea
                    value={pitch}
                    onChange={e => setPitch(e.target.value)}
                    placeholder="Ex : Je veux former mes commerciaux aux bonnes pratiques de cybersécurité — phishing, mots de passe, données clients. Ils n'ont aucune base technique."
                    className="min-h-[140px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">{pitch.length}/500 caractères</p>
                </div>

                <div>
                  <Label className="text-gray-300 mb-2 block">Domaine / secteur (optionnel)</Label>
                  <Input
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    placeholder="Ex : Cybersécurité, Data, RH, Finance, Vente..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500"
                  />
                </div>

                <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
                  <div className="flex gap-2.5">
                    <Sparkles className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-violet-200">
                      Plus votre pitch est précis, plus la formation générée sera pertinente et directement utilisable.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setStep('config')}
                  disabled={pitch.trim().length < 20}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-5 font-semibold"
                >
                  Continuer
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'config' && (
            <motion.div key="config" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-8">
                <h1 className="text-3xl font-black mb-2">Paramétrez la formation</h1>
                <p className="text-gray-400">Quelques informations pour personnaliser le contenu à votre audience.</p>
              </div>

              <div className="space-y-8">
                <div>
                  <Label className="text-gray-300 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-violet-400" /> Public cible
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {AUDIENCES.map(a => (
                      <button key={a.value} onClick={() => setAudience(a.value)}
                        className={`text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                          audience === a.value
                            ? 'border-violet-500 bg-violet-500/20 text-violet-200'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                        }`}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-violet-400" /> Durée souhaitée
                  </Label>
                  <div className="space-y-2">
                    {DURATIONS.map(d => (
                      <button key={d.value} onClick={() => setDuration(d.value)}
                        className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                          duration === d.value
                            ? 'border-violet-500 bg-violet-500/20 text-violet-200'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                        }`}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300 mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-violet-400" /> Niveau de gamification
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {GAMIFICATION.map(g => (
                      <button key={g.value} onClick={() => setGamification(g.value)}
                        className={`text-center px-3 py-4 rounded-lg border text-sm font-medium transition-all ${
                          gamification === g.value
                            ? 'border-violet-500 bg-violet-500/20 text-violet-200'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                        }`}>
                        <div className="text-2xl mb-1">{g.icon}</div>
                        <div className="text-xs leading-tight">{g.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={generate}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-5 font-semibold">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Générer ma formation
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'generating' && (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="relative mb-10">
                <div className="w-24 h-24 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="h-10 w-10 text-violet-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-center">L'IA crée votre formation</h2>
              <p className="text-gray-400 mb-10 text-center">Cela prend quelques secondes...</p>
              <div className="w-full max-w-sm space-y-3">
                {GENERATION_STEPS.map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${i <= genStep ? 'opacity-100' : 'opacity-20'}`}>
                    {i < genStep ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    ) : i === genStep ? (
                      <Loader2 className="h-4 w-4 text-violet-400 animate-spin flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-white/20 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${i === genStep ? 'text-white font-medium' : 'text-gray-400'}`}>{s}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'result' && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3">
                    <CheckCircle className="h-3 w-3" /> Formation générée
                  </div>
                  <h1 className="text-3xl font-black text-white">{result.title}</h1>
                  <p className="text-violet-300 mt-1">{result.tagline}</p>
                </div>
                <button onClick={restart} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
                  <RotateCcw className="h-4 w-4" /> Recommencer
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                  <h2 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4" /> Objectifs d'apprentissage
                  </h2>
                  <ul className="space-y-2.5">
                    {result.objectives?.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <ChevronRight className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                  <h2 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Structure du parcours
                  </h2>
                  <div className="space-y-3">
                    {result.modules?.map((mod, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                        <div className="w-8 h-8 rounded-lg bg-violet-600/40 flex items-center justify-center text-sm font-bold text-violet-300">{i + 1}</div>
                        <div className="flex-1">
                          <div className="font-medium text-white text-sm">{mod.title}</div>
                          <div className="text-xs text-gray-500">{mod.type} · {mod.duration}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                  <h2 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                    <Play className="h-4 w-4" /> Mise en situation — Aperçu
                  </h2>
                  <div className="bg-gradient-to-br from-violet-900/30 to-indigo-900/20 border border-violet-500/20 rounded-xl p-5 mb-4">
                    <p className="text-sm text-gray-200 leading-relaxed">{result.scenario?.situation}</p>
                  </div>
                  <div className="space-y-2">
                    {result.scenario?.choices?.map((choice, i) => (
                      <button key={i} onClick={() => setActiveScenarioChoice(i)}
                        className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                          activeScenarioChoice === null
                            ? 'border-white/15 bg-white/5 hover:border-violet-400/50 hover:bg-violet-500/10 text-gray-300'
                            : choice.correct
                            ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200'
                            : activeScenarioChoice === i
                            ? 'border-red-500 bg-red-500/15 text-red-200'
                            : 'border-white/10 bg-white/5 text-gray-500 opacity-60'
                        }`}>
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-xs mt-0.5 flex-shrink-0">{String.fromCharCode(65 + i)}.</span>
                          <span>{choice.text}</span>
                        </div>
                        {activeScenarioChoice !== null && activeScenarioChoice === i && (
                          <p className="mt-2 text-xs opacity-80 pl-4">{choice.feedback}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                  <h2 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" /> QCM — Exemples
                  </h2>
                  <div className="space-y-5">
                    {result.qcm?.slice(0, 2).map((q, qi) => (
                      <div key={qi}>
                        <p className="font-medium text-white text-sm mb-3">{qi + 1}. {q.question}</p>
                        <div className="space-y-1.5">
                          {q.options?.map((opt, oi) => (
                            <button key={oi} onClick={() => setActiveQcm(qi * 10 + oi)}
                              className={`w-full text-left px-3 py-2.5 rounded-lg border text-xs transition-all ${
                                activeQcm === null || activeQcm < qi * 10 || activeQcm >= (qi + 1) * 10
                                  ? 'border-white/10 bg-white/5 hover:border-violet-400/40 text-gray-400'
                                  : opt.correct
                                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200'
                                  : activeQcm === qi * 10 + oi
                                  ? 'border-red-500 bg-red-500/15 text-red-200'
                                  : 'border-white/10 bg-white/5 text-gray-500 opacity-50'
                              }`}>
                              {opt.text}
                            </button>
                          ))}
                        </div>
                        {activeQcm !== null && activeQcm >= qi * 10 && activeQcm < (qi + 1) * 10 && (
                          <p className="mt-2 text-xs text-blue-300 bg-blue-900/20 rounded-lg px-3 py-2">{q.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {result.gamification && (
                  <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/20 border border-amber-500/20 rounded-2xl p-6">
                    <h2 className="font-bold text-sm uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
                      <Trophy className="h-4 w-4" /> Système de gamification
                    </h2>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-black text-amber-300">{result.gamification.points}</div>
                        <div className="text-xs text-gray-400">points max</div>
                      </div>
                      <div>
                        <div className="text-2xl">{result.gamification.badge}</div>
                        <div className="text-xs text-gray-400">badge final</div>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-amber-300">{result.gamification.levels?.length}</div>
                        <div className="text-xs text-gray-400">niveaux</div>
                      </div>
                    </div>
                    {result.gamification.levels && (
                      <div className="flex items-center gap-2 mt-4 flex-wrap">
                        {result.gamification.levels.map((level, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium">
                            <Star className="h-3 w-3 inline mr-1" />{level}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-violet-600/20 border border-violet-500/30 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Formation prête à déployer</div>
                    <div className="text-sm text-gray-400">Export SCORM, LMS et PDF disponibles</div>
                  </div>
                  <Button className="bg-violet-600 hover:bg-violet-500 text-white">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Affiner avec l'IA
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
