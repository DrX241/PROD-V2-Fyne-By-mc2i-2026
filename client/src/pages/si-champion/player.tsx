import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import {
  Play, ChevronLeft, ChevronRight, Lightbulb, Trophy, Clock,
  CheckCircle2, XCircle, RotateCcw, ArrowRight, Terminal, Star, BookOpen, Database
} from 'lucide-react';
import mcLogoPath from '@assets/mc2i.png';
import { CHALLENGES, TRACKS, LEVEL_CONFIG, getChallengeById } from '@/data/si-champion-challenges';

const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';

const STORAGE_KEY = 'si-champion-completed';
const CODE_STORAGE_PREFIX = 'si-champion-code-';

function getCompleted(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function markCompleted(id: string) {
  const list = getCompleted();
  if (!list.includes(id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...list, id]));
  }
}
function saveCode(id: string, code: string) {
  localStorage.setItem(CODE_STORAGE_PREFIX + id, code);
}
function loadCode(id: string): string | null {
  return localStorage.getItem(CODE_STORAGE_PREFIX + id);
}

interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
}

export default function ChallengePlayer({ params }: { params: { id: string } }) {
  const challengeId = params.id;
  const [, navigate] = useLocation();
  const challenge = getChallengeById(challengeId);

  const [code, setCode] = useState<string>('');
  const [result, setResult] = useState<RunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPassed, setIsPassed] = useState<boolean | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showXpAnim, setShowXpAnim] = useState(false);
  const [showTab, setShowTab] = useState<'output' | 'expected' | 'instructions'>('instructions');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const computeDiff = (expected: string, actual: string) => {
    const expLines = expected.split('\n');
    const actLines = actual.split('\n');
    const maxLen = Math.max(expLines.length, actLines.length);
    return Array.from({ length: maxLen }, (_, i) => ({
      exp: expLines[i] ?? '',
      got: actLines[i] ?? '',
      match: expLines[i] === actLines[i],
    }));
  };

  const isCompleted = getCompleted().includes(challengeId);

  useEffect(() => {
    if (!challenge) return;
    const saved = loadCode(challengeId);
    setCode(saved ?? challenge.starterCode);
    setResult(null);
    setIsPassed(null);
    setShowHints(false);
    setHintIndex(0);
    setElapsed(0);
    setTimerActive(false);
    setShowSuccess(false);
    setShowTab('instructions');
    localStorage.setItem('si-champion-last', challengeId);
  }, [challengeId, challenge]);

  // Timer
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  // Ctrl+Enter shortcut (ref pattern to always call latest handleRun)
  const handleRunRef = useRef<() => void>(() => {});
  useEffect(() => { handleRunRef.current = handleRun; });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = useCallback((val: string | undefined) => {
    const v = val ?? '';
    setCode(v);
    if (challenge) saveCode(challengeId, v);
    if (!timerActive && !isCompleted) setTimerActive(true);
  }, [challengeId, challenge, timerActive, isCompleted]);

  const handleRun = async () => {
    if (!challenge || isRunning) return;
    setIsRunning(true);
    setResult(null);
    setIsPassed(null);
    setShowTab('output');

    try {
      const resp = await fetch('/api/code/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: challenge.language }),
      });
      const data: RunResult = await resp.json();
      setResult(data);

      // Check pass/fail
      const actualOutput = data.stdout.trim();
      const expectedOutput = challenge.expectedOutput.trim();
      const passed = actualOutput === expectedOutput && data.exitCode === 0;
      setIsPassed(passed);

      if (passed) {
        setTimerActive(false);
        markCompleted(challengeId);
        setShowSuccess(true);
        setShowXpAnim(true);
        setTimeout(() => setShowSuccess(false), 4000);
        setTimeout(() => setShowXpAnim(false), 2200);
      }
    } catch (err) {
      setResult({ stdout: '', stderr: 'Erreur réseau — vérifie ta connexion', exitCode: 1, executionTime: 0 });
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    if (!challenge) return;
    setCode(challenge.starterCode);
    saveCode(challengeId, challenge.starterCode);
    setResult(null);
    setIsPassed(null);
    setShowTab('instructions');
  };

  const getNextChallenge = () => {
    const idx = CHALLENGES.findIndex(c => c.id === challengeId);
    return idx < CHALLENGES.length - 1 ? CHALLENGES[idx + 1] : null;
  };

  const getPrevChallenge = () => {
    const idx = CHALLENGES.findIndex(c => c.id === challengeId);
    return idx > 0 ? CHALLENGES[idx - 1] : null;
  };

  const currentIdx = CHALLENGES.findIndex(c => c.id === challengeId);

  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 flex justify-center"><BookOpen size={40} className="text-gray-300" /></div>
          <h2 className="text-xl font-black mb-2" style={{ color: DARK }}>Défi introuvable</h2>
          <Link href="/si-champion/challenges">
            <button className="px-6 py-2 text-white font-bold" style={{ background: BLUE }}>
              Retour aux défis
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const track = TRACKS.find(t => t.id === challenge.track)!;
  const levelCfg = LEVEL_CONFIG[challenge.level];
  const next = getNextChallenge();
  const prev = getPrevChallenge();

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden" style={{ color: DARK }}>
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-100 z-50">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/si-champion/challenges">
              <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 font-medium">
                <ChevronLeft size={14} /> Défis
              </button>
            </Link>
            <div className="h-4 w-px bg-gray-200" />
            <span className="text-sm">{track.icon}</span>
            <span className="text-xs font-bold px-2 py-0.5" style={{ background: track.bgLight, color: track.color }}>
              {track.label}
            </span>
            <span className="text-xs font-bold px-2 py-0.5" style={{ background: levelCfg.bg, color: levelCfg.color }}>
              {levelCfg.label}
            </span>
            <span className="text-sm font-black hidden md:block" style={{ color: DARK }}>
              {challenge.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className="flex items-center gap-1 text-xs font-mono text-gray-400">
              <Clock size={12} />
              {formatTime(elapsed)}
            </div>
            {/* Points */}
            <div className="flex items-center gap-1 text-xs font-bold" style={{ color: BLUE }}>
              <Star size={12} />
              {challenge.points} pts
            </div>
            {/* Progress */}
            <div className="text-xs text-gray-400 hidden md:block">
              {currentIdx + 1} / {CHALLENGES.length}
            </div>
            {/* Prev/Next */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => prev && navigate(`/si-champion/challenge/${prev.id}`)}
                disabled={!prev}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => next && navigate(`/si-champion/challenge/${next.id}`)}
                disabled={!next}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="h-0.5 w-full" style={{ background: PINK }} />
      </header>

      {/* Floating XP notification */}
      <AnimatePresence>
        {showXpAnim && (
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -80, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.0, ease: 'easeOut' }}
            className="fixed top-20 right-8 z-[100] px-5 py-3 text-white font-black text-lg pointer-events-none"
            style={{ background: '#16a34a' }}
          >
            +{challenge.points} pts
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Banner */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="flex-shrink-0 py-3 px-6 flex items-center justify-between text-white font-bold"
            style={{ background: '#16a34a' }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} />
              Défi réussi ! +{challenge.points} points gagnés
            </div>
            {next && (
              <button
                onClick={() => navigate(`/si-champion/challenge/${next.id}`)}
                className="flex items-center gap-1 text-sm underline"
              >
                Défi suivant <ArrowRight size={14} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main layout: Editor left | Panel right */}
      <div className="flex-1 flex overflow-hidden">
        {/* ─── EDITOR PANE ─────────────────────────────────────────────── */}
        <div className="flex flex-col" style={{ width: '60%', borderRight: '1px solid #e5e7eb' }}>
          {/* Editor toolbar */}
          <div className="flex-shrink-0 px-4 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500">
                {challenge.language === 'python' ? 'solution.py' :
                  challenge.language === 'javascript' ? 'solution.js' : 'solution.py'}
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1 text-xs font-bold" style={{ color: '#16a34a' }}>
                  <CheckCircle2 size={12} /> Complété
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 px-2 py-1 border border-gray-200 hover:border-gray-400"
                title="Réinitialiser"
              >
                <RotateCcw size={11} /> Reset
              </button>
              <button
                onClick={() => { setShowHints(true); setHintIndex(0); }}
                className="flex items-center gap-1 text-xs px-2 py-1 border border-gray-200 hover:border-gray-400"
                style={{ color: '#d97706' }}
              >
                <Lightbulb size={11} /> Indice
              </button>
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-1.5 text-white text-xs font-bold disabled:opacity-60"
                style={{ background: isRunning ? '#6b7280' : PINK }}
              >
                {isRunning ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Exécution...
                  </span>
                ) : (
                  <><Play size={12} /> Exécuter</>
                )}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={challenge.language === 'sql' ? 'python' : challenge.language}
              value={code}
              onChange={handleCodeChange}
              theme="vs-light"
              options={{
                fontSize: 13,
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                minimap: { enabled: false },
                lineNumbers: 'on',
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                renderLineHighlight: 'line',
                smoothScrolling: true,
                cursorSmoothCaretAnimation: 'on',
                tabSize: 4,
              }}
            />
          </div>
        </div>

        {/* ─── RIGHT PANEL ──────────────────────────────────────────────── */}
        <div className="flex flex-col" style={{ width: '40%' }}>
          {/* Tabs */}
          <div className="flex-shrink-0 flex border-b border-gray-100">
            {[
              { key: 'instructions', label: 'Consignes', icon: <BookOpen size={13} /> },
              { key: 'output', label: 'Console', icon: <Terminal size={13} /> },
              { key: 'expected', label: 'Résultat attendu', icon: <CheckCircle2 size={13} /> },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setShowTab(tab.key as any)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors"
                style={showTab === tab.key
                  ? { borderBottomColor: BLUE, color: BLUE }
                  : { borderBottomColor: 'transparent', color: '#9ca3af' }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* ── Instructions Tab ── */}
            {showTab === 'instructions' && (
              <div className="space-y-4">
                {/* Mission brief card — like an internal Teams message */}
                <div className="border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="w-7 h-7 flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                      style={{ background: BLUE }}>
                      MC
                    </div>
                    <div>
                      <div className="text-xs font-bold" style={{ color: DARK }}>Manager de mission · mc2i</div>
                      <div className="text-[10px] text-gray-400">Briefing mission — {track.label}</div>
                    </div>
                    <div className="ml-auto">
                      <span className="text-[10px] font-bold px-1.5 py-0.5" style={{ background: levelCfg.bg, color: levelCfg.color }}>
                        {levelCfg.label}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm text-gray-700 leading-relaxed">{challenge.context}</p>
                  </div>
                </div>

                {/* SQL Tables */}
                {challenge.tables && challenge.tables.length > 0 && (
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Database size={10} /> Données disponibles
                    </div>
                    <div className="space-y-2">
                      {challenge.tables.map(table => (
                        <div key={table.name} className="border border-gray-200 overflow-hidden">
                          <div className="px-2.5 py-1.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase">TABLE</span>
                            <code className="text-xs font-bold" style={{ color: DARK }}>{table.name}</code>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse">
                              <thead>
                                <tr>
                                  {table.columns.map(col => (
                                    <th key={col} className="px-2 py-1 text-left font-bold text-gray-500 bg-gray-50 border-b border-gray-200 whitespace-nowrap">
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {table.rows.slice(0, 5).map((row, i) => (
                                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    {row.map((cell, j) => (
                                      <td key={j} className="px-2 py-1 text-gray-700 border-t border-gray-100 whitespace-nowrap">
                                        {String(cell ?? '')}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                                {table.rows.length > 5 && (
                                  <tr>
                                    <td colSpan={table.columns.length} className="px-2 py-1 text-gray-400 text-[10px] border-t border-gray-100 italic">
                                      … {table.rows.length - 5} lignes supplémentaires dans le code
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SQL Concept reminder */}
                {challenge.sqlConcept && (
                  <div className="border border-blue-100 overflow-hidden">
                    <div className="px-2.5 py-1.5 bg-blue-50 border-b border-blue-100 flex items-center gap-1.5">
                      <Database size={10} style={{ color: BLUE }} />
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: BLUE }}>Rappel SQL</span>
                    </div>
                    <pre className="p-3 text-xs font-mono leading-relaxed text-gray-700 whitespace-pre-wrap bg-white overflow-x-auto">
                      {challenge.sqlConcept}
                    </pre>
                  </div>
                )}

                {/* Mission task */}
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ce qu'on attend de toi</div>
                  <div className="text-sm text-gray-900 leading-relaxed font-medium border-l-2 pl-3 py-1" style={{ borderColor: PINK }}>
                    {challenge.instructions}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {challenge.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 font-medium">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-100">
                  <span><Clock size={11} className="inline mr-1" />~{challenge.duration} min</span>
                  <span><Star size={11} className="inline mr-1" />{challenge.points} points</span>
                  <span><Trophy size={11} className="inline mr-1" />{levelCfg.label}</span>
                </div>
              </div>
            )}

            {/* ── Output Tab ── */}
            {showTab === 'output' && (
              <div className="space-y-4">
                {!result && !isRunning && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                    <Terminal size={32} className="mb-3" />
                    <p className="text-sm font-medium">Lance ton code pour voir le résultat</p>
                    <p className="text-xs mt-1">Bouton "Exécuter" ou Ctrl+Enter</p>
                  </div>
                )}
                {isRunning && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <svg className="animate-spin w-8 h-8 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <p className="text-sm">Exécution en cours...</p>
                  </div>
                )}
                {result && !isRunning && (
                  <div className="space-y-3">
                    {/* Pass/Fail indicator */}
                    {isPassed !== null && (
                      <div className={`flex items-center gap-2 p-3 font-bold text-sm ${isPassed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {isPassed
                          ? <><CheckCircle2 size={16} /> Bravo ! Ton output correspond au résultat attendu.</>
                          : <><XCircle size={16} /> L'output ne correspond pas. Voici le diff ci-dessous.</>
                        }
                      </div>
                    )}
                    {/* stdout */}
                    {result.stdout && (
                      <div>
                        <div className="text-xs font-bold text-gray-400 mb-1.5">STDOUT</div>
                        <pre className="text-xs font-mono bg-gray-900 text-green-400 p-3 overflow-auto max-h-32 whitespace-pre-wrap">
                          {result.stdout}
                        </pre>
                      </div>
                    )}
                    {/* stderr */}
                    {result.stderr && (
                      <div>
                        <div className="text-xs font-bold text-red-400 mb-1.5">ERREUR</div>
                        <pre className="text-xs font-mono bg-red-950 text-red-300 p-3 overflow-auto max-h-32 whitespace-pre-wrap">
                          {result.stderr}
                        </pre>
                      </div>
                    )}
                    {/* Inline diff when failed */}
                    {isPassed === false && !result.stderr && (
                      <div>
                        <div className="flex items-center gap-4 mb-1.5">
                          <span className="text-xs font-bold text-blue-600">ATTENDU</span>
                          <span className="text-xs font-bold text-red-500">TON OUTPUT</span>
                        </div>
                        <div className="border border-gray-200 overflow-hidden text-xs font-mono">
                          {computeDiff(challenge.expectedOutput.trim(), result.stdout.trim()).map((line, i) => (
                            <div
                              key={i}
                              className={`flex gap-0 ${line.match ? '' : 'bg-red-50'}`}
                            >
                              <span className="w-6 text-center py-0.5 text-gray-300 bg-gray-50 border-r border-gray-200 flex-shrink-0 select-none">
                                {i + 1}
                              </span>
                              {line.match ? (
                                <span className="flex-1 px-2 py-0.5 text-gray-700">{line.exp || '\u00a0'}</span>
                              ) : (
                                <div className="flex flex-1 min-w-0">
                                  <span className="flex-1 px-2 py-0.5 text-blue-700 bg-blue-50 border-r border-blue-100 truncate" title={line.exp}>
                                    {line.exp || '(vide)'}
                                  </span>
                                  <span className="flex-1 px-2 py-0.5 text-red-600 bg-red-50 truncate" title={line.got}>
                                    {line.got || '(vide)'}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Meta */}
                    <div className="text-xs text-gray-400 flex items-center gap-3">
                      <span>Exit code: {result.exitCode}</span>
                      <span>⏱ {result.executionTime}ms</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Expected Tab ── */}
            {showTab === 'expected' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Output attendu</div>
                <pre className="text-xs font-mono bg-gray-900 text-blue-300 p-3 overflow-auto whitespace-pre-wrap">
                  {challenge.expectedOutput}
                </pre>
                <p className="text-xs text-gray-400">
                  Ton code doit produire exactement cet output (espaces et retours à la ligne compris).
                </p>
                {result && (
                  <div className="mt-3">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Ton output actuel</div>
                    <pre className={`text-xs font-mono p-3 overflow-auto whitespace-pre-wrap ${isPassed ? 'bg-green-950 text-green-300' : 'bg-red-950 text-red-300'}`}>
                      {result.stdout || '(vide)'}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hint panel */}
          <AnimatePresence>
            {showHints && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex-shrink-0 border-t border-yellow-200 bg-yellow-50 p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-700">
                    <Lightbulb size={14} />
                    Indice {hintIndex + 1} / {challenge.hints.length}
                  </div>
                  <button
                    onClick={() => setShowHints(false)}
                    className="text-yellow-400 hover:text-yellow-700 text-xs"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-yellow-800 leading-relaxed mb-3">
                  {challenge.hints[hintIndex]}
                </p>
                <div className="flex gap-2">
                  {hintIndex > 0 && (
                    <button
                      onClick={() => setHintIndex(h => h - 1)}
                      className="text-xs px-3 py-1 border border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                    >
                      ← Précédent
                    </button>
                  )}
                  {hintIndex < challenge.hints.length - 1 && (
                    <button
                      onClick={() => setHintIndex(h => h + 1)}
                      className="text-xs px-3 py-1 border border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                    >
                      Indice suivant →
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
