import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, Send, Play, Database, ChevronRight, Trophy, CheckCircle2, BookOpen, Zap, GitBranch, Code2, ChevronLeft } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

type Stage = 'name' | 'intro' | 'quiz' | 'results' | 'scenario' | 'summary';
type DifficultyLevel = 'debutant' | 'intermediaire' | 'avance' | 'expert';

type SqlQuestion = {
  id: string;
  question: string;
  options: string[];
};

type QuizCorrection = {
  id: string;
  question: string;
  options: string[];
  userIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
};

type SqlScenario = {
  title: string;
  context: string;
  goal: string;
  hint: string;
  successCriteria: string[];
};

type SandboxResponse = {
  success: boolean;
  columns?: string[];
  rows?: Array<Record<string, unknown>>;
  rowCount?: number;
  message?: string;
  durationMs?: number;
};

type MissionHint = {
  id: string;
  command: string;
  purpose: string;
};

const SANDBOX_TABLES = [
  { name: 'users', columns: ['id', 'username', 'email', 'role', 'is_active'] },
  { name: 'sessions', columns: ['id', 'user_id', 'started_at', 'device', 'country', 'status'] },
  { name: 'orders', columns: ['id', 'user_id', 'amount', 'status', 'created_at'] },
  { name: 'products', columns: ['id', 'product_name', 'category', 'stock_quantity', 'unit_price', 'is_active'] },
  { name: 'failed_logins', columns: ['id', 'user_id', 'ip', 'attempted_at'] },
];

const TABLE_META: Record<string, { label: string; desc: string; columns: Record<string, string> }> = {
  users: {
    label: 'Utilisateurs',
    desc: 'Tous les comptes enregistrés sur la plateforme',
    columns: {
      id: 'Identifiant unique',
      username: 'Nom d\'utilisateur',
      email: 'Adresse email',
      role: 'Rôle du compte (admin, user…)',
      is_active: 'Compte actif ? (true / false)',
    },
  },
  sessions: {
    label: 'Sessions de connexion',
    desc: 'Chaque ouverture de session par un utilisateur',
    columns: {
      id: 'Identifiant de session',
      user_id: '→ users.id (qui s\'est connecté)',
      started_at: 'Date et heure de connexion',
      device: 'Appareil utilisé (mobile, desktop…)',
      country: 'Pays de la connexion',
      status: 'État (active, closed…)',
    },
  },
  orders: {
    label: 'Commandes',
    desc: 'Achats passés par les utilisateurs',
    columns: {
      id: 'Identifiant de commande',
      user_id: '→ users.id (qui a commandé)',
      amount: 'Montant en euros',
      status: 'État (pending, paid, cancelled…)',
      created_at: 'Date de la commande',
    },
  },
  products: {
    label: 'Produits',
    desc: 'Catalogue des articles disponibles à la vente',
    columns: {
      id: 'Identifiant produit',
      product_name: 'Nom du produit',
      category: 'Catégorie (électronique, vêtements…)',
      stock_quantity: 'Quantité disponible en stock',
      unit_price: 'Prix unitaire en euros',
      is_active: 'Produit en vente ? (true / false)',
    },
  },
  failed_logins: {
    label: 'Tentatives de connexion échouées',
    desc: 'Connexions ratées (mauvais mdp, compte bloqué…)',
    columns: {
      id: 'Identifiant de l\'événement',
      user_id: '→ users.id (qui a tenté)',
      ip: 'Adresse IP de la tentative',
      attempted_at: 'Horodatage de la tentative',
    },
  },
};

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  const inlineFormat = (line: string): React.ReactNode => {
    // Split on **bold** and `code` patterns
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-[#061019]">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="font-mono text-[11px] bg-[#006a9e]/10 text-[#006a9e] px-1 py-0.5 rounded">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // H3-style: **Title** alone on a line
    if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
      elements.push(
        <p key={key++} className="font-semibold text-[#006a9e] mt-3 mb-1 text-sm">
          {line.trim().slice(2, -2)}
        </p>
      );
    // Numbered list
    } else if (/^\d+\.\s/.test(line)) {
      const content = line.replace(/^\d+\.\s/, '');
      elements.push(
        <div key={key++} className="flex gap-2 items-baseline ml-1">
          <span className="text-[#006a9e] font-bold text-xs shrink-0">{line.match(/^\d+/)![0]}.</span>
          <span className="text-sm text-gray-700">{inlineFormat(content)}</span>
        </div>
      );
    // Masked code block
    } else if (line.includes('[requete complete masquee')) {
      elements.push(
        <div key={key++} className="mt-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 italic">
          {line}
        </div>
      );
    // Empty line — spacing
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-1" />);
    // Normal line
    } else {
      elements.push(
        <p key={key++} className="text-sm text-gray-700 leading-relaxed">
          {inlineFormat(line)}
        </p>
      );
    }
  }
  return <div className="space-y-0.5">{elements}</div>;
}

function inferRelevantTables(scenario: SqlScenario | null): string[] {
  const text = `${scenario?.title || ''} ${scenario?.context || ''} ${scenario?.goal || ''} ${scenario?.hint || ''}`.toLowerCase();
  const tables: string[] = [];

  if (/commande|orders|achat|vente|panier/.test(text)) tables.push('orders');
  if (/utilisateur|user|compte|client/.test(text)) tables.push('users');
  if (/session|connexion|device|country/.test(text)) tables.push('sessions');
  if (/produit|stock|inventory|catalogue/.test(text)) tables.push('products');
  if (/failed|echec|attaque|\bip\b|suspicious|suspic/.test(text)) tables.push('failed_logins');

  return tables.length > 0 ? Array.from(new Set(tables)) : ['orders', 'users'];
}

function inferPrimaryTable(scenario: SqlScenario | null, relevantTables: string[]): string {
  const text = `${scenario?.title || ''} ${scenario?.context || ''} ${scenario?.goal || ''} ${scenario?.hint || ''}`.toLowerCase();
  if (/commande|orders|achat|vente|panier|nombre total de commandes/.test(text)) return 'orders';
  if (/produit|stock|inventory|catalogue/.test(text)) return 'products';
  if (/session|connexion|device|country/.test(text)) return 'sessions';
  if (/failed|echec|attaque|\bip\b|suspicious|suspic/.test(text)) return 'failed_logins';
  if (/utilisateur|user|compte|client|paris|ville/.test(text)) return 'users';
  return relevantTables[0] || 'users';
}

function buildStarterQuery(primaryTable: string, missionHints: MissionHint[]): string {
  const needsCount = missionHints.some((h) => h.command === 'COUNT(*)');
  const needsWhere = missionHints.some((h) => h.command === 'WHERE');

  if (needsCount && needsWhere) {
    return `-- Table recommandee: ${primaryTable}\nSELECT COUNT(*) AS <alias_total>\nFROM <table_principale>\nWHERE <condition_metier>;`;
  }
  if (needsCount) {
    return `-- Table recommandee: ${primaryTable}\nSELECT COUNT(*) AS <alias_total>\nFROM <table_principale>;`;
  }
  if (needsWhere) {
    return `-- Table recommandee: ${primaryTable}\nSELECT <colonnes_utiles>\nFROM <table_principale>\nWHERE <condition_metier>;`;
  }
  return `-- Table recommandee: ${primaryTable}\nSELECT <colonnes_utiles>\nFROM <table_principale>;`;
}

function sanitizeAssistantCoaching(raw: string): string {
  if (!raw) return raw;
  let text = String(raw);

  // Retire les blocs SQL complets pour garder un mode coaching.
  text = text.replace(/```[\s\S]*?```/g, '[requete complete masquee pour te laisser la construire]');
  text = text.replace(/(^|\n)\s*SELECT\s+[\s\S]*?;(?=\n|$)/gi, '\n[requete complete masquee pour te laisser la construire]');

  return text;
}

function buildMissionHintsFromScenario(scenario: SqlScenario | null): MissionHint[] {
  const text = `${scenario?.title || ''} ${scenario?.context || ''} ${scenario?.goal || ''} ${scenario?.hint || ''}`.toLowerCase();
  const hints: MissionHint[] = [
    { id: 'h_select', command: 'SELECT', purpose: 'Choisit les colonnes ou mesures à afficher dans le résultat.' },
    { id: 'h_from', command: 'FROM', purpose: 'Cible la table principale liée à la mission.' },
  ];

  if (/nombre|combien|total|count/.test(text)) {
    hints.push({ id: 'h_count', command: 'COUNT(*)', purpose: 'Compte le nombre total de lignes qui répondent à ton besoin.' });
  }
  if (/filtre|inferieur|superieur|actif|etat|status|critique|stock|where/.test(text)) {
    hints.push({ id: 'h_where', command: 'WHERE', purpose: 'Filtre les enregistrements selon une condition métier.' });
  }
  if (/par |chaque|categorie|role|groupe|group by/.test(text)) {
    hints.push({ id: 'h_group', command: 'GROUP BY', purpose: 'Regroupe les données pour obtenir une synthèse par catégorie.' });
  }
  if (/top|priori|ordre|recent|ancien|classe|tri/.test(text)) {
    hints.push({ id: 'h_order', command: 'ORDER BY', purpose: 'Trie les résultats pour mettre en avant les cas importants.' });
  }
  if (/lier|relation|join|utilisateur.*commande|commande.*utilisateur/.test(text)) {
    hints.push({ id: 'h_join', command: 'JOIN', purpose: "Relie plusieurs tables pour enrichir l'analyse." });
  }

  return hints.slice(0, 4);
}

function evaluateMissionProgress(
  query: string,
  result: SandboxResponse,
  missionHints: MissionHint[],
  relevantTables: string[]
): 'success' | 'close' | 'far' {
  if (!result.success) return 'far';

  const q = query.toLowerCase().replace(/\s+/g, ' ');

  const needsJoin = missionHints.some((h) => h.command === 'JOIN');
  const hasJoin = q.includes(' join ');

  // Porte dure 1 : si le scénario exige un JOIN, la requête doit en avoir un
  if (needsJoin && !hasJoin) return 'close';

  // Porte dure 2 : si plusieurs tables sont pertinentes, au moins 2 doivent être utilisées
  const tablesUsed = relevantTables.filter(
    (t) => q.includes(` ${t} `) || q.includes(`${t}.`) || q.includes(`from ${t}`) || q.includes(`join ${t}`)
  );
  if (relevantTables.length >= 2 && tablesUsed.length < 2) return 'close';

  // Score cumulatif
  let score = 0;
  if (q.includes('select')) score += 1;
  if (q.includes('from')) score += 1;
  if (missionHints.some((h) => h.command.toLowerCase().includes('count') && q.includes('count('))) score += 1;
  if (missionHints.some((h) => h.command === 'WHERE') && q.includes('where')) score += 1;
  if (missionHints.some((h) => h.command === 'GROUP BY') && q.includes('group by')) score += 1;
  if (missionHints.some((h) => h.command === 'ORDER BY') && q.includes('order by')) score += 1;
  if (needsJoin && hasJoin) score += 1;
  score += tablesUsed.length; // bonus par table utilisée

  if (score >= 4) return 'success';
  if (score >= 2) return 'close';
  return 'far';
}

function buildCorrectionExample(correction: QuizCorrection): string {
  const correct = (correction.options[correction.correctIndex] || '').toUpperCase();

  if (correct.includes('SELECT')) {
    return 'SELECT product_name, stock_quantity FROM products;';
  }
  if (correct.includes('WHERE')) {
    return 'SELECT product_name, stock_quantity FROM products WHERE stock_quantity < 10;';
  }
  if (correct.includes('INSERT INTO')) {
    return "INSERT INTO products (id, product_name, category, stock_quantity, unit_price, is_active) VALUES (999, 'Produit Test', 'Divers', 12, 49.90, true);";
  }
  if (correct.includes('UPDATE')) {
    return "UPDATE products SET stock_quantity = 8 WHERE product_name = 'Clavier Mecanique K2';";
  }
  if (correct.includes('DELETE FROM')) {
    return "DELETE FROM products WHERE id = 999;";
  }
  if (correct.includes('CREATE TABLE')) {
    return 'CREATE TABLE suppliers (id INT PRIMARY KEY, name TEXT NOT NULL);';
  }
  if (correct.includes('JOIN')) {
    return 'SELECT u.username, o.amount FROM users u JOIN orders o ON o.user_id = u.id;';
  }

  return 'SELECT product_name, stock_quantity FROM products ORDER BY stock_quantity ASC;';
}

// ─── Frise SQL — données pédagogiques ─────────────────────────────────────────

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
    | { kind: 'code'; heading: string; lines: Array<{ sql: string; comment: string }> }
  >;
};

const SQL_INTRO_STEPS: IntroStep[] = [
  {
    badge: 'Origine',
    title: 'SQL — Le langage universel des données',
    tagline: 'Inventé en 1974. Compris par toutes les bases de données du monde.',
    fact: '90%+ des applications stockent leurs données en SQL',
    color: 'text-[#006a9e]',
    accentBg: 'bg-[#006a9e]/5 border-[#006a9e]/20',
    Icon: BookOpen,
    blocks: [
      {
        kind: 'text',
        heading: "Qu'est-ce que SQL ?",
        body: "SQL (Structured Query Language) est le langage standard pour interroger et manipuler des bases de données relationnelles. Créé en 1974 chez IBM par Donald Chamberlin et Raymond Boyce, normalisé ISO depuis 1987. Il est enseigné dans 95% des cursus data et dev dans le monde.",
      },
      {
        kind: 'text',
        heading: 'Un langage déclaratif — pas procédural',
        body: "SQL est unique : vous décrivez CE QUE vous voulez obtenir, pas COMMENT le calculer. C'est comme passer une commande au restaurant — vous dites ce que vous voulez, le SGBD fait le reste. Pas besoin d'écrire des boucles ou des algorithmes.",
      },
      {
        kind: 'list',
        heading: 'Les 3 familles de commandes',
        items: [
          'DDL — CREATE, ALTER, DROP : créer et modifier la structure des tables',
          'DML — SELECT, INSERT, UPDATE, DELETE : lire et modifier les données',
          'DCL — GRANT, REVOKE : gérer les permissions d\'accès',
        ],
      },
    ],
  },
  {
    badge: 'Fondations',
    title: 'SGBD — Le moteur derrière SQL',
    tagline: "Sans SGBD, SQL ne sert à rien. Comprendre la différence est essentiel.",
    fact: 'Un SGBD peut gérer des milliards de lignes avec des requêtes en millisecondes',
    color: 'text-[#dd0061]',
    accentBg: 'bg-[#dd0061]/5 border-[#dd0061]/20',
    Icon: Database,
    blocks: [
      {
        kind: 'text',
        heading: "SGBD = Système de Gestion de Bases de Données",
        body: "Le SGBD est le logiciel qui stocke, organise, sécurise et sert vos données. SQL est la langue — le SGBD est le serveur qui la comprend. Sans SGBD : des milliers de fichiers CSV impossibles à croiser. Avec SGBD : recherches ultra-rapides, transactions sécurisées, accès multi-utilisateurs.",
      },
      {
        kind: 'list',
        heading: 'Ce qu\'un bon SGBD garantit — ACID',
        items: [
          'Atomicité — une transaction réussit entièrement ou pas du tout (0 données corrompues)',
          'Cohérence — les données restent dans un état valide après chaque opération',
          'Isolation — les transactions concurrentes ne s\'interfèrent pas',
          'Durabilité — une transaction validée est permanente, même après crash',
        ],
      },
      {
        kind: 'text',
        heading: 'Analogie concrète',
        body: "Le SGBD = un bibliothécaire ultra-efficace. La base de données = la bibliothèque. Les tables = les rayons. SQL = vos demandes. Vous dites 'je veux tous les livres de Zola publiés après 1880' — il revient en 10ms avec la liste exacte.",
      },
    ],
  },
  {
    badge: 'Écosystème',
    title: 'MySQL, PostgreSQL, SQLite... lequel choisir ?',
    tagline: 'Tous parlent SQL, mais chacun a ses forces. Connaître les différences change tout.',
    fact: 'PostgreSQL est classé n°1 des SGBD open-source depuis 5 ans consécutifs',
    color: 'text-[#7c3aed]',
    accentBg: 'bg-[#7c3aed]/5 border-[#7c3aed]/20',
    Icon: GitBranch,
    blocks: [
      {
        kind: 'table',
        heading: 'Comparatif des principaux SGBD',
        rows: [
          { label: 'PostgreSQL', value: 'Data, APIs, analytics — conformité SQL stricte, JSON avancé, open-source pur', tag: 'Ce parcours' },
          { label: 'MySQL', value: 'Web (WordPress, Drupal, e-commerce) — rapide, simple à démarrer' },
          { label: 'SQLite', value: 'Applications mobiles, embarqué — fichier unique, zéro serveur' },
          { label: 'Oracle / SQL Server', value: 'Enterprise — très puissants, coûteux, support certifié' },
          { label: 'BigQuery / Snowflake', value: 'Analytics cloud — requêtes sur des pétaoctets, pay-per-query' },
          { label: 'DuckDB', value: 'Analyse locale sur fichiers CSV/Parquet — le nouveau favori des data scientists' },
        ],
      },
      {
        kind: 'text',
        heading: 'La réalité terrain',
        body: "En entreprise, vous croiserez souvent plusieurs SGBD en même temps : MySQL pour les apps web, PostgreSQL pour la data warehouse, BigQuery pour le reporting. Le bon choix dépend du volume, du budget, des compétences et des cas d'usage.",
      },
    ],
  },
  {
    badge: 'Structure',
    title: 'Tables, colonnes, clés — anatomie d\'une BDD',
    tagline: 'Comprendre comment les données sont organisées pour mieux les interroger.',
    fact: 'Une base bien normalisée peut réduire la taille des données de 60%',
    color: 'text-[#0d9488]',
    accentBg: 'bg-[#0d9488]/5 border-[#0d9488]/20',
    Icon: Zap,
    blocks: [
      {
        kind: 'list',
        heading: 'Les briques fondamentales',
        items: [
          'Table = une entité métier (clients, commandes, produits). Une table par concept.',
          'Colonne = un attribut de l\'entité (nom, date, montant). Chaque colonne a un type (TEXT, INT, DATE, BOOLEAN...)',
          'Ligne = un enregistrement individuel. clients contient une ligne par client.',
          'Clé primaire (PK) = identifiant unique de chaque ligne (souvent id INT). Jamais NULL, jamais dupliqué.',
          'Clé étrangère (FK) = lien vers la PK d\'une autre table. orders.user_id → users.id crée la relation.',
          'Index = structure d\'accélération des recherches. Sans index, SQL parcourt toutes les lignes.',
        ],
      },
      {
        kind: 'text',
        heading: 'Normalisation — éviter la duplication',
        body: "Le principe de normalisation : chaque information doit exister à un seul endroit. Au lieu de stocker le nom du client dans chaque commande, on stocke user_id et on fait un JOIN. Si le client change de nom, une seule mise à jour suffit — au lieu de corriger 1000 lignes dans orders.",
      },
    ],
  },
  {
    badge: 'Pratique',
    title: 'Les 7 commandes qui font 80% du travail',
    tagline: 'Maîtrisez ces 7 mots-clés et vous pouvez interroger n\'importe quelle base.',
    fact: 'SELECT + FROM + WHERE couvrent 60% des requêtes quotidiennes en entreprise',
    color: 'text-[#ea580c]',
    accentBg: 'bg-[#ea580c]/5 border-[#ea580c]/20',
    Icon: Code2,
    blocks: [
      {
        kind: 'code',
        heading: 'Les 7 mots-clés essentiels',
        lines: [
          { sql: 'SELECT nom, montant', comment: '→ les colonnes à afficher' },
          { sql: 'FROM orders', comment: '→ la table source' },
          { sql: 'JOIN users ON orders.user_id = users.id', comment: '→ fusionner deux tables' },
          { sql: 'WHERE montant > 100', comment: '→ filtrer les lignes' },
          { sql: 'GROUP BY nom', comment: '→ regrouper + agréger (COUNT, SUM, AVG...)' },
          { sql: 'ORDER BY montant DESC', comment: '→ trier les résultats' },
          { sql: 'LIMIT 10;', comment: '→ limiter le nombre de lignes retournées' },
        ],
      },
      {
        kind: 'text',
        heading: "Mnémotechnique pour mémoriser l'ordre",
        body: "L'ordre d'écriture est fixe en SQL. Retenez : 'Sacha Fait Whisky Avec Grande Originalité Légendaire' → SELECT · FROM · WHERE · AND/JOIN · GROUP BY · ORDER BY · LIMIT. L'ordre d'exécution interne est différent (FROM en premier), mais l'ordre d'écriture ne change jamais.",
      },
    ],
  },
];

// ─── Fiches récap après QCM ──────────────────────────────────────────────────

type RecapCard = {
  title: string;
  borderColor: string;
  titleColor: string;
  bgHeader: string;
  explanation: string;
  rules: string[];
  example: string;
};

const SQL_RECAP_CARDS: RecapCard[] = [
  {
    title: 'SELECT & FROM',
    borderColor: 'border-[#006a9e]',
    titleColor: 'text-[#006a9e]',
    bgHeader: 'bg-[#006a9e]/5',
    explanation: "SELECT choisit les colonnes à afficher, FROM désigne la table source — comme choisir les colonnes d'un onglet Excel. Ces deux mots sont obligatoires dans toute requête de lecture. Évitez SELECT * : il rapatrie tout, même ce qui ne vous sert pas.",
    rules: [
      "SELECT col1, col2 — listez les colonnes utiles, pas *",
      "FROM table — la table doit exister dans la base",
      "Ordre fixe : SELECT toujours avant FROM",
    ],
    example: "SELECT username, email, role\nFROM users;",
  },
  {
    title: 'WHERE — Filtrer',
    borderColor: 'border-[#dd0061]',
    titleColor: 'text-[#dd0061]',
    bgHeader: 'bg-[#dd0061]/5',
    explanation: "WHERE filtre les lignes : il évalue chaque enregistrement et ne garde que ceux pour lesquels la condition est vraie. Sans WHERE, vous récupérez TOUTES les lignes — parfois des millions. Combinez les conditions avec AND / OR.",
    rules: [
      "S'écrit après FROM (et après JOIN) — jamais avant",
      "AND = les deux conditions vraies · OR = l'une suffit",
      "Opérateurs utiles : = · != · > · < · IN ('a','b') · LIKE '%mot%' · IS NULL",
    ],
    example: "SELECT username, email\nFROM users\nWHERE is_active = true\n  AND role = 'admin';",
  },
  {
    title: 'JOIN — Relier les tables',
    borderColor: 'border-[#7c3aed]',
    titleColor: 'text-[#7c3aed]',
    bgHeader: 'bg-[#7c3aed]/5',
    explanation: "JOIN fusionne deux tables en alignant leurs lignes sur une colonne commune — comme un RECHERCHEV Excel. Les BDD stockent les informations séparées pour éviter la duplication : le nom du client n'est pas dans chaque commande, seulement son identifiant. JOIN les relie à la demande.",
    rules: [
      "ON précise la colonne de liaison : ON orders.user_id = users.id",
      "INNER JOIN = lignes avec correspondance des deux côtés seulement",
      "LEFT JOIN = toutes les lignes de gauche, NULL si pas de correspondance à droite",
    ],
    example: "SELECT u.username, o.amount\nFROM orders o\nJOIN users u ON o.user_id = u.id\nWHERE o.status = 'paid';",
  },
  {
    title: 'GROUP BY & agrégats',
    borderColor: 'border-[#0d9488]',
    titleColor: 'text-[#0d9488]',
    bgHeader: 'bg-[#0d9488]/5',
    explanation: "GROUP BY regroupe les lignes par valeur commune et calcule des statistiques sur chaque groupe — c'est le tableau croisé dynamique de SQL. Indispensable pour répondre à : 'combien de commandes par statut ?', 'chiffre d'affaires par mois ?'.",
    rules: [
      "Fonctions d'agrégation : COUNT(*) · SUM() · AVG() · MIN() · MAX()",
      "Chaque colonne dans SELECT doit être dans GROUP BY ou dans une agrégation",
      "HAVING filtre sur les groupes (après agrégation) — WHERE filtre les lignes brutes",
    ],
    example: "SELECT status, COUNT(*) AS nb, SUM(amount) AS total\nFROM orders\nGROUP BY status\nORDER BY total DESC;",
  },
];

export default function DataFormationPage() {
  const [stage, setStage] = useState<Stage>('name');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');

  const [questions, setQuestions] = useState<SqlQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const [score, setScore] = useState<number | null>(null);
  const [total, setTotal] = useState(8);
  const [corrections, setCorrections] = useState<QuizCorrection[]>([]);
  const [scenario, setScenario] = useState<SqlScenario | null>(null);

  const [sqlQuery, setSqlQuery] = useState('SELECT ... FROM ... WHERE ...;');
  const [sandboxResult, setSandboxResult] = useState<SandboxResponse | null>(null);
  const [assistantQuestion, setAssistantQuestion] = useState('');
  const [assistantMessages, setAssistantMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [showAssistant, setShowAssistant] = useState(false);
  const [autoFeedback, setAutoFeedback] = useState<string | null>(null);
  const [autoFeedbackLoading, setAutoFeedbackLoading] = useState(false);
  const [miniLesson, setMiniLesson] = useState<{ title: string; text: string } | null>(null);

  const [introStep, setIntroStep] = useState(0);
  const [level, setLevel] = useState<DifficultyLevel | null>(null);
  const [levelLabel, setLevelLabel] = useState('');
  const [scenariosCompleted, setScenariosCompleted] = useState(0);
  const [scenarioTitles, setScenarioTitles] = useState<string[]>([]);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const requiredCount = questions.length || 8;
  const missionHints = useMemo(() => buildMissionHintsFromScenario(scenario), [scenario]);
  const relevantTables = useMemo(() => inferRelevantTables(scenario), [scenario]);
  const primaryTable = useMemo(() => inferPrimaryTable(scenario, relevantTables), [scenario, relevantTables]);
  const visibleSchema = useMemo(
    () => {
      const ordered = [primaryTable, ...relevantTables.filter((t) => t !== primaryTable)];
      return SANDBOX_TABLES.filter((table) => ordered.includes(table.name)).sort(
        (a, b) => ordered.indexOf(a.name) - ordered.indexOf(b.name)
      );
    },
    [relevantTables, primaryTable]
  );

  useEffect(() => {
    if (stage !== 'scenario') return;
    setSqlQuery(buildStarterQuery(primaryTable, missionHints));
  }, [stage, primaryTable, missionHints]);

  const startSqlJourney = async () => {
    const cleanName = firstName.trim();
    if (!cleanName) {
      setError('Entre ton prénom pour commencer.');
      return;
    }
    setError('');
    setIntroStep(0);
    setStage('intro'); // afficher la frise immédiatement
    setLoading(true);
    // charger les questions en arrière-plan pendant que l'utilisateur lit la frise
    try {
      const res = await apiRequest<{ success: boolean; sessionId: string; welcomeMessage: string; questions: SqlQuestion[]; message?: string }>(
        '/api/client/formation/sql/start',
        { method: 'POST', body: JSON.stringify({ firstName: cleanName }) }
      );
      if (!res.success) throw new Error(res.message || 'Impossible de démarrer le parcours SQL.');
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
    if (!sessionId) {
      setError('Chargement en cours, patientez...');
      return;
    }
    setStage('quiz');
  };

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
        success: boolean;
        score: number;
        total: number;
        level: DifficultyLevel;
        levelLabel: string;
        corrections: QuizCorrection[];
        scenario: SqlScenario;
        message?: string;
      }>('/api/client/formation/sql/quiz/submit', {
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

  const runSandboxQuery = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError('');
    setAutoFeedback(null);
    let queryResult: SandboxResponse | null = null;
    let solvedMission = false;
    try {
      const res = await apiRequest<SandboxResponse>('/api/client/formation/sql/sandbox', {
        method: 'POST',
        body: JSON.stringify({ sessionId, query: sqlQuery }),
      });
      setSandboxResult(res);
      queryResult = res;
      const progress = evaluateMissionProgress(sqlQuery, res, missionHints, relevantTables);
      if (progress === 'success') {
        setMiniLesson({
          title: 'Excellent, mission réussie.',
          text: "Tu as structuré ta requête avec les bons blocs SQL pour répondre au besoin métier. Garde ce pattern: table pertinente, sélection claire, puis filtre ou agrégation selon l'objectif.",
        });
        setScenariosCompleted(prev => prev + 1);
        if (scenario?.title) setScenarioTitles(prev => [...prev, scenario.title]);
        solvedMission = true;
      }
    } catch (e: any) {
      const errResult: SandboxResponse = { success: false, message: e?.message || 'Erreur SQL' };
      setSandboxResult(errResult);
      queryResult = errResult;
    } finally {
      setLoading(false);
    }
    if (queryResult && !solvedMission) {
      autoEvaluate(sqlQuery, queryResult);
    }
  };

  const autoEvaluate = async (query: string, result: SandboxResponse) => {
    if (!sessionId) return;
    setAutoFeedbackLoading(true);
    try {
      const progress = evaluateMissionProgress(query, result, missionHints, relevantTables);
      const autoQ = result.success
        ? `J'ai exécuté cette requête et j'ai obtenu ${result.rowCount} ligne(s). Mon niveau actuel est ${progress}. Donne un feedback pédagogique en 2-3 phrases: si je suis proche, encourage + piste courte; si je suis loin, recadre. Interdiction absolue de donner une requête SQL complète.`
        : `J'ai une erreur SQL: "${result.message}". Mon niveau actuel est ${progress}. Guide-moi brièvement, ton motivant. Interdiction absolue de donner une requête SQL complète.`;
      const res = await apiRequest<{ success: boolean; assistantMessage: string }>(
        '/api/client/formation/sql/assistant',
        { method: 'POST', body: JSON.stringify({ sessionId, userQuestion: autoQ, currentQuery: query, lastExecution: result }) }
      );
      if (res.success) setAutoFeedback(sanitizeAssistantCoaching(res.assistantMessage));
    } catch (_e: unknown) {
      // silent
    } finally {
      setAutoFeedbackLoading(false);
    }
  };

  const askAssistant = async () => {
    if (!sessionId || !assistantQuestion.trim()) return;

    const userText = assistantQuestion.trim();
    setAssistantQuestion('');
    setAssistantMessages(prev => [...prev, { role: 'user', text: userText }]);

    setLoading(true);
    setError('');
    try {
      const res = await apiRequest<{ success: boolean; assistantMessage: string; message?: string }>(
        '/api/client/formation/sql/assistant',
        {
          method: 'POST',
          body: JSON.stringify({
            sessionId,
            userQuestion: userText,
            currentQuery: sqlQuery,
            lastExecution: sandboxResult,
          }),
        }
      );

      if (!res.success) throw new Error(res.message || 'Assistant indisponible.');
      setAssistantMessages(prev => [...prev, { role: 'assistant', text: sanitizeAssistantCoaching(res.assistantMessage) }]);
    } catch (e: any) {
      setAssistantMessages(prev => [...prev, {
        role: 'assistant',
        text: e?.message || "Je n'ai pas pu répondre pour l'instant. Réessaie avec le message d'erreur exact.",
      }]);
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
        success: boolean;
        scenario: SqlScenario;
        level: DifficultyLevel;
        levelLabel: string;
        message?: string;
      }>('/api/client/formation/sql/next-scenario', {
        method: 'POST',
        body: JSON.stringify({ sessionId, scenariosCompleted }),
      });
      if (!res.success) throw new Error(res.message || 'Impossible de charger le prochain scenario.');
      setScenario(res.scenario);
      setLevel(res.level);
      setLevelLabel(res.levelLabel);
      setMiniLesson(null);
      setSandboxResult(null);
      setAutoFeedback(null);
      setAssistantMessages([]);
    } catch (e: any) {
      setError(e?.message || 'Erreur chargement scenario suivant.');
    } finally {
      setLoading(false);
    }
  };

  const finishSession = async () => {
    if (!sessionId) return;
    setSummaryLoading(true);
    setError('');
    try {
      const res = await apiRequest<{ success: boolean; summary: string; message?: string }>(
        '/api/client/formation/sql/summary',
        {
          method: 'POST',
          body: JSON.stringify({ sessionId, scenariosCompleted, scenarioTitles }),
        }
      );
      setSummaryText(res.summary || '');
      setStage('summary');
    } catch (e: any) {
      setSummaryText(`Bravo ${firstName} ! Tu as complete ${scenariosCompleted} scenario(s) SQL. Continue a pratiquer !`);
      setStage('summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const renderSandboxResult = () => {
    if (!sandboxResult) return null;

    if (!sandboxResult.success) {
      return (
        <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-3">
          <p className="text-[11px] uppercase tracking-wider text-red-600 font-semibold mb-1">Erreur SQL</p>
          <p className="text-xs text-red-700 font-mono leading-relaxed">{sandboxResult.message || 'Requête invalide'}</p>
        </div>
      );
    }

    const cols = sandboxResult.columns || [];
    const rows = sandboxResult.rows || [];

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-emerald-700">Résultat</span>
          <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] text-emerald-700 font-mono">
            {sandboxResult.rowCount} ligne{(sandboxResult.rowCount ?? 0) !== 1 ? 's' : ''}
          </span>
          <span className="text-[10px] text-gray-400">{sandboxResult.durationMs} ms</span>
        </div>

        {rows.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Aucune ligne retournée — vérifie tes conditions.</p>
        ) : (
          <div className="overflow-auto rounded-xl border border-gray-200 max-h-56">
            <table className="min-w-full text-xs">
              <thead className="bg-[#006a9e]/8 sticky top-0">
                <tr>
                  {cols.map(c => (
                    <th key={c} className="px-3 py-2 text-left text-[#006a9e] font-mono font-semibold whitespace-nowrap">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className={`border-t border-gray-200 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    {cols.map((c) => (
                      <td key={`${i}-${c}`} className="px-3 py-1.5 text-gray-700 whitespace-nowrap">
                        {String(row[c] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-[#061019]">

      <header className="flex items-center justify-center px-4 py-3 border-b border-gray-200 bg-white">
        <div className="text-sm font-semibold tracking-wide text-[#006a9e]">FYNE DATA SQL</div>
      </header>

      <main className="p-4 md:p-6 lg:p-8">
        {error && (
          <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        {stage === 'name' && (
          <div className="min-h-[78vh] grid place-items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-xl rounded-xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm"
            >
              <div className="inline-flex items-center gap-2 text-[#006a9e] text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> IA SQL Coach
              </div>
              <h1 className="mt-3 text-2xl md:text-3xl font-black">Quel est ton prénom ?</h1>
              <p className="mt-2 text-gray-500 text-sm">
                Je te souhaite la bienvenue dans le parcours SQL. On commence par un QCM de 8 questions pour évaluer ton niveau.
              </p>

              <div className="mt-6 flex gap-2">
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') startSqlJourney();
                  }}
                  placeholder="Ton prénom"
                  className="flex-1 border border-gray-300 bg-white text-[#061019] px-4 py-3 text-sm outline-none focus:border-[#006a9e]"
                />
                <button
                  type="button"
                  onClick={startSqlJourney}
                  disabled={loading}
                  className="px-4 py-3 bg-[#dd0061] text-white font-bold text-sm disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Commencer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── Stage: Intro frise SQL ── */}
        {stage === 'intro' && (() => {
          const step = SQL_INTRO_STEPS[introStep];
          const StepIcon = step.Icon;
          const isLast = introStep === SQL_INTRO_STEPS.length - 1;
          return (
            <section className="max-w-4xl mx-auto py-6">
              {/* En-tête */}
              <div className="mb-8 text-center">
                <span className="text-xs font-semibold text-[#dd0061] uppercase tracking-widest">Avant le QCM d'évaluation</span>
                <h1 className="mt-1 text-2xl font-black text-[#006a9e]">Les fondamentaux SQL</h1>
                <p className="text-sm text-gray-500 mt-1">Parcourez les 5 étapes clés — chaque minute compte pour mieux réussir.</p>
              </div>

              {/* Frise de progression horizontale */}
              <div className="relative mb-10 px-4">
                {/* Ligne de connexion */}
                <div className="absolute top-5 left-12 right-12 h-0.5 bg-gray-200" />
                <div
                  className="absolute top-5 left-12 h-0.5 bg-[#006a9e] transition-all duration-500"
                  style={{ width: `calc((100% - 6rem) * ${introStep / (SQL_INTRO_STEPS.length - 1)})` }}
                />
                <div className="relative flex justify-between">
                  {SQL_INTRO_STEPS.map((s, i) => {
                    const done = i < introStep;
                    const active = i === introStep;
                    return (
                      <button
                        key={i}
                        onClick={() => setIntroStep(i)}
                        className="flex flex-col items-center gap-2 group"
                      >
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
                {/* Header de la carte */}
                <div className={`px-6 py-5 border-b border-gray-100 ${step.accentBg}`}>
                  <div className="flex items-start gap-4">
                    <div className={`mt-0.5 p-2 bg-white border border-gray-100 shadow-sm`}>
                      <StepIcon className={`w-5 h-5 ${step.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-[11px] font-bold uppercase tracking-widest ${step.color}`}>{step.badge}</span>
                        <span className="text-[11px] text-gray-400">Étape {introStep + 1} / {SQL_INTRO_STEPS.length}</span>
                      </div>
                      <h2 className="text-xl font-black text-[#061019]">{step.title}</h2>
                      <p className="text-sm text-gray-500 mt-1">{step.tagline}</p>
                    </div>
                  </div>
                  {/* Fact badge */}
                  <div className="mt-4 inline-flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5">
                    <Zap className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-xs text-gray-600 font-medium">{step.fact}</span>
                  </div>
                </div>

                {/* Blocs de contenu */}
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
                            <span className="text-[11px] text-gray-400 font-mono">SQL</span>
                          </div>
                          <div className="px-4 py-3 space-y-1.5">
                            {block.lines.map((line, li) => (
                              <div key={li} className="flex items-baseline gap-4">
                                <code className="text-xs font-mono text-blue-300 w-72 flex-shrink-0">{line.sql}</code>
                                <span className="text-xs text-gray-500 italic">{line.comment}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                  <button
                    onClick={() => setIntroStep(i => Math.max(0, i - 1))}
                    disabled={introStep === 0}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#006a9e] disabled:opacity-0 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Précédent
                  </button>
                  <button
                    onClick={() => setIntroStep(i => Math.min(SQL_INTRO_STEPS.length - 1, i + 1))}
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

              {/* Accès rapide QCM */}
              <div className="mt-4 text-center">
                <button
                  onClick={goToQuiz}
                  disabled={loading}
                  className="text-xs text-gray-400 hover:text-[#006a9e] underline underline-offset-2 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Chargement du QCM...' : 'Passer l\'introduction et aller directement au QCM'}
                </button>
              </div>
            </section>
          );
        })()}

        {stage === 'quiz' && (
          <section className="max-w-7xl mx-auto">
            <div className="border border-gray-200 bg-white p-4 mb-5">
              <p className="text-sm text-gray-700">{welcomeMessage}</p>
              <p className="text-xs text-[#006a9e] mt-2">QCM SQL: {answeredCount}/{requiredCount} réponses</p>
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

        {stage === 'results' && (
          <section className="max-w-5xl mx-auto">
            <div className="border border-gray-200 bg-white p-5 mb-5 shadow-sm">
              <h2 className="text-xl font-black">Résultats du QCM</h2>
              <p className="mt-2 text-[#006a9e] font-bold">Score: {score}/{total}</p>
              <p className="text-sm text-gray-500 mt-1">Voici les réponses avec correction détaillée.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {corrections.map((c, idx) => {
                const isCorrect = c.userIndex === c.correctIndex;
                const sqlExample = buildCorrectionExample(c);
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
                    <div className="mt-2 rounded-lg border border-[#006a9e]/20 bg-[#0f172a] px-2 py-1.5">
                      <p className="text-[10px] uppercase tracking-wide text-[#006a9e]/80">Exemple SQL</p>
                      <p className="mt-1 text-[10px] font-mono text-blue-200 break-all leading-snug">{sqlExample}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fiches récap SQL — renforcement post-QCM */}
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-0.5 bg-[#dd0061]" />
                <h3 className="text-base font-black text-[#061019]">À retenir avant la mise en situation</h3>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <p className="text-xs text-gray-500 mb-6 ml-9">Lisez chaque fiche attentivement — vous en aurez besoin dans le sandbox.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SQL_RECAP_CARDS.map((card, i) => (
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
                onClick={() => {
                  setStage('scenario');
                  setShowAssistant(true);
                }}
                className="px-5 py-3 bg-[#dd0061] text-white font-bold text-sm"
              >
                Voir la mise en situation SQL
              </button>
            </div>
          </section>
        )}

        {stage === 'scenario' && scenario && (
          <>
            <section className="max-w-6xl mx-auto space-y-4">
              {/* Carte scénario */}
              <div className="border-l-4 border-l-[#006a9e] border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-black text-[#006a9e]">{scenario.title}</h2>
                <p className="mt-2 text-sm text-gray-700">Contexte : {scenario.context.split('. ')[0]}.</p>
                <p className="mt-1 text-sm text-[#dd0061] font-semibold">Mission : {scenario.goal}</p>
                <div className="mt-3 border border-gray-100 bg-gray-50 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-[#006a9e] font-semibold mb-2">Données disponibles pour la mission</p>
                  <p className="text-xs text-gray-600 mb-3">
                    Table principale : <span className="font-mono text-[#006a9e]">{primaryTable}</span>
                    {TABLE_META[primaryTable] && (
                      <span className="text-gray-600"> — {TABLE_META[primaryTable].desc}</span>
                    )}
                  </p>
                  <div className="grid md:grid-cols-3 gap-2">
                    {visibleSchema.map((table) => {
                      const meta = TABLE_META[table.name];
                      return (
                        <div key={table.name} className="border border-gray-200 bg-white px-3 py-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <p className="text-[11px] font-mono font-semibold text-[#006a9e]">{table.name}</p>
                            {meta && <span className="text-[10px] text-gray-600">— {meta.label}</span>}
                          </div>
                          {meta && <p className="text-[10px] text-gray-600 mb-1.5 italic">{meta.desc}</p>}
                          <div className="space-y-0.5">
                            {table.columns.map((col) => (
                              <div key={col} className="flex items-baseline gap-1.5">
                                <span className="font-mono text-[10px] text-[#006a9e]/80 font-semibold shrink-0">{col}</span>
                                {meta?.columns[col] && (
                                  <span className="text-[10px] text-gray-600 leading-snug">{meta.columns[col]}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-2.5 text-[10px] text-gray-600">Relations : orders.user_id = users.id · sessions.user_id = users.id · failed_logins.user_id = users.id</p>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-3 grid md:grid-cols-[1fr_auto] gap-3 items-start">
                  <p className="text-sm text-gray-600 leading-relaxed pr-0 md:pr-4">
                    À toi de jouer ! Construis ta requête dans le sandbox ci-dessous. Essaie par toi-même d'abord, si tu es bloqué(e), l'assistant IA SQL peut analyser tes erreurs et te guider pas à pas sans donner la réponse. Bonne chance !
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAssistant(true)}
                    className="shrink-0 px-4 py-2.5 bg-[#006a9e] text-white text-xs font-black hover:bg-[#005a8a] transition"
                  >
                    Ouvrir l'assistant IA SQL
                  </button>
                </div>
              </div>

              {/* Layout 2 colonnes : sandbox gauche, feedback droite */}
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Colonne gauche : SQL Sandbox */}
                <div className="border border-gray-200 bg-white p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#006a9e]">
                      <Database className="w-4 h-4" /> SQL Sandbox DATA
                    </div>
                    <button
                      type="button"
                      onClick={runSandboxQuery}
                      disabled={loading}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#006a9e] text-white text-xs font-bold hover:bg-[#005a8a] disabled:opacity-60"
                    >
                      <Play className="w-3.5 h-3.5" /> Exécuter <span className="opacity-60 font-normal">Ctrl+↵</span>
                    </button>
                  </div>
                  <textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        e.preventDefault();
                        runSandboxQuery();
                      }
                    }}
                    className="w-full min-h-[170px] border border-gray-200 bg-[#0f172a] text-white p-3 text-xs font-mono outline-none focus:border-[#006a9e]/60"
                  />
                  {sandboxResult && renderSandboxResult()}
                </div>

                {/* Colonne droite : étape guidée + feedback + mini cours */}
                <div className="space-y-4">
                  {/* Commandes clés orientées mission (sans réponse prête) */}
                  {!miniLesson && (
                    <div className="border border-[#006a9e]/20 bg-[#006a9e]/5 p-4">
                      <p className="text-xs uppercase tracking-wider text-[#006a9e] font-semibold">
                        Apprentissage guidé
                      </p>
                      <p className="mt-2 text-sm font-semibold">Objectif: construire toi-même la requête de mission.</p>
                      <p className="mt-1 text-xs text-gray-600">Commence par ce squelette: <span className="font-mono">SELECT ... FROM {primaryTable} ...</span></p>
                      <p className="mt-1 text-xs text-gray-500">Utilise ces commandes clés et leur rôle:</p>
                      <div className="mt-3 grid sm:grid-cols-2 gap-2">
                        {missionHints.map((hint) => (
                          <div key={hint.id} className="bg-white border border-gray-200 px-3 py-2">
                            <p className="text-[11px] font-mono font-semibold text-[#006a9e]">{hint.command}</p>
                            <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                              {hint.command === 'FROM' ? `Indique explicitement la table: FROM ${primaryTable}.` : hint.purpose}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mini cours affiché après validation d'une étape */}
                  {miniLesson && (
                    <div className="border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-xs uppercase tracking-wider text-emerald-700 font-semibold mb-2">Mission accomplie</p>
                      <p className="text-sm font-bold text-emerald-800">{miniLesson.title}</p>
                      <p className="mt-2 text-xs text-gray-700 leading-relaxed">{miniLesson.text}</p>
                      {levelLabel && (
                        <p className="mt-2 text-[11px] text-emerald-600">
                          Niveau actuel : {levelLabel.split(' — ')[0]} &bull; {scenariosCompleted} scenario(s) complete(s)
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
                          Scenario suivant
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
                      <p className="text-xs text-gray-400">Analyse de ta requête en cours...</p>
                    </div>
                  )}

                  {/* Feedback IA automatique */}
                  {autoFeedback && !autoFeedbackLoading && !miniLesson && (
                    <div className="border border-[#006a9e]/20 bg-[#006a9e]/5 p-4">
                      <p className="text-xs uppercase tracking-wider text-[#006a9e] font-semibold mb-2">Feedback IA</p>
                      <div>{renderMarkdown(autoFeedback)}</div>
                    </div>
                  )}

                </div>
              </div>
            </section>

            {/* Popup Assistant IA SQL flottant */}
            {showAssistant && (
              <div className="fixed inset-0 z-50 flex items-end justify-end p-6 pointer-events-none">
                <div
                  className="pointer-events-auto w-[380px] border border-gray-200 bg-white shadow-xl flex flex-col"
                  style={{ maxHeight: '72vh' }}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-[#006a9e]">Assistant IA SQL</h3>
                    <button
                      type="button"
                      onClick={() => setShowAssistant(false)}
                      className="text-gray-400 hover:text-gray-700 text-base leading-none px-1"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="px-4 pt-2 pb-1 text-[11px] text-gray-400">
                    L'IA analyse ta requête et tes erreurs pour te guider sans donner la réponse directement.
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
                      placeholder="Ex: pourquoi ma requête ne remonte rien ?"
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
        {stage === 'summary' && (
          <div className="min-h-[78vh] grid place-items-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm"
            >
              <div className="inline-flex items-center gap-2 text-yellow-600 text-xs font-semibold uppercase tracking-wider">
                <Trophy className="w-5 h-5" /> Bilan de session
              </div>
              <h2 className="mt-3 text-2xl font-black">Bravo {firstName} !</h2>
              <p className="mt-1 text-xs text-gray-400">{scenariosCompleted} scenario(s) complete(s) &bull; Niveau : {levelLabel.split(' — ')[0] || level}</p>

              {summaryLoading ? (
                <div className="mt-6 flex items-center gap-3 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm text-gray-500">L'IA prepare ton bilan...</span>
                </div>
              ) : (
                <p className="mt-6 text-sm text-gray-700 leading-relaxed whitespace-pre-line">{summaryText}</p>
              )}

              {scenarioTitles.length > 0 && (
                <div className="mt-5 border border-gray-200 bg-gray-50 p-3">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-2">Scenarios realises</p>
                  <ul className="space-y-1">
                    {scenarioTitles.map((t, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                        <span className="text-emerald-600">&#10003;</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMiniLesson(null);
                    setSandboxResult(null);
                    setAutoFeedback(null);
                    setAssistantMessages([]);
                    setStage('scenario');
                  }}
                  className="px-4 py-2.5 bg-[#dd0061] text-white font-semibold text-sm hover:bg-[#b8004e]"
                >
                  Continuer quand meme
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </main>
    </div>
  );
}