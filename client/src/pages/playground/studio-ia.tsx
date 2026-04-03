import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Brain, Sparkles, Loader2, CheckCircle
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

const GENERATION_STEPS = [
  'Analyse de votre besoin...',
  'Identification des concepts clés...',
  'Structuration des slides théorie...',
  'Création des mises en pratique...',
  'Génération du QCM de validation...',
  'Finalisation de la leçon...',
];

export default function StudioIA() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState<'pitch' | 'config' | 'generating'>('pitch');
  const [pitch, setPitch] = useState('');
  const [domain, setDomain] = useState('');
  const [audience, setAudience] = useState('grand_public');
  const [duration, setDuration] = useState('30');
  const [genStep, setGenStep] = useState(0);

  const progress = step === 'pitch' ? 33 : step === 'config' ? 66 : 90;

  const generate = async () => {
    setStep('generating');
    setGenStep(0);
    const interval = setInterval(() => {
      setGenStep(prev => prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev);
    }, 1200);
    try {
      const res = await fetch('/api/studio/generate-lesson-from-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch, domain, audience, duration }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      clearInterval(interval);
      setGenStep(GENERATION_STEPS.length - 1);
      setTimeout(() => {
        setLocation(`/playground/lesson/${data.id}`);
      }, 400);
    } catch {
      clearInterval(interval);
      toast({ title: 'Erreur', description: 'La génération a échoué. Réessayez.', variant: 'destructive' });
      setStep('config');
    }
  };

  const restart = () => {
    setPitch(''); setDomain(''); setAudience('grand_public'); setDuration('30');
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
            <span className="text-sm text-gray-500 font-medium hidden sm:block">Studio IA · Leçon en slides</span>
          </div>
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
                  style={{ background: `${PINK}12`, color: PINK }}>
                  Étape 1 sur 2 · Votre besoin
                </div>
                <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4 leading-tight">
                  <span style={{ color: PINK }}>Pitchez</span> votre<br />
                  <span style={{ color: DARK }}>besoin de formation</span>
                </h1>
                <div className="w-16 h-1 mb-6" style={{ background: PINK }} />
                <p className="text-base text-gray-600 leading-relaxed mb-10">
                  Décrivez en quelques mots ce que vous voulez former. L'IA crée une leçon complète avec slides théorie/pratique et QCM de validation.
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      Votre besoin de formation *
                    </label>
                    <textarea
                      value={pitch}
                      onChange={e => setPitch(e.target.value)}
                      placeholder="Ex : Former mes commerciaux aux bonnes pratiques de cybersécurité — phishing, mots de passe, données clients. Ils n'ont aucune base technique."
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

                  <div className="border-l-2 pl-4 py-1" style={{ borderColor: PINK }}>
                    <p className="text-sm text-gray-500">
                      Plus votre pitch est précis, plus la leçon sera pertinente et directement utilisable.
                    </p>
                  </div>

                  <button
                    onClick={() => setStep('config')}
                    disabled={pitch.trim().length < 20}
                    className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ background: PINK }}
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
                  style={{ background: `${PINK}12`, color: PINK }}>
                  Étape 2 sur 2 · Paramètres
                </div>
                <h1 className="text-4xl font-black tracking-tight mb-4" style={{ color: DARK }}>
                  Paramétrez<br /><span style={{ color: PINK }}>la leçon</span>
                </h1>
                <div className="w-16 h-1 mb-8" style={{ background: PINK }} />

                <div className="space-y-10">
                  {/* Recap pitch */}
                  <div className="border border-gray-100 p-4 bg-gray-50">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Votre besoin</div>
                    <p className="text-sm text-gray-700 line-clamp-2">{pitch}</p>
                  </div>

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
                            borderColor: audience === a.value ? PINK : '#e5e7eb',
                            background: audience === a.value ? `${PINK}08` : 'white',
                            color: audience === a.value ? PINK : DARK,
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
                            borderColor: duration === d.value ? PINK : '#e5e7eb',
                            background: duration === d.value ? `${PINK}08` : 'white',
                          }}>
                          <div className="text-sm font-bold" style={{ color: duration === d.value ? PINK : DARK }}>{d.label}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{d.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={generate}
                    className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity"
                    style={{ background: PINK }}
                  >
                    <Sparkles size={18} /> Générer ma leçon en slides
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ GÉNÉRATION ═══════════════════════════════════════════════════ */}
          {step === 'generating' && (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
              <div className="w-16 h-16 border-4 border-gray-100 mb-10"
                style={{ borderTopColor: PINK, animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: PINK }}>
                Création de votre leçon interactive
              </div>
              <h2 className="text-2xl font-black text-center mb-2" style={{ color: DARK }}>
                Génération en cours
              </h2>
              <p className="text-gray-500 text-sm mb-12 text-center">L'IA structure vos slides théorie et pratique...</p>

              <div className="w-full max-w-sm space-y-3">
                {GENERATION_STEPS.map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${i <= genStep ? 'opacity-100' : 'opacity-20'}`}>
                    {i < genStep
                      ? <CheckCircle size={16} style={{ color: PINK, flexShrink: 0 }} />
                      : i === genStep
                      ? <Loader2 size={16} className="animate-spin flex-shrink-0" style={{ color: PINK }} />
                      : <div className="w-4 h-4 border border-gray-300 flex-shrink-0" />}
                    <span className="text-sm" style={{ color: i === genStep ? DARK : '#9ca3af', fontWeight: i === genStep ? 600 : 400 }}>
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
