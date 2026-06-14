
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal, CheckCircle, ChevronRight, ChevronDown,
  Lightbulb, Database, BookOpen, Trophy, Play, AlertCircle,
  Table2, Send, RefreshCw, XCircle, Users, BarChart3, Clock,
  Trash2, ShieldCheck, ShieldOff, LogOut, UserPlus,
  TimerReset,
} from 'lucide-react';

import { Editor } from '@monaco-editor/react';

async function apiRequest<T = unknown>(url: string, options: RequestInit & { headers?: Record<string, string> } = {}): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data as T;
}

// ─────────────────────────────────────────────────────────────
// Domain types
// ─────────────────────────────────────────────────────────────

type AppView =
  | 'entry-choice'
  | 'recruiter-entry'
  | 'recruiter-dashboard'
  | 'candidate-login'
  | 'candidate-space'
  | 'candidate-test'
  | 'candidate-done';

type ChallengeType = 'sql' | 'python' | 'qcm' | 'english';

interface RecruiterSession { id: string; name: string }
interface CandidateSession { id: string; name: string; recruiterId: string; challengeType: ChallengeType; assignedTests?: ChallengeType[] }

interface SqlCandidateRecord {
  id: string;
  name: string;
  challenge_type: ChallengeType;
  assigned_tests?: ChallengeType[];
  access_granted: boolean;
  created_at: string;
}

interface ChallengeResult {
  id: number;
  candidate_id: string;
  candidate_name: string;
  challenge_type: ChallengeType;
  score: number;
  total_exercises: number;
  time_seconds: number;
  exercises_detail: ExerciseDetail[];
  early_quit: boolean;
  submitted_at: string;
}

interface ExerciseDetail {
  exerciseId: number;
  title: string;
  completed: boolean;
  attempts: number;
  timeSeconds: number;
}

// ─────────────────────────────────────────────────────────────
// Exercises catalogue
// ─────────────────────────────────────────────────────────────

type Difficulty = 'débutant' | 'intermédiaire' | 'avancé' | 'expert';

interface SqlExercise {
  id: number;
  title: string;
  difficulty: Difficulty;
  category: string;
  problem: string;
  expectedOutput: string;
  expectedColumns: string[];
  hints: string[];
  validate: (columns: string[], rows: Array<Record<string, unknown>>, query?: string) => { valid: boolean; feedback: string };
}

interface PythonExercise {
  id: number;
  title: string;
  difficulty: Difficulty;
  category: string;
  problem: string;
  expectedOutput: string;
  hints: string[];
  starterCode: string;
  validate: (output: string, code?: string) => { valid: boolean; feedback: string };
}

interface QcmExercise {
  id: number;
  title: string;
  difficulty: Difficulty;
  category: string;
  problem: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

interface EmailBlank {
  id: number;
  answer: string;
  acceptableAnswers?: string[];
}

interface EmailFillBlankExercise {
  id: number;
  type: 'email_fill';
  title: string;
  difficulty: Difficulty;
  category: string;
  from: string;
  to: string;
  subject: string;
  emailBody: string; // contains {{blank_1}}, {{blank_2}}, etc.
  blanks: EmailBlank[];
  explanation: string;
}

type EnglishExercise = QcmExercise | EmailFillBlankExercise;

const EXERCISES: SqlExercise[] = [
  {
    id: 1, title: 'Comptes administrateurs actifs', difficulty: 'débutant', category: 'SELECT / WHERE',
    problem: "08:10, prise de poste SOC. Le responsable sécurité vous confie une première mission de contrôle d'accès: établir rapidement la liste fiable des comptes administrateurs encore actifs pour préparer une revue de privilèges avant le comité de 09:00.",
    expectedOutput: "Colonnes id, username, email - uniquement les admins avec is_active = true.",
    expectedColumns: ['id', 'username', 'email'],
    hints: ["SELECT id, username, email FROM users …", "WHERE role = 'admin' AND is_active = true"],
    validate(cols, rows, query = '') {
      const q = query.toLowerCase();
      const hasRoleFilter = /role\s*=\s*['\"]admin['\"]/.test(q);
      const hasIsActiveFilter = /is_active\s*=\s*(true|1)/.test(q);
      const lower = cols.map(c => c.toLowerCase());
      if (!['id','username','email'].every(c => lower.includes(c))) return { valid: false, feedback: "Colonnes id, username, email requises." };
      if (!hasRoleFilter || !hasIsActiveFilter) return { valid: false, feedback: "Filtre requis: WHERE role = 'admin' AND is_active = true." };
      if (rows.length === 0) return { valid: false, feedback: "Aucun résultat. Des admins actifs existent dans la base." };
      return { valid: true, feedback: `Correct - ${rows.length} compte(s) admin actif(s).` };
    },
  },
  {
    id: 2, title: '5 dernières tentatives échouées', difficulty: 'débutant', category: 'ORDER BY / LIMIT',
    problem: "08:25, une alerte brute force monte dans le SIEM. Votre mission est de fournir immédiatement au L2 les 5 dernières tentatives d'authentification échouées afin de qualifier la cinétique de l'attaque et décider d'un blocage temporaire.",
    expectedOutput: "Toutes les colonnes de failed_logins, triées par attempted_at DESC, LIMIT 5.",
    expectedColumns: ['id', 'ip', 'attempted_at'],
    hints: ["SELECT * FROM failed_logins", "ORDER BY attempted_at DESC", "LIMIT 5"],
    validate(cols, rows, query = '') {
      const q = query.toLowerCase();
      if (rows.length === 0) return { valid: false, feedback: "Aucun résultat." };
      if (rows.length > 5) return { valid: false, feedback: `${rows.length} lignes - limitez à 5 avec LIMIT 5.` };
      if (!/from\s+failed_logins\b/.test(q) || !/order\s+by\s+attempted_at\s+desc/.test(q) || !/limit\s+5\b/.test(q)) {
        return { valid: false, feedback: "Requête attendue sur failed_logins avec ORDER BY attempted_at DESC et LIMIT 5." };
      }
      const lower = cols.map(c => c.toLowerCase());
      if (!lower.includes('attempted_at')) return { valid: false, feedback: "Colonne attempted_at absente." };
      if (rows.length >= 2) {
        const t0 = new Date(String(rows[0]['attempted_at'])).getTime();
        const t1 = new Date(String(rows[1]['attempted_at'])).getTime();
        if (!isNaN(t0) && !isNaN(t1) && t0 < t1) return { valid: false, feedback: "Tri incorrect - ORDER BY attempted_at DESC." };
      }
      return { valid: true, feedback: `Correct - ${rows.length} tentatives les plus récentes.` };
    },
  },
  {
    id: 3, title: 'Statistiques du pare-feu par action', difficulty: 'débutant', category: 'GROUP BY / COUNT',
    problem: "08:40, le manager SOC demande un point de situation en 2 minutes. Vous devez produire une vue synthétique des événements pare-feu par type d'action (ALLOW, BLOCK, DROP) pour objectiver la pression réseau observée.",
    expectedOutput: "Colonnes action et nb_evenements, triées par nb_evenements DESC.",
    expectedColumns: ['action', 'nb_evenements'],
    hints: ["SELECT action, COUNT(*) AS nb_evenements FROM firewall_events", "GROUP BY action", "ORDER BY nb_evenements DESC"],
    validate(cols, rows, query = '') {
      const q = query.toLowerCase();
      const lower = cols.map(c => c.toLowerCase());
      if (!/from\s+firewall_events\b/.test(q) || !/group\s+by\s+action/.test(q) || !/count\s*\(/.test(q)) {
        return { valid: false, feedback: "Utilisez firewall_events avec GROUP BY action et COUNT(*)." };
      }
      if (!lower.includes('action')) return { valid: false, feedback: "Colonne action manquante." };
      if (!lower.some(c => c.includes('nb') || c.includes('count') || c.includes('total'))) return { valid: false, feedback: "Colonne de comptage manquante (COUNT(*) AS nb_evenements)." };
      if (rows.length < 2) return { valid: false, feedback: "Résultats insuffisants - plusieurs types d'actions existent." };
      return { valid: true, feedback: `Correct - ${rows.length} type(s) d'action comptabilisé(s).` };
    },
  },
  {
    id: 4, title: 'Vulnérabilités critiques ouvertes', difficulty: 'débutant', category: 'WHERE / filtrage',
    problem: "09:00, le RSSI rejoint la cellule de crise et exige un plan de remédiation priorisé. Votre mission est d'extraire les vulnérabilités critiques encore ouvertes, triées par ancienneté, pour lancer les correctifs sur les actifs les plus exposés.",
    expectedOutput: "Colonnes cve_id, host, discovered_at - severity='critical', status='open', ORDER BY discovered_at ASC.",
    expectedColumns: ['cve_id', 'host', 'discovered_at'],
    hints: ["WHERE severity = 'critical' AND status = 'open'", "ORDER BY discovered_at ASC"],
    validate(cols, rows, query = '') {
      const q = query.toLowerCase();
      const lower = cols.map(c => c.toLowerCase());
      if (!['cve_id','host','discovered_at'].every(c => lower.includes(c))) return { valid: false, feedback: "Colonnes cve_id, host, discovered_at requises." };
      if (!/from\s+vulnerabilities\b/.test(q) || !/severity\s*=\s*['\"]critical['\"]/.test(q) || !/status\s*=\s*['\"]open['\"]/.test(q)) {
        return { valid: false, feedback: "Filtre requis: severity='critical' ET status='open' sur vulnerabilities." };
      }
      if (rows.length === 0) return { valid: false, feedback: "Aucun résultat. Des CVE critiques ouvertes existent." };
      return { valid: true, feedback: `Correct - ${rows.length} vulnérabilité(s) critique(s) ouverte(s).` };
    },
  },
  {
    id: 5, title: "IPs suspectes - plus de 2 échecs (HAVING)", difficulty: 'intermédiaire', category: 'HAVING',
    problem: "09:20, le périmètre de l'incident s'élargit. Une règle de détection doit être appliquée en urgence: toute IP avec plus de 2 échecs en 24h passe en surveillance renforcée. Vous devez livrer cette shortlist exploitable par l'équipe de réponse.",
    expectedOutput: "Colonnes ip et nb_tentatives, uniquement les IPs avec COUNT > 2. ORDER BY nb_tentatives DESC.",
    expectedColumns: ['ip', 'nb_tentatives'],
    hints: ["WHERE attempted_at >= NOW() - INTERVAL '24 hours'", "GROUP BY ip", "HAVING COUNT(*) > 2"],
    validate(cols, rows, query = '') {
      const q = query.toLowerCase();
      const lower = cols.map(c => c.toLowerCase());
      if (!/from\s+failed_logins\b/.test(q) || !/group\s+by\s+ip/.test(q) || !/having\s+count\s*\(\s*\*\s*\)\s*>\s*2/.test(q)) {
        return { valid: false, feedback: "Requête attendue: failed_logins + GROUP BY ip + HAVING COUNT(*) > 2." };
      }
      if (!lower.includes('ip')) return { valid: false, feedback: "Colonne ip manquante." };
      if (!lower.some(c => c.includes('nb') || c.includes('tentative') || c.includes('count'))) return { valid: false, feedback: "Colonne de comptage manquante." };
      const nbCol = cols[lower.findIndex(c => c.includes('nb') || c.includes('tentative') || c.includes('count'))];
      if (rows.some(r => Number(r[nbCol]) <= 2)) return { valid: false, feedback: "Des IPs avec ≤ 2 tentatives présentes - vérifiez HAVING COUNT(*) > 2." };
      return { valid: true, feedback: `Correct - ${rows.length} IP(s) suspecte(s) identifiée(s).` };
    },
  },
  {
    id: 6, title: "Utilisateurs et leurs échecs (LEFT JOIN)", difficulty: 'intermédiaire', category: 'LEFT JOIN',
    problem: "09:35, l'équipe IAM veut distinguer les comptes réellement touchés des comptes sains. Vous devez produire une vision complète de tous les utilisateurs avec leur nombre d'échecs, y compris ceux à 0, pour éviter tout biais d'analyse.",
    expectedOutput: "Colonnes username, email, nb_echecs. Tous les utilisateurs. ORDER BY nb_echecs DESC.",
    expectedColumns: ['username', 'email', 'nb_echecs'],
    hints: ["FROM users u LEFT JOIN failed_logins fl ON u.id = fl.user_id", "COUNT(fl.id) AS nb_echecs", "GROUP BY u.id, u.username, u.email"],
    validate(cols, rows, query = '') {
      const q = query.toLowerCase();
      const lower = cols.map(c => c.toLowerCase());
      if (!/from\s+users\b/.test(q) || !/left\s+join\s+failed_logins\b/.test(q)) {
        return { valid: false, feedback: "Utilisez un LEFT JOIN entre users et failed_logins." };
      }
      if (!['username','email'].every(c => lower.includes(c))) return { valid: false, feedback: "Colonnes username et email requises." };
      if (!lower.some(c => c.includes('nb') || c.includes('echec') || c.includes('count'))) return { valid: false, feedback: "Colonne de comptage des échecs requise." };
      const nbCol = cols[lower.findIndex(c => c.includes('nb') || c.includes('echec') || c.includes('count'))];
      if (!rows.some(r => Number(r[nbCol]) === 0)) return { valid: false, feedback: "Aucun utilisateur avec 0 échec - utilisez LEFT JOIN, pas INNER JOIN." };
      return { valid: true, feedback: `Correct - ${rows.length} utilisateurs, dont ${rows.filter(r => Number(r[nbCol]) === 0).length} sans incident.` };
    },
  },
  {
    id: 7, title: 'Matrice vulns par hôte (agrégation conditionnelle)', difficulty: 'intermédiaire', category: 'FILTER / CASE WHEN',
    problem: "10:00, passage en mode priorisation opérationnelle. Le responsable patch management vous demande une matrice par hôte (critical, high, total) afin d'ordonner les interventions terrain et d'assigner les techniciens selon le risque.",
    expectedOutput: "Colonnes host, critical, high, total. Une ligne par hôte. ORDER BY critical DESC.",
    expectedColumns: ['host', 'critical', 'high', 'total'],
    hints: ["COUNT(*) FILTER (WHERE severity = 'critical') AS critical", "COUNT(*) FILTER (WHERE severity = 'high') AS high", "COUNT(*) AS total - GROUP BY host"],
    validate(cols, rows, query = '') {
      const q = query.toLowerCase();
      const lower = cols.map(c => c.toLowerCase());
      if (!/from\s+vulnerabilities\b/.test(q) || !/group\s+by\s+host/.test(q) || !/count\s*\(/.test(q)) {
        return { valid: false, feedback: "Utilisez vulnerabilities avec agrégations et GROUP BY host." };
      }
      if (!lower.includes('host')) return { valid: false, feedback: "Colonne host requise." };
      if (!lower.some(c => c.includes('critical') || c.includes('crit'))) return { valid: false, feedback: "Colonne critical manquante." };
      if (!lower.some(c => c.includes('total') || c.includes('count'))) return { valid: false, feedback: "Colonne total manquante." };
      if (rows.length === 0) return { valid: false, feedback: "Aucun résultat." };
      return { valid: true, feedback: `Correct - matrice pour ${rows.length} hôte(s).` };
    },
  },
  {
    id: 8, title: 'Utilisateurs sans aucun incident (NOT IN)', difficulty: 'intermédiaire', category: 'NOT IN / sous-requête',
    problem: "10:20, en parallèle de la crise, la direction demande quels profils restent stables. Votre mission est d'identifier les utilisateurs sans incident d'authentification pour constituer un groupe de référence à faible risque et comparer les comportements.",
    expectedOutput: "Colonnes username et role. ORDER BY username. Attention aux NULLs dans user_id.",
    expectedColumns: ['username', 'role'],
    hints: ["WHERE id NOT IN (SELECT user_id FROM failed_logins WHERE user_id IS NOT NULL)", "Sans IS NOT NULL, NOT IN retourne 0 résultat si des NULLs existent"],
    validate(cols, rows, query = '') {
      const q = query.toLowerCase();
      const lower = cols.map(c => c.toLowerCase());
      const usesNotExists = /not\s+exists/.test(q);
      const usesSafeNotIn = /not\s+in/.test(q) && /user_id\s+is\s+not\s+null/.test(q);
      if (!(usesNotExists || usesSafeNotIn) || !/(from|join)\s+failed_logins\b/.test(q)) {
        return { valid: false, feedback: "Utilisez NOT IN/NOT EXISTS avec failed_logins et user_id IS NOT NULL." };
      }
      if (!['username','role'].every(c => lower.includes(c))) return { valid: false, feedback: "Colonnes username et role requises." };
      if (rows.length === 0) return { valid: false, feedback: "Aucun résultat. Ajoutez WHERE user_id IS NOT NULL dans la sous-requête." };
      return { valid: true, feedback: `Correct - ${rows.length} utilisateur(s) sans aucun incident.` };
    },
  },
  {
    id: 9, title: 'IPs bloquées ET avec échecs d\'auth', difficulty: 'avancé', category: 'JOIN multi-tables',
    problem: "11:00, les analystes suspectent une campagne coordonnée. Vous devez corréler pare-feu et authentification pour isoler les IPs à double signal faible/fort (bloquées ou droppées ET en échec d'auth), afin d'alimenter la liste d'IOC prioritaire.",
    expectedOutput: "Colonnes src_ip, nb_blocks, nb_echecs. IPs dans les deux tables. ORDER BY nb_blocks DESC.",
    expectedColumns: ['src_ip', 'nb_blocks', 'nb_echecs'],
    hints: ["Agrégez firewall_events filtré sur action IN ('BLOCK','DROP') GROUP BY src_ip", "Agrégez failed_logins GROUP BY ip", "INNER JOIN sur l'adresse IP"],
    validate(cols, rows, query = '') {
      const q = query.toLowerCase();
      const lower = cols.map(c => c.toLowerCase());
      if (!/(from|join)\s+firewall_events\b/.test(q) || !/(from|join)\s+failed_logins\b/.test(q) || !/join/.test(q) || !/\b(block|drop)\b/.test(q)) {
        return { valid: false, feedback: "Croisez firewall_events et failed_logins avec filtre BLOCK/DROP." };
      }
      if (!lower.some(c => c.includes('ip') || c.includes('src'))) return { valid: false, feedback: "Colonne IP manquante." };
      if (!lower.some(c => c.includes('block'))) return { valid: false, feedback: "Colonne nb_blocks manquante." };
      if (!lower.some(c => c.includes('echec') || c.includes('fail'))) return { valid: false, feedback: "Colonne nb_echecs manquante." };
      if (rows.length === 0) return { valid: false, feedback: "Aucun résultat. Des IPs à double activité existent." };
      return { valid: true, feedback: `Correct - ${rows.length} IP(s) à double activité suspecte.` };
    },
  },
  {
    id: 10, title: 'Hôtes 100% critiques/hauts (exclusion)', difficulty: 'avancé', category: 'Sous-requête NOT IN',
    problem: "11:25, la production continue mais certains hôtes sont potentiellement intenables. Votre mission est d'identifier les machines n'ayant que des vulnérabilités high/critical, sans aucune medium/low, pour décider d'un isolement réseau immédiat.",
    expectedOutput: "Colonnes host, total_vulns. Hôtes sans aucune vuln medium/low. ORDER BY total_vulns DESC.",
    expectedColumns: ['host', 'total_vulns'],
    hints: ["Trouvez les hôtes avec AU MOINS UNE vuln hors critical/high :", "SELECT DISTINCT host FROM vulnerabilities WHERE severity NOT IN ('critical','high')", "WHERE host NOT IN (sous-requête)"],
    validate(cols, rows, query = '') {
      const q = query.toLowerCase();
      const lower = cols.map(c => c.toLowerCase());
      if (!/from\s+vulnerabilities\b/.test(q) || !/(not\s+in|not\s+exists)/.test(q) || !/severity\s+not\s+in\s*\(\s*['\"](critical|high)['\"]\s*,\s*['\"](critical|high)['\"]\s*\)/.test(q)) {
        return { valid: false, feedback: "Excluez les hôtes avec severity NOT IN ('critical','high')." };
      }
      if (!lower.includes('host')) return { valid: false, feedback: "Colonne host requise." };
      if (!lower.some(c => c.includes('total') || c.includes('vuln') || c.includes('count'))) return { valid: false, feedback: "Colonne total_vulns requise." };
      if (rows.length === 0) return { valid: false, feedback: "Aucun résultat. Certains hôtes n'ont que des vulns critical/high." };
      return { valid: true, feedback: `Correct - ${rows.length} hôte(s) uniquement critical/high.` };
    },
  },
  {
    id: 11, title: 'IPs suspectes enrichies (CTE)', difficulty: 'avancé', category: 'CTE (WITH)',
    problem: "11:45, le directeur cybersécurité veut une vue enrichie et défendable en comité de crise. Vous devez d'abord isoler les IPs avec au moins 3 échecs d'auth, puis les enrichir avec le nombre de blocages firewall pour construire un score d'escalade.",
    expectedOutput: "Colonnes ip, nb_echecs, nb_blocks. IPs avec ≥3 échecs. ORDER BY nb_echecs DESC.",
    expectedColumns: ['ip', 'nb_echecs', 'nb_blocks'],
    hints: [
      "WITH ips_suspectes AS (SELECT ip, COUNT(*) AS nb_echecs FROM failed_logins GROUP BY ip HAVING COUNT(*) >= 3)",
      "SELECT i.ip, i.nb_echecs, COUNT(fe.id) AS nb_blocks FROM ips_suspectes i LEFT JOIN firewall_events fe ON fe.src_ip = i.ip AND fe.action = 'BLOCK' GROUP BY i.ip, i.nb_echecs",
    ],
    validate(cols, rows, query = '') {
      const q = query.toLowerCase();
      const lower = cols.map(c => c.toLowerCase());
      if (!/^\s*with\b/.test(q) || !/having\s+count\s*\(\s*\*\s*\)\s*>?=\s*3/.test(q)) {
        return { valid: false, feedback: "Utilisez une CTE (WITH) et HAVING COUNT(*) >= 3." };
      }
      if (!lower.includes('ip')) return { valid: false, feedback: "Colonne ip manquante." };
      if (!lower.some(c => c.includes('echec'))) return { valid: false, feedback: "Colonne nb_echecs manquante." };
      if (!lower.some(c => c.includes('block'))) return { valid: false, feedback: "Colonne nb_blocks manquante." };
      const echCol = cols[lower.findIndex(c => c.includes('echec'))];
      if (rows.some(r => Number(r[echCol]) < 3)) return { valid: false, feedback: "Des IPs avec < 3 échecs présentes - vérifiez HAVING COUNT(*) >= 3." };
      return { valid: true, feedback: `Correct - ${rows.length} IP(s) suspecte(s) enrichies.` };
    },
  },
  {
    id: 12, title: 'Niveau de risque par IP (CASE WHEN)', difficulty: 'avancé', category: 'CASE WHEN',
    problem: "12:10, le pilotage passe en mode KPI. Votre mission est de transformer le volume brut des tentatives en niveau de risque lisible (faible, moyen, élevé) pour faciliter les arbitrages du commandement et orienter les équipes de monitoring.",
    expectedOutput: "Colonnes ip, nb_tentatives, niveau_risque. ORDER BY nb_tentatives DESC.",
    expectedColumns: ['ip', 'nb_tentatives', 'niveau_risque'],
    hints: ["CASE WHEN COUNT(*) >= 6 THEN 'élevé' WHEN COUNT(*) >= 3 THEN 'moyen' ELSE 'faible' END AS niveau_risque", "GROUP BY ip - ORDER BY nb_tentatives DESC"],
    validate(cols, rows, query = '') {
      const q = query.toLowerCase();
      const lower = cols.map(c => c.toLowerCase());
      if (!/case\s+when/.test(q) || !/group\s+by\s+ip/.test(q)) {
        return { valid: false, feedback: "Utilisez CASE WHEN avec GROUP BY ip." };
      }
      if (!lower.includes('ip')) return { valid: false, feedback: "Colonne ip manquante." };
      if (!lower.some(c => c.includes('risque') || c.includes('niveau'))) return { valid: false, feedback: "Colonne niveau_risque manquante." };
      if (!lower.some(c => c.includes('nb') || c.includes('tentative'))) return { valid: false, feedback: "Colonne nb_tentatives manquante." };
      return { valid: true, feedback: `Correct - ${rows.length} IP(s) classifiées par niveau de risque.` };
    },
  },
  {
    id: 13, title: 'Classement des IPs (RANK)', difficulty: 'expert', category: 'Window Functions - RANK()',
    problem: "12:40, la cellule forensics prépare une chasse proactive. Vous devez produire un classement robuste des IPs les plus agressives avec gestion des ex-aequo via RANK(), afin de définir l'ordre de traitement des investigations.",
    expectedOutput: "Colonnes rang, ip, nb_tentatives. ORDER BY rang ASC (rang 1 = plus dangereux).",
    expectedColumns: ['rang', 'ip', 'nb_tentatives'],
    hints: [
      "WITH grouped AS (SELECT ip, COUNT(*) AS nb_tentatives FROM failed_logins GROUP BY ip)",
      "SELECT RANK() OVER (ORDER BY nb_tentatives DESC) AS rang, ip, nb_tentatives FROM grouped ORDER BY rang",
    ],
    validate(cols, rows, query = '') {
      const q = query.toLowerCase();
      const lower = cols.map(c => c.toLowerCase());
      if (!/rank\s*\(/.test(q)) return { valid: false, feedback: "RANK() est requis pour cet exercice." };
      if (!lower.some(c => c.includes('rang') || c.includes('rank'))) return { valid: false, feedback: "Colonne rang (RANK()) manquante." };
      if (rows.length === 0) return { valid: false, feedback: "Aucun résultat." };
      const rangCol = cols[lower.findIndex(c => c.includes('rang') || c.includes('rank'))];
      if (Number(rows[0][rangCol]) !== 1) return { valid: false, feedback: "Le premier rang doit être 1 - triez par rang ASC." };
      return { valid: true, feedback: `Correct - ${rows.length} IPs classées. Rang 1 = menace principale.` };
    },
  },
  {
    id: 14, title: 'Délai entre tentatives (LAG)', difficulty: 'expert', category: 'Window Functions - LAG()',
    problem: "13:05, de nouveaux signaux évoquent des bots adaptatifs. Votre mission est d'analyser la temporalité des attaques en calculant, pour chaque IP, le délai exact entre deux échecs successifs afin de distinguer automatisation et activité humaine.",
    expectedOutput: "Colonnes ip, attempted_at, delai_sec. Seulement les lignes avec une tentative précédente (sans la première de chaque IP).",
    expectedColumns: ['ip', 'delai_sec'],
    hints: [
      "WITH base AS (SELECT ip, attempted_at, LAG(attempted_at) OVER (PARTITION BY ip ORDER BY attempted_at) AS prev FROM failed_logins)",
      "SELECT ip, attempted_at, EXTRACT(EPOCH FROM (attempted_at - prev))::INT AS delai_sec FROM base WHERE prev IS NOT NULL",
    ],
    validate(cols, rows, query = '') {
      const q = query.toLowerCase();
      const lower = cols.map(c => c.toLowerCase());
      if (!/lag\s*\(/.test(q) || !/partition\s+by\s+ip/.test(q)) {
        return { valid: false, feedback: 'Utilisez LAG() PARTITION BY ip pour calculer le délai.' };
      }
      if (!lower.includes('ip')) return { valid: false, feedback: 'Colonne ip manquante.' };
      if (!lower.some(c => c.includes('delai'))) return { valid: false, feedback: 'Colonne delai_sec manquante.' };
      if (rows.length === 0) return { valid: false, feedback: 'Aucun résultat. Des délais entre tentatives existent.' };
      return { valid: true, feedback: `Correct - ${rows.length} délai(s) calculé(s).` };
    },
  },
  {
    id: 15, title: 'IPs bloquées ET avec échecs d\'auth', difficulty: 'expert', category: 'JOIN multi-tables',
    problem: "13:30, briefing final avant décision exécutive. Vous devez livrer la corrélation consolidée des IPs présentes à la fois dans les événements firewall BLOCK/DROP et dans les échecs d'authentification, pour valider les mesures de confinement longue durée.",
    expectedOutput: 'Colonnes src_ip, nb_blocks, nb_echecs. IPs présentes dans les deux jeux de données.',
    expectedColumns: ['src_ip', 'nb_blocks', 'nb_echecs'],
    hints: [
      "Agrégez firewall_events filtré sur action IN ('BLOCK','DROP') GROUP BY src_ip",
      'Agrégez failed_logins GROUP BY ip',
      'Faites un INNER JOIN entre les deux agrégats sur l\'adresse IP',
    ],
    validate(cols, rows, query = '') {
      const q = query.toLowerCase();
      const lower = cols.map(c => c.toLowerCase());
      if (!/(from|join)\s+firewall_events\b/.test(q) || !/(from|join)\s+failed_logins\b/.test(q) || !/join/.test(q) || !/\b(block|drop)\b/.test(q)) {
        return { valid: false, feedback: "Croisez firewall_events et failed_logins avec filtre BLOCK/DROP." };
      }
      if (!lower.some(c => c.includes('src_ip') || c === 'ip')) return { valid: false, feedback: 'Colonne src_ip manquante.' };
      if (!lower.some(c => c.includes('block'))) return { valid: false, feedback: 'Colonne nb_blocks manquante.' };
      if (!lower.some(c => c.includes('echec'))) return { valid: false, feedback: 'Colonne nb_echecs manquante.' };
      if (rows.length === 0) return { valid: false, feedback: 'Aucun résultat. Des IPs à double menace existent dans la base.' };
      return { valid: true, feedback: `Correct - ${rows.length} IP(s) à menace double confirmée.` };
    },
  },
];

function normalizeOutput(output: string) {
  return output.replace(/\r\n/g, '\n').trim();
}

function exactOutputValidator(
  expectedOutput: string,
  successMessage: string,
  codeRequirements: Array<{ pattern: RegExp; feedback: string }> = [],
) {
  return (output: string, code = '') => {
    const normalizedOutput = normalizeOutput(output);
    const normalizedExpected = normalizeOutput(expectedOutput);
    if (normalizedOutput !== normalizedExpected) {
      return {
        valid: false,
        feedback: `Sortie attendue: ${expectedOutput}`,
      };
    }

    for (const requirement of codeRequirements) {
      if (!requirement.pattern.test(code)) {
        return { valid: false, feedback: requirement.feedback };
      }
    }

    return { valid: true, feedback: successMessage };
  };
}

const PYTHON_EXERCISES: PythonExercise[] = [
  {
    id: 1,
    title: 'Somme de nombres',
    difficulty: 'débutant',
    category: 'Variables / sum',
    problem: "On vous intègre dans une équipe data produit et votre première mission est un quick-check de qualité de flux: calculer correctement le total d'un lot numérique pour valider que le pipeline d'agrégation renvoie une valeur fiable.",
    expectedOutput: '10',
    hints: ['Utilisez sum(numbers)', 'Stockez le resultat dans total', 'Affichez total avec print(total)'],
    starterCode: `numbers = [1, 2, 3, 4]

# TODO: calculez la somme
total = 0

print(total)
`,
    validate: exactOutputValidator('10', 'Correct - somme validee.', [
      { pattern: /sum\s*\(/i, feedback: 'Utilisez sum(...) pour calculer le total.' },
    ]),
  },
  {
    id: 2,
    title: 'Nombre de mots',
    difficulty: 'débutant',
    category: 'Strings / split',
    problem: "Le support contenu vous remonte des anomalies de segmentation de texte. Vous devez réaliser un contrôle simple mais essentiel: compter le nombre de mots d'une phrase de référence avant déploiement d'un pré-traitement NLP.",
    expectedOutput: '3',
    hints: ['Utilisez text.split()', 'Puis len(...)', 'Affichez le resultat'],
    starterCode: `text = "python est simple"

# TODO: comptez le nombre de mots
count = 0

print(count)
`,
    validate: exactOutputValidator('3', 'Correct - comptage des mots valide.', [
      { pattern: /split\s*\(/i, feedback: 'Utilisez split() pour découper les mots.' },
      { pattern: /len\s*\(/i, feedback: 'Utilisez len(...) pour compter les mots.' },
    ]),
  },
  {
    id: 3,
    title: 'Nombres pairs',
    difficulty: 'débutant',
    category: 'Boucles / conditions',
    problem: "Dans une mini-mission de préparation de données, vous devez filtrer les entrées valides selon une règle métier pair/impair afin d'alimenter correctement un traitement aval et fournir un rendu formaté pour vérification manuelle.",
    expectedOutput: '2,4,6',
    hints: ['Un nombre pair verifie n % 2 == 0', 'Ajoutez-le dans une liste', 'Utilisez join pour afficher le resultat'],
    starterCode: `numbers = [1, 2, 3, 4, 5, 6]

evens = []
for n in numbers:
    # TODO: ajouter n dans evens si n est pair
    pass

print(",".join(str(x) for x in evens))
`,
    validate: exactOutputValidator('2,4,6', 'Correct - filtrage des nombres pairs valide.', [
      { pattern: /%\s*2\s*==\s*0/i, feedback: 'Filtrez les pairs avec n % 2 == 0.' },
    ]),
  },
  {
    id: 4,
    title: 'Compter une lettre',
    difficulty: 'débutant',
    category: 'Strings / count',
    problem: "L'équipe QA vous demande un test de fréquence de caractères sur un mot témoin pour vérifier un module de normalisation linguistique. Votre mission est de compter précisément les occurrences de la lettre cible.",
    expectedOutput: '3',
    hints: ['Vous pouvez utiliser word.count("a")', 'Stockez le resultat dans total', 'Affichez total'],
    starterCode: `word = "banana"

# TODO: comptez le nombre de lettres "a"
total = 0

print(total)
`,
    validate: exactOutputValidator('3', 'Correct - comptage de lettre valide.', [
      { pattern: /count\s*\(\s*["']a["']\s*\)/i, feedback: 'Utilisez word.count("a") pour cet exercice.' },
    ]),
  },
  {
    id: 5,
    title: 'Plus grand nombre',
    difficulty: 'débutant',
    category: 'Listes / max',
    problem: "Avant de brancher un tableau de bord, on vous confie un contrôle de borne haute sur un jeu de mesures. Vous devez identifier rapidement la valeur maximale, utilisée comme seuil d'alerte de référence.",
    expectedOutput: '9',
    hints: ['Utilisez max(numbers)', 'Stockez le resultat dans biggest', 'Affichez biggest'],
    starterCode: `numbers = [7, 2, 9, 4]

# TODO: trouvez le plus grand nombre
biggest = 0

print(biggest)
`,
    validate: exactOutputValidator('9', 'Correct - maximum valide.', [
      { pattern: /max\s*\(/i, feedback: 'Utilisez max(numbers) pour trouver la plus grande valeur.' },
    ]),
  },
  {
    id: 6,
    title: 'Moteur de recherche simple',
    difficulty: 'intermédiaire',
    category: 'Search',
    problem: "Vous intervenez sur un moteur de recherche interne utilisé par les équipes opérationnelles. La mission du jour consiste à implémenter une recherche multi-termes stricte: ne renvoyer que les documents contenant tous les mots demandés pour éviter les faux positifs en production.",
    expectedOutput: 'machine learning python',
    hints: ['words = query_text.lower().split()', 'Testez: all(w in doc for w in words)', 'Ajoutez doc à results si la condition est vraie'],
    starterCode: `documents = [
  "python data science",
  "machine learning python",
  "cloud architecture",
]

query = "python learning"

def search(query_text):
    words = query_text.lower().split()
    results = []
    for doc in documents:
        # TODO: ajouter doc si tous les mots sont présents
        # if all(w in doc for w in words):
        pass
    return results

print("|".join(search(query)))
`,
    validate: exactOutputValidator('machine learning python', 'Correct - recherche interne opérationnelle.', [
      { pattern: /def\s+search\s*\(/i, feedback: 'Implémentez la fonction search(query_text).' },
      { pattern: /all\s*\(/i, feedback: 'Utilisez all(...) pour vérifier tous les mots.' },
    ]),
  },
  {
    id: 7,
    title: 'Détection de fraude',
    difficulty: 'intermédiaire',
    category: 'Fintech',
    problem: "Cellule risque fintech: une revue anti-fraude est en cours et vous devez détecter les transactions anormalement élevées par rapport au profil habituel de chaque client. Votre livrable sert directement à déclencher une investigation conformité.",
    expectedOutput: 'user1:600',
    hints: ['Les moyennes sont pré-calculées dans averages', 'avg = averages[user]', 'Ajoutez f"{user}:{amount}" si amount > 10 * avg'],
    starterCode: `transactions = [
  ("user1", 10), ("user1", 10), ("user1", 10),
  ("user1", 10), ("user1", 10), ("user1", 10),
  ("user1", 10), ("user1", 10), ("user1", 10),
  ("user1", 10), ("user1", 10), ("user1", 600),
  ("user2", 15), ("user2", 16),
]

# Étape 1: calcul des moyennes par utilisateur (déjà fait)
totals = {}; counts = {}
for user, amount in transactions:
    totals[user] = totals.get(user, 0) + amount
    counts[user] = counts.get(user, 0) + 1
averages = {u: totals[u] / counts[u] for u in totals}

# Étape 2: détectez les transactions suspectes
suspects = []
for user, amount in transactions:
    avg = averages[user]
    # TODO: si amount > 10 * avg, ajouter f"{user}:{amount}" à suspects
    pass

print("|".join(suspects))
`,
    validate: exactOutputValidator('user1:600', 'Correct - détection de fraude validée.', [
      { pattern: />\s*10\s*\*\s*avg/i, feedback: 'Appliquez la règle amount > 10 * avg.' },
      { pattern: /averages\s*\[\s*user\s*\]/i, feedback: "Utilisez la moyenne de l'utilisateur via averages[user]." },
    ]),
  },
  {
    id: 8,
    title: 'Système de cache',
    difficulty: 'intermédiaire',
    category: 'Backend Design',
    problem: "Sur une API à fort trafic, les temps de réponse explosent. Votre mission est de fiabiliser un mécanisme de cache pour éviter les recalculs coûteux, réduire la charge CPU et stabiliser la performance perçue par les utilisateurs.",
    expectedOutput: '50,40,50,50,40|2',
    hints: ['Vérifiez: if key in cache', "Si oui: return cache[key]", 'Sinon: calculez, stockez dans cache[key], retournez'],
    starterCode: `cache = {}
expensive_calls = 0

def expensive_compute(key):
    global expensive_calls
    expensive_calls += 1
    return len(key) * 10

def get_value(key):
    if key in cache:
        # TODO: retourner la valeur en cache
        return None  # à modifier: return cache[key]
    else:
        value = expensive_compute(key)
        cache[key] = value
        return value

queries = ["alpha", "beta", "alpha", "alpha", "beta"]
values = [get_value(q) for q in queries]
print(",".join(str(v) for v in values) + f"|{expensive_calls}")
`,
    validate: exactOutputValidator('50,40,50,50,40|2', 'Correct - cache fonctionnel.', [
      { pattern: /if\s+key\s+in\s+cache/i, feedback: "Vérifiez d'abord si la clé existe dans le cache." },
      { pattern: /return\s+cache\s*\[\s*key\s*\]/i, feedback: 'Retournez la valeur en cache quand la clé existe.' },
    ]),
  },
  {
    id: 9,
    title: 'Planification de tâches',
    difficulty: 'avancé',
    category: 'Scheduling',
    problem: "Vous prenez le relais d'un incident d'ordonnancement: plusieurs jobs critiques arrivent en même temps. La mission consiste à restituer un ordre d'exécution strict par priorité afin que les tâches business les plus urgentes passent en premier.",
    expectedOutput: 'task2,task3,task1',
    hints: ['sorted(tasks, key=lambda t: t[1]) trie par priorité', 'Extrayez les noms: [name for name, _ in sorted_tasks]', 'Joignez avec ",".join(task_names)'],
    starterCode: `tasks = [
  ("task1", 3),
  ("task2", 1),
  ("task3", 2),
]

# TODO: triez les tâches par priorité croissante (2ème élément du tuple)
# Astuce: sorted(tasks, key=lambda t: t[1])
sorted_tasks = []  # à remplacer par le résultat de sorted(...)

task_names = [name for name, _ in sorted_tasks]
print(",".join(task_names))
`,
    validate: exactOutputValidator('task2,task3,task1', 'Correct - planification validée.', [
      { pattern: /sorted\s*\(\s*tasks\s*,\s*key\s*=\s*lambda/i, feedback: 'Triez avec sorted(tasks, key=lambda ...).' },
    ]),
  },
  {
    id: 10,
    title: 'Analyse réseau',
    difficulty: 'avancé',
    category: 'Observabilité',
    problem: "En observabilité réseau, un pic d'activité est détecté. Vous devez extraire l'IP la plus fréquente à partir des logs agrégés pour orienter rapidement l'analyse de cause racine et décider d'une action de mitigation.",
    expectedOutput: '192.168.1.1',
    hints: ['counts est déjà construit pour vous', 'Utilisez: max(counts, key=counts.get)', 'Assignez le résultat à top_ip'],
    starterCode: `ips = [
  "192.168.1.1",
  "192.168.1.2",
  "192.168.1.1",
]

# Comptage (déjà fait)
counts = {}
for ip in ips:
    counts[ip] = counts.get(ip, 0) + 1

# TODO: trouver l'IP la plus fréquente
# Astuce: max(counts, key=counts.get)
top_ip = ""  # à remplacer

print(top_ip)
`,
    validate: exactOutputValidator('192.168.1.1', 'Correct - analyse réseau validée.', [
      { pattern: /max\s*\(\s*counts\s*,\s*key\s*=\s*counts\.get\s*\)/i, feedback: 'Utilisez max(counts, key=counts.get).' },
    ]),
  },
  {
    id: 11,
    title: 'Rate limiting',
    difficulty: 'avancé',
    category: 'API Platform',
    problem: "La plateforme API subit des rafales de trafic et risque la saturation. Votre mission est de mettre en oeuvre une règle de rate limiting opérationnelle pour identifier les utilisateurs à bloquer lorsqu'ils dépassent le seuil autorisé sur la fenêtre temporelle.",
    expectedOutput: 'user1',
    hints: ['user_times est déjà construit pour vous', 'Condition: len(times) > 3 ET times[-1] - times[0] <= 10', 'Ajoutez user à blocked_users si la condition est vraie'],
    starterCode: `requests = [
  ("user1", 1),
  ("user1", 2),
  ("user1", 3),
  ("user1", 4),
]

# Regroupement par utilisateur (déjà fait)
user_times = {}
for user, ts in requests:
    user_times.setdefault(user, []).append(ts)

blocked_users = []
for user, times in user_times.items():
    # TODO: bloquer si > 3 requêtes dans une fenêtre de 10 secondes
    # Condition: len(times) > 3 and times[-1] - times[0] <= 10
    pass

print(",".join(sorted(blocked_users)))
`,
    validate: exactOutputValidator('user1', 'Correct - rate limiting validé.', [
      { pattern: /len\s*\(\s*times\s*\)\s*>\s*3/i, feedback: 'Vérifiez la condition len(times) > 3.' },
      { pattern: /times\s*\[\s*-1\s*\]\s*-\s*times\s*\[\s*0\s*\]\s*<=\s*10/i, feedback: 'Vérifiez la fenêtre de 10 secondes.' },
    ]),
  },
  {
    id: 12,
    title: 'Indexation de documents',
    difficulty: 'avancé',
    category: 'Search Engine',
    problem: "Vous contribuez à un service de recherche documentaire interne. La mission est de construire un index inversé exploitable par l'équipe backend pour accélérer les requêtes et préparer une fonctionnalité d'autocomplétion à grande échelle.",
    expectedOutput: 'cloud:2|python:0,1',
    hints: ['enumerate(documents) donne (idx, doc)', 'Pour chaque mot: index.setdefault(word, []).append(doc_idx)', 'La boucle for et enumerate sont déjà en place'],
    starterCode: `documents = [
  "python data science",
  "machine learning python",
  "cloud architecture",
]

index = {}
for doc_idx, doc in enumerate(documents):
    for word in doc.split():
        # TODO: ajouter doc_idx à la liste index[word]
        # Astuce: index.setdefault(word, []).append(doc_idx)
        pass

cloud_docs = ",".join(str(i) for i in index.get("cloud", []))
python_docs = ",".join(str(i) for i in index.get("python", []))
print(f"cloud:{cloud_docs}|python:{python_docs}")
`,
    validate: exactOutputValidator('cloud:2|python:0,1', 'Correct - indexation de documents validée.', [
      { pattern: /setdefault\s*\(/i, feedback: "Utilisez setdefault(...) pour construire l'index inversé." },
      { pattern: /append\s*\(\s*doc_idx\s*\)/i, feedback: 'Ajoutez doc_idx dans la liste du mot.' },
    ]),
  },
  {
    id: 13,
    title: 'Recommandation avancée',
    difficulty: 'expert',
    category: 'Music Platform',
    problem: "Dans un produit média, l'équipe growth teste une recommandation sociale basée sur les affinités de goûts. Vous devez identifier les profils proches d'un utilisateur de référence via intersection de préférences pour alimenter un prototype A/B.",
    expectedOutput: 'bob',
    hints: ['alice_genres = set(user_songs["alice"])', 'Intersection de sets: set(genres) & alice_genres', "Ajoutez user à similar si l'intersection est non vide"],
    starterCode: `user_songs = {
  "alice": ["rock", "pop"],
  "bob": ["rock"],
  "charlie": ["jazz"],
}

alice_genres = set(user_songs["alice"])
similar = []
for user, genres in user_songs.items():
    if user != "alice":
        # TODO: ajouter user si set(genres) & alice_genres est non vide
        pass

print(",".join(sorted(similar)))
`,
    validate: exactOutputValidator('bob', 'Correct - recommandation avancée validée.', [
      { pattern: /set\s*\(\s*genres\s*\)\s*&\s*alice_genres/i, feedback: "Utilisez l'intersection set(genres) & alice_genres." },
    ]),
  },
  {
    id: 14,
    title: 'Analyse temps réel',
    difficulty: 'expert',
    category: 'Streaming IoT',
    problem: "Sur un flux IoT temps réel, les analystes ont besoin d'un indicateur lissé pour éviter les faux signaux. Votre mission est de calculer la moyenne glissante sur la fenêtre active et de fournir la dernière valeur exploitable en monitoring.",
    expectedOutput: '7.5',
    hints: ['window = deque(maxlen=10) est déjà configurée', 'Après la boucle: sum(window) / len(window)', 'Remplacez last_avg = 0 par le calcul'],
    starterCode: `from collections import deque

values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
window = deque(maxlen=10)
for v in values:
    window.append(v)

# TODO: calculer la moyenne de window
# Astuce: sum(window) / len(window)
last_avg = 0  # à remplacer par le calcul

print(last_avg)
`,
    validate: exactOutputValidator('7.5', 'Correct - traitement temps réel validé.', [
      { pattern: /sum\s*\(\s*window\s*\)\s*\/\s*len\s*\(\s*window\s*\)/i, feedback: 'Calculez la moyenne avec sum(window) / len(window).' },
    ]),
  },
  {
    id: 15,
    title: 'Détection de communautés',
    difficulty: 'expert',
    category: 'Graphes / Social Network',
    problem: "Mission expert data graph: cartographier automatiquement les communautés d'un réseau social interne pour détecter les clusters d'influence. Vous devez retrouver les composantes connexes complètes afin de préparer une action ciblée par groupe.",
    expectedOutput: 'alice,bob,charlie|david,emma',
    hints: ['Le graphe et la structure dfs sont déjà en place', 'Dans dfs: if neighbor not in visited: dfs(neighbor, component)', 'Chaque composante est triée avec sorted(component)'],
    starterCode: `connections = [
  ("alice", "bob"),
  ("bob", "charlie"),
  ("david", "emma"),
]

# Construction du graphe non orienté (déjà fait)
graph = {}
for a, b in connections:
    graph.setdefault(a, []).append(b)
    graph.setdefault(b, []).append(a)

visited = set()
groups = []

def dfs(node, component):
    visited.add(node)
    component.append(node)
    for neighbor in graph.get(node, []):
        # TODO: appeler dfs(neighbor, component) si neighbor pas encore visité
        # if neighbor not in visited:
        pass

for node in sorted(graph.keys()):
    if node not in visited:
        component = []
        dfs(node, component)
        groups.append(",".join(sorted(component)))

print("|".join(groups))
`,
    validate: exactOutputValidator('alice,bob,charlie|david,emma', 'Correct - détection de communautés validée.', [
      { pattern: /if\s+neighbor\s+not\s+in\s+visited\s*:/i, feedback: 'Ajoutez la condition neighbor not in visited.' },
      { pattern: /dfs\s*\(\s*neighbor\s*,\s*component\s*\)/i, feedback: 'Appelez dfs(neighbor, component) dans la boucle.' },
    ]),
  },
];

const QCM_EXERCISES: QcmExercise[] = [
  // ── Débutant ──────────────────────────────────────────────
  {
    id: 1,
    title: 'Jointure SQL - conservation des lignes',
    difficulty: 'débutant',
    category: 'SQL',
    problem: "Pour conserver tous les utilisateurs même sans tentative d'échec, quelle jointure utiliser entre users et failed_logins ?",
    options: ['INNER JOIN', 'LEFT JOIN', 'CROSS JOIN', 'RIGHT JOIN'],
    correctOption: 1,
    explanation: "LEFT JOIN conserve toutes les lignes de la table de gauche (users) et complète avec NULL lorsqu'aucune correspondance n'existe dans failed_logins.",
  },
  {
    id: 2,
    title: 'Complexité algorithmique - recherche binaire',
    difficulty: 'débutant',
    category: 'Algorithmique',
    problem: 'Quelle est la complexité temporelle de la recherche binaire sur un tableau trié ?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    correctOption: 1,
    explanation: 'Chaque itération divise la zone de recherche par deux, produisant une complexité logarithmique O(log n).',
  },
  {
    id: 3,
    title: 'Scrum - Daily Stand-up',
    difficulty: 'débutant',
    category: 'Agilité',
    problem: 'Quel est l\'objectif principal du Daily Scrum dans la méthodologie Scrum ?',
    options: ['Évaluer les performances individuelles', 'Synchroniser l\'équipe et identifier les obstacles', 'Présenter l\'avancement au Product Owner', 'Planifier les tâches du prochain sprint'],
    correctOption: 1,
    explanation: 'Le Daily Scrum (15 min max) sert à synchroniser l\'équipe : ce qui a été fait, ce qui sera fait, et les obstacles rencontrés.',
  },
  {
    id: 4,
    title: 'AMOA - Rôle de la MOA',
    difficulty: 'débutant',
    category: 'AMOA',
    problem: 'Dans un projet informatique, quelle entité porte le besoin métier et valide la conformité de la solution livrée ?',
    options: ["La Maîtrise d'Œuvre (MOE)", "La Direction des Systèmes d'Information", "La Maîtrise d'Ouvrage (MOA)", 'Le cabinet de conseil en stratégie'],
    correctOption: 2,
    explanation: "La MOA (Maîtrise d'Ouvrage) définit le besoin, rédige le cahier des charges et valide que la solution livrée correspond aux attentes métier.",
  },
  {
    id: 5,
    title: 'API REST - Code HTTP de création',
    difficulty: 'débutant',
    category: 'API',
    problem: "Quel code HTTP est le plus approprié pour confirmer la création réussie d'une ressource ?",
    options: ['200 OK', '201 Created', '204 No Content', '302 Found'],
    correctOption: 1,
    explanation: "201 Created indique explicitement la création réussie d'une ressource et peut inclure son URL dans l'en-tête Location.",
  },
  // ── Intermédiaire ─────────────────────────────────────────
  {
    id: 6,
    title: 'Python - Types immuables',
    difficulty: 'intermédiaire',
    category: 'Python',
    problem: 'Parmi les types Python suivants, lequel est immuable ?',
    options: ['list', 'dict', 'set', 'tuple'],
    correctOption: 3,
    explanation: 'Un tuple est immuable (non modifiable après création), contrairement aux listes, dictionnaires et ensembles.',
  },
  {
    id: 7,
    title: 'Git - Historique linéaire',
    difficulty: 'intermédiaire',
    category: 'Git',
    problem: "Quelle commande intègre les derniers commits de main dans votre branche feature sans créer de merge commit ?",
    options: ['git merge main', 'git cherry-pick main', 'git rebase main', 'git pull --ff-only'],
    correctOption: 2,
    explanation: 'git rebase main rejoue vos commits feature au-dessus de la tête de main et maintient un historique linéaire.',
  },
  {
    id: 8,
    title: 'Cloud - Modèles de services',
    difficulty: 'intermédiaire',
    category: 'Cloud',
    problem: "Une plateforme fournissant un environnement d'exécution managé (runtime, middleware, BDD) sans gérer l'infrastructure correspond à quel modèle Cloud ?",
    options: ['IaaS (Infrastructure as a Service)', 'SaaS (Software as a Service)', 'PaaS (Platform as a Service)', 'FaaS (Function as a Service)'],
    correctOption: 2,
    explanation: 'PaaS fournit un environnement managé permettant de déployer des applications sans gérer l\'OS ou le matériel sous-jacent.',
  },
  {
    id: 9,
    title: 'RGPD - Conservation des données',
    difficulty: 'intermédiaire',
    category: 'Conformité',
    problem: "Selon le RGPD, quelle obligation s'applique à la durée de conservation des données personnelles ?",
    options: ['Les données peuvent être conservées indéfiniment si chiffrées', 'La durée doit être justifiée et limitée à la finalité du traitement', 'Une durée maximale légale de 5 ans est imposée', 'Seul le DPO peut décider de la durée de conservation'],
    correctOption: 1,
    explanation: "Le RGPD impose le principe de limitation de la conservation : les données ne doivent pas être gardées au-delà de la finalité pour laquelle elles ont été collectées.",
  },
  {
    id: 10,
    title: 'DevOps - Pipeline CI/CD',
    difficulty: 'intermédiaire',
    category: 'DevOps',
    problem: 'Quelle pratique DevOps automatise la compilation, les tests et le déploiement à chaque commit poussé sur le dépôt ?',
    options: ['Kanban board', 'Infrastructure as Code', 'Intégration et livraison continues (CI/CD)', 'Pair programming'],
    correctOption: 2,
    explanation: 'Un pipeline CI/CD automatise build, tests et déploiements, réduisant les erreurs manuelles et accélérant les mises en production.',
  },
  // ── Avancé ────────────────────────────────────────────────
  {
    id: 11,
    title: 'Sécurité - Prévention des injections SQL',
    difficulty: 'avancé',
    category: 'Cybersécurité',
    problem: "Quelle mesure est la plus efficace pour prévenir les injections SQL côté application ?",
    options: ['Concaténer soigneusement les chaînes SQL', 'Encoder les sorties HTML', 'Utiliser des requêtes paramétrées (prepared statements)', "Désactiver les messages d'erreur SQL"],
    correctOption: 2,
    explanation: "Les requêtes paramétrées séparent structurellement la donnée de la commande SQL, empêchant toute interprétation malveillante des entrées utilisateur.",
  },
  {
    id: 12,
    title: 'OWASP Top 10 2021 - Principal risque applicatif',
    difficulty: 'avancé',
    category: 'Cybersécurité',
    problem: "D'après l'OWASP Top 10 édition 2021, quelle catégorie occupe la première position des risques applicatifs ?",
    options: ['Injection (SQL, commande, LDAP)', "Contrôle d'accès défaillant (Broken Access Control)", 'Cross-Site Scripting (XSS)', 'Mauvaise configuration de sécurité'],
    correctOption: 1,
    explanation: "Depuis l'OWASP Top 10 2021, le contrôle d'accès défaillant est n°1 : la plupart des applications exposent des ressources protégées à des utilisateurs non autorisés.",
  },
  {
    id: 13,
    title: 'Data - Optimisation des requêtes',
    difficulty: 'avancé',
    category: 'Data',
    problem: 'Quel mécanisme améliore le plus les performances des filtres fréquents sur une colonne volumineuse dans une base relationnelle ?',
    options: ['Ajouter des vues matérialisées partout', 'Créer un index adapté sur la colonne filtrée', 'Augmenter la RAM du serveur de BDD', 'Remplacer SELECT * par SELECT colonne'],
    correctOption: 1,
    explanation: "Un index bien choisi réduit considérablement le coût des recherches en évitant un full scan de la table.",
  },
  {
    id: 14,
    title: 'Data Science - Surapprentissage',
    difficulty: 'avancé',
    category: 'Data Science',
    problem: "Un modèle ML affiche une erreur très faible sur les données d'entraînement mais élevée sur les données de test. De quoi s'agit-il ?",
    options: ['Underfitting', 'Overfitting (surapprentissage)', "Biais d'échantillonnage", 'Fuite de données (data leakage)'],
    correctOption: 1,
    explanation: "L'overfitting survient quand le modèle mémorise les exemples d'entraînement plutôt que de généraliser. Il performe bien en training mais mal en production.",
  },
  // ── Expert ────────────────────────────────────────────────
  {
    id: 15,
    title: 'Architecture microservices - Découplage',
    difficulty: 'expert',
    category: 'System Design',
    problem: 'Dans une architecture microservices, quel mécanisme réduit le couplage synchrone entre services ?',
    options: ['RPC bloquant systématique', 'Base de données partagée unique', 'Bus de messages / communication événementielle', 'Augmentation des timeouts HTTP'],
    correctOption: 2,
    explanation: 'La communication événementielle asynchrone via un bus de messages limite le couplage temporel et améliore la résilience globale.',
  },
  {
    id: 16,
    title: 'ITIL - Incident vs Problème',
    difficulty: 'expert',
    category: 'Gouvernance IT',
    problem: "Dans le référentiel ITIL, quelle est la distinction formelle entre un 'incident' et un 'problème' ?",
    options: ["Un incident est récurrent, un problème est ponctuel", "Un incident est une interruption non planifiée du service ; un problème est sa cause racine", "Un incident est géré par la MOE, un problème par la MOA", "ITIL v4 ne fait plus cette distinction"],
    correctOption: 1,
    explanation: "ITIL distingue l'incident (perturbation immédiate du service) du problème (cause racine d'un ou plusieurs incidents). La gestion des problèmes vise l'élimination définitive de la cause.",
  },
];

const ENGLISH_EXERCISES: EnglishExercise[] = [
  // ── QCM ──────────────────────────────────────────────────
  {
    id: 1,
    title: 'Daily Stand-up Update',
    difficulty: 'débutant',
    category: 'Workplace Communication',
    problem: 'During the daily stand-up, you are blocked by an API dependency. Which answer is the most professional?',
    options: [
      'Nothing is working.',
      'I am currently blocked by the API dependency and need confirmation from the backend team before I can continue.',
      'This sprint is impossible.',
      'I have no idea what is happening.',
    ],
    correctOption: 1,
    explanation: 'The best answer is clear, factual, and action-oriented.',
  },
  // ── Email fill-in-the-blank ───────────────────────────────
  {
    id: 2,
    type: 'email_fill' as const,
    title: 'Formal Email Opening',
    difficulty: 'débutant',
    category: 'Email Writing',
    from: 'alex.martin@mc2i.fr',
    to: 'sarah.johnson@client.com',
    subject: 'Re: Project Delivery Timeline',
    emailBody: `{{blank_1}} Ms. Johnson,

Thank you for your {{blank_2}} regarding the delivery timeline.

I have reviewed the current plan with the team and we will share a revised schedule by end of day today.

Kind regards,
Alex Martin
Senior Consultant - mc2i`,
    blanks: [
      { id: 1, answer: 'Dear', acceptableAnswers: [] },
      { id: 2, answer: 'message', acceptableAnswers: ['email', 'inquiry', 'note', 'question'] },
    ],
    explanation: '"Dear Ms. Johnson," is the correct formal opening. "message", "email" or "inquiry" all work for the second blank.',
  },
  // ── QCM ──────────────────────────────────────────────────
  {
    id: 3,
    title: 'Client Delay Email',
    difficulty: 'débutant',
    category: 'Client Communication',
    problem: 'A client asks why delivery is delayed. Which response is the most appropriate?',
    options: [
      'We are late because the specifications were unclear.',
      'Sorry, we are very busy.',
      'We identified a dependency that affected the schedule, and we will send you an updated plan by 4 PM today.',
      'Please wait.',
    ],
    correctOption: 2,
    explanation: 'A good client response acknowledges the issue, explains it professionally, and gives a clear next step.',
  },
  {
    id: 4,
    title: 'Requirement Clarification',
    difficulty: 'débutant',
    category: 'Meetings',
    problem: 'In a workshop, the requirement sounds ambiguous. What should you say?',
    options: [
      'This makes no sense.',
      'Could you clarify the expected user outcome and the success criteria?',
      'We will guess and move on.',
      'Let us skip this topic.',
    ],
    correctOption: 1,
    explanation: 'Good business English focuses on clarification, outcomes, and measurable expectations.',
  },
  // ── Email fill-in-the-blank ───────────────────────────────
  {
    id: 5,
    type: 'email_fill' as const,
    title: 'Client Apology Email',
    difficulty: 'intermédiaire',
    category: 'Email Writing',
    from: 'alex.martin@mc2i.fr',
    to: 'project-board@client.com',
    subject: 'Apology for Delayed Q3 Report',
    emailBody: `Dear Team,

I am writing to {{blank_1}} for the delay in delivering the Q3 report.

The issue was caused by a dependency on the data pipeline, which has now been {{blank_2}}. We will send the updated report by tomorrow morning and ensure that this does not happen again.

Thank you for your patience.

Best regards,
Alex Martin`,
    blanks: [
      { id: 1, answer: 'apologize', acceptableAnswers: ['apologies', 'apologise'] },
      { id: 2, answer: 'resolved', acceptableAnswers: ['fixed', 'addressed', 'solved'] },
    ],
    explanation: '"apologize" is the correct professional verb. "resolved" / "fixed" both work for describing the pipeline issue.',
  },
  // ── QCM ──────────────────────────────────────────────────
  {
    id: 6,
    title: 'Incident Bridge Update',
    difficulty: 'intermédiaire',
    category: 'Incident Management',
    problem: 'On a live incident bridge, what is the strongest status update?',
    options: [
      'Everything is broken.',
      'We are still checking.',
      'The impact is limited to the login service, mitigation is in progress, and the next update will be shared in 15 minutes.',
      'We are doing our best.',
    ],
    correctOption: 2,
    explanation: 'Strong incident communication states scope, action, and timing for the next update.',
  },
  {
    id: 7,
    title: 'Professional Disagreement',
    difficulty: 'intermédiaire',
    category: 'Meetings',
    problem: 'A colleague proposes a risky shortcut in production. What is the best response?',
    options: [
      'That is a terrible idea.',
      'I disagree. Your solution is wrong.',
      'I understand the objective, but I am concerned about the production risk. Could we review a safer option first?',
      'Fine, do whatever you want.',
    ],
    correctOption: 2,
    explanation: 'Professional disagreement should acknowledge the intent, state the concern, and invite discussion.',
  },
  // ── Email fill-in-the-blank ───────────────────────────────
  {
    id: 8,
    type: 'email_fill' as const,
    title: 'Action-Required Email',
    difficulty: 'intermédiaire',
    category: 'Email Writing',
    from: 'alex.martin@mc2i.fr',
    to: 'stakeholders@company.com',
    subject: 'Action Required - Draft Report Review',
    emailBody: `Dear all,

Please find {{blank_1}} the draft report for your review.

Kindly send your feedback {{blank_2}} Friday, 5 PM. This will allow us to {{blank_3}} the document over the weekend before the Monday presentation.

For any questions, please do not hesitate to reach out.

Best regards,
Alex Martin
Project Manager - mc2i`,
    blanks: [
      { id: 1, answer: 'attached', acceptableAnswers: [] },
      { id: 2, answer: 'by', acceptableAnswers: [] },
      { id: 3, answer: 'finalise', acceptableAnswers: ['finalize', 'complete', 'review', 'edit'] },
    ],
    explanation: '"attached" is the standard word for files included in an email. "by Friday" correctly sets a deadline. "finalise/finalize" fits the context of preparing a document.',
  },
  // ── QCM ──────────────────────────────────────────────────
  {
    id: 9,
    title: 'Customer-Facing Status Note',
    difficulty: 'avancé',
    category: 'Writing',
    problem: 'You must publish a short customer-facing note during an outage. Which version is strongest?',
    options: [
      'The platform is down. Sorry.',
      'Some users may be experiencing issues. We are investigating and will share the next update at 10:30 UTC.',
      'There is a major issue internally.',
      'Please try again later maybe.',
    ],
    correctOption: 1,
    explanation: 'A strong customer-facing message is calm, factual, and includes a commitment on the next update.',
  },
  {
    id: 10,
    title: 'Scope Negotiation',
    difficulty: 'avancé',
    category: 'Consulting Communication',
    problem: 'The client wants extra features without changing the timeline. What is the best answer?',
    options: [
      'That is impossible.',
      'We can add everything if the team works harder.',
      'We can review the new requests together and assess the impact on scope, timeline, and priorities before committing.',
      'Let us promise now and discuss later.',
    ],
    correctOption: 2,
    explanation: 'This response protects delivery while remaining constructive and commercially sound.',
  },
  // ── Email fill-in-the-blank ───────────────────────────────
  {
    id: 11,
    type: 'email_fill' as const,
    title: 'Risk Escalation Email',
    difficulty: 'expert',
    category: 'Leadership Communication',
    from: 'alex.martin@mc2i.fr',
    to: 'director@company.com',
    subject: 'Risk Escalation - Launch Date at Risk',
    emailBody: `Dear Director,

I am writing to {{blank_1}} a critical risk that may affect the planned launch date.

Without a decision on the infrastructure budget {{blank_2}} this Friday, the launch is likely to {{blank_3}} by two weeks, which would impact the Q4 revenue forecast.

I would recommend {{blank_4}} an emergency review meeting before end of week to unblock this decision.

Please let me know your availability.

Best regards,
Alex Martin
Project Lead - mc2i`,
    blanks: [
      { id: 1, answer: 'escalate', acceptableAnswers: ['flag', 'raise', 'highlight'] },
      { id: 2, answer: 'by', acceptableAnswers: [] },
      { id: 3, answer: 'slip', acceptableAnswers: ['slide', 'shift', 'move'] },
      { id: 4, answer: 'scheduling', acceptableAnswers: ['arranging', 'organizing', 'organising', 'setting up', 'holding'] },
    ],
    explanation: 'Escalation emails require precise vocabulary: "escalate/flag" a risk (blank 1), "by Friday" for a deadline (blank 2), the date "slips" (blank 3), and you "schedule/arrange" a meeting (blank 4).',
  },
  // ── QCM ──────────────────────────────────────────────────
  {
    id: 12,
    title: 'Handling Pushback',
    difficulty: 'expert',
    category: 'Leadership Communication',
    problem: 'A senior stakeholder challenges your recommendation in front of the team. What is the best response?',
    options: [
      'You are wrong.',
      'As I said before, this is the only possible solution.',
      'Thank you for raising that point. Let me explain the assumptions behind the recommendation and the main trade-offs we considered.',
      'We can maybe discuss it later.',
    ],
    correctOption: 2,
    explanation: 'This answer stays composed, acknowledges the challenge, and reframes the discussion around assumptions and trade-offs.',
  },
];

const DIFFICULTY_META: Record<Difficulty, { label: string; color: string; bg: string; border: string; dot: string }> = {
  débutant:      { label: 'Débutant',      color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  intermédiaire: { label: 'Intermédiaire', color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',   dot: 'bg-amber-500'  },
  avancé:        { label: 'Avancé',        color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-200',  dot: 'bg-orange-500'  },
  expert:        { label: 'Expert',        color: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-200',    dot: 'bg-rose-500'     },
};

const ENGLISH_DIFFICULTY_LABELS: Record<Difficulty, string> = {
  débutant: 'Beginner',
  intermédiaire: 'Intermediate',
  avancé: 'Advanced',
  expert: 'Expert',
};

function getDifficultyMeta(difficulty: Difficulty, englishUi = false) {
  const meta = DIFFICULTY_META[difficulty];
  return englishUi ? { ...meta, label: ENGLISH_DIFFICULTY_LABELS[difficulty] } : meta;
}

const DIFFICULTY_ORDER: Difficulty[] = ['débutant', 'intermédiaire', 'avancé', 'expert'];

const CHALLENGE_DURATION_SEC = 30 * 60;
const QCM_DURATION_SEC = 10 * 60;

const CHALLENGE_OPTIONS: Array<{ value: ChallengeType; label: string }> = [
  { value: 'sql', label: 'SQL' },
  { value: 'python', label: 'Python' },
  { value: 'qcm', label: 'QCM Technique' },
  { value: 'english', label: 'Anglais' },
];

function getAssignedTests(tests?: ChallengeType[], fallback?: ChallengeType): ChallengeType[] {
  const source = Array.isArray(tests) ? tests : [];
  const unique = source.filter((test, index) => source.indexOf(test) === index);
  if (unique.length > 0) return unique;
  return [fallback || 'sql'];
}

function getChallengeTypeLabel(challengeType: ChallengeType) {
  if (challengeType === 'python') return 'Python';
  if (challengeType === 'qcm') return 'QCM Technique';
  if (challengeType === 'english') return 'Anglais';
  return 'SQL';
}

// ─────────────────────────────────────────────────────────────
// Shared UI helpers
// ─────────────────────────────────────────────────────────────

function Input({ label, type = 'text', value, onChange, placeholder, autoFocus }: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#38506a] mb-1 font-sans">{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoFocus={autoFocus}
        className="w-full bg-white border border-[#d7e2ef] rounded-xl px-3 py-2.5 text-sm text-[#17324d] placeholder:text-[#9aa8b8] font-mono outline-none focus:border-[#5aa9e6] focus:ring-2 focus:ring-[#5aa9e6]/25 transition-colors"
      />
    </div>
  );
}

function Btn({ children, onClick, disabled, variant = 'primary', className = '' }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'danger' | 'success'; className?: string;
}) {
  const base = 'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold font-sans transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-gradient-to-r from-[#0077b6] to-[#e75480] hover:opacity-95 text-white',
    ghost: 'bg-white border border-[#d7e2ef] text-[#38506a] hover:text-[#17324d] hover:border-[#5aa9e6]',
    danger: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200',
    success: 'bg-[#0ea5a4] hover:bg-[#0f9a98] text-white',
  };
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-sans">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {msg}
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-transparent border-0 rounded-none shadow-none ${className}`}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// Session storage helpers
// ─────────────────────────────────────────────────────────────

const RECRUITER_KEY = 'fyne_sqlchallenge_recruiter';
const CANDIDATE_KEY = 'fyne_sqlchallenge_candidate';

function saveRecruiter(r: RecruiterSession) { localStorage.setItem(RECRUITER_KEY, JSON.stringify(r)); }
function loadRecruiter(): RecruiterSession | null {
  try { return JSON.parse(localStorage.getItem(RECRUITER_KEY) || 'null'); } catch { return null; }
}
function clearRecruiter() { localStorage.removeItem(RECRUITER_KEY); }

function saveCandidate(c: CandidateSession) { localStorage.setItem(CANDIDATE_KEY, JSON.stringify(c)); }
function loadCandidate(): CandidateSession | null {
  try { return JSON.parse(localStorage.getItem(CANDIDATE_KEY) || 'null'); } catch { return null; }
}
function clearCandidate() { localStorage.removeItem(CANDIDATE_KEY); }

// ─────────────────────────────────────────────────────────────
// Timer component
// ─────────────────────────────────────────────────────────────

function Timer({ remaining, total }: { remaining: number; total: number }) {
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const pct = remaining / total;
  const color = pct > 0.33 ? 'text-emerald-400' : pct > 0.15 ? 'text-yellow-400' : 'text-red-400 animate-pulse';
  const barColor = pct > 0.33 ? 'bg-emerald-500' : pct > 0.15 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <Clock className={`w-4 h-4 ${color}`} />
        <span className={`text-base font-bold font-mono ${color}`}>
          {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </span>
      </div>
      <div className="w-24 h-1.5 bg-[#dbe7f4] rounded-full overflow-hidden">
        <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Schema panel
// ─────────────────────────────────────────────────────────────

const DB_SCHEMA = [
  {
    name: 'users', comment: 'Comptes utilisateurs du SI',
    columns: [
      { name: 'id', type: 'INTEGER', tag: 'PK' },
      { name: 'username', type: 'VARCHAR(50)', tag: '' },
      { name: 'email', type: 'VARCHAR(100)', tag: '' },
      { name: 'role', type: "VARCHAR(20)", tag: '', note: "admin | user | analyst" },
      { name: 'last_login', type: 'TIMESTAMP', tag: '' },
      { name: 'is_active', type: 'BOOLEAN', tag: '' },
    ],
  },
  {
    name: 'failed_logins', comment: "Tentatives d'auth échouées",
    columns: [
      { name: 'id', type: 'INTEGER', tag: 'PK' },
      { name: 'user_id', type: 'INTEGER', tag: 'FK', note: '→ users.id' },
      { name: 'ip', type: 'VARCHAR(45)', tag: '' },
      { name: 'attempted_at', type: 'TIMESTAMP', tag: '' },
      { name: 'failure_reason', type: 'VARCHAR(100)', tag: '' },
    ],
  },
  {
    name: 'firewall_events', comment: 'Journaux du pare-feu',
    columns: [
      { name: 'id', type: 'INTEGER', tag: 'PK' },
      { name: 'src_ip', type: 'VARCHAR(45)', tag: '' },
      { name: 'dst_port', type: 'INTEGER', tag: '' },
      { name: 'protocol', type: 'VARCHAR(10)', tag: '', note: 'TCP|UDP|ICMP' },
      { name: 'action', type: 'VARCHAR(10)', tag: '', note: 'ALLOW|BLOCK|DROP' },
      { name: 'event_time', type: 'TIMESTAMP', tag: '' },
    ],
  },
  {
    name: 'vulnerabilities', comment: 'Vulnérabilités du parc',
    columns: [
      { name: 'id', type: 'INTEGER', tag: 'PK' },
      { name: 'cve_id', type: 'VARCHAR(20)', tag: '' },
      { name: 'severity', type: 'VARCHAR(10)', tag: '', note: 'critical|high|medium|low' },
      { name: 'host', type: 'VARCHAR(100)', tag: '' },
      { name: 'discovered_at', type: 'TIMESTAMP', tag: '' },
      { name: 'status', type: 'VARCHAR(20)', tag: '', note: 'open|patched|accepted' },
    ],
  },
];

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'JOIN', 'LEFT JOIN',
  'INNER JOIN', 'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'IS NULL', 'IS NOT NULL', 'COUNT',
  'SUM', 'AVG', 'MIN', 'MAX', 'DISTINCT', 'CASE WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC',
];

let sqlAutocompleteRegistered = false;

function registerSqlAutocomplete(monaco: any) {
  if (sqlAutocompleteRegistered) return;

  const tableSuggestions = DB_SCHEMA.map((table) => ({
    label: table.name,
    kind: monaco.languages.CompletionItemKind.Class,
    insertText: table.name,
    detail: 'Table',
    documentation: table.comment,
  }));

  const columnSuggestions = DB_SCHEMA.flatMap((table) => table.columns.map((column) => ({
    label: column.name,
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: column.name,
    detail: `${table.name}.${column.type}`,
    documentation: column.note || `Colonne de ${table.name}`,
  })));

  const qualifiedColumnSuggestions = DB_SCHEMA.flatMap((table) => table.columns.map((column) => ({
    label: `${table.name}.${column.name}`,
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: `${table.name}.${column.name}`,
    detail: `Colonne qualifiée (${column.type})`,
    documentation: column.note || table.comment,
  })));

  const keywordSuggestions = SQL_KEYWORDS.map((keyword) => ({
    label: keyword,
    kind: monaco.languages.CompletionItemKind.Keyword,
    insertText: keyword,
    detail: 'Mot-clé SQL',
  }));

  const snippetSuggestions = [
    {
      label: 'SELECT snippet',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: 'SELECT ${1:*}\nFROM ${2:users}\nWHERE ${3:condition}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: 'Snippet SELECT',
    },
    {
      label: 'JOIN snippet',
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: 'SELECT ${1:u.username}, ${2:COUNT(fl.id) AS nb_echecs}\nFROM ${3:users} u\nLEFT JOIN ${4:failed_logins} fl ON ${5:u.id = fl.user_id}\nGROUP BY ${6:u.username}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: 'Snippet JOIN',
    },
  ];

  monaco.languages.registerCompletionItemProvider('sql', {
    triggerCharacters: ['.', ' '],
    provideCompletionItems(model: any, position: any) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions = [
        ...keywordSuggestions,
        ...tableSuggestions,
        ...columnSuggestions,
        ...qualifiedColumnSuggestions,
        ...snippetSuggestions,
      ].map((item) => ({ ...item, range }));

      return { suggestions };
    },
  });

  sqlAutocompleteRegistered = true;
}

function SchemaPanel({ compact = false }: { compact?: boolean }) {
  const [openTable, setOpenTable] = useState<string | null>('users');
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-[#d7e2ef] bg-[#f7fbff] shrink-0">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-[#0077b6]" />
          <span className="text-[11px] font-bold text-[#0077b6] uppercase tracking-wider font-sans">fyne_soc_db</span>
        </div>
        {!compact && <p className="text-[10px] text-[#38506a] font-medium font-sans">PostgreSQL 15</p>}
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-1.5">
        {DB_SCHEMA.map((table) => {
          const isOpen = openTable === table.name;
          return (
            <div key={table.name} className="mb-0.5">
              <button
                type="button"
                onClick={() => setOpenTable(isOpen ? null : table.name)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs font-mono transition-colors ${isOpen ? 'bg-[#e8f3ff] text-[#0b5b8c]' : 'text-[#38506a] hover:bg-[#eef6ff] hover:text-[#17324d]'}`}
              >
                <Table2 className="w-3 h-3 shrink-0 text-[#0077b6]" />
                <span className="font-semibold truncate">{table.name}</span>
                <ChevronDown className={`w-3 h-3 ml-auto shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="ml-2 border-l border-[#dbe7f4] pl-2 pb-1">
                  <p className="text-[10px] text-[#38506a] font-medium font-sans px-1 pt-0.5 pb-1">{table.comment}</p>
                  {table.columns.map((col) => (
                    <div key={col.name} className="flex items-start gap-1 px-1 py-0.5">
                      <span className={`text-[9px] font-bold shrink-0 w-4 mt-0.5 ${col.tag === 'PK' ? 'text-yellow-700' : col.tag === 'FK' ? 'text-purple-700' : 'text-[#5c7289]'}`}>{col.tag}</span>
                      <div>
                        <span className="text-[11px] font-mono text-[#1f6fa8]">{col.name}</span>
                        <span className="text-[9px] text-[#38506a] ml-1 font-mono">{col.type}</span>
                        {'note' in col && col.note && <p className="text-[9px] text-[#38506a] font-sans">{col.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Results Grid
// ─────────────────────────────────────────────────────────────

interface QueryResult {
  success: boolean;
  columns?: string[];
  rows?: Array<Record<string, unknown>>;
  rowCount?: number;
  message?: string;
  durationMs?: number;
  metaType?: string;
  tableName?: string;
}

function ResultsGrid({ result }: { result: QueryResult }) {
  if (!result.success) {
    return (
      <div className="flex items-start gap-3 m-3 px-3 py-2.5 bg-red-700 border border-red-600 rounded-lg font-sans">
        <AlertCircle className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-white mb-0.5">Erreur SQL</p>
          <p className="text-xs text-white/90 font-mono leading-relaxed whitespace-pre-wrap">{result.message}</p>
        </div>
      </div>
    );
  }
  const columns = result.columns ?? [];
  const rows = result.rows ?? [];
  if (columns.length === 0) {
    return <div className="flex items-center gap-2 p-4 text-xs text-[#38506a] font-medium font-sans"><Table2 className="w-3.5 h-3.5" /><span>Aucune donnée retournée.</span></div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-[#eaf3fc] border-b-2 border-[#d7e2ef] sticky top-0">
            {columns.map((col) => <th key={col} className="text-left px-3 py-2 text-[#1f6fa8] font-semibold border-r border-[#dbe7f4] last:border-r-0 whitespace-nowrap font-sans">{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 200).map((row, ri) => (
            <tr key={ri} className={`border-b border-[#e4edf7] ${ri % 2 === 0 ? 'bg-white' : 'bg-[#f7fbff]'} hover:bg-[#eef6ff]`}>
              {columns.map((col) => {
                const val = row[col];
                const isNull = val === null || val === undefined;
                const isNum = !isNull && (typeof val === 'number' || /^-?\d+(\.\d+)?$/.test(String(val)));
                return (
                  <td key={col} className={`px-3 py-1.5 border-r border-[#e4edf7] last:border-r-0 font-mono ${isNull ? 'text-[#5c7289] italic' : isNum ? 'text-emerald-800' : 'text-[#17324d]'}`}>
                    {isNull ? 'NULL' : String(val)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-1 bg-[#f7fbff] border-t border-[#dbe7f4] text-[10px] text-[#38506a] font-medium font-sans">
        {result.rowCount} ligne{result.rowCount !== 1 ? 's' : ''}{result.durationMs !== undefined ? ` · ${result.durationMs} ms` : ''}
        {rows.length > 200 && <span className="text-amber-600 ml-2">Limité à 200 lignes</span>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SQL Workspace (used inside candidate test)
// ─────────────────────────────────────────────────────────────

function SqlWorkspace({
  exercise, onValidated, attempts, onAttempt,
}: {
  exercise: SqlExercise;
  onValidated: () => void;
  attempts: number;
  onAttempt: () => void;
}) {
  const [query, setQuery] = useState('');
  const [runResult, setRunResult] = useState<QueryResult | null>(null);
  const [submitResult, setSubmitResult] = useState<{ valid: boolean; feedback: string } | null>(null);
  const [editorNotice, setEditorNotice] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const editorRef = useRef<any>(null);
  const executeQueryRef = useRef<() => void>(() => {});

  useEffect(() => {
    setQuery(''); setRunResult(null); setSubmitResult(null); setEditorNotice(null); setShowHints(false);
    setTimeout(() => editorRef.current?.focus(), 80);
  }, [exercise.id]);

  const blockClipboardAction = (message: string) => {
    setEditorNotice(message);
    setTimeout(() => {
      setEditorNotice((current) => (current === message ? null : current));
    }, 1800);
  };

  const executeQuery = useCallback(async () => {
    const q = query.trim();
    if (!q || isRunning) return;
    setIsRunning(true); setSubmitResult(null);
    try {
      const res = await apiRequest<QueryResult>('/api/evaluation/sql-sandbox', {
        method: 'POST', body: JSON.stringify({ query: q, domainId: 'cyber' }),
      });
      setRunResult(res);
    } catch (err) {
      setRunResult({ success: false, message: err instanceof Error ? err.message : 'Erreur réseau.' });
    } finally {
      setIsRunning(false);
      setTimeout(() => editorRef.current?.focus(), 50);
    }
  }, [query, isRunning, onAttempt]);

  const submitAnswer = () => {
    onAttempt();
    if (!runResult?.success || !runResult.columns || !runResult.rows) {
      setSubmitResult({ valid: false, feedback: "Exécutez d'abord votre requête." });
      return;
    }
    const r = exercise.validate(runResult.columns, runResult.rows, query);
    setSubmitResult(r);
    if (r.valid) onValidated();
  };

  useEffect(() => {
    executeQueryRef.current = () => { void executeQuery(); };
  }, [executeQuery]);

  function handleEditorMount(editor: any, monaco: any) {
    editorRef.current = editor;
    registerSqlAutocomplete(monaco);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => executeQueryRef.current());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => blockClipboardAction('Copier est désactivé.'));
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => blockClipboardAction('Coller est désactivé.'));
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, () => blockClipboardAction('Couper est désactivé.'));
    editor.focus();
  }

  const diff = DIFFICULTY_META[exercise.difficulty];
  const hideGuidance = exercise.difficulty === 'avancé' || exercise.difficulty === 'expert';

  return (
    <div className="flex flex-col h-full">
      {/* Problem */}
      <div className="shrink-0 border-b border-[#d7e2ef] bg-[#f8fbff] px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-sans ${diff.color} ${diff.bg} ${diff.border}`}>{diff.label}</span>
          <span className="text-[10px] text-[#38506a] border border-[#dbe7f4] px-2 py-0.5 rounded font-medium font-sans">{exercise.category}</span>
          <span className="text-[10px] text-[#38506a] font-medium font-sans ml-1">· {attempts} tentative{attempts !== 1 ? 's' : ''}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1"><BookOpen className="w-3 h-3 text-[#0077b6]" /><span className="text-[10px] font-bold text-[#0077b6] uppercase tracking-wider font-sans">Problème</span></div>
            <p className="text-sm text-[#17324d] leading-relaxed font-sans">{exercise.problem}</p>
          </div>
          <div className="space-y-2">
            {!hideGuidance && (
              <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2">
                <div className="flex items-center gap-1.5 mb-1"><ChevronRight className="w-3 h-3 text-emerald-700" /><span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider font-sans">Résultat attendu</span></div>
                <p className="text-xs text-[#17324d] font-medium font-sans">{exercise.expectedOutput}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[10px] text-[#38506a] font-medium font-sans">Colonnes min :</span>
              {exercise.expectedColumns.map(c => <span key={c} className="font-mono text-[10px] bg-[#eef6ff] border border-[#dbe7f4] text-[#1f6fa8] px-1.5 py-0.5 rounded">{c}</span>)}
            </div>
            {!hideGuidance && (
              <div>
                <button type="button" onClick={() => setShowHints(v => !v)} className="flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-800 transition-colors font-sans">
                  <Lightbulb className="w-3 h-3" />
                  {showHints ? 'Masquer' : 'Indice (1)'}
                </button>
                {showHints && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex gap-1.5 text-xs font-mono bg-amber-50 border border-amber-200 rounded px-2 py-1">
                      <span className="text-amber-700 font-bold font-sans shrink-0">1.</span>
                      <span className="text-amber-900/80">{exercise.hints[0]}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f3f8ff] border-b border-[#d7e2ef] shrink-0">
        <Terminal className="w-3.5 h-3.5 text-[#38506a]" />
        <span className="text-[11px] text-[#38506a] font-semibold font-sans">Query Editor</span>
        <span className="text-[10px] text-rose-600 font-sans">Copier/coller désactivé</span>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => { setQuery(''); setRunResult(null); setSubmitResult(null); }} className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-[#38506a] hover:text-[#17324d] hover:bg-[#eaf3fc] font-medium font-sans">
            <RefreshCw className="w-3 h-3" />Effacer
          </button>
          <button type="button" disabled={isRunning || !query.trim()} onClick={executeQuery} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0a3d5c] hover:bg-[#0d5278] disabled:opacity-40 text-white text-[11px] font-semibold font-sans border border-[#1a6090]">
            <Play className="w-3 h-3 fill-current" />Exécuter<kbd className="text-[9px] opacity-50 bg-white/10 px-1 rounded font-mono">Ctrl+↵</kbd>
          </button>
          <button type="button" disabled={!runResult?.success} onClick={submitAnswer} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white text-[11px] font-bold font-sans">
            <Send className="w-3 h-3" />Soumettre
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="shrink-0 border-b border-[#d7e2ef]" style={{ minHeight: '160px' }}>
        <Editor
          height="160px"
          language="sql"
          value={query}
          onChange={(value) => { setQuery(value || ''); setSubmitResult(null); }}
          onMount={handleEditorMount}
          theme="vs"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            padding: { top: 8 },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            contextmenu: false,
            quickSuggestions: false,
            parameterHints: { enabled: false },
            suggestOnTriggerCharacters: false,
            acceptSuggestionOnEnter: 'off',
            snippetSuggestions: 'none',
          }}
        />
      </div>

      {editorNotice && (
        <div className="shrink-0 px-4 py-2 text-xs font-sans text-rose-700 bg-rose-50 border-b border-rose-200">
          {editorNotice}
        </div>
      )}

      {/* Submit feedback */}
      {submitResult && (
        <div className={`flex items-start gap-2.5 px-4 py-2.5 border-b shrink-0 font-sans ${submitResult.valid ? 'bg-green-600 border-green-700' : 'bg-red-600 border-red-700'}`}>
          {submitResult.valid ? <CheckCircle className="w-4 h-4 text-white shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />}
          <div>
            <p className="text-xs font-bold text-white">{submitResult.valid ? 'Réponse correcte ✓' : 'Réponse incorrecte'}</p>
            <p className="text-xs text-white/90">{submitResult.feedback}</p>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-auto bg-white">
        {isRunning ? (
          <div className="flex items-center gap-2 px-4 py-3 text-xs text-amber-700 font-sans animate-pulse"><Play className="w-3 h-3" />Exécution…</div>
        ) : runResult ? (
          <ResultsGrid result={runResult} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-[#5c7289] text-xs font-medium font-sans py-6">
            <Table2 className="w-5 h-5 opacity-20" />
            <span>Exécutez une requête pour voir les résultats</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface PythonRunResult {
  result?: string;
  analysis?: string;
  error?: boolean;
  sessionVariables?: string | null;
}

function PythonInfoPanel({ exercise }: { exercise: PythonExercise }) {
  const hideGuidance = exercise.difficulty === 'avancé' || exercise.difficulty === 'expert';

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-[#d7e2ef] bg-[#f7fbff] shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#0077b6]" />
          <span className="text-[11px] font-bold text-[#0077b6] uppercase tracking-wider font-sans">python 3</span>
        </div>
        <p className="text-[10px] text-[#38506a] font-medium font-sans">Use cases multi-domaines, style FAANG</p>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        <div className="rounded-xl border border-[#dbe7f4] bg-white p-3">
          <p className="text-[10px] font-bold text-[#0077b6] uppercase tracking-wider font-sans mb-2">Consignes</p>
          <ul className="space-y-1 text-[11px] text-[#38506a] font-sans">
            <li>Affichez le résultat final avec print(...).</li>
            <li>Évitez les imports externes.</li>
            <li>Une sortie exacte valide l'exercice.</li>
            <li>Raisonnez comme en entretien: KPI, priorisation, impact métier.</li>
          </ul>
        </div>
        {!hideGuidance && (
          <>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider font-sans mb-2">Indice</p>
              <ul className="space-y-1 text-[11px] text-amber-900/80 font-mono leading-relaxed">
                {exercise.hints.map((hint, index) => (
                  <li key={`${exercise.id}-hint-${index}`}>{index + 1}. {hint}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider font-sans mb-2">Sortie attendue</p>
              <p className="text-xs text-[#17324d] font-mono">{exercise.expectedOutput}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PythonWorkspace({
  exercise, onValidated, attempts, onAttempt,
}: {
  exercise: PythonExercise;
  onValidated: () => void;
  attempts: number;
  onAttempt: () => void;
}) {
  const [code, setCode] = useState(exercise.starterCode);
  const [runResult, setRunResult] = useState<PythonRunResult | null>(null);
  const [submitResult, setSubmitResult] = useState<{ valid: boolean; feedback: string } | null>(null);
  const [editorNotice, setEditorNotice] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const editorRef = useRef<any>(null);
  const executeCodeRef = useRef<() => void>(() => {});
  const sessionIdRef = useRef(`recrutement-python-${exercise.id}-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    setCode(exercise.starterCode);
    setRunResult(null);
    setSubmitResult(null);
    setEditorNotice(null);
    setShowHints(false);
    void apiRequest('/api/code/session/reset', {
      method: 'POST', body: JSON.stringify({ sessionId: sessionIdRef.current, language: 'python' }),
    }).catch(() => undefined);
    setTimeout(() => editorRef.current?.focus(), 80);

    return () => {
      void apiRequest('/api/code/session/reset', {
        method: 'POST', body: JSON.stringify({ sessionId: sessionIdRef.current, language: 'python' }),
      }).catch(() => undefined);
    };
  }, [exercise.id, exercise.starterCode]);

  const blockClipboardAction = (message: string) => {
    setEditorNotice(message);
    setTimeout(() => {
      setEditorNotice((current) => (current === message ? null : current));
    }, 1800);
  };

  const executeCode = useCallback(async () => {
    const currentCode = code.trim();
    if (!currentCode || isRunning) return;
    setIsRunning(true);
    setSubmitResult(null);
    try {
      const res = await apiRequest<PythonRunResult>('/api/code/execute/python', {
        method: 'POST', body: JSON.stringify({ code: currentCode, sessionId: sessionIdRef.current }),
      });
      setRunResult(res);
    } catch (err) {
      setRunResult({ result: err instanceof Error ? err.message : 'Erreur réseau.', error: true });
    } finally {
      setIsRunning(false);
      setTimeout(() => editorRef.current?.focus(), 50);
    }
  }, [code, isRunning]);

  const submitAnswer = () => {
    onAttempt();
    if (!runResult || runResult.error) {
      setSubmitResult({ valid: false, feedback: "Exécutez d'abord un script valide avant de soumettre." });
      return;
    }
    const output = runResult?.result || '';
    const result = exercise.validate(output, code);
    setSubmitResult(result);
    if (result.valid) onValidated();
  };

  useEffect(() => {
    executeCodeRef.current = () => { void executeCode(); };
  }, [executeCode]);

  function handleEditorMount(editor: any, monaco: any) {
    editorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => executeCodeRef.current());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => setEditorNotice('Copier est désactivé.'));
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => setEditorNotice('Coller est désactivé.'));
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, () => setEditorNotice('Couper est désactivé.'));
    editor.focus();
  }

  const diff = DIFFICULTY_META[exercise.difficulty];
  const hideGuidance = exercise.difficulty === 'avancé' || exercise.difficulty === 'expert';

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 border-b border-[#d7e2ef] bg-[#f8fbff] px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border font-sans ${diff.color} ${diff.bg} ${diff.border}`}>{diff.label}</span>
          <span className="text-[10px] text-[#38506a] border border-[#dbe7f4] px-2 py-0.5 rounded font-medium font-sans">{exercise.category}</span>
          <span className="text-[10px] text-[#38506a] font-medium font-sans ml-1">· {attempts} tentative{attempts !== 1 ? 's' : ''}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1"><BookOpen className="w-3 h-3 text-[#0077b6]" /><span className="text-[10px] font-bold text-[#0077b6] uppercase tracking-wider font-sans">Problème</span></div>
            <p className="text-sm text-[#17324d] leading-relaxed font-sans">{exercise.problem}</p>
          </div>
          <div className="space-y-2">
            {!hideGuidance && (
              <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2">
                <div className="flex items-center gap-1.5 mb-1"><ChevronRight className="w-3 h-3 text-emerald-700" /><span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider font-sans">Sortie attendue</span></div>
                <p className="text-xs text-[#17324d] font-medium font-mono">{exercise.expectedOutput}</p>
              </div>
            )}
            {!hideGuidance && (
              <div className="rounded border border-[#dbe7f4] bg-white px-3 py-2">
                <button type="button" onClick={() => setShowHints(v => !v)} className="flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-800 transition-colors font-sans">
                  <Lightbulb className="w-3 h-3" />
                  {showHints ? 'Masquer' : `Indices (${exercise.hints.length})`}
                </button>
                {showHints && (
                  <div className="mt-1.5 space-y-1">
                    {exercise.hints.map((hint, index) => (
                      <div key={`${exercise.id}-workspace-hint-${index}`} className="flex gap-1.5 text-xs font-mono bg-amber-50 border border-amber-200 rounded px-2 py-1">
                        <span className="text-amber-700 font-bold font-sans shrink-0">{index + 1}.</span>
                        <span className="text-amber-900/80">{hint}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f3f8ff] border-b border-[#d7e2ef] shrink-0">
        <Terminal className="w-3.5 h-3.5 text-[#38506a]" />
        <span className="text-[11px] text-[#38506a] font-semibold font-sans">Python Editor</span>
        <span className="text-[10px] text-rose-600 font-sans">Copier/coller désactivé</span>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => { setCode(exercise.starterCode); setRunResult(null); setSubmitResult(null); }} className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-[#38506a] hover:text-[#17324d] hover:bg-[#eaf3fc] font-medium font-sans">
            <RefreshCw className="w-3 h-3" />Réinitialiser
          </button>
          <button type="button" disabled={isRunning || !code.trim()} onClick={executeCode} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0a3d5c] hover:bg-[#0d5278] disabled:opacity-40 text-white text-[11px] font-semibold font-sans border border-[#1a6090]">
            <Play className="w-3 h-3 fill-current" />Exécuter<kbd className="text-[9px] opacity-50 bg-white/10 px-1 rounded font-mono">Ctrl+↵</kbd>
          </button>
          <button type="button" disabled={!runResult || !!runResult.error} onClick={submitAnswer} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white text-[11px] font-bold font-sans">
            <Send className="w-3 h-3" />Soumettre
          </button>
        </div>
      </div>

      <div className="shrink-0 border-b border-[#d7e2ef]" style={{ minHeight: '200px' }}>
        <Editor
          height="200px"
          language="python"
          value={code}
          onChange={(value) => { setCode(value || ''); setSubmitResult(null); }}
          onMount={handleEditorMount}
          theme="vs"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            padding: { top: 8 },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 4,
            insertSpaces: true,
            contextmenu: false,
            quickSuggestions: false,
            parameterHints: { enabled: false },
            suggestOnTriggerCharacters: false,
            acceptSuggestionOnEnter: 'off',
            snippetSuggestions: 'none',
          }}
        />
      </div>

      {editorNotice && (
        <div className="shrink-0 px-4 py-2 text-xs font-sans text-rose-700 bg-rose-50 border-b border-rose-200">
          {editorNotice}
        </div>
      )}

      {submitResult && (
        <div className={`flex items-start gap-2.5 px-4 py-2.5 border-b shrink-0 font-sans ${submitResult.valid ? 'bg-green-600 border-green-700' : 'bg-red-600 border-red-700'}`}>
          {submitResult.valid ? <CheckCircle className="w-4 h-4 text-white shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />}
          <div>
            <p className="text-xs font-bold text-white">{submitResult.valid ? 'Réponse correcte ✓' : 'Réponse incorrecte'}</p>
            <p className="text-xs text-white/90">{submitResult.feedback}</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-white">
        {isRunning ? (
          <div className="flex items-center gap-2 px-4 py-3 text-xs text-amber-700 font-sans animate-pulse"><Play className="w-3 h-3" />Exécution…</div>
        ) : runResult ? (
          <div className="p-4 space-y-3">
            <div className={`rounded-xl border px-3 py-3 ${runResult.error ? 'border-red-200 bg-red-50' : 'border-[#dbe7f4] bg-[#f8fbff]'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider font-sans mb-2 ${runResult.error ? 'text-red-700' : 'text-[#0077b6]'}`}>Sortie console</p>
              <pre className={`text-xs whitespace-pre-wrap font-mono ${runResult.error ? 'text-red-700' : 'text-[#17324d]'}`}>{normalizeOutput(runResult.result || '') || 'Aucune sortie.'}</pre>
            </div>
            {runResult.sessionVariables && (
              <div className="rounded-xl border border-[#dbe7f4] bg-white px-3 py-2 text-[11px] text-[#38506a] font-mono">
                {runResult.sessionVariables}
              </div>
            )}
            {runResult.analysis && (
              <div className="rounded-xl border border-[#dbe7f4] bg-white px-3 py-2">
                <p className="text-[10px] font-bold text-[#0077b6] uppercase tracking-wider font-sans mb-1">Analyse</p>
                <p className="text-xs text-[#38506a] font-sans whitespace-pre-wrap">{runResult.analysis}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-[#5c7289] text-xs font-medium font-sans py-6">
            <Terminal className="w-5 h-5 opacity-20" />
            <span>Exécutez votre script pour voir la sortie</span>
          </div>
        )}
      </div>
    </div>
  );
}

function QcmInfoPanel({ exercise, title = 'QCM technique', englishUi = false }: { exercise: QcmExercise; title?: string; englishUi?: boolean }) {
  const diff = getDifficultyMeta(exercise.difficulty, englishUi);
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-[#d7e2ef] bg-[#f7fbff] shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-[#0077b6]" />
          <span className="text-[11px] font-bold text-[#0077b6] uppercase tracking-wider font-sans">{title}</span>
        </div>
      </div>
      <div className="p-3 space-y-2 text-xs font-sans text-[#38506a]">
        <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${diff.bg} ${diff.border} ${diff.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
          {diff.label}
        </div>
        <p className="text-[11px] text-[#5c7289]">{englishUi ? 'Category' : 'Catégorie'}</p>
        <p className="text-xs text-[#17324d] font-semibold">{exercise.category}</p>
        <p className="text-[11px] text-[#5c7289]">{englishUi ? 'Advice' : 'Conseil'}</p>
        <p className="text-xs text-[#38506a] leading-relaxed">{englishUi ? 'Read the scenario carefully and choose the most professional answer.' : 'Lisez attentivement la consigne et choisissez la meilleure réponse technique.'}</p>
      </div>
    </div>
  );
}

function QcmWorkspace({
  exercise, onValidated, onAttempt, onNext, englishUi = false,
}: {
  exercise: QcmExercise;
  onValidated: () => void;
  onAttempt: () => void;
  onNext: () => void;
  englishUi?: boolean;
}) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSelectedOption(null);
    setSubmitted(false);
    return () => { if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current); };
  }, [exercise.id]);

  const handleOptionClick = (index: number) => {
    if (submitted) return;
    setSelectedOption(index);
    onAttempt();
    const valid = index === exercise.correctOption;
    if (valid) onValidated();
    setSubmitted(true);
    // Avance automatiquement à la question suivante après 700 ms
    advanceTimerRef.current = setTimeout(() => { onNext(); }, 700);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 py-3 border-b border-[#d7e2ef] bg-[#f8fbff]">
        <h4 className="text-sm font-bold text-[#17324d] font-sans mb-1">{exercise.title}</h4>
        <p className="text-sm text-[#38506a] font-sans leading-relaxed">{exercise.problem}</p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {submitted && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-sans flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            {englishUi ? 'Answer recorded - moving to the next question...' : 'Réponse enregistrée - passage à la question suivante…'}
          </div>
        )}
        <div className="space-y-3">
          {exercise.options.map((option, index) => {
            const isSelected = selectedOption === index;
            return (
              <button
                key={`${exercise.id}-option-${index}`}
                type="button"
                disabled={submitted}
                onClick={() => handleOptionClick(index)}
                className={`w-full text-left rounded-xl border px-3 py-2.5 transition-colors font-sans text-sm ${
                  submitted
                    ? isSelected
                      ? 'border-[#5aa9e6] bg-[#eef6ff] text-[#17324d] opacity-80'
                      : 'border-[#d7e2ef] bg-[#f8fbff] text-[#5c7289] opacity-40'
                    : 'border-[#d7e2ef] bg-white text-[#38506a] hover:border-[#5aa9e6] hover:bg-[#eef6ff] cursor-pointer'
                }`}
              >
                <span className="font-semibold text-[#0077b6] mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Email fill-in-blank components
// ─────────────────────────────────────────────────────────────

function EmailInfoPanel({ exercise }: { exercise: EmailFillBlankExercise }) {
  const diff = getDifficultyMeta(exercise.difficulty, true);
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-[#d7e2ef] bg-[#f7fbff] shrink-0">
        <div className="flex items-center gap-2">
          <Send className="w-3.5 h-3.5 text-[#0077b6]" />
          <span className="text-[11px] font-bold text-[#0077b6] uppercase tracking-wider font-sans">Email Writing</span>
        </div>
      </div>
      <div className="p-3 space-y-2 text-xs font-sans text-[#38506a]">
        <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${diff.bg} ${diff.border} ${diff.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
          {diff.label}
        </div>
        <p className="text-[11px] text-[#5c7289]">Category</p>
        <p className="text-xs text-[#17324d] font-semibold">{exercise.category}</p>
        <p className="text-[11px] text-[#5c7289]">Instructions</p>
        <p className="text-xs text-[#38506a] leading-relaxed">
          Read the email and fill in each blank with the most appropriate word or phrase. Then click <strong>Submit</strong>.
        </p>
        <p className="text-[11px] text-[#5c7289] pt-1">Blanks to fill</p>
        <p className="text-xs text-[#17324d] font-semibold">{exercise.blanks.length}</p>
      </div>
    </div>
  );
}

function EmailFillWorkspace({
  exercise,
  onValidated,
  onAttempt,
  onNext,
}: {
  exercise: EmailFillBlankExercise;
  onValidated: () => void;
  onAttempt: () => void;
  onNext: () => void;
}) {
  const [values, setValues] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<number, boolean>>({});
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValues({});
    setSubmitted(false);
    setResults({});
    return () => { if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current); };
  }, [exercise.id]);

  const handleSubmit = () => {
    if (submitted) return;
    onAttempt();
    const newResults: Record<number, boolean> = {};
    let allCorrect = true;
    for (const blank of exercise.blanks) {
      const userVal = (values[blank.id] ?? '').trim().toLowerCase();
      const primary = blank.answer.toLowerCase();
      const extra = (blank.acceptableAnswers ?? []).map(a => a.toLowerCase());
      const correct = userVal === primary || extra.includes(userVal);
      newResults[blank.id] = correct;
      if (!correct) allCorrect = false;
    }
    setResults(newResults);
    setSubmitted(true);
    if (allCorrect) onValidated();
    advanceTimerRef.current = setTimeout(() => onNext(), 2200);
  };

  // Split emailBody on {{blank_N}} tokens and render inline inputs
  const renderBody = () => {
    const parts = exercise.emailBody.split(/(\{\{blank_\d+\}\})/g);
    return parts.map((part, i) => {
      const m = part.match(/^\{\{blank_(\d+)\}\}$/);
      if (m) {
        const bid = parseInt(m[1], 10);
        const ok = submitted ? results[bid] : undefined;
        return (
          <input
            key={i}
            type="text"
            value={values[bid] ?? ''}
            onChange={e => {
              if (submitted) return;
              const v = e.target.value;
              setValues(prev => ({ ...prev, [bid]: v }));
            }}
            onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
            disabled={submitted}
            placeholder={`blank ${bid}`}
            className={[
              'inline-block mx-1 px-2 py-0.5 rounded border text-sm font-mono w-28 text-center align-middle transition-colors outline-none',
              submitted
                ? ok
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                  : 'bg-red-50 border-red-400 text-red-700'
                : 'bg-white border-[#5aa9e6] text-[#17324d] focus:ring-2 focus:ring-[#5aa9e6]/30',
            ].join(' ')}
          />
        );
      }
      return (
        <span key={i} className="text-sm text-[#17324d] font-sans" style={{ whiteSpace: 'pre-wrap' }}>
          {part}
        </span>
      );
    });
  };

  const allFilled = exercise.blanks.every(b => (values[b.id] ?? '').trim().length > 0);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Email client header */}
      <div className="shrink-0 border-b border-[#d7e2ef] bg-[#f0f6ff] px-4 py-2.5 space-y-1 text-xs font-sans">
        <div className="flex items-center gap-3">
          <span className="w-14 text-[#8fa8c0] font-semibold shrink-0">From</span>
          <span className="bg-white border border-[#dbe7f4] rounded px-2 py-0.5 text-[#17324d]">{exercise.from}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-14 text-[#8fa8c0] font-semibold shrink-0">To</span>
          <span className="bg-white border border-[#dbe7f4] rounded px-2 py-0.5 text-[#17324d]">{exercise.to}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-14 text-[#8fa8c0] font-semibold shrink-0">Subject</span>
          <span className="font-semibold text-[#17324d]">{exercise.subject}</span>
        </div>
      </div>

      {/* Email body with inline inputs */}
      <div className="flex-1 overflow-auto p-5">
        <div className="max-w-2xl mx-auto bg-white rounded-xl border border-[#dbe7f4] px-6 py-5 shadow-sm leading-8">
          {renderBody()}
        </div>

        {/* Feedback after submission */}
        {submitted && (
          <div className="max-w-2xl mx-auto mt-4 space-y-2">
            {exercise.blanks.map(blank => (
              <div
                key={blank.id}
                className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs font-sans ${
                  results[blank.id]
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {results[blank.id]
                  ? <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  : <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                <span>
                  {results[blank.id]
                    ? `Blank ${blank.id}: correct ✓`
                    : `Blank ${blank.id}: expected "${blank.answer}"${
                        blank.acceptableAnswers?.length
                          ? ` (or: ${blank.acceptableAnswers.join(', ')})`
                          : ''
                      }`}
                </span>
              </div>
            ))}
            <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-sans">
              {exercise.explanation}
            </div>
          </div>
        )}
      </div>

      {/* Footer / submit */}
      <div className="shrink-0 border-t border-[#d7e2ef] bg-[#f8fbff] px-4 py-2 flex items-center justify-between">
        {!submitted ? (
          <Btn onClick={handleSubmit} disabled={!allFilled}>
            <Send className="w-3.5 h-3.5" />
            Submit Answer
          </Btn>
        ) : (
          <span className="text-xs text-emerald-700 font-semibold font-sans flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            Answer submitted - moving to the next question…
          </span>
        )}
        {!submitted && !allFilled && (
          <span className="text-[11px] text-[#8fa8c0] font-sans">Fill all blanks to submit</span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VIEWS
// ─────────────────────────────────────────────────────────────

function EntryChoiceView({ onRecruiter, onCandidate }: { onRecruiter: () => void; onCandidate: () => void }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f9ff]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-[#0077b6]/10 blur-3xl" />
        <div className="absolute right-[-6rem] top-[18%] h-[24rem] w-[24rem] rounded-full bg-[#dd0061]/10 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-[22%] h-[22rem] w-[22rem] rounded-full bg-[#0ea5a4]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-8 md:px-8 lg:px-10 lg:py-10">
        <header>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#dd0061] inline-block" />
              <span className="font-bold text-[#0077b6] text-sm">FYNE</span>
              <span className="text-[#94a3b8] text-xs mx-1">/</span>
              <span className="text-[#64748b] text-xs">Mode Évaluation</span>
            </div>
            <a href="/" className="text-xs font-medium text-[#64748b] border border-[#e2e8f0] rounded-lg px-3 py-1.5 hover:bg-[#f8fafc] transition-colors">← Accueil</a>
          </div>
          <div className="max-w-6xl">
            <h1 className="mt-6 text-4xl font-black leading-[0.95] tracking-tight text-[#17324d] md:text-6xl font-sans lg:max-w-6xl">
              Pilotez vos campagnes d'évaluation et faites passer vos tests dans un espace dédié.
            </h1>
          </div>
        </header>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="group relative overflow-hidden bg-white p-6 shadow-[0_22px_55px_rgba(0,106,158,0.10)] transition-transform duration-300 hover:-translate-y-1 md:p-7">
              <div className="absolute right-0 top-0 h-24 w-24 bg-[#006a9e]/8 blur-2xl" />
              <div className="relative flex h-full flex-col">
                <div className="flex h-12 w-12 items-center justify-center bg-[#006a9e]/10 text-[#006a9e]">
                  <Users className="h-6 w-6" />
                </div>
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#006a9e] font-sans">Espace Évaluateur</p>
                <h3 className="mt-2 text-2xl font-black text-[#17324d] font-sans">Piloter les campagnes de test</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[#5c7289] font-sans">Gérez les candidats, configurez leurs environnements, activez les accès et suivez les restitutions sans sortir du module.</p>
                <div className="mt-5 space-y-2 text-xs text-[#4f6780] font-sans">
                  <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-[#006a9e]" />Création des profils</div>
                  <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-[#006a9e]" />Attribution des tests</div>
                  <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-[#006a9e]" />Suivi des résultats</div>
                </div>
                <Btn onClick={onRecruiter} className="mt-6 w-full justify-center text-base font-semibold bg-[#006a9e] hover:bg-[#005985] shadow-md">
                  Accéder à l'espace évaluateur
                  <ChevronRight className="h-4 w-4" />
                </Btn>
              </div>
            </div>

            <div className="group relative overflow-hidden bg-white p-6 shadow-[0_22px_55px_rgba(221,0,97,0.10)] transition-transform duration-300 hover:-translate-y-1 md:p-7">
              <div className="absolute right-0 top-0 h-24 w-24 bg-[#dd0061]/8 blur-2xl" />
              <div className="relative flex h-full flex-col">
                <div className="flex h-12 w-12 items-center justify-center bg-[#dd0061]/10 text-[#dd0061]">
                  <Terminal className="h-6 w-6" />
                </div>
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#dd0061] font-sans">Espace Candidat</p>
                <h3 className="mt-2 text-2xl font-black text-[#17324d] font-sans">Passer ses tests dans un flux dédié</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[#5c7289] font-sans">Connectez-vous avec vos identifiants fournis, accédez à vos épreuves attribuées et soumettez vos réponses dans un parcours cadré.</p>
                <div className="mt-5 space-y-2 text-xs text-[#4f6780] font-sans">
                  <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-[#dd0061]" />Connexion directe</div>
                  <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-[#dd0061]" />Épreuves attribuées</div>
                  <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-[#dd0061]" />Envoi automatique des résultats</div>
                </div>
                <Btn onClick={onCandidate} className="mt-6 w-full justify-center text-base font-semibold bg-[#dd0061] hover:bg-[#b80052] shadow-md" variant="success">
                  Accéder à l'espace candidat
                  <ChevronRight className="h-4 w-4" />
                </Btn>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
}

// Recruiter entry - connexion par identifiant + mot de passe
function RecruiterEntryView({ onEnter, onBack }: { onEnter: (r: RecruiterSession) => void; onBack: () => void }) {
  const [recruiterId, setRecruiterId] = useState('compte_evaluateur');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const enter = async () => {
    setError('');
    if (!recruiterId.trim() || !password.trim()) {
      setError('Saisissez votre identifiant et votre mot de passe.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; message?: string; recruiter?: RecruiterSession }>('/api/evaluation/recruiter/login', {
        method: 'POST', body: JSON.stringify({ recruiterId: recruiterId.trim(), password: password.trim() }),
      });
      if (res.success && res.recruiter) { saveRecruiter(res.recruiter); onEnter(res.recruiter); }
      else setError(res.message || 'Erreur.');
    } catch (e: any) { setError(e.message || 'Erreur réseau.'); }
    finally { setLoading(false); }
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') enter(); };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-br from-[#f7fbff] via-[#fdf7fb] to-[#eaf6fa]">
      <div className="w-full max-w-md mx-auto">
        <div className="relative overflow-visible group">
          <div className="absolute -inset-1 bg-white/60 backdrop-blur-md rounded-xl shadow-xl group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300 z-0" />
          <div className="relative z-10 flex flex-col items-center px-8 py-10">
            <Users className="w-14 h-14 text-[#006a9e] mb-4 drop-shadow-lg" />
            <h2 className="text-2xl font-bold text-[#17324d] font-sans mb-2">Espace Évaluateur</h2>
            <p className="text-base text-[#6f8398] font-sans mb-7 text-center">Connectez-vous pour retrouver votre historique.</p>
            <div className="w-full mb-4">
              <label className="block text-sm font-semibold text-[#006a9e] mb-1 font-sans">Identifiant évaluateur</label>
              <input
                type="text"
                value={recruiterId}
                onChange={e => setRecruiterId(e.target.value)}
                onKeyDown={handleKey}
                placeholder="compte_evaluateur"
                autoFocus
                className="w-full bg-white/90 border border-[#d7e2ef] rounded-xl px-4 py-3 text-base text-[#17324d] placeholder:text-[#9aa8b8] font-mono outline-none focus:border-[#006a9e] focus:ring-2 focus:ring-[#006a9e]/20 transition-colors"
              />
            </div>
            <div className="w-full mb-6">
              <label className="block text-sm font-semibold text-[#006a9e] mb-1 font-sans">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKey}
                placeholder="••••••••"
                className="w-full bg-white/90 border border-[#d7e2ef] rounded-xl px-4 py-3 text-base text-[#17324d] placeholder:text-[#9aa8b8] font-mono outline-none focus:border-[#dd0061] focus:ring-2 focus:ring-[#dd0061]/20 transition-colors"
              />
            </div>
            {error && <ErrorMsg msg={error} />}
            <Btn onClick={enter} disabled={loading} className="w-full justify-center text-base font-semibold bg-[#006a9e] hover:bg-[#dd0061] transition-colors shadow-md mb-3">
              {loading ? 'Connexion…' : 'Se connecter →'}
            </Btn>
            <div className="flex justify-center mt-2">
              <button type="button" onClick={onBack} className="inline-flex items-center justify-center rounded-xl border border-[#d7e2ef] bg-white/80 px-4 py-2 text-sm font-semibold text-[#4f6780] hover:text-[#dd0061] hover:border-[#006a9e] hover:bg-[#f7fbff] font-sans transition-colors shadow">← Retour</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Recruiter dashboard
function RecruiterDashboard({ recruiter, onLogout }: { recruiter: RecruiterSession; onLogout: () => void }) {
  const [tab, setTab] = useState<'candidates' | 'results'>('candidates');
  const [candidates, setCandidates] = useState<SqlCandidateRecord[]>([]);
  const [results, setResults] = useState<ChallengeResult[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [copiedCandidateId, setCopiedCandidateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingCandidateId, setSavingCandidateId] = useState<string | null>(null);
  const [candidateAssignedDrafts, setCandidateAssignedDrafts] = useState<Record<string, ChallengeType[]>>({});
  const [error, setError] = useState('');

  // New candidate form
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [newAssignedTests, setNewAssignedTests] = useState<ChallengeType[]>(['sql']);
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);

  // Selected result detail
  const [detailResult, setDetailResult] = useState<ChallengeResult | null>(null);

  const fetchCandidates = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await apiRequest<{ success: boolean; candidates: SqlCandidateRecord[] }>(`/api/evaluation/recruiter/candidates?recruiterId=${encodeURIComponent(recruiter.id)}`);
      const fetchedCandidates = res.candidates || [];
      setCandidates(fetchedCandidates);
      setCandidateAssignedDrafts(() => fetchedCandidates.reduce<Record<string, ChallengeType[]>>((acc, cand) => {
        acc[cand.id] = getAssignedTests(cand.assigned_tests, cand.challenge_type || 'sql');
        return acc;
      }, {}));
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [recruiter.id]);

  const fetchResults = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await apiRequest<{ success: boolean; results: ChallengeResult[] }>(`/api/evaluation/recruiter/results?recruiterId=${encodeURIComponent(recruiter.id)}`);
      setResults(res.results || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [recruiter.id]);

  useEffect(() => { fetchCandidates(); }, [fetchCandidates]);
  useEffect(() => { if (tab === 'results') fetchResults(); }, [tab, fetchResults]);

  const createCandidate = async () => {
    setFormError('');
    if (!newId.trim() || !newName.trim() || !newPwd.trim()) { setFormError('Tous les champs sont requis.'); return; }
    if (newAssignedTests.length === 0) { setFormError('Attribuez au moins un test.'); return; }
    setCreating(true);
    try {
      const res = await apiRequest<{ success: boolean; message?: string }>('/api/evaluation/recruiter/candidates', {
        method: 'POST',
        body: JSON.stringify({
          recruiterId: recruiter.id,
          id: newId.trim(),
          name: newName.trim(),
          password: newPwd.trim(),
          assignedTests: getAssignedTests(newAssignedTests, 'sql'),
        }),
      });
      if (res.success) { setNewId(''); setNewName(''); setNewPwd(''); setNewAssignedTests(['sql']); fetchCandidates(); }
      else setFormError(res.message || 'Erreur.');
    } catch (e: any) { setFormError(e.message); }
    finally { setCreating(false); }
  };

  const updateCandidateEnvironment = async (cand: SqlCandidateRecord, assignedTests: ChallengeType[]) => {
    setSavingCandidateId(cand.id);
    try {
      await apiRequest(`/api/evaluation/recruiter/candidates/${encodeURIComponent(cand.id)}/environment`, {
        method: 'PATCH', body: JSON.stringify({ recruiterId: recruiter.id, assignedTests: getAssignedTests(assignedTests, cand.challenge_type || 'sql') }),
      });
      await fetchCandidates();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSavingCandidateId((current) => (current === cand.id ? null : current));
    }
  };

  const toggleCandidateTest = (cand: SqlCandidateRecord, test: ChallengeType) => {
    setCandidateAssignedDrafts((prev) => {
      const current = getAssignedTests(prev[cand.id] || cand.assigned_tests, cand.challenge_type || 'sql');
      const next = current.includes(test)
        ? current.filter((value) => value !== test)
        : [...current, test];
      if (next.length === 0) return prev;
      return { ...prev, [cand.id]: next };
    });
  };

  const saveCandidateTests = (cand: SqlCandidateRecord) => {
    const assignedTests = getAssignedTests(candidateAssignedDrafts[cand.id] || cand.assigned_tests, cand.challenge_type || 'sql');
    updateCandidateEnvironment(cand, assignedTests);
  };

  const toggleAccess = async (cand: SqlCandidateRecord) => {
    try {
      await apiRequest(`/api/evaluation/recruiter/candidates/${encodeURIComponent(cand.id)}/access`, {
        method: 'PATCH', body: JSON.stringify({ recruiterId: recruiter.id, accessGranted: !cand.access_granted }),
      });
      fetchCandidates();
    } catch (e: any) { setError(e.message); }
  };

  const deleteCandidate = async (cand: SqlCandidateRecord) => {
    if (!confirm(`Supprimer le candidat "${cand.name}" ?`)) return;
    try {
      await apiRequest(`/api/evaluation/recruiter/candidates/${encodeURIComponent(cand.id)}`, {
        method: 'DELETE', body: JSON.stringify({ recruiterId: recruiter.id }),
      });
      fetchCandidates();
    } catch (e: any) { setError(e.message); }
  };

  const openCandidateProfile = (cand: SqlCandidateRecord) => {
    setSelectedCandidateId(cand.id);
    setDetailResult(null);
    setTab('results');
  };

  const copyCandidateLink = async (cand: SqlCandidateRecord) => {
    try {
      const link = `${window.location.origin}/evaluation?candidateId=${encodeURIComponent(cand.id)}`;
      await navigator.clipboard.writeText(link);
      setCopiedCandidateId(cand.id);
      setTimeout(() => setCopiedCandidateId((current) => (current === cand.id ? null : current)), 1800);
    } catch {
      setError('Impossible de copier le lien candidat.');
    }
  };

  const filteredResults = selectedCandidateId
    ? results.filter((result) => result.candidate_id === selectedCandidateId)
    : results;

  const filteredResultsSorted = [...filteredResults].sort((a, b) => {
    const dateDiff = new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    if (dateDiff !== 0) return dateDiff;
    return b.id - a.id;
  });

  const sessionByResultId = results.reduce<Record<number, { sessionNumber: number; totalSessions: number }>>((acc, result) => {
    const sameCandidateResults = results
      .filter((item) => item.candidate_id === result.candidate_id)
      .sort((a, b) => {
        const dateDiff = new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
        if (dateDiff !== 0) return dateDiff;
        return a.id - b.id;
      });
    const sessionNumber = sameCandidateResults.findIndex((item) => item.id === result.id) + 1;
    acc[result.id] = {
      sessionNumber: sessionNumber > 0 ? sessionNumber : 1,
      totalSessions: sameCandidateResults.length,
    };
    return acc;
  }, {});

  const getScorePct = (result: ChallengeResult) => (
    result.total_exercises ? Math.round((result.score / result.total_exercises) * 100) : 0
  );

  const getAttemptsCount = (result: ChallengeResult) => (
    (result.exercises_detail || []).reduce((total, ex) => total + (ex.attempts || 0), 0)
  );

  const averageScorePct = filteredResultsSorted.length
    ? Math.round(filteredResultsSorted.reduce((acc, result) => acc + getScorePct(result), 0) / filteredResultsSorted.length)
    : 0;

  const successRatePct = filteredResultsSorted.length
    ? Math.round(filteredResultsSorted.filter((result) => getScorePct(result) >= 70).length / filteredResultsSorted.length * 100)
    : 0;

  const averageTimeSec = filteredResultsSorted.length
    ? Math.round(filteredResultsSorted.reduce((acc, result) => acc + result.time_seconds, 0) / filteredResultsSorted.length)
    : 0;

  const profilesInScopeCount = new Set(filteredResultsSorted.map((result) => result.candidate_id)).size;

  const candidateSummaries = Object.values(
    filteredResultsSorted.reduce<Record<string, {
      candidateId: string;
      candidateName: string;
      sessions: number;
      totalScorePct: number;
      bestScorePct: number;
      totalTimeSec: number;
      totalAttempts: number;
      lastSubmittedAt: string;
    }>>((acc, result) => {
      const key = result.candidate_id;
      if (!acc[key]) {
        acc[key] = {
          candidateId: result.candidate_id,
          candidateName: result.candidate_name || result.candidate_id,
          sessions: 0,
          totalScorePct: 0,
          bestScorePct: 0,
          totalTimeSec: 0,
          totalAttempts: 0,
          lastSubmittedAt: result.submitted_at,
        };
      }

      const summary = acc[key];
      const scorePct = getScorePct(result);
      summary.sessions += 1;
      summary.totalScorePct += scorePct;
      summary.bestScorePct = Math.max(summary.bestScorePct, scorePct);
      summary.totalTimeSec += result.time_seconds;
      summary.totalAttempts += getAttemptsCount(result);
      if (new Date(result.submitted_at).getTime() > new Date(summary.lastSubmittedAt).getTime()) {
        summary.lastSubmittedAt = result.submitted_at;
      }
      return acc;
    }, {})
  )
    .map((summary) => ({
      ...summary,
      averageScorePct: Math.round(summary.totalScorePct / summary.sessions),
      averageTimeSec: Math.round(summary.totalTimeSec / summary.sessions),
      averageAttempts: Math.round(summary.totalAttempts / summary.sessions),
    }))
    .sort((a, b) => {
      if (b.averageScorePct !== a.averageScorePct) return b.averageScorePct - a.averageScorePct;
      if (a.averageTimeSec !== b.averageTimeSec) return a.averageTimeSec - b.averageTimeSec;
      return b.sessions - a.sessions;
    });

  const topProfile = candidateSummaries[0] || null;
  const watchProfile = candidateSummaries[candidateSummaries.length - 1] || null;

  const scoreBuckets = {
    strong: filteredResultsSorted.filter((result) => getScorePct(result) >= 70).length,
    medium: filteredResultsSorted.filter((result) => getScorePct(result) >= 40 && getScorePct(result) < 70).length,
    low: filteredResultsSorted.filter((result) => getScorePct(result) < 40).length,
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}min ${s % 60}s`;
  const fmtDate = (d: string) => new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="shrink-0 bg-[#f3f8ff] border-b border-[#d7e2ef] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-[#0077b6]" />
          <span className="font-bold text-[#17324d] text-sm font-sans">Mode Évaluation - Évaluateur</span>
          {/* <span className="text-xs text-[#667c93] font-sans">· {recruiter.name}</span> */}
          <span className="text-[10px] font-mono text-[#4f6780] bg-white border border-[#d7e2ef] px-2 py-0.5 rounded">{recruiter.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="ghost" onClick={onLogout} className="text-xs py-1"><LogOut className="w-3.5 h-3.5" />Déconnexion</Btn>
        </div>
      </header>

      <div className="flex-1 p-4 max-w-5xl mx-auto w-full">
        {/* Tabs */}
        <div className="flex border-b border-[#d7e2ef] mb-5">
          {([
            { key: 'candidates', label: 'Candidats', icon: <Users className="w-3.5 h-3.5" /> },
            { key: 'results', label: 'Résultats', icon: <BarChart3 className="w-3.5 h-3.5" /> },
          ] as const).map(t => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold font-sans border-b-2 transition-colors ${tab === t.key ? 'text-[#0077b6] border-[#e75480]' : 'text-[#6f8398] border-transparent hover:text-[#17324d]'}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {error && <ErrorMsg msg={error} />}

        {/* Candidates tab */}
        {tab === 'candidates' && (
          <div className="space-y-4">
            {/* Create form */}
            <Card className="p-4 bg-[#f6faff] border border-[#dbe7f4] rounded-2xl">
              <h3 className="text-sm font-bold text-[#17324d] mb-3 font-sans flex items-center gap-2"><UserPlus className="w-4 h-4 text-[#0077b6]" />Créer un candidat</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
                <Input label="Identifiant (login)" value={newId} onChange={setNewId} placeholder="jean.dupont" />
                <Input label="Nom complet" value={newName} onChange={setNewName} placeholder="Jean Dupont" />
                <Input label="Mot de passe candidat" value={newPwd} onChange={setNewPwd} placeholder="••••••••" />
                <div>
                  <label className="block text-xs font-semibold text-[#38506a] mb-1 font-sans">Tests attribués</label>
                  <div className="flex flex-wrap gap-1.5">
                    {CHALLENGE_OPTIONS.map((opt) => {
                      const active = newAssignedTests.includes(opt.value);
                      return (
                        <button
                          key={`new-${opt.value}`}
                          type="button"
                          onClick={() => {
                            const next = active
                              ? newAssignedTests.filter((item) => item !== opt.value)
                              : [...newAssignedTests, opt.value];
                            if (next.length > 0) setNewAssignedTests(next);
                          }}
                          className={`px-2 py-1 rounded-lg border text-[11px] font-semibold font-sans transition-colors ${active ? 'bg-[#e8f3ff] border-[#5aa9e6] text-[#17324d]' : 'bg-white border-[#d7e2ef] text-[#5c7289] hover:border-[#9ec5df]'}`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              {formError && <div className="mb-2"><ErrorMsg msg={formError} /></div>}
              <Btn onClick={createCandidate} disabled={creating}><UserPlus className="w-3.5 h-3.5" />{creating ? 'Création…' : 'Créer le candidat'}</Btn>
            </Card>

            {/* Candidate list */}
            <Card className="overflow-hidden bg-transparent">
              <div className="px-4 py-3 border-b border-[#d7e2ef] flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#17324d] font-sans">Mes candidats ({candidates.length})</h3>
                <button type="button" onClick={fetchCandidates} className="text-xs text-[#6f8398] hover:text-[#17324d] font-sans flex items-center gap-1"><RefreshCw className="w-3 h-3" />Actualiser</button>
              </div>
              {loading ? (
                <div className="px-4 py-6 text-center text-xs text-[#6f8398] font-sans">Chargement…</div>
              ) : candidates.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-[#6f8398] font-sans">Aucun candidat. Créez-en un ci-dessus.</div>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#eef5ff] border-b border-[#d7e2ef]">
                      {['Identifiant', 'Nom', 'Environnement', 'Créé le', 'Profil', 'Lien candidat', 'Accès', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-2 text-[#5c7289] font-semibold font-sans">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((c, i) => (
                      <tr key={c.id} className={`border-b border-[#e4edf7] ${i % 2 === 0 ? 'bg-[#f8fbff]' : 'bg-[#fdf6fa]'}`}>
                        <td className="px-4 py-2.5 font-mono text-[#0077b6]">{c.id}</td>
                        <td className="px-4 py-2.5 text-[#17324d] font-sans">{c.name}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {CHALLENGE_OPTIONS.map((opt) => {
                              const assigned = getAssignedTests(candidateAssignedDrafts[c.id] || c.assigned_tests, c.challenge_type || 'sql');
                              const active = assigned.includes(opt.value);
                              return (
                                <button
                                  key={`${c.id}-${opt.value}`}
                                  type="button"
                                  onClick={() => toggleCandidateTest(c, opt.value)}
                                  className={`px-2 py-1 rounded-lg border text-[11px] font-semibold font-sans transition-colors ${active ? 'bg-[#e8f3ff] border-[#5aa9e6] text-[#17324d]' : 'bg-white border-[#d7e2ef] text-[#5c7289] hover:border-[#9ec5df]'}`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                          <button
                            type="button"
                            onClick={() => saveCandidateTests(c)}
                            disabled={savingCandidateId === c.id}
                            className="text-[11px] font-semibold font-sans text-[#0077b6] hover:text-[#e75480] disabled:opacity-40"
                          >
                            {savingCandidateId === c.id ? 'Enregistrement...' : 'Enregistrer'}
                          </button>
                        </td>
                        <td className="px-4 py-2.5 text-[#6f8398] font-sans">{fmtDate(c.created_at)}</td>
                        <td className="px-4 py-2.5">
                          <button
                            type="button"
                            onClick={() => openCandidateProfile(c)}
                            className="text-[11px] font-semibold font-sans text-[#0077b6] hover:text-[#e75480]"
                          >
                            Voir résultats
                          </button>
                        </td>
                        <td className="px-4 py-2.5">
                          <button
                            type="button"
                            onClick={() => copyCandidateLink(c)}
                            className="text-[11px] font-semibold font-sans text-[#5c7289] hover:text-[#17324d]"
                          >
                            {copiedCandidateId === c.id ? 'Lien copié' : 'Copier le lien'}
                          </button>
                        </td>
                        <td className="px-4 py-2.5">
                          <button type="button" onClick={() => toggleAccess(c)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold font-sans transition-colors ${
                              c.access_granted
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                            }`}>
                            {c.access_granted ? <><ShieldCheck className="w-3 h-3" />Autorisé</> : <><ShieldOff className="w-3 h-3" />Refusé</>}
                          </button>
                        </td>
                        <td className="px-4 py-2.5">
                          <button type="button" onClick={() => deleteCandidate(c)} className="text-gray-600 hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            <Card className="px-4 py-3 bg-[#f6faff] border border-[#dbe7f4] rounded-2xl">
              <p className="text-xs text-[#5c7289] font-sans">
                <span className="font-semibold text-[#38506a]">Votre identifiant évaluateur :</span> <span className="font-mono text-[#0077b6]">{recruiter.id}</span>
                <span className="mx-2">·</span>Transmettez l'identifiant, le mot de passe et les tests attribués au candidat. Activez l'accès uniquement quand le test doit commencer.
              </p>
            </Card>
          </div>
        )}

        {/* Results tab */}
        {tab === 'results' && (
          <div>
            {/* ── KPI STRIP ── */}
            <div className="grid grid-cols-2 xl:grid-cols-5 border border-[#061019]/10 mb-8">
              {[
                { label: 'Résultats reçus', value: filteredResultsSorted.length, sub: 'toutes sessions', color: '#006a9e' },
                { label: 'Profils suivis', value: profilesInScopeCount, sub: 'vision consolidée', color: '#061019' },
                { label: 'Score moyen', value: `${averageScorePct}%`, sub: 'référence globale', color: '#061019' },
                { label: 'Taux de réussite', value: `${successRatePct}%`, sub: 'seuil fixé à 70 %', color: successRatePct >= 70 ? '#006a9e' : '#dd0061' },
                { label: 'Temps moyen', value: fmtTime(averageTimeSec), sub: 'par session', color: '#061019' },
              ].map((kpi, i) => (
                <div key={i} className="border-r border-b border-[#061019]/10 last:border-r-0 px-5 py-5 xl:border-b-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9ab0c2] font-sans">{kpi.label}</p>
                  <p className="mt-3 text-3xl font-black leading-none font-sans" style={{ color: kpi.color }}>{kpi.value}</p>
                  <p className="mt-2 text-[11px] text-[#9ab0c2] font-sans">{kpi.sub}</p>
                </div>
              ))}
            </div>

            {/* ── ANALYSE + CLASSEMENT ── */}
            <div className="grid gap-0 mb-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1px)_minmax(0,1fr)] border border-[#061019]/10">
              {/* Lecture globale */}
              <div className="p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9ab0c2] font-sans mb-5">Lecture globale</p>

                {/* 2x2 métriques */}
                <div className="grid grid-cols-2 gap-px bg-[#061019]/8 mb-5">
                  <div className="bg-white px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#9ab0c2] font-sans">Meilleur profil</p>
                    <p className="mt-2 text-base font-black text-[#061019] font-sans leading-tight">{topProfile ? topProfile.candidateName : '-'}</p>
                    <p className="mt-1 text-[11px] text-[#607487] font-sans">{topProfile ? `${topProfile.averageScorePct} % · ${topProfile.sessions} session${topProfile.sessions > 1 ? 's' : ''}` : 'En attente'}</p>
                  </div>
                  <div className="bg-white px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#dd0061]/70 font-sans">Profil à surveiller</p>
                    <p className="mt-2 text-base font-black text-[#061019] font-sans leading-tight">{watchProfile ? watchProfile.candidateName : '-'}</p>
                    <p className="mt-1 text-[11px] text-[#607487] font-sans">{watchProfile ? `${watchProfile.averageScorePct} % · ${watchProfile.averageAttempts} tent./session` : 'Aucun écart'}</p>
                  </div>
                  <div className="bg-white px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#9ab0c2] font-sans">Engagement moyen</p>
                    <p className="mt-2 text-base font-black text-[#061019] font-sans leading-tight">
                      {filteredResultsSorted.length ? Math.round(filteredResultsSorted.reduce((acc, result) => acc + getAttemptsCount(result), 0) / filteredResultsSorted.length) : 0} tent.
                    </p>
                    <p className="mt-1 text-[11px] text-[#607487] font-sans">actions par rendu</p>
                  </div>
                  <div className="bg-white px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#9ab0c2] font-sans">Cadence</p>
                    <p className="mt-2 text-base font-black text-[#061019] font-sans leading-tight">{profilesInScopeCount ? Math.round(filteredResultsSorted.length / profilesInScopeCount) : 0} sess./profil</p>
                    <p className="mt-1 text-[11px] text-[#607487] font-sans">stabilité dans le temps</p>
                  </div>
                </div>

                {/* Distribution scores */}
                <div className="border-t border-[#061019]/8 pt-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9ab0c2] font-sans mb-3">Distribution des scores</p>
                  <div className="space-y-2">
                    {[
                      { label: '≥ 70 %', count: scoreBuckets.strong, total: filteredResultsSorted.length, color: '#006a9e' },
                      { label: '40 - 69 %', count: scoreBuckets.medium, total: filteredResultsSorted.length, color: '#e08800' },
                      { label: '< 40 %', count: scoreBuckets.low, total: filteredResultsSorted.length, color: '#dd0061' },
                    ].map((bucket) => (
                      <div key={bucket.label} className="flex items-center gap-3">
                        <span className="w-16 shrink-0 text-[11px] font-black font-sans text-[#061019]">{bucket.label}</span>
                        <div className="flex-1 h-1.5 bg-[#061019]/8">
                          <div className="h-full transition-all" style={{ width: bucket.total ? `${Math.round((bucket.count / bucket.total) * 100)}%` : '0%', background: bucket.color }} />
                        </div>
                        <span className="w-6 shrink-0 text-right text-[11px] font-black font-sans" style={{ color: bucket.color }}>{bucket.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Séparateur vertical */}
              <div className="hidden xl:block bg-[#061019]/8" />

              {/* Classement profils */}
              <div className="p-6 border-t border-[#061019]/10 xl:border-t-0">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9ab0c2] font-sans">Classement profils</p>
                  {selectedCandidateId && (
                    <button type="button" onClick={() => setSelectedCandidateId(null)} className="text-[10px] font-semibold text-[#9ab0c2] hover:text-[#061019] font-sans uppercase tracking-wider transition-colors">
                      Vue globale
                    </button>
                  )}
                </div>

                {candidateSummaries.length === 0 ? (
                  <p className="text-sm text-[#9ab0c2] font-sans py-6 text-center">Aucun profil pour l'instant.</p>
                ) : (
                  <div className="divide-y divide-[#061019]/8">
                    {candidateSummaries.slice(0, selectedCandidateId ? 1 : 6).map((profile, index) => (
                      <button
                        key={profile.candidateId}
                        type="button"
                        onClick={() => { setSelectedCandidateId(profile.candidateId); setDetailResult(null); }}
                        className={`w-full py-3.5 text-left transition-colors hover:bg-[#061019]/[0.025] ${selectedCandidateId === profile.candidateId ? 'bg-[#006a9e]/5' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 min-w-0">
                            <span className={`mt-0.5 shrink-0 flex h-5 w-5 items-center justify-center text-[10px] font-black font-sans ${index === 0 ? 'bg-[#061019] text-white' : 'border border-[#061019]/15 text-[#607487]'}`}>
                              {index + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-[#061019] font-sans">{profile.candidateName}</p>
                              <p className="truncate text-[10px] text-[#9ab0c2] font-mono">{profile.candidateId}</p>
                              <p className="mt-1 text-[10px] text-[#9ab0c2] font-sans">{profile.sessions} sess. · {fmtDate(profile.lastSubmittedAt)}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xl font-black text-[#061019] font-sans leading-none">{profile.averageScorePct}<span className="text-sm font-bold text-[#9ab0c2]">%</span></p>
                            <p className="mt-0.5 text-[10px] font-sans" style={{ color: profile.averageScorePct >= averageScorePct ? '#006a9e' : '#dd0061' }}>
                              {profile.averageScorePct >= averageScorePct ? '+' : ''}{profile.averageScorePct - averageScorePct} vs moy.
                            </p>
                          </div>
                        </div>
                        <div className="mt-2.5 ml-8 flex items-center gap-4 text-[10px] font-sans text-[#9ab0c2]">
                          <span>{fmtTime(profile.averageTimeSec)}</span>
                          <span className="h-3 w-px bg-[#061019]/10" />
                          <span>{profile.averageAttempts} tent./sess.</span>
                          <span className="h-3 w-px bg-[#061019]/10" />
                          <span>meilleur {profile.bestScorePct} %</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── LISTE DES RÉSULTATS ── */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#061019] font-sans">
                  {filteredResultsSorted.length} résultat{filteredResultsSorted.length !== 1 ? 's' : ''}
                </p>
                {selectedCandidateId && (
                  <>
                    <span className="text-[#9ab0c2] text-[10px]">·</span>
                    <span className="text-[10px] font-mono text-[#006a9e]">{selectedCandidateId}</span>
                    <button type="button" onClick={() => setSelectedCandidateId(null)} className="text-[10px] text-[#9ab0c2] hover:text-[#dd0061] font-sans transition-colors">Réinitialiser</button>
                  </>
                )}
              </div>
              <button type="button" onClick={fetchResults} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#9ab0c2] hover:text-[#061019] font-sans transition-colors">
                <RefreshCw className="w-3 h-3" />Actualiser
              </button>
            </div>

            {loading ? (
              <div className="border border-[#061019]/10 px-6 py-10 text-center text-xs text-[#9ab0c2] font-sans">Chargement…</div>
            ) : filteredResultsSorted.length === 0 ? (
              <div className="border border-[#061019]/10 px-6 py-10 text-center text-xs text-[#9ab0c2] font-sans">Aucun résultat reçu pour l'instant.</div>
            ) : (
              <div className="border border-[#061019]/10 divide-y divide-[#061019]/8">
                {filteredResultsSorted.map((r) => {
                  const pct = getScorePct(r);
                  const barColor = pct >= 70 ? '#006a9e' : pct >= 40 ? '#e08800' : '#dd0061';
                  const isOpen = detailResult?.id === r.id;
                  return (
                    <div key={r.id}>
                      <button
                        type="button"
                        className="w-full px-5 py-4 text-left hover:bg-[#061019]/[0.02] transition-colors"
                        onClick={() => setDetailResult(isOpen ? null : r)}
                      >
                        <div className="flex items-center gap-4">
                          {/* Score prominent */}
                          <div className="shrink-0 w-14 text-right">
                            <span className="text-2xl font-black leading-none font-sans" style={{ color: barColor }}>{pct}</span>
                            <span className="text-xs font-bold text-[#9ab0c2] font-sans">%</span>
                          </div>

                          <div className="w-px h-8 shrink-0 bg-[#061019]/10" />

                          {/* Identity + meta */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-black text-[#061019] font-sans">{r.candidate_name || r.candidate_id}</span>
                              <span className="font-mono text-[10px] text-[#9ab0c2]">{r.candidate_id}</span>
                              <span className="text-[10px] border border-[#061019]/12 px-1.5 py-0.5 text-[#607487] font-sans font-semibold">{getChallengeTypeLabel(r.challenge_type || 'sql')}</span>
                              <span className="text-[10px] border border-[#006a9e]/25 px-1.5 py-0.5 text-[#006a9e] font-sans font-semibold">Session #{sessionByResultId[r.id]?.sessionNumber || 1}</span>
                              {r.early_quit && <span className="text-[10px] border border-[#e08800]/30 px-1.5 py-0.5 text-[#e08800] font-sans font-semibold">Terminé tôt · {fmtTime(r.time_seconds)}</span>}
                            </div>
                            <p className="mt-1 text-[10px] text-[#9ab0c2] font-sans">{fmtDate(r.submitted_at)}</p>
                          </div>

                          {/* Stats */}
                          <div className="hidden sm:flex items-center gap-5 shrink-0 text-[11px] font-sans">
                            <div>
                              <p className="font-black text-[#061019]">{r.score}/{r.total_exercises}</p>
                              <p className="text-[#9ab0c2]">exercices</p>
                            </div>
                            <div className="w-px h-6 bg-[#061019]/10" />
                            <div>
                              <p className="font-black text-[#061019]">{fmtTime(r.time_seconds)}</p>
                              <p className="text-[#9ab0c2]">temps</p>
                            </div>
                            <div className="w-px h-6 bg-[#061019]/10" />
                            <div>
                              <p className="font-black text-[#061019]">{getAttemptsCount(r)}</p>
                              <p className="text-[#9ab0c2]">tentatives</p>
                            </div>
                            <div className="w-px h-6 bg-[#061019]/10" />
                            <div>
                              <p className="font-black font-sans text-[10px]" style={{ color: pct >= averageScorePct ? '#006a9e' : '#dd0061' }}>
                                {pct >= averageScorePct ? '+' : ''}{pct - averageScorePct} pts
                              </p>
                              <p className="text-[#9ab0c2]">vs moy.</p>
                            </div>
                          </div>

                          <ChevronDown className={`w-4 h-4 shrink-0 text-[#9ab0c2] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Barre de score */}
                        <div className="mt-3 ml-[4.5rem] h-px bg-[#061019]/8">
                          <div className="h-full transition-all duration-500" style={{ width: `${Math.max(pct, 2)}%`, background: barColor }} />
                        </div>
                        <div className="mt-1 ml-[4.5rem] flex items-center justify-between text-[10px] font-sans text-[#9ab0c2]">
                          <span>Session {sessionByResultId[r.id]?.sessionNumber || 1}/{sessionByResultId[r.id]?.totalSessions || 1}</span>
                        </div>
                      </button>

                      {/* Détail exercices */}
                      {isOpen && (
                        <div className="bg-[#061019]/[0.02] border-t border-[#061019]/8 px-5 py-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9ab0c2] font-sans mb-3">Détail par exercice</p>
                          <div className="divide-y divide-[#061019]/6">
                            {(r.exercises_detail || []).map((ex) => (
                              <div key={ex.exerciseId} className="flex items-center gap-4 py-2.5 text-xs font-sans">
                                <span className={`shrink-0 flex h-5 w-5 items-center justify-center text-[10px] font-black ${ex.completed ? 'bg-[#006a9e] text-white' : 'border border-[#061019]/15 text-[#9ab0c2]'}`}>
                                  {ex.completed ? '✓' : ex.exerciseId}
                                </span>
                                <span className={`flex-1 font-sans ${ex.completed ? 'text-[#061019] font-semibold' : 'text-[#9ab0c2]'}`}>{ex.title}</span>
                                <span className="text-[#9ab0c2] shrink-0">{ex.attempts} tent.</span>
                                <span className="text-[#9ab0c2] shrink-0 w-14 text-right font-mono">{fmtTime(ex.timeSeconds)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Candidate login
function CandidateLoginView({ onLogin, onBack }: { onLogin: (c: CandidateSession) => void; onBack: () => void }) {
  const [id, setId] = useState('');
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prefilledCandidateId = new URLSearchParams(window.location.search).get('candidateId');
    if (prefilledCandidateId) setId(prefilledCandidateId);
  }, []);

  const submit = async () => {
    setError('');
    if (!id.trim() || !pwd.trim()) { setError('Remplissez tous les champs.'); return; }
    setLoading(true);
    try {
      const res = await apiRequest<{ success: boolean; message?: string; candidate?: CandidateSession }>('/api/evaluation/candidate/login', {
        method: 'POST', body: JSON.stringify({ candidateId: id.trim(), password: pwd.trim() }),
      });
      if (res.success && res.candidate) { saveCandidate(res.candidate); onLogin(res.candidate); }
      else setError(res.message || 'Erreur.');
    } catch (e: any) { setError(e.message || 'Erreur réseau.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-br from-[#f7fbff] via-[#fdf7fb] to-[#eaf6fa]">
      <div className="w-full max-w-md mx-auto">
        <div className="relative overflow-visible group">
          <div className="absolute -inset-1 bg-white/60 backdrop-blur-md rounded-xl shadow-xl group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300 z-0" />
          <div className="relative z-10 flex flex-col items-center px-8 py-10">
            <Terminal className="w-14 h-14 text-[#dd0061] mb-4 drop-shadow-lg" />
            <h2 className="text-2xl font-bold text-[#17324d] font-sans mb-2">Connexion Candidat</h2>
            <p className="text-base text-[#6f8398] font-sans mb-7 text-center">Utilisez les identifiants fournis par votre évaluateur pour accéder à votre environnement SQL, Python, QCM ou Anglais.</p>
            <div className="w-full mb-4">
              <label className="block text-sm font-semibold text-[#dd0061] mb-1 font-sans">Identifiant</label>
              <input
                type="text"
                value={id}
                onChange={e => setId(e.target.value)}
                placeholder="jean.dupont"
                autoFocus
                className="w-full bg-white/90 border border-[#d7e2ef] rounded-xl px-4 py-3 text-base text-[#17324d] placeholder:text-[#9aa8b8] font-mono outline-none focus:border-[#dd0061] focus:ring-2 focus:ring-[#dd0061]/20 transition-colors"
              />
            </div>
            <div className="w-full mb-6">
              <label className="block text-sm font-semibold text-[#dd0061] mb-1 font-sans">Mot de passe</label>
              <input
                type="password"
                value={pwd}
                onChange={e => setPwd(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/90 border border-[#d7e2ef] rounded-xl px-4 py-3 text-base text-[#17324d] placeholder:text-[#9aa8b8] font-mono outline-none focus:border-[#dd0061] focus:ring-2 focus:ring-[#dd0061]/20 transition-colors"
              />
            </div>
            {error && <ErrorMsg msg={error} />}
            <Btn onClick={submit} disabled={loading} variant="success" className="w-full justify-center text-base font-semibold bg-[#dd0061] hover:bg-[#006a9e] transition-colors shadow-md mb-3">
              {loading ? 'Connexion…' : 'Commencer le test'}
            </Btn>
            <div className="w-full flex flex-col items-center mt-2 mb-2">
              <div className="flex items-center justify-center gap-2 text-sm text-[#6f8398] font-sans mb-2">
                <Clock className="w-4 h-4" />
                <span>Le test dure <strong className="text-[#38506a]">30 minutes</strong>. Le chronomètre démarre à la connexion.</span>
              </div>
            </div>
            <div className="flex justify-center mt-2">
              <button type="button" onClick={onBack} className="inline-flex items-center justify-center rounded-xl border border-[#d7e2ef] bg-white/80 px-4 py-2 text-sm font-semibold text-[#4f6780] hover:text-[#dd0061] hover:border-[#006a9e] hover:bg-[#f7fbff] font-sans transition-colors shadow">← Retour</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CandidateSpaceView({ candidate, onStartTest, onLogout }: { candidate: CandidateSession; onStartTest: (challengeType: ChallengeType) => void; onLogout: () => void }) {
  const assignedTests = getAssignedTests(candidate.assignedTests, candidate.challengeType || 'sql');
  const hasMultipleTests = assignedTests.length > 1;

  const TEST_META: Record<ChallengeType, { label: string; sub: string; duration: string; hint: string; color: string }> = {
    sql:     { label: 'SQL',           sub: 'Requêtes & bases de données', duration: '30 min', hint: 'Filtres, jointures, agrégats sur un schéma réel.',    color: '#006a9e' },
    python:  { label: 'Python',        sub: 'Algorithmique & données',      duration: '30 min', hint: 'Structures de données, logique, manipulation fichiers.', color: '#006a9e' },
    qcm:     { label: 'QCM Technique', sub: 'Culture tech & architecture',  duration: '20 min', hint: 'Questions à choix multiples, 1 bonne réponse par item.', color: '#dd0061' },
    english: { label: 'Anglais',       sub: 'Compréhension & vocabulaire',  duration: '20 min', hint: 'Questions en anglais, réponses en anglais.',           color: '#dd0061' },
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(0,106,158,0.18),_transparent_28%),radial-gradient(circle_at_85%_18%,_rgba(221,0,97,0.08),_transparent_22%),linear-gradient(180deg,_#f8fbff_0%,_#eef4fb_44%,_#f5f8fc_100%)] text-[#17324d] flex flex-col">
      {/* Header */}
      <header className="shrink-0 bg-white/46 backdrop-blur px-6 lg:px-12 py-4 flex items-center justify-between shadow-[0_8px_30px_rgba(23,50,77,0.04)]">
        <div className="flex items-center gap-3">
          <div className="h-5 w-px bg-[#c7d8e7]" />
          <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#5f7891] font-sans">Espace candidat</span>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#6f8398] hover:text-[#17324d] font-sans transition-colors"
        >
          <LogOut className="w-3 h-3" />Déconnexion
        </button>
      </header>

      {/* Main */}
      <div className="flex-1 px-6 lg:px-12 py-10 lg:py-14 max-w-6xl mx-auto w-full">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_320px] lg:items-stretch">
          <section className="bg-white/24 backdrop-blur-[8px] px-7 py-8 lg:px-10 lg:py-10 shadow-[0_18px_50px_rgba(23,50,77,0.04)]">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#6f8398] font-sans">Session active</p>
            <h1 className="mt-4 max-w-2xl text-4xl lg:text-6xl font-black text-[#17324d] leading-[0.95] font-sans">{candidate.name}</h1>
            <p className="mt-4 text-sm text-[#6f8398] font-mono">{candidate.id}</p>
            <p className="mt-6 max-w-2xl text-[15px] leading-7 text-[#4f6780] font-sans">
              Retrouvez ici l'ensemble des tests qui vous ont été attribués. Chaque épreuve peut être lancée dès que vous êtes prêt, avec envoi automatique des résultats à la fin.
            </p>
          </section>

          <aside className="bg-white/22 backdrop-blur-[8px] px-6 py-7 shadow-[0_18px_45px_rgba(0,106,158,0.04)]">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#6f8398] font-sans">Vue d'ensemble</p>
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-4xl font-black text-[#17324d] leading-none font-sans">{assignedTests.length}</p>
                <p className="mt-1 text-sm text-[#4f6780] font-sans">test{hasMultipleTests ? 's' : ''} à réaliser</p>
              </div>
              <div className="h-px bg-[linear-gradient(90deg,rgba(95,120,145,0.05),rgba(95,120,145,0.22),rgba(95,120,145,0.05))]" />
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center bg-white/52 text-[#006a9e] shadow-[0_8px_18px_rgba(0,106,158,0.05)]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-black text-[#17324d] font-sans">Chronomètre immédiat</p>
                  <p className="mt-1 text-[13px] leading-6 text-[#5f7891] font-sans">Le temps démarre dès l'ouverture d'un test. Vérifiez vos disponibilités avant de lancer une session.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-8 bg-white/24 backdrop-blur-[8px] px-7 py-7 lg:px-8 lg:py-8 shadow-[0_18px_50px_rgba(23,50,77,0.04)]">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#6f8398] font-sans">Tests attribués</p>
              <h2 className="mt-3 text-2xl lg:text-3xl font-black text-[#17324d] font-sans">Choisissez votre prochain passage</h2>
            </div>
            <div className="bg-white/46 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#006a9e] font-sans shadow-[0_8px_18px_rgba(0,106,158,0.04)]">
              {assignedTests.length} module{hasMultipleTests ? 's' : ''} disponible{hasMultipleTests ? 's' : ''}
            </div>
          </div>

          {assignedTests.length === 0 ? (
            <div className="mt-8 bg-white/28 px-6 py-10 text-center shadow-[0_14px_30px_rgba(23,50,77,0.03)]">
              <p className="text-sm font-semibold text-[#4f6780] font-sans">Aucun test n'est attribué pour le moment.</p>
            </div>
          ) : (
            <div className={`mt-8 grid gap-5 ${assignedTests.length === 1 ? 'grid-cols-1 max-w-lg' : assignedTests.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
              {assignedTests.map((test, idx) => {
                const meta = TEST_META[test];
                return (
                  <button
                    key={`candidate-${test}`}
                    type="button"
                    onClick={() => onStartTest(test)}
                    className="group relative overflow-hidden bg-white/44 backdrop-blur-[6px] px-6 py-6 text-left transition-all duration-200 hover:-translate-y-1 hover:bg-white/62 hover:shadow-[0_16px_34px_rgba(23,50,77,0.06)] shadow-[0_8px_18px_rgba(23,50,77,0.03)]"
                  >
                    <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: meta.color }} />
                    <div className="flex items-start justify-between gap-4">
                      <span className="inline-flex h-8 min-w-8 items-center justify-center bg-[#eef5fb]/85 px-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#6f8398] font-sans">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-white/52 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#4f6780] font-sans shadow-[0_6px_18px_rgba(23,50,77,0.03)]">
                        <Clock className="w-3 h-3" />{meta.duration}
                      </span>
                    </div>

                    <h2 className="mt-6 text-2xl font-black text-[#17324d] leading-none font-sans">{meta.label}</h2>
                    <p className="mt-2 text-sm text-[#5f7891] font-sans">{meta.sub}</p>
                    <p className="mt-5 text-[13px] leading-6 text-[#6f8398] font-sans">{meta.hint}</p>

                    <div className="mt-8 flex items-center justify-between gap-4">
                      <p className="text-[11px] font-semibold text-[#4f6780] font-sans">Accès immédiat dès validation</p>
                      <span
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white font-sans transition-transform group-hover:translate-x-0.5"
                        style={{ background: meta.color }}
                      >
                        Démarrer<ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <div className="mt-6 bg-white/18 backdrop-blur-[6px] px-6 py-5 text-[13px] leading-6 text-[#5f7891] font-sans shadow-[0_10px_24px_rgba(23,50,77,0.03)]">
          Une fois un test démarré, le chronomètre se lance immédiatement. Vos résultats sont transmis automatiquement à votre évaluateur à la fin du temps imparti.
        </div>
      </div>
    </div>
  );
}

// Candidate test
function CandidateTestView({ candidate, challengeType, onBackToSpace, onFinished }: { candidate: CandidateSession; challengeType: ChallengeType; onBackToSpace: () => void; onFinished: () => void }) {
  const isEnglishTest = challengeType === 'english';
  const isMcqTest = challengeType === 'qcm' || isEnglishTest;
  const testDuration = isMcqTest ? QCM_DURATION_SEC : CHALLENGE_DURATION_SEC;
  const [selectedId, setSelectedId] = useState(1);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [remaining, setRemaining] = useState(testDuration);
  const [submitted, setSubmitted] = useState(false);
  const [tutorialAccepted, setTutorialAccepted] = useState(false);

  // ─── Chargement IA des questions depuis la banque Supabase ────────────────
  const [aiQcmPool, setAiQcmPool] = useState<QcmExercise[] | null>(null);

  useEffect(() => {
    // Charger depuis la banque pour les types QCM (qcm, english, et enrichissement sql/python côté pool)
    if (!['qcm', 'english', 'sql', 'python'].includes(challengeType)) return;
    const type = challengeType;
    const count = 16;
    fetch('/api/challenge-questions/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, count }),
    })
      .then(r => r.ok ? r.json() : null)
      .then((data: any) => {
        if (data?.success && Array.isArray(data.questions) && data.questions.length >= 4) {
          // Renuméroter proprement et mapper vers QcmExercise
          const mapped: QcmExercise[] = data.questions.map((q: any, i: number) => ({
            id: i + 1,
            title: q.title ?? `Question ${i + 1}`,
            difficulty: q.difficulty ?? 'débutant',
            category: q.category ?? type,
            problem: q.problem ?? '',
            options: Array.isArray(q.options) ? q.options.slice(0, 4) : [],
            correctOption: Number.isInteger(q.correctOption) ? q.correctOption : 0,
            explanation: q.explanation ?? '',
          }));
          setAiQcmPool(mapped);
        }
      })
      .catch(() => { /* fallback silencieux sur les hardcodés */ });
  }, [challengeType]);

  // Pour QCM et English, utiliser les questions IA quand disponibles (sinon hardcodées)
  const exercises = challengeType === 'python'
    ? PYTHON_EXERCISES
    : challengeType === 'qcm'
      ? (aiQcmPool ?? QCM_EXERCISES)
      : challengeType === 'english'
        ? (aiQcmPool ?? ENGLISH_EXERCISES)
      : EXERCISES;
  const totalExercises = exercises.length;

  // Per-exercise tracking
  const exerciseStartRef = useRef<Record<number, number>>({}); // exerciseId → start timestamp
  const attemptsRef = useRef<Record<number, number>>({}); // exerciseId → attempt count
  const exerciseTimeRef = useRef<Record<number, number>>({}); // exerciseId → accumulated seconds
  const testStartRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submitCalledRef = useRef(false);

  // Track exercise switch
  useEffect(() => {
    const now = Date.now();
    // Close previous exercise time
    if (exerciseStartRef.current[selectedId] === undefined) {
      exerciseStartRef.current[selectedId] = now;
    }
    return () => {
      const elapsed = Math.floor((Date.now() - (exerciseStartRef.current[selectedId] ?? now)) / 1000);
      exerciseTimeRef.current[selectedId] = (exerciseTimeRef.current[selectedId] ?? 0) + elapsed;
      exerciseStartRef.current[selectedId] = Date.now(); // reset for next visit
    };
  }, [selectedId]);

  const submitResults = useCallback(async (earlyQuit: boolean) => {
    if (submitCalledRef.current) return;
    submitCalledRef.current = true;

    // Close current exercise time
    const now = Date.now();
    const elapsed = Math.floor((now - (exerciseStartRef.current[selectedId] ?? now)) / 1000);
    exerciseTimeRef.current[selectedId] = (exerciseTimeRef.current[selectedId] ?? 0) + elapsed;

    const totalTimeSeconds = testStartRef.current
      ? Math.floor((now - testStartRef.current) / 1000)
      : 0;
    const exercisesDetail: ExerciseDetail[] = exercises.map(ex => ({
      exerciseId: ex.id,
      title: ex.title,
      completed: completed.has(ex.id),
      attempts: attemptsRef.current[ex.id] ?? 0,
      timeSeconds: exerciseTimeRef.current[ex.id] ?? 0,
    }));

    try {
      await apiRequest('/api/evaluation/results', {
        method: 'POST',
        body: JSON.stringify({
          candidateId: candidate.id,
          candidateName: candidate.name,
          recruiterId: candidate.recruiterId,
          challengeType,
          score: completed.size,
          totalExercises: totalExercises,
          timeSeconds: totalTimeSeconds,
          exercisesDetail,
          earlyQuit,
        }),
      });
    } catch (e) { console.error('Submit error:', e); }

    setSubmitted(true);
    onFinished();
  }, [candidate, completed, selectedId, onFinished]);

  // Timer
  useEffect(() => {
    if (!tutorialAccepted) return;
    if (!testStartRef.current) {
      testStartRef.current = Date.now();
    }
    timerRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          submitResults(false); // time's up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [submitResults, tutorialAccepted]);

  const handleValidated = () => {
    setCompleted(prev => new Set([...prev, selectedId]));
  };

  const handleAttempt = () => {
    attemptsRef.current[selectedId] = (attemptsRef.current[selectedId] ?? 0) + 1;
  };

  // MCQ tests only (QCM technique + Anglais): called after each answer to advance or auto-submit
  const handleQcmNext = useCallback(() => {
    const answeredCount = attemptsRef.current;
    // Find next unanswered exercise in order
    const nextEx = exercises.find(
      ex => ex.id > selectedId && !Object.prototype.hasOwnProperty.call(answeredCount, ex.id)
    ) ?? exercises.find(
      ex => !Object.prototype.hasOwnProperty.call(answeredCount, ex.id)
    );
    if (nextEx) {
      setSelectedId(nextEx.id);
    } else {
      // All answered - submit automatically
      void submitResults(false);
    }
  }, [exercises, selectedId, submitResults]);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <div className="text-center space-y-2">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-xl font-bold text-[#17324d] font-sans">{isEnglishTest ? 'Assessment completed' : 'Test terminé'}</h2>
          <p className="text-[#5c7289] font-sans text-sm">{isEnglishTest ? 'Your results have been sent to the evaluator.' : 'Vos résultats ont été envoyés à votre évaluateur.'}</p>
        </div>
        <Card className="px-6 py-4 flex gap-8 bg-[#f7fbff] border border-[#dbe7f4] rounded-2xl">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 flex items-center gap-1"><Trophy className="w-5 h-5" />{completed.size}/{totalExercises}</div>
            <p className="text-xs text-[#5c7289] font-sans">{isEnglishTest ? 'completed questions' : 'exercices validés'}</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#4db8ff]">{Math.round((completed.size / totalExercises) * 100)}%</div>
            <p className="text-xs text-[#5c7289] font-sans">score</p>
          </div>
        </Card>
        <button type="button" onClick={onFinished} className="text-xs text-[#5c7289] hover:text-[#17324d] font-sans">
          {isEnglishTest ? '← Back to assessment space' : '← Retour à l\'espace évaluation'}
        </button>
      </div>
    );
  }

  const exercise = exercises.find(e => e.id === selectedId)!;
  const isEmailFill = isEnglishTest && 'type' in exercise && exercise.type === 'email_fill';

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="shrink-0 bg-[#f3f8ff] border-b border-[#d7e2ef] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-[#0077b6]" />
          <span className="font-bold text-[#17324d] text-sm font-sans">{isEnglishTest ? 'English Assessment' : 'Mode Évaluation'}</span>
          <span className="text-[10px] font-semibold text-[#38506a] bg-white border border-[#dbe7f4] px-2 py-0.5 rounded font-sans">{isEnglishTest ? 'English' : getChallengeTypeLabel(challengeType)}</span>
          <span className="text-xs text-[#38506a] font-medium font-sans">· {candidate.name}</span>
          <button
            type="button"
            onClick={onBackToSpace}
            className="ml-2 text-[11px] text-[#5c7289] hover:text-[#17324d] font-semibold font-sans"
          >
            {isEnglishTest ? 'Change test' : 'Changer de test'}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Timer remaining={remaining} total={testDuration} />

          <div className="flex items-center gap-2 bg-white border border-[#dbe7f4] rounded-lg px-3 py-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-sm font-bold text-[#17324d]">{completed.size}</span>
            <span className="text-[#38506a] text-sm font-medium">/ {totalExercises}</span>
          </div>

          <button
            type="button"
            onClick={() => { if (confirm(isEnglishTest ? 'End the assessment now? Your results will be sent immediately.' : 'Terminer le test maintenant ? Vos résultats seront envoyés immédiatement.')) submitResults(true); }}
            disabled={!tutorialAccepted}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold font-sans transition-colors"
          >
            <TimerReset className="w-3.5 h-3.5" />
            {isEnglishTest ? 'End now' : 'Terminer'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Exercise list */}
        <aside className="w-48 shrink-0 bg-[#f8fbff] border-r border-[#d7e2ef] overflow-y-auto">
          <div className="px-2 py-3">
            {DIFFICULTY_ORDER.map((d) => {
              const exs = exercises.filter(e => e.difficulty === d);
              const meta = getDifficultyMeta(d, isEnglishTest);
              return (
                <div key={d} className="mb-4">
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-1 mb-1.5 ${meta.color} font-sans`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                    <span className="text-[#38506a] font-semibold ml-auto">{exs.filter(e => completed.has(e.id)).length}/{exs.length}</span>
                  </div>
                  <div className="space-y-0.5">
                    {exs.map(ex => {
                      const isSelected = ex.id === selectedId;
                      const isDone = completed.has(ex.id);
                      return (
                        <button
                          key={ex.id}
                          type="button"
                          disabled={isMcqTest && Object.prototype.hasOwnProperty.call(attemptsRef.current, ex.id)}
                          onClick={() => setSelectedId(ex.id)}
                          className={`w-full text-left px-2 py-1.5 rounded text-xs transition-all flex items-center gap-2 font-sans disabled:cursor-not-allowed disabled:opacity-60 ${
                            isSelected
                              ? 'bg-[#e8f3ff] border border-[#bcd8ee] text-[#17324d]'
                              : 'hover:bg-[#eef6ff] text-[#38506a] border border-transparent hover:text-[#17324d]'
                          }`}
                        >
                          <span className={`shrink-0 w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold ${isDone ? 'bg-emerald-700 text-white' : isSelected ? 'bg-[#bfd8eb] text-[#17324d]' : 'bg-[#edf4fb] text-[#38506a]'}`}>
                            {isDone ? '✓' : ex.id}
                          </span>
                          <span className="truncate leading-tight">{ex.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Schema */}
        <aside className="w-52 shrink-0 bg-[#f8fbff] border-r border-[#d7e2ef] overflow-hidden flex flex-col">
          {challengeType === 'sql' ? (
            <SchemaPanel compact />
          ) : challengeType === 'python' ? (
            <PythonInfoPanel exercise={exercise as PythonExercise} />
          ) : isEmailFill ? (
            <EmailInfoPanel exercise={exercise as EmailFillBlankExercise} />
          ) : (
            <QcmInfoPanel
              exercise={exercise as QcmExercise}
              title={challengeType === 'english' ? 'English Assessment' : 'QCM technique'}
              englishUi={isEnglishTest}
            />
          )}
        </aside>

        {/* Workspace */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="shrink-0 flex items-center gap-2 px-4 py-1.5 bg-[#f3f8ff] border-b border-[#d7e2ef] font-sans text-xs">
            <span className="text-[#38506a] font-medium">#{exercise.id}</span>
            <span className="text-[#17324d] font-semibold">{exercise.title}</span>
            {completed.has(exercise.id) && (
              <span className="ml-auto flex items-center gap-1 text-emerald-700 font-bold"><CheckCircle className="w-3 h-3" />{isEnglishTest ? 'Submitted' : 'Validé'}</span>
            )}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={`${challengeType}-${exercise.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} className="flex-1 overflow-hidden flex flex-col">
              {challengeType === 'sql' ? (
                <SqlWorkspace
                  exercise={exercise as SqlExercise}
                  onValidated={handleValidated}
                  attempts={attemptsRef.current[selectedId] ?? 0}
                  onAttempt={handleAttempt}
                />
              ) : challengeType === 'python' ? (
                <PythonWorkspace
                  exercise={exercise as PythonExercise}
                  onValidated={handleValidated}
                  attempts={attemptsRef.current[selectedId] ?? 0}
                  onAttempt={handleAttempt}
                />
              ) : isEmailFill ? (
                <EmailFillWorkspace
                  exercise={exercise as EmailFillBlankExercise}
                  onValidated={handleValidated}
                  onAttempt={handleAttempt}
                  onNext={handleQcmNext}
                />
              ) : (
                <QcmWorkspace
                  exercise={exercise as QcmExercise}
                  onValidated={handleValidated}
                  onAttempt={handleAttempt}
                  onNext={handleQcmNext}
                  englishUi={isEnglishTest}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {!tutorialAccepted && (
        <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center px-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#dbe7f4] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#0077b6]" />
              <h3 className="text-lg font-bold text-[#17324d] font-sans">{isEnglishTest ? 'English Assessment Briefing (required)' : `Tutoriel ${getChallengeTypeLabel(challengeType)} (obligatoire)`}</h3>
            </div>

            <div className="text-sm text-[#38506a] font-sans space-y-2">
              {challengeType === 'sql' ? (
                <p><strong>Bienvenue sur ce test SQL organisé par mc2i.</strong> Vous allez passer un test SQL chronométré de 30 minutes sur la base <strong>fyne_soc_db</strong>.</p>
              ) : challengeType === 'python' ? (
                <p><strong>Bienvenue sur ce test Python organisé par mc2i.</strong> Vous allez traiter des use cases métier multi-domaines (produit, ops, finance, growth, trust & safety) dans un format inspiré des parcours FAANG.</p>
              ) : challengeType === 'english' ? (
                <p><strong>Welcome to the English assessment organized by mc2i.</strong> You will answer scenario-based questions to evaluate your professional English in meetings, emails, escalation, and stakeholder communication.</p>
              ) : (
                <p><strong>Bienvenue sur ce QCM technique organisé par mc2i.</strong> Vous allez répondre à des questions techniques progressives pour évaluer vos fondamentaux et votre capacité de raisonnement.</p>
              )}
              <ul className="list-disc pl-5 space-y-1">
                {isEnglishTest ? (
                  <>
                    <li>Goal: answer each scenario with the most professional and appropriate response.</li>
                    <li>Each answer is recorded immediately after selection.</li>
                    <li>You move forward one question at a time and cannot reopen submitted questions.</li>
                    <li>When the assessment ends, your results are sent automatically to the recruiter.</li>
                  </>
                ) : (
                  <>
                    <li>Objectif : compléter les exercices attribués dans le temps imparti.</li>
                    <li>Validation : chaque réponse est enregistrée.</li>
                    <li>Navigation : SQL/Python libre ; QCM/Anglais en progression question par question.</li>
                    <li>Une fois terminé (ou temps écoulé), vos résultats sont envoyés à votre évaluateur.</li>
                  </>
                )}
              </ul>

              <div className="mt-3 rounded-xl border border-[#dbe7f4] bg-[#f7fbff] p-3 space-y-2">
                <p className="text-xs font-semibold text-[#17324d]">{isEnglishTest ? 'Example question (with answer)' : 'Exemple attendu (avec correction)'}</p>
                {challengeType === 'sql' ? (
                  <>
                    <p className="text-xs text-[#5c7289]">Consigne : afficher les 5 IP avec le plus d'échecs de connexion.</p>
                    <pre className="text-[11px] leading-5 text-[#17324d] bg-white border border-[#e4edf7] rounded-lg p-2 overflow-x-auto"><code>{`SELECT src_ip, COUNT(*) AS nb_echecs
FROM auth_logs
WHERE status = 'FAILED'
GROUP BY src_ip
ORDER BY nb_echecs DESC
LIMIT 5;`}</code></pre>
                    <p className="text-[11px] text-[#5c7289]">Pourquoi c'est correct : filtre des échecs, agrégation par IP, tri décroissant, puis limitation à 5 lignes.</p>
                  </>
                ) : challengeType === 'python' ? (
                  <>
                    <p className="text-xs text-[#5c7289]">Consigne : calculer le revenu total des campagnes performance pour le daily business review.</p>
                    <pre className="text-[11px] leading-5 text-[#17324d] bg-white border border-[#e4edf7] rounded-lg p-2 overflow-x-auto"><code>{`total_revenue = 0
for campaign in campaigns:
    if campaign["objective"] == "performance":
        total_revenue += campaign["revenue"]

print(total_revenue)`}</code></pre>
                    <p className="text-[11px] text-[#5c7289]">Pourquoi c'est correct : on filtre les campagnes cibles, on agrège le KPI demandé, puis on affiche une sortie directement exploitable par le PM.</p>
                  </>
                ) : challengeType === 'english' ? (
                  <>
                    <p className="text-xs text-[#5c7289]">Scenario: complete a professional client email with the best missing word or phrase.</p>
                    <pre className="text-[11px] leading-5 text-[#17324d] bg-white border border-[#e4edf7] rounded-lg p-2 overflow-x-auto"><code>{`Question:
Complete this sentence:

"We [____] for the delay and will share an updated delivery plan by 4 PM today."

A. excuse
B. apologize
C. forgive
D. regreting`}</code></pre>
                    <p className="text-[11px] text-[#5c7289]">Best answer: <strong>B</strong>, because "We apologize for the delay" is grammatically correct and professionally appropriate.</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-[#5c7289]">Consigne : choisir la pratique la plus sûre contre l'injection SQL.</p>
                    <pre className="text-[11px] leading-5 text-[#17324d] bg-white border border-[#e4edf7] rounded-lg p-2 overflow-x-auto"><code>{`Question:
Quelle mesure réduit le plus le risque d'injection SQL ?

A. Concaténer les chaînes SQL
B. Requêtes paramétrées
C. Désactiver les erreurs SQL
D. Ajouter plus de logs`}</code></pre>
                    <p className="text-[11px] text-[#5c7289]">Bonne réponse : <strong>B</strong>, car les requêtes paramétrées séparent les données de la logique SQL.</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Btn
                onClick={() => {
                  testStartRef.current = Date.now();
                  setTutorialAccepted(true);
                }}
                className="justify-center"
              >
                J'ai compris, commencer le test
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Done screen (after submit)
function DoneView({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <CheckCircle className="w-12 h-12 text-emerald-400" />
      <div className="text-center">
        <h2 className="text-xl font-bold text-[#17324d] font-sans mb-1">Résultats envoyés</h2>
        <p className="text-[#5c7289] text-sm font-sans">Votre évaluateur a reçu vos résultats et le détail de vos réponses.</p>
      </div>
      <button type="button" onClick={onBack} className="inline-flex items-center justify-center rounded-lg border border-[#d7e2ef] bg-white px-3 py-1.5 text-xs font-semibold text-[#4f6780] hover:text-[#17324d] hover:border-[#9ec5df] hover:bg-[#f7fbff] font-sans transition-colors">← Retour au choix du mode</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Root - state machine
// ─────────────────────────────────────────────────────────────

export default function CodeChallengePage() {
  const [view, setView] = useState<AppView>('entry-choice');
  const [recruiter, setRecruiter] = useState<RecruiterSession | null>(null);
  const [candidate, setCandidate] = useState<CandidateSession | null>(null);
  const [activeChallengeType, setActiveChallengeType] = useState<ChallengeType>('sql');

  const resetToEntryChoice = () => {
    window.history.replaceState({}, '', window.location.pathname);
    setRecruiter(null);
    setCandidate(null);
    setActiveChallengeType('sql');
    setView('entry-choice');
  };

  // Restore sessions on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const entry = params.get('entry');
    const prefilledCandidateId = params.get('candidateId');

    const rec = loadRecruiter();
    const cand = loadCandidate();

    if (rec) {
      setRecruiter(rec);
      setView('recruiter-dashboard');
      return;
    }

    if (cand) {
      setCandidate(cand);
      setActiveChallengeType(getAssignedTests(cand.assignedTests, cand.challengeType || 'sql')[0]);
      setView('candidate-space');
      return;
    }

    if (entry === 'recruiter') {
      setView('recruiter-entry');
      return;
    }

    if (entry === 'candidate' || prefilledCandidateId) {
      setView('candidate-login');
      return;
    }

    setView('entry-choice');
  }, []);

  const logoutRecruiter = () => {
    clearRecruiter();
    resetToEntryChoice();
  };
  const logoutCandidate = () => {
    clearCandidate();
    resetToEntryChoice();
  };

  return (
    <div className="min-h-screen bg-white text-[#17324d]" style={{ backgroundColor: '#ffffff' }}>
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="min-h-screen bg-white" style={{ backgroundColor: '#ffffff' }}>
          {view === 'entry-choice' && (
            <EntryChoiceView
              onRecruiter={() => setView('recruiter-entry')}
              onCandidate={() => setView('candidate-login')}
            />
          )}

          {view === 'recruiter-entry' && (
            <RecruiterEntryView
              onEnter={(r) => { setRecruiter(r); setView('recruiter-dashboard'); }}
              onBack={() => setView('entry-choice')}
            />
          )}

          {view === 'recruiter-dashboard' && recruiter && (
            <RecruiterDashboard recruiter={recruiter} onLogout={logoutRecruiter} />
          )}

          {view === 'candidate-login' && (
            <CandidateLoginView
              onLogin={(c) => {
                setCandidate(c);
                setActiveChallengeType(getAssignedTests(c.assignedTests, c.challengeType || 'sql')[0]);
                setView('candidate-space');
              }}
              onBack={() => setView('entry-choice')}
            />
          )}

          {view === 'candidate-space' && candidate && (
            <CandidateSpaceView
              candidate={candidate}
              onStartTest={(challengeType) => {
                setActiveChallengeType(challengeType);
                setView('candidate-test');
              }}
              onLogout={logoutCandidate}
            />
          )}

          {view === 'candidate-test' && candidate && (
            <CandidateTestView
              candidate={candidate}
              challengeType={activeChallengeType}
              onBackToSpace={() => setView('candidate-space')}
              onFinished={() => {
                // Retirer le test terminé de la session locale
                const remaining = getAssignedTests(candidate.assignedTests, candidate.challengeType || 'sql')
                  .filter(t => t !== activeChallengeType);
                if (remaining.length === 0) {
                  // Plus aucun test disponible → déconnexion
                  logoutCandidate();
                } else {
                  const updated: CandidateSession = { ...candidate, assignedTests: remaining };
                  setCandidate(updated);
                  saveCandidate(updated);
                  setView('candidate-space');
                }
              }}
            />
          )}

          {view === 'candidate-done' && (
            <DoneView onBack={logoutCandidate} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
