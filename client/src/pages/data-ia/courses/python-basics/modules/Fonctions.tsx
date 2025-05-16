import React from 'react';
import { ChevronRight, ChevronLeft, BrainCircuit, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface FonctionsProps {
  goToNext: () => void;
  goToPrev: () => void;
}

const Fonctions: React.FC<FonctionsProps> = ({ goToNext, goToPrev }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Fonctions et modules</h2>
      
      <div className="mb-6">
        <p className="mb-4">Les fonctions et les modules sont essentiels pour organiser votre code, le rendre plus réutilisable et plus facile à maintenir. En data science, ils sont particulièrement importants pour structurer vos analyses et rendre votre travail reproductible.</p>
        
        <h3 className="text-xl font-semibold mb-3">Définition de fonctions</h3>
        <p className="mb-3">Les fonctions sont des blocs de code réutilisables qui effectuent des tâches spécifiques. Elles vous permettent de structurer votre code et d'éviter la répétition.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Syntaxe de base</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Définition d'une fonction simple
def saluer():
    print("Bonjour, bienvenue dans le cours de Python!")
    
# Appel de la fonction
saluer()

# Fonction avec paramètres
def saluer_personne(nom):
    print(f"Bonjour, {nom}!")
    
saluer_personne("Alice")  # Bonjour, Alice!
saluer_personne("Bob")    # Bonjour, Bob!

# Fonction avec valeur de retour
def calculer_carre(nombre):
    return nombre ** 2
    
resultat = calculer_carre(5)
print(resultat)  # 25

# Fonction avec paramètres par défaut
def saluer_avec_titre(nom, titre="M./Mme"):
    print(f"Bonjour, {titre} {nom}!")
    
saluer_avec_titre("Dupont")             # Bonjour, M./Mme Dupont!
saluer_avec_titre("Dupont", "Dr")       # Bonjour, Dr Dupont!

# Fonction avec paramètres nommés
def decrire_personne(nom, age, profession):
    return f"{nom} a {age} ans et est {profession}."
    
# Les paramètres peuvent être passés dans un ordre différent si nommés
print(decrire_personne(age=30, profession="data scientist", nom="Alice"))`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-4 border border-blue-800 mb-6">
          <h4 className="font-semibold mb-2">Docstrings</h4>
          <p className="mb-2">Les docstrings (chaînes de documentation) sont utilisées pour documenter les fonctions. C'est une bonne pratique, particulièrement en data science où la documentation du code est cruciale.</p>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`def calculer_moyenne(nombres):
    """
    Calcule la moyenne arithmétique d'une liste de nombres.
    
    Args:
        nombres (list): Une liste de nombres (int ou float)
        
    Returns:
        float: La moyenne des nombres
        
    Raises:
        ValueError: Si la liste est vide
        TypeError: Si la liste contient des éléments non numériques
    """
    if not nombres:
        raise ValueError("La liste ne peut pas être vide")
    
    return sum(nombres) / len(nombres)

# La docstring est accessible via l'attribut __doc__ ou la fonction help()
print(calculer_moyenne.__doc__)
help(calculer_moyenne)`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Paramètres avancés</h3>
        <p className="mb-3">Python offre des façons flexibles de définir et de passer des paramètres à vos fonctions.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Paramètres positionnels et nommés</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-4">
            {`def analyser_donnees(dataset, colonne, methode="moyenne", normaliser=False):
    """
    Exemple de fonction avec un mélange de paramètres obligatoires et optionnels.
    """
    print(f"Analyse de {colonne} dans {dataset} avec méthode {methode}")
    if normaliser:
        print("Les données seront normalisées")
    
# Différentes façons d'appeler la fonction
analyser_donnees("titanic.csv", "age")  # Utilise les valeurs par défaut pour methode et normaliser
analyser_donnees("titanic.csv", "age", "médiane")  # Modifie methode, garde normaliser par défaut
analyser_donnees("titanic.csv", "age", normaliser=True)  # Utilise methode par défaut, modifie normaliser
analyser_donnees(colonne="age", dataset="titanic.csv")  # Ordre changé avec paramètres nommés`}
          </SyntaxHighlighter>
          
          <h4 className="font-semibold mb-2">Paramètres arbitraires (*args, **kwargs)</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# *args: nombre variable d'arguments positionnels
def calculer_somme(*nombres):
    """Calcule la somme d'un nombre arbitraire de valeurs."""
    return sum(nombres)

print(calculer_somme(1, 2, 3))  # 6
print(calculer_somme(10, 20))    # 30

# **kwargs: nombre variable d'arguments nommés
def creer_profil(**infos):
    """Crée un profil à partir d'informations clé-valeur arbitraires."""
    profil = {}
    for cle, valeur in infos.items():
        profil[cle] = valeur
    return profil

profil = creer_profil(nom="Alice", age=30, profession="Data Scientist", ville="Paris")
print(profil)  # {'nom': 'Alice', 'age': 30, 'profession': 'Data Scientist', 'ville': 'Paris'}

# Combinaison de paramètres normaux, *args et **kwargs
def fonction_complete(param_obligatoire, param_defaut="valeur", *args, **kwargs):
    print(f"Param obligatoire: {param_obligatoire}")
    print(f"Param par défaut: {param_defaut}")
    print(f"Args: {args}")
    print(f"Kwargs: {kwargs}")
    
fonction_complete("test", "personnalisé", 1, 2, 3, a=10, b=20)`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Fonctions anonymes (lambda)</h3>
        <p className="mb-3">Les fonctions lambda sont des fonctions anonymes, concises et à usage unique, souvent utilisées avec des fonctions comme <code>map()</code>, <code>filter()</code> et <code>sorted()</code>.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Syntaxe: lambda arguments: expression
# Une fonction lambda simple
carre = lambda x: x ** 2
print(carre(5))  # 25

# Utilisation avec map() pour appliquer une fonction à chaque élément d'une liste
nombres = [1, 2, 3, 4, 5]
carres = list(map(lambda x: x ** 2, nombres))
print(carres)  # [1, 4, 9, 16, 25]

# Utilisation avec filter() pour filtrer une liste
nombres = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
pairs = list(filter(lambda x: x % 2 == 0, nombres))
print(pairs)  # [2, 4, 6, 8, 10]

# Utilisation avec sorted() pour trier
etudiants = [
    {"nom": "Alice", "note": 85},
    {"nom": "Bob", "note": 70},
    {"nom": "Charlie", "note": 90},
    {"nom": "David", "note": 65}
]
# Tri par note en ordre décroissant
tries = sorted(etudiants, key=lambda e: e["note"], reverse=True)
for etudiant in tries:
    print(f"{etudiant['nom']}: {etudiant['note']}")`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Scope et variables</h3>
        <p className="mb-3">Le scope détermine où les variables sont accessibles dans votre code.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Variable locale vs. globale</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Variable globale
x = 10

def fonction1():
    # Variable locale à fonction1
    y = 5
    print(f"Dans fonction1: x = {x}, y = {y}")  # Peut accéder à x (global) et y (local)
    
def fonction2():
    # Une autre variable locale y
    y = 20
    print(f"Dans fonction2: x = {x}, y = {y}")  # Peut accéder à x (global) et y (local)
    
fonction1()  # Dans fonction1: x = 10, y = 5
fonction2()  # Dans fonction2: x = 10, y = 20
print(f"Dans le scope global: x = {x}")  # Peut accéder à x
# print(y)  # Erreur! y n'est pas défini dans le scope global

# Modification d'une variable globale
def modifier_global():
    global x  # Déclaration nécessaire pour modifier x
    x = 50
    print(f"Dans modifier_global: x = {x}")
    
modifier_global()  # Dans modifier_global: x = 50
print(f"Après modification: x = {x}")  # x a été modifié: 50`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-gradient-to-r from-amber-700/20 to-red-700/20 border border-amber-600/40 rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-2 text-amber-300">Attention aux variables globales!</h4>
          <p className="text-amber-100 mb-2">En data science et en général, l'utilisation de variables globales est souvent déconseillée car elles:</p>
          <ul className="list-disc list-inside space-y-1 text-amber-200">
            <li>Rendent le code difficile à déboguer et à maintenir</li>
            <li>Peuvent causer des effets secondaires inattendus</li>
            <li>Compliquent les tests unitaires</li>
            <li>Nuisent à la portabilité et à la réutilisabilité du code</li>
          </ul>
          <p className="text-amber-100 mt-2">Préférez passer des variables en paramètres et retourner des résultats plutôt que de modifier des variables globales.</p>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Modules et packages</h3>
        <p className="mb-3">Les modules et packages permettent d'organiser votre code en unités logiques réutilisables.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Importation de modules</h4>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-4">
            {`# Importer un module entier
import math
print(math.sqrt(16))  # 4.0

# Importer des fonctions/classes spécifiques
from math import sqrt, pi
print(sqrt(16))  # 4.0
print(pi)        # 3.141592653589793

# Importer avec un alias
import numpy as np
import pandas as pd

# Importer tout (généralement déconseillé)
from math import *  # Importe toutes les fonctions, peut causer des conflits de noms`}
          </SyntaxHighlighter>
          
          <h4 className="font-semibold mb-2">Modules standard importants</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-900/40 p-3 rounded-md">
              <h5 className="font-semibold text-blue-300">math</h5>
              <p className="text-sm mb-2">Fonctions mathématiques de base.</p>
              <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-xs">
                {`import math
print(math.log10(100))  # 2.0
print(math.sin(math.pi/2))  # 1.0
print(math.factorial(5))  # 120`}
              </SyntaxHighlighter>
            </div>
            
            <div className="bg-blue-900/40 p-3 rounded-md">
              <h5 className="font-semibold text-blue-300">random</h5>
              <p className="text-sm mb-2">Génération de nombres aléatoires.</p>
              <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-xs">
                {`import random
print(random.random())  # Flottant entre 0 et 1
print(random.randint(1, 10))  # Entier entre 1 et 10
print(random.choice(["A", "B", "C"]))  # Élément aléatoire`}
              </SyntaxHighlighter>
            </div>
            
            <div className="bg-blue-900/40 p-3 rounded-md">
              <h5 className="font-semibold text-blue-300">datetime</h5>
              <p className="text-sm mb-2">Manipulation de dates et heures.</p>
              <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-xs">
                {`from datetime import datetime, timedelta
maintenant = datetime.now()
print(maintenant.strftime("%Y-%m-%d"))
hier = maintenant - timedelta(days=1)`}
              </SyntaxHighlighter>
            </div>
            
            <div className="bg-blue-900/40 p-3 rounded-md">
              <h5 className="font-semibold text-blue-300">os et sys</h5>
              <p className="text-sm mb-2">Interaction avec le système d'exploitation.</p>
              <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-xs">
                {`import os, sys
print(os.getcwd())  # Répertoire de travail actuel
print(sys.version)  # Version de Python
os.makedirs("nouveau_dossier", exist_ok=True)`}
              </SyntaxHighlighter>
            </div>
          </div>
          
          <h4 className="font-semibold mb-2">Modules tiers pour la data science</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-800/30 p-3 rounded-md">
              <h5 className="font-semibold text-blue-300">NumPy</h5>
              <p className="text-sm mb-2">Calcul numérique, tableaux multidimensionnels.</p>
              <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-xs">
                {`import numpy as np
arr = np.array([1, 2, 3, 4, 5])
print(np.mean(arr))  # 3.0
print(np.std(arr))   # Écart-type`}
              </SyntaxHighlighter>
            </div>
            
            <div className="bg-blue-800/30 p-3 rounded-md">
              <h5 className="font-semibold text-blue-300">Pandas</h5>
              <p className="text-sm mb-2">Manipulation et analyse de données tabulaires.</p>
              <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-xs">
                {`import pandas as pd
df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})
print(df.describe())  # Statistiques descriptives`}
              </SyntaxHighlighter>
            </div>
            
            <div className="bg-blue-800/30 p-3 rounded-md">
              <h5 className="font-semibold text-blue-300">Matplotlib</h5>
              <p className="text-sm mb-2">Visualisation de données.</p>
              <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-xs">
                {`import matplotlib.pyplot as plt
plt.plot([1, 2, 3, 4], [1, 4, 9, 16])
plt.xlabel('x')
plt.ylabel('y')
plt.title('Exemple de graphique')`}
              </SyntaxHighlighter>
            </div>
            
            <div className="bg-blue-800/30 p-3 rounded-md">
              <h5 className="font-semibold text-blue-300">Scikit-learn</h5>
              <p className="text-sm mb-2">Apprentissage automatique.</p>
              <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-xs">
                {`from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
X_train, X_test, y_train, y_test = train_test_split(X, y)
model = LinearRegression().fit(X_train, y_train)`}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Création de modules</h3>
        <p className="mb-3">Vous pouvez créer vos propres modules pour organiser votre code et le rendre plus réutilisable.</p>
        
        <div className="bg-blue-900/30 rounded-md p-4 mb-6">
          <h4 className="font-semibold mb-2">Structure de fichiers</h4>
          <SyntaxHighlighter language="plaintext" style={vscDarkPlus} className="rounded-md mb-4">
            {`mon_projet/
├── main.py
├── utils.py
└── data_processing/
    ├── __init__.py
    ├── cleaner.py
    └── transformer.py`}
          </SyntaxHighlighter>
          
          <h4 className="font-semibold mb-2">Contenu des fichiers</h4>
          <p className="text-sm mb-1">utils.py</p>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-3 text-sm">
            {`"""Module d'utilitaires pour le projet."""

def calculer_moyenne(nombres):
    """Calcule la moyenne d'une liste de nombres."""
    return sum(nombres) / len(nombres)

def calculer_variance(nombres):
    """Calcule la variance d'une liste de nombres."""
    moyenne = calculer_moyenne(nombres)
    return sum((x - moyenne) ** 2 for x in nombres) / len(nombres)

# Variable qui sera importée
VERSION = "1.0.0"`}
          </SyntaxHighlighter>
          
          <p className="text-sm mb-1">data_processing/cleaner.py</p>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-3 text-sm">
            {`"""Module pour nettoyer les données."""

def remove_nulls(data):
    """Supprime les valeurs nulles d'une liste."""
    return [x for x in data if x is not None]

def replace_outliers(data, lower_bound, upper_bound, replacement=None):
    """Remplace les valeurs aberrantes par une valeur spécifiée ou par les bornes."""
    result = []
    for x in data:
        if x < lower_bound:
            result.append(lower_bound if replacement is None else replacement)
        elif x > upper_bound:
            result.append(upper_bound if replacement is None else replacement)
        else:
            result.append(x)
    return result`}
          </SyntaxHighlighter>
          
          <p className="text-sm mb-1">main.py</p>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
            {`"""Point d'entrée principal du programme."""

# Importation de notre propre module utils
import utils
from data_processing.cleaner import remove_nulls, replace_outliers

# Utilisation des fonctions importées
data = [1, 5, None, 10, 12, None, 3]
cleaned_data = remove_nulls(data)
print(f"Données nettoyées: {cleaned_data}")

average = utils.calculer_moyenne(cleaned_data)
variance = utils.calculer_variance(cleaned_data)
print(f"Moyenne: {average:.2f}, Variance: {variance:.2f}")

# Remplacement des valeurs aberrantes
outlier_data = [10, 20, 30, 100, 15, 25, 200]
cleaned_outliers = replace_outliers(outlier_data, 5, 50, 25)
print(f"Données sans aberrations: {cleaned_outliers}")

print(f"Version: {utils.VERSION}")`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-gradient-to-r from-blue-800/30 to-indigo-800/30 border border-blue-700 rounded-lg p-4 mb-6">
          <h3 className="flex items-center text-lg font-semibold mb-2">
            <BrainCircuit className="h-5 w-5 text-blue-400 mr-2" />
            Application en Data Science
          </h3>
          <p className="text-blue-200 mb-3">Voici un exemple de création d'un module d'analyse statistique pour la data science :</p>
          
          <p className="text-sm mb-1 text-blue-300 font-semibold">stats_utils.py</p>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-4">
            {`"""
Module d'utilitaires statistiques pour l'analyse de données.

Ce module contient des fonctions pour calculer des statistiques descriptives
et effectuer des tests statistiques de base.
"""

import math
from collections import Counter

def mean(data):
    """
    Calcule la moyenne arithmétique d'une liste de nombres.
    
    Args:
        data (list): Liste de nombres
        
    Returns:
        float: Moyenne arithmétique
        
    Raises:
        ValueError: Si la liste est vide
    """
    if not data:
        raise ValueError("La liste ne peut pas être vide")
    return sum(data) / len(data)

def median(data):
    """
    Calcule la médiane d'une liste de nombres.
    
    Args:
        data (list): Liste de nombres
        
    Returns:
        float: Médiane
        
    Raises:
        ValueError: Si la liste est vide
    """
    if not data:
        raise ValueError("La liste ne peut pas être vide")
    
    sorted_data = sorted(data)
    n = len(sorted_data)
    
    if n % 2 == 0:
        # Si le nombre d'éléments est pair, moyenne des deux du milieu
        middle1 = sorted_data[n // 2 - 1]
        middle2 = sorted_data[n // 2]
        return (middle1 + middle2) / 2
    else:
        # Si le nombre d'éléments est impair, élément du milieu
        return sorted_data[n // 2]

def std_dev(data):
    """
    Calcule l'écart-type d'une liste de nombres.
    
    Args:
        data (list): Liste de nombres
        
    Returns:
        float: Écart-type
        
    Raises:
        ValueError: Si la liste a moins de deux éléments
    """
    if len(data) < 2:
        raise ValueError("L'écart-type nécessite au moins deux valeurs")
    
    avg = mean(data)
    variance = sum((x - avg) ** 2 for x in data) / len(data)
    return math.sqrt(variance)

def mode(data):
    """
    Trouve le(s) mode(s) d'une liste (valeur(s) la(les) plus fréquente(s)).
    
    Args:
        data (list): Liste de valeurs
        
    Returns:
        list: Liste des valeurs modales
        
    Raises:
        ValueError: Si la liste est vide
    """
    if not data:
        raise ValueError("La liste ne peut pas être vide")
    
    counts = Counter(data)
    max_count = max(counts.values())
    return [item for item, count in counts.items() if count == max_count]

def quantiles(data, q_list=[0.25, 0.5, 0.75]):
    """
    Calcule les quantiles spécifiés d'une liste de nombres.
    
    Args:
        data (list): Liste de nombres
        q_list (list): Liste des quantiles à calculer (entre 0 et 1)
        
    Returns:
        dict: Dictionnaire avec les quantiles comme clés et leurs valeurs
        
    Raises:
        ValueError: Si la liste est vide ou si un quantile est invalide
    """
    if not data:
        raise ValueError("La liste ne peut pas être vide")
    
    for q in q_list:
        if not 0 <= q <= 1:
            raise ValueError("Les quantiles doivent être entre 0 et 1")
    
    sorted_data = sorted(data)
    result = {}
    
    for q in q_list:
        index = q * (len(sorted_data) - 1)
        
        if index.is_integer():
            result[q] = sorted_data[int(index)]
        else:
            i_lower = math.floor(index)
            i_upper = math.ceil(index)
            weight_upper = index - i_lower
            weight_lower = 1 - weight_upper
            result[q] = sorted_data[i_lower] * weight_lower + sorted_data[i_upper] * weight_upper
    
    return result

def summary_stats(data):
    """
    Calcule un ensemble de statistiques descriptives pour une liste de nombres.
    
    Args:
        data (list): Liste de nombres
        
    Returns:
        dict: Dictionnaire contenant diverses statistiques
        
    Raises:
        ValueError: Si la liste est vide
    """
    if not data:
        raise ValueError("La liste ne peut pas être vide")
    
    stats = {}
    stats["count"] = len(data)
    stats["min"] = min(data)
    stats["max"] = max(data)
    stats["range"] = stats["max"] - stats["min"]
    stats["mean"] = mean(data)
    stats["median"] = median(data)
    
    try:
        stats["std_dev"] = std_dev(data)
    except ValueError:
        stats["std_dev"] = None
    
    stats["mode"] = mode(data)
    stats["quartiles"] = quantiles(data)
    
    return stats`}
          </SyntaxHighlighter>
          
          <p className="text-sm mb-1 text-blue-300 font-semibold">data_analysis.py</p>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`"""
Script d'analyse de données utilisant notre module d'utilitaires statistiques.
"""

import stats_utils as stats

# Données d'exemple (températures mensuelles moyennes)
temperatures = [14.2, 16.3, 18.0, 19.5, 22.1, 25.3, 28.2, 29.7, 26.4, 21.8, 18.5, 15.2]
mois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"]

# Analyse statistique
print("Analyse des températures mensuelles :\\n")
print(f"Nombre de mesures: {len(temperatures)}")
print(f"Température moyenne: {stats.mean(temperatures):.1f}°C")
print(f"Température médiane: {stats.median(temperatures):.1f}°C")
print(f"Écart-type: {stats.std_dev(temperatures):.2f}°C")

# Mois les plus chauds/froids
mois_temperature = list(zip(mois, temperatures))
mois_temperature_tries = sorted(mois_temperature, key=lambda x: x[1])

print("\\nMois les plus froids:")
for mois, temp in mois_temperature_tries[:3]:
    print(f"- {mois}: {temp}°C")

print("\\nMois les plus chauds:")
for mois, temp in reversed(mois_temperature_tries[-3:]):
    print(f"- {mois}: {temp}°C")

# Quartiles
quartiles = stats.quantiles(temperatures)
print("\\nQuartiles des températures:")
print(f"Q1 (25%): {quartiles[0.25]:.1f}°C")
print(f"Q2 (50%, médiane): {quartiles[0.5]:.1f}°C")
print(f"Q3 (75%): {quartiles[0.75]:.1f}°C")

# Statistiques complètes
toutes_stats = stats.summary_stats(temperatures)
print("\\nRésumé statistique complet:")
for stat, valeur in toutes_stats.items():
    if stat != "quartiles" and stat != "mode":  # Déjà affichés ou trop détaillés
        print(f"{stat}: {valeur}")`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Exercices pratiques</h3>
        
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800 mb-6">
          <h4 className="font-semibold mb-3">Exercice 1: Création d'une calculatrice de statistiques</h4>
          <p className="mb-2">Créez un module de fonctions statistiques et un script qui l'utilise pour analyser un ensemble de données.</p>
          
          <div className="mt-4 mb-2 font-semibold">Solution:</div>
          <p className="mb-2 text-sm text-blue-300">Fichier: stats_calculator.py</p>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-4">
            {`"""
Module de fonctions statistiques pour l'analyse de données.
"""

def moyenne(donnees):
    """Calcule la moyenne d'une liste de nombres."""
    return sum(donnees) / len(donnees)

def mediane(donnees):
    """Calcule la médiane d'une liste de nombres."""
    donnees_triees = sorted(donnees)
    n = len(donnees_triees)
    
    if n % 2 == 0:
        # Nombre pair d'éléments
        milieu1 = donnees_triees[n // 2 - 1]
        milieu2 = donnees_triees[n // 2]
        return (milieu1 + milieu2) / 2
    else:
        # Nombre impair d'éléments
        return donnees_triees[n // 2]

def ecart_type(donnees):
    """Calcule l'écart-type d'une liste de nombres."""
    moy = moyenne(donnees)
    variance = sum((x - moy) ** 2 for x in donnees) / len(donnees)
    return variance ** 0.5

def min_max_range(donnees):
    """Retourne le minimum, maximum et l'étendue d'une liste de nombres."""
    min_val = min(donnees)
    max_val = max(donnees)
    return min_val, max_val, max_val - min_val

def filtre_valeurs_aberrantes(donnees, seuil_ecarts=2):
    """
    Filtre les valeurs aberrantes selon la méthode des écarts-types.
    
    Args:
        donnees: Liste de nombres
        seuil_ecarts: Nombre d'écarts-types au-delà duquel une valeur est considérée aberrante
        
    Returns:
        Liste sans les valeurs aberrantes
    """
    moy = moyenne(donnees)
    et = ecart_type(donnees)
    limite_inf = moy - seuil_ecarts * et
    limite_sup = moy + seuil_ecarts * et
    
    return [x for x in donnees if limite_inf <= x <= limite_sup]`}
          </SyntaxHighlighter>
          
          <p className="mb-2 text-sm text-blue-300">Fichier: analyse_donnees.py</p>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`"""
Script d'analyse des données de vente
"""

import stats_calculator as sc

# Données de vente mensuelles (en milliers d'euros)
ventes = [120, 110, 145, 155, 170, 180, 190, 130, 140, 115, 300, 125]
mois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"]

# Affichage des statistiques de base
print("Analyse des ventes mensuelles:")
print("-" * 40)
print(f"Ventes moyennes: {sc.moyenne(ventes):.2f}k€")
print(f"Ventes médianes: {sc.mediane(ventes):.2f}k€")
print(f"Écart-type: {sc.ecart_type(ventes):.2f}k€")

min_val, max_val, plage = sc.min_max_range(ventes)
print(f"Ventes minimales: {min_val}k€")
print(f"Ventes maximales: {max_val}k€")
print(f"Plage des ventes: {plage}k€")

# Détection et filtrage des valeurs aberrantes
ventes_filtrees = sc.filtre_valeurs_aberrantes(ventes)
if len(ventes_filtrees) < len(ventes):
    print("\\nValeurs aberrantes détectées et supprimées:")
    for i, vente in enumerate(ventes):
        if vente not in ventes_filtrees:
            print(f"- {mois[i]}: {vente}k€")
    
    print("\\nStatistiques après suppression des valeurs aberrantes:")
    print(f"Ventes moyennes: {sc.moyenne(ventes_filtrees):.2f}k€")
    print(f"Ventes médianes: {sc.mediane(ventes_filtrees):.2f}k€")
    print(f"Écart-type: {sc.ecart_type(ventes_filtrees):.2f}k€")
else:
    print("\\nAucune valeur aberrante détectée.")`}
          </SyntaxHighlighter>
        </div>
        
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800 mb-6">
          <h4 className="font-semibold mb-3">Exercice 2: Fonction de prétraitement de données</h4>
          <p className="mb-2">Créez un ensemble de fonctions pour prétraiter des données textuelles, comme vous pourriez le faire en NLP ou en analyse de sentiments.</p>
          
          <div className="mt-4 mb-2 font-semibold">Solution:</div>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`"""
Module pour le prétraitement de texte.
"""

import re
import string
from collections import Counter

def nettoyer_texte(texte):
    """
    Nettoie un texte en supprimant la ponctuation et convertissant en minuscules.
    
    Args:
        texte (str): Le texte à nettoyer
        
    Returns:
        str: Le texte nettoyé
    """
    # Convertir en minuscules
    texte = texte.lower()
    
    # Supprimer la ponctuation
    texte = texte.translate(str.maketrans('', '', string.punctuation))
    
    # Remplacer les retours à la ligne et tabulations par des espaces
    texte = re.sub(r'\\s+', ' ', texte)
    
    return texte.strip()

def tokeniser(texte):
    """
    Divise un texte en mots (tokens).
    
    Args:
        texte (str): Le texte à tokeniser
        
    Returns:
        list: Liste des tokens
    """
    return texte.split()

def supprimer_mots_vides(tokens, mots_vides=None):
    """
    Supprime les mots vides (stop words) d'une liste de tokens.
    
    Args:
        tokens (list): Liste de tokens
        mots_vides (list): Liste des mots vides à supprimer
        
    Returns:
        list: Liste des tokens sans les mots vides
    """
    if mots_vides is None:
        # Liste basique de mots vides en français
        mots_vides = ['le', 'la', 'les', 'un', 'une', 'des', 'et', 'en', 'a', 'au', 'aux',
                     'de', 'du', 'dans', 'sur', 'pour', 'avec', 'ce', 'cette', 'ces',
                     'il', 'elle', 'ils', 'elles', 'je', 'tu', 'nous', 'vous', 'est',
                     'sont', 'qui', 'que', 'quoi', 'dont', 'où']
    
    return [token for token in tokens if token not in mots_vides]

def compter_frequence_mots(tokens):
    """
    Compte la fréquence de chaque mot dans une liste de tokens.
    
    Args:
        tokens (list): Liste de tokens
        
    Returns:
        Counter: Objet Counter avec les fréquences des mots
    """
    return Counter(tokens)

def traiter_texte_complet(texte, supprimer_stop_words=True, mots_vides=None):
    """
    Applique l'ensemble du pipeline de traitement à un texte.
    
    Args:
        texte (str): Le texte à traiter
        supprimer_stop_words (bool): Indique si les mots vides doivent être supprimés
        mots_vides (list): Liste personnalisée de mots vides
        
    Returns:
        tuple: (tokens nettoyés, fréquence des mots)
    """
    texte_nettoye = nettoyer_texte(texte)
    tokens = tokeniser(texte_nettoye)
    
    if supprimer_stop_words:
        tokens = supprimer_mots_vides(tokens, mots_vides)
    
    frequences = compter_frequence_mots(tokens)
    
    return tokens, frequences

# Exemple d'utilisation
if __name__ == "__main__":
    texte_exemple = """
    L'analyse de données est un processus d'inspection, de nettoyage, de transformation et de modélisation 
    des données dans le but de découvrir des informations utiles, de suggérer des conclusions et d'aider 
    à la prise de décision. L'analyse de données a de multiples facettes et approches, comprenant diverses 
    techniques sous des noms variés, et est utilisée dans différents domaines d'activité.
    """
    
    tokens, frequences = traiter_texte_complet(texte_exemple)
    
    print("Tokens nettoyés:")
    print(tokens[:10], "...")
    
    print("\\nMots les plus fréquents:")
    for mot, freq in frequences.most_common(5):
        print(f"{mot}: {freq}")`}
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

export default Fonctions;