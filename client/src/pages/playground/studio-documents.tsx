import React, { useState, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, FileUp, Upload, Loader2, CheckCircle,
  Trophy, Target, BookOpen, MessageSquare, ChevronRight,
  RotateCcw, Star, Play, HelpCircle, X, FileText, Presentation,
  Users, Zap, File, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const ACCEPTED = '.pdf,.pptx,.ppt,.docx,.doc,.txt';
const ACCEPTED_MIME = ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword', 'text/plain'];

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-5 w-5 text-red-400" />,
  pptx: <Presentation className="h-5 w-5 text-orange-400" />,
  ppt: <Presentation className="h-5 w-5 text-orange-400" />,
  docx: <FileText className="h-5 w-5 text-blue-400" />,
  doc: <FileText className="h-5 w-5 text-blue-400" />,
  txt: <File className="h-5 w-5 text-gray-400" />,
};

const GAMIFICATION = [
  { value: 'low', label: 'Sérieux', icon: '📚' },
  { value: 'medium', label: 'Équilibré', icon: '⚡' },
  { value: 'high', label: 'Ludique', icon: '🎮' },
];

const AUDIENCES = [
  { value: 'grand_public', label: 'Grand public' },
  { value: 'managers', label: 'Managers' },
  { value: 'experts', label: 'Experts' },
  { value: 'rh', label: 'RH & Formation' },
  { value: 'dirigeants', label: 'Dirigeants' },
];

const GENERATION_STEPS = [
  "Lecture des documents...",
  "Extraction du contenu clé...",
  "Identification des concepts...",
  "Création des mises en situation...",
  "Génération des QCM...",
  "Calibration de la gamification...",
  "Finalisation de la formation...",
];

interface TrainingResult {
  title: string;
  tagline: string;
  objectives: string[];
  modules: { title: string; duration: string; type: string }[];
  scenario: { situation: string; choices: { text: string; correct: boolean; feedback: string }[] };
  qcm: { question: string; options: { text: string; correct: boolean }[]; explanation: string }[];
  gamification: { points: number; badge: string; levels: string[] };
}

export default function StudioDocuments() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'config' | 'generating' | 'result'>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('grand_public');
  const [gamification, setGamification] = useState('medium');
  const [genStep, setGenStep] = useState(0);
  const [result, setResult] = useState<TrainingResult | null>(null);
  const [activeScenarioChoice, setActiveScenarioChoice] = useState<number | null>(null);

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const valid = Array.from(newFiles).filter(f => {
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      return ['pdf', 'pptx', 'ppt', 'docx', 'doc', 'txt'].includes(ext);
    });
    if (valid.length < newFiles.length) {
      toast({ title: 'Fichiers non supportés', description: 'Seuls PDF, PowerPoint, Word et texte sont acceptés.', variant: 'destructive' });
    }
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...valid.filter(f => !names.has(f.name))].slice(0, 5);
    });
  }, [toast]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeFile = (name: string) => setFiles(prev => prev.filter(f => f.name !== name));

  const formatSize = (bytes: number) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} Ko` : `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;

  const getExt = (name: string) => name.split('.').pop()?.toLowerCase() || 'file';

  const generate = async () => {
    setStep('generating');
    setGenStep(0);

    const interval = setInterval(() => {
      setGenStep(prev => prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev);
    }, 900);

    try {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      formData.append('title', title);
      formData.append('audience', audience);
      formData.append('gamification', gamification);

      const res = await fetch('/api/studio/generate-from-documents', {
        method: 'POST',
        body: formData,
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
    setFiles([]);
    setTitle('');
    setAudience('grand_public');
    setGamification('medium');
    setResult(null);
    setActiveScenarioChoice(null);
    setStep('upload');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#060d1a] to-[#0a1628] text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => step === 'upload' ? setLocation('/playground/module-generator') : restart()}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {step === 'upload' ? 'Retour' : 'Recommencer'}
          </button>
          <div className="flex-1 flex gap-1.5">
            {(['upload', 'config', 'generating', 'result'] as const).map((s, i) => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all ${
                ['upload', 'config', 'generating', 'result'].indexOf(step) >= i
                  ? 'bg-emerald-500' : 'bg-white/10'
              }`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center mb-5">
                  <FileUp className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-black mb-2">Importez vos contenus</h1>
                <p className="text-gray-400">Glissez vos fichiers ou cliquez pour les sélectionner. L'IA analysera tout le contenu pour créer une formation sur mesure.</p>
              </div>

              <div
                ref={dropRef}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : 'border-white/20 hover:border-emerald-500/50 hover:bg-white/5'
                }`}
              >
                <input ref={fileInputRef} type="file" accept={ACCEPTED} multiple className="hidden" onChange={e => addFiles(e.target.files)} />
                <Upload className={`h-10 w-10 mx-auto mb-3 ${isDragging ? 'text-emerald-400' : 'text-gray-500'}`} />
                <p className="text-white font-semibold mb-1">Glissez vos fichiers ici</p>
                <p className="text-gray-500 text-sm">ou cliquez pour parcourir</p>
                <div className="flex items-center justify-center gap-3 mt-4">
                  {['PDF', 'PowerPoint', 'Word', 'Texte'].map(f => (
                    <span key={f} className="px-2.5 py-1 rounded-full bg-white/10 text-gray-400 text-xs">{f}</span>
                  ))}
                </div>
                <p className="text-gray-600 text-xs mt-3">Maximum 5 fichiers · 20 Mo chacun</p>
              </div>

              {files.length > 0 && (
                <div className="mt-5 space-y-2">
                  {files.map(f => (
                    <div key={f.name} className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                      {FILE_ICONS[getExt(f.name)] || <File className="h-5 w-5 text-gray-400" />}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-white truncate">{f.name}</div>
                        <div className="text-xs text-gray-500">{formatSize(f.size)}</div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); removeFile(f.name); }} className="text-gray-500 hover:text-white transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {files.length > 0 && (
                <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-2.5">
                  <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-200">
                    {files.length} fichier{files.length > 1 ? 's' : ''} prêt{files.length > 1 ? 's' : ''} à analyser. Continuez pour configurer la formation.
                  </p>
                </div>
              )}

              {files.length === 0 && (
                <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-2.5">
                  <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-200">
                    Vous n'avez pas de fichier sous la main ? Vous pouvez tout de même continuer — l'IA vous demandera le sujet à traiter.
                  </p>
                </div>
              )}

              <Button onClick={() => setStep('config')} disabled={false}
                className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-5 font-semibold">
                Configurer la formation
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {step === 'config' && (
            <motion.div key="config" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-8">
                <h1 className="text-3xl font-black mb-2">Configurez la formation</h1>
                <p className="text-gray-400">L'IA utilisera ces informations pour adapter le style et le niveau de la formation.</p>
              </div>

              <div className="space-y-8">
                <div>
                  <Label className="text-gray-300 mb-2 block">Titre de la formation (optionnel)</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="L'IA proposera un titre si laissé vide"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500" />
                </div>

                <div>
                  <Label className="text-gray-300 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-400" /> Public cible
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {AUDIENCES.map(a => (
                      <button key={a.value} onClick={() => setAudience(a.value)}
                        className={`text-center px-3 py-3 rounded-lg border text-xs font-medium transition-all ${
                          audience === a.value
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                        }`}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300 mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-400" /> Gamification
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {GAMIFICATION.map(g => (
                      <button key={g.value} onClick={() => setGamification(g.value)}
                        className={`text-center px-3 py-4 rounded-lg border text-sm font-medium transition-all ${
                          gamification === g.value
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                        }`}>
                        <div className="text-2xl mb-1">{g.icon}</div>
                        <div className="text-xs">{g.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {files.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Fichiers à analyser</p>
                    <div className="space-y-1">
                      {files.map(f => (
                        <div key={f.name} className="flex items-center gap-2 text-sm text-gray-400">
                          {FILE_ICONS[getExt(f.name)]}
                          <span className="truncate">{f.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={generate}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-5 font-semibold">
                  <FileUp className="h-4 w-4 mr-2" />
                  Générer la formation
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'generating' && (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="relative mb-10">
                <div className="w-24 h-24 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileUp className="h-10 w-10 text-emerald-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-center">Analyse de vos documents</h2>
              <p className="text-gray-400 mb-10 text-center">L'IA extrait et structure votre contenu...</p>
              <div className="w-full max-w-sm space-y-3">
                {GENERATION_STEPS.map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${i <= genStep ? 'opacity-100' : 'opacity-20'}`}>
                    {i < genStep ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    ) : i === genStep ? (
                      <Loader2 className="h-4 w-4 text-emerald-400 animate-spin flex-shrink-0" />
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
                  <p className="text-emerald-300 mt-1">{result.tagline}</p>
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
                        <ChevronRight className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
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
                        <div className="w-8 h-8 rounded-lg bg-emerald-600/40 flex items-center justify-center text-sm font-bold text-emerald-300">{i + 1}</div>
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
                  <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border border-emerald-500/20 rounded-xl p-5 mb-4">
                    <p className="text-sm text-gray-200 leading-relaxed">{result.scenario?.situation}</p>
                  </div>
                  <div className="space-y-2">
                    {result.scenario?.choices?.map((choice, i) => (
                      <button key={i} onClick={() => setActiveScenarioChoice(i)}
                        className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                          activeScenarioChoice === null
                            ? 'border-white/15 bg-white/5 hover:border-emerald-400/50 hover:bg-emerald-500/10 text-gray-300'
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
                            <button key={oi}
                              className="w-full text-left px-3 py-2.5 rounded-lg border border-white/10 bg-white/5 text-xs text-gray-400 hover:border-emerald-400/40 transition-all">
                              {opt.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {result.gamification && (
                  <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/20 border border-amber-500/20 rounded-2xl p-6">
                    <h2 className="font-bold text-sm uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
                      <Trophy className="h-4 w-4" /> Gamification
                    </h2>
                    <div className="grid grid-cols-3 gap-4 text-center mb-4">
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
                      <div className="flex items-center gap-2 flex-wrap">
                        {result.gamification.levels.map((level, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium">
                            <Star className="h-3 w-3 inline mr-1" />{level}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-emerald-600/20 border border-emerald-500/30 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Formation prête à déployer</div>
                    <div className="text-sm text-gray-400">Basée sur votre contenu original</div>
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
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
