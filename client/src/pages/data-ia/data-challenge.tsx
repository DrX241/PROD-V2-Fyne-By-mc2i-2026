import { useRef, useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Zap, Trophy, RotateCcw, ArrowLeft, Database, Code2, BarChart3, Table2, Swords, ChevronRight, Flame, Crown, Shield } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type TechKey = 'sql' | 'powerbi' | 'python' | 'excel';
type Difficulty = 'débutant' | 'intermédiaire' | 'expert';
type Screen = 'dungeon' | 'entering' | 'battle' | 'victory' | 'defeat';
interface Question { question: string; choices: string[]; correct: number; explanation: string; }
interface Boss { name: string; emoji: string; title: string; lore: string; reward: number; }
interface StageProgress { completed: boolean; stars: number; xp: number; }
type Progress = Partial<Record<TechKey, Partial<Record<Difficulty, StageProgress>>>>;

// ─── Constants ────────────────────────────────────────────────────────────────
const TECH_CONFIG = {
  sql:     { label: 'SQL',      color: '#0EA5E9', r: 14,  g: 165, b: 233, icon: Database,  world: 'Cryptes SQL'    },
  powerbi: { label: 'Power BI', color: '#F59E0B', r: 245, g: 158, b: 11,  icon: BarChart3, world: 'Tours BI'       },
  python:  { label: 'Python',   color: '#8B5CF6', r: 139, g: 92,  b: 246, icon: Code2,     world: 'Abysses Python' },
  excel:   { label: 'Excel',    color: '#10B981', r: 16,  g: 185, b: 129, icon: Table2,    world: 'Forêt Excel'    },
} as const;
const DIFFICULTIES: Difficulty[] = ['débutant', 'intermédiaire', 'expert'];
const DIFF_META: Record<Difficulty, { label: string; icon: string; xpMult: number }> = {
  débutant:      { label: 'Apprenti', icon: '🗡️', xpMult: 1 },
  intermédiaire: { label: 'Expert',   icon: '⚔️', xpMult: 2 },
  expert:        { label: 'Maître',   icon: '👑', xpMult: 4 },
};
const BASE_XP = 100;
const TILE = 40;
const MAP_COLS = 29;
const MAP_ROWS = 9;
const MAP_W = MAP_COLS * TILE;
const MAP_H = MAP_ROWS * TILE;

// Room layout definitions (in tile units)
const ROOM_DEFS = [
  { id: 'start',         x: 0,  y: 0, w: 6, h: MAP_ROWS, type: 'start' as const },
  { id: 'débutant',      x: 9,  y: 0, w: 6, h: MAP_ROWS, type: 'boss' as const, diff: 'débutant' as Difficulty },
  { id: 'intermédiaire', x: 18, y: 0, w: 6, h: MAP_ROWS, type: 'boss' as const, diff: 'intermédiaire' as Difficulty },
  { id: 'expert',        x: 27, y: 0, w: 6, h: MAP_ROWS, type: 'boss' as const, diff: 'expert' as Difficulty },
];
const CORR_DEFS = [
  { x: 6, y: 3, w: 3, h: 3 }, { x: 15, y: 3, w: 3, h: 3 }, { x: 24, y: 3, w: 3, h: 3 },
];
// Passable area check (px coords)
function isPassable(px: number, py: number): boolean {
  const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
  for (const r of ROOM_DEFS) if (tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h) return true;
  for (const c of CORR_DEFS) if (tx >= c.x && tx < c.x + c.w && ty >= c.y && ty < c.y + c.h) return true;
  return false;
}
// Get room at px position
function getRoomAt(px: number, py: number): typeof ROOM_DEFS[0] | null {
  const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
  for (const r of ROOM_DEFS) if (tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h) return r;
  return null;
}

// ─── Bosses ──────────────────────────────────────────────────────────────────
const BOSSES: Record<TechKey, Record<Difficulty, Boss>> = {
  sql: {
    débutant:      { name: "SQL Goblin",       emoji: "👺", title: "Gardien des requêtes",    lore: "Ce gobelin corrompu bloque l'accès aux tables depuis des siècles.",  reward: 150 },
    intermédiaire: { name: "Query Wizard",     emoji: "🧙", title: "Maître des jointures",    lore: "Un sorcier pervers qui maîtrise les CTEs et fonctions fenêtre.",      reward: 300 },
    expert:        { name: "Database Dragon",  emoji: "🐉", title: "Seigneur du schéma",      lore: "Ce dragon antique garde les secrets du MVCC et du sharding.",         reward: 600 },
  },
  powerbi: {
    débutant:      { name: "DAX Gremlins",     emoji: "👾", title: "Voleurs de mesures",      lore: "Ces gremlins sabotent vos calculs DAX avant qu'ils n'arrivent !",     reward: 150 },
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

// ─── Questions ───────────────────────────────────────────────────────────────
const Q: Record<TechKey, Record<Difficulty, Question[]>> = {
  sql: {
    débutant: [
      { question: "Quelle clause SQL filtre les lignes d'un résultat ?", choices: ["GROUP BY","WHERE","HAVING","ORDER BY"], correct: 1, explanation: "WHERE filtre les lignes avant regroupement. HAVING filtre après GROUP BY." },
      { question: "Quel mot-clé élimine les doublons dans un SELECT ?", choices: ["UNIQUE","DISTINCT","FILTER","ONLY"], correct: 1, explanation: "SELECT DISTINCT retourne uniquement les valeurs uniques." },
      { question: "Que retourne COUNT(*) ?", choices: ["La somme","Le nombre de lignes","La moyenne","Le max"], correct: 1, explanation: "COUNT(*) compte toutes les lignes y compris les NULL." },
      { question: "Quelle jointure retourne toutes les lignes des deux tables, même sans correspondance ?", choices: ["INNER JOIN","LEFT JOIN","FULL OUTER JOIN","CROSS JOIN"], correct: 2, explanation: "FULL OUTER JOIN retourne toutes les lignes des deux tables avec NULL là où il n'y a pas de correspondance." },
      { question: "Quelle clause trie les résultats ?", choices: ["SORT BY","ORDER BY","GROUP BY","ARRANGE BY"], correct: 1, explanation: "ORDER BY trie les résultats. Par défaut en ordre croissant (ASC)." },
      { question: "Que signifie NULL en SQL ?", choices: ["Zéro","Valeur inconnue ou manquante","Chaîne vide","Faux"], correct: 1, explanation: "NULL représente une valeur inconnue ou absente." },
      { question: "Quelle fonction calcule la moyenne d'une colonne ?", choices: ["SUM()","MEAN()","AVG()","MEDIAN()"], correct: 2, explanation: "AVG() calcule la moyenne arithmétique en ignorant les NULL." },
      { question: "Quelle instruction crée une nouvelle table ?", choices: ["INSERT TABLE","CREATE TABLE","ADD TABLE","NEW TABLE"], correct: 1, explanation: "CREATE TABLE est l'instruction DDL pour créer une nouvelle table." },
    ],
    intermédiaire: [
      { question: "Différence entre WHERE et HAVING ?", choices: ["Aucune","WHERE avant regroupement, HAVING après","HAVING avant regroupement","WHERE uniquement avec des nombres"], correct: 1, explanation: "WHERE filtre avant GROUP BY. HAVING filtre après agrégation." },
      { question: "Qu'est-ce qu'une CTE ?", choices: ["Table permanente","Résultat nommé temporaire avec WITH","Contrainte clé étrangère","Index composite"], correct: 1, explanation: "Une CTE est définie avec WITH nom AS (...) et référencée dans la requête principale." },
      { question: "Quelle fonction fenêtre calcule un rang sans trou ?", choices: ["RANK()","DENSE_RANK()","ROW_NUMBER()","NTILE()"], correct: 1, explanation: "DENSE_RANK() attribue des rangs consécutifs sans trou. RANK() laisse des trous en cas d'égalité." },
      { question: "Qu'est-ce qu'un index ?", choices: ["Copie de la table","Structure qui accélère les recherches","Clé primaire obligatoire","Type de jointure"], correct: 1, explanation: "Un index crée une structure de données supplémentaire pour localiser rapidement les lignes." },
      { question: "Que fait COALESCE(a, b, c) ?", choices: ["Concatène","Retourne la première valeur non NULL","Retourne la dernière","Additionne"], correct: 1, explanation: "COALESCE retourne le premier argument non NULL de la liste." },
      { question: "Différence UNION vs UNION ALL ?", choices: ["Aucune","UNION supprime doublons, UNION ALL conserve","UNION ALL supprime doublons","UNION uniquement 2 tables"], correct: 1, explanation: "UNION supprime les doublons. UNION ALL combine sans dédoublonnage." },
      { question: "Que signifie ACID ?", choices: ["Atomicity, Consistency, Isolation, Durability","Automatic, Controlled, Indexed, Data","Access, Control, Input, Design","Advanced, Computed, Indexed, Data"], correct: 0, explanation: "ACID garantit la fiabilité des transactions : Atomicité, Cohérence, Isolation, Durabilité." },
      { question: "Somme cumulée avec fonctions fenêtre ?", choices: ["SUM() GROUP BY","SUM() OVER (ORDER BY ...)","CUMSUM()","RUNNING_TOTAL()"], correct: 1, explanation: "SUM() OVER (ORDER BY col) calcule une somme cumulée ligne par ligne." },
    ],
    expert: [
      { question: "Qu'est-ce que la 3NF ?", choices: ["Dépendance directe de la clé","Aucune dépendance transitive","Les deux","Table à une colonne"], correct: 2, explanation: "La 3NF exige que chaque attribut non-clé dépende directement de la clé primaire." },
      { question: "Complexité d'un B-Tree index ?", choices: ["O(n)","O(log n)","O(1)","O(n²)"], correct: 1, explanation: "Les B-Tree ont une complexité de recherche O(log n)." },
      { question: "Qu'est-ce que MVCC ?", choices: ["Un index","Lectures sans bloquer les écritures","Protocole de réplication","Type de contrainte"], correct: 1, explanation: "MVCC maintient plusieurs versions d'une ligne pour des lectures cohérentes sans verrou." },
      { question: "Que fait EXPLAIN ANALYZE en PostgreSQL ?", choices: ["Plan hypothétique","Plan réel avec timings","Supprime les indexes","Analyse la structure"], correct: 1, explanation: "EXPLAIN ANALYZE exécute la requête et retourne le plan d'exécution avec les temps réels." },
      { question: "Clustered vs non-clustered index ?", choices: ["Aucune","Clustered trie physiquement, non-clustered structure séparée","Non-clustered plus rapide","Clustered sans NULL"], correct: 1, explanation: "Un clustered index définit l'ordre physique des données. Une table ne peut en avoir qu'un seul." },
      { question: "Qu'est-ce que le sharding horizontal ?", choices: ["Ajouter colonnes","Diviser lignes sur plusieurs serveurs","Compresser","Index partiels"], correct: 1, explanation: "Le sharding horizontal partitionne les lignes sur plusieurs nœuds de base de données." },
      { question: "Quelle isolation empêche les lectures fantômes ?", choices: ["READ UNCOMMITTED","READ COMMITTED","REPEATABLE READ","SERIALIZABLE"], correct: 3, explanation: "SERIALIZABLE est le niveau d'isolation le plus strict. Il prévient les lectures fantômes." },
      { question: "Table de faits dans un schéma en étoile ?", choices: ["Données de référence","Table centrale avec mesures et FK","Table une colonne","Table temporaire"], correct: 1, explanation: "La table de faits contient les métriques mesurables et les FK vers les dimensions." },
    ],
  },
  powerbi: {
    débutant: [
      { question: "Que signifie DAX ?", choices: ["Data Analysis Expressions","Direct Access eXchange","Dynamic Analytics eXpert","Data Aggregation eXtension"], correct: 0, explanation: "DAX (Data Analysis Expressions) est le langage de formules utilisé dans Power BI." },
      { question: "Mesure vs colonne calculée en DAX ?", choices: ["Aucune","Mesure calculée à l'exécution, colonne stockée","Colonne plus rapide","Mesure sans SUM"], correct: 1, explanation: "Une mesure est calculée dynamiquement. Une colonne calculée est stockée dans le modèle." },
      { question: "Qu'est-ce qu'une relation dans Power BI ?", choices: ["Type de graphique","Lien entre tables via colonnes communes","Formule DAX","Rapport partagé"], correct: 1, explanation: "Une relation connecte deux tables via une colonne clé." },
      { question: "Quelle fonction DAX calcule la somme ?", choices: ["CALCULATE()","SUMX()","SUM()","TOTAL()"], correct: 2, explanation: "SUM(Table[Colonne]) calcule la somme de toutes les valeurs dans le contexte de filtre actuel." },
      { question: "Qu'est-ce que le contexte de filtre en DAX ?", choices: ["Filtre sur dates","Ensemble des filtres actifs influençant un calcul","Type de visuel","Paramètre de rapport"], correct: 1, explanation: "Le contexte de filtre définit quelles lignes sont visibles lors d'un calcul DAX." },
      { question: "Meilleur visuel pour l'évolution dans le temps ?", choices: ["Graphique en anneau","Graphique en courbes","Jauge","Treemap"], correct: 1, explanation: "Le graphique en courbes est idéal pour visualiser des tendances dans le temps." },
      { question: "Qu'est-ce que Power Query ?", choices: ["Langage DAX avancé","Outil de transformation et nettoyage","Type de rapport","Connecteur BDD"], correct: 1, explanation: "Power Query permet de se connecter, transformer et nettoyer les données." },
      { question: "Que fait CALCULATE() ?", choices: ["Sommes uniquement","Évalue dans un contexte de filtre modifié","Crée une table","Pourcentage"], correct: 1, explanation: "CALCULATE est la fonction DAX la plus puissante : elle modifie le contexte de filtre." },
    ],
    intermédiaire: [
      { question: "Que fait RELATED() ?", choices: ["Crée une relation","Retourne valeur d'une table liée côté 'un'","Moyenne pondérée","Filtre une table"], correct: 1, explanation: "RELATED() permet d'accéder à une colonne dans une table liée du côté 'un' de la relation." },
      { question: "ALL() vs ALLEXCEPT() ?", choices: ["Aucune","ALL supprime tous les filtres, ALLEXCEPT garde ceux spécifiés","ALLEXCEPT plus rapide","ALL uniquement sur colonnes"], correct: 1, explanation: "ALL() supprime tous les filtres. ALLEXCEPT(table, col) supprime tous sauf ceux des colonnes spécifiées." },
      { question: "Que fait DIVIDE(a, b, c) ?", choices: ["a/b","a/b, retourne c si b=0","Pourcentage","Arrondit"], correct: 1, explanation: "DIVIDE est la division sécurisée de DAX. Le 3e argument est retourné si b=0." },
      { question: "Étoile vs flocon dans Power BI ?", choices: ["Types de visuels","Étoile : faits + dimensions dénormalisées. Flocon : normalisées","Flocon plus performant","Aucune différence"], correct: 1, explanation: "L'étoile a des dimensions dénormalisées (recommandé Power BI)." },
      { question: "Qu'est-ce que DirectQuery ?", choices: ["Données importées en cache","Requêtes envoyées à la source à chaque interaction","Mode hors ligne","Type de licence"], correct: 1, explanation: "En DirectQuery, Power BI génère des requêtes SQL en temps réel vers la source." },
      { question: "CALENDAR() en DAX ?", choices: ["DATE()","CALENDAR()","DATERANGE()","DATELIST()"], correct: 1, explanation: "CALENDAR(date_début, date_fin) crée une table de dates." },
      { question: "Que fait SUMMARIZE() ?", choices: ["Résume un texte","Tableau groupé avec colonnes calculées","Calcule médiane","Filtre doublons"], correct: 1, explanation: "SUMMARIZE() crée un tableau regroupé similaire à un GROUP BY SQL." },
      { question: "Impact des cardinalités élevées ?", choices: ["Aucun","Ralentit le modèle et augmente la mémoire","Améliore les perf","Réduit taille du fichier"], correct: 1, explanation: "Les colonnes à haute cardinalité sont moins bien compressées par Vertipaq." },
    ],
    expert: [
      { question: "Qu'est-ce que Vertipaq ?", choices: ["Type de connecteur","Moteur de stockage columnaire en mémoire","Format de fichier","API REST"], correct: 1, explanation: "Vertipaq est le moteur SSAS Tabular in-memory utilisé par Power BI." },
      { question: "Que fait KEEPFILTERS() ?", choices: ["Conserve filtres existants dans CALCULATE","Supprime les filtres","Crée filtre persistant","Filtre par date"], correct: 0, explanation: "KEEPFILTERS() intersecte les filtres existants au lieu de les remplacer." },
      { question: "Mesure implicite vs explicite ?", choices: ["Aucune","Implicite : auto par glisser-déposer. Explicite : définie en DAX","Implicite plus précise","Explicite utilise SUM auto"], correct: 1, explanation: "Les mesures implicites sont créées automatiquement. Les mesures explicites sont définies manuellement." },
      { question: "Propagation de filtres bidirectionnelle ?", choices: ["Filtre dans les deux sens d'une relation","Type de segment","Fonctionnalité RLS","Type de jointure"], correct: 0, explanation: "La relation bidirectionnelle permet aux filtres de se propager dans les deux sens." },
      { question: "DAX Studio ?", choices: ["Taille du .pbix","Performances requêtes DAX et stats Vertipaq","Nombre utilisateurs","Qualité visuels"], correct: 1, explanation: "DAX Studio permet d'analyser les requêtes DAX et mesurer les temps de réponse." },
      { question: "Qu'est-ce que le RLS ?", choices: ["Type de graphique","Restreint l'accès aux données selon l'utilisateur","Fonctionnalité de tri","Mode de partage"], correct: 1, explanation: "RLS permet de définir des règles DAX qui filtrent les données selon l'identité de l'utilisateur." },
      { question: "Que fait TREATAS() ?", choices: ["Arbre de décision","Applique valeurs d'une table comme filtres d'une autre","Hiérarchie","Relation virtuelle"], correct: 1, explanation: "TREATAS() permet de créer des relations virtuelles entre tables." },
      { question: "Bonne pratique pour table de dates ?", choices: ["Colonne dans table de faits","Table dédiée marquée 'Date Table'","Pas de table de dates","Importer depuis Excel"], correct: 1, explanation: "Une table de dates dédiée, continue, permet d'activer toutes les fonctions Time Intelligence." },
    ],
  },
  python: {
    débutant: [
      { question: "Sortie de print(type(3.14)) ?", choices: ["<class 'int'>","<class 'float'>","<class 'double'>","<class 'number'>"], correct: 1, explanation: "3.14 est un float (virgule flottante) en Python." },
      { question: "Que retourne len([1, 2, 3, 4]) ?", choices: ["3","4","10","None"], correct: 1, explanation: "len() retourne le nombre d'éléments. La liste [1,2,3,4] a 4 éléments." },
      { question: "Accéder au dernier élément de ma_liste ?", choices: ["ma_liste[last]","ma_liste[-1]","ma_liste[end]","last(ma_liste)"], correct: 1, explanation: "Les indices négatifs partent de la fin. ma_liste[-1] retourne le dernier élément." },
      { question: "Que fait range(0, 10, 2) ?", choices: ["[0,2,4,6,8,10]","[0,2,4,6,8]","[2,4,6,8,10]","[0,10,2]"], correct: 1, explanation: "range(start, stop, step) : de 0 à 9 avec un pas de 2 → 0, 2, 4, 6, 8." },
      { question: "Liste vs tuple ?", choices: ["Aucune","Liste mutable, tuple immuable","Tuple plus lent","Liste uniquement nombres"], correct: 1, explanation: "Une liste [] est mutable. Un tuple () est immuable." },
      { question: "Que fait .append() ?", choices: ["Supprime","Ajoute à la fin","Trie","Inverse"], correct: 1, explanation: ".append(element) ajoute un élément à la fin de la liste." },
      { question: "Créer un dictionnaire en Python ?", choices: ["[clé:val]","{clé:val}","(clé,val)","<clé:val>"], correct: 1, explanation: "Un dictionnaire Python utilise des accolades avec des paires clé: valeur." },
      { question: "Que fait l'opérateur ** ?", choices: ["Multiplication","Puissance","Commentaire multiligne","Décompression dict"], correct: 1, explanation: "** est l'opérateur de puissance. 2**10 = 1024." },
    ],
    intermédiaire: [
      { question: "Complexité d'une recherche dans un set Python ?", choices: ["O(n)","O(log n)","O(1) en moyenne","O(n²)"], correct: 2, explanation: "Les sets utilisent des tables de hachage, complexité O(1) en moyenne." },
      { question: "[x**2 for x in range(5) if x % 2 == 0] ?", choices: ["[0,4,16]","[0,1,4,9,16]","[4,16]","[1,9,25]"], correct: 0, explanation: "Carrés des nombres pairs de 0 à 4 : 0², 2², 4² = 0, 4, 16." },
      { question: "Qu'est-ce qu'un générateur ?", choices: ["Type de liste","Fonction qui produit les valeurs à la demande avec yield","Décorateur","Classe abstraite"], correct: 1, explanation: "Un générateur utilise yield, produisant les valeurs une par une à la demande." },
      { question: "Que fait DataFrame.groupby() ?", choices: ["Trie","Groupe les lignes pour agrégations","Fusionne DataFrames","Supprime NaN"], correct: 1, explanation: "groupby() divise le DataFrame en groupes selon les valeurs d'une colonne." },
      { question: ".loc vs .iloc dans pandas ?", choices: ["Aucune",".loc labels, .iloc positions entières",".iloc déprécié",".loc sans slices"], correct: 1, explanation: ".loc sélectionne par labels. .iloc sélectionne par positions entières." },
      { question: "Que fait @staticmethod ?", choices: ["Méthode privée","Méthode sans self ni cls","Mémorise résultat","Méthode abstraite"], correct: 1, explanation: "@staticmethod crée une méthode qui appartient à la classe mais sans self ni cls." },
      { question: "Qu'est-ce que le GIL ?", choices: ["Variable globale","Verrou empêchant plusieurs threads d'exécuter du bytecode simultanément","Module sécurité","Garbage collector"], correct: 1, explanation: "Le GIL est un mutex dans CPython autorisant qu'un seul thread à la fois." },
      { question: "Que retourne numpy.zeros((3, 4)) ?", choices: ["Liste de 12 zéros","Tableau 3×4 de zéros en float64","Erreur","Scalaire 0"], correct: 1, explanation: "numpy.zeros((3, 4)) crée un tableau NumPy de 3 lignes et 4 colonnes de 0.0." },
    ],
    expert: [
      { question: "Qu'est-ce qu'une metaclass ?", choices: ["Classe abstraite","Classe dont les instances sont elles-mêmes des classes","Design pattern","Type de décorateur"], correct: 1, explanation: "Une métaclasse est la 'classe d'une classe'. type est la métaclasse par défaut." },
      { question: "Que fait functools.lru_cache() ?", choices: ["Cache LRU pour mémoiser résultats","Limite récursion","Optimise boucles","File d'attente"], correct: 0, explanation: "lru_cache mémoïse les résultats d'appels de fonction dans un cache LRU." },
      { question: "Complexité de sorted() ?", choices: ["O(n)","O(n log n)","O(n²)","O(log n)"], correct: 1, explanation: "Python utilise Timsort, complexité O(n log n)." },
      { question: "Qu'est-ce que __slots__ ?", choices: ["Liste de méthodes","Remplace __dict__ par descripteurs fixes, réduit mémoire","Méthodes dunder","Cache d'attributs"], correct: 1, explanation: "__slots__ empêche la création d'un __dict__ par instance, réduisant la mémoire." },
      { question: "Que fait asyncio.gather() ?", choices: ["Rassemble fichiers","Lance plusieurs coroutines concurremment et attend résultats","Gère exceptions async","Crée event loop"], correct: 1, explanation: "asyncio.gather(*coros) exécute plusieurs coroutines de façon concurrente." },
      { question: "deepcopy vs copy ?", choices: ["Aucune","deepcopy copie récursivement, copy premier niveau seulement","copy plus lent","deepcopy sans dict"], correct: 1, explanation: "copy.copy() fait une copie superficielle. copy.deepcopy() copie récursivement tous les objets." },
      { question: "Protocole de descripteur ?", choices: ["Protocole réseau","Objets avec __get__, __set__, __delete__ contrôlant l'accès aux attributs","Interface REST","Type de générateur"], correct: 1, explanation: "Les descripteurs permettent de customiser l'accès aux attributs d'une classe." },
      { question: "Que fait pandas.melt() ?", choices: ["Trie les colonnes","Transforme DataFrame 'wide' en 'long'","Fusionne DataFrames","Supprime NaN"], correct: 1, explanation: "melt() pivote le DataFrame de format large vers le format long." },
    ],
  },
  excel: {
    débutant: [
      { question: "Quelle formule calcule la somme de A1 à A10 ?", choices: ["=TOTAL(A1:A10)","=SUM(A1:A10)","=ADD(A1,A10)","=SOMME(A1-A10)"], correct: 1, explanation: "=SUM(A1:A10) additionne toutes les cellules de la plage." },
      { question: "=IF(A1>10,\"Oui\",\"Non\") si A1=5 ?", choices: ["Oui","Non","Erreur","10"], correct: 1, explanation: "=IF évalue la condition. A1=5 n'est pas >10 donc retourne 'Non'." },
      { question: "Référence absolue dans Excel ?", choices: ["Cellule en gras","Référence qui ne change pas lors de la copie ($A$1)","Nom de cellule","Formule complexe"], correct: 1, explanation: "Le signe $ bloque la référence. $A$1 ne change pas lors de la copie." },
      { question: "Quelle fonction cherche une valeur dans la première colonne ?", choices: ["HLOOKUP","VLOOKUP","SEARCH","FIND"], correct: 1, explanation: "VLOOKUP (RECHERCHEV) cherche verticalement dans la première colonne." },
      { question: "Raccourci pour annuler la dernière action ?", choices: ["CTRL+S","CTRL+Z","CTRL+X","CTRL+Y"], correct: 1, explanation: "CTRL+Z annule la dernière action. CTRL+Y refait." },
      { question: "Qu'est-ce qu'un TCD ?", choices: ["Tableau avec couleurs","Outil qui résume et agrège données interactivement","Formule avancée","Graphique 3D"], correct: 1, explanation: "Un TCD (PivotTable) permet de résumer et analyser des données sans formule." },
      { question: "Formule pour cellules non vides de A1 à A20 ?", choices: ["=COUNT(A1:A20)","=COUNTA(A1:A20)","=COUNTIF(A1:A20)","=NB(A1:A20)"], correct: 1, explanation: "COUNTA compte les cellules non vides. COUNT ne compte que les nombres." },
      { question: "Comment figer les volets ?", choices: ["Accueil > Figer","Affichage > Figer les volets","Insertion > Figer","Données > Figer"], correct: 1, explanation: "Affichage > Figer les volets permet de figer des lignes/colonnes lors du défilement." },
    ],
    intermédiaire: [
      { question: "VLOOKUP vs INDEX/MATCH ?", choices: ["Aucune","INDEX/MATCH peut chercher à gauche, plus flexible","VLOOKUP plus rapide","INDEX/MATCH sans texte"], correct: 1, explanation: "VLOOKUP cherche toujours à droite. INDEX/MATCH peut chercher dans n'importe quelle direction." },
      { question: "=SUMIFS(C:C, A:A, \"Paris\", B:B, \">100\") ?", choices: ["Compte les villes","Somme C où A='Paris' ET B>100","Somme toute la colonne","Erreur"], correct: 1, explanation: "SUMIFS somme selon plusieurs critères simultanément." },
      { question: "Power Query dans Excel ?", choices: ["Type de graphique","Connexion, transformation et chargement de données","Fonction de recherche","Module VBA"], correct: 1, explanation: "Power Query permet de se connecter à des sources, transformer et charger les données." },
      { question: "=IFERROR(1/0, \"Erreur\") retourne ?", choices: ["#DIV/0!","0","Erreur","1"], correct: 2, explanation: "IFERROR intercepte les erreurs Excel et retourne la valeur alternative spécifiée." },
      { question: "Fonction pour calculer un rang ?", choices: ["=RANK()","=ORDER()","=POSITION()","=SORT()"], correct: 0, explanation: "=RANK(nombre, plage, ordre) retourne le rang d'un nombre dans une liste." },
      { question: "Ctrl+Maj+Entrée dans Excel classique ?", choices: ["Enregistre","Valide formule matricielle","Insère ligne","Mise en forme"], correct: 1, explanation: "Ctrl+Maj+Entrée valide une formule en tant que formule matricielle." },
      { question: "Que fait TEXT(A1, \"JJ/MM/AAAA\") ?", choices: ["Date en nombre","Formate valeur en texte selon format spécifié","Extrait le jour","Crée une date"], correct: 1, explanation: "TEXT() convertit une valeur numérique ou date en texte formaté." },
      { question: "Comment créer une liste déroulante ?", choices: ["Insertion > Liste","Données > Validation des données","Accueil > Format","Formules > Définir"], correct: 1, explanation: "Données > Validation des données > Liste crée une liste déroulante." },
    ],
    expert: [
      { question: "XLOOKUP vs VLOOKUP ?", choices: ["Identiques","XLOOKUP cherche toutes directions, gère erreurs et retourne des plages","VLOOKUP plus rapide","XLOOKUP Office 365 uniquement"], correct: 1, explanation: "XLOOKUP remplace VLOOKUP et HLOOKUP avec plus de flexibilité." },
      { question: "Formule dynamique dans Excel 365 ?", choices: ["Change automatiquement","Se déverse dans cellules adjacentes automatiquement","Avec références absolues","Conditionnelle"], correct: 1, explanation: "Les formules dynamiques d'Excel 365 retournent automatiquement plusieurs résultats." },
      { question: "Que fait LAMBDA() ?", choices: ["Liste Lambda","Fonctions personnalisées réutilisables sans VBA","Valeur conditionnelle","Filtre données"], correct: 1, explanation: "LAMBDA() permet de créer des fonctions personnalisées nommées directement en Excel." },
      { question: "Modèle de données vs plages normales ?", choices: ["Aucune","Modèle de données : relations entre tables et mesures DAX","Modèle plus lent","Plages plus de lignes"], correct: 1, explanation: "Le modèle de données Power Pivot permet des relations entre tables et des mesures DAX." },
      { question: "Que fait SEQUENCE(5, 3) ?", choices: ["Séquence de 5 à 3","Tableau 5 lignes × 3 colonnes avec valeurs séquentielles","5 puis 3","15 cellules aléatoires"], correct: 1, explanation: "SEQUENCE(lignes, colonnes) génère un tableau de nombres séquentiels." },
      { question: "Optimiser un classeur Excel volumineux ?", choices: ["Plus de VLOOKUP","Références précises, tableaux structurés, calcul manuel","Plus de feuilles","Fusionner cellules"], correct: 1, explanation: "Bonnes pratiques : pas de A:A, tableaux structurés, calcul manuel pour grands modèles." },
      { question: "=FILTER(A1:C10, B1:B10>100) ?", choices: ["Filtre visuellement","Retourne dynamiquement les lignes où B>100","Compte lignes","Trie"], correct: 1, explanation: "FILTER() extrait dynamiquement les lignes d'une plage selon un critère." },
      { question: "Qu'est-ce que #SPILL! dans Excel 365 ?", choices: ["Erreur de syntaxe","Formule dynamique bloquée par cellules occupées","Référence circulaire","Erreur de valeur"], correct: 1, explanation: "#SPILL! se produit quand une formule dynamique ne peut pas se déverser." },
    ],
  },
};

// ─── Progress ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'dc_v4';
const loadProgress = (): Progress => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } };
const saveProgress = (p: Progress) => localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
const isUnlocked = (tech: TechKey, diff: Difficulty, p: Progress) =>
  diff === 'débutant' ? true :
  diff === 'intermédiaire' ? !!(p[tech]?.['débutant']?.completed) :
  !!(p[tech]?.['intermédiaire']?.completed);
const calcStars = (c: number, t: number) => c / t >= 0.875 ? 3 : c / t >= 0.625 ? 2 : c / t >= 0.375 ? 1 : 0;
const totalXP = (p: Progress) =>
  (Object.keys(TECH_CONFIG) as TechKey[]).flatMap(t => DIFFICULTIES.map(d => p[t]?.[d]?.xp ?? 0)).reduce((a, b) => a + b, 0);

// ─── Canvas: Top-Down Dungeon ─────────────────────────────────────────────────
function drawTopDownDungeon(
  ctx: CanvasRenderingContext2D,
  vpW: number, vpH: number,
  camX: number,
  charX: number, charY: number,
  charDir: string, charFrame: number,
  tech: TechKey, progress: Progress, ts: number
) {
  const cfg = TECH_CONFIG[tech];
  const { r, g, b } = cfg;

  // Clear
  ctx.fillStyle = '#02030a';
  ctx.fillRect(0, 0, vpW, vpH);

  const ox = -camX; // canvas offset

  // Draw void (outside rooms) with stone pattern
  ctx.fillStyle = '#080810';
  ctx.fillRect(0, 0, vpW, vpH);

  // Draw stone texture on void
  ctx.fillStyle = '#0a0a14';
  for (let tx = 0; tx < MAP_COLS; tx++) {
    for (let ty = 0; ty < MAP_ROWS; ty++) {
      if (!isPassable((tx + 0.5) * TILE, (ty + 0.5) * TILE)) {
        const sx = tx * TILE + ox, sy = ty * TILE;
        if (sx + TILE < 0 || sx > vpW) continue;
        // Wall brick
        ctx.fillStyle = (tx + ty) % 2 === 0 ? '#0c0c1a' : '#0a0a16';
        ctx.fillRect(sx, sy, TILE, TILE);
        ctx.strokeStyle = `rgba(${r},${g},${b},0.04)`;
        ctx.lineWidth = 1;
        ctx.strokeRect(sx + 1, sy + 1, TILE - 2, TILE - 2);
      }
    }
  }

  // Draw corridors
  CORR_DEFS.forEach(c => {
    const px = c.x * TILE + ox, py = c.y * TILE;
    const pw = c.w * TILE, ph = c.h * TILE;
    if (px + pw < 0 || px > vpW) return;
    // Corridor floor
    for (let i = 0; i < c.w; i++) {
      for (let j = 0; j < c.h; j++) {
        const tx2 = px + i * TILE, ty2 = py + j * TILE;
        ctx.fillStyle = (i + j) % 2 === 0 ? '#12122a' : '#101026';
        ctx.fillRect(tx2, ty2, TILE, TILE);
      }
    }
    // Corridor walls
    ctx.strokeStyle = `rgba(${r},${g},${b},0.2)`;
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, pw, ph);
    // Torch at corridor entrance
    const glow = (Math.sin(ts * 0.003 + c.x) + 1) / 2;
    [px + 2, px + pw - 2].forEach(tx2 => {
      const tg = ctx.createRadialGradient(tx2, py + ph / 2, 0, tx2, py + ph / 2, 18 * (0.7 + glow * 0.3));
      tg.addColorStop(0, `rgba(255,180,50,${0.5 + glow * 0.4})`);
      tg.addColorStop(0.5, `rgba(255,80,10,${0.3 + glow * 0.2})`);
      tg.addColorStop(1, 'transparent');
      ctx.fillStyle = tg;
      ctx.beginPath();
      ctx.arc(tx2, py + ph / 2, 18 * (0.7 + glow * 0.3), 0, Math.PI * 2);
      ctx.fill();
    });
  });

  // Draw rooms
  ROOM_DEFS.forEach(room => {
    const px = room.x * TILE + ox, py = room.y * TILE;
    const pw = room.w * TILE, ph = room.h * TILE;
    if (px + pw < 0 || px > vpW) return;

    const unlocked = room.type === 'start' || (room.diff ? isUnlocked(tech, room.diff, progress) : true);
    const completed = room.diff ? progress[tech]?.[room.diff]?.completed : false;
    const stars = room.diff ? (progress[tech]?.[room.diff]?.stars ?? 0) : 0;
    const glow = (Math.sin(ts * 0.002 + room.x) + 1) / 2;

    // Room floor tiles
    for (let ti = 0; ti < room.w; ti++) {
      for (let tj = 0; tj < room.h; tj++) {
        const tx2 = px + ti * TILE, ty2 = py + tj * TILE;
        const isEdge = ti === 0 || ti === room.w - 1 || tj === 0 || tj === room.h - 1;
        if (isEdge) {
          ctx.fillStyle = room.type === 'boss' ? (unlocked ? '#1a0d28' : '#0f0f1c') : '#0f1025';
        } else {
          const shade = (ti + tj) % 2 === 0;
          ctx.fillStyle = room.type === 'boss'
            ? (unlocked ? (shade ? '#18102a' : '#160e26') : '#0d0d1a')
            : (shade ? '#12122a' : '#101028');
        }
        ctx.fillRect(tx2, ty2, TILE, TILE);
        // Floor tile border
        ctx.strokeStyle = `rgba(${r},${g},${b},0.06)`;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(tx2, ty2, TILE, TILE);
      }
    }

    // Room walls (border glow)
    const borderAlpha = room.type === 'boss' && unlocked ? (0.3 + glow * 0.3) : 0.15;
    ctx.strokeStyle = `rgba(${r},${g},${b},${borderAlpha})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, pw, ph);

    // Boss room inner glow at top
    if (room.type === 'boss' && unlocked) {
      const innerGrad = ctx.createRadialGradient(px + pw / 2, py + ph * 0.4, 0, px + pw / 2, py + ph * 0.4, pw * 0.6);
      innerGrad.addColorStop(0, `rgba(${r},${g},${b},${glow * 0.12})`);
      innerGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = innerGrad;
      ctx.fillRect(px, py, pw, ph);
    }

    // Room label / boss info
    if (room.type === 'start') {
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = `rgba(${r},${g},${b},0.7)`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚔ DÉPART', px + pw / 2, py + ph * 0.15);
      // Arrow hint
      ctx.font = '14px serif';
      ctx.fillStyle = `rgba(${r},${g},${b},${0.5 + glow * 0.5})`;
      ctx.fillText('→', px + pw - 16, py + ph / 2);
    } else if (room.diff) {
      const boss = BOSSES[tech][room.diff];
      const meta = DIFF_META[room.diff];
      // Boss emoji
      ctx.font = `${unlocked ? 36 : 28}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = unlocked ? 1 : 0.3;
      ctx.fillText(unlocked ? boss.emoji : '🔒', px + pw / 2, py + ph * 0.38);
      ctx.globalAlpha = 1;
      // Boss name
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = unlocked ? cfg.color : '#2d3748';
      ctx.fillText(boss.name.toUpperCase(), px + pw / 2, py + ph * 0.65);
      // Diff label
      ctx.font = '9px monospace';
      ctx.fillStyle = `rgba(${r},${g},${b},0.5)`;
      ctx.fillText(`${meta.icon} ${meta.label}`, px + pw / 2, py + ph * 0.76);
      // Stars if completed
      if (completed) {
        ctx.font = '12px serif';
        ctx.fillText('⭐'.repeat(stars), px + pw / 2, py + ph * 0.87);
      }
      // Locked overlay
      if (!unlocked) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(px, py, pw, ph);
        ctx.font = '28px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔒', px + pw / 2, py + ph / 2);
      }
    }
  });

  // Torches on room walls
  const torchPositions: { x: number; y: number }[] = [
    { x: ROOM_DEFS[0].x * TILE + TILE, y: TILE },
    { x: ROOM_DEFS[0].x * TILE + TILE, y: (MAP_ROWS - 1) * TILE },
    { x: ROOM_DEFS[1].x * TILE + TILE, y: TILE },
    { x: ROOM_DEFS[1].x * TILE + TILE, y: (MAP_ROWS - 1) * TILE },
    { x: ROOM_DEFS[2].x * TILE + TILE, y: TILE },
    { x: ROOM_DEFS[3].x * TILE + TILE, y: TILE },
  ];
  torchPositions.forEach(({ x, y }) => {
    const tx2 = x + ox;
    if (tx2 < -20 || tx2 > vpW + 20) return;
    const flicker = 0.6 + Math.sin(ts * 0.005 + x * 0.1) * 0.4;
    const tg = ctx.createRadialGradient(tx2, y, 0, tx2, y, 22 * flicker);
    tg.addColorStop(0, `rgba(255,200,60,${flicker * 0.9})`);
    tg.addColorStop(0.4, `rgba(255,80,10,${flicker * 0.5})`);
    tg.addColorStop(1, 'transparent');
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.arc(tx2, y, 22 * flicker, 0, Math.PI * 2); ctx.fill();
  });

  // Character (top-down pixel art)
  drawTopDownChar(ctx, charX + ox, charY, charDir, charFrame, r, g, b);
}

function drawTopDownChar(ctx: CanvasRenderingContext2D, x: number, y: number, dir: string, frame: number, r: number, g: number, b: number) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  const f = frame % 2;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath(); ctx.ellipse(0, 10, 9, 3, 0, 0, Math.PI * 2); ctx.fill();

  if (dir === 'right' || dir === 'left') {
    if (dir === 'left') ctx.scale(-1, 1);
    // Body
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(-7, -8, 14, 16);
    // Head
    ctx.fillStyle = '#f5c58a';
    ctx.fillRect(-5, -18, 10, 12);
    ctx.fillStyle = `rgb(${Math.floor(r*0.5)},${Math.floor(g*0.5)},${Math.floor(b*0.5)})`;
    ctx.fillRect(-6, -20, 12, 6);
    // Legs
    ctx.fillStyle = '#2a1a08';
    ctx.fillRect(-5, 8, 4, 6 + (f ? 2 : 0));
    ctx.fillRect(1, 8, 4, 6 + (f ? 0 : 2));
    // Sword
    ctx.fillStyle = '#d0d8e0';
    ctx.fillRect(7, -16, 2, 20);
    ctx.fillStyle = '#c0a000'; ctx.fillRect(4, -1, 8, 2);
  } else {
    // Up or Down
    const isDown = dir === 'down';
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(-8, -6, 16, 14);
    ctx.fillStyle = '#f5c58a';
    ctx.fillRect(-5, isDown ? -18 : 8, 10, 12);
    ctx.fillStyle = `rgb(${Math.floor(r*0.5)},${Math.floor(g*0.5)},${Math.floor(b*0.5)})`;
    ctx.fillRect(-6, isDown ? -22 : 8, 12, 6);
    if (isDown) {
      // Eyes
      ctx.fillStyle = '#1a1235';
      ctx.fillRect(-3, -12, 2, 2);
      ctx.fillRect(1, -12, 2, 2);
    }
    // Legs
    ctx.fillStyle = '#2a1a08';
    ctx.fillRect(-6, 8, 5, 5 + (f ? 2 : 0));
    ctx.fillRect(1, 8, 5, 5 + (f ? 0 : 2));
  }
  ctx.restore();
}

// ─── Dungeon Canvas Component ──────────────────────────────────────────────────
interface DungeonCanvasProps {
  tech: TechKey;
  progress: Progress;
  onEnterRoom: (diff: Difficulty) => void;
}

function DungeonCanvas({ tech, progress, onEnterRoom }: DungeonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef({
    x: (ROOM_DEFS[0].x + ROOM_DEFS[0].w / 2) * TILE,
    y: MAP_H / 2,
    dir: 'right' as string,
    frame: 0, frameTimer: 0,
    vx: 0, vy: 0,
  });
  const keysRef = useRef<Set<string>>(new Set());
  const startTs = useRef(performance.now());
  const [entryHint, setEntryHint] = useState<Difficulty | null>(null);
  const hintRef = useRef<Difficulty | null>(null);

  const checkRoom = useCallback((px: number, py: number) => {
    const room = getRoomAt(px, py);
    const hint = (room?.type === 'boss' && room.diff && isUnlocked(tech, room.diff, progress)) ? room.diff as Difficulty : null;
    if (hint !== hintRef.current) { hintRef.current = hint; setEntryHint(hint); }
  }, [tech, progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const VPW = canvas.width, VPH = canvas.height;
    const SPEED = 3;

    const loop = (ts: number) => {
      const elapsed = ts - startTs.current;
      const s = stateRef.current;
      s.vx = 0; s.vy = 0;

      if (keysRef.current.has('ArrowRight') || keysRef.current.has('d') || keysRef.current.has('D')) { s.vx = SPEED; s.dir = 'right'; }
      else if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a') || keysRef.current.has('A')) { s.vx = -SPEED; s.dir = 'left'; }
      if (keysRef.current.has('ArrowDown') || keysRef.current.has('s') || keysRef.current.has('S')) { s.vy = SPEED; s.dir = 'down'; }
      else if (keysRef.current.has('ArrowUp') || keysRef.current.has('w') || keysRef.current.has('W')) { s.vy = -SPEED; s.dir = 'up'; }

      // Normalize diagonal
      if (s.vx !== 0 && s.vy !== 0) { s.vx *= 0.707; s.vy *= 0.707; }

      const nx = s.x + s.vx, ny = s.y + s.vy;
      const margin = 12;
      if (s.vx !== 0 && isPassable(nx + Math.sign(s.vx) * margin, s.y)) s.x = nx;
      if (s.vy !== 0 && isPassable(s.x, ny + Math.sign(s.vy) * margin)) s.y = ny;

      // Clamp to map
      s.x = Math.max(margin, Math.min(MAP_W - margin, s.x));
      s.y = Math.max(margin, Math.min(MAP_H - margin, s.y));

      // Walk animation
      if (s.vx !== 0 || s.vy !== 0) {
        s.frameTimer++;
        if (s.frameTimer >= 8) { s.frame++; s.frameTimer = 0; }
      }

      // Camera: center on player, clamped
      const camX = Math.max(0, Math.min(MAP_W - VPW, s.x - VPW / 2));

      checkRoom(s.x, s.y);
      drawTopDownDungeon(ctx, VPW, VPH, camX, s.x, s.y, s.dir, s.frame, tech, progress, elapsed);

      // Minimap
      const mmW = 100, mmH = Math.round(MAP_H / MAP_W * mmW);
      const mmX = VPW - mmW - 8, mmY = 8;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(mmX - 2, mmY - 2, mmW + 4, mmH + 4);
      ctx.strokeStyle = `rgba(${TECH_CONFIG[tech].r},${TECH_CONFIG[tech].g},${TECH_CONFIG[tech].b},0.4)`;
      ctx.lineWidth = 1;
      ctx.strokeRect(mmX - 2, mmY - 2, mmW + 4, mmH + 4);
      // Minimap rooms
      ROOM_DEFS.forEach(room => {
        const unlk = room.type === 'start' || (room.diff ? isUnlocked(tech, room.diff, progress) : true);
        ctx.fillStyle = unlk
          ? (room.type === 'start' ? `rgba(${TECH_CONFIG[tech].r},${TECH_CONFIG[tech].g},${TECH_CONFIG[tech].b},0.4)` : `rgba(${TECH_CONFIG[tech].r},${TECH_CONFIG[tech].g},${TECH_CONFIG[tech].b},0.25)`)
          : 'rgba(50,50,70,0.5)';
        ctx.fillRect(mmX + (room.x / MAP_COLS) * mmW, mmY + (room.y / MAP_ROWS) * mmH, (room.w / MAP_COLS) * mmW, (room.h / MAP_ROWS) * mmH);
      });
      CORR_DEFS.forEach(c => {
        ctx.fillStyle = `rgba(${TECH_CONFIG[tech].r},${TECH_CONFIG[tech].g},${TECH_CONFIG[tech].b},0.2)`;
        ctx.fillRect(mmX + (c.x / MAP_COLS) * mmW, mmY + (c.y / MAP_ROWS) * mmH, (c.w / MAP_COLS) * mmW, (c.h / MAP_ROWS) * mmH);
      });
      // Player dot on minimap
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(mmX + (s.x / MAP_W) * mmW, mmY + (s.y / MAP_H) * mmH, 2, 0, Math.PI * 2);
      ctx.fill();

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    const onKD = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault();
      if ((e.key === 'Enter' || e.key === ' ') && hintRef.current) onEnterRoom(hintRef.current);
    };
    const onKU = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener('keydown', onKD);
    window.addEventListener('keyup', onKU);

    // Click to move
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scX = canvas.width / rect.width;
      const scY = canvas.height / rect.height;
      const cx = (e.clientX - rect.left) * scX;
      const cy = (e.clientY - rect.top) * scY;
      const s = stateRef.current;
      const camX = Math.max(0, Math.min(MAP_W - canvas.width, s.x - canvas.width / 2));
      const mapX = cx + camX, mapY = cy;
      if (isPassable(mapX, mapY)) {
        // Simple direct move (not pathfinding, just set velocity toward)
        stateRef.current.x = mapX;
        stateRef.current.y = mapY;
      }
    };
    canvas.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKD);
      window.removeEventListener('keyup', onKU);
      canvas.removeEventListener('click', onClick);
    };
  }, [tech, progress, checkRoom, onEnterRoom]);

  return (
    <div className="relative w-full">
      <canvas ref={canvasRef} width={800} height={MAP_H}
        className="w-full rounded-sm" style={{ imageRendering: 'pixelated', cursor: 'crosshair', display: 'block' }} />
      <AnimatePresence>
        {entryHint && (
          <motion.button
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            onClick={() => onEnterRoom(entryHint)}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2.5 font-black text-sm text-black flex items-center gap-2 shadow-2xl animate-pulse"
            style={{ background: TECH_CONFIG[tech].color }}>
            <Swords size={14} /> AFFRONTER {BOSSES[tech][entryHint].name.toUpperCase()} [ENTRÉE]
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Battle Arena (face-to-face) ─────────────────────────────────────────────
interface BattleArenaProps {
  playerHp: number; bossHpPct: number;
  playerAnim: 'idle' | 'attack' | 'hit';
  bossAnim: 'idle' | 'hit' | 'attack';
  tech: TechKey; boss: Boss;
  r: number; g: number; b: number;
}

function BattleArena({ playerHp, bossHpPct, playerAnim, bossAnim, tech, boss, r, g, b }: BattleArenaProps) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: 180, background: `rgb(${Math.floor(r*0.04)},${Math.floor(g*0.03)},${Math.floor(b*0.05)})` }}>
      {/* Background grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(${r},${g},${b},0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(${r},${g},${b},0.06) 1px, transparent 1px)`,
        backgroundSize: '32px 32px'
      }} />
      {/* Ground line */}
      <div className="absolute bottom-8 left-0 right-0 h-px" style={{ background: `rgba(${r},${g},${b},0.3)` }} />
      <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: `rgba(0,0,0,0.4)` }} />

      {/* HP bars */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between gap-4 z-10">
        {/* Player HP */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black text-white">HÉROS</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart key={i} size={12} fill={i < playerHp ? '#EF4444' : 'none'} className={i < playerHp ? 'text-red-500' : 'text-gray-700'} />
              ))}
            </div>
          </div>
          <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
            <motion.div className="h-full rounded-full bg-green-500" animate={{ width: `${(playerHp / 3) * 100}%` }} transition={{ type: 'spring' }} />
          </div>
        </div>
        <div className="text-xs font-black" style={{ color: TECH_CONFIG[tech].color }}>VS</div>
        {/* Boss HP */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex gap-1">
              {bossHpPct > 66 ? <Shield size={12} className="text-emerald-400" /> : bossHpPct > 33 ? <Shield size={12} className="text-amber-400" /> : <Shield size={12} className="text-red-400" />}
            </div>
            <span className="text-xs font-black" style={{ color: TECH_CONFIG[tech].color }}>{boss.name.toUpperCase()}</span>
          </div>
          <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
            <motion.div className="h-full rounded-full"
              animate={{ width: `${bossHpPct}%` }}
              transition={{ type: 'spring' }}
              style={{ background: bossHpPct > 50 ? '#EF4444' : bossHpPct > 25 ? '#F59E0B' : '#10B981' }} />
          </div>
        </div>
      </div>

      {/* Player sprite (left side) */}
      <motion.div
        className="absolute bottom-8 left-16 flex flex-col items-center"
        animate={
          playerAnim === 'attack' ? { x: [0, 60, 40, 0], transition: { duration: 0.4 } } :
          playerAnim === 'hit' ? { x: [0, -15, 0], opacity: [1, 0.4, 1], transition: { duration: 0.3 } } :
          {}
        }>
        <div className="text-5xl leading-none" style={{ filter: playerAnim === 'hit' ? 'brightness(0.3) sepia(1) hue-rotate(330deg)' : 'none', transition: 'filter 0.2s' }}>
          🗡️
        </div>
        <div className="text-xs font-black mt-1" style={{ color: `rgb(${r},${g},${b})` }}>TOI</div>
      </motion.div>

      {/* Clash/impact effect */}
      <AnimatePresence>
        {(playerAnim === 'attack' || bossAnim === 'attack') && (
          <motion.div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-4xl pointer-events-none"
            initial={{ scale: 0, opacity: 1 }} animate={{ scale: 2, opacity: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}>
            {playerAnim === 'attack' ? '⚡' : '💥'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boss sprite (right side) */}
      <motion.div
        className="absolute bottom-8 right-16 flex flex-col items-center"
        animate={
          bossAnim === 'hit' ? { x: [0, 20, 0], scale: [1, 0.9, 1], opacity: [1, 0.3, 1], transition: { duration: 0.4 } } :
          bossAnim === 'attack' ? { x: [0, -50, -30, 0], transition: { duration: 0.5 } } :
          { scale: [1, 1.02, 1], transition: { duration: 2, repeat: Infinity } }
        }>
        <div className="text-6xl leading-none"
          style={{ filter: bossAnim === 'hit' ? 'brightness(3) saturate(0)' : 'none', transition: 'filter 0.2s' }}>
          {boss.emoji}
        </div>
        <div className="text-xs font-black mt-1" style={{ color: `rgb(${r},${g},${b})` }}>{boss.name.toUpperCase()}</div>
      </motion.div>
    </div>
  );
}

// ─── Stars ───────────────────────────────────────────────────────────────────
function Stars({ count, size = 16 }: { count: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map(i => <Star key={i} size={size} fill={i <= count ? '#F59E0B' : 'none'} className={i <= count ? 'text-amber-400' : 'text-gray-600'} />)}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function DataChallenge() {
  const [, setLocation] = useLocation();
  const [screen, setScreen] = useState<Screen>('dungeon');
  const [activeTech, setActiveTech] = useState<TechKey>('sql');
  const [selectedDiff, setSelectedDiff] = useState<Difficulty | null>(null);
  const [progress, setProgress] = useState<Progress>(loadProgress);

  // Battle
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
  const [playerAnim, setPlayerAnim] = useState<'idle' | 'attack' | 'hit'>('idle');
  const [bossAnim, setBossAnim] = useState<'idle' | 'hit' | 'attack'>('idle');
  const [floatXP, setFloatXP] = useState<{ v: number; id: number } | null>(null);
  const floatId = useRef(0);

  const tech = TECH_CONFIG[activeTech];
  const boss = selectedDiff ? BOSSES[activeTech][selectedDiff] : null;
  const currentQ = questions[qIdx];
  const totalQ = questions.length;

  useEffect(() => { saveProgress(progress); }, [progress]);

  useEffect(() => {
    if (screen !== 'battle' || answered || !currentQ) return;
    if (timeLeft <= 0) { handleAnswer(-1); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, answered, screen, currentQ]);

  const startBattle = useCallback((diff: Difficulty) => {
    setScreen('entering');
    setTimeout(() => {
      const bank = Q[activeTech][diff];
      const qs = [...bank].sort(() => Math.random() - 0.5).slice(0, 8);
      setQuestions(qs); setQIdx(0); setLives(3); setBossHpPct(100);
      setCombo(0); setXpEarned(0); setCorrectCount(0);
      setSelected(null); setAnswered(false); setTimeLeft(30);
      setFlash(null); setPlayerAnim('idle'); setBossAnim('idle');
      setSelectedDiff(diff); setScreen('battle');
    }, 800);
  }, [activeTech]);

  const handleAnswer = useCallback((idx: number) => {
    if (answered || !currentQ || !selectedDiff) return;
    setSelected(idx); setAnswered(true);
    const ok = idx === currentQ.correct;
    if (ok) {
      setPlayerAnim('attack');
      setBossAnim('hit');
      setTimeout(() => { setPlayerAnim('idle'); setBossAnim('idle'); }, 500);
      const nc = combo + 1; setCombo(nc);
      const mult = Math.min(nc, 4);
      const xp = BASE_XP * mult * DIFF_META[selectedDiff].xpMult;
      setXpEarned(p => p + xp); setCorrectCount(p => p + 1);
      setBossHpPct(p => Math.max(0, p - Math.floor(100 / totalQ)));
      setFlash('hit');
      floatId.current++;
      setFloatXP({ v: xp, id: floatId.current });
      setTimeout(() => setFloatXP(null), 1200);
    } else {
      setPlayerAnim('hit'); setBossAnim('attack');
      setTimeout(() => { setPlayerAnim('idle'); setBossAnim('idle'); }, 500);
      setCombo(0); setLives(p => p - 1); setFlash('miss');
      if (lives - 1 <= 0) setTimeout(() => setScreen('defeat'), 1200);
    }
    setTimeout(() => setFlash(null), 350);
  }, [answered, currentQ, selectedDiff, combo, totalQ, lives]);

  const nextQuestion = useCallback(() => {
    const lastOk = selected === currentQ?.correct;
    if (qIdx + 1 >= totalQ || lives <= 0) {
      const fc = correctCount + (lastOk ? 1 : 0);
      const stars = calcStars(fc, totalQ);
      if (lives > 0 && selectedDiff) {
        setProgress(prev => {
          const next = { ...prev };
          if (!next[activeTech]) next[activeTech] = {};
          const ex = next[activeTech]![selectedDiff];
          next[activeTech]![selectedDiff] = { completed: true, stars: Math.max(stars, ex?.stars ?? 0), xp: Math.max(xpEarned, ex?.xp ?? 0) };
          return next;
        });
        setScreen('victory');
      } else { setScreen('defeat'); }
    } else {
      setQIdx(i => i + 1); setSelected(null); setAnswered(false); setTimeLeft(30);
    }
  }, [qIdx, totalQ, lives, correctCount, selected, currentQ, selectedDiff, xpEarned, activeTech]);

  const backToDungeon = () => { setScreen('dungeon'); setSelectedDiff(null); };
  const lvl = Math.floor(totalXP(progress) / 500) + 1;
  const { r, g, b } = tech;

  // ── DUNGEON ──────────────────────────────────────────────────────────────────
  if (screen === 'dungeon') {
    return (
      <div className="min-h-screen text-white" style={{ background: '#03040c' }}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <button onClick={() => setLocation('/data-ia')} className="flex items-center gap-2 text-gray-500 hover:text-white text-xs transition-colors">
            <ArrowLeft size={14} /> Retour
          </button>
          <div className="flex items-center gap-3">
            {(Object.entries(TECH_CONFIG) as [TechKey, typeof TECH_CONFIG[TechKey]][]).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const active = activeTech === key;
              return (
                <button key={key} onClick={() => setActiveTech(key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 transition-all"
                  style={{ borderColor: active ? cfg.color : 'rgba(255,255,255,0.08)', background: active ? `${cfg.color}15` : 'transparent', color: active ? cfg.color : '#4b5563' }}>
                  <Icon size={11} /> {cfg.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-amber-400 text-xs">
            <Crown size={12} /> <span className="font-black">LVL {lvl}</span> · <span className="text-yellow-300">{totalXP(progress)} XP</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 pt-4">
          <div className="text-center mb-3">
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: tech.color }}>⚔ {tech.world}</span>
            <p className="text-xs text-gray-600 mt-1">Marche dans le donjon · WASD ou ← → ↑ ↓ · Clique sur une salle · [Entrée] pour combattre</p>
          </div>
          <div className="border overflow-hidden" style={{ borderColor: `${tech.color}20` }}>
            <DungeonCanvas tech={activeTech} progress={progress} onEnterRoom={startBattle} />
          </div>
          {/* Room legend */}
          <div className="mt-4 grid grid-cols-3 gap-3 pb-6">
            {DIFFICULTIES.map(diff => {
              const unlocked = isUnlocked(activeTech, diff, progress);
              const bossData = BOSSES[activeTech][diff];
              const meta = DIFF_META[diff];
              const stageData = progress[activeTech]?.[diff];
              return (
                <div key={diff}
                  className="p-3 border flex items-center gap-3 cursor-pointer transition-all"
                  style={{ borderColor: unlocked ? `${tech.color}30` : 'rgba(255,255,255,0.06)', background: unlocked ? `${tech.color}05` : 'transparent', opacity: unlocked ? 1 : 0.4 }}
                  onClick={() => unlocked && startBattle(diff)}>
                  <span className="text-2xl">{unlocked ? bossData.emoji : '🔒'}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-black truncate" style={{ color: unlocked ? tech.color : '#374151' }}>{meta.icon} {meta.label}</div>
                    <div className="text-xs text-gray-500 truncate">{bossData.name}</div>
                    {stageData?.completed && <Stars count={stageData.stars} size={10} />}
                  </div>
                  {unlocked && !stageData?.completed && <ChevronRight size={12} className="ml-auto flex-shrink-0" style={{ color: tech.color }} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── ENTERING ROOM TRANSITION ─────────────────────────────────────────────────
  if (screen === 'entering') {
    return (
      <motion.div className="fixed inset-0 flex items-center justify-center z-50"
        style={{ background: '#000' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="text-center">
          <motion.div className="text-8xl mb-4" animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1, 1] }} transition={{ duration: 0.6 }}>
            ⚔️
          </motion.div>
          <motion.p className="font-black text-2xl text-white" animate={{ opacity: [0, 1] }} transition={{ delay: 0.3 }}>
            COMBAT !
          </motion.p>
        </div>
      </motion.div>
    );
  }

  // ── BATTLE ───────────────────────────────────────────────────────────────────
  if (screen === 'battle' && currentQ && boss && selectedDiff) {
    const mult = Math.min(combo + 1, 4);
    const timerPct = (timeLeft / 30) * 100;
    const timerColor = timeLeft <= 10 ? '#EF4444' : timeLeft <= 20 ? '#F59E0B' : '#10B981';

    return (
      <div className="min-h-screen text-white select-none flex flex-col" style={{ background: `rgb(${Math.floor(r*0.03)},${Math.floor(g*0.03)},${Math.floor(b*0.04)})` }}>
        {/* Screen flash */}
        <AnimatePresence>
          {flash && (
            <motion.div key={flash} className="fixed inset-0 z-50 pointer-events-none"
              initial={{ opacity: 0.6 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
              style={{ background: flash === 'hit' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.4)' }} />
          )}
        </AnimatePresence>

        {/* HUD bar */}
        <div className="flex items-center justify-between px-5 py-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-bold">{qIdx + 1}/{totalQ}</span>
            {combo >= 2 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="px-2 py-0.5 text-xs font-black text-black flex items-center gap-1"
                style={{ background: combo >= 4 ? '#EF4444' : combo >= 3 ? '#F59E0B' : '#8B5CF6' }}>
                <Flame size={9} />×{mult}
              </motion.span>
            )}
          </div>
          <span className="text-xs font-black uppercase tracking-wider" style={{ color: tech.color }}>
            {boss.name} — {DIFF_META[selectedDiff].label}
          </span>
          <div className="flex items-center gap-1 text-yellow-300 text-xs font-bold">
            <Zap size={11} />{xpEarned} XP
          </div>
        </div>

        {/* Battle arena (face-to-face) */}
        <BattleArena playerHp={lives} bossHpPct={bossHpPct} playerAnim={playerAnim} bossAnim={bossAnim} tech={activeTech} boss={boss} r={r} g={g} b={b} />

        {/* XP float */}
        <AnimatePresence>
          {floatXP && (
            <motion.div key={floatXP.id}
              className="fixed top-48 right-8 font-black text-xl pointer-events-none z-40"
              style={{ color: tech.color }}
              initial={{ y: 0, opacity: 1 }} animate={{ y: -60, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
              +{floatXP.v} XP {mult > 1 && `×${mult}`}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question area */}
        <div className="flex-1 max-w-2xl mx-auto w-full px-5 py-4">
          <AnimatePresence mode="wait">
            <motion.div key={qIdx} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.2 }}>
              {/* Timer bar */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${timerPct}%`, background: timerColor }} />
                </div>
                <span className="text-sm font-black tabular-nums" style={{ color: timerColor }}>{timeLeft}s</span>
              </div>

              {/* Question */}
              <div className="p-4 border border-white/10 bg-white/5 mb-4 rounded-sm">
                <p className="text-sm font-bold text-white leading-relaxed">{currentQ.question}</p>
              </div>

              {/* Answers */}
              <div className="grid grid-cols-1 gap-2">
                {currentQ.choices.map((choice, i) => {
                  const isCorrect = i === currentQ.correct, isSel = i === selected;
                  let brd = 'rgba(255,255,255,0.1)', bg = 'transparent', tc = '#9ca3af';
                  if (answered) {
                    if (isCorrect) { brd = '#10B981'; bg = 'rgba(16,185,129,0.12)'; tc = '#6ee7b7'; }
                    else if (isSel) { brd = '#EF4444'; bg = 'rgba(239,68,68,0.12)'; tc = '#fca5a5'; }
                    else { brd = 'rgba(255,255,255,0.05)'; tc = '#374151'; }
                  }
                  return (
                    <motion.button key={i}
                      whileHover={!answered ? { x: 4 } : {}}
                      whileTap={!answered ? { scale: 0.98 } : {}}
                      onClick={() => handleAnswer(i)} disabled={answered}
                      className="w-full text-left px-4 py-3 border flex items-center gap-3 text-sm font-medium transition-all duration-100 rounded-sm"
                      style={{ borderColor: brd, background: bg, color: tc }}>
                      <span className="w-6 h-6 border flex-shrink-0 flex items-center justify-center text-xs font-black" style={{ borderColor: brd }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {choice}
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {answered && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-2">
                    <div className={`p-3 border-l-4 text-xs rounded-sm ${selected === currentQ.correct ? 'border-emerald-500 bg-emerald-900/15 text-emerald-300' : 'border-red-500 bg-red-900/15 text-red-300'}`}>
                      <span className="font-black">{selected === currentQ.correct ? '⚡ ' : '💥 '}</span>
                      {currentQ.explanation}
                    </div>
                    <button onClick={nextQuestion}
                      className="w-full py-3 font-black text-sm text-black flex items-center justify-center gap-2 rounded-sm"
                      style={{ background: tech.color }}>
                      {qIdx + 1 >= totalQ ? <><Trophy size={14} /> FIN DU COMBAT</> : <>COUP SUIVANT <ChevronRight size={14} /></>}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ── VICTORY ──────────────────────────────────────────────────────────────────
  if (screen === 'victory' && boss && selectedDiff) {
    const stars = progress[activeTech]?.[selectedDiff]?.stars ?? 0;
    const nextDiff: Difficulty | null = selectedDiff === 'débutant' ? 'intermédiaire' : selectedDiff === 'intermédiaire' ? 'expert' : null;
    return (
      <div className="min-h-screen flex items-center justify-center text-white" style={{ background: '#060610' }}>
        <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(${tech.color}30 1px, transparent 1px), linear-gradient(90deg, ${tech.color}30 1px, transparent 1px)`, backgroundSize: '40px 40px', opacity: 0.1 }} />
        <motion.div className="relative z-10 max-w-md w-full mx-6 text-center" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
          <motion.div className="text-8xl mb-4" animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.6, delay: 0.3 }}>💀</motion.div>
          <h2 className="text-3xl font-black mb-1" style={{ color: tech.color }}>BOSS VAINCU !</h2>
          <p className="text-gray-400 mb-5 text-sm">{boss.name} tombe dans {tech.world}</p>
          <div className="flex justify-center gap-3 mb-5">
            {[1, 2, 3].map(s => (
              <motion.div key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + s * 0.15, type: 'spring' }}>
                <Star size={44} fill={s <= stars ? '#F59E0B' : 'none'} className={s <= stars ? 'text-amber-400' : 'text-gray-700'} />
              </motion.div>
            ))}
          </div>
          <div className="border p-5 mb-5 space-y-2 text-sm" style={{ borderColor: `${tech.color}35`, background: `${tech.color}06` }}>
            <div className="flex justify-between"><span className="text-gray-500">Bonnes réponses</span><span className="font-black">{correctCount}/{totalQ}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">XP gagnés</span><span className="font-black text-yellow-300">+{xpEarned}</span></div>
            {nextDiff && (
              <motion.div className="pt-2 border-t border-white/10 text-xs font-bold" style={{ color: tech.color }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                🔓 {BOSSES[activeTech][nextDiff].name} débloqué dans le donjon !
              </motion.div>
            )}
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => startBattle(selectedDiff)} className="px-5 py-3 font-bold text-sm border flex items-center gap-2" style={{ borderColor: tech.color, color: tech.color }}>
              <RotateCcw size={12} /> Rejouer
            </button>
            <button onClick={backToDungeon} className="px-6 py-3 font-bold text-sm text-black flex items-center gap-2" style={{ background: tech.color }}>
              <Swords size={12} /> Retour au donjon
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
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#ef444430 1px, transparent 1px), linear-gradient(90deg, #ef444430 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.15 }} />
        <motion.div className="relative z-10 max-w-sm w-full mx-6 text-center" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <motion.div className="text-9xl mb-4" animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity }}>{boss.emoji}</motion.div>
          <h2 className="text-4xl font-black mb-2 text-red-500">DÉFAITE</h2>
          <p className="text-gray-500 mb-1 text-sm">{boss.name} t'a vaincu...</p>
          <p className="text-gray-700 text-xs mb-8">{correctCount}/{totalQ} · {xpEarned} XP</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => startBattle(selectedDiff)} className="px-8 py-4 font-black text-black flex items-center gap-2" style={{ background: '#EF4444' }}>
              <RotateCcw size={15} /> RÉESSAYER
            </button>
            <button onClick={backToDungeon} className="px-5 py-4 font-bold border border-white/15 hover:bg-white/5 flex items-center gap-2">
              <ArrowLeft size={13} /> Donjon
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
