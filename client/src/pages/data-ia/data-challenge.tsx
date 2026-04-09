import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Star, Zap, Trophy, RotateCcw, Lock, ArrowLeft,
  Database, Code2, BarChart3, Table2, Swords, Shield,
  ChevronRight, Crown, Map, Flame
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type TechKey = 'sql' | 'powerbi' | 'python' | 'excel';
type Difficulty = 'débutant' | 'intermédiaire' | 'expert';
type Screen = 'map' | 'battle' | 'victory' | 'defeat';

interface Question { question: string; choices: string[]; correct: number; explanation: string; }
interface Boss { name: string; emoji: string; title: string; lore: string; reward: number; }
interface StageProgress { completed: boolean; stars: number; xp: number; }
type Progress = Partial<Record<TechKey, Partial<Record<Difficulty, StageProgress>>>>;

// ─── Config tech ──────────────────────────────────────────────────────────────
const TECH_CONFIG = {
  sql:     { label: 'SQL',      color: '#0EA5E9', glow: 'shadow-sky-500/40',     bg: '#040e1a', icon: Database, world: 'Royaume SQL'    },
  powerbi: { label: 'Power BI', color: '#F59E0B', glow: 'shadow-amber-500/40',   bg: '#130b00', icon: BarChart3, world: 'Empire BI'     },
  python:  { label: 'Python',   color: '#8B5CF6', glow: 'shadow-violet-500/40',  bg: '#0a0617', icon: Code2,    world: 'Donjon Python'  },
  excel:   { label: 'Excel',    color: '#10B981', glow: 'shadow-emerald-500/40', bg: '#031009', icon: Table2,   world: 'Forêt Excel'    },
} as const;

const DIFFICULTIES: Difficulty[] = ['débutant', 'intermédiaire', 'expert'];
const DIFF_META: Record<Difficulty, { label: string; icon: string; xpMult: number }> = {
  débutant:      { label: 'Apprenti', icon: '🗡️',  xpMult: 1   },
  intermédiaire: { label: 'Expert',   icon: '⚔️',  xpMult: 2   },
  expert:        { label: 'Maître',   icon: '👑',  xpMult: 4   },
};
const BASE_XP = 100;

// ─── Boss roster ──────────────────────────────────────────────────────────────
const BOSSES: Record<TechKey, Record<Difficulty, Boss>> = {
  sql: {
    débutant:      { name: "SQL Goblin",       emoji: "👺", title: "Gardien des requêtes",    lore: "Ce gobelin corrompu bloque l'accès aux tables depuis des siècles.",       reward: 150 },
    intermédiaire: { name: "Query Wizard",     emoji: "🧙", title: "Maître des jointures",    lore: "Un sorcier pervers qui maîtrise les CTEs et fonctions fenêtre.",          reward: 300 },
    expert:        { name: "Database Dragon",  emoji: "🐉", title: "Seigneur du schéma",      lore: "Ce dragon antique garde les secrets du MVCC et du sharding horizontal.",  reward: 600 },
  },
  powerbi: {
    débutant:      { name: "DAX Gremlins",      emoji: "👾", title: "Voleur de mesures",       lore: "Ces gremlins sabotent vos calculs DAX avant qu'ils n'arrivent !",         reward: 150 },
    intermédiaire: { name: "BI Sorcerer",       emoji: "🔮", title: "Maître du contexte",      lore: "Un sorcier qui manipule CALCULATE et KEEPFILTERS à son gré.",             reward: 300 },
    expert:        { name: "Vertipaq Vampire",  emoji: "🧛", title: "Seigneur Vertipaq",       lore: "Ce vampire se nourrit de cardinalités et de mesures implicites.",          reward: 600 },
  },
  python: {
    débutant:      { name: "Code Slime",        emoji: "🐸", title: "Monstre des boucles",     lore: "Un slime baveux qui perturbe vos listes et vos boucles for.",             reward: 150 },
    intermédiaire: { name: "Pandas Beast",      emoji: "🐼", title: "Dévoreur de DataFrames",  lore: "Cette bête dévore groupby(), .loc et numpy sans la moindre pitié.",       reward: 300 },
    expert:        { name: "Metaclass Monster", emoji: "🦑", title: "Titan du paradigme",      lore: "Un monstre abyssal maîtrisant métaclasses, asyncio et le GIL.",           reward: 600 },
  },
  excel: {
    débutant:      { name: "Sheet Zombie",      emoji: "🧟", title: "Hanteur de formules",     lore: "Ce zombie corrompt vos VLOOKUP et SUM depuis des décennies.",              reward: 150 },
    intermédiaire: { name: "Formula Witch",     emoji: "🧙‍♀️", title: "Sorcière des fonctions", lore: "Elle jette des sorts INDEX/MATCH et SUMIFS sur ses victimes.",          reward: 300 },
    expert:        { name: "LAMBDA Lord",       emoji: "👑", title: "Seigneur des Arrays",     lore: "Ce seigneur omniscient maîtrise LAMBDA, XLOOKUP et SEQUENCE 365.",        reward: 600 },
  },
};

// ─── Question bank ───────────────────────────────────────────────────────────
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
      { question: "Qu'est-ce qu'une CTE (Common Table Expression) ?", choices: ["Une table permanente", "Un résultat nommé temporaire défini avec WITH", "Une contrainte de clé étrangère", "Un index composite"], correct: 1, explanation: "Une CTE est définie avec WITH nom AS (...) et peut être référencée dans la requête principale comme une table temporaire." },
      { question: "Quelle fonction fenêtre calcule un rang sans laisser de trous ?", choices: ["RANK()", "DENSE_RANK()", "ROW_NUMBER()", "NTILE()"], correct: 1, explanation: "DENSE_RANK() attribue des rangs consécutifs sans trou. RANK() laisse des trous en cas d'égalité." },
      { question: "Qu'est-ce qu'un index et à quoi sert-il ?", choices: ["Une copie de la table", "Une structure qui accélère les recherches", "Une clé primaire obligatoire", "Un type de jointure"], correct: 1, explanation: "Un index crée une structure de données supplémentaire qui permet de localiser rapidement les lignes sans scanner toute la table." },
      { question: "Que fait COALESCE(a, b, c) ?", choices: ["Concatène les valeurs", "Retourne la première valeur non NULL", "Retourne la dernière valeur", "Additionne les valeurs"], correct: 1, explanation: "COALESCE retourne le premier argument non NULL de la liste. Très utile pour remplacer les NULL." },
      { question: "Quelle est la différence entre UNION et UNION ALL ?", choices: ["Pas de différence", "UNION supprime les doublons, UNION ALL les conserve", "UNION ALL supprime les doublons", "UNION fonctionne uniquement avec 2 tables"], correct: 1, explanation: "UNION combine les résultats et supprime les doublons. UNION ALL combine sans dédoublonnage (plus rapide)." },
      { question: "Que signifie ACID en bases de données ?", choices: ["Atomicity, Consistency, Isolation, Durability", "Automatic, Controlled, Indexed, Data", "Access, Control, Input, Design", "Advanced, Computed, Indexed, Data"], correct: 0, explanation: "ACID garantit la fiabilité des transactions : Atomicité, Cohérence, Isolation, Durabilité." },
      { question: "Quelle fonction calcule une somme cumulée avec les fonctions fenêtre ?", choices: ["SUM() GROUP BY", "SUM() OVER (ORDER BY ...)", "CUMSUM()", "RUNNING_TOTAL()"], correct: 1, explanation: "SUM() OVER (ORDER BY col) calcule une somme cumulée ligne par ligne. C'est une fonction analytique/fenêtre." },
    ],
    expert: [
      { question: "Qu'est-ce que la normalisation 3NF ?", choices: ["Toute colonne dépend directement de la clé primaire", "Aucune dépendance transitive entre attributs non-clés", "Les deux réponses précédentes", "La table n'a qu'une seule colonne"], correct: 2, explanation: "La 3NF exige que chaque attribut non-clé dépende directement de la clé primaire (pas via un autre attribut non-clé). Elle intègre aussi les contraintes de 1NF et 2NF." },
      { question: "Quelle est la complexité d'une recherche dans un B-Tree index ?", choices: ["O(n)", "O(log n)", "O(1)", "O(n²)"], correct: 1, explanation: "Les B-Tree ont une complexité de recherche O(log n), ce qui les rend efficaces même pour de très grandes tables." },
      { question: "Qu'est-ce que le MVCC (Multiversion Concurrency Control) ?", choices: ["Un type d'index", "Une technique permettant des lectures sans bloquer les écritures", "Un protocole de réplication", "Un type de contrainte"], correct: 1, explanation: "MVCC maintient plusieurs versions d'une ligne pour permettre des lectures cohérentes sans verrou. Utilisé par PostgreSQL, Oracle..." },
      { question: "Que fait EXPLAIN ANALYZE en PostgreSQL ?", choices: ["Crée un plan d'exécution hypothétique", "Exécute la requête et affiche le plan réel avec les timings", "Supprime les indexes inutiles", "Analyse la structure de la table"], correct: 1, explanation: "EXPLAIN ANALYZE exécute réellement la requête et retourne le plan d'exécution avec les temps réels, les estimations de lignes, et les coûts." },
      { question: "Quelle est la différence entre un clustered et un non-clustered index ?", choices: ["Aucune", "Clustered trie physiquement les données, non-clustered crée une structure séparée", "Non-clustered est plus rapide", "Clustered ne peut pas avoir de NULL"], correct: 1, explanation: "Un clustered index définit l'ordre physique des données. Une table ne peut avoir qu'un seul clustered index. Les non-clustered créent une structure de pointeurs séparée." },
      { question: "Qu'est-ce que le sharding horizontal ?", choices: ["Ajouter des colonnes à une table", "Diviser les lignes d'une table sur plusieurs serveurs", "Compresser les données", "Créer des index partiels"], correct: 1, explanation: "Le sharding horizontal partitionne les lignes d'une table sur plusieurs nœuds de base de données, permettant la scalabilité horizontale." },
      { question: "Quelle isolation empêche les lectures fantômes ?", choices: ["READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"], correct: 3, explanation: "SERIALIZABLE est le niveau d'isolation le plus strict. Il prévient les lectures fantômes (phantom reads) mais réduit la concurrence." },
      { question: "Qu'est-ce qu'une table de faits dans un schéma en étoile ?", choices: ["Une table avec les données de référence", "La table centrale qui contient les mesures et les clés étrangères", "Une table avec une seule colonne", "Une table temporaire"], correct: 1, explanation: "Dans un schéma en étoile (datawarehouse), la table de faits contient les métriques mesurables (ventes, quantités) et les FK vers les tables de dimensions." },
    ],
  },
  powerbi: {
    débutant: [
      { question: "Que signifie DAX dans Power BI ?", choices: ["Data Analysis Expressions", "Direct Access eXchange", "Dynamic Analytics eXpert", "Data Aggregation eXtension"], correct: 0, explanation: "DAX (Data Analysis Expressions) est le langage de formules utilisé dans Power BI pour créer des mesures et des colonnes calculées." },
      { question: "Quelle est la différence entre une mesure et une colonne calculée en DAX ?", choices: ["Aucune différence", "Une mesure est calculée à l'exécution, une colonne calculée est stockée", "Une colonne calculée est plus rapide", "Une mesure ne peut pas utiliser SUM"], correct: 1, explanation: "Une mesure est calculée dynamiquement selon le contexte de filtre. Une colonne calculée est calculée au chargement et stockée dans le modèle." },
      { question: "Qu'est-ce qu'une relation dans Power BI ?", choices: ["Un type de graphique", "Un lien entre deux tables via des colonnes communes", "Une formule DAX", "Un rapport partagé"], correct: 1, explanation: "Une relation connecte deux tables via une colonne clé, permettant à Power BI de combiner et filtrer les données entre tables." },
      { question: "Quelle fonction DAX calcule la somme d'une colonne ?", choices: ["CALCULATE()", "SUMX()", "SUM()", "TOTAL()"], correct: 2, explanation: "SUM(Table[Colonne]) calcule la somme de toutes les valeurs d'une colonne dans le contexte de filtre actuel." },
      { question: "Qu'est-ce que le contexte de filtre en DAX ?", choices: ["Un filtre sur les dates uniquement", "L'ensemble des filtres actifs qui influencent un calcul", "Un type de visuel", "Un paramètre de rapport"], correct: 1, explanation: "Le contexte de filtre définit quelles lignes sont visibles lors d'un calcul DAX. Il est créé par les visuels, les filtres, les segments et les relations." },
      { question: "Quel visuel Power BI est le mieux adapté pour montrer l'évolution dans le temps ?", choices: ["Graphique en anneau", "Graphique en courbes", "Jauge", "Treemap"], correct: 1, explanation: "Le graphique en courbes (Line Chart) est idéal pour visualiser des tendances et évolutions dans le temps." },
      { question: "Qu'est-ce que Power Query dans Power BI ?", choices: ["Un langage DAX avancé", "L'outil de transformation et nettoyage de données", "Un type de rapport", "Un connecteur de base de données"], correct: 1, explanation: "Power Query (éditeur de requêtes) permet de se connecter, transformer et nettoyer les données avant de les charger dans le modèle Power BI." },
      { question: "Que fait la fonction CALCULATE() en DAX ?", choices: ["Calcule uniquement des sommes", "Évalue une expression dans un contexte de filtre modifié", "Crée une nouvelle table", "Calcule un pourcentage"], correct: 1, explanation: "CALCULATE(expression, filtre1, filtre2...) est la fonction DAX la plus puissante : elle évalue une expression en modifiant le contexte de filtre." },
    ],
    intermédiaire: [
      { question: "Que fait la fonction RELATED() en DAX ?", choices: ["Crée une relation entre tables", "Retourne une valeur d'une table liée (côté 'un')", "Calcule une moyenne pondérée", "Filtre une table"], correct: 1, explanation: "RELATED() permet d'accéder à une colonne dans une table liée du côté 'un' de la relation. Équivalent d'un VLOOKUP en DAX." },
      { question: "Quelle est la différence entre ALL() et ALLEXCEPT() en DAX ?", choices: ["Aucune", "ALL supprime tous les filtres, ALLEXCEPT supprime tous sauf ceux spécifiés", "ALLEXCEPT est plus rapide", "ALL fonctionne uniquement sur des colonnes"], correct: 1, explanation: "ALL() supprime tous les filtres d'une table/colonne. ALLEXCEPT(table, col1, col2) supprime tous les filtres sauf ceux des colonnes spécifiées." },
      { question: "Que fait DIVIDE(a, b, c) en DAX ?", choices: ["Divise a par b", "Divise a par b, retourne c si b = 0", "Calcule un pourcentage", "Arrondit le résultat"], correct: 1, explanation: "DIVIDE est la division sécurisée de DAX. Le 3e argument optionnel est la valeur retournée en cas de division par zéro (évite les erreurs)." },
      { question: "Qu'est-ce qu'un modèle en étoile vs en flocon dans Power BI ?", choices: ["Deux types de visuels", "En étoile : une table de faits + dimensions dénormalisées. En flocon : dimensions normalisées", "Le flocon est plus performant", "Aucune différence pratique"], correct: 1, explanation: "L'étoile a des dimensions dénormalisées (recommandé Power BI). Le flocon a des dimensions normalisées avec sous-tables. L'étoile est plus performant dans Power BI." },
      { question: "Que signifie le mode DirectQuery dans Power BI ?", choices: ["Les données sont importées et mises en cache", "Les requêtes sont envoyées directement à la source à chaque interaction", "Un mode hors ligne", "Un type de licence"], correct: 1, explanation: "En DirectQuery, Power BI génère des requêtes SQL en temps réel vers la source. Pas de cache local, données toujours à jour mais performances dépendent de la source." },
      { question: "Quelle fonction DAX crée un tableau virtuel de dates ?", choices: ["DATE()", "CALENDAR()", "DATERANGE()", "DATELIST()"], correct: 1, explanation: "CALENDAR(date_début, date_fin) crée une table de dates. CALENDARAUTO() détermine automatiquement la plage depuis le modèle." },
      { question: "Que fait SUMMARIZE() en DAX ?", choices: ["Résume un texte", "Crée un tableau groupé avec des colonnes calculées", "Calcule une médiane", "Filtre les doublons"], correct: 1, explanation: "SUMMARIZE(table, col_groupe1, col_groupe2, 'Nom', expression) crée un tableau regroupé similaire à un GROUP BY." },
      { question: "Quel est l'impact des cardinalités élevées sur les performances Power BI ?", choices: ["Aucun impact", "Ralentit le modèle et augmente la mémoire", "Améliore les performances", "Réduit la taille du fichier"], correct: 1, explanation: "Les colonnes à haute cardinalité (nombreuses valeurs uniques) sont moins bien compressées par le moteur Vertipaq, augmentant la mémoire et ralentissant les requêtes." },
    ],
    expert: [
      { question: "Qu'est-ce que le moteur Vertipaq dans Power BI ?", choices: ["Un type de connecteur", "Le moteur de stockage columnaire en mémoire de Power BI", "Un format de fichier", "Une API REST"], correct: 1, explanation: "Vertipaq est le moteur SSAS Tabular in-memory utilisé par Power BI. Il compresse les données colonne par colonne et les stocke en RAM pour des performances optimales." },
      { question: "Que fait la fonction KEEPFILTERS() en DAX ?", choices: ["Conserve tous les filtres existants lors d'un CALCULATE", "Supprime les filtres", "Crée un filtre persistant", "Filtre par date"], correct: 0, explanation: "KEEPFILTERS() modifie le comportement de CALCULATE : au lieu de remplacer les filtres existants sur une colonne, il les intersecte avec le nouveau filtre." },
      { question: "Quelle est la différence entre une mesure implicite et explicite ?", choices: ["Aucune", "Implicite : générée automatiquement par glisser-déposer. Explicite : définie manuellement en DAX", "Implicite est plus précise", "Explicite utilise SUM automatiquement"], correct: 1, explanation: "Les mesures implicites sont créées automatiquement quand on glisse un champ numérique. Les mesures explicites sont définies manuellement et offrent plus de contrôle." },
      { question: "Qu'est-ce que la propagation de filtres bidirectionnelle ?", choices: ["Un filtre qui s'applique dans les deux sens d'une relation", "Un type de segment", "Une fonctionnalité de RLS", "Un type de jointure"], correct: 0, explanation: "La relation bidirectionnelle permet aux filtres de se propager dans les deux sens entre tables. À utiliser avec précaution car peut causer des ambiguïtés." },
      { question: "Que mesure le DAX Studio ?", choices: ["La taille du fichier .pbix", "Les performances des requêtes DAX et les statistiques Vertipaq", "Le nombre d'utilisateurs", "La qualité des visuels"], correct: 1, explanation: "DAX Studio est un outil d'optimisation permettant d'analyser les requêtes DAX, visualiser le plan d'exécution et mesurer les temps de réponse." },
      { question: "Qu'est-ce que le Row-Level Security (RLS) dans Power BI ?", choices: ["Un type de graphique", "Un mécanisme qui restreint l'accès aux données selon l'utilisateur", "Une fonctionnalité de tri", "Un mode de partage"], correct: 1, explanation: "RLS permet de définir des règles DAX qui filtrent les données selon l'identité de l'utilisateur connecté, garantissant que chacun ne voit que ses données autorisées." },
      { question: "Que fait la fonction TREATAS() en DAX ?", choices: ["Crée un arbre de décision", "Applique les valeurs d'une table comme filtres d'une autre", "Calcule une hiérarchie", "Crée une relation virtuelle"], correct: 1, explanation: "TREATAS(table_valeurs, colonne_cible) applique les valeurs d'une expression tabulaire comme filtre d'une colonne. Permet de créer des relations virtuelles." },
      { question: "Quelle est la meilleure pratique pour les tables de dates dans Power BI ?", choices: ["Utiliser une colonne de dates dans la table de faits", "Créer une table de dates dédiée marquée comme 'Date Table'", "Ne pas utiliser de table de dates", "Importer les dates depuis Excel"], correct: 1, explanation: "Une table de dates dédiée, continue (sans trous), marquée comme 'Date Table' permet d'activer toutes les fonctions Time Intelligence DAX et d'optimiser les performances." },
    ],
  },
  python: {
    débutant: [
      { question: "Quelle est la sortie de print(type(3.14)) ?", choices: ["<class 'int'>", "<class 'float'>", "<class 'double'>", "<class 'number'>"], correct: 1, explanation: "3.14 est un nombre décimal, donc de type float (virgule flottante) en Python." },
      { question: "Que retourne len([1, 2, 3, 4]) ?", choices: ["3", "4", "10", "None"], correct: 1, explanation: "len() retourne le nombre d'éléments dans une liste. La liste [1, 2, 3, 4] a 4 éléments." },
      { question: "Comment accéder au dernier élément d'une liste ma_liste ?", choices: ["ma_liste[last]", "ma_liste[-1]", "ma_liste[end]", "last(ma_liste)"], correct: 1, explanation: "En Python, les indices négatifs partent de la fin. ma_liste[-1] retourne le dernier élément." },
      { question: "Que fait range(0, 10, 2) ?", choices: ["[0, 2, 4, 6, 8, 10]", "[0, 2, 4, 6, 8]", "[2, 4, 6, 8, 10]", "[0, 10, 2]"], correct: 1, explanation: "range(start, stop, step) génère des nombres de 0 à 9 (stop exclu) avec un pas de 2 : 0, 2, 4, 6, 8." },
      { question: "Quelle est la différence entre une liste et un tuple en Python ?", choices: ["Aucune", "La liste est mutable, le tuple est immuable", "Le tuple est plus lent", "La liste ne peut contenir que des nombres"], correct: 1, explanation: "Une liste [] est mutable (modifiable). Un tuple () est immuable (ses éléments ne peuvent pas être changés après création)." },
      { question: "Que fait la méthode .append() sur une liste ?", choices: ["Supprime un élément", "Ajoute un élément à la fin", "Trie la liste", "Inverse la liste"], correct: 1, explanation: ".append(element) ajoute un élément à la fin de la liste." },
      { question: "Comment créer un dictionnaire en Python ?", choices: ["dict = [clé: valeur]", "dict = {clé: valeur}", "dict = (clé, valeur)", "dict = <clé: valeur>"], correct: 1, explanation: "Un dictionnaire Python utilise des accolades avec des paires clé: valeur." },
      { question: "Que signifie l'opérateur ** en Python ?", choices: ["Multiplication", "Puissance/exponentiation", "Commentaire multiligne", "Décompression de dict"], correct: 1, explanation: "** est l'opérateur de puissance. 2**10 = 1024." },
    ],
    intermédiaire: [
      { question: "Quelle est la complexité temporelle d'une recherche dans un set Python ?", choices: ["O(n)", "O(log n)", "O(1) en moyenne", "O(n²)"], correct: 2, explanation: "Les sets Python utilisent des tables de hachage, offrant une complexité O(1) en moyenne." },
      { question: "Que fait ce code : [x**2 for x in range(5) if x % 2 == 0] ?", choices: ["[0, 4, 16]", "[0, 1, 4, 9, 16]", "[4, 16]", "[1, 9, 25]"], correct: 0, explanation: "List comprehension : carrés des nombres pairs de 0 à 4. Pairs : 0, 2, 4 → 0², 2², 4² = 0, 4, 16." },
      { question: "Qu'est-ce qu'un générateur (generator) en Python ?", choices: ["Un type de liste", "Une fonction qui produit les valeurs à la demande avec yield", "Un décorateur", "Une classe abstraite"], correct: 1, explanation: "Un générateur utilise yield au lieu de return. Il produit les valeurs une par une à la demande." },
      { question: "Que fait pandas.DataFrame.groupby() ?", choices: ["Trie les données", "Groupe les lignes par valeurs d'une colonne pour des agrégations", "Fusionne deux DataFrames", "Supprime les NaN"], correct: 1, explanation: "groupby() divise le DataFrame en groupes selon les valeurs d'une colonne, permettant d'appliquer des fonctions d'agrégation." },
      { question: "Quelle est la différence entre .loc et .iloc dans pandas ?", choices: ["Aucune", ".loc utilise les labels, .iloc utilise les positions entières", ".iloc est déprécié", ".loc ne fonctionne pas avec les slices"], correct: 1, explanation: ".loc sélectionne par labels. .iloc sélectionne par positions entières (0, 1, 2...)." },
      { question: "Que fait le décorateur @staticmethod en Python ?", choices: ["Rend la méthode privée", "Crée une méthode qui ne reçoit pas self ni cls", "Mémorise le résultat", "Rend la méthode abstraite"], correct: 1, explanation: "@staticmethod définit une méthode qui appartient à la classe mais ne reçoit pas l'instance (self) ni la classe (cls)." },
      { question: "Qu'est-ce que le GIL (Global Interpreter Lock) en Python ?", choices: ["Un type de variable globale", "Un verrou qui empêche plusieurs threads d'exécuter du bytecode simultanément", "Un module de sécurité", "Un garbage collector"], correct: 1, explanation: "Le GIL est un mutex dans CPython qui n'autorise qu'un seul thread à exécuter du bytecode à la fois." },
      { question: "Que retourne numpy.zeros((3, 4)) ?", choices: ["Une liste de 12 zéros", "Un tableau 3×4 de zéros en float64", "Une erreur", "Un scalaire 0"], correct: 1, explanation: "numpy.zeros((3, 4)) crée un tableau NumPy de 3 lignes et 4 colonnes rempli de 0.0." },
    ],
    expert: [
      { question: "Qu'est-ce que le métaclasse (metaclass) en Python ?", choices: ["Une classe abstraite", "La classe dont les instances sont elles-mêmes des classes", "Un design pattern", "Un type de décorateur"], correct: 1, explanation: "Une métaclasse est la 'classe d'une classe'. type est la métaclasse par défaut de toutes les classes Python." },
      { question: "Que fait functools.lru_cache() ?", choices: ["Crée un cache LRU pour mémoiser les résultats d'une fonction", "Limite la récursion", "Optimise les boucles", "Crée une file d'attente"], correct: 0, explanation: "lru_cache est un décorateur qui mémoïse les résultats d'appels de fonction dans un cache LRU." },
      { question: "Quelle est la complexité de sorted() en Python ?", choices: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], correct: 1, explanation: "Python utilise Timsort, un algorithme hybride avec une complexité O(n log n)." },
      { question: "Qu'est-ce que __slots__ dans une classe Python ?", choices: ["Une liste de méthodes autorisées", "Une déclaration qui remplace __dict__ par des descripteurs fixes, réduisant la mémoire", "Les méthodes dunder disponibles", "Un cache d'attributs"], correct: 1, explanation: "__slots__ empêche la création d'un __dict__ par instance, réduisant la mémoire de ~50%." },
      { question: "Que fait asyncio.gather() ?", choices: ["Rassemble des fichiers", "Lance plusieurs coroutines concurremment et attend leurs résultats", "Gère les exceptions asynchrones", "Crée un event loop"], correct: 1, explanation: "asyncio.gather(*coros) exécute plusieurs coroutines de façon concurrente dans l'event loop." },
      { question: "Quelle est la différence entre deepcopy et copy en Python ?", choices: ["Aucune", "deepcopy copie récursivement tous les objets imbriqués, copy ne copie que le premier niveau", "copy est plus lent", "deepcopy ne fonctionne pas avec les dict"], correct: 1, explanation: "copy.copy() fait une copie superficielle (shallow). copy.deepcopy() copie récursivement tous les objets imbriqués." },
      { question: "Qu'est-ce que le protocole de descripteur en Python ?", choices: ["Un protocole réseau", "Des objets qui définissent __get__, __set__, __delete__ pour contrôler l'accès aux attributs", "Une interface REST", "Un type de générateur"], correct: 1, explanation: "Les descripteurs permettent de customiser l'accès aux attributs d'une classe. property, classmethod, staticmethod sont des descripteurs." },
      { question: "Que fait pandas.melt() ?", choices: ["Trie les colonnes", "Transforme un DataFrame 'wide' en format 'long'", "Fusionne deux DataFrames", "Supprime les NaN"], correct: 1, explanation: "melt() pivote le DataFrame de format large vers le format long. L'inverse de pivot_table()." },
    ],
  },
  excel: {
    débutant: [
      { question: "Quelle formule calcule la somme de A1 à A10 ?", choices: ["=TOTAL(A1:A10)", "=SUM(A1:A10)", "=ADD(A1,A10)", "=SOMME(A1-A10)"], correct: 1, explanation: "=SUM(A1:A10) additionne toutes les cellules de la plage A1 à A10." },
      { question: "Que fait la formule =IF(A1>10, \"Oui\", \"Non\") ?", choices: ["Toujours retourne Oui", "Retourne Oui si A1 > 10, sinon Non", "Génère une erreur", "Retourne le nombre 10"], correct: 1, explanation: "=IF évalue une condition. Si A1 est supérieur à 10, retourne 'Oui', sinon retourne 'Non'." },
      { question: "Qu'est-ce qu'une référence absolue dans Excel ?", choices: ["Une cellule en gras", "Une référence qui ne change pas lors de la copie (ex: $A$1)", "Un nom de cellule", "Une formule complexe"], correct: 1, explanation: "Le signe $ bloque la référence. $A$1 est absolue (ne change pas lors de la copie)." },
      { question: "Quelle fonction cherche une valeur dans la première colonne d'un tableau ?", choices: ["HLOOKUP", "VLOOKUP", "SEARCH", "FIND"], correct: 1, explanation: "VLOOKUP (RECHERCHEV) cherche verticalement une valeur dans la première colonne." },
      { question: "Que fait CTRL+Z dans Excel ?", choices: ["Enregistrer", "Annuler la dernière action", "Supprimer une ligne", "Zoom"], correct: 1, explanation: "CTRL+Z annule la dernière action. CTRL+Y refait l'action annulée." },
      { question: "Qu'est-ce qu'un tableau croisé dynamique (TCD) ?", choices: ["Un tableau avec des couleurs", "Un outil qui résume et agrège des données de façon interactive", "Une formule avancée", "Un graphique 3D"], correct: 1, explanation: "Un TCD (PivotTable) permet de résumer, analyser et croiser des données sans formule." },
      { question: "Quelle formule compte le nombre de cellules non vides de A1 à A20 ?", choices: ["=COUNT(A1:A20)", "=COUNTA(A1:A20)", "=COUNTIF(A1:A20)", "=NBVAL(A1:A20)"], correct: 1, explanation: "COUNTA compte les cellules non vides. COUNT ne compte que les cellules avec des nombres." },
      { question: "Comment figer les volets dans Excel ?", choices: ["Accueil > Figer", "Affichage > Figer les volets", "Insertion > Figer", "Données > Figer"], correct: 1, explanation: "Affichage > Figer les volets permet de figer des lignes/colonnes visibles lors du défilement." },
    ],
    intermédiaire: [
      { question: "Quelle est la différence entre VLOOKUP et INDEX/MATCH ?", choices: ["Aucune", "INDEX/MATCH peut chercher à gauche et est plus flexible", "VLOOKUP est plus rapide", "INDEX/MATCH ne fonctionne pas avec du texte"], correct: 1, explanation: "VLOOKUP cherche toujours à droite. INDEX/MATCH peut chercher dans n'importe quelle direction." },
      { question: "Que fait la formule =SUMIFS(C:C, A:A, \"Paris\", B:B, \">100\") ?", choices: ["Compte les villes", "Somme les valeurs de C où A='Paris' ET B>100", "Somme toute la colonne C", "Génère une erreur"], correct: 1, explanation: "SUMIFS somme selon plusieurs critères simultanément." },
      { question: "Qu'est-ce que Power Query dans Excel ?", choices: ["Un type de graphique", "Un outil de connexion, transformation et chargement de données", "Une fonction de recherche", "Un module VBA"], correct: 1, explanation: "Power Query permet de se connecter à des sources, transformer et charger les données dans Excel." },
      { question: "Que retourne =IFERROR(1/0, \"Erreur\") ?", choices: ["#DIV/0!", "0", "Erreur", "1"], correct: 2, explanation: "IFERROR intercepte les erreurs Excel et retourne la valeur alternative spécifiée." },
      { question: "Quelle est la fonction Excel pour calculer un rang ?", choices: ["=RANK()", "=ORDER()", "=POSITION()", "=SORT()"], correct: 0, explanation: "=RANK(nombre, plage, ordre) retourne le rang d'un nombre dans une liste." },
      { question: "Que fait Ctrl+Maj+Entrée dans Excel (version classique) ?", choices: ["Enregistre le fichier", "Valide une formule matricielle", "Insère une ligne", "Ouvre la mise en forme"], correct: 1, explanation: "Ctrl+Maj+Entrée valide une formule en tant que formule matricielle (array formula)." },
      { question: "Que fait la fonction TEXT(A1, \"JJ/MM/AAAA\") ?", choices: ["Convertit une date en nombre", "Formate une valeur en texte selon un format spécifié", "Extrait le jour", "Crée une date"], correct: 1, explanation: "TEXT() convertit une valeur numérique ou date en texte formaté." },
      { question: "Comment créer une liste déroulante dans une cellule Excel ?", choices: ["Insertion > Liste", "Données > Validation des données", "Accueil > Format", "Formules > Définir un nom"], correct: 1, explanation: "Données > Validation des données > Liste crée une liste déroulante dans une cellule." },
    ],
    expert: [
      { question: "Que fait la fonction XLOOKUP() par rapport à VLOOKUP() ?", choices: ["Ils font la même chose", "XLOOKUP cherche dans n'importe quelle direction, gère les erreurs et retourne des plages", "VLOOKUP est plus rapide", "XLOOKUP ne fonctionne que dans Office 365"], correct: 1, explanation: "XLOOKUP remplace VLOOKUP et HLOOKUP : cherche dans n'importe quelle direction et a un argument d'erreur intégré." },
      { question: "Qu'est-ce qu'une formule dynamique dans Excel 365 ?", choices: ["Une formule qui change automatiquement", "Une formule qui se déverse dans des cellules adjacentes automatiquement", "Une formule avec des références absolues", "Une formule conditionnelle"], correct: 1, explanation: "Les formules dynamiques (dynamic arrays) d'Excel 365 peuvent retourner automatiquement plusieurs résultats qui se 'déversent'." },
      { question: "Que fait la fonction LAMBDA() dans Excel 365 ?", choices: ["Crée une liste Lambda", "Permet de définir des fonctions personnalisées réutilisables sans VBA", "Calcule une valeur conditionnelle", "Filtre des données"], correct: 1, explanation: "LAMBDA() permet de créer des fonctions personnalisées nommées directement en Excel, sans VBA." },
      { question: "Quelle est la différence entre un modèle de données Excel et des plages normales ?", choices: ["Aucune", "Le modèle de données permet des relations entre tables et des mesures DAX", "Le modèle de données est plus lent", "Les plages normales supportent plus de lignes"], correct: 1, explanation: "Le modèle de données Power Pivot permet des relations entre tables, des mesures DAX et peut gérer des millions de lignes." },
      { question: "Que fait SEQUENCE(5, 3) dans Excel 365 ?", choices: ["Crée une séquence de 5 à 3", "Génère un tableau de 5 lignes et 3 colonnes avec des valeurs séquentielles", "Génère 5 puis 3", "Crée 15 cellules aléatoires"], correct: 1, explanation: "SEQUENCE(lignes, colonnes) génère un tableau de nombres séquentiels. SEQUENCE(5, 3) crée un tableau 5×3." },
      { question: "Comment optimiser les performances d'un classeur Excel volumineux ?", choices: ["Utiliser plus de formules VLOOKUP", "Éviter les colonnes entières dans les références, utiliser des tableaux structurés et activer le calcul manuel", "Ajouter plus de feuilles", "Fusionner toutes les cellules"], correct: 1, explanation: "Les bonnes pratiques : références précises (pas A:A), tableaux structurés, calcul manuel pour les grands modèles." },
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

// ─── Stars component ──────────────────────────────────────────────────────────
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
  const [screen, setScreen] = useState<Screen>('map');
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

  // Persist progress
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
      if (lives - 1 <= 0) {
        setTimeout(() => setScreen('defeat'), 1200);
      }
    }
    setTimeout(() => setFlash(null), 400);
  }, [answered, currentQ, selectedDiff, combo, totalQ, lives]);

  const nextQuestion = useCallback(() => {
    if (qIdx + 1 >= totalQ || lives <= 0) {
      const stars = calcStars(correctCount + (selected === currentQ?.correct ? 1 : 0), totalQ);
      const won = lives > 0;
      if (won && selectedDiff) {
        const xp = xpEarned;
        setProgress(prev => {
          const next = { ...prev };
          if (!next[activeTech]) next[activeTech] = {};
          const existing = next[activeTech]![selectedDiff];
          next[activeTech]![selectedDiff] = {
            completed: true,
            stars: Math.max(stars, existing?.stars ?? 0),
            xp: Math.max(xp, existing?.xp ?? 0),
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

  const backToMap = () => { setScreen('map'); setSelectedDiff(null); };

  // ── MAP SCREEN ──────────────────────────────────────────────────────────────
  if (screen === 'map') {
    const lvl = Math.floor(totalXP(progress) / 500) + 1;
    const xpInLevel = totalXP(progress) % 500;
    return (
      <div className="min-h-screen text-white" style={{ background: '#07080f' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <button onClick={() => setLocation('/data-ia')} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
            <ArrowLeft size={16} /> Retour
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Crown size={16} />
              <span className="text-sm font-black">LVL {lvl}</span>
            </div>
            <div className="w-28 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-amber-400" style={{ width: `${(xpInLevel / 500) * 100}%` }} />
            </div>
            <div className="flex items-center gap-1 text-yellow-300">
              <Zap size={14} />
              <span className="text-xs font-bold">{totalXP(progress)} XP</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Title */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-black uppercase tracking-widest bg-white/5 border border-white/10 mb-3">
              <Swords size={12} /> Arena des données
            </div>
            <h1 className="text-4xl font-black tracking-tight">
              <span style={{ color: tech.color }}>DATA</span>{' '}
              <span className="text-white">CHALLENGE</span>
            </h1>
          </div>

          {/* Tech tabs */}
          <div className="flex gap-2 mb-8 flex-wrap justify-center">
            {(Object.entries(TECH_CONFIG) as [TechKey, typeof TECH_CONFIG[TechKey]][]).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const isActive = activeTech === key;
              return (
                <button key={key} onClick={() => setActiveTech(key)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all duration-150 border-2"
                  style={{
                    borderColor: isActive ? cfg.color : 'rgba(255,255,255,0.1)',
                    background: isActive ? `${cfg.color}20` : 'transparent',
                    color: isActive ? cfg.color : '#9ca3af',
                  }}>
                  <Icon size={14} /> {cfg.label}
                </button>
              );
            })}
          </div>

          {/* World label */}
          <div className="text-center mb-6">
            <span className="text-xs uppercase tracking-widest font-bold" style={{ color: tech.color }}>
              ⚔️ {tech.world}
            </span>
          </div>

          {/* Stage map — winding dungeon path */}
          <div className="relative flex flex-col items-center gap-0">
            {[...DIFFICULTIES].reverse().map((diff, revIdx) => {
              const idx = 2 - revIdx;
              const unlocked = isUnlocked(activeTech, diff, progress);
              const stageData = progress[activeTech]?.[diff];
              const completed = stageData?.completed;
              const stars = stageData?.stars ?? 0;
              const boss = BOSSES[activeTech][diff];
              const meta = DIFF_META[diff];
              const isSelected = selectedDiff === diff;
              const offset = idx === 1 ? 80 : idx === 0 ? 160 : 0;

              return (
                <div key={diff} className="flex flex-col items-center w-full">
                  {/* Connector line */}
                  {revIdx > 0 && (
                    <div className="flex flex-col items-center" style={{ marginLeft: `${offset}px` }}>
                      {[...Array(3)].map((_, i) => (
                        <motion.div key={i} className="w-0.5 h-4 my-0.5 rounded-full"
                          style={{ background: unlocked ? tech.color : '#374151' }}
                          animate={unlocked ? { opacity: [0.3, 1, 0.3] } : {}}
                          transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }} />
                      ))}
                    </div>
                  )}

                  {/* Stage node */}
                  <motion.button
                    onClick={() => unlocked && setSelectedDiff(isSelected ? null : diff)}
                    disabled={!unlocked}
                    className="relative"
                    style={{ marginLeft: `${offset}px` }}
                    whileHover={unlocked ? { scale: 1.05 } : {}}
                    whileTap={unlocked ? { scale: 0.97 } : {}}
                  >
                    <div className={`relative flex items-center gap-4 px-6 py-4 border-2 transition-all duration-200 ${
                      !unlocked ? 'opacity-40' : ''
                    }`}
                      style={{
                        borderColor: isSelected ? tech.color : unlocked ? `${tech.color}60` : '#374151',
                        background: isSelected ? `${tech.color}15` : unlocked ? `${tech.color}08` : '#0f1117',
                        boxShadow: isSelected ? `0 0 20px ${tech.color}30` : 'none',
                        minWidth: '320px',
                      }}>
                      {/* Boss emoji */}
                      <div className="text-5xl leading-none w-14 text-center flex-shrink-0"
                        style={{ filter: unlocked ? 'none' : 'grayscale(1)' }}>
                        {unlocked ? boss.emoji : '🔒'}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-black uppercase tracking-widest" style={{ color: tech.color }}>
                            {meta.icon} {meta.label}
                          </span>
                          {completed && <Stars count={stars} size={12} />}
                        </div>
                        <div className="font-black text-lg text-white">{boss.name}</div>
                        <div className="text-xs text-gray-400">{boss.title}</div>
                        {completed && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-amber-400">
                            <Zap size={10} /> {stageData?.xp} XP gagnés
                          </div>
                        )}
                      </div>
                      {!unlocked && <Lock size={20} className="text-gray-600 flex-shrink-0" />}
                      {unlocked && !completed && (
                        <div className="text-xs font-bold px-2 py-1 flex-shrink-0" style={{ background: `${tech.color}20`, color: tech.color }}>
                          NOUVEAU
                        </div>
                      )}
                    </div>

                    {/* Pulse on new unlocked */}
                    {unlocked && !completed && (
                      <motion.div className="absolute inset-0 border-2 pointer-events-none"
                        style={{ borderColor: tech.color }}
                        animate={{ opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }} />
                    )}
                  </motion.button>
                </div>
              );
            })}
          </div>

          {/* Selected stage action */}
          <AnimatePresence>
            {selectedDiff && isUnlocked(activeTech, selectedDiff, progress) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className="mt-10 p-5 border text-center"
                style={{ borderColor: `${tech.color}40`, background: `${tech.color}08` }}>
                <p className="text-sm text-gray-300 mb-1 italic">"{BOSSES[activeTech][selectedDiff].lore}"</p>
                <p className="text-xs text-gray-500 mb-4">
                  8 questions · 3 vies · Combo x{Math.min(4, 1)} max · Récompense : {BOSSES[activeTech][selectedDiff].reward} XP
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => startBattle(selectedDiff)}
                  className="px-10 py-4 font-black text-lg text-white inline-flex items-center gap-3"
                  style={{ background: tech.color }}>
                  <Swords size={20} />
                  ATTAQUER LE BOSS
                  <Swords size={20} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ── BATTLE SCREEN ───────────────────────────────────────────────────────────
  if (screen === 'battle' && currentQ && boss && selectedDiff) {
    const mult = Math.min(combo + 1, 4);
    const timerPct = (timeLeft / 30) * 100;
    const timerColor = timeLeft <= 10 ? '#EF4444' : timeLeft <= 20 ? '#F59E0B' : '#10B981';

    return (
      <div className="min-h-screen relative overflow-hidden text-white select-none"
        style={{ background: tech.bg }}>

        {/* Flash overlay */}
        <AnimatePresence>
          {flash && (
            <motion.div key={flash} className="absolute inset-0 z-50 pointer-events-none"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ background: flash === 'hit' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.35)' }} />
          )}
        </AnimatePresence>

        {/* Grid bg */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(${tech.color}40 1px, transparent 1px), linear-gradient(90deg, ${tech.color}40 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />

        {/* Top HUD */}
        <div className="relative z-10 px-6 py-3 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            {[...Array(3)].map((_, i) => (
              <motion.div key={i} animate={i >= lives ? { scale: [1, 1.3, 0] } : {}} transition={{ duration: 0.3 }}>
                <Heart size={22} fill={i < lives ? '#EF4444' : 'none'} className={i < lives ? 'text-red-500' : 'text-gray-700'} />
              </motion.div>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-gray-400">{qIdx + 1}/{totalQ}</span>
            {combo >= 2 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="px-2 py-1 font-black text-black text-xs"
                style={{ background: combo >= 4 ? '#EF4444' : combo >= 3 ? '#F59E0B' : '#8B5CF6' }}>
                <Flame size={10} className="inline mr-1" />
                COMBO ×{mult}
              </motion.div>
            )}
            <div className="text-yellow-300 flex items-center gap-1">
              <Zap size={12} /> {xpEarned} XP
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-5 gap-6">

          {/* Left: Boss arena */}
          <div className="md:col-span-2 flex flex-col items-center">
            {/* Boss HP bar */}
            <div className="w-full mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-black" style={{ color: tech.color }}>{boss.name}</span>
                <span className="text-red-400 font-bold">{bossHpPct}% HP</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/10">
                <motion.div className="h-full rounded-full"
                  animate={{ width: `${bossHpPct}%` }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  style={{ background: bossHpPct > 50 ? '#EF4444' : bossHpPct > 25 ? '#F59E0B' : '#10B981' }} />
              </div>
            </div>

            {/* Boss card */}
            <motion.div
              animate={bossShake ? { x: [-8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center py-8 px-4 border-2 relative overflow-hidden"
              style={{ borderColor: `${tech.color}50`, background: `${tech.color}08` }}>

              {/* Floating XP */}
              <AnimatePresence>
                {floatXP && (
                  <motion.div key={floatXP.id}
                    className="absolute top-4 right-4 font-black text-lg pointer-events-none z-20"
                    style={{ color: tech.color }}
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: -50, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2 }}>
                    +{floatXP.v} XP {mult > 1 && `×${mult}`}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-8xl mb-3 leading-none" style={{ filter: bossHpPct === 0 ? 'grayscale(1)' : 'none' }}>
                {boss.emoji}
              </div>
              <div className="font-black text-xl text-center mb-1">{boss.name}</div>
              <div className="text-xs text-center" style={{ color: tech.color }}>{boss.title}</div>

              {/* Timer circle */}
              <div className="mt-6 relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
                  <motion.circle cx="32" cy="32" r="26" fill="none" strokeWidth="5"
                    stroke={timerColor}
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - timerPct / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-black">{timeLeft}</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Question */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div key={qIdx}
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -40, opacity: 0 }}
                transition={{ duration: 0.25 }}>

                <div className="mb-5 p-5 border border-white/10 bg-white/5">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: tech.color }}>
                    Question {qIdx + 1}
                  </p>
                  <p className="text-base font-bold text-white leading-relaxed">{currentQ.question}</p>
                </div>

                <div className="space-y-3">
                  {currentQ.choices.map((choice, i) => {
                    const isCorrect = i === currentQ.correct;
                    const isSelected = i === selected;
                    let borderC = 'rgba(255,255,255,0.12)';
                    let bgC = 'rgba(255,255,255,0.04)';
                    let textC = '#d1d5db';
                    if (answered) {
                      if (isCorrect) { borderC = '#10B981'; bgC = 'rgba(16,185,129,0.15)'; textC = '#6ee7b7'; }
                      else if (isSelected) { borderC = '#EF4444'; bgC = 'rgba(239,68,68,0.15)'; textC = '#fca5a5'; }
                      else { borderC = 'rgba(255,255,255,0.05)'; bgC = 'transparent'; textC = '#4b5563'; }
                    }
                    return (
                      <motion.button key={i}
                        whileHover={!answered ? { x: 6 } : {}}
                        whileTap={!answered ? { scale: 0.98 } : {}}
                        onClick={() => handleAnswer(i)}
                        disabled={answered}
                        className="w-full text-left px-4 py-3 border-2 flex items-center gap-3 transition-all duration-150 font-medium text-sm"
                        style={{ borderColor: borderC, background: bgC, color: textC }}>
                        <span className="flex-shrink-0 w-7 h-7 border-2 flex items-center justify-center text-xs font-black rounded-sm"
                          style={{ borderColor: borderC }}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        {choice}
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {answered && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
                      <div className={`p-3 border-l-4 text-sm ${selected === currentQ.correct ? 'border-emerald-500 bg-emerald-900/20 text-emerald-200' : 'border-red-500 bg-red-900/20 text-red-200'}`}>
                        <span className="font-black">{selected === currentQ.correct ? '⚡ TOUCHÉ ! ' : '💥 RATÉ ! '}</span>
                        {currentQ.explanation}
                      </div>
                      <button onClick={nextQuestion}
                        className="w-full py-3 font-black text-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        style={{ background: tech.color }}>
                        {qIdx + 1 >= totalQ ? <><Trophy size={16} /> TERMINER LA BATAILLE</> : <>COUP SUIVANT <ChevronRight size={16} /></>}
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

  // ── VICTORY SCREEN ──────────────────────────────────────────────────────────
  if (screen === 'victory' && boss && selectedDiff) {
    const stars = progress[activeTech]?.[selectedDiff]?.stars ?? 0;
    const nextDiff: Difficulty | null = selectedDiff === 'débutant' ? 'intermédiaire' : selectedDiff === 'intermédiaire' ? 'expert' : null;
    return (
      <div className="min-h-screen flex items-center justify-center text-white" style={{ background: tech.bg }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(${tech.color}40 1px, transparent 1px), linear-gradient(90deg, ${tech.color}40 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        <motion.div className="relative z-10 max-w-lg w-full mx-6 text-center"
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>

          <motion.div className="text-9xl mb-4 leading-none"
            animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.6, delay: 0.3 }}>
            💀
          </motion.div>
          <h2 className="text-3xl font-black mb-1" style={{ color: tech.color }}>BOSS VAINCU !</h2>
          <p className="text-gray-400 mb-6">{boss.name} a été défait !</p>

          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map(s => (
              <motion.div key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + s * 0.15, type: 'spring' }}>
                <Star size={40} fill={s <= stars ? '#F59E0B' : 'none'} className={s <= stars ? 'text-amber-400' : 'text-gray-700'} />
              </motion.div>
            ))}
          </div>

          <div className="border-2 p-6 mb-6 space-y-3" style={{ borderColor: `${tech.color}40`, background: `${tech.color}08` }}>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Réponses correctes</span>
              <span className="font-black text-white">{correctCount}/{totalQ}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">XP gagnés</span>
              <span className="font-black text-yellow-300">+{xpEarned} XP</span>
            </div>
            {nextDiff && (
              <motion.div className="pt-2 border-t border-white/10 text-sm font-bold" style={{ color: tech.color }}
                animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                🔓 Prochain boss débloqué : {BOSSES[activeTech][nextDiff].name}
              </motion.div>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={() => startBattle(selectedDiff)}
              className="flex items-center gap-2 px-5 py-3 font-bold text-sm border-2 hover:bg-white/5 transition-colors"
              style={{ borderColor: tech.color, color: tech.color }}>
              <RotateCcw size={14} /> Rejouer
            </button>
            <button onClick={backToMap}
              className="flex items-center gap-2 px-5 py-3 font-bold text-sm text-black"
              style={{ background: tech.color }}>
              <Map size={14} /> Carte du monde
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── DEFEAT SCREEN ───────────────────────────────────────────────────────────
  if (screen === 'defeat' && boss && selectedDiff) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white" style={{ background: '#0a0000' }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(#ef444440 1px, transparent 1px), linear-gradient(90deg, #ef444440 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <motion.div className="relative z-10 max-w-md w-full mx-6 text-center"
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>

          <motion.div className="text-9xl mb-4 leading-none"
            animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity }}>
            {boss.emoji}
          </motion.div>
          <h2 className="text-4xl font-black mb-2 text-red-500">DÉFAITE</h2>
          <p className="text-gray-400 mb-2">{boss.name} vous a vaincu...</p>
          <p className="text-sm text-gray-500 mb-8">
            {correctCount}/{totalQ} réponses correctes · {xpEarned} XP
          </p>

          <div className="flex gap-3 justify-center">
            <button onClick={() => startBattle(selectedDiff)}
              className="flex items-center gap-2 px-8 py-4 font-black text-black text-lg"
              style={{ background: '#EF4444' }}>
              <RotateCcw size={18} /> RÉESSAYER
            </button>
            <button onClick={backToMap}
              className="flex items-center gap-2 px-6 py-4 font-bold border border-white/20 text-white hover:bg-white/5 transition-colors">
              <Map size={16} /> Carte
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
