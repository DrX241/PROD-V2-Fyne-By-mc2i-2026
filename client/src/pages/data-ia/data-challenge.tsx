import { useRef, useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Star, Zap, Trophy, RotateCcw, ArrowLeft,
  Database, Code2, BarChart3, Table2, Swords, ChevronRight, Flame, Crown
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type TechKey = 'sql' | 'powerbi' | 'python' | 'excel';
type Difficulty = 'débutant' | 'intermédiaire' | 'expert';
type Screen = 'dungeon' | 'battle' | 'victory' | 'defeat';

interface Question { question: string; choices: string[]; correct: number; explanation: string; }
interface Boss { name: string; emoji: string; title: string; lore: string; reward: number; }
interface StageProgress { completed: boolean; stars: number; xp: number; }
type Progress = Partial<Record<TechKey, Partial<Record<Difficulty, StageProgress>>>>;

interface CharState {
  x: number; y: number; dir: 'left' | 'right' | 'up' | 'down';
  frame: number; frameTimer: number; moving: boolean;
  targetX: number; targetY: number;
  phase: 'corridor' | 'entering' | 'idle';
  enteringRoom: Difficulty | null;
}

// ─── Config ──────────────────────────────────────────────────────────────────
const TECH_CONFIG = {
  sql:     { label: 'SQL',      color: '#0EA5E9', r: 14, g: 165, b: 233, icon: Database, world: 'Cryptes SQL'       },
  powerbi: { label: 'Power BI', color: '#F59E0B', r: 245, g: 158, b: 11, icon: BarChart3, world: 'Tours BI'         },
  python:  { label: 'Python',   color: '#8B5CF6', r: 139, g: 92, b: 246, icon: Code2,    world: 'Abysses Python'    },
  excel:   { label: 'Excel',    color: '#10B981', r: 16, g: 185, b: 129, icon: Table2,   world: 'Forêt Excel'       },
} as const;

const DIFFICULTIES: Difficulty[] = ['débutant', 'intermédiaire', 'expert'];
const DIFF_META: Record<Difficulty, { label: string; icon: string; xpMult: number }> = {
  débutant:      { label: 'Apprenti', icon: '🗡️',  xpMult: 1 },
  intermédiaire: { label: 'Expert',   icon: '⚔️',  xpMult: 2 },
  expert:        { label: 'Maître',   icon: '👑',  xpMult: 4 },
};
const BASE_XP = 100;

// ─── Boss roster ─────────────────────────────────────────────────────────────
const BOSSES: Record<TechKey, Record<Difficulty, Boss>> = {
  sql: {
    débutant:      { name: "SQL Goblin",       emoji: "👺", title: "Gardien des requêtes",    lore: "Ce gobelin corrompu bloque l'accès aux tables depuis des siècles.",  reward: 150 },
    intermédiaire: { name: "Query Wizard",     emoji: "🧙", title: "Maître des jointures",    lore: "Un sorcier pervers qui maîtrise les CTEs et fonctions fenêtre.",      reward: 300 },
    expert:        { name: "Database Dragon",  emoji: "🐉", title: "Seigneur du schéma",      lore: "Ce dragon antique garde les secrets du MVCC et du sharding.",         reward: 600 },
  },
  powerbi: {
    débutant:      { name: "DAX Gremlins",     emoji: "👾", title: "Voleur de mesures",       lore: "Ces gremlins sabotent vos calculs DAX avant qu'ils n'arrivent !",     reward: 150 },
    intermédiaire: { name: "BI Sorcerer",      emoji: "🔮", title: "Maître du contexte",      lore: "Un sorcier qui manipule CALCULATE et KEEPFILTERS à son gré.",          reward: 300 },
    expert:        { name: "Vertipaq Vampire", emoji: "🧛", title: "Seigneur Vertipaq",       lore: "Ce vampire se nourrit de cardinalités et de mesures implicites.",      reward: 600 },
  },
  python: {
    débutant:      { name: "Code Slime",        emoji: "🐸", title: "Monstre des boucles",    lore: "Un slime baveux qui perturbe vos listes et vos boucles for.",          reward: 150 },
    intermédiaire: { name: "Pandas Beast",      emoji: "🐼", title: "Dévoreur de DataFrames", lore: "Cette bête dévore groupby() et .loc sans la moindre pitié.",           reward: 300 },
    expert:        { name: "Metaclass Monster", emoji: "🦑", title: "Titan du paradigme",     lore: "Un monstre maîtrisant métaclasses, asyncio et le GIL.",                reward: 600 },
  },
  excel: {
    débutant:      { name: "Sheet Zombie",  emoji: "🧟",    title: "Hanteur de formules",     lore: "Ce zombie corrompt vos VLOOKUP et SUM depuis des décennies.",           reward: 150 },
    intermédiaire: { name: "Formula Witch", emoji: "🧙‍♀️", title: "Sorcière des fonctions",  lore: "Elle jette des sorts INDEX/MATCH et SUMIFS sur ses victimes.",          reward: 300 },
    expert:        { name: "LAMBDA Lord",   emoji: "👑",    title: "Seigneur des Arrays",     lore: "Ce seigneur omniscient maîtrise LAMBDA, XLOOKUP et SEQUENCE 365.",     reward: 600 },
  },
};

// ─── Questions ────────────────────────────────────────────────────────────────
const QUESTION_BANK: Record<TechKey, Record<Difficulty, Question[]>> = {
  sql: {
    débutant: [
      { question: "Quelle clause SQL permet de filtrer les lignes d'un résultat ?", choices: ["GROUP BY", "WHERE", "HAVING", "ORDER BY"], correct: 1, explanation: "WHERE filtre les lignes avant regroupement. HAVING filtre après GROUP BY." },
      { question: "Quel mot-clé permet d'éliminer les doublons dans un SELECT ?", choices: ["UNIQUE", "DISTINCT", "FILTER", "ONLY"], correct: 1, explanation: "SELECT DISTINCT retourne uniquement les valeurs uniques." },
      { question: "Que retourne COUNT(*) ?", choices: ["La somme des valeurs", "Le nombre de lignes", "La moyenne", "La valeur maximale"], correct: 1, explanation: "COUNT(*) compte toutes les lignes, y compris celles avec des valeurs NULL." },
      { question: "Quelle jointure retourne toutes les lignes des deux tables, même sans correspondance ?", choices: ["INNER JOIN", "LEFT JOIN", "FULL OUTER JOIN", "CROSS JOIN"], correct: 2, explanation: "FULL OUTER JOIN retourne toutes les lignes des deux tables, avec NULL là où il n'y a pas de correspondance." },
      { question: "Quelle clause est utilisée pour trier les résultats ?", choices: ["SORT BY", "ORDER BY", "GROUP BY", "ARRANGE BY"], correct: 1, explanation: "ORDER BY trie les résultats. Par défaut en ordre croissant (ASC)." },
      { question: "Que signifie NULL en SQL ?", choices: ["Zéro", "Valeur inconnue ou manquante", "Chaîne vide", "Faux"], correct: 1, explanation: "NULL représente une valeur inconnue ou absente. NULL ≠ 0 et NULL ≠ ''." },
      { question: "Quelle fonction SQL calcule la moyenne d'une colonne numérique ?", choices: ["SUM()", "MEAN()", "AVG()", "MEDIAN()"], correct: 2, explanation: "AVG() calcule la moyenne arithmétique en ignorant les NULL." },
      { question: "Quelle instruction crée une nouvelle table ?", choices: ["INSERT TABLE", "CREATE TABLE", "ADD TABLE", "NEW TABLE"], correct: 1, explanation: "CREATE TABLE est l'instruction DDL pour créer une nouvelle table." },
    ],
    intermédiaire: [
      { question: "Quelle est la différence entre WHERE et HAVING ?", choices: ["Il n'y a pas de différence", "WHERE filtre avant regroupement, HAVING après", "HAVING filtre avant regroupement, WHERE après", "WHERE fonctionne uniquement avec les nombres"], correct: 1, explanation: "WHERE filtre les lignes individuelles avant GROUP BY. HAVING filtre les groupes après agrégation." },
      { question: "Qu'est-ce qu'une CTE (Common Table Expression) ?", choices: ["Une table permanente", "Un résultat nommé temporaire défini avec WITH", "Une contrainte de clé étrangère", "Un index composite"], correct: 1, explanation: "Une CTE est définie avec WITH nom AS (...) et peut être référencée dans la requête principale." },
      { question: "Quelle fonction fenêtre calcule un rang sans laisser de trous ?", choices: ["RANK()", "DENSE_RANK()", "ROW_NUMBER()", "NTILE()"], correct: 1, explanation: "DENSE_RANK() attribue des rangs consécutifs sans trou. RANK() laisse des trous en cas d'égalité." },
      { question: "Qu'est-ce qu'un index et à quoi sert-il ?", choices: ["Une copie de la table", "Une structure qui accélère les recherches", "Une clé primaire obligatoire", "Un type de jointure"], correct: 1, explanation: "Un index crée une structure de données supplémentaire qui permet de localiser rapidement les lignes." },
      { question: "Que fait COALESCE(a, b, c) ?", choices: ["Concatène les valeurs", "Retourne la première valeur non NULL", "Retourne la dernière valeur", "Additionne les valeurs"], correct: 1, explanation: "COALESCE retourne le premier argument non NULL de la liste." },
      { question: "Quelle est la différence entre UNION et UNION ALL ?", choices: ["Pas de différence", "UNION supprime les doublons, UNION ALL les conserve", "UNION ALL supprime les doublons", "UNION fonctionne uniquement avec 2 tables"], correct: 1, explanation: "UNION combine les résultats et supprime les doublons. UNION ALL combine sans dédoublonnage." },
      { question: "Que signifie ACID en bases de données ?", choices: ["Atomicity, Consistency, Isolation, Durability", "Automatic, Controlled, Indexed, Data", "Access, Control, Input, Design", "Advanced, Computed, Indexed, Data"], correct: 0, explanation: "ACID garantit la fiabilité des transactions : Atomicité, Cohérence, Isolation, Durabilité." },
      { question: "Quelle fonction calcule une somme cumulée avec les fonctions fenêtre ?", choices: ["SUM() GROUP BY", "SUM() OVER (ORDER BY ...)", "CUMSUM()", "RUNNING_TOTAL()"], correct: 1, explanation: "SUM() OVER (ORDER BY col) calcule une somme cumulée ligne par ligne." },
    ],
    expert: [
      { question: "Qu'est-ce que la normalisation 3NF ?", choices: ["Toute colonne dépend directement de la clé primaire", "Aucune dépendance transitive entre attributs non-clés", "Les deux réponses précédentes", "La table n'a qu'une seule colonne"], correct: 2, explanation: "La 3NF exige que chaque attribut non-clé dépende directement de la clé primaire." },
      { question: "Quelle est la complexité d'une recherche dans un B-Tree index ?", choices: ["O(n)", "O(log n)", "O(1)", "O(n²)"], correct: 1, explanation: "Les B-Tree ont une complexité de recherche O(log n)." },
      { question: "Qu'est-ce que le MVCC (Multiversion Concurrency Control) ?", choices: ["Un type d'index", "Une technique permettant des lectures sans bloquer les écritures", "Un protocole de réplication", "Un type de contrainte"], correct: 1, explanation: "MVCC maintient plusieurs versions d'une ligne pour permettre des lectures cohérentes sans verrou." },
      { question: "Que fait EXPLAIN ANALYZE en PostgreSQL ?", choices: ["Crée un plan d'exécution hypothétique", "Exécute la requête et affiche le plan réel avec les timings", "Supprime les indexes inutiles", "Analyse la structure de la table"], correct: 1, explanation: "EXPLAIN ANALYZE exécute réellement la requête et retourne le plan avec les temps réels." },
      { question: "Quelle est la différence entre un clustered et un non-clustered index ?", choices: ["Aucune", "Clustered trie physiquement les données, non-clustered crée une structure séparée", "Non-clustered est plus rapide", "Clustered ne peut pas avoir de NULL"], correct: 1, explanation: "Un clustered index définit l'ordre physique des données. Une table ne peut en avoir qu'un seul." },
      { question: "Qu'est-ce que le sharding horizontal ?", choices: ["Ajouter des colonnes à une table", "Diviser les lignes d'une table sur plusieurs serveurs", "Compresser les données", "Créer des index partiels"], correct: 1, explanation: "Le sharding horizontal partitionne les lignes sur plusieurs nœuds de base de données." },
      { question: "Quelle isolation empêche les lectures fantômes ?", choices: ["READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"], correct: 3, explanation: "SERIALIZABLE est le niveau le plus strict. Il prévient les lectures fantômes." },
      { question: "Qu'est-ce qu'une table de faits dans un schéma en étoile ?", choices: ["Une table avec les données de référence", "La table centrale qui contient les mesures et les clés étrangères", "Une table avec une seule colonne", "Une table temporaire"], correct: 1, explanation: "Dans un schéma en étoile, la table de faits contient les métriques mesurables et les FK vers les dimensions." },
    ],
  },
  powerbi: {
    débutant: [
      { question: "Que signifie DAX dans Power BI ?", choices: ["Data Analysis Expressions", "Direct Access eXchange", "Dynamic Analytics eXpert", "Data Aggregation eXtension"], correct: 0, explanation: "DAX (Data Analysis Expressions) est le langage de formules utilisé dans Power BI." },
      { question: "Quelle est la différence entre une mesure et une colonne calculée en DAX ?", choices: ["Aucune différence", "Une mesure est calculée à l'exécution, une colonne calculée est stockée", "Une colonne calculée est plus rapide", "Une mesure ne peut pas utiliser SUM"], correct: 1, explanation: "Une mesure est calculée dynamiquement. Une colonne calculée est stockée dans le modèle." },
      { question: "Qu'est-ce qu'une relation dans Power BI ?", choices: ["Un type de graphique", "Un lien entre deux tables via des colonnes communes", "Une formule DAX", "Un rapport partagé"], correct: 1, explanation: "Une relation connecte deux tables via une colonne clé." },
      { question: "Quelle fonction DAX calcule la somme d'une colonne ?", choices: ["CALCULATE()", "SUMX()", "SUM()", "TOTAL()"], correct: 2, explanation: "SUM(Table[Colonne]) calcule la somme de toutes les valeurs d'une colonne." },
      { question: "Qu'est-ce que le contexte de filtre en DAX ?", choices: ["Un filtre sur les dates uniquement", "L'ensemble des filtres actifs qui influencent un calcul", "Un type de visuel", "Un paramètre de rapport"], correct: 1, explanation: "Le contexte de filtre définit quelles lignes sont visibles lors d'un calcul DAX." },
      { question: "Quel visuel Power BI est le mieux adapté pour montrer l'évolution dans le temps ?", choices: ["Graphique en anneau", "Graphique en courbes", "Jauge", "Treemap"], correct: 1, explanation: "Le graphique en courbes est idéal pour visualiser des tendances dans le temps." },
      { question: "Qu'est-ce que Power Query dans Power BI ?", choices: ["Un langage DAX avancé", "L'outil de transformation et nettoyage de données", "Un type de rapport", "Un connecteur de base de données"], correct: 1, explanation: "Power Query permet de se connecter, transformer et nettoyer les données." },
      { question: "Que fait la fonction CALCULATE() en DAX ?", choices: ["Calcule uniquement des sommes", "Évalue une expression dans un contexte de filtre modifié", "Crée une nouvelle table", "Calcule un pourcentage"], correct: 1, explanation: "CALCULATE est la fonction DAX la plus puissante : elle évalue une expression en modifiant le contexte de filtre." },
    ],
    intermédiaire: [
      { question: "Que fait la fonction RELATED() en DAX ?", choices: ["Crée une relation entre tables", "Retourne une valeur d'une table liée (côté 'un')", "Calcule une moyenne pondérée", "Filtre une table"], correct: 1, explanation: "RELATED() permet d'accéder à une colonne dans une table liée du côté 'un' de la relation." },
      { question: "Quelle est la différence entre ALL() et ALLEXCEPT() en DAX ?", choices: ["Aucune", "ALL supprime tous les filtres, ALLEXCEPT supprime tous sauf ceux spécifiés", "ALLEXCEPT est plus rapide", "ALL fonctionne uniquement sur des colonnes"], correct: 1, explanation: "ALL() supprime tous les filtres. ALLEXCEPT(table, col) supprime tous les filtres sauf ceux des colonnes spécifiées." },
      { question: "Que fait DIVIDE(a, b, c) en DAX ?", choices: ["Divise a par b", "Divise a par b, retourne c si b = 0", "Calcule un pourcentage", "Arrondit le résultat"], correct: 1, explanation: "DIVIDE est la division sécurisée de DAX. Le 3e argument est retourné en cas de division par zéro." },
      { question: "Qu'est-ce qu'un modèle en étoile vs en flocon dans Power BI ?", choices: ["Deux types de visuels", "En étoile : une table de faits + dimensions dénormalisées. En flocon : dimensions normalisées", "Le flocon est plus performant", "Aucune différence pratique"], correct: 1, explanation: "L'étoile a des dimensions dénormalisées (recommandé Power BI). Le flocon a des dimensions normalisées." },
      { question: "Que signifie le mode DirectQuery dans Power BI ?", choices: ["Les données sont importées et mises en cache", "Les requêtes sont envoyées directement à la source à chaque interaction", "Un mode hors ligne", "Un type de licence"], correct: 1, explanation: "En DirectQuery, Power BI génère des requêtes SQL en temps réel vers la source." },
      { question: "Quelle fonction DAX crée un tableau virtuel de dates ?", choices: ["DATE()", "CALENDAR()", "DATERANGE()", "DATELIST()"], correct: 1, explanation: "CALENDAR(date_début, date_fin) crée une table de dates." },
      { question: "Que fait SUMMARIZE() en DAX ?", choices: ["Résume un texte", "Crée un tableau groupé avec des colonnes calculées", "Calcule une médiane", "Filtre les doublons"], correct: 1, explanation: "SUMMARIZE() crée un tableau regroupé similaire à un GROUP BY SQL." },
      { question: "Quel est l'impact des cardinalités élevées sur les performances Power BI ?", choices: ["Aucun impact", "Ralentit le modèle et augmente la mémoire", "Améliore les performances", "Réduit la taille du fichier"], correct: 1, explanation: "Les colonnes à haute cardinalité sont moins bien compressées par Vertipaq, augmentant la mémoire." },
    ],
    expert: [
      { question: "Qu'est-ce que le moteur Vertipaq dans Power BI ?", choices: ["Un type de connecteur", "Le moteur de stockage columnaire en mémoire de Power BI", "Un format de fichier", "Une API REST"], correct: 1, explanation: "Vertipaq est le moteur SSAS Tabular in-memory utilisé par Power BI." },
      { question: "Que fait la fonction KEEPFILTERS() en DAX ?", choices: ["Conserve tous les filtres existants lors d'un CALCULATE", "Supprime les filtres", "Crée un filtre persistant", "Filtre par date"], correct: 0, explanation: "KEEPFILTERS() modifie CALCULATE pour intersecter les filtres au lieu de les remplacer." },
      { question: "Quelle est la différence entre une mesure implicite et explicite ?", choices: ["Aucune", "Implicite : générée automatiquement par glisser-déposer. Explicite : définie manuellement en DAX", "Implicite est plus précise", "Explicite utilise SUM automatiquement"], correct: 1, explanation: "Les mesures implicites sont créées automatiquement. Les mesures explicites sont définies manuellement." },
      { question: "Qu'est-ce que la propagation de filtres bidirectionnelle ?", choices: ["Un filtre qui s'applique dans les deux sens d'une relation", "Un type de segment", "Une fonctionnalité de RLS", "Un type de jointure"], correct: 0, explanation: "La relation bidirectionnelle permet aux filtres de se propager dans les deux sens entre tables." },
      { question: "Que mesure le DAX Studio ?", choices: ["La taille du fichier .pbix", "Les performances des requêtes DAX et les statistiques Vertipaq", "Le nombre d'utilisateurs", "La qualité des visuels"], correct: 1, explanation: "DAX Studio permet d'analyser les requêtes DAX et mesurer les temps de réponse." },
      { question: "Qu'est-ce que le Row-Level Security (RLS) dans Power BI ?", choices: ["Un type de graphique", "Un mécanisme qui restreint l'accès aux données selon l'utilisateur", "Une fonctionnalité de tri", "Un mode de partage"], correct: 1, explanation: "RLS permet de définir des règles DAX qui filtrent les données selon l'identité de l'utilisateur." },
      { question: "Que fait la fonction TREATAS() en DAX ?", choices: ["Crée un arbre de décision", "Applique les valeurs d'une table comme filtres d'une autre", "Calcule une hiérarchie", "Crée une relation virtuelle"], correct: 1, explanation: "TREATAS(table_valeurs, colonne_cible) permet de créer des relations virtuelles." },
      { question: "Quelle est la meilleure pratique pour les tables de dates dans Power BI ?", choices: ["Utiliser une colonne de dates dans la table de faits", "Créer une table de dates dédiée marquée comme 'Date Table'", "Ne pas utiliser de table de dates", "Importer les dates depuis Excel"], correct: 1, explanation: "Une table de dates dédiée, continue, permet d'activer toutes les fonctions Time Intelligence DAX." },
    ],
  },
  python: {
    débutant: [
      { question: "Quelle est la sortie de print(type(3.14)) ?", choices: ["<class 'int'>", "<class 'float'>", "<class 'double'>", "<class 'number'>"], correct: 1, explanation: "3.14 est un nombre décimal, donc de type float en Python." },
      { question: "Que retourne len([1, 2, 3, 4]) ?", choices: ["3", "4", "10", "None"], correct: 1, explanation: "len() retourne le nombre d'éléments dans une liste." },
      { question: "Comment accéder au dernier élément d'une liste ma_liste ?", choices: ["ma_liste[last]", "ma_liste[-1]", "ma_liste[end]", "last(ma_liste)"], correct: 1, explanation: "En Python, les indices négatifs partent de la fin. ma_liste[-1] retourne le dernier élément." },
      { question: "Que fait range(0, 10, 2) ?", choices: ["[0, 2, 4, 6, 8, 10]", "[0, 2, 4, 6, 8]", "[2, 4, 6, 8, 10]", "[0, 10, 2]"], correct: 1, explanation: "range(start, stop, step) génère des nombres de 0 à 9 avec un pas de 2." },
      { question: "Quelle est la différence entre une liste et un tuple en Python ?", choices: ["Aucune", "La liste est mutable, le tuple est immuable", "Le tuple est plus lent", "La liste ne peut contenir que des nombres"], correct: 1, explanation: "Une liste [] est mutable. Un tuple () est immuable." },
      { question: "Que fait la méthode .append() sur une liste ?", choices: ["Supprime un élément", "Ajoute un élément à la fin", "Trie la liste", "Inverse la liste"], correct: 1, explanation: ".append(element) ajoute un élément à la fin de la liste." },
      { question: "Comment créer un dictionnaire en Python ?", choices: ["dict = [clé: valeur]", "dict = {clé: valeur}", "dict = (clé, valeur)", "dict = <clé: valeur>"], correct: 1, explanation: "Un dictionnaire Python utilise des accolades avec des paires clé: valeur." },
      { question: "Que signifie l'opérateur ** en Python ?", choices: ["Multiplication", "Puissance/exponentiation", "Commentaire multiligne", "Décompression de dict"], correct: 1, explanation: "** est l'opérateur de puissance. 2**10 = 1024." },
    ],
    intermédiaire: [
      { question: "Quelle est la complexité temporelle d'une recherche dans un set Python ?", choices: ["O(n)", "O(log n)", "O(1) en moyenne", "O(n²)"], correct: 2, explanation: "Les sets Python utilisent des tables de hachage, offrant une complexité O(1) en moyenne." },
      { question: "Que fait ce code : [x**2 for x in range(5) if x % 2 == 0] ?", choices: ["[0, 4, 16]", "[0, 1, 4, 9, 16]", "[4, 16]", "[1, 9, 25]"], correct: 0, explanation: "Carrés des nombres pairs de 0 à 4 : 0², 2², 4² = 0, 4, 16." },
      { question: "Qu'est-ce qu'un générateur (generator) en Python ?", choices: ["Un type de liste", "Une fonction qui produit les valeurs à la demande avec yield", "Un décorateur", "Une classe abstraite"], correct: 1, explanation: "Un générateur utilise yield au lieu de return. Il produit les valeurs une par une à la demande." },
      { question: "Que fait pandas.DataFrame.groupby() ?", choices: ["Trie les données", "Groupe les lignes par valeurs d'une colonne pour des agrégations", "Fusionne deux DataFrames", "Supprime les NaN"], correct: 1, explanation: "groupby() divise le DataFrame en groupes selon les valeurs d'une colonne." },
      { question: "Quelle est la différence entre .loc et .iloc dans pandas ?", choices: ["Aucune", ".loc utilise les labels, .iloc utilise les positions entières", ".iloc est déprécié", ".loc ne fonctionne pas avec les slices"], correct: 1, explanation: ".loc sélectionne par labels. .iloc sélectionne par positions entières." },
      { question: "Que fait le décorateur @staticmethod en Python ?", choices: ["Rend la méthode privée", "Crée une méthode qui ne reçoit pas self ni cls", "Mémorise le résultat", "Rend la méthode abstraite"], correct: 1, explanation: "@staticmethod définit une méthode qui appartient à la classe mais ne reçoit pas self ni cls." },
      { question: "Qu'est-ce que le GIL (Global Interpreter Lock) en Python ?", choices: ["Un type de variable globale", "Un verrou qui empêche plusieurs threads d'exécuter du bytecode simultanément", "Un module de sécurité", "Un garbage collector"], correct: 1, explanation: "Le GIL est un mutex dans CPython qui n'autorise qu'un seul thread à exécuter du bytecode à la fois." },
      { question: "Que retourne numpy.zeros((3, 4)) ?", choices: ["Une liste de 12 zéros", "Un tableau 3×4 de zéros en float64", "Une erreur", "Un scalaire 0"], correct: 1, explanation: "numpy.zeros((3, 4)) crée un tableau NumPy de 3 lignes et 4 colonnes rempli de 0.0." },
    ],
    expert: [
      { question: "Qu'est-ce que le métaclasse (metaclass) en Python ?", choices: ["Une classe abstraite", "La classe dont les instances sont elles-mêmes des classes", "Un design pattern", "Un type de décorateur"], correct: 1, explanation: "Une métaclasse est la 'classe d'une classe'. type est la métaclasse par défaut de toutes les classes Python." },
      { question: "Que fait functools.lru_cache() ?", choices: ["Crée un cache LRU pour mémoiser les résultats d'une fonction", "Limite la récursion", "Optimise les boucles", "Crée une file d'attente"], correct: 0, explanation: "lru_cache est un décorateur qui mémoïse les résultats d'appels de fonction dans un cache LRU." },
      { question: "Quelle est la complexité de sorted() en Python ?", choices: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], correct: 1, explanation: "Python utilise Timsort, un algorithme hybride avec une complexité O(n log n)." },
      { question: "Qu'est-ce que __slots__ dans une classe Python ?", choices: ["Une liste de méthodes autorisées", "Une déclaration qui remplace __dict__ par des descripteurs fixes, réduisant la mémoire", "Les méthodes dunder disponibles", "Un cache d'attributs"], correct: 1, explanation: "__slots__ empêche la création d'un __dict__ par instance, réduisant la mémoire de ~50%." },
      { question: "Que fait asyncio.gather() ?", choices: ["Rassemble des fichiers", "Lance plusieurs coroutines concurremment et attend leurs résultats", "Gère les exceptions asynchrones", "Crée un event loop"], correct: 1, explanation: "asyncio.gather(*coros) exécute plusieurs coroutines de façon concurrente dans l'event loop." },
      { question: "Quelle est la différence entre deepcopy et copy en Python ?", choices: ["Aucune", "deepcopy copie récursivement tous les objets imbriqués, copy ne copie que le premier niveau", "copy est plus lent", "deepcopy ne fonctionne pas avec les dict"], correct: 1, explanation: "copy.copy() fait une copie superficielle. copy.deepcopy() copie récursivement tous les objets imbriqués." },
      { question: "Qu'est-ce que le protocole de descripteur en Python ?", choices: ["Un protocole réseau", "Des objets qui définissent __get__, __set__, __delete__ pour contrôler l'accès aux attributs", "Une interface REST", "Un type de générateur"], correct: 1, explanation: "Les descripteurs permettent de customiser l'accès aux attributs d'une classe." },
      { question: "Que fait pandas.melt() ?", choices: ["Trie les colonnes", "Transforme un DataFrame 'wide' en format 'long'", "Fusionne deux DataFrames", "Supprime les NaN"], correct: 1, explanation: "melt() pivote le DataFrame de format large vers le format long. L'inverse de pivot_table()." },
    ],
  },
  excel: {
    débutant: [
      { question: "Quelle formule calcule la somme de A1 à A10 ?", choices: ["=TOTAL(A1:A10)", "=SUM(A1:A10)", "=ADD(A1,A10)", "=SOMME(A1-A10)"], correct: 1, explanation: "=SUM(A1:A10) additionne toutes les cellules de la plage A1 à A10." },
      { question: "Que fait la formule =IF(A1>10, \"Oui\", \"Non\") ?", choices: ["Toujours retourne Oui", "Retourne Oui si A1 > 10, sinon Non", "Génère une erreur", "Retourne le nombre 10"], correct: 1, explanation: "=IF évalue une condition. Si A1 est supérieur à 10, retourne 'Oui', sinon 'Non'." },
      { question: "Qu'est-ce qu'une référence absolue dans Excel ?", choices: ["Une cellule en gras", "Une référence qui ne change pas lors de la copie (ex: $A$1)", "Un nom de cellule", "Une formule complexe"], correct: 1, explanation: "Le signe $ bloque la référence. $A$1 est absolue." },
      { question: "Quelle fonction cherche une valeur dans la première colonne d'un tableau ?", choices: ["HLOOKUP", "VLOOKUP", "SEARCH", "FIND"], correct: 1, explanation: "VLOOKUP (RECHERCHEV) cherche verticalement une valeur dans la première colonne." },
      { question: "Que fait CTRL+Z dans Excel ?", choices: ["Enregistrer", "Annuler la dernière action", "Supprimer une ligne", "Zoom"], correct: 1, explanation: "CTRL+Z annule la dernière action." },
      { question: "Qu'est-ce qu'un tableau croisé dynamique (TCD) ?", choices: ["Un tableau avec des couleurs", "Un outil qui résume et agrège des données de façon interactive", "Une formule avancée", "Un graphique 3D"], correct: 1, explanation: "Un TCD (PivotTable) permet de résumer et analyser des données interactivement." },
      { question: "Quelle formule compte le nombre de cellules non vides de A1 à A20 ?", choices: ["=COUNT(A1:A20)", "=COUNTA(A1:A20)", "=COUNTIF(A1:A20)", "=NBVAL(A1:A20)"], correct: 1, explanation: "COUNTA compte les cellules non vides. COUNT ne compte que les cellules avec des nombres." },
      { question: "Comment figer les volets dans Excel ?", choices: ["Accueil > Figer", "Affichage > Figer les volets", "Insertion > Figer", "Données > Figer"], correct: 1, explanation: "Affichage > Figer les volets permet de figer des lignes/colonnes lors du défilement." },
    ],
    intermédiaire: [
      { question: "Quelle est la différence entre VLOOKUP et INDEX/MATCH ?", choices: ["Aucune", "INDEX/MATCH peut chercher à gauche et est plus flexible", "VLOOKUP est plus rapide", "INDEX/MATCH ne fonctionne pas avec du texte"], correct: 1, explanation: "VLOOKUP cherche toujours à droite. INDEX/MATCH peut chercher dans n'importe quelle direction." },
      { question: "Que fait la formule =SUMIFS(C:C, A:A, \"Paris\", B:B, \">100\") ?", choices: ["Compte les villes", "Somme les valeurs de C où A='Paris' ET B>100", "Somme toute la colonne C", "Génère une erreur"], correct: 1, explanation: "SUMIFS somme selon plusieurs critères simultanément." },
      { question: "Qu'est-ce que Power Query dans Excel ?", choices: ["Un type de graphique", "Un outil de connexion, transformation et chargement de données", "Une fonction de recherche", "Un module VBA"], correct: 1, explanation: "Power Query permet de se connecter à des sources, transformer et charger les données dans Excel." },
      { question: "Que retourne =IFERROR(1/0, \"Erreur\") ?", choices: ["#DIV/0!", "0", "Erreur", "1"], correct: 2, explanation: "IFERROR intercepte les erreurs Excel et retourne la valeur alternative." },
      { question: "Quelle est la fonction Excel pour calculer un rang ?", choices: ["=RANK()", "=ORDER()", "=POSITION()", "=SORT()"], correct: 0, explanation: "=RANK(nombre, plage, ordre) retourne le rang d'un nombre dans une liste." },
      { question: "Que fait Ctrl+Maj+Entrée dans Excel (version classique) ?", choices: ["Enregistre le fichier", "Valide une formule matricielle", "Insère une ligne", "Ouvre la mise en forme"], correct: 1, explanation: "Ctrl+Maj+Entrée valide une formule en tant que formule matricielle." },
      { question: "Que fait la fonction TEXT(A1, \"JJ/MM/AAAA\") ?", choices: ["Convertit une date en nombre", "Formate une valeur en texte selon un format spécifié", "Extrait le jour", "Crée une date"], correct: 1, explanation: "TEXT() convertit une valeur numérique ou date en texte formaté." },
      { question: "Comment créer une liste déroulante dans une cellule Excel ?", choices: ["Insertion > Liste", "Données > Validation des données", "Accueil > Format", "Formules > Définir un nom"], correct: 1, explanation: "Données > Validation des données > Liste crée une liste déroulante." },
    ],
    expert: [
      { question: "Que fait la fonction XLOOKUP() par rapport à VLOOKUP() ?", choices: ["Ils font la même chose", "XLOOKUP cherche dans n'importe quelle direction, gère les erreurs et retourne des plages", "VLOOKUP est plus rapide", "XLOOKUP ne fonctionne que dans Office 365"], correct: 1, explanation: "XLOOKUP remplace VLOOKUP et HLOOKUP : cherche dans n'importe quelle direction." },
      { question: "Qu'est-ce qu'une formule dynamique dans Excel 365 ?", choices: ["Une formule qui change automatiquement", "Une formule qui se déverse dans des cellules adjacentes automatiquement", "Une formule avec des références absolues", "Une formule conditionnelle"], correct: 1, explanation: "Les formules dynamiques d'Excel 365 peuvent retourner automatiquement plusieurs résultats qui se 'déversent'." },
      { question: "Que fait la fonction LAMBDA() dans Excel 365 ?", choices: ["Crée une liste Lambda", "Permet de définir des fonctions personnalisées réutilisables sans VBA", "Calcule une valeur conditionnelle", "Filtre des données"], correct: 1, explanation: "LAMBDA() permet de créer des fonctions personnalisées nommées directement en Excel, sans VBA." },
      { question: "Quelle est la différence entre un modèle de données Excel et des plages normales ?", choices: ["Aucune", "Le modèle de données permet des relations entre tables et des mesures DAX", "Le modèle de données est plus lent", "Les plages normales supportent plus de lignes"], correct: 1, explanation: "Le modèle de données Power Pivot permet des relations entre tables et des mesures DAX." },
      { question: "Que fait SEQUENCE(5, 3) dans Excel 365 ?", choices: ["Crée une séquence de 5 à 3", "Génère un tableau de 5 lignes et 3 colonnes avec des valeurs séquentielles", "Génère 5 puis 3", "Crée 15 cellules aléatoires"], correct: 1, explanation: "SEQUENCE(lignes, colonnes) génère un tableau de nombres séquentiels." },
      { question: "Comment optimiser les performances d'un classeur Excel volumineux ?", choices: ["Utiliser plus de formules VLOOKUP", "Éviter les colonnes entières dans les références, utiliser des tableaux structurés", "Ajouter plus de feuilles", "Fusionner toutes les cellules"], correct: 1, explanation: "Les bonnes pratiques : références précises (pas A:A), tableaux structurés, calcul manuel pour grands modèles." },
      { question: "Que fait la formule =FILTER(A1:C10, B1:B10>100) dans Excel 365 ?", choices: ["Filtre visuellement le tableau", "Retourne dynamiquement les lignes où B>100", "Compte les lignes", "Trie le tableau"], correct: 1, explanation: "FILTER() est une fonction dynamique qui extrait les lignes d'une plage selon un critère." },
      { question: "Qu'est-ce que le spill range error (#SPILL!) dans Excel 365 ?", choices: ["Une erreur de syntaxe", "Une formule dynamique ne peut pas se déverser car des cellules sont occupées", "Une erreur de référence circulaire", "Une erreur de valeur"], correct: 1, explanation: "#SPILL! se produit quand une formule dynamique tente de se déverser dans des cellules déjà occupées." },
    ],
  },
};

// ─── Progress helpers ─────────────────────────────────────────────────────────
const STORAGE_KEY = 'dc_progress_v3';
const loadProgress = (): Progress => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } };
const saveProgress = (p: Progress) => localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
const isUnlocked = (tech: TechKey, diff: Difficulty, p: Progress) =>
  diff === 'débutant' ? true :
  diff === 'intermédiaire' ? !!(p[tech]?.['débutant']?.completed) :
  !!(p[tech]?.['intermédiaire']?.completed);
const calcStars = (correct: number, total: number) =>
  correct / total >= 0.875 ? 3 : correct / total >= 0.625 ? 2 : correct / total >= 0.375 ? 1 : 0;
const totalXP = (p: Progress) =>
  (Object.keys(TECH_CONFIG) as TechKey[]).flatMap(t => DIFFICULTIES.map(d => p[t]?.[d]?.xp ?? 0)).reduce((a, b) => a + b, 0);

// ─── Canvas dungeon drawing ───────────────────────────────────────────────────
const ROOM_X = [180, 400, 620];
const CORR_Y = 280; // corridor center Y
const CORR_H = 70;
const ROOM_TOP = 30;
const ROOM_H = 180;
const ROOM_W = 130;

function drawDungeon(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  char: CharState,
  tech: TechKey,
  progress: Progress,
  nearRoom: Difficulty | null,
  ts: number
) {
  const cfg = TECH_CONFIG[tech];
  const { r, g, b } = cfg;
  const glow = (Math.sin(ts * 0.002) + 1) / 2;

  // ── Background ──
  ctx.fillStyle = '#060810';
  ctx.fillRect(0, 0, W, H);

  // Subtle pixel grid
  ctx.strokeStyle = `rgba(${r},${g},${b},0.06)`;
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // ── Corridor floor ──
  const cy = CORR_Y - CORR_H / 2;
  for (let x = 0; x < W; x += 32) {
    const shade = (Math.floor(x / 32) % 2 === 0) ? '#14142a' : '#111125';
    ctx.fillStyle = shade;
    ctx.fillRect(x, cy, 32, CORR_H);
  }

  // Corridor top/bottom stone walls
  ctx.fillStyle = '#0a0a18';
  ctx.fillRect(0, cy - 28, W, 28);
  ctx.fillRect(0, cy + CORR_H, W, 28);

  // Wall stone bricks
  ctx.strokeStyle = `rgba(${r},${g},${b},0.12)`;
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 24) {
    ctx.strokeRect(x + 1, cy - 27, 22, 12);
    ctx.strokeRect(x + 13, cy - 14, 22, 13);
    ctx.strokeRect(x + 1, cy + CORR_H + 1, 22, 13);
    ctx.strokeRect(x + 13, cy + CORR_H + 14, 22, 13);
  }

  // Wall glow lines
  ctx.strokeStyle = `rgba(${r},${g},${b},0.35)`;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, cy + CORR_H); ctx.lineTo(W, cy + CORR_H); ctx.stroke();

  // ── Torches on corridor walls ──
  const torchPositions = [80, 290, 510, 720];
  torchPositions.forEach(tx => {
    const flicker = 0.7 + Math.sin(ts * 0.004 + tx) * 0.3;
    // Torch bracket
    ctx.fillStyle = '#5c3317';
    ctx.fillRect(tx - 3, cy - 20, 6, 12);
    // Flame
    const grad = ctx.createRadialGradient(tx, cy - 24, 0, tx, cy - 24, 14 * flicker);
    grad.addColorStop(0, `rgba(255,220,80,${flicker})`);
    grad.addColorStop(0.4, `rgba(255,100,20,${flicker * 0.8})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(tx, cy - 24, 14 * flicker, 0, Math.PI * 2);
    ctx.fill();
    // Bottom torch
    ctx.fillStyle = '#5c3317';
    ctx.fillRect(tx - 3, cy + CORR_H + 8, 6, 12);
    const grad2 = ctx.createRadialGradient(tx, cy + CORR_H + 28, 0, tx, cy + CORR_H + 28, 12 * flicker);
    grad2.addColorStop(0, `rgba(255,220,80,${flicker})`);
    grad2.addColorStop(0.4, `rgba(255,100,20,${flicker * 0.8})`);
    grad2.addColorStop(1, 'transparent');
    ctx.fillStyle = grad2;
    ctx.beginPath();
    ctx.arc(tx, cy + CORR_H + 28, 12 * flicker, 0, Math.PI * 2);
    ctx.fill();
  });

  // ── Boss rooms ──
  DIFFICULTIES.forEach((diff, i) => {
    const rx = ROOM_X[i];
    const unlocked = isUnlocked(tech, diff, progress);
    const stageData = progress[tech]?.[diff];
    const completed = stageData?.completed ?? false;
    const stars = stageData?.stars ?? 0;
    const boss = BOSSES[tech][diff];
    const meta = DIFF_META[diff];
    const isNear = nearRoom === diff;

    // Passage connecting room to corridor
    const passW = 46;
    ctx.fillStyle = unlocked ? '#14142a' : '#0a0a18';
    ctx.fillRect(rx - passW / 2, ROOM_TOP + ROOM_H, passW, cy - (ROOM_TOP + ROOM_H));

    // Passage walls
    ctx.fillStyle = '#0a0a18';
    ctx.fillRect(rx - passW / 2 - 8, ROOM_TOP + ROOM_H, 8, cy - (ROOM_TOP + ROOM_H));
    ctx.fillRect(rx + passW / 2, ROOM_TOP + ROOM_H, 8, cy - (ROOM_TOP + ROOM_H));

    // Door glow at corridor entrance
    if (unlocked) {
      const doorGlow = isNear ? 1 : glow * 0.6 + 0.4;
      const dg = ctx.createLinearGradient(rx, cy - 30, rx, cy + 5);
      dg.addColorStop(0, `rgba(${r},${g},${b},${doorGlow * 0.9})`);
      dg.addColorStop(1, 'transparent');
      ctx.fillStyle = dg;
      ctx.fillRect(rx - passW / 2, cy - 30, passW, 32);

      // Door frame glow
      ctx.strokeStyle = `rgba(${r},${g},${b},${doorGlow})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(rx - passW / 2, cy - 28, passW, 28);
    }

    // Room background
    const roomX = rx - ROOM_W / 2;
    const alpha = unlocked ? 0.9 : 0.4;
    ctx.fillStyle = `rgba(18,15,35,${alpha})`;
    ctx.fillRect(roomX, ROOM_TOP, ROOM_W, ROOM_H);

    // Room border
    const borderAlpha = unlocked ? (isNear ? 1 : glow * 0.6 + 0.4) : 0.2;
    ctx.strokeStyle = unlocked
      ? `rgba(${r},${g},${b},${borderAlpha})`
      : 'rgba(80,80,80,0.3)';
    ctx.lineWidth = isNear ? 3 : 2;
    ctx.strokeRect(roomX, ROOM_TOP, ROOM_W, ROOM_H);

    // Room inner glow (top)
    if (unlocked) {
      const ig = ctx.createLinearGradient(rx, ROOM_TOP, rx, ROOM_TOP + 40);
      ig.addColorStop(0, `rgba(${r},${g},${b},${glow * 0.15})`);
      ig.addColorStop(1, 'transparent');
      ctx.fillStyle = ig;
      ctx.fillRect(roomX, ROOM_TOP, ROOM_W, 40);
    }

    // Boss emoji
    ctx.font = `${unlocked ? 42 : 32}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = unlocked ? 1 : 0.25;
    ctx.fillText(unlocked ? boss.emoji : '🔒', rx, ROOM_TOP + ROOM_H * 0.42);
    ctx.globalAlpha = 1;

    // Boss name
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = unlocked ? cfg.color : '#4b5563';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(boss.name.toUpperCase(), rx, ROOM_TOP + ROOM_H - 36);

    // Difficulty label
    ctx.font = '9px monospace';
    ctx.fillStyle = unlocked ? `rgba(${r},${g},${b},0.7)` : '#374151';
    ctx.fillText(`${meta.icon} ${meta.label.toUpperCase()}`, rx, ROOM_TOP + ROOM_H - 22);

    // Stars
    if (completed) {
      ctx.font = '11px serif';
      ctx.fillText('⭐'.repeat(stars), rx, ROOM_TOP + 18);
    }

    // "ENTRER" prompt if near
    if (isNear && unlocked) {
      const pulse = Math.sin(ts * 0.006) * 0.3 + 0.7;
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = `rgba(${r},${g},${b},${pulse})`;
      ctx.fillText('[ENTRER]', rx, cy - 36);
    }
  });

  // ── Character sprite ──
  drawCharacter(ctx, char.x, char.y, char.dir, char.frame, r, g, b);
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  dir: CharState['dir'], frame: number,
  r: number, g: number, b: number
) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));

  const walk = frame % 2 === 0;
  const legL = walk ? 4 : -2;
  const legR = walk ? -2 : 4;
  const armL = walk ? -3 : 2;
  const armR = walk ? 2 : -3;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(0, 18, 9, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  ctx.fillStyle = '#3b2510';
  ctx.fillRect(-6, 6 + legL, 5, 12);
  ctx.fillRect(1, 6 + legR, 5, 12);

  // Boot tips
  ctx.fillStyle = '#5c3317';
  ctx.fillRect(-8, 14 + legL, 7, 4);
  ctx.fillRect(-1, 14 + legR, 7, 4);

  // Body — armor
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(-7, -6, 14, 14);

  // Armor shading
  ctx.fillStyle = `rgba(0,0,0,0.3)`;
  ctx.fillRect(2, -6, 5, 14);
  ctx.fillStyle = `rgba(255,255,255,0.15)`;
  ctx.fillRect(-7, -6, 5, 6);

  // Belt
  ctx.fillStyle = '#4a3010';
  ctx.fillRect(-7, 6, 14, 3);
  ctx.fillStyle = '#c0a000';
  ctx.fillRect(-2, 6, 4, 3);

  // Arms
  ctx.fillStyle = `rgb(${Math.min(255, r + 20)},${Math.min(255, g + 20)},${Math.min(255, b + 20)})`;
  ctx.fillRect(-12, -4 + armL, 5, 9);
  ctx.fillRect(7, -4 + armR, 5, 9);

  // Sword (right hand)
  if (dir === 'right' || dir === 'up' || dir === 'down') {
    ctx.fillStyle = '#c8c8d0';
    ctx.fillRect(11, -12 + armR, 2, 14);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(11, 1 + armR, 2, 4);
    ctx.fillStyle = '#a0800a';
    ctx.fillRect(8, -1 + armR, 8, 2);
  } else {
    ctx.fillStyle = '#c8c8d0';
    ctx.fillRect(-13, -12 + armL, 2, 14);
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-13, 1 + armL, 2, 4);
    ctx.fillStyle = '#a0800a';
    ctx.fillRect(-16, -1 + armL, 8, 2);
  }

  // Head
  ctx.fillStyle = '#f5c58a';
  ctx.fillRect(-5, -18, 10, 13);

  // Hair / helmet
  ctx.fillStyle = `rgb(${Math.floor(r * 0.5)},${Math.floor(g * 0.5)},${Math.floor(b * 0.5)})`;
  ctx.fillRect(-6, -20, 12, 7);
  ctx.fillRect(-7, -17, 3, 5);
  ctx.fillRect(4, -17, 3, 5);

  // Helmet plume
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(-1, -24, 2, 6);

  // Eyes — depend on direction
  ctx.fillStyle = '#1a1235';
  if (dir === 'right') {
    ctx.fillRect(1, -13, 2, 2);
    ctx.fillRect(4, -13, 2, 2);
  } else if (dir === 'left') {
    ctx.fillRect(-6, -13, 2, 2);
    ctx.fillRect(-3, -13, 2, 2);
  } else {
    ctx.fillRect(-2, -13, 2, 2);
    ctx.fillRect(1, -13, 2, 2);
  }

  ctx.restore();
}

// ─── Dungeon canvas component ─────────────────────────────────────────────────
interface DungeonProps {
  tech: TechKey;
  progress: Progress;
  onEnterRoom: (diff: Difficulty) => void;
}

function DungeonCanvas({ tech, progress, onEnterRoom }: DungeonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const charRef = useRef<CharState>({
    x: 60, y: CORR_Y,
    dir: 'right', frame: 0, frameTimer: 0,
    moving: false, targetX: 60, targetY: CORR_Y,
    phase: 'corridor', enteringRoom: null,
  });
  const nearRoomRef = useRef<Difficulty | null>(null);
  const [nearRoom, setNearRoom] = useState<Difficulty | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const startTs = useRef(performance.now());

  // Check proximity to room doors
  const checkProximity = useCallback((cx: number) => {
    let found: Difficulty | null = null;
    DIFFICULTIES.forEach((diff, i) => {
      const dx = Math.abs(cx - ROOM_X[i]);
      if (dx < 28 && isUnlocked(tech, diff, progress)) found = diff;
    });
    if (found !== nearRoomRef.current) {
      nearRoomRef.current = found;
      setNearRoom(found);
    }
  }, [tech, progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const loop = (ts: number) => {
      const elapsed = ts - startTs.current;
      const char = charRef.current;
      const SPEED = 2.5;
      const W = canvas.width;
      const H = canvas.height;

      // ── Handle keyboard movement ──
      if (keysRef.current.has('ArrowRight') || keysRef.current.has('d')) {
        char.targetX = Math.min(W - 40, char.targetX + SPEED);
        char.dir = 'right';
        char.moving = true;
      } else if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a')) {
        char.targetX = Math.max(40, char.targetX - SPEED);
        char.dir = 'left';
        char.moving = true;
      } else {
        char.moving = false;
      }

      // ── Handle "Enter" key ──
      if ((keysRef.current.has('Enter') || keysRef.current.has(' ')) && nearRoomRef.current) {
        onEnterRoom(nearRoomRef.current);
        return;
      }

      // ── Move character toward target (click-to-move) ──
      const dx = char.targetX - char.x;
      const dy = char.targetY - char.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        const spd = Math.min(SPEED, dist);
        char.x += (dx / dist) * spd;
        char.y += (dy / dist) * spd;
        if (dx > 0.5) char.dir = 'right';
        else if (dx < -0.5) char.dir = 'left';
        char.moving = true;
      } else {
        char.x = char.targetX;
        char.y = char.targetY;
        if (!keysRef.current.has('ArrowRight') && !keysRef.current.has('ArrowLeft') &&
            !keysRef.current.has('a') && !keysRef.current.has('d')) {
          char.moving = false;
        }
      }

      // ── Walk animation ──
      if (char.moving) {
        char.frameTimer += 1;
        if (char.frameTimer >= 10) { char.frame = (char.frame + 1) % 4; char.frameTimer = 0; }
      }

      checkProximity(char.x);

      // ── Draw ──
      drawDungeon(ctx, W, H, char, tech, progress, nearRoomRef.current, elapsed);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    // Keyboard handlers
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => { keysRef.current.delete(e.key); };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Click-to-move on canvas
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const cx = (e.clientX - rect.left) * scaleX;
      const cy = (e.clientY - rect.top) * scaleY;
      // Only allow clicking in corridor zone
      const corrTop = CORR_Y - CORR_H / 2;
      const corrBot = CORR_Y + CORR_H / 2;
      if (cy >= corrTop - 20 && cy <= corrBot + 20) {
        charRef.current.targetX = Math.max(40, Math.min(canvas.width - 40, cx));
        charRef.current.targetY = CORR_Y;
      }
      // Click on room → walk to door + enter
      DIFFICULTIES.forEach((diff, i) => {
        const roomX = ROOM_X[i];
        const rx = roomX - ROOM_W / 2;
        if (cx >= rx && cx <= rx + ROOM_W && cy >= ROOM_TOP && cy <= ROOM_TOP + ROOM_H) {
          if (isUnlocked(tech, diff, progress)) {
            charRef.current.targetX = roomX;
            charRef.current.targetY = CORR_Y;
            setTimeout(() => {
              if (Math.abs(charRef.current.x - roomX) < 40) onEnterRoom(diff);
            }, 1200);
          }
        }
      });
    };
    canvas.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('click', onClick);
    };
  }, [tech, progress, checkProximity, onEnterRoom]);

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={350}
        className="w-full rounded-sm"
        style={{ imageRendering: 'pixelated', cursor: 'crosshair' }}
      />
      {/* Near room action button */}
      <AnimatePresence>
        {nearRoom && (
          <motion.button
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            onClick={() => onEnterRoom(nearRoom)}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 font-black text-sm text-black flex items-center gap-2 shadow-lg"
            style={{ background: TECH_CONFIG[tech].color }}
          >
            <Swords size={14} />
            AFFRONTER {BOSSES[tech][nearRoom].name.toUpperCase()}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ count, size = 16 }: { count: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map(i => (
        <Star key={i} size={size} fill={i <= count ? '#F59E0B' : 'none'} className={i <= count ? 'text-amber-400' : 'text-gray-600'} />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DataChallenge() {
  const [, setLocation] = useLocation();
  const [screen, setScreen] = useState<Screen>('dungeon');
  const [activeTech, setActiveTech] = useState<TechKey>('sql');
  const [selectedDiff, setSelectedDiff] = useState<Difficulty | null>(null);
  const [progress, setProgress] = useState<Progress>(loadProgress);

  // Battle state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [lives, setLives] = useState(3);
  const [bossHpPct, setBossHpPct] = useState(100);
  const [combo, setCombo] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [flash, setFlash] = useState<'hit' | 'miss' | null>(null);
  const [bossShake, setBossShake] = useState(false);
  const [floatXP, setFloatXP] = useState<{ v: number; id: number } | null>(null);
  const floatId = useRef(0);

  const tech = TECH_CONFIG[activeTech];
  const boss = selectedDiff ? BOSSES[activeTech][selectedDiff] : null;
  const currentQ = questions[qIdx];
  const totalQ = questions.length;

  useEffect(() => { saveProgress(progress); }, [progress]);

  // Timer
  useEffect(() => {
    if (screen !== 'battle' || answered || !currentQ) return;
    if (timeLeft <= 0) { handleAnswer(-1); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, answered, screen, currentQ]);

  const startBattle = useCallback((diff: Difficulty) => {
    const bank = QUESTION_BANK[activeTech][diff];
    const qs = [...bank].sort(() => Math.random() - 0.5).slice(0, 8);
    setQuestions(qs);
    setQIdx(0);
    setLives(3);
    setBossHpPct(100);
    setCombo(0);
    setXpEarned(0);
    setCorrectCount(0);
    setSelected(null);
    setAnswered(false);
    setTimeLeft(30);
    setFlash(null);
    setSelectedDiff(diff);
    setScreen('battle');
  }, [activeTech]);

  const handleAnswer = useCallback((idx: number) => {
    if (answered || !currentQ || !selectedDiff) return;
    setSelected(idx);
    setAnswered(true);
    const isCorrect = idx === currentQ.correct;
    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      const mult = Math.min(newCombo, 4);
      const xp = BASE_XP * mult * DIFF_META[selectedDiff].xpMult;
      setXpEarned(p => p + xp);
      setCorrectCount(p => p + 1);
      setBossHpPct(p => Math.max(0, p - Math.floor(100 / totalQ)));
      setFlash('hit');
      floatId.current += 1;
      setFloatXP({ v: xp, id: floatId.current });
      setTimeout(() => setFloatXP(null), 1200);
      setBossShake(true);
      setTimeout(() => setBossShake(false), 500);
    } else {
      setCombo(0);
      setLives(p => p - 1);
      setFlash('miss');
      if (lives - 1 <= 0) setTimeout(() => setScreen('defeat'), 1200);
    }
    setTimeout(() => setFlash(null), 400);
  }, [answered, currentQ, selectedDiff, combo, totalQ, lives]);

  const nextQuestion = useCallback(() => {
    const lastCorrect = selected === currentQ?.correct;
    if (qIdx + 1 >= totalQ || lives <= 0) {
      const finalCorrect = correctCount + (lastCorrect ? 1 : 0);
      const stars = calcStars(finalCorrect, totalQ);
      const won = lives > 0;
      if (won && selectedDiff) {
        setProgress(prev => {
          const next = { ...prev };
          if (!next[activeTech]) next[activeTech] = {};
          const existing = next[activeTech]![selectedDiff];
          next[activeTech]![selectedDiff] = {
            completed: true,
            stars: Math.max(stars, existing?.stars ?? 0),
            xp: Math.max(xpEarned, existing?.xp ?? 0),
          };
          return next;
        });
        setScreen('victory');
      } else {
        setScreen('defeat');
      }
    } else {
      setQIdx(i => i + 1);
      setSelected(null);
      setAnswered(false);
      setTimeLeft(30);
    }
  }, [qIdx, totalQ, lives, correctCount, selected, currentQ, selectedDiff, xpEarned, activeTech]);

  const backToDungeon = () => { setScreen('dungeon'); setSelectedDiff(null); };

  const lvl = Math.floor(totalXP(progress) / 500) + 1;

  // ── DUNGEON SCREEN ──────────────────────────────────────────────────────────
  if (screen === 'dungeon') {
    return (
      <div className="min-h-screen text-white" style={{ background: '#07080f' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <button onClick={() => setLocation('/data-ia')} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
            <ArrowLeft size={16} /> Retour
          </button>
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest font-bold" style={{ color: tech.color }}>
              ⚔️ {tech.world}
            </span>
          </div>
          <div className="flex items-center gap-2 text-amber-400">
            <Crown size={14} />
            <span className="text-xs font-black">LVL {lvl}</span>
            <span className="text-xs text-yellow-300">· {totalXP(progress)} XP</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-5">
          {/* Tech world tabs */}
          <div className="flex gap-2 mb-5 flex-wrap justify-center">
            {(Object.entries(TECH_CONFIG) as [TechKey, typeof TECH_CONFIG[TechKey]][]).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const active = activeTech === key;
              return (
                <button key={key} onClick={() => setActiveTech(key)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold border-2 transition-all duration-150"
                  style={{
                    borderColor: active ? cfg.color : 'rgba(255,255,255,0.1)',
                    background: active ? `${cfg.color}18` : 'transparent',
                    color: active ? cfg.color : '#6b7280',
                  }}>
                  <Icon size={13} /> {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Instructions */}
          <div className="text-center text-xs text-gray-500 mb-3">
            Clique sur une salle ou marche jusqu'à une porte · ← → pour marcher · [Entrée] pour attaquer
          </div>

          {/* Dungeon canvas */}
          <div className="border border-white/10 overflow-hidden" style={{ borderColor: `${tech.color}25` }}>
            <DungeonCanvas
              tech={activeTech}
              progress={progress}
              onEnterRoom={startBattle}
            />
          </div>

          {/* Stage legend */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            {DIFFICULTIES.map((diff, i) => {
              const unlocked = isUnlocked(activeTech, diff, progress);
              const stageData = progress[activeTech]?.[diff];
              const boss = BOSSES[activeTech][diff];
              const meta = DIFF_META[diff];
              return (
                <div key={diff}
                  className="p-3 border flex items-center gap-3 transition-all duration-150 cursor-pointer"
                  style={{
                    borderColor: unlocked ? `${tech.color}35` : 'rgba(255,255,255,0.07)',
                    background: unlocked ? `${tech.color}06` : 'transparent',
                    opacity: unlocked ? 1 : 0.45,
                  }}
                  onClick={() => unlocked && startBattle(diff)}>
                  <span className="text-2xl">{unlocked ? boss.emoji : '🔒'}</span>
                  <div>
                    <div className="text-xs font-black" style={{ color: unlocked ? tech.color : '#4b5563' }}>
                      {meta.icon} {meta.label}
                    </div>
                    <div className="text-xs text-gray-400">{boss.name}</div>
                    {stageData?.completed && <Stars count={stageData.stars} size={10} />}
                  </div>
                  {unlocked && !stageData?.completed && (
                    <ChevronRight size={14} className="ml-auto" style={{ color: tech.color }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── BATTLE SCREEN ───────────────────────────────────────────────────────────
  if (screen === 'battle' && currentQ && boss && selectedDiff) {
    const mult = Math.min(combo + 1, 4);
    const timerPct = (timeLeft / 30) * 100;
    const timerColor = timeLeft <= 10 ? '#EF4444' : timeLeft <= 20 ? '#F59E0B' : '#10B981';
    const { r, g, b } = tech;

    return (
      <div className="min-h-screen relative overflow-hidden text-white select-none"
        style={{ background: `rgb(${Math.floor(r * 0.04)}, ${Math.floor(g * 0.04)}, ${Math.floor(b * 0.06)})` }}>

        <AnimatePresence>
          {flash && (
            <motion.div key={flash} className="absolute inset-0 z-50 pointer-events-none"
              initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
              style={{ background: flash === 'hit' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.35)' }} />
          )}
        </AnimatePresence>

        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(${tech.color}50 1px, transparent 1px), linear-gradient(90deg, ${tech.color}50 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />

        {/* HUD */}
        <div className="relative z-10 px-5 py-3 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} size={20} fill={i < lives ? '#EF4444' : 'none'} className={i < lives ? 'text-red-500' : 'text-gray-700'} />
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-gray-500">{qIdx + 1}/{totalQ}</span>
            {combo >= 2 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="px-2 py-0.5 font-black text-black text-xs flex items-center gap-1"
                style={{ background: combo >= 4 ? '#EF4444' : combo >= 3 ? '#F59E0B' : '#8B5CF6' }}>
                <Flame size={10} /> ×{mult}
              </motion.div>
            )}
            <span className="text-yellow-300 flex items-center gap-1"><Zap size={11} />{xpEarned}</span>
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-5 py-6 grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Boss side */}
          <div className="md:col-span-2 flex flex-col items-center">
            <div className="w-full mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-black" style={{ color: tech.color }}>{boss.name}</span>
                <span className="text-red-400 font-bold">{bossHpPct}%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full"
                  animate={{ width: `${bossHpPct}%` }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  style={{ background: bossHpPct > 50 ? '#EF4444' : bossHpPct > 25 ? '#F59E0B' : '#10B981' }} />
              </div>
            </div>

            <motion.div
              animate={bossShake ? { x: [-8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center py-8 px-4 border-2 relative overflow-hidden"
              style={{ borderColor: `${tech.color}50`, background: `${tech.color}08` }}>

              <AnimatePresence>
                {floatXP && (
                  <motion.div key={floatXP.id}
                    className="absolute top-4 right-4 font-black text-lg pointer-events-none z-20"
                    style={{ color: tech.color }}
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: -50, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2 }}>
                    +{floatXP.v} {mult > 1 && `×${mult}`}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-8xl mb-3 leading-none">{boss.emoji}</div>
              <div className="font-black text-xl text-center mb-1">{boss.name}</div>
              <div className="text-xs text-center mb-4" style={{ color: tech.color }}>{boss.title}</div>
              <p className="text-xs text-gray-500 text-center italic leading-relaxed">{boss.lore}</p>

              {/* Timer */}
              <div className="mt-5 relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                  <circle cx="28" cy="28" r="22" fill="none" strokeWidth="5"
                    stroke={timerColor}
                    strokeDasharray={`${2 * Math.PI * 22}`}
                    strokeDashoffset={`${2 * Math.PI * 22 * (1 - timerPct / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-black">{timeLeft}</span>
              </div>
            </motion.div>
          </div>

          {/* Question side */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div key={qIdx}
                initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                exit={{ x: -40, opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="mb-4 p-5 border border-white/10 bg-white/5">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: tech.color }}>
                    Question {qIdx + 1} · {DIFF_META[selectedDiff].label}
                  </p>
                  <p className="text-base font-bold text-white leading-relaxed">{currentQ.question}</p>
                </div>
                <div className="space-y-3">
                  {currentQ.choices.map((choice, i) => {
                    const isCorrect = i === currentQ.correct;
                    const isSel = i === selected;
                    let brd = 'rgba(255,255,255,0.12)', bg = 'rgba(255,255,255,0.04)', tc = '#d1d5db';
                    if (answered) {
                      if (isCorrect) { brd = '#10B981'; bg = 'rgba(16,185,129,0.15)'; tc = '#6ee7b7'; }
                      else if (isSel) { brd = '#EF4444'; bg = 'rgba(239,68,68,0.15)'; tc = '#fca5a5'; }
                      else { brd = 'rgba(255,255,255,0.05)'; bg = 'transparent'; tc = '#374151'; }
                    }
                    return (
                      <motion.button key={i}
                        whileHover={!answered ? { x: 5 } : {}}
                        whileTap={!answered ? { scale: 0.98 } : {}}
                        onClick={() => handleAnswer(i)}
                        disabled={answered}
                        className="w-full text-left px-4 py-3 border-2 flex items-center gap-3 text-sm font-medium transition-all duration-100"
                        style={{ borderColor: brd, background: bg, color: tc }}>
                        <span className="flex-shrink-0 w-6 h-6 border flex items-center justify-center text-xs font-black"
                          style={{ borderColor: brd }}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        {choice}
                      </motion.button>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {answered && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
                      <div className={`p-3 border-l-4 text-sm ${selected === currentQ.correct ? 'border-emerald-500 bg-emerald-900/20 text-emerald-200' : 'border-red-500 bg-red-900/20 text-red-200'}`}>
                        <span className="font-black">{selected === currentQ.correct ? '⚡ TOUCHÉ ! ' : '💥 RATÉ ! '}</span>
                        {currentQ.explanation}
                      </div>
                      <button onClick={nextQuestion}
                        className="w-full py-3 font-black text-black flex items-center justify-center gap-2"
                        style={{ background: tech.color }}>
                        {qIdx + 1 >= totalQ ? <><Trophy size={15} /> FIN DE BATAILLE</> : <>COUP SUIVANT <ChevronRight size={15} /></>}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // ── VICTORY ──────────────────────────────────────────────────────────────────
  if (screen === 'victory' && boss && selectedDiff) {
    const stars = progress[activeTech]?.[selectedDiff]?.stars ?? 0;
    const nextDiff: Difficulty | null = selectedDiff === 'débutant' ? 'intermédiaire' : selectedDiff === 'intermédiaire' ? 'expert' : null;
    return (
      <div className="min-h-screen flex items-center justify-center text-white" style={{ background: '#070810' }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(${tech.color}50 1px, transparent 1px), linear-gradient(90deg, ${tech.color}50 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        <motion.div className="relative z-10 max-w-md w-full mx-6 text-center"
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
          <motion.div className="text-8xl mb-4 leading-none"
            animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.6, delay: 0.3 }}>
            💀
          </motion.div>
          <h2 className="text-3xl font-black mb-1" style={{ color: tech.color }}>BOSS VAINCU !</h2>
          <p className="text-gray-400 mb-6 text-sm">{boss.name} a été défait dans {tech.world}</p>
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map(s => (
              <motion.div key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + s * 0.15, type: 'spring' }}>
                <Star size={40} fill={s <= stars ? '#F59E0B' : 'none'} className={s <= stars ? 'text-amber-400' : 'text-gray-700'} />
              </motion.div>
            ))}
          </div>
          <div className="border-2 p-5 mb-6 space-y-2 text-sm" style={{ borderColor: `${tech.color}40`, background: `${tech.color}08` }}>
            <div className="flex justify-between"><span className="text-gray-400">Réponses correctes</span><span className="font-black">{correctCount}/{totalQ}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">XP gagnés</span><span className="font-black text-yellow-300">+{xpEarned} XP</span></div>
            {nextDiff && (
              <motion.div className="pt-2 border-t border-white/10 font-bold text-xs" style={{ color: tech.color }}
                animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                🔓 {BOSSES[activeTech][nextDiff].name} débloqué dans le donjon !
              </motion.div>
            )}
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => startBattle(selectedDiff)}
              className="px-5 py-3 font-bold text-sm border-2 hover:bg-white/5 flex items-center gap-2"
              style={{ borderColor: tech.color, color: tech.color }}>
              <RotateCcw size={13} /> Rejouer
            </button>
            <button onClick={backToDungeon}
              className="px-6 py-3 font-bold text-sm text-black flex items-center gap-2"
              style={{ background: tech.color }}>
              <Swords size={13} /> Retour au donjon
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── DEFEAT ───────────────────────────────────────────────────────────────────
  if (screen === 'defeat' && boss && selectedDiff) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white" style={{ background: '#0a0000' }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(#ef444440 1px, transparent 1px), linear-gradient(90deg, #ef444440 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <motion.div className="relative z-10 max-w-sm w-full mx-6 text-center"
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
          <motion.div className="text-8xl mb-4 leading-none"
            animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity }}>
            {boss.emoji}
          </motion.div>
          <h2 className="text-4xl font-black mb-2 text-red-500">DÉFAITE</h2>
          <p className="text-gray-400 mb-1 text-sm">{boss.name} vous a vaincu...</p>
          <p className="text-gray-600 text-xs mb-8">{correctCount}/{totalQ} réponses · {xpEarned} XP</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => startBattle(selectedDiff)}
              className="px-8 py-4 font-black text-black flex items-center gap-2" style={{ background: '#EF4444' }}>
              <RotateCcw size={16} /> RÉESSAYER
            </button>
            <button onClick={backToDungeon}
              className="px-5 py-4 font-bold border border-white/20 hover:bg-white/5 transition-colors flex items-center gap-2">
              <ArrowLeft size={14} /> Donjon
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
