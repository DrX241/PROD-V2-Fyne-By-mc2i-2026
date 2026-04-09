import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Trophy, RotateCcw, CheckCircle2, XCircle,
  ChevronRight, Clock, Zap, Target, Star, BarChart3,
  Database, Code2, BarChart2, Table2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

// ─── Couleurs et thème ───────────────────────────────────────────────────────
const TECH_CONFIG = {
  sql: {
    label: 'SQL',
    color: '#0EA5E9',
    bg: 'from-sky-600/30 to-sky-900/40',
    border: 'border-sky-500/40',
    icon: Database,
    description: 'Requêtes, jointures, agrégations, optimisation',
  },
  powerbi: {
    label: 'Power BI',
    color: '#F59E0B',
    bg: 'from-amber-600/30 to-amber-900/40',
    border: 'border-amber-500/40',
    icon: BarChart3,
    description: 'DAX, modélisation, visuels, Power Query',
  },
  python: {
    label: 'Python',
    color: '#8B5CF6',
    bg: 'from-violet-600/30 to-violet-900/40',
    border: 'border-violet-500/40',
    icon: Code2,
    description: 'pandas, numpy, logique, data science',
  },
  excel: {
    label: 'Excel',
    color: '#10B981',
    bg: 'from-emerald-600/30 to-emerald-900/40',
    border: 'border-emerald-500/40',
    icon: Table2,
    description: 'Formules, TCD, graphiques, Power Query',
  },
} as const;

type TechKey = keyof typeof TECH_CONFIG;
type Difficulty = 'débutant' | 'intermédiaire' | 'expert';

interface Question {
  question: string;
  choices: string[];
  correct: number;
  explanation: string;
}

// ─── Banque de questions statiques ──────────────────────────────────────────
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
      { question: "Comment accéder au dernier élément d'une liste ma_liste ?", choices: ["ma_liste[last]", "ma_liste[-1]", "ma_liste[end]", "last(ma_liste)"], correct: 1, explanation: "En Python, les indices négatifs partent de la fin. ma_liste[-1] retourne le dernier élément, ma_liste[-2] l'avant-dernier, etc." },
      { question: "Que fait range(0, 10, 2) ?", choices: ["[0, 2, 4, 6, 8, 10]", "[0, 2, 4, 6, 8]", "[2, 4, 6, 8, 10]", "[0, 10, 2]"], correct: 1, explanation: "range(start, stop, step) génère des nombres de 0 à 9 (stop exclu) avec un pas de 2 : 0, 2, 4, 6, 8." },
      { question: "Quelle est la différence entre une liste et un tuple en Python ?", choices: ["Aucune", "La liste est mutable, le tuple est immuable", "Le tuple est plus lent", "La liste ne peut contenir que des nombres"], correct: 1, explanation: "Une liste [] est mutable (modifiable). Un tuple () est immuable (ses éléments ne peuvent pas être changés après création)." },
      { question: "Que fait la méthode .append() sur une liste ?", choices: ["Supprime un élément", "Ajoute un élément à la fin", "Trie la liste", "Inverse la liste"], correct: 1, explanation: ".append(element) ajoute un élément à la fin de la liste. .insert(index, element) insère à une position spécifique." },
      { question: "Comment créer un dictionnaire en Python ?", choices: ["dict = [clé: valeur]", "dict = {clé: valeur}", "dict = (clé, valeur)", "dict = <clé: valeur>"], correct: 1, explanation: "Un dictionnaire Python utilise des accolades avec des paires clé: valeur. Ex: {'nom': 'Alice', 'age': 30}" },
      { question: "Que signifie l'opérateur ** en Python ?", choices: ["Multiplication", "Puissance/exponentiation", "Commentaire multiligne", "Décompression de dict"], correct: 1, explanation: "** est l'opérateur de puissance. 2**10 = 1024. Il est aussi utilisé pour la décompression de dictionnaires dans les fonctions (**kwargs)." },
    ],
    intermédiaire: [
      { question: "Quelle est la complexité temporelle d'une recherche dans un set Python ?", choices: ["O(n)", "O(log n)", "O(1) en moyenne", "O(n²)"], correct: 2, explanation: "Les sets Python utilisent des tables de hachage, offrant une complexité O(1) en moyenne pour les opérations de recherche, ajout et suppression." },
      { question: "Que fait ce code : [x**2 for x in range(5) if x % 2 == 0] ?", choices: ["[0, 4, 16]", "[0, 1, 4, 9, 16]", "[4, 16]", "[1, 9, 25]"], correct: 0, explanation: "List comprehension : carrés des nombres pairs de 0 à 4. Pairs : 0, 2, 4 → 0², 2², 4² = 0, 4, 16." },
      { question: "Qu'est-ce qu'un générateur (generator) en Python ?", choices: ["Un type de liste", "Une fonction qui produit les valeurs à la demande avec yield", "Un décorateur", "Une classe abstraite"], correct: 1, explanation: "Un générateur utilise yield au lieu de return. Il produit les valeurs une par une à la demande, économisant la mémoire pour les grandes séquences." },
      { question: "Que fait pandas.DataFrame.groupby() ?", choices: ["Trie les données", "Groupe les lignes par valeurs d'une colonne pour des agrégations", "Fusionne deux DataFrames", "Supprime les NaN"], correct: 1, explanation: "groupby() divise le DataFrame en groupes selon les valeurs d'une colonne, permettant d'appliquer des fonctions d'agrégation (sum, mean, count...) sur chaque groupe." },
      { question: "Quelle est la différence entre .loc et .iloc dans pandas ?", choices: ["Aucune", ".loc utilise les labels, .iloc utilise les positions entières", ".iloc est déprécié", ".loc ne fonctionne pas avec les slices"], correct: 1, explanation: ".loc sélectionne par labels (noms d'index/colonnes). .iloc sélectionne par positions entières (0, 1, 2...). Confondre les deux est une erreur courante." },
      { question: "Que fait le décorateur @staticmethod en Python ?", choices: ["Rend la méthode privée", "Crée une méthode qui ne reçoit pas self ni cls", "Mémorise le résultat", "Rend la méthode abstraite"], correct: 1, explanation: "@staticmethod définit une méthode qui appartient à la classe mais ne reçoit pas l'instance (self) ni la classe (cls). Elle ne peut accéder ni à l'une ni à l'autre." },
      { question: "Qu'est-ce que le GIL (Global Interpreter Lock) en Python ?", choices: ["Un type de variable globale", "Un verrou qui empêche plusieurs threads d'exécuter du bytecode simultanément", "Un module de sécurité", "Un garbage collector"], correct: 1, explanation: "Le GIL est un mutex dans CPython qui n'autorise qu'un seul thread à exécuter du bytecode à la fois. C'est pourquoi le multithreading Python n'est pas vraiment parallèle pour les tâches CPU." },
      { question: "Que retourne numpy.zeros((3, 4)) ?", choices: ["Une liste de 12 zéros", "Un tableau 3×4 de zéros en float64", "Une erreur", "Un scalaire 0"], correct: 1, explanation: "numpy.zeros((3, 4)) crée un tableau NumPy de 3 lignes et 4 colonnes rempli de 0.0 (float64 par défaut)." },
    ],
    expert: [
      { question: "Qu'est-ce que le métaclasse (metaclass) en Python ?", choices: ["Une classe abstraite", "La classe dont les instances sont elles-mêmes des classes", "Un design pattern", "Un type de décorateur"], correct: 1, explanation: "Une métaclasse est la 'classe d'une classe'. type est la métaclasse par défaut de toutes les classes Python. Les métaclasses contrôlent la création et le comportement des classes." },
      { question: "Que fait functools.lru_cache() ?", choices: ["Crée un cache LRU pour mémoiser les résultats d'une fonction", "Limite la récursion", "Optimise les boucles", "Crée une file d'attente"], correct: 0, explanation: "lru_cache est un décorateur qui mémoïse les résultats d'appels de fonction dans un cache LRU (Least Recently Used). Évite de recalculer pour les mêmes arguments." },
      { question: "Quelle est la complexité de sorted() en Python ?", choices: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], correct: 1, explanation: "Python utilise Timsort, un algorithme hybride (merge sort + insertion sort) avec une complexité O(n log n) dans le pire cas, O(n) dans le meilleur cas." },
      { question: "Qu'est-ce que __slots__ dans une classe Python ?", choices: ["Une liste de méthodes autorisées", "Une déclaration qui remplace __dict__ par des descripteurs fixes, réduisant la mémoire", "Les méthodes dunder disponibles", "Un cache d'attributs"], correct: 1, explanation: "__slots__ = ['attr1', 'attr2'] empêche la création d'un __dict__ par instance. Les attributs sont stockés dans des descripteurs fixes, réduisant la mémoire de ~50% pour de nombreuses instances." },
      { question: "Que fait asyncio.gather() ?", choices: ["Rassemble des fichiers", "Lance plusieurs coroutines concurremment et attend leurs résultats", "Gère les exceptions asynchrones", "Crée un event loop"], correct: 1, explanation: "asyncio.gather(*coros) exécute plusieurs coroutines de façon concurrente dans l'event loop et retourne leurs résultats dans le même ordre." },
      { question: "Quelle est la différence entre deepcopy et copy en Python ?", choices: ["Aucune", "deepcopy copie récursivement tous les objets imbriqués, copy ne copie que le premier niveau", "copy est plus lent", "deepcopy ne fonctionne pas avec les dict"], correct: 1, explanation: "copy.copy() fait une copie superficielle (shallow). copy.deepcopy() copie récursivement tous les objets imbriqués. Pour des objets avec des références mutuelles, deepcopy gère les cycles." },
      { question: "Qu'est-ce que le protocole de descripteur en Python ?", choices: ["Un protocole réseau", "Des objets qui définissent __get__, __set__, __delete__ pour contrôler l'accès aux attributs", "Une interface REST", "Un type de générateur"], correct: 1, explanation: "Les descripteurs permettent de customiser l'accès aux attributs d'une classe. property, classmethod, staticmethod sont implémentés comme des descripteurs." },
      { question: "Que fait pandas.melt() ?", choices: ["Trie les colonnes", "Transforme un DataFrame 'wide' en format 'long'", "Fusionne deux DataFrames", "Supprime les NaN"], correct: 1, explanation: "melt() pivote le DataFrame de format large (une colonne par variable) vers le format long (une ligne par observation). L'inverse de pivot_table()." },
    ],
  },
  excel: {
    débutant: [
      { question: "Quelle formule calcule la somme de A1 à A10 ?", choices: ["=TOTAL(A1:A10)", "=SUM(A1:A10)", "=ADD(A1,A10)", "=SOMME(A1-A10)"], correct: 1, explanation: "=SUM(A1:A10) (ou =SOMME en français) additionne toutes les cellules de la plage A1 à A10." },
      { question: "Que fait la formule =IF(A1>10, \"Oui\", \"Non\") ?", choices: ["Toujours retourne Oui", "Retourne Oui si A1 > 10, sinon Non", "Génère une erreur", "Retourne le nombre 10"], correct: 1, explanation: "=IF (ou =SI) évalue une condition. Si A1 est supérieur à 10, retourne 'Oui', sinon retourne 'Non'." },
      { question: "Qu'est-ce qu'une référence absolue dans Excel ?", choices: ["Une cellule en gras", "Une référence qui ne change pas lors de la copie (ex: $A$1)", "Un nom de cellule", "Une formule complexe"], correct: 1, explanation: "Le signe $ bloque la référence. $A$1 est absolue (ne change pas). A$1 bloque la ligne. $A1 bloque la colonne." },
      { question: "Quelle fonction cherche une valeur dans la première colonne d'un tableau ?", choices: ["HLOOKUP", "VLOOKUP", "SEARCH", "FIND"], correct: 1, explanation: "VLOOKUP (RECHERCHEV en français) cherche verticalement une valeur dans la première colonne et retourne une valeur de la même ligne dans une autre colonne." },
      { question: "Que fait CTRL+Z dans Excel ?", choices: ["Enregistrer", "Annuler la dernière action", "Supprimer une ligne", "Zoom"], correct: 1, explanation: "CTRL+Z annule la dernière action. CTRL+Y ou CTRL+MAJ+Z refait l'action annulée." },
      { question: "Qu'est-ce qu'un tableau croisé dynamique (TCD) ?", choices: ["Un tableau avec des couleurs", "Un outil qui résume et agrège des données de façon interactive", "Une formule avancée", "Un graphique 3D"], correct: 1, explanation: "Un TCD (PivotTable) permet de résumer, analyser et croiser des données sans formule. Il se met à jour dynamiquement et permet le glisser-déposer des champs." },
      { question: "Quelle formule compte le nombre de cellules non vides de A1 à A20 ?", choices: ["=COUNT(A1:A20)", "=COUNTA(A1:A20)", "=COUNTIF(A1:A20)", "=NBVAL(A1:A20)"], correct: 1, explanation: "COUNTA (NB.SI en français) compte les cellules non vides. COUNT ne compte que les cellules avec des nombres." },
      { question: "Comment figer les volets dans Excel ?", choices: ["Accueil > Figer", "Affichage > Figer les volets", "Insertion > Figer", "Données > Figer"], correct: 1, explanation: "Affichage > Figer les volets permet de figer des lignes/colonnes qui restent visibles lors du défilement." },
    ],
    intermédiaire: [
      { question: "Quelle est la différence entre VLOOKUP et INDEX/MATCH ?", choices: ["Aucune", "INDEX/MATCH peut chercher à gauche et est plus flexible", "VLOOKUP est plus rapide", "INDEX/MATCH ne fonctionne pas avec du texte"], correct: 1, explanation: "VLOOKUP cherche toujours à droite de la colonne de recherche. INDEX/MATCH peut chercher dans n'importe quelle direction, est plus flexible et moins sensible aux modifications de colonnes." },
      { question: "Que fait la formule =SUMIFS(C:C, A:A, \"Paris\", B:B, \">100\") ?", choices: ["Compte les villes", "Somme les valeurs de C où A='Paris' ET B>100", "Somme toute la colonne C", "Génère une erreur"], correct: 1, explanation: "SUMIFS (SOMME.SI.ENS) somme selon plusieurs critères. Ici : somme de C pour les lignes où A='Paris' ET B>100 simultanément." },
      { question: "Qu'est-ce que Power Query dans Excel ?", choices: ["Un type de graphique", "Un outil de connexion, transformation et chargement de données", "Une fonction de recherche", "Un module VBA"], correct: 1, explanation: "Power Query (Obtenir et transformer) permet de se connecter à des sources de données, les transformer via une interface graphique et les charger dans Excel ou le modèle de données." },
      { question: "Que retourne =IFERROR(1/0, \"Erreur\") ?", choices: ["#DIV/0!", "0", "Erreur", "1"], correct: 2, explanation: "IFERROR intercepte les erreurs Excel (#DIV/0!, #N/A, #REF!, etc.) et retourne la valeur alternative spécifiée. Ici, 1/0 génère une erreur, donc retourne 'Erreur'." },
      { question: "Quelle est la fonction Excel pour calculer un rang ?", choices: ["=RANK()", "=ORDER()", "=POSITION()", "=SORT()"], correct: 0, explanation: "=RANK(nombre, plage, ordre) retourne le rang d'un nombre dans une liste. 0 ou omis = décroissant, 1 = croissant." },
      { question: "Que fait Ctrl+Maj+Entrée dans Excel (version classique) ?", choices: ["Enregistre le fichier", "Valide une formule matricielle", "Insère une ligne", "Ouvre la mise en forme"], correct: 1, explanation: "Ctrl+Maj+Entrée valide une formule en tant que formule matricielle (array formula), lui permettant de traiter des plages entières et retourner plusieurs résultats." },
      { question: "Que fait la fonction TEXT(A1, \"JJ/MM/AAAA\") ?", choices: ["Convertit une date en nombre", "Formate une valeur en texte selon un format spécifié", "Extrait le jour", "Crée une date"], correct: 1, explanation: "TEXT() convertit une valeur numérique ou date en texte formaté. Très utile pour concaténer des dates avec du texte." },
      { question: "Comment créer une liste déroulante dans une cellule Excel ?", choices: ["Insertion > Liste", "Données > Validation des données", "Accueil > Format", "Formules > Définir un nom"], correct: 1, explanation: "Données > Validation des données > Liste permet de créer une liste déroulante dans une cellule, limitant les entrées possibles." },
    ],
    expert: [
      { question: "Que fait la fonction XLOOKUP() par rapport à VLOOKUP() ?", choices: ["Ils font la même chose", "XLOOKUP cherche dans n'importe quelle direction, gère les erreurs et retourne des plages", "VLOOKUP est plus rapide", "XLOOKUP ne fonctionne que dans Office 365"], correct: 1, explanation: "XLOOKUP remplace VLOOKUP et HLOOKUP : cherche dans n'importe quelle direction, a un argument d'erreur intégré, peut retourner des plages et supporte les correspondances exactes et approximatives." },
      { question: "Qu'est-ce qu'une formule dynamique dans Excel 365 ?", choices: ["Une formule qui change automatiquement", "Une formule qui se déverse dans des cellules adjacentes automatiquement", "Une formule avec des références absolues", "Une formule conditionnelle"], correct: 1, explanation: "Les formules dynamiques (dynamic arrays) d'Excel 365 peuvent retourner automatiquement plusieurs résultats qui se 'déversent' dans les cellules adjacentes sans Ctrl+Maj+Entrée." },
      { question: "Que fait la fonction LAMBDA() dans Excel 365 ?", choices: ["Crée une liste Lambda", "Permet de définir des fonctions personnalisées réutilisables sans VBA", "Calcule une valeur conditionnelle", "Filtre des données"], correct: 1, explanation: "LAMBDA() permet de créer des fonctions personnalisées nommées directement en Excel, sans VBA. Ces fonctions peuvent être réutilisées dans tout le classeur." },
      { question: "Quelle est la différence entre un modèle de données Excel et des plages normales ?", choices: ["Aucune", "Le modèle de données permet des relations entre tables et des mesures DAX", "Le modèle de données est plus lent", "Les plages normales supportent plus de lignes"], correct: 1, explanation: "Le modèle de données Power Pivot stocke les données en mémoire, permet des relations entre tables, des mesures DAX et peut gérer des millions de lignes." },
      { question: "Que fait SEQUENCE(5, 3) dans Excel 365 ?", choices: ["Crée une séquence de 5 à 3", "Génère un tableau de 5 lignes et 3 colonnes avec des valeurs séquentielles", "Génère 5 puis 3", "Crée 15 cellules aléatoires"], correct: 1, explanation: "SEQUENCE(lignes, colonnes, début, pas) génère un tableau de nombres séquentiels. SEQUENCE(5, 3) crée un tableau 5×3 : 1,2,3,4,...15." },
      { question: "Comment optimiser les performances d'un classeur Excel volumineux ?", choices: ["Utiliser plus de formules VLOOKUP", "Éviter les colonnes entières dans les références, utiliser des tableaux structurés et activer le calcul manuel", "Ajouter plus de feuilles", "Fusionner toutes les cellules"], correct: 1, explanation: "Les bonnes pratiques incluent : références précises (pas A:A), tableaux structurés, calcul manuel pour les grands modèles, éviter les formules volatiles (INDIRECT, OFFSET)." },
      { question: "Que fait la formule =FILTER(A1:C10, B1:B10>100) dans Excel 365 ?", choices: ["Filtre visuellement le tableau", "Retourne dynamiquement les lignes où B>100", "Compte les lignes", "Trie le tableau"], correct: 1, explanation: "FILTER() est une fonction dynamique qui extrait les lignes d'une plage selon un critère. Le résultat se met à jour automatiquement quand les données changent." },
      { question: "Qu'est-ce que le spill range error (#SPILL!) dans Excel 365 ?", choices: ["Une erreur de syntaxe", "Une formule dynamique ne peut pas se déverser car des cellules sont occupées", "Une erreur de référence circulaire", "Une erreur de valeur"], correct: 1, explanation: "#SPILL! se produit quand une formule dynamique tente de se déverser dans des cellules qui contiennent déjà des données. Il faut libérer les cellules adjacentes." },
      { question: "Quelle est la différence entre un graphique incorporé et un graphique sur une feuille dédiée ?", choices: ["Aucune différence", "Un graphique incorporé est dans une feuille, une chart sheet est une feuille entière dédiée au graphique", "La chart sheet ne peut pas être exportée", "Les graphiques incorporés sont plus lents"], correct: 1, explanation: "Un graphique incorporé flotte sur une feuille de données. Une 'chart sheet' est une feuille Excel entièrement dédiée au graphique, utile pour l'impression et les présentations." },
    ],
  },
};

// ─── Composant principal ─────────────────────────────────────────────────────
type Screen = 'hub' | 'quiz' | 'results';

export default function DataChallenge() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [screen, setScreen] = useState<Screen>('hub');
  const [selectedTech, setSelectedTech] = useState<TechKey | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('débutant');

  // Quiz state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<{ correct: boolean; question: string }[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const currentQ = questions[currentIdx];
  const totalQ = questions.length;

  // ── Timer ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!timerActive || answered) return;
    if (timeLeft <= 0) {
      handleAnswer(-1);
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive, answered]);

  // ── Démarrer le quiz ─────────────────────────────────────────────────────
  const startQuiz = useCallback(async (tech: TechKey, diff: Difficulty) => {
    const bank = QUESTION_BANK[tech][diff];
    const shuffled = [...bank].sort(() => Math.random() - 0.5).slice(0, 8);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setScore(0);
    setResults([]);
    setSelectedAnswer(null);
    setAnswered(false);
    setTimeLeft(30);
    setTimerActive(true);
    setScreen('quiz');
  }, []);

  // ── Répondre ─────────────────────────────────────────────────────────────
  const handleAnswer = useCallback((idx: number) => {
    if (answered) return;
    setSelectedAnswer(idx);
    setAnswered(true);
    setTimerActive(false);
    const isCorrect = idx === currentQ?.correct;
    if (isCorrect) setScore(s => s + 1);
    setResults(r => [...r, { correct: isCorrect, question: currentQ?.question || '' }]);
  }, [answered, currentQ]);

  // ── Question suivante ────────────────────────────────────────────────────
  const nextQuestion = useCallback(() => {
    if (currentIdx + 1 >= totalQ) {
      setScreen('results');
      setTimerActive(false);
    } else {
      setCurrentIdx(i => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setTimeLeft(30);
      setTimerActive(true);
    }
  }, [currentIdx, totalQ]);

  // ── Rejouer ──────────────────────────────────────────────────────────────
  const replay = () => {
    if (selectedTech) startQuiz(selectedTech, selectedDifficulty);
  };

  const techCfg = selectedTech ? TECH_CONFIG[selectedTech] : null;
  const pct = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0;

  const difficultyColors: Record<Difficulty, string> = {
    débutant: '#10B981',
    intermédiaire: '#F59E0B',
    expert: '#EF4444',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#041b36] to-[#0c142e] text-white">
      <AnimatePresence mode="wait">

        {/* ─── HUB ──────────────────────────────────────────────────────── */}
        {screen === 'hub' && (
          <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto px-6 py-10">

            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
              <button onClick={() => setLocation('/data-ia')} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm">
                <ArrowLeft size={16} /> Retour
              </button>
            </div>

            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10">
              <div className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 mb-4 bg-blue-500/20 text-blue-400">
                Data & IA
              </div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-3">
                <span className="text-blue-300">Data </span>
                <span className="text-white">Challenge</span>
              </h1>
              <div className="w-16 h-1 bg-blue-400 mb-4" />
              <p className="text-blue-200 text-base max-w-xl">
                Testez et challangez vos compétences sur les outils phares de la data. Choisissez votre technologie et votre niveau.
              </p>
            </motion.div>

            {/* Tech cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
              {(Object.entries(TECH_CONFIG) as [TechKey, typeof TECH_CONFIG[TechKey]][]).map(([key, cfg], i) => {
                const Icon = cfg.icon;
                const isSelected = selectedTech === key;
                return (
                  <motion.button
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -2 }}
                    onClick={() => setSelectedTech(key)}
                    className={`text-left p-6 border-2 bg-gradient-to-br ${cfg.bg} transition-all duration-200 ${
                      isSelected ? 'border-opacity-100 scale-[1.02]' : 'border-opacity-30 hover:border-opacity-60'
                    }`}
                    style={{ borderColor: isSelected ? cfg.color : `${cfg.color}50` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg flex-shrink-0" style={{ background: `${cfg.color}20` }}>
                        <Icon size={24} style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-black" style={{ color: cfg.color }}>{cfg.label}</h3>
                          {isSelected && <CheckCircle2 size={18} style={{ color: cfg.color }} />}
                        </div>
                        <p className="text-sm text-blue-200">{cfg.description}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Difficulty */}
            {selectedTech && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <p className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-4">Niveau de difficulté</p>
                <div className="flex gap-4 flex-wrap">
                  {(['débutant', 'intermédiaire', 'expert'] as Difficulty[]).map(diff => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-6 py-3 font-bold text-sm capitalize border-2 transition-all duration-150 ${
                        selectedDifficulty === diff ? 'text-white' : 'text-blue-300 border-blue-700 hover:border-blue-500'
                      }`}
                      style={selectedDifficulty === diff ? {
                        background: difficultyColors[diff],
                        borderColor: difficultyColors[diff],
                      } : {}}
                    >
                      {diff === 'débutant' && '🌱 '}
                      {diff === 'intermédiaire' && '⚡ '}
                      {diff === 'expert' && '🔥 '}
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {selectedTech && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button
                  onClick={() => startQuiz(selectedTech, selectedDifficulty)}
                  disabled={isGeneratingAI}
                  className="inline-flex items-center gap-3 px-8 py-4 text-white font-black text-base hover:opacity-90 transition-opacity"
                  style={{ background: TECH_CONFIG[selectedTech].color }}
                >
                  <Zap size={20} />
                  Démarrer le challenge
                  <ChevronRight size={20} />
                </button>
                <p className="mt-3 text-xs text-blue-400">8 questions · 30 secondes par question</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ─── QUIZ ─────────────────────────────────────────────────────── */}
        {screen === 'quiz' && currentQ && techCfg && (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto px-6 py-10">

            {/* Progress bar + meta */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-1" style={{ background: `${techCfg.color}20`, color: techCfg.color }}>
                    {techCfg.label}
                  </span>
                  <span className="text-xs text-blue-400 capitalize">{selectedDifficulty}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-blue-300 font-bold">{currentIdx + 1} / {totalQ}</span>
                  <div className={`flex items-center gap-1.5 text-sm font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-blue-300'}`}>
                    <Clock size={14} />
                    {timeLeft}s
                  </div>
                </div>
              </div>
              <Progress value={((currentIdx) / totalQ) * 100} className="h-1.5 bg-blue-900" />
            </div>

            {/* Timer ring */}
            <div className="flex justify-center mb-6">
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#1e3a5f" strokeWidth="4" />
                  <circle cx="28" cy="28" r="24" fill="none" strokeWidth="4"
                    stroke={timeLeft <= 10 ? '#EF4444' : techCfg.color}
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - timeLeft / 30)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-black">{timeLeft}</span>
              </div>
            </div>

            {/* Question */}
            <motion.div
              key={currentIdx}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold text-white leading-relaxed mb-8">{currentQ.question}</h2>

              <div className="space-y-3">
                {currentQ.choices.map((choice, i) => {
                  const isCorrect = i === currentQ.correct;
                  const isSelected = i === selectedAnswer;
                  let bgStyle = 'border-blue-700/50 bg-blue-900/20 hover:border-blue-500 hover:bg-blue-900/40';
                  if (answered) {
                    if (isCorrect) bgStyle = 'border-green-500 bg-green-900/30';
                    else if (isSelected) bgStyle = 'border-red-500 bg-red-900/30';
                    else bgStyle = 'border-blue-900/50 bg-blue-900/10 opacity-50';
                  }
                  return (
                    <motion.button
                      key={i}
                      whileHover={!answered ? { x: 4 } : {}}
                      onClick={() => handleAnswer(i)}
                      disabled={answered}
                      className={`w-full text-left p-4 border-2 transition-all duration-150 flex items-center gap-4 ${bgStyle}`}
                    >
                      <span className="flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black"
                        style={{ borderColor: answered && isCorrect ? '#10B981' : answered && isSelected ? '#EF4444' : techCfg.color }}>
                        {answered && isCorrect ? <CheckCircle2 size={16} className="text-green-400" /> :
                          answered && isSelected ? <XCircle size={16} className="text-red-400" /> :
                            String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm font-medium">{choice}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Explanation + Next */}
            <AnimatePresence>
              {answered && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className={`p-4 border-l-4 ${selectedAnswer === currentQ.correct ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: selectedAnswer === currentQ.correct ? '#10B981' : '#EF4444' }}>
                      {selectedAnswer === currentQ.correct ? '✓ Bonne réponse !' : '✗ Incorrect'}
                    </p>
                    <p className="text-sm text-blue-100">{currentQ.explanation}</p>
                  </div>
                  <button
                    onClick={nextQuestion}
                    className="w-full py-3 font-black text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    style={{ background: techCfg.color }}
                  >
                    {currentIdx + 1 >= totalQ ? <><Trophy size={16} /> Voir mes résultats</> : <>Question suivante <ChevronRight size={16} /></>}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ─── RÉSULTATS ────────────────────────────────────────────────── */}
        {screen === 'results' && techCfg && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto px-6 py-10 text-center">

            <div className="mb-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: `${techCfg.color}20`, border: `3px solid ${techCfg.color}` }}>
                {pct >= 80 ? <Trophy size={40} style={{ color: techCfg.color }} /> :
                  pct >= 50 ? <Target size={40} style={{ color: techCfg.color }} /> :
                    <BarChart2 size={40} style={{ color: techCfg.color }} />}
              </motion.div>

              <h2 className="text-3xl font-black mb-2">
                {pct >= 80 ? 'Excellent !' : pct >= 60 ? 'Bien joué !' : pct >= 40 ? 'Pas mal !' : 'Continuez à vous entraîner !'}
              </h2>
              <p className="text-blue-300 mb-8">{techCfg.label} · {selectedDifficulty}</p>

              {/* Score */}
              <div className="bg-blue-900/30 border border-blue-700/50 p-8 mb-8">
                <div className="text-6xl font-black mb-2" style={{ color: techCfg.color }}>
                  {score}<span className="text-2xl text-blue-400">/{totalQ}</span>
                </div>
                <div className="text-lg text-blue-200 mb-4">{pct}% de réussite</div>
                <div className="flex gap-1 justify-center">
                  {results.map((r, i) => (
                    <div key={i} className="w-8 h-2 rounded-full" style={{ background: r.correct ? '#10B981' : '#EF4444' }} />
                  ))}
                </div>
              </div>

              {/* Stars */}
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3].map(s => (
                  <Star key={s} size={32} fill={pct >= s * 33 ? '#F59E0B' : 'none'} className={pct >= s * 33 ? 'text-amber-400' : 'text-blue-700'} />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center flex-wrap">
                <button onClick={replay}
                  className="inline-flex items-center gap-2 px-6 py-3 font-bold text-white hover:opacity-90 transition-opacity"
                  style={{ background: techCfg.color }}>
                  <RotateCcw size={16} /> Rejouer
                </button>
                <button onClick={() => { setScreen('hub'); setSelectedTech(null); }}
                  className="inline-flex items-center gap-2 px-6 py-3 font-bold border border-blue-700 text-blue-300 hover:border-blue-500 transition-colors">
                  <ArrowLeft size={16} /> Changer de technologie
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
