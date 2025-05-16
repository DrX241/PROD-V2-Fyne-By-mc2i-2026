/**
 * Service pour stocker et récupérer le contenu des cours pour la DATA & IA ACADEMY
 * Ce service fournit des cours préenregistrés au lieu de générer du contenu à la volée
 */

// Interface décrivant la structure d'un cours
export interface Course {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  description: string;
  content: string;
  sections: CourseSection[];
  exercises: CourseExercise[];
  resources: CourseResource[];
}

// Structure d'une section de cours
export interface CourseSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'code' | 'video' | 'interactive';
  codeLanguage?: string;
  videoUrl?: string;
}

// Structure d'un exercice de cours
export interface CourseExercise {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'coding' | 'project';
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  content: string;
  solution?: string;
}

// Structure d'une ressource de cours
export interface CourseResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'book' | 'tool';
  url: string;
  description: string;
}

// Exemple de cours sur Python pour débutants
const pythonBasicsCourse: Course = {
  id: 'python-basics',
  title: 'Fondamentaux Python',
  difficulty: 'débutant',
  category: 'languages',
  description: 'Maîtrisez les bases de Python pour l\'analyse de données et le machine learning',
  content: `
# Fondamentaux Python pour la Data Science

## Introduction

Python est devenu le langage de prédilection pour la Data Science et l'Intelligence Artificielle grâce à sa simplicité, sa lisibilité et son vaste écosystème de bibliothèques spécialisées. Ce cours vous guidera à travers les concepts fondamentaux de Python en mettant l'accent sur leur application dans le contexte de l'analyse de données.

Que vous soyez consultant chez mc2i travaillant sur des projets DIXIT (Direction Data & IA) ou que vous cherchiez à développer vos compétences en programmation pour l'analyse de données, ce cours vous fournira les bases essentielles pour réussir.

## Pourquoi Python pour la Data Science?

- **Syntaxe claire et accessible** : Python est conçu pour être lisible et intuitif
- **Écosystème riche** : NumPy, Pandas, Matplotlib, scikit-learn forment un arsenal complet
- **Communauté active** : Documentation abondante et support de la communauté
- **Polyvalence** : Du nettoyage de données au deep learning, Python couvre tout le spectre
  `,
  sections: [
    {
      id: 'python-basics-section-1',
      title: 'Variables et types de données',
      type: 'text',
      content: `
## Variables et types de données

En Python, vous n'avez pas besoin de déclarer explicitement le type d'une variable. Le type est déterminé automatiquement lors de l'assignation.

### Types de données fondamentaux:

- **Entiers (int)**: Nombres sans décimales
- **Flottants (float)**: Nombres avec décimales
- **Chaînes de caractères (str)**: Texte entre guillemets
- **Booléens (bool)**: True ou False

#### Exemples:
      `
    },
    {
      id: 'python-basics-section-2',
      title: 'Exemple de variables et types',
      type: 'code',
      codeLanguage: 'python',
      content: `
# Entiers
age = 30
population = 67000000

# Flottants
pi = 3.14159
temperature = 22.5

# Chaînes de caractères
nom = "Alice"
message = 'Bonjour, Data Scientist!'

# Booléens
est_actif = True
donnees_completes = False

# Vérification des types
print(type(age))        # <class 'int'>
print(type(pi))         # <class 'float'>
print(type(nom))        # <class 'str'>
print(type(est_actif))  # <class 'bool'>
      `
    },
    {
      id: 'python-basics-section-3',
      title: 'Structures de données',
      type: 'text',
      content: `
## Structures de données

Python offre plusieurs structures de données intégrées qui sont essentielles pour la manipulation de données:

### Listes
Les listes sont ordonnées, modifiables et peuvent contenir des éléments de différents types.

### Tuples
Les tuples sont ordonnés, immuables (non modifiables après création) et peuvent contenir des éléments de différents types.

### Dictionnaires
Les dictionnaires stockent des paires clé-valeur et sont particulièrement utiles pour représenter des données structurées.

### Ensembles (Sets)
Les ensembles sont non ordonnés, sans doublons, et sont utiles pour les opérations mathématiques comme l'union et l'intersection.
      `
    },
    {
      id: 'python-basics-section-4',
      title: 'Exemples de structures de données',
      type: 'code',
      codeLanguage: 'python',
      content: `
# Liste (ordonnée, modifiable)
villes = ['Paris', 'Lyon', 'Marseille', 'Bordeaux']
print(villes[0])  # Paris
villes.append('Lille')
print(villes)  # ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille']

# Tuple (ordonné, immuable)
coordinates = (48.8566, 2.3522)  # Latitude et longitude de Paris
print(coordinates[0])  # 48.8566
# coordinates[0] = 49.0  # Erreur! Les tuples sont immuables

# Dictionnaire (paires clé-valeur)
personne = {
    'nom': 'Dupont',
    'prenom': 'Jean',
    'age': 42,
    'ville': 'Paris'
}
print(personne['nom'])  # Dupont
personne['email'] = 'jean.dupont@example.com'  # Ajout d'une nouvelle clé-valeur

# Ensemble (non ordonné, sans doublons)
couleurs = {'rouge', 'bleu', 'vert', 'bleu'}  # Notez le doublon 'bleu'
print(couleurs)  # {'rouge', 'vert', 'bleu'} - le doublon est automatiquement supprimé
      `
    },
    {
      id: 'python-basics-section-5',
      title: 'Structures de contrôle',
      type: 'text',
      content: `
## Structures de contrôle

Les structures de contrôle permettent de diriger le flux d'exécution d'un programme. Les principales structures en Python sont:

### Conditionnels (if, elif, else)
Permettent d'exécuter du code en fonction de conditions spécifiques.

### Boucles 
- **for**: Pour itérer sur une séquence (liste, tuple, dictionnaire, etc.)
- **while**: Pour exécuter un bloc de code tant qu'une condition est vraie

Ces structures sont essentielles pour l'analyse de données, où vous devez souvent effectuer des opérations conditionnelles ou itératives sur vos données.
      `
    },
    {
      id: 'python-basics-section-6',
      title: 'Exemples de structures de contrôle',
      type: 'code',
      codeLanguage: 'python',
      content: `
# Conditions if-elif-else
age = 25
if age < 18:
    categorie = "mineur"
elif age >= 18 and age < 65:
    categorie = "adulte"
else:
    categorie = "senior"
print(f"Catégorie: {categorie}")  # Catégorie: adulte

# Boucle for avec une liste
villes = ['Paris', 'Lyon', 'Marseille']
for ville in villes:
    print(f"Traitement des données pour {ville}")

# Boucle for avec un dictionnaire
personne = {'nom': 'Dupont', 'prenom': 'Jean', 'age': 42}
for cle, valeur in personne.items():
    print(f"{cle}: {valeur}")

# Boucle while
compteur = 0
while compteur < 5:
    print(f"Compteur: {compteur}")
    compteur += 1
      `
    },
    {
      id: 'python-basics-section-7',
      title: 'Fonctions',
      type: 'text',
      content: `
## Fonctions

Les fonctions sont des blocs de code réutilisables qui effectuent une tâche spécifique. Elles sont essentielles pour organiser votre code et éviter les répétitions.

### Définition d'une fonction

En Python, vous définissez une fonction avec le mot-clé \`def\`, suivi du nom de la fonction et de ses paramètres entre parenthèses.

### Paramètres et valeurs de retour

- Les fonctions peuvent accepter des paramètres (entrées)
- Elles peuvent renvoyer des valeurs avec \`return\`
- Les paramètres peuvent avoir des valeurs par défaut

Dans le contexte de la Data Science, les fonctions vous permettent d'encapsuler des opérations de transformation de données, des calculs statistiques, ou des étapes de prétraitement que vous utiliserez fréquemment.
      `
    },
    {
      id: 'python-basics-section-8',
      title: 'Exemples de fonctions',
      type: 'code',
      codeLanguage: 'python',
      content: `
# Fonction simple sans paramètres
def saluer():
    print("Bonjour, Data Scientist!")

saluer()  # Appel de la fonction

# Fonction avec paramètres
def calculer_moyenne(nombres):
    if not nombres:
        return 0
    return sum(nombres) / len(nombres)

notes = [15, 18, 12, 10, 14]
moyenne = calculer_moyenne(notes)
print(f"Moyenne: {moyenne}")  # Moyenne: 13.8

# Fonction avec paramètres par défaut
def analyser_donnees(donnees, normaliser=False, filtrer_outliers=False):
    resultat = donnees.copy()
    
    if filtrer_outliers:
        # Code pour filtrer les valeurs aberrantes
        print("Filtrage des outliers...")
    
    if normaliser:
        # Code pour normaliser les données
        print("Normalisation des données...")
    
    return resultat

donnees_brutes = [12, 15, 67, 14, 16, 15, 13]
donnees_traitees = analyser_donnees(donnees_brutes, normaliser=True)
      `
    },
    {
      id: 'python-basics-section-9',
      title: 'Modules et bibliothèques',
      type: 'text',
      content: `
## Modules et bibliothèques

L'une des forces de Python pour la Data Science est son vaste écosystème de bibliothèques spécialisées. Les modules sont des fichiers Python contenant du code réutilisable, et les bibliothèques sont des collections de modules.

### Bibliothèques essentielles pour la Data Science:

1. **NumPy**: Calcul numérique et manipulation de tableaux multidimensionnels
2. **Pandas**: Manipulation et analyse de données structurées
3. **Matplotlib** et **Seaborn**: Visualisation de données
4. **Scikit-learn**: Apprentissage automatique

Pour utiliser ces bibliothèques, vous devez d'abord les importer dans votre script Python.
      `
    },
    {
      id: 'python-basics-section-10',
      title: 'Exemples d\'utilisation de bibliothèques',
      type: 'code',
      codeLanguage: 'python',
      content: `
# Importer des bibliothèques
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Utilisation de NumPy pour créer et manipuler des tableaux
tableau = np.array([1, 2, 3, 4, 5])
print(tableau.mean())  # 3.0
print(np.sqrt(tableau))  # [1. 1.41421356 1.73205081 2. 2.23606798]

# Utilisation de Pandas pour manipuler des données structurées
donnees = {
    'Nom': ['Alice', 'Bob', 'Charlie', 'David'],
    'Âge': [25, 30, 35, 40],
    'Ville': ['Paris', 'Lyon', 'Marseille', 'Bordeaux']
}
df = pd.DataFrame(donnees)
print(df.head())

# Statistiques descriptives avec Pandas
print(df.describe())

# Visualisation simple avec Matplotlib
plt.figure(figsize=(8, 4))
plt.bar(df['Nom'], df['Âge'])
plt.title('Âge par personne')
plt.xlabel('Nom')
plt.ylabel('Âge')
plt.savefig('age_graph.png')  # Sauvegarde le graphique
# plt.show()  # Affiche le graphique (à utiliser dans un environnement interactif)
      `
    },
    {
      id: 'python-basics-section-11',
      title: 'Étude de cas : Analyse de données',
      type: 'text',
      content: `
## Étude de cas : Analyse de données

Pour illustrer l'utilisation de Python dans un contexte de Data Science, voici une étude de cas simplifiée d'analyse de données énergétiques pour un client du secteur de l'énergie.

### Contexte

Vous êtes consultant data chez mc2i et travaillez sur un projet DIXIT pour un grand fournisseur d'énergie. Votre mission est d'analyser les données de consommation électrique pour identifier des patterns et proposer des optimisations.

### Objectifs

1. Charger et nettoyer les données
2. Réaliser une analyse descriptive
3. Visualiser les tendances de consommation
4. Identifier les facteurs influençant la consommation

L'exemple de code suivant montre comment vous pourriez aborder cette analyse avec Python.
      `
    },
    {
      id: 'python-basics-section-12',
      title: 'Étude de cas : Code d\'analyse',
      type: 'code',
      codeLanguage: 'python',
      content: `
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# 1. Chargement des données (simulation)
# Dans un cas réel, vous utiliseriez pd.read_csv() ou pd.read_excel()
np.random.seed(42)  # Pour la reproductibilité
dates = pd.date_range(start='2023-01-01', end='2023-12-31', freq='D')
consommation = np.random.normal(loc=1000, scale=200, size=len(dates))
temperature = np.random.normal(loc=15, scale=8, size=len(dates))
temperature = np.sin(np.linspace(0, 2*np.pi, len(dates))) * 15 + 15  # Simulation saisonnière

# Création du DataFrame
data = pd.DataFrame({
    'Date': dates,
    'Consommation_kWh': consommation,
    'Temperature_C': temperature
})

# Ajout d'informations temporelles
data['Mois'] = data['Date'].dt.month
data['Jour_semaine'] = data['Date'].dt.dayofweek  # 0=Lundi, 6=Dimanche
data['Weekend'] = data['Jour_semaine'].apply(lambda x: 1 if x >= 5 else 0)

# 2. Nettoyage des données
# Détection et traitement des valeurs aberrantes
Q1 = data['Consommation_kWh'].quantile(0.25)
Q3 = data['Consommation_kWh'].quantile(0.75)
IQR = Q3 - Q1
lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

# Remplacement des valeurs aberrantes par des NaN puis interpolation
data.loc[data['Consommation_kWh'] < lower_bound, 'Consommation_kWh'] = np.nan
data.loc[data['Consommation_kWh'] > upper_bound, 'Consommation_kWh'] = np.nan
data['Consommation_kWh'] = data['Consommation_kWh'].interpolate()

# 3. Analyse descriptive
print("Statistiques descriptives de la consommation d'énergie:")
print(data['Consommation_kWh'].describe())

# Consommation moyenne par mois
conso_mensuelle = data.groupby('Mois')['Consommation_kWh'].mean()
print("\nConsommation moyenne par mois:")
print(conso_mensuelle)

# 4. Visualisations
# Tendance de consommation sur l'année
plt.figure(figsize=(12, 6))
plt.plot(data['Date'], data['Consommation_kWh'], color='blue', alpha=0.7)
plt.title('Consommation électrique journalière (2023)')
plt.xlabel('Date')
plt.ylabel('Consommation (kWh)')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('conso_annuelle.png')

# Relation entre température et consommation
plt.figure(figsize=(10, 6))
plt.scatter(data['Temperature_C'], data['Consommation_kWh'], alpha=0.5)
plt.title('Relation entre température et consommation électrique')
plt.xlabel('Température (°C)')
plt.ylabel('Consommation (kWh)')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('temperature_vs_conso.png')

# 5. Analyse des corrélations
correlation = data['Temperature_C'].corr(data['Consommation_kWh'])
print(f"\nCorrélation entre température et consommation: {correlation:.2f}")

# Comparaison weekend vs semaine
conso_par_type_jour = data.groupby('Weekend')['Consommation_kWh'].mean()
print("\nConsommation moyenne par type de jour:")
print(f"Semaine: {conso_par_type_jour[0]:.2f} kWh")
print(f"Weekend: {conso_par_type_jour[1]:.2f} kWh")

# 6. Conclusion
print("\nConclusion de l'analyse:")
print("- Les données montrent une tendance saisonnière dans la consommation")
print(f"- La température a un impact {'positif' if correlation > 0 else 'négatif'} sur la consommation")
print(f"- La consommation est {'plus élevée' if conso_par_type_jour[0] > conso_par_type_jour[1] else 'plus basse'} en semaine que le weekend")
      `
    },
    {
      id: 'python-basics-section-13',
      title: 'Conclusion',
      type: 'text',
      content: `
## Conclusion

Ce cours vous a présenté les fondamentaux de Python pour la Data Science, couvrant:

- Les types de données et variables de base
- Les structures de données (listes, tuples, dictionnaires, ensembles)
- Les structures de contrôle (conditionnels et boucles)
- Les fonctions et leur utilisation
- L'écosystème des bibliothèques Data Science
- Une étude de cas d'analyse de données

Ces connaissances constituent la base sur laquelle vous pourrez construire vos compétences en analyse de données et en machine learning. La pratique régulière est la clé pour maîtriser Python pour la Data Science.

### Prochaines étapes

1. Approfondissez votre connaissance des bibliothèques NumPy et Pandas
2. Explorez des techniques de visualisation avancées avec Matplotlib et Seaborn
3. Initiez-vous au machine learning avec scikit-learn
4. Pratiquez sur des datasets réels pour consolider vos compétences

Bon apprentissage !
      `
    },
  ],
  exercises: [
    {
      id: 'python-basics-exercise-1',
      title: 'Manipulation de données',
      description: 'Exercice pratique sur la manipulation de listes et dictionnaires',
      type: 'coding',
      difficulty: 'débutant',
      content: `
### Exercice: Manipulation de données
  
Vous travaillez sur un projet d'analyse de données pour une entreprise du secteur de l'énergie. 
Vous disposez d'une liste de relevés de consommation électrique par jour pour une semaine.

1. Créez une liste appelée \`consommation_journaliere\` contenant 7 valeurs numériques (une par jour)
2. Calculez la consommation moyenne journalière
3. Identifiez le jour avec la consommation maximale et minimale
4. Créez un dictionnaire associant chaque jour de la semaine à sa consommation
5. Ajoutez une clé "moyenne" à ce dictionnaire avec la valeur calculée précédemment

Utilisez les noms de jours suivants: "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"
      `,
      solution: `
# Solution

# 1. Création de la liste de consommation
consommation_journaliere = [120, 105, 130, 125, 145, 90, 80]

# 2. Calcul de la moyenne
moyenne = sum(consommation_journaliere) / len(consommation_journaliere)
print(f"Consommation moyenne: {moyenne:.2f} kWh")

# 3. Identification des jours min et max
max_consommation = max(consommation_journaliere)
min_consommation = min(consommation_journaliere)
jour_max = consommation_journaliere.index(max_consommation)
jour_min = consommation_journaliere.index(min_consommation)

jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
print(f"Jour de consommation maximale: {jours[jour_max]} ({max_consommation} kWh)")
print(f"Jour de consommation minimale: {jours[jour_min]} ({min_consommation} kWh)")

# 4. Création du dictionnaire
consommation_par_jour = {}
for i, jour in enumerate(jours):
    consommation_par_jour[jour] = consommation_journaliere[i]

print("Consommation par jour:")
for jour, conso in consommation_par_jour.items():
    print(f"{jour}: {conso} kWh")

# 5. Ajout de la moyenne au dictionnaire
consommation_par_jour["moyenne"] = moyenne
print(f"Dictionnaire final: {consommation_par_jour}")
      `
    },
    {
      id: 'python-basics-exercise-2',
      title: 'Analyse de données avec Pandas',
      description: 'Manipuler un DataFrame Pandas pour extraire des insights',
      type: 'coding',
      difficulty: 'intermédiaire',
      content: `
### Exercice: Analyse de données avec Pandas

Vous êtes consultant chez mc2i et devez analyser un jeu de données sur les ventes trimestrielles 
d'une entreprise. Utilisez Pandas pour:

1. Créer un DataFrame avec les colonnes suivantes:
   - 'trimestre': ['T1', 'T2', 'T3', 'T4']
   - 'ventes': [45000, 52000, 38000, 69000]
   - 'objectif': [42000, 50000, 45000, 60000]

2. Ajoutez une colonne 'performance' qui contient le pourcentage de réalisation de l'objectif
   (ventes / objectif * 100)

3. Ajoutez une colonne 'statut' qui contient:
   - 'Dépassé' si les ventes sont supérieures à l'objectif
   - 'Atteint' si les ventes sont égales à l'objectif (à 1% près)
   - 'Non atteint' sinon

4. Calculez:
   - La somme totale des ventes
   - La moyenne des performances
   - Le trimestre avec la meilleure performance

5. Affichez un résumé des résultats
      `,
      solution: `
# Solution
import pandas as pd

# 1. Création du DataFrame
data = {
    'trimestre': ['T1', 'T2', 'T3', 'T4'],
    'ventes': [45000, 52000, 38000, 69000],
    'objectif': [42000, 50000, 45000, 60000]
}
df = pd.DataFrame(data)
print("DataFrame initial:")
print(df)

# 2. Ajout de la colonne performance
df['performance'] = (df['ventes'] / df['objectif'] * 100).round(2)
print("\nDataFrame avec performances:")
print(df)

# 3. Ajout de la colonne statut
def determiner_statut(row):
    ratio = row['ventes'] / row['objectif']
    if ratio > 1.01:
        return 'Dépassé'
    elif 0.99 <= ratio <= 1.01:
        return 'Atteint'
    else:
        return 'Non atteint'

df['statut'] = df.apply(determiner_statut, axis=1)
print("\nDataFrame avec statut:")
print(df)

# 4. Calculs demandés
ventes_totales = df['ventes'].sum()
performance_moyenne = df['performance'].mean()
meilleur_trimestre = df.loc[df['performance'].idxmax(), 'trimestre']
meilleure_performance = df['performance'].max()

# 5. Affichage du résumé
print("\nRésumé des résultats:")
print(f"Ventes totales: {ventes_totales} €")
print(f"Performance moyenne: {performance_moyenne:.2f}%")
print(f"Meilleur trimestre: {meilleur_trimestre} avec une performance de {meilleure_performance:.2f}%")

# Nombre de trimestres par statut
statut_count = df['statut'].value_counts()
print("\nRépartition des trimestres par statut:")
for statut, count in statut_count.items():
    print(f"{statut}: {count} trimestre(s)")
      `
    },
    {
      id: 'python-basics-exercise-3',
      title: 'Quiz Python pour la Data Science',
      description: 'Testez vos connaissances sur les fondamentaux Python',
      type: 'quiz',
      difficulty: 'débutant',
      content: `
### Quiz: Python pour la Data Science

1. Quelle bibliothèque Python est principalement utilisée pour la manipulation de tableaux numériques multidimensionnels?
   a) Pandas
   b) NumPy
   c) Matplotlib
   d) Scikit-learn

2. Quelle méthode utilise-t-on pour ajouter un élément à la fin d'une liste en Python?
   a) list.add()
   b) list.insert()
   c) list.append()
   d) list.push()

3. Comment accède-t-on à la valeur associée à la clé "nom" dans un dictionnaire appelé "personne"?
   a) personne.nom
   b) personne["nom"]
   c) personne.get("nom")
   d) Les réponses b et c sont correctes

4. Quelle structure de données en Python est la plus adaptée pour stocker des coordonnées géographiques (latitude, longitude) qui ne doivent pas être modifiées?
   a) Liste
   b) Dictionnaire
   c) Tuple
   d) Ensemble (set)

5. Quelle bibliothèque est principalement utilisée pour la visualisation de données en Python?
   a) NumPy
   b) Pandas
   c) Matplotlib
   d) SciPy
      `,
      solution: `
Réponses:
1. b) NumPy - C'est la bibliothèque fondamentale pour le calcul scientifique en Python, particulièrement adaptée aux tableaux multidimensionnels.
2. c) list.append() - Cette méthode ajoute un élément à la fin d'une liste.
3. d) Les réponses b et c sont correctes - On peut accéder aux valeurs d'un dictionnaire soit avec la notation crochet personne["nom"], soit avec la méthode get() qui permet de spécifier une valeur par défaut.
4. c) Tuple - Les tuples sont immuables (non modifiables) et parfaits pour stocker des paires de valeurs fixes comme des coordonnées.
5. c) Matplotlib - C'est la bibliothèque standard pour créer des visualisations statiques, interactives et animées en Python.
      `
    }
  ],
  resources: [
    {
      id: 'python-basics-resource-1',
      title: 'Documentation officielle Python',
      type: 'article',
      url: 'https://docs.python.org/fr/3/',
      description: 'La documentation officielle de Python en français, une référence complète'
    },
    {
      id: 'python-basics-resource-2',
      title: 'NumPy pour la Data Science',
      type: 'article',
      url: 'https://numpy.org/doc/stable/user/absolute_beginners.html',
      description: 'Guide NumPy pour débutants, parfait pour commencer avec les tableaux multidimensionnels'
    },
    {
      id: 'python-basics-resource-3',
      title: 'Guide utilisateur de Pandas',
      type: 'article',
      url: 'https://pandas.pydata.org/pandas-docs/stable/user_guide/index.html',
      description: 'Guide complet pour la manipulation de données avec Pandas'
    },
    {
      id: 'python-basics-resource-4',
      title: 'DataCamp - Introduction à Python',
      type: 'video',
      url: 'https://www.datacamp.com/courses/intro-to-python-for-data-science',
      description: 'Cours interactif pour apprendre Python pour la Data Science'
    }
  ]
};

// Exemple de cours SQL pour débutants
const sqlFundamentalsCourse: Course = {
  id: 'sql-fundamentals',
  title: 'SQL Fondamentaux',
  difficulty: 'débutant',
  category: 'languages',
  description: 'Interrogez vos bases de données efficacement avec SQL',
  content: `
# SQL Fondamentaux pour l'Analyse de Données

## Introduction

Le langage SQL (Structured Query Language) est essentiel pour tout professionnel travaillant avec des données. En tant que langage standardisé pour interagir avec les bases de données relationnelles, SQL vous permet d'extraire, transformer et analyser des données stockées dans des systèmes de gestion de bases de données comme PostgreSQL, MySQL, SQL Server ou Oracle.

Ce cours vous fournira les bases solides nécessaires pour écrire des requêtes SQL efficaces, particulièrement dans le contexte de l'analyse de données. Les compétences acquises seront directement applicables dans les projets DIXIT (Direction Data & IA) chez mc2i, où l'exploitation des données est au cœur de nombreuses missions.

## Pourquoi SQL est essentiel pour la Data Science?

- **Accès universel aux données** : La majorité des données d'entreprise sont stockées dans des bases de données relationnelles
- **Traitement efficace** : Les opérations sur les données sont exécutées au niveau de la base de données, ce qui est généralement plus performant
- **Langage déclaratif** : Vous spécifiez ce que vous voulez, pas comment l'obtenir
- **Standard industriel** : Compétence fondamentale recherchée dans tous les rôles liés aux données
  `,
  sections: [
    {
      id: 'sql-fundamentals-section-1',
      title: 'Introduction aux bases de données relationnelles',
      type: 'text',
      content: `
## Introduction aux bases de données relationnelles

Les bases de données relationnelles organisent les données en tables (ou relations) composées de lignes et de colonnes. Cette structure permet de modéliser efficacement les relations entre différentes entités de données.

### Concepts clés:

- **Table**: Collection de données organisées en lignes et colonnes (ex: "clients", "commandes")
- **Colonne**: Attribut spécifique dans une table (ex: "nom", "email", "date_naissance")
- **Ligne**: Un enregistrement individuel dans une table
- **Clé primaire**: Identifiant unique pour chaque ligne d'une table
- **Clé étrangère**: Référence à la clé primaire d'une autre table, établissant une relation

### Exemple de structure relationnelle:

Imaginez un système de gestion des ventes avec trois tables principales:
- **clients**: Stocke les informations sur les clients
- **produits**: Contient les détails des produits disponibles
- **commandes**: Enregistre les transactions, avec des références aux clients et aux produits
      `
    },
    {
      id: 'sql-fundamentals-section-2',
      title: 'Bases des requêtes SQL',
      type: 'text',
      content: `
## Bases des requêtes SQL

SQL utilise une syntaxe relativement simple et intuitive pour interroger les bases de données. La structure de base d'une requête SELECT suit ce modèle:

\`\`\`sql
SELECT colonnes
FROM table
WHERE condition
ORDER BY colonne
\`\`\`

### Principales clauses SQL:

- **SELECT**: Spécifie les colonnes à récupérer
- **FROM**: Indique la ou les tables sources
- **WHERE**: Filtre les lignes selon des conditions
- **GROUP BY**: Regroupe les résultats par valeurs de colonnes
- **HAVING**: Filtre les groupes (similaire à WHERE mais pour les groupes)
- **ORDER BY**: Trie les résultats

### Opérateurs de comparaison:

- Égalité: =
- Inégalité: <>, !=
- Plus grand/petit que: >, <, >=, <=
- Appartenance à une liste: IN
- Correspondance de motif: LIKE
- Vérification de NULL: IS NULL, IS NOT NULL
      `
    },
    {
      id: 'sql-fundamentals-section-3',
      title: 'Requêtes SELECT simples',
      type: 'code',
      codeLanguage: 'sql',
      content: `
-- Sélectionner toutes les colonnes de la table clients
SELECT * FROM clients;

-- Sélectionner des colonnes spécifiques
SELECT id, nom, email FROM clients;

-- Utiliser des alias pour renommer les colonnes dans les résultats
SELECT 
    id AS client_id,
    nom AS nom_client,
    email AS adresse_email
FROM clients;

-- Filtrer les résultats avec WHERE
SELECT * FROM clients
WHERE ville = 'Paris';

-- Combiner plusieurs conditions
SELECT * FROM clients
WHERE ville = 'Paris' AND date_inscription >= '2023-01-01';

-- Utiliser l'opérateur IN pour une liste de valeurs
SELECT * FROM clients
WHERE ville IN ('Paris', 'Lyon', 'Marseille');

-- Recherche avec LIKE (% = n'importe quel nombre de caractères)
SELECT * FROM clients
WHERE email LIKE '%@gmail.com';

-- Trier les résultats
SELECT * FROM clients
ORDER BY nom ASC;  -- ASC = ascendant (par défaut), DESC = descendant

-- Limiter le nombre de résultats
SELECT * FROM clients
ORDER BY date_inscription DESC
LIMIT 10;  -- Récupère seulement les 10 clients les plus récents
      `
    },
    {
      id: 'sql-fundamentals-section-4',
      title: 'Fonctions d\'agrégation et GROUP BY',
      type: 'text',
      content: `
## Fonctions d'agrégation et GROUP BY

Les fonctions d'agrégation permettent d'effectuer des calculs sur des ensembles de lignes pour produire une valeur unique. Combinées avec GROUP BY, elles permettent de réaliser des analyses statistiques puissantes.

### Principales fonctions d'agrégation:

- **COUNT()**: Compte le nombre de lignes ou valeurs non NULL
- **SUM()**: Calcule la somme des valeurs
- **AVG()**: Calcule la moyenne des valeurs
- **MIN()**: Trouve la valeur minimale
- **MAX()**: Trouve la valeur maximale

### Utilisation avec GROUP BY:

La clause GROUP BY divise les résultats en groupes sur lesquels les fonctions d'agrégation sont appliquées séparément. C'est une fonctionnalité essentielle pour l'analyse de données.
      `
    },
    {
      id: 'sql-fundamentals-section-5',
      title: 'Exemples de fonctions d\'agrégation',
      type: 'code',
      codeLanguage: 'sql',
      content: `
-- Compter le nombre total de clients
SELECT COUNT(*) AS nombre_total_clients FROM clients;

-- Calculer le montant total des commandes
SELECT SUM(montant) AS chiffre_affaires_total FROM commandes;

-- Trouver la commande la plus importante
SELECT MAX(montant) AS commande_max FROM commandes;

-- Calculer le montant moyen des commandes
SELECT AVG(montant) AS panier_moyen FROM commandes;

-- Grouper par ville et compter les clients dans chaque ville
SELECT 
    ville,
    COUNT(*) AS nombre_clients
FROM clients
GROUP BY ville
ORDER BY nombre_clients DESC;

-- Analyser les ventes par mois
SELECT 
    EXTRACT(YEAR FROM date_commande) AS annee,
    EXTRACT(MONTH FROM date_commande) AS mois,
    COUNT(*) AS nombre_commandes,
    SUM(montant) AS chiffre_affaires
FROM commandes
GROUP BY annee, mois
ORDER BY annee, mois;

-- Filtrer les groupes avec HAVING
SELECT 
    ville,
    COUNT(*) AS nombre_clients
FROM clients
GROUP BY ville
HAVING COUNT(*) > 10  -- Seulement les villes avec plus de 10 clients
ORDER BY nombre_clients DESC;
      `
    },
    {
      id: 'sql-fundamentals-section-6',
      title: 'Jointures entre tables',
      type: 'text',
      content: `
## Jointures entre tables

Les jointures sont l'une des fonctionnalités les plus puissantes de SQL. Elles permettent de combiner des données provenant de plusieurs tables en utilisant les relations entre elles.

### Types de jointures:

- **INNER JOIN**: Retourne les lignes lorsqu'il y a une correspondance dans les deux tables
- **LEFT JOIN**: Retourne toutes les lignes de la table de gauche, et les lignes correspondantes de la table de droite
- **RIGHT JOIN**: Retourne toutes les lignes de la table de droite, et les lignes correspondantes de la table de gauche
- **FULL JOIN**: Retourne les lignes lorsqu'il y a une correspondance dans l'une des tables

### Syntaxe d'une jointure:

\`\`\`sql
SELECT colonnes
FROM table1
JOIN table2 ON table1.colonne = table2.colonne
\`\`\`

Les jointures sont essentielles pour l'analyse de données car elles permettent de rassembler des informations reliées mais stockées dans différentes tables.
      `
    },
    {
      id: 'sql-fundamentals-section-7',
      title: 'Exemples de jointures',
      type: 'code',
      codeLanguage: 'sql',
      content: `
-- Structure des tables (pour référence)
-- clients (id, nom, email, ville)
-- commandes (id, client_id, date_commande, montant)
-- produits (id, nom, categorie, prix)
-- details_commande (commande_id, produit_id, quantite)

-- INNER JOIN: Récupérer les commandes avec les informations clients
SELECT 
    c.nom AS nom_client,
    c.email,
    com.id AS commande_id,
    com.date_commande,
    com.montant
FROM clients c
INNER JOIN commandes com ON c.id = com.client_id
ORDER BY com.date_commande DESC;

-- LEFT JOIN: Tous les clients, même ceux n'ayant pas de commande
SELECT 
    c.nom AS nom_client,
    c.email,
    COUNT(com.id) AS nombre_commandes
FROM clients c
LEFT JOIN commandes com ON c.id = com.client_id
GROUP BY c.id, c.nom, c.email
ORDER BY nombre_commandes DESC;

-- Multiple jointures: Clients, commandes et produits
SELECT 
    c.nom AS nom_client,
    com.id AS commande_id,
    com.date_commande,
    p.nom AS nom_produit,
    dc.quantite,
    p.prix,
    (dc.quantite * p.prix) AS sous_total
FROM clients c
JOIN commandes com ON c.id = com.client_id
JOIN details_commande dc ON com.id = dc.commande_id
JOIN produits p ON dc.produit_id = p.id
ORDER BY com.date_commande DESC, com.id;

-- Analyse des ventes par catégorie de produit
SELECT 
    p.categorie,
    SUM(dc.quantite) AS quantite_totale,
    SUM(dc.quantite * p.prix) AS chiffre_affaires
FROM produits p
JOIN details_commande dc ON p.id = dc.produit_id
GROUP BY p.categorie
ORDER BY chiffre_affaires DESC;
      `
    },
    {
      id: 'sql-fundamentals-section-8',
      title: 'Sous-requêtes',
      type: 'text',
      content: `
## Sous-requêtes

Les sous-requêtes (ou requêtes imbriquées) sont des requêtes SQL placées à l'intérieur d'une autre requête. Elles permettent d'effectuer des opérations complexes qui seraient difficiles ou impossibles avec une seule requête.

### Types de sous-requêtes:

- **Sous-requêtes scalaires**: Renvoient une seule valeur
- **Sous-requêtes de ligne**: Renvoient une seule ligne
- **Sous-requêtes de table**: Renvoient une ou plusieurs lignes
- **Sous-requêtes corrélées**: Font référence à la requête externe

### Utilisations courantes:

- Filtrage basé sur des agrégats
- Comparaison avec des valeurs calculées
- Création de valeurs dérivées
- Tests d'existence (EXISTS, NOT EXISTS)

Les sous-requêtes peuvent apparaître dans différentes parties d'une requête SQL: SELECT, FROM, WHERE, HAVING.
      `
    },
    {
      id: 'sql-fundamentals-section-9',
      title: 'Exemples de sous-requêtes',
      type: 'code',
      codeLanguage: 'sql',
      content: `
-- Sous-requête dans le WHERE
-- Trouver les clients qui ont passé des commandes supérieures à la moyenne
SELECT id, nom, email
FROM clients
WHERE id IN (
    SELECT DISTINCT client_id
    FROM commandes
    WHERE montant > (
        SELECT AVG(montant) FROM commandes
    )
);

-- Sous-requête dans le FROM (création d'une table dérivée)
-- Analyser les commandes par trimestre
SELECT 
    trimestre,
    COUNT(*) AS nombre_commandes,
    SUM(montant) AS chiffre_affaires,
    AVG(montant) AS panier_moyen
FROM (
    SELECT 
        EXTRACT(YEAR FROM date_commande) AS annee,
        EXTRACT(QUARTER FROM date_commande) AS trimestre,
        montant
    FROM commandes
    WHERE date_commande >= '2023-01-01'
) AS commandes_trimestrielles
GROUP BY trimestre
ORDER BY trimestre;

-- Sous-requête corrélée
-- Trouver les produits qui ont été commandés plus que la moyenne de leur catégorie
SELECT p.id, p.nom, p.categorie, 
       (SELECT SUM(quantite) FROM details_commande WHERE produit_id = p.id) AS quantite_totale
FROM produits p
WHERE (
    SELECT SUM(quantite) FROM details_commande WHERE produit_id = p.id
) > (
    SELECT AVG(total_cat)
    FROM (
        SELECT p2.categorie, SUM(dc.quantite) AS total_cat
        FROM produits p2
        JOIN details_commande dc ON p2.id = dc.produit_id
        WHERE p2.categorie = p.categorie
        GROUP BY p2.id
    ) AS moyennes_categorie
);

-- Utilisation de EXISTS
-- Trouver les clients qui ont acheté au moins un produit de la catégorie "Électronique"
SELECT c.id, c.nom
FROM clients c
WHERE EXISTS (
    SELECT 1
    FROM commandes com
    JOIN details_commande dc ON com.id = dc.commande_id
    JOIN produits p ON dc.produit_id = p.id
    WHERE com.client_id = c.id
    AND p.categorie = 'Électronique'
);
      `
    },
    {
      id: 'sql-fundamentals-section-10',
      title: 'Cas pratique : Analyse de données énergétiques',
      type: 'text',
      content: `
## Cas pratique : Analyse de données énergétiques

Pour illustrer l'utilisation de SQL dans un contexte réel, voici un cas pratique typique d'un projet DIXIT chez mc2i dans le secteur de l'énergie.

### Contexte

Vous travaillez pour un fournisseur d'énergie qui souhaite analyser les données de consommation de ses clients pour optimiser ses offres et services. La base de données contient:

- Des informations sur les clients (localisation, type d'habitation, etc.)
- Des relevés de consommation électrique
- Des données tarifaires et de facturation
- Des informations sur les équipements des clients

### Objectifs de l'analyse

1. Identifier les profils de consommation
2. Analyser les variations saisonnières
3. Évaluer l'impact des tarifs heures pleines/creuses
4. Segmenter les clients pour des offres personnalisées

Le cas pratique suivant montre comment vous pourriez interroger ces données avec SQL.
      `
    },
    {
      id: 'sql-fundamentals-section-11',
      title: 'Cas pratique : Exemples de requêtes',
      type: 'code',
      codeLanguage: 'sql',
      content: `
-- Structure des tables (pour référence)
-- clients (id, nom, code_postal, type_logement, surface_m2, nb_occupants)
-- contrats (id, client_id, offre_id, date_debut, date_fin, option_heures_creuses)
-- releves (id, contrat_id, date_releve, index_hp, index_hc)
-- consommations (id, contrat_id, mois, annee, conso_kwh, conso_hp_kwh, conso_hc_kwh, montant)
-- equipements (id, client_id, type_equipement, puissance_kw, date_installation)

-- 1. Consommation moyenne par type de logement
SELECT 
    c.type_logement,
    ROUND(AVG(conso.conso_kwh), 2) AS conso_moyenne_kwh,
    COUNT(DISTINCT c.id) AS nombre_clients
FROM clients c
JOIN contrats ct ON c.id = ct.client_id
JOIN consommations conso ON ct.id = conso.contrat_id
WHERE conso.annee = 2023
GROUP BY c.type_logement
ORDER BY conso_moyenne_kwh DESC;

-- 2. Analyse des variations saisonnières
SELECT 
    conso.annee,
    conso.mois,
    CASE 
        WHEN conso.mois IN (12, 1, 2) THEN 'Hiver'
        WHEN conso.mois IN (3, 4, 5) THEN 'Printemps'
        WHEN conso.mois IN (6, 7, 8) THEN 'Été'
        WHEN conso.mois IN (9, 10, 11) THEN 'Automne'
    END AS saison,
    SUM(conso.conso_kwh) AS consommation_totale,
    ROUND(AVG(conso.conso_kwh), 2) AS consommation_moyenne,
    COUNT(DISTINCT conso.contrat_id) AS nombre_contrats
FROM consommations conso
WHERE conso.annee >= 2022
GROUP BY conso.annee, conso.mois
ORDER BY conso.annee, conso.mois;

-- 3. Impact des heures creuses sur la consommation
WITH conso_par_option AS (
    SELECT 
        ct.option_heures_creuses,
        AVG(conso.conso_kwh) AS conso_moyenne,
        SUM(conso.conso_kwh) / SUM(c.surface_m2) AS conso_par_m2
    FROM contrats ct
    JOIN clients c ON ct.client_id = c.id
    JOIN consommations conso ON ct.id = conso.contrat_id
    WHERE conso.annee = 2023
    GROUP BY ct.option_heures_creuses
)
SELECT 
    CASE WHEN option_heures_creuses THEN 'Avec HC/HP' ELSE 'Sans HC/HP' END AS type_contrat,
    ROUND(conso_moyenne, 2) AS consommation_moyenne_kwh,
    ROUND(conso_par_m2, 2) AS consommation_par_m2
FROM conso_par_option;

-- 4. Répartition HP/HC pour les clients avec cette option
SELECT 
    conso.mois,
    ROUND(SUM(conso.conso_hp_kwh) / SUM(conso.conso_kwh) * 100, 2) AS pourcentage_heures_pleines,
    ROUND(SUM(conso.conso_hc_kwh) / SUM(conso.conso_kwh) * 100, 2) AS pourcentage_heures_creuses
FROM consommations conso
JOIN contrats ct ON conso.contrat_id = ct.id
WHERE ct.option_heures_creuses = TRUE
  AND conso.annee = 2023
GROUP BY conso.mois
ORDER BY conso.mois;

-- 5. Segmentation des clients pour ciblage commercial
WITH stats_clients AS (
    SELECT 
        c.id,
        c.type_logement,
        c.surface_m2,
        c.nb_occupants,
        ROUND(AVG(conso.conso_kwh), 2) AS conso_moyenne,
        ROUND(AVG(conso.conso_kwh / c.surface_m2), 2) AS conso_par_m2,
        COUNT(DISTINCT e.id) AS nb_equipements,
        SUM(e.puissance_kw) AS puissance_totale
    FROM clients c
    JOIN contrats ct ON c.id = ct.client_id
    JOIN consommations conso ON ct.id = conso.contrat_id
    LEFT JOIN equipements e ON c.id = e.client_id
    WHERE conso.annee = 2023
    GROUP BY c.id, c.type_logement, c.surface_m2, c.nb_occupants
)
SELECT 
    id,
    type_logement,
    surface_m2,
    conso_moyenne,
    conso_par_m2,
    CASE 
        WHEN conso_par_m2 < 50 THEN 'Économe'
        WHEN conso_par_m2 BETWEEN 50 AND 90 THEN 'Standard'
        WHEN conso_par_m2 > 90 THEN 'Énergivore'
    END AS profil_energetique,
    CASE 
        WHEN puissance_totale > 10 AND nb_equipements > 5 THEN 'Potentiel domotique élevé'
        WHEN puissance_totale > 5 THEN 'Potentiel domotique moyen'
        ELSE 'Potentiel domotique faible'
    END AS potentiel_equipement
FROM stats_clients
ORDER BY conso_par_m2 DESC;

-- 6. Détection des anomalies de consommation
WITH historique_client AS (
    SELECT 
        contrat_id,
        AVG(conso_kwh) AS conso_moyenne,
        STDDEV(conso_kwh) AS ecart_type
    FROM consommations
    WHERE annee = 2022
    GROUP BY contrat_id
)
SELECT 
    c.nom AS client,
    cons.mois,
    cons.conso_kwh AS consommation_actuelle,
    h.conso_moyenne AS consommation_habituelle,
    ROUND((cons.conso_kwh - h.conso_moyenne) / h.conso_moyenne * 100, 2) AS variation_pct
FROM consommations cons
JOIN contrats ct ON cons.contrat_id = ct.id
JOIN clients c ON ct.client_id = c.id
JOIN historique_client h ON cons.contrat_id = h.contrat_id
WHERE cons.annee = 2023
  AND ABS(cons.conso_kwh - h.conso_moyenne) > 2 * h.ecart_type
ORDER BY variation_pct DESC;
      `
    },
    {
      id: 'sql-fundamentals-section-12',
      title: 'Conclusion',
      type: 'text',
      content: `
## Conclusion

Ce cours vous a présenté les fondamentaux de SQL pour l'analyse de données, couvrant:

- La structure et les concepts des bases de données relationnelles
- Les requêtes SELECT de base et le filtrage des données
- Les fonctions d'agrégation et le regroupement
- Les jointures entre tables
- Les sous-requêtes pour des analyses complexes
- Un cas pratique d'analyse de données énergétiques

Ces connaissances constituent une base solide pour travailler efficacement avec des données structurées dans des environnements professionnels. SQL est un langage puissant et incontournable dans le domaine de la Data Science et de l'analyse de données.

### Bonnes pratiques à retenir:

1. **Optimisez vos requêtes**: Limitez les données extraites à ce qui est nécessaire
2. **Utilisez des alias explicites**: Rendez vos requêtes lisibles, surtout avec des jointures
3. **Commentez votre code**: Documentez le but et la logique de vos requêtes complexes
4. **Testez par étapes**: Construisez et testez des requêtes complexes de façon incrémentale

### Prochaines étapes

Pour approfondir vos compétences SQL:
1. Explorez les fonctions de fenêtrage (window functions)
2. Apprenez les fonctions spécifiques à votre SGBD (PostgreSQL, MySQL, etc.)
3. Familiarisez-vous avec l'optimisation des requêtes
4. Pratiquez sur des jeux de données réels

Bonne continuation dans votre parcours d'apprentissage !
      `
    },
  ],
  exercises: [
    {
      id: 'sql-fundamentals-exercise-1',
      title: 'Requêtes SELECT de base',
      description: 'Pratiquez les requêtes SQL fondamentales',
      type: 'coding',
      difficulty: 'débutant',
      content: `
### Exercice: Requêtes SELECT de base

Considérez une base de données de gestion de bibliothèque avec la table suivante:

\`\`\`
Table: livres
Colonnes:
- id (INTEGER)
- titre (TEXT)
- auteur (TEXT)
- annee_publication (INTEGER)
- genre (TEXT)
- disponible (BOOLEAN)
- nombre_pages (INTEGER)
\`\`\`

Écrivez des requêtes SQL pour:

1. Afficher tous les livres publiés après l'an 2000
2. Lister les titres et auteurs des livres de science-fiction par ordre alphabétique de titre
3. Compter le nombre de livres disponibles par genre
4. Trouver le livre le plus ancien et le plus récent dans la bibliothèque
5. Calculer le nombre moyen de pages des livres par genre
      `,
      solution: `
-- 1. Livres publiés après 2000
SELECT * FROM livres
WHERE annee_publication > 2000
ORDER BY annee_publication;

-- 2. Titres et auteurs des livres de science-fiction
SELECT titre, auteur
FROM livres
WHERE genre = 'Science-Fiction'
ORDER BY titre ASC;

-- 3. Nombre de livres disponibles par genre
SELECT genre, COUNT(*) AS nombre_livres
FROM livres
WHERE disponible = TRUE
GROUP BY genre
ORDER BY nombre_livres DESC;

-- 4. Livre le plus ancien et le plus récent
SELECT 
    (SELECT titre FROM livres ORDER BY annee_publication ASC LIMIT 1) AS livre_plus_ancien,
    (SELECT titre FROM livres ORDER BY annee_publication DESC LIMIT 1) AS livre_plus_recent;

-- Alternative avec MIN et MAX
SELECT 
    MIN(annee_publication) AS annee_plus_ancien,
    MAX(annee_publication) AS annee_plus_recent
FROM livres;

-- 5. Nombre moyen de pages par genre
SELECT 
    genre,
    ROUND(AVG(nombre_pages), 0) AS moyenne_pages
FROM livres
GROUP BY genre
ORDER BY moyenne_pages DESC;
      `
    },
    {
      id: 'sql-fundamentals-exercise-2',
      title: 'Jointures et analyses complexes',
      description: 'Manipuler plusieurs tables pour extraire des insights',
      type: 'coding',
      difficulty: 'intermédiaire',
      content: `
### Exercice: Jointures et analyses complexes

Travaillez avec une base de données de gestion de ventes contenant les tables suivantes:

\`\`\`
Table: clients
Colonnes: id, nom, email, ville

Table: produits
Colonnes: id, nom, categorie, prix, stock

Table: commandes
Colonnes: id, client_id, date_commande, statut

Table: lignes_commande
Colonnes: id, commande_id, produit_id, quantite, prix_unitaire
\`\`\`

Écrivez des requêtes SQL pour:

1. Lister les 5 clients ayant passé le plus de commandes, avec le nombre de commandes et le montant total
2. Identifier les produits n'ayant jamais été commandés
3. Calculer le panier moyen (montant moyen des commandes) par ville
4. Trouver le produit le plus vendu par catégorie
5. Analyser l'évolution mensuelle des ventes (nombre de commandes et chiffre d'affaires) sur l'année 2023
      `,
      solution: `
-- 1. Top 5 des clients par nombre de commandes et montant
SELECT 
    c.id,
    c.nom,
    COUNT(co.id) AS nombre_commandes,
    SUM(lc.quantite * lc.prix_unitaire) AS montant_total
FROM clients c
JOIN commandes co ON c.id = co.client_id
JOIN lignes_commande lc ON co.id = lc.commande_id
GROUP BY c.id, c.nom
ORDER BY nombre_commandes DESC, montant_total DESC
LIMIT 5;

-- 2. Produits jamais commandés
SELECT p.id, p.nom, p.categorie, p.prix
FROM produits p
LEFT JOIN lignes_commande lc ON p.id = lc.produit_id
WHERE lc.id IS NULL
ORDER BY p.categorie, p.nom;

-- 3. Panier moyen par ville
SELECT 
    c.ville,
    COUNT(DISTINCT co.id) AS nombre_commandes,
    ROUND(SUM(lc.quantite * lc.prix_unitaire) / COUNT(DISTINCT co.id), 2) AS panier_moyen
FROM clients c
JOIN commandes co ON c.id = co.client_id
JOIN lignes_commande lc ON co.id = lc.commande_id
GROUP BY c.ville
ORDER BY panier_moyen DESC;

-- 4. Produit le plus vendu par catégorie
WITH ventes_produits AS (
    SELECT 
        p.id,
        p.nom,
        p.categorie,
        SUM(lc.quantite) AS quantite_vendue,
        RANK() OVER (PARTITION BY p.categorie ORDER BY SUM(lc.quantite) DESC) AS rang
    FROM produits p
    JOIN lignes_commande lc ON p.id = lc.produit_id
    GROUP BY p.id, p.nom, p.categorie
)
SELECT categorie, nom, quantite_vendue
FROM ventes_produits
WHERE rang = 1
ORDER BY quantite_vendue DESC;

-- 5. Évolution mensuelle des ventes 2023
SELECT 
    EXTRACT(MONTH FROM co.date_commande) AS mois,
    COUNT(DISTINCT co.id) AS nombre_commandes,
    SUM(lc.quantite) AS quantite_produits,
    ROUND(SUM(lc.quantite * lc.prix_unitaire), 2) AS chiffre_affaires
FROM commandes co
JOIN lignes_commande lc ON co.id = lc.commande_id
WHERE EXTRACT(YEAR FROM co.date_commande) = 2023
GROUP BY mois
ORDER BY mois;
      `
    },
    {
      id: 'sql-fundamentals-exercise-3',
      title: 'Quiz SQL pour l\'analyse de données',
      description: 'Testez vos connaissances sur les concepts SQL',
      type: 'quiz',
      difficulty: 'débutant',
      content: `
### Quiz: SQL pour l'analyse de données

1. Quelle clause SQL est utilisée pour filtrer les groupes après un regroupement?
   a) WHERE
   b) HAVING
   c) FILTER
   d) GROUP FILTER

2. Quelle jointure renvoie toutes les lignes de la première table et les lignes correspondantes de la deuxième table?
   a) INNER JOIN
   b) RIGHT JOIN
   c) LEFT JOIN
   d) FULL JOIN

3. Quelle fonction d'agrégation calcule la valeur moyenne d'une colonne?
   a) SUM()
   b) COUNT()
   c) AVG()
   d) MEAN()

4. Laquelle des requêtes suivantes est correcte pour obtenir les 5 produits les plus chers?
   a) SELECT * FROM produits SORT BY prix DESC LIMIT 5;
   b) SELECT * FROM produits ORDER BY prix DESC LIMIT 5;
   c) SELECT TOP 5 * FROM produits ORDER BY prix DESC;
   d) SELECT * FROM produits ORDER BY prix DESC FIRST 5;

5. Quelle clause est nécessaire pour éliminer les doublons dans un résultat?
   a) UNIQUE
   b) DISTINCT
   c) DIFFERENT
   d) NODUPLICATE
      `,
      solution: `
Réponses:
1. b) HAVING - Cette clause est utilisée pour filtrer les groupes après un GROUP BY, tandis que WHERE filtre les lignes avant le regroupement.
2. c) LEFT JOIN - Cette jointure renvoie toutes les lignes de la table de gauche et les lignes correspondantes de la table de droite.
3. c) AVG() - Cette fonction calcule la moyenne arithmétique des valeurs d'une colonne.
4. b) SELECT * FROM produits ORDER BY prix DESC LIMIT 5; - Cette syntaxe est correcte pour trier les produits par prix décroissant et limiter le résultat aux 5 premiers.
5. b) DISTINCT - Cette clause élimine les doublons des résultats d'une requête.
      `
    }
  ],
  resources: [
    {
      id: 'sql-fundamentals-resource-1',
      title: 'Documentation PostgreSQL',
      type: 'article',
      url: 'https://www.postgresql.org/docs/current/index.html',
      description: 'Documentation officielle de PostgreSQL, une des bases de données relationnelles les plus populaires'
    },
    {
      id: 'sql-fundamentals-resource-2',
      title: 'Mode Analytics SQL Tutorial',
      type: 'article',
      url: 'https://mode.com/sql-tutorial/',
      description: 'Tutoriel SQL interactif orienté analyse de données'
    },
    {
      id: 'sql-fundamentals-resource-3',
      title: 'SQLBolt - Apprendre SQL avec des exercices',
      type: 'article',
      url: 'https://sqlbolt.com/',
      description: 'Cours interactif pour apprendre SQL par la pratique'
    },
    {
      id: 'sql-fundamentals-resource-4',
      title: 'DataCamp - Introduction à SQL',
      type: 'video',
      url: 'https://www.datacamp.com/courses/introduction-to-sql',
      description: 'Cours interactif pour apprendre les bases de SQL pour l\'analyse de données'
    }
  ]
};

// Collection de cours par ID
const courses: Record<string, Course> = {
  'python-basics': pythonBasicsCourse,
  'sql-fundamentals': sqlFundamentalsCourse,
  // Ajouter d'autres cours ici
};

// Interface du service
class DataIaCoursesService {
  // Récupérer un cours par son ID
  getCourse(courseId: string): Course | undefined {
    return courses[courseId];
  }

  // Lister tous les cours disponibles
  getAllCourses(): Course[] {
    return Object.values(courses);
  }

  // Lister les cours par catégorie
  getCoursesByCategory(category: string): Course[] {
    return Object.values(courses).filter(course => course.category === category);
  }

  // Lister les cours par niveau de difficulté
  getCoursesByDifficulty(difficulty: string): Course[] {
    return Object.values(courses).filter(course => course.difficulty === difficulty);
  }

  // Rechercher des cours par mot-clé
  searchCourses(keyword: string): Course[] {
    const lowercaseKeyword = keyword.toLowerCase();
    return Object.values(courses).filter(course => 
      course.title.toLowerCase().includes(lowercaseKeyword) || 
      course.description.toLowerCase().includes(lowercaseKeyword) ||
      course.content.toLowerCase().includes(lowercaseKeyword)
    );
  }
}

// Exportation du service
export const dataIaCoursesService = new DataIaCoursesService();