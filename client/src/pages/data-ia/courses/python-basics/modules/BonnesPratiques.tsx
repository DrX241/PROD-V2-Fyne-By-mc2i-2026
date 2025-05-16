import React from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, AlertTriangle, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface BonnesPratiquesProps {
  goToNext: () => void;
  goToPrev: () => void;
}

const BonnesPratiques: React.FC<BonnesPratiquesProps> = ({ goToNext, goToPrev }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Bonnes pratiques en Python</h2>
      
      <div className="mb-6">
        <p className="mb-4">Les bonnes pratiques en programmation Python sont essentielles pour écrire du code lisible, maintenable et efficace. Elles sont particulièrement importantes en data science, où les projets peuvent devenir complexes et doivent souvent être partagés avec d'autres personnes.</p>
        
        <h3 className="text-xl font-semibold mb-3">Style de code et conventions</h3>
        <p className="mb-3">Python a des conventions de style bien établies, principalement documentées dans le PEP 8 (Python Enhancement Proposal 8).</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">PEP 8 - Guide de style pour Python</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-semibold text-blue-300 mb-2">Indentation et espacement</h5>
              <ul className="list-disc list-inside space-y-1 text-blue-200">
                <li>Utilisez 4 espaces pour l'indentation</li>
                <li>Limitez les lignes à 79 caractères</li>
                <li>Utilisez des lignes vides pour séparer les fonctions et classes</li>
                <li>Utilisez des espaces autour des opérateurs</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold text-blue-300 mb-2">Nommage</h5>
              <ul className="list-disc list-inside space-y-1 text-blue-200">
                <li><code>lowercase_with_underscores</code> pour fonctions et variables</li>
                <li><code>UPPERCASE_WITH_UNDERSCORES</code> pour constantes</li>
                <li><code>CapitalizedWords</code> (ou CamelCase) pour classes</li>
                <li>Préfixe <code>_</code> pour attributs/méthodes "privés"</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4">
            <h5 className="font-semibold text-blue-300 mb-2">Exemples de code suivant PEP 8</h5>
            <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
              {`# Constante
MAX_ITERATIONS = 1000

# Fonction
def calculate_statistics(data_points, ignore_outliers=False):
    """
    Calcule des statistiques sur une liste de points de données.
    
    Args:
        data_points: Liste de valeurs numériques
        ignore_outliers: Si True, ignore les valeurs aberrantes
    
    Returns:
        Un dictionnaire contenant les statistiques
    """
    # Corps de la fonction avec une indentation de 4 espaces
    if not data_points:
        return None
    
    # Espacement correct autour des opérateurs
    mean = sum(data_points) / len(data_points)
    
    return {
        'mean': mean,
        'min': min(data_points),
        'max': max(data_points)
    }

# Classe avec nommage CamelCase
class DataAnalyzer:
    def __init__(self, data):
        # Attribut "privé" avec préfixe _
        self._data = data
    
    def get_summary(self):
        return calculate_statistics(self._data)`}
            </SyntaxHighlighter>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-800/40 rounded-lg p-4">
            <h4 className="flex items-center font-semibold mb-2">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              À faire
            </h4>
            <ul className="list-disc list-inside space-y-1 text-green-200">
              <li>Écrire des noms de variables descriptifs</li>
              <li>Utiliser des docstrings pour documenter le code</li>
              <li>Suivre les conventions de style PEP 8</li>
              <li>Garder les fonctions courtes et ciblées</li>
              <li>Utiliser des commentaires pour clarifier les sections complexes</li>
              <li>Utiliser des gestionnaires de contexte (<code>with</code>)</li>
              <li>Vérifier les erreurs et les cas limites</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-800/40 rounded-lg p-4">
            <h4 className="flex items-center font-semibold mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-400 mr-2" />
              À éviter
            </h4>
            <ul className="list-disc list-inside space-y-1 text-amber-200">
              <li>Noms de variables vagues (<code>x</code>, <code>temp</code>, <code>foo</code>)</li>
              <li>Variables globales inutiles</li>
              <li>Fonctions trop longues ou complexes</li>
              <li>Duplication de code</li>
              <li>Commentaires décrivant l'évidence</li>
              <li>Importations multiples du même module</li>
              <li>Utilisation de constructions complexes sans nécessité</li>
            </ul>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Qualité du code</h3>
        <p className="mb-3">Assurer la qualité du code va au-delà du style; cela implique d'écrire du code clair, maintenable, bien testé et robuste.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Documentation du code</h4>
          <p className="mb-2">Une bonne documentation est cruciale, particulièrement en data science où les algorithmes et les processus peuvent être complexes.</p>
          
          <h5 className="font-semibold text-blue-300 mt-3 mb-2">Docstrings</h5>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-3">
            {`def preprocess_dataset(df, categorical_cols=None, numeric_cols=None, target_col=None):
    """
    Prétraite un dataset pour l'apprentissage automatique.

    Cette fonction effectue plusieurs opérations de prétraitement:
    - Imputation des valeurs manquantes
    - Encodage des variables catégorielles
    - Normalisation des variables numériques
    - Séparation des caractéristiques et de la cible

    Parameters
    ----------
    df : pandas.DataFrame
        Le DataFrame contenant les données brutes
    categorical_cols : list, optional
        Liste des colonnes catégorielles
    numeric_cols : list, optional
        Liste des colonnes numériques
    target_col : str, optional
        Nom de la colonne cible

    Returns
    -------
    tuple
        Un tuple contenant (X_train, X_test, y_train, y_test)

    Raises
    ------
    ValueError
        Si le DataFrame est vide
    TypeError
        Si les paramètres ne sont pas des types attendus
    """
    # Code de la fonction...`}
          </SyntaxHighlighter>
          
          <h5 className="font-semibold text-blue-300 mt-3 mb-2">Commentaires utiles</h5>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`def calculate_feature_importance(model, X):
    # Ne pas commenter l'évidence
    # importance = model.feature_importances_  # Récupération des importances (inutile)
    
    # Plutôt, expliquer le pourquoi ou des détails non évidents
    # Utilisation de permutation importance au lieu de feature_importances_
    # car plus robuste aux corrélations entre caractéristiques
    from sklearn.inspection import permutation_importance
    result = permutation_importance(model, X, y, n_repeats=10, random_state=42)
    importance = result.importances_mean
    
    # Normalisation logistique pour mieux gérer les valeurs extrêmes
    # qui peuvent apparaître avec les arbres de décision
    importance = 1 / (1 + np.exp(-importance))
    
    return importance`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Principes DRY et KISS</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="bg-blue-900/50 rounded-md p-3">
              <h5 className="font-semibold text-blue-300 mb-2">DRY (Don't Repeat Yourself)</h5>
              <p className="text-sm">Évitez la duplication de code en créant des fonctions et des abstractions réutilisables. Chaque morceau de connaissance doit avoir une représentation unique dans votre code.</p>
            </div>
            
            <div className="bg-blue-900/50 rounded-md p-3">
              <h5 className="font-semibold text-blue-300 mb-2">KISS (Keep It Simple, Stupid)</h5>
              <p className="text-sm">Gardez votre code aussi simple que possible. La simplicité rend le code plus facile à comprendre, à déboguer et à maintenir. Évitez la sur-ingénierie.</p>
            </div>
          </div>
          
          <h5 className="font-semibold text-blue-300 mt-3 mb-2">Exemple DRY vs Répétition</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-amber-300 text-sm mb-1">🔴 Avec répétition</p>
              <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
                {`# Code avec duplication
def analyze_sales_data(sales_df):
    # Calcul pour les ventes du Q1
    q1_data = sales_df[sales_df['quarter'] == 'Q1']
    q1_total = q1_data['amount'].sum()
    q1_avg = q1_data['amount'].mean()
    q1_max = q1_data['amount'].max()
    print(f"Q1 - Total: {q1_total}, Avg: {q1_avg}, Max: {q1_max}")
    
    # Répétition pour Q2
    q2_data = sales_df[sales_df['quarter'] == 'Q2']
    q2_total = q2_data['amount'].sum()
    q2_avg = q2_data['amount'].mean()
    q2_max = q2_data['amount'].max()
    print(f"Q2 - Total: {q2_total}, Avg: {q2_avg}, Max: {q2_max}")
    
    # Répétition pour Q3...
    # Répétition pour Q4...`}
              </SyntaxHighlighter>
            </div>
            
            <div>
              <p className="text-green-300 text-sm mb-1">✅ Principe DRY appliqué</p>
              <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
                {`# Code DRY avec fonction réutilisable
def analyze_quarterly_data(df, quarter):
    """Analyse les données pour un trimestre spécifique."""
    quarter_data = df[df['quarter'] == quarter]
    total = quarter_data['amount'].sum()
    avg = quarter_data['amount'].mean()
    max_val = quarter_data['amount'].max()
    return total, avg, max_val

def analyze_sales_data(sales_df):
    # Analyse pour chaque trimestre avec la même fonction
    for quarter in ['Q1', 'Q2', 'Q3', 'Q4']:
        total, avg, max_val = analyze_quarterly_data(
            sales_df, quarter
        )
        print(f"{quarter} - Total: {total}, Avg: {avg}, Max: {max_val}")`}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Gestion des erreurs</h4>
          <p className="mb-2">Une bonne gestion des erreurs rend votre code plus robuste et aide à identifier rapidement les problèmes.</p>
          
          <h5 className="font-semibold text-blue-300 mt-3 mb-2">Bonnes pratiques pour les exceptions</h5>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`def load_and_process_data(file_path):
    """Charge et prétraite un fichier de données."""
    try:
        # Vérification préalable
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Le fichier {file_path} n'existe pas")
            
        # Tenter de charger le fichier
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file_path)
        else:
            raise ValueError(f"Format de fichier non supporté: {file_path}")
            
        # Validation des données
        if df.empty:
            raise ValueError("Le fichier ne contient aucune donnée")
            
        # Prétraitement
        df = preprocess_dataframe(df)
        return df
        
    except FileNotFoundError as e:
        # Gestion spécifique pour fichier manquant
        logging.error(f"Erreur: {e}")
        # Potentiellement proposer un fichier alternatif ou créer un exemple
        return None
        
    except pd.errors.ParserError:
        # Gestion spécifique pour erreur de parsing
        logging.error(f"Erreur de format dans le fichier {file_path}")
        # Potentiellement essayer un autre délimiteur ou encoding
        return None
        
    except Exception as e:
        # Catch-all pour autres erreurs, à utiliser avec parcimonie
        logging.error(f"Erreur inattendue: {e}")
        # Potentiellement remonter l'erreur pour une gestion supérieure
        raise
        
    finally:
        # Code exécuté qu'il y ait une exception ou non
        logging.info(f"Tentative de traitement de {file_path} terminée")`}
          </SyntaxHighlighter>
          
          <div className="bg-amber-900/30 border border-amber-800/40 rounded-md p-3 mt-3">
            <h5 className="font-semibold text-amber-300 mb-1">Conseils importants</h5>
            <ul className="list-disc list-inside space-y-1 text-amber-200 text-sm">
              <li>Capturez des exceptions spécifiques plutôt que de capturer <code>Exception</code> génériquement</li>
              <li>Gérez les exceptions au niveau approprié (pas trop haut, pas trop bas)</li>
              <li>Créez vos propres exceptions personnalisées pour les erreurs spécifiques à votre application</li>
              <li>Utilisez la clause <code>finally</code> pour nettoyer les ressources</li>
              <li>Journalisez les exceptions pour le débogage, mais ne montrez pas les traces d'erreur techniques aux utilisateurs finaux</li>
            </ul>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Tests et débogage</h3>
        <p className="mb-3">Les tests sont essentiels pour garantir que votre code fonctionne comme prévu et continue de fonctionner lorsque des modifications sont apportées.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Tests unitaires avec pytest</h4>
          <p className="mb-2">pytest est un framework de test populaire pour Python, offrant une syntaxe simple et de nombreuses fonctionnalités avancées.</p>
          
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-3">
            {`# Fichier: data_utils.py
def calculate_summary_stats(values):
    """Calculate summary statistics for a list of numeric values."""
    if not values:
        return None
    
    return {
        'count': len(values),
        'mean': sum(values) / len(values),
        'min': min(values),
        'max': max(values)
    }

def normalize_values(values):
    """Normalize values to range [0, 1]."""
    if not values:
        return []
    
    min_val = min(values)
    max_val = max(values)
    
    # Handle case where all values are the same
    if min_val == max_val:
        return [0.5] * len(values)
    
    return [(x - min_val) / (max_val - min_val) for x in values]`}
          </SyntaxHighlighter>
          
          <p className="mb-2">Tests pour ces fonctions :</p>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Fichier: test_data_utils.py
import pytest
from data_utils import calculate_summary_stats, normalize_values

def test_calculate_summary_stats_typical():
    """Test with typical input."""
    values = [1, 2, 3, 4, 5]
    result = calculate_summary_stats(values)
    
    assert result['count'] == 5
    assert result['mean'] == 3.0
    assert result['min'] == 1
    assert result['max'] == 5

def test_calculate_summary_stats_empty():
    """Test with empty input."""
    result = calculate_summary_stats([])
    assert result is None

def test_calculate_summary_stats_single():
    """Test with single value."""
    values = [42]
    result = calculate_summary_stats(values)
    
    assert result['count'] == 1
    assert result['mean'] == 42
    assert result['min'] == 42
    assert result['max'] == 42

def test_normalize_values_typical():
    """Test normalization with typical values."""
    values = [1, 2, 3, 4, 5]
    result = normalize_values(values)
    
    assert len(result) == 5
    assert result[0] == 0.0  # Min value maps to 0
    assert result[-1] == 1.0  # Max value maps to 1
    assert result[2] == 0.5   # Middle value maps to 0.5

def test_normalize_values_empty():
    """Test with empty input."""
    result = normalize_values([])
    assert result == []

def test_normalize_values_constant():
    """Test with constant values."""
    values = [7, 7, 7]
    result = normalize_values(values)
    
    assert all(x == 0.5 for x in result)  # All should map to 0.5`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Techniques de débogage</h4>
          <p className="mb-2">Le débogage est une compétence essentielle pour tout développeur Python, particulièrement en data science où les erreurs peuvent être subtiles.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-semibold text-blue-300 mb-2">Utilisation de print et logging</h5>
              <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
                {`import logging

# Configuration du logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='app.log'
)

def process_data(data):
    logging.info(f"Processing {len(data)} records")
    
    # Mauvais: print pour le débogage
    print(f"Data shape: {data.shape}")
    
    # Bien: logging hiérarchisé
    logging.debug(f"Data shape: {data.shape}")
    logging.debug(f"First few rows: {data.head()}")
    
    try:
        result = data.groupby('category').sum()
        logging.info("Grouping successful")
        return result
    except Exception as e:
        logging.error(f"Error in processing: {e}")
        raise`}
              </SyntaxHighlighter>
            </div>
            
            <div>
              <h5 className="font-semibold text-blue-300 mb-2">Utilisation du débogueur pdb</h5>
              <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
                {`import pdb

def complex_calculation(data, params):
    # Mettre un point d'arrêt
    # pdb.set_trace()  # Python < 3.7
    breakpoint()  # Python >= 3.7
    
    # Après avoir tapé cette ligne et exécuté le script,
    # vous entrez dans le débogueur interactif
    # Commandes utiles:
    # n (next): exécute la ligne suivante
    # s (step): entre dans la fonction
    # c (continue): continue jusqu'au prochain breakpoint
    # p variable: affiche la valeur de la variable
    # pp variable: affiche la valeur formatée joliment
    # q (quit): quitte le débogueur
    
    intermediate = data * params['factor']
    result = intermediate.sum(axis=1)
    return result`}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Optimisation et performance</h3>
        <p className="mb-3">L'optimisation est importante en data science, où les opérations peuvent impliquer de grandes quantités de données.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Règles d'optimisation</h4>
          <div className="bg-blue-950/50 border border-blue-800/60 rounded-md p-3 mb-3">
            <ul className="list-decimal list-inside space-y-1 text-blue-200">
              <li><strong>Commencez par un code correct</strong>, puis optimisez si nécessaire</li>
              <li><strong>Mesurez avant d'optimiser</strong> - utilisez des outils de profilage</li>
              <li><strong>Optimisez les goulots d'étranglement</strong>, pas le code entier</li>
              <li>Préférez les <strong>bibliothèques optimisées</strong> (NumPy, pandas) aux boucles Python</li>
              <li>Utilisez des <strong>structures de données appropriées</strong> pour votre tâche</li>
            </ul>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-semibold text-blue-300 mb-2">Profilage du code</h5>
              <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
                {`import cProfile
import pstats

# Profilage d'une fonction
def profile_function(func, *args, **kwargs):
    profiler = cProfile.Profile()
    profiler.enable()
    
    result = func(*args, **kwargs)
    
    profiler.disable()
    stats = pstats.Stats(profiler).sort_stats('cumtime')
    stats.print_stats(20)  # Top 20 des fonctions les plus lentes
    
    return result

# Utilisation
def my_analysis_function(data):
    # Code d'analyse complexe ici
    # ...
    return result

# Profiler l'exécution
result = profile_function(my_analysis_function, my_data)`}
              </SyntaxHighlighter>
            </div>
            
            <div>
              <h5 className="font-semibold text-blue-300 mb-2">Optimisation avec NumPy</h5>
              <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
                {`import numpy as np
import time

# Comparaison de performance: Python pur vs NumPy
def calculate_distances_python(points):
    """Calcule la distance euclidienne entre tous les points."""
    n = len(points)
    distances = [[0] * n for _ in range(n)]
    
    for i in range(n):
        for j in range(i+1, n):
            # Distance euclidienne en Python pur
            dx = points[i][0] - points[j][0]
            dy = points[i][1] - points[j][1]
            distance = (dx**2 + dy**2)**0.5
            
            distances[i][j] = distance
            distances[j][i] = distance
    
    return distances

def calculate_distances_numpy(points):
    """Calcule la distance euclidienne avec NumPy."""
    points_array = np.array(points)
    # Calcul vectorisé avec broadcasting
    diff = points_array[:, np.newaxis, :] - points_array
    distances = np.sqrt(np.sum(diff**2, axis=2))
    return distances

# Test de performance
points = [(np.random.random(), np.random.random()) 
          for _ in range(1000)]

start = time.time()
distances_py = calculate_distances_python(points)
end = time.time()
print(f"Python pur: {end - start:.5f} secondes")

start = time.time()
distances_np = calculate_distances_numpy(points)
end = time.time()
print(f"NumPy: {end - start:.5f} secondes")`}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Patterns d'optimisation courants</h4>
          
          <div className="space-y-3 mb-3">
            <div className="bg-blue-950/50 border-l-4 border-blue-500 p-3">
              <h5 className="font-semibold text-blue-300 mb-1">1. Vectorisation avec NumPy/Pandas</h5>
              <p className="text-sm text-blue-200">Préférez les opérations vectorisées aux boucles Python. Les opérations vectorisées sont plus rapides car elles sont implémentées en C.</p>
            </div>
            
            <div className="bg-blue-950/50 border-l-4 border-blue-500 p-3">
              <h5 className="font-semibold text-blue-300 mb-1">2. Compréhensions plutôt que boucles <code>for</code></h5>
              <p className="text-sm text-blue-200">Les compréhensions de liste sont souvent plus rapides et plus lisibles que les boucles <code>for</code> traditionnelles pour créer des listes.</p>
            </div>
            
            <div className="bg-blue-950/50 border-l-4 border-blue-500 p-3">
              <h5 className="font-semibold text-blue-300 mb-1">3. Opérations groupées avec Pandas</h5>
              <p className="text-sm text-blue-200">Utilisez <code>apply</code>, <code>groupby</code>, et autres fonctions Pandas pour traiter efficacement les données sans itérer ligne par ligne.</p>
            </div>
            
            <div className="bg-blue-950/50 border-l-4 border-blue-500 p-3">
              <h5 className="font-semibold text-blue-300 mb-1">4. Structures de données appropriées</h5>
              <p className="text-sm text-blue-200">Utilisez les bonnes structures de données: sets pour les tests d'appartenance, dictionnaires pour les lookups, deque pour les files, etc.</p>
            </div>
            
            <div className="bg-blue-950/50 border-l-4 border-blue-500 p-3">
              <h5 className="font-semibold text-blue-300 mb-1">5. Memoization pour les calculs répétitifs</h5>
              <p className="text-sm text-blue-200">Stockez les résultats de fonctions coûteuses pour éviter des recalculs avec les mêmes entrées.</p>
            </div>
          </div>
          
          <h5 className="font-semibold text-blue-300 mb-2">Exemple: Memoization</h5>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`import functools

# Décorateur pour la memoization
@functools.lru_cache(maxsize=128)
def fibonacci(n):
    """Calcule le n-ième nombre de Fibonacci avec memoization."""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Sans ce décorateur, cette fonction serait très inefficace
# pour les grands nombres car elle recalculerait les mêmes valeurs
# de nombreuses fois.

# Test de performance
import time

start = time.time()
result = fibonacci(35)
end = time.time()
print(f"Résultat: {result}")
print(f"Temps: {end - start:.5f} secondes")

# Informations sur le cache
print(f"Info du cache: {fibonacci.cache_info()}")

# Effacer le cache
fibonacci.cache_clear()

# Remarques:
# 1. @lru_cache est génial pour les fonctions récursives ou toute fonction
#    appelée plusieurs fois avec les mêmes arguments
# 2. Il existe aussi @functools.cache depuis Python 3.9 (sans limite de taille)
# 3. Pour des cas plus complexes, considérez joblib.Memory pour la persistance
#    des calculs entre les exécutions du programme`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Organisation de projets de data science</h3>
        <p className="mb-3">Un projet bien organisé est plus facile à comprendre, à maintenir et à partager.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Structure recommandée pour les projets de data science</h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold text-blue-300 mb-2">Organisation des fichiers</h5>
              <SyntaxHighlighter language="plaintext" style={vscDarkPlus} className="rounded-md text-sm">
                {`project_name/
│
├── data/                  # Données brutes et traitées
│   ├── raw/               # Données originales, non modifiées
│   ├── processed/         # Données nettoyées et prétraitées
│   └── external/          # Données externes de référence
│
├── notebooks/             # Jupyter notebooks pour l'exploration
│   ├── exploration/       # EDA initiale
│   └── report/            # Notebooks finaux / présentation
│
├── src/                   # Code source Python
│   ├── __init__.py
│   ├── data/              # Scripts de prétraitement
│   ├── features/          # Ingénierie des caractéristiques
│   ├── models/            # Modèles et prédictions
│   └── visualization/     # Visualisations réutilisables
│
├── tests/                 # Tests unitaires et d'intégration
│
├── models/                # Modèles entraînés sauvegardés
│
├── reports/               # Rapports générés et figures
│   └── figures/           # Figures générées
│
├── requirements.txt       # Dépendances Python
├── setup.py               # Installation du package
├── README.md              # Description du projet
└── .gitignore             # Fichiers à ignorer par git`}
              </SyntaxHighlighter>
            </div>
            
            <div>
              <h5 className="font-semibold text-blue-300 mb-2">Pratiques recommandées</h5>
              <div className="space-y-3">
                <div className="bg-blue-950/70 rounded-md p-3">
                  <h6 className="font-semibold mb-1">Environnements virtuels</h6>
                  <p className="text-sm">Utilisez des environnements virtuels (venv, conda) pour isoler les dépendances de chaque projet.</p>
                  <SyntaxHighlighter language="bash" style={vscDarkPlus} className="rounded-md text-xs mt-1">
                    {`# Création d'environnement avec venv
python -m venv env
source env/bin/activate  # ou env\\Scripts\\activate sur Windows

# Ou avec conda
conda create --name myproject python=3.9
conda activate myproject`}
                  </SyntaxHighlighter>
                </div>
                
                <div className="bg-blue-950/70 rounded-md p-3">
                  <h6 className="font-semibold mb-1">Gestion des dépendances</h6>
                  <p className="text-sm">Documentez toutes les dépendances dans requirements.txt ou environment.yml.</p>
                  <SyntaxHighlighter language="bash" style={vscDarkPlus} className="rounded-md text-xs mt-1">
                    {`# Générer requirements.txt
pip freeze > requirements.txt

# Installation
pip install -r requirements.txt`}
                  </SyntaxHighlighter>
                </div>
                
                <div className="bg-blue-950/70 rounded-md p-3">
                  <h6 className="font-semibold mb-1">Construction de packages Python</h6>
                  <p className="text-sm">Organisez votre code comme un package installable pour faciliter l'importation.</p>
                  <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-xs mt-1">
                    {`# Dans setup.py
from setuptools import setup, find_packages

setup(
    name="myproject",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        'numpy',
        'pandas',
        'scikit-learn',
    ],
)

# Installation en mode développement
# pip install -e .`}
                  </SyntaxHighlighter>
                </div>
                
                <div className="bg-blue-950/70 rounded-md p-3">
                  <h6 className="font-semibold mb-1">Reproductibilité</h6>
                  <p className="text-sm">Utilisez des seeds aléatoires pour la reproductibilité des résultats.</p>
                  <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-xs mt-1">
                    {`import numpy as np
import random
import torch
import tensorflow as tf

# Fixer les seeds pour la reproductibilité
SEED = 42
random.seed(SEED)
np.random.seed(SEED)
tf.random.set_seed(SEED)
torch.manual_seed(SEED)
torch.cuda.manual_seed_all(SEED)`}
                  </SyntaxHighlighter>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Exercices pratiques</h3>
        
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800 mb-6">
          <h4 className="font-semibold mb-3">Exercice 1: Refactorisation de code</h4>
          <p className="mb-2">Refactorisez le code suivant pour suivre les bonnes pratiques Python.</p>
          
          <div className="mb-3">
            <p className="text-amber-300 text-sm mb-1">🔴 Code original</p>
            <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
              {`# Code with issues
def func(d, t=None):
    # Process data
    a = []
    if t == None:
        t = 'default'
    for i in range(len(d)):
        if d[i] > 0:
            a.append(d[i] * 2)
        else:
            a.append(0)
    # Calculate stats
    s = 0
    for i in range(len(a)):
        s += a[i]
    m = s / len(a)
    # Print results
    print('Analysis for type: ' + t)
    print('Processed data: ' + str(a))
    print('Mean value: ' + str(m))
    return a, m`}
            </SyntaxHighlighter>
          </div>
          
          <div className="mt-4 mb-2 font-semibold">Solution améliorée:</div>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`def process_and_analyze_data(data, data_type='default'):
    """
    Process a list of numbers and calculate statistics.
    
    Args:
        data: List of numeric values to process
        data_type: String identifying the type of data (default: 'default')
    
    Returns:
        tuple: (processed_data, mean_value)
    """
    # Validate input
    if not data:
        raise ValueError("Input data cannot be empty")
    
    # Process data - double positive values, zero out negatives
    processed_data = [value * 2 if value > 0 else 0 for value in data]
    
    # Calculate mean using built-in functions
    mean_value = sum(processed_data) / len(processed_data)
    
    # Print results with f-strings for better readability
    print(f"Analysis for type: {data_type}")
    print(f"Processed data: {processed_data}")
    print(f"Mean value: {mean_value:.2f}")
    
    return processed_data, mean_value


# Example usage with type hints (Python 3.5+)
from typing import List, Tuple

def process_and_analyze_data_typed(data: List[float], data_type: str = 'default') -> Tuple[List[float], float]:
    """Same function with type hints for better IDE support and documentation."""
    # Implementation remains the same
    processed_data = [value * 2 if value > 0 else 0 for value in data]
    mean_value = sum(processed_data) / len(processed_data)
    
    print(f"Analysis for type: {data_type}")
    print(f"Processed data: {processed_data}")
    print(f"Mean value: {mean_value:.2f}")
    
    return processed_data, mean_value`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800 mb-6">
          <h4 className="font-semibold mb-3">Exercice 2: Ajout de Tests</h4>
          <p className="mb-2">Écrivez des tests unitaires pour la fonction suivante.</p>
          
          <div className="mb-3">
            <p className="text-sm mb-1">Fonction à tester:</p>
            <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
              {`# data_processor.py
def clean_and_transform_data(data_dict):
    """
    Clean and transform a dictionary of data.
    
    Args:
        data_dict: Dictionary with string keys and numeric values
    
    Returns:
        dict: Processed dictionary with the same keys but transformed values
        
    Raises:
        TypeError: If input is not a dictionary or values are not numeric
        ValueError: If dictionary is empty
    """
    # Validate input
    if not isinstance(data_dict, dict):
        raise TypeError("Input must be a dictionary")
    
    if not data_dict:
        raise ValueError("Input dictionary cannot be empty")
    
    result = {}
    
    for key, value in data_dict.items():
        # Verify that values are numeric
        if not isinstance(value, (int, float)):
            raise TypeError(f"Value for key '{key}' must be numeric")
        
        # Apply transformations
        # 1. Remove negative values
        # 2. Scale values > 100 down by 10%
        # 3. Round to 2 decimal places
        
        if value < 0:
            transformed_value = 0
        elif value > 100:
            transformed_value = value * 0.9
        else:
            transformed_value = value
        
        result[key] = round(transformed_value, 2)
    
    return result`}
            </SyntaxHighlighter>
          </div>
          
          <div className="mt-4 mb-2 font-semibold">Solution de test:</div>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# test_data_processor.py
import pytest
from data_processor import clean_and_transform_data

def test_clean_and_transform_typical_case():
    """Test with a typical input dictionary."""
    input_data = {
        'A': 50,
        'B': 120,
        'C': -10,
        'D': 0,
        'E': 100
    }
    
    expected = {
        'A': 50,
        'B': 108,  # 120 * 0.9 = 108
        'C': 0,    # Negative converted to 0
        'D': 0,
        'E': 100
    }
    
    result = clean_and_transform_data(input_data)
    assert result == expected

def test_clean_and_transform_empty_dict():
    """Test with an empty dictionary."""
    with pytest.raises(ValueError) as excinfo:
        clean_and_transform_data({})
    assert "empty" in str(excinfo.value).lower()

def test_clean_and_transform_non_dict():
    """Test with a non-dictionary input."""
    with pytest.raises(TypeError) as excinfo:
        clean_and_transform_data([1, 2, 3])
    assert "dictionary" in str(excinfo.value).lower()

def test_clean_and_transform_non_numeric():
    """Test with non-numeric values."""
    with pytest.raises(TypeError) as excinfo:
        clean_and_transform_data({'A': 5, 'B': 'string'})
    assert "numeric" in str(excinfo.value).lower()

def test_clean_and_transform_rounding():
    """Test that values are correctly rounded."""
    input_data = {
        'A': 33.333,
        'B': 66.666,
        'C': 120.123
    }
    
    expected = {
        'A': 33.33,
        'B': 66.67,
        'C': 108.11  # 120.123 * 0.9 = 108.1107, rounded to 108.11
    }
    
    result = clean_and_transform_data(input_data)
    assert result == expected

def test_clean_and_transform_edge_cases():
    """Test edge cases."""
    input_data = {
        'A': 0,
        'B': 100,
        'C': 100.01,  # Just above threshold
        'D': -0.01    # Just below zero
    }
    
    expected = {
        'A': 0,
        'B': 100,
        'C': 90.01,  # 100.01 * 0.9 = 90.009, rounded to 90.01
        'D': 0
    }
    
    result = clean_and_transform_data(input_data)
    assert result == expected`}
          </SyntaxHighlighter>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={goToPrev}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Précédent
        </Button>
        <Button 
          onClick={goToNext}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Suivant
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BonnesPratiques;