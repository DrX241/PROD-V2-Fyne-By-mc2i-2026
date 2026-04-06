import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Lightbulb, Trophy, Clock,
  CheckCircle2, XCircle, RotateCcw, ArrowRight, Star, BookOpen, Grid3x3
} from 'lucide-react';
import mcLogoPath from '@assets/mc2i.png';
import { CHALLENGES, TRACKS, LEVEL_CONFIG, getChallengeById, type ExcelData } from '@/data/si-champion-challenges';

const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';
const EXCEL_GREEN = '#217346';
const STORAGE_KEY = 'si-champion-completed';
const CODE_STORAGE_PREFIX = 'si-champion-excel-';

function getCompleted(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function markCompleted(id: string) {
  const list = getCompleted();
  if (!list.includes(id)) localStorage.setItem(STORAGE_KEY, JSON.stringify([...list, id]));
}
function saveFormulas(id: string, formulas: Record<string, string>) {
  localStorage.setItem(CODE_STORAGE_PREFIX + id, JSON.stringify(formulas));
}
function loadFormulas(id: string): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(CODE_STORAGE_PREFIX + id) || '{}'); } catch { return {}; }
}

// ─── Formula Engine ──────────────────────────────────────────────────────────

function colToIndex(col: string): number {
  return col.toUpperCase().charCodeAt(0) - 65;
}
function parseRef(ref: string): { row: number; col: number } | null {
  const m = ref.match(/^([A-Z]+)(\d+)$/i);
  if (!m) return null;
  return { col: colToIndex(m[1]), row: parseInt(m[2]) - 1 };
}
function toRef(col: number, row: number): string {
  return String.fromCharCode(65 + col) + (row + 1);
}

function getCellValue(
  grid: (string | number | null)[][],
  computed: Record<string, number | string>,
  ref: string
): number | string | null {
  const upper = ref.toUpperCase();
  if (computed[upper] !== undefined) return computed[upper];
  const pos = parseRef(upper);
  if (!pos) return null;
  return grid[pos.row]?.[pos.col] ?? null;
}

function getRangeNumbers(
  grid: (string | number | null)[][],
  computed: Record<string, number | string>,
  rangeStr: string
): number[] {
  const parts = rangeStr.trim().split(':');
  if (parts.length === 1) {
    const v = getCellValue(grid, computed, parts[0]);
    const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
    return isNaN(n) ? [] : [n];
  }
  const start = parseRef(parts[0]);
  const end = parseRef(parts[1]);
  if (!start || !end) return [];
  const values: number[] = [];
  for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
    for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
      const v = getCellValue(grid, computed, toRef(c, r));
      const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
      if (!isNaN(n)) values.push(n);
    }
  }
  return values;
}

function getRangeStrings(
  grid: (string | number | null)[][],
  computed: Record<string, number | string>,
  rangeStr: string
): (string | number | null)[] {
  const parts = rangeStr.trim().split(':');
  if (parts.length === 1) return [getCellValue(grid, computed, parts[0])];
  const start = parseRef(parts[0]);
  const end = parseRef(parts[1]);
  if (!start || !end) return [];
  const values: (string | number | null)[] = [];
  for (let r = Math.min(start.row, end.row); r <= Math.max(start.row, end.row); r++) {
    for (let c = Math.min(start.col, end.col); c <= Math.max(start.col, end.col); c++) {
      values.push(getCellValue(grid, computed, toRef(c, r)));
    }
  }
  return values;
}

function parseArgs(argsStr: string): string[] {
  const args: string[] = [];
  let depth = 0;
  let inQuote = false;
  let current = '';
  for (const ch of argsStr) {
    if (ch === '"' && depth === 0) { inQuote = !inQuote; current += ch; }
    else if (!inQuote && ch === '(') { depth++; current += ch; }
    else if (!inQuote && ch === ')') { depth--; current += ch; }
    else if (!inQuote && ch === ',' && depth === 0) { args.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  if (current.trim()) args.push(current.trim());
  return args;
}

function evalFunction(
  name: string,
  argsStr: string,
  grid: (string | number | null)[][],
  computed: Record<string, number | string>
): number | string {
  const args = parseArgs(argsStr);
  const n = name.toUpperCase();
  if (n === 'SOMME' || n === 'SUM') {
    return getRangeNumbers(grid, computed, args[0]).reduce((a, b) => a + b, 0);
  }
  if (n === 'MOYENNE' || n === 'AVERAGE') {
    const vals = getRangeNumbers(grid, computed, args[0]);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }
  if (n === 'MIN') {
    const vals = getRangeNumbers(grid, computed, args[0]);
    return vals.length ? Math.min(...vals) : 0;
  }
  if (n === 'MAX') {
    const vals = getRangeNumbers(grid, computed, args[0]);
    return vals.length ? Math.max(...vals) : 0;
  }
  if (n === 'NB' || n === 'COUNT') {
    return getRangeNumbers(grid, computed, args[0]).length;
  }
  if (n === 'NB.SI' || n === 'COUNTIF') {
    if (args.length < 2) return '#ERREUR';
    const rangeVals = getRangeStrings(grid, computed, args[0]);
    const criteria = args[1].trim().replace(/^"|"$/g, '');
    return rangeVals.filter(v => String(v ?? '').toLowerCase() === criteria.toLowerCase()).length;
  }
  if (n === 'SOMME.SI' || n === 'SUMIF') {
    if (args.length < 3) return '#ERREUR';
    const criteriaVals = getRangeStrings(grid, computed, args[0]);
    const criteria = args[1].trim().replace(/^"|"$/g, '');
    const sumVals = getRangeNumbers(grid, computed, args[2]);
    let total = 0;
    criteriaVals.forEach((v, i) => {
      if (String(v ?? '').toLowerCase() === criteria.toLowerCase()) total += sumVals[i] ?? 0;
    });
    return total;
  }
  return '#ERREUR';
}

function evalCondition(
  cond: string,
  grid: (string | number | null)[][],
  computed: Record<string, number | string>
): boolean {
  const m = cond.match(/^(.+?)(>=|<=|<>|>|<|=)(.+)$/);
  if (!m) return false;
  const left = evalExpr(m[1].trim(), grid, computed);
  const op = m[2];
  const rightRaw = m[3].trim().replace(/^"|"$/g, '');
  const leftNum = typeof left === 'number' ? left : parseFloat(String(left));
  const rightNum = parseFloat(rightRaw);
  if (!isNaN(leftNum) && !isNaN(rightNum)) {
    if (op === '>=') return leftNum >= rightNum;
    if (op === '<=') return leftNum <= rightNum;
    if (op === '<>') return leftNum !== rightNum;
    if (op === '>') return leftNum > rightNum;
    if (op === '<') return leftNum < rightNum;
    if (op === '=') return leftNum === rightNum;
  }
  const ls = String(left ?? '').toLowerCase();
  const rs = rightRaw.toLowerCase();
  if (op === '=') return ls === rs;
  if (op === '<>') return ls !== rs;
  return false;
}

function evalExpr(
  expr: string,
  grid: (string | number | null)[][],
  computed: Record<string, number | string>
): number | string {
  const upper = expr.trim().toUpperCase();

  // SI / IF — special case (has string branches)
  const siMatch = upper.match(/^(?:SI|IF)\((.+)\)$/s);
  if (siMatch) {
    const siArgs = parseArgs(siMatch[1]);
    if (siArgs.length < 3) return '#ERREUR';
    const condResult = evalCondition(siArgs[0].trim(), grid, computed);
    const branch = condResult ? siArgs[1].trim() : siArgs[2].trim();
    const cleaned = branch.replace(/^"|"$/g, '');
    const n = parseFloat(cleaned);
    return isNaN(n) ? cleaned : n;
  }

  // Iteratively replace innermost function calls with numeric results
  let processed = upper;
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 20) {
    changed = false;
    iterations++;
    const funcMatch = processed.match(/([A-Z][A-Z0-9._]*)(\([^()]*\))/);
    if (funcMatch) {
      const [fullMatch, funcName, argsWithParens] = funcMatch;
      const argsStr = argsWithParens.slice(1, -1);
      const result = evalFunction(funcName, argsStr, grid, computed);
      if (typeof result === 'number') {
        processed = processed.replace(fullMatch, String(result));
        changed = true;
      } else if (result === '#ERREUR') {
        return '#ERREUR';
      }
    }
  }

  // Replace cell references with values
  processed = processed.replace(/[A-Z]+\d+/g, (ref) => {
    const v = getCellValue(grid, computed, ref);
    if (v === null || v === undefined || v === '') return '0';
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return isNaN(n) ? '0' : String(n);
  });

  // Evaluate arithmetic
  if (/^[\d\s+\-*/.()\[\]]+$/.test(processed)) {
    try {
      const result = new Function(`return (${processed})`)();
      return typeof result === 'number' ? result : '#ERREUR';
    } catch { return '#ERREUR'; }
  }
  return '#ERREUR';
}

function evaluateFormula(
  formula: string,
  grid: (string | number | null)[][],
  computed: Record<string, number | string>
): number | string {
  const f = formula.trim();
  if (!f) return '';
  if (!f.startsWith('=')) {
    const n = parseFloat(f);
    return isNaN(n) ? f : n;
  }
  try {
    return evalExpr(f.slice(1).trim(), grid, computed);
  } catch {
    return '#ERREUR';
  }
}

function isCellCorrect(
  computed: Record<string, number | string>,
  ref: string,
  expected: number | string,
  tolerance = 0.01
): boolean {
  const val = computed[ref.toUpperCase()];
  if (val === undefined) return false;
  if (typeof expected === 'number' && typeof val === 'number') {
    return Math.abs(val - expected) <= tolerance;
  }
  return String(val).toLowerCase().trim() === String(expected).toLowerCase().trim();
}

// ─── Column letter display ────────────────────────────────────────────────────
function colLetter(i: number) {
  return String.fromCharCode(65 + i);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ExcelPlayer({ challengeId }: { challengeId: string }) {
  const [, navigate] = useLocation();
  const challenge = getChallengeById(challengeId);
  const excelData = challenge?.excelData as ExcelData | undefined;

  const [formulas, setFormulas] = useState<Record<string, string>>({});
  const [computed, setComputed] = useState<Record<string, number | string>>({});
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [editingFormula, setEditingFormula] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showXpAnim, setShowXpAnim] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);
  const [showTab, setShowTab] = useState<'instructions' | 'hint'>('instructions');

  const formulaBarRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCompleted = getCompleted().includes(challengeId);

  // Load saved formulas
  useEffect(() => {
    if (!challenge || !excelData) return;
    const saved = loadFormulas(challengeId);
    if (Object.keys(saved).length > 0) {
      setFormulas(saved);
      const newComputed: Record<string, number | string> = {};
      for (const [ref, formula] of Object.entries(saved)) {
        if (formula) newComputed[ref] = evaluateFormula(formula, excelData.rows, newComputed);
      }
      setComputed(newComputed);
      const correct = excelData.targetCells.every(tc =>
        isCellCorrect(newComputed, tc.ref, tc.expectedValue, tc.tolerance)
      );
      setAllCorrect(correct);
    }
    setSelectedCell(null);
    setEditingFormula('');
    setElapsed(0);
    setTimerActive(false);
    setShowSuccess(false);
    setShowTab('instructions');
    localStorage.setItem('si-champion-last', challengeId);
  }, [challengeId]);

  // Timer
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const isTargetCell = useCallback((ref: string) => {
    return excelData?.targetCells.some(tc => tc.ref.toUpperCase() === ref.toUpperCase()) ?? false;
  }, [excelData]);

  const getTargetCell = useCallback((ref: string) => {
    return excelData?.targetCells.find(tc => tc.ref.toUpperCase() === ref.toUpperCase());
  }, [excelData]);

  const handleCellClick = useCallback((ref: string) => {
    if (!isTargetCell(ref)) return;
    setSelectedCell(ref);
    setEditingFormula(formulas[ref.toUpperCase()] || '');
    setTimeout(() => formulaBarRef.current?.focus(), 0);
    if (!timerActive && !isCompleted) setTimerActive(true);
  }, [isTargetCell, formulas, timerActive, isCompleted]);

  const commitFormula = useCallback((ref: string, formula: string, currentComputed: Record<string, number | string>) => {
    if (!excelData) return currentComputed;
    const refUp = ref.toUpperCase();
    const result = evaluateFormula(formula, excelData.rows, currentComputed);
    const newComputed = { ...currentComputed, [refUp]: result };
    const newFormulas = { ...formulas, [refUp]: formula };
    setFormulas(newFormulas);
    setComputed(newComputed);
    saveFormulas(challengeId, newFormulas);

    const correct = excelData.targetCells.every(tc =>
      isCellCorrect(newComputed, tc.ref, tc.expectedValue, tc.tolerance)
    );
    setAllCorrect(correct);
    if (correct && !isCompleted) {
      setTimerActive(false);
      markCompleted(challengeId);
      setShowSuccess(true);
      setShowXpAnim(true);
      setTimeout(() => setShowSuccess(false), 5000);
      setTimeout(() => setShowXpAnim(false), 2500);
    }
    return newComputed;
  }, [excelData, formulas, challengeId, isCompleted]);

  const handleFormulaCommit = useCallback(() => {
    if (!selectedCell) return;
    const newComputed = commitFormula(selectedCell, editingFormula, computed);

    // Move to next unfilled target cell
    if (excelData) {
      const currentIdx = excelData.targetCells.findIndex(tc => tc.ref.toUpperCase() === selectedCell.toUpperCase());
      const next = excelData.targetCells.find((tc, i) => i > currentIdx && !formulas[tc.ref.toUpperCase()]);
      if (next) {
        setSelectedCell(next.ref.toUpperCase());
        setEditingFormula(formulas[next.ref.toUpperCase()] || '');
        setTimeout(() => formulaBarRef.current?.focus(), 0);
      } else {
        setSelectedCell(null);
        setEditingFormula('');
      }
    }
  }, [selectedCell, editingFormula, computed, commitFormula, excelData, formulas]);

  const handleReset = () => {
    setFormulas({});
    setComputed({});
    setSelectedCell(null);
    setEditingFormula('');
    setAllCorrect(false);
    setElapsed(0);
    setTimerActive(false);
    setShowSuccess(false);
    setShowTab('instructions');
    saveFormulas(challengeId, {});
  };

  const getNextChallenge = () => {
    const idx = CHALLENGES.findIndex(c => c.id === challengeId);
    return idx < CHALLENGES.length - 1 ? CHALLENGES[idx + 1] : null;
  };
  const getPrevChallenge = () => {
    const idx = CHALLENGES.findIndex(c => c.id === challengeId);
    return idx > 0 ? CHALLENGES[idx - 1] : null;
  };

  if (!challenge || !excelData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <BookOpen size={40} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-black mb-2" style={{ color: DARK }}>Défi introuvable</h2>
          <Link href="/si-champion/challenges">
            <button className="px-6 py-2 text-white font-bold" style={{ background: BLUE }}>Retour aux défis</button>
          </Link>
        </div>
      </div>
    );
  }

  const track = TRACKS.find(t => t.id === challenge.track)!;
  const levelCfg = LEVEL_CONFIG[challenge.level];
  const next = getNextChallenge();
  const prev = getPrevChallenge();
  const currentIdx = CHALLENGES.findIndex(c => c.id === challengeId);

  // Count correct cells
  const correctCount = excelData.targetCells.filter(tc =>
    isCellCorrect(computed, tc.ref, tc.expectedValue, tc.tolerance)
  ).length;

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden" style={{ color: DARK }}>
      {/* ── Header ── */}
      <header className="flex-shrink-0 bg-white border-b border-gray-100 z-50">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/si-champion/challenges">
              <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 font-medium">
                <ChevronLeft size={14} /> Défis
              </button>
            </Link>
            <div className="h-4 w-px bg-gray-200" />
            <Link href="/">
              <img src={mcLogoPath} alt="mc2i" className="h-5 w-auto cursor-pointer" />
            </Link>
            <div className="h-4 w-px bg-gray-200" />
            <span className="text-xs font-bold px-2 py-0.5" style={{ background: track.bgLight, color: track.color }}>
              {track.label}
            </span>
            <span className="text-xs font-bold px-2 py-0.5" style={{ background: levelCfg.bg, color: levelCfg.color }}>
              {levelCfg.label}
            </span>
            <span className="text-sm font-black hidden md:block" style={{ color: DARK }}>{challenge.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs font-mono text-gray-400">
              <Clock size={12} /> {formatTime(elapsed)}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold" style={{ color: BLUE }}>
              <Star size={12} /> {challenge.points} pts
            </div>
            <div className="text-xs text-gray-400 hidden md:block">{currentIdx + 1} / {CHALLENGES.length}</div>
            <div className="flex items-center gap-1">
              <button onClick={() => prev && navigate(`/si-champion/challenge/${prev.id}`)} disabled={!prev}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => next && navigate(`/si-champion/challenge/${next.id}`)} disabled={!next}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="h-0.5 w-full" style={{ background: PINK }} />
      </header>

      {/* ── XP Float ── */}
      <AnimatePresence>
        {showXpAnim && (
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -80, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            className="fixed top-20 right-8 z-[100] px-5 py-3 text-white font-black text-lg pointer-events-none"
            style={{ background: EXCEL_GREEN }}
          >
            +{challenge.points} pts
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Success Banner ── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="flex-shrink-0 py-3 px-6 flex items-center justify-between text-white font-bold"
            style={{ background: EXCEL_GREEN }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} />
              Toutes les formules sont correctes ! +{challenge.points} points gagnés
            </div>
            {next && (
              <button onClick={() => navigate(`/si-champion/challenge/${next.id}`)}
                className="flex items-center gap-1 text-sm underline">
                Défi suivant <ArrowRight size={14} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ─── SPREADSHEET PANE ─────────────────────────────────────────── */}
        <div className="flex flex-col" style={{ width: '62%', borderRight: '1px solid #e5e7eb' }}>

          {/* Excel-style toolbar */}
          <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-1.5">
              <Grid3x3 size={14} style={{ color: EXCEL_GREEN }} />
              <span className="text-xs font-bold" style={{ color: EXCEL_GREEN }}>
                {challenge.title}.xlsx
              </span>
            </div>
            <div className="flex-1" />
            {isCompleted && (
              <span className="flex items-center gap-1 text-xs font-bold" style={{ color: EXCEL_GREEN }}>
                <CheckCircle2 size={12} /> Complété
              </span>
            )}
            <span className="text-xs text-gray-400 hidden md:block">
              {correctCount} / {excelData.targetCells.length} cellule{excelData.targetCells.length > 1 ? 's' : ''} correcte{excelData.targetCells.length > 1 ? 's' : ''}
            </span>
            <button onClick={handleReset}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 px-2 py-1 border border-gray-200 hover:border-gray-400">
              <RotateCcw size={11} /> Reset
            </button>
          </div>

          {/* Formula bar */}
          <div className="flex-shrink-0 flex items-center gap-0 border-b border-gray-200 bg-white">
            {/* fx label */}
            <div className="flex items-center justify-center w-10 flex-shrink-0 border-r border-gray-200 py-2 italic text-gray-400 text-sm font-medium select-none">
              fx
            </div>
            {/* cell reference box */}
            <div className="flex items-center justify-center w-16 flex-shrink-0 border-r border-gray-200 py-2 font-mono text-xs font-bold text-gray-600 bg-gray-50 select-none">
              {selectedCell || ''}
            </div>
            {/* formula input */}
            <input
              ref={formulaBarRef}
              type="text"
              value={editingFormula}
              onChange={e => setEditingFormula(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); handleFormulaCommit(); }
                if (e.key === 'Escape') { setSelectedCell(null); setEditingFormula(''); }
              }}
              placeholder={selectedCell ? 'Entre ta formule ici, ex: =SOMME(B2:B6)' : 'Clique sur une cellule jaune pour entrer une formule'}
              disabled={!selectedCell}
              className="flex-1 px-3 py-2 text-sm font-mono focus:outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
              style={selectedCell ? { borderLeft: `3px solid ${EXCEL_GREEN}` } : {}}
            />
            {selectedCell && (
              <button
                onClick={handleFormulaCommit}
                className="flex-shrink-0 px-4 py-2 text-white text-xs font-bold"
                style={{ background: EXCEL_GREEN }}
              >
                Valider
              </button>
            )}
          </div>

          {/* Spreadsheet grid */}
          <div className="flex-1 overflow-auto">
            <table className="border-collapse min-w-full" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '36px' }} />
                {Array.from({ length: excelData.numCols }, (_, i) => (
                  <col key={i} style={{ width: `${Math.max(120, 500 / excelData.numCols)}px` }} />
                ))}
              </colgroup>

              {/* Column headers */}
              <thead>
                <tr>
                  <th className="border border-gray-300 bg-gray-100 text-center text-xs text-gray-500 select-none py-1" />
                  {Array.from({ length: excelData.numCols }, (_, i) => (
                    <th key={i}
                      className="border border-gray-300 bg-gray-100 text-center text-xs font-bold text-gray-600 py-1 select-none"
                    >
                      {colLetter(i)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {excelData.rows.map((row, rowIdx) => {
                  const rowNum = rowIdx + 1;
                  const isHeaderRow = rowIdx === 0;
                  return (
                    <tr key={rowIdx}>
                      {/* Row number */}
                      <td className="border border-gray-300 bg-gray-100 text-center text-xs text-gray-500 select-none py-1 px-1 font-medium">
                        {rowNum}
                      </td>
                      {Array.from({ length: excelData.numCols }, (_, colIdx) => {
                        const ref = `${colLetter(colIdx)}${rowNum}`;
                        const isTarget = isTargetCell(ref);
                        const tc = getTargetCell(ref);
                        const isSelected = selectedCell?.toUpperCase() === ref.toUpperCase();
                        const hasValue = computed[ref.toUpperCase()] !== undefined;
                        const correct = tc ? isCellCorrect(computed, ref, tc.expectedValue, tc.tolerance) : false;
                        const wrong = hasValue && !correct && isTarget;
                        const rawValue = row[colIdx];
                        const displayValue = hasValue
                          ? (typeof computed[ref.toUpperCase()] === 'number'
                            ? (Number.isInteger(computed[ref.toUpperCase()] as number)
                              ? computed[ref.toUpperCase()]
                              : Number((computed[ref.toUpperCase()] as number).toFixed(4)))
                            : computed[ref.toUpperCase()])
                          : (rawValue !== null ? rawValue : '');

                        // Cell styling
                        let bgColor = 'white';
                        let borderStyle = '1px solid #d1d5db';
                        let textStyle = '';
                        if (isHeaderRow) { bgColor = '#f3f4f6'; textStyle = 'font-bold'; }
                        if (isTarget && !hasValue) bgColor = '#fffbeb';
                        if (isTarget && correct) bgColor = '#f0fdf4';
                        if (isTarget && wrong) bgColor = '#fff1f2';
                        if (isSelected) borderStyle = `2px solid ${EXCEL_GREEN}`;

                        // Determine text color
                        let textColor = '#111827';
                        if (isHeaderRow) textColor = '#374151';
                        if (isTarget && correct) textColor = '#16a34a';
                        if (isTarget && wrong) textColor = '#dc2626';
                        if (typeof rawValue === 'number') textColor = '#1e40af';
                        if (isTarget && hasValue && typeof computed[ref.toUpperCase()] === 'number') textColor = correct ? '#16a34a' : '#dc2626';

                        const isBold = isHeaderRow || (rawValue !== null && typeof rawValue === 'string' && rawValue.startsWith('TOTAL'));
                        const isRightAlign = typeof rawValue === 'number' || (hasValue && typeof computed[ref.toUpperCase()] === 'number');

                        return (
                          <td
                            key={colIdx}
                            onClick={() => handleCellClick(ref)}
                            style={{
                              background: bgColor,
                              border: borderStyle,
                              color: textColor,
                              cursor: isTarget ? 'text' : 'default',
                              userSelect: 'none',
                              position: 'relative',
                              minHeight: '26px',
                            }}
                            className={`px-2 py-1 text-xs whitespace-nowrap overflow-hidden ${isBold ? 'font-bold' : ''} ${isRightAlign ? 'text-right' : 'text-left'}`}
                            title={isTarget && !hasValue ? `Cellule cible — entre ta formule dans la barre de formule` : ''}
                          >
                            {/* Target cell without value: show dashed placeholder */}
                            {isTarget && !hasValue && (
                              <span className="text-amber-400 font-medium italic text-[10px]">
                                {tc?.label || 'Formule…'}
                              </span>
                            )}
                            {/* Has value or not a target cell */}
                            {(!isTarget || hasValue) && (
                              <span className={isTarget && correct ? 'font-bold' : ''}>
                                {displayValue !== null && displayValue !== undefined && displayValue !== '' ? String(displayValue) : ''}
                              </span>
                            )}
                            {/* Status icon in target cells */}
                            {isTarget && hasValue && (
                              <span className="absolute right-1 top-1/2 -translate-y-1/2">
                                {correct
                                  ? <CheckCircle2 size={11} style={{ color: '#16a34a' }} />
                                  : <XCircle size={11} style={{ color: '#dc2626' }} />
                                }
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom legend */}
          <div className="flex-shrink-0 flex items-center gap-4 px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-amber-50 border border-amber-200 rounded-sm" /> Cellule à remplir
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-green-50 border border-green-200 rounded-sm" /> Correcte
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-red-50 border border-red-200 rounded-sm" /> Incorrecte
            </span>
            <span className="ml-auto">Appuie sur Entrée pour valider une formule</span>
          </div>
        </div>

        {/* ─── RIGHT PANEL ──────────────────────────────────────────────── */}
        <div className="flex flex-col" style={{ width: '38%' }}>
          {/* Tabs */}
          <div className="flex-shrink-0 flex border-b border-gray-100">
            {[
              { key: 'instructions', label: 'Consignes', icon: <BookOpen size={13} /> },
              { key: 'hint', label: 'Indices', icon: <Lightbulb size={13} /> },
            ].map(tab => (
              <button key={tab.key}
                onClick={() => setShowTab(tab.key as any)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors"
                style={showTab === tab.key
                  ? { borderBottomColor: BLUE, color: BLUE }
                  : { borderBottomColor: 'transparent', color: '#9ca3af' }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {showTab === 'instructions' && (
              <>
                {/* Mission brief */}
                <div className="border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="w-7 h-7 flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                      style={{ background: EXCEL_GREEN }}>MC</div>
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

                {/* Task */}
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ce qu'on attend de toi</div>
                  <div className="text-sm text-gray-900 leading-relaxed font-medium border-l-2 pl-3 py-1" style={{ borderColor: PINK }}>
                    {challenge.instructions}
                  </div>
                </div>

                {/* Formula concept */}
                {excelData.formulaConcept && (
                  <div className="border overflow-hidden" style={{ borderColor: '#bbf7d0' }}>
                    <div className="px-2.5 py-1.5 border-b flex items-center gap-1.5" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                      <Grid3x3 size={10} style={{ color: EXCEL_GREEN }} />
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: EXCEL_GREEN }}>Syntaxe Excel</span>
                    </div>
                    <pre className="p-3 text-xs font-mono leading-relaxed text-gray-700 whitespace-pre-wrap bg-white">
                      {excelData.formulaConcept}
                    </pre>
                  </div>
                )}

                {/* Progress */}
                <div className="border border-gray-100 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progression</span>
                    <span className="text-xs font-bold" style={{ color: EXCEL_GREEN }}>
                      {correctCount} / {excelData.targetCells.length}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded">
                    <div className="h-full rounded transition-all duration-500"
                      style={{ width: `${(correctCount / excelData.targetCells.length) * 100}%`, background: EXCEL_GREEN }} />
                  </div>
                  <div className="mt-2 space-y-1">
                    {excelData.targetCells.map(tc => {
                      const c = isCellCorrect(computed, tc.ref, tc.expectedValue, tc.tolerance);
                      const filled = computed[tc.ref.toUpperCase()] !== undefined;
                      return (
                        <div key={tc.ref} className="flex items-center gap-2 text-xs"
                          onClick={() => handleCellClick(tc.ref)}
                          style={{ cursor: 'pointer' }}>
                          {c
                            ? <CheckCircle2 size={13} style={{ color: '#16a34a' }} />
                            : filled
                              ? <XCircle size={13} style={{ color: '#dc2626' }} />
                              : <div className="w-3 h-3 rounded-full border-2 border-amber-300 bg-amber-50" />
                          }
                          <span className="font-mono font-bold" style={{ color: c ? '#16a34a' : filled ? '#dc2626' : '#92400e' }}>
                            {tc.ref}
                          </span>
                          <span className="text-gray-400">{c ? '✓ Correct' : filled ? '✗ Incorrect' : 'À remplir'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-400 pt-1 border-t border-gray-100">
                  <span><Clock size={11} className="inline mr-1" />~{challenge.duration} min</span>
                  <span><Star size={11} className="inline mr-1" />{challenge.points} points</span>
                  <span><Trophy size={11} className="inline mr-1" />{levelCfg.label}</span>
                </div>
              </>
            )}

            {showTab === 'hint' && (
              <>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Indices disponibles</div>
                {challenge.hints.map((hint, i) => (
                  <div key={i} className="border border-yellow-200 bg-yellow-50 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-700 mb-1.5">
                      <Lightbulb size={12} /> Indice {i + 1}
                    </div>
                    <p className="text-sm text-yellow-800 leading-relaxed">{hint}</p>
                  </div>
                ))}
                {excelData.targetCells.some(tc => tc.hint) && (
                  <div className="border border-blue-100 bg-blue-50 p-3 mt-2">
                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Formules suggérées</div>
                    {excelData.targetCells.filter(tc => tc.hint).map(tc => (
                      <div key={tc.ref} className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-blue-700 w-8">{tc.ref}</span>
                        <code className="text-xs font-mono bg-white border border-blue-100 px-2 py-0.5 text-blue-800">
                          {tc.hint}
                        </code>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* All-correct celebration */}
          {allCorrect && (
            <div className="flex-shrink-0 p-4 border-t" style={{ borderColor: '#bbf7d0', background: '#f0fdf4' }}>
              <div className="flex items-center gap-2 font-bold text-sm mb-2" style={{ color: EXCEL_GREEN }}>
                <CheckCircle2 size={16} /> Toutes les formules sont correctes !
              </div>
              {next && (
                <button onClick={() => navigate(`/si-champion/challenge/${next.id}`)}
                  className="flex items-center gap-1.5 text-xs px-4 py-2 text-white font-bold w-full justify-center"
                  style={{ background: EXCEL_GREEN }}>
                  Défi suivant <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
