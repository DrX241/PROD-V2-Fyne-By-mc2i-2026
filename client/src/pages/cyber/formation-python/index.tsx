import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2, Sparkles, Send, Play, ChevronRight,
  Trophy, CheckCircle2, BookOpen, Zap, Code2, ChevronLeft, Terminal,
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

type Stage = 'name' | 'intro' | 'quiz' | 'results' | 'scenario' | 'summary';
type PythonDifficultyLevel = 'debutant' | 'intermediaire' | 'avance' | 'expert';

type PythonQuestion = {
  id: string;
  question: string;
  options: string[];
};

type PythonQuizCorrection = {
  id: string;
  question: string;
  options: string[];
  userIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
};

type PythonScenario = {
  title: string;
  context: string;
  goal: string;
  hint: string;
  starterCode: string;
};

type SandboxOutput = {
  success: boolean;
  output?: string;
  error?: string;
  durationMs?: number;
};

// ─── Helpers coaching ────────────────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;
  const inlineFormat = (line: string): React.ReactNode => {
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={i} className="font-semibold text-[#061019]">{part.slice(2, -2)}</strong>;
      if (part.startsWith('`') && part.endsWith('`'))
        return <code key={i} className="font-mono text-[11px] bg-[#006a9e]/10 text-[#006a9e] px-1 py-0.5 rounded">{part.slice(1, -1)}</code>;
      return part;
    });
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
      elements.push(<p key={key++} className="font-semibold text-[#006a9e] mt-3 mb-1 text-sm">{line.trim().slice(2, -2)}</p>);
    } else if (/^\d+\.\s/.test(line)) {
      const content = line.replace(/^\d+\.\s/, '');
      elements.push(<div key={key++} className="flex gap-2 items-baseline ml-1"><span className="text-[#006a9e] font-bold text-xs shrink-0">{line.match(/^\d+/)![0]}.</span><span className="text-sm text-gray-700">{inlineFormat(content)}</span></div>);
    } else if (line.includes('[code complet masqué')) {
      elements.push(<div key={key++} className="mt-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 italic">{line}</div>);
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-1" />);
    } else {
      elements.push(<p key={key++} className="text-sm text-gray-700 leading-relaxed">{inlineFormat(line)}</p>);
    }
  }
  return <div className="space-y-0.5">{elements}</div>;
}

function sanitizePythonCoaching(raw: string): string {
  if (!raw) return raw;
  let text = String(raw);
  // Retire les blocs de code complets pour garder un mode coaching
  text = text.replace(/```[\s\S]*?```/g, '[code complet masqué — à toi de l\'écrire]');
  // Retire les blocs indentés ressemblant à du code Python complet (>3 lignes)
  text = text.replace(/((?:[ \t]+\S[^\n]*\n){4,})/g, '[code complet masqué — à toi de l\'écrire]\n');
  return text;
}

type PythonMissionHint = { id: string; operation: string; purpose: string };

function buildPythonMissionHints(scenario: PythonScenario | null): PythonMissionHint[] {
  const text = `${scenario?.title || ''} ${scenario?.context || ''} ${scenario?.goal || ''} ${scenario?.hint || ''}`.toLowerCase();
  const hints: PythonMissionHint[] = [
    { id: 'h_import', operation: 'import pandas as pd', purpose: 'Toujours commencer par importer pandas.' },
  ];
  if (/filtr|actif|is_active|status|where|condit/.test(text))
    hints.push({ id: 'h_filter', operation: 'df[df["col"] == val]', purpose: 'Filtrer les lignes selon une condition.' });
  if (/group|par |chaque|catégor|total|somme|count|compt/.test(text))
    hints.push({ id: 'h_groupby', operation: '.groupby("col").agg(...)', purpose: 'Regrouper et agréger (sum, count, mean).' });
  if (/fusionne|merge|join|user_id|commande.*utilisateur|utilisateur.*commande/.test(text))
    hints.push({ id: 'h_merge', operation: 'pd.merge(df1, df2, ...)', purpose: 'Fusionner deux DataFrames sur une clé.' });
  if (/apply|lambda|classif|créer.*colonne|nouvelle colonne/.test(text))
    hints.push({ id: 'h_apply', operation: 'df["col"].apply(lambda x: ...)', purpose: 'Créer une colonne via une fonction.' });
  if (/tri|sort|order|décroissant|croissant/.test(text))
    hints.push({ id: 'h_sort', operation: '.sort_values("col", ascending=False)', purpose: 'Trier le résultat.' });
  hints.push({ id: 'h_print', operation: 'print(resultat)', purpose: 'Afficher le résultat pour le valider.' });
  return hints.slice(0, 5);
}

// ─── Frise Python — données pédagogiques ──────────────────────────────────────

type IntroStep = {
  badge: string;
  title: string;
  tagline: string;
  fact: string;
  color: string;
  accentBg: string;
  Icon: React.FC<{ className?: string }>;
  blocks: Array<
    | { kind: 'text'; heading: string; body: string }
    | { kind: 'list'; heading: string; items: string[] }
    | { kind: 'table'; heading: string; rows: Array<{ label: string; value: string; tag?: string }> }
    | { kind: 'code'; heading: string; lines: Array<{ py: string; comment: string }> }
  >;
};

const PYTHON_INTRO_STEPS: IntroStep[] = [
  {
    badge: 'Pourquoi Python ?',
    title: 'Python — Le langage de la data',
    tagline: 'Lisible, puissant, universel. Le choix numéro 1 pour analyser des données.',
    fact: 'Python est utilisé par 85% des data scientists dans le monde',
    color: 'text-[#006a9e]',
    accentBg: 'bg-[#006a9e]/5 border-[#006a9e]/20',
    Icon: BookOpen,
    blocks: [
      {
        kind: 'text',
        heading: "Qu'est-ce que Python ?",
        body: "Python est un langage de programmation créé en 1991 par Guido van Rossum. Sa syntaxe épurée le rend lisible comme du pseudo-code anglais. C'est aujourd'hui le langage dominant en data science, machine learning, automatisation et analyse de données.",
      },
      {
        kind: 'list',
        heading: 'Pourquoi Python pour la data ?',
        items: [
          "Syntaxe claire : less de code pour plus de résultats",
          "Écosystème massif : pandas, numpy, matplotlib, scikit-learn, etc.",
          "Interactivité : Jupyter notebooks pour explorer les données en direct",
          "Polyvalent : de l'exploration rapide au déploiement en production",
          "Gratuit et open-source : communauté gigantesque, ressources illimitées",
        ],
      },
      {
        kind: 'table',
        heading: 'Python vs autres langages data',
        rows: [
          { label: 'Python', value: 'Analyse, ML, automatisation, back-end — tout-en-un', tag: 'Leader' },
          { label: 'R', value: 'Statistiques académiques et visualisation avancée' },
          { label: 'SQL', value: 'Requêtes sur bases de données relationnelles' },
          { label: 'Excel', value: 'Tableaux simples, pas adapté aux gros volumes' },
        ],
      },
    ],
  },
  {
    badge: 'pandas',
    title: 'pandas — Votre tableur intelligent',
    tagline: 'La bibliothèque qui transforme Python en outil d\'analyse de données surpuissant.',
    fact: 'pandas est téléchargé plus de 200 millions de fois par mois',
    color: 'text-[#dd0061]',
    accentBg: 'bg-[#dd0061]/5 border-[#dd0061]/20',
    Icon: Zap,
    blocks: [
      {
        kind: 'text',
        heading: "C'est quoi pandas ?",
        body: "pandas est une bibliothèque Python spécialisée dans la manipulation de données tabulaires. Elle introduit deux structures : la Series (colonne) et le DataFrame (tableau 2D). Pensez à un DataFrame comme un onglet Excel mais manipulable par code — avec des milliers de lignes, sans ralentissement.",
      },
      {
        kind: 'code',
        heading: 'Premier contact avec pandas',
        lines: [
          { py: 'import pandas as pd', comment: 'convention universelle : pd = pandas' },
          { py: "df = pd.read_csv('data.csv')", comment: 'charger un fichier CSV en DataFrame' },
          { py: 'print(df.head())', comment: '5 premières lignes — aperçu rapide' },
          { py: 'print(df.shape)', comment: '(nb_lignes, nb_colonnes)' },
          { py: 'print(df.dtypes)', comment: 'type de chaque colonne' },
          { py: 'print(df.describe())', comment: 'statistiques descriptives automatiques' },
        ],
      },
      {
        kind: 'list',
        heading: 'Ce que pandas fait à la place de 100 lignes Excel',
        items: [
          'Filtrer des millions de lignes en une seule instruction',
          'Grouper et agréger par catégorie en 2 lignes',
          'Fusionner plusieurs fichiers / tables comme un JOIN SQL',
          'Nettoyer les données manquantes automatiquement',
          'Exporter en CSV, Excel, JSON en une ligne',
        ],
      },
    ],
  },
  {
    badge: 'DataFrame',
    title: 'DataFrames — Structure des données',
    tagline: 'Comprendre comment les données sont organisées pour les manipuler efficacement.',
    fact: 'Un DataFrame pandas peut contenir des milliards de lignes avec les bonnes optimisations',
    color: 'text-[#7c3aed]',
    accentBg: 'bg-[#7c3aed]/5 border-[#7c3aed]/20',
    Icon: Code2,
    blocks: [
      {
        kind: 'table',
        heading: 'Anatomie d\'un DataFrame',
        rows: [
          { label: 'Index', value: 'Étiquette de chaque ligne (par défaut 0, 1, 2…)', tag: 'auto' },
          { label: 'Colonnes', value: 'Chaque colonne a un nom et un type (int, float, str, datetime…)' },
          { label: 'Valeurs', value: 'Données brutes — peuvent contenir NaN (valeur manquante)' },
          { label: 'dtypes', value: 'Type de données par colonne : int64, float64, object, bool' },
          { label: 'Shape', value: '(nombre de lignes, nombre de colonnes) — comme Excel' },
        ],
      },
      {
        kind: 'code',
        heading: 'Accéder aux données',
        lines: [
          { py: "df['colonne']", comment: 'sélectionner une colonne (retourne une Series)' },
          { py: "df[['col1', 'col2']]", comment: 'plusieurs colonnes (retourne un DataFrame)' },
          { py: 'df.loc[0]', comment: 'ligne par label d\'index' },
          { py: 'df.iloc[0]', comment: 'ligne par position numérique' },
          { py: "df[df['age'] > 30]", comment: 'filtrer les lignes — condition booléenne' },
          { py: 'df.isna().sum()', comment: 'compter les valeurs manquantes par colonne' },
        ],
      },
      {
        kind: 'list',
        heading: 'Les types de colonnes essentiels',
        items: [
          'int64 / float64 — nombres entiers ou décimaux (calculs, agrégations)',
          'object — texte / chaîne de caractères (catégories, noms)',
          'bool — True / False (filtres, indicateurs)',
          'datetime64 — dates et heures (séries temporelles, tri chronologique)',
          'category — optimisation mémoire pour peu de valeurs distinctes',
        ],
      },
    ],
  },
  {
    badge: 'Manipulations',
    title: 'Filtrer, Grouper, Joindre',
    tagline: 'Les trois opérations fondamentales de l\'analyse de données avec pandas.',
    fact: 'filter + groupby + merge couvrent 80% des besoins d\'analyse quotidiens',
    color: 'text-[#0d9488]',
    accentBg: 'bg-[#0d9488]/5 border-[#0d9488]/20',
    Icon: Terminal,
    blocks: [
      {
        kind: 'code',
        heading: 'Filtrer — sélectionner des lignes selon une condition',
        lines: [
          { py: "actifs = df[df['is_active'] == True]", comment: 'filtre simple' },
          { py: "admins = df[df['role'] == 'admin']", comment: 'filtre sur texte' },
          { py: "grands = df[df['amount'] > 100]", comment: 'filtre numérique' },
          { py: "combo = df[(df['role'] == 'admin') & (df['is_active'] == True)]", comment: 'AND — les deux conditions' },
          { py: "either = df[(df['role'] == 'admin') | (df['role'] == 'user')]", comment: 'OR — l\'une ou l\'autre' },
        ],
      },
      {
        kind: 'code',
        heading: 'Grouper — agréger par catégorie',
        lines: [
          { py: "df.groupby('role').size()", comment: 'nombre de lignes par rôle' },
          { py: "df.groupby('status')['amount'].sum()", comment: 'somme des montants par statut' },
          { py: "df.groupby('role')['amount'].agg(['mean', 'max'])", comment: 'plusieurs agrégations' },
          { py: "df.groupby('category').size().reset_index(name='count')", comment: 'résultat en DataFrame propre' },
        ],
      },
      {
        kind: 'code',
        heading: 'Joindre — fusionner deux DataFrames',
        lines: [
          { py: "merged = df_orders.merge(df_users, left_on='user_id', right_on='id')", comment: 'INNER JOIN équivalent' },
          { py: "left = df_orders.merge(df_users, on='user_id', how='left')", comment: 'LEFT JOIN — garde toutes les commandes' },
          { py: "result = merged[['username', 'email', 'amount', 'status']]", comment: 'sélectionner les colonnes utiles' },
        ],
      },
    ],
  },
  {
    badge: 'Workflow',
    title: 'Workflow data complet',
    tagline: 'De la donnée brute à l\'insight : les étapes d\'une analyse Python professionnelle.',
    fact: 'Un data analyst passe 60-80% de son temps sur le nettoyage et la préparation des données',
    color: 'text-[#006a9e]',
    accentBg: 'bg-[#006a9e]/5 border-[#006a9e]/20',
    Icon: BookOpen,
    blocks: [
      {
        kind: 'list',
        heading: 'Les 5 étapes d\'une analyse data',
        items: [
          '1. Chargement — importer les données (CSV, API, BDD, Excel)',
          '2. Exploration — head(), shape, dtypes, describe() — comprendre ce qu\'on a',
          '3. Nettoyage — gérer les NaN, doublons, mauvais types, valeurs aberrantes',
          '4. Transformation — filtres, groupby, merge, calculs de nouvelles colonnes',
          '5. Visualisation / Export — matplotlib, seaborn, to_csv(), to_excel()',
        ],
      },
      {
        kind: 'code',
        heading: 'Workflow complet en 10 lignes',
        lines: [
          { py: 'import pandas as pd', comment: 'étape 1 : import' },
          { py: "df = pd.read_csv('commandes.csv')", comment: 'chargement' },
          { py: 'print(df.head(), df.shape)', comment: 'étape 2 : exploration' },
          { py: 'df = df.dropna(subset=[\'amount\'])', comment: 'étape 3 : nettoyage' },
          { py: "df['amount'] = df['amount'].astype(float)", comment: 'correction de type' },
          { py: "df_paid = df[df['status'] == 'paid']", comment: 'étape 4 : filtrage' },
          { py: "result = df_paid.groupby('user_id')['amount'].sum()", comment: 'agrégation' },
          { py: "top10 = result.nlargest(10)", comment: 'top 10 clients' },
          { py: "top10.to_csv('top_clients.csv')", comment: 'étape 5 : export' },
          { py: 'print(top10)', comment: 'affichage final' },
        ],
      },
      {
        kind: 'table',
        heading: 'Fonctions incontournables à connaître',
        rows: [
          { label: 'head() / tail()', value: 'Aperçu rapide des premières / dernières lignes', tag: 'Exploration' },
          { label: 'describe()', value: 'Statistiques descriptives : mean, std, min, max, quartiles', tag: 'Stats' },
          { label: 'value_counts()', value: 'Distribution des valeurs d\'une colonne (fréquences)', tag: 'Freq' },
          { label: 'groupby().agg()', value: 'Regroupement et agrégations multiples en une passe', tag: 'Agréger' },
          { label: 'merge() / join()', value: 'Fusion de DataFrames — équivalent JOIN SQL', tag: 'Joindre' },
        ],
      },
    ],
  },
];

// ─── Fiches récap Python ───────────────────────────────────────────────────────

type RecapCard = {
  title: string;
  borderColor: string;
  titleColor: string;
  bgHeader: string;
  explanation: string;
  rules: string[];
  example: string;
};

const PYTHON_RECAP_CARDS: RecapCard[] = [
  {
    title: 'Filtrer avec .loc et conditions booléennes',
    borderColor: 'border-[#006a9e]',
    titleColor: 'text-[#006a9e]',
    bgHeader: 'bg-[#006a9e]/5',
    explanation:
      "Filtrer un DataFrame, c'est sélectionner des lignes qui satisfont une condition. On passe une expression booléenne entre crochets : df[condition]. Combinez avec & (ET) ou | (OU). Chaque colonne évaluée retourne True/False pour chaque ligne.",
    rules: [
      "df[df['col'] == valeur] — filtre sur égalité exacte",
      "& pour ET logique, | pour OU — mettre chaque condition entre ()",
      "df[df['col'].isin(['a', 'b'])] — filtre sur liste de valeurs",
    ],
    example:
      "# Utilisateurs actifs avec un montant > 100\nresult = df_orders[\n    (df_orders['amount'] > 100) &\n    (df_orders['status'] == 'paid')\n]\nprint(result.head())",
  },
  {
    title: 'groupby() — Agréger par groupe',
    borderColor: 'border-[#dd0061]',
    titleColor: 'text-[#dd0061]',
    bgHeader: 'bg-[#dd0061]/5',
    explanation:
      "groupby() regroupe les lignes partageant la même valeur dans une colonne, puis applique une fonction d'agrégation à chaque groupe. C'est l'équivalent parfait du GROUP BY SQL. Utilisez .agg() pour plusieurs métriques simultanément.",
    rules: [
      "groupby('col').sum() / .mean() / .count() — agrégation simple",
      "groupby('col').agg({'col2': 'sum', 'col3': 'mean'}) — multi-métriques",
      "reset_index() après groupby pour retrouver un DataFrame plat",
    ],
    example:
      "# Montant total et nombre de commandes par statut\nresult = df_orders.groupby('status').agg(\n    total=('amount', 'sum'),\n    count=('amount', 'count')\n).reset_index()\nprint(result)",
  },
  {
    title: 'merge() — Fusionner des DataFrames',
    borderColor: 'border-[#7c3aed]',
    titleColor: 'text-[#7c3aed]',
    bgHeader: 'bg-[#7c3aed]/5',
    explanation:
      "merge() fusionne deux DataFrames sur une ou plusieurs colonnes communes — exactement comme JOIN en SQL. Par défaut c'est un INNER JOIN (seules les lignes avec correspondance des deux côtés). how='left' garde toutes les lignes du DataFrame gauche.",
    rules: [
      "on='col' si la colonne a le même nom dans les deux DataFrames",
      "left_on='col_a', right_on='col_b' si les noms diffèrent",
      "how='left' | 'right' | 'inner' | 'outer' — type de jointure",
    ],
    example:
      "# Joindre commandes et utilisateurs\nmerged = df_orders.merge(\n    df_users,\n    left_on='user_id',\n    right_on='id',\n    how='left'\n)\nprint(merged[['username', 'amount', 'status']].head())",
  },
  {
    title: 'apply() et lambda — Transformer colonne par colonne',
    borderColor: 'border-[#0d9488]',
    titleColor: 'text-[#0d9488]',
    bgHeader: 'bg-[#0d9488]/5',
    explanation:
      "apply() applique une fonction à chaque valeur ou ligne d'un DataFrame. Combiné avec lambda (fonction anonyme), c'est l'outil idéal pour créer des colonnes calculées, classifier des valeurs ou transformer des données sans boucle for explicite.",
    rules: [
      "df['col'].apply(lambda x: ...) — transforme chaque valeur d'une colonne",
      "df.apply(lambda row: ..., axis=1) — accès à toute la ligne",
      "Préférez les opérations vectorisées (df['col'] * 2) à apply pour la performance",
    ],
    example:
      "# Classifier le montant en catégorie\ndf_orders['category'] = df_orders['amount'].apply(\n    lambda x: 'elevé' if x > 200 else ('moyen' if x > 50 else 'faible')\n)\nprint(df_orders[['amount', 'category']].head())",
  },
];

// ─── Composant principal ───────────────────────────────────────────────────────

export default function PythonFormationPage() {
  const [stage, setStage] = useState<Stage>('name');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');

  const [questions, setQuestions] = useState<PythonQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const [score, setScore] = useState<number | null>(null);
  const [total, setTotal] = useState(8);
  const [corrections, setCorrections] = useState<PythonQuizCorrection[]>([]);
  const [level, setLevel] = useState<PythonDifficultyLevel | null>(null);
  const [levelLabel, setLevelLabel] = useState('');
  const [scenario, setScenario] = useState<PythonScenario | null>(null);

  const [introStep, setIntroStep] = useState(0);

  const [pyCode, setPyCode] = useState('# Ton code Python ici\n');
  const [sandboxOutput, setSandboxOutput] = useState<SandboxOutput | null>(null);

  const [assistantQuestion, setAssistantQuestion] = useState('');
  const [assistantMessages, setAssistantMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);

  const [scenariosCompleted, setScenariosCompleted] = useState(0);
  const [scenarioTitles, setScenarioTitles] = useState<string[]>([]);
  const [missionSuccess, setMissionSuccess] = useState(false);
  const [autoFeedback, setAutoFeedback] = useState<string | null>(null);
  const [autoFeedbackLoading, setAutoFeedbackLoading] = useState(false);

  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const requiredCount = questions.length || 8;
  const missionHints = useMemo(() => buildPythonMissionHints(scenario), [scenario]);

  // ── Démarrage : intro immédiate + chargement quiz en fond ──────────────────
  const startPythonJourney = async () => {
    const cleanName = firstName.trim();
    if (!cleanName) { setError('Entre ton prénom pour commencer.'); return; }
    setError('');
    setIntroStep(0);
    setStage('intro');
    setLoading(true);
    try {
      const res = await apiRequest<{
        success: boolean; sessionId: string; welcomeMessage: string;
        questions: PythonQuestion[]; message?: string;
      }>('/api/formation/python/start', { method: 'POST', body: JSON.stringify({ firstName: cleanName }) });
      if (!res.success) throw new Error(res.message || 'Impossible de démarrer le parcours Python.');
      setSessionId(res.sessionId);
      setWelcomeMessage(res.welcomeMessage);
      setQuestions(res.questions);
    } catch (e: any) {
      setError(e?.message || 'Erreur au démarrage. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const goToQuiz = () => {
    if (!sessionId) { setError('Chargement en cours, patientez...'); return; }
    setStage('quiz');
  };

  // ── Soumission QCM ──────────────────────────────────────────────────────────
  const submitQuiz = async () => {
    if (!sessionId) return;
    if (answeredCount !== requiredCount) {
      setError(`Réponds aux ${requiredCount} questions avant de valider.`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest<{
        success: boolean; score: number; total: number;
        level: PythonDifficultyLevel; levelLabel: string;
        corrections: PythonQuizCorrection[]; scenario: PythonScenario; message?: string;
      }>('/api/formation/python/quiz/submit', {
        method: 'POST',
        body: JSON.stringify({ sessionId, answers }),
      });
      if (!res.success) throw new Error(res.message || 'Erreur de correction QCM.');
      setScore(res.score);
      setTotal(res.total);
      setLevel(res.level);
      setLevelLabel(res.levelLabel);
      setCorrections(res.corrections);
      setScenario(res.scenario);
      setStage('results');
    } catch (e: any) {
      setError(e?.message || 'Erreur à la soumission du QCM.');
    } finally {
      setLoading(false);
    }
  };

  // ── Sandbox Python ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'scenario' || !scenario) return;
    setPyCode(scenario.starterCode || 'import pandas as pd\n\n# Écris ton code ici\n');
    setMissionSuccess(false);
    setSandboxOutput(null);
    setAutoFeedback(null);
    setAssistantMessages([]);
    setShowAssistant(false);
  }, [stage, scenario]);

  const runSandboxCode = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError('');
    setAutoFeedback(null);
    let result: SandboxOutput | null = null;
    try {
      const res = await apiRequest<SandboxOutput>('/api/formation/python/sandbox', {
        method: 'POST',
        body: JSON.stringify({ sessionId, code: pyCode }),
      });
      setSandboxOutput(res);
      result = res;
      if (res.success && res.output && res.output.trim().length > 0) {
        const outputLower = res.output.toLowerCase();
        const goalLower = (scenario?.goal || '').toLowerCase();
        const hasDataOutput = res.output.includes('\n') || /\d/.test(res.output);
        const keywordsMatched = ['print', 'groupby', 'merge', 'filter', 'apply'].filter(k => pyCode.toLowerCase().includes(k)).length;
        if (hasDataOutput && keywordsMatched >= 1) {
          setMissionSuccess(true);
          setScenariosCompleted(prev => prev + 1);
          if (scenario?.title) setScenarioTitles(prev => [...prev, scenario.title]);
        }
      }
    } catch (e: any) {
      const errResult: SandboxOutput = { success: false, error: e?.message || 'Erreur inconnue' };
      setSandboxOutput(errResult);
      result = errResult;
    } finally {
      setLoading(false);
    }
    if (result && !missionSuccess) {
      autoEvaluate(pyCode, result);
    }
  };

  const autoEvaluate = async (code: string, result: SandboxOutput) => {
    if (!sessionId) return;
    setAutoFeedbackLoading(true);
    try {
      const autoQ = result.success && result.output?.trim()
        ? `J'ai exécuté ce code et obtenu une sortie (${result.output.trim().split('\n').length} ligne(s)). Feedback pédagogique 2-3 phrases : est-ce que ça répond à la mission ? quoi améliorer ? Interdiction absolue de donner le code complet.`
        : result.error
        ? `Mon code Python génère cette erreur : "${result.error}". Aide-moi à comprendre POURQUOI sans me donner le code corrigé. Interdiction absolue de donner le code Python complet.`
        : `Mon code s'est exécuté mais n'affiche rien. Rappelle-moi pourquoi print() est nécessaire, sans montrer le code. 2 phrases max.`;
      const res = await apiRequest<{ success: boolean; assistantMessage: string }>(
        '/api/formation/python/assistant',
        { method: 'POST', body: JSON.stringify({ sessionId, userQuestion: autoQ, currentCode: code, lastOutput: result }) }
      );
      if (res.success) setAutoFeedback(sanitizePythonCoaching(res.assistantMessage));
    } catch { /* silent */ } finally {
      setAutoFeedbackLoading(false);
    }
  };

  const askAssistant = async () => {
    if (!sessionId || !assistantQuestion.trim()) return;
    const userText = assistantQuestion.trim();
    setAssistantQuestion('');
    setAssistantMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; assistantMessage: string; message?: string }>(
        '/api/formation/python/assistant',
        { method: 'POST', body: JSON.stringify({ sessionId, userQuestion: userText, currentCode: pyCode, lastOutput: sandboxOutput }) }
      );
      if (!res.success) throw new Error(res.message || 'Assistant indisponible.');
      setAssistantMessages(prev => [...prev, { role: 'assistant', text: sanitizePythonCoaching(res.assistantMessage) }]);
    } catch (e: any) {
      setAssistantMessages(prev => [...prev, { role: 'assistant', text: e?.message || "Je n'ai pas pu répondre. Réessaie." }]);
    } finally {
      setLoading(false);
    }
  };

  const loadNextScenario = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest<{
        success: boolean; scenario: PythonScenario;
        level: PythonDifficultyLevel; levelLabel: string; message?: string;
      }>('/api/formation/python/next-scenario', {
        method: 'POST',
        body: JSON.stringify({ sessionId, scenariosCompleted }),
      });
      if (!res.success) throw new Error(res.message || 'Impossible de charger le prochain scénario.');
      setScenario(res.scenario);
      setLevel(res.level);
      setLevelLabel(res.levelLabel);
      setMissionSuccess(false);
    } catch (e: any) {
      setError(e?.message || 'Erreur chargement scénario suivant.');
    } finally {
      setLoading(false);
    }
  };

  const finishSession = async () => {
    if (!sessionId) return;
    setSummaryLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; summary: string; message?: string }>(
        '/api/formation/python/summary',
        { method: 'POST', body: JSON.stringify({ sessionId, scenariosCompleted, scenarioTitles }) }
      );
      setSummaryText(res.summary || `Bravo ${firstName} ! Tu as complété ${scenariosCompleted} scénario(s) Python.`);
      setStage('summary');
    } catch {
      setSummaryText(`Bravo ${firstName} ! Tu as complété ${scenariosCompleted} scénario(s) Python. Continue à pratiquer !`);
      setStage('summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  // ── Render sandbox output ───────────────────────────────────────────────────
  const renderOutput = () => {
    if (!sandboxOutput) return null;
    return (
      <div className="space-y-2">
        {sandboxOutput.output?.trim() && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-emerald-700">Sortie</span>
              {sandboxOutput.durationMs && <span className="text-[10px] text-gray-400">{sandboxOutput.durationMs} ms</span>}
            </div>
            <div className="rounded-xl border border-gray-200 bg-[#0f172a] px-3 py-3 max-h-56 overflow-auto">
              <pre className="text-xs font-mono text-green-300 whitespace-pre-wrap leading-relaxed">
                {sandboxOutput.output.trim()}
              </pre>
            </div>
          </div>
        )}
        {sandboxOutput.error && (
          <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-3">
            <p className="text-[11px] uppercase tracking-wider text-red-600 font-semibold mb-1">Erreur Python</p>
            <pre className="text-xs text-red-700 font-mono leading-relaxed whitespace-pre-wrap">{sandboxOutput.error}</pre>
          </div>
        )}
        {!sandboxOutput.output?.trim() && !sandboxOutput.error && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
            <p className="text-xs text-gray-400 italic">Aucune sortie — ajoutez un <code className="font-mono">print()</code> pour voir le résultat.</p>
          </div>
        )}
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 text-[#061019]">
      <header className="flex items-center justify-center px-4 py-3 border-b border-gray-200 bg-white">
        <div className="text-sm font-semibold tracking-wide text-[#006a9e]">FYNE DATA PYTHON</div>
      </header>

      <main className="p-4 md:p-6 lg:p-8">
        {error && (
          <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        {/* ── Stage: Nom ── */}
        {stage === 'name' && (
          <div className="min-h-[78vh] grid place-items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-xl rounded-xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm"
            >
              <div className="inline-flex items-center gap-2 text-[#006a9e] text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> IA Python Coach
              </div>
              <h1 className="mt-3 text-2xl md:text-3xl font-black">Quel est ton prénom ?</h1>
              <p className="mt-2 text-gray-500 text-sm">
                Bienvenue dans le parcours Python Data. On commence par un QCM de 8 questions pour évaluer ton niveau, puis une mise en situation avec pandas.
              </p>
              <div className="mt-6 flex gap-2">
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') startPythonJourney(); }}
                  placeholder="Ton prénom"
                  className="flex-1 border border-gray-300 bg-white text-[#061019] px-4 py-3 text-sm outline-none focus:border-[#006a9e]"
                />
                <button
                  type="button"
                  onClick={startPythonJourney}
                  disabled={loading}
                  className="px-4 py-3 bg-[#dd0061] text-white font-bold text-sm disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Commencer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── Stage: Frise Python ── */}
        {stage === 'intro' && (() => {
          const step = PYTHON_INTRO_STEPS[introStep];
          const isLast = introStep === PYTHON_INTRO_STEPS.length - 1;
          const StepIcon = step.Icon;
          return (
            <section className="max-w-4xl mx-auto py-6">
              <div className="mb-8 text-center">
                <span className="text-xs font-semibold text-[#dd0061] uppercase tracking-widest">Avant le QCM d'évaluation</span>
                <h1 className="mt-1 text-2xl font-black text-[#006a9e]">Les fondamentaux Python Data</h1>
                <p className="text-sm text-gray-500 mt-1">Parcourez les 5 étapes clés — chaque minute compte pour mieux réussir.</p>
              </div>

              {/* Frise de progression */}
              <div className="relative mb-10 px-4">
                <div className="absolute top-5 left-12 right-12 h-0.5 bg-gray-200" />
                <div
                  className="absolute top-5 left-12 h-0.5 bg-[#006a9e] transition-all duration-500"
                  style={{ width: `calc((100% - 6rem) * ${introStep / (PYTHON_INTRO_STEPS.length - 1)})` }}
                />
                <div className="relative flex justify-between">
                  {PYTHON_INTRO_STEPS.map((s, i) => {
                    const done = i < introStep;
                    const active = i === introStep;
                    return (
                      <button key={i} onClick={() => setIntroStep(i)} className="flex flex-col items-center gap-2 group">
                        <div className={`w-10 h-10 flex items-center justify-center border-2 font-bold text-sm transition-all duration-300 ${
                          done ? 'bg-[#006a9e] border-[#006a9e] text-white'
                          : active ? 'bg-white border-[#006a9e] text-[#006a9e] shadow-md shadow-[#006a9e]/20'
                          : 'bg-white border-gray-200 text-gray-400 group-hover:border-gray-400'
                        }`}>
                          {done ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                        </div>
                        <span className={`text-[10px] font-medium text-center max-w-[70px] leading-tight transition-colors ${
                          active ? 'text-[#006a9e]' : done ? 'text-gray-500' : 'text-gray-300 group-hover:text-gray-500'
                        }`}>{s.badge}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Carte de contenu */}
              <motion.div
                key={introStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border border-gray-200 bg-white shadow-sm overflow-hidden"
              >
                <div className={`px-6 py-5 border-b border-gray-100 ${step.accentBg}`}>
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 p-2 bg-white border border-gray-100 shadow-sm">
                      <StepIcon className={`w-5 h-5 ${step.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-[11px] font-bold uppercase tracking-widest ${step.color}`}>{step.badge}</span>
                        <span className="text-[11px] text-gray-400">Étape {introStep + 1} / {PYTHON_INTRO_STEPS.length}</span>
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
                      {block.kind === 'text' && (
                        <p className="text-sm text-gray-600 leading-relaxed">{block.body}</p>
                      )}
                      {block.kind === 'list' && (
                        <ul className="space-y-2">
                          {block.items.map((item, ii) => (
                            <li key={ii} className="flex items-start gap-2.5">
                              <div className={`mt-1.5 w-1.5 h-1.5 flex-shrink-0 ${step.color.replace('text-', 'bg-')}`} />
                              <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {block.kind === 'table' && (
                        <div className="overflow-hidden border border-gray-200">
                          {block.rows.map((row, ri) => (
                            <div key={ri} className={`flex items-start gap-4 px-4 py-3 ${ri % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                              <div className="flex items-center gap-2 w-40 flex-shrink-0">
                                <span className="text-xs font-mono font-bold text-[#061019]">{row.label}</span>
                                {row.tag && <span className="text-[10px] bg-[#006a9e] text-white px-1.5 py-0.5 font-semibold">{row.tag}</span>}
                              </div>
                              <span className="text-xs text-gray-600 leading-relaxed">{row.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {block.kind === 'code' && (
                        <div className="bg-[#0f172a] overflow-hidden border border-gray-200">
                          <div className="px-4 py-2 border-b border-gray-700 flex items-center gap-2">
                            <Code2 className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-[11px] text-gray-400 font-mono">Python</span>
                          </div>
                          <div className="px-4 py-3 space-y-1.5">
                            {block.lines.map((line, li) => (
                              <div key={li} className="flex items-baseline gap-4">
                                <code className="text-xs font-mono text-blue-300 w-72 flex-shrink-0">{line.py}</code>
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
                  <button
                    onClick={() => setIntroStep(i => Math.max(0, i - 1))}
                    disabled={introStep === 0}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#006a9e] disabled:opacity-0 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Précédent
                  </button>
                  <button
                    onClick={() => setIntroStep(i => Math.min(PYTHON_INTRO_STEPS.length - 1, i + 1))}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Passer ce chapitre
                  </button>
                  {isLast ? (
                    <button
                      onClick={goToQuiz}
                      disabled={loading}
                      className="flex items-center gap-2 bg-[#dd0061] hover:bg-[#b8004e] disabled:opacity-60 text-white px-5 py-2.5 text-sm font-bold transition-colors"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {loading ? 'Chargement...' : "Commencer le QCM d'évaluation"}
                      {!loading && <ChevronRight className="w-4 h-4" />}
                    </button>
                  ) : (
                    <button
                      onClick={() => setIntroStep(i => i + 1)}
                      className="flex items-center gap-2 bg-[#006a9e] hover:bg-[#005a8a] text-white px-5 py-2.5 text-sm font-bold transition-colors"
                    >
                      Chapitre suivant <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>

              <div className="mt-4 text-center">
                <button
                  onClick={goToQuiz}
                  disabled={loading}
                  className="text-xs text-gray-400 hover:text-[#006a9e] underline underline-offset-2 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Chargement du QCM...' : "Passer l'introduction et aller directement au QCM"}
                </button>
              </div>
            </section>
          );
        })()}

        {/* ── Stage: QCM ── */}
        {stage === 'quiz' && (
          <section className="max-w-7xl mx-auto">
            <div className="border border-gray-200 bg-white p-4 mb-5">
              <p className="text-sm text-gray-700">{welcomeMessage}</p>
              <p className="text-xs text-[#006a9e] mt-2">QCM Python : {answeredCount}/{requiredCount} réponses</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {questions.map((q, idx) => (
                <article key={q.id} className="border border-gray-200 bg-white p-3 flex flex-col min-h-[220px] shadow-sm">
                  <h3 className="font-semibold text-xs leading-snug mb-2">{idx + 1}. {q.question}</h3>
                  <div className="grid gap-1.5 mt-auto">
                    {q.options.map((opt, oi) => {
                      const selected = answers[q.id] === oi;
                      return (
                        <button
                          key={`${q.id}-${oi}`}
                          type="button"
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                          className={`text-left px-2 py-1.5 border text-[11px] leading-snug transition ${
                            selected
                              ? 'border-[#006a9e] bg-[#006a9e]/10 text-[#006a9e] font-semibold'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-[#006a9e]/40 hover:bg-[#006a9e]/5'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={submitQuiz}
                disabled={loading || answeredCount !== requiredCount}
                className="px-5 py-3 bg-[#dd0061] text-white font-bold text-sm disabled:opacity-60"
              >
                {loading ? 'Correction en cours...' : 'Valider le QCM'}
              </button>
            </div>
          </section>
        )}

        {/* ── Stage: Résultats ── */}
        {stage === 'results' && (
          <section className="max-w-5xl mx-auto">
            <div className="border border-gray-200 bg-white p-5 mb-5 shadow-sm">
              <h2 className="text-xl font-black">Résultats du QCM Python</h2>
              <p className="mt-2 text-[#006a9e] font-bold">Score : {score}/{total}</p>
              <p className="text-sm text-gray-500 mt-1">Voici les réponses avec correction détaillée.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {corrections.map((c, idx) => {
                const isCorrect = c.userIndex === c.correctIndex;
                return (
                  <div key={c.id} className={`border ${isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'} p-3 flex flex-col min-h-[260px]`}>
                    <p className="text-xs font-semibold leading-snug mb-2">{idx + 1}. {c.question}</p>
                    <p className={`text-[11px] mt-auto ${isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
                      {isCorrect ? '✓' : '✗'} {c.userIndex >= 0 ? c.options[c.userIndex] : 'non répondue'}
                    </p>
                    {!isCorrect && (
                      <p className="text-[11px] text-emerald-700 mt-1">→ {c.options[c.correctIndex]}</p>
                    )}
                    <p className="text-[10px] text-gray-500 mt-2 leading-snug">{c.explanation}</p>
                  </div>
                );
              })}
            </div>

            {/* Fiches récap Python */}
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-0.5 bg-[#dd0061]" />
                <h3 className="text-base font-black text-[#061019]">À retenir avant la mise en situation</h3>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <p className="text-xs text-gray-500 mb-6 ml-9">Lisez chaque fiche — ces opérations seront utiles dans le sandbox pandas.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PYTHON_RECAP_CARDS.map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`border-2 ${card.borderColor} overflow-hidden bg-white`}
                  >
                    <div className={`px-4 py-3 ${card.bgHeader} border-b border-gray-100`}>
                      <span className={`text-xs font-black uppercase tracking-widest ${card.titleColor}`}>{card.title}</span>
                    </div>
                    <div className="px-4 py-4 space-y-3">
                      <p className="text-sm text-gray-700 leading-relaxed">{card.explanation}</p>
                      <ul className="space-y-1">
                        {card.rules.map((rule, ri) => (
                          <li key={ri} className="flex items-start gap-2">
                            <span className={`mt-1.5 w-1.5 h-1.5 flex-shrink-0 rounded-full ${card.titleColor.replace('text-', 'bg-')}`} />
                            <span className="text-xs text-gray-600 leading-relaxed">{rule}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="bg-[#0f172a] px-3 py-2.5">
                        <code className="text-xs font-mono text-blue-300 whitespace-pre-wrap leading-relaxed">{card.example}</code>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setStage('scenario')}
                className="px-5 py-3 bg-[#dd0061] text-white font-bold text-sm"
              >
                Voir la mise en situation Python
              </button>
            </div>
          </section>
        )}

        {/* ── Stage: Scénario / Sandbox ── */}
        {stage === 'scenario' && scenario && (
          <>
            <section className="max-w-6xl mx-auto space-y-4">
              {/* Carte scénario */}
              <div className="border-l-4 border-l-[#006a9e] border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-black text-[#006a9e]">{scenario.title}</h2>
                <p className="mt-2 text-sm text-gray-700">{scenario.context.split('. ')[0]}.</p>
                <p className="mt-1 text-sm text-[#dd0061] font-semibold">Mission : {scenario.goal}</p>
                <div className="mt-3 border border-gray-100 bg-gray-50 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-[#006a9e] font-semibold mb-2">DataFrames disponibles (pré-chargés)</p>
                  <div className="grid md:grid-cols-2 gap-2">
                    <div className="rounded-md border border-gray-200 bg-white px-3 py-2">
                      <p className="text-[11px] font-mono font-semibold text-[#006a9e]">df_users</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">id · username · role · is_active · age · city</p>
                    </div>
                    <div className="rounded-md border border-gray-200 bg-white px-3 py-2">
                      <p className="text-[11px] font-mono font-semibold text-[#006a9e]">df_orders</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">id · user_id · amount · status · category</p>
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] text-gray-400">Relation : df_orders.user_id = df_users.id</p>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-3 grid md:grid-cols-[1fr_auto] gap-3 items-start">
                  <p className="text-sm text-gray-600 leading-relaxed pr-0 md:pr-4">
                    À toi de jouer ! Écris ton code dans le sandbox. Si tu es bloqué(e), l'assistant IA Python peut analyser tes erreurs et te guider sans donner le code complet.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAssistant(true)}
                    className="shrink-0 px-4 py-2.5 bg-[#006a9e] text-white text-xs font-black hover:bg-[#005a8a] transition"
                  >
                    Ouvrir l'assistant IA Python
                  </button>
                </div>
              </div>

              {/* Layout 2 colonnes */}
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Sandbox Python */}
                <div className="border border-gray-200 bg-white p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#006a9e]">
                      <Terminal className="w-4 h-4" /> Python Sandbox
                    </div>
                    <button
                      type="button"
                      onClick={runSandboxCode}
                      disabled={loading}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#006a9e] text-white text-xs font-bold hover:bg-[#005a8a] disabled:opacity-60"
                    >
                      <Play className="w-3.5 h-3.5" /> Exécuter <span className="opacity-60 font-normal">Ctrl+↵</span>
                    </button>
                  </div>
                  <textarea
                    value={pyCode}
                    onChange={(e) => setPyCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        e.preventDefault();
                        runSandboxCode();
                      }
                    }}
                    className="w-full min-h-[220px] border border-gray-200 bg-[#0f172a] text-white p-3 text-xs font-mono outline-none focus:border-[#006a9e]/60"
                  />
                  {renderOutput()}
                </div>

                {/* Colonne droite : guidage + feedback */}
                <div className="space-y-4">
                  {/* Apprentissage guidé — opérations à utiliser (sans solution) */}
                  {!missionSuccess && (
                    <div className="border border-[#006a9e]/20 bg-[#006a9e]/5 p-4">
                      <p className="text-xs uppercase tracking-wider text-[#006a9e] font-semibold">Apprentissage guidé</p>
                      <p className="mt-2 text-sm font-semibold">Objectif : écrire toi-même le code pandas pour la mission.</p>
                      <p className="mt-1 text-xs text-gray-500">Opérations utiles pour ce scénario :</p>
                      <div className="mt-3 grid sm:grid-cols-2 gap-2">
                        {missionHints.map((hint) => (
                          <div key={hint.id} className="rounded-md bg-white border border-gray-200 px-3 py-2">
                            <p className="text-[11px] font-mono font-semibold text-[#006a9e]">{hint.operation}</p>
                            <p className="text-[11px] text-gray-500 mt-1 leading-snug">{hint.purpose}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mission réussie */}
                  {missionSuccess && (
                    <div className="border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-xs uppercase tracking-wider text-emerald-700 font-semibold mb-2">Mission accomplie</p>
                      <p className="text-sm font-bold text-emerald-800">Code Python exécuté avec succès !</p>
                      <p className="mt-1 text-xs text-gray-700 leading-relaxed">
                        Tu as produit un résultat avec pandas. Continue à explorer ou passe au scénario suivant.
                      </p>
                      {levelLabel && (
                        <p className="mt-2 text-[11px] text-emerald-600">
                          Niveau : {levelLabel.split(' — ')[0]} &bull; {scenariosCompleted} scénario(s) complété(s)
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={loadNextScenario}
                          disabled={loading || summaryLoading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006a9e] text-white text-xs font-bold disabled:opacity-60"
                        >
                          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          Scénario suivant
                        </button>
                        <button
                          type="button"
                          onClick={finishSession}
                          disabled={loading || summaryLoading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-[#061019] text-xs font-bold hover:bg-gray-50 disabled:opacity-60"
                        >
                          {summaryLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trophy className="w-3.5 h-3.5 text-yellow-500" />}
                          Terminer et voir mon bilan
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Analyse IA en cours */}
                  {autoFeedbackLoading && (
                    <div className="border border-gray-200 bg-white p-4 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#006a9e]" />
                      <p className="text-xs text-gray-400">Analyse de ton code en cours...</p>
                    </div>
                  )}

                  {/* Feedback IA automatique */}
                  {autoFeedback && !autoFeedbackLoading && !missionSuccess && (
                    <div className="border border-[#006a9e]/20 bg-[#006a9e]/5 p-4">
                      <p className="text-xs uppercase tracking-wider text-[#006a9e] font-semibold mb-2">Feedback IA</p>
                      <div>{renderMarkdown(autoFeedback)}</div>
                    </div>
                  )}

                  {!missionSuccess && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={finishSession}
                        disabled={summaryLoading}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-white border border-gray-300 text-[#061019] text-xs font-bold hover:bg-gray-50 disabled:opacity-60"
                      >
                        {summaryLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trophy className="w-3.5 h-3.5 text-yellow-500" />}
                        Terminer et voir mon bilan
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Popup Assistant IA Python flottant */}
            {showAssistant && (
              <div className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
                <div
                  className="pointer-events-auto w-[380px] border border-gray-200 bg-white shadow-xl flex flex-col"
                  style={{ maxHeight: '72vh' }}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-[#006a9e]">Assistant IA Python</h3>
                    <button
                      type="button"
                      onClick={() => setShowAssistant(false)}
                      className="text-gray-400 hover:text-gray-700 text-base leading-none px-1"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="px-4 pt-2 pb-1 text-[11px] text-gray-400">
                    L'IA analyse ton code et tes erreurs pour te guider sans donner la solution directement.
                  </p>
                  <div className="flex-1 overflow-auto px-4 py-2 space-y-2 min-h-0">
                    {assistantMessages.length === 0 && (
                      <p className="text-xs text-gray-300 italic">Pose ta première question...</p>
                    )}
                    {assistantMessages.map((m, i) => (
                      <div
                        key={`${m.role}-${i}`}
                        className={`px-3 py-2 ${
                          m.role === 'assistant'
                            ? 'bg-[#006a9e]/5 border border-[#006a9e]/15'
                            : 'bg-gray-100 text-gray-700 text-xs'
                        }`}
                      >
                        {m.role === 'assistant' ? renderMarkdown(m.text) : m.text}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 px-4 py-3 border-t border-gray-100">
                    <textarea
                      value={assistantQuestion}
                      onChange={(e) => setAssistantQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          askAssistant();
                        }
                      }}
                      placeholder="Ex: pourquoi mon groupby ne fonctionne pas ?"
                      className="flex-1 border border-gray-200 bg-gray-50 text-[#061019] p-2 text-xs outline-none focus:border-[#006a9e]/60 min-h-[60px] resize-none"
                    />
                    <button
                      type="button"
                      onClick={askAssistant}
                      disabled={loading || !assistantQuestion.trim()}
                      className="self-end p-2 bg-[#006a9e] text-white disabled:opacity-60"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Stage: Bilan ── */}
        {stage === 'summary' && (
          <div className="min-h-[78vh] grid place-items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <h2 className="text-2xl font-black">Bilan de ta session Python</h2>
              </div>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="rounded-lg bg-[#006a9e]/8 px-4 py-3 text-center">
                  <p className="text-2xl font-black text-[#006a9e]">{score}/{total}</p>
                  <p className="text-xs text-gray-500 mt-1">Score QCM</p>
                </div>
                <div className="rounded-lg bg-[#dd0061]/8 px-4 py-3 text-center">
                  <p className="text-2xl font-black text-[#dd0061]">{scenariosCompleted}</p>
                  <p className="text-xs text-gray-500 mt-1">Scénario(s) réussi(s)</p>
                </div>
                {level && (
                  <div className="rounded-lg bg-emerald-50 px-4 py-3 text-center">
                    <p className="text-2xl font-black text-emerald-700 capitalize">{level}</p>
                    <p className="text-xs text-gray-500 mt-1">Niveau Python</p>
                  </div>
                )}
              </div>
              {summaryText && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-6">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{summaryText}</p>
                </div>
              )}
              {scenarioTitles.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Scénarios complétés</p>
                  <ul className="space-y-1">
                    {scenarioTitles.map((title, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> {title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStage('name');
                    setFirstName('');
                    setSessionId('');
                    setAnswers({});
                    setScore(null);
                    setCorrections([]);
                    setScenario(null);
                    setScenariosCompleted(0);
                    setScenarioTitles([]);
                    setSummaryText(null);
                  }}
                  className="px-4 py-2.5 bg-[#dd0061] text-white font-bold text-sm hover:bg-[#b8004e]"
                >
                  Recommencer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
