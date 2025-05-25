import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Brain, Code, PlayCircle, Book, Trophy, ArrowLeft, RefreshCw, RotateCw, Lightbulb, Clock3, Terminal } from 'lucide-react';
import 'highlight.js/styles/atom-one-dark.css';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

// Import du reducer et des types
// Importer les défis préconstruits
import { getRandomChallenges, generateUniqueId } from '@/data/challenges';

// Les types sont maintenant importés depuis '@/types/dataIaTypes'

// Générateurs de code pour différents niveaux et langages
const codeGenerators = {
  python: {
    débutant: [
      () => ({
        code: `def calcul_somme(liste):
    total = 0
    for nombre in liste:
        if nombre > 0:
            total += nombre
    return total

resultat = calcul_somme([5, -3, 10, -1, 4, 2])
print(resultat)`,
        question: "Que va afficher ce code ?",
        responses: [
          { id: 'a', text: '21', isCorrect: true },
          { id: 'b', text: '17', isCorrect: false },
          { id: 'c', text: '11', isCorrect: false },
          { id: 'd', text: 'Une erreur', isCorrect: false }
        ],
        explanation: "Cette fonction calcule la somme des nombres positifs dans la liste. Elle parcourt chaque nombre et l'ajoute au total seulement s'il est supérieur à 0. Les nombres positifs sont 5, 10, 4 et 2, dont la somme est 21."
      }),
      () => ({
        code: `def inverser_chaine(texte):
    resultat = ""
    for i in range(len(texte) - 1, -1, -1):
        resultat += texte[i]
    return resultat

mot = "python"
print(inverser_chaine(mot))`,
        question: "Quel sera le résultat affiché ?",
        responses: [
          { id: 'a', text: 'nohtyp', isCorrect: true },
          { id: 'b', text: 'pythno', isCorrect: false },
          { id: 'c', text: 'ohtyp', isCorrect: false },
          { id: 'd', text: 'python', isCorrect: false }
        ],
        explanation: "Cette fonction inverse une chaîne de caractères. La boucle parcourt la chaîne de la fin (len(texte) - 1) au début (-1) avec un pas de -1. Chaque caractère est ajouté à la chaîne résultat, produisant ainsi l'inversion de 'python' en 'nohtyp'."
      }),
      () => ({
        code: `nombres = [1, 2, 3, 4, 5]
nouveaux_nombres = []

for nombre in nombres:
    if nombre % 2 == 0:
        nouveaux_nombres.append(nombre * 2)
    else:
        nouveaux_nombres.append(nombre)

print(nouveaux_nombres)`,
        question: "Quel sera le contenu de nouveaux_nombres ?",
        responses: [
          { id: 'a', text: '[1, 4, 3, 8, 5]', isCorrect: true },
          { id: 'b', text: '[2, 4, 6, 8, 10]', isCorrect: false },
          { id: 'c', text: '[1, 4, 3, 8, 10]', isCorrect: false },
          { id: 'd', text: '[2, 2, 6, 4, 10]', isCorrect: false }
        ],
        explanation: "Ce code parcourt la liste 'nombres' et, pour chaque nombre, vérifie s'il est pair (divisible par 2). Si c'est le cas, il double sa valeur avant de l'ajouter à la nouvelle liste. Sinon, il l'ajoute tel quel. Ainsi, 2 devient 4 et 4 devient 8, tandis que 1, 3 et 5 restent inchangés."
      })
    ],
    intermédiaire: [
      () => ({
        code: `import pandas as pd

def traitement_donnees(df):
    # Filtrer les lignes avec des valeurs manquantes
    df = df.dropna(subset=['prix'])
    
    # Calculer le prix moyen par catégorie
    prix_moyen = df.groupby('categorie')['prix'].mean()
    
    # Créer une nouvelle colonne avec le ratio prix / prix_moyen
    df['ratio'] = df.apply(lambda row: row['prix'] / prix_moyen[row['categorie']], axis=1)
    
    # Filtrer les produits dont le prix est > 20% du prix moyen
    resultat = df[df['ratio'] > 1.2]
    
    return resultat.sort_values('ratio', ascending=False)`,
        question: "Quelle est la fonctionnalité principale de ce code ?",
        responses: [
          { id: 'a', text: "Il identifie les produits dont le prix est au moins 20% supérieur à la moyenne de leur catégorie", isCorrect: true },
          { id: 'b', text: "Il calcule le prix moyen par catégorie", isCorrect: false },
          { id: 'c', text: "Il supprime les lignes avec des valeurs nulles dans la colonne 'prix'", isCorrect: false },
          { id: 'd', text: "Il calcule le ratio entre le prix de chaque produit et le prix moyen global", isCorrect: false }
        ],
        explanation: "Ce code effectue plusieurs opérations: il supprime d'abord les lignes avec des valeurs manquantes dans la colonne 'prix', puis calcule le prix moyen par catégorie, ensuite crée une colonne 'ratio' qui est le rapport entre le prix de chaque produit et le prix moyen de sa catégorie. Enfin, il filtre pour ne garder que les produits dont le prix est supérieur d'au moins 20% au prix moyen de leur catégorie (ratio > 1.2), et trie les résultats par ratio décroissant."
      }),
      () => ({
        code: `def mystere(liste):
    if not liste:
        return []
    return mystere([x for x in liste[1:] if x < liste[0]]) + [liste[0]] + mystere([x for x in liste[1:] if x >= liste[0]])

resultat = mystere([5, 3, 8, 1, 7, 2])
print(resultat)`,
        question: "Que fait cette fonction et que va afficher le code ?",
        responses: [
          { id: 'a', text: "Elle trie la liste dans l'ordre croissant et affiche [1, 2, 3, 5, 7, 8]", isCorrect: true },
          { id: 'b', text: "Elle trie la liste dans l'ordre décroissant et affiche [8, 7, 5, 3, 2, 1]", isCorrect: false },
          { id: 'c', text: "Elle retourne le premier élément et affiche [5]", isCorrect: false },
          { id: 'd', text: "Elle provoque une erreur de récursion infinie", isCorrect: false }
        ],
        explanation: "Cette fonction est une implémentation de l'algorithme de tri 'quicksort' (tri rapide) en utilisant la récursion. Elle prend le premier élément comme pivot, puis divise la liste restante en deux: les éléments plus petits que le pivot et les éléments plus grands ou égaux. Elle s'appelle ensuite récursivement sur ces deux sous-listes et combine les résultats avec le pivot au milieu. Le résultat final est [1, 2, 3, 5, 7, 8], qui est la liste triée par ordre croissant."
      }),
      () => ({
        code: `import numpy as np

def matrice_operations(matrice):
    # Calculer les statistiques par ligne
    moyennes_lignes = np.mean(matrice, axis=1)
    ecarts_types_lignes = np.std(matrice, axis=1)
    
    # Normaliser chaque ligne
    matrice_normalisee = np.zeros_like(matrice, dtype=float)
    for i in range(len(matrice)):
        matrice_normalisee[i] = (matrice[i] - moyennes_lignes[i]) / ecarts_types_lignes[i]
    
    # Calculer la matrice de covariance
    matrice_cov = np.cov(matrice_normalisee.T)
    
    # Trouver les valeurs propres et vecteurs propres
    valeurs_propres, vecteurs_propres = np.linalg.eig(matrice_cov)
    
    # Trier les valeurs propres et vecteurs propres
    idx = valeurs_propres.argsort()[::-1]
    valeurs_propres = valeurs_propres[idx]
    vecteurs_propres = vecteurs_propres[:, idx]
    
    return valeurs_propres, vecteurs_propres`,
        question: "Quelle technique d'analyse de données cette fonction implémente-t-elle ?",
        responses: [
          { id: 'a', text: "Analyse en composantes principales (ACP/PCA)", isCorrect: true },
          { id: 'b', text: "Régression linéaire multiple", isCorrect: false },
          { id: 'c', text: "K-means clustering", isCorrect: false },
          { id: 'd', text: "Transformation de Fourier", isCorrect: false }
        ],
        explanation: "Cette fonction implémente les étapes clés de l'Analyse en Composantes Principales (ACP ou PCA en anglais). Elle normalise d'abord les données (centrage et réduction), calcule la matrice de covariance, puis extrait les valeurs propres et vecteurs propres de cette matrice. Enfin, elle trie ces valeurs et vecteurs par ordre décroissant d'importance. Ces étapes correspondent exactement à la méthode PCA utilisée pour réduire la dimensionnalité des données tout en conservant la variance maximale."
      })
    ],
    avancé: [
      () => ({
        code: `def process_data(func):
    def wrapper(*args, **kwargs):
        try:
            result = func(*args, **kwargs)
            if isinstance(result, dict):
                # Filtrer les valeurs None
                return {k: v for k, v in result.items() if v is not None}
            return result
        except Exception as e:
            print(f"Erreur: {e}")
            return {}
    return wrapper

@process_data
def extract_user_data(user_input):
    if not user_input:
        raise ValueError("Entrée vide")
    
    data = {}
    fields = user_input.split(';')
    
    for field in fields:
        if ':' in field:
            key, value = field.split(':', 1)
            data[key.strip()] = value.strip() or None
    
    return data

# Utilisation
result1 = extract_user_data("nom: Dupont; age: 35; email:")
result2 = extract_user_data("")
print(result1)
print(result2)`,
        question: "Quelle problématique ce code résout-il principalement ?",
        responses: [
          { id: 'a', text: "Nettoyage et transformation de données entrées par l'utilisateur", isCorrect: true },
          { id: 'b', text: "Validation de formulaires HTML", isCorrect: false },
          { id: 'c', text: "Gestion des exceptions sans arrêter l'exécution", isCorrect: false },
          { id: 'd', text: "Mise en cache de résultats de fonction", isCorrect: false }
        ],
        explanation: "Ce code utilise un décorateur (@process_data) pour gérer les erreurs et nettoyer les résultats. La fonction extract_user_data parse une chaîne de caractères au format 'clé: valeur' séparée par des points-virgules, et les transforme en dictionnaire. Le décorateur gère les exceptions et supprime les valeurs None du dictionnaire résultant. Le premier appel va retourner {'nom': 'Dupont', 'age': '35'} (l'email étant vide, il est supprimé), et le second appel va capturer l'erreur d'entrée vide et retourner un dictionnaire vide {}."
      }),
      () => ({
        code: `class MemoizedFunction:
    def __init__(self, func):
        self.func = func
        self.cache = {}
        self.__name__ = func.__name__
        
    def __call__(self, *args):
        if args not in self.cache:
            self.cache[args] = self.func(*args)
        return self.cache[args]

def fibonacci(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo)
    return memo[n]

@MemoizedFunction
def fibonacci_memoized(n):
    if n <= 1:
        return n
    return fibonacci_memoized(n-1) + fibonacci_memoized(n-2)

import time

# Test de performance
start = time.time()
fibonacci(35)
print(f"fibonacci classique: {time.time() - start:.6f} secondes")

start = time.time()
fibonacci_memoized(35)
print(f"fibonacci memoized: {time.time() - start:.6f} secondes")`,
        question: "Quel est le problème principal dans l'implémentation de fibonacci avec le paramètre memo par défaut ?",
        responses: [
          { id: 'a', text: "Le dictionnaire memo est partagé entre tous les appels à fibonacci car il est initialisé une seule fois comme valeur par défaut", isCorrect: true },
          { id: 'b', text: "La récursion n'est pas correctement implémentée", isCorrect: false },
          { id: 'c', text: "La fonction fibonacci ne peut pas mémoriser les résultats précédents", isCorrect: false },
          { id: 'd', text: "L'algorithme est moins efficace que la version avec décorateur", isCorrect: false }
        ],
        explanation: "Le problème vient de l'utilisation d'un dictionnaire vide {} comme valeur par défaut du paramètre memo. En Python, les valeurs par défaut sont évaluées une seule fois à la définition de la fonction, et non à chaque appel. Ainsi, le même dictionnaire memo est réutilisé à travers tous les appels successifs à fibonacci. Cela peut donner des résultats inattendus si la fonction est appelée plusieurs fois avec des valeurs différentes, car le dictionnaire contiendra déjà des résultats précédents. C'est un piège classique en Python. La bonne pratique est d'utiliser None comme valeur par défaut et d'initialiser le dictionnaire dans le corps de la fonction."
      }),
      () => ({
        code: `import asyncio
import aiohttp
import time

async def fetch_url(session, url):
    try:
        start = time.time()
        async with session.get(url) as response:
            data = await response.text()
            duration = time.time() - start
            return {
                'url': url,
                'status': response.status,
                'size': len(data),
                'time': duration
            }
    except Exception as e:
        return {
            'url': url,
            'error': str(e)
        }

async def check_websites(urls, concurrency=5):
    start_time = time.time()
    connector = aiohttp.TCPConnector(ssl=False, limit=concurrency)
    
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = []
        # Créer les tâches pour chaque URL
        for url in urls:
            tasks.append(fetch_url(session, url))
        
        # Exécuter les tâches par lots de concurrency
        results = []
        for i in range(0, len(tasks), concurrency):
            batch = tasks[i:i+concurrency]
            batch_results = await asyncio.gather(*batch)
            results.extend(batch_results)
            
            # Pause optionnelle entre les lots
            if i + concurrency < len(tasks):
                await asyncio.sleep(0.5)
        
    total_time = time.time() - start_time
    return results, total_time

# Usage
urls = [
    'https://www.google.com',
    'https://www.github.com',
    'https://www.wikipedia.org',
    # ...plus d'URLs
]

results, total_time = asyncio.run(check_websites(urls))`,
        question: "Quel aspect de programmation asynchrone ce code illustre-t-il de manière problématique ?",
        responses: [
          { id: 'a', text: "Il limite artificiellement la concurrence en traitant les URLs par lots, annulant certains avantages de l'asynchrone", isCorrect: true },
          { id: 'b', text: "Il ne gère pas correctement les exceptions dans la fonction fetch_url", isCorrect: false },
          { id: 'c', text: "Il n'utilise pas asyncio.gather pour exécuter les tâches en parallèle", isCorrect: false },
          { id: 'd', text: "Il ne ferme pas correctement les sessions HTTP", isCorrect: false }
        ],
        explanation: "Le code limite artificiellement la concurrence de deux façons. Premièrement, il traite les URLs par lots de taille concurrency, en appelant asyncio.gather sur chaque lot séparément, alors qu'il pourrait appeler asyncio.gather une seule fois avec toutes les tâches. Deuxièmement, il introduit un délai explicite (asyncio.sleep(0.5)) entre les lots, ralentissant encore l'exécution. Cela annule une grande partie des avantages de la programmation asynchrone, qui est conçue pour traiter efficacement de nombreuses tâches I/O-bound simultanément. La session et le connecteur sont correctement gérés avec des context managers, et les exceptions sont bien capturées dans fetch_url."
      })
    ]
  },
  sql: {
    débutant: [
      () => ({
        code: `SELECT 
  p.nom,
  p.prix,
  c.nom AS categorie
FROM produits p
JOIN categories c ON p.categorie_id = c.id
WHERE p.prix > 100
ORDER BY p.prix DESC
LIMIT 5;`,
        question: "Que fait cette requête SQL ?",
        responses: [
          { id: 'a', text: "Elle retourne les 5 produits les plus chers dont le prix est supérieur à 100", isCorrect: true },
          { id: 'b', text: "Elle retourne les 5 premiers produits de chaque catégorie", isCorrect: false },
          { id: 'c', text: "Elle retourne tous les produits dont le prix est supérieur à 100", isCorrect: false },
          { id: 'd', text: "Elle joint les tables sans condition particulière", isCorrect: false }
        ],
        explanation: "Cette requête sélectionne le nom et le prix des produits ainsi que le nom de leur catégorie, en joignant les tables 'produits' et 'categories'. Elle filtre pour ne garder que les produits dont le prix est supérieur à 100, les trie par prix décroissant, et limite le résultat aux 5 premiers produits de cette liste triée."
      }),
      () => ({
        code: `SELECT 
  client_id,
  COUNT(*) AS nombre_commandes,
  SUM(montant) AS total_achats,
  AVG(montant) AS panier_moyen
FROM commandes
WHERE date_commande >= '2023-01-01'
GROUP BY client_id
HAVING COUNT(*) > 1
ORDER BY total_achats DESC;`,
        question: "Que fait cette requête SQL ?",
        responses: [
          { id: 'a', text: "Elle liste les clients qui ont passé au moins 2 commandes en 2023, avec leurs statistiques d'achat", isCorrect: true },
          { id: 'b', text: "Elle affiche le montant total des achats pour chaque client", isCorrect: false },
          { id: 'c', text: "Elle calcule le panier moyen pour toutes les commandes de 2023", isCorrect: false },
          { id: 'd', text: "Elle compte le nombre de commandes par client sans aucun filtre", isCorrect: false }
        ],
        explanation: "Cette requête effectue une analyse des clients ayant passé des commandes en 2023. Elle calcule pour chaque client le nombre de commandes (COUNT), le montant total des achats (SUM) et le panier moyen (AVG). La clause WHERE filtre uniquement les commandes passées à partir du 1er janvier 2023. La clause HAVING filtre ensuite pour ne conserver que les clients ayant passé plus d'une commande. Enfin, les résultats sont triés par montant total d'achats décroissant."
      }),
      () => ({
        code: `SELECT 
  e.nom, 
  e.prenom,
  d.nom AS departement,
  e.salaire,
  AVG(e.salaire) OVER (PARTITION BY d.id) AS salaire_moyen_departement
FROM employes e
JOIN departements d ON e.departement_id = d.id
WHERE e.date_embauche < '2023-01-01'
ORDER BY d.nom, e.salaire DESC;`,
        question: "Que fait cette requête SQL ?",
        responses: [
          { id: 'a', text: "Elle affiche les employés embauchés avant 2023 avec leur salaire et le salaire moyen de leur département", isCorrect: true },
          { id: 'b', text: "Elle calcule uniquement le salaire moyen par département", isCorrect: false },
          { id: 'c', text: "Elle trie tous les employés par département sans aucun filtre", isCorrect: false },
          { id: 'd', text: "Elle sélectionne les employés dont le salaire est supérieur à la moyenne de leur département", isCorrect: false }
        ],
        explanation: "Cette requête utilise une fonction de fenêtrage (window function) avec OVER et PARTITION BY pour calculer le salaire moyen par département tout en affichant les informations individuelles de chaque employé. La requête filtre les employés embauchés avant le 1er janvier 2023, puis affiche leur nom, prénom, département et salaire, ainsi que le salaire moyen de leur département. Les résultats sont triés par nom de département, puis par salaire décroissant au sein de chaque département."
      })
    ],
    intermédiaire: [
      () => ({
        code: `WITH VentesMensuelles AS (
  SELECT 
    EXTRACT(YEAR FROM date_vente) AS annee,
    EXTRACT(MONTH FROM date_vente) AS mois,
    SUM(montant) AS total_ventes
  FROM ventes
  WHERE date_vente >= '2023-01-01' AND date_vente < '2024-01-01'
  GROUP BY EXTRACT(YEAR FROM date_vente), EXTRACT(MONTH FROM date_vente)
),
EvolutionMensuelle AS (
  SELECT
    annee,
    mois,
    total_ventes,
    LAG(total_ventes) OVER (ORDER BY annee, mois) AS ventes_mois_precedent
  FROM VentesMensuelles
)
SELECT
  annee,
  mois,
  total_ventes,
  ventes_mois_precedent,
  CASE
    WHEN ventes_mois_precedent IS NULL THEN 0
    ELSE ROUND(((total_ventes - ventes_mois_precedent) / ventes_mois_precedent) * 100, 2)
  END AS evolution_pourcentage
FROM EvolutionMensuelle
ORDER BY annee, mois;`,
        question: "Quel est l'objectif principal de cette requête SQL ?",
        responses: [
          { id: 'a', text: "Calculer le pourcentage d'évolution des ventes mois par mois en 2023", isCorrect: true },
          { id: 'b', text: "Calculer le total des ventes pour 2023", isCorrect: false },
          { id: 'c', text: "Comparer les ventes mensuelles de 2023 avec celles de 2022", isCorrect: false },
          { id: 'd', text: "Identifier le mois avec les ventes les plus élevées en 2023", isCorrect: false }
        ],
        explanation: "Cette requête utilise des expressions de table communes (CTEs) et des fonctions de fenêtrage pour calculer l'évolution mensuelle des ventes en 2023. La première CTE 'VentesMensuelles' calcule le total des ventes par mois. La seconde CTE 'EvolutionMensuelle' utilise la fonction LAG() pour récupérer le montant des ventes du mois précédent. Enfin, la requête principale calcule le pourcentage d'évolution entre chaque mois consécutif, et affiche ces données triées par année et mois."
      }),
      () => ({
        code: `WITH MonthlyRevenue AS (
  SELECT
    DATE_TRUNC('month', order_date) AS month,
    p.category,
    SUM(oi.quantity * oi.unit_price) AS revenue
  FROM order_items oi
  JOIN products p ON oi.product_id = p.id
  JOIN orders o ON oi.order_id = o.id
  WHERE order_date >= '2023-01-01' AND order_date < '2024-01-01'
  GROUP BY DATE_TRUNC('month', order_date), p.category
),
CategoryTotals AS (
  SELECT
    month,
    category,
    revenue,
    SUM(revenue) OVER (PARTITION BY month) AS total_monthly_revenue
  FROM MonthlyRevenue
)
SELECT
  TO_CHAR(month, 'Month YYYY') AS month_name,
  category,
  ROUND(revenue, 2) AS category_revenue,
  ROUND(total_monthly_revenue, 2) AS total_revenue,
  ROUND((revenue / total_monthly_revenue) * 100, 2) AS percentage_of_monthly
FROM CategoryTotals
ORDER BY month, percentage_of_monthly DESC;`,
        question: "Que permet d'analyser cette requête SQL ?",
        responses: [
          { id: 'a', text: "La contribution en pourcentage de chaque catégorie au chiffre d'affaires mensuel", isCorrect: true },
          { id: 'b', text: "L'évolution du chiffre d'affaires par mois", isCorrect: false },
          { id: 'c', text: "La catégorie qui a généré le plus de revenus sur l'année entière", isCorrect: false },
          { id: 'd', text: "Les produits les plus vendus par catégorie", isCorrect: false }
        ],
        explanation: "Cette requête analyse la contribution de chaque catégorie de produits au chiffre d'affaires mensuel. La première CTE 'MonthlyRevenue' calcule le chiffre d'affaires par mois et par catégorie. La seconde CTE 'CategoryTotals' utilise une fonction de fenêtrage pour calculer le chiffre d'affaires total de chaque mois. Enfin, la requête principale calcule le pourcentage que représente chaque catégorie dans le chiffre d'affaires mensuel total, et trie les résultats par mois puis par pourcentage décroissant."
      }),
      () => ({
        code: `WITH RecursiveManagers AS (
  -- Cas de base : tous les employés
  SELECT 
    id, 
    nom, 
    prenom, 
    manager_id, 
    titre, 
    salaire,
    0 AS niveau_hierarchique
  FROM employes
  WHERE manager_id IS NULL  -- Démarrer avec les employés sans manager (dirigeants)
  
  UNION ALL
  
  -- Cas récursif : tous les subordonnés directs
  SELECT 
    e.id, 
    e.nom, 
    e.prenom, 
    e.manager_id, 
    e.titre, 
    e.salaire,
    rm.niveau_hierarchique + 1
  FROM employes e
  JOIN RecursiveManagers rm ON e.manager_id = rm.id
)
SELECT 
  id,
  CONCAT(REPEAT('    ', niveau_hierarchique), nom, ' ', prenom) AS employe,
  titre,
  niveau_hierarchique,
  salaire,
  ROUND(AVG(salaire) OVER (PARTITION BY niveau_hierarchique), 2) AS salaire_moyen_niveau
FROM RecursiveManagers
ORDER BY niveau_hierarchique, salaire DESC;`,
        question: "Quelle technique SQL avancée cette requête illustre-t-elle ?",
        responses: [
          { id: 'a', text: "Requête récursive (WITH RECURSIVE) pour générer une hiérarchie d'employés", isCorrect: true },
          { id: 'b', text: "Jointure externe pour inclure tous les employés", isCorrect: false },
          { id: 'c', text: "Sous-requêtes corrélées pour calculer les statistiques", isCorrect: false },
          { id: 'd', text: "Opération de type PIVOT pour transformer les données", isCorrect: false }
        ],
        explanation: "Cette requête utilise une expression de table commune récursive (WITH RECURSIVE) pour générer un organigramme hiérarchique des employés. Elle démarre avec les employés de plus haut niveau (sans manager) comme cas de base, puis utilise la récursivité pour ajouter les subordonnés niveau par niveau. Pour chaque employé, elle calcule son niveau hiérarchique. La requête principale formate ensuite les noms avec une indentation proportionnelle au niveau hiérarchique, et calcule le salaire moyen par niveau. C'est une technique puissante pour représenter et analyser des structures de données hiérarchiques en SQL."
      })
    ],
    avancé: [
      () => ({
        code: `WITH ClientsActifs AS (
  SELECT
    client_id,
    MAX(date_transaction) AS derniere_transaction,
    COUNT(*) AS nb_transactions,
    SUM(montant) AS total_achats
  FROM transactions
  WHERE date_transaction >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY client_id
),
Stats AS (
  SELECT
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY total_achats) AS q1,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_achats) AS mediane,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY total_achats) AS q3,
    AVG(total_achats) AS moyenne,
    COUNT(*) AS nb_clients
  FROM ClientsActifs
),
ClientsSegments AS (
  SELECT
    c.client_id,
    c.total_achats,
    CASE
      WHEN c.total_achats > s.q3 + (s.q3 - s.q1) * 1.5 THEN 'Premium'
      WHEN c.total_achats > s.mediane THEN 'Standard+'
      WHEN c.total_achats > s.q1 THEN 'Standard'
      ELSE 'Basique'
    END AS segment,
    c.nb_transactions,
    c.derniere_transaction,
    CURRENT_DATE - c.derniere_transaction AS jours_depuis_dernier_achat
  FROM ClientsActifs c, Stats s
)
SELECT
  segment,
  COUNT(*) AS nb_clients,
  ROUND(AVG(total_achats), 2) AS panier_moyen,
  ROUND(AVG(nb_transactions), 1) AS transactions_moyenne,
  ROUND(AVG(jours_depuis_dernier_achat), 0) AS recence_moyenne
FROM ClientsSegments
GROUP BY segment
ORDER BY panier_moyen DESC;`,
        question: "Quelle technique avancée est illustrée par cette requête SQL ?",
        responses: [
          { id: 'a', text: "Segmentation de clients basée sur des métriques statistiques (méthode RFM)", isCorrect: true },
          { id: 'b', text: "Calcul de prévisions de ventes par régression linéaire", isCorrect: false },
          { id: 'c', text: "Détection de fraudes par analyse d'anomalies", isCorrect: false },
          { id: 'd', text: "Clustering de produits par similarité d'achat", isCorrect: false }
        ],
        explanation: "Cette requête met en œuvre une segmentation de clients basée sur des métriques statistiques (similaire à la méthode RFM - Récence, Fréquence, Montant). La requête utilise des CTEs successives pour: (1) identifier les clients actifs des 12 derniers mois avec leurs métriques, (2) calculer des statistiques globales comme les quartiles et la moyenne, (3) segmenter les clients en catégories 'Premium', 'Standard+', 'Standard' ou 'Basique' selon leur position par rapport aux quartiles, avec une détection spécifique pour les clients premium (outliers). Enfin, elle agrège les résultats par segment pour obtenir des statistiques de groupe."
      }),
      () => ({
        code: `-- Création d'un index composite incluant pour optimiser une requête fréquente
CREATE INDEX idx_orders_customer_date ON orders (customer_id, order_date DESC)
INCLUDE (status, total_amount);

-- Création d'une vue matérialisée avec rafraîchissement automatique
CREATE MATERIALIZED VIEW monthly_sales_summary
WITH (autovacuum_enabled=true)
AS
SELECT 
  date_trunc('month', order_date) AS month,
  product_category,
  SUM(quantity) AS total_quantity,
  SUM(quantity * unit_price) AS total_revenue
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN products p ON oi.product_id = p.id
WHERE order_date >= date_trunc('month', current_date - interval '12 months')
GROUP BY date_trunc('month', order_date), product_category
WITH NO DATA;

-- Configuration pour rafraîchir la vue toutes les heures
CREATE OR REPLACE FUNCTION refresh_monthly_sales_summary()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_sales_summary;
  RETURN NULL;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_refresh_monthly_sales_summary
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_monthly_sales_summary();`,
        question: "Quel aspect de l'optimisation SQL ce code met-il principalement en évidence ?",
        responses: [
          { id: 'a', text: "La maintenance proactive de vues matérialisées pour accélérer les rapports analytiques fréquents", isCorrect: true },
          { id: 'b', text: "L'utilisation d'index pour accélérer les requêtes", isCorrect: false },
          { id: 'c', text: "La configuration des paramètres d'autovacuum de PostgreSQL", isCorrect: false },
          { id: 'd', text: "L'utilisation de déclencheurs (triggers) pour maintenir l'intégrité des données", isCorrect: false }
        ],
        explanation: "Ce script SQL illustre une stratégie d'optimisation des performances pour les requêtes analytiques fréquentes, centrée sur l'utilisation de vues matérialisées. Une vue matérialisée stocke le résultat précalculé d'une requête complexe (ici un résumé mensuel des ventes), évitant de recalculer ce résultat à chaque consultation. Le code met en place un système complet pour maintenir cette vue à jour automatiquement : (1) création d'un index composite pour optimiser les accès, (2) création d'une vue matérialisée avec paramètres d'optimisation, (3) fonction et déclencheur pour rafraîchir la vue après chaque modification de la table orders. C'est une technique avancée pour équilibrer performance et fraîcheur des données dans un système analytique."
      }),
      () => ({
        code: `-- Fonction analytique pour identifier les fraudes potentielles
CREATE OR REPLACE FUNCTION detect_suspicious_transactions()
RETURNS TABLE (
    transaction_id INTEGER,
    user_id INTEGER,
    amount NUMERIC,
    transaction_date TIMESTAMP,
    risk_score NUMERIC,
    risk_factors TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH UserStats AS (
        -- Statistiques par utilisateur
        SELECT
            user_id,
            AVG(amount) AS avg_amount,
            STDDEV(amount) AS stddev_amount,
            COUNT(*) AS tx_count,
            MAX(amount) AS max_amount,
            MAX(transaction_date) - MIN(transaction_date) AS account_age
        FROM transactions
        WHERE transaction_date > NOW() - INTERVAL '6 months'
        GROUP BY user_id
    ),
    GeoAnomalies AS (
        -- Détection d'anomalies géographiques
        SELECT
            t.transaction_id,
            t.user_id,
            t.amount,
            t.transaction_date,
            t.ip_address,
            t.location,
            LAG(t.location) OVER (PARTITION BY t.user_id ORDER BY t.transaction_date) AS prev_location,
            LAG(t.transaction_date) OVER (PARTITION BY t.user_id ORDER BY t.transaction_date) AS prev_date
        FROM transactions t
        WHERE t.transaction_date > NOW() - INTERVAL '30 days'
    ),
    RiskScores AS (
        -- Calcul des scores de risque
        SELECT
            t.transaction_id,
            t.user_id,
            t.amount,
            t.transaction_date,
            -- Score principal basé sur plusieurs facteurs
            (
                CASE
                    -- Montant anormalement élevé pour cet utilisateur
                    WHEN t.amount > us.avg_amount + us.stddev_amount * 3 THEN 50
                    WHEN t.amount > us.avg_amount + us.stddev_amount * 2 THEN 30
                    WHEN t.amount > us.avg_amount + us.stddev_amount THEN 10
                    ELSE 0
                END +
                -- Changement géographique rapide (impossible physiquement)
                CASE
                    WHEN ga.prev_location IS NOT NULL AND
                         ga.location <> ga.prev_location AND
                         ga.transaction_date - ga.prev_date < INTERVAL '2 hours'
                    THEN 60
                    ELSE 0
                END +
                -- Transaction à haut risque pendant la nuit
                CASE
                    WHEN EXTRACT(HOUR FROM t.transaction_date) BETWEEN 1 AND 5 AND
                         t.amount > us.avg_amount
                    THEN 20
                    ELSE 0
                END
            ) AS risk_score,
            -- Facteurs de risque identifiés
            ARRAY_REMOVE(ARRAY[
                CASE WHEN t.amount > us.avg_amount + us.stddev_amount * 2 THEN 'Montant anormal' ELSE NULL END,
                CASE WHEN ga.prev_location IS NOT NULL AND
                          ga.location <> ga.prev_location AND
                          ga.transaction_date - ga.prev_date < INTERVAL '2 hours'
                     THEN 'Changement géographique suspect' 
                     ELSE NULL 
                END,
                CASE WHEN EXTRACT(HOUR FROM t.transaction_date) BETWEEN 1 AND 5 AND
                          t.amount > us.avg_amount
                     THEN 'Transaction nocturne inhabituelle' 
                     ELSE NULL 
                END
            ], NULL) AS risk_factors
        FROM transactions t
        JOIN UserStats us ON t.user_id = us.user_id
        LEFT JOIN GeoAnomalies ga ON t.transaction_id = ga.transaction_id
        WHERE t.transaction_date > NOW() - INTERVAL '7 days'
    )
    SELECT
        transaction_id,
        user_id,
        amount,
        transaction_date,
        risk_score,
        risk_factors
    FROM RiskScores
    WHERE risk_score > 30
    ORDER BY risk_score DESC, transaction_date DESC;
END;
$$ LANGUAGE plpgsql;`,
        question: "Quelle approche avancée d'analyse de données cette fonction SQL illustre-t-elle ?",
        responses: [
          { id: 'a', text: "Détection de fraude multifactorielle basée sur des anomalies statistiques et comportementales", isCorrect: true },
          { id: 'b', text: "Analyse prédictive par apprentissage automatique", isCorrect: false },
          { id: 'c', text: "Segmentation des utilisateurs par clusters", isCorrect: false },
          { id: 'd', text: "Optimisation des requêtes par partitionnement", isCorrect: false }
        ],
        explanation: "Cette fonction SQL implémente un système sophistiqué de détection de fraudes basé sur plusieurs facteurs de risque. Elle utilise plusieurs techniques avancées : (1) Calcul statistique par utilisateur pour établir des profils comportementaux (moyennes, écarts-types), (2) Détection d'anomalies géographiques avec la fonction de fenêtrage LAG() pour identifier des changements impossibles physiquement, (3) Analyse temporelle pour détecter des comportements suspects (transactions nocturnes), (4) Attribution de scores de risque pondérés selon la gravité des anomalies, (5) Collecte détaillée des facteurs de risque dans un tableau. Cette approche multifactorielle permet une détection de fraude nuancée qui réduit les faux positifs tout en capturant différents schémas de fraude."
      })
    ]
  }
};

// Composant d'affichage de code avec syntaxe highlighting
const CodeDisplay = ({ code, language }: { code: string, language: string }) => {
  return (
    <div className="rounded-md bg-black/90 p-4 my-4 relative font-mono text-sm overflow-auto">
      <div className="absolute top-2 right-3 px-2 py-1 bg-blue-700/70 rounded-md text-xs text-white font-semibold uppercase">
        {language}
      </div>
      <pre className="text-gray-200 max-h-[400px] overflow-y-auto">
        <code>
          {code.split('\n').map((line, index) => (
            <div key={index} className="py-0.5">
              <span className="text-gray-500 mr-4 select-none w-8 inline-block text-right">{index + 1}</span>
              <span>{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
};

// Composant principal
const ReadMeIfYouCan = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'sql'>('python');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'débutant' | 'intermédiaire' | 'avancé'>('intermédiaire');
  const [selectedMode, setSelectedMode] = useState<'normal' | 'analyse' | 'défense' | 'vitesse'>('normal');

  const [currentChallenge, setCurrentChallenge] = useState<CodeChallenge | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userJustification, setUserJustification] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [hintRequested, setHintRequested] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  // Nous n'utilisons plus le système d'échecs consécutifs
  
  // Cache pour les défis déjà présentés à l'utilisateur (évite les répétitions)
  const [challengeCache, setChallengeCache] = useState({
    python: {
      débutant: [],
      intermédiaire: [],
      avancé: []
    },
    sql: {
      débutant: [],
      intermédiaire: [],
      avancé: []
    }
  });
  
  // Fonction pour récupérer un nouveau challenge, prioritairement depuis les défis préconstruits
  const fetchNewChallenge = async () => {
    setIsLoading(true);
    setShowResult(false);
    setSelectedAnswer(null);
    setUserJustification('');
    setHintRequested(false);
    
    try {
      // 1. Récupérer des défis préconstruits
      console.log("Récupération de défis préconstruits");
      const prebuiltChallenges = getRandomChallenges(
        selectedLanguage as 'python' | 'sql', 
        selectedDifficulty as 'débutant' | 'intermédiaire' | 'avancé', 
        1
      );
      
      // Filtrer les défis déjà vus
      const completedChallengeIds = challengeCache[selectedLanguage][selectedDifficulty].map(c => c.id);
      const newChallenges = prebuiltChallenges.filter(c => !completedChallengeIds.includes(c.id));
      
      if (newChallenges.length > 0) {
        // Utiliser le premier défi
        const challenge = newChallenges[0];
        
        // Mettre à jour le challenge courant
        setCurrentChallenge(challenge);
        
        // Ajouter le défi au cache pour éviter de le répéter
        setChallengeCache(prevCache => ({
          ...prevCache,
          [selectedLanguage]: {
            ...prevCache[selectedLanguage],
            [selectedDifficulty]: [
              ...prevCache[selectedLanguage][selectedDifficulty],
              challenge
            ]
          }
        }));
        
        // Incrémenter le compteur de questions
        setQuestionCount(prev => prev + 1);
        
        // Si mode vitesse, initialiser le timer
        if (selectedMode === 'vitesse') {
          setTimeLeft(30);
          setTimerActive(true);
        }
        
        return;
      }
      
      // 2. Si tous les défis préconstruits ont été utilisés, réinitialiser le cache
      if (completedChallengeIds.length > 0) {
        console.log("Tous les défis préconstruits ont été utilisés, réinitialisation du cache");
        setChallengeCache(prevCache => ({
          ...prevCache,
          [selectedLanguage]: {
            ...prevCache[selectedLanguage],
            [selectedDifficulty]: []
          }
        }));
        
        // Récupérer un nouveau défi après réinitialisation
        const resetChallenges = getRandomChallenges(
          selectedLanguage as 'python' | 'sql', 
          selectedDifficulty as 'débutant' | 'intermédiaire' | 'avancé', 
          1
        );
        
        if (resetChallenges.length > 0) {
          setCurrentChallenge(resetChallenges[0]);
          setQuestionCount(prev => prev + 1);
          
          if (selectedMode === 'vitesse') {
            setTimeLeft(30);
            setTimerActive(true);
          }
          
          return;
        }
      }
      
      // 3. Si aucun défi préconstruit n'est disponible, utiliser l'API comme fallback
      console.log("Aucun défi préconstruit disponible, appel à l'API");
      const response = await fetch('/api/data-ia/generate-code-challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: selectedLanguage,
          difficulty: selectedDifficulty,
          mode: selectedMode,
          timestamp: Date.now()
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la génération du challenge");
      }
      
      const data = await response.json();
      
      if (!data.success || !data.challenge) {
        throw new Error("Format de réponse invalide");
      }
      
      // Ajouter un ID unique au défi généré par l'API
      const challenge = {
        ...data.challenge,
        id: generateUniqueId(`${selectedLanguage}-${selectedDifficulty}`)
      };
      
      // Mettre à jour le challenge avec celui généré par l'API
      setCurrentChallenge(challenge);
      setQuestionCount(prev => prev + 1);
      
      // Si mode vitesse, initialiser le timer
      if (selectedMode === 'vitesse') {
        setTimeLeft(30);
        setTimerActive(true);
      }
    } catch (error) {
      console.error("Erreur lors de la génération du challenge:", error);
      
      toast({
        title: "Erreur",
        description: "Impossible de générer un nouveau challenge. Veuillez réessayer.",
        variant: "destructive",
      });
      
      // Tenter d'utiliser un défi préconstruit de secours si l'API échoue
      const fallbackChallenges = getRandomChallenges(
        selectedLanguage as 'python' | 'sql', 
        selectedDifficulty as 'débutant' | 'intermédiaire' | 'avancé', 
        1
      );
      
      if (fallbackChallenges.length > 0) {
        toast({
          title: "Information",
          description: "Utilisation d'un défi de secours suite à l'erreur.",
          variant: "default",
        });
        
        setCurrentChallenge(fallbackChallenges[0]);
        setQuestionCount(prev => prev + 1);
        
        if (selectedMode === 'vitesse') {
          setTimeLeft(30);
          setTimerActive(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };



  // Récupérer un indice pour le challenge actuel
  const getHint = () => {
    setHintRequested(true);
    
    if (!currentChallenge) return;
    
    if (!currentChallenge.hint) {
      // Générer un indice en fonction du langage et du niveau
      if (currentChallenge.language === 'python') {
        toast({
          title: "Indice",
          description: "Regardez attentivement les structures de contrôle et la façon dont les données sont manipulées.",
          variant: "default",
        });
      } else {
        toast({
          title: "Indice",
          description: "Analysez les jointures et les conditions de filtrage pour comprendre quelles données sont sélectionnées.",
          variant: "default",
        });
      }
    } else {
      toast({
        title: "Indice",
        description: currentChallenge.hint,
        variant: "default",
      });
    }
  };

  // Analyser la justification fournie par l'utilisateur
  const analyzeJustification = async (justification: string, isCorrectAnswer: boolean): Promise<{
    isValid: boolean;
    feedback: string;
  }> => {
    // Pour les réponses incorrectes, la justification n'est pas analysée
    if (!isCorrectAnswer) {
      return { isValid: false, feedback: "La réponse sélectionnée est incorrecte." };
    }
    
    // Pour les niveaux débutant ou le mode vitesse, pas d'analyse de justification
    if (selectedDifficulty === 'débutant' || selectedMode === 'vitesse') {
      return { isValid: true, feedback: "Bravo, votre réponse est correcte !" };
    }
    
    // Justification trop courte est considérée comme insuffisante
    if (justification.length < 20) {
      return { 
        isValid: false, 
        feedback: "Votre justification est trop courte pour être pertinente. Veuillez expliquer votre raisonnement de façon plus détaillée."
      };
    }

    try {
      // Tentative d'analyse via l'API
      const response = await fetch('/api/data-ia/analyze-justification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          justification,
          challenge: currentChallenge,
          selectedAnswer
        }),
      });
      
      if (!response.ok) {
        // Si l'API échoue, utiliser une validation locale simple basée sur la longueur
        console.warn("Impossible d'analyser la justification via l'API, utilisation d'une validation simplifiée");
        const isLongEnough = justification.length >= 50;
        return { 
          isValid: isLongEnough, 
          feedback: isLongEnough
            ? "Votre justification semble pertinente."
            : "Votre justification manque de détails pour démontrer votre compréhension."
        };
      }
      
      const result = await response.json();
      return {
        isValid: result.isValid,
        feedback: result.feedback || (result.isValid 
          ? "Votre justification est pertinente et démontre une bonne compréhension."
          : "Votre justification ne semble pas correspondre à la bonne réponse.")
      };
    } catch (error) {
      console.error("Erreur lors de l'analyse de la justification:", error);
      // En cas d'erreur, validation basique basée sur la longueur
      const isLongEnough = justification.length >= 50;
      return { 
        isValid: isLongEnough, 
        feedback: isLongEnough
          ? "Votre justification semble pertinente."
          : "Votre justification manque de détails pour démontrer votre compréhension."
      };
    }
  };
  
  // Soumettre la réponse
  const submitAnswer = async () => {
    if (!selectedAnswer) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner une réponse avant de soumettre.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedDifficulty !== 'débutant' && selectedMode !== 'vitesse' && !userJustification.trim()) {
      toast({
        title: "Justification requise",
        description: "Veuillez expliquer votre raisonnement avant de soumettre.",
        variant: "destructive",
      });
      return;
    }
    
    // Désactiver le bouton pendant la vérification
    setIsLoading(true);
    
    // Arrêter le timer si actif
    if (timerActive) {
      setTimerActive(false);
    }
    
    // Vérifier si la réponse est correcte
    const selectedResponse = currentChallenge?.responses.find(r => r.id === selectedAnswer);
    const isCorrect = selectedResponse?.isCorrect || false;
    
    // Analyser la justification si nécessaire
    let justificationValid = true;
    let justificationFeedback = "";
    
    if (selectedDifficulty !== 'débutant' && selectedMode !== 'vitesse' && isCorrect) {
      const analysis = await analyzeJustification(userJustification, isCorrect);
      justificationValid = analysis.isValid;
      justificationFeedback = analysis.feedback;
    }
    
    // Considérer la réponse comme correcte uniquement si la réponse ET la justification sont correctes
    const isOverallCorrect = isCorrect && justificationValid;
    
    // Mettre à jour le score uniquement
    if (isOverallCorrect) {
      setScore(prev => prev + 1);
    }
    
    // Afficher le résultat
    setShowResult(true);
    setIsLoading(false);
    
    // Notification selon le résultat
    if (!isCorrect) {
      // Notification pour réponse incorrecte
      toast({
        title: "Incorrect !",
        description: "Votre réponse n'est pas correcte. Consultez l'explication.",
        variant: "destructive",
      });
    } else if (!justificationValid) {
      // Notification pour justification incorrecte
      toast({
        title: "Justification insuffisante",
        description: justificationFeedback,
        variant: "destructive",
      });
    } else {
      // Notification pour réponse et justification correctes
      toast({
        title: "Correct !",
        description: "Bravo, votre réponse et votre justification sont correctes !",
        variant: "default",
      });
    }
  };

  // Effet pour gérer le compte à rebours
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (timerActive && timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      setTimerActive(false);
      toast({
        title: "Temps écoulé !",
        description: "Vous n'avez pas répondu à temps.",
        variant: "destructive",
      });
      submitAnswer();
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerActive, timeLeft]);
  
  // Charger un challenge au montage du composant (une seule fois)
  useEffect(() => {
    // Utiliser une référence pour s'assurer que le chargement n'est fait qu'une seule fois
    if (questionCount === 0) {
      fetchNewChallenge();
    }
  }, [questionCount]);

  return (
    <div className={`min-h-screen ${highContrastMode ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-900 to-blue-950'}`}>
      <header className="py-6 border-b border-blue-700/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/data-ia/roleplay')}
                className="text-white hover:text-blue-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <h1 className="text-2xl font-bold text-white ml-4 font-data-title flex items-center">
                <Code className="mr-2 h-6 w-6 text-cyan-400" />
                Je suis Consultant Data & IA
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="contrast-mode"
                  checked={highContrastMode}
                  onCheckedChange={setHighContrastMode}
                />
                <Label htmlFor="contrast-mode" className="text-white text-sm">Mode contraste élevé</Label>
              </div>
              
              <Badge className="bg-cyan-600 hover:bg-cyan-700">
                Score: {score}/{questionCount}
              </Badge>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Layout à deux colonnes : Configuration à gauche, Challenge à droite */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Colonne de gauche - Configuration et Infos */}
          <div className="lg:w-1/4 space-y-6">
            {/* Paramètres du jeu */}
            <Card className={`${
              highContrastMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-gradient-to-br from-blue-800/50 to-indigo-900/50 border-blue-500/20'
            }`}>
              <CardHeader>
                <CardTitle className="text-white text-xl">Configuration</CardTitle>
                <CardDescription className="text-gray-300">
                  Paramétrez votre défi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="language" className="text-white mb-2 block">Langage</Label>
                  <Select 
                    value={selectedLanguage} 
                    onValueChange={(val) => setSelectedLanguage(val as 'python' | 'sql')}
                    disabled={isLoading}
                  >
                    <SelectTrigger 
                      id="language"
                      className={highContrastMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-900/70 border-blue-500/30'}
                    >
                      <SelectValue placeholder="Choisir le langage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="sql">SQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="difficulty" className="text-white mb-2 block">Difficulté</Label>
                  <Select 
                    value={selectedDifficulty} 
                    onValueChange={(val) => setSelectedDifficulty(val as 'débutant' | 'intermédiaire' | 'avancé')}
                    disabled={isLoading}
                  >
                    <SelectTrigger 
                      id="difficulty"
                      className={highContrastMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-900/70 border-blue-500/30'}
                    >
                      <SelectValue placeholder="Choisir la difficulté" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="débutant">Débutant</SelectItem>
                      <SelectItem value="intermédiaire">Intermédiaire</SelectItem>
                      <SelectItem value="avancé">Avancé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="mode" className="text-white mb-2 block">Mode de jeu</Label>
                  <Select 
                    value={selectedMode} 
                    onValueChange={(val) => setSelectedMode(val as 'normal' | 'analyse' | 'défense' | 'vitesse')}
                    disabled={isLoading}
                  >
                    <SelectTrigger 
                      id="mode"
                      className={highContrastMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-900/70 border-blue-500/30'}
                    >
                      <SelectValue placeholder="Choisir le mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal - "Lis et devine"</SelectItem>
                      <SelectItem value="analyse">Analyse - "Explique ce que tu lis"</SelectItem>
                      <SelectItem value="défense">Défense - "Revue de code"</SelectItem>
                      <SelectItem value="vitesse">Vitesse - "Contre la montre"</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={fetchNewChallenge}
                  disabled={isLoading}
                  className={`w-full ${
                    highContrastMode 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                  } text-white`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Nouveau challenge
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Guide du jeu */}
            <Card className={`${
              highContrastMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-gradient-to-br from-blue-800/30 to-indigo-900/30 border-blue-500/20'
            }`}>
              <CardHeader>
                <CardTitle className="text-white text-xl">Comment jouer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center">
                    <Book className="mr-2 h-5 w-5 text-blue-400" />
                    Modes de jeu
                  </h3>
                  <ul className="space-y-2 text-gray-300 text-xs">
                    <li className="flex items-start">
                      <span className="font-semibold text-cyan-400 mr-2">Normal:</span> 
                      <span>Lisez le code et choisissez l'interprétation correcte.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold text-purple-400 mr-2">Analyse:</span> 
                      <span>Expliquez en détail ce que fait le code.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold text-pink-400 mr-2">Défense:</span> 
                      <span>Identifiez les erreurs et améliorations.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold text-orange-400 mr-2">Vitesse:</span> 
                      <span>Répondez en moins de 30 secondes.</span>
                    </li>

                  </ul>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
                    Conseils
                  </h3>
                  <ul className="space-y-2 text-gray-300 text-xs">
                    <li>• Lisez attentivement code et commentaires</li>
                    <li>• Identifiez d'abord la structure générale</li>
                    <li>• Pour SQL: analysez jointures et filtres</li>
                    <li>• Pour Python: suivez le flux d'exécution</li>
                    <li>• Après 2 erreurs consécutives, le jeu s'arrête</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Colonne de droite - Challenge actuel */}
          <div className="lg:w-3/4">
            {currentChallenge ? (
              <Card className={`${
                highContrastMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-gradient-to-br from-blue-800/70 to-indigo-900/70 border-blue-500/20'
              }`}>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle className="text-white flex items-center">
                      <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
                      Défi {selectedDifficulty} {selectedLanguage === 'python' ? 'Python' : 'SQL'} 
                    </CardTitle>
                    
                    {selectedMode === 'vitesse' && timeLeft !== null && (
                      <div className="flex items-center">
                        <Clock3 className={`mr-2 h-5 w-5 ${
                          timeLeft > 10 ? 'text-green-400' : 'text-red-400'
                        }`} />
                        <span className={`font-mono text-lg ${
                          timeLeft > 10 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {String(timeLeft).padStart(2, '0')}s
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <CardDescription className="text-gray-300">
                    Mode : {selectedMode === 'normal' ? '"Lis et devine"' : 
                           selectedMode === 'analyse' ? '"Explique ce que tu lis"' :
                           selectedMode === 'défense' ? '"Revue de code"' : 
                           '"Contre la montre"'}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Affichage du code */}
                    <CodeDisplay code={currentChallenge.code} language={currentChallenge.language} />
                    
                    {/* Question */}
                    <div className="bg-blue-900/40 p-4 rounded-md border border-blue-700/40">
                      <h3 className="text-white text-lg font-semibold mb-2 flex items-center">
                        <Brain className="mr-2 h-5 w-5 text-purple-400" />
                        Question:
                      </h3>
                      <p className="text-gray-200">{currentChallenge.question}</p>
                    </div>
                    
                    {/* Réponses possibles */}
                    <div className="mt-4">
                      <h3 className="text-white font-semibold mb-3">Sélectionnez votre réponse:</h3>
                      <RadioGroup 
                        value={selectedAnswer || ""} 
                        onValueChange={setSelectedAnswer}
                        className="space-y-2"
                        disabled={showResult}
                      >
                        {currentChallenge.responses.map((response) => (
                          <div 
                            key={response.id} 
                            className={`flex items-start p-3 rounded-md ${
                              showResult && response.isCorrect 
                                ? 'bg-green-900/30 border border-green-500/50' 
                                : showResult && selectedAnswer === response.id && !response.isCorrect
                                  ? 'bg-red-900/30 border border-red-500/50'
                                  : highContrastMode
                                    ? 'bg-gray-700 border border-gray-600 hover:bg-gray-600'
                                    : 'bg-blue-900/40 border border-blue-700/30 hover:bg-blue-800/50'
                            } transition-colors`}
                          >
                            <div className="flex items-start gap-3 w-full">
                              <RadioGroupItem 
                                value={response.id} 
                                id={`answer-${response.id}`}
                                disabled={showResult}
                              />
                              <Label 
                                htmlFor={`answer-${response.id}`} 
                                className={`text-sm flex-grow ${
                                  showResult && response.isCorrect
                                    ? 'text-green-300'
                                    : showResult && selectedAnswer === response.id && !response.isCorrect
                                      ? 'text-red-300'
                                      : 'text-gray-200'
                                }`}
                              >
                                <div className="flex flex-wrap items-center">
                                  <span className="font-semibold mr-1">{response.id.toUpperCase()}:</span> 
                                  <span>{response.text}</span>
                                  
                                  {showResult && response.isCorrect && (
                                    <span className="ml-2 text-green-400 text-xs font-semibold">
                                      ✓ CORRECT
                                    </span>
                                  )}
                                  
                                  {showResult && selectedAnswer === response.id && !response.isCorrect && (
                                    <span className="ml-2 text-red-400 text-xs font-semibold">
                                      ✗ INCORRECT
                                    </span>
                                  )}
                                </div>
                              </Label>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    
                    {/* Justification (sauf pour les débutants et mode vitesse) */}
                    {selectedDifficulty !== 'débutant' && selectedMode !== 'vitesse' && (
                      <div className="mt-4">
                        <Label htmlFor="justification" className="text-white font-semibold mb-2 block">
                          Justifiez votre réponse:
                        </Label>
                        <Textarea 
                          id="justification" 
                          placeholder="Expliquez votre raisonnement..."
                          value={userJustification}
                          onChange={(e) => setUserJustification(e.target.value)}
                          disabled={showResult}
                          className={`h-24 ${
                            highContrastMode 
                              ? 'bg-gray-700 border-gray-600' 
                              : 'bg-blue-900/50 border-blue-700/30'
                          }`}
                        />
                      </div>
                    )}
                    
                    {/* Explication (visible après soumission) */}
                    {showResult && (
                      <div className="mt-6 bg-blue-900/40 p-4 rounded-md border border-blue-500/40">
                        <h3 className="text-white text-lg font-semibold mb-2 flex items-center">
                          <Sparkles className="mr-2 h-5 w-5 text-yellow-400" />
                          Explication:
                        </h3>
                        <p className="text-gray-200">{currentChallenge.explanation}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={getHint}
                    disabled={isLoading || hintRequested || showResult}
                    className={`${
                      highContrastMode
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                        : 'bg-blue-900/20 border-blue-600/20 hover:bg-blue-800/40'
                    } text-blue-300 hover:text-blue-200`}
                  >
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Indice
                  </Button>
                  
                  <div className="space-x-3">
                    {showResult ? (
                      <Button
                        onClick={fetchNewChallenge}
                        disabled={isLoading}
                        className={`${
                          highContrastMode 
                            ? 'bg-indigo-600 hover:bg-indigo-700' 
                            : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
                        } text-white`}
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Question suivante
                      </Button>
                    ) : (
                      <Button
                        onClick={submitAnswer}
                        disabled={isLoading || !selectedAnswer}
                        className={`${
                          highContrastMode 
                            ? 'bg-cyan-600 hover:bg-cyan-700' 
                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700'
                        } text-white`}
                      >
                        Valider ma réponse
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-center">
                  <div className="mb-4 inline-flex p-6 rounded-full bg-blue-900/20">
                    <Code className="h-12 w-12 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Prêt à tester vos compétences ?</h3>
                  <p className="text-gray-300 max-w-md mb-6">
                    Choisissez un langage, une difficulté et un mode de jeu, puis cliquez sur "Nouveau challenge" pour commencer.
                  </p>
                  <Button
                    onClick={fetchNewChallenge}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                  >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Commencer à jouer
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReadMeIfYouCan;