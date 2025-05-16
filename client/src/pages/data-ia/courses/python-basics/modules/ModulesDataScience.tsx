import React from 'react';
import { ChevronRight, ChevronLeft, Database, BarChart, Brain, Braces } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ModulesDataScienceProps {
  goToNext: () => void;
  goToPrev: () => void;
}

const ModulesDataScience: React.FC<ModulesDataScienceProps> = ({ goToNext, goToPrev }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Modules pour la Data Science</h2>
      
      <div className="mb-6">
        <p className="mb-4">La grande force de Python pour la data science réside dans son riche écosystème de bibliothèques spécialisées. Ces bibliothèques permettent d'effectuer efficacement des opérations complexes sur les données, de la manipulation à la visualisation et au machine learning.</p>
        
        <h3 className="text-xl font-semibold mb-3">NumPy: Calcul numérique</h3>
        <p className="mb-3">NumPy (Numerical Python) est la bibliothèque fondamentale pour le calcul scientifique en Python. Elle fournit un objet tableau multidimensionnel puissant et des outils pour travailler avec ces tableaux.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Création et manipulation de tableaux NumPy</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`import numpy as np

# Création de tableaux
arr1 = np.array([1, 2, 3, 4, 5])  # Tableau 1D
arr2 = np.array([[1, 2, 3], [4, 5, 6]])  # Tableau 2D

# Tableaux spéciaux
zeros = np.zeros((3, 4))  # Tableau 3x4 de zéros
ones = np.ones((2, 3, 4))  # Tableau 3D de uns
identity = np.eye(3)  # Matrice identité 3x3
sequence = np.arange(0, 10, 2)  # [0, 2, 4, 6, 8]
linear_space = np.linspace(0, 1, 5)  # 5 points équidistants entre 0 et 1
random_uniform = np.random.rand(2, 3)  # Valeurs aléatoires entre 0 et 1
random_normal = np.random.randn(2, 3)  # Distribution normale (moyenne 0, écart-type 1)

# Propriétés des tableaux
print(arr2.shape)  # (2, 3) - dimensions
print(arr2.size)   # 6 - nombre total d'éléments
print(arr2.dtype)  # int64 - type de données
print(arr2.ndim)   # 2 - nombre de dimensions

# Opérations mathématiques (vectorisées)
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

# Opérations élément par élément
print(a + b)  # [5, 7, 9]
print(a * b)  # [4, 10, 18]
print(a ** 2)  # [1, 4, 9]

# Fonctions universelles (ufuncs)
print(np.sqrt(a))  # [1., 1.41421356, 1.73205081]
print(np.exp(a))   # [2.71828183, 7.3890561, 20.08553692]
print(np.sin(a))   # [0.84147098, 0.90929743, 0.14112001]

# Agrégations
arr = np.array([[1, 2, 3], [4, 5, 6]])
print(np.sum(arr))       # 21 - somme de tous les éléments
print(np.sum(arr, axis=0))  # [5, 7, 9] - somme par colonne
print(np.sum(arr, axis=1))  # [6, 15] - somme par ligne
print(np.mean(arr))      # 3.5 - moyenne
print(np.std(arr))       # 1.707825 - écart-type
print(np.min(arr))       # 1 - minimum
print(np.max(arr))       # 6 - maximum`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Indexation et slicing avancés</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Création d'un tableau 2D
arr = np.array([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]])

# Slicing de base
print(arr[0, 1])      # 2 - élément à la position (0,1)
print(arr[0:2, 1:3])  # [[2, 3], [6, 7]] - sous-matrice

# Indexation booléenne
mask = arr > 5
print(mask)  # Tableau de booléens
print(arr[mask])  # [6, 7, 8, 9, 10, 11, 12] - éléments > 5

# Indexation avec liste
indices = [0, 2]  # Sélectionner les lignes 0 et 2
print(arr[indices])  # [[1, 2, 3, 4], [9, 10, 11, 12]]

# Modification de valeurs
arr[arr < 5] = 0  # Remplace les valeurs < 5 par 0
print(arr)

# Reshaping
arr = np.arange(12)  # [0, 1, 2, ..., 11]
reshaped = arr.reshape(3, 4)  # Tableau 3x4
print(reshaped)

# Transposition
transposed = reshaped.T  # Transpose les lignes en colonnes
print(transposed)

# Concaténation
a = np.array([[1, 2], [3, 4]])
b = np.array([[5, 6], [7, 8]])
vertical = np.vstack((a, b))  # Concaténation verticale
horizontal = np.hstack((a, b))  # Concaténation horizontale
print(vertical)
print(horizontal)`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Algèbre linéaire avec NumPy</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Création de matrices
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

# Multiplication matricielle
C1 = np.dot(A, B)  # Produit matriciel avec la fonction dot
C2 = A @ B         # Opérateur @ pour la multiplication matricielle (Python 3.5+)
print(C1)  # [[19, 22], [43, 50]]

# Déterminant, trace
print(np.linalg.det(A))  # Déterminant: -2.0
print(np.trace(A))       # Trace (somme de la diagonale): 5

# Décomposition en valeurs et vecteurs propres
eigenvalues, eigenvectors = np.linalg.eig(A)
print("Valeurs propres:", eigenvalues)
print("Vecteurs propres:\\n", eigenvectors)

# Inversion de matrice
A_inv = np.linalg.inv(A)
print(A_inv)

# Résolution de systèmes linéaires: Ax = b
b = np.array([1, 2])
x = np.linalg.solve(A, b)
print("Solution du système Ax = b:", x)

# Décomposition SVD (Singular Value Decomposition)
U, S, Vt = np.linalg.svd(A)
print("U:", U)
print("S:", S)
print("V transposée:", Vt)`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Pandas: Analyse de données</h3>
        <p className="mb-3">Pandas est une bibliothèque d'analyse et de manipulation de données qui fournit des structures de données flexibles et des outils pour travailler avec des données structurées.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Structures de données: Series et DataFrame</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`import pandas as pd
import numpy as np

# Series - tableau 1D avec des étiquettes
s = pd.Series([1, 3, 5, np.nan, 6, 8])
print(s)

# DataFrame - tableau 2D avec des étiquettes pour lignes et colonnes
# Création à partir d'un dictionnaire
data = {
    'nom': ['Alice', 'Bob', 'Charlie', 'David'],
    'age': [25, 30, 35, 40],
    'ville': ['Paris', 'Lyon', 'Marseille', 'Toulouse']
}
df = pd.DataFrame(data)
print(df)

# Création à partir de NumPy
dates = pd.date_range('20230101', periods=6)
df2 = pd.DataFrame(np.random.randn(6, 4), index=dates, columns=list('ABCD'))
print(df2)

# Informations sur le DataFrame
print(df.shape)  # (4, 3) - (lignes, colonnes)
print(df.dtypes)  # Types de données par colonne
print(df.info())  # Résumé global
print(df.describe())  # Statistiques descriptives sur les colonnes numériques

# Accès aux données
print(df.head(2))  # 2 premières lignes
print(df.tail(2))  # 2 dernières lignes
print(df['nom'])  # Accès à une colonne
print(df[['nom', 'age']])  # Accès à plusieurs colonnes

# Sélection par position
print(df.iloc[0])  # Première ligne
print(df.iloc[0:2, 1:3])  # Lignes 0-1, colonnes 1-2

# Sélection par étiquette
print(df.loc[0, 'nom'])  # Valeur à la position (0, 'nom')
print(df.loc[0:2, ['nom', 'ville']])  # Lignes 0-2, colonnes 'nom' et 'ville'`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Manipulation et nettoyage de données</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Gestion des valeurs manquantes
df = pd.DataFrame({
    'A': [1, 2, np.nan, 4],
    'B': [5, np.nan, np.nan, 8],
    'C': [9, 10, 11, 12]
})

print(df.isna())  # Tableau de booléens pour valeurs NaN
print(df.isna().sum())  # Nombre de NaN par colonne

# Méthodes de traitement des valeurs manquantes
print(df.dropna())  # Supprime les lignes avec NaN
print(df.fillna(0))  # Remplace NaN par 0
print(df.fillna(method='ffill'))  # Propagation avant (forward fill)
print(df.fillna(method='bfill'))  # Propagation arrière (backward fill)
print(df.fillna(df.mean()))  # Remplace par la moyenne de chaque colonne

# Filtrage de données
df = pd.DataFrame({
    'nom': ['Alice', 'Bob', 'Charlie', 'David', 'Eva'],
    'age': [25, 30, 35, 40, 25],
    'ville': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Paris'],
    'salaire': [45000, 50000, 55000, 60000, 42000]
})

# Filtrage par condition
print(df[df['age'] > 30])  # Personnes de plus de 30 ans
print(df[(df['age'] > 30) & (df['salaire'] > 50000)])  # Conditions multiples

# Tri de données
print(df.sort_values('age'))  # Tri par âge croissant
print(df.sort_values('age', ascending=False))  # Tri par âge décroissant
print(df.sort_values(['ville', 'age']))  # Tri par ville, puis par âge

# Suppression de doublons
df_dup = pd.DataFrame({
    'A': [1, 1, 2, 3, 4, 4],
    'B': ['a', 'a', 'b', 'c', 'd', 'd']
})
print(df_dup.drop_duplicates())  # Supprime les doublons complets
print(df_dup.drop_duplicates('A'))  # Supprime les doublons basés sur la colonne A

# Modification de données
# Ajouter une colonne
df['bonus'] = df['salaire'] * 0.1
print(df)

# Appliquer une fonction
df['salaire_mensuel'] = df['salaire'].apply(lambda x: x / 12)
print(df)

# Appliquer une fonction à tout le DataFrame
df_norm = df[['age', 'salaire']].apply(lambda x: (x - x.min()) / (x.max() - x.min()))
print(df_norm)

# Remplacement de valeurs
df['ville'] = df['ville'].replace('Paris', 'Paris (IDF)')
print(df)`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Agrégation et groupement</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Création d'un DataFrame avec plus de données
df = pd.DataFrame({
    'nom': ['Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank', 'Grace', 'Helen'],
    'departement': ['IT', 'Marketing', 'IT', 'Finance', 'Marketing', 'Finance', 'IT', 'Marketing'],
    'salaire': [55000, 60000, 65000, 70000, 62000, 72000, 58000, 61000],
    'annees_experience': [2, 5, 7, 10, 4, 8, 3, 6]
})

# Statistiques descriptives
print(df.describe())  # Statistiques par colonne numérique
print(df['salaire'].mean())  # Moyenne des salaires
print(df[['salaire', 'annees_experience']].median())  # Médiane sur plusieurs colonnes

# Agrégation par groupe
# Salaire moyen par département
dept_mean = df.groupby('departement')['salaire'].mean()
print(dept_mean)

# Plusieurs agrégations sur un groupe
result = df.groupby('departement').agg({
    'salaire': ['min', 'max', 'mean', 'std'],
    'annees_experience': ['min', 'max', 'mean']
})
print(result)

# Fonctions d'agrégation personnalisées
def range_stat(x):
    return x.max() - x.min()

result = df.groupby('departement').agg({
    'salaire': ['mean', range_stat],
    'annees_experience': ['mean', range_stat]
})
print(result)

# Filtrer les groupes
# Départements où le salaire moyen > 60000
high_salary_depts = df.groupby('departement').filter(lambda x: x['salaire'].mean() > 60000)
print(high_salary_depts)

# Transformations par groupe
# Écart par rapport à la moyenne du département
df['salaire_ecart'] = df.groupby('departement')['salaire'].transform(lambda x: x - x.mean())
print(df[['nom', 'departement', 'salaire', 'salaire_ecart']])

# Tables pivots
table_pivot = pd.pivot_table(
    df, 
    values='salaire', 
    index='departement', 
    columns='annees_experience',
    aggfunc='mean',
    fill_value=0
)
print(table_pivot)`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Fusion et jointure de données</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Création de deux DataFrames
employes = pd.DataFrame({
    'id': [1, 2, 3, 4, 5],
    'nom': ['Alice', 'Bob', 'Charlie', 'David', 'Eva'],
    'departement_id': [101, 102, 101, 103, 102]
})

departements = pd.DataFrame({
    'departement_id': [101, 102, 103, 104],
    'nom_departement': ['IT', 'Marketing', 'Finance', 'RH'],
    'budget': [500000, 300000, 700000, 200000]
})

# Jointure interne (inner join)
inner_join = pd.merge(
    employes, 
    departements, 
    on='departement_id', 
    how='inner'
)
print("Inner Join:")
print(inner_join)

# Jointure à gauche (left join)
left_join = pd.merge(
    employes, 
    departements, 
    on='departement_id', 
    how='left'
)
print("\\nLeft Join:")
print(left_join)

# Jointure à droite (right join)
right_join = pd.merge(
    employes, 
    departements, 
    on='departement_id', 
    how='right'
)
print("\\nRight Join:")
print(right_join)

# Jointure externe (outer join)
outer_join = pd.merge(
    employes, 
    departements, 
    on='departement_id', 
    how='outer'
)
print("\\nOuter Join:")
print(outer_join)

# Concaténation
df1 = pd.DataFrame({'A': ['A0', 'A1'], 'B': ['B0', 'B1']})
df2 = pd.DataFrame({'A': ['A2', 'A3'], 'B': ['B2', 'B3']})

# Concaténation verticale (empiler)
result_v = pd.concat([df1, df2], axis=0)
print("Concaténation verticale:")
print(result_v)

# Concaténation horizontale (juxtaposer)
df3 = pd.DataFrame({'C': ['C0', 'C1'], 'D': ['D0', 'D1']})
result_h = pd.concat([df1, df3], axis=1)
print("\\nConcaténation horizontale:")
print(result_h)`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Séries temporelles</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Création de séries temporelles
dates = pd.date_range(start='2023-01-01', periods=12, freq='M')
ts = pd.Series(np.random.randn(12), index=dates)
print(ts)

# Reéchantillonnage (resample)
# Moyennes trimestrielles
quarterly_data = ts.resample('Q').mean()
print("Données trimestrielles:")
print(quarterly_data)

# Cumul sur 3 mois glissants
rolling_sum = ts.rolling(window=3).sum()
print("Somme glissante sur 3 mois:")
print(rolling_sum)

# Décalage temporel (shift)
shifted = ts.shift(periods=2)  # Décalage de 2 périodes vers l'avant
print("Série décalée de 2 périodes:")
print(shifted)

# Différence (utile pour la stationnarité)
diff = ts.diff()  # Différence entre valeurs consécutives
print("Différence première:")
print(diff)

# Changement en pourcentage
pct_change = ts.pct_change()  # Changement en pourcentage
print("Changement en pourcentage:")
print(pct_change)

# Données journalières avec jours de semaine
daily_dates = pd.date_range(start='2023-01-01', periods=30, freq='D')
daily_data = pd.Series(np.random.randn(30), index=daily_dates)

# Filtrer les jours ouvrables
business_days = daily_data[daily_data.index.dayofweek < 5]  # 0-4 sont lundi-vendredi
print("Jours ouvrables uniquement:")
print(business_days)

# Extraire les composantes temporelles
months = daily_data.index.month
days = daily_data.index.day
weekdays = daily_data.index.day_name()

time_components = pd.DataFrame({
    'value': daily_data.values,
    'month': months,
    'day': days,
    'weekday': weekdays
})
print(time_components.head())`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Matplotlib et Seaborn: Visualisation</h3>
        <p className="mb-3">Matplotlib est une bibliothèque de visualisation complète, tandis que Seaborn est construite sur Matplotlib et fournit une interface de plus haut niveau pour créer des graphiques statistiques attrayants.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Visualisations de base avec Matplotlib</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`import matplotlib.pyplot as plt
import numpy as np

# Graphique linéaire simple
x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.figure(figsize=(10, 6))  # Taille en pouces
plt.plot(x, y, 'b-', label='sin(x)')  # 'b-' = ligne bleue continue
plt.title('Fonction Sinus')
plt.xlabel('x')
plt.ylabel('sin(x)')
plt.grid(True)
plt.legend()
plt.savefig('sinus.png')  # Enregistrer le graphique
plt.show()

# Plusieurs courbes
plt.figure(figsize=(10, 6))
plt.plot(x, np.sin(x), 'b-', label='sin(x)')
plt.plot(x, np.cos(x), 'r--', label='cos(x)')  # 'r--' = ligne rouge pointillée
plt.title('Fonctions trigonométriques')
plt.xlabel('x')
plt.ylabel('y')
plt.legend()
plt.grid(True)
plt.show()

# Nuage de points (scatter plot)
n = 50
x = np.random.rand(n)
y = np.random.rand(n)
colors = np.random.rand(n)
sizes = 1000 * np.random.rand(n)

plt.figure(figsize=(10, 6))
plt.scatter(x, y, c=colors, s=sizes, alpha=0.5, cmap='viridis')
plt.colorbar()  # Ajoute une barre de couleur
plt.title('Nuage de points avec taille et couleur variables')
plt.xlabel('x')
plt.ylabel('y')
plt.grid(True)
plt.show()

# Histogramme
data = np.random.randn(1000)  # Distribution normale
plt.figure(figsize=(10, 6))
plt.hist(data, bins=30, alpha=0.7, color='skyblue', edgecolor='black')
plt.title('Histogramme')
plt.xlabel('Valeur')
plt.ylabel('Fréquence')
plt.grid(True)
plt.show()

# Diagramme à barres
categories = ['A', 'B', 'C', 'D', 'E']
values = [22, 35, 18, 41, 29]

plt.figure(figsize=(10, 6))
plt.bar(categories, values, color='seagreen')
plt.title('Diagramme à barres')
plt.xlabel('Catégorie')
plt.ylabel('Valeur')
plt.grid(True, axis='y')
plt.show()

# Subplots (plusieurs graphiques dans une figure)
fig, axs = plt.subplots(2, 2, figsize=(12, 10))  # Figure avec 2x2 sous-graphiques

# Graphique 1: Ligne
axs[0, 0].plot(x, np.sin(x))
axs[0, 0].set_title('Sinus')
axs[0, 0].grid(True)

# Graphique 2: Scatter
axs[0, 1].scatter(x, y, c=colors, s=sizes, alpha=0.5)
axs[0, 1].set_title('Nuage de points')

# Graphique 3: Histogramme
axs[1, 0].hist(data, bins=20, color='purple', alpha=0.7)
axs[1, 0].set_title('Histogramme')

# Graphique 4: Barres
axs[1, 1].bar(categories, values, color='orange')
axs[1, 1].set_title('Barres')

plt.tight_layout()  # Ajuste automatiquement les espaces
plt.show()`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Visualisations statistiques avec Seaborn</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np

# Configuration du style
sns.set_theme(style="whitegrid")  # Thème général
plt.figure(figsize=(10, 6))

# Dataset d'exemple
tips = sns.load_dataset("tips")  # Dataset de pourboires inclus dans Seaborn
print(tips.head())

# Diagramme de dispersion avec courbe de régression
plt.figure(figsize=(10, 6))
sns.regplot(x="total_bill", y="tip", data=tips)
plt.title("Relation entre l'addition et le pourboire")
plt.show()

# Diagramme de dispersion avec hue (couleur selon catégorie)
plt.figure(figsize=(10, 6))
sns.scatterplot(x="total_bill", y="tip", hue="sex", size="size", data=tips)
plt.title("Addition vs Pourboire par genre et taille du groupe")
plt.show()

# Diagramme de densité (distribution)
plt.figure(figsize=(10, 6))
sns.histplot(data=tips, x="total_bill", kde=True)
plt.title("Distribution des additions")
plt.show()

# Boxplot (boîte à moustaches)
plt.figure(figsize=(10, 6))
sns.boxplot(x="day", y="total_bill", data=tips)
plt.title("Distribution des additions par jour")
plt.show()

# Violin plot (combinaison boxplot et KDE)
plt.figure(figsize=(10, 6))
sns.violinplot(x="day", y="total_bill", hue="sex", data=tips, split=True)
plt.title("Distribution des additions par jour et genre")
plt.show()

# Pairplot (matrice de nuages de points)
plt.figure(figsize=(12, 10))
sns.pairplot(tips, hue="sex")
plt.suptitle("Pairplot des variables", y=1.02)
plt.show()

# Heatmap (matrice de corrélation)
plt.figure(figsize=(10, 8))
corr = tips[["total_bill", "tip", "size"]].corr()
sns.heatmap(corr, annot=True, cmap='coolwarm', linewidths=0.5)
plt.title("Matrice de corrélation")
plt.show()

# Categorical plot (catplot)
plt.figure(figsize=(12, 8))
g = sns.catplot(
    data=tips, kind="bar",
    x="day", y="total_bill", hue="sex",
    ci="sd", palette="dark", alpha=.6, height=6, aspect=1.5
)
g.set_axis_labels("Jour", "Addition moyenne")
g.legend.set_title("Genre")
plt.title("Addition moyenne par jour et genre")
plt.show()

# FacetGrid (grille de graphiques)
plt.figure(figsize=(12, 8))
g = sns.FacetGrid(tips, col="time", row="sex")
g.map_dataframe(sns.scatterplot, x="total_bill", y="tip")
g.add_legend()
plt.show()`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Scikit-learn: Machine Learning</h3>
        <p className="mb-3">Scikit-learn est la bibliothèque de référence pour le machine learning en Python. Elle propose des implémentations efficaces de nombreux algorithmes ainsi que des outils pour le prétraitement, l'évaluation et le déploiement de modèles.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Prétraitement des données</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`from sklearn import datasets
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler, OneHotEncoder
import numpy as np
import pandas as pd

# Charger un dataset d'exemple
iris = datasets.load_iris()
X = iris.data
y = iris.target

# Séparation en ensembles d'entraînement et de test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42
)

print("Taille de X_train:", X_train.shape)
print("Taille de X_test:", X_test.shape)

# Standardisation (moyenne=0, écart-type=1)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)  # Utiliser uniquement transform sur les données de test

print("Avant standardisation (premiers exemples):")
print(X_train[:2])
print("Après standardisation (premiers exemples):")
print(X_train_scaled[:2])

# Normalisation (mise à l'échelle entre 0 et 1)
min_max_scaler = MinMaxScaler()
X_train_normalized = min_max_scaler.fit_transform(X_train)

print("Après normalisation (premiers exemples):")
print(X_train_normalized[:2])

# Encodage one-hot pour variables catégorielles
# Exemple de données catégorielles
categorical_data = pd.DataFrame({
    'color': ['red', 'blue', 'green', 'red', 'green'],
    'size': ['small', 'medium', 'medium', 'large', 'small']
})

encoder = OneHotEncoder(sparse=False)
encoded_data = encoder.fit_transform(categorical_data)
encoded_df = pd.DataFrame(
    encoded_data,
    columns=encoder.get_feature_names_out(['color', 'size'])
)

print("Données catégorielles originales:")
print(categorical_data)
print("Données après encodage one-hot:")
print(encoded_df)`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Construction et évaluation de modèles</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import cross_val_score

# Continuer avec les données Iris prétraitées
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.25, random_state=42
)

# Entraîner différents modèles
models = {
    "Régression logistique": LogisticRegression(max_iter=200),
    "Arbre de décision": DecisionTreeClassifier(),
    "Forêt aléatoire": RandomForestClassifier(),
    "SVM": SVC(),
    "KNN": KNeighborsClassifier()
}

# Entraîner et évaluer chaque modèle
for name, model in models.items():
    # Entraîner le modèle
    model.fit(X_train, y_train)
    
    # Prédire sur l'ensemble de test
    y_pred = model.predict(X_test)
    
    # Évaluer les performances
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\\n{name}:")
    print(f"Précision: {accuracy:.4f}")
    
    # Rapport détaillé
    print("Rapport de classification:")
    print(classification_report(y_test, y_pred, target_names=iris.target_names))
    
    # Matrice de confusion
    cm = confusion_matrix(y_test, y_pred)
    print("Matrice de confusion:")
    print(cm)
    
    # Validation croisée (cross-validation)
    cv_scores = cross_val_score(model, iris.data, iris.target, cv=5)
    print(f"Scores de validation croisée: {cv_scores}")
    print(f"Moyenne des scores CV: {cv_scores.mean():.4f} (±{cv_scores.std():.4f})")`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Optimisation des hyperparamètres</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`from sklearn.model_selection import GridSearchCV, RandomizedSearchCV
from sklearn.ensemble import RandomForestClassifier
import numpy as np

# Continuer avec les données Iris
X, y = iris.data, iris.target

# Définir une grille de paramètres à tester
param_grid = {
    'n_estimators': [10, 50, 100, 200],
    'max_depth': [None, 10, 20, 30],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4]
}

# Instancier le modèle de base
rf = RandomForestClassifier(random_state=42)

# Recherche par grille
grid_search = GridSearchCV(
    estimator=rf,
    param_grid=param_grid,
    cv=5,  # 5-fold cross-validation
    scoring='accuracy',
    n_jobs=-1,  # Utiliser tous les cœurs disponibles
    verbose=1
)

# Exécuter la recherche
grid_search.fit(X, y)

# Afficher les meilleurs paramètres et score
print("Meilleurs paramètres trouvés:")
print(grid_search.best_params_)
print(f"Meilleur score de validation croisée: {grid_search.best_score_:.4f}")

# Évaluer le modèle optimisé
best_rf = grid_search.best_estimator_
cv_scores = cross_val_score(best_rf, X, y, cv=5)
print(f"Scores CV du modèle optimisé: {cv_scores.mean():.4f} (±{cv_scores.std():.4f})")

# Recherche aléatoire (plus rapide pour les grands espaces de paramètres)
# Définir des distributions pour les paramètres
param_distributions = {
    'n_estimators': np.arange(10, 200, 10),
    'max_depth': [None] + list(np.arange(5, 50, 5)),
    'min_samples_split': np.arange(2, 20, 2),
    'min_samples_leaf': np.arange(1, 10)
}

# Instancier la recherche aléatoire
random_search = RandomizedSearchCV(
    estimator=rf,
    param_distributions=param_distributions,
    n_iter=50,  # Nombre d'itérations
    cv=5,
    scoring='accuracy',
    n_jobs=-1,
    random_state=42,
    verbose=1
)

# Exécuter la recherche
random_search.fit(X, y)

# Afficher les meilleurs paramètres et score
print("Meilleurs paramètres (recherche aléatoire):")
print(random_search.best_params_)
print(f"Meilleur score: {random_search.best_score_:.4f}")`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Pipeline et traitement de bout en bout</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pandas as pd
import numpy as np

# Créer un ensemble de données synthétique avec valeurs manquantes et variables catégorielles
np.random.seed(42)
n_samples = 1000

# Variables numériques (avec valeurs manquantes)
age = np.random.normal(40, 10, n_samples)
age[np.random.choice(n_samples, 50, replace=False)] = np.nan  # Ajouter des NaN

income = np.random.normal(50000, 15000, n_samples)
income[np.random.choice(n_samples, 70, replace=False)] = np.nan

# Variables catégorielles
education = np.random.choice(['High School', 'Bachelor', 'Master', 'PhD'], n_samples)
marital_status = np.random.choice(['Single', 'Married', 'Divorced'], n_samples)

# Variable cible (classification binaire)
target = np.random.choice([0, 1], n_samples)

# Créer le DataFrame
data = pd.DataFrame({
    'age': age,
    'income': income,
    'education': education,
    'marital_status': marital_status,
    'target': target
})

print("Aperçu des données:")
print(data.head())
print("\\nStatistiques des données:")
print(data.describe())
print("\\nValeurs manquantes par colonne:")
print(data.isna().sum())

# Diviser en caractéristiques et cible
X = data.drop('target', axis=1)
y = data['target']

# Diviser en ensembles d'entraînement et de test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

# Définir les transformateurs pour différents types de colonnes
numeric_features = ['age', 'income']
categorical_features = ['education', 'marital_status']

# Préprocesseur numérique : Imputation puis standardisation
numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='mean')),
    ('scaler', StandardScaler())
])

# Préprocesseur catégoriel : Imputation puis encodage one-hot
categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

# Combinaison des préprocesseurs
preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_features),
        ('cat', categorical_transformer, categorical_features)
    ]
)

# Pipeline complet : prétraitement + modèle
full_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
])

# Entraîner le pipeline
full_pipeline.fit(X_train, y_train)

# Évaluer les performances
y_pred = full_pipeline.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\\nPrécision du modèle: {accuracy:.4f}")

# Prédiction sur de nouvelles données
new_data = pd.DataFrame({
    'age': [35, np.nan, 55],
    'income': [60000, 48000, np.nan],
    'education': ['Bachelor', 'PhD', 'High School'],
    'marital_status': ['Married', 'Single', 'Divorced']
})

predictions = full_pipeline.predict(new_data)
probabilities = full_pipeline.predict_proba(new_data)

print("\\nNouvelles données:")
print(new_data)
print("\\nPrédictions:")
print(predictions)
print("\\nProbabilités:")
print(probabilities)`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Sauvegarde et chargement de modèles</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn import datasets

# Charger les données
iris = datasets.load_iris()
X, y = iris.data, iris.target

# Créer et entraîner un modèle
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# Sauvegarder le modèle
joblib.dump(model, 'random_forest_model.joblib')
print("Modèle sauvegardé avec succès")

# Charger le modèle
loaded_model = joblib.load('random_forest_model.joblib')
print("Modèle chargé avec succès")

# Vérifier que le modèle chargé fonctionne
accuracy = loaded_model.score(X, y)
print(f"Précision du modèle chargé: {accuracy:.4f}")

# Sauvegarder un pipeline complet
joblib.dump(full_pipeline, 'full_pipeline.joblib')
print("Pipeline complet sauvegardé avec succès")

# Charger le pipeline
loaded_pipeline = joblib.load('full_pipeline.joblib')
print("Pipeline chargé avec succès")

# Faire des prédictions avec le pipeline chargé
new_predictions = loaded_pipeline.predict(new_data)
print("Prédictions avec le pipeline chargé:")
print(new_predictions)`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Exercices pratiques</h3>
        
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800 mb-6">
          <h4 className="font-semibold mb-3">Exercice 1: Analyse de données avec Pandas</h4>
          <p className="mb-2">Réalisez une analyse exploratoire complète sur un jeu de données.</p>
          
          <div className="mt-4 mb-2 font-semibold">Solution:</div>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Configuration des graphiques
plt.style.use('ggplot')
sns.set(style="whitegrid")

def analyser_dataset():
    """Analyse exploratoire complète d'un jeu de données."""
    
    # Charger le jeu de données (Titanic pour cet exemple)
    print("Chargement des données...")
    url = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"
    df = pd.read_csv(url)
    
    # 1. Aperçu général des données
    print("\\n1. APERÇU GÉNÉRAL DES DONNÉES")
    print("-" * 50)
    print("\\nDimensions du jeu de données:")
    print(f"Lignes: {df.shape[0]}, Colonnes: {df.shape[1]}")
    
    print("\\nPremières lignes:")
    print(df.head())
    
    print("\\nInformations sur les types de données:")
    print(df.info())
    
    print("\\nStatistiques descriptives:")
    print(df.describe())
    
    # 2. Analyse des valeurs manquantes
    print("\\n2. ANALYSE DES VALEURS MANQUANTES")
    print("-" * 50)
    
    missing = df.isnull().sum().sort_values(ascending=False)
    missing_percent = (df.isnull().sum() / df.shape[0] * 100).sort_values(ascending=False)
    missing_data = pd.concat([missing, missing_percent], axis=1, keys=['Total', 'Pourcentage'])
    
    print("\\nValeurs manquantes par colonne:")
    print(missing_data[missing_data['Total'] > 0])
    
    # Visualisation des valeurs manquantes
    plt.figure(figsize=(10, 6))
    plt.title('Pourcentage de valeurs manquantes par colonne')
    plt.bar(range(len(missing_percent[missing_percent > 0])), 
            missing_percent[missing_percent > 0].values,
            align='center')
    plt.xticks(range(len(missing_percent[missing_percent > 0])), 
               missing_percent[missing_percent > 0].index, rotation=90)
    plt.ylabel('Pourcentage')
    plt.tight_layout()
    plt.savefig('missing_values.png')
    
    # 3. Analyse des variables catégorielles
    print("\\n3. ANALYSE DES VARIABLES CATÉGORIELLES")
    print("-" * 50)
    
    categorical_cols = df.select_dtypes(include=['object']).columns
    print("\\nColonnes catégorielles:", list(categorical_cols))
    
    for col in categorical_cols:
        print(f"\\nDistribution de la colonne '{col}':")
        counts = df[col].value_counts()
        print(counts)
        print(f"Pourcentage:\\n{counts / len(df) * 100}")
        
        # Visualisation
        plt.figure(figsize=(8, 6))
        ax = sns.countplot(x=col, data=df)
        plt.title(f'Distribution de {col}')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(f'distribution_{col}.png')
    
    # 4. Analyse des variables numériques
    print("\\n4. ANALYSE DES VARIABLES NUMÉRIQUES")
    print("-" * 50)
    
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
    print("\\nColonnes numériques:", list(numeric_cols))
    
    # Histogrammes
    plt.figure(figsize=(15, 10))
    for i, col in enumerate(numeric_cols, 1):
        plt.subplot(3, 3, i)
        sns.histplot(df[col].dropna(), kde=True)
        plt.title(f'Distribution de {col}')
    plt.tight_layout()
    plt.savefig('numeric_distributions.png')
    
    # Corrélation entre variables numériques
    corr = df[numeric_cols].corr()
    
    plt.figure(figsize=(10, 8))
    sns.heatmap(corr, annot=True, cmap='coolwarm', linewidths=0.5)
    plt.title('Matrice de corrélation')
    plt.tight_layout()
    plt.savefig('correlation_matrix.png')
    
    # 5. Analyse bivariée avec la cible (ici 'Survived')
    if 'Survived' in df.columns:
        print("\\n5. ANALYSE BIVARIÉE AVEC LA VARIABLE CIBLE")
        print("-" * 50)
        
        target = 'Survived'
        
        # Variables catégorielles vs cible
        for col in categorical_cols:
            if col != target:
                plt.figure(figsize=(8, 6))
                sns.countplot(x=col, hue=target, data=df)
                plt.title(f'{col} vs {target}')
                plt.xticks(rotation=45)
                plt.tight_layout()
                plt.savefig(f'{col}_vs_{target}.png')
                
                # Taux de survie par catégorie
                survival_rate = df.groupby(col)[target].mean().sort_values(ascending=False)
                print(f"\\nTaux de survie par {col}:")
                print(survival_rate)
        
        # Variables numériques vs cible
        for col in numeric_cols:
            if col != target:
                plt.figure(figsize=(8, 6))
                sns.boxplot(x=target, y=col, data=df)
                plt.title(f'{col} vs {target}')
                plt.tight_layout()
                plt.savefig(f'{col}_vs_{target}_box.png')
                
                # Statistiques par groupe
                print(f"\\nStatistiques de {col} par groupe de {target}:")
                print(df.groupby(target)[col].describe())
    
    # 6. Conclusions et recommandations
    print("\\n6. CONCLUSIONS ET RECOMMANDATIONS")
    print("-" * 50)
    print("Observations principales:")
    print("1. Les colonnes 'Age', 'Cabin' et 'Embarked' contiennent des valeurs manquantes.")
    print("2. La survie semble être corrélée avec la classe (Pclass) et le sexe (Sex).")
    print("3. Les passagers plus jeunes et les femmes ont généralement des taux de survie plus élevés.")
    
    print("\\nRecommandations pour le prétraitement:")
    print("1. Imputer les valeurs manquantes de 'Age', potentiellement en utilisant la médiane par classe et sexe.")
    print("2. Créer une caractéristique 'CabinType' à partir de 'Cabin' ou indiquer simplement si la cabine est connue ou non.")
    print("3. Encoder les variables catégorielles (Sex, Embarked) pour la modélisation.")
    print("4. Considérer la création de nouvelles caractéristiques comme 'FamilySize' en combinant 'SibSp' et 'Parch'.")
    
    print("\\nAnalyse complète terminée. Les graphiques ont été sauvegardés dans le répertoire de travail.")
    return df

# Exécution de l'analyse
if __name__ == "__main__":
    df = analyser_dataset()`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800 mb-6">
          <h4 className="font-semibold mb-3">Exercice 2: Classification avec scikit-learn</h4>
          <p className="mb-2">Développez un modèle de classification complet pour prédire la survie des passagers du Titanic.</p>
          
          <div className="mt-4 mb-2 font-semibold">Solution:</div>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_curve, auc
import joblib

def titanic_model():
    """Construction et évaluation d'un modèle de classification pour le Titanic."""
    
    # 1. Chargement et préparation des données
    print("1. CHARGEMENT DES DONNÉES")
    print("-" * 50)
    
    url = "https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv"
    data = pd.read_csv(url)
    print(f"Données chargées: {data.shape[0]} lignes, {data.shape[1]} colonnes")
    
    # Affichage des premières lignes
    print("\\nAperçu des données:")
    print(data.head())
    
    # 2. Ingénierie des caractéristiques
    print("\\n2. INGÉNIERIE DES CARACTÉRISTIQUES")
    print("-" * 50)
    
    # Création de nouvelles caractéristiques
    data['FamilySize'] = data['SibSp'] + data['Parch'] + 1  # +1 pour inclure le passager
    data['IsAlone'] = (data['FamilySize'] == 1).astype(int)
    
    # Extraction du titre à partir du nom
    data['Title'] = data['Name'].str.extract(' ([A-Za-z]+)\\.', expand=False)
    
    # Simplification des titres
    title_mapping = {
        'Mr': 'Mr',
        'Miss': 'Miss',
        'Mrs': 'Mrs',
        'Master': 'Master',
        'Dr': 'Rare',
        'Rev': 'Rare',
        'Col': 'Rare',
        'Major': 'Rare',
        'Mlle': 'Miss',
        'Countess': 'Rare',
        'Ms': 'Miss',
        'Lady': 'Rare',
        'Jonkheer': 'Rare',
        'Don': 'Rare',
        'Dona': 'Rare',
        'Mme': 'Mrs',
        'Capt': 'Rare',
        'Sir': 'Rare'
    }
    data['Title'] = data['Title'].map(title_mapping)
    
    # Création d'une caractéristique indiquant si la cabine est connue
    data['HasCabin'] = data['Cabin'].notna().astype(int)
    
    print("Nouvelles caractéristiques ajoutées:")
    print("- FamilySize: taille de la famille")
    print("- IsAlone: si le passager voyage seul")
    print("- Title: titre extrait du nom")
    print("- HasCabin: si la cabine est connue")
    
    # 3. Sélection et préparation des caractéristiques
    print("\\n3. PRÉPARATION DES DONNÉES")
    print("-" * 50)
    
    # Sélection des caractéristiques
    features = ['Pclass', 'Sex', 'Age', 'Fare', 'Embarked', 'FamilySize', 'Title', 'HasCabin']
    
    # Division en caractéristiques et cible
    X = data[features]
    y = data['Survived']
    
    # Division en ensembles d'entraînement et de test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"Taille de l'ensemble d'entraînement: {X_train.shape[0]} échantillons")
    print(f"Taille de l'ensemble de test: {X_test.shape[0]} échantillons")
    
    # Identification des types de caractéristiques
    numeric_features = ['Age', 'Fare', 'FamilySize']
    categorical_features = ['Pclass', 'Sex', 'Embarked', 'Title', 'HasCabin']
    
    # 4. Construction du pipeline de prétraitement et du modèle
    print("\\n4. CONSTRUCTION DU PIPELINE ET MODÈLES")
    print("-" * 50)
    
    # Préprocesseurs
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])
    
    # Combinaison des préprocesseurs
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ]
    )
    
    # 5. Entraînement et évaluation de plusieurs modèles
    print("\\n5. ENTRAÎNEMENT ET ÉVALUATION DES MODÈLES")
    print("-" * 50)
    
    # Modèles à comparer
    models = {
        'Régression logistique': LogisticRegression(max_iter=1000, random_state=42),
        'Random Forest': RandomForestClassifier(random_state=42),
        'Gradient Boosting': GradientBoostingClassifier(random_state=42)
    }
    
    # Dictionnaires pour stocker les résultats
    cv_results = {}
    test_results = {}
    models_trained = {}
    
    # Entraînement et évaluation de chaque modèle
    for name, model in models.items():
        print(f"\\nEntraînement du modèle: {name}")
        
        # Création du pipeline
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('classifier', model)
        ])
        
        # Validation croisée
        cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring='accuracy')
        cv_results[name] = cv_scores
        
        # Entraînement sur l'ensemble complet
        pipeline.fit(X_train, y_train)
        models_trained[name] = pipeline
        
        # Évaluation sur l'ensemble de test
        y_pred = pipeline.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        test_results[name] = accuracy
        
        # Affichage des résultats
        print(f"Scores CV: {cv_scores.mean():.4f} (±{cv_scores.std():.4f})")
        print(f"Précision sur l'ensemble de test: {accuracy:.4f}")
        print("\\nRapport de classification:")
        print(classification_report(y_test, y_pred))
        
        # Matrice de confusion
        cm = confusion_matrix(y_test, y_pred)
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                    xticklabels=['Décédé', 'Survécu'],
                    yticklabels=['Décédé', 'Survécu'])
        plt.title(f'Matrice de confusion - {name}')
        plt.ylabel('Valeur réelle')
        plt.xlabel('Prédiction')
        plt.tight_layout()
        plt.savefig(f'confusion_matrix_{name.replace(" ", "_")}.png')
        
        # Courbe ROC
        if hasattr(pipeline, 'predict_proba'):
            y_proba = pipeline.predict_proba(X_test)[:, 1]
            fpr, tpr, _ = roc_curve(y_test, y_proba)
            roc_auc = auc(fpr, tpr)
            
            plt.figure(figsize=(8, 6))
            plt.plot(fpr, tpr, label=f'AUC = {roc_auc:.3f}')
            plt.plot([0, 1], [0, 1], 'k--')
            plt.xlabel('Taux de faux positifs')
            plt.ylabel('Taux de vrais positifs')
            plt.title(f'Courbe ROC - {name}')
            plt.legend(loc='lower right')
            plt.tight_layout()
            plt.savefig(f'roc_curve_{name.replace(" ", "_")}.png')
    
    # 6. Comparaison des modèles
    print("\\n6. COMPARAISON DES MODÈLES")
    print("-" * 50)
    
    # Comparaison des scores de validation croisée
    cv_means = {name: scores.mean() for name, scores in cv_results.items()}
    best_model = max(cv_means.items(), key=lambda x: x[1])[0]
    
    print(f"Modèle avec la meilleure validation croisée: {best_model} ({cv_means[best_model]:.4f})")
    print("\\nScores de validation croisée:")
    for name, scores in cv_results.items():
        print(f"{name}: {scores.mean():.4f} (±{scores.std():.4f})")
    
    print("\\nPrécisions sur l'ensemble de test:")
    for name, accuracy in test_results.items():
        print(f"{name}: {accuracy:.4f}")
    
    # 7. Optimisation du meilleur modèle
    print("\\n7. OPTIMISATION DU MEILLEUR MODÈLE")
    print("-" * 50)
    
    # Paramètres de grille pour l'optimisation
    if best_model == 'Régression logistique':
        param_grid = {
            'classifier__C': [0.01, 0.1, 1, 10, 100],
            'classifier__solver': ['liblinear', 'lbfgs'],
            'classifier__penalty': ['l2']
        }
    elif best_model == 'Random Forest':
        param_grid = {
            'classifier__n_estimators': [50, 100, 200],
            'classifier__max_depth': [None, 5, 10, 15],
            'classifier__min_samples_split': [2, 5, 10]
        }
    elif best_model == 'Gradient Boosting':
        param_grid = {
            'classifier__n_estimators': [50, 100, 200],
            'classifier__learning_rate': [0.01, 0.1, 0.2],
            'classifier__max_depth': [3, 5, 7]
        }
    
    print(f"Optimisation des hyperparamètres pour {best_model}...")
    
    # Recherche par grille pour le meilleur modèle
    grid_search = GridSearchCV(
        models_trained[best_model],
        param_grid,
        cv=5,
        scoring='accuracy',
        n_jobs=-1
    )
    
    grid_search.fit(X_train, y_train)
    
    # Affichage des résultats
    print(f"Meilleurs paramètres: {grid_search.best_params_}")
    print(f"Meilleur score CV: {grid_search.best_score_:.4f}")
    
    # Évaluation du modèle optimisé
    optimized_model = grid_search.best_estimator_
    y_pred_opt = optimized_model.predict(X_test)
    accuracy_opt = accuracy_score(y_test, y_pred_opt)
    
    print(f"Précision du modèle optimisé sur l'ensemble de test: {accuracy_opt:.4f}")
    print("\\nRapport de classification:")
    print(classification_report(y_test, y_pred_opt))
    
    # 8. Sauvegarde du modèle final
    print("\\n8. SAUVEGARDE DU MODÈLE FINAL")
    print("-" * 50)
    
    # Sauvegarde du modèle optimisé
    joblib.dump(optimized_model, 'titanic_survival_model.joblib')
    print("Modèle sauvegardé sous 'titanic_survival_model.joblib'")
    
    # 9. Exemple de prédiction
    print("\\n9. EXEMPLE DE PRÉDICTION")
    print("-" * 50)
    
    # Création d'exemples de passagers
    exemple_passagers = pd.DataFrame({
        'Pclass': [1, 3, 2],
        'Sex': ['female', 'male', 'female'],
        'Age': [29, 45, 8],
        'Fare': [100, 8, 20],
        'Embarked': ['C', 'S', 'S'],
        'FamilySize': [2, 1, 4],
        'Title': ['Mrs', 'Mr', 'Miss'],
        'HasCabin': [1, 0, 0]
    })
    
    # Prédiction
    predictions = optimized_model.predict(exemple_passagers)
    probabilities = optimized_model.predict_proba(exemple_passagers)[:, 1]
    
    # Affichage des résultats
    exemple_passagers['Prediction'] = predictions
    exemple_passagers['Probabilité'] = probabilities
    
    print("Exemples de prédictions:")
    print(exemple_passagers[['Pclass', 'Sex', 'Age', 'Title', 'Prediction', 'Probabilité']])
    
    print("\\nAnalyse terminée. Les graphiques ont été sauvegardés dans le répertoire courant.")
    return optimized_model, exemple_passagers

# Exécution de l'analyse
if __name__ == "__main__":
    model, examples = titanic_model()`}
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

export default ModulesDataScience;