import React, { useState, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, FileUp, Upload, Loader2,
  Play, Target, BookOpen, ChevronRight,
  RotateCcw, File, FileText, Presentation, X, FileSearch,
  CircleCheck, TriangleAlert, CircleX, Eye, ScanLine, Globe, AlertCircle, CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AgentLoadingScreen from '@/components/AgentLoadingScreen';

const ACCEPTED = '.docx,.doc,.txt';

const AUDIENCES = [
  { value: 'grand_public',  label: 'Grand public' },
  { value: 'managers',      label: 'Managers' },
  { value: 'experts',       label: 'Experts' },
  { value: 'rh',            label: 'RH & Formation' },
  { value: 'dirigeants',    label: 'Dirigeants' },
];

const DEPTH_OPTIONS = [
  { value: '5',  label: '5 pages',  sub: 'rapide' },
  { value: '10', label: '10 pages', sub: 'standard' },
  { value: '20', label: '20 pages', sub: 'approfondi' },
  { value: '40', label: '40 pages', sub: 'exhaustif' },
];

const LESSON_STEPS = [
  'Lecture des documents...', 'Extraction du contenu...', 'Identification des concepts clés...',
  'Structuration du module...', 'Génération des modules théorie...', 'Génération des modules pratique...', 'Finalisation...',
];

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf:  <FileText size={16} style={{ color: '#ef4444' }} />,
  pptx: <Presentation size={16} style={{ color: '#f97316' }} />,
  ppt:  <Presentation size={16} style={{ color: '#f97316' }} />,
  docx: <FileText size={16} style={{ color: '#0057ff' }} />,
  doc:  <FileText size={16} style={{ color: '#0057ff' }} />,
  txt:  <File size={16} style={{ color: '#64748b' }} />,
};

const QUALITY_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  good:       { label: 'Excellent',  color: '#00c781', bg: '#00c78112', icon: <CircleCheck size={14} /> },
  ok:         { label: 'Lisible',    color: '#0057ff', bg: '#0057ff12', icon: <Eye size={14} /> },
  low:        { label: 'Partiel',    color: '#f6ab2f', bg: '#f6ab2f12', icon: <TriangleAlert size={14} /> },
  unreadable: { label: 'Illisible',  color: '#ff3b4e', bg: '#ff3b4e12', icon: <CircleX size={14} /> },
};

const STEP_PROGRESS: Record<string, number> = { upload: 20, preview: 45, config: 65, generating: 85, result: 100 };

const ACC = '#0057ff';
const BG = '#0f1117';
const SURFACE = '#111827';
const BORDER = '#1e2d45';
const TEXT = '#f1f5f9';
const SUB = '#64748b';
const MONO = "'DM Mono', monospace";
const SANS = "'DM Sans', sans-serif";

interface TrainingResult {
  title: string; tagline: string;
  objectives: string[];
  modules: { title: string; duration: string; type: string }[];
}
interface FilePreviewItem { name: string; size: number; chars: number; quality: 'good' | 'ok' | 'low' | 'unreadable'; preview: string; }
interface ExtractPreviewResult { files: FilePreviewItem[]; totalChars: number; combinedPreview: string; overallQuality: 'good' | 'ok' | 'low' | 'unreadable'; }

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export default function CyberStudioDocuments() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'preview' | 'config' | 'generating' | 'result'>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('grand_public');
  const [genStep, setGenStep] = useState(0);
  const [result, setResult] = useState<TrainingResult | null>(null);
  const [trainingId, setTrainingId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ExtractPreviewResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const all = Array.from(newFiles);
    const tooLarge = all.filter(f => f.size > MAX_FILE_SIZE);
    if (tooLarge.length > 0) {
      toast({ title: 'Fichier trop volumineux', description: `"${tooLarge[0].name}" dépasse 50 Mo.`, variant: 'destructive' });
    }
    const valid = all.filter(f => ['docx', 'doc', 'txt'].includes(f.name.split('.').pop()?.toLowerCase() || ''));
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name));
      return [...prev, ...valid.filter(f => !existing.has(f.name))];
    });
  }, [toast]);

  const removeFile = (name: string) => setFiles(prev => prev.filter(f => f.name !== name));
  const getExt = (name: string) => name.split('.').pop()?.toLowerCase() || 'file';

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const goToPreview = async () => {
    setPreviewLoading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      const res = await fetch('/api/studio/extract-preview', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Lecture impossible');
      setPreviewData(await res.json());
      setStep('preview');
    } catch {
      toast({ title: 'Lecture échouée', description: 'Impossible de lire les fichiers.', variant: 'destructive' });
    } finally {
      setPreviewLoading(false);
    }
  };

  const generate = async () => {
    setStep('generating');
    setGenStep(0);
    const interval = setInterval(() => setGenStep(prev => prev < LESSON_STEPS.length - 1 ? prev + 1 : prev), 1000);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      formData.append('title', title);
      formData.append('audience', audience);
      formData.append('scope', 'cyber');
      const res = await fetch('/api/studio/generate-lesson', { method: 'POST', body: formData });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error((err as any).error || 'Erreur'); }
      const data = await res.json();
      clearInterval(interval);
      setGenStep(LESSON_STEPS.length - 1);
      setTimeout(() => { setLocation(`/cyber/academie/player/${data.id}`); }, 600);
    } catch (err: any) {
      clearInterval(interval);
      toast({ title: 'Erreur', description: err.message || 'La génération a échoué.', variant: 'destructive' });
      setStep('config');
    }
  };

  const restart = () => {
    setFiles([]); setTitle(''); setAudience('grand_public');
    setResult(null); setTrainingId(null); setPreviewData(null); setStep('upload');
  };

  const progress = STEP_PROGRESS[step] || 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: BG, fontFamily: SANS, color: TEXT, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: '#0a0d14', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ height: 2, background: BORDER }}>
          <div style={{ height: '100%', background: ACC, width: `${progress}%`, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => step === 'upload' ? setLocation('/cyber/academie') : restart()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: SUB }}>
              <ArrowLeft size={18} />
            </button>
            <div style={{ width: 1, height: 16, background: BORDER }} />
            <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: '0.72rem', color: ACC, letterSpacing: '0.1em' }}>CYBER ACADÉMIE</span>
            <div style={{ width: 1, height: 16, background: BORDER }} />
            <span style={{ fontFamily: MONO, fontSize: '0.7rem', color: SUB }}>Studio · Import de documents</span>
          </div>
          {result && (
            <button onClick={restart} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: MONO, fontSize: '0.68rem', color: SUB, background: 'none', border: 'none', cursor: 'pointer' }}>
              <RotateCcw size={12} /> Recommencer
            </button>
          )}
        </div>
      </header>

      <main style={{ flex: 1, paddingTop: 64 }}>
        <AnimatePresence mode="wait">

          {/* ── Upload ── */}
          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 32px', maxWidth: 700, margin: '0 auto' }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: '0.62rem', letterSpacing: '0.15em', color: ACC, marginBottom: 16, padding: '3px 10px', background: `${ACC}15`, border: `1px solid ${ACC}30`, display: 'inline-block' }}>
                  ÉTAPE 1 — IMPORT DE DOCUMENTS
                </div>
                <h1 style={{ fontFamily: MONO, fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 600, lineHeight: 1.15, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                  Créez votre<br />micro learning
                </h1>
                <div style={{ width: 40, height: 2, background: ACC, marginBottom: 24 }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: `${ACC}10`, border: `1px solid ${ACC}25`, marginBottom: 24 }}>
                  <FileText size={13} style={{ color: ACC }} />
                  <p style={{ fontFamily: SANS, fontSize: '0.8rem', color: SUB, margin: 0 }}>
                    Importez vos documents Word ou TXT — l'IA génère un module théorie/pratique + QCM
                  </p>
                </div>

                <div
                  ref={dropRef}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragging ? ACC : BORDER}`,
                    padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
                    background: isDragging ? `${ACC}06` : SURFACE,
                    transition: 'border-color 0.2s ease, background 0.2s ease',
                  }}
                >
                  <input ref={fileInputRef} type="file" accept={ACCEPTED} multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
                  <Upload size={28} style={{ color: isDragging ? ACC : BORDER, margin: '0 auto 12px' }} />
                  <p style={{ fontFamily: MONO, fontWeight: 600, fontSize: '0.82rem', color: TEXT, margin: '0 0 4px' }}>Glissez vos fichiers ici</p>
                  <p style={{ fontFamily: SANS, fontSize: '0.78rem', color: SUB, margin: '0 0 14px' }}>ou cliquez pour parcourir</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                    {['Word', 'Texte'].map(f => (
                      <span key={f} style={{ fontFamily: MONO, fontSize: '0.62rem', padding: '2px 8px', border: `1px solid ${BORDER}`, color: SUB }}>{f}</span>
                    ))}
                  </div>
                </div>

                {files.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                    {files.map(f => (
                      <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 12, background: SURFACE, border: `1px solid ${BORDER}`, padding: '10px 14px' }}>
                        {FILE_ICONS[getExt(f.name)] || <File size={16} style={{ color: SUB }} />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: SANS, fontSize: '0.82rem', fontWeight: 500, color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                          <div style={{ fontFamily: MONO, fontSize: '0.62rem', color: SUB }}>{formatSize(f.size)}</div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); removeFile(f.name); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: BORDER }}>
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={goToPreview}
                  disabled={previewLoading || files.length === 0}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: ACC, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', marginTop: 24, opacity: (previewLoading || files.length === 0) ? 0.3 : 1 }}
                >
                  {previewLoading
                    ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Lecture…</>
                    : <><FileSearch size={15} /> Vérifier le contenu</>
                  }
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Preview ── */}
          {step === 'preview' && previewData && (
            <motion.div key="preview" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 32px', maxWidth: 700, margin: '0 auto' }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: '0.62rem', letterSpacing: '0.15em', color: ACC, marginBottom: 16, padding: '3px 10px', background: `${ACC}15`, border: `1px solid ${ACC}30`, display: 'inline-block' }}>
                  ÉTAPE 2 — VÉRIFICATION DU CONTENU
                </div>
                <h1 style={{ fontFamily: MONO, fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 600, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                  Contenu extrait des fichiers
                </h1>
                <div style={{ width: 40, height: 2, background: ACC, marginBottom: 24 }} />

                {(() => {
                  const q = QUALITY_META[previewData.overallQuality];
                  return (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', background: q.bg, border: `1px solid ${q.color}30`, marginBottom: 16 }}>
                      <span style={{ color: q.color, marginTop: 1, flexShrink: 0 }}>{q.icon}</span>
                      <div style={{ fontFamily: SANS, fontSize: '0.82rem', color: q.color, fontWeight: 600 }}>
                        Qualité globale : {q.label} — {(previewData.totalChars / 1000).toFixed(1)} k caractères extraits
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                  {previewData.files.map((f, i) => {
                    const q = QUALITY_META[f.quality];
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: SURFACE, border: `1px solid ${BORDER}`, padding: '10px 14px' }}>
                        {FILE_ICONS[f.name.split('.').pop()?.toLowerCase() || ''] || <File size={16} style={{ color: SUB }} />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: SANS, fontSize: '0.82rem', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                          <div style={{ fontFamily: MONO, fontSize: '0.62rem', color: SUB }}>{(f.chars / 1000).toFixed(1)} k car. · {formatSize(f.size)}</div>
                        </div>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: MONO, fontSize: '0.62rem', fontWeight: 600, padding: '2px 8px', background: q.bg, color: q.color, flexShrink: 0 }}>
                          {q.icon} {q.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontFamily: MONO, fontSize: '0.62rem', color: SUB, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.08em' }}>
                    <ScanLine size={12} /> APERÇU DU TEXTE EXTRAIT
                  </div>
                  <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, padding: '14px 16px' }}>
                    <p style={{ fontFamily: MONO, fontSize: '0.72rem', color: SUB, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-words', maxHeight: 180, overflow: 'hidden' }}>
                      {previewData.combinedPreview || '(aucun texte extrait)'}
                    </p>
                    {previewData.totalChars > 900 && (
                      <p style={{ fontFamily: MONO, fontSize: '0.62rem', color: BORDER, marginTop: 8, margin: '8px 0 0', fontStyle: 'italic' }}>… aperçu tronqué</p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setStep('config')}
                    disabled={previewData.overallQuality === 'unreadable'}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: previewData.overallQuality === 'unreadable' ? BORDER : ACC, color: '#fff', border: 'none', cursor: previewData.overallQuality === 'unreadable' ? 'not-allowed' : 'pointer', fontFamily: MONO, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em' }}>
                    Configurer le module <ArrowRight size={15} />
                  </button>
                  <button onClick={() => setStep('upload')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: 'transparent', color: SUB, border: `1px solid ${BORDER}`, cursor: 'pointer', fontFamily: MONO, fontSize: '0.7rem' }}>
                    <ArrowLeft size={13} /> Changer les fichiers
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Config ── */}
          {step === 'config' && (
            <motion.div key="config" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 32px', maxWidth: 700, margin: '0 auto' }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: '0.62rem', letterSpacing: '0.15em', color: ACC, marginBottom: 16, padding: '3px 10px', background: `${ACC}15`, border: `1px solid ${ACC}30`, display: 'inline-block' }}>
                  ÉTAPE 3 — CONFIGURATION
                </div>
                <h1 style={{ fontFamily: MONO, fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 600, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                  Configurez le module
                </h1>
                <div style={{ width: 40, height: 2, background: ACC, marginBottom: 32 }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {/* Source recap */}
                  <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, padding: '12px 16px' }}>
                    <div style={{ fontFamily: MONO, fontSize: '0.6rem', color: BORDER, marginBottom: 8, letterSpacing: '0.08em' }}>SOURCE</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {files.map(f => (
                        <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: SANS, fontSize: '0.78rem', color: SUB }}>
                          {FILE_ICONS[getExt(f.name)]} <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label style={{ display: 'block', fontFamily: MONO, fontSize: '0.65rem', letterSpacing: '0.1em', color: SUB, marginBottom: 8 }}>
                      TITRE <span style={{ color: BORDER, fontWeight: 400 }}>(optionnel)</span>
                    </label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="L'IA proposera un titre si laissé vide"
                      style={{ width: '100%', background: SURFACE, border: `1px solid ${BORDER}`, padding: '10px 14px', fontSize: '0.875rem', color: TEXT, fontFamily: SANS, outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => (e.target.style.borderColor = ACC)}
                      onBlur={e => (e.target.style.borderColor = BORDER)}
                    />
                  </div>

                  {/* Audience */}
                  <div>
                    <label style={{ display: 'block', fontFamily: MONO, fontSize: '0.65rem', letterSpacing: '0.1em', color: SUB, marginBottom: 10 }}>PUBLIC CIBLE</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      {AUDIENCES.map(a => (
                        <button key={a.value} onClick={() => setAudience(a.value)}
                          style={{ padding: '10px 8px', background: audience === a.value ? `${ACC}15` : SURFACE, border: `1px solid ${audience === a.value ? ACC : BORDER}`, color: audience === a.value ? ACC : SUB, cursor: 'pointer', fontFamily: SANS, fontSize: '0.78rem', fontWeight: audience === a.value ? 600 : 400, textAlign: 'center' }}>
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={generate}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: ACC, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', width: 'fit-content' }}>
                    <FileUp size={15} /> Générer le micro learning
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'generating' && (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AgentLoadingScreen mode="docs" />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
