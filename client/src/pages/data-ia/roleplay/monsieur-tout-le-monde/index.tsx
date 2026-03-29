import React, { useState, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, AlertTriangle, CheckCircle,
  XCircle, Trophy, RefreshCw, Loader2, ChevronRight,
  Star, Target, Zap, Info, X,
  Database, BarChart2, PieChart, TrendingUp, TrendingDown,
  Table, FileSpreadsheet, Filter, AlertOctagon, Brain
} from 'lucide-react';
import mcLogoPath from "@assets/mc2i.png";

const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';

type Level = 'debutant' | 'intermediaire' | 'maitrise';

interface AssessmentOption {
  label: string;
  sublabel?: string;
  score: number;
}

interface AssessmentVisual {
  type: 'spreadsheet' | 'dashboard' | 'pie-chart' | 'histogram';
  body: string;
}

interface AssessmentQuestion {
  id: string;
  question: string;
  context?: string;
  type?: 'standard' | 'interactive';
  visual?: AssessmentVisual;
  options: AssessmentOption[];
}

function shuffleAndPick<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

interface SpreadsheetCell { value: string; bold?: boolean; bg?: string; color?: string; align?: 'left' | 'center' | 'right'; }
interface DashboardMetric { label: string; value: string; delta?: string; deltaUp?: boolean; color?: string; }

interface ScenarioVisual {
  type: 'spreadsheet' | 'dashboard' | 'pie-chart' | 'histogram';
  body: string;
  sheetName?: string;
  headers?: string[];
  rows?: SpreadsheetCell[][];
  metrics?: DashboardMetric[];
  chartTitle?: string;
  chartBars?: { label: string; value: number; color?: string }[];
  slices?: { label: string; value: number; color?: string }[];
  yAxisStart?: number;
  xLabel?: string;
  yLabel?: string;
}

interface ScenarioChoice {
  label: string;
  isCorrect: boolean;
  feedback: string;
  points: number;
}

interface Scenario {
  category: string;
  title: string;
  context: string;
  visual: ScenarioVisual;
  choices: ScenarioChoice[];
  reflexe: string;
  clickConsequence?: string;
  redFlags?: string[];
}

type Phase = 'intro' | 'assessment' | 'level-reveal' | 'loading' | 'error' | 'scenario' | 'trap-clicked' | 'answered' | 'reflexe' | 'final';

// ─── QUESTIONS D'ÉVALUATION — 100% DATA / BI / ANALYTICS ─────────────────────
const ASSESSMENT_BANK: AssessmentQuestion[] = [
  {
    id: 'q-somme-plage',
    question: 'Votre formule Excel =SOMME(B2:B10) affiche 0 alors que les cellules semblent contenir des chiffres. Quelle est la cause la plus probable ?',
    context: '📊 Les cellules affichent bien 125, 340, 87... mais la somme est 0',
    options: [
      { label: 'Les cellules sont au format "Texte" — Excel ne peut pas sommer des nombres stockés en texte', sublabel: 'Un petit triangle vert en haut à gauche des cellules confirme ce problème', score: 2 },
      { label: 'La plage B2:B10 est mal saisie — il faut écrire =SOMME(B:B) à la place', sublabel: 'La plage étendue résoudrait automatiquement le problème', score: 0 },
      { label: 'Des cellules vides dans la plage bloquent le calcul si elles ne sont pas continues', sublabel: 'Excel ignore les cellules vides dans une SOMME', score: 0 },
    ],
  },
  {
    id: 'q-tcd-plage',
    question: 'Vous actualisez un tableau croisé dynamique après avoir ajouté 200 nouvelles lignes. Le TCD n\'inclut pas les nouvelles lignes. Pourquoi ?',
    context: '📊 Données dans A1:E500, TCD créé initialement sur A1:E300',
    options: [
      { label: 'La source de données du TCD pointe toujours sur A1:E300 — il faut mettre à jour la plage source', sublabel: 'Mieux encore : convertir les données en Tableau Excel avant de créer le TCD', score: 2 },
      { label: 'Il faut supprimer et recréer le TCD à chaque ajout de données', sublabel: 'C\'est une contrainte inévitable des tableaux croisés dynamiques', score: 0 },
      { label: 'Les nouvelles lignes doivent être copiées directement dans le TCD', sublabel: 'On peut éditer un TCD manuellement pour y ajouter des données', score: 0 },
    ],
  },
  {
    id: 'q-moyenne-mediane',
    question: 'Les salaires sont : 2 200€, 2 400€, 2 500€, 2 600€, 2 700€, 18 000€ (DG). Quelle mesure représente le mieux le "salaire typique" ?',
    context: '💼 6 employés — un seul salaire très élevé tire la moyenne vers le haut',
    options: [
      { label: 'La médiane (2 550€) — elle n\'est pas influencée par les valeurs extrêmes', sublabel: 'La médiane divise la distribution en deux moitiés égales', score: 2 },
      { label: 'La moyenne (5 567€) — c\'est la mesure standard en statistique', sublabel: 'La moyenne est biaisée par le salaire du DG à 18 000€', score: 0 },
      { label: 'Le mode — la valeur la plus fréquente dans une distribution salariale', sublabel: 'Avec des salaires tous différents, le mode n\'est pas applicable ici', score: 0 },
    ],
  },
  {
    id: 'q-axe-tronque',
    question: 'Un graphique en barres montre Q1=84 et Q4=91. L\'axe Y commence à 82. Quel est le problème ?',
    context: '📊 Visuellement, la barre Q4 semble 5 fois plus grande que Q1',
    options: [
      { label: 'L\'axe Y tronqué exagère visuellement la différence — une hausse de 8% semble un doublement', sublabel: 'Edward Tufte appelle ça un "mensonge visuel" (Lie Factor > 1)', score: 2 },
      { label: 'C\'est une bonne pratique : zoomer sur la plage pertinente pour mieux voir les différences', sublabel: 'Dans un contexte comparatif, l\'axe doit démarrer à 0', score: 0 },
      { label: 'Il faudrait des couleurs différentes pour éviter la confusion entre les barres', sublabel: 'Les couleurs ne résolvent pas le problème de l\'axe tronqué', score: 0 },
    ],
  },
  {
    id: 'q-correlation-causation',
    question: 'Une analyse montre que les villes avec plus de cinémas ont une espérance de vie plus élevée (corrélation 0,78). Que concluez-vous ?',
    context: '📈 Données sur 50 villes françaises — corrélation calculée avec données INSEE',
    options: [
      { label: 'Il existe probablement une variable confondante (richesse de la ville) qui explique les deux', sublabel: 'Corrélation ≠ causalité — une troisième variable peut expliquer la relation', score: 2 },
      { label: 'Aller au cinéma améliore la santé — il faut ouvrir plus de cinémas', sublabel: 'Cette conclusion est prématurée sans étude causale contrôlée', score: 0 },
      { label: 'La corrélation est trop élevée — les données sont probablement fausses', sublabel: 'Une corrélation de 0,78 peut parfaitement être réelle', score: 0 },
    ],
  },
  {
    id: 'q-doublons-crm',
    question: 'Votre responsable data affirme que le taux de fidélité client est de 72%. Que vérifiez-vous en priorité ?',
    context: '🗃️ La base CRM contient 42 000 enregistrements clients',
    options: [
      { label: 'La présence de doublons — un même client en double compte comme 2, ce qui fausse tous les ratios', sublabel: 'Gartner estime que 10-25% des enregistrements CRM sont des doublons', score: 2 },
      { label: 'La définition exacte du taux de fidélité utilisée', sublabel: 'C\'est à vérifier, mais pas la priorité absolue face aux doublons', score: 1 },
      { label: 'Le nombre de clients inactifs — ils ne devraient pas être comptés', sublabel: 'C\'est aussi valide, mais les doublons faussent plus directement le calcul', score: 1 },
    ],
  },
  {
    id: 'q-kpi-definition',
    question: 'Le dashboard affiche "Taux d\'engagement : 23%". Un collègue dit que c\'est bien, un autre que c\'est catastrophique. Quel est le vrai problème ?',
    context: '📊 Le KPI est affiché sans contexte dans le rapport mensuel',
    options: [
      { label: 'Le KPI n\'a ni définition précise ni valeur cible/benchmark — 23% peut être excellent ou catastrophique selon le contexte', sublabel: 'Un KPI sans définition, seuil et contexte est inutile pour la décision', score: 2 },
      { label: 'Le taux devrait être calculé sur 6 mois pour être significatif', sublabel: 'La période est un facteur, mais ce n\'est pas le principal problème ici', score: 1 },
      { label: 'Seul un expert data peut interpréter ce type de KPI', sublabel: 'Si seul un expert peut lire un KPI, c\'est qu\'il est mal conçu', score: 0 },
    ],
  },
  {
    id: 'q-overfitting',
    question: 'Votre modèle de prédiction affiche 98% de précision sur les données d\'entraînement mais seulement 61% sur les nouvelles données. Que se passe-t-il ?',
    context: '📉 Train accuracy: 98% — Test accuracy: 61%',
    options: [
      { label: 'Le modèle est en overfitting — il a mémorisé les données d\'entraînement au lieu d\'apprendre des patterns généralisables', sublabel: 'Un modèle utile doit performer sur des données inédites', score: 2 },
      { label: 'Les données de test sont de mauvaise qualité', sublabel: 'Avant de blâmer les données de test, le gap train/test est un signal classique d\'overfitting', score: 0 },
      { label: 'Il faut utiliser un autre algorithme plus adapté', sublabel: 'Le problème n\'est pas l\'algorithme mais le surajustement', score: 0 },
    ],
  },
  {
    id: 'q-pie-chart-nombreux',
    question: 'Un graphique camembert présente 12 catégories de produits, certains segments représentant moins de 2%. Quel est le problème ?',
    context: '🍕 Les petits segments sont à peine visibles dans le graphique',
    options: [
      { label: 'Un camembert à 12 segments devient illisible — un graphique en barres triées serait plus adapté', sublabel: 'Les camemberts sont recommandés pour 2 à 5 catégories maximum', score: 2 },
      { label: 'Il faut utiliser des couleurs plus contrastées pour distinguer tous les segments', sublabel: 'Même avec 12 couleurs contrastées, les petits segments restent illisibles', score: 0 },
      { label: 'Un camembert 3D permettrait de mieux visualiser les petites catégories', sublabel: 'Les camemberts 3D ajoutent une distorsion visuelle qui empire les problèmes', score: 0 },
    ],
  },
  {
    id: 'q-valeurs-manquantes',
    question: 'Vous importez un CSV de 10 000 lignes. La colonne "chiffre_affaires" a 1 200 valeurs vides (12%). Comment les traiter ?',
    context: '📁 Variable clé avec 12% de données manquantes',
    options: [
      { label: 'Analyser la cause des valeurs manquantes avant de décider — remplacer par 0 si absence de vente, exclure si données non collectées', sublabel: 'Le traitement dépend du contexte métier des données manquantes', score: 2 },
      { label: 'Remplacer toutes les valeurs manquantes par la moyenne de la colonne', sublabel: 'Remplacer par la moyenne peut masquer des patterns importants', score: 0 },
      { label: 'Supprimer toutes les lignes avec des valeurs manquantes', sublabel: 'Supprimer 12% des données peut créer un biais de sélection', score: 0 },
    ],
  },
  {
    id: 'q-outlier',
    question: 'La durée moyenne de livraison est de 8,4 jours. Vos clients confirment recevoir leurs colis en 3-4 jours. Pourquoi cet écart ?',
    context: '📦 95% des livraisons en 3-4 jours, quelques commandes perdues à 45-90 jours',
    options: [
      { label: 'Des valeurs extrêmes (commandes perdues) gonflent la moyenne — la médiane (3 jours) est plus représentative', sublabel: 'La moyenne est très sensible aux outliers — toujours regarder la distribution', score: 2 },
      { label: 'Les données de livraison sont mal collectées', sublabel: 'Possible, mais l\'impact des outliers sur la moyenne est l\'explication principale', score: 0 },
      { label: 'Il faut calculer la moyenne sur les 30 derniers jours pour un chiffre plus fiable', sublabel: 'La période ne change rien si des outliers sont présents', score: 0 },
    ],
  },
  {
    id: 'q-bi-filtre',
    question: 'Votre dashboard Power BI affiche "CA Total : 4,2M€" mais votre manager dit que le vrai CA est de 8,9M€. Que vérifier ?',
    context: '📊 Le rapport a été publié la semaine dernière sans retour négatif',
    options: [
      { label: 'Si un filtre global est actif (région, période, segment) — le dashboard peut n\'afficher qu\'une partie du CA', sublabel: 'Les filtres contextuels non affichés explicitement causent souvent des écarts inexpliqués', score: 2 },
      { label: 'Les données sources ont changé depuis la publication', sublabel: 'Possible, mais le filtre implicite est la cause la plus fréquente', score: 1 },
      { label: 'Power BI arrondit les grands chiffres et peut afficher 4,2M pour 8,9M', sublabel: 'Power BI affiche les chiffres correctement — ce n\'est pas un problème d\'affichage', score: 0 },
    ],
  },
  {
    id: 'q-biais-echantillonnage',
    question: 'Vous enquêtez sur la satisfaction client par email. 78% des répondants se disent satisfaits. Quelle limite majeure voyez-vous ?',
    context: '📧 2 400 répondants sur 15 000 emails envoyés (16% de taux de réponse)',
    options: [
      { label: 'Biais de sélection : seuls les clients engagés (souvent les plus satisfaits) répondent — les insatisfaits ignorent le sondage', sublabel: 'Le biais du répondant rend les enquêtes opt-in peu représentatives', score: 2 },
      { label: 'Le taux de réponse de 16% est trop faible — il faut au moins 50% pour un résultat valide', sublabel: 'Il n\'existe pas de seuil de 50% — c\'est la représentativité qui compte', score: 0 },
      { label: 'Il faut relancer le sondage pour augmenter la participation', sublabel: 'Relancer n\'élimine pas le biais de sélection — les non-répondants restent non-répondants', score: 0 },
    ],
  },
  {
    id: 'q-taux-conversion',
    question: 'Le taux de conversion passe de 2,1% à 3,8% après un changement de design. L\'équipe veut lancer immédiatement. Que vérifier avant ?',
    context: '🛒 Le changement a été déployé un vendredi soir — le test a duré 3 jours (week-end)',
    options: [
      { label: 'Si le test A/B a été mené correctement — 3 jours sur un week-end peut biaiser les résultats', sublabel: 'Le comportement week-end ≠ comportement semaine — et 3 jours peuvent être insuffisants', score: 2 },
      { label: 'Rien — une hausse de 80% du taux de conversion est clairement significative', sublabel: 'Un test sur 3 jours avec biais temporel reste non fiable même avec une grande variation', score: 0 },
      { label: 'Si les données ont bien été enregistrées dans Google Analytics', sublabel: 'La collecte est à vérifier, mais l\'enjeu principal ici est la validité statistique', score: 0 },
    ],
  },
  {
    id: 'q-p-value',
    question: 'Votre test A/B donne p=0,04 après 7 jours. L\'équipe veut lancer la nouvelle version. Que conseillez-vous ?',
    context: '🧪 2 000 visiteurs par variante — amélioration de +4% du taux de conversion',
    options: [
      { label: 'Attendre d\'atteindre la taille d\'échantillon prédéfinie et vérifier l\'absence de biais temporel', sublabel: 'Stopper dès que p<0,05 gonfle le taux de faux positifs (peek problem)', score: 2 },
      { label: 'p=0,04 est sous le seuil de 0,05 — le résultat est statistiquement significatif', sublabel: 'Stopper prématurément biaise les résultats même si p<0,05', score: 0 },
      { label: 'Refaire le test avec un seuil plus strict (p=0,01) pour être plus sûr', sublabel: 'Changer le seuil après avoir vu les résultats est une forme de p-hacking', score: 0 },
    ],
  },
  {
    id: 'q-type-graphique',
    question: 'Vous voulez visualiser l\'évolution du chiffre d\'affaires mensuel sur 2 ans (24 points de données). Quel graphique choisissez-vous ?',
    context: '📈 24 valeurs mensuelles de janvier 2023 à décembre 2024',
    options: [
      { label: 'Graphique en courbe (line chart) — idéal pour montrer l\'évolution d\'une variable dans le temps', sublabel: 'Les courbes permettent de voir les tendances, saisonnalité et ruptures de série', score: 2 },
      { label: 'Graphique camembert — pour montrer la proportion de chaque mois', sublabel: 'Un camembert avec 24 segments serait illisible et ne montre pas l\'évolution temporelle', score: 0 },
      { label: 'Diagramme de dispersion (scatter plot) — pour montrer les variations', sublabel: 'Le scatter est adapté pour des corrélations entre deux variables, pas pour une série temporelle', score: 0 },
    ],
  },
  {
    id: 'q-taux-churn',
    question: 'Votre taux de churn mensuel est de 3%. Votre collègue dit "c\'est négligeable". Quelle est la réalité sur 1 an avec 10 000 clients ?',
    context: '📉 Base de 10 000 clients actifs — churn de 3% par mois',
    options: [
      { label: '3% par mois composé ≈ 31% de clients perdus sur 1 an — soit 3 100 clients', sublabel: 'Calcul : 1 - (1-0,03)^12 = 0,306 — le churn composé est bien plus sévère qu\'il n\'y paraît', score: 2 },
      { label: '3% × 12 = 36% de clients perdus sur 1 an', sublabel: 'Proche mais inexact : le calcul doit être composé', score: 1 },
      { label: '3% par mois c\'est 3% sur l\'année — un taux mensuel est déjà annualisé', sublabel: 'Un taux mensuel de 3% devient ~31% annuel par capitalisation', score: 0 },
    ],
  },
  {
    id: 'q-donnees-categorielles',
    question: 'Vos régions sont encodées : Nord=1, Est=2, Sud=3, Ouest=4. Vous calculez la "région moyenne" à 2,3. Quel est le problème ?',
    context: '🗺️ L\'analyse compare les performances par région',
    options: [
      { label: 'Les données catégorielles ne peuvent pas être moyennées — l\'encodage numérique crée un faux ordre implicite', sublabel: 'Il faut un encodage one-hot ou des dummies pour les catégories sans ordre naturel', score: 2 },
      { label: 'Il faut des codes de région plus précis (codes INSEE) pour éviter le problème', sublabel: 'Des codes INSEE sont aussi des catégories — moyenner 75000 et 69000 n\'aurait pas plus de sens', score: 0 },
      { label: 'La région moyenne de 2,3 s\'arrondit à 2 (Est) — c\'est la région dominante', sublabel: 'Arrondir un encoding numérique ne le rend pas valide statistiquement', score: 0 },
    ],
  },
  {
    id: 'q-granularite',
    question: 'Votre rapport agrège les ventes par mois. Un manager veut savoir quel jour a eu le pic de ventes de mars. Que répondez-vous ?',
    context: '📊 Les données sources sont disponibles à la journée',
    options: [
      { label: 'Les données sources permettent l\'analyse jour par jour — je peux adapter le rapport à cette granularité', sublabel: 'Il faut adapter le rapport aux besoins sans perdre les données sources', score: 2 },
      { label: 'Ce n\'est pas possible — une fois agrégé par mois, on ne peut plus retrouver les données journalières', sublabel: 'L\'agrégation dans le rapport ne détruit pas les données sources', score: 0 },
      { label: 'Il faudrait un autre outil comme Excel pour ce type d\'analyse', sublabel: 'Power BI gère parfaitement les analyses journalières si les sources le permettent', score: 0 },
    ],
  },
  {
    id: 'q-excel-pourcentage',
    question: 'Une cellule Excel affiche "0,2354". Votre manager veut voir "23,54%". Que faites-vous ?',
    context: '📊 La cellule contient déjà la valeur décimale correcte 0,2354',
    options: [
      { label: 'Je change le format de la cellule en "Pourcentage" — Excel multiplie par 100 pour l\'affichage uniquement', sublabel: 'Le format % est un format d\'affichage — la valeur sous-jacente reste 0,2354', score: 2 },
      { label: 'Je multiplie la cellule par 100 dans une nouvelle colonne', sublabel: 'Multiplier change la valeur réelle — les calculs ultérieurs utiliseront 23,54 au lieu de 0,2354', score: 0 },
      { label: 'Je saisis directement "23,54%" dans la cellule', sublabel: 'Saisir manuellement rompt le lien avec les données sources', score: 0 },
    ],
  },
  {
    id: 'q-data-catalog',
    question: 'Votre data lake a 500 tables. Sans documentation, les analystes passent 2h à chercher les bonnes données. Quelle solution mettre en place ?',
    context: '🗄️ 15 équipes utilisent le data lake — chacune a ses propres conventions de nommage',
    options: [
      { label: 'Un catalogue de données avec description, propriétaire, fraîcheur et exemples pour chaque table', sublabel: 'Le data catalog est la solution standard de gouvernance pour les data lakes à grande échelle', score: 2 },
      { label: 'Réduire le nombre de tables en fusionnant les données similaires', sublabel: 'Fusionner des tables métier différentes crée des problèmes de qualité et de gouvernance', score: 0 },
      { label: 'Créer un fichier Excel partagé listant les tables', sublabel: 'Mieux que rien, mais difficile à maintenir à l\'échelle — un outil dédié est nécessaire', score: 1 },
    ],
  },
  {
    id: 'q-biais-confirmation',
    question: 'Vous analysez des données pour prouver qu\'une fonctionnalité améliore les ventes. Vous présentez 5 métriques en hausse et ignorez les 3 en baisse. Quel biais commettez-vous ?',
    context: '📊 8 métriques analysées : 5 en hausse, 3 en baisse — le rapport ne présente que les hausses',
    options: [
      { label: 'Biais de confirmation — on sélectionne les données qui confirment ce qu\'on croit déjà', sublabel: 'C\'est un des biais cognitifs les plus courants en analyse — il faut analyser TOUTES les métriques', score: 2 },
      { label: 'Ce n\'est pas un biais mais une analyse ciblée — on ne peut pas tout analyser', sublabel: 'Ignorer délibérément des données contradictoires est du cherry-picking', score: 0 },
      { label: 'Biais de disponibilité — on analyse les données les plus faciles à obtenir', sublabel: 'Le biais de disponibilité concerne l\'accessibilité des données, pas le choix des résultats favorables', score: 0 },
    ],
  },
  {
    id: 'q-matrice-confusion',
    question: 'Votre modèle de détection de fraude a 99% d\'accuracy. Votre responsable le juge inutilisable. Pourquoi ?',
    context: '🔍 Sur 100 000 transactions : 99 800 légitimes, 200 frauduleuses',
    options: [
      { label: 'Un modèle qui dit "jamais de fraude" atteint 99,8% d\'accuracy — l\'accuracy est une mauvaise métrique sur données déséquilibrées', sublabel: 'Il faut utiliser le recall (taux de détection des fraudes) et la précision', score: 2 },
      { label: 'Le modèle a besoin de plus de données d\'entraînement pour dépasser 99,5%', sublabel: 'Plus de données ne résout pas le problème de la métrique inadaptée', score: 0 },
      { label: 'Les données de test contiennent des biais — il faut les retravailler', sublabel: 'Le problème est la métrique d\'évaluation, pas les données de test', score: 0 },
    ],
  },
  {
    id: 'q-simpson-paradoxe',
    question: 'Un médicament améliore les taux de guérison chez les hommes ET chez les femmes séparément, mais son taux global est inférieur au placebo. Comment est-ce possible ?',
    context: '🏥 Les groupes traitement/placebo ont des proportions très différentes en hommes/femmes',
    options: [
      { label: 'C\'est le paradoxe de Simpson : une variable cachée (proportion hommes/femmes) inverse la tendance globale', sublabel: 'Le médicament a été donné à plus de patients difficiles — faussant la comparaison globale', score: 2 },
      { label: 'Les données sont incorrectes — une amélioration sous-groupe ne peut pas donner un résultat global négatif', sublabel: 'C\'est mathématiquement possible et c\'est précisément le paradoxe de Simpson', score: 0 },
      { label: 'Il faut exclure l\'un des groupes pour avoir un résultat statistiquement valide', sublabel: 'Exclure un groupe ne résout pas le paradoxe — il faut stratifier l\'analyse', score: 0 },
    ],
  },
  {
    id: 'q-model-drift',
    question: 'Votre modèle de scoring de crédit performait à 89% lors du déploiement. 18 mois plus tard, il descend à 71%. Quelle est la cause probable ?',
    context: '🏦 Le modèle a été entraîné sur des données pré-COVID — le contexte économique a changé',
    options: [
      { label: 'Model drift : les comportements économiques ont changé, rendant les patterns appris obsolètes', sublabel: 'Un modèle doit être réentraîné régulièrement sur des données récentes', score: 2 },
      { label: 'Le modèle a des bugs — une baisse de performance après déploiement indique un défaut technique', sublabel: 'Une dégradation progressive est un signe de drift — un bug causerait une chute brutale', score: 0 },
      { label: 'Il faut augmenter la taille du modèle pour améliorer la robustesse', sublabel: 'Augmenter la complexité n\'aide pas si les données récentes ne sont pas incluses', score: 0 },
    ],
  },
  {
    id: 'q-nps',
    question: 'Votre NPS est de +42. Un concurrent affiche +38. Votre directeur affirme que vous êtes "meilleurs". Quelle nuance apportez-vous ?',
    context: '📊 Votre NPS : 1 200 répondants. Concurrent : source publique avec 150 répondants',
    options: [
      { label: 'La différence peut ne pas être statistiquement significative, et les méthodologies de collecte peuvent différer', sublabel: 'Un NPS sur 150 répondants a un intervalle de confiance bien plus large — la comparaison est risquée', score: 2 },
      { label: '+42 vs +38 est clairement une différence significative', sublabel: 'La significativité dépend de la taille des échantillons, pas seulement des valeurs absolues', score: 0 },
      { label: 'Le NPS est trop subjectif pour une comparaison concurrentielle', sublabel: 'Le NPS est utile en comparaison, mais requiert des précautions méthodologiques', score: 0 },
    ],
  },
  {
    id: 'q-saisonnalite',
    question: 'Vous analysez les ventes quotidiennes et remarquez un pic tous les 7 jours. Que concluez-vous ?',
    context: '📅 Données sur 6 mois — le pic revient systématiquement le même jour chaque semaine',
    options: [
      { label: 'Un pattern hebdomadaire (saisonnalité courte) — probablement lié au week-end ou à un jour de promotion récurrent', sublabel: 'Identifier les saisonnalités permet d\'ajuster les prévisions et les opérations', score: 2 },
      { label: 'Les données sont dupliquées tous les 7 jours — un bug de collecte crée des pics artificiels', sublabel: 'Un bug de duplication est possible mais le pattern hebdomadaire est d\'abord une hypothèse métier', score: 0 },
      { label: 'Ce pic n\'est pas significatif — il faut au moins 1 an de données pour identifier un pattern', sublabel: 'Un pattern hebdomadaire peut être identifié sur quelques semaines — 6 mois sont largement suffisants', score: 0 },
    ],
  },
  {
    id: 'q-recherchev-na',
    question: 'Votre RECHERCHEV renvoie #N/A pour certaines valeurs. Que vérifier en premier ?',
    context: '📊 =RECHERCHEV(A2;$D$2:$F$50;2;FAUX) — certaines lignes renvoient #N/A',
    options: [
      { label: 'Les valeurs cherchées peuvent avoir des espaces invisibles ou des formats différents (texte vs nombre)', sublabel: 'Un simple SUPPRESPACE() peut résoudre le problème', score: 2 },
      { label: 'RECHERCHEV ne fonctionne que sur des colonnes triées dans l\'ordre croissant', sublabel: 'Le 4ème argument FAUX demande une correspondance exacte — le tri n\'est pas nécessaire', score: 0 },
      { label: 'La valeur cherchée doit être en majuscules pour que RECHERCHEV fonctionne', sublabel: 'RECHERCHEV n\'est pas sensible à la casse', score: 0 },
    ],
  },
  {
    id: 'q-sql-null',
    question: 'Votre requête SQL filtre sur WHERE département = \'Marketing\' et retourne 45 lignes au lieu des 60 attendus. Quelle est la cause probable ?',
    context: '🗃️ La table contient 500 employés — 60 sont dans le département Marketing',
    options: [
      { label: 'Certains enregistrements ont NULL dans la colonne département — WHERE exclut les NULL par défaut', sublabel: 'NULL ≠ vide — il faut ajouter OR département IS NULL si nécessaire', score: 2 },
      { label: 'SQL est sensible à la casse — certains enregistrements sont écrits "marketing" en minuscules', sublabel: 'Possible aussi, mais le NULL est une cause plus fréquente et subtile', score: 1 },
      { label: 'Le filtre WHERE ne fonctionne pas sur les colonnes texte — il faut utiliser LIKE', sublabel: 'WHERE fonctionne parfaitement sur les colonnes texte avec l\'opérateur =', score: 0 },
    ],
  },
];
const ASSESSMENT_COUNT = 5;
const TOTAL_SCENARIOS = 10;
const MAX_SCORE = TOTAL_SCENARIOS * 10;

function computeLevel(answers: number[]): Level {
  const total = answers.reduce((a, b) => a + b, 0);
  if (total <= 4) return 'debutant';
  if (total <= 8) return 'intermediaire';
  return 'maitrise';
}

const LEVEL_META: Record<Level, { label: string; desc: string; color: string; bg: string }> = {
  debutant: {
    label: 'Découverte', desc: 'Vous débutez avec la data. Les scénarios vont vous exposer aux pièges les plus courants : formules Excel, graphiques trompeurs, données mal qualifiées.',
    color: '#16a34a', bg: '#f0fdf4',
  },
  intermediaire: {
    label: 'Praticien', desc: 'Vous avez quelques bons réflexes. Les scénarios vont tester votre rigueur analytique face à des situations BI et data science réalistes.',
    color: '#d97706', bg: '#fffbeb',
  },
  maitrise: {
    label: 'Expert', desc: 'Vos fondamentaux sont solides. Les scénarios vont confronter vos connaissances aux enjeux avancés : biais statistiques, gouvernance des données, modèles ML en production.',
    color: BLUE, bg: '#eff6ff',
  },
};

interface IAEnrichment { bonnesPratiques: string[]; faitsHistoriques: string[]; resumeCle: string; }

const IA_ENRICHMENT: Record<string, IAEnrichment> = {
  excel: {
    resumeCle: 'Excel est l\'outil le plus utilisé en entreprise — et celui où les erreurs silencieuses coûtent le plus cher. Maîtriser les pièges fondamentaux est essentiel.',
    bonnesPratiques: [
      'Toujours vérifier que les données numériques sont stockées en format Nombre, pas Texte',
      'Convertir les données en Tableau Excel avant de créer un tableau croisé dynamique pour une mise à jour automatique',
      'Utiliser des formules nommées et documenter les calculs complexes',
      'Ne jamais fusionner des cellules dans des tableaux de données — cela casse les TCD et les filtres',
    ],
    faitsHistoriques: [
      'Une erreur de copier-coller dans une feuille Excel a contribué à la perte de 6,2 milliards de dollars par JPMorgan Chase en 2012 (London Whale)',
      'En 2020, le Royaume-Uni a perdu 16 000 données COVID-19 positives car un fichier Excel avait dépassé le nombre maximum de lignes',
      'McKinsey estime que les professionnels passent 20% de leur temps à corriger des erreurs dans des fichiers Excel',
      'Une formule SOMME qui exclut silencieusement la dernière ligne est la cause la plus fréquente d\'erreurs de reporting',
    ],
  },
  bi: {
    resumeCle: 'Un dashboard Power BI ou Tableau bien conçu doit répondre à une question métier précise — pas afficher toutes les données disponibles.',
    bonnesPratiques: [
      'Toujours afficher l\'axe Y depuis 0 dans un graphique en barres pour une comparaison honnête',
      'Rendre les filtres actifs visibles sur le rapport — un filtre caché produit des chiffres incompréhensibles',
      'Définir chaque KPI avec sa formule, sa source et sa fréquence de mise à jour',
      'Limiter un dashboard à 5-7 KPIs maximum — trop de métriques noient l\'information importante',
    ],
    faitsHistoriques: [
      'Gartner estime que 70% des projets BI échouent à cause d\'un manque d\'alignement entre données et besoins métier',
      'Fox News a diffusé en 2012 un graphique avec un axe Y démarrant à 34 — transformant une hausse de 3 points en doublement visuel',
      'La NASA a perdu le Mars Climate Orbiter en 1999 à cause d\'une confusion d\'unités non détectée dans un tableau de bord de mission',
      'Selon Harvard Business Review, les décideurs prennent 40% de meilleures décisions avec des visualisations bien conçues',
    ],
  },
  data_viz: {
    resumeCle: 'Chaque type de graphique a un usage précis. Un mauvais choix de visualisation déforme le message des données autant qu\'une erreur de calcul.',
    bonnesPratiques: [
      'Utiliser un graphique en barres pour comparer des catégories, une courbe pour les séries temporelles',
      'Un camembert ne doit pas dépasser 5 segments — au-delà, utiliser un graphique en barres triées',
      'Éviter les graphiques 3D — la profondeur visuelle distord les proportions réelles',
      'Toujours indiquer la source des données, la période et l\'unité de mesure sur chaque graphique',
    ],
    faitsHistoriques: [
      'Florence Nightingale a inventé le "diagramme de rose" en 1858 pour convaincre la reine Victoria de réformer l\'hygiène hospitalière — premier data storytelling visuel',
      'Edward Tufte a défini le concept de "chartjunk" en 1983 : les éléments visuels qui n\'apportent pas d\'information',
      'Un axe tronqué peut visuellement transformer une hausse de 2% en doublement apparent — technique délibérément utilisée dans certains médias',
      'Le New York Times a développé des formations obligatoires en data viz pour ses 1 700 journalistes',
    ],
  },
  analytics: {
    resumeCle: 'Corrélation ≠ causalité. La moyenne n\'est pas toujours représentative. L\'analyse de données requiert autant de rigueur statistique que de sens métier.',
    bonnesPratiques: [
      'Toujours visualiser la distribution avant de calculer la moyenne — les outliers peuvent la rendre non représentative',
      'Ne jamais conclure à la causalité à partir d\'une corrélation — identifier les variables confondantes',
      'Tester la significativité statistique avant de tirer des conclusions d\'un test A/B',
      'Stratifier les analyses par sous-groupes pour détecter le paradoxe de Simpson',
    ],
    faitsHistoriques: [
      'Le paradoxe de Simpson a été découvert formellement en 1951 — une tendance globale peut être opposée aux tendances de chaque sous-groupe',
      'Une étude publiée dans le NEJM a établi une corrélation entre consommation de chocolat et prix Nobel par pays (r=0,79) — exemple classique de corrélation absurde',
      'Google a constaté en 2009 que son modèle de prédiction de la grippe (Google Flu Trends) surestimait de 2x les cas réels — overfitting sur une corrélation historique',
      'En 2016, une étude montrait que les pompiers ont plus d\'accidents cardiaques — en réalité, ils interviennent davantage lors d\'incendies intenses (variable confondante)',
    ],
  },
  ml_pratique: {
    resumeCle: 'Un modèle ML avec 99% d\'accuracy peut être complètement inutile. L\'évaluation d\'un modèle doit toujours être adaptée au contexte métier et aux données réelles.',
    bonnesPratiques: [
      'Séparer strictement les données d\'entraînement et de test — aucune donnée de test ne doit influencer l\'entraînement',
      'Sur des données déséquilibrées, l\'accuracy est une mauvaise métrique — préférer le recall, la précision ou l\'AUC-ROC',
      'Surveiller le drift du modèle en production : ses performances se dégradent avec le temps si les données changent',
      'Documenter les hypothèses, les données et les décisions prises à chaque étape du pipeline ML',
    ],
    faitsHistoriques: [
      'Un modèle de prédiction de sepsis déployé dans 100 hôpitaux américains avait 70% d\'accuracy en test mais échouait massivement en production (2021)',
      'Amazon a abandonné un système de recrutement par IA qui discriminait systématiquement les femmes — entraîné sur 10 ans de CV majoritairement masculins',
      'Netflix a payé 1M$ pour un algorithme améliorant son RMSE de 10% — mais n\'a jamais déployé le modèle gagnant, jugé trop complexe',
      'Le terme "overfitting" a été popularisé par Leo Breiman dans son article sur les forêts aléatoires (2001)',
    ],
  },
  data_qualite: {
    resumeCle: 'Garbage in, garbage out. La qualité des données détermine la qualité de toute analyse. Une donnée incorrecte produit des décisions incorrectes.',
    bonnesPratiques: [
      'Toujours profiler les données avant d\'analyser : valeurs manquantes, doublons, valeurs aberrantes',
      'Valeurs nulles et zéros ne signifient pas la même chose — vérifier la sémantique métier de chaque champ',
      'Documenter l\'origine, la fraîcheur et le mode de collecte de chaque source de données',
      'Un enregistrement dupliqué dans un CRM peut doubler un CA ou fausser un taux de conversion',
    ],
    faitsHistoriques: [
      'Le Mars Climate Orbiter de la NASA a été perdu en 1999 à cause d\'une confusion entre unités métriques et impériales dans les données',
      'IBM estime que la mauvaise qualité des données coûte à l\'économie américaine 3 100 milliards de dollars par an',
      'Gartner : 60% des initiatives data d\'entreprise échouent à cause de problèmes de qualité des données',
      'Une banque française a découvert en 2022 que 23% de ses clients étaient en double dans son CRM — biaisant tous ses scores de fidélité',
    ],
  },
  sql: {
    resumeCle: 'SQL est le langage de la donnée. Maîtriser les NULL, les JOIN et les agrégations évite des erreurs silencieuses qui faussent toute une analyse.',
    bonnesPratiques: [
      'Les NULL ne sont pas des zéros — WHERE col = NULL ne fonctionne pas, il faut WHERE col IS NULL',
      'Un INNER JOIN peut supprimer silencieusement des lignes si une table ne contient pas toutes les valeurs',
      'GROUP BY avec COUNT(*) compte toutes les lignes, y compris les doublons — utiliser COUNT(DISTINCT id) si nécessaire',
      'Toujours vérifier le nombre de lignes avant et après une jointure pour détecter les duplications',
    ],
    faitsHistoriques: [
      'SQL a été développé par IBM dans les années 1970 — il reste le langage le plus utilisé pour manipuler des données 50 ans plus tard',
      'Un JOIN manquant dans une requête financière a causé une perte de reporting de 48M€ dans une grande banque européenne (2019)',
      'Stack Overflow classe SQL parmi les 3 compétences les plus demandées en data science et analytics depuis 5 ans',
      'Une simple confusion entre LEFT JOIN et INNER JOIN peut réduire un dataset de 30% sans warning ni erreur',
    ],
  },
  statistiques: {
    resumeCle: 'La statistique est le fondement de toute décision basée sur les données. Moyenne, médiane, mode, variance — chaque mesure a un contexte d\'application précis.',
    bonnesPratiques: [
      'La médiane est plus robuste que la moyenne en présence de valeurs extrêmes (salaires, prix immobiliers)',
      'Un écart-type seul ne suffit pas — toujours regarder la distribution complète (histogramme)',
      'La p-value < 0,05 ne prouve pas la causalité — elle indique seulement que le résultat est peu probable sous l\'hypothèse nulle',
      'Un intervalle de confiance représente l\'incertitude de l\'estimation, pas la certitude du résultat',
    ],
    faitsHistoriques: [
      'La loi normale (courbe en cloche) a été formalisée par Carl Friedrich Gauss en 1809 pour modéliser les erreurs de mesure astronomiques',
      'La p-value a été introduite par Ronald Fisher en 1925 — il recommandait lui-même de ne pas l\'utiliser mécaniquement comme seuil de décision',
      'Le paradoxe de Berkson (1946) montre que deux variables peuvent sembler corrélées dans un hôpital uniquement parce que les patients hospitalisés forment un sous-groupe biaisé',
      'Selon Nature (2019), 50% des études publiées utilisant la p-value < 0,05 seraient non reproductibles',
    ],
  },
  gouvernance: {
    resumeCle: 'La gouvernance des données définit qui peut accéder à quoi, comment les données sont documentées, et qui est responsable de leur qualité.',
    bonnesPratiques: [
      'Tout dataset partagé doit avoir un propriétaire identifié (data owner) responsable de sa qualité',
      'Un catalogue de données est indispensable dans tout data lake de plus de 50 tables',
      'Le principe du moindre privilège : chaque utilisateur n\'accède qu\'aux données strictement nécessaires',
      'Documenter la lignée des données (data lineage) pour tracer l\'origine de chaque chiffre dans un rapport',
    ],
    faitsHistoriques: [
      'Le RGPD, entré en vigueur en mai 2018, a imposé la notion de "données personnelles" et de consentement à toute organisation traitant des données de citoyens européens',
      'Facebook a été condamné à 5 milliards de dollars d\'amende par la FTC en 2019 pour mauvaise gouvernance des données personnelles',
      'Gartner prédit que d\'ici 2025, 90% des organisations qui n\'investissent pas dans la gouvernance données échoueront dans leur stratégie data',
      'La notion de "data mesh" (2019) a émergé pour distribuer la responsabilité des données aux équipes métier plutôt qu\'à une seule équipe data centrale',
    ],
  },
  kpi: {
    resumeCle: 'Un KPI sans définition précise, sans seuil et sans contexte est inutile pour la décision. La qualité d\'un KPI se juge à sa capacité à orienter l\'action.',
    bonnesPratiques: [
      'Chaque KPI doit avoir une définition précise, une formule de calcul, une source et une fréquence de mise à jour',
      'Définir un benchmark ou une valeur cible avant de mesurer — un chiffre seul sans référence ne dit rien',
      'Limiter les tableaux de bord à 5-7 KPIs — trop de métriques diluent l\'attention sur ce qui compte vraiment',
      'Le NPS, le CSAT et le CES mesurent la satisfaction client différemment — ne pas les comparer directement',
    ],
    faitsHistoriques: [
      'Le concept de "Balanced Scorecard" de Kaplan et Norton (1992) a popularisé l\'idée de piloter une organisation avec un ensemble équilibré de KPIs financiers et non-financiers',
      'Amazon utilise un concept de "Single Threaded Ownership" : chaque KPI critique a un seul responsable, évitant la dilution des responsabilités',
      'Le NPS (Net Promoter Score) a été inventé par Fred Reichheld en 2003 — il reste l\'un des KPIs satisfaction les plus utilisés malgré ses nombreuses limites',
      'Goodhart\'s Law : "Quand une mesure devient un objectif, elle cesse d\'être une bonne mesure" — les employés optimisent le KPI plutôt que l\'objectif réel',
    ],
  },
};

function getEnrichment(category: string): IAEnrichment {
  const c = category.toLowerCase();
  const keyMap: Record<string, string> = {
    'bi': 'bi', 'dashboard': 'bi', 'power bi': 'bi', 'tableau': 'bi', 'looker': 'bi',
    'kpi': 'kpi', 'metric': 'kpi', 'indicateur': 'kpi', 'nps': 'kpi',
    'data_viz': 'data_viz', 'viz': 'data_viz', 'graphique': 'data_viz', 'visualisation': 'data_viz', 'chart': 'data_viz', 'camembert': 'data_viz', 'histogramme': 'data_viz',
    'analytics': 'analytics', 'analyse': 'analytics', 'corrélation': 'analytics', 'statistique': 'analytics', 'biais': 'analytics',
    'excel': 'excel', 'tableur': 'excel', 'formule': 'excel', 'spreadsheet': 'excel', 'tcd': 'excel', 'vlookup': 'excel', 'recherchev': 'excel',
    'ml': 'ml_pratique', 'machine learning': 'ml_pratique', 'modèle': 'ml_pratique', 'accuracy': 'ml_pratique', 'overfitting': 'ml_pratique', 'drift': 'ml_pratique',
    'data_qualite': 'data_qualite', 'qualité': 'data_qualite', 'doublon': 'data_qualite', 'null': 'data_qualite', 'manquant': 'data_qualite',
    'sql': 'sql', 'requête': 'sql', 'jointure': 'sql', 'join': 'sql',
    'gouvernance': 'gouvernance', 'catalog': 'gouvernance', 'lineage': 'gouvernance', 'rgpd': 'gouvernance',
    'statistiques': 'statistiques', 'p-value': 'statistiques', 'médiane': 'statistiques', 'moyenne': 'statistiques',
  };
  for (const [substr, key] of Object.entries(keyMap)) {
    if (c.includes(substr)) return IA_ENRICHMENT[key];
  }
  const key = Object.keys(IA_ENRICHMENT).find(k => c.includes(k));
  return key ? IA_ENRICHMENT[key] : {
    resumeCle: 'La data est un actif stratégique — sa qualité, sa gouvernance et son interprétation rigoureuse sont la clé de décisions fiables.',
    bonnesPratiques: [
      'Toujours questionner la source et la fraîcheur des données avant de les analyser',
      'Distinguer corrélation et causalité — un lien statistique ne prouve pas un lien de cause à effet',
      'Documenter les définitions des KPIs et les formules de calcul pour chaque rapport',
      'Vérifier la qualité des données (doublons, valeurs manquantes, outliers) avant toute analyse',
    ],
    faitsHistoriques: [
      'IBM estime que la mauvaise qualité des données coûte 3 100 milliards de dollars par an à l\'économie américaine',
      'Gartner : 60% des initiatives data échouent à cause de problèmes de qualité des données',
      'Une erreur Excel a contribué à la perte de 6,2 milliards de dollars par JPMorgan Chase (London Whale, 2012)',
      'Le paradoxe de Simpson peut inverser complètement une tendance globale — vérifier toujours les sous-groupes',
    ],
  };
}

function getBadge(score: number) {
  const pct = (score / MAX_SCORE) * 100;
  if (pct >= 70) return { label: 'Utilisateur Éclairé', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
  if (pct >= 40) return { label: 'Utilisateur Prudent', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
  return { label: 'Utilisateur Naïf', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
}


// ─── BANQUE DE SCÉNARIOS DATA / BI / ANALYTICS ────────────────────────────────
const MTM_BANK: Record<Level, Scenario[]> = {

  // ────────────────── DÉBUTANT ──────────────────────────────────────────────
  debutant: [
    {
      category: 'excel',
      title: 'La SOMME qui oublie des lignes',
      context: 'Vous préparez le rapport mensuel des ventes. Votre formule SOMME affiche 312 450€ mais votre collègue dit que le total devrait approcher 350 000€.',
      visual: {
        type: 'spreadsheet',
        sheetName: 'Ventes Janvier',
        body: 'La cellule B12 contient =SOMME(B2:B10) — cliquez sur B12 pour voir la formule',
        headers: ['Région', 'CA (€)', 'Unités', 'Marge'],
        rows: [
          [{ value: 'Nord', align: 'left' }, { value: '45 200', align: 'right' }, { value: '124', align: 'right' }, { value: '38%', align: 'right' }],
          [{ value: 'Est', align: 'left' }, { value: '38 750', align: 'right' }, { value: '98', align: 'right' }, { value: '41%', align: 'right' }],
          [{ value: 'Sud', align: 'left' }, { value: '62 100', align: 'right' }, { value: '187', align: 'right' }, { value: '35%', align: 'right' }],
          [{ value: 'Ouest', align: 'left' }, { value: '29 800', align: 'right' }, { value: '76', align: 'right' }, { value: '44%', align: 'right' }],
          [{ value: 'Paris', align: 'left' }, { value: '89 400', align: 'right' }, { value: '243', align: 'right' }, { value: '42%', align: 'right' }],
          [{ value: 'Lyon', align: 'left' }, { value: '31 200', align: 'right' }, { value: '88', align: 'right' }, { value: '39%', align: 'right' }],
          [{ value: 'Bordeaux', align: 'left' }, { value: '18 600', align: 'right' }, { value: '54', align: 'right' }, { value: '36%', align: 'right' }],
          [{ value: 'Marseille', align: 'left' }, { value: '52 400', align: 'right' }, { value: '156', align: 'right' }, { value: '37%', align: 'right' }],
          [{ value: 'Nantes', align: 'left' }, { value: '44 800', align: 'right' }, { value: '128', align: 'right' }, { value: '40%', align: 'right' }],
          [{ value: 'Strasbourg', align: 'left' }, { value: '37 200', align: 'right' }, { value: '105', align: 'right' }, { value: '38%', align: 'right' }],
          [{ value: 'TOTAL', bold: true, align: 'left', bg: '#e2efda' }, { value: '=SOMME(B2:B10)', bold: true, align: 'right', bg: '#e2efda', color: '#217346' }, { value: '?', bold: true, align: 'right', bg: '#e2efda' }, { value: '', align: 'right', bg: '#e2efda' }],
        ],
      },
      choices: [
        { label: 'J\'envoie le rapport — la formule SOMME ne peut pas se tromper', isCorrect: false, points: -10, feedback: 'La formule =SOMME(B2:B10) exclut Strasbourg (ligne B11) ! La plage devrait être B2:B11. Cette erreur silencieuse représente 37 200€ manquants dans le reporting.' },
        { label: 'Je vérifie la plage de la formule — elle peut exclure des lignes silencieusement', isCorrect: true, points: 10, feedback: 'Correct ! La formule =SOMME(B2:B10) s\'arrête à la ligne 10 et oublie Strasbourg (ligne 11). La bonne formule est =SOMME(B2:B11). Ce type d\'erreur est fréquent lors de copier-coller.' },
        { label: 'Je demande à mon collègue de recalculer à la main pour comparer', isCorrect: false, points: -5, feedback: 'Comparer à la main ne détecte pas le problème systématique. Il faut inspecter la plage de la formule elle-même.' },
      ],
      reflexe: 'Toujours vérifier la plage des formules SOMME après ajout de lignes. Convertir les données en Tableau Excel évite ce problème : la SOMME s\'étend automatiquement.',
      redFlags: ['Plage B2:B10 exclut la ligne 11', 'Écart de ~37 200€ entre le total affiché et la somme réelle', 'Erreur silencieuse — Excel ne signale pas l\'exclusion'],
    },
    {
      category: 'data_viz',
      title: 'Le camembert qui ne dit rien',
      context: 'Un chef de projet vous montre ce graphique pour "visualiser la répartition des ventes par produit". Il a l\'air fier de son travail.',
      visual: {
        type: 'pie-chart',
        chartTitle: 'Répartition des ventes par produit — Q1 2024',
        body: '14 catégories de produits dans le graphique',
        slices: [
          { label: 'Ordinateurs portables', value: 23, color: '#006a9e' },
          { label: 'Smartphones', value: 18, color: '#dd0061' },
          { label: 'Tablettes', value: 12, color: '#f59e0b' },
          { label: 'Écrans', value: 9, color: '#10b981' },
          { label: 'Claviers', value: 7, color: '#8b5cf6' },
          { label: 'Souris', value: 6, color: '#ef4444' },
          { label: 'Casques audio', value: 5, color: '#06b6d4' },
          { label: 'Webcams', value: 4, color: '#84cc16' },
          { label: 'Chargeurs', value: 4, color: '#f97316' },
          { label: 'Câbles', value: 3, color: '#ec4899' },
          { label: 'Hubs USB', value: 3, color: '#6366f1' },
          { label: 'Accessoires', value: 3, color: '#14b8a6' },
          { label: 'Logiciels', value: 2, color: '#a78bfa' },
          { label: 'Garanties', value: 1, color: '#94a3b8' },
        ],
      },
      choices: [
        { label: 'Le graphique est bien — il montre clairement toutes les catégories', isCorrect: false, points: -10, feedback: 'Avec 14 segments, la moitié sont impossibles à distinguer. Les segments inférieurs à 3% se chevauchent et leurs étiquettes se superposent.' },
        { label: 'Un camembert à 14 segments est illisible — il faut utiliser un graphique en barres triées', isCorrect: true, points: 10, feedback: 'Exactement ! Les camemberts sont recommandés pour 2 à 5 catégories maximum. Avec 14 catégories, un graphique en barres horizontales triées par valeur décroissante serait infiniment plus lisible.' },
        { label: 'Il faut utiliser un camembert 3D pour mieux distinguer les petits segments', isCorrect: false, points: -10, feedback: 'Les camemberts 3D aggravent le problème : la perspective distord les proportions et rend les petits segments encore plus invisibles.' },
      ],
      reflexe: 'Un camembert fonctionne pour 2-5 catégories bien distinctes. Au-delà, préférez un graphique en barres horizontales triées par valeur. Regroupez les petites catégories en "Autres".',
      redFlags: ['14 segments illisibles', 'Segments de 1-3% invisibles', 'Étiquettes se chevauchant'],
    },
    {
      category: 'bi',
      title: 'La croissance spectaculaire… ou pas',
      context: 'Votre directeur vous montre ce dashboard Power BI en réunion : "Regardez cette croissance exceptionnelle de nos ventes !" Il est rayonnant.',
      visual: {
        type: 'histogram',
        chartTitle: 'Évolution des ventes mensuelles',
        body: 'Dashboard Power BI — rapport mensuel direction',
        yAxisStart: 890000,
        chartBars: [
          { label: 'Jan', value: 901000, color: '#006a9e' },
          { label: 'Fév', value: 908000, color: '#006a9e' },
          { label: 'Mar', value: 912000, color: '#006a9e' },
          { label: 'Avr', value: 918000, color: '#006a9e' },
          { label: 'Mai', value: 924000, color: '#dd0061' },
        ],
        xLabel: 'Axe Y commence à 890 000€ — pas à 0',
      },
      choices: [
        { label: 'La croissance est réelle — les chiffres sont là, la courbe monte fortement', isCorrect: false, points: -10, feedback: 'Les ventes sont passées de 901 000€ à 924 000€ — une hausse de 2,5%, pas de 400%. L\'axe Y tronqué (commençant à 890 000€ au lieu de 0) transforme une variation modeste en envolée spectaculaire.' },
        { label: 'L\'axe Y tronqué exagère visuellement la croissance — il faut reconstruire le graphique depuis 0', isCorrect: true, points: 10, feedback: 'Correct ! Un axe Y démarrant à 890 000€ transforme une hausse de 2,5% en "doublement visuel". Edward Tufte appelle ça le Lie Factor : la variation visuelle perçue divisée par la variation réelle dans les données.' },
        { label: 'Il faut comparer à l\'année précédente avant de conclure', isCorrect: false, points: 0, feedback: 'Comparer est utile, mais le problème fondamental est l\'axe tronqué qui rend la comparaison actuelle déjà mensongère visuellement.' },
      ],
      reflexe: 'Un graphique en barres doit toujours démarrer son axe Y à 0 pour une comparaison honnête. L\'axe tronqué amplifie visuellement des variations mineures — outil délibéré de manipulation ou erreur courante.',
      redFlags: ['Axe Y démarrant à 890 000€ au lieu de 0', 'Hausse réelle de 2,5% apparaissant comme un quasi-doublement', 'Aucune indication de l\'échelle complète'],
    },
    {
      category: 'excel',
      title: 'Le RECHERCHEV qui plante à mi-chemin',
      context: 'Vous croisez deux fichiers : une liste de clients et leurs factures. RECHERCHEV fonctionne pour certains clients mais affiche #N/A pour d\'autres.',
      visual: {
        type: 'spreadsheet',
        sheetName: 'Croisement clients',
        body: 'Certaines cellules affichent #N/A — cliquez pour voir les valeurs',
        headers: ['Client', 'Code', 'CA lookup', 'Statut'],
        rows: [
          [{ value: 'Société Alpha', align: 'left' }, { value: 'CLI001', align: 'center' }, { value: '45 200', align: 'right', color: '#16a34a' }, { value: '✓', align: 'center', color: '#16a34a' }],
          [{ value: 'Beta Corp', align: 'left' }, { value: 'CLI002 ', align: 'center', bg: '#fff3cd' }, { value: '#N/A', align: 'right', color: '#dc2626', bold: true }, { value: '✗', align: 'center', color: '#dc2626' }],
          [{ value: 'Gamma SARL', align: 'left' }, { value: 'CLI003', align: 'center' }, { value: '28 600', align: 'right', color: '#16a34a' }, { value: '✓', align: 'center', color: '#16a34a' }],
          [{ value: 'Delta SAS', align: 'left' }, { value: 'cli004', align: 'center', bg: '#fff3cd' }, { value: '#N/A', align: 'right', color: '#dc2626', bold: true }, { value: '✗', align: 'center', color: '#dc2626' }],
          [{ value: 'Epsilon SA', align: 'left' }, { value: 'CLI005', align: 'center' }, { value: '67 800', align: 'right', color: '#16a34a' }, { value: '✓', align: 'center', color: '#16a34a' }],
        ],
      },
      choices: [
        { label: 'Je supprime les lignes avec #N/A — elles sont probablement vides', isCorrect: false, points: -10, feedback: 'Supprimer des clients valides à cause d\'un problème de format est dangereux. CLI002 et cli004 sont de vrais clients avec des codes légèrement différents.' },
        { label: 'Je vérifie les espaces ou formats différents dans les codes clients (espace invisible, casse)', isCorrect: true, points: 10, feedback: 'Exactement ! CLI002 a un espace invisible après le code (CLI002 ≠ CLI002), et cli004 est en minuscules alors que la table de référence a CLI004 en majuscules. SUPPRESPACE() et MAJUSCULE() règlent le problème.' },
        { label: 'RECHERCHEV nécessite que les données soient triées — je trie la colonne code', isCorrect: false, points: -5, feedback: 'Avec le 4ème argument FAUX, RECHERCHEV fait une correspondance exacte et ne nécessite pas de tri. Le problème est dans la qualité des données, pas dans le tri.' },
      ],
      reflexe: 'Les #N/A dans un RECHERCHEV signalent souvent des problèmes de qualité de données : espaces invisibles, casse différente, types incompatibles (texte vs nombre). Toujours profiler les données clés avant de croiser.',
      redFlags: ['Espace invisible après CLI002', 'cli004 en minuscules vs CLI004 dans la table de référence', '40% d\'échecs de correspondance'],
    },
    {
      category: 'statistiques',
      title: 'La moyenne qui ment sur les salaires',
      context: 'Votre DRH annonce en réunion : "La rémunération moyenne dans notre entreprise est de 4 850€ brut — nous sommes très compétitifs !" Vous trouvez ce chiffre surprenant.',
      visual: {
        type: 'spreadsheet',
        sheetName: 'Données salariales',
        body: 'Distribution des salaires dans l\'équipe',
        headers: ['Employé', 'Salaire (€)', 'Poste'],
        rows: [
          [{ value: 'Collaborateur 1', align: 'left' }, { value: '2 200', align: 'right' }, { value: 'Analyste junior', align: 'left' }],
          [{ value: 'Collaborateur 2', align: 'left' }, { value: '2 400', align: 'right' }, { value: 'Analyste', align: 'left' }],
          [{ value: 'Collaborateur 3', align: 'left' }, { value: '2 500', align: 'right' }, { value: 'Analyste', align: 'left' }],
          [{ value: 'Collaborateur 4', align: 'left' }, { value: '2 700', align: 'right' }, { value: 'Analyste senior', align: 'left' }],
          [{ value: 'Collaborateur 5', align: 'left' }, { value: '2 900', align: 'right' }, { value: 'Lead analyste', align: 'left' }],
          [{ value: 'Directeur général', align: 'left' }, { value: '34 500', align: 'right', color: '#dc2626' }, { value: 'DG', align: 'left' }],
          [{ value: 'MOYENNE', bold: true, align: 'left', bg: '#fef2f2' }, { value: '4 867', bold: true, align: 'right', bg: '#fef2f2', color: '#dc2626' }, { value: '← Tirée par le DG', align: 'left', bg: '#fef2f2', color: '#dc2626' }],
          [{ value: 'MÉDIANE', bold: true, align: 'left', bg: '#f0fdf4' }, { value: '2 600', bold: true, align: 'right', bg: '#f0fdf4', color: '#16a34a' }, { value: '← Valeur représentative', align: 'left', bg: '#f0fdf4', color: '#16a34a' }],
        ],
      },
      choices: [
        { label: 'La moyenne de 4 867€ est fiable — c\'est une mesure statistique valide', isCorrect: false, points: -10, feedback: 'La moyenne est massivement distordue par le salaire du DG à 34 500€. Elle ne représente pas du tout le "salaire typique" de l\'entreprise.' },
        { label: 'La médiane (2 600€) est plus représentative — la moyenne est tirée par le salaire du DG', isCorrect: true, points: 10, feedback: 'Exactement ! La médiane divise la distribution en deux moitiés égales et n\'est pas influencée par les valeurs extrêmes (outliers). Ici, 5 personnes gagnent entre 2 200€ et 2 900€ — la médiane de 2 600€ reflète la réalité.' },
        { label: 'Il faut utiliser le mode — la valeur la plus fréquente dans les données', isCorrect: false, points: -5, feedback: 'Avec des salaires tous différents, le mode n\'a pas de sens. La médiane est la mesure adaptée pour une distribution avec des outliers.' },
      ],
      reflexe: 'La moyenne est sensible aux valeurs extrêmes (outliers). Pour les salaires, prix immobiliers, temps de livraison — préférer la médiane. Toujours regarder la distribution, pas seulement un chiffre résumé.',
      redFlags: ['1 outlier (DG à 34 500€) tire la moyenne vers le haut', 'Écart de 2 267€ entre moyenne (4 867€) et médiane (2 600€)', 'Communication trompeuse sans préciser "médiane vs moyenne"'],
    },
    {
      category: 'data_qualite',
      title: 'Les doublons qui gonflent le CA',
      context: 'Votre responsable CRM est ravi : "Nos ventes ont augmenté de 23% ce trimestre !" En regardant les données, vous êtes moins enthousiaste.',
      visual: {
        type: 'spreadsheet',
        sheetName: 'Export CRM Q2',
        body: 'Données brutes exportées — certaines lignes semblent se répéter',
        headers: ['ID', 'Client', 'Montant (€)', 'Date', 'Statut'],
        rows: [
          [{ value: 'CMD-001', align: 'center' }, { value: 'Martin SA', align: 'left' }, { value: '12 400', align: 'right' }, { value: '15/04', align: 'center' }, { value: 'Facturé', align: 'center', color: '#16a34a' }],
          [{ value: 'CMD-002', align: 'center' }, { value: 'Dupont & Co', align: 'left' }, { value: '8 700', align: 'right' }, { value: '16/04', align: 'center' }, { value: 'Facturé', align: 'center', color: '#16a34a' }],
          [{ value: 'CMD-001', align: 'center', bg: '#fef3c7' }, { value: 'Martin SA', align: 'left', bg: '#fef3c7' }, { value: '12 400', align: 'right', bg: '#fef3c7', color: '#d97706' }, { value: '15/04', align: 'center', bg: '#fef3c7' }, { value: 'Facturé', align: 'center', bg: '#fef3c7', color: '#d97706' }],
          [{ value: 'CMD-003', align: 'center' }, { value: 'Leroy SARL', align: 'left' }, { value: '21 300', align: 'right' }, { value: '17/04', align: 'center' }, { value: 'Facturé', align: 'center', color: '#16a34a' }],
          [{ value: 'CMD-004', align: 'center' }, { value: 'Bernard Inc', align: 'left' }, { value: '5 600', align: 'right' }, { value: '18/04', align: 'center' }, { value: 'Facturé', align: 'center', color: '#16a34a' }],
          [{ value: 'CMD-003', align: 'center', bg: '#fef3c7' }, { value: 'Leroy SARL', align: 'left', bg: '#fef3c7' }, { value: '21 300', align: 'right', bg: '#fef3c7', color: '#d97706' }, { value: '17/04', align: 'center', bg: '#fef3c7' }, { value: 'Facturé', align: 'center', bg: '#fef3c7', color: '#d97706' }],
        ],
      },
      choices: [
        { label: 'Je valide le chiffre — la hausse de 23% est réelle selon le CRM', isCorrect: false, points: -10, feedback: 'Les doublons CMD-001 et CMD-003 gonflent artificiellement le total. Sans déduplication, on compte deux fois 12 400€ + 21 300€ = 33 700€ en trop.' },
        { label: 'Je déduplique les données sur l\'ID de commande avant de calculer le total', isCorrect: true, points: 10, feedback: 'Correct ! Des doublons sur l\'ID de commande indiquent un problème de synchronisation ou d\'import. La première étape est toujours de dédupliquer sur une clé unique avant tout calcul.' },
        { label: 'Je demande au CRM d\'être réinitialisé — les données sont corrompues', isCorrect: false, points: -5, feedback: 'Réinitialiser le CRM entraînerait une perte de données réelles. Il faut d\'abord identifier et corriger les doublons, puis comprendre leur origine.' },
      ],
      reflexe: 'Avant tout calcul de CA, toujours vérifier les doublons sur la clé primaire (ID commande). Gartner estime que 10-25% des enregistrements CRM sont des doublons — une erreur silencieuse qui fausse tous les indicateurs.',
      redFlags: ['CMD-001 et CMD-003 en double', '+33 700€ fictifs dans le total', 'Aucun avertissement automatique du CRM'],
    },
    {
      category: 'bi',
      title: 'Le KPI qui ne dit rien',
      context: 'Le nouveau dashboard mensuel vient d\'être publié. Votre équipe regarde le KPI central : "Taux d\'engagement : 23%". Un manager dit "super !", un autre "catastrophique !"',
      visual: {
        type: 'dashboard',
        body: 'Dashboard mensuel — publié ce matin',
        metrics: [
          { label: 'Taux d\'engagement', value: '23%', color: '#006a9e' },
          { label: 'Visiteurs uniques', value: '42 800', delta: '+12%', deltaUp: true },
          { label: 'Sessions', value: '187 400', delta: '+8%', deltaUp: true },
          { label: 'Taux de rebond', value: '67%', delta: '+5%', deltaUp: false },
        ],
        chartTitle: 'Historique engagement',
        chartBars: [
          { label: 'Jan', value: 19, color: '#006a9e' },
          { label: 'Fév', value: 21, color: '#006a9e' },
          { label: 'Mar', value: 23, color: '#dd0061' },
        ],
      },
      choices: [
        { label: 'Le taux d\'engagement de 23% est bon — c\'est au-dessus de 20%', isCorrect: false, points: -5, feedback: '20% est un seuil arbitraire sans contexte. Sans définition précise du "taux d\'engagement", sans benchmark sectoriel et sans objectif cible, ce chiffre ne permet aucune décision.' },
        { label: 'Le KPI n\'a ni définition précise ni valeur cible — impossible d\'interpréter 23% sans ces éléments', isCorrect: true, points: 10, feedback: 'Exactement ! "Taux d\'engagement" peut signifier : clics / impressions, interactions / visiteurs, temps passé / objectif... Chaque définition donnera un chiffre différent. Un KPI sans définition, sans seuil et sans benchmark est inutile pour la décision.' },
        { label: 'Il faut attendre 3 mois pour avoir une tendance avant d\'interpréter', isCorrect: false, points: -5, feedback: 'Attendre peut aider, mais si le KPI n\'est pas défini précisément, 3 mois de données non définies restent non interprétables.' },
      ],
      reflexe: 'Chaque KPI doit avoir : une définition précise, une formule de calcul documentée, une valeur cible ou benchmark sectoriel, et une fréquence de mise à jour. Un KPI sans ces 4 éléments crée des malentendus plutôt que des décisions.',
      redFlags: ['Pas de définition de "taux d\'engagement"', 'Pas de valeur cible ou benchmark', 'Deux interprétations opposées pour le même chiffre'],
    },
    {
      category: 'bi',
      title: 'La moitié du CA a disparu',
      context: 'Votre directeur financier fait sa réunion mensuelle avec Power BI. Il voit "CA Total : 4,2M€" et bondit : "Où sont passés nos 8,9M€ de CA ?"',
      visual: {
        type: 'dashboard',
        body: 'Rapport Power BI publié lundi — aucune modification depuis',
        metrics: [
          { label: 'CA Total', value: '4,2M€', delta: '-53%', deltaUp: false, color: '#dc2626' },
          { label: 'Commandes', value: '1 847', delta: '-48%', deltaUp: false },
          { label: 'Panier moyen', value: '2 274€', delta: '+10%', deltaUp: true },
          { label: 'Clients actifs', value: '423', delta: '-51%', deltaUp: false },
        ],
        chartTitle: 'CA par mois',
        chartBars: [
          { label: 'Oct', value: 4200000, color: '#dc2626' },
          { label: 'Sep', value: 8800000, color: '#006a9e' },
          { label: 'Aoû', value: 9100000, color: '#006a9e' },
        ],
      },
      choices: [
        { label: 'Les données sources ont changé — les systèmes transactionnels ont un bug', isCorrect: false, points: 0, feedback: 'Possible, mais la première vérification doit toujours être les filtres actifs dans le rapport Power BI lui-même — cause la plus fréquente des écarts inexpliqués.' },
        { label: 'Un filtre global est probablement actif (région, segment, période) et cache la moitié du CA', isCorrect: true, points: 10, feedback: 'Bonne démarche ! Un filtre "Région = France du Nord" ou "Canal = Direct" non affiché explicitement peut exclure une grande partie du CA. Toujours inspecter les slicers et filtres de page dans Power BI avant de conclure à une anomalie.' },
        { label: 'Power BI a un bug d\'affichage — il faut republier le rapport', isCorrect: false, points: -5, feedback: 'Republier sans diagnostic peut masquer un vrai problème de filtre et déployer un rapport avec un filtre erroné en production.' },
      ],
      reflexe: 'Un écart inexpliqué dans un dashboard BI : toujours vérifier les filtres actifs (slicers, filtres de page, filtres visuels) avant de blâmer les sources de données. Rendre les filtres actifs visibles sur le rapport évite cette confusion.',
      redFlags: ['CA affiché 53% en dessous du réel', 'Tous les indicateurs en baisse simultanément (-50%)','Aucun filtre visible sur le rapport'],
    },
    {
      category: 'data_viz',
      title: 'Séries temporelles en camembert',
      context: 'Un stagiaire a créé ce graphique pour son rapport de stage. Il veut montrer "l\'évolution des ventes au cours des 12 mois de l\'année".',
      visual: {
        type: 'pie-chart',
        chartTitle: 'Ventes mensuelles 2024',
        body: 'Graphique créé pour montrer l\'évolution temporelle',
        slices: [
          { label: 'Jan', value: 82, color: '#006a9e' },
          { label: 'Fév', value: 75, color: '#1d7ab5' },
          { label: 'Mar', value: 91, color: '#338fcc' },
          { label: 'Avr', value: 88, color: '#dd0061' },
          { label: 'Mai', value: 95, color: '#e6196f' },
          { label: 'Juin', value: 103, color: '#f0337d' },
          { label: 'Juil', value: 97, color: '#f59e0b' },
          { label: 'Aoû', value: 78, color: '#f7b731' },
          { label: 'Sep', value: 92, color: '#10b981' },
          { label: 'Oct', value: 105, color: '#34d399' },
          { label: 'Nov', value: 118, color: '#8b5cf6' },
          { label: 'Déc', value: 124, color: '#a78bfa' },
        ],
      },
      choices: [
        { label: 'Le graphique est bien fait — tous les mois sont représentés avec des couleurs distinctes', isCorrect: false, points: -10, feedback: 'Un camembert montre des proportions d\'un tout, pas une évolution dans le temps. Ici, il est impossible de voir si les ventes augmentent, baissent ou ont une saisonnalité.' },
        { label: 'Pour une série temporelle, il faut un graphique en courbe ou en barres — le camembert est inapproprié', isCorrect: true, points: 10, feedback: 'Exactement ! Un camembert montre que Jan représente 6,5% du total annuel — pas que les ventes progressent. Une courbe ou un histogramme permettrait de voir immédiatement la tendance et la saisonnalité de novembre/décembre.' },
        { label: 'Il suffit d\'ajouter des valeurs en euros sur chaque segment pour améliorer le graphique', isCorrect: false, points: -5, feedback: 'Ajouter des valeurs ne change pas le fait que le camembert est le mauvais type de graphique pour montrer une évolution temporelle.' },
      ],
      reflexe: 'Un camembert montre des proportions (parts d\'un tout). Une série temporelle (évolution dans le temps) doit toujours être représentée par une courbe ou des barres. Choisir le bon type de graphique, c\'est déjà bien analyser.',
    },
    {
      category: 'excel',
      title: 'Les nombres qui se comportent comme du texte',
      context: 'Vous importez un export CSV de votre ERP dans Excel. Les chiffres s\'affichent bien, mais votre SOMME retourne 0 et vos filtres ne fonctionnent pas correctement.',
      visual: {
        type: 'spreadsheet',
        sheetName: 'Import ERP',
        body: 'Données importées — les chiffres semblent corrects mais la SOMME affiche 0',
        headers: ['Article', 'Qté vendue', 'Prix unit.', 'Total'],
        rows: [
          [{ value: 'Produit A', align: 'left' }, { value: '124', align: 'left', bg: '#fff3cd', color: '#856404' }, { value: '45,00', align: 'left', bg: '#fff3cd', color: '#856404' }, { value: '=B2*C2', align: 'right', color: '#dc2626' }],
          [{ value: 'Produit B', align: 'left' }, { value: '89', align: 'left', bg: '#fff3cd', color: '#856404' }, { value: '32,50', align: 'left', bg: '#fff3cd', color: '#856404' }, { value: '=B3*C3', align: 'right', color: '#dc2626' }],
          [{ value: 'Produit C', align: 'left' }, { value: '201', align: 'left', bg: '#fff3cd', color: '#856404' }, { value: '18,75', align: 'left', bg: '#fff3cd', color: '#856404' }, { value: '=B4*C4', align: 'right', color: '#dc2626' }],
          [{ value: 'SOMME', bold: true, align: 'left' }, { value: '=SOMME(B2:B4)', bold: true, align: 'right', color: '#dc2626' }, { value: '', align: 'right' }, { value: '0 ← problème', bold: true, align: 'right', color: '#dc2626' }],
        ],
      },
      choices: [
        { label: 'Les formules de multiplication sont incorrectes — je les réécris', isCorrect: false, points: -5, feedback: 'Les formules semblent correctes. Le vrai problème est plus subtil : les nombres sont stockés en format Texte, pas Nombre.' },
        { label: 'Les chiffres sont au format Texte après import CSV — Excel ne peut pas les additionner', isCorrect: true, points: 10, feedback: 'Exact ! Les CSV importent souvent les nombres comme du texte (alignés à gauche, triangle vert en haut à gauche de la cellule). Solution : sélectionner la colonne → Données → Convertir → Terminer, ou utiliser =CNUM() pour convertir.' },
        { label: 'Il faut réimporter le fichier avec un codage UTF-8 différent', isCorrect: false, points: -5, feedback: 'Le codage n\'est pas le problème ici. Le problème est le format Texte des cellules numériques après import CSV.' },
      ],
      reflexe: 'Après un import CSV, toujours vérifier l\'alignement des nombres : alignés à gauche = format Texte, alignés à droite = format Nombre. Un triangle vert en haut à gauche confirme le problème. Convertir avec Données → Convertir avant tout calcul.',
      redFlags: ['Chiffres alignés à gauche (format texte)', '=SOMME() retournant 0', 'Triangle vert en coin de cellule'],
    },
    {
      category: 'data_qualite',
      title: 'Les dates qui désordonnent tout',
      context: 'Vous recevez un fichier de données clients de 3 équipes différentes. Quand vous essayez de trier par date d\'inscription, les résultats sont incohérents.',
      visual: {
        type: 'spreadsheet',
        sheetName: 'Clients fusionnés',
        body: 'Export combiné de 3 bureaux — 3 formats de date différents',
        headers: ['Client', 'Date inscription', 'Bureau', 'Statut'],
        rows: [
          [{ value: 'Lefebvre Anne', align: 'left' }, { value: '14/03/2024', align: 'center', color: '#16a34a' }, { value: 'Paris', align: 'center' }, { value: 'Actif', align: 'center' }],
          [{ value: 'Martin Paul', align: 'left' }, { value: '2024-07-22', align: 'center', color: '#d97706' }, { value: 'Lyon', align: 'center' }, { value: 'Actif', align: 'center' }],
          [{ value: 'Durand Marie', align: 'left' }, { value: 'March 5, 2024', align: 'center', color: '#dc2626' }, { value: 'Bordeaux', align: 'center' }, { value: 'Actif', align: 'center' }],
          [{ value: 'Petit Jean', align: 'left' }, { value: '05/2024/18', align: 'center', color: '#dc2626' }, { value: 'Bordeaux', align: 'center' }, { value: 'Actif', align: 'center' }],
          [{ value: 'Bernard Lucie', align: 'left' }, { value: '12/04/2024', align: 'center', color: '#16a34a' }, { value: 'Paris', align: 'center' }, { value: 'Actif', align: 'center' }],
        ],
      },
      choices: [
        { label: 'Je trie les données et utilise le résultat — Excel gère bien les dates', isCorrect: false, points: -10, feedback: 'Avec 3 formats différents (JJ/MM/AAAA, AAAA-MM-JJ, "March 5, 2024"), Excel interprète mal certaines dates. Le tri donnera un résultat faux.' },
        { label: 'Je normalise d\'abord toutes les dates dans un format unique avant toute analyse', isCorrect: true, points: 10, feedback: 'Exactement ! Avant toute analyse temporelle, standardiser le format de date est obligatoire. ISO 8601 (AAAA-MM-JJ) est le standard recommandé. Toujours documenter le format attendu lors de la collecte.' },
        { label: 'Je filtre les dates inhabituelles — "March 5, 2024" est clairement une erreur', isCorrect: false, points: -5, feedback: '"March 5, 2024" est le format américain valide. Ce n\'est pas une erreur mais un format différent qui doit être normalisé, pas supprimé.' },
      ],
      reflexe: 'La normalisation des données temporelles est une étape obligatoire avant toute analyse. Définir le format de date attendu en amont de la collecte et documenter l\'origine de chaque source.',
      redFlags: ['3 formats de date incompatibles dans le même fichier', 'Tri impossible sans normalisation', 'Aucun format standard défini lors de la fusion'],
    },
    {
      category: 'data_viz',
      title: 'Le camembert qui trompe l\'œil',
      context: 'Votre collègue a créé un camembert 3D pour le rapport annuel. Il pense que ça rend le document plus professionnel.',
      visual: {
        type: 'pie-chart',
        chartTitle: 'Parts de marché — version plate (correcte)',
        body: 'Version 2D honnête vs version 3D trompeuse (illustrée en 2D ici pour comparaison)',
        slices: [
          { label: 'Notre marque (réel: 28%)', value: 28, color: '#006a9e' },
          { label: 'Concurrent A (réel: 27%)', value: 27, color: '#dd0061' },
          { label: 'Concurrent B (réel: 25%)', value: 25, color: '#f59e0b' },
          { label: 'Autres (réel: 20%)', value: 20, color: '#10b981' },
        ],
      },
      choices: [
        { label: 'Le camembert 3D est mieux — il est plus moderne et attrayant', isCorrect: false, points: -10, feedback: 'Un camembert 3D est un piège visuel : la perspective fait apparaître le segment au premier plan plus grand qu\'il ne l\'est réellement. Edward Tufte appelle ça du "chartjunk" — de la décoration qui déforme l\'information.' },
        { label: 'Le camembert 3D déforme les proportions — la version plate 2D est plus honnête', isCorrect: true, points: 10, feedback: 'Exactement ! Dans un camembert 3D, le segment "devant" semble plus grand même s\'il représente la même valeur qu\'un segment "derrière". La version plate est toujours préférable pour une comparaison honnête.' },
        { label: 'Les deux versions montrent la même chose — c\'est juste un style différent', isCorrect: false, points: -10, feedback: 'Non — la perspective 3D distord systématiquement les proportions visuelles. La section avant est visuellement amplifiée, ce qui peut changer la perception du leader du marché.' },
      ],
      reflexe: 'Éviter toujours les graphiques 3D (camemberts, barres, cylindres). La profondeur visuelle distord les proportions et trompe le lecteur. Un graphique 2D plat et simple est toujours plus honnête et lisible.',
    },
  ],

  // ────────────────── INTERMÉDIAIRE ─────────────────────────────────────────
  intermediaire: [
    {
      category: 'analytics',
      title: 'Le café qui rend performant ?',
      context: 'Votre directeur des ventes a fait une analyse surprenante : "J\'ai trouvé une corrélation parfaite entre le nombre de cafés bus par nos commerciaux et leur CA. On va installer des machines à café dans toutes les agences !"',
      visual: {
        type: 'histogram',
        chartTitle: 'Corrélation cafés/jour vs CA mensuel',
        body: 'Analyse sur 150 commerciaux — r = 0,83 (forte corrélation)',
        chartBars: [
          { label: '1-2 cafés', value: 42000, color: '#f59e0b' },
          { label: '3-4 cafés', value: 67000, color: '#f59e0b' },
          { label: '5-6 cafés', value: 89000, color: '#f59e0b' },
          { label: '7+ cafés', value: 112000, color: '#f59e0b' },
        ],
        xLabel: 'CA moyen (€) par niveau de consommation de café',
      },
      choices: [
        { label: 'Excellente initiative — r=0,83 est une très forte corrélation', isCorrect: false, points: -10, feedback: 'Une corrélation forte ne prouve pas la causalité. r=0,83 dit que café et CA bougent ensemble — pas que l\'un cause l\'autre.' },
        { label: 'La corrélation ne prouve pas la causalité — les commerciaux actifs boivent probablement plus de café et font plus de CA', isCorrect: true, points: 10, feedback: 'Exactement ! L\'activité commerciale est la variable confondante : les commerciaux les plus actifs (plus de rendez-vous, plus d\'énergie) consomment plus de café ET font plus de CA. Installer des machines ne changera pas les performances.' },
        { label: 'Il faut tester sur une agence pilote avant de déployer', isCorrect: false, points: 0, feedback: 'Un pilote est une bonne pratique, mais si la corrélation est liée à l\'activité commerciale (variable confondante), l\'expérience ne montrera pas d\'effet du café.' },
      ],
      reflexe: 'Corrélation ≠ causalité. Toujours chercher la variable confondante qui pourrait expliquer les deux phénomènes. Un test causalement valide (A/B avec randomisation) est nécessaire pour établir un lien de cause à effet.',
      redFlags: ['Corrélation confondue avec causalité', 'Variable confondante (activité) ignorée', 'Décision d\'investissement sur une corrélation non validée'],
    },
    {
      category: 'analytics',
      title: 'L\'enquête satisfaction dont les chiffres mentent',
      context: 'Votre service client annonce fièrement : "Enquête satisfaction : 84% de clients très satisfaits ! Notre taux est excellent." Vous regardez la méthodologie.',
      visual: {
        type: 'pie-chart',
        chartTitle: 'Résultats enquête satisfaction client',
        body: 'Taux de réponse : 8% (240 répondants sur 3 000 clients contactés)',
        slices: [
          { label: 'Très satisfait (84%)', value: 84, color: '#16a34a' },
          { label: 'Satisfait (11%)', value: 11, color: '#84cc16' },
          { label: 'Neutre (3%)', value: 3, color: '#f59e0b' },
          { label: 'Insatisfait (2%)', value: 2, color: '#dc2626' },
        ],
      },
      choices: [
        { label: '84% de très satisfaits c\'est excellent — on peut communiquer ce chiffre', isCorrect: false, points: -10, feedback: 'Avec seulement 8% de taux de réponse, ce chiffre est massivement biaisé. Qui répond à une enquête satisfaction ? Principalement les clients très satisfaits (ou très insatisfaits). Les "neutres" — souvent majoritaires — ignorent le sondage.' },
        { label: 'Biais de sélection : seuls les clients engagés répondent — le 84% représente les 8% les plus satisfaits', isCorrect: true, points: 10, feedback: 'Exact ! Un taux de réponse de 8% signifie que 92% des clients n\'ont pas répondu. Les non-répondants sont souvent les clients tièdes ou légèrement insatisfaits. Le 84% représente les 240 clients les plus engagés, pas la base client globale.' },
        { label: 'Il faut augmenter le nombre de relances pour avoir plus de répondants', isCorrect: false, points: -5, feedback: 'Relancer peut augmenter le taux de réponse mais ne corrige pas le biais de sélection si les non-répondants sont systématiquement moins satisfaits.' },
      ],
      reflexe: 'Le biais de sélection (ou biais du survivant) frappe toutes les enquêtes opt-in. Un faible taux de réponse rend les résultats non représentatifs. Indiquer toujours le taux de réponse lors de la communication des résultats.',
      redFlags: ['8% de taux de réponse', 'Non-répondants (92%) non caractérisés', 'Communication sans mention du taux de réponse'],
    },
    {
      category: 'analytics',
      title: 'La livraison "rapide" qui prend 8 jours',
      context: 'Le responsable logistique vous envoie fièrement le KPI : "Délai moyen de livraison : 8,4 jours." Les clients continuent de se plaindre de recevoir leurs colis "vite, en 2-3 jours". Qui a raison ?',
      visual: {
        type: 'spreadsheet',
        sheetName: 'Délais livraison',
        body: 'Données de livraison sur 200 commandes — cliquez sur les cellules',
        headers: ['Type', 'Nb commandes', 'Délai moy.', 'Impact'],
        rows: [
          [{ value: 'Livraison standard (2-3j)', align: 'left', color: '#16a34a' }, { value: '184', align: 'right', color: '#16a34a' }, { value: '2,8 jours', align: 'right', color: '#16a34a' }, { value: '92% des commandes', align: 'right', color: '#16a34a' }],
          [{ value: 'Livraison retardée (8-15j)', align: 'left', color: '#d97706' }, { value: '12', align: 'right', color: '#d97706' }, { value: '11,2 jours', align: 'right', color: '#d97706' }, { value: '6% des commandes', align: 'right', color: '#d97706' }],
          [{ value: 'Colis perdus/retournés (30-90j)', align: 'left', color: '#dc2626' }, { value: '4', align: 'right', color: '#dc2626' }, { value: '62,5 jours', align: 'right', color: '#dc2626', bold: true }, { value: '2% mais impact massif', align: 'right', color: '#dc2626' }],
          [{ value: 'MOYENNE globale', bold: true, align: 'left', bg: '#fef2f2' }, { value: '200', bold: true, align: 'right', bg: '#fef2f2' }, { value: '8,4 jours', bold: true, align: 'right', bg: '#fef2f2', color: '#dc2626' }, { value: '← Tirée par 4 colis', align: 'right', bg: '#fef2f2', color: '#dc2626' }],
          [{ value: 'MÉDIANE', bold: true, align: 'left', bg: '#f0fdf4' }, { value: '200', bold: true, align: 'right', bg: '#f0fdf4' }, { value: '2,9 jours', bold: true, align: 'right', bg: '#f0fdf4', color: '#16a34a' }, { value: '← Représentative', align: 'right', bg: '#f0fdf4', color: '#16a34a' }],
        ],
      },
      choices: [
        { label: 'La moyenne de 8,4 jours est correcte — c\'est la mesure standard', isCorrect: false, points: -10, feedback: '4 colis perdus (2% des commandes) avec 62 jours chacun tirent la moyenne à 8,4j. La moyenne ne représente pas du tout l\'expérience de 92% des clients.' },
        { label: 'La médiane (2,9 jours) est plus représentative — les outliers (colis perdus) gonflent la moyenne', isCorrect: true, points: 10, feedback: 'Parfait ! 4 colis perdus à 62 jours chacun = 248 jours d\'anomalie qui font passer la moyenne de 2,8j à 8,4j. La médiane de 2,9j représente l\'expérience réelle de 92% des clients. Surveiller les outliers séparément est la bonne approche.' },
        { label: 'Il faut plus de données pour trancher — 200 commandes ne suffisent pas', isCorrect: false, points: -5, feedback: '200 commandes sont suffisantes pour illustrer le problème des outliers sur la moyenne. Le problème est la mesure choisie, pas le volume de données.' },
      ],
      reflexe: 'Les outliers peuvent rendre la moyenne non représentative. Toujours regarder la distribution complète et comparer moyenne/médiane. Pour les délais de livraison, les percentiles (P50, P90, P99) sont souvent plus utiles que la seule moyenne.',
      redFlags: ['4 outliers (2%) qui font passer la moyenne de 2,8j à 8,4j', 'Médiane et moyenne divergent de 5,5 jours', 'KPI de performance basé sur une mesure non représentative'],
    },
    {
      category: 'analytics',
      title: 'Le test A/B à arrêter trop tôt',
      context: 'Vous testez un nouveau bouton "Commander" sur votre site. Après 4 jours, votre chef vous demande les résultats car "ça semble marcher" : p=0,03, +6% de conversion. Il veut lancer immédiatement.',
      visual: {
        type: 'dashboard',
        body: 'Résultats A/B test — jour 4 sur 21 prévus',
        metrics: [
          { label: 'Variante A (contrôle)', value: '2,8%', delta: 'Taux de conversion', deltaUp: false },
          { label: 'Variante B (test)', value: '2,97%', delta: '+6%', deltaUp: true, color: '#16a34a' },
          { label: 'P-value actuelle', value: '0,031', delta: '< 0,05', deltaUp: true, color: '#d97706' },
          { label: 'Jours écoulés', value: '4 / 21', delta: '19% du plan', deltaUp: false },
        ],
        chartTitle: 'Évolution p-value (doit être interprétée à maturité)',
        chartBars: [
          { label: 'J1', value: 0.34, color: '#16a34a' },
          { label: 'J2', value: 0.18, color: '#16a34a' },
          { label: 'J3', value: 0.07, color: '#f59e0b' },
          { label: 'J4', value: 0.031, color: '#dc2626' },
        ],
      },
      choices: [
        { label: 'p=0,03 est sous le seuil de 0,05 — le résultat est statistiquement significatif, on lance', isCorrect: false, points: -10, feedback: 'C\'est le "peek problem" (problème du regard précoce). Regarder la p-value en cours de test et arrêter dès qu\'elle passe sous 0,05 gonfle massivement le taux de faux positifs — on peut atteindre 50% de faux positifs sur un test arrêté prématurément.' },
        { label: 'Il faut atteindre la taille d\'échantillon prévue (21 jours) avant de conclure', isCorrect: true, points: 10, feedback: 'Exactement ! Un test A/B doit être planifié avant d\'être lancé (durée, taille d\'échantillon, puissance statistique). Arrêter quand p<0,05 est atteint, même si c\'est avant la fin, invalide statistiquement le test. Seulement 4 jours sur 21 = 19% du plan.' },
        { label: 'Refaire le calcul avec un seuil plus strict p<0,01 pour s\'assurer de la significativité', isCorrect: false, points: -5, feedback: 'Changer le seuil APRÈS avoir vu les résultats est une autre forme de p-hacking. Le seuil doit être défini AVANT le test.' },
      ],
      reflexe: 'Le peek problem : regarder les résultats d\'un test A/B en cours et arrêter dès p<0,05 peut générer 50% de faux positifs. La durée et la taille d\'échantillon doivent être calculées AVANT le test et respectées scrupuleusement.',
      redFlags: ['Test arrêté à 19% de la durée prévue', 'P-value regardée en cours de test (peek problem)', 'Décision prise sans atteindre la puissance statistique'],
    },
    {
      category: 'data_qualite',
      title: 'Les valeurs manquantes qui faussent le calcul',
      context: 'Vous analysez le budget prévisionnel des projets. La direction veut le budget moyen par projet pour calibrer les futures allocations.',
      visual: {
        type: 'spreadsheet',
        sheetName: 'Projets 2024',
        body: 'Liste des projets — certains budgets sont vides',
        headers: ['Projet', 'Budget (k€)', 'Statut', 'Équipe'],
        rows: [
          [{ value: 'Projet Alpha', align: 'left' }, { value: '450', align: 'right' }, { value: 'Terminé', align: 'center', color: '#16a34a' }, { value: 'Équipe A', align: 'left' }],
          [{ value: 'Projet Beta', align: 'left' }, { value: '', align: 'right', bg: '#fef3c7' }, { value: 'En cours', align: 'center', color: '#d97706' }, { value: 'Équipe B', align: 'left' }],
          [{ value: 'Projet Gamma', align: 'left' }, { value: '780', align: 'right' }, { value: 'Terminé', align: 'center', color: '#16a34a' }, { value: 'Équipe A', align: 'left' }],
          [{ value: 'Projet Delta', align: 'left' }, { value: '', align: 'right', bg: '#fef3c7' }, { value: 'Planifié', align: 'center', color: '#006a9e' }, { value: 'Équipe C', align: 'left' }],
          [{ value: 'Projet Epsilon', align: 'left' }, { value: '320', align: 'right' }, { value: 'Terminé', align: 'center', color: '#16a34a' }, { value: 'Équipe B', align: 'left' }],
          [{ value: 'MOYENNE (si vides = 0)', bold: true, align: 'left', bg: '#fef2f2' }, { value: '310', bold: true, align: 'right', bg: '#fef2f2', color: '#dc2626' }, { value: '← Biaisée', align: 'center', bg: '#fef2f2', color: '#dc2626' }, { value: '', align: 'left', bg: '#fef2f2' }],
          [{ value: 'MOYENNE (si vides exclus)', bold: true, align: 'left', bg: '#f0fdf4' }, { value: '517', bold: true, align: 'right', bg: '#f0fdf4', color: '#16a34a' }, { value: '← Correcte', align: 'center', bg: '#f0fdf4', color: '#16a34a' }, { value: '', align: 'left', bg: '#f0fdf4' }],
        ],
      },
      choices: [
        { label: 'Je remplace les valeurs vides par 0 et calcule la moyenne', isCorrect: false, points: -10, feedback: 'Remplacer par 0 traite les projets sans budget renseigné comme des projets à budget nul. La moyenne passe de 517k€ à 310k€ — une erreur de 40% qui sous-estime massivement le budget réel.' },
        { label: 'J\'analyse la cause des valeurs manquantes avant de décider : projets non budgétés ou données non collectées ?', isCorrect: true, points: 10, feedback: 'La bonne démarche ! Les valeurs manquantes doivent être traitées selon leur contexte métier. Ici, les projets "Planifié" et "En cours" n\'ont peut-être pas encore de budget finalisé — les exclure du calcul est plus honnête que de les mettre à 0.' },
        { label: 'Je supprime les lignes avec des budgets manquants avant de calculer', isCorrect: false, points: 0, feedback: 'Mieux que mettre 0, mais supprimer des projets peut créer un biais de sélection si les projets sans budget sont différents (plus petits, planifiés, etc.). Il faut d\'abord comprendre pourquoi ils sont vides.' },
      ],
      reflexe: 'Les valeurs manquantes ne doivent jamais être remplacées mécaniquement par 0 ou la moyenne. Toujours analyser la cause métier : manque de collecte, absence réelle, données futures ? Le traitement dépend du sens des données.',
      redFlags: ['2 projets sur 5 sans budget renseigné (40%)', 'Erreur de 40% si vides remplacés par 0', 'Aucun flag dans le fichier source pour les valeurs manquantes'],
    },
    {
      category: 'bi',
      title: 'Les KPIs qui se contredisent',
      context: 'Le rapport mensuel arrive. Deux KPIs semblent se contredire : "Chiffre d\'affaires en hausse de 12%" mais "Marge nette en baisse de 8%". Votre directeur est perplexe.',
      visual: {
        type: 'dashboard',
        body: 'Rapport mensuel — données validées par la comptabilité',
        metrics: [
          { label: 'CA Total', value: '2,4M€', delta: '+12%', deltaUp: true, color: '#16a34a' },
          { label: 'Coût des ventes', value: '1,87M€', delta: '+24%', deltaUp: false, color: '#dc2626' },
          { label: 'Marge brute', value: '530K€', delta: '-16%', deltaUp: false, color: '#dc2626' },
          { label: 'Marge nette', value: '180K€', delta: '-8%', deltaUp: false, color: '#dc2626' },
        ],
        chartTitle: 'Évolution CA vs Coûts',
        chartBars: [
          { label: 'CA J-1', value: 2143000, color: '#006a9e' },
          { label: 'CA J0', value: 2400000, color: '#006a9e' },
          { label: 'Coûts J-1', value: 1510000, color: '#dc2626' },
          { label: 'Coûts J0', value: 1870000, color: '#dc2626' },
        ],
      },
      choices: [
        { label: 'Les données sont contradictoires — il y a une erreur dans le système', isCorrect: false, points: -5, feedback: 'Les deux chiffres peuvent être vrais simultanément : le CA croît (+12%) mais les coûts croissent encore plus vite (+24%). Ce n\'est pas une contradiction mais un signal d\'alerte.' },
        { label: 'Le CA croît mais les coûts augmentent plus vite (+24%) — la rentabilité se dégrade malgré la croissance', isCorrect: true, points: 10, feedback: 'Exactement ! CA +12% et coûts +24% = marge qui se comprime. C\'est un pattern classique de croissance non rentable. L\'enjeu est d\'identifier quel segment ou quel coût a dérapé pour corriger la trajectoire.' },
        { label: 'La marge baisse car les ventes ont changé de mix produit — rien d\'alarmant', isCorrect: false, points: 0, feedback: 'Le mix produit peut être une explication, mais elle doit être vérifiée avec les données, pas assumée. Le signal d\'alerte (coûts +24% pour CA +12%) doit être investigué avec rigueur.' },
      ],
      reflexe: 'Des KPIs apparemment contradictoires sont souvent des signaux d\'alerte importants. Croissance du CA + baisse de marge = coûts croissant plus vite que le CA. Toujours analyser les KPIs ensemble, pas séparément.',
      redFlags: ['CA +12% vs Coûts des ventes +24%', 'Effet ciseau sur la marge', 'Croissance non rentable non détectée à temps'],
    },
    {
      category: 'statistiques',
      title: 'Le paradoxe de Simpson en médecine',
      context: 'Une étude clinique teste un médicament. Le médicament semble plus efficace que le placebo chez les femmes ET chez les hommes séparément, mais moins efficace que le placebo au total. Impossible ?',
      visual: {
        type: 'dashboard',
        body: 'Résultats de l\'essai clinique — données réelles',
        metrics: [
          { label: 'Guérison Hommes (médicament)', value: '73%', delta: 'vs 69% placebo', deltaUp: true, color: '#16a34a' },
          { label: 'Guérison Femmes (médicament)', value: '87%', delta: 'vs 83% placebo', deltaUp: true, color: '#16a34a' },
          { label: 'Résultat Global (médicament)', value: '78%', delta: 'vs 83% placebo', deltaUp: false, color: '#dc2626' },
          { label: 'Taille groupes', value: 'Déséquilibrée', delta: 'Cause du paradoxe', deltaUp: false },
        ],
        chartTitle: 'Composition des groupes (200 patients)',
        chartBars: [
          { label: 'Médicament ♂', value: 20, color: '#006a9e' },
          { label: 'Médicament ♀', value: 80, color: '#dd0061' },
          { label: 'Placebo ♂', value: 80, color: '#006a9e' },
          { label: 'Placebo ♀', value: 20, color: '#dd0061' },
        ],
      },
      choices: [
        { label: 'Les données sont incorrectes — c\'est mathématiquement impossible d\'être meilleur en sous-groupes mais pas globalement', isCorrect: false, points: -10, feedback: 'C\'est mathématiquement possible ! C\'est le paradoxe de Simpson (1951). Deux tendances opposées peuvent coexister dans les sous-groupes et dans le total.' },
        { label: 'C\'est le paradoxe de Simpson : la composition déséquilibrée des groupes inverse la tendance globale', isCorrect: true, points: 10, feedback: 'Exactement ! Le médicament a été donné à 80% de femmes (qui guérissent naturellement moins bien), et le placebo à 80% d\'hommes (qui guérissent mieux). Le mélange déséquilibré crée un paradoxe apparent. Solution : stratifier l\'analyse par sous-groupe.' },
        { label: 'Il faut exclure l\'un des sexes pour avoir une analyse valide', isCorrect: false, points: -5, feedback: 'Exclure un groupe crée un biais de sélection. La bonne approche est de stratifier l\'analyse et d\'utiliser une méthode de pondération appropriée.' },
      ],
      reflexe: 'Le paradoxe de Simpson montre qu\'une variable confondante (ici le sexe, avec une répartition déséquilibrée) peut inverser une tendance. Toujours analyser les sous-groupes ET vérifier la composition des groupes avant de tirer des conclusions globales.',
      redFlags: ['Groupes médicament/placebo très déséquilibrés', 'Variable confondante (sexe) non contrôlée', 'Inversion de tendance entre sous-groupes et résultat global'],
    },
    {
      category: 'excel',
      title: 'Le tableau croisé dynamique incomplet',
      context: 'Vous avez un TCD sur les ventes par région. Vous venez d\'ajouter 3 nouvelles régions dans le fichier source mais elles n\'apparaissent pas dans le TCD après actualisation.',
      visual: {
        type: 'spreadsheet',
        sheetName: 'TCD Ventes',
        body: 'TCD actualisé — mais les données de la ligne 301 à 450 manquent',
        headers: ['Région', 'CA total', '% du total', 'Nb commandes'],
        rows: [
          [{ value: 'Paris', align: 'left', bold: true }, { value: '2 450 000', align: 'right' }, { value: '34,2%', align: 'right' }, { value: '847', align: 'right' }],
          [{ value: 'Lyon', align: 'left', bold: true }, { value: '1 120 000', align: 'right' }, { value: '15,6%', align: 'right' }, { value: '392', align: 'right' }],
          [{ value: 'Bordeaux', align: 'left', bold: true }, { value: '890 000', align: 'right' }, { value: '12,4%', align: 'right' }, { value: '312', align: 'right' }],
          [{ value: 'Marseille', align: 'left', bold: true }, { value: '780 000', align: 'right' }, { value: '10,9%', align: 'right' }, { value: '274', align: 'right' }],
          [{ value: 'TOTAL affiché', bold: true, align: 'left', bg: '#fef3c7' }, { value: '7 170 000', bold: true, align: 'right', bg: '#fef3c7', color: '#d97706' }, { value: '← Incomplet', align: 'right', bg: '#fef3c7', color: '#d97706' }, { value: '', align: 'right', bg: '#fef3c7' }],
          [{ value: 'Total réel (source)', bold: true, align: 'left', bg: '#f0fdf4' }, { value: '8 640 000', bold: true, align: 'right', bg: '#f0fdf4', color: '#16a34a' }, { value: '← Correct', align: 'right', bg: '#f0fdf4', color: '#16a34a' }, { value: '', align: 'right', bg: '#f0fdf4' }],
        ],
      },
      choices: [
        { label: 'Je réactualise encore une fois le TCD — l\'actualisation n\'a peut-être pas fonctionné', isCorrect: false, points: -5, feedback: 'Le problème n\'est pas l\'actualisation mais la plage source du TCD. Actualiser de nouveau ne changera rien si la plage ne couvre pas les nouvelles lignes.' },
        { label: 'Je mets à jour la plage source du TCD pour inclure les nouvelles lignes (ou je convertis les données en Tableau Excel)', isCorrect: true, points: 10, feedback: 'Exactement ! Quand vous créez un TCD sur une plage A1:E300, il ne se met jamais à jour si vous ajoutez des lignes 301+. Solution durable : convertir les données source en Tableau Excel (Ctrl+T) — le TCD s\'étendra automatiquement.' },
        { label: 'Je recrée un nouveau TCD depuis zéro — c\'est plus fiable', isCorrect: false, points: 0, feedback: 'Recréer fonctionne, mais ne résout pas le problème fondamental. Convertir en Tableau Excel est la solution durable qui évite ce problème pour tous les futurs ajouts.' },
      ],
      reflexe: 'Un TCD créé sur une plage fixe (A1:E300) n\'inclut jamais les données hors plage. Solution durable : convertir les données en Tableau Excel (Ctrl+T) avant de créer le TCD — la plage s\'étend automatiquement.',
      redFlags: ['Plage TCD: A1:E300 → nouvelles données en lignes 301-450', 'Écart de 1 470 000€ entre TCD et données sources', 'Aucune alerte lors de l\'actualisation'],
    },
    {
      category: 'analytics',
      title: 'Le taux de churn plus grave qu\'il n\'y paraît',
      context: 'Votre chef de produit vous rassure : "Notre taux de churn de 3% par mois, c\'est négligeable. Même sur un an, ça fait 36%." Vous n\'êtes pas convaincu.',
      visual: {
        type: 'spreadsheet',
        sheetName: 'Analyse churn',
        body: 'Simulation de rétention sur 12 mois — base de 10 000 clients',
        headers: ['Mois', 'Clients début', 'Churned (3%)', 'Clients fin'],
        rows: [
          [{ value: 'M1', align: 'center' }, { value: '10 000', align: 'right' }, { value: '300', align: 'right', color: '#dc2626' }, { value: '9 700', align: 'right' }],
          [{ value: 'M3', align: 'center' }, { value: '9 409', align: 'right' }, { value: '282', align: 'right', color: '#dc2626' }, { value: '9 127', align: 'right' }],
          [{ value: 'M6', align: 'center' }, { value: '8 353', align: 'right' }, { value: '251', align: 'right', color: '#dc2626' }, { value: '8 103', align: 'right' }],
          [{ value: 'M9', align: 'center' }, { value: '7 414', align: 'right' }, { value: '222', align: 'right', color: '#dc2626' }, { value: '7 192', align: 'right' }],
          [{ value: 'M12', align: 'center' }, { value: '6 838', align: 'right' }, { value: '205', align: 'right', color: '#dc2626' }, { value: '6 633', align: 'right' }],
          [{ value: 'BILAN ANNUEL', bold: true, align: 'left', bg: '#fef2f2' }, { value: '10 000', bold: true, align: 'right', bg: '#fef2f2' }, { value: '3 367 perdus', bold: true, align: 'right', bg: '#fef2f2', color: '#dc2626' }, { value: '6 633 restants', bold: true, align: 'right', bg: '#fef2f2', color: '#dc2626' }],
        ],
      },
      choices: [
        { label: '3% × 12 = 36% de perte annuelle — votre chef a raison', isCorrect: false, points: -5, feedback: '36% est inexact : il faut calculer le churn composé. Chaque mois, on perd 3% d\'une base qui diminue. 1-(1-0,03)^12 = 30,6% — mais le résultat réel (3 367 clients perdus = 33,7%) confirme que même 30% c\'est énorme.' },
        { label: 'Le churn composé (~31%) est plus grave que la simple multiplication — on perd 3 367 clients sur 10 000 en 1 an', isCorrect: true, points: 10, feedback: 'Exactement ! Le churn mensuel de 3% se compose : chaque mois on perd 3% d\'une base déjà réduite. Résultat réel : 3 367 clients perdus (33,7%) en 12 mois, pas 36% d\'une base constante — c\'est quand même un signal d\'alerte majeur.' },
        { label: '3% par mois c\'est vraiment négligeable — les entreprises SaaS tolèrent jusqu\'à 5%', isCorrect: false, points: -10, feedback: '5% par mois composé sur 12 mois = perte de 46% de la base client annuelle. Un taux de churn de 3% mensuel non traité mène à une perte d\'un tiers des clients en un an.' },
      ],
      reflexe: 'Le churn mensuel composé est toujours plus sévère qu\'une simple multiplication. Formule : taux de rétention annuel = (1 - churn mensuel)^12. Un churn de 3%/mois = 30% annuel. Surveiller comme un KPI critique.',
    },
    {
      category: 'data_viz',
      title: 'Le camembert qui enterre les petites catégories',
      context: 'Votre rapport produit utilise un camembert pour montrer les 12 types de bugs remontés par les clients. La catégorie "Autres" domine le graphique.',
      visual: {
        type: 'pie-chart',
        chartTitle: 'Types de bugs remontés — Q3 2024',
        body: '847 tickets analysés — "Autres" regroupe 7 catégories < 3%',
        slices: [
          { label: 'Interface utilisateur', value: 28, color: '#006a9e' },
          { label: 'Performance', value: 22, color: '#dd0061' },
          { label: 'Connectivité', value: 15, color: '#f59e0b' },
          { label: 'Données incorrectes', value: 12, color: '#10b981' },
          { label: 'Authentification', value: 8, color: '#8b5cf6' },
          { label: 'Autres (7 catégories)', value: 15, color: '#94a3b8' },
        ],
      },
      choices: [
        { label: '"Autres" à 15% est acceptable — c\'est une catégorie standard dans tout rapport', isCorrect: false, points: -5, feedback: '"Autres" qui représente 7 catégories différentes masque de l\'information. Si "Sécurité" (bug critique) est dans "Autres" à 2%, il sera invisible alors qu\'il devrait être une priorité.' },
        { label: '"Autres" masque potentiellement des bugs critiques — il faut soit un barré, soit afficher toutes les catégories dans un graphique en barres', isCorrect: true, points: 10, feedback: 'Exactement ! La catégorie "Autres" est une simplification dangereuse quand elle regroupe des catégories hétérogènes. Un graphique en barres horizontales triées permettrait d\'afficher toutes les catégories lisiblement, même les petites.' },
        { label: 'Il faut augmenter le seuil de "Autres" à 5% pour avoir moins de catégories', isCorrect: false, points: -5, feedback: 'Augmenter le seuil cache encore plus d\'informations. La solution est de changer de type de graphique (barres) plutôt que de masquer davantage de catégories.' },
      ],
      reflexe: 'Utiliser "Autres" comme catégorie de camembert cache de l\'information. Si les petites catégories sont importantes (bugs sécurité, incidents critiques), un graphique en barres est toujours préférable au camembert.',
    },
    {
      category: 'bi',
      title: 'La granularité trop grossière',
      context: 'Le dashboard affiche "Ventes de novembre : 1,2M€". Le directeur régional de Paris veut savoir si c\'est son agence ou l\'agence de banlieue qui a performé le week-end du Black Friday. Le rapport ne permet pas de répondre.',
      visual: {
        type: 'dashboard',
        body: 'Dashboard national — données sources disponibles au niveau ville/heure',
        metrics: [
          { label: 'Ventes Nov (national)', value: '1,2M€', delta: '+18%', deltaUp: true },
          { label: 'Granularité disponible', value: 'Mensuelle', delta: 'Niveau du rapport', deltaUp: false },
          { label: 'Granularité source', value: 'Horaire', delta: 'Données disponibles', deltaUp: true, color: '#16a34a' },
          { label: 'Agences couvertes', value: '47', delta: 'Non ventilables', deltaUp: false },
        ],
        chartTitle: 'Ventes mensuelles nationales (seule granularité disponible)',
        chartBars: [
          { label: 'Oct', value: 1020000, color: '#006a9e' },
          { label: 'Nov', value: 1200000, color: '#dd0061' },
          { label: 'Sep', value: 980000, color: '#006a9e' },
        ],
      },
      choices: [
        { label: 'Le rapport ne peut pas répondre à cette question — les données ne sont pas disponibles', isCorrect: false, points: -10, feedback: 'Les données sources sont disponibles à la granularité horaire et par ville. Le problème est la conception du rapport, pas la disponibilité des données.' },
        { label: 'Le rapport est conçu à la mauvaise granularité — les données sources permettent l\'analyse par ville et par heure', isCorrect: true, points: 10, feedback: 'Exactement ! Les données sources existent à la granularité horaire et ville. Le dashboard a été agrégé trop tôt, perdant de l\'information précieuse. La solution : adapter la granularité du rapport au besoin d\'analyse, ou permettre un "drill-down" jusqu\'au niveau agence/jour.' },
        { label: 'Il faut demander à l\'agence de re-saisir ses données manuellement', isCorrect: false, points: -5, feedback: 'Les données existent déjà dans le système — re-saisir serait une perte de temps et une source d\'erreurs. Il faut adapter le rapport pour exploiter les données disponibles.' },
      ],
      reflexe: 'La granularité d\'un rapport doit être adaptée aux questions métier auxquelles il doit répondre. Agréger trop tôt détruit de l\'information. Un bon outil BI permet le drill-down du national vers l\'agence, du mensuel vers le quotidien.',
    },
  ],

  // ────────────────── MAÎTRISE ──────────────────────────────────────────────
  maitrise: [
    {
      category: 'ml_pratique',
      title: 'L\'accuracy à 99% qui ne sert à rien',
      context: 'Votre équipe ML annonce avec fierté : "Notre modèle de détection de fraude atteint 99,2% d\'accuracy ! On peut le déployer ?" Votre responsable est sceptique.',
      visual: {
        type: 'dashboard',
        body: 'Rapport d\'évaluation du modèle de détection de fraude',
        metrics: [
          { label: 'Accuracy', value: '99,2%', delta: 'Excellent !', deltaUp: true, color: '#16a34a' },
          { label: 'Transactions légitimes', value: '99 800', delta: '99,8% du dataset', deltaUp: true },
          { label: 'Transactions frauduleuses', value: '200', delta: '0,2% du dataset', deltaUp: false, color: '#dc2626' },
          { label: 'Fraudes détectées', value: '0', delta: 'Le modèle dit toujours "légitime"', deltaUp: false, color: '#dc2626' },
        ],
        chartTitle: 'Distribution des classes (déséquilibre massif)',
        chartBars: [
          { label: 'Légitimes', value: 99800, color: '#16a34a' },
          { label: 'Fraudes', value: 200, color: '#dc2626' },
        ],
      },
      choices: [
        { label: '99,2% d\'accuracy est excellent — déployer sans hésiter', isCorrect: false, points: -10, feedback: 'Un modèle qui dit TOUJOURS "légitime" obtient 99,8% d\'accuracy sur ce dataset. Ce modèle n\'a détecté AUCUNE fraude. L\'accuracy est une métrique trompeuse sur les données déséquilibrées.' },
        { label: 'L\'accuracy est inadaptée sur données déséquilibrées — il faut mesurer le recall (taux de fraudes détectées)', isCorrect: true, points: 10, feedback: 'Exactement ! Avec 0,2% de fraudes, un modèle naïf (toujours "légitime") atteint 99,8% d\'accuracy mais un recall de 0% — il ne détecte aucune fraude. Les bonnes métriques sont le recall (fraudes détectées / fraudes réelles) et l\'AUC-ROC.' },
        { label: 'Il faut ajouter plus de données d\'entraînement pour améliorer le modèle', isCorrect: false, points: -5, feedback: 'Ajouter des données déséquilibrées ne résout pas le problème. Il faut soit utiliser des techniques de rebalancement (oversampling, undersampling, SMOTE), soit choisir les bonnes métriques d\'évaluation.' },
      ],
      reflexe: 'Sur des données déséquilibrées, l\'accuracy est une métrique trompeuse. Utiliser recall, précision, F1-score ou AUC-ROC. Le déséquilibre de classes (fraud detection, diagnostic médical, churners) est le piège le plus fréquent en ML pratique.',
      redFlags: ['Ratio classe minoritaire 0,2% (200 fraudes / 100 000 transactions)', 'Recall = 0% (aucune fraude détectée)', 'Accuracy présentée comme unique métrique d\'évaluation'],
    },
    {
      category: 'analytics',
      title: 'Le rapport qui confirme ce qu\'on voulait croire',
      context: 'Vous analysez les données pour prouver qu\'une nouvelle fonctionnalité a amélioré les ventes. Vous présentez 5 métriques en hausse. Votre analyste remarque qu\'il en existe 8 au total.',
      visual: {
        type: 'dashboard',
        body: 'Analyse de l\'impact de la fonctionnalité "Recommandations personnalisées"',
        metrics: [
          { label: 'Taux de clics (présenté)', value: '+24%', delta: 'Présenté en réunion', deltaUp: true, color: '#16a34a' },
          { label: 'Conversion panier (présenté)', value: '+12%', delta: 'Présenté en réunion', deltaUp: true, color: '#16a34a' },
          { label: 'Taux de retour produits', value: '+31%', delta: 'Non présenté', deltaUp: false, color: '#dc2626' },
          { label: 'NPS client', value: '-8pts', delta: 'Non présenté', deltaUp: false, color: '#dc2626' },
        ],
        chartTitle: 'Métriques analysées (présentées vs omises)',
        chartBars: [
          { label: 'En hausse (présentées)', value: 5, color: '#16a34a' },
          { label: 'En baisse (omises)', value: 3, color: '#dc2626' },
        ],
      },
      choices: [
        { label: 'La présentation est valide — on a le droit de mettre en avant les points positifs', isCorrect: false, points: -10, feedback: 'Ne présenter que les métriques favorables est du biais de confirmation et du cherry-picking. Un taux de retour +31% et un NPS -8pts sont des signaux critiques qui invalident potentiellement le succès apparent.' },
        { label: 'C\'est du biais de confirmation — toutes les métriques doivent être présentées, y compris les défavorables', isCorrect: true, points: 10, feedback: 'Exact ! Sélectionner les métriques qui confirment une hypothèse est le biais de confirmation. Les 3 métriques omises (retours +31%, NPS -8pts, satisfaction -15%) suggèrent que la fonctionnalité nuit à l\'expérience même si elle augmente les clics court terme.' },
        { label: 'Il faut attendre plus de données avant de présenter les métriques défavorables', isCorrect: false, points: -5, feedback: 'Attendre des données supplémentaires pour les métriques défavorables pendant qu\'on présente les favorables est du cherry-picking temporel — une forme sophistiquée de biais de confirmation.' },
      ],
      reflexe: 'Le biais de confirmation consiste à chercher et présenter uniquement les données qui confirment une hypothèse préexistante. Une analyse honnête présente TOUTES les métriques pertinentes, y compris celles qui contredisent la conclusion souhaitée.',
      redFlags: ['5 métriques présentées sur 8 analysées', '3 métriques défavorables omises (retours +31%, NPS -8)', 'Présentation orientée pour justifier une décision déjà prise'],
    },
    {
      category: 'ml_pratique',
      title: 'L\'overfitting invisible en production',
      context: 'Votre modèle de recommandation e-commerce affichait 91% de précision en développement. Depuis le déploiement il y a 3 mois, les équipes commerce notent que les recommandations semblent "à côté".',
      visual: {
        type: 'dashboard',
        body: 'Monitoring du modèle — 3 mois après déploiement',
        metrics: [
          { label: 'Précision entraînement', value: '91%', delta: 'Lors du développement', deltaUp: true },
          { label: 'Précision production J0', value: '76%', delta: 'Au déploiement', deltaUp: false, color: '#d97706' },
          { label: 'Précision production J90', value: '58%', delta: 'Aujourd\'hui', deltaUp: false, color: '#dc2626' },
          { label: 'Données d\'entraînement', value: 'Jan-Déc 2022', delta: '14 mois de décalage', deltaUp: false },
        ],
        chartTitle: 'Dégradation de la précision en production',
        chartBars: [
          { label: 'Train', value: 91, color: '#16a34a' },
          { label: 'Deploy J0', value: 76, color: '#d97706' },
          { label: 'Deploy M1', value: 67, color: '#f59e0b' },
          { label: 'Deploy M3', value: 58, color: '#dc2626' },
        ],
      },
      choices: [
        { label: 'Le modèle a des bugs — une dégradation aussi rapide indique un défaut technique', isCorrect: false, points: -5, feedback: 'Une dégradation progressive et régulière est caractéristique du model drift, pas d\'un bug technique (qui causerait une chute brutale ou aléatoire).' },
        { label: 'Le modèle souffre de concept drift — entraîné sur 2022, il ne reflète plus les comportements de 2024', isCorrect: true, points: 10, feedback: 'Exactement ! Entraîné sur données Jan-Déc 2022, le modèle a été déployé 14 mois plus tard. Les comportements d\'achat ont changé (tendances, nouveaux produits, contexte économique). Solution : réentraîner régulièrement sur des données récentes et monitorer la performance en continu.' },
        { label: 'Les données de production sont de mauvaise qualité — améliorer le pipeline de collecte', isCorrect: false, points: -5, feedback: 'La dégradation régulière et prévisible (91% → 76% → 67% → 58%) est caractéristique du drift, pas de la qualité des données de production.' },
      ],
      reflexe: 'Tout modèle ML déployé en production se dégrade avec le temps (concept drift). Il faut monitorer les métriques de performance en continu, définir des seuils d\'alerte, et prévoir un cycle régulier de réentraînement sur des données fraîches.',
      redFlags: ['91% en train → 58% en production après 3 mois', 'Données d\'entraînement vieilles de 14 mois au déploiement', 'Aucun monitoring de performance post-déploiement'],
    },
    {
      category: 'statistiques',
      title: 'Le p-hacking du test A/B',
      context: 'Votre équipe marketing a testé 20 variantes de landing page pour trouver "la meilleure". L\'une affiche p=0,03. Ils veulent la déployer comme "statistiquement prouvée".',
      visual: {
        type: 'histogram',
        chartTitle: 'P-values des 20 variantes testées',
        body: '20 tests simultanés — 1 résultat "significatif" à p=0,03',
        chartBars: [
          { label: 'V1', value: 0.42, color: '#16a34a' },
          { label: 'V2', value: 0.78, color: '#16a34a' },
          { label: 'V3', value: 0.23, color: '#16a34a' },
          { label: 'V4', value: 0.15, color: '#16a34a' },
          { label: 'V5', value: 0.56, color: '#16a34a' },
          { label: 'V6', value: 0.34, color: '#16a34a' },
          { label: 'V7', value: 0.89, color: '#16a34a' },
          { label: 'V8', value: 0.61, color: '#16a34a' },
          { label: 'V9', value: 0.28, color: '#16a34a' },
          { label: 'V10', value: 0.47, color: '#16a34a' },
          { label: '...V19', value: 0.72, color: '#16a34a' },
          { label: 'V20 ★', value: 0.03, color: '#dc2626' },
        ],
        xLabel: 'Seuil p=0,05 — avec 20 tests, 1 faux positif est attendu par le hasard seul',
      },
      choices: [
        { label: 'V20 avec p=0,03 est statistiquement prouvée — on peut la déployer', isCorrect: false, points: -10, feedback: 'C\'est du p-hacking classique. Avec 20 tests simultanés, la probabilité qu\'au moins 1 résultat passe sous p=0,05 par hasard seul est de 64% (problème des tests multiples).' },
        { label: 'Avec 20 tests simultanés, trouver p=0,03 peut être un faux positif — appliquer la correction de Bonferroni', isCorrect: true, points: 10, feedback: 'Exactement ! Avec 20 tests, le seuil ajusté (Bonferroni) est p < 0,05/20 = 0,0025. La variante V20 avec p=0,03 ne passe pas ce seuil corrigé — son "succès" est probablement dû au hasard. Tester des hypothèses multiples sans correction génère des faux positifs en masse.' },
        { label: 'Il faut refaire le test uniquement sur V20 pour confirmer le résultat', isCorrect: false, points: 0, feedback: 'Mieux que de déployer directement, mais refaire un seul test après avoir identifié V20 comme gagnante dans les 20 reste du cherry-picking. La correction de Bonferroni ou la méthode de Holm est plus rigoureuse.' },
      ],
      reflexe: 'P-hacking : tester de multiples variantes jusqu\'à trouver p<0,05. Avec k tests simultanés, le risque de faux positif devient 1-(0,95)^k. Toujours appliquer une correction pour tests multiples (Bonferroni, BH) ou pré-enregistrer les hypothèses.',
      redFlags: ['20 tests simultanés sans correction pour tests multiples', 'P(faux positif) = 64% avec 20 tests au seuil 0,05', 'Hypothèse non pré-enregistrée avant les tests'],
    },
    {
      category: 'gouvernance',
      title: 'Le data lake sans boussole',
      context: 'Vous rejoignez l\'équipe data d\'une nouvelle entreprise. On vous demande d\'analyser les "données clients" mais le data lake contient 800 tables sans documentation. Personne ne sait ce que contient quoi.',
      visual: {
        type: 'dashboard',
        body: 'État du data lake — audit initial',
        metrics: [
          { label: 'Tables dans le data lake', value: '847', delta: 'Sans documentation', deltaUp: false, color: '#dc2626' },
          { label: 'Tables avec data owner', value: '12%', delta: '~100 tables seulement', deltaUp: false, color: '#dc2626' },
          { label: 'Tables avec description', value: '8%', delta: 'Quasi inexistant', deltaUp: false, color: '#dc2626' },
          { label: 'Temps moyen de recherche', value: '3h', delta: 'Par analyse', deltaUp: false, color: '#d97706' },
        ],
        chartTitle: 'Documentation du data lake (%)',
        chartBars: [
          { label: 'Non documentées', value: 92, color: '#dc2626' },
          { label: 'Data owner défini', value: 12, color: '#d97706' },
          { label: 'Description complète', value: 8, color: '#16a34a' },
        ],
      },
      choices: [
        { label: 'Je commence à analyser — j\'explorerai les tables jusqu\'à trouver ce dont j\'ai besoin', isCorrect: false, points: -5, feedback: 'Explorer 847 tables sans documentation peut prendre des jours et mener à utiliser les mauvaises données. C\'est aussi une source d\'erreurs critiques si on confond deux tables similaires.' },
        { label: 'Je propose d\'implémenter un data catalog avant de lancer l\'analyse — c\'est un prérequis à toute gouvernance data', isCorrect: true, points: 10, feedback: 'Exactement ! Un data catalog (Collibra, Alation, DataHub, Apache Atlas) permet de documenter chaque table : description, source, fraîcheur, data owner, exemples de données. C\'est le fondement de toute organisation data mature.' },
        { label: 'Je demande à chaque équipe métier d\'envoyer un email listant les tables qu\'elle utilise', isCorrect: false, points: 0, feedback: 'Mieux que rien, mais une approche manuelle par email ne scale pas et devient rapidement obsolète. Un outil de catalogage avec mise à jour automatique est nécessaire.' },
      ],
      reflexe: 'Un data lake sans catalogue de données est un "data swamp". Le data catalog est le premier outil de gouvernance : il documente l\'origine, la fraîcheur, le propriétaire et le contenu de chaque dataset. Sans lui, les analyses prennent plus de temps et les erreurs sont inévitables.',
      redFlags: ['847 tables, 8% documentées seulement', '3h de recherche par analyse = inefficacité massive', 'Aucun data owner défini sur 88% des tables'],
    },
    {
      category: 'ml_pratique',
      title: 'La fuite de données qui gonfle les scores',
      context: 'Votre modèle de prédiction de défaut de paiement affiche 97% d\'AUC en validation. En production, il tombe à 71%. Les scores d\'entraînement semblaient pourtant "trop beaux".',
      visual: {
        type: 'spreadsheet',
        sheetName: 'Dataset entraînement',
        body: 'Problème : la feature "délai_dernier_rappel" utilise des données du futur',
        headers: ['Client ID', 'Score crédit', 'Nb impayés', 'Délai rappel (*)', 'DÉFAUT (cible)'],
        rows: [
          [{ value: 'C001', align: 'center' }, { value: '720', align: 'right' }, { value: '0', align: 'right' }, { value: '—', align: 'center', color: '#16a34a' }, { value: 'NON', align: 'center', color: '#16a34a' }],
          [{ value: 'C002', align: 'center' }, { value: '580', align: 'right' }, { value: '2', align: 'right' }, { value: '3 jours', align: 'center', color: '#dc2626', bold: true }, { value: 'OUI', align: 'center', color: '#dc2626' }],
          [{ value: 'C003', align: 'center' }, { value: '650', align: 'right' }, { value: '1', align: 'right' }, { value: '—', align: 'center', color: '#16a34a' }, { value: 'NON', align: 'center', color: '#16a34a' }],
          [{ value: 'C004', align: 'center' }, { value: '490', align: 'right' }, { value: '4', align: 'right' }, { value: '1 jour', align: 'center', color: '#dc2626', bold: true }, { value: 'OUI', align: 'center', color: '#dc2626' }],
          [{ value: '(*) LEAKAGE', bold: true, align: 'left', bg: '#fef2f2', color: '#dc2626' }, { value: 'Le délai de rappel n\'existe', align: 'left', bg: '#fef2f2', color: '#dc2626' }, { value: 'que APRÈS', align: 'left', bg: '#fef2f2', color: '#dc2626' }, { value: 'le défaut !', align: 'left', bg: '#fef2f2', color: '#dc2626' }, { value: 'LEAKAGE', bold: true, align: 'center', bg: '#fef2f2', color: '#dc2626' }],
        ],
      },
      choices: [
        { label: '97% d\'AUC est excellent — le modèle est prêt pour la production', isCorrect: false, points: -10, feedback: 'Des scores "trop beaux" en validation sont souvent le signe de data leakage. Le "délai de rappel" est une information qui n\'existe qu\'APRÈS que le client a fait défaut — impossible à connaître à l\'instant de la prédiction.' },
        { label: 'La feature "délai de rappel" est un leakage — elle contient des informations du futur', isCorrect: true, points: 10, feedback: 'Exactement ! Le "délai de rappel" (combien de jours après l\'impayé le client a été relancé) n\'est connu qu\'après le défaut. Le modèle a "triché" en utilisant une information future pour prédire un événement passé. D\'où les 97% en validation et 71% en production.' },
        { label: 'Il faut augmenter la taille du dataset d\'entraînement pour corriger la performance', isCorrect: false, points: -5, feedback: 'Plus de données avec du leakage donne plus de leakage. Il faut identifier et retirer la feature problématique, puis réentraîner.' },
      ],
      reflexe: 'Le data leakage est quand une feature d\'entraînement contient des informations qui ne seraient pas disponibles au moment de la prédiction en production. Toujours vérifier la chronologie des données et que les features reflètent uniquement ce qui est connu à l\'instant T de prédiction.',
      redFlags: ['AUC de 97% en validation mais 71% en production', 'Feature "délai_dernier_rappel" créée après l\'événement prédit', 'Corrélation parfaite entre la feature de leakage et la cible'],
    },
    {
      category: 'statistiques',
      title: 'La distribution cachée par la moyenne',
      context: 'Le rapport annuel affiche "Temps de réponse moyen du support : 4,2 heures". L\'objectif SLA est 8h. Tout semble OK... jusqu\'à ce qu\'un client mécontent révèle avoir attendu 72 heures.',
      visual: {
        type: 'histogram',
        chartTitle: 'Distribution des temps de réponse support',
        body: '1 247 tickets sur 6 mois — la moyenne cache une distribution asymétrique',
        chartBars: [
          { label: '0-2h', value: 520, color: '#16a34a' },
          { label: '2-4h', value: 341, color: '#16a34a' },
          { label: '4-8h', value: 198, color: '#f59e0b' },
          { label: '8-24h', value: 124, color: '#f97316' },
          { label: '24-48h', value: 42, color: '#ef4444' },
          { label: '48h+', value: 22, color: '#dc2626' },
        ],
        xLabel: 'Temps de réponse — Moyenne : 4,2h (masque 64 tickets > 24h)',
      },
      choices: [
        { label: 'La moyenne de 4,2h est bien sous le SLA de 8h — tout est conforme', isCorrect: false, points: -10, feedback: '64 tickets ont attendu plus de 24h (5% des tickets) et 22 plus de 48h. Ces clients ont vécu une expérience catastrophique que la moyenne de 4,2h masque complètement.' },
        { label: 'La moyenne masque des outliers critiques — surveiller les percentiles (P95, P99) pour les SLA', isCorrect: true, points: 10, feedback: 'Exactement ! La moyenne est insuffisante pour piloter un SLA de support. Le P95 (95e percentile) révèle le pire temps que 95% des clients ont connu. Un SLA bien défini inclut "95% des tickets traités en moins de X heures" — pas seulement la moyenne.' },
        { label: 'Ces 64 tickets > 24h sont des anomalies — les exclure du calcul donne un résultat plus représentatif', isCorrect: false, points: -10, feedback: 'Exclure des données défavorables n\'est pas de l\'analyse — c\'est de la manipulation. Ces 64 clients ont vécu une vraie mauvaise expérience qui doit être mesurée et traitée.' },
      ],
      reflexe: 'Pour les SLA, temps de réponse et performances système, toujours mesurer les percentiles (P50, P90, P95, P99), pas seulement la moyenne. La moyenne cache les queues de distribution où se trouvent les clients les plus insatisfaits.',
      redFlags: ['64 tickets > 24h invisibles dans la moyenne', 'Aucun monitoring des percentiles (P90, P95, P99)', 'SLA défini uniquement sur la moyenne'],
    },
    {
      category: 'gouvernance',
      title: 'Les données dont personne n\'est responsable',
      context: 'Votre rapport stratégique pour le Board est basé sur les données "clients actifs". Deux équipes utilisent la même terminologie mais des définitions différentes — et personne n\'est data owner.',
      visual: {
        type: 'dashboard',
        body: 'Audit des définitions des données stratégiques',
        metrics: [
          { label: 'Clients actifs (Marketing)', value: '42 800', delta: 'Connecté une fois en 12 mois', deltaUp: true, color: '#006a9e' },
          { label: 'Clients actifs (Commerce)', value: '28 400', delta: 'Achat en 3 mois', deltaUp: true, color: '#dd0061' },
          { label: 'Clients actifs (Finance)', value: '31 200', delta: 'Contrat en cours', deltaUp: true, color: '#d97706' },
          { label: 'Data Owner défini', value: 'Non', delta: 'Aucune définition officielle', deltaUp: false, color: '#dc2626' },
        ],
        chartTitle: 'Écart de définition : 42 800 vs 28 400 vs 31 200',
        chartBars: [
          { label: 'Mktg (12m)', value: 42800, color: '#006a9e' },
          { label: 'Commerce (3m)', value: 28400, color: '#dd0061' },
          { label: 'Finance (contrat)', value: 31200, color: '#d97706' },
        ],
      },
      choices: [
        { label: 'Utiliser la définition Marketing (la plus large) pour le Board — maximiser le nombre est plus impactant', isCorrect: false, points: -10, feedback: 'Choisir la définition qui maximise les chiffres sans transparence est trompeur. Le Board prend des décisions stratégiques sur ces données — une définition floue ou biaisée mène à de mauvaises décisions.' },
        { label: 'Définir officiellement "client actif" avec un data owner et une définition validée par toutes les équipes', isCorrect: true, points: 10, feedback: 'C\'est la bonne gouvernance des données. Chaque métrique stratégique doit avoir : une définition précise validée, un data owner responsable, et une source unique de vérité. C\'est le principe du "Single Source of Truth" (SSOT).' },
        { label: 'Présenter les 3 définitions au Board en les laissant choisir', isCorrect: false, points: 0, feedback: 'Mieux que de cacher l\'ambiguïté, mais le Board ne devrait pas avoir à trancher des questions de définition data — c\'est le rôle des équipes opérationnelles et du data office.' },
      ],
      reflexe: 'Le manque de gouvernance des données — absence de définitions officielles, data owners non définis, multiples "vérités" — est l\'une des principales causes d\'échec des projets data. Chaque métrique stratégique doit avoir un "Single Source of Truth".',
      redFlags: ['3 définitions différentes pour "client actif"', 'Écart de 14 400 clients entre définitions extrêmes (51%)', 'Aucun data owner pour une métrique Board'],
    },
    {
      category: 'analytics',
      title: 'Le biais de survivant dans l\'analyse',
      context: 'Votre équipe veut analyser "les caractéristiques des entreprises performantes" en étudiant les 50 plus grandes entreprises françaises du CAC 40. Vous identifiez un problème méthodologique majeur.',
      visual: {
        type: 'pie-chart',
        chartTitle: 'Répartition des entreprises "étudiées" vs réalité du marché',
        body: 'Étude sur les 50 plus grandes entreprises françaises actuelles',
        slices: [
          { label: 'Entreprises actuellement au sommet (étudiées)', value: 50, color: '#16a34a' },
          { label: 'Entreprises qui ont échoué ou décliné (ignorées)', value: 850, color: '#dc2626' },
          { label: 'Entreprises qui n\'ont jamais percé (ignorées)', value: 10000, color: '#94a3b8' },
        ],
      },
      choices: [
        { label: 'L\'étude est valide — les grandes entreprises sont les meilleures sources de bonnes pratiques', isCorrect: false, points: -10, feedback: 'C\'est le biais du survivant classique. On étudie les gagnants actuels en ignorant les perdants — qui peuvent avoir appliqué les mêmes "bonnes pratiques". Les entreprises qui ont échoué en appliquant les mêmes principes sont invisibles dans l\'analyse.' },
        { label: 'C\'est le biais du survivant — étudier uniquement les gagnants ignore les entreprises qui ont échoué avec les mêmes pratiques', isCorrect: true, points: 10, feedback: 'Exactement ! Les entreprises qui ont appliqué les mêmes "recettes" et ont quand même échoué ne figurent pas dans l\'étude. Les "bonnes pratiques" identifiées peuvent être communes à toutes les entreprises, gagnantes ou perdantes. Pour éviter ce biais, il faut aussi étudier les échecs.' },
        { label: 'Il faut augmenter l\'échantillon à 200 entreprises pour avoir plus de représentativité', isCorrect: false, points: -5, feedback: 'Augmenter l\'échantillon de grandes entreprises ne résout pas le biais de survivant — on étudierait juste plus de survivants. Il faut inclure des entreprises qui ont échoué dans l\'analyse.' },
      ],
      reflexe: 'Le biais du survivant : analyser uniquement ce qui a survécu ou réussi, en ignorant les cas d\'échec. Popularisé par Abraham Wald en WWII (étudier les avions qui reviennent, pas ceux qui sont abattus). En data : inclure les données de "non-événements" dans l\'analyse.',
      redFlags: ['Étude limitée aux 50 entreprises actuellement au top', '850+ entreprises déjà déclinées ou disparues ignorées', 'Conclusions généralisées sur des "best practices" sans référentiel d\'échec'],
    },
    {
      category: 'statistiques',
      title: 'La comparaison NPS trompeuse',
      context: 'Votre NPS est de +42. Votre concurrent annonce +38. Votre DG affirme "nous avons prouvé notre supériorité". En regardant les méthodologies, vous êtes moins enthousiaste.',
      visual: {
        type: 'dashboard',
        body: 'Comparaison des indicateurs NPS — rapport stratégique',
        metrics: [
          { label: 'Votre NPS', value: '+42', delta: '1 247 répondants, email post-achat', deltaUp: true, color: '#16a34a' },
          { label: 'NPS Concurrent', value: '+38', delta: '94 répondants, source non précisée', deltaUp: true, color: '#d97706' },
          { label: 'Intervalle de confiance (vous)', value: '±2,8', delta: '95% CI avec 1247 répondants', deltaUp: true },
          { label: 'Intervalle de confiance (concurrent)', value: '±10,2', delta: '95% CI avec 94 répondants', deltaUp: false, color: '#dc2626' },
        ],
        chartTitle: 'NPS avec intervalles de confiance',
        chartBars: [
          { label: 'Votre NPS', value: 42, color: '#16a34a' },
          { label: 'NPS concurrent', value: 38, color: '#d97706' },
          { label: 'IC vous (+/-)', value: 2.8, color: '#94a3b8' },
          { label: 'IC concurrent (+/-)', value: 10.2, color: '#dc2626' },
        ],
      },
      choices: [
        { label: '+42 vs +38 : la supériorité est prouvée — 4 points c\'est significatif', isCorrect: false, points: -10, feedback: 'L\'intervalle de confiance du concurrent (±10,2) signifie que son vrai NPS est probablement entre 27,8 et 48,2. La différence de 4 points n\'est statistiquement pas significative.' },
        { label: 'La différence n\'est pas statistiquement significative — l\'IC du concurrent (±10,2) chevauche votre résultat', isCorrect: true, points: 10, feedback: 'Parfait ! Avec 94 répondants, l\'IC du concurrent est ±10,2. Son NPS "réel" pourrait être de +27 à +48 — ce qui inclut votre +42. La comparaison n\'est pas statistiquement valide. De plus, les méthodologies de collecte différentes rendent la comparaison encore plus délicate.' },
        { label: 'Il faut aussi comparer le NPS sur les mêmes périodes pour que la comparaison soit valide', isCorrect: false, points: 0, feedback: 'La synchronisation temporelle est une bonne pratique, mais le problème principal ici est la taille des échantillons très déséquilibrées qui rend la comparaison statistiquement non valide.' },
      ],
      reflexe: 'Toujours calculer et afficher les intervalles de confiance pour les comparaisons de KPIs. Un écart de 4 points sur des NPS avec des IC de ±2,8 vs ±10,2 n\'est pas statistiquement significatif. Les tailles d\'échantillon et méthodes de collecte doivent aussi être comparables.',
      redFlags: ['IC concurrent ±10,2 points (94 répondants seulement)', 'Différence de 4 points non significative statistiquement', 'Méthodologies de collecte potentiellement différentes'],
    },
    {
      category: 'analytics',
      title: 'L\'encodage des variables catégorielles',
      context: 'Votre modèle de ML prédit la satisfaction client. L\'analyste a encodé les régions : Nord=1, Est=2, Sud=3, Ouest=4. Le modèle calcule des "moyennes de région" et fait des erreurs systématiques.',
      visual: {
        type: 'spreadsheet',
        sheetName: 'Dataset satisfaction',
        body: 'Encodage problématique : les chiffres créent un ordre artificiel entre régions',
        headers: ['Client', 'Région (encodée)', 'Satisfaction', 'Prédit (modèle)'],
        rows: [
          [{ value: 'Client 1', align: 'left' }, { value: '1 (Nord)', align: 'center', color: '#16a34a' }, { value: '8/10', align: 'center' }, { value: '7,5', align: 'center' }],
          [{ value: 'Client 2', align: 'left' }, { value: '4 (Ouest)', align: 'center', color: '#dc2626' }, { value: '8/10', align: 'center' }, { value: '6,1', align: 'center', color: '#dc2626' }],
          [{ value: 'Client 3', align: 'left' }, { value: '2 (Est)', align: 'center', color: '#16a34a' }, { value: '7/10', align: 'center' }, { value: '7,1', align: 'center' }],
          [{ value: 'Client 4', align: 'left' }, { value: '3 (Sud)', align: 'center', color: '#d97706' }, { value: '7/10', align: 'center' }, { value: '6,8', align: 'center' }],
          [{ value: 'PROBLÈME', bold: true, align: 'left', bg: '#fef2f2', color: '#dc2626' }, { value: 'Le modèle croit', align: 'left', bg: '#fef2f2', color: '#dc2626' }, { value: 'Ouest (4) >', align: 'left', bg: '#fef2f2', color: '#dc2626' }, { value: 'Nord (1)', bold: true, align: 'left', bg: '#fef2f2', color: '#dc2626' }],
        ],
      },
      choices: [
        { label: 'L\'encodage numérique est standard pour les ML — Nord=1, Ouest=4 fonctionne', isCorrect: false, points: -10, feedback: 'Non ! Un encodage ordinale (1,2,3,4) implique une relation mathématique : Nord < Est < Sud < Ouest. Le modèle traite Ouest comme "4 fois plus" que Nord, ce qui est absurde pour des régions géographiques sans ordre intrinsèque.' },
        { label: 'Les variables catégorielles sans ordre doivent être encodées en one-hot encoding, pas en ordinal', isCorrect: true, points: 10, feedback: 'Exactement ! Le one-hot encoding crée 4 colonnes binaires (is_Nord, is_Est, is_Sud, is_Ouest). Aucune relation ordinale artificielle n\'est créée. Les régions sont traitées comme des catégories indépendantes sans hiérarchie.' },
        { label: 'Il faut trier les régions alphabétiquement pour un encodage cohérent', isCorrect: false, points: -5, feedback: 'L\'ordre alphabétique ne change rien au problème fondamental : un encodage numérique crée toujours une relation ordinale artificielle entre des catégories sans ordre naturel.' },
      ],
      reflexe: 'Distincter variables catégorielles ordinales (Faible < Moyen < Fort → encodage ordinal OK) et nominales (régions, couleurs, catégories métier → one-hot encoding obligatoire). Une mauvaise encodage peut créer des relations artificielles qui biaiseront le modèle.',
      redFlags: ['Encodage ordinal sur variable nominale (régions sans ordre)', 'Modèle apprend une relation inexistante (Ouest > Nord)', 'Erreurs systématiques liées à l\'ordre artificiel'],
    },
  ],

};

// ─── PICK LOCAL SCENARIO ──────────────────────────────────────────────────────
function pickFromBank(lvl: Level, usedIndices: number[]): { scenario: Scenario; idx: number } | null {
  const bank = MTM_BANK[lvl];
  const available = bank.map((_, i) => i).filter(i => !usedIndices.includes(i));
  if (available.length === 0) {
    const allIdx = Math.floor(Math.random() * bank.length);
    return { scenario: bank[allIdx], idx: allIdx };
  }
  const idx = available[Math.floor(Math.random() * available.length)];
  return { scenario: bank[idx], idx };
}

// ─── VISUAL COMPONENTS DATA ───────────────────────────────────────────────────
function PieChartVisual({ visual }: { visual: ScenarioVisual }) {
  const slices = visual.slices || [];
  const total = slices.reduce((acc, s) => acc + s.value, 0);
  let cumAngle = -90;
  const cx = 100, cy = 100, r = 80;
  const polarToXY = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos((angle * Math.PI) / 180),
    y: cy + radius * Math.sin((angle * Math.PI) / 180),
  });
  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', padding: '16px' }}>
      <div style={{ fontWeight: 700, fontSize: '13px', color: DARK, marginBottom: '12px', textAlign: 'center' }}>
        {visual.chartTitle || 'Graphique'}
      </div>
      {visual.body && <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '12px', textAlign: 'center' }}>{visual.body}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {slices.map((slice, i) => {
            const angle = (slice.value / total) * 360;
            const start = polarToXY(cumAngle, r);
            const end = polarToXY(cumAngle + angle, r);
            const largeArc = angle > 180 ? 1 : 0;
            const path = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
            cumAngle += angle;
            return <path key={i} d={path} fill={slice.color} stroke="white" strokeWidth="1.5" />;
          })}
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: DARK }}>
              <div style={{ width: '12px', height: '12px', background: s.color, flexShrink: 0 }} />
              <span>{s.label}</span>
              <span style={{ color: '#6b7280', marginLeft: '4px' }}>{((s.value / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HistogramVisual({ visual }: { visual: ScenarioVisual }) {
  const bars = visual.chartBars || [];
  const maxVal = Math.max(...bars.map(b => b.value));
  const minVal = visual.yAxisStart ?? 0;
  const range = maxVal - minVal || 1;
  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', padding: '16px' }}>
      <div style={{ fontWeight: 700, fontSize: '13px', color: DARK, marginBottom: '12px', textAlign: 'center' }}>
        {visual.chartTitle || 'Histogramme'}
      </div>
      {visual.body && <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '12px', textAlign: 'center' }}>{visual.body}</div>}
      {visual.yAxisStart !== undefined && visual.yAxisStart > 0 && (
        <div style={{ fontSize: '11px', color: '#dc2626', marginBottom: '8px', textAlign: 'center', fontWeight: 600 }}>
          ⚠ Axe Y commence à {visual.yAxisStart.toLocaleString('fr-FR')} (pas à 0)
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '140px', padding: '0 8px', borderBottom: '2px solid #374151', borderLeft: '2px solid #374151' }}>
        {bars.map((bar, i) => {
          const heightPct = ((bar.value - minVal) / range) * 100;
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '9px', color: '#374151', fontWeight: 600 }}>
                {bar.value > 1000 ? `${(bar.value / 1000).toFixed(0)}k` : bar.value.toFixed?.(2) ?? bar.value}
              </span>
              <div style={{ width: '100%', height: `${Math.max(heightPct, 4)}%`, background: bar.color, transition: 'height 0.4s' }} />
              <span style={{ fontSize: '9px', color: '#6b7280', textAlign: 'center', lineHeight: '1.2' }}>{bar.label}</span>
            </div>
          );
        })}
      </div>
      {visual.xLabel && (
        <div style={{ fontSize: '10px', color: '#d97706', marginTop: '8px', textAlign: 'center', fontStyle: 'italic' }}>{visual.xLabel}</div>
      )}
    </div>
  );
}

function SpreadsheetVisual({ visual }: { visual: ScenarioVisual }) {
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const headers = visual.headers || [];
  const rows = visual.rows || [];
  const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
  return (
    <div className="flex flex-col h-full bg-white border border-gray-300 overflow-hidden" style={{ fontFamily: 'Calibri, Arial, sans-serif' }}>
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-300" style={{ background: '#217346' }}>
        <Database size={13} className="text-white" />
        <span className="text-xs font-bold text-white">Microsoft Excel</span>
        <span className="ml-auto text-xs text-green-200 font-medium">{visual.sheetName || 'Feuille1'}</span>
      </div>
      <div className="flex items-center gap-2 px-2 py-1 border-b border-gray-200 bg-gray-50">
        <div className="w-16 px-2 py-0.5 border border-gray-300 text-xs text-center text-gray-600 font-mono">
          {activeCell || 'A1'}
        </div>
        <div className="flex-1 px-2 py-0.5 border border-gray-300 text-xs text-gray-700 font-mono bg-white">
          {activeCell ? `=${activeCell}` : 'fx'}
        </div>
      </div>
      {visual.body && (
        <div className="px-3 py-1.5 border-b border-gray-100 bg-blue-50 text-xs text-blue-700 flex items-center gap-1.5">
          <Info size={11} />
          {visual.body}
        </div>
      )}
      <div className="overflow-auto flex-1">
        <table className="w-full border-collapse text-xs" style={{ minWidth: '100%' }}>
          <thead>
            <tr>
              <th className="w-8 border-r border-b border-gray-300 bg-gray-100 text-gray-500 font-normal text-center py-1" style={{ minWidth: 32 }}></th>
              {headers.map((h, i) => (
                <th key={i} className="border-r border-b border-gray-300 bg-gray-100 text-gray-700 font-semibold px-2 py-1 text-center whitespace-nowrap"
                  style={{ minWidth: 90 }}>
                  <div className="text-gray-400 text-xs font-normal mb-0.5">{cols[i]}</div>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-blue-50">
                <td className="border-r border-b border-gray-200 bg-gray-100 text-gray-500 text-center py-1 font-normal" style={{ minWidth: 32 }}>{ri + 2}</td>
                {row.map((cell, ci) => (
                  <td key={ci} onClick={() => setActiveCell(`${cols[ci]}${ri + 2}`)}
                    className="border-r border-b border-gray-200 px-2 py-1 cursor-pointer whitespace-nowrap"
                    style={{
                      background: cell.bg || (activeCell === `${cols[ci]}${ri + 2}` ? '#bdd7ee' : 'white'),
                      color: cell.color || '#1f1f1f',
                      fontWeight: cell.bold ? 700 : 400,
                      textAlign: cell.align || 'right',
                      outline: activeCell === `${cols[ci]}${ri + 2}` ? '2px solid #217346' : 'none',
                    }}>
                    {cell.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center px-2 py-1 border-t border-gray-300 bg-gray-100 gap-2">
        <div className="px-3 py-0.5 text-xs font-medium border-t-2 cursor-pointer text-white bg-green-700" style={{ borderColor: '#217346' }}>
          {visual.sheetName || 'Feuil1'}
        </div>
        <span className="text-xs text-gray-500">+</span>
        <span className="ml-auto text-xs text-gray-500">Zoom : 100%</span>
      </div>
    </div>
  );
}

function DashboardVisual({ visual }: { visual: ScenarioVisual }) {
  const metrics = visual.metrics || [];
  const bars = visual.chartBars || [];
  const maxVal = bars.length > 0 ? Math.max(...bars.map(b => b.value)) : 1;
  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden" style={{ fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 bg-white">
        <BarChart2 size={16} style={{ color: '#c1392b' }} />
        <span className="text-sm font-bold text-gray-800">Power BI</span>
        <div className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 font-medium border border-yellow-300">Rapport</div>
        <span className="ml-auto text-xs text-gray-500">{visual.body}</span>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2.5 overflow-y-auto flex-1">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white border border-gray-200 px-3 py-2.5 shadow-sm">
            <div className="text-xs text-gray-500 mb-0.5 font-medium uppercase tracking-wide truncate">{m.label}</div>
            <div className="text-2xl font-black" style={{ color: m.color || DARK }}>{m.value}</div>
            {m.delta && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs font-semibold" style={{ color: m.deltaUp ? '#16a34a' : '#dc2626' }}>
                  {m.deltaUp ? '▲' : '▼'} {m.delta}
                </span>
              </div>
            )}
          </div>
        ))}
        {bars.length > 0 && (
          <div className="col-span-2 bg-white border border-gray-200 px-3 py-3 shadow-sm">
            <div className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">{visual.chartTitle || 'Évolution'}</div>
            <div className="flex items-end gap-2 h-24">
              {bars.map((bar, i) => {
                const heightPct = (bar.value / maxVal) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs text-gray-600 font-medium">{bar.value.toLocaleString()}</div>
                    <div className="w-full transition-all duration-500"
                      style={{ height: `${heightPct}%`, minHeight: 4, background: bar.color || BLUE, maxHeight: 64 }} />
                    <div className="text-xs text-gray-500 whitespace-nowrap">{bar.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className="px-4 py-1.5 border-t border-gray-200 bg-white flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs text-gray-500">Mis à jour : Aujourd'hui {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
        <span className="ml-auto text-xs text-gray-400">Actualiser</span>
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function MTMDataIA() {
  const [, setLocation] = useLocation();

  const [assessmentIndex, setAssessmentIndex] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<number[]>([]);
  const [assessmentQuestions] = useState<AssessmentQuestion[]>(() => shuffleAndPick(ASSESSMENT_BANK, ASSESSMENT_COUNT));
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [level, setLevel] = useState<Level>('debutant');
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scenarios, setScenarios] = useState<(Scenario | null)[]>(Array(TOTAL_SCENARIOS).fill(null));
  const [loadingNext, setLoadingNext] = useState(false);
  const [usedBankIndices, setUsedBankIndices] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<ScenarioChoice | null>(null);
  const [showRedFlags, setShowRedFlags] = useState(false);

  const currentScenario = scenarios[currentIndex];
  const progress = (phase === 'assessment' || phase === 'level-reveal') ? 0 : ((currentIndex) / TOTAL_SCENARIOS) * 100;
  const levelMeta = LEVEL_META[level];
  const badge = getBadge(score);

  const usedBankIndicesRef = useRef<number[]>([]);
  usedBankIndicesRef.current = usedBankIndices;

  const fetchScenario = useCallback(async (index: number, lvl: Level): Promise<Scenario | null> => {
    setLoadingNext(true);
    await new Promise(resolve => setTimeout(resolve, 400));
    const result = pickFromBank(lvl, usedBankIndicesRef.current);
    if (result) {
      setUsedBankIndices(prev => prev.includes(result.idx) ? prev : [...prev, result.idx]);
      setScenarios(prev => { const n = [...prev]; n[index] = result.scenario; return n; });
    }
    setLoadingNext(false);
    return result?.scenario ?? null;
  }, []);

  const handleOptionSelect = (optionScore: number, optionIndex: number) => {
    setSelectedOption(optionIndex);
    setTimeout(() => {
      const newAnswers = [...assessmentAnswers, optionScore];
      setAssessmentAnswers(newAnswers);
      setSelectedOption(null);
      if (assessmentIndex + 1 < assessmentQuestions.length) {
        setAssessmentIndex(assessmentIndex + 1);
      } else {
        const detectedLevel = computeLevel(newAnswers);
        setLevel(detectedLevel);
        setPhase('level-reveal');
      }
    }, 350);
  };

  const startScenarios = async (lvl: Level) => {
    setPhase('loading');
    const s = await fetchScenario(0, lvl);
    setPhase(s ? 'scenario' : 'error');
    if (s && TOTAL_SCENARIOS > 1) fetchScenario(1, lvl);
  };

  const handleLinkClick = () => {
    if (!currentScenario) return;
    setPhase('trap-clicked');
    setScore(s => s - 5);
    setWrongCount(w => w + 1);
  };

  const handleChoice = (choice: ScenarioChoice) => {
    if (phase !== 'scenario') return;
    setSelectedChoice(choice);
    setPhase('answered');
    setScore(s => s + choice.points);
    if (!choice.isCorrect) setWrongCount(w => w + 1);
  };

  const handleNextScenario = async () => {
    const next = currentIndex + 1;
    if (next >= TOTAL_SCENARIOS) { setPhase('final'); return; }
    setSelectedChoice(null);
    setShowRedFlags(false);
    setCurrentIndex(next);
    if (!scenarios[next]) {
      setPhase('loading');
      const loaded = await fetchScenario(next, level);
      setPhase(loaded ? 'scenario' : 'error');
      if (loaded && next + 1 < TOTAL_SCENARIOS && !scenarios[next + 1]) fetchScenario(next + 1, level);
    } else {
      setPhase('scenario');
    }
  };

  const handleRestart = () => {
    setPhase('intro');
    setAssessmentIndex(0);
    setAssessmentAnswers([]);
    setSelectedOption(null);
    setLevel('debutant');
    setCurrentIndex(0);
    setScenarios(Array(TOTAL_SCENARIOS).fill(null));
    setUsedBankIndices([]);
    setScore(0);
    setWrongCount(0);
    setSelectedChoice(null);
    setShowRedFlags(false);
  };

  const renderVisual = (s: Scenario) => {
    const t = s.visual?.type;
    if (t === 'pie-chart') return <PieChartVisual visual={s.visual} />;
    if (t === 'histogram') return <HistogramVisual visual={s.visual} />;
    if (t === 'spreadsheet') return <SpreadsheetVisual visual={s.visual} />;
    if (t === 'dashboard') return <DashboardVisual visual={s.visual} />;
    return <SpreadsheetVisual visual={s.visual} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ color: DARK }}>
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="h-0.5 w-full bg-gray-100">
          <div className="h-full transition-all duration-700" style={{ width: `${progress}%`, background: PINK }} />
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation('/data-ia/roleplay')} className="hover:opacity-60 transition-opacity">
              <ArrowLeft size={18} style={{ color: BLUE }} />
            </button>
            <img src={mcLogoPath} alt="mc2i" className="h-7 w-auto" />
            <div className="h-4 w-px bg-gray-200" />
            <span className="font-bold text-sm" style={{ color: BLUE }}>FYNE</span>
            <div className="h-4 w-px bg-gray-200 hidden sm:block" />
            <span className="text-sm text-gray-500 font-medium hidden sm:block">Monsieur Tout le Monde · Data & IA</span>
          </div>
          <div className="flex items-center gap-3">
            {(phase === 'scenario' || phase === 'answered' || phase === 'reflexe' || phase === 'trap-clicked') && (
              <>
                <div className="px-2 py-0.5 text-xs font-bold" style={{ background: levelMeta.bg, color: levelMeta.color }}>{levelMeta.label}</div>
                <span className="text-xs text-gray-400">{currentIndex + 1}/{TOTAL_SCENARIOS}</span>
                <span className="text-sm font-bold" style={{ color: score >= 0 ? BLUE : PINK }}>{score > 0 ? '+' : ''}{score} pts</span>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pt-14">
        <AnimatePresence mode="wait">

          {/* ═══ INTRO ═══════════════════════════════════════════════════════ */}
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="min-h-screen flex flex-col lg:flex-row">
              <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-16">
                <div className="max-w-xl">
                  <div className="text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1 inline-block" style={{ background: `${BLUE}12`, color: BLUE }}>
                    Formation Data & IA · Grand Public
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-none">
                    <span style={{ color: PINK }}>Je suis</span><br />
                    <span style={{ color: DARK }}>Monsieur</span><br />
                    <span style={{ color: BLUE }}>Tout le Monde</span>
                  </h1>
                  <div className="w-16 h-1 mb-7" style={{ background: PINK }} />
                  <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    5 questions pour détecter votre niveau, puis 10 scénarios <strong>100% interactifs</strong> : tableaux Excel, dashboards Power BI, camemberts trompeurs, analyses statistiques, ML...
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-10">
                    {[
                      { icon: <FileSpreadsheet size={16} />, label: 'Excel & TCD', sub: 'Formules, erreurs, RECHERCHEV' },
                      { icon: <BarChart2 size={16} />, label: 'Dashboards BI', sub: 'Power BI, Tableau, KPIs' },
                      { icon: <PieChart size={16} />, label: 'Data Viz', sub: 'Graphiques, camemberts, axes' },
                      { icon: <Brain size={16} />, label: 'Analytics & ML', sub: 'Corrélation, biais, modèles' },
                    ].map((item, i) => (
                      <div key={i} className="border border-gray-100 p-3 bg-gray-50 flex items-start gap-2">
                        <div className="mt-0.5 flex-shrink-0" style={{ color: BLUE }}>{item.icon}</div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">{item.label}</div>
                          <div className="text-xs text-gray-500">{item.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setPhase('assessment')} className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity" style={{ background: BLUE }}>
                    Évaluer mon niveau <ArrowRight size={18} />
                  </button>
                </div>
              </div>
              <div className="hidden lg:flex w-72 border-l border-gray-100 flex-col justify-center px-8 py-16" style={{ background: '#fafafa' }}>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Ce module couvre</div>
                <div className="space-y-2">
                  {[
                    'Formules Excel et pièges courants', 'Tableaux croisés dynamiques', 'Graphiques trompeurs (axe Y, 3D)', 'Dashboards Power BI et filtres', 'Qualité des données (doublons, null)', 'Corrélation vs causalité', 'Biais statistiques et biais du survivant', 'KPIs et métriques bien définis', 'Machine learning et overfitting', 'Gouvernance et data catalog'
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: i % 2 === 0 ? PINK : BLUE }} />
                      <span className="text-xs text-gray-600">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ ÉVALUATION ══════════════════════════════════════════════════ */}
          {phase === 'assessment' && (() => {
            const currentQ = assessmentQuestions[assessmentIndex];
            return (
              <motion.div key={`assess-${assessmentIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                className="min-h-screen flex flex-col">
                <div className="border-b border-gray-100 px-8 py-4 flex items-center gap-4">
                  <span className="text-xs text-gray-400 font-medium">Évaluation</span>
                  <div className="flex-1 flex items-center gap-1.5">
                    {assessmentQuestions.map((_, i) => (
                      <div key={i} className="h-1.5 flex-1 transition-all duration-300"
                        style={{ background: i < assessmentIndex ? BLUE : i === assessmentIndex ? `${BLUE}50` : '#e5e7eb' }} />
                    ))}
                  </div>
                  <span className="text-xs font-bold" style={{ color: BLUE }}>{assessmentIndex + 1} / {assessmentQuestions.length}</span>
                </div>
                <div className="flex-1 flex flex-col justify-center px-6 lg:px-12 py-8">
                  <div className="max-w-2xl">
                    {currentQ?.context && (
                      <div className="text-sm text-gray-500 mb-4 px-4 py-2 border-l-2" style={{ borderColor: BLUE }}>{currentQ.context}</div>
                    )}
                    <h2 className="font-black text-gray-900 leading-tight text-2xl lg:text-3xl mb-8">
                      {currentQ?.question}
                    </h2>
                    {(
                      <div className="space-y-3">
                        {currentQ?.options.map((opt, i) => (
                          <motion.button key={i} onClick={() => handleOptionSelect(opt.score, i)} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                            className="w-full text-left border px-5 py-4 transition-all flex items-start gap-4"
                            style={{ borderColor: selectedOption === i ? BLUE : '#e5e7eb', background: selectedOption === i ? `${BLUE}08` : 'white' }}>
                            <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-bold border transition-colors"
                              style={{ borderColor: selectedOption === i ? BLUE : '#d1d5db', color: selectedOption === i ? BLUE : '#6b7280' }}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{opt.label}</div>
                              {opt.sublabel && <div className="text-xs text-gray-500 mt-0.5">{opt.sublabel}</div>}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* ═══ NIVEAU RÉVÉLÉ ════════════════════════════════════════════════ */}
          {phase === 'level-reveal' && (
            <motion.div key="level-reveal" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-8">
              <div className="max-w-lg w-full text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: BLUE }}>Évaluation terminée</div>
                  <h2 className="text-4xl font-black mb-3" style={{ color: DARK }}>Niveau</h2>
                  <h1 className="text-6xl font-black mb-6" style={{ color: levelMeta.color }}>{levelMeta.label}</h1>
                  <div className="w-16 h-1 mx-auto mb-6" style={{ background: levelMeta.color }} />
                  <p className="text-gray-600 mb-10 leading-relaxed">{levelMeta.desc}</p>
                  <button onClick={() => startScenarios(level)}
                    className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity"
                    style={{ background: levelMeta.color }}>
                    Démarrer les scénarios <ArrowRight size={18} />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ═══ CHARGEMENT ══════════════════════════════════════════════════ */}
          {phase === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center">
              <Loader2 size={32} className="animate-spin mb-4" style={{ color: BLUE }} />
              <p className="text-gray-600 font-medium">Sélection du scénario…</p>
              <p className="text-xs text-gray-400 mt-1">Niveau <span className="font-bold" style={{ color: levelMeta.color }}>{levelMeta.label}</span></p>
            </motion.div>
          )}

          {/* ═══ ERREUR ══════════════════════════════════════════════════════ */}
          {phase === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-8">
              <div className="max-w-md w-full text-center">
                <AlertTriangle size={28} className="mx-auto mb-4" style={{ color: PINK }} />
                <h2 className="text-2xl font-black mb-3">Scénario indisponible</h2>
                <p className="text-gray-600 mb-8">Impossible de charger le scénario.</p>
                <button onClick={() => startScenarios(level)} className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold" style={{ background: BLUE }}>
                  <RefreshCw size={15} /> Réessayer
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ SCÉNARIO ════════════════════════════════════════════════════ */}
          {phase === 'scenario' && currentScenario && (
            <motion.div key={`sc-${currentIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="min-h-screen flex flex-col lg:flex-row">
              <div className="flex-1 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 text-white" style={{ background: PINK }}>
                      {currentIndex + 1}/{TOTAL_SCENARIOS}
                    </div>
                    <div className="text-xs px-2 py-0.5 font-medium" style={{ background: levelMeta.bg, color: levelMeta.color }}>{levelMeta.label}</div>
                    <div className="ml-auto">
                      {currentScenario.redFlags && (
                        <button onClick={() => setShowRedFlags(!showRedFlags)}
                          className="text-xs flex items-center gap-1 font-medium hover:opacity-70"
                          style={{ color: showRedFlags ? PINK : '#9ca3af' }}>
                          <Eye size={11} />{showRedFlags ? 'Masquer indices' : 'Indices 💡'}
                        </button>
                      )}
                    </div>
                  </div>
                  <h2 className="text-lg font-black text-gray-900">{currentScenario.title}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{currentScenario.context}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {renderVisual(currentScenario)}
                </div>
                <AnimatePresence>
                  {showRedFlags && currentScenario.redFlags && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-gray-100">
                      <div className="px-6 py-3 bg-amber-50">
                        <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: PINK }}>Signaux d'alerte</div>
                        <div className="space-y-1">
                          {currentScenario.redFlags.map((f, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <AlertTriangle size={11} className="flex-shrink-0 mt-0.5" style={{ color: PINK }} />
                              <span className="text-xs text-gray-700">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full lg:w-80 flex flex-col border-l border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Situation</div>
                  <p className="text-sm text-gray-700 leading-relaxed">{currentScenario.visual.prompt || currentScenario.context}</p>
                </div>
                <div className="flex-1 px-6 py-4 overflow-y-auto">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Que faites-vous ?</div>
                  <div className="space-y-2">
                    {currentScenario.choices.map((choice, i) => (
                      <motion.button key={i} onClick={() => handleChoice(choice)} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                        className="w-full text-left border border-gray-200 px-4 py-3 text-sm bg-white hover:border-gray-400 hover:bg-gray-50 transition-all flex items-start gap-3">
                        <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-xs font-bold border border-gray-300 text-gray-500">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="font-medium text-gray-800">{choice.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ FEEDBACK UNIFIÉ ══════════════════════════════════════════════ */}
          {(phase === 'answered' || phase === 'trap-clicked' || phase === 'reflexe') && currentScenario && (() => {
            const enrich = getEnrichment(currentScenario.category);
            const isTrap = phase === 'trap-clicked';
            const correct = !isTrap && selectedChoice?.isCorrect;
            const pts = isTrap ? -5 : (selectedChoice?.points ?? 0);
            const verdictTitle = isTrap ? 'Vous êtes tombé dans le piège' : correct ? 'Bon réflexe !' : 'Ce n\'était pas le bon choix';
            const verdictSub = isTrap ? (currentScenario.clickConsequence || 'Ce lien aurait exposé vos données.') : (selectedChoice?.feedback ?? '');
            const borderColor = (isTrap || !correct) ? 'border-red-500' : 'border-green-500';
            const bgColor = (isTrap || !correct) ? 'bg-red-50' : 'bg-green-50';
            const textColor = (isTrap || !correct) ? 'text-red-700' : 'text-green-700';
            const subColor = (isTrap || !correct) ? 'text-red-600' : 'text-green-600';
            const ptsColor = (isTrap || !correct) ? 'text-red-600' : 'text-green-600';
            const Icon = (isTrap || !correct) ? XCircle : CheckCircle;
            const iconClass = (isTrap || !correct) ? 'text-red-500' : 'text-green-600';
            return (
              <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-screen flex flex-col" style={{ background: '#fafafa' }}>
                <div className={`border-l-4 ${borderColor} ${bgColor} px-5 py-3 flex items-center gap-3 flex-shrink-0`}>
                  <Icon size={20} className={`${iconClass} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-black ${textColor}`}>{verdictTitle}</div>
                    <div className={`text-xs leading-snug ${subColor} truncate`}>{verdictSub}</div>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 mr-4 ${ptsColor}`}>{pts > 0 ? '+' : ''}{pts} pts</span>
                  <button onClick={handleNextScenario} disabled={loadingNext}
                    className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                    style={{ background: BLUE }}>
                    {loadingNext ? <><Loader2 size={14} className="animate-spin" />Chargement…</> :
                     currentIndex + 1 >= TOTAL_SCENARIOS ? <><Trophy size={14} />Voir mon bilan</> : <>Scénario suivant <ArrowRight size={14} /></>}
                  </button>
                </div>
                <div className="px-5 py-3 border-b border-gray-200 flex-shrink-0" style={{ background: `${BLUE}06` }}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: BLUE }}>À retenir</div>
                      <p className="text-xs font-semibold text-gray-600 leading-snug">{enrich.resumeCle}</p>
                    </div>
                    <div className="flex-1 min-w-0 border-l border-gray-200 pl-4">
                      <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: BLUE }}>Ce scénario</div>
                      <p className="text-xs font-bold text-gray-900 leading-snug">{currentScenario.reflexe}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-0">
                  <div className="flex flex-col border-r border-gray-200 min-h-0">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2 flex-shrink-0" style={{ background: '#f0f9ff' }}>
                      <Shield size={12} style={{ color: BLUE }} />
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: BLUE }}>Les bons réflexes</span>
                    </div>
                    <div className="flex-1 px-4 py-3 space-y-2 overflow-y-auto">
                      {enrich.bonnesPratiques.map((p, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle size={11} className="text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-700 leading-snug">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col border-r border-gray-200 min-h-0">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2 flex-shrink-0" style={{ background: '#fff7ed' }}>
                      <AlertTriangle size={12} style={{ color: '#d97706' }} />
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#d97706' }}>Le saviez-vous ?</span>
                    </div>
                    <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto">
                      {enrich.faitsHistoriques.map((f, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ background: '#d97706' }}>{i + 1}</div>
                          <span className="text-xs text-gray-700 leading-snug">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col min-h-0">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2 flex-shrink-0" style={{ background: '#fff1f2' }}>
                      <Flag size={12} style={{ color: PINK }} />
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: PINK }}>Signaux d'alerte</span>
                    </div>
                    <div className="flex-1 px-4 py-3 space-y-2 overflow-y-auto">
                      {currentScenario.redFlags?.map((f, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <AlertTriangle size={11} className="flex-shrink-0 mt-0.5" style={{ color: PINK }} />
                          <span className="text-xs text-gray-700 leading-snug">{f}</span>
                        </div>
                      )) ?? <span className="text-xs text-gray-400 italic">Aucun signal spécifique</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* ═══ BILAN FINAL ══════════════════════════════════════════════════ */}
          {phase === 'final' && (
            <motion.div key="final" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col">
              <div className="px-8 lg:px-14 py-12 border-b border-gray-100 text-center" style={{ background: DARK }}>
                <div className="text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 inline-block text-white" style={{ background: BLUE }}>
                  Formation complète · Niveau {levelMeta.label}
                </div>
                <h1 className="text-5xl font-black tracking-tight mb-4 text-white">Votre profil IA</h1>
                <div className="w-16 h-1 mx-auto mb-8" style={{ background: PINK }} />
                <div className="flex flex-col items-center gap-5">
                  <div className="flex items-end gap-2">
                    <span className="text-8xl font-black" style={{ color: score >= 0 ? '#60a5fa' : PINK }}>{score}</span>
                    <span className="text-2xl text-white/40 mb-4">/ {MAX_SCORE}</span>
                  </div>
                  <div className="px-8 py-3 border-2 inline-flex items-center gap-3"
                    style={{ borderColor: badge.border, background: badge.bg, color: badge.color }}>
                    <span className="text-xl font-black uppercase tracking-wider">{badge.label}</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 px-8 lg:px-14 py-12">
                <div className="max-w-3xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Résultats</div>
                      {[
                        { label: 'Niveau évalué', value: levelMeta.label },
                        { label: 'Bons réflexes', value: `${TOTAL_SCENARIOS - wrongCount} / ${TOTAL_SCENARIOS}` },
                        { label: 'Score final', value: `${score} pts` },
                        { label: 'Profil', value: badge.label },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-sm text-gray-500">{label}</span>
                          <span className="text-sm font-bold text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Ce que ça signifie</div>
                      <div className="p-4 border border-gray-200 bg-white mb-4">
                        {badge.label === 'Utilisateur Éclairé' && <p className="text-sm text-gray-700">Vous maîtrisez les fondamentaux : vous vérifiez les informations, protégez vos données et gardez l'humain dans la boucle.</p>}
                        {badge.label === 'Utilisateur Prudent' && <p className="text-sm text-gray-700">Vous avez de bons instincts mais quelques angles morts — notamment sur la protection des données et les biais algorithmiques.</p>}
                        {badge.label === 'Utilisateur Naïf' && <p className="text-sm text-gray-700">Quelques réflexes simples transformeront complètement votre relation à l'IA. La formation est la meilleure protection.</p>}
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Les 3 règles d'or</div>
                      {['Vérifiez toujours les faits importants sur des sources primaires', 'N\'envoyez jamais de données sensibles à une IA non validée', 'Gardez l\'humain dans la boucle pour les décisions à fort impact'].map((r, i) => (
                        <div key={i} className="flex items-start gap-2 mb-2">
                          <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5" style={{ background: BLUE }}>{i + 1}</div>
                          <span className="text-xs text-gray-700 leading-snug">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={handleRestart} className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-sm hover:opacity-90" style={{ background: BLUE }}>
                      <RefreshCw size={14} />Recommencer
                    </button>
                    <button onClick={() => setLocation('/data-ia/roleplay')} className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm border-2 border-gray-300 hover:border-gray-500 bg-white">
                      <ArrowLeft size={14} />Retour aux modules
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
