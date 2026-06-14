import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2, Sparkles, Send, ChevronRight, ChevronLeft,
  Trophy, CheckCircle2, BookOpen, Zap, Code2, Table2, FunctionSquare,
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage = 'name' | 'intro' | 'quiz' | 'results' | 'exercises' | 'summary';
type CellValue = string | number | null;

type ExerciseContext = {
  company: string;
  sector: string;
  role: string;
  context: string;
  stakes: string;
};

type ExerciseTarget = {
  ref: string;
  expected: number | string;
  tolerance?: number;
  formulaExample: string;
  description: string;
};

type ExerciseDef = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  goal: string;
  hint: string;
  colLetters: string[];
  colHeaders: string[];
  grid: CellValue[][];
  targets: ExerciseTarget[];
  formulasToLearn: string[];
};

type ExcelQuestion = { id: string; question: string; options: string[] };
type ExcelCorrection = ExcelQuestion & { userIndex: number; correctIndex: number; isCorrect: boolean; explanation: string };

// ─── normalizeFormula : uppercase hors des strings ────────────────────────────

function normalizeFormula(s: string): string {
  let result = '', inStr = false;
  for (const ch of s) {
    if (ch === '"') { inStr = !inStr; result += ch; }
    else result += inStr ? ch : ch.toUpperCase();
  }
  return result;
}

// ─── rangeToArray : toutes les valeurs (null compris) ────────────────────────

function rangeToArray(cellMap: Record<string, CellValue>, range: string): CellValue[] {
  const parts = range.toUpperCase().split(':');
  if (parts.length !== 2) return [];
  const [s, e] = parts;
  const sc = s.charCodeAt(0) - 65, sr = parseInt(s.slice(1)) - 1;
  const ec = e.charCodeAt(0) - 65, er = parseInt(e.slice(1)) - 1;
  const vals: CellValue[] = [];
  for (let r = sr; r <= er; r++)
    for (let c = sc; c <= ec; c++)
      vals.push(cellMap[`${String.fromCharCode(65 + c)}${r + 1}`] ?? null);
  return vals;
}

// ─── extractFuncArgs ─────────────────────────────────────────────────────────

function extractFuncArgs(inner: string): string[] {
  let depth = 0, inStr = false;
  const args: string[] = [];
  let cur = '';
  for (const ch of inner) {
    if (ch === '"') { inStr = !inStr; cur += ch; continue; }
    if (!inStr) {
      if (ch === '(') { depth++; cur += ch; continue; }
      if (ch === ')') { if (depth === 0) { args.push(cur.trim()); break; } depth--; cur += ch; continue; }
      if (ch === ',' && depth === 0) { args.push(cur.trim()); cur = ''; continue; }
    }
    cur += ch;
  }
  return args;
}

// ─── evalFormula ─────────────────────────────────────────────────────────────

function evalFormula(formula: string, cellMap: Record<string, CellValue>): string | number {
  if (!formula || !formula.startsWith('=')) {
    const n = parseFloat(String(formula ?? ''));
    return isNaN(n) ? String(formula ?? '') : n;
  }

  // Normalise les noms de fonctions en majuscule, préserve les strings
  let expr = normalizeFormula(formula.slice(1)).trim();

  // Prétraitement des pourcentages : 5% → (5/100)
  expr = expr.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

  const toNum = (v: CellValue): number => {
    if (v === null || v === undefined) return 0;
    return typeof v === 'number' ? v : (parseFloat(String(v)) || 0);
  };
  const cv = (ref: string): number => toNum(cellMap[ref.replace(/\$/g, '')]);
  const rvNums = (range: string): number[] =>
    rangeToArray(cellMap, range)
      .filter(v => v !== null && !isNaN(parseFloat(String(v))))
      .map(v => parseFloat(String(v)));

  // SUM
  expr = expr.replace(/SUM\(([A-Z]\d+:[A-Z]\d+)\)/g, (_, r) =>
    String(rvNums(r).reduce((a, b) => a + b, 0)));

  // AVERAGE
  expr = expr.replace(/AVERAGE\(([A-Z]\d+:[A-Z]\d+)\)/g, (_, r) => {
    const v = rvNums(r);
    return String(v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0);
  });

  // MAX / MIN
  expr = expr.replace(/MAX\(([A-Z]\d+:[A-Z]\d+)\)/g, (_, r) => {
    const v = rvNums(r); return String(v.length ? Math.max(...v) : 0);
  });
  expr = expr.replace(/MIN\(([A-Z]\d+:[A-Z]\d+)\)/g, (_, r) => {
    const v = rvNums(r); return String(v.length ? Math.min(...v) : 0);
  });

  // COUNT / COUNTA
  expr = expr.replace(/COUNTA?\(([A-Z]\d+:[A-Z]\d+)\)/g, (_, r) => String(rvNums(r).length));

  // ROUND — évalue le 1er argument comme expression arithmétique
  expr = expr.replace(/ROUND\(([^,]+),(\d+)\)/g, (_, val, dec) => {
    let n = parseFloat(val);
    if (isNaN(n)) {
      try {
        if (/^[\d\s+\-*/.()]+$/.test(val.replace(/\s/g, '')))
          n = new Function(`"use strict"; return (${val})`)() as number;
      } catch { /* ignore */ }
    }
    if (isNaN(n)) return val;
    const f = Math.pow(10, parseInt(dec));
    return String(Math.round(n * f) / f);
  });

  // COUNTIF(range, "critère") — supporte texte ET numérique
  expr = expr.replace(/COUNTIF\(([A-Z]\d+:[A-Z]\d+),"([^"]*)"\)/g, (_, range, crit) => {
    const arr = rangeToArray(cellMap, range);
    const m = crit.match(/^(>=|<=|<>|>|<|=)?(.+)$/);
    const [, op = '', val] = m ?? ['', '', crit];
    const n = parseFloat(val);
    let count = 0;
    arr.forEach(v => {
      if (v === null) return;
      if (!isNaN(n) && op) {
        const num = toNum(v);
        const ok = op === '>=' ? num >= n : op === '<=' ? num <= n : op === '>' ? num > n
          : op === '<' ? num < n : op === '<>' ? num !== n : num === n;
        if (ok) count++;
      } else {
        if (String(v).trim() === val.trim()) count++;
      }
    });
    return String(count);
  });

  // SUMIF(condRange, "critère", sumRange) — supporte texte ET numérique
  expr = expr.replace(/SUMIF\(([A-Z]\d+:[A-Z]\d+),"([^"]*)",([A-Z]\d+:[A-Z]\d+)\)/g, (_, condRange, crit, sumRange) => {
    const condArr = rangeToArray(cellMap, condRange);
    const sumArr = rangeToArray(cellMap, sumRange);
    const m = crit.match(/^(>=|<=|<>|>|<|=)?(.+)$/);
    const [, op = '', val] = m ?? ['', '', crit];
    const n = parseFloat(val);
    let total = 0;
    condArr.forEach((condV, i) => {
      if (condV === null) return;
      let pass = false;
      if (!isNaN(n) && op) {
        const num = toNum(condV);
        pass = op === '>=' ? num >= n : op === '<=' ? num <= n : op === '>' ? num > n
          : op === '<' ? num < n : op === '<>' ? num !== n : num === n;
      } else {
        pass = String(condV).trim() === val.trim();
      }
      if (pass) total += toNum(sumArr[i] ?? null);
    });
    return String(total);
  });

  // IF(condition, vraiVal, fauxVal) — branches évaluées comme expressions
  if (expr.startsWith('IF(')) {
    const args = extractFuncArgs(expr.slice(3));
    if (args.length >= 3) {
      const [cond, tv, fv] = args;
      const condResolved = cond.replace(/\$?([A-Z])\$?(\d+)/g, (_, col, row) => String(cv(col + row)));
      let condResult = false;
      try { condResult = !!new Function(`"use strict"; return !!(${condResolved})`)(); } catch { /* ignore */ }
      const branch = (condResult ? tv : fv).trim();
      // Valeur littérale string
      if (branch.startsWith('"') && branch.endsWith('"')) return branch.slice(1, -1);
      // Expression : résoudre les refs puis évaluer
      const branchResolved = branch.replace(/\$?([A-Z])\$?(\d+)/g, (_, col, row) => String(cv(col + row)));
      const nDirect = parseFloat(branchResolved);
      if (!isNaN(nDirect) && /^-?[\d.]/.test(branchResolved.trim())) return nDirect;
      try {
        if (/^[\d\s+\-*/.()]+$/.test(branchResolved.replace(/\s/g, ''))) {
          const val = new Function(`"use strict"; return (${branchResolved})`)() as number;
          return typeof val === 'number' ? Math.round(val * 10000) / 10000 : val;
        }
      } catch { /* ignore */ }
      return branchResolved || '#ERREUR!';
    }
  }

  // Références cellules standalone
  expr = expr.replace(/\$?([A-Z])\$?(\d+)/g, (_, col, row) => String(cv(col + row)));

  // Évaluation arithmétique finale
  try {
    if (/^[\d\s+\-*/.()]+$/.test(expr.replace(/\s/g, ''))) {
      const result = new Function(`"use strict"; return (${expr})`)() as number;
      return typeof result === 'number' ? Math.round(result * 10000) / 10000 : result;
    }
  } catch { /* ignore */ }
  return expr === '' ? 0 : expr;
}

// ─── buildCellMap : TOUTES les cellules + multi-passes ───────────────────────

function buildCellMap(
  exercise: ExerciseDef,
  exIdx: number,
  inputs: Record<string, string>,
): Record<string, CellValue> {
  const map: Record<string, CellValue> = {};

  // 1. Valeurs statiques de la grille
  exercise.grid.forEach((row, ri) =>
    row.forEach((val, ci) => {
      if (val !== null) map[`${exercise.colLetters[ci]}${ri + 1}`] = val;
    }),
  );

  // 2. Valeurs non-formule saisies par l'utilisateur (override statique)
  Object.entries(inputs).forEach(([key, input]) => {
    if (!key.startsWith(`${exIdx}_`) || !input || input.startsWith('=')) return;
    const ref = key.slice(`${exIdx}_`.length);
    const n = parseFloat(input);
    map[ref] = isNaN(n) ? input : n;
  });

  // 3. Formules — 3 passes pour gérer les dépendances chaînées (ex: D7=SUM(D1:D6))
  for (let pass = 0; pass < 3; pass++) {
    Object.entries(inputs).forEach(([key, input]) => {
      if (!key.startsWith(`${exIdx}_`) || !input || !input.startsWith('=')) return;
      const ref = key.slice(`${exIdx}_`.length);
      map[ref] = evalFormula(input, map);
    });
  }
  return map;
}

// ─── isCorrect ────────────────────────────────────────────────────────────────

function isCorrect(computed: CellValue, expected: string | number, tol = 0.01): boolean {
  if (computed === null || computed === undefined) return false;
  if (typeof expected === 'string') {
    return typeof computed === 'string' &&
      computed.toLowerCase().trim() === expected.toLowerCase().trim();
  }
  const c = typeof computed === 'number' ? computed : parseFloat(String(computed));
  return !isNaN(c) && Math.abs(c - expected) <= tol;
}

// ─── 8 Exercices statiques (conservés comme référence documentaire) ──────────
// La logique active utilise generateExercises() qui randomise les valeurs.

const _EXERCISES_REF: ExerciseDef[] = [
  {
    id: 'sum_budget',
    title: 'Budget mensuel',
    subtitle: 'Fonction : SUM',
    description: 'Calcule le total des dépenses mensuelles avec la fonction SUM.',
    goal: 'Remplis C7 avec une formule qui additionne tous les montants (C1:C6).',
    hint: 'Syntaxe : =SUM(première:dernière). Les deux-points définissent une plage continue.',
    colLetters: ['A', 'B', 'C'],
    colHeaders: ['N°', 'Catégorie', 'Montant (€)'],
    grid: [
      ['1', 'Loyer',        1200],
      ['2', 'Alimentation',  450],
      ['3', 'Transport',     120],
      ['4', 'Loisirs',       200],
      ['5', 'Épargne',       300],
      ['6', 'Divers',         80],
      ['',  'TOTAL',         null],
    ],
    targets: [{ ref: 'C7', expected: 2350, formulaExample: '=SUM(C1:C6)', description: 'Total des dépenses' }],
    formulasToLearn: ['=SUM(C1:C6)'],
  },
  {
    id: 'sum_ventes',
    title: 'Ventes trimestrielles',
    subtitle: 'Fonctions : SUM (lignes) + AVERAGE',
    description: 'Calcule le total annuel de chaque vendeur, puis la moyenne des totaux.',
    goal: 'Remplis F1:F5 (totaux par vendeur) puis F6 (moyenne des totaux).',
    hint: '=SUM(B1:E1) additionne les 4 trimestres d\'une ligne. Reproduis pour chaque ligne puis AVERAGE.',
    colLetters: ['A', 'B', 'C', 'D', 'E', 'F'],
    colHeaders: ['Vendeur', 'T1', 'T2', 'T3', 'T4', 'Total annuel'],
    grid: [
      ['Alice',   45000, 52000, 48000, 61000, null],
      ['Bob',     38000, 41000, 55000, 49000, null],
      ['Clara',   62000, 58000, 71000, 66000, null],
      ['David',   29000, 35000, 31000, 42000, null],
      ['Eva',     51000, 47000, 59000, 54000, null],
      ['MOYENNE', null,  null,  null,  null,  null],
    ],
    targets: [
      { ref: 'F1', expected: 206000, formulaExample: '=SUM(B1:E1)', description: 'Total Alice' },
      { ref: 'F2', expected: 183000, formulaExample: '=SUM(B2:E2)', description: 'Total Bob' },
      { ref: 'F3', expected: 257000, formulaExample: '=SUM(B3:E3)', description: 'Total Clara' },
      { ref: 'F4', expected: 137000, formulaExample: '=SUM(B4:E4)', description: 'Total David' },
      { ref: 'F5', expected: 211000, formulaExample: '=SUM(B5:E5)', description: 'Total Eva' },
      { ref: 'F6', expected: 198800, formulaExample: '=AVERAGE(F1:F5)', description: 'Moyenne des totaux' },
    ],
    formulasToLearn: ['=SUM(B1:E1)', '=AVERAGE(F1:F5)'],
  },
  {
    id: 'if_stock',
    title: 'Gestion des stocks',
    subtitle: 'Fonction : IF (SI)',
    description: 'Identifie automatiquement les produits sous leur seuil de réapprovisionnement.',
    goal: 'Colonne D : "Réappro" si stock (B) < seuil (C), "OK" sinon.',
    hint: 'Syntaxe : =IF(condition,"valeur_vrai","valeur_faux"). Compare B et C avec l\'opérateur <.',
    colLetters: ['A', 'B', 'C', 'D'],
    colHeaders: ['Produit', 'Stock', 'Seuil', 'Statut'],
    grid: [
      ['Écran 24"', 12, 15, null],
      ['Clavier',   45, 20, null],
      ['Souris',     8, 10, null],
      ['Casque',    23, 25, null],
      ['Webcam',     3, 15, null],
    ],
    targets: [
      { ref: 'D1', expected: 'Réappro', formulaExample: '=IF(B1<C1,"Réappro","OK")', description: 'Statut Écran' },
      { ref: 'D2', expected: 'OK',      formulaExample: '=IF(B2<C2,"Réappro","OK")', description: 'Statut Clavier' },
      { ref: 'D3', expected: 'Réappro', formulaExample: '=IF(B3<C3,"Réappro","OK")', description: 'Statut Souris' },
      { ref: 'D4', expected: 'Réappro', formulaExample: '=IF(B4<C4,"Réappro","OK")', description: 'Statut Casque' },
      { ref: 'D5', expected: 'Réappro', formulaExample: '=IF(B5<C5,"Réappro","OK")', description: 'Statut Webcam' },
    ],
    formulasToLearn: ['=IF(B1<C1,"Réappro","OK")'],
  },
  {
    id: 'stats_notes',
    title: 'Analyse des notes',
    subtitle: 'Fonctions : AVERAGE, MAX, COUNTIF',
    description: 'Calcule les statistiques d\'une classe : moyenne, meilleure note, nombre d\'admis.',
    goal: 'Remplis B10 (moyenne), B11 (max), B12 (nb d\'élèves avec note ≥ 10).',
    hint: 'AVERAGE pour la moyenne, MAX pour le max, COUNTIF avec critère ">=10" pour les admis.',
    colLetters: ['A', 'B'],
    colHeaders: ['Étudiant', 'Note /20'],
    grid: [
      ['Alice',  14],
      ['Bob',     8],
      ['Clara',  17],
      ['David',  11],
      ['Eva',     9],
      ['Frank',  15],
      ['Grace',  12],
      ['Hugo',    6],
      ['———', '———'],
      ['Moyenne classe',    null],
      ['Note maximale',     null],
      ['Admis (note ≥ 10)', null],
    ],
    targets: [
      { ref: 'B10', expected: 11.5, tolerance: 0.05, formulaExample: '=AVERAGE(B1:B8)', description: 'Moyenne de la classe' },
      { ref: 'B11', expected: 17,                    formulaExample: '=MAX(B1:B8)',             description: 'Meilleure note' },
      { ref: 'B12', expected: 5,                     formulaExample: '=COUNTIF(B1:B8,">=10")', description: 'Nombre d\'admis' },
    ],
    formulasToLearn: ['=AVERAGE(B1:B8)', '=MAX(B1:B8)', '=COUNTIF(B1:B8,">=10")'],
  },
  {
    id: 'sumif_depenses',
    title: 'Dépenses par catégorie',
    subtitle: 'Fonction : SUMIF',
    description: 'Calcule le total des dépenses par catégorie en une seule formule conditionnelle.',
    goal: 'Remplis C12, C13 et C14 avec le total par catégorie (Alimentation, Transport, Loisirs).',
    hint: 'Syntaxe : =SUMIF(plage_cond,"critère",plage_somme). La cond = col B (catégories), la somme = col C.',
    colLetters: ['A', 'B', 'C'],
    colHeaders: ['Dépense', 'Catégorie', 'Montant (€)'],
    grid: [
      ['Courses',     'Alimentation',  65],
      ['Métro',       'Transport',     42],
      ['Restaurant',  'Alimentation',  38],
      ['Uber',        'Transport',     28],
      ['Cinéma',      'Loisirs',       15],
      ['Supermarché', 'Alimentation',  92],
      ['Train',       'Transport',     55],
      ['Concert',     'Loisirs',       45],
      ['Épicerie',    'Alimentation',  34],
      ['Bowling',     'Loisirs',       22],
      ['——',          'TOTAL / CAT.',  '——'],
      ['',            'Alimentation',  null],
      ['',            'Transport',     null],
      ['',            'Loisirs',       null],
    ],
    targets: [
      { ref: 'C12', expected: 229, formulaExample: '=SUMIF(B1:B10,"Alimentation",C1:C10)', description: 'Total Alimentation' },
      { ref: 'C13', expected: 125, formulaExample: '=SUMIF(B1:B10,"Transport",C1:C10)',    description: 'Total Transport' },
      { ref: 'C14', expected: 82,  formulaExample: '=SUMIF(B1:B10,"Loisirs",C1:C10)',      description: 'Total Loisirs' },
    ],
    formulasToLearn: ['=SUMIF(plage_cond,"critère",plage_somme)'],
  },
  {
    id: 'stats_prix',
    title: 'Catalogue produits',
    subtitle: 'Fonctions : MIN, MAX, AVERAGE, ROUND',
    description: 'Analyse statistique d\'un catalogue : prix min, max, moyenne et moyenne arrondie.',
    goal: 'Remplis B10 (min), B11 (max), B12 (moyenne), B13 (moyenne arrondie à 0 décimale).',
    hint: 'Pour B13 : =ROUND(AVERAGE(B1:B8),0) ou =ROUND(B12,0) si B12 est déjà rempli.',
    colLetters: ['A', 'B'],
    colHeaders: ['Produit', 'Prix (€)'],
    grid: [
      ['Laptop',    1299],
      ['Téléphone',  699],
      ['Tablette',   449],
      ['Écran',      299],
      ['Clavier',     89],
      ['Souris',      45],
      ['Casque',     199],
      ['Webcam',      79],
      ['———',        '———'],
      ['Prix minimum',       null],
      ['Prix maximum',       null],
      ['Prix moyen',         null],
      ['Prix moyen arrondi', null],
    ],
    targets: [
      { ref: 'B10', expected: 45,     formulaExample: '=MIN(B1:B8)',              description: 'Prix le plus bas' },
      { ref: 'B11', expected: 1299,   formulaExample: '=MAX(B1:B8)',              description: 'Prix le plus haut' },
      { ref: 'B12', expected: 394.75, tolerance: 0.1, formulaExample: '=AVERAGE(B1:B8)', description: 'Moyenne des prix' },
      { ref: 'B13', expected: 395,    formulaExample: '=ROUND(AVERAGE(B1:B8),0)', description: 'Moyenne arrondie' },
    ],
    formulasToLearn: ['=MIN(B1:B8)', '=MAX(B1:B8)', '=AVERAGE(B1:B8)', '=ROUND(AVERAGE(B1:B8),0)'],
  },
  {
    id: 'countif_rh',
    title: 'Tableau RH — COUNTIF texte',
    subtitle: 'Fonction : COUNTIF sur chaînes de caractères',
    description: 'Compte les effectifs par département et le nombre d\'employés actifs.',
    goal: 'Remplis C12 (nb Marketing), C13 (nb RH), C14 (nb Informatique), C15 (nb Actifs).',
    hint: 'COUNTIF fonctionne sur du texte : =COUNTIF(B1:B10,"Marketing") compte les cellules égales à "Marketing".',
    colLetters: ['A', 'B', 'C'],
    colHeaders: ['Employé', 'Département', 'Statut'],
    grid: [
      ['Alice',    'Marketing',    'Actif'],
      ['Bob',      'RH',           'Actif'],
      ['Clara',    'Informatique', 'Inactif'],
      ['David',    'Marketing',    'Actif'],
      ['Eva',      'RH',           'Actif'],
      ['Frank',    'Informatique', 'Actif'],
      ['Grace',    'Marketing',    'Inactif'],
      ['Hugo',     'RH',           'Actif'],
      ['Isabelle', 'Informatique', 'Actif'],
      ['Jean',     'Marketing',    'Actif'],
      ['——',       'EFFECTIFS',    '——'],
      ['',         'Marketing',    null],
      ['',         'RH',           null],
      ['',         'Informatique', null],
      ['Total Actifs', '',         null],
    ],
    targets: [
      { ref: 'C12', expected: 4, formulaExample: '=COUNTIF(B1:B10,"Marketing")',    description: 'Nb Marketing' },
      { ref: 'C13', expected: 3, formulaExample: '=COUNTIF(B1:B10,"RH")',           description: 'Nb RH' },
      { ref: 'C14', expected: 3, formulaExample: '=COUNTIF(B1:B10,"Informatique")', description: 'Nb Informatique' },
      { ref: 'C15', expected: 8, formulaExample: '=COUNTIF(C1:C10,"Actif")',        description: 'Nb employés actifs' },
    ],
    formulasToLearn: ['=COUNTIF(B1:B10,"Marketing")', '=COUNTIF(C1:C10,"Actif")'],
  },
  {
    id: 'if_commissions',
    title: 'Commissions commerciales',
    subtitle: 'Fonctions : IF (calcul) + SUM',
    description: 'Calcule la commission de chaque vendeur : 5% si objectif atteint, 3% sinon, puis le total.',
    goal: 'Remplis D1:D6 (commission par vendeur) puis D7 (total des commissions).',
    hint: 'Syntaxe : =IF(C1>=B1,C1*5%,C1*3%). Pour D7 : =SUM(D1:D6) une fois les commissions saisies.',
    colLetters: ['A', 'B', 'C', 'D'],
    colHeaders: ['Vendeur', 'Objectif', 'CA Réalisé', 'Commission'],
    grid: [
      ['Alice', 50000, 58000, null],
      ['Bob',   45000, 41000, null],
      ['Clara', 60000, 72000, null],
      ['David', 40000, 38000, null],
      ['Eva',   55000, 61000, null],
      ['Frank', 50000, 49000, null],
      ['TOTAL', '',    '',    null],
    ],
    targets: [
      { ref: 'D1', expected: 2900,  formulaExample: '=IF(C1>=B1,C1*5%,C1*3%)', description: 'Commission Alice' },
      { ref: 'D2', expected: 1230,  formulaExample: '=IF(C2>=B2,C2*5%,C2*3%)', description: 'Commission Bob' },
      { ref: 'D3', expected: 3600,  formulaExample: '=IF(C3>=B3,C3*5%,C3*3%)', description: 'Commission Clara' },
      { ref: 'D4', expected: 1140,  formulaExample: '=IF(C4>=B4,C4*5%,C4*3%)', description: 'Commission David' },
      { ref: 'D5', expected: 3050,  formulaExample: '=IF(C5>=B5,C5*5%,C5*3%)', description: 'Commission Eva' },
      { ref: 'D6', expected: 1470,  formulaExample: '=IF(C6>=B6,C6*5%,C6*3%)', description: 'Commission Frank' },
      { ref: 'D7', expected: 13390, formulaExample: '=SUM(D1:D6)',              description: 'Total commissions' },
    ],
    formulasToLearn: ['=IF(C1>=B1,C1*5%,C1*3%)', '=SUM(D1:D6)'],
  },
];

// ─── Guide des fonctions ──────────────────────────────────────────────────────

const FORMULA_GUIDE: Record<string, { syntax: string; desc: string; tip: string }> = {
  SUM:     { syntax: '=SUM(plage)',                            desc: 'Additionne toutes les valeurs d\'une plage de cellules.',                             tip: 'Plage = première cellule : dernière cellule, ex: C1:C6' },
  AVERAGE: { syntax: '=AVERAGE(plage)',                        desc: 'Calcule la moyenne arithmétique d\'une plage (somme ÷ nombre de valeurs).',           tip: 'Ignore les cellules vides, pas les zéros' },
  MAX:     { syntax: '=MAX(plage)',                            desc: 'Retourne la valeur la plus élevée d\'une plage.',                                    tip: 'Utile pour trouver la note la plus haute, le prix max...' },
  MIN:     { syntax: '=MIN(plage)',                            desc: 'Retourne la valeur la plus basse d\'une plage.',                                     tip: 'Même logique que MAX, mais pour le minimum' },
  IF:      { syntax: '=IF(condition, si_vrai, si_faux)',       desc: 'Évalue une condition et retourne une valeur différente selon vrai/faux.',            tip: 'Les textes doivent être entre guillemets : "OK", "Réappro"' },
  COUNTIF: { syntax: '=COUNTIF(plage, "critère")',             desc: 'Compte le nombre de cellules qui correspondent au critère (texte ou nombre).',       tip: 'Critère numérique : ">=10", "=5" — texte : "Marketing"' },
  SUMIF:   { syntax: '=SUMIF(plage_cond, "critère", plage_somme)', desc: 'Additionne les cellules de plage_somme uniquement là où plage_cond = critère.', tip: 'plage_cond et plage_somme doivent avoir la même taille' },
  ROUND:   { syntax: '=ROUND(nombre, décimales)',              desc: 'Arrondit un nombre au nombre de décimales indiqué (0 = entier).',                    tip: '=ROUND(AVERAGE(...),0) calcule et arrondit en une seule formule' },
};

// ─── Générateur d'exercices aléatoires ───────────────────────────────────────

function generateExercises(): ExerciseDef[] {
  const ri = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
  const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;
  const roundN = (n: number, d: number) => Math.round(n * Math.pow(10, d)) / Math.pow(10, d);

  // ── Ex 1 : Budget mensuel (SUM) ───────────────────────────────────────────
  const BUDGET_CATS = ['Loyer', 'Alimentation', 'Transport', 'Loisirs', 'Épargne', 'Divers'];
  const BUDGET_RANGES: [number, number][] = [[700,1600],[250,650],[60,250],[80,400],[100,600],[20,180]];
  const budgetAmts = BUDGET_RANGES.map(([a, b]) => ri(a, b));
  const budgetTotal = budgetAmts.reduce((s, v) => s + v, 0);

  // ── Ex 2 : Ventes trimestrielles (SUM + AVERAGE) ──────────────────────────
  const VENDORS = ['Alice','Bob','Clara','David','Eva'];
  const vendorSales = VENDORS.map(name => {
    const q = [ri(25,80)*1000, ri(25,80)*1000, ri(25,80)*1000, ri(25,80)*1000];
    return { name, q, total: q.reduce((s, v) => s + v, 0) };
  });
  const vendorTotals = vendorSales.map(v => v.total);
  const vendorAvg = roundN(avg(vendorTotals), 2);

  // ── Ex 3 : Gestion des stocks (IF) ────────────────────────────────────────
  const STOCK_PRODUCTS = ['Écran 24"','Clavier','Souris','Casque','Webcam'];
  const stockData = STOCK_PRODUCTS.map((name, i) => {
    const threshold = ri(10, 30);
    const stock = i < 3 ? ri(1, threshold - 1) : ri(threshold, threshold + 15);
    return { name, stock, threshold, status: stock < threshold ? 'Réappro' : 'OK' };
  });

  // ── Ex 4 : Analyse des notes (AVERAGE + MAX + COUNTIF) ───────────────────
  const NOTE_STUDENTS = ['Alice','Bob','Clara','David','Eva','Frank','Grace','Hugo'];
  const notes = NOTE_STUDENTS.map(() => ri(4, 20));
  const notesAvg = roundN(avg(notes), 1);
  const notesMax = Math.max(...notes);
  const notesAbove10 = notes.filter(n => n >= 10).length;

  // ── Ex 5 : Dépenses par catégorie (SUMIF) ────────────────────────────────
  const CAT_ITEMS: [string, string, [number, number]][] = [
    ['Courses','Alimentation',[40,100]], ['Métro','Transport',[20,60]],
    ['Restaurant','Alimentation',[25,80]], ['Uber','Transport',[15,50]],
    ['Cinéma','Loisirs',[10,30]], ['Supermarché','Alimentation',[60,130]],
    ['Train','Transport',[30,90]], ['Concert','Loisirs',[25,70]],
    ['Épicerie','Alimentation',[20,60]], ['Bowling','Loisirs',[10,35]],
  ];
  const catAmts = CAT_ITEMS.map(([,,[a,b]]) => ri(a, b));
  const sumAlim = CAT_ITEMS.reduce((s, [,cat], i) => cat === 'Alimentation' ? s + catAmts[i] : s, 0);
  const sumTransp = CAT_ITEMS.reduce((s, [,cat], i) => cat === 'Transport' ? s + catAmts[i] : s, 0);
  const sumLoisirs = CAT_ITEMS.reduce((s, [,cat], i) => cat === 'Loisirs' ? s + catAmts[i] : s, 0);

  // ── Ex 6 : Catalogue produits (MIN + MAX + AVERAGE + ROUND) ──────────────
  const PRODUCT_NAMES = ['Laptop','Téléphone','Tablette','Écran','Clavier','Souris','Casque','Webcam'];
  const PRICE_RANGES: [number, number][] = [[900,1800],[400,900],[250,600],[150,400],[50,150],[25,80],[80,300],[40,120]];
  const prices = PRICE_RANGES.map(([a, b]) => ri(a, b));
  const priceMin = Math.min(...prices);
  const priceMax = Math.max(...prices);
  const priceAvg = roundN(avg(prices), 2);
  const priceAvgRounded = Math.round(priceAvg);

  // ── Ex 7 : Tableau RH COUNTIF texte ──────────────────────────────────────
  const EMP_NAMES = ['Alice','Bob','Clara','David','Eva','Frank','Grace','Hugo','Isabelle','Jean'];
  const HR_DEPTS = ['Marketing','RH','Informatique'];
  const empDepts = EMP_NAMES.map((_, i) => {
    if (i < 2) return 'Marketing';
    if (i < 4) return 'RH';
    if (i < 6) return 'Informatique';
    return HR_DEPTS[ri(0, 2)];
  });
  const empStatuses = EMP_NAMES.map(() => Math.random() < 0.75 ? 'Actif' : 'Inactif');
  const cntMarketing = empDepts.filter(d => d === 'Marketing').length;
  const cntRH = empDepts.filter(d => d === 'RH').length;
  const cntInfo = empDepts.filter(d => d === 'Informatique').length;
  const cntActifs = empStatuses.filter(s => s === 'Actif').length;

  // ── Ex 8 : Commissions (IF + SUM) ────────────────────────────────────────
  const SALES_NAMES = ['Alice','Bob','Clara','David','Eva','Frank'];
  const salesData = SALES_NAMES.map((name, i) => {
    const obj = ri(35, 70) * 1000;
    const ca = i % 2 === 0
      ? (ri(1, 4) * 1000 + obj)   // au-dessus objectif
      : (obj - ri(1, 4) * 1000);  // en-dessous objectif
    const comm = ca >= obj ? ca * 0.05 : ca * 0.03;
    return { name, obj, ca, comm };
  });
  const totalComm = salesData.reduce((s, r) => s + r.comm, 0);

  return [
    {
      id: 'sum_budget', title: 'Budget mensuel', subtitle: 'Fonction : SUM',
      description: 'Calcule le total des dépenses mensuelles avec la fonction SUM.',
      goal: 'Remplis C7 avec une formule qui additionne tous les montants (C1:C6).',
      hint: 'Syntaxe : =SUM(première:dernière). Les deux-points définissent une plage continue.',
      colLetters: ['A','B','C'], colHeaders: ['N°','Catégorie','Montant (€)'],
      grid: [...BUDGET_CATS.map((cat, i) => [String(i + 1), cat, budgetAmts[i]] as CellValue[]), ['','TOTAL',null]],
      targets: [{ ref:'C7', expected: budgetTotal, formulaExample:'=SUM(C1:C6)', description:'Total des dépenses' }],
      formulasToLearn: ['=SUM(C1:C6)'],
    },
    {
      id: 'sum_ventes', title: 'Ventes trimestrielles', subtitle: 'Fonctions : SUM (lignes) + AVERAGE',
      description: 'Calcule le total annuel de chaque vendeur, puis la moyenne des totaux.',
      goal: 'Remplis F1:F5 (totaux par vendeur) puis F6 (moyenne des totaux).',
      hint: '=SUM(B1:E1) additionne les 4 trimestres d\'une ligne. Reproduis pour chaque ligne puis AVERAGE.',
      colLetters: ['A','B','C','D','E','F'], colHeaders: ['Vendeur','T1','T2','T3','T4','Total annuel'],
      grid: [...vendorSales.map(v => [v.name, v.q[0], v.q[1], v.q[2], v.q[3], null] as CellValue[]), ['MOYENNE',null,null,null,null,null]],
      targets: [
        ...vendorSales.map((v, i) => ({ ref:`F${i+1}`, expected: v.total, formulaExample:`=SUM(B${i+1}:E${i+1})`, description:`Total ${v.name}` })),
        { ref:'F6', expected: vendorAvg, tolerance: 1, formulaExample:'=AVERAGE(F1:F5)', description:'Moyenne des totaux' },
      ],
      formulasToLearn: ['=SUM(B1:E1)', '=AVERAGE(F1:F5)'],
    },
    {
      id: 'if_stock', title: 'Gestion des stocks', subtitle: 'Fonction : IF (SI)',
      description: 'Identifie automatiquement les produits sous leur seuil de réapprovisionnement.',
      goal: 'Colonne D : "Réappro" si stock (B) < seuil (C), "OK" sinon.',
      hint: 'Syntaxe : =IF(condition,"valeur_vrai","valeur_faux"). Compare B et C avec l\'opérateur <.',
      colLetters: ['A','B','C','D'], colHeaders: ['Produit','Stock','Seuil','Statut'],
      grid: stockData.map(s => [s.name, s.stock, s.threshold, null] as CellValue[]),
      targets: stockData.map((s, i) => ({ ref:`D${i+1}`, expected: s.status, formulaExample:`=IF(B${i+1}<C${i+1},"Réappro","OK")`, description:`Statut ${s.name}` })),
      formulasToLearn: ['=IF(B1<C1,"Réappro","OK")'],
    },
    {
      id: 'stats_notes', title: 'Analyse des notes', subtitle: 'Fonctions : AVERAGE, MAX, COUNTIF',
      description: 'Calcule les statistiques d\'une classe : moyenne, meilleure note, nombre d\'admis.',
      goal: 'Remplis B10 (moyenne), B11 (max), B12 (nb d\'élèves avec note ≥ 10).',
      hint: 'AVERAGE pour la moyenne, MAX pour le max, COUNTIF avec critère ">=10" pour les admis.',
      colLetters: ['A','B'], colHeaders: ['Étudiant','Note /20'],
      grid: [...NOTE_STUDENTS.map((s, i) => [s, notes[i]] as CellValue[]), ['———','———'], ['Moyenne classe',null], ['Note maximale',null], ['Admis (note ≥ 10)',null]],
      targets: [
        { ref:'B10', expected: notesAvg, tolerance: 0.1, formulaExample:'=AVERAGE(B1:B8)', description:'Moyenne de la classe' },
        { ref:'B11', expected: notesMax, formulaExample:'=MAX(B1:B8)', description:'Meilleure note' },
        { ref:'B12', expected: notesAbove10, formulaExample:'=COUNTIF(B1:B8,">=10")', description:'Nombre d\'admis' },
      ],
      formulasToLearn: ['=AVERAGE(B1:B8)', '=MAX(B1:B8)', '=COUNTIF(B1:B8,">=10")'],
    },
    {
      id: 'sumif_depenses', title: 'Dépenses par catégorie', subtitle: 'Fonction : SUMIF',
      description: 'Calcule le total des dépenses par catégorie en une seule formule conditionnelle.',
      goal: 'Remplis C12, C13 et C14 avec le total par catégorie (Alimentation, Transport, Loisirs).',
      hint: 'Syntaxe : =SUMIF(plage_cond,"critère",plage_somme). La cond = col B, la somme = col C.',
      colLetters: ['A','B','C'], colHeaders: ['Dépense','Catégorie','Montant (€)'],
      grid: [...CAT_ITEMS.map(([label, cat], i) => [label, cat, catAmts[i]] as CellValue[]), ['——','TOTAL / CAT.','——'], ['','Alimentation',null], ['','Transport',null], ['','Loisirs',null]],
      targets: [
        { ref:'C12', expected: sumAlim, formulaExample:'=SUMIF(B1:B10,"Alimentation",C1:C10)', description:'Total Alimentation' },
        { ref:'C13', expected: sumTransp, formulaExample:'=SUMIF(B1:B10,"Transport",C1:C10)', description:'Total Transport' },
        { ref:'C14', expected: sumLoisirs, formulaExample:'=SUMIF(B1:B10,"Loisirs",C1:C10)', description:'Total Loisirs' },
      ],
      formulasToLearn: ['=SUMIF(plage_cond,"critère",plage_somme)'],
    },
    {
      id: 'stats_prix', title: 'Catalogue produits', subtitle: 'Fonctions : MIN, MAX, AVERAGE, ROUND',
      description: 'Analyse statistique d\'un catalogue : prix min, max, moyenne et moyenne arrondie.',
      goal: 'Remplis B10 (min), B11 (max), B12 (moyenne), B13 (moyenne arrondie à 0 décimale).',
      hint: 'Pour B13 : =ROUND(AVERAGE(B1:B8),0) ou =ROUND(B12,0) si B12 est déjà rempli.',
      colLetters: ['A','B'], colHeaders: ['Produit','Prix (€)'],
      grid: [...PRODUCT_NAMES.map((p, i) => [p, prices[i]] as CellValue[]), ['———','———'], ['Prix minimum',null], ['Prix maximum',null], ['Prix moyen',null], ['Prix moyen arrondi',null]],
      targets: [
        { ref:'B10', expected: priceMin, formulaExample:'=MIN(B1:B8)', description:'Prix le plus bas' },
        { ref:'B11', expected: priceMax, formulaExample:'=MAX(B1:B8)', description:'Prix le plus haut' },
        { ref:'B12', expected: priceAvg, tolerance: 0.1, formulaExample:'=AVERAGE(B1:B8)', description:'Moyenne des prix' },
        { ref:'B13', expected: priceAvgRounded, formulaExample:'=ROUND(AVERAGE(B1:B8),0)', description:'Moyenne arrondie' },
      ],
      formulasToLearn: ['=MIN(B1:B8)', '=MAX(B1:B8)', '=AVERAGE(B1:B8)', '=ROUND(AVERAGE(B1:B8),0)'],
    },
    {
      id: 'countif_rh', title: 'Tableau RH — COUNTIF texte', subtitle: 'Fonction : COUNTIF sur chaînes de caractères',
      description: 'Compte les effectifs par département et le nombre d\'employés actifs.',
      goal: 'Remplis C12 (nb Marketing), C13 (nb RH), C14 (nb Informatique), C15 (nb Actifs).',
      hint: 'COUNTIF fonctionne sur du texte : =COUNTIF(B1:B10,"Marketing") compte les cellules égales à "Marketing".',
      colLetters: ['A','B','C'], colHeaders: ['Employé','Département','Statut'],
      grid: [...EMP_NAMES.map((n, i) => [n, empDepts[i], empStatuses[i]] as CellValue[]), ['——','EFFECTIFS','——'], ['','Marketing',null], ['','RH',null], ['','Informatique',null], ['Total Actifs','',null]],
      targets: [
        { ref:'C12', expected: cntMarketing, formulaExample:'=COUNTIF(B1:B10,"Marketing")', description:'Nb Marketing' },
        { ref:'C13', expected: cntRH, formulaExample:'=COUNTIF(B1:B10,"RH")', description:'Nb RH' },
        { ref:'C14', expected: cntInfo, formulaExample:'=COUNTIF(B1:B10,"Informatique")', description:'Nb Informatique' },
        { ref:'C15', expected: cntActifs, formulaExample:'=COUNTIF(C1:C10,"Actif")', description:'Nb employés actifs' },
      ],
      formulasToLearn: ['=COUNTIF(B1:B10,"Marketing")', '=COUNTIF(C1:C10,"Actif")'],
    },
    {
      id: 'if_commissions', title: 'Commissions commerciales', subtitle: 'Fonctions : IF (calcul) + SUM',
      description: 'Calcule la commission de chaque vendeur : 5% si objectif atteint, 3% sinon, puis le total.',
      goal: 'Remplis D1:D6 (commission par vendeur) puis D7 (total des commissions).',
      hint: 'Syntaxe : =IF(C1>=B1,C1*5%,C1*3%). Pour D7 : =SUM(D1:D6) une fois les commissions saisies.',
      colLetters: ['A','B','C','D'], colHeaders: ['Vendeur','Objectif','CA Réalisé','Commission'],
      grid: [...salesData.map(s => [s.name, s.obj, s.ca, null] as CellValue[]), ['TOTAL','','',null]],
      targets: [
        ...salesData.map((s, i) => ({ ref:`D${i+1}`, expected: s.comm, tolerance: 0.01, formulaExample:`=IF(C${i+1}>=B${i+1},C${i+1}*5%,C${i+1}*3%)`, description:`Commission ${s.name}` })),
        { ref:'D7', expected: totalComm, tolerance: 0.1, formulaExample:'=SUM(D1:D6)', description:'Total commissions' },
      ],
      formulasToLearn: ['=IF(C1>=B1,C1*5%,C1*3%)', '=SUM(D1:D6)'],
    },
  ];
}

function getFunctionsUsed(formulasToLearn: string[]): string[] {
  const names = new Set<string>();
  for (const f of formulasToLearn) {
    const matches = f.match(/[A-Z]+(?=\()/g);
    if (matches) matches.forEach(m => names.add(m));
  }
  return [...names];
}

// ─── Frise intro ──────────────────────────────────────────────────────────────

type IntroStep = {
  badge: string; title: string; tagline: string; fact: string;
  color: string; accentBg: string; Icon: React.FC<{ className?: string }>;
  blocks: Array<
    | { kind: 'text'; heading: string; body: string }
    | { kind: 'list'; heading: string; items: string[] }
    | { kind: 'table'; heading: string; rows: Array<{ label: string; value: string; tag?: string }> }
    | { kind: 'code'; heading: string; lines: Array<{ formula: string; comment: string }> }
  >;
};

const EXCEL_INTRO_STEPS: IntroStep[] = [
  {
    badge: 'Origine', title: 'Excel — Le tableur universel',
    tagline: 'Créé en 1985. Encore utilisé par plus d\'un milliard de personnes.',
    fact: 'Excel est installé sur plus de 750 millions d\'ordinateurs dans le monde',
    color: 'text-[#217346]', accentBg: 'bg-[#217346]/5 border-[#217346]/20', Icon: Table2,
    blocks: [
      { kind: 'text', heading: "Qu'est-ce qu'Excel ?", body: "Excel est un tableur développé par Microsoft depuis 1985. Il organise les données en grille de cellules (colonnes A, B, C... × lignes 1, 2, 3...). Chaque cellule peut contenir du texte, un nombre ou une formule. C'est l'outil numéro 1 en entreprise pour les budgets, rapports, analyses et tableaux de bord." },
      { kind: 'list', heading: "Pourquoi apprendre Excel ?", items: ["Présent dans 90% des offres d'emploi en finance, RH, commerce et data", "Automatise les calculs répétitifs — plus de copier-coller manuel", "Permet de visualiser des données avec des graphiques en quelques clics", "Base pour apprendre Power Query, Power BI, VBA et Python pandas"] },
      { kind: 'table', heading: "Excel vs autres outils", rows: [{ label: 'Excel', value: 'Calculs, rapports, petites bases de données, prototypage rapide', tag: 'Ce parcours' }, { label: 'Google Sheets', value: 'Collaboration en temps réel, version cloud gratuite' }, { label: 'Power BI', value: 'Tableaux de bord interactifs sur gros volumes' }, { label: 'Python pandas', value: 'Millions de lignes, automatisation, ML' }] },
    ],
  },
  {
    badge: 'Cellules', title: 'Références et plages de cellules',
    tagline: 'A1, B2:D5, $A$1 — la base de toute formule Excel.',
    fact: 'Une feuille Excel contient 1 048 576 lignes × 16 384 colonnes',
    color: 'text-[#006a9e]', accentBg: 'bg-[#006a9e]/5 border-[#006a9e]/20', Icon: BookOpen,
    blocks: [
      { kind: 'list', heading: "Types de références", items: ["A1 — référence relative : s'adapte quand vous copiez la formule", "A1:A10 — plage : toutes les cellules de A1 à A10", "$A$1 — référence absolue : ne change pas à la copie", "$A1 — colonne fixe, ligne variable", "A$1 — ligne fixe, colonne variable"] },
      { kind: 'code', heading: "Exemples", lines: [{ formula: 'A1', comment: '→ cellule colonne A, ligne 1' }, { formula: 'B3:B10', comment: '→ 8 cellules de B3 à B10' }, { formula: '$C$5', comment: '→ toujours C5 même si vous copiez' }, { formula: 'A1:D5', comment: '→ bloc rectangulaire de 20 cellules' }] },
    ],
  },
  {
    badge: 'Formules', title: 'SUM, AVERAGE, COUNT — les essentielles',
    tagline: 'Ces 5 fonctions couvrent 80% des besoins en calcul.',
    fact: 'Excel propose plus de 400 fonctions intégrées',
    color: 'text-[#dd0061]', accentBg: 'bg-[#dd0061]/5 border-[#dd0061]/20', Icon: FunctionSquare,
    blocks: [
      { kind: 'code', heading: "Les 5 fonctions fondamentales", lines: [{ formula: '=SUM(B2:B10)', comment: 'Additionne toutes les valeurs de B2 à B10' }, { formula: '=AVERAGE(C1:C20)', comment: 'Calcule la moyenne de la plage' }, { formula: '=COUNT(A1:A100)', comment: 'Compte les cellules avec un nombre' }, { formula: '=MAX(D2:D50)', comment: 'Retourne la valeur maximale' }, { formula: '=MIN(D2:D50)', comment: 'Retourne la valeur minimale' }] },
      { kind: 'text', heading: "La règle du =", body: "Toute formule commence obligatoirement par =. Sans lui, Excel traite votre saisie comme du texte brut. Tapez =SUM(B2:B10) et appuyez sur Entrée — le résultat apparaît. La barre de formule affiche toujours la formule originale." },
    ],
  },
  {
    badge: 'Conditions', title: 'IF, COUNTIF, SUMIF — décider avec les données',
    tagline: 'Automatisez les décisions métier directement dans vos cellules.',
    fact: 'IF est la fonction la plus utilisée d\'Excel après SUM',
    color: 'text-[#7c3aed]', accentBg: 'bg-[#7c3aed]/5 border-[#7c3aed]/20', Icon: Zap,
    blocks: [
      { kind: 'code', heading: "Fonctions conditionnelles", lines: [{ formula: '=IF(A1>100,"Élevé","Normal")', comment: 'Si A1>100 → "Élevé", sinon → "Normal"' }, { formula: '=IF(C1>=B1,C1*5%,C1*3%)', comment: 'Branches peuvent être des calculs' }, { formula: '=COUNTIF(A1:A20,"Paris")', comment: 'Compte les cellules égales à "Paris"' }, { formula: '=COUNTIF(B1:B10,">=10")', comment: 'Compte les valeurs ≥ 10' }, { formula: '=SUMIF(A1:A10,"Alice",B1:B10)', comment: 'Somme les B si A = "Alice"' }] },
      { kind: 'list', heading: "Règles IF à retenir", items: ['Structure : =IF(condition, si_vrai, si_faux)', 'Les textes s\'entourent de guillemets : "OK"', 'Opérateurs : > < >= <= = <> (≠)', 'Les branches peuvent être des expressions : C1*5%'] },
    ],
  },
  {
    badge: 'Productivité', title: 'Raccourcis et astuces indispensables',
    tagline: 'Ces gestes réduisent de 50% le temps passé sur Excel.',
    fact: 'Un utilisateur Excel efficace économise en moyenne 2h par semaine',
    color: 'text-[#ea580c]', accentBg: 'bg-[#ea580c]/5 border-[#ea580c]/20', Icon: Code2,
    blocks: [
      { kind: 'table', heading: "Raccourcis clavier essentiels", rows: [{ label: 'Ctrl + C / V', value: 'Copier / Coller (avec la formule)' }, { label: 'Ctrl + Z', value: 'Annuler la dernière action' }, { label: 'F2', value: 'Modifier la cellule sélectionnée (voir la formule)' }, { label: 'Alt + =', value: 'Insérer automatiquement une SUM sur la plage au-dessus' }, { label: 'Ctrl + Shift + L', value: 'Activer / désactiver les filtres automatiques' }] },
      { kind: 'list', heading: "3 astuces de pro", items: ['Nommer vos plages pour écrire =SUM(CA) au lieu de =SUM(B2:B50)', 'Utiliser Ctrl+T pour transformer en Tableau structuré', 'La poignée de recopie copie une formule vers le bas ou la droite'] },
    ],
  },
];

// ─── QCM ─────────────────────────────────────────────────────────────────────

function buildFallbackExcelQuiz(): Array<ExcelQuestion & { correctIndex: number; explanation: string }> {
  return [
    { id: 'eq1', question: 'Quelle formule additionne B2 à B10 ?', options: ['=ADD(B2:B10)', '=SUM(B2:B10)', '=TOTAL(B2,B10)', '=SUM(B2-B10)'], correctIndex: 1, explanation: '=SUM(plage) est la syntaxe standard. Le deux-points : définit une plage continue.' },
    { id: 'eq2', question: 'Que retourne =IF(A1>10,"Grand","Petit") si A1=15 ?', options: ['Grand', 'Petit', '15', '#ERREUR!'], correctIndex: 0, explanation: 'A1=15 > 10 est vrai, IF retourne la première valeur : "Grand".' },
    { id: 'eq3', question: 'Quelle est la différence entre A1 et $A$1 ?', options: ["Aucune, c'est identique", '$A$1 est une référence absolue qui ne change pas à la copie', 'A1 fonctionne uniquement dans SUM', '$A$1 fonctionne uniquement avec IF'], correctIndex: 1, explanation: '$A$1 fixe colonne ET ligne. En copiant, $A$1 pointe toujours vers A1.' },
    { id: 'eq4', question: '=AVERAGE(C1:C5) avec 10, 20, 30, 40, 50 donne :', options: ['30', '150', '25', '35'], correctIndex: 0, explanation: '(10+20+30+40+50)/5 = 30. AVERAGE = somme ÷ nombre de cellules.' },
    { id: 'eq5', question: '=COUNTIF(A1:A5,">=10") compte combien parmi 5, 15, 8, 12, 20 ?', options: ['2', '3', '4', '5'], correctIndex: 1, explanation: '15 ≥ 10 ✓, 12 ≥ 10 ✓, 20 ≥ 10 ✓ → 3 cellules. 5 et 8 exclus.' },
    { id: 'eq6', question: 'Comment figer uniquement la ligne dans une référence ?', options: ['$A1', 'A$1', '$A$1', "Impossible de figer uniquement la ligne"], correctIndex: 1, explanation: 'A$1 fixe la ligne 1, laisse la colonne variable. Utile pour les totaux.' },
    { id: 'eq7', question: 'Quelle fonction retourne la valeur maximale d\'une plage ?', options: ['=MAXIMUM(A1:A10)', '=MAX(A1:A10)', '=HIGH(A1:A10)', '=TOP(A1:A10)'], correctIndex: 1, explanation: '=MAX(plage) retourne la plus haute valeur. Son opposé est =MIN(plage).' },
    { id: 'eq8', question: 'Que signifie #VALEUR! dans une cellule ?', options: ["Le résultat est trop grand", "Une opération mathématique est faite sur du texte", "La formule est vide", "La cellule est protégée"], correctIndex: 1, explanation: '#VALEUR! apparaît quand Excel reçoit un type inattendu, ex: =A1+B1 où B1 = "Paris".' },
  ];
}

// ─── Fiches récap ─────────────────────────────────────────────────────────────

type RecapCard = { title: string; borderColor: string; titleColor: string; bgHeader: string; explanation: string; rules: string[]; example: string };
const EXCEL_RECAP_CARDS: RecapCard[] = [
  { title: 'SUM / AVERAGE / MIN / MAX', borderColor: 'border-[#217346]', titleColor: 'text-[#217346]', bgHeader: 'bg-[#217346]/5', explanation: "Fonctions d'agrégation — résument une plage en un nombre.", rules: ['=SUM(B2:B10) — somme', '=AVERAGE(B2:B10) — moyenne', '=MIN / =MAX — valeur extrême', '=ROUND(AVERAGE(...),0) — moyenne arrondie'], example: '=SUM(B2:B7)\n=AVERAGE(C1:C12)\n=ROUND(AVERAGE(B1:B8),0)' },
  { title: 'IF (SI)', borderColor: 'border-[#7c3aed]', titleColor: 'text-[#7c3aed]', bgHeader: 'bg-[#7c3aed]/5', explanation: "IF évalue une condition et retourne une valeur selon le résultat.", rules: ['=IF(condition, si_vrai, si_faux)', 'Les textes s\'entourent de guillemets : "OK"', 'Branches peuvent être des calculs : C1*5%', 'IF imbriqués : =IF(A>90,"A",IF(A>70,"B","C"))'], example: '=IF(B2<C2,"Réappro","OK")\n=IF(C1>=B1,C1*5%,C1*3%)' },
  { title: 'COUNTIF / SUMIF', borderColor: 'border-[#dd0061]', titleColor: 'text-[#dd0061]', bgHeader: 'bg-[#dd0061]/5', explanation: "Comptent ou additionnent selon une condition.", rules: ['=COUNTIF(plage,"critère") — compte', '=SUMIF(p_cond,"crit",p_somme) — somme cond.', 'Texte : "Marketing" — Numérique : ">=10"', 'Les critères s\'entourent de guillemets'], example: '=COUNTIF(B1:B10,"Marketing")\n=SUMIF(B1:B10,"Alim.",C1:C10)' },
  { title: 'Références absolues ($)', borderColor: 'border-[#006a9e]', titleColor: 'text-[#006a9e]', bgHeader: 'bg-[#006a9e]/5', explanation: "Le $ fige la colonne et/ou la ligne lors d'une copie.", rules: ['A1 — référence relative (s\'adapte)', '$A$1 — absolue (tout figé)', '$A1 — colonne fixe', 'A$1 — ligne fixe', 'Raccourci : F4 ajoute les $'], example: '=B2/$B$10*100\n=SUM($B$2:$B$10)' },
];

// ─── Helpers affichage ────────────────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;
  const inline = (line: string): React.ReactNode =>
    line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} className="font-semibold text-[#061019]">{p.slice(2, -2)}</strong>;
      if (p.startsWith('`') && p.endsWith('`')) return <code key={i} className="font-mono text-[11px] bg-[#217346]/10 text-[#217346] px-1 py-0.5 rounded">{p.slice(1, -1)}</code>;
      return p;
    });
  for (const line of lines) {
    if (/^\*\*[^*]+\*\*$/.test(line.trim()))
      elements.push(<p key={key++} className="font-semibold text-[#217346] mt-3 mb-1 text-sm">{line.trim().slice(2, -2)}</p>);
    else if (line.trim() === '')
      elements.push(<div key={key++} className="h-1" />);
    else
      elements.push(<p key={key++} className="text-sm text-gray-700 leading-relaxed">{inline(line)}</p>);
  }
  return <div className="space-y-0.5">{elements}</div>;
}

function sanitizeCoaching(raw: string): string {
  return String(raw || '')
    .replace(/```[\s\S]*?```/g, '[formule masquée — à toi de l\'écrire]')
    .replace(/(=SUM|=IF|=COUNTIF|=AVERAGE|=MAX|=MIN|=SUMIF|=ROUND)\([^)]+\)/gi, m =>
      m.length > 20 ? '[formule masquée]' : m
    );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function ExcelFormationPage() {
  const [stage, setStage] = useState<Stage>('name');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [introStep, setIntroStep] = useState(0);

  const [questions, setQuestions] = useState<Array<ExcelQuestion & { correctIndex: number; explanation: string }>>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [score, setScore] = useState<number | null>(null);
  const [corrections, setCorrections] = useState<ExcelCorrection[]>([]);

  // Exercices — régénérés à chaque session
  const [exercises, setExercises] = useState<ExerciseDef[]>(() => generateExercises());
  const [exIdx, setExIdx] = useState(0);
  const [cellInputs, setCellInputs] = useState<Record<string, string>>({});
  const [selectedRef, setSelectedRef] = useState<string | null>(null);
  const [solvedExercises, setSolvedExercises] = useState<Set<number>>(new Set());
  const [exercisesCompleted, setExercisesCompleted] = useState(0);

  // Assistant
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [assistantQuestion, setAssistantQuestion] = useState('');

  // Contextes IA des exercices (générés une fois par session)
  const [exerciseContexts, setExerciseContexts] = useState<(ExerciseContext | null)[]>([]);
  const [contextsLoading, setContextsLoading] = useState(false);

  // Summary
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const formulaBarRef = useRef<HTMLInputElement>(null);

  const answeredCount = Object.keys(answers).length;
  const requiredCount = questions.length || 8;
  const exercise = exercises[exIdx];

  const cellMap = useMemo(
    () => buildCellMap(exercise, exIdx, cellInputs),
    [exercise, exIdx, cellInputs],
  );

  const exerciseSolved = useMemo(
    () => exercise.targets.every(t => isCorrect(cellMap[t.ref] ?? null, t.expected, t.tolerance)),
    [exercise, cellMap],
  );

  useEffect(() => {
    if (exerciseSolved && !solvedExercises.has(exIdx)) {
      setSolvedExercises(prev => new Set([...prev, exIdx]));
      setExercisesCompleted(prev => prev + 1);
    }
  }, [exerciseSolved, exIdx, solvedExercises]);

  useEffect(() => { setSelectedRef(null); }, [exIdx]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const startJourney = () => {
    if (!firstName.trim()) { setError('Entre ton prénom pour commencer.'); return; }
    setError('');
    setExercises(generateExercises()); // nouvelles valeurs à chaque session
    setExerciseContexts([]);           // réinitialise les contextes IA
    setQuestions(buildFallbackExcelQuiz());
    setStage('intro');
  };

  const submitQuiz = () => {
    if (answeredCount !== requiredCount) { setError(`Réponds aux ${requiredCount} questions avant de valider.`); return; }
    const corrected: ExcelCorrection[] = questions.map(q => ({
      ...q,
      userIndex: answers[q.id] ?? -1,
      isCorrect: answers[q.id] === q.correctIndex,
    }));
    setScore(corrected.filter(c => c.isCorrect).length);
    setCorrections(corrected);
    setStage('results');
  };

  const goToExercises = async () => {
    setStage('exercises');
    if (exerciseContexts.length > 0) return; // déjà chargé
    setContextsLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; scenarios: ExerciseContext[] }>(
        '/api/formation/excel/scenarios',
        { method: 'POST', body: JSON.stringify({ firstName }) },
      );
      if (res.success && Array.isArray(res.scenarios)) setExerciseContexts(res.scenarios);
    } catch { /* fallback : contextes null */ }
    finally { setContextsLoading(false); }
  };

  const setCellInput = (ref: string, value: string) =>
    setCellInputs(prev => ({ ...prev, [`${exIdx}_${ref}`]: value }));

  const getCellStatus = (ref: string): 'empty' | 'wrong' | 'correct' => {
    const target = exercise.targets.find(t => t.ref === ref);
    if (!target) return 'empty';
    const input = cellInputs[`${exIdx}_${ref}`];
    if (!input) return 'empty';
    return isCorrect(cellMap[ref] ?? null, target.expected, target.tolerance) ? 'correct' : 'wrong';
  };

  const askAssistant = async () => {
    const q = assistantQuestion.trim();
    if (!q) return;
    setAssistantQuestion('');
    setAssistantMessages(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; assistantMessage: string }>(
        '/api/formation/excel/assistant',
        { method: 'POST', body: JSON.stringify({
          sessionId,
          userQuestion: q,
          currentCell: selectedRef ?? '',
          exerciseContext: `${exercise.title} — ${exercise.subtitle} — Mission : ${exercise.goal}`,
        }) },
      );
      setAssistantMessages(prev => [...prev, { role: 'assistant', text: sanitizeCoaching(res.assistantMessage || '') }]);
    } catch {
      setAssistantMessages(prev => [...prev, { role: 'assistant', text: 'Décris ce que tu essaies de calculer et je t\'aiderai.' }]);
    } finally { setLoading(false); }
  };

  const finishSession = async () => {
    setSummaryLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; summary: string }>(
        '/api/formation/excel/summary',
        { method: 'POST', body: JSON.stringify({ sessionId, firstName, exercisesCompleted, score }) },
      );
      setSummaryText(res.summary || `Bravo ${firstName} ! Tu as complété ${exercisesCompleted} exercice(s) Excel.`);
    } catch {
      setSummaryText(`Bravo ${firstName} ! Tu as complété ${exercisesCompleted} exercice(s) Excel. Continue à pratiquer !`);
    } finally { setSummaryLoading(false); setStage('summary'); }
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 text-[#061019]">
      <header className="flex items-center justify-center px-4 py-3 border-b border-gray-200 bg-white">
        <div className="text-sm font-semibold tracking-wide text-[#217346]">FYNE DATA EXCEL</div>
      </header>

      <main className="p-4 md:p-6 lg:p-8">
        {error && <div className="mb-4 border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        {/* ── Nom ── */}
        {stage === 'name' && (
          <div className="min-h-[78vh] grid place-items-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
              <div className="inline-flex items-center gap-2 text-[#217346] text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> IA Excel Coach
              </div>
              <h1 className="mt-3 text-2xl md:text-3xl font-black">Quel est ton prénom ?</h1>
              <p className="mt-2 text-gray-500 text-sm">Parcours Excel : 5 chapitres → QCM → 8 exercices pratiques avec feuilles interactives réelles.</p>
              <div className="mt-6 flex gap-2">
                <input value={firstName} onChange={e => setFirstName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') startJourney(); }}
                  placeholder="Ton prénom"
                  className="flex-1 border border-gray-300 bg-white text-[#061019] px-4 py-3 text-sm outline-none focus:border-[#217346]" />
                <button type="button" onClick={startJourney}
                  className="px-4 py-3 bg-[#217346] text-white font-bold text-sm hover:bg-[#1a5c38]">
                  Commencer
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── Frise intro ── */}
        {stage === 'intro' && (() => {
          const step = EXCEL_INTRO_STEPS[introStep];
          const StepIcon = step.Icon;
          const isLast = introStep === EXCEL_INTRO_STEPS.length - 1;
          return (
            <section className="max-w-4xl mx-auto py-6">
              <div className="mb-8 text-center">
                <span className="text-xs font-semibold text-[#dd0061] uppercase tracking-widest">Avant les exercices</span>
                <h1 className="mt-1 text-2xl font-black text-[#217346]">Les fondamentaux Excel</h1>
                <p className="text-sm text-gray-500 mt-1">5 chapitres — chaque minute compte.</p>
              </div>
              <div className="relative mb-10 px-4">
                <div className="absolute top-5 left-12 right-12 h-0.5 bg-gray-200" />
                <div className="absolute top-5 left-12 h-0.5 bg-[#217346] transition-all duration-500"
                  style={{ width: `calc((100% - 6rem) * ${introStep / (EXCEL_INTRO_STEPS.length - 1)})` }} />
                <div className="relative flex justify-between">
                  {EXCEL_INTRO_STEPS.map((s, i) => {
                    const done = i < introStep, active = i === introStep;
                    return (
                      <button key={i} onClick={() => setIntroStep(i)} className="flex flex-col items-center gap-2 group">
                        <div className={`w-10 h-10 flex items-center justify-center border-2 font-bold text-sm transition-all duration-300 ${done ? 'bg-[#217346] border-[#217346] text-white' : active ? 'bg-white border-[#217346] text-[#217346] shadow-md' : 'bg-white border-gray-200 text-gray-400 group-hover:border-gray-400'}`}>
                          {done ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                        </div>
                        <span className={`text-[10px] font-medium text-center max-w-[70px] leading-tight ${active ? 'text-[#217346]' : done ? 'text-gray-500' : 'text-gray-300'}`}>{s.badge}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <motion.div key={introStep} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                className="border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className={`px-6 py-5 border-b border-gray-100 ${step.accentBg}`}>
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 p-2 bg-white border border-gray-100 shadow-sm">
                      <StepIcon className={`w-5 h-5 ${step.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-[11px] font-bold uppercase tracking-widest ${step.color}`}>{step.badge}</span>
                        <span className="text-[11px] text-gray-400">Chapitre {introStep + 1}/{EXCEL_INTRO_STEPS.length}</span>
                      </div>
                      <h2 className="text-xl font-black text-[#061019]">{step.title}</h2>
                      <p className="text-sm text-gray-500 mt-1">{step.tagline}</p>
                    </div>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5">
                    <Zap className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-xs text-gray-600 font-medium">{step.fact}</span>
                  </div>
                </div>
                <div className="px-6 py-5 space-y-6">
                  {step.blocks.map((block, bi) => (
                    <div key={bi}>
                      <h3 className="text-sm font-bold text-[#061019] mb-3">{block.heading}</h3>
                      {block.kind === 'text' && <p className="text-sm text-gray-600 leading-relaxed">{block.body}</p>}
                      {block.kind === 'list' && (
                        <ul className="space-y-2">{block.items.map((item, ii) => (
                          <li key={ii} className="flex items-start gap-2.5">
                            <div className={`mt-1.5 w-1.5 h-1.5 flex-shrink-0 ${step.color.replace('text-', 'bg-')}`} />
                            <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
                          </li>
                        ))}</ul>
                      )}
                      {block.kind === 'table' && (
                        <div className="overflow-hidden border border-gray-200">
                          {block.rows.map((row, ri) => (
                            <div key={ri} className={`flex items-start gap-4 px-4 py-3 ${ri % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                              <div className="flex items-center gap-2 w-44 flex-shrink-0">
                                <span className="text-xs font-mono font-bold text-[#061019]">{row.label}</span>
                                {row.tag && <span className="text-[10px] bg-[#217346] text-white px-1.5 py-0.5 font-semibold">{row.tag}</span>}
                              </div>
                              <span className="text-xs text-gray-600 leading-relaxed">{row.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {block.kind === 'code' && (
                        <div className="bg-[#0f172a] overflow-hidden border border-gray-200">
                          <div className="px-4 py-2 border-b border-gray-700 flex items-center gap-2">
                            <FunctionSquare className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-[11px] text-gray-400 font-mono">Excel</span>
                          </div>
                          <div className="px-4 py-3 space-y-1.5">
                            {block.lines.map((line, li) => (
                              <div key={li} className="flex items-baseline gap-4">
                                <code className="text-xs font-mono text-green-300 w-64 flex-shrink-0">{line.formula}</code>
                                <span className="text-xs text-gray-500 italic">{line.comment}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                  <button onClick={() => setIntroStep(i => Math.max(0, i - 1))} disabled={introStep === 0}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#217346] disabled:opacity-0">
                    <ChevronLeft className="w-4 h-4" /> Précédent
                  </button>
                  <button onClick={() => setIntroStep(i => Math.min(EXCEL_INTRO_STEPS.length - 1, i + 1))}
                    className="text-xs text-gray-400 hover:text-gray-600">Passer ce chapitre</button>
                  {isLast ? (
                    <button onClick={() => setStage('quiz')}
                      className="flex items-center gap-2 bg-[#dd0061] hover:bg-[#b8004e] text-white px-5 py-2.5 text-sm font-bold">
                      Commencer le QCM <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={() => setIntroStep(i => i + 1)}
                      className="flex items-center gap-2 bg-[#217346] hover:bg-[#1a5c38] text-white px-5 py-2.5 text-sm font-bold">
                      Chapitre suivant <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
              <div className="mt-4 text-center">
                <button onClick={() => setStage('quiz')} className="text-xs text-gray-400 hover:text-[#217346] underline underline-offset-2">
                  Passer l'introduction et aller au QCM
                </button>
              </div>
            </section>
          );
        })()}

        {/* ── QCM ── */}
        {stage === 'quiz' && (
          <section className="max-w-7xl mx-auto">
            <div className="border border-gray-200 bg-white p-4 mb-5">
              <p className="text-sm text-gray-700">Bienvenue {firstName} ! QCM Excel — 8 questions pour évaluer ton niveau.</p>
              <p className="text-xs text-[#217346] mt-1">{answeredCount}/{requiredCount} réponses</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {questions.map((q, idx) => (
                <article key={q.id} className="border border-gray-200 bg-white p-3 flex flex-col min-h-[220px] shadow-sm">
                  <h3 className="font-semibold text-xs leading-snug mb-2">{idx + 1}. {q.question}</h3>
                  <div className="grid gap-1.5 mt-auto">
                    {q.options.map((opt, oi) => {
                      const selected = answers[q.id] === oi;
                      return (
                        <button key={`${q.id}-${oi}`} type="button"
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                          className={`text-left px-2 py-1.5 border text-[11px] leading-snug transition ${selected ? 'border-[#217346] bg-[#217346]/10 text-[#217346] font-semibold' : 'border-gray-200 bg-white text-gray-700 hover:border-[#217346]/40'}`}>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={submitQuiz} disabled={answeredCount !== requiredCount}
                className="px-5 py-3 bg-[#dd0061] text-white font-bold text-sm disabled:opacity-60">
                Valider le QCM
              </button>
            </div>
          </section>
        )}

        {/* ── Résultats ── */}
        {stage === 'results' && (
          <section className="max-w-5xl mx-auto">
            <div className="border border-gray-200 bg-white p-5 mb-5 shadow-sm">
              <h2 className="text-xl font-black">Résultats du QCM Excel</h2>
              <p className="mt-2 text-[#217346] font-bold">Score : {score}/8</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {corrections.map((c, idx) => (
                <div key={c.id} className={`border ${c.isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'} p-3 flex flex-col min-h-[240px]`}>
                  <p className="text-xs font-semibold leading-snug mb-2">{idx + 1}. {c.question}</p>
                  <p className={`text-[11px] mt-auto ${c.isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
                    {c.isCorrect ? '✓' : '✗'} {c.userIndex >= 0 ? c.options[c.userIndex] : 'non répondue'}
                  </p>
                  {!c.isCorrect && <p className="text-[11px] text-emerald-700 mt-1">→ {c.options[c.correctIndex]}</p>}
                  <p className="text-[10px] text-gray-500 mt-2 leading-snug">{c.explanation}</p>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-0.5 bg-[#dd0061]" />
                <h3 className="text-base font-black text-[#061019]">À retenir avant les exercices</h3>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EXCEL_RECAP_CARDS.map((card, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className={`border-2 ${card.borderColor} overflow-hidden bg-white`}>
                    <div className={`px-4 py-3 ${card.bgHeader} border-b border-gray-100`}>
                      <span className={`text-xs font-black uppercase tracking-widest ${card.titleColor}`}>{card.title}</span>
                    </div>
                    <div className="px-4 py-4 space-y-3">
                      <p className="text-sm text-gray-700 leading-relaxed">{card.explanation}</p>
                      <ul className="space-y-1">{card.rules.map((rule, ri) => (
                        <li key={ri} className="flex items-start gap-2">
                          <span className={`mt-1.5 w-1.5 h-1.5 flex-shrink-0 rounded-full ${card.titleColor.replace('text-', 'bg-')}`} />
                          <span className="text-xs text-gray-600 leading-relaxed">{rule}</span>
                        </li>
                      ))}</ul>
                      <div className="bg-[#0f172a] px-3 py-2.5">
                        <code className="text-xs font-mono text-green-300 whitespace-pre-wrap leading-relaxed">{card.example}</code>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={goToExercises} disabled={contextsLoading}
                className="px-5 py-3 bg-[#217346] text-white font-bold text-sm flex items-center gap-2 disabled:opacity-70">
                {contextsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Commencer les exercices Excel →
              </button>
            </div>
          </section>
        )}

        {/* ── Exercices : Feuille Excel réactive ── */}
        {stage === 'exercises' && (
          <>
            <section className="max-w-6xl mx-auto space-y-4">
              {/* En-tête */}
              <div className="border border-gray-200 bg-white shadow-sm overflow-hidden">

                {/* Bandeau contexte IA */}
                {(() => {
                  const ctx = exerciseContexts[exIdx];
                  return ctx ? (
                    <div className="border-b border-[#217346]/20 bg-[#217346]/5 px-4 py-3">
                      <div className="flex items-start gap-3 flex-wrap">
                        <div className="shrink-0">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#217346]">Mise en situation</span>
                          <p className="text-xs font-black text-[#061019] mt-0.5">{ctx.company}</p>
                          <p className="text-[11px] text-[#217346] font-semibold">{ctx.sector}</p>
                        </div>
                        <div className="w-px self-stretch bg-[#217346]/20 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-gray-700 mb-0.5">
                            <span className="text-[#061019]">Ton rôle :</span> {ctx.role}
                          </p>
                          <p className="text-[11px] text-gray-600 leading-snug">{ctx.context}</p>
                          <p className="text-[11px] text-[#dd0061] font-semibold mt-1">⚡ {ctx.stakes}</p>
                        </div>
                      </div>
                    </div>
                  ) : contextsLoading ? (
                    <div className="border-b border-[#217346]/20 bg-[#217346]/5 px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#217346]" />
                      <span className="text-[11px] text-[#217346]">Génération du contexte métier...</span>
                    </div>
                  ) : null;
                })()}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[11px] font-bold bg-[#217346] text-white px-2 py-0.5">
                          Exercice {exIdx + 1}/{exercises.length}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono">{exercise.subtitle}</span>
                      </div>
                      <h2 className="text-lg font-black text-[#217346]">{exercise.title}</h2>
                      <p className="mt-0.5 text-sm text-gray-600">{exercise.description}</p>
                      <p className="mt-2 text-sm text-[#dd0061] font-semibold">Mission : {exercise.goal}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-gray-400">{exercisesCompleted} complété(s)</span>
                      <button type="button" onClick={() => setShowAssistant(true)}
                        className="px-3 py-2 bg-[#217346] text-white text-xs font-black hover:bg-[#1a5c38] transition">
                        Assistant IA
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 leading-relaxed">{exercise.hint}</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-[1fr_270px] gap-4">

                {/* ── Feuille réactive ── */}
                <div className="border-2 border-[#217346]/20 bg-white shadow-sm overflow-hidden">

                  {/* Barre de formule Excel */}
                  <div className="flex items-center gap-0 border-b-2 border-[#217346]/30 bg-[#f0f7f0]">
                    {/* Référence cellule */}
                    <div className="flex items-center gap-1.5 px-3 py-2 border-r border-[#217346]/20 shrink-0">
                      <span className="text-[11px] font-mono font-bold text-[#217346] min-w-[36px] text-center bg-white border border-[#217346]/30 px-1.5 py-0.5">
                        {selectedRef ?? ''}
                      </span>
                    </div>
                    {/* Indicateur fx */}
                    <div className="px-2 shrink-0 border-r border-[#217346]/20 py-2">
                      <span className="text-sm font-bold text-[#217346] font-serif italic">fx</span>
                    </div>
                    {/* Input formule (barre de formule — miroir de la cellule sélectionnée) */}
                    <input
                      ref={formulaBarRef}
                      value={selectedRef ? (cellInputs[`${exIdx}_${selectedRef}`] ?? '') : ''}
                      onChange={e => { if (selectedRef) setCellInput(selectedRef, e.target.value); }}
                      onKeyDown={e => {
                        if (!selectedRef) return;
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const targets = exercise.targets.map(t => t.ref);
                          const idx = targets.indexOf(selectedRef);
                          const nextUnsolved = targets.find(t => getCellStatus(t) !== 'correct' && t !== selectedRef);
                          setSelectedRef(idx !== -1 && idx < targets.length - 1 ? targets[idx + 1] : (nextUnsolved ?? null));
                        }
                        if (e.key === 'Escape') setSelectedRef(null);
                        if (e.key === 'Tab') {
                          e.preventDefault();
                          const targets = exercise.targets.map(t => t.ref);
                          const idx = targets.indexOf(selectedRef);
                          if (idx !== -1) setSelectedRef(targets[(idx + 1) % targets.length]);
                        }
                      }}
                      placeholder={
                        selectedRef
                          ? exercise.targets.some(t => t.ref === selectedRef)
                            ? `ex: ${exercise.targets.find(t => t.ref === selectedRef)?.formulaExample ?? '=...'}`
                            : 'Modifier la valeur...'
                          : 'Cliquer sur une cellule pour éditer'
                      }
                      className="flex-1 px-3 py-2 text-xs font-mono bg-transparent outline-none placeholder-gray-400"
                    />
                    {selectedRef && cellInputs[`${exIdx}_${selectedRef}`] && (
                      <button type="button"
                        onClick={() => setCellInput(selectedRef, '')}
                        className="px-2 py-2 text-gray-400 hover:text-red-500 text-xs shrink-0">✕</button>
                    )}
                  </div>

                  {/* Grille — TOUTES les cellules sont cliquables/éditables */}
                  <div className="overflow-auto" style={{ maxHeight: '58vh' }}>
                    <table className="min-w-full border-collapse text-xs">
                      <thead className="sticky top-0 z-10">
                        <tr>
                          <th className="w-9 bg-[#217346]/10 border border-gray-200 text-gray-400 font-normal text-center py-1.5 select-none" />
                          {exercise.colLetters.map((letter, ci) => (
                            <th key={ci} className="bg-[#217346]/10 border border-gray-200 px-3 py-1.5 min-w-[100px] font-bold text-center">
                              <span className="text-[11px] font-mono text-[#217346]">{letter}</span>
                              <span className="block text-[9px] text-gray-400 font-normal leading-tight">{exercise.colHeaders[ci]}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {exercise.grid.map((row, ri) => {
                          const rowNum = ri + 1;
                          return (
                            <tr key={ri}>
                              {/* Numéro de ligne */}
                              <td className="bg-[#217346]/5 border border-gray-200 text-[10px] text-gray-400 text-center font-mono py-1 select-none w-9">
                                {rowNum}
                              </td>
                              {row.map((staticVal, ci) => {
                                const ref = `${exercise.colLetters[ci]}${rowNum}`;
                                const isTarget = exercise.targets.some(t => t.ref === ref);
                                const isSelected = selectedRef === ref;
                                const userInput = cellInputs[`${exIdx}_${ref}`];
                                const hasUserInput = !!userInput;
                                const status = isTarget ? getCellStatus(ref) : null;
                                const displayVal = cellMap[ref];
                                const isSeparator = String(staticVal ?? '').startsWith('——') || String(staticVal ?? '').startsWith('———');
                                const isBold = !isSeparator && (
                                  staticVal === 'TOTAL' || staticVal === 'MOYENNE' || staticVal === 'EFFECTIFS' ||
                                  staticVal === 'TOTAL / CAT.' || staticVal === 'Total Actifs' || staticVal === 'TOTAL commissions' ||
                                  String(staticVal ?? '').startsWith('Prix')
                                );

                                return (
                                  <td
                                    key={ci}
                                    onClick={() => setSelectedRef(ref)}
                                    className={[
                                      'border border-gray-200 px-2 py-1.5 cursor-pointer transition-colors select-none',
                                      isSelected
                                        ? 'bg-[#e8f5ee] outline outline-2 outline-[#217346] relative z-10'
                                        : status === 'correct'
                                        ? 'bg-emerald-50'
                                        : status === 'wrong'
                                        ? 'bg-red-50'
                                        : isTarget
                                        ? 'bg-amber-50 hover:bg-amber-100'
                                        : hasUserInput
                                        ? 'bg-blue-50/30 hover:bg-blue-50/50'
                                        : isSeparator
                                        ? 'bg-gray-100'
                                        : 'bg-white hover:bg-[#217346]/5',
                                    ].join(' ')}
                                    style={{ minWidth: ci === 0 ? 120 : 100 }}
                                  >
                                    <div className="flex items-center gap-1 min-h-[16px]">
                                      {status === 'correct' && !isSelected && (
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                      )}
                                      {isSelected ? (
                                        <input
                                          autoFocus
                                          value={cellInputs[`${exIdx}_${ref}`] ?? ''}
                                          onChange={e => setCellInput(ref, e.target.value)}
                                          onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              const targets = exercise.targets.map(t => t.ref);
                                              const tidx = targets.indexOf(ref);
                                              const nextUnsolved = targets.find(t => getCellStatus(t) !== 'correct' && t !== ref);
                                              setSelectedRef(tidx !== -1 && tidx < targets.length - 1 ? targets[tidx + 1] : (nextUnsolved ?? null));
                                            }
                                            if (e.key === 'Escape') setSelectedRef(null);
                                            if (e.key === 'Tab') {
                                              e.preventDefault();
                                              const targets = exercise.targets.map(t => t.ref);
                                              const tidx = targets.indexOf(ref);
                                              if (tidx !== -1) setSelectedRef(targets[(tidx + 1) % targets.length]);
                                            }
                                          }}
                                          placeholder={exercise.targets.find(t => t.ref === ref)?.formulaExample ?? '=...'}
                                          className="w-full bg-transparent outline-none font-mono text-xs text-[#061019] placeholder-gray-300 min-w-0"
                                        />
                                      ) : (
                                        <span className={[
                                          'font-mono text-xs truncate block w-full',
                                          status === 'correct' ? 'text-emerald-700 font-semibold'
                                          : status === 'wrong' ? 'text-red-600'
                                          : isTarget && !hasUserInput ? 'text-amber-300'
                                          : isBold ? 'font-bold text-[#061019]'
                                          : isSeparator ? 'text-gray-400'
                                          : typeof displayVal === 'number' ? 'text-[#061019]'
                                          : 'text-gray-700',
                                        ].join(' ')}>
                                          {displayVal !== null && displayVal !== undefined
                                            ? String(displayVal)
                                            : isTarget ? '✎' : ''}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Colonne droite */}
                <div className="space-y-3">
                  {/* Cellules à compléter */}
                  <div className="border border-[#217346]/25 bg-[#217346]/5 p-3">
                    <p className="text-[11px] uppercase tracking-wider text-[#217346] font-bold mb-2">Cellules à remplir</p>
                    <div className="space-y-1.5">
                      {exercise.targets.map(t => {
                        const status = getCellStatus(t.ref);
                        return (
                          <button key={t.ref} type="button" onClick={() => setSelectedRef(t.ref)}
                            className={[
                              'w-full text-left rounded px-2.5 py-1.5 border text-xs transition flex items-center gap-2',
                              status === 'correct' ? 'border-emerald-300 bg-emerald-50'
                              : status === 'wrong' ? 'border-red-300 bg-red-50'
                              : selectedRef === t.ref ? 'border-[#217346] bg-white ring-1 ring-[#217346]'
                              : 'border-amber-200 bg-amber-50 hover:border-[#217346]/40',
                            ].join(' ')}>
                            <span className={`font-mono text-[11px] font-bold shrink-0 w-8 ${status === 'correct' ? 'text-emerald-600' : status === 'wrong' ? 'text-red-500' : 'text-[#217346]'}`}>
                              {t.ref}
                            </span>
                            <span className="text-gray-600 truncate text-[11px] flex-1">{t.description}</span>
                            {status === 'correct' && <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />}
                            {status === 'wrong' && <span className="text-[10px] text-red-500 shrink-0">✗</span>}
                          </button>
                        );
                      })}
                    </div>
                    {exerciseSolved && (
                      <div className="mt-2 rounded border border-emerald-300 bg-emerald-50 px-3 py-2">
                        <p className="text-xs font-bold text-emerald-700">✓ Toutes les formules sont correctes !</p>
                      </div>
                    )}
                  </div>

                  {/* Guide des fonctions */}
                  {!exerciseSolved && (
                    <div className="border border-gray-200 bg-white p-3 space-y-2.5">
                      <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold">Fonctions de cet exercice</p>
                      {getFunctionsUsed(exercise.formulasToLearn).map(fn => {
                        const guide = FORMULA_GUIDE[fn];
                        if (!guide) return null;
                        return (
                          <div key={fn} className="border border-[#217346]/15 overflow-hidden">
                            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#217346]/8 border-b border-[#217346]/10">
                              <span className="text-[11px] font-black text-[#217346] font-mono">{fn}</span>
                            </div>
                            <div className="px-2.5 py-2 space-y-1.5">
                              <div className="bg-[#0f172a] rounded px-2 py-1.5">
                                <code className="text-[11px] font-mono text-green-300 break-all">{guide.syntax}</code>
                              </div>
                              <p className="text-[11px] text-gray-600 leading-snug">{guide.desc}</p>
                              <p className="text-[10px] text-[#217346] leading-snug italic">💡 {guide.tip}</p>
                            </div>
                          </div>
                        );
                      })}
                      <div className="bg-[#0f172a] rounded px-2.5 py-2 space-y-0.5">
                        <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Exemple pour cet exercice</p>
                        {exercise.formulasToLearn.map((f, i) => (
                          <code key={i} className="block text-[11px] font-mono text-amber-300 break-all">{f}</code>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation exercices */}
                  {exerciseSolved && (
                    <div className="border border-emerald-200 bg-emerald-50 p-3 space-y-2">
                      <p className="text-xs font-bold text-emerald-700">Exercice réussi !</p>
                      {exIdx < exercises.length - 1 ? (
                        <button type="button" onClick={() => setExIdx(i => i + 1)}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded px-3 py-2 bg-[#217346] text-white text-xs font-bold">
                          <ChevronRight className="w-3.5 h-3.5" /> Exercice suivant
                        </button>
                      ) : (
                        <button type="button" onClick={finishSession} disabled={summaryLoading}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded px-3 py-2 bg-[#dd0061] text-white text-xs font-bold disabled:opacity-60">
                          {summaryLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trophy className="w-3.5 h-3.5 text-yellow-300" />}
                          Voir mon bilan
                        </button>
                      )}
                      <button type="button" onClick={finishSession} disabled={summaryLoading}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded px-3 py-2 bg-white border border-gray-300 text-[#061019] text-xs font-bold hover:bg-gray-50 disabled:opacity-60">
                        {summaryLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        Terminer et bilan
                      </button>
                    </div>
                  )}
                  {!exerciseSolved && (
                    <button type="button" onClick={finishSession} disabled={summaryLoading}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded px-2.5 py-2 bg-white border border-gray-200 text-gray-400 text-xs font-bold hover:bg-gray-50 disabled:opacity-60">
                      {summaryLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trophy className="w-3.5 h-3.5 text-yellow-400" />}
                      Terminer et bilan
                    </button>
                  )}

                  {/* Sélecteur d'exercice */}
                  <div className="flex gap-1 flex-wrap">
                    {exercises.map((_, i) => (
                      <button key={i} type="button" onClick={() => setExIdx(i)}
                        className={`w-8 h-8 text-[11px] font-bold border transition ${
                          i === exIdx ? 'bg-[#217346] text-white border-[#217346]'
                          : solvedExercises.has(i) ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-white text-gray-400 border-gray-200 hover:border-[#217346]/40'
                        }`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Popup assistant IA */}
            {showAssistant && (
              <div className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
                <div className="pointer-events-auto w-[380px] border border-gray-200 bg-white shadow-xl flex flex-col" style={{ maxHeight: '72vh' }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-[#217346]">Assistant IA Excel</h3>
                    <button type="button" onClick={() => setShowAssistant(false)} className="text-gray-400 hover:text-gray-700 text-base leading-none px-1">✕</button>
                  </div>
                  <p className="px-4 pt-2 pb-1 text-[11px] text-gray-400">
                    Aide à comprendre les formules sans donner la réponse.
                  </p>
                  <div className="flex-1 overflow-auto px-4 py-2 space-y-2 min-h-0">
                    {assistantMessages.length === 0 && (
                      <p className="text-xs text-gray-300 italic">Pose ta première question...</p>
                    )}
                    {assistantMessages.map((m, i) => (
                      <div key={`${m.role}-${i}`} className={`px-3 py-2 ${m.role === 'assistant' ? 'bg-[#217346]/5 border border-[#217346]/15' : 'bg-gray-100 text-gray-700 text-xs'}`}>
                        {m.role === 'assistant' ? renderMarkdown(m.text) : m.text}
                      </div>
                    ))}
                    {loading && (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#217346]" /> Analyse...
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 px-4 py-3 border-t border-gray-100">
                    <textarea value={assistantQuestion} onChange={e => setAssistantQuestion(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askAssistant(); } }}
                      placeholder="Ex: comment fonctionne SUMIF avec du texte ?"
                      className="flex-1 border border-gray-200 bg-gray-50 text-[#061019] p-2 text-xs outline-none focus:border-[#217346]/60 min-h-[60px] resize-none" />
                    <button type="button" onClick={askAssistant} disabled={loading || !assistantQuestion.trim()}
                      className="self-end p-2 bg-[#217346] text-white disabled:opacity-60">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Bilan ── */}
        {stage === 'summary' && (
          <div className="min-h-[78vh] grid place-items-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <h2 className="text-2xl font-black">Bilan de ta session Excel</h2>
              </div>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="rounded-lg bg-[#217346]/8 px-4 py-3 text-center">
                  <p className="text-2xl font-black text-[#217346]">{score ?? 0}/8</p>
                  <p className="text-xs text-gray-500 mt-1">Score QCM</p>
                </div>
                <div className="rounded-lg bg-[#dd0061]/8 px-4 py-3 text-center">
                  <p className="text-2xl font-black text-[#dd0061]">{exercisesCompleted}</p>
                  <p className="text-xs text-gray-500 mt-1">Exercice(s) complété(s)</p>
                </div>
                <div className="rounded-lg bg-amber-50 px-4 py-3 text-center">
                  <p className="text-2xl font-black text-amber-600">{exercises.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Exercice(s) total</p>
                </div>
              </div>
              {summaryText && (
                <div className="border border-[#217346]/20 bg-[#217346]/5 px-5 py-4 text-sm text-gray-700 leading-relaxed">
                  {summaryText}
                </div>
              )}
              <div className="mt-6 flex gap-3 flex-wrap">
                <button type="button"
                  onClick={() => {
                    setStage('exercises');
                    setExIdx(0);
                    setSolvedExercises(new Set());
                    setExercisesCompleted(0);
                    setCellInputs({});
                  }}
                  className="px-4 py-2 bg-[#217346] text-white font-bold text-sm hover:bg-[#1a5c38]">
                  Refaire les exercices
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
