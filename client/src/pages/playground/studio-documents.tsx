import React, { useState, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, FileUp, Upload, Loader2, CheckCircle,
  Trophy, Target, BookOpen, MessageSquare, ChevronRight,
  RotateCcw, Star, Play, HelpCircle, X, FileText, Presentation,
  Users, Zap, File, AlertCircle, Globe, Layers
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import mcLogoPath from '@assets/mc2i.png';

const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';

const ACCEPTED = '.pdf,.pptx,.ppt,.docx,.doc,.txt';

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText size={16} style={{ color: '#ef4444' }} />,
  pptx: <Presentation size={16} style={{ color: '#f97316' }} />,
  ppt: <Presentation size={16} style={{ color: '#f97316' }} />,
  docx: <FileText size={16} style={{ color: BLUE }} />,
  doc: <FileText size={16} style={{ color: BLUE }} />,
  txt: <File size={16} style={{ color: '#9ca3af' }} />,
};

const GAMIFICATION = [
  { value: 'low', label: 'Sérieux', sub: 'axé contenu', icon: '📚' },
  { value: 'medium', label: 'Équilibré', sub: 'contenu + jeu', icon: '⚡' },
  { value: 'high', label: 'Ludique', sub: 'max engagement', icon: '🎮' },
];

const AUDIENCES = [
  { value: 'grand_public', label: 'Grand public' },
  { value: 'managers', label: 'Managers' },
  { value: 'experts', label: 'Experts' },
  { value: 'rh', label: 'RH & Formation' },
  { value: 'dirigeants', label: 'Dirigeants' },
];

const DEPTH_OPTIONS = [
  { value: '5', label: '5 pages', sub: 'rapide' },
  { value: '10', label: '10 pages', sub: 'standard' },
  { value: '20', label: '20 pages', sub: 'approfondi' },
  { value: '40', label: '40 pages', sub: 'exhaustif' },
];

const FILE_STEPS = [
  'Lecture des documents...', 'Extraction du contenu clé...', 'Identification des concepts...',
  'Création des mises en situation...', 'Génération des QCM...', 'Calibration de la gamification...', 'Finalisation...',
];

const LESSON_STEPS = [
  'Lecture des documents...', 'Extraction du contenu...', 'Identification des concepts clés...',
  'Structuration de la leçon...', 'Génération des slides théorie...', 'Génération des slides pratique...', 'Finalisation de la leçon...',
];

const URL_STEPS = [
  'Connexion au site...', 'Exploration des pages...', 'Pagination et crawl...',
  'Extraction du contenu...', 'Analyse sémantique...', 'Création des mises en situation...',
  'Génération des QCM...', 'Finalisation...',
];

interface TrainingResult {
  title: string;
  tagline: string;
  objectives: string[];
  modules: { title: string; duration: string; type: string }[];
  situations?: { id: number; category: string; title: string; contexte?: string; situation: string; attendu: string }[];
  scenario?: { situation: string; choices: { text: string; correct: boolean; feedback: string }[] };
  scenarios?: any[];
  qcm: { question: string; options: { text: string; correct: boolean }[]; explanation: string }[];
  gamification: { points: number; badge: string; levels: string[] };
}

interface ScrapeInfo { pagesVisited: number; totalChars: number; siteName: string; }
type ImportMode = 'files' | 'url';
type OutputMode = 'formation' | 'lecon';
type StepName = 'upload' | 'config' | 'generating' | 'result';

const STEP_PROGRESS: Record<StepName, number> = { upload: 25, config: 50, generating: 75, result: 100 };

export default function StudioDocuments() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<StepName>('upload');
  const [outputMode, setOutputMode] = useState<OutputMode>('formation');
  const [importMode, setImportMode] = useState<ImportMode>('files');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [url, setUrl] = useState('');
  const [depth, setDepth] = useState('10');
  const [scrapeInfo, setScrapeInfo] = useState<ScrapeInfo | null>(null);
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('grand_public');
  const [gamification, setGamification] = useState('medium');
  const [genStep, setGenStep] = useState(0);
  const [result, setResult] = useState<TrainingResult | null>(null);
  const [trainingId, setTrainingId] = useState<string | null>(null);
  const [activeScenarioChoice, setActiveScenarioChoice] = useState<number | null>(null);

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const valid = Array.from(newFiles).filter(f => ['pdf', 'pptx', 'ppt', 'docx', 'doc', 'txt'].includes(f.name.split('.').pop()?.toLowerCase() || ''));
    if (valid.length < newFiles.length) toast({ title: 'Fichiers non supportés', description: 'Seuls PDF, PowerPoint, Word et texte sont acceptés.', variant: 'destructive' });
    setFiles(prev => { const names = new Set(prev.map(f => f.name)); return [...prev, ...valid.filter(f => !names.has(f.name))].slice(0, 5); });
  }, [toast]);

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }, [addFiles]);
  const removeFile = (name: string) => setFiles(prev => prev.filter(f => f.name !== name));
  const formatSize = (bytes: number) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} Ko` : `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  const getExt = (name: string) => name.split('.').pop()?.toLowerCase() || 'file';
  const isUrlValid = (u: string) => { try { new URL(u); return true; } catch { return false; } };

  const generate = async () => {
    setStep('generating');
    setGenStep(0);

    // Lesson mode: call lesson endpoint and redirect to lesson player
    if (outputMode === 'lecon') {
      const steps = LESSON_STEPS;
      const interval = setInterval(() => setGenStep(prev => prev < steps.length - 1 ? prev + 1 : prev), 1000);
      try {
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        formData.append('title', title);
        formData.append('audience', audience);
        const res = await fetch('/api/studio/generate-lesson', { method: 'POST', body: formData });
        if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Erreur'); }
        const data = await res.json();
        clearInterval(interval);
        setGenStep(steps.length - 1);
        setTimeout(() => { setLocation(`/playground/lesson/${data.id}`); }, 600);
      } catch (err: any) {
        clearInterval(interval);
        toast({ title: 'Erreur', description: err.message || 'La génération de la leçon a échoué.', variant: 'destructive' });
        setStep('config');
      }
      return;
    }

    const steps = importMode === 'url' ? URL_STEPS : FILE_STEPS;
    const interval = setInterval(() => setGenStep(prev => prev < steps.length - 1 ? prev + 1 : prev), importMode === 'url' ? 1200 : 900);
    try {
      let data: any;
      if (importMode === 'url') {
        const res = await fetch('/api/studio/generate-from-url', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url, depth: parseInt(depth), title, audience, gamification }) });
        if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Erreur'); }
        data = await res.json();
        if (data.scrapeInfo) setScrapeInfo(data.scrapeInfo);
      } else {
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        formData.append('title', title); formData.append('audience', audience); formData.append('gamification', gamification);
        const res = await fetch('/api/studio/generate-from-documents', { method: 'POST', body: formData });
        if (!res.ok) throw new Error();
        data = await res.json();
      }
      clearInterval(interval);
      setGenStep(steps.length - 1);
      setTimeout(() => { setResult(data.training); setTrainingId(data.id || null); setStep('result'); }, 500);
    } catch (err: any) {
      clearInterval(interval);
      toast({ title: 'Erreur', description: err.message || 'La génération a échoué.', variant: 'destructive' });
      setStep('config');
    }
  };

  const restart = () => {
    setFiles([]); setUrl(''); setDepth('10'); setTitle('');
    setAudience('grand_public'); setGamification('medium');
    setResult(null); setTrainingId(null); setScrapeInfo(null); setActiveScenarioChoice(null);
    setStep('upload');
  };

  const steps = outputMode === 'lecon' ? LESSON_STEPS : importMode === 'url' ? URL_STEPS : FILE_STEPS;

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ color: DARK }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="h-0.5 w-full bg-gray-100">
          <div className="h-full transition-all duration-700" style={{ width: `${STEP_PROGRESS[step]}%`, background: PINK }} />
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => step === 'upload' ? setLocation('/playground/module-generator') : restart()} className="hover:opacity-60 transition-opacity">
              <ArrowLeft size={18} style={{ color: BLUE }} />
            </button>
            <img src={mcLogoPath} alt="mc2i" className="h-7 w-auto" />
            <div className="h-4 w-px bg-gray-200" />
            <span className="font-bold text-sm" style={{ color: BLUE }}>FYNE</span>
            <div className="h-4 w-px bg-gray-200 hidden sm:block" />
            <span className="text-sm text-gray-500 font-medium hidden sm:block">Studio · Import de contenus</span>
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

          {/* ═══ UPLOAD ══════════════════════════════════════════════════════ */}
          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="min-h-screen flex flex-col justify-center px-6 lg:px-16 py-16">
              <div className="max-w-2xl">
                <div className="text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1 inline-block"
                  style={{ background: `${BLUE}12`, color: BLUE }}>
                  Étape 1 · Import de contenus
                </div>
                <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4 leading-tight">
                  <span style={{ color: PINK }}>Importez</span><br />
                  <span style={{ color: BLUE }}>vos contenus</span>
                </h1>
                <div className="w-16 h-1 mb-8" style={{ background: PINK }} />

                {/* Output mode selector */}
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Type de contenu à générer</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setOutputMode('formation')}
                      className="flex flex-col items-start gap-1 px-4 py-4 border-2 text-left transition-all"
                      style={{ borderColor: outputMode === 'formation' ? BLUE : '#e5e7eb', background: outputMode === 'formation' ? `${BLUE}08` : 'white' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 flex items-center justify-center" style={{ borderColor: BLUE }}>
                          {outputMode === 'formation' && <div className="w-1.5 h-1.5" style={{ background: BLUE }} />}
                        </div>
                        <span className="text-sm font-bold" style={{ color: outputMode === 'formation' ? BLUE : DARK }}>Formation interactive</span>
                      </div>
                      <p className="text-xs text-gray-500 ml-5">Situations + QCM · évaluation IA</p>
                    </button>
                    <button onClick={() => { setOutputMode('lecon'); setImportMode('files'); }}
                      className="flex flex-col items-start gap-1 px-4 py-4 border-2 text-left transition-all"
                      style={{ borderColor: outputMode === 'lecon' ? PINK : '#e5e7eb', background: outputMode === 'lecon' ? `${PINK}08` : 'white' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 flex items-center justify-center" style={{ borderColor: PINK }}>
                          {outputMode === 'lecon' && <div className="w-1.5 h-1.5" style={{ background: PINK }} />}
                        </div>
                        <span className="text-sm font-bold" style={{ color: outputMode === 'lecon' ? PINK : DARK }}>Leçon en slides</span>
                      </div>
                      <p className="text-xs text-gray-500 ml-5">Théorie + Pratique · slides interactifs</p>
                    </button>
                  </div>
                </div>

                {/* Import mode toggle (formation only, or both) */}
                {outputMode === 'formation' && (
                <div className="flex border border-gray-200 mb-8">
                  <button onClick={() => setImportMode('files')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all"
                    style={{ background: importMode === 'files' ? BLUE : 'white', color: importMode === 'files' ? 'white' : '#6b7280' }}>
                    <FileUp size={16} /> Fichiers
                  </button>
                  <button onClick={() => setImportMode('url')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all border-l border-gray-200"
                    style={{ background: importMode === 'url' ? BLUE : 'white', color: importMode === 'url' ? 'white' : '#6b7280' }}>
                    <Globe size={16} /> Site web / URL
                  </button>
                </div>
                )}
                {outputMode === 'lecon' && (
                  <div className="flex items-center gap-2 mb-6 px-3 py-2" style={{ background: `${PINK}08`, border: `1px solid ${PINK}30` }}>
                    <Layers size={14} style={{ color: PINK }} />
                    <p className="text-xs text-gray-600">Importez vos documents (PDF, PowerPoint, Word, TXT) — la leçon sera générée en slides théorie/pratique</p>
                  </div>
                )}

                {/* ── FICHIERS ── */}
                {importMode === 'files' && (
                  <>
                    <div ref={dropRef} onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)} onDrop={onDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed p-10 text-center cursor-pointer transition-all"
                      style={{ borderColor: isDragging ? BLUE : '#d1d5db', background: isDragging ? `${BLUE}06` : '#fafafa' }}>
                      <input ref={fileInputRef} type="file" accept={ACCEPTED} multiple className="hidden" onChange={e => addFiles(e.target.files)} />
                      <Upload size={32} className="mx-auto mb-3" style={{ color: isDragging ? BLUE : '#9ca3af' }} />
                      <p className="font-bold text-sm mb-1" style={{ color: DARK }}>Glissez vos fichiers ici</p>
                      <p className="text-xs text-gray-500">ou cliquez pour parcourir</p>
                      <div className="flex items-center justify-center gap-2 mt-4">
                        {['PDF', 'PowerPoint', 'Word', 'Texte'].map(f => (
                          <span key={f} className="px-2 py-0.5 border border-gray-200 text-xs text-gray-500 bg-white">{f}</span>
                        ))}
                      </div>
                    </div>
                    {files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {files.map(f => (
                          <div key={f.name} className="flex items-center gap-3 border border-gray-200 px-4 py-3 bg-white">
                            {FILE_ICONS[getExt(f.name)] || <File size={16} style={{ color: '#9ca3af' }} />}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate" style={{ color: DARK }}>{f.name}</div>
                              <div className="text-xs text-gray-500">{formatSize(f.size)}</div>
                            </div>
                            <button onClick={e => { e.stopPropagation(); removeFile(f.name); }} className="hover:opacity-60 transition-opacity">
                              <X size={14} style={{ color: '#9ca3af' }} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* ── URL ── */}
                {importMode === 'url' && (
                  <div className="space-y-8">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        URL du site à analyser *
                      </label>
                      <div className="relative">
                        <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
                        <input type="url" value={url} onChange={e => setUrl(e.target.value)}
                          placeholder="https://exemple.com/documentation"
                          className="w-full border border-gray-200 pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-gray-400 bg-white"
                          style={{ color: DARK }} />
                      </div>
                      {url && !isUrlValid(url) && (
                        <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: PINK }}>
                          <AlertCircle size={12} /> URL invalide — incluez http:// ou https://
                        </p>
                      )}
                      {url && isUrlValid(url) && (
                        <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#16a34a' }}>
                          <CheckCircle size={12} /> URL valide
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                        Profondeur du crawl
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {DEPTH_OPTIONS.map(d => (
                          <button key={d.value} onClick={() => setDepth(d.value)}
                            className="text-center border px-3 py-4 transition-all"
                            style={{ borderColor: depth === d.value ? BLUE : '#e5e7eb', background: depth === d.value ? `${BLUE}08` : 'white' }}>
                            <div className="text-sm font-bold" style={{ color: depth === d.value ? BLUE : DARK }}>{d.label}</div>
                            <div className="text-xs text-gray-500">{d.sub}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-l-2 pl-4 py-2" style={{ borderColor: BLUE }}>
                      <p className="text-xs font-bold text-gray-700 mb-1">Comment fonctionne le crawl ?</p>
                      <ul className="text-xs text-gray-500 space-y-0.5">
                        <li>• Exploration automatique de toutes les pages internes</li>
                        <li>• Pagination et sous-pages incluses</li>
                        <li>• Extraction du texte, titres et listes</li>
                        <li>• Contenu dupliqué filtré automatiquement</li>
                      </ul>
                    </div>
                  </div>
                )}

                <button onClick={() => setStep('config')}
                  disabled={importMode === 'url' && !isUrlValid(url)}
                  className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed mt-8"
                  style={{ background: BLUE }}>
                  Configurer la formation <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ CONFIG ══════════════════════════════════════════════════════ */}
          {step === 'config' && (
            <motion.div key="config" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="min-h-screen flex flex-col justify-center px-6 lg:px-16 py-16">
              <div className="max-w-2xl">
                <div className="text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1 inline-block"
                  style={{ background: `${BLUE}12`, color: BLUE }}>
                  Étape 2 · Configuration
                </div>
                <h1 className="text-4xl font-black tracking-tight mb-4" style={{ color: DARK }}>
                  Configurez<br /><span style={{ color: outputMode === 'lecon' ? PINK : BLUE }}>{outputMode === 'lecon' ? 'la leçon' : 'la formation'}</span>
                </h1>
                <div className="w-16 h-1 mb-8" style={{ background: PINK }} />

                <div className="space-y-8">
                  {/* Source recap */}
                  <div className="border border-gray-100 p-4 bg-gray-50">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Source</div>
                    {importMode === 'url' ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe size={14} style={{ color: BLUE }} />
                        <span className="truncate font-medium" style={{ color: DARK }}>{url}</span>
                        <span className="text-gray-500 ml-auto whitespace-nowrap text-xs">≤ {depth} pages</span>
                      </div>
                    ) : files.length > 0 ? (
                      <div className="space-y-1">
                        {files.map(f => (
                          <div key={f.name} className="flex items-center gap-2 text-xs text-gray-600">
                            {FILE_ICONS[getExt(f.name)]} <span className="truncate">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-gray-500 italic">Génération depuis le sujet demandé</p>}
                  </div>

                  {/* Titre */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      Titre de la formation (optionnel)
                    </label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="L'IA proposera un titre si laissé vide"
                      className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-gray-400 bg-white"
                      style={{ color: DARK }} />
                  </div>

                  {/* Public */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Public cible</label>
                    <div className="grid grid-cols-3 gap-2">
                      {AUDIENCES.map(a => (
                        <button key={a.value} onClick={() => setAudience(a.value)}
                          className="text-center border px-3 py-3 text-xs font-medium transition-all"
                          style={{ borderColor: audience === a.value ? BLUE : '#e5e7eb', background: audience === a.value ? `${BLUE}08` : 'white', color: audience === a.value ? BLUE : DARK }}>
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gamification — masquée en mode leçon */}
                  {outputMode !== 'lecon' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">Gamification</label>
                    <div className="grid grid-cols-3 gap-2">
                      {GAMIFICATION.map(g => (
                        <button key={g.value} onClick={() => setGamification(g.value)}
                          className="text-center border px-4 py-5 transition-all"
                          style={{ borderColor: gamification === g.value ? BLUE : '#e5e7eb', background: gamification === g.value ? `${BLUE}08` : 'white' }}>
                          <div className="text-3xl mb-1.5">{g.icon}</div>
                          <div className="text-sm font-bold" style={{ color: gamification === g.value ? BLUE : DARK }}>{g.label}</div>
                          <div className="text-xs text-gray-500">{g.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  )}

                  <button onClick={generate}
                    className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity"
                    style={{ background: outputMode === 'lecon' ? PINK : BLUE }}>
                    <FileUp size={18} /> {outputMode === 'lecon' ? 'Générer la leçon en slides' : 'Générer la formation'}
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
                style={{ borderTopColor: BLUE, animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: outputMode === 'lecon' ? PINK : BLUE }}>
                {outputMode === 'lecon' ? 'Création de la leçon interactive' : importMode === 'url' ? 'Crawl et analyse du site' : 'Analyse de vos documents'}
              </div>
              <h2 className="text-2xl font-black text-center mb-2" style={{ color: DARK }}>
                {outputMode === 'lecon' ? 'Génération de votre leçon' : 'Génération en cours'}
              </h2>
              <p className="text-sm text-gray-500 mb-12 text-center">
                {outputMode === 'lecon' ? "L'IA structure vos slides théorie et pratique..." : importMode === 'url' ? `Exploration jusqu'à ${depth} pages...` : "L'IA structure votre contenu..."}
              </p>
              <div className="w-full max-w-sm space-y-3">
                {steps.map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 transition-all duration-300 ${i <= genStep ? 'opacity-100' : 'opacity-20'}`}>
                    {i < genStep ? <CheckCircle size={16} style={{ color: BLUE, flexShrink: 0 }} />
                      : i === genStep ? <Loader2 size={16} className="animate-spin flex-shrink-0" style={{ color: BLUE }} />
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
                <div className="text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 inline-block"
                  style={{ background: `${BLUE}12`, color: BLUE }}>
                  Formation générée
                </div>
                <h1 className="text-4xl font-black mb-2" style={{ color: DARK }}>{result.title}</h1>
                <p className="text-base mb-1" style={{ color: BLUE }}>{result.tagline}</p>
                {scrapeInfo && (
                  <p className="text-xs text-gray-500 mb-2">
                    {scrapeInfo.pagesVisited} pages analysées · {(scrapeInfo.totalChars / 1000).toFixed(0)}k caractères extraits
                  </p>
                )}
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

                  {/* Mise en situation — Aperçu de la 1ère situation */}
                  {(() => {
                    const allSituations = result.situations || result.scenarios?.map((s: any) => ({ ...s, attendu: s.reflexe })) || [];
                    const preview = allSituations[0] || (result.scenario ? { title: 'Mise en situation', category: 'Scénario', situation: result.scenario.situation, attendu: '' } : null);
                    if (!preview) return null;
                    return (
                      <div className="border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                            <Play size={14} /> Aperçu — Mise en situation 1 sur {allSituations.length || 1}
                          </div>
                          {preview.category && (
                            <span className="text-xs px-2 py-0.5 font-bold" style={{ background: `${BLUE}12`, color: BLUE }}>
                              {preview.category}
                            </span>
                          )}
                        </div>
                        {preview.title && (
                          <p className="font-bold text-sm mb-3" style={{ color: DARK }}>{preview.title}</p>
                        )}
                        {preview.contexte && (
                          <div className="border-l-2 pl-3 mb-3 text-xs text-gray-500 py-1" style={{ borderColor: BLUE }}>{preview.contexte}</div>
                        )}
                        <div className="border border-gray-200 p-4 mb-4 bg-white">
                          <p className="text-sm leading-relaxed" style={{ color: DARK }}>{preview.situation}</p>
                        </div>
                        {preview.attendu && (
                          <div className="border p-4 flex items-start gap-3"
                            style={{ borderColor: `${BLUE}30`, background: `${BLUE}06` }}>
                            <div className="text-xs font-bold uppercase tracking-wider flex-shrink-0 mt-0.5" style={{ color: BLUE }}>Attendu</div>
                            <p className="text-xs leading-relaxed text-gray-600">{preview.attendu}</p>
                          </div>
                        )}
                        {allSituations.length > 1 && (
                          <p className="text-xs text-gray-400 mt-4 text-center">
                            + {allSituations.length - 1} autre{allSituations.length > 2 ? 's' : ''} situation{allSituations.length > 2 ? 's' : ''} dans le player
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {/* QCM */}
                  <div className="border border-gray-200 p-6">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-5 flex items-center gap-2">
                      <HelpCircle size={14} /> QCM — Exemples
                    </div>
                    {result.qcm?.slice(0, 2).map((q, qi) => (
                      <div key={qi} className="mb-6 last:mb-0">
                        <p className="font-bold text-sm mb-3" style={{ color: DARK }}>{qi + 1}. {q.question}</p>
                        <div className="space-y-2">
                          {q.options?.map((opt, oi) => (
                            <button key={oi} className="w-full text-left border px-4 py-3 text-xs transition-all hover:border-gray-400"
                              style={{ borderColor: '#e5e7eb', background: 'white', color: DARK }}>
                              {opt.text}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Gamification */}
                  {result.gamification && (
                    <div className="border border-gray-200 p-6">
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                        <Trophy size={14} /> Gamification
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                          { val: result.gamification.points, sub: 'points max' },
                          { val: result.gamification.badge, sub: 'badge final' },
                          { val: result.gamification.levels?.length, sub: 'niveaux' },
                        ].map((item, i) => (
                          <div key={i} className="border border-gray-100 p-4 text-center bg-gray-50">
                            <div className="text-2xl font-black mb-1" style={{ color: BLUE }}>{item.val}</div>
                            <div className="text-xs text-gray-500">{item.sub}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {result.gamification.levels?.map((level: any, i: number) => (
                          <span key={i} className="px-3 py-1 text-xs font-bold" style={{ background: `${BLUE}12`, color: BLUE }}>
                            <Star size={10} className="inline mr-1" />
                            {typeof level === 'string' ? level : level.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="border border-gray-200 p-6 bg-gray-50">
                    <div className="mb-4">
                      <div className="font-bold text-sm" style={{ color: DARK }}>Votre formation est prête</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {importMode === 'url'
                          ? (() => { try { return `Basée sur ${new URL(url).hostname}`; } catch { return 'Basée sur votre URL'; } })()
                          : 'Basée sur votre contenu original'}
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
