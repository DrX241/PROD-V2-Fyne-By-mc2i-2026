import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Lightbulb, Trophy, Clock,
  CheckCircle2, XCircle, RotateCcw, ArrowRight, Star, BookOpen, Grid3x3, Copy
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

  processed = processed.replace(/[A-Z]+\d+/g, (ref) => {
    const v = getCellValue(grid, computed, ref);
    if (v === null || v === undefined || v === '') return '0';
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return isNaN(n) ? '0' : String(n);
  });

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

function colLetter(i: number) {
  return String.fromCharCode(65 + i);
}

// ─── Formula adjustment for drag-to-fill / copy-paste ────────────────────────
// Shifts column references in a formula by colOffset and row references by rowOffset
function shiftFormula(formula: string, colOffset: number, rowOffset: number): string {
  if (!formula.startsWith('=')) return formula;
  return '=' + formula.slice(1).replace(/\$?([A-Z]+)\$?(\d+)/gi, (match, col, row) => {
    const isAbsCol = match.startsWith('$') || match.indexOf('$' + col) !== -1;
    const isAbsRow = match.includes('$' + row);
    const newCol = isAbsCol ? col : String.fromCharCode(col.toUpperCase().charCodeAt(0) + colOffset);
    const newRow = isAbsRow ? row : String(parseInt(row) + rowOffset);
    return newCol + newRow;
  });
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
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showXpAnim, setShowXpAnim] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);
  const [showTab, setShowTab] = useState<'instructions' | 'hint'>('instructions');
  const [clipboard, setClipboard] = useState<string | null>(null);
  const [copyFlash, setCopyFlash] = useState<string | null>(null);
  const [dragSource, setDragSource] = useState<string | null>(null);
  const [dragTarget, setDragTarget] = useState<string | null>(null);

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

  // All cells are editable, like real Excel
  const isEditableCell = useCallback((ref: string) => {
    return parseRef(ref) !== null;
  }, []);

  const applyFormulas = useCallback((newFormulas: Record<string, string>, grid: (string | number | null)[][]): Record<string, number | string> => {
    const newComputed: Record<string, number | string> = {};
    for (const [ref, formula] of Object.entries(newFormulas)) {
      if (formula) newComputed[ref] = evaluateFormula(formula, grid, newComputed);
    }
    return newComputed;
  }, []);

  const checkAndFinish = useCallback((newComputed: Record<string, number | string>) => {
    if (!excelData) return;
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
  }, [excelData, isCompleted, challengeId]);

  const commitFormula = useCallback((ref: string, formula: string) => {
    if (!excelData) return;
    const refUp = ref.toUpperCase();
    const newFormulas = { ...formulas, [refUp]: formula };
    const newComputed = applyFormulas(newFormulas, excelData.rows);
    setFormulas(newFormulas);
    setComputed(newComputed);
    saveFormulas(challengeId, newFormulas);
    checkAndFinish(newComputed);
  }, [excelData, formulas, challengeId, applyFormulas, checkAndFinish]);

  const handleCellClick = useCallback((ref: string) => {
    const refUp = ref.toUpperCase();
    if (!isEditableCell(refUp)) return;
    setSelectedCell(refUp);
    setEditingFormula(formulas[refUp] || '');
    setTimeout(() => formulaBarRef.current?.focus(), 0);
    if (!timerActive && !isCompleted) setTimerActive(true);
  }, [isEditableCell, formulas, timerActive, isCompleted]);

  const handleFormulaCommit = useCallback(() => {
    if (!selectedCell || !isEditableCell(selectedCell)) return;
    commitFormula(selectedCell, editingFormula);

    // After committing, move to next unfilled target cell
    if (excelData) {
      const targets = excelData.targetCells;
      const currentIdx = targets.findIndex(tc => tc.ref.toUpperCase() === selectedCell.toUpperCase());
      const nextTarget = targets.find((tc, i) => i > currentIdx && !formulas[tc.ref.toUpperCase()])
        || targets.find(tc => !formulas[tc.ref.toUpperCase()]);
      if (nextTarget) {
        const nr = nextTarget.ref.toUpperCase();
        setSelectedCell(nr);
        setEditingFormula(formulas[nr] || '');
        setTimeout(() => formulaBarRef.current?.focus(), 0);
      }
    }
  }, [selectedCell, editingFormula, commitFormula, isEditableCell, excelData, formulas]);

  // Keyboard: arrow keys between target cells + Ctrl+C/V
  const handleFormulaBarKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); handleFormulaCommit(); return; }
    if (e.key === 'Escape') { setSelectedCell(null); setEditingFormula(''); return; }
    if (e.key === 'Tab') {
      e.preventDefault();
      handleFormulaCommit();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      // Copy current formula
      if (selectedCell && formulas[selectedCell]) {
        setClipboard(formulas[selectedCell]);
        setCopyFlash(selectedCell);
        setTimeout(() => setCopyFlash(null), 1000);
      }
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      // Paste: adjust formula based on offset from clipboard source
      if (clipboard !== null && selectedCell) {
        e.preventDefault();
        setEditingFormula(clipboard);
      }
      return;
    }
  }, [handleFormulaCommit, selectedCell, formulas, clipboard]);

  // Global keyboard handler for grid navigation
  const handleGridKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!selectedCell || !excelData) return;
    const pos = parseRef(selectedCell);
    if (!pos) return;

    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (!arrowKeys.includes(e.key)) return;
    e.preventDefault();

    let newRow = pos.row;
    let newCol = pos.col;
    if (e.key === 'ArrowRight') newCol++;
    if (e.key === 'ArrowLeft') newCol--;
    if (e.key === 'ArrowDown') newRow++;
    if (e.key === 'ArrowUp') newRow--;

    const newRef = toRef(newCol, newRow).toUpperCase();
    const r = parseRef(newRef);
    if (!r) return;
    if (r.row < 0 || r.row >= excelData.rows.length) return;
    if (r.col < 0 || r.col >= excelData.numCols) return;

    // Commit current editing before moving
    if (selectedCell && isEditableCell(selectedCell) && editingFormula !== (formulas[selectedCell] || '')) {
      commitFormula(selectedCell, editingFormula);
    }
    handleCellClick(newRef);
  }, [selectedCell, excelData, editingFormula, formulas, isEditableCell, commitFormula, handleCellClick]);

  // ─── Drag-to-fill (fill handle) ─────────────────────────────────────────────
  const handleFillHandleMouseDown = useCallback((e: React.MouseEvent, sourceRef: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragSource(sourceRef);
    setDragTarget(sourceRef);
  }, []);

  const handleCellMouseEnter = useCallback((ref: string) => {
    if (dragSource) setDragTarget(ref);
  }, [dragSource]);

  const handleFillDrop = useCallback(() => {
    if (!dragSource || !dragTarget || !excelData) {
      setDragSource(null);
      setDragTarget(null);
      return;
    }
    const src = parseRef(dragSource);
    const dst = parseRef(dragTarget);
    if (!src || !dst) { setDragSource(null); setDragTarget(null); return; }
    const sourceFormula = formulas[dragSource.toUpperCase()] || '';
    if (!sourceFormula) { setDragSource(null); setDragTarget(null); return; }

    const colMin = Math.min(src.col, dst.col);
    const colMax = Math.max(src.col, dst.col);
    const rowMin = Math.min(src.row, dst.row);
    const rowMax = Math.max(src.row, dst.row);

    let newFormulas = { ...formulas };
    for (let r = rowMin; r <= rowMax; r++) {
      for (let c = colMin; c <= colMax; c++) {
        const targetRef = toRef(c, r).toUpperCase();
        if (targetRef === dragSource.toUpperCase()) continue;
        if (!isEditableCell(targetRef)) continue; // skip header row
        const colOff = c - src.col;
        const rowOff = r - src.row;
        const adjusted = shiftFormula(sourceFormula, colOff, rowOff);
        newFormulas[targetRef] = adjusted;
      }
    }
    const newComputed = applyFormulas(newFormulas, excelData.rows);
    setFormulas(newFormulas);
    setComputed(newComputed);
    saveFormulas(challengeId, newFormulas);
    checkAndFinish(newComputed);

    const lastRef = toRef(dst.col, dst.row).toUpperCase();
    setSelectedCell(lastRef);
    setEditingFormula(newFormulas[lastRef] || '');
    setDragSource(null);
    setDragTarget(null);
    if (!timerActive && !isCompleted) setTimerActive(true);
  }, [dragSource, dragTarget, excelData, formulas, isEditableCell, applyFormulas, challengeId, checkAndFinish, timerActive, isCompleted]);

  // Mouse up anywhere stops the drag
  useEffect(() => {
    const onUp = () => {
      if (dragSource) handleFillDrop();
    };
    window.addEventListener('mouseup', onUp);
    return () => window.removeEventListener('mouseup', onUp);
  }, [dragSource, handleFillDrop]);

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
    setClipboard(null);
    saveFormulas(challengeId, {});
  };

  const handleCopyFormula = (ref: string) => {
    const f = formulas[ref.toUpperCase()];
    if (f) {
      setClipboard(f);
      setCopyFlash(ref.toUpperCase());
      setTimeout(() => setCopyFlash(null), 900);
    }
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

  const correctCount = excelData.targetCells.filter(tc =>
    isCellCorrect(computed, tc.ref, tc.expectedValue, tc.tolerance)
  ).length;

  // Compute drag highlight range
  const dragRange: Set<string> = new Set();
  if (dragSource && dragTarget) {
    const src = parseRef(dragSource);
    const dst = parseRef(dragTarget);
    if (src && dst) {
      for (let r = Math.min(src.row, dst.row); r <= Math.max(src.row, dst.row); r++) {
        for (let c = Math.min(src.col, dst.col); c <= Math.max(src.col, dst.col); c++) {
          dragRange.add(toRef(c, r).toUpperCase());
        }
      }
    }
  }

  return (
    <div
      className="h-screen flex flex-col bg-white overflow-hidden"
      style={{ color: DARK }}
      onKeyDown={handleGridKeyDown}
      tabIndex={-1}
    >
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

      {/* ── Clipboard Toast ── */}
      <AnimatePresence>
        {clipboard && copyFlash === null && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-2.5 text-white text-xs font-bold shadow-lg"
            style={{ background: BLUE }}
          >
            <Copy size={13} />
            Formule copiée — Ctrl+V pour coller
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ─── SPREADSHEET PANE ─────────────────────────────────────────── */}
        <div className="flex flex-col" style={{ width: '62%', borderRight: '1px solid #e5e7eb' }}>

          {/* Excel-style toolbar */}
          <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-1.5">
              <Grid3x3 size={13} style={{ color: EXCEL_GREEN }} />
              <span className="text-xs font-bold" style={{ color: EXCEL_GREEN }}>
                {challenge.title}.xlsx
              </span>
            </div>
            {/* Clipboard status */}
            {clipboard && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-blue-50 border border-blue-100" style={{ color: BLUE }}>
                <Copy size={9} /> {clipboard} dans le presse-papier
              </span>
            )}
            <div className="flex-1" />
            {isCompleted && (
              <span className="flex items-center gap-1 text-xs font-bold" style={{ color: EXCEL_GREEN }}>
                <CheckCircle2 size={12} /> Complété
              </span>
            )}
            <span className="text-xs text-gray-400 hidden md:block">
              {correctCount} / {excelData.targetCells.length} correcte{excelData.targetCells.length > 1 ? 's' : ''}
            </span>
            <button onClick={handleReset}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 px-2 py-1 border border-gray-200 hover:border-gray-400">
              <RotateCcw size={11} /> Reset
            </button>
          </div>

          {/* Formula bar */}
          <div className="flex-shrink-0 flex items-center gap-0 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-center w-10 flex-shrink-0 border-r border-gray-200 py-2 italic text-gray-400 text-sm font-medium select-none">
              fx
            </div>
            <div className="flex items-center justify-center w-16 flex-shrink-0 border-r border-gray-200 py-2 font-mono text-xs font-bold text-gray-600 bg-gray-50 select-none">
              {selectedCell || ''}
            </div>
            <input
              ref={formulaBarRef}
              type="text"
              value={editingFormula}
              onChange={e => setEditingFormula(e.target.value)}
              onKeyDown={handleFormulaBarKeyDown}
              placeholder={
                selectedCell
                  ? 'Entre une valeur ou une formule (ex: =SOMME(B2:B6))  •  Ctrl+C copier  •  Ctrl+V coller'
                  : 'Clique sur n\'importe quelle cellule pour l\'éditer'
              }
              className="flex-1 px-3 py-2 text-sm font-mono focus:outline-none bg-white"
              style={selectedCell ? { borderLeft: `3px solid ${EXCEL_GREEN}` } : {}}
            />
            {selectedCell && formulas[selectedCell] && (
              <button
                onClick={() => handleCopyFormula(selectedCell)}
                title="Copier la formule (Ctrl+C)"
                className="flex-shrink-0 px-3 py-2 text-gray-400 hover:text-gray-700 border-l border-gray-100"
              >
                <Copy size={14} />
              </button>
            )}
            {selectedCell && (
              <button
                onClick={handleFormulaCommit}
                className="flex-shrink-0 px-4 py-2 text-white text-xs font-bold"
                style={{ background: EXCEL_GREEN }}
              >
                Valider ↵
              </button>
            )}
          </div>

          {/* Keyboard hints bar */}
          <div className="flex-shrink-0 flex items-center gap-4 px-4 py-1 bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400">
            <span>↵ Valider</span>
            <span>⇥ Tab = cellule suivante</span>
            <span>↑↓←→ Naviguer</span>
            <span>Ctrl+C Copier formule</span>
            <span>Ctrl+V Coller</span>
            <span className="ml-auto flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: EXCEL_GREEN }} />
              Glisser la poignée verte pour recopier
            </span>
          </div>

          {/* Spreadsheet grid */}
          <div className="flex-1 overflow-auto" style={{ userSelect: dragSource ? 'none' : 'auto' }}>
            <table className="border-collapse min-w-full" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '36px' }} />
                {Array.from({ length: excelData.numCols }, (_, i) => (
                  <col key={i} style={{ width: `${Math.max(120, 500 / excelData.numCols)}px` }} />
                ))}
              </colgroup>

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
                      <td className="border border-gray-300 bg-gray-100 text-center text-xs text-gray-500 select-none py-1 px-1 font-medium">
                        {rowNum}
                      </td>
                      {Array.from({ length: excelData.numCols }, (_, colIdx) => {
                        const ref = `${colLetter(colIdx)}${rowNum}`;
                        const refUp = ref.toUpperCase();
                        const isTarget = isTargetCell(ref);
                        const isEditable = isEditableCell(ref);
                        const tc = getTargetCell(ref);
                        const isSelected = selectedCell?.toUpperCase() === refUp;
                        const hasFormula = formulas[refUp] !== undefined && formulas[refUp] !== '';
                        const hasComputed = computed[refUp] !== undefined;
                        const correct = tc ? isCellCorrect(computed, ref, tc.expectedValue, tc.tolerance) : false;
                        const wrong = hasComputed && !correct && isTarget;
                        const rawValue = row[colIdx];
                        const inDragRange = dragRange.has(refUp) && refUp !== dragSource?.toUpperCase();
                        const isCopyFlashing = copyFlash === refUp;

                        // The value to display: formula result > raw data
                        const computedVal = computed[refUp];
                        const displayValue = hasComputed
                          ? (typeof computedVal === 'number'
                            ? (Number.isInteger(computedVal) ? computedVal : Number((computedVal as number).toFixed(4)))
                            : computedVal)
                          : (rawValue !== null ? rawValue : '');

                        // Background
                        let bgColor = 'white';
                        let borderStyle = '1px solid #d1d5db';
                        if (isHeaderRow) bgColor = '#f3f4f6';
                        if (isTarget && !hasComputed) bgColor = '#fffbeb';
                        if (isTarget && correct) bgColor = '#f0fdf4';
                        if (isTarget && wrong) bgColor = '#fff1f2';
                        if (!isTarget && hasFormula && !isHeaderRow) bgColor = '#f0f9ff';
                        if (inDragRange && isEditable) bgColor = '#dbeafe';
                        if (isCopyFlashing) bgColor = '#dcfce7';
                        if (isSelected) borderStyle = `2px solid ${EXCEL_GREEN}`;
                        if (inDragRange) borderStyle = `1px dashed ${BLUE}`;

                        // Text color
                        let textColor = '#111827';
                        if (isHeaderRow) textColor = '#374151';
                        if (isTarget && correct) textColor = '#16a34a';
                        if (isTarget && wrong) textColor = '#dc2626';
                        if (!isTarget && !isHeaderRow && typeof displayValue === 'number') textColor = '#1e40af';
                        if (isTarget && hasComputed && typeof computedVal === 'number') textColor = correct ? '#16a34a' : '#dc2626';

                        const isBold = isHeaderRow || (typeof rawValue === 'string' && (rawValue.startsWith('TOTAL') || rawValue.startsWith('CA ') || rawValue === 'Moyenne' || rawValue === 'Minimum' || rawValue === 'Maximum' || rawValue === 'Nb Terminé' || rawValue === '% Terminé'));
                        const isRightAlign = typeof displayValue === 'number';

                        return (
                          <td
                            key={colIdx}
                            onClick={() => handleCellClick(ref)}
                            onMouseEnter={() => handleCellMouseEnter(refUp)}
                            style={{
                              background: bgColor,
                              border: borderStyle,
                              color: textColor,
                              cursor: isEditable ? 'text' : 'default',
                              position: 'relative',
                              minHeight: '26px',
                              transition: 'background 0.12s',
                            }}
                            className={`px-2 py-1 text-xs whitespace-nowrap overflow-hidden ${isBold ? 'font-bold' : ''} ${isRightAlign ? 'text-right' : 'text-left'}`}
                          >
                            {/* Target cell placeholder */}
                            {isTarget && !hasComputed && (
                              <span className="text-amber-400 font-medium italic text-[10px]">
                                {tc?.label || 'Formule…'}
                              </span>
                            )}
                            {/* Value display */}
                            {(!isTarget || hasComputed) && (
                              <span className={isTarget && correct ? 'font-bold' : ''}>
                                {displayValue !== null && displayValue !== undefined && displayValue !== '' ? String(displayValue) : ''}
                              </span>
                            )}
                            {/* Status icon for target cells */}
                            {isTarget && hasComputed && (
                              <span className="absolute right-1 top-1/2 -translate-y-1/2">
                                {correct
                                  ? <CheckCircle2 size={11} style={{ color: '#16a34a' }} />
                                  : <XCircle size={11} style={{ color: '#dc2626' }} />
                                }
                              </span>
                            )}
                            {/* Fill handle — shown on any selected editable cell */}
                            {isSelected && isEditable && (
                              <span
                                onMouseDown={(e) => handleFillHandleMouseDown(e, refUp)}
                                style={{
                                  position: 'absolute',
                                  bottom: -4,
                                  right: -4,
                                  width: 8,
                                  height: 8,
                                  background: EXCEL_GREEN,
                                  border: '1px solid white',
                                  cursor: 'crosshair',
                                  zIndex: 10,
                                }}
                                title="Glisser pour recopier vers les cellules adjacentes"
                              />
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
          <div className="flex-shrink-0 flex items-center gap-3 px-4 py-1.5 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-amber-50 border border-amber-200" /> Cellule cible vide
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-green-50 border border-green-200" /> Correcte
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-red-50 border border-red-200" /> Incorrecte
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-blue-50 border border-blue-100" /> Cellule modifiée
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 border border-dashed border-blue-400 bg-blue-50" /> Recopie en cours
            </span>
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

                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ce qu'on attend de toi</div>
                  <div className="text-sm text-gray-900 leading-relaxed font-medium border-l-2 pl-3 py-1" style={{ borderColor: PINK }}>
                    {challenge.instructions}
                  </div>
                </div>

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
                        <div key={tc.ref} className="flex items-center gap-2 text-xs cursor-pointer"
                          onClick={() => handleCellClick(tc.ref)}>
                          {c
                            ? <CheckCircle2 size={13} style={{ color: '#16a34a' }} />
                            : filled
                              ? <XCircle size={13} style={{ color: '#dc2626' }} />
                              : <div className="w-3 h-3 rounded-full border-2 border-amber-300 bg-amber-50" />
                          }
                          <span className="font-mono font-bold" style={{ color: c ? '#16a34a' : filled ? '#dc2626' : '#92400e' }}>
                            {tc.ref}
                          </span>
                          {filled && formulas[tc.ref.toUpperCase()] && (
                            <code className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1">
                              {formulas[tc.ref.toUpperCase()]}
                            </code>
                          )}
                          <span className="text-gray-400 ml-auto">{c ? '✓' : filled ? '✗' : '–'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

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
                        <button
                          onClick={() => {
                            setClipboard(tc.hint!);
                            setCopyFlash(null);
                            setSelectedCell(tc.ref.toUpperCase());
                            setEditingFormula(tc.hint!);
                            setTimeout(() => formulaBarRef.current?.focus(), 0);
                          }}
                          className="text-[10px] text-blue-500 hover:text-blue-700 font-bold"
                          title="Utiliser cette formule"
                        >
                          Utiliser
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* All-correct footer */}
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
