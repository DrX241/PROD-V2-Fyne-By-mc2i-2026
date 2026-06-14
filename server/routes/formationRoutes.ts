import { Router } from 'express';
import { bedrockService } from '../services/bedrock';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);
const router = Router();

// In-memory session store (simple, no persistence needed)
const sessions: Record<string, {
  firstName: string;
  type: 'sql' | 'python' | 'excel';
  level: string;
  scenariosCompleted: number;
  createdAt: number;
}> = {};

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeSessionId() { return uuidv4(); }

function levelFromScore(score: number, total: number): { level: string; levelLabel: string } {
  const pct = score / total;
  if (pct >= 0.875) return { level: 'expert', levelLabel: 'Expert' };
  if (pct >= 0.625) return { level: 'avance', levelLabel: 'Avancé' };
  if (pct >= 0.375) return { level: 'intermediaire', levelLabel: 'Intermédiaire' };
  return { level: 'debutant', levelLabel: 'Débutant' };
}

async function askClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  return bedrockService.getChatCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    0.7,
    1500
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SQL ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/formation/sql/start
router.post('/sql/start', async (req, res) => {
  try {
    const { firstName } = req.body;
    if (!firstName) return res.status(400).json({ success: false, message: 'Prénom requis.' });

    const sessionId = makeSessionId();
    sessions[sessionId] = { firstName, type: 'sql', level: 'intermediaire', scenariosCompleted: 0, createdAt: Date.now() };

    const questionsRaw = await askClaude(
      'Tu es un expert SQL pédagogue. Tu génères des QCMs rigoureux sur SQL (SELECT, WHERE, JOIN, GROUP BY, agrégats). Réponds UNIQUEMENT en JSON valide.',
      `Génère 8 questions QCM sur SQL pour évaluer le niveau de ${firstName}. Chaque question doit avoir 4 options. Format JSON strict :
{"questions": [{"id": "q1", "question": "...", "options": ["A", "B", "C", "D"]}]}`
    );

    let questions;
    try {
      const match = questionsRaw.match(/\{[\s\S]*\}/);
      questions = JSON.parse(match![0]).questions;
    } catch {
      questions = SQL_FALLBACK_QUESTIONS;
    }

    res.json({
      success: true,
      sessionId,
      welcomeMessage: `Bienvenue ${firstName} ! Commençons par évaluer ton niveau SQL avec 8 questions.`,
      questions,
    });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/formation/sql/quiz/submit
router.post('/sql/quiz/submit', async (req, res) => {
  try {
    const { sessionId, answers } = req.body;
    const session = sessions[sessionId];
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable.' });

    const correctAnswers: Record<string, number> = {
      q1: 1, q2: 0, q3: 2, q4: 1, q5: 2, q6: 3, q7: 0, q8: 1
    };

    let score = 0;
    const corrections: any[] = [];
    const answerMap: Record<string, number> = answers || {};

    SQL_FALLBACK_QUESTIONS.forEach((q) => {
      const userIndex = answerMap[q.id] ?? -1;
      const correctIndex = correctAnswers[q.id] ?? 0;
      const isCorrect = userIndex === correctIndex;
      if (isCorrect) score++;
      corrections.push({
        id: q.id,
        question: q.question,
        options: q.options,
        userIndex,
        correctIndex,
        isCorrect,
        explanation: SQL_EXPLANATIONS[q.id] || 'Voir la documentation SQL.',
      });
    });

    const total = SQL_FALLBACK_QUESTIONS.length;
    const { level, levelLabel } = levelFromScore(score, total);
    session.level = level;

    const scenario = await generateSqlScenario(level, session.firstName);

    res.json({ success: true, score, total, level, levelLabel, corrections, scenario });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/formation/sql/sandbox
router.post('/sql/sandbox', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, message: 'Requête SQL vide.' });

    // Execute SQL via Python sqlite3
    const pythonCode = `
import sqlite3, json, sys

conn = sqlite3.connect(':memory:')
c = conn.cursor()

# Seed tables
c.executescript("""
CREATE TABLE users (id INTEGER, username TEXT, email TEXT, role TEXT, is_active INTEGER);
CREATE TABLE sessions (id INTEGER, user_id INTEGER, started_at TEXT, device TEXT, country TEXT, status TEXT);
CREATE TABLE orders (id INTEGER, user_id INTEGER, amount REAL, status TEXT, created_at TEXT);
CREATE TABLE products (id INTEGER, product_name TEXT, category TEXT, stock_quantity INTEGER, unit_price REAL, is_active INTEGER);
CREATE TABLE failed_logins (id INTEGER, user_id INTEGER, ip TEXT, attempted_at TEXT);

INSERT INTO users VALUES (1,'alice','alice@co.fr','admin',1),(2,'bob','bob@co.fr','user',1),(3,'charlie','charlie@co.fr','user',0),(4,'diane','diane@co.fr','user',1),(5,'eric','eric@co.fr','admin',1);
INSERT INTO sessions VALUES (1,1,'2024-01-10','mobile','FR','active'),(2,2,'2024-01-11','desktop','US','closed'),(3,3,'2024-01-12','mobile','DE','active'),(4,1,'2024-01-13','desktop','FR','closed'),(5,4,'2024-01-14','mobile','FR','active');
INSERT INTO orders VALUES (1,1,150.0,'paid','2024-01-05'),(2,2,85.5,'pending','2024-01-06'),(3,1,320.0,'paid','2024-01-07'),(4,3,45.0,'cancelled','2024-01-08'),(5,4,210.0,'paid','2024-01-09');
INSERT INTO products VALUES (1,'Laptop','electronique',10,999.0,1),(2,'T-shirt','vetements',50,25.0,1),(3,'Casque','electronique',5,149.0,1),(4,'Jean','vetements',30,60.0,0),(5,'Souris','electronique',20,35.0,1);
INSERT INTO failed_logins VALUES (1,3,'192.168.1.1','2024-01-10 08:00'),(2,3,'192.168.1.1','2024-01-10 08:01'),(3,2,'10.0.0.5','2024-01-11 14:00'),(4,3,'192.168.1.1','2024-01-10 08:02');
""")

try:
    c.execute(${JSON.stringify(query)})
    rows = c.fetchall()
    cols = [d[0] for d in c.description] if c.description else []
    result = {"success": True, "columns": cols, "rows": [dict(zip(cols, r)) for r in rows], "rowCount": len(rows), "durationMs": 12}
except Exception as e:
    result = {"success": False, "message": str(e)}

print(json.dumps(result))
conn.close()
`;

    const tmpFile = path.join(os.tmpdir(), `sql_${Date.now()}.py`);
    fs.writeFileSync(tmpFile, pythonCode);
    try {
      const { stdout } = await execAsync(`python3 "${tmpFile}"`, { timeout: 8000 });
      const parsed = JSON.parse(stdout.trim());
      res.json(parsed);
    } catch (e: any) {
      res.json({ success: false, message: e.message || 'Erreur d\'exécution.' });
    } finally {
      fs.unlinkSync(tmpFile);
    }
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/formation/sql/assistant
router.post('/sql/assistant', async (req, res) => {
  try {
    const { sessionId, userQuestion, currentQuery, lastExecution } = req.body;
    const session = sessions[sessionId];
    const firstName = session?.firstName || 'apprenant';

    const reply = await askClaude(
      `Tu es un coach SQL expert et bienveillant. Tu aides ${firstName} à progresser. Niveau : ${session?.level || 'intermédiaire'}. RÈGLES ABSOLUES : ne jamais donner une requête SQL complète en réponse directe. Guide par des indices, questions, explications. Sois encourageant. Réponds en français en 2-4 phrases max.`,
      `Question : ${userQuestion}\nRequête actuelle : ${currentQuery || 'aucune'}\nDernier résultat : ${JSON.stringify(lastExecution) || 'aucun'}`
    );

    res.json({ success: true, assistantMessage: reply });
  } catch (e: any) {
    res.status(500).json({ success: false, assistantMessage: 'Coach indisponible momentanément.' });
  }
});

// POST /api/formation/sql/next-scenario
router.post('/sql/next-scenario', async (req, res) => {
  try {
    const { sessionId, scenariosCompleted } = req.body;
    const session = sessions[sessionId];
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable.' });

    session.scenariosCompleted = scenariosCompleted + 1;
    const scenario = await generateSqlScenario(session.level, session.firstName, scenariosCompleted + 1);
    const { level, levelLabel } = levelFromScore(Math.min(scenariosCompleted + 1, 3), 4);

    res.json({ success: true, scenario, level: session.level, levelLabel });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/formation/sql/summary
router.post('/sql/summary', async (req, res) => {
  try {
    const { sessionId, scenariosCompleted, scenarioTitles } = req.body;
    const session = sessions[sessionId];
    const firstName = session?.firstName || 'apprenant';

    const summary = await askClaude(
      'Tu génères un bilan de fin de formation SQL personnalisé, encourageant et concret. 3-4 phrases max.',
      `Génère un bilan pour ${firstName} qui a complété ${scenariosCompleted} scénario(s) SQL : ${(scenarioTitles || []).join(', ')}. Niveau atteint : ${session?.level || 'intermédiaire'}.`
    );

    res.json({ success: true, summary });
  } catch (e: any) {
    res.status(500).json({ success: true, summary: `Bravo ! Tu as complété ${req.body.scenariosCompleted || 0} scénario(s) SQL.` });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PYTHON ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/python/start', async (req, res) => {
  try {
    const { firstName } = req.body;
    if (!firstName) return res.status(400).json({ success: false, message: 'Prénom requis.' });

    const sessionId = makeSessionId();
    sessions[sessionId] = { firstName, type: 'python', level: 'intermediaire', scenariosCompleted: 0, createdAt: Date.now() };

    const questionsRaw = await askClaude(
      'Tu es un expert Python/pandas pédagogue. Tu génères des QCMs sur pandas (filtrage, groupby, merge, apply). Réponds UNIQUEMENT en JSON valide.',
      `Génère 8 questions QCM sur Python/pandas pour ${firstName}. Format JSON strict :
{"questions": [{"id": "q1", "question": "...", "options": ["A", "B", "C", "D"]}]}`
    );

    let questions;
    try {
      const match = questionsRaw.match(/\{[\s\S]*\}/);
      questions = JSON.parse(match![0]).questions;
    } catch {
      questions = PYTHON_FALLBACK_QUESTIONS;
    }

    res.json({
      success: true,
      sessionId,
      welcomeMessage: `Bienvenue ${firstName} ! Évaluons ton niveau Python/pandas avec 8 questions.`,
      questions,
    });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/python/quiz/submit', async (req, res) => {
  try {
    const { sessionId, answers } = req.body;
    const session = sessions[sessionId];
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable.' });

    const correctAnswers: Record<string, number> = {
      q1: 0, q2: 1, q3: 2, q4: 0, q5: 3, q6: 1, q7: 2, q8: 0
    };

    let score = 0;
    const corrections: any[] = [];
    const answerMap: Record<string, number> = answers || {};

    PYTHON_FALLBACK_QUESTIONS.forEach((q) => {
      const userIndex = answerMap[q.id] ?? -1;
      const correctIndex = correctAnswers[q.id] ?? 0;
      const isCorrect = userIndex === correctIndex;
      if (isCorrect) score++;
      corrections.push({ id: q.id, question: q.question, options: q.options, userIndex, correctIndex, isCorrect, explanation: PYTHON_EXPLANATIONS[q.id] || '' });
    });

    const total = PYTHON_FALLBACK_QUESTIONS.length;
    const { level, levelLabel } = levelFromScore(score, total);
    session.level = level;

    const scenario = await generatePythonScenario(level, session.firstName);
    res.json({ success: true, score, total, level, levelLabel, corrections, scenario });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/python/sandbox', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Code vide.' });

    const tmpFile = path.join(os.tmpdir(), `py_${Date.now()}.py`);
    fs.writeFileSync(tmpFile, code);
    const start = Date.now();
    try {
      const { stdout, stderr } = await execAsync(`python3 "${tmpFile}"`, { timeout: 10000 });
      res.json({ success: true, stdout: stdout.trim(), stderr: stderr.trim(), durationMs: Date.now() - start });
    } catch (e: any) {
      res.json({ success: false, stdout: '', stderr: e.stderr || e.message, durationMs: Date.now() - start });
    } finally {
      fs.unlinkSync(tmpFile);
    }
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/python/assistant', async (req, res) => {
  try {
    const { sessionId, userQuestion, currentCode, lastOutput } = req.body;
    const session = sessions[sessionId];
    const firstName = session?.firstName || 'apprenant';

    const reply = await askClaude(
      `Tu es un coach Python/pandas expert et bienveillant. Tu aides ${firstName}. RÈGLES : ne jamais donner le code complet. Guide par des indices. Réponds en français en 2-4 phrases max.`,
      `Question : ${userQuestion}\nCode actuel : ${currentCode || 'aucun'}\nDernier output : ${lastOutput || 'aucun'}`
    );

    res.json({ success: true, assistantMessage: reply });
  } catch (e: any) {
    res.status(500).json({ success: false, assistantMessage: 'Coach indisponible.' });
  }
});

router.post('/python/next-scenario', async (req, res) => {
  try {
    const { sessionId, scenariosCompleted } = req.body;
    const session = sessions[sessionId];
    if (!session) return res.status(404).json({ success: false, message: 'Session introuvable.' });
    session.scenariosCompleted = scenariosCompleted + 1;
    const scenario = await generatePythonScenario(session.level, session.firstName, scenariosCompleted + 1);
    res.json({ success: true, scenario, level: session.level, levelLabel: session.level });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/python/summary', async (req, res) => {
  try {
    const { sessionId, scenariosCompleted } = req.body;
    const session = sessions[sessionId];
    const firstName = session?.firstName || 'apprenant';
    const summary = await askClaude(
      'Tu génères un bilan de fin de formation Python/pandas. 3-4 phrases encourageantes et concrètes.',
      `Bilan pour ${firstName}, ${scenariosCompleted} scénario(s) complété(s). Niveau : ${session?.level || 'intermédiaire'}.`
    );
    res.json({ success: true, summary });
  } catch (e: any) {
    res.status(500).json({ success: true, summary: `Bravo ! Tu as complété ${req.body.scenariosCompleted || 0} scénario(s) Python.` });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// EXCEL ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

router.post('/excel/scenarios', async (req, res) => {
  try {
    const { sessionId, firstName } = req.body;
    if (firstName && !sessions[sessionId]) {
      sessions[sessionId] = { firstName, type: 'excel', level: 'intermediaire', scenariosCompleted: 0, createdAt: Date.now() };
    }
    const session = sessions[sessionId];
    const name = session?.firstName || firstName || 'apprenant';

    const raw = await askClaude(
      'Tu génères des exercices Excel pratiques avec des données réalistes. Réponds UNIQUEMENT en JSON valide.',
      `Génère 4 exercices Excel progressifs pour ${name} sur : SUM, IF, COUNTIF, SUMIF, VLOOKUP. Chaque exercice a un titre, une instruction, un indice, et la formule solution. Format JSON :
{"exercises": [{"id": 1, "title": "...", "instruction": "...", "hint": "...", "solution": "=...", "explanation": "..."}]}`
    );

    let exercises;
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      exercises = JSON.parse(match![0]).exercises;
    } catch {
      exercises = EXCEL_FALLBACK_EXERCISES;
    }

    res.json({ success: true, exercises });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/excel/assistant', async (req, res) => {
  try {
    const { sessionId, userQuestion, currentFormula, exerciseContext } = req.body;
    const session = sessions[sessionId];
    const firstName = session?.firstName || 'apprenant';

    const reply = await askClaude(
      `Tu es un coach Excel expert. Tu aides ${firstName}. RÈGLES : ne jamais donner la formule complète directement. Guide par indices. Réponds en français en 2-3 phrases max.`,
      `Question : ${userQuestion}\nFormule actuelle : ${currentFormula || 'aucune'}\nContexte : ${exerciseContext || ''}`
    );

    res.json({ success: true, assistantMessage: reply });
  } catch (e: any) {
    res.status(500).json({ success: false, assistantMessage: 'Coach indisponible.' });
  }
});

router.post('/excel/summary', async (req, res) => {
  try {
    const { sessionId, exercisesCompleted } = req.body;
    const session = sessions[sessionId];
    const firstName = session?.firstName || 'apprenant';
    const summary = await askClaude(
      'Tu génères un bilan de fin de formation Excel. 3-4 phrases encourageantes.',
      `Bilan pour ${firstName}, ${exercisesCompleted} exercice(s) Excel complété(s).`
    );
    res.json({ success: true, summary });
  } catch (e: any) {
    res.status(500).json({ success: true, summary: `Bravo ! Tu as complété ${req.body.exercisesCompleted || 0} exercice(s) Excel.` });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// Generators
// ═══════════════════════════════════════════════════════════════════════════════

async function generateSqlScenario(level: string, firstName: string, index = 0): Promise<any> {
  try {
    const raw = await askClaude(
      'Tu génères des scénarios SQL réalistes basés sur des tables users, sessions, orders, products, failed_logins. Réponds UNIQUEMENT en JSON valide.',
      `Génère un scénario SQL de niveau ${level} (scénario n°${index + 1}) pour ${firstName}. Format JSON :
{"title": "...", "context": "...", "goal": "...", "hint": "...", "successCriteria": ["critère1", "critère2"]}`
    );
    const match = raw.match(/\{[\s\S]*\}/);
    return JSON.parse(match![0]);
  } catch {
    return SQL_FALLBACK_SCENARIOS[index % SQL_FALLBACK_SCENARIOS.length];
  }
}

async function generatePythonScenario(level: string, firstName: string, index = 0): Promise<any> {
  try {
    const raw = await askClaude(
      'Tu génères des scénarios Python/pandas réalistes. Réponds UNIQUEMENT en JSON valide.',
      `Génère un scénario pandas de niveau ${level} (n°${index + 1}) pour ${firstName}. Format JSON :
{"title": "...", "context": "...", "goal": "...", "starterCode": "import pandas as pd\\n\\n# ...", "hint": "...", "successCriteria": ["critère1"]}`
    );
    const match = raw.match(/\{[\s\S]*\}/);
    return JSON.parse(match![0]);
  } catch {
    return PYTHON_FALLBACK_SCENARIOS[index % PYTHON_FALLBACK_SCENARIOS.length];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Fallback data
// ═══════════════════════════════════════════════════════════════════════════════

const SQL_FALLBACK_QUESTIONS = [
  { id: 'q1', question: 'Quelle clause SQL filtre les lignes ?', options: ['GROUP BY', 'WHERE', 'HAVING', 'ORDER BY'] },
  { id: 'q2', question: 'INNER JOIN retourne :', options: ['Toutes les lignes de la table gauche', 'Uniquement les lignes avec correspondance dans les deux tables', 'Toutes les lignes des deux tables', 'Aucune ligne'] },
  { id: 'q3', question: 'Quelle fonction compte les lignes ?', options: ['SUM()', 'TOTAL()', 'COUNT()', 'NUMBER()'] },
  { id: 'q4', question: 'SELECT * FROM users WHERE age > 30 retourne :', options: ['Tous les utilisateurs', 'Les utilisateurs de plus de 30 ans', 'Les 30 premiers utilisateurs', 'Erreur SQL'] },
  { id: 'q5', question: 'HAVING filtre :', options: ['Les lignes avant agrégation', 'Les colonnes', 'Les groupes après agrégation', 'Les tables'] },
  { id: 'q6', question: 'ORDER BY salaire DESC trie :', options: ['Par ordre alphabétique', 'Du plus petit au plus grand', 'Par défaut', 'Du plus grand au plus petit'] },
  { id: 'q7', question: 'LEFT JOIN inclut :', options: ['Toutes les lignes de la table gauche', 'Uniquement les correspondances', 'Toutes les lignes de la table droite', 'Aucune ligne'] },
  { id: 'q8', question: 'AVG() calcule :', options: ['La somme', 'La moyenne', 'Le maximum', 'Le minimum'] },
];

const SQL_EXPLANATIONS: Record<string, string> = {
  q1: 'WHERE filtre les lignes avant agrégation. HAVING filtre après GROUP BY.',
  q2: 'INNER JOIN = intersection : seulement les lignes présentes dans les deux tables.',
  q3: 'COUNT(*) compte toutes les lignes, COUNT(col) exclut les NULL.',
  q4: 'WHERE age > 30 filtre et retourne uniquement les lignes où age est supérieur à 30.',
  q5: 'HAVING s\'applique après GROUP BY pour filtrer des groupes agrégés.',
  q6: 'DESC = décroissant (du plus grand au plus petit). ASC = croissant (défaut).',
  q7: 'LEFT JOIN garde toutes les lignes de la table gauche, NULL si pas de correspondance à droite.',
  q8: 'AVG() calcule la moyenne arithmétique d\'une colonne numérique.',
};

const SQL_FALLBACK_SCENARIOS = [
  { title: 'Utilisateurs inactifs', context: 'L\'équipe sécurité veut identifier les comptes inactifs.', goal: 'Lister les usernames des utilisateurs dont is_active = 0.', hint: 'Utilisez WHERE is_active = 0', successCriteria: ['SELECT avec FROM users', 'WHERE is_active = 0'] },
  { title: 'Commandes payées', context: 'La finance veut le total des commandes payées.', goal: 'Calculer la somme des montants des commandes avec status = "paid".', hint: 'Utilisez SUM(amount) avec WHERE status = "paid"', successCriteria: ['SUM(amount)', 'WHERE status'] },
  { title: 'Connexions par pays', context: 'L\'équipe analytics veut voir les connexions par pays.', goal: 'Compter les sessions groupées par pays, triées par nombre décroissant.', hint: 'GROUP BY country, COUNT(*), ORDER BY DESC', successCriteria: ['GROUP BY country', 'COUNT(*)'] },
];

const PYTHON_FALLBACK_QUESTIONS = [
  { id: 'q1', question: 'Comment importer pandas ?', options: ['import pandas as pd', 'from pandas import *', 'import pd', 'load pandas'] },
  { id: 'q2', question: 'df[df["age"] > 30] retourne :', options: ['Erreur', 'Les lignes où age > 30', 'Une colonne', 'La somme des ages'] },
  { id: 'q3', question: 'df.groupby("dept")["salaire"].mean() calcule :', options: ['La somme par dept', 'Le max par dept', 'La moyenne de salaire par dept', 'Le min par dept'] },
  { id: 'q4', question: 'pd.merge(df1, df2, on="id") est équivalent à :', options: ['INNER JOIN SQL', 'LEFT JOIN SQL', 'UNION SQL', 'CROSS JOIN SQL'] },
  { id: 'q5', question: 'df["col"].apply(lambda x: x*2) :', options: ['Filtre les valeurs', 'Trie la colonne', 'Compte les valeurs', 'Applique une fonction à chaque valeur'] },
  { id: 'q6', question: 'df.dropna() :', options: ['Remplace les NaN par 0', 'Supprime les lignes avec NaN', 'Crée une copie', 'Trie les données'] },
  { id: 'q7', question: 'df.sort_values("col", ascending=False) :', options: ['Filtre les valeurs', 'Trie par ordre croissant', 'Trie du plus grand au plus petit', 'Groupe les données'] },
  { id: 'q8', question: 'df["col"].value_counts() :', options: ['Compte les occurrences de chaque valeur', 'Somme les valeurs', 'Calcule la moyenne', 'Retourne les valeurs uniques'] },
];

const PYTHON_EXPLANATIONS: Record<string, string> = {
  q1: 'La convention universelle est "import pandas as pd". L\'alias pd est standard.',
  q2: 'df[condition] filtre le DataFrame et retourne les lignes où la condition est vraie.',
  q3: 'groupby().mean() calcule la moyenne de la colonne pour chaque groupe.',
  q4: 'pd.merge avec on= correspond à un INNER JOIN SQL sur la clé spécifiée.',
  q5: 'apply(lambda) applique une fonction à chaque élément de la Series.',
  q6: 'dropna() supprime toutes les lignes contenant au moins une valeur NaN.',
  q7: 'ascending=False trie du plus grand au plus petit (ordre décroissant).',
  q8: 'value_counts() retourne le nombre d\'occurrences de chaque valeur unique.',
};

const PYTHON_FALLBACK_SCENARIOS = [
  { title: 'Analyse des ventes', context: 'Tu es data analyst dans une entreprise e-commerce.', goal: 'Filtrer les commandes supérieures à 100€ et calculer la moyenne.', starterCode: 'import pandas as pd\n\ndata = {"id": [1,2,3,4,5], "montant": [50, 150, 200, 80, 300], "status": ["paid","paid","pending","paid","paid"]}\ndf = pd.DataFrame(data)\n\n# Filtre les commandes > 100€\n', hint: 'Utilisez df[df["montant"] > 100]', successCriteria: ['Filtrage > 100', 'mean() ou average'] },
  { title: 'Groupby département', context: 'RH veut le salaire moyen par département.', goal: 'Calculer le salaire moyen par département avec groupby.', starterCode: 'import pandas as pd\n\ndata = {"dept": ["IT","RH","IT","Finance","RH"], "salaire": [65000, 42000, 72000, 58000, 38000]}\ndf = pd.DataFrame(data)\n\n# Salaire moyen par département\n', hint: 'df.groupby("dept")["salaire"].mean()', successCriteria: ['groupby("dept")', 'mean()'] },
];

const EXCEL_FALLBACK_EXERCISES = [
  { id: 1, title: 'Total des ventes', instruction: 'Calculez la somme de la colonne C (C2:C11)', hint: 'Utilisez la fonction SUM', solution: '=SUM(C2:C11)', explanation: 'SUM additionne toutes les valeurs de la plage spécifiée.' },
  { id: 2, title: 'Ventes IT uniquement', instruction: 'Additionnez les ventes (col C) uniquement pour le département IT (col A)', hint: 'SUMIF avec la plage A2:A11, critère "IT", somme C2:C11', solution: '=SUMIF(A2:A11,"IT",C2:C11)', explanation: 'SUMIF additionne selon une condition dans une autre colonne.' },
  { id: 3, title: 'Compte Marketing', instruction: 'Comptez combien d\'employés sont dans le département Marketing', hint: 'COUNTIF sur la colonne A avec critère "Marketing"', solution: '=COUNTIF(A2:A11,"Marketing")', explanation: 'COUNTIF compte les cellules correspondant au critère.' },
  { id: 4, title: 'Catégoriser les ventes', instruction: 'Affichez "Top" si la vente en C2 dépasse 70000, sinon "Standard"', hint: 'IF(C2>70000,"Top","Standard")', solution: '=IF(C2>70000,"Top","Standard")', explanation: 'IF évalue une condition et retourne l\'une ou l\'autre valeur.' },
];

export default router;
